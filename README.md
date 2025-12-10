# Vtuber Site Sample (Astro + Cloudflare Pages + R2)

要件を満たすサンプル実装です。

- Cloudflare Pages でホスティング可能（静的出力）
- 画像は R2 の公開バケットから配信（`PUBLIC_R2_BASE_URL`）
- コンテンツコレクションで「メンバー紹介」「事務所ニュース」を管理
- メンバー詳細: 自己紹介、SNS、ファンタグ、入賞履歴、衣装ギャラリー

## セットアップ

1. 依存関係のインストール
   - `npm install`

2. 環境変数
   - `.env` を作成して以下を設定
   ```env
   PUBLIC_R2_BASE_URL=https://<your-r2-bucket-public-hostname>
   AGENCY_NAME=Sample Vtuber Agency
   ```
   - R2の公開エンドポイント例: `https://<accountid>.r2.cloudflarestorage.com/<bucket>` もしくはカスタムドメインCDN

3. 開発サーバ
   - `npm run dev`

## ディレクトリ構成

- `src/content/member/*` メンバーMD: フロントマターでデータ管理
- `src/content/news/*` ニュースMD
- `src/pages/*` ページ（一覧・詳細）
- `src/components/*` UIコンポーネント
- `src/utils/r2.ts` 画像URLをR2ベースURLに変換

### メンバーフロントマター例

```yaml
name: 星乃 ほし
order: 1
avatar: images/members/hoshi/avatar.jpg
bio: |
  自己紹介テキスト
socials:
  - { name: X(Twitter), url: "https://x.com/..." }
fanTags: [ほし民, ファンアート]
awards:
  - { year: "2023", title: インディーゲーム杯 準優勝 }
outfits:
  - { name: 通常衣装, image: images/members/hoshi/outfit-default.jpg }
```

`avatar` や `outfits[].image` は R2 バケット内のパスを指定してください。実際のURLは `PUBLIC_R2_BASE_URL` と結合して配信します。

## Cloudflare Pages へのデプロイ

1. Cloudflare Pages で新規プロジェクト
   - フレームワーク: Astro（自動検出）
   - Build command: `npm run build`
   - Output directory: `dist`

2. 環境変数
   - `PUBLIC_R2_BASE_URL`, `AGENCY_NAME`, `SITE` を Pages のプロジェクト設定に追加
   - `SITE` は本番のフルURL（例: `https://vtuber.example.com`）。サイトマップ/OG/robotsで使用

3. R2 側設定
   - 公開バケットに画像を配置
   - 「公開アクセス」を有効にし、公開エンドポイントURL or カスタムドメインを `PUBLIC_R2_BASE_URL` に設定

※ SSRやR2のAPI呼び出しは不要です（静的サイト）。画像は公開URLから直接配信します。

## カスタマイズのヒント

- ルック&フィール: Tailwindでクラスを調整
- メンバー項目追加: `src/content/config.ts` の `member` スキーマを拡張
- 画像最適化: Cloudflare Images や変換ルールを組み合わせると便利

## SEO 機能

- メタ/OG/Twitter: `src/components/Seo.astro`（`title`, `description`, `image`, `type`）
- 既定読み込み: `src/layouts/BaseLayout.astro` で各ページに自動挿入
- JSON-LD:
  - メンバー: `Person` を `src/pages/members/[slug].astro` で出力
  - ニュース: `NewsArticle` を `src/pages/news/[slug].astro` で出力
- サイトマップ: `@astrojs/sitemap`（`astro.config.mjs` の `site` が必要）
- robots.txt: `src/pages/robots.txt.ts`（`SITE` を使って動的にSitemap URLを出力）

### 追加: 組織/サイトの構造化データ（共通）
`src/layouts/BaseLayout.astro` に `Organization` / `WebSite` のJSON-LDを共通挿入します。

### 追加: OG画像の自動生成（任意）
ビルド前にOG画像を生成するスクリプトを同梱しています。

```
npm run gen:og
```

出力先:
- メンバー: `public/og/member/<slug>.png`
- ニュース: `public/og/news/<slug>.png`

現状、ページでは既定OG（`/og.png`）やアバター画像を利用しています。生成画像を使いたい場合は、各ページの `ogImage` を `/og/...` に設定してください。
