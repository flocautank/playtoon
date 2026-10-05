// Rend la distribution du jeu (vrais modèles, fond transparent) pour les visuels de boutique :
// apps/synth-horde/assets/cast/{horde,head,hero}.png, utilisés par apps/synth-horde/make-assets.mjs et apps/desktop/steam/make-art.mjs.
//   node tools/cast/poster.mjs      (Chromium headless via Playwright ; sert le dépôt sur un port libre)
import { createRequire } from 'module';
import { execSync } from 'child_process';
import http from 'http'; import fs from 'fs'; import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..', '..');
const OUT = path.join(root, 'apps', 'synth-horde', 'assets', 'cast'); fs.mkdirSync(OUT, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript' };
const srv = http.createServer((q, r) => {
  const f = path.join(root, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); r.end(d); });
}).listen(0);
const base = `http://localhost:${srv.address().port}/`;
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const [shot, w, h] of [['horde', 2400, 1600], ['head', 1024, 1024], ['hero', 1200, 1600]]) {
  const p = await b.newPage({ viewport: { width: 400, height: 400 } }); const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto(`${base}tools/cast/poster.html?shot=${shot}&w=${w}&h=${h}`);
  await p.waitForFunction(() => window.done, null, { timeout: 120000 });
  // recadré au contenu (alpha), avec une petite marge
  const data = await p.evaluate(() => {
    const src = document.getElementById('c'), c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
    const g = c.getContext('2d'); g.drawImage(src, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data;
    let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    const m = 8; x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m); x1 = Math.min(c.width - 1, x1 + m); y1 = Math.min(c.height - 1, y1 + m);
    const o = document.createElement('canvas'); o.width = x1 - x0 + 1; o.height = y1 - y0 + 1; o.getContext('2d').drawImage(c, -x0, -y0);
    return o.toDataURL('image/png');
  });
  if (errs.length) throw new Error(errs.join('\n'));
  fs.writeFileSync(path.join(OUT, shot + '.png'), Buffer.from(data.split(',')[1], 'base64')); console.log(shot + '.png'); await p.close();
}
await b.close(); srv.close();
