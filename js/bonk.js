// NEON BONK — survivor-like 3D à la troisième personne (même boucle que Megabonk :
// courir/sauter/glisser, armes automatiques, XP → choix d'upgrades à rareté, coffres payés en or,
// sanctuaires, timer de 10 min, boss, portail), dans une esthétique synthwave néon.
import * as THREE from '../vendor/three.module.min.js';
import { Synthwave } from './synthwave.js';
const music = new Synthwave();
window.GAMES = window.GAMES || {};

const $ = id => document.getElementById(id);
const V3 = THREE.Vector3;
const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const HALF = 100;          // demi-taille de l'arène
const RUN_TIME = 600;      // 10 minutes
const MAX_ENEMIES = 420;

// ============================================================ données
const RAR = [
  { id: 'common', name: 'COMMUN', cls: 'r-common', col: '#aab0cc' },
  { id: 'rare', name: 'RARE', cls: 'r-rare', col: '#58a6ff' },
  { id: 'epic', name: 'ÉPIQUE', cls: 'r-epic', col: '#c98bff' },
  { id: 'legend', name: 'LÉGENDAIRE', cls: 'r-legend', col: '#ffc94d' },
];

const WEAPONS = {
  blaster: { name: 'Blaster', ic: '🔫', desc: 'Tire des traits laser sur les ennemis les plus proches.', cd: 0.6, dmg: 12, count: 1, area: 1, speed: 34, pierce: 0, ups: ['dmg', 'cd', 'count', 'pierce', 'speed'] },
  orbit:   { name: 'Satellites', ic: '🪐', desc: 'Des orbes tournent autour de toi et broient tout.', cd: 0, dmg: 9, count: 2, area: 1, speed: 3.2, ups: ['dmg', 'count', 'area', 'speed'] },
  pulse:   { name: 'Onde de choc', ic: '💠', desc: 'Une onde repousse et blesse tout ce qui t\'entoure.', cd: 2.4, dmg: 16, count: 1, area: 5.5, ups: ['dmg', 'cd', 'area'] },
  arc:     { name: 'Foudre', ic: '⚡', desc: 'La foudre frappe des ennemis au hasard et se propage.', cd: 1.5, dmg: 24, count: 2, area: 1.8, chain: 1, ups: ['dmg', 'cd', 'count', 'chain', 'area'] },
  disc:    { name: 'Disque', ic: '🥏', desc: 'Un disque boomerang qui traverse tout, aller et retour.', cd: 1.9, dmg: 18, count: 1, area: 1.3, speed: 20, ups: ['dmg', 'cd', 'count', 'area', 'speed'] },
  blade:   { name: 'Lame néon', ic: '🗡️', desc: 'Un large coup de lame devant toi.', cd: 1.0, dmg: 28, count: 1, area: 4, ups: ['dmg', 'cd', 'area', 'count'] },
  beam:    { name: 'Laser', ic: '🔦', desc: 'Un rayon continu qui suit l\'ennemi le plus proche et traverse tout.', cd: 0.16, dmg: 6, count: 1, area: 1, ups: ['dmg', 'cd', 'area', 'count'] },
  mine:    { name: 'Mines', ic: '🧨', desc: 'Sème des mines sous tes pas, qui explosent au contact.', cd: 1.3, dmg: 42, count: 1, area: 3, ups: ['dmg', 'cd', 'count', 'area'] },
  rocket:  { name: 'Missiles', ic: '🚀', desc: 'Des missiles à tête chercheuse qui explosent en zone.', cd: 2.6, dmg: 34, count: 1, area: 3.6, speed: 18, ups: ['dmg', 'cd', 'count', 'area'] },
};
// Évolutions : arme au niveau 8+ et tome associé possédé → le prochain coffre fait évoluer l'arme.
const EVO_LVL = 8;
const EVOS = {
  blaster: { tome: 'multi', name: 'Canon à rafales', ic: '💥', desc: 'dégâts ×2, +2 traits, +3 perforations', fx: w => { w.dmgM *= 2; w.count += 2; w.pierce += 3; } },
  orbit:   { tome: 'area', name: 'Anneau de Saturne', ic: '💫', desc: 'dégâts ×2, +3 orbes, +40 % de rayon', fx: w => { w.dmgM *= 2; w.count += 3; w.areaM += 0.4; } },
  pulse:   { tome: 'vital', name: 'Cœur pulsar', ic: '💗', desc: 'dégâts ×2, +40 % de zone, soigne 1 PV par ennemi touché', fx: w => { w.dmgM *= 2; w.areaM += 0.4; } },
  arc:     { tome: 'crit', name: 'Tempête', ic: '🌩️', desc: 'dégâts ×1,8, +2 éclairs, +3 rebonds', fx: w => { w.dmgM *= 1.8; w.count += 2; w.chain += 3; } },
  disc:    { tome: 'agile', name: 'Scie stellaire', ic: '⚙️', desc: 'dégâts ×2, +2 disques, +50 % de vitesse', fx: w => { w.dmgM *= 2; w.count += 2; w.speedM += 0.5; } },
  blade:   { tome: 'power', name: 'Lame d\'Oméga', ic: '⚔️', desc: 'dégâts ×2,5, frappe devant et derrière, +40 % de portée', fx: w => { w.dmgM *= 2.5; w.count += 1; w.areaM += 0.4; } },
  beam:    { tome: 'wisdom', name: 'Rayon de la mort', ic: '☄️', desc: 'dégâts ×2, +1 rayon, +50 % de portée et d\'épaisseur', fx: w => { w.dmgM *= 2; w.count += 1; w.areaM += 0.5; } },
  mine:    { tome: 'armor', name: 'Champ de mines', ic: '💣', desc: 'dégâts ×2, +2 mines par salve, +40 % d\'explosion', fx: w => { w.dmgM *= 2; w.count += 2; w.areaM += 0.4; } },
  rocket:  { tome: 'haste', name: 'Barrage', ic: '🎆', desc: 'dégâts ×1,6, +3 missiles, +30 % d\'explosion', fx: w => { w.dmgM *= 1.6; w.count += 3; w.areaM += 0.3; } },
};
const wName = w => w.evo ? EVOS[w.id].name : WEAPONS[w.id].name;
const wIc = w => w.evo ? EVOS[w.id].ic : WEAPONS[w.id].ic;
const evoReady = () => S.weapons.find(w => !w.evo && w.lvl >= EVO_LVL && S.tomes.some(t => t.id === EVOS[w.id].tome));

const UPV = {
  dmg:    { v: [0.18, 0.28, 0.42, 0.65], txt: v => `+${Math.round(v * 100)} % dégâts` },
  cd:     { v: [0.06, 0.09, 0.13, 0.18], txt: v => `−${Math.round(v * 100)} % recharge` },
  count:  { v: [1, 1, 1, 2], txt: v => `+${v} projectile${v > 1 ? 's' : ''}` },
  area:   { v: [0.12, 0.18, 0.26, 0.38], txt: v => `+${Math.round(v * 100)} % taille` },
  speed:  { v: [0.12, 0.18, 0.26, 0.38], txt: v => `+${Math.round(v * 100)} % vitesse` },
  pierce: { v: [1, 1, 2, 3], txt: v => `+${v} perforation` },
  chain:  { v: [1, 1, 2, 2], txt: v => `+${v} rebond` },
};

const TOMES = {
  power:  { name: 'Tome de Puissance', ic: '📕', stat: 'dmg', v: [0.1, 0.15, 0.22, 0.32], txt: v => `+${Math.round(v * 100)} % dégâts` },
  haste:  { name: 'Tome de Célérité', ic: '📗', stat: 'cd', v: [0.05, 0.08, 0.11, 0.15], txt: v => `−${Math.round(v * 100)} % recharge` },
  agile:  { name: 'Tome d\'Agilité', ic: '👟', stat: 'speed', v: [0.07, 0.1, 0.14, 0.2], txt: v => `+${Math.round(v * 100)} % vitesse` },
  vital:  { name: 'Tome de Vitalité', ic: '❤️', stat: 'hp', v: [15, 25, 35, 50], txt: v => `+${v} PV max` },
  regen:  { name: 'Tome de Régénération', ic: '💚', stat: 'regen', v: [0.4, 0.7, 1, 1.6], txt: v => `+${v} PV/s` },
  magnet: { name: 'Tome d\'Attraction', ic: '🧲', stat: 'magnet', v: [0.25, 0.35, 0.5, 0.7], txt: v => `+${Math.round(v * 100)} % portée de ramassage` },
  area:   { name: 'Tome d\'Expansion', ic: '🌀', stat: 'area', v: [0.08, 0.12, 0.18, 0.26], txt: v => `+${Math.round(v * 100)} % zone` },
  multi:  { name: 'Tome de Multiplicité', ic: '✳️', stat: 'proj', v: [1, 1, 1, 2], txt: v => `+${v} projectile à toutes les armes` },
  luck:   { name: 'Tome de Chance', ic: '🍀', stat: 'luck', v: [6, 9, 13, 20], txt: v => `+${v} chance` },
  wisdom: { name: 'Tome de Savoir', ic: '📘', stat: 'xp', v: [0.1, 0.15, 0.22, 0.32], txt: v => `+${Math.round(v * 100)} % XP` },
  crit:   { name: 'Tome de Précision', ic: '🎯', stat: 'crit', v: [0.04, 0.06, 0.09, 0.13], txt: v => `+${Math.round(v * 100)} % critique` },
  armor:  { name: 'Tome d\'Armure', ic: '🛡️', stat: 'armor', v: [0.04, 0.06, 0.09, 0.12], txt: v => `+${Math.round(v * 100)} % armure` },
};

const ITEMS = [
  { id: 'boots', r: 1, ic: '🥾', name: 'Bottes à ressort', desc: '+1 saut en l\'air', fx: s => s.jumps++ },
  { id: 'clover', r: 0, ic: '☘️', name: 'Trèfle', desc: '+10 chance', fx: s => s.luck += 10 },
  { id: 'battery', r: 0, ic: '🔋', name: 'Batterie', desc: '−7 % recharge', fx: s => s.cd *= 0.93 },
  { id: 'lens', r: 0, ic: '🔍', name: 'Lentille', desc: '+35 % dégâts critiques', fx: s => s.critMul += 0.35 },
  { id: 'heart', r: 0, ic: '💗', name: 'Cœur de néon', desc: '+20 PV max, soin complet', fx: (s, p) => { s.hp += 20; p.hp = s.hp; } },
  { id: 'coin', r: 0, ic: '🪙', name: 'Pièce porte-bonheur', desc: '+30 % or ramassé', fx: s => s.gold += 0.3 },
  { id: 'fang', r: 1, ic: '🦷', name: 'Croc de vampire', desc: '8 % de chance de soigner 2 PV par élimination', fx: s => s.vamp += 0.08 },
  { id: 'shield', r: 1, ic: '🔰', name: 'Bouclier prismatique', desc: 'Bloque un coup toutes les 12 s (cumul : plus souvent)', fx: s => s.shield = s.shield ? s.shield * 0.75 : 12 },
  { id: 'thorns', r: 1, ic: '🌵', name: 'Épines', desc: 'Renvoie 40 dégâts à qui te touche', fx: s => s.thorns += 40 },
  { id: 'cloak', r: 2, ic: '🧥', name: 'Cape de phase', desc: '+8 % d\'esquive', fx: s => s.dodge = Math.min(0.6, s.dodge + 0.08) },
  { id: 'bomb', r: 2, ic: '💣', name: 'Détonateur', desc: '12 % des ennemis explosent en mourant', fx: s => s.boom += 0.12 },
  { id: 'reactor', r: 3, ic: '☢️', name: 'Réacteur', desc: '+1 projectile, +10 % dégâts', fx: s => { s.proj++; s.dmg += 0.1; } },
  { id: 'crown', r: 3, ic: '👑', name: 'Couronne néon', desc: '+20 % dégâts, +20 % XP, +10 chance', fx: s => { s.dmg += 0.2; s.xp += 0.2; s.luck += 10; } },
  { id: 'wings', r: 2, ic: '🪽', name: 'Ailes', desc: '+15 % vitesse, +20 % hauteur de saut', fx: s => { s.speed += 0.15; s.jumpV *= 1.2; } },
];

const CHARS = [
  { id: 'glitch', name: 'Glitch', col: '#27e0ff', weapon: 'blaster', desc: 'Équilibré. Démarre avec le Blaster.', bonus: () => {} },
  { id: 'ronin', name: 'Ronin', col: '#ff3df0', weapon: 'blade', desc: 'Lame néon, +10 % vitesse.', bonus: s => s.speed += 0.1, unlock: { txt: 'Tuer 1 000 ennemis au total', test: m => m.totalKills >= 1000 } },
  { id: 'volt', name: 'Volt', col: '#ffe04d', weapon: 'arc', desc: 'Foudre, +15 chance.', bonus: s => s.luck += 15, unlock: { txt: 'Atteindre le niveau 15', test: m => m.maxLevel >= 15 } },
  { id: 'bastion', name: 'Bastion', col: '#7cff8a', weapon: 'pulse', desc: 'Onde de choc, +40 PV, +5 % armure.', bonus: s => { s.hp += 40; s.armor += 0.05; }, unlock: { txt: 'Survivre 5 minutes', test: m => m.bestTime >= 300 } },
  { id: 'nova', name: 'Nova', col: '#ff8a4d', weapon: 'rocket', desc: 'Missiles, +15 % zone.', bonus: s => s.area += 0.15, unlock: { txt: 'Vaincre la Sentinelle', test: m => m.bossKills >= 1 } },
];

const ETYPES = {
  drone: { geo: 'box', size: 0.9, hp: 9, speed: 4.4, dmg: 8, xp: 1, col: 0xff3df0, fly: true },
  spike: { geo: 'tetra', size: 0.85, hp: 6, speed: 6.5, dmg: 6, xp: 1, col: 0xffa020 },
  brute: { geo: 'octa', size: 1.7, hp: 55, speed: 3.1, dmg: 18, xp: 5, col: 0xff3050 },
  gunner:{ geo: 'ico', size: 1.1, hp: 24, speed: 3.4, dmg: 10, xp: 3, col: 0x27e0ff, ranged: true },
  charger:{ geo: 'dart', size: 1.2, hp: 28, speed: 3.2, dmg: 11, xp: 3, col: 0x7cff8a, charge: true },   // s'arrête, clignote, puis fonce tout droit
  splitter:{ geo: 'dodeca', size: 1.4, hp: 42, speed: 3.6, dmg: 12, xp: 4, col: 0xb98bff, split: true }, // se scinde en 3 à la mort
};
// Sanctuaires : charge (bénédiction), défi (2 élites → coffre gratuit), avarice (+or, +ennemis)
const SHRINES = {
  charge: { col: 0x7cff8a, css: '#7cff8a', n: 4 },
  chal: { col: 0xff3050, css: '#ff3050', n: 2 },
  greed: { col: 0xffc94d, css: '#ffc94d', n: 2 },
};

// Étapes : la run enchaîne la Grille puis la Fournaise ; la victoire vient après le 2e boss.
const STAGES = [
  { name: 'LA GRILLE', fog: 0x1a0630, lineA: [1, 0.18, 0.85], lineB: [0.15, 0.85, 1], wall: [1, 0.2, 0.85],
    sky: { top: [0.03, 0.01, 0.12], mid: [0.35, 0.05, 0.45], hor: [1, 0.25, 0.55], low: [0.1, 0.02, 0.19], sunA: [1, 0.15, 0.55], sunB: [1, 0.9, 0.3] },
    boxes: [0x8a2ad0, 0x5a3ae0, 0x3a6ae0], block: 0x7a2ab0, pillar: 0x27e0ff, edge: 0x9ff7ff, amp: 1, time: 600, m0: 0, mRate: 1,
    boss: { name: 'SENTINELLE', core: 0xff2d55, ring: 0xffc94d, ring2: 0xff3df0, hp: 1, speed: 1 } },
  { name: 'LA FOURNAISE', fog: 0x2a0a04, lineA: [1, 0.3, 0.05], lineB: [1, 0.85, 0.25], wall: [1, 0.45, 0.1],
    sky: { top: [0.07, 0.01, 0.02], mid: [0.45, 0.07, 0.04], hor: [1, 0.45, 0.12], low: [0.18, 0.03, 0.02], sunA: [1, 0.2, 0.05], sunB: [1, 0.95, 0.55] },
    boxes: [0xc0381a, 0xd06a1a, 0xa02a4a], block: 0xb03a2a, pillar: 0xffb020, edge: 0xffe0a0, amp: 1.45, time: 480, m0: 8, mRate: 1.2,
    boss: { name: 'HYDRE DE MAGMA', core: 0xffa020, ring: 0xff3050, ring2: 0xfff0a0, hp: 2.6, speed: 1.35 } },
];
const ST = () => STAGES[S.stage || 0];
// minute de difficulté : l'étape 2 démarre comme la 8e minute et s'intensifie plus vite
const diffMin = () => ST().m0 + (S.t - (S.stageT || 0)) / 60 * ST().mRate;

