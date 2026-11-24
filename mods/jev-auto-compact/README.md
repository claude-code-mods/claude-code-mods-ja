# jev-auto-compact

> 日本語版は claude-code-mods-ja プロジェクトが翻訳しました。原作者とライセンスは文末を参照してください。

Jev による逐語圧縮に基づきます。コンテキストが 60% に達すると、何も生成せずに古いツール呼び出しを切り詰めます。切り詰めるものがなければ何もせずスキップします（LLM による要約にフォールバックすることは絶対にありません）。あわせて learning.db に証拠を記録します。

## インストール

```
/plugin install jev-auto-compact@claude-code-mods-ja
```

## 出典とライセンス

- 原作者：[notque](https://github.com/notque/vexjoy-agent)
- 原リポジトリ：https://github.com/notque/vexjoy-agent
- ライセンス：MIT
- 日本語翻訳と UI ローカライズ：claude-code-mods-ja プロジェクト
