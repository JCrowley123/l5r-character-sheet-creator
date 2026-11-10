'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {pathToFileURL}=require('url');
const {chromium}=require('playwright');
const root='C:/Users/jcrow/l5r-character-sheet-creator';
const V=path.join(root,'Versions');
const sheet=path.join(V,'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html');
const fixturePath=path.join(V,'BUGFIX — Older School Choices/qa/older-kitsu.l5r.json');
const fixture=JSON.parse(fs.readFileSync(fixturePath,'utf8'));
const out=path.resolve(process.argv[2]);fs.mkdirSync(out,{recursive:true});
const report={source_sha256:crypto.createHash('sha256').update(fs.readFileSync(sheet)).digest('hex'),captured_utc:new Date().toISOString(),devices:{}};
const settle=p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function tab(p,label){await p.evaluate(async label=>{const C=window.__L5R_CAROUSEL__;C.goToTab(label);await C.whenSettled();},label);await settle(p);}
async function metrics(p){return p.evaluate(()=>{
 const rect=e=>{if(!e)return null;const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom};};
 const dialog=document.querySelector('#sc8Dialog');
 const groups=[...document.querySelectorAll('#sc8Body fieldset')];
 const confirm=document.querySelector('.oc8-confirm'),later=document.querySelector('#sc8Done');
 const a=rect(groups.at(-1)),b=rect(confirm);
 const rows=[...document.querySelectorAll('#techList .entry[data-spell-element]')].map(e=>{
  const n=e.querySelector('.en-name'),memo=e.querySelector('.spell-memo-label'),rm=e.querySelector('.rm-btn'),s=getComputedStyle(n),mr=rect(memo),rr=rect(rm);
  return{name:n.value,school:e.querySelector('.sc8-source')?.textContent||null,nameBox:rect(n),nameTextWidth:Math.max(0,n.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)),nameScrollWidth:n.scrollWidth,row:rect(e),remove:rr,memorised:mr,removeVisible:getComputedStyle(rm).display!=='none',overlap:{w:Math.max(0,Math.min(mr.right,rr.right)-Math.max(mr.x,rr.x)),h:Math.max(0,Math.min(mr.bottom,rr.bottom)-Math.max(mr.y,rr.y))}};
 });
 return{dialog:dialog?{rect:rect(dialog),clientHeight:dialog.clientHeight,scrollHeight:dialog.scrollHeight,confirm:rect(confirm),later:rect(later),lastGroup:a,confirmGap:a&&b?b.y-a.bottom:null,confirmOffset:a&&b?b.x-a.x:null,rows:[...document.querySelectorAll('.oc8-held-spell')].map(rect)}:null,rows};
});}
(async()=>{const browser=await chromium.launch();try{
 report.browser=browser.version();
 for(const [name,viewport] of Object.entries({phone:{width:390,height:844},laptop:{width:1440,height:1000}})){
  const context=await browser.newContext({viewport,isMobile:name==='phone',hasTouch:name==='phone',deviceScaleFactor:1});
  const p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(String(e)));
  await p.goto(pathToFileURL(sheet).href,{waitUntil:'domcontentloaded'});
  await p.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready,null,{timeout:60000});
  await p.evaluate(()=>document.fonts.ready);await p.locator('#fileImport').setInputFiles(fixturePath);
  await p.waitForFunction(()=>document.getElementById('f_name').value==='Older Kitsu test character');
  await p.evaluate(()=>window.__L5R_TEST__.MODES12.set('management'));await tab(p,'Identity');
  await p.getByRole('button',{name:'Review starting spells',exact:true}).click();await settle(p);
  const review=await metrics(p);await p.locator('#sc8Dialog').screenshot({path:path.join(out,`${name}-review-today.png`)});
  const before=await p.evaluate(()=>JSON.stringify(window.__L5R_TEST__.collectData()));
  await p.getByRole('checkbox',{name:'Sense',exact:true}).check();await p.locator('#sc8Done').click();
  const laterNoWrites=before===await p.evaluate(()=>JSON.stringify(window.__L5R_TEST__.collectData()));
  await p.getByRole('button',{name:'Review starting spells',exact:true}).click();
  const noneSelected=await p.locator('#sc8Body input:checked').count()===0;
  await p.evaluate(()=>{document.querySelectorAll('input.oc8-spell').forEach(i=>{i.checked=i.value!=="Jurojin's Balm";});});
  await p.locator('.oc8-confirm').click();await settle(p);
  const allocation=await p.evaluate(()=>{const d=window.__L5R_TEST__.collectData();return{names:d.tech.map(x=>x.name),schoolCount:d.tech.filter(x=>x.schoolChoice).length,reward:d.tech.find(x=>x.name==="Jurojin's Balm"),onlyEarth:!!document.querySelector('#cw1123PickEarth')&&!document.querySelector('#cw1123PickWater,#cw1123PickAir')}});
  await p.locator('#sc8Done').click();await tab(p,'Techniques');
  await p.evaluate(()=>{document.querySelectorAll('#techList .entry').forEach((e,i)=>e.dataset.g3Row=i);});
  const sense=await p.locator('#techList .entry').evaluateAll(rs=>rs.findIndex(r=>r.querySelector('.en-name').value==='Sense'));
  const row=p.locator(`[data-g3-row="${sense}"]`);await row.scrollIntoViewIfNeeded();
  const manage=await metrics(p);await row.screenshot({path:path.join(out,`${name}-sense-manage-today.png`)});
  if(name==='phone')fs.writeFileSync(path.join(out,'row-dom.html'),await row.evaluate(e=>e.outerHTML));
  await p.evaluate(()=>window.__L5R_TEST__.MODES12.set('play'));await settle(p);await row.scrollIntoViewIfNeeded();
  const play=await metrics(p);await row.screenshot({path:path.join(out,`${name}-sense-play-today.png`)});
  report.devices[name]={viewport,review,manage,play,laterNoWrites,reopenedNoneSelected:noneSelected,allocation,errors};
  console.log(name,JSON.stringify({confirmGap:review.dialog.confirmGap,confirmOffset:review.dialog.confirmOffset,sense:manage.rows.find(r=>r.name==='Sense'),laterNoWrites,schoolCount:allocation.schoolCount,onlyEarth:allocation.onlyEarth,errors}));
  await context.close();
 }
 fs.writeFileSync(path.join(out,'reproduction.json'),JSON.stringify(report,null,2)+'\n');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
