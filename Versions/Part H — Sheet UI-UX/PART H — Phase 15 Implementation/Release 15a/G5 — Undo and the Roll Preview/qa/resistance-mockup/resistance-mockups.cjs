'use strict';
// Resistance, effect first: five mock-ups drawn inside the real app (A12's build with A12 paused = the live flat list).
// Scratch only: no application file is edited; each mock-up is markup placed in the open roll preview of the test browser.
const {fs,path,chromium,V,sha,settle,tab,open}=require('../mockup/common.cjs');
const out=path.resolve(process.argv[2]);fs.mkdirSync(out,{recursive:true});
const SRC=path.join(V,'Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A12 — One Resisting Line/qa/resist-kuni.l5r.json');
const FX=JSON.parse(fs.readFileSync(SRC,'utf8'));
FX.adv=FX.adv.filter(a=>!['Heartless','Irreproachable'].includes(a.name));
FX.fields.f_honorRank=typeof FX.fields.f_honorRank==='number'?6:'6';
FX.fields.f_name='Resistance mock-up';
const FXP=path.join(out,'mock.l5r.json');fs.writeFileSync(FXP,JSON.stringify(FX));
const R={source_sha256:sha,captured_utc:new Date().toISOString(),character:'Honour 6, Balance, Clear Thinker, Missing Limb',phone:{},laptop:{}};

const CSS=`
.mk-q{margin:6px 0 4px;font-family:"Noto Sans JP",sans-serif;font-weight:600;font-size:.95rem;color:var(--ink);display:flex;align-items:baseline;gap:8px}
.mk-q small{font-weight:400;font-size:.85em;color:var(--ink-soft)}
.mk-chips{display:flex;flex-wrap:wrap;gap:6px}
.mk-chip{appearance:none;font-family:"Noto Sans JP",sans-serif;font-size:.95rem;font-weight:500;text-transform:none;letter-spacing:normal;min-height:44px;padding:0 11px;border:1.5px solid var(--gold-mid);border-radius:999px;background:#fffdf8;color:var(--ink);cursor:pointer;box-shadow:none;width:auto}
.mk-chip.on{background:var(--shu-dark);border-color:var(--shu-dark);color:#fff}
.mk-chip.on::before{content:"\\2713\\00a0"}
.mk-added{margin-top:8px;font-family:"Noto Sans JP",sans-serif;font-size:.95rem;color:var(--ink)}
.mk-added b{font-weight:600}
.mk-added-h{font-size:.85em;color:var(--ink-soft);margin-bottom:2px}
.mk-row{display:flex;gap:8px;align-items:baseline;font-family:"Noto Sans JP",sans-serif;font-size:.95rem;min-height:28px;color:var(--ink)}
.mk-tick{color:var(--shu-dark);font-weight:700}
.mk-v{margin-left:auto;white-space:nowrap;font-weight:600}
.mk-ask{margin-top:6px}
.mk-ask-h{font-size:.85em;color:var(--ink-soft);margin-bottom:2px}
.mk-eff{align-items:center;min-height:44px;padding:2px 8px;border-radius:8px}
.mk-eff input{margin-top:0;width:18px;height:18px}
.mk-eff b{font-weight:600}
.mk-sub{display:block;font-size:.85em;color:var(--ink-soft)}
.mk-eff.on{background:#fffdf8;outline:1.5px solid var(--shu-dark)}
.mk-eff.on .mk-sub{color:var(--shu-dark);font-weight:600}
.mk-list{display:grid;gap:2px}
.mk-sel{display:block;margin:6px 0 0}
.mk-sel .mk-q{text-transform:none;letter-spacing:normal}
.mk-sel select{display:block;width:100%;min-height:44px;margin-top:6px;padding:0 12px;font-family:"Noto Sans JP",sans-serif;font-size:.95rem;color:var(--ink);background:#fffdf8;border:1.5px solid var(--gold-mid);border-radius:8px}
.mk-banner{display:flex;align-items:center;gap:10px;margin-top:8px;padding:8px 10px;border-radius:8px;background:var(--shu-dark);color:#fff;font-family:"Noto Sans JP",sans-serif;font-size:.95rem}
.mk-banner small{display:block;font-size:.8em;opacity:.85}
.mk-banner button{margin-left:auto;appearance:none;min-height:36px;padding:0 12px;border:1px solid rgba(255,255,255,.7);border-radius:6px;background:transparent;color:#fff;font-family:"Noto Sans JP",sans-serif;font-size:.85rem;text-transform:none;letter-spacing:normal}
.mk-rest{margin-top:8px}
.mk-resist{position:relative;margin:4px 0 12px;display:flex;flex-direction:column;align-items:flex-start;gap:8px}
.mk-resist-btn{appearance:none;min-height:44px;padding:0 18px;border:1.5px solid var(--gold-mid);border-radius:999px;background:#fffdf8;color:var(--ink);font-family:"Noto Sans JP",sans-serif;font-size:.95rem;font-weight:600;text-transform:none;letter-spacing:normal}
.mk-menu{width:min(280px,100%);padding:10px;border:1px solid var(--gold-mid);border-radius:10px;background:#fffdf8;box-shadow:0 6px 18px rgba(42,36,32,.22);display:grid;gap:6px}
.mk-menu-h{font-family:"Noto Sans JP",sans-serif;font-weight:600;font-size:.95rem;color:var(--ink)}
.mk-menu button{appearance:none;min-height:44px;padding:0 12px;text-align:left;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);font-family:"Noto Sans JP",sans-serif;font-size:.95rem;font-weight:500;text-transform:none;letter-spacing:normal}
.mk-menu-n{font-size:.85em;color:var(--ink-soft)}
`;
const ASK=`<div class="mk-ask"><label class="rd4515-opt"><input type="checkbox"><span>Clear Thinker +1k0 — only if they are trying to confuse or manipulate you</span></label><div class="rd4515-opt-note">Core Rulebook p.147.</div></div>`;
const added=(rows,ask)=>`<div class="mk-added"><span class="mk-tick">✓</span> Added: `+rows.map(r=>`<b>${r}</b>`).join(' · ')+`</div>`+(ask?ASK:'');
const TEMPT=added(['Honour +6','Balance +1k0'],true);
const chips=(names,on)=>`<div class="mk-q">Resisting?</div><div class="mk-chips" role="group" aria-label="Resisting">`+names.map(n=>`<button type="button" class="mk-chip${n===on?' on':''}" aria-pressed="${n===on}">${n}</button>`).join('')+`</div>`;
const E3=['Intimidation','Temptation','Fear'];
const radios=(on,sub)=>`<div class="mk-list">`+E3.map(n=>{const s=n==='Fear'?'Honour +6':'Honour +6 · Balance +1k0';
 return `<label class="rd4515-opt mk-eff${n===on?' on':''}"><input type="radio" name="mk-eff"${n===on?' checked':''}><span><b>${n}</b>${sub?`<span class="mk-sub">${n===on?'Added: ':''}${s}</span>`:''}</span></label>`;}).join('')+`</div>`;
