# fast-jev-compaction

コンパクト処理の要約を Jev の判定に置き換える Claude Code プラグインです。すべてのツール呼び出しとその結果を 1 回の高速なリクエストで採点し、古くなったものを破棄または切り詰め、残した内容はすべて逐語的に保持します。npm ライブラリとしても使えます。

## 概要と動機

多くのコンテキスト圧縮は LLM に古いターンを要約させます。しかし要約は情報が失われます。後で重要になるファイルパス、正確なエラー、制約、コマンドが消えてしまうことがあります。このライブラリは何も書き換えません。Jev がもはや不要と判断したツール呼び出しとツール結果を削除するだけです。Jev には会話全体を見せたうえで尋ねます。ユーザーとアシスタントのテキストは順序も内容もそのまま残ります。

このリポジトリは npm パッケージ（`src/`）であると同時に、そのパッケージを使って Claude Code 組み込みのコンパクト要約を元のメッセージに置き換える Claude Code プラグイン（`hooks/`、`.claude-plugin/`）でもあります。

## 動作の仕組み

1. すべての `tool_use` を `tool_use_id` で対応する `tool_result` とペアにします。最初のメッセージと最新の `preserveRecentMessages` 件のメッセージにある呼び出しは固定され、決して変更されません。
2. Jev に送る**状態**は、古いものから順に並べたこれまでの会話全体です。各ツール結果は短い注記（`ok, 4213 chars (omitted)`）に置き換えます。ツールの入力もテキストも含め、要約はしません。
3. 状態を `maxStateTokens`（既定では 25k）に段階的に収めます。各段階は前の段階では足りなかった場合にのみ適用します。ツール入力を 1000 文字、次に 200 文字、次に 60 文字へ切り詰め、長いテキストは先頭と末尾だけに簡略化し（古い非固定メッセージから順に）、古い非固定メッセージは `[… N chars omitted …]` という注記にまとめ、古いツール呼び出しは 1 行に圧縮し（`t12 Read file_path=src/a.ts → ok 480ch`）、呼び出しのない古いメッセージは除外し、呼び出しだけの古いメッセージの連続を 1 件にまとめます。それでも収まらない場合はコンパクト処理が例外を投げます。トークン数はトークナイザーを使わずに推定します（6 文字ごとに 1 語、数字 1 つにつき半トークン、その他の記号はおおむね 1 トークン）し、Jev が報告する値より少し大きめになるよう調整しています。
4. 固定されていない呼び出しごとに、Jev へ 2 つの `noul` 質問を送ります。**呼び出し**を残すべきか（呼び出された事実と入力が今も重要か）、そして**結果**を逐語的に残すべきか（内容がまだ必要で、ツールを再実行しても同じにはならないか）です。
5. 状態と質問の合計が `maxRequestTokens`（既定では 30k、Jev の 1 リクエストあたり 32k の制限内）に収まるよう、質問を必要な数のリクエストに分割します。同じ完全な状態を毎回再送し、リクエストは並列に実行され、回答はマージされます。
6. 呼び出しごとの判定を `keepThreshold` と照合します：
   - `keepResult ≥ threshold` → 呼び出しと結果を残す；
   - そうでなく `keepCall ≥ threshold` → 呼び出しを残し、結果は先頭 `truncateHeadChars` 文字と 1 行の注記に切り詰める；
   - それ以外 → 呼び出しと結果をまとめて削除する。
7. メッセージ一覧を再構築します。内容がすべて失われたメッセージは削除され、変更のないメッセージは同じオブジェクトとして返され、結果だけが呼び出しなしで残ることは決してありません。

Jev の失敗、不正な回答、キーの未設定、収めることのできない履歴の場合は例外を投げます。何にフォールバックするかは呼び出し側（あるいは Claude Code のフック）が判断します。

## インストールと使い方

```sh
npm install fast-jev-compaction
export TYPESAFE_API_KEY=...
```

```ts
import { compactMessages, reductionRatio, type Message } from 'fast-jev-compaction';

const transcript: Message[] = [
  { role: 'user', text: 'Fix the failing test. Never edit src/generated.', toolUses: [] },
  {
    role: 'assistant',
    text: '',
    toolUses: [{ tool_use_id: 'toolu_1', tool: 'Read', input: { file_path: 'src/a.ts' } }],
  },
  { role: 'user', text: '', toolUses: [], toolResults: [{ tool_use_id: 'toolu_1', text: '…file…' }] },
  // …
];

const result = await compactMessages(transcript, { preserveRecentMessages: 4 });
console.log(result.messages, result.decisions, result.stats);
if (reductionRatio(result) < 0.25) {
  // not worth it: keep the original transcript, or summarize instead
}
```

`Message` は Claude Code の `SessionMessage` のサブセットなので、セッションのトランスクリプトをそのまま渡せます。

独自のトランスポートを使う場合は、`JevAsker`（`ask(state, questions)` という 1 メソッド）を実装して `compact(messages, asker, options)` を呼び出してください。`buildJevRequest` と `parseJevResponse` から HTTP リクエスト本文とレスポンスの検証が得られます。構成要素（`collectToolCalls`、`fitState`、`batchCalls`、`decideCall`、`applyDecisions`）もエクスポートされています。

