// サイト共通のヘルパー（URLの組み立て、環境フラグ）
const rawBase = import.meta.env.BASE_URL.replace(/\/$/, '');

/** 内部リンクにBASE_PATHを付ける（外部リンク・tel・アンカーはそのまま） */
export const url = (p: string): string => (/^(https?:|mailto:|tel:|#)/.test(p) ? p : rawBase + p);

/** 絶対URL（canonical・OGP・構造化データ用） */
export const absUrl = (p: string): string => new URL(rawBase + p, import.meta.env.SITE).href;

/** 既存HTML断片（移行済みの本文）内の `href="/…"` `src="/…"` にBASE_PATHを付ける */
export const rewriteBase = (html: string): string =>
  html.replace(/\b(href|src|srcset)="\/(?!\/)/g, `$1="${rawBase}/`);

/** 確認用ビルド（検索エンジンに載せない）かどうか */
export const isNoindex = process.env.NOINDEX !== 'false';

/** 未監修（draft）のページを出力するか。本番ビルドでは出さない */
export const showDrafts = process.env.PRODUCTION !== 'true';

export const SITE_NAME = 'うたのはら整形外科クリニック';
