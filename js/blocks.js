// BLOCK QUARRY (ex-Bloc Party) — puzzle casual façon "Block Blast" : pose les pièces, complète lignes et colonnes.
import { t, num, date, applyI18n, addStrings } from './i18n.js';
import BQ_TEXT from './lang/blocks.js';
addStrings(BQ_TEXT);
import { loadFonts } from './quarry-fonts.js';
window.GAMES = window.GAMES || {};

const N = 8;
const COLORS = ['#ff5d8f', '#ffc94d', '#4dd4ff', '#7cff8a', '#b98bff', '#ff8a4d', '#4dffd2'];
const SHAPES = [
  // [cellules, poids]
  [[[0, 0]], 3],
  [[[0, 0], [1, 0]], 5], [[[0, 0], [0, 1]], 5],
  [[[0, 0], [1, 0], [2, 0]], 5], [[[0, 0], [0, 1], [0, 2]], 5],
  [[[0, 0], [1, 0], [2, 0], [3, 0]], 3], [[[0, 0], [0, 1], [0, 2], [0, 3]], 3],
  [[[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], 1.5], [[[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]], 1.5],
  [[[0, 0], [1, 0], [0, 1], [1, 1]], 6],
  [[[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2], [2, 2]], 1.5],
  [[[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]], 2], [[[0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2]], 2],
  [[[0, 0], [0, 1], [1, 1]], 3], [[[1, 0], [0, 1], [1, 1]], 3], [[[0, 0], [1, 0], [0, 1]], 3], [[[0, 0], [1, 0], [1, 1]], 3],
  [[[0, 0], [0, 1], [0, 2], [1, 2]], 2], [[[1, 0], [1, 1], [1, 2], [0, 2]], 2], [[[0, 0], [1, 0], [2, 0], [0, 1]], 2], [[[0, 0], [1, 0], [2, 0], [2, 1]], 2],
  [[[0, 0], [1, 0], [2, 0], [1, 1]], 2.5], [[[1, 0], [0, 1], [1, 1], [2, 1]], 2.5], [[[0, 0], [0, 1], [0, 2], [1, 1]], 2.5], [[[1, 0], [1, 1], [1, 2], [0, 1]], 2.5],
  [[[0, 0], [1, 0], [1, 1], [2, 1]], 2], [[[1, 0], [2, 0], [0, 1], [1, 1]], 2], [[[0, 0], [0, 1], [1, 1], [1, 2]], 2], [[[1, 0], [1, 1], [0, 1], [0, 2]], 2],
  [[[0, 0], [1, 1]], 1], [[[1, 0], [0, 1]], 1], [[[0, 0], [1, 1], [2, 2]], 0.8], [[[2, 0], [1, 1], [0, 2]], 0.8],
];
let overTimer = 0, resTimer = 0;   // minuteries des écrans de fin (annulées au changement de mode)
const ADV_TOOLS = 2;   // boosters par tentative de niveau d'Aventure
const STONE = '#7d7f9c', STONE2 = '#4b4d6e', STONEC = '#7d7f9d';   // STONEC : pierre dure déjà fissurée (un effacement de plus)   // pierre dure (Aventure, niveau 9+) : il faut l'effacer deux fois
// Thèmes : la couleur de base d'une pièce (indice dans COLORS) est remappée à l'affichage.
const THEMES = [
  // Carrière (défaut depuis 1.4.0) : minéraux taillés sur une dalle d'ardoise, cadre de grès, strates en fond
  { id: 'quarry', cost: 0, style: 'stone', pal: ['#e0567a', '#f0b23a', '#3d8fe0', '#3fbf6a', '#9a64e0', '#e07a3a', '#36c9b4'], bg: 'radial-gradient(ellipse at 50% -12%,rgba(255,170,90,.28) 0%,transparent 55%),repeating-linear-gradient(172deg,rgba(255,220,180,.035) 0 26px,rgba(0,0,0,.07) 26px 31px,transparent 31px 58px),linear-gradient(180deg,#2c2230 0%,#33241f 48%,#24180f 100%)' },
  { id: 'classic', cost: 0, style: 'candy', pal: COLORS, bg: 'radial-gradient(ellipse at 50% 0%,#3b2a6b 0%,#1b1840 55%,#120f2a 100%)' },
  { id: 'neon', cost: 60, style: 'neon', pal: ['#ff3df0', '#ffe14d', '#27e0ff', '#5dff7a', '#b46bff', '#ff7a2e', '#2effd5'], bg: 'radial-gradient(ellipse at 50% 0%,#1a0a33 0%,#07040f 70%)' },
  { id: 'pastel', cost: 80, style: 'soft', pal: ['#ffb3c7', '#ffe3a3', '#a8e6ff', '#b8f5c0', '#d9c2ff', '#ffc9a8', '#a8fff0'], bg: 'radial-gradient(ellipse at 50% 0%,#5a4a8a 0%,#3a3066 60%,#2a2450 100%)' },
  { id: 'pixel', cost: 100, style: 'pixel', pal: ['#e8405a', '#f6c03a', '#3aa8f6', '#4fd65a', '#9a5af6', '#f6823a', '#3af6c8'], bg: 'linear-gradient(#1a2440,#0c1224)' },
  { id: 'gold', cost: 200, style: 'gem', pal: ['#ffd24d', '#ffe899', '#e0a93a', '#fff0c2', '#c98a2a', '#ffb84d', '#f5d68a'], bg: 'radial-gradient(ellipse at 50% 0%,#2a2218 0%,#0a0806 70%)' },
  // thèmes de grade (1.9.0) : ne s'achètent pas, ils se gagnent en montant de grade dans le Carnet
  { id: 'marble', cost: 0, rank: 4, style: 'stone', pal: ['#d98a9c', '#e3c88f', '#8fb0d6', '#9cc9a4', '#b9a3d9', '#d9a37f', '#93d1c8'], bg: 'radial-gradient(ellipse at 50% -10%,rgba(255,250,240,.22) 0%,transparent 55%),repeating-linear-gradient(118deg,rgba(255,255,255,.035) 0 3px,transparent 3px 40px),linear-gradient(180deg,#4a4650 0%,#38343c 50%,#26232a 100%)' },
  { id: 'basalt', cost: 0, rank: 8, style: 'stone', pal: ['#ff4a3d', '#ffb02e', '#ff7a1f', '#e8e26a', '#ff5c8a', '#ff8f4d', '#ffd06b'], bg: 'radial-gradient(ellipse at 50% 112%,rgba(255,90,30,.42) 0%,transparent 55%),repeating-linear-gradient(90deg,rgba(0,0,0,.18) 0 2px,transparent 2px 46px),linear-gradient(180deg,#1c1a1e 0%,#241a16 55%,#2e140b 100%)' },
  { id: 'jade', cost: 0, rank: 12, style: 'stone', pal: ['#c9567a', '#d9b44a', '#3d9fb0', '#3fbf7a', '#7f6fd0', '#d0843f', '#5fd6a8'], bg: 'radial-gradient(ellipse at 50% -12%,rgba(140,255,200,.22) 0%,transparent 55%),repeating-linear-gradient(160deg,rgba(200,255,230,.03) 0 22px,rgba(0,0,0,.08) 22px 27px,transparent 27px 52px),linear-gradient(180deg,#14302a 0%,#11261f 50%,#0b1a15 100%)' },
];
let THEME = { owned: ['quarry', 'classic'], cur: 'quarry' };
try { THEME = Object.assign(THEME, JSON.parse(localStorage.getItem('blocparty.themes') || '{}')); } catch (e) {}
// joueurs d'avant 1.4.0 : la Carrière leur est offerte, et remplace l'ancien thème par défaut s'ils ne l'avaient pas changé
if (!THEME.owned.includes('quarry')) { THEME.owned.unshift('quarry'); if (THEME.cur === 'classic') THEME.cur = 'quarry'; }
const saveTheme = () => { try { localStorage.setItem('blocparty.themes', JSON.stringify(THEME)); } catch (e) {} };
const curTheme = () => THEMES.find(t => t.id === THEME.cur) || THEMES[0];
const tc = c => { const i = COLORS.indexOf(c); return i >= 0 ? curTheme().pal[i] : c; };
const LEVELS = 80;   // 8 chapitres de 10 ; le givre arrive au chapitre 5 (niveau 41), les veines de couleur au chapitre 7 (niveau 61)
const ICE_LVL = 41;
const VEIN_LVL = 61;
const CHAPTER = 10;
// Générateur déterministe : un niveau d'aventure a toujours la même grille et les mêmes pièces.
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
let rnd = Math.random;
// Monétisation : fournie par l'application Android (apps/block-quarry) ; sur le web, rien (pas de pub).
const MON = {
  canReward: () => !!(window.PT_MON && window.PT_MON.canReward()),
  // une vidéo à la fois : un double toucher sur un bouton « vidéo » ne doit ni lancer deux vidéos ni payer deux fois
  reward: kind => { if (!window.PT_MON || MON.busy) return Promise.resolve(false); MON.busy = true; return Promise.resolve(window.PT_MON.reward(kind)).catch(() => false).finally(() => { MON.busy = false; }); },
  busy: false,
  pause: () => window.PT_MON ? window.PT_MON.pause() : Promise.resolve(),   // pause publicitaire éventuelle (plafonnée) entre deux parties
};
// Classements natifs (1.13.0) : fournis par l'appli — Google Play Jeux, Game Center (apps/shared/scores.js), Steam
// (apps/desktop). Sur le web, pas de window.PT_SCORES : boutons masqués, rien n'est envoyé. Tableaux : daily, classic,
// chrono (noms, bornes et identifiants : apps/shared/leaderboards.mjs). Jamais d'exception vers le jeu.
const LB = {
  ok: () => { try { return !!(window.PT_SCORES && window.PT_SCORES.available()); } catch (e) { return false; } },
  submit: (board, score, day) => { if (!LB.ok() || !(score > 0)) return; try { Promise.resolve(window.PT_SCORES.submit(board, Math.floor(score), day)).catch(() => {}); } catch (e) {} },
  show: board => { if (!LB.ok()) return; try { Promise.resolve(window.PT_SCORES.show(board)).catch(() => {}); } catch (e) {} },
};
// ---------- icônes dessinées (plus d'emoji dans l'interface) : chaque emoji des textes du jeu est remplacé à la volée
// par son dessin, dans toutes les langues ; un emoji inconnu disparaît
const BQI = {   // glyphes d'une seule couleur, « frappés » dans la pierre (relief en CSS) — pas d'imitation d'emoji
  '🪙': '<circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="2.6"/><rect x="9.4" y="9.4" width="5.2" height="5.2" transform="rotate(45 12 12)"/>',
  '💎': '<path d="M6 4h12l4 5-10 12L2 9z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M2.5 9h19M9 4.5l3 15.5 3-15.5" fill="none" stroke="currentColor" stroke-width="1.3"/>',
  '🔒': '<path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.4"/><path fill-rule="evenodd" d="M5 11h14v10H5zM12 13.6a1.7 1.7 0 1 0 .01 0zM11.1 16h1.8v3h-1.8z"/>',
  '🎯': '<path fill-rule="evenodd" d="M4 5h16v16H4zM6.2 10h11.6v8.8H6.2z"/><path d="M8 2.8v4.4M16 2.8v4.4" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M8.6 14.6l2.3 2.2 4.6-4.6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  '⏱': '<circle cx="12" cy="13.5" r="7.4" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M9.5 2.8h5M12 3v3.2M18.2 6.8l1.6-1.6M12 13.5V9.2M12 13.5l3.2 2" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  '🗺': '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 4v14M15 6v14" stroke="currentColor" stroke-width="1.2"/><path d="M5.5 13.5l2.5-2.5 3 2 3-3.6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="1.6 1.3"/>',
  '🎨': '<rect x="3" y="12" width="8" height="8"/><rect x="13" y="12" width="8" height="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 4h8v6H8z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15 17l3-3M14.5 14.5l1.5-1.5" stroke="currentColor" stroke-width="1.2"/>',
  '💥': '<path d="M5 9h4v12H5zM10 9h4v12h-4zM15 9h4v12h-4z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 13.5h16" stroke="currentColor" stroke-width="2.6"/><path d="M12 9c0-3 1.8-4.2 3.8-5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M17.5 1.5l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z"/>',
  '🔨': '<path d="M13.5 9.5L4.2 18.8a1.6 1.6 0 0 0 2.3 2.3l9.3-9.3" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M10.5 4.5L15 2l7 7-2.5 4.5z"/>',
  '🏆': '<path d="M7 3h10v5a5 5 0 0 1-10 0z"/><path d="M7 5H4c0 3 1.5 4.5 3.5 4.5M17 5h3c0 3-1.5 4.5-3.5 4.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10.5 13h3l.8 4h-4.6zM7 18h10v3H7z"/>',
  '📤': '<path d="M12 3v11M8 7l4-4 4 4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 12v7h14v-7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  '❄': '<path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M9.6 3.6L12 6l2.4-2.4M9.6 20.4L12 18l2.4 2.4M4 10.3l3.3-.9-.9-3.3M20 13.7l-3.3.9.9 3.3M4 13.7l3.3.9-.9 3.3M20 10.3l-3.3-.9.9-3.3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  '🔥': '<path d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4.5 2-7 1.5 1 2 2.5 2 4 1-2 2-5 2-8z"/>',
  '↻': '<path d="M19 12a7 7 0 1 1-2.1-5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M18.5 3.5V8H14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
  '▶': '<path d="M7 4l13 8-13 8z"/>',
  '🏅': '<path d="M7 2h4l1 4.5L13 2h4l-2.6 7.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8.6 9.2L7 2"  fill="none" stroke="currentColor" stroke-width="1.8"/><path fill-rule="evenodd" d="M12 8.5a6.6 6.6 0 1 1 0 13.2 6.6 6.6 0 0 1 0-13.2zM12 11.4l1.2 2.5 2.7.4-2 1.9.5 2.7-2.4-1.3-2.4 1.3.5-2.7-2-1.9 2.7-.4z"/>',
  '⚙': '<path fill-rule="evenodd" d="M10.3 2h3.4l.5 2.6 1.9.8 2.2-1.5 2.4 2.4-1.5 2.2.8 1.9 2.6.5v3.4l-2.6.5-.8 1.9 1.5 2.2-2.4 2.4-2.2-1.5-1.9.8-.5 2.6h-3.4l-.5-2.6-1.9-.8-2.2 1.5-2.4-2.4 1.5-2.2-.8-1.9L2 13.7v-3.4l2.6-.5.8-1.9-1.5-2.2 2.4-2.4 2.2 1.5 1.9-.8zM12 8.4a3.6 3.6 0 1 0 .01 0z"/>',
  '🌐': '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3c-3.2 3.4-3.2 14.6 0 18M12 3c3.2 3.4 3.2 14.6 0 18" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  '👆': '<path d="M9 11V5.2a1.4 1.4 0 0 1 2.8 0V10M11.8 9.5V4a1.4 1.4 0 0 1 2.8 0v6M14.6 10V5.5a1.4 1.4 0 0 1 2.8 0V13c0 4.5-2.4 7.5-6 7.5-2.8 0-4.4-1.6-5.7-4l-2-3.6a1.3 1.3 0 0 1 2.2-1.4L9 14" fill="none" stroke="currentColor" stroke-width="2"/>',
};
const EMO = /(?![★☆])(\p{Extended_Pictographic}|↻|▶)\uFE0F?/gu;   // les étoiles ★ ☆ restent du texte (elles disparaissaient de la carte et des résultats)
const bqIcon = e => BQI[e.replace('️', '')] ? `<svg class="bqi" viewBox="0 0 24 24" aria-hidden="true">${BQI[e.replace('️', '')]}</svg>` : '';
function deEmoji(root) {
  if (!root) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), hits = [];
  for (let n = w.nextNode(); n; n = w.nextNode()) { EMO.lastIndex = 0; if (EMO.test(n.nodeValue)) hits.push(n); }
  for (const n of hits) {
    if (!n.parentNode) continue;
    const sp = document.createElement('span'); sp.className = 'bqt';
    sp.innerHTML = n.nodeValue.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]).replace(EMO, m => bqIcon(m));
    n.parentNode.replaceChild(sp, n);
  }
}
// ---------- insignes du Carnet (1.10.0) : dessinés, gravés — pas d'emoji ni de badge générique
// grade : écu de métal (bronze → fer → argent → or selon le titre), outil du métier gravé au centre, chevrons I / II
const METAL = [['#f0b98a', '#a8642e', '#4a260c'], ['#d9dde2', '#7c838c', '#2a2e35'], ['#fbf7ee', '#b8b2a6', '#4e4940'], ['#fff3c2', '#e0a536', '#5c3a08']];
const EMB = {   // emblèmes, en coordonnées 48 × 56, centrés vers (24, 24)
  chisel: '<path d="M21.6 9h4.8v4h-4.8z"/><path d="M22.4 13.4h3.2v12.2l-1.6 4.2-1.6-4.2z"/>',
  pick: '<path d="M10.5 19.5C16 12 32 12 37.5 19.5l-1.6 1.6C30 16.4 18 16.4 12.1 21.1z"/><path d="M22.7 15.2h2.6v19.6h-2.6z"/>',
  hammer: '<path d="M15.5 12.5h17v7.2h-17z"/><path d="M22.7 19.7h2.6v15h-2.6z"/>',
  gem: '<path fill-rule="evenodd" d="M17 14h14l5.4 6.2L24 34.6 11.6 20.2zM19 16.2l-3.6 4h17.2l-3.6-4zM16.4 22.2 24 31l7.6-8.8z"/>',
  crown: '<path d="M16.5 6.2l2.8 3 4.7-4 4.7 4 2.8-3v6H16.5z"/>',
};
const crossed = () => `<g transform="rotate(-38 24 24)">${EMB.pick}</g><g transform="rotate(40 24 24)">${EMB.hammer}</g>`;
const laurel = () => { let o = ''; for (const sd of [-1, 1]) for (let i = 0; i < 4; i++) { const a = (200 + i * 26) * Math.PI / 180, x = 24 + sd * Math.cos(a) * -14.5, y = 25 - Math.sin(a) * -14.5 + 2; o += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="1.5" ry="3.1" transform="rotate(${(sd * (-30 + i * 26)).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`; } return o; };
const tilt = (d, a) => `<g transform="rotate(${a} 24 24)">${d}</g>`;   // outils de biais : droits, ils se lisaient comme un « T »
const RANK_EMB = [() => tilt(EMB.chisel, 28), () => tilt(EMB.pick, -32), () => tilt(EMB.hammer, 34), crossed, () => crossed() + laurel(), () => EMB.gem, () => EMB.gem + laurel(), () => EMB.crown + EMB.gem + laurel()];
function rankBadge(r, cls = 'bp-ins') {
  const tier = Math.max(0, Math.min(7, r >> 1)), [hi, mid, lo] = METAL[tier >> 1], id = 'bqr' + r;
  const sh = 'M24 2.5 43.5 8.2V26c0 13.4-8.4 22.4-19.5 27.5C12.9 48.4 4.5 39.4 4.5 26V8.2z', ish = 'M24 6.4 40 11v15c0 11-6.8 18.6-16 23.2C14.8 44.6 8 37 8 26V11z';
  const emb = RANK_EMB[tier](), chev = (r % 2 ? [40, 45] : [42.5]).map(y => `<path d="M15.5 ${y}l8.5 4.6 8.5-4.6" fill="none" stroke-width="2.6" stroke-linejoin="round"/>`).join('');
  return `<svg class="${cls}" viewBox="0 0 48 56" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="${hi}"/><stop offset=".55" stop-color="${mid}"/><stop offset="1" stop-color="${lo}"/></linearGradient></defs>`
    + `<path d="${sh}" fill="${lo}" transform="translate(0 1.6)"/><path d="${sh}" fill="url(#${id})"/><path d="${ish}" fill="none" stroke="${lo}" stroke-opacity=".55" stroke-width="1.4"/><path d="${ish}" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width=".8" transform="translate(.6 .9)"/>`
    + `<g transform="translate(0 -1)"><g fill="#fff" stroke="#fff" fill-opacity=".35" stroke-opacity=".35" transform="translate(0 .9)">${emb}${chev}</g><g fill="${lo}" stroke="${lo}">${emb}${chev}</g></g></svg>`;
}
// médaille de chapitre : pièce au bord crénelé, motif du chapitre frappé au centre ; pas encore gagnée : son empreinte dans la pierre
const MEDAL_MOTIF = [
  '<g transform="rotate(-32 20 21)"><path d="M9.5 18.2C13 13.4 27 13.4 30.5 18.2l-1.4 1.3C25 16.6 15 16.6 10.9 19.5z"/><path d="M18.9 15.6h2.2v14h-2.2z"/></g>',   // front de taille : pic
  '<path fill-rule="evenodd" d="M11 11h18v18H11zM14.5 14.5a1.3 1.3 0 1 0 .01 0zM25.5 14.5a1.3 1.3 0 1 0 .01 0zM14.5 25.5a1.3 1.3 0 1 0 .01 0zM25.5 25.5a1.3 1.3 0 1 0 .01 0z"/>',   // roche dure : bloc riveté
  '<path d="M10 14.5c3.4-2.4 6.6 2.4 10 0s6.6-2.4 10 0M10 20c3.4-2.4 6.6 2.4 10 0s6.6-2.4 10 0M10 25.5c3.4-2.4 6.6 2.4 10 0s6.6-2.4 10 0" fill="none" stroke-width="2.4" stroke-linecap="round"/>',   // filons profonds : strates
  '<path d="M12 30l8-19 8 19M14.6 24h10.8M16.8 18.6h6.4" fill="none" stroke-width="2.2" stroke-linejoin="round"/><circle cx="20" cy="11.5" r="3.2" fill="none" stroke-width="1.8"/>',   // le puits : chevalement
  '<path d="M20 9v22M10.5 14.5l19 11M10.5 25.5l19-11" fill="none" stroke-width="2.2" stroke-linecap="round"/><path d="M17.4 10.6 20 13.2l2.6-2.6M17.4 29.4 20 26.8l2.6 2.6" fill="none" stroke-width="1.6" stroke-linecap="round"/>',   // galerie gelée : flocon
  '<path d="M15 31V17l3-4 3 4v14zM21.5 31V12.5l3.2-4.2 3.3 4.2V31zM10.8 31v-8.6l2.4-3 2.2 3V31z"/>',   // veine glaciaire : cristaux
  '<path d="M20 9.5 29.5 17 20 31 10.5 17z" fill="none" stroke-width="2.2" stroke-linejoin="round"/><path d="M10.5 17h19M15.2 17 20 9.5l4.8 7.5M15.2 17 20 31l4.8-14" fill="none" stroke-width="1.5" stroke-linejoin="round"/>',   // filons colorés : gemme taillée
  '<path d="M20 9c4.6 4.4 8 8.6 8 12.6a8 8 0 0 1-16 0C12 17.600 15.400 13.400 20 9z"/><path d="M16.200 22.600a4 4 0 0 0 3.800 4" fill="none" stroke-width="1.6" stroke-linecap="round" stroke="#fff" stroke-opacity=".5"/>',   // cœur de la montagne : goutte de lave
];
function medalSVG(c, on, cls = 'bp-mdi') {
  const id = 'bqm' + c + (on ? 'a' : 'b'), m = MEDAL_MOTIF[c % MEDAL_MOTIF.length];
  let teeth = ''; for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2; teeth += `M${(20 + Math.cos(a) * 16.4).toFixed(2)} ${(20 + Math.sin(a) * 16.4).toFixed(2)}L${(20 + Math.cos(a) * 18.6).toFixed(2)} ${(20 + Math.sin(a) * 18.6).toFixed(2)}`; }
  if (!on) return `<svg class="${cls}" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18.5" fill="rgba(0,0,0,.38)"/><circle cx="20" cy="20.8" r="18" fill="none" stroke="rgba(255,235,200,.12)" stroke-width="1.2"/><circle cx="20" cy="20" r="13.6" fill="none" stroke="rgba(0,0,0,.45)" stroke-width="1.2"/><g fill="rgba(255,235,200,.16)" stroke="rgba(255,235,200,.16)">${m}</g></svg>`;
  const [hi, mid, lo] = c >= 6 ? ['#ffe6c0', '#e8923a', '#5c2a0e'] : c >= 4 ? ['#f2fbff', '#9fc6d6', '#2c4a5a'] : METAL[3];   // chapitres du givre : argent bleui ; des veines : cuivre
  return `<svg class="${cls}" viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2=".4" y2="1"><stop offset="0" stop-color="${hi}"/><stop offset=".55" stop-color="${mid}"/><stop offset="1" stop-color="${lo}"/></linearGradient></defs>`
    + `<circle cx="20" cy="21.2" r="18.6" fill="${lo}"/><circle cx="20" cy="20" r="18.6" fill="url(#${id})"/><path d="${teeth}" stroke="${lo}" stroke-opacity=".55" stroke-width="1.1"/>`
    + `<circle cx="20" cy="20" r="13.8" fill="${lo}" fill-opacity=".22"/><circle cx="20" cy="20" r="13.8" fill="none" stroke="${lo}" stroke-opacity=".6" stroke-width="1.2"/><circle cx="20" cy="20.7" r="13.8" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width=".7"/>`
    + `<g fill="#fff" stroke="#fff" fill-opacity=".4" stroke-opacity=".4" transform="translate(0 .8)">${m}</g><g fill="${lo}" stroke="${lo}">${m}</g></svg>`;
}
const stripEmoji = s => String(s).replace(EMO, '').replace(/\s{2,}/g, ' ').trim();

let TUTO = false;
try { TUTO = !localStorage.getItem('blocparty.tuto'); } catch (e) {}
let TIPS = {};
try { TIPS = JSON.parse(localStorage.getItem('blocparty.tips') || '{}') || {}; } catch (e) {}
const saveTips = () => { try { localStorage.setItem('blocparty.tips', JSON.stringify(TIPS)); } catch (e) {} };
// confort (1.11.0) : vibrations, animations réduites (par défaut : réglage du système), conseils à revoir
let OPT = { vib: true, calm: null };
try { OPT = Object.assign(OPT, JSON.parse(localStorage.getItem('blocparty.opt') || '{}')); } catch (e) {}
const saveOpt = () => { try { localStorage.setItem('blocparty.opt', JSON.stringify(OPT)); } catch (e) {} };
const sysCalm = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
const calm = () => OPT.calm === null || OPT.calm === undefined ? sysCalm() : !!OPT.calm;
// animations réduites aussi pour le CSS (minuteur qui clignote, pastille qui pulse, rebond du score, médaille)
const paintCalm = () => { const tb = document.getElementById('tab-blocks'); if (tb) tb.toggleAttribute('data-calm', calm()); };
try { matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', paintCalm); } catch (e) {}
const buzz = pat => { if (OPT.vib && navigator.vibrate) try { navigator.vibrate(pat); } catch (e) {} };
// conseil : un message qui s'explique (mécanique, outil) reste lisible 3,5 s sur une étiquette en haut de la grille,
// à part des éloges (qui se remplacent à chaque effacement)
// q : à la suite des conseils en attente (présentations d'un niveau) ; sinon c'est un conseil du moment (outil, visée,
// pièce grisée) : il passe en tête de file sans rien effacer — il remplace seulement le conseil du moment précédent, et
// la présentation qu'il interrompt (givre, pierres dures, filon) reprend ensuite depuis le début (1.12.1 : elle se perdait)
const tip = (text, sub = '', delay = 0, dur = 3.6, q = false) => {
  const o = { text, sub, t: -delay, dur, now: !q };
  if (q) { S.tips.push(o); return; }
  S.tips = S.tips.filter(x => !x.now);
  if (S.tips[0] && S.tips[0].t > 0) S.tips[0].t = -0.3;   // interrompue : rejouée en entier après
  S.tips.unshift(o);
};
const dropTips = () => { S.tips = S.tips.filter(x => !x.now); if (S.tips[0] && S.tips[0].t > 0) S.tips[0].t = -0.3; };   // l'outil reposé : ses conseils partent, pas les présentations
const tutoDone = () => { if (!TUTO) return; TUTO = false; try { localStorage.setItem('blocparty.tuto', '1'); } catch (e) {} };

const $ = id => document.getElementById(id);
const canvas = $('bp-canvas');
const ctx = canvas.getContext('2d');
let W = 0, H = 0, DPR = 1;
let L = {}; // layout

const S = {
  board: [], tray: [], score: 0, shown: 0, best: 0, combo: 0, over: false,
  drag: null, fx: [], pops: [], clearing: [], shake: 0, placedAnim: [],
  mode: 'classic', lvl: 1, goal: null, moves: 0, gems: new Set(), got: 0, ice: new Set(), broke: 0,
  miss: 0, tips: [], beams: [], rings: [], flyers: [], flash: 0, glow: 0, hit: 0, endAnim: null, bestStart: 0,
};
let ADV = { stars: {} };
// Boosters payés en pièces : gagnées à chaque ligne en classique, aux étoiles en Aventure.
const TOOLS = { hammer: 15, bomb: 30, shuffle: 20 };
let COINS = 40, tool = null;
try { const c = localStorage.getItem('blocparty.coins'); if (c !== null) COINS = +c; } catch (e) {}
const saveCoins = () => { try { localStorage.setItem('blocparty.coins', COINS); } catch (e) {} paintBoost(); };
function paintBoost() {
  $('bp-coins').textContent = COINS;
  document.querySelectorAll('#bp-boost button[data-tool]').forEach(b => { b.classList.toggle('on', b.dataset.tool === tool); b.classList.toggle('no', (COINS < TOOLS[b.dataset.tool] && !(S.freeTool && b.dataset.tool === 'hammer')) || (S.mode === 'adv' && (S.toolsUsed || 0) >= ADV_TOOLS) || S.mode === 'daily'); });
}
try { ADV = Object.assign(ADV, JSON.parse(localStorage.getItem('blocparty.adv') || '{}')); } catch (e) {}
const saveAdv = () => { try { localStorage.setItem('blocparty.adv', JSON.stringify(ADV)); } catch (e) {} };
const unlockedLvl = () => { let n = 1; while (ADV.stars[n]) n++; return Math.min(n, LEVELS); };

let audio = null;
function beep(freq, dur = 0.08, type = 'sine', vol = 0.06) {
  if (window.PT_MUTE) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + dur);
    o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime + dur);
  } catch (e) {}
}

