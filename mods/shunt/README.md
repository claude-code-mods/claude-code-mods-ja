# shunt

**Claude Mod** です。[関数フック](https://github.com/anthropics/claude-code/issues/91870)モジュールとして動作する Claude Code プラグインで、プロンプト行上のバーに使用量を表示します。shunt ゲートウェイを使っている場合はその共有アカウントプールの使用量、それ以外ではセッション自身の Claude レート制限を表示し、`/shunt:usage` にはプールの詳細を回答します。

```
shunt · 5H 5% ↻1h 41m · WK 46% ↻1d 7h · Fable 31% ↻1d 7h ⚠ anthropic degraded
```

```
> /shunt:usage

shunt: pool — degraded   http://127.0.0.1:3001

  5h    ▓▓▓▓▓▓░░░░  62% left   resets 04:11
  7d    ▓▓▓▓▓▓▓▓░░  81% left   resets Sun 01:11
  fable ▓▓░░░░░░░░  19% left   resets Sun 01:11

  claude  ok         5h  71%  7d  84%  fable  19%
  codex   exhausted  5h   0%  7d  40%  fable    —

  headroom left, averaged over the pool's accounts; a shared figure, not a promise about your next request
```

この mod はゲートウェイの [`GET /usage`](https://shunt.sh/reference/endpoints/) エンドポイントを読み取って表示します。コマンドには mod 自身が回答します。フックは `next` を呼ばずに戻るため、モデルには何も送られず、回答はトークンを消費しません。

## 使用量バー

shunt ゲートウェイ上では、バーは `shunt ·` のタグを付けてプールを表示します。各数値はそのウィンドウのうち**使用済み**の割合です。つまり `1 - remaining` で、コマンドが余量として報告するのと同じプール全体の平均値です。その後に、そのウィンドウの最も早いリセットまでの時間が続きます。「残り」ではなく「使用済み」で表示するのは、Claude Code 自身の `/usage` や、shunt 以外でのバーの読み方と揃えるためです。数値は 70% から琥珀色、90% から赤に変わります。状態が `ok` ではないプール化プロバイダーはそれぞれ末尾に表示されます（`⚠ anthropic degraded`：`degraded` は琥珀色、`exhausted` または `capped` は赤）。プロバイダーが一覧にない場合はプール自体が表示されます。どのアカウントも報告しないウィンドウは省略されます。

shunt 上でない場合（ゲートウェイが未設定、ゲートウェイが `GET /usage` に 404 を返す、成功レスポンスがプールの報告ではない、またはプールにプロバイダーが含まれない場合）、バーはタグなしでセッション自身のレート制限を表示します。これは `$.session.usage()` と `session.measure` が報告する値です：

```
5H 5% ↻1h 41m · WK 46% ↻1d 7h
```

shunt 上では、セッション開始時、その後 1 分ごと、そして各ターンの終了後（プールがたった今消費された瞬間）に `GET /usage` を読み取ります。セッション自身の制限は無視します。それらは最後に応答したプールアカウントに由来するためです。拒否されたトークン（401 または 403）、到達できないゲートウェイ、その他のエラーステータス、または失敗した `shunt gateway token` ヘルパーは shunt 側の故障とみなし、置き換えずにタグを付けます：`shunt · ⚠ credential refused`、またはヘルパーの場合は `shunt · ⚠ gateway login unavailable`。ゲートウェイもレート制限もない場合（API キーを Anthropic に直接送る場合）、バーは何も描画しません。他のプラグインがバーに描画する内容は、その左側に残ります。

バーの `[-]`（ctrl+x ctrl+a）でセッション中だけ折りたたむか、下記の `usageBand` オプションで無効にできます。

## 数値の読み方

`remaining` は、プールの合計容量のうちまだ**使える**割合です。したがって `62%` は余量が 62% 残っていることを示し、62% 使ったことを示すではありません。これは、そのウィンドウを報告する無効化されていないアカウントに対する `mean(clamp(cap - utilization, 0, 1))` です。`cap` はそのウィンドウにおけるアカウントの `max_utilization` のハード上限で、未設定なら `100%` です。使い切った 9 アカウントと新品の上限なしアカウントが 1 つなら `10%` となり、`100%` にはなりません。50% の上限下で 44% 使っているアカウントは `6%` として数えられます。上限によってすでにそのウィンドウのリクエストから除外されているアカウントはゼロとして数えます。5h または 7d の上限は、Fable を含むすべてのリクエストからそのアカウントを除外します。

これは**プール全体の集計であり、予測ではありません**。ルーティングは可用性、モデル、セッションの親和性、優先度も考慮するため、健全な数値でも次のリクエストが受理されることを保証しません。ルーティングを考慮した最悪ケースには、代わりに `GET /api/oauth/usage` を使用してください。

| ウィンドウ | 対象 |
| --- | --- |
| `5h` | 変動する 5 時間のセッションウィンドウ |
| `7d` | 共有された週次ウィンドウ |
| `fable` | Fable スコープの週次ウィンドウ（`7d_oi`） |

無効化されていないアカウントが報告しないウィンドウは `—` と表示されます。ChatGPT/Codex アカウントは `x-codex-*` レスポンスヘッダーから `5h` と `7d` を埋め、独自の Fable スコープの信号は持っていません。

`pool` はすべてのプール化プロバイダーにわたる集計です。その下の行は各プール化プロバイダーについての同じ集計なので、あるプロバイダーにルーティングされたセッションは、混在した数値ではなくそのプロバイダーの余量を読めます。このエンドポイントにはアカウント名、アカウント数、優先度、アカウントごとの数値は一切含まれません。それらの詳細は管理者専用の `GET /admin/api/pool` の向こう側にあります。

## 前提条件

1. **Claude Code をゲートウェイに向けます**。経由してルーティングするためにすでに行っている設定です：

   ```bash
   export ANTHROPIC_BASE_URL=http://127.0.0.1:3001
   export ANTHROPIC_AUTH_TOKEN=<your client token>
   ```

2. **ゲートウェイでエンドポイントを有効にします**。`GET /usage` はオプトインで、`shunt.toml` の `[server.usage]` テーブルの隣に `[server.auth]`（クライアントトークン）または `[server.gateway]`（ゲートウェイログイン）が必要です：

   ```toml
   [server.auth]

   # Presence alone opts in; the table takes no keys.
   [server.usage]
   ```

   `[server.auth]` の代わりに `[server.gateway]` を使う場合は、下記の[`shunt gateway claude` セッション](#shunt-gateway-claude-セッション)を参照してください。`[server.auth]` のトークンは TOML ではなく環境から取ります。既定では `name:token` の組として `SHUNT_CLIENT_TOKENS` が使われ、未設定だとゲートウェイは起動に失敗します。ゲートウェイを実行している場所で、上記の `ANTHROPIC_AUTH_TOKEN` と同じトークンを export してください：

   ```bash
   export SHUNT_CLIENT_TOKENS="claude-code:<your client token>"
   ```

3. **関数フックを有効にして Claude Code を実行します**。この機能は early access です：

   ```bash
   CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1 claude
   ```

手順 3 がないとバーは表示されません。コマンドは残りますが `commands/usage.md` にフォールバックし、モデルがツール呼び出しでエンドポイントを読むよう求めます。

## インストール

```
/plugin marketplace add pleaseai/shunt
/plugin install shunt@shunt
```

## 設定

オプションは 1 つで、`/config` の 1 行です（settings.json の `pluginConfigs` に保存されます）：

| オプション | 既定値 | 目的 |
| --- | --- | --- |
| `usageBand` | `true` | プロンプト行の上にバーを表示します。オフにすると mod はバーを登録せず、何もポーリングしません。`/shunt:usage` は引き続き回答します |

この mod は 5 つの環境変数を読み取りますが、書き込みません。既定では、セッションがすべてのメッセージを送っている先のゲートウェイにセッション自身の資格情報を送るため、セッションがもともと使っていないホストに到達することはありません。`SHUNT_BASE_URL` は意図的な例外で、指定したゲートウェイに要求を向けます。base URL がまったく設定されていない場合は、資格情報を Anthropic の API に送ることもせず、何も尋ねません。

| 変数 | 目的 |
| --- | --- |
| `SHUNT_BASE_URL` | ゲートウェイの base URL。`ANTHROPIC_BASE_URL` を上書きします |
| `ANTHROPIC_BASE_URL` | このセッションがすでに経由しているゲートウェイ |
| `SHUNT_TOKEN` | クライアントトークン。下記の両方を上書きし、`Authorization: Bearer` として送られます |
| `ANTHROPIC_AUTH_TOKEN` | Claude Code が送るのと同じく `Authorization: Bearer` として送られます |
| `ANTHROPIC_API_KEY` | Claude Code が送るのと同じく `x-api-key` として送られます |

`SHUNT_BASE_URL` を使うと、トラフィックは別のゲートウェイ経由でルーティングしつつ、あるゲートウェイのプールを読めます。

### `shunt gateway claude` セッション

`shunt gateway claude` は Claude Code に渡す環境から `ANTHROPIC_AUTH_TOKEN` と `ANTHROPIC_API_KEY` を消し、代わりに `apiKeyHelper` を `shunt gateway token` に接続します。Claude Code はヘルパーの出力を自分で消費し、再 export することはありません。したがって、上記の変数に資格情報がない場合、この mod はマージ済みの設定（`--settings` を含む）を読み、`apiKeyHelper` が shunt 自身のものであれば（ランチャーが書く裸の名前でも、`shunt gateway token` というパスでも）シェルを使わずに直接実行し、出力されたゲートウェイログイントークンを `Authorization: Bearer` として送ります。シェルを使わないため、引用符で囲まれていないヘルパーパスの先頭の `~/` は mod 自身がホームディレクトリ（`HOME`、なければ `USERPROFILE`）に展開します。引用符付きの `'~/…'` はシェルと同じく文字列のままです。このログインはセッションが話しているゲートウェイ（`ANTHROPIC_BASE_URL`）に属するため、`SHUNT_BASE_URL` が未設定か同じ base URL を指している場合にだけ送られます（空白と末尾のスラッシュを除いた文字列で比較するため、`localhost` と `127.0.0.1` は別とみなされます）。それ以外の場合はヘルパーを実行すらしません。別のゲートウェイのプールを読むには、そのための `SHUNT_TOKEN` を export してください。ヘルパーが失敗した場合（非零終了、出力なし、起動不能）、バーに `shunt · ⚠ gateway login unavailable` を付け、`/shunt:usage` は `shunt gateway login` の実行を促します。セッション自身の制限を黙って表示することはありません。

トークンは 5 分間再利用されるため、1 分ごとのポーリングで毎分ヘルパーを実行することはありません。ゲートウェイに拒否された再利用トークンは破棄され、更新でローテーションされている可能性があるためヘルパーにもう一度尋ねます。それ以外の `apiKeyHelper`（パスワードマネージャーや確認を促すスクリプト）は決して実行しません。実行すれば、使用量の数値を得るために数分ごとに起動してしまうからです。そのようなセッションでは、代わりに `[server.auth]` のクライアントトークンで `SHUNT_TOKEN` を export してください。そうしないとバーはセッション自身のレート制限にフォールバックします。

ゲートウェイは `GET /usage` でゲートウェイログインを受け付ける必要があります。そのには、そこで `[server.gateway]` ログインを認証する shunt ビルドが必要です。`[server.gateway]` だけを設定した `[server.usage]` で十分です。

## `/usage` ではなく `/shunt:usage` である理由

`/usage` は Claude Code 自身の組み込みコマンドで、エンジンはプラグインに組み込み名の使用を許可しません：

```
$.command.register: "/usage" refused: it is the built-in /usage
```

`$.command.register` が受け付けるのは裸のグローバル名だけです。プラグインの **Markdown** コマンドはプラグインによって名前空間が分かれるため、`shunt` という名前のプラグインの `commands/usage.md` は `shunt:usage` として一覧に表示され、何とも衝突しません。フックモジュールはその名前の `command.run` を傍受して直接回答します。

## 構成

| パス | 内容 |
| --- | --- |
| `hooks/register.tsx` | フック：`shunt:usage` の `command.run`、および `AbovePrompt` のバーの `session.start`、`session.measure`、`turn.complete`、`ui.render` |
| `hooks/endpoint.ts` | ゲートウェイの URL と資格情報ヘッダーを解決します |
| `hooks/report.ts` | `GET /usage` のボディを防御的に読み取ります |
| `hooks/reading.ts` | 1 回の往復を完全版または簡略版の報告、あるいは問題に変換します |
| `hooks/views.ts` | コマンドのバー、パーセント、リセット時刻を描画します |
| `hooks/band.ts` | プールまたはセッション自身の制限から、バーのセル、警告、段階、カウントダウンを生成します |
| `hooks/names.ts` | コマンド名と固定テキスト |
| `types/index.d.ts` | `$.state` の契約：プールのスナップショット、セッションの制限、バーが参照する時計 |
| `commands/usage.md` | コマンド本体と、関数フックがない場合のフォールバック |
| `tests/*.spec.ts` | 純粋モジュールの Vitest スイート |
| `tests/mod/*.test.tsx` | `claude plugin test` が実行するフックのエンジンスイート |

## 開発

```bash
# 静的な副作用解析：どのイベントをフックし、どの $ を呼び、どの環境変数を使うか。
CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1 claude plugin validate plugins/shunt

# 純粋モジュールのスイートと型検査（いずれも CI のゲート）。
cd plugins/shunt && npm ci && npm run typecheck && npm test

# エンジン本身でフックをテスト：ゲートウェイ、時計、環境をモックしたバーとコマンド。
# Claude Code のバイナリが必要なため、CI では実行しません。
claude plugin test plugins/shunt

# ソースから実際のゲートウェイに対して実行。
CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1 claude --plugin-dir plugins/shunt
```

`hooks/register.tsx` は `claude-code` を import する唯一のフックファイルです。その型検査にはエンジン自身の `claude-code.d.ts` が必要で、Claude Code が `/plugin-types` を通じてプラグイン作者のプロジェクトに書き出します。他のモジュールはエンジンから何も import しないため、スイートはそれなしでカバーできます。同じ理由で `tsconfig.json` は `hooks/register.tsx` をエンジンスイートの `tests/mod` とともに `npm run typecheck` から除外しています。この除外は意図的なもので見落としではありません。あのファイルを型検査するには、まず `/plugin-types` を実行する必要があります。

> 関数フックは early access です。フックモジュールは有効な場所でだけ読み込まれ、この mod が対象とする API は Claude Code のバージョン間で予告なく変わる可能性があります。

## 出典とライセンス

- 原作者：[pleaseai](https://github.com/pleaseai/shunt)
- 原リポジトリ：https://github.com/pleaseai/shunt
- ライセンス：MIT または Apache-2.0（shunt プロジェクトに準拠）
- 日本語翻訳と UI ローカライズ：claude-code-mods-ja プロジェクト
