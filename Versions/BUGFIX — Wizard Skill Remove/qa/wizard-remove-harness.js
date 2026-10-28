'use strict';
// Wizard Skill Remove (owner ruling R21, 23 October 2026). node wizard-remove-harness.js <sheet.html>
const {chromium}=require('playwright'),{pathToFileURL}=require('url'),path=require('path');
const TOTAL=5,results=[];
function check(id,got,want){if(results.some(r=>r.id===id))throw Error('Duplicate check '+id);const ok=JSON.stringify(got)===JSON.stringify(want);results.push({id,ok});console.log((ok?'PASS ':'FAIL ')+id+(ok?'':' actual='+String(JSON.stringify(got)).slice(0,400)+' expected='+String(JSON.stringify(want)).slice(0,300)));}
async function open(b){const p=await b.newPage({viewport:{width:1280,height:960}});p.setDefaultTimeout(8000);p.errors=[];p.on('pageerror',e=>p.errors.push(String(e)));p.on('dialog',d=>d.dismiss().catch(()=>{}));
await p.route('https://fonts.googleapis.com/**',r=>r.abort());await p.route('https://fonts.gstatic.com/**',r=>r.abort());
await p.goto(pathToFileURL(path.resolve(process.argv[2])).href,{waitUntil:'domcontentloaded',timeout:60000});
await p.waitForFunction(()=>{const T=window.__L5R_TEST__;return !!T&&!!window.__L5R_CAROUSEL__?.isReady?.()&&(!T.CL11||T.CL11.ready||T.CL11.enabled()===false)&&!document.querySelector('[id^=l5r-splash]');},null,{timeout:60000});
await p.evaluate(()=>{window.__L5R_TEST__.CL11?.close?.();window.__L5R_TEST__.MODES12?.set('management');});return p;}
async function c(p,id,src,want){let got;try{got=await p.evaluate(async src=>{const T=window.__L5R_TEST__,$=id=>document.getElementById(id),sleep=ms=>new Promise(r=>setTimeout(r,ms));return await eval('(async()=>{'+src+'})()');},src);}catch(e){got={error:String(e.message).slice(0,300)};}check(id,got,want);}
const CHECKS=[
[
"WR-BUTTONS",
"if(!T.WR7||!T.WR7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');T.clearAllRows();const add=(n,school)=>{const tr=T.makeSkillRow({name:n,trait:'Agility',rank:1});$('skillsBody').appendChild(tr);if(school){const b=tr.querySelector('.sk-school');b.checked=true;b.dispatchEvent(new Event('change',{bubbles:true}));}return tr;};add('Kenjutsu',true);const slot=add('Lore: History',true);add('Hunting',false);T.CW1121.slotRows={0:slot};T.recalcAll();T.CW112.start();T.CW112.index=T.CW112.steps.findIndex(s=>s.id==='skills');T.CW112.render();await sleep(30);const r=[...document.querySelectorAll('.cw1121-skill')].filter(x=>x.querySelector('.wr7-remove')).map(x=>x.querySelector('.cw112-trait-name').textContent);T.CW112.close();return r;",
[
"Hunting"
]
],
[
"WR-LOGIC",
"if(!T.WR7||!T.WR7.enabled())return null;const L=T.WR7Logic;return [L.removable({name:'Hunting'}),L.removable({name:'Kenjutsu',school:true}),L.removable({name:'Lore: History',freeChoice:true}),L.removable({name:'Courtier',freeRanks:1}),L.removable({name:'  '})];",
[
true,
false,
false,
false,
false
]
],
[
"WR-REMOVE",
"if(!T.WR7||!T.WR7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');T.clearAllRows();const add=(n,school)=>{const tr=T.makeSkillRow({name:n,trait:'Agility',rank:1});$('skillsBody').appendChild(tr);if(school){const b=tr.querySelector('.sk-school');b.checked=true;b.dispatchEvent(new Event('change',{bubbles:true}));}return tr;};add('Kenjutsu',true);const slot=add('Lore: History',true);add('Hunting',false);T.CW1121.slotRows={0:slot};T.recalcAll();T.CW112.start();T.CW112.index=T.CW112.steps.findIndex(s=>s.id==='skills');T.CW112.render();await sleep(30);const before=Number($('f_xpSpent').value);document.querySelector('.wr7-remove').click();await sleep(30);const has=[...document.querySelectorAll('#skillsBody .sk-name')].some(i=>i.value==='Hunting');const after=Number($('f_xpSpent').value);const step=T.CW112.steps[T.CW112.index].id;const listed=[...document.querySelectorAll('.cw1121-skill .cw112-trait-name')].some(e=>e.textContent==='Hunting');T.CW112.close();return [has,after<before,step,listed];",
[
false,
true,
"skills",
false
]
],
[
"@viewport",
375,
812
],
[
"WR-PHONE",
"if(!T.WR7||!T.WR7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');T.clearAllRows();const add=(n,school)=>{const tr=T.makeSkillRow({name:n,trait:'Agility',rank:1});$('skillsBody').appendChild(tr);if(school){const b=tr.querySelector('.sk-school');b.checked=true;b.dispatchEvent(new Event('change',{bubbles:true}));}return tr;};add('Kenjutsu',true);const slot=add('Lore: History',true);add('Hunting',false);T.CW1121.slotRows={0:slot};T.recalcAll();T.CW112.start();T.CW112.index=T.CW112.steps.findIndex(s=>s.id==='skills');T.CW112.render();await sleep(30);const b=document.querySelector('.wr7-remove');const r=b.getBoundingClientRect();const ok=r.width>0&&r.right<=innerWidth+0.5;T.CW112.close();return ok;",
true
]
];
(async()=>{const b=await chromium.launch();try{const p=await open(b);
for(const k of CHECKS){if(k[0]==='@viewport'){await p.setViewportSize({width:k[1],height:k[2]});continue;}await c(p,k[0],k[1],k[2]);}
check('WR-NO-ERRORS',p.errors,[]);}finally{await b.close();}
const n=results.filter(r=>r.ok).length;console.log(n+'/'+results.length+' checks passed');process.exitCode=n===TOTAL&&results.length===TOTAL?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
