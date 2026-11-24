# fast-jev-compaction

> 日本語版は claude-code-mods-ja プロジェクトによる翻訳です。原作者とライセンスは文末を参照してください。原文は [README.en.md](README.en.md) をご覧ください。

一个 Claude Code 插件，用 Jev 的判定取代压缩摘要：每次工具调用与结果都在一次快速请求中打分，陈旧的被丢弃或截断，保留下来的逐字不变。也可作为 npm 库使用。

多数上下文压缩会让 LLM 总结旧回合，而摘要是有损的：文件路径、精确报错、约束或命令可能消失。本库从不重写任何内容，只删除 Jev 判定不再需要的工具调用与结果。

工作原理：每个 tool_use 与 tool_result 按 tool_use_id 配对；发给 Jev 的状态是完整对话，工具结果替换为简短说明；状态分阶段拟合进 maxStateTokens；对每个未固定调用问 Jev 两个问题（调用是否保留、结果是否逐字保留）；按阈值决定保留/截断/移除；最后重建消息列表。

## 安装

```sh
npm install fast-jev-compaction
export TYPESAFE_API_KEY=...
```

## 出处与许可证

- 原作者：[tamaratran](https://github.com/tamaratran/fast-jev-compaction)
- 原仓库：https://github.com/tamaratran/fast-jev-compaction
- 许可证：MIT
- 日本語翻訳と UI ローカライズ：claude-code-mods-ja プロジェクト
