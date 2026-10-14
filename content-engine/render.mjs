// Renders batch files (data/*.json) to finished JPGs, one folder per carousel or post, with its caption.
//   node render.mjs data/batch-5.json [more.json] [--only <regex>] [--out <dir>] [--strict]
// Output: <out>/<batch>/<item id>/<item id>-01.jpg ..., caption.txt, and <out>/<batch>/manifest.json for schedulers.
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { checkBatch, printReport } from './check.mjs';

const here = new URL('.', import.meta.url).pathname;
const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); return i < 0 ? null : args.splice(i, 2)[1]; };
const only = flag('--only'), outDir = resolve(flag('--out') || 'out');
const strict = args.includes('--strict');
const files = args.filter(a => !a.startsWith('--'));
if (!files.length) { console.log('usage: node render.mjs data/<batch>.json [--only <regex>] [--out <dir>] [--strict]'); process.exit(1); }
const onlyRe = only ? new RegExp(only) : null;

// Art rotation for slides that ask for 'glass' or 'hero', and for content slides without art.
const glassSeq = ['g6', 'g1', 'g7', 'g2', 'g8', 'g3', 'g9', 'g4', 'g10', 'g5', 'g11', 'g0'];
const ctaSeq = ['t1', 'hero', 't3', 'hero2', 't2', 'hero3'];
const heroSeq = ['hero', 'hero2', 'hero3'];

const browser = await chromium.launch();
const slidePage = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
await slidePage.goto('file://' + here + 'engine/slide.html');
let kitPage = null;
let failed = false;

for (const file of files) {
  const batch = JSON.parse(readFileSync(file, 'utf8'));
  const name = batch.batch || basename(file, '.json');
  const report = checkBatch(batch);
  printReport(name, report);
  if (report.errors && strict) { console.log(`skipped ${name}: fix the errors above or drop --strict`); failed = true; continue; }

  let g = 0, h = 0, n = 0;
  const alias = a => !a ? a : a === 'glass' ? glassSeq[g++ % glassSeq.length] : a === 'hero' ? heroSeq[h++ % heroSeq.length] : a.replace(/^sculpt/, 's');
  const manifest = [];
  for (const item of batch.items) {
    if (onlyRe && !onlyRe.test(item.id)) continue;
    const dir = `${outDir}/${name}/${item.id}`;
    mkdirSync(dir, { recursive: true });
    const shots = [];
    if (item.type === 'kit') {
      // Batch 4 pieces: fixed layouts in engine/kit.html, picked by piece id.
      if (!kitPage) { kitPage = await browser.newPage({ viewport: { width: 1080, height: 1920 } }); await kitPage.goto('file://' + here + 'engine/kit.html'); }
      const r = await kitPage.evaluate(id => window.renderSample(id), item.piece);
      shots.push(await snap(kitPage, `${dir}/${item.id}-01.jpg`, r.issues, item.id));
    } else {
      const slides = item.type === 'post' ? [item.slide] : item.slides;
      for (let i = 0; i < slides.length; i++) {
        let s = { ...slides[i], tone: slides[i].tone || item.tone };
        if (s.l === 'mythfact2' && s.myth === undefined) s = { ...s, myth: s.t, fact: s.body };
        const l = s.l || 'content';
        let auto = s.auto;
        if (auto === undefined && item.type === 'post') auto = l === 'bignum' ? 'g3' : null;
        if (auto === undefined && ((l === 'content' && !s.art && !s.ghost) || l === 'bignum')) auto = glassSeq[g++ % glassSeq.length];
        s = { ...s, art: alias(s.art) };
        const meta = item.type === 'post'
          ? { tag: item.tag, last: true, auto: auto || null }
          : { i: i + 1, n: slides.length, last: i === slides.length - 1, ctaImg: s.ctaImg || ctaSeq[n % ctaSeq.length], auto: auto || null };
        n++;
        const issues = await slidePage.evaluate(([s, m]) => window.renderSlide(s, m), [s, meta]);
        shots.push(await snap(slidePage, `${dir}/${item.id}-${String(i + 1).padStart(2, '0')}.jpg`, issues, `${item.id} slide ${i + 1}`));
      }
    }
    if (item.caption) writeFileSync(`${dir}/caption.txt`, item.caption + '\n');
    manifest.push({ id: item.id, type: item.type, pillar: item.pillar || null, size: item.size || batch.size || '1080x1350', files: shots.map(f => `${item.id}/${basename(f)}`), caption: item.caption || '' });
    console.log(`  ${item.id}: ${shots.length} image${shots.length > 1 ? 's' : ''}`);
  }
  writeFileSync(`${outDir}/${name}/manifest.json`, JSON.stringify({ batch: name, title: batch.title || name, items: manifest }, null, 2) + '\n');
  console.log(`${name}: ${manifest.length} items in ${outDir}/${name}`);
}
await browser.close();
process.exit(failed ? 1 : 0);

async function snap(page, path, issues, label) {
  await page.locator('#slide').screenshot({ path, type: 'jpeg', quality: 88 });
  if (issues && issues.length) console.log(`  LAYOUT ${label}: ${issues.join('; ')}`);
  return path;
}
