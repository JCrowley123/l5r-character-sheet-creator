'use strict';
// Scratch: the corner mock-up plus a narrower number box. Measures how wide the box must be for one, two and
// three digits, and what the name gains.   node x-narrow.cjs <sheet.html> <g2-fixtures.json> <out-dir> <width-px>
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');const {chromium}=require('playwright');
const [sheet,fixtures,outDir,W]=process.argv.slice(2);const out=path.resolve(outDir);fs.mkdirSync(out,{recursive:true});
const FIX=JSON.parse(fs.readFileSync(fixtures,'utf8'));
const css=`
html body.x2 :is(#techList,#advList,#disadvList) > .entry > .rm-btn{top:5px;right:4px;display:inline-flex;align-items:center;justify-content:center;width:44px;min-width:44px;height:44px;min-height:44px;padding:0}
html body.x2 :is(#techList,#advList,#disadvList) > .entry:not([data-spell-element]) > .entry-top{padding-right:42px}
html body.x2.pm12-play :is(#techList,#advList,#disadvList) > .entry:not([data-spell-element]) > .entry-top{padding-right:0}
html body.x2.narrow :is(#techList,#advList,#disadvList) > .entry > .entry-top > input.en-cost{width:${W}px;flex:none;text-align:center;padding-left:4px;padding-right:4px}
`;
const settle=p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function tab(p,l){await p.evaluate(async l=>{const C=window.__L5R_CAROUSEL__;C.goToTab(l);await C.whenSettled();},l);await settle(p);}
(async()=>{const b=await chromium.launch();const rep={};try{
 for(const [device,viewport] of Object.entries({phone:{width:390,height:844},laptop:{width:1440,height:1000}})){
  const c=await b.newContext({viewport,deviceScaleFactor:device==='phone'?2:1,isMobile:device==='phone',hasTouch:device==='phone'});const p=await c.newPage();
  await p.goto(pathToFileURL(path.resolve(sheet)).href,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready,null,{timeout:60000});await p.evaluate(()=>document.fonts.ready);
  await p.addStyleTag({content:css});
  await p.evaluate(d=>{const T=window.__L5R_TEST__;try{T.CL11.close()}catch(e){};T.applyData(d);T.MODES12.set('management');T.recalcAll();document.body.classList.add('x2','narrow');},FIX.dense);
  for(const s of ['#techList','#advList','#disadvList'])await p.evaluate(sel=>[...document.querySelectorAll(sel+' > .entry')].forEach((r,i)=>r.dataset.xShot=sel.slice(1)+i),s);
  // How many digits fit: write 8, 88 and 888 into one box (then put it back), with the spin buttons a desktop browser
  // shows on hover or focus counted in, by focusing the box.
  rep[device]=await p.evaluate(()=>{const row=document.querySelector('#advList > .entry'),box=row.querySelector('.en-cost'),old=box.value,res={};
   const name=row.querySelector('.en-name');res.box=Math.round(box.getBoundingClientRect().width);res.name=Math.round(name.getBoundingClientRect().width);
   for(const v of ['8','88','888','-12']){box.value=v;box.focus();res[v]=box.scrollWidth<=box.clientWidth;}box.value=old;box.blur();
   const longest=[...document.querySelectorAll('#advList .en-name,#disadvList .en-name,#techList .en-name')].map(n=>({v:n.value,fits:n.scrollWidth<=n.clientWidth}));
   res.namesFit=longest.every(x=>x.fits);res.notFitting=longest.filter(x=>!x.fits).map(x=>x.v);
   const R=e=>e.getBoundingClientRect();res.overlaps=[...document.querySelectorAll('#advList > .entry,#disadvList > .entry,#techList > .entry')].filter(r=>{const a=R(r.querySelector(':scope > .rm-btn')),c=r.querySelector('.en-cost');if(!c)return false;const d=R(c);return Math.min(a.right,d.right)-Math.max(a.left,d.left)>0.5&&Math.min(a.bottom,d.bottom)-Math.max(a.top,d.top)>0.5;}).length;
   return res;});
  for(const id of ['techList0','disadvList0','advList1']){if(device==='laptop'&&id!=='advList1')continue;await tab(p,id.startsWith('tech')?'Techniques':'Adv & Disadv');const l=p.locator(`[data-x-shot="${id}"]`);await l.evaluate(e=>e.scrollIntoView({block:'center'}));await settle(p);await l.screenshot({path:path.join(out,`${device}-narrow-${id}.png`)});}
  await c.close();
 }
}finally{await b.close();}console.log(JSON.stringify(rep,null,1));})().catch(e=>{console.error(e);process.exitCode=1;});
