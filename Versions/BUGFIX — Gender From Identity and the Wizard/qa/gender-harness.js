'use strict';
// Gender From Identity and the Wizard (owner ruling R15, 23 October 2026). node gender-harness.js <sheet.html>
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
"GI-READ",
"if(!T.GI7||!T.GI7.enabled())return null;return ['Female','f','Woman ','male','M','non-binary','',' lady.'].map(t=>T.GI7Logic.read(t));",
[
"female",
"female",
"female",
"male",
"male",
"?",
"",
"female"
]
],
[
"GI-PAINT-MATCH",
"if(!T.GI7||!T.GI7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');const sel=$('advancedSchoolPicker');sel.add(new Option(\"The Lion's Pride\",\"The Lion's Pride\"));sel.value=\"The Lion's Pride\";$('f_gender').value='Female';T.AS47.renderChoice();const box=document.querySelector('#advancedSchoolConfirmations input[value=\"lions-pride-female\"]');const note=$('gi7Note-lions-pride-female');return [box.checked,box.disabled,note?note.textContent:''];",
[
true,
true,
"Your Identity says Female, which meets this."
]
],
[
"GI-UI-CHOICES",
"if(!T.GI7||!T.GI7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');const sel=$('advancedSchoolPicker');sel.add(new Option(\"The Lion's Pride\",\"The Lion's Pride\"));sel.value=\"The Lion's Pride\";$('f_gender').value='Female';T.AS47.renderChoice();return T.AS47.uiChoices().confirmations.includes('lions-pride-female');",
true
],
[
"GI-PAINT-CONFLICT",
"if(!T.GI7||!T.GI7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');const sel=$('advancedSchoolPicker');sel.add(new Option(\"The Lion's Pride\",\"The Lion's Pride\"));sel.value=\"The Lion's Pride\";$('f_gender').value='Male';T.AS47.renderChoice();const box=document.querySelector('#advancedSchoolConfirmations input[value=\"lions-pride-female\"]');const note=$('gi7Note-lions-pride-female');return [box.checked,box.disabled,note?note.textContent:''];",
[
false,
false,
"Your Identity says Male. Tick only if your GM agrees."
]
],
[
"GI-UNKNOWN",
"if(!T.GI7||!T.GI7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');const sel=$('advancedSchoolPicker');sel.add(new Option(\"The Lion's Pride\",\"The Lion's Pride\"));sel.value=\"The Lion's Pride\";$('f_gender').value='';T.AS47.renderChoice();const box=document.querySelector('#advancedSchoolConfirmations input[value=\"lions-pride-female\"]');const note=$('gi7Note-lions-pride-female');return [box.checked,box.disabled,note?note.textContent:''];",
[
false,
false,
"Or enter the Gender in Identity."
]
],
[
"GI-CHOICES",
"if(!T.GI7||!T.GI7.enabled())return null;const e=T.AS47.find(\"The Lion's Pride\");$('f_gender').value='woman';const a=T.GI7.choices(e,{confirmations:[]}).confirmations;$('f_gender').value='man';const b=T.GI7.choices(e,{}).confirmations;return [a,b];",
[
[
"lions-pride-female"
],
[]
]
],
[
"GI-WIZARD-FIELDS",
"if(!T.GI7||!T.GI7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');T.CW112.start();await sleep(50);const set=(id,v)=>{const i=$(id);i.value=v;i.dispatchEvent(new Event('input',{bubbles:true}));};set('gi7Gender','Female');set('gi7Age','19');const r=[$('f_gender').value,$('f_age').value];T.CW112.close();return r;",
[
"Female",
"19"
]
],
[
"GI-WIZARD-SKIPPABLE",
"if(!T.GI7||!T.GI7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');T.CW112.start();await sleep(50);const n=$('cw112Name');n.value='Akodo Test';n.dispatchEvent(new Event('input',{bubbles:true}));const r=[$('gi7Gender').value,$('gi7Age').value,$('cw112Next').disabled];T.CW112.close();return r;",
[
"",
"",
false
]
],
[
"GI-WIZARD-ORDER",
"if(!T.GI7||!T.GI7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');T.CW112.start();await sleep(50);const kids=[...$('cw112Body').children];const i=kids.indexOf($('cw112Name'));const r=i>=0&&i<kids.indexOf($('gi7Wizard'));T.CW112.close();return r;",
true
],
[
"GI-STARTOVER-KEEPS",
"if(!T.GI7||!T.GI7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');T.CW112.start();await sleep(50);$('f_name').value='Test Name';$('f_gender').value='Female';$('f_age').value='20';$('f_familyApplied').value='x';const pr=T.CW112.startOverIfApplied();await sleep(150);$('appConfirmOk').click();const ok=await pr;const r=[ok,$('f_name').value,$('f_gender').value,$('f_age').value];T.CW112.close();return r;",
[
true,
"Test Name",
"Female",
"20"
]
],
[
"GI-BUTTON",
"if(!T.GI7||!T.GI7.enabled())return null;T.resetToBaseline();T.MODES12.set('management');$('advList').appendChild(T.makeEntry({name:'Multiple Schools',cost:0},true));T.recalcAll();const unmet=T.AS47.unmet;T.AS47.unmet=()=>[];try{const sel=$('advancedSchoolPicker');sel.add(new Option(\"The Lion's Pride\",\"The Lion's Pride\"));sel.value=\"The Lion's Pride\";$('f_gender').value='Female';T.AS47.renderChoice();const a=$('advancedSchoolEnter').disabled;$('f_gender').value='Male';T.AS47.renderChoice();return [a,$('advancedSchoolEnter').disabled];}finally{T.AS47.unmet=unmet;}",
[
false,
true
]
]
];
(async()=>{const b=await chromium.launch();try{const p=await open(b);
for(const k of CHECKS){if(k[0]==='@viewport'){await p.setViewportSize({width:k[1],height:k[2]});continue;}await c(p,k[0],k[1],k[2]);}
check('GI-NO-ERRORS',p.errors,[]);}finally{await b.close();}
const n=results.filter(r=>r.ok).length;console.log(n+'/'+results.length+' checks passed');process.exitCode=n===TOTAL&&results.length===TOTAL?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
