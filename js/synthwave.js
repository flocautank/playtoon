// Boucle synthwave procédurale (WebAudio, aucun fichier son) : nappe, basse, arpège et batterie,
// avec une intensité 0–3 qui ajoute ou retire des couches selon le danger.
// Ordonnancement classique « lookahead » : un minuteur planifie les notes un peu en avance.

const PROG = [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5]];   // i – VI – III – VII (en demi-tons depuis la tonique)
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

export class Synthwave {
  constructor() { this.ctx = null; this.on = false; this.level = 0; this.root = 57; this.bpm = 108; this.step = 0; this.timer = 0; }

  _init() {
    if (this.ctx) return;
    const c = this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = c.createGain(); this.master.gain.value = 0; this.master.connect(c.destination);
    // un écho pour l'arpège
    this.delay = c.createDelay(1); this.delay.delayTime.value = 60 / this.bpm * 0.75;
    const fb = c.createGain(); fb.gain.value = 0.35; const wet = c.createGain(); wet.gain.value = 0.3;
    this.delay.connect(fb); fb.connect(this.delay); this.delay.connect(wet); wet.connect(this.master);
    // bruit blanc réutilisé par la batterie
    const len = c.sampleRate * 0.5, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noise = buf;
  }

  start(stage = 0) {
    this._init();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.root = stage ? 62 : 57;            // La mineur, puis Ré mineur pour la Fournaise
    this.bpm = stage ? 118 : 108;
    this.delay.delayTime.value = 60 / this.bpm * 0.75;
    if (!this.on) { this.on = true; this.step = 0; this.next = this.ctx.currentTime + 0.1; clearInterval(this.timer); this.timer = setInterval(() => this._tick(), 25); }
    this._fade(0.5, 0.8);
  }
  stop(fade = 0.6) {
    if (!this.ctx || !this.on) return;
    this._fade(0, fade);
    this.on = false;
    const t = this.timer; setTimeout(() => { if (!this.on) clearInterval(t); }, fade * 1000 + 50);
  }
  setLevel(l) { this.level = Math.max(0, Math.min(3, l)); }
  _fade(v, t) { const g = this.master.gain, n = this.ctx.currentTime; g.cancelScheduledValues(n); g.setValueAtTime(g.value, n); g.linearRampToValueAtTime(window.PT_MUTE ? 0 : v, n + t); }

  _tick() {
    const c = this.ctx;
    if (window.PT_MUTE) this.master.gain.value = 0; else if (this.on && this.master.gain.value === 0) this._fade(0.5, 0.3);
    const sixteenth = 60 / this.bpm / 4;
    while (this.next < c.currentTime + 0.12) { this._play(this.step, this.next, sixteenth); this.next += sixteenth; this.step = (this.step + 1) % 64; }
  }

  _play(s, t, dur) {
    const bar = Math.floor(s / 16), st = s % 16, chord = PROG[bar].map(n => n + this.root), L = this.level;
    // nappe : un accord tenu par mesure
    if (st === 0) for (const n of chord) this._voice('sawtooth', mtof(n - 12), t, dur * 16, 0.035, 900 + L * 400, 0.6, 1.2, 7);
    // basse : croches, octaves alternées
    if (st % 2 === 0) this._voice('sawtooth', mtof(chord[0] - 24 + (st % 4 === 2 ? 12 : 0)), t, dur * 1.8, 0.11, 380 + L * 260, 0.005, 0.12, 0);
    // arpège : doubles-croches dès l'intensité 2
    if (L >= 2) { const n = chord[(st + (st >> 2)) % 3] + 12 + (st % 8 >= 4 ? 12 : 0); this._voice('square', mtof(n), t, dur * 0.9, 0.035, 2200 + L * 800, 0.002, 0.1, 0, true); }
    // batterie
    if (L >= 1 && st % 4 === 0) this._kick(t);
    if (L >= 2 && (st === 4 || st === 12)) this._snare(t);
    if (L >= 1 && st % 2 === 1) this._hat(t, L >= 3 ? 0.05 : 0.03);
    if (L >= 3 && st % 2 === 0) this._hat(t, 0.02);
  }

  _voice(type, f, t, dur, vol, cutoff, att, rel, detune, echo) {
    const c = this.ctx, o = c.createOscillator(), fl = c.createBiquadFilter(), g = c.createGain();
    o.type = type; o.frequency.value = f; if (detune) o.detune.value = (Math.random() - 0.5) * detune * 2;
    fl.type = 'lowpass'; fl.frequency.value = cutoff; fl.Q.value = 4;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + att);
    g.gain.setValueAtTime(vol, t + Math.max(att, dur - rel)); g.gain.linearRampToValueAtTime(0, t + dur + rel);
    o.connect(fl); fl.connect(g); g.connect(this.master); if (echo) g.connect(this.delay);
    o.start(t); o.stop(t + dur + rel + 0.05);
  }
  _kick(t) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.14);
    g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 0.32);
  }
  _noiseHit(t, type, freq, vol, dur) {
    const c = this.ctx, n = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    n.buffer = this.noise; f.type = type; f.frequency.value = freq;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    n.connect(f); f.connect(g); g.connect(this.master); n.start(t); n.stop(t + dur + 0.02);
  }
  _snare(t) { this._noiseHit(t, 'bandpass', 1800, 0.22, 0.18); this._voice('triangle', 190, t, 0.05, 0.08, 3000, 0.001, 0.08, 0); }
  _hat(t, v) { this._noiseHit(t, 'highpass', 7000, v, 0.05); }
}
