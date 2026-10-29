'use strict';
// Moon Curse Full Moon (Release 7c, R26). node moon-harness.js <sheet.html>
// The Crab test character (Void 3, Willpower 2) with Lord Moon's Curse at Medium in place of its Disadvantages.
const {chromium}=require('playwright'),{pathToFileURL}=require('url'),path=require('path'),fs=require('fs');
const CRAB=JSON.parse(fs.readFileSync(path.join(__dirname,'7b1-checks-crab.l5r.json'),'utf8'));
CRAB.disadv=[{name:'Lord Moon’s Curse',cost:'5',desc:'',config:{type:'severityTier',value:'Medium'}}];
const TOTAL=13,results=[];
function check(id,got,want){if(results.some(r=>r.id===id))throw Error('Duplicate check '+id);const ok=JSON.stringify(got)===JSON.stringify(want);results.push({id,ok});console.log((ok?'PASS ':'FAIL ')+id+(ok?'':' actual='+String(JSON.stringify(got)).slice(0,500)+' expected='+String(JSON.stringify(want)).slice(0,400)));}
async function open(b){const p=await b.newPage({viewport:{width:1280,height:960}});p.setDefaultTimeout(8000);p.errors=[];p.on('pageerror',e=>p.errors.push(String(e)));p.on('dialog',d=>d.dismiss().catch(()=>{}));
await p.route('https://fonts.googleapis.com/**',r=>r.abort());await p.route('https://fonts.gstatic.com/**',r=>r.abort());
await p.goto(pathToFileURL(path.resolve(process.argv[2])).href,{waitUntil:'domcontentloaded',timeout:60000});
await p.waitForFunction(()=>{const T=window.__L5R_TEST__;return !!T&&!!window.__L5R_CAROUSEL__?.isReady?.()&&(!T.CL11||T.CL11.ready||T.CL11.enabled()===false)&&!document.querySelector('[id^=l5r-splash]');},null,{timeout:60000});
await p.evaluate(()=>{window.__L5R_TEST__.CL11?.close?.();});return p;}
async function load(p,data){await p.evaluate(async d=>{const T=window.__L5R_TEST__,$=id=>document.getElementById(id);
if(window.__lm7Random){Math.random=window.__lm7Random;}
for(const id of ['rollModalClose','rollPreviewCancel','appConfirmX'])if($(id)&&$(id).offsetParent)$(id).click();
T.resetToBaseline();T.applyData(d);T.recalcAll();T.MODES12.set('play');$('void_current').value='3';T.renderVoidPips();T.recalcAll();
const c=window.__L5R_CAROUSEL__;c.goToTab('Advantages');await c.whenSettled();},data||CRAB);}
const tick=async(p,on)=>{const t=p.locator('#disadvList .lm7-moon input[type=checkbox]');if(on)await t.check();else await t.uncheck();await p.waitForTimeout(200);};
const state=p=>p.evaluate(()=>{const $=id=>document.getElementById(id),row=document.querySelector('#disadvList .entry');let c={};try{c=JSON.parse(row.dataset.advConfig);}catch(e){}
const pips=Array.from(document.querySelectorAll('#voidPips .void-pip'));
return {void:$('void_current').value,pips:pips.length,moonFirst:!!pips[0]&&pips[0].classList.contains('lm7-moon-pip'),moonFilled:!!pips[0]&&pips[0].classList.contains('filled'),
filled:pips.filter(x=>x.classList.contains('filled')).length,moon:c.moon===true,status:($('statusMsg')||{}).textContent||'',quick:($('qaVoidValue')||{}).textContent||''};});
// The d10s show `faces` in turn: [1] fails anything; [10, 9] makes each die 19, passing TN 20 with two dice.
const dice=(p,faces)=>p.evaluate(f=>{if(!window.__lm7Random)window.__lm7Random=Math.random;let i=0;Math.random=()=>(f[i++%f.length]-1)/10+0.05;},faces);
async function roll(p){await p.locator('#disadvList .lm7-roll').click();await p.waitForSelector('#rollPreviewOverlay',{state:'visible',timeout:10000});
const title=await p.evaluate(()=>(document.getElementById('rollPreviewOverlay').textContent||'').includes('Lord Moon’s Curse — Willpower vs TN 20'));
await p.locator('#rollPreviewGo').click();await p.waitForSelector('#rollModalOverlay',{state:'visible',timeout:10000});await p.waitForTimeout(200);
await p.locator('#rollModalClose').click();await p.waitForTimeout(500);
const alert=await p.evaluate(()=>{const o=document.getElementById('appConfirmOverlay');return o&&getComputedStyle(o).display!=='none'?document.getElementById('appConfirmMsg').textContent:null;});
if(alert!==null)await p.locator('#appConfirmOk').click();await p.evaluate(()=>{if(window.__lm7Random)Math.random=window.__lm7Random;});return [title,alert];}
const CASES=[
['LM-ENABLED',async p=>p.evaluate(()=>{const T=window.__L5R_TEST__;return !!T.LM7&&T.LM7.enabled();}),true],
['LM-ROW-CONTROLS',async p=>{await load(p);return p.evaluate(()=>{const box=document.querySelector('#disadvList .lm7-moon');if(!box)return null;
 const t=box.querySelector('input[type=checkbox]'),b=box.querySelector('.lm7-roll');return [t.checked,t.disabled,b.textContent,b.disabled];});},[false,false,'Willpower roll (TN 20)',false]],
['LM-TICK-ADDS',async p=>{await load(p);await tick(p,true);const s=await state(p);return [s.void,s.pips,s.moonFirst,s.moonFilled,s.filled,s.moon,s.status];},
 ['4',4,true,true,4,true,'Lord Moon’s Curse: the full moon gives a Void Point until sunrise, spent last.']],
['LM-SPENT-LAST',async p=>{await load(p);await tick(p,true);const got=await p.evaluate(()=>{const T=window.__L5R_TEST__,out=[];
 for(let i=0;i<4;i++){T.consumeVoidPoint();const pips=document.querySelectorAll('#voidPips .void-pip');out.push([document.getElementById('void_current').value,pips[0].classList.contains('filled')]);}return out;});return got;},
 [['3',true],['2',true],['1',true],['0',false]]],
['LM-UNTICK-UNSPENT',async p=>{await load(p);await tick(p,true);await tick(p,false);const s=await state(p);return [s.void,s.pips,s.moonFirst,s.moon,s.status];},
 ['3',3,false,false,'Lord Moon’s Curse: sunrise. The moon’s Void Point was lost unspent.']],
['LM-UNTICK-SPENT',async p=>{await load(p);await tick(p,true);await p.evaluate(()=>{const T=window.__L5R_TEST__;for(let i=0;i<4;i++)T.consumeVoidPoint();});await tick(p,false);const s=await state(p);
 return [s.void,s.pips,s.status];},['0',3,'Lord Moon’s Curse: sunrise. The moon’s Void Point was spent.']],
['LM-PIP-CLICK',async p=>{await load(p);await tick(p,true);await p.locator('#voidPips .void-pip').last().click();await p.waitForTimeout(150);const a=await state(p);
 await p.locator('#voidPips .void-pip').last().click();await p.waitForTimeout(150);const b=await state(p);return [a.void,b.void,b.pips];},['3','4',4]],
['LM-SAVED',async p=>{await load(p);await tick(p,true);const data=await p.evaluate(()=>window.__L5R_TEST__.collectData());await load(p,CRAB);
 await p.evaluate(async d=>{const T=window.__L5R_TEST__;T.applyData(d);T.recalcAll();},data);const s=await state(p);
 const ticked=await p.evaluate(()=>document.querySelector('#disadvList .lm7-moon input[type=checkbox]').checked);return [s.void,s.pips,s.moon,ticked];},['4',4,true,true]],
['LM-QUICK',async p=>{await load(p);await tick(p,true);return p.evaluate(()=>{const T=window.__L5R_TEST__;if(typeof T.renderQuickAccessPanel==='function')T.renderQuickAccessPanel();
 return document.getElementById('qaVoidValue').textContent;});},'4 / 3 + the moon’s'],
['LM-ROLL-FAIL',async p=>{await load(p);await dice(p,[1]);return roll(p);},[true,'You failed to resist Lord Moon’s Curse. You lose control of your character for the night: the GM controls them until sunrise.']],
['LM-ROLL-PASS',async p=>{await load(p);await dice(p,[10,9]);return roll(p);},[true,null]],
['LM-LOGIC',async p=>p.evaluate(()=>{const L=window.__L5R_TEST__.LM7Logic;if(!L)return null;
 return [L.tn('Low'),L.tn('Medium'),L.tn('High'),L.tn('Extreme'),L.cap(3,true),L.cap(3,false),L.rise(0),L.set(4),L.set(0)];}),[15,20,25,null,4,3,1,3,0]],
];
(async()=>{const b=await chromium.launch();try{const p=await open(b);
for(const [id,fn,want] of CASES){let got;try{got=await fn(p);}catch(e){got={error:String(e.message).slice(0,300)};}check(id,got,want);}
check('LM-NO-ERRORS',p.errors,[]);}finally{await b.close();}
const n=results.filter(r=>r.ok).length;console.log(n+'/'+results.length+' checks passed');process.exitCode=n===TOTAL&&results.length===TOTAL?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
