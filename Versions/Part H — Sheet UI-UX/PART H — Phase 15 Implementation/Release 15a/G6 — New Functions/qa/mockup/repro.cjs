'use strict';
// G6 (A19 + A20): reproduction on main 1ebf26b4 (A08 live; application 6d47849b…44b1) and scratch proposals,
// phone (390 × 844 touch) and laptop (1440 × 1000). Scratch only: no application file is edited; each proposal is
// applied inside the test browser.
const {fs,path,chromium,DENSE,sha,settle,tab,open}=require('./common.cjs');
const out=path.resolve(process.argv[2]);fs.mkdirSync(out,{recursive:true});
const R={source_sha256:sha,captured_utc:new Date().toISOString(),phone:{},laptop:{}};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
// Fixture: the audit's dense Kuni Shugenja (Void 3, 3 Void Points; Intimidation Rank 3 on Awareness 2 with the
// Control Emphasis; Willpower 4), its Advantages and Disadvantages replaced by Touch of the Void alone.
const FX=JSON.parse(JSON.stringify(DENSE));
FX.adv=[];FX.disadv=[{name:'Touch of the Void',cost:'3',desc:''}];FX.fields.f_name='G6 test';
const FXF=path.join(out,'g6.l5r.json');fs.writeFileSync(FXF,JSON.stringify(FX));

async function play(p){await p.evaluate(()=>window.__L5R_TEST__.MODES12.set('play'));await settle(p);}
async function press(p,phone,loc){await loc.scrollIntoViewIfNeeded();if(phone)await loc.tap();else await loc.click();await settle(p);}
// Phone: the whole screen, with the element of interest centred. Laptop: a clip around the elements.
async function shot(p,phone,file,sels,pad=10){
 if(phone){
  await p.evaluate(s=>{const e=document.querySelector(s);if(e)e.scrollIntoView({block:'center'});},sels[0]);await settle(p);
  await p.screenshot({path:path.join(out,file)});return;
 }
 const box=await p.evaluate(([sels,pad])=>{const els=sels.map(s=>document.querySelector(s)).filter(Boolean);els[0].scrollIntoView({block:'center'});
  const rs=els.map(e=>e.getBoundingClientRect());const x=Math.max(0,Math.min(...rs.map(r=>r.left))-pad),y=Math.max(0,Math.min(...rs.map(r=>r.top))-pad);
  return{x,y,width:Math.min(innerWidth-x,Math.max(...rs.map(r=>r.right))+pad-x),height:Math.min(innerHeight-y,Math.max(...rs.map(r=>r.bottom))+pad-y)};},[sels,pad]);
 await settle(p);await p.screenshot({path:path.join(out,file),clip:box});
}
const voidState=p=>p.evaluate(()=>{const T=window.__L5R_TEST__,$=id=>document.getElementById(id);
 return {points:$('void_current').value,pending:$('voidPendingEffects').value,round:$('combatRoundNumber').value,ledger:$('combatRoundLedger').value,
  armorTNBonus:T.getVoidArmorTNBonus(),touchOwed:T.VI4533.owed,panelNote:$('voidPanelNote').textContent,blanket:$('voidDisabledReason').textContent,
  roundNote:$('combatRoundNote').textContent,disabled:[...document.querySelectorAll('#voidSpendButtons button')].filter(b=>b.disabled).map(b=>b.dataset.void),
  undo:(()=>{const u=$('g6VoidUndo');return u&&!u.hidden?u.textContent.replace(/\s+/g,' ').trim():null;})(),status:$('statusMsg').textContent};});
const previewOpen=p=>p.evaluate(()=>getComputedStyle(document.getElementById('rollPreviewOverlay')).display!=='none');
const previewState=p=>p.evaluate(()=>{const b=document.getElementById('rollPreviewBody');
 return {title:document.getElementById('rollPreviewSubtitle').textContent,pool:(b.querySelector('.rp-pool-final')||{}).textContent,
  base:[...b.querySelectorAll('.rp-baserow')].map(r=>r.textContent.replace(/\s+/g,' ').trim()),mods:[...b.querySelectorAll('.rp-mod')].map(r=>r.textContent.replace(/\s+/g,' ').trim()),
  traitChoice:(b.querySelector('select.g6-trait')||{}).value||null,note:(b.querySelector('.g6-trait-note')||{}).textContent||null,
  go:(document.getElementById('rollPreviewGo')||{}).textContent};});

