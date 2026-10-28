'use strict';
// Void Raise Not on Initiative (owner ruling R7, 23 October 2026). node void-raise-harness.js <sheet.html>
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
"VR-INIT-NO-K1",
"if(!T.VR7||!T.VR7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');T.setVoidPending({});T.resetCombatRound();T.setCombatActive(false);$('void_current').value='3';T.renderVoidPips();T.setVoidPending({k1:true});return T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.INITIATIVE,{traitValue:3,insightRank:1})).map(m=>m.label).includes('Void: +1k1');",
false
],
[
"VR-SKILL-K1",
"if(!T.VR7||!T.VR7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');T.setVoidPending({});T.resetCombatRound();T.setCombatActive(false);$('void_current').value='3';T.renderVoidPips();T.setVoidPending({k1:true});return T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.SKILL,{skillName:'Athletics',skillRank:2,traitName:'Strength',traitValue:2})).map(m=>m.label).includes('Void: +1k1');",
true
],
[
"VR-RING-K1",
"if(!T.VR7||!T.VR7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');T.setVoidPending({});T.resetCombatRound();T.setCombatActive(false);$('void_current').value='3';T.renderVoidPips();T.setVoidPending({k1:true});return T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.RING,{ringName:'Earth',ringValue:2})).map(m=>m.label).includes('Void: +1k1');",
true
],
[
"VR-STAYS-ARMED",
"if(!T.VR7||!T.VR7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');T.setVoidPending({});T.resetCombatRound();T.setCombatActive(false);$('void_current').value='3';T.renderVoidPips();T.setVoidPending({k1:true});const used=T.consumeVoidOneRollEffects({applied:T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.INITIATIVE,{traitValue:3,insightRank:1}))});return [used,!!T.getVoidPending().k1];",
[
false,
true
]
],
[
"VR-SKILL-SPENDS",
"if(!T.VR7||!T.VR7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');T.setVoidPending({});T.resetCombatRound();T.setCombatActive(false);$('void_current').value='3';T.renderVoidPips();T.setVoidPending({k1:true});const used=T.consumeVoidOneRollEffects({applied:T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.SKILL,{skillName:'Athletics',skillRank:2,traitName:'Strength',traitValue:2}))});return [used,!!T.getVoidPending().k1];",
[
true,
false
]
],
[
"VR-INIT-TEN",
"if(!T.VR7||!T.VR7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');T.setVoidPending({});T.resetCombatRound();T.setCombatActive(false);$('void_current').value='3';T.renderVoidPips();T.setCombatActive(true);$('voidInitSkirmish').value='1';T.setVoidPending({k1:true});const l=T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.INITIATIVE,{traitValue:3,insightRank:1})).map(m=>m.label);return [l.includes('Void: +10 Initiative'),l.includes('Void: +1k1')];",
[
true,
false
]
],
[
"VR-PREVIEW-INIT",
"if(!T.VR7||!T.VR7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');T.setVoidPending({});T.resetCombatRound();T.setCombatActive(false);$('void_current').value='3';T.renderVoidPips();const done=T.rollWithModifiers('Probe',T.makeRollContext(T.ROLL_KINDS.INITIATIVE,{traitValue:3,insightRank:1}),3,2);await sleep(300);const body=$('rollPreviewBody').textContent;$('rollPreviewCancel').click();await done;return /\\+1k1/.test(body);",
false
],
[
"VR-PREVIEW-RING",
"if(!T.VR7||!T.VR7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');T.setVoidPending({});T.resetCombatRound();T.setCombatActive(false);$('void_current').value='3';T.renderVoidPips();const done=T.rollWithModifiers('Probe',T.makeRollContext(T.ROLL_KINDS.RING,{ringName:'Earth',ringValue:2}),3,2);await sleep(300);const body=$('rollPreviewBody').textContent;$('rollPreviewCancel').click();await done;return /\\+1k1/.test(body);",
true
],
[
"VR-TOUCH-INIT",
"if(!T.VR7||!T.VR7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');T.setVoidPending({});T.resetCombatRound();T.setCombatActive(false);$('void_current').value='3';T.renderVoidPips();$('disadvList').appendChild(T.makeEntry({name:'Touch of the Void',cost:3},true));T.recalcAll();T.setVoidPending({k1:true});return T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.INITIATIVE,{traitValue:3,insightRank:1})).map(m=>m.label).some(x=>/Touch of the Void/.test(x));",
false
],
[
"VR-TOUCH-SKILL",
"if(!T.VR7||!T.VR7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');T.setVoidPending({});T.resetCombatRound();T.setCombatActive(false);$('void_current').value='3';T.renderVoidPips();$('disadvList').appendChild(T.makeEntry({name:'Touch of the Void',cost:3},true));T.recalcAll();T.setVoidPending({k1:true});return T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.SKILL,{skillName:'Athletics',skillRank:2,traitName:'Strength',traitValue:2})).map(m=>m.label).some(x=>/Touch of the Void/.test(x));",
true
],
[
"VR-TOUCH-PREVIEW",
"if(!T.VR7||!T.VR7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');T.setVoidPending({});T.resetCombatRound();T.setCombatActive(false);$('void_current').value='3';T.renderVoidPips();$('disadvList').appendChild(T.makeEntry({name:'Touch of the Void',cost:3},true));T.recalcAll();const done=T.rollWithModifiers('Probe',T.makeRollContext(T.ROLL_KINDS.INITIATIVE,{traitValue:3,insightRank:1}),3,2);await sleep(300);const body=$('rollPreviewBody').textContent;$('rollPreviewCancel').click();await done;return /\\+1k1/.test(body);",
false
]
];
(async()=>{const b=await chromium.launch();try{const p=await open(b);
for(const k of CHECKS){if(k[0]==='@viewport'){await p.setViewportSize({width:k[1],height:k[2]});continue;}await c(p,k[0],k[1],k[2]);}
check('VR-NO-ERRORS',p.errors,[]);}finally{await b.close();}
const n=results.filter(r=>r.ok).length;console.log(n+'/'+results.length+' checks passed');process.exitCode=n===TOTAL&&results.length===TOTAL?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
