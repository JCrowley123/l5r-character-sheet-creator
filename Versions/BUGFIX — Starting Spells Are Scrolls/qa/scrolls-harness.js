'use strict';
// Starting Spells Are Scrolls (Release 7c, R22; Core p.164). node scrolls-harness.js <sheet.html>
// The Crab test character (a Kuni shugenja) in the creation wizard's Spells step.
const {chromium}=require('playwright'),{pathToFileURL}=require('url'),path=require('path'),fs=require('fs');
const CRAB=JSON.parse(fs.readFileSync(path.join(__dirname,'7b1-checks-crab.l5r.json'),'utf8'));
const TOTAL=5,results=[];
const LINE='These are scrolls in your Equipment. Memorising a spell costs XP equal to its Mastery (Core p.164); tick Memorised on its row.';
function check(id,got,want){if(results.some(r=>r.id===id))throw Error('Duplicate check '+id);const ok=JSON.stringify(got)===JSON.stringify(want);results.push({id,ok});console.log((ok?'PASS ':'FAIL ')+id+(ok?'':' actual='+String(JSON.stringify(got)).slice(0,500)+' expected='+String(JSON.stringify(want)).slice(0,400)));}
async function open(b){const p=await b.newPage({viewport:{width:1280,height:960}});p.setDefaultTimeout(8000);p.errors=[];p.on('pageerror',e=>p.errors.push(String(e)));p.on('dialog',d=>d.dismiss().catch(()=>{}));
await p.route('https://fonts.googleapis.com/**',r=>r.abort());await p.route('https://fonts.gstatic.com/**',r=>r.abort());
await p.goto(pathToFileURL(path.resolve(process.argv[2])).href,{waitUntil:'domcontentloaded',timeout:60000});
await p.waitForFunction(()=>{const T=window.__L5R_TEST__;return !!T&&!!window.__L5R_CAROUSEL__?.isReady?.()&&(!T.CL11||T.CL11.ready||T.CL11.enabled()===false)&&!document.querySelector('[id^=l5r-splash]');},null,{timeout:60000});
await p.evaluate(()=>{window.__L5R_TEST__.CL11?.close?.();});return p;}
async function spells(p,renders){await p.evaluate(([d,n])=>{const T=window.__L5R_TEST__,W=T.CW112;W.close();T.resetToBaseline();T.applyData(d);T.recalcAll();
W.start();W.index=W.steps.findIndex(x=>x.id==='spells');for(let i=0;i<n;i++)W.render();},[CRAB,renders||1]);}
const lines=p=>p.evaluate(()=>Array.from(document.querySelectorAll('.cw112-view .ss7-scrolls')).map(l=>[l.textContent,
 !l.previousElementSibling||l.previousElementSibling.classList.contains('cw112-note')]));
const CASES=[
['SS-ENABLED',async p=>p.evaluate(()=>{const T=window.__L5R_TEST__;return !!T.SS7&&T.SS7.enabled();}),true],
['SS-LINE',async p=>{await spells(p);return lines(p);},[[LINE,true]]],
['SS-ONCE',async p=>{await spells(p,3);return (await lines(p)).length;},1],
['SS-LOGIC',async p=>p.evaluate(()=>{const L=window.__L5R_TEST__.SS7Logic;return L?L.LINE:null;}),LINE],
];
(async()=>{const b=await chromium.launch();try{const p=await open(b);
for(const [id,fn,want] of CASES){let got;try{got=await fn(p);}catch(e){got={error:String(e.message).slice(0,300)};}check(id,got,want);}
await p.evaluate(()=>window.__L5R_TEST__.CW112.close());check('SS-NO-ERRORS',p.errors,[]);}finally{await b.close();}
const n=results.filter(r=>r.ok).length;console.log(n+'/'+results.length+' checks passed');process.exitCode=n===TOTAL&&results.length===TOTAL?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
