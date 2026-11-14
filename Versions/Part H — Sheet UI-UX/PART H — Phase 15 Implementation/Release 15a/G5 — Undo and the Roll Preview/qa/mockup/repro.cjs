'use strict';
// G5 (A08 + A12): reproduction on main c5dd578b (= production) and scratch proposals, phone + laptop.
// Scratch only: no application file is edited; each proposal is applied inside the test browser.
const {fs,path,chromium,DENSE,sha,settle,tab,open}=require('./common.cjs');
const out=path.resolve(process.argv[2]);fs.mkdirSync(out,{recursive:true});
const R={source_sha256:sha,captured_utc:new Date().toISOString(),phone:{},laptop:{}};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
// Fixtures: the audit's dense Kuni Shugenja (Honour 4.7); a copy with the four resist Advantages added.
const DENSE_FX=path.join(out,'dense.l5r.json');fs.writeFileSync(DENSE_FX,JSON.stringify(DENSE));
const RES=JSON.parse(JSON.stringify(DENSE));
['Balance','Clear Thinker','Heartless','Irreproachable'].forEach(n=>RES.adv.push({name:n,cost:'2',desc:''}));
RES.fields.f_name='G5 resist test';
const RES_FX=path.join(out,'resist.l5r.json');fs.writeFileSync(RES_FX,JSON.stringify(RES));

async function play(p){await p.evaluate(()=>window.__L5R_TEST__.MODES12.set('play'));await settle(p);}
async function clip(p,sels,file,pad=8){
 const box=await p.evaluate(([sels,pad])=>{const els=sels.map(s=>document.querySelector(s)).filter(Boolean);els[0].scrollIntoView({block:'center'});
  const rs=els.map(e=>e.getBoundingClientRect());const x=Math.max(0,Math.min(...rs.map(r=>r.left))-pad),y=Math.max(0,Math.min(...rs.map(r=>r.top))-pad);
  return{x,y,width:Math.min(innerWidth-x,Math.max(...rs.map(r=>r.right))+pad-x),height:Math.min(innerHeight-y,Math.max(...rs.map(r=>r.bottom))+pad-y)};},[sels,pad]);
 await settle(p);await p.screenshot({path:path.join(out,file),clip:box});return box;
}

// ---------------- A08: the scratch proposal (rolling 5-second group) ----------------
async function proposeA08(p){
 await p.evaluate(()=>{
  const T=window.__L5R_TEST__,CP7=T.CP7,RP7=T.RP7,TA7=T.TA7,AL71=T.AL71;
  const titles={honor:'Honour',glory:'Glory',status:'Status',taint:'Taint'};
  const G=window.__x08={open:null,last:null,timer:null};
  const check=AL71.check;
  AL71.check=function(){return G.open?[]:check.apply(this,arguments);};      // History waits while a group is open
  const close=()=>{clearTimeout(G.timer);G.timer=null;if(G.open){G.open=null;check.call(AL71);}};
  const adjust=CP7.adjust;
  CP7.adjust=function(name){
   const before=CP7.read(name);
   if(G.open&&G.open.name!==name)close();
   const ok=adjust.apply(this,arguments);
   if(ok){
    if(!G.open)G.open={name,before,taps:0};
    G.open.taps++;G.last=G.open;clearTimeout(G.timer);G.timer=setTimeout(close,5000);
    const s=CP7.read(name),n=document.getElementById('cp7-notice');
    if(G.open.taps>1)n.textContent=titles[name]+': Rank '+s.rank+', Points '+s.points+'. Undo takes back all '+G.open.taps+' taps.';
   }
   return ok;
  };
  document.getElementById('cp7-undo').addEventListener('click',()=>{
   const g=G.last,n=document.getElementById('cp7-notice');
   if(g&&g.taps>1&&/^Undone\./.test(n.textContent)){
    if(g.name==='taint')TA7.write(g.before.rank,g.before.points);else{RP7.write(g.name,g.before.rank,g.before.points);RP7.changed(g.name);}
    CP7.renderAll();n.textContent='Undone. '+titles[g.name]+': Rank '+g.before.rank+', Points '+g.before.points+'.';
   }
   G.last=null;close();
  });
 });
}
const honourState=p=>p.evaluate(()=>({rank:document.getElementById('f_honorRank').value,points:document.getElementById('f_honorPts').value,
 notice:document.getElementById('cp7-notice').textContent,undoShown:!document.getElementById('cp7-undo').hidden}));
