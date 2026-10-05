// Captures Google Play (1920×1080, paysage) de Synth Horde en anglais et en français.
// Prérequis : `node build.mjs`, puis servir www/ sur le port 8792 (npx http-server -p 8792 -s www).
import { createRequire } from 'module';
import { mkdirSync } from 'fs';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
// Variables (captures Steam, PC) : SHOT_URL, SHOT_OUT, SHOT_W, SHOT_H, SHOT_DSF, SHOT_MOBILE=0
const E = process.env, OUT = E.SHOT_OUT || new URL('../store/screenshots/', import.meta.url).pathname;
const URL_ = E.SHOT_URL || 'http://localhost:8792/';
const VIEW = { viewport: { width: +(E.SHOT_W || 640), height: +(E.SHOT_H || 360) }, deviceScaleFactor: +(E.SHOT_DSF || 3), isMobile: E.SHOT_MOBILE !== '0', hasTouch: E.SHOT_MOBILE !== '0' };
const META = { totalKills: 5200, bossKills: 3, maxLevel: 31, bestTime: 1260, bestKills: 2400, runs: 14, wins: 1, sel: 'ronin', sens: 1, credits: 940,
  shop: { hp: 3, dmg: 3, speed: 2, magnet: 2, xp: 2, luck: 1, gold: 2, reroll: 1 }, music: true, nums: 'merge' };

// run avancée : build fourni, joueur invulnérable, la simulation tourne quelques dizaines de secondes de jeu
const RUN = async (p, { stage = 0, secs = 30, boss = false, crowd = 40 } = {}) => p.evaluate(async ({ stage, secs, boss, crowd }) => {
  document.getElementById('nb-start').click();
  await new Promise(r => setTimeout(r, 400));
  const nb = window.__nb, S = nb.S;
  ['orbit', 'pulse', 'arc', 'rocket'].forEach(w => nb.addWeapon(w));
  S.weapons.forEach(w => w.lvl = 5);
  document.querySelectorAll('#nb-weapons').length;
  for (let i = 0; i < stage; i++) nb.nextStage();
  S.stats.hp = 1e6; S.p.hp = 1e6;
  const settle = () => { S.pending = 0; if (S.state === 'levelup') { S.state = 'play'; document.getElementById('nb-levelup').classList.add('hidden'); } };
  for (let i = 0; i < secs * 30; i++) { nb.update(1 / 30); settle(); }
  const types = ['drone', 'spike', 'brute', 'gunner', 'charger', 'splitter', 'bomber', 'blinker', 'healer'];
  for (let i = 0; i < crowd; i++) { const a = i / crowd * 6.283 + 0.4, d = 13 + (i % 6) * 2.5; nb.spawnEnemy(types[i % types.length], S.p.x + Math.cos(a) * d, S.p.z + Math.sin(a) * d); }
  if (boss) { nb.spawnBoss(); S.boss.x = S.p.x + 4; S.boss.z = S.p.z - 16; }
  for (let i = 0; i < 20; i++) { nb.update(1 / 30); settle(); }
  S.p.hp = S.stats.hp = 180; S.p.hp = 132; S.pending = 0; S.xp = 0; S.need = 1e9;   // pas de choix de niveau pendant la capture
}, { stage, secs, boss, crowd });
const SCENES = [
  ['01-horde', p => RUN(p, { secs: 40 })],
  ['02-levelup', async p => { await RUN(p, { secs: 20 }); await p.evaluate(() => { const S = window.__nb.S; S.need = 40; S.xp = 41; window.__nb.update(1 / 30); }); }],
  ['03-furnace', p => RUN(p, { stage: 1, secs: 25, crowd: 60 })],
  ['04-boss', p => RUN(p, { stage: 2, secs: 10, boss: true, crowd: 10 })],
  ['05-upgrades', async p => { await p.evaluate(() => { const c = document.querySelector('#nb-menu .card'); c.scrollTop = document.getElementById('nb-shop').offsetTop - 60; }); }],
];
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const lang of ['en', 'fr']) {
  mkdirSync(OUT + lang, { recursive: true });
  for (const [name, setup] of SCENES) {
    const ctx = await b.newContext({ ...VIEW, locale: lang });
    const p = await ctx.newPage();
    await p.addInitScript(([l, m]) => { if (!sessionStorage.getItem('init')) { sessionStorage.setItem('init', 1); localStorage.clear(); localStorage.setItem('playtoon.lang', l); localStorage.setItem('playtoon.music', '0'); localStorage.setItem('neonbonk.meta.v1', JSON.stringify(m)); } }, [lang, META]);
    await p.goto(URL_); await p.waitForTimeout(2500);
    await setup(p); await p.waitForTimeout(1200);
    // version PC : la fenêtre headless perd le focus et le jeu se met en pause — on reprend juste avant la capture
    await p.evaluate(() => { const nb = window.__nb, S = nb && nb.S; if (S && S.state === 'pause') { document.getElementById('nb-pause').classList.add('hidden'); S.state = 'play'; } });
    await p.waitForTimeout(150);
    await p.screenshot({ path: `${OUT}${lang}/${name}.png` });
    await ctx.close(); console.log(lang, name);
  }
}
await b.close();
