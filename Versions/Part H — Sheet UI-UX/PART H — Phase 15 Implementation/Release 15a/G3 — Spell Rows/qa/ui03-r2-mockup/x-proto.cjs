'use strict';
// Scratch mock-up for 8b.1-UI-03 revision 2: the × in its own clear corner on every card in Techniques, Advantages and
// Disadvantages, as spell cards already have it. Scratch CSS on the G3 build; no application file is edited.
//   node x-proto.cjs <sheet.html> <g2-fixtures.json> <out-dir>
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');const {chromium}=require('playwright');
const [sheet,fixtures,outDir]=process.argv.slice(2);const out=path.resolve(outDir);fs.mkdirSync(out,{recursive:true});
const FIX=JSON.parse(fs.readFileSync(fixtures,'utf8'));
const LISTS='#techList, #advList, #disadvList';
const css=`
html body.x2 :is(#techList,#advList,#disadvList) > .entry > .rm-btn{top:5px;right:4px;display:inline-flex;align-items:center;justify-content:center;width:44px;min-width:44px;height:44px;min-height:44px;padding:0}
html body.x2 :is(#techList,#advList,#disadvList) > .entry:not([data-spell-element]) > .entry-top{padding-right:42px}
html body.x2.pm12-play :is(#techList,#advList,#disadvList) > .entry:not([data-spell-element]) > .entry-top{padding-right:0}
`;
const settle=p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function tab(p,l){await p.evaluate(async l=>{const C=window.__L5R_CAROUSEL__;C.goToTab(l);await C.whenSettled();},l);await settle(p);}
const measure=(lists)=>[...document.querySelectorAll(lists)].flatMap(list=>[...list.querySelectorAll(':scope > .entry')].map(row=>{
  const R=e=>{const r=e.getBoundingClientRect();return{x:r.left,y:r.top,w:r.width,h:r.height,right:r.right,bottom:r.bottom}};
  const drawn=e=>!!e&&e.getClientRects().length>0&&getComputedStyle(e).visibility!=='hidden';
  const rm=row.querySelector(':scope > .rm-btn'),b=drawn(rm)?R(rm):null,hits={};
  if(b)for(const e of row.querySelectorAll('input,textarea,select,button,label,.adv-config-badge,small,span[class]')){if(e===rm||!drawn(e)||rm.contains(e))continue;const a=R(e);
    const w=Math.min(a.right,b.right)-Math.max(a.x,b.x),h=Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y);
    if(w>0.5&&h>0.5){const k=e.tagName.toLowerCase()+(e.className?'.'+String(e.className).split(' ')[0]:'')+(e.type?'['+e.type+']':'');hits[k]=[Math.round(w),Math.round(h)];}}
  const cost=row.querySelector('.en-cost'),name=row.querySelector('.en-name');
  return{list:list.id,name:name?name.value:'',spell:!!row.dataset.spellElement,h:Math.round(R(row).h),rm:b&&[Math.round(b.w),Math.round(b.h)],overlaps:hits,cost:cost&&drawn(cost)?Math.round(R(cost).w):null,nameW:name?Math.round(R(name).w):null};
}));
(async()=>{const b=await chromium.launch();const report={};try{
 for(const [device,viewport] of Object.entries({phone:{width:390,height:844},laptop:{width:1440,height:1000}})){
  const c=await b.newContext({viewport,deviceScaleFactor:device==='phone'?2:1,isMobile:device==='phone',hasTouch:device==='phone'});const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(String(e)));
  await p.goto(pathToFileURL(path.resolve(sheet)).href,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready,null,{timeout:60000});await p.evaluate(()=>document.fonts.ready);
  await p.addStyleTag({content:css});
  await p.evaluate(d=>{const T=window.__L5R_TEST__;try{T.CL11.close()}catch(e){};T.applyData(d);T.MODES12.set('management');T.recalcAll();},FIX.dense);
  // a Kata from the sheet's own picker (the first one this character may take)
  await tab(p,'Techniques');
  const added=await p.evaluate(()=>{const s=document.getElementById('techQuickAdd');const o=[...s.options].find(o=>/^kata:/.test(o.value)&&!o.disabled);if(!o)return null;s.value=o.value;s.dispatchEvent(new Event('change',{bubbles:true}));return o.textContent.trim();});
  await settle(p);
  const tag=(sel,n)=>p.evaluate(([sel,n])=>{[...document.querySelectorAll(sel+' > .entry')].forEach((r,i)=>r.dataset.xShot=sel.slice(1)+i);},[sel,n]);
  for(const s of ['#techList','#advList','#disadvList'])await tag(s);
  for(const mode of ['today','proposed']){
   await p.evaluate(m=>document.body.classList.toggle('x2',m==='proposed'),mode);await settle(p);
   report[device+'-'+mode]=await p.evaluate(measure,LISTS);
   await tab(p,'Techniques');
   for(const id of ['techList0','techList1'])if(await p.locator(`[data-x-shot="${id}"]`).count()){const l=p.locator(`[data-x-shot="${id}"]`);await l.evaluate(e=>e.scrollIntoView({block:'center'}));await settle(p);await l.screenshot({path:path.join(out,`${device}-${mode}-${id}.png`)});}
   const kata=await p.evaluate(()=>{const r=[...document.querySelectorAll('#techList > .entry')].find(r=>!r.dataset.spellElement&&!/School Technique/.test(r.querySelector('.en-desc')?.value||''));return r?r.dataset.xShot:null});
   if(kata){const l=p.locator(`[data-x-shot="${kata}"]`);await l.evaluate(e=>e.scrollIntoView({block:'center'}));await settle(p);await l.screenshot({path:path.join(out,`${device}-${mode}-kata.png`)});}
   await tab(p,'Adv & Disadv');
   for(const id of ['advList0','advList1','disadvList0','disadvList2']){const l=p.locator(`[data-x-shot="${id}"]`);if(!await l.count())continue;await l.evaluate(e=>e.scrollIntoView({block:'center'}));await settle(p);await l.screenshot({path:path.join(out,`${device}-${mode}-${id}.png`)});}
  }
  // Play: the corner is given back where the × is not drawn
  await p.evaluate(()=>{document.body.classList.add('x2');window.__L5R_TEST__.MODES12.set('play');});await settle(p);
  report[device+'-play-proposed']=await p.evaluate(measure,LISTS);
  await p.evaluate(()=>document.body.classList.remove('x2'));await settle(p);report[device+'-play-today']=await p.evaluate(measure,LISTS);
  report[device+'-kata']=added;report[device+'-errors']=errors;await c.close();
 }
 fs.writeFileSync(path.join(out,'x-proto.json'),JSON.stringify(report,null,1));
}finally{await b.close();}
for(const k of Object.keys(report)){const v=report[k];if(!Array.isArray(v)){console.log(k,JSON.stringify(v));continue}
 console.log('== '+k);for(const r of v)console.log('  %s %-28s h%-4s rm%s cost%s name%s %s',r.list.padEnd(10),r.name.slice(0,28),r.h,JSON.stringify(r.rm),r.cost,r.nameW,Object.keys(r.overlaps).length?'OVERLAP '+JSON.stringify(r.overlaps):'');}
})().catch(e=>{console.error(e);process.exitCode=1;});
