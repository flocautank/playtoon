// Construit les versions PC (Steam) des jeux Playtoon avec Electron.
//   node build.mjs [jeu…] [--win] [--linux] [--mac] [--stage-only]
// Sans jeu : les trois. Sans plateforme : celle de la machine. --stage-only : prépare games/<jeu>/stage sans empaqueter
// (lancement direct : npx electron games/<jeu>/stage).
// Sortie : dist/<jeu>/<plateforme>-unpacked (dossier prêt pour un dépôt Steam ; Steam installe les fichiers tels quels).
// Classements Steam (jeux avec « scores » dans games.mjs) : steamworks.js copié dans steamworks/ (hors asar), App ID lu
// dans <PRÉFIXE>_STEAM_APPID s'il existe (sinon celui que Steam donne au lancement).
import { build as esbuild } from 'esbuild';
import { cpSync, mkdirSync, rmSync, writeFileSync, copyFileSync, existsSync, chmodSync } from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { buildApp } from '../shared/build-app.mjs';
import { GAMES } from './games.mjs';
import { LEADERBOARDS } from '../shared/leaderboards.mjs';

const require = createRequire(import.meta.url);
const HERE = fileURLToPath(new URL('./', import.meta.url));
const args = process.argv.slice(2);
const ids = args.filter(a => !a.startsWith('--'));
const stageOnly = args.includes('--stage-only');
const plats = ['win', 'linux', 'mac'].filter(p => args.includes('--' + p));
const electronVersion = require('electron/package.json').version;

for (const id of ids.length ? ids : Object.keys(GAMES)) {
  const g = GAMES[id]; if (!g) throw new Error('jeu inconnu : ' + id);
  const dir = `${HERE}games/${id}/`, stage = dir + 'stage/';
  mkdirSync(dir + 'src', { recursive: true });
  // classements du jeu (nom Steam, quotidien, format, bornes, libellé) — null pour Nova Foundry
  const boards = g.scores ? LEADERBOARDS[g.scores].boards : null;
  // point d'entrée : le jeu + la coquille PC (aucune publicité, aucun achat ; classements Steam pour BQ et SH)
  writeFileSync(dir + 'src/app.js', `// généré par apps/desktop/build.mjs — ne pas modifier à la main
import '../../../../../js/${{ blocks: 'blocks', forge: 'clicker', bonk: 'bonk' }[g.game]}.js';
import { initDesktop } from '../../../src/shell.js';
import { CONFIG } from './config.js';
initDesktop({ game: '${g.game}', gearHost: ${JSON.stringify(g.gearHost)}, gearIcon: ${JSON.stringify(g.gearIcon)}, version: CONFIG.version, music: ${g.music}${boards ? ', scores: ' + JSON.stringify(Object.fromEntries(Object.entries(boards).map(([k, b]) => [k, { label: b.label, daily: !!b.daily, time: !!b.time }]))) : ''} });
`);
  const cfg = await buildApp({ dir, section: g.section, versionKey: g.versionKey, title: g.title, ads: false, esbuild });
  // dossier d'application Electron : main + preload + jeu
  rmSync(stage, { recursive: true, force: true }); mkdirSync(stage, { recursive: true });
  cpSync(dir + 'www', stage + 'www', { recursive: true });
  copyFileSync(HERE + 'electron/main.cjs', stage + 'main.cjs');
  copyFileSync(HERE + 'electron/preload.cjs', stage + 'preload.cjs');
  const appIdVar = process.env[g.steamPrefix + '_STEAM_APPID'] || '';
  if (boards) {
    copyFileSync(HERE + 'electron/steam.cjs', stage + 'steam.cjs');
    // steamworks.js : index.js + binaires des systèmes construits (ou de tous pour --stage-only)
    const SW = HERE + 'node_modules/@pipelab/steamworks.js/', want = stageOnly || !plats.length ? null : plats.map(p => ({ win: 'win64', linux: 'linux64', mac: 'osx' })[p]);
    mkdirSync(stage + 'steamworks/dist', { recursive: true });
    for (const f of ['index.js', 'package.json', 'LICENSE']) copyFileSync(SW + f, stage + 'steamworks/' + f);
    for (const d of ['win64', 'linux64', 'osx']) if (!want || want.includes(d)) cpSync(SW + 'dist/' + d, stage + 'steamworks/dist/' + d, { recursive: true, filter: f => !f.endsWith('.lib') });
  }
  copyFileSync(HERE + g.icon, stage + 'icon.png');
  writeFileSync(stage + 'game.json', JSON.stringify({ title: g.title, bg: g.bg, width: g.width, height: g.height,
    ...(boards ? { boards: Object.fromEntries(Object.entries(boards).map(([k, b]) => [k, { steam: b.steam, daily: !!b.daily, time: !!b.time, min: b.min, max: b.max }])), steamAppId: /^\d+$/.test(appIdVar) ? appIdVar : '' } : {}) }));
  writeFileSync(stage + 'package.json', JSON.stringify({ name: id, productName: g.title, version: cfg.version, description: g.title, author: 'Playtoon', main: 'main.cjs', license: 'UNLICENSED' }, null, 2));
  if (stageOnly) { console.log(`${id} : ${stage} prêt (electron ${electronVersion})`); continue; }

  const builder = require('electron-builder');
  const targets = new Map();
  const P = builder.Platform;
  for (const p of plats.length ? plats : [process.platform === 'win32' ? 'win' : process.platform === 'darwin' ? 'mac' : 'linux']) {
    const plat = { win: P.WINDOWS, linux: P.LINUX, mac: P.MAC }[p];
    targets.set(plat, new Map([[p === 'mac' ? builder.Arch.universal : builder.Arch.x64, ['dir']]]));
  }
  await builder.build({
    projectDir: stage, targets,
    config: {
      appId: g.appId, productName: g.title, executableName: g.exe, electronVersion, copyright: '© 2026 Playtoon',
      directories: { output: `${HERE}dist/${id}`, buildResources: stage },
      files: ['main.cjs', 'preload.cjs', 'game.json', 'icon.png', 'www/**/*', 'package.json', ...(boards ? ['steam.cjs', 'steamworks/**/*'] : [])],
      asar: true, compression: 'normal',
      asarUnpack: boards ? ['steamworks/**/*'] : [],   // binaires natifs Steam : hors de l'archive asar
      win: { icon: 'icon.png', signAndEditExecutable: true },
      linux: { icon: 'icon.png', category: 'Game', executableName: g.exe.toLowerCase() },
      // macOS : signature ad hoc (Apple Silicon refuse un binaire non signé) ; notarisation facultative pour Steam
      // x64ArchFiles : binaires Steam déjà universels (ou propres à une architecture), identiques dans les deux moitiés
      mac: { icon: 'icon.png', category: 'public.app-category.games', identity: '-', hardenedRuntime: false, gatekeeperAssess: false, ...(boards ? { x64ArchFiles: '**/steamworks/**' } : {}) },
    },
  });
  // Linux : lanceur pour Steam (le bac à sable de Chromium n'est pas disponible dans le conteneur Steam Linux Runtime)
  const lin = `${HERE}dist/${id}/linux-unpacked/`;
  if (existsSync(lin)) { writeFileSync(lin + 'launch.sh', `#!/bin/sh\ncd "$(dirname "$0")"\nexec ./${g.exe.toLowerCase()} --no-sandbox "$@"\n`); chmodSync(lin + 'launch.sh', 0o755); }
  console.log(`${id} : dist/${id} prêt — version ${cfg.version}, Electron ${electronVersion}`);
}
