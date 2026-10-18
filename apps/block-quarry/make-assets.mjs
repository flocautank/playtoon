// Dessine l'icône et l'écran de démarrage de Block Quarry (canvas, rendu par Chromium headless),
// puis `npx @capacitor/assets generate --android --ios` en tire toutes les tailles.
// Direction « Carrière » (1.10.0) : la même dalle que le jeu — cadre de grès boulonné, ardoise, minéraux taillés, gemme
// libérée — sur les strates de la carrière, et le titre en Bungee doré (polices du jeu, voir fonts-preload.mjs).
import { createRequire } from 'module';
import { writeFileSync } from 'fs';
import { QUARRY_FONTS_PRELOAD } from './fonts-preload.mjs';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
const OUT = new URL('./assets/', import.meta.url).pathname;

const DRAW = `
function rr(g,x,y,w,h,r){g.beginPath();g.roundRect(x,y,w,h,r);}
function sh(hex,a){const n=parseInt(hex.slice(1),16),c=v=>Math.max(0,Math.min(255,v+a));return 'rgb('+c(n>>16)+','+c((n>>8)&255)+','+c(n&255)+')';}
function rng(h){return()=>((h=Math.imul(h^(h>>>13),1274126177)>>>0)/4294967296);}
// minéral taillé, comme dans le jeu (js/blocks.js, stoneSprite) : table polie, biseaux, veines, grain, éclat
function stone(g,x,y,s,col,seed){const p=s*.045,b=s*.13,r=s*.12,x0=x+p,y0=y+p,x1=x+s-p,y1=y+s-p,rn=rng(seed||7);
  g.save();rr(g,x0,y0,x1-x0,y1-y0,r);g.clip();
  let gr=g.createLinearGradient(0,y0,0,y1);gr.addColorStop(0,sh(col,38));gr.addColorStop(1,sh(col,-70));g.fillStyle=gr;g.fillRect(x,y,s,s);
  g.fillStyle='rgba(255,255,255,.30)';g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y0);g.lineTo(x1-b,y0+b);g.lineTo(x0+b,y0+b);g.lineTo(x0+b,y1-b);g.lineTo(x0,y1);g.fill();
  g.fillStyle='rgba(0,0,0,.32)';g.beginPath();g.moveTo(x1,y1);g.lineTo(x0,y1);g.lineTo(x0+b,y1-b);g.lineTo(x1-b,y1-b);g.lineTo(x1-b,y0+b);g.lineTo(x1,y0);g.fill();
  gr=g.createLinearGradient(x0+b,y0+b,x1-b,y1-b);gr.addColorStop(0,sh(col,18));gr.addColorStop(1,sh(col,-28));g.fillStyle=gr;g.fillRect(x0+b,y0+b,x1-x0-2*b,y1-y0-2*b);
  g.strokeStyle='rgba(255,255,255,.16)';g.lineWidth=Math.max(1,s*.025);g.lineCap='round';
  for(let k=0;k<2;k++){g.beginPath();g.moveTo(x0+b,y0+b+rn()*s*.6);g.bezierCurveTo(x+s*.4,y+rn()*s,x+s*.6,y+rn()*s,x1-b,y0+b+rn()*s*.6);g.stroke();}
  g.fillStyle='rgba(0,0,0,.18)';for(let k=0;k<7;k++){g.beginPath();g.arc(x0+b+rn()*(s-2*b-2*p),y0+b+rn()*(s-2*b-2*p),s*.018+rn()*s*.02,0,7);g.fill();}
  g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.moveTo(x0+b*1.4,y0+b*1.3);g.lineTo(x0+b*3.2,y0+b*1.3);g.lineTo(x0+b*1.4,y0+b*2.6);g.fill();
  g.restore();g.strokeStyle='rgba(0,0,0,.45)';g.lineWidth=Math.max(1,s*.01);rr(g,x0,y0,x1-x0,y1-y0,r);g.stroke();}
// alvéole vide gravée dans l'ardoise
function slot(g,x,y,s){const p=s*.04;g.fillStyle='#211d24';rr(g,x+p,y+p,s-2*p,s-2*p,s*.1);g.fill();
  g.strokeStyle='rgba(0,0,0,.55)';g.lineWidth=s*.03;g.beginPath();g.moveTo(x+p*2,y+s-p*1.5);g.lineTo(x+p*1.5,y+p*2);g.lineTo(x+s-p*1.5,y+p*1.5);g.stroke();
  g.strokeStyle='rgba(255,255,255,.06)';g.beginPath();g.moveTo(x+s-p*1.5,y+p*2);g.lineTo(x+s-p*1.5,y+s-p*1.5);g.lineTo(x+p*2,y+s-p*1.5);g.stroke();}
function gem(g,cx,cy,r){g.save();g.shadowColor='#7ff6ff';g.shadowBlur=r*.9;g.fillStyle='#27e0ff';g.beginPath();g.moveTo(cx,cy-r);g.lineTo(cx+r*.85,cy-r*.2);g.lineTo(cx,cy+r);g.lineTo(cx-r*.85,cy-r*.2);g.closePath();g.fill();
  g.shadowBlur=0;g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.moveTo(cx,cy-r);g.lineTo(cx+r*.35,cy-r*.2);g.lineTo(cx-r*.35,cy-r*.2);g.closePath();g.fill();
  g.strokeStyle='rgba(10,60,80,.5)';g.lineWidth=r*.06;g.beginPath();g.moveTo(cx-r*.85,cy-r*.2);g.lineTo(cx+r*.85,cy-r*.2);g.moveTo(cx-r*.35,cy-r*.2);g.lineTo(cx,cy+r);g.lineTo(cx+r*.35,cy-r*.2);g.stroke();g.restore();}
function bolt(g,x,y,r){const bg=g.createRadialGradient(x-r*.35,y-r*.35,0,x,y,r*1.1);bg.addColorStop(0,'#e6d2b0');bg.addColorStop(1,'#5a4430');g.fillStyle=bg;g.beginPath();g.arc(x,y,r,0,7);g.fill();
  g.strokeStyle='rgba(40,25,15,.75)';g.lineWidth=r*.22;g.beginPath();g.moveTo(x-r*.6,y);g.lineTo(x+r*.6,y);g.stroke();}
// emblème : la dalle de jeu en 3×3 dans son cadre de grès, gemme au centre, un bloc qui sort de la carrière en haut à droite
const PAL=['#e0567a','#f0b23a',null,'#3fbf6a','GEM','#9a64e0',null,'#36c9b4','#3d8fe0'];
function logo(g,cx,cy,S,lift){const fr=S*.085,inner=S-2*fr,s=inner/3,x0=cx-S/2,y0=cy-S/2;
  g.save();g.shadowColor='rgba(0,0,0,.55)';g.shadowBlur=S*.06;g.shadowOffsetY=S*.025;
  let gr=g.createLinearGradient(0,y0,0,y0+S);gr.addColorStop(0,'#8a6c4f');gr.addColorStop(.5,'#5c4532');gr.addColorStop(1,'#3b2b1f');g.fillStyle=gr;rr(g,x0,y0,S,S,fr*.9);g.fill();g.restore();
  g.strokeStyle='rgba(255,225,180,.3)';g.lineWidth=S*.006;rr(g,x0+S*.004,y0+S*.004,S-S*.008,S-S*.008,fr*.9);g.stroke();
  const rn=rng(99);g.strokeStyle='rgba(40,25,15,.35)';g.lineWidth=S*.003;for(let k=0;k<12;k++){const yy=y0+rn()*S;g.beginPath();g.moveTo(x0+2,yy);g.quadraticCurveTo(cx,yy+(rn()-.5)*S*.05,x0+S-2,yy+(rn()-.5)*S*.02);g.stroke();}
  g.fillStyle='#18151b';rr(g,x0+fr-S*.008,y0+fr-S*.008,inner+S*.016,inner+S*.016,S*.02);g.fill();
  for(let i=0;i<9;i++){const x=x0+fr+(i%3)*s,y=y0+fr+Math.floor(i/3)*s,c=PAL[i];slot(g,x,y,s);
    if(c==='GEM'){stone(g,x,y,s,'#7d7f9c',11);gem(g,x+s/2,y+s*.47,s*.27);} else if(c) stone(g,x,y,s,c,i*13+5);}
  for(const [bx,by] of [[x0+fr*.5,y0+fr*.5],[x0+S-fr*.5,y0+fr*.5],[x0+fr*.5,y0+S-fr*.5],[x0+S-fr*.5,y0+S-fr*.5]]) bolt(g,bx,by,fr*.24);
  if(lift!==false){const lx=x0+fr+2*s+s*.18,ly=y0+fr-s*.42;g.save();g.translate(lx+s/2,ly+s/2);g.rotate(.2);g.shadowColor='rgba(0,0,0,.5)';g.shadowBlur=S*.04;g.shadowOffsetY=S*.03;
    stone(g,-s/2,-s/2,s,'#f0b23a',3);g.restore();
    g.fillStyle='#d9b98a';for(const [dx,dy,r] of [[.1,.95,.07],[.32,1.08,.05],[-.12,1.12,.04],[.72,1.02,.045]]){g.save();g.translate(lx+s*dx,ly+s*dy);g.rotate(dx*7);g.beginPath();g.moveTo(-s*r,-s*r*.5);g.lineTo(s*r,-s*r*.8);g.lineTo(s*r*.4,s*r);g.closePath();g.fill();g.restore();}}}
// fond : strates de la carrière, lumière chaude venue d'en haut, poussière
function bg(g,w,h){let gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#2c2230');gr.addColorStop(.48,'#33241f');gr.addColorStop(1,'#24180f');g.fillStyle=gr;g.fillRect(0,0,w,h);
  const m=Math.max(w,h);g.save();g.translate(w/2,h/2);g.rotate(-.14);const band=m/15;
  for(let y=-m;y<m;y+=band){g.fillStyle='rgba(255,220,180,.035)';g.fillRect(-m,y,2*m,band*.45);g.fillStyle='rgba(0,0,0,.08)';g.fillRect(-m,y+band*.45,2*m,band*.09);}g.restore();
  gr=g.createRadialGradient(w/2,-h*.12,0,w/2,-h*.12,m*.75);gr.addColorStop(0,'rgba(255,170,90,.32)');gr.addColorStop(1,'rgba(255,170,90,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);
  const rn=rng(5);g.fillStyle='#ffd9a8';for(let i=0;i<Math.round(w*h/9000)+10;i++){g.globalAlpha=.08+rn()*.18;g.beginPath();g.arc(rn()*w,rn()*h,m*(.0008+rn()*.0022),0,7);g.fill();}g.globalAlpha=1;}
// titre : Bungee doré cerné de brun, comme les éloges du jeu
function title(g,txt,x,y,maxW,size,align){g.save();g.textAlign=align||'center';g.textBaseline='middle';let s=size;
  do{g.font=s+"px 'BQ Display'";s-=2;}while(g.measureText(txt).width>maxW&&s>8);s+=2;
  g.lineJoin='round';g.lineWidth=s*.2;g.strokeStyle='#26140c';g.shadowColor='rgba(0,0,0,.5)';g.shadowBlur=s*.12;g.shadowOffsetY=s*.06;g.strokeText(txt,x,y);g.shadowColor='transparent';
  const gr=g.createLinearGradient(0,y-s*.45,0,y+s*.4);gr.addColorStop(0,'#fff6a8');gr.addColorStop(1,'#ff9d2e');g.fillStyle=gr;g.fillText(txt,x,y);g.restore();}
function sub(g,txt,x,y,maxW,size,col,align){g.save();g.textAlign=align||'center';g.textBaseline='middle';let s=size;
  do{g.font="800 "+s+"px 'BQ Label'";s-=1;}while(g.measureText(txt).width>maxW&&s>8);g.fillStyle=col||'#e8d3b0';g.fillText(txt.toUpperCase(),x,y);g.restore();}
// visuels Steam (../desktop/steam/make-art.mjs) : mêmes titres
function TITLE_OVERRIDE(g,txt,x,y,maxW,size,align){title(g,txt,x,y,maxW,size,align);}
function SUB_OVERRIDE(g,txt,x,y,maxW,size,col,align){sub(g,txt.toUpperCase(),x,y,maxW,size,'#e8d3b0',align);}
`;
const SPLASH = `bg(g,2732,2732);logo(g,1366,1230,760);title(g,'Block Quarry',1366,1800,1180,200);`;
const jobs = {
  'icon-only.png': [1024, 1024, `bg(g,1024,1024);logo(g,512,540,720);`],
  'icon-foreground.png': [1024, 1024, `logo(g,512,530,560);`],          // zone sûre de l'icône adaptative : ~66 %
  'icon-background.png': [1024, 1024, `bg(g,1024,1024);`],
  'splash.png': [2732, 2732, SPLASH],
  'splash-dark.png': [2732, 2732, SPLASH],
  'play-icon-512.png': [512, 512, `bg(g,512,512);logo(g,256,270,360);`],
  'feature-graphic.png': [1024, 500, `bg(g,1024,500);logo(g,228,262,330);title(g,'Block Quarry',672,222,560,92);sub(g,'Place blocks · Free the gems',672,312,540,36);`],
};
const b = await chromium.launch();
for (const [name, [w, h, code]] of Object.entries(jobs)) {
  const p = await b.newPage();
  const url = await p.evaluate(`(async()=>{${QUARRY_FONTS_PRELOAD}${DRAW}const c=document.createElement('canvas');c.width=${w};c.height=${h};const g=c.getContext('2d');${code}return c.toDataURL('image/png');})()`);
  writeFileSync(OUT + name, Buffer.from(url.split(',')[1], 'base64')); await p.close();
  console.log(name, w + '×' + h);
}
await b.close();
