# tokendoctor

> 日本語版は claude-code-mods-ja プロジェクトによる翻訳です。原作者とライセンスは文末に記載されています。原版の README は [README.en.md](README.en.md) をご覧ください。

同じ Claude Code で、最大 38% の削減。

過去の自分のセッションを再生して各変更でどれだけ節約できたかを示し、選んだ変更だけを適用します。

**判断するのはあなた自身の過去セッションです。他人のベンチマークではありません。** 設定でどれだけ節約できるかは、セッションの長さ、使うモデル、作業内容といったあなたの働き方次第です。

- ① 過去 30 日を振り返る：`/tokendoctor:sessions` が各セッションをリクエスト単位で 200K/300K/400K/600K のコンパクトウィンドウで再生し、それぞれのコストを表示します。読み取り専用で、モデル呼び出しも変更も行いません。
- ② 自分のセッションで効果が出たものだけを変更：`/tokendoctor:optimize` がその数字をもとに変更を提案し、選んだものだけを適用します。適用前に diff で表示します。`/tokendoctor undo` で元に戻せます。
- ③ 任意：要約の代わりにスライド。Claude Code が会話を要約しようとするとき、古いツール出力を破棄して各メッセージは残します。モデル呼び出しはなく、数ミリ秒で完了します。

## インストール

```bash
claude plugin marketplace add localixai/tokendoctor
claude plugin install tokendoctor@tokendoctor
```

Claude Code を再起動して `/tokendoctor:sessions` を実行してください。

## 出典とライセンス

- 原作者：[localixai](https://github.com/localixai/tokendoctor)
- 原リポジトリ：https://github.com/localixai/tokendoctor
- ライセンス：MIT
- 日本語翻訳と UI ローカライズ：claude-code-mods-ja プロジェクト
