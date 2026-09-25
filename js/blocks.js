// BLOC PARTY — puzzle casual façon "Block Blast" : pose les pièces, complète lignes et colonnes.
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
const PRAISE = ['', 'Bien !', 'Super !', 'Génial !', 'Incroyable !', 'LÉGENDAIRE !'];
const STONE = '#7d7f9c';
// Thèmes : la couleur de base d'une pièce (indice dans COLORS) est remappée à l'affichage.
const THEMES = [
  { id: 'classic', name: 'Classique', cost: 0, style: 'candy', pal: COLORS, bg: 'radial-gradient(ellipse at 50% 0%,#3b2a6b 0%,#1b1840 55%,#120f2a 100%)' },
  { id: 'neon', name: 'Néon', cost: 60, style: 'neon', pal: ['#ff3df0', '#ffe14d', '#27e0ff', '#5dff7a', '#b46bff', '#ff7a2e', '#2effd5'], bg: 'radial-gradient(ellipse at 50% 0%,#1a0a33 0%,#07040f 70%)' },
  { id: 'pastel', name: 'Pastel', cost: 80, style: 'soft', pal: ['#ffb3c7', '#ffe3a3', '#a8e6ff', '#b8f5c0', '#d9c2ff', '#ffc9a8', '#a8fff0'], bg: 'radial-gradient(ellipse at 50% 0%,#5a4a8a 0%,#3a3066 60%,#2a2450 100%)' },
  { id: 'pixel', name: 'Pixel', cost: 100, style: 'pixel', pal: ['#e8405a', '#f6c03a', '#3aa8f6', '#4fd65a', '#9a5af6', '#f6823a', '#3af6c8'], bg: 'linear-gradient(#1a2440,#0c1224)' },
  { id: 'gold', name: 'Or & Obsidienne', cost: 200, style: 'gem', pal: ['#ffd24d', '#ffe899', '#e0a93a', '#fff0c2', '#c98a2a', '#ffb84d', '#f5d68a'], bg: 'radial-gradient(ellipse at 50% 0%,#2a2218 0%,#0a0806 70%)' },
];
let THEME = { owned: ['classic'], cur: 'classic' };
try { THEME = Object.assign(THEME, JSON.parse(localStorage.getItem('blocparty.themes') || '{}')); } catch (e) {}
const saveTheme = () => { try { localStorage.setItem('blocparty.themes', JSON.stringify(THEME)); } catch (e) {} };
const curTheme = () => THEMES.find(t => t.id === THEME.cur) || THEMES[0];
const tc = c => { const i = COLORS.indexOf(c); return i >= 0 ? curTheme().pal[i] : c; };
const LEVELS = 40;
// Générateur déterministe : un niveau d'aventure a toujours la même grille et les mêmes pièces.
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
let rnd = Math.random;
let TUTO = false;
try { TUTO = !localStorage.getItem('blocparty.tuto'); } catch (e) {}
const tutoDone = () => { if (!TUTO) return; TUTO = false; try { localStorage.setItem('blocparty.tuto', '1'); } catch (e) {} };

const $ = id => document.getElementById(id);
const canvas = $('bp-canvas');
const ctx = canvas.getContext('2d');
let W = 0, H = 0, DPR = 1;
let L = {}; // layout

