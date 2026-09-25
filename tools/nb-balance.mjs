// Fait jouer N runs de Neon Bonk à un bot « humain » (fuit les ennemis proches, ramasse l'XP,
// choisit ses améliorations au hasard, n'ouvre rien) et rapporte la distribution de survie.
// Usage : node tools/nb-balance.mjs [runs=20]
import { createRequire } from 'module'; import { execSync } from 'child_process';
import http from 'http'; import fs from 'fs'; import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const N = +(process.argv[2] || 20);
const srv = http.createServer((q, r) => { let f = path.join(root, q.url.split('?')[0]); if (f.endsWith('/')) f += 'index.html'; fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : 'text/html' }); r.end(d); }); }).listen(0);
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 640, height: 400 } });
p.on('pageerror', e => console.log('ERR', e.message));
await p.goto(`http://localhost:${srv.address().port}/#bonk`); await p.waitForTimeout(1500);
await p.evaluate(() => { localStorage.setItem('neonbonk.meta.v1', JSON.stringify({ music: false })); });
const cdp = await p.context().newCDPSession(p);
// si une run ne rend jamais la main, on met la page en pause et on imprime la pile du code bloqué
async function stack() {
  const ok = await Promise.race([cdp.send('Debugger.enable').then(() => true), new Promise(r => setTimeout(() => r(false), 10000))]);
  if (!ok) return console.log('  le débogueur ne répond pas : fil principal bloqué hors JavaScript (appel natif, p. ex. WebGL)');
  const paused = new Promise(r => cdp.once('Debugger.paused', r));
  await cdp.send('Debugger.pause');
  const ev = await Promise.race([paused, new Promise(r => setTimeout(() => r(null), 5000))]);
  if (!ev) return console.log('  la page ne répond pas au débogueur');
  for (const f of ev.callFrames.slice(0, 14)) console.log('  at', f.functionName || '(anonyme)', f.url.split('/').pop() + ':' + (f.location.lineNumber + 1) + ':' + (f.location.columnNumber + 1));
  const sc = await cdp.send('Debugger.evaluateOnCallFrame', { callFrameId: ev.callFrames[0].callFrameId, expression: 'JSON.stringify({t: S.t, st: S.state, en: S.enemies.length, pk: S.pickups.length, lvl: S.level, xp: S.xp, need: S.need, pend: S.pending})' }).catch(e => ({ result: { value: e.message } }));
  console.log('  état :', sc.result && sc.result.value);
}
const runs = [];
for (let i = 0; i < N; i++) {
  let timer; const watchdog = new Promise(r => { timer = setTimeout(() => r('GEL'), 90000); });
  const res = await Promise.race([watchdog, p.evaluate(() => {
    const nb = window.__nb; nb.newRun(); const S = nb.S; let lv3 = 0, en3 = 0;
    for (let step = 0; step < 30 * 660; step++) {
      if (S.state === 'end') break;
      if (S.state === 'levelup') { nb.pick((Math.random() * 3) | 0); continue; }
      if (S.state !== 'play') S.state = 'play';
      let vx = Math.cos(step / 300), vz = Math.sin(step / 300), best = null, bd = 900;
      for (const k of S.pickups) { const d = (k.x - S.p.x) ** 2 + (k.z - S.p.z) ** 2; if (d < bd) { bd = d; best = k; } }
      if (best) { const d = Math.sqrt(bd) || 1; vx += (best.x - S.p.x) / d * 1.5; vz += (best.z - S.p.z) / d * 1.5; }
      for (const e of S.enemies) { const dx = S.p.x - e.x, dz = S.p.z - e.z, d2 = dx * dx + dz * dz; if (d2 < 64) { const w = 6 / (d2 + 0.5); vx += dx * w; vz += dz * w; } }
      if (Math.abs(S.p.x) > 80) vx -= Math.sign(S.p.x) * 2; if (Math.abs(S.p.z) > 80) vz -= Math.sign(S.p.z) * 2;
      S.cam.yaw = Math.atan2(-vx, -vz); nb.keys.KeyW = true; nb.update(1 / 30);
      if (step === 30 * 180) { lv3 = S.level; en3 = S.enemies.length; }
    }
    return { t: Math.round(S.t), lvl: S.level, lv3, en3, won: S.state !== 'end', hurt: S.hurtBy || {} };
  })]);
  clearTimeout(timer);
  if (res === 'GEL') { console.log(`GEL pendant la run ${i + 1} :`); await stack(); await b.close().catch(() => {}); process.exit(2); }
  runs.push(res);
}
runs.sort((a, b) => a.t - b.t);
const q = f => runs[Math.min(runs.length - 1, Math.floor(f * runs.length))].t, mm = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const avg = k => (runs.reduce((a, r) => a + r[k], 0) / runs.length).toFixed(1);
console.log(`${N} runs · survie : Q1 ${mm(q(0.25))} · médiane ${mm(q(0.5))} · Q3 ${mm(q(0.75))} · max ${mm(runs.at(-1).t)} · ≥ 5:00 : ${runs.filter(r => r.t >= 300).length} · boss atteint (10:00) : ${runs.filter(r => r.t >= 600).length}`);
const tot = {}; for (const r of runs) for (const [k, v] of Object.entries(r.hurt)) tot[k] = (tot[k] || 0) + v;
const sum = Object.values(tot).reduce((a, b) => a + b, 0) || 1;
console.log('dégâts subis : ' + Object.entries(tot).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${Math.round(v / sum * 100)} %`).join(' · '));
console.log(`à 3:00 : niveau moyen ${avg('lv3')}, ennemis en vie ${avg('en3')} · niveau final moyen ${avg('lvl')}`);
await b.close(); srv.close();
