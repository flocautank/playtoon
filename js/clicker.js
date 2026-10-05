// NOVA FOUNDRY (ex-Star Forge) — clicker à progression (forges, améliorations, paliers) et méta-progression
// (Supernova → Novae → Constellation permanente, succès permanents).
import { t, num, applyI18n, addStrings, lang } from './i18n.js';
import SF_EN_FR from './lang/forge.js';
import SF_MORE from './lang/forge-more.js';
import { loadFonts } from './forge-fonts.js';
addStrings(SF_EN_FR); addStrings(SF_MORE);
window.GAMES = window.GAMES || {};

const $ = id => document.getElementById(id);
const SAVE_KEY = 'starforge.save.v1';
// Notation scientifique (option) : déclarée avant tout appel à fmt(), utilisé dès le chargement.
let SCI = false;
try { SCI = localStorage.getItem('starforge.sci') === '1'; } catch (e) {}

// ---------- données ----------
const GENS = [
  { id: 'spark',            ic: '✨', cost: 15,     prod: 0.1,   col: '#ffe38a' },
  { id: 'lantern',    ic: '🏮', cost: 100,    prod: 1,     col: '#ff9d5c' },
  { id: 'comet',     ic: '☄️', cost: 1100,   prod: 8,     col: '#7fd6ff' },
  { id: 'moon',        ic: '🌙', cost: 12000,  prod: 47,    col: '#c9d2ff' },
  { id: 'sun',     ic: '☀️', cost: 130000, prod: 260,   col: '#ffcf3d' },
  { id: 'pulsar',    ic: '💫', cost: 1.4e6,  prod: 1400,  col: '#a0ffe0' },
  { id: 'nebula',      ic: '🌌', cost: 2e7,    prod: 7800,  col: '#d58bff' },
  { id: 'white',           ic: '⚪', cost: 3.3e8,  prod: 44000, col: '#ffffff' },
  { id: 'metro', ic: '🌀', cost: 5.1e9,  prod: 2.6e5, col: '#6fa8ff' },
  { id: 'bang',    ic: '💥', cost: 7.5e10, prod: 1.6e6, col: '#ff5d8f' },
  { id: 'quasar',  ic: '🔆', cost: 1.2e12, prod: 1e7,   col: '#7ffcff', meta: 'm_quasar' },
  { id: 'anvil',   ic: '⚒️', cost: 2e13,   prod: 6.5e7, col: '#ffd0a0', meta: 'm_loom' },
];
const GEN_TIERS = [1, 5, 25, 50, 100, 150, 200, 250];
const TIER_COST = [10, 50, 500, 5e4, 5e6, 5e8, 5e10, 5e12];
const MILESTONES = [10, 25, 50, 100, 150, 200, 250, 300, 350, 400, 500];

// ---------- gravures : icônes au trait (fini les emoji) — forges, familles d'améliorations, onglets ; tout le reste
// (nœuds, succès, défis, galaxie) reçoit une petite constellation tirée de son identifiant : chaque objet a la sienne
const ENG = {
  spark: '<path d="M12 6l1.6 4.4L18 12l-4.4 1.6L12 18l-1.6-4.4L6 12l4.4-1.6z"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2" class="h"/>',
  lantern: '<path d="M9 5h6M10 5V3.5h4V5M8 7h8l-1 11H9zM7.5 18h9M12 18v2.5"/><path d="M10 9.5l4 5M10 12.5l3 3.5M11 8.5l3.5 4" class="h"/>',
  comet: '<circle cx="16" cy="8" r="3.2"/><path d="M13.6 10.2L3 21M14.8 11L6 21.5M12.6 9L3.5 17"/><path d="M15 6.5l2 3M14.5 8l2.6 1.2" class="h"/>',
  moon: '<path d="M15 3.5a8.5 8.5 0 1 0 5.5 14A7 7 0 0 1 15 3.5z"/><path d="M7.5 9l3 3M7 12.5l4 4M9 16.5l3 2.5" class="h"/>',
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/><path d="M10 11l3 3M10.5 13.5l2 1.5" class="h"/>',
  pulsar: '<circle cx="12" cy="12" r="2.4"/><path d="M12 2.5v6M12 15.5v6"/><ellipse cx="12" cy="12" rx="8.5" ry="3.2"/><ellipse cx="12" cy="12" rx="5.2" ry="1.8" class="h"/>',
  nebula: '<path d="M12 12c0-1.5 2-1.8 2.6-.4.8 1.9-1.4 3.6-3.3 3.1-2.8-.8-3.3-4.4-1.3-6.3 2.6-2.4 7-1.4 8.2 1.8 1.5 3.9-1.4 7.9-5.4 8.2-4.6.3-8.1-3.6-7.4-8"/><circle cx="18.5" cy="5.5" r=".7" class="f"/><circle cx="5" cy="17.5" r=".7" class="f"/>',
  white: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="6.2" stroke-dasharray="2 1.7" class="h"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  metro: '<path d="M8.5 21h7L13.6 4h-3.2z"/><path d="M12 17l4.5-11"/><circle cx="15.3" cy="9" r="1"/><path d="M7 21h10M10 13h4M9.6 15.5h4.8" class="h"/>',
  bang: '<circle cx="12" cy="12" r="1.6"/><path d="M12 7V2.5M12 17v4.5M7 12H2.5M17 12h4.5M8.4 8.4L5 5M15.6 15.6L19 19M8.4 15.6L5 19M15.6 8.4L19 5"/><path d="M10 6.5l-.8-2.5M14 17.5l.8 2.5M6.5 14l-2.5.8M17.5 10l2.5-.8" class="h"/>',
  quasar: '<ellipse cx="12" cy="12" rx="9" ry="2.6"/><circle cx="12" cy="12" r="1.8"/><path d="M12 9.5V2M12 14.5V22M10.8 4l1.2-2 1.2 2M10.8 20l1.2 2 1.2-2"/>',
  anvil: '<path d="M4 8h12c0 2 1.5 3 4 3v1.5h-5.5c-.8 0-1.5.7-1.5 1.5v2h3v2.5H7.5V16h3v-2c0-.8-.7-1.5-1.5-1.5H6C4.9 12.5 4 11 4 8z"/><path d="M6.5 9.8h7" class="h"/>',
  hand: '<path d="M9 11V5.2a1.4 1.4 0 0 1 2.8 0V10M11.8 9.5V4a1.4 1.4 0 0 1 2.8 0v6M14.6 10V5.5a1.4 1.4 0 0 1 2.8 0V13c0 4.5-2.4 7.5-6 7.5-2.8 0-4.4-1.6-5.7-4l-2-3.6a1.3 1.3 0 0 1 2.2-1.4L9 14"/>',
  sphere: '<circle cx="12" cy="11" r="7"/><ellipse cx="12" cy="11" rx="7" ry="2.5"/><ellipse cx="12" cy="11" rx="2.5" ry="7" transform="rotate(30 12 11)" class="h"/><path d="M12 18v3M8.5 21.5h7"/>',
  scope: '<path d="M3.5 13.5l13-6 2 4.2-13 6z"/><path d="M16.5 7.5l2.6-1.2 1.8 4-2.6 1.2"/><path d="M10 15l-3 6.5M11 14.5l3 7"/><path d="M6.5 13.2l1 2.2M9 12l1 2.2" class="h"/>',
  compass: '<circle cx="12" cy="12" r="8.5"/><path d="M12 4.5l2 7.5-2 7.5-2-7.5z"/><path d="M4.5 12h2M17.5 12h2" class="h"/>',
  glass: '<path d="M7 3h10M7 21h10M8 3c0 5 8 6 8 9s-8 4-8 9M16 3c0 5-8 6-8 9s8 4 8 9"/><path d="M10 18.5h4" class="h"/>',
  medal: '<circle cx="12" cy="9" r="5"/><path d="M9 13.5L7.5 21l4.5-2.5 4.5 2.5L15 13.5"/><path d="M12 6.5l.8 1.7 1.9.2-1.4 1.3.4 1.9-1.7-1-1.7 1 .4-1.9-1.4-1.3 1.9-.2z" class="h"/>',
  gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
  seal: '<circle cx="12" cy="12" r="8"/><path d="M12 6l1.5 4.5H18l-3.7 2.7 1.4 4.4L12 15l-3.7 2.6 1.4-4.4L6 10.5h4.5z" class="h"/>',
};
const engSvg = (k, cls = '') => `<svg class="eng ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ENG[k]}</svg>`;
function hashStr(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619); return h >>> 0; }
const CGLY = new Map();
function constGlyph(id) {
  if (CGLY.has(id)) return CGLY.get(id);
  let h = hashStr(id) || 1; const rn = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h, 3266489909)) >>> 0) / 4294967296;
  const n = 4 + (rn() * 3 | 0), pts = [];
  for (let t = 0; pts.length < n && t < 60; t++) { const x = 3.5 + rn() * 17, y = 3.5 + rn() * 17; if (pts.every(q => Math.hypot(q[0] - x, q[1] - y) > 4.2)) pts.push([x, y]); }
  pts.sort((a, b) => a[0] - b[0]);
  const f = v => v.toFixed(1);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`; for (let i = 1; i < pts.length; i++) d += `L${f(pts[i][0])} ${f(pts[i][1])}`;
  if (pts.length > 4 && rn() < 0.5) d += `M${f(pts[1][0])} ${f(pts[1][1])}L${f(pts[pts.length - 2][0])} ${f(pts[pts.length - 2][1])}`;
  const m = (rn() * pts.length) | 0, [mx, my] = pts[m];
  const dots = pts.map((q, i) => i === m ? '' : `<circle cx="${f(q[0])}" cy="${f(q[1])}" r="${f(0.8 + rn() * 0.6)}" class="f"/>`).join('');
  const star = `<path d="M${f(mx)} ${f(my - 3.2)}L${f(mx + 0.8)} ${f(my - 0.8)}L${f(mx + 3.2)} ${f(my)}L${f(mx + 0.8)} ${f(my + 0.8)}L${f(mx)} ${f(my + 3.2)}L${f(mx - 0.8)} ${f(my + 0.8)}L${f(mx - 3.2)} ${f(my)}L${f(mx - 0.8)} ${f(my - 0.8)}Z" class="f"/>`;
  const svg = `<svg class="eng cg" viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" class="h"/>${dots}${star}</svg>`;
  CGLY.set(id, svg); return svg;
}
const GEN_ENG = { spark: 'spark', lantern: 'lantern', comet: 'comet', moon: 'moon', sun: 'sun', pulsar: 'pulsar', nebula: 'nebula', white: 'white', metro: 'metro', bang: 'bang', quasar: 'quasar', anvil: 'anvil' };
// icône d'une amélioration : la gravure de sa forge, ou de sa famille
function upgIcon(u) {
  const g = /^g(\d+)t/.exec(u.id); if (g) return engSvg(GEN_ENG[GENS[+g[1]].id] || 'spark');
  return engSvg(/^click/.test(u.id) ? 'hand' : /^glob/.test(u.id) ? 'sphere' : /^luck/.test(u.id) ? 'scope' : 'seal');
}