// ---------------- A19: the scratch proposal ----------------
// An Undo line on the Void card after a card spend. It restores what the spend changed (the points, the armed one-roll
// effect, the Round's spend, the skirmish Initiative flag, the Wounds of a damage reduction) and drops a Touch of the
// Void check still waiting for that spend, once. It goes after any roll, Next Round, Reset, or any other change to
// those values (a pip tap, another spend, another character).
async function proposeA19(p){
 await p.evaluate(()=>{
  const T=window.__L5R_TEST__,$=id=>document.getElementById(id);
  const IDS=['void_current','voidPendingEffects','combatRoundLedger','combatRoundNumber','voidInitSkirmish','f_woundsTaken'];
  const snap=()=>{const s={};IDS.forEach(id=>{const e=$(id);s[id]=e?e.value:null;});return s;};
  const same=(a,b)=>IDS.every(id=>a[id]===b[id]);
  const LABEL={k1:'+1k1 on your next roll',skill:'your next Unskilled roll made Skilled',tn:'+10 TN to be hit, this Round',
   init:'+10 Initiative, this skirmish',damage:'damage reduced by 10',kiho:'activating a Kiho'};
  const UNDONE={k1:'+1k1 cleared',skill:'the Skilled roll cleared',tn:'Armor TN back to normal',init:'Initiative back to normal',
   damage:'the Wounds taken back',kiho:'the Kiho activation taken back'};
  const S=window.__g6a19={last:null,pre:null,done:null};
  const wrap=$('voidSpendButtons');
  wrap.addEventListener('click',e=>{const b=e.target.closest('button.void-spend-btn');S.pre=b&&!b.disabled&&b.dataset.void?{key:b.dataset.void,snap:snap(),owed:T.VI4533.owed}:null;},true);
  wrap.addEventListener('click',()=>{const pre=S.pre;S.pre=null;if(!pre)return;const now=snap();
   if(+now.void_current<+pre.snap.void_current){S.last={key:pre.key,before:pre.snap,after:now,owed:T.VI4533.owed-pre.owed,base:pre.owed};S.done=null;draw();}});
  // The damage reduction is applied from its own row.
  const dmg=$('voidDamageApply');
  dmg.addEventListener('click',()=>{S.pre={key:'damage',snap:snap(),owed:T.VI4533.owed};},true);
  dmg.addEventListener('click',()=>{const pre=S.pre;S.pre=null;if(!pre)return;const now=snap();
   if(+now.void_current<+pre.snap.void_current){S.last={key:'damage',before:pre.snap,after:now,owed:T.VI4533.owed-pre.owed,base:pre.owed};S.done=null;draw();}});
  // Any roll made ends it (the result window opening); a cancelled preview is not a roll.
  new MutationObserver(()=>{if(getComputedStyle($('rollModalOverlay')).display!=='none'&&(S.last||S.done)){S.last=null;S.done=null;draw();}})
   .observe($('rollModalOverlay'),{attributes:true,attributeFilter:['style','class','hidden']});
  const valid=()=>{if(S.last&&!same(S.last.after,snap()))S.last=null;if(S.done&&!same(S.done.after,snap()))S.done=null;return S.last;};
  function undo(){
   if(!valid())return false;const L=S.last;S.last=null;
   IDS.forEach(id=>{const e=$(id);if(e&&L.before[id]!==null)e.value=L.before[id];});
   const drop=Math.min(Math.max(0,L.owed),Math.max(0,T.VI4533.owed-L.base));T.VI4533.owed-=drop;
   T.renderVoidPips();T.renderVoidPanel();T.renderCombatRoundUI();T.recalcAll();
   const msg='Undone: the Void Point is back; '+UNDONE[L.key]+(L.owed>0?(drop?'; no Touch of the Void roll.':'.'):'.');
   $('statusMsg').textContent=msg;S.done={msg,after:snap()};draw();return true;
  }
  function draw(){
   valid();
   let box=$('g6VoidUndo');
   if(!box){box=document.createElement('div');box.id='g6VoidUndo';box.className='g6-void-undo';box.setAttribute('aria-live','polite');}
   const anchor=$('voidWhyReasons')||wrap;if(box.previousSibling!==anchor)anchor.parentNode.insertBefore(box,anchor.nextSibling);
   let touch='';
   if(S.last&&S.last.owed>0)touch=T.VI4533.owed>S.last.base?' Touch of the Void’s Willpower roll comes after that roll; Undo drops it.':' Touch of the Void’s Willpower roll was not made.';
   const key=S.last?'L|'+S.last.key+touch:S.done?'D|'+S.done.msg:'none';
   if(box.dataset.key===key)return;box.dataset.key=key;
   box.textContent='';
   if(S.last){
    const b=document.createElement('button');b.type='button';b.className='ghost g6-void-undo-btn';b.textContent='Undo';
    b.setAttribute('aria-label','Undo the last Void spend');b.addEventListener('click',undo);
    const t=document.createElement('span');t.className='g6-void-undo-text';
    t.textContent='Spent: '+LABEL[S.last.key]+'.'+touch;
    box.append(b,t);box.hidden=false;
   } else if(S.done){
    const t=document.createElement('span');t.className='g6-void-undo-text';t.textContent=S.done.msg;box.append(t);box.hidden=false;
   } else box.hidden=true;
  }
  const st=document.createElement('style');
  st.textContent='.g6-void-undo{display:flex;align-items:center;gap:10px;margin:10px 0 6px;padding:8px 10px;border:1px solid var(--gold,#b08d3c);border-radius:8px;background:rgba(176,141,60,.08);font-size:.92em;line-height:1.35}'+
   '.g6-void-undo[hidden]{display:none}.g6-void-undo-btn{flex:0 0 auto;margin:0}.g6-void-undo-text{flex:1 1 auto}';
  document.head.appendChild(st);
  // Redraw with the card (every render) and on a short tick, so a change made elsewhere ends it on screen too.
  new MutationObserver(()=>draw()).observe(wrap,{childList:true});
  setInterval(draw,200);
  S.undo=undo;S.draw=draw;
 });
}

