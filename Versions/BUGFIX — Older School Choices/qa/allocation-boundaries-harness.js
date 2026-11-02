'use strict';
const path=require('path'),{pathToFileURL}=require('url'),{chromium}=require('playwright');
const pins=['CANNOT-BYPASS-TICKED-ROWS','FROZEN-SCHOOL-AFFINITY','ONE-FIXED-SUBJECT','OCCUPIED-CROSS-SCHOOL-CONFLICT','WIZARD-CAP'];
async function main(){
  const browser=await chromium.launch();let results={};
  try {
    const page=await browser.newPage();
    await page.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//,r=>r.abort());
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready,null,{timeout:60000});
    results=await page.evaluate(()=>{
      const T=window.__L5R_TEST__, base=T.collectData(), out={}, kitsu='Kitsu Shugenja';
      function fixture(schools,skillNames=[],spellNames=[]){
        const d=JSON.parse(JSON.stringify(base));delete d.schoolReviewVersion;
        d.fields.f_school=schools.at(-1);
        d.fields.f_schoolsData=JSON.stringify(schools.map((name,i)=>({name,frozen:i!==schools.length-1,frozenRank:i!==schools.length-1?1:null,floorRank:1,anchorInsightRank:i})));
        d.skills=skillNames.map(name=>({name,rank:'1',school:true,freeFloor:'0'}));
        d.tech=spellNames.map(name=>{const s=T.SPELL_LIBRARY.find(s=>s.name===name);return {name,spellMastery:String(s.mastery),spellElement:s.element.toLowerCase()};});
        d.equip=spellNames.map(n=>({name:'Spell Scroll — '+n,qty:'1'}));return d;
      }
      const clickText=text=>Array.from(document.querySelectorAll('#sc8Body button')).find(b=>b.textContent===text)?.click();
      T.applyData(fixture([kitsu],['Defense','Meditation']));T.SC8.open(kitsu,'skill');clickText('Keep recorded choices');
      T.CW1121.addSkill('Acting','',true);
      out['CANNOT-BYPASS-TICKED-ROWS']=!T.collectData().skills.some(s=>s.name==='Acting');
      T.applyData(fixture([kitsu,'Agasha Shugenja'],[],['Reflective Pool']));T.SC8.open(kitsu,'spell');
      out['FROZEN-SCHOOL-AFFINITY']=Array.from(document.querySelectorAll('.oc8-spell')).some(i=>i.value==='Reflective Pool');
      const monk='The Hitomi Kikage Zumi Order [Monk]';
      T.applyData(fixture([monk],['Lore: History','Lore: Heraldry','Acting']));T.SC8.open(monk,'skill');
      const row=Array.from(document.querySelectorAll('#sc8Body p')).find(p=>p.textContent.includes('Lore: History')&&p.querySelector('.oc8-use'));
      row?.querySelector('.oc8-use').click();
      // If the two elective slots are equivalent the player may still need to confirm Acting.
      const acting=Array.from(document.querySelectorAll('#sc8Body p')).find(p=>p.textContent.includes('Acting')&&p.querySelector('.oc8-use'));
      acting?.querySelector('.oc8-use').click();
      out['ONE-FIXED-SUBJECT']=!!row&&T.SC8.openSkills(monk).length===0&&T.collectData().skills.filter(s=>s.schoolChoice).length===2&&
        T.collectData().skills.filter(s=>s.name.startsWith('Lore:')&&s.schoolChoice).length===1;
      const conflict=fixture([kitsu,'Bayushi Bushi'],['Acting','Meditation']);
      T.applyData(fixture([kitsu]));T.SC8.open(kitsu,'skill');T.CW1121.addSkill('Meditation','',true);
      conflict.skills[1]=T.collectData().skills.find(s=>s.name==='Meditation');T.applyData(conflict);
      out['OCCUPIED-CROSS-SCHOOL-CONFLICT']=!T.collectData().skills.find(s=>s.name==='Acting').schoolChoice&&T.SC8.findings('skill').some(f=>f.sc8School===kitsu);
      T.applyData(fixture([kitsu]));T.CW112.start();
      // Starting the wizard clears the sheet. Apply the School through its own path below.
      return out;
    });
    await page.evaluate(async()=>{const T=window.__L5R_TEST__;const clan=document.getElementById('cfs_clan');clan.value='Lion';clan.dispatchEvent(new Event('change'));await T.CW112.applySchool('Kitsu Shugenja');T.CW112.index=T.CW112.steps.findIndex(s=>s.id==='spells');T.CW112.render();});
    results['WIZARD-CAP']=await page.evaluate(()=>{const T=window.__L5R_TEST__,water=T.CW1123.optionsFor('Water').slice(0,4);
      if(!T.CW112.isOpen()||water.length!==4)return false;
      const calls=water.map(s=>T.CW1122.addSpell(s.i));return calls.slice(0,3).every(Boolean)&&calls[3]===false&&T.collectData().tech.filter(s=>s.spellElement==='water').length===3;});
  } finally {
    await browser.close();
    pins.forEach(id=>console.log((results[id]?'PASS ':'FAIL ')+id));
    const n=pins.filter(id=>results[id]).length;console.log(n+'/'+pins.length+' checks passed');if(n!==pins.length)process.exitCode=1;
  }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