// ============================================================ méta (sauvegarde)
const META_KEY = 'neonbonk.meta.v1';
let META = { totalKills: 0, bossKills: 0, maxLevel: 0, bestTime: 0, bestKills: 0, runs: 0, wins: 0, sel: 'glitch', sens: 1, credits: 0, shop: {}, music: true };
try { Object.assign(META, JSON.parse(localStorage.getItem(META_KEY) || '{}')); } catch (e) {}
// Boutique permanente : crédits gagnés à chaque run, améliorations conservées d'une run à l'autre.
const SHOP = [
  { id: 'hp', ic: '❤️', name: 'Blindage', max: 5, base: 30, desc: l => `+${10 * l} PV max`, fx: (s, l) => s.hp += 10 * l },
  { id: 'dmg', ic: '💥', name: 'Surcharge', max: 5, base: 40, desc: l => `+${5 * l} % dégâts`, fx: (s, l) => s.dmg += 0.05 * l },
  { id: 'speed', ic: '👟', name: 'Servomoteurs', max: 5, base: 30, desc: l => `+${3 * l} % vitesse`, fx: (s, l) => s.speed += 0.03 * l },
  { id: 'magnet', ic: '🧲', name: 'Champ magnétique', max: 5, base: 25, desc: l => `+${10 * l} % ramassage`, fx: (s, l) => s.magnet += 0.1 * l },
  { id: 'xp', ic: '📘', name: 'Mémoire', max: 5, base: 40, desc: l => `+${5 * l} % XP`, fx: (s, l) => s.xp += 0.05 * l },
  { id: 'luck', ic: '🍀', name: 'Fortune', max: 5, base: 40, desc: l => `+${4 * l} chance`, fx: (s, l) => s.luck += 4 * l },
  { id: 'gold', ic: '🪙', name: 'Dividendes', max: 5, base: 35, desc: l => `+${20 * l} % or`, fx: (s, l) => s.gold += 0.2 * l },
  { id: 'reroll', ic: '🎲', name: 'Relances', max: 3, base: 60, desc: l => `+${l} relance${l > 1 ? 's' : ''} par run`, fx: () => {} },
  { id: 'revive', ic: '✚', name: 'Seconde vie', max: 1, base: 200, desc: () => 'Ressuscite une fois par run', fx: () => {} },
];
const shopLvl = id => (META.shop && META.shop[id]) || 0;
const shopCost = it => Math.round(it.base * Math.pow(1.8, shopLvl(it.id)));
function runCredits(S) { return Math.floor(S.kills / 15 + S.t / 10 + S.level * 2 + (S.stage || 0) * 120 + (S.bossDead ? 100 : 0) + (S.won ? 80 : 0)); }
const saveMeta = () => { if (window.PT_NOSAVE) return; try { localStorage.setItem(META_KEY, JSON.stringify(META)); } catch (e) {} };
const unlocked = c => !c.unlock || c.unlock.test(META);

// ============================================================ rendu : shaders
const fogU = { fogColor: { value: new THREE.Color(0x1a0630) }, fogNear: { value: 40 }, fogFar: { value: 115 } };
const NEON_VS = `
uniform vec3 uColor; varying vec3 vW; varying vec3 vC; varying float vD;
void main(){
  vec4 p = vec4(position,1.0);
  #ifdef USE_INSTANCING
  p = instanceMatrix * p;
  #endif
  vec4 wp = modelMatrix * p; vW = wp.xyz; vC = uColor;
  #ifdef USE_INSTANCING_COLOR
  vC = instanceColor;
  #endif
  vec4 mv = viewMatrix * wp; vD = -mv.z; gl_Position = projectionMatrix * mv;
}`;
const NEON_FS = `
uniform vec3 fogColor; uniform float fogNear; uniform float fogFar; uniform float uCore;
varying vec3 vW; varying vec3 vC; varying float vD;
void main(){
  vec3 n = normalize(cross(dFdx(vW), dFdy(vW)));
  vec3 v = normalize(cameraPosition - vW);
  float ndv = abs(dot(n, v));
  float rim = pow(1.0 - ndv, 1.6);
  vec3 c = vC * (uCore + 0.35 * ndv * ndv) + vC * rim * 1.5 + vec3(rim * rim * 0.35);
  c += vC * 0.25 * clamp(n.y, 0.0, 1.0);
  gl_FragColor = vec4(mix(c, fogColor, smoothstep(fogNear, fogFar, vD)), 1.0);
}`;
function neonMat(color, core = 0.22) {
  return new THREE.ShaderMaterial({
    uniforms: { ...fogU, uColor: { value: new THREE.Color(color) }, uCore: { value: core } },
    vertexShader: NEON_VS, fragmentShader: NEON_FS,
  });
}
const GROUND_VS = `varying vec3 vW; varying float vD;
void main(){ vec4 wp = modelMatrix * vec4(position,1.0); vW = wp.xyz; vec4 mv = viewMatrix * wp; vD = -mv.z; gl_Position = projectionMatrix * mv; }`;
const GROUND_FS = `
uniform vec3 fogColor; uniform float fogNear; uniform float fogFar; uniform float uTime; uniform vec3 uLA; uniform vec3 uLB;
varying vec3 vW; varying float vD;
float grid(vec2 p, float s){ vec2 q = p / s; vec2 g = abs(fract(q - 0.5) - 0.5) / fwidth(q); return 1.0 - min(min(g.x, g.y), 1.0); }
void main(){
  vec3 n = normalize(cross(dFdx(vW), dFdy(vW)));
  float h = clamp((vW.y + 3.0) / 11.0, 0.0, 1.0);
  vec3 lc = mix(uLA, uLB, h);
  float slope = clamp(abs(n.y), 0.0, 1.0);
  vec3 base = vec3(0.035, 0.01, 0.08) * (0.5 + 0.8 * slope) + lc * 0.03;
  float g1 = grid(vW.xz, 2.0), g2 = grid(vW.xz, 10.0);
  float pulse = 0.5 + 0.5 * sin(uTime * 1.5 - length(vW.xz) * 0.08);
  vec3 c = base + lc * g1 * 0.45 + lc * g2 * (0.7 + 0.4 * pulse);
  gl_FragColor = vec4(mix(c, fogColor, smoothstep(fogNear, fogFar, vD)), 1.0);
}`;
const SKY_VS = `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position.z = gl_Position.w; }`;
const SKY_FS = `
varying vec3 vDir; uniform float uTime; uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uHor; uniform vec3 uLow; uniform vec3 uSunA; uniform vec3 uSunB;
float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
void main(){
  vec3 d = normalize(vDir); float y = d.y;
  vec3 top = uTop, mid = uMid, hor = uHor, low = uLow;
  vec3 c = y > 0.0 ? mix(mix(hor, mid, smoothstep(0.0, 0.12, y)), top, smoothstep(0.1, 0.6, y)) : mix(hor * 0.4, low, smoothstep(0.0, 0.05, -y));
  vec3 sd = normalize(vec3(0.0, 0.1, -1.0));
  float a = acos(clamp(dot(d, sd), -1.0, 1.0));
  if (a < 0.24) {
    float t = (d.y - (sd.y - 0.24)) / 0.48;
    vec3 sc = mix(uSunA, uSunB, clamp(t, 0.0, 1.0));
    float stripes = step(0.5, fract(d.y * 60.0 + uTime * 0.2));
    float cut = (d.y < sd.y) ? stripes : 1.0;
    c = mix(c, sc, cut * smoothstep(0.24, 0.23, a));
  }
  c += uSunA * 0.3 * exp(-a * 4.0);
  vec3 q = d * 260.0; vec3 sp = floor(q); float s = hash(sp);
  float star = smoothstep(0.22, 0.0, length(fract(q) - 0.5));
  if (y > 0.1 && s > 0.992) c += vec3(0.85, 0.85, 1.0) * star * (0.55 + 0.45 * sin(uTime * 2.0 + s * 90.0)) * smoothstep(0.1, 0.35, y);
  gl_FragColor = vec4(c, 1.0);
}`;
const PART_VS = `attribute vec3 color; attribute float size; varying vec3 vC;
void main(){ vC = color; vec4 mv = modelViewMatrix * vec4(position,1.0);
  // taille bornée : sans ça, une particule collée à la caméra devient un sprite géant (coûteux, voire bloquant)
  gl_PointSize = -mv.z > 0.5 ? min(size * 300.0 / -mv.z, 48.0) : 0.0; gl_Position = projectionMatrix * mv; }`;
const PART_FS = `varying vec3 vC; void main(){ vec2 p = gl_PointCoord - 0.5; float d = length(p); if (d > 0.5) discard; float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(vC * a * 1.4, a); }`;

// ============================================================ état global
let renderer, scene, camera, clock, fx2, g2;
let terrainMesh, groundMat, skyMat, levelGroup;
let meshes = {};           // InstancedMesh par type
let partSys;
let player = null;
let W = 0, H = 0;
let S = null;              // état de la run
let inited = false, active = false, rafId = 0;
const keys = {};
const dummy = new THREE.Object3D();
const tmpC = new THREE.Color();
let TOUCH = matchMedia('(pointer:coarse)').matches;

// terrain paramétré par run
let TP = { a: 0, b: 0, c: 0, amp: 1 };
function terrainH(x, z) {
  let h = 2.8 * Math.sin(x * 0.042 + TP.a) * Math.cos(z * 0.037 - TP.b)
    + 1.7 * Math.sin(x * 0.093 + z * 0.071 + TP.c)
    + 1.0 * Math.cos(z * 0.13 + x * 0.02) * Math.sin(x * 0.11 + TP.a);
  const d = Math.hypot(x, z), f = Math.min(1, d / 20), sm = f * f * (3 - 2 * f);
  h *= sm * TP.amp;
  const e = Math.max(Math.abs(x), Math.abs(z));
  if (e > 82) h += (e - 82) * 0.35;
  return h;
}

// ============================================================ init moteur
function init() {
  const canvas = $('nb-canvas');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, TOUCH ? 1.25 : 1.5));
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(70, 1, 0.1, 600);
  clock = new THREE.Clock();

  skyMat = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uTop: { value: new V3() }, uMid: { value: new V3() }, uHor: { value: new V3() }, uLow: { value: new V3() }, uSunA: { value: new V3() }, uSunB: { value: new V3() } }, vertexShader: SKY_VS, fragmentShader: SKY_FS, side: THREE.BackSide, depthWrite: false });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(500, 32, 16), skyMat);
  sky.renderOrder = -1; sky.frustumCulled = false; scene.add(sky); scene.userData.sky = sky;

  groundMat = new THREE.ShaderMaterial({ uniforms: { ...fogU, uTime: { value: 0 }, uLA: { value: new V3() }, uLB: { value: new V3() } }, vertexShader: GROUND_VS, fragmentShader: GROUND_FS });
  const tg = new THREE.PlaneGeometry(HALF * 2 + 40, HALF * 2 + 40, 170, 170); tg.rotateX(-Math.PI / 2);
  terrainMesh = new THREE.Mesh(tg, groundMat); terrainMesh.frustumCulled = false; scene.add(terrainMesh);

  // barrière d'énergie
  const wallMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uWall: { value: new V3() } },
    vertexShader: 'varying vec2 vU; varying vec3 vW; void main(){ vU = uv; vW = (modelMatrix*vec4(position,1.)).xyz; gl_Position = projectionMatrix*viewMatrix*vec4(vW,1.); }',
    fragmentShader: 'varying vec2 vU; varying vec3 vW; uniform float uTime; uniform vec3 uWall; void main(){ float l = step(0.9, fract(vW.y*0.5 - uTime*0.4)) + step(0.96, fract((vW.x+vW.z)*0.25)); float a = (1.0-vU.y)*0.35 + l*0.25*(1.0-vU.y); gl_FragColor = vec4(uWall*a, a); }',
  });
  scene.userData.wallMat = wallMat;
  for (let i = 0; i < 4; i++) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2, 30), wallMat);
    const a = i * Math.PI / 2; w.position.set(Math.sin(a) * HALF, 13, Math.cos(a) * HALF); w.rotation.y = a; scene.add(w);
  }

  // géométries partagées
  const G = {
    box: new THREE.BoxGeometry(1, 1, 1), dart: new THREE.ConeGeometry(0.45, 1.3, 4).rotateX(-Math.PI / 2), dodeca: new THREE.DodecahedronGeometry(0.6), jar: new THREE.CylinderGeometry(0.35, 0.45, 0.8, 7), tetra: new THREE.TetrahedronGeometry(0.75), octa: new THREE.OctahedronGeometry(0.6),
    ico: new THREE.IcosahedronGeometry(0.6), gem: new THREE.OctahedronGeometry(0.28), coin: new THREE.CylinderGeometry(0.3, 0.3, 0.08, 10).rotateX(Math.PI / 2),
    bolt: new THREE.BoxGeometry(0.12, 0.12, 1.1), ball: new THREE.IcosahedronGeometry(0.3, 1), disc: new THREE.CylinderGeometry(0.6, 0.6, 0.1, 16),
    rocket: new THREE.ConeGeometry(0.2, 0.8, 6).rotateX(Math.PI / 2), heart: new THREE.OctahedronGeometry(0.4), bullet: new THREE.IcosahedronGeometry(0.35, 0),
  };
  const mk = (name, geo, col, n, core) => {
    const m = new THREE.InstancedMesh(geo, neonMat(0xffffff, core), n);
    m.frustumCulled = false; m.count = 0;
    for (let i = 0; i < n; i++) m.setColorAt(i, tmpC.set(col));
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(m); meshes[name] = m;
  };
  for (const [k, t] of Object.entries(ETYPES)) mk('e_' + k, G[t.geo], t.col, MAX_ENEMIES);
  mk('gem', G.gem, 0x27e0ff, 900, 0.6);
  mk('coin', G.coin, 0xffd84d, 250, 0.7);
  mk('heart', G.heart, 0xff4d8a, 30, 0.7);
  mk('magnetp', G.ico, 0x7cff8a, 10, 0.7);
  mk('jar', G.jar, 0xb98bff, 60, 0.5);
  mk('bolt', G.bolt, 0x7ff6ff, 400, 1.2);
  mk('orb', G.ball, 0xb98bff, 24, 1.0);
  mk('disc', G.disc, 0x7cff8a, 40, 0.9);
  mk('rocket', G.rocket, 0xff8a4d, 60, 1.0);
  mk('mine', new THREE.CylinderGeometry(0.35, 0.45, 0.18, 8), 0xff3050, 40, 0.8);
  // rayons du laser : un cœur blanc-rouge et un halo, en mélange additif
  scene.userData.beams = [];
  const beamGeo = new THREE.BoxGeometry(1, 1, 1).translate(0.5, 0, 0);
  for (let i = 0; i < 4; i++) {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: 0xffd0c8, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false })));
    const halo = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: 0xff3040, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
    halo.scale.set(1, 3.5, 3.5); g.add(halo);
    g.visible = false; g.frustumCulled = false; g.children.forEach(m => m.frustumCulled = false);
    scene.add(g); scene.userData.beams.push(g);
  }
  mk('bullet', G.bullet, 0xff3050, 400, 1.0);

  // particules
  const PN = 2500;
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(PN * 3), 3).setUsage(THREE.DynamicDrawUsage));
  pg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(PN * 3), 3).setUsage(THREE.DynamicDrawUsage));
  pg.setAttribute('size', new THREE.BufferAttribute(new Float32Array(PN), 1).setUsage(THREE.DynamicDrawUsage));
  const pts = new THREE.Points(pg, new THREE.ShaderMaterial({ vertexShader: PART_VS, fragmentShader: PART_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  pts.frustumCulled = false; scene.add(pts);
  partSys = { pts, n: PN, list: [] };

  // lignes (éclairs, lame) : pool de segments
  const LN = 600;
  const lg = new THREE.BufferGeometry();
  lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(LN * 6), 3).setUsage(THREE.DynamicDrawUsage));
  lg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(LN * 6), 3).setUsage(THREE.DynamicDrawUsage));
  const lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  lines.frustumCulled = false; scene.add(lines);
  scene.userData.lines = { mesh: lines, n: LN, segs: [] };

  // anneaux (onde de choc, sanctuaires, boss)
  scene.userData.ringGeo = new THREE.RingGeometry(0.92, 1, 64).rotateX(-Math.PI / 2);

  // joueur
  player = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 0.8, 4, 10), neonMat(0x27e0ff, 0.3)); body.position.y = 0.9; player.add(body);
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.18, 0.3), neonMat(0xffffff, 1.2)); visor.position.set(0, 1.3, -0.3); player.add(visor);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.04, 6, 24), neonMat(0xff3df0, 1)); halo.rotation.x = Math.PI / 2; halo.position.y = 2.0; player.add(halo);
  player.userData = { body, halo };
  scene.add(player);

  levelGroup = new THREE.Group(); scene.add(levelGroup);

  // overlay 2D (chiffres de dégâts, radar, vignette)
  fx2 = document.createElement('canvas'); fx2.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
  $('nb-canvas').after(fx2); g2 = fx2.getContext('2d');

  applyStage(0);
  bindInput();
  onResize();
  window.addEventListener('resize', onResize);
}

function applyStage(i) {
  const P = STAGES[i], u = skyMat.uniforms;
  for (const k of ['top', 'mid', 'hor', 'low', 'sunA', 'sunB']) u['u' + k[0].toUpperCase() + k.slice(1)].value.set(...P.sky[k]);
  groundMat.uniforms.uLA.value.set(...P.lineA); groundMat.uniforms.uLB.value.set(...P.lineB);
  scene.userData.wallMat.uniforms.uWall.value.set(...P.wall);
  fogU.fogColor.value.set(P.fog);
}
function onResize() {
  if (!renderer) return;
  const r = $('nb-root').getBoundingClientRect(); W = r.width; H = r.height;
  if (!W) return;
  renderer.setSize(W, H, false);
  camera.aspect = W / H; camera.updateProjectionMatrix();
  const d = Math.min(2, devicePixelRatio || 1); fx2.width = W * d; fx2.height = H * d; g2.setTransform(d, 0, 0, d, 0, 0);
}

