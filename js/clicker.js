// STAR FORGE — clicker à progression (forges, améliorations, paliers) et méta-progression
// (Supernova → Novae → Constellation permanente, succès permanents).
window.GAMES = window.GAMES || {};

const $ = id => document.getElementById(id);
const SAVE_KEY = 'starforge.save.v1';

// ---------- données ----------
const GENS = [
  { id: 'spark',   name: 'Étincelle',            ic: '✨', cost: 15,     prod: 0.1,   col: '#ffe38a', desc: 'Une petite lueur qui ne demande qu\'à grandir.' },
  { id: 'lantern', name: 'Lanterne cosmique',    ic: '🏮', cost: 100,    prod: 1,     col: '#ff9d5c', desc: 'Capte la lumière des étoiles voisines.' },
  { id: 'comet',   name: 'Moulin à comètes',     ic: '☄️', cost: 1100,   prod: 8,     col: '#7fd6ff', desc: 'Les queues de comète font tourner les pales.' },
  { id: 'moon',    name: 'Forge lunaire',        ic: '🌙', cost: 12000,  prod: 47,    col: '#c9d2ff', desc: 'Frappée à froid sur la face cachée.' },
  { id: 'sun',     name: 'Réacteur solaire',     ic: '☀️', cost: 130000, prod: 260,   col: '#ffcf3d', desc: 'Un soleil en bouteille. Ne pas secouer.' },
  { id: 'pulsar',  name: 'Pulsar domestiqué',    ic: '💫', cost: 1.4e6,  prod: 1400,  col: '#a0ffe0', desc: 'Il tourne sur lui-même 700 fois par seconde. Il est content.' },
  { id: 'nebula',  name: 'Nébuleuse-usine',      ic: '🌌', cost: 2e7,    prod: 7800,  col: '#d58bff', desc: 'Une pouponnière d\'étoiles, à la chaîne.' },
  { id: 'white',   name: 'Trou blanc',           ic: '⚪', cost: 3.3e8,  prod: 44000, col: '#ffffff', desc: 'L\'inverse d\'un trou noir : tout en sort.' },
  { id: 'metro',   name: 'Métronome galactique', ic: '🌀', cost: 5.1e9,  prod: 2.6e5, col: '#6fa8ff', desc: 'Donne le tempo à cent milliards d\'étoiles.' },
  { id: 'bang',    name: 'Moteur à Big Bang',    ic: '💥', cost: 7.5e10, prod: 1.6e6, col: '#ff5d8f', desc: 'Un univers neuf à chaque cycle.' },
];
const GEN_TIERS = [1, 5, 25, 50, 100, 150, 200, 250];
const TIER_COST = [10, 50, 500, 5e4, 5e6, 5e8, 5e10, 5e12];
const TIER_NAMES = ['Polissage', 'Alliage stellaire', 'Résonance', 'Surchauffe', 'Quintessence', 'Transcendance', 'Absolu', 'Omega'];
const MILESTONES = [25, 50, 100, 150, 200, 250, 300, 350, 400, 500];

const UPGRADES = [];
GENS.forEach((g, gi) => GEN_TIERS.forEach((t, ti) => UPGRADES.push({
  id: `g${gi}t${ti}`, ic: g.ic, name: `${g.name} : ${TIER_NAMES[ti]}`, cost: g.cost * TIER_COST[ti],
  desc: `Production des ${g.name} ×2.`, req: s => s.gens[gi] >= t, reqTxt: `${t} ${g.name}`, fx: { gen: gi, mult: 2 },
})));
[[100, 1], [500, 5], [1e4, 10], [1e5, 0], [1e7, 0], [1e9, 0], [1e11, 0], [1e13, 0]].forEach(([c, n], i) => UPGRADES.push({
  id: 'click' + i, ic: i < 3 ? '🧤' : '👆', name: i < 3 ? `Gants de plasma ${'I'.repeat(i + 1)}` : `Doigts d'étoile ${i - 2}`, cost: c,
  desc: i < 3 ? 'Les clics et les Étincelles ×2.' : 'Chaque clic rapporte en plus 1 % de ta production par seconde.',
  req: s => i < 3 ? s.gens[0] >= n || s.clicks >= 10 * (i + 1) : s.gens.reduce((a, b) => a + b, 0) >= 25 * (i - 2),
  reqTxt: i < 3 ? `${10 * (i + 1)} clics` : `${25 * (i - 2)} forges`, fx: i < 3 ? { click: 2, gen: 0, mult: 2 } : { clickPct: 0.01 },
}));
[[1e6, 'Harmonie des sphères'], [1e8, 'Chœur céleste'], [1e10, 'Symphonie cosmique'], [1e12, 'Loi universelle'], [1e14, 'Constante de Planck'], [1e16, 'Fin des temps']].forEach(([c, n], i) => UPGRADES.push({
  id: 'glob' + i, ic: '🎼', name: n, cost: c, desc: 'Toute la production +25 %.', req: s => s.runTotal >= c / 4, reqTxt: `${fmt(c / 4)} produits`, fx: { global: 1.25 },
}));
[[7.7e4, 'Télescope'], [7.7e7, 'Radar à comètes'], [7.7e10, 'Aimant à météores']].forEach(([c, n], i) => UPGRADES.push({
  id: 'luck' + i, ic: '🔭', name: n, cost: c, desc: 'Les comètes dorées apparaissent 15 % plus souvent et durent plus longtemps.', req: s => s.cometsTotal >= i, reqTxt: `${i} comète(s) attrapée(s)`, fx: { luck: 0.15 },
}));

