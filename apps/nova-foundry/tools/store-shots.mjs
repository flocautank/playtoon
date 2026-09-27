// Captures Google Play (1080×1920) de Nova Foundry en anglais et en français.
// Prérequis : `node build.mjs`, puis servir www/ sur le port 8791 (npx http-server -p 8791 -s www).
import { createRequire } from 'module';
import { mkdirSync } from 'fs';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
const OUT = new URL('../store/screenshots/', import.meta.url).pathname;

// partie avancée crédible : forges, améliorations, Novae, constellation partielle
const SAVE = { dust: 4.2e9, runTotal: 9.6e10, lifeTotal: 3.1e12, clicks: 2400, lifeClicks: 18000, gens: [120, 95, 80, 64, 50, 36, 22, 9, 2, 0], upg: {}, cometsTotal: 6, lifeComets: 41,
  novaTotal: 64, novaBank: 18, meta: { m_click: 1, m_start: 1, m_auto: 1, m_cheap: 1, m_off: 1, m_comet: 1, m_econ: 1 }, ach: {}, prestiges: 6, chal: null, chalT: 0, chalDone: { c_hands: 1, c_short: 1 }, sing: 0, singBank: 0, gal: {}, bigbangs: 0, buffs: [], last: Date.now(), started: Date.now() };
for (let g = 0; g < 7; g++) for (let t = 0; t < 4; t++) SAVE.upg[`g${g}t${t}`] = 1;
['click0', 'click1', 'click2', 'glob0', 'glob1', 'luck0'].forEach(k => SAVE.upg[k] = 1);
['tot1000', 'tot1000000', 'tot1000000000', 'clk100', 'clk1000', 'own0', 'own1', 'own2', 'pre1', 'pre5', 'com1', 'com10', 'dps1000', 'dps1000000'].forEach(k => SAVE.ach[k] = 1);

const tab = x => async p => { await p.evaluate(k => document.querySelector(`[data-sf=${k}]`).click(), x); };
const SCENES = [
  ['01-forges', async p => { await p.evaluate(() => { const sf = window.__sf; sf.S.buffs.push({ type: 'frenzy', t: 42, max: 60 }); for (let i = 0; i < 4; i++) sf.catchComet && 0; }); }],
  ['02-upgrades', tab('upg')],
  ['03-constellation', tab('meta')],
  ['04-comet', async p => { await p.evaluate(() => { const sf = window.__sf; sf.spawnComet(); sf.comet.x = 0.72; sf.comet.y = 0.3; sf.S.buffs.push({ type: 'meteor', t: 5, max: 7 }); }); }],
  ['05-challenges', tab('chal')],
  ['06-supernova', async p => { await p.evaluate(() => document.getElementById('sf-prestige').click()); }],
];
const b = await chromium.launch();
for (const lang of ['en', 'fr']) {
  mkdirSync(OUT + lang, { recursive: true });
  for (const [name, setup] of SCENES) {
    const ctx = await b.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: lang });
    const p = await ctx.newPage();
    await p.addInitScript(([l, s]) => { if (!sessionStorage.getItem('init')) { sessionStorage.setItem('init', 1); localStorage.clear(); localStorage.setItem('playtoon.lang', l); localStorage.setItem('starforge.intro', '1'); localStorage.setItem('starforge.save.v1', JSON.stringify({ ...s, last: Date.now() })); } }, [lang, SAVE]);
    await p.goto('http://localhost:8791/'); await p.waitForTimeout(900);
    await setup(p); await p.waitForTimeout(700);
    await p.evaluate(() => document.querySelectorAll('#sf-toasts .toast').forEach(t => t.remove()));
    await p.screenshot({ path: `${OUT}${lang}/${name}.png` });
    await ctx.close(); console.log(lang, name);
  }
}
await b.close();
