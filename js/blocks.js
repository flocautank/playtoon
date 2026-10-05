// BLOCK QUARRY (ex-Bloc Party) — puzzle casual façon "Block Blast" : pose les pièces, complète lignes et colonnes.
import { t, num, date, applyI18n } from './i18n.js';
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
];
let THEME = { owned: ['quarry', 'classic'], cur: 'quarry' };
try { THEME = Object.assign(THEME, JSON.parse(localStorage.getItem('blocparty.themes') || '{}')); } catch (e) {}
// joueurs d'avant 1.4.0 : la Carrière leur est offerte, et remplace l'ancien thème par défaut s'ils ne l'avaient pas changé
if (!THEME.owned.includes('quarry')) { THEME.owned.unshift('quarry'); if (THEME.cur === 'classic') THEME.cur = 'quarry'; }
const saveTheme = () => { try { localStorage.setItem('blocparty.themes', JSON.stringify(THEME)); } catch (e) {} };
const curTheme = () => THEMES.find(t => t.id === THEME.cur) || THEMES[0];
const tc = c => { const i = COLORS.indexOf(c); return i >= 0 ? curTheme().pal[i] : c; };
const LEVELS = 40;
// Générateur déterministe : un niveau d'aventure a toujours la même grille et les mêmes pièces.
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
let rnd = Math.random;
// Monétisation : fournie par l'application Android (apps/block-quarry) ; sur le web, rien (pas de pub).
const MON = {
  canReward: () => !!(window.PT_MON && window.PT_MON.canReward()),
  reward: kind => window.PT_MON ? window.PT_MON.reward(kind) : Promise.resolve(false),
  pause: () => window.PT_MON ? window.PT_MON.pause() : Promise.resolve(),   // pause publicitaire éventuelle (plafonnée) entre deux parties
};
let TUTO = false;
try { TUTO = !localStorage.getItem('blocparty.tuto'); } catch (e) {}
let TIPS = {};
try { TIPS = JSON.parse(localStorage.getItem('blocparty.tips') || '{}'); } catch (e) {}
const saveTips = () => { try { localStorage.setItem('blocparty.tips', JSON.stringify(TIPS)); } catch (e) {} };
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
  miss: 0, beams: [], rings: [], flyers: [], flash: 0, glow: 0, hit: 0, endAnim: null, bestStart: 0,
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
  pick() { tone(520, 700, 0.05, 'sine', 0.025); },
  snap() { tone(1500, 1500, 0.018, 'sine', 0.01); },
  thock() { tone(190, 70, 0.11, 'sine', 0.09); noise(0.05, 1100, 1.2, 0.05); },   // pierre posée sur l'ardoise
  back() { tone(300, 180, 0.08, 'triangle', 0.025); },
  // éboulement + accord qui monte d'un degré par combo
  clear(n, combo) {
    noise(0.22 + 0.06 * n, 500 + 120 * n, 0.7, 0.05 + 0.015 * n, 'lowpass'); noise(0.12, 2600, 2, 0.02, 'bandpass', 0.03);
    const b = Math.min(PENTA.length - 5, Math.max(0, combo - 1));
    [0, 2, 4].slice(0, Math.min(3, n + 1)).forEach((k, i) => tone(PENTA[b + k], PENTA[b + k], 0.32, 'triangle', 0.045, i * 0.045));
    if (n >= 3) tone(PENTA[b + 5] || 1318, PENTA[b + 5] || 1318, 0.5, 'sine', 0.03, 0.14);
  },
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
  const mercy = S.mode !== 'classic' || (S.placed || 0) < 150;   // classique : la bienveillance s'estompe après 150 pièces
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
function freshRun() { S.miss = 0; S.lines = 0; S.maxCombo = 0; S.pieces = 0; S.endAnim = null; S.beams = []; S.rings = []; S.flyers = []; S.flash = 0; S.glow = 0; S.hit = 0; }
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