// Constellation (méta-progression, payée en Novae, survit aux Supernovae)
const META = [
  { id: 'm_click', ic: '👆', name: 'Mémoire stellaire', cost: 1, x: 50, y: 8, req: [], desc: 'Clics ×3, pour toujours.' },
  { id: 'm_start', ic: '🎁', name: 'Héritage', cost: 3, x: 22, y: 22, req: ['m_click'], desc: 'Chaque run démarre avec 10 Étincelles et 5 Lanternes.' },
  { id: 'm_auto', ic: '🤖', name: 'Automate', cost: 5, x: 50, y: 24, req: ['m_click'], desc: 'Un automate clique 5 fois par seconde pour toi.' },
  { id: 'm_cheap', ic: '🏷️', name: 'Marchandage', cost: 5, x: 78, y: 22, req: ['m_click'], desc: 'Les forges coûtent 10 % de moins.' },
  { id: 'm_off', ic: '🌙', name: 'Veille nocturne', cost: 10, x: 12, y: 40, req: ['m_start'], desc: 'Production hors-ligne 25 % → 100 %.' },
  { id: 'm_keep', ic: '📜', name: 'Archives', cost: 20, x: 32, y: 42, req: ['m_start'], desc: 'Les améliorations « Gants de plasma » sont conservées.' },
  { id: 'm_comet', ic: '☄️', name: 'Pluie d\'étoiles', cost: 10, x: 50, y: 42, req: ['m_auto'], desc: 'Comètes dorées deux fois plus fréquentes.' },
  { id: 'm_econ', ic: '📉', name: 'Économie d\'échelle', cost: 20, x: 76, y: 40, req: ['m_cheap'], desc: 'Croissance des prix 15 % → 14 %.' },
  { id: 'm_long', ic: '⏳', name: 'Éternité', cost: 25, x: 50, y: 58, req: ['m_comet'], desc: 'Les effets de comète durent deux fois plus longtemps.' },
  { id: 'm_ach', ic: '🏆', name: 'Panthéon', cost: 40, x: 22, y: 60, req: ['m_off', 'm_keep'], desc: 'Chaque succès donne +3 % au lieu de +1 %.' },
  { id: 'm_upg', ic: '🛠️', name: 'Ingénierie', cost: 40, x: 80, y: 58, req: ['m_econ'], desc: 'Les améliorations coûtent 25 % de moins.' },
  { id: 'm_nova', ic: '🌟', name: 'Novae brillantes', cost: 80, x: 50, y: 74, req: ['m_long', 'm_ach', 'm_upg'], desc: 'Chaque Nova gagnée donne +5 % au lieu de +3 %.' },
  { id: 'm_sing', ic: '🕳️', name: 'Singularité', cost: 250, x: 32, y: 90, req: ['m_nova'], desc: 'Toute la production ×3.' },
  { id: 'm_crunch', ic: '♾️', name: 'Big Crunch', cost: 600, x: 68, y: 90, req: ['m_nova'], desc: 'Les Supernovae rapportent deux fois plus de Novae.' },
];

const ACH = [];
[[1e3, 'Premières lueurs'], [1e6, 'Millionnaire stellaire'], [1e9, 'Milliardaire'], [1e12, 'Tera-forgeur'], [1e15, 'Péta-forgeur'], [1e18, 'Exa-forgeur'], [1e21, 'Zetta-forgeur']].forEach(([n, name]) =>
  ACH.push({ id: 'tot' + n, ic: '💰', name, desc: `Produire ${fmt(n)} au total`, test: s => s.lifeTotal >= n }));
[[100, '🖱️'], [1000, '🖱️'], [10000, '🖱️']].forEach(([n, ic]) => ACH.push({ id: 'clk' + n, ic, name: `${n} clics`, desc: `Cliquer ${n} fois`, test: s => s.lifeClicks >= n }));
GENS.forEach((g, i) => ACH.push({ id: 'own' + i, ic: g.ic, name: `Collection : ${g.name}`, desc: `Posséder 50 ${g.name}`, test: s => s.gens[i] >= 50 }));
[[1, '💥'], [5, '🌠'], [20, '🌌']].forEach(([n, ic]) => ACH.push({ id: 'pre' + n, ic, name: `${n} Supernova${n > 1 ? 'e' : ''}`, desc: `Déclencher ${n} Supernova${n > 1 ? 'e' : ''}`, test: s => s.prestiges >= n }));
[[1, '⭐'], [10, '🌟'], [50, '🎇']].forEach(([n, ic]) => ACH.push({ id: 'com' + n, ic, name: `Chasseur de comètes ${n}`, desc: `Attraper ${n} comète(s) dorée(s)`, test: s => s.lifeComets >= n }));
[[1e3, '⚡'], [1e6, '⚡'], [1e9, '⚡']].forEach(([n, ic]) => ACH.push({ id: 'dps' + n, ic, name: `${fmt(n)} /s`, desc: `Atteindre ${fmt(n)} par seconde`, test: s => dps() >= n }));

