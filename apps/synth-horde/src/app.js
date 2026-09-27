// Synth Horde — application Android : le survivor 3D du site + la coquille et la monétisation communes (apps/shared).
// Monétisation adaptée à un jeu à runs : vidéos facultatives « seconde chance » (une par run, à la mort)
// et « crédits doublés » (écran de fin) ; publicité plein écran seulement entre deux runs, jamais dans les
// 5 premières minutes, au plus une toutes les 4 minutes et une pause sur deux ; achat unique « Supprimer les pubs ».
import '../../../js/bonk.js';
import { createMon } from '../../shared/mon.js';
import { initShell } from '../../shared/shell.js';
import { CONFIG } from './config.js';

const mon = createMon({
  prefix: 'sh', testAds: CONFIG.testAds, rewardedId: CONFIG.rewardedId, interstitialId: CONFIG.interstitialId,
  products: [{ sku: 'remove_ads', name: 'app.removeAds', desc: 'app.removeAdsDesc', owned: 'app.adsRemoved' }],
  noAdsSku: 'remove_ads',
  interstitial: { first: 5 * 60e3, gap: 4 * 60e3, every: 2 },
});
// retour Android en pleine run : pause (le jeu gère ensuite ses menus comme des fenêtres)
const onBack = () => { const G = window.GAMES.bonk; return !!(G.onBack && G.onBack()); };
initShell({ game: 'bonk', gearHost: '#nb-menu .card', mon, version: CONFIG.version, music: true, onBack, statusColor: '#07030f' });