// ---------------- A20: the scratch proposal ----------------
// A Trait choice on the Trait row of a Skill roll's preview. Default: the Skill's own Trait. Listed first: Traits the
// books name for this Skill (here Intimidation: Willpower, Book of Earth p.9; Control in Core pp.121, 229); then the
// other Traits (the GM names the pair, Core p.79). A choice that is not the default is labelled; the next opening is
// back to the default. In the scratch version the preview is re-opened with the chosen Trait through the sheet's own
// Skill roll, so every number is the sheet's.
async function proposeA20(p){
 await p.evaluate(()=>{
  const T=window.__L5R_TEST__,$=id=>document.getElementById(id);
  const TRAITS=['Stamina','Willpower','Reflexes','Awareness','Strength','Perception','Agility','Intelligence'];
  const BOOK={intimidation:[{trait:'Willpower',where:'Book of Earth p.9'}]};
  const S=window.__g6a20={roll:null,choice:null,reopening:false};
  document.addEventListener('click',e=>{const b=e.target.closest('.sk-roll');if(!b)return;const tr=b.closest('tr');
   S.roll={name:tr.querySelector('.sk-name').value.trim(),def:tr.querySelector('.sk-trait').value.trim(),rank:parseInt(tr.querySelector('.sk-rank').value||'0',10)};S.choice=null;},true);
  const body=$('rollPreviewBody');
  new MutationObserver(()=>{if(getComputedStyle($('rollPreviewOverlay')).display==='none'&&!S.reopening){S.roll=null;S.choice=null;}})
   .observe($('rollPreviewOverlay'),{attributes:true,attributeFilter:['style']});
  new MutationObserver(decorate).observe(body,{childList:true});
  function decorate(){
   if(!S.roll||$('rollPreviewSubtitle').textContent.trim()!==S.roll.name)return;
   const row=body.querySelector('.rp-baserow');if(!row||row.querySelector('select.g6-trait'))return;
   const label=row.querySelector('.rp-mod-label');const cur=S.choice||S.roll.def;
   const m=label.textContent.match(/(\d+)\s*$/);const val=m?m[1]:'';
   const sel=document.createElement('select');sel.className='g6-trait';sel.setAttribute('aria-label','Trait for this roll');
   const v=t=>{const n=T.getTraitValueByName(t);return Number.isFinite(n)?' '+n:'';};
   const add=(parent,t)=>{const o=document.createElement('option');o.value=t;o.textContent=t+v(t);parent.appendChild(o);};
   const g1=document.createElement('optgroup');g1.label='Usual for '+S.roll.name;add(g1,S.roll.def);sel.appendChild(g1);
   const named=(BOOK[S.roll.name.toLowerCase()]||[]).filter(x=>x.trait!==S.roll.def);
   named.forEach(x=>{const g=document.createElement('optgroup');g.label='Named for '+S.roll.name+' ('+x.where+')';add(g,x.trait);sel.appendChild(g);});
   const g3=document.createElement('optgroup');g3.label='Other Traits (the GM’s call, Core p.79)';
   TRAITS.filter(t=>t!==S.roll.def&&!named.some(x=>x.trait===t)).forEach(t=>add(g3,t));sel.appendChild(g3);
   sel.value=cur;
   label.textContent='';label.append(sel);
   if(cur!==S.roll.def){
    row.classList.add('g6-trait-changed');
    const book=named.find(x=>x.trait===cur);
    const note=document.createElement('div');note.className='g6-trait-note';
    note.textContent='This roll only; '+S.roll.name+' is usually '+S.roll.def+'.'+(book?' '+book.where+': the GM may allow '+cur+' for '+S.roll.name+'.':'');
    row.parentNode.insertBefore(note,row.nextSibling);
   }
   sel.addEventListener('change',()=>{
    const r=S.roll;S.choice=sel.value===r.def?null:sel.value;S.reopening=true;
    $('rollPreviewCancel').click();
    setTimeout(()=>{T.rollSkill(r.name,S.choice||r.def,r.rank);S.reopening=false;},0);
   });
  }
  const st=document.createElement('style');
  st.textContent='select.g6-trait{font:inherit;font-weight:700;color:inherit;background:var(--paper,#fffaf0);border:1px solid var(--gold,#b08d3c);border-radius:6px;padding:2px 26px 2px 8px;max-width:13em}'+
   '.g6-trait-changed select.g6-trait{border-color:var(--shu,#a33);box-shadow:0 0 0 2px rgba(170,51,51,.18)}'+
   '.g6-trait-note{font-size:.85em;font-style:italic;color:var(--shu,#a33);margin:2px 0 6px}';
  document.head.appendChild(st);
 });
}

