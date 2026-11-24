# Claude Code 厳選 mod

{{languages}}

**厳選、検証済み、バージョン固定。一度追加すれば {{count}} 個の mod がすぐ使えます。**

> **すべての {{count}} 個の mod が日本語に完全対応しています。** すべてのラベル、コマンド、パネル、プロンプト、README が翻訳されています。プラグインのソースはこのリポジトリに同梱されているため、インストール後は追加設定なしで UI が日本語になります。コードの識別子、hook のイベント名、skills、モデル向けの指示は動作を変えないため英語のままです。

mod は関数フックで作られた Claude Code のプラグインです。Claude Code の動作を観察・変更・代行でき、独自の UI も描けます。このマーケットプレイスはコミュニティの優れた mod を集めたものです。どれも `claude plugin validate` で検証し、検証したコミットに固定しているので、作者のその後の変更がレビューなしで届くことはありません。

Claude Code 2.1.287 以降が必要です。

## インストール

Claude Code のターミナルセッションで次を入力します。

```
/plugin marketplace add claude-code-mods/claude-code-mods-ja
/plugin install <mod 名>@claude-code-mods-ja
```

例：`/plugin install terminal-browser@claude-code-mods-ja`。新しい mod や更新を取り込むには `/plugin marketplace update claude-code-mods-ja` を実行します。

## カタログ

各カードの**アクセス**は、UI の描画以外に mod のコードができることとして検証ツールが報告した内容です。インストール前にソースを確認してください。検証はコードを実行せずに読むだけで、セキュリティ監査ではありません。

{{catalog}}

## mod を推薦する

mod のリポジトリへのリンクを添えて issue を開いてください。自分で追加する場合は、`community.json` にエントリ（リポジトリ、フォルダ、確認したコミット、カテゴリ、ライセンス）を追加し、`readme/summaries.json` に一行の紹介文を書き、`python3 scripts/build-catalog.py` を実行してプルリクエストを送ってください。

## 致謝とローカライズ

各 mod の権利は原作者にあり、それぞれのライセンスに従います。本リポジトリはそれらを収集するだけでなく、**日本語ローカライズ**も提供しています。プラグインは `mods/` に同梱し、ラベル、コマンドの説明、パネルやプロンプト、そして各 mod のドキュメントも翻訳しています（原版は `README.en.md` として保持しています）。原作者とライセンスは各ドキュメントの末尾に記載されています。ローカライズ版の削除やクレジット表記の変更をご希望の場合は issue を開いてください。

非公式プロジェクトであり、Anthropic とは関係ありません。
