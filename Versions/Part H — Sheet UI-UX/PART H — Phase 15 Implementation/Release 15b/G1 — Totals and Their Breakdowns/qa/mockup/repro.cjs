'use strict';
// Group 1 of Release 15b (A14, B02, B04, B14): today's screens and the scratch proposals, phone (390 × 844 touch)
// and laptop (1440 × 1000), on the live tree (main 3b499a88, application 921f3ac9…6150). Scratch only: no application
// file is edited; each proposal is drawn inside the test browser from the sheet's own values (proposals.cjs).
// Usage: run.sh repro.cjs <out folder>   (PROPOSED=0 for today's pictures only)
const {fs,path,chromium,sha,settle,tab,open}=require('./common.cjs');
const {write}=require('./fixtures.cjs');
const P=require('./proposals.cjs');
const out=path.resolve(process.argv[2]);fs.mkdirSync(out,{recursive:true});
const R={source_sha256:sha,captured_utc:new Date().toISOString(),phone:{},laptop:{}};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const WOUNDS=12;   // Nicked on the dense character (Earth 2, campaign multiplier 2: Healthy to 10, Nicked 11–14)

async function mode(p,m){await p.evaluate(m=>window.__L5R_TEST__.MODES12.set(m),m);await settle(p);}
async function press(p,phone,loc){await loc.scrollIntoViewIfNeeded();if(phone)await loc.tap();else await loc.click();await settle(p);}
// Phone: the whole screen, the first element centred (or at the top). Laptop: a clip around the elements.
async function shot(p,phone,file,sels,{pad=10,block='center'}={}){
 if(phone){
  await p.evaluate(([s,block])=>{const e=document.querySelector(s);if(e)e.scrollIntoView({block});},[sels[0],block]);await settle(p);
  await p.screenshot({path:path.join(out,file)});return;
 }
 const box=await p.evaluate(([sels,pad,block])=>{const els=sels.map(s=>document.querySelector(s)).filter(Boolean);els[0].scrollIntoView({block});
  const rs=els.map(e=>e.getBoundingClientRect());const x=Math.max(0,Math.min(...rs.map(r=>r.left))-pad),y=Math.max(0,Math.min(...rs.map(r=>r.top))-pad);
  return{x,y,width:Math.min(innerWidth-x,Math.max(...rs.map(r=>r.right))+pad-x),height:Math.min(innerHeight-y,Math.max(...rs.map(r=>r.bottom))+pad-y)};},[sels,pad,block]);
 await settle(p);await p.screenshot({path:path.join(out,file),clip:box});
}
const txt=(p,sel)=>p.evaluate(s=>{const e=document.querySelector(s);return e?e.innerText.replace(/\s+/g,' ').trim():null;},sel);
async function openQA(p,phone){await press(p,phone,p.locator('#quickAccessToggleBtn'));await wait(300);}
async function closeQA(p,phone){if(await p.evaluate(()=>!document.getElementById('quickAccessPanel').hidden))await press(p,phone,p.locator('#quickAccessToggleBtn'));}
async function rollPreview(p,phone,skill){
 await tab(p,'Skills');const row=p.locator('#skillsBody tr',{has:p.locator(`.sk-name[value="${skill}"]`)});
 await press(p,phone,row.locator('.sk-roll'));await p.waitForFunction(()=>getComputedStyle(document.getElementById('rollPreviewOverlay')).display!=='none');await wait(250);
 return p.evaluate(()=>{const b=document.getElementById('rollPreviewBody');return {title:document.getElementById('rollPreviewSubtitle').textContent,
  pool:(b.querySelector('.rp-pool-final')||{}).textContent,mods:[...b.querySelectorAll('.rp-mod')].map(r=>r.textContent.replace(/\s+/g,' ').trim()),
  go:(document.getElementById('rollPreviewGo')||{}).textContent};});
}
const cancelPreview=async(p,phone)=>{await press(p,phone,p.locator('#rollPreviewCancel'));await wait(250);};
async function setWounds(p,n){await p.evaluate(n=>{document.getElementById('f_woundsTaken').value=n;window.__L5R_TEST__.recalcAll();},n);await settle(p);}

