'use strict';
// Moon Resist Label (Release 7c.1, the owner's 7c device checks). node moon-label-harness.js <sheet.html>
// The Crab test character (Void 3, Willpower 2) with Lord Moon's Curse at Medium in place of its Disadvantages.
const {chromium}=require('playwright'),{pathToFileURL}=require('url'),path=require('path'),fs=require('fs');
const CRAB=JSON.parse(fs.readFileSync(path.join(__dirname,'7b1-checks-crab.l5r.json'),'utf8'));
CRAB.disadv=[{name:'Lord Moon’s Curse',cost:'5',desc:'',config:{type:'severityTier',value:'Medium'}}];
const TOTAL=5,results=[];
const HOTEI={name:'Seven Fortunes’ Curse',cost:'6',desc:'',config:{type:'fortunePick',fortune:'Hotei',value:'Hotei'}};
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
const label=p=>p.evaluate(()=>{const b=document.querySelector('#disadvList .lm7-roll');return b?b.textContent:null;});
const level=(p,value)=>p.evaluate(v=>{const T=window.__L5R_TEST__,div=document.querySelector('#disadvList .entry');T.writeAdvConfig(div,'severityTier',{value:v});T.recalcAll();},value);
const CASES=[
['MR-ENABLED',async p=>p.evaluate(()=>{const T=window.__L5R_TEST__;return !!T.MR7&&T.MR7.enabled();}),true],
['MR-LABEL',async p=>{await load(p);return label(p);},'Resist Lord Moon (TN 20)'],
// The TN follows the row's level, and the label survives the moon's tick redrawing the row.
['MR-FOLLOWS-LEVEL',async p=>{await load(p);await level(p,'High');const high=await label(p);await level(p,'Low');const low=await label(p);
 await tick(p,true);const ticked=await label(p);return [high,low,ticked];},['Resist Lord Moon (TN 25)','Resist Lord Moon (TN 15)','Resist Lord Moon (TN 15)']],
// Unchanged: the button opens the same Willpower roll.
['MR-SAME-ROLL',async p=>{await load(p);await p.locator('#disadvList .lm7-roll').click();await p.waitForSelector('#rollPreviewOverlay',{state:'visible',timeout:10000});
 const t=await p.evaluate(()=>(document.getElementById('rollPreviewOverlay').textContent||'').includes('Lord Moon’s Curse — Willpower vs TN 20'));await p.locator('#rollPreviewCancel').click();return t;},true],
];
(async()=>{const b=await chromium.launch();try{const p=await open(b);
for(const [id,fn,want] of CASES){let got;try{got=await fn(p);}catch(e){got={error:String(e.message).slice(0,300)};}check(id,got,want);}
check('MR-NO-ERRORS',p.errors,[]);}finally{await b.close();}
const n=results.filter(r=>r.ok).length;console.log(n+'/'+results.length+' checks passed');process.exitCode=n===TOTAL&&results.length===TOTAL?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
