'use strict';
const fs = require('fs'), path = require('path');
const {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./review-pins.json');
const sample = process.argv[3] && JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));

async function run(){
  const browser = await chromium.launch();
  const results = {}, errors = [];
  try {
    const page = await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
    page.on('pageerror', e => errors.push(String(e)));
    await page.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//,r => r.abort());
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(() => window.__L5R_TEST__?.CL11?.ready,null,{timeout:60000});
    Object.assign(results, await page.evaluate(incoming => {
      const T=window.__L5R_TEST__, out={}, school='Kitsu Shugenja';
      const eight=['Sense','Commune','Summon','Reflective Pool','Reversal of Fortunes','Clarity of Purpose','Blessed Wind','Tempest of Air'];
      const balm="Jurojin's Balm", $=id=>document.getElementById(id);
      const fresh=T.collectData(), copy=v=>JSON.parse(JSON.stringify(v));
      function legacy(schools=[school],names=[],skills=[]){
        const d=copy(fresh);
        delete d.schoolReviewVersion;
        d.fields.f_clan='Lion'; d.fields.f_school=schools.at(-1);
        d.fields.f_schoolsData=JSON.stringify(schools.map((name,i)=>({name,frozen:i!==schools.length-1,frozenRank:i!==schools.length-1?1:null,floorRank:1,anchorInsightRank:i})));
        d.skills=skills;
        d.tech=names.map(name=>{const s=T.SPELL_LIBRARY.find(s=>s.name===name);return {name,cost:0,spellElement:s.element.toLowerCase(),spellMastery:String(s.mastery),isMemorised:false};});
        d.equip=names.map(name=>({name:'Spell Scroll — '+name,qty:'1',notes:'Keep this note'}));
        return d;
      }
      const skill=(name,school=true,rank='1')=>({name,school,rank,freeFloor:'0',emph:'',freeEmph:''});
      const original=incoming || legacy([school],eight.concat(balm),[skill('Defense',true,'3')]);
      if(!incoming) original.tech.unshift({name:'Eyes of the Ancestors',cost:0,desc:'Kitsu Rank 1 School Technique'});
      const apply=d=>T.applyData(copy(d)), saved=()=>T.collectData();
      const open=(kind='spell',s=school)=>T.SC8.open(s,kind);
      const inputs=()=>Array.from(document.querySelectorAll('#sc8Body input.oc8-spell'));
      const choose=names=>inputs().forEach(input=>{input.checked=names.includes(input.value);});
      const confirm=()=>document.querySelector('#sc8Body .oc8-confirm')?.click();
      const button=(kind)=>document.querySelector('#validationReport .sc8-open[data-kind="'+kind+'"]');
      const status=(n=school)=>T.SC8.withSchool(n,()=>T.CW1123.open(T.CW1123.forSchool(n)));
      const dump=()=>JSON.stringify(saved());
      apply(original);
      out['REVIEW-BUTTON-MANAGE']=button('spell')?.textContent==='Review starting spells';
      T.MODES12.set('play');out['PLAY-READ-ONLY']=!button('spell')&&!open()&&T.validateCharacter().findings.some(f=>f.title.includes('review starting spells'));
      T.MODES12.set('management');
      const before=dump();open();out['NINE-OWNED-UNSELECTED']=inputs().length===9&&inputs().every(i=>!i.checked);
      choose(eight);$('sc8Done').click();out['LATER-NO-WRITES']=before===dump();
      open();choose(eight);confirm();
      let d=saved();
      const reward=d.tech.find(t=>t.name===balm),scroll=d.equip.find(e=>e.name.endsWith(' — '+balm));
      out['REWARD-RETAINED']=!!reward&&!reward.schoolChoice&&!!scroll&&!scroll.schoolChoice&&scroll.qty===original.equip.find(e=>e.name.endsWith(' — '+balm)).qty;
      out['EIGHT-NO-DUPLICATES']=d.tech.length===original.tech.length&&d.equip.length===original.equip.length&&eight.every(n=>d.tech.filter(t=>t.name===n&&t.schoolChoice?.school===school).length===1&&d.equip.some(e=>e.schoolChoice?.name===n));
      if(!out['EIGHT-NO-DUPLICATES']) out.diagnostic={before:JSON.parse(before).tech.map(r=>r.name),after:d.tech.map(r=>r.name),equipment:[original.equip.length,d.equip.length],marked:eight.filter(n=>d.tech.find(t=>t.name===n)?.schoolChoice&&d.equip.some(e=>e.schoolChoice?.name===n))};
      out['ONLY-EARTH-OWED']=JSON.stringify(status())==='["1 Earth spell"]';
      apply(d);open();out['RELOAD-RETAINS-REVIEW']=inputs().length===0&&!!$('cw1123PickEarth')&&!$('cw1123PickWater')&&!$('cw1123PickAir');
      const earth=$('cw1123PickEarth');
      if(earth){
        const idx=Array.from(earth.options).find(o=>o.value&&T.SPELL_LIBRARY[+o.value].name!==balm)?.value;
        if(idx){earth.value=idx;earth.dispatchEvent(new Event('change'));$('cw1123AddEarth').click();}
      }
      const extra=T.SPELL_LIBRARY.findIndex(s=>s.element==='Earth'&&s.name===balm);
      const failed=T.CW1122.addSpell(extra)===false;
      out['LAST-EARTH-GRANTED-ONCE']=failed&&status().length===0&&saved().tech.filter(t=>t.spellElement==='earth').length===2&&!button('spell');
      apply(original);open();confirm();d=saved();apply(d);open();
      out['ALL-REWARDS-REMEMBERED']=!inputs().length&&!!$('cw1123PickWater')&&saved().tech.every(t=>!t.schoolChoice);
      T.SC8.close();const w=T.SPELL_LIBRARY.findIndex(s=>s.name==='Clarity of Purpose');
      const modern=legacy([school]);modern.schoolReviewVersion=1;apply(modern);
      T.CW1122.addSpell(w);apply(saved());open();out['MODERN-EQUIPMENT-NO-REVIEW']=!inputs().length&&!!$('cw1123PickWater');
      const partial=copy(original), given=partial.tech.find(t=>t.name==='Sense');
      given.schoolChoice={version:1,stage:'starting',kind:'spell',school,name:'Sense',created:false};
      apply(partial);open();out['PARTIAL-GRANTS-PRESERVED']=inputs().length===8&&!inputs().some(i=>i.value==='Sense')&&saved().tech.find(t=>t.name==='Sense').schoolChoice.school===school;
      const air=T.SPELL_LIBRARY.filter(s=>s.element==='Air'&&s.mastery===1&&!s.maho).slice(0,3).map(s=>s.name);
      apply(legacy([school],air));open();const beforeExcess=dump();choose(air);confirm();
      out['OVER-QUOTA-ATOMIC']=beforeExcess===dump()&&inputs().length===3&&$('sc8Message').textContent.includes('Air');
      const four=T.SPELL_LIBRARY.filter(s=>s.element==='Water'&&s.mastery===1&&!s.maho).slice(0,4).map(s=>s.name);
      const isawa='Isawa Shugenja';apply(legacy([isawa],four));open('spell',isawa);const origComplex=dump();choose(four);confirm();
      out['COMPLEX-ALLOTMENT-ENFORCED']=origComplex===dump()&&inputs().length===4&&!!$('sc8Message').textContent;
      apply(legacy([school],[],[skill('Defense'),skill('Meditation')]));open('skill');
      out['AMBIGUOUS-SKILL-EXISTING-ONLY']=document.querySelectorAll('.oc8-use').length===2&&!$('cw1121Slot0Pick')&&!T.CW1121.addSkill('Acting','',true);
      apply(legacy([school,'Kuni Shugenja'],[],[skill('Kenjutsu')]));open('skill',school);
      const use=document.querySelector('.oc8-use');if(use)use.click();
      out['MULTI-SCHOOL-NO-DOUBLE-ASSIGNMENT']=!!use&&saved().skills.filter(s=>s.schoolChoice).length===1&&T.SC8.openSkills('Kuni Shugenja').length>0;
      apply(legacy([school],[],[skill('Battle'),skill('Acting',false)]));open('skill');
      out['FIXED-AND-UNTICKED-EXCLUDED']=!!$('cw1121Slot0Pick')&&saved().skills.every(s=>!s.schoolChoice);
      apply(legacy([isawa],[],[skill('Iaijutsu')]));open('skill',isawa);
      out['RESTRICTED-SKILL-ELIGIBILITY']=saved().skills.every(s=>!s.schoolChoice)&&document.querySelectorAll('.oc8-use').length===0;
      const conflict=legacy([school],[],[skill('Defense',true,'3'),skill('Meditation')]);
      apply(legacy([school]));open('skill');T.CW1121.addSkill('Meditation','',true);
      conflict.skills[1]=saved().skills.find(s=>s.name==='Meditation');apply(conflict);open('skill');
      out['EXPLICIT-SKILL-CONFLICT-REPORTED']=!!button('skill')&&$('sc8Body').textContent.includes('All starting slots')&&saved().skills.length===2&&saved().skills.find(s=>s.name==='Defense').rank==='3';
      return out;
    },sample));
    results['NO-SCRIPT-ERRORS']=errors.length===0;
    if(results.diagnostic) console.error(JSON.stringify(results.diagnostic));
    if(errors.length) console.error(errors);
  } finally {
    await browser.close();
    for(const id of Object.keys(pins)) console.log((results[id]===pins[id]?'PASS ':'FAIL ')+id);
    const total=Object.keys(pins).length, passed=Object.keys(pins).filter(id=>results[id]===pins[id]).length;
    console.log(passed+'/'+total+' checks passed'); if(passed!==total)process.exitCode=1;
  }
}
run().catch(e=>{console.error(e);process.exitCode=1;});
