// Construit www/ (le contenu de l'application) à partir du jeu web de Playtoon :
// la section Block Quarry d'index.html est insérée dans src/index.html, le JS est regroupé par esbuild.
// Identifiants publicitaires : variables d'environnement, sinon identifiants de TEST de Google.
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync } from 'fs';
import { build } from 'esbuild';

const ROOT = new URL('../../', import.meta.url).pathname, HERE = new URL('./', import.meta.url).pathname, OUT = HERE + 'www/';
const pkg = JSON.parse(readFileSync(HERE + 'package.json', 'utf8'));
const env = process.env;
const TEST = { rewarded: 'ca-app-pub-3940256099942544/5224354917', interstitial: 'ca-app-pub-3940256099942544/1033173712' };
const config = {
  version: pkg.version,
  testAds: !(env.ADMOB_REWARDED_ID && env.ADMOB_INTERSTITIAL_ID) || env.ADMOB_TEST === '1',
  rewardedId: env.ADMOB_REWARDED_ID || TEST.rewarded,
  interstitialId: env.ADMOB_INTERSTITIAL_ID || TEST.interstitial,
  removeAdsSku: env.REMOVE_ADS_SKU || 'remove_ads',
};
writeFileSync(HERE + 'src/config.js', '// généré par build.mjs — ne pas modifier à la main\nexport const CONFIG = ' + JSON.stringify(config, null, 2) + ';\n');

rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true });
const site = readFileSync(ROOT + 'index.html', 'utf8');
const m = site.match(/<section id="tab-blocks"[\s\S]*?<\/section>/);
if (!m) throw new Error('section #tab-blocks introuvable dans index.html');
writeFileSync(OUT + 'index.html', readFileSync(HERE + 'src/index.html', 'utf8').replace('<!--GAME-->', m[0].replace('class="tab"', 'class="tab on"')));
copyFileSync(ROOT + 'css/style.css', OUT + 'style.css');
copyFileSync(HERE + 'src/app.css', OUT + 'app.css');
await build({ entryPoints: [HERE + 'src/app.js'], bundle: true, format: 'esm', target: 'es2020', minify: true, outfile: OUT + 'app.js', logLevel: 'warning' });
console.log('www/ prêt —', config.testAds ? 'publicités de TEST' : 'publicités réelles', '— version', config.version);