const D={
 'm1-before':chips(E3,null),
 'm1-after':chips(E3,'Temptation')+TEMPT,
 'm1-gift':chips(E3.concat(['Poison or disease']),'Poison or disease')+added(['Jurojin’s Blessing +2k0'],false),
 'm2-before':`<details class="rs15-line"><summary><span class="rs15-q">Resisting?</span><span class="rs15-count">Intimidation · Temptation · Fear</span></summary><div class="rs15-body"></div></details>`,
 'm2-after':`<details class="rs15-line rs15-has" open><summary><span class="rs15-q">Resisting?</span><span class="rs15-count">Temptation</span></summary><div class="rs15-body">${radios('Temptation',false)}${TEMPT}</div></details>`,
 'm3-before':`<div class="mk-q">Resisting?</div>${radios(null,true)}`,
 'm3-after':`<div class="mk-q">Resisting?</div>${radios('Temptation',true)}${ASK}`,
 'm4-before':`<label class="mk-sel"><span class="mk-q" style="margin:0">Resisting?</span><select><option selected>Nothing</option><option>Intimidation</option><option>Temptation</option><option>Fear</option></select></label>`,
 'm4-after':`<label class="mk-sel"><span class="mk-q" style="margin:0">Resisting?</span><select><option>Nothing</option><option>Intimidation</option><option selected>Temptation</option><option>Fear</option></select></label>${TEMPT}`,
 'm5-after':`<div class="mk-banner"><span><small>Opened from Resist…</small><b>Resisting Temptation</b></span><button type="button">Change</button></div>${TEMPT}`
};
const RESIST_SOURCES=['Advantages','Honour'];
// Replace the resistance choices (the Advantages and Honour sources) with a mock-up; every other choice stays as the app drew it.
async function inject(p,html){
 await p.evaluate(([css,html,SRCS])=>{
  if(!document.getElementById('mk-css')){const s=document.createElement('style');s.id='mk-css';s.textContent=css;document.head.append(s);}
  const dec=document.querySelector('.rd4515-declare');const head=dec.querySelector('.rd4515-head');
  dec.querySelectorAll('.mk-wrap').forEach(n=>n.remove());
  let drop=false;[...dec.children].forEach(k=>{if(k===head||k.classList.contains('rd4515-note'))return;
   if(k.classList.contains('rd4515-source'))drop=SRCS.includes(k.textContent.trim());if(drop)k.remove();});
  const w=document.createElement('div');w.className='mk-wrap';w.innerHTML=html;head.after(w);
  const rest=dec.querySelector('.rd4515-source');if(rest)rest.classList.add('mk-rest');
 },[CSS,html,RESIST_SOURCES]);await settle(p);
}
const metrics=p=>p.evaluate(()=>{const dec=document.querySelector('.rd4515-declare'),go=document.getElementById('rollPreviewGo');const sc=go.closest('.roll-modal');const r=go.getBoundingClientRect();
 return {declareHeight:Math.round(dec.getBoundingClientRect().height),rollButtonInViewAtOpen:r.bottom<=innerHeight&&r.bottom<=sc.getBoundingClientRect().bottom+0.5,scrollNeeded:Math.max(0,sc.scrollHeight-sc.clientHeight)};});
