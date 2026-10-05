// Synth Horde — jeu d'icônes SVG « Living Sound » (remplace les emoji de l'interface).
// Style « flyer » : aplats néon, contour sombre épais, ombre portée dure décalée en bas à droite.
// Repère 24×24. Chaque entrée de ICONS est le contenu intérieur d'un <svg viewBox="0 0 24 24">.
//   icon('w_blaster', 'big')  → '<svg class="nbi big" viewBox="0 0 24 24" aria-hidden="true">…</svg>'
// Préfixes : w_ armes, evo_ évolutions, t_ tomes, st_ stats, i_ objets, s_ sanctuaires, c_ personnages,
// h_ compteurs du HUD, q_ quêtes, sh_ boutique permanente, m_ divers (textes traduits).
// EMOJI_TO_KEY : emoji encore présents dans bonk.js / lang/bonk.js → clé d'icône.

const D = '#0a0612';   // contour / ombre
const M = '#ff3df0';   // magenta
const C = '#27e0ff';   // cyan
const Y = '#ffe04d';   // jaune
const W = '#fff4fb';   // blanc chaud
const K = '#2b1745';   // corps sombre (caissons, vinyles)
const G = '#7cff8a';   // vert (soin, chance)
const O = '#ff8a4d';   // orange
const R = '#ff3050';   // rouge
const P = '#b98bff';   // violet
const L = '#5cffb0';   // menthe (Hex)
const LIME = '#b6ff3d';
const SW = 1.6;        // épaisseur du contour

