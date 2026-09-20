import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 確認用（GitHub Pages）と本番（www.utanohara.com）を環境変数で切り替える。
//   SITE_URL  … 公開URLのオリジン（本番: https://www.utanohara.com）
//   BASE_PATH … サブパス（GitHub Pages: /utanohara-clinic、本番: 空文字）
//   NOINDEX   … 'false' 以外は検索エンジンに載せない（確認用）
//   PRODUCTION … 'true' なら未監修（draft）のページをビルドに含めない
const site = process.env.SITE_URL || 'https://sustrainortho-bit.github.io';
const base = process.env.BASE_PATH ?? '/utanohara-clinic';
const noindex = process.env.NOINDEX !== 'false';

export default defineConfig({
  site,
  base: base || '/',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'preserve', inlineStylesheets: 'auto' },
  markdown: { syntaxHighlight: false },
  integrations: noindex ? [] : [sitemap()],
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'none'",
        "frame-src 'none'",
        "connect-src 'self'",
      ],
    },
  },
});
