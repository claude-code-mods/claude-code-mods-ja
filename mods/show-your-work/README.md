<p align="center">
  <img src="docs/homepage.jpg" alt="Claude Code 内で Tern のホームページの録画が再生され、その隣に変更内容の一覧が表示されている" width="100%">
</p>

<h1 align="center">claude-show-your-work</h1>

<p align="center">端末を離れずに、agent の作業を確認・レビュー・反復できます。<br>Claude Code に画像、動画、視覚的 QA をもたらします。</p>

<p align="center">
  <a href="https://github.com/iamumeransari/claude-show-your-work/stargazers"><img src="https://img.shields.io/github/stars/iamumeransari/claude-show-your-work?style=flat&logo=github&label=Stars&color=E3B341" alt="GitHub stars"></a>
  <a href="#install"><img src="https://img.shields.io/badge/Claude_Code-plugin-D97757?logo=claude&logoColor=white" alt="Claude Code plugin"></a>
  <a href="#install"><img src="https://img.shields.io/badge/macOS_%7C_Linux-555555" alt="macOS and Linux"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/iamumeransari/claude-show-your-work?color=22C55E" alt="MIT license"></a>
</p>

## インストール

Claude Code で次の 2 つのコマンドを実行してください：

```
/plugin marketplace add https://github.com/iamumeransari/claude-show-your-work.git#releases
/plugin install show-your-work@iamumeransari
```

macOS と Linux の Ghostty および kitty をサポートし、Claude Code 2.1.286 以降が必要です。動画と音声には ffmpeg も必要です（macOS では `brew install ffmpeg` でインストールするか、Claude に依頼してください）。HTML ページには Chrome、Chromium、または Playwright のブラウザーが必要で、PDF には poppler（`brew install poppler`）が必要です。

インストールが完了すると、簡単な導入ガイドが表示されます。設定を変更するには、いつでも `/show-your-work` を実行してください。

## 使い方

Claude は、視覚的なものを作成または変更するときに、その作業をチャット内で表示します。次のように直接依頼することもできます：

- 「ホームページのヒーローに 4 つの方向性を出して、並べて見せて」
- 「登録フォームを作ってテストし、録画を見せて」
- 「課金のトグルを修正して、前後を比較させて」

### 前後の録画による視覚的 QA

<p align="center"><img src="docs/qa-product.jpg" alt="新規旅行フォームのテスト録画と、変更点およびチェック結果が並んで表示されている" width="100%"></p>

Claude が機能を構築したりバグを修正したりすると、Playwright で変更をテストし、実行を録画してチャット内で再生します。作業のレビューに必要なものがすべて 1 か所に揃っています：

- **前後比較：** 新機能からバグ修正まで、どんな変更でも Claude は古い版と新しい版で同じ手順を記録します。Compare が 2 つの録画を同期して並べて再生します。
- **変更マーカー：** Claude が行った変更はすべてタイムスタンプ付きで動画の横に一覧表示され、クリックするとその変更が現れる瞬間へジャンプします。
- **ライブチェック：** 動画が各テストに到達するたびに、チェックが緑または赤に変わります。修正が効いている箇所と、まだ失敗している箇所が正確にわかります。
- **レビューは 1 か所で：** 録画とその結果がチャット内にあるため、ブラウザーを開いたり、テストを再実行したり、ログを読んだりする必要はありません。

### 画像

<p align="center">
  <img src="docs/concepts.jpg" alt="Tern のランディングページの 4 つのコンセプトがチャットに表示されている" width="49%">
  <img src="docs/breakpoints.jpg" alt="Tern のホームページがデスクトップ、タブレット、スマートフォンのサイズでチャットに表示されている" width="49%">
</p>

Claude がデザインしたものは何でも、チャット内でそのまま確認できます：ランディングページ、アプリ画面、コンポーネント、デザインコンセプト、スライド、チャート、生成画像など。複数の方向性を頼めば並んで表示され、気に入ったものを選んで反復を続けられます。

