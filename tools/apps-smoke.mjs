// Test de fumée des APPLICATIONS (pas du site) : construit le www/ de chaque appli mobile (Capacitor) et de chaque
// version PC (le dossier que charge la fenêtre Electron), sert chacun sur son propre serveur local et l'ouvre dans
// Chromium headless, en téléphone 420×860 tactile et en fenêtre 1280×720. Pour chaque jeu et chaque paquet :
//   - zéro « pageerror », zéro erreur console (ex. Block Quarry 1.6.0 → 1.9.x : exception au chargement, invisible sur le site) ;
//   - le jeu est jouable (Block Quarry : grille et pièces dessinées, une pièce se pose ; Nova Foundry : un clic donne de
//     la poussière d'étoile ; Synth Horde : une run démarre et le joueur bouge) ;
//   - la coquille s'ouvre (réglages, changement de langue), le pont natif absent (pubs, achats) est toléré ;
//   - indépendance : le www/app.js ne contient le nom d'aucun autre jeu, ni « Playtoon » ;
//   - classements (Block Quarry, Synth Horde) : boutons masqués sans pont ; faux pont injecté (window.PT_SCORES sur
//     mobile, window.ptDesktop.scores sur PC) → submit appelé avec le bon tableau et le bon score à la fin du défi,
//     show appelé au clic (PC : panneau Steam rempli) ; Nova Foundry : aucun classement, même avec un pont.
// Usage : node tools/apps-smoke.mjs [jeu…]   (sans jeu : les trois ; Playwright installé globalement ; node_modules installés dans apps/<jeu>/ et
// apps/desktop/ — pour ce dernier, ELECTRON_SKIP_BINARY_DOWNLOAD=1 suffit : seul le paquet electron est lu).
// Remet à la fin les apps/*/src/config.js réécrits par les constructions.
import { createRequire } from 'module';
import { execSync, execFileSync } from 'child_process';
import http from 'http'; import fs from 'fs'; import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));

const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const GAMES = [
  { id: 'block-quarry', key: 'blocks', name: 'Block Quarry' },
  { id: 'nova-foundry', key: 'forge', name: 'Nova Foundry' },
  { id: 'synth-horde', key: 'bonk', name: 'Synth Horde' },
];
const only = process.argv.slice(2), PICK = only.length ? GAMES.filter(g => only.includes(g.id)) : GAMES;
if (only.length && PICK.length !== only.length) { console.error('jeu inconnu : ' + only.join(' ') + ' (attendu : ' + GAMES.map(g => g.id).join(', ') + ')'); process.exit(1); }
const T0 = Date.now();
const log = (...a) => console.log(`[${((Date.now() - T0) / 1000).toFixed(0)} s]`, ...a);
const fails = [];
const fail = (tag, msg) => { fails.push(`[${tag}] ${msg}`); console.log(`  ÉCHEC [${tag}] ${msg}`); };

