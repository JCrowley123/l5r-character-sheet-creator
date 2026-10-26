'use strict';
const {chromium}=require('playwright'),{pathToFileURL}=require('url'),path=require('path');
const results=[];const TOTAL=26;
function check(id,got,want){const ok=JSON.stringify(got)===JSON.stringify(want);results.push(ok);console.log((ok?'PASS ':'FAIL ')+id+(ok?'':' actual='+JSON.stringify(got)+' expected='+JSON.stringify(want)));}
(async()=>{const b=await chromium.launch();const errors=[];try{const p=await b.newPage({viewport:{width:390,height:844}});p.on('pageerror',e=>errors.push(String(e)));await p.goto(pathToFileURL(path.resolve(process.argv[2])).href);await p.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready,null,{timeout:60000});
await p.evaluate(async()=>{const T=window.__L5R_TEST__;if(T.CL11.isOpen())T.CL11.close();T.resetToBaseline();T.MODES12.set('management');await document.fonts.ready;const C=window.__L5R_CAROUSEL__;C.goToTab('Identity');await C.whenSettled();});
async function feature(id,source,want){let got;try{got=await p.evaluate(s=>{const T=window.__L5R_TEST__,A=T.TA7,L=T.TA7Logic;if(!A?.enabled())return null;return eval(s);},source);}catch(e){got=String(e);}check(id,got,want);}
await feature('TA-DEFAULT','A.read()',{rank:0,points:0});
await feature('TA-CARRY','L.normalize(0,10)',{rank:1,points:0});
await feature('TA-BORROW','L.normalize(2,-1)',{rank:1,points:9});
await feature('TA-FLOOR','L.normalize(0,-2)',{rank:0,points:0});
await feature('TA-INVALID',"[L.normalize(1,1.5),L.fromScore(''),L.fromScore(-1)]",[null,null,null]);
await feature('TA-SEEDS',"L.growth({rank:0,points:1})",{tn:5,interval:'monthly',label:'Seeds of Darkness'});
await feature('TA-TABLE',"[1,2,3,4].map(rank=>L.growth({rank,points:9}).tn)",[10,15,20,25]);
await feature('TA-UNSUPPORTED',"[L.growth({rank:0,points:0}),L.growth({rank:5,points:0})]",[null,null]);
await feature('TA-OLD-SAVE',"(()=>{const d=T.collectData();d.fields.f_taint='2';T.applyData(d);return A.read()})()",{rank:2,points:0});
await feature('TA-FRACTIONAL-SAVE',"(()=>{const d=T.collectData();d.fields.f_taint='0.3';T.applyData(d);return [A.read(),T.collectData().fields.f_taint]})()",[{rank:0,points:3},'0.3']);
await feature('TA-ROUNDTRIP',"(()=>{A.write(1,9);const d=T.collectData();T.resetToBaseline();T.applyData(d);return [A.read(),d.schemaVersion,'ta7-rank' in d.fields]})()",[{rank:1,points:9},await p.evaluate(()=>window.__L5R_TEST__.WM7?.enabled()?7:6),false]);
await feature('TA-READERS',"(()=>{A.write(0,9);return [T.ANC48.taint(),T.TR4524.taint()]})()",[0.9,0]);
await feature('TA-POINT-GAIN',"(()=>{A.write(1,9);A.addPoints(1);return [A.read(),document.getElementById('f_taint').value]})()",[{rank:2,points:0},'2']);
await feature('TA-TEA-SCOPE',"[A.provider.offers({kind:T.ROLL_KINDS.RING,ringName:'Earth'}).length,A.provider.modifiers({kind:T.ROLL_KINDS.RING,ringName:'Earth',ta7Growth:true},['tea']).map(x=>[x.rolledDelta,x.keptDelta,x.totalDelta])]",[0,[[2,2,0]]]);
await feature('TA-PIP-CLICK',"(()=>{A.write(0,0);document.querySelectorAll('.ta7-pips button')[8].click();return A.read()})()",{rank:0,points:9});
await feature('TA-PIP-CLEAR',"(()=>{document.querySelectorAll('.ta7-pips button')[8].click();return A.read()})()",{rank:0,points:0});
await feature('TA-PLAY',"(()=>{T.MODES12.set('play');return [document.getElementById('ta7-rank').readOnly,document.getElementById('ta7-points').readOnly]})()",[false,false]);
await p.setViewportSize({width:320,height:800});await p.evaluate(async()=>{await document.fonts.ready;await new Promise(requestAnimationFrame)});
await feature('TA-PHONE',"(()=>{const bs=[...document.querySelectorAll('.ta7-pips button')].map(b=>b.getBoundingClientRect());return bs.length===9&&bs.every(x=>x.width>0&&x.height>=44&&Math.abs(x.y-bs[0].y)<1)})()",true);
const present=await p.evaluate(()=>!!window.__L5R_TEST__.TA7?.enabled());
async function roll(tea,random){await p.evaluate(({random})=>{const T=window.__L5R_TEST__;T.TA7.write(0,1);Math.random=()=>random;T.TA7.growthCheck();},{random});await p.locator('#rollPreviewGo').waitFor({state:'visible'});const tick=p.locator('[data-rd4515-key="taint-growth:tea"]');const unchecked=!(await tick.isChecked());if(tea)await tick.check();await p.locator('#rollPreviewGo').click();await p.locator('#rollModalClose').waitFor({state:'visible'});const count=await p.locator('#rollDiceRow .roll-die').count();await p.locator('#rollModalClose').click();const state=await p.evaluate(()=>window.__L5R_TEST__.TA7.read());return {unchecked,count,state};}
if(present){
 await p.evaluate(()=>{const T=window.__L5R_TEST__;T.resetToBaseline();T.TA7.write(0,1);T.TA7.growthCheck();});await p.locator('#rollPreviewGo').waitFor({state:'visible'});
 check('TA-PREVIEW-TN',(await p.locator('#rollPreviewOverlay').textContent()).includes('TN 5'),true);
 await p.locator('#rollPreviewCancel').click();check('TA-CANCEL',await p.evaluate(()=>window.__L5R_TEST__.TA7.read()),{rank:0,points:1});
 check('TA-FAILURE',await roll(false,0),{unchecked:true,count:2,state:{rank:0,points:2}});
 check('TA-SUCCESS',await roll(false,.8),{unchecked:true,count:2,state:{rank:0,points:1}});
 check('TA-TEA-REAL-ROLL',await roll(true,.8),{unchecked:true,count:4,state:{rank:0,points:1}});
 await p.evaluate(()=>{const T=window.__L5R_TEST__;T.resetToBaseline();T.TA7.write(1,9);Math.random=()=>.8;const e=T.makeEntry({name:'Taint gain fixture',spellElement:'fire',spellMastery:1,spellIsMaho:true},true,'XP');document.getElementById('techList').appendChild(e);T.recalcAll();e.querySelector('.spell-cast-btn').click();});
 await p.locator('#appConfirmCancel').click();await p.locator('#rollPreviewGo').click();await p.locator('#rollModalClose').click();
 check('TA-MAHO-POINTS',await p.evaluate(()=>window.__L5R_TEST__.TA7.read()),{rank:2,points:0});
}else for(const id of ['TA-PREVIEW-TN','TA-CANCEL','TA-FAILURE','TA-SUCCESS','TA-TEA-REAL-ROLL','TA-MAHO-POINTS'])check(id,null,true);
await feature('TA-RESET',"(()=>{T.resetToBaseline();return A.read()})()",{rank:0,points:0});
check('TA-NO-ERRORS',errors,[]);
}finally{await b.close();}const passed=results.filter(Boolean).length;console.log(passed+'/'+TOTAL+' checks passed');process.exitCode=results.length===TOTAL&&passed===TOTAL?0:1;})().catch(e=>{console.error(e);process.exitCode=1});
