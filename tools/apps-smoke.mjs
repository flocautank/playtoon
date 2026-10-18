// Test de fumée des APPLICATIONS (pas du site) : construit le www/ de chaque appli mobile (Capacitor) et de chaque
// version PC (le dossier que charge la fenêtre Electron), sert chacun sur son propre serveur local et l'ouvre dans
// Chromium headless, en téléphone 420×860 tactile et en fenêtre 1280×720. Pour chaque jeu et chaque paquet :
//   - zéro « pageerror », zéro erreur console (ex. Block Quarry 1.6.0 → 1.9.x : exception au chargement, invisible sur le site) ;
//   - le jeu est jouable (Block Quarry : grille et pièces dessinées, une pièce se pose ; Nova Foundry : un clic donne de
//     la poussière d'étoile ; Synth Horde : une run démarre et le joueur bouge) ;
//   - la coquille s'ouvre (réglages, changement de langue), le pont natif absent (pubs, achats) est toléré ;
//   - indépendance : le www/app.js ne contient le nom d'aucun autre jeu, ni « Playtoon ».
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
      }
    } catch (e) { fail(tag, 'scénario interrompu : ' + e.message.split('\n')[0]); }
    await wait(300);
    for (const e of [...new Set(errs)]) fail(tag, e);
    await ctx.close();
  }
  srv.close();
}
await browser.close();
if (fails.length) { console.error('ÉCHECS (' + fails.length + ') :\n' + fails.join('\n')); process.exit(1); }
log('OK — applis : aucune erreur');
