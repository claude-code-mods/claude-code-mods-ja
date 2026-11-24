<h1 align="center">Claude Code Filetree</h1>

<p align="center">
  Claude が何をしていて、ファイルのどこにいるのかを示す、Claude Code 用の IDE 風ファイルツリー
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Claude_Code-%E2%89%A5_2.1.306-D97757?logo=claude&logoColor=fff" alt="Claude Code 2.1.306 or newer">
  <img src="https://img.shields.io/badge/version-0.8.5-blue" alt="Version">
  <img src="https://img.shields.io/badge/type-mod-6f42c1" alt="Claude Code mod">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
</p>

<details open>
<summary><b>Claude Code CLI</b></summary>

<p align="center">
  <img src="media/filetree-shimmer.gif" alt="Claude が編集中のファイルをきらめかせる filetree" width="900">
</p>

</details>

<details>
<summary><b>デスクトップアプリの Claude Code</b></summary>

<p align="center">
  <img src="media/0.8.2/desktop-light.png" alt="ライトモードのデスクトップアプリのファイルツリー。Clawd のきらめきボタンを含むヘッダーのボタン、ブランチ行、検索行、フォルダーが表示されている" width="600">
</p>

</details>

**主な機能：**

* ディレクトリ内のすべてのファイルを表示・移動（Git ステータス、nvim のキーバインドに対応）
* アニメーションで Claude が読み込み・作業中の場所を示す
* キーボードショートカット：
   * `z` でディレクトリを移動（zoxide 風）
   * `s` または `i`（ハイライトされたフォルダー内）、あるいは `q`（ファイル内容内）で検索
   * `d` でファイル、またはフォルダー内の変更ファイルすべてを diff
* ターミナル優先の機能：ファイルプレビュー、ディレクトリサイズのトレーマップなど

---

## インストール

このリポジトリ自体がプラグインの marketplace です。端末で次を実行してください：

```bash
claude plugin marketplace add data-goblin/claude-code-filetree
claude plugin install filetree@claude-code-filetree
```

または Claude Code のセッション内で：

```text
/plugin marketplace add data-goblin/claude-code-filetree
/plugin install filetree@claude-code-filetree
```

2.1.287 より前の Claude Code では `Unrecognized key: "options"` というエラーになります。まず `claude update` を実行し、その後再度インストールしてください。

## 機能

- 作業ディレクトリまたは固定したフォルダーのファイルツリー。Git、サイズ、行数、日付の列付き（[tree](docs/tree.md)）
- すべて折りたたむ、深さ 3 レベルまで展開する（[tree](docs/tree.md)）
- シンボリックリンクの矢印、エージェントの指示ファイルには脳のアイコン、Nerd Font・プレーン・テキストのグリフ（[tree](docs/tree.md)）
- 開いていないフォルダーも含めた名前検索。大文字小文字の区別や正規表現に対応し、1 つのフォルダーに範囲を限定できる（[search](docs/search.md)）
- `git grep` または `grep -r` でファイル内を検索し、該当行を開く（[search](docs/search.md)）
- `z` で zoxide 風に任意のフォルダーへジャンプ（[search](docs/search.md)）
- ファイルとフォルダーごとの Git ステータス、変更ファイルの行数、先行・遅れを示すブランチ（[git](docs/git.md)）
- Claude が実行する Git や GitHub のコマンドをステータス行に表示（[git](docs/git.md)）
- Claude の読み取り、書き込み、コミットがツリー上できらめき、自動折りたたみで開いたフォルダーが閉じる（[activity](docs/activity.md)）
- Activity shimmer 設定ですべてのセッションできらめきをオフにでき、デスクトップアプリのヘッダーにある Clawd ボタンで切り替えられる（[activity](docs/activity.md)）
- Claude の返答にある行番号付きのファイル参照が、その行へのリンクになる（[activity](docs/activity.md)）
- Follow work により、セッションが Claude の作業しているリポジトリへ移動する（[activity](docs/activity.md)）
- IDE 風の複数選択。網掛けされた行がコンテキストとして Claude に渡されます。選択行、または最大 100 件のマークした行（[context](docs/context.md)）：
  - クリックで 1 行を選択し、マークを解除する
  - 行にマークがある間、j / k はカーソルだけを動かし、`v` でカーソル下の行をマークまたは解除する
  - shift+クリックで、直前のクリックまたは j / k の移動位置からツリー順に範囲をマークする
  - ctrl+クリックで 1 行を開かずにマークまたは解除する。macOS では alt+クリック
  - ダブルクリックまたは Enter でファイルを開く
  - 選択解除ボタンですべてのマークと選択を解除する
  - マークした行は選択背景で表示され、`y`、`Y`、`u` で網掛けの行をコピーする
  - 行にマークがある間、カーソル下の行はデスクトップアプリではアクセント色の網掛け、ターミナルではアクセント色のカーソルマークで表示される
- コード、Markdown、画像、動画のフレーム、PDF と Word のページを分割プレビュー（[preview and treemap](docs/preview-treemap.md)）
- フォルダーをバイト数または行数で表すトレーマップ。Claude のアクティビティが光る（[preview and treemap](docs/preview-treemap.md)）
- ファイル、またはフォルダー内の変更ファイルすべてを、ペイン内または好みの diff ツールで diff（[diff](docs/diff.md)）
- ファイルを既定のアプリ、tmux や herdr のペイン内のエディター、または任意のコマンドで開く（[open](docs/open.md)）
- Claude によるファイルとフォルダーの編集を禁止し、リポジトリ外に書き込まれたファイルを確認する（[guards](docs/guards.md)）
- キーボード中心の操作：vim 風の移動、ショートカット一覧、ターミナルでの alt+l / alt+h（[keys](docs/keys.md)）
- `/filetree` コマンドと、ターミナルおよびデスクトップアプリでのペインの表示位置（[sidebar](docs/sidebar.md)）

