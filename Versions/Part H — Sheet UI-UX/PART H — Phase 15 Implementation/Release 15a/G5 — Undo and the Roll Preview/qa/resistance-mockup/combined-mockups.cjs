'use strict';
// Resistance, combined design: five versions (effect buttons in the roll + buttons beside abilities + a list that follows the roll),
// drawn inside the real app (A12's build with A12 paused = the live app's list). Scratch only: no application file is edited.
const {fs,path,chromium,V,sha,settle,tab,open}=require('../mockup/common.cjs');
const out=path.resolve(process.argv[2]);fs.mkdirSync(out,{recursive:true});
const SRC=path.join(V,'Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A12 — One Resisting Line/qa/resist-kuni.l5r.json');
const FX=JSON.parse(fs.readFileSync(SRC,'utf8'));
FX.adv=FX.adv.filter(a=>!['Heartless','Irreproachable'].includes(a.name));
FX.adv.push({name:'Wary',cost:'2',desc:''});
FX.adv.push({name:'Touch of the Spirit Realms',cost:'5',desc:'',config:{type:'spiritRealmTouch',revision:1,realm:'Tengoku',value:'Tengoku'}});
FX.fields.f_honorRank=typeof FX.fields.f_honorRank==='number'?6:'6';FX.fields.f_name='Resistance mock-up';
const FXP=path.join(out,'cmock.l5r.json');fs.writeFileSync(FXP,JSON.stringify(FX));
const R={source_sha256:sha,captured_utc:new Date().toISOString(),character:'Honour 6; Balance, Clear Thinker, Wary, Touch of the Spirit Realms (Tengoku); Missing Limb',phone:{},laptop:{}};
const KEYS=['honour-resistance:resist','situational-entries:balance','situational-entries:clear-thinker','situational-entries:heartless','situational-entries:irreproachable','fortune-blessing:jurojin','fortune-blessing:hotei','spirit-realms:meido','spirit-realms:tengoku','ancestors:kaimetsu-provoked','ancestors:moto-resist','ancestors:yamatsu-resist','ancestors:hitomi-resist','ancestors:reichin-fear','ancestors:reichin-bloodspeaker'];

