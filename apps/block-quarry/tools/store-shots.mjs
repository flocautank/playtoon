// Captures d'écran Google Play (1080×1920, téléphone) de l'application, en anglais et en français.
// Prérequis : `node build.mjs`, puis servir www/ sur le port 8790 (npx http-server -p 8790 -s www).
// Usage : node tools/store-shots.mjs  →  store/screenshots/<langue>/NN-scene.png
import { createRequire } from 'module';
import { mkdirSync } from 'fs';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
const OUT = new URL('../store/screenshots/', import.meta.url).pathname;

// remplit la grille « comme en cours de partie » avec un motif déterministe
const PREP = `(() => { const bp = window.__bp, S = bp.S, C = ['#ff5d8f','#ffc94d','#4dd4ff','#7cff8a','#b98bff','#ff8a4d','#4dffd2'];
  window.__fill = (rows) => { for (const [y, pat] of rows) for (let x = 0; x < 8; x++) if (pat[x] !== '.') S.board[y][x] = C[+pat[x]]; };
})()`;
const SCENES = [
  ['01-classic', async p => p.evaluate(() => { const S = window.__bp.S; S.score = S.shown = 2480; S.best = 3120;
    window.__fill([[3, '0011.222'], [4, '0.1..2.3'], [5, '44.3.333'], [6, '4455.663'], [7, '4455.666']]);
    S.pops.push({ text: window.PT_I18N.t('bp.praise')[3] + '  ' + window.PT_I18N.t('bp.combo', { n: 3 }), sub: '+185', t: 0.25 });
    document.getElementById('bp-best').textContent = (3120).toLocaleString(window.PT_I18N.lang); })],
  ['02-adventure', async p => p.evaluate(() => { window.__bp.startLevel(9); window.__bp.S.pops.length = 0; })],
  ['03-map', async p => { await p.evaluate(() => { localStorage.setItem('blocparty.adv', JSON.stringify({ stars: { 1: 3, 2: 3, 3: 2, 4: 3, 5: 1, 6: 2, 7: 3 } })); }); await p.reload(); await p.waitForTimeout(600); await p.evaluate(PREP); await p.click('#bp-mapbtn'); }],
  ['04-timeattack', async p => p.evaluate(() => { window.__bp.startChrono(); const S = window.__bp.S; S.clock = 74; S.chronoT = 46; S.score = S.shown = 1260; S.pops.length = 0;
    window.__fill([[5, '22.2.222'], [6, '11113.33'], [7, '0000.555']]); })],
  ['05-themes', async p => { await p.evaluate(() => { localStorage.setItem('blocparty.themes', JSON.stringify({ owned: ['classic', 'neon', 'pixel'], cur: 'neon' })); localStorage.setItem('blocparty.coins', '140'); }); await p.reload(); await p.waitForTimeout(600); await p.evaluate(PREP); await p.evaluate(() => { const S = window.__bp.S; window.__fill([[4, '0011.222'], [5, '0.1..2.3'], [6, '44.3.333'], [7, '4455.663']]); S.score = S.shown = 1740; document.getElementById('bp-best').textContent = (2960).toLocaleString(window.PT_I18N.lang); }); }],
  ['06-daily', async p => p.evaluate(() => { window.__bp.startDaily(); window.__bp.S.pops.length = 0; })],
];

const b = await chromium.launch();
for (const lang of ['en', 'fr']) {
  mkdirSync(OUT + lang, { recursive: true });
  for (const [name, setup] of SCENES) {
    const ctx = await b.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: lang });
    const p = await ctx.newPage();
    await p.addInitScript(l => { if (!sessionStorage.getItem('init')) { sessionStorage.setItem('init', 1); localStorage.clear(); localStorage.setItem('playtoon.lang', l); localStorage.setItem('blocparty.tuto', '1'); } }, lang);
    await p.goto('http://localhost:8790/'); await p.waitForTimeout(700);
    await p.evaluate(PREP); await setup(p); await p.waitForTimeout(450);
    await p.screenshot({ path: `${OUT}${lang}/${name}.png` });
    await ctx.close();
    console.log(lang, name);
  }
}
await b.close();