// ============================================================ génération de niveau
function buildLevel() {
  const P = ST();
  TP = { a: rand(0, TAU), b: rand(0, TAU), c: rand(0, TAU), amp: P.amp };
  const pos = terrainMesh.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setY(i, terrainH(pos.getX(i), pos.getZ(i)));
  pos.needsUpdate = true; terrainMesh.geometry.computeBoundingSphere();

  levelGroup.traverse(o => {
    if (o.geometry && o.geometry !== scene.userData.ringGeo) o.geometry.dispose();
    if (o.material) o.material.dispose();
  });
  levelGroup.clear();
  S.obst = []; S.chests = []; S.shrines = [];
  const edgeMat = new THREE.LineBasicMaterial({ color: P.edge });
  const free = (x, z, r) => Math.hypot(x, z) > 14 && S.obst.every(o => Math.hypot(o.x - x, o.z - z) > (o.r || Math.max(o.hw, o.hd) * 1.42) + r);
  const addBox = (x, z, hw, hd, top, col) => {
    const bottom = Math.min(terrainH(x - hw, z - hd), terrainH(x + hw, z + hd), terrainH(x - hw, z + hd), terrainH(x + hw, z - hd)) - 2;
    const h = top - bottom;
    const geo = new THREE.BoxGeometry(hw * 2, h, hd * 2);
    const m = new THREE.Mesh(geo, neonMat(col, 0.45)); m.position.set(x, bottom + h / 2, z); levelGroup.add(m);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat); e.position.copy(m.position); levelGroup.add(e);
    S.obst.push({ kind: 'box', x, z, hw, hd, top });
  };
  // pyramides à étages (plateformes où grimper)
  for (let i = 0; i < 9; i++) {
    let x, z, t = 0; do { x = rand(-HALF + 15, HALF - 15); z = rand(-HALF + 15, HALF - 15); } while (!free(x, z, 9) && ++t < 40);
    const base = terrainH(x, z), steps = 2 + (Math.random() * 2 | 0), s0 = rand(5, 7);
    for (let k = 0; k < steps; k++) addBox(x, z, s0 - k * 1.7, s0 - k * 1.7, base + 1.6 + k * 1.6, P.boxes[k % 3]);
    if (Math.random() < 0.8) S.chests.push(mkChestData(x, z, base + 1.6 + (steps - 1) * 1.6));
  }
  // blocs isolés
  for (let i = 0; i < 16; i++) {
    let x, z, t = 0; do { x = rand(-HALF + 8, HALF - 8); z = rand(-HALF + 8, HALF - 8); } while (!free(x, z, 5) && ++t < 40);
    const hw = rand(1.5, 4), hd = rand(1.5, 4);
    addBox(x, z, hw, hd, terrainH(x, z) + rand(1.4, 3.5), P.block);
  }
  // piliers
  const pillarMat = neonMat(P.pillar, 0.15);
  for (let i = 0; i < 26; i++) {
    let x, z, t = 0; do { x = rand(-HALF + 5, HALF - 5); z = rand(-HALF + 5, HALF - 5); } while (!free(x, z, 3) && ++t < 40);
    const r = rand(0.8, 1.8), top = terrainH(x, z) + rand(5, 14);
    const geo = new THREE.CylinderGeometry(r, r * 1.15, top - terrainH(x, z) + 3, 6);
    const m = new THREE.Mesh(geo, pillarMat); m.position.set(x, (top + terrainH(x, z) - 3) / 2, z); levelGroup.add(m);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat); e.position.copy(m.position); levelGroup.add(e);
    S.obst.push({ kind: 'cyl', x, z, r, top });
  }
  // coffres au sol
  for (let tries = 0; S.chests.length < 16 && tries < 2000; tries++) {   // borné : jamais de boucle infinie à la génération
    const x = rand(-HALF + 6, HALF - 6), z = rand(-HALF + 6, HALF - 6);
    if (Math.hypot(x, z) < 12 || S.obst.some(o => insideObs(o, x, z, 1.2))) continue;
    S.chests.push(mkChestData(x, z, terrainH(x, z)));
  }
  S.chests.forEach(addChestMesh);
  // sanctuaires
  const kinds = Object.entries(SHRINES).flatMap(([k, v]) => Array(v.n).fill(k));
  for (const kind of kinds) {
    const col = SHRINES[kind].col;
    let x, z, t = 0; do { x = rand(-HALF + 12, HALF - 12); z = rand(-HALF + 12, HALF - 12); } while ((!free(x, z, 4) || Math.hypot(x, z) < 22 || S.shrines.some(o => Math.hypot(o.x - x, o.z - z) < 20)) && ++t < 60);
    const y = terrainH(x, z);
    const g = new THREE.Group();
    for (let k = 0; k < 4; k++) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 3.2, 5), neonMat(col, 0.5));
      const a = k * Math.PI / 2 + Math.PI / 4; p.position.set(Math.cos(a) * 3, 1.6, Math.sin(a) * 3); g.add(p);
    }
    const crystal = new THREE.Mesh(kind === 'chal' ? new THREE.TetrahedronGeometry(1) : kind === 'greed' ? new THREE.CylinderGeometry(0.8, 0.8, 0.25, 12).rotateX(Math.PI / 2) : new THREE.OctahedronGeometry(0.8), neonMat(col, 0.8)); crystal.position.y = 3; g.add(crystal);
    const ring = new THREE.Mesh(scene.userData.ringGeo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.6, side: THREE.DoubleSide })); ring.scale.setScalar(3.4); ring.position.y = 0.15; g.add(ring);
    const fill = new THREE.Mesh(new THREE.CircleGeometry(1, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.25 })); fill.position.y = 0.12; fill.scale.setScalar(0.001); g.add(fill);
    g.position.set(x, y, z); levelGroup.add(g);
    S.shrines.push({ kind, x, y, z, charge: 0, used: false, mesh: g, crystal, fill, ring });
  }
  // jarres : se brisent au contact et lâchent or / XP / soin
  S.jars = [];
  for (let i = 0; i < 40; i++) {
    const x = rand(-HALF + 5, HALF - 5), z = rand(-HALF + 5, HALF - 5);
    if (Math.hypot(x, z) < 8 || S.obst.some(o => insideObs(o, x, z, 0.8))) continue;
    S.jars.push({ x, z, y: terrainH(x, z), rot: rand(0, TAU), broken: false });
  }
}
function addChestMesh(c) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.8, 0.9), neonMat(c.free ? 0x7ff6ff : 0xffc94d, 0.35)); b.position.y = 0.4; g.add(b);
  const l = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.25, 1.0), neonMat(c.free ? 0x27e0ff : 0xff8a1a, 0.5)); l.position.y = 0.92; g.add(l);
  g.position.set(c.x, c.y, c.z); g.rotation.y = rand(0, TAU); levelGroup.add(g); c.mesh = g; c.lid = l;
}
function shrineReward(s) {
  const c = { x: s.x, y: s.y, z: s.z, open: false, free: true };
  addChestMesh(c); S.chests.push(c);
  burst(s.x, s.y + 2, s.z, 60, [1, 0.3, 0.4], 8, 0.7);
  msg('☠ Défi réussi : coffre gratuit au sanctuaire !', 3, '#7ff6ff'); sfx('chest');
}
function mkChestData(x, z, y) { return { x, y, z, open: false }; }
function insideObs(o, x, z, r) {
  if (o.kind === 'cyl') return Math.hypot(x - o.x, z - o.z) < o.r + r;
  return Math.abs(x - o.x) < o.hw + r && Math.abs(z - o.z) < o.hd + r;
}
function groundAt(x, z, y) {
  let g = terrainH(x, z);
  for (const o of S.obst) if (o.top > g && y >= o.top - 0.7 && insideObs(o, x, z, 0.25)) g = o.top;
  return g;
}
function pushOut(o, p, r) {
  if (o.kind === 'cyl') {
    const dx = p.x - o.x, dz = p.z - o.z, d = Math.hypot(dx, dz), m = o.r + r;
    if (d < m && d > 1e-4) { p.x = o.x + dx / d * m; p.z = o.z + dz / d * m; return true; }
    return false;
  }
  const dx = p.x - o.x, dz = p.z - o.z;
  const px = o.hw + r - Math.abs(dx), pz = o.hd + r - Math.abs(dz);
  if (px <= 0 || pz <= 0) return false;
  if (px < pz) p.x += Math.sign(dx || 1) * px; else p.z += Math.sign(dz || 1) * pz;
  return true;
}

// ============================================================ nouvelle run
function baseStats(ch) {
  const s = { hp: 100, regen: 0.3, armor: 0, speed: 1, dmg: 1, cd: 1, area: 1, proj: 0, magnet: 1, luck: 0, xp: 1, crit: 0.05, critMul: 2, jumps: 2, jumpV: 11, gold: 1, vamp: 0, shield: 0, thorns: 0, dodge: 0, boom: 0 };
  ch.bonus(s); return s;
}
function newRun() {
  const ch = CHARS.find(c => c.id === META.sel && unlocked(c)) || CHARS[0];
  S = {
    state: 'play', stage: 0, stageT: 0, ch, t: 0, time: RUN_TIME, kills: 0, gold: 0, level: 1, xp: 0, need: xpNeed(1), pending: 0, rerolls: 2,
    stats: null, weapons: [], tomes: [], items: {}, enemies: [], pickups: [], bolts: [], bullets: [], discs: [], rockets: [], mines: [], rings: [], dmgNums: [],
    spawnAcc: 0, nextSwarm: 90, eliteAt: [420, 240], boss: null, portal: null, won: false, dmgDealt: 0, chestsOpened: 0,
    iframe: 0, shieldT: 0, hurtFlash: 0, msgT: 0, chestCost: 12, orbPos: [], orbCount: 0, magnetAll: 0, bossDead: false,
    p: { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, onGround: true, jumps: 1, slide: 0, slideCd: 0, face: Math.PI, hp: 100 },
    cam: { yaw: 0, pitch: 0.42 },
  };
  S.stats = baseStats(ch);
  applyStage(0);
  for (const it of SHOP) if (shopLvl(it.id)) it.fx(S.stats, shopLvl(it.id));
  S.rerolls += shopLvl('reroll'); S.revives = shopLvl('revive');
  S.p.hp = S.stats.hp;
  buildLevel();
  S.p.y = terrainH(0, 0);
  addWeapon(ch.weapon);
  player.userData.body.material.uniforms.uColor.value.set(ch.col);
  player.visible = true;
  META.runs++; saveMeta();
  ['nb-menu', 'nb-end', 'nb-levelup', 'nb-pause'].forEach(id => $(id).classList.add('hidden'));
  $('nb-hud').classList.remove('hidden');
  $('nb-boss').classList.add('hidden');
  if (TOUCH) ['nb-joy', 'nb-jumpbtn', 'nb-actbtn'].forEach(id => $(id).classList.remove('hidden'));
  camY = S.p.y + 5;
  if (META.music) music.start(0);
  msg('Survis. Ramasse l\'XP. Ouvre les coffres.', 3.5);
  lockPointer();
  renderWeaponsHud();
}
const xpNeed = l => Math.floor(3 + (l - 1) * 2.4 + Math.pow(l - 1, 1.55) * 0.7);

function addWeapon(id) {
  const b = WEAPONS[id];
  S.weapons.push({ id, lvl: 1, dmgM: 1, cdM: 1, count: 0, areaM: 1, speedM: 1, pierce: 0, chain: 0, t: 0.3, ang: 0, hitT: new Map() });
}
const wStat = (w) => {
  const b = WEAPONS[w.id], s = S.stats;
  return {
    dmg: b.dmg * w.dmgM * s.dmg, cd: b.cd * w.cdM * s.cd, count: b.count + w.count + s.proj,
    area: b.area * w.areaM * s.area, speed: (b.speed || 1) * w.speedM, pierce: (b.pierce || 0) + w.pierce, chain: (b.chain || 0) + w.chain,
  };
};

// ============================================================ entrées
let lockWanted = false;
function lockPointer() {
  if (TOUCH) return;
  lockWanted = true;
  const c = $('nb-canvas');
  try { const p = c.requestPointerLock(); if (p && p.catch) p.catch(() => showClickToLock()); } catch (e) { showClickToLock(); }
}
function showClickToLock() { if (S && S.state === 'play' && !TOUCH) $('nb-click').classList.remove('hidden'); }
const locked = () => document.pointerLockElement === $('nb-canvas');

function bindInput() {
  addEventListener('keydown', e => {
    if (!active) return;
    keys[e.code] = true;
    if (!S) return;
    if (S.state === 'play') {
      if (e.code === 'Space') { jump(); e.preventDefault(); }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyC') slide();
      if (e.code === 'KeyE' || e.code === 'KeyF') interact();
      if (e.code === 'Escape' || e.code === 'KeyP') pause();
    } else if (S.state === 'levelup') {
      const i = ['Digit1', 'Digit2', 'Digit3', 'Numpad1', 'Numpad2', 'Numpad3'].indexOf(e.code) % 3;
      if (i >= 0 && curChoices[i]) pick(i);
      if (e.code === 'KeyR') reroll();
    } else if (S.state === 'pause' && (e.code === 'Escape' || e.code === 'KeyP')) resume();
  });
  addEventListener('keyup', e => { keys[e.code] = false; });
  document.addEventListener('pointerlockchange', () => {
    if (!active || !S) return;
    if (!locked() && S.state === 'play' && !TOUCH) pause();
    if (locked()) $('nb-click').classList.add('hidden');
  });
  document.addEventListener('mousemove', e => {
    if (!active || !S || S.state !== 'play') return;
    if (locked() || dragCam) {
      const k = 0.0024 * META.sens;
      S.cam.yaw -= e.movementX * k; S.cam.pitch = clamp(S.cam.pitch + e.movementY * k, -0.35, 1.25);
    }
  });
  let dragCam = false;
  const cv = $('nb-canvas');
  cv.addEventListener('mousedown', () => { if (S && S.state === 'play' && !locked() && !TOUCH) { lockPointer(); dragCam = true; } });
  addEventListener('mouseup', () => dragCam = false);
  $('nb-click').addEventListener('click', () => { $('nb-click').classList.add('hidden'); lockPointer(); });

  // tactile : joystick gauche dynamique, glisser à droite = caméra
  const root = $('nb-root'); let joyId = null, camId = null, jx = 0, jy = 0, lastCam = null;
  S_touch.joy = { x: 0, y: 0 };
  root.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'touch' || !S || S.state !== 'play') return;
    if (e.target.closest('button')) return;
    TOUCH = true;
    if (e.clientX < innerWidth * 0.45 && joyId === null) {
      joyId = e.pointerId; jx = e.clientX; jy = e.clientY;
      const j = $('nb-joy'); const r = root.getBoundingClientRect();
      j.style.left = (jx - r.left - 60) + 'px'; j.style.top = (jy - r.top - 60) + 'px'; j.style.bottom = 'auto';
    } else if (camId === null) { camId = e.pointerId; lastCam = { x: e.clientX, y: e.clientY }; }
  });
  root.addEventListener('pointermove', e => {
    if (e.pointerType !== 'touch' || !S) return;
    if (e.pointerId === joyId) {
      let dx = e.clientX - jx, dy = e.clientY - jy; const d = Math.hypot(dx, dy), m = 50;
      if (d > m) { dx *= m / d; dy *= m / d; }
      S_touch.joy = { x: dx / m, y: dy / m };
      $('nb-joyknob').style.transform = `translate(${dx}px,${dy}px)`;
    } else if (e.pointerId === camId && S.state === 'play') {
      const k = 0.006 * META.sens;
      S.cam.yaw -= (e.clientX - lastCam.x) * k; S.cam.pitch = clamp(S.cam.pitch + (e.clientY - lastCam.y) * k, -0.35, 1.25);
      lastCam = { x: e.clientX, y: e.clientY };
    }
  });
  const up = e => {
    if (e.pointerId === joyId) { joyId = null; S_touch.joy = { x: 0, y: 0 }; $('nb-joyknob').style.transform = ''; }
    if (e.pointerId === camId) camId = null;
  };
  root.addEventListener('pointerup', up); root.addEventListener('pointercancel', up);
  $('nb-jumpbtn').addEventListener('pointerdown', e => { e.preventDefault(); if (S && S.state === 'play') jump(); });
  $('nb-actbtn').addEventListener('pointerdown', e => { e.preventDefault(); if (S && S.state === 'play') { interact(); slide(); } });
}
const S_touch = { joy: { x: 0, y: 0 } };

function jump() {
  const p = S.p;
  if (p.onGround) { p.vy = S.stats.jumpV; p.onGround = false; p.jumps = S.stats.jumps - 1; sfx('jump'); }
  else if (p.jumps > 0) { p.vy = S.stats.jumpV * 0.92; p.jumps--; sfx('jump'); burst(p.x, p.y + 0.3, p.z, 12, [0.2, 0.9, 1], 4, 0.4); }
}
function slide() {
  const p = S.p;
  if (p.slideCd > 0) return;
  const sp = Math.hypot(p.vx, p.vz);
  let dx = p.vx, dz = p.vz;
  if (sp < 1) { dx = -Math.sin(S.cam.yaw); dz = -Math.cos(S.cam.yaw); } else { dx /= sp; dz /= sp; }
  const ns = Math.max(sp, 17 * S.stats.speed);
  p.vx = dx * ns; p.vz = dz * ns; p.slide = 0.55; p.slideCd = 0.9;
  if (!p.onGround) p.vy = Math.min(p.vy, -4);
  sfx('slide');
}