const CSS=`
.mk-q{margin:6px 0 4px;font-family:"Noto Sans JP",sans-serif;font-weight:600;font-size:.95rem;color:var(--ink);display:flex;align-items:center;gap:8px;min-height:28px}
.mk-else{margin-left:auto;appearance:none;background:none;border:0;box-shadow:none;padding:0 2px;min-height:28px;color:var(--shu-dark);font-family:"Noto Sans JP",sans-serif;font-size:.85rem;font-weight:500;text-decoration:underline;text-transform:none;letter-spacing:normal;cursor:pointer;width:auto}
.mk-chips{display:flex;flex-wrap:wrap;gap:6px}
.mk-chip{appearance:none;font-family:"Noto Sans JP",sans-serif;font-size:.95rem;font-weight:500;text-transform:none;letter-spacing:normal;min-height:44px;padding:0 11px;border:1.5px solid var(--gold-mid);border-radius:999px;background:#fffdf8;color:var(--ink);cursor:pointer;box-shadow:none;width:auto}
.mk-chip.on{background:var(--shu-dark);border-color:var(--shu-dark);color:#fff}
.mk-chip.on::before{content:"\\2713\\00a0"}
.mk-chip.dim{border:1.5px dashed var(--line);background:transparent;color:var(--ink-soft)}
.mk-less{margin:8px 0 4px;font-size:.85em;color:var(--ink-soft)}
.mk-added{margin-top:8px;font-family:"Noto Sans JP",sans-serif;font-size:.95rem;color:var(--ink)}
.mk-added b{font-weight:600}
.mk-tick{color:var(--shu-dark);font-weight:700}
.mk-ask{margin-top:6px}
.mk-quiet{appearance:none;display:flex;align-items:center;justify-content:space-between;width:100%;min-height:44px;margin-top:6px;padding:0 12px;border:1px solid var(--line);border-radius:8px;background:#fffdf8;color:var(--ink);font-family:"Noto Sans JP",sans-serif;font-size:.95rem;font-weight:500;text-transform:none;letter-spacing:normal;box-shadow:none;cursor:pointer}
.mk-quiet span:last-child{color:var(--ink-soft);font-size:1.2rem}
.mk-eff{align-items:center;min-height:44px;padding:2px 8px;border-radius:8px}
.mk-eff input{margin-top:0;width:18px;height:18px}
.mk-eff b{font-weight:600}
.mk-sub{display:block;font-size:.85em;color:var(--ink-soft)}
.mk-list{display:grid;gap:2px}
.mk-banner{display:flex;align-items:center;gap:10px;margin-top:8px;padding:8px 10px;border-radius:8px;background:var(--shu-dark);color:#fff;font-family:"Noto Sans JP",sans-serif;font-size:.95rem}
.mk-banner small{display:block;font-size:.8em;opacity:.85}
.mk-banner button{margin-left:auto;appearance:none;min-height:36px;padding:0 12px;border:1px solid rgba(255,255,255,.7);border-radius:6px;background:transparent;color:#fff;font-family:"Noto Sans JP",sans-serif;font-size:.85rem;text-transform:none;letter-spacing:normal;width:auto}
.mk-rest{margin-top:8px}
.mk-row{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 2px}
.mk-rnote{margin:6px 0 2px;font-size:.92em;color:var(--ink-soft);font-style:italic}
.mk-menu{width:min(280px,100%);margin:6px 0 4px;padding:10px;border:1px solid var(--gold-mid);border-radius:10px;background:#fffdf8;box-shadow:0 6px 18px rgba(42,36,32,.22);display:grid;gap:6px}
.mk-menu-h{font-family:"Noto Sans JP",sans-serif;font-weight:600;font-size:.95rem;color:var(--ink)}
.mk-menu button{appearance:none;min-height:44px;padding:0 12px;text-align:left;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);font-family:"Noto Sans JP",sans-serif;font-size:.95rem;font-weight:500;text-transform:none;letter-spacing:normal;box-shadow:none}
.mk-hrow{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;padding-top:8px;border-top:1px dashed var(--line)}
.mk-hlab{flex-basis:100%;font-size:.85em;color:var(--ink-soft)}
`;
const ELSE=`<button type="button" class="mk-else">Something else…</button>`;
const q=(els)=>`<div class="mk-q">Resisting?${els?ELSE:''}</div>`;
const chips=(names,on,cls)=>`<div class="mk-chips" role="group" aria-label="Resisting">`+names.map(n=>`<button type="button" class="mk-chip${n===on?' on':''}${cls?' '+cls:''}" aria-pressed="${n===on}">${n}</button>`).join('')+`</div>`;
const ASK=`<div class="mk-ask"><label class="rd4515-opt"><input type="checkbox"><span>Clear Thinker +1k0 — only if they are trying to confuse or manipulate you</span></label><div class="rd4515-opt-note">Core Rulebook p.147.</div></div>`;
const added=(rows,ask)=>`<div class="mk-added"><span class="mk-tick">✓</span> Added: `+rows.map(r=>`<b>${r}</b>`).join(' · ')+`</div>`+(ask?ASK:'');
const QUIET=`<button type="button" class="mk-quiet"><span>Resisting something?</span><span aria-hidden="true">›</span></button>`;
const W=['Fear','Intimidation','Temptation'],T=['Shadowlands Taint'];
const SUB={Fear:'Honour +6',Intimidation:'Honour +6 · Balance +1k0',Temptation:'Honour +6 · Balance +1k0','Shadowlands Taint':'Tengoku +2k0'};
const radios=names=>`<div class="mk-list">`+names.map(n=>`<label class="rd4515-opt mk-eff"><input type="radio" name="mk-eff"><span><b>${n}</b><span class="mk-sub">${SUB[n]}</span></span></label>`).join('')+`</div>`;
const less=`<div class="mk-less">Less likely on this roll</div>`;
// Per version: what the preview shows on a Willpower roll, an Earth Ring roll and an Agility roll.
const P={
 v1:{will:q(true)+chips(W),earth:q(true)+chips(T),agi:QUIET,
     'earth-else':q(false)+chips(T)+`<div class="mk-less">Something else</div>`+chips(W),
     'will-after':q(true)+chips(W,'Temptation')+added(['Honour +6','Balance +1k0'],true)},
 v2:{will:q(true)+radios(W),earth:q(true)+radios(T)},
 v3:{will:q(false)+chips(W),earth:q(false)+chips(T),agi:''},
 v4:{will:QUIET,band:`<div class="mk-banner"><span><small>Opened from Balance</small><b>Resisting Temptation</b></span><button type="button">Change</button></div>`+added(['Honour +6','Balance +1k0'],true)},
 v5:{will:q(false)+chips(W)+less+chips(T,null,'dim'),earth:q(false)+chips(T)+less+chips(W,null,'dim'),agi:q(false)+less+chips(W.concat(T),null,'dim')}
};
const btn=t=>`<button type="button" class="ghost sit4528-btn">${t}</button>`;
const NOTE_BAL=`<p class="mk-rnote">When resisting Intimidation or Temptation: +1k0, with your Honour counted once. Choose the effect in the roll.</p>`;
const NOTE_CT=`<p class="mk-rnote">When someone tries to confuse or manipulate you: +1k0. Tick it in the roll.</p>`;
const CHOOSER=`<div class="mk-menu"><div class="mk-menu-h">Which roll did the GM ask for?</div><button type="button">Willpower</button><button type="button">Etiquette</button><button type="button">Another roll…</button></div>`;
// Per version: what sits on the ability's own card (Adv & Disadv page).
const ROWS={
 v1:{'Balance':NOTE_BAL,'Clear Thinker':NOTE_CT,'Touch of the Spirit Realms':`<div class="mk-row">${btn('Resist Taint')}</div>`},
 v3:{'Balance':`<div class="mk-row">${btn('Resist Intimidation')}${btn('Resist Temptation')}</div>`,'Clear Thinker':`<div class="mk-row">${btn('Resist confusion or manipulation')}</div>${CHOOSER}`,'Touch of the Spirit Realms':`<div class="mk-row">${btn('Resist Taint')}</div>`},
 v5:{'Balance':NOTE_BAL,'Clear Thinker':NOTE_CT}
};
const css=p=>p.evaluate(c=>{if(!document.getElementById('mk-css')){const s=document.createElement('style');s.id='mk-css';s.textContent=c;document.head.append(s);}},CSS);
// Take the resistance choices out of the app's list and put the mock-up in their place; every other choice stays as the app drew it.
async function inject(p,html){
 await css(p);
 await p.evaluate(([html,KEYS])=>{
  const dec=document.querySelector('.rd4515-declare');if(!dec)return;const head=dec.querySelector('.rd4515-head');
  dec.querySelectorAll('.mk-wrap').forEach(n=>n.remove());
  dec.querySelectorAll('label.rd4515-opt').forEach(l=>{const i=l.querySelector('input[data-rd4515-key]');if(i&&KEYS.includes(i.dataset.rd4515Key)){const n=l.nextElementSibling;if(n&&n.classList.contains('rd4515-opt-note'))n.remove();l.remove();}});
  dec.querySelectorAll('.rd4515-source').forEach(h=>{const n=h.nextElementSibling;if(!n||!n.classList.contains('rd4515-opt'))h.remove();});
  if(html){const w=document.createElement('div');w.className='mk-wrap';w.innerHTML=html;head.after(w);}
  const rest=dec.querySelector('.rd4515-source');if(rest)rest.classList.add('mk-rest');
 },[html,KEYS]);await settle(p);
}
const metrics=p=>p.evaluate(()=>{const dec=document.querySelector('.rd4515-declare'),go=document.getElementById('rollPreviewGo');const sc=go.closest('.roll-modal');const r=go.getBoundingClientRect();
 return {declareHeight:dec?Math.round(dec.getBoundingClientRect().height):0,rollButtonInViewAtOpen:r.bottom<=innerHeight&&r.bottom<=sc.getBoundingClientRect().bottom+0.5,scrollNeeded:Math.max(0,sc.scrollHeight-sc.clientHeight),
  others:dec?[...dec.querySelectorAll('label.rd4515-opt')].filter(l=>!l.closest('.mk-wrap')).length:0};});
