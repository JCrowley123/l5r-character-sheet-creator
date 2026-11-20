'use strict';
// Group 1 of Release 15b: the four scratch proposals, drawn inside the test browser from the sheet's own values
// (WND4529, CP4525, DSX4532, CHK4531, TR4524 on window.__L5R_TEST__). Nothing is saved and no number is recomputed:
// each proposal rewords or regroups what the sheet already shows. One pattern for the group: the figure first, then
// its arithmetic from current values; the reasons and page references behind the standard i (A04).
const settle=p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));

// Shared in-page helpers: the A04 i (class sk-info-btn draws the 28 px ring), a guarded observer, the breakdown table.
async function helpers(p){
 await p.evaluate(()=>{
  if(window.__g1)return;
  const css=document.createElement('style');css.id='g1MockStyle';css.textContent=`
   .g1-i{margin-left:8px;vertical-align:middle}
   #qaWoundsValue,#qaArmorTNValue{display:inline}
   #bl4534QaNote{display:none}
   .g1-bd{border-collapse:collapse;width:100%;margin:2px 0 12px;font-variant-numeric:tabular-nums}
   .g1-bd td{padding:5px 0;border-bottom:1px solid rgba(0,0,0,.12);vertical-align:top}
   .g1-bd td:last-child{text-align:right;white-space:nowrap;padding-left:16px;font-weight:600}
   .g1-bd tr.g1-total td{border-bottom:0;border-top:2px solid currentColor;font-weight:700}
   .g1-bd small{display:block;opacity:.75;font-size:.82em}
   .g1-price{display:flex;align-items:center;margin:6px 0 2px;font-size:.92em}
   .g1-rule{margin:0}`;
  document.head.appendChild(css);
  const mkI=(id,label,fn)=>{const b=document.createElement('button');b.type='button';b.className='sk-info-btn g1-i';if(id)b.id=id;
   // No title attribute: Phase 4.5's decorator (R454) adds its own i to any titled element in the Advantage lists.
   b.setAttribute('aria-label',label);b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();fn(e);});return b;};
  const watch=(el,fn,opts)=>{if(!el)return;const mo=new MutationObserver(()=>{mo.disconnect();try{fn();}finally{mo.observe(el,opts);}});mo.observe(el,opts);fn();};
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  // rows: [label, value, small note]; total: [label, value]
  const table=(rows,total)=>'<table class="g1-bd">'+rows.map(r=>`<tr><td>${esc(r[0])}${r[2]?`<small>${esc(r[2])}</small>`:''}</td><td>${esc(r[1])}</td></tr>`).join('')+
   `<tr class="g1-total"><td>${esc(total[0])}</td><td>${esc(total[1])}</td></tr></table>`;
  const info=(title,sub,html)=>{window.__L5R_TEST__.R454.show(title,'');document.getElementById('stanceInfoRing').textContent=sub;
   document.getElementById('stanceInfoBody').innerHTML=html;};
  const signed=n=>(n<0?'−':'+')+Math.abs(n);
  window.__g1={mkI,watch,esc,table,info,signed};
 });
}