`apiKey` の既定値は `process.env.TYPESAFE_API_KEY` です。キーをコミットしたりソースファイルに書いたりしないでください。

## オプション

| オプション | 既定値 | 説明 |
| --- | --- | --- |
| `apiKey` | `TYPESAFE_API_KEY` | TypeSafe API キー（`compactMessages`／`JevClient`） |
| `model` | `jev-latest` | Jev のモデル名 |
| `baseUrl` | `https://api.typesafe.ai/v1/systemone` | System One のエンドポイント |
| `fetch` | ネイティブの `fetch` | テスト用に差し替え可能な fetch 実装 |
| `goal` | 直近 3 件のユーザープロンプト | 状態に含める継続中のタスクの説明 |
| `keepThreshold` | `0.5` | 呼び出しや結果を残すための最小確率 |
| `preserveRecentMessages` | `6` | 決して変更しない最新のメッセージ数（最初のメッセージは常に保持） |
| `maxStateTokens` | `25000` | 状態の推定トークン上限 |
| `maxRequestTokens` | `30000` | 状態と 1 バッチの質問の推定上限 |
| `truncateHeadChars` | `300` | 破棄したツール結果の注記前に残す文字数 |

`result.stats` には、圧縮前後のメッセージ数と文字数、理由ごとの判定数、推定トークンでの状態サイズ、必要だった適合段階、リクエスト数が含まれます。

## 制限

- 候補となるのはツール呼び出しとその結果だけです。テキストメッセージは出力から削除も短縮もされません（Jev が見る状態では簡略化されます）。
- トークン数は文字数からの推定であり、トークナイザーによるものではありません。
- 調整はリクエスト単位です。確率が高いからといって、結果の削除が安全だという証明にはなりません。アシスタントはいつでもツールを再実行できます。
- 完全な状態をリクエストごとに繰り返すため、上限に近い履歴では、少数の質問ごとに 1 リクエストのコストがかかります。

## Claude Code プラグイン

リポジトリのルートは Claude Code の関数フックプラグインです。`hooks/fast-jev.ts` は薄いアダプターで、`session.compact` のトランスクリプトを `src/` に渡し、エラー時や十分な削減ができなかった場合は Claude Code 組み込みの要約にフォールバックします。設定と Claude Code 2.1.274 の型リファレンスは [`hooks/README.md`](hooks/README.md) を参照してください。

### Claude Code へのインストール

関数フックは Claude Code の早期アクセス機能（2.1.274 以降）なので、Claude Code を実行する環境でオプトインのフラグを設定する必要があります。例：`~/.claude/settings.json`：

```json
{ "env": { "CLAUDE_CODE_ENABLE_FUNCTION_HOOKS": "1", "TYPESAFE_API_KEY": "<your key>" } }
```

次に、このリポジトリをプラグインの marketplace として追加し、プラグインをインストールします。シェルからでも、セッション内のスラッシュコマンドでも実行できます：

```sh
claude plugin marketplace add tamaratran/fast-jev-compaction
claude plugin install fast-jev-compaction@fast-jev-compaction
```

インストール時にプラグインのオプション（API キー、しきい値、`truncateHeadChars` など）の入力を求められます。環境変数 `TYPESAFE_API_KEY` を使う場合は既定値のままにしてください。Claude Code を再起動するか `/reload-plugins` を実行します。以降、`/compact`（および自動コンパクト）は Jev を通るようになります。削減済みの履歴が組み込みの要約の代わりに使われた場合は
`fast-jev-compaction: kept N/M messages, no summary (…)` というトーストが表示され、Jev が十分に削除できなかった場合（短いセッションや失敗時）は `fallback to built-in summary (…)` と表示されます。

インストールせずにチェックアウトから実行するには、リポジトリのルートで `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1 claude --plugin-dir .` を実行します。公開手順は不要で、marketplace はリポジトリの `.claude-plugin/marketplace.json` にすぎません。

## 開発

```sh
npm install
npm run typecheck        # library + hook
npm test
npm run build
npm run validate:plugin  # claude plugin validate
TYPESAFE_API_KEY="$(cat ~/.typesafe_key)" npm run demo
```

単体テストは偽の Jev を使い、TypeSafe に接続することはありません。デモが実際のネットワーク確認です。

## アニメーションデモ（macOS）

`demo/JevDemo` は小さなネイティブの SwiftUI アプリで、Claude Code 風のターミナルの中でコンパクト処理の流れを台本付きでドラマチックに再生します。用意されたトランスクリプトのツール呼び出しが採点され、Jev が手放した結果と呼び出しが赤くなって消え、残った内容は逐語的に保たれます。API は一切呼びません。画面収録のために存在します。

```sh
demo/JevDemo/build.sh   # builds demo/JevDemo/build/JevDemo.app and launches it
```

アプリでスペースキーを押すと最初から再生します。

## 出典とライセンス

- 原作者：[tamaratran](https://github.com/tamaratran/fast-jev-compaction)
- 原リポジトリ：https://github.com/tamaratran/fast-jev-compaction
- ライセンス：MIT
- 日本語翻訳と UI ローカライズ：claude-code-mods-ja プロジェクト
