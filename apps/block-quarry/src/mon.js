// Monétisation « équitable » de Block Quarry :
// - vidéos récompensées TOUJOURS facultatives (+3 coups, marteau offert, +20 pièces 5×/jour) ;
// - publicité plein écran seulement entre deux parties / niveaux, jamais pendant le jeu,
//   jamais dans les 5 premières minutes, au plus une toutes les 4 minutes et une pause sur trois ;
// - achat unique « Supprimer les pubs » (retire les pubs plein écran ; les vidéos bonus restent au choix) ;
// - consentement RGPD via le formulaire Google (UMP) avant toute pub, options modifiables dans les réglages.
import { Capacitor } from '@capacitor/core';
import { AdMob, AdmobConsentStatus, RewardAdPluginEvents, InterstitialAdPluginEvents, MaxAdContentRating } from '@capacitor-community/admob';
import { NativePurchases, PURCHASE_TYPE } from '@capgo/native-purchases';
import { t } from '../../../js/i18n.js';
import { CONFIG } from './config.js';

const NOADS_KEY = 'bq.noads';
const BREAK_GAP = 4 * 60 * 1000, FIRST_BREAK = 5 * 60 * 1000, EVERY_N = 3;
const toast = m => window.ptToast && window.ptToast(m);
const once = (event, ms) => new Promise(res => {
  let h; const done = v => { clearTimeout(tm); h && h.remove(); res(v); };
  const tm = setTimeout(() => done(null), ms);
  AdMob.addListener(event, v => done(v === undefined ? true : v)).then(x => { h = x; });
});

const st = { canAds: false, privacy: false, rewarded: false, inter: false, lastBreak: 0, breaks: 0, start: Date.now(), billing: false, price: '' };
let noAds = false;
try { noAds = localStorage.getItem(NOADS_KEY) === '1'; } catch (e) {}
const setNoAds = v => { noAds = v; try { localStorage.setItem(NOADS_KEY, v ? '1' : '0'); } catch (e) {} };

async function loadRewarded() {
  st.rewarded = false;
  try { await AdMob.prepareRewardVideoAd({ adId: CONFIG.rewardedId, isTesting: CONFIG.testAds }); st.rewarded = true; } catch (e) { setTimeout(loadRewarded, 60000); }
}
async function loadInter() {
  st.inter = false;
  if (noAds) return;
  try { await AdMob.prepareInterstitial({ adId: CONFIG.interstitialId, isTesting: CONFIG.testAds }); st.inter = true; } catch (e) { setTimeout(loadInter, 90000); }
}

async function initAds() {
  await AdMob.initialize({ initializeForTesting: CONFIG.testAds, maxAdContentRating: MaxAdContentRating.General, tagForChildDirectedTreatment: false });
  let info = await AdMob.requestConsentInfo();
  if (info.isConsentFormAvailable && info.status === AdmobConsentStatus.REQUIRED) info = await AdMob.showConsentForm();
  st.canAds = !!info.canRequestAds;
  st.privacy = info.privacyOptionsRequirementStatus === 'REQUIRED';
  if (st.canAds) { loadRewarded(); loadInter(); }
}
async function initShop() {
  const { isBillingSupported } = await NativePurchases.isBillingSupported();
  if (!isBillingSupported) return;
  try {
    const { products } = await NativePurchases.getProducts({ productIdentifiers: [CONFIG.removeAdsSku], productType: PURCHASE_TYPE.INAPP });
    if (products[0]) { st.price = products[0].priceString || ''; st.billing = true; }
  } catch (e) {}
  await checkOwned(false);
}
async function checkOwned(report) {
  try {
    const { purchases } = await NativePurchases.getPurchases({ productType: PURCHASE_TYPE.INAPP });
    const has = purchases.some(p => p.productIdentifier === CONFIG.removeAdsSku && (p.purchaseState === undefined || p.purchaseState === '1'));
    if (has) setNoAds(true);
    if (report) toast(has ? t('app.restored') : t('app.nothing'));
    return has;
  } catch (e) { if (report) toast(t('app.buyFail')); return false; }
}

export const Mon = {
  native: Capacitor.isNativePlatform(),
  async init() {
    if (!this.native) return;
    window.PT_MON = this;
    try { await initAds(); } catch (e) { console.warn('ads', e); }
    try { await initShop(); } catch (e) { console.warn('shop', e); }
  },
  adsRemoved: () => noAds,
  shopReady: () => st.billing,
  price: () => st.price,
  privacyRequired: () => st.privacy,
  canReward: () => st.canAds && st.rewarded,
  async reward(kind) {
    if (!this.canReward()) { toast(t('app.adFail')); return false; }
    // la récompense n'est donnée que si la vidéo a été regardée (événement Rewarded avant la fermeture)
    let got = false;
    const h = await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => { got = true; });
    const closed = once(RewardAdPluginEvents.Dismissed, 180000);
    try { await AdMob.showRewardVideoAd(); await closed; } catch (e) { toast(t('app.adFail')); }
    h.remove(); loadRewarded();
    return got;
  },
  // pause publicitaire entre deux parties : plafonnée, jamais au début, rien si « Supprimer les pubs »
  async pause() {
    const now = Date.now();
    if (!this.native || noAds || !st.canAds) return;
    st.breaks++;
    if (!st.inter || now - st.start < FIRST_BREAK || now - st.lastBreak < BREAK_GAP || st.breaks % EVERY_N !== 0) return;
    const closed = once(InterstitialAdPluginEvents.Dismissed, 60000);
    try { await AdMob.showInterstitial(); st.lastBreak = Date.now(); await closed; } catch (e) {}
    loadInter();
  },
  async buyRemoveAds() {
    if (noAds || !st.billing) return;
    try {
      await NativePurchases.purchaseProduct({ productIdentifier: CONFIG.removeAdsSku, productType: PURCHASE_TYPE.INAPP, autoAcknowledgePurchases: true });
      setNoAds(true); toast(t('app.thanks'));
    } catch (e) { toast(t('app.buyFail')); }
  },
  async restore() {
    try { await NativePurchases.restorePurchases(); } catch (e) {}
    await checkOwned(true);
  },
  async privacyOptions() {
    try { await AdMob.showPrivacyOptionsForm(); const info = await AdMob.requestConsentInfo(); st.canAds = !!info.canRequestAds; } catch (e) {}
  },
};
