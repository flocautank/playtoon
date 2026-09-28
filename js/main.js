import { VERSIONS } from './version.js';
import { t, addStrings, applyI18n, lang } from './i18n.js';
import { SHELL } from './lang/shell.js';
addStrings(SHELL); applyI18n();
const VKEY = { 'Block Quarry': 'blocks', 'Nova Foundry': 'forge', 'Synth Horde': 'bonk' };
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
  current = id; document.body.dataset.tab = id;
  if (G[id]) G[id].show();
  try { localStorage.setItem('arcade.tab', id); } catch (e) {}
}

// Confirmation dans le style du site (remplace window.confirm) : renvoie une promesse de booléen.
window.ptConfirm = (html, ok) => new Promise(res => {
  if (!ok) ok = t('ok');
  document.getElementById('pt-cancel').textContent = t('cancel');
  const m = document.getElementById('pt-modal');
  document.getElementById('pt-modal-txt').innerHTML = html;
  document.getElementById('pt-ok').textContent = ok;
  const done = v => { m.classList.add('hidden'); res(v); };
  document.getElementById('pt-ok').onclick = () => done(true);
  document.getElementById('pt-cancel').onclick = () => done(false);
  m.classList.remove('hidden');
});

// Son : un menu, deux réglages communs aux trois jeux (effets et musique), lus par chaque jeu.
const muteBtn = document.getElementById('mute'), soundBox = document.getElementById('pt-sound');
try { window.PT_MUTE = localStorage.getItem('playtoon.mute') === '1'; window.PT_MUSIC = localStorage.getItem('playtoon.music') !== '0'; } catch (e) { window.PT_MUSIC = true; }
const paintMute = () => {
  muteBtn.textContent = window.PT_MUTE && !window.PT_MUSIC ? '🔇' : window.PT_MUTE || !window.PT_MUSIC ? '🔉' : '🔊';
  document.getElementById('pt-sfx').checked = !window.PT_MUTE; document.getElementById('pt-mus').checked = window.PT_MUSIC;
  const nm = document.getElementById('nb-music'); if (nm) nm.checked = window.PT_MUSIC;
};
window.ptSetMusic = on => { window.PT_MUSIC = on; try { localStorage.setItem('playtoon.music', on ? '1' : '0'); } catch (e) {} paintMute(); window.dispatchEvent(new Event('pt-music')); };
muteBtn.onclick = e => { e.stopPropagation(); soundBox.classList.toggle('hidden'); muteBtn.blur(); };
document.getElementById('pt-sfx').onchange = e => { window.PT_MUTE = !e.target.checked; try { localStorage.setItem('playtoon.mute', window.PT_MUTE ? '1' : '0'); } catch (x) {} paintMute(); };
document.getElementById('pt-mus').onchange = e => window.ptSetMusic(e.target.checked);
document.addEventListener('pointerdown', e => { if (!soundBox.contains(e.target) && e.target !== muteBtn) soundBox.classList.add('hidden'); });
paintMute();

// Petites notifications communes (objectifs du jour…)
// en pleine run de Synth Horde, les notifications attendent (elles couvraient le chrono et les alertes du boss)
const toastNow = t => { const z = document.getElementById('pt-toasts'), d = document.createElement('div'); d.textContent = t; z.appendChild(d); setTimeout(() => d.remove(), 4000); };
const inRun = () => current === 'bonk' && window.__nb && window.__nb.S && window.__nb.S.state === 'play';
const held = [];
window.ptToast = t => { if (inRun()) held.push(t); else toastNow(t); };
setInterval(() => { if (held.length && !inRun()) held.splice(0).forEach(toastNow); }, 1000);