// ---------- constructions
const configs = execSync('git ls-files "apps/*/src/config.js"', { cwd: root }).toString().trim().split('\n').filter(Boolean);
const restore = () => { try { execFileSync('git', ['checkout', '--', ...configs], { cwd: root, stdio: 'ignore' }); } catch (e) {} };
const run = (args, cwd) => execFileSync(process.execPath, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
const packs = [];
try {
  for (const g of PICK) {
    log(run([path.join(root, 'apps', g.id, 'build.mjs')], root).split('\n').pop());
    packs.push({ ...g, kind: 'mobile', www: path.join(root, 'apps', g.id, 'www') });
  }
  let desk = true;
  try { require.resolve('electron/package.json', { paths: [path.join(root, 'apps/desktop')] }); } catch (e) { desk = false; fail('pc', 'apps/desktop/node_modules absent (npm ci dans apps/desktop, ELECTRON_SKIP_BINARY_DOWNLOAD=1 suffit) : versions PC non testées'); }
  if (desk) {
    log(run(['build.mjs', ...PICK.map(g => g.id), '--stage-only'], path.join(root, 'apps/desktop')).split('\n').filter(l => /prêt \(electron/.test(l)).join(' · '));
    for (const g of PICK) packs.push({ ...g, kind: 'pc', www: path.join(root, 'apps/desktop/games', g.id, 'stage/www') });
  }
} catch (e) {
  restore();
  console.error('CONSTRUCTION ÉCHOUÉE :\n' + (e.stderr ? e.stderr.toString() : e.message));
  process.exit(1);
}
restore();

// ---------- indépendance : aucun autre jeu, ni la page Playtoon, dans le paquet d'une appli
for (const p of packs) {
  const js = fs.readFileSync(path.join(p.www, 'app.js'), 'utf8');
  const leaks = [...GAMES.filter(o => o.id !== p.id).map(o => o.name), 'Playtoon'].filter(n => js.includes(n));
  if (leaks.length) fail(`${p.id}/${p.kind}`, `www/app.js contient : ${leaks.join(', ')}`);
}

// ---------- classements : faux ponts (mobile : window.PT_SCORES, comme apps/shared/scores.js ; PC : le preload Electron)
const fakeScores = kind => {
  const L = window.__lb = { calls: [] };
  const rec = (...a) => { L.calls.push(a); return Promise.resolve(true); };
  if (kind === 'pc') {
    const st = window.__ptDesk = { fs: false, quit: 0 };
    window.ptDesktop = { fullscreen: v => Promise.resolve(st.fs = v === undefined ? !st.fs : !!v), isFullscreen: () => Promise.resolve(st.fs), quit: () => { st.quit++; }, platform: 'linux',
      scores: { status: () => Promise.resolve({ ok: true }), submit: (b, sc, d) => rec('submit', b, sc, d),
        entries: b => { L.calls.push(['show', b]); return Promise.resolve({ top: [{ rank: 1, score: 4321, name: 'Ada', me: false }, { rank: 2, score: 1234, name: 'You', me: true }], around: [], day: '', time: b === 'survival' }); } } };
  } else window.PT_SCORES = { available: () => true, submit: (b, sc, d) => rec('submit', b, sc, d), show: b => rec('show', b) };
};
async function scores(pack, base, v, tag) {
  const touch = v.tag === 'tel';
  const ctx = await browser.newContext(v.ctx);
  await ctx.addInitScript(fakeScores, pack.kind);
  const p = await ctx.newPage(); p.setDefaultTimeout(20000);
  const errs = []; p.on('pageerror', e => errs.push('exception : ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console : ' + m.text()); });
  p.on('dialog', d => d.accept());
  const calls = () => p.evaluate(() => window.__lb.calls);
  const shot = n => p.screenshot({ path: path.join(root, 'tools', 'shots', `apps-lb-${pack.id}-${pack.kind}-${v.tag}-${n}.png`) }).catch(() => {});
  const uday = new Date().toISOString().slice(0, 10);
  try {
    await p.goto(base + 'index.html', { waitUntil: 'load' }); await wait(1500);
    if (pack.key === 'forge') {
      const r = await p.evaluate(() => ({ scores: 'PT_SCORES' in window, panel: !!document.getElementById('pt-lb'), calls: window.__lb.calls.length }));
      if (r.panel || r.calls || (pack.kind === 'pc' && r.scores)) fail(tag, 'Nova Foundry : classement présent ' + JSON.stringify(r));
      else log(`  ${tag} : aucun classement (attendu)`);
    } else if (pack.key === 'blocks') {
      if (!await until(p, () => !!window.__bp && !!window.PT_SCORES)) return fail(tag, 'classements : pont non installé');
      await press(p, touch, '#bp-mapbtn'); await wait(300);
      if (!await p.isVisible('#bp-lbdaily') || !await p.isVisible('#bp-lball')) fail(tag, 'carte des modes : boutons « Classement » absents avec le pont');
      await shot('map');
      await press(p, touch, '#bp-lball'); await wait(300);
      if (pack.kind === 'pc') {   // « Classements » (tous) : le panneau Steam s'ouvre sur le premier tableau
        if (!await p.isVisible('#pt-lb')) fail(tag, 'panneau Steam : « Classements » ne l’ouvre pas');
        await press(p, touch, '#pt-lbclose'); await wait(200);
      }
      await press(p, touch, '#bp-daily'); await wait(400);
      const r = await p.evaluate(async () => {
        const { S, place, fits, N } = window.__bp;
        for (let k = 0; k < 6 && !S.over; k++) { let done = false; S.tray.forEach((pc, i) => { if (done || !pc) return; for (let y = 0; y < N && !done; y++) for (let x = 0; x < N && !done; x++) if (fits(pc, x, y)) { place(i, x, y); done = true; } }); }
        if (!(S.score > 0)) S.score = 77;
        window.__bp.gameOver(); await new Promise(res => setTimeout(res, 400));
        return { score: S.score, mode: S.mode };
      });
      const sub = (await calls()).filter(c => c[0] === 'submit' && c[1] === 'daily');
      const want = uday.replace(/-/g, '');
      if (!sub.some(c => c[2] === r.score && String(c[3]) === want)) fail(tag, `défi : submit attendu (daily, ${r.score}, ${want}), reçu ${JSON.stringify(sub)}`);
      if (!await p.isVisible('#bp-lbover')) fail(tag, 'écran de fin du défi : bouton « Classement » absent');
      await shot('over');
      await press(p, touch, '#bp-lbover'); await wait(400);
      const shows = (await calls()).filter(c => c[0] === 'show').map(c => c[1]);
      if (!shows.includes('daily')) fail(tag, `clic « Classement » : show('daily') attendu, reçu ${JSON.stringify(shows)}`);
      if (pack.kind === 'pc') {
        const rows = await p.$$eval('#pt-lb .pt-lblist li', l => l.length).catch(() => 0);
        if (!await p.isVisible('#pt-lb') || rows < 2) fail(tag, `panneau Steam : non affiché ou vide (${rows} lignes)`);
        await shot('panel');
        await p.keyboard.press('Escape'); await wait(200);
        if (await p.isVisible('#pt-lb')) fail(tag, 'panneau Steam : Échap ne le ferme pas');
      }
      log(`  ${tag} : classements — submit(daily, ${r.score}, ${want}) · show(${shows.join(', ')})`);
    } else {
      if (!await until(p, () => !!window.__nb && !!window.PT_SCORES && !!document.querySelector('#nb-start'))) return fail(tag, 'classements : pont non installé');
      if (!await until(p, () => { const e = document.getElementById('nb-lbdaily'); return e && !e.classList.contains('hidden'); }, null, 5000)) fail(tag, 'carte du défi : bouton « Classement » absent avec le pont');
      if (!await p.isVisible('#nb-lbmenu')) fail(tag, 'menu : accès « Classements » absent avec le pont');
      await p.evaluate(() => document.getElementById('nb-daily').scrollIntoView({ block: 'center' })); await wait(200); await shot('menu');
      await p.evaluate(() => document.getElementById('nb-lbmenu').scrollIntoView({ block: 'center' })); await wait(200); await shot('menu2');
      await press(p, touch, '#nb-dplay');
      if (!await until(p, () => window.__nb.S && window.__nb.S.state === 'play', null, 20000)) return fail(tag, 'défi : la run ne démarre pas');
      const r = await p.evaluate(async () => {
        const nb = window.__nb, S = nb.S; S.t = 125; S.kills = 40; S.level = 6;
        document.getElementById('nb-pausebtn').click(); await new Promise(res => setTimeout(res, 200));
        document.getElementById('nb-quit').click(); await new Promise(res => setTimeout(res, 400));
        return { key: S.daily.key, state: nb.S.state, score: Math.round(S.kills + S.level * 25 + Math.floor(S.t) * 2 + (S.stage + (S.bossDead || S.won ? 1 : 0)) * 1500) };
      });
      const c = await calls(), d = c.filter(x => x[0] === 'submit' && x[1] === 'daily'), sv = c.filter(x => x[0] === 'submit' && x[1] === 'survival');
      if (!d.some(x => x[2] === r.score && x[3] === uday)) fail(tag, `défi : submit attendu (daily, ${r.score}, ${uday}), reçu ${JSON.stringify(d)}`);
      if (!sv.some(x => x[2] === 125)) fail(tag, `survie : submit attendu (survival, 125), reçu ${JSON.stringify(sv)}`);
      if (!await until(p, () => { const e = document.getElementById('nb-lbend'); return e && e.offsetParent; }, null, 3000)) fail(tag, 'écran de fin du défi : bouton « Classement » absent');
      await shot('end');
      await press(p, touch, '#nb-lbend'); await wait(400);
      const shows = (await calls()).filter(x => x[0] === 'show').map(x => x[1]);
      if (!shows.includes('daily')) fail(tag, `clic « Classement » : show('daily') attendu, reçu ${JSON.stringify(shows)}`);
      if (pack.kind === 'pc') {
        const rows = await p.$$eval('#pt-lb .pt-lblist li', l => l.length).catch(() => 0);
        if (!await p.isVisible('#pt-lb') || rows < 2) fail(tag, `panneau Steam : non affiché ou vide (${rows} lignes)`);
        await shot('panel');
        await p.click('#pt-lbtabs [data-lb=survival]'); await wait(300);
        if (!(await calls()).some(x => x[0] === 'show' && x[1] === 'survival')) fail(tag, 'panneau Steam : onglet « survie » sans effet');
        await p.click('#pt-lbclose'); await wait(200);
      }
      log(`  ${tag} : classements — submit(daily, ${r.score}, ${uday}) · submit(survival, 125) · show(${shows.join(', ')})`);
    }
  } catch (e) { fail(tag, 'classements : scénario interrompu : ' + e.message.split('\n')[0]); }
  for (const e of [...new Set(errs)]) fail(tag, 'classements : ' + e);
  await ctx.close();
}

// ---------- serveurs : un par paquet (origine propre, comme dans l'appli : localStorage vierge)
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg', '.webp': 'image/webp' };
const serve = dir => new Promise(res => {
  const s = http.createServer((q, r) => {
    let f = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith(path.sep) || f.endsWith('/')) f = path.join(f, 'index.html');
    if (!f.startsWith(dir)) { r.writeHead(403); r.end(); return; }
    fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); r.end(d); });
  }).listen(0, '127.0.0.1', () => res(s));
});

