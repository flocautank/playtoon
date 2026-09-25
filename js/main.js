// Onglets : un seul jeu actif à la fois, les autres sont mis en pause.
const G = window.GAMES || {};
const tabs = ['blocks', 'forge', 'bonk'];
let current = null;

function show(id) {
  if (!tabs.includes(id)) id = 'blocks';
  if (id === current) return;
  if (current && G[current]) G[current].hide();
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.id === 'tab-' + id));
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('on', a.dataset.tab === id));
  current = id;
  if (G[id]) G[id].show();
  try { localStorage.setItem('arcade.tab', id); } catch (e) {}
}

// Confirmation dans le style du site (remplace window.confirm) : renvoie une promesse de booléen.
window.ptConfirm = (html, ok = 'Continuer') => new Promise(res => {
  const m = document.getElementById('pt-modal');
  document.getElementById('pt-modal-txt').innerHTML = html;
  document.getElementById('pt-ok').textContent = ok;
  const done = v => { m.classList.add('hidden'); res(v); };
  document.getElementById('pt-ok').onclick = () => done(true);
  document.getElementById('pt-cancel').onclick = () => done(false);
  m.classList.remove('hidden');
});

// Son global : un seul interrupteur pour les trois jeux (lu par chaque fonction de son).
const muteBtn = document.getElementById('mute');
try { window.PT_MUTE = localStorage.getItem('playtoon.mute') === '1'; } catch (e) {}
const paintMute = () => { muteBtn.textContent = window.PT_MUTE ? '🔇' : '🔊'; };
muteBtn.onclick = () => { window.PT_MUTE = !window.PT_MUTE; paintMute(); try { localStorage.setItem('playtoon.mute', window.PT_MUTE ? '1' : '0'); } catch (e) {} muteBtn.blur(); };
paintMute();

window.addEventListener('hashchange', () => show(location.hash.slice(1)));
let start = location.hash.slice(1);
if (!tabs.includes(start)) { try { start = localStorage.getItem('arcade.tab') || 'blocks'; } catch (e) { start = 'blocks'; } }
show(start);

// PWA : installable sur l'écran d'accueil et jouable hors-ligne (voir sw.js).
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

// ---------- Profil : statistiques des trois jeux (lues dans leurs sauvegardes) et temps joué
let PLAY = { blocks: 0, forge: 0, bonk: 0 };
try { PLAY = Object.assign(PLAY, JSON.parse(localStorage.getItem('playtoon.time') || '{}')); } catch (e) {}
setInterval(() => {
  if (document.hidden || !current) return;
  PLAY[current] = (PLAY[current] || 0) + 5;
  try { localStorage.setItem('playtoon.time', JSON.stringify(PLAY)); } catch (e) {}
}, 5000);
const readJ = k => { try { return JSON.parse(localStorage.getItem(k) || 'null') || {}; } catch (e) { return {}; } };
const dur = s => s < 3600 ? `${Math.round(s / 60)} min` : `${Math.floor(s / 3600)} h ${String(Math.round(s % 3600 / 60)).padStart(2, '0')}`;
const big = n => !n ? '0' : n < 1e6 ? Math.floor(n).toLocaleString('fr-FR') : n.toExponential(2).replace('e+', 'e');
function renderProfile() {
  const adv = readJ('blocparty.adv'), daily = readJ('blocparty.daily'), th = readJ('blocparty.themes');
  const stars = Object.values(adv.stars || {}).reduce((a, b) => a + b, 0), lv = Object.keys(adv.stars || {}).length;
  const sf = readJ('starforge.save.v1'), nb = readJ('neonbonk.meta.v1');
  const row = (a, b) => `<div><span>${a}</span><b>${b}</b></div>`;
  const card = (c, name, t, rows) => `<div class="pt-g" style="--c:${c}"><h3>${name}<small>⏱ ${dur(t)}</small></h3>${rows.join('')}</div>`;
  document.getElementById('pt-prof').innerHTML =
    card('#ff5d8f', 'Bloc Party', PLAY.blocks, [row('Record classique', big(+localStorage.getItem('blocparty.best') || 0)), row('Aventure', `${lv}/40 · ${stars} ★`), row('Défi du jour', daily.best ? `${big(daily.best)} · série ${daily.streak || 1}` : '—'), row('Pièces', big(+(localStorage.getItem('blocparty.coins') ?? 40))), row('Thèmes', `${(th.owned || ['classic']).length}/5`)]) +
    card('#ffc94d', 'Star Forge', PLAY.forge, [row('Poussière produite', big(sf.lifeTotal)), row('Supernovae', sf.prestiges || 0), row('Novae gagnées', sf.novaTotal || 0), row('Big Bangs · Singularités', `${sf.bigbangs || 0} · ${sf.sing || 0}`), row('Succès · défis', `${Object.keys(sf.ach || {}).length} · ${Object.keys(sf.chalDone || {}).length}/6`)]) +
    card('#4dd4ff', 'Neon Bonk', PLAY.bonk, [row('Runs · victoires', `${nb.runs || 0} · ${nb.wins || 0}`), row('Record de survie', nb.bestTime ? `${Math.floor(nb.bestTime / 60)}:${String(nb.bestTime % 60).padStart(2, '0')}` : '—'), row('Niveau max', nb.maxLevel || 0), row('Éliminations', big(nb.totalKills)), row('Boss vaincus', nb.bossKills || 0)]);
}
const KEYS = () => Object.keys(localStorage).filter(k => /^(blocparty|starforge|neonbonk|playtoon)\./.test(k));
document.getElementById('profile').onclick = () => { renderProfile(); document.getElementById('pt-profile').classList.remove('hidden'); };
document.getElementById('pt-close').onclick = () => document.getElementById('pt-profile').classList.add('hidden');
document.getElementById('pt-exp').onclick = () => {
  const o = {}; for (const k of KEYS()) o[k] = localStorage.getItem(k);
  document.getElementById('pt-io').value = btoa(unescape(encodeURIComponent(JSON.stringify(o))));
};
document.getElementById('pt-imp').onclick = async () => {
  try {
    const o = JSON.parse(decodeURIComponent(escape(atob(document.getElementById('pt-io').value.trim()))));
    if (!await window.ptConfirm('Remplacer la progression actuelle des <b>trois jeux</b> par cette sauvegarde ?', 'Remplacer')) return;
    window.PT_NOSAVE = true;   // empêche les jeux de réécrire leur état en mémoire par-dessus l'import au rechargement
    for (const [k, v] of Object.entries(o)) if (/^(blocparty|starforge|neonbonk|playtoon)\./.test(k)) localStorage.setItem(k, v);
    location.reload();
  } catch (e) { alert('Sauvegarde invalide.'); }
};
