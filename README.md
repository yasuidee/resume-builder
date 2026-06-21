# シゴトドキ — 在日外国人向け AI 履歴書・職務経歴書ビルダー

在日外国人（メインターゲット：日本語 N2〜N1）が、日本企業へ提出できる **履歴書・職務経歴書を作成し PDF 出力** できる、PC/スマホ対応のブラウザサービスです。

- UI 言語：日本語 / English / 简体中文 / 繁體中文 / Tiếng Việt
- 入力は各言語で可、**最終成果物は自然な日本語** で出力
- AI は補助に徹し、**ユーザーが入力した事実だけ** を使う（捏造しない）
- 履歴書作成と人材紹介（キャリアサポート）の **同意は明確に分離**

## 絶対原則（設計の前提）

1. **データ最小化** — 差別につながり得る項目（性別・家族構成・本籍など）は必須にしない。性別の初期値は「記載しない」。
2. **同意の分離** — 「書類作成・PDF 出力」と「人材紹介への情報利用」は別物。後者が未同意でも前者は完全に使える。
3. **AI 捏造禁止** — AI は入力にない経験・資格を生成しない。不足は `clarifyingQuestions`（追加質問）で返す。型（zod）とユニットテストで担保。
4. **撤回可能性** — 同意はいつでも `/settings/privacy` から撤回可能。同意履歴は INSERT で保存（更新しない）。

## 技術スタック

| 領域 | 採用 |
|---|---|
| Framework | Next.js 16 (App Router) |
| 言語 | TypeScript (strict) |
| Styling | Tailwind CSS v4 + 自作 UI プリミティブ |
| Form | react-hook-form + zod |
| i18n | next-intl（`proxy.ts` ベース） |
| DB | PostgreSQL（ローカル既定は **PGlite**、実 PG は `DATABASE_URL` で差し替え） |
| ORM | Drizzle ORM |
| Auth | スタブ（固定ユーザー）→ 将来 Supabase Auth に差し替え可能な interface |
| PDF | Playwright（Chromium）で HTML→PDF。プレビュー HTML = PDF テンプレの単一ソース |
| AI | Provider interface + MockAIProvider（キー不要でローカル完走） |

> **PDF 設計のセンターピン**: プレビュー画面の `ResumeDocument` / `CvDocument` を、chrome-less の `/documents/[id]/print` ページとして Playwright で開き `page.pdf()` する。プレビューと PDF が必ず一致します。

## セットアップ

前提：Node.js 20+（開発は Node 25 で確認）。**Docker は不要** です。

```bash
# 1. 依存をインストール
npm install

# 2. PDF 用に Chromium を取得（初回のみ）
npx playwright install chromium

# 3. 開発サーバ起動（初回アクセス時に PGlite を自動マイグレーション＋seed）
npm run dev
# → http://localhost:3000
```

ローカル DB は `./.pglite`（git 管理外）に作られます。初回リクエスト時に全テーブルの
マイグレーションと seed ユーザー投入が自動実行されます。

### DB をリセットしたいとき

```bash
npm run db:reset   # .pglite を削除（次回起動時に作り直し）
```

### 実 PostgreSQL を使いたいとき（任意）

PGlite の代わりに実 PostgreSQL を使う場合（本番想定との整合性確認など）：

```bash
docker compose up -d
export DATABASE_URL=postgres://app:app@localhost:5432/resume_builder
npm run dev   # DATABASE_URL があれば postgres-js 経由で接続・マイグレーション
```

### スキーマ変更時

```bash
npm run db:generate   # src/db/schema.ts から drizzle/ にマイグレーション SQL を生成
```

## AI プロバイダ

- 既定は **MockAIProvider**（外部キー不要）。`text` は入力済みの事実（`usedFacts`）のみで構成し、不足は `clarifyingQuestions` で返します。
- 実 LLM 連携は `src/lib/ai/real.ts` に実装済み（Claude / Anthropic SDK、モデル `claude-opus-4-8`、structured outputs ＋ 捏造防止のシステムプロンプト）。有効化するには：

  ```bash
  export AI_PROVIDER=real
  export ANTHROPIC_API_KEY=sk-ant-...
  npm run dev
  ```

  キーが無い、または初期化に失敗した場合は自動で Mock にフォールバックします（アプリは止まりません）。

## 履歴書テンプレート

履歴書は **クラシック（JIS様式）** と **モダン** の2種類から選べます。プレビュー画面右上の「デザイン」で切り替えると、プレビューと PDF の両方に反映されます。

