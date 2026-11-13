'use strict';
// Automatic-entries group: reproduction on main 60a5262a (= production) and scratch proposals, phone + laptop.
// Scratch only: no application file is edited; proposals are applied inside the test browser.
const {fs,path,chromium,KITSU,DENSE,sha,settle,tab,open}=require('./common.cjs');
const out=path.resolve(process.argv[2]);fs.mkdirSync(out,{recursive:true});
const R={source_sha256:sha,captured_utc:new Date().toISOString(),phone:{},laptop:{}};
const YOGO='Yogo Wardmaster [Shugenja]';
// ---- wizard helpers (from Phase 11.2.4's harness) ----
const title=p=>p.evaluate(()=>document.getElementById('cw112Title').textContent);
async function next(p){await p.waitForFunction(()=>!document.getElementById('cw112Next').disabled);await p.click('#cw112Next');}
async function toStep(p,w){for(let i=0;i<12&&(await title(p))!==w;i++)await next(p);}
async function exactPick(p,text){await p.locator('#cw112Body .cw112-card').filter({has:p.locator('.cw112-card-title',{hasText:new RegExp('^'+text.replace(/[[\]()]/g,'\\$&')+'$')})}).first().click();}
async function toSpells(p,school,clan,family){
 await p.evaluate(()=>document.getElementById('cl11Toolbar').click());await p.click('#cl11Create');
 await p.waitForFunction(()=>!document.getElementById('cw112View').hidden);await p.fill('#cw112Name','Test');await next(p);
 await exactPick(p,clan);await next(p);await exactPick(p,family);await next(p);await exactPick(p,school);await p.waitForTimeout(300);
 await p.waitForFunction(s=>window.__L5R_TEST__.CW112.appliedSchool()===s&&!window.__L5R_TEST__.CW112.busy,school);await toStep(p,'Spells');await settle(p);
}
const learned=p=>p.evaluate(()=>[...document.querySelectorAll('#techList .entry')].filter(d=>d.dataset.spellElement).map(d=>d.querySelector('.en-name').value));
const scrolls=p=>p.evaluate(()=>[...document.querySelectorAll('#equipBody .eq-name')].map(n=>n.value).filter(v=>/^Spell Scroll/.test(v)).map(v=>v.replace(/^Spell Scroll . /,'')));
async function clipShot(p,sels,file,pad=10){
 const box=await p.evaluate(([sels,pad])=>{const els=sels.map(s=>document.querySelector(s)).filter(Boolean);els[0].scrollIntoView({block:'start'});
  const rs=els.map(e=>e.getBoundingClientRect());const x=Math.max(0,Math.min(...rs.map(r=>r.left))-pad),y=Math.max(0,Math.min(...rs.map(r=>r.top))-pad);
  return{x,y,width:Math.min(innerWidth-x,Math.max(...rs.map(r=>r.right))+pad-x),height:Math.min(innerHeight-y,Math.max(...rs.map(r=>r.bottom))+pad-y)};},[sels,pad]);
 await settle(p);await p.screenshot({path:path.join(out,file),clip:box});return box;
}
// ---- unit 1: Yogo in the wizard ----
async function yogo(b,phone,dev,proposed){
 const {c,p}=await open(b,phone);
 if(proposed)await p.evaluate(y=>{const d=window.__L5R_TEST__.CW1124.table[y];d.given=['Sense','Commune','Summon'];
   d.text='Sense, Commune, Summon, 3 Ward spells, 3 other spells that are not Void spells';d.source='The Great Clans p.229';},YOGO);
 await toSpells(p,YOGO,'Scorpion','Yogo');
 await p.evaluate(()=>{const n=[...document.querySelectorAll('#cw112Body p.cw112-note')].find(n=>/ starts with /.test(n.textContent));if(n)n.id='xAllot';});
 const k=proposed?'proposed':'today';
 await clipShot(p,['#xAllot','.cw1123-given'],`${dev}-yogo-${k}.png`);
 R[dev]['yogo_'+k]={note:await p.evaluate(()=>document.getElementById('xAllot')?.textContent),given:await p.evaluate(()=>document.querySelector('.cw1123-given')?.innerText),
  learned:await learned(p),scrolls:await scrolls(p),errors:p.errors};
 await c.close();
}
// ---- unit 2: older Kitsu ----
const KITSU_DATA=JSON.parse(fs.readFileSync(KITSU,'utf8'));
const noSummon=JSON.parse(JSON.stringify(KITSU_DATA));noSummon.tech=noSummon.tech.filter(t=>t.name!=='Summon');noSummon.equip=noSummon.equip.filter(e=>!/Summon$/.test(e.name));
const NOSUM=path.join(out,'older-kitsu-no-summon.l5r.json');fs.writeFileSync(NOSUM,JSON.stringify(noSummon));
async function reviewState(p){return p.evaluate(()=>({check:[...document.querySelectorAll('#validationReport .vr-row')].map(r=>r.innerText.replace(/\s+/g,' ').trim()),
 groups:[...document.querySelectorAll('#sc8Body fieldset')].map(f=>({legend:f.querySelector('legend')?.textContent,items:[...f.querySelectorAll('input.oc8-spell')].map(i=>i.value)}))}));}