async function declareShot(p,file){
 const vp=p.viewportSize();await p.setViewportSize({width:vp.width,height:2600});await settle(p);await p.waitForTimeout(150);
 await p.locator('.rd4515-declare').screenshot({path:path.join(out,file)});
 await p.setViewportSize(vp);await settle(p);await p.waitForTimeout(150);
}
async function openWillpower(p){
 await tab(p,'Rings & Traits');
 await p.locator('.trait-row label[data-trait-name="Willpower"]').first().click();
 await p.waitForSelector('#rollPreviewOverlay',{state:'visible'});await settle(p);await p.waitForTimeout(200);
}
async function closePreview(p){await p.locator('#rollPreviewClose').click();await p.waitForSelector('#rollPreviewOverlay',{state:'hidden'});await settle(p);}
const pause=(p,v)=>p.evaluate(v=>{window.__L5R_TEST__.RS15.paused=v;},v);

async function device(b,phone){
 const dev=phone?'phone':'laptop',M=R[dev];
 const {c,p}=await open(b,phone,FXP,'Resistance mock-up');
 await p.evaluate(()=>window.__L5R_TEST__.MODES12.set('play'));await settle(p);
 // Today (the live app's flat list) and A12 as built.
 await pause(p,true);await openWillpower(p);M.today=await metrics(p);await declareShot(p,`${dev}-today.png`);
 if(phone)await p.screenshot({path:path.join(out,'phone-today-view.png')});
 await closePreview(p);
 await pause(p,false);await openWillpower(p);M.a12=await metrics(p);await declareShot(p,`${dev}-a12.png`);await closePreview(p);
 await pause(p,true);
 for(const m of ['m1','m2','m3','m4']){
  await openWillpower(p);
  await inject(p,D[m+'-before']);M[m+'-before']=await metrics(p);await declareShot(p,`${dev}-${m}-before.png`);
  await inject(p,D[m+'-after']);M[m+'-after']=await metrics(p);await declareShot(p,`${dev}-${m}-after.png`);
  await closePreview(p);
 }
 // M5: the entry point on the sheet, then the preview it opens.
 await tab(p,'Rings & Traits');
 const box=await p.evaluate(css=>{
  if(!document.getElementById('mk-css')){const s=document.createElement('style');s.id='mk-css';s.textContent=css;document.head.append(s);}
  const wrap=document.getElementById('ringsWrap');const sec=wrap.closest('.section');
  const d=document.createElement('div');d.className='mk-resist';
  d.innerHTML='<button type="button" class="mk-resist-btn">Resist…</button><div class="mk-menu"><div class="mk-menu-h">What are you resisting?</div><button type="button">Intimidation</button><button type="button">Temptation</button><button type="button">Fear</button><div class="mk-menu-n">Opens the roll with your bonuses in place.</div></div>';
  wrap.before(d);sec.scrollIntoView({block:'start'});
  const a=sec.getBoundingClientRect(),m=d.getBoundingClientRect();
  return {x:Math.max(0,a.left),y:Math.max(0,a.top),width:Math.min(innerWidth-Math.max(0,a.left),Math.min(a.width,phone_w())),height:Math.min(innerHeight-Math.max(0,a.top),m.bottom-a.top+16)};
  function phone_w(){return innerWidth<600?a.width:520;}
 },CSS);
 await settle(p);await p.waitForTimeout(150);await p.screenshot({path:path.join(out,`${dev}-m5-before.png`),clip:box});
 await p.evaluate(()=>document.querySelector('.mk-resist').remove());
 await openWillpower(p);await inject(p,D['m5-after']);M['m5-after']=await metrics(p);await declareShot(p,`${dev}-m5-after.png`);await closePreview(p);
 // M1 with a gift (Jurojin's Blessing): how poison would read.
 await openWillpower(p);await inject(p,D['m1-gift']);M['m1-gift']=await metrics(p);await declareShot(p,`${dev}-m1-gift.png`);await closePreview(p);
 if(phone){
  // M1 in the whole preview: the app's own total with Balance and Honour really ticked, then the mock-up placed over the list.
  await openWillpower(p);await inject(p,D['m1-before']);await p.screenshot({path:path.join(out,'phone-m1-view-before.png')});await closePreview(p);
  await openWillpower(p);
  await p.locator('[data-rd4515-key="situational-entries:balance"]').check();await settle(p);await p.waitForTimeout(150);
  await inject(p,D['m1-after']);M['m1-view-after']=await metrics(p);
  M['m1-view-after'].rollText=await p.evaluate(()=>document.getElementById('rollPreviewBody').innerText.split('\n').slice(0,12).join(' | '));
  await p.screenshot({path:path.join(out,'phone-m1-view-after.png')});await closePreview(p);
 }
 M.errors=p.errors.slice();await c.close();
}
(async()=>{
 const b=await chromium.launch();
 await device(b,true);await device(b,false);
 await b.close();
 fs.writeFileSync(path.join(out,'mockups.json'),JSON.stringify(R,null,1));
 console.log(JSON.stringify(R,null,1));
})().catch(e=>{console.error(e);process.exit(1);});