// Défis : une run sous contrainte (entrer = repartir de zéro, sans Novae), objectif en poussière
// produite ; la réussite débloque une récompense permanente et lève la contrainte.
const CHALS = [
  { id: 'c_hands', ic: '🙌', name: 'Sans les mains', desc: 'Les clics (et l\'Automate) ne rapportent rien.', goal: 1e6, need: 1, reward: 'Production ×1,5' },
  { id: 'c_short', ic: '🧱', name: 'Pénurie', desc: 'Seules les trois premières forges sont disponibles.', goal: 1e6, need: 1, reward: 'Étincelles, Lanternes et Moulins ×3' },
  { id: 'c_noupg', ic: '🚫', name: 'Ascète', desc: 'Impossible d\'acheter des améliorations.', goal: 3e6, need: 2, reward: 'Améliorations 15 % moins chères' },
  { id: 'c_infl', ic: '📈', name: 'Inflation', desc: 'Le prix des forges grimpe de 25 % par achat au lieu de 15 %.', goal: 1e7, need: 2, reward: 'Croissance des prix −0,5 point' },
  { id: 'c_dim', ic: '🌑', name: 'Étoile pâle', desc: 'Toute la production est divisée par 10, pas de comètes.', goal: 1e7, need: 3, reward: 'Supernovae : +25 % de Novae' },
  { id: 'c_rush', ic: '⏱️', name: 'Contre la montre', desc: 'Le chrono tourne, hors-ligne compris.', goal: 1e8, need: 4, time: 900, reward: 'Comètes +25 % plus fréquentes et plus longues' },
];
const inChal = id => S.chal === id;
const chalDone = id => !!(S.chalDone && S.chalDone[id]);

// ---------- état ----------
function fresh() {
  return {
    dust: 0, runTotal: 0, lifeTotal: 0, clicks: 0, lifeClicks: 0, gens: GENS.map(() => 0), upg: {}, cometsTotal: 0, lifeComets: 0,
    novaTotal: 0, novaBank: 0, meta: {}, ach: {}, prestiges: 0, chal: null, chalT: 0, chalDone: {}, buffs: [], last: Date.now(), started: Date.now(),
  };
}
let S = fresh();

const has = id => !!S.meta[id];
function fmt(n) {
  if (!isFinite(n)) return '∞';
  if (n < 1000) return n < 10 && n % 1 ? n.toFixed(1) : Math.floor(n).toString();
  if (n < 1e6) return Math.floor(n).toLocaleString('fr-FR');
  const units = ['M', 'G', 'T', 'P', 'E', 'Z', 'Y', 'R', 'Q'];
  const e = Math.floor(Math.log10(n) / 3) - 2;
  if (e >= units.length) return n.toExponential(2).replace('+', '');
  return (n / Math.pow(1000, e + 2)).toFixed(2) + ' ' + units[e];
}