// ---------------------------------------------------------------- primitives
const n = v => +v.toFixed(2);
const pts = a => a.map(([x, y]) => `${n(x)},${n(y)}`).join(' ');
const poly = (p, f) => `<polygon points="${pts(p)}" fill="${f}"/>`;
const path = (d, f) => `<path d="${d}" fill="${f}"/>`;
const circ = (cx, cy, r, f) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"/>`;
const rect = (x, y, w, h, f, rx = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"${rx ? ` rx="${rx}"` : ''} fill="${f}"/>`;
const ell = (cx, cy, rx, ry, f) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}"/>`;
// trait épais cerné de sombre (deux passes)
const ln = (d, c, w = 2, extra = '') => `<path d="${d}" fill="none" stroke="${D}" stroke-width="${n(w + SW * 2)}"${extra}/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"${extra}/>`;
// trait fin sans contour (détails, reflets)
const tl = (d, c, w = 1, op = 1) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
const hi = d => tl(d, W, 1.1, 0.85);
const ring = (cx, cy, r, c, w = 2, extra = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${D}" stroke-width="${n(w + SW * 2)}"${extra}/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c}" stroke-width="${w}"${extra}/>`;
const dot = (cx, cy, r, f = D) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}" stroke="none"/>`;
const g = (tf, inner) => `<g transform="${tf}">${inner}</g>`;
const rad = a => a * Math.PI / 180;
const polar = (cx, cy, r, a) => [cx + r * Math.cos(rad(a)), cy + r * Math.sin(rad(a))];
function star(cx, cy, R1, r1, k, f, rot = -90) {
  const a = [];
  for (let i = 0; i < k * 2; i++) a.push(polar(cx, cy, i % 2 ? r1 : R1, rot + i * 180 / k));
  return poly(a, f);
}
function burst(cx, cy, radii, f, rot = -90) {
  return poly(radii.map((r, i) => polar(cx, cy, r, rot + i * 360 / radii.length)), f);
}
function gear(cx, cy, R1, r1, k, f) {   // couronne dentée
  const a = [];
  for (let i = 0; i < k; i++) {
    const a0 = i * 360 / k;
    a.push(polar(cx, cy, r1, a0 - 9), polar(cx, cy, R1, a0 - 5), polar(cx, cy, R1, a0 + 5), polar(cx, cy, r1, a0 + 9));
  }
  return poly(a, f);
}
const HEART = 'M12 21C12 21 3 15.6 3 9.3C3 6.3 5.2 4 8 4C9.8 4 11.2 5 12 6.5C12.8 5 14.2 4 16 4C18.8 4 21 6.3 21 9.3C21 15.6 12 21 12 21Z';
const heart = (f, tf = '') => tf ? g(tf, path(HEART, f)) : path(HEART, f);
const FLAME = 'M12 1.8C13.8 5.6 19 8.2 19 14.4C19 18.7 15.9 22 12 22C8.1 22 5 18.7 5 14.4C5 11.2 6.6 9.4 7.9 7.6C8.6 9.6 9.6 10.8 10.6 11C10.2 7.6 10.8 4.4 12 1.8Z';
const FLAME_IN = 'M12 11.5C13.6 13.6 15.6 15 15.6 17.6C15.6 19.6 14 21 12 21C10 21 8.4 19.6 8.4 17.6C8.4 15.3 10.6 14 12 11.5Z';
const flame = (o, i, tf = '') => { const m = path(FLAME, o) + path(FLAME_IN, i); return tf ? g(tf, m) : m; };
function snowflake(cx, cy, r, c, w = 1.8) {
  let d = '';
  for (let k = 0; k < 3; k++) { const [x1, y1] = polar(cx, cy, r, -90 + k * 60), [x2, y2] = polar(cx, cy, r, 90 + k * 60); d += `M${n(x1)} ${n(y1)}L${n(x2)} ${n(y2)}`; }
  for (let k = 0; k < 6; k++) {
    const a = -90 + k * 60, [bx, by] = polar(cx, cy, r * 0.58, a), [lx, ly] = polar(bx, by, r * 0.36, a - 45), [rx2, ry2] = polar(bx, by, r * 0.36, a + 45);
    d += `M${n(lx)} ${n(ly)}L${n(bx)} ${n(by)}L${n(rx2)} ${n(ry2)}`;
  }
  return ln(d, c, w);
}
const sparkle = (cx, cy, s, f) => poly([[cx, cy - s], [cx + s * 0.28, cy - s * 0.28], [cx + s, cy], [cx + s * 0.28, cy + s * 0.28], [cx, cy + s], [cx - s * 0.28, cy + s * 0.28], [cx - s, cy], [cx - s * 0.28, cy - s * 0.28]], f);
// pédale d'effet (sanctuaires « pédale ») : boîtier, 2 boutons, afficheur avec le symbole, footswitch
const pedal = (col, sym) => rect(4.2, 2.4, 15.6, 19.6, col, 2.2) + circ(8.4, 6.2, 2, K) + circ(15.6, 6.2, 2, K) + tl('M8.4 6.2L7.2 4.8M15.6 6.2L17 5', W, 1.1)
  + rect(6.2, 9.2, 11.6, 7, K, 1.2) + sym + circ(12, 19.2, 1.9, W) + hi('M5.8 4.6V8');
const pedestal = path('M4.5 22L6.2 18.8H17.8L19.5 22Z', K) + tl('M7 20.4H17', P, 1, 0.9);

// ---------------------------------------------------------------- motifs partagés
const MIC_GUN = path('M5.8 12.6H10.6L9.2 20.6H4.2Z', M)
  + rect(2.4, 8, 12.4, 5.6, M, 1.6) + hi('M4.4 9.9H11.6')
  + circ(17.2, 10.8, 4.6, C) + tl('M14.6 9.2H19.8M14.2 10.9H20.2M14.6 12.6H19.8', D, 0.9);
const STAR5 = f => star(12, 12.6, 10, 4.3, 5, f);
const CART = poly([[7, 6.4], [20.6, 6.4], [18.6, 13.4], [8.4, 13.4]], C) + tl('M11.5 7.5L11.9 12.3M15.2 7.5L15 12.3', D, 1)
  + ln('M2.6 3.4H5.6L8.4 15.6H18.4', W, 1.8) + circ(9.6, 18.4, 1.9, Y) + circ(17, 18.4, 1.9, Y);
const MAGNET = (body, tip) => ln('M6.5 4V11.5A5.5 5.5 0 0 0 17.5 11.5V4', body, 4.6, ' stroke-linecap="butt"')
  + `<path d="M6.5 3.2V7.4M17.5 3.2V7.4" fill="none" stroke="${tip}" stroke-width="4.6"/>` + tl('M4.2 7.6H8.8M15.2 7.6H19.8', D, 1.3);
const CHEST = (body, lid, band) => rect(3, 10.5, 18, 10, body, 1.2) + path('M3 10.5C3 6.6 5 4.5 8 4.5H16C19 4.5 21 6.6 21 10.5Z', lid)
  + rect(7.4, 4.6, 2.4, 15.9, band) + rect(14.2, 4.6, 2.4, 15.9, band) + rect(10.4, 9, 3.2, 4.2, band, 0.8) + dot(12, 11.4, 0.7);
const COIN = (f) => circ(12, 12, 9, f) + `<circle cx="12" cy="12" r="6.6" fill="none" stroke="${D}" stroke-width="1" opacity="0.55"/>`
  + ell(10.6, 15.2, 2.3, 1.75, D) + tl('M12.7 15V7.4L16 9.2', D, 1.7) + hi('M6.6 8.4A6.8 6.8 0 0 1 9.4 5.7');
const BOOK = (l, r) => path('M12 6.6C9.6 4.9 6.2 4.6 2.6 5.4V19C6.2 18.2 9.6 18.5 12 20.2Z', l) + path('M12 6.6C14.4 4.9 17.8 4.6 21.4 5.4V19C17.8 18.2 14.4 18.5 12 20.2Z', r)
  + tl('M5 8.6C6.8 8.3 8.5 8.5 9.9 9.2M5 11.6C6.8 11.3 8.5 11.5 9.9 12.2M14.1 9.2C15.5 8.5 17.2 8.3 19 8.6M14.1 12.2C15.5 11.5 17.2 11.3 19 11.6', D, 0.9, 0.7);
const KEY_DATA = rect(2.4, 6.8, 9.2, 10.4, C, 2.6) + rect(5, 9.6, 4, 4.8, K, 0.8) + dot(7, 12, 0.9, C)
  + path('M11.4 10.5H21.6V13.5H20.6V17H17.6V13.5H16.6V16H14.2V13.5H11.4Z', C);
const SKULL = path('M12 2.6C7 2.6 3.6 6.1 3.6 10.6C3.6 13.6 5 15.5 7 16.6V20.6H17V16.6C19 15.5 20.4 13.6 20.4 10.6C20.4 6.1 17 2.6 12 2.6Z', W)
  + circ(8.6, 10.6, 2.4, M) + circ(15.4, 10.6, 2.4, M) + poly([[12, 13.2], [13.2, 15.4], [10.8, 15.4]], D)
  + tl('M10 17.4V20.4M12 17.4V20.4M14 17.4V20.4', D, 1.1);
const STOPWATCH = rect(10, 1.6, 4, 2.6, W, 0.8) + ln('M18.2 5.6L19.8 4', W, 1.6) + circ(12, 13.4, 8.4, C) + circ(12, 13.4, 6.1, K)
  + tl('M12 8.6V9.8M16.8 13.4H15.6M12 18.2V17M7.2 13.4H8.4', W, 1.1) + ln('M12 13.4L15 10.2', Y, 1.6) + dot(12, 13.4, 1.1, Y);
const LEVEL = poly([[12, 2.4], [21.2, 12], [15.6, 12], [15.6, 21.4], [8.4, 21.4], [8.4, 12], [2.8, 12]], Y) + hi('M12 5.2L17.4 10.8');
const SPEAKER = path('M2.8 9H7L12.6 4.4V19.6L7 15H2.8Z', C);

// ---------------------------------------------------------------- dessins
const A = {
  // ===== armes
  w_blaster: MIC_GUN,
  w_orbit: `<circle cx="12" cy="12" r="7.6" fill="none" stroke="${C}" stroke-width="1.4" stroke-dasharray="2.2 2"/>`
    + circ(12, 12, 3.2, M) + hi('M10.6 10.9A1.8 1.8 0 0 1 12.2 10')
    + circ(18.2, 7.6, 3.1, Y) + dot(18.2, 7.6, 0.9) + circ(5.8, 16.4, 3.1, Y) + dot(5.8, 16.4, 0.9),
  w_pulse: ring(12, 12, 9.2, C, 1.8, ' pathLength="40" stroke-dasharray="8 2" stroke-dashoffset="-1"')
    + ring(12, 12, 5.8, M, 1.8, ' pathLength="40" stroke-dasharray="8.5 1.5" stroke-dashoffset="4"')
    + circ(12, 12, 2.6, Y) + dot(12, 12, 0.9),
  w_arc: poly([[13.6, 1.8], [4.4, 13.6], [10.8, 13.6], [8.4, 22.2], [19.6, 9.6], [13.2, 9.6], [16.6, 1.8]], Y) + hi('M13.4 4L8.8 10'),
  w_disc: ln('M1.4 8.4H4.4M1 12H3.8M1.4 15.6H4.4', C, 1.4)
    + circ(13.6, 12, 8.2, K) + `<circle cx="13.6" cy="12" r="5.9" fill="none" stroke="${P}" stroke-width="0.8" opacity="0.8"/>`
    + circ(13.6, 12, 3.1, M) + dot(13.6, 12, 0.9) + tl('M8.6 8.6A6.2 6.2 0 0 1 11.6 6.2', C, 1.4),
  w_blade: g('rotate(45 12 12)', poly([[10, 15.6], [10, 4.6], [12, 1.2], [14, 4.6], [14, 15.6]], C) + tl('M12.9 4.8V14.8', W, 0.9)
    + rect(7.2, 15.4, 9.6, 2.4, Y, 1) + rect(10.8, 17.8, 2.4, 4, M) + circ(12, 22.4, 1.3, Y)),
  w_beam: rect(4.6, 2.4, 1.8, 19.2, K, 0.9) + rect(1.8, 6.6, 7.4, 10.8, M, 1.2) + tl('M3.4 12H7.6', D, 1.4)
    + rect(9.2, 9.6, 12.8, 4.8, C, 1.2) + tl('M10.4 12H20.8', W, 1.3) + sparkle(21, 12, 2.6, W),
  w_mine: rect(2.4, 15.4, 19.2, 4.8, K, 1.2) + dot(6.2, 17.8, 0.9, P) + dot(12, 17.8, 0.9, P) + dot(17.8, 17.8, 0.9, P)
    + path('M4.6 15.4A7.4 7 0 0 1 19.4 15.4Z', M) + hi('M7.4 12.6A5 5 0 0 1 9.6 10.2')
    + circ(12, 7.6, 2, Y) + ln('M12 1.8V3.2M7.6 3.4L8.5 4.6M16.4 3.4L15.5 4.6', Y, 1.2),
  w_rocket: g('rotate(45 12 12)', poly([[9.6, 17.4], [12, 23], [14.4, 17.4]], Y)
    + path('M8.6 12.4L5.4 17.6L8.6 17.2Z', M) + path('M15.4 12.4L18.6 17.6L15.4 17.2Z', M)
    + path('M12 1.4C15 4 15.6 8.6 15.6 17.6H8.4C8.4 8.6 9 4 12 1.4Z', C) + circ(12, 8.4, 2, M) + tl('M14.2 10.5V15.6', W, 0.9, 0.8)),
  w_flame: path('M7.2 12C10.8 8 14 4.2 21.6 4.6C19.6 7 20.4 9 22 10.4C20 11.4 20 12.6 22 13.6C20.4 15 19.6 17 21.6 19.4C14 19.8 10.8 16 7.2 12Z', M)
    + path('M8.4 12C11 10.4 13 8.9 16.6 9.4C15.9 11 15.9 13 16.6 14.6C13 15.1 11 13.6 8.4 12Z', Y)
    + rect(1.6, 9.2, 6.6, 5.6, C, 1) + tl('M4.6 9.6V14.4', D, 1),
  w_aura: ring(12, 12, 9.6, M, 1.3, ' stroke-dasharray="2.4 1.8"') + snowflake(12, 12, 6.6, C, 1.8) + dot(12, 12, 1.2, W),
  w_rail: ring(13, 12, 6.2, Y, 1.8) + ln('M13 2.4V5.6M13 18.4V21.6', Y, 1.8)
    + ln('M1.8 12H22.2', C, 2.6) + tl('M2.6 12H21.4', W, 1) + poly([[22.6, 12], [19.6, 9.6], [19.6, 14.4]], C),
  w_tornado: ln('M3.4 4.4H20.6', C, 2.3) + ln('M5.4 8.4H18.2', C, 2.3) + ln('M7.6 12.4H16.8', P, 2.3) + ln('M9 16.4H14.8', P, 2.3) + ln('M10.6 20.4H13', M, 2.3),
  w_toxic: path('M2.8 17.6C2.8 15.1 5.8 14.6 7.9 15C9 13.2 13 13 15 14.4C17 13.4 21.2 14.2 21.2 17.2C21.2 19.9 17 20.6 12 20.6C7 20.6 2.8 19.9 2.8 17.6Z', LIME)
    + circ(7.8, 9.6, 2.6, LIME) + circ(14.4, 6, 3.4, LIME) + circ(18.2, 11, 1.7, LIME)
    + dot(13.3, 4.9, 0.9, W) + dot(7.1, 8.8, 0.7, W) + hi('M6 17.4C8 16.4 10 16.6 11.4 17'),
  w_drones: rect(2, 10.4, 6.2, 1.6, C, 0.8) + rect(1.8, 13, 6.6, 6.2, M, 1.3) + circ(5.1, 16.1, 1.7, K)
    + rect(7.6, 4.4, 11.8, 2.2, C, 1.1) + ln('M13.5 6.6V8.6', W, 1) + rect(7.4, 8.8, 12.2, 10.4, M, 2) + circ(13.5, 14, 3.4, K) + circ(13.5, 14, 1.4, C) + hi('M9.4 10.8H12'),

  // ===== évolutions
  evo_blaster: burst(16.4, 10.6, [7.4, 4, 6.6, 3.6, 7.6, 4, 6.4, 3.8, 7.2, 4, 6.8, 3.6], Y, -80) + g('translate(-1.2 1.4) scale(0.86)', MIC_GUN),
  evo_orbit: ring(12, 12, 7.8, M, 1.6) + sparkle(12, 12, 4.4, Y)
    + circ(12, 4.2, 2.6, C) + circ(18.8, 15.9, 2.6, C) + circ(5.2, 15.9, 2.6, C),
  evo_pulse: ln('M4 6.6A8.6 8.6 0 0 0 4 17.4M20 6.6A8.6 8.6 0 0 1 20 17.4', C, 1.8) + heart(M, 'translate(3.6 3.4) scale(0.7)') + hi('M8.6 8.6A2 2 0 0 1 10.4 7.6'),
  evo_arc: path('M5.6 13.6C3.4 13.6 1.8 12 1.8 10C1.8 8 3.4 6.5 5.4 6.6C6 4 8.4 2.2 11.2 2.2C14 2.2 16.2 4 16.8 6.4C17.2 6.2 17.6 6.2 18 6.2C20.4 6.2 22.2 8 22.2 10C22.2 12 20.4 13.6 18.2 13.6Z', P)
    + poly([[12.6, 10.4], [7.4, 16.8], [10.6, 16.8], [9, 22.4], [16, 14.6], [12.6, 14.6], [14.6, 10.4]], Y) + hi('M5.4 9.4C5.6 7.6 6.8 6.4 8.4 6'),
  evo_disc: gear(12, 12, 10.2, 7.8, 12, C) + circ(12, 12, 6.2, K) + `<circle cx="12" cy="12" r="4.6" fill="none" stroke="${P}" stroke-width="0.8"/>` + circ(12, 12, 2.6, M) + dot(12, 12, 0.8),
  evo_blade: g('rotate(45 12 12)', poly([[10.2, 15], [10.2, 4], [12, 1], [13.8, 4], [13.8, 15]], C) + rect(7.6, 14.8, 8.8, 2.2, Y, 1) + rect(11, 17, 2, 4.4, C))
    + g('rotate(-45 12 12)', poly([[10.2, 15], [10.2, 4], [12, 1], [13.8, 4], [13.8, 15]], M) + rect(7.6, 14.8, 8.8, 2.2, Y, 1) + rect(11, 17, 2, 4.4, M)),
  evo_beam: ln('M3 21L11 13', M, 3.4) + ln('M2.6 15.4L9.6 11.4M8.6 21.4L12.6 14.4', C, 1.8)
    + circ(15, 9, 6.4, Y) + circ(15, 9, 3.4, W) + hi('M12.6 6.2A3.4 3.4 0 0 1 14.6 5'),
  evo_mine: [[7, 20], [17, 20], [12, 11.6]].map(([x, y]) => rect(x - 5, y - 1.2, 10, 2.8, K, 1) + path(`M${x - 4.2} ${y - 1.2}A4.2 4.2 0 0 1 ${x + 4.2} ${y - 1.2}Z`, M) + circ(x, y - 5.2, 1.3, Y)).join(''),
  evo_rocket: ln('M12 12L12 2.4M12 12L18.8 5.2M12 12L21.6 12M12 12L18.8 18.8M12 12L12 21.6M12 12L5.2 18.8M12 12L2.4 12M12 12L5.2 5.2', M, 1.8)
    + circ(12, 2.6, 1.6, Y) + circ(21.4, 12, 1.6, Y) + circ(12, 21.4, 1.6, Y) + circ(2.6, 12, 1.6, Y)
    + circ(18.8, 5.2, 1.3, C) + circ(18.8, 18.8, 1.3, C) + circ(5.2, 18.8, 1.3, C) + circ(5.2, 5.2, 1.3, C) + circ(12, 12, 3, W),
  evo_flame: path('M1.8 21.4L8.4 9.6H15.6L22.2 21.4Z', K) + path('M8.4 9.6L6.6 12.8C8.4 13.8 9.6 12.4 10.6 13.8C11.6 15.2 13 13.4 14 14.4C15.2 15.4 16.4 13.8 17.4 13L15.6 9.6Z', R)
    + path('M8.6 9.6C8.2 6.8 10 5.6 11 3.4C11.6 5 12.6 5.4 13.2 4.6C14.8 6.4 16 7.8 15.4 9.6Z', Y) + circ(6.2, 4.2, 1.5, O) + circ(18.4, 3.4, 1.8, R) + circ(19.6, 7.4, 1, O),
  evo_aura: path('M12 2.6L20.6 7V17L12 21.4L3.4 17V7Z', C) + path('M12 2.6L20.6 7L12 11.4L3.4 7Z', '#bff7ff') + path('M12 11.4L20.6 7V17L12 21.4Z', '#14a9d6')
    + tl('M5.6 13L8.4 14.4', W, 1.2, 0.9) + sparkle(16.2, 14.8, 2.6, W),
  evo_rail: ln('M12 9.6V22', C, 2.4) + path('M3.6 3L5.6 5.4V9.6C5.6 11.6 8 12.6 12 12.6C16 12.6 18.4 11.6 18.4 9.6V5.4L20.4 3V10C20.4 13.4 17 15.4 12 15.4C7 15.4 3.6 13.4 3.6 10Z', Y)
    + poly([[12, 1.4], [14.4, 5.4], [13.2, 5.4], [13.2, 12.4], [10.8, 12.4], [10.8, 5.4], [9.6, 5.4]], Y),
  evo_tornado: ln('M12 12.4C12.8 11.2 14.4 11.8 14.2 13.2C14 15 11.2 15.6 9.8 14.2C8 12.4 9.2 9.2 12 8.8C15.4 8.4 18 11 17.6 14.2C17.2 17.8 13.4 19.8 9.8 18.8C5.6 17.6 4 13.2 5.4 9.4C6.8 5.6 11.2 3.6 15.4 4.4C18 4.9 20 6.4 21.2 8.4', C, 2.2),
  evo_toxic: [0, 45, 90, 135, 180, 225, 270, 315].map(a => { const [x, y] = polar(12, 12, 9, a); const [x0, y0] = polar(12, 12, 6, a); return ln(`M${n(x0)} ${n(y0)}L${n(x)} ${n(y)}`, LIME, 1.4) + circ(n(x), n(y), 1.6, LIME); }).join('')
    + circ(12, 12, 6.4, LIME) + dot(10, 10.6, 1.3, '#3d8a1a') + dot(14, 13.4, 1.7, '#3d8a1a') + dot(13.6, 9.4, 0.8, '#3d8a1a') + hi('M8.4 10A4 4 0 0 1 10.4 7.8'),
  evo_drones: g('rotate(-30 12 12)', rect(1.4, 9.4, 6.4, 5.2, C, 0.6) + rect(16.2, 9.4, 6.4, 5.2, C, 0.6) + tl('M3.6 9.4V14.6M5.6 9.4V14.6M18.4 9.4V14.6M20.4 9.4V14.6', D, 0.9)
    + rect(7.8, 11.2, 8.4, 1.6, W) + rect(9, 7.6, 6, 8.8, M, 1.4) + circ(12, 12, 1.9, K))
    + ln('M15.4 4.4A3.6 3.6 0 0 1 19.6 8.6M16.4 1.8A6.4 6.4 0 0 1 22.2 7.6', Y, 1.2),

  // ===== stats (les tomes en reprennent le dessin)
  st_dmg: burst(12, 12, [10.4, 5, 9, 4.4, 10.6, 5.2, 8.6, 4.6, 10.2, 4.8, 9.2, 4.4, 10.6, 5, 8.8, 4.6], M) + burst(12, 12, [5.4, 2.8, 4.8, 2.6, 5.6, 2.8, 4.6, 2.6], Y, -70),
  st_cd: ln('M17.4 8A7 7 0 1 0 18.6 14.9', C, 2.6, ' stroke-linecap="butt"') + poly([[21.6, 11.4], [21.4, 17.2], [15.6, 15]], C)
    + poly([[12.8, 7.6], [9.2, 13], [11.6, 13], [10.8, 17.2], [14.8, 11.4], [12.4, 11.4], [13.8, 7.6]], Y),
  st_crit: circ(12, 12, 9.4, M) + circ(12, 12, 6.4, W) + circ(12, 12, 3.4, M) + dot(12, 12, 1.2, Y)
    + ln('M12.4 11.6L19.6 4.4', Y, 1.6) + poly([[19, 1.6], [22.4, 5], [19.6, 5.4], [18.6, 4.4]], Y),
  st_area: rect(8.4, 8.4, 7.2, 7.2, M, 1.4) + [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => {
    const tip = [12 + sx * 9.8, 12 + sy * 9.8], a = [12 + sx * 9.8, 12 + sy * 5], b = [12 + sx * 5, 12 + sy * 9.8];
    return ln(`M${12 + sx * 4.6} ${12 + sy * 4.6}L${12 + sx * 8.2} ${12 + sy * 8.2}`, C, 2.2) + poly([tip, a, b], C);
  }).join(''),
  st_proj: [[-6.2, -22], [6.2, 22], [0, 0]].map(([dx, a]) => g(`translate(${dx} ${a ? 1.6 : 0}) rotate(${a} 12 20)`, path('M10.2 20.6V10.2L12 6L13.8 10.2V20.6Z', a ? C : Y) + tl('M10.2 17.6H13.8', D, 1))).join(''),
  st_speed: ln('M1.4 9.6H4.4M1 13H3.4', W, 1.3)
    + path('M4.6 17.4V12.4C4.6 11.3 5.2 10.6 6.2 10.6C7.6 10.6 8.4 9.2 8.8 7.6H11.8C12.2 9.4 13.2 10.4 15 10.9L20 12.3C21.4 12.7 22 13.6 22 15V17.4Z', C)
    + rect(4.6, 17.4, 17.4, 2.4, W, 0.8) + tl('M10.6 10.2L12.4 9.4M11.8 11.6L13.6 10.8', D, 1.1) + tl('M7 15.4H19', M, 1.6),
  st_hp: heart(M) + hi('M6.4 8.6A2.6 2.6 0 0 1 8.4 6.8'),
  st_regen: heart(G) + rect(10.4, 7.6, 3.2, 9, W, 0.6) + rect(7.5, 10.5, 9, 3.2, W, 0.6),
  st_armor: path('M12 2L20.2 5V11C20.2 16.2 16.6 19.9 12 22C7.4 19.9 3.8 16.2 3.8 11V5Z', C) + path('M12 2V22C7.4 19.9 3.8 16.2 3.8 11V5Z', '#7ff0ff')
    + path('M12 6.4L16.6 8.2V11.6C16.6 14.4 14.6 16.6 12 17.8C9.4 16.6 7.4 14.4 7.4 11.6V8.2Z', M),
  st_magnet: MAGNET(R, C),
  st_luck: ln('M13.6 13.6C15.6 16 16.6 18.6 17 21.8', G, 1.6)
    + [[12, 6.4], [17.6, 12], [12, 17.6], [6.4, 12]].map(([x, y], i) => g(`rotate(${i * 90 + 45} ${x} ${y})`, heart(G, `translate(${x - 6} ${y - 6.6}) scale(0.5)`))).join('')
    + dot(12, 12, 1.4, '#2fae4a'),
  st_xp: BOOK(C, '#9ff3ff') + sparkle(12, 3, 2.4, Y),

  // ===== objets
  i_boots: path('M5.6 3.4H12V12L18.4 13.4C19.8 13.7 20.6 14.6 20.6 15.8V17.4H5.6Z', M) + rect(5.6, 3.4, 6.4, 2.4, W) + tl('M8 8.4H12M8 11H12', D, 1)
    + ln('M7.4 19.6L9.4 21.6L11.4 19.6L13.4 21.6L15.4 19.6L17.4 21.6', Y, 1.3),
  i_clover: ln('M12 13.4C11.4 16.6 9.4 19.4 6.4 21.4', G, 1.6) + [[12, 6.8, 0], [17.4, 13.2, 125], [6.6, 13.2, -125]].map(([x, y, r]) => g(`rotate(${r} ${x} ${y})`, heart(G, `translate(${x - 6.3} ${y - 7}) scale(0.525)`))).join('')
    + dot(12, 11.2, 1.3, '#2fae4a') + sparkle(19.4, 4.6, 2.6, Y),
  i_battery: rect(1.8, 6.6, 17.6, 10.8, C, 1.8) + rect(19.4, 9.6, 2.8, 4.8, W, 0.8) + rect(3.6, 8.4, 6, 7.2, '#14a9d6', 0.8)
    + poly([[12.4, 7.4], [7.6, 12.8], [11, 12.8], [9.8, 16.8], [15, 11.2], [11.6, 11.2], [13.4, 7.4]], Y),
  i_lens: ln('M14.6 14.6L20.8 20.8', M, 3.4) + circ(9.8, 9.8, 6.6, Y) + circ(9.8, 9.8, 4.6, '#a7f4ff') + hi('M7 8.4A3.2 3.2 0 0 1 8.6 6.8'),
  i_heart: heart(M) + ln('M4.4 12.4H8.2L9.8 9L12.4 16L14.2 11.6L15.4 12.4H19.6', W, 1.3),
  i_coin: COIN(Y),
  i_fang: rect(5, 2.4, 14, 3.8, R, 1.4) + path('M6.2 6.2H17.8C17.8 11.8 15.2 16.8 12 21.6C8.8 16.8 6.2 11.8 6.2 6.2Z', W) + tl('M9 8.4C9.4 12 10.4 14.6 11.6 16.6', P, 1, 0.6)
    + path('M17.4 15.6C18.4 17.2 19.4 18 19.4 19.2C19.4 20.4 18.5 21.2 17.4 21.2C16.3 21.2 15.4 20.4 15.4 19.2C15.4 18 16.4 17.2 17.4 15.6Z', R),
  i_shield: poly([0, 60, 120, 180, 240, 300].map(a => polar(12, 12, 10, a - 90)), C) + poly([0, 60, 120, 180, 240, 300].map(a => polar(12, 12, 6.6, a - 90)), K)
    + poly([0, 60, 120, 180, 240, 300].map(a => polar(12, 12, 3.2, a - 90)), M) + hi('M5.2 8.6L9.2 6.2'),
  i_thorns: ln('M9.6 14H6.4V8.4M14.4 11.4H17.6V5.8', G, 3) + rect(9.4, 3, 5.2, 18.6, G, 2.6) + rect(4, 20.4, 16, 1.8, K, 0.9)
    + tl('M12 5.6V18.6', '#2fae4a', 1) + tl('M8.4 6.4L9.4 7M15.6 9.2L14.6 9.8M8.4 15.6L9.4 16.2M15.6 16.8L14.6 17.4M4.6 9.6L5.6 10M19.4 7L18.4 7.4', W, 1),
  i_cloak: path('M12 2.4C8 2.4 6 6 6 9.6C6 13.2 4 18.2 2.6 21.6H21.4C20 18.2 18 13.2 18 9.6C18 6 16 2.4 12 2.4Z', P)
    + ell(12, 9.8, 3.4, 4.2, D) + dot(10.6, 9.8, 0.9, C) + dot(13.4, 9.8, 0.9, C) + tl('M8.4 15.4L7.2 20.4M15.6 15.4L16.8 20.4', D, 1, 0.5),
  i_bomb: circ(10.6, 14, 7.6, M) + g('rotate(40 15.6 7.6)', rect(13.4, 5.6, 4.4, 3.4, K, 0.6)) + ln('M17 6.2C18 4 19.4 3.6 20.4 4.6', W, 1.2)
    + sparkle(20.6, 3.6, 3, Y) + hi('M6.2 12.2A5 5 0 0 1 8.4 9.4'),
  i_reactor: circ(12, 12, 9.8, Y) + [-90, 30, 150].map(a => {
    const [x1, y1] = polar(12, 12, 2.6, a - 30), [x2, y2] = polar(12, 12, 8, a - 30), [x3, y3] = polar(12, 12, 8, a + 30), [x4, y4] = polar(12, 12, 2.6, a + 30);
    return `<path d="M${n(x1)} ${n(y1)}L${n(x2)} ${n(y2)}A8 8 0 0 1 ${n(x3)} ${n(y3)}L${n(x4)} ${n(y4)}A2.6 2.6 0 0 0 ${n(x1)} ${n(y1)}Z" fill="${D}" stroke="none"/>`;
  }).join('') + dot(12, 12, 1.5),
  i_crown: poly([[2.6, 7.4], [7.4, 12.2], [12, 3.6], [16.6, 12.2], [21.4, 7.4], [19.6, 19], [4.4, 19]], Y) + rect(4.4, 16.4, 15.2, 3.6, '#ffb52e', 0.6)
    + circ(12, 3.6, 1.6, M) + circ(2.6, 7.4, 1.4, C) + circ(21.4, 7.4, 1.4, C) + dot(8, 18.2, 0.9, M) + dot(12, 18.2, 0.9, C) + dot(16, 18.2, 0.9, M),
  i_wings: path('M3.4 19.6C3.4 11 9 4.2 21 3.2C19.8 5.6 18.2 6.8 16 7.4C18 7.8 19 8.4 19.6 9.6C17.6 11 15.6 11.4 13.6 11.4C15.2 12.2 16 13 16.2 14.2C12.8 15.8 8.4 16.2 6.6 16.2Z', W)
    + tl('M6.4 15.6C8.4 12 11.6 8.6 17.4 5.6M10 15.6C11.4 13.6 12.6 12.6 13.6 11.6', C, 1.2) + ln('M2.6 21.4L5.4 17.2', C, 1.4),
  i_soles: path('M8.6 2.4C12.2 2.4 13.8 5.4 13.8 9C13.8 12 12.4 13 12.4 15.6C12.4 18.6 11.4 21.6 8.6 21.6C5.8 21.6 5.2 18.6 5.2 16C5.2 12.6 4.2 11 4.2 8C4.2 4.6 6.2 2.4 8.6 2.4Z', C)
    + tl('M5.6 13.6H12.6', D, 1.1) + poly([[19.4, 4.4], [14.4, 12.6], [17.6, 12.6], [15.4, 20.6], [21.8, 10.6], [18.6, 10.6], [21.2, 4.4]], Y),
  i_burner: path('M8.4 10C7.8 14 9.4 16.4 12 21.8C14.6 16.4 16.2 14 15.6 10Z', M) + path('M10 10C9.8 12.6 10.8 14.6 12 17.6C13.2 14.6 14.2 12.6 14 10Z', Y)
    + path('M6.4 2.4H17.6L15.8 10.4H8.2Z', C) + rect(5.4, 2.4, 13.2, 2.4, W, 0.8) + tl('M9.4 6.6H14.6', D, 1),
  i_turbine: circ(12, 12, 9.8, K) + ring(12, 12, 9.4, C, 1.4) + [0, 90, 180, 270].map(a => g(`rotate(${a} 12 12)`, path('M12 12C11.6 8.4 12.8 5 15.6 3.6C16.6 6.8 15.4 10.2 12 12Z', M))).join('') + circ(12, 12, 2.2, Y),
  i_kite: ln('M12 18.4C11 20 13.6 20.6 12.4 22.2', Y, 1.2) + poly([[12, 1.8], [19.4, 8.8], [12, 18.6], [4.6, 8.8]], M)
    + path('M12 1.8L19.4 8.8H12Z', '#ff8af7') + path('M12 8.8H4.6L12 18.6Z', '#d62cc8') + tl('M12 1.8V18.6M4.6 8.8H19.4', D, 1) + poly([[9.4, 19.2], [11.6, 20.2], [9.4, 21.2]], C),
  i_adren: g('rotate(45 12 12)', ln('M12 0.8V5.6', W, 1) + rect(9, 5.8, 6, 11.2, '#d9f8ff', 1) + rect(9, 10.4, 6, 6.6, M, 1)
    + tl('M9.6 8H11.4M9.6 10H11.4', D, 0.8) + rect(6.8, 17, 10.4, 1.9, W, 0.6) + rect(11, 18.9, 2, 2.3, W) + rect(8.6, 21.2, 6.8, 1.7, C, 0.6)),
  i_star: ln('M12 0.8V3M22.6 9.4L20.4 10M19.4 21.4L18 19.6M4.6 21.4L6 19.6M1.4 9.4L3.6 10', M, 1.6) + STAR5(Y) + hi('M11.2 6.4L10.2 9'),
  i_ember: ln('M2 21H21.4', O, 1.6) + flame(O, Y, 'translate(1.2 9.4) scale(0.48)') + flame(M, Y, 'translate(6.6 5.6) scale(0.64)') + flame(R, Y, 'translate(12.6 1.4) scale(0.82)'),
  i_mirror: rect(10.4, 15.4, 3.2, 6.6, P, 1.2) + ell(12, 9.2, 7.2, 7.8, P) + ell(12, 9.2, 5.2, 5.8, '#c2f6ff')
    + tl('M8.8 8.6L11.6 5.6M9.4 11.4L13.8 6.8', W, 1.3),
  i_axe: ln('M5 21.4L16.4 4.4', '#ffb15a', 2.2) + path('M12.6 4.6C15 2 19.6 2.2 21.8 5.4C21.6 9 18.2 11.8 14.6 11.2L16.6 8.4L13.2 6.6Z', C) + tl('M17.8 4.4C19.6 4.8 20.8 6 21.2 7.2', W, 1.1),
  i_frost: poly([[12, 1.6], [17, 8], [15, 21.6], [9, 21.6], [7, 8]], C) + poly([[12, 1.6], [17, 8], [12, 9.6], [7, 8]], '#c2f8ff')
    + tl('M12 9.6V21.6', '#14a9d6', 1) + poly([[4.2, 9.6], [7, 13.6], [6.2, 19.8], [3, 19.8], [2.2, 13.6]], '#7fe8ff') + poly([[20, 11.6], [22, 14.6], [21.4, 19.8], [18.6, 19.8], [18, 14.6]], '#7fe8ff'),
  i_chrono: rect(4.4, 1.8, 15.2, 2.6, Y, 1) + rect(4.4, 19.6, 15.2, 2.6, Y, 1)
    + path('M6.4 4.4H17.6C17.6 8.4 14 10 13.2 12C14 14 17.6 15.6 17.6 19.6H6.4C6.4 15.6 10 14 10.8 12C10 10 6.4 8.4 6.4 4.4Z', '#bff7ff')
    + path('M8.4 7H15.6C15 8.8 12.6 9.8 12 11.2C11.4 9.8 9 8.8 8.4 7Z', M) + path('M12 15.4C13 15.8 15.4 17.4 15.8 19.6H8.2C8.6 17.4 11 15.8 12 15.4Z', M),
  i_keg: rect(4.4, 2.4, 15.2, 19.2, R, 2.2) + rect(4.4, 9.6, 15.2, 4.8, Y)
    + `<path d="M6.6 9.6L4.4 11.8M10.2 9.6L5.4 14.4M13.8 9.6L9 14.4M17.4 9.6L12.6 14.4M19.6 11L16.2 14.4" stroke="${D}" stroke-width="1.4" fill="none"/>`
    + tl('M4.4 5.4H19.6M4.4 18.6H19.6', D, 1.2) + hi('M7 15.6V17.4'),
  i_siphon: path('M12 1.8C15.2 7 19.2 10.4 19.2 15C19.2 19 16 22 12 22C8 22 4.8 19 4.8 15C4.8 10.4 8.8 7 12 1.8Z', R) + hi('M8.2 15.4C8.2 13.4 9 12 10.2 10.8'),
  i_midas: path('M9 2.4H15V4.6C15 5.6 17.6 6.8 18.4 9.8C19.4 13.6 17.6 18.4 15 20H9C6.4 18.4 4.6 13.6 5.6 9.8C6.4 6.8 9 5.6 9 4.6Z', Y)
    + ln('M6.4 7.4C3.6 7 3 10.6 5.4 11.6M17.6 7.4C20.4 7 21 10.6 18.6 11.6', Y, 1.4) + rect(5.6, 11, 12.8, 2.6, M) + rect(8.4, 20, 7.2, 2, '#ffb52e', 0.6) + hi('M8 14.6C8 16.2 8.6 17.4 9.4 18.2'),
  i_key: circ(6.4, 7.6, 4.6, Y) + circ(6.4, 7.6, 1.8, K) + ln('M9.6 10.8L20.6 21.8', Y, 2.6) + ln('M16.2 17.4L18.6 15M19 20.2L21.2 18', Y, 2),
  i_clock: circ(12, 12, 9.8, C) + circ(12, 12, 7.2, K) + tl('M12 5.6V7.2M18.4 12H16.8M12 18.4V16.8M5.6 12H7.2', W, 1.2)
    + poly([[13.2, 6.2], [8.4, 13], [11.4, 13], [10.4, 18], [15.6, 11], [12.6, 11], [14.4, 6.2]], Y),

  // ===== sanctuaires (même socle, symbole au-dessus)
  s_charge: pedestal + ln('M6.4 10.4L12 4.8L17.6 10.4', G, 2.8) + ln('M6.4 16L12 10.4L17.6 16', G, 2.8),
  s_chal: pedestal + ln('M3 2.4L15 14.4M21 2.4L9 14.4', W, 1.9) + ln('M15 14.4L17.6 17M9 14.4L6.4 17', R, 1.8)
    + ln('M13.4 16.2L16.8 12.8M10.6 16.2L7.2 12.8', R, 1.8),
  s_greed: pedestal + [15, 11.2, 7.4].map((y, i) => path(`M5.4 ${y}V${y + 2}A6.6 2.2 0 0 0 18.6 ${y + 2}V${y}Z`, '#d9a520') + ell(i === 1 ? 12.6 : 12 - (i === 2 ? 0.6 : 0), y, 6.6, 2.2, '#ffc94d')).join('') + sparkle(19.6, 4, 2.4, W),
  s_shop: pedestal + g('translate(0 -1.6)', CART),
  s_dup: pedestal + rect(3.6, 2.4, 10.4, 10.4, '#ffc2a0', 1.6) + rect(9.6, 6.8, 10.4, 10.4, O, 1.6) + ln('M14.8 9.6V14.4M12.4 12H17.2', W, 1.6),
  s_curse: pedestal + path('M2.4 10C6 4.4 18 4.4 21.6 10C18 15.6 6 15.6 2.4 10Z', P) + circ(12, 10, 3.8, Y) + ell(12, 10, 1, 3, D)
    + ln('M6.8 14.2V16.4M17.2 14.2V15.4', P, 1.2),
  s_magnet: pedestal + g('translate(3 0.4) scale(0.75)', MAGNET('#7ff6ff', W)),
  s_tithe: pedestal + circ(12, 9.6, 7.4, '#fff0a0') + `<circle cx="12" cy="9.6" r="5.2" fill="none" stroke="${D}" stroke-width="1" opacity="0.5"/>` + sparkle(12, 9.6, 3.8, D) + sparkle(20.4, 3, 2, Y),
  s_altar: pedestal + path('M8.6 10.4C7.8 7.4 9.8 6 10.8 3.4C11.4 5 12.4 5.4 13 4.4C14.8 6.4 16.2 8 15.4 10.4Z', Y) + path('M4.6 10.4H19.4C19.4 14.4 16 17 12 17C8 17 4.6 14.4 4.6 10.4Z', '#ff2d55') + tl('M8 13H16', D, 1, 0.6),

  s_fuzz: pedal('#ff8a1a', tl('M7.4 14.4V11.2H9.6V14.4H11.8V11.2H14V14.4H16.4V11.2', '#ffb35a', 1.4)),
  s_boost: pedal(R, ln('M12 15V10.6M9.8 12.6L12 10.4L14.2 12.6', '#ff8a9a', 1.4)),
  s_echo: pedal('#7ff6ff', tl('M8 15V10.6', '#7ff6ff', 1.6) + tl('M10.8 15V11.8', '#7ff6ff', 1.6, 0.8) + tl('M13.6 15V13', '#7ff6ff', 1.6, 0.6) + tl('M16.2 15V13.8', '#7ff6ff', 1.6, 0.45)),
  s_drive: pedal(P, tl('M7.2 14.6L9.8 10.8L10.4 14.6L13 10.8L13.6 14.6L16.2 10.8L16.8 14.6', '#e0ccff', 1.3)),

  // ===== personnages (têtes « Living Sound »)
  c_glitch: ln('M8.6 5L6 1.6M15.4 5L18 1.6', W, 1.3) + rect(2.2, 4.8, 19.6, 15.6, C, 3) + rect(4.8, 7.4, 14.4, 10.4, K, 2)
    + tl('M6.4 12.6C7.8 8.6 9.4 8.6 10.8 12.6S13.8 16.6 15.2 12.6S17.4 10.2 17.8 11', M, 1.6) + rect(8, 20.4, 8, 1.8, W, 0.6),
  c_ronin: rect(2, 5.4, 20, 14.2, M, 2) + rect(4.8, 8.6, 14.4, 6.4, K, 3.2) + circ(8.8, 11.8, 2.1, W) + circ(15.2, 11.8, 2.1, W) + dot(8.8, 11.8, 0.7) + dot(15.2, 11.8, 0.7)
    + path('M6.4 19.6L7.8 16.8H16.2L17.6 19.6Z', '#ff8af7') + rect(1.4, 3.4, 21.2, 2.6, C, 0.6) + ln('M21.6 4.8L23 9.2', C, 1.4),
  c_volt: rect(6, 18.4, 12, 3.8, K, 0.8) + tl('M8.6 22.2V23.2M12 22.2V23.2M15.4 22.2V23.2', W, 1)
    + path('M6.6 18.4V9C6.6 5 9 2.2 12 2.2C15 2.2 17.4 5 17.4 9V18.4Z', P) + ln('M9.8 16.4V11.4C9.8 8.6 14.2 8.6 14.2 11.4V16.4', Y, 1.5) + dot(12, 9.6, 1.1, W) + hi('M8.6 12V8.4C8.6 6.6 9.4 5.2 10.4 4.6'),
  c_bastion: rect(2.4, 2.4, 19.2, 19.2, G, 3) + circ(12, 12.6, 7.2, K) + circ(12, 12.6, 4.6, Y) + circ(12, 12.6, 2, G)
    + dot(4.8, 4.8, 0.9) + dot(19.2, 4.8, 0.9) + dot(4.8, 19.2, 0.9) + dot(19.2, 19.2, 0.9),
  c_nova: rect(1.8, 8.6, 3.2, 6.8, C, 1) + path('M5 9.2L15.2 4.4V19.6L5 14.8Z', O) + ell(15.4, 12, 2.6, 7.8, C) + ell(15.4, 12, 1.2, 5.2, K)
    + rect(7.4, 15.4, 2.6, 5.4, K, 0.8) + ln('M19.6 8.6A5 5 0 0 1 19.6 15.4M21.6 6.4A8.2 8.2 0 0 1 21.6 17.6', C, 1.1),
  c_orbit: `<ellipse cx="12" cy="12.6" rx="10.6" ry="3.6" transform="rotate(-18 12 12.6)" fill="none" stroke="${D}" stroke-width="5.2"/><ellipse cx="12" cy="12.6" rx="10.6" ry="3.6" transform="rotate(-18 12 12.6)" fill="none" stroke="${Y}" stroke-width="2"/>`
    + circ(12, 11.6, 7, P) + rect(7.2, 9.4, 9.6, 3.2, K, 1.6) + dot(9.6, 11, 0.8, C) + dot(14.4, 11, 0.8, C)
    + g('rotate(-18 12 12.6)', ln('M1.4 12.6A10.6 3.6 0 0 0 22.6 12.6', Y, 2)),
  c_blitz: ln('M5.4 13.4C5.4 4.4 18.6 4.4 18.6 13.4', R, 2.6) + rect(2, 11, 6.4, 10, R, 2.2) + rect(15.6, 11, 6.4, 10, R, 2.2)
    + rect(6.4, 12.6, 2.4, 6.8, W, 1) + rect(15.2, 12.6, 2.4, 6.8, W, 1) + hi('M3.8 13V18'),
  c_miser: path('M9.4 14.2H14.6L13.6 21.8H10.4Z', M) + rect(8.8, 13.4, 6.4, 2, W, 0.6) + circ(12, 8.2, 6.6, Y)
    + tl('M7.4 6.4H16.6M5.8 8.8H18.2M7 11.2H17M9.6 2.6V13.6M12 1.8V14.6M14.4 2.6V13.6', D, 0.8, 0.55) + hi('M7.8 5.6A5 5 0 0 1 10.2 3.2'),
  c_hex: [-160, -125, -90, -55, -20].map((a, i) => { const [x, y] = polar(12, 13.4, 9.8, a); return circ(n(x), n(y), 1.5, i % 2 ? P : L); }).join('')
    + circ(12, 13.4, 7.4, L) + circ(12, 13.4, 4.6, P) + ln('M12 13.4L9 10.4', W, 1.4),

  // ===== HUD
  h_gold: poly([[12, 2], [20.6, 12], [12, 22], [3.4, 12]], Y) + poly([[12, 2], [20.6, 12], [3.4, 12]], '#fff0a0') + tl('M3.4 12H20.6M12 2L9.4 12L12 22M12 2L14.6 12L12 22', D, 0.8, 0.45),
  h_credits: poly([[12, 1.6], [22.4, 12], [12, 22.4], [1.6, 12]], C) + poly([[12, 5.6], [18.4, 12], [12, 18.4], [5.6, 12]], K) + poly([[12, 8.8], [15.2, 12], [12, 15.2], [8.8, 12]], M),
  h_kills: SKULL,
  h_keys: KEY_DATA,
  h_heat: flame(O, Y) + hi('M8 13.6C8 12 8.6 10.8 9.4 10'),
  h_time: STOPWATCH,
  h_level: LEVEL,
  h_gain: ring(12, 13, 9, M, 2.2, ' pathLength="100" stroke-dasharray="20 5 20 5 20 30" stroke-dashoffset="-37.5"') + circ(12, 13, 5.8, Y) + circ(12, 13, 4, '#ffb52e')
    + ln('M12 13L16.4 8.6', W, 1.6) + dot(12, 13, 1.1),
  h_pause: rect(5, 3.6, 5, 16.8, W, 1) + rect(14, 3.6, 5, 16.8, W, 1),

  // ===== quêtes (les autres réutilisent les dessins ci-dessus, voir ALIAS)
  q_chests: CHEST(M, '#ff8af7', Y),
  q_gold: sparkle(9, 13.4, 7.4, Y) + sparkle(18.4, 5.4, 3.6, W) + sparkle(18.6, 18.4, 2.6, Y),
  q_itemdmg: rect(6.6, 2.4, 10.8, 4, K, 2) + rect(3.6, 5.4, 16.8, 16.4, M, 3.2) + path('M3.6 10.4C3.6 7.4 5.6 5.4 8.6 5.4H15.4C18.4 5.4 20.4 7.4 20.4 10.4V11.4H3.6Z', '#ff8af7')
    + rect(7, 14, 10, 5.6, C, 1.2) + rect(10.8, 10.2, 2.4, 2.8, Y, 0.6),
  q_ot: ln('M12 12C9.2 8 4 8 4 12C4 16 9.2 16 12 12C14.8 8 20 8 20 12C20 16 14.8 16 12 12Z', C, 2.8),
  q_hops: ell(8.4, 7, 2.6, 6, W) + ell(15.6, 7, 2.6, 6, W) + ell(8.4, 7.4, 1, 4, M) + ell(15.6, 7.4, 1, 4, M) + ell(12, 15.4, 7.4, 6.6, W)
    + dot(9.2, 14.6, 1.1) + dot(14.8, 14.6, 1.1) + poly([[12, 17], [13, 16.2], [11, 16.2]], M),
  q_wins: rect(6.2, 3.2, 14.6, 10.6, W) + [0, 1, 2, 3].map(i => [0, 1, 2].map(j => (i + j) % 2 ? '' : `<rect x="${n(6.2 + i * 3.65)}" y="${n(3.2 + j * 3.53)}" width="3.65" height="3.53" fill="${D}" stroke="none"/>`).join('')).join('')
    + `<rect x="6.2" y="3.2" width="14.6" height="10.6" fill="none"/>` + ln('M5 2.4V22', Y, 2),
  q_trophy: ln('M7 5.4C2.6 5.4 3 11 7.6 11M17 5.4C21.4 5.4 21 11 16.4 11', Y, 1.6) + path('M6.8 2.6H17.2V7.8C17.2 11.8 15 14.2 12 14.2C9 14.2 6.8 11.8 6.8 7.8Z', Y)
    + rect(10.6, 14, 2.8, 3.4, '#ffb52e') + rect(6.6, 17.4, 10.8, 4.2, M, 1) + hi('M9 4.6V8.4'),
  q_done: ln('M4 12.6L9.6 18.2L20.4 6', G, 3.2),

  // ===== divers (textes traduits)
  m_star: STAR5(Y) + hi('M11.2 6.4L10.2 9'),
  m_elite: star(12, 12.4, 10.4, 4, 5, M) + star(12, 12.8, 4.8, 2, 5, Y),
  m_lock: ln('M7.6 10.4V7.4A4.4 4.4 0 0 1 16.4 7.4V10.4', W, 2.2) + rect(4, 10.2, 16, 11.6, Y, 2) + circ(12, 15, 1.8, K) + rect(11.2, 15.6, 1.6, 3, K, 0.4),
  m_unlock: ln('M7.6 10.4V7.4A4.4 4.4 0 0 1 16.2 6', W, 2.2) + rect(4, 10.2, 16, 11.6, G, 2) + circ(12, 15, 1.8, K) + rect(11.2, 15.6, 1.6, 3, K, 0.4),
  m_warn: path('M12 2.2L22.4 20.6H1.6Z', Y) + rect(10.7, 8, 2.6, 7.2, D, 1) + dot(12, 17.6, 1.5),
  m_ban: circ(12, 12, 10, R) + rect(5, 10, 14, 4, W, 1),
  m_ad: rect(1.8, 4.4, 20.4, 15.2, C, 3) + rect(4.2, 6.8, 15.6, 10.4, K, 1.6) + poly([[10, 8.8], [16, 12], [10, 15.2]], M),
  m_pad: path('M6.6 6.8H17.4C20.4 6.8 22.2 9.6 22.2 13.6C22.2 17 21 19 19.4 19C17.6 19 16.6 16.4 15.2 16.4H8.8C7.4 16.4 6.4 19 4.6 19C3 19 1.8 17 1.8 13.6C1.8 9.6 3.6 6.8 6.6 6.8Z', P)
    + `<path d="M5.6 10.2H7.4V12H9.2V13.8H7.4V15.6H5.6V13.8H3.8V12H5.6Z" fill="${D}" stroke="none"/>` + dot(16.6, 11, 1.2, Y) + dot(18.8, 13.2, 1.2, M) + dot(14.4, 13.2, 1.2, C) + dot(16.6, 15.2, 1.2, G),
  m_sound: SPEAKER + ln('M15.6 9A4 4 0 0 1 15.6 15M18.2 6.2A8 8 0 0 1 18.2 17.8', M, 1.6),
  m_dice: g('rotate(-10 12 12)', rect(3.4, 3.4, 17.2, 17.2, W, 3.6) + dot(8, 8, 1.6, M) + dot(12, 12, 1.6, M) + dot(16, 16, 1.6, M) + dot(16, 8, 1.6, M) + dot(8, 16, 1.6, M)),
  m_revive: path('M9 2.4H15V9H21.6V15H15V21.6H9V15H2.4V9H9Z', G) + hi('M10.6 4.4V9.6'),
};

// mêmes dessins sous plusieurs noms (tomes = stats, boutique, quêtes)
const ALIAS = {
  t_power: 'st_dmg', t_haste: 'st_cd', t_agile: 'st_speed', t_vital: 'st_hp', t_regen: 'st_regen', t_magnet: 'st_magnet',
  t_area: 'st_area', t_multi: 'st_proj', t_luck: 'st_luck', t_wisdom: 'st_xp', t_crit: 'st_crit', t_armor: 'st_armor',
  sh_hp: 'st_hp', sh_dmg: 'st_dmg', sh_speed: 'st_speed', sh_magnet: 'st_magnet', sh_xp: 'st_xp', sh_luck: 'st_luck',
  sh_gold: 'i_coin', sh_reroll: 'm_dice', sh_revive: 'm_revive',
  q_kills: 'h_kills', q_bosses: 'i_crown', q_evos: 'm_star', q_wardens: 'st_armor', q_bombers: 'i_bomb', q_vendor: 's_shop_cart',
  q_lvl: 'h_level', q_wins_flag: 'q_wins', q_heat: 'h_heat', q_keys: 'h_keys', q_time: 'h_time', q_stage2: 'evo_flame', q_win_char: 'q_trophy',
  m_check: 'q_done', m_trophy: 'q_trophy', m_heat: 'h_heat', m_key: 'h_keys', m_skull: 'h_kills', m_gold: 'h_gold', m_credits: 'h_credits',
  m_magnet: 'st_magnet', m_level: 'h_level', m_ot: 'q_ot', m_sparkle: 'q_gold', m_coin: 'i_coin', m_pause: 'h_pause',
};
A.s_shop_cart = CART;
delete ALIAS.q_wins_flag;

// ombre portée dure : même dessin, tout en sombre, décalé
const shadow = s => s.replace(/fill="(?!none)[^"]*"/g, `fill="${D}"`).replace(/stroke="(?!none)[^"]*"/g, `stroke="${D}"`).replace(/ opacity="[^"]*"/g, '');
const wrap = s => `<g transform="translate(1.1 1.3)" fill="${D}" stroke="${D}" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round">${shadow(s)}</g>`
  + `<g stroke="${D}" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round">${s}</g>`;

export const ICONS = {};
for (const [k, v] of Object.entries(A)) ICONS[k] = wrap(v);
for (const [k, v] of Object.entries(ALIAS)) ICONS[k] = ICONS[v];
delete ICONS.s_shop_cart;
ICONS.q_vendor = wrap(CART);

export function icon(key, cls = '') {
  const m = ICONS[key];
  return m ? `<svg class="nbi ${cls}" viewBox="0 0 24 24" aria-hidden="true">${m}</svg>` : '';
}

// emoji → icône. Un même emoji sert parfois à plusieurs choses dans bonk.js : la clé retenue est la plus
// générique (celle qui convient dans un texte traduit) ; les champs `ic` doivent plutôt passer par l'id
// (w_<id>, evo_<id>, t_<clé>, i_<id>, q_<tk>…), qui distingue ces cas.
const E = {
  // armes
  '🔫': 'w_blaster', '🪐': 'w_orbit', '💠': 'w_pulse', '⚡': 'w_arc', '🥏': 'w_disc', '🗡️': 'w_blade', '🔦': 'w_beam', '🧨': 'w_mine',
  '🚀': 'w_rocket', '❄️': 'w_aura', '🎯': 'st_crit', '🌪️': 'w_tornado', '☣️': 'w_toxic', '🛸': 'w_drones',
  // évolutions
  '💫': 'evo_orbit', '🌩️': 'evo_arc', '⚙️': 'evo_disc', '⚔️': 'evo_blade', '☄️': 'evo_beam', '💣': 'i_bomb', '🎆': 'evo_rocket',
  '🌋': 'evo_flame', '🧊': 'evo_aura', '🔱': 'evo_rail', '🌀': 'evo_tornado', '🦠': 'evo_toxic', '🛰️': 'evo_drones',
  // tomes / stats
  '💥': 'st_dmg', '📕': 'st_dmg', '📗': 'st_cd', '👟': 'st_speed', '❤️': 'st_hp', '💚': 'st_regen', '🧲': 'st_magnet', '✳️': 'st_proj',
  '🍀': 'st_luck', '📘': 'st_xp', '🛡️': 'st_armor',
  // objets
  '🥾': 'i_boots', '☘️': 'i_clover', '🔋': 'i_battery', '🔍': 'i_lens', '💗': 'i_heart', '🪙': 'i_coin', '🦷': 'i_fang', '🔰': 'i_shield',
  '🌵': 'i_thorns', '🧥': 'i_cloak', '☢️': 'i_reactor', '👑': 'i_crown', '🪽': 'i_wings', '🔥': 'h_heat', '🪁': 'i_kite', '💉': 'i_adren',
  '🌟': 'i_star', '🪞': 'i_mirror', '🪓': 'i_axe', '⏳': 'i_chrono', '🛢️': 'i_keg', '🩸': 'i_siphon', '🏺': 'i_midas', '🗝️': 'i_key',
  // HUD / quêtes / boutique / textes
  '◆': 'h_gold', '◈': 'h_credits', '☠': 'h_kills', '☠️': 'h_kills', '🔑': 'h_keys', '⏱': 'h_time', '⏱️': 'h_time', '▲': 'h_level', '❚❚': 'h_pause',
  '⭐': 'm_star', '📦': 'q_chests', '✨': 'q_gold', '🛒': 'q_vendor', '🎒': 'q_itemdmg', '∞': 'q_ot', '🐇': 'q_hops', '🏁': 'q_wins',
  '🏆': 'q_trophy', '✓': 'q_done', '🎲': 'm_dice', '✚': 'm_revive', '★': 'm_elite', '🔒': 'm_lock', '🔓': 'm_unlock', '⚠': 'm_warn', '⚠️': 'm_warn',
  '⛔': 'm_ban', '📺': 'm_ad', '🎮': 'm_pad', '🔊': 'm_sound',
};
// variantes avec / sans sélecteur de présentation (U+FE0F)
for (const [k, v] of Object.entries(E)) { const bare = k.replace(/️/g, ''), full = bare.length && !k.includes('️') ? k + '️' : k; if (!(bare in E)) E[bare] = v; if (!(full in E)) E[full] = v; }
export const EMOJI_TO_KEY = E;
