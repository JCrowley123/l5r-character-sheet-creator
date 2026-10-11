'use strict';
// Independent oracles: approved Core Rulebook table, pp.136–137 and 144.
const fs = require('fs'), {chromium} = require('playwright');
const RULES = [
  ['Intimidation','Awareness'],
  ...['Biwa','Dance','Drums','Flute','Puppeteer','Samisen'].map(n => ['Perform: '+n,'Agility']),
  ...['Oratory','Song','Storytelling'].map(n => ['Perform: '+n,'Awareness']),
  ...['Fortunes & Winds','Letters','Sadane'].map(n => ['Games: '+n,'Awareness']),
  ...['Go','Shogi'].map(n => ['Games: '+n,'Intelligence']), ['Games: Kemari','Agility']
];
const results=[];
function check(id,actual,expected=true){const pass=JSON.stringify(actual)===JSON.stringify(expected);results.push({id,pass});
  console.log((pass?'PASS ':'FAIL ')+id+(pass?'':' actual='+JSON.stringify(actual)+' expected='+JSON.stringify(expected)));}
async function main(){
  const browser=await chromium.launch();
  try{
    const context=await browser.newContext({viewport:{width:390,height:844}}), page=await context.newPage(), errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    const html=fs.readFileSync(process.argv[2],'utf8');
    await page.route('**/*',r=>r.request().url().startsWith('http://skilltraits.test/')?
      r.fulfill({contentType:'text/html',body:html}):r.abort());
    await page.goto('http://skilltraits.test/');
    await page.waitForFunction(()=>window.__L5R_TEST__&&(!window.__L5R_TEST__.CL11||window.__L5R_TEST__.CL11.ready),null,{timeout:60000});
    check('ST-ENABLED',await page.evaluate(()=>window.__L5R_TEST__.SKILL_TRAITS_FIX_ENABLED===true));
    check('ST-CATALOGUE',await page.evaluate(()=>window.__L5R_TEST__.SKILL_LIBRARY.find(s=>s.name==='Intimidation').trait),'Awareness');
    check('ST-LIBRARY-ENTRY',await page.evaluate(()=>window.__L5R_TEST__.SCHOOL_SKILL_ROWS.libraryEntry('Perform: Biwa').trait),'Agility');
    for(const [name,expected] of RULES){
      const actual=await page.evaluate(name=>{
        const row=window.__L5R_TEST__.makeSkillRow({name,rank:2});
        return row.querySelector('.sk-trait').value;
      },name);
      check('ST-NEW-'+name.toUpperCase().replace(/[^A-Z]+/g,'-'),actual,expected);
    }
    const loaded=await page.evaluate(rules=>{
      const T=window.__L5R_TEST__;T.resetToBaseline();
      const d=T.collectData();d.skills=rules.map(([name])=>({name,trait:name==='Intimidation'?'Willpower':'Awareness',rank:3,school:false,freeFloor:0,emph:''}));
      const input=JSON.stringify(d);T.applyData(d);
      const out=T.collectData();
      return {rows:out.skills.map(s=>[s.name,s.trait]),dataUnchanged:JSON.stringify(d)===input,
        rankKept:out.skills.every(s=>Number(s.rank)===3&&Number(s.freeFloor)===0&&!s.school),save:out};
    },RULES);
    check('ST-LOAD-OLD-TRAITS',loaded.rows,RULES);
    check('ST-INPUT-NOT-MUTATED',loaded.dataUnchanged);
    check('ST-NO-REPRICE',loaded.rankKept);
    const overrides=await page.evaluate(()=>{
      const T=window.__L5R_TEST__, d=T.collectData();
      d.skills=[{name:'Intimidation',trait:'Perception',rank:2},{name:'Perform: Biwa',trait:'Reflexes',rank:2},
        {name:'Games: Go',trait:'Void',rank:2},{name:'Lore: History',trait:'Willpower',rank:2}];
      T.applyData(d);const first=T.collectData().skills.map(s=>s.trait);T.applyData(T.collectData());
      return [first,T.collectData().skills.map(s=>s.trait)];
    });
    check('ST-OVERRIDES-ROUNDTRIP',overrides,[['Perception','Reflexes','Void','Willpower'],['Perception','Reflexes','Void','Willpower']]);
    const rename=await page.evaluate(()=>{
      const T=window.__L5R_TEST__;T.clearAllRows();
      const row=T.makeSkillRow({});document.getElementById('skillsBody').appendChild(row);
      const name=row.querySelector('.sk-name'),trait=row.querySelector('.sk-trait');
      const set=n=>{name.value=n;name.dispatchEvent(new Event('change',{bubbles:true}));return trait.value;};
      const automatic=[set('Perform: Biwa'),set('Games: Go'),set('Perform: Song')];
      trait.value='Reflexes';trait.dispatchEvent(new Event('input',{bubbles:true}));
      const manual=set('Games: Kemari');
      const other=T.makeSkillRow({name:'Perform: Biwa'});document.getElementById('skillsBody').appendChild(other);
      other.querySelector('.sk-trait').dispatchEvent(new Event('input',{bubbles:true}));
      other.querySelector('.sk-name').value='Games: Go';other.querySelector('.sk-name').dispatchEvent(new Event('change',{bubbles:true}));
      return {automatic,manual,manualSame:other.querySelector('.sk-trait').value,
        caseSpace:(()=>{const r=T.makeSkillRow({name:'  pErFoRm :  fLuTe  ',trait:'Awareness'});return r.querySelector('.sk-trait').value;})()};
    });
    check('ST-TYPED-RENAMES',rename.automatic,['Agility','Intelligence','Awareness']);
    check('ST-TYPED-OVERRIDE',rename.manual,'Reflexes');
    check('ST-MANUAL-SAME-VALUE',rename.manualSame,'Agility');
    check('ST-CASE-SPACES',rename.caseSpace,'Agility');
    const oldDefaults=await page.evaluate(()=>{
      const T=window.__L5R_TEST__;
      return [['Awareness','Games: Go'],['Willpower','Intimidation']].map(([chosen,renamed])=>{
        const row=T.makeSkillRow({name:'Perform: Biwa'});document.getElementById('skillsBody').appendChild(row);
        const trait=row.querySelector('.sk-trait');trait.value=chosen;trait.dispatchEvent(new Event('input',{bubbles:true}));
        const name=row.querySelector('.sk-name');name.value=renamed;name.dispatchEvent(new Event('change',{bubbles:true}));
        return trait.value;
      });
    });
    check('ST-MANUAL-OLD-DEFAULT-RENAME',oldDefaults,['Awareness','Willpower']);
    const fallback=await page.evaluate(()=>{
      const T=window.__L5R_TEST__;
      return ['Games: Invented','Perform: Invented','Lore: History','Craft: Armorsmithing','Unknown'].map(name=>
        T.makeSkillRow({name}).querySelector('.sk-trait').value);
    });
    check('ST-UNLISTED-UNCHANGED',fallback,['Awareness','Awareness','Intelligence','Awareness','']);
    const craft=await page.evaluate(()=>{
      const T=window.__L5R_TEST__,r=T.makeSkillRow({name:'Craft: Armorsmithing'});
      document.getElementById('skillsBody').appendChild(r);r.querySelector('.sk-info-btn').click();
      const info=document.getElementById('skillInfoDesc').textContent;
      document.getElementById('skillInfoClose').click();
      const row=r.querySelector('.st10-craft-note')?.textContent||'';
      r.querySelector('.sk-name').value='Games: Go';r.querySelector('.sk-name').dispatchEvent(new Event('change',{bubbles:true}));
      const removed=!r.querySelector('.st10-craft-note');
      const base=T.makeSkillRow({name:'Craft'});base.querySelector('.sk-info-btn').click();
      const count=document.getElementById('skillInfoDesc').textContent.split('Trait varies by craft; the GM sets it (Core Rulebook p.143).').length-1;
      document.getElementById('skillInfoClose').click();
      return {row,info:info.includes('Trait varies by craft; the GM sets it (Core Rulebook p.143).'),removed,count};
    });
    check('ST-CRAFT-ROW',craft.row,'Trait varies by craft; the GM sets it (Core Rulebook p.143).');
    check('ST-CRAFT-INFO',craft.info);
    check('ST-CRAFT-RENAME',craft.removed);
    check('ST-CRAFT-NO-DUPLICATE',craft.count,1);
    const search=await page.evaluate(()=>{
      const T=window.__L5R_TEST__, q=T.SEARCH14.query({category:'skills',text:'Intimidation',limit:50});
      const record=q.results.find(r=>r.name==='Intimidation');
      const detail=JSON.stringify(record||{});
      const facets=T.FACETS141.facets('skills'),trait=facets.find(f=>f.id==='trait');
      const craftHit=T.SEARCH14.query({category:'skills',text:'Craft',limit:50}).results.find(r=>r.name==='Craft');
      const craft=craftHit&&T.SEARCH14.get(craftHit.id);
      return {awareness:detail.includes('Awareness')&&!detail.includes('Willpower'),
        noWillpower:!!trait&&!trait.options.some(o=>o.value==='Willpower'),craft:JSON.stringify(craft||{}).includes('Trait varies by craft')};
    });
    check('ST-SEARCH-INTIMIDATION',search.awareness);
    check('ST-SEARCH-FACET',search.noWillpower);
    check('ST-SEARCH-CRAFT',search.craft);
    const unchanged=await page.evaluate(()=>{
      const T=window.__L5R_TEST__;
      return ['Athletics','Etiquette','Iaijutsu','Craft','Perform','Games'].map(n=>T.SKILL_LIBRARY.find(s=>s.name===n).trait);
    });
    check('ST-FT28-PARKED',unchanged,['Strength','Awareness','Reflexes','Awareness','Awareness','Awareness']);
    check('ST-NO-PAGE-ERRORS',errors,[]);
    await context.close();
  }finally{await browser.close();}
  const passed=results.filter(r=>r.pass).length;console.log(passed+'/'+results.length+' checks passed');process.exitCode=passed===results.length?0:1;
}
main().catch(e=>{check('ST-EXCEPTION',String(e.stack),'no exception');const passed=results.filter(r=>r.pass).length;console.log(passed+'/'+results.length+' checks passed');process.exitCode=1;});