const S = {
  board: [], tray: [], score: 0, shown: 0, best: 0, combo: 0, over: false,
  drag: null, fx: [], pops: [], clearing: [], shake: 0, placedAnim: [],
  mode: 'classic', lvl: 1, goal: null, moves: 0, gems: new Set(), got: 0,
};
let ADV = { stars: {} };
// Boosters payés en pièces : gagnées à chaque ligne en classique, aux étoiles en Aventure.
const TOOLS = { hammer: 15, bomb: 30, shuffle: 20 };
let COINS = 40, tool = null;
try { const c = localStorage.getItem('blocparty.coins'); if (c !== null) COINS = +c; } catch (e) {}
const saveCoins = () => { try { localStorage.setItem('blocparty.coins', COINS); } catch (e) {} paintBoost(); };
function paintBoost() {
  $('bp-coins').textContent = COINS;
  document.querySelectorAll('#bp-boost button').forEach(b => { b.classList.toggle('on', b.dataset.tool === tool); b.classList.toggle('no', COINS < TOOLS[b.dataset.tool]); });
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

function load() {
  try {
    const d = JSON.parse(localStorage.getItem('blocparty.save') || 'null');
    S.best = +(localStorage.getItem('blocparty.best') || 0);
    if (d && d.board && d.board.length === N) {
      S.board = d.board; S.tray = d.tray; S.score = d.score; S.shown = d.score; S.combo = d.combo || 0;
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
    else localStorage.setItem('blocparty.save', JSON.stringify({ board: S.board, tray: S.tray, score: S.score, combo: S.combo }));
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
  return { cells, w: Math.max(...cells.map(c => c[0])) + 1, h: Math.max(...cells.map(c => c[1])) + 1, color: COLORS[(rnd() * COLORS.length) | 0] };
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
function fillTray() {
  // Un peu de bienveillance : on réessaie pour qu'au moins une pièce rentre.
  // En Aventure, on vise un plateau où les trois pièces rentrent (le niveau doit rester jouable).
  let best = null;
  const tries = S.mode === 'adv' ? 30 : 12;
  for (let k = 0; k < tries; k++) {
    const t = [makePiece(), makePiece(), makePiece()];
    const ok = S.mode === 'adv' ? t.every(p => canPlaceAnywhere(p)) : t.some(p => canPlaceAnywhere(p));
    if (ok) { best = t; break; }
    if (!best || t.some(p => canPlaceAnywhere(p))) best = t;
  }
  S.tray = best;
}

function newGame() {
  S.mode = 'classic'; rnd = Math.random; S.gems.clear();
  S.board = Array.from({ length: N }, () => Array(N).fill(null));
  S.score = 0; S.shown = 0; S.combo = 0; S.over = false; S.fx = []; S.pops = []; S.clearing = [];
  fillTray();
  $('bp-over').classList.add('hidden');
  save(); updateHUD();
}

function genLevel(n) {
  // Les pierres forment des lignes / colonnes à trous : on les complète pour libérer les gemmes.
  const r = mulberry32(n * 7919 + 13);
  const board = Array.from({ length: N }, () => Array(N).fill(null));
  const bands = Math.min(1 + Math.floor(n / 4), 5), cells = [];
  const used = new Set();
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
      cells.push([x, y]);
    }
  }
  const type = n % 4 === 0 ? 'lines' : 'gems';
  const gemsN = Math.min(2 + Math.floor(n / 3), 10, cells.length);
  const gems = new Set();
  while (gems.size < gemsN) { const [x, y] = cells[(r() * cells.length) | 0]; gems.add(y * N + x); }
  const target = 3 + Math.floor(n / 5);
  const moves = type === 'gems' ? 6 + Math.round(gemsN * 1.5) + bands * 2 : 6 + target * 3;
  return { board, gems: type === 'gems' ? gems : new Set(), goal: { type, gems: type === 'gems' ? gemsN : 0, target, moves } };
}
function startLevel(n) {
  const L0 = genLevel(n);
  S.mode = 'adv'; S.lvl = n; S.goal = L0.goal; S.moves = L0.goal.moves; S.gems = L0.gems; S.got = 0; S.lines = 0; S.rescue = 1; S.moreBought = false;
  S.board = L0.board; S.score = 0; S.shown = 0; S.combo = 0; S.over = false; S.fx = []; S.pops = []; S.clearing = [];
  rnd = mulberry32(n * 104729 + 7);
  fillTray();
  ['bp-over', 'bp-map', 'bp-res'].forEach(id => $(id).classList.add('hidden'));
  S.pops.push({ text: `Niveau ${n}`, sub: S.goal.type === 'gems' ? `Récupère ${S.goal.gems} 💎` : `Efface ${S.goal.target} lignes`, t: 0 });
  updateHUD();
}
function advResult(win) {
  S.over = true;
  let stars = 0;
  if (win) {
    const used = S.goal.moves - S.moves, ratio = used / S.goal.moves;
    stars = ratio <= 0.6 ? 3 : ratio <= 0.8 ? 2 : 1;
    const prev = ADV.stars[S.lvl] || 0;
    ADV.stars[S.lvl] = Math.max(prev, stars); saveAdv();
    if (stars > prev) { COINS += (stars - prev) * 10; saveCoins(); }
  }
  setTimeout(() => {
    $('bp-restitle').textContent = win ? `Niveau ${S.lvl} réussi !` : 'Raté… presque !';
    $('bp-resstars').innerHTML = [1, 2, 3].map(k => k <= stars ? '★' : '<i>★</i>').join('');
    $('bp-restext').textContent = win ? `${S.goal.moves - S.moves} coups utilisés sur ${S.goal.moves} · 🪙 total ${COINS}` : (S.moves <= 0 ? 'Plus de coups.' : 'Plus de place pour les pièces.');
    $('bp-resnext').classList.toggle('hidden', !win || S.lvl >= LEVELS);
    $('bp-rescont').classList.toggle('hidden', win || S.moves <= 0 || COINS < TOOLS.hammer);
    $('bp-resmore').classList.toggle('hidden', win || S.moves > 0 || S.moreBought || COINS < MORE_COST);   // seconde chance, une fois par tentative
    $('bp-res').classList.remove('hidden');
    if (win) [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, 0.18, 'triangle', 0.06), i * 110));
    else beep(260, 0.4, 'sawtooth', 0.04);
  }, 700);
}
// ---------- défi du jour : même grille et mêmes pièces pour tout le monde, graine = date locale
const dayKey = (d = new Date()) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
const todayLabel = () => new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
let DAILY = { day: 0, best: 0, streak: 0, last: 0 };
try { DAILY = Object.assign(DAILY, JSON.parse(localStorage.getItem('blocparty.daily') || '{}')); } catch (e) {}
const saveDaily = () => { try { localStorage.setItem('blocparty.daily', JSON.stringify(DAILY)); } catch (e) {} };
function startDaily() {
  const today = dayKey();
  if (DAILY.day !== today) {
    const y = new Date(); y.setDate(y.getDate() - 1);
    DAILY.streak = DAILY.day === dayKey(y) ? DAILY.streak + 1 : 1;
    DAILY.day = today; DAILY.best = 0; saveDaily();
  }
  const r = mulberry32(today);
  const board = Array.from({ length: N }, () => Array(N).fill(null));
  for (let k = 0; k < 7; k++) { const x = (r() * N) | 0, y = (r() * N) | 0; board[y][x] = STONE; }
  S.mode = 'daily'; S.gems = new Set(); S.board = board; S.score = 0; S.shown = 0; S.combo = 0; S.over = false; S.fx = []; S.pops = []; S.clearing = [];
  rnd = mulberry32(today * 31 + 7);
  fillTray();
  ['bp-over', 'bp-map', 'bp-res'].forEach(id => $(id).classList.add('hidden'));
  S.pops.push({ text: '🎯 Défi du jour', sub: `${todayLabel()} · série ${DAILY.streak}`, t: 0 });
  updateHUD();
}