const UPGRADES = [];
// repère court sur les tuiles d'amélioration (deux tuiles de la même forge ne se ressemblent plus)
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
const upgTag = u => { const f = /^click(\d+)$/.exec(u.id); if (f && +f[1] >= 3) return String(+f[1] - 2); const m = /^g\d+t(\d+)$/.exec(u.id) || /^(?:click|luck|glob)(\d+)$/.exec(u.id); return m ? ROMAN[+m[1]] || '' : ''; };
// noms et descriptions calculés à la lecture : ils suivent la langue choisie
GENS.forEach((g, gi) => GEN_TIERS.forEach((th, ti) => UPGRADES.push({
  id: `g${gi}t${ti}`, ic: g.ic, cost: g.cost * TIER_COST[ti],
  get name() { return t('sf.upgName', { gen: g.name, tier: t('sf.tiers')[ti] }); }, get desc() { return t('sf.upgDesc', { gen: g.name }); },
  req: s => s.gens[gi] >= th, get reqTxt() { return `${th} ${g.name}`; }, fx: { gen: gi, mult: 2 },
})));
[[100, 1], [500, 5], [1e4, 10], [1e5, 0], [1e7, 0], [1e9, 0], [1e11, 0], [1e13, 0]].forEach(([c, n], i) => UPGRADES.push({
  id: 'click' + i, ic: i < 3 ? '🧤' : '👆', cost: c,
  get name() { return i < 3 ? t('sf.gloves', { r: 'I'.repeat(i + 1) }) : t('sf.fingers', { n: i - 2 }); },
  get desc() { return i < 3 ? t('sf.glovesDesc') : t('sf.fingersDesc'); },
  req: s => i < 3 ? s.gens[0] >= n || s.clicks >= 10 * (i + 1) : s.gens.reduce((a, b) => a + b, 0) >= 25 * (i - 2),
  get reqTxt() { return i < 3 ? t('sf.reqClicks', { n: 10 * (i + 1) }) : t('sf.reqForges', { n: 25 * (i - 2) }); }, fx: i < 3 ? { click: 2, gen: 0, mult: 2 } : { clickPct: 0.01 },
}));
[1e6, 1e8, 1e10, 1e12, 1e14, 1e16].forEach((c, i) => UPGRADES.push({
  id: 'glob' + i, ic: '🎼', cost: c, get name() { return t('sf.glob')[i]; }, get desc() { return t('sf.globDesc'); }, req: s => s.runTotal >= c / 4, get reqTxt() { return t('sf.reqProduced', { n: fmt(c / 4) }); }, fx: { global: 1.25 },
}));
[7.7e4, 7.7e7, 7.7e10].forEach((c, i) => UPGRADES.push({
  id: 'luck' + i, ic: '🔭', cost: c, get name() { return t('sf.luck')[i]; }, get desc() { return t('sf.luckDesc'); }, req: s => s.cometsTotal >= i, get reqTxt() { return t('sf.reqComets', { n: i }); }, fx: { luck: 0.15 },
}));

// Constellation (méta-progression, payée en Novae, survit aux Supernovae)
// Constellation (méta-progression, payée en Novae, survit aux Supernovae). v2 (2026-10-05) : 34 nœuds, coûts de 1 à
// 500 000 Novae — l'ancienne carte (14 nœuds) était complète en ~2 h 20 de jeu appliqué (tools/sf-long.mjs).
const META = [
  { id: 'm_click', ic: '👆', cost: 1, x: 50, y: 4, req: [] },
  { id: 'm_start', ic: '🎁', cost: 3, x: 20, y: 12, req: ['m_click'] },
  { id: 'm_auto', ic: '🤖', cost: 5, x: 50, y: 12, req: ['m_click'] },
  { id: 'm_cheap', ic: '🏷️', cost: 5, x: 80, y: 12, req: ['m_click'] },
  { id: 'm_off', ic: '🌙', cost: 10, x: 8, y: 22, req: ['m_start'] },
  { id: 'm_keep', ic: '📜', cost: 15, x: 26, y: 22, req: ['m_start'] },
  { id: 'm_comet', ic: '☄️', cost: 10, x: 58, y: 22, req: ['m_auto'] },
  { id: 'm_econ', ic: '📉', cost: 20, x: 92, y: 22, req: ['m_cheap'] },
  { id: 'm_long', ic: '⏳', cost: 25, x: 52, y: 32, req: ['m_comet'] },
  { id: 'm_ach', ic: '🏆', cost: 60, x: 10, y: 43, req: ['m_off', 'm_mile'] },
  { id: 'm_upg', ic: '🛠️', cost: 40, x: 86, y: 32, req: ['m_econ'] },
  { id: 'm_nova', ic: '🌟', cost: 150, x: 50, y: 53, req: ['m_syn'] },
  { id: 'm_sing', ic: '🕳️', cost: 1500, x: 30, y: 63, req: ['m_nova'] },
  { id: 'm_crunch', ic: '♾️', cost: 2000, x: 70, y: 63, req: ['m_nova'] },
  // nouveaux nœuds
  { id: 'm_crit', ic: '🎯', cost: 15, x: 42, y: 22, req: ['m_auto'] },
  { id: 'm_click2', ic: '✋', cost: 25, x: 74, y: 22, req: ['m_cheap'] },
  { id: 'm_mile', ic: '🪜', cost: 30, x: 18, y: 32, req: ['m_keep'] },
  { id: 'm_auto2', ic: '⚙️', cost: 60, x: 36, y: 32, req: ['m_crit'] },
  { id: 'm_shower', ic: '🌠', cost: 50, x: 68, y: 32, req: ['m_comet'] },
  { id: 'm_start2', ic: '🧰', cost: 80, x: 28, y: 43, req: ['m_mile'] },
  { id: 'm_syn', ic: '🔗', cost: 100, x: 50, y: 43, req: ['m_long', 'm_auto2'] },
  { id: 'm_lucky', ic: '🍀', cost: 90, x: 70, y: 43, req: ['m_shower'] },
  { id: 'm_eclipse', ic: '🌑', cost: 120, x: 90, y: 43, req: ['m_upg'] },
  { id: 'm_off2', ic: '🛌', cost: 400, x: 12, y: 53, req: ['m_ach'] },
  { id: 'm_keep2', ic: '🗃️', cost: 800, x: 30, y: 53, req: ['m_start2'] },
  { id: 'm_quasar', ic: '🔆', cost: 1500, x: 72, y: 53, req: ['m_lucky'] },
  { id: 'm_ach2', ic: '🎖️', cost: 6000, x: 10, y: 63, req: ['m_off2'] },
  { id: 'm_meteor', ic: '🔮', cost: 4000, x: 90, y: 63, req: ['m_eclipse', 'm_quasar'] },
  { id: 'm_nova2', ic: '💠', cost: 20000, x: 22, y: 74, req: ['m_sing'] },
  { id: 'm_auto3', ic: '🦾', cost: 35000, x: 50, y: 74, req: ['m_sing', 'm_crunch'] },
  { id: 'm_crunch2', ic: '🌀', cost: 60000, x: 78, y: 74, req: ['m_crunch'] },
  { id: 'm_loom', ic: '⚒️', cost: 120000, x: 34, y: 85, req: ['m_nova2'] },
  { id: 'm_genesis', ic: '🌱', cost: 200000, x: 66, y: 85, req: ['m_crunch2'] },
  { id: 'm_omega', ic: 'Ω', cost: 500000, x: 50, y: 96, req: ['m_loom', 'm_genesis', 'm_auto3'] },
];
// Maîtrise stellaire : puits de Novae sans fin (×1,15 de production par niveau, coût doublé à chaque niveau)
const mastCost = () => Math.round(500 * Math.pow(1.5, S.mast || 0));
function buyMastery() { if (S.novaBank < mastCost()) return false; S.novaBank -= mastCost(); S.mast = (S.mast || 0) + 1; return true; }

const ACH = [];
[1e3, 1e6, 1e9, 1e12, 1e15, 1e18, 1e21].forEach((n, i) =>
  ACH.push({ id: 'tot' + n, ic: '💰', get name() { return t('sf.ach')[i]; }, get desc() { return t('sf.aTotDesc', { n: fmt(n) }); }, test: s => s.lifeTotal >= n }));
[100, 1000, 10000].forEach(n => ACH.push({ id: 'clk' + n, ic: '🖱️', get name() { return t('sf.reqClicks', { n: num(n) }); }, get desc() { return t('sf.aClkDesc', { n: num(n) }); }, test: s => s.lifeClicks >= n }));
GENS.forEach((g, i) => ACH.push({ id: 'own' + i, ic: g.ic, get name() { return t('sf.aOwn', { gen: g.name }); }, get desc() { return t('sf.aOwnDesc', { gen: g.name }); }, test: s => s.gens[i] >= 50 }));
ACH.push({ id: 'bigbang', ic: '🌌', name: 'Big Bang', get desc() { return t('sf.aBBDesc'); }, test: s => (s.bigbangs || 0) >= 1 });
[5, 20].forEach(n => ACH.push({ id: 'bb' + n, ic: '🌌', get name() { return t('sf.aBBn', { n }); }, get desc() { return t('sf.aBBnDesc', { n }); }, test: s => (s.bigbangs || 0) >= n }));
[3, 6].forEach(n => ACH.push({ id: 'eng' + n, ic: '⚙️', get name() { return t('sf.engName') + ' ' + n; }, get desc() { return t('sf.aEngDesc', { n }); }, test: s => (s.eng || 0) >= n }));
ACH.push({ id: 'allchal', ic: '🏅', get name() { return t('sf.aAllChal'); }, get desc() { return t('sf.aAllChalDesc'); }, test: s => Object.keys(s.chalDone || {}).length >= 6 });
[[1, '💥'], [5, '🌠'], [20, '🌌']].forEach(([n, ic]) => ACH.push({ id: 'pre' + n, ic, get name() { return t('sf.aPre', { n }); }, get desc() { return t('sf.aPreDesc', { n }); }, test: s => s.prestiges >= n }));
[[1, '⭐'], [10, '🌟'], [50, '🎇']].forEach(([n, ic]) => ACH.push({ id: 'com' + n, ic, get name() { return t('sf.aCom', { n }); }, get desc() { return t('sf.aComDesc', { n }); }, test: s => s.lifeComets >= n }));
[1e3, 1e6, 1e9].forEach(n => ACH.push({ id: 'dps' + n, ic: '⚡', name: `${fmt(n)} /s`, get desc() { return t('sf.aDpsDesc', { n: fmt(n) }); }, test: s => dps() >= n }));

// Défis : une run sous contrainte (entrer = repartir de zéro, sans Novae), objectif en poussière
// produite ; la réussite débloque une récompense permanente et lève la contrainte.
const CHALS = [
  { id: 'c_hands', ic: '🙌', goal: 1e6, need: 1 },
  { id: 'c_short', ic: '🧱', goal: 1e6, need: 1 },
  { id: 'c_noupg', ic: '🚫', goal: 3e6, need: 2 },
  { id: 'c_infl', ic: '📈', goal: 1e7, need: 2 },
  { id: 'c_dim', ic: '🌑', goal: 2e6, need: 3 },
  { id: 'c_rush', ic: '⏱️', goal: 5e6, need: 4, time: 900 },
];
// Big Bang : 2e couche de prestige. Réinitialise Novae et Constellation contre des Singularités
// (gain de Novae +50 % et production +10 % chacune), à dépenser dans la Galaxie (automatisations).
const BIGBANG_MIN = 100000;   // v2 : vers 3 h de jeu appliqué (tools/sf-pace.mjs), quand la Constellation n'a plus que ses nœuds de fin
const GALAXY = [
  { id: 'g_auto', ic: '🤖', cost: 1 },
  { id: 'g_comet', ic: '🧲', cost: 1 },
  { id: 'g_nova', ic: '🌟', cost: 2 },
  { id: 'g_upg', ic: '🛠️', cost: 3 },
  { id: 'g_big', ic: '🌌', cost: 5 },
];
// textes des données : dictionnaires js/lang/forge*.js (ils suivent la langue choisie)
const i18nProps = (arr, key, fields) => arr.forEach((o, i) => fields.forEach((f, k) => Object.defineProperty(o, f, { get: () => t(key)[i][k], configurable: true })));
i18nProps(GENS, 'sf.gens', ['name', 'desc']);
i18nProps(META, 'sf.meta', ['name', 'desc']);
i18nProps(CHALS, 'sf.chal', ['name', 'desc', 'reward']);
i18nProps(GALAXY, 'sf.gal', ['name', 'desc']);
const gal = id => !!(S.gal && S.gal[id]);
// Plafonds doux de fin de partie : linéaire jusqu'au seuil, puis en racine carrée. Sans eux, Novae et Singularités
// s'entretenaient l'une l'autre et la partie s'emballait en quelques minutes (tools/sf-long.mjs).
const soft = (x, cap) => x <= cap ? x : cap * Math.sqrt(x / cap);
// en défi, ni Novae ni Singularités ne comptent (« repart de zéro, sans Novae ») : le défi reste un vrai défi
const NOVA = { d: 2e5, x: 1e11, r: 5, cap: 100 };
const effNova = () => S.chal ? 0 : soft(S.novaTotal, NOVA.cap);   // au-delà du plafond doux, le bonus croît en racine : la Constellation et la Maîtrise prennent le relais
const effSing = (n = S.sing || 0) => S.chal && n === (S.sing || 0) ? 0 : soft(n, 10);
// Moteur stellaire : puits de Singularités sans fin (×1,25 de production par niveau, coût doublé à chaque niveau)
const ENG_BASE = 5;
const engCost = () => ENG_BASE * Math.pow(2, S.eng || 0);
function buyEngine() {
  if ((S.singBank || 0) < engCost()) return false;
  S.singBank -= engCost(); S.eng = (S.eng || 0) + 1; return true;
}
const singGain = () => Math.floor(soft(Math.sqrt(S.novaTotal / 50), 4));   // plafond doux au-delà de 4 par Big Bang
const inChal = id => S.chal === id;
const chalDone = id => !!(S.chalDone && S.chalDone[id]);