// ---------------- A14: one net Wound penalty; its parts behind the i ----------------
// rev (owner, round 1): the preview row keeps today's "−5 to total — Nicked"; only the informational row goes.
async function a14(p,rev=false){
 await helpers(p);
 await p.evaluate(rev=>{
  const T=window.__L5R_TEST__,W=T.WND4529,G=window.__g1,$=id=>document.getElementById(id);
  const strip=s=>String(s||'').replace(/ \([^()]*\)(?= —|$)/,'');   // drops "(Low Pain Threshold +5, Strength of the Earth −3)"
  const PAGE={'Low Pain Threshold':'Disadvantage, Core Rulebook p.160','Strength of the Earth':'Advantage, Core Rulebook p.154'};
  const parts=()=>({size:Math.abs(W.corePenalty()),net:Math.abs(T.getWoundPenalty()),
   adj:W.adjusters().map(a=>({name:a.name,sign:a.change[0]==='+'?'+':'−',amount:a.change.slice(1),page:PAGE[a.name]||''}))});
  const level=()=>strip($('woundSummaryLine').textContent).split(' — ')[0];
  function breakdown(){
   const x=parts();
   return G.table([[level(),'+'+x.size,'Wound Rank penalty']].concat(x.adj.map(a=>[a.name,a.sign+a.amount,a.page])),['TN of all rolls',x.net?'+'+x.net:'none']);
  }
  function showWound(){
   $('woundBar').querySelector('button.current').click();
   const desc=$('woundInfoDesc');const rule=desc.textContent;
   $('woundInfoPen').textContent=strip($('woundInfoPen').textContent);
   desc.innerHTML=(W.adjusters().length?breakdown():'')+'<p class="g1-rule">'+G.esc(rule)+'</p>';
  }
  G.watch($('woundSummaryLine'),()=>{const s=$('woundSummaryLine');const plain=strip(s.textContent);
   if(s.dataset.g1===plain&&s.querySelector('.g1-i'))return;s.textContent=plain;s.dataset.g1=plain;
   s.appendChild(G.mkI('g1WoundInfo','Wound penalty: how it is worked out',showWound));},{childList:true,characterData:true,subtree:true});
  G.watch($('woundBar'),()=>{$('woundBar').querySelectorAll('button').forEach(b=>{const a=strip(b.getAttribute('aria-label'));if(a!==b.getAttribute('aria-label'))b.setAttribute('aria-label',a);});},{childList:true,subtree:true,attributes:true,attributeFilter:['aria-label']});
  G.watch($('woundInfoPen'),()=>{const e=$('woundInfoPen');const t=strip(e.textContent);if(t!==e.textContent)e.textContent=t;},{childList:true,characterData:true,subtree:true});
  // Quick Access mirrors the line; its i opens the same window.
  G.watch($('qaWoundsValue').parentElement,()=>{const e=$('qaWoundsValue');const t=strip(e.textContent);if(t!==e.textContent)e.textContent=t;
   if(!$('g1QaWoundInfo'))e.after(G.mkI('g1QaWoundInfo','Wound penalty: how it is worked out',showWound));},{childList:true,characterData:true,subtree:true});
  // The roll preview: one Wound Penalty row, its arithmetic after the dash; the second, informational row goes.
  G.watch($('rollPreviewBody'),()=>{
   $('rollPreviewBody').querySelectorAll('.rp-mod').forEach(row=>{
    const label=row.querySelector('.rp-mod-label'),txt=row.querySelector('.rp-mod-txt');
    if(!label||label.textContent.trim()!=='Wound Penalty'||!txt)return;
    if(/→/.test(txt.textContent)){row.remove();return;}
    if(rev)return;
    const x=parts();if(!x.adj.length)return;
    const want=txt.textContent.split(' — ')[0]+' — '+level()+' '+x.size+x.adj.map(a=>' '+a.sign+' '+a.name+' '+a.amount).join('');
    if(txt.textContent!==want)txt.textContent=want;});
  },{childList:true,subtree:true,characterData:true});
  T.recalcAll();
 },rev);
 await settle(p);
}

// ---------------- B02: Actual N XP · catalogue M XP, the reason behind the i ----------------
async function b02(p){
 await helpers(p);
 await p.evaluate(()=>{
  const T=window.__L5R_TEST__,G=window.__g1,$=id=>document.getElementById(id);
  const PAGE={large:151};   // scratch: the build reads the page from Feature 4.5.25's price table
  const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
  function apply(){
   document.querySelectorAll('#advList .entry, #disadvList .entry').forEach(div=>{
    const name=div.querySelector('.en-name')?.value||'',cost=Number(div.querySelector('.en-cost')?.value);
    const steps=[];let catalogue=null;
    const cp=div.dataset.cp4525?JSON.parse(div.dataset.cp4525):null,note=div.querySelector(':scope > .cp4525-note');
    const m=note&&/catalogue (\d+)\)/.exec(note.textContent);
    if(cp&&cp.b&&m){catalogue=Number(m[1]);steps.push([cap(cp.b)+' price',G.signed(cp.v-catalogue),'Core Rulebook p.'+(PAGE[cp.n]||'')]);note.hidden=true;}
    const bb=div.dataset.dsx4532?JSON.parse(div.dataset.dsx4532):null;
    if(bb){if(catalogue==null)catalogue=bb.base;
     steps.push(['Blissful Betrothal',G.signed(bb.applied-bb.base),(name==='Kharmic Tie'?'Your Tie is to your spouse: ':'')+'2 less, never below 1. Core Rulebook p.146']);}
    let line=div.querySelector(':scope > .g1-price');
    if(catalogue==null||catalogue===cost||!Number.isFinite(cost)){if(line)line.remove();return;}
    const text=`Actual ${cost} XP · catalogue ${catalogue} XP`;
    if(!line){line=document.createElement('div');line.className='g1-price';const top=div.querySelector('.entry-top');(top||div.firstElementChild).after(line);}
    if(line.dataset.t===text)return;line.dataset.t=text;line.textContent=text;
    const i=G.mkI(null,`Why ${name} costs ${cost} XP`,()=>G.info(name,text,G.table([['Catalogue price',catalogue+' XP','']].concat(steps),['Actual price',cost+' XP'])));
    i.classList.add('g1-price-i');line.appendChild(i);
   });
  }
  const opts={childList:true,subtree:true,attributes:true,attributeFilter:['data-cp4525','data-dsx4532']};
  G.watch($('advList'),apply,opts);G.watch($('disadvList'),apply,opts);
  T.recalcAll();
 });
 await settle(p);
}

