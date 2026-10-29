'use strict';
// Gift Cancel Refunds the Spell Slot (Release 7b.1.1, device check B2). node gift-refund-harness.js <sheet.html>
// The Crab test character (Kuni, Hotei's Curse) with 1 Void Point casts Jade Strike through the real buttons.
const {chromium}=require('playwright'),{pathToFileURL}=require('url'),path=require('path'),fs=require('fs');
const CRAB=JSON.parse(fs.readFileSync(path.join(__dirname,'7b1-checks-crab.l5r.json'),'utf8'));
const TOTAL=8,results=[];
function check(id,got,want){if(results.some(r=>r.id===id))throw Error('Duplicate check '+id);const ok=JSON.stringify(got)===JSON.stringify(want);results.push({id,ok});console.log((ok?'PASS ':'FAIL ')+id+(ok?'':' actual='+String(JSON.stringify(got)).slice(0,400)+' expected='+String(JSON.stringify(want)).slice(0,300)));}
async function open(b){const p=await b.newPage({viewport:{width:1280,height:960}});p.setDefaultTimeout(8000);p.errors=[];p.on('pageerror',e=>p.errors.push(String(e)));p.on('dialog',d=>d.dismiss().catch(()=>{}));
await p.route('https://fonts.googleapis.com/**',r=>r.abort());await p.route('https://fonts.gstatic.com/**',r=>r.abort());
await p.goto(pathToFileURL(path.resolve(process.argv[2])).href,{waitUntil:'domcontentloaded',timeout:60000});
await p.waitForFunction(()=>{const T=window.__L5R_TEST__;return !!T&&!!window.__L5R_CAROUSEL__?.isReady?.()&&(!T.CL11||T.CL11.ready||T.CL11.enabled()===false)&&!document.querySelector('[id^=l5r-splash]');},null,{timeout:60000});
// Counts every call of the refund through its property, which is how both the preview's Cancel and this layer reach it.
await p.evaluate(()=>{const T=window.__L5R_TEST__;T.CL11?.close?.();window.__gr7Calls=0;const refund=T.SSA992.refund;T.SSA992.refund=function(){window.__gr7Calls++;return refund.apply(this,arguments);};});return p;}
async function load(p){await p.evaluate(async d=>{const T=window.__L5R_TEST__,$=id=>document.getElementById(id);
for(const id of ['rollModalClose','rollPreviewCancel','appConfirmX'])if($(id)&&$(id).offsetParent)$(id).click();
T.resetToBaseline();T.applyData(d);T.recalcAll();T.MODES12.set('play');$('void_current').value='1';T.renderVoidPips();T.recalcAll();window.__gr7Calls=0;
const c=window.__L5R_CAROUSEL__;c.goToTab('Techniques');await c.whenSettled();},CRAB);}
// Cast Jade Strike; with gift, tick Kuni's gift in the preview; then press the preview's Roll (or its Cancel).
async function cast(p,gift,button){await p.locator('.spell-cast-btn').first().click();await p.waitForSelector('#rollPreviewOverlay',{state:'visible',timeout:10000});
if(gift)await p.locator('#rollPreviewOverlay label',{hasText:'Kuni’s gift'}).locator('input').check();
await p.locator(button||'#rollPreviewGo').click();await p.waitForTimeout(400);}
const answer=async(p,id)=>{await p.waitForSelector('#appConfirmOverlay',{state:'visible',timeout:10000});const msg=await p.evaluate(()=>document.getElementById('appConfirmMsg').textContent);
await p.locator('#'+id).click();await p.waitForTimeout(600);return msg;};
const state=p=>p.evaluate(()=>{const $=id=>document.getElementById(id),T=window.__L5R_TEST__,overlay=$('rollModalOverlay');
return {earth:$('spell_used_earth').value,shared:$('spell_bonus_used_shared').value,void:T.getVoidPoints(),rolled:!!overlay&&getComputedStyle(overlay).display!=='none',
refunds:window.__gr7Calls,status:($('statusMsg')||{}).textContent||''};});
const KUNI='Kuni: Hotei’s Curse: this needs 2 Void Points; you have 1.\n\nRoll without it?';
const CASES=[
['GR-ENABLED',async p=>p.evaluate(()=>{const T=window.__L5R_TEST__;return !!T.GR7&&T.GR7.enabled();}),true],
['GR-CANCEL-ROLL',async p=>{await load(p);await cast(p,true);const msg=await answer(p,'appConfirmCancel');const s=await state(p);return [msg,s.earth,s.shared,s.void,s.rolled,s.refunds,s.status];},
 [KUNI,'0','0',1,false,1,'Cast cancelled — the Earth slot given back.']],
['GR-CANCEL-X',async p=>{await load(p);await cast(p,true);const msg=await answer(p,'appConfirmX');const s=await state(p);return [msg,s.earth,s.shared,s.void,s.rolled,s.refunds];},
 [KUNI,'0','0',1,false,1]],
// Unchanged: rolling without the gift keeps the slot spent and rolls.
['GR-ROLL-WITHOUT',async p=>{await load(p);await cast(p,true);const msg=await answer(p,'appConfirmOk');const s=await state(p);return [msg,s.earth,s.void,s.rolled,s.refunds];},
 [KUNI,'1',1,true,0]],
// The preview's own Cancel is refunded by the spell-slot fix; this layer must not refund it a second time.
['GR-PREVIEW-CANCEL-ONCE',async p=>{await load(p);await cast(p,true,'#rollPreviewCancel');const s=await state(p);
 const last=await p.evaluate(()=>JSON.stringify(window.__L5R_TEST__.SSA992.lastRefund));return [s.earth,s.void,s.rolled,s.refunds,last];},
 ['0',1,false,1,'{"delta":{"spell_used_earth":1}}']],
// Unchanged: a cast with no gift ticked spends its slot and rolls.
['GR-NO-GIFT',async p=>{await load(p);await cast(p,false);const s=await state(p);return [s.earth,s.void,s.rolled,s.refunds];},['1',1,true,0]],
// The logic alone: a cancelled resistance check inside the cast refunds too; a go, another roll kind or a second cancel does not.
['GR-SETTLE-RESIST',async p=>{await load(p);return p.evaluate(()=>{const T=window.__L5R_TEST__,$=id=>document.getElementById(id);if(!T.GR7||!T.GR7.enabled())return null;
 const c=T.SSA992.open();$('spell_used_earth').value='1';const pay=T.SSA992.take({kind:T.ROLL_KINDS.SPELL});T.SSA992.close(c);
 const a=T.GR7.settle(pay,true,{kind:T.ROLL_KINDS.TRAIT,d45WillpowerGate:true}),b=T.GR7.settle(pay,false,{kind:T.ROLL_KINDS.SKILL});
 const d=T.GR7.settle(pay,false,{kind:T.ROLL_KINDS.TRAIT,d45WillpowerGate:true}),e=T.GR7.settle(pay,false,{kind:T.ROLL_KINDS.SPELL});
 return [a,b,d,e,$('spell_used_earth').value,T.GR7.refunded(pay),window.__gr7Calls];});},
 [false,false,true,false,'0',true,1]],
];
(async()=>{const b=await chromium.launch();try{const p=await open(b);
for(const [id,fn,want] of CASES){let got;try{got=await fn(p);}catch(e){got={error:String(e.message).slice(0,300)};}check(id,got,want);}
check('GR-NO-ERRORS',p.errors,[]);}finally{await b.close();}
const n=results.filter(r=>r.ok).length;console.log(n+'/'+results.length+' checks passed');process.exitCode=n===TOTAL&&results.length===TOTAL?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