async function kitsuToday(b,phone,dev,fixture,k){
 const {c,p}=await open(b,phone,fixture,'Older Kitsu test character');
 await p.evaluate(()=>window.__L5R_TEST__.MODES12.set('management'));await tab(p,'Identity');
 await clipShot(p,['#validationReport'],`${dev}-check-${k}.png`,4);
 await p.getByRole('button',{name:'Review starting spells',exact:true}).click();await settle(p);await p.waitForTimeout(300);
 await p.locator('#sc8Dialog').screenshot({path:path.join(out,`${dev}-review-${k}.png`)});
 R[dev]['kitsu_'+k]=Object.assign(await reviewState(p),{errors:p.errors});
 await c.close();
}
// The proposed saved state, made with the sheet's own code: credit the given spells (and add a missing one), keep the rest pending.
async function mergedFixture(b,fixture,missing,file){
 const {c,p}=await open(b,false,fixture,'Older Kitsu test character');
 await p.evaluate(()=>window.__L5R_TEST__.MODES12.set('management'));await tab(p,'Identity');
 const before=await p.evaluate(()=>window.__L5R_TEST__.collectData());
 await p.getByRole('button',{name:'Review starting spells',exact:true}).click();await settle(p);
 await p.evaluate(()=>{document.querySelectorAll('input.oc8-spell').forEach(i=>{i.checked=['Sense','Commune','Summon'].includes(i.value);});});
 await p.locator('.oc8-confirm').click();await settle(p);
 if(missing){await p.locator('#cw1123AddGiven').click();await settle(p);}
 const after=await p.evaluate(()=>window.__L5R_TEST__.collectData());
 const given=n=>['Sense','Commune','Summon'].includes(n)||/Spell Scroll . (Sense|Commune|Summon)$/.test(n);
 const merged=JSON.parse(JSON.stringify(before));
 for(const f of ['tech','equip']){
  merged[f]=before[f].map(r=>given(r.name)?after[f].find(a=>a.name===r.name):r);
  after[f].forEach(a=>{if(given(a.name)&&!merged[f].some(r=>r.name===a.name))merged[f].push(a);});
 }
 fs.writeFileSync(file,JSON.stringify(merged));
 const res={afterGiven:after.tech.filter(t=>given(t.name)).map(t=>({name:t.name,keys:Object.keys(t)})),afterScrolls:after.equip.filter(e=>given(e.name)).map(e=>e.name),errors:p.errors};
 await c.close();return res;
}
async function kitsuProposed(b,phone,dev,fixture,k,note){
 const {c,p}=await open(b,phone,fixture,'Older Kitsu test character');
 await p.evaluate(()=>window.__L5R_TEST__.MODES12.set('management'));await tab(p,'Identity');
 await p.evaluate(([strong,detail])=>{const r=document.getElementById('validationReport'),first=r.querySelector('.vr-row');
  const row=document.createElement('div');row.className='vr-row vr-info';row.dataset.rule='x-given-credited';
  row.innerHTML='<span class="vr-badge vr-badge-info" title="Note">ℹ</span><span class="vr-text"><strong></strong><span class="vr-detail"></span></span>';
  row.querySelector('strong').textContent=strong;row.querySelector('.vr-detail').textContent=detail;first.before(row);
  const h=r.querySelector('.vr-head span');h.textContent=h.textContent.replace(/(\d+) notes/,(m,n)=>(Number(n)+1)+' notes');},note);
 await settle(p);await clipShot(p,['#validationReport'],`${dev}-check-${k}.png`,4);
 const state0=await reviewState(p);
 const btn=p.getByRole('button',{name:'Review starting spells',exact:true});
 if(await btn.count()){await btn.click();await settle(p);await p.waitForTimeout(300);
  await p.locator('#sc8Dialog').screenshot({path:path.join(out,`${dev}-review-${k}.png`)});}
 R[dev]['kitsu_'+k]=Object.assign(await reviewState(p),{checkBeforeOpen:state0.check,errors:p.errors});
 await c.close();
}
// ---- unit 3: Technique cards ----
const DENSE_FILE=path.join(out,'dense.l5r.json');fs.writeFileSync(DENSE_FILE,JSON.stringify(DENSE));
const CSS3=`
html body.x3 #techList > .entry.x3-auto > .rm-btn{display:none!important}
html body.x3 #techList > .entry.x3-auto > .entry-top > input.en-cost{display:none!important}
html body.x3 #techList > .entry.x3-auto:not([data-spell-element]) > .entry-top{padding-right:0!important}
html body.x3 #techList > .entry.x3-auto[data-spell-element] > .entry-top{padding-right:0!important}
html body.x3 #techList > .entry.x3-auto[data-spell-element] > .entry-top > .en-name{margin-right:0!important}
html body.x3 #techList > .entry.x3-auto:not([data-spell-element]) > .entry-top > .x3-tag{display:inline-flex;align-items:center;align-self:center;flex:0 0 auto;margin-left:8px;padding:2px 8px;border-radius:999px;background:rgba(90,77,49,.12);color:var(--ink-soft);font-family:'Noto Sans JP',sans-serif;font-size:.7rem;font-weight:700;line-height:1.5;white-space:nowrap}
`;
const CSS3B=`@media screen and (max-width:768px){
html body.x3 #techList > .entry.x3-auto:not([data-spell-element]) > .entry-top{flex-wrap:wrap;row-gap:6px}
html body.x3 #techList > .entry.x3-auto:not([data-spell-element]) > .entry-top > .en-name{flex:1 1 100%;min-width:0}
html body.x3 #techList > .entry.x3-auto:not([data-spell-element]) > .entry-top > .x3-tag{margin-left:auto}}`;
async function techCards(p){return p.evaluate(()=>[...document.querySelectorAll('#techList > .entry')].map(e=>{
 const vis=x=>!!x&&x.getClientRects().length>0&&getComputedStyle(x).display!=='none';const n=e.querySelector('.en-name'),cost=e.querySelector('.en-cost'),rm=e.querySelector(':scope > .rm-btn');
 return{name:n.value,spell:!!e.dataset.spellElement,desc:(e.querySelector('.en-desc')?.value||'').slice(0,48),nameW:Math.round(n.getBoundingClientRect().width),
  xp:vis(cost)?cost.value:null,remove:vis(rm),tag:(e.querySelector('.sn15-tag,.x3-tag')||{}).textContent||null,h:Math.round(e.getBoundingClientRect().height)};}));}
