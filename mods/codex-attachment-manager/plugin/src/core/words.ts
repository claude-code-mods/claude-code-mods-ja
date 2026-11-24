// Purpose: the text for the model (v0.11: moved here from rewrite.ts unchanged, docs/v0.11/plan.md): placeholders,
// notes, labels, lists, and the words of the fetch tool, in Chinese and English. Every platform and request format
// uses the same words; where a platform needs its own (Claude's notes after a message, Codex's compaction note), the
// function says so. The history of each wording is in the comments next to it.
// v0.1 — placeholders say the image was seen when it appeared and is left out now by the user's choice, so the model
// keeps trusting what it said about it (user report 2026-09-25).
// v0.1-14 — in the user's language (Codex's interface language, language.ts): the Chinese wording is the one tested on
// 2026-09-25; the English one says the same and is checked by the same self-test (v01-placeholder-selftest.ts --lang en).
// v0.1-24 — how to ask for an image back is spelled out, for every GPT-6 model (self-tests with CAM_TEST_MODEL).
// v0.1-25 — once anything is left out, each image still sent carries its id, and the note says a checked image is back
// in its old place: GPT-6 Luna looked for it in the newest message and said it could not see it (user 2026-09-28).
// v0.3 — automatic selection (user 2026-10-06): images from earlier turns that are not pinned are left out, in their own
// wording, and the model fetches what it needs with cam_view_image (whose words are here too, as text for the model).
// A copy it fetched is sent in that turn only. Drafts of this wording were tried on the three GPT-6 models in Chinese
// and English before it was built (spike/src/auto-fetch-selftest.ts).
// v0.8 (docs/v0.8/plan.md) — the model writes a feature line for each new image and notes the user's ratings, as record
// lines in its replies (notes.ts); a placeholder carries them, so the model still tells the images apart after a
// compaction. For that a feature line note goes before the turn of the first image, and every image sent says its id,
// also the ones new in this turn. The second line of a placeholder is shorter, offsetting the added text.
// Input: what is known of an image (Described), the language. Output: strings.

import { FETCHED_STATE, type ImageKind } from "./images.ts";
import type { Lang } from "./lang.ts";
import type { Notes, Rating } from "./notes.ts";

// notes (v0.8): what the model noted about the image, shown in its placeholder. awaiting (v0.10): an image of an
// interrupted turn sent once more for its feature line (thread-index.ts, awaitingLine); its label says so.
export type Described = { id: string; name: string | null; label: string | null; kind: ImageKind; turn: number | null; width: number | null; height: number | null; notes?: Notes; awaiting?: boolean };

type FetchWords = { title: string; description: string; ids: string; missing: (id: string) => string; unavailable: (id: string) => string; off: string };
type Words = {
  kind: Record<ImageKind, string>; unnamed: string; turn: (n: number) => string; thisTurn: string; newImage: string;
  // v0.10: the source in a compact line (compactLine), shorter.
  kindShort: Record<ImageKind, string>; sameShort: (id: string) => string;
  omitted: string; notRepeated: string; included: string; separator: string;
  // v0.10: the label of an image sent once more for its feature line (Described.awaiting).
  includedAwaiting: string;
  heading: (id: string, label: string | null, state: string, fields: string[]) => string;
  plain: (id: string) => string; duplicate: (id: string, where: string) => string; note: string;
  autoPlain: (id: string) => string; autoNote: string; copy: (id: string) => string; fetch: FetchWords;
  // v0.4, Claude Code only (anthropic-messages/rewrite.ts): what the note adds about tool results, and the short note that follows
  // each message holding omitted images, naming them.
  toolNote: string; here: (list: string) => string; hereAuto: (list: string) => string; listItem: (id: string, name: string | null, kind: string) => string;
  // v0.5, Claude Code only: after a compaction summary, the images from before it, which of them are not sent this
  // time, and how to get one back. v0.10: how many and their ids, no longer listed; those not sent are one line each
  // in a list after the summary (compactHeader, compactLine).
  compacted: (count: number, range: string, missing: number, auto: boolean) => string;
  compactHeader: (count: number) => string;
  // v0.10, Codex: the images its compaction did not keep, put back after it: how many, how many sent as originals.
  codexCompacted: (count: number, resent: number, auto: boolean) => string;
  // v0.8: how to write feature lines and note ratings; the placeholder's line with them; how long each may be shown.
  featureNote: string; notes: (line: string | null, ratings: Rating[]) => string;
};