// ============================================================ audio
let actx = null;
const sfxLast = {};
function sfx(kind) {
  if (window.PT_MUTE) return;
  const now = performance.now();
  const gap = { hit: 40, kill: 45, xp: 35 }[kind] || 0;
  if (sfxLast[kind] && now - sfxLast[kind] < gap) return;
  sfxLast[kind] = now;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const t = actx.currentTime;
    const o = actx.createOscillator(), g = actx.createGain(); o.connect(g); g.connect(actx.destination);
    const P = {
      jump: ['square', 300, 600, 0.08, 0.03], slide: ['sawtooth', 200, 80, 0.2, 0.03], hit: ['square', 180, 90, 0.05, 0.015],
      kill: ['triangle', 520, 260, 0.06, 0.025], xp: ['sine', 900 + Math.random() * 300, 1400, 0.05, 0.02], hurt: ['sawtooth', 160, 60, 0.25, 0.08],
      level: ['triangle', 440, 1320, 0.4, 0.06], chest: ['triangle', 660, 1760, 0.5, 0.06], boom: ['sawtooth', 120, 30, 0.35, 0.05],
      zap: ['square', 1200, 200, 0.1, 0.02], shoot: ['square', 900, 500, 0.04, 0.01], boss: ['sawtooth', 70, 40, 1.2, 0.1],
    }[kind];
    if (!P) return;
    o.type = P[0]; o.frequency.setValueAtTime(P[1], t); o.frequency.exponentialRampToValueAtTime(P[2], t + P[3]);
    g.gain.setValueAtTime(P[4], t); g.gain.exponentialRampToValueAtTime(0.0001, t + P[3]);
    o.start(t); o.stop(t + P[3] + 0.02);
  } catch (e) {}
}

// ============================================================ spatial hash
const CELL = 4, grid = new Map(), usedCells = [];
const ck = (ix, iz) => (ix + 512) * 1024 + (iz + 512);
function rebuildGrid() {
  for (const k of usedCells) grid.get(k).length = 0;
  usedCells.length = 0;
  for (const e of S.enemies) {
    const k = ck(Math.floor(e.x / CELL), Math.floor(e.z / CELL));
    let a = grid.get(k); if (!a) { a = []; grid.set(k, a); }
    if (!a.length) usedCells.push(k);
    a.push(e);
  }
}
function near(x, z, r, cb) {
  const x0 = Math.floor((x - r) / CELL), x1 = Math.floor((x + r) / CELL), z0 = Math.floor((z - r) / CELL), z1 = Math.floor((z + r) / CELL);
  for (let ix = x0; ix <= x1; ix++) for (let iz = z0; iz <= z1; iz++) {
    const a = grid.get(ck(ix, iz)); if (!a) continue;
    for (let i = 0; i < a.length; i++) { const e = a[i]; if (e.hp > 0 && cb(e) === false) return; }
  }
}

// ============================================================ ennemis
function spawnEnemy(type, x, z, elite = false) {
  if (S.enemies.length >= MAX_ENEMIES) return null;
  const T = ETYPES[type], m = diffMin();
  const hpMul = (1 + m * 0.3 + m * m * 0.035) * (elite ? 14 : 1);
  const e = {
    type, T, x, z, y: terrainH(x, z) + (T.fly ? 1.6 : 0), hp: T.hp * hpMul, max: T.hp * hpMul,
    r: T.size * 0.6 * (elite ? 2 : 1), size: T.size * (elite ? 2 : 1), speed: T.speed * (elite ? 0.85 : 1) * (1 + m * 0.02),
    dmg: T.dmg * (1 + m * 0.08) * (elite ? 1.8 : 1), xp: Math.round(T.xp * (1 + m * 0.12) * (elite ? 25 : 1)), elite, flash: 0, kx: 0, kz: 0, rot: rand(0, TAU), shootT: rand(1, 3), spin: rand(1, 3),
  };
  S.enemies.push(e); return e;
}
function spawnAround(type, dMin, dMax, elite) {
  const p = S.p;
  for (let t = 0; t < 8; t++) {
    const a = rand(0, TAU), d = rand(dMin, dMax);
    const x = p.x + Math.cos(a) * d, z = p.z + Math.sin(a) * d;
    if (Math.abs(x) > HALF - 3 || Math.abs(z) > HALF - 3) continue;
    if (S.obst.some(o => o.kind === 'cyl' && insideObs(o, x, z, 1))) continue;
    return spawnEnemy(type, x, z, elite);
  }
  return null;
}
function pickType() {
  const m = diffMin(), r = Math.random();
  if (m > 5 && r < 0.07) return 'splitter';
  if (m > 3.5 && r < 0.12) return 'charger';
  if (m > 4 && r < 0.22) return 'gunner';
  if (m > 2.2 && r < 0.28) return 'brute';
  if (m > 0.8 && r < 0.6) return 'spike';
  return 'drone';
}
function spawning(dt) {
  const m = diffMin();
  let rate = 0.8 + m * 0.42 + m * m * 0.05 + (S.time <= 0 ? 4 + (-S.time / 60) * 4 : 0);
  const cap = 70 + m * 36;
  if (S.boss) rate *= 0.5;
  rate *= 1 + 0.25 * (S.greed || 0);
  S.spawnAcc += rate * dt;
  while (S.spawnAcc >= 1) { S.spawnAcc--; if (S.enemies.length < cap) spawnAround(pickType(), 26, 42); }
  if (S.t >= S.nextSwarm && !S.boss) {
    S.nextSwarm += 75;
    const n = Math.min(60, 18 + m * 5), type = m > 3 ? 'spike' : 'drone';
    for (let i = 0; i < n; i++) { const a = i / n * TAU; const x = S.p.x + Math.cos(a) * 24, z = S.p.z + Math.sin(a) * 24; if (Math.abs(x) < HALF - 2 && Math.abs(z) < HALF - 2) spawnEnemy(type, x, z); }
    msg('⚠ ENCERCLEMENT', 2);
  }
  if (S.eliteAt.length && S.time <= S.eliteAt[0]) {
    S.eliteAt.shift();
    spawnAround(Math.random() < 0.5 ? 'brute' : 'gunner', 22, 28, true);
    msg('★ UNE ÉLITE APPROCHE', 2.5);
  }
}

function updateEnemies(dt) {
  const p = S.p;
  for (const e of S.enemies) {
    if (e.hp <= 0) continue;
    let dx = p.x - e.x, dz = p.z - e.z; const d = Math.hypot(dx, dz) || 1; dx /= d; dz /= d;
    let sp = e.speed;
    if (e.T.ranged && d < 13) sp = d < 9 ? -e.speed * 0.6 : 0;
    if (e.T.charge) {
      e.cst = e.cst || 0; e.ct = (e.ct || 0) - dt;
      if (e.cst === 0 && d < 15 && e.ct <= 0) { e.cst = 1; e.ct = 0.7; e.cdx = dx; e.cdz = dz; }            // visée
      if (e.cst === 1) { sp = 0; e.flash = 0.6 + 0.4 * Math.sin(S.t * 40); if (e.ct <= 0) { e.cst = 2; e.ct = 0.8; } }
      else if (e.cst === 2) { dx = e.cdx; dz = e.cdz; sp = e.speed * 5; if (e.ct <= 0) { e.cst = 0; e.ct = 2.4; } }  // ruée
      e.face = Math.atan2(dx, dz);
    }
    e.x += (dx * sp + e.kx) * dt; e.z += (dz * sp + e.kz) * dt;
    e.kx *= Math.pow(0.02, dt); e.kz *= Math.pow(0.02, dt);
    // séparation
    near(e.x, e.z, e.r * 2, o => {
      if (o === e) return;
      const ox = e.x - o.x, oz = e.z - o.z, dd = ox * ox + oz * oz, m = e.r + o.r;
      if (dd < m * m && dd > 1e-6) { const k = (m - Math.sqrt(dd)) * 0.5 / Math.sqrt(dd); e.x += ox * k; e.z += oz * k; }
    });
    e.x = clamp(e.x, -HALF + 1, HALF - 1); e.z = clamp(e.z, -HALF + 1, HALF - 1);
    let gy = terrainH(e.x, e.z);
    if (e.T.fly) gy += 1.6 + Math.sin(S.t * 3 + e.rot) * 0.3;
    else for (const o of S.obst) {
      if (!insideObs(o, e.x, e.z, e.r * 0.5)) continue;
      if (o.top > e.y + 2.2 && o.kind === 'cyl' || o.top > e.y + 3.5) pushOut(o, e, e.r * 0.5);
      else if (o.top > gy) gy = o.top;
    }
    e.y += (gy - e.y) * Math.min(1, dt * (gy > e.y ? 9 : 14));
    e.rot += dt * e.spin; e.flash = Math.max(0, e.flash - dt * 6);
    // tir
    if (e.T.ranged && d < 26) {
      e.shootT -= dt;
      if (e.shootT <= 0) {
        // les balles sont la 1re cause de dégâts (tools/nb-balance.mjs) : plus lentes, plus rares, moins fortes
        e.shootT = e.elite ? 1.5 : 3.4;
        const n = e.elite ? 5 : 1;
        for (let k = 0; k < n; k++) fireBullet(e.x, e.y + 0.6, e.z, Math.atan2(dz, dx) + (k - (n - 1) / 2) * 0.22, 8.5, e.dmg * 0.75);
      }
    }
    // contact joueur
    const dy = (p.y + 0.9) - (e.y + (e.T.fly ? 0 : e.size * 0.4));
    if (d < e.r + 0.6 && Math.abs(dy) < e.size * 0.6 + 1) {
      if (hurt(e.dmg, e.elite ? 'élite' : e.type) && S.stats.thorns) damage(e, S.stats.thorns, false);
    }
  }
}

function fireBullet(x, y, z, ang, speed, dmg) {
  if (S.bullets.length > 380) return;
  S.bullets.push({ x, y, z, vx: Math.cos(ang) * speed, vz: Math.sin(ang) * speed, vy: 0, life: 4, dmg });
}

// ============================================================ dégâts
function damage(e, amount, canCrit = true, kx = 0, kz = 0) {
  if (e.hp <= 0) return;
  let crit = false;
  if (canCrit && Math.random() < S.stats.crit) { amount *= S.stats.critMul; crit = true; }
  e.hp -= amount; e.flash = 1; S.dmgDealt += amount;
  if (!e.boss) { e.kx += kx; e.kz += kz; }
  addNum(e.x, e.y + e.size + 0.3, e.z, amount, crit);
  sfx('hit');
  if (e.hp <= 0) kill(e);
}
function kill(e) {
  if (e.boss) { bossDeath(); return; }
  S.kills++;
  const col = new THREE.Color(e.T.col);
  burst(e.x, e.y + 0.5, e.z, e.elite ? 60 : 10, [col.r, col.g, col.b], e.elite ? 9 : 5, 0.5);
  dropXp(e.x, e.y + 0.4, e.z, e.xp);
  if (e.T.split && !e.child) for (let k = 0; k < 3; k++) { const c = spawnEnemy('spike', e.x + rand(-1, 1), e.z + rand(-1, 1)); if (c) { c.child = true; c.kx = rand(-8, 8); c.kz = rand(-8, 8); } }
  if (e.chal) { e.chal.left--; if (e.chal.left <= 0) shrineReward(e.chal); }
  const g = S.stats.gold * (1 + 0.5 * (S.greed || 0));
  if (e.elite) { for (let i = 0; i < 8; i++) addPickup('coin', e.x + rand(-1.5, 1.5), e.y + 0.5, e.z + rand(-1.5, 1.5), Math.ceil(3 * g)); addPickup('heart', e.x, e.y + 0.5, e.z, 30); }
  else if (Math.random() < 0.07) addPickup('coin', e.x, e.y + 0.4, e.z, Math.max(1, Math.round(rand(1, 3) * g)));
  if (Math.random() < 0.006) addPickup('heart', e.x, e.y + 0.4, e.z, 20);
  if (Math.random() < 0.0015) addPickup('magnetp', e.x, e.y + 0.4, e.z, 0);
  if (S.stats.vamp && Math.random() < S.stats.vamp) S.p.hp = Math.min(S.stats.hp, S.p.hp + 2);
  if (S.stats.boom && Math.random() < S.stats.boom) explode(e.x, e.y, e.z, 3 * S.stats.area, 20 * S.stats.dmg * (1 + S.t / 120), [1, 0.6, 0.2]);
  sfx('kill');
}
function dropXp(x, y, z, v) {
  if (S.pickups.length > 850) {  // fusion : on ajoute la valeur à une gemme existante
    for (let i = S.pickups.length - 1; i >= 0; i--) if (S.pickups[i].type === 'gem') { S.pickups[i].v += v; return; }
  }
  addPickup('gem', x, y, z, v);
}
function addPickup(type, x, y, z, v) { S.pickups.push({ type, x, y, z, v, vy: 4, vx: rand(-1.5, 1.5), vz: rand(-1.5, 1.5), pull: false, t: 0 }); }
function explode(x, y, z, r, dmg, col) {
  near(x, z, r + 1, e => { const dx = e.x - x, dz = e.z - z; const d = Math.hypot(dx, dz); if (d < r + e.r) damage(e, dmg, true, dx / (d || 1) * 6, dz / (d || 1) * 6); });
  if (S.boss && Math.hypot(S.boss.x - x, S.boss.z - z) < r + S.boss.r) damage(S.boss, dmg);
  burst(x, y + 0.5, z, 30, col, r * 2.2, 0.45);
  addRing(x, y + 0.2, z, r, col, 0.3);
  sfx('boom');
}
function hurt(d, src = '?') {
  if (S.iframe > 0 || S.state !== 'play') return false;
  const s = S.stats;
  if (s.shield && S.shieldT <= 0) { S.shieldT = s.shield; S.iframe = 0.5; addNum(S.p.x, S.p.y + 2.2, S.p.z, 'BLOQUÉ', true); return true; }
  if (s.dodge && Math.random() < s.dodge) { S.iframe = 0.3; addNum(S.p.x, S.p.y + 2.2, S.p.z, 'ESQUIVE', false); return false; }
  d *= 1 - Math.min(0.75, s.armor);
  S.p.hp -= d; S.iframe = 0.7; S.hurtFlash = 1; sfx('hurt');
  (S.hurtBy = S.hurtBy || {})[src] = (S.hurtBy[src] || 0) + d;   // statistiques d'équilibrage
  if (navigator.vibrate) navigator.vibrate(40);
  if (S.p.hp <= 0) {
    if (S.revives > 0) {
      // Seconde vie : soin à moitié, invulnérabilité, onde qui repousse tout
      S.revives--; S.p.hp = S.stats.hp * 0.5; S.iframe = 2.5;
      explode(S.p.x, S.p.y, S.p.z, 9, 50 * S.stats.dmg, [0.5, 1, 0.9]);
      near(S.p.x, S.p.z, 14, e => { const dx = e.x - S.p.x, dz = e.z - S.p.z, d = Math.hypot(dx, dz) || 1; e.kx += dx / d * 30; e.kz += dz / d * 30; });
      msg('✚ SECONDE VIE', 2, '#7cff8a');
    } else { S.p.hp = 0; endRun(false); }
  }
  return true;
}

// ============================================================ armes
function nearestEnemies(n, maxD = 40) {
  const p = S.p, res = [];
  for (const e of S.enemies) { if (e.hp <= 0) continue; const d = (e.x - p.x) ** 2 + (e.z - p.z) ** 2; if (d < maxD * maxD) res.push([d, e]); }
  if (S.boss && S.boss.hp > 0) res.push([(S.boss.x - p.x) ** 2 + (S.boss.z - p.z) ** 2, S.boss]);
  res.sort((a, b) => a[0] - b[0]);
  return res.slice(0, n).map(r => r[1]);
}
function randomEnemyNear(r) {
  const p = S.p, c = [];
  for (const e of S.enemies) if (e.hp > 0 && Math.abs(e.x - p.x) < r && Math.abs(e.z - p.z) < r) c.push(e);
  if (S.boss && S.boss.hp > 0 && Math.hypot(S.boss.x - p.x, S.boss.z - p.z) < r) c.push(S.boss);
  return c.length ? c[(Math.random() * c.length) | 0] : null;
}
function hitTest(x, y, z, r, cb) {
  near(x, z, r + 2, e => { const dx = e.x - x, dz = e.z - z, dy = (e.y + e.size * 0.4) - y; if (dx * dx + dz * dz < (r + e.r) ** 2 && Math.abs(dy) < e.size + r + 0.6) return cb(e); });
  const b = S.boss; if (b && b.hp > 0 && Math.hypot(b.x - x, b.z - z) < r + b.r && Math.abs(b.y - y) < b.r + 2) cb(b);
}
function facing() {
  const p = S.p, sp = Math.hypot(p.vx, p.vz);
  return sp > 0.5 ? Math.atan2(p.vz, p.vx) : Math.atan2(-Math.cos(S.cam.yaw), -Math.sin(S.cam.yaw));
}

