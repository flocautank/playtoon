// Captures d'écran Google Play (1080×1920, téléphone) de l'application, en anglais et en français.
// iPhone (1290×2796) : SHOT_W=430 SHOT_H=932 SHOT_OUT=store/ios-screenshots/ ; Steam (1920×1080) : SHOT_W=1280 SHOT_H=720 SHOT_DSF=1.5 SHOT_MOBILE=0 SHOT_OUT=../desktop/steam/block-quarry/screenshots/
// Prérequis : `node build.mjs`, puis servir www/ sur le port 8790 (npx http-server -p 8790 -s www).
// Usage : node tools/store-shots.mjs  →  store/screenshots/<langue>/NN-scene.png
import { createRequire } from 'module';
import { mkdirSync } from 'fs';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
// Variables (captures Steam, PC) : SHOT_URL, SHOT_OUT, SHOT_W, SHOT_H, SHOT_DSF, SHOT_MOBILE=0
const E = process.env, OUT = E.SHOT_OUT || new URL('../store/screenshots/', import.meta.url).pathname;
const URL_ = E.SHOT_URL || 'http://localhost:8790/';
const VIEW = { viewport: { width: +(E.SHOT_W || 360), height: +(E.SHOT_H || 640) }, deviceScaleFactor: +(E.SHOT_DSF || 3), isMobile: E.SHOT_MOBILE !== '0', hasTouch: E.SHOT_MOBILE !== '0' };

// remplit la grille « comme en cours de partie » avec un motif déterministe
const PREP = `(() => { const bp = window.__bp, S = bp.S, C = ['#ff5d8f','#ffc94d','#4dd4ff','#7cff8a','#b98bff','#ff8a4d','#4dffd2'];
  window.__fill = (rows) => { for (const [y, pat] of rows) for (let x = 0; x < 8; x++) if (pat[x] !== '.') S.board[y][x] = C[+pat[x]]; };
})()`;
const SCENES = [
  ['01-classic', async p => p.evaluate(() => { const S = window.__bp.S; S.score = S.shown = 2480; S.best = S.bestStart = 3120;
    window.__fill([[3, '0011.222'], [4, '0.1..2.3'], [5, '44.3.333'], [6, '4455.663'], [7, '4455.666']]);
    S.pops.push({ text: window.PT_I18N.t('bp.praise')[3] + '  ' + window.PT_I18N.t('bp.combo', { n: 3 }), sub: '+185', t: 0.25 });
    document.getElementById('bp-best').textContent = (3120).toLocaleString(window.PT_I18N.lang); })],
  ['02-adventure', async p => p.evaluate(() => { window.__bp.startLevel(9); window.__bp.S.pops.length = 0; })],
  ['03-map', async p => { await p.evaluate(() => { localStorage.setItem('blocparty.adv', JSON.stringify({ stars: { 1: 3, 2: 3, 3: 2, 4: 3, 5: 1, 6: 2, 7: 3 } })); }); await p.reload(); await p.waitForTimeout(600); await p.evaluate(PREP); await p.click('#bp-mapbtn'); }],
  ['04-timeattack', async p => p.evaluate(() => { window.__bp.startChrono(); const S = window.__bp.S; S.clock = 74; S.chronoT = 46; S.score = S.shown = 1260; S.pops.length = 0;
    window.__fill([[5, '22.2.222'], [6, '11113.33'], [7, '0000.555']]); })],
  // Carnet du carrier (1.9.0) : grade gravé, missions de la semaine, médailles de chapitre — à la place de l'ancien thème Néon
  ['05-career', async p => { await p.evaluate(() => { const a = {}; for (let i = 1; i <= 26; i++) a[i] = i <= 20 ? 3 : 2; localStorage.setItem('blocparty.adv', JSON.stringify({ stars: a }));
      localStorage.setItem('blocparty.career', JSON.stringify({ xp: 1460, rank: 7, st: { lines: 812, pieces: 2140, games: 64, combo: 7, clears: 9, days: 12 }, medals: { 0: 1, 1: 1 } })); localStorage.setItem('blocparty.coins', '240'); });
    await p.reload(); await p.waitForTimeout(700); await p.evaluate(() => { const bp = window.__bp, w = bp.ensureWeek(); w.p[w.ids[0]] = bp.MISSIONS[w.ids[0]][0]; w.got[w.ids[0]] = 1; w.p[w.ids[1]] = Math.ceil(bp.MISSIONS[w.ids[1]][0] * 0.6); w.p[w.ids[2]] = Math.ceil(bp.MISSIONS[w.ids[2]][0] * 0.3); bp.openCareer(); }); }],
  ['06-daily', async p => p.evaluate(() => { window.__bp.startDaily(); window.__bp.S.pops.length = 0; })],
];

const b = await chromium.launch();
for (const lang of ['en', 'fr']) {
  mkdirSync(OUT + lang, { recursive: true });
  for (const [name, setup] of SCENES) {
    const ctx = await b.newContext({ ...VIEW, locale: lang });
    const p = await ctx.newPage();
    await p.addInitScript(l => { if (!sessionStorage.getItem('init')) { sessionStorage.setItem('init', 1); localStorage.clear(); localStorage.setItem('playtoon.lang', l); localStorage.setItem('blocparty.tuto', '1'); const d = new Date(); localStorage.setItem('blocparty.login', JSON.stringify({ day: d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(), streak: 1 })); } }, lang);
    await p.goto(URL_); await p.waitForTimeout(700);
    await p.evaluate(PREP); await setup(p); await p.waitForTimeout(450);
    await p.screenshot({ path: `${OUT}${lang}/${name}.png` });
    await ctx.close();
    console.log(lang, name);
  }
}
await b.close();
