# terminal-browser Claude Code プラグイン（日本語版）

> 日本語版は claude-code-mods-ja プロジェクトによる翻訳です。原作者とライセンスは文末に記載されています。原版の README は [README.en.md](README.en.md) をご覧ください。


> このプラグインは実験的なもので、[既知の制限](#注意事項)があります。

https://github.com/user-attachments/assets/a79e7667-6fcb-49a4-9967-44d0f942102c

## インストール

terminal-browser をインストールします：
```
curl -fsSL https://terminal-browser.sh/install | bash # または brew install terminal-browser
```

Claude Code が最新版であることを確認します：
```
claude update
```

Claude Code の UI プラグインを有効にするため、`~/.claude/settings.json` に以下を追加します：
```json
{
  "env": { "CLAUDE_CODE_ENABLE_FUNCTION_HOOKS": "1" }
}
```

terminal-browser プラグインをインストールします：
```
# marketplace を設定
claude plugin marketplace add zenbu-labs/terminal-browser

# プラグインをインストール
claude plugin install terminal-browser@terminal-browser
```

これで Claude Code 内で "/browser" を実行するとブラウザが開きます。

### 更新

Claude Code プラグインを更新します：
```
claude plugin update terminal-browser@terminal-browser
```

terminal-browser を更新します：
```
terminal-browser upgrade
```

### 設定

Claude がブラウザを開くためのツールをプラグインに含めるよう設定できます。この機能はデフォルトでは無効です。Claude は `terminal-browser` CLI を使ってターミナルの分割ペインでブラウザを開けるためです。有効にするには `~/.claude/settings.json` に以下を追加してください：

```json
{
  "pluginConfigs": {
    "terminal-browser@terminal-browser": {
      "options": {
        "agentTool": true
      }
    }
  }
}
```

## terminal-browser プラグイン API

このプラグインには、別の Claude Code プラグインからプログラムでブラウザを開いて URL を読み込むための API が付属しています。これを使って作れる便利なプラグインの例：
- `/tldraw` スラッシュコマンド：Claude Code の分割ペインで tldraw を開く
- `/open-pr` スラッシュコマンド：作業中のブランチに関連する PR を開く

```typescript
export type BrowserOpenInput = { url?: string }

export type BrowserOpenResult =
  | { ok: true; url: string }
  | { ok: false; error: string }

export type Browser = {
  open: (input: BrowserOpenInput) => Promise<BrowserOpenResult>
  close: (input?: Record<string, never>) => Promise<boolean>
}

// 使用例：プラグインの hooks モジュール内で
on('command.run', { command: 'tldraw' }, async ($) => {
  const result = await $.browser.open({ url: 'https://www.tldraw.com/' })
  return { text: result.ok ? 'tldraw を開きました' : result.error }
})
```

## 仕組み

terminal-browser は [kitty グラフィックプロトコル] を使い、実際のブラウザが生成したピクセルをターミナル内に表示します。Claude Code 内でブラウザを表示するために、Claude Code の新しい[関数フック API](https://github.com/anthropics/claude-code/issues/91870) を使用しています。

terminal-browser の内部実装は JavaScript ライブラリとして切り出されています —— https://github.com/zenbu-labs/terminal-browser/tree/main/pixel —— Claude Code やターミナル内でグラフィックアプリを作りたい場合に参考にできます。

## サポートされるターミナル

このプラグインは、[kitty グラフィックプロトコル] に対応し、[kitty unicode placeholders](https://sw.kovidgoyal.net/kitty/graphics-protocol/#unicode-placeholders) を実装したターミナルでのみ動作します。対応している主なターミナル：
- [ghostty](https://ghostty.org)
- [kitty](https://sw.kovidgoyal.net/kitty/)

必要な機能に対応していないターミナルで Claude Code 内からブラウザを開こうとすると、TUI が崩れる可能性があります。

libghostty をベースにしたターミナルもすべて対応しています。例：
- [cmux](https://cmux.com/)
- [supacode](https://supacode.sh/)

その他の libghostty ベースのターミナル：[awesome-libghostty](https://github.com/Uzaaft/awesome-libghostty)

ターミナルがグラフィック機能に対応していても、マルチプレクサを使っているとプラグインが動作しないことがあります。マルチプレクサはターミナルプログラムの出力を書き換えてターミナルのグラフィックコマンドを壊すためです。tmux のサポート間もなく（terminal-browser は現在 tmux 内では動作しますが、Claude Code プラグイン経由ではまだ動作しません）。herdr ではプラグイン経由の性能が非常に悪いですが、近く改善されるかもしれません。他のマルチプレクサは未テストです。動作しない場合は issue を起票してください。

## 注意事項

- [kitty グラフィックプロトコル] に対応するターミナルが必要
- Claude Code がピクセル座標のマウス報告を有効にしないため、マウス位置がわずかにずれることがある
- プラグインは CLI と通信するためにローカルの HTTP サーバーへ fetch リクエストを送る必要があり、OS からターミナルがローカルネットワークにアクセスしようとしているという通知が出る場合がある
- Claude Code はチャット領域の最小幅を大きく設定しているため、ブラウザを希望のサイズに変更できないことがある
- プラグインは不安定な実験的関数フック API に依存しているため、バージョン間で動作が壊れる可能性がある

[kitty グラフィックプロトコル]: https://sw.kovidgoyal.net/kitty/graphics-protocol/

## 出典とライセンス

- 原作者：[zenbu-labs](https://github.com/zenbu-labs/terminal-browser)
- 原リポジトリ：https://github.com/zenbu-labs/terminal-browser
- ライセンス：MIT
- 日本語翻訳と UI ローカライズ：claude-code-mods-ja プロジェクト