function genLevel(n) {
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
  const type = n % 4 === 0 ? 'lines' : 'gems';
  const gemsN = Math.min(2 + Math.floor(n / 3), 10, cells.length);
  const gems = new Set();
  while (gems.size < gemsN) { const [x, y] = cells[(r() * cells.length) | 0]; gems.add(y * N + x); }
  const target = 3 + Math.floor(n / 5);
  // au-delà du niveau 16, les coups se resserrent (−1,2 % par niveau, jusqu'à −28 %)
  const tight = 1 - Math.min(0.28, Math.max(0, n - 16) * 0.012);
  // niveaux « lignes » resserrés en seconde moitié (ils étaient triviaux), niveaux 9–11 un peu plus larges (présentation)
  const moves = Math.round((type === 'gems' ? 6 + Math.round(gemsN * 1.5) + bands * 2 + hard * 0.6 + (n >= 9 && n <= 11 ? 4 : 0) : (6 + target * 3) * (n >= 16 ? 0.8 : 1)) * tight);
  return { board, gems: type === 'gems' ? gems : new Set(), goal: { type, gems: type === 'gems' ? gemsN : 0, target, moves } };
}
function startLevel(n) {
  clearTimeout(overTimer); clearTimeout(resTimer); S.contN = 0; S.vidCont = false;
  const L0 = genLevel(n);
  S.mode = 'adv'; S.lvl = n; S.goal = L0.goal; S.moves = L0.goal.moves; S.gems = L0.gems; S.got = 0; S.lines = 0; S.rescue = n >= 9 ? 2 : 1; S.moreBought = false; S.toolsUsed = 0; S.gain = 0;
  S.used = 0; S.board = L0.board; S.score = 0; S.shown = 0; S.combo = 0; S.over = false; S.fx = []; S.pops = []; S.clearing = []; freshRun();
  rnd = mulberry32(n * 104729 + 7);
  fillTray();
  ['bp-over', 'bp-map', 'bp-res'].forEach(id => $(id).classList.add('hidden'));
  S.pops.push({ text: t('bp.level', { n }), sub: S.goal.type === 'gems' ? t('bp.getGems', { n: S.goal.gems }) : t('bp.clearLines', { n: S.goal.target }), t: 0 });
  if (n === 9 || (n > 9 && !ADV.stars[9])) S.pops.push({ text: t('bp.hardTitle'), sub: t('bp.hardSub'), t: -1.3 });   // présentation des pierres dures
  updateHUD();
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
  }
  clearTimeout(resTimer); resTimer = setTimeout(() => {
    const close = S.goal.type === 'gems' ? S.got >= S.goal.gems - 1 : S.lines >= S.goal.target - 1;
    $('bp-restitle').textContent = win ? t('bp.levelWon', { n: S.lvl }) : close ? t('bp.failClose') : t('bp.fail');
    $('bp-resstars').innerHTML = [1, 2, 3].map(k => k <= stars ? '★' : '<i>★</i>').join('');
    $('bp-restext').textContent = win ? t('bp.resWin', { used: S.used, total: S.goal.moves, coins: COINS }) + (S.gain ? `  ·  +${S.gain} 🪙` : '') : (S.moves <= 0 ? t('bp.noMoves') : t('bp.noRoom'));
    $('bp-resnext').classList.toggle('hidden', !win || S.lvl >= LEVELS);
    $('bp-rescont').classList.toggle('hidden', win || S.moves <= 0 || COINS < contCost());
    $('bp-rescont').textContent = t('bp.cont', { n: contCost() });
    $('bp-resmore').classList.toggle('hidden', win || S.moves > 0 || S.moreBought || COINS < MORE_COST);   // seconde chance, une fois par tentative
    $('bp-resvid').classList.toggle('hidden', win || (S.moves <= 0 ? S.moreBought : S.vidCont) || !MON.canReward());
    $('bp-resvid').textContent = t(S.moves <= 0 ? 'app.watchMoves' : 'app.watchCont');   // …ou contre une vidéo (application)
    $('bp-res').classList.remove('hidden');
    if (win) SFX.best(); else SFX.fail();
  }, 700);
}
// ---------- défi du jour : même grille et mêmes pièces pour tout le monde, graine = date locale
const dayKey = (d = new Date()) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
const todayLabel = () => date(new Date(), { day: 'numeric', month: 'long' });
let DAILY = { day: 0, best: 0, streak: 0, last: 0 };
try { DAILY = Object.assign(DAILY, JSON.parse(localStorage.getItem('blocparty.daily') || '{}')); } catch (e) {}
if (!DAILY.last && DAILY.day && DAILY.streak) DAILY.last = DAILY.day;   // avant 1.4.0, la série comptait les jours ouverts
// premier coup du jour dans le défi : c'est lui qui fait avancer la série
function dailyPlayed() {
  const today = dayKey(); if (DAILY.last === today) return;
  const y = new Date(); y.setDate(y.getDate() - 1);
  DAILY.streak = DAILY.last === dayKey(y) ? DAILY.streak + 1 : 1; DAILY.last = today; saveDaily();
}
const saveDaily = () => { try { localStorage.setItem('blocparty.daily', JSON.stringify(DAILY)); } catch (e) {} };
function startDaily() {
  clearTimeout(overTimer); clearTimeout(resTimer); S.contN = 0;
  const today = dayKey();
  if (DAILY.day !== today) { DAILY.day = today; DAILY.best = 0; saveDaily(); }
  const r = mulberry32(today);
  const board = Array.from({ length: N }, () => Array(N).fill(null));
  for (let k = 0; k < 7; k++) { const x = (r() * N) | 0, y = (r() * N) | 0; board[y][x] = STONE; }
  S.mode = 'daily'; S.vidCont = false; S.gems = new Set(); S.board = board; S.score = 0; S.shown = 0; S.combo = 0; S.over = false; S.fx = []; S.pops = []; S.clearing = []; freshRun(); tool = null; paintBoost();
  rnd = mulberry32(today * 31 + 7);
  fillTray();
  ['bp-over', 'bp-map', 'bp-res'].forEach(id => $(id).classList.add('hidden'));
  S.pops.push({ text: t('bp.daily'), sub: t('bp.dailySub', { date: todayLabel(), n: DAILY.last === today || DAILY.last === dayKey(new Date(Date.now() - 864e5)) ? DAILY.streak + (DAILY.last === today ? 0 : 1) : 1 }), t: 0 });
  updateHUD();
}