// The image sits in the history, so the model concludes it never saw it and takes back what it said about it (user
// report 2026-09-25). Saying otherwise inside the placeholder did not help: it is user content, which the model does
// not take as proof. So the explanation goes once into a developer message, before the turn where the first omitted
// image appeared, and each placeholder only points to it.
const WORDS: Record<Lang, Words> = {
  zh: {
    kind: { upload: "ユーザーがアップロード", view: "ツールで表示した画像", generated: "生成された画像", tool: "ツール結果の画像" },
    kindShort: { upload: "アップロード", view: "表示", generated: "生成", tool: "ツール" },
    sameShort: (id) => `${id} と同じ`,
    unnamed: "名称未設定",
    turn: (n) => `第 ${n} ターン`,
    thisTurn: "今回のターン",
    newImage: "（新しい画像）",
    omitted: "省略済み",
    notRepeated: "再提供なし",
    included: "提供済み",
    includedAwaiting: "提供済み、特徴行はまだなし",
    separator: "、",
    heading: (id, label, state, fields) => `[画像 ${id}${label ? `（${label}）` : ""} ${state}｜${fields.join("｜")}]`,
    // v0.8: shorter; the context management note says why the image is left out (it was "原图被用户省略以节省上下文，情况
    // 见前面的“上下文管理说明”；需要重新看这张图时，在回复里写出“需要 IMG-xxx”。").
    plain: (id) => `もう一度見る必要があるときは、返信に「${id} が必要」と書いてください。`,
    duplicate: (id, where) => `この画像は ${id}（${where}）と内容がまったく同じです。そちらは今回のリクエストに通常どおり含まれているので、そちらを参照してください。`,
    note: [
      "コンテキスト管理の説明（ユーザーがインストールしたコンテキスト素材管理ツールより）：コンテキストを節約するため、ユーザーがこのタスクの一部の画像のチェックを外しました。以降の会話では、それらの画像があった場所に「[画像 IMG-xxx 省略済み…]」のようなプレースホルダー文字列が置かれます。提供が続けられている画像には「[画像 IMG-xxx 提供済み…]」という印が付き、直後に元画像があります。",
      "これらの画像は表示されたターンに実際に存在し、あなたはそのとき受け取って見ていました。以前の説明も、それに基づく判断も、元画像を見て行ったもので、今も有効です。今は見えないからといって以前の回答を推測や誤りだと思わないでください。取り消したり謝罪したりしないでください。",
      "省略された画像を今見られるか尋ねられたら、今は見えない（ユーザーが省略した）と正直に伝え、以前の説明が今も有効であることを述べてください。今は画像が見えないので、以前述べていない詳細を付け加えないでください。画像をもう一度見る必要があるときは、返信に正確に「IMG-xxx が必要」と書いてください（複数なら「IMG-002、IMG-003 が必要」）。ツールはこの文字列であなたが必要とする画像を特定します。ユーザーが再度チェックすると、元画像は会話内の元の位置に戻ります。その場所のプレースホルダーは「[画像 IMG-xxx 提供済み…]」と元画像に置き換わります。ユーザーの新しいメッセージには現れないので、再アップロードや再添付を依頼しないでください。これらの画像を自分でツールを使って読み取らないでください。",
      "「[画像 IMG-xxx 提供済み…]」と表示された画像は、以前省略されていたり、あなたが要求した画像であっても、今あなたの目の前にあります。尋ねられたら、その画像を見て直接回答し、見えないと言わないでください。",
    ].join("\n"),
    autoPlain: (id) => `元画像が必要なときは、cam_view_image を呼び出して「${id}」を渡してください。`,
    // 2026-11-01, long-task eval (Haiku 5.5, effort low): after a compaction the model stopped reading the files the
    // user named, five turns running ("没有收到图片内容，只有文字说明"): "do not read image files with other tools" was
    // taken for every image. It now says the omitted ones, and that new images are looked at as usual.
    autoNote: [
      "コンテキスト管理の説明（ユーザーがインストールしたコンテキスト素材管理ツールより）：このタスクでは「自動画像選択」が有効です。コンテキストを節約するため、以前のターンの画像は既定ではリクエストに含まれません。以降の会話では、それらの画像があった場所に「[画像 IMG-xxx 省略済み…]」のようなプレースホルダー文字列が置かれます。今回のターンで新しく登場した画像と、ユーザーが毎ターン送信に設定した画像は通常どおり提供され、「[画像 IMG-xxx 提供済み…]」という印の直後に元画像があります。",
      "これらの画像は表示されたターンに実際に存在し、あなたはそのとき受け取って見ていました。以前の説明も、それに基づく判断も、元画像を見て行ったもので、今も有効です。今は見えないからといって以前の回答を推測や誤りだと思わないでください。取り消したり謝罪したりしないでください。",
      "回答に省略された画像を見る必要があり、以前の説明では足りない場合は、cam_view_image ツールを呼び出してその ID を渡してください（複数なら一度にすべて渡します）。元画像は今回のツール結果に現れ、「[画像 IMG-xxx 取得した元画像…]」という印が付きます。それを見て回答してください。以前の説明で足りる場合は呼び出さないでください。今見えない画像の詳細を推測したり付け加えたりしないでください。ユーザーに画像の再アップロードを依頼したり、他のツールで省略された画像のファイルを読み取ったりしないでください。ユーザーが新しく見るよう依頼した画像は影響を受けず、通常どおり見てください。",
      "cam_view_image で取得した画像はこのターンのみ提供され、次のターンからは再びプレースホルダー文字列に戻ります。後で必要になったら、もう一度呼び出してください。「提供済み」または「取得した元画像」と表示された画像は今あなたの目の前にあります。尋ねられたら、その画像を見て直接回答し、見えないと言わないでください。",
    ].join("\n"),
    copy: (id) => `[${id} の元画像：モデルが cam_view_image で取得し、そのターンのみ提供され、現在は省略]`,
    // v0.4: in Claude Code desktop tests (Haiku 5.5, 2026-10-09) the model read a placeholder inside a Read result as
    // what the tool had returned, said it had never seen the image and took back its correct description; the same
    // words inside the tool result were not believed ("I should not follow the placeholder"). With the note right after
    // the message holding the image, it answered as intended. So each such message is followed by a short note.
    // 2026-10-10, Haiku 5.5, tool images, 3 runs per language: it kept its answers and guessed nothing, but asked for
    // the image by number in 2 of 3 Chinese runs (as an option) and in no English run; a question about a detail it
    // never described got "I can't answer that". The note now says when to write "需要 IMG-xxx", and why.
    toolNote: "ツール結果内の画像も同じです。そのツール呼び出しの時点では元画像が返され、あなたはそれを見ました。ツール結果内のプレースホルダー文字列はその後で置き換えられたもので、ツールが返した内容ではありません。",
    here: (list) => `コンテキスト管理の説明：上のメッセージに含まれていた ${list} は、当時は元画像であり、あなたはそれらを見ていました。以前の説明も、それに基づく判断も今も有効です。取り消したり、推測や捏造だと言ったりしないでください。そこのプレースホルダー文字列は今回のリクエストで置き換えられたもので、当時の内容ではありません。今はそれらが見えません。尋ねられたら、今は見えない（ユーザーが省略した）と正直に伝え、以前述べていない詳細を付け加えないでください。質問に答えるためにいずれかの画像を見る必要がある場合は、答えられないとだけ言わず、返信に「IMG-xxx が必要」という行を単独で書いてください（ID を明記し、必要な画像をすべて並べます）。ユーザーはその行を見てどの画像を再チェックすればよいか分かり、再チェックすると元画像が元の場所に戻り、あなたはそれを見て回答できます。`,
    hereAuto: (list) => `コンテキスト管理の説明：上のメッセージに含まれていた ${list} は、当時は元画像であり、あなたはそれらを見ていました。以前の説明も、それに基づく判断も今も有効です。取り消したり、推測や捏造だと言ったりしないでください。そこのプレースホルダー文字列は今回のリクエストで置き換えられたもの（自動画像選択）で、当時の内容ではありません。以前の説明では足りない場合は、cam_view_image を呼び出して元画像を取得してください。以前述べていない詳細を付け加えないでください。`,
    listItem: (id, name, kind) => `${id}（${[name, kind].filter(Boolean).join("、")}）`,
    // 2026-10-12, Haiku 5.5: while this note sat inside the user message holding the summary, unchecking an image that
    // had been sent again made the model take back what it had said looking at it ("没有依据的数字，应当撤回") and ask
    // for it to be provided again, also once the note named it and said not to. Like v0.4's notes, it now follows that
    // message as a system message, after the full note when something is left out (compactedNote). Same test, with all
    // checked again: the model looked for the image it had asked for in the user's new message ("这次消息里没有附上"),
    // as GPT-6 Luna did in v0.1-25; with nothing left out the full note is not there to say where it comes back. Once it
    // answered from it, it called its earlier "需要 IMG-001" a mistake ("一直在我的上下文里"), in both languages.
    compacted: (count, range, missing, auto) => [
      `${missing === 0 ? "コンテキスト管理の説明（ユーザーがインストールしたコンテキスト素材管理ツールより）：" : "コンテキスト管理の説明："}上のメッセージでは、要約前の会話に ${count} 枚の画像（${range}）がありました。会話の圧縮によりそれらはコンテキストから外されましたが、このツールが要約の直後に戻しました。ユーザーが${auto ? "毎ターン送信に設定した" : "送信するようチェックした"}画像には「[画像 IMG-xxx 提供済み…]」という印が付き、直後に元画像があります。これらは今あなたの目の前にあり、尋ねられたら画像を見て直接回答し、見えないと言わないでください。${missing === 0 ? `以前省略されていた画像${auto ? "" : "や、あなたが要求した画像"}でも同じです。ユーザーが${auto ? "毎ターン送信に設定した" : "再チェックした"}画像はここに戻り、ユーザーの新しいメッセージには現れないので、再添付を依頼しないでください。` : ""}この部分はこのツールがリクエストごとに再配置するものです。画像が省略されていたリクエストではここには何もなく、今回戻されたためだけに、あなたの以前の返信の前に表示されています。したがって、以前ある画像が見えないと述べたなら、それは当時の実情であり誤りではないので、訂正する必要はありません。`,
      ...(missing === 0 ? [] : [
        `${missing < count ? "残りの" : "この"} ${missing} 枚は今回元画像が添付されていません（${auto ? "自動画像選択が有効で、以前のターンの画像は既定では送信されない" : "ユーザーがチェックを外した"}ため、コンテキストを節約するためです）。要約の後の一覧に 1 枚ずつ記載され、ID、名前、そしてそのとき記録した特徴と評価が書かれています。この一覧は今回のリクエストで追加されたものです。あなたは以前それらの元画像を見ています。圧縮前の会話で見たものもあれば、圧縮後にも提供されたものもあります。要約内であれ後の返信内であれ、それらに対する説明と判断は元画像を見て行ったもので、今も有効です。取り消したり、推測や捏造だと言ったりしないでください。${auto ? "今はそれらが見えないので、以前述べていない詳細を付け加えないでください。" : "今はそれらが見えません。尋ねられたら、今は見えない（ユーザーが省略した）と正直に伝え、以前述べていない詳細を付け加えないでください。"}`,
        auto
          ? "以前の説明では足りない場合は、cam_view_image ツールを ID を渡して呼び出し、元画像を取得してください。ユーザーに再アップロードを依頼しないでください。"
          : "質問に答えるためにいずれかの画像を見る必要がある場合は、答えられないとだけ言わず、返信に「IMG-xxx が必要」という行を単独で書いてください（ID を明記し、必要な画像をすべて並べます）。ユーザーはその行を見てどの画像を再チェックすればよいか分かり、再チェックすると元画像が元の位置に戻り、あなたはそれを見て回答できます。再アップロードや再提供を依頼しないでください。",
      ]),
    ].join("\n"),
    compactHeader: (count) => `[圧縮前の画像のうち、今回元画像が添付されていない ${count} 枚：ID｜名前｜出所｜ターン｜特徴と評価]`,
    codexCompacted: (count, resent, auto) => [
      `コンテキスト管理の説明（ユーザーがインストールしたコンテキスト素材管理ツールより）：このタスクでは会話が圧縮されました。圧縮時に、以前のターンでツールが表示・生成・返信した ${count} 枚の画像が保持されませんでしたが、このツールがここに戻しました。`,
      resent ? `そのうちユーザーが${auto ? "毎ターン送信に設定した" : "送信するようチェックした"} ${resent} 枚は、元画像が直後にあり、「[画像 IMG-xxx 提供済み…]」という印が付いています。これらは今あなたの目の前にあり、尋ねられたら画像を見て直接回答し、見えないと言わないでください。` : null,
      count > resent ? `${resent ? "残りの" : "この"} ${count - resent} 枚は今回元画像が添付されていません（${auto ? "自動画像選択が有効で、以前のターンの画像は既定では送信されない" : "ユーザーがチェックを外した"}ため、コンテキストを節約するためです）。下の一覧に 1 枚ずつ記載され、ID、名前、そしてそのとき記録した特徴と評価が書かれています。` : null,
      "これらの画像は表示されたターンに実際に存在し、あなたはそのとき見ていました。以前の説明も、それに基づく判断も、元画像を見て行ったもので、今も有効です。取り消したり、推測や捏造だと言ったりしないでください。元画像が見えないものについては、以前述べていない詳細を付け加えないでください。",
      count > resent
        ? auto
          ? "回答に一覧の画像を見る必要があり、以前の説明では足りない場合は、cam_view_image ツールを呼び出してその ID を渡してください（複数なら一度にすべて渡します）。元画像は今回のツール結果に現れます。ユーザーに再アップロードを依頼したり、他のツールで一覧の画像のファイルを読み取ったりしないでください。ユーザーが新しく見るよう依頼した画像は影響を受けず、通常どおり見てください。"
          : "質問に答えるために一覧の画像を見る必要がある場合は、返信に「IMG-xxx が必要」という行を単独で書いてください（ID を明記し、必要な画像をすべて並べます）。ユーザーが再チェックすると元画像がここに戻ります。再アップロードを依頼しないでください。"
        : null,
    ].filter((line) => line !== null).join("\n"),
    fetch: {
      title: "省略された画像を表示",
      description: "このタスクで省略された画像の元画像を 1 枚または複数表示します。省略された画像は会話内で「[画像 IMG-xxx 省略済み…]」と表示されます。回答に画像が必要で、以前の説明では足りない場合にのみ呼び出してください。取得した元画像はこのターンでのみ提供されます。",
      ids: "表示する画像の ID（例：[\"IMG-004\"]）。複数ある場合は一度に全部渡してください。",
      missing: (id) => `このタスクに ${id} はありません。`,
      unavailable: (id) => `${id} の元画像を読み取れませんでした。`,
      off: "このタスクでは自動画像選択がオフです：省略された画像はユーザーがチェックして戻します。必要なときは返信に「IMG-xxx が必要」と書いてください。",
    },
    // v0.8, the wording the user approved on 2026-10-19 (docs/v0.8/plan.md). Revised the same day: it says why the user
    // installed the tool and no longer that the user "does not know" (Haiku 5.5 read that as an injection), and that a
    // rating needs no "记下了" (sol said so). Then the lines open the reply: Claude Desktop shows a link definition that
    // ends the latest reply; and a rating is noted even when the model disagrees (Haiku asked first, "确认后我再记下").
    // Then a bare rating gets a short reply about itself (Haiku explained what it noted, luna said nothing), and a turn
    // with nothing to note gets no lines (Haiku wrote an empty one). 2026-10-21 (user): the first part is the place, not
    // the "scene": in a user's MV task GPT-6 read 场景 as a film scene and named it after the scene number and what the
    // image was for ("04场店外线稿", "04场店外局部核对"), 28 scenes for 52 images.
    featureNote: [
      "特徴行の説明（ユーザーがインストールしたコンテキスト素材管理ツールより）：このタスクのすべての画像には ID があり、画像の前の「[画像 IMG-xxx …]」という行に書かれています。ユーザーがこのツールを導入したのは、あなたが後で（会話が圧縮された後も）各画像を識別し、ユーザーの評価を覚えておくためです。したがって、各ターンの最後の返信の冒頭に（ツール呼び出しの途中で話す内容には書かないでください）、そのターンで新しく登場した画像ごとに 1 行の特徴を書き、空行を 1 つ置いてから本文を書いてください。形式は次のとおりです：",
      "[//]: # (cam IMG-015 場所｜見える特徴)",
      "- 最初に場所、次に見える特徴（ショットサイズ、被写体、角度、光、色、構図）を書き、全体で 30 文字以内にしてください。例：「[//]: # (cam IMG-015 街路｜接近、正面、雨の夜、ネオンの反射)」。",
      "- 場所には、その画像がどこを写しているかを、他の場所と区別できる程度に具体的に書きます。例：「書斎」「カフェの外」「地下鉄のホーム」。接写では分からない場合は、分かっている範囲で書いてください。シーン番号、バージョン、用途（先頭フレーム、線画、チェック用画像など）は場所に含めません。時間帯や天気は後の特徴に書きます。",
      "- 1 枚の画像に複数の場所が写っている場合（絵コンテ、フレームの寄せ集め）は「複数箇所」と書きます。特定の場所に存在しないものは、それが何かを書きます：キャラクター、物体、文書、ウェブページ。",
      "- 同じ場所には、以前使った呼び方をそのまま使ってください。",
      "- 見えるものだけを書き、「美しい」「誰に似ている」のような判断は書かないでください。画像ごとに 1 回だけ書き、後から変更しないでください。ユーザーがアップロードした画像、あなたが生成・表示した画像、ツールが返した画像はすべて対象です。cam_view_image で取得した画像と ID のない画像は対象外です。",
      "- 「[画像 IMG-xxx 提供済み、特徴行なし…]」と表示された画像は、以前のターンが中断されて特徴行を書けなかったもので、このターンでもう一度提供されています。この画像にも 1 行書いてください。",
      "- 書いた特徴行に誤りがある場合（たとえばユーザーが指摘した場合）、同じ形式で行全体を書き直し、先頭に「訂正：」を付けてください。例：「[//]: # (cam IMG-005 訂正：キャラクター｜正面の接近、左眉に傷)」。元の行はこれに置き換えられます。",
      "- ユーザーが画像を評価したとき（数ターン後に述べた場合も含む）、まずどの画像かを特定し、ユーザーの言葉どおりに 1 行記録します。15 文字以内で書いてください。例：「[//]: # (cam IMG-003 評価：暗すぎる)」。評価はユーザー自身の見方なので、あなたが賛成でなくてもそのまま記録してください。どの画像か分からない場合は記録せず、本文でユーザーにどの画像を指しているか尋ねても構いませんが、記録のことは触れないでください。ユーザーが評価だけ述べ、何も要求していない場合は、本文でその評価に短く返答すれば十分です。何を記録したか、どの画像に対応させたかを説明しないでください。",
      "- これらの行は本文の前に書き、本文との間に空行を 1 つ置きます。画像 1 枚につき 1 行です。括弧内に半角括弧を使わないでください。そのターンに新しい画像も評価もない場合は、これらの行を書かないでください。これらの行はこのツールだけが読み取り、ユーザーには画面上表示されません。本文は通常どおり回答し、これらの行に触れないでください。ユーザーが画像を評価したときも、記録したことを「覚えました」「今後は覚えておきます」「後で参考にします」のように認める必要はありません。",
      "- 後で省略された画像のプレースホルダーには、あなたが書いた特徴と記録した評価が含まれ、会話が圧縮された後も残ります。画像を選ぶときはまずこれらを確認してください。判断に迷う場合は、元画像を取り戻して見る（方法は「コンテキスト管理の説明」を参照）か、ユーザーにどの画像か尋ねてください。",
    ].join("\n"),
    notes: (line, ratings) => [
      line ? `特徴：${line}` : null,
      ratings.length ? `評価：${ratings.map((rating) => `${rating.turn !== null ? `第 ${rating.turn} ターン` : ""}「${rating.text}」`).join("、")}` : null,
    ].filter((part) => part !== null).join("；"),
  },
  en: {
    kind: { upload: "uploaded by the user", view: "viewed with a tool", generated: "generated image", tool: "image from a tool result" },
    kindShort: { upload: "upload", view: "viewed", generated: "generated", tool: "tool" },
    sameShort: (id) => `same as ${id}`,
    unnamed: "unnamed",
    turn: (n) => `turn ${n}`,
    thisTurn: "this turn",
    newImage: "(new image)",
    omitted: "omitted",
    notRepeated: "not repeated",
    included: "included",
    includedAwaiting: "included, no feature line yet",
    separator: ", ",
    heading: (id, label, state, fields) => `[Image ${id}${label ? ` (${label})` : ""} ${state} | ${fields.join(" | ")}]`,
    plain: (id) => `To see it again, write "need ${id}" in your reply.`,
    duplicate: (id, where) => `This image is identical to ${id} (${where}), which is included in this request as usual; refer to that one.`,
    note: [
      "Context management note (from the context asset manager the user installed): to save context, the user unchecked some images in this task. Further on in the conversation, where those images were, there is now placeholder text such as \"[Image IMG-xxx omitted…]\"; each image still included is marked \"[Image IMG-xxx included…]\", with the original image right after it.",
      "These images really existed in the turn where they appeared, and you received and looked at them then; what you said about them before, and the judgments you based on it, were made looking at the original images and remain valid. Do not treat your earlier answers as guesses or mistakes because you cannot see the images now, and do not take them back or apologize.",
      "If asked whether you can see an omitted image now, say truthfully that you cannot see it now (the user left it out), and that your earlier descriptions remain valid. Since you cannot see it now, do not add details you did not mention before. If you need to look at an image again, write exactly \"need IMG-xxx\" in your reply (for several: \"need IMG-002, IMG-003\"): the tool finds the images you want by these words. Once the user checks an image again, its original is back in its old place in the conversation: the placeholder there becomes \"[Image IMG-xxx included…]\" followed by the original image. It does not come in the user's new message, so do not ask the user to upload or attach it again. Do not read these images yourself with tools.",
      "An image marked \"[Image IMG-xxx included…]\" is in front of you now, even if it was omitted before or is one you asked for: when asked about it, look at it and answer from it, and do not say you cannot see it.",
    ].join("\n"),
    autoPlain: (id) => `For the original, call cam_view_image with "${id}".`,
    autoNote: [
      "Context management note (from the context asset manager the user installed): this task has automatic image selection on. To save context, images from earlier turns are no longer included in requests by default: further on in the conversation, where those images were, there is now placeholder text such as \"[Image IMG-xxx omitted…]\". Images new in this turn are included as usual, and so are the images the user pinned, marked \"[Image IMG-xxx included…]\" with the original image right after it.",
      "These images really existed in the turn where they appeared, and you received and looked at them then; what you said about them before, and the judgments you based on it, were made looking at the original images and remain valid. Do not treat your earlier answers as guesses or mistakes because you cannot see the images now, and do not take them back or apologize.",
      "When an answer needs an omitted image and what you said about it before is not enough, call the cam_view_image tool with its id (several ids at once if you need several); the original comes back in that tool result, marked \"[Image IMG-xxx fetched original…]\", and you answer from it. When what you said before is enough, do not call it. Do not guess or add visual details you cannot see now; do not ask the user to upload images again, and do not read the files of omitted images with other tools. Images the user newly asks you to look at are not affected: look at them as usual.",
      "An image you get with cam_view_image is included only in this turn; from the next turn on it is a placeholder again. Call the tool again if you need it later. An image marked \"included\" or \"fetched original\" is in front of you now: when asked about it, look at it and answer from it, and do not say you cannot see it.",
    ].join("\n"),
    copy: (id) => `[Original of ${id}: fetched by the model with cam_view_image, included only in that turn, now omitted]`,
    toolNote: "The same holds for images in tool results: the tool call returned the original image at the time and you saw it; a placeholder inside a tool result was put there later, it is not what the tool returned.",
    here: (list) => `Context management note: in the message above, ${list} were original images at the time, and you looked at them then; what you said about them and the judgments you based on it remain valid, so do not take them back or call them guesses or made up. The placeholder text there was put in only for this request; it is not what was there at the time. You cannot see them now: if asked, say so truthfully (the user left them out), and do not add details you did not mention before. When a question can only be answered by looking at one of them, do not just say you cannot answer; write a line "need IMG-xxx" in your reply (with its number; list each one needed): that line is how the user learns which image to check again, and once they do, the original comes back in its place and you can answer from it.`,
    hereAuto: (list) => `Context management note: in the message above, ${list} were original images at the time, and you looked at them then; what you said about them and the judgments you based on it remain valid, so do not take them back or call them guesses or made up. The placeholder text there was put in only for this request (automatic image selection); it is not what was there at the time. When what you said before is not enough, fetch the original with cam_view_image; do not add details you did not mention before.`,
    listItem: (id, name, kind) => `${id} (${[name, kind].filter(Boolean).join(", ")})`,
    compacted: (count, range, missing, auto) => [
      `${missing === 0 ? "Context management note (from the context asset manager the user installed): " : "Context management note: "}in the message above, the conversation before the summary had ${count} images (${range}). Compacting the conversation took them out of context; this tool put them back right after the summary: the ones the user ${auto ? "pinned" : "checked to send"} are marked "[Image IMG-xxx included…]" with the original image right after it. They are in front of you now: when asked about one, look at it and answer from it, and do not say you cannot see it.${missing === 0 ? ` This holds even for an image omitted before${auto ? "" : " or one you asked for"}: an image the user ${auto ? "pins" : "checks again"} comes back there, not in the user's new message, so do not ask for it to be attached again.` : ""} This tool rebuilds this part for every request: in the requests where an image was left out, it was not here; it shows up before your earlier replies now only because it was put back for this request. So if you said before that you could not see an image, that was true then, not a mistake; do not correct it.`,
      ...(missing === 0 ? [] : [
        `${missing < count ? "The other" : "These"} ${missing} are not included as originals this time (${auto ? "automatic image selection is on, so images from earlier turns are left out by default" : "the user unchecked them"}, to save context): they are in the list after the summary, one line each, with the id, name, and the features and ratings you noted; the list was put there only for this request. You saw their originals: in the conversation before the compaction, and some also after it. What you said about them and the judgments you based on it, in the summary or in your later replies, were made looking at the original images and remain valid; do not take them back or call them guesses or made up. ${auto ? "You cannot see them now, so do not add details you did not mention before." : "You cannot see them now: if asked, say so truthfully (the user left them out), and do not add details you did not mention before."}`,
        auto
          ? "When what you said before is not enough, call the cam_view_image tool with the id to fetch the original; do not ask the user to upload it again."
          : "When a question can only be answered by looking at one of them, do not just say you cannot answer; write a line \"need IMG-xxx\" in your reply (with its number; list each one needed): that line is how the user learns which image to check again, and once they do, the original comes back in its place and you can answer from it. Do not ask the user to upload or provide it again.",
      ]),
    ].join("\n"),
    compactHeader: (count) => `[Images from before the compaction, the ${count} not included as originals this time: id | name | source | turn | features and ratings]`,
    codexCompacted: (count, resent, auto) => [
      `Context management note (from the context asset manager the user installed): this task's conversation was compacted. The compaction did not keep ${count} images that tools viewed, generated or returned in earlier turns; this tool put them back here.`,
      resent ? `Of them, the ${resent} the user ${auto ? "pinned" : "checked to send"} follow with their originals, each marked "[Image IMG-xxx included…]": they are in front of you now; when asked about one, look at it and answer from it, and do not say you cannot see it.` : null,
      count > resent ? `${resent ? "The other" : "These"} ${count - resent} are not included as originals this time (${auto ? "automatic image selection is on, so images from earlier turns are left out by default" : "the user unchecked them"}, to save context): they are in the list below, one line each, with the id, name, and the features and ratings you noted.` : null,
      "These images really existed in the turn where they appeared, and you looked at them then; what you said about them, and the judgments you based on it, were made looking at the original images and remain valid; do not take them back or call them guesses or made up. Do not add details you did not mention before about images you cannot see now.",
      count > resent
        ? auto
          ? "When an answer needs an image from the list and what you said about it before is not enough, call the cam_view_image tool with its id (several ids at once if you need several); the original comes back in that tool result. Do not ask the user to upload images again, and do not read the files of the listed images with other tools. Images the user newly asks you to look at are not affected: look at them as usual."
          : "When a question can only be answered by looking at an image from the list, write a line \"need IMG-xxx\" in your reply (with its number; list each one needed): once the user checks it again, the original comes back here. Do not ask the user to upload it again."
        : null,
    ].filter((line) => line !== null).join("\n"),
    fetch: {
      title: "View omitted images",
      description: "View the originals of one or more omitted images in this task. Omitted images appear in the conversation as \"[Image IMG-xxx omitted…]\". Call it only when an answer needs to look at an image and what you said about it before is not enough; the originals are included only in this turn.",
      ids: "Ids of the images to view, e.g. [\"IMG-004\"]; pass several at once if you need several.",
      missing: (id) => `This task has no ${id}.`,
      unavailable: (id) => `The original of ${id} could not be read.`,
      off: "Automatic image selection is off in this task: omitted images come back only when the user checks them. If you need one, write \"need IMG-xxx\" in your reply.",
    },
    featureNote: [
      "Feature line note (from the context asset manager the user installed): every image in this task has an ID, written in the \"[Image IMG-xxx …]\" line before it. The user installed this tool so that you can still tell the images apart later, also after the conversation is compacted, and remember what the user said about each. So begin the last reply of every turn (not what you say between tool calls) with one feature line for each image that is new in this turn, then a blank line, then your reply, in this form:",
      "[//]: # (cam IMG-015 place | visible features)",
      "- First the place, then what can be seen (shot size, subject, angle, light, colors, composition), about 15 words at most, for example \"[//]: # (cam IMG-015 street | close-up, facing the camera, rainy night, neon reflections)\".",
      "- The place is where the picture is set, specific enough to tell it apart, such as \"study\", \"outside the café\" or \"subway platform\"; for a close-up that doesn't show it, write what you know. No scene numbers, versions or what the image is for (first frame, sketch, check); time of day and weather go in the features.",
      "- An image of several places (a storyboard, a contact sheet) gets \"several places\"; one set nowhere gets what it is: character, object, document, web page.",
      "- For a place you named before, reuse that name.",
      "- Only what can be seen; no judgments such as \"beautiful\" or \"looks like someone\". One line per image, written once and never changed. Write one for the images the user uploaded, the ones you generated or viewed, and those in tool results; not for images you fetched with cam_view_image or images without an ID.",
      "- An image marked \"[Image IMG-xxx included, no feature line yet…]\" is from an earlier turn that was interrupted before you wrote its line; it is included once more in this turn: write its line too.",
      "- If a feature line you wrote turns out wrong (for example, the user points it out), write the whole line again in the same form, starting with \"corrected:\", for example \"[//]: # (cam IMG-005 corrected: character | front close-up, scar on the left eyebrow)\"; it replaces the old one.",
      "- When the user rates an image, even turns later, first make sure which one it is, then note the user's own words in a line of about 8 words at most, for example \"[//]: # (cam IMG-003 rated: too dark)\". The rating is the user's own view: note it even if you see it differently. If you are not sure which image it is, do not note it; you may ask the user which one they mean, without mentioning the noting. When the user only rates images and asks for nothing, a short reply to what they said is enough; do not explain what you noted or which image you matched it to.",
      "- Put these lines before your reply with a blank line after them, one image per line, and no parentheses inside them. In a turn with no new image and no rating, write none of these lines. These lines are for this tool only; the user does not see them on screen. Answer as usual and do not mention these lines; when the user rates an image, do not acknowledge the noting either, such as \"noted\", \"I'll keep that in mind\" or \"I'll refer to this later\".",
      "- Images left out later carry your feature line and the ratings you noted in their placeholders, also after a compaction. Check them when you pick an image; when unsure, get the original back first (the \"Context management note\" says how) or ask the user which one.",
    ].join("\n"),
    notes: (line, ratings) => [
      line ? `Features: ${line}` : null,
      ratings.length ? `rated: ${ratings.map((rating) => `"${rating.text}"${rating.turn !== null ? ` (turn ${rating.turn})` : ""}`).join(", ")}` : null,
    ].filter((part) => part !== null).join("; "),
  },
};

