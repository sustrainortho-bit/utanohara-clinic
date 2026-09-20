// 現行サイトのアーカイブ（_archive/site）から、新サイト用の素材を生成するワンショット移行スクリプト。
//   - 画像 → public/img/**.webp（最大幅1600px）と src/data/images.json（寸法）
//   - 各ページの本文HTML → src/legacy/<slug>.html と src/data/pages.json（見出し・説明・ヒーロー画像）
//   - お知らせ/休診案内/採用情報 → src/data/news.json
// 既存の本文は「そのまま流用」の方針のため、文言は変更しない（構造の整理・リンク/画像パスの付け替えのみ）。
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, '_archive', 'site');
const OUT_LEGACY = path.join(ROOT, 'src', 'legacy');
const OUT_DATA = path.join(ROOT, 'src', 'data');
const OUT_IMG = path.join(ROOT, 'public', 'img');
const ORIGIN = 'https://www.utanohara.com';
const SITE_SUFFIX = /\s*\|\s*うたのはら整形外科クリニック\s*\|\s*スポーツ＆リハビリテーション\s*$/;

const toPosix = (p) => p.split(path.sep).join('/');
async function walk(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}
const write = async (file, data) => { await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, data); };

// ---------- 1. 画像 ----------
const images = {}; // 'home/slider_01.jpg' -> { src, width, height }
async function migrateImages() {
  const base = path.join(SRC, 'assets', 'img');
  for (const file of await walk(base)) {
    const rel = toPosix(path.relative(base, file));
    const ext = path.extname(rel).toLowerCase();
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      const outRel = rel.replace(/\.(jpe?g|png)$/i, '.webp');
      const out = path.join(OUT_IMG, outRel);
      await fs.mkdir(path.dirname(out), { recursive: true });
      const meta = await sharp(file).metadata();
      const width = Math.min(meta.width, 1600);
      const info = await sharp(file).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out);
      images[rel] = { src: `/img/${outRel}`, width: info.width, height: info.height };
    } else if (ext === '.svg') {
      await fs.mkdir(path.dirname(path.join(OUT_IMG, rel)), { recursive: true });
      await fs.copyFile(file, path.join(OUT_IMG, rel));
      const svg = await fs.readFile(file, 'utf8');
      const vb = svg.match(/viewBox="([\d.\s-]+)"/);
      const [, , w, h] = vb ? vb[1].trim().split(/\s+/).map(Number) : [0, 0, 330, 100];
      images[rel] = { src: `/img/${rel}`, width: w, height: h };
    } else {
      console.log('skip image', rel);
    }
  }
  await fs.copyFile(path.join(SRC, 'favicon.ico'), path.join(ROOT, 'public', 'favicon.ico')).catch(() => {});
}

// ---------- 2. ページ ----------
const pageFiles = (await walk(SRC)).filter((f) => f.endsWith('.html')).map((f) => toPosix(path.relative(SRC, f)));
const knownUrls = new Set(pageFiles.map((f) => '/' + f.replace(/index\.html$/, '')));

const urlOf = (file) => '/' + file.replace(/index\.html$/, '');
const slugOf = (file) => file.replace(/\.html$/, '');

function normalizeHref(href, pageFile) {
  if (!href || href.startsWith('#') || /^(mailto:|tel:)/.test(href)) return { keep: true, href };
  let u;
  try { u = new URL(href, `${ORIGIN}/${pageFile}`); } catch { return { keep: true, href }; }
  if (u.origin !== ORIGIN) return { keep: true, href };
  const p = u.pathname.replace(/index\.html$/, '');
  if (p.startsWith('/assets/')) return { keep: true, href: p + u.hash };
  if (knownUrls.has(p)) return { keep: true, href: p + u.hash };
  return { keep: false, href };
}

