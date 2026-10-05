'use strict';
const {chromium}=require('playwright'),{pathToFileURL}=require('url'),path=require('path');
const out=[];function check(id,actual,expected=true){const pass=JSON.stringify(actual)===JSON.stringify(expected);out.push({id,pass});console.log((pass?'PASS ':'FAIL ')+id+(pass?'':' actual='+JSON.stringify(actual)+' expected='+JSON.stringify(expected)));}
// Independent sourcebook thresholds, not read back from the implementation.
const numeric={
 'minor-clan-defender':{traits:{Agility:5,Strength:4}},
 'imperial-scion':{traits:{Awareness:5,Perception:4},skills:{Courtier:6,Etiquette:4}},
 'kobune-captain':{rings:{Water:3},skills:{Commerce:4,Knives:3,Sailing:4}},
 'dark-paragons':{skills:{'Lore: Theology':4}},
 'kolat-assassin':{traits:{Agility:4,Reflexes:4},skills:{Acting:5,Knives:5,Stealth:5}},
 'legion-of-two-thousand':{rings:{Fire:3,Water:3},skills:{Battle:3,Defense:4,Kenjutsu:3}},
 'disciples-of-sun-tao':{rings:{Fire:4,Water:3},skills:{Battle:4}},
 'children-of-doji':{traits:{Awareness:5},rings:{Void:4},skills:{Courtier:6,Etiquette:6,Sincerity:5}},
 'kakita-master-artisan':{traits:{Awareness:5},rings:{Void:5}},
 'mirumoto-master-sensei':{rings:{Air:5,Earth:4,Void:5},skills:{Kenjutsu:5,Meditation:6}},
 'tamori-master-of-the-mountain':{skills:{Spellcraft:5}},
 'akodo-tactical-master':{rings:{Water:4},traits:{Intelligence:5},skills:{Battle:5}},
 'asako-inquisitors':{rings:{Void:4},skills:{'Lore: Law':4,'Lore: Shugenja':3}}
};
(async()=>{
 const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('net::'))errors.push(m.text());});
 await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.route('https://fonts.gstatic.com/**',r=>r.abort());
 try{
 await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);await page.waitForFunction(()=>window.__L5R_TEST__&&window.__L5R_CAROUSEL__?.isReady?.()&&window.__L5R_TEST__.CL11.ready);
 const cap=await page.evaluate(()=>!!window.__L5R_TEST__.SUP47&&window.__L5R_TEST__.SUPPLEMENTAL_ADVANCED_SCHOOL_DATA?.length===14);
 check('SUP-CAPABILITY-14-SCHOOLS',cap);
 if(cap){
 await page.evaluate(numeric=>{
  const T=window.__L5R_TEST__,A=T.AS47,ids={Stamina:'trait_stamina',Willpower:'trait_willpower',Agility:'trait_agility',Intelligence:'trait_intelligence',Reflexes:'trait_reflexes',Awareness:'trait_awareness',Strength:'trait_strength',Perception:'trait_perception'},rings={Earth:['Stamina','Willpower'],Fire:['Agility','Intelligence'],Air:['Reflexes','Awareness'],Water:['Strength','Perception']};
  window.Q={T,A,entry:id=>T.SUPPLEMENTAL_ADVANCED_SCHOOL_DATA.find(s=>s.id===id),
   add(name,config,dis=false){const r=T.makeEntry({name,cost:0,desc:''},true);document.getElementById(dis?'disadvList':'advList').appendChild(r);if(config)r.dataset.advConfig=JSON.stringify(config);return r;},
   points(n){const ringSum=Object.values(rings).reduce((sum,ts)=>sum+Math.min(...ts.map(t=>Number(document.getElementById(ids[t]).value))),0)+Number(document.getElementById('ring_void').value);const skillSum=[...document.querySelectorAll('#skillsBody .sk-rank')].reduce((s,e)=>s+Number(e.value),0);document.getElementById('f_insightBonus').value=n-ringSum*10-skillSum;T.recalcAll();},
   set(kind,name,n){if(kind==='traits')document.getElementById(ids[name]).value=n;else if(kind==='rings'){if(name==='Void')document.getElementById('ring_void').value=n;else for(const t of rings[name])document.getElementById(ids[t]).value=n;}else{const row=[...document.querySelectorAll('#skillsBody tr')].find(r=>r.querySelector('.sk-name').value===name);row.querySelector('.sk-rank').value=n;}this.points(175);},
   remove(name){for(const r of document.querySelectorAll('#advList .entry'))if(r.querySelector('.en-name').value===name)r.remove();},
   setup(id){T.CL11.close();T.resetToBaseline();T.MODES12.set('management');T.clearAllRows();document.getElementById('f_school').value='';T.saveSchoolsList([]);for(const v of Object.values(ids))document.getElementById(v).value=6;document.getElementById('ring_void').value=6;
    document.getElementById('f_clan').value=id==='minor-clan-defender'?'Badger':id==='imperial-scion'?'Imperial':id==='asako-inquisitors'?'Phoenix':'Crane';document.getElementById('f_statusRank').value=4;document.getElementById('f_honorRank').value=6;document.getElementById('f_honorPts').value=6;document.getElementById('f_taint').value=0;
    const skills=[...new Set(Object.values(numeric).flatMap(e=>Object.keys(e.skills||{})).concat(['Kenjutsu','Kyujutsu','Jiujutsu','Artisan: Painting','Perform: Song','Games: Shogi','Games: Go']))];
    for(const name of skills)document.getElementById('skillsBody').appendChild(T.makeSkillRow({name,trait:'Intelligence',rank:/^(Artisan|Perform)/.test(name)?8:6,emph:name==='Battle'?'Mass Combat':''}));
    for(const n of ['Multiple Schools','Paragon','Leadership','Dark Paragon','Prodigy'])this.add(n);
    this.add('Great Potential',{type:'skillPick',skill:'Artisan: Painting',value:'Artisan: Painting'});
    for(let i=0;i<4;i++)this.add('Allies',{type:'dualTierPick',influence:1,devotion:i===0?4:2});
    this.add('Sacred Weapon',{type:'clanWeaponAutoPick',clan:'Phoenix',value:'Phoenix'});
    const school=id==='tamori-master-of-the-mountain'?'Isawa Shugenja':'Hida Bushi';T.saveSchoolsList([{name:school,frozen:false,frozenRank:null,floorRank:1,anchorInsightRank:0}]);document.getElementById('f_school').value=school;this.points(175);T.recalcAll();
   },
   unmet(id){return A.unmet(this.entry(id));},
   confirmations(id){return {confirmations:this.entry(id).narrative.map(n=>n.id)};}
  };
 },numeric);
 check('SUP-CATALOGUE-CLEAN',await page.evaluate(()=>Q.A.assertCatalogue()),[]);
 check('SUP-CATALOGUE-TOTAL',await page.evaluate(()=>Q.T.ADVANCED_SCHOOL_LIBRARY.length),23);
 for(const [id,kinds]of Object.entries(numeric)){
  await page.evaluate(id=>Q.setup(id),id);
  check('SUP-QUALIFIES-'+id,await page.evaluate(id=>Q.unmet(id),id),[]);
  for(const [kind,items]of Object.entries(kinds))for(const [name,n]of Object.entries(items)){
   const r=await page.evaluate(({id,kind,name,n})=>{Q.setup(id);Q.set(kind,name,n);const exact=Q.unmet(id);Q.set(kind,name,n-1);return {exact,below:Q.unmet(id)};},{id,kind,name,n});
   check('SUP-THRESHOLD-'+id+'-'+name,r.exact,[]);check('SUP-BELOW-'+id+'-'+name,r.below.length>0);
  }
  const r=await page.evaluate(id=>{Q.setup(id);const e=Q.entry(id);Q.A.enter(e.name,Q.confirmations(id));const entered=Q.A.record()?.name;Q.points(250);const rank=Q.A.rank();const techniques=[...document.querySelectorAll('#techList .entry')].filter(r=>r.querySelector('.en-desc').value.startsWith('[Advanced School')).map(r=>r.querySelector('.en-name').value);const saved=Q.T.collectData();Q.T.resetToBaseline();Q.T.applyData(saved);Q.T.recalcAll();return {entered,rank,techniques,loaded:Q.A.record()?.name,loadedRank:Q.A.rank(),free:[...document.querySelectorAll('#techList .entry')].filter(r=>r.querySelector('.en-desc').value.startsWith('[Advanced School')).every(r=>Number(r.querySelector('.en-cost').value)===0)};},id);
  const expected=await page.evaluate(id=>Q.entry(id),id);
  check('SUP-PROGRESSION-SAVE-'+id,r,{entered:expected.name,rank:3,techniques:expected.techniques.map(t=>t.name),loaded:expected.name,loadedRank:3,free:true});
 }
 const cases=[
  ['minor-applied-not-picker','minor-clan-defender',()=>{document.getElementById('f_clan').value='Crab';document.getElementById('cfs_clan').value='Minor Clan';}],
  ['imperial-status','imperial-scion',()=>{document.getElementById('f_statusRank').value=3.9;}],
  ['imperial-membership','imperial-scion',()=>{document.getElementById('f_clan').value='Crane';}],
  ['leadership-required','kobune-captain',()=>Q.remove('Leadership')],
  ['paragon-required','minor-clan-defender',()=>Q.remove('Paragon')],
  ['dark-paragon-required','dark-paragons',()=>Q.remove('Dark Paragon')],
  ['any-trait-five','dark-paragons',()=>{for(const e of document.querySelectorAll('[id^="trait_"]'))e.value=4;}],
  ['taint-blocks-assassin','kolat-assassin',()=>{document.getElementById('f_taint').value=.1;}],
  ['taint-blocks-inquisitor','asako-inquisitors',()=>{document.getElementById('f_taint').value=.1;}],
  ['sensei-not-brash','mirumoto-master-sensei',()=>Q.add('Brash',null,true)],
  ['sensei-not-proud','mirumoto-master-sensei',()=>Q.add('Proud',null,true)],
  ['art-potential-required','kakita-master-artisan',()=>Q.remove('Great Potential')],
  ['art-potential-matches','kakita-master-artisan',()=>{Q.remove('Great Potential');Q.add('Great Potential',{type:'skillPick',skill:'Kenjutsu'});}],
  ['prodigy-required-non-artisan','kakita-master-artisan',()=>Q.remove('Prodigy')],
  ['crane-required-non-artisan','kakita-master-artisan',()=>{document.getElementById('f_clan').value='Lion';}],
  ['four-allies-required','children-of-doji',()=>{[...document.querySelectorAll('#advList .entry')].filter(r=>r.querySelector('.en-name').value==='Allies').at(-1).remove();}],
  ['devotion-four-required','children-of-doji',()=>{for(const r of document.querySelectorAll('#advList .entry'))if(r.querySelector('.en-name').value==='Allies')r.dataset.advConfig=JSON.stringify({type:'dualTierPick',devotion:2,influence:1});}],
  ['inquisitor-wrong-weapon','asako-inquisitors',()=>{document.getElementById('weaponsBody').innerHTML='';Q.remove('Sacred Weapon');Q.add('Sacred Weapon',{type:'clanWeaponAutoPick',clan:'Crab'});}],
  ['sun-tao-emphasis','disciples-of-sun-tao',()=>{for(const r of document.querySelectorAll('#skillsBody .emph-item-row'))r.remove();}],
  ['akodo-emphasis','akodo-tactical-master',()=>{for(const r of document.querySelectorAll('#skillsBody .emph-item-row'))r.remove();}],
  ['akodo-either-game','akodo-tactical-master',()=>{Q.set('skills','Games: Shogi',3);Q.set('skills','Games: Go',3);}],
  ['tamori-three-distinct-rings','tamori-master-of-the-mountain',()=>{for(const r of ['Air','Earth','Fire','Water','Void'])Q.set('rings',r,2);Q.set('rings','Fire',4);Q.set('rings','Water',3);}],
  ['inquisitor-two-other-rings','asako-inquisitors',()=>{for(const r of ['Air','Earth','Fire','Water'])Q.set('rings',r,2);Q.set('rings','Water',3);}]
 ];
 for(const [name,id,fn]of cases){await page.evaluate(id=>Q.setup(id),id);await page.evaluate('('+fn.toString()+')()');check('SUP-FRINGE-'+name,await page.evaluate(id=>Q.unmet(id).length>0,id));}
 check('SUP-NEZUMI-RECORDED-ONLY',await page.evaluate(()=>{Q.setup('berserkers');return Q.unmet('berserkers').some(t=>t.includes('Nezumi'))&&!Q.A.available().some(s=>s.id==='berserkers');}));
 check('SUP-NARRATIVE-CANNOT-BYPASS',await page.evaluate(()=>{Q.setup('kobune-captain');Q.A.enter('Kobune Captain');return !Q.A.record();}));
 for(const [id,minimum]of [['dark-paragons',4],['legion-of-two-thousand',5],['children-of-doji',5]]){
  check('SUP-HONOR-EXACT-'+id,await page.evaluate(({id,minimum})=>{Q.setup(id);document.getElementById('f_honorRank').value=minimum;return Q.unmet(id);},{id,minimum}),[]);
  check('SUP-HONOR-BELOW-'+id,await page.evaluate(({id,minimum})=>{document.getElementById('f_honorRank').value=minimum-.1;return Q.unmet(id).length>0;},{id,minimum}));
 }
 check('SUP-INQUISITOR-AFFINITY-ROUTE',await page.evaluate(()=>{Q.setup('asako-inquisitors');Q.remove('Sacred Weapon');document.getElementById('weaponsBody').innerHTML='';const school='Isawa Shugenja';Q.T.saveSchoolsList([{name:school,frozen:false,frozenRank:null,floorRank:1,anchorInsightRank:0}]);document.getElementById('f_school').value=school;document.getElementById('f_schoolAffinity').value='Water';Q.points(175);return Q.unmet('asako-inquisitors');}),[]);
 check('SUP-INQUISITOR-NO-CASTING-NO-WEAPON',await page.evaluate(()=>{document.getElementById('f_schoolAffinity').value='';Q.T.recalcAll();return Q.unmet('asako-inquisitors').length>0;}));
 check('SUP-INQUISITOR-VOID-REQUIRES-ISHIKEN',await page.evaluate(()=>{document.getElementById('f_schoolAffinity').value='Void';Q.T.recalcAll();return Q.unmet('asako-inquisitors').length>0;}));
 check('SUP-INQUISITOR-VOID-WITH-ISHIKEN',await page.evaluate(()=>{Q.add('Ishiken-Do');Q.T.recalcAll();return Q.unmet('asako-inquisitors');}),[]);
 check('SUP-INQUISITOR-HELD-SHUGENJA',await page.evaluate(()=>{Q.T.addSchoolToCharacter(Q.T.resolveSchoolName('Asako Loremaster'));return Q.unmet('asako-inquisitors');}),[]);
 check('SUP-KAKITA-TRAINED-ALTERNATIVE',await page.evaluate(()=>{Q.setup('kakita-master-artisan');Q.remove('Prodigy');document.getElementById('f_clan').value='Lion';const school=Q.T.resolveSchoolName('Kakita Artisan');Q.T.saveSchoolsList([{name:school,frozen:false,frozenRank:null,floorRank:1,anchorInsightRank:0}]);document.getElementById('f_school').value=school;Q.points(175);return Q.unmet('kakita-master-artisan');}),[]);
 check('SUP-KAKITA-RANK-ZERO-IS-NOT-TRAINED',await page.evaluate(()=>{Q.setup('kakita-master-artisan');Q.remove('Prodigy');const school=Q.T.resolveSchoolName('Kakita Artisan');Q.T.addSchoolToCharacter(school);return Number(document.getElementById('f_rank').value)===0&&Q.unmet('kakita-master-artisan').length>0;}));
 check('SUP-TAMORI-EXACT-PATTERN',await page.evaluate(()=>{Q.setup('tamori-master-of-the-mountain');for(const r of ['Air','Earth','Fire','Water','Void'])Q.set('rings',r,2);Q.set('rings','Air',4);Q.set('rings','Earth',3);Q.set('rings','Void',3);return Q.unmet('tamori-master-of-the-mountain');}),[]);
 check('SUP-WEAPONS-DUPLICATES-DONT-COUNT',await page.evaluate(()=>{Q.setup('disciples-of-sun-tao');for(const name of ['Knives','Kyujutsu'])Q.set('skills',name,3);document.getElementById('skillsBody').appendChild(Q.T.makeSkillRow({name:'Kenjutsu',trait:'Agility',rank:6}));return Q.unmet('disciples-of-sun-tao').length>0;}));
 }
 check('SUP-NO-PAGE-ERRORS',errors,[]);
 }finally{await browser.close();}
 const pass=out.filter(r=>r.pass).length;console.log(`${pass}/${out.length} checks passed`);process.exitCode=pass===out.length&&pass>2?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
