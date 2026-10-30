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
// capture : une nouvelle tentative plus patiente si la machine est chargée (WebGL logiciel très lent sous charge)
const shot = (p, n) => p.screenshot({ path: path.join(shots, n + '.png') }).catch(() => p.screenshot({ path: path.join(shots, n + '.png'), timeout: 90000 }));
const T0 = Date.now();
let lastStep = 'démarrage';
const log = (...a) => { lastStep = a.join(' ').slice(0, 60); console.log(`[${((Date.now() - T0) / 1000).toFixed(0)} s]`, ...a); };
// chien de garde : un gel de page (évaluation qui ne rend jamais la main) devient un échec lisible
let cdpDesk = null;   // session de débogage de la page principale, pour lire la pile en cas de gel
setTimeout(async () => {
  console.error(`GEL : plus de ${process.env.SMOKE_MAX_S || 900} s, dernière étape « ${lastStep} »`);
  if (cdpDesk) try {
    await cdpDesk.send('Debugger.enable');
    const paused = new Promise(r => cdpDesk.once('Debugger.paused', r));
    await cdpDesk.send('Debugger.pause');
    const ev = await Promise.race([paused, new Promise(r => setTimeout(() => r(null), 5000))]);
    if (ev) for (const f of ev.callFrames.slice(0, 12)) console.error('  at', f.functionName || '(anonyme)', f.url.split('/').pop() + ':' + (f.location.lineNumber + 1) + ':' + (f.location.columnNumber + 1));
    else console.error('  (la page ne répond pas au débogueur)');
  } catch (e) { console.error('  diagnostic impossible :', e.message); }
  process.exit(2);
}, (+process.env.SMOKE_MAX_S || 900) * 1000).unref();   // durée totale ; chaque action a en plus son propre délai de 20 s
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
// la grille du défi change chaque jour : les placements au hasard peuvent finir la partie, l'écran de fin masquerait alors la suite
await page.waitForTimeout(1500); await page.evaluate(() => document.getElementById('bp-over').classList.add('hidden'));   // l'écran de fin s'arme avec un délai (≥ 1,3 s)
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
  S.clock = 0.05; for (let i = 0; i < 40 && !S.over; i++) await new Promise(r => setTimeout(r, 100));   // machine chargée : on attend la fin (≤ 4 s) au lieu d'un délai fixe
  return `temps ${t0.toFixed(1)} → ${t1.toFixed(1)} s · en pause sous les thèmes=${window.__pauseOk} · fini=${S.over} · score=${S.score} · top10=${(JSON.parse(localStorage.getItem('blocparty.chrono')) || []).length}`;
}));
await page.waitForTimeout(600); await shot(page, 'blocks-chrono-end');
await page.click('#bp-again'); await page.waitForTimeout(300);
await page.click('#bp-mapbtn'); await page.waitForTimeout(200); await page.click('#bp-classic'); await page.waitForTimeout(300);
// boosters : on remplit un peu la grille, puis bombe au centre
await page.evaluate(() => window.GAMES.blocks.reward());   // +30 pièces : le test des « +3 coups » en a dépensé 25
// grille remplie directement (motif fixe, aucune ligne complète) : la partie ne peut pas se terminer pendant le test
await page.evaluate(() => { const { S, N } = window.__bp; for (let y = 2; y < 7; y++) for (let x = 1; x < 7; x++) S.board[y][x] = '#ff5d8f'; S.over = false; });
const filledBefore = await page.evaluate(() => window.__bp.S.board.flat().filter(Boolean).length);
const coinsBefore = +(await page.$eval('#bp-coins', e => e.textContent));
await page.click('[data-tool=bomb]');
// centre de la case (4, 4), d'après la mise en page du jeu
const bb = await page.$eval('#bp-canvas', c => { const r = c.getBoundingClientRect(), L = window.__bp.L; return { x: r.left + L.bx + 4.5 * L.cs, y: r.top + L.by + 4.5 * L.cs }; });
await page.mouse.move(bb.x, bb.y); await page.waitForTimeout(200); await shot(page, 'blocks-bomb-aim');
await page.mouse.click(bb.x, bb.y); await page.waitForTimeout(500);
const filledAfter = await page.evaluate(() => window.__bp.S.board.flat().filter(Boolean).length);
log(`bombe : cases ${filledBefore} → ${filledAfter}, pièces ${coinsBefore} → ${await page.$eval('#bp-coins', e => e.textContent)}`);
await page.click('[data-tool=shuffle]'); await page.waitForTimeout(200); await shot(page, 'blocks-boost');
// Carnet (1.9.0) : une mission remplie se récupère une seule fois, en pièces
{
  const r = await page.evaluate(() => { const B = window.__bp, w = B.ensureWeek(), id = w.ids[0]; B.track(id, B.MISSIONS[id][0]); return { id, n: w.ids.length }; });
  await page.click('#bp-carbtn'); await page.waitForTimeout(300); await shot(page, 'blocks-career');
  const c0 = +(await page.$eval('#bp-coins', e => e.textContent));
  await page.click(`[data-claim="${r.id}"]`); await page.waitForTimeout(200);
  const c1 = +(await page.$eval('#bp-coins', e => e.textContent)), again = await page.$(`[data-claim="${r.id}"]`);
  log(`carnet : ${r.n} missions, « ${r.id} » récupérée ${c0} → ${c1} pièces, 2e récupération possible : ${!!again}`);
  if (r.n !== 3 || c1 - c0 < 40 || again) errs.push('[desktop] Carnet : mission mal récupérée');
  await page.click('#bp-carclose');
}
// missions de filon et de géode (1.17.0) : elles progressent, et le tirage n'en propose pas avant le chapitre concerné
{
  const r = await page.evaluate(() => {
    const B = window.__bp, w = B.ensureWeek(); w.ids = ['vein', 'geode', 'lines']; w.p = {}; B.track('vein', 25); B.track('geode', 2);
    return { vein: w.p.vein, geode: w.p.geode, def: !!B.MISSIONS.vein && !!B.MISSIONS.geode };
  });
  log(`missions filon/géode : ${JSON.stringify(r)}`);
  if (!r.def || r.vein !== 25 || r.geode !== 2) errs.push('[desktop] missions filon/géode ne progressent pas');
  await page.evaluate(() => { const w = window.__bp.ensureWeek(); w.ids = w.ids.filter(i => i !== 'vein' && i !== 'geode'); while (w.ids.length < 3) w.ids.push('pieces'); w.p = {}; w.got = {}; });
}
// 1.11.2 : défauts corrigés (un test chacun)
{
  // givre sous un bloc : la masse brise le bloc ET la plaque (elle restait sous le bloc)
  await page.evaluate(() => { const B = window.__bp, S = B.S; window.GAMES.blocks.reward(); B.startLevel(41); const i = [...S.ice][0]; S.board[(i / 8) | 0][i % 8] = '#ff5d8f'; window.__iceCell = i; });
  await page.click('[data-tool=hammer]');
  const ic = await page.$eval('#bp-canvas', c => { const r = c.getBoundingClientRect(), L = window.__bp.L, i = window.__iceCell; return { x: r.left + L.bx + (i % 8 + .5) * L.cs, y: r.top + L.by + (((i / 8) | 0) + .5) * L.cs }; });
  await page.mouse.click(ic.x, ic.y); await page.waitForTimeout(200);
  const iceLeft = await page.evaluate(() => window.__bp.S.ice.has(window.__iceCell));
  log('masse sur un bloc posé sur le givre : plaque brisée', !iceLeft); if (iceLeft) errs.push('[desktop] givre resté sous un bloc brisé à la masse');
  // 1.12.0 : veine de couleur (niveau 61) — seules les cases de la couleur désignée comptent, les boosters aussi
  const vn = await page.evaluate(() => {
    const B = window.__bp, S = B.S; B.startLevel(61); const g = S.goal, other = ['#ff5d8f', '#ffc94d', '#4dd4ff'].find(c => c !== g.color);
    const pcs = S.tray.filter(Boolean).length;
    for (let x = 0; x < 8; x++) S.board[7][x] = x < 3 ? g.color : other; for (let x = 0; x < 8; x++) { if (S.board[6][x]) S.board[6][x] = null; }
    S.vein = 0; const before = S.vein; S.tray[0] = { cells: [[0, 0]], w: 1, h: 1, color: other }; S.board[6].fill(null); S.board[7][7] = null;
    B.place(0, 7, 7);   // ferme la rangée 7 : 3 cases de la couleur désignée partent
    return { type: g.type, need: g.need, got: S.vein, before, pcs };
  });
  log(`veine de couleur : niveau 61 « ${vn.type} », ${vn.got} cases comptées sur 3 attendues`);
  if (vn.type !== 'color' || vn.got !== 3) errs.push('[desktop] veine de couleur : décompte faux (' + JSON.stringify(vn) + ')');
  // 1.16.0 : géode (niveau 81) — gemmes ET givre : la victoire exige les deux ; la carte compte 10 chapitres
  const gd = await page.evaluate(() => {
    const B = window.__bp, S = B.S; B.startLevel(81); const g = S.goal, n0 = S.gems.size, i0 = S.ice.size;
    S.gems.clear(); const mid = S.ice.size > 0 && g.type === 'mix' && !B.goalWon();
    S.ice.clear(); return { type: g.type, n0, i0, mid, end: B.goalWon() };
  });
  log(`géode : niveau 81 « ${gd.type} », ${gd.n0} gemmes + ${gd.i0} givre ; gemmes seules → pas gagné ${gd.mid}, tout → gagné ${gd.end}`);
  if (gd.type !== 'mix' || !gd.n0 || !gd.i0 || !gd.mid || !gd.end) errs.push('[desktop] géode : victoire ou génération fausse (' + JSON.stringify(gd) + ')');
  // horloge qui recule d'une semaine : la semaine en cours (et sa progression) est gardée
  const wk = await page.evaluate(() => {
    const B = window.__bp, w = B.ensureWeek(), id = w.ids[0]; w.p[id] = 3; const R = Date;
    window.Date = class extends R { constructor(...a) { if (a.length) super(...a); else super(R.now() - 8 * 864e5); } static now() { return R.now() - 8 * 864e5; } };
    const w2 = B.ensureWeek(); window.Date = R; const w3 = B.ensureWeek();
    return w2.k === w.k && w3.k === w.k && w3.p[id] === 3;
  });
  log('horloge reculée : semaine gardée', wk); if (!wk) errs.push('[desktop] missions de la semaine effacées par une horloge qui recule');
  // Chrono en pause sous les réglages de l'appli (#bq-settings)
  const chronoPaused = await page.evaluate(async () => {
    const B = window.__bp; B.startChrono(); const d = document.createElement('div'); d.id = 'bq-settings'; document.body.appendChild(d);
    await new Promise(r => setTimeout(r, 200)); const c0 = B.S.clock; await new Promise(r => setTimeout(r, 700)); const c1 = B.S.clock; d.remove(); return c0 === c1;
  });
  log('Chrono en pause sous les réglages de l\'appli', chronoPaused); if (!chronoPaused) errs.push('[desktop] le Chrono tourne sous les réglages de l\'appli');
  // fin de Chrono puis Modes → Classique aussitôt : l'écran de fin du Chrono ne revient pas par-dessus la partie classique
  const stale = await page.evaluate(async () => {
    const B = window.__bp; B.startChrono(); B.S.clock = 0.01;
    for (let k = 0; k < 100 && !B.S.over; k++) await new Promise(r => setTimeout(r, 20));   // fin du Chrono (écran de fin armé)
    document.getElementById('bp-mapbtn').click(); document.getElementById('bp-classic').click();
    await new Promise(r => setTimeout(r, 1600));
    return !document.getElementById('bp-over').classList.contains('hidden') || B.S.over || B.S.mode !== 'classic';
  });
  log('Chrono fini → Classique : pas d\'écran de fin fantôme', !stale); if (stale) errs.push('[desktop] écran de fin du Chrono affiché sur la partie classique');
  // double toucher sur une vidéo récompensée : une seule vidéo, une seule récompense
  const vid = await page.evaluate(async () => {
    let n = 0; window.PT_MON = { canReward: () => true, reward: () => { n++; return new Promise(r => setTimeout(() => r(true), 150)); }, pause: () => Promise.resolve() };
    document.getElementById('bp-themebtn').click(); const c0 = +document.getElementById('bp-coins').textContent, b = document.getElementById('bp-vidcoins');
    b.click(); b.click(); await new Promise(r => setTimeout(r, 400)); document.getElementById('bp-themeclose').click(); delete window.PT_MON;
    return { n, gain: +document.getElementById('bp-coins').textContent - c0 };
  });
  log(`vidéo touchée deux fois : ${vid.n} vidéo, +${vid.gain} pièces`); if (vid.n !== 1 || vid.gain !== 20) errs.push('[desktop] double toucher sur une vidéo : récompense doublée');
  // animations réduites : appliquées aussi au CSS (minuteur qui clignote)
  const calmCss = await page.evaluate(() => { const cb = document.getElementById('bp-optcalm'), was = cb.checked; cb.checked = true; cb.dispatchEvent(new Event('change'));
    const el = document.getElementById('bp-score'); el.classList.add('urgent'); const a = getComputedStyle(el).animationName; el.classList.remove('urgent'); cb.checked = was; cb.dispatchEvent(new Event('change')); return a; });
  log('animations réduites → minuteur sans clignotement :', calmCss); if (calmCss !== 'none') errs.push('[desktop] animations réduites ignorées par le CSS');
  // un second show() sans hide() ne lance pas une deuxième boucle de dessin (le Chrono allait deux fois plus vite)
  // (compte des rappels requestAnimationFrame par image : indépendant de la charge de la machine)
  const speed = await page.evaluate(async () => {
    const B = window.__bp, raf = window.requestAnimationFrame.bind(window);
    const perFrame = () => new Promise(res => { let calls = 0, frames = 0, on = true;
      window.requestAnimationFrame = cb => { calls++; return raf(cb); };
      const tick = () => { if (!on) return; frames++; raf(tick); }; raf(tick);
      setTimeout(() => { on = false; window.requestAnimationFrame = raf; res(calls / Math.max(1, frames)); }, 800); });
    B.startChrono(); await new Promise(r => setTimeout(r, 200)); const a = await perFrame(); window.GAMES.blocks.show(); await new Promise(r => setTimeout(r, 200)); const b = await perFrame(); return { a, b };
  });
  log(`boucles de dessin par image avant / après un second show() : ${speed.a.toFixed(2)} / ${speed.b.toFixed(2)}`); if (speed.b > speed.a + 0.5) errs.push('[desktop] deux boucles de dessin après un second show()');
  await page.evaluate(() => window.__bp.newGame());
}
// 1.12.1 : trois défauts de conception notés en 1.11.2 (un test chacun)
{
  // un conseil d'outil passe devant la présentation du givre sans l'effacer ; reposer l'outil la laisse en file
  await page.evaluate(() => { window.GAMES.blocks.reward(); window.__bp.startLevel(41); });
  await page.click('[data-tool=hammer]');
  const tq = await page.evaluate(() => { const S = window.__bp.S; return { first: !!(S.tips[0] && S.tips[0].now), intro: S.tips.filter(x => !x.now).length }; });
  await page.keyboard.press('Escape');
  const tq2 = await page.evaluate(() => window.__bp.S.tips.filter(x => !x.now).length);
  log(`conseils : outil en tête ${tq.first}, présentations gardées ${tq.intro} → après Échap ${tq2}`);
  if (!tq.first || !tq.intro || !tq2) errs.push('[desktop] la présentation du givre est perdue sous un conseil d\'outil');
  // Échap sur l'écran de fin : retour aux modes (pas « Rejouer », qui peut lancer une pub)
  await page.evaluate(() => { window.__bp.newGame(); window.__bp.endNow(); }); await page.waitForTimeout(1600);
  await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  const esc = await page.evaluate(() => ({ over: !document.getElementById('bp-over').classList.contains('hidden'), map: !document.getElementById('bp-map').classList.contains('hidden') }));
  log('Échap sur la fin de partie → carte des modes :', esc.map && !esc.over); if (!esc.map || esc.over) errs.push('[desktop] Échap ne fait rien sur l\'écran de fin');
  await page.click('#bp-mapclose');
  // une reprise suivie d'une seconde fin ne recompte pas la partie
  const gm = await page.evaluate(() => { const B = window.__bp; B.newGame(); const g0 = B.CAR.st.games || 0; B.gameOver(); B.gameOver(); return (B.CAR.st.games || 0) - g0; });
  log('parties comptées pour une fin, une reprise et une seconde fin :', gm); if (gm !== 1) errs.push('[desktop] Carnet : partie comptée deux fois');
  await page.evaluate(() => { document.getElementById('bp-over').classList.add('hidden'); window.__bp.newGame(); });
}
// 1.15.3 : une partie d'Aventure, de défi du jour ou de Chrono est reprise après un rechargement (état du tirage compris)
for (const [name, start] of [['aventure', 'startLevel(45)'], ['défi', 'startDaily()'], ['chrono', 'startChrono()']]) {
  await page.evaluate(`window.__bp.${start}`);
  await page.evaluate(() => { const B = window.__bp, S = B.S; let k = 0; for (let i = 0; i < 3 && k < 2; i++) { const t = S.tray[i]; if (!t) continue; let done = false; for (let y = 0; y < B.N && !done; y++) for (let x = 0; x < B.N; x++) if (B.fits(t, x, y)) { B.place(i, x, y); k++; done = true; break; } } });
  const before = await page.evaluate(() => { const S = window.__bp.S; return JSON.stringify([S.mode, S.score, S.tray.map(t => t && t.cells.length + t.color), S.board.flat().filter(Boolean).length]); });
  await page.reload(); await page.waitForTimeout(900);
  const after = await page.evaluate(() => { const S = window.__bp.S; return JSON.stringify([S.mode, S.score, S.tray.map(t => t && t.cells.length + t.color), S.board.flat().filter(Boolean).length]); });
  log(`reprise (${name}) après rechargement :`, before === after); if (before !== after) errs.push(`[desktop] partie de ${name} non reprise après rechargement : ${before} → ${after}`);
}
await page.evaluate(() => window.__bp.newGame());
log('étape : Star Forge'); await page.goto(base + '#forge'); await page.waitForTimeout(700);
const intro = await page.$eval('#sf-intro', e => !e.classList.contains('hidden')); await shot(page, 'forge-intro'); if (intro) await page.click('#sf-intro-ok');
log('intro Star Forge affichée au 1er lancement :', intro);
for (let i = 0; i < 40; i++) await page.mouse.click(360, 390);
await page.waitForTimeout(300); await shot(page, 'forge');
for (const t of ['upg', 'meta', 'ach', 'opt', 'gen']) { await page.click(`[data-sf=${t}]`); await page.waitForTimeout(150); }
log('étape : Synth Horde'); await page.goto(base + '#bonk'); await page.waitForTimeout(1200); await shot(page, 'bonk-menu');
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
log('bonk confort :', await page.evaluate(() => {   // 1.19.0 : direction des coups, réglages d'accessibilité
  const nb = window.__nb, S = nb.S, m = nb.META, keep = [m.calm, m.big, m.subs];
  S.state = 'play'; S.iframe = 0; nb.hurt(1, 'test', { x: S.p.x + 5, z: S.p.z });
  const dirs = (S.hitDirs || []).length;
  m.calm = m.big = m.subs = true; for (let k = 0; k < 3; k++) nb.update(1 / 30);
  [m.calm, m.big, m.subs] = keep;
  if (!dirs) throw new Error('indicateur de direction absent');
  return `direction des coups=${dirs} réglages=${['nb-calm', 'nb-big', 'nb-subs'].every(id => document.getElementById(id))}`;
}));
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
log('objets à déclencheur :', await page.evaluate(() => {
  const nb = window.__nb, S = nb.S;
  S.state = 'play'; S.enemies.length = 0; S.pending = 0;
  const hp0 = S.stats.hp; S.p.hp = S.stats.hp;
  nb.giveItem('ember'); nb.giveItem('soles'); nb.giveItem('axe');
  const e = nb.spawnEnemy('brute', S.p.x + 1.5, S.p.z); e.speed = 0; e.hp = e.max = 5000;
  const item0 = S.dmgBy.item || 0;
  nb.jump(); for (let i = 0; i < 60; i++) { S.state = 'play'; S.pending = 0; nb.update(1 / 30); }
  nb.slide(); for (let i = 0; i < 6; i++) { S.state = 'play'; nb.update(1 / 30); }
  const fires = S.fires.length;
  const e2 = nb.spawnEnemy('brute', S.p.x + 25, S.p.z + 25); e2.hp = e2.max * 0.11; nb.damage(e2, 1, false);
  if (S.p.hp > 0) S.p.hp = hp0;
  return `objets=${Object.keys(S.items).length} · onde à l'atterrissage=${(S.dmgBy.item || 0) > item0} · braises=${fires} · guillotine=${e2.hp <= 0} · sources=${Object.keys(S.dmgBy).join('/')}`;
}));
log('objets 1.22.0 (carillon, rancune, prime) :', await page.evaluate(() => {
  const nb = window.__nb, S = nb.S;
  S.state = 'play'; S.enemies.length = 0; S.pending = 0; S.stats.hp = S.p.hp = 1e6; S.iframe = 0; S.shieldT = 1e9;
  nb.giveItem('chime'); nb.giveItem('spite'); nb.giveItem('bounty');
  const out = [];
  // rancune : un coup reçu déclenche une explosion d'objet autour du joueur
  const e = nb.spawnEnemy('brute', S.p.x + 2, S.p.z); e.speed = 0; e.hp = e.max = 1e9;
  S.state = 'play'; S.pending = 0; nb.update(1 / 30); const i0 = S.dmgBy.item || 0; S.shieldT = 0; S.stats.shield = 0; S.stats.dodge = 0; nb.hurt(5, 'test'); for (let i = 0; i < 6; i++) { S.state = 'play'; S.pending = 0; nb.update(1 / 30); } out.push('rancune=' + ((S.dmgBy.item || 0) > i0));
  // prime : une élite abattue laisse des gemmes en plus
  S.enemies.length = 0; S.pickups.length = 0;
  const el = nb.spawnEnemy('brute', S.p.x + 25, S.p.z + 25); el.elite = true; nb.damage(el, 1e12, false);
  out.push('gemmes de prime=' + S.pickups.filter(k => k.type === 'gem').length);
  // carillon : 30 gemmes ramassées → onde de choc
  S.enemies.length = 0; const f = nb.spawnEnemy('brute', S.p.x + 1.5, S.p.z); f.speed = 0; f.hp = f.max = 1e9; S.iframe = 0.5;
  const i1 = S.dmgBy.item || 0; S.gemK = 0;
  for (let i = 0; i < 40; i++) S.pickups.push({ type: 'gem', x: S.p.x, y: S.p.y, z: S.p.z, v: 1, vy: 0, vx: 0, vz: 0, pull: true, t: 1 });
  for (let i = 0; i < 20; i++) { S.state = 'play'; S.pending = 0; S.iframe = 0.5; nb.update(1 / 30); }
  out.push('carillon=' + ((S.dmgBy.item || 0) > i1));
  S.p.hp = S.stats.hp;
  return out.join(' ');
}));
log('marchand / duplicateur / maudit / bannir / rebond :', await page.evaluate(() => {
  const nb = window.__nb, S = nb.S, r = [];
  S.state = 'play'; S.enemies.length = 0; S.pending = 0; S.gold = 400;
  const go = k => { const s = S.shrines.find(x => x.kind === k && !x.used); if (!s) return false; S.p.x = s.x + 1; S.p.z = s.z + 1; S.p.y = s.y; S.state = 'play'; nb.update(1 / 60); nb.interact(); return true; };
  if (go('shop')) { const g = S.gold; const st = S.state; nb.pick(0); r.push(`marchand=${st}/${g - S.gold}`); }
  if (go('dup')) { const n = Object.values(S.items).reduce((a, b) => a + b, 0); nb.pick(0); r.push(`dup=${Object.values(S.items).reduce((a, b) => a + b, 0) - n}`); }
  if (go('curse')) { const e = S.enemies.find(x => x.curse); const c = S.chests.length; if (e) nb.damage(e, e.hp + 1, false); r.push(`coffre doré=${S.chests.length - c === 1 && S.chests[S.chests.length - 1].gold}`); }
  S.state = 'play'; S.pending = 1; nb.openLevelUp('level'); document.getElementById('nb-banish').click();
  const b0 = S.banishes, i = [0, 1, 2].find(j => document.querySelectorAll('#nb-choices .nb-choice')[j] && !document.querySelectorAll('#nb-choices .nb-choice')[j].classList.contains('nobanish'));
  if (i !== undefined) nb.banish(i);
  r.push(`banni=${S.banned.size}/${b0 - S.banishes}`);
  S.pending = 0; document.getElementById('nb-levelup').classList.add('hidden'); S.state = 'play';
  r.push(`tremplins=${S.pads.length}`);
  return r.join(' · ');
}));
log('familles d’ennemis / gardien / quêtes :', await page.evaluate(() => {
  const nb = window.__nb, S = nb.S, r = [];
  S.state = 'play'; S.enemies.length = 0; S.pending = 0;
  for (const ty of ['bomber', 'blinker', 'healer']) { const e = nb.spawnEnemy(ty, S.p.x + 12, S.p.z + 12); r.push(`${ty}=${!!e}`); }
  for (let i = 0; i < 90; i++) { S.state = 'play'; S.pending = 0; S.p.hp = S.stats.hp; nb.update(1 / 30); }
  const c0 = S.chests.length, w = nb.spawnEnemy('warden', S.p.x + 15, S.p.z - 15, true); if (w) { w.warden = true; nb.damage(w, w.hp + 1, false); }
  r.push(`gardien → coffre doré=${S.chests.length - c0 === 1}`, `quêtes faites=${Object.keys(nb.META.quests || {}).join('/')}`);
  S.enemies.length = 0;
  return r.join(' · ');
}));
log('nouvelles armes / clés :', await page.evaluate(() => {
  const nb = window.__nb, S = nb.S, r = [];
  S.state = 'play'; S.pending = 0; const keep = S.weapons.slice();
  for (const id of ['flame', 'aura', 'rail', 'tornado', 'toxic', 'drones', 'drop', 'scatter', 'groove']) {
    S.weapons.length = 0; nb.addWeapon(id); S.enemies.length = 0; const d0 = S.dmgBy[id] || 0;
    for (let i = 0; i < 90; i++) { if (i % 15 === 0) for (let k = 0; k < 3; k++) { const e = nb.spawnEnemy('brute', S.p.x + 3 + k, S.p.z + 2); if (e) e.speed = 0.5; } S.state = 'play'; S.pending = 0; S.p.hp = S.stats.hp; nb.update(1 / 30); }
    r.push(`${id}=${Math.round((S.dmgBy[id] || 0) - d0)}`);
  }
  S.weapons.length = 0; keep.forEach(w => S.weapons.push(w)); S.enemies.length = 0;
  r.push(`clés=${S.keys.length}`);
  return r.join(' · ');
}));
log('autel / dîme / quêtes à paliers :', await page.evaluate(() => {
  const nb = window.__nb, S = nb.S, r = [];
  S.state = 'play'; S.enemies.length = 0; S.pending = 0; S.gold = 999;
  const t = S.shrines.find(x => x.kind === 'tithe'); if (t) { S.p.x = t.x + 1; S.p.z = t.z + 1; S.p.y = t.y; nb.update(1 / 60); nb.interact(); r.push(`dîme=${S.state}`); if (S.state === 'levelup') nb.pick(0); }
  r.push(`autel=${S.shrines.some(x => x.kind === 'altar')}`, `quêtes=${document.querySelectorAll('#nb-qlist .nb-q').length}`);
  S.state = 'play';
  return r.join(' · ');
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
// chaque sanctuaire à activer affiche son invite (régression 1.12.0 : seuls les sanctuaires de charge réagissaient)
{
  const r = await page.evaluate(() => {
    const nb = window.__nb, S = nb.S, out = [], keep = [S.p.x, S.p.y, S.p.z];
    for (const s of S.shrines) {
      if (s.kind === 'charge' || s.used) continue;
      S.state = 'play'; S.pending = 0; S.iframe = 1; S.p.x = s.x + 1; S.p.z = s.z; S.p.y = s.y; S.p.vx = S.p.vz = 0; nb.update(1 / 30);
      out.push(s.kind + '=' + !!document.getElementById('nb-prompt').textContent);
    }
    [S.p.x, S.p.y, S.p.z] = keep; return out.join(' ');
  });
  log('invites des sanctuaires :', r);
  if (r.includes('=false')) throw new Error('sanctuaire sans invite : ' + r);
}
// parcours complet : boss 1 → portail → étape 2 → boss 2 → portail final
const killBossAndEnter = () => page.evaluate(() => {
  const nb = window.__nb, S = nb.S;
  S.state = 'play'; S.pending = 0; S.time = 0.02; S.stats.hp = S.p.hp = 1e6; S.stats.dmg = 50;
  for (let i = 0; i < 5; i++) nb.update(1 / 30);
  if (!S.boss) return 'pas de boss';
  const name = S.boss && document.querySelector('#nb-boss span').textContent + ` (PV de départ ${Math.round(S.boss.max)})`;
  if (S.boss) S.boss.age = 999;   // le smoke vérifie le chemin de victoire, pas la durée du combat (mesurée à part)
  for (let i = 0; i < 900 && S.boss; i++) { S.enemies.length = 0; S.p.x = S.boss.x + 5; S.p.z = S.boss.z; S.state = 'play'; S.pending = 0; nb.update(1 / 30); }
  if (!S.portal) return 'boss vivant';
  S.p.x = S.portal.x + 1; S.p.z = S.portal.z; S.p.y = S.portal.y;
  // l'XP du boss (semée en anneau) peut ouvrir des choix de niveau : on les referme sur quelques images avant d'entrer
  for (let i = 0; i < 10; i++) { S.state = 'play'; S.pending = 0; S.xp = 0; S.p.x = S.portal.x + 1; S.p.z = S.portal.z; S.p.y = S.portal.y; nb.update(1 / 30); }
  S.state = 'play'; S.pending = 0; nb.interact();
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
{
  const r = await page.evaluate(() => { const nb = window.__nb, id = nb.S.ch.id, txt = document.getElementById('nb-endstats').innerText, xp = nb.META.hr && nb.META.hr[id];
    const dmg = () => { nb.newRun(); return nb.S.stats.dmg; }; const keep = nb.META.hr; nb.META.hr = { glitch: 0 }; nb.META.sel = 'glitch'; const d0 = dmg(); nb.META.hr = { glitch: 99999 }; const d1 = dmg(); nb.newRun(true); const dd = nb.S.stats.dmg; nb.META.hr = keep; return { xp, line: /XP/.test(txt), d0, d1, dd }; });
  const ok = r.xp > 0 && r.line && Math.abs(r.d1 - r.d0 - 0.10) < 1e-6;
  log(`rang de héros : XP=${r.xp} ligne de fin=${r.line} · dégâts rang 0 → 10 : ${r.d0.toFixed(2)} → ${r.d1.toFixed(2)} · défi du jour sans bonus de rang`, ok ? 'OK' : 'ÉCHEC');
  if (!ok) errs.push('[rang de héros] ' + JSON.stringify(r));
  await page.evaluate(() => { window.__nb.S.daily = null; window.__nb.newRun(); document.getElementById('nb-quit').click(); }); await page.waitForTimeout(300);   // retour à l'écran de fin
}
await page.click('#nb-again').catch(() => {}); await page.waitForTimeout(400); await shot(page, 'bonk-menu2');
log('crédits après run :', await page.$eval('#nb-credits', e => e.textContent));
// défi du jour : héros et modificateurs imposés, carte identique d'un essai à l'autre, score et record à la fin
await page.click('#nb-dplay'); await page.waitForTimeout(800);
log('défi du jour :', await page.evaluate(() => {
  const nb = window.__nb, S = nb.S, sig = () => nb.S.obst.map(o => o.x.toFixed(2) + o.z.toFixed(2)).join() + nb.S.keys.map(k => k.x.toFixed(1)).join() + nb.S.shrines.map(q => q.kind + q.x.toFixed(1)).join();
  if (!S.daily) throw new Error('défi du jour : run sans S.daily');
  const a = sig(), d = S.daily; nb.newRun(true); const b = sig();
  if (a !== b) throw new Error('défi du jour : carte différente d’un essai à l’autre');
  for (let i = 0; i < 30 * 20; i++) { if (nb.S.state === 'levelup') nb.pick(0); nb.S.state = 'play'; nb.update(1 / 30); }
  return `${d.key} · ${d.ch} · ${d.mods.join('+')} · carte identique`;
}));
await page.evaluate(() => { window.__nb.S.state = 'play'; document.getElementById('nb-quit').click(); }); await page.waitForTimeout(400);
log('défi du jour, fin :', await page.$eval('#nb-endstats', e => e.innerText.split('\n').slice(0, 20).filter(l => /\d/.test(l)).slice(-6).join(' | ')));
await shot(page, 'bonk-daily-end');
await page.click('#nb-again').catch(() => {}); await page.waitForTimeout(400);
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
  await g.addInitScript(() => { if (!sessionStorage.getItem('inj')) { sessionStorage.setItem('inj', 1); localStorage.setItem('starforge.save.v1', JSON.stringify({ dust: 1e6, runTotal: 1e6, lifeTotal: 1e10, gens: [30, 20, 10, 5, 0, 0, 0, 0, 0, 0], upg: {}, novaTotal: 150000, novaBank: 40, meta: { m_click: 1, m_auto: 1 }, ach: {}, prestiges: 12, chalDone: { c_hands: 1 }, last: Date.now() })); } });
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
    // le panneau du bas doit défiler sur téléphone (régression : colonne sans min-height:0, tout le bas inaccessible)
    await m.evaluate(() => { const S = window.__sf.S; S.gens = S.gens.map((_, i) => 60 - i * 6); S.lifeTotal = Math.max(S.lifeTotal, 1e15); });
    await m.tap('[data-sf=upg]'); await m.waitForTimeout(150); await m.tap('[data-sf=gen]'); await m.waitForTimeout(300);
    const sc = await m.evaluate(() => { const e = [...document.querySelectorAll('.sf-panel')].find(x => x.offsetParent); e.scrollTop = 9999; return { top: e.scrollTop, room: e.scrollHeight - e.clientHeight, bottom: Math.round(document.querySelector('.sf-right').getBoundingClientRect().bottom), vh: innerHeight }; });
    log('mobile : panneau des forges défilable =', sc.room <= 0 || sc.top > 0, JSON.stringify(sc));
    if (sc.room <= 0) throw new Error('test de défilement sans objet : la liste des forges tient à l’écran');
    if (sc.room > 0 && sc.top === 0) throw new Error('panneau Nova Foundry non défilable sur téléphone');
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
await m.waitForTimeout(650); await shot(m, 'm-bonk-levelup');   // > verrou de 0,4 s des cartes
const visibleCards = await m.$$eval('.nb-choice', els => els.filter(e => { const r = e.getBoundingClientRect(); return r.bottom <= innerHeight && r.top >= 0; }).length);
const rerollVisible = await m.$eval('#nb-reroll', e => { const r = e.getBoundingClientRect(); return r.bottom <= innerHeight; });
await m.tap('.nb-choice'); await m.waitForTimeout(300);
await m.tap('#nb-pausebtn'); await m.waitForTimeout(300);
log(`mobile Synth Horde : cartes visibles=${visibleCards}/3 · « Reroll » visible=${rerollVisible} · pause au bouton=${await m.evaluate(() => window.__nb.S.state)}`);
await shot(m, 'm-bonk-pause');

// téléphone en paysage (application Android) : pause, annonces et écran de fin tiennent dans l'écran
{
  {   // Synth Horde 1.24.1 : boutique permanente d'une sauvegarde éditée (niveaux −3, 99, « x ») → l'écran s'affiche, niveaux bornés
    const ctxS = await browser.newContext({ viewport: { width: 420, height: 860 }, isMobile: true, hasTouch: true });
    await ctxS.addInitScript(() => { try { localStorage.setItem('neonbonk.meta.v1', JSON.stringify({ shop: { hp: -3, dmg: 99, speed: 'x' } })); } catch (e) {} });
    const Sp = await guard(await ctxS.newPage()); watch(Sp, 'sauvegarde éditée');
    await Sp.goto(base + '#bonk'); await Sp.waitForTimeout(900);
    const lv = await Sp.evaluate(() => { const nb = window.__nb; nb.newRun(); return nb.S.stats.dmg < 2; });
    log(`sauvegarde de boutique éditée : jeu démarré, dégâts bornés=${lv}`);
    if (!lv) errs.push('[mobile] boutique : niveau non borné');
    await ctxS.close();
  }
  const ctxL = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const L = await guard(await ctxL.newPage()); watch(L, 'paysage');
  await L.goto(base + '#bonk'); await L.waitForTimeout(900);
  const inView = sel => L.$eval(sel, e => { const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth; });
  const chars = await L.$eval('#nb-chars', e => e.getBoundingClientRect().bottom), startTop = await L.$eval('#nb-start', e => e.getBoundingClientRect().top);
  const shopJ = await inView('#nb-shopjump');
  await L.tap('#nb-start'); await L.waitForTimeout(800);
  const lock = await L.evaluate(() => { const nb = window.__nb, S = nb.S; S.xp = S.need * 1.01; nb.update(1 / 30); const lvl = S.level; document.querySelector('.nb-choice').click(); return S.state === 'levelup' && S.level === lvl; });
  await L.waitForTimeout(500); await L.evaluate(() => { const S = window.__nb.S; while (S.state === 'levelup') window.__nb.pick(0); });
  await L.evaluate(() => { const nb = window.__nb, S = nb.S; S.p.hp = 1e6; nb.spawnBoss(); const c = S.chests.find(c => !c.open); S.p.x = c.x; S.p.z = c.z; S.p.y = c.y; nb.update(1 / 30); nb.update(1 / 30);
    const m = document.getElementById('nb-msg'); m.textContent = 'JUMP!'; m.classList.add('show'); });
  await L.waitForTimeout(400);   // la classe « bossing » est posée par l'image suivante
  const over = await L.evaluate(() => { const m = document.getElementById('nb-msg');
    const a = m.getBoundingClientRect(), b = document.getElementById('nb-prompt').getBoundingClientRect(), k = document.getElementById('nb-boss').getBoundingClientRect();
    return { prompt: b.height > 0, hitPrompt: a.bottom > b.top && a.top < b.bottom, hitBoss: a.top < k.bottom && a.bottom > k.top }; });
  await L.tap('#nb-pausebtn'); await L.waitForTimeout(300); await shot(L, 'l-bonk-pause');
  const res = await inView('#nb-resume'), quit = await inView('#nb-quit');
  await L.tap('#nb-quit'); await L.waitForTimeout(300); await shot(L, 'l-bonk-end');
  const again = await inView('#nb-again');
  const ok = chars <= startTop && shopJ && lock && over.prompt && !over.hitPrompt && !over.hitBoss && res && quit && again;
  log(`paysage 844×390 : personnages au-dessus du bouton=${chars <= startTop} · raccourci boutique=${shopJ} · verrou des cartes=${lock} · annonce hors invite=${!over.hitPrompt} et hors boss=${!over.hitBoss} · Reprendre/Abandonner visibles=${res}/${quit} · fin visible=${again}`, ok ? 'OK' : 'ÉCHEC');
  if (!ok) errs.push('[paysage] mise en page Synth Horde');
  await ctxL.close();
}

// ---------- classements (1.13.0 / 1.21.0) : le site n'en a pas ; défi du jour en date UTC, migration des séries
// sans perte ni double prime, « nouveau défi dans H:MM » jusqu'à minuit UTC
{
  const bad = [];
  const at = async (tz, iso, seed) => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 760 }, timezoneId: tz });
    await ctx.clock.setFixedTime(new Date(iso));
    await ctx.addInitScript(sd => { if (sessionStorage.getItem('lbseed')) return; sessionStorage.setItem('lbseed', 1); localStorage.setItem('playtoon.welcomed', '1'); for (const [k, v] of Object.entries(sd)) localStorage.setItem(k, JSON.stringify(v)); }, seed);
    const p = await guard(await ctx.newPage()); watch(p, 'classements ' + tz);
    return { ctx, p };
  };
  const meta = (d, last, streak, hist) => ({ daily: { key: d, best: 500, tries: 1, done: true }, dLast: last, dStreak: streak, dDays: 9, dHist: hist });
  // ouest de Greenwich, le soir : 20 oct. 20:00 à Los Angeles = 21 oct. 03:00 UTC ; la journée locale jouée devient le 21
  {
    const { ctx, p } = await at('America/Los_Angeles', '2026-10-21T03:00:00Z', {
      'blocparty.daily': { day: 20261020, last: 20261020, best: 900, streak: 4, hist: { 20261020: 1 } },
      'neonbonk.meta.v1': meta('2026-10-20', '2026-10-20', 3, { '2026-10-20': 500 }) });
    await p.goto(base + '#blocks'); await p.waitForTimeout(800);
    const r = await p.evaluate(async () => {
      const B = window.__bp, d0 = JSON.parse(localStorage.getItem('blocparty.daily')), days0 = B.CAR.st.days || 0;
      B.startDaily(); const { S, place, fits, N } = B;
      let done = false; S.tray.forEach((pc, i) => { if (done || !pc) return; for (let y = 0; y < N && !done; y++) for (let x = 0; x < N && !done; x++) if (fits(pc, x, y)) { place(i, x, y); done = true; } });
      const d1 = JSON.parse(localStorage.getItem('blocparty.daily'));
      const lb = ['bp-lbover', 'bp-lbdaily', 'bp-lball'].map(id => document.getElementById(id).classList.contains('hidden'));
      const M = window.__nb.META;
      return { d0, d1, days: (B.CAR.st.days || 0) - days0, lb, scores: 'PT_SCORES' in window, nb: { key: M.daily.key, last: M.dLast, streak: M.dStreak, hist: M.dHist } };
    });
    const ok = r.d0.day === 20261021 && r.d0.last === 20261021 && r.d0.hist[20261021] === 1 && !(20261020 in r.d0.hist) && r.d1.streak === 4 && r.days === 0 && r.d1.day === 20261021
      && r.lb.every(Boolean) && !r.scores && r.nb.key === '2026-10-21' && r.nb.last === '2026-10-21' && r.nb.streak === 3 && r.nb.hist['2026-10-21'] === 500 && !('2026-10-20' in r.nb.hist);
    log(`classements, ouest (LA 20 oct. 20:00) : BQ jour=${r.d1.day} série=${r.d1.streak} jours+${r.days} · SH jour=${r.nb.key} série=${r.nb.streak} · boutons masqués=${r.lb.every(Boolean)} · PT_SCORES=${r.scores}`, ok ? 'OK' : 'ÉCHEC');
    if (!ok) bad.push('migration ouest ' + JSON.stringify(r));
    await ctx.close();
  }
  // est, après minuit : 21 oct. 01:00 à Tokyo = 20 oct. 16:00 UTC ; le défi est celui du 20, la journée du 21 déjà comptée
  {
    const { ctx, p } = await at('Asia/Tokyo', '2026-10-20T16:00:00Z', {
      'blocparty.daily': { day: 20261021, last: 20261021, best: 900, streak: 4, hist: { 20261020: 2, 20261021: 1 } },
      'neonbonk.meta.v1': meta('2026-10-21', '2026-10-21', 3, { '2026-10-20': 400, '2026-10-21': 500 }) });
    await p.goto(base + '#blocks'); await p.waitForTimeout(800);
    const r = await p.evaluate(async () => {
      const B = window.__bp, days0 = B.CAR.st.days || 0;
      B.startDaily(); const { S, place, fits, N } = B;
      let done = false; S.tray.forEach((pc, i) => { if (done || !pc) return; for (let y = 0; y < N && !done; y++) for (let x = 0; x < N && !done; x++) if (fits(pc, x, y)) { place(i, x, y); done = true; } });
      const d1 = JSON.parse(localStorage.getItem('blocparty.daily'));
      B.gameOver(); await new Promise(res => setTimeout(res, 300));
      return { d1, days: (B.CAR.st.days || 0) - days0, next: document.getElementById('bp-dnext').textContent, nextShown: !document.getElementById('bp-dnext').classList.contains('hidden'),
        lbOver: document.getElementById('bp-lbover').classList.contains('hidden') };
    });
    await p.evaluate(() => { document.getElementById('bp-over').classList.add('hidden'); window.location.hash = '#bonk'; });
    await p.goto(base + '#bonk'); await p.waitForTimeout(1500);
    const n = await p.evaluate(() => { const M = window.__nb.META; return { key: M.daily.key, last: M.dLast, streak: M.dStreak, dinfo: document.getElementById('nb-dinfo').innerText, play: document.getElementById('nb-dplay').textContent,
      lb: ['nb-lbdaily', 'nb-lbmenu', 'nb-lbend'].map(id => document.getElementById(id).classList.contains('hidden')) }; });
    const ok = r.d1.day === 20261020 && r.d1.streak === 4 && r.days === 0 && r.nextShown && /08:00/.test(r.next) && r.lbOver
      && /8 h 00 min/.test(n.dinfo) && n.lb.every(Boolean) && /\b3\b/.test(n.dinfo) && n.last === '2026-10-21';
    log(`classements, est (Tokyo 21 oct. 01:00) : BQ défi du ${r.d1.day} série=${r.d1.streak} jours+${r.days} « ${r.next} » · SH « ${n.dinfo.replace(/\s+/g, ' ').slice(0, 90)} » · boutons masqués=${n.lb.every(Boolean)}`, ok ? 'OK' : 'ÉCHEC');
    if (!ok) bad.push('migration est ' + JSON.stringify({ r, n }));
    await ctx.close();
  }
  if (bad.length) errs.push('[classements] ' + bad.join(' | '));
}

// ---------- Nova Foundry : sauvegarde corrompue ou importée (mauvais types) → jamais de plantage
{
  log('étape : Nova Foundry, sauvegardes corrompues');
  const ctx = await browser.newContext({ viewport: { width: 420, height: 860 } });
  const bad = [];
  for (const mut of [{ upg: null }, { gens: {} }, { gens: null }, { st: null }, { st: 'a' }, { chal: 'zzz' }, { meta: null }, { ord: { list: 5 } }, { dust: 'abc' }, { dust: -5 }]) {
    const p = await guard(await ctx.newPage()); watch(p, 'nf-corrompu'); const e0 = errs.length;
    await p.addInitScript(m => { try { localStorage.setItem('starforge.intro', '1'); localStorage.setItem('starforge.save.v1', JSON.stringify({ dust: 5, gens: [1, 0], ...m })); } catch (e) {} }, mut);
    await p.goto(base + '#forge'); await p.waitForTimeout(700);
    const r = await p.evaluate(() => { try { window.__sf.tick(1); return /NaN|undefined|\[object/.test(document.body.innerText) ? 'texte invalide' : 'ok'; } catch (e) { return 'ERR ' + e.message; } });
    if (r !== 'ok' || errs.length > e0) bad.push(JSON.stringify(mut) + ' → ' + r);
    await p.close();
  }
  log(`Nova Foundry : 10 sauvegardes corrompues ${bad.length ? 'ÉCHEC ' + bad.join('; ') : 'OK'}`);
  if (bad.length) errs.push('[nf-corrompu] ' + bad.join(' | '));
  await ctx.close();
}

// ---------- Synth Horde 1.24.0 : pause automatique (appli en arrière-plan, fenêtre qui perd le focus), désactivable
{
  log('étape : Synth Horde, pause automatique');
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await guard(await ctx.newPage()); watch(p, 'sh-autopause');
  await p.addInitScript(() => { try { localStorage.setItem('playtoon.welcomed', '1'); } catch (e) {} });
  await p.goto(base + '#bonk'); await p.waitForTimeout(2500);
  await p.evaluate(() => document.getElementById('nb-start').click()); await p.waitForTimeout(2500);
  const r = await p.evaluate(async () => {
    const N = window.__nb, out = { start: N.S.state };
    window.dispatchEvent(new Event('blur')); out.blur = N.S.state;
    document.getElementById('nb-resume').click(); await new Promise(r => setTimeout(r, 600)); out.resumed = N.S.state;
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange')); out.hidden = N.S.state;
    document.getElementById('nb-resume').click(); await new Promise(r => setTimeout(r, 600));
    const cb = document.getElementById('nb-autopause'); cb.checked = false; cb.dispatchEvent(new Event('change'));
    document.dispatchEvent(new Event('visibilitychange')); out.off = N.S.state;
    return out;
  });
  const ok = r.start === 'play' && r.blur === 'pause' && r.hidden === 'pause' && r.off === 'play';
  log(`Synth Horde : pause automatique ${ok ? 'OK' : 'ÉCHEC ' + JSON.stringify(r)}`);
  if (!ok) errs.push('[sh-autopause] ' + JSON.stringify(r));
  await ctx.close();
}
// ---------- Nova Foundry 1.14.0 : succès de long cours (Supernovae 50/100, Big Bang ×10, 500 commandes, rangs 12 et 16)
{
  log('étape : Nova Foundry, succès de long cours');
  const ctx = await browser.newContext({ viewport: { width: 420, height: 860 } });
  const p = await guard(await ctx.newPage()); watch(p, 'nf-long');
  await p.addInitScript(() => { try { localStorage.setItem('starforge.intro', '1'); } catch (e) {} });
  await p.goto(base + '#forge'); await p.waitForTimeout(700);
  const r = await p.evaluate(async () => {
    const F = window.__sf, ids = ['pre50', 'pre100', 'bb10', 'ord500', 'rank12', 'rank16'];
    const before = ids.filter(i => F.S.ach[i]).length;
    F.S.prestiges = 100; F.S.bigbangs = 10; F.S.ord = Object.assign(F.S.ord || {}, { done: 5000 });
    await new Promise(r => setTimeout(r, 2500));
    return { before, got: ids.filter(i => F.S.ach[i]).length };
  });
  const ok = r.before === 0 && r.got === 6;
  log(`Nova Foundry : succès de long cours ${ok ? 'OK' : 'ÉCHEC ' + JSON.stringify(r)}`);
  if (!ok) errs.push('[nf-long] ' + JSON.stringify(r));
  await ctx.close();
}
// ---------- Nova Foundry : Périhélie (6e évènement du ciel) → forges 30 % moins chères pendant l'évènement
{
  log('étape : Nova Foundry, Périhélie');
  const ctx = await browser.newContext({ viewport: { width: 420, height: 860 } });
  const p = await guard(await ctx.newPage()); watch(p, 'nf-peri');
  await p.addInitScript(() => { try { localStorage.setItem('starforge.intro', '1'); } catch (e) {} });
  await p.goto(base + '#forge'); await p.waitForTimeout(700);
  const r = await p.evaluate(async () => {
    const F = window.__sf, num = () => document.querySelector('.sf-item .c').textContent;
    // on attend que le prix affiché change (le rendu peut traîner sur une machine chargée) au lieu d'un délai fixe
    const until = async (from, max = 15000) => { for (let t = 0; t < max && num() === from; t += 100) await new Promise(r => setTimeout(r, 100)); await new Promise(r => setTimeout(r, 300)); return num(); };
    F.S.dust = 1e6; const a0 = num(); F.S.gens[0] = 40; const a = await until(a0);
    F.startSky('peri'); const b = await until(a);
    const k = +b.replace(/\D/g, '') / +a.replace(/\D/g, '');
    return { a, b, k, all: F.SKY.length, banner: /−30/.test(document.getElementById('sf-buffs').textContent) };
  });
  const ok = r.k > 0.69 && r.k < 0.71 && r.all === 6 && r.banner;
  log(`Nova Foundry : Périhélie ${ok ? 'OK' : 'ÉCHEC ' + JSON.stringify(r)}`);
  if (!ok) errs.push('[nf-peri] ' + JSON.stringify(r));
  await ctx.close();
}

// ---------- Nova Foundry : clavier (Espace / Entrée = étoile, 1–n = onglets, rien dans un autre jeu ni sur un bouton)
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await guard(await ctx.newPage()); watch(p, 'nf-clavier');
  await p.addInitScript(() => { try { localStorage.setItem('starforge.intro', '1'); } catch (e) {} });
  await p.goto(base + '#forge'); await p.waitForTimeout(700);
  const n = () => p.evaluate(() => window.__sf.S.clicks), c0 = await n();
  await p.keyboard.press('Space'); await p.keyboard.press('Enter'); const k1 = (await n()) - c0;
  await p.keyboard.press('2'); await p.waitForTimeout(200); const tab = await p.$eval('.sf-tabs button.on', e => e.dataset.sf);
  await p.focus('[data-sf=gen]'); const c1 = await n(); await p.keyboard.press('Space'); const k2 = (await n()) - c1;
  await p.goto(base + '#blocks'); await p.waitForTimeout(400); const c2 = await n(); await p.keyboard.press('Space'); const k3 = (await n()) - c2;
  const ok = k1 === 2 && tab === 'upg' && k2 === 0 && k3 === 0;
  log(`Nova Foundry : clavier ${ok ? 'OK' : 'ÉCHEC ' + JSON.stringify({ k1, tab, k2, k3 })}`);
  if (!ok) errs.push('[nf-clavier] ' + JSON.stringify({ k1, tab, k2, k3 }));
  await ctx.close();
}

await browser.close(); srv.close();
if (errs.length) { console.error('ERREURS :\n' + errs.join('\n')); process.exit(1); }
log('OK — aucune erreur console');
