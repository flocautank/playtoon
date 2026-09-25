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
const log = (...a) => console.log(...a);

// ---------- desktop
const page = await browser.newPage({ viewport: { width: 1280, height: 760 } }); watch(page, 'desktop');
page.on('dialog', d => d.accept());
await page.goto(base + '#blocks'); await page.waitForTimeout(700); await shot(page, 'blocks');
await page.goto(base + '#forge'); await page.waitForTimeout(700);
for (let i = 0; i < 40; i++) await page.mouse.click(360, 390);
await page.waitForTimeout(300); await shot(page, 'forge');
for (const t of ['upg', 'meta', 'ach', 'opt', 'gen']) { await page.click(`[data-sf=${t}]`); await page.waitForTimeout(150); }
await page.goto(base + '#bonk'); await page.waitForTimeout(1200); await shot(page, 'bonk-menu');
await page.click('#nb-start'); await page.waitForTimeout(1500);
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
await page.evaluate(() => { const S = window.__nb.S; if (S.state !== 'end') { S.state = 'play'; S.revives = 0; S.iframe = 0; S.stats.dodge = 0; S.stats.shield = 0; S.p.hp = 1; window.__nb.hurtTest && 0; } });
await page.click('#nb-quit').catch(() => {});
await page.evaluate(() => { const S = window.__nb.S; if (S.state !== 'end') { document.getElementById('nb-quit').click(); } });
await page.waitForTimeout(400); await shot(page, 'bonk-end');
await page.click('#nb-again').catch(() => {}); await page.waitForTimeout(400); await shot(page, 'bonk-menu2');
log('crédits après run :', await page.$eval('#nb-credits', e => e.textContent));
await page.close();

// ---------- mobile
const ctx = await browser.newContext({ ...devices['iPhone 13'] });
const m = await ctx.newPage(); watch(m, 'mobile');
for (const t of ['blocks', 'forge', 'bonk']) { await m.goto(base + '#' + t); await m.waitForTimeout(900); await shot(m, 'm-' + t); }
await m.tap('#nb-start'); await m.waitForTimeout(1500); await shot(m, 'm-bonk-play');

await browser.close(); srv.close();
if (errs.length) { console.error('ERREURS :\n' + errs.join('\n')); process.exit(1); }
log('OK — aucune erreur console');