async function combat(p,phone){await tab(p,'Combat');await press(p,phone,p.locator('#combatActiveToggle'));}
async function closeResult(p,phone){await p.waitForFunction(()=>getComputedStyle(document.getElementById('rollModalOverlay')).display!=='none');
 await wait(300);await press(p,phone,p.locator('#rollModalClose'));await wait(600);}
async function rollIntimidation(p,phone,file,dev){
 await tab(p,'Skills');const row=p.locator('#skillsBody tr',{has:p.locator('.sk-name[value="Intimidation"]')});
 await press(p,phone,row.locator('.sk-roll'));await p.waitForFunction(()=>getComputedStyle(document.getElementById('rollPreviewOverlay')).display!=='none');await wait(200);
 if(file)await shot(p,phone,file,['#rollPreviewOverlay > *']);
 return previewState(p);
}

async function a19(b,phone,dev,proposed){
 const k=proposed?'proposed':'today';const r={};
 // 1. A mistaken +1k1 in a fight; then the way back today (a blank pip) or Undo; then the next roll.
 {const {c,p}=await open(b,phone,FXF,'G6 test');await play(p);if(proposed)await proposeA19(p);
  await combat(p,phone);r.before=await voidState(p);
  await shot(p,phone,`a19-${dev}-before.png`,['#voidDetails .void-panel','#voidDetails .combat-round-box']);
  await press(p,phone,p.locator('#voidSpendButtons button[data-void="k1"]'));await wait(400);
  r.spent=await voidState(p);
  await shot(p,phone,`a19-${dev}-${k}-spent.png`,[proposed?'#g6VoidUndo':'#voidSpendButtons','#voidDetails .void-panel','#voidDetails .combat-round-box']);
  if(!proposed){
   // The only way back today: a blank pip on the Void Ring card gives the point back; the rest stays.
   await tab(p,'Rings & Traits');const blank=p.locator('#voidPips .void-pip:not(.filled)').first();await press(p,phone,blank);
   await tab(p,'Combat');await wait(300);r.afterPip=await voidState(p);
   await shot(p,phone,`a19-${dev}-today-pip.png`,['#voidDetails .void-panel','#voidDetails .combat-round-box']);
  } else {
   await press(p,phone,p.locator('#g6VoidUndo button'));await wait(400);r.afterUndo=await voidState(p);
   r.undoButtonsLeft=await p.locator('#g6VoidUndo button').count();
   await shot(p,phone,`a19-${dev}-proposed-undone.png`,['#g6VoidUndo','#voidDetails .void-panel','#voidDetails .combat-round-box']);
  }
  // The next roll: Intimidation. Today the armed +1k1 rides on it (Touch of the Void makes it +2k1) and Touch of the
  // Void's Willpower roll opens when the result window closes.
  r.nextPreview=await rollIntimidation(p,phone,proposed?null:`a19-${dev}-today-next-preview.png`,dev);
  await press(p,phone,p.locator('#rollPreviewGo'));await closeResult(p,phone);
  r.touchCheckOpened=await previewOpen(p);
  if(r.touchCheckOpened){r.touchCheck=await previewState(p);if(!proposed)await shot(p,phone,`a19-${dev}-today-touch-check.png`,['#rollPreviewOverlay > *']);
   await press(p,phone,p.locator('#rollPreviewCancel'));}
  r.afterRoll=await voidState(p);r.errors=p.errors;await c.close();}
 // 2. A non-roll spend (+10 TN) with Touch of the Void: its Willpower roll opens at once; cancelled.
 {const {c,p}=await open(b,phone,FXF,'G6 test');await play(p);if(proposed)await proposeA19(p);
  await combat(p,phone);
  await press(p,phone,p.locator('#voidSpendButtons button[data-void="tn"]'));await wait(500);
  r.tnCheckOpened=await previewOpen(p);r.tnCheck=r.tnCheckOpened?await previewState(p):null;
  if(r.tnCheckOpened&&!proposed)await shot(p,phone,`a19-${dev}-touch-check-at-once.png`,['#rollPreviewOverlay > *']);
  if(r.tnCheckOpened)await press(p,phone,p.locator('#rollPreviewCancel'));await wait(400);
  r.tnAfterCancel=await voidState(p);
  await shot(p,phone,`a19-${dev}-${k}-tn-cancelled.png`,[proposed?'#g6VoidUndo':'#voidSpendButtons','#voidDetails .void-panel','#voidDetails .combat-round-box']);
  if(proposed){await press(p,phone,p.locator('#g6VoidUndo button'));await wait(400);r.tnAfterUndo=await voidState(p);}
  r.errors2=p.errors;await c.close();}
 R[dev]['a19_'+k]=r;
}

