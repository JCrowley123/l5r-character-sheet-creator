'use strict';
// Creation Cap of Four (Release 7c, R26; Core p.103). node cap-harness.js <sheet.html>
// The Crab test character (every Trait 2, Void 3) in the creation wizard's Rings & Traits and Skills steps.
const {chromium}=require('playwright'),{pathToFileURL}=require('url'),path=require('path'),fs=require('fs');
const CRAB=JSON.parse(fs.readFileSync(path.join(__dirname,'7b1-checks-crab.l5r.json'),'utf8'));
CRAB.fields.f_xpTotal='200';
const TOTAL=11,results=[],REFUSAL='At creation nothing goes above 4 (Core p.103).';
function check(id,got,want){if(results.some(r=>r.id===id))throw Error('Duplicate check '+id);const ok=JSON.stringify(got)===JSON.stringify(want);results.push({id,ok});console.log((ok?'PASS ':'FAIL ')+id+(ok?'':' actual='+String(JSON.stringify(got)).slice(0,500)+' expected='+String(JSON.stringify(want)).slice(0,400)));}
async function open(b){const p=await b.newPage({viewport:{width:1280,height:960}});p.setDefaultTimeout(8000);p.errors=[];p.on('pageerror',e=>p.errors.push(String(e)));p.on('dialog',d=>d.dismiss().catch(()=>{}));
await p.route('https://fonts.googleapis.com/**',r=>r.abort());await p.route('https://fonts.gstatic.com/**',r=>r.abort());
await p.goto(pathToFileURL(path.resolve(process.argv[2])).href,{waitUntil:'domcontentloaded',timeout:60000});
await p.waitForFunction(()=>{const T=window.__L5R_TEST__;return !!T&&!!window.__L5R_CAROUSEL__?.isReady?.()&&(!T.CL11||T.CL11.ready||T.CL11.enabled()===false)&&!document.querySelector('[id^=l5r-splash]');},null,{timeout:60000});
await p.evaluate(()=>{window.__L5R_TEST__.CL11?.close?.();});return p;}
// Loads the character and opens the wizard at the named step.
async function wizard(p,step){await p.evaluate(([d,s])=>{const T=window.__L5R_TEST__,W=T.CW112;W.close();
T.resetToBaseline();T.applyData(d);T.recalcAll();W.start();W.index=W.steps.findIndex(x=>x.id===s);W.render();},[CRAB,step]);}
const plus=(p,name)=>p.locator('.cw112-view button[aria-label="Raise '+name+'"]');
const row=(p,name)=>p.evaluate(n=>{const b=document.querySelector('.cw112-view button[aria-label="Raise '+n+'"]');if(!b)return null;
 return [b.closest('.cw112-trait').querySelector('.cw112-trait-val').textContent,b.disabled,b.title];},name);
const status=p=>p.evaluate(()=>(document.getElementById('statusMsg')||{}).textContent||'');
const cap=p=>p.evaluate(()=>window.__L5R_TEST__.validateCharacter().findings.filter(f=>f.id==='creation-cap').map(f=>[f.severity,f.title]));
const CASES=[
['RC-ENABLED',async p=>p.evaluate(()=>{const T=window.__L5R_TEST__;return !!T.RC7&&T.RC7.enabled();}),true],
['RC-IN-CREATION',async p=>{await p.evaluate(()=>window.__L5R_TEST__.CW112.close());const a=await p.evaluate(()=>window.__L5R_TEST__.RC7.inCreation());await wizard(p,'traits');
 const b=await p.evaluate(()=>window.__L5R_TEST__.RC7.inCreation());return [a,b];},[false,true]],
['RC-TRAIT-STOPS',async p=>{await wizard(p,'traits');await plus(p,'Willpower').click();await plus(p,'Willpower').click();return [await row(p,'Willpower'),
 await p.evaluate(()=>document.getElementById('trait_willpower').value)];},[['4',true,REFUSAL],'4']],
['RC-STEP-REFUSED',async p=>{await wizard(p,'traits');await p.evaluate(()=>{const W=window.__L5R_TEST__.CW112;W.stepTrait('trait_willpower',1);W.stepTrait('trait_willpower',1);W.stepTrait('trait_willpower',1);});
 return [await p.evaluate(()=>document.getElementById('trait_willpower').value),await status(p)];},['4',REFUSAL]],
['RC-VOID-STOPS',async p=>{await wizard(p,'traits');await plus(p,'Void').click();const a=await row(p,'Void');
 await p.evaluate(()=>window.__L5R_TEST__.CW112.stepTrait('ring_void',1));return [a,await p.evaluate(()=>document.getElementById('ring_void').value)];},[['4',true,REFUSAL],'4']],
['RC-LOWER-OK',async p=>{await wizard(p,'traits');await plus(p,'Willpower').click();await plus(p,'Willpower').click();
 await p.locator('.cw112-view button[aria-label="Lower Willpower"]').click();return row(p,'Willpower');},['3',false,'']],
['RC-SKILL-STOPS',async p=>{await wizard(p,'skills');const got=await p.evaluate(()=>{const T=window.__L5R_TEST__,tr=T.CW1121.addSkill('Kenjutsu','',false);
 const r=tr.querySelector('.sk-rank');r.value='3';r.dispatchEvent(new Event('input',{bubbles:true}));T.CW112.render();return !!tr;});
 await plus(p,'Kenjutsu').click();const a=await row(p,'Kenjutsu');
 await p.evaluate(()=>{const T=window.__L5R_TEST__,tr=Array.from(document.getElementById('skillsBody').rows).find(r=>r.querySelector('.sk-name').value==='Kenjutsu');T.CW1121.stepRank(tr,1);});
 const v=await p.evaluate(()=>Array.from(document.getElementById('skillsBody').rows).find(r=>r.querySelector('.sk-name').value==='Kenjutsu').querySelector('.sk-rank').value);
 return [got,a,v];},[true,['4',true,REFUSAL],'4']],
['RC-WARNING',async p=>{await wizard(p,'traits');await p.evaluate(()=>{const T=window.__L5R_TEST__,el=document.getElementById('trait_agility');el.value='5';el.dispatchEvent(new Event('input',{bubbles:true}));T.recalcAll();});
 return cap(p);},[['warning','Agility is 5, above 4 at creation']]],
['RC-AFTER-CREATION',async p=>{await wizard(p,'traits');await p.evaluate(()=>{const T=window.__L5R_TEST__,el=document.getElementById('trait_agility');el.value='5';el.dispatchEvent(new Event('input',{bubbles:true}));T.CW112.close();T.recalcAll();});
 return [await cap(p),await p.evaluate(()=>document.getElementById('trait_agility').value)];},[[],'5']],
['RC-LOGIC',async p=>p.evaluate(()=>{const L=window.__L5R_TEST__.RC7Logic;if(!L)return null;return [L.allows(3,1),L.allows(4,1),L.allows(4,-1),L.allows(5,0),L.over(4),L.over(5)];}),
 [true,false,true,true,false,true]],
];
(async()=>{const b=await chromium.launch();try{const p=await open(b);
for(const [id,fn,want] of CASES){let got;try{got=await fn(p);}catch(e){got={error:String(e.message).slice(0,300)};}check(id,got,want);}
await p.evaluate(()=>window.__L5R_TEST__.CW112.close());check('RC-NO-ERRORS',p.errors,[]);}finally{await b.close();}
const n=results.filter(r=>r.ok).length;console.log(n+'/'+results.length+' checks passed');process.exitCode=n===TOTAL&&results.length===TOTAL?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