// ---------------- B04: Armor TN with an i; Blind's line under it goes ----------------
async function b04(p){
 await helpers(p);
 await p.evaluate(()=>{
  const T=window.__L5R_TEST__,G=window.__g1,$=id=>document.getElementById(id);
  function breakdown(){
   const base=Number($('f_baseTN').value),current=Number($('f_currentTN').value),armor=Number($('f_armorTN').value)||0;
   const reflexes=Number($('trait_reflexes').value),blind=!!(T.CHK4531&&T.CHK4531.has('Blind'));
   const rows=[[blind?`Base: Blind, Reflexes ${reflexes} + 5`:`Base: Reflexes ${reflexes} × 5 + 5`,String(base),blind?'Blind: Reflexes + 5 instead of Reflexes × 5 + 5. Core Rulebook p.156':''],
    ['Armor TN Bonus'+($('f_armorName').value?' ('+$('f_armorName').value+')':''),G.signed(armor),'']];
   const rest=current-base-armor;if(rest)rows.push(['Stance, Void and other bonuses',G.signed(rest),'']);
   return {current,html:G.table(rows,['Armor TN',String(current)])};
  }
  function show(){const x=breakdown();G.info('Armor TN',x.current+' to be hit',x.html);}
  G.watch($('qaArmorTNValue').parentElement,()=>{if(!$('g1ArmorInfo'))$('qaArmorTNValue').after(G.mkI('g1ArmorInfo','Armor TN: how it is worked out',show));},{childList:true});
  // The Combat card's own ⓘ (TN & Initiative formula): the same breakdown above its formula text.
  G.watch($('stanceInfoOverlay'),()=>{const body=$('stanceInfoBody');
   if($('stanceInfoTitle').textContent!=='TN & Initiative'||body.querySelector('.g1-bd'))return;
   const formula=body.textContent;body.innerHTML=breakdown().html+'<p class="g1-rule">'+G.esc(formula)+'</p>';},{attributes:true,attributeFilter:['style'],childList:true,subtree:true});
  T.recalcAll();
 });
 await settle(p);
}