const historyHonour=p=>p.evaluate(()=>window.__L5R_TEST__.AL71.entries().filter(e=>e.what==='Honor').map(e=>e.from+' → '+e.to));
// Laptop: the four cards and the message line in one picture. Phone: the cards are stacked, so the Honour card and
// the message line under the fourth card are two pictures.
async function cardShots(p,phone,stem){
 if(!phone)return clip(p,['#cp7-section .cp7-grid','#cp7-section .cp7-feedback'],stem+'.png');
 await clip(p,['#cp7-section [data-cp7=honor]'],stem+'-card.png');
 await clip(p,['#cp7-section .cp7-feedback'],stem+'-line.png',10);
}
async function tapPlus(p,phone){const b=p.locator('[data-cp7=honor] button[aria-label="Add Honour points"]');if(phone)await b.tap();else await b.click();}
async function tapUndo(p,phone){const b=p.locator('#cp7-undo');if(phone)await b.tap();else await b.click();}

async function a08(b,phone,dev,proposed){
 const k=proposed?'proposed':'today';
 // 1. Quick burst (the audit's case): three taps, no pause, then Undo.
 {const {c,p}=await open(b,phone,DENSE_FX,DENSE.fields.f_name);await play(p);await tab(p,'Identity');if(proposed)await proposeA08(p);
  for(let i=0;i<3;i++)await tapPlus(p,phone);
  const afterTaps=await honourState(p);await tapUndo(p,phone);await settle(p);
  R[dev]['a08_quick_'+k]={afterTaps,afterUndo:await honourState(p),errors:p.errors};await c.close();}
 // 2. Three taps about 2 seconds apart; wait 6 s; card picture; History; Undo; card picture; History.
 const {c,p}=await open(b,phone,DENSE_FX,DENSE.fields.f_name);await play(p);await tab(p,'Identity');if(proposed)await proposeA08(p);
 await wait(2500);const historyBefore=await historyHonour(p);
 for(let i=0;i<3;i++){await tapPlus(p,phone);if(i<2)await wait(2000);}
 await wait(6000);
 const afterTaps=await honourState(p);
 await cardShots(p,phone,`${dev}-a08-taps-${k}`);
 const historyAfterTaps=await historyHonour(p);
 await p.evaluate(()=>window.__L5R_TEST__.AL71.show());await settle(p);
 await p.locator('.al71-panel').screenshot({path:path.join(out,`${dev}-a08-history-${k}.png`)});
 await p.evaluate(()=>{document.getElementById('al71Overlay').style.display='none';});
 await tapUndo(p,phone);await settle(p);
 const afterUndo=await honourState(p);
 await cardShots(p,phone,`${dev}-a08-undo-${k}`);
 await wait(2500);
 R[dev]['a08_spaced_'+k]={historyBefore,afterTaps,historyAfterTaps,afterUndo,historyAfterUndo:await historyHonour(p),errors:p.errors};
 await c.close();
}

// ---------------- A12: the scratch proposal (one closed Resisting? line) ----------------
const RESIST_KEYS=['honour-resistance:resist','situational-entries:balance','situational-entries:clear-thinker','situational-entries:heartless',
 'situational-entries:irreproachable','fortune-blessing:jurojin','fortune-blessing:hotei','spirit-realms:meido','spirit-realms:tengoku',
 'ancestors:kaimetsu-provoked','ancestors:moto-resist','ancestors:yamatsu-resist','ancestors:hitomi-resist','ancestors:reichin-fear','ancestors:reichin-bloodspeaker'];