const ac = () => { if (window.PT_MUTE) return null; try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); return audio; } catch (e) { return null; } };
let noiseBuf = null;
function noise(dur, f, q, vol, type = 'bandpass', at = 0) {
  const a = ac(); if (!a) return;
  if (!noiseBuf) { noiseBuf = a.createBuffer(1, a.sampleRate, a.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain(), t0 = a.currentTime + at;
  s.buffer = noiseBuf; fl.type = type; fl.frequency.value = f; fl.Q.value = q;
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(fl); fl.connect(g); g.connect(a.destination); s.start(t0, Math.random() * 0.5); s.stop(t0 + dur);
}
function tone(f0, f1, dur, type, vol, at = 0) {
  const a = ac(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain(), t0 = a.currentTime + at;
  o.type = type; o.frequency.setValueAtTime(f0, t0); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(a.destination); o.start(t0); o.stop(t0 + dur + 0.02);
}
const PENTA = [262, 294, 330, 392, 440, 523, 587, 659, 784, 880, 1046, 1175, 1318];
const SFX = {
  pick() { tone(2350, 1900, 0.045, 'triangle', 0.02); noise(0.025, 3800, 4, 0.025, 'bandpass'); },   // ciseau qui touche la pierre
  snap() { tone(1500, 1500, 0.018, 'sine', 0.01); },
  thock() { tone(190, 70, 0.11, 'sine', 0.09); noise(0.05, 1100, 1.2, 0.05); },   // pierre posée sur l'ardoise
  back() { noise(0.12, 700, 1.4, 0.04, 'bandpass'); tone(240, 150, 0.08, 'triangle', 0.02); },   // pierre qui racle en revenant
  // éboulement + accord qui monte d'un degré par combo
  clear(n, combo) {
    noise(0.22 + 0.06 * n, 500 + 120 * n, 0.7, 0.05 + 0.015 * n, 'lowpass'); noise(0.12, 2600, 2, 0.02, 'bandpass', 0.03);
    const b = Math.min(PENTA.length - 5, Math.max(0, combo - 1));
    [0, 2, 4].slice(0, Math.min(3, n + 1)).forEach((k, i) => tone(PENTA[b + k], PENTA[b + k], 0.32, 'triangle', 0.045, i * 0.045));
    if (n >= 3) tone(PENTA[b + 5] || 1318, PENTA[b + 5] || 1318, 0.5, 'sine', 0.03, 0.14);
  },
  ice(i) { tone(2637 + i * 30, 3136 + i * 30, 0.09, 'triangle', 0.03); noise(0.08, 6000, 3, 0.03, 'highpass'); tone(3951, 3951, 0.25, 'sine', 0.012, 0.05); },   // givre qui casse : craquement aigu
  gem(i) { tone(1568 + i * 40, 1568 + i * 40, 0.5, 'sine', 0.04); tone(2349 + i * 60, 2349 + i * 60, 0.35, 'sine', 0.018); },
  lost() { tone(330, 220, 0.18, 'triangle', 0.03); },
  fail() { tone(300, 80, 0.7, 'sawtooth', 0.03); noise(0.5, 300, 0.7, 0.05, 'lowpass', 0.05); },
  best() { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, f, 0.22, 'triangle', 0.05, i * 0.09)); },
};

function load() {
  try {
    const d = JSON.parse(localStorage.getItem('blocparty.save') || 'null');
    S.best = +(localStorage.getItem('blocparty.best') || 0);
    if (d && d.board && d.board.length === N) {
      S.board = d.board; S.tray = d.tray; S.score = d.score; S.shown = d.score; S.combo = d.combo || 0; S.contN = d.contN || 0; S.placed = d.placed || 0;
      S.miss = d.miss || 0; S.lines = d.lines || 0; S.maxCombo = d.maxCombo || 0; S.bestStart = d.bestStart ?? S.best; S.beat = S.score > S.bestStart && S.bestStart > 0;
      return true;
    }
  } catch (e) {}
  return false;
}
function save() {
  if (window.PT_NOSAVE) return;
  if (S.mode !== 'classic') return;   // aventure et défi du jour ne touchent pas à la partie classique en cours
  try {
    localStorage.setItem('blocparty.best', S.best);
    if (S.over) localStorage.removeItem('blocparty.save');
    else localStorage.setItem('blocparty.save', JSON.stringify({ board: S.board, tray: S.tray, score: S.score, combo: S.combo, contN: S.contN || 0, placed: S.placed || 0, miss: S.miss || 0, lines: S.lines || 0, maxCombo: S.maxCombo || 0, bestStart: S.bestStart || 0 }));
  } catch (e) {}
}

function pickShape() {
  const total = SHAPES.reduce((a, s) => a + s[1], 0);
  let r = rnd() * total;
  for (const s of SHAPES) { r -= s[1]; if (r <= 0) return s[0]; }
  return SHAPES[0][0];
}
function makePiece() {
  const cells = pickShape();
  return { cells, w: Math.max(...cells.map(c => c[0])) + 1, h: Math.max(...cells.map(c => c[1])) + 1, color: pieceColor() };
}
// veine de couleur : une pièce sur deux (niveaux d'Aventure) porte la couleur désignée
function pieceColor() {
  if (S.mode === 'adv' && S.goal && S.goal.type === 'color' && rnd() < 0.5) return S.goal.color;
  return COLORS[(rnd() * COLORS.length) | 0];
}
function fits(p, gx, gy, board = S.board) {
  for (const [x, y] of p.cells) {
    const X = gx + x, Y = gy + y;
    if (X < 0 || Y < 0 || X >= N || Y >= N || board[Y][X]) return false;
  }
  return true;
}
function canPlaceAnywhere(p, board = S.board) {
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (fits(p, x, y, board)) return true;
  return false;
}
// Les trois pièces peuvent-elles toutes être posées, dans un ordre au moins (lignes effacées entre deux) ?
function placeAll(tray, board) {
  const orders = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  for (const o of orders) {
    let b = board.map(r => r.slice()), ok = true;
    for (const i of o) {
      const p = tray[i]; let done = false;
      for (let y = 0; y < N && !done; y++) for (let x = 0; x < N && !done; x++) if (fits(p, x, y, b)) {
        for (const [cx, cy] of p.cells) b[y + cy][x + cx] = 1;
        const { rows, cols } = linesToClear(b);
        rows.forEach(r => b[r].fill(null)); cols.forEach(c => { for (let r = 0; r < N; r++) b[r][c] = null; });
        done = true;
      }
      if (!done) { ok = false; break; }
    }
    if (ok) return true;
  }
  return false;
}
function clearsLine(p, board) {
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (fits(p, x, y, board)) {
    const b = board.map(r => r.slice()); for (const [cx, cy] of p.cells) b[y + cy][x + cx] = 1;
    const { rows, cols } = linesToClear(b); if (rows.length + cols.length) return true;
  }
  return false;
}
function fillTray() {
  // Tirage équitable : les trois pièces doivent pouvoir être posées (dans un ordre au moins) ; plus la grille est
  // pleine, plus on écarte les grosses pièces. À défaut, au moins une pièce qui rentre.
  const filled = S.board.reduce((a, r) => a + r.filter(c => c).length, 0) / (N * N);
  const mercy = S.mode === 'adv' || S.mode === 'chrono' || (S.placed || 0) < 150;   // classique et défi : la bienveillance s'estompe après 150 pièces (sinon le défi ne finit jamais)
  // Grille chargée : on cherche d'abord un tirage où une pièce complète une ligne (coup de pouce).
  let best = null, fair = null;
  for (let k = 0; k < 60; k++) {
    const t = [makePiece(), makePiece(), makePiece()];
    if (filled > 0.45 && k < 40 && t.some(p => p.cells.length >= 5 && rnd() < (filled - 0.35) * 2)) continue;
    if (placeAll(t, S.board)) {
      if (!mercy || filled < 0.4 || k >= 40 || t.some(p => clearsLine(p, S.board))) { best = t; break; }
      if (!fair) fair = t;
    } else if (!best && t.some(p => canPlaceAnywhere(p))) best = t;
  }
  if (fair && (!best || !placeAll(best, S.board))) best = fair;
  S.tray = best || [makePiece(), makePiece(), makePiece()];
}
// Tirage de secours garanti : trois pièces qui rentrent (en dernier recours, des petites pièces).
function rescueTray() {
  S.tray = [null, null, null]; fillTray();
  if (placeAll(S.tray, S.board)) return true;
  const small = [[[0, 0]], [[0, 0], [1, 0]], [[0, 0], [0, 1]]];
  S.tray = small.map(cells => ({ cells, w: Math.max(...cells.map(c => c[0])) + 1, h: Math.max(...cells.map(c => c[1])) + 1, color: COLORS[(rnd() * COLORS.length) | 0] }));
  return S.tray.some(p => canPlaceAnywhere(p));
}
// Reprise garantie : on dégage la zone 3×3 la plus remplie (gemmes récoltées), puis un tirage qui rentre.
function clearSpace() {
  let bx = 0, by = 0, bn = -1;
  for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) {
    let n = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (S.board[y + dy][x + dx]) n++;
    if (n > bn) { bn = n; bx = x; by = y; }
  }
  smash([-1, 0, 1].flatMap(dy => [-1, 0, 1].map(dx => [bx + dx, by + dy])));
  if (!S.over) rescueTray();
}

// état visuel et statistiques d'une partie neuve (toutes les modes)
function freshRun() { S.counted = false; S.tips = []; S.xpRun = 0; S.ice = new Set(); S.broke = 0; S.miss = 0; S.lines = 0; S.maxCombo = 0; S.pieces = 0; S.endAnim = null; S.beams = []; S.rings = []; S.flyers = []; S.flash = 0; S.glow = 0; S.hit = 0; }
function newGame() {
  clearTimeout(overTimer); clearTimeout(resTimer); S.contN = 0; S.placed = 0;
  S.mode = 'classic'; rnd = Math.random; S.gems.clear();
  S.board = Array.from({ length: N }, () => Array(N).fill(null));
  S.score = 0; S.shown = 0; S.combo = 0; S.over = false; S.fx = []; S.pops = []; S.clearing = []; S.vidCont = false;
  freshRun(); S.bestStart = S.best; S.beat = false;
  fillTray();
  $('bp-over').classList.add('hidden');
  save(); updateHUD();
}