function applyTheme() { $('tab-blocks').style.background = curTheme().bg; }
function openThemes() {
  const box = $('bp-thgrid'); box.innerHTML = '';
  for (const t of THEMES) {
    const owned = THEME.owned.includes(t.id), cur = THEME.cur === t.id;
    const d = document.createElement('button'); d.className = 'bp-th' + (cur ? ' cur' : '') + (!owned && COINS < t.cost ? ' no' : '');
    d.innerHTML = `<canvas width="200" height="100"></canvas><b>${t.name}</b><small>${cur ? '✓ équipé' : owned ? 'Équiper' : '🪙 ' + t.cost}</small>`;
    // aperçu : 4 cases dans le style du thème, sur son fond
    const cv = d.querySelector('canvas'), g = cv.getContext('2d'), prev = THEME.cur;
    THEME.cur = t.id; g.fillStyle = '#15122e'; g.fillRect(0, 0, 200, 100);
    [0, 1, 2, 3].forEach(i => cell(18 + i * 42, 30, 40, COLORS[i], 1, g)); THEME.cur = prev;
    d.onclick = () => {
      if (!owned) { if (COINS < t.cost) { beep(180, 0.1, 'square', 0.03); return; } COINS -= t.cost; saveCoins(); THEME.owned.push(t.id); beep(880, 0.2, 'triangle', 0.06); }
      THEME.cur = t.id; saveTheme(); applyTheme(); openThemes();
    };
    box.appendChild(d);
  }
  $('bp-themes').classList.remove('hidden');
}

// ---------- Chrono : 2 minutes, +1,5 s par ligne, points qui valent de plus en plus, top 10 local
const CHRONO_T = 120;
let TOP = [];
try { TOP = JSON.parse(localStorage.getItem('blocparty.chrono') || '[]'); } catch (e) {}
function startChrono() {
  S.mode = 'chrono'; rnd = Math.random; S.gems = new Set(); S.clock = CHRONO_T; S.chronoT = 0; S.myRank = -1;
  S.board = Array.from({ length: N }, () => Array(N).fill(null));
  S.score = 0; S.shown = 0; S.combo = 0; S.over = false; S.fx = []; S.pops = []; S.clearing = [];
  fillTray();
  ['bp-over', 'bp-map', 'bp-res'].forEach(id => $(id).classList.add('hidden'));
  S.pops.push({ text: '⏱ Chrono !', sub: '2 minutes, chaque ligne rend du temps', t: 0 });
  updateHUD();
}
function chronoEnd() {
  if (S.over) return;
  S.over = true; S.endWhy = S.clock <= 0.05 ? 'time' : 'stuck'; S.clock = Math.max(0, S.clock);
  const entry = { s: S.score, d: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), t: Date.now() };
  TOP.push(entry); TOP.sort((a, b) => b.s - a.s); TOP = TOP.slice(0, 10);
  S.myRank = TOP.indexOf(entry);
  try { localStorage.setItem('blocparty.chrono', JSON.stringify(TOP)); } catch (e) {}
  updateHUD();
  setTimeout(gameOver, 400);
}

function openMap() {
  $('bp-daily').innerHTML = `🎯 Défi du jour<small>${todayLabel()}${DAILY.day === dayKey() && DAILY.best ? ' · meilleur ' + DAILY.best.toLocaleString('fr-FR') : ''}${DAILY.streak > 1 && DAILY.day === dayKey() ? ' · série ' + DAILY.streak : ''}</small>`;
  const box = $('bp-levels'); box.innerHTML = '';
  const open = unlockedLvl();
  for (let n = 1; n <= LEVELS; n++) {
    const st = ADV.stars[n] || 0, lock = n > open;
    const b = document.createElement('button');
    b.className = 'bp-lv' + (lock ? ' lock' : '') + (n === open && !st ? ' cur' : '');
    b.innerHTML = `${lock ? '🔒' : n}<small>${st ? '★'.repeat(st) : n % 4 === 0 ? 'lignes' : '💎'}</small>`;
    if (!lock) b.onclick = () => startLevel(n);
    box.appendChild(b);
  }
  $('bp-map').classList.remove('hidden');
  const cur = box.children[open - 1]; if (cur) cur.scrollIntoView({ block: 'nearest' });
}

