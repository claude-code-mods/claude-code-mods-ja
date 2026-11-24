# compact-adviser

> 日本語版は claude-code-mods-ja プロジェクトによる翻訳です。原作者とライセンスは文末を参照してください。原文は [README.en.md](README.en.md) をご覧ください。

在完成的检查点建议（或在选择加入后自动执行）`/compact`，由 TypeSafe Jev 判定。其 hooks 模块仅在 `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS` 恰为 1 时激活。

## 安装

```sh
claude plugin marketplace add kunchenguid/compact-adviser
claude plugin install compact-adviser@compact-adviser
CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1 claude
```

然后运行 `/compact-adviser`。

## 出处与许可证

- 原作者：[kunchenguid](https://github.com/kunchenguid/compact-adviser)
- 原仓库：https://github.com/kunchenguid/compact-adviser
- 许可证：MIT
- 日本語翻訳と UI ローカライズ：claude-code-mods-ja プロジェクト
