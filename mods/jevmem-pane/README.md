# jevmem pane

> 日本語版は claude-code-mods-ja プロジェクトが翻訳、原作者とライセンスは文末。原版 README は [README.en.md](README.en.md)。

[jevmem](https://github.com/Avinash-jetwani/jevmem) が、あなたが送信したばかりのプロンプトと、終わったばかりのターンで何をしたかを表示する、Claude Code のチャット横にあるサイドパネルです：

1. **このプロンプトの想起内容**：Claude に提供されたメモリ行（id、種類、テキスト）それぞれと、未使用として保持された行数。
2. **ガード**：ガードが最後に問い合わせたり拒否した呼び出し。ルールとスコアを添え、その呼び出しに対応付けます。
3. **前のターンで保存された内容**：jevmem がそのターンで保存した行とその種類、またはそのターンがスキップされた理由。

各行には `why`（なぜ）、`wrong`（間違い）、`forget`（忘れる）ボタンがあります。`forget` と `wrong` は `JEVMEM.md` を変更します（行は `[retired]` として保持されるため）、まず確認を求めます。ルールはターミナルでのみ退役できます。`jevmem trust` がそのように動作するためです。パネルは `.jevmem/` の 3 つのローカルファイルを読み取り、`jevmem` コマンドを引数ベクトルで実行します。データをどこにも送信せず、どのシークレットも読み取りません。

## インストール

`claude plugin marketplace add Avinash-jetwani/jevmem` で jevmem マーケットを追加済みの Claude Code で：

```
/plugin install jevmem-pane@jevmem
```

`npm install -g jevmem` による jevmem コマンドと、`jevmem setup` で有効化されたプロジェクトが必要です。幅 144 列以上のターミナルではパネルが自動的に開きます。`/jevmem` は任意の幅で開閉できます（フルスクリーンターミナルでは 110 列以上でチャット横にドッキング、それより狭い場合はプロンプト行の上）。Claude Code のみサポート：Cursor にはパネルはありません。

完全な説明（各状態の意味を含む）は [docs/pane.md](https://avinash-jetwani.github.io/jevmem/pane/) をご覧ください。

## 出典とライセンス

- 原作者：[Avinash-jetwani](https://github.com/Avinash-jetwani/jevmem)
- 原リポジトリ：https://github.com/Avinash-jetwani/jevmem
- ライセンス：MIT
- 日本語翻訳と UI ローカライズ：claude-code-mods-ja プロジェクト