const A12_CSS=[
 '.x12-resist{border:1px solid var(--line);border-radius:8px;background:#fffdf8;margin:4px 0 6px;}',
 '.x12-resist>summary{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 8px;min-height:32px;padding:6px 10px;cursor:pointer;list-style:none;font-size:.95rem;color:var(--ink);}',
 '.x12-resist>summary::-webkit-details-marker{display:none;}',
 '.x12-q{font-weight:600;}',
 '.x12-q::before{content:"";display:inline-block;width:0;height:0;margin-right:8px;vertical-align:middle;border-style:solid;border-width:5px 0 5px 7px;border-color:transparent transparent transparent var(--ink-soft);transition:transform .15s;}',
 '.x12-resist[open]>summary .x12-q::before{transform:rotate(90deg);}',
 '.x12-count{margin-left:auto;font-size:.85em;color:var(--ink-soft);}',
 '.x12-resist.x12-has>summary .x12-count{color:var(--shu-dark);font-weight:600;}',
 '.x12-chosen{flex-basis:100%;font-size:.85em;color:var(--shu-dark);overflow-wrap:anywhere;}',
 '.x12-resist[open]>summary .x12-chosen{display:none;}',
 '.x12-body{padding:0 10px 8px;}',
 '.x12-body .rd4515-source:first-child{margin-top:0;}'].join('\n');
async function proposeA12(p){
 await p.addStyleTag({content:A12_CSS});
 await p.evaluate(keys=>{
  const RES=new Set(keys),S=window.__x12={open:false};
  const body=document.getElementById('rollPreviewBody');
  const short=(label,src)=>{const at=label.lastIndexOf(' — ');const bonus=at<0?'':label.slice(at+3).replace(/ to the total$/,'');
   const m=/^([^:]+):/.exec(label);return (m?m[1]:src)+(bonus?' '+bonus:'');};
  function apply(){
   const dec=body.querySelector('.rd4515-declare');if(!dec||dec.dataset.x12)return;dec.dataset.x12='1';
   const items=[...dec.querySelectorAll('label.rd4515-opt')].filter(l=>RES.has(l.querySelector('input').dataset.rd4515Key)).map(l=>{
    let s=l.previousElementSibling;while(s&&!s.classList.contains('rd4515-source'))s=s.previousElementSibling;
    const note=l.nextElementSibling&&l.nextElementSibling.classList.contains('rd4515-opt-note')?l.nextElementSibling:null;
    return {l,note,src:s?s.textContent:''};});
   if(!items.length)return;
   items.sort((a,b)=>(a.src==='Honour'?0:1)-(b.src==='Honour'?0:1));
   const det=document.createElement('details');det.className='x12-resist';det.open=S.open;
   const inner=document.createElement('div');inner.className='x12-body';let cur=null;
   items.forEach(it=>{if(it.src!==cur){cur=it.src;const h=document.createElement('div');h.className='rd4515-source';h.textContent=cur;inner.append(h);}inner.append(it.l);if(it.note)inner.append(it.note);});
   dec.querySelectorAll('.rd4515-source').forEach(h=>{const n=h.nextElementSibling;if(!n||!n.classList.contains('rd4515-opt'))h.remove();});
   const chosen=items.filter(it=>it.l.querySelector('input').checked);
   const sum=document.createElement('summary');
   sum.innerHTML='<span class="x12-q">Resisting?</span><span class="x12-count"></span>'+(chosen.length?'<span class="x12-chosen"></span>':'');
   sum.querySelector('.x12-count').textContent=chosen.length?chosen.length+' chosen':items.length+(items.length===1?' option':' options');
   if(chosen.length){sum.querySelector('.x12-chosen').textContent=chosen.map(it=>short(it.l.textContent.trim(),it.src)).join(' · ');det.classList.add('x12-has');}
   det.append(sum,inner);dec.querySelector('.rd4515-head').after(det);
   det.addEventListener('toggle',()=>{S.open=det.open;});
  }
  new MutationObserver(apply).observe(body,{childList:true});apply();
 },RESIST_KEYS);
}
async function openWillpower(p){
 await tab(p,'Rings & Traits');
 await p.locator('.trait-row label[data-trait-name="Willpower"]').first().click();
 await p.waitForSelector('#rollPreviewOverlay',{state:'visible'});await settle(p);await p.waitForTimeout(200);
}
const previewMetrics=p=>p.evaluate(()=>{const dec=document.querySelector('.rd4515-declare'),go=document.getElementById('rollPreviewGo'),body=document.getElementById('rollPreviewBody');
 const sc=body.closest('.roll-modal')||body;const r=go.getBoundingClientRect();
 return {declareHeight:Math.round(dec.getBoundingClientRect().height),previewScrollHeight:sc.scrollHeight,previewClientHeight:sc.clientHeight,
  rollButton:go.textContent.trim(),rollButtonVisibleWithoutScroll:r.bottom<=innerHeight&&r.bottom<=sc.getBoundingClientRect().bottom,
  declareText:dec.innerText.replace(/\n+/g,' | '),keys:[...dec.querySelectorAll('[data-rd4515-key]')].map(i=>i.dataset.rd4515Key)};});
