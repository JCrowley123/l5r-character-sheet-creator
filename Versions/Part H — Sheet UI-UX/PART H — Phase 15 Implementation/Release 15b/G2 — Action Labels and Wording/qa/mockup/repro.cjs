'use strict';
// Group 2 of Release 15b (B01, B03, B05, B09): today's screens and the scratch proposals, phone (390 × 844 touch)
// and laptop (1440 × 1000), on the live tree (main acdb6f75, application 5ac767c6…574d). Scratch only: no application
// file is edited; each proposal is drawn inside the test browser from the sheet's own values (proposals.cjs).
// Usage: run.sh repro.cjs <out folder>   (ONLY=b01,b03,b05,b09 to choose units; PROPOSED=0 or 1 for one state)
const {fs,path,chromium,sha,settle,tab,open}=require('./common.cjs');
const {write}=require('./fixtures.cjs');
const P=require('./proposals.cjs');
const out=path.resolve(process.argv[2]);fs.mkdirSync(out,{recursive:true});
const R={source_sha256:sha,captured_utc:new Date().toISOString(),phone:{},laptop:{}};
const wait=ms=>new Promise(r=>setTimeout(r,ms));

async function mode(p,m){await p.evaluate(m=>window.__L5R_TEST__.MODES12.set(m),m);await settle(p);}
async function press(p,phone,loc){await loc.scrollIntoViewIfNeeded();if(phone)await loc.tap();else await loc.click();await settle(p);}
// Phone: the whole screen, with the first element near the top of its scrolling panel (or centred). Laptop: a clip.
// The sheet scrolls inside its own panel, so the element is brought to the panel's top and then 12 px of the panel
// above it are shown again.
async function shot(p,phone,file,sels,{pad=10,block='center'}={}){
 if(phone){
  await p.evaluate(([s,block])=>{const e=document.querySelector(s);if(!e)return;e.scrollIntoView({block});
   if(block!=='start')return;let a=e.parentElement;
   while(a&&!(/(auto|scroll)/.test(getComputedStyle(a).overflowY)&&a.scrollHeight>a.clientHeight))a=a.parentElement;
   (a||document.scrollingElement).scrollTop-=12;},[sels[0],block]);await settle(p);
  await p.screenshot({path:path.join(out,file)});return;
 }
 const box=await p.evaluate(([sels,pad,block])=>{const els=sels.map(s=>document.querySelector(s)).filter(Boolean);els[0].scrollIntoView({block});
  const rs=els.map(e=>e.getBoundingClientRect());const x=Math.max(0,Math.min(...rs.map(r=>r.left))-pad),y=Math.max(0,Math.min(...rs.map(r=>r.top))-pad);
  return{x,y,width:Math.min(innerWidth-x,Math.max(...rs.map(r=>r.right))+pad-x),height:Math.min(innerHeight-y,Math.max(...rs.map(r=>r.bottom))+pad-y)};},[sels,pad,block]);
 await settle(p);await p.screenshot({path:path.join(out,file),clip:box});
}
const txt=(p,sel)=>p.evaluate(s=>{const e=document.querySelector(s);return e?e.innerText.replace(/\s+/g,' ').trim():null;},sel);
const visible=(p,sel)=>p.evaluate(s=>{const e=document.querySelector(s);return !!e&&getComputedStyle(e).display!=='none';},sel);
// Fixed dice: every die shows 1 + floor(v × 10), so 0.85 is a 9 (no explosion), 0.65 a 7, 0.05 a 1.
const dice=(p,v)=>p.evaluate(v=>{Math.random=()=>v;},v);
// A row's buttons and notes, as the player sees them and as a screen reader names them.
const rowOf=(p,list,name,cls)=>p.evaluate(([list,name,cls])=>{const d=[...document.querySelectorAll('#'+list+' .entry')].find(x=>x.querySelector('.en-name').value===name);
 const row=d&&d.querySelector(cls);if(!row)return null;const vis=e=>e.getClientRects().length>0;
 return {text:row.innerText.replace(/\s+/g,' ').trim(),buttons:[...row.querySelectorAll('button')].filter(vis).map(b=>({label:b.textContent,shown:b.innerText,spoken:b.getAttribute('aria-label')||b.textContent,
  width:Math.round(b.getBoundingClientRect().width),disabled:b.disabled,title:b.title})),notes:[...row.querySelectorAll('[class$="-note"]')].map(n=>n.textContent),
  rowHeight:Math.round(row.getBoundingClientRect().height),lines:Math.round(row.getBoundingClientRect().height/22)};},[list,name,cls]);
const cardSel=(list,i)=>`#${list} .entry:nth-child(${i})`;