function processFragment($, pageFile, log) {
  $('script').remove();
  // 地図の埋め込みは外部読み込みを避けるため、リンクに置き換える
  $('iframe').each((_, el) => {
    const q = encodeURIComponent('うたのはら整形外科クリニック 東広島市西条町寺家5284-1');
    $(el).replaceWith(`<p class="map-link"><a href="https://www.google.com/maps/search/?api=1&query=${q}" target="_blank" rel="noopener noreferrer">Googleマップで場所を確認する（新しいタブで開きます）</a></p>`);
  });
  // 設備紹介のモーダル（remodal）は通常のセクションに変換し、idでアンカー移動できるようにする
  $('.remodal').each((_, el) => {
    const id = $(el).attr('data-remodal-id');
    $(el).find('[data-remodal-action]').remove();
    $(el).removeClass('remodal').removeAttr('data-remodal-id');
    if (id) $(el).attr('id', id);
  });
  $('a[href]').each((_, el) => {
    const r = normalizeHref($(el).attr('href'), pageFile);
    if (!r.keep) { log.push(`リンク切れを解除: ${pageFile} -> ${$(el).attr('href')}`); $(el).replaceWith($(el).contents()); return; }
    $(el).attr('href', r.href);
    if ($(el).attr('target') === '_blank') $(el).attr('rel', 'noopener noreferrer');
  });
  $('img').each((_, el) => {
    const src = $(el).attr('src') || '';
    const u = new URL(src, `${ORIGIN}/${pageFile}`);
    const rel = u.pathname.replace(/^\/assets\/img\//, '');
    const im = images[rel];
    if (!im) { log.push(`画像が見つからない: ${pageFile} -> ${src}`); return; }
    $(el).attr({ src: im.src, width: String(im.width), height: String(im.height), loading: 'lazy', decoding: 'async' });
    if ($(el).attr('alt') === undefined) $(el).attr('alt', '');
  });
  $('picture source[srcset]').each((_, el) => {
    const u = new URL($(el).attr('srcset'), `${ORIGIN}/${pageFile}`);
    const im = images[u.pathname.replace(/^\/assets\/img\//, '')];
    if (im) $(el).attr('srcset', im.src);
  });
  $('[style]').each((_, el) => { if (!/^\s*$/.test($(el).attr('style'))) log.push(`インラインstyleあり: ${pageFile} <${el.tagName}> ${$(el).attr('style').slice(0, 40)}`); });
}

const pages = [];
const migrationLog = [];
async function migratePages() {
  for (const file of pageFiles) {
    if (file === 'index.html') continue; // トップは新規に作り直す
    const html = await fs.readFile(path.join(SRC, file), 'utf8');
    const a = html.indexOf('InstanceBeginEditable name="content"');
    const b = html.indexOf('InstanceEndEditable', a);
    if (a < 0 || b < 0) { console.log('NO CONTENT MARKER', file); continue; }
    const fragment = html.slice(html.indexOf('-->', a) + 3, html.lastIndexOf('<!--', b));
    const $ = cheerio.load(fragment, null, false);
    const head = cheerio.load(html);
    const title = (head('title').text() || '').replace(SITE_SUFFIX, '').trim();
    const description = head('meta[name="description"]').attr('content') || '';

    const heroImg = $('p.mainvisual img').first();
    const heroRel = heroImg.length ? new URL(heroImg.attr('src'), `${ORIGIN}/${file}`).pathname.replace(/^\/assets\/img\//, '') : null;
    $('p.mainvisual').remove();
    const pt = $('h2.page-title').first();
    const en = pt.find('.lang-en').text().trim();
    pt.find('.lang-en').remove();
    const heading = pt.text().replace(/\s+/g, ' ').trim() || title;
    pt.remove();

    processFragment($, file, migrationLog);
    const body = $.html().replace(/[\t ]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    const slug = slugOf(file);
    await write(path.join(OUT_LEGACY, `${slug}.html`), body + '\n');
    pages.push({ slug, url: urlOf(file), title, heading, en, description, hero: heroRel && images[heroRel] ? images[heroRel] : null });
  }
}

// ---------- 3. お知らせ ----------
async function migrateNews() {
  const kinds = { news: 'お知らせ', news2: '休診案内', news3: '採用情報' };
  const result = {};
  for (const [dir, label] of Object.entries(kinds)) {
    const html = await fs.readFile(path.join(OUT_LEGACY, `${dir}/index.html`), 'utf8');
    const $ = cheerio.load(html, null, false);
    const items = [];
    $('dl.news-list > dt').each((_, dt) => {
      const date = $(dt).find('.date').text().trim();
      $(dt).find('.date').remove();
      const title = $(dt).text().replace(/\s+/g, ' ').trim();
      const body = $(dt).next('dd').html()?.trim() || '';
      const [y, m, d] = date.split('.').map(Number);
      items.push({ date, iso: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`, title, body });
    });
    result[dir] = { label, items };
  }
  await write(path.join(OUT_DATA, 'news.json'), JSON.stringify(result, null, 2));
}

await migrateImages();
await migratePages();
await migrateNews();
await write(path.join(OUT_DATA, 'images.json'), JSON.stringify(images, null, 2));
await write(path.join(OUT_DATA, 'pages.json'), JSON.stringify(pages, null, 2));
await write(path.join(ROOT, '_archive', 'migration-log.txt'), migrationLog.join('\n'));
console.log(`images: ${Object.keys(images).length}, pages: ${pages.length}, log lines: ${migrationLog.length}`);
