// Traductions : anglais par défaut, langue de l'appareil détectée, choix mémorisé (playtoon.lang).
// Une valeur est soit un texte avec des {variables}, soit une fonction (pluriels, accords).
// Dans le HTML : data-i18n="clé" (texte), data-i18n-html="clé" (HTML), data-i18n-title="clé" (infobulle).

export const LANGS = [['en', 'English'], ['fr', 'Français'], ['es', 'Español'], ['de', 'Deutsch'], ['it', 'Italiano'], ['pt', 'Português']];
const KEY = 'playtoon.lang';

const DICT = {
  en: {
    'ok': 'Continue', 'cancel': 'Cancel', 'language': 'Language',
    // application mobile
    'app.music': 'Music', 'app.settings': 'Settings', 'app.sound': 'Sound effects', 'app.removeAds': 'Remove ads', 'app.removeAdsDesc': 'One-time purchase. No more ads between levels; bonus videos stay optional.',
    'app.adsRemoved': '✓ Ads removed — thank you!', 'app.restore': 'Restore purchases', 'app.privacy': 'Privacy options', 'app.policy': 'Privacy policy',
    'app.watchMoves': '▶ Watch a video: +3 moves', 'app.watchCont': '▶ Watch a video: clear space & continue', 'app.watchCoins': '▶ Video: +{n} 🪙', 'app.videoLeft': '{n} left today',
    'app.adFail': 'No video available right now — try again later.', 'app.thanks': 'Thanks for your support!', 'app.buyFail': 'Purchase not completed.', 'app.restored': 'Purchases restored.', 'app.nothing': 'No purchase to restore.',
    'app.coinsGot': '+{n} coins', 'app.version': 'Version {v}',
  },
  fr: {
    'ok': 'Continuer', 'cancel': 'Annuler', 'language': 'Langue',
    'app.music': 'Musique', 'app.settings': 'Réglages', 'app.sound': 'Effets sonores', 'app.removeAds': 'Supprimer les pubs', 'app.removeAdsDesc': 'Achat unique. Plus de pubs entre les niveaux ; les vidéos bonus restent facultatives.',
    'app.adsRemoved': '✓ Pubs supprimées — merci !', 'app.restore': 'Restaurer les achats', 'app.privacy': 'Options de confidentialité', 'app.policy': 'Politique de confidentialité',
    'app.watchMoves': '▶ Regarder une vidéo : +3 coups', 'app.watchCont': '▶ Regarder une vidéo : dégager et continuer', 'app.watchCoins': '▶ Vidéo : +{n} 🪙', 'app.videoLeft': 'encore {n} aujourd’hui',
    'app.adFail': 'Aucune vidéo disponible pour l’instant — réessaie plus tard.', 'app.thanks': 'Merci pour ton soutien !', 'app.buyFail': 'Achat non finalisé.', 'app.restored': 'Achats restaurés.', 'app.nothing': 'Aucun achat à restaurer.',
    'app.coinsGot': '+{n} pièces', 'app.version': 'Version {v}',
  },
  es: {
    'ok': 'Continuar', 'cancel': 'Cancelar', 'language': 'Idioma',
    'app.music': 'Música', 'app.settings': 'Ajustes', 'app.sound': 'Efectos de sonido', 'app.removeAds': 'Quitar anuncios', 'app.removeAdsDesc': 'Compra única. Sin anuncios entre niveles; los vídeos de bonificación siguen siendo opcionales.',
    'app.adsRemoved': '✓ Anuncios eliminados — ¡gracias!', 'app.restore': 'Restaurar compras', 'app.privacy': 'Opciones de privacidad', 'app.policy': 'Política de privacidad',
    'app.watchMoves': '▶ Ver un vídeo: +3 movimientos', 'app.watchCont': '▶ Ver un vídeo: liberar espacio y seguir', 'app.watchCoins': '▶ Vídeo: +{n} 🪙', 'app.videoLeft': 'quedan {n} hoy',
    'app.adFail': 'No hay vídeos disponibles ahora — inténtalo más tarde.', 'app.thanks': '¡Gracias por tu apoyo!', 'app.buyFail': 'Compra no completada.', 'app.restored': 'Compras restauradas.', 'app.nothing': 'No hay compras que restaurar.',
    'app.coinsGot': '+{n} monedas', 'app.version': 'Versión {v}',
  },
  de: {
    'ok': 'Weiter', 'cancel': 'Abbrechen', 'language': 'Sprache',
    'app.music': 'Musik', 'app.settings': 'Einstellungen', 'app.sound': 'Soundeffekte', 'app.removeAds': 'Werbung entfernen', 'app.removeAdsDesc': 'Einmaliger Kauf. Keine Werbung mehr zwischen den Levels; Bonus-Videos bleiben freiwillig.',
    'app.adsRemoved': '✓ Werbung entfernt — danke!', 'app.restore': 'Käufe wiederherstellen', 'app.privacy': 'Datenschutzoptionen', 'app.policy': 'Datenschutzerklärung',
    'app.watchMoves': '▶ Video ansehen: +3 Züge', 'app.watchCont': '▶ Video ansehen: Platz schaffen & weiter', 'app.watchCoins': '▶ Video: +{n} 🪙', 'app.videoLeft': 'heute noch {n}',
    'app.adFail': 'Gerade kein Video verfügbar — versuche es später.', 'app.thanks': 'Danke für deine Unterstützung!', 'app.buyFail': 'Kauf nicht abgeschlossen.', 'app.restored': 'Käufe wiederhergestellt.', 'app.nothing': 'Keine Käufe zum Wiederherstellen.',
    'app.coinsGot': '+{n} Münzen', 'app.version': 'Version {v}',
  },
  it: {
    'ok': 'Continua', 'cancel': 'Annulla', 'language': 'Lingua',
    'app.music': 'Musica', 'app.settings': 'Impostazioni', 'app.sound': 'Effetti sonori', 'app.removeAds': 'Rimuovi pubblicità', 'app.removeAdsDesc': 'Acquisto una tantum. Niente più pubblicità tra i livelli; i video bonus restano facoltativi.',
    'app.adsRemoved': '✓ Pubblicità rimossa — grazie!', 'app.restore': 'Ripristina acquisti', 'app.privacy': 'Opzioni privacy', 'app.policy': 'Informativa sulla privacy',
    'app.watchMoves': '▶ Guarda un video: +3 mosse', 'app.watchCont': '▶ Guarda un video: libera spazio e continua', 'app.watchCoins': '▶ Video: +{n} 🪙', 'app.videoLeft': 'ancora {n} oggi',
    'app.adFail': 'Nessun video disponibile ora — riprova più tardi.', 'app.thanks': 'Grazie per il tuo supporto!', 'app.buyFail': 'Acquisto non completato.', 'app.restored': 'Acquisti ripristinati.', 'app.nothing': 'Nessun acquisto da ripristinare.',
    'app.coinsGot': '+{n} monete', 'app.version': 'Versione {v}',
  },
  pt: {
    'ok': 'Continuar', 'cancel': 'Cancelar', 'language': 'Idioma',
    'app.music': 'Música', 'app.settings': 'Configurações', 'app.sound': 'Efeitos sonoros', 'app.removeAds': 'Remover anúncios', 'app.removeAdsDesc': 'Compra única. Sem anúncios entre os níveis; os vídeos bônus continuam opcionais.',
    'app.adsRemoved': '✓ Anúncios removidos — obrigado!', 'app.restore': 'Restaurar compras', 'app.privacy': 'Opções de privacidade', 'app.policy': 'Política de privacidade',
    'app.watchMoves': '▶ Ver um vídeo: +3 jogadas', 'app.watchCont': '▶ Ver um vídeo: liberar espaço e continuar', 'app.watchCoins': '▶ Vídeo: +{n} 🪙', 'app.videoLeft': 'restam {n} hoje',
    'app.adFail': 'Nenhum vídeo disponível agora — tente mais tarde.', 'app.thanks': 'Obrigado pelo seu apoio!', 'app.buyFail': 'Compra não concluída.', 'app.restored': 'Compras restauradas.', 'app.nothing': 'Nenhuma compra para restaurar.',
    'app.coinsGot': '+{n} moedas', 'app.version': 'Versão {v}',
  },
};

