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

const $ = id => document.getElementById(id);
const canvas = $('bp-canvas');
const ctx = canvas.getContext('2d');
let W = 0, H = 0, DPR = 1;
let L = {}; // layout

const S = {
  board: [], tray: [], score: 0, shown: 0, best: 0, combo: 0, over: false,
  drag: null, fx: [], pops: [], clearing: [], shake: 0, placedAnim: [],
};

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
  try {
    localStorage.setItem('blocparty.best', S.best);
    if (S.over) localStorage.removeItem('blocparty.save');
    else localStorage.setItem('blocparty.save', JSON.stringify({ board: S.board, tray: S.tray, score: S.score, combo: S.combo }));
  } catch (e) {}
}

function pickShape() {
  const total = SHAPES.reduce((a, s) => a + s[1], 0);
  let r = Math.random() * total;
  for (const s of SHAPES) { r -= s[1]; if (r <= 0) return s[0]; }
  return SHAPES[0][0];
}
function makePiece() {
  const cells = pickShape();
  return { cells, w: Math.max(...cells.map(c => c[0])) + 1, h: Math.max(...cells.map(c => c[1])) + 1, color: COLORS[(Math.random() * COLORS.length) | 0] };
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
  let best = null;
  for (let tries = 0; tries < 12; tries++) {
    const t = [makePiece(), makePiece(), makePiece()];
    if (t.some(p => canPlaceAnywhere(p))) { best = t; break; }
    best = t;
  }
  S.tray = best;
}

function newGame() {
  S.board = Array.from({ length: N }, () => Array(N).fill(null));
  S.score = 0; S.shown = 0; S.combo = 0; S.over = false; S.fx = []; S.pops = []; S.clearing = [];
  fillTray();
  $('bp-over').classList.add('hidden');
  save(); updateHUD();
}

function linesToClear(board) {
  const rows = [], cols = [];
  for (let y = 0; y < N; y++) if (board[y].every(c => c)) rows.push(y);
  for (let x = 0; x < N; x++) { let full = true; for (let y = 0; y < N; y++) if (!board[y][x]) { full = false; break; } if (full) cols.push(x); }
  return { rows, cols };
}

function place(idx, gx, gy) {
  const p = S.tray[idx];
  for (const [x, y] of p.cells) { S.board[gy + y][gx + x] = p.color; S.placedAnim.push({ x: gx + x, y: gy + y, t: 0 }); }
  S.tray[idx] = null;
  let gained = p.cells.length;
  const { rows, cols } = linesToClear(S.board);
  const n = rows.length + cols.length;
  if (n > 0) {
    S.combo++;
    const cells = new Map();
    rows.forEach(y => { for (let x = 0; x < N; x++) cells.set(y * N + x, [x, y]); });
    cols.forEach(x => { for (let y = 0; y < N; y++) cells.set(y * N + x, [x, y]); });
    const lineScore = 10 * n * (n + 1) / 2 * N / 8;
    const bonus = Math.round(lineScore * (1 + (S.combo - 1) * 0.5));
    gained += bonus;
    for (const [x, y] of cells.values()) {
      const color = S.board[y][x];
      S.clearing.push({ x, y, color, t: 0, delay: (Math.abs(x - gx) + Math.abs(y - gy)) * 0.025 });
      S.board[y][x] = null;
      for (let k = 0; k < 4; k++) burst(x, y, color);
    }
    const allClear = S.board.every(r => r.every(c => !c));
    if (allClear) gained += 300;
    const label = allClear ? 'TABLE RASE ! +300' : (PRAISE[Math.min(n, 5)] || '') + (S.combo > 1 ? `  Combo ×${S.combo}` : '');
    S.pops.push({ text: label, sub: '+' + (gained), t: 0 });
    S.shake = Math.min(14, 3 + n * 3);
    [523, 659, 784, 1046, 1318].slice(0, Math.min(5, n + 1)).forEach((f, i) => setTimeout(() => beep(f, 0.12, 'triangle', 0.05), i * 60));
    if (navigator.vibrate) navigator.vibrate(20 * n);
  } else {
    S.combo = 0;
    beep(220 + Math.random() * 40, 0.06, 'square', 0.025);
  }
  S.score += gained;
  if (S.score > S.best) S.best = S.score;
  if (S.tray.every(t => !t)) fillTray();
  if (!S.tray.some(t => t && canPlaceAnywhere(t))) {
    S.over = true;
    setTimeout(gameOver, 600);
  }
  save(); updateHUD();
}

