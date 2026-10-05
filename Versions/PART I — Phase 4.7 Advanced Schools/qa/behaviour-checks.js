'use strict';
const numeric=require('./core-numeric-expectations.json');
module.exports=async function(page,check,section){
 await page.evaluate(numeric=>{
  const T=window.__L5R_TEST__,A=T.AS47;
  const ids={Stamina:'trait_stamina',Willpower:'trait_willpower',Agility:'trait_agility',Intelligence:'trait_intelligence',Reflexes:'trait_reflexes',Awareness:'trait_awareness',Strength:'trait_strength',Perception:'trait_perception'};
  const rings={Earth:['Stamina','Willpower'],Fire:['Agility','Intelligence'],Air:['Reflexes','Awareness'],Water:['Strength','Perception']};
  const norm=s=>String(s).replace(/\s*\[[^\]]*\]$/,'').replace(/[’‘]/g,"'").toLowerCase();
  window.__asQA={
   find(name){return T.ADVANCED_SCHOOL_LIBRARY.find(e=>norm(e.name)===norm(name));},
   add(name,dis=false,config=null){const row=T.makeEntry({name,cost:0,desc:''},true);document.getElementById(dis?'disadvList':'advList').appendChild(row);if(config)row.dataset.advConfig=JSON.stringify(config);return row;},
   setInsight(points){const ringSum=Object.values(rings).reduce((sum,traits)=>sum+Math.min(...traits.map(t=>Number(document.getElementById(ids[t]).value))),0)+Number(document.getElementById('ring_void').value);const skillSum=[...document.querySelectorAll('#skillsBody .sk-rank')].reduce((sum,e)=>sum+Number(e.value),0);document.getElementById('f_insightBonus').value=String(points-ringSum*10-skillSum);T.recalcAll();},
   edit(kind,name,value){if(kind==='traits')document.getElementById(ids[name]).value=value;
    else if(kind==='rings'){if(name==='Void')document.getElementById('ring_void').value=value;else for(const trait of rings[name])document.getElementById(ids[trait]).value=value;}
    else if(kind==='skills'){const row=[...document.querySelectorAll('#skillsBody tr')].find(e=>e.querySelector('.sk-name').value.toLowerCase()===name.toLowerCase());if(!row)throw Error('Missing fixture Skill '+name);row.querySelector('.sk-rank').value=value;}
    else if(kind==='honor')document.getElementById('f_honorRank').value=value;T.recalcAll();},
   setup(school='Hida Bushi',multiple=true){T.CL11?.close?.();T.resetToBaseline();T.MODES12?.set('management');document.getElementById('f_school').value='';T.saveSchoolsList([]);for(const id of Object.values(ids))document.getElementById(id).value='6';document.getElementById('ring_void').value='6';
    document.getElementById('f_family').value='Matsu';document.getElementById('f_clan').value='Lion';document.getElementById('f_honorRank').value='6';
    const skills=[...new Set(Object.values(numeric).flatMap(e=>Object.keys(e.skills||{})).concat(['Kenjutsu','Kyujutsu','Spears','Knives']))];
    for(const name of skills)document.getElementById('skillsBody').appendChild(T.makeSkillRow({name,trait:'Intelligence',rank:6}));
    if(multiple)this.add('Multiple Schools');this.add('Elemental Blessing',false,{type:'ringPick',value:'Water',revision:1});this.add('Dark Secret',true);
    T.saveSchoolsList([{name:school,frozen:false,frozenRank:null,floorRank:1,anchorInsightRank:0}]);document.getElementById('f_school').value=school;document.getElementById('f_schoolAffinity').value='Water';this.setInsight(175);T.recalcAll();},
   basic(){return {name:document.getElementById('f_school').value,rank:Number(document.getElementById('f_rank').value),list:T.getSchoolsList()};},
   techs(){return [...document.querySelectorAll('#techList .entry')].map(e=>({name:e.querySelector('.en-name').value,desc:e.querySelector('.en-desc').value,cost:Number(e.querySelector('.en-cost').value)}));},
   advancedTechs(){return this.techs().filter(e=>/^\[Advanced School/.test(e.desc));},
   choices(){return {element:'Water',confirmations:[]};}
  };
 },numeric);
 await section('AS47-CATALOGUE',async()=>{
  const actual=await page.evaluate(()=>window.__L5R_TEST__.ADVANCED_SCHOOL_LIBRARY.filter(e=>e.source.startsWith('Core Rulebook')).map(e=>e.name.replace(/\s*\[[^\]]*\]$/,'').replace(/[’‘]/g,"'")).sort());
  check('AS47-CORE-NAMES',actual,Object.keys(numeric).sort());
 });
 for(const [name,requirements]of Object.entries(numeric))await section('AS47-NUMERIC-'+name,async()=>{
  await page.evaluate(name=>window.__asQA.setup(['Storm Riders','Elemental Guard'].includes(name)?'Isawa Shugenja':'Hida Bushi'),name);
  for(const [kind,values]of Object.entries(requirements))for(const [item,threshold]of Object.entries(typeof values==='number'?{Honor:values}:values)){
   // Hold Insight fixed: lowering one Skill must not masquerade as failure of the
   // separate Mastery Level 4 casting condition by crossing an Insight boundary.
   const out=await page.evaluate(({name,kind,item,threshold})=>{const Q=window.__asQA,A=window.__L5R_TEST__.AS47,entry=Q.find(name);Q.setInsight(175);const baseline=A.unmet(entry,Q.choices());Q.edit(kind,item,threshold);Q.setInsight(175);const exact=A.unmet(entry,Q.choices());Q.edit(kind,item,threshold-1);Q.setInsight(175);const below=A.unmet(entry,Q.choices());Q.edit(kind,item,6);Q.setInsight(175);return {baseline,exact,below};},{name,kind,item,threshold});
   check('AS47-EXACT-'+name+'-'+item,out.exact.filter(e=>!out.baseline.includes(e)),[]);
   check('AS47-BELOW-'+name+'-'+item,out.below.length>out.exact.length);
  }
 });
 await section('AS47-SPECIAL-REQUIREMENTS',async()=>{
  const r=await page.evaluate(()=>{
   const Q=window.__asQA,T=window.__L5R_TEST__,A=T.AS47;Q.setup();const lion=Q.find("The Lion's Pride");
   const all=A.unmet(lion,{}).length;document.getElementById('f_family').value='Akodo';const wrongFamily=A.unmet(lion,{}).length;document.getElementById('f_family').value='Matsu';
   for(const row of [...document.querySelectorAll('#skillsBody tr')])if(!['Battle','Kenjutsu','Kyujutsu','Spears'].includes(row.querySelector('.sk-name').value))row.querySelector('.sk-rank').value='0';
   document.getElementById('skillsBody').appendChild(T.makeSkillRow({name:'Kenjutsu',trait:'Agility',rank:6}));T.recalcAll();const duplicate=A.unmet(lion,{}).length;
   document.getElementById('skillsBody').appendChild(T.makeSkillRow({name:'Ninjutsu',trait:'Agility',rank:3}));T.recalcAll();const lowWeapon=A.unmet(lion,{}).length;
   Q.setup('Isawa Shugenja');const storm=Q.find('Storm Riders');const blessed=A.unmet(storm,{}).length;
   const bless=[...document.querySelectorAll('#advList .entry')].find(e=>e.querySelector('.en-name').value==='Elemental Blessing');bless.dataset.advConfig=JSON.stringify({type:'ringPick',value:'Air',revision:1});const wrongBless=A.unmet(storm,{}).length;
   bless.dataset.advConfig=JSON.stringify({type:'ringPick',value:'Water',revision:1});document.getElementById('disadvList').appendChild(bless);const wrongList=A.unmet(storm,{}).length;
   Q.setup('Isawa Shugenja');const guard=Q.find('Elemental Guard');const water=A.unmet(guard,{element:'Water'}).length;const voidElement=A.unmet(guard,{element:'Void'}).length;const missing=A.unmet(guard,{}).length;
   document.getElementById('f_schoolAffinity').value='Air';const cannotCast=A.unmet(guard,{element:'Water'}).length;
   return {all,wrongFamily,duplicate,lowWeapon,blessed,wrongBless,wrongList,water,voidElement,missing,cannotCast};
  });
  check('AS47-LION-FAMILY',r.wrongFamily>r.all);check('AS47-LION-DISTINCT-WEAPONS',r.duplicate>r.all);check('AS47-LION-LOW-WEAPON-COUNTS',r.lowWeapon,r.all);
  check('AS47-STORM-BLESSING-ELEMENT',r.wrongBless>r.blessed);check('AS47-STORM-BLESSING-CORRECT-LIST',r.wrongList>r.blessed);
  check('AS47-ELEMENT-NON-VOID',r.voidElement>r.water);check('AS47-ELEMENT-CHOICE-REQUIRED',r.missing>r.water);check('AS47-ELEMENT-CASTING-ML4',r.cannotCast>r.water);
 });
 const confirmations={
  Kenshinzen:['kenshinzen-duel'],"The Lion's Pride":['lions-pride-female'],
  'Scorpion Instigator':['instigator-four-blackmail-targets','instigator-secret-disclosed'],
  'Obsidian Warrior':['obsidian-sensei-skirmish'],'The White Guard':['white-guard-faith-or-era']
 };
 for(const [name,ids]of Object.entries(confirmations))await section('AS47-NARRATIVE-'+name,async()=>{
  const r=await page.evaluate(({name,ids})=>{const Q=window.__asQA,T=window.__L5R_TEST__,A=T.AS47;Q.setup();Q.add('Blackmail');T.recalcAll();A.enter(Q.find(name).name);const blocked=!A.record()?.name;A.enter(Q.find(name).name,{confirmations:ids});return {blocked,entered:A.record()?.name===Q.find(name).name};},{name,ids});
  check('AS47-NARRATIVE-REQUIRED-'+name,r.blocked);check('AS47-NARRATIVE-CONFIRMED-'+name,r.entered);
 });
 for(const name of Object.keys(numeric))await section('AS47-ALL-TECHNIQUES-'+name,async()=>{
  const r=await page.evaluate(({name,confirmations})=>{const Q=window.__asQA,T=window.__L5R_TEST__,A=T.AS47;Q.setup(['Storm Riders','Elemental Guard'].includes(name)?'Isawa Shugenja':'Hida Bushi');Q.add('Blackmail');T.recalcAll();A.enter(Q.find(name).name,{element:'Water',confirmations});Q.setInsight(250);return {name:A.record()?.name,rank:A.rank(),n:Q.advancedTechs().length,free:Q.advancedTechs().every(e=>e.cost===0),basic:Q.basic().rank};},{name,confirmations:confirmations[name]||[]});
  check('AS47-ALL-SCHOOLS-ADVANCE-'+name,r,{name,rank:3,n:3,free:true,basic:3});
 });
 await section('AS47-GATES',async()=>{
  await page.evaluate(()=>window.__asQA.setup('Hida Bushi',false));
  const noAdv=await page.evaluate(()=>{const Q=window.__asQA,A=window.__L5R_TEST__.AS47;A.enter(Q.find('Defender of the Wall').name);return A.record();});
  check('AS47-DIRECT-MULTIPLE-SCHOOLS-GATE',!noAdv?.name);
  check('AS47-ELIGIBLE-WITHOUT-ADV-DISABLED',await page.evaluate(()=>{const p=document.getElementById('advancedSchoolPicker');return !!p&&p.disabled&&p.getClientRects().length>0;}));
  await page.evaluate(()=>window.__asQA.setup());
  const bad=await page.evaluate(()=>{const Q=window.__asQA,A=window.__L5R_TEST__.AS47;Q.edit('traits','Strength',4);A.enter(Q.find('Defender of the Wall').name);return A.record();});
  check('AS47-DIRECT-PREREQUISITE-GATE',!bad?.name);
  await page.evaluate(()=>window.__asQA.setup());
  check('AS47-UNKNOWN-SCHOOL-GATE',await page.evaluate(()=>{const A=window.__L5R_TEST__.AS47;A.enter('Defender of the Wall impostor');return !A.record()?.name;}));
  await page.evaluate(()=>{window.__asQA.setup();const T=window.__L5R_TEST__;T.MODES12?.set('play');});
  const play=await page.evaluate(()=>{const T=window.__L5R_TEST__,Q=window.__asQA;T.AS47.enter(Q.find('Defender of the Wall').name);return {modes:T.MODES12?.isPlay(),held:!!T.AS47.record()?.name};});
  check('AS47-DIRECT-PLAY-GATE',play.held,!play.modes);
 });
 await section('AS47-UI',async()=>{
  const hidden=await page.evaluate(()=>{const T=window.__L5R_TEST__;T.resetToBaseline();T.MODES12?.set('management');T.AS47.refresh();return document.getElementById('advancedSchoolPanel').hidden;});
  check('AS47-NO-ELIGIBLE-HIDDEN',hidden);
  await page.evaluate(()=>{const Q=window.__asQA,T=window.__L5R_TEST__;Q.setup();document.getElementById('advancedSchoolPicker').value='Kenshinzen';document.getElementById('advancedSchoolPicker').dispatchEvent(new Event('change',{bubbles:true}));});
  check('AS47-UI-NARRATIVE-BUTTON-DISABLED',await page.locator('#advancedSchoolEnter').isDisabled());
  await page.locator('#advancedSchoolConfirmations input').check();
  check('AS47-UI-NARRATIVE-BUTTON-ENABLED',await page.locator('#advancedSchoolEnter').isEnabled());
  await page.locator('#advancedSchoolEnter').click();
  check('AS47-UI-ENTRY',await page.evaluate(()=>window.__L5R_TEST__.AS47.record()?.name),'Kenshinzen');
  const event=await page.evaluate(()=>{const Q=window.__asQA,T=window.__L5R_TEST__,A=T.AS47;Q.setup();A.enter('Defender of the Wall');const field=document.getElementById('f_insightBonus');field.value=String(Number(field.value)+25);field.dispatchEvent(new Event('input',{bubbles:true}));return {rank:A.rank(),n:Q.advancedTechs().length};});
  check('AS47-CAPTURED-RECALC-EVENT',event,{rank:1,n:1});
  const elements=await page.evaluate(()=>{const Q=window.__asQA,T=window.__L5R_TEST__;Q.setup('Isawa Shugenja');Q.setInsight(200);Q.edit('rings','Fire',5);Q.setInsight(200);const p=document.getElementById('advancedSchoolPicker');p.value='Elemental Guard';p.dispatchEvent(new Event('change',{bubbles:true}));const before=[...document.getElementById('advancedSchoolElement').options].map(e=>e.value);Q.edit('rings','Air',5);Q.edit('rings','Fire',6);Q.setInsight(200);const after=[...document.getElementById('advancedSchoolElement').options].map(e=>e.value);return {before,after};});
  check('AS47-ELEMENT-OPTIONS-INITIAL',elements.before.includes('Air')&&!elements.before.includes('Fire'));
  check('AS47-ELEMENT-OPTIONS-REFRESH',elements.after.includes('Fire')&&!elements.after.includes('Air'));
 });
 await section('AS47-BASIC-SCHOOL-PROTECTION',async()=>{
  const r=await page.evaluate(()=>{const T=window.__L5R_TEST__,Q=window.__asQA,A=T.AS47;Q.setup();A.enter('Defender of the Wall');const before=JSON.stringify(T.getSchoolsList());T.addSchoolToCharacter('Hiruma Bushi');const addBlocked=JSON.stringify(T.getSchoolsList())===before;
   document.getElementById('cfs_clan').value='Crab';document.getElementById('cfs_clan').dispatchEvent(new Event('change',{bubbles:true}));document.getElementById('cfs_school').value='Hiruma Bushi';document.getElementById('cfs_applySchool').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));const applyBlocked=JSON.stringify(T.getSchoolsList())===before;
   const name=document.getElementById('f_school');name.value='Hiruma Bushi';name.dispatchEvent(new Event('input',{bubbles:true}));const renameBlocked=name.value==='Hida Bushi'&&JSON.stringify(T.getSchoolsList())===before;return {addBlocked,applyBlocked,renameBlocked};});
  check('AS47-EARLY-BASIC-ADD-BLOCKED',r.addBlocked);check('AS47-APPLY-CANNOT-RESET-TRAINING',r.applyBlocked);check('AS47-TYPING-CANNOT-RENAME-TRAINING',r.renameBlocked);
 });
 await section('AS47-PROGRESSION',async()=>{
  const before=await page.evaluate(()=>{const Q=window.__asQA;Q.setup();return {basic:Q.basic(),techs:Q.techs(),skills:window.__L5R_TEST__.collectData().skills};});
  const first=await page.evaluate(()=>{const Q=window.__asQA,A=window.__L5R_TEST__.AS47;A.enter(Q.find('Defender of the Wall').name);return {rank:A.rank(),basic:Q.basic(),techs:Q.techs(),record:A.record()};});
  check('AS47-ENTRY-SAVED',!!first.record?.name);check('AS47-ENTRY-NO-FREE-RANK',first.rank,0);
  check('AS47-ENTRY-FREEZES-BASIC',first.basic.list.at(-1).frozen,true);check('AS47-ENTRY-PRESERVES-BASIC-RANK',first.basic.rank,before.basic.rank);
  check('AS47-ENTRY-KEEPS-TECHNIQUES',first.techs,before.techs);
  const levels=[];for(const insight of [199,200,224,225,249,250,275])levels.push(await page.evaluate(insight=>{const Q=window.__asQA,A=window.__L5R_TEST__.AS47;Q.setInsight(insight);return {rank:A.rank(),basic:Q.basic().rank,techs:Q.advancedTechs()};},insight));
  check('AS47-NEXT-INSIGHT-RANKS',levels.map(e=>e.rank),[0,1,1,2,2,3,3]);
  check('AS47-THREE-TECHNIQUE-LEVELS',levels.map(e=>e.techs.length),[0,1,1,2,2,3,3]);
  check('AS47-BASIC-STAYS-FROZEN',levels.map(e=>e.basic),[3,3,3,3,3,3,3]);
  check('AS47-FREE-TECHNIQUES',levels.at(-1).techs.map(e=>e.cost),[0,0,0]);
  check('AS47-OWN-DESCRIPTIONS',levels.at(-1).techs.every(e=>e.desc.length>70&&/Core/.test(e.desc)));
  const repeated=await page.evaluate(()=>{const T=window.__L5R_TEST__,Q=window.__asQA;for(let i=0;i<5;i++)T.recalcAll();return {techs:Q.advancedTechs(),skills:T.collectData().skills};});
  check('AS47-NO-DUPLICATE-GRANTS',repeated.techs,levels.at(-1).techs);check('AS47-NO-SKILL-GRANTS',repeated.skills,before.skills);
  const lower=await page.evaluate(()=>{const Q=window.__asQA,A=window.__L5R_TEST__.AS47;Q.edit('traits','Strength',2);Q.setInsight(150);return {rank:A.rank(),n:Q.advancedTechs().length,basic:Q.basic().rank};});
  check('AS47-EARNED-RANK-PRESERVED',lower,{rank:3,n:3,basic:3});
  check('AS47-SECOND-SCHOOL-REFUSED',await page.evaluate(()=>{const Q=window.__asQA,A=window.__L5R_TEST__.AS47;const before=A.record().name;A.enter(Q.find('Swordmasters').name);return A.record().name===before;}));
 });
 await section('AS47-PERSISTENCE',async()=>{
  const saved=await page.evaluate(()=>{const Q=window.__asQA,T=window.__L5R_TEST__;Q.setup();T.AS47.enter(Q.find('Defender of the Wall').name);Q.setInsight(225);return T.collectData();});
  check('AS47-FORMAT-STEP',saved.schemaVersion,5);
  const loaded=await page.evaluate(save=>{const T=window.__L5R_TEST__,Q=window.__asQA;T.resetToBaseline();T.applyData(save);T.recalcAll();return {name:T.AS47.record()?.name,rank:T.AS47.rank(),basic:Q.basic().rank,count:Q.advancedTechs().length};},saved);
  check('AS47-ROUNDTRIP',loaded,{name:saved.fields.f_advancedSchoolData?JSON.parse(saved.fields.f_advancedSchoolData).name:'MISSING',rank:2,basic:3,count:2});
  const clear=await page.evaluate(save=>{const T=window.__L5R_TEST__,Q=window.__asQA;Q.setup();const blank=T.collectData();delete blank.fields.f_advancedSchoolData;T.applyData(save);T.applyData(blank);return {held:!!T.AS47.record()?.name,count:Q.advancedTechs().length};},saved);
  check('AS47-CURRENT-MISSING-FIELD-NO-LEAK',clear,{held:false,count:0});
  check('AS47-ORDINARY-LOAD-RESTORES-BASIC-PICKER',await page.evaluate(()=>!document.getElementById('addSchoolSelect').disabled));
  const legacy=await page.evaluate(save=>{const T=window.__L5R_TEST__,Q=window.__asQA;Q.setup();const blank=T.collectData();blank.schemaVersion=4;delete blank.fields.f_advancedSchoolData;T.applyData(save);T.applyData(blank);return {held:!!T.AS47.record()?.name,count:Q.advancedTechs().length};},saved);
  check('AS47-LEGACY-NO-LEAK',legacy,{held:false,count:0});
  check('AS47-RESET-CLEARS',await page.evaluate(save=>{const T=window.__L5R_TEST__,Q=window.__asQA;T.applyData(save);T.resetToBaseline();return !T.AS47.record()?.name&&Q.advancedTechs().length===0;},saved));
 });
 await section('AS47-PRIOR-SCHOOLS-AND-PATHS',async()=>{
  const r=await page.evaluate(()=>{const T=window.__L5R_TEST__,Q=window.__asQA,A=T.AS47;Q.setup();Q.setInsight(150);T.savePathTaken({'2':'Crab Berserker [Bushi]'},'Hida Bushi');T.recalcAll();
   for(const name of ['Athletics','Hunting'])document.getElementById('skillsBody').appendChild(T.makeSkillRow({name,trait:'Perception',rank:6}));
   T.saveSchoolsList([{name:'Hida Bushi',frozen:true,frozenRank:2,floorRank:2,anchorInsightRank:0},{name:'Hiruma Bushi',frozen:false,frozenRank:null,floorRank:1,anchorInsightRank:2}]);document.getElementById('f_school').value='Hiruma Bushi';Q.setInsight(175);const before={techs:Q.techs(),paths:document.getElementById('f_pathTaken').value};A.enter('Defender of the Wall');Q.setInsight(250);return {paths:document.getElementById('f_pathTaken').value===before.paths,prior:before.techs.every(t=>Q.techs().some(n=>n.name===t.name&&n.desc===t.desc)),ranks:Q.basic().list.map(e=>e.frozenRank),advanced:A.rank()};});
  check('AS47-PRIOR-PATH-RECORD-KEPT',r.paths);check('AS47-PRIOR-SCHOOL-TECHNIQUES-KEPT',r.prior);check('AS47-MULTIPLE-BASIC-RANKS-FROZEN',r.ranks,[2,1]);check('AS47-ADVANCE-AFTER-MULTIPLE-BASICS',r.advanced,3);
 });
 await section('AS47-RESUME',async()=>{
  const r=await page.evaluate(()=>{const T=window.__L5R_TEST__,Q=window.__asQA,A=T.AS47;Q.setup();A.enter(Q.find('Defender of the Wall').name);Q.setInsight(225);A.resumeBasic({gmApproved:true});const early=Q.basic().list.at(-1).frozen;
   Q.setInsight(250);A.resumeBasic();const noGm=Q.basic().list.at(-1).frozen;A.resumeBasic({gmApproved:true});const resumed=Q.basic();Q.setInsight(275);const next=Q.basic();const name=A.record().name;A.enter(Q.find('Swordmasters').name);return {early,noGm,resumed:resumed.rank,next:next.rank,advanced:A.rank(),kept:A.record().name===name};});
  check('AS47-RESUME-ONLY-AFTER-THREE',r.early);check('AS47-RESUME-REQUIRES-GM',r.noGm);check('AS47-RESUME-NO-FREE-BASIC-RANK',r.resumed,3);check('AS47-RESUME-NEXT-INSIGHT',r.next,4);check('AS47-RESUME-KEEPS-ADVANCED',r.advanced,3);check('AS47-ONE-ADVANCED-EVER',r.kept);
 });
 await section('AS47-OTHER-BASIC',async()=>{
  const r=await page.evaluate(()=>{const T=window.__L5R_TEST__,Q=window.__asQA,A=T.AS47;Q.setup();A.enter('Defender of the Wall');Q.setInsight(250);T.addSchoolToCharacter('Hiruma Bushi');const withoutPermission=Q.basic().list.length;A.allowFurtherTraining(true);T.addSchoolToCharacter('Hiruma Bushi');const atAdd=Q.basic();Q.setInsight(275);return {withoutPermission,atAdd:atAdd.rank,next:Q.basic().rank,n:Q.basic().list.length,advanced:A.rank()};});
  check('AS47-OTHER-BASIC-GM-REQUIRED',r.withoutPermission,1);check('AS47-OTHER-BASIC-STARTS-ZERO',r.atAdd,0);check('AS47-OTHER-BASIC-COMBINED-CAP',{next:r.next,n:r.n,advanced:r.advanced},{next:1,n:2,advanced:3});
 });
 await section('AS47-CASTER-EXCLUSIVITY',async()=>{
  const r=await page.evaluate(()=>{const T=window.__L5R_TEST__,Q=window.__asQA,A=T.AS47;Q.setup('Hida Bushi');const bushi=A.unmet(Q.find('Storm Riders'),{});A.enter('Storm Riders');const bushiBlocked=!A.record();Q.setup('Isawa Shugenja');const shugenja=A.unmet(Q.find('Defender of the Wall'),{});A.enter('Defender of the Wall');const shugenjaBlocked=!A.record();Q.setup('Doji Courtier');A.enter('Defender of the Wall');Q.setInsight(250);A.allowFurtherTraining(true);T.addSchoolToCharacter('Isawa Shugenja');return {bushi:bushi.length>0,bushiBlocked,shugenja:shugenja.length>0,shugenjaBlocked,laterBlocked:Q.basic().list.length===1,lock:T.characterCasterLock()};});
  check('AS47-BUSHI-CANNOT-ENTER-SHUGENJA',r.bushi&&r.bushiBlocked);check('AS47-SHUGENJA-CANNOT-ENTER-BUSHI',r.shugenja&&r.shugenjaBlocked);check('AS47-ADVANCED-BUSHI-BLOCKS-LATER-SHUGENJA',r.laterBlocked);check('AS47-ADVANCED-CASTER-LOCK',r.lock,'bushi');
 });
 await section('AS47-CASTER-PRESERVED',async()=>{
  const r=await page.evaluate(()=>{const T=window.__L5R_TEST__,Q=window.__asQA;Q.setup('Isawa Shugenja');const before={school:Q.basic().name,rank:Q.basic().rank,water:T.effectiveSchoolRankForElement('Water'),universal:T.effectiveSchoolRankForElement('Universal')};T.AS47.enter(Q.find('Elemental Guard').name,{element:'Water',confirmations:[]});Q.setInsight(250);const after={school:Q.basic().name,rank:Q.basic().rank,water:T.effectiveSchoolRankForElement('Water'),universal:T.effectiveSchoolRankForElement('Universal')};return {before,after,entered:!!T.AS47.record()?.name};});
  check('AS47-CASTER-ENTRY',r.entered);check('AS47-NO-AUTO-CASTER-SYNERGY',r.after,r.before);
 });
 await section('AS47-APPROVAL-AND-SAVE-REFUSALS',async()=>{
  const r=await page.evaluate(()=>{
   const T=window.__L5R_TEST__,Q=window.__asQA,A=T.AS47;Q.setup();A.enter('Defender of the Wall');Q.setInsight(250);
   A.allowFurtherTraining(true);A.allowFurtherTraining(false);
   const revoked=A.record().allowBasic===false,disabled=document.getElementById('advancedSchoolResume').disabled;
   const save=T.collectData(),snapshot=JSON.stringify(save),cases={};
   for(const kind of ['malformed-json','allowBasic-string','resumed-string','newer-version']){
    const bad=JSON.parse(JSON.stringify(save));
    if(kind==='malformed-json')bad.fields.f_advancedSchoolData='{broken';
    else if(kind==='newer-version')bad.schemaVersion=999;
    else {const record=JSON.parse(bad.fields.f_advancedSchoolData);if(kind==='allowBasic-string')record.allowBasic='false';else record.resumed='true';bad.fields.f_advancedSchoolData=JSON.stringify(record);}
    cases[kind]={refused:T.applyData(bad)===false,unchanged:JSON.stringify(T.collectData())===snapshot};
   }
   return {revoked,disabled,cases};
  });
  check('AS47-GM-APPROVAL-REVOCABLE',r.revoked);check('AS47-GM-REVOKED-RESUME-DISABLED',r.disabled);
  for(const [kind,result]of Object.entries(r.cases)){check('AS47-SAVE-REFUSED-'+kind,result.refused);check('AS47-SAVE-ATOMIC-'+kind,result.unchanged);}
 });
};
