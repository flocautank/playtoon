// Longue durée de Nova Foundry (refait en 1.9) : un joueur appliqué joue HRS heures d'affilée avec les VRAIES fonctions du
// jeu (Supernova, Big Bang, défis, Constellation, Maîtrise, Astérismes, Galaxie, Moteur, succès, commandes) et l'outil
// mesure le temps entre deux nouveautés — succès, nœud, stade de l'étoile, défi réussi, forge inédite, Big Bang,
// automatisation, astérisme complet, rang.
//   node tools/sf-long.mjs [HRS=40]    CPS=3 SN=30 (minutes par partie) SEED=1 ORD=0 (sans les Commandes : mesure « avant »)
// L'ancienne version (1.1) avait dérivé : elle ouvrait la page de Block Quarry (#blocks, ni comètes ni ciel), ne débloquait
// pas les forges de la Constellation et se bloquait sur elles (achat refusé, rien d'autre acheté), réimplémentait un Big Bang
// faux (seuil 200 Novae au lieu de 100 000, Maîtrise gardée) et ignorait succès, défis, Maîtrise et Astérismes.
import { createRequire } from 'module'; import { execSync } from 'child_process';
import http from 'http'; import fs from 'fs'; import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const srv = http.createServer((q, r) => { let f = path.join(root, q.url.split('?')[0]); if (f.endsWith('/')) f += 'index.html'; fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : 'text/html' }); r.end(d); }); }).listen(0);
const HRS = +(process.argv[2] || process.env.HRS || 40);
const CPS = +(process.env.CPS || 3), SN = +(process.env.SN || 30), SEED = +(process.env.SEED || 1), ORD = process.env.ORD !== '0';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage();
p.on('pageerror', e => console.log('ERR', e.message));
await p.addInitScript(seed => {
  window.PT_NOSAVE = 1; window.PT_MUTE = 1; localStorage.setItem('playtoon.welcomed', '1'); localStorage.setItem('starforge.intro', '1');
  let a = seed >>> 0; Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}, SEED);
