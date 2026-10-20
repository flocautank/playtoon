// Dessine l'icône, l'écran de démarrage et les visuels Play de Nova Foundry (canvas, Chromium headless),
// puis `npx @capacitor/assets generate --android` en tire toutes les tailles.
// 1.11.0 : à l'identité « atlas céleste » du jeu (plus l'étoile de dessin animé souriante sur fond violet ni la police
// système) : nuit d'encre et grain de papier, astrolabe gravé (anneaux gradués, petites constellations), soleil d'atlas
// (rayons droits et ondulés, disque hachuré sur l'ombre, double liseré doré), repères des forges en orbite,
// titre en IM Fell English SC doré, comme dans le jeu. Les mêmes fonctions servent aux visuels Steam.
import { createRequire } from 'module';
import { writeFileSync, mkdirSync } from 'fs';
import { FORGE_FONTS_PRELOAD } from './fonts-preload.mjs';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
const OUT = new URL('./assets/', import.meta.url).pathname; mkdirSync(OUT, { recursive: true });

const DRAW = `
function rng(s){return()=>((s=Math.imul(s^(s>>>15),2246822507)^Math.imul(s,3266489909))>>>0)/4294967296;}
// fond : nuit d'encre bleue, lueur au centre, grain de papier, étoiles fines (quelques-unes dorées), méridiens en pointillé
function bg(g,w,h,cx,cy){cx=cx===undefined?w/2:cx;cy=cy===undefined?h/2:cy;const m=Math.max(w,h);
  let gr=g.createRadialGradient(cx,cy,0,cx,cy,m*.8);gr.addColorStop(0,'#1c2a5c');gr.addColorStop(.45,'#0e1534');gr.addColorStop(1,'#060918');g.fillStyle=gr;g.fillRect(0,0,w,h);
  const rn=rng(11);for(let i=0;i<Math.round(w*h/1800)+30;i++){const z=m*(.0006+rn()*.0016);g.globalAlpha=.2+rn()*.6;g.fillStyle=rn()<.18?'#f3d48a':'#e8eeff';g.fillRect(rn()*w,rn()*h,z,z);}g.globalAlpha=1;
  g.save();g.strokeStyle='rgba(184,151,85,.13)';g.lineWidth=Math.max(1,m*.0012);g.setLineDash([m*.004,m*.008]);
  for(let k=1;k<6;k++){g.beginPath();g.ellipse(cx,cy+m*.9,m*(.3+k*.28),m*(.7+k*.12),0,0,Math.PI*2);g.stroke();}g.restore();
  const rg=rng(5);g.fillStyle='rgba(239,226,191,.035)';for(let i=0;i<Math.round(w*h/220);i++){g.fillRect(rg()*w,rg()*h,1.2,1.2);}
  gr=g.createRadialGradient(w/2,h/2,m*.35,w/2,h/2,m*.8);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.45)');g.fillStyle=gr;g.fillRect(0,0,w,h);}
// soleil d'atlas dans son astrolabe ; R : rayon du disque ; opt.rings=false pour les petites tailles
function star(g,X,Y,R,opt){opt=opt||{};const rings=opt.rings!==false,L=Math.max(1,R*.012);g.save();g.lineCap='round';
  // couronne
  let gr=g.createRadialGradient(X,Y,R*.5,X,Y,R*2.3);gr.addColorStop(0,'rgba(255,236,190,.55)');gr.addColorStop(.35,'rgba(243,212,138,.16)');gr.addColorStop(1,'rgba(243,212,138,0)');g.fillStyle=gr;g.beginPath();g.arc(X,Y,R*2.3,0,7);g.fill();
  if(rings){[[1.62,72],[2.02,36],[2.45,12]].forEach(([k,n],ri)=>{const rr=R*k;g.strokeStyle='rgba(184,151,85,.75)';g.lineWidth=L*1.1;g.beginPath();g.arc(X,Y,rr,0,7);g.stroke();
      g.strokeStyle='rgba(243,212,138,.7)';g.lineWidth=L;for(let q=0;q<n;q++){const a=q/n*Math.PI*2+ri*.1,l=q%(n/12)?R*.035:R*.08;g.beginPath();g.moveTo(X+Math.cos(a)*rr,Y+Math.sin(a)*rr);g.lineTo(X+Math.cos(a)*(rr-l),Y+Math.sin(a)*(rr-l));g.stroke();}
      if(ri===2)for(let z=0;z<12;z++){const a=(z+.5)/12*Math.PI*2,gx=X+Math.cos(a)*(rr-R*.2),gy=Y+Math.sin(a)*(rr-R*.2);const pts=[0,1,2,3].map(q=>[gx+Math.sin(z*7.3+q*2.1)*R*.06,gy+Math.cos(z*3.1+q*1.7)*R*.06]);
        g.strokeStyle='rgba(243,212,138,.5)';g.lineWidth=L*.8;g.beginPath();pts.forEach(([x,y],q)=>q?g.lineTo(x,y):g.moveTo(x,y));g.stroke();g.fillStyle='#f3d48a';pts.forEach(([x,y])=>{g.beginPath();g.arc(x,y,L*1.3,0,7);g.fill();});}});
    // orbite des forges et leurs repères (point, anneau, étoile à quatre branches, croix)
    if(opt.orbit!==false){const co=Math.cos(-.3),si=Math.sin(-.3);[1.5,1.78].forEach((k,oi)=>{const o=R*k;g.setLineDash([L*2,L*6]);g.strokeStyle='rgba(243,212,138,.3)';g.lineWidth=L;g.beginPath();g.ellipse(X,Y,o,o*.42,-.3,0,7);g.stroke();g.setLineDash([]);
      for(let q=0;q<9;q++){const a=q/9*Math.PI*2+oi,ca=Math.cos(a)*o,sa=Math.sin(a)*o*.42,px=X+ca*co-sa*si,py=Y+ca*si+sa*co,front=Math.sin(a)>0,z=R*(front?.032:.024),sh=(q+oi)%4;
        if(!front)continue;g.fillStyle=q%2?'#efe2bf':'#f3d48a';g.strokeStyle=g.fillStyle;g.lineWidth=L;g.beginPath();
        if(sh===0){g.arc(px,py,z*.8,0,7);g.fill();}else if(sh===1){g.arc(px,py,z,0,7);g.stroke();}else if(sh===2){const s=z*1.6;g.moveTo(px,py-s);g.lineTo(px+s*.3,py-s*.3);g.lineTo(px+s,py);g.lineTo(px+s*.3,py+s*.3);g.lineTo(px,py+s);g.lineTo(px-s*.3,py+s*.3);g.lineTo(px-s,py);g.lineTo(px-s*.3,py-s*.3);g.closePath();g.fill();}else{g.moveTo(px-z*1.4,py);g.lineTo(px+z*1.4,py);g.moveTo(px,py-z*1.4);g.lineTo(px,py+z*1.4);g.stroke();}}});}}
  // rayons gravés : droits et ondulés en alternance
  const nR=36;for(let k=0;k<nR;k++){const a=k/nR*Math.PI*2,wavy=k%2,l=R*(wavy?1.34:1.5+.22*Math.sin(k*2.3)),r0=R*.98;g.strokeStyle=wavy?'rgba(255,240,205,.42)':'rgba(255,240,205,.62)';g.lineWidth=wavy?L*1.1:L*1.5;g.beginPath();
    if(!wavy){g.moveTo(X+Math.cos(a)*r0,Y+Math.sin(a)*r0);g.lineTo(X+Math.cos(a)*l,Y+Math.sin(a)*l);}else for(let q=0;q<=40;q++){const rr=r0+(l-r0)*q/40,off=Math.sin(q/40*Math.PI*2*2.5)*R*.022,x=X+Math.cos(a)*rr-Math.sin(a)*off,y=Y+Math.sin(a)*rr+Math.cos(a)*off;q?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();}
  // disque : plasma doré, ombre hachurée en croissant, points de gravure
  g.translate(X,Y);gr=g.createRadialGradient(-R*.15,-R*.2,R*.05,0,0,R*.82);gr.addColorStop(0,'#fffdf2');gr.addColorStop(.45,'#fbe7b0');gr.addColorStop(.85,'#e4b866');gr.addColorStop(1,'#b8863a');
  g.shadowColor='rgba(255,220,150,.8)';g.shadowBlur=R*.25;g.fillStyle=gr;g.beginPath();g.arc(0,0,R*.82,0,7);g.fill();g.shadowBlur=0;
  g.save();g.beginPath();g.arc(0,0,R*.82,0,7);g.clip();g.beginPath();g.rect(-R*2,-R*2,R*4,R*4);g.arc(-R*.27,-R*.3,R*.8,0,7);g.clip('evenodd');
  g.strokeStyle='rgba(70,45,15,.42)';g.lineWidth=L*1.1;for(let k=-16;k<=16;k++){const y=k*R/14;g.beginPath();g.moveTo(-R,y);g.quadraticCurveTo(0,y+R*.2,R,y);g.stroke();}
  g.rotate(.9);g.strokeStyle='rgba(70,45,15,.26)';for(let k=-16;k<=16;k++){const y=k*R/12;g.beginPath();g.moveTo(-R,y);g.quadraticCurveTo(0,y+R*.16,R,y);g.stroke();}g.restore();
  const rn=rng(7);g.fillStyle='rgba(60,38,12,.4)';for(let k=0;k<Math.round(R*1.6);k++){const a=rn()*Math.PI*2,d=R*.82*Math.sqrt(.35+rn()*.65);g.fillRect(Math.cos(a)*d,Math.sin(a)*d,L*1.2,L*1.2);}
  g.strokeStyle='rgba(243,212,138,.9)';g.lineWidth=L*1.8;g.beginPath();g.arc(0,0,R*.9,0,7);g.stroke();g.strokeStyle='rgba(243,212,138,.45)';g.lineWidth=L;g.beginPath();g.arc(0,0,R*.96,0,7);g.stroke();g.restore();}
// un astérisme (Le Creuset), étoiles reliées au trait doré
function asterism(g,X,Y,s,a){a=a===undefined?1:a;const P=[[7,11],[11,27],[20,33],[29,27],[33,11],[20,21],[16,13],[20,5],[24,13],[20,37]],E=[[0,1],[1,2],[2,3],[3,4],[5,6],[6,7],[7,8],[8,5],[2,9]];
  g.save();g.globalAlpha=a;g.translate(X-s/2,Y-s/2);const k=s/40;g.strokeStyle='rgba(243,212,138,.55)';g.lineWidth=Math.max(1,s*.008);g.beginPath();E.forEach(([i,j])=>{g.moveTo(P[i][0]*k,P[i][1]*k);g.lineTo(P[j][0]*k,P[j][1]*k);});g.stroke();
  P.forEach(([x,y],i)=>{const r=s*(i%3?.014:.022);g.fillStyle='#fff6dc';g.shadowColor='#f3d48a';g.shadowBlur=s*.03;g.beginPath();g.moveTo(x*k,y*k-r*2.2);g.lineTo(x*k+r*.5,y*k-r*.5);g.lineTo(x*k+r*2.2,y*k);g.lineTo(x*k+r*.5,y*k+r*.5);g.lineTo(x*k,y*k+r*2.2);g.lineTo(x*k-r*.5,y*k+r*.5);g.lineTo(x*k-r*2.2,y*k);g.lineTo(x*k-r*.5,y*k-r*.5);g.closePath();g.fill();});g.restore();}
// titre : IM Fell English SC doré, cerné d'encre, filets et losanges de part et d'autre (comme le nom du stade)
function title(g,txt,x,y,maxW,size,align){g.save();g.textAlign=align||'center';g.textBaseline='middle';let s=size;
  do{g.font=s+"px 'NF Title'";s-=2;}while(g.measureText(txt).width>maxW&&s>8);s+=2;g.font=s+"px 'NF Title'";
  g.lineJoin='round';g.lineWidth=s*.09;g.strokeStyle='#0b1028';g.shadowColor='rgba(243,212,138,.45)';g.shadowBlur=s*.35;g.strokeText(txt,x,y);g.shadowColor='transparent';
  const gr=g.createLinearGradient(0,y-s*.45,0,y+s*.4);gr.addColorStop(0,'#fff3cf');gr.addColorStop(.55,'#f3d48a');gr.addColorStop(1,'#c99a45');g.fillStyle=gr;g.fillText(txt,x,y);g.restore();}
function sub(g,txt,x,y,maxW,size,col,align){g.save();g.textAlign=align||'center';g.textBaseline='middle';let s=size;txt=txt.toUpperCase();
  do{g.font=s+"px 'NF Title'";s-=1;}while(g.measureText(txt).width*1.12+s*4.4>maxW&&s>8);s+=1;g.font=s+"px 'NF Title'";if('letterSpacing' in g)g.letterSpacing=Math.round(s*.12)+'px';
  const tw=g.measureText(txt).width;g.fillStyle=col||'#d8c79a';g.fillText(txt,x,y);
  if((align||'center')==='center'){g.strokeStyle='rgba(184,151,85,.8)';g.lineWidth=Math.max(1,s*.06);for(const sg of [-1,1]){const x0=x+sg*(tw/2+s*.6),x1=x0+sg*s*1.3;g.beginPath();g.moveTo(x0,y);g.lineTo(x1,y);g.stroke();g.fillStyle='#b89755';g.beginPath();g.moveTo(x1+sg*s*.15,y-s*.18);g.lineTo(x1+sg*s*.4,y);g.lineTo(x1+sg*s*.15,y+s*.18);g.lineTo(x1-sg*s*.05,y);g.closePath();g.fill();}}g.restore();}
// visuels Steam (../desktop/steam/make-art.mjs) : mêmes titres
function TITLE_OVERRIDE(g,txt,x,y,maxW,size,align){title(g,txt,x,y,maxW,size,align);}
function SUB_OVERRIDE(g,txt,x,y,maxW,size,col,align){sub(g,txt,x,y,maxW,size,'#d8c79a',align);}
`;
const SPLASH = `bg(g,2732,2732,1366,1200);star(g,1366,1200,300);title(g,'Nova Foundry',1366,1900,1300,190);sub(g,'Forge stars · Go Supernova',1366,2050,1100,62);`;
const jobs = {
  'icon-only.png': [1024, 1024, `bg(g,1024,1024);star(g,512,512,190,{orbit:false});`],
  'icon-foreground.png': [1024, 1024, `star(g,512,512,150,{rings:false});`],          // zone sûre de l'icône adaptative : ~66 %
  'icon-background.png': [1024, 1024, `bg(g,1024,1024);g.save();g.globalAlpha=.6;star(g,512,512,150,{rings:true});g.restore();g.fillStyle='rgba(6,9,24,.35)';g.fillRect(0,0,1024,1024);`],
  'splash.png': [2732, 2732, SPLASH],
  'splash-dark.png': [2732, 2732, SPLASH],
  'play-icon-512.png': [512, 512, `bg(g,512,512);star(g,256,256,95,{orbit:false});`],
  'feature-graphic.png': [1024, 500, `bg(g,1024,500,250,250);asterism(g,930,95,120,.8);star(g,235,250,88);title(g,'Nova Foundry',690,215,560,96);sub(g,'Forge stars · Go Supernova',690,300,440,28);`],
};
const b = await chromium.launch();
for (const [name, [w, h, code]] of Object.entries(jobs)) {
  const p = await b.newPage();
  const url = await p.evaluate(`(async()=>{${FORGE_FONTS_PRELOAD}${DRAW}const c=document.createElement('canvas');c.width=${w};c.height=${h};const g=c.getContext('2d');${code}return c.toDataURL('image/png');})()`);
  writeFileSync(OUT + name, Buffer.from(url.split(',')[1], 'base64')); await p.close();
  console.log(name, w + '×' + h);
}
await b.close();
