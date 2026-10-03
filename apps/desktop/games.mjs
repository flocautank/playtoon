// Les trois jeux de Playtoon en version PC (Steam) : un exécutable Electron par jeu.
// steamAppIdVar : variable du dépôt GitHub qui portera l'App ID Steam (créé dans Steamworks).
export const GAMES = {
  'block-quarry': {
    title: 'Block Quarry', game: 'blocks', section: 'tab-blocks', versionKey: 'blocks',
    appId: 'io.github.flocautank.blockquarry.desktop', exe: 'BlockQuarry', bg: '#120f2a',
    width: 1100, height: 860, gearHost: '#bp-boost', gearIcon: '⚙', music: false,
    icon: '../block-quarry/assets/icon-only.png', steamPrefix: 'BQ',
  },
  'nova-foundry': {
    title: 'Nova Foundry', game: 'forge', section: 'tab-forge', versionKey: 'forge',
    appId: 'io.github.flocautank.novafoundry.desktop', exe: 'NovaFoundry', bg: '#0b0a1f',
    width: 1280, height: 800, gearHost: '.sf-tabs', gearIcon: '☰', music: false,
    icon: '../nova-foundry/assets/icon-only.png', steamPrefix: 'NF',
  },
  'synth-horde': {
    title: 'Synth Horde', game: 'bonk', section: 'tab-bonk', versionKey: 'bonk',
    appId: 'io.github.flocautank.synthhorde.desktop', exe: 'SynthHorde', bg: '#07030f',
    width: 1280, height: 720, gearHost: '#nb-menu .card', gearIcon: '⚙', music: true,
    icon: '../synth-horde/assets/icon-only.png', steamPrefix: 'SH',
  },
};
