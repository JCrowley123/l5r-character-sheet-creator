'use strict';
// G6 A19.1 (the Combat page's damage row on a phone): today on the live build (A08, 6d47849b…44b1) and the proposal
// applied in the test browser only (a stylesheet added to the page), phone (390 × 844 touch) and laptop (1440 × 1000).
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{pathToFileURL}=require('url');
const {chromium}=require('playwright');
const [sheet,fixture,outArg]=process.argv.slice(2);
const out=path.resolve(outArg);fs.mkdirSync(out,{recursive:true});
const sha=crypto.createHash('sha256').update(fs.readFileSync(sheet)).digest('hex');
const settle=p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
// The proposal: the row may wrap; the two buttons keep their words on one line each. On a phone the amount stays on the
// first line and the two buttons go beneath it, each the row's full width; on a laptop the row is one line, as today.
const PROPOSAL=`#voidDamageRow{flex-wrap:wrap;row-gap:8px}
#voidDamageApply,#voidDamageCancel{white-space:nowrap}
@media (max-width:640px){#voidDamageApply,#voidDamageCancel{flex:1 1 auto}}`;
const R={source_sha256:sha,captured_utc:new Date().toISOString(),proposal_css:PROPOSAL};
(async()=>{
 const b=await chromium.launch();
 for(const [phone,dev] of [[true,'phone'],[false,'laptop']]){
  for(const proposed of [false,true]){
   const c=await b.newContext(phone?{viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2}:{viewport:{width:1440,height:1000},deviceScaleFactor:1});
   const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(String(e)));
   await p.goto(pathToFileURL(sheet).href);await p.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready,null,{timeout:60000});
   await p.waitForFunction(()=>!document.getElementById('l5rSplash'));await p.evaluate(()=>document.fonts.ready);
   await p.locator('#fileImport').setInputFiles(fixture);await p.waitForFunction(()=>document.getElementById('f_name').value.length>0);
   await p.evaluate(()=>window.__L5R_TEST__.MODES12.set('play'));
   await p.evaluate(async()=>{const C=window.__L5R_CAROUSEL__;C.goToTab('Combat');await C.whenSettled();});
   if(proposed)await p.addStyleTag({content:PROPOSAL});
   const btn=p.locator('#voidSpendButtons button[data-void="damage"]');if(phone)await btn.tap();else await btn.click();
   await p.fill('#voidDamageInput','25');await settle(p);
   const m=await p.evaluate(()=>{const row=document.getElementById('voidDamageRow'),panel=row.closest('.void-panel').getBoundingClientRect();
    const box=e=>{const q=e.getBoundingClientRect();return {left:Math.round(q.left),right:Math.round(q.right),top:Math.round(q.top),height:Math.round(q.height)};};
    return {panelRight:Math.round(panel.right),rowHeight:Math.round(row.getBoundingClientRect().height),docScroll:document.documentElement.scrollWidth,vw:innerWidth,
     label:box(row.querySelector('label')),input:box(document.getElementById('voidDamageInput')),apply:box(document.getElementById('voidDamageApply')),cancel:box(document.getElementById('voidDamageCancel'))};});
   R[dev+'_'+(proposed?'proposed':'today')]={...m,errors};
   const k=proposed?'proposed':'today';
   const panel=p.locator('#voidDetails .void-panel');await panel.scrollIntoViewIfNeeded();
   if(phone){await p.evaluate(()=>document.getElementById('voidDamageRow').scrollIntoView({block:'center'}));await settle(p);await p.screenshot({path:path.join(out,`a19-1-${dev}-${k}.png`)});}
   else{const bb=await p.evaluate(()=>{const q=document.querySelector('#voidDetails .void-panel').getBoundingClientRect();return {x:q.left-8,y:q.top-8,width:q.width+16,height:q.height+16};});await p.screenshot({path:path.join(out,`a19-1-${dev}-${k}.png`),clip:bb});}
   await c.close();
  }
 }
 fs.writeFileSync(path.join(out,'reproduction.json'),JSON.stringify(R,null,1));await b.close();console.log(JSON.stringify(R,null,1));
})().catch(e=>{console.error(e);process.exit(1);});
