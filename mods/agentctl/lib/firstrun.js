// First run (tech spec § 3.7, 2026-10-07): parsing `/agentctl …`, the drafting request a goal
// prepares, and the copy a first-time user reads. Pure: no `$`, no I/O.
//
// Found by a user's first run of 0.2.2: every path assumed the vocabulary, so a sentence after
// `/agentctl` got the usage grammar. A goal now prepares a request for Claude in the person's own
// prompt box; nothing here sends or binds anything.

import { renderArgv } from './policy.js'

// Verbs and how many words may follow each. `task` and `events` check their own arguments.
export const VERBS = {
  status: { max: 1, args: ['--details'] },
  help: { max: 1, args: ['advanced'] },
  proposal: { max: 0 },
  accept: { max: 1 },
  discard: { max: 0 },
  task: { max: Infinity },
  policy: { max: 0 },
  events: { max: 1 },
  handoff: { max: 0 },
  last: { max: 0 },
  stop: { max: 0 },
}

function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
  }
  return d[a.length][b.length]
}

// What the line after `/agentctl` is: a verb (with its words), a near-miss of a verb, or a goal.
// Only a line that looks like command syntax — one ASCII word, optionally a digest or a number —
// can be a near-miss, so "test the login flow" stays a goal while "accepet ab12cd34" is corrected.
export function parseCommand(raw) {
  const text = String(raw ?? '').trim()
  if (!text) return { kind: 'status', words: [] }
  const words = text.split(/\s+/)
  const head = words[0].toLowerCase()
  if (Object.hasOwn(VERBS, head)) {
    const rest = words.slice(1)
    const v = VERBS[head]
    if (rest.length > v.max) return { kind: 'extra', verb: head, rest }
    if (v.args && rest.length && !v.args.includes(rest[0])) return { kind: 'extra', verb: head, rest }
    return { kind: 'verb', verb: head, rest }
  }
  if (/^[a-z]{3,}(\s+[0-9a-z]{1,24})?$/i.test(text)) {
    let best = null
    for (const v of Object.keys(VERBS)) {
      const d = distance(head, v)
      if (d <= 2 && (!best || d < best.d)) best = { v, d }
    }
    if (best) return { kind: 'typo', verb: best.v, words }
  }
  return { kind: 'goal', text }
}

// A limited English / Traditional Chinese copy heuristic over the goal text — not locale detection.
export function languageOf(goal) {
  return /\p{Script=Han}/u.test(String(goal ?? '')) ? 'zh' : 'en'
}