- **方向性の比較：** 複数のコンセプトが同時に表示されるため、ファイルを 1 つずつ開かずに一目で選べます。
- **すべてのバージョンを保持：** 新しいバージョンは同じプレイヤーに追加され、History で以前の草案を順に遡れます。
- **前後比較：** 古いデザインと新しいデザインを切り替えたり、並べたりして、変更点を正確に確認できます。

### 動画

<p align="center">
  <img src="docs/persona.jpg" alt="チャット内の広告の人物設定" width="49%">
  <img src="docs/reel.jpg" alt="それから作られた広告がチャット内で再生されている" width="49%">
</p>

製品の QA だけでなく、Claude が取り組んでいるほぼあらゆるものの動画を見せてもらえます。ウェブサイトを作っていて、上から下へスクロールしたときの感触を知りたい場合は、頼むだけで録画がチャットで再生され、アニメーションもそのまま確認できます。

広告、アニメーション、ローンチ動画を作っている場合も、各カットが機能豊富な動画プレイヤーでチャット内に直接再生されます：

- **動画操作：** 再生、一時停止、タイムラインのスクラブ、任意の瞬間への前後移動ができます。音声付きの動画は音声と一緒に再生され、Mute でセッション中の音をオフにできます。
- **タイムスタンプ：** サイドバーが動画内の出来事を手順ごとに案内します。各手順にはタイムスタンプが付き、1 クリックで該当箇所へ移動できます。
- **バージョン比較：** Claude が動画の新しい版を作ると、同じプレイヤーで開きます。History で草案を切り替えたり、新旧を同期して並べて再生したりできます。
- **クイック機能：** QuickTime Player で開いて大きく見る、または 1 クリックで Downloads フォルダーに保存できます。

## 対応端末

show-your-work は macOS と Linux の Ghostty と kitty をサポートします。画像はこれらの端末でそのまま動作します。

- **Rex と Herdr アプリ：** 画像と動画は描画されますが、Claude Code が有効にするのは `CLAUDE_CODE_FORCE_TERMINAL_IMAGES=1` で起動したときだけです。通知の「画像をオンにする」ボタンを押すと、その端末だけで設定する行がシェルプロファイルに追加され、チャットを開き直すコマンドがコピーされます。
- **Warp、WezTerm、Konsole：** kitty のグラフィックプロトコルには対応していますが、Claude Code が画像の描画に使う Unicode プレースホルダーには対応していないため、現時点では画像を表示できません。
- **Ghostty または kitty ベースの他の端末：** Claude Code はこれらを認識せず、画像をオフのままにします。`CLAUDE_CODE_FORCE_TERMINAL_IMAGES=1` を付けて起動するか（画像をオンにするコマンドが通知でコピーされます）、`export CLAUDE_CODE_FORCE_TERMINAL_IMAGES=1` をシェルプロファイルに追加してください。
- **tmux：** Ghostty または kitty 内では動作します。Claude Code は `CLAUDE_CODE_FORCE_TERMINAL_IMAGES=1` で起動しない限り tmux 内で画像をオフにするため、初回はプラグインが新しい tmux ペインに対してこれを有効にし、通知からその設定でチャットを開き直すコマンドをコピーします。また、自分のペインに対して `allow-passthrough` を有効にして画像をThroughさせます。tmux の設定ファイルは変更されません。

バージョン 0.6.7〜0.6.9 では、Warp、WezTerm、Konsole に「画像をオンにする」ボタンがあり、シェルプロファイルに 1 行を追加していました。これにより画像が箱の格子として描画される問題が生じたため、現在はプラグインがその行を自動的に削除します。

## FAQ

<details>
<summary><b>Claude Code は端末で画像を表示できますか？</b></summary>

はい、show-your-work プラグインを使えば Claude Code は端末で画像を表示できます。インストールすると、スクリーンショット、デザイン、チャートなどの画像がチャット内に直接表示されます。Ghostty と kitty で動作します。

