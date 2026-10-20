// Code injecté dans la page de dessin (make-assets.mjs, ../desktop/steam/make-art.mjs) : charge les polices du jeu
// (IM Fell English SC « NF Title », Alegreya Sans « NF Text », Young Serif « NF Num », OFL, embarquées dans js/forge-fonts.js)
// avant de dessiner, pour que l'icône, l'écran de démarrage et les visuels de boutique aient la typographie de l'atlas.
import { readFileSync } from 'fs';
const src = readFileSync(new URL('../../js/forge-fonts.js', import.meta.url), 'utf8');
const F = [...src.matchAll(/\['(NF [A-Za-z]+)', '(\d+)', 'normal', '([A-Za-z0-9+/=]+)'\]/g)].map(m => [m[1], m[2], m[3]]);
if (F.length < 3) throw new Error('polices introuvables dans js/forge-fonts.js');
export const FORGE_FONTS_PRELOAD = `await Promise.all(${JSON.stringify(F)}.map(([f,w,b])=>{const s=atob(b),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);const ff=new FontFace(f,u.buffer,{weight:w});document.fonts.add(ff);return ff.load();}));`;