// The Chinese note, tested on 2026-09-25; v0.1-24 (2026-09-28) spells out how to ask for an image back ("需要 IMG-xxx",
// several at once, no re-uploading), after GPT-6 Luna asked the user to "reattach" images instead; v0.1-25 says where a
// checked image comes back (its old place, marked "已提供"), after Luna looked for it in the newest message instead.
export const OMISSION_NOTE = WORDS.zh.note;
export const omissionNote = (lang: Lang) => WORDS[lang].note;

function heading(words: Words, image: Described, state: string): string {
  const fields = [image.name ?? words.unnamed, words.kind[image.kind]];
  if (image.turn !== null) fields.push(words.turn(image.turn));
  if (image.width && image.height) fields.push(`${image.width}×${image.height}`);
  return words.heading(image.id, image.label, state, fields);
}

// v0.8: a feature line or rating longer than the note allows is cut after the last punctuation mark (or space) that
// still fits, with "…"; the model is asked to keep them short, and the panel searches the full text. v0.10: the caps
// count width, whatever the language setting: a CJK character 10, any other 3, so a cap of 30 fits 30 Chinese
// characters or 100 Latin ones (an English feature line in a Chinese task was cut to its place before, and lines that
// differed only after it read the same).
const CLIP_AT = /[，。；、！？,.;!?｜|：:\s]/u;
const WIDE = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}　-〿＀-￯]/u;
// A rating keeps as much as a feature line: they are the user's own words, and only a few per session (a long replay
// lost half of one at 15, 2026-10-31).
const CAPS = { line: 30, rating: 30 };
export function clip(text: string, max: number): string {
  const chars = [...text.trim()];
  let width = 0;
  const end = chars.findIndex((char) => (width += WIDE.test(char) ? 10 : 3) > max * 10);
  if (end < 0) return chars.join("");
  let cut = end;
  for (let i = end - 1; i > 0; i--) if (CLIP_AT.test(chars[i])) { cut = i; break; }
  return `${chars.slice(0, cut).join("").trimEnd()}…`;
}