</details>

<details>
<summary><b>Claude Code は端末で動画を再生できますか？</b></summary>

はい、show-your-work プラグインを使えば Claude Code は端末で動画を再生できます。画面録画、アニメーション、広告、ローンチ動画が Claude Code のチャット内で再生されます。スクラブ、Skip 操作、クリック可能なタイムスタンプ、並べて比較できる機能を備えた動画プレイヤーが同梱されています。

</details>

<details>
<summary><b>ブラウザーを開かずに Claude Code が作ったものを見るには？</b></summary>

show-your-work プラグインをインストールすれば、Claude Code が作ったものを確認できます。Claude が視覚的なものを作成または変更するたびに、スクリーンショットや録画を撮って結果をチャットで見せます。ブラウザーに切り替えてページを探す必要はありません。

</details>

<details>
<summary><b>Claude Code にアプリをテストして録画を見せてもらえますか？</b></summary>

はい、show-your-work プラグインを使えば可能です。Claude は作った機能を Playwright でテストし、各実行を録画してチャットで再生します。手順はタイムスタンプ付きで動画の横に一覧表示されます。各チェックは動画が到達するたびに緑または赤に変わります。

</details>

<details>
<summary><b>Claude Code に変更やバグ修正の前後を見せてもらえますか？</b></summary>

はい、show-your-work プラグインを使えば可能です。Claude は古い版と新しい版で同じ Playwright の手順を記録します。Compare が両方の録画を同期して並べて再生します。各テストチェックは動画が進むにつれて緑または赤に変わります。

</details>

<details>
<summary><b>視覚的 QA 向けの Claude Code プラグインはありますか？</b></summary>

はい、show-your-work が視覚的 QA 用の Claude Code プラグインです。Claude の Playwright テスト実行を録画してチャットで再生します。各録画にはクリック可能な変更マーカーと、再生に合わせて緑や赤に変わるチェックが付きます。変更やバグ修正では、前後を同期して並べて再生します。

</details>

<details>
<summary><b>Claude Code が本当にバグを修正したかどうかは、どう確認できますか？</b></summary>

最も簡単な方法は、show-your-work で修正を録画させることです。バグを直して前後を見せるよう Claude に依頼してください。古い版と新しい版が同期して並べて再生され、現在は通っているチェックが緑で示されます。

</details>

<details>
<summary><b>show-your-work は、単に端末で画像を見るのとどう違いますか？</b></summary>

show-your-work は端末での画像表示にとどまりません。主な強みは視覚的 QA です。同期した前後の Playwright 録画を再生し、クリックで移動できる変更点を一覧表示し、再生に合わせて各チェックを緑または赤にします。Claude Code を離れずに機能や修正をレビューできます。

</details>

<details>
<summary><b>画像や動画の表示でトークンを消費しますか？</b></summary>

いいえ、show-your-work はトークンとメモリの両方を節約するよう設計されているため、追加のトークンはほとんど消費しません。画像と動画は kitty のグラフィックプロトコルで端末に直接描画され、トークンは使用しません。動画も効率的にデコード・ストリーミングされるため、メモリ使用量はごくわずかです。

</details>

<details>
<summary><b>どの端末で動作しますか？</b></summary>

show-your-work プラグインは macOS と Linux の Ghostty と kitty をサポートします。

</details>

<details>
<summary><b>無料ですか？</b></summary>

はい、show-your-work は MIT ライセンスの無料オープンソースです。

</details>

<details>
<summary><b>新機能や修正が出たときに、自分でプラグインを更新する必要がありますか？</b></summary>

いいえ、自分で更新する必要はありません。プラグインは自動更新されるため、取り残されることはありません。導入時のガイド、またはいつでも `/show-your-work` から Stable と Latest のリリースを選べます。

</details>

<details>
<summary><b>導入ガイドをもう一度見るには？</b></summary>

