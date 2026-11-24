# Flightdeck

[![Release](https://img.shields.io/github/v/release/scasella/claude-flightdeck)](https://github.com/scasella/claude-flightdeck/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Claude Code 2.1.289+](https://img.shields.io/badge/Claude%20Code-2.1.289%2B%20mod-d97757.svg)](https://claude.com/blog/claude-code-mods)
[![Listed on statuslin.es](https://img.shields.io/badge/listed%20on-statuslin.es-c96442)](https://statuslin.es/mods/flightdeck)

> 日本語版は claude-code-mods-ja プロジェクトによる翻訳です。原作者とライセンスは文末に記載されています。原版の README は [README.en.md](README.en.md) をご覧ください。

**ターミナルにリアルタイムのエージェントダッシュボードを置く Claude Code mod です**：コンテキストとコスト、アドバイザーのタイムライン、すべての権限チェック、そしてカードや泳道で表示されるサブエージェント。すべての数値は実際のセッションイベントに由来し、何もあなたのマシンから外に出ません。

<p align="center">
  <img src="docs/media/demo.gif" alt="Flightdeck during a live session: five audit subagents fan out as cards, switch to swimlanes and finish, while the permission gate fills with checks" width="520">
</p>

<p align="center">
  <a href="#インストール">インストール</a> · <a href="#表示される内容">表示される内容</a> · <a href="#アクセスできる範囲">アクセスできる範囲</a> · <a href="#設定">設定</a> · <a href="#トラブルシューティング">トラブルシューティング</a> · <a href="CHANGELOG.md">更新履歴</a>
</p>

## インストール

Claude Code（2.1.289 以降）内で：

```
/plugin marketplace add scasella/claude-flightdeck
/plugin install flightdeck@claude-flightdeck
/reload-plugins
/flightdeck
```

<details>
<summary><strong>ターミナルから、またはクローンから</strong></summary>

```sh
claude plugin marketplace add scasella/claude-flightdeck
claude plugin install flightdeck@claude-flightdeck
```

または、1 セッションだけクローンから直接読み込みます：

```sh
git clone https://github.com/scasella/claude-flightdeck
claude --plugin-dir ./claude-flightdeck
```

</details>

インストーラーが設定項目を未設定と表示することがありますが、既定値で構いません。[`/config`](#設定)で変更できます。

mod は Claude Code の早期アクセス機能で、API はリリースごとに変わる可能性があります。不具合が出た場合は[トラブルシューティング](#トラブルシューティング)を参照してください。

## 表示される内容

https://github.com/user-attachments/assets/9ad0fcc3-c81c-427a-a743-f7b6c49f5885

<p align="center">
  <img src="docs/media/docked-session.png" alt="Claude Code in fullscreen with the Flightdeck pane docked beside the transcript" width="820">
</p>

| トランスクリプトの横にドック | プロンプト行の上にインライン |
| --- | --- |
| <img src="docs/media/docked-pane.png" alt="The docked pane: main model vitals, architect timeline, permission gate, five agents as swimlanes, last-turn receipt and session log" width="380"> | <img src="docs/media/inline-mini.png" alt="The inline mini layout: the model, context gauge, session cost and architect consults; the permission gate strip and totals; the last turn's duration, agents, edits, errors and cost" width="420"><br><br>メイン画面（全画面でない場合）では、ペインは最大 8 行の要約です。セッションにサブエージェントがいれば、最大 3 エージェントが加わります。 |

| パネル | 表示内容 | 出典 |
| --- | --- | --- |
| **main** | モデル、effort、権限モード、リクエスト数；圧縮マーク付きのコンテキストゲージ（⟲、または[推定](#推定値と実測値)では ⟲~）。セッションがモデルのウィンドウより小さいウィンドウで圧縮される場合はそのウィンドウを基準にします（`autoCompactWindow` または Claude Code 自身の値）；コストと、プランが報告する場合の最初の 2 つのレート制限ウィンドウ、各リセットまでの時間（↻、56 列以降）；直前のメインループリクエストの最初のトークンまでの時間 | `turn.step`、`session.measure`、`session.compact`、`$.session.usage()`（各メインループリクエスト時と、圧縮ウィンドウ用にモデルごと 1 回のローカル `summary` 内訳）；権限モードは `classic.UserPromptSubmit` と `agent.spawn` から |
| **architect** | タイムライン上の相談、実行中かどうか、前回の所要時間；オプションで各相談のタイミング；サブエージェントのアーキテクトの助言の 1 行目 | 一致する種類のエージェントの起動、またはアシスタントの行に含まれる一致するサーバーツール |
| **gate** | 権限チェックごとに 1 マス：緑は尋ねずに許可、青は自動モードの分類器またはあなたが判断して実行、琥珀色は保留、赤い ✗ は拒否、サブエージェント内で行われた場合は薄色。合計と、ツールファミリ別のドリルダウン（認証情報はマスク） | `tool.check`。前後の `tool.call` で確定 |
| **agents** | 収まる間は並んでカード：タスク、種類、リアルタイムのコンテキストと出力トークン数、ステップ数、動作時計、赤色の `max_tokens`。それを超えると同一の時間軸上の泳道 | `agent.spawn`、`turn.step`、`tool.call`、`turn.complete` |
| **loops** | どのカードにも一致しないモデルのループ：ワークフローエージェント、圧縮、メモリの fork | どのカードも要求しない `turn.step` の id |
| **receipt** | 進行中のターン、または直前のターン：所要時間、エージェント、編集、エラー、追加されたコスト | `turn.start`、`turn.complete` |
| **log** | プロンプト、起動、完了、相談、編集、エラー、拒否。エージェントのトランスクリプトを表示中はそのエージェントだけに絞り込み | 以上すべて |

接続線がアニメーションするのは、作業が流れているときだけです。ターンやエージェントが実行中、または相談が開いているときです。表示するものがないパネルは場所を取らないため、サブエージェントのいないセッションではメインのボックスとログだけが表示されます。

## 使い方

| コマンド | 動作 |
| --- | --- |
| `/flightdeck` | ペインを開く |
| `/flightdeck close` | 閉じる |
| `/flightdeck reset` | エージェント、チェック、相談、ログ、ターンをクリア（コスト、レート制限、圧縮は残ります） |
| `/flightdeck layout auto\|compact\|wide\|mini` | このセッションのレイアウトを上書き |

`ctrl+x tab` でペインにフォーカスを当ててから：

| キー | 動作 |
| --- | --- |
| `1`、`2`、… | エージェントのカードやレーンを展開：完全なタスク、直近 3 回のツール呼び出し、回答の冒頭 |
| `f` `s` `o` | ゲートのファイル / shell / その他ドリルダウンを開く：直近 5 回のチェックとその判定 |

`/clear` で会話と一緒にペインもリセットされます。

## 動作する場所

- **全画面ターミナル：** トランスクリプトの横にドック。110 列以上で 2 列表示になります。
- **メイン画面のターミナル：** プロンプト行の上に 8 行の要約としてインライン表示。
- **デスクトップアプリ、VS Code、モバイル：** 同じパネルに加え、エージェントが SVG の時間軸で描画されます。VS Code とモバイルではアニメーションできないため、接続線と時計は静止します。（VS Code 拡張ではペインがまったく表示されない場合があります：[トラブルシューティング](#トラブルシューティング)を参照）

`openOnStart` を設定すると、セッション開始時にペインが自動で開きます（ターミナル幅が 144 列以上の場合。それより狭い場合は `/flightdeck` で開きます）。色は Claude Code のテーマから取るため、ライト、ダーク、色覚対応テーマのいずれでも判読できます。

## アクセスできる範囲

Flightdeck は観察するだけです。すべてのフックがイベントをそのまま渡し、ツール呼び出し、プロンプト、サブエージェントを拒否・書き換え・遅延させることはありません。

| 見えるもの | 経由 |
| --- | --- |
| すべてのツール呼び出しの名前と入力、失敗したかどうか | `tool.call` |
| すべての権限判定 | `tool.check` |
| サブエージェントの起動、そのモデルリクエストとトークン使用量、最終回答 | `agent.spawn`、`turn.step`、`turn.complete` |
| ログ用に、プロンプトの最初の 70 文字 | `turn.start` |
| コンテキスト、コスト、レート制限の読み取り値 | `session.measure`、`$.session.usage()` |
| `/context` が表示する内訳（カテゴリ、メモリファイルのパス、MCP ツール、エージェント、スキル）。モデルごとに 1 回ローカルで推定し、そのうち圧縮ウィンドウだけを保持します | `$.session.usage({ breakdown: 'summary' })` |
| アシスタントの応答に含まれるアドバイザーツールの呼び出し（内容は暗号化されています） | `session.append` |

保持するもの：セッション状態に短い要約（ツール名とパスまたはコマンド、各プロンプトの冒頭、エージェントのタスクと回答、アーキテクトの助言。すべて認証情報をマスク）を保存し、セッションとともに終了します。ネットワークリクエストは**一切行わず**、プロセスの実行、ファイルの読み書き、セッションをまたぐ保存、モデルの呼び出しもありません。`claude plugin validate .` が、フックしているイベントと呼び出しを正確に表示します。

## 推定値と実測値

- **アーキテクトのタイミング。**「計画前」はこのターンでまだ編集がないこと、「エラーの繰り返し」はメインループのエラーが 2 回以上続くこと、「完了前」は編集が行われたことを意味します。これらは `(inferred)` と表示され、`moments: false` でオフにできます。
- **組み込みガード下の圧縮。** Claude Code のガードが Flightdeck に `session.compact` を渡さない場合（[トラブルシューティング](#トラブルシューティング)を参照）、回数は推定になります。Claude Code は新しいセッション、`/clear`、圧縮後の最初の応答までコンテキストの使用量を報告しません。そのため、応答が返った後に使用量が見つからないメインループリクエストは圧縮 1 回として数えます。メインボックスには `⟲~1` と表示され、余裕があれば `(estimated)` が付き、ログには `context compacted (estimated)` と出ます。最初のプロンプトへの巻き戻しも同じように解釈されるため、これもカウントされます。`session.compact` が動く場所では、そのカウントが推定値に代わります。
- **サーバー側の助言は暗号化されています。** Claude Code の `advisor` のようなサーバーツールでは、相談の回数と時間を計測できますが、内容は表示できません。
- **エージェントごとのコンテキストは最新リクエストの入力全体**です（キャッシュなし + キャッシュ読み取り + キャッシュ書き込み）。コストではなく `ctx` と表示されます。API にエージェント単位のコストはないためです。
- **他のループ**は、ワークフローエージェントと圧縮の fork を見分けられません。どちらもカードが要求しないモデルのループです。
- **バックグラウンドエージェントの最初のステップ**はカードが作られる前に届くことがあるため、使用量が 1 ステップ遅れて表示される場合があります。
- **圧縮ウィンドウに対するコンテキスト。** セッションがモデルのウィンドウより小さいウィンドウで圧縮される場合、ゲージ、`tokens/window`、ステータス行の `ctx N%` はそのウィンドウを基準に測られるため、モデルのウィンドウを基準にする Claude Code 自身のステータス行の割合（や claude-hud）より高く表示されます。自動圧縮は、そのウィンドウ内のしきい値で 100% の少し前に実行されます。
- **最初のトークンまでの時間。** `ttft` は Flightdeck 自身の `turn.step` フックで計測されるため、その下のすべて（他プラグインのフック、エンジン、ネットワーク、再試行）が含まれます。モデルの思考がストリーミングされない場合、最初の断片は思考の後に届くため、`ttft` には思考時間が含まれます。推定ではなく実測ですが、API 自身の数値ではありません。出力レートはありません。報告されるトークンには思考が含まれるため、見えるストリームから計算したレートは実際の速度ではありません。

## 設定

`/config`、またはユーザーの `settings.json` の `pluginConfigs[<id>].options` で設定します。`<id>` は Claude Code がプラグインを読み込んだ方法で、marketplace からインストールした場合は `flightdeck@claude-flightdeck`、`--plugin-dir` の場合は `flightdeck`（または `flightdeck@inline`）です。別のキーやプロジェクト設定（`.claude/settings.json`）の項目は、警告なく無視されます。ターミナルでは `claude plugin configure flightdeck@claude-flightdeck` がオプションと未設定のものを一覧表示し、`--values-stdin` で保存します。

| オプション | 既定値 | 意味 |
| --- | --- | --- |
| `architectPattern` | `advisor\|architect` | アーキテクトとみなすエージェント種類とサーバーツールの、大文字小文字を区別しない正規表現 |
| `matchDescriptions` | `false` | 種類名だけでなくエージェントの説明も照合する |
| `architectLabel` | `ARCHITECT` | ペイン内でのアーキテクトの名前 |
| `gateLabel` | `GATE` | 権限パネルの名前 |
| `panels` | `main,architect,gate,agents,loops,receipt,log` | 表示するパネルとその順序 |
| `layout` | `auto` | `mini`、`compact`、`wide`、`auto`（インラインは mini、110 列からドックは wide） |
| `maxCards` | `3` | 泳道に切り替えるまでに並べるカード数（1〜6）。ペインが狭ければ少なくなります |
| `paneColumns` | `66` | ドックされたペインが要求する列数。40 以上。Claude Code はドック幅をターミナルの 45% に制限し、このセッションまたは過去のセッションでドラッグして決めた幅が優先されます。wide レイアウトは 110 列から始まるため、約 245 列のターミナルか `layout: wide` が必要です |
| `motion` | `while-active` | `off` にすると接続線が静止します |
| `moments` | `true` | 推定した相談タイミングを表示します |
| `palette` | `theme` | `pastel` はダークターミナル向けに調整した固定色を使います |
| `openOnStart` | `true` | セッション開始時にペインを開くか尋ねます |
| `statusLine` | `true` | ステータス行にコンテキスト、実行中のエージェント、相談、拒否を表示します |

## トラブルシューティング

**ペインが表示されない。**
- `claude --version` が 2.1.289 以降か確認し、`/reload-plugins` と `/flightdeck` を実行してください。古いバージョンではトランスクリプトに `flightdeck: hooks module did not load: …` と表示されます。
- 144 列未満では、Claude Code は要求されていないペインのための場所を作りません。どの幅でも `/flightdeck` で開けます。
- トランスクリプトの中で `flightdeck:` で始まる薄色の行を探してください。失敗したフックやペインが拒否された理由が書かれています。その行を添えて[issue を開いてください](https://github.com/scasella/claude-flightdeck/issues)。
- ペインに `draw failed (…)` だけが表示される場合は、描画フックが例外を投げています。その行も issue に含めてください。

**VS Code 拡張に何も表示されない。** ある報告では、2.1.296 ビルドが Flightdeck のフックを実行したもののペインを表示せず、別の mod も表示されませんでした（[#5](https://github.com/scasella/claude-flightdeck/issues/5)）。代わりに VS Code の統合ターミナルで `claude` を実行し、`/flightdeck` を試してください。統合ターミナルは、ペインが自動で開くために必要な 144 列より狭いことがよくあります。

**Team または Enterprise ログインでは、権限モードが欠落または古く、圧縮が推定になります。** 管理対象設定のマシンや、Team/Enterprise の `/login` セッションでは、Claude Code が組み込みガード `cc-plugin-sec-default` を読み込みます。これは `classic.*` イベントや `session.compact` でユーザーがインストールしたプラグインのフックを一切実行しません（「Know which hooks of a user's mod don't run」を参照：[<organization> 向け mod の管理](https://code.claude.com/docs/en/plugins/mods/admin)）。サブエージェントの開始以外に、ユーザーのプラグインがフックできて権限モードを含むイベントはありません。そのためメインボックスには、サブエージェントが始まるまでモードが表示されず、その後も起動時点のモードのままです。それまでは自動モードで、ゲートは分類器が通した呼び出しを `you` に割り当てます。圧縮は、各リクエストで Claude Code が報告するコンテキストから数えるため、メインボックスには `⟲~`、ログには `context compacted (estimated)` と表示されます（[推定値と実測値](#推定値と実測値)を参照）。2.1.299 以降では、`/plugin` にこれら 2 つのフックを示す注意書きが表示されます。ペインの他の部分は正常に動作します。管理者が Flightdeck を組織独自の mod としてインストールすれば、フックを実行できます（[#23](https://github.com/scasella/claude-flightdeck/issues/23)）。

**オプションが無視されるようだ。** ユーザー `settings.json` のキーを確認してください：インストール時は `pluginConfigs["flightdeck@claude-flightdeck"]`、`--plugin-dir` 時は `pluginConfigs["flightdeck"]`。[設定](#設定)を参照。

**色がおかしい。** `/config` で `palette` を `pastel` に設定してください。

**動きが多すぎる。** `motion` を `off` に設定してください。

**更新後もカウンターが古い。** `/flightdeck reset` を実行してください。

## 仕組み

| ファイル | 内容 |
| --- | --- |
| [`hooks/register.tsx`](hooks/register.tsx) | イベントフック、状態アクセス、およびパネルごとの 1 つの関数 |
| [`hooks/core.ts`](hooks/core.ts) | すべての reducer、フォーマッター、レイアウト規則を純粋関数にしているため、動作を直接テストできます |
| [`hooks/rail.tsx`](hooks/rail.tsx)、[`hooks/elapsed.tsx`](hooks/elapsed.tsx) | 表面モジュール：アニメーションする接続線とリアルタイムの時計。表面独自のフレームクロックで、自分自身だけを再描画します |
| [`types/index.d.ts`](types/index.d.ts) | 状態の契約 |
| [`tests/`](tests) | 65 個のテスト：純粋な動作に加え、24〜120 列ですべての表面にマウントした描画。24〜40 列のすべての幅について、ボックスからはみ出すものがないか確認しています |

状態は `$.state` のアトムにあります。読み取るたびに既定値とマージされるため、欠落した古いフィールドがあってもペインは壊れません。状態の形を変える更新は、カウンターを 1 回リセットすることがあります。mod が初めてなら、[Claude Code mods](https://claude.com/blog/claude-code-mods) と [Getting started with Claude Code mods](https://claude.dev/blog/getting-started-with-claude-code-mods/) から始めてください。

## 関連プロジェクト

Flightdeck はこれらと併用でき、アイデアも借りています：

- [claude-hud](https://github.com/jarrodwatts/claude-hud)：ステータス行のコンテキスト、上限、ツール、エージェント。両方使えます。こちらはステータス行、Flightdeck はペインです。
- [zoetrope](https://github.com/furkankly/zoetrope)：Claude Code や Codex のセッションをリアルタイムのフローグラフとして表示します。
- [ccusage](https://github.com/ccusage/ccusage)：セッションログからコストをレポートします。
- [awesome-claude-code-mods](https://github.com/karanb192/awesome-claude-code-mods)：Claude Code mod の索引です。

## 開発

```sh
claude --plugin-dir .            # 読み込み。編集はホットリロード
claude plugin validate .
claude plugin test .
npx -p typescript tsc -p .       # 初回読み込み後に実行。.claude-plugin/types/ が作られます
```

[CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。変更は [CHANGELOG.md](CHANGELOG.md) に記載されています。

## ライセンス

[MIT](LICENSE)

## 出典とライセンス

- 原作者：[scasella](https://github.com/scasella/claude-flightdeck)
- 原リポジトリ：https://github.com/scasella/claude-flightdeck
- ライセンス：MIT
- 日本語翻訳と UI ローカライズ：claude-code-mods-ja プロジェクト
