# Claude Code Filetree

> 日本語版は claude-code-mods-ja プロジェクトによる翻訳です。原作者とライセンスは文末を参照してください。原文は [README.en.md](README.en.md) をご覧ください。

一个 Claude Code 的 IDE 风格文件树，显示 Claude 正在做什么、在哪一个文件里。

主要特性：显示/导航目录内所有文件（支持 Git 状态、nvim 键位）；动画显示 Claude 正在读取/工作的位置；用 z 导航目录、s/i 搜索、q 搜索文件内容、d 做 diff；文件预览、目录大小矩形图。

## 安装

```bash
claude plugin marketplace add data-goblin/claude-code-filetree
claude plugin install filetree@claude-code-filetree
```

在低于 2.1.287 的 Claude Code 上会报 `Unrecognized key: "options"`：先 `claude update` 再安装。

## 出处与许可证

- 原作者：[data-goblin](https://github.com/data-goblin/claude-code-filetree)
- 原仓库：https://github.com/data-goblin/claude-code-filetree
- 许可证：MIT
- 日本語翻訳と UI ローカライズ：claude-code-mods-ja プロジェクト
