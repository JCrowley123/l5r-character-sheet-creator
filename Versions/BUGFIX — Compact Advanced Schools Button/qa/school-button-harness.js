'use strict';
// Compact Advanced Schools Button (Release 7b.1.1, device check E1). node school-button-harness.js <sheet.html> [screenshot folder]
// Go to Advanced Schools against the Taint card's Check Taint growth button, on a desktop and on a 390 px touch screen.
const {chromium}=require('playwright'),{pathToFileURL}=require('url'),path=require('path'),fs=require('fs');
const MATSU=JSON.parse(fs.readFileSync(path.join(__dirname,'7b1-checks-matsu.l5r.json'),'utf8'));
const SHOTS=process.argv[3]||'';
const TOTAL=9,results=[],errors=[];
function check(id,got,want){if(results.some(r=>r.id===id))throw Error('Duplicate check '+id);const ok=JSON.stringify(got)===JSON.stringify(want);results.push({id,ok});console.log((ok?'PASS ':'FAIL ')+id+(ok?'':' actual='+String(JSON.stringify(got)).slice(0,400)+' expected='+String(JSON.stringify(want)).slice(0,300)));}
async function open(b,phone){const ctx=await b.newContext(phone?{viewport:{width:390,height:844},isMobile:true,hasTouch:true}:{viewport:{width:1280,height:960}});
const p=await ctx.newPage();p.setDefaultTimeout(8000);p.on('pageerror',e=>errors.push(String(e)));p.on('dialog',d=>d.dismiss().catch(()=>{}));
await p.route('https://fonts.googleapis.com/**',r=>r.abort());await p.route('https://fonts.gstatic.com/**',r=>r.abort());
await p.goto(pathToFileURL(path.resolve(process.argv[2])).href,{waitUntil:'domcontentloaded',timeout:60000});
await p.waitForFunction(()=>{const T=window.__L5R_TEST__;return !!T&&!!window.__L5R_CAROUSEL__?.isReady?.()&&(!T.CL11||T.CL11.ready||T.CL11.enabled()===false)&&!document.querySelector('[id^=l5r-splash]');},null,{timeout:60000});
await p.evaluate(async d=>{const T=window.__L5R_TEST__;T.CL11?.close?.();T.resetToBaseline();T.applyData(d);T.recalcAll();T.MODES12.set('management');
const c=window.__L5R_CAROUSEL__;c.goToTab('Identity');await c.whenSettled();},MATSU);
return {ctx,p};}
const measure=p=>p.evaluate(()=>{const m=id=>{const e=document.getElementById(id),s=getComputedStyle(e),r=e.getBoundingClientRect();
const range=document.createRange();range.selectNodeContents(e);
return {h:Math.round(r.height),font:s.fontSize,pad:s.padding,border:s.borderTopColor,lines:range.getClientRects().length,shown:!e.hidden&&r.height>0};};
return {go:m('ap7Go'),taint:m('ta7-check'),coarse:matchMedia('(pointer:coarse)').matches};});
async function shot(p,name){if(!SHOTS)return;fs.mkdirSync(SHOTS,{recursive:true});
await p.evaluate(()=>document.getElementById('ap7Pointer').scrollIntoView({block:'center'}));await p.waitForTimeout(200);
await p.screenshot({path:path.join(SHOTS,name)});}
(async()=>{const b=await chromium.launch();try{
{const {ctx,p}=await open(b,false);const m=await measure(p);await shot(p,'desktop-1280.png');
check('AB-SHOWN',[m.go.shown,m.taint.shown,m.coarse],[true,true,false]);
check('AB-DESKTOP-FONT',[m.go.font,m.taint.font],['10px','10px']);
check('AB-DESKTOP-HEIGHT',m.go.h>=24&&m.go.h<=30,true);
check('AB-DESKTOP-BORDER',m.go.border===m.taint.border,true);
await ctx.close();}
{const {ctx,p}=await open(b,true);const m=await measure(p);await shot(p,'phone-390.png');
check('AB-PHONE-HEIGHT',[m.coarse,m.go.h>=44,m.go.h===m.taint.h],[true,true,true]);
check('AB-PHONE-FONT',[m.go.font,m.taint.font],['10px','10px']);
check('AB-PHONE-ONE-LINE',m.go.lines,1);
// Unchanged: the button still opens the Techniques page. After a real tap the focused button keeps Identity live, on
// main as well, so the carousel's active tab is read rather than Identity's inert flag.
await p.locator('#ap7Go').click();await p.evaluate(()=>window.__L5R_CAROUSEL__.whenSettled());
check('AB-GO-OPENS',await p.evaluate(()=>[window.__L5R_CAROUSEL__.getActiveTab().label,document.querySelector('.car-page[data-tab-label="Techniques"]').inert]),['Techniques',false]);
await ctx.close();}
check('AB-NO-ERRORS',errors,[]);}finally{await b.close();}
const n=results.filter(r=>r.ok).length;console.log(n+'/'+results.length+' checks passed');process.exitCode=n===TOTAL&&results.length===TOTAL?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
