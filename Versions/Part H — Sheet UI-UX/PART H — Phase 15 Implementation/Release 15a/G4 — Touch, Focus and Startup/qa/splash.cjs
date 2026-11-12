'use strict';
// A17 scratch: the splash's own markup and CSS (copied from the live source) at several screen shapes, today vs proposed.
// node splash.cjs <splash-dir-with-webp> <outdir>
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');const {chromium}=require('playwright');
const [dir,outdir]=process.argv.slice(2).map(x=>path.resolve(x));fs.mkdirSync(outdir,{recursive:true});
const base=`#l5rSplash{position:fixed;inset:0;background:#fde8d0}
#l5rSplash .l5r-splash-art,#l5rSplash .l5r-splash-art img{display:block;width:100%;height:100%}
#l5rSplash .l5r-splash-art img{object-fit:contain}html,body{margin:0}`;
const proposed=`#l5rSplash .l5r-splash-art img{object-fit:cover;object-position:50% 35%}
@media (max-aspect-ratio:2/3){#l5rSplash .l5r-splash-art img{object-position:50% 45%}}
@media (min-aspect-ratio:3/2){#l5rSplash .l5r-splash-art img{object-position:45% 50%}}`;
const page=(css,landscapeFrom)=>`<!doctype html><meta name=viewport content="width=device-width,initial-scale=1"><style>${base}${css}</style>
<div id=l5rSplash><picture class=l5r-splash-art><source media="(max-aspect-ratio: 2/3)" srcset="portrait.webp"><source media="(min-aspect-ratio: ${landscapeFrom})" srcset="landscape.webp"><img src="square.webp" alt=""></picture></div>`;
fs.writeFileSync(path.join(dir,'today.html'),page('','4/3'));
fs.writeFileSync(path.join(dir,'proposed.html'),page(proposed,'3/2'));
const sizes=[['phone-app',390,844],['phone-safari',390,664],['phone-landscape',844,390],['small-landscape',667,375],['narrow-landscape',844,340],['ipad-portrait',768,1024],['ipad-landscape',1024,768],['laptop-1440',1440,1000],['laptop-1536',1536,864],['laptop-browser',1366,650],['laptop-3x2',1500,1000]];
(async()=>{const b=await chromium.launch();const rep=[];try{for(const [n,w,h] of sizes){const c=await b.newContext({viewport:{width:w,height:h}});const p=await c.newPage();
 for(const v of ['today','proposed']){await p.goto(pathToFileURL(path.join(dir,v+'.html')).href);await p.waitForFunction(()=>document.querySelector('img').complete&&document.querySelector('img').currentSrc);
  const info=await p.evaluate(()=>{const i=document.querySelector('img');return{art:i.currentSrc.split('/').pop(),fit:getComputedStyle(i).objectFit,pos:getComputedStyle(i).objectPosition,nw:i.naturalWidth,nh:i.naturalHeight};});
  const s=Math.min(innerWidthOf(w,h,info)) ;
  await p.screenshot({path:path.join(outdir,`${n}-${v}.png`)});rep.push({n,w,h,v,...info,...geom(w,h,info)});}
 await c.close();}}finally{await b.close();}
fs.writeFileSync(path.join(outdir,'splash.json'),JSON.stringify(rep,null,1));console.log(rep.map(r=>`${r.n} ${r.w}x${r.h} ${r.v} ${r.art} bands ${r.bandsPct}% crop ${r.cropPct}%`).join('\n'));})();
function innerWidthOf(){return[1];}
// paper bands (contain) or cropped share of the art (cover), as % of the screen / art
function geom(w,h,i){const r=i.nw/i.nh,v=w/h;if(i.fit==='contain'){const band=v>r?1-(h*r)/w:1-(w/r)/h;return{bandsPct:+(band*100).toFixed(1),cropPct:0,bandSides:v>r?'left/right':'top/bottom'};}
 const crop=v>r?1-r/v:1-v/r;return{bandsPct:0,cropPct:+(crop*100).toFixed(1),cropAxis:v>r?'height':'width'};}