// ---------------- B01: the seven check buttons ----------------
const B01_CARDS=['Brash','Overconfident','Can’t Lie','Contrary','Rumormonger','Soft-Hearted','Lost Love'];
async function b01(b,phone,dev,proposed){
 const k=proposed?'proposed':'today',r={};const fx=write(out,'b01');
 const {c,p}=await open(b,phone,fx.file,fx.name);
 for(const m of ['play','management']){
  await mode(p,m);if(proposed)await P.b01(p);await tab(p,'Adv & Disadv');
  r[m]={};for(const n of B01_CARDS)r[m][n]=await rowOf(p,'disadvList',n,'.chk4531-row');
  if(phone){
   if(m==='play'){await shot(p,true,`b01-phone-${k}-play-1.png`,[cardSel('disadvList',1)],{block:'start'});
    await shot(p,true,`b01-phone-${k}-play-2.png`,[cardSel('disadvList',4)],{block:'start'});
    await shot(p,true,`b01-phone-${k}-play-3.png`,[cardSel('disadvList',6)],{block:'start'});}
   else await shot(p,true,`b01-phone-${k}-manage-1.png`,[cardSel('disadvList',1)],{block:'start'});
  } else if(m==='play'){
   await shot(p,false,`b01-laptop-${k}-play-1.png`,[1,2,3,4].map(i=>cardSel('disadvList',i)),{block:'start'});
   await shot(p,false,`b01-laptop-${k}-play-2.png`,[5,6,7].map(i=>cardSel('disadvList',i)),{block:'start'});
  }
 }
 // One check made, to show that the result window is unchanged (title, TN, success and failure lines).
 await mode(p,'play');await tab(p,'Adv & Disadv');await dice(p,0.85);
 await press(p,phone,p.locator(`${cardSel('disadvList',1)} .chk4531-btn`));
 if(await visible(p,'#rollPreviewOverlay')){await press(p,phone,p.locator('#rollPreviewGo'));}
 await p.waitForFunction(()=>getComputedStyle(document.getElementById('rollModalOverlay')).display!=='none');await wait(200);
 r.brashResult={title:await txt(p,'#rollModalTitle'),note:await txt(p,'#rollResultNote')};
 await press(p,phone,p.locator('#rollModalClose'));
 r.errors=p.errors;R[dev]['b01_'+k]=r;await c.close();
}
// The siblings, today only: Epilepsy and Lord Moon's Curse (already named for what they do), Touch of the Void (B18 G11).
async function b01sib(b,phone,dev){
 const r={};const fx=write(out,'b01sib');const {c,p}=await open(b,phone,fx.file,fx.name);
 await mode(p,'play');await tab(p,'Adv & Disadv');
 r.epilepsy=await rowOf(p,'disadvList','Epilepsy','.chk4531-row');r.touch=await rowOf(p,'disadvList','Touch of the Void','.vi4533-row');
 r.moon=await p.evaluate(()=>{const b=document.querySelector('#disadvList .lm7-roll');return b?{label:b.textContent,shown:b.innerText}:null;});
 if(!phone)await shot(p,false,'b01-laptop-siblings.png',[1,2,3].map(i=>cardSel('disadvList',i)),{block:'start'});
 else await shot(p,true,'b01-phone-siblings.png',[cardSel('disadvList',1)],{block:'start'});
 r.errors=p.errors;R[dev].b01_siblings=r;await c.close();
}

// ---------------- B03: Leadership (and Quick, its sibling) ----------------
async function b03(b,phone,dev,proposed){
 const k=proposed?'proposed':'today',r={};const fx=write(out,'b03');
 const {c,p}=await open(b,phone,fx.file,fx.name);await mode(p,'play');
 if(proposed)await P.b03(p);
 await tab(p,'Adv & Disadv');
 r.outOfCombat={leadership:await rowOf(p,'advList','Leadership','.vi4533-row'),quick:await rowOf(p,'advList','Quick','.vi4533-row')};
 await p.evaluate(()=>{window.__L5R_TEST__.setCombatActive(true);window.__L5R_TEST__.recalcAll();});await settle(p);
 r.before={leadership:await rowOf(p,'advList','Leadership','.vi4533-row'),quick:await rowOf(p,'advList','Quick','.vi4533-row')};
 await shot(p,phone,`b03-${dev}-${k}-before.png`,[cardSel('advList',1),cardSel('advList',2)],{block:phone?'start':'start'});
 // Lead an ally (fixed dice: a 7, + School Rank 1 = 8), then Quick.
 await dice(p,0.65);
 await press(p,phone,p.locator(`${cardSel('advList',1)} .vi4533-btn`));
 await p.waitForFunction(()=>getComputedStyle(document.getElementById('rollModalOverlay')).display!=='none');await wait(200);
 r.leadResult={title:await txt(p,'#rollModalTitle'),body:await txt(p,'#rollModalBody')};
 await press(p,phone,p.locator('#rollModalClose'));
 await press(p,phone,p.locator(`${cardSel('advList',2)} .vi4533-btn`));
 r.after={leadership:await rowOf(p,'advList','Leadership','.vi4533-row'),quick:await rowOf(p,'advList','Quick','.vi4533-row')};
 await shot(p,phone,`b03-${dev}-${k}-after.png`,[cardSel('advList',1),cardSel('advList',2)],{block:'start'});
 // Manage shows the same line (measured, not pictured).
 await mode(p,'management');await tab(p,'Adv & Disadv');
 r.manage={leadership:await rowOf(p,'advList','Leadership','.vi4533-row'),quick:await rowOf(p,'advList','Quick','.vi4533-row')};
 r.errors=p.errors;R[dev]['b03_'+k]=r;await c.close();
}