`/show-your-work tour` を実行すると、導入ガイドを再度表示できます。録画、前後比較、バージョン履歴、設定について説明します。

</details>

<details>
<summary><b>ディスク容量を多く使いますか？</b></summary>

いいえ、それほど容量は使いません。振り返れるよう最近の画像と動画を保持し、合計が約 1 GB に達すると古いものから削除します。

</details>

<details>
<summary><b>データを収集しますか？</b></summary>

匿名の利用データ共有はあなたが選びます。導入時に選べるほか、いつでも `/show-your-work` で変更できます。機密データは一切収集しません。詳細は[プライバシーポリシー](PRIVACY.md)を参照してください。

</details>

<details>
<summary><b>自分のコンピューター上で何を実行し、何を保持し、何に接続しますか？</b></summary>

プラグインがコンピューター上で行うことをすべて説明します。何がインストールされるのかを正確に把握してください。画像と動画がコンピューターの外に出ることはありません。

画像と動画の準備には `ffmpeg` と `ffprobe`（動画をフレームに変換し、長さを読み取ります）を使用し、macOS では `sips`（画像を PNG に変換）も使います。音声付きの動画を再生するときは `ffplay`（ffmpeg の一部）が音声を再生し、macOS では `osascript` がスピーカーやヘッドホンの再生時間を読み取り、画像が音声に合わせて待機します。「表示」「Finder で表示」「Downloads に保存」を押すと、macOS では `open`、Linux では `xdg-open` でファイルを開きます。macOS では `mdfind` が `/img` の検索を支援します。HTML ページや Markdown、Mermaid ドキュメントを表示する場合は、使い捨てプロファイル（ログイン情報は使いません）で非表示の Chrome または Chromium を使って描画し、PDF には poppler の `pdftoppm` と `pdfinfo` を使用します。

短いスクリプトが `sh` と `perl` で実行されます。これらは `ffmpeg` とホームフォルダーを探し、画像が収まるように端末のセルサイズを読み取り、プラグインの一時フォルダーを整理し、Linux でビューアーを開き、Stable と Latest のチャネルを切り替えます。独自の一時ファイルには `cp`、`mkdir`、`rm`、`cat`、`touch` も使い、`/plugin` の更新は 1 日 1 回までこのリポジトリから `claude plugin` で行います。更新はオフにできます。プラグインが Claude Code のプラグインディレクトリに移動すると、そちらが自動的に最新に保つため、アップデーターは無効になります。

次のファイルを保持します：