const launch = { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] };
let browser;
try { browser = await chromium.launch(launch); } catch (e) { browser = await chromium.launch({ ...launch, executablePath: '/opt/pw-browsers/chromium' }); }
setTimeout(() => { console.error('GEL : plus de 900 s'); process.exit(2); }, 900000).unref();

const VIEWS = [
  { tag: 'tel', ctx: { viewport: { width: 420, height: 860 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
  { tag: 'pc', ctx: { viewport: { width: 1280, height: 720 } } },
];
const wait = ms => new Promise(r => setTimeout(r, ms));
// attend qu'une condition devienne vraie dans la page (machine chargée : WebGL logiciel lent)
const until = async (p, fn, arg, ms = 15000) => { const t = Date.now() + ms; for (;;) { const v = await p.evaluate(fn, arg).catch(() => false); if (v) return v; if (Date.now() > t) return false; await wait(150); } };
const press = (p, touch, sel) => touch ? p.tap(sel) : p.click(sel);

// une zone de canvas 2D réellement dessinée (pas uniforme)
const drawn = sel => { const c = document.querySelector(sel); if (!c || !c.width || !c.height) return false;
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, seen = new Set();
  for (let i = 0; i < d.length; i += 4 * 97) { seen.add(d[i] << 16 | d[i + 1] << 8 | d[i + 2]); if (seen.size > 8) return true; }
  return false; };

async function play(p, pack, touch, tag) {
  if (pack.key === 'blocks') {
    if (!await until(p, () => { const B = window.__bp; return B && B.S.tray.some(Boolean); })) return fail(tag, 'aucune pièce dans le plateau');
    if (!await until(p, drawn, '#bp-canvas')) fail(tag, 'grille non dessinée (canvas vide)');
    const r = await p.evaluate(() => {
      const { S, place, fits, N } = window.__bp, before = S.board.flat().filter(Boolean).length + S.score;
      for (let i = 0; i < S.tray.length; i++) { const pc = S.tray[i]; if (!pc) continue;
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (fits(pc, x, y)) { place(i, x, y); return { before, after: S.board.flat().filter(Boolean).length + S.score }; } }
      return null;
    });
    if (!r || r.after <= r.before) fail(tag, 'impossible de poser une pièce'); else log(`  ${tag} : pièce posée (cases+score ${r.before} → ${r.after})`);
  } else if (pack.key === 'forge') {
    if (!await until(p, () => !!window.__sf)) return fail(tag, 'Nova Foundry non chargé');
    if (await p.$eval('#sf-intro', e => !e.classList.contains('hidden')).catch(() => false)) await press(p, touch, '#sf-intro-ok');
    await wait(200);
    const d0 = await p.evaluate(() => window.__sf.S.dust);
    const b = await p.$eval('#sf-canvas', c => { const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    for (let i = 0; i < 8; i++) { if (touch) await p.touchscreen.tap(b.x, b.y); else await p.mouse.click(b.x, b.y); }
    await wait(300);
    const d1 = await p.evaluate(() => window.__sf.S.dust);
    if (!(d1 > d0)) fail(tag, `clic sur l'étoile sans poussière (${d0} → ${d1})`); else log(`  ${tag} : 8 clics → poussière ${d0} → ${Math.round(d1)}`);
  } else {
    if (!await until(p, () => !!window.__nb && !!document.querySelector('#nb-start'))) return fail(tag, 'Synth Horde non chargé');
    await press(p, touch, '#nb-start');
    if (!await until(p, () => window.__nb.S.state === 'play', null, 20000)) return fail(tag, `la run ne démarre pas (état ${await p.evaluate(() => window.__nb.S.state)})`);
    await wait(500);
    const s0 = await p.evaluate(() => { const S = window.__nb.S; S.enemies.length = 0; S.p.hp = 1e6; return [S.p.x, S.p.z, S.t]; });
    // on tient la commande pendant 1,5 s de JEU (WebGL logiciel en 1280×720 : quelques images par seconde seulement)
    const held = () => until(p, t0 => { const S = window.__nb.S; S.enemies.length = 0; return S.t - t0 >= 1.5; }, s0[2], 45000);
    if (touch) {
      const cdp = await p.context().newCDPSession(p);
      const j = await p.$eval('#nb-joy', e => { const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: j.x, y: j.y }] });
      for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: j.x, y: j.y - i * 5 }] }); await wait(30); }
      await held(); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } else { await p.keyboard.down('KeyW'); await held(); await p.keyboard.up('KeyW'); }
    const d = await p.evaluate(s0 => { const S = window.__nb.S; return Math.hypot(S.p.x - s0[0], S.p.z - s0[1]); }, s0);
    if (!(d > 1)) fail(tag, `le joueur ne bouge pas (${d.toFixed(2)} m, état ${await p.evaluate(() => window.__nb.S.state)})`); else log(`  ${tag} : run démarrée, joueur déplacé de ${d.toFixed(1)} m`);
    // mise en pause pour ouvrir les réglages au calme
    await p.evaluate(() => { const S = window.__nb.S; if (S.state === 'play') document.getElementById('nb-pausebtn').click(); });
    await wait(300);
  }
}

