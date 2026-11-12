'use strict';
// G4 reproduction on G3 as live (scratch, not qualification). node reproduce.cjs <outdir>
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{pathToFileURL}=require('url');
const {chromium}=require('playwright');
const V='C:/Users/jcrow/l5r-character-sheet-creator/Versions';
const sheet=path.join(V,'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html');
const MATSU=path.join(V,'QA — Release 7b.1 2026-10-28/qa/walk/7b1-checks-matsu.l5r.json');
const KITSU=path.join(V,'BUGFIX — Older School Choices/qa/older-kitsu.l5r.json');
const out=path.resolve(process.argv[2]);fs.mkdirSync(out,{recursive:true});
const report={source_sha256:crypto.createHash('sha256').update(fs.readFileSync(sheet)).digest('hex'),captured_utc:new Date().toISOString()};
const settle=p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function tab(p,label){await p.evaluate(async l=>{const C=window.__L5R_CAROUSEL__;C.goToTab(l);await C.whenSettled();},label);await settle(p);}
async function open(b,phone,fixture,name){
 const c=await b.newContext(phone?{viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2}:{viewport:{width:1440,height:1000},deviceScaleFactor:1});
 const p=await c.newPage();p.errors=[];p.on('pageerror',e=>p.errors.push(String(e)));p.on('dialog',d=>d.accept().catch(()=>{}));
 await p.goto(pathToFileURL(sheet).href,{waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready,null,{timeout:60000});
 await p.waitForFunction(()=>!document.getElementById('l5rSplash'),null,{timeout:30000});
 if(fixture){await p.locator('#fileImport').setInputFiles(fixture);await p.waitForFunction(n=>document.getElementById('f_name').value===n,name);await p.waitForTimeout(500);}
 return {c,p};
}
const probe=p=>p.evaluate(()=>{const a=document.activeElement;return{tag:a.tagName,id:a.id,cls:String(a.className).slice(0,40),text:(a.textContent||'').trim().slice(0,40),page:a.classList.contains('car-page'),pageSlug:(a.closest('.car-page')||{}).getAttribute?.('data-car-slug')||null,ring:a.matches(':focus-visible')};});
(async()=>{const b=await chromium.launch();report.browser=b.version();try{
 // ---------- A09: editable text sizes and tap behaviour, phone, Manage ----------
 {const {c,p}=await open(b,true,MATSU,'7b.1 checks — Matsu');
  await p.evaluate(()=>window.__L5R_TEST__.MODES12.set('management'));await settle(p);
  report.viewportMeta=await p.evaluate(()=>document.querySelector('meta[name=viewport]')?.content);
  const labels=await p.evaluate(()=>[...document.querySelectorAll('.car-tab')].map(t=>t.textContent));
  const pages={};
  for(const l of labels){await tab(p,l);
   pages[l]=await p.evaluate(()=>{const pg=document.querySelector('.car-page:not([inert])');
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden';};
    const ed=[...pg.querySelectorAll('input:not([type=checkbox]):not([type=radio]):not([type=hidden]):not([type=file]):not([type=range]),textarea,select')].filter(vis);
    const sig=e=>e.tagName.toLowerCase()+(e.type&&e.tagName==='INPUT'?'['+e.type+']':'')+(e.id?'#'+e.id:'')+(e.className?'.'+String(e.className).split(/\s+/)[0]:'');
    const small=ed.filter(e=>parseFloat(getComputedStyle(e).fontSize)<16).map(e=>({sig:sig(e),font:getComputedStyle(e).fontSize,ro:e.readOnly||e.disabled}));
    const btn=[...pg.querySelectorAll('button')].filter(vis);
    const ta={};btn.forEach(e=>{const t=getComputedStyle(e).touchAction;ta[t]=(ta[t]||0)+1;});
    return{editable:ed.length,under16:small.length,sizes:[...new Set(small.map(s=>s.font))],examples:[...new Map(small.map(s=>[s.sig.replace(/#.*?(?=\.|$)/,''),s])).values()].slice(0,12),buttons:btn.length,touchAction:ta};});
  }
  report.A09={pages};
  // the characteristic controls screenshot (Rank/Points/steppers) on Identity and Rings
  await tab(p,'Rings & Traits').catch(()=>{});await p.screenshot({path:path.join(out,'a09-phone-rings.png')});
  await tab(p,'Identity');await p.screenshot({path:path.join(out,'a09-phone-identity.png')});
  report.A09.errors=p.errors;await c.close();}
 // ---------- A10: the Advanced Schools row and focus after Go ----------
 report.A10={};
 for(const phone of [true,false]){const k=phone?'phone':'laptop';const {c,p}=await open(b,phone,MATSU,'7b.1 checks — Matsu');
  await p.evaluate(()=>window.__L5R_TEST__.MODES12.set('management'));await tab(p,'Identity');
  await p.locator('#ap7Go').scrollIntoViewIfNeeded();await settle(p);
  const geo=await p.evaluate(()=>{const line=document.getElementById('ap7Pointer'),t=document.getElementById('ap7Text'),g=document.getElementById('ap7Go');
   const R=e=>{const r=e.getBoundingClientRect();return{x:+r.x.toFixed(1),y:+r.y.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1),bottom:+r.bottom.toFixed(1)};};
   const rg=document.createRange();rg.selectNodeContents(t);const rects=[...rg.getClientRects()].map(r=>({y:+r.y.toFixed(1),h:+r.height.toFixed(1),bottom:+r.bottom.toFixed(1)}));
   const last=rects.at(-1),gb=g.getBoundingClientRect();
   return{line:R(line),text:t.textContent,textLines:rects.length,lastTextLine:last,button:R(g),buttonFont:getComputedStyle(g).fontSize,
    textCentreY:last?+(last.y+last.h/2).toFixed(1):null,buttonCentreY:+(gb.y+gb.height/2).toFixed(1),
    centreOffset:last?+((gb.y+gb.height/2)-(last.y+last.h/2)).toFixed(1):null,buttonBelowText:last?gb.y>=last.bottom-1:null};});
  const lr=await p.locator('#ap7Pointer').boundingBox();
  await p.screenshot({path:path.join(out,`a10-${k}-row-today.png`),clip:{x:0,y:Math.max(0,lr.y-90),width:phone?390:1440,height:lr.height+130}});
  // the tap
  if(phone)await p.locator('#ap7Go').tap();else await p.locator('#ap7Go').click();
  await p.evaluate(()=>window.__L5R_CAROUSEL__.whenSettled());await settle(p);await p.waitForTimeout(300);
  const after=await probe(p);
  const state=await p.evaluate(()=>{const act=window.__L5R_CAROUSEL__.getActiveTab();const id=[...document.querySelectorAll('.car-page')].find(x=>x.contains(document.getElementById('schoolsPanel')));const pan=document.getElementById('advancedSchoolPanel');
   return{active:act&&act.label,identityInert:id.hasAttribute('inert'),panelTop:pan?+pan.getBoundingClientRect().y.toFixed(1):null,panelHeading:pan?(pan.querySelector('h1,h2,h3,h4,.section-title,legend')||{}).textContent?.trim().slice(0,60):null,headingTag:pan?(pan.querySelector('h1,h2,h3,h4,.section-title,legend')||{}).tagName:null};});
  await p.screenshot({path:path.join(out,`a10-${k}-after-go-today.png`)});
  // Tab key: where does it go next?
  let tabNext=null;if(!phone){await p.keyboard.press('Tab');tabNext=await probe(p);}
  report.A10[k]={geo,after,state,tabNext,errors:p.errors};await c.close();}
 // ---------- Gold ring: focus after the School-choice dialog closes (as iPhone Safari focuses) ----------
 {const {c,p}=await open(b,true,KITSU,'Older Kitsu test character');
  await p.evaluate(()=>window.__L5R_TEST__.MODES12.set('management'));await tab(p,'Identity');
  await p.evaluate(()=>{const pg=[...document.querySelectorAll('.car-page')].find(x=>x.contains(document.querySelector('#validationReport')));pg.focus({preventScroll:true});});
  const before=await probe(p);
  await p.evaluate(()=>window.__L5R_TEST__.SC8.open('Kitsu Shugenja','spell'));await settle(p);
  await p.locator('#sc8Done').tap();await p.waitForTimeout(200);
  const after=await probe(p);
  const ring=await p.evaluate(()=>{const s=[...document.styleSheets].flatMap(ss=>{try{return[...ss.cssRules]}catch{return[]}}).filter(r=>r.selectorText&&/car-page:focus-visible/.test(r.selectorText)).map(r=>r.cssText);return s;});
  await p.screenshot({path:path.join(out,'ring-phone-after-later.png')});
  report.ring={before,after,rules:ring,errors:p.errors};await c.close();}
 // ---------- A18: first and second Manage tap, input to painted frame, phone, 1x and 4x CPU ----------
 report.A18={};
 for(const rate of [1,4]){const runs=[];
  for(let i=0;i<3;i++){const {c,p}=await open(b,true,MATSU,'7b.1 checks — Matsu');
   const cdp=await c.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate});
   await p.evaluate(()=>window.__L5R_TEST__.MODES12.set('play'));await tab(p,'Identity');await p.waitForTimeout(500);
   await p.evaluate(()=>{window.__g4t=[];const b=document.getElementById('pm12Toggle');
    ['pointerdown','touchstart','click'].forEach(t=>b.addEventListener(t,e=>{window.__g4t.push({t,ts:e.timeStamp,now:performance.now()});},{capture:true}));
    b.addEventListener('click',()=>{const t0=performance.now();requestAnimationFrame(()=>requestAnimationFrame(()=>window.__g4t.push({t:'painted',now:performance.now(),handler:t0})));});});
   const one=async()=>{await p.evaluate(()=>window.__g4t.length=0);await p.locator('#pm12Toggle').tap();await p.waitForTimeout(rate*400);
    return p.evaluate(()=>{const g=window.__g4t,start=g[0],click=g.find(x=>x.t==='click'),pt=g.find(x=>x.t==='painted');return{inputToClick:+(click.now-start.ts).toFixed(1),clickToPainted:+(pt.now-click.now).toFixed(1),inputToPainted:+(pt.now-start.ts).toFixed(1),mode:window.__L5R_TEST__.MODES12.mode};});};
   const first=await one();const back=await one();const second=await one();
   runs.push({first,second,back});await c.close();}
  report.A18['cpu'+rate+'x']=runs;}
}finally{await b.close();}
fs.writeFileSync(path.join(out,'reproduction.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report).slice(0,200));
})().catch(e=>{console.error(e);process.exitCode=1;});
