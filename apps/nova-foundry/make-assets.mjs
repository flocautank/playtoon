// Dessine l'icône, l'écran de démarrage et les visuels Play de Nova Foundry (canvas, Chromium headless),
// puis `npx @capacitor/assets generate --android` en tire toutes les tailles.
import { createRequire } from 'module';
import { writeFileSync, mkdirSync } from 'fs';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
const OUT = new URL('./assets/', import.meta.url).pathname; mkdirSync(OUT, { recursive: true });

const DRAW = `
function bg(g,w,h){const gr=g.createRadialGradient(w/2,h*.45,0,w/2,h/2,Math.max(w,h)*.75);gr.addColorStop(0,'#3a1d6e');gr.addColorStop(.55,'#160f3a');gr.addColorStop(1,'#0b0a1f');g.fillStyle=gr;g.fillRect(0,0,w,h);
  let s=7;const r=()=>(s=(s*16807)%2147483647)/2147483647;for(let i=0;i<Math.round(w*h/2500);i++){g.globalAlpha=.25+r()*.6;g.fillStyle='#fff';const z=r()*2+.5;g.fillRect(r()*w,r()*h,z,z);}g.globalAlpha=1;}
function star(g,X,Y,R){const hue=48;
  const halo=g.createRadialGradient(X,Y,R*.2,X,Y,R*2.4);halo.addColorStop(0,'hsla(40,100%,75%,.85)');halo.addColorStop(.4,'hsla(30,100%,60%,.25)');halo.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=halo;g.beginPath();g.arc(X,Y,R*2.4,0,7);g.fill();
  // orbites de forges
  const cols=['#ffe38a','#ff9d5c','#7fd6ff','#c9d2ff','#a0ffe0','#d58bff'];
  for(let i=0;i<3;i++){const o=R*(1.35+i*.28);g.strokeStyle='rgba(255,255,255,.12)';g.lineWidth=R*.02;g.beginPath();g.ellipse(X,Y,o,o*.42,-.35,0,7);g.stroke();
    for(let k=0;k<5;k++){const a=k*1.25+i;g.fillStyle=cols[(i*2+k)%6];g.beginPath();const px=X+Math.cos(a)*o*Math.cos(-.35)-Math.sin(a)*o*.42*Math.sin(-.35),py=Y+Math.cos(a)*o*Math.sin(-.35)+Math.sin(a)*o*.42*Math.cos(-.35);g.arc(px,py,R*.07,0,7);g.fill();}}
  g.save();g.translate(X,Y);const core=g.createRadialGradient(0,-R*.2,R*.1,0,0,R);core.addColorStop(0,'#fffbe6');core.addColorStop(.5,'hsl('+hue+',100%,62%)');core.addColorStop(1,'hsl(28,95%,48%)');
  g.fillStyle=core;g.shadowColor='hsl(40,100%,60%)';g.shadowBlur=R*.4;g.beginPath();for(let k=0;k<10;k++){const rr=k%2?R*.48:R;const a=-Math.PI/2+k*Math.PI/5;g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}g.closePath();g.fill();
  g.shadowBlur=0;g.fillStyle='#3a2a10';g.beginPath();g.arc(-R*.16,-R*.05,R*.06,0,7);g.arc(R*.16,-R*.05,R*.06,0,7);g.fill();
  g.strokeStyle='#3a2a10';g.lineWidth=R*.04;g.lineCap='round';g.beginPath();g.arc(0,R*.05,R*.12,.2,Math.PI-.2);g.stroke();g.restore();}
`;
const jobs = {
  'icon-only.png': [1024, 1024, `bg(g,1024,1024);star(g,512,530,300);`],
  'icon-foreground.png': [1024, 1024, `star(g,512,530,235);`],
  'icon-background.png': [1024, 1024, `bg(g,1024,1024);`],
  'splash.png': [2732, 2732, `bg(g,2732,2732);star(g,1366,1250,330);g.fillStyle='#fff';g.font='900 170px system-ui,sans-serif';g.textAlign='center';g.fillText('Nova Foundry',1366,1830);`],
  'splash-dark.png': [2732, 2732, `bg(g,2732,2732);star(g,1366,1250,330);g.fillStyle='#fff';g.font='900 170px system-ui,sans-serif';g.textAlign='center';g.fillText('Nova Foundry',1366,1830);`],
  'play-icon-512.png': [512, 512, `bg(g,512,512);star(g,256,265,150);`],
  'feature-graphic.png': [1024, 500, `bg(g,1024,500);star(g,230,250,120);g.fillStyle='#fff';g.font='900 72px system-ui,sans-serif';g.fillText('Nova Foundry',430,235,560);g.fillStyle='#ffd98a';g.font='600 32px system-ui,sans-serif';g.fillText('Forge stars · Go Supernova',434,296,560);`],
};
const b = await chromium.launch();
for (const [name, [w, h, code]] of Object.entries(jobs)) {
  const p = await b.newPage();
  const url = await p.evaluate(`(()=>{${DRAW}const c=document.createElement('canvas');c.width=${w};c.height=${h};const g=c.getContext('2d');${code}return c.toDataURL('image/png');})()`);
  writeFileSync(OUT + name, Buffer.from(url.split(',')[1], 'base64')); await p.close(); console.log(name);
}
await b.close();