// A path for a POSIX shell, single-quoted: the only character needing care inside is `'` itself.
export function shellQuote(s) {
  return `'${String(s).replace(/'/g, `'\\''`)}'`
}

// The helper lives in the mod; `$.plugin.root` is the plugin's directory, but tolerate a root that
// points at `.claude-plugin` itself.
export function helperPath(root) {
  const r = String(root ?? '').replace(/\/+$/, '')
  return `${r.endsWith('/.claude-plugin') ? r.slice(0, -'/.claude-plugin'.length) : r}/bin/propose.mjs`
}

// The request the person sends to Claude. The goal is quoted verbatim and never truncated; the rest
// is fixed text kept short, since it becomes one ordinary model turn.
export function draftingRequest({ goal, worktree, base, root, lang }) {
  const helper = `node ${shellQuote(helperPath(root))} --worktree ${shellQuote(worktree)} --stdin`
  const baseText = base ? `"${base}"` : 'null'
  if (lang === 'zh') {
    return [
      `Draft an agentctl task scope for: "${goal}"`,
      `First run ${helper.replace(' --stdin', ' --help')} for the fields. Read the project and propose the narrowest scope (edit paths, check commands, acceptance). If something is unclear, ask me and wait for my answer — write no proposal before it, and never invent permissions.`,
      `Write it with ${helper} (base ${baseText}; a quoted heredoc delimiter that does not occur in the JSON). Write the proposal only, then wait for me to accept.`,
    ].join('\n')
  }
  return [
    `Draft an agentctl task scope for: "${goal}"`,
    `First run ${helper.replace(' --stdin', ' --help')} for the fields. Read the project and propose the narrowest scope (edit paths, check commands, acceptance). If something is unclear, ask me and wait for my answer — write no proposal before it, and never invent permissions.`,
    `Write it with ${helper} (base ${baseText}; a quoted heredoc delimiter that does not occur in the JSON). Write the proposal only, then wait for me to accept.`,
  ].join('\n')
}

const COPY = {
  en: {
    filled: (bound) => `A request for Claude to draft the scope is in your prompt box — press Enter to send it. ${bound ? 'The current task stays in force until you accept the new scope.' : 'Nothing is bound yet.'}`,
    mixed: (bound) => `The request was added after text you typed meanwhile; both are in your prompt box. Edit it before you press Enter. ${bound ? 'The current task stays in force until you accept the new scope.' : 'Nothing is bound yet.'}`,
    copy: (bound) => `Send this to Claude to have it draft the scope (${bound ? 'the current task stays in force until you accept the new one' : 'nothing is bound yet'}):`,
    typo: (v) => `Did you mean "/agentctl ${v}"? To start a task, describe it: /agentctl <what you are doing>`,
    extra: (v) => `"/agentctl ${v}" takes no such arguments. ${v === 'proposal' ? 'It shows a waiting draft; to make one, describe the work: /agentctl <what you are doing>' : 'See /agentctl help.'}`,
    acceptLine: (d) => `Accept this scope: /agentctl accept ${d} — it binds the scope only; it does not start any work.`,
    accepted: 'Scope bound. Next: ask Claude to start the work.',
    runChecks: (checks) => `To leave evidence, run each check as written: ${checks.join(' · ')} — a pipe, redirect or wrapper keeps a run from counting, and added arguments may check less than declared.`,
    wholeScope: '/agentctl policy shows the whole scope.',
    noTaskLast: 'No task is bound, so there is no hand-over yet. Start one: /agentctl <what you are doing>',
    noHandover: 'This task has no saved hand-over yet: /agentctl handoff saves one.',
    next: {
      none: 'Next: describe the work — /agentctl <what you are doing>. Built-in refusals (direct git push, production writes) apply even now.',
      proposal: (d) => `Next: review /agentctl proposal, then /agentctl accept ${d}`,
      task: 'Next: ask Claude to work; /agentctl handoff saves where things stand.',
      taskThenChecks: (checks) => `Next: ask Claude to work, then to run the checks exactly as written: ${checks.join(' · ')}. Once they are current: /agentctl handoff`,
      rerun: (checks) => `Next: not current on this tree — ask Claude to run exactly as written: ${checks.join(' · ')}. Then: /agentctl handoff`,
      checksCurrent: 'Next: every declared check is current on this tree — /agentctl handoff saves the hand-over.',
    },
  },
  zh: {
    filled: (bound) => ` Claude —— Enter 。${bound ? '，。' : '。'}`,
    mixed: (bound) => `，；。${bound ? '，。' : '。'}`,
    copy: (bound) => ` Claude （${bound ? '，' : ''}）：`,
    typo: (v) => `「/agentctl ${v}」？，：/agentctl <>`,
    extra: (v) => `「/agentctl ${v}」。${v === 'proposal' ? '；，：/agentctl <>' : ' /agentctl help。'}`,
    acceptLine: (d) => `：/agentctl accept ${d} ——，。`,
    accepted: '。： Claude 。',
    runChecks: (checks) => `，：${checks.join(' · ')} —— pipe、redirect ；。`,
    wholeScope: '：/agentctl policy',
    noTaskLast: '，。：/agentctl <>',
    noHandover: '：/agentctl handoff 。',
    next: {
      none: '：——/agentctl <>。（ git push、production ）。',
      proposal: (d) => `： /agentctl proposal， /agentctl accept ${d}`,
      task: '： Claude ；/agentctl handoff 。',
      taskThenChecks: (checks) => `： Claude ，：${checks.join(' · ')}。：/agentctl handoff`,
      rerun: (checks) => `：—— Claude ：${checks.join(' · ')}。：/agentctl handoff`,
      checksCurrent: '：——/agentctl handoff 。',
    },
  },
}

export function copy(lang) {
  return COPY[lang === 'zh' ? 'zh' : 'en']
}

// A check as a line Claude can run as written: quoted so it reads back as the declared argv, never
// shortened. An argv no quoting can carry is shown as its JSON array instead, which says to run it as
// those words.
export function checkLine(argv) {
  return renderArgv(argv) ?? `${JSON.stringify(argv)} (as these words)`
}

// The task's declared checks, as the command lines Claude must run as written.
export function checkArgv(task) {
  return (task?.executors ?? []).filter((e) => e.check).map((e) => checkLine(e.argv))
}

// The next step for a bound task, from where its declared checks stand (`checkProgress` in view.js).
// Found in an uncoached run: with the work done, "ask Claude to start" was still the next step.
export function nextForTask(t, progress) {
  if (!progress.declared) return t.next.task
  if (!progress.pending.length) return t.next.checksCurrent
  return progress.ran ? t.next.rerun(progress.pending) : t.next.taskThenChecks(progress.pending)
}

export function helpText(lang, advanced) {
  if (lang === 'zh') {
    return advanced ? [
      '：',
      '  /agentctl task show | set <json> | clear — ',
      '  /agentctl policy — ',
      '  /agentctl events [n] —  host ',
      '  /agentctl handoff · last —  · ',
      '  /agentctl stop — ',
      '  /agentctl status --details · discard —  · ',
    ].join('\n') : [
      'agentctl  Claude ，。',
      '  /agentctl <> — Claude （）',
      '  /agentctl accept <digest> — （）',
      '  /agentctl — ',
      '：/agentctl help advanced',
    ].join('\n')
  }
  return advanced ? [
    'Advanced:',
    '  /agentctl task show | set <json> | clear — view or set the task directly',
    '  /agentctl policy — the scope in force and its limits',
    '  /agentctl events [n] — recent refusals and calls left to the host',
    '  /agentctl handoff · last — save a hand-over · show the last one',
    '  /agentctl stop — cancel the turn and save a hand-over',
    '  /agentctl status --details · discard — full status · drop a draft',
  ].join('\n') : [
    'agentctl keeps Claude inside a scope you confirm and records check evidence.',
    '  /agentctl <what you are doing> — Claude drafts a scope (binds nothing)',
    '  /agentctl accept <digest> — you confirm it (starts no work)',
    '  /agentctl — where things stand and what to do next',
    'More: /agentctl help advanced',
  ].join('\n')
}

// What the box should suggest while a proposal waits (found live on 2.1.292: the host's own guess —
// "" — took the box, so Tab + Enter sent that word to Claude instead of accepting). Only the
// host's own guess is replaced, and only while a proposal is waiting; a plugin's suggestion, ours
// included, passes unchanged.
export function suggestionWhileWaiting(originKind, pendingDigest) {
  return originKind === 'suggestion' && pendingDigest ? `/agentctl accept ${String(pendingDigest).slice(0, 8)}` : null
}
