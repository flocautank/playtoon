// Fait jouer un solveur glouton sur chaque niveau d'aventure de Bloc Party et rapporte
// la réussite et les étoiles : sert à calibrer le nombre de coups par niveau.
import { createRequire } from 'module'; import { execSync } from 'child_process';
import http from 'http'; import fs from 'fs'; import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const srv = http.createServer((q, r) => { let f = path.join(root, q.url.split('?')[0]); if (f.endsWith('/')) f += 'index.html'; fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : 'text/html' }); r.end(d); }); }).listen(0);
const b = await chromium.launch(); const p = await b.newPage();
await p.goto(`http://localhost:${srv.address().port}/#blocks`); await p.waitForTimeout(500);
const res = await p.evaluate(() => {
  const { S, place, fits, startLevel, linesToClear, N } = window.__bp, out = [];
  for (let n = 1; n <= 40; n++) {
    startLevel(n);
    while (!S.over) {
      let best = null;
      S.tray.forEach((pc, i) => { if (!pc) return; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        if (!fits(pc, x, y)) continue;
        const bd = S.board.map(r => r.slice()); for (const [a, c] of pc.cells) bd[y + c][x + a] = 1;
        const { rows, cols } = linesToClear(bd); let g = 0, near = 0;
        for (const k of S.gems) { const gx = k % N, gy = (k / N) | 0; if (rows.includes(gy) || cols.includes(gx)) g++; else { near += bd[gy].filter(Boolean).length + bd.map(r => r[gx]).filter(Boolean).length; } }
        const sc = g * 1000 + (rows.length + cols.length) * 100 + near * 2 + Math.random();
        if (!best || sc > best.sc) best = { sc, i, x, y };
      } });
      if (!best) break;
      place(best.i, best.x, best.y);
    }
    const win = S.goal.type === 'gems' ? S.gems.size === 0 : S.lines >= S.goal.target;
    const st = win ? ((S.goal.moves - S.moves) / S.goal.moves <= 0.6 ? 3 : (S.goal.moves - S.moves) / S.goal.moves <= 0.8 ? 2 : 1) : 0;
    out.push(`${n}${S.goal.type === 'gems' ? '💎' : '▤'}:${win ? '★' + st : '✗'}(${S.goal.moves - S.moves}/${S.goal.moves})`);
  }
  return out.join(' ');
});
console.log(res); const w = (res.match(/★/g) || []).length; console.log(`réussis ${w}/40`);
await b.close(); srv.close();