// Objectif d'un niveau : 1–40 comme avant ; 41–60 : givre surtout, gemmes et lignes en rappel
function levelType(n) {
  if (n >= VEIN_LVL) { const k = n - 60; return k % 5 === 0 ? 'lines' : k % 4 === 0 ? 'gems' : k % 2 ? 'color' : 'ice'; }
  if (n < ICE_LVL) return n % 4 === 0 ? 'lines' : 'gems';
  const k = n - 40;
  return k % 5 === 0 ? 'lines' : k % 3 === 0 ? 'gems' : 'ice';
}
// Givre (niveau 41+) : plaques de glace collées au sol de la dalle. On pose dessus normalement ; une ligne ou une
// colonne effacée qui passe sur une plaque la brise. Objectif : briser tout le givre avant la fin des coups.
function genIce(n) {
  const k = Math.min(n - 40, 26), r = mulberry32(n * 6151 + 29);
  const board = Array.from({ length: N }, () => Array(N).fill(null));
  const bands = 1 + Math.floor(k / 7);
  let hard = 0;
  for (let b = 0; b < bands; b++) {   // quelques bandes de pierres (dures comprises) pour garder le relief des chapitres précédents
    const horiz = r() < 0.5, idx = (r() * N) | 0, fill = 3 + ((r() * 3) | 0);
    for (const j of [...Array(N).keys()].sort(() => r() - 0.5).slice(0, fill)) {
      const x = horiz ? j : idx, y = horiz ? idx : j;
      if (board[y][x]) continue;
      board[y][x] = r() < 0.35 ? STONE2 : STONE;
      if (board[y].every(c => c) || board.every(row => row[x])) { board[y][x] = null; continue; }
      if (board[y][x] === STONE2) hard++;
    }
  }
  // le givre vient en plaques (rectangles 2×2 à 3×3), éparpillées : il faut viser plusieurs lignes et colonnes
  const want = Math.min(18, 7 + Math.round(k * 0.55)), ice = new Set();
  for (let t = 0; t < 80 && ice.size < want; t++) {
    const w = 2 + ((r() * 2) | 0), h = 2 + ((r() * 2) | 0), x0 = (r() * (N - w + 1)) | 0, y0 = (r() * (N - h + 1)) | 0;
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) if (!board[y][x] && ice.size < want) ice.add(y * N + x);
  }
  const rows = new Set([...ice].map(i => (i / N) | 0)).size, cols = new Set([...ice].map(i => i % N)).size;
  const moves = Math.round(8 + Math.min(rows, cols) * 2.4 + ice.size * 0.45 + hard * 0.6 + (n === ICE_LVL ? 3 : 0) + (n > 60 ? 7 : 0));
  return { board, gems: new Set(), ice, goal: { type: 'ice', ice: ice.size, gems: 0, target: 0, moves } };
}
// Veine de couleur (niveau 61+) : une couleur est désignée, il faut dégager N cases de cette couleur (lignes effacées
// ou boosters). La moitié des pièces tirées porte cette couleur ; des bandes de pierres gardent le relief.
function genColor(n) {
  const k = n - 60, r = mulberry32(n * 4909 + 17);
  const board = Array.from({ length: N }, () => Array(N).fill(null));
  const bands = 2 + Math.floor(k / 6); let hard = 0;
  for (let b = 0; b < bands; b++) {
    const horiz = r() < 0.5, idx = (r() * N) | 0, fill = 3 + ((r() * 3) | 0);
    for (const j of [...Array(N).keys()].sort(() => r() - 0.5).slice(0, fill)) {
      const x = horiz ? j : idx, y = horiz ? idx : j;
      if (board[y][x]) continue;
      board[y][x] = r() < 0.4 ? STONE2 : STONE;
      if (board[y].every(c => c) || board.every(row => row[x])) { board[y][x] = null; continue; }
      if (board[y][x] === STONE2) hard++;
    }
  }
  const color = COLORS[(k * 3 + ((r() * 7) | 0)) % COLORS.length], need = Math.min(30, 10 + Math.round(k * 0.9));
  const moves = Math.round(7 + need * 0.95 + hard * 0.5 + (n === VEIN_LVL ? 4 : 0));
  return { board, gems: new Set(), ice: new Set(), goal: { type: 'color', color, need, ice: 0, gems: 0, target: 0, moves } };
}
function genLevel(n) {
  if (levelType(n) === 'ice') return genIce(n);
  if (levelType(n) === 'color') return genColor(n);
  // Les pierres forment des lignes / colonnes à trous : on les complète pour libérer les gemmes.
  const r = mulberry32(n * 7919 + 13);
  const board = Array.from({ length: N }, () => Array(N).fill(null));
  const bands = Math.min(1 + Math.floor(n / 4), 5) + (n > 24 ? 1 : 0) + (n > 34 ? 1 : 0), cells = [];
  const used = new Set(); let hard = 0;
  for (let k = 0; k < bands; k++) {
    let horiz, idx, t = 0;
    do { horiz = r() < 0.5; idx = (r() * N) | 0; } while (used.has((horiz ? 'r' : 'c') + idx) && ++t < 20);
    used.add((horiz ? 'r' : 'c') + idx);
    const fill = Math.min(6, 3 + Math.floor(n / 8) + ((r() * 2) | 0));
    const order = [...Array(N).keys()].sort(() => r() - 0.5).slice(0, fill);
    for (const j of order) {
      const x = horiz ? j : idx, y = horiz ? idx : j;
      if (board[y][x]) continue;
      board[y][x] = STONE;
      if (board[y].every(c => c) || board.every(row => row[x])) { board[y][x] = null; continue; }
      if (n >= 9 && hard < (n <= 11 ? n - 8 : 99) && r() < Math.min(0.45, 0.15 + (n - 9) * 0.012)) { board[y][x] = STONE2; hard++; }
      cells.push([x, y]);
    }
  }
  const type = levelType(n);
  const gemsN = Math.min(2 + Math.floor(n / 3), 10, cells.length);
  const gems = new Set();
  while (gems.size < gemsN) { const [x, y] = cells[(r() * cells.length) | 0]; gems.add(y * N + x); }
  const target = n > 40 ? 10 + Math.floor((n - 40) / 10) : 3 + Math.floor(n / 5);   // chapitres 5–6 : objectif plafonné (15 lignes, c'était injouable)
  // au-delà du niveau 16, les coups se resserrent (−1,2 % par niveau, jusqu'à −28 %)
  const tight = 1 - Math.min(0.28, Math.max(0, n - 16) * 0.012);
  // niveaux « lignes » resserrés en seconde moitié (ils étaient triviaux), niveaux 9–11 un peu plus larges (présentation)
  const moves = Math.round((type === 'gems' ? 6 + Math.round(gemsN * 1.5) + bands * 2 + hard * 0.6 + (n >= 9 && n <= 11 ? 4 : 0) : (6 + target * 3) * (n >= 16 ? 0.8 : 1)) * tight) + (n > 40 ? 3 : 0) + (n > 60 ? 3 : 0);
  return { board, gems: type === 'gems' ? gems : new Set(), ice: new Set(), goal: { type, gems: type === 'gems' ? gemsN : 0, target, moves } };
}
function startLevel(n) {
  clearTimeout(overTimer); clearTimeout(resTimer); S.contN = 0; S.vidCont = false;
  const L0 = genLevel(n);
  S.mode = 'adv'; S.lvl = n; S.goal = L0.goal; S.moves = L0.goal.moves; S.gems = L0.gems; S.got = 0; S.lines = 0; S.rescue = n >= 9 ? 2 : 1; S.moreBought = false; S.toolsUsed = 0; S.gain = 0;
  S.vein = 0; S.used = 0; S.board = L0.board; S.score = 0; S.shown = 0; S.combo = 0; S.over = false; S.fx = []; S.pops = []; S.clearing = []; freshRun();
  S.ice = L0.ice; S.broke = 0;
  rnd = mulberry32(n * 104729 + 7);
  fillTray();
  ['bp-over', 'bp-map', 'bp-res'].forEach(id => $(id).classList.add('hidden'));
  S.pops.push({ text: t('bp.level', { n }), sub: goalText(), t: 0 });
  if (S.goal.type === 'ice' && (n === ICE_LVL || !ADV.stars[ICE_LVL])) tip(t('bp.iceTitle'), t('bp.iceSub'), 1.3, 4.5, true);   // présentation du givre
  if (S.goal.type === 'color' && (n === VEIN_LVL || !ADV.stars[VEIN_LVL])) tip(t('bp.veinTitle'), t('bp.veinSub'), 1.3, 4.5, true);   // présentation des veines de couleur
  if (n === 9 || (n > 9 && !ADV.stars[9])) tip(t('bp.hardTitle'), t('bp.hardSub'), 1.3, 4.5, true);   // présentation des pierres dures
  updateHUD();
}
const goalText = () => S.goal.type === 'color' ? t('bp.getVein', { n: S.goal.need }) : S.goal.type === 'gems' ? t('bp.getGems', { n: S.goal.gems }) : S.goal.type === 'ice' ? t('bp.breakIce', { n: S.goal.ice }) : t('bp.clearLines', { n: S.goal.target });
const goalWon = () => S.goal.type === 'color' ? S.vein >= S.goal.need : S.goal.type === 'gems' ? S.gems.size === 0 : S.goal.type === 'ice' ? S.ice.size === 0 : S.lines >= S.goal.target;
// une plaque de givre brisée (effacement ou booster)
function breakIce(x, y) {
  if (!S.ice.delete(y * N + x)) return false;
  S.broke++; const i = S.broke; track('ice');
  for (let k = 0; k < 7; k++) burst(x, y, '#d8f6ff');
  setTimeout(() => SFX.ice(i), 40);
  return true;
}
// une case de la couleur désignée dégagée (veine de couleur)
function veinCell(color) {
  if (S.mode !== 'adv' || !S.goal || S.goal.type !== 'color' || color !== S.goal.color) return;
  S.vein++;
}
function advResult(win) {
  S.over = true;
  let stars = 0;
  if (win) {
    const used = S.used, ratio = used / S.goal.moves;
    stars = ratio <= 0.6 ? 3 : ratio <= 0.8 ? 2 : 1;
    const prev = ADV.stars[S.lvl] || 0;
    ADV.stars[S.lvl] = Math.max(prev, stars); saveAdv();
    S.gain = stars > prev ? (stars - prev) * 10 : 0;
    if (S.gain) { COINS += S.gain; saveCoins(); }
    track('adv'); if (stars === 3) track('adv3'); gainXP(stars * 3); checkMedals();
  }
  if (!S.counted) { S.counted = true; stat('games'); } saveCar(); checkMilestones();   // une reprise suivie d'une seconde fin ne recompte pas la partie
  clearTimeout(resTimer); resTimer = setTimeout(() => {
    const close = S.goal.type === 'color' ? S.vein >= S.goal.need - 2 : S.goal.type === 'gems' ? S.got >= S.goal.gems - 1 : S.goal.type === 'ice' ? S.ice.size <= 2 : S.lines >= S.goal.target - 1;
    $('bp-restitle').textContent = win ? t('bp.levelWon', { n: S.lvl }) : close ? t('bp.failClose') : t('bp.fail');
    $('bp-resstars').innerHTML = [1, 2, 3].map(k => k <= stars ? '★' : '<i>★</i>').join('');
    $('bp-restext').textContent = win ? t('bp.resWin', { used: S.used, total: S.goal.moves, coins: COINS }) + (S.gain ? `  ·  +${S.gain} 🪙` : '') : (S.moves <= 0 ? t('bp.noMoves') : t('bp.noRoom'));
    $('bp-resnext').classList.toggle('hidden', !win || S.lvl >= LEVELS);
    $('bp-rescont').classList.toggle('hidden', win || S.moves <= 0 || COINS < contCost());
    $('bp-rescont').textContent = t('bp.cont', { n: contCost() });
    $('bp-resmore').classList.toggle('hidden', win || S.moves > 0 || S.moreBought || COINS < MORE_COST);   // seconde chance, une fois par tentative
    $('bp-resvid').classList.toggle('hidden', win || (S.moves <= 0 ? S.moreBought : S.vidCont) || !MON.canReward());
    $('bp-resvid').textContent = t(S.moves <= 0 ? 'app.watchMoves' : 'app.watchCont');   // …ou contre une vidéo (application)
    $('bp-resxp').innerHTML = xpLine(); paintCarBtn();
    $('bp-res').classList.remove('hidden');
    if (win) SFX.best(); else SFX.fail();
  }, 700);
}
// ---------- défi du jour : même grille et mêmes pièces pour tout le monde, graine = date UTC (1.13.0 : c'est la journée
// des classements Play Jeux / Game Center / Steam ; avant, la date locale). Bonus de connexion et semaine : date locale.
const dayKey = (d = new Date()) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
const uKey = (d = new Date()) => d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
const todayLabel = () => date(new Date(), { day: 'numeric', month: 'long', timeZone: 'UTC' });
const nextDaily = () => { const s = Math.max(60, Math.ceil((864e5 - Date.now() % 864e5) / 1000)); return `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor(s % 3600 / 60)).padStart(2, '0')}`; };   // HH:MM jusqu'à minuit UTC
let DAILY = { day: 0, best: 0, streak: 0, last: 0 };
try { DAILY = Object.assign(DAILY, JSON.parse(localStorage.getItem('blocparty.daily') || '{}')); } catch (e) {}
if (!DAILY.last && DAILY.day && DAILY.streak) DAILY.last = DAILY.day;   // avant 1.4.0, la série comptait les jours ouverts
// passage à la date UTC (1.13.0), sans perdre la série ni primer deux fois la même journée :
// - à l'ouest de Greenwich, le soir, la journée UTC a un jour d'avance : la journée locale déjà jouée devient la journée UTC ;
// - à l'est, après minuit, c'est la journée locale qui est en avance : la série la compte déjà (DAILY.last ≥ aujourd'hui).
if (!DAILY.utc) {
  const Lk = dayKey(), Uk = uKey();
  if (Uk > Lk) {
    for (const f of ['day', 'last', 'cont']) if (DAILY[f] === Lk) DAILY[f] = Uk;
    if (DAILY.hist && DAILY.hist[Lk] !== undefined) { DAILY.hist[Uk] = Math.max(DAILY.hist[Uk] || 0, DAILY.hist[Lk]); delete DAILY.hist[Lk]; }
  }
  DAILY.utc = 1;
  try { localStorage.setItem('blocparty.daily', JSON.stringify(DAILY)); } catch (e) {}
}
// objectifs du défi (mesurés : glouton sur 30 graines, médiane ≈ 1 360) et historique pour le calendrier du mois
const DAILY_GOALS = [500, 1500, 3000];
const dailyStars = sc => DAILY_GOALS.filter(g => sc >= g).length;
function dailyRecord() {
  const st = dailyStars(DAILY.best); DAILY.hist = DAILY.hist || {};
  if (st > (DAILY.hist[DAILY.day] || 0)) {
    const prev = DAILY.hist[DAILY.day] || 0; gainXP(10 * (st - prev)); if (st >= 2 && prev < 2) track('dstar');
    DAILY.hist[DAILY.day] = st;
    const keys = Object.keys(DAILY.hist).sort(); while (keys.length > 70) delete DAILY.hist[keys.shift()];
    const ym = Math.floor(DAILY.day / 100), n = Object.keys(DAILY.hist).filter(k => Math.floor(k / 100) === ym && DAILY.hist[k] > 0).length;
    DAILY.trophies = DAILY.trophies || {}; if (n >= 20 && !DAILY.trophies[ym]) { DAILY.trophies[ym] = 1; window.ptToast && window.ptToast(t('bp.trophy')); }
  }
  saveDaily();
}
function calendarHTML() {
  const d0 = new Date(), y = d0.getUTCFullYear(), m = d0.getUTCMonth(), first = (new Date(Date.UTC(y, m, 1)).getUTCDay() + 6) % 7, days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate(), td = d0.getUTCDate();
  const h = DAILY.hist || {}, ym = y * 100 + m + 1, got = Object.keys(h).filter(k => Math.floor(k / 100) === ym && h[k] > 0).length;
  let g = ''; for (let i = 0; i < first; i++) g += '<i></i>';
  for (let dd = 1; dd <= days; dd++) { const k = ym * 100 + dd, st = h[k] || 0; g += `<i class="s${st}${dd === td ? ' today' : ''}${dd > td ? ' fut' : ''}">${dd}<b>${st ? '★'.repeat(st) : ''}</b></i>`; }
  return `<div class="bp-calh">${(DAILY.trophies || {})[ym] ? '🏆 ' : ''}${t('bp.calTitle', { month: date(d0, { month: 'long', timeZone: 'UTC' }), n: got })}</div><div class="bp-calg">${g}</div>`;
}
function shareDaily() {
  const st = dailyStars(DAILY.best), txt = t('bp.shareTxt', { date: todayLabel(), stars: '★'.repeat(st) + '☆'.repeat(3 - st), score: num(DAILY.best), n: DAILY.streak }) + '\nhttps://flocautank.github.io/playtoon/';
  if (navigator.share) navigator.share({ text: txt }).catch(() => {});
  else if (navigator.clipboard) navigator.clipboard.writeText(txt).then(() => window.ptToast && window.ptToast(t('bp.shared')), () => {});
}
// premier coup du jour dans le défi : c'est lui qui fait avancer la série
function dailyPlayed() {
  const today = uKey(); if (DAILY.last >= today) return;   // ≥ : journée déjà comptée (migration UTC, horloge revenue en arrière)
  DAILY.streak = DAILY.last === uKey(new Date(Date.now() - 864e5)) ? DAILY.streak + 1 : 1; DAILY.last = today; saveDaily(); stat('days'); track('daily');
}
const saveDaily = () => { try { localStorage.setItem('blocparty.daily', JSON.stringify(DAILY)); } catch (e) {} };
// ---------- Carnet du carrier (1.9.0) : grade de carrière, missions de la semaine, médailles de chapitre, statistiques.
// Tout se gagne en jouant, dans tous les modes ; les récompenses sont des pièces ou des thèmes (cosmétiques). Une vidéo
// (application) peut seulement doubler les pièces d'une mission déjà remplie — jamais remplir une mission ni monter un grade.
const RANK_XP = [0, 40, 120, 250, 420, 650, 950, 1300, 1750, 2300, 2950, 3700, 4600, 5600, 6800, 8200];   // 16 grades (8 titres × I/II)
const rankOf = xp => { let r = 0; while (r + 1 < RANK_XP.length && xp >= RANK_XP[r + 1]) r++; return r; };
const rankCoins = r => 20 + 10 * r;
// au-delà du dernier grade : une étoile de légende tous les 1 000 XP (pièces seulement, aucun avantage de jeu)
const LEGEND_XP = 1000, LEGEND_COINS = 100, TOP_XP = RANK_XP[RANK_XP.length - 1];
const legendOf = xp => Math.max(0, Math.floor((xp - TOP_XP) / LEGEND_XP));
// missions : [objectif, pièces] ; « combo » et « score » retiennent le meilleur de la semaine, les autres cumulent
const MISSIONS = {
  lines: [120, 40], pieces: [400, 40], multi: [8, 50], combo: [6, 50], score: [1500, 60], chrono: [3, 40], clear: [1, 70],
  adv: [6, 50], adv3: [3, 60], gems: [30, 40], ice: [40, 50], daily: [4, 60], dstar: [3, 60],
};
const M_GENERAL = ['lines', 'pieces', 'multi', 'combo', 'score', 'chrono', 'clear'], M_MODE = ['adv', 'adv3', 'gems', 'ice', 'daily', 'dstar'];
const BEST_OF = new Set(['combo', 'score']);
const WEEK_CHEST = 100, MISSION_XP = 30, MEDAL_COINS = 60;
let CAR = { xp: 0, rank: 0, st: {}, week: null, medals: {}, ms: {} }, carFresh = true;
try { const c = localStorage.getItem('blocparty.career'); if (c) { CAR = Object.assign(CAR, JSON.parse(c)); carFresh = false; } } catch (e) {}
if (carFresh) {   // joueurs d'avant 1.9.0 : le grade part de la progression déjà faite (étoiles d'Aventure et du défi), sans récompense rétroactive
  const advSt = Object.values(ADV.stars).reduce((a, b) => a + b, 0), dSt = Object.values(DAILY.hist || {}).reduce((a, b) => a + b, 0);
  CAR.xp = advSt * 3 + dSt * 10; CAR.rank = rankOf(CAR.xp);
}
if (CAR.lg == null) CAR.lg = legendOf(CAR.xp);   // joueurs d'avant 1.14.0 : les étoiles déjà méritées ne rapportent rien rétroactivement
const saveCar = () => { try { localStorage.setItem('blocparty.career', JSON.stringify(CAR)); } catch (e) {} };
const toast = m => window.ptToast && window.ptToast(m);
const rankName = r => { const n = t('bp.ranks'); return `${(Array.isArray(n) && n[r >> 1]) || ''} ${r % 2 ? 'II' : 'I'}`; };
const weekKey = (d = new Date()) => { const m = new Date(d); m.setDate(m.getDate() - (m.getDay() + 6) % 7); return dayKey(m); };
const keyDate = k => new Date(Math.floor(k / 10000), Math.floor(k / 100) % 100 - 1, k % 100);
function ensureWeek() {
  const k = weekKey(); if (CAR.week && CAR.week.k === k) return CAR.week;
  // horloge qui recule de peu (voyage vers l'ouest un lundi, heure corrigée) : on garde la semaine en cours — la
  // remplacer effaçait la progression, puis une seconde fois au retour du lundi, et rouvrait des missions déjà payées
  if (CAR.week && k < CAR.week.k && keyDate(CAR.week.k) - keyDate(k) <= 14 * 864e5) return CAR.week;
  // trois missions par semaine, les mêmes pour tout le monde : deux générales, une liée à un mode (Aventure ou défi)
  const r = mulberry32(k * 17 + 3), mix = a => a.map(id => [r(), id]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
  const mode = mix(M_MODE.filter(id => id !== 'ice' || unlockedLvl() > ICE_LVL));
  CAR.week = { k, ids: [...mix(M_GENERAL).slice(0, 2), mode[0]], p: {}, got: {}, chest: 0 };
  saveCar(); return CAR.week;
}
const mDone = id => (CAR.week.p[id] || 0) >= MISSIONS[id][0];
const mText = id => t('bp.m.' + id, { n: num(MISSIONS[id][0]) });
const claimable = () => { const w = ensureWeek(); return w.ids.some(id => mDone(id) && !w.got[id]) || (!w.chest && w.ids.every(id => w.got[id])); };
function paintCarBtn() { const d = $('bp-cardot'); if (d) d.classList.toggle('hidden', !claimable()); }
// progression d'une mission de la semaine (v : quantité, ou valeur atteinte pour combo/score)
function track(id, v = 1) {
  const w = ensureWeek(); if (!w.ids.includes(id) || mDone(id)) return;
  w.p[id] = BEST_OF.has(id) ? Math.max(w.p[id] || 0, v) : (w.p[id] || 0) + v;
  if (mDone(id)) { toast(t('bp.mDone', { m: mText(id) })); paintCarBtn(); }
  saveCar();
}
function stat(k, v = 1, best) { CAR.st[k] = best ? Math.max(CAR.st[k] || 0, v) : (CAR.st[k] || 0) + v; }
// XP de carrière : 1 par ligne, 3 par étoile d'un niveau gagné, 10 par étoile du défi, 30 par mission
function gainXP(n) {
  if (!n) return; CAR.xp += n; S.xpRun = (S.xpRun || 0) + n;
  const r = rankOf(CAR.xp);
  if (r > CAR.rank) {   // un seul message, même si plusieurs grades passent d'un coup
    let g = 0; const ths = [];
    while (CAR.rank < r) { CAR.rank++; g += rankCoins(CAR.rank); const th = THEMES.find(x => x.rank === CAR.rank); if (th) ths.push(t('bp.th.' + th.id)); }
    COINS += g; saveCoins();
    toast(t('bp.rankUp', { rank: rankName(CAR.rank), n: g }) + ths.map(th => ' · ' + t('bp.themeWon', { th })).join(''));
    if (!S.over) S.pops.push({ text: t('bp.rankUpPop'), sub: rankName(CAR.rank), t: -1.2, big: true });
    paintCarBtn();
  }
  const lg = legendOf(CAR.xp);
  if (lg > CAR.lg) {   // un seul message, même si plusieurs étoiles passent d'un coup
    const g = (lg - CAR.lg) * LEGEND_COINS; CAR.lg = lg; COINS += g; saveCoins();
    toast(t('bp.legendUp', { k: lg, n: g }));
    if (!S.over) S.pops.push({ text: '★' + lg, sub: rankName(CAR.rank), t: -1.2, big: true });
  }
  saveCar();
}
// médaille de maîtrise : les 30 étoiles d'un chapitre
function checkMedals() {
  for (let c = 0; c < LEVELS / CHAPTER; c++) {
    if (CAR.medals[c]) continue;
    let st = 0; for (let i = 1; i <= CHAPTER; i++) st += ADV.stars[c * CHAPTER + i] || 0;
    if (st < CHAPTER * 3) continue;
    CAR.medals[c] = 1; COINS += MEDAL_COINS; saveCoins(); saveCar();
    const names = t('bp.chapters'); toast(t('bp.medalGot', { c: (Array.isArray(names) && names[c]) || c + 1, n: MEDAL_COINS }));
  }
}
// jalons à vie (1.14.0) : des paliers lointains sous chaque statistique du Carnet, payés une fois, sans bouton ni vidéo —
// de quoi viser au-delà du dernier grade. Pièces et XP seulement, rien qui se règle contre de l'argent.
const MS_FAM = [['lines', [250, 1500, 6000, 25000], s => s.lines], ['pieces', [800, 5000, 20000, 80000], s => s.pieces], ['games', [10, 60, 250, 1000], s => s.games],
  ['combo', [6, 9, 12, 15], s => s.combo], ['clears', [1, 10, 50, 200], s => s.clears], ['days', [3, 10, 30, 100], s => s.days], ['best', [2500, 8000, 20000, 50000], s => S.best]];
const MS_COINS = [30, 60, 100, 200], MS_XP = [20, 40, 80, 150];
function checkMilestones() {
  if (!CAR.ms) CAR.ms = {};
  let coins = 0, xp = 0, n = 0;
  for (const [id, steps, get] of MS_FAM) {
    const v = get(CAR.st) || 0; let k = CAR.ms[id] || 0;
    while (k < steps.length && v >= steps[k]) { coins += MS_COINS[k]; xp += MS_XP[k]; k++; n++; }
    CAR.ms[id] = k;
  }
  if (!n) return;
  COINS += coins; saveCoins(); saveCar(); toast(t('bp.msGot', { n: coins }));
  gainXP(xp); paintCarBtn();
}
function claimMission(id, mult) {
  const w = ensureWeek(); if (!mDone(id) || w.got[id]) return;
  w.got[id] = mult; COINS += MISSIONS[id][1] * mult; saveCoins(); gainXP(MISSION_XP); saveCar();
  beep(880, 0.2, 'triangle', 0.06); openCareer();
}
function claimChest() {
  const w = ensureWeek(); if (w.chest || !w.ids.every(id => w.got[id])) return;
  w.chest = 1; COINS += WEEK_CHEST; saveCoins(); gainXP(60); saveCar(); SFX.best(); openCareer();
}
const bar = k => `<span class="bp-bar"><i style="width:${Math.round(Math.max(0, Math.min(1, k)) * 100)}%"></i></span>`;
// ligne de grade sous un écran de fin : grade, XP gagnée dans la partie, barre vers le grade suivant
function xpLine() {
  const r = CAR.rank, top = r >= RANK_XP.length - 1, a = RANK_XP[r], b = RANK_XP[Math.min(r + 1, RANK_XP.length - 1)];
  return `${rankBadge(r, 'bp-ins sm')}<b>${rankName(r)}</b>${S.xpRun ? ` · +${num(S.xpRun)} XP` : ''}${top && CAR.lg ? ` ★${CAR.lg}` : ''}${bar(top ? (CAR.xp - TOP_XP) % LEGEND_XP / LEGEND_XP : (CAR.xp - a) / (b - a))}`;
}
function openCareer() {
  const w = ensureWeek(), r = CAR.rank, top = r >= RANK_XP.length - 1, a = RANK_XP[r], b = RANK_XP[Math.min(r + 1, RANK_XP.length - 1)];
  const nth = THEMES.find(x => x.rank === r + 1);
  $('bp-rank').innerHTML = `<div class="bp-rkb">${rankBadge(r)}<b>${r + 1}</b></div><div class="bp-rkt"><b>${rankName(r)}${top && CAR.lg ? ` ★${CAR.lg}` : ''}</b>${bar(top ? (CAR.xp - TOP_XP) % LEGEND_XP / LEGEND_XP : (CAR.xp - a) / (b - a))}<small>${top ? t('bp.rankMax', { xp: num(CAR.xp), x: num((CAR.xp - TOP_XP) % LEGEND_XP), need: num(LEGEND_XP), n: LEGEND_COINS }) : t('bp.rankNext', { xp: num(CAR.xp - a), need: num(b - a), n: rankCoins(r + 1) }) + (nth ? ' · ' + t('bp.th.' + nth.id) : '')}</small></div><span class="bp-coins">🪙 ${num(COINS)}</span>`;
  const left = Math.min(7, Math.max(1, Math.ceil((new Date(Math.floor(w.k / 10000), Math.floor(w.k / 100) % 100 - 1, w.k % 100 + 7) - new Date()) / 864e5)));
  $('bp-weekleft').textContent = t('bp.weekLeft', { n: left });
  const vid = MON.canReward();
  $('bp-missions').innerHTML = w.ids.map(id => {
    const [n, c] = MISSIONS[id], p = Math.min(n, w.p[id] || 0), done = p >= n, got = w.got[id];
    const btns = got ? `<span class="bp-msok">✓ +${c * got} 🪙</span>` : done ? `<button class="btn" data-claim="${id}">+${c} 🪙</button>${vid ? `<button class="btn bp-vid" data-claim2="${id}">${t('bp.claimVid', { n: c * 2 })}</button>` : ''}` : `<small class="bp-msc">+${c} 🪙</small>`;
    return `<div class="bp-ms${done ? ' done' : ''}${got ? ' got' : ''}"><div class="bp-mst"><b>${mText(id)}</b>${bar(p / n)}<small>${num(p)} / ${num(n)}</small></div><div class="bp-msb">${btns}</div></div>`;
  }).join('');
  const all = w.ids.every(id => w.got[id]);
  $('bp-chest').innerHTML = w.chest ? `<span class="bp-msok">✓ ${t('bp.chestGot')}</span>` : all ? `<button class="btn" id="bp-chestbtn">${t('bp.chestOpen', { n: WEEK_CHEST })}</button>` : `<small>${t('bp.chestHint', { n: WEEK_CHEST, k: w.ids.filter(id => w.got[id]).length })}</small>`;
  const names = t('bp.chapters');
  $('bp-medals').innerHTML = Array.from({ length: LEVELS / CHAPTER }, (_, c) => {
    let st = 0; for (let i = 1; i <= CHAPTER; i++) st += ADV.stars[c * CHAPTER + i] || 0;
    return `<span class="bp-md${CAR.medals[c] ? ' on' : ''}" title="${(Array.isArray(names) && names[c]) || ''}">${medalSVG(c, !!CAR.medals[c])}<small>${c + 1}</small><em>${st}/${CHAPTER * 3}</em></span>`;
  }).join('');
  const st = CAR.st, advSt = Object.values(ADV.stars).reduce((x, y) => x + y, 0);
  $('bp-cstats').innerHTML = [[t('bp.cs.lines'), num(st.lines || 0)], [t('bp.cs.pieces'), num(st.pieces || 0)], [t('bp.cs.games'), num(st.games || 0)], [t('bp.cs.combo'), '×' + (st.combo || 0)],
    [t('bp.cs.clears'), num(st.clears || 0)], [t('bp.cs.best'), num(S.best || 0)], [t('bp.cs.stars'), `${advSt}/${LEVELS * 3}`], [t('bp.cs.days'), num(st.days || 0)]]
    .map(([k, v]) => `<div><small>${k}</small><b>${v}</b></div>`).join('');
  $('bp-ms').innerHTML = MS_FAM.map(([id, steps, get]) => {
    const k = (CAR.ms || {})[id] || 0, v = get(st) || 0, done = k >= steps.length, goal = steps[Math.min(k, steps.length - 1)], lo = k ? steps[k - 1] : 0;
    return `<div class="bp-mi${done ? ' done' : ''}"><small>${t('bp.cs.' + id)}</small><b>${done ? '✓ ' + num(steps[steps.length - 1]) : num(Math.min(v, goal)) + ' / ' + num(goal)}</b>${bar(done ? 1 : (v - lo) / (goal - lo))}<em>${'◆'.repeat(k)}${'◇'.repeat(steps.length - k)}</em></div>`;
  }).join('');
  $('bp-career').querySelectorAll('[data-claim]').forEach(e => e.onclick = () => claimMission(e.dataset.claim, 1));
  $('bp-career').querySelectorAll('[data-claim2]').forEach(e => e.onclick = () => MON.reward('mission').then(ok => ok && claimMission(e.dataset.claim2, 2)));
  const cb = $('bp-chestbtn'); if (cb) cb.onclick = claimChest;
  $('bp-career').classList.remove('hidden');
  paintCarBtn();
}
function startDaily(seedDay) {
  clearTimeout(overTimer); clearTimeout(resTimer); S.contN = 0;
  const today = typeof seedDay === 'number' ? seedDay : uKey();   // seedDay : outils de mesure seulement
  S.placed = 0;
  if (DAILY.day !== today) { DAILY.day = today; DAILY.best = 0; saveDaily(); }
  const r = mulberry32(today);
  const board = Array.from({ length: N }, () => Array(N).fill(null));
  for (let k = 0; k < 7; k++) { const x = (r() * N) | 0, y = (r() * N) | 0; board[y][x] = STONE; }
  S.mode = 'daily'; S.dday = today; S.vidCont = false; S.gems = new Set(); S.board = board; S.score = 0; S.shown = 0; S.combo = 0; S.over = false; S.fx = []; S.pops = []; S.clearing = []; freshRun(); tool = null; paintBoost();
  rnd = mulberry32(today * 31 + 7);
  fillTray();
  ['bp-over', 'bp-map', 'bp-res'].forEach(id => $(id).classList.add('hidden'));
  S.pops.push({ text: t('bp.daily'), sub: t('bp.dailyGoals', { a: num(DAILY_GOALS[0]), b: num(DAILY_GOALS[1]), c: num(DAILY_GOALS[2]) }), t: -1.3 });
  S.pops.push({ text: t('bp.daily'), sub: t('bp.dailySub', { date: todayLabel(), n: DAILY.last >= uKey(new Date(Date.now() - 864e5)) ? DAILY.streak + (DAILY.last >= today ? 0 : 1) : 1 }), t: 0 });
  updateHUD();
}

function applyTheme() { $('tab-blocks').style.background = curTheme().bg; $('tab-blocks').dataset.style = curTheme().style; boardSpr = null; }
function openThemes() {
  const box = $('bp-thgrid'); box.innerHTML = '';
  const tr = t;
  for (const th of THEMES) {
    const rlock = th.rank && CAR.rank < th.rank, owned = !rlock && (THEME.owned.includes(th.id) || !!th.rank), cur = THEME.cur === th.id;
    const d = document.createElement('button'); d.className = 'bp-th' + (cur ? ' cur' : '') + ((!owned && COINS < th.cost) || rlock ? ' no' : '');
    d.innerHTML = `<canvas width="200" height="100"></canvas><b>${tr('bp.th.' + th.id)}</b><small>${cur ? tr('bp.equipped') : owned ? tr('bp.equip') : rlock ? rankBadge(th.rank, 'bp-ins sm') + rankName(th.rank) : '🪙 ' + th.cost}</small>`;
    // aperçu : 4 cases dans le style du thème, sur son fond
    const cv = d.querySelector('canvas'), g = cv.getContext('2d'), prev = THEME.cur;
    THEME.cur = th.id; g.fillStyle = '#211d24'; g.fillRect(0, 0, 200, 100); g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 4; g.strokeRect(2, 2, 196, 96);
    [0, 1, 2, 3].forEach(i => cell(18 + i * 42, 30, 40, COLORS[i], 1, g)); THEME.cur = prev;
    d.onclick = () => {
      if (rlock) { beep(180, 0.1, 'square', 0.03); window.ptToast && window.ptToast(t('bp.themeRank', { rank: rankName(th.rank) })); return; }
      if (!owned) { if (COINS < th.cost) { beep(180, 0.1, 'square', 0.03); return; } COINS -= th.cost; saveCoins(); THEME.owned.push(th.id); beep(880, 0.2, 'triangle', 0.06); }
      THEME.cur = th.id; saveTheme(); applyTheme(); openThemes();
    };
    box.appendChild(d);
  }
  paintVidCoins();
  $('bp-thcoins').textContent = num(COINS);
  $('bp-themes').classList.remove('hidden');
}

// ---------- Chrono : 2 minutes, +1,5 s par ligne, points qui valent de plus en plus, top 10 local
const CHRONO_T = 120;
let TOP = [];
try { TOP = JSON.parse(localStorage.getItem('blocparty.chrono') || '[]'); } catch (e) {}
function startChrono() {
  clearTimeout(overTimer); clearTimeout(resTimer);
  S.mode = 'chrono'; rnd = Math.random; S.gems = new Set(); S.clock = CHRONO_T; S.chronoT = 0; S.myRank = -1;
  S.board = Array.from({ length: N }, () => Array(N).fill(null));
  S.score = 0; S.shown = 0; S.combo = 0; S.over = false; S.fx = []; S.pops = []; S.clearing = []; freshRun();
  fillTray();
  ['bp-over', 'bp-map', 'bp-res'].forEach(id => $(id).classList.add('hidden'));
  S.pops.push({ text: t('bp.chrono'), sub: t('bp.chronoSub'), t: 0 });
  updateHUD();
}
function chronoEnd() {
  if (S.over) return;
  S.over = true; S.endWhy = S.clock <= 0.05 ? 'time' : 'stuck'; S.clock = Math.max(0, S.clock);
  const entry = { s: S.score, d: date(new Date(), { day: 'numeric', month: 'short' }), t: Date.now() };
  if (S.score > 0) { TOP.push(entry); TOP.sort((a, b) => b.s - a.s); TOP = TOP.slice(0, 10); }   // un chrono à 0 point n'est pas un record
  S.myRank = TOP.indexOf(entry); track('chrono');
  try { localStorage.setItem('blocparty.chrono', JSON.stringify(TOP)); } catch (e) {}
  updateHUD();
  armOver(400);
}

function openMap() {
  tool = null; paintBoost();
  const dk = uKey();
  $('bp-daily').innerHTML = `${t('bp.dailyBtn')}<small>${todayLabel()}${DAILY.day === dk && DAILY.best ? t('bp.dailyBest', { n: num(DAILY.best) }) : ''}${DAILY.streak > 1 && DAILY.day === dk ? t('bp.dailyStreak', { n: DAILY.streak }) : ''}${DAILY.day === dk && DAILY.best ? ' · ' + '★'.repeat(dailyStars(DAILY.best)) + '☆'.repeat(3 - dailyStars(DAILY.best)) : ''}</small>`;
  paintLb();
  const box = $('bp-levels'); box.innerHTML = '';
  const open = unlockedLvl();
  const names = t('bp.chapters');
  for (let n = 1; n <= LEVELS; n++) {
    if (n % CHAPTER === 1) {   // en-tête de chapitre : nom, étoiles gagnées sur 30
      const c = (n - 1) / CHAPTER, got = Array.from({ length: CHAPTER }, (_, i) => ADV.stars[n + i] || 0).reduce((a, b) => a + b, 0);
      const h = document.createElement('div'); h.className = 'bp-chap' + (n > open ? ' lock' : '') + (n === ICE_LVL ? ' ice' : n === VEIN_LVL ? ' vein' : '');
      h.innerHTML = `<b>${t('bp.chapter', { n: c + 1 })} · ${(Array.isArray(names) && names[c]) || ''}</b><small>${CAR.medals[c] ? medalSVG(c, true, 'bp-mdi sm') : ''}★ ${got}/${CHAPTER * 3}</small>`;
      box.appendChild(h);
    }
    const st = ADV.stars[n] || 0, lock = n > open;
    const b = document.createElement('button');
    b.className = 'bp-lv' + (lock ? ' lock' : '') + (n === open && !st ? ' cur' : '');
    const ty = levelType(n);
    b.dataset.n = n; if (ty === 'ice') b.classList.add('ice'); if (n >= VEIN_LVL) b.classList.add('vein');
    b.innerHTML = `${lock ? '🔒' : n}<small>${st ? '★'.repeat(st) : ty === 'lines' ? t('bp.mapLines') : ty === 'ice' ? '❄' : ty === 'color' ? `<i class="bp-sw" style="background:${tc(genColor(n).goal.color)}"></i>` : '💎'}</small>`;
    if (!lock) b.onclick = () => startLevel(n);
    box.appendChild(b);
  }
  $('bp-map').classList.remove('hidden');
  const cur = box.querySelector(`[data-n="${open}"]`); if (cur) cur.scrollIntoView({ block: 'nearest' });
}

// Efface des cases hors placement (boosters) : gemmes récoltées, sans consommer de coup.
function smash(cells) {
  let hit = 0;
  for (const [x, y] of cells) {
    if (x < 0 || y < 0 || x >= N || y >= N) continue;
    if (!S.board[y][x]) { if (breakIce(x, y)) hit++; continue; }
    const color = S.board[y][x]; hit++;
    if (color === STONE2) { S.board[y][x] = STONEC; for (let k = 0; k < 3; k++) burst(x, y, STONE); continue; }   // les boosters fissurent aussi, sans briser
    S.clearing.push({ x, y, color, t: 0, delay: hit * 0.02 });
    veinCell(color);
    S.board[y][x] = null;
    breakIce(x, y);   // le givre sous le bloc se brise avec lui, comme sous une ligne effacée (il restait sous la masse et la dynamite)
    for (let k = 0; k < 5; k++) burst(x, y, color);
    if (S.gems.delete(y * N + x)) { S.got++; track('gems'); for (let k = 0; k < 10; k++) burst(x, y, '#7ff6ff'); }
  }
  S.shake = 8; beep(120, 0.25, 'sawtooth', 0.05);
  if (S.mode === 'adv' && !S.over && S.goal.type !== 'lines' && goalWon()) advResult(true);
  save(); updateHUD();
  return hit;
}
function useTool(name, gx, gy) {
  const cost = S.freeTool && name === 'hammer' ? 0 : TOOLS[name];
  if (COINS < cost || S.mode === 'daily') return false;
  if (S.mode === 'adv' && (S.toolsUsed || 0) >= ADV_TOOLS) { tip(t('bp.toolLimit', { n: ADV_TOOLS })); tool = null; paintBoost(); return false; }
  if (name === 'shuffle') { S.tray = [null, null, null]; fillTray(); beep(700, 0.15, 'triangle', 0.05); }
  else {
    const cells = name === 'bomb' ? [-1, 0, 1].flatMap(dy => [-1, 0, 1].map(dx => [gx + dx, gy + dy])) : [[gx, gy]];
    if (!smash(cells)) return false;
  }
  COINS -= cost; tool = null; S.freeTool = false; if (S.mode === 'adv') S.toolsUsed = (S.toolsUsed || 0) + 1; saveCoins(); save();
  // toujours bloqué après le booster ? la partie se termine
  if (!S.over && !S.tray.some(t => t && canPlaceAnywhere(t))) {
    if (S.mode === 'adv') advResult(false); else { S.over = true; armOver(600); }
  }
  return true;
}

function linesToClear(board) {
  const rows = [], cols = [];
  for (let y = 0; y < N; y++) if (board[y].every(c => c)) rows.push(y);
  for (let x = 0; x < N; x++) { let full = true; for (let y = 0; y < N; y++) if (!board[y][x]) { full = false; break; } if (full) cols.push(x); }
  return { rows, cols };
}

function place(idx, gx, gy) {
  tutoDone(); S.placed = (S.placed || 0) + 1; S.pieces = (S.pieces || 0) + 1; stat('pieces'); track('pieces');
  if (S.mode === 'daily') dailyPlayed();
  window.ptEvent && window.ptEvent('bp_pieces', 1);
  const p = S.tray[idx];
  for (const [x, y] of p.cells) { S.board[gy + y][gx + x] = p.color; S.placedAnim.push({ x: gx + x, y: gy + y, t: 0 }); }
  S.tray[idx] = null;
  let gained = p.cells.length;
  const { rows, cols } = linesToClear(S.board);
  const n = rows.length + cols.length;
  if (n > 0) {
    S.combo++; S.miss = 0;
    if (S.combo === 1 && !TIPS.combo) { TIPS.combo = 1; saveTips(); tip(t('bp.tipCombo'), t('bp.tipComboSub'), 1.2, 3.6, true); } S.maxCombo = Math.max(S.maxCombo || 0, S.combo); S.lines = (S.lines || 0) + n; window.ptEvent && window.ptEvent('bp_lines', n);
    if (S.mode !== 'adv') { COINS += n; saveCoins(); }
    const cells = new Map();
    rows.forEach(y => { for (let x = 0; x < N; x++) cells.set(y * N + x, [x, y]); });
    cols.forEach(x => { for (let y = 0; y < N; y++) cells.set(y * N + x, [x, y]); });
    const lineScore = 10 * n * (n + 1) / 2 * N / 8;
    const bonus = Math.round(lineScore * (1 + (S.combo - 1) * 0.5) * (S.mode === 'chrono' ? 1 + S.chronoT / 60 : 1));
    if (S.mode === 'chrono') { S.clock += 1.5 * n; updateHUD(); }
    gained += bonus;
    for (const [x, y] of cells.values()) {
      const color = S.board[y][x];
      if (color === STONE2) { S.board[y][x] = STONEC; S.placedAnim.push({ x, y, t: 0 }); for (let k = 0; k < 3; k++) burst(x, y, STONE); continue; }
      S.clearing.push({ x, y, color, t: 0, delay: (Math.abs(x - gx) + Math.abs(y - gy)) * 0.025 });
      veinCell(color);
      S.board[y][x] = null;
      breakIce(x, y);
      for (let k = 0, nb = curTheme().style === 'stone' ? 1 + Math.min(3, S.combo >> 1) : 4 + Math.min(6, S.combo); k < nb; k++) burst(x, y, color);
      if (S.gems.delete(y * N + x)) { S.got++; track('gems'); for (let k = 0; k < 10; k++) burst(x, y, '#7ff6ff'); setTimeout(() => SFX.gem(S.got), 80); }
    }
    const allClear = S.board.every(r => r.every(c => !c));
    if (allClear) gained += 300;
    const label = allClear ? t('bp.allClear') + (S.combo > 1 ? '  ' + t('bp.combo', { n: S.combo }) : '') : (t('bp.praise')[Math.min(n, 5)] || '') + (S.combo > 1 ? '  ' + t('bp.combo', { n: S.combo }) : '');
    S.pops.length = 0;   // un seul message à la fois : les éloges successifs ne se superposent plus
    S.pops.push({ text: label, sub: '+' + (gained), t: 0, big: n >= 3 || allClear || S.combo >= 5 });
    stat('lines', n); stat('combo', S.combo, 1); track('lines', n); track('combo', S.combo); if (n >= 3) track('multi'); if (allClear) { stat('clears'); track('clear'); } gainXP(n);   // Carnet
    // le moment fort : faisceau sur chaque ligne, arrêt sur image, puis paliers (cadre, onde, éclair)
    rows.forEach(y => S.beams.push({ row: y, t: 0, color: tc(p.color) })); cols.forEach(x => S.beams.push({ col: x, t: 0, color: tc(p.color) }));
    if (n >= 2) { S.hit = Math.min(0.12, 0.05 + 0.025 * (n - 2)); S.glow = 1; S.glowColor = tc(p.color); }
    if ((n >= 3 || allClear) && !calm()) S.rings.push({ x: L.bx + (gx + p.w / 2) * L.cs, y: L.by + (gy + p.h / 2) * L.cs, t: 0 });
    if ((n >= 4 || allClear || S.combo >= 5) && !calm()) S.flash = 1;
    let fx = 0, fy = 0; for (const [x, y] of cells.values()) { fx += x; fy += y; } fx /= cells.size; fy /= cells.size;
    S.flyers.push({ x: L.bx + (fx + 0.5) * L.cs, y: L.by + (fy + 0.5) * L.cs, v: gained, t: 0 });
    S.shake = calm() ? 0 : Math.min(14, 3 + n * 3);
    SFX.clear(n, S.combo);
    buzz(n >= 3 ? [30, 40, 60] : 20 * n);
  } else {
    // le combo survit à deux poses sans ligne : il tombe à la troisième (règle du genre, Block Blast compris)
    if (S.combo > 0 && ++S.miss >= 3) { S.combo = 0; S.miss = 0; SFX.lost(); }
    SFX.thock();
  }
  S.score += gained; if (S.mode === 'classic') track('score', S.score); saveCar();
  if (!TIPS.grey && S.tray.some(q => q && !canPlaceAnywhere(q)) && S.tray.some(q => q && canPlaceAnywhere(q))) { TIPS.grey = 1; saveTips(); tip(t('bp.tipGrey'), t('bp.tipGreySub'), n ? 1.2 : 0, 4.5, true); }
  if (S.tray.every(t => !t)) fillTray();
  if (S.mode === 'adv') {
    S.moves--; S.used = (S.used || 0) + 1;
    const win = goalWon();
    if (win) advResult(true);
    else if (S.moves <= 0) advResult(false);
    else if (!S.tray.some(t => t && canPlaceAnywhere(t))) {
      // Filet de sécurité : un nouveau tirage offert par niveau, puis c'est perdu.
      if (S.rescue > 0) { S.rescue--; rescueTray(); S.pops.push({ text: t('bp.newPieces'), sub: t('bp.newPiecesSub'), t: n ? -1.1 : 0 }); beep(880, 0.15, 'triangle', 0.05); }
      if (!S.tray.some(t => t && canPlaceAnywhere(t))) advResult(false);
    }
    updateHUD(); return;
  }
  if (S.mode === 'chrono') {
    if (!S.tray.some(t => t && canPlaceAnywhere(t))) {   // bloqué : nouvelles pièces contre 5 s
      S.tray = [null, null, null]; fillTray(); S.clock -= 5;
      S.pops.length = 0; S.pops.push({ text: t('bp.newPiecesChrono'), sub: '−5 s', t: 0 }); beep(300, 0.2, 'square', 0.04);
      if (!S.tray.some(t => t && canPlaceAnywhere(t))) chronoEnd();
    }
    updateHUD(); return;
  }
  if (S.mode === 'daily') { if (S.score > DAILY.best) { const st0 = dailyStars(DAILY.best); DAILY.best = S.score; dailyRecord(); const st = dailyStars(DAILY.best); if (st > st0) { S.pops.push({ text: '★'.repeat(st) + '☆'.repeat(3 - st), sub: t('bp.starGot', { n: st }), t: n ? -1.0 : 0, big: true }); setTimeout(SFX.best, n ? 900 : 0); } } }
  else if (S.score > S.best) {
    S.best = S.score;
    // record battu en pleine partie : bandeau, fanfare et confettis, une seule fois
    if (!S.beat && S.bestStart > 0) { S.beat = true; S.pops.push({ text: t('bp.newBestRun'), sub: t('bp.newBestSub', { n: num(S.bestStart) }), t: n ? -1.0 : 0, big: true }); setTimeout(SFX.best, n ? 900 : 0); confetti(); }
  }
  if (!S.tray.some(t => t && canPlaceAnywhere(t))) {
    S.over = true;
    armOver(600);
  }
  save(); updateHUD();
}

const armOver = ms => { clearTimeout(overTimer); S.endAnim = { t: 0 }; setTimeout(() => { if (S.endAnim) { SFX.fail(); S.shake = calm() ? 0 : 6; buzz(80); } }, 450); overTimer = setTimeout(gameOver, Math.max(ms, 1300)); };
function gameOver() {
  S.over = true;
  countUp($('bp-final'), S.score);
  $('bp-stats').textContent = t('bp.stats', { lines: num(S.lines || 0), combo: S.maxCombo || 0, pieces: num(S.pieces || 0), lc: S.lines || 0, pc: S.pieces || 0 });
  $('bp-overtitle').textContent = S.mode === 'chrono' && S.endWhy === 'time' ? t('bp.timeUp') : t('bp.overTitle');
  const top = $('bp-top10'); top.classList.toggle('hidden', S.mode !== 'chrono');
  if (S.mode === 'chrono') {
    $('bp-newbest').textContent = S.myRank === 0 ? t('bp.bestChrono') : S.myRank > 0 ? t('bp.rank', { n: S.myRank + 1 }) : S.score ? t('bp.outTop') : t('bp.noPoints');
    top.innerHTML = TOP.map((e, i) => `<li class="${i === S.myRank ? 'me' : ''}">${num(e.s)} <span class="muted">· ${e.d}</span></li>`).join('');
  } else if (S.mode === 'daily') $('bp-newbest').textContent = t('bp.dailyEnd', { date: todayLabel(), best: num(DAILY.best), n: DAILY.streak });
  const dl = S.mode === 'daily', ds = dailyStars(DAILY.best);
  $('bp-dstars').classList.toggle('hidden', !dl); $('bp-cal').classList.toggle('hidden', !dl); $('bp-share').classList.toggle('hidden', !dl || !(navigator.share || navigator.clipboard));
  if (dl) { $('bp-dstars').innerHTML = [1, 2, 3].map(k => k <= ds ? '★' : '<i>★</i>').join(''); $('bp-cal').innerHTML = calendarHTML(); }
  else $('bp-newbest').textContent = S.score >= S.best && S.score > 0 ? t('bp.newRecord') : S.score > 0 && S.best - S.score <= S.best * 0.15 ? t('bp.nearBest', { n: num(S.best - S.score) }) : t('bp.record', { n: num(S.best) });
  $('bp-cont').classList.toggle('hidden', COINS < contCost() || S.mode === 'chrono' || (S.mode === 'daily' && dailyContUsed()));
  $('bp-cont').textContent = t('bp.contBooster', { n: contCost() });
  $('bp-vidcont').classList.toggle('hidden', S.mode === 'chrono' || S.vidCont || !MON.canReward());
  if (!S.counted) { S.counted = true; stat('games'); } saveCar(); checkMilestones(); $('bp-xpo').innerHTML = xpLine(); paintCarBtn();
  $('bp-dnext').classList.toggle('hidden', !dl); if (dl) $('bp-dnext').textContent = t('bp.dailyNext', { t: nextDaily() });
  // classements : le défi seulement pour la graine du jour UTC en cours (une partie commencée avant minuit UTC n'y entre pas)
  if (S.mode === 'daily') LB.submit('daily', S.score, S.dday); else if (S.mode === 'classic' || S.mode === 'chrono') LB.submit(S.mode, S.score);
  paintLb();
  $('bp-over').classList.remove('hidden');
}
// boutons « Classement » : écran de fin (le classement du mode), carte des modes (défi du jour, tous les classements)
const lbBoard = () => ({ daily: 'daily', classic: 'classic', chrono: 'chrono' })[S.mode] || null;
function paintLb() {
  const ok = LB.ok();
  $('bp-lbover').classList.toggle('hidden', !ok || !lbBoard());
  $('bp-lbdaily').classList.toggle('hidden', !ok); $('bp-lball').classList.toggle('hidden', !ok);
}
// premier contact avec le service : les records déjà faits avant (ou hors ligne) partent aussi, la plateforme garde le meilleur
let lbSynced = false;
function lbSync() {
  paintLb();
  if (lbSynced || !LB.ok()) return;
  lbSynced = true;
  LB.submit('classic', S.best); if (TOP[0]) LB.submit('chrono', TOP[0].s);
  if (DAILY.day === uKey() && DAILY.best) LB.submit('daily', DAILY.best, DAILY.day);
}
window.addEventListener('pt-scores', lbSync);
function countUp(el, v) {
  const t0 = performance.now(), D = 800;
  const step = () => { const k = Math.min(1, (performance.now() - t0) / D), e = 1 - Math.pow(1 - k, 3); el.textContent = num(Math.round(v * e)); if (k < 1) requestAnimationFrame(step); };
  step();
}
function confetti() {
  for (let i = 0, nb = calm() ? 16 : 70; i < nb; i++) S.fx.push({ x: W / 2 + (Math.random() - 0.5) * L.bs, y: L.by - 10, vx: (Math.random() - 0.5) * 7, vy: -Math.random() * 9 - 2, s: L.cs * (0.1 + Math.random() * 0.12), color: (curTheme().style === 'stone' ? ['#ffd24d', '#f0b23a', '#fff1c2', '#e8d3b0', '#d9822b'] : ['#ffd24d', '#ff5d8f', '#4dd4ff', '#7cff8a', '#fff'])[i % 5], life: 1.6, rot: Math.random() * 6, conf: 1 });
}

function burst(gx, gy, color) {
  const cx = L.bx + (gx + 0.5) * L.cs, cy = L.by + (gy + 0.5) * L.cs;
  S.fx.push({ x: cx, y: cy, vx: (Math.random() - 0.5) * 9, vy: (Math.random() - 0.9) * 9, s: L.cs * (0.15 + Math.random() * 0.2), color: tc(color), life: 1, rot: Math.random() * 6, chip: Math.random() * 3 | 0 });
  if (Math.random() < 0.12) S.fx.push({ x: cx, y: cy, vx: (Math.random() - 0.5) * 2, vy: -Math.random() * 1.5, s: L.cs * 0.35, color: 'rgba(210,190,160,1)', life: 0.8, rot: 0, puff: 1 });
}

function updateHUD() {
  const adv = S.mode === 'adv', daily = S.mode === 'daily';
  $('bp-l1').textContent = adv ? t('bp.hudLevel', { n: S.lvl }) : daily ? t('bp.hudDaily') : t('bp.score');
  $('bp-l2').textContent = adv ? t('bp.hudGoal') : daily ? t('bp.hudDailyBest') : t('bp.best');
  if (daily) { $('bp-best').textContent = num(DAILY.best); return; }
  if (S.mode === 'chrono') {
    const c = Math.max(0, Math.ceil(S.clock));
    $('bp-l1').textContent = t('bp.hudTime');
    $('bp-score').textContent = `${Math.floor(c / 60)}:${String(c % 60).padStart(2, '0')}`;
    $('bp-score').classList.toggle('urgent', c <= 10 && !S.over);
    $('bp-l2').textContent = TOP[0] ? t('bp.hudScoreRec', { n: num(TOP[0].s) }) : t('bp.score');
    $('bp-best').textContent = num(S.score); return;
  }
  if (adv) {
    $('bp-score').textContent = S.moves;
    $('bp-best')[S.goal.type === 'color' ? 'innerHTML' : 'textContent'] = S.goal.type === 'color' ? `<i class="bp-sw" style="background:${tc(S.goal.color)}"></i>${Math.min(S.vein, S.goal.need)}/${S.goal.need}` : S.goal.type === 'gems' ? `💎 ${S.got}/${S.goal.gems}` : S.goal.type === 'ice' ? `❄ ${S.broke}/${S.goal.ice}` : `▤ ${Math.min(S.lines, S.goal.target)}/${S.goal.target}`;
  } else $('bp-best').textContent = num(Math.max(S.bestStart || 0, Math.round(S.shown)));
}

// ---------- layout ----------
function resize() {
  const r = canvas.getBoundingClientRect();
  if (!r.width) return;
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = r.width; H = r.height;
  canvas.width = W * DPR; canvas.height = H * DPR;
  // hauteur utile : bandeau (combo, record) + cadre + grille + plateau de pièces ; le tout centré verticalement
  const land = W > H * 0.9, trayR = land ? 0.4 : 0.5;   // écran large : pièces du plateau un peu plus petites, grille plus grande
  const size = Math.min(W - 24, (H - 12) / (1.14 + trayR), 520);
  L.cs = size / N; L.bs = size; L.band = L.cs * 0.62; L.fr = L.cs * 0.26;
  const used = L.band + L.fr + size + L.fr + size * trayR;
  L.bx = (W - size) / 2; L.by = Math.max(6, (H - used) / 2) + L.band + L.fr;
  L.trayY = L.by + size + L.fr + L.cs * 0.25;
  L.trayH = H - L.trayY;
  L.slotW = size / 3;
  L.mini = Math.min(L.cs * (land ? 0.62 : 0.8), (L.trayH - 10) / 5.2);
  boardSpr = null;
}

const pieceScale = (p, r) => Math.min(L.mini, r.w * 0.9 / p.w);
function slotRect(i) {
  return { x: L.bx + i * L.slotW, y: L.trayY, w: L.slotW, h: Math.min(L.trayH, L.mini * 5.4) };
}

// ---------- drawing ----------
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); }
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return `rgb(${r},${g},${b})`;
}
// pierre dure intacte : renforts (bord épais et rivets) ; une fois touchée, elle se fissure
function armor(x, y, s) {
  ctx.save(); ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = s * 0.09; rr(x + s * 0.12, y + s * 0.12, s * 0.76, s * 0.76, s * 0.16); ctx.stroke();
  ctx.fillStyle = 'rgba(220,225,255,.55)'; for (const [a, b] of [[0.27, 0.27], [0.73, 0.27], [0.27, 0.73], [0.73, 0.73]]) { ctx.beginPath(); ctx.arc(x + s * a, y + s * b, s * 0.05, 0, 7); ctx.fill(); }
  ctx.restore();
}
function cracks(x, y, s) {
  ctx.save(); ctx.strokeStyle = 'rgba(210,215,255,.55)'; ctx.lineWidth = Math.max(1.5, s * 0.05); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x + s * 0.24, y + s * 0.26); ctx.lineTo(x + s * 0.5, y + s * 0.5); ctx.lineTo(x + s * 0.42, y + s * 0.76);
  ctx.moveTo(x + s * 0.5, y + s * 0.5); ctx.lineTo(x + s * 0.78, y + s * 0.36); ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = s * 0.07; rr(x + s * 0.1, y + s * 0.1, s * 0.8, s * 0.8, s * 0.16); ctx.stroke(); ctx.restore();
}
// Minéral taillé : table polie, biseau clair en haut à gauche et sombre en bas à droite, veines propres à chaque couleur.
// Dessiné une fois par couleur et par taille (paliers de 6 px), puis recopié : 64 cases par image restent bon marché.
const SPR = new Map();
let boardSpr = null;
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619); return h >>> 0; }
function stoneSprite(color, s) {
  const key = color + s; let c = SPR.get(key); if (c) return c;
  if (SPR.size > 260) SPR.clear();
  const d = Math.min(2, window.devicePixelRatio || 1); c = document.createElement('canvas'); c.width = c.height = Math.ceil(s * d);
  const g = c.getContext('2d'); g.scale(d, d);
  const p = s * 0.045, b = s * 0.13, r = s * 0.12, x0 = p, y0 = p, x1 = s - p, y1 = s - p;
  const box = (x, y, w, h, rad) => { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, rad) : g.rect(x, y, w, h); };
  box(x0, y0, x1 - x0, y1 - y0, r); g.save(); g.clip();
  const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, shade(color, 38)); gr.addColorStop(1, shade(color, -70)); g.fillStyle = gr; g.fillRect(0, 0, s, s);
  g.fillStyle = 'rgba(255,255,255,.30)'; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y0); g.lineTo(x1 - b, y0 + b); g.lineTo(x0 + b, y0 + b); g.lineTo(x0 + b, y1 - b); g.lineTo(x0, y1); g.closePath(); g.fill();
  g.fillStyle = 'rgba(0,0,0,.32)'; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x0, y1); g.lineTo(x0 + b, y1 - b); g.lineTo(x1 - b, y1 - b); g.lineTo(x1 - b, y0 + b); g.lineTo(x1, y0); g.closePath(); g.fill();
  const tg = g.createLinearGradient(x0 + b, y0 + b, x1 - b, y1 - b); tg.addColorStop(0, shade(color, 18)); tg.addColorStop(1, shade(color, -28));
  g.fillStyle = tg; g.fillRect(x0 + b, y0 + b, x1 - x0 - 2 * b, y1 - y0 - 2 * b);
  // veines et grain : même dessin pour une couleur donnée, d'une partie à l'autre
  let h = hash(color); const rn = () => ((h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0) / 4294967296);
  g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = Math.max(1, s * 0.025); g.lineCap = 'round';
  for (let k = 0; k < 2; k++) { g.beginPath(); g.moveTo(x0 + b, y0 + b + rn() * s * 0.6); g.bezierCurveTo(s * 0.4, rn() * s, s * 0.6, rn() * s, x1 - b, y0 + b + rn() * s * 0.6); g.stroke(); }
  g.fillStyle = 'rgba(0,0,0,.18)'; for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(x0 + b + rn() * (s - 2 * b - 2 * p), y0 + b + rn() * (s - 2 * b - 2 * p), s * 0.018 + rn() * s * 0.02, 0, 7); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.moveTo(x0 + b * 1.4, y0 + b * 1.3); g.lineTo(x0 + b * 3.2, y0 + b * 1.3); g.lineTo(x0 + b * 1.4, y0 + b * 2.6); g.closePath(); g.fill();
  g.restore();
  g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 1; box(x0 + 0.5, y0 + 0.5, x1 - x0 - 1, y1 - y0 - 1, r); g.stroke();
  SPR.set(key, c); return c;
}
function cell(x, y, s, color, alpha = 1, c2 = ctx) {
  color = tc(color);
  const style = curTheme().style, p = s * 0.06, r = s * 0.18;
  const X = c2 === ctx ? ctx : c2;
  if (style === 'stone' && s > 1) { X.globalAlpha = alpha; X.drawImage(stoneSprite(color, Math.max(6, Math.ceil(s / 6) * 6)), x, y, s, s); X.globalAlpha = 1; return; }
  X.globalAlpha = alpha;
  const box = (xx, yy, w, h, rad) => { X.beginPath(); X.roundRect ? X.roundRect(xx, yy, w, h, rad) : X.rect(xx, yy, w, h); };
  if (style === 'neon') {
    X.fillStyle = shade(color, -150); box(x + p, y + p, s - 2 * p, s - 2 * p, r); X.fill();
    X.strokeStyle = color; X.lineWidth = Math.max(2, s * 0.08); X.shadowColor = color; X.shadowBlur = s * 0.35; box(x + p * 1.6, y + p * 1.6, s - 3.2 * p, s - 3.2 * p, r * 0.8); X.stroke(); X.shadowBlur = 0;
  } else if (style === 'pixel') {
    const q = Math.max(2, Math.round(s / 8));
    X.fillStyle = shade(color, -70); X.fillRect(x + p, y + p, s - 2 * p, s - 2 * p);
    X.fillStyle = color; X.fillRect(x + p, y + p, s - 2 * p - q, s - 2 * p - q);
    X.fillStyle = 'rgba(255,255,255,.55)'; X.fillRect(x + p + q, y + p + q, q * 2, q);
  } else if (style === 'soft') {
    X.fillStyle = color; box(x + p, y + p, s - 2 * p, s - 2 * p, s * 0.32); X.fill();
    X.fillStyle = 'rgba(255,255,255,.45)'; X.beginPath(); X.arc(x + s * 0.33, y + s * 0.32, s * 0.1, 0, 7); X.fill();
  } else if (style === 'gem') {
    const m = s / 2;
    X.fillStyle = shade(color, -90); X.fillRect(x + p, y + p, s - 2 * p, s - 2 * p);
    X.fillStyle = color; X.beginPath(); X.moveTo(x + m, y + p * 2); X.lineTo(x + s - p * 2, y + m); X.lineTo(x + m, y + s - p * 2); X.lineTo(x + p * 2, y + m); X.closePath(); X.fill();
    X.fillStyle = 'rgba(255,255,255,.5)'; X.beginPath(); X.moveTo(x + m, y + p * 2); X.lineTo(x + s * 0.7, y + m * 0.9); X.lineTo(x + m, y + m); X.closePath(); X.fill();
  } else {
    X.fillStyle = shade(color, -60); box(x + p, y + p + s * 0.05, s - 2 * p, s - 2 * p, r); X.fill();
    X.fillStyle = color; box(x + p, y + p, s - 2 * p, s - 2 * p - s * 0.05, r); X.fill();
    X.fillStyle = 'rgba(255,255,255,.35)'; box(x + s * 0.2, y + s * 0.14, s * 0.6, s * 0.14, s * 0.07); X.fill();
  }
  X.globalAlpha = 1;
}

