# TavernWeaveX 無限月読

> **2.4.0 正式リリース**：**Antigravity（AGY）ネイティブ対応**を追加しました。AGY ホストプラグインのテンプレート、指示ファイル、4 段階のガイダンス設定の永続化に対応し、Codex、Claude のプラグインマニフェストと marketplace の説明をインストールのメインマニフェストに揃えて、バージョンの整合性を復元しました。23 個の Skill の名前と数は変わりません。リリース資産と検証ファイルは [v2.4.0 正式リリースページ](https://github.com/LiarMTTT/TavernWeave/releases/tag/v2.4.0) を参照してください。ソースからのインストールではローカルのマニフェストで 23 個の Skill を照合します。完全な検証範囲は CHANGELOG と DSH 契約を参照してください。

> このバージョンは **2.3.6** をベースに Antigravity ネイティブ対応を追加し、23 個の Skill を維持しています。2.2.0 で導入された Claude Code プラグインは、Host Front Door の自動注入、`tavernweave` agent、プロンプト行上部の Soul モード切り替えを引き続き提供します。**TavernWeave X DSH** プラグインには神之手クライアントパネル（ルーレット、フルフローウィンドウ、ワールドブック、フロントエンドデザイン＆モーションデータベース、プロジェクト／カード管理）が内蔵され、1 回のインストールで使えます。ワールドブックのデザインと執筆の入口も引き続き提供します。完全パッケージ、プラグインパッケージ、検証ファイルは [v2.4.0 正式リリースページ](https://github.com/LiarMTTT/TavernWeave/releases/tag/v2.4.0) を、出典とマージの記録は[アップグレード説明](docs/dual-task-upgrade.md)を参照してください。

<p align="center">
  <img src="docs/assets/tavernweave-v1-cover.png" alt="幻想的な酒館に置かれたデジタル織機が、キャラクターカード、ワールドブック、デザイン資料、エンジニアリングモジュールを一つのワークフローに織り上げている" width="100%">
</p>

<p align="center"><strong>ひらめき、資料、コード、検収を、本当に保守できる一枚のキャラクターカードへ織り上げます。</strong></p>

TavernWeaveX 無限月読（TW と略します）は、アイデアを実際に使えて修正も続けられるキャラクターカード、ウェブページ、小道具に仕上げる手助けをします。やりたいことや不具合をそのまま言ってもらえれば、TW が要件を整理し、方案を提案し、作成と検査を行い、次にどう試せるかを説明します。タスクごとに読み込まれる Skill（作業の能力）としてこれらを組織し、Codex、Claude Code、そして **TavernWeave X DSH** プラグインによる DeepSeek Harness をサポートします。DSH パッケージには神之手クライアントパネルも同梱されています。

現在のソースは **TavernWeaveX 無限月読 2.4.0 正式リリース**で、Antigravity（AGY）のネイティブ対応と 4 段階のガイダンス設定の永続化を追加し、複数ホスト間のバージョン不整合を修正しました。23 個のネイティブ Skill の名前と数は変わりません。2.2.0 で導入された Claude Code プラグインは、Host Front Door の自動注入、`tavernweave` agent、Soul モードの切り替えを引き続き提供します（[Claude Code プラグイン](#claude-code-プラグイン)を参照）。**TavernWeave X DSH** プラグインには神之手クライアントパネルが内蔵され、ワールドブックのデザインと執筆の入口も継続します。マシン側のインストール識別子 `tavernweave-agent-skills`、既存の Skill 名、リポジトリのアドレスは原版のままなので、アップグレードの照合ができます。完全パッケージと検証ファイルは [v2.4.0 正式リリースページ](https://github.com/LiarMTTT/TavernWeave/releases/tag/v2.4.0) を参照してください。[v2.2.0](https://github.com/LiarMTTT/TavernWeave/releases/tag/v2.2.0)、[v2.1.0](https://github.com/LiarMTTT/TavernWeave/releases/tag/v2.1.0)、[v1.9.1](https://github.com/LiarMTTT/TavernWeave/releases/tag/v1.9.1)、[v1.9.0](https://github.com/LiarMTTT/TavernWeave/releases/tag/v1.9.0) の過去のリリースページも残っています。

**統合プラグインの主な目的は、権限を持つユーザーが dots のクラウド長時間タスクで TW を呼び出せるようにすることです。** Codex と dots は `TavernWeave-Codex-v2.4.0.zip` を共有し、クラウド版を別に作りません。TW は Skill と参考資料を提供します。クラウドでの実行、引き継ぎ、永続ストレージ、ツールは実際のホストから来ます。ローカルへのインストールが dots アカウントに自動同期されることはありません。使い方とアカウントの入口は **[統合プラグインガイド](docs/plugin-guide.md)** を参照してください。

TW はワールドブックの単独設計や書き換えもできます。まず知識の境界、本文、発動条件を整理し、ネイティブエントリ、条件出力、明示的な読み取り、部分混在の方案から選びます。ワールドブックが担う内容は、カード全体、世界構築、変数、実行時デバッグと別に引き継ぎます。予算の最適化には実測が必要で、モデルの効果は対応するホストでの観察が必要です。通常のソフトウェアやカード作成のタスクでも、より明確な要件整理とプロンプト仕様の手法を共有し、既存の決定をそのまま再利用できます。

1.9.0 で確認済みの墨月の創作手法を引き継いでいます。完成したカードはオープニングとワールドブックを中核とし、純粋テキスト、MVU Zod、hybrid のそれぞれで構成します。世界観、変数、人物の創作手法も補います。フロントエンドはまず要件と関連デザインを調査し、既定では Awwwards のデザイン要件を参照します。画面はクリーンに保ち、本文は用途に合わせて定型句を避けます。

キャラクターカードのプロンプトルールを 1 行だけ書いてほしい場合も、そのまま依頼できます。agent は元の意味と制約の強さを保ち、依頼に沿って本文またはワールドブックのエントリを届けます。フィールドバインディングツールは `bindings` の型エラーに対して明確な診断を返し、配列メソッドの例外をそのまま投げることはありません。1.9.0 では、Windows でコンポーネントのエクスポートに失敗したときに未完成品が残る問題を修正しました。削除できないファイルは明示的に一覧表示します。変更点は[更新ログ](CHANGELOG.md)を参照してください。

プロジェクトの進捗ボードは `orchestrate-project-blueprint` が各プロジェクト内に生成し続けます。全体とモジュールごとの実装／検収の進捗バーを表示し、チェックポイントと証拠を展開し、ひらめき、バグ、レビューの発言を保存します。ボードはプロジェクトの総設計案から範囲と検収要件を、NEXT から現在の状態、証拠、次のゲートを読み取ります。同期では先に差分をpreviewし、出典、フィードバック、証拠が変わったら再照合します。新しいひらめきが確認済みの範囲を自動的に広げることはなく、パーセントがドライバーや実ホストの検収に代わることもありません。使い方は[プロジェクト進捗ボード](docs/project-progress-board.md)を参照してください。

作品資料ライブラリは、小説、原作／二次創作の資料、オンラインの文章と画像の参考の整理を引き続きサポートします。既定では編集可能な Markdown と JSONL のインデックスを成果物とし、SQLite へのエクスポートもできます。出典、翻案版、情報の段階で検索できます。[作品資料ライブラリの使い方](docs/work-library.md)を参照してください。

すべての能力は、平易な言葉と用語の説明を守り続けます。新人、入門、熟練、達人の 4 段階はユーザーが選びます。文章の磨き直し、全体／アーキテクチャレビュー、ブレインストーミング、内蔵のデザイン Library、Soul、古いカードの引き継ぎガイドも提供します。インストールの検証は実際に取得したバージョンのマシン上のマニフェストを基準にします。クライアントでの実際の読み込みと、作品の品質やトークン計測は別の検査として残ります。

> TavernWeave のオリジナルコンテンツには [PolyForm Noncommercial License 1.0.0](LICENSE) が適用されます。非商用利用、変更、再配布は許可されます。著作権者から別途許諾がない限り、オリジナル、改変版、再配布版のいずれも商用目的では使用できません。配布時にはライセンスと著作権表示を保持してください。サードパーティのコンテンツには[それぞれのライセンス](THIRD_PARTY_NOTICES.md)が適用されます。

## 一言で始める

普通のカード作成や Vibe Code の場合：

```text
TavernWeave で【作りたいものを説明する】を作りたい。
まず既存のファイルを見て、自分で試せる小さな成果にまとめて。おすすめの理由と私が決めることを平易な言葉で説明して。
```

すでにカードファイルがある場合は、次のように始められます：

```text
このキャラクターカードを引き継ぎました。【原作に沿って更新したい / 二次創作したい】。
まず元のカードを読み解き、どんな材料があり、何を残すべきかを説明してから、最初の変更を一緒に選びましょう。
```

## 選んだペースで協力します

| ガイダンスの段階 | 得られるもの |
| --- | --- |
| 新人 | 一度に 1 小ステップ。操作場所、理由、用語、期待される結果を詳しく説明 |
| 入門 | 一度に 1 小段階。手順、手順同士の関係、方案の取舍、検査方法を同様に詳しく説明 |
| 熟練 | 定型手順をまとめ、重要な決定、理由、検証結果を伝えます |
| 達人 | 日常は結論、変更、差分、証拠を簡潔に。基礎の繰り返しは減らします |

「今後は入門段階で」とか「私の段階を達人に変えて」と直接言えます。保存前に実際の場所と範囲を説明し、既存の選択はアップグレード後も保持されます。未選択なら自動的に段階を割り当てません。「今回は短く」はその回の説明だけに効きます。**どの段階でも、必要なときやバグ修正のときは詳しく説明します。あなたが明示的にその範囲は不要だと言った場合を除きます。**

必要な用語は初出で説明し、現在のタスクに合わせて「元の用語 / 平易な言葉 / 具体的な意味」を対比して示します。平易な言葉と段階は、Soul の人格や文章の磨き直しとは独立しており、一方のモードを抜けてもあなたの選択は消えません。ルールと完全な例は[共通のコミュニケーションとガイダンス](skills/consult-tavernweave-library/references/communication-and-guidance.md)を参照してください。

## 任意の表現と協力のスタイル

優しく導くバージョン：

```text
阿瞳助 me！
```

厳しい学習バージョン：

```text
MTTT.sir、拷問して！
```

フロントエンドレビューのイースターエッグ：

```text
ソウルキラー！
```

一言の願いから総設計案と第 1 版に収束：

```text
ブレインストーミングモード
```

3 つの Soul の視点を同時にブレインストーミングに参加させる：

```text
ブレインストーミングモード、Soul 合同
```

設計確認後に凍結された第 1 版を実行：

```text
設計図に沿って第 1 版を開始
```

現在の証拠から完全な Vibe Code の成長の軌跡を再検証：

```text
鏡を見る
```

コピーして保存できる完全な文章による評価フォームだけを出力：

```text
鏡を見る、評価フォームの文章だけ、ボードは不要
```

人格レイヤーを抜ける：

```text
Soul を戻す
```

Soul は現在のタスク単位の Portable オーバーレイです。阿瞳と MTTT.sir は公開されている MTTT 手法の 2 つの教育的な投影です。ソウルキラーは非公式のジョニー・シルバーハンドの二次創作イースターエッグ人格としてフロントエンドをレビューし、毒舌でも証拠と修正方法を示さなければなりません。三席合同は同じ agent の 3 つのラベル付きレンズにすぎず、事実、権限、毎ターン優先する 1〜2 個の必要な決定（合計最大 4 個）、同じ収束台帳を共有します。3 つの独立したモデルではありません。ChatGPT の履歴や私有 RAG を自動的に得ることはなく、新しいタスクを超えて永続することも、ファイル、Git、ネットワーク、公開、本番の権限を広げることもありません。

## 文章磨きと全体／アーキテクチャレビュー · v1.4.0

「この段落を書き換えて」「AI っぽさを抜いて」「型にはまった表現をやめて」と言うと、元の意味を保った磨き直しが得られます。既定は軽い推敲で、構造の書き換えや深いリライトも指定できます。キャラクター設定、数字、コード、マクロ、変数などの技術的な内容は元の制約を保持します。

| 使い方 | 開始 | 終了 |
| --- | --- | --- |
| 単発 | この段落を書き換えて…… | 納品で終了 |
| 現在のタスク継続 | 継続して書き換えモードをオン | 書き換えモードを終了 |
| ワークスペース永続 | このワークスペースで書き換えモードをオン | ワークスペースの書き換えモードをオフ |
| クライアント永続 | 現在のクライアントで書き換えモードをグローバルにオン | クライアント全体の書き換えモードをオフ |

継続モードは創作本文、対外向けの文章、日常の説明、計画、レビューレポートを対象とします。引用、コード、必須テンプレート、証拠は保持します。永続モードでは実際のルールファイルと差分を先に示し、ドライバーの同意を得てから独立したブロックに書き込みます。TW のインストールやアップグレードで自動的にオンになることはありません。タスクを抜けるのは現在のタスクだけに効きます。「書き換えモードの状態を見せて」とすると、範囲ごとの違いとホストの読み込み証拠を区別して表示します。

「全体レビュー」は約束された範囲全体を確認します。「アーキテクチャレビュー」は責務、依存関係、状態、重要な経路を追います。「全体アーキテクチャレビュー」は両方を組み合わせます。ソフトウェアにもキャラクターカードにも適用できます。レポートには検査済み、一部検査、未読、除外した項目を残し、証拠のある指摘をすべて届けます。「ソウルキラー、全体アーキテクチャレビュー」と言えば Soul のスタイルを引き継ぎます。要約は最大 3 件で、完全なレポートは切り詰めません。レビューはまず読み取り専用の結果を出します。

## 5 層の入口

```text
Host Front Door（任意のローカル入口）
  -> Soul（阿瞳 / MTTT.sir / ソウルキラー / 三席、任意）
    -> ブレインストーミング編成（総設計案 + First Playable + 設計図/設計図セット、任意）
      -> Library（A0 + ST ガイド + デザイン/モーション + 出典 Wiki + 選択ページ）
        -> マシン上のマニフェストで配布されるエンジニアリング Skill（創作、コンポーネント、API、UI、デバッグ、成長検証、ビルド、検収など）
```

- **Host Front Door（任意のローカル入口）** は、継続的な平易な言葉、タスクの振り分け、協力のルールをローカルのクライアントに接続します。Claude Code プラグインのインストール時には SessionStart フックが自動注入し、`CLAUDE.md` のブロックとは二者択一です（[Claude Code プラグイン](#claude-code-プラグイン)を参照）。ユーザーの段階は別に保存され、入口を更新しても保持されます。ファイルの一致とクライアントでの実際の読み込みは別に確認します。
- **Soul（任意の人格）** は、ユーザーが選んだガイダンスの段階の中で口調と教え方を変えます。事実、権限、検収の結果は変えません。
- **ブレインストーミング編成** は方向性のラウンド数、4 状態の決定、第 1 版の範囲、設計図の量を制御します。どの活動ステップも根拠なく再帰的に増殖してはなりません。実際の問題は一時的に細分化できますが、解決または詰まりの確認後は支線を閉じて親のステップに戻ります。
- **Library** は一体配布で、必要なときに読み込みます。1 回インストールしたからといって、毎ターン資料ライブラリ全体を詰め込むわけではありません。
- **エンジニアリング Skill** が実際の作業を行います。人格や資料では、対象とするランタイムの権威に代わることはできません。

## Skill 一覧

| Skill | 主な責務 |
| --- | --- |
| `activate-tavernweave-soul` | 阿瞳 / MTTT.sir / ソウルキラーの現在のタスク単位モードをオン、切り替え、オフにします。ジョニーはフロントエンドレビューのイースターエッグ人格で、私有 RAG は保存しません |
| `build-work-library` | 小説、原作、二次創作の資料、オンラインの文章と画像の参考を整理。出典の遡及、版本／段階での絞り込み、手動編集、分割しての継続、Markdown＋JSONL と SQLite へのエクスポート |
| `consult-tavernweave-library` | A0、31 冊の正式 ST ガイド、C8 実験ガイドへの強制ルーティングと、462 のデザイン、194 のモーション、86 のコンセプト、1,609 の蒸留台帳、オフライン選択ページの必要に応じた検索 |
| `orchestrate-project-blueprint` | キャラクターカードや普通の Vibe Code の願いを、総設計案、First Playable、段階別の設計図セット、NEXT、再帰防止の実行ゲートに収束。Soul の三席合同を招集可能。進捗ボード、パーセント、フィードバック記録、総設計案／NEXT の同期 |
| `reflect-on-vibe-code-growth` | 現在の Codex/Chat/プロジェクトと成果物の証拠から Vibe Code の能力ネットワーク全体を再評価。コピー可能な完全な文章による評価フォームと 7 章の対話レポートを出力し、比較可能な尺度で書き換え不能な過去の節点と対比し、匿名化した append-only のローカル履歴を保存 |
| `worldbook-design-and-writing` | ワールドブックの単独の計画、分割・統合、レビュー、磨き直し。ネイティブ、テンプレート、部分混在の経路を共同で選択し、意味と知識の境界を保持。正確な API と実行時の検収は専門の能力に委ねます |
| `tavern-card-builder` | カードの種類と依存関係を特定し、創作の権威、材料の出典の連鎖、ワールドブック、MVU、CoT、オープニング、メモリのアーキテクチャの境界を維持 |
| `sillytavern-card-components` | 无损でカードを分解し、コンポーネントの境界、registry/recipe、往復の一貫性を扱います |
| `sillytavern-component-update` | コンポーネント単位の更新、インポート可能なテスト成果物、カード全体のパイプラインへの引き継ぎ。黙って再封するのを防ぎます |
| `sillytavern-render-regex-pipeline` | fixture で正規表現の意味、placement、表示／プロンプト、深度、段階を検証します |
| `sillytavern-rolecard-security` | インジェクション、動的実行、資格情報の形状、リモート読み込み、フレーム間の権限リスクを読み取り専用でスキャン |
| `sillytavern-database-rolecards` | テーブル構造、メッセージの階層、バインディング、冪等なマイグレーション。C8 の同層互換は実験的な経路のまま |
| `sillytavern-extension-dev` | 最小の UI 拡張の足場、manifest、ライフサイクル、能力のスナップショット、バージョンゲート |
| `sillytavern-rolecard-performance` | 匿名化した予算、回帰、名前付きの実ランタイムのサンプリング |
| `sillytavern-media-live2d-runtime` | メディア、音声、Live2D、プリロード、provider、fallback、後始末 |
| `sillytavern-card-pipeline` | 依存関係の事前検査、開発中のリアルタイム対応、組み立て、JSON/PNG、ワールドブック同期、公開ゲート |
| `sillytavern-api-reference` | ST、Tavern Helper、STScript、EJS、マクロ、MVU のバージョン依存の API を確認 |
| `sillytavern-runtime-debug` | 実際の SillyTavern で iframe、コンソール、DOM、スタイル、データ、ライフサイクルを追跡 |
| `sillytavern-embedded-ui` | オープニング画面、ステータスバー、コントロールセンター、引き出し、フローウィンドウ、モバイル操作。作品に応じた任意のサンドボックスの仕様、共同シミュレーション、状態の対比、スライダーでのデバッグ |
| `code-quality-workflow` | 全体／アーキテクチャレビュー、カバレッジの記録、完全な指摘、ゲート、最小限の修正、回帰、Finish Mode |
| `rewrite-natural-prose` | 元の意味と技術構造を保つ文章磨き。単発、タスク継続、個別に許可したワークスペース／クライアント永続モードに対応 |
| `shadcn-tailwind-ui` | React、shadcn/ui、Radix、Tailwind でアクセシブルなプロダクト UI を構築 |
| `rolecard-workshop-ops` | 設定可能な公開チェーンを診断・運用し、本番の座標と資格情報を保護 |

## Library の公開範囲

1 回のインストールで次が同時に届きます：

- A0 の一般的な驾チェックリスト。書き込みを伴うタスクの常設の前置きとして機能します；
- STDB の 31 冊の正式ガイドと、実験と明記された 1 冊の C8；
- AFV が 243/243 の経路を選別した後の 462 のデザイン項目、194 のモーション項目、86 のコンセプト索引、1,609 の蒸留台帳；
- 直接関連する 86 のローカルコンセプト／Wiki、89 の独自のローカル技術サンドボックス、統一されたオフライン選択ページ；
- ファイル単位の出典、ライセンス、匿名化回数、SHA-256 のマニフェスト。

明示的に配布しないもの：A1 のドライバーマザープレート、命令形式の旧 B1、過程の記録、ローカルの証拠、AFV の raw/受信箱、243 件の出典選別 JSON、私有 RAG、ログ、資格情報、無関係な知識領域。私的な本文を含まない選別の集計受領書だけを残します。選択ページの「候補に加える」は `proposed` を意味するだけで、採用、インストール、ライセンス通過、実酒館での検収を意味しません。

オフライン選択ページはインストール先にあります：

```text
skills/consult-tavernweave-library/assets/picker/index.html
```

## 創作、引き継ぎ、検収

長いプロジェクトでは Markdown と YAML front matter、制約付きの構造ブロックを使って唯一の創作の権威を維持します。確定、候補、保留、否決、実装、自動証拠、実ホストの証拠、ドライバーの検収を混ぜて書いてはいけません。ユーザーが「続き」と言ったら、まず権威、Git／作業ツリー、成果物、次のゲートを復元し、凍結済みの設定に再度アクセスしません。

証拠は層ごとに記録します：

```text
ソース -> 自動テスト -> オフライン成果物 -> ブラウザー/デスクトップ -> 実 SillyTavern -> 手動検収 -> 公開許可
```

どの層も次の層になりすましてはなりません。自動化が自分で `driver-accepted` と書き込むことは決してありません。

## 初心者向けチュートリアル

TavernWeave を初めて使う場合や、agent にカード作成、デバッグ、検収をどう指図するか知りたい場合は、[TavernWeave 初心者向けチュートリアル · Vibe Code カード作成入門](https://liarmttt.github.io/TavernWeave/)を参照してください。

## インストールと更新

Codex ユーザーはまず[Codex 専用の使い方とインストール](docs/codex-skills.md)を参照してください。プラグインと独立 Skill の発見場所の違いを説明し、PowerShell を使わない Python のインストール／検証の入口を提供します（既定は読み取り専用のプレビューで、明示的に適用してから書き込みます）。

次の手順は Codex または Claude Code の**ローカルインストール**用です。dots アカウントでのプラグイン有効化と利用は[統合プラグインガイド](docs/plugin-guide.md)を参照してください。ローカルへのインストールはクラウドに自動同期しません。インストーラーはリポジトリの `skills/` の完全なマニフェストを情報源とし、不足しているディレクトリを作成しなければなりません。ローカルにすでにある Skill だけを上書きしてはいけません。Host Front Door は任意のローカル拡張です。インストール前に対象のルールファイルと差分を確認してください：

```text
この Skill リポジトリを完全にインストールして有効にしてください：
https://github.com/LiarMTTT/TavernWeave

ローカルにすでにある Skill だけを上書きしないでください。リポジトリの skills/ の完全なディレクトリを基準にしてください。インストール後にマシン上のマニフェストで完全な数を照合してください（2.3.0 は 23/23、公開済みの 1.9.1 は 22/22）。さらに worldbook-design-and-writing、build-work-library、activate-tavernweave-soul、consult-tavernweave-library、orchestrate-project-blueprint、reflect-on-vibe-code-growth、rewrite-natural-prose と Library のオフライン選択ページが存在することを個別に確認してください。

私が Codex か Claude Code のどちらを使っているかを検出し、TavernWeave Host Front Door は任意のローカル拡張であると説明してください。まず対象のパス、管理するブロック、diff を表示し、私の確認を得てからインストールしてください。管理するブロックの外にあるユーザールールは書き換えないでください。
```

更新：

```text
インストール済みの TavernWeave をこのリポジトリの最新版に完全に更新してください：
https://github.com/LiarMTTT/TavernWeave

更新では「リポジトリにあるべきディレクトリ」と「実際にインストールされているディレクトリ」を比較し、追加された Skill を作成しなければなりません。古いディレクトリだけを変更してはいけません。Host Front Door が不足、古い、またはドリフトしていないかも確認し、「前門を更新／先に diff を見る／Skill だけを更新」の 3 つの選択を明示してください。完了後は 2 つの受領書を返し、新しいタスクを作ってローカルホストの発見を検証してください。dots アカウントへのインポートは別途プラグインガイドに従って検証します。
```

ホストや agent が「各 Skill をプロジェクト単位のディレクトリにコピーする」というポータブルインストールを使う場合は、リポジトリのルートで次を実行できます：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\install-tavernweave.ps1 -TargetSkillRoot '<実際の Skill ルート>'
```

インストール時にグローバルの前門を処理するには、ホストを明示してスクリプトに尋ねさせます：

```powershell
# Codex：既定の対象は $CODEX_HOME\AGENTS.md。未設定なら ~/.codex/AGENTS.md
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\install-tavernweave.ps1 -TargetSkillRoot '<実際の Skill ルート>' -AgentHost Codex -HostFrontDoorAction Prompt

# Claude Code：既定の対象は ~/.claude/CLAUDE.md
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\install-tavernweave.ps1 -TargetSkillRoot '<実際の Skill ルート>' -AgentHost Claude -HostFrontDoorAction Prompt
```

インストール操作が維持するのは、バージョン付きの `tavernweave-host-front-door` コメントブロックだけです。既存のファイルは先にバックアップし、再インストールは冪等です。エラーや重複のマーカー、リンクのパスは拒否されます。単独でプレビューまたはインストールするには：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\manage-host-front-door.ps1 -AgentHost Codex -Action Preview
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\manage-host-front-door.ps1 -AgentHost Codex -Action Install
```

グローバルルールの変更は独立した実行ゲートです。「推奨」という言葉だけで agent が黙って書き込んではなりません。Codex/Claude では新しいタスクを作るか再起動して再発見が必要です。前門の受領書が、Soul Skill が実際に呼び出されたことを証明するものではありません。

インストールや更新の後は、**実際にスキャンされる場所**に対して検証しなければなりません。ソースのリポジトリだけを確認してはいけません。検証ツールは既定で TavernWeave のソースディレクトリ自体をインストール先として拒否します：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify-install.ps1 -TargetRoot '<実際のプラグインルートまたは Skill ルート>'
```

合格した受領書の Skill 数は、使用したソースのインストールマニフェストと一致しなければなりません。以下は 2.3.0 の 23 Skill のソースを例にしたものです。公開済みの 1.9.1 の元パッケージは依然 22/22 です：

```text
INSTALLATION VERIFIED: 23/23
Library: present-and-matched
Library picker: present
Soul: present-and-matched
Host rediscovery: required-new-task
```

検証時にホストとルールファイルも指定すると、受領書に `Host Front Door: current|missing-block|outdated|drifted` も表示されます。これは推奨状態を示し、マシン上のマニフェストによる Skill ファイルの完全性の判定を変えるものではありません。

対象ディレクトリ内の無関係な個人 Skill は保持されます。マシン上のマニフェストにある TavernWeave 公式ディレクトリは、現在のソースとファイル単位で一致しなければなりません。書き込み先の最後のディレクトリ名は明示的に `skills` でなければなりません。インストールスクリプトはドライブのルート、ユーザーディレクトリのルート、ソースリポジトリ内部の対象、ディレクトリリンクを拒否し、置き換えに失敗した場合は既存の公式 Skill をロールバックします。

対応するバージョンの完全な検証を終えたら、新しいタスクを作るかセッションを再起動して、ローカルホストに Skill を再発見させてください。新しいタスクでも、ワールドブックのデザインと執筆、Soul、ブレインストーミング編成、鏡を見る、Library を実際に呼び出す必要があります。インストールの受領書がホストでの発見を証明するものではありません。v2.4.0 のプラグインパッケージ、`TavernWeave-DSH-v2.4.0.tgz`（DeepSeek Harness）、SHA-256 の検証ファイルは[正式リリースページ](https://github.com/LiarMTTT/TavernWeave/releases/tag/v2.4.0)を参照してください。

メンテナーがリリース前にソースツリーを自己検査する場合に限り、`-AllowSourceTree` を明示して使えます。このスイッチは一般ユーザーのインストール受領書には使えません。

## Antigravity / AGY プラグイン

Antigravity / AGY ユーザーはまず[ネイティブプラグインのビルド、インストール、検証](host-adapters/antigravity/README.md)を参照してください。このパッケージは 23 個の Skill を再利用し、常設ルールで前門を読み込みます。AGY agent と設定保存の対応も提供します。厳密な検証とクライアントでの実測は別に記録されます。リポジトリルートの Claude プラグインのインポート変換は、AGY ネイティブパッケージのインストール経路ではありません。

## Claude Code プラグイン

2.2.0 以降、リポジトリ自体が Claude Code のプラグインマーケットプレースです（`.claude-plugin/`）。Claude Code で次を実行してください：

```text
/plugin marketplace add LiarMTTT/TavernWeave
/plugin install tavernweave-agent-skills@tavernweave
```

プラグインは 4 つの部分で構成され、最初の 3 つは DSH プラグインパッケージと 1 対 1 で対応します：

| 構成 | ファイル | 対応する DSH |
| --- | --- | --- |
| 23 個の Skill。名前に `tavernweave-agent-skills:` の接頭辞が付きます | `skills/` | Skill provider |
| Host Front Door の自動注入。セッション開始ごとに前門をセッションコンテキストとして追加します（PATH に `node` が必要） | [`hooks/hooks.json`](hooks/hooks.json)、[`hooks/session-start-front-door.mjs`](hooks/session-start-front-door.mjs) | system prompt section |
| `tavernweave` agent：TW 専用のペルソナ。ツールセットも絞られています（ネットワークとサブ agent は除外） | [`agents/tavernweave.md`](agents/tavernweave.md) | `TavernWeave X DSH` preset |
| Soul モード切り替え：プロンプト行上部の `Soul 阿瞳 ▸` の行を展開し、モードを選ぶと対応する指示が入力欄に入ります。送信はあなたが行います | [`hooks/soul-switch.tsx`](hooks/soul-switch.tsx)（`hooks/hooks.json` の `modules`）。 | 神之手の Soul 小フローウィンドウ（CC ではこの UI だけを保持） |

`tavernweave` agent はメインセッションとして起動できます：`claude --agent tavernweave-agent-skills:tavernweave`。また、通常のセッションで Claude に TW のタスクを任せることもできます。以前 Skill を `~/.claude/skills` にコピーしていた場合、プラグインに切り替えたらそのコピーを削除して、同名の Skill が二重に出ないようにできます。

Soul モード切り替えは Claude Code プラグインの関数フック API を使っています（公式には early access とされています）。前門のフックと同じ `hooks/hooks.json` に書かれており、Claude Code 2.1.299 で両方が読み込まれることを確認済みです。古いバージョンが `modules` フィールドを無視するかどうかは未検証です。切り替えはあなたが実際に送った Soul の指示だけを記録し、Soul が有効になったことを証明するものではありません。あなたの代わりにメッセージを送ることもありません。UI のテストは `claude plugin test .` で実行します。

### CLAUDE.md のブロックとの重複排除

前門が必要なのは 1 か所だけです。フックの起動時に、このセッションで読み込まれる指示ファイル、つまり `$CLAUDE_CONFIG_DIR/CLAUDE.md`（未設定なら `~/.claude/CLAUDE.md`）、およびカレントディレクトリからルートまでの各階層の `CLAUDE.md`、`.claude/CLAUDE.md`、`CLAUDE.local.md` を検査します。ファイル内の管理対象ブロックが優先されます：

| 状況 | フックの動作 |
| --- | --- |
| これらのファイルに `tavernweave-host-front-door` ブロックがない | プラグインに同梱の前門を注入 |
| 同じバージョンのブロックが既にある | 注入せず、ファイルのブロックを有効にします |
| 別のバージョンのブロックが既にある | 前門は注入せず、バージョン不一致の注意を 1 行だけ追加します。ファイルのブロックは有効なまま |
| 環境変数 `TAVERNWEAVE_FRONT_DOOR=off` | まったく注入しません |

- プラグインマーケットプレース経由でインストールしたユーザーは、`/plugin` で `manage-host-front-door.ps1` を使って `CLAUDE.md` に書き込む必要はありません。すでに書き込んでおり、プラグインによるバージョン追従に切り替えたい場合は、`manage-host-front-door.ps1 -AgentHost Claude -Action Remove` を実行してください（スクリプトは先にバックアップします）。
- ZIP または `skills/` のコピーでインストールしたユーザーにはこのフックがないため、上記のように `CLAUDE.md` に書き込みます。
- ガイダンスの段階（`tavernweave-guidance-preference` ブロック）は影響を受けず、引き続き `CLAUDE.md` に個別保存されます。

検収状況：フック、agent、Soul 切り替えの構造、重複排除のルール、出力形式、指示の一貫性は [`tests/claude-plugin.test.mjs`](tests/claude-plugin.test.mjs) がオフラインで検査し、Soul 切り替えの UI 動作は [`hooks/soul-switch.test.tsx`](hooks/soul-switch.test.tsx) が端末とデスクトップの両方の surface で検査します。Claude Code の新しいセッションでの実際の注入、`--agent` での起動、サブ agent からの呼び出しは実機でまだ検収していません（インストールマニフェストの `claudePlugin.hostLoading` を参照）。

## DeepSeek Harness

2.1.0 以降、DSH は独立したプラグインパッケージでインストールします。**`skills/` を `.agents/skills` にコピーしてはいけません**。`AGENTS.md` を書く必要もありません：

1. [v2.4.0 リリースページ](https://github.com/LiarMTTT/TavernWeave/releases/tag/v2.4.0)から `TavernWeave-DSH-v2.4.0.tgz` をダウンロードするか、ソースツリーで `node scripts/build-dsh-plugin.mjs` を実行してローカルパッケージ `TavernWeave-DSH-v2.4.0.tgz` を再生成します；
2. DSH デスクトップ版：サイドバーの **プラグイン → プラグインを追加 → サードパーティプラグインをインストール → ローカルパス/tarball** からインストールし、bundle を有効にします；
3. 新しいタスクを作り、Agent preset で **TavernWeave X DSH** を選択します。

CLI/Web profile では `dsh plugin --profile <profile> add <ローカルパス|tarball|git アドレス|パッケージ名>` を使います。`desktop` profile は Desktop shell が管理するため、CLI を直接呼ばないでください。

プラグインパッケージには 23 個の Skill と Host Front Door（system prompt セクションとして注入）が直接同梱され、インストール、アップグレード、アンインストールは DSH のプラグイン機構を通ります。詳細な構成、マシン契約、実行時のゲートは [host-adapters/dsh/README.md](host-adapters/dsh/README.md) を参照してください。DSH は依然として Developer Preview です。2.1.0 は DSH Desktop `0.2.1-rc.2` で、プラグインページ、preset 選択、23 の Skill 一覧、Front Door、Soul、完全権限端末の実機検収を完了しています。モデルの効果、Linux/WSL、実酒館は別の検収項目です。OneDrive の reparse-point ワークスペースでは workspace-write のままでは完全権限に切り替えるか通常のディレクトリに変更してください（契約の `knownEnvironmentIssues` を参照）。

## 出典とライセンス

- 原作者：[LiarMTTT](https://github.com/LiarMTTT/TavernWeave)
- 元リポジトリ：https://github.com/LiarMTTT/TavernWeave
- ライセンス：NOASSERTION
- 日本語翻訳と UI ローカライズ：claude-code-mods-ja プロジェクト