await p.goto(`http://localhost:${srv.address().port}/#forge`); await p.waitForTimeout(1500);
const t0 = Date.now();
const out = await p.evaluate(({ HRS, CPS, SN, ORD }) => {
  const F = window.__sf; F.ordOff = !ORD; F.S = F.fresh();
  let T = 0; F.clock = () => T * 1000;   // délai de changement des commandes : en temps simulé
  const S = () => F.S;
  const ev = [], ms = {}, hourly = [];
  const mark = (k, lbl) => { if (!(k in ms)) ms[k] = +(T / 3600).toFixed(2); if (lbl) ev.push([T, lbl]); };
  const nOrd = () => (S().ord && S().ord.done) || 0;
  // --- achats de la partie : au meilleur rendement (coût / gain de production), contraintes des défis respectées
  function buyBest() {
    const s = S(), noU = s.chal === 'c_noupg';
    for (let guard = 0; guard < 60; guard++) {
      const base = F.dps() + CPS * F.clickValue(); let best = null;
      F.GENS.forEach((g, i) => { if (g.meta && !s.meta[g.meta]) return; if (s.chal === 'c_short' && i > 2) return; const c = F.costN(i, 1); if (c > s.dust) return; s.gens[i]++; const gain = F.dps() + CPS * F.clickValue() - base; s.gens[i]--; if (gain > 0) { const r = c / gain; if (!best || r < best.r) best = { r, f: () => { s.dust -= c; s.gens[i]++; } }; } });
      if (!noU) for (const u of F.UPGRADES) { if (s.upg[u.id] || !u.req(s)) continue; const c = F.upgCost(u); if (c > s.dust) continue; s.upg[u.id] = 1; const gain = F.dps() + CPS * F.clickValue() - base; delete s.upg[u.id]; const r = c / Math.max(gain, 1e-12); if (!best || r < best.r) best = { r, f: () => { s.dust -= c; s.upg[u.id] = 1; s.st.nUpg = (s.st.nUpg || 0) + 1; } }; }
      if (!best) break; best.f();
    }
  }
  // --- Commandes : forge visée achetée dès que possible, commande coincée depuis 20 min changée (si le changement est libre)
  const issued = new Map();
  function orders() {
    const s = S(); if (!s.ord) return;
    s.ord.list.forEach((o, i) => {
      if (!issued.has(o)) issued.set(o, T);
      if (o.k === 'own' && s.gens[o.a] < o.n) { const k = o.n - s.gens[o.a], c = F.costN(o.a, k); if (c <= s.dust) { s.dust -= c; s.gens[o.a] += k; } }
      if (T - issued.get(o) > 1200 && F.swapOrder(i)) issued.delete(o);
    });
  }
  // --- méta : nœuds les moins chers d'abord, puis Astérismes ou Maîtrise (le moins cher), comme tools/sf-pace.mjs
  function metaBuy() {
    const s = S();
    for (;;) { const c = F.META.filter(m => !s.meta[m.id] && m.req.every(q => s.meta[q]) && s.novaBank >= m.cost).sort((a, b) => a.cost - b.cost)[0]; if (!c) break; s.novaBank -= c.cost; s.meta[c.id] = 1; }
    const nx = () => F.META.filter(m => !s.meta[m.id] && m.req.every(q => s.meta[q])).sort((a, b) => a.cost - b.cost)[0];
    for (;;) {
      const n = nx(); if (n && s.novaBank < 2 * n.cost && F.mastCost() > n.cost * 0.25) break;
      const a = F.astOpen() ? F.AST.filter(x => ((s.ast || {})[x.id] || 0) < 10).sort((x, y) => F.astCost(x) - F.astCost(y))[0] : null;
      if (a && F.astCost(a) <= F.mastCost()) { if (!F.buyAst(a)) break; continue; }
      if (!F.buyMastery()) break;
    }
  }
  function galBuy() { for (;;) { const s = S(); const c = F.GALAXY.filter(x => !(s.gal && s.gal[x.id]) && (s.singBank || 0) >= x.cost).sort((a, b) => a.cost - b.cost)[0]; if (c) { F.buyGal(c); continue; } if (F.buyEngine()) continue; return; } }
  const full = () => F.META.every(m => S().meta[m.id]);
  // --- nouveautés : tout ce qui apparaît pour la première fois
  const seen = { ach: new Set(), meta: new Set(), chal: new Set(), gal: new Set(), astF: new Set(), stage: 0, gen: -1, rank: 0 };
  function novelty() {
    const s = S();
    for (const id in s.ach) if (!seen.ach.has(id)) { seen.ach.add(id); ev.push([T, 'succès ' + id]); }
    for (const id in s.meta) if (!seen.meta.has(id)) { seen.meta.add(id); ev.push([T, 'nœud ' + id]); }
    for (const id in s.chalDone || {}) if (!seen.chal.has(id)) { seen.chal.add(id); mark('chal_' + id, 'défi ' + id); }
    for (const id in s.gal || {}) if (!seen.gal.has(id)) { seen.gal.add(id); mark(id, 'galaxie ' + id); }
    for (const a of F.AST) if (((s.ast || {})[a.id] || 0) >= 10 && !seen.astF.has(a.id)) { seen.astF.add(a.id); mark('astFig' + seen.astF.size, 'astérisme ' + a.id); }
    const sg = F.stageOf(); if (sg > seen.stage) { seen.stage = sg; mark('stage' + sg, 'stade ' + sg); }
    const gm = s.gens.reduce((m, n, i) => n > 0 ? i : m, -1); if (gm > seen.gen) { seen.gen = gm; mark('gen' + gm, 'forge ' + gm); }
    const rk = F.rank(); if (rk > seen.rank) { seen.rank = rk; mark('rank' + rk, 'rang ' + rk); }
    if (seen.meta.size >= 33) mark('meta33'); if (full()) mark('constFull');
  }
  let tRun = 0, chalT = 0; const tries = {};
  let nextLog = 3600;
  while (T < HRS * 3600) {
    const s = S();
    for (let k = 0; k < 5; k++) F.tick(0.2);
    if (F.comet && Math.random() < 0.7) F.catchComet();
    for (const o of [...F.shoots]) if (Math.random() < 0.5) F.catchShoot(o);
    if (s.chal !== 'c_hands') for (let c = 0; c < CPS; c++) { const v = F.clickValue(); F.earn(v); s.clicks++; s.lifeClicks++; }
    F.idleT = 0;
    buyBest(); T++; tRun++;
    if (T % 5 === 0) { F.checkAch(); orders(); }
    if (T % 10 === 0) novelty();
    const S2 = S();
    if (S2.chal) {   // défi : abandonné au bout de 45 min
      if (++chalT > 2700) { F.resetRun({ chal: null }); tRun = 0; }
    } else {
      const g = F.novaGain(), so = S2.ord && S2.ord.list.find(o => o.k === 'sn');
      if ((tRun >= SN * 60 || (so && g >= so.n && tRun >= SN * 36)) && g >= 1) {
        F.snNow(); tRun = 0; if (S().prestiges === 1) mark('sn1', 'première Supernova');
        metaBuy();
        const c = F.CHALS.find(c => !(S().chalDone || {})[c.id] && S().prestiges >= c.need + 2 && (tries[c.id] || 0) < 3);
        if (c && S().prestiges % 3 === 0) { tries[c.id] = (tries[c.id] || 0) + 1; F.chalNow(c); chalT = 0; }
      }
      const s3 = S();
      if (!s3.chal && full() && s3.novaTotal >= F.BIGBANG_MIN && F.singGain() >= Math.max(1, s3.bigbangs ? (s3.sing || 0) * 0.5 : 1)) {
        F.bbNow(); tRun = 0; mark('bb' + S().bigbangs, 'Big Bang ' + S().bigbangs); galBuy(); metaBuy();
      }
    }
    if (T >= nextLog) {
      const s = S();
      hourly.push(`${nextLog / 3600} h : Novae ${F.fmt(s.novaTotal)} · SN ${s.prestiges} · nœuds ${Object.keys(s.meta).length}/${F.META.length} · Maîtrise ${s.mast || 0} · étoiles ${Object.values(s.ast || {}).reduce((x, y) => x + y, 0)} · succès ${Object.keys(s.ach).length}/${F.ACH.length} · défis ${Object.keys(s.chalDone || {}).length} · commandes ${nOrd()} (rang ${F.rank()}) · BB ${s.bigbangs || 0} · moteur ${s.eng || 0} · stade ${F.stageOf()}`);
      nextLog += 3600;
    }
  }
  return { ms, ev, hourly, orders: nOrd(), log: (S().log || []).length, byType: Object.keys(S().st).filter(k => k.startsWith('ord_')).map(k => k.slice(4) + ' ' + S().st[k]).join(', ') };
}, { HRS, CPS, SN, ORD });
console.log(`sf-long : ${HRS} h simulées, ${CPS} clics/s, Supernova toutes les ${SN} min, graine ${SEED}, Commandes ${ORD ? 'oui' : 'non'} (${((Date.now() - t0) / 1000).toFixed(0)} s de calcul)`);
console.log('jalons (heures) :', JSON.stringify(out.ms));
out.hourly.forEach(l => console.log('  ' + l));
// temps entre deux nouveautés, par tranche de la partie
const evs = out.ev.slice().sort((a, b) => a[0] - b[0]);
const gaps = []; for (let i = 1; i < evs.length; i++) gaps.push([evs[i - 1][0], evs[i][0] - evs[i - 1][0], evs[i][1]]);
const brk = [[0, 1], [1, 3], [3, 10], [10, 20], [20, 30], [30, 40], [40, 1e9]].filter(([a]) => a < HRS);
console.log('nouveautés (succès, nœuds, stades, défis, forges, galaxie, astérismes, rangs, Big Bangs) :');
for (const [a, z] of brk) {
  const g = gaps.filter(x => x[0] >= a * 3600 && x[0] < z * 3600).map(x => x[1]).sort((p, q) => p - q);
  const n = evs.filter(e => e[0] >= a * 3600 && e[0] < z * 3600).length;
  const med = g.length ? g[g.length >> 1] : 0, max = g.length ? g[g.length - 1] : 0;
  console.log(`  ${a}–${Math.min(z, HRS)} h : ${n} nouveautés · écart médian ${(med / 60).toFixed(1)} min · plus long ${(max / 60).toFixed(0)} min`);
}
const tail = evs.length ? HRS * 3600 - evs[evs.length - 1][0] : HRS * 3600;
console.log('  plus longs creux :', gaps.sort((p, q) => q[1] - p[1]).slice(0, 6).map(x => `${(x[0] / 3600).toFixed(1)} h + ${(x[1] / 60).toFixed(0)} min → ${x[2]}`).join(' | '), `| fin : ${(tail / 60).toFixed(0)} min sans rien`);
if (ORD) console.log(`  commandes livrées : ${out.orders} (${out.byType}) · entrées du Carnet : ${out.log}`);
await b.close(); srv.close();