// Edge cases the audit names, proposal only (laptop), each on a fresh page: invalidation, double undo, the latest
// spend only, a cancelled preview, damage reduction. Touch of the Void's checks are cancelled as they open.
async function a19Edges(b){
 const E={};R.laptop.a19_edges=E;
 async function fresh(name,inCombat,fn){
  const {c,p}=await open(b,false,FXF,'G6 test');await play(p);await proposeA19(p);if(inCombat)await combat(p,false);else await tab(p,'Combat');
  const e=E[name]={touchChecksCancelled:0};
  const clear=async()=>{for(let i=0;i<6;i++){await wait(300);if(!(await previewOpen(p)))return;const s=await previewState(p);if(!/Touch of the Void/.test(s.title))return;
   e.touchChecksCancelled++;await press(p,false,p.locator('#rollPreviewCancel'));}};
  const spend=async key=>{await press(p,false,p.locator(`#voidSpendButtons button[data-void="${key}"]`));await clear();};
  const undoCount=()=>p.locator('#g6VoidUndo button').count();
  await fn({p,e,spend,clear,undoCount});e.errors=p.errors;await c.close();
 }
 await fresh('nextRound',true,async({p,e,spend,clear,undoCount})=>{await spend('k1');e.before=await undoCount();
  await press(p,false,p.locator('#btnNextRound'));await clear();e.after=await undoCount();e.state=await voidState(p);});
 await fresh('reset',true,async({p,e,spend,clear,undoCount})=>{await spend('tn');e.before=await undoCount();
  await press(p,false,p.locator('#btnResetRounds'));await clear();e.after=await undoCount();e.state=await voidState(p);});
 await fresh('latestOnlyAndDoubleUndo',false,async({p,e,spend,clear,undoCount})=>{await spend('skill');e.afterFirst=await voidState(p);await spend('k1');e.beforeUndo=await voidState(p);
  await p.locator('#g6VoidUndo button').dblclick();await clear();e.afterDoubleClick=await voidState(p);e.buttonsLeft=await undoCount();});
 await fresh('pipTap',true,async({p,e,spend,clear,undoCount})=>{await spend('k1');e.before=await undoCount();
  await tab(p,'Rings & Traits');await press(p,false,p.locator('#voidPips .void-pip:not(.filled)').first());await tab(p,'Combat');await wait(300);e.after=await undoCount();e.state=await voidState(p);});
 await fresh('roll',true,async({p,e,spend,clear,undoCount})=>{await spend('k1');e.before=await undoCount();
  e.preview=await rollIntimidation(p,false,null,'laptop');await press(p,false,p.locator('#rollPreviewGo'));await closeResult(p,false);await clear();
  await tab(p,'Combat');await wait(300);e.after=await undoCount();e.state=await voidState(p);});
 await fresh('cancelledPreview',true,async({p,e,spend,clear,undoCount})=>{await spend('k1');e.before=await undoCount();
  await rollIntimidation(p,false,null,'laptop');await press(p,false,p.locator('#rollPreviewCancel'));await tab(p,'Combat');await wait(300);e.after=await undoCount();
  await press(p,false,p.locator('#g6VoidUndo button'));await wait(300);e.undone=await voidState(p);});
 await fresh('damage',true,async({p,e,spend,clear,undoCount})=>{
  await press(p,false,p.locator('#voidSpendButtons button[data-void="damage"]'));await p.fill('#voidDamageInput','25');await press(p,false,p.locator('#voidDamageApply'));await clear();
  e.spent=await voidState(p);e.wounds=await p.inputValue('#f_woundsTaken');
  await press(p,false,p.locator('#g6VoidUndo button'));await wait(300);e.undone=await voidState(p);e.woundsAfter=await p.inputValue('#f_woundsTaken');});
 await fresh('initiative',true,async({p,e,spend,clear,undoCount})=>{await spend('init');e.spent=await voidState(p);
  e.initBonus=await p.evaluate(()=>window.__L5R_TEST__.getVoidInitiativeBonus());
  await press(p,false,p.locator('#g6VoidUndo button'));await wait(300);e.undone=await voidState(p);e.initBonusAfter=await p.evaluate(()=>window.__L5R_TEST__.getVoidInitiativeBonus());});
}

