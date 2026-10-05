// Dessine l'icône, l'écran de démarrage et les visuels Play de Synth Horde (canvas, Chromium headless),
// puis `npx @capacitor/assets generate --android` en tire toutes les tailles.
import { createRequire } from 'module';
import { writeFileSync, mkdirSync } from 'fs';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
const OUT = new URL('./assets/', import.meta.url).pathname; mkdirSync(OUT, { recursive: true });
import { CAST_PRELOAD } from './cast-preload.mjs';   // rendus 3D de la distribution, utilisés par hero()/horde()/face()

// fond synthwave : ciel violet, soleil rayé, grille néon en perspective ; héros au centre, horde d'yeux autour
const DRAW = `
function bg(g,w,h,hz,sx){const sky=g.createLinearGradient(0,0,0,h*hz);sky.addColorStop(0,'#07030f');sky.addColorStop(1,'#3b0d5c');g.fillStyle=sky;g.fillRect(0,0,w,h*hz);
  g.fillStyle='#0a0418';g.fillRect(0,h*hz,w,h);
  const R=Math.min(w,h)*.26,cx=sx||w/2,cy=h*hz;g.save();g.beginPath();g.rect(0,0,w,cy);g.clip();
  const sun=g.createLinearGradient(0,cy-R,0,cy);sun.addColorStop(0,'#ffe86b');sun.addColorStop(.6,'#ff4fa0');sun.addColorStop(1,'#b21fd6');g.fillStyle=sun;g.beginPath();g.arc(cx,cy,R,Math.PI,0);g.fill();
  g.fillStyle='#3b0d5c';for(let i=0;i<6;i++){const y=cy-R*.08-i*R*.13,hh=R*(.05-i*.006);g.fillRect(cx-R,y,2*R,hh);}g.restore();
  g.strokeStyle='#ff3fd8';g.shadowColor='#ff3fd8';g.shadowBlur=w*.01;g.lineWidth=Math.max(1,w*.004);
  for(let i=-12;i<=12;i++){g.beginPath();g.moveTo(cx+i*w*.02,cy);g.lineTo(cx+i*w*.16,h);g.stroke();}
  for(let k=1;k<9;k++){const y=cy+(h-cy)*Math.pow(k/8,1.8);g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}g.shadowBlur=0;}
function cimg(g,im,x,y,W,glow){const H=W*im.height/im.width;g.save();g.shadowColor=glow;g.shadowBlur=W*.03;g.drawImage(im,x-W/2,y-H/2,W,H);g.restore();}
function face(g,x,y,s){if(self.IMG&&IMG.head)return cimg(g,IMG.head,x,y,s,'#4dd4ff');hero(g,x,y,s*.2);}
function hero(g,x,y,s){if(self.IMG&&IMG.horde)return cimg(g,IMG.horde,x,y,s*5.6,'#ff3fd8');g.save();g.translate(x,y);g.shadowColor='#4dd4ff';g.shadowBlur=s*.5;
  g.fillStyle='#4dd4ff';g.beginPath();g.moveTo(0,-s*1.1);g.lineTo(s*.55,s*.2);g.lineTo(s*.32,s*1.05);g.lineTo(-s*.32,s*1.05);g.lineTo(-s*.55,s*.2);g.closePath();g.fill();
  g.shadowBlur=0;g.fillStyle='#07030f';g.fillRect(-s*.3,-s*.35,s*.6,s*.16);g.fillStyle='#fff';g.fillRect(-s*.24,-s*.32,s*.18,s*.1);g.fillRect(s*.06,-s*.32,s*.18,s*.1);g.restore();}
function horde(g,x,y,r,n,s){if(self.IMG&&IMG.horde)return;for(let i=0;i<n;i++){const a=i/n*Math.PI*2+.3,d=r*(.85+(i%3)*.12),px=x+Math.cos(a)*d,py=y+Math.sin(a)*d*.62;
  g.fillStyle=i%2?'#ff4fa0':'#b36bff';g.shadowColor=g.fillStyle;g.shadowBlur=s*.6;g.beginPath();g.arc(px,py,s,0,7);g.fill();g.shadowBlur=0;
  g.fillStyle='#fff';g.beginPath();g.arc(px-s*.35,py-s*.1,s*.22,0,7);g.arc(px+s*.35,py-s*.1,s*.22,0,7);g.fill();}}
function title(g,txt,x,y,sz){g.font='900 '+sz+'px system-ui,sans-serif';g.textAlign='center';g.fillStyle='#fff';g.shadowColor='#ff3fd8';g.shadowBlur=sz*.3;g.fillText(txt,x,y);g.shadowBlur=0;}
`;
const jobs = {
  'icon-only.png': [1024, 1024, `bg(g,1024,1024,.55);face(g,512,540,780);`],
  'icon-foreground.png': [1024, 1024, `face(g,512,512,560);`],
  'icon-background.png': [1024, 1024, `bg(g,1024,1024,.55);`],
  'splash.png': [2732, 2732, `bg(g,2732,2732,.5);horde(g,1366,1500,520,11,70);hero(g,1366,1460,260);title(g,'Synth Horde',1366,2200,190);`],
  'splash-dark.png': [2732, 2732, `bg(g,2732,2732,.5);horde(g,1366,1500,520,11,70);hero(g,1366,1460,260);title(g,'Synth Horde',1366,2200,190);`],
  'play-icon-512.png': [512, 512, `bg(g,512,512,.55);face(g,256,270,390);`],
  'feature-graphic.png': [1024, 500, `bg(g,1024,500,.58,240);horde(g,240,300,150,9,20);hero(g,225,300,80);title(g,'Synth Horde',690,215,84);g.fillStyle='#ffe86b';g.font='600 32px system-ui,sans-serif';g.fillText('Survive the neon hordes',690,275);`],
};
const b = await chromium.launch();
for (const [name, [w, h, code]] of Object.entries(jobs)) {
  const p = await b.newPage();
  const url = await p.evaluate(`(async()=>{${CAST_PRELOAD}${DRAW}const c=document.createElement('canvas');c.width=${w};c.height=${h};const g=c.getContext('2d');${code}return c.toDataURL('image/png');})()`);
  writeFileSync(OUT + name, Buffer.from(url.split(',')[1], 'base64')); await p.close(); console.log(name);
}
await b.close();