async function shell(p, pack, touch, tag) {
  // le bouton réglages peut vivre dans un menu (Synth Horde : carte du menu) : on revient au menu si besoin
  if (pack.key === 'bonk') {
    await p.evaluate(() => { if (window.__nb.S.state !== 'menu') document.getElementById('nb-quit').click(); }); await wait(300);   // pause → abandon
    await p.evaluate(() => { const a = document.getElementById('nb-again'); if (a && a.offsetParent) a.click(); }); await wait(300);   // fin → menu
  }
  const gear = await p.$('#bq-gear');
  if (!gear) return fail(tag, 'bouton des réglages absent');
  if (await gear.isVisible()) await press(p, touch, '#bq-gear'); else { await p.evaluate(() => window.ptOpenSettings()); log(`  ${tag} : réglages ouverts par ptOpenSettings (bouton non visible à cet instant)`); }
  if (!await until(p, () => !document.getElementById('bq-settings').classList.contains('hidden'), null, 3000)) return fail(tag, 'les réglages ne s’ouvrent pas');
  const nLang = await p.$$eval('#bq-lang option', o => o.length);
  if (nLang < 2) fail(tag, `sélecteur de langue vide (${nLang})`);
  await p.selectOption('#bq-lang', 'fr'); await wait(200);
  const fr = await p.$eval('#bq-settings h2', e => e.textContent);
  await p.selectOption('#bq-lang', 'en'); await wait(200);
  const en = await p.$eval('#bq-settings h2', e => e.textContent);
  if (fr !== 'Réglages' || en !== 'Settings') fail(tag, `changement de langue sans effet (fr « ${fr} », en « ${en} »)`);
  // pont natif absent : boutique masquée, restaurer / confidentialité ne plantent pas
  const shop = await p.$eval('#bq-shop', e => e.classList.contains('hidden'));
  if (!shop) fail(tag, 'boutique affichée sans pont natif');
  if (await p.$eval('#bq-restore', e => !!e.offsetParent)) fail(tag, '« Restaurer les achats » visible sans pont natif');
  await p.evaluate(() => document.getElementById('bq-privacy').click());   // AdMob absent : sans effet
  await wait(300);
  if (await p.evaluate(() => 'PT_MON' in window)) fail(tag, 'window.PT_MON défini hors appli native');
  if (pack.kind === 'pc') {
    const fs = await p.$eval('#bq-fsrow', e => !e.classList.contains('hidden'));
    if (!fs) fail(tag, 'version PC : réglage « Plein écran » absent'); else { await p.click('#bq-fs'); await wait(100);
      if (!await p.evaluate(() => window.__ptDesk.fs)) fail(tag, 'version PC : « Plein écran » sans effet'); }
  }
  await press(p, touch, '#bq-close');
  if (!await until(p, () => document.getElementById('bq-settings').classList.contains('hidden'), null, 3000)) fail(tag, 'les réglages ne se ferment pas');
}

