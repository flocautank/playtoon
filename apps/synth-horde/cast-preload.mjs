// Code injecté dans la page de dessin (make-assets.mjs, ../desktop/steam/make-art.mjs) : précharge les rendus 3D de la
// distribution (assets/cast/, produits par `node tools/cast/poster.mjs`) dans window.IMG. Vide si les rendus manquent.
import { readFileSync, existsSync } from 'fs';
const DIR = new URL('./assets/cast/', import.meta.url).pathname;
const urls = existsSync(DIR + 'horde.png') ? Object.fromEntries(['horde', 'head', 'hero'].map(k => [k, 'data:image/png;base64,' + readFileSync(DIR + k + '.png').toString('base64')])) : null;
export const CAST_PRELOAD = urls ? `window.IMG={};for(const [k,u] of Object.entries(${JSON.stringify(urls)})){const im=new Image();im.src=u;await im.decode();IMG[k]=im;}` : '';