<img src="media/filetree-git.gif" alt="コミットされたファイルが緑にきらめき、フッターにコミットが表示される" width="800">

<img src="docs/media/preview-media.gif" alt="プレビューに表示された画像、動画、2 ページ目にめくれた PDF、Word 文書" width="800">

## 設定

すべての設定は `/config` の filetree の下にあり、それぞれその場で説明が表示されます。

```yaml
Claude activity:  reads and writes | writes | reads | none
Activity shimmer: on | off
Follow Claude:    on | off
Jump moves Claude: tree and Claude | tree
Right-click copies: relative | absolute
Follow work:      on | off
Open at start:    on | off
Focus on open:    on | off
Right column:     date | age | size | loc | files
Date format:      year-month-day | day-month | month-day
Clock:            24h | 12h
Long file:        500 | a line count | off
Remote branch:    off | on
Hints:            on | off
Search spacing:   on | off
Column headers:   on | off
Auto-collapse:    off | on
Shortcuts:        auto | always | off
Open with:        empty | editor | preview | a command with {path} and {dir}
Binary files:     Open with | default app
Edit with:        empty | a command with {path} and {line}
Diff with:        empty | a command such as "hunk diff --" or "lazygit -f"
Diff groups:      folder | kind | off
Terminal target:  auto | pane right | pane below | tab | workspace
Ignore:           names to hide, such as ".cache .tmp"
Preview pane:     bottom | top
Treemap:          auto | image | cells | off
Palette:          key=#hex pairs over the terminal colors
Glyphs:           auto | nerd | plain | text
```

ターミナルでは、アクセント色がフォルダー、ルート、カーソル、検索の一致箇所、cells トレーマップの最上位のボックスに適用されます。ダークな Claude テーマではターミナルの明るい青、ライトテーマではその青が使われます。Palette の `accent=#hex` で、これらすべてに別の色を設定できます。

Follow work については [Claude のアクティビティ](docs/activity.md)を参照してください。

Open at start は `/clear` を含むすべての新しいセッションに適用されます。`/filetree` でツリーを開いたり閉じたりした場合、その選択は次の `/clear` まで有効です。`/clear` の後は、Open at start の設定に従ってツリーが開いた状態または閉じた状態になります。

## 要件

```yaml
required:  Claude Code 2.1.306 or newer, git
optional:
  inotifywait:            live updates on Linux (inotify-tools)
  magick or ffmpeg:       images other than PNG, video frames
  pdftoppm or gs:         PDF pages
  soffice:                Word and office pages
  pandoc, pdftotext:      document text in tmux, herdr and other terminals
  tmux or herdr:          an editor or diff tool in a new pane
  Nerd Fonts 3.2+:        icons for Glyphs auto, which draws plain Unicode without one or with an older one
pictures:  Ghostty or kitty, outside tmux and herdr, on Linux and macOS
```

## 留意事項

- デスクトップアプリには分割プレビューやトレーマップはありません
- デスクトップアプリが同時にきらめかせるのは最大 4 行です。それより多い行はきらめきなしでその色が表示され、ターミナルではすべての行がきらめきます。ペインが埋もれてしまう場合は、ヘッダーの Clawd ボタンまたは Activity shimmer 設定できらめきをオフにできます
- デスクトップアプリはカーソルの周囲の最大 150 行を描画します。行が深い、パスが長い、Git の変更が表示されるといった場合はさらに少なくなり、省略した行数が注記で示されます
- GIF と動画は 1 フレームの静止画として表示されます
- Windows ではファイル一覧によってフォルダーのサイズを算出し、トレーマップは 1 レベルだけ描画します
- 行のクリックには herdr 0.9.1 以降が必要です。`herdr update` を実行してください

## コントリビューション

`main` ではなく、リリースブランチに対してプルリクエストを送ってください：

- 修正：パッチブランチ（例：`release/0.8.2`）
- 機能追加：マイナーブランチ（例：`release/0.9.0`）

そのブランチのバージョンを維持してください。

git のフックはクローンごとに 1 回有効化します。pre-commit フックは数秒で高速なチェックを実行します。grep ルール、型、oxlint、マニフェストが変更された場合は `claude plugin validate` です。pre-push フックはバージョンがリリースブランチと一致するか確認し、プラグインのテストを実行します：

```bash
git config core.hooksPath .githooks
```

同じチェックが CI で macOS、Windows、Linux 上で、プラグインに変更があるすべてのプッシュごとに実行されます。

## ライセンス

[MIT](LICENSE)。トレーマップのラベルには [Terminus Font](https://terminus-font.sourceforge.net/) の Dimitar Zhekov によるグリフを使用しています（Lat2-Terminus16、SIL Open Font License 1.1）。

*このプロジェクトは、私の Omarchy アプリ [FileBlade](https://github.com/data-goblin/fileblade) に着想を得ています。*

## 出典とライセンス

- 原作者：[data-goblin](https://github.com/data-goblin/claude-code-filetree)
- 原リポジトリ：https://github.com/data-goblin/claude-code-filetree
- ライセンス：MIT
- 日本語翻訳と UI ローカライズ：claude-code-mods-ja プロジェクト