// chaque jeu apporte son propre dictionnaire (js/lang/<jeu>.js) : { en: {...}, fr: {...}, ... }
export function addStrings(d) { for (const l of Object.keys(d)) DICT[l] = Object.assign(DICT[l] || {}, d[l]); }

function detect() {
  try { const l = localStorage.getItem(KEY); if (l && DICT[l]) return l; } catch (e) {}
  for (const l of navigator.languages || [navigator.language || 'en']) { const b = String(l).slice(0, 2).toLowerCase(); if (DICT[b]) return b; }
  return 'en';
}
export let lang = detect();
document.documentElement.lang = lang;

export function t(key, vars = {}) {
  let v = DICT[lang][key]; if (v === undefined) v = DICT.en[key];
  if (v === undefined) return key;
  if (typeof v === 'function') return v(vars);
  if (typeof v !== 'string') return v;
  return v.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : ''));
}
// nombres et dates dans la langue choisie
export const num = n => Math.round(n).toLocaleString(lang);
export const date = (d, o) => d.toLocaleDateString(lang, o);

export function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  root.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  root.querySelectorAll('[data-i18n-title]').forEach(e => { e.title = t(e.dataset.i18nTitle); });
}
export function setLang(l) {
  if (!DICT[l] || l === lang) return;
  lang = l; document.documentElement.lang = l;
  try { localStorage.setItem(KEY, l); } catch (e) {}
  applyI18n();
  window.dispatchEvent(new CustomEvent('pt-lang', { detail: l }));
}
// un <select> de langue prêt à l'emploi
export function langSelect(sel) {
  sel.innerHTML = LANGS.map(([c, n]) => `<option value="${c}">${n}</option>`).join('');
  sel.value = lang; sel.onchange = () => setLang(sel.value);
  window.addEventListener('pt-lang', () => { sel.value = lang; });
}
window.PT_I18N = { t, setLang, get lang() { return lang; } };