// chemins du jeu qui passent par le pont natif (pubs, achats) : sans lui, ils doivent ne rien faire, sans erreur
async function bridge(p, pack) {
  if (pack.key === 'blocks') await p.evaluate(() => window.__bp.gameOver());   // fin de partie → pause publicitaire éventuelle
  else if (pack.key === 'forge') await p.evaluate(async () => { await window.__sf.watchBoost(); window.__sf.offPending = 100; await window.__sf.watchOffline(); });
  await wait(800);
}

for (const pack of packs) {
  const srv = await serve(pack.www);
  const base = `http://127.0.0.1:${srv.address().port}/`;
  for (const v of VIEWS) {
    const tag = `${pack.id}/${pack.kind}/${v.tag}`, touch = v.tag === 'tel';
    log(tag);
    const ctx = await browser.newContext(v.ctx);
    // version PC : le preload d'Electron expose window.ptDesktop (plein écran, Quitter) — imité ici
    if (pack.kind === 'pc') await ctx.addInitScript(() => { const st = window.__ptDesk = { fs: false, quit: 0 };
      window.ptDesktop = { fullscreen: v => Promise.resolve(st.fs = v === undefined ? !st.fs : !!v), isFullscreen: () => Promise.resolve(st.fs), quit: () => { st.quit++; }, platform: 'linux' }; });
    const p = await ctx.newPage(); p.setDefaultTimeout(20000);
    const errs = [];
    p.on('pageerror', e => errs.push('exception : ' + e.message));
    p.on('console', m => { if (m.type() === 'error') errs.push('console : ' + m.text()); });
    p.on('requestfailed', q => errs.push('requête échouée : ' + q.url()));
    p.on('dialog', d => d.accept());
    try {
      await p.goto(base + 'index.html', { waitUntil: 'load' });
      await wait(1200);
      if (errs.length) fail(tag, 'le jeu ne démarre pas (erreurs au chargement, ci-dessous)');
      else {
        await play(p, pack, touch, tag);
        await shell(p, pack, touch, tag);
        await bridge(p, pack);
        // sans pont de classement (web, identifiants absents) : aucun bouton « Classement » visible, rien de défini
        const lbVis = await p.evaluate(() => [...document.querySelectorAll('#bp-lbover, #bp-lbdaily, #bp-lball, #nb-lbdaily, #nb-lbmenu, #nb-lbend, #pt-lb')].filter(e => !e.classList.contains('hidden')).map(e => e.id));
        if (lbVis.length) fail(tag, 'classement visible sans pont : ' + lbVis.join(', '));
        if (await p.evaluate(() => 'PT_SCORES' in window)) fail(tag, 'window.PT_SCORES défini sans pont');
      }
    } catch (e) { fail(tag, 'scénario interrompu : ' + e.message.split('\n')[0]); }
    await wait(300);
    for (const e of [...new Set(errs)]) fail(tag, e);
    await ctx.close();
    await scores(pack, base, v, tag + '/lb');
  }
  srv.close();
}
await browser.close();
if (fails.length) { console.error('ÉCHECS (' + fails.length + ') :\n' + fails.join('\n')); process.exit(1); }
log('OK — applis : aucune erreur');
