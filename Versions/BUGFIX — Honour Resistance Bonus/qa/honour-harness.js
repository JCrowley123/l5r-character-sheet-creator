const {chromium}=require('playwright'),{pathToFileURL}=require('url'),path=require('path');
const results=[];function check(id,got,want){const ok=JSON.stringify(got)===JSON.stringify(want);results.push(ok);console.log((ok?'PASS ':'FAIL ')+id+(ok?'':' actual='+JSON.stringify(got)+' expected='+JSON.stringify(want)));}
(async()=>{const b=await chromium.launch(),errors=[];try{const p=await b.newPage({viewport:{width:390,height:844}});p.on('pageerror',e=>errors.push(String(e)));await p.goto(pathToFileURL(path.resolve(process.argv[2])).href);await p.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready);
await p.evaluate(()=>{const T=window.__L5R_TEST__;T.CL11.close();T.resetToBaseline();T.clearAllRows();T.MODES12.set('management');document.getElementById('f_honorRank').value='6';document.getElementById('f_honorPts').value=T.RP7?'9':'6.9';T.recalcAll();});
async function f(id,code,want){check(id,await p.evaluate(code=>{const T=window.__L5R_TEST__,A=T.HR7,L=T.HR7Logic;if(!A?.enabled())return null;const c=T.makeRollContext(T.ROLL_KINDS.TRAIT,{traitName:'Willpower'}),D=T.RD4515;const mods=()=>T.getPreRollModifiers(c).filter(x=>x.label==='Honour: resistance');const add=(name,dis=false)=>{const row=T.makeEntry({name,cost:0,desc:''},true);document.getElementById(dis?'disadvList':'advList').appendChild(row);return row;};return eval(code);},code),want);}
await f('HR-RANK','A.bonus()',6);
await f('HR-BARRED-LOGIC','L.bonus(6,true)',0);
await f('HR-INVALID','[null,6.9,-1].map(x=>L.bonus(x,false))',[0,0,0]);
await f('HR-TYPES','["SKILL","TRAIT","RING","MANUAL"].map(k=>A.eligible(T.makeRollContext(T.ROLL_KINDS[k],{})))',[true,true,true,true]);
await f('HR-EXCLUDED','[... ["ATTACK","DAMAGE","SPELL","INITIATIVE"].map(k=>T.makeRollContext(T.ROLL_KINDS[k],{})),... [{fullDefenseDeclaration:true},{chk4531:"brash"},{d45WillpowerGate:true},{ta7Growth:true}].map(x=>Object.assign({},c,x))].map(A.eligible)',Array(8).fill(false));
await f('HR-OFFER','A.provider.offers(c).length',1);
await f('HR-UNCHECKED','D.start(c);mods().length',0);
await f('HR-FLAT','D.start(c);D.toggle("honour-resistance:resist",true);mods().map(x=>[x.rolledDelta,x.keptDelta,x.totalDelta])',[[0,0,6]]);
await f('HR-NEXT','D.start(c);mods().length',0);
await f('HR-CANCEL','D.start(c);D.toggle("honour-resistance:resist",true);D.cancel();mods().length',0);
await f('HR-BARRED','(()=>{const row=add("Failure of Bushido",true);row.dataset.advConfig=JSON.stringify({type:"tenetPick",tenet:"Honor",value:"Honor"});try{return [A.provider.offers(c).length,A.bonus()];}finally{row.remove();}})()',[0,0]);
await f('HR-BALANCE','(()=>{const row=add("Balance");try{D.start(c);D.toggle("situational-entries:balance",true);return mods().map(x=>x.totalDelta);}finally{row.remove();D.cancel();}})()',[6]);
await f('HR-BOTH','(()=>{const row=add("Balance");try{D.start(c);D.toggle("situational-entries:balance",true);D.toggle("honour-resistance:resist",true);return mods().map(x=>x.totalDelta);}finally{row.remove();D.cancel();}})()',[6]);
await f('HR-BRASH-ONCE','(()=>{const row=add("Brash",true);try{const b=Object.assign({},c,{chk4531:"brash"});D.start(b);D.toggle("honour-resistance:resist",true);return T.getPreRollModifiers(b).filter(x=>x.label.includes("Honor Rank")||x.label==="Honour: resistance").map(x=>x.totalDelta);}finally{row.remove();D.cancel();}})()',[6]);
await f('HR-BALANCE-NOTE','T.SIT4527.entry("balance").note.includes("added to the total once")',true);
const present=await p.evaluate(()=>!!window.__L5R_TEST__.HR7?.enabled());
if(present){
 await p.evaluate(()=>{const T=window.__L5R_TEST__;Math.random=()=>.45;window.hrPending=T.rollWithModifiers('Resist Fear',T.makeRollContext(T.ROLL_KINDS.RING,{ringName:'Earth'}),2,2);});
 const tick=p.locator('[data-rd4515-key="honour-resistance:resist"]');await tick.waitFor({state:'visible'});check('HR-PREVIEW-UNCHECKED',await tick.isChecked(),false);await tick.check();
 check('HR-PREVIEW-BONUS',(await p.locator('#rollPreviewOverlay').textContent()).includes('Honour: resistance'),true);
 await p.locator('#rollPreviewGo').click();await p.locator('#rollModalClose').waitFor({state:'visible'});check('HR-REAL-TOTAL',await p.locator('#rollTotalDisplay').textContent(),'16');await p.locator('#rollModalClose').click();
 await p.evaluate(()=>{const T=window.__L5R_TEST__;T.rollWithModifiers('Cancel resistance',T.makeRollContext(T.ROLL_KINDS.TRAIT,{traitName:'Willpower'}),2,2);});await p.locator('#rollPreviewCancel').click();
 check('HR-NO-SPENDING',await p.evaluate(()=>window.__L5R_TEST__.RP7.read('honor')),{rank:6,points:9});
}else for(const id of ['HR-PREVIEW-UNCHECKED','HR-PREVIEW-BONUS','HR-REAL-TOTAL','HR-NO-SPENDING'])check(id,null,true);
check('HR-NO-ERRORS',errors,[]);
}finally{await b.close();}const n=results.filter(Boolean).length;console.log(n+'/20 checks passed');process.exitCode=n===20&&results.length===20?0:1;})().catch(e=>{console.error(e);process.exitCode=1;});