function gem(cx, cy, r) {
  const k = 1 + Math.sin(performance.now() / 260 + cx) * 0.06;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k);
  ctx.fillStyle = '#27e0ff'; ctx.shadowColor = '#7ff6ff'; ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r * 0.85, -r * 0.2); ctx.lineTo(0, r); ctx.lineTo(-r * 0.85, -r * 0.2); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,255,255,.7)';
  ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r * 0.35, -r * 0.2); ctx.lineTo(-r * 0.35, -r * 0.2); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// plaque de givre : glace bleutée, reflet en biais et fêlures propres à la case ; sur une case occupée, seul un
// liseré givré reste visible (la plaque est toujours là, sous le bloc)
function frost(x, y, s, seed, under) {
  const r = mulberry32(seed * 97 + 5), p = s * 0.07;
  ctx.save();
  if (!under) {
    const g = ctx.createLinearGradient(x, y, x + s, y + s);
    g.addColorStop(0, 'rgba(220,248,255,.62)'); g.addColorStop(0.55, 'rgba(150,215,240,.42)'); g.addColorStop(1, 'rgba(110,180,220,.5)');
    ctx.fillStyle = g; rr(x + p, y + p, s - 2 * p, s - 2 * p, s * 0.12); ctx.fill();
    ctx.save(); rr(x + p, y + p, s - 2 * p, s - 2 * p, s * 0.12); ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.moveTo(x + s * 0.18, y + s); ctx.lineTo(x + s * 0.42, y + s); ctx.lineTo(x + s * 0.95, y); ctx.lineTo(x + s * 0.72, y); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = Math.max(1, s * 0.025);
    const cx = x + s * (0.3 + r() * 0.4), cy = y + s * (0.3 + r() * 0.4);
    for (let k = 0; k < 3; k++) { const a = r() * 6.28, l = s * (0.25 + r() * 0.3); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * l * 0.5 + (r() - 0.5) * s * 0.1, cy + Math.sin(a) * l * 0.5); ctx.lineTo(cx + Math.cos(a) * l, cy + Math.sin(a) * l); ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = 'rgba(235,252,255,.85)'; ctx.lineWidth = Math.max(1.5, s * 0.04); rr(x + p, y + p, s - 2 * p, s - 2 * p, s * 0.12); ctx.stroke();
  } else {
    ctx.strokeStyle = 'rgba(215,248,255,.9)'; ctx.lineWidth = Math.max(1.5, s * 0.05); ctx.setLineDash([s * 0.16, s * 0.08]);
    rr(x + p * 0.6, y + p * 0.6, s - 1.2 * p, s - 1.2 * p, s * 0.14); ctx.stroke();
    ctx.setLineDash([]); ctx.fillStyle = 'rgba(225,250,255,.9)';
    const q = s * 0.16; ctx.beginPath(); ctx.moveTo(x + p, y + p + q); ctx.lineTo(x + p, y + p); ctx.lineTo(x + p + q, y + p); ctx.fill();
  }
  ctx.restore();
}
function ghostTarget() {
  const d = S.drag; if (!d) return null;
  const p = S.tray[d.idx];
  const gx = Math.round((d.x - d.ox - L.bx) / L.cs), gy = Math.round((d.y - d.oy - L.by) / L.cs);
  return fits(p, gx, gy) ? { gx, gy } : null;
}

