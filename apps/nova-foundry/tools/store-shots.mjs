// Captures Google Play (1080×1920) de Nova Foundry en anglais et en français.
// Prérequis : `node build.mjs`, puis servir www/ sur le port 8791 (npx http-server -p 8791 -s www).
import { createRequire } from 'module';
import { mkdirSync } from 'fs';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
// Variables (captures Steam, PC) : SHOT_URL, SHOT_OUT, SHOT_W, SHOT_H, SHOT_DSF, SHOT_MOBILE=0
const E = process.env, OUT = E.SHOT_OUT || new URL('../store/screenshots/', import.meta.url).pathname;
const URL_ = E.SHOT_URL || 'http://localhost:8791/';
const VIEW = { viewport: { width: +(E.SHOT_W || 432), height: +(E.SHOT_H || 768) }, deviceScaleFactor: +(E.SHOT_DSF || 2.5), isMobile: E.SHOT_MOBILE !== '0', hasTouch: E.SHOT_MOBILE !== '0' };

// iPhone (1290×2796) : SHOT_W=430 SHOT_H=932 SHOT_OUT=store/ios-screenshots/ ; Steam (1920×1080) : SHOT_W=1280 SHOT_H=720 SHOT_DSF=1.5
// SHOT_MOBILE=0 SHOT_OUT=../desktop/steam/nova-foundry/screenshots/ (servir alors apps/desktop/games/nova-foundry/stage/www).
// 1.11.0 : une partie de fin de jeu crédible — étoile évoluée (hypergéante bleue), Constellation complète, Astérismes en
// cours, Commandes de la forge, rang de compagnonnage, Carnet de bord, Veille du jour — au lieu d'une partie de 2 h.
const SAVE = { dust: 4.2e21, runTotal: 9.6e22, lifeTotal: 3.1e24, clicks: 2400, lifeClicks: 64000, gens: [260, 240, 220, 200, 180, 160, 140, 120, 100, 80, 50, 25], upg: {}, cometsTotal: 14, lifeComets: 420,
  novaTotal: 2.6e6, novaBank: 8.4e5, meta: {}, ach: {}, prestiges: 48, chal: null, chalT: 0, chalDone: { c_hands: 1, c_short: 1, c_noupg: 1, c_infl: 1 }, sing: 4, singBank: 1, gal: { g_auto: 1, g_comet: 1 }, bigbangs: 2,
  ast: { a_crucible: 10, a_lyre: 6, a_sextant: 3, a_scales: 1 }, buffs: [], stage: 6, mast: 3, runT: 1800,
  st: { play: 19 * 3600, snLast: 5.2e4, dpsLast: 1e19, sky: 40, nUpg: 400, atlas: 1, shoot: 90, sky_shower: 1, away: 7200 },
  ord: { list: [], done: 52, swapAt: 0 },
  log: [[640, 'sn', 1], [1900, 'stage', 2], [5100, 'chal', 'c_hands'], [9400, 'stage', 3], [21000, 'stage', 4], [36000, 'bb', 1], [41000, 'rank', 3], [52000, 'ast', 'a_crucible'], [60500, 'stage', 6], [66000, 'rank', 4]],
  last: Date.now(), started: Date.now() };
for (let g = 0; g < 12; g++) for (let t = 0; t < 6; t++) SAVE.upg[`g${g}t${t}`] = 1;
['click0', 'click1', 'click2', 'click3', 'glob0', 'glob1', 'glob2', 'luck0', 'luck1'].forEach(k => SAVE.upg[k] = 1);
const ACHS = ['tot1000', 'tot1000000', 'tot1000000000', 'clk100', 'clk1000', 'own0', 'own1', 'own2', 'own3', 'pre1', 'pre5', 'pre25', 'com1', 'com10', 'com100', 'dps1000', 'dps1000000', 'dps1000000000'];

const tab = x => async p => { await p.evaluate(k => document.querySelector(`[data-sf=${k}]`).click(), x); };
const to = sel => async p => { await p.waitForTimeout(250); await p.evaluate(s => { const e = document.querySelector(s); if (e) e.scrollIntoView({ block: 'start' }); }, sel); };
const SCENES = [
  ['01-forges', async p => { await p.evaluate(() => { const sf = window.__sf; sf.S.buffs.push({ type: 'frenzy', t: 42, max: 60 }); }); }],
  ['02-constellation', tab('meta')],
  ['03-asterisms', async p => { await tab('meta')(p); await to('.sf-ast, #sf-ast')(p); }],
  ['04-orders', tab('ord')],
  ['05-daily', async p => { await p.evaluate(() => window.__sf.startSky('aurora')); await tab('ach')(p); }],
  ['06-supernova', async p => { await p.evaluate(() => document.getElementById('sf-prestige').click()); }],
];
// META, ACH : complétés dans la page (les identifiants viennent du jeu)
const prep = async p => p.evaluate(a => { const sf = window.__sf; sf.META.forEach(m => sf.S.meta[m.id] = 1); a.forEach(k => sf.S.ach[k] = 1); sf.ACH.slice(0, 60).forEach(x => sf.S.ach[x.id] = 1); sf.checkOrders(); document.querySelector('[data-sf=gen]').click(); }, ACHS);
const b = await chromium.launch();
for (const lang of ['en', 'fr']) {
  mkdirSync(OUT + lang, { recursive: true });
  for (const [name, setup] of SCENES) {
    const ctx = await b.newContext({ ...VIEW, locale: lang });
    const p = await ctx.newPage();
    await p.addInitScript(([l, s]) => { if (!sessionStorage.getItem('init')) { sessionStorage.setItem('init', 1); localStorage.clear(); localStorage.setItem('playtoon.lang', l); localStorage.setItem('starforge.intro', '1'); localStorage.setItem('starforge.save.v1', JSON.stringify({ ...s, last: Date.now() })); } }, [lang, SAVE]);
    await p.goto(URL_); await p.waitForTimeout(900);
    await prep(p); await p.waitForTimeout(300);
    await setup(p); await p.waitForTimeout(900);
    await p.evaluate(() => document.querySelectorAll('#sf-toasts .toast').forEach(t => t.remove()));
    await p.screenshot({ path: `${OUT}${lang}/${name}.png` });
    await ctx.close(); console.log(lang, name);
  }
}
await b.close();
