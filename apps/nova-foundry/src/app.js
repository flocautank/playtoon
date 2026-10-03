// Nova Foundry — application Android : le clicker du site + la coquille et la monétisation communes (apps/shared).
// Monétisation adaptée à un jeu idle : AUCUNE pub plein écran (on revient souvent, pour peu de temps) ;
// vidéos facultatives « production ×2 pendant 4 h » (cumulables jusqu'à 8 h) et « doubler les gains hors-ligne » ;
// achat unique « Moteur éternel » : le ×2 permanent, sans vidéos.
import '../../../js/clicker.js';
import { createMon } from '../../shared/mon.js';
import { initShell } from '../../shared/shell.js';
import { CONFIG } from './config.js';

const mon = createMon({
  prefix: 'nf', testAds: CONFIG.testAds, rewardedId: CONFIG.rewardedId, interstitialId: CONFIG.interstitialId,
  iosTestAds: CONFIG.iosTestAds, iosRewardedId: CONFIG.iosRewardedId, iosInterstitialId: CONFIG.iosInterstitialId,
  products: [{ sku: 'eternal_boost', name: 'sfapp.eternal', desc: 'sfapp.eternalDesc', owned: 'sfapp.eternalOwned' }],
  interstitial: null,
});
initShell({ game: 'forge', gearHost: '.sf-tabs', gearIcon: '☰', mon, version: CONFIG.version, statusColor: '#0b0a1f' });