// v0.8: the line under a placeholder's heading: the model's feature line and the latest three ratings it noted, with
// their turns; null when it noted nothing (e.g. an image from before v0.8).
function notesLine(words: Words, image: Described): string | null {
  const { line = null, ratings = [] } = image.notes ?? {};
  if (!line && !ratings.length) return null;
  return words.notes(line ? clip(line, CAPS.line) : null, ratings.slice(-3).map((rating) => ({ ...rating, text: clip(rating.text, CAPS.rating) })));
}

export function plainPlaceholder(image: Described, lang: Lang = "zh"): string {
  const words = WORDS[lang];
  return [heading(words, image, words.omitted), notesLine(words, image), words.plain(image.id)].filter((line) => line !== null).join("\n");
}

export function duplicatePlaceholder(image: Described, same: Described, lang: Lang = "zh"): string {
  const words = WORDS[lang];
  const where = [same.name, same.turn !== null ? words.turn(same.turn) : words.thisTurn].filter(Boolean).join(words.separator);
  return `${heading(words, image, words.notRepeated)}\n${words.duplicate(same.id, where)}`;
}

// Put right before an image that is still sent, so the model can tell which id it is: Codex's own labels ("[Image #2]")
// start again in every message.
export function includedLabel(image: Described, lang: Lang = "zh"): string {
  return heading(WORDS[lang], image, image.awaiting ? WORDS[lang].includedAwaiting : WORDS[lang].included);
}

