'use strict';
// Instigator Blackmail Count (Release 7b.2, owner ruling R17; Core pp.249-250, p.146). node instigator-harness.js <sheet.html>
const {chromium}=require('playwright'),{pathToFileURL}=require('url'),path=require('path');
const TOTAL=14,results=[];
function check(id,got,want){if(results.some(r=>r.id===id))throw Error('Duplicate check '+id);const ok=JSON.stringify(got)===JSON.stringify(want);results.push({id,ok});console.log((ok?'PASS ':'FAIL ')+id+(ok?'':' actual='+String(JSON.stringify(got)).slice(0,500)+' expected='+String(JSON.stringify(want)).slice(0,400)));}
async function open(b){const p=await b.newPage({viewport:{width:1280,height:960}});p.setDefaultTimeout(8000);p.errors=[];p.on('pageerror',e=>p.errors.push(String(e)));p.on('dialog',d=>d.dismiss().catch(()=>{}));
await p.route('https://fonts.googleapis.com/**',r=>r.abort());await p.route('https://fonts.gstatic.com/**',r=>r.abort());
await p.goto(pathToFileURL(path.resolve(process.argv[2])).href,{waitUntil:'domcontentloaded',timeout:60000});
await p.waitForFunction(()=>{const T=window.__L5R_TEST__;return !!T&&!!window.__L5R_CAROUSEL__?.isReady?.()&&(!T.CL11||T.CL11.ready||T.CL11.enabled()===false)&&!document.querySelector('[id^=l5r-splash]');},null,{timeout:60000});
await p.evaluate(()=>{const T=window.__L5R_TEST__;T.CL11?.close?.();T.MODES12?.set('management');
  const add=(name,dis,config)=>{const row=T.makeEntry({name,cost:0,desc:''},true);document.getElementById(dis?'disadvList':'advList').appendChild(row);if(config)row.dataset.advConfig=JSON.stringify(config);return row;};
  window.__bk={
    // Every other requirement of the Scorpion Instigator met; Blackmail rows as given: a target name, or a config object.
    setup(targets){T.resetToBaseline();T.MODES12.set('management');T.saveSchoolsList([]);
      ['stamina','willpower','agility','intelligence','reflexes','awareness','strength','perception'].forEach(t=>document.getElementById('trait_'+t).value='6');
      for(const name of ['Courtier','Etiquette','Sincerity','Stealth'])document.getElementById('skillsBody').appendChild(T.makeSkillRow({name,trait:'Awareness',rank:6}));
      add('Multiple Schools');add('Dark Secret',true);
      (targets||[]).forEach(t=>add('Blackmail',false,typeof t==='string'?{type:'targetStatusPick',revision:1,target:t,targetStatus:2,value:t+' — agreed Status 2'}:t));
      T.saveSchoolsList([{name:'Bayushi Courtier',frozen:false,frozenRank:null,floorRank:1,anchorInsightRank:0}]);document.getElementById('f_school').value='Bayushi Courtier';T.recalcAll();},
    entry(){return T.ADVANCED_SCHOOL_LIBRARY.find(e=>e.id==='scorpion-instigator');},
    unmet(){return T.AS47.unmet(window.__bk.entry(),{});},
    listed(){return T.AS47.available().some(e=>e.id==='scorpion-instigator');}};});
return p;}
const S=(p,fn,arg)=>p.evaluate(fn,arg);
const FOUR=['Bayushi Kachiko','Doji Hoturi','Akodo Toturi','Isawa Kaede'];
const CASES=[
['BK-ENABLED',p=>S(p,()=>{const T=window.__L5R_TEST__;return !!T.BK7&&T.BK7.enabled();}),true],
// The four-people confirmation goes; the Dark Secret disclosure stays.
['BK-CONFIRMATIONS',p=>S(p,()=>window.__bk.entry().narrative.map(n=>n.id)),['instigator-secret-disclosed']],
['BK-FOUR',p=>S(p,t=>{window.__bk.setup(t);return window.__bk.unmet();},FOUR),[]],
['BK-THREE',p=>S(p,t=>{window.__bk.setup(t.slice(0,3));return window.__bk.unmet();},FOUR),['Blackmail on 4 different people (3 recorded)']],
['BK-NONE',p=>S(p,()=>{window.__bk.setup([]);return window.__bk.unmet();}),['Blackmail on 4 different people (0 recorded)']],
// One person counts once, whatever the case and spacing.
['BK-SAME-PERSON',p=>S(p,t=>{window.__bk.setup(t.slice(0,3).concat(['  bayushi KACHIKO ']));return window.__bk.unmet();},FOUR),['Blackmail on 4 different people (3 recorded)']],
// A Blackmail row without its target and Status set does not count.
['BK-UNCONFIGURED',p=>S(p,t=>{window.__bk.setup(t.slice(0,3).concat([{type:'targetStatusPick',revision:1,target:'Shosuro Aki'}]));return window.__bk.unmet();},FOUR),['Blackmail on 4 different people (3 recorded)']],
['BK-LISTED',p=>S(p,t=>{window.__bk.setup(t);const four=window.__bk.listed();window.__bk.setup(t.slice(0,3));return [four,window.__bk.listed()];},FOUR),[true,false]],
['BK-ENTER',p=>S(p,t=>{const T=window.__L5R_TEST__;window.__bk.setup(t);T.AS47.enter('Scorpion Instigator',{confirmations:['instigator-secret-disclosed']});return T.AS47.record()?.name||null;},FOUR),'Scorpion Instigator'],
// Unchanged: the disclosure must still be confirmed.
['BK-SECRET-STAYS',p=>S(p,t=>{const T=window.__L5R_TEST__;window.__bk.setup(t);T.AS47.enter('Scorpion Instigator',{confirmations:[]});return T.AS47.record()?.name||null;},FOUR),null],
// Through the real list: one tick box, and Begin training follows it.
['BK-UI',async p=>{await S(p,async t=>{window.__bk.setup(t);const c=window.__L5R_CAROUSEL__;c.goToTab('Techniques');await c.whenSettled();},FOUR);
  await p.locator('#advancedSchoolPicker').selectOption('Scorpion Instigator');
  const before=await S(p,()=>[[...document.querySelectorAll('#advancedSchoolConfirmations input')].map(i=>i.value),document.getElementById('advancedSchoolEnter').disabled]);
  await p.locator('#advancedSchoolConfirmations input[value="instigator-secret-disclosed"]').check();
  return before.concat([await S(p,()=>document.getElementById('advancedSchoolEnter').disabled)]);},[['instigator-secret-disclosed'],true,false]],
// Unchanged: other Schools keep their own confirmations and requirements.
['BK-OTHERS',p=>S(p,()=>{const T=window.__L5R_TEST__;return [T.ADVANCED_SCHOOL_LIBRARY.find(e=>e.name==='Kenshinzen').narrative.map(n=>n.id),
  T.ADVANCED_SCHOOL_LIBRARY.filter(e=>e.id!=='scorpion-instigator'&&e.special&&e.special.blackmailDistinctPeople).length];}),[['kenshinzen-duel'],0]],
['BK-LOGIC',p=>S(p,()=>{const L=window.__L5R_TEST__.BK7Logic;return [L.distinct(['A',' a','B','',null]),L.unmet(['the Blackmail Advantage','Stealth 4'],4,0),L.unmet(['Stealth 4'],4,4)];}),
  [2,['Stealth 4','Blackmail on 4 different people (0 recorded)'],['Stealth 4']]],
];
(async()=>{const b=await chromium.launch();try{const p=await open(b);
for(const [id,fn,want] of CASES){let got;try{got=await fn(p);}catch(e){got={error:String(e.message).slice(0,300)};}check(id,got,want);}
check('BK-NO-ERRORS',p.errors,[]);}finally{await b.close();}
const n=results.filter(r=>r.ok).length;console.log(n+'/'+results.length+' checks passed');process.exitCode=n===TOTAL&&results.length===TOTAL?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
