// Monétisation commune aux applications Playtoon (AdMob + consentement UMP + Google Play Billing).
// Chaque jeu choisit ce qui convient à son concept :
// - vidéos récompensées (toujours facultatives) : reward(kind) → true seulement si la vidéo a été regardée ;
// - pause publicitaire plein écran entre deux parties : pause() — plafonnée (jamais au début de la session,
//   un écart minimal, une pause sur N), désactivable (interstitial: null) et supprimée par l'achat « noAds » ;
// - achats uniques (produits « managed ») : owns(sku), buy(sku), restore() ; l'événement `pt-owned` prévient le jeu.
// Consentement RGPD : formulaire Google avant toute pub là où il est requis ; privacyOptions() le rouvre.
import { Capacitor } from '@capacitor/core';
import { AdMob, AdmobConsentStatus, RewardAdPluginEvents, InterstitialAdPluginEvents, MaxAdContentRating } from '@capacitor-community/admob';
import { NativePurchases, PURCHASE_TYPE } from '@capgo/native-purchases';
import { t } from '../../js/i18n.js';

const toast = m => window.ptToast && window.ptToast(m);
const once = (event, ms) => new Promise(res => {
  let h; const done = v => { clearTimeout(tm); h && h.remove(); res(v); };
  const tm = setTimeout(() => done(null), ms);
  AdMob.addListener(event, v => done(v === undefined ? true : v)).then(x => { h = x; });
});

// cfg : { prefix, testAds, rewardedId, interstitialId, products: [{ sku, name, desc }], noAdsSku?, interstitial?: { first, gap, every } }
export function createMon(cfg) {
  const st = { canAds: false, privacy: false, rewarded: false, inter: false, lastBreak: 0, breaks: 0, start: Date.now(), billing: false, prices: {} };
  const key = sku => `${cfg.prefix}.owned.${sku}`;
  const owned = {};
  for (const p of cfg.products) { try { owned[p.sku] = localStorage.getItem(key(p.sku)) === '1'; } catch (e) { owned[p.sku] = false; } }
  const setOwned = (sku, v) => {
    if (owned[sku] === v) return;
    owned[sku] = v; try { localStorage.setItem(key(sku), v ? '1' : '0'); } catch (e) {}
    window.dispatchEvent(new CustomEvent('pt-owned', { detail: { sku, owned: v } }));
  };
  const noAds = () => !!(cfg.noAdsSku && owned[cfg.noAdsSku]);

  async function loadRewarded() {
    st.rewarded = false;
    try { await AdMob.prepareRewardVideoAd({ adId: cfg.rewardedId, isTesting: cfg.testAds }); st.rewarded = true; } catch (e) { setTimeout(loadRewarded, 60000); }
  }
  async function loadInter() {
    st.inter = false;
    if (!cfg.interstitial || noAds()) return;
    try { await AdMob.prepareInterstitial({ adId: cfg.interstitialId, isTesting: cfg.testAds }); st.inter = true; } catch (e) { setTimeout(loadInter, 90000); }
  }
  async function initAds() {
    await AdMob.initialize({ initializeForTesting: cfg.testAds, maxAdContentRating: MaxAdContentRating.General, tagForChildDirectedTreatment: false });
    let info = await AdMob.requestConsentInfo();
    if (info.isConsentFormAvailable && info.status === AdmobConsentStatus.REQUIRED) info = await AdMob.showConsentForm();
    st.canAds = !!info.canRequestAds;
    st.privacy = info.privacyOptionsRequirementStatus === 'REQUIRED';
    if (st.canAds) { loadRewarded(); loadInter(); }
  }
  async function checkOwned(report) {
    try {
      const { purchases } = await NativePurchases.getPurchases({ productType: PURCHASE_TYPE.INAPP });
      let any = false;
      for (const p of cfg.products) {
        const has = purchases.some(x => x.productIdentifier === p.sku && (x.purchaseState === undefined || x.purchaseState === '1'));
        if (has) { setOwned(p.sku, true); any = true; }
      }
      if (report) toast(any ? t('app.restored') : t('app.nothing'));
    } catch (e) { if (report) toast(t('app.buyFail')); }
  }
  async function initShop() {
    const { isBillingSupported } = await NativePurchases.isBillingSupported();
    if (!isBillingSupported || !cfg.products.length) return;
    try {
      const { products } = await NativePurchases.getProducts({ productIdentifiers: cfg.products.map(p => p.sku), productType: PURCHASE_TYPE.INAPP });
      for (const p of products) st.prices[p.identifier || p.productIdentifier] = p.priceString || '';
      st.billing = products.length > 0;
    } catch (e) {}
    await checkOwned(false);
  }

  const mon = {
    native: Capacitor.isNativePlatform(),
    products: cfg.products,
    async init() {
      if (!this.native) return;
      window.PT_MON = this;
      try { await initAds(); } catch (e) { console.warn('ads', e); }
      try { await initShop(); } catch (e) { console.warn('shop', e); }
    },
    owns: sku => !!owned[sku],
    adsRemoved: noAds,
    shopReady: () => st.billing,
    price: sku => st.prices[sku] || '',
    privacyRequired: () => st.privacy,
    canReward: () => st.canAds && st.rewarded,
    async reward(kind) {
      if (!mon.canReward()) { toast(t('app.adFail')); return false; }
      // la récompense n'est donnée que si la vidéo a été regardée jusqu'au bout (événement Rewarded avant la fermeture)
      let got = false;
      const h = await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => { got = true; });
      const closed = once(RewardAdPluginEvents.Dismissed, 180000);
      try { await AdMob.showRewardVideoAd(); await closed; } catch (e) { toast(t('app.adFail')); }
      h.remove(); loadRewarded();
      return got;
    },
    async pause() {
      const I = cfg.interstitial, now = Date.now();
      if (!mon.native || !I || noAds() || !st.canAds) return;
      st.breaks++;
      if (!st.inter || now - st.start < I.first || now - st.lastBreak < I.gap || st.breaks % I.every !== 0) return;
      const closed = once(InterstitialAdPluginEvents.Dismissed, 60000);
      try { await AdMob.showInterstitial(); st.lastBreak = Date.now(); await closed; } catch (e) {}
      loadInter();
    },
    async buy(sku) {
      if (owned[sku] || !st.billing) return;
      try {
        await NativePurchases.purchaseProduct({ productIdentifier: sku, productType: PURCHASE_TYPE.INAPP, autoAcknowledgePurchases: true });
        setOwned(sku, true); toast(t('app.thanks'));
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
  return mon;
}
