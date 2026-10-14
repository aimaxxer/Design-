// Copy checker: runs every brand rule in sot.json against a batch file before anything is rendered.
//   node check.mjs data/batch-5.json [more.json]     exits 1 when there are errors
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

const SOT = JSON.parse(readFileSync(new URL('./sot.json', import.meta.url), 'utf8'));
// Fields that hold keys or settings rather than copy.
const NOT_COPY = new Set(['l', 'k', 'art', 'img', 'pos', 'tone', 'coin', 'auto', 'ctaImg', 'bg', 'flip', 'size', 'h', 'hi', 'start', 'center', 'invert', 'g', 'ghost']);
const words = s => s.trim().split(/\s+/).filter(Boolean).length;
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const BANNED = SOT.banned.map(b => ({ word: b, re: new RegExp(`(^|[^\\w-])${esc(b)}(?![\\w-])`, 'i') }));
const RISK_RE = new RegExp(SOT.risk_triggers.filter(t => t !== '10X Trader').map(esc).join('|'), 'i');
const EMOJI = /\p{Extended_Pictographic}/u;
const LAYOUTS = new Set(Object.keys(SOT.layouts)), BLOCKS = new Set(SOT.blocks), TONES = new Set(SOT.tones), ART = new Set(SOT.art);

function copyOf(obj, out = []) {
  if (typeof obj === 'string') out.push(obj);
  else if (Array.isArray(obj)) obj.forEach(v => copyOf(v, out));
  else if (obj && typeof obj === 'object') for (const [k, v] of Object.entries(obj)) if (!NOT_COPY.has(k)) copyOf(v, out);
  return out;
}

export function checkBatch(batch) {
  const items = [];
  let errors = 0, warnings = 0;
  for (const item of batch.items || []) {
    const e = [], w = [];
    const slides = item.type === 'carousel' ? item.slides || [] : item.type === 'post' ? [item.slide || {}] : [];
    if (!item.id) e.push('item has no id');
    if (!['carousel', 'post', 'kit'].includes(item.type)) e.push(`type must be carousel, post or kit, not "${item.type}"`);
    if (item.tone && !TONES.has(item.tone)) e.push(`unknown tone "${item.tone}"`);

    slides.forEach((s, i) => {
      const at = item.type === 'carousel' ? `slide ${i + 1}: ` : '';
      const l = s.l || 'content';
      if (!LAYOUTS.has(l)) e.push(`${at}unknown layout "${l}"`);
      if (s.tone && !TONES.has(s.tone)) e.push(`${at}unknown tone "${s.tone}"`);
      for (const k of ['art', 'img']) if (s[k] && !ART.has(s[k]) && !/^ico-/.test(s[k])) e.push(`${at}unknown ${k} "${s[k]}"`);
      for (const b of s.blocks || []) if (!BLOCKS.has(b.k) && l !== 'index') e.push(`${at}unknown block "${b.k}"`);
      if (s.t && words(s.t.replace('|', ' ')) > 10) w.push(`${at}headline is ${words(s.t.replace('|', ' '))} words (aim for 10 or fewer)`);
      if (s.body && words(s.body) > 30) w.push(`${at}body is ${words(s.body)} words (aim for 30 or fewer)`);
      for (const text of copyOf(s)) {
        if (/\bIBS\b/.test(text)) e.push(`${at}"IBS" must be written IB’s`);
        else if (/\bIB(s|'s)\b/.test(text)) w.push(`${at}write IB’s instead of "${text.match(/\bIB(s|'s)\b/)[0]}" (the renderer fixes it, captions do not)`);
        if (EMOJI.test(text)) e.push(`${at}no emoji inside the design`);
        if (/#\w/.test(text)) e.push(`${at}no hashtags inside the design`);
        if (/[–—]/.test(text)) w.push(`${at}en or em dash in "${text.slice(0, 40)}": use a hyphen or a full stop`);
        if (text.includes('!')) w.push(`${at}exclamation mark in "${text.slice(0, 40)}"`);
      }
    });

    const slideCopy = slides.flatMap(s => copyOf(s)).join('\n');
    const caption = item.caption || '';
    for (const { word, re } of BANNED) {
      if (re.test(slideCopy)) e.push(`banned word "${word}" in the design`);
      if (re.test(caption)) e.push(`banned word "${word}" in the caption`);
    }
    const all = slideCopy + '\n' + caption;
    if (RISK_RE.test(all) && !all.includes(SOT.risk_line.slice(0, 40))) e.push('explains 10X Trader mechanics (credit, leverage, buying power or 1:9) without the risk line');
    else if (/10X Trader/.test(all) && !all.includes(SOT.risk_line.slice(0, 40))) w.push('mentions 10X Trader: add the risk line if the post explains how it works');

    if (item.type === 'carousel') {
      const { min_slides, max_slides, last_slide } = SOT.carousel;
      if (slides.length < min_slides || slides.length > max_slides) w.push(`${slides.length} slides (aim for ${min_slides}-${max_slides})`);
      if ((slides.at(-1)?.l || 'content') !== last_slide) w.push(`last slide is not a "${last_slide}" slide`);
    }
    const isStory = /1920/.test(item.size || '');
    if (!caption && !isStory) e.push('no caption');
    if (caption) {
      if (/\bIBS\b|\bIBs\b|\bIB's\b/.test(caption)) e.push('caption: write IB’s (curly apostrophe, lowercase s)');
      if (!/#10XAffiliation\s*$/.test(caption)) w.push('caption: end with the hashtags, last one #10XAffiliation');
      const tags = caption.match(/#\w+/g) || [];
      if (tags.length > 6) w.push(`caption: ${tags.length} hashtags (use 4-5)`);
      if ([...caption.matchAll(/\p{Extended_Pictographic}/gu)].length > 1) w.push('caption: one emoji at most');
    }
    errors += e.length; warnings += w.length;
    if (e.length || w.length) items.push({ id: item.id, errors: e, warnings: w });
  }
  return { count: (batch.items || []).length, errors, warnings, items };
}

export function printReport(name, r) {
  console.log(`${name}: ${r.count} items, ${r.errors} error${r.errors === 1 ? '' : 's'}, ${r.warnings} warning${r.warnings === 1 ? '' : 's'}`);
  for (const it of r.items) {
    for (const m of it.errors) console.log(`  ERROR ${it.id}: ${m}`);
    for (const m of it.warnings) console.log(`  warn  ${it.id}: ${m}`);
  }
}

if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  const files = process.argv.slice(2);
  if (!files.length) { console.log('usage: node check.mjs data/<batch>.json [more.json]'); process.exit(1); }
  let bad = 0;
  for (const f of files) { const r = checkBatch(JSON.parse(readFileSync(f, 'utf8'))); printReport(basename(f, '.json'), r); bad += r.errors; }
  process.exit(bad ? 1 : 0);
}