function updateWeapons(dt) {
  S.beamVis = [];
  const p = S.p, px = p.x, py = p.y + 1, pz = p.z;
  let orbIdx = 0;
  for (const w of S.weapons) {
    const st = wStat(w);
    w.t -= dt;
    switch (w.id) {
      case 'blaster':
        if (w.t <= 0) {
          const tg = nearestEnemies(st.count, 34);
          if (!tg.length) { w.t = 0.1; break; }
          w.t = st.cd;
          for (let i = 0; i < st.count; i++) {
            const e = tg[i % tg.length];
            const ey = e.y + (e.boss ? 0 : e.size * 0.4);
            const dx = e.x - px, dy = ey - py, dz = e.z - pz, d = Math.hypot(dx, dy, dz) || 1;
            const spread = i >= tg.length ? (i - tg.length + 1) * 0.12 : 0;
            const a = Math.atan2(dz, dx) + spread;
            const hd = Math.hypot(dx, dz) / d;
            S.bolts.push({ x: px, y: py, z: pz, vx: Math.cos(a) * hd * st.speed, vy: dy / d * st.speed, vz: Math.sin(a) * hd * st.speed, life: 1.3, dmg: st.dmg, pierce: st.pierce, hit: new Set() });
          }
          sfx('shoot');
        }
        break;
      case 'orbit': {
        w.ang += dt * st.speed;
        const R = 2.6 * st.area, n = st.count;
        for (let i = 0; i < n; i++) {
          const a = w.ang + i * TAU / n, ox = px + Math.cos(a) * R, oz = pz + Math.sin(a) * R, oy = py + Math.sin(S.t * 2 + i) * 0.3;
          S.orbPos[orbIdx++] = [ox, oy, oz, 0.9 + 0.2 * st.area];
          hitTest(ox, oy, oz, 0.55 * st.area, e => {
            const last = w.hitT.get(e) || 0;
            if (S.t - last > 0.45) { w.hitT.set(e, S.t); const dx = e.x - px, dz = e.z - pz, d = Math.hypot(dx, dz) || 1; damage(e, st.dmg, true, dx / d * 8, dz / d * 8); }
          });
        }
        if (w.hitT.size > 600) w.hitT.clear();
        break;
      }
      case 'pulse':
        if (w.t <= 0) {
          w.t = st.cd;
          const R = st.area;
          let touched = 0;
          near(px, pz, R + 1, e => { const dx = e.x - px, dz = e.z - pz, d = Math.hypot(dx, dz) || 1; if (d < R + e.r) { touched++; damage(e, st.dmg, true, dx / d * 18, dz / d * 18); } });
          if (w.evo && touched) S.p.hp = Math.min(S.stats.hp, S.p.hp + Math.min(touched, 12));
          if (S.boss && Math.hypot(S.boss.x - px, S.boss.z - pz) < R + S.boss.r) damage(S.boss, st.dmg);
          addRing(px, p.y + 0.3, pz, R, [0.49, 1, 0.54], 0.35);
          burst(px, p.y + 0.5, pz, 20, [0.49, 1, 0.54], R * 1.5, 0.3);
        }
        break;
      case 'arc':
        if (w.t <= 0) {
          let any = false;
          for (let i = 0; i < st.count; i++) {
            let e = randomEnemyNear(20); if (!e) break; any = true;
            let x0 = e.x, y0 = e.y + 22, z0 = e.z;
            const hitSet = new Set();
            for (let c = 0; c <= st.chain && e; c++) {
              hitSet.add(e);
              const ey = e.y + (e.boss ? 0 : e.size * 0.4);
              bolt(x0, y0, z0, e.x, ey, e.z, [1, 0.95, 0.4]);
              const R = st.area;
              const ex = e.x, ez = e.z;
              near(ex, ez, R + 1, o => { if (Math.hypot(o.x - ex, o.z - ez) < R + o.r) damage(o, st.dmg * (c ? 0.7 : 1)); });
              if (e.boss) damage(e, st.dmg);
              burst(ex, ey, ez, 12, [1, 0.95, 0.4], 5, 0.3);
              x0 = ex; y0 = ey; z0 = ez;
              let nx = null, best = 64;
              near(ex, ez, 8, o => { if (!hitSet.has(o)) { const d = (o.x - ex) ** 2 + (o.z - ez) ** 2; if (d < best) { best = d; nx = o; } } });
              e = nx;
            }
          }
          w.t = any ? st.cd : 0.2;
          if (any) sfx('zap');
        }
        break;
      case 'disc':
        if (w.t <= 0) {
          const tg = nearestEnemies(st.count, 25);
          w.t = st.cd;
          for (let i = 0; i < st.count; i++) {
            const a = tg[i] ? Math.atan2(tg[i].z - pz, tg[i].x - px) : facing() + i * TAU / st.count;
            S.discs.push({ x: px, y: py, z: pz, a, t: 0, range: 13 * (0.8 + 0.2 * st.area), sp: st.speed, dmg: st.dmg, r: 0.9 * st.area, hitT: new Map(), back: false });
          }
        }
        break;
      case 'blade':
        if (w.t <= 0) {
          w.t = st.cd;
          const R = st.area, arc = 1.1 + 0.1 * st.area;
          for (let k = 0; k < st.count; k++) {
            const f = facing() + k * Math.PI;
            near(px, pz, R + 1, e => {
              const dx = e.x - px, dz = e.z - pz, d = Math.hypot(dx, dz);
              if (d > R + e.r || Math.abs(e.y - p.y) > 3) return;
              let da = Math.atan2(dz, dx) - f; da = Math.atan2(Math.sin(da), Math.cos(da));
              if (Math.abs(da) < arc) damage(e, st.dmg, true, dx / (d || 1) * 10, dz / (d || 1) * 10);
            });
            if (S.boss && Math.hypot(S.boss.x - px, S.boss.z - pz) < R + S.boss.r) damage(S.boss, st.dmg);
            // traînée visuelle
            for (let s = 0; s < 14; s++) {
              const a0 = f - arc + (2 * arc) * s / 14, a1 = f - arc + (2 * arc) * (s + 1) / 14;
              for (const rr of [R * 0.55, R * 0.8, R]) addSeg(px + Math.cos(a0) * rr, py, pz + Math.sin(a0) * rr, px + Math.cos(a1) * rr, py, pz + Math.sin(a1) * rr, [1, 0.3, 0.95], 0.16);
            }
          }
        }
        break;
      case 'rocket':
        if (w.t <= 0) {
          w.t = st.cd;
          for (let i = 0; i < st.count; i++) {
            const tgt = randomEnemyNear(28);
            const a = rand(0, TAU);
            S.rockets.push({ x: px, y: py + 0.5, z: pz, vx: Math.cos(a) * 4, vy: 9, vz: Math.sin(a) * 4, tgt, life: 4, dmg: st.dmg, r: st.area, sp: st.speed });
          }
        }
        break;
      case 'beam': {
        // rayon continu : l'angle suit l'ennemi le plus proche, dégâts par impulsion à tout ce qui est sur la ligne
        const len = 13 * st.area, width = 0.55 * st.area;
        const tg = nearestEnemies(1, len + 2)[0];
        const want = tg ? Math.atan2(tg.z - pz, tg.x - px) : facing();
        w.ang = w.ang === undefined ? want : lerpAngle(w.ang, want, Math.min(1, dt * 6));
        const tick = w.t <= 0; if (tick) w.t = st.cd;
        for (let k = 0; k < st.count; k++) {
          const a = w.ang + (k - (st.count - 1) / 2) * 0.5, cx = Math.cos(a), cz = Math.sin(a);
          const ex = px + cx * len, ez = pz + cz * len;
          S.beamVis.push({ x: px, y: py, z: pz, a, len, w: width });
          if (Math.random() < 0.5) spawnPart(px + cx * len * Math.random(), py, pz + cz * len * Math.random(), rand(-1, 1), rand(0, 2), rand(-1, 1), [1, 0.4, 0.3], 0.25, 0.3);
          if (!tick) continue;
          near(px + cx * len / 2, pz + cz * len / 2, len / 2 + 2, e => {
            const rx = e.x - px, rz = e.z - pz, along = rx * cx + rz * cz;
            if (along < 0 || along > len) return;
            if (Math.abs(rx * cz - rz * cx) < width + e.r) damage(e, st.dmg, true, cx * 1.5, cz * 1.5);
          });
          const B = S.boss;
          if (B && B.hp > 0) { const rx = B.x - px, rz = B.z - pz, al = rx * cx + rz * cz; if (al > 0 && al < len && Math.abs(rx * cz - rz * cx) < width + B.r) damage(B, st.dmg); }
        }
        break;
      }
      case 'mine':
        if (w.t <= 0) {
          w.t = st.cd;
          for (let i = 0; i < st.count; i++) {
            if (S.mines.length >= 30) S.mines.shift();
            const a = rand(0, TAU), d = i ? rand(1, 2.5) : 0;
            const mx = px + Math.cos(a) * d, mz = pz + Math.sin(a) * d;
            S.mines.push({ x: mx, z: mz, y: groundAt(mx, mz, p.y + 0.5), arm: 0.5, dmg: st.dmg, r: st.area, t: 0 });
          }
        }
        break;
    }
  }
  S.orbCount = orbIdx;
  // mines : armement puis explosion au contact
  for (let i = S.mines.length - 1; i >= 0; i--) {
    const m = S.mines[i]; m.arm -= dt; m.t += dt;
    if (m.arm > 0) continue;
    let boom = false;
    near(m.x, m.z, 2.5, e => { if (Math.hypot(e.x - m.x, e.z - m.z) < 1.1 + e.r && Math.abs(e.y - m.y) < 2.5) { boom = true; return false; } });
    if (!boom && S.boss && Math.hypot(S.boss.x - m.x, S.boss.z - m.z) < S.boss.r + 1.2) boom = true;
    if (boom) { explode(m.x, m.y, m.z, m.r, m.dmg, [1, 0.3, 0.3]); S.mines.splice(i, 1); }
  }
}

function updateProjectiles(dt) {
  // traits laser
  for (let i = S.bolts.length - 1; i >= 0; i--) {
    const b = S.bolts[i];
    b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt; b.life -= dt;
    let dead = b.life <= 0 || b.y < terrainH(b.x, b.z) - 0.2;
    if (!dead) hitTest(b.x, b.y, b.z, 0.35, e => {
      if (b.hit.has(e)) return;
      b.hit.add(e); damage(e, b.dmg, true, b.vx * 0.12, b.vz * 0.12);
      if (b.pierce-- <= 0) { dead = true; return false; }
    });
    if (dead) { S.bolts[i] = S.bolts[S.bolts.length - 1]; S.bolts.pop(); }
  }
  // disques
  const p = S.p;
  for (let i = S.discs.length - 1; i >= 0; i--) {
    const d = S.discs[i]; d.t += dt;
    if (!d.back) {
      d.x += Math.cos(d.a) * d.sp * dt; d.z += Math.sin(d.a) * d.sp * dt;
      if (Math.hypot(d.x - p.x, d.z - p.z) > d.range || d.t > 1.6) d.back = true;
    } else {
      const dx = p.x - d.x, dz = p.z - d.z, dist = Math.hypot(dx, dz) || 1;
      d.x += dx / dist * d.sp * 1.2 * dt; d.z += dz / dist * d.sp * 1.2 * dt;
      if (dist < 1 || d.t > 4) { S.discs[i] = S.discs[S.discs.length - 1]; S.discs.pop(); continue; }
    }
    d.y += ((p.y + 1) - d.y) * Math.min(1, dt * 5);
    hitTest(d.x, d.y, d.z, d.r, e => {
      const last = d.hitT.get(e); if (last !== undefined && d.t - last < 0.5) return;
      d.hitT.set(e, d.t); damage(e, d.dmg, true, Math.cos(d.a) * 5, Math.sin(d.a) * 5);
    });
  }
  // missiles
  for (let i = S.rockets.length - 1; i >= 0; i--) {
    const r = S.rockets[i]; r.life -= dt;
    if (!r.tgt || r.tgt.hp <= 0) r.tgt = randomEnemyNear(30);
    if (r.tgt) {
      const t = r.tgt, ty = t.y + (t.boss ? 0 : t.size * 0.4);
      const dx = t.x - r.x, dy = ty - r.y, dz = t.z - r.z, d = Math.hypot(dx, dy, dz) || 1;
      const k = Math.min(1, dt * 4);
      r.vx += (dx / d * r.sp - r.vx) * k; r.vy += (dy / d * r.sp - r.vy) * k; r.vz += (dz / d * r.sp - r.vz) * k;
    } else r.vy -= 10 * dt;
    r.x += r.vx * dt; r.y += r.vy * dt; r.z += r.vz * dt;
    if (Math.random() < 0.7) spawnPart(r.x, r.y, r.z, rand(-1, 1), rand(-1, 1), rand(-1, 1), [1, 0.5, 0.2], 0.35, 0.35);
    let boom = r.life <= 0 || r.y < terrainH(r.x, r.z);
    if (!boom) hitTest(r.x, r.y, r.z, 0.5, () => { boom = true; return false; });
    if (boom) { explode(r.x, r.y, r.z, r.r, r.dmg, [1, 0.55, 0.2]); S.rockets[i] = S.rockets[S.rockets.length - 1]; S.rockets.pop(); }
  }
  // balles ennemies
  for (let i = S.bullets.length - 1; i >= 0; i--) {
    const b = S.bullets[i]; b.life -= dt;
    b.x += b.vx * dt; b.z += b.vz * dt; b.y += b.vy * dt;
    const g = terrainH(b.x, b.z); if (b.y < g + 0.4) b.y = g + 0.4;
    let dead = b.life <= 0;
    if (Math.hypot(b.x - p.x, b.z - p.z) < 0.9 && Math.abs(b.y - (p.y + 0.9)) < 1.1) { hurt(b.dmg, 'balle'); dead = true; }
    if (dead) { S.bullets[i] = S.bullets[S.bullets.length - 1]; S.bullets.pop(); }
  }
}

// ============================================================ ramassage
function updatePickups(dt) {
  const p = S.p, R = 5.5 * S.stats.magnet;
  for (let i = S.pickups.length - 1; i >= 0; i--) {
    const k = S.pickups[i]; k.t += dt;
    const dx = p.x - k.x, dy = (p.y + 0.8) - k.y, dz = p.z - k.z, d = Math.hypot(dx, dy, dz) || 0.001;
    if (!k.pull && (d < R || S.magnetAll && k.type === 'gem')) k.pull = true;
    if (k.pull) {
      const sp = 14 + k.t * 6;
      k.x += dx / d * sp * dt; k.y += dy / d * sp * dt; k.z += dz / d * sp * dt;
    } else {
      k.vy -= 18 * dt; k.x += k.vx * dt; k.z += k.vz * dt; k.y += k.vy * dt;
      k.vx *= 0.94; k.vz *= 0.94;
      const g = groundAt(k.x, k.z, k.y) + 0.4; if (k.y < g) { k.y = g; k.vy = 0; }
    }
    if (d < 0.9) {
      if (k.type === 'gem') { S.xp += k.v * S.stats.xp; sfx('xp'); }
      else if (k.type === 'coin') { S.gold += k.v; }
      else if (k.type === 'heart') { S.p.hp = Math.min(S.stats.hp, S.p.hp + k.v); addNum(p.x, p.y + 2, p.z, '+' + k.v + ' PV', false, '#7cff8a'); }
      else if (k.type === 'magnetp') { S.magnetAll = 1.5; msg('🧲 Aimant !', 1.2); }
      S.pickups[i] = S.pickups[S.pickups.length - 1]; S.pickups.pop();
    }
  }
  if (S.magnetAll) { S.magnetAll -= dt; if (S.magnetAll <= 0) S.magnetAll = 0; }
  while (S.xp >= S.need) { S.xp -= S.need; S.level++; S.need = xpNeed(S.level); S.pending++; }
  if (S.pending > 0 && S.state === 'play') openLevelUp();
}

