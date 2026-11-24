'use strict';
// Release 15b group 2, round 2 (the owner's device-round comments 2, 3, 5 and 8, 24 November 2026): today (the group
// as built, 0d8cebb1…1637) beside the proposal, at phone and laptop size. Scratch only: the proposal is drawn in the
// test browser; no application file is edited.   run.sh round2.cjs <out folder>
// B01 round 2: Lord Moon's and Touch of the Void's buttons take the check buttons' small outlined look; Touch of the
//   Void is named "Keep control (TN 30)"; failure lines lose their "Tell the GM …" sentence.
// B03 round 2: Quick's and Leadership's buttons take the same small outlined look.
const {fs,path,chromium,DENSE,sha,settle,tab,open}=require('./common.cjs');
const out=path.resolve(process.argv[2]||'.');fs.mkdirSync(out,{recursive:true});
const R={sha,when:new Date().toISOString()};
const clone=o=>JSON.parse(JSON.stringify(o));
const pick=(names)=>names.map(n=>{const e=DENSE.disadv.find(x=>x.name===n);return e?clone(e):{name:n,cost:'3',desc:''};});
function fixture(key){const f=clone(DENSE);f.adv=[];f.disadv=[];
 if(key==='r2checks'){f.fields.f_name='G2 round 2 checks';f.disadv=[...pick(['Brash','Lord Moon’s Curse']),{name:'Touch of the Void',cost:'3',desc:''},{name:'Epilepsy',cost:'4',desc:''},...pick(['Lost Love'])];}
 if(key==='r2use'){f.fields.f_name='G2 round 2 use';f.adv=[clone(DENSE.adv.find(x=>x.name==='Leadership')),{name:'Quick',cost:'6',desc:''}];}
 const file=path.join(out,`g2-${key}.l5r.json`);fs.writeFileSync(file,JSON.stringify(f));return {file,name:f.fields.f_name};}
const mode=async(p,m)=>{await p.evaluate(m=>window.__L5R_TEST__.MODES12.set(m),m);await settle(p);};
const press=async(p,phone,loc)=>{await loc.scrollIntoViewIfNeeded();if(phone)await loc.tap();else await loc.click();await settle(p);};
async function shot(p,phone,file,sels,{pad=10,block='start'}={}){
 if(phone){await p.evaluate(([s,block])=>{const e=document.querySelector(s);if(!e)return;e.scrollIntoView({block});let a=e.parentElement;
   while(a&&!(/(auto|scroll)/.test(getComputedStyle(a).overflowY)&&a.scrollHeight>a.clientHeight))a=a.parentElement;(a||document.scrollingElement).scrollTop-=12;},[sels[0],block]);
  await settle(p);await p.screenshot({path:path.join(out,file)});return;}
 const box=await p.evaluate(([sels,pad,block])=>{const els=sels.map(s=>document.querySelector(s)).filter(Boolean);els[0].scrollIntoView({block});
  const rs=els.map(e=>e.getBoundingClientRect());const x=Math.max(0,Math.min(...rs.map(r=>r.left))-pad),y=Math.max(0,Math.min(...rs.map(r=>r.top))-pad);
  return{x,y,width:Math.min(innerWidth-x,Math.max(...rs.map(r=>r.right))+pad-x),height:Math.min(innerHeight-y,Math.max(...rs.map(r=>r.bottom))+pad-y)};},[sels,pad,block]);
 await settle(p);await p.screenshot({path:path.join(out,file),clip:box});}
