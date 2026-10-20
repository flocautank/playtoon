// Classements natifs des applis Playtoon — définition UNIQUE, lue par les applis mobiles (apps/shared/scores.js),
// par la version PC (apps/desktop : game.json → electron/main.cjs) et recopiée dans apps/RELEASE-GUIDE.md
// (« Classements — ce qu'il te reste à faire »). Seuls Block Quarry et Synth Horde en ont ; Nova Foundry, jamais.
//
// Par classement :
//   gc     identifiant Game Center (App Store Connect, à recopier tel quel) ;
//   steam  nom du classement Steam, créé par le jeu lui-même (FindOrCreateLeaderboard) ; un classement quotidien
//          porte en plus la date UTC du défi : « daily-2026-10-20 » ;
//   play   suffixe de la variable GitHub qui porte l'identifiant Google Play Jeux (« CgkI… », généré par la Play Console) :
//          <PRÉFIXE>_PLAY_LB_<play>, ex. BQ_PLAY_LB_DAILY ;
//   daily  classement du défi du jour (graine = date UTC) : la soumission n'est acceptée que pour le défi du jour UTC courant ;
//   time   score en secondes (Play Jeux attend des millisecondes : converti à l'envoi ; Game Center et Steam : secondes) ;
//   min/max bornes plausibles : un score hors bornes n'est jamais envoyé (mêmes bornes à saisir dans les consoles) ;
//   label  clé de traduction du nom affiché (js/lang/<jeu>.js).
// Toute modification du calcul d'un score ou du défi du jour doit garder ces bornes et la date UTC cohérentes avec le guide.
// (une constante par jeu : le paquet d'une appli n'embarque que les classements de son jeu)
export const BQ_LEADERBOARDS = {
  prefix: 'BQ',
  boards: {
    daily: { gc: 'io.github.flocautank.blockquarry.daily', steam: 'daily', play: 'DAILY', daily: true, min: 1, max: 1000000, label: 'bp.lb.daily' },
    classic: { gc: 'io.github.flocautank.blockquarry.classic', steam: 'classic', play: 'CLASSIC', min: 1, max: 10000000, label: 'bp.lb.classic' },
    chrono: { gc: 'io.github.flocautank.blockquarry.chrono', steam: 'chrono', play: 'CHRONO', min: 1, max: 1000000, label: 'bp.lb.chrono' },
  },
};
export const SH_LEADERBOARDS = {
  prefix: 'SH',
  boards: {
    daily: { gc: 'io.github.flocautank.synthhorde.daily', steam: 'daily', play: 'DAILY', daily: true, min: 1, max: 200000, label: 'nb.lb.daily' },
    survival: { gc: 'io.github.flocautank.synthhorde.survival', steam: 'survival', play: 'SURVIVAL', time: true, min: 1, max: 86400, label: 'nb.lb.survival' },
  },
};
export const LEADERBOARDS = { blocks: BQ_LEADERBOARDS, bonk: SH_LEADERBOARDS };

// jour UTC « AAAA-MM-JJ » d'un instant (ms) — la journée d'un classement quotidien
export const utcDay = (ms = Date.now()) => new Date(ms).toISOString().slice(0, 10);
// clé de jour d'un jeu (20261020 pour Block Quarry, « 2026-10-20 » pour Synth Horde) → « AAAA-MM-JJ »
export const normDay = d => { const s = String(d == null ? '' : d).replace(/-/g, ''); return /^\d{8}$/.test(s) ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6)}` : ''; };
// un score envoyable : entier, dans les bornes du classement
export const inBounds = (def, score) => Number.isInteger(score) && score >= def.min && score <= def.max;