// ---------- calculs ----------
function genMult(i) {
  let m = 1;
  for (const u of UPGRADES) if (S.upg[u.id] && u.fx.gen === i) m *= u.fx.mult;
  for (const t of MILESTONES) if (S.gens[i] >= t) m *= 2;
  if (i < 3 && chalDone('c_short')) m *= 3;
  return m;
}
function globalMult() {
  let m = 1;
  for (const u of UPGRADES) if (S.upg[u.id] && u.fx.global) m *= u.fx.global;
  m *= 1 + S.novaTotal * (has('m_nova') ? 0.05 : 0.03);
  m *= 1 + Object.keys(S.ach).length * (has('m_ach') ? 0.03 : 0.01);
  if (has('m_sing')) m *= 3;
  if (chalDone('c_hands')) m *= 1.5;
  if (inChal('c_dim')) m *= 0.1;
  for (const b of S.buffs) if (b.type === 'frenzy') m *= 7;
  return m;
}
function baseDps() { let d = 0; GENS.forEach((g, i) => d += S.gens[i] * g.prod * genMult(i)); return d; }
function dps() { return baseDps() * globalMult(); }
function clickValue() {
  if (inChal('c_hands')) return 0;
  let c = 1;
  for (const u of UPGRADES) if (S.upg[u.id] && u.fx.click) c *= u.fx.click;
  if (has('m_click')) c *= 3;
  let pct = 0; for (const u of UPGRADES) if (S.upg[u.id] && u.fx.clickPct) pct += u.fx.clickPct;
  c = c * (1 + S.novaTotal * 0.03) + dps() * pct;
  for (const b of S.buffs) if (b.type === 'click') c *= 777;
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
function novaGain() { if (S.chal) return 0; return Math.floor(Math.sqrt(S.runTotal / 1e6) * (has('m_crunch') ? 2 : 1) * (chalDone('c_dim') ? 1.25 : 1)); }
function luck() { let l = 1; for (const u of UPGRADES) if (S.upg[u.id] && u.fx.luck) l += u.fx.luck; if (has('m_comet')) l *= 2; if (chalDone('c_rush')) l *= 1.25; return l; }

// ---------- actions ----------
function earn(v) { S.dust += v; S.runTotal += v; S.lifeTotal += v; }
let buyMult = 1;
function buyGen(i) {
  if (inChal('c_short') && i > 2) return;
  let n = buyMult === 'max' ? maxAffordable(i) : buyMult;
  if (n <= 0) return;
  const c = costN(i, n);
  if (c > S.dust) return;
  S.dust -= c; S.gens[i] += n;
  sfx(520 + i * 30, 0.06, 'triangle');
  refresh(true);
}
function buyUpg(u) {
  const c = upgCost(u);
  if (inChal('c_noupg')) { toast('🚫 Défi Ascète : pas d\'améliorations'); return; }
  if (S.upg[u.id] || c > S.dust || !u.req(S)) return;
  S.dust -= c; S.upg[u.id] = 1;
  sfx(880, 0.12, 'triangle'); sfx(1320, 0.12, 'triangle', 0.08);
  refresh(true);
}
function buyMeta(m) {
  if (S.meta[m.id] || S.novaBank < m.cost || !m.req.every(r => S.meta[r])) return;
  S.novaBank -= m.cost; S.meta[m.id] = 1;
  toast(`${m.ic} ${m.name} débloqué`);
  sfx(660, 0.2, 'sine'); sfx(990, 0.3, 'sine', 0.1);
  refresh(true);
}
// Repart de zéro en gardant tout ce qui est permanent (utilisé par Supernova et par les défis).
function resetRun(extra) {
  const keep = { novaTotal: S.novaTotal, novaBank: S.novaBank, meta: S.meta, ach: S.ach, prestiges: S.prestiges, lifeTotal: S.lifeTotal, lifeClicks: S.lifeClicks, lifeComets: S.lifeComets, chalDone: S.chalDone || {}, ...extra };
  const kept = {};
  if (has('m_keep')) for (const k of ['click0', 'click1', 'click2']) if (S.upg[k]) kept[k] = 1;
  S = Object.assign(fresh(), keep); S.upg = kept;
  if (has('m_start')) { S.gens[0] = 10; S.gens[1] = 5; }
}
function startChal(c) {
  if (S.chal || chalDone(c.id) || S.prestiges < c.need) return;
  if (!confirm(`Défi « ${c.name} »\n\n${c.desc}\nObjectif : produire ${fmt(c.goal)}${c.time ? ' en ' + c.time / 60 + ' min' : ''}.\nRécompense permanente : ${c.reward}.\n\nTa run actuelle repart de zéro (sans Novae). Continuer ?`)) return;
  resetRun({ chal: c.id, chalT: 0 });
  comet = null; flash = 0.6; toast(`${c.ic} Défi lancé : ${c.name}`); sfx(330, 0.4, 'square', 0.05);
  save(); refresh(true);
}
function quitChal(silent) {
  if (!S.chal) return;
  if (!silent && !confirm('Abandonner le défi ? La run repart de zéro.')) return;
  resetRun({ chal: null }); save(); refresh(true);
}
function checkChal(dt) {
  if (!S.chal) return;
  const c = CHALS.find(x => x.id === S.chal);
  S.chalT += dt;
  if (c.time && S.chalT > c.time) { toast(`⏱️ Temps écoulé : défi « ${c.name} » raté`); quitChal(true); return; }
  if (S.runTotal >= c.goal) {
    S.chalDone[c.id] = 1; S.chal = null;
    toast(`🏅 Défi réussi : ${c.name} — ${c.reward}`); flash = 0.8;
    sfx(660, 0.3, 'triangle', 0.08); sfx(990, 0.4, 'triangle', 0.06);
    save(); refresh(true);
  }
}

function prestige() {
  if (S.chal) { toast('Termine ou abandonne le défi avant une Supernova'); return; }
  const g = novaGain();
  if (g < 1) return;
  if (!confirm(`Supernova !\n\nTu perds ta poussière, tes forges et tes améliorations,\nmais tu gagnes ${g} Nova(e) : +${g * (has('m_nova') ? 5 : 3)} % de production permanente et de quoi développer ta Constellation.\n\nContinuer ?`)) return;
  resetRun({ novaTotal: S.novaTotal + g, novaBank: S.novaBank + g, prestiges: S.prestiges + 1 });
  flash = 1;
  sfx(110, 1.2, 'sawtooth', 0.08);
  toast(`💥 Supernova ! +${g} Novae`);
  checkAch(); save(); refresh(true);
}

// ---------- comètes dorées ----------
let comet = null, nextComet = 40 + Math.random() * 60;
const buffDur = () => (has('m_long') ? 2 : 1) * (chalDone('c_rush') ? 1.25 : 1);
function spawnComet() {
  const fromLeft = Math.random() < 0.5;
  comet = { x: fromLeft ? -0.1 : 1.1, y: 0.15 + Math.random() * 0.5, vx: (fromLeft ? 1 : -1) * (0.05 + Math.random() * 0.03) / (0.8 + luck() * 0.2), vy: 0.01 * (Math.random() - 0.5), t: 0 };
}
function catchComet() {
  S.cometsTotal++; S.lifeComets++;
  const r = Math.random();
  if (r < 0.45) {
    const v = Math.min(S.dust * 0.15, dps() * 900) + 13;
    earn(v); toast(`☄️ Pluie d'or : +${fmt(v)}`);
  } else if (r < 0.85) {
    S.buffs.push({ type: 'frenzy', t: 60 * buffDur(), max: 60 * buffDur() }); toast('☄️ Frénésie : production ×7 pendant ' + 60 * buffDur() + ' s');
  } else {
    S.buffs.push({ type: 'click', t: 13 * buffDur(), max: 13 * buffDur() }); toast('☄️ Frappe divine : clics ×777 pendant ' + 13 * buffDur() + ' s');
  }
  sfx(1200, 0.3, 'sine', 0.1); sfx(1600, 0.3, 'sine', 0.08);
  for (let k = 0; k < 40; k++) parts.push({ x: comet.x * cw, y: comet.y * ch, vx: (Math.random() - .5) * 8, vy: (Math.random() - .5) * 8, life: 1, col: '#ffd84d', s: 3 });
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
let cw = 0, ch = 0, dpr = 1, pulse = 0, flash = 0, parts = [], floats = [], bgStars = [];
function resizeStar() {
  const r = cv.getBoundingClientRect(); if (!r.width) return;
  dpr = Math.min(2, devicePixelRatio || 1); cw = r.width; ch = r.height;
  cv.width = cw * dpr; cv.height = ch * dpr;
  bgStars = Array.from({ length: 70 }, () => ({ x: Math.random() * cw, y: Math.random() * ch, s: Math.random() * 1.5 + 0.3, p: Math.random() * 6 }));
}
function drawStar(dt, time) {
  const c = cx2; c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, cw, ch);
  bgStars.forEach(s => { c.globalAlpha = 0.3 + 0.3 * Math.sin(time * 1.5 + s.p); c.fillStyle = '#fff'; c.fillRect(s.x, s.y, s.s, s.s); });
  c.globalAlpha = 1;
  const X = cw / 2, Y = ch / 2, R = Math.min(cw, ch) * 0.2 * (1 + pulse * 0.08);
  pulse = Math.max(0, pulse - dt * 5);
  const hue = (40 + S.novaTotal * 7) % 360;
  const frenzy = S.buffs.some(b => b.type === 'frenzy');
  // orbites des forges
  GENS.forEach((g, i) => {
    if (!S.gens[i]) return;
    const orb = R * (1.5 + i * 0.22); if (orb > Math.min(cw, ch) * 0.5) return;
    c.strokeStyle = 'rgba(255,255,255,.05)'; c.beginPath(); c.ellipse(X, Y, orb, orb * 0.42, 0, 0, Math.PI * 2); c.stroke();
    const n = Math.min(S.gens[i], 18);
    for (let k = 0; k < n; k++) {
      const a = time * (0.5 - i * 0.035) + k * Math.PI * 2 / n + i;
      const px = X + Math.cos(a) * orb, py = Y + Math.sin(a) * orb * 0.42;
      c.fillStyle = g.col; c.globalAlpha = Math.sin(a) > 0 ? 1 : 0.5;
      c.beginPath(); c.arc(px, py, 2 + (Math.sin(a) > 0 ? 1.2 : 0), 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;
  });
  // halo
  const gr = c.createRadialGradient(X, Y, R * 0.2, X, Y, R * 2.6);
  gr.addColorStop(0, `hsla(${hue},100%,75%,.9)`); gr.addColorStop(0.35, `hsla(${hue},100%,60%,.25)`); gr.addColorStop(1, 'hsla(0,0%,0%,0)');
  c.fillStyle = gr; c.beginPath(); c.arc(X, Y, R * 2.6, 0, Math.PI * 2); c.fill();
  // rayons
  c.save(); c.translate(X, Y); c.rotate(time * (frenzy ? 0.9 : 0.15));
  for (let k = 0; k < 12; k++) {
    c.rotate(Math.PI / 6);
    c.fillStyle = `hsla(${hue + 10},100%,80%,${0.12 + 0.05 * Math.sin(time * 2 + k)})`;
    c.beginPath(); c.moveTo(-R * 0.12, 0); c.lineTo(0, -R * (1.9 + 0.2 * Math.sin(time * 3 + k))); c.lineTo(R * 0.12, 0); c.fill();
  }
  c.restore();
  // cœur étoile (5 branches)
  c.save(); c.translate(X, Y); c.rotate(Math.sin(time * 0.6) * 0.1);
  const core = c.createRadialGradient(0, -R * 0.2, R * 0.1, 0, 0, R);
  core.addColorStop(0, '#fffbe6'); core.addColorStop(0.5, `hsl(${hue},100%,65%)`); core.addColorStop(1, `hsl(${hue - 20},90%,45%)`);
  c.fillStyle = core; c.shadowColor = `hsl(${hue},100%,60%)`; c.shadowBlur = 30;
  c.beginPath();
  for (let k = 0; k < 10; k++) { const rr = k % 2 ? R * 0.48 : R; const a = -Math.PI / 2 + k * Math.PI / 5; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  c.closePath(); c.fill();
  c.shadowBlur = 0; c.fillStyle = '#3a2a10';
  c.beginPath(); c.arc(-R * 0.16, -R * 0.05, R * 0.05, 0, 7); c.arc(R * 0.16, -R * 0.05, R * 0.05, 0, 7); c.fill();
  c.strokeStyle = '#3a2a10'; c.lineWidth = R * 0.03; c.beginPath(); c.arc(0, R * 0.05, R * 0.1, 0.2, Math.PI - 0.2); c.stroke();
  c.restore();
  // comète
  if (comet) {
    const px = comet.x * cw, py = comet.y * ch;
    const tg = c.createLinearGradient(px, py, px - comet.vx * cw * 3, py);
    tg.addColorStop(0, 'rgba(255,216,77,.8)'); tg.addColorStop(1, 'rgba(255,216,77,0)');
    c.strokeStyle = tg; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(px, py); c.lineTo(px - comet.vx * cw * 3, py - comet.vy * ch * 3); c.stroke();
    c.fillStyle = '#fff4b0'; c.shadowColor = '#ffd84d'; c.shadowBlur = 20; c.beginPath(); c.arc(px, py, 11 + Math.sin(time * 10) * 2, 0, 7); c.fill(); c.shadowBlur = 0;
  }
  // particules + nombres
  parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life -= dt * 1.5; c.globalAlpha = Math.max(0, p.life); c.fillStyle = p.col; c.fillRect(p.x, p.y, p.s, p.s); });
  parts = parts.filter(p => p.life > 0);
  c.font = '800 16px system-ui,sans-serif'; c.textAlign = 'center';
  floats.forEach(f => { f.y -= dt * 60; f.life -= dt; c.globalAlpha = Math.max(0, f.life); c.fillStyle = f.col; c.fillText(f.t, f.x, f.y); });
  floats = floats.filter(f => f.life > 0);
  c.globalAlpha = 1;
  if (flash > 0) { c.fillStyle = `rgba(255,240,255,${flash})`; c.fillRect(0, 0, cw, ch); flash = Math.max(0, flash - dt * 0.8); }
}

function clickStar(x, y) {
  if (comet && Math.hypot(x - comet.x * cw, y - comet.y * ch) < 34) { catchComet(); return; }
  const X = cw / 2, Y = ch / 2, R = Math.min(cw, ch) * 0.2;
  if (Math.hypot(x - X, y - Y) > R * 1.3) return;
  const v = clickValue();
  earn(v); S.clicks++; S.lifeClicks++; pulse = 1;
  floats.push({ x: x + (Math.random() - .5) * 20, y, t: '+' + fmt(v), life: 1, col: S.buffs.some(b => b.type === 'click') ? '#ff9dfc' : '#ffe38a' });
  for (let k = 0; k < 6; k++) parts.push({ x, y, vx: (Math.random() - .5) * 5, vy: -Math.random() * 5, life: 1, col: '#ffe38a', s: 2 + Math.random() * 2 });
  sfx(700 + Math.random() * 200, 0.04, 'sine', 0.03);
}
cv.addEventListener('pointerdown', e => { const r = cv.getBoundingClientRect(); clickStar(e.clientX - r.left, e.clientY - r.top); });

// ---------- UI ----------
let tab = 'gen', built = null;
const panel = $('sf-panel');
let tip = null;
function showTip(el, html) {
  hideTip(); tip = document.createElement('div'); tip.className = 'sf-tip'; tip.innerHTML = html; document.body.appendChild(tip);
  const r = el.getBoundingClientRect(); const tr = tip.getBoundingClientRect();
  let x = r.left + r.width / 2 - tr.width / 2, y = r.top - tr.height - 8;
  if (y < 40) y = r.bottom + 8; x = Math.max(6, Math.min(innerWidth - tr.width - 6, x));
  tip.style.left = x + 'px'; tip.style.top = y + 'px';
}
function hideTip() { if (tip) tip.remove(); tip = null; }

function build() {
  hideTip(); panel.innerHTML = ''; built = tab;
  $('sf-buymult').classList.toggle('hidden', tab !== 'gen');
  if (tab === 'gen') {
    GENS.forEach((g, i) => {
      const b = document.createElement('button'); b.className = 'sf-item'; b.dataset.i = i;
      b.innerHTML = `<div class="ic" style="background:${g.col}22">${g.ic}</div><div class="mid"><b>${g.name}</b><span class="d"></span></div><div class="rt"><b class="n">0</b><span class="c"></span></div>`;
      b.onclick = () => buyGen(i);
      b.onmouseenter = () => showTip(b, `<b>${g.name}</b><br>${g.desc}<br><br>Chacun : ${fmt(g.prod * genMult(i) * globalMult())} /s<br>Total : ${fmt(S.gens[i] * g.prod * genMult(i) * globalMult())} /s<br>Prochain palier (×2) : ${MILESTONES.find(t => t > S.gens[i]) || '—'}`);
      b.onmouseleave = hideTip;
      panel.appendChild(b);
    });
  } else if (tab === 'upg') {
    const h = document.createElement('div'); h.className = 'sf-h'; h.textContent = 'Disponibles'; panel.appendChild(h);
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
    META.forEach(m => {
      const n = document.createElement('button'); n.className = 'sf-node'; n.dataset.id = m.id;
      n.style.left = m.x + '%'; n.style.top = m.y + '%';
      n.innerHTML = `${m.ic}<small>${m.cost}✦</small>`;
      n.onclick = () => buyMeta(m);
      n.onmouseenter = () => showTip(n, `<b>${m.name}</b> — <span class="nova">${m.cost} Novae</span><br>${m.desc}${m.req.length ? '<br><span class="muted">Requiert : ' + m.req.map(r => META.find(q => q.id === r).name).join(', ') + '</span>' : ''}`);
      n.onmouseleave = hideTip;
      tree.appendChild(n);
    });
    panel.appendChild(tree);
  } else if (tab === 'chal') {
    const info = document.createElement('div'); info.className = 'muted small'; info.textContent = 'Un défi relance la run sous contrainte, sans Novae. Réussis l\'objectif pour gagner une récompense permanente ; la contrainte disparaît aussitôt et la run continue.'; panel.appendChild(info);
    CHALS.forEach(c => {
      const d = document.createElement('div'); d.className = 'sf-ch'; d.dataset.id = c.id;
      d.innerHTML = `<div class="ic">${c.ic}</div><div class="mid"><b>${c.name}</b><span>${c.desc} Objectif : ${fmt(c.goal)}${c.time ? ' en ' + c.time / 60 + ' min' : ''}.</span><span class="rw">🏅 ${c.reward}</span></div><button class="btn small">Lancer</button>`;
      d.querySelector('button').onclick = () => startChal(c);
      panel.appendChild(d);
    });
  } else if (tab === 'ach') {
    const info = document.createElement('div'); info.className = 'muted small'; info.id = 'sf-ach-info'; panel.appendChild(info);
    const g = document.createElement('div'); g.className = 'sf-ach';
    ACH.forEach(a => { const d = document.createElement('div'); d.dataset.id = a.id; d.textContent = a.ic; d.onmouseenter = () => showTip(d, `<b>${a.name}</b><br>${a.desc}`); d.onmouseleave = hideTip; g.appendChild(d); });
    panel.appendChild(g);
    const st = document.createElement('div'); st.className = 'muted small'; st.id = 'sf-stats'; st.style.marginTop = '12px'; panel.appendChild(st);
  } else if (tab === 'opt') {
    panel.innerHTML = `<div class="sf-h">Sauvegarde</div>
      <p class="muted small">Sauvegarde automatique dans ton navigateur toutes les 10 secondes.</p>
      <div class="row" style="justify-content:flex-start"><button class="btn ghost small" id="sf-exp">Exporter</button><button class="btn ghost small" id="sf-imp">Importer</button><button class="btn small" id="sf-wipe" style="background:#a0304a">Tout effacer</button></div>
      <textarea id="sf-io" style="width:100%;height:90px;margin-top:8px;background:#0a0c16;color:#ccd;border:1px solid #2a3050;border-radius:8px;padding:6px;font-size:11px"></textarea>
      <div class="sf-h">Comment jouer</div>
      <p class="small muted">Clique l'étoile pour récolter de la poussière. Achète des forges qui produisent seules, puis des améliorations qui les multiplient. Chaque palier de 25, 50, 100… forges double leur production. Attrape les comètes dorées qui traversent le ciel. Quand la progression ralentit, déclenche une <b class="nova">Supernova</b> : tu repars de zéro, mais avec des Novae qui boostent tout et débloquent la Constellation.</p>`;
    $('sf-exp').onclick = () => { save(); $('sf-io').value = btoa(unescape(encodeURIComponent(JSON.stringify(S)))); };
    $('sf-imp').onclick = () => { try { const d = JSON.parse(decodeURIComponent(escape(atob($('sf-io').value.trim())))); S = Object.assign(fresh(), d); save(); toast('Sauvegarde importée'); refresh(true); } catch (e) { toast('Sauvegarde invalide'); } };
    $('sf-wipe').onclick = () => { if (confirm('Effacer définitivement toute ta progression, Novae comprises ?')) { S = fresh(); save(); refresh(true); } };
  }
  refresh();
}
function fillUpgrades() {
  const grid = $('sf-upg-grid'), grid2 = $('sf-upg-owned'); if (!grid) return;
  grid.innerHTML = ''; grid2.innerHTML = '';
  const av = UPGRADES.filter(u => !S.upg[u.id] && u.req(S)).sort((a, b) => upgCost(a) - upgCost(b));
  if (!av.length) grid.innerHTML = '<p class="muted small" style="grid-column:1/-1">Rien pour l\'instant — continue à forger.</p>';
  av.forEach(u => {
    const b = document.createElement('button'); b.className = 'sf-upg'; b.dataset.id = u.id; b.textContent = u.ic;
    b.onclick = () => buyUpg(u);
    b.onmouseenter = () => showTip(b, `<b>${u.name}</b><br>${u.desc}<br><span style="color:var(--gold)">${fmt(upgCost(u))}</span>`);
    b.onmouseleave = hideTip;
    grid.appendChild(b);
  });
  const owned = UPGRADES.filter(u => S.upg[u.id]);
  $('sf-upg-owned-h').textContent = `Achetées (${owned.length}/${UPGRADES.length})`;
  owned.forEach(u => { const d = document.createElement('div'); d.className = 'sf-upg'; d.style.opacity = .6; d.textContent = u.ic; d.onmouseenter = () => showTip(d, `<b>${u.name}</b><br>${u.desc}`); d.onmouseleave = hideTip; grid2.appendChild(d); });
  upgSig = sigUpg();
}
let upgSig = '';
const sigUpg = () => UPGRADES.filter(u => !S.upg[u.id] && u.req(S)).map(u => u.id).join();

function refresh(structural) {
  if (!built) return;
  $('sf-dust').textContent = fmt(S.dust);
  $('sf-rate').textContent = fmt(dps());
  $('sf-click').textContent = fmt(clickValue());
  const g = novaGain();
  $('sf-nova-gain').textContent = g; $('sf-nova-have').textContent = S.novaBank + (S.novaTotal !== S.novaBank ? ` (${S.novaTotal} gagnées)` : '');
  $('sf-prestige').disabled = g < 1;
  $('sf-prestige-box').style.display = S.runTotal >= 1e5 || S.novaTotal > 0 ? '' : 'none';
  $('sf-tab-chal').classList.toggle('hidden', S.prestiges < 1);
  const ch = S.chal && CHALS.find(x => x.id === S.chal);
  $('sf-chal').classList.toggle('hidden', !ch);
  if (ch) $('sf-chal-txt').textContent = `${ch.ic} ${ch.name} : ${fmt(Math.min(S.runTotal, ch.goal))} / ${fmt(ch.goal)}${ch.time ? ` · ⏱ ${Math.max(0, Math.ceil((ch.time - S.chalT) / 60))} min` : ''}`;
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
      const known = S.gens[i] > 0 || i === 0 || S.gens[i - 1] > 0 || S.runTotal >= gen.cost * 0.5;
      if (!known) { shownLocked++; b.style.display = shownLocked > 1 ? 'none' : ''; }
      else b.style.display = '';
      b.classList.toggle('locked', !known);
      b.querySelector('.n').textContent = S.gens[i];
      b.querySelector('.c').textContent = (n > 1 ? `×${n} · ` : '') + fmt(c);
      const next = MILESTONES.find(t => t > S.gens[i]);
      b.querySelector('.d').textContent = known ? `${fmt(gen.prod * genMult(i) * globalMult())} /s chacun${next ? ` · palier ${next}` : ''}` : '???';
      const banned = inChal('c_short') && i > 2;
      if (banned) b.querySelector('.d').textContent = '🧱 indisponible pendant le défi Pénurie';
      b.classList.toggle('can', known && !banned && S.dust >= c);
      b.classList.toggle('no', !known || banned || S.dust < c);
    });
  } else if (tab === 'upg') {
    if (structural || sigUpg() !== upgSig) fillUpgrades();
    panel.querySelectorAll('#sf-upg-grid .sf-upg').forEach(b => {
      const u = UPGRADES.find(x => x.id === b.dataset.id);
      b.classList.toggle('can', S.dust >= upgCost(u)); b.classList.toggle('no', S.dust < upgCost(u));
    });
  } else if (tab === 'meta') {
    $('sf-meta-info').innerHTML = `Novae disponibles : <b class="nova">${S.novaBank}</b> · Bonus passif : <b>+${Math.round(S.novaTotal * (has('m_nova') ? 5 : 3))} %</b> de production. Les nœuds de la Constellation survivent à toutes les Supernovae.`;
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
      b.textContent = done ? 'Réussi ✓' : cur ? 'En cours' : lock ? `${c.need} Supernova${c.need > 1 ? 'e' : ''}` : 'Lancer';
      b.disabled = done || cur || lock || !!S.chal;
    });
  } else if (tab === 'ach') {
    const got = Object.keys(S.ach).length;
    $('sf-ach-info').textContent = `${got}/${ACH.length} succès — chacun donne +${has('m_ach') ? 3 : 1} % de production, pour toujours.`;
    panel.querySelectorAll('.sf-ach div').forEach(d => d.classList.toggle('got', !!S.ach[d.dataset.id]));
    $('sf-stats').innerHTML = `Produit (run) : ${fmt(S.runTotal)}<br>Produit (total) : ${fmt(S.lifeTotal)}<br>Clics : ${fmt(S.lifeClicks)}<br>Comètes : ${S.lifeComets}<br>Supernovae : ${S.prestiges}`;
  }
}

