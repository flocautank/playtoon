// Génère les icônes PNG de la PWA (192, 512, 180 Apple, 512 masquable) en rendant le logo dans Chromium.
import { createRequire } from 'module'; import { execSync } from 'child_process';
import path from 'path'; import url from 'url'; import fs from 'fs';
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const b = await chromium.launch();
for (const [name, size, pad] of [['icon-192.png', 192, 0.14], ['icon-512.png', 512, 0.14], ['apple-touch-icon.png', 180, 0.14], ['icon-maskable-512.png', 512, 0.24]]) {
  const p = await b.newPage({ viewport: { width: size, height: size } });   // page neuve : setContent garde l'objet global
  await p.setContent(`<html><body style="margin:0"><canvas id="c" width="${size}" height="${size}"></canvas><script>
    const c = document.getElementById('c').getContext('2d'), S = ${size}, P = S * ${pad};
    const g = c.createLinearGradient(0, 0, S, S); g.addColorStop(0, '#2a1a5e'); g.addColorStop(1, '#0d0f1a');
    c.fillStyle = g; c.fillRect(0, 0, S, S);
    const cols = ['#ff5d8f', '#ffc94d', '#4dd4ff', '#7cff8a'], gap = S * 0.05, w = (S - 2 * P - gap) / 2;
    cols.forEach((col, i) => { const x = P + (i % 2) * (w + gap), y = P + (i >> 1) * (w + gap);
      c.shadowColor = col; c.shadowBlur = S * 0.06; c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, w, w * 0.22); c.fill();
      c.shadowBlur = 0; c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.roundRect(x + w * 0.18, y + w * 0.12, w * 0.64, w * 0.13, w * 0.06); c.fill(); });
    window.done = true;
  </script></body></html>`);
  await p.waitForFunction(() => window.done);
  const data = await p.evaluate(() => document.getElementById('c').toDataURL('image/png'));
  fs.writeFileSync(path.join(root, 'icons', name), Buffer.from(data.split(',')[1], 'base64'));
  await p.close();
}
await b.close();
console.log('icônes générées');