// Efface des cases hors placement (boosters) : gemmes récoltées, sans consommer de coup.
function smash(cells) {
  let hit = 0;
  for (const [x, y] of cells) {
    if (x < 0 || y < 0 || x >= N || y >= N || !S.board[y][x]) continue;
    const color = S.board[y][x]; hit++;
    S.clearing.push({ x, y, color, t: 0, delay: hit * 0.02 });
    S.board[y][x] = null;
    for (let k = 0; k < 5; k++) burst(x, y, color);
    if (S.gems.delete(y * N + x)) { S.got++; for (let k = 0; k < 10; k++) burst(x, y, '#7ff6ff'); }
  }
  S.shake = 8; beep(120, 0.25, 'sawtooth', 0.05);
  if (S.mode === 'adv' && S.goal.type === 'gems' && S.gems.size === 0) advResult(true);
  save(); updateHUD();
  return hit;
}
function useTool(name, gx, gy) {
  const cost = TOOLS[name];
  if (COINS < cost) return false;
  if (name === 'shuffle') { S.tray = [null, null, null]; fillTray(); beep(700, 0.15, 'triangle', 0.05); }
  else {
    const cells = name === 'bomb' ? [-1, 0, 1].flatMap(dy => [-1, 0, 1].map(dx => [gx + dx, gy + dy])) : [[gx, gy]];
    if (!smash(cells)) return false;
  }
  COINS -= cost; tool = null; saveCoins(); save();
  // toujours bloqué après le booster ? la partie se termine
  if (!S.over && !S.tray.some(t => t && canPlaceAnywhere(t))) {
    if (S.mode === 'adv') advResult(false); else { S.over = true; setTimeout(gameOver, 600); }
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
  tutoDone();
  window.ptEvent && window.ptEvent('bp_pieces', 1);
  const p = S.tray[idx];
  for (const [x, y] of p.cells) { S.board[gy + y][gx + x] = p.color; S.placedAnim.push({ x: gx + x, y: gy + y, t: 0 }); }
  S.tray[idx] = null;
  let gained = p.cells.length;
  const { rows, cols } = linesToClear(S.board);
  const n = rows.length + cols.length;
  if (n > 0) {
    S.combo++; S.lines = (S.lines || 0) + n; window.ptEvent && window.ptEvent('bp_lines', n);
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
      S.clearing.push({ x, y, color, t: 0, delay: (Math.abs(x - gx) + Math.abs(y - gy)) * 0.025 });
      S.board[y][x] = null;
      for (let k = 0; k < 4; k++) burst(x, y, color);
      if (S.gems.delete(y * N + x)) { S.got++; for (let k = 0; k < 10; k++) burst(x, y, '#7ff6ff'); setTimeout(() => beep(1400 + S.got * 60, 0.1, 'sine', 0.05), 80); }
    }
    const allClear = S.board.every(r => r.every(c => !c));
    if (allClear) gained += 300;
    const label = allClear ? 'TABLE RASE ! +300' : (PRAISE[Math.min(n, 5)] || '') + (S.combo > 1 ? `  Combo ×${S.combo}` : '');
    S.pops.length = 0;   // un seul message à la fois : les éloges successifs ne se superposent plus
    S.pops.push({ text: label, sub: '+' + (gained), t: 0 });
    S.shake = Math.min(14, 3 + n * 3);
    [523, 659, 784, 1046, 1318].slice(0, Math.min(5, n + 1)).forEach((f, i) => setTimeout(() => beep(f, 0.12, 'triangle', 0.05), i * 60));
    if (navigator.vibrate) navigator.vibrate(20 * n);
  } else {
    S.combo = 0;
    beep(220 + Math.random() * 40, 0.06, 'square', 0.025);
  }
  S.score += gained;
  if (S.tray.every(t => !t)) fillTray();
  if (S.mode === 'adv') {
    S.moves--;
    const win = S.goal.type === 'gems' ? S.gems.size === 0 : S.lines >= S.goal.target;
    if (win) advResult(true);
    else if (S.moves <= 0) advResult(false);
    else if (!S.tray.some(t => t && canPlaceAnywhere(t))) {
      // Filet de sécurité : un nouveau tirage offert par niveau, puis c'est perdu.
      if (S.rescue > 0) { S.rescue--; S.tray = [null, null, null]; fillTray(); S.pops.push({ text: 'Nouvelles pièces !', sub: 'offertes une fois par niveau', t: 0 }); beep(880, 0.15, 'triangle', 0.05); }
      if (!S.tray.some(t => t && canPlaceAnywhere(t))) advResult(false);
    }
    updateHUD(); return;
  }
  if (S.mode === 'chrono') {
    if (!S.tray.some(t => t && canPlaceAnywhere(t))) {   // bloqué : nouvelles pièces contre 5 s
      S.tray = [null, null, null]; fillTray(); S.clock -= 5;
      S.pops.length = 0; S.pops.push({ text: 'Nouvelles pièces', sub: '−5 s', t: 0 }); beep(300, 0.2, 'square', 0.04);
      if (!S.tray.some(t => t && canPlaceAnywhere(t))) chronoEnd();
    }
    updateHUD(); return;
  }
  if (S.mode === 'daily') { if (S.score > DAILY.best) { DAILY.best = S.score; saveDaily(); } }
  else if (S.score > S.best) S.best = S.score;
  if (!S.tray.some(t => t && canPlaceAnywhere(t))) {
    S.over = true;
    setTimeout(gameOver, 600);
  }
  save(); updateHUD();
}