function toast(t) {
  const z = $('sf-toasts'); const d = document.createElement('div'); d.className = 'toast'; d.textContent = t; z.appendChild(d);
  setTimeout(() => d.remove(), 4000);
  while (z.children.length > 4) z.firstChild.remove();
}
function checkAch() {
  for (const a of ACH) if (!S.ach[a.id] && a.test(S)) { S.ach[a.id] = 1; toast(`🏆 Succès : ${a.name}`); }
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
$('sf-chal-quit').onclick = () => quitChal(false);

// ---------- boucle ----------
function tick(dt) {
  earn(dps() * dt);
  checkChal(dt);
  if (has('m_auto') && !inChal('c_hands')) { autoAcc += dt * 5; while (autoAcc >= 1) { autoAcc--; const v = clickValue(); earn(v); S.clicks++; } }
  S.buffs.forEach(b => b.t -= dt); S.buffs = S.buffs.filter(b => b.t > 0);
  if (!comet) { nextComet -= dt; if (nextComet <= 0 && visible && !inChal('c_dim')) spawnComet(); }
  else { comet.x += comet.vx * dt; comet.y += comet.vy * dt; if (comet.x < -0.2 || comet.x > 1.2) { comet = null; nextComet = (60 + Math.random() * 120) / luck(); } }
}
let autoAcc = 0;

function save() { S.last = Date.now(); try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (!d) return;
    S = Object.assign(fresh(), d);
    if (S.chal) S.chalT += Math.min(8 * 3600, (Date.now() - (d.last || Date.now())) / 1000);   // le chrono tourne aussi hors-ligne
    while (S.gens.length < GENS.length) S.gens.push(0);
    S.buffs = [];
    const away = Math.min(8 * 3600, (Date.now() - (d.last || Date.now())) / 1000);
    if (away > 30) {
      const v = dps() * away * (has('m_off') ? 1 : 0.25);
      if (v > 0) { earn(v); setTimeout(() => toast(`🌙 Pendant ton absence : +${fmt(v)}`), 300); }
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
document.addEventListener('visibilitychange', () => { if (document.hidden) save(); else if (inited) { const d = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (d) { const away = Math.min(8 * 3600, (Date.now() - d.last) / 1000); if (away > 5) earn(dps() * away * (has('m_off') ? 1 : 0.25)); } } });
window.addEventListener('beforeunload', save);
window.addEventListener('resize', () => visible && resizeStar());

window.GAMES.forge = {
  show() {
    visible = true;
    if (!inited) { inited = true; load(); lastT = performance.now(); requestAnimationFrame(loop); }
    requestAnimationFrame(() => { resizeStar(); build(); });
  },
  hide() { visible = false; hideTip(); save(); },
};
