// 移行済み本文（src/legacy）から、医療広告ガイドライン上の確認が必要になりそうな表現を洗い出す。
// 自動判定ではなく「担当医・院長に確認してもらう候補」を出すためのもの。
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';

const terms = ['最新', '最先端', '最高', '日本一', 'No.1', 'ナンバーワン', 'レベルの高い', '高度', '唯一', '確実', '必ず', '絶対', '安心',
  '実績', '期待', '有効', '効果', '治る', '完治', '権威', '世界', '欧州', '承認', 'ベスト', '最適', '徹底'];

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const rows = [];
for (const f of walk('src/legacy')) {
  const $ = cheerio.load(fs.readFileSync(f, 'utf8'), null, false);
  const text = $.root().text().replace(/\s+/g, ' ');
  for (const s of text.split(/(?<=[。！？])/)) {
    const hit = terms.filter((t) => s.includes(t));
    if (hit.length) rows.push({ file: path.relative('src/legacy', f).split(path.sep).join('/'), hit, s: s.trim() });
  }
}
console.log(`${rows.length} hits`);
for (const r of rows) console.log(`[${r.file}] {${r.hit.join(',')}} ${r.s.slice(0, 150)}`);
