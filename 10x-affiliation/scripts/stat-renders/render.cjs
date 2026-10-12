let playwright
try {
  playwright = require('playwright')
} catch {
  playwright = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright')
}
const { chromium } = playwright
const fs = require('fs'), path = require('path');
(async () => {
  const [scene, palette, size, out] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 400, height: 400 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()); });
  const t0 = Date.now();
  await p.goto('file://' + path.join(__dirname, 'index.html') + `?scene=${scene}&palette=${palette}&size=${size}` + (process.argv[6] ? '&box=' + process.argv[6] : ''), { waitUntil: 'commit', timeout: 600000 });
  await p.waitForFunction(() => window.__png, null, { timeout: 600000, polling: 1000 });
  const data = await p.evaluate(() => window.__png);
  fs.writeFileSync(out, Buffer.from(data.split(',')[1], 'base64'));
  console.log(scene, palette, size, ((Date.now() - t0) / 1000).toFixed(1) + 's', errs.length ? 'ERR ' + errs.slice(0, 3).join(' | ') : '');
  await b.close();
})();
