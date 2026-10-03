// Construit www/ d'une application Playtoon à partir du site : la section du jeu d'index.html est insérée
// dans le modèle apps/shared/index.html, le JS de l'application est regroupé par esbuild.
// Identifiants publicitaires : variables d'environnement (ADMOB_REWARDED_ID, ADMOB_INTERSTITIAL_ID),
// sinon identifiants de TEST de Google (sans risque, ne rapportent rien).
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync } from 'fs';

const SHARED = new URL('./', import.meta.url).pathname, ROOT = new URL('../../', import.meta.url).pathname;
const TEST = { rewarded: 'ca-app-pub-3940256099942544/5224354917', interstitial: 'ca-app-pub-3940256099942544/1033173712' };

// app : { dir (dossier de l'application), section (id de la <section> du jeu), versionKey, title, ads (false : appli payante), config (champs en plus),
//        esbuild (la fonction build d'esbuild, installé dans l'application) }
export async function buildApp(app) {
  const OUT = app.dir + 'www/', env = process.env;
  const { VERSIONS } = await import(ROOT + 'js/version.js');
  const config = {
    version: VERSIONS[app.versionKey],
    testAds: !(env.ADMOB_REWARDED_ID && env.ADMOB_INTERSTITIAL_ID) || env.ADMOB_TEST === '1',
    rewardedId: env.ADMOB_REWARDED_ID || TEST.rewarded,
    interstitialId: env.ADMOB_INTERSTITIAL_ID || TEST.interstitial,
    ...(app.config || {}),
  };
  writeFileSync(app.dir + 'src/config.js', '// généré par build.mjs — ne pas modifier à la main\nexport const CONFIG = ' + JSON.stringify(config, null, 2) + ';\n');
  rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true });
  const site = readFileSync(ROOT + 'index.html', 'utf8');
  const m = site.match(new RegExp(`<section id="${app.section}"[\\s\\S]*?<\\/section>`));
  if (!m) throw new Error(`section #${app.section} introuvable dans index.html`);
  const html = readFileSync(SHARED + 'index.html', 'utf8').replace('<!--TITLE-->', app.title).replace('<!--GAME-->', m[0].replace('class="tab"', 'class="tab on"'));
  writeFileSync(OUT + 'index.html', html);
  copyFileSync(ROOT + 'css/style.css', OUT + 'style.css');
  copyFileSync(SHARED + 'app.css', OUT + 'app.css');
  for (const f of app.copy || []) copyFileSync(ROOT + f, OUT + f.split('/').pop());
  await app.esbuild({ entryPoints: [app.dir + 'src/app.js'], bundle: true, format: 'esm', target: 'es2020', minify: true, outfile: OUT + 'app.js', nodePaths: [app.dir + 'node_modules'], logLevel: 'warning', loader: { '.png': 'file' } });
  console.log(`www/ prêt (${app.title}) —`, app.ads === false ? 'application payante, sans publicité' : config.testAds ? 'publicités de TEST' : 'publicités réelles', '— version', config.version);
  return config;
}