async function declareShot(p,file){
 const vp=p.viewportSize();await p.setViewportSize({width:vp.width,height:2600});await settle(p);await p.waitForTimeout(150);
 await p.locator('.rd4515-declare').screenshot({path:path.join(out,file)});
 await p.setViewportSize(vp);await settle(p);await p.waitForTimeout(150);
}
async function openRoll(p,kind){
 await tab(p,'Rings & Traits');
 const sel=kind==='earth'?'.ring-name[data-ring-name="Earth"]':`.trait-row label[data-trait-name="${kind==='agi'?'Agility':'Willpower'}"]`;
 await p.locator(sel).first().click();
 await p.waitForSelector('#rollPreviewOverlay',{state:'visible'});await settle(p);await p.waitForTimeout(200);
}
async function closePreview(p){await p.locator('#rollPreviewClose').click();await p.waitForSelector('#rollPreviewOverlay',{state:'hidden'});await settle(p);}
async function scene(p,M,dev,ver,key){
 const kind=key.startsWith('earth')?'earth':key==='agi'?'agi':'will';
 await openRoll(p,kind);
 if(ver==='today'){M[`today-${key}`]=await metrics(p);await declareShot(p,`${dev}-today-${key}.png`);}
 else{await inject(p,P[ver][key]);M[`${ver}-${key}`]=await metrics(p);await declareShot(p,`${dev}-${ver}-${key}.png`);}
 await closePreview(p);
}
// The ability cards on the Adv & Disadv page, with each version's buttons or reminders placed where Wary's own button sits.
async function rows(p,dev,ver){
 await tab(p,'Adv & Disadv');await css(p);
 const vp=p.viewportSize();await p.setViewportSize({width:vp.width,height:3200});await settle(p);await p.waitForTimeout(200);
 const box=await p.evaluate(spec=>{
  const entries=[...document.querySelectorAll('#advList .entry')];const by=n=>entries.find(e=>(e.querySelector('.en-name')||{}).value===n);
  document.querySelectorAll('.mk-rowwrap').forEach(n=>n.remove());
  for(const [name,html] of Object.entries(spec)){const e=by(name);if(!e)continue;const w=document.createElement('div');w.className='mk-rowwrap';w.innerHTML=html;
   const anchor=e.querySelector('.adv-config-row')||e.querySelector('.sit4528-row')||e.querySelector('.entry-top');anchor.after(w);}
  const first=by('Balance'),last=by('Touch of the Spirit Realms');first.scrollIntoView({block:'start'});
  const a=first.getBoundingClientRect(),b=last.getBoundingClientRect();
  return {x:Math.max(0,a.left-6),y:Math.max(0,a.top-6),width:Math.min(innerWidth-Math.max(0,a.left-6),a.width+12),height:b.bottom-a.top+12};
 },ROWS[ver]);
 await settle(p);await p.waitForTimeout(150);
 await p.screenshot({path:path.join(out,`${dev}-${ver}-rows.png`),clip:box});
 await p.evaluate(()=>document.querySelectorAll('.mk-rowwrap').forEach(n=>n.remove()));
 await p.setViewportSize(vp);await settle(p);
}
async function honourCard(p,dev){
 await tab(p,'Identity');await css(p);
 const box=await p.evaluate(()=>{const c=document.querySelector('#cp7-section [data-cp7=honor]');const d=document.createElement('div');d.className='mk-hrow mk-rowwrap';
  d.innerHTML='<span class="mk-hlab">Resisting with your Honour</span><button type="button" class="ghost sit4528-btn">Resist Fear</button><button type="button" class="ghost sit4528-btn">Resist Intimidation</button><button type="button" class="ghost sit4528-btn">Resist Temptation</button>';
  c.append(d);c.scrollIntoView({block:'center'});const r=c.getBoundingClientRect();return {x:Math.max(0,r.left-6),y:Math.max(0,r.top-6),width:Math.min(innerWidth-Math.max(0,r.left-6),r.width+12),height:r.height+12};});
 await settle(p);await p.waitForTimeout(150);await p.screenshot({path:path.join(out,`${dev}-v4-honour.png`),clip:box});
 await p.evaluate(()=>document.querySelectorAll('.mk-rowwrap').forEach(n=>n.remove()));
}
async function device(b,phone){
 const dev=phone?'phone':'laptop',M=R[dev];
 const {c,p}=await open(b,phone,FXP,'Resistance mock-up');
 await p.evaluate(()=>{window.__L5R_TEST__.MODES12.set('play');window.__L5R_TEST__.RS15.paused=true;});await settle(p);
 if(phone){
  for(const k of ['will','earth','agi'])await scene(p,M,dev,'today',k);
  for(const k of ['will','earth','agi','earth-else','will-after'])await scene(p,M,dev,'v1',k);
  for(const k of ['will','earth'])await scene(p,M,dev,'v2',k);
  for(const k of ['will','earth','agi'])await scene(p,M,dev,'v3',k);
  await scene(p,M,dev,'v4','will');
  await openRoll(p,'will');await inject(p,P.v4.band);M['v4-band']=await metrics(p);await declareShot(p,`${dev}-v4-band.png`);await closePreview(p);
  for(const k of ['will','earth','agi'])await scene(p,M,dev,'v5',k);
  for(const v of ['v1','v3','v5'])await rows(p,dev,v);
  await honourCard(p,dev);
  // Version 1 in the whole preview when an Earth Ring roll opens.
  await openRoll(p,'earth');await inject(p,P.v1.earth);await p.screenshot({path:path.join(out,'phone-v1-earth-view.png')});await closePreview(p);
 }else{
  for(const v of ['v1','v2','v3','v5'])await scene(p,M,dev,v,'will');
  await openRoll(p,'will');await inject(p,P.v4.band);M['v4-band']=await metrics(p);await declareShot(p,`${dev}-v4-band.png`);await closePreview(p);
  await rows(p,dev,'v1');
 }
 M.errors=p.errors.slice();await c.close();
}
(async()=>{
 const b=await chromium.launch();
 await device(b,true);await device(b,false);
 await b.close();
 fs.writeFileSync(path.join(out,'combined.json'),JSON.stringify(R,null,1));
 for(const dev of ['phone','laptop']){console.log(dev);for(const [k,v] of Object.entries(R[dev])){if(v&&typeof v==='object'&&!Array.isArray(v))console.log('  '+k.padEnd(16)+' h='+String(v.declareHeight).padStart(4)+'  roll in view='+String(v.rollButtonInViewAtOpen).padEnd(5)+' scroll='+String(v.scrollNeeded).padStart(3)+' other choices='+v.others);}console.log('  errors',JSON.stringify(R[dev].errors));}
})().catch(e=>{console.error(e);process.exit(1);});