// ---------------- B05: Touch of the Void's success line (and Lord Moon's) ----------------
async function rollFrom(p,phone,sel,v){
 await dice(p,v);await press(p,phone,p.locator(sel));
 if(await visible(p,'#rollPreviewOverlay')){await press(p,phone,p.locator('#rollPreviewGo'));}
 await p.waitForFunction(()=>getComputedStyle(document.getElementById('rollModalOverlay')).display!=='none');await wait(250);
 return {title:await txt(p,'#rollModalTitle'),notation:await txt(p,'#rollModalNotation'),note:await txt(p,'#rollResultNote')};
}
async function b05(b,phone,dev,proposed){
 const k=proposed?'proposed':'today',r={};
 for(const [key,sel,name] of [['b05','#disadvList .vi4533-btn','touch'],['b05moon','#disadvList .lm7-roll','moon']]){
  const fx=write(out,key);const {c,p}=await open(b,phone,fx.file,fx.name);await mode(p,'play');
  if(proposed)await P.b05(p);
  await tab(p,'Adv & Disadv');
  r[name+'Button']=await p.evaluate(s=>{const e=document.querySelector(s);return e?e.textContent:null;},sel);
  r[name+'Success']=await rollFrom(p,phone,sel,0.85);
  await shot(p,phone,`b05-${dev}-${k}-${name}.png`,['#rollModalOverlay > *']);
  await press(p,phone,p.locator('#rollModalClose'));await wait(200);
  if(name==='moon'){r.moonAlert=await p.evaluate(()=>{const o=document.querySelector('.app-dialog-overlay,#appDialogOverlay');return o&&getComputedStyle(o).display!=='none'?o.innerText:null;});}
  r[name+'Failure']=await rollFrom(p,phone,sel,0.05);
  await press(p,phone,p.locator('#rollModalClose'));await wait(200);
  r[name+'Errors']=p.errors;await c.close();
 }
 R[dev]['b05_'+k]=r;
}

