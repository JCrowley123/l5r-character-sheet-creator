'use strict';
// Scratch CSS/DOM only. No application fragments or saved owner data are edited.
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require('playwright');
const root='C:/Users/jcrow/l5r-character-sheet-creator',V=path.join(root,'Versions');
const sheet=path.join(V,'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html');
const fixturePath=path.join(V,'BUGFIX — Older School Choices/qa/older-kitsu.l5r.json');
const out=path.resolve(process.argv[2]);fs.mkdirSync(out,{recursive:true});
const css=`
#sc8Dialog.g3-review[open]{display:flex;flex-direction:column;overflow:hidden;max-height:calc(100dvh - 32px);padding:16px;box-sizing:border-box}
#sc8Dialog.g3-review h2,#sc8Dialog.g3-review>.cw112-note{flex:none}
#sc8Dialog.g3-review #sc8Message:empty{display:none}
#sc8Dialog.g3-review #sc8Body{display:flex;flex-direction:column;min-height:0;overflow:hidden}
#sc8Dialog.g3-review #sc8Body>p{flex:none}
#sc8Dialog.g3-review .g3-groups{overflow:auto;min-height:0;display:grid;gap:14px;padding:0 2px 2px}
#sc8Dialog.g3-review fieldset{border:0;min-width:0;padding:0;margin:0}
#sc8Dialog.g3-review legend{font-family:'Noto Sans JP',sans-serif;font-size:.75rem;font-weight:600;letter-spacing:.035em;padding:0;margin-bottom:6px;color:var(--ink-soft)}
#sc8Dialog.g3-review fieldset>div+div{margin-top:4px}
#sc8Dialog.g3-review .oc8-held-spell{display:flex;align-items:center;min-height:44px;gap:10px;margin:0;padding:6px 9px;border:1px solid var(--line);border-radius:6px;box-sizing:border-box;font-family:'Noto Sans JP',sans-serif;font-size:.9rem;line-height:1.35;text-transform:none;letter-spacing:0;color:var(--ink)}
#sc8Dialog.g3-review .oc8-held-spell:has(input:checked){background:var(--paper);border-color:var(--ink-soft)}
#sc8Dialog.g3-review .oc8-spell{margin:0;width:16px;height:16px;flex:none}
#sc8Dialog.g3-review .g3-review-actions{display:flex;gap:8px;justify-content:flex-end;align-items:stretch;flex:none;padding-top:12px;margin-top:12px;border-top:1px solid var(--line)}
#sc8Dialog.g3-review .g3-review-actions button{min-height:44px;margin:0;padding:8px 12px}
#sc8Dialog.g3-review .oc8-confirm{background:var(--ink);border-color:var(--ink);color:var(--paper);order:2}
#sc8Dialog.g3-review #sc8Done{background:transparent;color:var(--ink);border:1px solid var(--line);order:1}
@media(min-width:800px){#sc8Dialog.g3-review .g3-groups{grid-template-columns:repeat(2,minmax(0,1fr))}}
#techList .g3-name-first .entry-top{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
#techList .g3-name-first .en-name{flex:0 0 calc(100% - 44px);width:calc(100% - 44px);min-width:0;margin-right:44px;box-sizing:border-box}
#techList .g3-name-first .g3-source-line{flex:0 0 100%;margin:0;display:flex;align-items:center;flex-wrap:wrap;gap:6px;font-size:.78rem;line-height:1.4;color:var(--ink-soft)}
#techList .g3-source-badge{font-family:'Noto Sans JP',sans-serif;font-size:.65rem;line-height:1.4;background:var(--ink-soft);color:var(--paper);padding:3px 7px;border-radius:5px;white-space:nowrap}
#techList .g3-school-names{overflow-wrap:anywhere}
#techList .g3-separated .g3-actions{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:8px}
#techList .g3-separated .g3-actions button{min-height:44px;margin:0}
#techList .g3-separated .spell-memo-label{display:inline-flex;align-items:center;gap:7px;min-height:44px;margin:0;white-space:nowrap;font-size:.72rem;letter-spacing:0}
#techList .g3-separated .spell-memo-checkbox{width:18px;height:18px;margin:0;flex:none}
#techList .g3-separated .rm-btn{position:static!important;flex:0 0 44px;min-width:44px;min-height:44px;margin-left:auto!important;padding:0;display:flex;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:5px}
#techList .g3-separated.g3-name-first .en-name{flex-basis:100%;width:100%;margin-right:0}
#techList .g3-separated:not(.g3-name-first) .entry-top{min-width:0}
html body.pm12-play #techList .g3-name-first .en-name{flex-basis:100%;width:100%;margin-right:0}
html body.pm12-play #techList .g3-separated .rm-btn[data-pm12-locked]{display:none!important}
`;
const settle=p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function tab(p,label){await p.evaluate(async label=>{const C=window.__L5R_CAROUSEL__;C.goToTab(label);await C.whenSettled();},label);await settle(p);}
async function dressReview(p){await p.evaluate(()=>{
 const d=document.querySelector('#sc8Dialog'),b=document.querySelector('#sc8Body'),confirm=b.querySelector('.oc8-confirm'),later=document.querySelector('#sc8Done');
 d.classList.add('g3-review');const groups=document.createElement('div');groups.className='g3-groups';
 b.insertBefore(groups,b.querySelector('fieldset'));[...b.querySelectorAll('fieldset')].forEach(f=>groups.append(f));
 const actions=document.createElement('div');actions.className='g3-review-actions';actions.append(later,confirm);b.append(actions);
 // Preserve OC8's body.contains(confirm) guard and restore the persistent Later
 // button before SC8.render replaces the review body after confirmation.
 confirm.addEventListener('click',()=>d.append(later),{capture:true});
 // Registered after OC8's own bubble listener: inspect the completed render,
 // not a microtask between capture and the target's original handler.
 confirm.addEventListener('click',()=>{if(b.contains(confirm))actions.prepend(later);else d.classList.remove('g3-review');});
 later.addEventListener('click',()=>{d.append(later);d.classList.remove('g3-review');},{capture:true,once:true});
});await settle(p);}
async function dressRows(p,variant,separate){await p.evaluate(({variant,separate})=>{
 const T=window.__L5R_TEST__,schools=JSON.parse(T.collectData().fields.f_schoolsData||'[]');
 for(const row of document.querySelectorAll('#techList .entry[data-spell-element]')){
  const top=row.querySelector('.entry-top'),name=row.querySelector('.en-name'),source=row.querySelector('.sc8-source');
  if(variant!=='today'){
   row.classList.add('g3-name-first');
   if(source){
    const grant=JSON.parse(row.dataset.sc8Grant||'null');source.remove();
    if(variant==='badge'||schools.length>1){
     const line=document.createElement('div');line.className='g3-source-line';
     if(variant==='badge'){const badge=document.createElement('span');badge.className='g3-source-badge';badge.textContent='School spell';line.append(badge);}
     if(schools.length>1){const names=document.createElement('span');names.className='g3-school-names';names.textContent=[grant.school,...(grant.otherSchools||[])].join(' · ');line.append(names);}
     name.after(line);
    }
   }
  }
  if(separate){
   row.classList.add('g3-separated');const actions=document.createElement('div');actions.className='g3-actions';
   for(const sel of ['.spell-cast-btn','.cast-why-btn','.spell-memo-label','.rm-btn']){const e=row.querySelector(sel);if(e)actions.append(e);}
   top.after(actions);
  }
 }
},{variant,separate});await settle(p);}
async function shot(p,name,selector){const el=p.locator(selector);await el.evaluate(e=>e.scrollIntoView({block:'center'}));await settle(p);await el.screenshot({path:path.join(out,name+'.png')});}
async function rowMetrics(p){return p.evaluate(()=>[...document.querySelectorAll('#techList .entry[data-spell-element]')].map(row=>{
 const n=row.querySelector('.en-name'),memo=row.querySelector('.spell-memo-label'),rm=row.querySelector('.rm-btn'),a=memo.getBoundingClientRect(),b=rm.getBoundingClientRect(),s=getComputedStyle(n);
 return{name:n.value,nameTextWidth:Math.max(0,n.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)),remove:{w:b.width,h:b.height,display:getComputedStyle(rm).display},memoHeight:a.height,overlap:{w:Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left)),h:Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top))},rowWidth:row.getBoundingClientRect().width,scrollWidth:row.scrollWidth,school:row.dataset.sc8Grant||null};
}));}
(async()=>{const browser=await chromium.launch();const meta={captured_utc:new Date().toISOString(),devices:{},note:'Scratch screenshots only; synthetic layout text is not a rules change.'};try{
 for(const [device,viewport] of Object.entries({phone:{width:390,height:844},laptop:{width:1440,height:1000}})){
  const context=await browser.newContext({viewport,deviceScaleFactor:1,isMobile:device==='phone',hasTouch:device==='phone'});
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(String(e)));
  await p.goto(pathToFileURL(sheet).href,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready,null,{timeout:60000});await p.evaluate(()=>document.fonts.ready);
  await p.addStyleTag({content:css});await p.locator('#fileImport').setInputFiles(fixturePath);await p.waitForFunction(()=>document.getElementById('f_name').value==='Older Kitsu test character');
  await p.evaluate(()=>window.__L5R_TEST__.MODES12.set('management'));await tab(p,'Identity');
  await p.getByRole('button',{name:'Review starting spells',exact:true}).click();await dressReview(p);
  await shot(p,`${device}-review-proposed`,'#sc8Dialog');
  const review=await p.evaluate(()=>{const d=document.querySelector('#sc8Dialog'),a=d.querySelector('.g3-review-actions').getBoundingClientRect(),c=d.querySelector('.oc8-confirm').getBoundingClientRect(),l=d.querySelector('#sc8Done').getBoundingClientRect(),g=d.querySelector('.g3-groups');return{dialogHeight:d.getBoundingClientRect().height,scrollHeight:g.scrollHeight,clientHeight:g.clientHeight,actionTop:a.top,confirm:{x:c.x,y:c.y,h:c.height},later:{x:l.x,y:l.y,h:l.height},minChoiceHeight:Math.min(...[...d.querySelectorAll('.oc8-held-spell')].map(e=>e.getBoundingClientRect().height))};});
  // Exercise the unchanged controls in the scratch dialog.
  const before=await p.evaluate(()=>JSON.stringify(window.__L5R_TEST__.collectData()));await p.getByRole('checkbox',{name:'Sense',exact:true}).check();await p.locator('#sc8Done').click();
  const laterNoWrites=before===await p.evaluate(()=>JSON.stringify(window.__L5R_TEST__.collectData()));
  const laterCloses=await p.locator('#sc8Dialog').isHidden();
  await p.getByRole('button',{name:'Review starting spells',exact:true}).click();await dressReview(p);
  await p.evaluate(()=>document.querySelectorAll('input.oc8-spell').forEach(i=>i.checked=i.value!=="Jurojin's Balm"));
  await p.locator('.oc8-confirm').click();await p.waitForSelector('#cw1123PickEarth');
  const transition=await p.evaluate(()=>{const d=window.__L5R_TEST__.collectData();return{schoolCount:d.tech.filter(t=>t.schoolChoice).length,rewardGrant:d.tech.find(t=>t.name==="Jurojin's Balm").schoolChoice||null,onlyEarth:!!document.querySelector('#cw1123PickEarth')&&!document.querySelector('#cw1123PickWater,#cw1123PickAir'),reviewClassRemoved:!document.querySelector('#sc8Dialog').classList.contains('g3-review')}});
  await shot(p,`${device}-after-confirm`,'#sc8Dialog');await p.locator('#sc8Done').click();
  const rich=await p.evaluate(()=>{const T=window.__L5R_TEST__,d=T.collectData();const keep=['Sense','Clarity of Purpose',"Jurojin's Balm"];d.tech=d.tech.filter(x=>keep.includes(x.name));
   d.tech.forEach(x=>{x.desc='Layout sample: the spell description remains here. No rules text is being changed.';});
   const long=T.SPELL_LIBRARY.filter(s=>s.name.length>=32&&!s.maho).sort((a,b)=>b.name.length-a.name.length)[0];
   if(long)d.tech.push({name:long.name,cost:0,desc:'Long-name layout sample using an existing catalogue spell.',spellElement:long.element.toLowerCase(),spellMastery:String(long.mastery),isMemorised:false});
   return d;
  });
  const states={},dataPreserved={};
  for(const mode of ['management','play']){
   for(const variant of ['today','quiet','badge']){
    await p.evaluate(({d,mode})=>{const T=window.__L5R_TEST__;T.applyData(d);T.MODES12.set(mode);}, {d:rich,mode});await tab(p,'Techniques');
    const beforeDressing=await p.evaluate(()=>JSON.stringify(window.__L5R_TEST__.collectData().tech));
    await dressRows(p,variant,variant!=='today');
    dataPreserved[`${mode}-${variant}`]=beforeDressing===await p.evaluate(()=>JSON.stringify(window.__L5R_TEST__.collectData().tech));
    await p.evaluate(()=>document.querySelectorAll('#techList .entry[data-spell-element]').forEach((r,i)=>r.dataset.g3Shot=i));
    const prefix=`${device}-${mode}-${variant}`;
    for(const i of [0,1,2,3])if(await p.locator(`[data-g3-shot="${i}"]`).count())await shot(p,`${prefix}-${i}`,`[data-g3-shot="${i}"]`);
    states[`${mode}-${variant}`]=await rowMetrics(p);
   }
  }
  // UI-03 on its own: old name/source treatment, controls separated.
  await p.evaluate(d=>{const T=window.__L5R_TEST__;T.applyData(d);T.MODES12.set('management');},rich);await tab(p,'Techniques');await dressRows(p,'today',true);
  await p.evaluate(()=>document.querySelectorAll('#techList .entry').forEach((r,i)=>r.dataset.g3Shot=i));await shot(p,`${device}-remove-only`,'[data-g3-shot="0"]');states.removeOnly=await rowMetrics(p);
  // UI-02 independently reserves the existing Remove corner, no UI-03 dressing.
  await p.evaluate(d=>{const T=window.__L5R_TEST__;T.applyData(d);T.MODES12.set('management');},rich);await tab(p,'Techniques');await dressRows(p,'badge',false);
  await p.evaluate(()=>document.querySelectorAll('#techList .entry').forEach((r,i)=>r.dataset.g3Shot=i));await shot(p,`${device}-name-only`,'[data-g3-shot="0"]');states.nameOnly=await rowMetrics(p);
  const multi=JSON.parse(JSON.stringify(rich));multi.fields.f_schoolsData=JSON.stringify([{name:'Kitsu Shugenja',frozen:true,frozenRank:1,floorRank:1,anchorInsightRank:0},{name:'Isawa Shugenja',frozen:false,frozenRank:null,floorRank:1,anchorInsightRank:1}]);multi.fields.f_school='Isawa Shugenja';multi.tech[0].schoolChoice.otherSchools=['Isawa Shugenja'];
  for(const variant of ['quiet','badge']){await p.evaluate(d=>{const T=window.__L5R_TEST__;T.applyData(d);T.MODES12.set('management');},multi);await tab(p,'Techniques');await dressRows(p,variant,true);await p.evaluate(()=>document.querySelectorAll('#techList .entry').forEach((r,i)=>r.dataset.g3Shot=i));await shot(p,`${device}-multiple-${variant}`,'[data-g3-shot="0"]');}
  // Bounded interaction probe on disposable data. This is not qualification.
  await p.evaluate(d=>{const T=window.__L5R_TEST__;T.applyData(d);T.MODES12.set('management');},rich);await tab(p,'Techniques');await dressRows(p,'badge',true);
  const flags=()=>p.evaluate(()=>[...document.querySelectorAll('#techList .entry[data-spell-element]')].map(r=>({name:r.querySelector('.en-name').value,memo:r.querySelector('.spell-memo-checkbox').checked})));
  const beforeFlags=await flags();await p.locator('#techList .entry[data-spell-element]').first().locator('.spell-memo-label').click({position:{x:70,y:22}});const afterFlags=await flags();
  const toggleOnlyFirst=afterFlags.every((r,i)=>r.memo===(i===0?!beforeFlags[i].memo:beforeFlags[i].memo));
  const reward=p.locator('#techList .entry[data-spell-element]').nth(2);await reward.locator('.en-name').fill("Jurojin's Balm — layout note");await reward.locator('.en-name').dispatchEvent('change');
  const saved=await p.evaluate(()=>window.__L5R_TEST__.collectData());await p.evaluate(d=>window.__L5R_TEST__.applyData(d),saved);await tab(p,'Techniques');await dressRows(p,'badge',true);
  const saveRoundTrip=await p.evaluate(()=>window.__L5R_TEST__.collectData().tech.some(t=>t.name==="Jurojin's Balm — layout note"&&!t.schoolChoice));
  await p.locator('#techList .entry[data-spell-element]').nth(2).locator('.rm-btn').click();
  const removedReward=await p.evaluate(()=>!window.__L5R_TEST__.collectData().tech.some(t=>t.name==="Jurojin's Balm — layout note"));
  await p.evaluate(()=>window.__L5R_TEST__.MODES12.set('play'));await settle(p);
  const playLocks=await p.locator('#techList .entry[data-spell-element]').evaluateAll(rs=>rs.every(r=>r.querySelector('.en-name').readOnly&&r.querySelector('.spell-memo-checkbox').disabled&&getComputedStyle(r.querySelector('.rm-btn')).display==='none'));
  // A separate, deliberately oversized collection demonstrates inner scrolling.
  const legacy=JSON.parse(fs.readFileSync(fixturePath,'utf8'));
  await p.evaluate(d=>{const T=window.__L5R_TEST__;const names=new Set(d.tech.map(t=>t.name));for(const s of T.SPELL_LIBRARY.filter(s=>['Water','Air','Earth'].includes(s.element)&&!s.maho&&!names.has(s.name)).slice(0,36))d.tech.push({name:s.name,cost:0,desc:'Synthetic long-list layout fixture',spellElement:s.element.toLowerCase(),spellMastery:String(s.mastery),isMemorised:false});T.applyData(d);T.MODES12.set('management');},legacy);
  await tab(p,'Identity');await p.getByRole('button',{name:'Review starting spells',exact:true}).click();await shot(p,`${device}-long-review-today`,'#sc8Dialog');await dressReview(p);await shot(p,`${device}-long-review-top`,'#sc8Dialog');
  const longReview=await p.evaluate(()=>{const g=document.querySelector('.g3-groups'),a=document.querySelector('.g3-review-actions');return{choices:g.querySelectorAll('input').length,clientHeight:g.clientHeight,scrollHeight:g.scrollHeight,footerTop:a.getBoundingClientRect().top}});
  await p.evaluate(()=>{const g=document.querySelector('.g3-groups');g.scrollTop=g.scrollHeight;});await shot(p,`${device}-long-review-bottom`,'#sc8Dialog');
  longReview.bottom=await p.evaluate(()=>({scrollTop:document.querySelector('.g3-groups').scrollTop,footerTop:document.querySelector('.g3-review-actions').getBoundingClientRect().top}));
  const beforeInvalid=await p.evaluate(()=>JSON.stringify(window.__L5R_TEST__.collectData()));
  await p.evaluate(()=>document.querySelectorAll('input.oc8-spell').forEach(i=>i.checked=true));await p.locator('.oc8-confirm').click();
  longReview.invalidRejected=await p.evaluate(()=>!!document.querySelector('#sc8Message').textContent&&!!document.querySelector('#sc8Body .g3-review-actions #sc8Done')&&!!document.querySelector('#sc8Body .g3-review-actions .oc8-confirm'));
  longReview.invalidNoWrites=beforeInvalid===await p.evaluate(()=>JSON.stringify(window.__L5R_TEST__.collectData()));await p.locator('#sc8Done').click();
  meta.devices[device]={viewport,review,laterNoWrites,laterCloses,transition,dataPreserved,interactions:{toggleOnlyFirst,saveRoundTrip,removedReward,playLocks},longReview,states,longName:rich.tech.at(-1).name,errors};console.log(device,JSON.stringify({laterNoWrites,laterCloses,transition,dataPreserved,interactions:{toggleOnlyFirst,saveRoundTrip,removedReward,playLocks},longReview,errors}));await context.close();
 }
 fs.writeFileSync(path.join(out,'prototype.json'),JSON.stringify(meta,null,2)+'\n');
 fs.writeFileSync(path.join(out,'scratch.css'),css);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
