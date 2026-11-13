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

const NAME='The Mountain Does Not Move';
async function hida(p){await p.evaluate(name=>{const T=window.__L5R_TEST__,e=document.querySelector('#techList > .entry');
 e.querySelector('.en-name').value=name;
 const d=(typeof T.techniqueDescription==='function'&&T.techniqueDescription(name))||'';
 e.querySelector('.en-desc').value='[School Technique \u2014 Rank 2, Hida Bushi] '+d;window.__x3fit&&window.__x3fit();},NAME);await settle(p);}
async function note(b,width,fixture,file){
 const {c,p}=await open(b,width>500?false:true,fixture,'Older Kitsu test character');
 await p.evaluate(()=>window.__L5R_TEST__.MODES12.set('management'));await tab(p,'Identity');
 await p.evaluate(()=>{const r=document.getElementById('validationReport'),first=r.querySelector('.vr-row');
  const row=document.createElement('div');row.className='vr-row vr-info';
  row.innerHTML='<span class="vr-badge vr-badge-info" title="Note">\u2139</span><span class="vr-text"><strong></strong><span class="vr-detail"></span></span>';
  row.querySelector('strong').textContent='Kitsu Shugenja: Sense and Commune marked as your School\u2019s spells; Summon added';
  row.querySelector('.vr-detail').textContent='Every Kitsu Shugenja is given these three. Summon was missing, so it was added with its Spell Scroll. This note goes once you save the character.';
  first.before(row);const h=r.querySelector('.vr-head span');h.textContent=h.textContent.replace(/(\d+) notes/,(m,n)=>(Number(n)+1)+' notes');});
 await settle(p);const box=await p.evaluate(()=>{const r=document.getElementById('validationReport');r.scrollIntoView({block:'start'});const b=r.getBoundingClientRect();return{x:Math.max(0,b.left-4),y:Math.max(0,b.top-4),width:b.width+8,height:Math.min(innerHeight,b.height+8)};});
 await settle(p);await p.screenshot({path:path.join(out,file),clip:box});R[file]=p.errors;await c.close();}
(async()=>{const b=await chromium.launch();R.browser=b.version();try{
 const fx=path.join(__dirname,'final','proposed-kitsu-missing.l5r.json');
 await note(b,390,fx,'r1-phone-note.png');await note(b,1440,fx,'r1-laptop-note.png');
 for(const layout of ['today','A','fallback']){
  const {c,p}=await setup(b,390);await apply(p,layout);await hida(p);
  R[layout]={manage:await shot(p,`hida-m-${layout}.png`)};
  await p.evaluate(()=>window.__L5R_TEST__.MODES12.set('play'));await settle(p);await p.evaluate(()=>window.__x3fit&&window.__x3fit());await settle(p);
  R[layout].play=await shot(p,`hida-p-${layout}.png`);
  R[layout].visible=await p.evaluate(()=>{const n=document.querySelector('#techList > .entry .en-name'),s=getComputedStyle(n),ctx=document.createElement('canvas').getContext('2d');ctx.font=s.font;
   const room=n.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight);let t=n.value;while(t&&ctx.measureText(t).width>room)t=t.slice(0,-1);return t;});
  R[layout].errors=p.errors;await c.close();console.log(layout,JSON.stringify(R[layout]));
 }
 fs.writeFileSync(path.join(out,'rev.json'),JSON.stringify(R,null,1)+'\n');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