// ============================================================ level-up / choix
let curChoices = [], choiceMode = 'level';
function rollRarity(bonus = 0) {
  const L = S.stats.luck + bonus;
  const w = [Math.max(10, 62 - L * 0.5), 25 + L * 0.3, 10 + L * 0.15, 3 + L * 0.08];
  let r = Math.random() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < 4; i++) { r -= w[i]; if (r <= 0) return i; }
  return 0;
}
function makeWeaponUpgrade(w, rar) {
  const b = WEAPONS[w.id];
  const pool = b.ups.slice();
  const n = rar >= 2 ? 2 : 1, picks = [];
  while (picks.length < n && pool.length) {
    let i = (Math.random() * pool.length) | 0;
    if (pool[i] === 'count' && Math.random() < 0.55 && pool.length > 1) i = (i + 1) % pool.length; // +1 projectile un peu plus rare
    picks.push(pool.splice(i, 1)[0]);
  }
  return picks.map(k => ({ k, v: UPV[k].v[rar] }));
}
function buildChoices(mode) {
  const out = [], used = new Set();
  if (mode === 'shrine') {
    const keys = Object.keys(TOMES).filter(k => k !== 'multi');
    while (out.length < 3) { const k = keys[(Math.random() * keys.length) | 0]; if (used.has(k)) continue; used.add(k); out.push({ kind: 'stat', key: k, rar: rollRarity(40) }); }
    return out;
  }
  const pool = [];
  S.weapons.forEach(w => { if (w.lvl < 10) pool.push({ kind: 'wup', id: w.id, wt: 3 }); });
  if (S.weapons.length < 4) Object.keys(WEAPONS).forEach(id => { if (!S.weapons.find(w => w.id === id)) pool.push({ kind: 'wnew', id, wt: 1.3 }); });
  S.tomes.forEach(t => { if (t.lvl < 10) pool.push({ kind: 'tup', id: t.id, wt: 2 }); });
  if (S.tomes.length < 4) Object.keys(TOMES).forEach(id => { if (!S.tomes.find(t => t.id === id)) pool.push({ kind: 'tnew', id, wt: 1 }); });
  while (out.length < 3 && pool.length) {
    let r = Math.random() * pool.reduce((a, b) => a + b.wt, 0), i = 0;
    for (; i < pool.length - 1; i++) { r -= pool[i].wt; if (r <= 0) break; }
    const c = pool.splice(i, 1)[0];
    c.rar = c.kind === 'wnew' ? 0 : rollRarity();
    if (c.kind === 'wup') c.ups = makeWeaponUpgrade(S.weapons.find(w => w.id === c.id), c.rar);
    out.push(c);
  }
  while (out.length < 3) out.push({ kind: out.length % 2 ? 'gold' : 'heal', rar: 0 });
  return out;
}
function choiceHTML(c) {
  const R = RAR[c.rar];
  let ic, title, lines;
  if (c.kind === 'wnew') { const b = WEAPONS[c.id]; ic = b.ic; title = b.name; lines = ['Nouvelle arme', b.desc, `<span class="muted small">⭐ évolue avec ${TOMES[EVOS[c.id].tome].name}</span>`]; }
  else if (c.kind === 'wup') { const w = S.weapons.find(x => x.id === c.id); ic = wIc(w); title = `${wName(w)} → Nv ${w.lvl + 1}`; lines = c.ups.map(u => UPV[u.k].txt(u.v)); }
  else if (c.kind === 'tnew' || c.kind === 'tup' || c.kind === 'stat') {
    const t = TOMES[c.key || c.id]; ic = t.ic; const tt = S.tomes.find(x => x.id === c.id);
    title = c.kind === 'stat' ? t.name.replace('Tome', 'Bénédiction') : c.kind === 'tnew' ? t.name : `${t.name} → Nv ${tt.lvl + 1}`;
    lines = [t.txt(t.v[c.rar])];
    if (c.kind === 'tnew') lines.unshift('Nouveau tome');
    const evoW = Object.keys(EVOS).find(k => EVOS[k].tome === (c.key || c.id));
    if (c.kind === 'tnew' && evoW) lines.push(`<span class="muted small">⭐ fait évoluer ${WEAPONS[evoW].name}</span>`);
  } else if (c.kind === 'gold') { ic = '◆'; title = 'Bourse'; lines = ['+25 or']; }
  else { ic = '💗'; title = 'Soin'; lines = ['Restaure 50 % des PV']; }
  return `<div class="ic">${ic}</div><span class="tag">${R.name}</span><b>${title}</b>${lines.map(l => `<p>${l}</p>`).join('')}`;
}
function openLevelUp(mode = 'level') {
  choiceMode = mode;
  S.state = 'levelup';
  if (document.pointerLockElement) document.exitPointerLock();
  curChoices = buildChoices(mode);
  renderChoices();
  $('nb-levelup').querySelector('h2').textContent = mode === 'shrine' ? 'SANCTUAIRE' : `NIVEAU ${S.level - S.pending + 1}`;
  $('nb-reroll').style.display = mode === 'shrine' ? 'none' : '';
  $('nb-levelup').classList.remove('hidden');
  sfx('level');
}
function renderChoices() {
  const box = $('nb-choices'); box.innerHTML = '';
  curChoices.forEach((c, i) => {
    const b = document.createElement('button'); b.className = 'nb-choice ' + RAR[c.rar].cls; b.innerHTML = choiceHTML(c) + `<p class="muted small">[${i + 1}]</p>`;
    b.onclick = () => pick(i); box.appendChild(b);
  });
  $('nb-rerolls').textContent = S.rerolls;
  $('nb-reroll').disabled = S.rerolls <= 0;
}
function reroll() { if (S.rerolls <= 0 || choiceMode !== 'level') return; S.rerolls--; curChoices = buildChoices('level'); renderChoices(); }
function applyStat(key, v) {
  const s = S.stats;
  switch (TOMES[key].stat) {
    case 'dmg': s.dmg += v; break; case 'cd': s.cd *= 1 - v; break; case 'speed': s.speed += v; break;
    case 'hp': s.hp += v; S.p.hp += v; break; case 'regen': s.regen += v; break; case 'magnet': s.magnet += v; break;
    case 'area': s.area += v; break; case 'proj': s.proj += v; break; case 'luck': s.luck += v; break;
    case 'xp': s.xp += v; break; case 'crit': s.crit += v; break; case 'armor': s.armor += v; break;
  }
}
function pick(i) {
  const c = curChoices[i]; if (!c) return;
  if (c.kind === 'wnew') addWeapon(c.id);
  else if (c.kind === 'wup') {
    const w = S.weapons.find(x => x.id === c.id); w.lvl++;
    for (const u of c.ups) {
      if (u.k === 'dmg') w.dmgM += u.v; else if (u.k === 'cd') w.cdM *= 1 - u.v; else if (u.k === 'count') w.count += u.v;
      else if (u.k === 'area') w.areaM += u.v; else if (u.k === 'speed') w.speedM += u.v; else if (u.k === 'pierce') w.pierce += u.v; else if (u.k === 'chain') w.chain += u.v;
    }
  } else if (c.kind === 'tnew') { S.tomes.push({ id: c.id, lvl: 1 }); applyStat(c.id, TOMES[c.id].v[c.rar]); }
  else if (c.kind === 'tup') { S.tomes.find(t => t.id === c.id).lvl++; applyStat(c.id, TOMES[c.id].v[c.rar]); }
  else if (c.kind === 'stat') applyStat(c.key, TOMES[c.key].v[c.rar]);
  else if (c.kind === 'gold') S.gold += 25;
  else S.p.hp = Math.min(S.stats.hp, S.p.hp + S.stats.hp * 0.5);
  if (choiceMode === 'level') S.pending--;
  const rdy = evoReady();
  if (rdy && !rdy.told) { rdy.told = true; setTimeout(() => msg(`⭐ ${WEAPONS[rdy.id].name} peut évoluer : ouvre un coffre !`, 4, '#ffc94d'), 300); }
  renderWeaponsHud();
  if (choiceMode === 'level' && S.pending > 0) { openLevelUp('level'); return; }
  $('nb-levelup').classList.add('hidden');
  S.state = 'play'; S.iframe = Math.max(S.iframe, 0.6);
  lockPointer();
}

// ============================================================ interactions (coffres, sanctuaires, portail)
let promptTarget = null;
function updateInteract(dt) {
  const p = S.p; promptTarget = null; let txt = '';
  for (const c of S.chests) {
    if (c.open) continue;
    if (Math.hypot(c.x - p.x, c.z - p.z) < 2.2 && Math.abs(c.y - p.y) < 2) {
      promptTarget = c;
      txt = c.free ? '[E] Ouvrir le coffre — gratuit' : S.gold >= S.chestCost ? `[E] Ouvrir le coffre — ◆ ${S.chestCost}` : `Coffre — il faut ◆ ${S.chestCost} (tu as ${S.gold})`;
    }
  }
  if (S.portal && Math.hypot(S.portal.x - p.x, S.portal.z - p.z) < 3.5) { promptTarget = S.portal; txt = S.stage < STAGES.length - 1 ? '[E] Entrer dans le portail — étape suivante' : '[E] Entrer dans le portail — victoire'; }
  for (const s of S.shrines) {
    if (s.used || s.kind === 'charge') continue;
    if (Math.hypot(s.x - p.x, s.z - p.z) < 3.3 && Math.abs(s.y - p.y) < 3) {
      promptTarget = s;
      txt = s.kind === 'chal' ? '[E] Sanctuaire du défi — 2 élites, un coffre gratuit' : '[E] Sanctuaire d\'avarice — +50 % d\'or, +25 % d\'ennemis';
    }
  }
  // jarres
  for (const j of S.jars) {
    if (j.broken || Math.abs(j.x - p.x) > 1.2 || Math.abs(j.z - p.z) > 1.2 || Math.abs(j.y - p.y) > 1.5) continue;
    j.broken = true; burst(j.x, j.y + 0.5, j.z, 16, [0.72, 0.55, 1], 5, 0.4); sfx('hit');
    const r = Math.random();
    if (r < 0.5) for (let k = 0; k < 3; k++) addPickup('coin', j.x, j.y + 0.5, j.z, Math.max(1, Math.round(2 * S.stats.gold)));
    else if (r < 0.85) dropXp(j.x, j.y + 0.5, j.z, 5 + Math.round(diffMin() * 2));
    else addPickup('heart', j.x, j.y + 0.5, j.z, 25);
  }
  const pr = $('nb-prompt'); pr.textContent = txt; pr.classList.toggle('show', !!txt);
  for (const s of S.shrines) {
    s.crystal.rotation.y += dt * 1.5; s.crystal.position.y = 3 + Math.sin(S.t * 2) * 0.3;
    if (s.used || s.kind !== 'charge') continue;
    const inside = Math.hypot(s.x - p.x, s.z - p.z) < 3.3 && Math.abs(s.y - p.y) < 3;
    s.charge = clamp(s.charge + (inside ? dt / 3 : -dt / 6), 0, 1);
    s.fill.scale.setScalar(Math.max(0.001, s.charge * 3.3));
    if (s.charge >= 1) {
      s.used = true; s.crystal.visible = false; s.ring.material.opacity = 0.12; s.fill.visible = false;
      burst(s.x, s.y + 2, s.z, 60, [0.49, 1, 0.54], 8, 0.7);
      openLevelUp('shrine');
    }
  }
}
function interact() {
  const t = promptTarget; if (!t) return;
  if (t === S.portal) { if (S.stage < STAGES.length - 1) nextStage(); else endRun(true); return; }
  if (t.kind) {   // sanctuaire
    t.used = true; t.crystal.visible = false; t.ring.material.opacity = 0.12;
    if (t.kind === 'chal') {
      t.left = 0;
      for (let k = 0; k < 2; k++) {
        const a = rand(0, TAU), e = spawnEnemy(Math.random() < 0.5 ? 'brute' : 'charger', clamp(t.x + Math.cos(a) * 12, -HALF + 2, HALF - 2), clamp(t.z + Math.sin(a) * 12, -HALF + 2, HALF - 2), true);
        if (e) { e.chal = t; t.left++; }
      }
      if (!t.left) shrineReward(t); else msg('☠ Deux élites arrivent !', 2.5, '#ff3050');
    } else {
      S.greed = (S.greed || 0) + 1;
      msg(`🪙 Avarice ×${S.greed} : +50 % d'or, +25 % d'ennemis`, 3, '#ffc94d');
    }
    burst(t.x, t.y + 2, t.z, 40, t.kind === 'chal' ? [1, 0.2, 0.3] : [1, 0.8, 0.3], 7, 0.6); sfx('boss');
    return;
  }
  if (!t.free && S.gold < S.chestCost) { msg('Pas assez d\'or', 1); return; }
  S.chestsOpened++;
  if (!t.free) { S.gold -= S.chestCost; S.chestCost = Math.round(S.chestCost * 1.45 + 4); }
  t.open = true; t.lid.rotation.x = -1.2; t.lid.position.z = -0.4; t.lid.position.y = 1.1;
  const ev = evoReady();
  if (ev) {
    const E = EVOS[ev.id]; ev.evo = true; E.fx(ev);
    burst(t.x, t.y + 1, t.z, 120, [1, 0.85, 0.3], 10, 0.9); addRing(t.x, t.y + 0.3, t.z, 8, [1, 0.8, 0.3], 0.6);
    msg(`⭐ ÉVOLUTION : ${WEAPONS[ev.id].name} → ${E.ic} ${E.name}`, 4.5, '#ffc94d');
    sfx('level'); sfx('chest'); renderWeaponsHud(); return;
  }
  let rar = rollRarity(10), pool = ITEMS.filter(i => i.r === rar);
  while (!pool.length) { rar--; pool = ITEMS.filter(i => i.r === rar); }
  const it = pool[(Math.random() * pool.length) | 0];
  it.fx(S.stats, S.p);
  S.items[it.id] = (S.items[it.id] || 0) + 1;
  burst(t.x, t.y + 1, t.z, 50, [1, 0.8, 0.3], 7, 0.6);
  msg(`${it.ic} ${it.name} — ${it.desc}`, 3.5, RAR[it.r].col);
  sfx('chest'); renderWeaponsHud();
}

// ============================================================ changement d'étape
function nextStage() {
  // Le portail absorbe l'XP qui traîne, puis on reconstruit l'arène suivante en gardant tout le build.
  for (const k of S.pickups) if (k.type === 'gem') S.xp += k.v * S.stats.xp;
  S.rings.forEach(r => { if (r.mesh) { scene.remove(r.mesh); r.mesh.material.dispose(); } });
  S.enemies = []; S.pickups = []; S.bolts = []; S.bullets = []; S.discs = []; S.rockets = []; S.mines = []; S.rings = []; S.dmgNums = [];
  partSys.list.length = 0; scene.userData.lines.segs.length = 0;
  S.stage++; S.stageT = S.t; S.time = ST().time; S.boss = null; S.bossDead = false; S.portal = null;
  S.eliteAt = [ST().time - 120, ST().time - 300]; S.nextSwarm = S.t + 50; S.spawnAcc = 0;
  applyStage(S.stage); buildLevel();
  S.p.x = 0; S.p.z = 0; S.p.y = terrainH(0, 0) + 1; S.p.vx = S.p.vy = S.p.vz = 0; S.p.hp = S.stats.hp; S.iframe = 2;
  camY = S.p.y + 5;
  if (META.music) music.start(S.stage);
  msg(`ÉTAPE ${S.stage + 1} — ${ST().name}`, 4, '#' + new THREE.Color(...ST().lineB).getHexString());
  sfx('boss');
}

// ============================================================ boss
function spawnBoss() {
  const p = S.p; const a = rand(0, TAU);
  const x = clamp(p.x + Math.cos(a) * 30, -HALF + 10, HALF - 10), z = clamp(p.z + Math.sin(a) * 30, -HALF + 10, HALF - 10);
  const g = new THREE.Group();
  const B = ST().boss;
  const core = new THREE.Mesh(S.stage ? new THREE.IcosahedronGeometry(3.4, 0) : new THREE.DodecahedronGeometry(3), neonMat(B.core, 0.25)); g.add(core);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(4.6, 0.18, 6, 48), neonMat(B.ring, 1)); g.add(ring);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(5.4, 0.1, 6, 48), neonMat(B.ring2, 1)); g.add(ring2);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 8), neonMat(0xffffff, 1.4)); eye.position.z = 2.7; core.add(eye);
  levelGroup.add(g);
  const hp = (9000 + S.dmgDealt / Math.max(60, S.t) * 12) * B.hp;   // s'adapte à ta puissance de feu
  S.boss = { boss: true, x, z, y: terrainH(x, z) + 4, hp, max: hp, r: 3.2, size: 3, g, core, ring, ring2, atkT: 3, phase: 0, dash: 0, dvx: 0, dvz: 0, flash: 0 };
  $('nb-boss').classList.remove('hidden'); $('nb-boss').querySelector('span').textContent = B.name;
  msg(`☠ ${B.name} ARRIVE`, 3, '#ff4d6a'); sfx('boss');
}
function updateBoss(dt) {
  const b = S.boss; if (!b || b.hp <= 0) return;
  const p = S.p;
  let dx = p.x - b.x, dz = p.z - b.z; const d = Math.hypot(dx, dz) || 1; dx /= d; dz /= d;
  if (b.dash > 0) { b.dash -= dt; b.x += b.dvx * dt; b.z += b.dvz * dt; if (Math.random() < 0.8) burst(b.x, b.y, b.z, 3, [1, 0.2, 0.3], 3, 0.4); }
  else if (d > 6) { const sp = 3.8 * ST().boss.speed; b.x += dx * sp * dt; b.z += dz * sp * dt; }
  b.x = clamp(b.x, -HALF + 5, HALF - 5); b.z = clamp(b.z, -HALF + 5, HALF - 5);
  const gy = terrainH(b.x, b.z) + 4 + Math.sin(S.t * 1.5) * 0.5; b.y += (gy - b.y) * Math.min(1, dt * 3);
  b.g.position.set(b.x, b.y, b.z);
  b.core.rotation.y = Math.atan2(dx, dz); b.core.rotation.x = Math.sin(S.t) * 0.2;
  b.ring.rotation.x = S.t * 1.2; b.ring.rotation.y = S.t * 0.7; b.ring2.rotation.x = -S.t * 0.9; b.ring2.rotation.z = S.t * 0.5;
  b.flash = Math.max(0, b.flash - dt * 5);
  b.core.material.uniforms.uCore.value = 0.25 + b.flash * 1.5;
  const enraged = b.hp < b.max * 0.4;
  b.atkT -= dt * (enraged ? 1.5 : 1) * ST().boss.speed;
  if (b.atkT <= 0) {
    b.atkT = 2.6; b.phase = (b.phase + 1) % (S.stage ? 4 : 3);
    if (b.phase === 0) { const n = enraged ? 28 : 20, off = rand(0, TAU); for (let i = 0; i < n; i++) fireBullet(b.x, b.y - 1, b.z, off + i * TAU / n, 10, 14); }
    else if (b.phase === 1) { S.rings.push({ x: b.x, z: b.z, y: terrainH(b.x, b.z), r: 1, max: 45, sp: 16, dmg: 26, hostile: true, t: 0, col: [1, 0.2, 0.35], hitDone: false }); msg('SAUTE !', 1, '#ff4d6a'); }
    else if (b.phase === 2) { b.dash = 0.75; b.dvx = dx * 30; b.dvz = dz * 30; }
    else { for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; spawnEnemy('spike', clamp(b.x + Math.cos(a) * 5, -HALF + 2, HALF - 2), clamp(b.z + Math.sin(a) * 5, -HALF + 2, HALF - 2)); } msg('LA HYDRE ENGENDRE…', 1, '#ffb020'); }
    sfx('boom');
  }
  if (d < b.r + 0.8 && Math.abs(p.y + 1 - b.y) < 4) hurt(26, 'boss');
  const hp = $('nb-bossbar'); hp.style.width = (b.hp / b.max * 100) + '%';
}
function bossDeath() {
  const b = S.boss;
  burst(b.x, b.y, b.z, 250, [1, 0.3, 0.5], 18, 1.2);
  for (let i = 0; i < 40; i++) addPickup('coin', b.x + rand(-3, 3), b.y, b.z + rand(-3, 3), 5);
  dropXp(b.x, b.y, b.z, 300);
  explode(b.x, b.y - 3, b.z, 12, 99999, [1, 0.3, 0.5]);
  levelGroup.remove(b.g); S.boss = null; S.bossDead = true;
  META.bossKills++; if (S.stage) META.hydraKills = (META.hydraKills || 0) + 1; saveMeta();
  $('nb-boss').classList.add('hidden');
  // portail
  const x = b.x, z = b.z, y = terrainH(x, z);
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.25, 8, 48), neonMat(0x27e0ff, 1.2)); ring.position.y = 3; g.add(ring);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(2.3, 40), new THREE.MeshBasicMaterial({ color: 0xff3df0, transparent: true, opacity: 0.45, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); disc.position.y = 3; g.add(disc);
  g.position.set(x, y, z); levelGroup.add(g);
  S.portal = { x, y, z, g, ring };
  msg(S.stage < STAGES.length - 1 ? 'PORTAIL OUVERT — vers l\'étape suivante !' : 'PORTAIL FINAL — entre pour gagner !', 4, '#27e0ff');
}

