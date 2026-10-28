'use strict';
// Skill List Hides Held Skills (owner ruling R14, 23 October 2026). node skill-list-harness.js <sheet.html>
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
"SL-HIDES-HELD",
"if(!T.SL7||!T.SL7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');T.clearAllRows();await sleep(20);const opts=()=>[...$('skillQuickAdd').querySelectorAll('option')].map(o=>o.value).filter(Boolean);const pick=async n=>{const s=$('skillQuickAdd');s.value=n;s.dispatchEvent(new Event('change',{bubbles:true}));await sleep(20);};await pick('Kenjutsu');return opts().includes('Kenjutsu');",
false
],
[
"SL-ROW-ADDED",
"if(!T.SL7||!T.SL7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');T.clearAllRows();await sleep(20);const opts=()=>[...$('skillQuickAdd').querySelectorAll('option')].map(o=>o.value).filter(Boolean);const pick=async n=>{const s=$('skillQuickAdd');s.value=n;s.dispatchEvent(new Event('change',{bubbles:true}));await sleep(20);};await pick('Kenjutsu');return [...document.querySelectorAll('#skillsBody .sk-name')].map(i=>i.value).includes('Kenjutsu');",
true
],
[
"SL-RETURNS",
"if(!T.SL7||!T.SL7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');T.clearAllRows();await sleep(20);const opts=()=>[...$('skillQuickAdd').querySelectorAll('option')].map(o=>o.value).filter(Boolean);const pick=async n=>{const s=$('skillQuickAdd');s.value=n;s.dispatchEvent(new Event('change',{bubbles:true}));await sleep(20);};await pick('Kenjutsu');const tr=[...$('skillsBody').rows].find(r=>r.querySelector('.sk-name').value==='Kenjutsu');tr.querySelector('.rm-btn:not(.emph-item-del)').click();await sleep(20);return opts().includes('Kenjutsu');",
true
],
[
"SL-SUBJECT-STAYS",
"if(!T.SL7||!T.SL7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');T.clearAllRows();await sleep(20);const opts=()=>[...$('skillQuickAdd').querySelectorAll('option')].map(o=>o.value).filter(Boolean);const pick=async n=>{const s=$('skillQuickAdd');s.value=n;s.dispatchEvent(new Event('change',{bubbles:true}));await sleep(20);};for(const n of ['Lore','Craft','Perform','Games'])await pick(n);return ['Lore','Craft','Perform','Games'].map(n=>opts().includes(n));",
[
true,
true,
true,
true
]
],
[
"SL-TYPED-NAME",
"if(!T.SL7||!T.SL7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');T.clearAllRows();await sleep(20);const opts=()=>[...$('skillQuickAdd').querySelectorAll('option')].map(o=>o.value).filter(Boolean);const pick=async n=>{const s=$('skillQuickAdd');s.value=n;s.dispatchEvent(new Event('change',{bubbles:true}));await sleep(20);};$('addSkill').click();await sleep(20);const rows=$('skillsBody').rows;const inp=rows[rows.length-1].querySelector('.sk-name');inp.value='Etiquette';inp.dispatchEvent(new Event('input',{bubbles:true}));await sleep(20);return opts().includes('Etiquette');",
false
],
[
"SL-LOAD",
"if(!T.SL7||!T.SL7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');T.clearAllRows();await sleep(20);const opts=()=>[...$('skillQuickAdd').querySelectorAll('option')].map(o=>o.value).filter(Boolean);const pick=async n=>{const s=$('skillQuickAdd');s.value=n;s.dispatchEvent(new Event('change',{bubbles:true}));await sleep(20);};await pick('Courtier');const saved=T.collectData();T.resetToBaseline();T.clearAllRows();await sleep(20);const after=opts().includes('Courtier');T.applyData(saved);await sleep(20);return [after,opts().includes('Courtier')];",
[
true,
false
]
],
[
"SL-OTHERS-STAY",
"if(!T.SL7||!T.SL7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');T.clearAllRows();await sleep(20);const opts=()=>[...$('skillQuickAdd').querySelectorAll('option')].map(o=>o.value).filter(Boolean);const pick=async n=>{const s=$('skillQuickAdd');s.value=n;s.dispatchEvent(new Event('change',{bubbles:true}));await sleep(20);};const before=opts().length;await pick('Kenjutsu');return [opts().length===before-1,opts().includes('Iaijutsu')];",
[
true,
true
]
],
[
"SL-WIZARD-ADD",
"if(!T.SL7||!T.SL7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');T.clearAllRows();await sleep(20);const opts=()=>[...$('skillQuickAdd').querySelectorAll('option')].map(o=>o.value).filter(Boolean);const pick=async n=>{const s=$('skillQuickAdd');s.value=n;s.dispatchEvent(new Event('change',{bubbles:true}));await sleep(20);};const tr=T.CW1121.addSkill('Hunting','',false);await sleep(20);return [!!tr,opts().includes('Hunting')];",
[
true,
false
]
],
[
"SL-CASE",
"if(!T.SL7||!T.SL7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');T.clearAllRows();await sleep(20);const opts=()=>[...$('skillQuickAdd').querySelectorAll('option')].map(o=>o.value).filter(Boolean);const pick=async n=>{const s=$('skillQuickAdd');s.value=n;s.dispatchEvent(new Event('change',{bubbles:true}));await sleep(20);};$('skillsBody').appendChild(T.makeSkillRow({name:' kenjutsu ',trait:'Agility',rank:1}));await sleep(20);return opts().includes('Kenjutsu');",
false
],
[
"SL-WIZARD-FRESH",
"if(!T.SL7||!T.SL7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');T.clearAllRows();await sleep(20);const pick=async n=>{const s=$('skillQuickAdd');s.value=n;s.dispatchEvent(new Event('change',{bubbles:true}));await sleep(20);};T.CW112.start();T.CW112.index=T.CW112.steps.findIndex(s=>s.id==='skills');T.CW112.render();await sleep(30);const s=$('cw1121ExtraPick');s.value='Kenjutsu';s.dispatchEvent(new Event('change',{bubbles:true}));$('cw1121ExtraAdd').click();await sleep(30);const r=[...$('skillsBody').querySelectorAll('.sk-name')].some(i=>i.value==='Kenjutsu'),o=[...$('cw1121ExtraPick').options].some(x=>x.value==='Kenjutsu');T.CW112.close();return [r,o];",
[
true,
false
]
],
[
"SL-WIZARD-RETURN",
"if(!T.SL7||!T.SL7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');T.clearAllRows();await sleep(20);const pick=async n=>{const s=$('skillQuickAdd');s.value=n;s.dispatchEvent(new Event('change',{bubbles:true}));await sleep(20);};await pick('Kenjutsu');T.CW112.start();T.CW112.index=T.CW112.steps.findIndex(s=>s.id==='skills');T.CW112.render();await sleep(30);const tr=[...$('skillsBody').rows].find(r=>r.querySelector('.sk-name').value==='Kenjutsu');tr.querySelector('.rm-btn:not(.emph-item-del)').click();T.CW112.render();const o=[...$('cw1121ExtraPick').options].some(x=>x.value==='Kenjutsu');T.CW112.close();return o;",
true
]
];
(async()=>{const b=await chromium.launch();try{const p=await open(b);
for(const k of CHECKS){if(k[0]==='@viewport'){await p.setViewportSize({width:k[1],height:k[2]});continue;}await c(p,k[0],k[1],k[2]);}
check('SL-NO-ERRORS',p.errors,[]);}finally{await b.close();}
const n=results.filter(r=>r.ok).length;console.log(n+'/'+results.length+' checks passed');process.exitCode=n===TOTAL&&results.length===TOTAL?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
