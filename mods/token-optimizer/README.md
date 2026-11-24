# Token Optimizer デスクトップ版

> 日本語版は claude-code-mods-ja プロジェクトによる翻訳です。原作者とライセンスは文末を参照してください。原文の README は [README.en.md](README.en.md) にあります。

Claude デスクトップアプリ用のステータスバーです。プロンプト行の上に描画され、セッションの品質、コンテキストの埋まり具合、キャッシュのカウントダウン、5 時間と週次の上限を表示します。Clawd がセッションの進行状況を演じます。

## インストール

Token Optimizer プラグインに同梱されています（`hooks/hooks.json` の `modules` にこのフォルダーの `hooks/register.tsx` が記載されています）。追加でインストールするものはありません。このフォルダーが独自のマニフェストを持つのは、テストを `claude plugin test` で単独実行できるようにするためだけです。`npm run typecheck` と `npm test` は純粋なモジュールを対象とし（CI で実行）、`npm run typecheck:engine` は `hooks/` と `tests/engine/` を Claude Code のプラグイン API 宣言に対して検査します。この宣言は claude CLI だけが書き出すため、この検査はローカルで実行します。

Claude Code 2.1.287 以降と Anthropic の mod 機能が必要です。Anthropic は mod をリモートで無効にできますが、その場合もエラーは発生せず、バーが表示されなくなるだけです。端末のステータス行はそのまま残ります。VS Code はサポートされていません。

有効かどうかを確認するには、Token Optimizer プラグインを有効にした Claude デスクトップセッションを開き、プロンプト行の上に Clawd とキャッシュのカウントダウンが付いた Token Optimizer のバーを探してください。表示されない場合は、プラグインが有効であること、mod が利用可能であること、`TOKEN_OPTIMIZER_STATUS_BAR` が `0` でないことを確認してからセッションを再起動してください。プラグインの `hooks/hooks.json` が登録しているのは `desktop/token-optimizer-desktop/hooks/register.tsx` です。

自分のセッションを使わずに記録処理を確認するには、`python3 <plugin>/skills/token-optimizer/scripts/measure.py mod-action --selftest` を実行してください。`PASS` または `FAIL` が表示され、一時データディレクトリが使用されます。失敗したアクションの診断情報は、Token Optimizer のデータディレクトリにある `mod-actions.log` に記録されます。

## 表示されるもの

- 最も優先すべきことについての一文と、最大 one 個のボタン。
- ホバーカード付きの 5 つの指標：品質等級、コンテキストの埋まり具合、キャッシュのカウントダウン、5 時間の上限、週次の上限。
- **Clawd の隣の矢印**を押すと、もう 1 行展開されます：ブランチ、セッション時間、ツール呼び出し回数、コンパクション（発生した場合）、最後にチェックポイントが保存された時刻（種類を問わない、または以前のセッションの関連するチェックポイント）、そして過去 30 日間に Token Optimizer が節約したトークン数（ダッシュボードの合計と同じ値）。
- ボタン：**片付け**（Token Optimizer の指針に従ってコンパクト化）、**新しく始める**（2 回目のクリックでチェックポイントを保存してクリアし、最初のメッセージに引き渡します）、**温熱維持**（手動のワンクリックでキャッシュを更新。キャッシュが温かいときだけ利用でき、自動では実行されず、少量の利用量を消費します）。
- **完全なダッシュボード**：展開された行の末尾にあるプレーンテキストのリンクで、2 種類のバーサイズに表示されます（折りたたまれたバーには表示されません）。クリックすると `measure.py dashboard` が実行され、`token-dashboard` スキルと同じコマンドでダッシュボードのページを再生成して既定のブラウザーで開きます（macOS では `open`、Linux では `xdg-open`、Windows ではファイル関連付け）。実行中はバーに「ダッシュボードを開いています。」と表示され、失敗すると数秒間「ダッシュボードを開けませんでした。」と表示され、それ以外には何も起こりません。実行中の 2 回目のクリックは無視されます。このリンクは `plain` スタイルで描画されたボタンです（その prop は Claude Code 2.1.287、2.1.294、2.1.296 のエンジンの Button 許可リストに含まれており、各ビルドの文字列から読み取られます。実行は 2.1.294 から 2.1.296 で確認されています）。クリックすると `measure.py dashboard --user` が実行されます。`--user` は人のクリックであることを示し、20 秒のフック時間制限で重い再生成が中断されないようにします（実際の重い履歴ではコールドスタートに約 80 秒かかります）。バーは最大 5 分間待ちます。これだけが長く待つリンクです。「片付け」と「新しく始める」は引き続き 2 分で諦めます。

キャッシュのカウントダウンは推定値です。Claude プランでは 1 時間、API では 5 分で、可能な場合はセッション自体から計測します。

## 設定

`~/.claude/settings.json` の `env` ブロックで、`TOKEN_OPTIMIZER_STATUS_BAR=0` はバーを非表示にし、`TOKEN_OPTIMIZER_STATUS_BAR_ANIMATE=0` は Clawd を動かさないようにします。`TOKEN_OPTIMIZER_STATUS_BAR_TIME_FORMAT=24h`（または `12h`）は上限の更新時刻に使う時計形式を固定します。未設定の場合はロケールに従います。

矢印の隣の `–` ボタンでバーを 1 行に縮小し、`+` で元に戻せます。矢印は下の詳細行を相変わらず展開でき、選択はセッションと再起動をまたいで記憶されます。`TOKEN_OPTIMIZER_STATUS_BAR_SIZE=slim` は選択が保存される前の初期サイズを設定します。端末のステータス行も同じ変数を使って 1 行で出力します。

コンテキストの指標は、圧縮ウィンドウを設定している場合はその独自のウィンドウに対して計測します：`CLAUDE_CODE_AUTO_COMPACT_WINDOW`、`/autocompact`、または `autoCompactWindow` 設定で、Claude Code の 100K〜1M の範囲内かつモデルのウィンドウ以下です。起動ごとに `--autocompact` だけで指定したウィンドウは参照できません。

## 完全なドキュメント

[Token Optimizer の README](../../README.md#desktop-status-bar) とドキュメントサイトの「Claude desktop app」のページを参照してください。

CLI 経由で「温熱維持」の試行を予約するには、標準入力に JSON の受領書を送ります：

```bash
printf '%s' '{"action":"warm-prepare","action_id":"ATTEMPT_ID","session_id":"SESSION_ID","timestamp":UNIX_SECONDS,"transcript_path":"/path/to/SESSION_ID.jsonl","byte_size":FILE_SIZE,"transcript_mtime":FILE_MTIME}' | python3 <plugin>/skills/token-optimizer/scripts/measure.py mod-action
```

プレースホルダーを、現在のトランスクリプトの正確なファイルサイズと更新時刻、一意の試行 ID、現在の Unix 時刻に置き換えてください。応答は JSON です。これで予約が確保されます。呼び出し側は実際にウォーム要求を実行してその利用量を `warm` 受領書として送信するか、実行しない場合は `warm-cancel` を送る必要があります。

## 出典とライセンス

- 原作者：[alexgreensh](https://github.com/alexgreensh/token-optimizer)
- 元リポジトリ：https://github.com/alexgreensh/token-optimizer
- ライセンス：NOASSERTION（詳細は元リポジトリを参照）
- 日本語翻訳と UI ローカライズ：claude-code-mods-ja プロジェクト