function gameOver() {
  S.over = true;
  $('bp-final').textContent = S.score.toLocaleString('fr-FR');
  $('bp-overtitle').textContent = S.mode === 'chrono' && S.endWhy === 'time' ? '⏱ Temps écoulé !' : 'Plus de place !';
  const top = $('bp-top10'); top.classList.toggle('hidden', S.mode !== 'chrono');
  if (S.mode === 'chrono') {
    $('bp-newbest').textContent = S.myRank === 0 ? '🏆 Meilleur chrono !' : S.myRank > 0 ? `Classé ${S.myRank + 1}ᵉ de ton top 10` : 'Hors du top 10';
    top.innerHTML = TOP.map((e, i) => `<li class="${i === S.myRank ? 'me' : ''}">${e.s.toLocaleString('fr-FR')} <span class="muted">· ${e.d}</span></li>`).join('');
  } else if (S.mode === 'daily') $('bp-newbest').textContent = `🎯 Défi du ${todayLabel()} — meilleur du jour : ${DAILY.best.toLocaleString('fr-FR')} · série : ${DAILY.streak} jour${DAILY.streak > 1 ? 's' : ''}`;
  else $('bp-newbest').textContent = S.score >= S.best && S.score > 0 ? '🏆 Nouveau record !' : 'Record : ' + S.best.toLocaleString('fr-FR');
  $('bp-cont').classList.toggle('hidden', COINS < TOOLS.hammer || S.mode === 'chrono');
  $('bp-over').classList.remove('hidden');
  beep(300, 0.3, 'sawtooth', 0.04); setTimeout(() => beep(200, 0.4, 'sawtooth', 0.04), 200);
}

function burst(gx, gy, color) {
  const cx = L.bx + (gx + 0.5) * L.cs, cy = L.by + (gy + 0.5) * L.cs;
  S.fx.push({ x: cx, y: cy, vx: (Math.random() - 0.5) * 9, vy: (Math.random() - 0.9) * 9, s: L.cs * (0.15 + Math.random() * 0.2), color: tc(color), life: 1, rot: Math.random() * 6 });
}

function updateHUD() {
  const adv = S.mode === 'adv', daily = S.mode === 'daily';
  $('bp-l1').textContent = adv ? `NIVEAU ${S.lvl} · COUPS` : daily ? '🎯 DÉFI DU JOUR' : 'SCORE';
  $('bp-l2').textContent = adv ? 'OBJECTIF' : daily ? 'MEILLEUR DU JOUR' : 'MEILLEUR';
  if (daily) { $('bp-best').textContent = DAILY.best.toLocaleString('fr-FR'); return; }
  if (S.mode === 'chrono') {
    const c = Math.max(0, Math.ceil(S.clock));
    $('bp-l1').textContent = '⏱ TEMPS';
    $('bp-score').textContent = `${Math.floor(c / 60)}:${String(c % 60).padStart(2, '0')}`;
    $('bp-score').classList.toggle('urgent', c <= 10 && !S.over);
    $('bp-l2').textContent = TOP[0] ? `SCORE · RECORD ${TOP[0].s.toLocaleString('fr-FR')}` : 'SCORE';
    $('bp-best').textContent = S.score.toLocaleString('fr-FR'); return;
  }
  if (adv) {
    $('bp-score').textContent = S.moves;
    $('bp-best').textContent = S.goal.type === 'gems' ? `💎 ${S.got}/${S.goal.gems}` : `▤ ${Math.min(S.lines, S.goal.target)}/${S.goal.target}`;
  } else $('bp-best').textContent = S.best.toLocaleString('fr-FR');
}