## テスト

```bash
npm run test       # ユニットテスト（vitest）— AI 捏造防止の契約を検証
npm run test:e2e   # E2E（Playwright）— 本番ビルドを起動して主要シナリオを検証
npm run typecheck  # 型チェック
npm run build      # 本番ビルド
```

- **ユニット（`src/lib/ai/mock.test.ts`）**: 空入力で質問が返る／`usedFacts` が入力の部分集合／架空の固有名詞を含まない 等。
- **E2E（`e2e/app.spec.ts`）**: 履歴書作成→自動保存→プレビュー→PDF／同意モーダルを閉じても PDF は取得済み／未同意者は管理者一覧に出ない／言語切替で文言が変わる／保存2回でバージョン2件。
  - E2E は分離した DB（`.pglite-e2e`）と専用ポートで本番ビルドを起動します。

## 主な画面

| ルート | 内容 |
|---|---|
| `/` | ランディング（言語切替つき） |
| `/dashboard` | 書類一覧・同意状態・PDF 履歴・セット PDF |
| `/documents/new` | 種別選択（履歴書／職務経歴書） |
| `/documents/[id]/edit` | ステップ編集・自動保存・AI 補助・履歴に保存 |
| `/documents/[id]/preview` | プレビュー・AI 整合性チェック・PDF 出力 |
| `/documents/[id]/versions` | 編集履歴の一覧・復元 |
| `/documents/[id]/print` | PDF 生成用の chrome-less ページ（`?set=1` で履歴書＋職務経歴書） |
| `/settings/privacy` | 同意の ON/OFF・撤回・データ削除 |
| `/admin/candidates` | キャリアサポート同意者のみ（権限チェックあり） |
| `/api/pdf` | Playwright で PDF を生成（`documentId`、`set=1`） |

## ディレクトリ構成

```
src/
  app/[locale]/...            # 画面（marketing / dashboard / documents / settings / admin）
  app/api/pdf/route.ts        # PDF 生成（Playwright, Node ランタイム）
  components/                 # UI プリミティブ・エディタ・帳票テンプレ
  db/                         # Drizzle スキーマ / クライアント / seed
  lib/ai/                     # AIProvider interface / mock / real / schemas
  lib/actions/                # サーバーアクション（documents / ai / versions / consent）
  lib/validation/             # zod スキーマ（resume / cv）
  lib/pdf/                    # PDF 用ファイル名・Playwright ラッパ
  i18n/                       # next-intl 設定
  messages/                   # 5 言語のメッセージ
drizzle/                      # マイグレーション
e2e/                          # Playwright E2E
```

## Vercel へのデプロイ

ローカルは設定ゼロで動きますが、Vercel（サーバーレス）では以下が必要です。`.env.example` を参照してください。

1. **DB**: 実 PostgreSQL を用意（Vercel Postgres / Neon 等）し、`DATABASE_URL` を設定（未設定だと PGlite になりサーバーレスでは永続化されません）。マイグレーションは初回リクエスト時に自動実行されます。
2. **PDF**: サーバーレスでは `@sparticuz/chromium` ＋ `playwright-core` を自動使用します（コードが `VERCEL` 環境を検出して切替）。ビルド時のブラウザDLを避けるため `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` を設定。
3. （任意）実 AI を使うなら `AI_PROVIDER=real` ＋ `ANTHROPIC_API_KEY`。
4. PDF生成は Chromium 起動のため、`/api/pdf` の関数タイムアウトを 60s に設定済み（`maxDuration`）。

## デプロイ時のメモ（PDF）

- ローカル（macOS）では Chromium のシステムフォント（Hiragino 等）で日本語が正しく出ます。
- **Linux サーバー / サーバーレス**では CJK フォントが無いと文字化けする可能性があります。対策は次のいずれか：
  - サーバーに Noto Sans JP（`fonts-noto-cjk` 等）をインストールする。
  - Vercel など軽量環境では `@sparticuz/chromium` ＋フォント同梱に差し替える（`src/lib/pdf/playwright.ts` の `chromium.launch` 部分）。
- 長い職歴・学歴は Playwright の印刷ページネーションで自動的に複数ページに分割されます。

## MVP であえて後回しにしたもの

- 実 AI プロバイダ（キー前提）、複数 PDF テンプレ、リッチエディタ、SNS ログイン、CSV エクスポート、顔写真アップロード。
- 実認証（現状は固定ユーザーのスタブ。`src/lib/auth/index.ts` を差し替えれば Supabase 等に対応可能）。
