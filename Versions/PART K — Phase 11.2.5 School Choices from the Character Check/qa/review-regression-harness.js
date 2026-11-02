'use strict';
// Six review regressions, pinned before the first reproduction run. Counts never depend on execution outcome.
const {chromium}=require('playwright'), path=require('path'), {pathToFileURL}=require('url');
const URL=pathToFileURL(path.resolve(process.argv[2])).href;
const IDS=['FIXED-SKILL-NOT-EXTRA','KNOWN-SPELL-NO-DUPLICATE','SECOND-SCHOOL-GIVEN','FORMER-NAME-ADOPTION','ADOPTED-UNDO-NO-HIDDEN-CONFIRM','PAID-MEMORISED-SPELL-KEPT'];
let pass=0,fail=0;
async function fresh(browser,school='Kitsu Shugenja'){
  const context=await browser.newContext({viewport:{width:390,height:844}});
  await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//,r=>r.abort('blockedbyclient'));
  const p=await context.newPage();await p.goto(URL,{waitUntil:'domcontentloaded'});
  await p.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready,null,{timeout:60000});
  // Import fixture: the existing sheet supports multiple held Schools and memorised spells without scrolls.
  await p.evaluate(s=>{const T=window.__L5R_TEST__,d=T.collectData();d.fields.f_schoolsData=JSON.stringify([{name:s,frozen:false,frozenRank:null,floorRank:1,anchorInsightRank:0}]);d.fields.f_school=s;T.applyData(d);},school);
  return p;
}
function check(id,actual,expected){
  if(JSON.stringify(actual)===JSON.stringify(expected)){pass++;console.log('PASS SC8R-'+id);}
  else{fail++;console.log('FAIL SC8R-'+id+'\n expected '+JSON.stringify(expected)+'\n actual '+JSON.stringify(actual));}
}
async function main(){const browser=await chromium.launch();try{
  for(const id of IDS){let p;try{
    p=await fresh(browser,id==='FIXED-SKILL-NOT-EXTRA'?'Isawa Shugenja':'Kitsu Shugenja');
    if(!await p.evaluate(()=>!!window.__L5R_TEST__.SC8?.enabled())){check(id,false,true);continue;}
    if(id==='FIXED-SKILL-NOT-EXTRA'){
      const actual=await p.evaluate(()=>{const T=window.__L5R_TEST__,d=T.collectData();d.skills.push({name:'Lore: Theology',trait:'Intelligence',rank:'1',school:true,freeFloor:'1'});T.applyData(d);T.SC8.open('Isawa Shugenja','skill');const row=T.CW1121.addSkill('Lore','Theology',true);return [!!row,T.SC8.openSkills('Isawa Shugenja').length,!!T.collectData().skills.find(s=>s.name==='Lore: Theology').schoolChoice];});
      check(id,actual,[false,2,false]);
    }else if(id==='SECOND-SCHOOL-GIVEN'){
      const actual=await p.evaluate(()=>{const T=window.__L5R_TEST__,d=T.collectData();d.fields.f_schoolsData=JSON.stringify([{name:'Kitsu Shugenja',frozen:true,frozenRank:1,floorRank:1,anchorInsightRank:0},{name:'Kuni Shugenja',frozen:false,frozenRank:null,floorRank:1,anchorInsightRank:1}]);const names=['Sense','Commune','Summon'];names.forEach(name=>{const spell=T.SPELL_LIBRARY.find(s=>s.name===name);d.tech.push({name,desc:'known before School assignment',spellElement:spell.element.toLowerCase(),spellMastery:String(spell.mastery)});d.equip.push({name:'Spell Scroll — '+name,qty:'1',notes:''});});T.applyData(d);for(const school of ['Kitsu Shugenja','Kuni Shugenja']){T.SC8.open(school,'spell');names.forEach(n=>T.CW1122.addSpell(T.SPELL_LIBRARY.findIndex(s=>s.name===n)));T.SC8.close();}const missing=school=>T.SC8.withSchool(school,()=>T.CW1123.status(T.CW1123.forSchool(school)).missing);const result=[missing('Kitsu Shugenja'),missing('Kuni Shugenja'),T.collectData().tech.filter(t=>names.includes(t.name)).length];T.applyData(T.collectData());result.push(missing('Kuni Shugenja'));T.SC8.open('Kuni Shugenja','spell');T.CW1122.removeSpell(T.SC8.spellRow('Sense'));result.push(missing('Kitsu Shugenja'),missing('Kuni Shugenja'));return result;});
      check(id,actual,[[],[],3,[],[],['Sense']]);
    }else if(id==='FORMER-NAME-ADOPTION'){
      // OC8 enforces the actual School allotment. Kitsu has no Fire slot.
      // Retain its historical assertion on 8b; use Agasha's Fire affinity on the candidate.
      const source=await p.evaluate(()=>window.__L5R_TEST__.OC8?.enabled())?'Agasha Shugenja':'Kitsu Shugenja';
      const actual=await p.evaluate(school=>{const T=window.__L5R_TEST__,d=T.collectData(),old='Enticing the Dance of Flame',now='Enticing Dance of the Flame';d.fields.f_school=school;d.fields.f_schoolsData=JSON.stringify([{name:school,frozen:false,floorRank:1,anchorInsightRank:0}]);d.tech.push({name:old,desc:'old saved text',spellElement:'fire',spellMastery:'2'});d.equip.push({name:'Spell Scroll — '+old,qty:'1',notes:'reward notes'});T.applyData(d);T.SC8.open(school,'spell');T.CW1122.addSpell(T.SPELL_LIBRARY.findIndex(s=>s.name===now));const saved=T.collectData();T.applyData(saved);return [saved.tech.filter(t=>t.spellElement).length,saved.equip.filter(e=>/^Spell Scroll/.test(e.name)).length,saved.tech.find(t=>t.name===old)?.schoolChoice?.school,saved.equip.find(e=>e.name==='Spell Scroll — '+old)?.schoolChoice?.school,T.SC8.withSchool(school,()=>T.CW1123.learned()).includes(now)];},source);
      check(id,actual,[1,1,source,source,true]);
    }else{
      const actual=await p.evaluate(kind=>{const T=window.__L5R_TEST__,i=T.SPELL_LIBRARY.findIndex(s=>s.element==='Water'&&s.mastery===1&&!s.maho),spell=T.SPELL_LIBRARY[i],d=T.collectData();
        if(kind!=='PAID-MEMORISED-SPELL-KEPT'){d.tech.push({name:spell.name,desc:'known',spellElement:'water',spellMastery:'1',isMemorised:kind==='KNOWN-SPELL-NO-DUPLICATE',memorisationXpCost:kind==='KNOWN-SPELL-NO-DUPLICATE'?'1':''});T.applyData(d);}
        T.SC8.open('Kitsu Shugenja','spell');T.CW1122.addSpell(i);
        if(kind==='KNOWN-SPELL-NO-DUPLICATE'){const saved=T.collectData();return [saved.tech.filter(t=>t.name===spell.name).length,saved.equip.filter(e=>e.name==='Spell Scroll — '+spell.name).length,saved.tech.find(t=>t.name===spell.name).isMemorised];}
        const row=T.SC8.spellRow(spell.name);if(kind==='PAID-MEMORISED-SPELL-KEPT'){row.dataset.isMemorised='true';row.dataset.memorisationXpCost='1';row.querySelector('.spell-memo-checkbox').checked=true;}
        T.CW1122.removeSpell(row);const saved=T.collectData();return [saved.tech.filter(t=>t.name===spell.name).length,!!saved.tech.find(t=>t.name===spell.name)?.schoolChoice,document.getElementById('appConfirmOverlay').style.display==='flex',saved.tech.find(t=>t.name===spell.name)?.memorisationXpCost||''];
      },id);
      check(id,actual,id==='KNOWN-SPELL-NO-DUPLICATE'?[1,1,true]:[1,false,false,id==='PAID-MEMORISED-SPELL-KEPT'?'1':'']);
    }
  }catch(e){fail++;console.log('FAIL SC8R-'+id+'\n '+String(e));}finally{if(p)await p.context().close();}}
}finally{await browser.close();console.log(`${pass}/${IDS.length} checks passed`);process.exitCode=fail?1:0;}}
main().catch(e=>{console.error(e);process.exitCode=1;});
