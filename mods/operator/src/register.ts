import type { ModApi, On } from "./types";

let preamble: Promise<string | null> | null = null;

async function loadPreamble($: ModApi): Promise<string | null> {
  try {
    const cwd = await $.session.cwd();
    const result = await $.process.run(["operator-helper", "preamble"], { cwd });
    if (result.exitCode === 0) return result.stdout;
  } catch {
    // A missing Helper and a failed subprocess share the same recovery path.
  }

  $.ui.log(
    "Operator Memory は operator-helper の序言を実行できませんでした。@aerovato/operator-helper をグローバルにインストールまたは修復し、Claude Code を再起動してください。",
  );
  return null;
}

function render($: ModApi): Promise<string | null> {
  preamble ??= loadPreamble($);
  return preamble;
}

export function register(on: On): void {
  on("session.start", async ($, event, next) => {
    void $.process.run(["operator-helper", "version"], undefined).catch(() => {});
    return next(event);
  });

  on("prompt.compose", async ($, event, next) => {
    const result = await next(event);
    const text = await render($);
    if (text === null) return result;
    return {
      ...result,
      sections: [...result.sections, { id: "operator:preamble", text, scope: "session" as const }],
    };
  });

  on("agent.spawn", async ($, event, next) => {
    const text = await render($);
    return next(text === null ? event : { ...event, prompt: text + event.prompt });
  });
}
