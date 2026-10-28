'use strict';
// Advanced Schools Pointer (owner ruling R16, 23 October 2026). node school-pointer-harness.js <sheet.html>
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
"AP-PRESENT",
"if(!T.AP7||!T.AP7.enabled())return null;return $('ap7Pointer').closest('.car-page').dataset.tabLabel;",
"Identity"
],
[
"AP-AFTER-SCHOOLS",
"if(!T.AP7||!T.AP7.enabled())return null;return $('schoolsPanel').nextElementSibling.id;",
"ap7Pointer"
],
[
"AP-LOGIC-HELD",
"if(!T.AP7||!T.AP7.enabled())return null;return T.AP7Logic.pointer({held:true,name:'Storm Riders'});",
{
"text": "Your Advanced School, Storm Riders, is on the Techniques page.",
"go": true
}
],
[
"AP-LOGIC-NONE",
"if(!T.AP7||!T.AP7.enabled())return null;return T.AP7Logic.pointer({held:false,available:false,advantage:false});",
{
"text": "Advanced Schools appear on the Techniques page once you meet one’s requirements, with the Multiple Schools Advantage.",
"go": false
}
],
[
"AP-LOGIC-NOADV",
"if(!T.AP7||!T.AP7.enabled())return null;return T.AP7Logic.pointer({available:true,advantage:false});",
{
"text": "Advanced Schools are on the Techniques page. Joining one needs the Multiple Schools Advantage.",
"go": true
}
],
[
"AP-LOGIC-READY",
"if(!T.AP7||!T.AP7.enabled())return null;return T.AP7Logic.pointer({available:true,advantage:true});",
{
"text": "Advanced Schools are on the Techniques page, under Advanced School.",
"go": true
}
],
[
"AP-UI-MATCHES",
"if(!T.AP7||!T.AP7.enabled())return null;T.resetToBaseline();T.recalcAll();const p=T.AP7Logic.pointer(T.AP7.state());return [$('ap7Text').textContent===p.text,$('ap7Go').hidden===!p.go];",
[
true,
true
]
],
[
"AP-GO",
"if(!T.AP7||!T.AP7.enabled())return null;const C=window.__L5R_CAROUSEL__;C.goToTab('Identity');await C.whenSettled();await T.AP7.go();await C.whenSettled();return [document.querySelector('.car-page[data-tab-label=\"Techniques\"]').inert,document.querySelector('.car-page[data-tab-label=\"Identity\"]').inert];",
[
false,
true
]
],
[
"AP-PRINT-HIDE",
"if(!T.AP7||!T.AP7.enabled())return null;return $('ap7Pointer').classList.contains('print-hide');",
true
],
[
"AP-HONOR-INPUT",
"if(!T.AP7||!T.AP7.enabled())return null;const avail=T.AS47.available;try{T.AS47.available=()=>[];$('f_honorRank').dispatchEvent(new Event('input',{bubbles:true}));const t1=$('ap7Text').textContent;T.AS47.available=()=>[{name:'Probe',types:['Bushi']}];$('f_honorRank').dispatchEvent(new Event('input',{bubbles:true}));const t2=$('ap7Text').textContent;return [t1.startsWith('Advanced Schools appear'),t2.startsWith('Advanced Schools are on')];}finally{T.AS47.available=avail;T.recalcAll();}",
[
true,
true
]
],
[
"@viewport",
375,
812
],
[
"AP-PHONE",
"if(!T.AP7||!T.AP7.enabled())return null;const C=window.__L5R_CAROUSEL__;C.goToTab('Identity');await C.whenSettled();await sleep(50);const r=$('ap7Pointer').getBoundingClientRect();return r.width>0&&r.right<=innerWidth+0.5;",
true
]
];
(async()=>{const b=await chromium.launch();try{const p=await open(b);
for(const k of CHECKS){if(k[0]==='@viewport'){await p.setViewportSize({width:k[1],height:k[2]});continue;}await c(p,k[0],k[1],k[2]);}
check('AP-NO-ERRORS',p.errors,[]);}finally{await b.close();}
const n=results.filter(r=>r.ok).length;console.log(n+'/'+results.length+' checks passed');process.exitCode=n===TOTAL&&results.length===TOTAL?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