// ---------------- B09: the Skills page's picker ----------------
async function b09(b,phone,dev,proposed,key='b09'){
 const k=proposed?'proposed':'today',r={};const fx=write(out,key);
 const {c,p}=await open(b,phone,fx.file,fx.name);await mode(p,'management');
 if(proposed)await P.b09(p);
 await tab(p,'Skills');
 r.options=await p.evaluate(()=>[...document.querySelectorAll('#skillQuickAdd optgroup')].flatMap(g=>[...g.querySelectorAll('option')].map(o=>({group:g.label,value:o.value,text:o.textContent}))));
 if(key==='b09'){
 // The picker drawn open as a list (a native picker cannot be photographed), Intimidation highlighted without choosing it.
 await p.evaluate(()=>{const s=document.getElementById('skillQuickAdd');s.size=12;const i=[...s.options].findIndex(o=>o.value==='Intimidation');
  s.selectedIndex=i;s.options[i].scrollIntoView({block:'center'});});await settle(p);
 await shot(p,phone,`b09-${dev}-${k}-picker.png`,['#skillQuickAdd'],{block:'center'});
 r.highlighted=await p.evaluate(()=>{const s=document.getElementById('skillQuickAdd');return s.options[s.selectedIndex].textContent;});
 await p.evaluate(()=>{const s=document.getElementById('skillQuickAdd');s.size=0;s.selectedIndex=0;});await settle(p);
 if(!proposed){
  // Intimidation added through the picker: the row's Trait.
  await p.evaluate(()=>{const s=document.getElementById('skillQuickAdd');s.value='Intimidation';s.dispatchEvent(new Event('change',{bubbles:true}));});await settle(p);
  r.added=await p.evaluate(()=>{const tr=document.getElementById('skillsBody').lastElementChild;return {name:tr.querySelector('.sk-name').value,trait:tr.querySelector('.sk-trait').value,text:tr.innerText.replace(/\s+/g,' ').trim().slice(0,200)};});
  await shot(p,phone,`b09-${dev}-today-row.png`,['#skillsBody tr:last-child'],{block:'center'});
  await p.evaluate(()=>{document.getElementById('skillsBody').lastElementChild.remove();window.__L5R_TEST__.recalcAll();});await settle(p);
  // The Untrained Skills list (Play) for the same Skill on a character without it is read from the catalogue when opened.
 }
 }
 // Every option against the row it adds, through the picker's own change, the row then removed again.
 r.compare=await p.evaluate(opts=>{const T=window.__L5R_TEST__,sel=document.getElementById('skillQuickAdd'),body=document.getElementById('skillsBody');
  const fire=(e,t)=>e.dispatchEvent(new Event(t,{bubbles:true}));
  return opts.map(o=>{const m=/\(([^()]*)\)\s*$/.exec(o.text),label=m?m[1]:null;
   if(![...sel.options].some(x=>x.value===o.value))return {name:o.value,label,row:null,note:'not offered now'};
   const before=body.rows.length;sel.value=o.value;fire(sel,'change');
   const tr=body.rows.length>before?body.lastElementChild:null;const row=tr?tr.querySelector('.sk-trait').value:null;
   if(tr){tr.remove();T.recalcAll();}
   return {name:o.value,label,row,match:label===row};});
 },r.options);
 // The three Skills whose Trait follows a subject (Core pp.136–137, 143–144 as the sheet records it): the row once named.
 r.subjects=await p.evaluate(()=>{const T=window.__L5R_TEST__,sel=document.getElementById('skillQuickAdd'),body=document.getElementById('skillsBody');
  const fire=(e,t)=>e.dispatchEvent(new Event(t,{bubbles:true}));const res=[];
  for(const [base,subs] of [['Perform',['Biwa','Song']],['Games',['Go','Kemari','Letters']],['Craft',['Bowyer']]])for(const s of subs){
   const before=body.rows.length;sel.value=base;fire(sel,'change');const tr=body.rows.length>before?body.lastElementChild:null;if(!tr){res.push({name:base+': '+s,row:null});continue;}
   const first=tr.querySelector('.sk-trait').value;const n=tr.querySelector('.sk-name');n.value=base+': '+s;fire(n,'input');fire(n,'change');
   res.push({name:base+': '+s,asAdded:first,named:tr.querySelector('.sk-trait').value,note:(tr.querySelector('.st10-craft-note')||{}).textContent||''});
   tr.remove();T.recalcAll();}
  return res;});
 // Other places that show a Skill's Trait: the catalogue, Search's Skill record and the Untrained Skills list.
 r.elsewhere=await p.evaluate(()=>{const T=window.__L5R_TEST__;const out={};
  out.catalogue=T.findSkill('Intimidation').trait;
  const hit=T.SEARCH14.query({text:'Intimidation',category:'skills'}).results.find(h=>h.name==='Intimidation');
  const rec=hit?T.SEARCH14.get(hit.id):null;out.searchTags=hit?hit.tags:null;
  out.searchTrait=rec?((rec.fields||[]).find(f=>f.label==='Trait')||{}).value:null;
  document.getElementById('btnUntrainedSkills').click();
  const chip=document.querySelector('#untrainedSkillsBody .untrained-chip[data-skill-name="Intimidation"]');
  out.untrained=chip?{trait:chip.dataset.traitName,title:chip.title}:null;
  document.getElementById('untrainedSkillsClose').click();
  return out;});
 if(key!=='b09'){r.errors=p.errors;R[dev]['b09all_'+k]=r;await c.close();return;}
 r.errors=p.errors;R[dev]['b09_'+k]=r;await c.close();
}

(async()=>{
 const b=await chromium.launch();
 const only=(process.env.ONLY||'b01,b03,b05,b09').split(',');
 const states=process.env.PROPOSED==='0'?[false]:process.env.PROPOSED==='1'?[true]:[false,true];
 try{
  for(const [phone,dev] of [[true,'phone'],[false,'laptop']]){
   for(const proposed of states){
    if(only.includes('b01'))await b01(b,phone,dev,proposed);
    if(only.includes('b03'))await b03(b,phone,dev,proposed);
    if(only.includes('b05'))await b05(b,phone,dev,proposed);
    if(only.includes('b09')){await b09(b,phone,dev,proposed);await b09(b,phone,dev,proposed,'b09all');}
   }
   if(only.includes('b01'))await b01sib(b,phone,dev);
  }
 } finally {fs.writeFileSync(path.join(out,'reproduction.json'),JSON.stringify(R,null,1));await b.close();}
 console.log('done',sha);
})().catch(e=>{console.error(e);process.exit(1);});
