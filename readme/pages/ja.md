# Claude Code mod 精选

{{languages}}

**厳選、検証済み、バージョン固定。一度追加すれば {{count}} 個の mod がすぐ使える。**

> **すべての {{count}} 個の mod は日本語に完全ローカライズされています。** すべてのラベル、コマンド、パネル、プロンプト、README が翻訳済みです。プラグインのソースはこのリポジトリに同梱されているため、追加設定なしでインストール直後から UI は日本語で表示されます。コード識別子、hook イベント名、skills、モデル向けの指示のみ、動作を変えないために英語のままとしています。

Mod は関数フックで作られた Claude Code のプラグインです。Claude Code の動作を観察・変更・代行でき、独自の UI も描けます。このマーケットプレイスはコミュニティの優れた mod を集めたものです。どれも `claude plugin validate` で検証し、検証したコミットに固定しているので、作者のその後の変更がレビューなしで届くことはありません。

Claude Code 2.1.287 以降が必要です。

## インストール

Claude Code のターミナルセッションで：

```
/plugin marketplace add claude-code-mods/claude-code-mods-ja
/plugin install <mod 名>@claude-code-mods-ja
```

例：`/plugin install terminal-browser@claude-code-mods-ja`。新しい mod や更新を取り込むには `/plugin marketplace update claude-code-mods-ja` を実行します。

## カタログ

各カードの**アクセス**は、UI の描画以外に mod のコードができることとして検証ツールが報告した内容です。インストール前にソースを確認してください。検証はコードを実行せずに読むだけで、セキュリティ監査ではありません。

{{catalog}}

## mod を推薦する

mod のリポジトリへのリンクを添えて issue を開いてください。自分で追加する場合は、`community.json` にエントリ（リポジトリ、フォルダ、確認したコミット、カテゴリ、ライセンス）を足し、`readme/summaries.json` に各言語の一行紹介を書き、`python3 scripts/build-catalog.py` を実行してプルリクエストを送ってください。

## クレジットとローカライズ

各 mod の権利は作者にあり、それぞれのライセンスに従います。このリポジトリは紹介するだけでなく、**日本語のローカライズ**も提供しています。プラグインは `mods/` に同梱され、ラベル、コマンドの説明、パネル、プロンプトが翻訳され、各 mod のドキュメントも翻訳されています（原文は `README.en.md` として保存）。原作者とライセンスは各ドキュメントの末尾に記載されています。ローカライズ版の削除やクレジット表記の変更を希望される場合は、issue を開いてください。

非公式プロジェクトであり、Anthropic の製品ではありません。
