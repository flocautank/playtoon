// Coquille commune des applications Playtoon : réglages (son, langue, achats, restauration, confidentialité),
// confirmations et notifications dans le style du site, bouton retour Android, pause / reprise, barre d'état.
import { applyI18n, langSelect, t } from '../../js/i18n.js';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

const $ = id => document.getElementById(id);
const POLICY = 'https://flocautank.github.io/playtoon/privacy.html';

const SETTINGS = `
<div class="overlay hidden" id="bq-settings" style="position:fixed;z-index:200">
  <div class="card">
    <h2 data-i18n="app.settings">Settings</h2>
    <label class="bq-row"><span data-i18n="app.sound">Sound effects</span> <input type="checkbox" id="bq-sfx"></label>
    <label class="bq-row hidden" id="bq-musrow"><span data-i18n="app.music">Music</span> <input type="checkbox" id="bq-mus"></label>
    <label class="bq-row"><span>🌐 <span data-i18n="language">Language</span></span> <select id="bq-lang"></select></label>
    <div class="bq-shop" id="bq-shop"><div id="bq-products"></div>
      <button class="btn ghost small" id="bq-restore" data-i18n="app.restore">Restore purchases</button></div>
    <button class="btn ghost small hidden" id="bq-privacy" data-i18n="app.privacy">Privacy options</button>
    <a class="small bq-link" href="${POLICY}" target="_blank" rel="noopener" data-i18n="app.policy">Privacy policy</a>
    <p class="muted small" id="bq-ver"></p>
    <button class="btn ghost" id="bq-close" data-i18n="close">Close</button>
  </div>
</div>
<div class="overlay hidden" id="pt-modal" style="position:fixed;z-index:300">
  <div class="card"><div id="pt-modal-txt" style="text-align:left;line-height:1.5"></div>
    <div class="row"><button class="btn ghost" id="pt-cancel">Cancel</button><button class="btn" id="pt-ok">Continue</button></div></div>
</div>
<div class="pt-toasts" id="pt-toasts"></div>`;

// opts : { game: clé de window.GAMES, gearHost: sélecteur CSS de l'élément qui reçoit le bouton (sinon bouton flottant),
//          gearIcon (⚙ par défaut),
//          mon: objet de createMon, version, music: true si le jeu a une musique, onBack?: () => bool }
export async function initShell(opts) {
  document.body.dataset.tab = opts.game;
  document.body.insertAdjacentHTML('beforeend', SETTINGS);
  try { window.PT_MUTE = localStorage.getItem('playtoon.mute') === '1'; window.PT_MUSIC = localStorage.getItem('playtoon.music') !== '0'; } catch (e) { window.PT_MUSIC = true; }
  window.ptToast = msg => { const z = $('pt-toasts'), d = document.createElement('div'); d.textContent = msg; z.appendChild(d); setTimeout(() => d.remove(), 3500); };
  window.ptConfirm = (html, ok) => new Promise(res => {
    const m = $('pt-modal');
    $('pt-modal-txt').innerHTML = html; $('pt-ok').textContent = ok || t('ok'); $('pt-cancel').textContent = t('cancel');
    const done = v => { m.classList.add('hidden'); res(v); };
    $('pt-ok').onclick = () => done(true); $('pt-cancel').onclick = () => done(false);
    m.classList.remove('hidden');
  });

  const { mon } = opts;
  const gear = document.createElement('button'); gear.id = 'bq-gear'; gear.textContent = opts.gearIcon || '⚙'; gear.setAttribute('aria-label', 'Settings');
  const host = opts.gearHost && document.querySelector(opts.gearHost);
  if (host) host.appendChild(gear); else { gear.classList.add('bq-gear-float'); document.body.appendChild(gear); }

  function openSettings() {
    $('bq-sfx').checked = !window.PT_MUTE;
    $('bq-musrow').classList.toggle('hidden', !opts.music); $('bq-mus').checked = window.PT_MUSIC !== false;
    const box = $('bq-products'); box.innerHTML = '';
    for (const p of mon.products) {
      const own = mon.owns(p.sku), b = document.createElement('button');
      b.className = 'btn'; b.disabled = own || !mon.shopReady();
      b.textContent = own ? t(p.owned) : t(p.name) + (mon.price(p.sku) ? ' · ' + mon.price(p.sku) : '');
      b.onclick = () => mon.buy(p.sku).then(openSettings);
      const d = document.createElement('p'); d.className = 'muted small'; d.textContent = t(p.desc);
      box.append(b, d);
    }
    $('bq-shop').classList.toggle('hidden', !mon.native || !mon.products.length);
    $('bq-privacy').classList.toggle('hidden', !mon.privacyRequired());
    $('bq-ver').textContent = t('app.version', { v: opts.version });
    $('bq-settings').classList.remove('hidden');
    window.GAMES[opts.game].onSettings && window.GAMES[opts.game].onSettings(true);
  }
  gear.onclick = openSettings;
  $('bq-close').onclick = () => { $('bq-settings').classList.add('hidden'); window.GAMES[opts.game].onSettings && window.GAMES[opts.game].onSettings(false); };
  $('bq-sfx').onchange = e => { window.PT_MUTE = !e.target.checked; try { localStorage.setItem('playtoon.mute', window.PT_MUTE ? '1' : '0'); } catch (err) {} window.dispatchEvent(new Event('pt-mute')); };
  // musique : réglage commun, aussi appelé par le jeu (case « Musique » de sa pause)
  window.ptSetMusic = on => { window.PT_MUSIC = on; try { localStorage.setItem('playtoon.music', on ? '1' : '0'); } catch (err) {} $('bq-mus').checked = on; window.dispatchEvent(new Event('pt-music')); };
  $('bq-mus').onchange = e => window.ptSetMusic(e.target.checked);
  langSelect($('bq-lang'));
  $('bq-restore').onclick = () => mon.restore().then(openSettings);
  $('bq-privacy').onclick = () => mon.privacyOptions();
  window.addEventListener('pt-lang', () => { if (!$('bq-settings').classList.contains('hidden')) openSettings(); });
  window.ptOpenSettings = openSettings;

  applyI18n();
  const G = window.GAMES[opts.game];
  G.show();

  // bouton retour Android : le jeu d'abord (pause, fermer un menu), puis la fenêtre ouverte, sinon arrière-plan
  App.addListener('backButton', () => {
    if (opts.onBack && opts.onBack()) return;
    const open = [...document.querySelectorAll('.overlay:not(.hidden)')].pop();
    if (open) { const c = open.querySelector('#pt-cancel, #bq-close, [data-back]'); if (c) { c.click(); return; } }
    App.minimizeApp();
  });
  App.addListener('pause', () => G.hide());
  App.addListener('resume', () => G.show());

  try { await StatusBar.setStyle({ style: Style.Dark }); await StatusBar.setBackgroundColor({ color: opts.statusColor || '#120f2a' }); } catch (e) {}
  try { await SplashScreen.hide(); } catch (e) {}
  await mon.init();
}
