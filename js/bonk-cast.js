// Synth Horde — distribution « Living Sound » : héros skinné (neuf têtes sur un squelette), horde en pièces rigides
// animées dans le shader (une InstancedMesh par type : autant d'appels de dessin qu'avant), boss.
// Données : js/bonk-cast-data.js, généré par tools/cast/build.py (Blender).
import * as THREE from '../vendor/three.module.min.js';
import { CAST } from './bonk-cast-data.js';

// uniformes partagés : temps, pulsation de la musique (0–1), humeur du visage-oscilloscope (0 calme, 1 course, 2 touché, 3 mort)
export const CU = { uT: { value: 0 }, uBeat: { value: 0 }, uMood: { value: 0 }, uGlowK: { value: 1 } };   // uGlowK : budget lumineux (bonk.js)
let FOG = null;

const dec = s => { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
const cache = {};
function baseGeo(name) {
  if (cache[name]) return cache[name];
  const d = CAST[name], g = new THREE.BufferGeometry();
  const p16 = new Int16Array(dec(d.p).buffer), pos = new Float32Array(p16.length), k = d.q / 32767;
  for (let i = 0; i < p16.length; i++) pos[i] = p16[i] * k;
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const a = dec(d.a), n = d.n, ac = new Uint8Array(n * 4), ap = new Uint8Array(n * 4);
  for (let i = 0; i < n; i++) { ac.set(a.subarray(i * 8, i * 8 + 4), i * 4); ap.set(a.subarray(i * 8 + 4, i * 8 + 8), i * 4); }
  g.setAttribute('aC', new THREE.BufferAttribute(ac, 4, true));     // rgb (racine du linéaire), cœur / 5,1
  g.setAttribute('aP', new THREE.BufferAttribute(ap, 4, false));    // pièce, genre de surface, variante, —
  g.setIndex(new THREE.BufferAttribute(new Uint16Array(dec(d.i).buffer), 1));
  g.computeBoundingSphere();
  return (cache[name] = { g, d });
}

const COMMON = `
varying vec3 vW; varying vec3 vC; varying vec3 vL; varying float vD; varying float vCore; varying float vK; varying float vFl; varying float vEl;
vec3 rX(vec3 p, vec3 o, float a){ p -= o; float c = cos(a), s = sin(a); return o + vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z); }
vec3 rY(vec3 p, vec3 o, float a){ p -= o; float c = cos(a), s = sin(a); return o + vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z); }
vec3 rZ(vec3 p, vec3 o, float a){ p -= o; float c = cos(a), s = sin(a); return o + vec3(c * p.x - s * p.y, s * p.x + c * p.y, p.z); }
vec3 sc(vec3 p, vec3 o, vec3 s){ return o + (p - o) * s; }
`;
const FS = `
uniform vec3 fogColor; uniform float fogNear; uniform float fogFar; uniform float uAlpha; uniform float uT; uniform float uMood;
uniform vec3 uAcc; uniform vec3 uAcc2; uniform float uGhost; uniform float uBeat; uniform float uGlowK;
varying vec3 vW; varying vec3 vC; varying vec3 vL; varying float vD; varying float vCore; varying float vK; varying float vFl; varying float vEl;
float h3(vec3 p){ return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
void main(){
  if (uGhost > 0.5) { gl_FragColor = vec4(uAcc, 0.3); return; }
  vec3 n = normalize(cross(dFdx(vW), dFdy(vW)) + vec3(0.0, 1e-6, 0.0));
  vec3 v = normalize(cameraPosition - vW);
  float ndv = abs(dot(n, v)), rim = pow(max(1.0 - ndv, 0.0), 1.6);
  vec3 col = vC; float core = vCore;
  if (vK > 0.5 && vK < 1.5) col = uAcc;
  else if (vK > 4.5) col = uAcc2;
  else if (vK > 1.5 && vK < 2.5) {   // visage-oscilloscope (Glitch)
    vec2 q = vec2(vL.x / 0.24, (vL.y - 1.72) / 0.16);
    float f = uMood < 0.5 ? 3.0 : uMood < 1.5 ? 9.0 : 22.0, a = uMood < 2.5 ? 0.45 : 0.02;
    float w = uMood < 1.5 ? sin(q.x * f + uT * (uMood < 0.5 ? 3.0 : 12.0)) : sign(sin(q.x * f + uT * 30.0)) * fract(sin(floor(uT * 20.0) * 91.3) * 437.5);
    a *= 1.0 + uBeat * 0.7;   // l'onde bat la mesure
    float line = smoothstep(0.14, 0.0, abs(q.y - w * a));
    float eyes = uMood < 2.5 ? smoothstep(0.16, 0.1, length(vec2(abs(q.x) - 0.45, q.y - 0.45))) : 0.0;
    col = mix(vec3(0.02, 0.12, 0.1), vec3(0.3, 1.0, 0.8), max(line, eyes));
    if (uMood > 1.5 && uMood < 2.5) col = mix(col, vec3(1.0, 0.2, 0.3), 0.6);
    core = 1.6; rim *= 0.3;
  } else if (vK > 2.5 && vK < 3.5) {   // neige télé (Static)
    float nn = h3(floor(vL * 26.0) + floor(uT * 24.0)); float bar = step(0.92, fract(vL.y * 2.0 - uT * 1.7));
    col = vec3(nn * 0.85 + bar * 0.4) * vec3(0.85, 0.9, 1.1); core = 1.0;
  }
  col = mix(col, vec3(1.0, 0.79, 0.3), vEl * 0.3);
  col = mix(col, vec3(1.0), vFl * 0.55); core += vFl * 0.3;   // éclat de coup : teinte claire, pas un blanc saturé (le halo l'amplifie)
  vec3 c = col * (min(core, 3.6) * uGlowK + 0.35 * ndv * ndv) + col * rim * 1.5 + vec3(rim * rim * 0.35);   // cœur lumineux plafonné et modulé par la charge d'effets
  c += col * 0.25 * clamp(n.y, 0.0, 1.0);
  c += vec3(1.0, 0.75, 0.25) * rim * 1.6 * vEl;
  gl_FragColor = vec4(mix(c, fogColor, smoothstep(fogNear, fogFar, vD)), uAlpha);
}`;

// animation des pièces, par type (p : sommet, o : pivot de sa pièce, part, t, ph : phase de l'instance, st : état, beat)
const ANIM = {
  drone: `float j = floor(t * 12.0 + ph * 5.0), g = step(0.85, fract(sin(j * 12.9898) * 43758.5)); p.x += g * 0.06 * sin(j * 7.0); p.y += g * 0.04;`,
  spike: `if (part > 0.5) { float bl = step(0.94, fract(t * 0.45 + ph)); p = sc(p, o, vec3(1.0, 1.0 - bl * 0.9, 1.0)); }`,
  brute: `float s = t * 7.0 + ph; vec3 o0 = uPiv[0];
    if (part < 0.5) { p = rZ(p, o0, sin(s) * 0.1); p.y += abs(sin(s)) * 0.05; }
    else if (part < 1.5) { float b = pow(max(0.0, sin(t * 9.0 + ph)), 8.0) + beat * 0.6; p = sc(p, o, vec3(1.0 + b * 0.12, 1.0 + b * 0.12, 1.0 + b * 0.9)); p = rZ(p, o0, sin(s) * 0.1); p.y += abs(sin(s)) * 0.05; glow = b * 0.6; }
    else { float sd = part < 2.5 ? 1.0 : -1.0; p.y += max(0.0, sd * sin(s)) * 0.12; p = rX(p, o, sd * sin(s) * 0.35); }`,
  gunner: `if (part > 0.5 && part < 1.5) { p = rX(p, o, sin(t * 1.5 + ph) * 0.08 - st * 0.25); p = sc(p, o, vec3(1.0 + st * 0.18)); glow = st * 1.5; }
    else if (part > 1.5) p = rX(p, o, t * 4.0 + ph);`,
  charger: `if (part < 0.5) p = rY(p, o, t * 5.0 + ph);
    else if (part > 1.5) { float lunge = step(1.5, st), aim = step(0.5, st) * (1.0 - lunge);
      p = rY(p, o, sin(t * 1.1 + ph) * 0.15 * (1.0 - lunge)); p = rX(p, o, -aim * 0.35 + lunge * 0.45 + sin(t * 1.3 + ph) * 0.05); glow = aim * 2.0; }`,
  splitter: `float s = t * 8.0 + ph;
    if (part < 0.5) p = rZ(p, o, sin(s) * 0.06);
    else if (part < 2.5) { p = rZ(p, uPiv[0], sin(s) * 0.06); p = rZ(p, o, -t * 6.0); }
    else { float sd = part < 3.5 ? 1.0 : -1.0; p.y += max(0.0, sd * sin(s)) * 0.08; p = rX(p, o, sd * sin(s) * 0.4); }`,
  bomber: `if (part > 0.5) { p = rZ(p, o, sin(t * 6.0 + ph) * 0.1 * (1.0 - st)); p = sc(p, o, vec3(1.0 + st * 0.3 + sin(t * 40.0) * 0.04 * st)); p.x += sin(t * 70.0) * 0.02 * st; glow = st * 3.0; }`,
  blinker: `if (part > 0.5) { p = rZ(p, o, sin(t * (4.0 + st * 14.0) + ph) * (0.45 + st * 0.2)); glow = st * 1.5; }`,
  healer: `if (part > 0.5 && part < 5.5) { float hg = 0.35 + 0.65 * abs(sin(t * (2.5 + part * 0.9) + ph + part * 1.7)); hg = mix(hg, 1.25, st) + beat * 0.25; p = sc(p, o, vec3(1.0, hg, 1.0)); glow = st; }
    else if (part > 5.5) { p = rY(p, o, t * 2.0); p.y += sin(t * 3.0 + ph) * 0.05; p = sc(p, o, vec3(1.0 + st * 0.4)); glow = st * 2.0; }`,
  warden: `if (part > 0.5 && part < 1.5) { float b = pow(max(0.0, sin(t * 7.0 + ph)), 6.0) + beat * 0.7 + st; p = sc(p, o, vec3(1.0, 1.0, 1.0 + b * 1.2)); glow = st; }
    else if (part > 1.5) { p = rX(p, o, sin(t * 2.0 + ph) * 0.05 - st * 0.15); p.y += abs(sin(t * 4.0 + ph)) * 0.02; }`,
  tower: `if (part > 0.5) { p.z += beat * 0.03; glow = beat * 1.2; }`,
  boss0: `if (part > 0.5) { float b = pow(max(0.0, sin(t * 6.0)), 10.0) + beat * 0.8; p = sc(p, o, vec3(1.0 + b * 0.08 + st * 0.25)); glow = st * 1.2; }`,
  boss1: `if (part > 0.5) { p = rX(p, o, sin(t * 1.4 + part * 2.1) * 0.18 - st * 0.35); p = rZ(p, o, cos(t * 1.1 + part * 1.3) * 0.15); glow = st; } else glow = beat * 0.3;`,
  boss2: `if (part > 0.5 && part < 1.5) p.y += sin(t * 3.0 + p.x * 1.5) * 0.12 + beat * 0.1 * sin(p.x * 4.0);
    else if (part > 1.5) { p = rZ(p, o, t * 0.9); p = sc(p, o, vec3(1.0 + st * 0.25)); glow = st * 1.5; }`,
};
function creatureVS(type, np) {
  return `uniform float uT; uniform float uBeat; uniform vec3 uPiv[${np}];
attribute vec4 aC; attribute vec4 aP; attribute vec4 aI;
${COMMON}
void main(){
  vec3 p = position; float part = aP.x; vec3 o = uPiv[int(part + 0.5)];
  float t = uT, ph = aI.x, st = aI.w, beat = uBeat, glow = 0.0;
  ${ANIM[type] || ''}
  vL = position; vK = aP.y; vC = aC.rgb * aC.rgb; vCore = aC.a * 5.1 + glow; vFl = aI.y; vEl = aI.z;
  if (vK > 3.5 && vK < 4.5) vCore += beat * 0.9;
  vec4 w = modelMatrix * instanceMatrix * vec4(p, 1.0); vW = w.xyz; vec4 mv = viewMatrix * w; vD = -mv.z; gl_Position = projectionMatrix * mv;
}`;
}
function uniforms(extra) {
  return { ...FOG, uT: CU.uT, uBeat: CU.uBeat, uMood: CU.uMood, uGlowK: CU.uGlowK, uAlpha: { value: 1 }, uAcc: { value: new THREE.Color(0xffffff) }, uAcc2: { value: new THREE.Color(0xffffff) }, uGhost: { value: 0 }, ...extra };
}

export function castInit(fogU) { FOG = fogU; }
// géométrie seule d'un objet (note, disque d'or, cœur, pédale, vinyle, flight-case) pour le shader néon du jeu
export function propGeo(name) { const { g } = baseGeo(name), geo = new THREE.BufferGeometry(); geo.setAttribute('position', g.attributes.position); geo.setIndex(g.index); geo.computeBoundingSphere(); geo.userData.shared = true; return geo; }

// une InstancedMesh d'un type d'ennemi (ou d'un boss) ; l'attribut d'instance aI = (phase, éclat blanc, élite, état)
export function creatureMesh(type, count, alpha = 1) {
  const { g, d } = baseGeo(type);
  const geo = new THREE.BufferGeometry();
  for (const k of ['position', 'aC', 'aP']) geo.setAttribute(k, g.attributes[k]);
  geo.setIndex(g.index); geo.boundingSphere = g.boundingSphere; geo.userData.shared = true;
  const aI = new THREE.InstancedBufferAttribute(new Float32Array(count * 4), 4); aI.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('aI', aI);
  const mat = new THREE.ShaderMaterial({
    uniforms: uniforms({ uPiv: { value: d.piv.map(v => new THREE.Vector3(...v)) }, uAlpha: { value: alpha } }),
    vertexShader: creatureVS(type, d.piv.length), fragmentShader: FS, transparent: alpha < 1, depthWrite: alpha >= 1,
  });
  const m = new THREE.InstancedMesh(geo, mat, count);
  m.frustumCulled = false; m.count = 0; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  m.userData.aI = aI;
  return m;
}
export function setInst(m, i, ph, flash, elite, st) { m.userData.aI.setXYZW(i, ph, flash, elite, st); }

// ---------------------------------------------------------------- héros
const HERO_VS = `#include <common>
#include <skinning_pars_vertex>
uniform float uVar; uniform float uGhost;
attribute vec4 aC; attribute vec4 aP;
${COMMON}
void main(){
  #include <skinbase_vertex>
  #include <begin_vertex>
  #include <skinning_vertex>
  if (aP.z > 0.5 && abs(aP.z - uVar) > 0.5) transformed = vec3(0.0);   // tête d'un autre personnage : repliée, invisible
  vL = position; vK = aP.y; vC = aC.rgb * aC.rgb; vCore = aC.a * 5.1; vFl = 0.0; vEl = 0.0;
  vec4 w = modelMatrix * vec4(transformed, 1.0); vW = w.xyz; vec4 mv = viewMatrix * w; vD = -mv.z; gl_Position = projectionMatrix * mv;
  // silhouette : profondeur avancée de 0,8 m vers la caméra — le héros ne se masque pas lui-même, seuls les vrais obstacles comptent
  if (uGhost > 0.5) { vec4 c2 = projectionMatrix * (mv + vec4(0.0, 0.0, 0.8, 0.0)); gl_Position.z = c2.z / c2.w * gl_Position.w; }
}`;
const HERO_FS = FS.replace('uniform float uGhost;', 'uniform float uGhost; uniform float uFlash;').replace('col = mix(col, vec3(1.0), vFl * 0.55); core += vFl * 0.3;', 'col = mix(col, vec3(1.0), uFlash); core += uFlash * 0.6;');

export function makeHero() {
  const { g, d } = baseGeo('hero');
  const n = d.n, ap = g.attributes.aP.array, si = new Uint16Array(n * 4), sw = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) { si[i * 4] = ap[i * 4]; sw[i * 4] = 1; }
  g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4)); g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
  const bones = d.bones.map(([name, , x, y, z]) => { const b = new THREE.Bone(); b.name = name.replace('.', '_'); b.position.set(x, y, z); return b; });
  d.bones.forEach(([, par], i) => { if (par >= 0) bones[par].add(bones[i]); });
  const mat = new THREE.ShaderMaterial({ uniforms: uniforms({ uVar: { value: 1 }, uFlash: { value: 0 } }), vertexShader: HERO_VS, fragmentShader: HERO_FS });
  const mesh = new THREE.SkinnedMesh(g, mat); mesh.frustumCulled = false;
  mesh.add(bones[0]); mesh.updateMatrixWorld(true);
  const skel = new THREE.Skeleton(bones); mesh.bind(skel);
  // silhouette « rayons X » : dessinée seulement derrière les obstacles (test de profondeur inversé), même squelette
  const gmat = new THREE.ShaderMaterial({ uniforms: { ...mat.uniforms, uGhost: { value: 1 } }, vertexShader: HERO_VS, fragmentShader: HERO_FS, transparent: true, depthWrite: false, depthFunc: THREE.GreaterDepth });   // seulement là où le héros est caché
  const ghost = new THREE.SkinnedMesh(g, gmat); ghost.frustumCulled = false; ghost.renderOrder = 30; ghost.bind(skel, mesh.bindMatrix); mesh.add(ghost);
  // clips : pistes échantillonnées à 30 i/s (quaternions en int16, positions et échelles en float32)
  const clips = {};
  for (const [name, c] of Object.entries(d.clips)) {
    const times = Float32Array.from({ length: c.n }, (_, i) => i / c.fps), tracks = [];
    for (const [bi, kind, data] of c.t) {
      const bn = bones[bi].name, raw = dec(data);
      if (kind === 'q') { const q = new Int16Array(raw.buffer), v = new Float32Array(q.length); for (let i = 0; i < q.length; i++) v[i] = q[i] / 32767; tracks.push(new THREE.QuaternionKeyframeTrack(bn + '.quaternion', times, v)); }
      else tracks.push(new THREE.VectorKeyframeTrack(bn + (kind === 'p' ? '.position' : '.scale'), times, new Float32Array(raw.buffer)));
    }
    clips[name] = { clip: new THREE.AnimationClip(name, (c.n - 1) / c.fps, tracks), loop: c.loop };
  }
  const root = new THREE.Group(); mesh.rotation.y = Math.PI; root.add(mesh);   // le modèle regarde +Z ; le joueur avance vers −Z
  const mixer = new THREE.AnimationMixer(mesh), actions = {};
  for (const [name, c] of Object.entries(clips)) { const a = mixer.clipAction(c.clip); a.setLoop(c.loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity); a.clampWhenFinished = !c.loop; actions[name] = a; }
  const scarf = bones.filter(b => /^scarf/.test(b.name)), base = scarf.map(b => b.quaternion.clone());
  const H = {
    root, mesh, ghost, mixer, actions, cur: null, flow: 0,
    play(name, fade = 0.15) {
      const a = actions[name]; if (!a || H.cur === a) return;
      a.reset(); a.play(); if (H.cur) a.crossFadeFrom(H.cur, fade, false); H.cur = a; H.name = name;
    },
    setChar(i, col, col2) { mat.uniforms.uVar.value = i + 1; mat.uniforms.uAcc.value.set(col); mat.uniforms.uAcc2.value.set(col2); gmat.uniforms.uAcc.value.set(col); },
    flash(k) { mat.uniforms.uFlash.value = k; },
    // flow : 0 immobile, 1 course pleine ; l'écharpe pend puis flotte derrière en ondulant
    update(dt, flow, t) {
      mixer.update(dt);
      H.flow += (flow - H.flow) * Math.min(1, dt * 4); const f = H.flow;
      scarf.forEach((b, i) => {
        b.quaternion.copy(base[i]);
        b.rotateX((i === 0 ? -1.0 : -0.22) * (1 - f) + 0.04 * f + Math.sin(t * (6 + 6 * f) - i * 0.9) * (0.05 + i * 0.05) * (0.3 + f));
        b.rotateZ(Math.sin(t * 5.3 - i * 0.7) * 0.06 * (i + 1) * (0.3 + f));
      });
    },
  };
  H.play('Idle', 0);
  return H;
}
