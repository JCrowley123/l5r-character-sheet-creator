'use strict';
// B18 mock-ups: the owner's rulings of 24 November 2026, drawn inside the test browser on the live sheet. Scratch only:
// no application file is edited. One engine rewrites a control's visible words, its spoken name (aria-label) or its
// glyph whenever the sheet draws or redraws it (a MutationObserver over the page), and only where today's words are
// found exactly, so a control the rule does not recognise is left as it is. install(page, groups) turns on the listed
// groups ('G01' ... 'G16'; 'G03-delete' is G03's other option, "Delete for everything").
const ENGINE=function(groups){
 const on=new Set(groups);
 if(window.__B18)return window.__B18.set(on);
 const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
 // The name of the entry, row or card a control sits on.
 const entryName=el=>{
  const d=el.closest('.entry');if(d){const n=d.querySelector('.en-name');if(n&&norm(n.value))return norm(n.value);}
  const tr=el.closest('tr');
  if(tr){for(const s of ['.sk-name','.wp-name','.eq-name','input[type="text"]','input:not([type])']){const n=tr.querySelector(s);if(n&&norm(n.value))return norm(n.value);}
   const td=tr.querySelector('td');if(td&&norm(td.textContent))return norm(td.textContent);}
  return '';
 };
 const titleOf=el=>{const o=el.closest('.roll-modal-overlay');const h=o&&o.querySelector('h3');return h?norm(h.textContent):'';};
 const R=[];
 const rule=(g,sel,fn)=>R.push({g,sel,fn});
 const words=(el)=>norm(el.textContent);
 // ---- G01 Reset ----
 const resetSpoken=n=>'Reset '+n+' for a new session';
 rule('G01','button',el=>{if(words(el)!=='Reset session')return null;
  if(el.classList.contains('anc48-session-reset')){const a=document.querySelector('#anc48Name,.anc48-name');const n=a?norm(a.textContent):'';return {text:'Reset',aria:resetSpoken((n?n+'’s':'the Ancestor’s')+' gift')};}
  const n=entryName(el);return {text:'Reset',aria:resetSpoken(n||'this ability')};});
 rule('G01','#btnResetRounds',el=>({aria:'Reset the round counter'}));
 // ---- G02 Change ----
 rule('G02','.adv-config-btn',el=>{const w=words(el),n=entryName(el);if(!n)return null;const a=el.getAttribute('aria-label')||'';
  if(w==='Change'&&!/^Change /.test(a))return {aria:'Change '+n};
  if(w==='Choose…'&&!/^Choose /.test(a))return {aria:'Choose '+n};return null;});
 rule('G02','button',el=>words(el)==='Choose again'?{text:'Change'}:null);
 // ---- G03 Remove (and its other option, Delete for everything) ----
 const removeVerb=()=>on.has('G03-delete')?'Delete':'Remove';
 rule('G03','.rm-btn,.emph-item-del',el=>{if(el.closest('.roll-modal-overlay'))return null;if(!/^[✕×]$/.test(words(el)))return null;
  let n='';if(el.classList.contains('emph-item-del')){const it=el.closest('.emph-item,li,span');n=it?norm(it.textContent.replace(/[✕×]/g,'')):'';n=n?'Emphasis '+n:'Emphasis';}
  else n=entryName(el);return {aria:removeVerb()+' '+(n||'this entry')};});
 rule('G03','.court4514-remove,.cw1121-remove',el=>on.has('G03-delete')&&words(el)==='Remove'?{text:'Delete',aria:(el.getAttribute('aria-label')||'').replace(/^Remove/,'Delete')||null}:null);
 // ---- G04 the corner ✕: Close (shows you something) or Cancel (holds a choice not yet kept) ----
 const CLOSE=['manualRollPromptClose','rollModalClose','skillInfoClose','untrainedSkillsClose','stanceInfoClose','castWhyX','spellScrollsX','arrowsPickerClose','voidInfoClose','woundInfoClose'];
 const CANCEL=['rollPreviewClose','advConfigX','universalSpellPickX','handPickClose','arrowPickClose','rangePickClose','affinityPickX','deficiencyPickX'];
 rule('G04','.roll-modal-overlay .rm-btn',el=>{const id=el.id,t=titleOf(el);
  if(id==='appConfirmX'){const c=document.getElementById('appConfirmCancel');const question=c&&getComputedStyle(c).display!=='none';return {aria:question?'Cancel question':'Close notice'};}
  const info=(id==='skillInfoClose'||id==='stanceInfoClose');
  if(CLOSE.includes(id))return {aria:'Close '+(t?t+(info?' information':''):'window')};
  if(CANCEL.includes(id))return {aria:'Cancel '+(t||'window')};return null;});
 // ---- G05 the buttons at a window's foot ----
 rule('G05','#appConfirmOk',el=>words(el)==='Got it'?{text:'OK'}:words(el)==='Yes'?{text:'Confirm'}:null);
 rule('G05','#appConfirmCancel',el=>words(el)==='No'?{text:'Cancel'}:null);
 // ---- G06 Use ----
 rule('G06','button',el=>{if(words(el)!=='Use it now')return null;const s=document.querySelector('.anc48-session-state');const what=s?norm(s.textContent).split(':')[0]:'';
  const a=document.querySelector('.anc48-name');return {text:'Use',aria:'Use '+(what||((a?norm(a.textContent):'the Ancestor')+'’s gift'))};});
 rule('G06','.dsx4532-btn',el=>{if(words(el)!=='Use')return null;const a=el.getAttribute('aria-label')||'';if(/^Use /.test(a))return null;const m=/^([^:]+):\s*(.*)$/.exec(a);return m?{aria:'Use '+m[1]+': '+m[2]}:null;});
 // ---- G07 Spend Void: the one window button that still reads "Spend a Void Point" ----
 rule('G07','#appConfirmOk,#appConfirmCancel',el=>words(el)==='Spend a Void Point'?{text:'Spend Void'}:null);
 // ---- G08 Reroll with {source} ----
 rule('G08','button',el=>{const w=words(el);let m;
  if(w==='Re-roll 1s')return {text:'Reroll 1s'};
  if(w==='Re-roll selected')return {text:'Reroll selected'};
  if((m=/^Spend Luck \((\d+)\/(\d+)\)$/.exec(w)))return {text:'Reroll with Luck ('+m[1]+'/'+m[2]+')',aria:'Reroll with Luck: roll the whole roll again and keep the higher result, '+m[1]+' of '+m[2]+' left'};
  if((m=/^Re-roll with Kakita (.*)$/.exec(w)))return {text:'Reroll with Kakita '+m[1]};
  if((m=/^Spend Toku’s Luck (.*)$/.exec(w)))return {text:'Reroll with Toku’s Luck '+m[1]};
  return null;});
 // ---- G09 Clear: the dice tray's two buttons say what they clear ----
 rule('G09','#dicePickerClear',el=>({aria:'Clear the dice'}));
 rule('G09','#otherDiceClear',el=>({aria:'Clear the other dice'}));
 // ---- G10 + Add {thing} ----
 rule('G10','button',el=>{const w=words(el);
  if(w==='+ Emph'){const n=entryName(el);return {text:'+ Add Emphasis',aria:'Add Emphasis'+(n?' to '+n:'')};}
  if(w==='+Book')return {text:'+ Add Book',aria:'Add Book'};
  if(w==='Add court'&&el.classList.contains('court4514-add'))return {text:'+ Add court'};
  return null;});
 // ---- G11 Touch of the Void's button, as the ruling read it ----
 rule('G11','button',el=>words(el)==='Keep control (TN 30)'?{text:'Check (TN 30)',aria:'Check (TN 30): Touch of the Void, Willpower roll after you spend a Void Point'}:null);
 // ---- G12 the i, read aloud as "{thing} information" ----
 rule('G12','#anc48Info',el=>({aria:'Ancestors information'}));
 rule('G12','.adv-config-info,.sk-info-btn,.wp15-info,.at15-info,button',el=>{const a=el.getAttribute('aria-label')||'';let m;
  if((m=/^Explain:\s*(.+)$/.exec(a)))return {aria:m[1]+' information'};
  if((m=/^(.+?): how it is worked out$/.exec(a)))return {aria:m[1]+' information'};
  return null;});
 rule('G12','#combatTnInfoBtn',el=>({aria:'TN & Initiative information',cls:'b18-i'}));
 rule('G12','#combatAttackInfoBtn',el=>({aria:'Attack & Damage information',cls:'b18-i'}));
 rule('G12','.wp-info-btn',el=>{const n=entryName(el);return {aria:(n||'Weapon')+' information',cls:'b18-i'};});
 rule('G12','.stance-info-btn',el=>{const a=el.getAttribute('aria-label')||'';const m=/^(.+) stance rules$/.exec(a);return {aria:m?m[1]+' stance information':a,cls:'b18-i'};});
 // ---- G14 Increase / Decrease {thing} ----
 rule('G14','button',el=>{const a=el.getAttribute('aria-label')||'',w=words(el);let m;
  if(!/^[−+\-]$/.test(w))return null;
  if((m=/^Add (.+) points$/.exec(a)))return {aria:'Increase '+m[1]+' points'};
  if((m=/^Subtract (.+) points$/.exec(a)))return {aria:'Decrease '+m[1]+' points'};
  if((m=/^One more (.+)$/.exec(a)))return {aria:'Increase '+m[1]};
  if((m=/^One fewer (.+)$/.exec(a)))return {aria:'Decrease '+m[1]};
  if((m=/^Raise (.+)$/.exec(a)))return {aria:'Increase '+m[1]};
  if((m=/^Lower (.+)$/.exec(a)))return {aria:'Decrease '+m[1]};
  if((m=/^Gain one (.+) point$/.exec(a)))return {aria:'Increase '+m[1]+' points by one'};
  if((m=/^Lose one (.+) point$/.exec(a)))return {aria:'Decrease '+m[1]+' points by one'};
  if(!a&&el.classList.contains('stepbtn')&&el.dataset.ring){const ring=el.dataset.ring.charAt(0).toUpperCase()+el.dataset.ring.slice(1);
   return {aria:(w==='+'?'Increase ':'Decrease ')+ring+' Ring'};}
  return null;});
 // ---- G16 Export PDF ----
 rule('G16','.pdf111-export',el=>words(el)==='Export to PDF'?{text:'Export PDF'}:null);

 // The ring i of Release 15a A04, for the Combat tab's three glyphs (G12).
 const css=document.createElement('style');css.id='b18-mock-css';
 css.textContent='@media screen{html body .b18-i{position:relative;display:inline-flex;flex:0 0 auto;align-items:center;justify-content:center;align-self:center;box-sizing:border-box;width:28px;min-width:28px;max-width:28px;height:28px;min-height:28px;max-height:28px;padding:0;border:1px solid currentColor;border-radius:50%;background:transparent;color:var(--ink);font-family:Georgia,serif;font-size:0!important;line-height:1;text-transform:none;letter-spacing:normal;vertical-align:middle;cursor:pointer}html body .b18-i::after{content:"i";font-family:Georgia,serif;font-size:17px;font-style:normal;font-weight:400}html body .b18-i::before{content:"";position:absolute;inset:-8px}}';
 document.head.appendChild(css);
 const st={on,changed:new Map()};
 const apply=()=>{
  for(const r of R){if(!st.on.has(r.g))continue;
   for(const el of document.querySelectorAll(r.sel)){
    let ch=null;try{ch=r.fn(el);}catch(e){ch=null;}
    if(!ch)continue;
    if(ch.text!=null&&el.textContent!==ch.text)el.textContent=ch.text;
    if(ch.aria&&el.getAttribute('aria-label')!==ch.aria)el.setAttribute('aria-label',ch.aria);
    if(ch.cls&&!el.classList.contains(ch.cls))el.classList.add(ch.cls);
    el.dataset.b18=r.g;
   }
  }
 };
 let busy=false;
 const mo=new MutationObserver(()=>{if(busy)return;busy=true;try{apply();}finally{busy=false;}});
 mo.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['style','class']});
 window.__B18={set(o){st.on=o;apply();return true;},apply};
 apply();
 return true;
};
async function install(p,groups){await p.evaluate(`(${ENGINE.toString()})(${JSON.stringify(groups)})`);await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
const ALL=['G01','G02','G03','G04','G05','G06','G07','G08','G09','G10','G11','G12','G14','G16'];
module.exports={install,ALL};
