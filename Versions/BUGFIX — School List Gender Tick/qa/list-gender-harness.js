'use strict';
// School List Gender Tick (Release 7b.1.1, device check D1). node list-gender-harness.js <sheet.html>
// Every School is chosen through the real list (Playwright selectOption), never by calling AS47.renderChoice().
const {chromium}=require('playwright'),{pathToFileURL}=require('url'),path=require('path'),fs=require('fs');
const MATSU=JSON.parse(fs.readFileSync(path.join(__dirname,'7b1-checks-matsu.l5r.json'),'utf8'));
const TOTAL=8,results=[];
function check(id,got,want){if(results.some(r=>r.id===id))throw Error('Duplicate check '+id);const ok=JSON.stringify(got)===JSON.stringify(want);results.push({id,ok});console.log((ok?'PASS ':'FAIL ')+id+(ok?'':' actual='+String(JSON.stringify(got)).slice(0,400)+' expected='+String(JSON.stringify(want)).slice(0,300)));}
async function open(b){const p=await b.newPage({viewport:{width:1280,height:960}});p.setDefaultTimeout(8000);p.errors=[];p.on('pageerror',e=>p.errors.push(String(e)));p.on('dialog',d=>d.dismiss().catch(()=>{}));
await p.route('https://fonts.googleapis.com/**',r=>r.abort());await p.route('https://fonts.gstatic.com/**',r=>r.abort());
await p.goto(pathToFileURL(path.resolve(process.argv[2])).href,{waitUntil:'domcontentloaded',timeout:60000});
await p.waitForFunction(()=>{const T=window.__L5R_TEST__;return !!T&&!!window.__L5R_CAROUSEL__?.isReady?.()&&(!T.CL11||T.CL11.ready||T.CL11.enabled()===false)&&!document.querySelector('[id^=l5r-splash]');},null,{timeout:60000});
await p.evaluate(()=>{window.__L5R_TEST__.CL11?.close?.();window.__L5R_TEST__.MODES12?.set('management');});return p;}
// The Matsu test character, in Management, on the Techniques page with no Advanced School chosen.
async function load(p){await p.evaluate(async d=>{const T=window.__L5R_TEST__;T.resetToBaseline();T.applyData(d);T.recalcAll();T.MODES12.set('management');
const c=window.__L5R_CAROUSEL__;c.goToTab('Techniques');await c.whenSettled();},MATSU);await p.locator('#advancedSchoolPicker').selectOption('');}
// As typed in Identity: the field's input event reaches the Advanced School panel's own listener.
const gender=(p,g)=>p.evaluate(g=>{const f=document.getElementById('f_gender');f.value=g;f.dispatchEvent(new Event('input',{bubbles:true}));},g);
const lion=async p=>{const v=await p.evaluate(()=>[...document.getElementById('advancedSchoolPicker').options].map(o=>o.value).find(v=>/^The Lion.s Pride$/.test(v))||'');await p.locator('#advancedSchoolPicker').selectOption(v);return v;};
const state=p=>p.evaluate(()=>{const b=document.querySelector('#advancedSchoolConfirmations input[value="lions-pride-female"]'),n=document.getElementById('gi7Note-lions-pride-female'),e=document.getElementById('advancedSchoolEnter');
return b?[b.checked,b.disabled,n?n.textContent:'',e?e.disabled:null]:null;});
const CASES=[
['GP-ENABLED',async p=>p.evaluate(()=>{const T=window.__L5R_TEST__;return !!T.GP7&&T.GP7.enabled();}),true],
['GP-FEMALE',async p=>{await load(p);await gender(p,'Female');await lion(p);return state(p);},[true,true,'Your Identity says Female, which meets this.',false]],
['GP-MALE',async p=>{await load(p);await gender(p,'Male');await lion(p);return state(p);},[false,false,'Your Identity says Male. Tick only if your GM agrees.',true]],
['GP-EMPTY',async p=>{await load(p);await gender(p,'');await lion(p);return state(p);},[false,false,'Or enter the Gender in Identity.',true]],
// Choosing another School and back paints the new boxes once, with one line.
['GP-ONE-NOTE',async p=>{await load(p);await gender(p,'Female');await lion(p);await p.locator('#advancedSchoolPicker').selectOption('');await lion(p);
return p.evaluate(()=>[document.querySelectorAll('#gi7Note-lions-pride-female').length,!!document.querySelector('#advancedSchoolConfirmations input[value="lions-pride-female"]:checked')]);},[1,true]],
// Unchanged: the player's own tick still opens Begin training.
['GP-MALE-TICK',async p=>{await load(p);await gender(p,'Male');await lion(p);await p.locator('#advancedSchoolConfirmations input[value="lions-pride-female"]').check();
return p.evaluate(()=>document.getElementById('advancedSchoolEnter').disabled);},false],
// Unchanged: a Gender typed after the School is chosen paints the box, as before this layer.
['GP-GENDER-EDIT',async p=>{await load(p);await gender(p,'');await lion(p);await gender(p,'Female');return state(p);},[true,true,'Your Identity says Female, which meets this.',false]],
];
(async()=>{const b=await chromium.launch();try{const p=await open(b);
for(const [id,fn,want] of CASES){let got;try{got=await fn(p);}catch(e){got={error:String(e.message).slice(0,300)};}check(id,got,want);}
check('GP-NO-ERRORS',p.errors,[]);}finally{await b.close();}
const n=results.filter(r=>r.ok).length;console.log(n+'/'+results.length+' checks passed');process.exitCode=n===TOTAL&&results.length===TOTAL?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
