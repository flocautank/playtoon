// Simule un joueur appliqué de Star Forge (3 clics/s, achète toujours le meilleur rendement)
// et mesure le temps jusqu'aux paliers de Supernova. Sert à régler la courbe de progression.
import { createRequire } from 'module'; import { execSync } from 'child_process';
import http from 'http'; import fs from 'fs'; import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const srv = http.createServer((q, r) => { let f = path.join(root, q.url.split('?')[0]); if (f.endsWith('/')) f += 'index.html'; fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : 'text/html' }); r.end(d); }); }).listen(0);
const b = await chromium.launch(); const p = await b.newPage();
p.on('pageerror', e => console.log('ERR', e.message));
await p.goto(`http://localhost:${srv.address().port}/#blocks`); await p.waitForTimeout(400);
const out = await p.evaluate(() => {
  const F = window.__sf, res = [];
  F.setMult(1);
  function run(label, maxMin, novaStop) {
    const S = F.S, marks = { '1e5': 1e5, '2e5 (1ʳᵉ Nova)': 2e5, '1e6 (2 Novae)': 1e6, '1e7 (7 Novae)': 1e7, '1e8 (22 Novae)': 1e8, '1e9': 1e9 }, seen = {};
    let t = 0;
    for (; t < maxMin * 60; t += 1) {
      for (let k = 0; k < 20; k++) F.tick(0.05);
      if (t < 1800) for (let c = 0; c < 3; c++) { const v = F.clickValue(); F.earn(v); S.clicks++; S.lifeClicks++; }
      // achat au meilleur rendement (coût / gain de production), améliorations comprises
      for (let guard = 0; guard < 20; guard++) {
        const base = F.dps() + 3 * F.clickValue(); let best = null;
        F.GENS.forEach((g, i) => { const c = F.costN(i, 1); if (c > S.dust) return; S.gens[i]++; const gain = F.dps() + 3 * F.clickValue() - base; S.gens[i]--; if (gain > 0) { const r = c / gain; if (!best || r < best.r) best = { r, f: () => F.buyGen(i) }; } });
        for (const u of F.UPGRADES) { if (S.upg[u.id] || !u.req(S)) continue; const c = F.upgCost(u); if (c > S.dust) continue; S.upg[u.id] = 1; const gain = F.dps() + 3 * F.clickValue() - base; delete S.upg[u.id]; const r = gain > 0 ? c / gain : 1e30; if (!best || r < best.r) best = { r, f: () => F.buyUpg(u) }; }
        if (!best) break; best.f();
      }
      for (const [k, v] of Object.entries(marks)) if (!seen[k] && S.runTotal >= v) seen[k] = (t / 60).toFixed(1) + ' min';
      if (novaStop && F.novaGain() >= novaStop) break;
    }
    res.push(`${label} : ` + Object.entries(seen).map(([k, v]) => `${k} → ${v}`).join(' · ') + ` · Novae à l'arrêt : ${F.novaGain()} (${(t / 60).toFixed(1)} min)`);
  }
  F.S = F.fresh(); run('Run 1 (sans méta)', 60, 20);
  const g = F.novaGain(); F.resetRun({ novaTotal: g, novaBank: g, prestiges: 1 }); run(`Run 2 (${g} Novae)`, 60, 60);
  return res.join('\n');
});
console.log(out);
await b.close(); srv.close();
