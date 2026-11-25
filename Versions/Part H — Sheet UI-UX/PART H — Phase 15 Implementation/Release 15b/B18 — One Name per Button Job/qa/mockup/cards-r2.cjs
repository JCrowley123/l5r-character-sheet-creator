'use strict';
// B18 mock-ups, round 2: the two looks the owner asked for on the Reset card (25 November 2026). For each place the live
// sheet is opened twice, both times with the round-1 words the owner approved (proposals.cjs: G01 Reset, G06 Use, G12):
// "now" as that, "after" with one round-2 look added (proposals-r2.cjs). The button is outlined and a close-up is cut
// around it, as round 1's cards.cjs does. Scratch only: no application file is edited.
// Usage: run.sh cards-r2.cjs <out folder>   (ONLY=size,iright to choose)
const C=require('./common.cjs');const {fs,path,chromium,sha,settle,tab,mode,wait}=C;
const F=require('./fixtures.cjs');const P=require('./proposals.cjs');const P2=require('./proposals-r2.cjs');
const out=path.resolve(process.argv[2]);fs.mkdirSync(out,{recursive:true});
const R={source_sha256:sha,captured_utc:new Date().toISOString(),cards:{},errors:[]};
const openDetails=ids=>async p=>{await p.evaluate(ids=>ids.forEach(i=>{const d=document.getElementById(i);if(d)d.open=true;}),ids);};
const WORDS=['G01','G06','G12'];
// The laptop picture at twice the pixels, so it stays sharp when the board scales it to a phone's width.
C.LAPTOP.deviceScaleFactor=2;
const pl=(name,o)=>Object.assign({name,mode:'play',fixture:'sessions',device:'phone'},o);
const CARDS=[
 {id:'size',look:'SIZE',places:[
  pl('Kharmic Tie',{fixture:'resets',tab:'Adv & Disadv',entry:'Kharmic Tie',sel:'.adv-config-reset-session',around:'.entry'}),
  pl('Luck',{fixture:'resets',tab:'Adv & Disadv',entry:'Luck',sel:'.adv-config-reset-session',around:'.entry'}),
  pl('Dark Paragon',{fixture:'resets',tab:'Adv & Disadv',entry:'Dark Paragon',sel:'.dp4523-reset',around:'.entry'}),
  pl('Great Destiny',{fixture:'resets',tab:'Adv & Disadv',entry:'Great Destiny',sel:'.dsx4532-btn',text:'^Reset',around:'.entry'}),
  pl('Haunted',{fixture:'resets',tab:'Adv & Disadv',entry:'Haunted',sel:'.dsx4532-btn',text:'^Reset',around:'.entry'}),
  pl('Unlucky',{fixture:'resets',tab:'Adv & Disadv',entry:'Unlucky',sel:'.unlucky-btn',text:'^Reset',around:'.entry'}),
  pl('Ancestor card',{tab:'Clan & School',sel:'#anc48ResetSession',around:'#anc48Card'}),
  pl('Combat round counter',{tab:'Combat',open:openDetails(['voidDetails']),sel:'#btnResetRounds',around:'.combat-round-box'})]},
 {id:'iright',look:'IRIGHT',places:[
  pl('Luck, on a phone',{fixture:'resets',tab:'Adv & Disadv',entry:'Luck',sel:'.adv-config-info',around:'.entry',above:40,below:40}),
  pl('Luck, on a laptop',{fixture:'resets',device:'laptop',tab:'Adv & Disadv',entry:'Luck',sel:'.adv-config-info',around:'.entry',above:40,below:40}),
  pl('Dark Paragon',{fixture:'resets',tab:'Adv & Disadv',entry:'Dark Paragon',sel:'.dp4523-info',around:'.entry',above:40,below:40}),
  pl('Seven Fortunes’ Curse',{tab:'Adv & Disadv',entry:'Seven Fortunes’ Curse',sel:'.ip15-hotei-info',around:'.entry',above:40,below:40}),
  pl('A card that needs a choice (Manage)',{fixture:'changes',mode:'management',tab:'Adv & Disadv',entry:'Wealthy',sel:'.adv-config-info',around:'.entry',above:40,below:40}),
  pl('Kharmic Tie, already like this (no change)',{fixture:'resets',tab:'Adv & Disadv',entry:'Kharmic Tie',sel:'.kt15-info',around:'.entry',above:40,below:40})]},
];

