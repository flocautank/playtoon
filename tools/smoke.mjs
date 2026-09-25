// Test de fumée Playtoon en Chromium headless : charge les trois onglets, joue un peu à chacun,
// échoue (code 1) à la moindre erreur console. Captures dans tools/shots/.
// Usage : node tools/smoke.mjs   (Playwright installé globalement)
import { createRequire } from 'module';
import { execSync } from 'child_process';
import http from 'http'; import fs from 'fs'; import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url);
const { chromium, devices } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));

const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const shots = path.join(root, 'tools', 'shots'); fs.mkdirSync(shots, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const srv = http.createServer((q, r) => {
  let f = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); r.end(d); });
}).listen(0);
const base = `http://localhost:${srv.address().port}/`;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errs = [];
const watch = (p, tag) => { p.on('pageerror', e => errs.push(`[${tag}] ${e.message}`)); p.on('console', m => { if (m.type() === 'error') errs.push(`[${tag}] ${m.text()}`); }); };
const shot = (p, n) => p.screenshot({ path: path.join(shots, n + '.png') });
const T0 = Date.now();
let lastStep = 'démarrage';
const log = (...a) => { lastStep = a.join(' ').slice(0, 60); console.log(`[${((Date.now() - T0) / 1000).toFixed(0)} s]`, ...a); };
// chien de garde : un gel de page (évaluation qui ne rend jamais la main) devient un échec lisible
let cdpDesk = null;   // session de débogage de la page principale, pour lire la pile en cas de gel
setTimeout(async () => {
  console.error(`GEL : plus de 300 s, dernière étape « ${lastStep} »`);
  if (cdpDesk) try {
    await cdpDesk.send('Debugger.enable');
    const paused = new Promise(r => cdpDesk.once('Debugger.paused', r));
    await cdpDesk.send('Debugger.pause');
    const ev = await Promise.race([paused, new Promise(r => setTimeout(() => r(null), 5000))]);
    if (ev) for (const f of ev.callFrames.slice(0, 12)) console.error('  at', f.functionName || '(anonyme)', f.url.split('/').pop() + ':' + (f.location.lineNumber + 1) + ':' + (f.location.columnNumber + 1));
    else console.error('  (la page ne répond pas au débogueur)');
  } catch (e) { console.error('  diagnostic impossible :', e.message); }
  process.exit(2);
}, 300000).unref();
// chaque action échoue en 20 s avec un message lisible, plutôt que de bloquer tout le test
const guard = async (p, welcome = false) => { p.setDefaultTimeout(20000); if (!welcome) await p.addInitScript(() => { try { localStorage.setItem('playtoon.welcomed', '1'); } catch (e) {} }); return p; };   // attendu : sinon la page peut charger avant le script

