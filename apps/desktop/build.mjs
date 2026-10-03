// Construit les versions PC (Steam) des jeux Playtoon avec Electron.
//   node build.mjs [jeu…] [--win] [--linux] [--mac] [--stage-only]
// Sans jeu : les trois. Sans plateforme : celle de la machine. --stage-only : prépare games/<jeu>/stage sans empaqueter
// (lancement direct : npx electron games/<jeu>/stage).
// Sortie : dist/<jeu>/<plateforme>-unpacked (dossier prêt pour un dépôt Steam ; Steam installe les fichiers tels quels).
import { build as esbuild } from 'esbuild';
import { cpSync, mkdirSync, rmSync, writeFileSync, copyFileSync, existsSync, chmodSync } from 'fs';
import { createRequire } from 'module';
import { buildApp } from '../shared/build-app.mjs';
import { GAMES } from './games.mjs';

const require = createRequire(import.meta.url);
const HERE = new URL('./', import.meta.url).pathname;
const args = process.argv.slice(2);
const ids = args.filter(a => !a.startsWith('--'));
const stageOnly = args.includes('--stage-only');
const plats = ['win', 'linux', 'mac'].filter(p => args.includes('--' + p));
const electronVersion = require('electron/package.json').version;

for (const id of ids.length ? ids : Object.keys(GAMES)) {
  const g = GAMES[id]; if (!g) throw new Error('jeu inconnu : ' + id);
  const dir = `${HERE}games/${id}/`, stage = dir + 'stage/';
  mkdirSync(dir + 'src', { recursive: true });
  // point d'entrée : le jeu + la coquille PC (aucune dépendance native, aucune publicité, aucun achat)
  writeFileSync(dir + 'src/app.js', `// généré par apps/desktop/build.mjs — ne pas modifier à la main
import '../../../../../js/${{ blocks: 'blocks', forge: 'clicker', bonk: 'bonk' }[g.game]}.js';
import { initDesktop } from '../../../src/shell.js';
import { CONFIG } from './config.js';
initDesktop({ game: '${g.game}', gearHost: ${JSON.stringify(g.gearHost)}, gearIcon: ${JSON.stringify(g.gearIcon)}, version: CONFIG.version, music: ${g.music} });
`);
  const cfg = await buildApp({ dir, section: g.section, versionKey: g.versionKey, title: g.title, ads: false, esbuild });
  // dossier d'application Electron : main + preload + jeu
  rmSync(stage, { recursive: true, force: true }); mkdirSync(stage, { recursive: true });
  cpSync(dir + 'www', stage + 'www', { recursive: true });
  copyFileSync(HERE + 'electron/main.cjs', stage + 'main.cjs');
  copyFileSync(HERE + 'electron/preload.cjs', stage + 'preload.cjs');
  copyFileSync(HERE + g.icon, stage + 'icon.png');
  writeFileSync(stage + 'game.json', JSON.stringify({ title: g.title, bg: g.bg, width: g.width, height: g.height }));
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
      files: ['main.cjs', 'preload.cjs', 'game.json', 'icon.png', 'www/**/*', 'package.json'],
      asar: true, compression: 'normal',
      win: { icon: 'icon.png', signAndEditExecutable: true },
      linux: { icon: 'icon.png', category: 'Game', executableName: g.exe.toLowerCase() },
      // macOS : signature ad hoc (Apple Silicon refuse un binaire non signé) ; notarisation facultative pour Steam
      mac: { icon: 'icon.png', category: 'public.app-category.games', identity: '-', hardenedRuntime: false, gatekeeperAssess: false },
    },
  });
  // Linux : lanceur pour Steam (le bac à sable de Chromium n'est pas disponible dans le conteneur Steam Linux Runtime)
  const lin = `${HERE}dist/${id}/linux-unpacked/`;
  if (existsSync(lin)) { writeFileSync(lin + 'launch.sh', `#!/bin/sh\ncd "$(dirname "$0")"\nexec ./${g.exe.toLowerCase()} --no-sandbox "$@"\n`); chmodSync(lin + 'launch.sh', 0o755); }
  console.log(`${id} : dist/${id} prêt — version ${cfg.version}, Electron ${electronVersion}`);
}
