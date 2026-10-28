'use strict';
// Ancestor Gifts Used and Favour (owner ruling R25, 23 October 2026). node ancestor-gifts-harness.js <sheet.html>
const {chromium}=require('playwright'),{pathToFileURL}=require('url'),path=require('path');
const TOTAL=12,results=[];
function check(id,got,want){if(results.some(r=>r.id===id))throw Error('Duplicate check '+id);const ok=JSON.stringify(got)===JSON.stringify(want);results.push({id,ok});console.log((ok?'PASS ':'FAIL ')+id+(ok?'':' actual='+String(JSON.stringify(got)).slice(0,400)+' expected='+String(JSON.stringify(want)).slice(0,300)));}
async function open(b){const p=await b.newPage({viewport:{width:1280,height:960}});p.setDefaultTimeout(8000);p.errors=[];p.on('pageerror',e=>p.errors.push(String(e)));p.on('dialog',d=>d.dismiss().catch(()=>{}));
await p.route('https://fonts.googleapis.com/**',r=>r.abort());await p.route('https://fonts.gstatic.com/**',r=>r.abort());
await p.goto(pathToFileURL(path.resolve(process.argv[2])).href,{waitUntil:'domcontentloaded',timeout:60000});
await p.waitForFunction(()=>{const T=window.__L5R_TEST__;return !!T&&!!window.__L5R_CAROUSEL__?.isReady?.()&&(!T.CL11||T.CL11.ready||T.CL11.enabled()===false)&&!document.querySelector('[id^=l5r-splash]');},null,{timeout:60000});
await p.evaluate(()=>{window.__L5R_TEST__.CL11?.close?.();window.__L5R_TEST__.MODES12?.set('management');});return p;}
async function c(p,id,src,want){let got;try{got=await p.evaluate(async src=>{const T=window.__L5R_TEST__,$=id=>document.getElementById(id),sleep=ms=>new Promise(r=>setTimeout(r,ms));return await eval('(async()=>{'+src+'})()');},src);}catch(e){got={error:String(e.message).slice(0,300)};}check(id,got,want);}
const CHECKS=[
[
"AG-SETUP",
"if(!T.AG7||!T.AG7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');$('f_clan').value='Crab';T.recalcAll();const chosen=await T.ANC48.choose('Kuni');T.recalcAll();await sleep(20);return [chosen,T.ANC48.current()&&T.ANC48.current().name];",
[
true,
"Kuni"
]
],
[
"AG-READY",
"if(!T.AG7||!T.AG7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');$('f_clan').value='Crab';T.recalcAll();const chosen=await T.ANC48.choose('Kuni');T.recalcAll();await sleep(20);const ctx=T.makeRollContext(T.ROLL_KINDS.SPELL,{spellName:'Probe'});T.RD4515.start(ctx);const o=()=>T.RD4515.offered(ctx).find(x=>x.key==='ancestors:kuni-cast');return [o().label.endsWith(' — used this session'),!!o().used];",
[
false,
false
]
],
[
"AG-USED-LABEL",
"if(!T.AG7||!T.AG7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');$('f_clan').value='Crab';T.recalcAll();const chosen=await T.ANC48.choose('Kuni');T.recalcAll();await sleep(20);T.ANC48.useSession();const ctx=T.makeRollContext(T.ROLL_KINDS.SPELL,{spellName:'Probe'});T.RD4515.start(ctx);const o=()=>T.RD4515.offered(ctx).find(x=>x.key==='ancestors:kuni-cast');return [o().label.endsWith(' — used this session'),o().note];",
[
true,
"Used this session. It is ready again after Reset session on the Ancestor card (Clan & School)."
]
],
[
"AG-USED-DISABLED",
"if(!T.AG7||!T.AG7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');$('f_clan').value='Crab';T.recalcAll();const chosen=await T.ANC48.choose('Kuni');T.recalcAll();await sleep(20);T.ANC48.useSession();const ctx=T.makeRollContext(T.ROLL_KINDS.SPELL,{spellName:'Probe'});T.RD4515.start(ctx);const o=()=>T.RD4515.offered(ctx).find(x=>x.key==='ancestors:kuni-cast');return T.RD4515.html(ctx).includes('data-rd4515-key=\"ancestors:kuni-cast\" disabled');",
true
],
[
"AG-USED-NO-TOGGLE",
"if(!T.AG7||!T.AG7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');$('f_clan').value='Crab';T.recalcAll();const chosen=await T.ANC48.choose('Kuni');T.recalcAll();await sleep(20);T.ANC48.useSession();const ctx=T.makeRollContext(T.ROLL_KINDS.SPELL,{spellName:'Probe'});T.RD4515.start(ctx);const o=()=>T.RD4515.offered(ctx).find(x=>x.key==='ancestors:kuni-cast');return [T.RD4515.toggle('ancestors:kuni-cast',true),T.RD4515.armed(ctx)];",
[
false,
[]
]
],
[
"AG-RESET",
"if(!T.AG7||!T.AG7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');$('f_clan').value='Crab';T.recalcAll();const chosen=await T.ANC48.choose('Kuni');T.recalcAll();await sleep(20);T.ANC48.useSession();T.ANC48.resetSession();const ctx=T.makeRollContext(T.ROLL_KINDS.SPELL,{spellName:'Probe'});T.RD4515.start(ctx);const o=()=>T.RD4515.offered(ctx).find(x=>x.key==='ancestors:kuni-cast');return [o().label.endsWith(' — used this session'),T.RD4515.toggle('ancestors:kuni-cast',true)];",
[
false,
true
]
],
[
"AG-PAID-HERE",
"if(!T.AG7||!T.AG7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');$('f_clan').value='Crab';T.recalcAll();const chosen=await T.ANC48.choose('Kuni');T.recalcAll();await sleep(20);T.ANC48.useSession();const ctx=T.makeRollContext(T.ROLL_KINDS.SPELL,{spellName:'Probe'});T.RD4515.start(ctx);const o=()=>T.RD4515.offered(ctx).find(x=>x.key==='ancestors:kuni-cast');T.ANC48.paidContext=ctx;const r=!!o().used;T.ANC48.paidContext=null;return r;",
false
],
[
"AG-LOGIC",
"if(!T.AG7||!T.AG7.enabled())return null;const s={v:1,name:'Kuni',lost:false,regained:false,final:false,gm:false};return [['kept','lost','regained','final'].map(k=>T.ANC48.valid(T.AG7Logic.set(s,k,false))),T.AG7Logic.allowed(true),T.AG7Logic.set(s,'lost',true)];",
[
[
true,
true,
true,
true
],
[
"kept",
"final"
],
null
]
],
[
"AG-EDIT-SHOWN",
"if(!T.AG7||!T.AG7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');$('f_clan').value='Crab';T.recalcAll();const chosen=await T.ANC48.choose('Kuni');T.recalcAll();await sleep(20);const s=$('ag7FavourEdit');return s?[[...s.options].map(x=>x.value),s.value]:null;",
[
[
"kept",
"lost",
"regained",
"final"
],
"kept"
]
],
[
"AG-EDIT-SETS",
"if(!T.AG7||!T.AG7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');$('f_clan').value='Crab';T.recalcAll();const chosen=await T.ANC48.choose('Kuni');T.recalcAll();await sleep(20);const pick=v=>{const s=$('ag7FavourEdit');s.value=v;s.dispatchEvent(new Event('change',{bubbles:true}));};pick('final');const a=T.ANC48.current();pick('kept');const b=T.ANC48.current();return [[a.lost,a.regained,a.final],[b.lost,b.regained,b.final,T.ANC48.locked(b)]];",
[
[
true,
true,
true
],
[
false,
false,
false,
false
]
]
],
[
"AG-PLAY-HIDDEN",
"if(!T.AG7||!T.AG7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');$('f_clan').value='Crab';T.recalcAll();const chosen=await T.ANC48.choose('Kuni');T.recalcAll();await sleep(20);T.MODES12.set('play');await sleep(20);const r=[getComputedStyle($('ag7Favour')).display,$('ag7FavourEdit').disabled];T.MODES12.set('management');return r;",
[
"none",
true
]
]
];
(async()=>{const b=await chromium.launch();try{const p=await open(b);
for(const k of CHECKS){if(k[0]==='@viewport'){await p.setViewportSize({width:k[1],height:k[2]});continue;}await c(p,k[0],k[1],k[2]);}
check('AG-NO-ERRORS',p.errors,[]);}finally{await b.close();}
const n=results.filter(r=>r.ok).length;console.log(n+'/'+results.length+' checks passed');process.exitCode=n===TOTAL&&results.length===TOTAL?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
