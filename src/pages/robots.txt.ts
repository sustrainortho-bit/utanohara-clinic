import type { APIRoute } from 'astro';
import { absUrl, isNoindex } from '../lib/site';

// 確認用ビルド（NOINDEX≠false）では全面拒否。本番ではAIクローラーを含め許可する（方針はSPEC.md 8章）。
export const GET: APIRoute = () => {
  const body = isNoindex
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${absUrl('/sitemap-index.xml')}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
