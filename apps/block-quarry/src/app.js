// Block Quarry — coquille de l'application Android : réglages, confirmations, bouton retour, monétisation.
import { applyI18n, langSelect, t } from '../../../js/i18n.js';
import '../../../js/blocks.js';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Mon } from './mon.js';
import { CONFIG } from './config.js';

const $ = id => document.getElementById(id);
try { window.PT_MUTE = localStorage.getItem('playtoon.mute') === '1'; } catch (e) {}

window.ptToast = msg => { const z = $('pt-toasts'), d = document.createElement('div'); d.textContent = msg; z.appendChild(d); setTimeout(() => d.remove(), 3500); };
window.ptConfirm = (html, ok) => new Promise(res => {
  const m = $('pt-modal');
  $('pt-modal-txt').innerHTML = html; $('pt-ok').textContent = ok || t('ok'); $('pt-cancel').textContent = t('cancel');
  const done = v => { m.classList.add('hidden'); res(v); };
  $('pt-ok').onclick = () => done(true); $('pt-cancel').onclick = () => done(false);
  m.classList.remove('hidden');
});

// réglages : bouton ⚙ à droite de la barre des boosters
const gear = document.createElement('button'); gear.id = 'bq-gear'; gear.textContent = '⚙'; gear.setAttribute('aria-label', 'Settings');
$('bp-boost').appendChild(gear);
function openSettings() {
  $('bq-sfx').checked = !window.PT_MUTE;
  const owned = Mon.adsRemoved();
  $('bq-buy').textContent = owned ? t('app.adsRemoved') : t('app.removeAds') + (Mon.price() ? ' · ' + Mon.price() : '');
  $('bq-buy').disabled = owned || !Mon.shopReady();
  $('bq-shop').classList.toggle('hidden', !Mon.native);
  $('bq-privacy').classList.toggle('hidden', !Mon.privacyRequired());
  $('bq-ver').textContent = t('app.version', { v: CONFIG.version });
  $('bq-settings').classList.remove('hidden');
}
gear.onclick = openSettings;
$('bq-close').onclick = () => $('bq-settings').classList.add('hidden');
$('bq-sfx').onchange = e => { window.PT_MUTE = !e.target.checked; try { localStorage.setItem('playtoon.mute', window.PT_MUTE ? '1' : '0'); } catch (err) {} };
langSelect($('bq-lang'));
$('bq-buy').onclick = () => Mon.buyRemoveAds().then(openSettings);
$('bq-restore').onclick = () => Mon.restore().then(openSettings);
$('bq-privacy').onclick = () => Mon.privacyOptions();

applyI18n();
window.addEventListener('pt-lang', () => { if (!$('bq-settings').classList.contains('hidden')) openSettings(); });
window.GAMES.blocks.show();

// bouton retour Android : ferme la fenêtre ouverte, sinon met l'application en arrière-plan
App.addListener('backButton', () => {
  const open = [...document.querySelectorAll('.overlay:not(.hidden)')].pop();
  if (open) { const c = open.querySelector('#pt-cancel, #bq-close, #bp-mapclose, #bp-themeclose'); if (c) c.click(); else if (open.id !== 'bp-over' && open.id !== 'bp-res') open.classList.add('hidden'); return; }
  App.minimizeApp();
});
App.addListener('pause', () => window.GAMES.blocks.hide());
App.addListener('resume', () => window.GAMES.blocks.show());

(async () => {
  try { await StatusBar.setStyle({ style: Style.Dark }); await StatusBar.setBackgroundColor({ color: '#120f2a' }); } catch (e) {}
  try { await SplashScreen.hide(); } catch (e) {}
  await Mon.init();
})();
