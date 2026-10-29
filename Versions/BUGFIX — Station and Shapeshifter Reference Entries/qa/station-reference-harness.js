'use strict';
// Station and Shapeshifter Reference Entries (Release 7b.2, owner ruling R11; Search only). node station-reference-harness.js <sheet.html>
const {chromium}=require('playwright'),{pathToFileURL}=require('url'),path=require('path');
const TOTAL=10,results=[];
function check(id,got,want){if(results.some(r=>r.id===id))throw Error('Duplicate check '+id);const ok=JSON.stringify(got)===JSON.stringify(want);results.push({id,ok});console.log((ok?'PASS ':'FAIL ')+id+(ok?'':' actual='+String(JSON.stringify(got)).slice(0,500)+' expected='+String(JSON.stringify(want)).slice(0,400)));}
async function open(b){const p=await b.newPage({viewport:{width:1280,height:960}});p.setDefaultTimeout(8000);p.errors=[];p.on('pageerror',e=>p.errors.push(String(e)));p.on('dialog',d=>d.dismiss().catch(()=>{}));
await p.route('https://fonts.googleapis.com/**',r=>r.abort());await p.route('https://fonts.gstatic.com/**',r=>r.abort());
await p.goto(pathToFileURL(path.resolve(process.argv[2])).href,{waitUntil:'domcontentloaded',timeout:60000});
await p.waitForFunction(()=>{const T=window.__L5R_TEST__;return !!T&&!!window.__L5R_CAROUSEL__?.isReady?.()&&(!T.CL11||T.CL11.ready||T.CL11.enabled()===false)&&!document.querySelector('[id^=l5r-splash]');},null,{timeout:60000});
await p.evaluate(()=>{window.__L5R_TEST__.CL11?.close?.();window.__L5R_TEST__.MODES12?.set('management');});return p;}
const NAMES=['The World of the Daimyo','The Daimyo’s Path','Child of Chikushudo'];
// The record Search holds for a name, found in this category by its own words.
const rec=(p,name)=>p.evaluate(name=>{const S=window.__L5R_TEST__.SEARCH14;const hit=S.query({text:name,category:'station-shapeshifter',limit:5}).results.find(r=>r.name===name);
  const r=hit&&S.get(hit.id);return r?[r.type,r.source,r.tags,r.fields.map(f=>f.label+': '+f.value),r.text]:null;},name);
const CASES=[
['SH-ENABLED',p=>p.evaluate(()=>{const T=window.__L5R_TEST__;return !!T.SH7&&T.SH7.enabled();}),true],
['SH-CATEGORY',p=>p.evaluate(()=>{const c=window.__L5R_TEST__.SEARCH14.categories().find(c=>c.id==='station-shapeshifter');return c?[c.count,c.label,c.group]:null;}),[3,'Stations and Shapeshifters','Clans']],
// Beside the Naga and Nezumi reference entries: the next category.
['SH-BESIDE-NAGA',p=>p.evaluate(()=>window.__L5R_TEST__.SEARCH14.categories().map(c=>c.id).slice(-2)),['naga-nezumi','station-shapeshifter']],
['SH-WORLD',p=>rec(p,NAMES[0]),['Advantage','Emerald Empire p.279',['Reference only','Social'],['Type: Social','Cost: 5 points'],
  ['Grants 5 Duty Points to spend on any Station’s Features. May be bought again; each further level costs 3 more XP than the last.',
   'Reference only: the sheet does not apply Emerald Empire’s Station rules. Not in the Advantage list.']]],
['SH-PATH',p=>rec(p,NAMES[1]),['Advantage','Emerald Empire p.279',['Reference only','Social'],['Type: Social','Cost: 10 points'],
  ['Grants 8 Duty Points for any Station’s Features and opens Level Three Features of the character’s primary Station only. Requires The World of the Daimyo.',
   'Reference only: the sheet does not apply Emerald Empire’s Station rules. Not in the Advantage list.']]],
['SH-CHILD',p=>rec(p,NAMES[2]),['Advantage','Enemies of the Empire p.244',['Reference only','Spiritual'],['Type: Spiritual','Cost: 7 points'],
  ['Descended from a spirit of another realm: one Minor Shapeshifter Ability (GM approval) with a special penalty, rolled or agreed with the GM (for example a Social roll penalty, a stutter, or Wounds on each use).',
   'Reference only: the sheet does not apply the shapeshifter rules. Not in the Advantage list.']]],
// Search from the home page's box finds them.
['SH-FOUND',p=>p.evaluate(()=>window.__L5R_TEST__.SEARCH14.query({text:'daimyo',limit:20}).results.filter(r=>r.category==='station-shapeshifter').map(r=>r.name).sort()),['The Daimyo’s Path','The World of the Daimyo']],
// Unchanged: none of the three can be bought.
['SH-NOT-IN-LISTS',p=>p.evaluate(names=>{const T=window.__L5R_TEST__;return names.filter(n=>T.ADV_LIBRARY.concat(T.DISADV_LIBRARY).some(x=>x.name===n)||
  [...document.querySelectorAll('#advQuickAdd option, #disadvQuickAdd option')].some(o=>o.value===n));},NAMES),[]],
// The Search page shows the category's tile, with its count.
['SH-HOME-TILE',async p=>{await p.evaluate(()=>window.__L5R_TEST__.CL11.open('search'));await p.waitForFunction(()=>document.querySelector('.s14-page .s14-cat'));
  const r=await p.evaluate(()=>{const b=document.querySelector('.s14-cat[data-category="station-shapeshifter"]');const prev=b&&b.previousElementSibling;
    return b?[b.querySelector('.s14-cat-count').textContent,prev&&prev.dataset.category]:null;});await p.evaluate(()=>window.__L5R_TEST__.CL11.close());return r;},['3','naga-nezumi']],
];
(async()=>{const b=await chromium.launch();try{const p=await open(b);
for(const [id,fn,want] of CASES){let got;try{got=await fn(p);}catch(e){got={error:String(e.message).slice(0,300)};}check(id,got,want);}
check('SH-NO-ERRORS',p.errors,[]);}finally{await b.close();}
const n=results.filter(r=>r.ok).length;console.log(n+'/'+results.length+' checks passed');process.exitCode=n===TOTAL&&results.length===TOTAL?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