// The whole Declare section, however tall: the viewport is made tall just for this picture (the dialog's height follows it).
async function declareShot(p,phone,file){
 const vp=p.viewportSize();await p.setViewportSize({width:vp.width,height:2600});await settle(p);await p.waitForTimeout(150);
 await p.locator('.rd4515-declare').screenshot({path:path.join(out,file)});
 await p.setViewportSize(vp);await settle(p);await p.waitForTimeout(150);
}
async function a12(b,phone,dev,proposed,fx,name,tag){
 const k=proposed?'proposed':'today';
 const {c,p}=await open(b,phone,fx,name);await play(p);if(proposed)await proposeA12(p);
 await openWillpower(p);
 const m={atOpen:await previewMetrics(p)};
 await p.screenshot({path:path.join(out,`${dev}-a12-${tag}-view-${k}.png`)});
 await declareShot(p,phone,`${dev}-a12-${tag}-declare-${k}.png`);
 if(proposed&&tag==='resist'){
  await p.locator('.x12-resist>summary').click();await settle(p);
  await declareShot(p,phone,`${dev}-a12-${tag}-declare-open.png`);
  m.opened=await previewMetrics(p);
  await p.locator('[data-rd4515-key="honour-resistance:resist"]').check();await settle(p);
  m.afterTickStillOpen=await p.evaluate(()=>document.querySelector('.x12-resist').open);
  await p.locator('.x12-resist>summary').click();await settle(p);
  await declareShot(p,phone,`${dev}-a12-${tag}-declare-chosen.png`);
  await p.screenshot({path:path.join(out,`${dev}-a12-${tag}-view-chosen.png`)});
  m.chosenClosed=await previewMetrics(p);
  m.rollText=await p.evaluate(()=>document.getElementById('rollPreviewBody').innerText.split('\n').slice(0,14).join(' | '));
 }
 if(!proposed&&tag==='resist'){
  await p.locator('[data-rd4515-key="honour-resistance:resist"]').check();await settle(p);
  m.rollText=await p.evaluate(()=>document.getElementById('rollPreviewBody').innerText.split('\n').slice(0,14).join(' | '));
 }
 m.errors=p.errors;R[dev][`a12_${tag}_${k}`]=m;await c.close();
}

(async()=>{
 const b=await chromium.launch();
 for(const [phone,dev] of [[true,'phone'],[false,'laptop']]){
  for(const proposed of [false,true]){
   await a08(b,phone,dev,proposed);
   await a12(b,phone,dev,proposed,RES_FX,'G5 resist test','resist');
   if(phone)await a12(b,phone,dev,proposed,DENSE_FX,DENSE.fields.f_name,'honour');
  }
 }
 await b.close();
 fs.writeFileSync(path.join(out,'reproduction.json'),JSON.stringify(R,null,1));
 console.log(JSON.stringify(R,null,1).slice(0,12000));
})().catch(e=>{console.error(e);process.exit(1);});
