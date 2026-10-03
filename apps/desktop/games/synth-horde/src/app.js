// généré par apps/desktop/build.mjs — ne pas modifier à la main
import '../../../../../js/bonk.js';
import { initDesktop } from '../../../src/shell.js';
import { CONFIG } from './config.js';
initDesktop({ game: 'bonk', gearHost: "#nb-menu .card", gearIcon: "⚙", version: CONFIG.version, music: true });