const FIND=function(t){
 const vis=el=>el.checkVisibility({visibilityProperty:true})&&el.getBoundingClientRect().width>0;
 let root=document;
 if(t.entry){root=[...document.querySelectorAll('.entry')].find(d=>{const n=d.querySelector('.en-name');return n&&n.value===t.entry;});if(!root)return null;}
 const re=t.text?new RegExp(t.text):null;
 const el=[...root.querySelectorAll(t.sel)].find(e=>vis(e)&&(!re||re.test(e.textContent.trim())));
 if(!el)return null;
 document.querySelectorAll('[data-b18t]').forEach(e=>delete e.dataset.b18t);
 el.dataset.b18t='1';return true;
};
// The button's look and place, for the records.
const READ=function(){
 const el=document.querySelector('[data-b18t="1"]');const s=getComputedStyle(el),r=el.getBoundingClientRect();
 const card=el.closest('.entry,#anc48Card,.combat-round-box')||el.parentElement;const cr=card.getBoundingClientRect();
 return {words:el.innerText.trim(),spoken:el.getAttribute('aria-label')||el.innerText.trim(),width:Math.round(r.width),height:Math.round(r.height),
  fontSize:s.fontSize,textTransform:s.textTransform,toRightEdge:Math.round(cr.right-r.right),cardWidth:Math.round(cr.width)};
};
async function shot(p,t,file){
 await p.evaluate(()=>{const e=document.querySelector('[data-b18t="1"]');e.scrollIntoView({block:'center'});});await settle(p);
 const box=await p.evaluate(([around,above,below])=>{
  const t=document.querySelector('[data-b18t="1"]');const a=t.closest(around)||document.querySelector(around)||t.parentElement;
  const tr=t.getBoundingClientRect(),ar=a.getBoundingClientRect();
  document.querySelectorAll('.b18-ring').forEach(m=>m.remove());
  const m=document.createElement('div');m.className='b18-ring';
  Object.assign(m.style,{position:'fixed',left:(tr.left-5)+'px',top:(tr.top-5)+'px',width:(tr.width+10)+'px',height:(tr.height+10)+'px',border:'2.5px solid #1d4fd6',borderRadius:'9px',zIndex:2147483647,pointerEvents:'none'});
  document.body.appendChild(m);
  const x=Math.max(0,Math.min(ar.left,tr.left)-8),right=Math.min(innerWidth,Math.max(ar.right,tr.right)+8);
  const y=Math.max(0,Math.max(ar.top-8,tr.top-above)),b=Math.min(innerHeight,Math.min(ar.bottom+8,tr.bottom+below));
  return {x,y,width:right-x,height:Math.max(20,b-y)};},[t.around,t.above||44,t.below||44]);
 await p.screenshot({path:path.join(out,file),clip:box});
 await p.evaluate(()=>document.querySelectorAll('.b18-ring').forEach(m=>m.remove()));
 return {width:Math.round(box.width),height:Math.round(box.height)};
}
async function place(b,card,i,t){
 const r={name:t.name,device:t.device};const fx=F.write(out,t.fixture);
 for(const state of ['now','after']){
  const {c,p}=await C.open(b,t.device==='phone',fx.file,fx.name);
  try{
   await mode(p,t.mode);await P.install(p,WORDS);if(state==='after')await P2.install(p,[card.look]);
   await tab(p,t.tab);if(t.open)await t.open(p);
   await p.evaluate(()=>window.__B18&&window.__B18.apply());await settle(p);await wait(200);
   const found=await p.evaluate(`(${FIND.toString()})(${JSON.stringify(t)})`);
   if(!found)throw new Error('button not found');
   r[state]=await p.evaluate(`(${READ.toString()})()`);
   r[state+'Box']=await shot(p,t,`${card.id}-${i}-${state}.png`);
   r[state+'Errors']=p.errors.slice();
  }catch(e){R.errors.push(`${card.id}/${i}/${state}: ${String(e).split('\n')[0]}`);r[state+'Failed']=String(e).split('\n')[0];}
  await c.close();
 }
 return r;
}
(async()=>{
 const b=await chromium.launch();const only=process.env.ONLY?process.env.ONLY.split(','):null;
 try{for(const card of CARDS){if(only&&!only.includes(card.id))continue;R.cards[card.id]={look:card.look,places:[]};
  for(let i=0;i<card.places.length;i++){const r=await place(b,card,i+1,card.places[i]);R.cards[card.id].places.push(r);
   const f=x=>x?`${x.words} ${x.width}x${x.height} ${x.fontSize} ${x.textTransform} edge ${x.toRightEdge}/${x.cardWidth}`:'-';
   process.stdout.write(`${card.id}/${i+1} ${r.name}: ${f(r.now)}  ->  ${f(r.after)}\n`);}}}
 finally{fs.writeFileSync(path.join(out,only?'cards-r2-partial.json':'cards-r2.json'),JSON.stringify(R,null,1)+'\n');await b.close();}
 console.log('done',sha,'errors',R.errors.length);for(const e of R.errors)console.log(' !',e);
})().catch(e=>{console.error(e);process.exit(1);});
