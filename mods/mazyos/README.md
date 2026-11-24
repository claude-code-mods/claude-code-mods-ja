# MazyOS：Claude Code 上のあなたのビジネスの OS

> 日本語版は claude-code-mods-ja プロジェクトによる翻訳です。原作者とライセンスは文末に記載されています。原版の README は [README.en.md](README.en.md) をご覧ください。

> Claude Code 用のポルトガル語プラグインです。会社の記憶、ブランドのビジュアル、マーケティング・SEO・Google Ads・Instagram のカルーセル・Google Maps での顧客開拓のための 17 のスキルを備えています。あなたが指揮を執り、Claude が働きます。

インストールは一度だけです。その後、あなたのビジネスのフォルダを開けば、Claude はあなたが誰で、どのように話し、今週何が重要なのかを知って会話を始めます。カルーセルを頼めばブランドのデザインで仕上がります。リードを頼めば Google Maps を検索してプレビューサイトを作ります。広告レポートを頼めば CSV を読み、お金がどこから漏れているかを教えてくれます。

さあ、飛び立ちましょう。

---

## MazyOS とは

Claude Code は Anthropic のツールで、あなたのコンピュータ内のフォルダで Claude を動かします。MazyOS はそのためのプラグインです。スキル（Claude が従う手順書）のパッケージと、作業中に Claude Code 自体を変更する mod（コードの一部）から成ります。

両者が組み合わさって、あなたのビジネスを知る AI エージェントになります。具体的には：

**記憶します。** `_memoria/` の 3 つのテキストファイルに、会社のこと、話し方、現在の注力事項が保存されます。すべてのセッションはこれらをコンテキストとして始まります。「こう書かないで」「この顧客は抜けた」と修正すると、Claude は保存するかどうかを尋ね、正しい場所に保存します。

**あなたらしい見た目になります。** `identidade/design-guide.md` に色、フォント、ロゴが入っています。カルーセルも提案書もスライドも、すべてブランド仕様で出力されます。

**繰り返し作業をこなします。** 17 の既成スキルに加え、自分でスキルを作る方法もあります。毎週繰り返していることを話せば、Claude がスキルに変換します。

プログラミングの知識は不要です。ビジネスについて質問に答えられれば十分です。

---

## Claude Code に MazyOS をインストールする

Claude Code を任意のフォルダで開き、以下を貼り付けてください：

```
/plugin install mazyos@claude-code-mods-ja
```

marketplace を追加してよいか（`y`）と、どのスコープにするかを尋ねられます。`user` を選ぶと、あなたのすべてのフォルダで有効になります。次に 3 つの選択肢（パネル、ステータス行、git のブレーキ）が表示されます。すべて有効のままで構いません。あとから `/config` で変更できます。

ターミナルが好みなら同じ結果になります：

```bash
claude plugin install mazyos --marketplace mazzeoia/MazyOS
```

`/plugin` がない Claude デスクトップアプリでは、入力欄の横の `+` をクリックし、Plugins、Add marketplace で `mazzeoia/MazyOS` を指定し、Add plugin を選びます。