// ---------------- A14: the owner's two-entry example, Nicked ----------------
async function a14(b,phone,dev,proposed){
 const k=proposed?'proposed':'today',r={};const fx=write(out,'a14');
 const {c,p}=await open(b,phone,fx.file,fx.name);await mode(p,'play');await setWounds(p,WOUNDS);
 if(proposed)await P.a14(p);
 await tab(p,'Combat');
 r.track=await txt(p,'.wound-section');r.segments=await p.evaluate(()=>[...document.querySelectorAll('#woundBar button')].map(s=>s.getAttribute('aria-label')));
 r.penalty=await p.evaluate(()=>window.__L5R_TEST__.getWoundPenalty());
 await shot(p,phone,`a14-${dev}-${k}-track.png`,['.wound-section'],{block:phone?'center':'center'});
 // The information: today a tap on the current segment; proposed, the line's i (the same window, with the breakdown).
 if(proposed)await press(p,phone,p.locator('#g1WoundInfo'));else await press(p,phone,p.locator('#woundBar button.current'));
 await wait(300);r.info=await txt(p,'#woundInfoModalOverlay > *');
 await shot(p,phone,`a14-${dev}-${k}-info.png`,['#woundInfoModalOverlay > *']);
 await press(p,phone,p.locator('#woundInfoClose'));
 await openQA(p,phone);r.quickAccess=await txt(p,'#quickAccessPanel');
 await shot(p,phone,`a14-${dev}-${k}-qa.png`,['#quickAccessPanel']);await closeQA(p,phone);
 r.preview=await rollPreview(p,phone,'Defense');
 await shot(p,phone,`a14-${dev}-${k}-preview.png`,['#rollPreviewOverlay > *']);await cancelPreview(p,phone);
 r.errors=p.errors;R[dev]['a14_'+k]=r;await c.close();
}

// ---------------- B02: prices another entry changes ----------------
async function b02(b,phone,dev,proposed){
 const k=proposed?'proposed':'today',r={};const fx=write(out,'b02');
 const {c,p}=await open(b,phone,fx.file,fx.name);await mode(p,'management');
 if(proposed)await P.b02(p);
 await tab(p,'Adv & Disadv');
 r.rows=await p.evaluate(()=>[...document.querySelectorAll('#advList .entry')].map(d=>({name:d.querySelector('.en-name').value,cost:d.querySelector('.en-cost').value,
  notes:[...d.querySelectorAll('[class*="-note"]')].map(n=>n.textContent.replace(/\s+/g,' ').trim())})));
 const at=n=>`#advList .entry:nth-child(${n})`;
 const idx=await p.evaluate(()=>{const names=[...document.querySelectorAll('#advList .entry .en-name')].map(e=>e.value);
  return {sp:names.indexOf('Social Position')+1,tie:names.indexOf('Kharmic Tie')+1,large:names.indexOf('Large')+1,bb:names.indexOf('Blissful Betrothal')+1};});
 r.order=idx;
 await shot(p,phone,`b02-${dev}-${k}-rows.png`,[at(idx.sp),at(idx.tie),at(idx.large)],{block:'start'});
 if(proposed){
  for(const [key,n] of [['sp',idx.sp],['tie',idx.tie],['large',idx.large]]){
   await press(p,phone,p.locator(`${at(n)} .g1-price-i`));await wait(250);r['info_'+key]=await txt(p,'#stanceInfoOverlay > *');
   if(key!=='tie')await shot(p,phone,`b02-${dev}-proposed-info-${key}.png`,['#stanceInfoOverlay > *']);
   await press(p,phone,p.locator('#stanceInfoClose'));
  }
 }
 r.errors=p.errors;R[dev]['b02_'+k]=r;await c.close();
}

// ---------------- B04: Blind under Armor TN ----------------
async function b04(b,phone,dev,proposed){
 const k=proposed?'proposed':'today',r={};const fx=write(out,'b04');
 const {c,p}=await open(b,phone,fx.file,fx.name);await mode(p,'play');
 if(proposed)await P.b04(p);
 await tab(p,'Combat');
 await openQA(p,phone);r.quickAccess=await txt(p,'#quickAccessPanel');
 await shot(p,phone,`b04-${dev}-${k}-qa.png`,['#quickAccessPanel']);
 if(proposed){await press(p,phone,p.locator('#g1ArmorInfo'));await wait(300);}
 else{await closeQA(p,phone);await p.evaluate(()=>{document.getElementById('armorTnDetails').open=true;});await settle(p);
  await shot(p,phone,`b04-${dev}-today-card.png`,['#armorTnDetails']);r.card=await txt(p,'#armorTnDetails');
  await press(p,phone,p.locator('#combatTnInfoBtn'));await wait(300);}
 r.info=await txt(p,'#stanceInfoOverlay > *');
 await shot(p,phone,`b04-${dev}-${k}-info.png`,['#stanceInfoOverlay > *']);
 if(proposed){await press(p,phone,p.locator('#stanceInfoClose'));await closeQA(p,phone);
  await p.evaluate(()=>{document.getElementById('armorTnDetails').open=true;});await settle(p);
  await press(p,phone,p.locator('#combatTnInfoBtn'));await wait(300);r.combatInfo=await txt(p,'#stanceInfoOverlay > *');
  await shot(p,phone,`b04-${dev}-proposed-combat-info.png`,['#stanceInfoOverlay > *']);}
 r.errors=p.errors;R[dev]['b04_'+k]=r;await c.close();
}