let last = 0, running = false;
function frame(t) {
  if (!running) return;
  const dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t;
  draw(dt);
  requestAnimationFrame(frame);
}

// pierre qui éclate (thèmes de pierre) : d'abord la fente (un point d'impact, quatre fissures claires), puis quatre
// éclats triangulaires qui partent du point d'impact, tournent et tombent ; chaque case a son propre point d'impact
function shatter(c, k) {
  const s = L.cs, x0 = L.bx + c.x * s, y0 = L.by + c.y * s, r = mulberry32((c.x * 31 + c.y * 17 + 3) * 2654435761);
  const px = s * (0.35 + r() * 0.3), py = s * (0.35 + r() * 0.3);
  const C = [[0, 0], [s, 0], [s, s], [0, s]], SPLIT = 0.22;
  if (k < SPLIT) {
    cell(x0, y0, s, c.color, 1);
    const q = k / SPLIT;
    ctx.save(); ctx.strokeStyle = `rgba(255,244,220,${0.5 + 0.5 * q})`; ctx.lineWidth = Math.max(1.2, s * 0.045); ctx.lineCap = 'round'; ctx.beginPath();
    for (const [cx, cy] of C) { ctx.moveTo(x0 + px, y0 + py); ctx.lineTo(x0 + px + (cx - px) * (0.35 + 0.65 * q), y0 + py + (cy - py) * (0.35 + 0.65 * q)); }
    ctx.stroke(); ctx.restore(); return;
  }
  const q = (k - SPLIT) / (1 - SPLIT), spr = stoneSprite(tc(c.color), Math.max(6, Math.ceil(s / 6) * 6));
  for (let i = 0; i < 4; i++) {
    const [ax, ay] = C[i], [bx, by] = C[(i + 1) % 4], gx = (px + ax + bx) / 3, gy = (py + ay + by) / 3;
    const dx = gx - px, dy = gy - py, d = Math.hypot(dx, dy) || 1, sp = s * (0.55 + r() * 0.35);
    const ox = dx / d * sp * q, oy = dy / d * sp * q + s * 1.1 * q * q, rot = (i % 2 ? 1 : -1) * (0.6 + r() * 0.8) * q;
    ctx.save(); ctx.globalAlpha = q < 0.65 ? 1 : Math.max(0, 1 - (q - 0.65) / 0.35);
    ctx.translate(x0 + gx + ox, y0 + gy + oy); ctx.rotate(rot); ctx.translate(-gx, -gy);
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ax, ay); ctx.lineTo(bx, by); ctx.closePath(); ctx.clip();
    ctx.drawImage(spr, 0, 0, s, s);
    ctx.strokeStyle = 'rgba(20,10,5,.55)'; ctx.lineWidth = Math.max(1.5, s * 0.05); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ax, ay); ctx.strokeStyle = 'rgba(255,240,210,.35)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();
  }
}
// une fenêtre ouverte (carte, thèmes, profil, confirmation…) met le Chrono en pause
const overlayOpen = () => !!document.querySelector('#tab-blocks .overlay:not(.hidden), #pt-profile:not(.hidden), #pt-modal:not(.hidden), #bq-settings:not(.hidden), #pt-lb:not(.hidden)');   // pt-lb : classement Steam (version PC)   // bq-settings : réglages de l'appli (le Chrono continuait de tourner dessous)
function draw(dt) {
  if (S.hit > 0) { S.hit -= dt; dt *= 0.12; }
  if (S.mode === 'chrono' && !S.over && !overlayOpen()) {
    S.clock -= dt; S.chronoT += dt;
    if (Math.ceil(S.clock) !== S.lastSec) { S.lastSec = Math.ceil(S.clock); updateHUD(); if (S.clock < 10 && S.clock > 0) beep(900, 0.04, 'square', 0.02); }
    if (S.clock <= 0) chronoEnd();
  }
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, W, H);
  S.shown += (S.score - S.shown) * Math.min(1, dt * 10);
  if (Math.abs(S.score - S.shown) < 0.5) S.shown = S.score;
  if (S.mode !== 'adv' && S.mode !== 'chrono') { $('bp-score').textContent = num(S.shown); if (S.mode === 'classic') $('bp-best').textContent = num(Math.max(S.bestStart || 0, Math.round(S.shown))); }
  if (S.mode !== 'chrono') $('bp-score').classList.remove('urgent');

  let sx = 0, sy = 0;
  if (S.shake > 0 && calm()) S.shake = 0;
  if (S.shake > 0) { sx = (Math.random() - 0.5) * S.shake; sy = (Math.random() - 0.5) * S.shake; S.shake = Math.max(0, S.shake - dt * 40); }
  ctx.save(); ctx.translate(sx, sy);

  // plateau
  const stone = curTheme().style === 'stone';
  if (stone) drawDust(dt, false);
  if (stone) { const b = slab(); ctx.drawImage(b, L.bx - L.fr - 6, L.by - L.fr - 6, b.width / DPR, b.height / DPR); }
  else {
    ctx.fillStyle = 'rgba(8,6,28,.55)'; rr(L.bx - 8, L.by - 8, L.bs + 16, L.bs + 16, 16); ctx.fill();
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      ctx.fillStyle = (x + y) % 2 ? 'rgba(255,255,255,.045)' : 'rgba(255,255,255,.07)';
      rr(L.bx + x * L.cs + 2, L.by + y * L.cs + 2, L.cs - 4, L.cs - 4, L.cs * 0.15); ctx.fill();
    }
  }
  // lueur du cadre après un effacement de 2 lignes ou plus
  if (S.glow > 0) { ctx.save(); ctx.globalAlpha = S.glow; ctx.strokeStyle = S.glowColor || '#ffd24d'; ctx.lineWidth = L.fr * 0.5; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 24; rr(L.bx - L.fr * 0.5, L.by - L.fr * 0.5, L.bs + L.fr, L.bs + L.fr, L.fr); ctx.stroke(); ctx.restore(); S.glow = Math.max(0, S.glow - dt * 1.6); }

  // prévisualisation + lignes qui vont sauter
  const g = ghostTarget();
  let hl = null;
  if (g) {
    const p = S.tray[S.drag.idx];
    const b = S.board.map(r => r.slice());
    for (const [x, y] of p.cells) b[g.gy + y][g.gx + x] = p.color;
    hl = linesToClear(b); hl.color = p.color;
    for (const [x, y] of p.cells) cell(L.bx + (g.gx + x) * L.cs, L.by + (g.gy + y) * L.cs, L.cs, p.color, 0.42);
    ctx.save(); ctx.strokeStyle = 'rgba(255,245,220,.75)'; ctx.lineWidth = 2; ctx.setLineDash([L.cs * 0.18, L.cs * 0.1]);
    for (const [x, y] of p.cells) { rr(L.bx + (g.gx + x) * L.cs + 3, L.by + (g.gy + y) * L.cs + 3, L.cs - 6, L.cs - 6, L.cs * 0.12); ctx.stroke(); }
    ctx.restore();
    const k = g.gx + ',' + g.gy; if (S.drag.snap !== k) { S.drag.snap = k; SFX.snap(); }
  } else if (S.drag && S.tray[S.drag.idx]) {
    const p = S.tray[S.drag.idx], gx = Math.round((S.drag.x - S.drag.ox - L.bx) / L.cs), gy = Math.round((S.drag.y - S.drag.oy - L.by) / L.cs);
    if (gx > -p.w && gy > -p.h && gx < N && gy < N) {
      ctx.save(); ctx.strokeStyle = 'rgba(255,80,90,.7)'; ctx.lineWidth = 2;
      for (const [x, y] of p.cells) { const X = gx + x, Y = gy + y; if (X >= 0 && Y >= 0 && X < N && Y < N) { rr(L.bx + X * L.cs + 4, L.by + Y * L.cs + 4, L.cs - 8, L.cs - 8, L.cs * 0.12); ctx.stroke(); } }
      ctx.restore();
    }
    S.drag.snap = null;
  }

  if (S.ice.size) for (const i of S.ice) { const x = i % N, y = (i / N) | 0; if (!S.board[y][x]) frost(L.bx + x * L.cs, L.by + y * L.cs, L.cs, i, false); }
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const c = S.board[y][x]; if (!c) continue;
    let s = L.cs, ox = 0;
    const pa = S.placedAnim.find(a => a.x === x && a.y === y);
    if (pa) { const k = Math.sin(Math.min(1, pa.t / 0.25) * Math.PI) * 0.12; s = L.cs * (1 + k); ox = (L.cs - s) / 2; }
    const lit = hl && (hl.rows.includes(y) || hl.cols.includes(x));
    const dead = S.endAnim && S.endAnim.t > 0.35 + y * 0.06;
    cell(L.bx + x * L.cs + ox, L.by + y * L.cs + ox, s, dead ? '#55505a' : lit ? hl.color : c, dead ? 0.8 : 1);
    if (c === STONE2) armor(L.bx + x * L.cs + ox, L.by + y * L.cs + ox, s);
    else if (c === STONEC) cracks(L.bx + x * L.cs + ox, L.by + y * L.cs + ox, s);
    if (S.gems.has(y * N + x)) gem(L.bx + (x + 0.5) * L.cs, L.by + (y + 0.48) * L.cs, L.cs * 0.3);
    if (S.ice.has(y * N + x)) frost(L.bx + x * L.cs + ox, L.by + y * L.cs + ox, s, y * N + x, true);
    if (lit) { ctx.fillStyle = 'rgba(255,255,255,' + (0.18 + 0.12 * Math.sin(performance.now() / 90)) + ')'; rr(L.bx + x * L.cs + 3, L.by + y * L.cs + 3, L.cs - 6, L.cs - 6, L.cs * .15); ctx.fill(); }
  }
  drawBand();
  S.placedAnim.forEach(a => a.t += dt); S.placedAnim = S.placedAnim.filter(a => a.t < 0.25);

  // cases qui s'effacent
  const CLR = stone ? 0.46 : 0.3;
  S.clearing.forEach(c => {
    c.t += dt; const k = Math.max(0, c.t - c.delay) / CLR;
    if (k >= 1) return;
    if (stone) { shatter(c, k); return; }
    const s = L.cs * (1 - k);
    ctx.save(); ctx.translate(L.bx + (c.x + .5) * L.cs, L.by + (c.y + .5) * L.cs); ctx.rotate(k * 1.5);
    cell(-s / 2, -s / 2, s, k < 0.15 ? '#ffffff' : c.color, 1 - k * 0.5);
    ctx.restore();
  });
  S.clearing = S.clearing.filter(c => c.t - c.delay < CLR);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  S.beams.forEach(b => {
    b.t += dt; const k = b.t / 0.4; if (k >= 1) return;
    const w = L.cs * (1.1 - k * 0.9), a = (1 - k) * 0.85;
    const gr = b.row !== undefined ? ctx.createLinearGradient(0, L.by + (b.row + 0.5) * L.cs - w / 2, 0, L.by + (b.row + 0.5) * L.cs + w / 2) : ctx.createLinearGradient(L.bx + (b.col + 0.5) * L.cs - w / 2, 0, L.bx + (b.col + 0.5) * L.cs + w / 2, 0);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, `rgba(255,248,225,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gr;
    if (b.row !== undefined) ctx.fillRect(L.bx - L.fr, L.by + (b.row + 0.5) * L.cs - w / 2, L.bs + 2 * L.fr, w); else ctx.fillRect(L.bx + (b.col + 0.5) * L.cs - w / 2, L.by - L.fr, w, L.bs + 2 * L.fr);
  });
  S.beams = S.beams.filter(b => b.t < 0.4);
  S.rings.forEach(r => {
    r.t += dt; const k = r.t / 0.55; if (k >= 1) return;
    ctx.strokeStyle = `rgba(255,230,180,${(1 - k) * 0.8})`; ctx.lineWidth = L.cs * 0.35 * (1 - k) + 1;
    ctx.beginPath(); ctx.arc(r.x, r.y, L.bs * 0.75 * (1 - Math.pow(1 - k, 2)), 0, 7); ctx.stroke();
  });
  S.rings = S.rings.filter(r => r.t < 0.55);
  ctx.restore();

  ctx.restore();

  // zone visée par le marteau / la bombe
  if (tool && hover) {
    const gx = Math.floor((hover.x - L.bx) / L.cs), gy = Math.floor((hover.y - L.by) / L.cs), R = tool === 'bomb' ? 1 : 0;
    if (gx >= 0 && gy >= 0 && gx < N && gy < N) {
      const st = curTheme().style === 'stone';
      ctx.fillStyle = st ? 'rgba(255,170,60,.22)' : 'rgba(255,93,143,.28)'; ctx.strokeStyle = st ? '#ffc56b' : '#ff5d8f'; ctx.lineWidth = st ? 2.5 : 2;
      const x0 = Math.max(0, gx - R), y0 = Math.max(0, gy - R), x1 = Math.min(N - 1, gx + R), y1 = Math.min(N - 1, gy + R);
      if (st) ctx.setLineDash([L.cs * 0.2, L.cs * 0.09]);
      rr(L.bx + x0 * L.cs, L.by + y0 * L.cs, (x1 - x0 + 1) * L.cs, (y1 - y0 + 1) * L.cs, L.cs * 0.2); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
    }
  }

  // plateau de pièces
  for (let i = 0; i < 3; i++) {
    const p = S.tray[i]; if (!p || (S.drag && S.drag.idx === i) || (S.back && S.back.idx === i)) continue;
    const r = slotRect(i), s = pieceScale(p, r);
    const ok = canPlaceAnywhere(p);
    const px = r.x + (r.w - p.w * s) / 2, py = r.y + (r.h - p.h * s) / 2;
    const jit = S.endAnim && S.endAnim.t < 0.6 && !calm() ? Math.sin(S.endAnim.t * 70) * L.cs * 0.08 : 0;
    for (const [x, y] of p.cells) cell(px + x * s + jit, py + y * s, s, ok ? p.color : '#555a72', ok ? 1 : 0.6);
    if (S.endAnim) {   // rien ne rentre : une croix sur chaque pièce
      const cx = r.x + r.w / 2 + jit, cy = r.y + r.h / 2, z = Math.min(r.w, r.h) * 0.22;
      ctx.save(); ctx.lineCap = 'round';
      if (curTheme().style === 'stone') {
        for (const [w, a, j] of [[0.13, 0.55, 0.06], [0.07, 0.9, -0.04]]) {
          ctx.strokeStyle = `rgba(244,230,204,${a})`; ctx.lineWidth = Math.max(2, L.cs * w); ctx.beginPath();
          ctx.moveTo(cx - z, cy - z * (1 + j)); ctx.quadraticCurveTo(cx + z * j, cy - z * j, cx + z, cy + z * (1 - j));
          ctx.moveTo(cx + z * (1 + j), cy - z); ctx.quadraticCurveTo(cx - z * j, cy + z * j, cx - z, cy + z * (1 + j)); ctx.stroke();
        }
      } else { ctx.strokeStyle = 'rgba(255,80,90,.9)'; ctx.lineWidth = Math.max(3, L.cs * 0.12); ctx.beginPath(); ctx.moveTo(cx - z, cy - z); ctx.lineTo(cx + z, cy + z); ctx.moveTo(cx + z, cy - z); ctx.lineTo(cx - z, cy + z); ctx.stroke(); }
      ctx.restore();
    }
  }
  if (S.endAnim) S.endAnim.t += dt;

  // pièce qui revient à sa place (animation de 0,18 s, de la taille de la grille à celle du plateau)
  if (S.back) {
    const b = S.back, p = S.tray[b.idx]; b.t += dt;
    const k = Math.min(1, b.t / 0.18), e = 1 - (1 - k) * (1 - k);
    if (!p || k >= 1) S.back = null;
    else {
      const r = slotRect(b.idx), s2 = pieceScale(p, r), sz = L.cs + (s2 - L.cs) * e;
      const tx = r.x + (r.w - p.w * s2) / 2, ty = r.y + (r.h - p.h * s2) / 2;
      const x0 = b.x + (tx - b.x) * e, y0 = b.y + (ty - b.y) * e;
      for (const [x, y] of p.cells) cell(x0 + x * sz, y0 + y * sz, sz, p.color, 0.9);
    }
  }

  // tutoriel : une main montre le glisser tant que le joueur n'a jamais posé de pièce
  if (TUTO && !S.drag && S.tray[0]) {
    const T = (performance.now() / 1000) % 2.2, k = Math.min(1, Math.max(0, (T - 0.3) / 1.2)), e = k * k * (3 - 2 * k);
    const r = slotRect(0), sx = r.x + r.w / 2, sy = r.y + r.h / 2, tx = L.bx + L.bs / 2, ty = L.by + L.bs * 0.55;
    const hx = sx + (tx - sx) * e, hy = sy + (ty - sy) * e;
    ctx.globalAlpha = T > 1.9 ? Math.max(0, 1 - (T - 1.9) / 0.3) : 1;
    const p = S.tray[0]; for (const [x, y] of p.cells) cell(hx - p.w * L.cs / 2 + x * L.cs, hy - p.h * L.cs / 2 + y * L.cs, L.cs, p.color, 0.45 * ctx.globalAlpha);
    { const k = L.cs * 0.045; ctx.save(); ctx.translate(hx - L.cs * 0.1, hy + L.cs * 0.1); ctx.scale(k, k); ctx.lineWidth = 2.4; ctx.strokeStyle = '#26140c'; ctx.fillStyle = '#f3dcb4'; const hp = new Path2D('M9 11V5.2a1.4 1.4 0 0 1 2.8 0V10M11.8 9.5V4a1.4 1.4 0 0 1 2.8 0v6M14.6 10V5.5a1.4 1.4 0 0 1 2.8 0V13c0 4.5-2.4 7.5-6 7.5-2.8 0-4.4-1.6-5.7-4l-2-3.6a1.3 1.3 0 0 1 2.2-1.4L9 14z'); ctx.fill(hp); ctx.stroke(hp); ctx.restore(); }
    ctx.globalAlpha = 1;
    ctx.font = `800 ${Math.round(L.cs * 0.4)}px 'BQ Label',system-ui,sans-serif`; ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
    if (S.mode === 'classic') ctx.fillText(t('bp.tuto'), L.bx + L.bs / 2, L.by - 14 + (L.by < 30 ? 30 : 0));   // ailleurs, la ligne d'objectif occupe cet endroit
  }

  // pièce en main
  if (S.drag) {
    const p = S.tray[S.drag.idx], d = S.drag;
    const k = Math.min(1, (performance.now() - d.t0) / 90), e = 1 - (1 - k) * (1 - k), sz = d.s0 + (L.cs - d.s0) * e, f = sz / L.cs;
    const x0 = d.x - d.ox * f, y0 = d.y - d.oy * f;
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.32)';
    for (const [x, y] of p.cells) { rr(x0 + x * sz + sz * 0.14, y0 + y * sz + sz * 0.22, sz * 0.92, sz * 0.92, sz * 0.14); ctx.fill(); }
    ctx.restore();
    for (const [x, y] of p.cells) cell(x0 + x * sz, y0 + y * sz, sz, p.color, 0.97);
  }

  // particules
  S.fx.forEach(f => {
    if (f.puff) { f.x += f.vx; f.y += f.vy; f.life -= dt * 1.2; } else { f.vy += f.conf ? 0.18 : 0.35; f.vx *= f.conf ? 0.98 : 1; f.x += f.vx; f.y += f.vy; f.life -= dt * (f.conf ? 0.8 : 1.4); f.rot += f.conf ? 0.12 : 0.2; }
    ctx.save(); ctx.globalAlpha = Math.max(0, f.life); ctx.translate(f.x, f.y); ctx.rotate(f.rot);
    ctx.fillStyle = f.color;
    if (f.puff) { ctx.globalAlpha = Math.max(0, f.life) * 0.14; ctx.beginPath(); ctx.arc(0, 0, f.s * (1.6 - f.life), 0, 7); ctx.fill(); }
    else if (f.chip !== undefined && curTheme().style === 'stone') { const q = f.s * 0.6; ctx.beginPath(); ctx.moveTo(-q, -q * (0.4 + f.chip * 0.2)); ctx.lineTo(q, -q * 0.7); ctx.lineTo(q * 0.3, q); ctx.closePath(); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.moveTo(-q, -q * 0.5); ctx.lineTo(q, -q * 0.7); ctx.lineTo(0, -q * 0.1); ctx.closePath(); ctx.fill(); }
    else ctx.fillRect(-f.s / 2, -f.s / 2, f.s, f.s * (f.conf ? 0.5 : 1));
    ctx.restore();
  });
  S.fx = S.fx.filter(f => f.life > 0);

  // messages
  S.pops.forEach(p => {
    p.t += dt; if (p.t < 0) return;   // message différé (t négatif au départ)
    const k = p.t / 1.2;
    const a = k < 0.15 ? k / 0.15 : Math.max(0, 1 - (k - 0.6) / 0.4);
    const sc = calm() ? 1 : 1 + Math.max(0, 0.3 - k) * 2;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, L.by + L.bs * 0.42 - k * 40); ctx.scale(sc, sc);
    ctx.textAlign = 'center'; ctx.font = `${Math.round(L.cs * (p.big ? 0.78 : 0.62))}px 'BQ Display',system-ui,sans-serif`;
    const mw = L.bs * 0.96 / sc;   // jamais plus large que la grille (textes longs, petits écrans)
    if (!p.clean) { p.text = stripEmoji(p.text); p.sub = stripEmoji(p.sub); p.clean = 1; }
    ctx.lineJoin = 'round'; ctx.lineWidth = L.cs * 0.2; ctx.strokeStyle = '#26140c'; ctx.strokeText(p.text, 0, 0, mw);
    const gr = ctx.createLinearGradient(0, -30, 0, 10); gr.addColorStop(0, '#fff6a8'); gr.addColorStop(1, '#ff9d2e');
    ctx.fillStyle = gr; ctx.fillText(p.text, 0, 0, mw);
    ctx.font = `800 ${Math.round(L.cs * 0.44)}px 'BQ Label',system-ui,sans-serif`; ctx.fillStyle = '#fff'; ctx.lineWidth = L.cs * 0.13;
    ctx.strokeText(p.sub, 0, L.cs * 0.6, mw); ctx.fillText(p.sub, 0, L.cs * 0.6, mw);
    ctx.restore();
  });
  S.pops = S.pops.filter(p => p.t < 1.2);
  drawTip(dt);
  drawFlyers(dt);
  if (S.flash > 0) { ctx.fillStyle = `rgba(255,246,220,${S.flash * 0.38})`; ctx.fillRect(0, 0, W, H); S.flash = Math.max(0, S.flash - dt * 3); }
}
// conseil sur une étiquette de pierre en haut de la grille : titre + explication sur deux ou trois lignes, fondu doux
function wrapText(str, w) {
  const out = []; let line = '';
  for (const word of String(str).split(' ')) { const tr = line ? line + ' ' + word : word; if (line && ctx.measureText(tr).width > w) { out.push(line); line = word; } else line = tr; }
  if (line) out.push(line); return out;
}
function drawTip(dt) {
  const q = S.tips[0]; if (!q) return;
  q.t += dt; if (q.t < 0) return;
  if (q.t > q.dur) { S.tips.shift(); if (S.tips[0] && S.tips[0].t < 0) S.tips[0].t = 0; return; }
  if (!q.clean) { q.text = stripEmoji(q.text); q.sub = stripEmoji(q.sub); q.clean = 1; }
  const a = Math.min(1, q.t / 0.18, (q.dur - q.t) / 0.4), w = L.bs * 0.9, fs1 = Math.round(L.cs * 0.4), fs2 = Math.round(L.cs * 0.3);
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `800 ${fs2}px 'BQ Label',system-ui,sans-serif`;
  const lines = q.sub ? wrapText(q.sub, w - L.cs * 0.5) : [];
  const h = fs1 * 1.35 + lines.length * fs2 * 1.25 + L.cs * 0.3, x = L.bx + (L.bs - w) / 2, y = L.by + L.cs * 0.25 + (calm() ? 0 : (1 - Math.min(1, q.t / 0.18)) * -6);
  ctx.globalAlpha = a * (S.drag && S.drag.y - S.drag.oy < y + h + L.cs ? 0.35 : 1);   // s'efface quand la pièce en main passe dessous
  ctx.fillStyle = 'rgba(30,20,14,.93)'; ctx.strokeStyle = 'rgba(255,214,150,.55)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x + 6, y); ctx.lineTo(x + w * 0.5, y + 2); ctx.lineTo(x + w - 4, y); ctx.lineTo(x + w, y + h * 0.4); ctx.lineTo(x + w - 3, y + h); ctx.lineTo(x + w * 0.45, y + h - 2); ctx.lineTo(x + 3, y + h); ctx.lineTo(x, y + h * 0.55); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.font = `${fs1}px 'BQ Display',system-ui,sans-serif`; ctx.fillStyle = '#ffd27a';
  ctx.fillText(q.text, L.bx + L.bs / 2, y + L.cs * 0.15 + fs1 * 0.68, w - L.cs * 0.4);
  ctx.font = `800 ${fs2}px 'BQ Label',system-ui,sans-serif`; ctx.fillStyle = '#f6ead2';
  lines.forEach((l, i) => ctx.fillText(l, L.bx + L.bs / 2, y + L.cs * 0.15 + fs1 * 1.35 + fs2 * (0.62 + i * 1.25), w - L.cs * 0.4));
  ctx.restore();
}
// « +N » qui part de la ligne effacée et rejoint la case du score, qui rebondit à l'arrivée
function drawFlyers(dt) {
  if (!S.flyers.length) return;
  const sc = $('bp-score').getBoundingClientRect(), cr = canvas.getBoundingClientRect();
  const tx = sc.left + sc.width / 2 - cr.left, ty = sc.top + sc.height / 2 - cr.top;
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `${Math.round(L.cs * 0.42)}px 'BQ Display',system-ui,sans-serif`; ctx.lineJoin = 'round';
  S.flyers.forEach(f => {
    f.t += dt; const k = Math.max(0, (f.t - 0.35) / 0.45), e = k * k;
    if (k >= 1) { if (!f.done) { f.done = true; const el = $('bp-score'); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); } return; }
    const x = f.x + (tx - f.x) * e, y = f.y - Math.min(1, f.t / 0.35) * L.cs * 0.6 + (ty - f.y) * e;
    ctx.globalAlpha = 1 - k * 0.4; ctx.lineWidth = L.cs * 0.12; ctx.strokeStyle = '#26140c'; ctx.strokeText('+' + num(f.v), x, y); ctx.fillStyle = '#ffe9a8'; ctx.fillText('+' + num(f.v), x, y);
  });
  ctx.restore(); S.flyers = S.flyers.filter(f => !f.done);
}
// bandeau au-dessus du cadre : record à battre (classique) et jauge de combo avec ses trois crans de grâce
function drawBand() {
  if (S.over && !S.endAnim) return;
  const y = L.by - L.fr - L.band * 0.5, now = performance.now();
  ctx.save(); ctx.textBaseline = 'middle';
  if (S.mode === 'daily') {   // défi : barre vers la prochaine étoile
    const st = dailyStars(S.shown), goal = DAILY_GOALS[Math.min(2, st)], prev = st ? DAILY_GOALS[st - 1] : 0, w = L.bs * 0.42, h = L.band * 0.26, x = L.bx;
    const k = st >= 3 ? 1 : Math.min(1, (S.shown - prev) / (goal - prev));
    ctx.fillStyle = 'rgba(0,0,0,.35)'; rr(x, y - h / 2, w, h, h / 2); ctx.fill(); ctx.fillStyle = '#ffd24d'; rr(x, y - h / 2, Math.max(h, w * k), h, h / 2); ctx.fill();
    ctx.font = `800 ${Math.round(L.band * 0.36)}px 'BQ Label',system-ui,sans-serif`; ctx.textAlign = 'left'; ctx.fillStyle = '#ffd24d';
    ctx.fillText('★'.repeat(st) + '☆'.repeat(3 - st) + (st < 3 ? '  ' + num(goal) : ''), x + w + L.band * 0.18, y);
  }
  if (S.mode === 'classic' && S.bestStart > 0) {
    const w = L.bs * 0.42, h = L.band * 0.26, x = L.bx, k = Math.min(1, S.shown / S.bestStart), near = !S.beat && k >= 0.9;
    ctx.fillStyle = 'rgba(0,0,0,.35)'; rr(x, y - h / 2, w, h, h / 2); ctx.fill();
    ctx.fillStyle = S.beat ? '#ffd24d' : near ? `rgba(255,${170 + 60 * Math.sin(now / 120)},80,1)` : '#c99a5b'; rr(x, y - h / 2, Math.max(h, w * k), h, h / 2); ctx.fill();
    ctx.font = `800 ${Math.round(L.band * 0.36)}px 'BQ Label',system-ui,sans-serif`; ctx.textAlign = 'left'; ctx.fillStyle = S.beat ? '#ffd24d' : '#e8d3b0';
    if (S.beat) crown(x + w + L.band * 0.32, y, L.band * 0.2);
    ctx.fillText(S.beat ? t('bp.recordRun') : t('bp.toBeat', { n: num(S.bestStart) }), x + w + L.band * (S.beat ? 0.6 : 0.18), y);
  }
  if (S.combo >= 1 && !S.over) {
    const big = S.combo >= 5, wob = S.miss === 2 ? Math.sin(now / 45) * 2 : 0, fz = Math.round(L.band * (0.5 + Math.min(0.2, S.combo * 0.03)));
    ctx.font = `${fz}px 'BQ Display',system-ui,sans-serif`; ctx.textAlign = 'right';
    const rx = L.bx + L.bs - L.band * 0.95;
    ctx.fillStyle = big ? '#ff7a3d' : '#ffd24d'; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 6 + Math.min(14, S.combo * 2);
    ctx.fillText(t('bp.combo', { n: S.combo }), rx + wob, y); ctx.shadowBlur = 0;
    for (let i = 0; i < 3; i++) {   // crans : un se vide à chaque pose sans ligne
      const on = i < 3 - (S.miss || 0), cx = rx + L.band * (0.22 + i * 0.27) + wob, r = L.band * 0.1;
      ctx.beginPath(); ctx.arc(cx, y, r, 0, 7); ctx.fillStyle = on ? (big ? '#ff7a3d' : '#ffd24d') : 'rgba(0,0,0,.4)'; ctx.fill();
      ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,240,210,.5)'; ctx.stroke();
    }
  }
  ctx.restore();
}
function crown(x, y, r) {
  ctx.save(); ctx.fillStyle = '#ffd24d'; ctx.beginPath();
  ctx.moveTo(x - r, y + r * 0.6); ctx.lineTo(x - r, y - r * 0.4); ctx.lineTo(x - r * 0.45, y + r * 0.05); ctx.lineTo(x, y - r * 0.8); ctx.lineTo(x + r * 0.45, y + r * 0.05); ctx.lineTo(x + r, y - r * 0.4); ctx.lineTo(x + r, y + r * 0.6); ctx.closePath(); ctx.fill(); ctx.restore();
}
// dalle : cadre de grès boulonné, ardoise, alvéoles gravées — redessinée seulement au redimensionnement
function slab() {
  if (boardSpr) return boardSpr;
  const fr = L.fr, pad = 6, Wd = L.bs + 2 * fr + 2 * pad, c = document.createElement('canvas');
  c.width = c.height = Math.ceil(Wd * DPR); const g = c.getContext('2d'); g.scale(DPR, DPR);
  const box = (x, y, w, h, rad) => { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, rad) : g.rect(x, y, w, h); };
  g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 18; g.shadowOffsetY = 6;
  const gr = g.createLinearGradient(0, pad, 0, Wd - pad); gr.addColorStop(0, '#7a5f45'); gr.addColorStop(0.5, '#5c4532'); gr.addColorStop(1, '#3b2b1f');
  g.fillStyle = gr; box(pad, pad, Wd - 2 * pad, Wd - 2 * pad, fr * 0.9); g.fill(); g.shadowColor = 'transparent';
  g.strokeStyle = 'rgba(255,225,180,.25)'; g.lineWidth = 1.5; box(pad + 1, pad + 1, Wd - 2 * pad - 2, Wd - 2 * pad - 2, fr * 0.9); g.stroke();
  let h = 99; const rn = () => ((h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0) / 4294967296);
  g.strokeStyle = 'rgba(40,25,15,.35)'; g.lineWidth = 1; for (let k = 0; k < 14; k++) { const yy = pad + rn() * (Wd - 2 * pad); g.beginPath(); g.moveTo(pad + 2, yy); g.quadraticCurveTo(Wd / 2, yy + (rn() - 0.5) * 20, Wd - pad - 2, yy + (rn() - 0.5) * 8); g.stroke(); }
  const ix = pad + fr, iy = pad + fr;
  g.fillStyle = '#18151b'; box(ix - 3, iy - 3, L.bs + 6, L.bs + 6, L.cs * 0.14); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 3; box(ix - 3, iy - 3, L.bs + 6, L.bs + 6, L.cs * 0.14); g.stroke();
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const X = ix + x * L.cs + 2, Y = iy + y * L.cs + 2, w = L.cs - 4;
    g.fillStyle = (x + y) % 2 ? '#211d24' : '#25212a'; box(X, Y, w, w, L.cs * 0.1); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(X + 2, Y + w - 1); g.lineTo(X + 1, Y + 2); g.lineTo(X + w - 1, Y + 1); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.06)'; g.beginPath(); g.moveTo(X + w - 1, Y + 2); g.lineTo(X + w - 1, Y + w - 1); g.lineTo(X + 2, Y + w - 1); g.stroke();
  }
  for (const [bx, by] of [[pad + fr * 0.5, pad + fr * 0.5], [Wd - pad - fr * 0.5, pad + fr * 0.5], [pad + fr * 0.5, Wd - pad - fr * 0.5], [Wd - pad - fr * 0.5, Wd - pad - fr * 0.5]]) {
    const bg = g.createRadialGradient(bx - fr * 0.08, by - fr * 0.08, 0, bx, by, fr * 0.24); bg.addColorStop(0, '#e6d2b0'); bg.addColorStop(1, '#5a4430');
    g.fillStyle = bg; g.beginPath(); g.arc(bx, by, fr * 0.22, 0, 7); g.fill();
    g.strokeStyle = 'rgba(40,25,15,.7)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(bx - fr * 0.13, by); g.lineTo(bx + fr * 0.13, by); g.stroke();
  }
  return (boardSpr = c);
}
// poussière de carrière qui flotte dans la lumière, derrière la grille
const DUST = [];
function drawDust(dt) {
  if (!DUST.length) for (let i = 0; i < 22; i++) DUST.push({ x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.8, v: 0.004 + Math.random() * 0.01, ph: Math.random() * 6 });
  ctx.save();
  for (const d of DUST) {
    d.y -= d.v * dt; d.ph += dt; if (d.y < -0.02) { d.y = 1.02; d.x = Math.random(); }
    ctx.globalAlpha = 0.18 + 0.12 * Math.sin(d.ph); ctx.fillStyle = '#ffd9a8';
    ctx.beginPath(); ctx.arc((d.x + Math.sin(d.ph * 0.4) * 0.01) * W, d.y * H, d.r, 0, 7); ctx.fill();
  }
  ctx.restore();
}

// ---------- input ----------
function pos(e) { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
canvas.addEventListener('pointerdown', e => {
  if (S.over) return;
  const { x, y } = pos(e);
  if (tool) {
    const gx = Math.floor((x - L.bx) / L.cs), gy = Math.floor((y - L.by) / L.cs);
    if (gx >= 0 && gy >= 0 && gx < N && gy < N) {
      // au doigt : un premier toucher vise (zone affichée), un second au même endroit frappe
      if (e.pointerType === 'touch' && !(S.aim && S.aim[0] === gx && S.aim[1] === gy)) { S.aim = [gx, gy]; hover = { x, y }; SFX.snap(); tip(t('bp.tapConfirm'), '', 0, 2.5); return; }
      S.aim = null; useTool(tool, gx, gy); return;
    }
  }
  for (let i = 0; i < 3; i++) {
    const r = slotRect(i), p = S.tray[i];
    if (!p || x < r.x || x > r.x + r.w || y < r.y - 10 || y > r.y + r.h + 10) continue;
    // Au doigt, la pièce flotte au-dessus pour rester visible ; à la souris, elle est centrée.
    const oy = e.pointerType === 'touch' ? p.h * L.cs + L.cs * 1.2 : p.h * L.cs / 2;
    S.drag = { idx: i, x, y, ox: p.w * L.cs / 2, oy, t0: performance.now(), s0: pieceScale(p, r) };
    canvas.setPointerCapture(e.pointerId);
    SFX.pick();
    if (!canPlaceAnywhere(p)) { SFX.lost(); if (!S.greyAt || performance.now() - S.greyAt > 6000) { S.greyAt = performance.now(); tip(t('bp.tipGrey'), t('bp.tipGreySub'), 0, 3); } }
    break;
  }
});
let hover = null;
canvas.addEventListener('pointermove', e => { const p = pos(e); hover = p; if (S.drag) { S.drag.x = p.x; S.drag.y = p.y; } });
function drop() {
  if (!S.drag) return;
  const g = ghostTarget(); const idx = S.drag.idx, d = S.drag; S.drag = null;
  if (g) { place(idx, g.gx, g.gy); return; }
  // lâchée hors de la grille : la pièce revient dans son emplacement, avec un petit son
  const p = S.tray[idx]; if (!p) return;
  S.back = { idx, x: d.x - d.ox, y: d.y - d.oy, t: 0 };
  SFX.back();
}
canvas.addEventListener('pointerup', e => { drop(); if (e.pointerType === 'touch' && !tool) hover = null; });
canvas.addEventListener('pointercancel', () => S.drag = null);

$('bp-restart').onclick = () => {
  if (S.mode === 'adv') { if (S.moves === S.goal.moves) startLevel(S.lvl); else ptConfirm(t('bp.cRestartLevel', { n: S.lvl }), t('bp.cRestart')).then(ok => ok && startLevel(S.lvl)); return; }
  if (S.mode === 'daily') { if (!S.score || S.over) startDaily(); else ptConfirm(t('bp.cDaily'), t('bp.cRestart')).then(ok => ok && startDaily()); return; }
  if (S.mode === 'chrono') { if (!S.score || S.over) startChrono(); else ptConfirm(t('bp.cChrono'), t('bp.cChronoOk')).then(ok => ok && startChrono()); return; }
  if (S.score === 0) newGame(); else window.ptConfirm(t('bp.cNewGame'), t('bp.cRestart')).then(ok => ok && newGame());
};
$('bp-again').onclick = () => MON.pause().then(() => S.mode === 'daily' ? startDaily() : S.mode === 'chrono' ? startChrono() : newGame());
$('bp-chrono').onclick = startChrono;
$('bp-mapbtn').onclick = openMap;
$('bp-themebtn').onclick = openThemes;
$('bp-themeclose').onclick = () => $('bp-themes').classList.add('hidden');
$('bp-carbtn').onclick = openCareer;
$('bp-carclose').onclick = () => $('bp-career').classList.add('hidden');
applyTheme();
// reprendre une grille bloquée : on ferme l'écran de fin et on arme le marteau
// reprendre une grille bloquée : zone 3×3 dégagée et pièces qui rentrent — la reprise marche à coup sûr
const resume = id => {
  $(id).classList.add('hidden'); S.over = false; S.endAnim = null; tool = null; paintBoost();
  clearSpace();
  S.pops.length = 0; S.pops.push({ text: t('bp.spaceCleared'), sub: t('bp.keepGoing'), t: 0 }); updateHUD(); save();
};
const payResume = id => { const c = contCost(); if (COINS < c || (S.mode === 'daily' && dailyContUsed())) return; COINS -= c; S.contN = (S.contN || 0) + 1; if (S.mode === 'daily') { DAILY.cont = DAILY.day; saveDaily(); } saveCoins(); resume(id); };
const dailyContUsed = () => DAILY.cont === DAILY.day;
$('bp-cont').onclick = () => payResume('bp-over');
$('bp-rescont').onclick = () => payResume('bp-res');
const MORE_COST = 25;
const contCost = () => 30 * Math.pow(2, S.contN || 0);   // 30 → 60 → 120 : les records ne s'achètent pas
$('bp-resmore').onclick = () => {
  if (COINS < MORE_COST || S.moreBought) return;
  COINS -= MORE_COST; saveCoins(); S.moreBought = true; S.moves += 3; S.over = false; S.endAnim = null;
  if (!S.tray.some(t => t && canPlaceAnywhere(t))) rescueTray();   // des coups sans place ne servent à rien
  $('bp-res').classList.add('hidden'); S.pops.push({ text: t('bp.plus3'), sub: t('bp.lastChance'), t: 0 }); updateHUD();
};
// vidéos récompensées (application uniquement) : toujours facultatives, jamais imposées
$('bp-resvid').onclick = () => S.moves > 0 ? MON.reward('continue').then(ok => { if (!ok || S.vidCont) return; S.vidCont = true; resume('bp-res'); }) : MON.reward('moves').then(ok => {
  if (!ok || S.moreBought) return;
  S.moreBought = true; S.moves += 3; S.over = false; S.endAnim = null;
  if (!S.tray.some(t => t && canPlaceAnywhere(t))) rescueTray();
  $('bp-res').classList.add('hidden'); S.pops.push({ text: t('bp.plus3'), sub: t('bp.lastChance'), t: 0 }); updateHUD();
});
$('bp-vidcont').onclick = () => MON.reward('continue').then(ok => { if (!ok || !S.over) return; S.vidCont = true; resume('bp-over'); });
const VID_DAY = 5, VID_COINS = 20;
let VIDS = { day: 0, n: 0 };
try { VIDS = Object.assign(VIDS, JSON.parse(localStorage.getItem('blocparty.vids') || '{}')); } catch (e) {}
const vidsLeft = () => VIDS.day === dayKey() ? Math.max(0, VID_DAY - VIDS.n) : VID_DAY;
function paintVidCoins() {
  const b = $('bp-vidcoins'), n = vidsLeft();
  b.classList.toggle('hidden', !MON.canReward() || n <= 0);
  b.innerHTML = `${t('app.watchCoins', { n: VID_COINS })}<small>${t('app.videoLeft', { n })}</small>`;
}
$('bp-vidcoins').onclick = () => MON.reward('coins').then(ok => {
  if (!ok) return;
  if (VIDS.day !== dayKey()) VIDS = { day: dayKey(), n: 0 };
  VIDS.n++; try { localStorage.setItem('blocparty.vids', JSON.stringify(VIDS)); } catch (e) {}
  COINS += VID_COINS; saveCoins(); window.ptToast && window.ptToast(t('app.coinsGot', { n: VID_COINS })); openThemes();
});
$('bp-share').onclick = shareDaily;
$('bp-overmap').onclick = () => { $('bp-over').classList.add('hidden'); openMap(); };
const t2 = k => t(k);   // (t est masqué dans ce gestionnaire)
document.querySelectorAll('#bp-boost button').forEach(b => b.onclick = () => {
  const t = b.dataset.tool;
  if (S.mode === 'daily') { tip(t2('bp.noBoostDaily')); beep(180, 0.1, 'square', 0.03); return; }
  if (S.over || (COINS < TOOLS[t] && !(S.freeTool && t === 'hammer'))) { beep(180, 0.1, 'square', 0.03); return; }
  if (t === 'shuffle') { useTool('shuffle'); return; }
  tool = tool === t ? null : t; S.aim = null; paintBoost();
  if (tool) tip(t2(tool === 'bomb' ? 'bp.bombHow' : 'bp.hammerHow'), t2(window.ptDesktop || !matchMedia('(pointer: coarse)').matches ? 'bp.toolCancelKey' : 'bp.toolCancel')); else dropTips();   // chaque outil s'explique au moment où on le prend
});
paintBoost();
// réglages de confort : dans l'appli, rangés dans la roue dentée de la coquille ; sur le site, sous les thèmes
function initComfort() {
  const box = $('bp-comfort'); if (!box) return;
  const host = $('bq-sfx') && $('bq-sfx').closest('.bq-row');
  if (host && !box.dataset.moved) { box.dataset.moved = 1; host.after(box); box.classList.add('in-app'); }
  const vib = $('bp-optvib'), cm = $('bp-optcalm');
  vib.checked = OPT.vib; cm.checked = calm();
  let coarse = false; try { coarse = matchMedia('(pointer: coarse)').matches; } catch (e) {}
  $('bp-optvibrow').classList.toggle('hidden', !navigator.vibrate || !coarse || !!window.ptDesktop);   // PC : pas de vibreur
  vib.onchange = () => { OPT.vib = vib.checked; saveOpt(); if (OPT.vib) buzz(30); };
  cm.onchange = () => { OPT.calm = cm.checked; saveOpt(); paintCalm(); };
  paintCalm();
  $('bp-tipsagain').onclick = () => { TIPS = {}; saveTips(); TUTO = true; try { localStorage.removeItem('blocparty.tuto'); } catch (e) {} window.ptToast && window.ptToast(t('bp.tipsBack')); };
}
initComfort();
// clavier (PC) : Échap pose l'outil en main, sinon ferme la fenêtre du jeu ouverte
window.addEventListener('keydown', e => {
  if (e.key !== 'Escape' || (document.body.dataset.tab && document.body.dataset.tab !== 'blocks')) return;
  if (tool) { tool = null; S.aim = null; dropTips(); paintBoost(); return; }
  const open = [...document.querySelectorAll('#tab-blocks .overlay:not(.hidden)')].pop();
  const b = open && open.querySelector('[data-back]'); if (b) b.click();
});
// langue : le HTML se traduit tout seul, le reste se redessine
applyI18n();
deEmoji($('tab-blocks'));
new MutationObserver(ms => { for (const m of ms) { if (m.type === 'characterData') deEmoji(m.target.parentNode); else m.addedNodes.forEach(n => n.nodeType === 3 ? deEmoji(n.parentNode) : n.nodeType === 1 && deEmoji(n)); } }).observe($('tab-blocks'), { subtree: true, childList: true, characterData: true });
// fenêtre de confirmation : dans l'appli, elle est créée par la coquille APRÈS le chargement de ce module — on la
// surveille dès qu'elle existe (sinon observe(null) levait une exception et le jeu ne démarrait pas dans l'appli)
let modalWatched = false;
function watchModal() {
  const m = $('pt-modal-txt'); if (modalWatched || !m) return;
  modalWatched = true;
  deEmoji($('bq-settings'));   // appli : réglages de la coquille (🌐…) en glyphes dessinés
  new MutationObserver(() => { if (!document.body.dataset.tab || document.body.dataset.tab === 'blocks') deEmoji(m); }).observe(m, { childList: true, subtree: true, characterData: true });
}
watchModal();
const sel = document.getElementById('pt-langsel'); if (sel) import('./i18n.js').then(m => m.langSelect(sel));
window.addEventListener('pt-lang', () => { updateHUD(); if (!$('bp-themes').classList.contains('hidden')) openThemes(); if (!$('bp-map').classList.contains('hidden')) openMap(); if (!$('bp-career').classList.contains('hidden')) openCareer(); });
$('bp-mapclose').onclick = () => { $('bp-map').classList.add('hidden'); if (S.over && S.mode !== 'adv') $('bp-over').classList.remove('hidden'); };   // fermer la carte après une fin de partie ramène à l'écran de fin
$('bp-daily').onclick = () => startDaily();
$('bp-lbover').onclick = () => LB.show(lbBoard());
$('bp-lbdaily').onclick = () => LB.show('daily');
$('bp-lball').onclick = () => LB.show(null);
$('bp-classic').onclick = () => { clearTimeout(overTimer); clearTimeout(resTimer); $('bp-map').classList.add('hidden'); if (S.mode === 'classic' && S.over) { newGame(); return; } if (S.mode !== 'classic') { S.mode = 'classic'; rnd = Math.random; S.gems.clear(); freshRun(); if (!load() || !S.tray.some(t => t && canPlaceAnywhere(t))) newGame(); S.over = false; updateHUD(); } };
$('bp-resnext').onclick = () => MON.pause().then(() => startLevel(Math.min(LEVELS, S.lvl + 1)));
$('bp-resretry').onclick = () => startLevel(S.lvl);
$('bp-resmap').onclick = () => { $('bp-res').classList.add('hidden'); openMap(); };
window.addEventListener('resize', () => running && resize());

// bonus de connexion : une fois par jour, qui grandit avec la série de jours (10 → 40 🪙)
function loginBonus() {
  let L0 = { day: 0, streak: 0 };
  try { L0 = Object.assign(L0, JSON.parse(localStorage.getItem('blocparty.login') || '{}')); } catch (e) {}
  const today = dayKey(); if (L0.day === today) return;
  const y = new Date(); y.setDate(y.getDate() - 1);
  L0.streak = L0.day === dayKey(y) ? L0.streak + 1 : 1; L0.day = today;
  try { localStorage.setItem('blocparty.login', JSON.stringify(L0)); } catch (e) {}
  const gain = 10 + 5 * Math.min(6, L0.streak - 1);
  COINS += gain; saveCoins(); paintBoost();
  if (TUTO) { window.ptToast && window.ptToast(t('bp.loginTitle', { n: L0.streak }) + ` · +${gain} 🪙`); return; }   // pas de bandeau par-dessus le tutoriel
  S.pops.push({ text: t('bp.loginTitle', { n: L0.streak }), sub: `+${gain} 🪙`, t: -0.6 });
}
let inited = false;
window.GAMES.blocks = {
  reward() { COINS += 30; saveCoins(); },   // objectif du jour
  show() {
    loadFonts(); watchModal(); initComfort();
    if (!document.body.dataset.tab) document.body.dataset.tab = 'blocks';   // appli : la coquille (réglages, confirmations, notifications) prend le style de la carrière
    if (!inited) { inited = true; if (!load()) newGame(); else if (!S.tray.some(t => t && canPlaceAnywhere(t))) newGame(); updateHUD(); }
    loginBonus(); checkMedals(); checkMilestones(); ensureWeek(); paintCarBtn(); lbSync();
    // une seule boucle de dessin : un second show() sans hide() (reprise de l'appli) en lançait une deuxième, et le
    // Chrono s'écoulait deux fois plus vite (chaque image de la boucle en trop comptait 16 ms)
    const loop = !running; running = true; requestAnimationFrame(() => { resize(); if (loop) { last = performance.now(); requestAnimationFrame(frame); } });
  },
  hide() { running = false; S.drag = null; },
};
// Accès de test (tools/smoke.mjs, console).
window.__bp = { CAR, MISSIONS, openCareer, ensureWeek, track, gainXP, S, L, newGame, refill: fillTray, place, fits, startLevel, startDaily, startChrono, linesToClear, canPlaceAnywhere, N, gameOver, endNow: () => { S.over = true; armOver(600); } };