// ============================================================ effets
function spawnPart(x, y, z, vx, vy, vz, col, size, life) {
  if (partSys.list.length >= partSys.n) partSys.list.shift();
  partSys.list.push({ x, y, z, vx, vy, vz, c: col, s: size, life, max: life });
}
function burst(x, y, z, n, col, sp, life) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, TAU), u = rand(-1, 1), s = rand(0.3, 1) * sp, q = Math.sqrt(1 - u * u);
    spawnPart(x, y, z, Math.cos(a) * q * s, u * s + sp * 0.3, Math.sin(a) * q * s, col, rand(0.2, 0.45), life * rand(0.6, 1.2));
  }
}
function addRing(x, y, z, r, col, life) {
  const m = new THREE.Mesh(scene.userData.ringGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(...col), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  m.position.set(x, y, z); scene.add(m);
  S.rings.push({ mesh: m, r, life, max: life });
}
function addSeg(x0, y0, z0, x1, y1, z1, col, life) {
  const L = scene.userData.lines;
  if (L.segs.length >= L.n) L.segs.shift();
  L.segs.push({ a: [x0, y0, z0], b: [x1, y1, z1], c: col, life, max: life });
}
function bolt(x0, y0, z0, x1, y1, z1, col) {
  let px = x0, py = y0, pz = z0; const n = 8;
  for (let i = 1; i <= n; i++) {
    const t = i / n, j = i === n ? 0 : 0.9;
    const nx = x0 + (x1 - x0) * t + rand(-j, j), ny = y0 + (y1 - y0) * t, nz = z0 + (z1 - z0) * t + rand(-j, j);
    addSeg(px, py, pz, nx, ny, nz, col, 0.18); px = nx; py = ny; pz = nz;
  }
}
function addNum(x, y, z, v, crit, col) {
  if (S.dmgNums.length > 70) S.dmgNums.shift();
  S.dmgNums.push({ x, y, z, v: typeof v === 'number' ? Math.round(v) : v, crit, t: 0, col, ox: rand(-0.4, 0.4) });
}
let msgTimer = 0;
function msg(t, dur = 2, col) { const m = $('nb-msg'); m.textContent = t; m.style.color = col || ''; m.classList.add('show'); msgTimer = dur; }

// ============================================================ boucle principale
function update(dt) {
  S.t += dt; S.time -= dt;
  const p = S.p, st = S.stats;
  // --- joueur
  let ix = 0, iy = 0;
  if (keys.KeyW || keys.ArrowUp) iy += 1;
  if (keys.KeyS || keys.ArrowDown) iy -= 1;
  if (keys.KeyA || keys.ArrowLeft) ix -= 1;
  if (keys.KeyD || keys.ArrowRight) ix += 1;
  if (S_touch.joy.x || S_touch.joy.y) { ix = S_touch.joy.x; iy = -S_touch.joy.y; }
  const yaw = S.cam.yaw, fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
  let wx = fx * iy + rx * ix, wz = fz * iy + rz * ix; const wl = Math.hypot(wx, wz);
  if (wl > 1) { wx /= wl; wz /= wl; }
  const maxSp = 8.5 * st.speed;
  p.slide = Math.max(0, p.slide - dt); p.slideCd = Math.max(0, p.slideCd - dt);
  const hs = Math.hypot(p.vx, p.vz);
  if (p.slide > 0) {
    // glisse : peu de friction, la pente accélère
    const e = 0.5, gx = (terrainH(p.x + e, p.z) - terrainH(p.x - e, p.z)) / (2 * e), gz = (terrainH(p.x, p.z + e) - terrainH(p.x, p.z - e)) / (2 * e);
    p.vx -= gx * 25 * dt; p.vz -= gz * 25 * dt;
    p.vx += wx * 8 * dt; p.vz += wz * 8 * dt;
    if (Math.random() < 0.8) spawnPart(p.x, p.y + 0.1, p.z, rand(-1, 1), rand(0, 2), rand(-1, 1), [0.3, 0.9, 1], 0.3, 0.4);
  } else if (p.onGround) {
    const k = Math.min(1, dt * (hs > maxSp * 1.1 ? 4 : 12));
    p.vx += (wx * maxSp - p.vx) * k; p.vz += (wz * maxSp - p.vz) * k;
  } else {
    // contrôle aérien, on conserve l'élan (bunny-hop)
    p.vx += wx * 30 * dt; p.vz += wz * 30 * dt;
    const n = Math.hypot(p.vx, p.vz), lim = Math.max(maxSp, hs);
    if (n > lim) { p.vx *= lim / n; p.vz *= lim / n; }
  }
  p.vy -= 30 * dt;
  p.x += p.vx * dt; p.z += p.vz * dt; p.y += p.vy * dt;
  p.x = clamp(p.x, -HALF + 1, HALF - 1); p.z = clamp(p.z, -HALF + 1, HALF - 1);
  for (const o of S.obst) if (p.y < o.top - 0.7 && insideObs(o, p.x, p.z, 0.5)) pushOut(o, p, 0.5);
  const g = groundAt(p.x, p.z, p.y);
  if (p.y <= g) {
    if (!p.onGround && p.vy < -18) burst(p.x, g + 0.1, p.z, 14, [1, 0.3, 0.9], 5, 0.35);
    p.y = g; p.vy = 0; p.onGround = true; p.jumps = st.jumps - 1;
  } else if (p.y > g + 0.05) {
    if (p.onGround && p.vy <= 0 && p.y - g < 0.6 && p.slide <= 0) { p.y = g; p.vy = 0; }   // colle aux descentes
    else p.onGround = false;
  }
  if (wl > 0.1 || hs > 1) p.face = Math.atan2(p.vx, p.vz);
  p.hp = Math.min(st.hp, p.hp + st.regen * dt);
  S.iframe = Math.max(0, S.iframe - dt); S.shieldT = Math.max(0, S.shieldT - dt);
  S.hurtFlash = Math.max(0, S.hurtFlash - dt * 2.5);

  // --- monde
  rebuildGrid();
  if (S.time <= 0 && !S.boss && !S.bossDead) spawnBoss();
  spawning(dt);
  updateEnemies(dt);
  updateBoss(dt);
  updateWeapons(dt);
  updateProjectiles(dt);
  // nettoyage des morts
  for (let i = S.enemies.length - 1; i >= 0; i--) if (S.enemies[i].hp <= 0) { S.enemies[i] = S.enemies[S.enemies.length - 1]; S.enemies.pop(); }
  // les ennemis trop loin sont ramenés près du joueur (évite de traîner une horde invisible)
  if (Math.random() < 0.3) for (const e of S.enemies) if (Math.abs(e.x - p.x) > 60 || Math.abs(e.z - p.z) > 60) {
    const a = rand(0, TAU); e.x = clamp(p.x + Math.cos(a) * 35, -HALF + 2, HALF - 2); e.z = clamp(p.z + Math.sin(a) * 35, -HALF + 2, HALF - 2); e.y = terrainH(e.x, e.z);
  }
  updatePickups(dt);
  updateInteract(dt);
  // anneaux
  for (let i = S.rings.length - 1; i >= 0; i--) {
    const r = S.rings[i];
    if (r.hostile) {
      r.r += r.sp * dt; r.t += dt;
      if (!r.mesh) { r.mesh = new THREE.Mesh(scene.userData.ringGeo, new THREE.MeshBasicMaterial({ color: 0xff2d55, transparent: true, opacity: 0.9, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); scene.add(r.mesh); }
      r.mesh.scale.set(r.r, 1, r.r); r.mesh.position.set(r.x, terrainH(p.x, p.z) + 0.3, r.z);
      const dp = Math.hypot(p.x - r.x, p.z - r.z);
      if (!r.hitDone && Math.abs(dp - r.r) < 0.9 && p.y - terrainH(p.x, p.z) < 0.9) { r.hitDone = true; hurt(r.dmg, 'onde'); }
      if (r.r > r.max) { scene.remove(r.mesh); r.mesh.material.dispose(); S.rings.splice(i, 1); }
    } else {
      r.life -= dt; const k = 1 - r.life / r.max;
      r.mesh.scale.set(r.r * (0.2 + k * 0.8), 1, r.r * (0.2 + k * 0.8)); r.mesh.material.opacity = 1 - k;
      if (r.life <= 0) { scene.remove(r.mesh); r.mesh.material.dispose(); S.rings.splice(i, 1); }
    }
  }
  if (S.portal) { S.portal.ring.rotation.y += dt; S.portal.g.children[1].rotation.y = S.portal.ring.rotation.y; if (Math.random() < 0.5) burst(S.portal.x, S.portal.y + 3, S.portal.z, 2, [0.2, 0.9, 1], 3, 0.8); }
  if (msgTimer > 0) { msgTimer -= dt; if (msgTimer <= 0) $('nb-msg').classList.remove('show'); }
}

// ============================================================ rendu
function syncMeshes(dt) {
  const t = S.t;
  // ennemis
  const counts = {}; for (const k in ETYPES) counts[k] = 0;
  for (const e of S.enemies) {
    const m = meshes['e_' + e.type], i = counts[e.type]++;
    const sc = e.size * (1 + e.flash * 0.15);
    dummy.position.set(e.x, e.y + (e.T.fly ? 0 : e.size * 0.45), e.z);
    if (e.T.charge) dummy.rotation.set(0, e.face || 0, 0);
    else dummy.rotation.set(e.type === 'drone' ? e.rot : 0, e.rot, e.type === 'drone' ? e.rot * 0.7 : 0);
    dummy.scale.setScalar(sc); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix);
    if (e.flash > 0.05) tmpC.setRGB(1, 1, 1).lerp(tmpC2.set(e.elite ? 0xffc94d : e.T.col), 1 - e.flash);
    else tmpC.set(e.elite ? 0xffc94d : e.T.col);
    m.setColorAt(i, tmpC);
  }
  for (const k in ETYPES) { const m = meshes['e_' + k]; m.count = counts[k]; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
  // ramassables
  const pc = { gem: 0, coin: 0, heart: 0, magnetp: 0 };
  for (const k of S.pickups) {
    const m = meshes[k.type], i = pc[k.type]++;
    if (i >= m.instanceMatrix.count) continue;
    dummy.position.set(k.x, k.y + Math.sin(t * 3 + k.x) * 0.1, k.z);
    dummy.rotation.set(0, t * 2 + k.x, 0);
    dummy.scale.setScalar(k.type === 'gem' ? (k.v >= 25 ? 2.2 : k.v >= 5 ? 1.5 : 1) : 1);
    dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix);
    if (k.type === 'gem') m.setColorAt(i, tmpC.set(k.v >= 25 ? 0xff3df0 : k.v >= 5 ? 0x7cff8a : 0x27e0ff));
  }
  { const m = meshes.jar; let n = 0; for (const j of S.jars || []) { if (j.broken || n >= m.instanceMatrix.count) continue; dummy.position.set(j.x, j.y + 0.4, j.z); dummy.rotation.set(0, j.rot, 0); dummy.scale.setScalar(1); dummy.updateMatrix(); m.setMatrixAt(n++, dummy.matrix); } m.count = n; m.instanceMatrix.needsUpdate = true; }
  for (const k in pc) { const m = meshes[k]; m.count = Math.min(pc[k], m.instanceMatrix.count); m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
  // projectiles
  const put = (name, list, fn) => { const m = meshes[name]; let n = 0; for (const o of list) { if (n >= m.instanceMatrix.count) break; fn(o); dummy.updateMatrix(); m.setMatrixAt(n++, dummy.matrix); } m.count = n; m.instanceMatrix.needsUpdate = true; };
  put('bolt', S.bolts, b => { dummy.position.set(b.x, b.y, b.z); dummy.lookAt(b.x + b.vx, b.y + b.vy, b.z + b.vz); dummy.scale.setScalar(1); });
  put('bullet', S.bullets, b => { dummy.position.set(b.x, b.y, b.z); dummy.rotation.set(t * 5, t * 3, 0); dummy.scale.setScalar(1); });
  put('disc', S.discs, d => { dummy.position.set(d.x, d.y, d.z); dummy.rotation.set(0, d.t * 20, 0); dummy.scale.setScalar(d.r / 0.9 * 1.2); });
  scene.userData.beams.forEach((g, i) => {
    const b = S.beamVis && S.beamVis[i];
    g.visible = !!b && S.state === 'play';
    if (!b) return;
    const th = 0.12 * (1 + 0.15 * Math.sin(t * 40 + i)) * b.w / 0.55;
    g.position.set(b.x, b.y, b.z); g.rotation.set(0, -b.a, 0); g.scale.set(b.len, th, th);
  });
  put('mine', S.mines, m => { dummy.position.set(m.x, m.y + 0.1, m.z); dummy.rotation.set(0, m.t, 0); dummy.scale.setScalar(m.arm > 0 ? 0.6 : 1 + 0.15 * Math.sin(m.t * 12)); });
  put('rocket', S.rockets, r => { dummy.position.set(r.x, r.y, r.z); dummy.lookAt(r.x + r.vx, r.y + r.vy, r.z + r.vz); dummy.scale.setScalar(1); });
  const om = meshes.orb; for (let i = 0; i < S.orbCount; i++) { const o = S.orbPos[i]; dummy.position.set(o[0], o[1], o[2]); dummy.rotation.set(t * 4, t * 3, 0); dummy.scale.setScalar(o[3]); dummy.updateMatrix(); om.setMatrixAt(i, dummy.matrix); }
  om.count = S.orbCount; om.instanceMatrix.needsUpdate = true;
  // particules
  const P = partSys, pa = P.pts.geometry.attributes;
  let n = 0;
  for (let i = P.list.length - 1; i >= 0; i--) {
    const q = P.list[i]; q.life -= dt;
    if (q.life <= 0) { P.list[i] = P.list[P.list.length - 1]; P.list.pop(); continue; }
    q.vy -= 9 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt; q.vx *= 0.97; q.vz *= 0.97;
    const k = q.life / q.max;
    pa.position.array[n * 3] = q.x; pa.position.array[n * 3 + 1] = q.y; pa.position.array[n * 3 + 2] = q.z;
    pa.color.array[n * 3] = q.c[0] * k; pa.color.array[n * 3 + 1] = q.c[1] * k; pa.color.array[n * 3 + 2] = q.c[2] * k;
    pa.size.array[n] = q.s * (0.5 + k * 0.5); n++;
  }
  P.pts.geometry.setDrawRange(0, n);
  pa.position.needsUpdate = pa.color.needsUpdate = pa.size.needsUpdate = true;
  // segments
  const L = scene.userData.lines, la = L.mesh.geometry.attributes; let s = 0;
  for (let i = L.segs.length - 1; i >= 0; i--) {
    const g = L.segs[i]; g.life -= dt;
    if (g.life <= 0) { L.segs[i] = L.segs[L.segs.length - 1]; L.segs.pop(); continue; }
    const k = g.life / g.max;
    la.position.array.set(g.a, s * 6); la.position.array.set(g.b, s * 6 + 3);
    for (let j = 0; j < 2; j++) { la.color.array[s * 6 + j * 3] = g.c[0] * k; la.color.array[s * 6 + j * 3 + 1] = g.c[1] * k; la.color.array[s * 6 + j * 3 + 2] = g.c[2] * k; }
    s++;
  }
  L.mesh.geometry.setDrawRange(0, s * 2); la.position.needsUpdate = la.color.needsUpdate = true;
  // joueur
  const p = S.p;
  player.position.set(p.x, p.y, p.z);
  player.rotation.y = lerpAngle(player.rotation.y, p.face + Math.PI, Math.min(1, dt * 12));
  const b = player.userData.body;
  b.rotation.x = p.slide > 0 ? -1.2 : 0; b.position.y = p.slide > 0 ? 0.5 : 0.9 + (p.onGround ? Math.abs(Math.sin(S.t * 12)) * Math.min(1, Math.hypot(p.vx, p.vz) / 8) * 0.12 : 0);
  player.userData.halo.rotation.z += dt * 3;
  player.visible = !(S.iframe > 0 && Math.floor(S.t * 20) % 2);
  // coffres
  for (const c of S.chests) if (!c.open) c.mesh.children[1].material.uniforms.uCore.value = 0.5 + 0.3 * Math.sin(t * 4 + c.x);
}
const tmpC2 = new THREE.Color();
function lerpAngle(a, b, k) { let d = b - a; d = Math.atan2(Math.sin(d), Math.cos(d)); return a + d * k; }

let camY = 0;
function updateCamera(dt) {
  const p = S.p, c = S.cam;
  const dist = 8.5, tx = p.x, ty = p.y + 1.8, tz = p.z;
  let cx = tx + Math.sin(c.yaw) * Math.cos(c.pitch) * dist, cy = ty + Math.sin(c.pitch) * dist, cz = tz + Math.cos(c.yaw) * Math.cos(c.pitch) * dist;
  let gy = terrainH(cx, cz) + 0.6;
  for (const o of S.obst) if (o.top + 0.6 > gy && insideObs(o, cx, cz, 0.4)) gy = o.top + 0.6;   // la caméra ne rentre pas dans les blocs
  camY += ((cy < gy ? gy : cy) - camY) * Math.min(1, dt * 10); cy = Math.max(camY, terrainH(cx, cz) + 0.4);
  camera.position.set(cx, cy, cz);
  camera.lookAt(tx, ty, tz);
  scene.userData.sky.position.copy(camera.position);
}

function draw2D(dt) {
  const ctx = g2; ctx.clearRect(0, 0, W, H);
  const v = new V3();
  ctx.textAlign = 'center';
  for (let i = S.dmgNums.length - 1; i >= 0; i--) {
    const d = S.dmgNums[i]; d.t += dt;
    if (d.t > 0.8) { S.dmgNums.splice(i, 1); continue; }
    v.set(d.x + d.ox, d.y + d.t * 1.8, d.z).project(camera);
    if (v.z > 1) continue;
    const x = (v.x * 0.5 + 0.5) * W, y = (-v.y * 0.5 + 0.5) * H;
    const a = 1 - Math.max(0, d.t - 0.5) / 0.3;
    ctx.globalAlpha = a;
    ctx.font = `900 ${d.crit ? 20 : 14}px system-ui,sans-serif`;
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.strokeText(d.v, x, y);
    ctx.fillStyle = d.col || (d.crit ? '#ffd84d' : '#ffffff'); ctx.fillText(d.v, x, y);
  }
  ctx.globalAlpha = 1;
  // barres de vie des élites
  for (const e of S.enemies) {
    if (!e.elite) continue;
    v.set(e.x, e.y + e.size * 1.3, e.z).project(camera); if (v.z > 1) continue;
    const x = (v.x * 0.5 + 0.5) * W, y = (-v.y * 0.5 + 0.5) * H;
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(x - 30, y, 60, 6); ctx.fillStyle = '#ffc94d'; ctx.fillRect(x - 30, y, 60 * e.hp / e.max, 6);
  }
  // radar
  const R = Math.min(70, W * 0.12), cx = W - R - 14, cy = R + 24;
  ctx.fillStyle = 'rgba(10,2,25,.6)'; ctx.strokeStyle = 'rgba(255,61,240,.6)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill(); ctx.stroke();
  const sc = R / 60, yaw = S.cam.yaw, cs = Math.cos(yaw), sn = Math.sin(yaw);
  const dot = (wx, wz, col, r) => {
    let dx = wx - S.p.x, dz = wz - S.p.z;
    const rx = dx * cs - dz * sn, rz = dx * sn + dz * cs;
    let px = rx * sc, pz = rz * sc; const l = Math.hypot(px, pz);
    if (l > R - 4) { px *= (R - 4) / l; pz *= (R - 4) / l; }
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx + px, cy + pz, r, 0, TAU); ctx.fill();
  };
  for (const e of S.enemies) if (Math.abs(e.x - S.p.x) < 60 && Math.abs(e.z - S.p.z) < 60) dot(e.x, e.z, e.elite ? '#ffc94d' : 'rgba(255,61,120,.7)', e.elite ? 3 : 1.3);
  for (const c of S.chests) if (!c.open) dot(c.x, c.z, '#ffd84d', 3);
  for (const s of S.shrines) if (!s.used) dot(s.x, s.z, SHRINES[s.kind].css, 3.5);
  if (S.boss) dot(S.boss.x, S.boss.z, '#ff2d55', 6);
  if (S.portal) dot(S.portal.x, S.portal.z, '#27e0ff', 6);
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(cx, cy - 6); ctx.lineTo(cx - 4, cy + 4); ctx.lineTo(cx + 4, cy + 4); ctx.fill();
  // vignette de dégâts
  if (S.hurtFlash > 0 || S.p.hp < S.stats.hp * 0.3) {
    const a = Math.max(S.hurtFlash * 0.55, S.p.hp < S.stats.hp * 0.3 ? 0.18 + 0.1 * Math.sin(S.t * 6) : 0);
    const gr = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.7);
    gr.addColorStop(0, 'rgba(255,0,60,0)'); gr.addColorStop(1, `rgba(255,0,60,${a})`);
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  }
}

let hudT = 0;
function updateHUD(dt) {
  hudT -= dt; if (hudT > 0) return; hudT = 0.1;
  $('nb-xpbar').style.width = (S.xp / S.need * 100) + '%';
  $('nb-level').textContent = 'NIV ' + S.level + ' · ÉTAPE ' + (S.stage + 1);
  $('nb-hpbar').style.width = (S.p.hp / S.stats.hp * 100) + '%';
  $('nb-hptext').textContent = `${Math.ceil(S.p.hp)}/${Math.round(S.stats.hp)}`;
  $('nb-gold').textContent = S.gold; $('nb-kills').textContent = S.kills;
  const tm = $('nb-timer');
  const tt = Math.abs(S.time), mm = Math.floor(tt / 60), ss = Math.floor(tt % 60);
  tm.textContent = (S.time < 0 ? '+' : '') + mm + ':' + String(ss).padStart(2, '0');
  tm.classList.toggle('boss', S.time < 0);
  // intensité musicale : monte avec la minute de difficulté, la foule proche et le boss
  let close = 0; for (const e of S.enemies) if (Math.abs(e.x - S.p.x) < 12 && Math.abs(e.z - S.p.z) < 12) close++;
  music.setLevel(S.boss || S.time < 0 ? 3 : Math.min(3, Math.floor(diffMin() / 2.5) + (close > 18 ? 1 : 0) + (S.t > 15 ? 1 : 0)));
}
function renderWeaponsHud() {
  const box = $('nb-weapons'); box.innerHTML = '';
  S.weapons.forEach(w => { const d = document.createElement('div'); d.innerHTML = `${wIc(w)}<small>${w.lvl}</small>`; d.style.borderColor = w.evo ? '#ffc94d' : '#ff3df0'; if (w.evo) d.style.boxShadow = '0 0 8px #ffc94d'; box.appendChild(d); });
  S.tomes.forEach(t => { const d = document.createElement('div'); d.innerHTML = `${TOMES[t.id].ic}<small>${t.lvl}</small>`; d.style.borderColor = '#27e0ff'; box.appendChild(d); });
  Object.entries(S.items).forEach(([id, n]) => { const it = ITEMS.find(i => i.id === id); const d = document.createElement('div'); d.innerHTML = `${it.ic}<small>${n > 1 ? n : ''}</small>`; d.style.borderColor = RAR[it.r].col; box.appendChild(d); });
}

function frame() {
  if (!active) return;
  rafId = requestAnimationFrame(frame);
  const dt = Math.min(0.05, clock.getDelta());
  const T = performance.now() / 1000;
  skyMat.uniforms.uTime.value = T; groundMat.uniforms.uTime.value = T; scene.userData.wallMat.uniforms.uTime.value = T;
  if (S && S.state === 'play') {
    // sous-pas pour garder une physique stable
    const steps = dt > 0.034 ? 2 : 1;
    for (let i = 0; i < steps && S.state === 'play'; i++) update(dt / steps);
  }
  if (S && S.state !== 'menu') {
    syncMeshes(S.state === 'play' ? dt : 0);
    updateCamera(dt);
    if (S.state === 'play') updateHUD(dt);
    draw2D(S.state === 'play' ? dt : 0);
  } else {
    // menu : caméra qui tourne au-dessus de la grille
    camera.position.set(Math.sin(T * 0.1) * 40, 14, Math.cos(T * 0.1) * 40); camera.lookAt(0, 0, 0);
    scene.userData.sky.position.copy(camera.position);
    if (g2) g2.clearRect(0, 0, W, H);
  }
  renderer.render(scene, camera);
}

// ============================================================ états / écrans
function pause() {
  if (!S || S.state !== 'play') return;
  S.state = 'pause';
  const b = $('nb-build'); b.innerHTML = '';
  S.weapons.forEach(w => b.insertAdjacentHTML('beforeend', `<span>${wIc(w)} ${wName(w)} Nv${w.lvl}${!w.evo ? ` <span class="muted">(⭐ Nv${EVO_LVL} + ${TOMES[EVOS[w.id].tome].ic})</span>` : ''}</span>`));
  S.tomes.forEach(t => b.insertAdjacentHTML('beforeend', `<span>${TOMES[t.id].ic} ${TOMES[t.id].name} Nv${t.lvl}</span>`));
  Object.entries(S.items).forEach(([id, n]) => { const it = ITEMS.find(i => i.id === id); b.insertAdjacentHTML('beforeend', `<span>${it.ic} ${it.name}${n > 1 ? ' ×' + n : ''}</span>`); });
  $('nb-pause').classList.remove('hidden');
  $('nb-music').checked = META.music;
  music.stop(0.3);
  if (document.pointerLockElement) document.exitPointerLock();
}
function resume() { if (!S || S.state !== 'pause') return; $('nb-pause').classList.add('hidden'); S.state = 'play'; clock.getDelta(); lockPointer(); if (META.music) music.start(S.stage); }
function endRun(win) {
  if (S.state === 'end') return;
  S.state = 'end'; S.won = win;
  music.stop(1.5);
  if (document.pointerLockElement) document.exitPointerLock();
  const surv = Math.floor(S.t);
  const before = CHARS.filter(unlocked).map(c => c.id);
  META.totalKills += S.kills; META.maxLevel = Math.max(META.maxLevel, S.level); META.bestTime = Math.max(META.bestTime, surv); META.bestKills = Math.max(META.bestKills, S.kills);
  if (win) META.wins++;
  const cr = runCredits(S); META.credits = (META.credits || 0) + cr;
  saveMeta();
  const newly = CHARS.filter(c => unlocked(c) && !before.includes(c.id));
  $('nb-endtitle').innerHTML = win ? '<span class="neon" style="font-size:30px">VICTOIRE</span>' : 'Tu as été désintégré';
  const row = (a, b) => `<div><span class="muted">${a}</span><b>${b}</b></div>`;
  $('nb-endstats').innerHTML = row('Temps', `${Math.floor(surv / 60)}:${String(surv % 60).padStart(2, '0')}`) + row('Niveau', S.level) + row('Éliminations', S.kills) + row('Dégâts', Math.round(S.dmgDealt).toLocaleString('fr-FR'))
    + row('Coffres', S.chestsOpened) + row('Personnage', S.ch.name) + row('Étape atteinte', (S.stage + 1) + ' / ' + STAGES.length)
    + `<div style="grid-column:1/-1;color:#7ff6ff;justify-content:center">◈ +${cr} crédits pour la boutique</div>`
    + (newly.length ? `<div style="grid-column:1/-1;color:#ffc94d;justify-content:center">🔓 Débloqué : ${newly.map(c => c.name).join(', ')}</div>` : '');
  $('nb-end').classList.remove('hidden');
  $('nb-hud').classList.add('hidden');
  ['nb-joy', 'nb-jumpbtn', 'nb-actbtn'].forEach(id => $(id).classList.add('hidden'));
  $('nb-prompt').classList.remove('show');
}
function toMenu() {
  music.stop(0.3);
  if (S) {
    S.rings.forEach(r => { if (r.mesh) { scene.remove(r.mesh); r.mesh.material.dispose(); } });
    for (const k in meshes) meshes[k].count = 0;
    scene.userData.beams.forEach(g => g.visible = false);
    partSys.list.length = 0; scene.userData.lines.segs.length = 0;
    player.visible = false;
    S.state = 'menu';
  }
  ['nb-end', 'nb-pause', 'nb-levelup'].forEach(id => $(id).classList.add('hidden'));
  $('nb-hud').classList.add('hidden');
  renderMenu();
  if (g2) g2.clearRect(0, 0, W, H);
  $('nb-menu').classList.remove('hidden');
  $('nb-menu').querySelector('.card').scrollTop = 0;
}
function renderMenu() {
  const box = $('nb-chars'); box.innerHTML = '';
  if (!CHARS.find(c => c.id === META.sel && unlocked(c))) META.sel = 'glitch';
  CHARS.forEach(c => {
    const u = unlocked(c);
    const b = document.createElement('button'); b.className = 'nb-char' + (c.id === META.sel ? ' on' : '') + (u ? '' : ' lock');
    b.innerHTML = `<b><span class="sw" style="background:${c.col};box-shadow:0 0 10px ${c.col}"></span>${c.name}</b><p>${u ? c.desc : '🔒 ' + c.unlock.txt}</p>`;
    b.onclick = () => { if (!u) return; META.sel = c.id; saveMeta(); renderMenu(); };
    box.appendChild(b);
  });
  $('nb-meta').textContent = META.runs ? `Runs : ${META.runs} · Victoires : ${META.wins} · Record : ${Math.floor(META.bestTime / 60)}:${String(META.bestTime % 60).padStart(2, '0')} · Niveau max : ${META.maxLevel} · Éliminations totales : ${META.totalKills}` : '';
  $('nb-sens').value = META.sens;
  $('nb-credits').textContent = META.credits || 0;
  const sh = $('nb-shop'); sh.innerHTML = '';
  for (const it of SHOP) {
    const l = shopLvl(it.id), c = shopCost(it), max = l >= it.max;
    const b = document.createElement('button');
    b.className = 'nb-sh ' + (max ? 'max' : (META.credits || 0) >= c ? 'can' : 'no');
    b.innerHTML = `<b>${it.ic} ${it.name} <span class="pips">${'■'.repeat(l)}${'□'.repeat(it.max - l)}</span></b><span class="cost">${max ? 'MAX' : '◈ ' + c}</span>`
      + `<span class="muted">${max ? it.desc(l) : (l ? it.desc(l) + ' → ' : '') + it.desc(l + 1)}</span>`;
    b.onclick = () => { if (max || (META.credits || 0) < c) return; META.credits -= c; META.shop[it.id] = l + 1; saveMeta(); sfx('chest'); renderMenu(); };
    sh.appendChild(b);
  }
}

$('nb-start').onclick = () => { S = null; newRun(); clock.getDelta(); };
$('nb-again').onclick = toMenu;
$('nb-resume').onclick = resume;
$('nb-quit').onclick = () => endRun(false);
$('nb-reroll').onclick = reroll;
$('nb-sens').oninput = e => { META.sens = +e.target.value; saveMeta(); };
$('nb-music').onchange = e => { META.music = e.target.checked; saveMeta(); };

// Boutons tactiles : pause via le timer
$('nb-timer').style.pointerEvents = 'auto';
$('nb-timer').addEventListener('click', () => pause());

addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
// Accès de débogage (console) à l'état de la run.
window.__nb = { get S() { return S; }, update, pick, keys, interact, jump, damage, spawnEnemy, music, newRun, addWeapon };

window.GAMES.bonk = {
  show() {
    active = true;
    if (!inited) {
      inited = true;
      try { init(); } catch (e) { $('nb-menu').querySelector('.card').innerHTML = '<h2>WebGL indisponible</h2><p class="muted">Ce jeu a besoin de WebGL. Essaie un navigateur récent.</p>'; console.error(e); return; }
      renderMenu();
    }
    requestAnimationFrame(() => { onResize(); clock.getDelta(); frame(); });
  },
  hide() {
    active = false; cancelAnimationFrame(rafId); music.stop(0.2);
    if (S && S.state === 'play') pause();
    for (const k in keys) keys[k] = false;
  },
};
