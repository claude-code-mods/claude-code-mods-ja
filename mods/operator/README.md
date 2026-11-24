# Operator Memory for Claude Code

> 日本語版は claude-code-mods-ja プロジェクトによる翻訳です。原作者とライセンスは文末を参照してください。原版の README は [README.en.md](README.en.md) をご覧ください。


Operator Memory は、Claude Code に agent が管理する、読みやすい Markdown で保存される永続的なプロジェクト・ユーザーのコンテキストを提供します。

## インストール

Claude Code `v2.1.287` 以上が必要で、`PATH` に Operator Helper が含まれている必要があります。

```sh
operator-helper install claude-code
```

インストール後は新しい Claude Code プロセスを起動してください。`claude plugin list` を実行して `operator@operator-memory` が有効になっていることを確認し、その後 agent に Operator Memory のガイドを利用できるか確認してください。

プラグインは前文を主システムプロンプトとサブ agent のタスクプロンプトに注入します。メモリはプロセスごとに一度だけレンダリングされます。メモリを再読み込みするには Claude Code を再起動する必要があります。`/clear` ではキャッシュされた前文は更新されません。

## コマンド

- `/operator:user-init` — ユーザーパーティション（User Partition）を設定します。
- `/operator:project-init` — プロジェクトブレイン（Project Brain）を設定します。
- `/operator:index` — プロジェクトインデックス（Project Index）を構築または更新します。

## 更新

インストール中に、Operator marketplace の自動更新が有効になります（再インストールでも同様です）。その後無効にしたい場合は、`/plugin` → Marketplaces で設定できます。

`operator-helper install claude-code` を再実行するか、`claude plugin update operator@operator-memory` を使用してから、Claude Code を再起動してください。

検証、更新、トラブルシューティングについては [Claude Code ガイド](https://github.com/aerovato/operator-memory/blob/main/docs/harnesses/claude-code.md) を参照してください。ローカル開発時は、workspace のルートで `bun run preview:claude-code` を実行します。

## 出典とライセンス

- 原作者：[aerovato](https://github.com/aerovato/operator-memory)
- リポジトリ：https://github.com/aerovato/operator-memory
- ライセンス：BSD-3-Clause
- 日本語翻訳と UI ローカライズ：claude-code-mods-ja プロジェクト
