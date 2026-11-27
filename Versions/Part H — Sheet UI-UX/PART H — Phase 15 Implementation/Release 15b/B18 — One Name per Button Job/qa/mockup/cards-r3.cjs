'use strict';
// B18 mock-ups, round 3: the owner's two device-round notes (27 November 2026) and the two places the same question
// reaches. The sheet as built on the group's tip (B18, B18.1, B18.2: what the owner checked) is opened in the test
// browser; "now" is that, "after" has one round-3 look drawn on it (proposals-r3.cjs). Scratch only: no application
// file is edited. Usage: run.sh cards-r3.cjs <out folder>
const C=require('./common.cjs');const {fs,path,chromium,sha,settle,tab,mode,wait}=C;
const INV=require('../inventory/fixtures.cjs');const P3=require('./proposals-r3.cjs');
const out=path.resolve(process.argv[2]);fs.mkdirSync(out,{recursive:true});
const R={source_sha256:sha,captured_utc:new Date().toISOString(),cards:{},errors:[]};
C.LAPTOP.deviceScaleFactor=2;
// The inventory character (Luck Rank 3 with 2 of 3 uses left, Unlucky Rank 2) plus the other rank and number windows.
function fixture(){
 const f=INV.sessions();f.fields.f_name='B18 round 3';
 f.adv.push({name:'Perceived Honor',cost:'2',desc:''});
 f.disadv.push({name:'Elemental Imbalance',cost:'2',desc:''},{name:'Dependant',cost:'2',desc:''},{name:'Antisocial',cost:'2',desc:''});
 const file=path.join(out,'b18-round3.l5r.json');fs.writeFileSync(file,JSON.stringify(f));return {file,name:f.fields.f_name};
}
const rec=(card,place)=>{(R.cards[card]=R.cards[card]||{places:[]}).places.push(place);return place;};
async function region(p,sel,file,pad){
 const box=await p.evaluate(([sel,pad])=>{const e=typeof sel==='string'?document.querySelector(sel):null;
  const el=e||[...document.querySelectorAll('#advList .entry,#disadvList .entry')].find(d=>d.querySelector('.en-name').value===sel.entry);
  el.scrollIntoView({block:'center'});const r=el.getBoundingClientRect();
  const x=Math.max(0,r.left-pad),y=Math.max(0,r.top-pad);
  return {x,y,width:Math.min(innerWidth,r.right+pad)-x,height:Math.min(innerHeight,r.bottom+pad)-y};},[sel,pad]);
 await settle(p);await p.screenshot({path:path.join(out,file),clip:box});return {width:Math.round(box.width),height:Math.round(box.height)};
}
const WIN='#advConfigModalOverlay .roll-modal';
const readWindow=p=>p.evaluate(()=>({title:document.getElementById('advConfigTitle').textContent,sub:document.getElementById('advConfigSubtitle').textContent,
 grid:document.getElementById('advConfigGrid').innerText.replace(/\s+/g,' ').trim(),note:document.getElementById('advConfigNote').textContent,
 noteShown:getComputedStyle(document.getElementById('advConfigNote')).display!=='none',value:(document.querySelector('#advConfigGrid input[type=number]')||{}).value||null,
 button:document.getElementById('advConfigConfirm').textContent}));