// The proposal, in the test browser.
async function propose(p){await p.evaluate(()=>{
 const st=document.createElement('style');
 // Lord Moon's button: the check buttons' size (Feature 4.5.31's .chk4531-btn), not A07's 44 px minimum.
 st.textContent='html body #disadvList button.ghost.lm7-roll{min-width:28px;min-height:0;padding:3px 8px;font-size:.78rem;line-height:1;}';
 document.head.appendChild(st);
 const T=window.__L5R_TEST__,V=T.VI4533,lines=V.lines;
 V.lines=function(key){const o=lines.apply(this,arguments);const b=o&&o[0];
  if(b&&b.tagName==='BUTTON'){b.classList.add('ghost');
   if(key==='touch of the void'){b.textContent='Keep control (TN 30)';b.setAttribute('aria-label','Keep control (TN 30): Touch of the Void, Willpower roll after you spend a Void Point');}}
  return o;};
 const strip=t=>t.replace(/\s*Tell the GM[:;—–-][^.]*\./,'').replace(/\s{2,}/g,' ').trim();
 const fix=()=>document.querySelectorAll('#rollResultNote').forEach(n=>{const s=strip(n.textContent);if(s!==n.textContent)n.textContent=s;});
 new MutationObserver(fix).observe(document.getElementById('rollModalOverlay'),{subtree:true,childList:true,characterData:true});
 T.recalcAll();});}
async function rollFrom(p,phone,loc,v){await p.evaluate(v=>{Math.random=()=>v;},v);await press(p,phone,loc);
 if(await p.evaluate(()=>{const o=document.getElementById('rollPreviewOverlay');return !!o&&getComputedStyle(o).display!=='none';}))await press(p,phone,p.locator('#rollPreviewGo'));
 await p.waitForSelector('#rollDiceRow .roll-die');await settle(p);
 return {title:await p.locator('#rollModalTitle').textContent(),note:await p.locator('#rollResultNote').textContent()};}
const buttons=p=>p.evaluate(()=>[...document.querySelectorAll('#advList .entry, #disadvList .entry')].map(d=>({entry:d.querySelector('.en-name').value,
 buttons:[...d.querySelectorAll('button.chk4531-btn, button.lm7-roll, button.vi4533-btn')].filter(b=>b.offsetParent).map(b=>{const r=b.getBoundingClientRect(),s=getComputedStyle(b);
  return {text:b.textContent,cls:b.className,w:Math.round(r.width),h:Math.round(r.height),bg:s.backgroundColor,color:s.color,font:s.fontSize};})})).filter(x=>x.buttons.length));
(async()=>{const b=await chromium.launch();
 for(const [dev,phone] of [['phone',true],['laptop',false]]){R[dev]={};
  for(const state of ['today','proposed']){const r=R[dev][state]={};
   // Checks: Brash, Lord Moon's Curse, Touch of the Void, Epilepsy, Lost Love (Play).
   {const fx=fixture('r2checks');const {c,p}=await open(b,phone,fx.file,fx.name);await mode(p,'play');if(state==='proposed')await propose(p);await tab(p,'Adv & Disadv');
    r.checks=await buttons(p);await shot(p,phone,`r2-checks-${dev}-${state}.png`,['#disadvList .entry','#disadvList .entry:nth-child(5)']);
    if(phone){r.brashFail=await rollFrom(p,phone,p.locator('#disadvList button.chk4531-btn').first(),0.05);await shot(p,phone,`r2-fail-brash-phone-${state}.png`,['#rollModalOverlay > *'],{block:'center'});
     await press(p,phone,p.locator('#rollModalClose'));
     r.touchFail=await rollFrom(p,phone,p.locator('#disadvList button.vi4533-btn').first(),0.05);await shot(p,phone,`r2-fail-touch-phone-${state}.png`,['#rollModalOverlay > *'],{block:'center'});
     await press(p,phone,p.locator('#rollModalClose'));}
    r.checkErrors=p.errors;await c.close();}
   // Use: Quick and Leadership (Play, out of combat).
   {const fx=fixture('r2use');const {c,p}=await open(b,phone,fx.file,fx.name);await mode(p,'play');if(state==='proposed')await propose(p);await tab(p,'Adv & Disadv');
    r.use=await buttons(p);await shot(p,phone,`r2-use-${dev}-${state}.png`,['#advList .entry','#advList .entry:nth-child(2)']);
    r.useErrors=p.errors;await c.close();}
  }}
 await b.close();fs.writeFileSync(path.join(out,'round2.json'),JSON.stringify(R,null,1));console.log('done',sha);})().catch(e=>{console.error(e);process.exit(1);});
