# prismantis

> 日本語版は claude-code-mods-ja プロジェクトによる翻訳です。原作者とライセンスは文末を参照してください。原文の README は [README.en.md](README.en.md) にあります。

Claude Code の応答をカラフルに描き直す mod です。テーブル、見出し、リスト、引用、ハイライトされたコード、数値、パスとリンク、mermaid 図、ツール行を、17 種類のテーマで表示し、コピーボタンも備えています。外観を選ぶには `/prismantis setup`、描画されるすべての要素を見るには `/prismantis demo` を実行してください。

スクリーンショット、すべてのオプション、更新履歴は[完全な README](https://github.com/NahumLitvin/prismantis#readme) を参照してください。

## 実行内容、読み取り内容、変更内容

prismantis はネットワークリクエストを送信しません。以下はすべてあなたのマシン上で行われます。

- **プログラム。** `⧉ html` または `▣ png` をクリックすると、コピーしたテーブル、図表、グラフが標準入力経由でクリップボード補助プログラムに渡されます：macOS では `osascript`、Windows では `powershell.exe`（`SystemRoot` を読み取って見つけます）、Linux では `copyq` です。`latex` を有効にすると、`PATH` から `ratex-render` を実行し、応答内の数式を標準入力経由で渡します。これ以外のプログラムは実行しません。
- **ファイル。** 応答内で Markdown の画像リンクとして書かれたローカル PNG（最大 2 MB）を読み取り、kitty や Ghostty で描画します。`ratex-render` が `$TMPDIR/prismantis-latex-<session>-<id>` に書き出した PNG も読み戻します。自身ではファイルを書きません。
- **設定。** `/prismantis setup` と `/prismantis theme` は選択内容を `/config` に保存し、prismantis 自身のオプション（`prismantis.theme`、`prismantis.tableStyle`、その他設定ステップの項目）のみを書き込みます。設定ファイルの他の内容は変更されません。
- **デスクトップアプリの色。** `desktopColors` が `match` の場合のみ：セッション開始時と `/prismantis theme` の実行時に、`$.theme.set` を使って現在のパレットに合わせたデスクトップアプリの色をセッションに設定します。`desktopColors` を `off` に戻すと `$.theme.clear()` を一度呼び出します。セッション開始時や再読み込み時にクリアすることはありません。
- **フック。** `ui.render` で描画し、`command.run` で `/prismantis` コマンドに応答し、`config.set` で自身の `desktopColors` 行を監視し、`prompt.submit` でモデルにだけ見える[図表のヒント](https://github.com/NahumLitvin/prismantis#diagram-hints)を追加し、`keyPointHint` が有効なときは要点のヒントも追加します。また `engine.create` で[他の mod](https://github.com/NahumLitvin/prismantis#other-mods) 向けに `$.prismantis.markdown` を追加します。`prismantis.markdown` はこの呼び出し固有のイベントです。

## 出典とライセンス

- 原作者：[Nahum Litvin](https://github.com/NahumLitvin/prismantis)
- 元リポジトリ：https://github.com/NahumLitvin/prismantis
- ライセンス：MIT
- 日本語翻訳と UI ローカライズ：claude-code-mods-ja プロジェクト