- 動画のフレームと変換した画像は一時フォルダー（`$TMPDIR/claude-show-your-work-<your user id>`）に置き、1 週間より古いものは削除されます。
- Claude が見せた各ファイルのコピーが、プロジェクト内の `.show-your-work/` に保存され、バージョンを遡れます。
- 「Downloads に保存」すると `~/Downloads` にコピーが置かれます。
- 古いバージョンの「画像をオンにする」がシェルプロファイルに追加した行（[対応端末](#対応端末)を参照）があれば、その 1 行を削除します。
- `SHOW_YOUR_WORK_DEBUG=1` を設定すると、一時フォルダーに `debug.log` を書き出します。

1 日 1 回、`raw.githubusercontent.com` からプラグインの最新バージョン番号を読み取ります。

`/show-your-work` で使用データの共有が有効な場合、匿名の利用回数を `us.i.posthog.com` に送信します。送信されるのはイベント名と回数、プラグインと Claude Code のバージョン、端末、OS、ffmpeg がインストールされているかどうかで、ランダムなインストール ID に紐づきます。ファイル名、パス、プロンプト、入力内容、IP アドレスは一切含まれません。コード内のキーは PostHog の公開キーで、イベント送信にしか使えません。

Claude Code 内では、次のフックを使用します：

- `prompt.submit` はメッセージと一緒に短い行を 1 つ送り、この端末で画像を表示できること（またはできない理由）を Claude に伝えます。セッションごとに 1 回、コンパクション後、および状況が変わったときに送信します。
- `prompt.submit` はメッセージを送ったときに設定画面を閉じ、貼り付けた画像の名前を記憶して `/img` が見つけられるようにします。あなたのメッセージは変更されません。
- `tool.call` はプラグイン自身の `show_image`、`show_video`、`show_html`、`show_audio`、`show_document` ツールを処理します。他のツールには触れません。
- `command.run` は `/img`、`/page`、`/audio`、`/doc`、`/show-your-work` を実行します。インストール直後には `/show-your-work tour` を 1 回だけ実行してガイドを表示します。
- `ui.render` はプラグインのプレイヤー、通知、設定、ガイドを描画します。
- `session.start` と `session.end` は開始時に一時フォルダーと端末を準備し、終了時に保留中の利用統計を送信します。tmux 内では、プラグインのペインに対する画像のThroughも開始・停止します（[対応端末](#対応端末)を参照）。

</details>

## フィードバック

バグ報告や変更の提案は[issue を作成してください](https://github.com/iamumeransari/claude-show-your-work/issues)。

## 開発者向け

<details>
<summary>ツール、設定、ローカル開発</summary>

プラグインは Claude に 5 つのツールを提供します：`show_image`、`show_video`、`show_html`（HTML ページのスナップショット）、`show_audio`（MP3 と WAV、波形付き）、`show_document`（PDF、Markdown、Mermaid、ページごと）。基本的な呼び出しにはパスだけで十分です。前後比較では、古いファイルとテスト結果も渡します：

```jsonc
{
  "path": "qa/after.webm",          // the run on the fixed version
  "compare": "qa/before.webm",      // the same steps on the old version
  "title": "Pricing page",
  "url": "http://localhost:3000/pricing",
  "changes": [                      // what changed, and the second it shows up
    { "title": "Annual toggle sets prices", "at": 3.2 },
    { "title": "Plan buttons line up", "at": 5.4 }
  ],
  "summary": [                      // the test results, at most three lines
    { "label": "Billing: toggle works", "ok": true, "passed": 1, "total": 1 },
    { "label": "Layout: plans, buttons", "ok": true, "passed": 3, "total": 3 }
  ]
}
```

動画は毎秒最大 12 フレームでフレームに分割され、ウィンドウでの表示幅（最大 2400 px）で処理されます。上限は 3,600 フレーム（全速で 5 分）です。ファイルを自分で開くには、`/img path/to/file.png` を実行します。

プラグインを開発するには、`hooks/` のモジュール（エントリは `register.tsx`）を編集し、`/reload-plugins` で変更を読み込みます。変更を送る前に `claude plugin validate .` と `claude plugin test .` を実行してください。

</details>

## 状況

show-your-work は活発にメンテナンスされています。Playwright の録画による画像、動画、自動化された視覚的 QA を Claude Code の端末にもたらした最初のプラグインです。ローンチ動画は 27 万 5 千回以上視聴されています。それ以来、端末を離れずに Claude の作業を見たい開発者に選ばれる存在となり、最大規模の Claude Code プラグインカタログのいくつかに掲載され、現在もトレンド入りしたプラグインの上位にランクされています。

Claude Code に作業のスクリーンショット、画面録画、前後の比較を端末内で見せてほしいなら、このプラグインはまさにそのために作られています。

## ライセンス

[MIT](LICENSE)。例に使われている写真は [Unsplash](https://unsplash.com) のもので、Unsplash License に基づいて使用しています。[プライバシー](PRIVACY.md)。

<p align="center"><a href="#install"><img src="docs/end-card.jpg" alt="show-your-work, with the install commands" width="100%"></a></p>

## 出典とライセンス

- 原作者：[iamumeransari](https://github.com/iamumeransari/claude-show-your-work)
- 元リポジトリ：https://github.com/iamumeransari/claude-show-your-work
- ライセンス：MIT
- 日本語翻訳と UI ローカライズ：claude-code-mods-ja プロジェクト
