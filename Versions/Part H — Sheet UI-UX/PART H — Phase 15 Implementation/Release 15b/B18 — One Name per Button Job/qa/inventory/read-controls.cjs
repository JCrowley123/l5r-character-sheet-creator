'use strict';
// B18 stage 1: reads every button and button-like control that is on screen right now, with its visible label, its spoken
// name, its title, and where it sits (page, window, card). Read-only: it clicks nothing and changes nothing.
// Used as: const recs = await readControls(page, {state:'laptop/manage/Skills'}).
const READ=function(opts){
 const IGNORE_STATE=/^(active|current|open|opened|hidden|on|off|selected|checked|disabled|is-[\w-]+|focus|focused|hover|pressed|used|empty|full|ip15-on|show|visible)$/;
 const sel='button,[role="button"],summary,a[href],input[type="button"],input[type="submit"],input[type="reset"]';
 const norm=s=>(s||'').replace(/\s+/g,' ').trim();
 const clsSig=el=>[...el.classList].filter(c=>!IGNORE_STATE.test(c)).sort().join('.');
 const vis=el=>{if(!el.checkVisibility({visibilityProperty:true}))return false;const r=el.getBoundingClientRect();return r.width>0&&r.height>0;};
 // Carousel page the element sits in, and whether that page is the one on screen.
 const tabs=(window.__L5R_CAROUSEL__&&window.__L5R_CAROUSEL__.getTabs&&window.__L5R_CAROUSEL__.getTabs())||[];
 const active=(window.__L5R_CAROUSEL__&&window.__L5R_CAROUSEL__.getActiveTab&&window.__L5R_CAROUSEL__.getActiveTab())||null;
 const pageOf=el=>{for(const t of tabs){if(t.panel&&t.panel.contains(el))return t;}return null;};
 const WIN='.roll-modal-overlay,.cl11-view,.s14-page,.l13-root,#quickAccessPanel,.pm128-menu,[role="dialog"],[aria-modal="true"],.app-search-view,.search-view,.lib-view,.library-view';
 const winTitle=w=>{if(!w)return '';const h=w.querySelector('h1,h2,h3,[id$="Title"],[class*="title"]');return norm(h&&h.textContent).slice(0,60);};
 const cardOf=el=>{
  const c=el.closest('.entry,.adv-config-card,.card,fieldset,details,tr,li,section,.ring-card,.trait-card,.anc48-card,.rp-mod,.kt-row');
  if(!c)return '';
  let h=c.querySelector(':scope > legend, :scope > summary, :scope > h2, :scope > h3, :scope > h4, :scope > .card-title, :scope .en-name');
  let t=h?(h.value!==undefined&&h.value!==''?h.value:h.textContent):'';
  if(!t&&c.tagName==='TR'){const first=c.querySelector('td,th');t=first?first.textContent:'';}
  return (c.tagName.toLowerCase()+(c.id?'#'+c.id:'')+': '+norm(t)).slice(0,90);
 };
 const hiddenSize=el=>getComputedStyle(el).fontSize==='0px';
 const pseudo=el=>{for(const w of ['::before','::after']){const c=getComputedStyle(el,w).content;if(c&&c!=='none'&&c!=='normal'&&c!=='""'){return c.replace(/^["']|["']$/g,'');}}return '';};
 const accNode=n=>{
  if(n.nodeType===3)return n.nodeValue;
  if(n.nodeType!==1)return '';
  if(n.getAttribute('aria-hidden')==='true')return '';
  const al=n.getAttribute('aria-label');if(al&&al.trim())return ' '+al+' ';
  if(n.tagName==='IMG')return n.getAttribute('alt')||'';
  if(n.tagName==='INPUT'||n.tagName==='TEXTAREA')return n.value||'';
  return [...n.childNodes].map(accNode).join('');
 };
 const spokenOf=el=>{
  const lb=el.getAttribute('aria-labelledby');
  if(lb){const t=norm(lb.split(/\s+/).map(i=>document.getElementById(i)).filter(Boolean).map(e=>e.textContent).join(' '));if(t)return {name:t,src:'aria-labelledby'};}
  const al=el.getAttribute('aria-label');if(al&&norm(al))return {name:norm(al),src:'aria-label'};
  let t=norm([...el.childNodes].map(accNode).join(''));
  if(el.tagName==='INPUT')t=norm(el.value);
  if(t)return {name:t,src:'content'};
  const ti=el.getAttribute('title');if(ti&&norm(ti))return {name:norm(ti),src:'title'};
  return {name:'',src:'none'};
 };
 const out=[];const seen=new Set();
 const push=(el,kind)=>{
  if(seen.has(el))return;seen.add(el);
  if(opts.within&&!el.closest(opts.within))return;
  const inOverlay=!!el.closest(WIN);
  const visible=vis(el);
  if(!visible&&!opts.includeHidden)return;
  const page=pageOf(el);
  if(!page&&el.closest('.car-page'))return;   // a carousel clone of a page (no ids, drawn off screen): not a second control
  if(page&&opts.onlyActivePage&&active&&page.label!==active.label)return;
  const r=el.getBoundingClientRect();
  const w=el.closest(WIN);
  let label=hiddenSize(el)?'':norm(el.textContent);
  let labelSrc='text';
  if(!label){const ps=pseudo(el);if(ps){label=ps;labelSrc='glyph';}else if(el.querySelector('svg,img')){label='(icon)';labelSrc='icon';}else{labelSrc='none';}}
  if(el.tagName==='INPUT'&&!label){label=norm(el.value);}
  const sp=spokenOf(el);
  const fixed=(()=>{for(let n=el;n&&n!==document.body;n=n.parentElement){if(getComputedStyle(n).position==='fixed')return true;}return false;})();
  out.push({
   kind,tag:el.tagName.toLowerCase(),id:el.id||'',cls:clsSig(el),
   label,labelSrc,aria:el.getAttribute('aria-label')||'',title:el.getAttribute('title')||'',
   spoken:sp.name,spokenSrc:sp.src,
   pressed:el.getAttribute('aria-pressed')||el.getAttribute('aria-expanded')||'',
   disabled:!!el.disabled||el.getAttribute('aria-disabled')==='true',
   page:page?page.label:'',win:w?(w.id||w.className.toString().split(' ')[0]):'',winTitle:winTitle(w),
   card:cardOf(el),inDetails:!!el.closest('details'),fixed,
   w:Math.round(r.width),h:Math.round(r.height),visible,inOverlay
  });
 };
 for(const el of document.querySelectorAll(sel))push(el,el.tagName==='SUMMARY'?'summary':el.tagName==='A'?'link':el.getAttribute('role')==='button'?'role-button':'button');
 // Chips and other clickable things that are not buttons: a pointer cursor on something that is not a form field.
 if(opts.clickables!==false){
  for(const el of document.querySelectorAll('div,span,li,td,th,img,svg,label,p,i,b')){
   if(seen.has(el))continue;
   if(el.closest('button,summary,a,select,textarea'))continue;
   if(getComputedStyle(el).cursor!=='pointer')continue;
   if(el.tagName==='LABEL'&&el.control&&el.control.tagName!=='INPUT')continue;
   // Skip a wrapper whose own child already carries the pointer (take the innermost element).
   if([...el.children].some(ch=>getComputedStyle(ch).cursor==='pointer'&&vis(ch)))continue;
   push(el,'clickable');
  }
 }
 return out;
};
async function readControls(p,opts={}){
 if(opts.openDetails){await p.evaluate(()=>{for(const d of document.querySelectorAll('details'))if(!d.closest('.roll-modal-overlay'))d.open=true;});}
 return p.evaluate(`(${READ.toString()})(${JSON.stringify(opts)})`);
}
module.exports={readControls};
