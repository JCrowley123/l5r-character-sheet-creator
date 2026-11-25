'use strict';
// B18 board, light checks: opens the board file in the QA Chromium at 375 x 812 (phone, touch) and 1280 x 900 (laptop),
// light and dark, and records page errors, failed loads other than the font host, the page's horizontal scroll (the
// body must not scroll sideways), every picture loaded, and the decision controls present. Pictures of the top of the
// board and of one part (FOCUS, a CSS selector; round 1: #g03) are written for the record.
// Usage: [FOCUS=#id] run.sh check-board.cjs <board.html> <out folder>
const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const src=path.resolve(process.argv[2]);const out=path.resolve(process.argv[3]);fs.mkdirSync(out,{recursive:true});
// The board is published inside the artifact skeleton (a charset, a viewport with viewport-fit=cover and a small reset);
// the check opens it the same way.
const file=path.join(out,'board-wrapped.html');
fs.writeFileSync(file,'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'+
 '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}body{margin:0;font-size:14px;font-family:system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>'+
 fs.readFileSync(src,'utf8')+'</body></html>');
(async()=>{
 const b=await chromium.launch();const R={board:src,bytes:fs.statSync(file).size,checked_utc:new Date().toISOString(),runs:[]};
 for(const [name,opt] of [['phone',{viewport:{width:375,height:812},isMobile:true,hasTouch:true,deviceScaleFactor:2}],['laptop',{viewport:{width:1280,height:900}}]]){
  for(const scheme of ['light','dark']){
   const c=await b.newContext(Object.assign({colorScheme:scheme},opt));const p=await c.newPage();
   const errs=[],failed=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text());});
   p.on('requestfailed',r=>{if(!/fonts\.(googleapis|gstatic)\.com/.test(r.url()))failed.push(r.url().slice(0,120));});
   await p.goto(pathToFileURL(file).href,{waitUntil:'load'});
   await p.evaluate(async()=>{for(const i of document.images){i.loading='eager';}await Promise.all([...document.images].map(i=>i.decode().catch(()=>null)));});
   const m=await p.evaluate(()=>{
    const de=document.documentElement;
    const wide=[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();if(r.right<=de.clientWidth+1)return false;
     for(let a=e.parentElement;a;a=a.parentElement){const o=getComputedStyle(a).overflowX;if(o==='auto'||o==='scroll')return false;}return true;}).slice(0,8).map(e=>e.tagName+'.'+e.className);
    return {scrollWidth:de.scrollWidth,clientWidth:de.clientWidth,horizontalScroll:de.scrollWidth>de.clientWidth,wideElements:wide,
     images:document.images.length,imagesBroken:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).length,
     sections:document.querySelectorAll('section[id^="g"],article.card').length,decisions:document.querySelectorAll('fieldset.decide,fieldset.answer').length,
     radios:document.querySelectorAll('fieldset.decide input[type=radio],fieldset.answer input[type=radio]').length,status:document.getElementById('where').textContent,
     title:document.title};});
   if(scheme==='light'){await p.screenshot({path:path.join(out,`board-${name}-top.png`)});
    await p.locator(process.env.FOCUS||'#g03').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,`board-${name}-focus.png`)});}
   else await p.screenshot({path:path.join(out,`board-${name}-dark-top.png`)});
   R.runs.push(Object.assign({size:name,scheme,errors:errs,failedLoads:failed},m));await c.close();
  }
 }
 await b.close();
 R.pass=R.runs.every(r=>!r.errors.length&&!r.failedLoads.length&&!r.horizontalScroll&&!r.imagesBroken);
 fs.writeFileSync(path.join(out,'board-checks.json'),JSON.stringify(R,null,1)+'\n');
 for(const r of R.runs)console.log(r.size,r.scheme,'errors',r.errors.length,'failed',r.failedLoads.length,'hscroll',r.horizontalScroll,`${r.scrollWidth}/${r.clientWidth}`,'images',r.images,'broken',r.imagesBroken,'decisions',r.decisions,r.wideElements.join(' '));
 console.log('pass',R.pass);
})().catch(e=>{console.error(e);process.exit(1);});
