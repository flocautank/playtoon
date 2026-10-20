// Coquille de la version PC (Electron) : l'interface commune (réglages, plein écran, Quitter) + pause quand la
// fenêtre perd le focus (Synth Horde se met en pause, les autres arrêtent simplement de dessiner).
// Classements Steam (Block Quarry, Synth Horde ; opts.scores) : window.PT_SCORES — même contrat que les applis mobiles
// (apps/shared/scores.js) — sur le pont window.ptDesktop.scores du preload ; l'affichage est un panneau du jeu (top 10 et
// « autour de toi »), Steam n'ayant pas d'écran de classement à ouvrir. Steam absent : rien ne s'affiche.
import { initShellUI } from '../../shared/shell-ui.js';
import { t, num, applyI18n } from '../../../js/i18n.js';

const $ = id => document.getElementById(id);

export function initDesktop(opts) {
  document.body.classList.add('pt-desktop');
  const { G } = initShellUI(opts);
  let hidden = false;
  window.addEventListener('blur', () => { if (!hidden) { hidden = true; G.hide(); } });
  window.addEventListener('focus', () => { if (hidden) { hidden = false; G.show(); } });
  // Échap ferme d'abord une fenêtre de la coquille (classement, réglages, confirmation)
  window.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const open = ['pt-lb', 'pt-modal', 'bq-settings'].map(id => document.getElementById(id)).find(o => o && !o.classList.contains('hidden'));
    if (open) { e.stopImmediatePropagation(); (open.querySelector('#pt-lbclose, #pt-cancel, #bq-close')).click(); }
  }, true);
  if (opts.scores) initSteamScores(opts.scores);
}

function initSteamScores(boards) {
  const S = window.ptDesktop && window.ptDesktop.scores;
  if (!S) return;
  const keys = Object.keys(boards), P = boards[keys[0]].label.replace(/\.[^.]+$/, '');   // « bp.lb », « nb.lb »
  document.body.insertAdjacentHTML('beforeend', `
<div class="overlay hidden" id="pt-lb" style="position:fixed;z-index:250">
  <div class="card wide pt-lbcard">
    <h2 data-i18n="${P}.title"></h2>
    <div class="pt-lbtabs" id="pt-lbtabs"></div>
    <div class="pt-lbbody" id="pt-lbbody"></div>
    <button class="btn ghost" id="pt-lbclose" data-back data-i18n="close">Close</button>
  </div>
</div>`);
  applyI18n($('pt-lb'));
  let ok = false, cur = keys[0], seq = 0;
  const fmt = (b, v) => boards[b].time ? `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}` : num(v);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const rows = (b, list) => list.map(e => `<li class="${e.me ? 'me' : ''}"><b>${e.rank}</b><span>${esc(e.name)}</span><em>${fmt(b, e.score)}</em></li>`).join('');
  async function paint(b) {
    cur = b; const my = ++seq;
    $('pt-lbtabs').innerHTML = keys.map(k => `<button class="btn ${k === b ? '' : 'ghost'} small" data-lb="${k}">${esc(t(boards[k].label))}</button>`).join('');
    $('pt-lbtabs').querySelectorAll('[data-lb]').forEach(x => { x.onclick = () => paint(x.dataset.lb); });
    $('pt-lbbody').innerHTML = `<p class="muted">${esc(t(P + '.loading'))}</p>`;
    let r = null;
    try { r = await S.entries(b); } catch (e) { r = null; }
    if (my !== seq) return;
    const sub = boards[b].daily ? `<p class="muted small">${esc(t(P + '.today'))}</p>` : '';
    if (!r) { $('pt-lbbody').innerHTML = `<p class="muted">${esc(t(P + '.offline'))}</p>`; return; }
    if (!r.top.length) { $('pt-lbbody').innerHTML = sub + `<p class="muted">${esc(t(P + '.empty'))}</p>`; return; }
    const meTop = r.top.some(e => e.me);
    $('pt-lbbody').innerHTML = sub + `<h4>${esc(t(P + '.top'))}</h4><ol class="pt-lblist">${rows(b, r.top)}</ol>`
      + (!meTop && r.around.length ? `<h4>${esc(t(P + '.around'))}</h4><ol class="pt-lblist">${rows(b, r.around)}</ol>` : '');
  }
  $('pt-lbclose').onclick = () => $('pt-lb').classList.add('hidden');
  window.addEventListener('pt-lang', () => { if (!$('pt-lb').classList.contains('hidden')) paint(cur); });
  window.PT_SCORES = {
    available: () => ok,
    submit: (b, score, day) => Promise.resolve(S.submit(b, score, day)).catch(() => false),
    show: b => { if (!ok) return; $('pt-lb').classList.remove('hidden'); paint(boards[b] ? b : keys[0]); },
  };
  Promise.resolve(S.status()).then(r => { ok = !!(r && r.ok); }, () => { ok = false; })
    .then(() => window.dispatchEvent(new Event('pt-scores')));
}
