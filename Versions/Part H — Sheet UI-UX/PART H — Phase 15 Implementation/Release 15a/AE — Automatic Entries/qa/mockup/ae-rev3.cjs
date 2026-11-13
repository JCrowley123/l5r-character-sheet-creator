'use strict';
// AE3 follow-up (owner, 13 Nov): which School, Path and Advanced School Technique names overflow the name box in
// layout A on a phone, and a per-card fallback (A, with the tag under the name only when the name does not fit).
// Scratch only, on the live build. node ae3-names.cjs <out>
const {fs,path,chromium,DENSE,sha,settle,tab,open}=require('./common.cjs');
const out=path.resolve(process.argv[2]);fs.mkdirSync(out,{recursive:true});
const DENSE_FILE=path.join(out,'dense.l5r.json');fs.writeFileSync(DENSE_FILE,JSON.stringify(DENSE));
const R={source_sha256:sha,captured_utc:new Date().toISOString()};
const CSSA=`
html body.x3 #techList > .entry.x3-auto > .rm-btn{display:none!important}
html body.x3 #techList > .entry.x3-auto > .entry-top > input.en-cost{display:none!important}
html body.x3 #techList > .entry.x3-auto:not([data-spell-element]) > .entry-top{padding-right:0!important}
html body.x3 #techList > .entry.x3-auto[data-spell-element] > .entry-top{padding-right:0!important}
html body.x3 #techList > .entry.x3-auto[data-spell-element] > .entry-top > .en-name{margin-right:0!important}
html body.x3 #techList > .entry.x3-auto:not([data-spell-element]) > .entry-top > .x3-tag{display:inline-flex;align-items:center;align-self:center;flex:0 0 auto;margin-left:8px;padding:2px 8px;border-radius:999px;background:rgba(90,77,49,.12);color:var(--ink-soft);font-family:'Noto Sans JP',sans-serif;font-size:.7rem;font-weight:700;line-height:1.5;white-space:nowrap}
html body.x3 #techList > .entry.x3-auto.x3-wrap > .entry-top{flex-wrap:wrap;row-gap:6px}
html body.x3 #techList > .entry.x3-auto.x3-wrap > .entry-top > .en-name{flex:1 1 100%;min-width:0}
html body.x3 #techList > .entry.x3-auto.x3-wrap > .entry-top > .x3-tag{margin-left:auto}
`;
// Every School, Path and Advanced School Technique name the sheet knows, with where it comes from.
const NAMES=()=>{const T=window.__L5R_TEST__,out=new Map();
 T.allSchoolEntries().forEach(e=>(e.tech||[]).forEach((t,i)=>{const n=typeof t==='string'?t:t.name;if(n&&!out.has(n))out.set(n,e.name+', Rank '+(i+1));}));
 (T.ALTERNATE_PATH_LIBRARY||[]).forEach(a=>{if(a.tech&&!out.has(a.tech))out.set(a.tech,'Path: '+(a.name||'?'));});
 const walk=(v,inTech,owner)=>{if(Array.isArray(v))v.forEach(x=>walk(x,inTech,owner));else if(v&&typeof v==='object'){const o=v.name&&!inTech?v.name:owner;Object.entries(v).forEach(([k,x])=>{if(inTech&&k==='name'&&typeof x==='string'){if(!out.has(x))out.set(x,'Advanced: '+owner);}else walk(x,inTech||/tech/i.test(k),o);});}};
 walk(T.ADVANCED_SCHOOL_LIBRARY||[],false,'');return [...out];};
async function setup(b,width){
 const c=await b.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
 const p=await c.newPage();p.errors=[];p.on('pageerror',e=>p.errors.push(String(e)));p.on('dialog',d=>d.accept().catch(()=>{}));
 const {pathToFileURL}=require('url');const {sheet}=require('./common.cjs');
 await p.goto(pathToFileURL(sheet).href,{waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready,null,{timeout:60000});
 await p.waitForFunction(()=>!document.getElementById('l5rSplash'),null,{timeout:30000});await p.evaluate(()=>document.fonts.ready);
 await p.locator('#fileImport').setInputFiles(DENSE_FILE);await p.waitForFunction(n=>document.getElementById('f_name').value===n,DENSE.fields.f_name);await p.waitForTimeout(500);
 await p.evaluate(()=>window.__L5R_TEST__.MODES12.set('management'));await tab(p,'Techniques');
 return {c,p};
}
// Layout: 'today' | 'A' | 'fallback' (A, wrapping a card only when its name does not fit).
async function apply(p,layout){
 if(layout==='today')return;
 await p.addStyleTag({content:CSSA});
 await p.evaluate(fallback=>{document.body.classList.add('x3');
  document.querySelectorAll('#techList > .entry').forEach(e=>{const d=e.querySelector('.en-desc')?.value||'';
   if(/^\[(Advanced )?School Technique . Rank \d+, /.test(d)){e.classList.add('x3-auto');const t=document.createElement('span');t.className='x3-tag';t.textContent='School technique';e.querySelector('.entry-top').append(t);}});
  window.__x3fit=()=>{if(!fallback)return;document.querySelectorAll('#techList > .entry.x3-auto:not([data-spell-element])').forEach(e=>{
   e.classList.remove('x3-wrap');const n=e.querySelector('.en-name');if(n.scrollWidth>n.clientWidth+1)e.classList.add('x3-wrap');});};
  window.__x3fit();},layout==='fallback');
 await settle(p);
}
async function room(p){return p.evaluate(()=>{const n=document.querySelector('#techList > .entry .en-name'),s=getComputedStyle(n);
 return{box:Math.round(n.getBoundingClientRect().width),room:Math.round(n.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)),font:s.font};});}
async function overflow(p,list){return p.evaluate(list=>{const n=document.querySelector('#techList > .entry .en-name'),s=getComputedStyle(n);
 const ctx=document.createElement('canvas').getContext('2d');ctx.font=s.font;const room=n.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight);
 return list.map(([t,src])=>[t,src,Math.ceil(ctx.measureText(t).width)]).filter(x=>x[2]>room).sort((a,b)=>b[2]-a[2]);},list);}