// v0.3: automatic selection.
export const autoNote = (lang: Lang) => WORDS[lang].autoNote;
export const fetchWords = (lang: Lang): FetchWords => WORDS[lang].fetch;
// v0.4: the same words for a Claude Code request (anthropic-messages/rewrite.ts).
export const copyNote = (id: string, lang: Lang) => WORDS[lang].copy(id);
export const newImageWord = (lang: Lang) => WORDS[lang].newImage;

// v0.4, Claude Code only: the note also speaks of tool results, and a short note follows each message holding omitted
// images, naming them. Codex's words stay as they are.
export const claudeNote = (lang: Lang, auto = false) => `${auto ? WORDS[lang].autoNote : WORDS[lang].note}\n${WORDS[lang].toolNote}`;
export function hereNote(images: Described[], lang: Lang = "zh", auto = false): string {
  const words = WORDS[lang];
  const list = images.map((image) => words.listItem(image.id, image.name, words.kind[image.kind])).join(words.separator);
  return auto ? words.hereAuto(list) : words.here(list);
}

// v0.5, Claude Code only: the note after the message holding a compaction summary, listing the images from before it
// and naming the ones not sent this time. Their placeholders are the first in the request, so the full note comes
// first, as it does after the first message holding placeholders (anthropic-messages/rewrite.ts).
// v0.10: the images are no longer listed in the note, only counted with their ids (the ones before the latest
// compaction are the first ids); those not sent are in the list after the summary (compactList).
export function compactedNote(images: Described[], sent: Set<string>, lang: Lang = "zh", auto = false): string {
  const words = WORDS[lang];
  const missing = images.filter((image) => !sent.has(image.id)).length;
  const range = images.length > 1 ? `${images[0].id}${lang === "zh" ? " 到 " : " to "}${images[images.length - 1].id}` : images[0]?.id ?? "";
  const own = words.compacted(images.length, range, missing, auto);
  return missing ? `${claudeNote(lang, auto)}\n${own}` : own;
}

