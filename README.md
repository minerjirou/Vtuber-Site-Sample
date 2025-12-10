# Vtuber Site Sample (Astro + Cloudflare Pages + R2)

Astroで構築した、Cloudflare Pages/R2対応のVTuber事務所サイトのサンプルです。

主な機能
- Cloudflare Pagesで静的ホスティング
- 画像はR2公開バケットから配信（`PUBLIC_R2_BASE_URL`）
- メンバー紹介/ニュースをContent Collectionsで管理（Markdown）
- ダークモード切替トグル（クラスベース、永続化）
- メンバー/ニュースのタグ・カテゴリ + ページネーション
- 衣装ギャラリー（モーダル・カルーセル、←/→/ESC、スワイプ）
- SEO整備（OG/Twitter、canonical、JSON‑LD、sitemap、robots）

## セットアップ
1) 依存関係のインストール
- `npm install`

2) 環境変数（`.env`）
```env
PUBLIC_R2_BASE_URL=https://<your-r2-bucket-public-hostname>
AGENCY_NAME=Sample Vtuber Agency
SITE=https://your-domain.example
```
- R2の公開エンドポイント例: `https://<accountid>.r2.cloudflarestorage.com/<bucket>` またはCDNのカスタムドメイン

3) 開発サーバ
- `npm run dev`

4) ビルド/プレビュー
- `npm run build`
- `npm run preview`

## ディレクトリ構成
- `src/content/member/*` メンバー（Markdown）
- `src/content/news/*` ニュース（Markdown）
- `src/pages/*` ページ（一覧/詳細/タグ/カテゴリ/ページネーション）
- `src/components/*` UIコンポーネント
- `src/layouts/*` レイアウト
- `src/utils/r2.ts` R2画像URLの組み立て

## コンテンツスキーマ
`src/content/config.ts` でZodスキーマ定義。

- member
  - `name: string`
  - `avatar: string`（R2基準のパス）
  - `bio?: string`
  - `socials: {name,url}[]`
  - `fanTags: string[]`
  - `awards: {year,title}[]`
  - `outfits: {name,image}[]`
  - `order: number`
  - `category?: string`

- news
  - `title: string`
  - `date: date`
  - `summary?: string`
  - `tags: string[]`
  - `category?: string`

メンバーFrontmatter例
```yaml
name: 星乃 ほし
order: 1
avatar: images/members/hoshi/avatar.svg
bio: |
  歌とゲームが大好きな宇宙系VTuber。
socials:
  - { name: X(Twitter), url: "https://x.com/example" }
fanTags: [ほし民, ファンアート]
awards:
  - { year: "2023", title: インディーゲーム杯 準優勝 }
outfits:
  - { name: 通常衣装, image: images/members/hoshi/outfit-default.svg }
category: 歌い手
```

`avatar` や `outfits[].image` はR2のオブジェクトキー相当のパスを指定します。実際の配信URLは `PUBLIC_R2_BASE_URL` と結合されます（開発時未設定なら `public/` を参照）。

## 使い方/URL
- メンバー一覧: `/members`（導線） / `/members/page/1`（9件/ページ）
- メンバータグ: `/members/tag/<tag-slug>/page/1`
- メンバーカテゴリ: `/members/category/<category-slug>/page/1`
- ニュース一覧: `/news`（導線） / `/news/page/1`（10件/ページ）
- ニュースタグ: `/news/tag/<tag-slug>/page/1`
- ニュースカテゴリ: `/news/category/<category-slug>/page/1`

タグ/カテゴリのスラグは `src/utils/slug.ts` の `slugify()` で生成され、ページは静的にビルドされます。

## ダークモード
- ヘッダー右側のトグルでライト/ダークを切替（`localStorage`永続化）
- Tailwindは `darkMode: 'class'` を使用

## 衣装ギャラリー
- メンバー詳細ページでサムネクリック→モーダル表示
- 左右ボタン/←→/ESC/スワイプでナビゲーション

## SEO
- 共通コンポーネント: `src/components/Seo.astro`
  - `title`, `description`, `image`, `type`（`website|article|profile`）
  - すべてのページへ `src/layouts/BaseLayout.astro` から自動挿入
- JSON‑LD:
  - 全ページ: `Organization`/`WebSite` を挿入
  - メンバー詳細: `Person`
  - ニュース詳細: `NewsArticle`
- サイトマップ: `@astrojs/sitemap`（`astro.config.mjs` の `site` 必須）
- robots.txt: `src/pages/robots.txt.ts`（`SITE` でSitemap URLを生成）
- 既定OG画像: `public/og.png`（任意で差し替え）

任意: OG画像の事前生成
```
npm run gen:og
```
出力先:
- `public/og/member/<slug>.png`
- `public/og/news/<slug>.png`
（ページ側で `ogImage` を `/og/...` に指定すると生成画像を利用できます。既定ではアバターや `/og.png` を利用。）

## Cloudflare Pages へのデプロイ
1) 新規プロジェクト作成
- Framework: Astro（自動検出）
- Build command: `npm run build`
- Output directory: `dist`

2) 環境変数（Pagesのプロジェクト設定）
- `PUBLIC_R2_BASE_URL`, `AGENCY_NAME`, `SITE`
- `SITE` は本番フルURL（例: `https://vtuber.example.com`）

3) R2（画像配信）
- 公開バケットに画像を配置
- 「公開アクセス」を有効化し、公開エンドポイントまたはCDNドメインを `PUBLIC_R2_BASE_URL` に設定

補足
- SSRやR2 API呼び出しは不要（静的サイト）。画像は公開URLから直接配信。