async function rename(p,name){await p.evaluate(name=>{const n=document.querySelector('#techList > .entry .en-name');n.value=name;window.__x3fit&&window.__x3fit();},name);await settle(p);}
async function shot(p,file){await p.evaluate(()=>{document.querySelector('#techList > .entry').scrollIntoView({block:'start'});});await settle(p);
 const el=p.locator('#techList > .entry').first();await el.screenshot({path:path.join(out,file)});
 return p.evaluate(()=>{const e=document.querySelector('#techList > .entry'),n=e.querySelector('.en-name');return{h:Math.round(e.getBoundingClientRect().height),nameBox:Math.round(n.getBoundingClientRect().width),cut:n.scrollWidth>n.clientWidth+1,wrapped:e.classList.contains('x3-wrap')};});}

// Round 3 (owner, 13 Nov): the fallback's tag on the left of its new line instead of the right. Two Hida Bushi cards,
// Rank 1 (fits, one line) above Rank 2 (does not fit, falls back), in Manage and Play.
const LEFT=`html body.x3 #techList > .entry.x3-auto.x3-wrap > .entry-top > .x3-tag{margin-left:VAR}`;
async function hida(p,side){
 await p.evaluate(()=>{const T=window.__L5R_TEST__,first=document.querySelector('#techList > .entry');const second=first.cloneNode(true);first.after(second);
  const set=(e,name,rank)=>{e.querySelector('.en-name').value=name;const d=(typeof T.techniqueDescription==='function'&&T.techniqueDescription(name))||'';
   e.querySelector('.en-desc').value='[School Technique \u2014 Rank '+rank+', Hida Bushi] '+d;};
  set(first,'The Way of the Crab',1);set(second,'The Mountain Does Not Move',2);window.__x3fit();});
 if(side==='left'){
  // Line the tag up with where the name's text starts: the box's edge in Manage, the text's own inset in Play.
  await p.addStyleTag({content:LEFT.replace('VAR','0')});
  await p.addStyleTag({content:'html body.x3.pm12-play #techList > .entry.x3-auto.x3-wrap > .entry-top > .x3-tag{margin-left:var(--x3-inset,0px)}'});
  await p.evaluate(()=>{const n=document.querySelector('#techList > .entry .en-name');document.body.style.setProperty('--x3-inset','0px');});
 }
 await settle(p);
}
async function two(p,file){await p.evaluate(()=>{document.querySelector('#techList > .entry').scrollIntoView({block:'start'});});await settle(p);
 const box=await p.evaluate(()=>{const a=document.querySelector('#techList > .entry').getBoundingClientRect(),b=document.querySelector('#techList > .entry:nth-child(2)').getBoundingClientRect();
  return{x:Math.max(0,a.left-6),y:Math.max(0,a.top-6),width:a.width+12,height:Math.min(innerHeight-a.top,b.bottom-a.top+12)};});
 await p.screenshot({path:path.join(out,file),clip:box});
 return p.evaluate(()=>[...document.querySelectorAll('#techList > .entry')].slice(0,2).map(e=>{const n=e.querySelector('.en-name'),t=e.querySelector('.x3-tag'),s=getComputedStyle(n);
  const nr=n.getBoundingClientRect(),tr=t.getBoundingClientRect();return{name:n.value,wrapped:e.classList.contains('x3-wrap'),cut:n.scrollWidth>n.clientWidth+1,h:Math.round(e.getBoundingClientRect().height),
  nameLeft:Math.round(nr.left),nameTextLeft:Math.round(nr.left+parseFloat(s.paddingLeft)+parseFloat(s.borderLeftWidth)),tagLeft:Math.round(tr.left),tagRight:Math.round(tr.right),cardRight:Math.round(e.getBoundingClientRect().right)};}));}
(async()=>{const b=await chromium.launch();R.browser=b.version();try{
 for(const side of ['right','left']){
  const {c,p}=await setup(b,390);await apply(p,'fallback');await hida(p,side);
  R[side]={manage:await two(p,`r3-m-${side}.png`)};
  await p.evaluate(()=>window.__L5R_TEST__.MODES12.set('play'));await settle(p);await p.evaluate(()=>window.__x3fit());await settle(p);
  R[side].play=await two(p,`r3-p-${side}.png`);R[side].errors=p.errors;await c.close();
  console.log(side,JSON.stringify(R[side]));
 }
 fs.writeFileSync(path.join(out,'r3.json'),JSON.stringify(R,null,1)+'\n');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