// ---------- layout ----------
function resize() {
  const r = canvas.getBoundingClientRect();
  if (!r.width) return;
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = r.width; H = r.height;
  canvas.width = W * DPR; canvas.height = H * DPR;
  const size = Math.min(W * 0.94, H * 0.66, 520);
  L.cs = size / N; L.bs = size;
  L.bx = (W - size) / 2; L.by = Math.max(8, (H - size - size * 0.36) / 2 - 10);
  L.trayY = L.by + size + L.cs * 0.6;
  L.trayH = H - L.trayY;
  L.slotW = size / 3;
  L.mini = Math.min(L.cs * 0.55, (L.trayH - 10) / 5.2);
}

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
function cell(x, y, s, color, alpha = 1, c2 = ctx) {
  color = tc(color);
  const style = curTheme().style, p = s * 0.06, r = s * 0.18;
  const X = c2 === ctx ? ctx : c2;
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

// une fenêtre ouverte (carte, thèmes, profil, confirmation…) met le Chrono en pause
const overlayOpen = () => !!document.querySelector('#tab-blocks .overlay:not(.hidden), #pt-profile:not(.hidden), #pt-modal:not(.hidden)');
function draw(dt) {
  if (S.mode === 'chrono' && !S.over && !overlayOpen()) {
    S.clock -= dt; S.chronoT += dt;
    if (Math.ceil(S.clock) !== S.lastSec) { S.lastSec = Math.ceil(S.clock); updateHUD(); if (S.clock < 10 && S.clock > 0) beep(900, 0.04, 'square', 0.02); }
    if (S.clock <= 0) chronoEnd();
  }
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, W, H);
  S.shown += (S.score - S.shown) * Math.min(1, dt * 10);
  if (Math.abs(S.score - S.shown) < 0.5) S.shown = S.score;
  if (S.mode !== 'adv' && S.mode !== 'chrono') $('bp-score').textContent = Math.round(S.shown).toLocaleString('fr-FR');
  if (S.mode !== 'chrono') $('bp-score').classList.remove('urgent');

  let sx = 0, sy = 0;
  if (S.shake > 0) { sx = (Math.random() - 0.5) * S.shake; sy = (Math.random() - 0.5) * S.shake; S.shake = Math.max(0, S.shake - dt * 40); }
  ctx.save(); ctx.translate(sx, sy);

  // plateau
  ctx.fillStyle = 'rgba(8,6,28,.55)'; rr(L.bx - 8, L.by - 8, L.bs + 16, L.bs + 16, 16); ctx.fill();
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    ctx.fillStyle = (x + y) % 2 ? 'rgba(255,255,255,.045)' : 'rgba(255,255,255,.07)';
    rr(L.bx + x * L.cs + 2, L.by + y * L.cs + 2, L.cs - 4, L.cs - 4, L.cs * 0.15); ctx.fill();
  }

  // prévisualisation + lignes qui vont sauter
  const g = ghostTarget();
  let hl = null;
  if (g) {
    const p = S.tray[S.drag.idx];
    const b = S.board.map(r => r.slice());
    for (const [x, y] of p.cells) b[g.gy + y][g.gx + x] = p.color;
    hl = linesToClear(b); hl.color = p.color;
    for (const [x, y] of p.cells) cell(L.bx + (g.gx + x) * L.cs, L.by + (g.gy + y) * L.cs, L.cs, p.color, 0.35);
  }

  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const c = S.board[y][x]; if (!c) continue;
    let s = L.cs, ox = 0;
    const pa = S.placedAnim.find(a => a.x === x && a.y === y);
    if (pa) { const k = Math.sin(Math.min(1, pa.t / 0.25) * Math.PI) * 0.12; s = L.cs * (1 + k); ox = (L.cs - s) / 2; }
    const lit = hl && (hl.rows.includes(y) || hl.cols.includes(x));
    cell(L.bx + x * L.cs + ox, L.by + y * L.cs + ox, s, lit ? hl.color : c);
    if (S.gems.has(y * N + x)) gem(L.bx + (x + 0.5) * L.cs, L.by + (y + 0.48) * L.cs, L.cs * 0.3);
    if (lit) { ctx.fillStyle = 'rgba(255,255,255,' + (0.18 + 0.12 * Math.sin(performance.now() / 90)) + ')'; rr(L.bx + x * L.cs + 3, L.by + y * L.cs + 3, L.cs - 6, L.cs - 6, L.cs * .15); ctx.fill(); }
  }
  S.placedAnim.forEach(a => a.t += dt); S.placedAnim = S.placedAnim.filter(a => a.t < 0.25);

  // cases qui s'effacent
  S.clearing.forEach(c => {
    c.t += dt; const k = Math.max(0, c.t - c.delay) / 0.3;
    if (k >= 1) return;
    const s = L.cs * (1 - k);
    ctx.save(); ctx.translate(L.bx + (c.x + .5) * L.cs, L.by + (c.y + .5) * L.cs); ctx.rotate(k * 1.5);
    cell(-s / 2, -s / 2, s, k < 0.15 ? '#ffffff' : c.color, 1 - k * 0.5);
    ctx.restore();
  });
  S.clearing = S.clearing.filter(c => c.t - c.delay < 0.3);

  ctx.restore();

  // zone visée par le marteau / la bombe
  if (tool && hover) {
    const gx = Math.floor((hover.x - L.bx) / L.cs), gy = Math.floor((hover.y - L.by) / L.cs), R = tool === 'bomb' ? 1 : 0;
    if (gx >= 0 && gy >= 0 && gx < N && gy < N) {
      ctx.fillStyle = 'rgba(255,93,143,.28)'; ctx.strokeStyle = '#ff5d8f'; ctx.lineWidth = 2;
      const x0 = Math.max(0, gx - R), y0 = Math.max(0, gy - R), x1 = Math.min(N - 1, gx + R), y1 = Math.min(N - 1, gy + R);
      rr(L.bx + x0 * L.cs, L.by + y0 * L.cs, (x1 - x0 + 1) * L.cs, (y1 - y0 + 1) * L.cs, L.cs * 0.2); ctx.fill(); ctx.stroke();
    }
  }

  // plateau de pièces
  for (let i = 0; i < 3; i++) {
    const p = S.tray[i]; if (!p || (S.drag && S.drag.idx === i) || (S.back && S.back.idx === i)) continue;
    const r = slotRect(i), s = L.mini;
    const ok = canPlaceAnywhere(p);
    const px = r.x + (r.w - p.w * s) / 2, py = r.y + (r.h - p.h * s) / 2;
    for (const [x, y] of p.cells) cell(px + x * s, py + y * s, s, ok ? p.color : '#555a72', ok ? 1 : 0.6);
  }

  // pièce qui revient à sa place (animation de 0,18 s, de la taille de la grille à celle du plateau)
  if (S.back) {
    const b = S.back, p = S.tray[b.idx]; b.t += dt;
    const k = Math.min(1, b.t / 0.18), e = 1 - (1 - k) * (1 - k);
    if (!p || k >= 1) S.back = null;
    else {
      const r = slotRect(b.idx), s2 = L.mini, sz = L.cs + (s2 - L.cs) * e;
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
    ctx.font = `${Math.round(L.cs * 0.9)}px system-ui`; ctx.textAlign = 'center'; ctx.fillText('👆', hx + L.cs * 0.3, hy + L.cs * 0.9);
    ctx.globalAlpha = 1;
    ctx.font = `800 ${Math.round(L.cs * 0.34)}px system-ui,sans-serif`; ctx.fillStyle = '#fff';
    ctx.fillText('Glisse une pièce sur la grille', L.bx + L.bs / 2, L.by - 14 + (L.by < 30 ? 30 : 0));
  }

  // pièce en main
  if (S.drag) {
    const p = S.tray[S.drag.idx];
    for (const [x, y] of p.cells) cell(S.drag.x - S.drag.ox + x * L.cs, S.drag.y - S.drag.oy + y * L.cs, L.cs, p.color, 0.95);
  }

  // particules
  S.fx.forEach(f => {
    f.vy += 0.35; f.x += f.vx; f.y += f.vy; f.life -= dt * 1.4; f.rot += 0.2;
    ctx.save(); ctx.globalAlpha = Math.max(0, f.life); ctx.translate(f.x, f.y); ctx.rotate(f.rot);
    ctx.fillStyle = f.color; ctx.fillRect(-f.s / 2, -f.s / 2, f.s, f.s); ctx.restore();
  });
  S.fx = S.fx.filter(f => f.life > 0);

  // messages
  S.pops.forEach(p => {
    p.t += dt; const k = p.t / 1.2;
    const a = k < 0.15 ? k / 0.15 : Math.max(0, 1 - (k - 0.6) / 0.4);
    const sc = 1 + Math.max(0, 0.3 - k) * 2;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, L.by + L.bs * 0.42 - k * 40); ctx.scale(sc, sc);
    ctx.textAlign = 'center'; ctx.font = `900 ${Math.round(L.cs * 0.62)}px system-ui,sans-serif`;
    const mw = L.bs * 0.96 / sc;   // jamais plus large que la grille (textes longs, petits écrans)
    ctx.lineWidth = 6; ctx.strokeStyle = '#2a1257'; ctx.strokeText(p.text, 0, 0, mw);
    const gr = ctx.createLinearGradient(0, -30, 0, 10); gr.addColorStop(0, '#fff6a8'); gr.addColorStop(1, '#ff9d2e');
    ctx.fillStyle = gr; ctx.fillText(p.text, 0, 0, mw);
    ctx.font = `800 ${Math.round(L.cs * 0.4)}px system-ui,sans-serif`; ctx.fillStyle = '#fff';
    ctx.strokeText(p.sub, 0, L.cs * 0.55, mw); ctx.fillText(p.sub, 0, L.cs * 0.55, mw);
    ctx.restore();
  });
  S.pops = S.pops.filter(p => p.t < 1.2);
}

