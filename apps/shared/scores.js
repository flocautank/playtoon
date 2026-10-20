// Classements natifs des applis MOBILES (Block Quarry, Synth Horde — jamais Nova Foundry) : Google Play Jeux sur
// Android, Game Center sur iOS, par le petit plugin local apps/shared/pt-scores (« PtScores »). Pas de serveur à nous.
// Le jeu ne voit que window.PT_SCORES (même contrat que la version PC, apps/desktop/src/shell.js) :
//   available()               → true quand le service est utilisable (sinon les boutons « Classement » restent masqués) ;
//   submit(board, score, day) → envoi silencieux, Promise<bool> (day : jour du défi, pour un classement quotidien) ;
//   show(board?)              → l'écran de classement de la plateforme (tous les classements du jeu sans board).
// Web, identifiants absents, joueur non connecté, hors ligne : rien ne s'affiche, rien ne plante, le score reste local.
// Un envoi impossible sur le moment (hors ligne, pas connecté, fenêtre du jour de Google pas encore ouverte) attend
// dans localStorage et repart à la reprise de l'appli ; un défi d'un autre jour est abandonné.
import { Capacitor, registerPlugin } from '@capacitor/core';
import { App } from '@capacitor/app';
import { utcDay, normDay, inBounds } from './leaderboards.mjs';

const Native = registerPlugin('PtScores');
const HOUR = 3600e3, KEY = 'pt.scores.pending';
// Google Play Jeux remet ses classements « du jour » à zéro à minuit, heure du Pacifique : un défi (jour UTC) n'y est
// envoyé que quand la journée de Google est la même, sinon deux grilles différentes se mêleraient dans un classement.
export function pacificDay(ms = Date.now()) {
  try {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(ms)).map(x => [x.type, x.value]));
    if (p.year && p.month && p.day) return `${p.year}-${p.month}-${p.day}`;
  } catch (e) {}
  return utcDay(ms - 8 * HOUR);
}

// L : classements du jeu (BQ_LEADERBOARDS, SH_LEADERBOARDS) ; play : identifiants Play Jeux injectés à la construction ({ daily: 'CgkI…', … })
export function initScores(L, play) {
  const plat = Capacitor.getPlatform(); play = play || {};
  if (!L || (plat !== 'android' && plat !== 'ios')) return null;
  const st = { ok: false, signed: false, busy: false };
  const idOf = b => plat === 'ios' ? L.boards[b].gc : play[b] || '';
  const pend = () => { try { const a = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } };
  const savePend = a => { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} };

  async function refresh() {
    try {
      const r = await Native.status();
      st.ok = !!r.configured && Object.keys(L.boards).some(idOf); st.signed = st.ok && !!r.signedIn;
    } catch (e) { st.ok = false; st.signed = false; }
    window.dispatchEvent(new Event('pt-scores'));
    if (st.signed) flush();
  }
  // horloge du téléphone à plus d'une heure de l'heure réseau (Android 13+ : heure réseau du système) → défi refusé
  async function clockOk() {
    try { const r = await Native.networkTime(); return !(r && r.ms) || Math.abs(r.ms - Date.now()) <= HOUR; } catch (e) { return true; }
  }
  async function flush() {
    if (st.busy || !st.signed) return;
    st.busy = true;
    try {
      const today = utcDay(), keep = [];
      for (const p of pend()) {
        const def = L.boards[p.board];
        if (!def || !idOf(p.board) || (def.daily && p.day !== today)) continue;   // défi d'un autre jour : abandonné
        if (def.daily && plat === 'android' && pacificDay() !== p.day) { keep.push(p); continue; }
        try { await Native.submit({ id: idOf(p.board), score: def.time && plat === 'android' ? p.score * 1000 : p.score, day: def.daily ? p.day : '' }); }
        catch (e) { if (!/stale/i.test(String(e && e.message))) keep.push(p); }
      }
      savePend(keep);
    } finally { st.busy = false; }
  }
  async function submit(board, score, day) {
    const def = L.boards[board];
    score = Math.floor(+score);
    if (!def || !idOf(board) || !inBounds(def, score)) return false;
    const d = def.daily ? normDay(day) : '';
    if (def.daily && (d !== utcDay() || !(await clockOk()))) return false;
    const a = pend(), o = a.find(p => p.board === board && (p.day || '') === d);
    if (o) o.score = Math.max(o.score, score); else a.push({ board, score, day: d });
    savePend(a.slice(-20));
    await flush();
    return true;
  }
  async function show(board) {
    if (!st.ok) return;
    if (!st.signed) { try { await Native.signIn(); } catch (e) {} await refresh(); if (!st.signed) return; }
    try { await Native.show({ id: board ? idOf(board) : '', daily: !!(board && L.boards[board] && L.boards[board].daily) }); } catch (e) {}
  }
  window.PT_SCORES = { available: () => st.ok, submit, show };
  refresh(); setTimeout(refresh, 5000);   // Play Jeux connecte le joueur tout seul au lancement, en quelques secondes
  App.addListener('resume', refresh);
  return window.PT_SCORES;
}
