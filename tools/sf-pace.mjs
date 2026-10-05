// Rythme de la méta de Nova Foundry : un bot (3 clics/s, 70 % des comètes, achats au meilleur rendement) enchaîne les
// Supernovae et achète la Constellation (puis la Maîtrise). Une ligne par partie : heure cumulée, gain, Novae totales,
// nœuds possédés, niveau de Maîtrise, améliorations achetées après 2 min et en fin de partie.
//   node tools/sf-pace.mjs [time30|time15|time60|double|rate|meta] [clics/s]      RUNS=40 HRS=20 TUNE='{"cap":100}'
import { createRequire } from 'module'; import { execSync } from 'child_process';
import http from 'http'; import fs from 'fs'; import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const srv = http.createServer((q, r) => { let f = path.join(root, q.url.split('?')[0]); if (f.endsWith('/')) f += 'index.html'; fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : 'text/html' }); r.end(d); }); }).listen(0);
const POLICY = process.argv[2] || 'time30';
const CPS = +(process.argv[3] || 3);
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const p = await b.newPage();
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.addInitScript(() => { window.PT_NOSAVE = 1; window.PT_MUTE = 1; localStorage.setItem('playtoon.welcomed', '1'); localStorage.setItem('starforge.intro', '1'); });
  await p.goto(`http://localhost:${srv.address().port}/#forge`); await p.waitForTimeout(1000);
  const out = await p.evaluate(({ POLICY, CPS, RUNS, HRS, TUNE }) => {
    const F = window.__sf; if (TUNE) Object.assign(F.NOVA, TUNE); F.S = F.fresh(); let S = F.S;
    const NU = F.UPGRADES.length, NM = F.META.length;
    const runs = []; let T = 0;
    const metaBuy = () => { const got = []; for (;;) { const c = F.META.filter(m => !S.meta[m.id] && m.req.every(q => S.meta[q]) && S.novaBank >= m.cost).sort((a, b) => a.cost - b.cost)[0]; if (!c) break; S.novaBank -= c.cost; S.meta[c.id] = 1; got.push(c.id); } const nx = () => F.META.filter(m => !S.meta[m.id] && m.req.every(q => S.meta[q])).sort((a, b) => a.cost - b.cost)[0]; for (;;) { const n = nx(); if (n && S.novaBank < 2 * n.cost && F.mastCost() > n.cost * 0.25) break; if (!F.buyMastery()) break; got.push('M'); } return got; };
    const ach = () => { let n = 0; return n; };
    const nUpg = () => Object.keys(S.upg).length;
    function buyBest() {
      for (let guard = 0; guard < 60; guard++) {
        const base = F.dps() + CPS * F.clickValue(); let best = null;
        F.GENS.forEach((g, i) => { if (g.meta && !S.meta[g.meta]) return; const c = F.costN(i, 1); if (c > S.dust) return; S.gens[i]++; const gain = F.dps() + CPS * F.clickValue() - base; S.gens[i]--; if (gain > 0) { const r = c / gain; if (!best || r < best.r) best = { r, f: () => { S.dust -= c; S.gens[i]++; } }; } });
        for (const u of F.UPGRADES) { if (S.upg[u.id] || !u.req(S)) continue; const c = F.upgCost(u); if (c > S.dust) continue; S.upg[u.id] = 1; const gain = F.dps() + CPS * F.clickValue() - base; delete S.upg[u.id]; const r = c / Math.max(gain, 1e-12); if (!best || r < best.r) best = { r, f: () => { S.dust -= c; S.upg[u.id] = 1; } }; }
        if (!best) break; best.f();
      }
    }
    for (let run = 1; run <= RUNS && T < HRS * 3600; run++) {
      S = F.S; let t = 0, peak = 0, rec = { run, novaStart: S.novaTotal, meta: Object.keys(S.meta).length, upgAt: {}, firstNova: null };
      const prevEnd = runs.length ? runs[runs.length - 1].runTotal : null; let reachPrev = null;
      for (;;) {
        for (let k = 0; k < 5; k++) F.tick(0.2);
        if (F.comet) { if (Math.random() < 0.7) F.catchComet(); }
        for (let c = 0; c < CPS; c++) { const v = F.clickValue(); F.earn(v); S.clicks++; S.lifeClicks++; }
        buyBest(); t++; T++; if (t % 5 === 0) { for (const a of [1]) {} }
        for (const m of [30, 60, 120, 300, 600, 1800]) if (t === m) rec.upgAt[m / 60 + 'min'] = nUpg();
        if (rec.firstNova === null && F.novaGain() >= 1) rec.firstNova = t;
        if (prevEnd && reachPrev === null && S.runTotal >= prevEnd) reachPrev = t;
        const g = F.novaGain();
        let go = false;
        if (POLICY === 'rate') { const r = g / t; if (r > peak) peak = r; go = g >= 1 && t > 120 && r < 0.9 * peak; }
        else if (POLICY === 'double') { go = run === 1 ? g >= 4 : g >= Math.max(1, S.novaTotal); }
        else if (POLICY.startsWith('time')) { go = t >= +POLICY.slice(4) * 60 && g >= 1; }
        else if (POLICY === 'meta') { // prestige when gain can buy next meta node
          const nxt = F.META.filter(m => !S.meta[m.id] && m.req.every(q => S.meta[q])).sort((a, b) => a.cost - b.cost)[0];
          go = g >= 1 && (nxt ? S.novaBank + g >= nxt.cost : g >= S.novaTotal) && t > 60; }
        if (go || t > 4 * 3600) {
          Object.assign(rec, { dur: t, gain: g, runTotal: S.runTotal, upgEnd: nUpg(), gens: S.gens.reduce((a, b) => a + b, 0), dps: F.dps(), reachPrev, avail: F.UPGRADES.filter(u => !S.upg[u.id] && u.req(S)).length, lockedUpg: F.UPGRADES.filter(u => !S.upg[u.id] && !u.req(S)).length });
          F.resetRun({ novaTotal: S.novaTotal + g, novaBank: S.novaBank + g, prestiges: S.prestiges + 1 });
          S = F.S; rec.bought = metaBuy().join(','); rec.mast = S.mast; rec.metaAfter = Object.keys(S.meta).length; rec.bankAfter = S.novaBank; rec.novaTotalAfter = S.novaTotal; rec.ach = Object.keys(S.ach).length;
          rec.T = +(T / 3600).toFixed(2); runs.push(rec); break;
        }
      }
    }
    return { NU, NM, runs, fmt: null };
  }, { POLICY, CPS, RUNS: +(process.env.RUNS||12), HRS: +(process.env.HRS||30), TUNE: process.env.TUNE ? JSON.parse(process.env.TUNE) : null });
  console.log('POLICY', POLICY, 'CPS', CPS, 'upgrades', out.NU, 'meta', out.NM);
  for (const r of out.runs) console.log([r.run, 'h' + r.T, 'gain ' + r.gain, 'nova ' + r.novaTotalAfter, 'meta ' + r.metaAfter, 'mast ' + r.mast, 'upg2m ' + r.upgAt['2min'], 'upgEnd ' + r.upgEnd, 'first ' + r.firstNova].join(' | '));
  await b.close(); srv.close();