// ---------------- B14: the total, then Taint Rank × 2 (Lost) ----------------
async function b14(p){
 await helpers(p);
 await p.evaluate(()=>{
  const T=window.__L5R_TEST__,G=window.__g1,$=id=>document.getElementById(id);
  const calc=()=>{const t=T.TR4524.taint();const row=[...document.querySelectorAll('#advList .entry')].find(d=>/Touch of the Spirit Realms/.test(d.querySelector('.en-name').value));
   const cfg=row&&row.dataset.advConfig?JSON.parse(row.dataset.advConfig):{};const lost=!!cfg.lost;return {t,lost,total:t*(lost?2:1)};};
  const arith=c=>'Taint Rank '+c.t+(c.lost?' × 2 (Lost)':'');
  G.watch($('rollPreviewBody'),()=>{$('rollPreviewBody').querySelectorAll('.rp-mod').forEach(row=>{
   const label=row.querySelector('.rp-mod-label'),txt=row.querySelector('.rp-mod-txt');
   if(!label||label.textContent.trim()!=='Touch of the Spirit Realms (Jigoku)'||!txt)return;
   const c=calc(),want='+'+c.total+' to total — '+arith(c);if(txt.textContent!==want)txt.textContent=want;});},{childList:true,subtree:true,characterData:true});
  G.watch($('advList'),()=>{document.querySelectorAll('#advList .tr4524-note').forEach(n=>{
   if(!/^Adding /.test(n.textContent))return;const c=calc(),want='Adding +'+c.total+' — '+arith(c)+'.';if(n.textContent!==want)n.textContent=want;});},{childList:true,subtree:true,characterData:true});
  T.recalcAll();
 });
 await settle(p);
}
// ---------------- Kharmic Tie (owner, round 1): one badge, the pips, Reset, Change, one i ----------------
// The person and the Rank once, in the badge; the "Target: … uses remaining" line goes (the pips say it); the badge's
// and Reset's titles go, so Phase 4.54 adds no i; one i at the end holds the rule and the state in words.
async function kt(p){
 await helpers(p);
 await p.evaluate(()=>{
  const T=window.__L5R_TEST__,G=window.__g1,$=id=>document.getElementById(id);
  const css=document.createElement('style');css.textContent=`
   .entry.g1-kt .adv-config-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px}
   .entry.g1-kt .adv-config-summary{display:none}
   .entry.g1-kt .adv-config-badge{order:1;margin:0}
   .entry.g1-kt .adv-config-kharmic-controls{order:2;display:inline-flex;align-items:center;gap:12px;margin:0}
   .entry.g1-kt .g1-kt-end{order:3;display:inline-flex;align-items:center;gap:10px;margin-left:auto}
   .entry.g1-kt .g1-kt-end .g1-i{margin-left:0}
   .entry.g1-kt .adv-config-pips{letter-spacing:2px;font-size:1.05em}`;
  document.head.appendChild(css);
  function show(div){
   const c=JSON.parse(div.dataset.advConfig||'{}'),who=G.esc(c.target||''),rank=c.rank||0,left=c.remaining??rank;
   const manage=document.body.classList.contains('pm12-management')||!div.querySelector('.adv-config-btn[data-pm12-locked]');
   G.info('Kharmic Tie',`Rank ${rank} · tied to ${c.target||''}`,
    `<p class="g1-rule">Before a weapon attack roll, declare that you are fighting for or protecting ${who}: +1k1 to that roll. Once per session for each Rank.</p>`+
    `<table class="g1-bd"><tr><td>Each use</td><td>+1k1</td></tr><tr><td>Uses left this session</td><td>${left} of ${rank}</td></tr></table>`+
    `<p class="g1-rule">An attack's roll preview offers the Tie while a use is left; nothing is spent until you roll. <b>Reset session</b> gives back all ${rank} at the start of a session.`+
    (manage?` <b>Change</b> picks another person or Rank; the Rank sets the cost.`:'')+`</p>`);
  }
  function apply(){
   document.querySelectorAll('#advList .entry').forEach(div=>{
    if(div.querySelector('.en-name')?.value!=='Kharmic Tie')return;
    const row=div.querySelector('.adv-config-row');if(!row)return;
    const c=JSON.parse(div.dataset.advConfig||'{}');div.classList.add('g1-kt');
    row.querySelectorAll('.adv-config-info').forEach(b=>b.remove());
    const badge=row.querySelector('.adv-config-badge'),reset=row.querySelector('.adv-config-reset-session'),change=row.querySelector('.adv-config-btn');
    if(badge){badge.removeAttribute('title');const t=`${c.target} · Rank ${c.rank}`;if(badge.textContent!==t)badge.textContent=t;}
    if(reset){reset.removeAttribute('title');reset.setAttribute('aria-label',`Reset session: all ${c.rank} Kharmic Tie uses back`);}
    if(change){change.removeAttribute('title');change.setAttribute('aria-label','Change Kharmic Tie: person or Rank');}
    let end=row.querySelector('.g1-kt-end');
    if(!end){end=document.createElement('span');end.className='g1-kt-end';row.appendChild(end);}
    if(change&&change.parentElement!==end)end.appendChild(change);
    if(!end.querySelector('.g1-i')){const i=G.mkI(null,'Kharmic Tie information',()=>show(div));i.classList.add('g1-kt-i');end.appendChild(i);}
   });
  }
  G.watch($('advList'),apply,{childList:true,subtree:true,attributes:true,attributeFilter:['data-adv-config','title']});
  T.recalcAll();
 });
 await settle(p);
}
module.exports={a14,b02,b04,b14,kt};
