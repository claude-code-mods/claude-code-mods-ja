# Agent Standup band

![Agent Standup](.claude-plugin/icon.png)

このコンピュータ上の別の Claude Code セッションがあなたの対応（承認や回答）を必要としているとき、Claude Code のプロンプトの上に一行を表示します：

    ✋ web-shop (VS Code) が承認を待っています
    Agent Standup · /agent-standup:open で一覧表示   非表示

また、別のセッションがあなたを待ち始めたとき、またはそのターンを終えたときに短いトーストを表示します。作業中のセッションを離れることなく、別のセッションが質問や承認で止まっていることを把握できます。

これは mod です：Claude Code の関数フックによるプラグインです。ターミナルと Claude デスクトップアプリの Code タブに表示します。VS Code では [Agent Standup 拡張機能](https://marketplace.visualstudio.com/items?itemName=DoubleGeste.agent-standup) がステータスバーに同じ内容を表示します。

## インストール

Claude Code 2.1.294 以降：

    /plugin install agent-standup-band --marketplace Atoll92/agent-standup

それより前のバージョンでは読み込まれても何もしません：それらのバージョンは mod を実行しません（また、ターミナルでは 2.1.221 より前、それ以外では 2.1.269 より前のバージョンでは、読み取るステータスも書き出されません）。

すべてのセッションをライブのチームコールとして表示するには、メインプラグインもインストールしてください：`/plugin install agent-standup --marketplace Atoll92/agent-standup`、その後 `/agent-standup:open`。

## 読み取るものと実行すること

- 4 秒ごとに、開いている各セッションについて Claude Code が保持するステータスファイル `~/.claude/sessions/<pid>.json`（または `CLAUDE_CONFIG_DIR` 配下）：どのセッションか、そのフォルダ、そしてビジー／アイドル／あなたを待っているか。会話は読み取りません。`claude -p` で起動されたプログラムによるセッションは除外されます（質問はそのプログラムに届くため）。Agent SDK アプリ（Zed や自作アプリ）は保持されます（メニューを人に表示する可能性があるため）。
- `ps`：待機中と報告されたセッションがまだ実行中かを確認します。クラッシュしたセッションはファイルを残します。

何も書き込まず、どこにも何も送信しません。

## 詳細

ソースと Issue：https://github.com/Atoll92/agent-standup。非公式：Anthropic とは提携も推奨もされていません。MIT ライセンス。

- 日本語翻訳と UI ローカライズ：claude-code-mods-ja プロジェクト
