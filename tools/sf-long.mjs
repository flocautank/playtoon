// Simule un joueur appliqué de Nova Foundry sur une longue partie (8 h de jeu) : Supernova dès que le gain
// double les Novae, Constellation achetée au moins cher, Big Bang une fois la Constellation complète.
// Mesure la durée de vie des couches de prestige (sert à régler les plafonds doux de fin de partie).
import { createRequire } from 'module'; import { execSync } from 'child_process';
import http from 'http'; import fs from 'fs'; import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const srv = http.createServer((q, r) => { let f = path.join(root, q.url.split('?')[0]); if (f.endsWith('/')) f += 'index.html'; fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : 'text/html' }); r.end(d); }); }).listen(0);
const HOURS = +(process.argv[2] || 8);
const b = await chromium.launch(); const p = await b.newPage();
p.on('pageerror', e => console.log('ERR', e.message));
await p.addInitScript(() => { window.PT_NOSAVE = 1; window.PT_MUTE = 1; localStorage.setItem('playtoon.welcomed', '1'); localStorage.setItem('starforge.intro', '1'); });
await p.goto(`http://localhost:${srv.address().port}/#blocks`); await p.waitForTimeout(600);
const out = await p.evaluate(HOURS => {
  const F = window.__sf; F.setMult(1); F.S = F.fresh();
  const GAL = F.GALAXY || [{ id: 'g_auto', cost: 1 }, { id: 'g_comet', cost: 1 }, { id: 'g_nova', cost: 2 }, { id: 'g_upg', cost: 3 }, { id: 'g_big', cost: 5 }];
  const sing = () => F.singGain ? F.singGain() : Math.floor(Math.sqrt(F.S.novaTotal / 50));
  const log = [], ms = {}; let t = 0, tRun = 0;
  const mark = k => { if (!(k in ms)) ms[k] = Math.round(t / 60); };
  function step() {
    for (let k = 0; k < 4; k++) F.tick(0.5);
    t += 2; tRun += 2; const S = F.S;
    for (let c = 0; c < 6; c++) { F.earn(F.clickValue()); S.clicks++; S.lifeClicks++; }
    for (let guard = 0; guard < 40; guard++) {
      const base = F.dps() + 3 * F.clickValue(); let best = null;
      F.GENS.forEach((g, i) => { const c = F.costN(i, 1); if (c > S.dust) return; S.gens[i]++; const gain = F.dps() + 3 * F.clickValue() - base; S.gens[i]--; if (gain > 0) { const r = c / gain; if (!best || r < best.r) best = { r, f: () => F.buyGen(i) }; } });
      for (const u of F.UPGRADES) { if (S.upg[u.id] || !u.req(S)) continue; const c = F.upgCost(u); if (c > S.dust) continue; S.upg[u.id] = 1; const gain = F.dps() + 3 * F.clickValue() - base; delete S.upg[u.id]; const r = c / Math.max(gain, 1e-9); if (!best || r < best.r) best = { r, f: () => F.buyUpg(u) }; }
      if (!best) break; best.f();
    }
  }
  const metaBuy = () => { for (;;) { const c = F.META.filter(m => !F.S.meta[m.id] && m.req.every(q => F.S.meta[q]) && F.S.novaBank >= m.cost).sort((a, b) => a.cost - b.cost)[0]; if (!c) return; F.buyMeta(c); } };
  const galBuy = () => { for (;;) { const S = F.S; const c = GAL.filter(x => !(S.gal && S.gal[x.id]) && (S.singBank || 0) >= x.cost).sort((a, b) => a.cost - b.cost)[0]; if (c) { S.gal[c.id] = 1; S.singBank -= c.cost; continue; } if (F.buyEngine && F.buyEngine()) continue; return; } };
  const full = () => F.META.every(m => F.S.meta[m.id]);
  let nextLog = 3600;
  while (t < HOURS * 3600) {
    step();
    const S = F.S, g = F.novaGain();
    if (g >= 1 && (g >= S.novaTotal * 0.5 || (tRun >= 900 && g >= S.novaTotal * 0.1))) { tRun = 0; if (!S.prestiges) mark('sn1'); F.resetRun({ novaTotal: S.novaTotal + g, novaBank: S.novaBank + g, prestiges: S.prestiges + 1 }); metaBuy(); if (full()) mark('constFull'); }
    if (full() && F.S.novaTotal >= 200 && sing() >= 1 && (F.S.bigbangs ? sing() >= Math.max(1, (F.S.sing || 0) * 0.5) : true)) {
      const gs = sing(); mark('bb' + ((F.S.bigbangs || 0) + 1));
      const start = F.S.gal && F.S.gal.g_nova ? 10 : 0;
      F.resetRun({ novaTotal: start, novaBank: start, meta: {}, sing: (F.S.sing || 0) + gs, singBank: (F.S.singBank || 0) + gs, bigbangs: (F.S.bigbangs || 0) + 1 });
      if (F.S.gal && F.S.gal.g_nova) F.S.meta = { m_click: 1 };
      galBuy(); metaBuy();
    }
    if (GAL.every(x => F.S.gal && F.S.gal[x.id])) mark('galaxyFull');
    if (t >= nextLog) { log.push(`${nextLog / 3600}h: novae ${F.fmt(F.S.novaTotal)} · SN ${F.S.prestiges} · sing ${F.S.sing || 0} · BB ${F.S.bigbangs || 0}${F.S.eng ? ' · moteur ' + F.S.eng : ''}`); nextLog += 3600; }
  }
  return { ms, log };
}, HOURS);
console.log('jalons (minutes de jeu) :', JSON.stringify(out.ms));
out.log.forEach(l => console.log(' ', l));
await b.close(); srv.close();