// ---------------- B14: Jigoku's total ----------------
async function b14(b,phone,dev,proposed){
 const k=proposed?'proposed':'today',r={};const fx=write(out,'b14');
 const {c,p}=await open(b,phone,fx.file,fx.name);await mode(p,'play');
 if(proposed)await P.b14(p);
 r.preview=await rollPreview(p,phone,'Defense');
 await shot(p,phone,`b14-${dev}-${k}-preview.png`,['#rollPreviewOverlay > *']);await cancelPreview(p,phone);
 await tab(p,'Adv & Disadv');
 r.card=await txt(p,'#advList .entry');
 await shot(p,phone,`b14-${dev}-${k}-card.png`,['#advList .entry'],{block:'center'});
 r.errors=p.errors;R[dev]['b14_'+k]=r;await c.close();
}

// ---------------- Round 2 (owner, 20 November): A14's preview as revised; Kharmic Tie's card ----------------
async function a14r(b,phone,dev){
 const r={};const fx=write(out,'a14');
 const {c,p}=await open(b,phone,fx.file,fx.name);await mode(p,'play');await setWounds(p,WOUNDS);
 await P.a14(p,true);
 r.preview=await rollPreview(p,phone,'Defense');r.penalty=await p.evaluate(()=>window.__L5R_TEST__.getWoundPenalty());
 await shot(p,phone,`a14-${dev}-rev1-preview.png`,['#rollPreviewOverlay > *']);await cancelPreview(p,phone);
 r.errors=p.errors;R[dev].a14_rev1=r;await c.close();
}
async function kt(b,phone,dev,proposed,r3=false,fixture='kt'){
 const k=r3?(fixture==='kt'?'r3':'r3-long'):proposed?'proposed':'today',r={};const fx=write(out,fixture);
 const {c,p}=await open(b,phone,fx.file,fx.name);await mode(p,'management');
 if(proposed)await P.kt(p,r3);
 await tab(p,'Adv & Disadv');
 const card='#advList .entry';
 const row=()=>p.evaluate(()=>{const d=document.querySelector('#advList .entry .adv-config-row');const vis=e=>e&&e.getClientRects().length>0;
  return {text:d.innerText.replace(/\s+/g,' ').trim(),infoButtons:[...d.querySelectorAll('.adv-config-info,.g1-i')].filter(vis).length,
   buttons:[...d.querySelectorAll('button')].filter(vis).map(b=>b.getAttribute('aria-label')||b.textContent.trim()),height:Math.round(d.getBoundingClientRect().height)};});
 for(const m of ['management','play']){
  await mode(p,m);await tab(p,'Adv & Disadv');
  r[m]=await row();await shot(p,phone,`kt-${dev}-${k}-${m}.png`,[card]);
  if(proposed){
   await press(p,phone,p.locator(`${card} .g1-kt-i`));await wait(300);r[m+'_info']=await txt(p,'#stanceInfoOverlay > *');
   await shot(p,phone,`kt-${dev}-${k}-${m}-info.png`,['#stanceInfoOverlay > *']);await press(p,phone,p.locator('#stanceInfoClose'));
  } else {
   r[m+'_infos']=[];const n=await p.locator(`${card} .adv-config-row .adv-config-info`).count();
   for(let i=0;i<n;i++){await press(p,phone,p.locator(`${card} .adv-config-row .adv-config-info`).nth(i));await wait(250);
    r[m+'_infos'].push(await txt(p,'#stanceInfoOverlay > *'));await press(p,phone,p.locator('#stanceInfoClose'));}
  }
 }
 // Reset still works and the card keeps its shape after the redraw.
 await press(p,phone,p.locator(`${card} .adv-config-reset-session`));r.afterReset=await row();
 r.errors=p.errors;R[dev]['kt_'+k.replace('-','_')]=r;await c.close();
}

(async()=>{
 const b=await chromium.launch();
 const only=(process.env.ONLY||'a14,b02,b04,b14').split(',');
 const states=process.env.PROPOSED==='0'?[false]:process.env.PROPOSED==='1'?[true]:[false,true];
 try{
  for(const [phone,dev] of [[true,'phone'],[false,'laptop']])for(const proposed of states){
   if(only.includes('a14'))await a14(b,phone,dev,proposed);
   if(only.includes('b02'))await b02(b,phone,dev,proposed);
   if(only.includes('b04'))await b04(b,phone,dev,proposed);
   if(only.includes('b14'))await b14(b,phone,dev,proposed);
   if(only.includes('kt'))await kt(b,phone,dev,proposed);
  }
  // Round 3 (owner: Change and the i on the badge's row): the agreed card and a long name, phone and laptop.
  if(only.includes('kt3'))for(const [phone,dev] of [[true,'phone'],[false,'laptop']]){await kt(b,phone,dev,true,true);await kt(b,phone,dev,true,true,'ktLong');}
  if(only.includes('a14r'))for(const [phone,dev] of [[true,'phone'],[false,'laptop']])await a14r(b,phone,dev);
 } finally {fs.writeFileSync(path.join(out,'reproduction.json'),JSON.stringify(R,null,1));await b.close();}
 console.log('done',sha);
})().catch(e=>{console.error(e);process.exit(1);});
