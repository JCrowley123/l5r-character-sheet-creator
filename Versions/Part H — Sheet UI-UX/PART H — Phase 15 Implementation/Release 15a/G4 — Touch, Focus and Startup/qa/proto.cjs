'use strict';
// G4 scratch treatments on G3 as live (DOM/CSS injected in the test browser only). node proto.cjs <outdir>
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require('playwright');
const V='C:/Users/jcrow/l5r-character-sheet-creator/Versions';
const sheet=path.join(V,'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html');
const MATSU=path.join(V,'QA — Release 7b.1 2026-10-28/qa/walk/7b1-checks-matsu.l5r.json');
const KITSU=path.join(V,'BUGFIX — Older School Choices/qa/older-kitsu.l5r.json');
const out=path.resolve(process.argv[2]);fs.mkdirSync(out,{recursive:true});
const rep={};
const settle=p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function tab(p,l){await p.evaluate(async l=>{const C=window.__L5R_CAROUSEL__;C.goToTab(l);await C.whenSettled();},l);await settle(p);}
async function open(b,phone,fixture,name){
 const c=await b.newContext(phone?{viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2}:{viewport:{width:1440,height:1000},deviceScaleFactor:1});
 const p=await c.newPage();p.errors=[];p.on('pageerror',e=>p.errors.push(String(e)));
 await p.goto(pathToFileURL(sheet).href,{waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready,null,{timeout:60000});
 await p.waitForFunction(()=>!document.getElementById('l5rSplash'),null,{timeout:30000});
 await p.locator('#fileImport').setInputFiles(fixture);await p.waitForFunction(n=>document.getElementById('f_name').value===n,name);await p.waitForTimeout(500);
 await p.evaluate(()=>window.__L5R_TEST__.MODES12.set('management'));await settle(p);
 return {c,p};
}
// A09 proposal: editable text at least 16 px on phones; manipulation on buttons and steppers only.
const A09=()=>{const s=document.createElement('style');s.id='g4a09';s.textContent=`@media (max-width:768px),(hover:none) and (pointer:coarse){
 body.car-active button{touch-action:manipulation}}`;document.head.append(s);
 const ed=[...document.querySelectorAll('input:not([type=checkbox]):not([type=radio]):not([type=hidden]):not([type=file]):not([type=range]),textarea,select')];
 let n=0;ed.forEach(e=>{if(parseFloat(getComputedStyle(e).fontSize)<16){e.style.setProperty('font-size','16px','important');n++;}});return n;};
// A10 proposal: one wrapping row, items centred on the line, 44 px touch height kept.
const A10CSS=`#ap7Pointer{display:flex;flex-wrap:wrap;align-items:center;column-gap:10px;row-gap:6px}#ap7Pointer .ap7-go{margin-top:0}`;
async function cropAround(p,sel,file,w,above=90,below=40){const r=await p.locator(sel).boundingBox();await p.screenshot({path:file,clip:{x:0,y:Math.max(0,r.y-above),width:w,height:r.height+above+below}});}
(async()=>{const b=await chromium.launch();try{
 // ---------- A09 phone ----------
 {const {c,p}=await open(b,true,MATSU,'7b.1 checks — Matsu');rep.A09={};
  for(const [label,file] of [['Skills','skills'],['Identity','identity']]){
   await tab(p,label);
   const target=label==='Identity'?'.ce7-edit':'.sk-name';
   await p.locator(target).first().scrollIntoViewIfNeeded();await settle(p);
   const box=await p.locator(target).first().boundingBox();
   const clip={x:0,y:Math.max(0,box.y-60),width:390,height:420};
   await p.screenshot({path:path.join(out,`a09-phone-${file}-today.png`),clip});
   const before=await p.evaluate(t=>[...document.querySelectorAll(t)].slice(0,3).map(e=>getComputedStyle(e).fontSize),target);
   const changed=await p.evaluate(A09);await settle(p);
   const after=await p.evaluate(t=>[...document.querySelectorAll(t)].slice(0,3).map(e=>{const r=e.getBoundingClientRect();return getComputedStyle(e).fontSize+' '+Math.round(r.width)+'x'+Math.round(r.height)+' overflow '+(e.scrollWidth>e.clientWidth)}),target);
   const pageOverflow=await p.evaluate(()=>{const pg=document.querySelector('.car-page:not([inert])');return pg.scrollWidth>pg.clientWidth;});
   await p.locator(target).first().scrollIntoViewIfNeeded();await settle(p);
   const box2=await p.locator(target).first().boundingBox();
   await p.screenshot({path:path.join(out,`a09-phone-${file}-proposed.png`),clip:{x:0,y:Math.max(0,box2.y-60),width:390,height:420}});
   rep.A09[label]={before,after,changed,pageOverflow};
   await p.evaluate(()=>{document.getElementById('g4a09')?.remove();document.querySelectorAll('[style*="font-size"]').forEach(e=>{if(e.style.getPropertyPriority('font-size')==='important')e.style.removeProperty('font-size');});});await settle(p);
  }
  rep.A09.touchAction=await p.evaluate(A09).then(()=>p.evaluate(()=>{const t={};document.querySelectorAll('.car-page:not([inert]) button').forEach(e=>{const k=getComputedStyle(e).touchAction;t[k]=(t[k]||0)+1;});return{buttons:t,page:getComputedStyle(document.querySelector('.car-page:not([inert])')).touchAction,body:getComputedStyle(document.body).touchAction};}));
  rep.A09.errors=p.errors;await c.close();}
 // ---------- A10 phone and laptop ----------
 rep.A10={};
 for(const phone of [true,false]){const k=phone?'phone':'laptop',W=phone?390:1440;const {c,p}=await open(b,phone,MATSU,'7b.1 checks — Matsu');
  await tab(p,'Identity');await p.locator('#ap7Go').scrollIntoViewIfNeeded();await settle(p);
  await cropAround(p,'#ap7Pointer',path.join(out,`a10-${k}-row-today.png`),W);
  await p.addStyleTag({content:A10CSS});await settle(p);
  const geo=await p.evaluate(()=>{const t=document.getElementById('ap7Text'),g=document.getElementById('ap7Go');const rg=document.createRange();rg.selectNodeContents(t);const last=[...rg.getClientRects()].at(-1),gb=g.getBoundingClientRect();
   return{buttonH:Math.round(gb.height),centreOffset:+((gb.y+gb.height/2)-(last.y+last.height/2)).toFixed(1),sameLine:gb.y<last.bottom,lineH:Math.round(document.getElementById('ap7Pointer').getBoundingClientRect().height)};});
  await cropAround(p,'#ap7Pointer',path.join(out,`a10-${k}-row-proposed.png`),W);
  // focus: proposed behaviour, imitated: after settling, focus the destination heading (tabindex -1, no ring)
  await p.locator('#ap7Go').click();await p.evaluate(()=>window.__L5R_CAROUSEL__.whenSettled());await settle(p);
  const focus=await p.evaluate(()=>{const h=document.querySelector('#advancedSchoolPanel h3');h.setAttribute('tabindex','-1');h.style.outline='none';h.focus({preventScroll:true});
   const pages=[...document.querySelectorAll('.car-page')];const id=pages.find(x=>x.contains(document.getElementById('schoolsPanel')));
   // the carousel's own rule inerts a page once focus has left it
   if(!id.contains(document.activeElement)){id.setAttribute('inert','');}
   const a=document.activeElement;return{active:a.tagName+' '+a.textContent.trim(),identityInert:id.hasAttribute('inert'),keyboardOpen:/INPUT|TEXTAREA|SELECT/.test(a.tagName)};});
  let tabNext=null;if(!phone){await p.keyboard.press('Tab');tabNext=await p.evaluate(()=>{const a=document.activeElement;return a.tagName+'#'+a.id+' on '+(a.closest('.car-page')||{}).getAttribute?.('data-car-slug');});}
  await p.screenshot({path:path.join(out,`a10-${k}-after-go-proposed.png`)});
  rep.A10[k]={geo,focus,tabNext,errors:p.errors};await c.close();}
 // ---------- Gold ring after the School-choice dialog ----------
 {const {c,p}=await open(b,true,KITSU,'Older Kitsu test character');await tab(p,'Identity');
  const run=async()=>{await p.evaluate(()=>{const pg=[...document.querySelectorAll('.car-page')].find(x=>x.contains(document.querySelector('#validationReport')));pg.focus({preventScroll:true});});
   await p.evaluate(()=>window.__L5R_TEST__.SC8.open('Kitsu Shugenja','spell'));await settle(p);await p.locator('#sc8Done').tap();await p.waitForTimeout(200);};
  await run();const clip={x:0,y:340,width:390,height:500};
  await p.screenshot({path:path.join(out,'ring-phone-today.png'),clip});
  await p.addStyleTag({content:'.car-page:focus-visible{outline:none}'});await settle(p);
  const after=await p.evaluate(()=>{const a=document.activeElement;return{page:a.classList.contains('car-page'),outline:getComputedStyle(a).outlineStyle};});
  await p.screenshot({path:path.join(out,'ring-phone-proposed.png'),clip});
  rep.ring={after,errors:p.errors};await c.close();}
}finally{await b.close();}
fs.writeFileSync(path.join(out,'prototype.json'),JSON.stringify(rep,null,2)+'\n');console.log(JSON.stringify(rep,null,1));
})().catch(e=>{console.error(e);process.exitCode=1;});
