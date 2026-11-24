# Context Attachment Manager

> 日本語版は claude-code-mods-ja プロジェクトによる翻訳です。原作者とライセンスは文末に記載されています。原版の README は [README.en.md](README.en.md) をご覧ください。

Codex、Claude Code その他のエージェント向けの、画像を多用する会話のためのローカルプラグインです。古い画像が毎回のメッセージで再送されることがなくなり、モデルが必要な画像を ID で取得します。会話がコンパクトされた後でも同じです。

各画像に番号を付け（IMG-001、IMG-002……）、古い画像を短いプレースホルダーに置き換えます。モデルは必要なときに ID で元画像を取得でき、各画像には一行の説明とあなたのコメントが残ります。プレースホルダーは一度だけ書き込まれるのでプロンプトキャッシュが効き続け、元画像と履歴は削除されません。デフォルトで有効です。

## インストール

次の一文をエージェントに送ってください。プラットフォームを判定して適切な設定をインストールします。

```text
Install Context Attachment Manager for me, following https://github.com/chipfighter/context-attachment-manager/blob/main/INSTALL.md
```

その後エージェントを再起動します。Codex ではタスクのサイドパネルの Context Assets を開いてください。Claude Desktop の Code タブでは画像があるとパネルが自動的に開き、`/cam` で再度呼び出せます。

## 出典とライセンス

- 原作者：[chipfighter](https://github.com/chipfighter/context-attachment-manager)
- 原リポジトリ：https://github.com/chipfighter/context-attachment-manager
- ライセンス：MIT
- 日本語翻訳と UI ローカライズ：claude-code-mods-ja プロジェクト
