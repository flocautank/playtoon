// Block Quarry — application Android : le jeu du site + la coquille et la monétisation communes (apps/shared).
// Monétisation : vidéos facultatives (+3 coups, marteau, pièces), pub plein écran plafonnée entre deux parties,
// achat unique « Supprimer les pubs ».
import '../../../js/blocks.js';
import { createMon } from '../../shared/mon.js';
import { initShell } from '../../shared/shell.js';
import { CONFIG } from './config.js';

const mon = createMon({
  prefix: 'bq', testAds: CONFIG.testAds, rewardedId: CONFIG.rewardedId, interstitialId: CONFIG.interstitialId,
  iosTestAds: CONFIG.iosTestAds, iosRewardedId: CONFIG.iosRewardedId, iosInterstitialId: CONFIG.iosInterstitialId,
  products: [{ sku: 'remove_ads', name: 'app.removeAds', desc: 'app.removeAdsDesc', owned: 'app.adsRemoved' }],
  noAdsSku: 'remove_ads',
  interstitial: { first: 5 * 60e3, gap: 4 * 60e3, every: 3 },   // jamais les 5 premières minutes, au plus toutes les 4 min, une pause sur trois
});
initShell({ game: 'blocks', gearHost: '#bp-boost', mon, version: CONFIG.version });