async function a20(b,phone,dev,proposed){
 const k=proposed?'proposed':'today';const r={};
 const {c,p}=await open(b,phone,FXF,'G6 test');await play(p);if(proposed)await proposeA20(p);
 await tab(p,'Skills');
 if(!proposed)await shot(p,phone,`a20-${dev}-card.png`,['#skillsBody tr:has(.sk-name[value="Intimidation"])']);
 r.preview=await rollIntimidation(p,phone,`a20-${dev}-${k}-preview.png`,dev);
 if(proposed){
  await p.selectOption('#rollPreviewBody select.g6-trait','Willpower');await wait(500);await settle(p);
  r.willpower=await previewState(p);
  await shot(p,phone,`a20-${dev}-proposed-willpower.png`,['#rollPreviewOverlay > *']);
  await press(p,phone,p.locator('#rollPreviewGo'));
  await p.waitForFunction(()=>getComputedStyle(document.getElementById('rollModalOverlay')).display!=='none');await wait(300);
  r.result={title:await p.textContent('#rollModalTitle'),notation:await p.textContent('#rollModalNotation'),
   emphasisOffer:await p.evaluate(()=>/Control|Emphasis|reroll/i.test(document.getElementById('rollModalBody').textContent))};
  await press(p,phone,p.locator('#rollModalClose'));await wait(400);
  r.saved=await p.evaluate(()=>{const tr=[...document.querySelectorAll('#skillsBody tr')].find(t=>t.querySelector('.sk-name').value==='Intimidation');
   const d=window.__L5R_TEST__.collectData();return {rowTrait:tr.querySelector('.sk-trait').value,savedTrait:(d.skills.find(s=>s.name==='Intimidation')||{}).trait};});
  r.reopened=await rollIntimidation(p,phone,`a20-${dev}-proposed-reopened.png`,dev);
  await press(p,phone,p.locator('#rollPreviewCancel'));
 } else await press(p,phone,p.locator('#rollPreviewCancel'));
 r.errors=p.errors;R[dev]['a20_'+k]=r;await c.close();
}

(async()=>{
 const b=await chromium.launch();
 try{
  if(process.env.ONLY!=='edges')for(const [phone,dev] of [[true,'phone'],[false,'laptop']]){
   for(const proposed of [false,true]){if(process.env.ONLY!=='a20')await a19(b,phone,dev,proposed);await a20(b,phone,dev,proposed);}
  }
  if(!process.env.ONLY)await a19Edges(b);
 } finally {fs.writeFileSync(path.join(out,'reproduction.json'),JSON.stringify(R,null,1));await b.close();}
 console.log('done',sha);
})().catch(e=>{console.error(e);process.exit(1);});
