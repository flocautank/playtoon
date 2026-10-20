// Synth Horde — application Android : le survivor 3D du site + la coquille commune (apps/shared).
// Modèle économique : application PAYANTE (prix fixé dans Google Play / App Store). Donc aucune publicité,
// aucun achat intégré, aucun SDK publicitaire : le jeu complet dès l'installation (window.PT_MON n'existe pas,
// les offres « seconde chance » et « crédits doublés » ne s'affichent donc jamais, comme sur le site).
// Classements Google Play Jeux / Game Center (apps/shared/scores.js) : défi du jour et meilleure survie.
import '../../../js/bonk.js';
import { initShell } from '../../shared/shell.js';
import { initScores } from '../../shared/scores.js';
import { SH_LEADERBOARDS } from '../../shared/leaderboards.mjs';
import { CONFIG } from './config.js';

// retour Android en pleine run : pause (le jeu gère ensuite ses menus comme des fenêtres)
const onBack = () => { const G = window.GAMES.bonk; return !!(G.onBack && G.onBack()); };
initShell({ game: 'bonk', gearHost: '#nb-menu .card', version: CONFIG.version, music: true, onBack, statusColor: '#07030f' });
initScores(SH_LEADERBOARDS, CONFIG.scores && CONFIG.scores.play);
