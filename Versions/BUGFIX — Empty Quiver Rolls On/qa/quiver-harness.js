'use strict';
// Empty Quiver Rolls On (Release 7c, R26). node quiver-harness.js <sheet.html>
// A Yumi that has fired before (its arrow type is set) with Kyujutsu 3, built through the sheet's own row makers.
const {chromium}=require('playwright'),{pathToFileURL}=require('url'),path=require('path');
const TOTAL=8,results=[];
const MESSAGE='You have no arrows: your quiver is empty. You can still roll the attack without one; nothing is spent.';
function check(id,got,want){if(results.some(r=>r.id===id))throw Error('Duplicate check '+id);const ok=JSON.stringify(got)===JSON.stringify(want);results.push({id,ok});console.log((ok?'PASS ':'FAIL ')+id+(ok?'':' actual='+String(JSON.stringify(got)).slice(0,500)+' expected='+String(JSON.stringify(want)).slice(0,400)));}
async function open(b){const p=await b.newPage({viewport:{width:1280,height:960}});p.setDefaultTimeout(8000);p.errors=[];p.on('pageerror',e=>p.errors.push(String(e)));p.on('dialog',d=>d.dismiss().catch(()=>{}));
await p.route('https://fonts.googleapis.com/**',r=>r.abort());await p.route('https://fonts.gstatic.com/**',r=>r.abort());
await p.goto(pathToFileURL(path.resolve(process.argv[2])).href,{waitUntil:'domcontentloaded',timeout:60000});
await p.waitForFunction(()=>{const T=window.__L5R_TEST__;return !!T&&!!window.__L5R_CAROUSEL__?.isReady?.()&&(!T.CL11||T.CL11.ready||T.CL11.enabled()===false)&&!document.querySelector('[id^=l5r-splash]');},null,{timeout:60000});
await p.evaluate(()=>{window.__L5R_TEST__.CL11?.close?.();});return p;}
// arrows: Willow Leaf arrows in Equipment (0: none, the bow's arrow type still set).
async function setup(p,arrows){await p.evaluate(a=>{const T=window.__L5R_TEST__,$=id=>document.getElementById(id);
for(const id of ['rollModalClose','rollPreviewCancel','appConfirmX','arrowPickClose'])if($(id)&&$(id).offsetParent)$(id).click();
T.resetToBaseline();$('skillsBody').innerHTML='';$('weaponsBody').innerHTML='';$('equipBody').innerHTML='';T.clearLastArrowUsed();
['agility','reflexes','strength','stamina','perception','awareness','intelligence','willpower'].forEach(k=>$('trait_'+k).value=3);
$('skillsBody').appendChild(T.makeSkillRow({name:'Kyujutsu',trait:(T.findSkill('Kyujutsu')||{}).trait||'',rank:3,emph:''}));
const L=T.findWeapon('Yumi');const row=$('weaponsBody').appendChild(T.makeWeaponRow({key:L.name,name:L.name,skill:L.skill,size:L.size,keywords:'',notes:'',roll:'',dmg:'',manualAttack:false,manualDamage:false}));
row.querySelector('.wp-arrow-type').value='Willow Leaf';if(a)T.addArrowToEquipment('Willow Leaf',a);T.recalcAll();
$('rollModalOverlay').style.display='none';},arrows);}
// Starts the attack, answers the range prompt, and leaves the arrow picker open.
async function begin(p){await p.evaluate(()=>{const T=window.__L5R_TEST__;window.__eq7Attack=T.rollWeaponAttack(document.querySelector('#weaponsBody tr'));});
await p.waitForTimeout(150);await p.evaluate(()=>{const r=document.getElementById('rangeOptWithin');if(r&&r.offsetParent)r.click();});
await p.waitForSelector('#arrowPickModalOverlay',{state:'visible',timeout:10000});}
// A picker opened a second time is closed, so a broken pass ends the attack instead of hanging it.
async function finish(p){await p.waitForTimeout(250);await p.evaluate(()=>{const o=document.getElementById('arrowPickModalOverlay');if(o&&o.style.display==='flex')document.getElementById('arrowPickClose').click();});await p.waitForTimeout(100);if(await p.evaluate(()=>{const o=document.getElementById('rollPreviewOverlay');return !!o&&getComputedStyle(o).display!=='none';}))await p.locator('#rollPreviewGo').click();
const done=await p.evaluate(async()=>await window.__eq7Attack);
return p.evaluate(d=>{const T=window.__L5R_TEST__,o=document.getElementById('rollModalOverlay');return {done:d,rolled:!!o&&getComputedStyle(o).display!=='none',
 qty:T.getArrowQuantity('Willow Leaf'),last:T.getLastArrowUsed()||null,status:(document.getElementById('statusMsg')||{}).textContent||''};},done);}
const picker=p=>p.evaluate(()=>{const b=document.getElementById('arrowPickBody'),e=b.querySelector('.arrow-opt-empty'),w=document.getElementById('eq7RollWithout');
 return [e?e.textContent:null,w?w.textContent:null,Array.from(b.querySelectorAll('.arrow-opt')).filter(x=>!x.disabled).length];});
const CASES=[
['EQ-ENABLED',async p=>p.evaluate(()=>{const T=window.__L5R_TEST__;return !!T.EQ7&&T.EQ7.enabled();}),true],
['EQ-EMPTY-OFFERS',async p=>{await setup(p,0);await begin(p);const got=await picker(p);await p.locator('#arrowPickClose').click();await finish(p);return got;},
 [MESSAGE,'Roll without an arrow',0]],
['EQ-ROLL-WITHOUT',async p=>{await setup(p,0);await begin(p);await p.locator('#eq7RollWithout').click();const s=await finish(p);return [s.done,s.rolled,s.qty,s.last];},[true,true,0,null]],
['EQ-CLOSE-CANCELS',async p=>{await setup(p,0);await begin(p);await p.locator('#arrowPickClose').click();const s=await finish(p);return [s.done,s.rolled,s.status];},
 [false,false,'Attack cancelled — no arrow nocked.']],
// Unchanged: with arrows, no extra button, and the chosen arrow is spent.
['EQ-WITH-ARROWS',async p=>{await setup(p,2);await begin(p);const got=await picker(p);await p.locator('#arrowOpt_'+await p.evaluate(()=>window.__L5R_TEST__.ARROW_LIBRARY.find(a=>a.name==='Willow Leaf').key)).click();
 const s=await finish(p);return [got[1],s.done,s.qty,s.last];},[null,true,1,'Willow Leaf']],
// The pass is read once: the next attack asks again.
['EQ-ONCE',async p=>{await setup(p,0);await begin(p);await p.locator('#eq7RollWithout').click();await finish(p);
 return p.evaluate(()=>{const T=window.__L5R_TEST__;return [T.EQ7.passing,T.ammoTrackingActive(document.querySelector('#weaponsBody tr'))];});},[null,true]],
['EQ-LOGIC',async p=>p.evaluate(()=>{const L=window.__L5R_TEST__.EQ7Logic;if(!L)return null;return [L.empty([0,0]),L.empty([0,2]),L.empty([]),L.empty([-1])];}),[true,false,true,true]],
];
(async()=>{const b=await chromium.launch();try{const p=await open(b);
for(const [id,fn,want] of CASES){let got;try{got=await fn(p);}catch(e){got={error:String(e.message).slice(0,300)};}check(id,got,want);}
check('EQ-NO-ERRORS',p.errors,[]);}finally{await b.close();}
const n=results.filter(r=>r.ok).length;console.log(n+'/'+results.length+' checks passed');process.exitCode=n===TOTAL&&results.length===TOTAL?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
