'use strict';
// Claude review prototype, 11 November 2026. Scratch CSS/DOM only on unchanged G2.
// No application fragment, generated source or owner data is edited.
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require('playwright');
const root='C:/Users/jcrow/l5r-character-sheet-creator',V=path.join(root,'Versions');
const sheet=path.join(V,'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html');
const fixturePath=path.join(V,'BUGFIX — Older School Choices/qa/older-kitsu.l5r.json');
const G3=path.join(V,'Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/G3 — Spell Rows');
const out=path.resolve(process.argv[2]);fs.mkdirSync(out,{recursive:true});
// Codex's final scratch styles, used only to measure its rows beside this proposal.
const codexCss=fs.readFileSync(path.join(G3,'qa/prototype/scratch.css'),'utf8');
const css=`
/* ---- UI-01 (Claude): Codex's dialog, plus live counts and the pickers' own heading type ---- */
#sc8Dialog.c3-review[open]{display:flex;flex-direction:column;overflow:hidden;max-height:calc(100dvh - 32px);padding:16px;box-sizing:border-box}
#sc8Dialog.c3-review h2,#sc8Dialog.c3-review>.cw112-note{flex:none}
#sc8Dialog.c3-review #sc8Message:empty{display:none}
#sc8Dialog.c3-review #sc8Body{display:flex;flex-direction:column;min-height:0;overflow:hidden}
#sc8Dialog.c3-review #sc8Body>p{flex:none;margin:.2rem 0 .6rem}
#sc8Dialog.c3-review .c3-groups{overflow:auto;min-height:0;display:grid;gap:12px;padding:0 2px 2px}
#sc8Dialog.c3-review fieldset{border:0;min-width:0;padding:0;margin:0}
#sc8Dialog.c3-review legend{display:flex;align-items:baseline;gap:8px;width:100%;box-sizing:border-box;font-family:'EB Garamond',serif;font-size:.9rem;font-weight:700;padding:0;margin-bottom:4px;color:var(--ink)}
#sc8Dialog.c3-review .c3-count{margin-left:auto;font-family:'Noto Sans JP',sans-serif;font-size:.7rem;font-weight:700;padding:2px 8px;border-radius:999px;background:rgba(90,77,49,.12);color:var(--ink-soft);white-space:nowrap}
#sc8Dialog.c3-review .c3-count[data-state=done]{background:var(--ink-soft);color:var(--paper)}
#sc8Dialog.c3-review .c3-count[data-state=over]{background:#a3332a;color:#fff}
#sc8Dialog.c3-review fieldset>div+div{margin-top:4px}
#sc8Dialog.c3-review .oc8-held-spell{display:flex;align-items:center;min-height:44px;gap:8px;margin:0;padding:4px 8px;border:1px solid var(--line);border-radius:6px;box-sizing:border-box;font-family:'Noto Sans JP',sans-serif;font-size:.9rem;line-height:1.35;text-transform:none;letter-spacing:0;color:var(--ink)}
#sc8Dialog.c3-review .oc8-held-spell:has(input:checked){background:var(--paper);border-color:var(--ink-soft);font-weight:600}
#sc8Dialog.c3-review .oc8-spell{margin:0;width:18px;height:18px;flex:none}
#sc8Dialog.c3-review .c3-actions{display:flex;gap:8px;justify-content:flex-end;align-items:stretch;flex:none;padding-top:12px;margin-top:12px;border-top:1px solid var(--line)}
#sc8Dialog.c3-review .c3-actions button{min-height:44px;margin:0;padding:8px 12px}
#sc8Dialog.c3-review .oc8-confirm{background:var(--ink);border-color:var(--ink);color:var(--paper);order:2}
#sc8Dialog.c3-review #sc8Done{background:transparent;color:var(--ink);border:1px solid var(--line);order:1}
@media(min-width:800px){#sc8Dialog.c3-review .c3-groups{grid-template-columns:repeat(2,minmax(0,1fr));column-gap:16px}}

/* ---- UI-02 (Claude): name owns the first line on a phone; one quiet cue on the control line ---- */
#techList .entry.c3-name .entry-top{flex-wrap:wrap;gap:6px 8px}
#techList .entry.c3-name .en-name{flex:1 1 15rem;min-width:0}
#techList .entry.c3-name .c3-cue{order:9;margin-left:auto;align-self:center;flex:0 1 auto;display:inline-flex;align-items:center;padding:2px 8px;border-radius:999px;background:rgba(90,77,49,.12);color:var(--ink-soft);font-family:'Noto Sans JP',sans-serif;font-size:.7rem;font-weight:700;line-height:1.5;letter-spacing:0;text-transform:none}
@media(max-width:768px){
 #techList .entry.c3-name .en-name{flex:1 0 100%}
 #techList .entry.c3-name .spell-cast-btn,#techList .entry.c3-name .cast-why-btn{min-height:44px;margin:0}
 #techList .entry.c3-name .spell-memo-label{min-height:44px;gap:7px;margin:0;padding:0 2px}
 #techList .entry.c3-name .spell-memo-checkbox{width:18px;height:18px;margin:0;flex:none}
}
/* ---- UI-03 (Claude): Remove keeps the card corner every other card uses; the corner is reserved ---- */
#techList .entry.c3-rm .rm-btn{top:7px;right:4px;width:44px;height:44px;min-width:44px;min-height:44px;padding:0;display:inline-flex;align-items:center;justify-content:center}
#techList .entry.c3-rm .entry-top{flex-wrap:wrap}
@media(min-width:769px){
 #techList .entry.c3-rm .entry-top{padding-right:42px}
 html body.pm12-play #techList .entry.c3-rm .entry-top{padding-right:0}
}
@media(max-width:768px){
 #techList .entry.c3-rm.c3-name .en-name{flex:1 0 calc(100% - 42px);margin-right:42px}
 html body.pm12-play #techList .entry.c3-rm.c3-name .en-name{flex-basis:100%;margin-right:0}
 #techList .entry.c3-rm:not(.c3-name) .entry-top{padding-right:42px;row-gap:6px}
 #techList .entry.c3-rm:not(.c3-name) .en-name{flex:1 0 8rem;min-width:0}
 html body.pm12-play #techList .entry.c3-rm:not(.c3-name) .entry-top{padding-right:0}
}
html body.pm12-play #techList .entry.c3-rm .rm-btn[data-pm12-locked]{display:none!important}
`;
const settle=p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function tab(p,label){await p.evaluate(async label=>{const C=window.__L5R_CAROUSEL__;C.goToTab(label);await C.whenSettled();},label);await settle(p);}
async function dressReview(p){await p.evaluate(()=>{
 const d=document.querySelector('#sc8Dialog'),b=document.querySelector('#sc8Body'),confirm=b.querySelector('.oc8-confirm'),later=document.querySelector('#sc8Done');
 d.classList.add('c3-review');const groups=document.createElement('div');groups.className='c3-groups';
 b.insertBefore(groups,b.querySelector('fieldset'));[...b.querySelectorAll('fieldset')].forEach(f=>groups.append(f));
 const actions=document.createElement('div');actions.className='c3-actions';actions.append(later,confirm);b.append(actions);
 // Live count: the legend's own text stays as OC8 wrote it for assistive reading order; the
 // visible heading is the group name plus a running "n of N chosen".
 for(const f of groups.querySelectorAll('fieldset')){
  const lg=f.querySelector('legend'),m=/^(.*?) · (\d+) left$/.exec(lg.textContent);if(!m)continue;
  const want=+m[2];lg.textContent=m[1]==='Given'?'Given by your School':m[1];
  const c=document.createElement('span');c.className='c3-count';lg.append(c);
  const upd=()=>{const n=f.querySelectorAll('input:checked').length;c.textContent=n>want?`${n} of ${want} · deselect ${n-want}`:n===want?`${n} of ${want} chosen ✓`:`${n} of ${want} chosen`;c.dataset.state=n>want?'over':n===want?'done':'open';};
  f.addEventListener('change',upd);upd();
 }
 confirm.addEventListener('click',()=>d.append(later),{capture:true});
 confirm.addEventListener('click',()=>{if(b.contains(confirm))actions.prepend(later);else d.classList.remove('c3-review');});
 later.addEventListener('click',()=>{d.append(later);d.classList.remove('c3-review');},{capture:true,once:true});
});await settle(p);}
// variant: 'today' | 'claude' (UI-02+UI-03) | 'claude-rm' (UI-03 alone) | 'claude-name' (UI-02 alone) | 'codex-quiet' | 'codex-badge'
async function dressRows(p,variant){await p.evaluate(variant=>{
 const T=window.__L5R_TEST__,schools=JSON.parse(T.collectData().fields.f_schoolsData||'[]');
 for(const row of document.querySelectorAll('#techList .entry[data-spell-element]')){
  const top=row.querySelector('.entry-top'),name=row.querySelector('.en-name'),source=row.querySelector('.sc8-source');
  if(variant==='claude'||variant==='claude-name'){
   row.classList.add('c3-name');
   if(source){const grant=JSON.parse(row.dataset.sc8Grant||'null');source.remove();
    const cue=document.createElement('span');cue.className='c3-cue';
    cue.textContent=schools.length>1?[grant.school,...(grant.otherSchools||[])].join(' · '):'School spell';top.append(cue);}
  }
  if(variant==='claude'||variant==='claude-rm')row.classList.add('c3-rm');
  if(variant.startsWith('codex')){
   const v=variant.slice(6);row.classList.add('g3-name-first');
   if(source){const grant=JSON.parse(row.dataset.sc8Grant||'null');source.remove();
    if(v==='badge'||schools.length>1){const line=document.createElement('div');line.className='g3-source-line';
     if(v==='badge'){const badge=document.createElement('span');badge.className='g3-source-badge';badge.textContent='School spell';line.append(badge);}
     if(schools.length>1){const names=document.createElement('span');names.className='g3-school-names';names.textContent=[grant.school,...(grant.otherSchools||[])].join(' · ');line.append(names);}
     name.after(line);}}
   row.classList.add('g3-separated');const actions=document.createElement('div');actions.className='g3-actions';
   for(const sel of ['.spell-cast-btn','.cast-why-btn','.spell-memo-label','.rm-btn']){const e=row.querySelector(sel);if(e)actions.append(e);}
   top.after(actions);
  }
 }
},variant);await settle(p);}
async function shot(p,name,selector){const el=p.locator(selector);await el.evaluate(e=>e.scrollIntoView({block:'center'}));await settle(p);await el.screenshot({path:path.join(out,name+'.png')});}
async function rowMetrics(p){return p.evaluate(()=>[...document.querySelectorAll('#techList .entry[data-spell-element]')].map(row=>{
 const R=e=>e.getBoundingClientRect(),n=row.querySelector('.en-name'),rm=row.querySelector('.rm-btn'),b=R(rm),s=getComputedStyle(n);
 const inter=(a,b)=>({w:Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left)),h:Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top))});
 const others=['.en-name','.sc8-source','.c3-cue','.g3-source-line','.spell-cast-btn','.cast-why-btn','.spell-memo-label','.en-desc'].map(q=>[q,row.querySelector(q)]).filter(x=>x[1]);
 const overlaps={};if(b.width)for(const [q,e] of others){const i=inter(R(e),b);if(i.w>0&&i.h>0)overlaps[q]=i;}
 const tops=[...new Set(['.en-name','.spell-cast-btn','.c3-cue','.g3-source-line'].map(q=>row.querySelector(q)).filter(Boolean).map(e=>Math.round(R(e).top+R(e).height/2)))];
 return{name:n.value,rowHeight:Math.round(R(row).height),nameTextWidth:Math.round(Math.max(0,n.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight))),nameScrollWidth:n.scrollWidth,nameClientWidth:n.clientWidth,remove:{w:b.width,h:b.height},memoHeight:Math.round(R(row.querySelector('.spell-memo-label')).height),castHeight:Math.round(R(row.querySelector('.spell-cast-btn')).height),removeOverlaps:overlaps,headerLines:tops.length,scrollWidth:row.scrollWidth,clientWidth:row.clientWidth};
}));}
(async()=>{const browser=await chromium.launch();const meta={captured_utc:new Date().toISOString(),note:'Scratch review prototype; not qualification. Synthetic layout text is not a rules change.',devices:{}};try{
 for(const [device,viewport] of Object.entries({phone:{width:390,height:844},laptop:{width:1440,height:1000}})){
  const context=await browser.newContext({viewport,deviceScaleFactor:device==='phone'?2:1,isMobile:device==='phone',hasTouch:device==='phone'});
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(String(e)));
  await p.goto(pathToFileURL(sheet).href,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready,null,{timeout:60000});await p.evaluate(()=>document.fonts.ready);
  await p.addStyleTag({content:codexCss+css});await p.locator('#fileImport').setInputFiles(fixturePath);await p.waitForFunction(()=>document.getElementById('f_name').value==='Older Kitsu test character');
  await p.evaluate(()=>window.__L5R_TEST__.MODES12.set('management'));await tab(p,'Identity');
  // ---- UI-01
  const open=async()=>{await p.getByRole('button',{name:'Review starting spells',exact:true}).click();await settle(p);};
  await open();await shot(p,`${device}-review-today`,'#sc8Dialog');
  await dressReview(p);await shot(p,`${device}-review-claude-empty`,'#sc8Dialog');
  for(const n of ['Sense','Commune','Summon','Reflective Pool','Clarity of Purpose'])await p.getByRole('checkbox',{name:n,exact:true}).check();
  await shot(p,`${device}-review-claude-partial`,'#sc8Dialog');
  const review=await p.evaluate(()=>{const d=document.querySelector('#sc8Dialog'),g=d.querySelector('.c3-groups'),R=e=>e.getBoundingClientRect();return{dialogHeight:R(d).height,groupsClient:g.clientHeight,groupsScroll:g.scrollHeight,minChoiceHeight:Math.min(...[...d.querySelectorAll('.oc8-held-spell')].map(e=>R(e).height)),counts:[...d.querySelectorAll('.c3-count')].map(c=>c.textContent),confirm:R(d.querySelector('.oc8-confirm')).height,later:R(d.querySelector('#sc8Done')).height,lastGroupToActions:R(d.querySelector('.c3-actions')).top-R(g).bottom}});
  const before=await p.evaluate(()=>JSON.stringify(window.__L5R_TEST__.collectData()));await p.locator('#sc8Done').click();
  const laterNoWrites=before===await p.evaluate(()=>JSON.stringify(window.__L5R_TEST__.collectData())),laterCloses=await p.locator('#sc8Dialog').isHidden();
  await open();await dressReview(p);
  await p.evaluate(()=>document.querySelectorAll('input.oc8-spell').forEach(i=>{i.checked=i.value!=="Jurojin's Balm";i.dispatchEvent(new Event('change',{bubbles:true}));}));
  await p.locator('.oc8-confirm').click();await p.waitForSelector('#cw1123PickEarth');
  const transition=await p.evaluate(()=>{const d=window.__L5R_TEST__.collectData();return{schoolCount:d.tech.filter(t=>t.schoolChoice).length,rewardGrant:d.tech.find(t=>t.name==="Jurojin's Balm").schoolChoice||null,onlyEarth:!!document.querySelector('#cw1123PickEarth')&&!document.querySelector('#cw1123PickWater,#cw1123PickAir'),reviewClassRemoved:!document.querySelector('#sc8Dialog').classList.contains('c3-review')}});
  await p.locator('#sc8Done').click();
  // ---- rows
  const rich=await p.evaluate(()=>{const T=window.__L5R_TEST__,d=T.collectData();const keep=['Sense','Clarity of Purpose',"Jurojin's Balm"];d.tech=d.tech.filter(x=>keep.includes(x.name));
   d.tech.forEach(x=>{x.desc='Layout sample: the spell description remains here. No rules text is being changed.';});
   const long=T.SPELL_LIBRARY.filter(s=>s.name.length>=32&&!s.maho).sort((a,b)=>b.name.length-a.name.length)[0];
   if(long)d.tech.push({name:long.name,cost:0,desc:'Long-name layout sample using an existing catalogue spell.',spellElement:long.element.toLowerCase(),spellMastery:String(long.mastery),isMemorised:false});
   return d;});
  const states={},dataPreserved={};
  for(const mode of ['management','play'])for(const variant of ['today','codex-quiet','codex-badge','claude','claude-rm','claude-name']){
   await p.evaluate(({d,mode})=>{const T=window.__L5R_TEST__;T.applyData(d);T.MODES12.set(mode);},{d:rich,mode});await tab(p,'Techniques');
   const b4=await p.evaluate(()=>JSON.stringify(window.__L5R_TEST__.collectData().tech));
   await dressRows(p,variant);
   dataPreserved[`${mode}-${variant}`]=b4===await p.evaluate(()=>JSON.stringify(window.__L5R_TEST__.collectData().tech));
   await p.evaluate(()=>document.querySelectorAll('#techList .entry[data-spell-element]').forEach((r,i)=>r.dataset.c3Shot=i));
   for(const i of [0,1,2,3])if(await p.locator(`[data-c3-shot="${i}"]`).count())await shot(p,`${device}-${mode}-${variant}-${i}`,`[data-c3-shot="${i}"]`);
   states[`${mode}-${variant}`]=await rowMetrics(p);
  }
  // whole list, three rows, for a like-for-like height picture
  for(const variant of ['today','codex-badge','claude']){
   await p.evaluate(d=>{const T=window.__L5R_TEST__;T.applyData(d);T.MODES12.set('management');},rich);await tab(p,'Techniques');await dressRows(p,variant);
   await p.evaluate(()=>{const rows=[...document.querySelectorAll('#techList .entry[data-spell-element]')];const w=document.createElement('div');w.id='c3wrap';rows[0].before(w);rows.forEach(r=>w.append(r));});
   await shot(p,`${device}-list-${variant}`,'#c3wrap');
  }
  // multiple Schools
  const multi=JSON.parse(JSON.stringify(rich));multi.fields.f_schoolsData=JSON.stringify([{name:'Kitsu Shugenja',frozen:true,frozenRank:1,floorRank:1,anchorInsightRank:0},{name:'Isawa Shugenja',frozen:false,frozenRank:null,floorRank:1,anchorInsightRank:1}]);multi.fields.f_school='Isawa Shugenja';multi.tech[1].schoolChoice.otherSchools=['Isawa Shugenja'];
  await p.evaluate(d=>{const T=window.__L5R_TEST__;T.applyData(d);T.MODES12.set('management');},multi);await tab(p,'Techniques');await dressRows(p,'claude');
  await p.evaluate(()=>document.querySelectorAll('#techList .entry[data-spell-element]').forEach((r,i)=>r.dataset.c3Shot=i));
  await shot(p,`${device}-multiple-claude-0`,'[data-c3-shot="0"]');await shot(p,`${device}-multiple-claude-1`,'[data-c3-shot="1"]');states.multiple=await rowMetrics(p);
  // bounded interaction probe on disposable data
  await p.evaluate(d=>{const T=window.__L5R_TEST__;T.applyData(d);T.MODES12.set('management');},rich);await tab(p,'Techniques');await dressRows(p,'claude');
  const flags=()=>p.evaluate(()=>[...document.querySelectorAll('#techList .entry[data-spell-element]')].map(r=>({name:r.querySelector('.en-name').value,memo:r.querySelector('.spell-memo-checkbox').checked})));
  const f0=await flags();const lab=p.locator('#techList .entry[data-spell-element]').first().locator('.spell-memo-label');const lb=await lab.boundingBox();
  await lab.click({position:{x:lb.width-6,y:lb.height/2}});const f1=await flags();
  const toggleOnlyFirst=f1.every((r,i)=>r.memo===(i===0?!f0[i].memo:f0[i].memo));
  const reward=p.locator('#techList .entry[data-spell-element]').nth(2);await reward.locator('.en-name').fill("Jurojin's Balm — layout note");await reward.locator('.en-name').dispatchEvent('change');
  const saved=await p.evaluate(()=>window.__L5R_TEST__.collectData());await p.evaluate(d=>window.__L5R_TEST__.applyData(d),saved);await tab(p,'Techniques');await dressRows(p,'claude');
  const renameSurvives=await p.evaluate(()=>window.__L5R_TEST__.collectData().tech.some(t=>t.name==="Jurojin's Balm — layout note"&&!t.schoolChoice));
  const rmBtn=p.locator('#techList .entry[data-spell-element]').nth(2).locator('.rm-btn');const rb=await rmBtn.boundingBox();
  // tap the outer edge of the 44 px corner target, not its centre
  await rmBtn.click({position:{x:4,y:rb.height-4}});
  const removedReward=await p.evaluate(()=>!window.__L5R_TEST__.collectData().tech.some(t=>t.name==="Jurojin's Balm — layout note"));
  await p.evaluate(()=>window.__L5R_TEST__.MODES12.set('play'));await settle(p);
  const playLocks=await p.locator('#techList .entry[data-spell-element]').evaluateAll(rs=>rs.every(r=>r.querySelector('.en-name').readOnly&&r.querySelector('.spell-memo-checkbox').disabled&&getComputedStyle(r.querySelector('.rm-btn')).display==='none'));
  // long list
  const legacy=JSON.parse(fs.readFileSync(fixturePath,'utf8'));
  await p.evaluate(d=>{const T=window.__L5R_TEST__;const names=new Set(d.tech.map(t=>t.name));for(const s of T.SPELL_LIBRARY.filter(s=>['Water','Air','Earth'].includes(s.element)&&!s.maho&&!names.has(s.name)).slice(0,36))d.tech.push({name:s.name,cost:0,desc:'Synthetic long-list layout fixture',spellElement:s.element.toLowerCase(),spellMastery:String(s.mastery),isMemorised:false});T.applyData(d);T.MODES12.set('management');},legacy);
  await tab(p,'Identity');await open();await dressReview(p);
  await p.evaluate(()=>{const tick=n=>{const i=[...document.querySelectorAll('input.oc8-spell')].find(i=>i.value===n);if(i){i.checked=true;i.dispatchEvent(new Event('change',{bubbles:true}));}};['Sense','Commune','Summon'].forEach(tick);[...document.querySelectorAll('fieldset')].find(f=>f.querySelector('legend').textContent.startsWith('Air')).querySelectorAll('input').forEach((i,k)=>{if(k<3){i.checked=true;i.dispatchEvent(new Event('change',{bubbles:true}));}});});
  await shot(p,`${device}-long-review-claude-top`,'#sc8Dialog');
  const longReview=await p.evaluate(()=>{const g=document.querySelector('.c3-groups'),a=document.querySelector('.c3-actions');return{choices:g.querySelectorAll('input').length,clientHeight:g.clientHeight,scrollHeight:g.scrollHeight,footerTop:a.getBoundingClientRect().top,counts:[...g.querySelectorAll('.c3-count')].map(c=>c.textContent)}});
  await p.evaluate(()=>{const f=[...document.querySelectorAll('.c3-groups fieldset')].find(f=>f.querySelector('legend').textContent.startsWith('Air'));f.scrollIntoView({block:'start'});});await settle(p);
  await shot(p,`${device}-long-review-claude-air`,'#sc8Dialog');
  longReview.footerTopAfterScroll=await p.evaluate(()=>document.querySelector('.c3-actions').getBoundingClientRect().top);
  const b5=await p.evaluate(()=>JSON.stringify(window.__L5R_TEST__.collectData()));await p.locator('.oc8-confirm').click();await settle(p);
  longReview.overQuotaRejected=await p.evaluate(()=>!!document.querySelector('#sc8Message').textContent&&!!document.querySelector('#sc8Body .c3-actions #sc8Done')&&!!document.querySelector('#sc8Body .c3-actions .oc8-confirm'));
  longReview.overQuotaNoWrites=b5===await p.evaluate(()=>JSON.stringify(window.__L5R_TEST__.collectData()));await p.locator('#sc8Done').click();
  meta.devices[device]={viewport,review,laterNoWrites,laterCloses,transition,dataPreserved,interactions:{toggleOnlyFirst,renameSurvives,removedReward,playLocks},longReview,states,errors};
  console.log(device,JSON.stringify({review,laterNoWrites,laterCloses,transition,interactions:{toggleOnlyFirst,renameSurvives,removedReward,playLocks},longReview,errors,preserved:Object.values(dataPreserved).every(Boolean)}));
  await context.close();
 }
 fs.writeFileSync(path.join(out,'claude-prototype.json'),JSON.stringify(meta,null,2)+'\n');fs.writeFileSync(path.join(out,'claude-scratch.css'),css);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