// v0.10: an image put back after a compaction without its original, in one line: id, name, source, turn, and what
// the model noted (as in a placeholder). A placeholder apiece repeated the same words for every image; a session with
// 127 images before its compaction took about 1.7–2.0万 tokens per request that way, about 0.7–0.9万 as lines
// (docs/v0.10/plan.md). `same`: the id of an earlier line with the same picture (sent again), named instead of its
// features.
export function compactLine(image: Described, lang: Lang = "zh", same: string | null = null): string {
  const words = WORDS[lang];
  const fields = [image.id, image.name ?? "-", words.kindShort[image.kind], image.turn !== null ? words.turn(image.turn) : "-"];
  const { line = null, ratings = [] } = image.notes ?? {};
  if (same) fields.push(words.sameShort(same));
  else if (line) fields.push(clip(line, CAPS.line));
  if (ratings.length) fields.push(words.notes(null, ratings.slice(-3).map((rating) => ({ ...rating, text: clip(rating.text, CAPS.rating) }))));
  return fields.join(lang === "zh" ? "｜" : " | ");
}

// The images carry what the indexes know of their content (thread-index.ts, IndexedImage): the same digest or pixels
// is the same picture.
type Listed = Described & { contentId?: string; pixelSha256?: string | null };
export function compactList(images: Listed[], lang: Lang = "zh"): string {
  const sameAs = (image: Listed, at: number) => images.slice(0, at).find((other) => (image.contentId !== undefined && other.contentId === image.contentId) || (image.pixelSha256 && other.pixelSha256 === image.pixelSha256))?.id ?? null;
  return [WORDS[lang].compactHeader(images.length), ...images.map((image, at) => compactLine(image, lang, sameAs(image, at)))].join("\n");
}

// v0.10, Codex: the note before the images its compaction did not keep (addCodexCompacted).
export const codexCompactedNote = (count: number, resent: number, auto: boolean, lang: Lang) => WORDS[lang].codexCompacted(count, resent, auto);

export function autoPlaceholder(image: Described, lang: Lang = "zh"): string {
  const words = WORDS[lang];
  return [heading(words, image, words.omitted), notesLine(words, image), words.autoPlain(image.id)].filter((line) => line !== null).join("\n");
}

// v0.8: the feature line note, for a task's own requests (not a side chat's or a subagent's).
export const featureNote = (lang: Lang) => WORDS[lang].featureNote;

// The line cam_view_image puts before each image it returns. Without Codex's own label ("[Image #3]"), which numbers
// images within their message and means nothing here: GPT-6 Luna once read it as the digit asked about.
export function fetchedLabel(image: Described, lang: Lang = "zh"): string {
  return heading(WORDS[lang], { ...image, label: null }, FETCHED_STATE[lang]);
}
