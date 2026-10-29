'use strict';
// After-Preview Refund (Release 7c). node refund-harness.js <sheet.html>
// The Crab test character (Kuni, Hotei's Curse) given Dark Paragon (Determination) casts Jade Strike through the real
// buttons: Dark Paragon is paid after the preview, then Kuni's gift asks a question that can cancel the roll.
const {chromium}=require('playwright'),{pathToFileURL}=require('url'),path=require('path'),fs=require('fs');
const CRAB=JSON.parse(fs.readFileSync(path.join(__dirname,'7b1-checks-crab.l5r.json'),'utf8'));
CRAB.adv=[{name:'Dark Paragon',cost:'5',desc:'',config:{type:'darkParagon',revision:1,precept:'Determination',value:'Determination',remaining:1}}];
CRAB.fields.f_honorRank='2';CRAB.fields.f_honorPts='6';
const TOTAL=9,results=[];
function check(id,got,want){if(results.some(r=>r.id===id))throw Error('Duplicate check '+id);const ok=JSON.stringify(got)===JSON.stringify(want);results.push({id,ok});console.log((ok?'PASS ':'FAIL ')+id+(ok?'':' actual='+String(JSON.stringify(got)).slice(0,500)+' expected='+String(JSON.stringify(want)).slice(0,400)));}
async function open(b){const p=await b.newPage({viewport:{width:1280,height:960}});p.setDefaultTimeout(8000);p.errors=[];p.on('pageerror',e=>p.errors.push(String(e)));p.on('dialog',d=>d.dismiss().catch(()=>{}));
await p.route('https://fonts.googleapis.com/**',r=>r.abort());await p.route('https://fonts.gstatic.com/**',r=>r.abort());
await p.goto(pathToFileURL(path.resolve(process.argv[2])).href,{waitUntil:'domcontentloaded',timeout:60000});
await p.waitForFunction(()=>{const T=window.__L5R_TEST__;return !!T&&!!window.__L5R_CAROUSEL__?.isReady?.()&&(!T.CL11||T.CL11.ready||T.CL11.enabled()===false)&&!document.querySelector('[id^=l5r-splash]');},null,{timeout:60000});
await p.evaluate(()=>{window.__L5R_TEST__.CL11?.close?.();});return p;}
async function load(p,voids){await p.evaluate(async([d,v])=>{const T=window.__L5R_TEST__,$=id=>document.getElementById(id);
for(const id of ['rollModalClose','rollPreviewCancel','appConfirmX'])if($(id)&&$(id).offsetParent)$(id).click();
T.resetToBaseline();T.applyData(d);T.recalcAll();T.MODES12.set('play');$('void_current').value=String(v);T.renderVoidPips();T.recalcAll();
const c=window.__L5R_CAROUSEL__;c.goToTab('Techniques');await c.whenSettled();},[CRAB,voids]);}
// Cast Jade Strike with the named preview ticks, then press the preview's Roll (or its Cancel).
async function cast(p,ticks,button){await p.locator('.spell-cast-btn').first().click();await p.waitForSelector('#rollPreviewOverlay',{state:'visible',timeout:10000});
for(const t of ticks){if(t==='void')await p.locator('#rollPreviewOverlay input[data-void-key]').first().check();
 else await p.locator('#rollPreviewOverlay label',{hasText:t}).locator('input').check();}
await p.locator(button||'#rollPreviewGo').click();await p.waitForTimeout(400);}
const answer=async(p,id)=>{await p.waitForSelector('#appConfirmOverlay',{state:'visible',timeout:10000});const msg=await p.evaluate(()=>document.getElementById('appConfirmMsg').textContent);
await p.locator('#'+id).click();await p.waitForTimeout(600);return msg;};
const state=p=>p.evaluate(()=>{const $=id=>document.getElementById(id),T=window.__L5R_TEST__,overlay=$('rollModalOverlay');
const dp=document.querySelector('#advList .entry');let c=null;try{c=JSON.parse(dp.dataset.advConfig).remaining;}catch(e){}
return {rank:$('f_honorRank').value,pts:$('f_honorPts').value,dp:c,earth:$('spell_used_earth').value,void:T.getVoidPoints(),
pending:$('voidPendingEffects').value,rolled:!!overlay&&getComputedStyle(overlay).display!=='none',status:($('statusMsg')||{}).textContent||''};});
const DET='Determination',KUNI_GIFT='Kuni’s gift';
const CASES=[
['RF-ENABLED',async p=>p.evaluate(()=>{const T=window.__L5R_TEST__;return !!T.RF7&&T.RF7.enabled();}),true],
// The owner's case: Determination paid, then Kuni's question cancels. Honor, the session use and the slot come back.
['RF-DP-THEN-GIFT-CANCEL',async p=>{await load(p,1);await cast(p,[DET,KUNI_GIFT]);const dp=await answer(p,'appConfirmOk');const kuni=await answer(p,'appConfirmCancel');const s=await state(p);
 return [/^Dark Paragon — Determination/.test(dp),/^Kuni/.test(kuni),s.rank,s.pts,s.dp,s.earth,s.void,s.rolled,s.status];},
 [true,true,'2','6',1,'0',1,false,'Cast cancelled — the Earth slot given back. Also given back: Honor, Dark Paragon’s use.']],
['RF-DP-THEN-GIFT-X',async p=>{await load(p,1);await cast(p,[DET,KUNI_GIFT]);await answer(p,'appConfirmOk');await answer(p,'appConfirmX');const s=await state(p);
 return [s.rank,s.pts,s.dp,s.earth,s.rolled];},['2','6',1,'0',false]],
// Unchanged: rolling without the gift keeps Dark Paragon paid, and rolls.
['RF-DP-THEN-ROLL-WITHOUT',async p=>{await load(p,1);await cast(p,[DET,KUNI_GIFT]);await answer(p,'appConfirmOk');await answer(p,'appConfirmOk');const s=await state(p);
 return [s.pts==='6'&&s.rank==='2',s.dp,s.earth,s.rolled];},[false,0,'1',true]],
// A Void Point spent on the preview's own Roll button comes back too, and nothing stays armed.
['RF-PREVIEW-VOID-BACK',async p=>{await load(p,2);const before=(await state(p)).pending;await cast(p,['void',KUNI_GIFT]);const kuni=await answer(p,'appConfirmCancel');const s=await state(p);
 return [/^Kuni/.test(kuni),s.void,s.pending===before,s.earth,s.rolled,/Void Points/.test(s.status)];},[true,2,true,'0',false,true]],
// The preview's own Cancel pays nothing, so this layer gives nothing back and says nothing.
['RF-PREVIEW-CANCEL-NOTHING',async p=>{await load(p,1);await cast(p,[DET],'#rollPreviewCancel');const s=await state(p);
 const last=await p.evaluate(()=>window.__L5R_TEST__.RF7.last);return [s.pts,s.dp,s.rolled,last,/Also given back|Roll cancelled; given back/.test(s.status)];},['6',1,false,[],false]],
// Dark Paragon paid and the roll goes ahead: nothing is given back.
['RF-DP-ROLLS',async p=>{await load(p,1);await cast(p,[DET]);await answer(p,'appConfirmOk');const s=await state(p);return [s.dp,s.rolled,s.pts==='6'];},[0,true,false]],
['RF-LOGIC',async p=>p.evaluate(()=>{const L=window.__L5R_TEST__.RF7Logic;if(!L)return null;
 return [L.changed({a:'1',b:'2'},{a:'1',b:'3'}),L.message(['Honor','Honor','','Void Points'],'Roll cancelled.'),L.message(['Honor'],'Cast cancelled — the Earth slot given back.'),L.message(['',''],'x')];}),
 [['b'],'Roll cancelled; given back: Honor, Void Points.','Cast cancelled — the Earth slot given back. Also given back: Honor.','']],
];
(async()=>{const b=await chromium.launch();try{const p=await open(b);
for(const [id,fn,want] of CASES){let got;try{got=await fn(p);}catch(e){got={error:String(e.message).slice(0,300)};}check(id,got,want);}
check('RF-NO-ERRORS',p.errors,[]);}finally{await b.close();}
const n=results.filter(r=>r.ok).length;console.log(n+'/'+results.length+' checks passed');process.exitCode=n===TOTAL&&results.length===TOTAL?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