// ---------- Objectifs du jour : un par jeu, tirés de la date, récompense dans le jeu concerné
const GOALS = {
  blocks: [['bp_lines', 20], ['bp_lines', 35], ['bp_pieces', 60]],
  forge: [['sf_forges', 25], ['sf_comets', 2], ['sf_clicks', 300]],
  bonk: [['nb_kills', 300], ['nb_chests', 2], ['nb_time', 300]],
};
const goalTxt = (id, target) => t('pt.goal.' + id, { n: id === 'nb_time' ? target / 60 : target });
const COLOR = { blocks: '#ff5d8f', forge: '#ffc94d', bonk: '#4dd4ff' };
const reward = game => t('pt.rw.' + game);
const NAMES = { blocks: 'Block Quarry', forge: 'Nova Foundry', bonk: 'Synth Horde' };
const today = () => { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
function todayGoals() {
  let seed = today();
  const r = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const g = {}; for (const k of Object.keys(GOALS)) g[k] = GOALS[k][Math.floor(r() * GOALS[k].length)];
  return g;
}
let DG = { day: 0, prog: {}, done: {} };
try { DG = Object.assign(DG, JSON.parse(localStorage.getItem('playtoon.goals') || '{}')); } catch (e) {}
function dgCheckDay() { if (DG.day !== today()) DG = { day: today(), prog: {}, done: {} }; }
const saveDG = () => { try { localStorage.setItem('playtoon.goals', JSON.stringify(DG)); } catch (e) {} };
window.ptEvent = (type, n = 1) => {
  dgCheckDay();
  const goals = todayGoals();
  for (const [game, [id, target]] of Object.entries(goals)) {
    if (id !== type || DG.done[game]) continue;
    DG.prog[game] = type === 'nb_time' ? Math.max(DG.prog[game] || 0, n) : (DG.prog[game] || 0) + n;
    if (DG.prog[game] >= target) {
      DG.done[game] = 1;
      try { G[game] && G[game].reward && G[game].reward(); } catch (e) {}
      window.ptToast(t('pt.goalDone', { goal: goalTxt(id, target), reward: reward(game), game: NAMES[game] }));
    }
  }
  saveDG();
};
function renderGoals(id) {
  dgCheckDay();
  const goals = todayGoals();
  document.getElementById(id).innerHTML = Object.entries(goals).map(([game, [gid, target]]) => {
    const v = Math.min(target, DG.prog[game] || 0), done = DG.done[game];
    const show = gid === 'nb_time' ? `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')} / ${target / 60}:00` : `${v} / ${target}`;
    return `<div class="pt-goal ${done ? 'done' : ''}" style="--c:${COLOR[game]}"><span><b>${NAMES[game]}</b> — ${goalTxt(gid, target)}</span><span class="rw">${done ? '✓ ' : ''}${reward(game)}</span><div class="bar"><i style="width:${v / target * 100}%"></i></div><span class="muted small">${show}</span></div>`;
  }).join('');
}
// Accueil : au premier passage, puis via « PLAYTOON » dans la nav
const home = document.getElementById('pt-home');
const openHome = () => { renderGoals('pt-goals'); home.classList.remove('hidden'); };
document.getElementById('brand').onclick = openHome;
document.getElementById('pt-home-close').onclick = () => home.classList.add('hidden');
home.querySelectorAll('.pt-game').forEach(a => a.addEventListener('click', () => home.classList.add('hidden')));
try { if (!localStorage.getItem('playtoon.welcomed')) { localStorage.setItem('playtoon.welcomed', '1'); openHome(); } } catch (e) {}

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
const big = n => !n ? '0' : n < 1e6 ? Math.floor(n).toLocaleString(lang) : n.toExponential(2).replace('e+', 'e');
function renderProfile() {
  const adv = readJ('blocparty.adv'), daily = readJ('blocparty.daily'), th = readJ('blocparty.themes');
  const stars = Object.values(adv.stars || {}).reduce((a, b) => a + b, 0), lv = Object.keys(adv.stars || {}).length;
  const sf = readJ('starforge.save.v1'), nb = readJ('neonbonk.meta.v1');
  const row = (a, b) => `<div><span>${a}</span><b>${b}</b></div>`;
  const card = (c, name, t, rows) => `<div class="pt-g" style="--c:${c}"><h3>${name} <span class="muted small">v${VERSIONS[VKEY[name]] || ''}</span><small>⏱ ${dur(t)}</small></h3>${rows.join('')}</div>`;
  document.getElementById('pt-prof').innerHTML =
    card('#ff5d8f', 'Block Quarry', PLAY.blocks, [row(t('pt.bq.best'), big(+localStorage.getItem('blocparty.best') || 0)), row(t('pt.bq.adv'), `${lv}/40 · ${stars} ★`), row(t('pt.bq.daily'), daily.best ? t('pt.bq.streak', { best: big(daily.best), n: daily.streak || 1 }) : '—'), row(t('pt.bq.coins'), big(+(localStorage.getItem('blocparty.coins') ?? 40))), row(t('pt.bq.themes'), `${(th.owned || ['classic']).length}/5`)]) +
    card('#ffc94d', 'Nova Foundry', PLAY.forge, [row(t('pt.nf.dust'), big(sf.lifeTotal)), row(t('pt.nf.sn'), sf.prestiges || 0), row(t('pt.nf.novae'), sf.novaTotal || 0), row(t('pt.nf.bb'), `${sf.bigbangs || 0} · ${sf.sing || 0}`), row(t('pt.nf.ach'), `${Object.keys(sf.ach || {}).length} · ${Object.keys(sf.chalDone || {}).length}/6`)]) +
    card('#4dd4ff', 'Synth Horde', PLAY.bonk, [row(t('pt.sh.runs'), `${nb.runs || 0} · ${nb.wins || 0}`), row(t('pt.sh.best'), nb.bestTime ? `${Math.floor(nb.bestTime / 60)}:${String(nb.bestTime % 60).padStart(2, '0')}` : '—'), row(t('pt.sh.lvl'), nb.maxLevel || 0), row(t('pt.sh.kills'), big(nb.totalKills)), row(t('pt.sh.boss'), nb.bossKills || 0)]);
}
const KEYS = () => Object.keys(localStorage).filter(k => /^(blocparty|starforge|neonbonk|playtoon)\./.test(k));
document.getElementById('profile').onclick = () => { renderProfile(); renderGoals('pt-goals2'); document.getElementById('pt-profile').classList.remove('hidden'); };
document.getElementById('pt-close').onclick = () => document.getElementById('pt-profile').classList.add('hidden');
document.getElementById('pt-exp').onclick = () => {
  const o = {}; for (const k of KEYS()) o[k] = localStorage.getItem(k);
  document.getElementById('pt-io').value = btoa(unescape(encodeURIComponent(JSON.stringify(o))));
};
document.getElementById('pt-imp').onclick = async () => {
  try {
    const o = JSON.parse(decodeURIComponent(escape(atob(document.getElementById('pt-io').value.trim()))));
    if (!await window.ptConfirm(t('pt.impQ'), t('pt.replace'))) return;
    window.PT_NOSAVE = true;   // empêche les jeux de réécrire leur état en mémoire par-dessus l'import au rechargement
    for (const [k, v] of Object.entries(o)) if (/^(blocparty|starforge|neonbonk|playtoon)\./.test(k)) localStorage.setItem(k, v);
    location.reload();
  } catch (e) { window.ptToast(t('pt.badSave')); }
};
// changement de langue : les fenêtres ouvertes se redessinent
window.addEventListener('pt-lang', () => {
  if (!home.classList.contains('hidden')) renderGoals('pt-goals');
  if (!document.getElementById('pt-profile').classList.contains('hidden')) { renderProfile(); renderGoals('pt-goals2'); }
});