async function techs(b,phone,dev,proposed){
 const {c,p}=await open(b,phone,DENSE_FILE,DENSE.fields.f_name);
 await p.evaluate(()=>window.__L5R_TEST__.MODES12.set('management'));await tab(p,'Identity');
 // Both states start with the School's given spells credited (as the wizard, or unit 2, leaves them).
 const rev=p.getByRole('button',{name:'Review starting spells',exact:true});
 if(await rev.count()){await rev.click();await settle(p);
  await p.evaluate(()=>{document.querySelectorAll('input.oc8-spell').forEach(i=>{i.checked=['Sense','Commune','Summon'].includes(i.value);});});
  await p.locator('.oc8-confirm').click();await settle(p);await p.locator('#sc8Done').click();await settle(p);}
 await tab(p,'Techniques');
 // A Kiho and a Kata bought with XP, through the sheet's own picker, where this character may take one.
 const added=await p.evaluate(()=>{const sel=document.getElementById('techQuickAdd');
  const pick=kind=>{const o=[...sel.options].find(o=>o.value.startsWith(kind+':')&&!o.disabled);if(!o)return null;sel.value=o.value;sel.dispatchEvent(new Event('change',{bubbles:true}));return o.textContent.trim();};
  return{kiho:pick('kiho'),kata:pick('kata')};});
 await settle(p);
 if(proposed){await p.addStyleTag({content:CSS3+(proposed==='B'?CSS3B:'')});await p.evaluate(()=>{document.body.classList.add('x3');
  const given=(window.__L5R_TEST__.CW1123.forSchool(document.getElementById('f_school').value)||{given:[]}).given;
  document.querySelectorAll('#techList > .entry').forEach(e=>{const d=e.querySelector('.en-desc')?.value||'',n=e.querySelector('.en-name').value;
   const tech=/^\[(Advanced )?School Technique . Rank \d+, /.exec(d),cost=e.querySelector('.en-cost');
   if(tech&&(!cost||Number(cost.value||0)===0)){e.classList.add('x3-auto');const t=document.createElement('span');t.className='x3-tag';t.textContent=tech[1]?'Advanced School technique':'School technique';e.querySelector('.entry-top').append(t);}
   if(e.dataset.spellElement&&given.includes(n)&&e.querySelector('.sc8-source'))e.classList.add('x3-auto');});});await settle(p);}
 const k=proposed?'proposed'+(proposed==='B'?'-b':''):'today';
 await clipShot(p,['#techList > .entry:first-child','#techList > .entry:nth-child(2)'],`${dev}-tech-top-${k}.png`,6);
 await clipShot(p,['#techList > .entry:last-child'],`${dev}-tech-last-${k}.png`,6);
 const manage=await techCards(p);
 // Does every School, Path and Advanced School Technique name fit the first card's name box?
 const fit=await p.evaluate(()=>{const n=document.querySelector('#techList > .entry .en-name'),s=getComputedStyle(n);
  const ctx=document.createElement('canvas').getContext('2d');ctx.font=s.font;const room=n.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight);
  const T=window.__L5R_TEST__,names=new Set(),src=Object.keys(T).filter(k=>/SCHOOL|PATH|ADVANCED|allSchool/i.test(k));
  (T.allSchoolEntries?T.allSchoolEntries():[]).forEach(e=>(e.tech||[]).forEach(t=>names.add(typeof t==='string'?t:t.name)));
  const ALTERNATE_PATH_LIBRARY=T.ALTERNATE_PATH_LIBRARY||[],ADVANCED_SCHOOL_LIBRARY=T.ADVANCED_SCHOOL_LIBRARY||[];
  ALTERNATE_PATH_LIBRARY.forEach(a=>{if(a.tech)names.add(a.tech);});
  const walk=(v,inTech)=>{if(Array.isArray(v))v.forEach(x=>walk(x,inTech));else if(v&&typeof v==='object')Object.entries(v).forEach(([k,x])=>{if(inTech&&k==='name'&&typeof x==='string')names.add(x);else walk(x,inTech||/tech/i.test(k));});};
  walk(ADVANCED_SCHOOL_LIBRARY,false);
  const all=[...names].filter(Boolean),w=all.map(t=>[t,Math.ceil(ctx.measureText(t).width)]).sort((a,b)=>b[1]-a[1]);
  return{src,paths:ALTERNATE_PATH_LIBRARY.length,adv:ADVANCED_SCHOOL_LIBRARY.length,room:Math.round(room),count:all.length,over:w.filter(x=>x[1]>room).length,longest:w.slice(0,4)};});
 await p.evaluate(()=>window.__L5R_TEST__.MODES12.set('play'));await settle(p);
 await clipShot(p,['#techList > .entry:first-child'],`${dev}-tech-play-${k}.png`,6);
 const play=await techCards(p);
 R[dev]['tech_'+k]={added,manage,fit,play,errors:p.errors};
 await c.close();
}
(async()=>{const b=await chromium.launch();R.browser=b.version();try{
 const M_ALL=path.join(out,'proposed-kitsu-all.l5r.json'),M_MISS=path.join(out,'proposed-kitsu-missing.l5r.json');
 if(!process.env.ONLY){R.merge_all=await mergedFixture(b,KITSU,false,M_ALL);R.merge_missing=await mergedFixture(b,NOSUM,true,M_MISS);}
 console.log('merged');
 for(const [dev,phone] of [['phone',true],['laptop',false]]){
  if(!process.env.ONLY){await yogo(b,phone,dev,false);await yogo(b,phone,dev,true);console.log(dev,'yogo');
  await kitsuToday(b,phone,dev,KITSU,'today-all');await kitsuToday(b,phone,dev,NOSUM,'today-missing');
  await kitsuProposed(b,phone,dev,M_ALL,'proposed-all',['Kitsu Shugenja: Sense, Commune and Summon marked as your School’s spells','Every Kitsu Shugenja is given these three, so there was nothing to choose.']);
  await kitsuProposed(b,phone,dev,M_MISS,'proposed-missing',['Kitsu Shugenja: Sense and Commune marked as your School’s spells; Summon added','Every Kitsu Shugenja is given these three. Summon was missing, so it was added with its Spell Scroll.']);
  console.log(dev,'kitsu');}
  if(process.env.ONLY==='B'){await techs(b,phone,dev,'B');}else{await techs(b,phone,dev,false);await techs(b,phone,dev,'A');await techs(b,phone,dev,'B');}
  console.log(dev,'done');
 }
 fs.writeFileSync(path.join(out,'reproduction.json'),JSON.stringify(R,null,1)+'\n');
}finally{await b.close();}})().catch(e=>{console.error(e);fs.writeFileSync(path.join(out,'reproduction-partial.json'),JSON.stringify(R,null,1));process.exitCode=1;});
