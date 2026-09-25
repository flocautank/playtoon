// Dessine l'icône et l'écran de démarrage de Block Quarry (canvas, rendu par Chromium headless),
// puis `npx @capacitor/assets generate --android` en tire toutes les tailles.
import { createRequire } from 'module';
import { writeFileSync } from 'fs';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
const OUT = new URL('./assets/', import.meta.url).pathname;

const DRAW = `
function rr(g,x,y,w,h,r){g.beginPath();g.roundRect(x,y,w,h,r);}
function block(g,x,y,s,c,dark){rr(g,x,y+s*.06,s,s*.94,s*.18);g.fillStyle=dark;g.fill();rr(g,x,y,s,s*.9,s*.18);g.fillStyle=c;g.fill();
  rr(g,x+s*.16,y+s*.1,s*.68,s*.13,s*.06);g.fillStyle='rgba(255,255,255,.4)';g.fill();}
function gem(g,cx,cy,r){g.save();g.shadowColor='#7ff6ff';g.shadowBlur=r*.9;g.fillStyle='#27e0ff';g.beginPath();g.moveTo(cx,cy-r);g.lineTo(cx+r*.85,cy-r*.2);g.lineTo(cx,cy+r);g.lineTo(cx-r*.85,cy-r*.2);g.closePath();g.fill();
  g.shadowBlur=0;g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.moveTo(cx,cy-r);g.lineTo(cx+r*.35,cy-r*.2);g.lineTo(cx-r*.35,cy-r*.2);g.closePath();g.fill();g.restore();}
// motif : grille 3×3, pierre au centre qui porte la gemme, blocs bonbon autour
function logo(g,cx,cy,S){const s=S/3.25,gap=S*.0375,x0=cx-S/2,y0=cy-S/2;
  const P=[['#ff5d8f','#b8335f'],['#ffc94d','#b88a25'],['#4dd4ff','#2a8fb5'],['#7cff8a','#3fb34d'],null,['#b98bff','#7a52c2'],['#ff8a4d','#b8582a'],['#4dffd2','#2ab394'],['#ff5d8f','#b8335f']];
  for(let i=0;i<9;i++){const x=x0+(i%3)*(s+gap),y=y0+Math.floor(i/3)*(s+gap);
    if(i===4){block(g,x,y,s,'#8a8cab','#56587a');gem(g,x+s/2,y+s*.45,s*.3);} else if(i===2||i===6) continue; else block(g,x,y,s,P[i][0],P[i][1]);}}
function bg(g,w,h){const gr=g.createRadialGradient(w/2,h*.2,0,w/2,h/2,w*.75);gr.addColorStop(0,'#3b2a6b');gr.addColorStop(.6,'#1b1840');gr.addColorStop(1,'#120f2a');g.fillStyle=gr;g.fillRect(0,0,w,h);}
`;
const jobs = {
  'icon-only.png': [1024, 1024, `bg(g,1024,1024);logo(g,512,512,700);`],
  'icon-foreground.png': [1024, 1024, `logo(g,512,512,560);`],          // zone sûre de l'icône adaptative : ~66 %
  'icon-background.png': [1024, 1024, `bg(g,1024,1024);`],
  'splash.png': [2732, 2732, `bg(g,2732,2732);logo(g,1366,1250,700);g.fillStyle='#fff';g.font='900 170px system-ui,sans-serif';g.textAlign='center';g.fillText('Block Quarry',1366,1830);`],
  'splash-dark.png': [2732, 2732, `bg(g,2732,2732);logo(g,1366,1250,700);g.fillStyle='#fff';g.font='900 170px system-ui,sans-serif';g.textAlign='center';g.fillText('Block Quarry',1366,1830);`],
  'play-icon-512.png': [512, 512, `bg(g,512,512);logo(g,256,256,350);`],
  'feature-graphic.png': [1024, 500, `bg(g,1024,500);logo(g,215,250,320);g.fillStyle='#fff';g.font='900 72px system-ui,sans-serif';g.fillText('Block Quarry',420,235,570);g.fillStyle='#c9c3ff';g.font='600 32px system-ui,sans-serif';g.fillText('Place blocks · Free the gems',424,296,570);`],
};
const b = await chromium.launch();
for (const [name, [w, h, code]] of Object.entries(jobs)) {
  const p = await b.newPage();
  const url = await p.evaluate(`(()=>{${DRAW}const c=document.createElement('canvas');c.width=${w};c.height=${h};const g=c.getContext('2d');${code}return c.toDataURL('image/png');})()`);
  writeFileSync(OUT + name, Buffer.from(url.split(',')[1], 'base64')); await p.close();
  console.log(name, w + '×' + h);
}
await b.close();
