# compact-adviser

> 日本語版は claude-code-mods-ja プロジェクトによる翻訳です。原作者とライセンスは文末に記載されています。原版の README は [README.en.md](README.en.md) をご覧ください。

完了したチェックポイントで `/compact` を提案します（オプトインすると自動実行も可能）。判定には TypeSafe の Jev を使います。このプラグインの hooks モジュールは、`CLAUDE_CODE_ENABLE_FUNCTION_HOOKS` がちょうど 1 の場合にのみ有効になります。

## インストール

```sh
claude plugin marketplace add kunchenguid/compact-adviser
claude plugin install compact-adviser@compact-adviser
CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1 claude
```

その後 `/compact-adviser` を実行します。

## 出典とライセンス

- 原作者：[kunchenguid](https://github.com/kunchenguid/compact-adviser)
- 原リポジトリ：https://github.com/kunchenguid/compact-adviser
- ライセンス：MIT
- 日本語翻訳と UI ローカライズ：claude-code-mods-ja プロジェクト