async function openWindow(p,list,name){
 const ok=await p.evaluate(([l,n])=>{const d=[...document.querySelectorAll('#'+l+' .entry')].find(e=>e.querySelector('.en-name').value===n);
  if(!d)return 'no row';const b=d.querySelector('.adv-config-btn');if(!b)return 'no button';b.click();return 'ok';},[list,name]);
 if(ok!=='ok')throw new Error(name+': '+ok);await settle(p);await wait(250);
}
const closeWindow=async p=>{await p.evaluate(()=>document.getElementById('advConfigX').click());await settle(p);await wait(150);};
async function windowPair(p,card,i,name,list,entry,look,device,before){
 const r=rec(card,{name,device,files:{}});
 try{
  await openWindow(p,list,entry);if(before)await before(p);
  r.now=await readWindow(p);r.files.now=`${card}-${i}-now.png`;await p.locator(WIN).screenshot({path:path.join(out,r.files.now)});
  if(look==='EMPTYBAR')await P3.installCss(p,['EMPTYBAR']);else if(look)await P3.windowLook(p,look);
  if(look){r.after=await readWindow(p);r.files.after=`${card}-${i}-after.png`;await p.locator(WIN).screenshot({path:path.join(out,r.files.after)});}
  await p.evaluate(()=>{const s=document.getElementById('b18r3-EMPTYBAR');if(s)s.remove();});
  await closeWindow(p);
 }catch(e){R.errors.push(`${card}/${i}: ${String(e).split('\n')[0]}`);}
 r.errors=p.errors.slice();return r;
}
async function luckRow(p,i,device){
 const r=rec('lucki',{name:device==='phone'?'Luck, on a phone':'Luck, on a laptop',device,files:{}});
 try{
  await mode(p,'play');await tab(p,'Adv & Disadv');
  const read=()=>p.evaluate(()=>{const d=[...document.querySelectorAll('#advList .entry')].find(e=>e.querySelector('.en-name').value==='Luck');
   const i=d.querySelector('.adv-config-luck-controls>.adv-config-info');const reset=d.querySelector('.adv-config-reset-session');
   return {iShown:!!(i&&i.checkVisibility()),resetWords:reset.textContent.trim(),resetSpoken:reset.getAttribute('aria-label'),resetTitle:reset.getAttribute('title'),
    rowHeight:Math.round(d.querySelector('.adv-config-row').getBoundingClientRect().height)};});
  r.now=await read();r.files.now=`lucki-${i}-now.png`;r.nowBox=await region(p,{entry:'Luck'},r.files.now,8);
  await P3.installCss(p,['LUCKI']);
  r.after=await read();r.files.after=`lucki-${i}-after.png`;r.afterBox=await region(p,{entry:'Luck'},r.files.after,8);
  await p.evaluate(()=>document.getElementById('b18r3-LUCKI').remove());
 }catch(e){R.errors.push(`lucki/${i}: ${String(e).split('\n')[0]}`);}
 r.errors=p.errors.slice();return r;
}
async function imbalanceStep2(p){
 await p.evaluate(()=>{const i=document.querySelector('#advConfigGrid input[type=number]');i.value='1';i.dispatchEvent(new Event('input',{bubbles:true}));
  document.getElementById('advConfigConfirm').click();});await settle(p);await wait(250);
}
(async()=>{
 const b=await chromium.launch();const fx=fixture();
 try{
  for(const device of ['phone','laptop']){
   const {c,p}=await C.open(b,device==='phone',fx.file,fx.name);
   try{
    await luckRow(p,device==='phone'?1:2,device);
    await mode(p,'management');await tab(p,'Adv & Disadv');
    if(device==='phone'){
     await windowPair(p,'unlucky',1,'Unlucky’s window, on a phone','disadvList','Unlucky','UNLUCKY',device);
     await windowPair(p,'unlucky',3,'Perceived Honor’s window, already like this (no change)','advList','Perceived Honor',null,device);
     await windowPair(p,'imbalance',1,'Elemental Imbalance, first step (its Rank)','disadvList','Elemental Imbalance','IMBALANCE',device);
     await windowPair(p,'emptybar',1,'Dependant','disadvList','Dependant','EMPTYBAR',device);
     await windowPair(p,'emptybar',2,'Antisocial','disadvList','Antisocial','EMPTYBAR',device);
     await windowPair(p,'emptybar',3,'Elemental Imbalance, second step (its Element)','disadvList','Elemental Imbalance','EMPTYBAR',device,imbalanceStep2);
    }else{
     await windowPair(p,'unlucky',2,'Unlucky’s window, on a laptop','disadvList','Unlucky','UNLUCKY',device);
    }
   }finally{await c.close();}
  }
 }finally{
  for(const k of Object.keys(R.cards))R.cards[k].places.sort((a,b)=>a.files.now<b.files.now?-1:1);
  fs.writeFileSync(path.join(out,'cards-r3.json'),JSON.stringify(R,null,1)+'\n');await b.close();
 }
 for(const [k,v] of Object.entries(R.cards))for(const pl of v.places)console.log(k,'|',pl.name,'|',JSON.stringify(pl.now),'->',JSON.stringify(pl.after||null));
 console.log('done',sha,'errors',R.errors.length);for(const e of R.errors)console.log(' !',e);
})().catch(e=>{console.error(e);process.exit(1);});