function gameOver() {
  $('bp-final').textContent = S.score.toLocaleString('fr-FR');
  $('bp-newbest').textContent = S.score >= S.best && S.score > 0 ? '🏆 Nouveau record !' : 'Record : ' + S.best.toLocaleString('fr-FR');
  $('bp-over').classList.remove('hidden');
  beep(300, 0.3, 'sawtooth', 0.04); setTimeout(() => beep(200, 0.4, 'sawtooth', 0.04), 200);
}

function burst(gx, gy, color) {
  const cx = L.bx + (gx + 0.5) * L.cs, cy = L.by + (gy + 0.5) * L.cs;
  S.fx.push({ x: cx, y: cy, vx: (Math.random() - 0.5) * 9, vy: (Math.random() - 0.9) * 9, s: L.cs * (0.15 + Math.random() * 0.2), color, life: 1, rot: Math.random() * 6 });
}

function updateHUD() { $('bp-best').textContent = S.best.toLocaleString('fr-FR'); }

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
function cell(x, y, s, color, alpha = 1) {
  const p = s * 0.06, r = s * 0.18;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = shade(color, -60); rr(x + p, y + p + s * 0.05, s - 2 * p, s - 2 * p, r); ctx.fill();
  ctx.fillStyle = color; rr(x + p, y + p, s - 2 * p, s - 2 * p - s * 0.05, r); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.35)'; rr(x + s * 0.2, y + s * 0.14, s * 0.6, s * 0.14, s * 0.07); ctx.fill();
  ctx.globalAlpha = 1;
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

function draw(dt) {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, W, H);
  S.shown += (S.score - S.shown) * Math.min(1, dt * 10);
  if (Math.abs(S.score - S.shown) < 0.5) S.shown = S.score;
  $('bp-score').textContent = Math.round(S.shown).toLocaleString('fr-FR');

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

  // plateau de pièces
  for (let i = 0; i < 3; i++) {
    const p = S.tray[i]; if (!p || (S.drag && S.drag.idx === i)) continue;
    const r = slotRect(i), s = L.mini;
    const ok = canPlaceAnywhere(p);
    const px = r.x + (r.w - p.w * s) / 2, py = r.y + (r.h - p.h * s) / 2;
    for (const [x, y] of p.cells) cell(px + x * s, py + y * s, s, ok ? p.color : '#555a72', ok ? 1 : 0.6);
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
    ctx.lineWidth = 6; ctx.strokeStyle = '#2a1257'; ctx.strokeText(p.text, 0, 0);
    const gr = ctx.createLinearGradient(0, -30, 0, 10); gr.addColorStop(0, '#fff6a8'); gr.addColorStop(1, '#ff9d2e');
    ctx.fillStyle = gr; ctx.fillText(p.text, 0, 0);
    ctx.font = `800 ${Math.round(L.cs * 0.4)}px system-ui,sans-serif`; ctx.fillStyle = '#fff';
    ctx.strokeText(p.sub, 0, L.cs * 0.55); ctx.fillText(p.sub, 0, L.cs * 0.55);
    ctx.restore();
  });
  S.pops = S.pops.filter(p => p.t < 1.2);
}

// ---------- input ----------
function pos(e) { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
canvas.addEventListener('pointerdown', e => {
  if (S.over) return;
  const { x, y } = pos(e);
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
canvas.addEventListener('pointermove', e => { if (S.drag) { const p = pos(e); S.drag.x = p.x; S.drag.y = p.y; } });
function drop() {
  if (!S.drag) return;
  const g = ghostTarget(); const idx = S.drag.idx; S.drag = null;
  if (g) place(idx, g.gx, g.gy);
}
canvas.addEventListener('pointerup', drop);
canvas.addEventListener('pointercancel', () => S.drag = null);

$('bp-restart').onclick = () => { if (S.score === 0 || confirm('Recommencer une nouvelle partie ?')) newGame(); };
$('bp-again').onclick = newGame;
window.addEventListener('resize', () => running && resize());

let inited = false;
window.GAMES.blocks = {
  show() {
    if (!inited) { inited = true; if (!load()) newGame(); else if (!S.tray.some(t => t && canPlaceAnywhere(t))) newGame(); updateHUD(); }
    running = true; requestAnimationFrame(() => { resize(); last = performance.now(); requestAnimationFrame(frame); });
  },
  hide() { running = false; S.drag = null; },
};
