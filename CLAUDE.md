# うたのはら整形外科クリニック ホームページ（内製リニューアル）

オーナー（クリニック勤務医）が現行の外注サイトを作り直すプロジェクト。仕様は [SPEC.md](SPEC.md)、現行本文の確認事項は [docs/content-review.md](docs/content-review.md)。

## コマンド

```bash
npm install
npm run dev        # 開発サーバー
npm run build      # dist/ に出力（環境変数は astro.config.mjs 冒頭を参照）
npm run preview    # dist/ をローカル確認（既定: http://localhost:4321/utanohara-clinic/）
node scripts/check-links.mjs   # ビルド後: リンク切れ・alt欠落・h1の数を検査（公開前に必ず実行）
```

- 確認用（GitHub Pages）は `NOINDEX=true`（既定）＝全ページ `noindex`、`robots.txt` は全面拒否。本番は `NOINDEX=false SITE_URL=https://www.utanohara.com BASE_PATH= PRODUCTION=true` でビルドする。
- `PRODUCTION=true` のビルドでは、`status: draft` の医療情報ページと、`services` の `draft: true` の項目を出力しない。

## 構成

- `src/config/site.ts` … 住所・電話・診療時間・診療担当表・医師・ナビ・診療内容（`services`）。**診療時間や担当が変わったらここを直す**。
- `src/content/specialties/`, `src/content/diseases/` … 医療情報ページ（Markdown）。スキーマは `src/content.config.ts`。`status: reviewed` にするのは**担当医が確認してから**。
- `src/legacy/**/*.html` と `src/data/*.json` … 現行サイトから移行した本文（`scripts/migrate.mjs` で生成）。**文言は流用のまま。修正は院長・担当医の方針が決まってから**（`docs/content-review.md`）。
- `src/pages/` … ルート。ディレクトリindex（`/about/` など）は薄いラッパーから `LegacyPage.astro` を使う。`[...slug].astro` は既存の個別ページと専門外来。
- `src/layouts/BaseLayout.astro`（共通）、`ArticleLayout.astro`（医療情報ページ。監修者・最終確認日・FAQ・JSON-LD）。
- `public/img/` … WebP化済みの画像（現行サイト由来）。

## 守ること

- **インラインstyle属性・インラインスクリプトを書かない**（CSPがハッシュ方式のため、`style=""` は効かない）。スタイルは `src/styles/global.css` に書く。
- 外部読み込み（フォント・スクリプト・iframe）を増やさない。地図は埋め込まずリンクにしている。
- 医療広告ガイドライン: 最上級・比較・体験談・ビフォーアフターは使わない。自由診療は費用・リスク・副作用を併記。新規の医療記事は下書き（draft）で作り、担当医の確認後に `reviewed`。
- 内部リンクは `url('/…')`、画像は `img('…')`（`src/lib`）を使い、BASE_PATH対応を崩さない。

## 状況

SPEC.md の「15. 進捗」を参照。次にやること: 疾患解説（30以上）の下書き、症状から探す、FAQ、`llms.txt`、専門外来の事実情報（オーナーから提供）の反映、本番切替の準備（旧URL対応表、ドメイン管理者との調整、現行サイトとの差分再取得）。

## ローカル専用（gitignore）

`_archive/` に現行サイトの丸ごとコピー（`site/`）、クロール・スクリーンショット用スクリプト（`crawl.mjs`、`shot.mjs`。Edgeのヘッドレスで撮影）がある。別のPCでは再生成が必要。
