// Classements Steam (Block Quarry, Synth Horde ; jamais Nova Foundry) — processus principal seulement. Le jeu n'y accède
// que par les trois appels du preload (pt:lb-status, pt:lb-submit, pt:lb-entries).
// Steamworks par steamworks.js (fork maintenu @pipelab/steamworks.js, binaire copié dans steamworks/ par build.mjs).
// Steam non lancé, jeu non lancé depuis Steam et sans App ID, binaire absent : indisponible, sans erreur ni blocage.
// Les classements sont créés par le jeu lui-même (FindOrCreateLeaderboard) avec les noms de apps/shared/leaderboards.mjs ;
// le défi du jour a un classement par journée UTC : « daily-2026-10-20 ».
const path = require('path');

const HOUR = 3600e3;
const utcDay = ms => new Date(ms).toISOString().slice(0, 10);
const normDay = d => { const s = String(d == null ? '' : d).replace(/-/g, ''); return /^\d{8}$/.test(s) ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6)}` : ''; };
const SORT_DESC = 1, SHOW_NUMBER = 0, SHOW_SECONDS = 1, GLOBAL = 0, AROUND_USER = 1, KEEP_BEST = 0;   // énumérations Steamworks

function createSteam(GAME) {
  let client = null;
  if (GAME.boards) {
    try {
      const sw = require(path.join(__dirname, 'steamworks', 'index.js'));
      // App ID : celui de la construction (variable <PRÉFIXE>_STEAM_APPID) ; sinon celui que Steam donne au lancement
      client = sw.init(GAME.steamAppId ? Number(GAME.steamAppId) : undefined);
    } catch (e) { client = null; console.log('Steam indisponible :', e && e.message); }
  }
  // heure des serveurs Steam (secondes) si connue : c'est elle qui dit quel est le jour du classement
  const now = () => { try { const s = client.utils.getServerRealTime(); if (s > 0) return s * 1000; } catch (e) {} return Date.now(); };
  const handles = {};
  const board = (def, day) => {
    const name = def.steam + (def.daily ? '-' + day : '');
    if (!handles[name]) {
      handles[name] = client.leaderboards.findOrCreateLeaderboard(name, SORT_DESC, def.time ? SHOW_SECONDS : SHOW_NUMBER)
        .then(h => (h ? name : null), () => null)
        .then(n => { if (!n) delete handles[name]; return n; });
    }
    return handles[name];
  };
  const nameOf = id => { try { const n = client.friends.getFriendName(id); return n && n !== '[unknown]' ? n : '—'; } catch (e) { return '—'; } };
  return {
    status: () => ({ ok: !!client }),
    async submit(key, score, day) {
      const def = client && GAME.boards[key];
      score = Math.floor(+score);
      if (!def || !Number.isInteger(score) || score < def.min || score > def.max) return false;
      let d = '';
      if (def.daily) {
        const t = now(); d = normDay(day);
        if (d !== utcDay(t) || Math.abs(t - Date.now()) > HOUR) return false;   // autre jour, ou horloge du PC déréglée
      }
      try {
        const n = await board(def, d); if (!n) return false;
        await client.leaderboards.uploadScore(n, score, KEEP_BEST);
        return true;
      } catch (e) { return false; }
    },
    async entries(key) {
      const def = client && GAME.boards[key];
      if (!def) return null;
      try {
        const day = def.daily ? utcDay(now()) : '', n = await board(def, day);
        if (!n) return null;
        const me = client.localplayer.getSteamId().steamId64;
        const row = e => ({ rank: e.globalRank, score: e.score, name: nameOf(e.steamId), me: e.steamId === me });
        const top = (await client.leaderboards.downloadScores(n, GLOBAL, 1, 10)).map(row);
        const around = (await client.leaderboards.downloadScores(n, AROUND_USER, -2, 2)).map(row);
        return { top, around, day, time: !!def.time };
      } catch (e) { return null; }
    },
  };
}
module.exports = { createSteam, utcDay, normDay };
