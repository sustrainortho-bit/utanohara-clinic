// dist/ 内のHTMLについて、内部リンク・画像・アンカー(#id)の切れ、画像のalt欠落、h1の数を検査する。
// 使い方: npm run build && node scripts/check-links.mjs [BASE_PATH]（既定 /utanohara-clinic）
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';

const DIST = path.resolve('dist');
const BASE = (process.argv[2] ?? '/utanohara-clinic').replace(/\/$/, '');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const htmlFiles = walk(DIST).filter((f) => f.endsWith('.html'));

const problems = [];
const resolveTarget = (href) => {
  let p = href.split('#')[0].split('?')[0];
  if (BASE && p.startsWith(BASE)) p = p.slice(BASE.length);
  if (!p.startsWith('/')) return null;
  let file = path.join(DIST, p);
  if (p.endsWith('/')) file = path.join(file, 'index.html');
  if (fs.existsSync(file) && fs.statSync(file).isFile()) return file;
  if (fs.existsSync(file + '.html')) return file + '.html';
  return undefined;
};

for (const f of htmlFiles) {
  const rel = path.relative(DIST, f).split(path.sep).join('/');
  const $ = cheerio.load(fs.readFileSync(f, 'utf8'));
  const h1 = $('h1').length;
  if (h1 !== 1) problems.push(`${rel}: h1が${h1}個`);
  $('img').each((_, el) => { if ($(el).attr('alt') === undefined) problems.push(`${rel}: alt属性なしの画像 ${$(el).attr('src')}`); });
  $('a[href], img[src], link[href], source[srcset]').each((_, el) => {
    const href = $(el).attr('href') ?? $(el).attr('src') ?? $(el).attr('srcset');
    if (!href || /^(https?:|mailto:|tel:|data:)/.test(href)) return;
    if (href.startsWith('#')) {
      if (href.length > 1 && $(`[id="${href.slice(1)}"]`).length === 0) problems.push(`${rel}: アンカー先なし ${href}`);
      return;
    }
    const target = resolveTarget(href);
    if (target === undefined) problems.push(`${rel}: リンク切れ ${href}`);
    else if (target && href.includes('#')) {
      const id = href.split('#')[1];
      if (id && !fs.readFileSync(target, 'utf8').includes(`id="${id}"`)) problems.push(`${rel}: 遷移先にアンカーなし ${href}`);
    }
  });
}
console.log(`${htmlFiles.length}ページを検査`);
if (problems.length) { console.log(problems.join('\n')); process.exitCode = 1; } else console.log('問題なし');