// ---------- input ----------
function pos(e) { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
canvas.addEventListener('pointerdown', e => {
  if (S.over) return;
  const { x, y } = pos(e);
  if (tool) {
    const gx = Math.floor((x - L.bx) / L.cs), gy = Math.floor((y - L.by) / L.cs);
    if (gx >= 0 && gy >= 0 && gx < N && gy < N) { useTool(tool, gx, gy); return; }
  }
  for (let i = 0; i < 3; i++) {
    const r = slotRect(i), p = S.tray[i];
    if (!p || x < r.x || x > r.x + r.w || y < r.y - 10 || y > r.y + r.h + 10) continue;
    // Au doigt, la pièce flotte au-dessus pour rester visible ; à la souris, elle est centrée.
    const oy = e.pointerType === 'touch' ? p.h * L.cs + L.cs * 1.2 : p.h * L.cs / 2;
    S.drag = { idx: i, x, y, ox: p.w * L.cs / 2, oy };
    canvas.setPointerCapture(e.pointerId);
    beep(440, 0.04, 'sine', 0.03);
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
  beep(180, 0.08, 'triangle', 0.03);
}
canvas.addEventListener('pointerup', drop);
canvas.addEventListener('pointercancel', () => S.drag = null);

$('bp-restart').onclick = () => {
  if (S.mode === 'adv') { if (S.moves === S.goal.moves) startLevel(S.lvl); else ptConfirm(`Recommencer le niveau ${S.lvl} ?`, 'Recommencer').then(ok => ok && startLevel(S.lvl)); return; }
  if (S.mode === 'chrono') { if (!S.score || S.over) startChrono(); else ptConfirm('Relancer le Chrono ? Le score en cours sera perdu.', 'Relancer').then(ok => ok && startChrono()); return; }
  if (S.score === 0) newGame(); else window.ptConfirm('Recommencer une nouvelle partie ? Le score en cours sera perdu.', 'Recommencer').then(ok => ok && newGame());
};
$('bp-again').onclick = () => S.mode === 'daily' ? startDaily() : S.mode === 'chrono' ? startChrono() : newGame();
$('bp-chrono').onclick = startChrono;
$('bp-mapbtn').onclick = openMap;
$('bp-themebtn').onclick = openThemes;
$('bp-themeclose').onclick = () => $('bp-themes').classList.add('hidden');
applyTheme();
// reprendre une grille bloquée : on ferme l'écran de fin et on arme le marteau
const resume = id => { $(id).classList.add('hidden'); S.over = false; tool = 'hammer'; paintBoost(); S.pops.push({ text: 'Choisis une case', sub: 'à casser', t: 0 }); };
$('bp-cont').onclick = () => resume('bp-over');
$('bp-rescont').onclick = () => resume('bp-res');
const MORE_COST = 25;
$('bp-resmore').onclick = () => {
  if (COINS < MORE_COST || S.moreBought) return;
  COINS -= MORE_COST; saveCoins(); S.moreBought = true; S.moves += 3; S.over = false;
  $('bp-res').classList.add('hidden'); S.pops.push({ text: '+3 coups', sub: 'dernière chance !', t: 0 }); updateHUD();
};
$('bp-overmap').onclick = () => { $('bp-over').classList.add('hidden'); openMap(); };
document.querySelectorAll('#bp-boost button').forEach(b => b.onclick = () => {
  const t = b.dataset.tool;
  if (S.over || COINS < TOOLS[t]) { beep(180, 0.1, 'square', 0.03); return; }
  if (t === 'shuffle') { useTool('shuffle'); return; }
  tool = tool === t ? null : t; paintBoost();
});
paintBoost();
$('bp-mapclose').onclick = () => { $('bp-map').classList.add('hidden'); if (S.over && S.mode !== 'adv') $('bp-over').classList.remove('hidden'); };   // fermer la carte après une fin de partie ramène à l'écran de fin
$('bp-daily').onclick = startDaily;
$('bp-classic').onclick = () => { $('bp-map').classList.add('hidden'); if (S.mode === 'classic' && S.over) { newGame(); return; } if (S.mode !== 'classic') { S.mode = 'classic'; rnd = Math.random; S.gems.clear(); if (!load() || !S.tray.some(t => t && canPlaceAnywhere(t))) newGame(); S.over = false; updateHUD(); } };
$('bp-resnext').onclick = () => startLevel(Math.min(LEVELS, S.lvl + 1));
$('bp-resretry').onclick = () => startLevel(S.lvl);
$('bp-resmap').onclick = () => { $('bp-res').classList.add('hidden'); openMap(); };
window.addEventListener('resize', () => running && resize());

let inited = false;
window.GAMES.blocks = {
  reward() { COINS += 30; saveCoins(); },   // objectif du jour
  show() {
    if (!inited) { inited = true; if (!load()) newGame(); else if (!S.tray.some(t => t && canPlaceAnywhere(t))) newGame(); updateHUD(); }
    running = true; requestAnimationFrame(() => { resize(); last = performance.now(); requestAnimationFrame(frame); });
  },
  hide() { running = false; S.drag = null; },
};
// Accès de test (tools/smoke.mjs, console).
window.__bp = { S, place, fits, startLevel, startDaily, startChrono, linesToClear, canPlaceAnywhere, N, gameOver };