// ---------- état ----------
function fresh() {
  return {
    dust: 0, runTotal: 0, lifeTotal: 0, clicks: 0, lifeClicks: 0, gens: GENS.map(() => 0), upg: {}, cometsTotal: 0, lifeComets: 0,
    novaTotal: 0, novaBank: 0, meta: {}, ach: {}, prestiges: 0, chal: null, chalT: 0, chalDone: {}, sing: 0, singBank: 0, gal: {}, bigbangs: 0, buffs: [], last: Date.now(), started: Date.now(),
  };
}
let S = fresh();

const has = id => !!S.meta[id];
function fmt(n) {
  if (!isFinite(n)) return '∞';
  const sci = () => { const [mn, ex] = n.toExponential(2).split('e'); return (+mn).toLocaleString(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + 'e' + ex.replace('+', ''); };
  if (SCI && n >= 1e6) return sci();
  if (n < 1000) return n < 10 && n % 1 ? n.toLocaleString(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : Math.floor(n).toString();
  if (n < 1e6) return num(Math.floor(n));
  const units = ['M', 'G', 'T', 'P', 'E', 'Z', 'Y', 'R', 'Q'];
  const e = Math.floor(Math.log10(n) / 3) - 2;
  if (e >= units.length) return sci();
  return (n / Math.pow(1000, e + 2)).toLocaleString(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '\u00a0' + units[e];
}

// ---------- calculs ----------
function genMult(i) {
  let m = 1;
  for (const u of UPGRADES) if (S.upg[u.id] && u.fx.gen === i) m *= u.fx.mult;
  const mk = has('m_mile') ? 2.5 : 2; for (const t of MILESTONES) if (S.gens[i] >= t) m *= mk;
  if (has('m_syn') && i > 0) m *= 1 + S.gens[i - 1] * 0.005;   // chaque forge du rang d'en dessous : +0,5 %
  if (i < 3 && chalDone('c_short')) m *= 3;
  return m;
}
const novaPct = () => 0.05 + (has('m_nova') ? 0.01 : 0) + (has('m_nova2') ? 0.01 : 0);   // +5 % par Nova, plafond doux à 100 Novae (effNova)
function globalMult() {
  let m = 1;
  for (const u of UPGRADES) if (S.upg[u.id] && u.fx.global) m *= u.fx.global;
  m *= 1 + effNova() * novaPct();
  m *= 1 + Object.keys(S.ach).length * (has('m_ach2') ? 0.05 : has('m_ach') ? 0.03 : 0.01);
  if (has('m_omega')) m *= 10;
  if (S.mast && !S.chal) m *= Math.pow(1.15, S.mast);
  if (has('m_sing')) m *= 3;
  if (chalDone('c_hands')) m *= 1.5;
  m *= 1 + effSing() * (gal('g_big') ? 0.2 : 0.1);
  if (S.eng && !S.chal) m *= Math.pow(1.25, S.eng);
  if (inChal('c_dim')) m *= 0.1;
  if (boostOn()) m *= 2;   // vidéo « ×2 pendant 4 h » ou achat « Moteur éternel » (application)
  for (const b of S.buffs) m *= buffMult(b);
  return m;
}
function baseDps() { let d = 0; GENS.forEach((g, i) => d += S.gens[i] * g.prod * genMult(i)); return d; }
function dps() { return baseDps() * globalMult(); }
// revenu de l'Automate, compté dans le « /s » affiché et dans les gains hors ligne
const autoDps = () => has('m_auto') && !inChal('c_hands') ? autoRate() * clickValue() * (1 + critP(true) * 9) : 0;
const totalDps = () => dps() + autoDps();
function clickValue() {
  if (inChal('c_hands') || (!has('m_eclipse') && S.buffs.some(b => b.type === 'eclipse'))) return 0;
  let c = 1;
  for (const u of UPGRADES) if (S.upg[u.id] && u.fx.click) c *= u.fx.click;
  if (has('m_click')) c *= 3;
  let pct = 0; for (const u of UPGRADES) if (S.upg[u.id] && u.fx.clickPct) pct += u.fx.clickPct;
  if (has('m_click2')) pct += 0.02;
  c = c * (1 + effNova() * 0.03) + dps() * pct;
  for (const b of S.buffs) if (b.type === 'click') c *= 777; else if (b.type === 'void') c *= 100;
  return c;
}
const growth = () => inChal('c_infl') ? 1.25 : (has('m_econ') ? 1.14 : 1.15) - (chalDone('c_infl') ? 0.005 : 0);
const genBase = i => GENS[i].cost * (has('m_cheap') ? 0.9 : 1);
function costN(i, n) { const r = growth(), b = genBase(i) * Math.pow(r, S.gens[i]); return b * (Math.pow(r, n) - 1) / (r - 1); }
function maxAffordable(i) {
  const r = growth(), b = genBase(i) * Math.pow(r, S.gens[i]);
  return Math.max(0, Math.floor(Math.log(S.dust * (r - 1) / b + 1) / Math.log(r)));
}
const upgCost = u => u.cost * (has('m_upg') ? 0.75 : 1) * (chalDone('c_noupg') ? 0.85 : 1);
// v2 : les Novae suivent la racine CUBIQUE de toute la poussière produite depuis le dernier Big Bang (comme les puces
// célestes de Cookie Clicker) : pour gagner autant qu'à la run précédente, il faut produire bien plus — la carte se remplit
// en dizaines d'heures, pas en deux.
const novaMult = () => (has('m_crunch') ? 2 : 1) * (has('m_crunch2') ? 1.5 : 1) * (chalDone('c_dim') ? 1.25 : 1) * (1 + 0.5 * effSing());
// Courbe des Novae, sur le total cumulé depuis le dernier Big Bang : racine cubique jusqu'à 1e11 (premières parties
// généreuses), racine 5e au-delà. La production réagit à peu près à la puissance 6 du multiplicateur de départ d'une
// partie : en racine cubique pure, chaque partie rapportait ~500× la précédente et la Constellation était finie en 2 h.
const novaCurve = tot => (tot <= NOVA.x ? Math.cbrt(Math.max(0, tot) / NOVA.d) : Math.cbrt(NOVA.x / NOVA.d) * Math.pow(tot / NOVA.x, 1 / NOVA.r)) * novaMult();
function novaGainAt(total) { const b = S.snBase || 0; return Math.max(0, Math.floor(novaCurve(b + total)) - Math.floor(novaCurve(b))); }
function novaGain() { if (S.chal) return 0; return novaGainAt(S.runTotal); }
// multiplicateur de production d'un effet en cours (les clics ×777 / ×100 sont comptés dans clickValue)
function buffMult(b) { return b.type === 'frenzy' ? 7 : b.type === 'meteor' ? 77 : b.type === 'eclipse' ? (has('m_eclipse') ? 6 : 2) : b.type === 'echo' ? 15 : b.type === 'surge' ? b.m : 1; }
function luck() { let l = 1; for (const u of UPGRADES) if (S.upg[u.id] && u.fx.luck) l += u.fx.luck; if (has('m_comet')) l *= 2; if (has('m_shower')) l *= 1.5; if (has('m_lucky')) l *= 1.5; if (chalDone('c_rush')) l *= 1.25; return l; }

// ---------- monétisation (application Android uniquement ; sur le web, PT_MON n'existe pas) ----------
const BOOST_H = 4, BOOST_MAX_H = 8, ETERNAL = 'eternal_boost';
const MON = () => window.PT_MON;
const eternal = () => !!(MON() && MON().owns(ETERNAL));
const boostLeft = () => Math.max(0, (S.adBoostUntil || 0) - Date.now());
const boostOn = () => eternal() || boostLeft() > 0;
let offPending = 0, offUntil = 0;   // gains hors-ligne qu'une vidéo peut doubler (proposé une minute)
function hm(ms) { const m = Math.ceil(ms / 60000); return m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}` : `${m} min`; }
async function watchBoost() {
  if (!MON() || !(await MON().reward('boost'))) return;
  S.adBoostUntil = Math.min(Date.now() + BOOST_MAX_H * 3600e3, Math.max(Date.now(), S.adBoostUntil || 0) + BOOST_H * 3600e3);
  toast(t('sf.boostOn')); flash = 0.4; save(); refresh(true);
}
// Carte « Bon retour » : durée d'absence, gains, et (application) le bouton pour les doubler
function welcomeBack(away, v) {
  if (away < 300) { toast(t('sf.away', { v: fmt(v) })); return; }
  let o = $('sf-back');
  if (!o) {
    o = document.createElement('div'); o.className = 'overlay hidden'; o.id = 'sf-back';
    o.innerHTML = '<div class="card"><h2></h2><p class="sf-backtxt"></p><button class="btn bp-vid hidden" id="sf-backdbl"></button><button class="btn" id="sf-backok" data-back></button></div>';
    $('tab-forge').appendChild(o);
    $('sf-backok').onclick = () => o.classList.add('hidden');
    $('sf-backdbl').onclick = async () => { await watchOffline(); o.classList.add('hidden'); };
  }
  o.querySelector('h2').textContent = t('sf.backTitle');
  o.querySelector('.sf-backtxt').innerHTML = t('sf.backTxt', { time: hm(away * 1000), v: fmt(v) }) + (has('m_off') ? '' : '<br><span class="muted small">' + t('sf.backHint') + '</span>');
  const canAd = !!(MON() && MON().canReward());
  $('sf-backdbl').classList.toggle('hidden', !canAd); $('sf-backdbl').textContent = t('sf.offDouble', { v: fmt(v) });
  $('sf-backok').textContent = t('sf.backOk');
  o.classList.remove('hidden');
}
async function watchOffline() {
  const v = offPending;
  if (!v || !MON() || !(await MON().reward('offline'))) return;
  earn(v); offPending = 0; toast(t('sf.offDoubled', { v: fmt(v) })); save(); refresh(true);
}

// ---------- actions ----------
function earn(v) { S.dust += v; S.runTotal += v; S.lifeTotal += v; }
let buyMult = 1;
function buyGen(i) {
  if (inChal('c_short') && i > 2) return;
  if (GENS[i].meta && !has(GENS[i].meta)) return;
  let n = buyMult === 'max' ? maxAffordable(i) : buyMult;
  if (n <= 0) return;
  const c = costN(i, n);
  if (c > S.dust) return;
  S.dust -= c; S.gens[i] += n; window.ptEvent && window.ptEvent('sf_forges', n);
  sfx(520 + i * 30, 0.06, 'triangle');
  refresh(true);
}
// les moins chères d'abord : ce que « Tout acheter » prendrait avec la poussière actuelle
function affordableUpg() {
  let d = S.dust; const out = [];
  for (const u of UPGRADES.filter(u => !S.upg[u.id] && u.req(S)).sort((a, b) => upgCost(a) - upgCost(b))) { const c = upgCost(u); if (c > d) break; d -= c; out.push(u); }
  return out;
}
function buyAllUpg() {
  if (inChal('c_noupg')) { toast(t('sf.ascetic')); return; }
  const l = affordableUpg(); if (!l.length) return;
  for (const u of l) { S.dust -= upgCost(u); S.upg[u.id] = 1; }
  sfx(880, 0.12, 'triangle'); sfx(1320, 0.12, 'triangle', 0.08); sfx(1760, 0.14, 'triangle', 0.16);
  toast(t('sf.boughtN', { n: l.length }));
  refresh(true);
}
function buyUpg(u) {
  const c = upgCost(u);
  if (inChal('c_noupg')) { toast(t('sf.ascetic')); return; }
  if (S.upg[u.id] || c > S.dust || !u.req(S)) return;
  S.dust -= c; S.upg[u.id] = 1;
  sfx(880, 0.12, 'triangle'); sfx(1320, 0.12, 'triangle', 0.08);
  refresh(true);
}
function buyMeta(m) {
  if (S.meta[m.id] || S.novaBank < m.cost || !m.req.every(r => S.meta[r])) return;
  S.novaBank -= m.cost; S.meta[m.id] = 1;
  toast(t('sf.unlocked', { ic: '✦', name: m.name }));
  sfx(660, 0.2, 'sine'); sfx(990, 0.3, 'sine', 0.1);
  refresh(true);
}
// Repart de zéro en gardant tout ce qui est permanent (utilisé par Supernova et par les défis).
function resetRun(extra) {
  const snBase = (extra && extra.prestiges > S.prestiges) ? (S.snBase || 0) + S.runTotal : (S.snBase || 0);
  const keep = { snBase, mast: S.mast || 0, novaTotal: S.novaTotal, novaBank: S.novaBank, meta: S.meta, ach: S.ach, prestiges: S.prestiges, lifeTotal: S.lifeTotal, lifeClicks: S.lifeClicks, lifeComets: S.lifeComets, chalDone: S.chalDone || {}, sing: S.sing || 0, singBank: S.singBank || 0, gal: S.gal || {}, eng: S.eng || 0, bigbangs: S.bigbangs || 0, adBoostUntil: S.adBoostUntil || 0, ...extra };   // le boost vidéo survit aux Supernovae
  const kept = {};
  if (has('m_keep')) for (const k of ['click0', 'click1', 'click2']) if (S.upg[k]) kept[k] = 1;
  if (has('m_keep2')) for (const k in S.upg) if (/^g\d+t0$/.test(k)) kept[k] = 1;   // les améliorations « I » de chaque forge
  S = Object.assign(fresh(), keep); S.upg = kept;
  if (has('m_start2')) { S.gens[0] = 50; S.gens[1] = 25; S.gens[2] = 15; S.gens[3] = 5; }
  else if (has('m_start')) { S.gens[0] = 10; S.gens[1] = 5; }
}
async function startChal(c) {
  if (S.chal || chalDone(c.id) || S.prestiges < c.need) return;
  if (!await ptConfirm(noEmoji(t('sf.chalConfirm', { ic: c.ic, name: c.name, desc: c.desc, goal: fmt(c.goal), time: c.time ? t('sf.inMin', { n: c.time / 60 }) : '', reward: c.reward })), t('sf.chalStart'))) return;
  resetRun({ chal: c.id, chalT: 0 });
  S.gens[0] = Math.max(S.gens[0], 10); S.gens[1] = Math.max(S.gens[1], 5);   // départ du Pack de démarrage : jamais de départ mort (Mains libres)
  comet = null; flash = 0.6; toast(t('sf.chalStarted', { ic: '✦', name: c.name })); sfx(330, 0.4, 'square', 0.05);
  save(); refresh(true);
}
async function quitChal(silent) {
  if (!S.chal) return;
  if (!silent && !await ptConfirm(noEmoji(t('sf.chalQuitQ')), t('sf.giveUp'))) return;
  resetRun({ chal: null }); save(); refresh(true);
}
function checkChal(dt) {
  if (!S.chal) return;
  const c = CHALS.find(x => x.id === S.chal);
  S.chalT += dt;
  if (c.time && S.chalT > c.time) { toast(t('sf.chalTimeUp', { name: c.name })); quitChal(true); return; }
  if (S.runTotal >= c.goal) {
    S.chalDone[c.id] = 1; S.chal = null;
    toast(t('sf.chalWin', { name: c.name, reward: c.reward })); flash = 0.8;
    sfx(660, 0.3, 'triangle', 0.08); sfx(990, 0.4, 'triangle', 0.06);
    save(); refresh(true);
  }
}

async function bigBang() {
  if (S.chal) { toast(t('sf.bbChal')); return; }
  const g = singGain();
  if (S.novaTotal < BIGBANG_MIN || g < 1) return;
  if (!await ptConfirm(noEmoji(t('sf.bbConfirm', { nova: num(S.novaTotal), g, np: Math.round((effSing((S.sing || 0) + g) - effSing()) * 50), pp: Math.round((effSing((S.sing || 0) + g) - effSing()) * (gal('g_big') ? 20 : 10)) })), t('sf.bbOk'))) return;
  const start = gal('g_nova') ? 10 : 0;
  resetRun({ snBase: 0, mast: 0, novaTotal: start, novaBank: start, meta: {}, sing: (S.sing || 0) + g * (has('m_genesis') ? 2 : 1), singBank: (S.singBank || 0) + g, bigbangs: (S.bigbangs || 0) + 1 });
  if (gal('g_nova')) S.meta = { m_click: 1 };
  flash = 1.5; sfx(60, 2, 'sawtooth', 0.1); sfx(90, 2, 'triangle', 0.08);
  toast(t('sf.bbToast', { n: g }));
  checkAch(); save(); refresh(true);
}
function buyGal(x) {
  if (gal(x.id) || (S.singBank || 0) < x.cost) return;
  S.singBank -= x.cost; S.gal[x.id] = 1; toast(t('sf.unlocked', { ic: '✦', name: x.name })); sfx(660, 0.3, 'triangle', 0.08); refresh(true);
}

async function prestige() {
  if (S.chal) { toast(t('sf.snChal')); return; }
  const g = novaGain();
  if (g < 1) return;
  const warn = g <= 3 ? t('sf.snWarn', { n: novaGainAt(S.runTotal * 4) }) : '';
  if (!await ptConfirm(noEmoji(t('sf.snConfirm', { g: fmt(g), n: g, pct: Math.round((soft(S.novaTotal + g, NOVA.cap) - effNova()) * novaPct() * 100), warn })), t('sf.snOk'))) return;
  resetRun({ novaTotal: S.novaTotal + g, novaBank: S.novaBank + g, prestiges: S.prestiges + 1 });
  snAnim = 1.8; snBoom = false;
  sfx(110, 1.2, 'sawtooth', 0.08);
  toast(t('sf.snToast', { n: g }));
  checkAch(); save(); refresh(true);
}

// ---------- comètes dorées ----------
let comet = null, nextComet = 40 + Math.random() * 60;
const buffDur = () => (has('m_long') ? 2 : 1) * (chalDone('c_rush') ? 1.25 : 1);
function spawnComet() {
  const fromLeft = Math.random() < 0.5;
  const meteor = Math.random() < 0.08 * luck() * (has('m_meteor') ? 2 : 1);   // rare, plus fréquent avec la Chance
  const dark = !meteor && (S.prestiges || 0) >= 1 && Math.random() < 0.12;   // comète sombre : bonus fort ou perte, au choix du joueur
  comet = { meteor, dark, x: fromLeft ? -0.1 : 1.1, y: 0.15 + Math.random() * 0.5, vx: (fromLeft ? 1 : -1) * (0.05 + Math.random() * 0.03) / (0.8 + luck() * 0.2), vy: 0.01 * (Math.random() - 0.5), t: 0 };
}
function catchComet() {
  window.ptEvent && window.ptEvent('sf_comets', 1);
  S.cometsTotal++; S.lifeComets++;
  const r = Math.random();
  if (comet.meteor) {
    const md = 7 * buffDur() * (has('m_meteor') ? 2 : 1); S.buffs.push({ type: 'meteor', t: md, max: md }); toast(t('sf.meteorT', { s: md })); flash = 0.5;
  } else if (comet.dark) {
    if (r < 0.5) { const d = 20 * buffDur(); S.buffs.push({ type: 'echo', t: d, max: d }); toast(t('sf.echoT', { s: d })); flash = 0.6; }
    else if (r < 0.8) { const v = Math.min(S.dust * 0.05, dps() * 1800); S.dust -= v; toast(t('sf.drainT', { v: fmt(v) })); }
    else { const d = 10 * buffDur(); S.buffs.push({ type: 'void', t: d, max: d }); toast(t('sf.voidT', { s: d })); }
  } else if (r < 0.42) {
    const v = (Math.min(S.dust * 0.15, dps() * 900) + 13) * (has('m_shower') ? 3 : 1);
    earn(v); toast(t('sf.goldRain', { v: fmt(v) }));
  } else if (r < 0.9 && r >= 0.78 && S.gens.some((n, i) => n > 0 && !GENS[i].meta)) {
    // élan de forge (le « bâtiment spécial » de Cookie Clicker) : +10 % par forge possédée d'un type tiré au sort
    const own = S.gens.map((n, i) => [n, i]).filter(([n, i]) => n > 0), [n, i] = own[(Math.random() * own.length) | 0], d = 30 * buffDur(), m = 1 + n * 0.1;
    S.buffs.push({ type: 'surge', t: d, max: d, m, g: i }); toast(t('sf.surgeT', { gen: GENS[i].name, m: fmt(m), s: d }));
  } else if (r < 0.85) {
    S.buffs.push({ type: 'frenzy', t: 60 * buffDur(), max: 60 * buffDur() }); toast(t('sf.frenzyT', { s: 60 * buffDur() }));
  } else {
    S.buffs.push({ type: 'click', t: 13 * buffDur(), max: 13 * buffDur() }); toast(t('sf.strikeT', { s: 13 * buffDur() }));
  }
  sfx(1200, 0.3, 'sine', 0.1); sfx(1600, 0.3, 'sine', 0.08);
  for (let k = 0; k < 40; k++) parts.push({ x: comet.x * cw, y: comet.y * ch, vx: (Math.random() - .5) * 8, vy: (Math.random() - .5) * 8, life: 1, col: comet.dark ? '#7a3cff' : comet.meteor ? '#d9a8ff' : '#ffd84d', s: 3 });
  comet = null; nextComet = (60 + Math.random() * 120) / luck();
  refresh(true);
}

// ---------- son ----------
let actx = null;
function sfx(f, d = 0.05, type = 'sine', v = 0.05) {
  if (window.PT_MUTE) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(v, actx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + d);
    o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + d);
  } catch (e) {}
}

// ---------- rendu de l'étoile ----------
const cv = $('sf-canvas'), cx2 = cv.getContext('2d');
let snAnim = 0, snBoom = false;
let cw = 0, ch = 0, dpr = 1, pulse = 0, flash = 0, parts = [], floats = [], bgStars = [];
function resizeStar() {
  const r = cv.getBoundingClientRect(); if (!r.width) return;
  dpr = Math.min(2, devicePixelRatio || 1); cw = r.width; ch = r.height;
  cv.width = cw * dpr; cv.height = ch * dpr;
  bgStars = Array.from({ length: 70 }, () => ({ x: Math.random() * cw, y: Math.random() * ch, s: Math.random() * 1.5 + 0.3, p: Math.random() * 6 }));
}
// l'étoile grossit quand le cadre est bas (mobile) : les orbites se resserrent pour tenir
const starR = () => Math.min(cw, ch) * (ch < 260 ? 0.3 : 0.2);
// gravure du disque : hachures croisées et pointillé sur la face à l'ombre (calculée une fois par taille, puis recopiée)
let engC = null, engR = 0;
function engraving(r) {
  const rq = Math.round(r); if (engC && engR === rq) return engC;
  engR = rq; engC = document.createElement('canvas'); const s = Math.ceil(rq * 2 + 4); engC.width = engC.height = Math.ceil(s * dpr);
  const g = engC.getContext('2d'); g.scale(dpr, dpr); g.translate(s / 2, s / 2);
  g.beginPath(); g.arc(0, 0, rq, 0, Math.PI * 2); g.clip();
  g.beginPath(); g.rect(-s, -s, 2 * s, 2 * s); g.arc(-rq * 0.32, -rq * 0.36, rq * 0.98, 0, Math.PI * 2); g.clip('evenodd');   // croissant d'ombre
  g.strokeStyle = 'rgba(70,45,15,.22)'; g.lineWidth = 0.8;
  for (let k = -14; k <= 14; k++) { const y = k * rq / 12; g.beginPath(); g.moveTo(-rq, y); g.quadraticCurveTo(0, y + rq * 0.22, rq, y); g.stroke(); }
  g.strokeStyle = 'rgba(70,45,15,.14)'; g.rotate(0.9);
  for (let k = -14; k <= 14; k++) { const y = k * rq / 10; g.beginPath(); g.moveTo(-rq, y); g.quadraticCurveTo(0, y + rq * 0.18, rq, y); g.stroke(); }
  g.rotate(-0.9);
  let h = 7; const rn = () => ((h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0) / 4294967296);
  g.fillStyle = 'rgba(60,38,12,.35)'; for (let k = 0; k < 260; k++) { const a = rn() * Math.PI * 2, d = rq * Math.sqrt(0.35 + rn() * 0.65); g.fillRect(Math.cos(a) * d, Math.sin(a) * d, 0.9, 0.9); }
  return engC;
}
function drawStar(dt, time) {
  const c = cx2; c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, cw, ch);
  bgStars.forEach(s => { c.globalAlpha = 0.3 + 0.3 * Math.sin(time * 1.5 + s.p); c.fillStyle = '#fff'; c.fillRect(s.x, s.y, s.s, s.s); });
  c.globalAlpha = 1;
  // Supernova : effondrement (0,6 s), éclair, puis l'étoile renaît pendant que l'onde de choc s'étend
  let snK = -1, snScale = 1;
  if (snAnim > 0) {
    snAnim = Math.max(0, snAnim - dt); snK = 1 - snAnim / 1.8;
    snScale = snK < 0.33 ? 1 - Math.pow(snK / 0.33, 2) * 0.82 : 0.18 + (1 - Math.pow(1 - (snK - 0.33) / 0.67, 3)) * 0.82;
    if (!snBoom && snK >= 0.33) { snBoom = true; flash = 1; sfx(55, 1.4, 'sawtooth', 0.09); for (let k = 0; k < 90; k++) { const a = Math.random() * 6.3, v = 3 + Math.random() * 9; parts.push({ x: cw / 2, y: ch / 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1.4, col: ['#fff4d0', '#f3d48a', '#9fc7ff', '#ffffff'][k % 4], s: 2 + Math.random() * 3 }); } }
  }
  const X = cw / 2, Y = ch / 2, R = starR() * (1 + pulse * 0.08) * snScale;
  pulse = Math.max(0, pulse - dt * 5);
  // couleur spectrale : jaune au début, blanc puis bleu-blanc à mesure que les Novae s'accumulent
  const sp = Math.min(1, Math.log10(1 + S.novaTotal) / 4), hue = sp < 0.5 ? 44 : 215, sat = sp < 0.5 ? 100 * (1 - 2 * sp) + 8 : (sp - 0.5) * 120 + 8;   // jaune → blanc → bleu-blanc, sans passer par le vert
  const frenzy = S.buffs.some(b => b.type === 'frenzy');
  const lim = Math.min(cw, ch) * 0.49;
  // astrolabe : anneaux gravés, graduations, glyphes de constellations (tournent lentement, en sens contraires)
  const ringA = 0.5 + pulse * 0.5;
  [[1.55, 72, 0.05], [1.95, 36, -0.03], [2.4, 12, 0.012]].forEach(([k, n, w], ri) => {
    const rr = Math.min(R * k, lim - 4 - ri * 2); if (rr < R * 1.2) return;
    c.save(); c.translate(X, Y); c.rotate(time * w * (frenzy ? 4 : 1));
    c.strokeStyle = `rgba(184,151,85,${0.55 * ringA + 0.2})`; c.lineWidth = 1; c.beginPath(); c.arc(0, 0, rr, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = `rgba(243,212,138,${0.45 * ringA + 0.25})`;
    for (let k2 = 0; k2 < n; k2++) { const a = k2 / n * Math.PI * 2, l = k2 % (n / 12) ? 4 : 9; c.beginPath(); c.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); c.lineTo(Math.cos(a) * (rr - l), Math.sin(a) * (rr - l)); c.stroke(); }
    if (ri === 2) for (let z = 0; z < 12; z++) {   // douze petites constellations, quelques étoiles reliées
      const a = (z + 0.5) / 12 * Math.PI * 2, gx = Math.cos(a) * (rr - 20), gy = Math.sin(a) * (rr - 20);
      const pts = [0, 1, 2, 3].map(q => [gx + Math.sin(z * 7.3 + q * 2.1) * 6, gy + Math.cos(z * 3.1 + q * 1.7) * 6]);
      c.strokeStyle = 'rgba(243,212,138,.45)'; c.beginPath(); pts.forEach(([x2, y2], q) => q ? c.lineTo(x2, y2) : c.moveTo(x2, y2)); c.stroke();
      c.fillStyle = '#f3d48a'; pts.forEach(([x2, y2]) => c.fillRect(x2 - 1, y2 - 1, 2, 2));
    }
    c.restore();
  });
  // orbites des forges : ellipses pointillées dorées, les forges y passent en points lumineux
  GENS.forEach((g, i) => {
    if (!S.gens[i]) return;
    const small = ch < 260, orb = R * (small ? 1.3 + i * 0.14 : 1.5 + i * 0.22);
    if (small ? orb * 0.42 > ch * 0.5 || orb > cw * 0.48 : orb > Math.min(cw, ch) * 0.5) return;
    c.setLineDash([2, 6]); c.strokeStyle = 'rgba(243,212,138,.18)'; c.beginPath(); c.ellipse(X, Y, orb, orb * 0.42, -0.3, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
    const n = Math.min(S.gens[i], 18), co = Math.cos(-0.3), si = Math.sin(-0.3);
    for (let k = 0; k < n; k++) {
      const a = time * (0.5 - i * 0.035) + k * Math.PI * 2 / n + i, ca = Math.cos(a) * orb, sa = Math.sin(a) * orb * 0.42;
      c.fillStyle = g.col; c.globalAlpha = Math.sin(a) > 0 ? 1 : 0.45;
      c.beginPath(); c.arc(X + ca * co - sa * si, Y + ca * si + sa * co, 1.8 + (Math.sin(a) > 0 ? 1 : 0), 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;
  });
  // couronne : halo et deux voiles de rayons doux qui tournent
  const gr = c.createRadialGradient(X, Y, R * 0.5, X, Y, R * 2.4);
  gr.addColorStop(0, `hsla(${hue},${sat}%,72%,.55)`); gr.addColorStop(0.4, `hsla(${hue},${sat}%,60%,.14)`); gr.addColorStop(1, 'hsla(0,0%,0%,0)');
  c.fillStyle = gr; c.beginPath(); c.arc(X, Y, R * 2.4, 0, Math.PI * 2); c.fill();
  // rayons gravés, comme les soleils des atlas anciens : traits droits et traits ondulés en alternance
  c.save(); c.translate(X, Y); c.rotate(time * 0.03 * (frenzy ? 6 : 1)); c.lineCap = 'round';
  for (let k = 0; k < 40; k++) {
    const a = k / 40 * Math.PI * 2, wavy = k % 2, l = R * (wavy ? 1.32 : 1.5 + 0.22 * Math.sin(k * 2.3) + 0.08 * Math.sin(time * 1.3 + k)), r0 = R * 0.98;
    c.strokeStyle = `hsla(${hue},${Math.min(60, sat)}%,82%,${wavy ? 0.32 : 0.45})`; c.lineWidth = wavy ? 0.9 : 1.2; c.beginPath();
    if (!wavy) { c.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); c.lineTo(Math.cos(a) * l, Math.sin(a) * l); }
    else for (let q = 0; q <= 12; q++) { const rr = r0 + (l - r0) * q / 12, off = Math.sin(q * 1.6 + time * 2) * R * 0.025, x = Math.cos(a) * rr - Math.sin(a) * off, y = Math.sin(a) * rr + Math.cos(a) * off; q ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.stroke();
  }
  c.restore();
  // cœur : plasma (granulation qui bouge), bord assombri, double liseré doré gravé
  c.save(); c.translate(X, Y);
  const core = c.createRadialGradient(-R * 0.15, -R * 0.2, R * 0.05, 0, 0, R);
  core.addColorStop(0, '#fffdf2'); core.addColorStop(0.45, `hsl(${hue},${sat}%,${72 + sp * 12}%)`); core.addColorStop(0.85, `hsl(${hue - 12},${sat}%,${52 + sp * 14}%)`); core.addColorStop(1, `hsl(${hue - 20},${sat}%,${38 + sp * 12}%)`);
  c.shadowColor = `hsl(${hue},${sat}%,65%)`; c.shadowBlur = 18; c.fillStyle = core; c.beginPath(); c.arc(0, 0, R * 0.82, 0, Math.PI * 2); c.fill(); c.shadowBlur = 0;
  const eg = engraving(R * 0.82); c.drawImage(eg, -eg.width / dpr / 2, -eg.height / dpr / 2, eg.width / dpr, eg.height / dpr);
  c.strokeStyle = `rgba(243,212,138,${0.55 + pulse * 0.45})`; c.lineWidth = 1.2; c.beginPath(); c.arc(0, 0, R * 0.9, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = 'rgba(243,212,138,.3)'; c.beginPath(); c.arc(0, 0, R * 0.96, 0, Math.PI * 2); c.stroke();
  c.restore();
  if (S.buffs.some(b => b.type === 'eclipse')) {
    c.fillStyle = 'rgba(6,6,18,.72)'; c.beginPath(); c.arc(X + R * 0.35, Y - R * 0.1, R * 1.05, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(200,200,255,.35)'; c.lineWidth = 3; c.beginPath(); c.arc(X + R * 0.35, Y - R * 0.1, R * 1.05, 0, Math.PI * 2); c.stroke();
  }
  // comète
  if (comet) {
    const px = comet.x * cw, py = comet.y * ch;
    const tg = c.createLinearGradient(px, py, px - comet.vx * cw * 3, py);
    const cc = comet.dark ? '110,50,200' : comet.meteor ? '198,139,255' : '255,216,77';
    tg.addColorStop(0, `rgba(${cc},.85)`); tg.addColorStop(1, `rgba(${cc},0)`);
    c.strokeStyle = tg; c.lineWidth = comet.meteor ? 14 : 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(px, py); c.lineTo(px - comet.vx * cw * 3, py - comet.vy * ch * 3); c.stroke();
    c.fillStyle = comet.dark ? '#1a0b2e' : comet.meteor ? '#f0dcff' : '#fff4b0'; c.shadowColor = comet.dark ? '#9a5cff' : comet.meteor ? '#c68bff' : '#ffd84d'; c.shadowBlur = 20; c.beginPath(); c.arc(px, py, 11 + Math.sin(time * 10) * 2, 0, 7); c.fill(); c.shadowBlur = 0;
  }
  // particules + nombres
  parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life -= dt * 1.5; c.globalAlpha = Math.max(0, p.life); c.fillStyle = p.col; c.fillRect(p.x, p.y, p.s, p.s); });
  parts = parts.filter(p => p.life > 0);
  c.textAlign = 'center';
  floats.forEach(f => { f.y -= dt * 60; f.life -= dt; c.globalAlpha = Math.max(0, f.life); c.font = f.small ? "13px 'NF Num',Georgia,serif" : f.big ? "30px 'NF Num',Georgia,serif" : "19px 'NF Num',Georgia,serif"; c.fillStyle = f.col; c.fillText(f.t, f.x, f.y); });
  floats = floats.filter(f => f.life > 0);
  c.globalAlpha = 1;
  if (snK >= 0.33) {   // onde de choc dorée, puis bleue
    const k = (snK - 0.33) / 0.67, rr = starR() * (0.4 + k * 4.2);
    c.save(); c.globalCompositeOperation = 'lighter'; c.lineWidth = starR() * 0.25 * (1 - k) + 1; c.strokeStyle = `rgba(243,212,138,${(1 - k) * 0.9})`; c.beginPath(); c.arc(cw / 2, ch / 2, rr, 0, 7); c.stroke();
    c.lineWidth = 2; c.strokeStyle = `rgba(159,199,255,${(1 - k) * 0.7})`; c.beginPath(); c.arc(cw / 2, ch / 2, rr * 0.8, 0, 7); c.stroke(); c.restore();
  } else if (snK >= 0) {   // effondrement : la lumière est aspirée
    c.fillStyle = `rgba(0,0,10,${snK / 0.33 * 0.5})`; c.fillRect(0, 0, cw, ch);
  }
  if (flash > 0) { c.fillStyle = `rgba(255,240,255,${flash})`; c.fillRect(0, 0, cw, ch); flash = Math.max(0, flash - dt * 0.8); }
}

const autoRate = () => has('m_auto3') ? 50 : has('m_auto2') ? 20 : 5;
const critP = auto => has('m_crit') && (!auto || has('m_auto3')) ? 0.05 : 0;   // clic critique : ×10
let autoN = 0;
function autoClick() {
  const v = clickValue() * (Math.random() < critP(true) ? 10 : 1); earn(v); S.clicks++; S.lifeClicks++; window.ptEvent && window.ptEvent('sf_clicks', 1);
  if (!visible || !cw || v <= 0) return;
  pulse = Math.max(pulse, 0.35);
  if (++autoN % 3 === 0) {   // une main fantôme : un nombre plus discret que le clic du joueur
    const X = cw / 2, Y = ch / 2, R = starR(), a = Math.random() * Math.PI * 2;
    floats.push({ x: X + Math.cos(a) * R * 0.7, y: Y + Math.sin(a) * R * 0.5, t: '+' + fmt(v), life: 0.8, col: '#9fd8ff', small: 1 });
  }
}
function clickStar(x, y) {
  if (comet && Math.hypot(x - comet.x * cw, y - comet.y * ch) < 34) { catchComet(); return; }
  const X = cw / 2, Y = ch / 2, R = starR();
  if (Math.hypot(x - X, y - Y) > R * 1.3) return;
  const crit = Math.random() < critP(false), v = clickValue() * (crit ? 10 : 1);
  earn(v); S.clicks++; S.lifeClicks++; pulse = 1; window.ptEvent && window.ptEvent('sf_clicks', 1);
  if (crit) S.crits = (S.crits || 0) + 1;
  floats.push({ x: x + (Math.random() - .5) * 20, y, t: (crit ? '✦ ' : '+') + fmt(v), life: crit ? 1.4 : 1, col: crit ? '#ffffff' : S.buffs.some(b => b.type === 'click') ? '#ff9dfc' : '#ffe38a', big: crit });
  for (let k = 0; k < 6; k++) parts.push({ x, y, vx: (Math.random() - .5) * 5, vy: -Math.random() * 5, life: 1, col: '#ffe38a', s: 2 + Math.random() * 2 });
  sfx(700 + Math.random() * 200, 0.04, 'sine', 0.03);
}
cv.addEventListener('pointerdown', e => { const r = cv.getBoundingClientRect(); clickStar(e.clientX - r.left, e.clientY - r.top); });

// ---------- UI ----------
let tab = 'gen', built = null;
const panel = $('sf-panel');
let tip = null, lastPT = 'mouse';
document.addEventListener('pointerdown', e => { lastPT = e.pointerType; if (tip && !tip.el.contains(e.target)) hideTip(); }, true);
function showTip(el, html) {
  const fn = typeof html === 'function' ? html : () => html;
  hideTip(); tip = document.createElement('div'); tip.className = 'sf-tip'; tip.innerHTML = fn(); tip.el = el; tip.fn = fn; document.body.appendChild(tip);
  const r = el.getBoundingClientRect(); const tr = tip.getBoundingClientRect();
  let x = r.left + r.width / 2 - tr.width / 2, y = r.top - tr.height - 8;
  if (y < 40) y = r.bottom + 8; x = Math.max(6, Math.min(innerWidth - tr.width - 6, x));
  tip.style.left = x + 'px'; tip.style.top = y + 'px';
}
function hideTip() { if (tip) tip.remove(); tip = null; }
// Branche une fiche sur un élément : au doigt, 1er toucher = fiche, 2e toucher = action.
function tipify(el, fn, action) {
  el.onmouseenter = () => { if (lastPT === 'mouse') showTip(el, fn); };
  el.onmouseleave = () => { if (lastPT === 'mouse') hideTip(); };
  el.onclick = () => {
    if (lastPT !== 'mouse' && !(tip && tip.el === el)) { showTip(el, () => fn() + (action ? `<br><i class="muted">${t('sf.tapAgain')}</i>` : '')); return; }
    if (action) { action(); if (lastPT !== 'mouse') hideTip(); }
  };
}

function build() {
  hideTip(); panel.innerHTML = ''; built = tab;
  $('sf-buymult').classList.toggle('hidden', tab !== 'gen');
  if (tab === 'gen') {
    GENS.forEach((g, i) => {
      const b = document.createElement('button'); b.className = 'sf-item'; b.dataset.i = i;
      b.innerHTML = `<div class="ic">${engSvg(GEN_ENG[g.id] || 'spark')}</div><div class="mid"><b>${g.name}</b><span class="d"></span></div><div class="rt"><b class="n">0</b><span class="c"></span></div>`;
      b.onclick = () => buyGen(i);   // au doigt, achat direct : la ligne affiche déjà l'essentiel
      b.onmouseenter = () => { if (lastPT === 'mouse') showTip(b, () => t('sf.genTip', { name: g.name, desc: g.desc, each: fmt(g.prod * genMult(i) * globalMult()), total: fmt(S.gens[i] * g.prod * genMult(i) * globalMult()), next: MILESTONES.find(m => m > S.gens[i]) || '—' })); };
      b.onmouseleave = () => { if (lastPT === 'mouse') hideTip(); };
      panel.appendChild(b);
    });
  } else if (tab === 'upg') {
    const h = document.createElement('div'); h.className = 'sf-h sf-h-row'; h.innerHTML = `<span>${t('sf.available')}</span><button class="btn small" id="sf-buyall">${t('sf.buyAll')}</button>`; panel.appendChild(h);
    h.querySelector('button').onclick = buyAllUpg;
    const grid = document.createElement('div'); grid.className = 'sf-grid'; grid.id = 'sf-upg-grid'; panel.appendChild(grid);
    const h2 = document.createElement('div'); h2.className = 'sf-h'; h2.id = 'sf-upg-owned-h'; panel.appendChild(h2);
    const grid2 = document.createElement('div'); grid2.className = 'sf-grid'; grid2.id = 'sf-upg-owned'; panel.appendChild(grid2);
    fillUpgrades();
  } else if (tab === 'meta') {
    const info = document.createElement('div'); info.className = 'muted small'; info.id = 'sf-meta-info'; panel.appendChild(info);
    const tree = document.createElement('div'); tree.className = 'sf-meta-tree';
    let svg = '<svg viewBox="0 0 100 100" preserveAspectRatio="none">';
    META.forEach(m => m.req.forEach(r => { const p = META.find(q => q.id === r); svg += `<line x1="${p.x}" y1="${p.y}" x2="${m.x}" y2="${m.y}" stroke="#4a3a78" stroke-width="0.6" vector-effect="non-scaling-stroke" data-l="${m.id}" />`; }));
    tree.innerHTML = svg + '</svg>';
    const ms = document.createElement('button'); ms.className = 'sf-item'; ms.id = 'sf-mast'; ms.innerHTML = `<div class="ic">${engSvg('seal')}</div><div class="mid"><b>${t('sf.mastName')}</b><span></span></div><div class="rt"><b class="nova"></b></div>`;
    ms.onclick = () => { if (buyMastery()) { sfx(660, 0.25, 'sine', 0.08); sfx(990, 0.3, 'sine', 0.06); save(); refresh(true); } };
    const bb = document.createElement('div'); bb.id = 'sf-bigbang'; bb.className = 'sf-bb';
    bb.innerHTML = `<div class="sf-h">${t('sf.bbTitle')}</div><p class="muted small" id="sf-bb-info"></p><button class="btn nova-btn" id="sf-bb-btn">${t('sf.bbBtn')}</button><div class="sf-h">${t('sf.galaxy')}</div><div id="sf-gal"></div>`;
    setTimeout(() => {
      const gl = $('sf-gal'); if (!gl) return;
      GALAXY.forEach(x => { const d = document.createElement('button'); d.className = 'sf-item'; d.dataset.id = x.id; d.innerHTML = `<div class="ic">${constGlyph(x.id)}</div><div class="mid"><b>${x.name}</b><span>${x.desc}</span></div><div class="rt"><b class="nova">${x.cost}✧</b></div>`; d.onclick = () => buyGal(x); gl.appendChild(d); });
      const en = document.createElement('button'); en.className = 'sf-item'; en.id = 'sf-eng'; en.innerHTML = `<div class="ic">${engSvg('gear')}</div><div class="mid"><b>${t('sf.engName')}</b><span></span></div><div class="rt"><b class="nova"></b></div>`;
      en.onclick = () => { if (buyEngine()) { sfx(660, 0.3, 'triangle', 0.08); save(); refresh(true); } }; gl.appendChild(en);
      $('sf-bb-btn').onclick = bigBang; refresh();
    });
    META.forEach(m => {
      const n = document.createElement('button'); n.className = 'sf-node'; n.dataset.id = m.id;
      n.style.left = m.x + '%'; n.style.top = m.y + '%';
      n.innerHTML = `${constGlyph(m.id)}<small>${m.cost}✦</small>`;
      tipify(n, () => `<b>${m.name}</b> — <span class="nova">${t('sf.novaeN', { n: m.cost })}</span>${S.meta[m.id] ? ' ✓' : ''}<br>${m.desc}${m.req.length ? '<br><span class="muted">' + t('sf.requires', { list: m.req.map(r => META.find(q => q.id === r).name).join(', ') }) + '</span>' : ''}`, () => buyMeta(m));
      tree.appendChild(n);
    });
    panel.appendChild(tree);
    panel.appendChild(ms);
    panel.appendChild(bb);
  } else if (tab === 'chal') {
    const info = document.createElement('div'); info.className = 'muted small'; info.textContent = t('sf.chalInfo'); panel.appendChild(info);
    CHALS.forEach(c => {
      const d = document.createElement('div'); d.className = 'sf-ch'; d.dataset.id = c.id;
      d.innerHTML = `<div class="ic">${constGlyph(c.id)}</div><div class="mid"><b>${c.name}</b><span>${c.desc} ${t('sf.goalTxt', { n: fmt(c.goal), time: c.time ? t('sf.inMin', { n: c.time / 60 }) : '' })}</span><span class="rw">🏅 ${c.reward}</span></div><button class="btn small">${t('sf.launch')}</button>`;
      d.querySelector('button').onclick = () => startChal(c);
      panel.appendChild(d);
    });
  } else if (tab === 'ach') {
    const info = document.createElement('div'); info.className = 'muted small'; info.id = 'sf-ach-info'; panel.appendChild(info);
    const g = document.createElement('div'); g.className = 'sf-ach';
    ACH.forEach(a => { const d = document.createElement('div'); d.dataset.id = a.id; d.innerHTML = constGlyph(a.id); tipify(d, () => `<b>${a.name}</b>${S.ach[a.id] ? ' ✓' : ''}<br>${a.desc}`); g.appendChild(d); });
    panel.appendChild(g);
    const st = document.createElement('div'); st.className = 'muted small'; st.id = 'sf-stats'; st.style.marginTop = '12px'; panel.appendChild(st);
  } else if (tab === 'opt') {
    panel.innerHTML = `<div class="sf-h">${t('sf.optSave')}</div>
      <p class="muted small">${t(document.body.classList.contains('bq-app') ? 'sf.optSaveTxtApp' : 'sf.optSaveTxt')}</p>
      <div class="row" style="justify-content:flex-start"><button class="btn ghost small" id="sf-exp">${t('sf.export')}</button><button class="btn ghost small" id="sf-imp">${t('sf.import')}</button><button class="btn small" id="sf-wipe" style="background:#a0304a">${t('sf.wipe')}</button></div>
      <textarea id="sf-io" style="width:100%;height:90px;margin-top:8px;background:#0a0c16;color:#ccd;border:1px solid #2a3050;border-radius:8px;padding:6px;font-size:11px"></textarea>
      <div class="sf-h">${t('sf.optDisplay')}</div>
      <label class="small"><input type="checkbox" id="sf-sci"> ${t('sf.optSci')}</label>
      <div class="sf-h">${t('sf.optHow')}</div>
      <p class="small muted">${t('sf.optHowTxt')}</p>`;
    $('sf-sci').checked = SCI;
    $('sf-sci').onchange = e => { SCI = e.target.checked; try { localStorage.setItem('starforge.sci', SCI ? '1' : '0'); } catch (x) {} refresh(true); };
    $('sf-exp').onclick = () => { save(); $('sf-io').value = btoa(unescape(encodeURIComponent(JSON.stringify(S)))); };
    $('sf-imp').onclick = () => { try { const d = JSON.parse(decodeURIComponent(escape(atob($('sf-io').value.trim())))); S = Object.assign(fresh(), d); save(); toast(t('sf.imported')); refresh(true); } catch (e) { toast(t('sf.invalid')); } };
    $('sf-wipe').onclick = async () => { if (await ptConfirm(noEmoji(t('sf.wipeQ')), t('sf.wipe'))) { S = fresh(); save(); refresh(true); } };
  }
  refresh();
}
function fillUpgrades() {
  const grid = $('sf-upg-grid'), grid2 = $('sf-upg-owned'); if (!grid) return;
  grid.innerHTML = ''; grid2.innerHTML = '';
  const av = UPGRADES.filter(u => !S.upg[u.id] && u.req(S)).sort((a, b) => upgCost(a) - upgCost(b));
  if (!av.length) grid.innerHTML = `<p class="muted small" style="grid-column:1/-1">${t('sf.nothing')}</p>`;
  av.forEach(u => {
    const b = document.createElement('button'); b.className = 'sf-upg'; b.dataset.id = u.id; b.innerHTML = `<span>${upgIcon(u)}</span><small>${fmt(upgCost(u))}</small>${upgTag(u) ? `<i class="sf-utag">${upgTag(u)}</i>` : ''}`;
    tipify(b, () => `<b>${u.name}</b><br>${u.desc}<br><span style="color:var(--gold)">${fmt(upgCost(u))}</span>${S.dust < upgCost(u) ? ` <span class="muted">${t('sf.notEnough')}</span>` : ''}`, () => buyUpg(u));
    grid.appendChild(b);
  });
  const owned = UPGRADES.filter(u => S.upg[u.id]);
  $('sf-upg-owned-h').textContent = t('sf.boughtHdr', { n: owned.length, t: UPGRADES.length });
  owned.forEach(u => { const d = document.createElement('div'); d.className = 'sf-upg'; d.style.opacity = .6; d.innerHTML = `${upgIcon(u)}${upgTag(u) ? `<i class="sf-utag">${upgTag(u)}</i>` : ''}`; tipify(d, () => `<b>${u.name}</b> ✓<br>${u.desc}`); grid2.appendChild(d); });
  upgSig = sigUpg();
}
let upgSig = '';
const sigUpg = () => UPGRADES.filter(u => !S.upg[u.id] && u.req(S)).map(u => u.id).join();

function refresh(structural) {
  if (!built) return;
  if (tip) { if (!tip.el.isConnected) hideTip(); else tip.innerHTML = tip.fn(); }
  $('sf-dust').textContent = fmt(S.dust);
  $('sf-rate').textContent = fmt(totalDps());
  const BN = { frenzy: [t('sf.bFrenzy'), ''], click: [t('sf.bClick'), ''], meteor: [t('sf.bMeteor'), 'met'], eclipse: [t('sf.bEclipse'), 'ecl'], echo: [t('sf.bEcho'), 'ecl'], void: [t('sf.bVoid'), 'ecl'], surge: [null, ''] };
  const bname = b => b.type === 'surge' ? t('sf.bSurge', { gen: GENS[b.g].name, m: fmt(b.m) }) : BN[b.type][0], stack = S.buffs.reduce((m, b) => m * buffMult(b), 1);
  $('sf-buffs').innerHTML = (eternal() ? `<span class="met">${t('sf.eternalBuff')}</span>` : boostLeft() > 0 ? `<span class="met">${t('sf.boostBuff', { t: hm(boostLeft()) })}</span>` : '') + S.buffs.map(b => `<span class="${BN[b.type][1]}">${bname(b)} · ${Math.ceil(b.t)} s</span>`).join('') + (S.buffs.filter(b => buffMult(b) > 1).length >= 2 ? `<span class="met">${t('sf.stack', { m: fmt(stack) })}</span>` : '');
  { const bb = $('sf-buffs'); if (/\p{Extended_Pictographic}/u.test(bb.innerHTML)) bb.innerHTML = noEmoji(bb.innerHTML); }
  const canAd = !!(MON() && MON().canReward());
  $('sf-adboost').classList.toggle('hidden', !canAd || eternal() || boostLeft() > (BOOST_MAX_H - BOOST_H) * 3600e3);
  $('sf-adboost').textContent = boostLeft() > 0 ? t('sf.adBoostMore') : t('sf.adBoost');
  if (offPending && Date.now() > offUntil) offPending = 0;
  $('sf-offdouble').classList.toggle('hidden', !canAd || !offPending);
  if (offPending) $('sf-offdouble').textContent = t('sf.offDouble', { v: fmt(offPending) });
  $('sf-click').textContent = fmt(clickValue());
  const g = novaGain();
  $('sf-nova-gain').textContent = fmt(g); $('sf-nova-have').textContent = fmt(S.novaBank) + (S.novaTotal !== S.novaBank ? t('sf.earned', { n: fmt(S.novaTotal) }) : '');
  $('sf-prestige').disabled = g < 1;
  $('sf-prestige-box').classList.toggle('idle', g < 1);
  const nx = $('sf-nova-next');
  if (nx) { let need = 2e5; if (g < 1 && !S.chal) { while (novaGainAt(need) < 1 && need < 1e300) need *= 1.04; } nx.textContent = g < 1 && !S.chal ? t('sf.nextNova', { n: fmt(need), p: Math.min(99, Math.floor(S.runTotal / need * 100)) }) : ''; }
  $('sf-prestige-box').style.display = S.runTotal >= 1e5 || S.novaTotal > 0 ? '' : 'none';
  $('sf-tab-chal').classList.toggle('hidden', S.prestiges < 1);
  const ch = S.chal && CHALS.find(x => x.id === S.chal);
  $('sf-chal').classList.toggle('hidden', !ch);
  if (ch) $('sf-chal-txt').textContent = `✦ ${ch.name} : ${fmt(Math.min(S.runTotal, ch.goal))} / ${fmt(ch.goal)}${ch.time ? ` · ⏱ ${Math.max(0, Math.ceil((ch.time - S.chalT) / 60))} min` : ''}`;
  // pastille "améliorations dispo"
  const anyUpg = UPGRADES.some(u => !S.upg[u.id] && u.req(S) && S.dust >= upgCost(u));
  document.querySelector('[data-sf=upg]').classList.toggle('badge', anyUpg);
  document.querySelector('[data-sf=meta]').classList.toggle('badge', META.some(m => !S.meta[m.id] && S.novaBank >= m.cost && m.req.every(r => S.meta[r])));

  if (tab === 'gen') {
    let shownLocked = 0;
    panel.querySelectorAll('.sf-item').forEach(b => {
      const i = +b.dataset.i, gen = GENS[i];
      const n = buyMult === 'max' ? Math.max(1, maxAffordable(i)) : buyMult;
      const c = costN(i, n);
      if (gen.meta && !has(gen.meta)) { b.style.display = 'none'; return; }
      const known = S.gens[i] > 0 || i === 0 || S.gens[i - 1] > 0 || S.runTotal >= gen.cost * 0.5;
      if (!known) { shownLocked++; b.style.display = shownLocked > 1 ? 'none' : ''; }
      else b.style.display = '';
      b.classList.toggle('locked', !known);
      b.querySelector('.n').textContent = S.gens[i];
      b.querySelector('.c').textContent = (n > 1 ? `×${n} · ` : '') + fmt(c);
      const next = MILESTONES.find(m => m > S.gens[i]);
      b.querySelector('.d').textContent = known ? t('sf.each', { v: fmt(gen.prod * genMult(i) * globalMult()) }) + (next ? t('sf.nextTier', { n: next }) : '') : '???';
      const banned = inChal('c_short') && i > 2;
      if (banned) b.querySelector('.d').textContent = t('sf.banned');
      b.classList.toggle('can', known && !banned && S.dust >= c);
      b.classList.toggle('no', !known || banned || S.dust < c);
    });
  } else if (tab === 'upg') {
    if (structural || sigUpg() !== upgSig) fillUpgrades();
    panel.querySelectorAll('#sf-upg-grid .sf-upg').forEach(b => {
      const u = UPGRADES.find(x => x.id === b.dataset.id);
      b.classList.toggle('can', S.dust >= upgCost(u)); b.classList.toggle('no', S.dust < upgCost(u));
    });
    const n = affordableUpg().length, ba = $('sf-buyall');
    if (ba) { ba.textContent = n ? t('sf.buyAllN', { n }) : t('sf.buyAll'); ba.disabled = !n || inChal('c_noupg'); }
  } else if (tab === 'meta') {
    const g = singGain(), bbi = $('sf-bb-info');
    if (bbi) {
      bbi.innerHTML = S.novaTotal >= BIGBANG_MIN || S.sing ? t('sf.bbInfo', { nova: num(S.novaTotal), g, bank: S.singBank || 0, sing: S.sing || 0, np: Math.round(effSing() * 50), pp: Math.round(effSing() * (gal('g_big') ? 20 : 10)) }) + (g >= 1 ? '<br>' + t('sf.bbAfter', { np: Math.round(effSing((S.sing || 0) + g) * 50), pp: Math.round(effSing((S.sing || 0) + g) * (gal('g_big') ? 20 : 10)) }) : '') + (META.some(m => !S.meta[m.id]) && S.novaTotal >= BIGBANG_MIN ? '<br>' + t('sf.bbHint') : '') : t('sf.bbLocked', { min: BIGBANG_MIN, n: num(S.novaTotal) });
      $('sf-bb-btn').disabled = S.novaTotal < BIGBANG_MIN || g < 1 || !!S.chal;
      const en = $('sf-eng'); if (en) { en.querySelector('.mid span').textContent = t('sf.engDesc', { n: S.eng || 0, m: fmt(Math.pow(1.25, S.eng || 0)) }); en.querySelector('.rt b').textContent = fmt(engCost()) + '✧'; en.classList.toggle('can', (S.singBank || 0) >= engCost()); en.classList.toggle('no', (S.singBank || 0) < engCost()); en.classList.toggle('hidden', !S.bigbangs); }
      document.querySelectorAll('#sf-gal .sf-item[data-id]').forEach(d => { const x = GALAXY.find(y => y.id === d.dataset.id); d.classList.toggle('done', gal(x.id)); d.querySelector('.rt b').textContent = gal(x.id) ? t('sf.owned') : x.cost + '✧'; d.classList.toggle('can', !gal(x.id) && (S.singBank || 0) >= x.cost); d.classList.toggle('no', !gal(x.id) && (S.singBank || 0) < x.cost); });
    }
    $('sf-meta-info').innerHTML = t('sf.metaInfo', { bank: num(S.novaBank), pct: num(Math.round(effNova() * novaPct() * 100)) });
    const mst = $('sf-mast'); if (mst) { mst.classList.toggle('hidden', !META.every(m => S.meta[m.id]) && !(S.mast > 0) && Object.keys(S.meta).length < 12); mst.querySelector('.mid span').textContent = t('sf.mastDesc', { n: S.mast || 0, m: fmt(Math.pow(1.15, S.mast || 0)) }); mst.querySelector('.rt b').textContent = fmt(mastCost()) + '✦'; mst.classList.toggle('can', S.novaBank >= mastCost()); mst.classList.toggle('no', S.novaBank < mastCost()); }
    panel.querySelectorAll('.sf-node').forEach(n => {
      const m = META.find(q => q.id === n.dataset.id);
      const open = m.req.every(r => S.meta[r]);
      n.classList.toggle('owned', !!S.meta[m.id]);
      n.classList.toggle('can', !S.meta[m.id] && open && S.novaBank >= m.cost);
      n.classList.toggle('lock', !S.meta[m.id] && !open);
    });
    panel.querySelectorAll('line').forEach(l => l.setAttribute('stroke', S.meta[l.dataset.l] ? '#c68bff' : '#3a3060'));
  } else if (tab === 'chal') {
    panel.querySelectorAll('.sf-ch').forEach(d => {
      const c = CHALS.find(x => x.id === d.dataset.id), b = d.querySelector('button');
      const done = chalDone(c.id), lock = S.prestiges < c.need, cur = inChal(c.id);
      d.classList.toggle('done', done); d.classList.toggle('lock', lock && !done); d.classList.toggle('cur', cur);
      b.textContent = done ? t('sf.done') : cur ? t('sf.running') : lock ? t('sf.needSN', { n: c.need }) : t('sf.launch');
      b.disabled = done || cur || lock || !!S.chal;
    });
  } else if (tab === 'ach') {
    const got = Object.keys(S.ach).length;
    $('sf-ach-info').textContent = t('sf.achInfo', { got, tot: ACH.length, p: has('m_ach2') ? 5 : has('m_ach') ? 3 : 1 });
    panel.querySelectorAll('.sf-ach div').forEach(d => d.classList.toggle('got', !!S.ach[d.dataset.id]));
    $('sf-stats').innerHTML = t('sf.stats', { run: fmt(S.runTotal), life: fmt(S.lifeTotal), clicks: fmt(S.lifeClicks), comets: num(S.lifeComets), sn: num(S.prestiges) });
  }
}

const noEmoji = s => String(s).replace(/(\p{Extended_Pictographic}|\p{Regional_Indicator})\uFE0F?/gu, '✦');   // gravure : pas d'emoji dans les textes du jeu
function toast(t) {
  const z = $('sf-toasts'); const d = document.createElement('div'); d.className = 'toast'; d.textContent = noEmoji(t); z.appendChild(d);
  setTimeout(() => d.remove(), 3200);
  while (z.children.length > 3) z.firstChild.remove();
}
function checkAch() {
  for (const a of ACH) if (!S.ach[a.id] && a.test(S)) { S.ach[a.id] = 1; toast(t('sf.achToast', { name: a.name })); }
}

document.querySelectorAll('.sf-tabs button').forEach(b => b.onclick = () => {
  document.querySelectorAll('.sf-tabs button').forEach(x => x.classList.toggle('on', x === b));
  tab = b.dataset.sf; build();
});
document.querySelectorAll('#sf-buymult button').forEach(b => b.onclick = () => {
  document.querySelectorAll('#sf-buymult button').forEach(x => x.classList.toggle('on', x === b));
  buyMult = b.dataset.m === 'max' ? 'max' : +b.dataset.m; refresh();
});
$('sf-prestige').onclick = prestige;
$('sf-intro-ok').onclick = () => { $('sf-intro').classList.add('hidden'); try { localStorage.setItem('starforge.intro', '1'); } catch (e) {} };
$('sf-chal-quit').onclick = () => quitChal(false);
$('sf-adboost').onclick = watchBoost;
$('sf-offdouble').onclick = watchOffline;
window.addEventListener('pt-owned', () => refresh(true));
// langue : le HTML se traduit tout seul, le panneau ouvert est reconstruit
applyI18n();
window.addEventListener('pt-lang', () => { if (built) build(); });

// ---------- boucle ----------
function tick(dt) {
  earn(dps() * dt);
  checkChal(dt);
  // clic automatique : compte comme un vrai clic (compteurs de run et de vie, objectifs du jour) et se voit sur l'étoile
  if (has('m_auto') && !inChal('c_hands')) { autoAcc += dt * autoRate(); while (autoAcc >= 1) { autoAcc--; autoClick(); } }
  S.buffs.forEach(b => b.t -= dt); S.buffs = S.buffs.filter(b => b.t > 0);
  // éclipse : de temps en temps, production ×2 mais clics sans effet pendant 45 s
  if (visible && !S.chal) { nextEclipse -= dt; if (nextEclipse <= 0) { nextEclipse = 480 + Math.random() * 480; S.buffs.push({ type: 'eclipse', t: 45, max: 45 }); toast(t('sf.eclipseT')); sfx(90, 1, 'sine', 0.08); } }
  galAcc += dt;
  if (galAcc >= 1) {
    galAcc = 0;
    if (gal('g_auto')) for (let k = 0; k < 10; k++) {   // la forge la moins chère, tant qu'on peut
      let bi = -1, bc = Infinity;
      GENS.forEach((g, i) => { if (inChal('c_short') && i > 2) return; if (g.meta && !has(g.meta)) return; const c = costN(i, 1); if (c < bc) { bc = c; bi = i; } });
      if (bi < 0 || bc > S.dust) break;
      S.dust -= bc; S.gens[bi]++;
    }
    if (gal('g_upg') && !inChal('c_noupg')) for (const u of UPGRADES) if (!S.upg[u.id] && u.req(S) && upgCost(u) <= S.dust) { S.dust -= upgCost(u); S.upg[u.id] = 1; }
  }
  if (comet && gal('g_comet') && comet.t === undefined) comet.t = 0;
  if (comet && gal('g_comet') && !comet.dark && (comet.t += dt) > 1.2) catchComet();
  if (!comet) { nextComet -= dt; if (nextComet <= 0 && visible && !inChal('c_dim')) spawnComet(); }
  else { comet.x += comet.vx * dt; comet.y += comet.vy * dt; if (comet.x < -0.2 || comet.x > 1.2) { comet = null; nextComet = (60 + Math.random() * 120) / luck(); } }
}
let autoAcc = 0, galAcc = 0, nextEclipse = 300 + Math.random() * 300;

const offCap = () => (has('m_off2') ? 24 : 8) * 3600;
function save() { if (window.PT_NOSAVE) return; S.last = Date.now(); try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (!d) return;
    S = Object.assign(fresh(), d);
    if (S.chal) S.chalT += Math.min(8 * 3600, (Date.now() - (d.last || Date.now())) / 1000);   // le chrono tourne aussi hors-ligne
    while (S.gens.length < GENS.length) S.gens.push(0);
    S.buffs = [];
    const away = Math.min(offCap(), (Date.now() - (d.last || Date.now())) / 1000);
    if (away > 30) {
      const v = totalDps() * away * (has('m_off') ? 1 : 0.25);
      if (v > 0) { earn(v); if (away > 300) { offPending = v; offUntil = Date.now() + 60000; } setTimeout(() => welcomeBack(away, v), 400); }
    }
  } catch (e) {}
}

let visible = false, inited = false, lastT = 0, acc = 0, uiAcc = 0, saveAcc = 0, achAcc = 0;
function loop(t) {
  const dt = Math.min(0.25, (t - lastT) / 1000 || 0); lastT = t;
  acc += dt; uiAcc += dt; saveAcc += dt; achAcc += dt;
  while (acc >= 0.05) { tick(0.05); acc -= 0.05; }
  if (visible) {
    drawStar(dt, t / 1000);
    if (uiAcc > 0.2) { uiAcc = 0; refresh(); }
  }
  if (achAcc > 1) { achAcc = 0; checkAch(); }
  if (saveAcc > 10) { saveAcc = 0; save(); }
  requestAnimationFrame(loop);
}
// La production continue même quand l'onglet est masqué (rattrapage à la reprise, cf. dt plafonné + hors-ligne).
document.addEventListener('visibilitychange', () => { if (document.hidden) save(); else if (inited) { const d = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (d) { const away = Math.min(offCap(), (Date.now() - d.last) / 1000); if (away > 5) { if (S.chal) S.chalT += away; const v = totalDps() * away * (has('m_off') ? 1 : 0.25); earn(v); if (away > 60 && v > 0) { if (away > 300) { offPending = v; offUntil = Date.now() + 60000; } welcomeBack(away, v); refresh(true); } } } } });
window.addEventListener('beforeunload', save);
window.addEventListener('resize', () => visible && resizeStar());
// la zone cliquable suit la taille réelle du cadre (la mise en page mobile change après le premier calcul)
if (window.ResizeObserver) new ResizeObserver(() => visible && resizeStar()).observe(cv);

window.GAMES.forge = {
  reward() {   // objectif du jour : +2 % des Novae gagnées (au moins 1) (on charge la sauvegarde si le jeu n'a pas encore été ouvert)
    if (!inited) { inited = true; load(); lastT = performance.now(); requestAnimationFrame(loop); }
    const n = Math.max(1, Math.round(S.novaTotal * 0.02)); S.novaTotal += n; S.novaBank += n; save(); if (built) refresh(true);
  },
  show() {
    document.querySelectorAll('.sf-tabs button').forEach(b => { const k = { gen: 'anvil', upg: 'compass', meta: 'spark', chal: 'glass', ach: 'medal', opt: 'gear' }[b.dataset.sf], i = b.querySelector('i'); if (!k || b.dataset.eng) return; b.dataset.eng = 1; if (i) i.innerHTML = engSvg(k); else b.innerHTML = engSvg(k); });
    visible = true; loadFonts();
    if (!inited) { inited = true; load(); lastT = performance.now(); requestAnimationFrame(loop); }
    try { if (!localStorage.getItem('starforge.intro') && !S.lifeTotal) $('sf-intro').classList.remove('hidden'); } catch (e) {}
    requestAnimationFrame(() => { resizeStar(); build(); });
  },
  hide() { visible = false; hideTip(); save(); },
};
// Accès de test (tools/sf-balance.mjs, console).
window.__sf = { NOVA, buyMastery, mastCost, novaCurve, GALAXY, singGain, buyEngine, fmt, boostOn, get offPending() { return offPending; }, set offPending(v) { offPending = v; offUntil = Date.now() + 60000; }, watchBoost, watchOffline, get S() { return S; }, get comet() { return comet; }, spawnComet, catchComet, set S(v) { S = v; }, tick, buyGen, buyUpg, UPGRADES, GENS, costN, upgCost, dps, clickValue, novaGain, earn, fresh, resetRun, META, buyMeta, setMult: m => { buyMult = m; } };
