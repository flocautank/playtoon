// Visuels de la page Steam des trois jeux, aux tailles exigées par Steamworks (Store / Library assets), dessinés
// avec les mêmes fonctions que les icônes mobiles (apps/<jeu>/make-assets.mjs). Sortie : steam/<jeu>/art/.
//   node make-art.mjs   (Chromium headless via Playwright)
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
const HERE = fileURLToPath(new URL('./', import.meta.url));
// Synth Horde : les rendus 3D de la distribution (apps/synth-horde/assets/cast/, node tools/cast/poster.mjs) remplacent les dessins plats
import { CAST_PRELOAD } from '../../synth-horde/cast-preload.mjs';
const preload = async id => id === 'synth-horde' ? CAST_PRELOAD : '';
const draw = id => { const s = readFileSync(`${HERE}../../${id}/make-assets.mjs`, 'utf8'); return s.slice(s.indexOf('const DRAW = `') + 14, s.indexOf('`;', s.indexOf('const DRAW = `'))); };

// pour chaque jeu : fond, motif (l'icône) et couleurs du titre
const GAMES = {
  'block-quarry': { title: 'Block Quarry', tag: 'Clear lines · Free the gems', glow: '#ff5d8f', sub: '#c9c3ff',
    back: 'bg(g,w,h)', motif: (x, y, s) => `logo(g,${x},${y},(${s})*0.74)` },
  'nova-foundry': { title: 'Nova Foundry', tag: 'Forge stars · Go Supernova', glow: '#ffb84d', sub: '#ffd98a',
    back: 'bg(g,w,h)', motif: (x, y, s) => `star(g,${x},${y},(${s})*0.42)` },
  'synth-horde': { title: 'Synth Horde', tag: 'Survive the neon hordes', glow: '#ff3fd8', sub: '#ffe86b',
    back: 'bg(g,w,h,.6,w*0.3)', motif: (x, y, s) => `horde(g,${x},(${y})+(${s})*0.05,(${s})*0.42,9,(${s})*0.06);hero(g,${x},${y},(${s})*0.24)` },
};
// titre ajusté à la largeur donnée, avec halo
const TITLE = `function T(g,txt,x,y,maxW,size,glow,align){g.save();g.textAlign=align||'center';g.textBaseline='middle';let s=size;
  do{g.font='900 '+s+'px system-ui,sans-serif';s-=2;}while(g.measureText(txt).width>maxW&&s>8);
  g.shadowColor=glow;g.shadowBlur=s*.35;g.fillStyle='#fff';g.fillText(txt,x,y);g.shadowBlur=0;g.fillText(txt,x,y);g.restore();}
function U(g,txt,x,y,maxW,size,col,align){g.save();g.textAlign=align||'center';g.textBaseline='middle';let s=size;
  do{g.font='700 '+s+'px system-ui,sans-serif';s-=1;}while(g.measureText(txt).width>maxW&&s>8);g.fillStyle=col;g.fillText(txt,x,y);g.restore();}`;
// formats Steamworks : [nom, largeur, hauteur, composition]
const FORMATS = G => [
  ['header_capsule.png', 920, 430, `${G.back};${G.motif('w*.2', 'h*.5', 'h*.78')};T(g,'${G.title}',w*.64,h*.42,w*.6,h*.24,'${G.glow}');U(g,'${G.tag}',w*.64,h*.66,w*.58,h*.075,'${G.sub}');`],
  ['small_capsule.png', 462, 174, `${G.back};${G.motif('w*.15', 'h*.5', 'h*.8')};T(g,'${G.title}',w*.62,h*.5,w*.66,h*.3,'${G.glow}');`],
  ['main_capsule.png', 1232, 706, `${G.back};${G.motif('w*.27', 'h*.5', 'h*.72')};T(g,'${G.title}',w*.68,h*.44,w*.56,h*.17,'${G.glow}');U(g,'${G.tag}',w*.68,h*.6,w*.54,h*.05,'${G.sub}');`],
  ['vertical_capsule.png', 748, 896, `${G.back};${G.motif('w*.5', 'h*.4', 'w*.72')};T(g,'${G.title}',w*.5,h*.79,w*.88,h*.1,'${G.glow}');U(g,'${G.tag}',w*.5,h*.88,w*.84,h*.04,'${G.sub}');`],
  ['page_background.png', 1438, 810, `${G.back};g.globalAlpha=.35;${G.motif('w*.8', 'h*.55', 'h*.9')};g.globalAlpha=1;`],
  ['library_capsule.png', 600, 900, `${G.back};${G.motif('w*.5', 'h*.4', 'w*.8')};T(g,'${G.title}',w*.5,h*.79,w*.9,h*.1,'${G.glow}');`],
  ['library_header.png', 920, 430, `${G.back};${G.motif('w*.2', 'h*.5', 'h*.78')};T(g,'${G.title}',w*.64,h*.5,w*.6,h*.24,'${G.glow}');`],
  ['library_hero.png', 3840, 1240, `${G.back};${G.motif('w*.72', 'h*.5', 'h*.85')};`],            // sans texte (règle Steam)
  ['library_logo.png', 1280, 720, `T(g,'${G.title}',w*.5,h*.5,w*.94,h*.32,'${G.glow}');`, true],    // PNG transparent
  ['community_icon.jpg', 184, 184, `${G.back};${G.motif('w*.5', 'h*.5', 'w*.8')};`],
  ['client_icon.png', 32, 32, `${G.back};${G.motif('w*.5', 'h*.5', 'w*.9')};`],
];

const b = await chromium.launch();
for (const [id, G] of Object.entries(GAMES)) {
  const out = `${HERE}${id}/art/`; mkdirSync(out, { recursive: true });
  const pre = await preload(id);
  for (const [name, w, h, code, transparent] of FORMATS(G)) {
    const p = await b.newPage();
    const type = name.endsWith('.jpg') ? 'image/jpeg' : 'image/png';
    const url = await p.evaluate(`(async()=>{${pre}${draw(id)}${TITLE}const c=document.createElement('canvas');c.width=${w};c.height=${h};const g=c.getContext('2d');const w=${w},h=${h};
      ${transparent ? '' : "g.fillStyle='#000';g.fillRect(0,0,w,h);"}${code}return c.toDataURL('${type}',0.92);})()`);
    writeFileSync(out + name, Buffer.from(url.split(',')[1], 'base64')); await p.close();
  }
  console.log(id, 'art prêt');
}
await b.close();