function applyTheme() { $('tab-blocks').style.background = curTheme().bg; $('tab-blocks').dataset.style = curTheme().style; boardSpr = null; }
function openThemes() {
  const box = $('bp-thgrid'); box.innerHTML = '';
  const tr = t;
  for (const th of THEMES) {
    const owned = THEME.owned.includes(th.id), cur = THEME.cur === th.id;
    const d = document.createElement('button'); d.className = 'bp-th' + (cur ? ' cur' : '') + (!owned && COINS < th.cost ? ' no' : '');
    d.innerHTML = `<canvas width="200" height="100"></canvas><b>${tr('bp.th.' + th.id)}</b><small>${cur ? tr('bp.equipped') : owned ? tr('bp.equip') : '🪙 ' + th.cost}</small>`;
    // aperçu : 4 cases dans le style du thème, sur son fond
    const cv = d.querySelector('canvas'), g = cv.getContext('2d'), prev = THEME.cur;
    THEME.cur = th.id; g.fillStyle = '#15122e'; g.fillRect(0, 0, 200, 100);
    [0, 1, 2, 3].forEach(i => cell(18 + i * 42, 30, 40, COLORS[i], 1, g)); THEME.cur = prev;
    d.onclick = () => {
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
  S.myRank = TOP.indexOf(entry);
  try { localStorage.setItem('blocparty.chrono', JSON.stringify(TOP)); } catch (e) {}
  updateHUD();
  armOver(400);
}

function openMap() {
  tool = null; paintBoost();
  $('bp-daily').innerHTML = `${t('bp.dailyBtn')}<small>${todayLabel()}${DAILY.day === dayKey() && DAILY.best ? t('bp.dailyBest', { n: num(DAILY.best) }) : ''}${DAILY.streak > 1 && DAILY.day === dayKey() ? t('bp.dailyStreak', { n: DAILY.streak }) : ''}</small>`;
  const box = $('bp-levels'); box.innerHTML = '';
  const open = unlockedLvl();
  for (let n = 1; n <= LEVELS; n++) {
    const st = ADV.stars[n] || 0, lock = n > open;
    const b = document.createElement('button');
    b.className = 'bp-lv' + (lock ? ' lock' : '') + (n === open && !st ? ' cur' : '');
    b.innerHTML = `${lock ? '🔒' : n}<small>${st ? '★'.repeat(st) : n % 4 === 0 ? t('bp.mapLines') : '💎'}</small>`;
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
    if (color === STONE2) { S.board[y][x] = STONEC; for (let k = 0; k < 3; k++) burst(x, y, STONE); continue; }   // les boosters fissurent aussi, sans briser
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
  const cost = S.freeTool && name === 'hammer' ? 0 : TOOLS[name];
  if (COINS < cost || S.mode === 'daily') return false;
  if (S.mode === 'adv' && (S.toolsUsed || 0) >= ADV_TOOLS) { S.pops.length = 0; S.pops.push({ text: t('bp.toolLimit', { n: ADV_TOOLS }), sub: '', t: 0 }); tool = null; paintBoost(); return false; }
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
  tutoDone(); S.placed = (S.placed || 0) + 1; S.pieces = (S.pieces || 0) + 1;
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
    if (S.combo === 1 && !TIPS.combo) { TIPS.combo = 1; saveTips(); S.pops.push({ text: t('bp.tipCombo'), sub: t('bp.tipComboSub'), t: -1.2 }); } S.maxCombo = Math.max(S.maxCombo || 0, S.combo); S.lines = (S.lines || 0) + n; window.ptEvent && window.ptEvent('bp_lines', n);
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
      S.board[y][x] = null;
      for (let k = 0; k < 4 + Math.min(6, S.combo); k++) burst(x, y, color);
      if (S.gems.delete(y * N + x)) { S.got++; for (let k = 0; k < 10; k++) burst(x, y, '#7ff6ff'); setTimeout(() => SFX.gem(S.got), 80); }
    }
    const allClear = S.board.every(r => r.every(c => !c));
    if (allClear) gained += 300;
    const label = allClear ? t('bp.allClear') + (S.combo > 1 ? '  ' + t('bp.combo', { n: S.combo }) : '') : (t('bp.praise')[Math.min(n, 5)] || '') + (S.combo > 1 ? '  ' + t('bp.combo', { n: S.combo }) : '');
    S.pops.length = 0;   // un seul message à la fois : les éloges successifs ne se superposent plus
    S.pops.push({ text: label, sub: '+' + (gained), t: 0, big: n >= 3 || allClear || S.combo >= 5 });
    // le moment fort : faisceau sur chaque ligne, arrêt sur image, puis paliers (cadre, onde, éclair)
    rows.forEach(y => S.beams.push({ row: y, t: 0, color: tc(p.color) })); cols.forEach(x => S.beams.push({ col: x, t: 0, color: tc(p.color) }));
    if (n >= 2) { S.hit = Math.min(0.12, 0.05 + 0.025 * (n - 2)); S.glow = 1; S.glowColor = tc(p.color); }
    if (n >= 3 || allClear) S.rings.push({ x: L.bx + (gx + p.w / 2) * L.cs, y: L.by + (gy + p.h / 2) * L.cs, t: 0 });
    if (n >= 4 || allClear || S.combo >= 5) S.flash = 1;
    let fx = 0, fy = 0; for (const [x, y] of cells.values()) { fx += x; fy += y; } fx /= cells.size; fy /= cells.size;
    S.flyers.push({ x: L.bx + (fx + 0.5) * L.cs, y: L.by + (fy + 0.5) * L.cs, v: gained, t: 0 });
    S.shake = Math.min(14, 3 + n * 3);
    SFX.clear(n, S.combo);
    if (navigator.vibrate) navigator.vibrate(n >= 3 ? [30, 40, 60] : 20 * n);
  } else {
    // le combo survit à deux poses sans ligne : il tombe à la troisième (règle du genre, Block Blast compris)
    if (S.combo > 0 && ++S.miss >= 3) { S.combo = 0; S.miss = 0; SFX.lost(); }
    SFX.thock();
  }
  S.score += gained;
  if (S.tray.every(t => !t)) fillTray();
  if (S.mode === 'adv') {
    S.moves--; S.used = (S.used || 0) + 1;
    const win = S.goal.type === 'gems' ? S.gems.size === 0 : S.lines >= S.goal.target;
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
  if (S.mode === 'daily') { if (S.score > DAILY.best) { DAILY.best = S.score; saveDaily(); } }
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

const armOver = ms => { clearTimeout(overTimer); S.endAnim = { t: 0 }; setTimeout(() => { if (S.endAnim) { SFX.fail(); S.shake = 6; } }, 450); overTimer = setTimeout(gameOver, Math.max(ms, 1300)); };
function gameOver() {
  S.over = true;
  countUp($('bp-final'), S.score);
  $('bp-stats').textContent = t('bp.stats', { lines: num(S.lines || 0), combo: S.maxCombo || 0, pieces: num(S.pieces || 0) });
  $('bp-overtitle').textContent = S.mode === 'chrono' && S.endWhy === 'time' ? t('bp.timeUp') : t('bp.overTitle');
  const top = $('bp-top10'); top.classList.toggle('hidden', S.mode !== 'chrono');
  if (S.mode === 'chrono') {
    $('bp-newbest').textContent = S.myRank === 0 ? t('bp.bestChrono') : S.myRank > 0 ? t('bp.rank', { n: S.myRank + 1 }) : S.score ? t('bp.outTop') : t('bp.noPoints');
    top.innerHTML = TOP.map((e, i) => `<li class="${i === S.myRank ? 'me' : ''}">${num(e.s)} <span class="muted">· ${e.d}</span></li>`).join('');
  } else if (S.mode === 'daily') $('bp-newbest').textContent = t('bp.dailyEnd', { date: todayLabel(), best: num(DAILY.best), n: DAILY.streak });
  else $('bp-newbest').textContent = S.score >= S.best && S.score > 0 ? t('bp.newRecord') : S.best - S.score <= S.best * 0.15 ? t('bp.nearBest', { n: num(S.best - S.score) }) : t('bp.record', { n: num(S.best) });
  $('bp-cont').classList.toggle('hidden', COINS < contCost() || S.mode === 'chrono' || (S.mode === 'daily' && dailyContUsed()));
  $('bp-cont').textContent = t('bp.contBooster', { n: contCost() });
  $('bp-vidcont').classList.toggle('hidden', S.mode === 'chrono' || S.vidCont || !MON.canReward());
  $('bp-over').classList.remove('hidden');
}
function countUp(el, v) {
  const t0 = performance.now(), D = 800;
  const step = () => { const k = Math.min(1, (performance.now() - t0) / D), e = 1 - Math.pow(1 - k, 3); el.textContent = num(Math.round(v * e)); if (k < 1) requestAnimationFrame(step); };
  step();
}
function confetti() {
  for (let i = 0; i < 70; i++) S.fx.push({ x: W / 2 + (Math.random() - 0.5) * L.bs, y: L.by - 10, vx: (Math.random() - 0.5) * 7, vy: -Math.random() * 9 - 2, s: L.cs * (0.1 + Math.random() * 0.12), color: ['#ffd24d', '#ff5d8f', '#4dd4ff', '#7cff8a', '#fff'][i % 5], life: 1.6, rot: Math.random() * 6, conf: 1 });
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
    $('bp-best').textContent = S.goal.type === 'gems' ? `💎 ${S.got}/${S.goal.gems}` : `▤ ${Math.min(S.lines, S.goal.target)}/${S.goal.target}`;
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
    if (lit) { ctx.fillStyle = 'rgba(255,255,255,' + (0.18 + 0.12 * Math.sin(performance.now() / 90)) + ')'; rr(L.bx + x * L.cs + 3, L.by + y * L.cs + 3, L.cs - 6, L.cs - 6, L.cs * .15); ctx.fill(); }
  }
  drawBand();
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
      ctx.fillStyle = 'rgba(255,93,143,.28)'; ctx.strokeStyle = '#ff5d8f'; ctx.lineWidth = 2;
      const x0 = Math.max(0, gx - R), y0 = Math.max(0, gy - R), x1 = Math.min(N - 1, gx + R), y1 = Math.min(N - 1, gy + R);
      rr(L.bx + x0 * L.cs, L.by + y0 * L.cs, (x1 - x0 + 1) * L.cs, (y1 - y0 + 1) * L.cs, L.cs * 0.2); ctx.fill(); ctx.stroke();
    }
  }

  // plateau de pièces
  for (let i = 0; i < 3; i++) {
    const p = S.tray[i]; if (!p || (S.drag && S.drag.idx === i) || (S.back && S.back.idx === i)) continue;
    const r = slotRect(i), s = pieceScale(p, r);
    const ok = canPlaceAnywhere(p);
    const px = r.x + (r.w - p.w * s) / 2, py = r.y + (r.h - p.h * s) / 2;
    const jit = S.endAnim && S.endAnim.t < 0.6 ? Math.sin(S.endAnim.t * 70) * L.cs * 0.08 : 0;
    for (const [x, y] of p.cells) cell(px + x * s + jit, py + y * s, s, ok ? p.color : '#555a72', ok ? 1 : 0.6);
    if (S.endAnim) {   // rien ne rentre : une croix sur chaque pièce
      const cx = r.x + r.w / 2 + jit, cy = r.y + r.h / 2, z = Math.min(r.w, r.h) * 0.22;
      ctx.save(); ctx.strokeStyle = 'rgba(255,80,90,.9)'; ctx.lineWidth = Math.max(3, L.cs * 0.12); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx - z, cy - z); ctx.lineTo(cx + z, cy + z); ctx.moveTo(cx + z, cy - z); ctx.lineTo(cx - z, cy + z); ctx.stroke(); ctx.restore();
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
    ctx.font = `${Math.round(L.cs * 0.9)}px system-ui`; ctx.textAlign = 'center'; ctx.fillText('👆', hx + L.cs * 0.3, hy + L.cs * 0.9);
    ctx.globalAlpha = 1;
    ctx.font = `800 ${Math.round(L.cs * 0.4)}px 'BQ Label',system-ui,sans-serif`; ctx.fillStyle = '#fff';
    ctx.fillText(t('bp.tuto'), L.bx + L.bs / 2, L.by - 14 + (L.by < 30 ? 30 : 0));
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
    const sc = 1 + Math.max(0, 0.3 - k) * 2;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, L.by + L.bs * 0.42 - k * 40); ctx.scale(sc, sc);
    ctx.textAlign = 'center'; ctx.font = `${Math.round(L.cs * (p.big ? 0.78 : 0.62))}px 'BQ Display',system-ui,sans-serif`;
    const mw = L.bs * 0.96 / sc;   // jamais plus large que la grille (textes longs, petits écrans)
    ctx.lineJoin = 'round'; ctx.lineWidth = L.cs * 0.2; ctx.strokeStyle = '#26140c'; ctx.strokeText(p.text, 0, 0, mw);
    const gr = ctx.createLinearGradient(0, -30, 0, 10); gr.addColorStop(0, '#fff6a8'); gr.addColorStop(1, '#ff9d2e');
    ctx.fillStyle = gr; ctx.fillText(p.text, 0, 0, mw);
    ctx.font = `800 ${Math.round(L.cs * 0.44)}px 'BQ Label',system-ui,sans-serif`; ctx.fillStyle = '#fff'; ctx.lineWidth = L.cs * 0.13;
    ctx.strokeText(p.sub, 0, L.cs * 0.6, mw); ctx.fillText(p.sub, 0, L.cs * 0.6, mw);
    ctx.restore();
  });
  S.pops = S.pops.filter(p => p.t < 1.2);
  drawFlyers(dt);
  if (S.flash > 0) { ctx.fillStyle = `rgba(255,246,220,${S.flash * 0.38})`; ctx.fillRect(0, 0, W, H); S.flash = Math.max(0, S.flash - dt * 3); }
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
      if (e.pointerType === 'touch' && !(S.aim && S.aim[0] === gx && S.aim[1] === gy)) { S.aim = [gx, gy]; hover = { x, y }; SFX.snap(); S.pops.length = 0; S.pops.push({ text: t('bp.tapConfirm'), sub: '', t: 0.3 }); return; }
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
$('bp-overmap').onclick = () => { $('bp-over').classList.add('hidden'); openMap(); };
document.querySelectorAll('#bp-boost button').forEach(b => b.onclick = () => {
  const t = b.dataset.tool;
  if (S.mode === 'daily') { S.pops.length = 0; S.pops.push({ text: t('bp.noBoostDaily'), sub: '', t: 0 }); beep(180, 0.1, 'square', 0.03); return; }
  if (S.over || (COINS < TOOLS[t] && !(S.freeTool && t === 'hammer'))) { beep(180, 0.1, 'square', 0.03); return; }
  if (t === 'shuffle') { useTool('shuffle'); return; }
  tool = tool === t ? null : t; S.aim = null; paintBoost();
});
paintBoost();
// langue : le HTML se traduit tout seul, le reste se redessine
applyI18n();
const sel = document.getElementById('pt-langsel'); if (sel) import('./i18n.js').then(m => m.langSelect(sel));
window.addEventListener('pt-lang', () => { updateHUD(); if (!$('bp-themes').classList.contains('hidden')) openThemes(); if (!$('bp-map').classList.contains('hidden')) openMap(); });
$('bp-mapclose').onclick = () => { $('bp-map').classList.add('hidden'); if (S.over && S.mode !== 'adv') $('bp-over').classList.remove('hidden'); };   // fermer la carte après une fin de partie ramène à l'écran de fin
$('bp-daily').onclick = startDaily;
$('bp-classic').onclick = () => { $('bp-map').classList.add('hidden'); if (S.mode === 'classic' && S.over) { newGame(); return; } if (S.mode !== 'classic') { S.mode = 'classic'; rnd = Math.random; S.gems.clear(); freshRun(); if (!load() || !S.tray.some(t => t && canPlaceAnywhere(t))) newGame(); S.over = false; updateHUD(); } };
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
    loadFonts();
    if (!inited) { inited = true; if (!load()) newGame(); else if (!S.tray.some(t => t && canPlaceAnywhere(t))) newGame(); updateHUD(); }
    loginBonus();
    running = true; requestAnimationFrame(() => { resize(); last = performance.now(); requestAnimationFrame(frame); });
  },
  hide() { running = false; S.drag = null; },
};
// Accès de test (tools/smoke.mjs, console).
window.__bp = { S, L, place, fits, startLevel, startDaily, startChrono, linesToClear, canPlaceAnywhere, N, gameOver, endNow: () => { S.over = true; armOver(600); } };