まだ Claude Code がない場合は Anthropic の製品で、サイト（[code.claude.com](https://code.claude.com)）からインストールできます。Mac、Windows、Linux で動作し、Claude の有料プラン（Pro、Max、Team）または API キーが必要です。

---

## 自社にシステムを導入する

ビジネスの名前のフォルダを作り（既存のフォルダでも構いません）、その中で Claude Code を開いて次を実行します：

```
/mazyos:instalar
```

`_memoria/`、`identidade/`、`marketing/`、`saidas/`、`dados/`、`scripts/` の構造が作られ、約 5 分のインタビューが始まります。何を売っているのか、誰に売るのか、どのように書くのか、今日のボトルネックは何か、ブランドカラーは何か。あなたは答えるだけです。終了時にはメモリが埋まり、システムがあなたのことを理解しています。

一度だけ実行すれば十分です。あとはフォルダで Claude を開いて、やりたいことを頼むだけです。

---

## MazyOS 導入後に Claude Code で変わること

ここが mod の部分です。MazyOS のフォルダ内では：

- **メモリが自動で入ります。** 会社、設定、戦略が `CLAUDE.md` の隣にプロジェクト指示としてコンテキストに入ります。ファイルを変更すると Claude は新しいバージョンを受け取ります。読み込むよう頼む必要はありません。
- **ルールも一緒に来ます。** 回答前にメモリを読む、修正を保存する前に尋ねる、コンテキストが変わったら知らせる、繰り返し作業にスキルを提案する。これらはすべて、誤って削除できるファイルに依存せず、プラグインから直接すべてのセッションに入ります。
- **チャット脇のパネル。** ビジネス、注力事項、トーン、メモリファイルの入力状況と更新日時、そしてショートカットボタン（セッションを開く、メモリを更新、GitHub に保存）を表示します。幅の広いターミナルでは自動で開きます。いつでも `/mazyos` で開けます。
- **ステータス行。** `MazyOS · Acme · foco: fechar 3 clientes` がプロンプトの下に表示され、軸を見失いません。
- **メモリ変更時の通知。** Claude が `estrategia.md` を編集したら、パネルとステータスが即座に更新され、通知が表示されます。
- **git のブレーキ。** `git push --force`、`git reset --hard` などは、あなたが確認して初めて実行されます。尋ねられない状況では実行されません。

MazyOS のフォルダ外では、プラグインは静かにしています。フォルダごとに一度だけ、`/mazyos:instalar` があることを知らせます。

---

## VS Code と Antigravity の MazyOS

同じシステムがエディタ拡張としても存在します（[vscode/](vscode/) フォルダ）。同じメモリを読み、同じ 17 のスキルを備え、作業を誰が行うか選べます：Claude Code（Claude アカウント）、Codex（ChatGPT アカウント）、Antigravity（Google アカウント）。それぞれ各 CLI の公式ログインを使い、拡張はリクエストを組み立ててエディタ脇のコンソールに状況を表示するだけです。VS Code、Antigravity IDE、Cursor で動作します。

マーケットプレイスにまだない間は、`vscode/` で生成される `.vsix` ファイルからインストールします：

```
cd vscode && npm install && npm run empacotar
code --install-extension mazyos-0.1.0.vsix
```

詳細は[拡張機能の README](vscode/README.md) にあります。

## スキル

すぐに使える Claude Code の 17 スキルです。`/mazyos:` と入力すると一覧が表示されます。

### 日々の業務

- `/mazyos:abrir` はコンテキストを 5 行で要約し、次に何をするか尋ねます。
- `/mazyos:salvar` は git を一度も使ったことがない人でも GitHub にコミットしてプッシュします。
- `/mazyos:atualizar` はメモリとフォルダの内容を比較し、更新すべき項目を提案します。
- `/mazyos:novo-projeto` は顧客や施策ごとに専用のコンテキストを持つ独立したフォルダを作ります。
- `/mazyos:mapear-rotinas` は毎週繰り返していることを尋ね、それぞれについてスキルを作ります。
- `/mazyos:criacao-canonica-de-skills` はより深い方法でスキルの作成、リファクタリング、監査を行います。

### コンテンツと SEO

- `/mazyos:carrossel` はブランド仕様の Instagram カルーセル（1080×1350）を、AI 生成写真の有無にかかわらず作成し、キャプションも用意します。
- `/mazyos:publicar-tema` はテーマからブログ記事、カルーセル、3 つのキャプション（Instagram、Facebook、LinkedIn）を、一貫した内容で出力します。
- `/mazyos:seo` は 8 ステップの SEO フローを実行します：需要、競合、Google マイビジネス、オンページ、コンテンツ、Google Ads、モニタリング、GEO（ChatGPT、Gemini、Perplexity に表示されること）。
- `/mazyos:responder-avaliacoes` は Google のレビューに対する人間らしい返信を書きます。
- `/mazyos:aprovar-post` はブログ、Instagram、Facebook への投稿を 1 コマンドで行います。

### Google Ads と Meta Ads

- `/mazyos:anuncio-google` は Google Ads Editor にインポートできる CSV としてキャンペーン全体を作成します。
- `/mazyos:relatorio-ads` は Google Ads と Meta Ads のエクスポートを読み、警告と取るべき行動を含む週次レポートを返します。

### 顧客開拓

- `/mazyos:prospecta-maps` はニッチと都市を起点に Google Maps で企業を検索し、Receita で CNPJ を確認し、リードごとにプレビューサイトを作り、最初のメッセージとフォローアップを用意します。PDF の提案書は依頼時に作成されます。API キーは不要です。

### 制作

- `/mazyos:analisar-dados` は CSV、スプレッドシート、PDF を読み、エグゼクティブ向けの要約を返します。
- `/mazyos:email-profissional` はあなたが話した内容からメールの下書きを作ります。

あなたのビジネス用に作ったスキルは、プラグイン外のフォルダの `.claude/skills/` に置かれ、`/\u003Cnome>` のように呼び出します。

---

## よくある質問

**MazyOS は無料ですか？** プラグインはオープンソースで無料です。支払うのは Claude Code の方です：Claude の Pro、Max、Team プラン、または Anthropic の API です。

**プログラミングは必要ですか？** いいえ。ポルトガル語で会話し、ビジネスに関する質問に答えるだけです。コマンドはスラッシュと名前です。

**Windows で動作しますか？** はい。Mac、Windows、Linux で、ターミナル、VS Code、Claude アプリのいずれでも動作します。

**データはどこに保存されますか？** あなたのフォルダ、あなたのコンピュータ内です。メモリ、ブランド、システムが生成するものはすべてあなたのテキストファイルで、開いたり編集したり GitHub で管理したりできます。プラグインは読み取り専用で、`/plugin` 経由で更新されます。

**Claude Code のプラグインとは？** 1 行のコマンドでインストールし、Claude Code にスキル、コマンド、動作を追加するパッケージです。MazyOS もその 1 つです。

**プラグインが Claude で何をするのか確認できますか？** はい、すべてここで公開されています。`hooks/sistema.ts` にコンテキストに入るルールが、`hooks/register.tsx` に mod があります。

**以前はこのリポジトリをクローンして MazyOS を使っていました。今はどうすれば？** プラグインをインストールし、ビジネスのフォルダで次のようにします：`.claude/skills/` を削除してください（スキルはプラグインから提供されます。自分で作ったスキルは残せます）、`CLAUDE.md` から MazyOS の一般ルールを削除してください（プラグインがすべて注入します）、すっかり習慣になった `/abrir` を `/mazyos:abrir` に置き換えてください。メモリ、ブランド、出力はそのまま残ります。

---

## 考え方

AI はあなたの会社が使うツールではありません。会社が動くオペレーティングシステムです。

違いは速度ではありません。新しい能力です。AI を使う 1 人が、以前はチーム全体が必要だったものを作れます。今日オープンループで回っているプロセス（決める、実行する、測らない、盲目的に繰り返す）は、MazyOS の中ではクローズドループになります（決める、実行する、記録する、フィードバックする、自ら調整する）。

システムはあなたの代わりではありません。会社の一部になります。

---

## コードを触りたい人へ

このリポジトリはプラグインであり、同時に marketplace でもあります。

```
.claude-plugin/   plugin.json と marketplace.json
hooks/            register.tsx（mod）、memoria.ts（ワークスペースを読む）、sistema.ts（ルール）
types/            mod の状態の型
tests/            mod のテスト
skills/           17 のスキル
templates/        CLAUDE.md のプロファイル、カタログ、ワークスペースのひな形
```

```bash
claude plugin validate .     # マニフェスト、marketplace、hooks
claude plugin test .         # mod のテスト
claude --plugin-dir .        # ビジネスのフォルダで、このチェックアウトを読み込む
```

---

[mazyos.com.br](https://mazyos.com.br)

## 出典とライセンス

- 原作者：[Mazzeo-Marketing](https://github.com/Mazzeo-Marketing/MazyOS)
- 原リポジトリ：https://github.com/Mazzeo-Marketing/MazyOS
- ライセンス：NOASSERTION
- 日本語翻訳と UI ローカライズ：claude-code-mods-ja プロジェクト