// ---------- desktop
const page = await guard(await browser.newPage({ viewport: { width: 1280, height: 760 } })); watch(page, 'desktop');
cdpDesk = await page.context().newCDPSession(page);
page.on('dialog', d => d.accept());
await page.goto(base + '#blocks'); await page.waitForTimeout(700); await shot(page, 'blocks');
await page.click('#bp-mapbtn'); await page.waitForTimeout(300); await shot(page, 'blocks-map');
await page.click('.bp-lv'); await page.waitForTimeout(500); await shot(page, 'blocks-adv');
log('aventure niv 1 :', await page.evaluate(() => {
  const { S, place, fits, N } = window.__bp;
  for (let k = 0; k < 40 && !S.over; k++) { let done = false; S.tray.forEach((pc, i) => { if (done || !pc) return; for (let y = 0; y < N && !done; y++) for (let x = 0; x < N && !done; x++) if (fits(pc, x, y)) { place(i, x, y); done = true; } }); if (!done) break; }
  return `terminé=${S.over} coups restants=${S.moves} gemmes=${S.got}/${S.goal.gems}`;
}));
await page.waitForTimeout(1000); await shot(page, 'blocks-res');
// seconde chance : +3 coups contre 25 pièces, une fois par tentative
if (await page.isVisible('#bp-resmore')) {
  await page.click('#bp-resmore'); await page.waitForTimeout(200);
  log('+3 coups :', await page.evaluate(() => {
    const { S, place, fits, N } = window.__bp; const m0 = S.moves, hidden = document.getElementById('bp-res').classList.contains('hidden');
    for (let k = 0; k < 10 && !S.over; k++) { let done = false; S.tray.forEach((pc, i) => { if (done || !pc) return; for (let y = 0; y < N && !done; y++) for (let x = 0; x < N && !done; x++) if (fits(pc, x, y)) { place(i, x, y); done = true; } }); if (!done) break; }
    return `coups=${m0} fenêtre fermée=${hidden} → fini à nouveau=${S.over}`;
  }));
  await page.waitForTimeout(1000);
  log('+3 coups proposé une 2e fois :', await page.isVisible('#bp-resmore'));
} else log('+3 coups : non proposé (niveau réussi)');
await page.click('#bp-resmap'); await page.click('#bp-classic'); await page.waitForTimeout(300);
// fin de partie classique : sortie vers les modes
await page.evaluate(() => window.__bp.gameOver()); await page.waitForTimeout(300);
await page.click('#bp-overmap'); await page.waitForTimeout(200);
log('fin de partie → Modes :', await page.isVisible('#bp-map'));
await page.click('#bp-mapclose'); await page.waitForTimeout(200);
log('carte fermée → écran de fin revient :', await page.isVisible('#bp-over'));
await page.click('#bp-overmap'); await page.click('#bp-classic'); await page.waitForTimeout(300);
log('partie classique relancée :', await page.evaluate(() => !window.__bp.S.over && window.__bp.S.score === 0));
// défi du jour : déterministe (mêmes pièces à chaque essai), meilleur du jour enregistré
await page.click('#bp-mapbtn'); await page.waitForTimeout(200); await page.click('#bp-daily'); await page.waitForTimeout(500); await shot(page, 'blocks-daily');
log('défi du jour :', await page.evaluate(() => {
  const { S, place, fits, startDaily, N } = window.__bp;
  const sig = () => JSON.stringify(S.tray.map(p => p && p.cells)) + JSON.stringify(S.board);
  const a = sig(); startDaily(); const b = sig();
  for (let k = 0; k < 12 && !S.over; k++) { let done = false; S.tray.forEach((pc, i) => { if (done || !pc) return; for (let y = 0; y < N && !done; y++) for (let x = 0; x < N && !done; x++) if (fits(pc, x, y)) { place(i, x, y); done = true; } }); }
  const d = JSON.parse(localStorage.getItem('blocparty.daily'));
  return `identique=${a === b} score=${S.score} meilleur=${d.best} série=${d.streak} mode=${S.mode}`;
}));
await page.click('#bp-mapbtn'); await page.waitForTimeout(200); await shot(page, 'blocks-map2'); await page.click('#bp-classic'); await page.waitForTimeout(300);
// chrono : le temps s'écoule, une ligne rend du temps, fin → top 10
await page.click('#bp-mapbtn'); await page.waitForTimeout(200); await page.click('#bp-chrono'); await page.waitForTimeout(1500); await shot(page, 'blocks-chrono');
log('chrono :', await page.evaluate(async () => {
  const { S, place, fits, N } = window.__bp; const t0 = S.clock;
  for (let k = 0; k < 10 && !S.over; k++) { let done = false; S.tray.forEach((pc, i) => { if (done || !pc) return; for (let y = 0; y < N && !done; y++) for (let x = 0; x < N && !done; x++) if (fits(pc, x, y)) { place(i, x, y); done = true; } }); }
  const t1 = S.clock;
  document.getElementById('bp-themebtn').click(); await new Promise(r => setTimeout(r, 1500));
  const t2 = S.clock; document.getElementById('bp-themeclose').click();
  window.__pauseOk = Math.abs(t2 - t1) < 0.05;
  S.clock = 0.05; await new Promise(r => setTimeout(r, 900));
  return `temps ${t0.toFixed(1)} → ${t1.toFixed(1)} s · en pause sous les thèmes=${window.__pauseOk} · fini=${S.over} · score=${S.score} · top10=${JSON.parse(localStorage.getItem('blocparty.chrono')).length}`;
}));
await page.waitForTimeout(600); await shot(page, 'blocks-chrono-end');
await page.click('#bp-again'); await page.waitForTimeout(300);
await page.click('#bp-mapbtn'); await page.waitForTimeout(200); await page.click('#bp-classic'); await page.waitForTimeout(300);
// boosters : on remplit un peu la grille, puis bombe au centre
await page.evaluate(() => window.GAMES.blocks.reward());   // +30 pièces : le test des « +3 coups » en a dépensé 25
await page.evaluate(() => { const { S, place, fits, N } = window.__bp; for (let k = 0; k < 4; k++) S.tray.forEach((pc, i) => { if (!pc) return; for (let y = 2; y < N; y++) for (let x = 2; x < N; x++) if (S.tray[i] && fits(pc, x, y)) { place(i, x, y); return; } }); });
const filledBefore = await page.evaluate(() => window.__bp.S.board.flat().filter(Boolean).length);
const coinsBefore = +(await page.$eval('#bp-coins', e => e.textContent));
await page.click('[data-tool=bomb]');
const bb = await page.$eval('#bp-canvas', c => { const r = c.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
await page.mouse.move(bb.x + bb.w / 2, bb.y + 113 - bb.y + 4.5 * 56.6); await page.waitForTimeout(200); await shot(page, 'blocks-bomb-aim');
await page.mouse.click(bb.x + bb.w / 2, bb.y + 113 - bb.y + 4.5 * 56.6); await page.waitForTimeout(500);
const filledAfter = await page.evaluate(() => window.__bp.S.board.flat().filter(Boolean).length);
log(`bombe : cases ${filledBefore} → ${filledAfter}, pièces ${coinsBefore} → ${await page.$eval('#bp-coins', e => e.textContent)}`);
await page.click('[data-tool=shuffle]'); await page.waitForTimeout(200); await shot(page, 'blocks-boost');
log('étape : Star Forge'); await page.goto(base + '#forge'); await page.waitForTimeout(700);
const intro = await page.$eval('#sf-intro', e => !e.classList.contains('hidden')); await shot(page, 'forge-intro'); if (intro) await page.click('#sf-intro-ok');
log('intro Star Forge affichée au 1er lancement :', intro);
for (let i = 0; i < 40; i++) await page.mouse.click(360, 390);
await page.waitForTimeout(300); await shot(page, 'forge');
for (const t of ['upg', 'meta', 'ach', 'opt', 'gen']) { await page.click(`[data-sf=${t}]`); await page.waitForTimeout(150); }
log('étape : Neon Bonk'); await page.goto(base + '#bonk'); await page.waitForTimeout(1200); await shot(page, 'bonk-menu');
await page.click('#nb-start'); await page.waitForTimeout(1500);
log('musique :', await page.evaluate(async () => {
  const m = window.__nb.music; if (!m.ctx) return 'pas de contexte audio';
  const S = window.__nb.S, prev = S.state; S.state = 'levelup';   // gèle la boucle, qui sinon recalcule l'intensité
  const an = m.ctx.createAnalyser(); an.fftSize = 2048; m.master.connect(an);
  const buf = new Float32Array(an.fftSize), res = [];
  for (const L of [0, 1, 2, 3]) {
    m.setLevel(L); await new Promise(r => setTimeout(r, 1200));
    let peak = 0, sum = 0; for (let k = 0; k < 10; k++) { an.getFloatTimeDomainData(buf); for (const v of buf) { sum += v * v; peak = Math.max(peak, Math.abs(v)); } await new Promise(r => setTimeout(r, 40)); }
    res.push(`N${L} rms=${Math.sqrt(sum / (buf.length * 10)).toFixed(3)} crête=${peak.toFixed(2)}`);
  }
  S.state = prev;
  return `état=${m.ctx.state} pas=${m.step} ` + res.join(' | ');
}));
const sim = await page.evaluate(() => {
  const nb = window.__nb, out = [];
  for (let step = 0; step < 30 * 90; step++) {
    const S = nb.S; if (S.state === 'end') break;
    if (S.state === 'levelup') { nb.pick((Math.random() * 3) | 0); continue; }
    if (S.state !== 'play') S.state = 'play';
    let vx = Math.cos(step / 300), vz = Math.sin(step / 300);
    for (const e of S.enemies) { const dx = S.p.x - e.x, dz = S.p.z - e.z, d2 = dx * dx + dz * dz; if (d2 < 64) { vx += dx * 6 / (d2 + .5); vz += dz * 6 / (d2 + .5); } }
    S.cam.yaw = Math.atan2(-vx, -vz); nb.keys.KeyW = true; nb.update(1 / 30);
  }
  nb.keys.KeyW = false;
  const S = nb.S; return `t=${S.t.toFixed(0)} niv=${S.level} kills=${S.kills} pv=${Math.round(S.p.hp)} ennemis=${S.enemies.length} état=${S.state}`;
});
log('bonk 90 s simulées :', sim);
await page.waitForTimeout(800); await shot(page, 'bonk-play');
log('caméra devant un obstacle :', await page.evaluate(async () => {
  const nb = window.__nb, S = nb.S, o = S.obst.find(q => q.kind === 'box' && q.top - 1 > 1.5);
  S.state = 'play'; S.enemies.length = 0;
  // joueur au pied du bloc, caméra orientée pour passer au travers
  S.p.x = o.x; S.p.z = o.z + o.hd + 1.2; S.p.y = S.p.y; S.cam.yaw = Math.PI; S.cam.pitch = 0.15;
  document.getElementById('nb-click').classList.add('hidden');
  await new Promise(r => setTimeout(r, 1500));   // la caméra se calcule dans la boucle de rendu
  S.cam.yaw = Math.PI; S.cam.pitch = 0.15;
  await new Promise(r => setTimeout(r, 800));
  return `distance caméra ${nb.camDist.toFixed(1)} (8,5 sans obstacle) · état=${S.state}`;
}));
log('bestiaire/sanctuaires :', await page.evaluate(() => {
  const nb = window.__nb, S = nb.S, out = [];
  S.state = 'play'; S.stats.hp = S.p.hp = 1e6; S.enemies.length = 0;
  const c = nb.spawnEnemy('charger', S.p.x + 10, S.p.z);
  c.hp = c.max = 1e9;   // qu'il survive au blaster le temps de charger
  let rush = false; for (let i = 0; i < 90; i++) { S.state = 'play'; S.pending = 0; nb.update(1 / 30); if (c.cst === 2) rush = true; }
  out.push('ruée=' + rush);
  S.enemies.length = 0;
  const sp = nb.spawnEnemy('splitter', S.p.x + 30, S.p.z); nb.update(1 / 30); nb.damage(sp, 1e9, false);
  out.push('enfants=' + S.enemies.filter(e => e.child).length);
  S.enemies.length = 0;
  const ch = S.shrines.find(x => x.kind === 'chal'); S.p.x = ch.x; S.p.z = ch.z; S.p.y = ch.y; nb.update(1 / 30); nb.interact();
  const el = S.enemies.filter(e => e.chal); out.push('élites=' + el.length);
  el.forEach(e => nb.damage(e, 1e12, false)); nb.update(1 / 30);
  const free = S.chests.find(x => x.free); out.push('coffre gratuit=' + !!free);
  if (free) { const gold = S.gold; S.p.x = free.x + 0.5; S.p.z = free.z; S.p.y = free.y; nb.update(1 / 30); nb.interact(); out.push('ouvert=' + free.open + ' or intact=' + (S.gold >= gold)); }
  const gr = S.shrines.find(x => x.kind === 'greed'); S.p.x = gr.x; S.p.z = gr.z; S.p.y = gr.y; nb.update(1 / 30); nb.interact(); out.push('avarice=' + S.greed);
  const j = S.jars.find(x => !x.broken); S.p.x = j.x; S.p.z = j.z; S.p.y = j.y; nb.update(1 / 30); out.push('jarre=' + j.broken);
  S.dmgDealt = 0;   // les dégâts de test gonfleraient les PV adaptatifs du boss
  return out.join(' ');
}));
await page.waitForTimeout(600); await shot(page, 'bonk-shrine');
log('évolution :', await page.evaluate(() => {
  const nb = window.__nb, S = nb.S;
  S.state = 'play'; S.enemies.length = 0;
  const w = S.weapons.find(x => x.id === 'blaster'); w.lvl = 8;
  if (!S.tomes.find(t => t.id === 'multi')) S.tomes.push({ id: 'multi', lvl: 1 });
  const c = { x: S.p.x + 0.5, y: S.p.y, z: S.p.z, open: false, free: true }; S.chests.push(c);
  c.mesh = { children: [null, { material: { uniforms: { uCore: { value: 0 } } } }] }; c.lid = { rotation: {}, position: {} };
  nb.update(1 / 30); nb.interact();
  for (let i = 0; i < 20; i++) nb.spawnEnemy('drone', S.p.x + 8 + i % 5, S.p.z + (i % 3));
  const before = S.kills; for (let i = 0; i < 150; i++) { S.state = 'play'; S.pending = 0; nb.update(1 / 30); }
  return `évoluée=${w.evo} · traits simultanés=${1 + w.count} · perforation=${w.pierce} · éliminations en 5 s=${S.kills - before}`;
}));
log('laser + mines :', await page.evaluate(() => {
  const nb = window.__nb, S = nb.S, out = [];
  S.state = 'play'; S.enemies.length = 0; S.weapons = S.weapons.filter(w => w.id === 'blaster'); S.weapons[0].t = 999;   // blaster muet
  nb.addWeapon('beam'); nb.addWeapon('mine');
  for (const [id, tome] of [['beam', 'wisdom'], ['mine', 'armor']]) {
    let k0 = S.kills;
    for (let i = 0; i < 12; i++) nb.spawnEnemy('drone', S.p.x + 4 + (i % 4) * 1.5, S.p.z + ((i / 4) | 0) * 1.5 - 1.5);
    for (let i = 0; i < 150; i++) { S.state = 'play'; S.pending = 0; S.p.hp = S.stats.hp; nb.update(1 / 30); }
    out.push(`${id} : ${S.kills - k0} élim., mines posées=${S.mines.length}`);
    S.enemies.length = 0;
    const w = S.weapons.find(x => x.id === id); w.lvl = 8; if (!S.tomes.find(t => t.id === tome)) S.tomes.push({ id: tome, lvl: 1 });
    const c = { x: S.p.x + 0.5, y: S.p.y, z: S.p.z, open: false, free: true, mesh: { children: [null, { material: { uniforms: { uCore: { value: 0 } } } }] }, lid: { rotation: {}, position: {} } };
    S.chests.push(c); nb.update(1 / 30); nb.interact(); out.push(`${id} évolué=${!!w.evo}`);
  }
  return out.join(' · ');
}));
await page.waitForTimeout(500); await shot(page, 'bonk-beam');
await page.keyboard.press('Escape'); await page.evaluate(() => { const S = window.__nb.S; if (S.state === 'play') document.getElementById('nb-timer').click(); });
await page.waitForTimeout(400); await shot(page, 'bonk-evo');
// parcours complet : boss 1 → portail → étape 2 → boss 2 → portail final
const killBossAndEnter = () => page.evaluate(() => {
  const nb = window.__nb, S = nb.S;
  S.state = 'play'; S.pending = 0; S.time = 0.02; S.stats.hp = S.p.hp = 1e6; S.stats.dmg = 50;
  for (let i = 0; i < 5; i++) nb.update(1 / 30);
  if (!S.boss) return 'pas de boss';
  const name = S.boss && document.querySelector('#nb-boss span').textContent;
  for (let i = 0; i < 900 && S.boss; i++) { S.enemies.length = 0; S.p.x = S.boss.x + 5; S.p.z = S.boss.z; S.state = 'play'; S.pending = 0; nb.update(1 / 30); }
  if (!S.portal) return 'boss vivant';
  S.p.x = S.portal.x + 1; S.p.z = S.portal.z; S.p.y = S.portal.y;
  nb.update(1 / 30); S.state = 'play'; S.pending = 0; nb.interact();   // l'XP du boss (semée en anneau) peut ouvrir un choix juste avant
  return `${name} vaincu → étape=${S.stage + 1} état=${S.state} gagné=${S.won}`;
});
log('boss 1 :', await killBossAndEnter());
await page.evaluate(() => { const nb = window.__nb; for (let i = 0; i < 30 * 20; i++) { if (nb.S.state === 'levelup') nb.pick(0); nb.S.state = 'play'; nb.update(1 / 30); } });
await page.waitForTimeout(900); await shot(page, 'bonk-stage2');
log('boss 2 :', await killBossAndEnter());
await page.evaluate(() => { const nb = window.__nb; for (let i = 0; i < 30 * 20; i++) { if (nb.S.state === 'levelup') nb.pick(0); nb.S.state = 'play'; nb.update(1 / 30); } });
await page.waitForTimeout(900); await shot(page, 'bonk-stage3');
// le Vide : gravité réduite, plateformes flottantes sur lesquelles on tient et sous lesquelles on passe
log('le Vide :', await page.evaluate(() => {
  const nb = window.__nb, S = nb.S, p = S.p, fl = S.obst.filter(o => o.bot !== undefined);
  if (!fl.length) return 'aucune plateforme flottante';
  S.enemies.length = 0; S.state = 'play'; S.pending = 0; S.stats.hp = p.hp = 1e6;
  // saut : hauteur atteinte
  p.x = 0; p.z = 0; p.y = 0; p.vx = p.vz = 0; for (let i = 0; i < 10; i++) nb.update(1 / 30);
  const y0 = p.y; nb.jump(); let top = y0; for (let i = 0; i < 90; i++) { nb.update(1 / 30); top = Math.max(top, p.y); }
  const o = fl.sort((a, b) => b.top - a.top)[0];
  p.x = o.x; p.z = o.z; p.y = o.top + 0.3; p.vx = p.vz = p.vy = 0;
  for (let i = 0; i < 30; i++) { S.enemies.length = 0; nb.update(1 / 30); }
  const on = Math.abs(p.y - o.top) < 0.05 && p.onGround;
  const low = fl.find(q => q.bot - q.top > -1 && q.bot > 2.2 + 0) || fl[0];
  p.x = low.x; p.z = low.z; p.y = 0; p.vy = 0; nb.update(1 / 30);
  const g = p.y; const under = Math.hypot(p.x - low.x, p.z - low.z) < 0.01 && g < low.bot;
  return `${fl.length} plateformes flottantes, saut ${(top - y0).toFixed(1)} u, tient au sommet (${o.top.toFixed(1)}) : ${on}, passe dessous : ${under}`;
}));
log('boss 3 :', await killBossAndEnter());
await page.waitForTimeout(400); await shot(page, 'bonk-win');
await page.click('#nb-again').catch(() => {}); await page.waitForTimeout(300);
await page.click('#nb-start'); await page.waitForTimeout(800);
await page.evaluate(() => { const S = window.__nb.S; if (S.state !== 'end') { S.state = 'play'; S.revives = 0; S.iframe = 0; S.stats.dodge = 0; S.stats.shield = 0; S.p.hp = 1; window.__nb.hurtTest && 0; } });
await page.click('#nb-quit').catch(() => {});
await page.evaluate(() => { const S = window.__nb.S; if (S.state !== 'end') { document.getElementById('nb-quit').click(); } });
await page.waitForTimeout(400); await shot(page, 'bonk-end');
await page.click('#nb-again').catch(() => {}); await page.waitForTimeout(400); await shot(page, 'bonk-menu2');
log('crédits après run :', await page.$eval('#nb-credits', e => e.textContent));
await page.close();

// ---------- Bloc Party : thèmes (500 pièces injectées)
{
  const t = await guard(await browser.newPage({ viewport: { width: 1280, height: 760 } })); watch(t, 'thèmes');
  await t.addInitScript(() => { if (!sessionStorage.getItem('inj')) { sessionStorage.setItem('inj', 1); localStorage.setItem('blocparty.coins', '500'); } });
  await t.goto(base + '#blocks'); await t.waitForTimeout(500);
  await t.click('#bp-themebtn'); await t.waitForTimeout(300); await shot(t, 'blocks-themes');
  const res = [];
  for (const i of [1, 3, 4]) {
    await t.click(`#bp-thgrid .bp-th:nth-child(${i + 1})`); await t.waitForTimeout(200);
    await t.click('#bp-themeclose');
    await t.evaluate(() => { const { S, place, fits, N } = window.__bp; for (let k = 0; k < 3; k++) S.tray.forEach((pc, j) => { if (!pc) return; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (S.tray[j] && fits(pc, x, y)) { place(j, x, y); return; } }); });
    await t.waitForTimeout(400); await shot(t, 'blocks-theme-' + i);
    if (await t.$eval('#bp-over', e => !e.classList.contains('hidden'))) await t.click('#bp-again');   // placements au hasard : partie parfois finie
    await t.click('#bp-themebtn'); await t.waitForTimeout(200);
  }
  const st = await t.evaluate(() => [localStorage.getItem('blocparty.themes'), localStorage.getItem('blocparty.coins')]);
  log('thèmes :', st.join(' · pièces='));
  await t.close();
}

// ---------- Star Forge : Big Bang (sauvegarde injectée : 250 Novae gagnées)
{
  const g = await guard(await browser.newPage({ viewport: { width: 1280, height: 760 } })); watch(g, 'big-bang');
  g.on('dialog', d => d.accept());
  await g.addInitScript(() => { if (!sessionStorage.getItem('inj')) { sessionStorage.setItem('inj', 1); localStorage.setItem('starforge.save.v1', JSON.stringify({ dust: 1e6, runTotal: 1e6, lifeTotal: 1e10, gens: [30, 20, 10, 5, 0, 0, 0, 0, 0, 0], upg: {}, novaTotal: 250, novaBank: 40, meta: { m_click: 1, m_auto: 1 }, ach: {}, prestiges: 12, chalDone: { c_hands: 1 }, last: Date.now() })); } });
  await g.goto(base + '#forge'); await g.waitForTimeout(500);
  log('événements :', await g.evaluate(async () => {
    const F = window.__sf, S = F.S, base = F.dps(), out = [];
    let tries = 0; do { F.spawnComet(); } while (!F.comet.meteor && ++tries < 500);
    F.catchComet(); out.push(`météore ×${(F.dps() / base).toFixed(0)}`);
    S.buffs = []; S.buffs.push({ type: 'eclipse', t: 45, max: 45 });
    out.push(`éclipse ×${(F.dps() / base).toFixed(1)}, clic=${F.clickValue()}`);
    await new Promise(r => setTimeout(r, 600));
    return out.join(' · ');
  }));
  await shot(g, 'forge-eclipse');
  await g.evaluate(() => { window.__sf.S.buffs = []; });
  await g.click('[data-sf=meta]'); await g.waitForTimeout(400); await shot(g, 'forge-bigbang');
  await g.click('#sf-bb-btn'); await g.waitForTimeout(200); await g.click('#pt-ok'); await g.waitForTimeout(400);
  let st = await g.evaluate(() => { const S = window.__sf.S; return { sing: S.sing, bank: S.singBank, nova: S.novaTotal, meta: Object.keys(S.meta).length, chal: Object.keys(S.chalDone).length }; });
  await g.click('#sf-gal .sf-item[data-id=g_auto]'); await g.waitForTimeout(200);
  await g.evaluate(() => { window.__sf.S.dust = 5000; });
  await g.waitForTimeout(2500);
  const gens = await g.evaluate(() => window.__sf.S.gens.reduce((a, b) => a + b, 0));
  await shot(g, 'forge-galaxy');
  log(`Big Bang : singularités=${st.sing} (banque ${st.bank}) · Novae après=${st.nova} · nœuds=${st.meta} · défis gardés=${st.chal} · forges achetées seules=${gens}`);
  await g.close();
}

// ---------- Star Forge : défis (sauvegarde injectée : 4 Supernovae, défi « Sans les mains » presque fini)
{
  const f = await guard(await browser.newPage({ viewport: { width: 1280, height: 760 } })); watch(f, 'forge-défis');
  f.on('dialog', d => d.accept());
  await f.addInitScript(() => { if (!sessionStorage.getItem('inj')) { sessionStorage.setItem('inj', 1); localStorage.setItem('starforge.save.v1', JSON.stringify({ dust: 1e5, runTotal: 9.9e5, lifeTotal: 5e8, gens: [50, 40, 20, 10, 2, 0, 0, 0, 0, 0], upg: {}, novaTotal: 30, novaBank: 5, meta: { m_click: 1 }, ach: {}, prestiges: 4, chal: 'c_hands', chalT: 0, chalDone: {}, last: Date.now() })); } });
  await f.goto(base + '#forge'); await f.waitForTimeout(600);
  const banner = await f.$eval('#sf-chal-txt', e => e.textContent);
  await f.click('#sf-tab-chal'); await f.waitForTimeout(3000); await shot(f, 'forge-chal');
  await f.click('[data-sf=gen]'); await f.goto(base + '#blocks'); await f.waitForTimeout(300);
  let st = await f.evaluate(() => JSON.parse(localStorage.getItem('starforge.save.v1')));
  log(`défi : bandeau « ${banner} » → réussis=${JSON.stringify(st.chalDone)} en cours=${st.chal}`);
  // lancer un défi depuis l'interface
  await f.goto(base + '#forge'); await f.waitForTimeout(500); await f.click('#sf-tab-chal'); await f.waitForTimeout(200);
  await f.click('.sf-ch[data-id=c_short] button'); await f.waitForTimeout(200); await shot(f, 'forge-modal'); await f.click('#pt-ok'); await f.waitForTimeout(400); await shot(f, 'forge-chal-run');
  await f.click('[data-sf=opt]'); await f.click('#sf-sci'); await f.waitForTimeout(300);
  log('notation scientifique :', await f.evaluate(() => window.__sf.fmt(1.234e9)));
  await f.click('#sf-sci');
  await f.goto(base + '#blocks'); await f.waitForTimeout(300);
  st = await f.evaluate(() => JSON.parse(localStorage.getItem('starforge.save.v1')));
  log(`défi lancé : en cours=${st.chal} poussière=${Math.round(st.dust)} novae=${st.novaTotal}`);
  await f.close();
}

// ---------- Profil : statistiques et export / import de toutes les sauvegardes
{
  const pr = await guard(await browser.newPage({ viewport: { width: 1280, height: 760 } })); watch(pr, 'profil');
  pr.on('dialog', d => d.accept());
  await pr.addInitScript(() => { if (!sessionStorage.getItem('inj')) { sessionStorage.setItem('inj', 1);
    localStorage.setItem('blocparty.best', '1234'); localStorage.setItem('blocparty.adv', JSON.stringify({ stars: { 1: 3, 2: 2 } }));
    localStorage.setItem('neonbonk.meta.v1', JSON.stringify({ runs: 7, wins: 1, bestTime: 612, maxLevel: 31, totalKills: 4321, bossKills: 2 }));
    localStorage.setItem('starforge.save.v1', JSON.stringify({ lifeTotal: 5e9, prestiges: 3, novaTotal: 40, ach: { a: 1 }, gens: [1], last: Date.now() })); } });
  await pr.goto(base + '#blocks'); await pr.waitForTimeout(500);
  await pr.click('#profile'); await pr.waitForTimeout(300); await shot(pr, 'profile');
  const txt = await pr.$eval('#pt-prof', e => e.innerText.replace(/\s+/g, ' '));
  await pr.click('#pt-profile summary'); await pr.click('#pt-exp');
  const code = await pr.$eval('#pt-io', e => e.value);
  await pr.evaluate(() => localStorage.setItem('blocparty.best', '1'));
  await pr.fill('#pt-io', code); await pr.click('#pt-imp'); await pr.waitForTimeout(200); await pr.click('#pt-ok'); await pr.waitForTimeout(1500);
  const back = await pr.evaluate(() => localStorage.getItem('blocparty.best') + ' / ' + JSON.parse(localStorage.getItem('starforge.save.v1')).prestiges);
  log(`profil : ${txt.slice(0, 160)}… · export ${code.length} car. · après import : record=${back}`);
  await pr.close();
}

// ---------- Accueil et objectifs du jour
{
  const h = await browser.newPage({ viewport: { width: 1280, height: 760 } }); await guard(h, true); watch(h, 'accueil');
  await h.goto(base); await h.waitForTimeout(600);
  const shown = await h.$eval('#pt-home', e => !e.classList.contains('hidden'));
  await shot(h, 'home');
  await h.click('#pt-home-close');
  await h.evaluate(() => { for (const [t, n] of [['bp_lines', 100], ['bp_pieces', 100], ['sf_forges', 100], ['sf_comets', 10], ['sf_clicks', 1000], ['nb_kills', 1000], ['nb_chests', 10], ['nb_time', 999]]) window.ptEvent(t, n); });
  await h.waitForTimeout(300); await shot(h, 'goals-toasts');
  await h.goto(base + '#blocks'); await h.waitForTimeout(300);
  const st = await h.evaluate(() => ({ goals: JSON.parse(localStorage.getItem('playtoon.goals')).done, coins: localStorage.getItem('blocparty.coins'), nova: (JSON.parse(localStorage.getItem('starforge.save.v1') || '{}').novaTotal), cr: JSON.parse(localStorage.getItem('neonbonk.meta.v1') || '{}').credits }));
  await h.click('#brand'); await h.waitForTimeout(300); await shot(h, 'home-goals');
  await h.click('#pt-home-close'); await h.click('#mute'); await h.click('#pt-mus'); await h.waitForTimeout(200); await shot(h, 'sound-menu');
  const mus = await h.evaluate(() => [window.PT_MUSIC, localStorage.getItem('playtoon.music')]);
  log(`accueil au 1er passage=${shown} · objectifs réussis=${JSON.stringify(st.goals)} · récompenses : pièces=${st.coins} Novae=${st.nova} crédits=${st.cr} · musique coupée depuis 🔊=${JSON.stringify(mus)}`);
  await h.close();
}

// ---------- PWA : manifeste, icônes, service worker, fonctionnement hors-ligne
{
  const ctxP = await browser.newContext({ viewport: { width: 1000, height: 700 } });
  const w = await guard(await ctxP.newPage()); watch(w, 'pwa');
  await w.goto(base + '#blocks'); await w.waitForTimeout(500);
  const man = await w.evaluate(async () => { const m = await (await fetch(document.querySelector('link[rel=manifest]').href)).json(); const ok = await Promise.all(m.icons.map(i => fetch(i.src).then(r => r.ok))); return `${m.name} · ${m.icons.length} icônes chargées=${ok.every(Boolean)} · start_url=${m.start_url}`; });
  const sw = await w.evaluate(async () => { const reg = await navigator.serviceWorker.ready; return reg.active ? reg.active.state : 'aucun'; });
  await w.reload(); await w.waitForTimeout(500);   // la page est désormais contrôlée par le service worker
  await ctxP.setOffline(true);
  await w.reload(); await w.waitForTimeout(800);
  const off = await w.evaluate(() => `${document.title} · jeux chargés=${!!(window.__bp && window.__sf && window.__nb)}`);
  await shot(w, 'pwa-offline');
  log(`PWA : ${man} · service worker=${sw} · hors-ligne : ${off}`);
  await ctxP.close();
}

// ---------- mobile
log('étape : mobile');
const ctx = await browser.newContext({ ...devices['iPhone 13'] });
const m = await guard(await ctx.newPage()); watch(m, 'mobile');
for (const t of ['blocks', 'forge', 'bonk']) {
  await m.goto(base + '#' + t); await m.waitForTimeout(900); await shot(m, 'm-' + t);
  if (t === 'forge') {
    if (await m.$eval('#sf-intro', e => !e.classList.contains('hidden'))) await m.tap('#sf-intro-ok');
    const r = await m.$eval('#sf-canvas', c => { const b = c.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
    for (let i = 0; i < 15; i++) await m.touchscreen.tap(r.x, r.y);
    await m.waitForTimeout(300);
    log('mobile : 15 touchers au centre de l\'étoile →', await m.$eval('#sf-dust', e => e.textContent), 'poussière');
    await m.evaluate(() => { window.__sf.S.dust = 1e5; window.__sf.S.gens[0] = 12; }); await m.tap('[data-sf=upg]'); await m.waitForTimeout(400);
    await m.tap('#sf-upg-grid .sf-upg'); await m.waitForTimeout(250); await shot(m, 'm-forge-tip');
    const before = await m.evaluate(() => Object.keys(window.__sf.S.upg).length);
    await m.tap('#sf-upg-grid .sf-upg'); await m.waitForTimeout(250);
    log('mobile : fiche au 1er toucher =', !!(await m.$('.sf-tip')) || 'fermée après achat', '· achat au 2e toucher :', before, '→', await m.evaluate(() => Object.keys(window.__sf.S.upg).length));
  }
}
await m.tap('#nb-start'); await m.waitForTimeout(1500); await shot(m, 'm-bonk-play');
// joystick : un pouce posé sur le cercle doit déplacer le personnage (régression : pointercancel du navigateur)
{
  const cdpM = await ctx.newCDPSession(m);
  const jr = await m.$eval('#nb-joy', e => { const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  const res = [];
  for (let k = 0; k < 2; k++) {
    const s0 = await m.evaluate(() => { const S = window.__nb.S; S.enemies.length = 0; S.p.hp = 1e6; return [S.p.x, S.p.z]; });
    await cdpM.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: jr.x, y: jr.y }] });
    for (let i = 1; i <= 10; i++) { await cdpM.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: jr.x, y: jr.y - i * 5 }] }); await m.waitForTimeout(30); }
    await m.waitForTimeout(1200); await cdpM.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    res.push(await m.evaluate(s0 => { const S = window.__nb.S; return +Math.hypot(S.p.x - s0[0], S.p.z - s0[1]).toFixed(1); }, s0));
  }
  log('mobile joystick sur le cercle : déplacements', res.join(' / '), res.every(d => d > 5) ? 'OK' : 'ÉCHEC');
}
await m.evaluate(() => { const S = window.__nb.S; S.xp = S.need * 1.01; window.__nb.update(1 / 30); });
await m.waitForTimeout(400); await shot(m, 'm-bonk-levelup');
const visibleCards = await m.$$eval('.nb-choice', els => els.filter(e => { const r = e.getBoundingClientRect(); return r.bottom <= innerHeight && r.top >= 0; }).length);
const rerollVisible = await m.$eval('#nb-reroll', e => { const r = e.getBoundingClientRect(); return r.bottom <= innerHeight; });
await m.tap('.nb-choice'); await m.waitForTimeout(300);
await m.tap('#nb-pausebtn'); await m.waitForTimeout(300);
log(`mobile Neon Bonk : cartes visibles=${visibleCards}/3 · « Relancer » visible=${rerollVisible} · pause au bouton=${await m.evaluate(() => window.__nb.S.state)}`);
await shot(m, 'm-bonk-pause');

await browser.close(); srv.close();
if (errs.length) { console.error('ERREURS :\n' + errs.join('\n')); process.exit(1); }
log('OK — aucune erreur console');
