'use strict';
const {chromium}=require('playwright'),{pathToFileURL}=require('url'),path=require('path');
const out=[];function check(id,actual,expected=true){const pass=JSON.stringify(actual)===JSON.stringify(expected);out.push({id,pass});console.log((pass?'PASS ':'FAIL ')+id+(pass?'':' actual='+JSON.stringify(actual)+' expected='+JSON.stringify(expected)));}
(async()=>{
 const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('net::'))errors.push(m.text());});
 await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.route('https://fonts.gstatic.com/**',r=>r.abort());
 try{
 await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);await page.waitForFunction(()=>window.__L5R_TEST__&&window.__L5R_CAROUSEL__?.isReady?.()&&window.__L5R_TEST__.CL11.ready);
 const cap=await page.evaluate(()=>!!window.__L5R_TEST__.MISSING_BASIC_SCHOOLS_ENABLED&&!!window.__L5R_TEST__.BASIC47&&window.__L5R_TEST__.MISSING_BASIC_SCHOOL_DATA?.length===2);check('BASIC-CAPABILITY',cap);
 if(cap){
  await page.evaluate(()=>{const T=window.__L5R_TEST__;T.CL11.close();T.resetToBaseline();T.MODES12.set('management');});
  check('BASIC-SCOUT-RESOLVES',await page.evaluate(()=>window.__L5R_TEST__.resolveSchoolName('Hiruma Scout')),'Hiruma Scout [Bushi]');
  check('BASIC-PATH-RESOLUTION',await page.evaluate(()=>window.__L5R_TEST__.AP46.assertResolve()),[]);
  check('BASIC-TECHNIQUE-CLASH-CHECK',await page.evaluate(()=>window.__L5R_TEST__.TECHNAMES.assertResolve()),[]);
  check('BASIC-SCOUT-PATHS-UNLOCKED',await page.evaluate(()=>{const T=window.__L5R_TEST__;return T.ALTERNATE_PATH_LIBRARY.filter(p=>p.replaces.some(c=>c.school==='Hiruma Scout')).every(p=>p.replaces.filter(c=>c.school==='Hiruma Scout').every(c=>!c.notInSheet&&T.pathAvailableFor(p,'Hiruma Scout [Bushi]',c.rank)));}));
  check('BASIC-RONIN-PATH-PRESERVED',await page.evaluate(()=>window.__L5R_TEST__.techniqueDescription('Shelter the Blameless').includes('Sword of Yotsu')));
  check('BASIC-YOTSU-DISTINCT-TEXT',await page.evaluate(()=>window.__L5R_TEST__.techniqueDescription('Shelter the Blameless (Yotsu Bushi)').includes('Imperial Histories')));
  for(const [id,clan,minor,school,trait,honor,skills]of [
   ['SCOUT','Crab',null,'Hiruma Scout [Bushi]','trait_reflexes',4.5,['Athletics','Hunting','Kenjutsu','Kyujutsu','Lore: Shadowlands','Stealth']],
   ['YOTSU','Minor Clan','Tiger','Yotsu Bushi School (Heroes of Rokugan) [Bushi]','trait_agility',5.5,['Commerce','Hunting','Kenjutsu','Kyujutsu','Stealth']]
  ]){
   const initial=await page.evaluate(({clan,minor,school,trait})=>{const T=window.__L5R_TEST__;T.resetToBaseline();T.MODES12.set('management');const c=document.getElementById('cfs_clan');c.value=clan;c.dispatchEvent(new Event('change',{bubbles:true}));if(minor){const m=document.getElementById('cfs_minorClan');m.value=minor;m.dispatchEvent(new Event('change',{bubbles:true}));}const s=document.getElementById('cfs_school');const offered=[...s.options].some(o=>o.value===school);s.value=school;s.dispatchEvent(new Event('change',{bubbles:true}));return {offered,before:Number(document.getElementById(trait).value)};},{clan,minor,school,trait});
   check('BASIC-PICKER-'+id,initial.offered);
   await page.evaluate(()=>document.getElementById('cfs_applySchool').click());
   await page.waitForFunction(s=>document.getElementById('f_school').value===s,school);
   const actual=await page.evaluate(({trait})=>{const T=window.__L5R_TEST__;return {benefit:Number(document.getElementById(trait).value),honor:Number(document.getElementById('f_honorRank').value),skills:[...document.querySelectorAll('#skillsBody .sk-name')].map(e=>e.value),free:[...document.querySelectorAll('#skillsBody tr')].every(r=>r.querySelector('.sk-school').checked&&Number(r.querySelector('.sk-rank').value)===1),emph:T.hasSkillEmphasis('Stealth','Sneaking')};},{trait});
   check('BASIC-BENEFIT-'+id,actual.benefit,initial.before+1);check('BASIC-HONOR-'+id,actual.honor,honor);check('BASIC-SKILLS-'+id,actual.skills.sort(),skills.sort());check('BASIC-FREE-RANKS-'+id,actual.free);check('BASIC-EMPHASIS-'+id,actual.emph);
   await page.evaluate(()=>document.getElementById('cfs_applySchool').click());
   check('BASIC-NO-DUPLICATE-GRANTS-'+id,await page.evaluate(()=>[...document.querySelectorAll('#skillsBody .sk-name')].map(e=>e.value).sort()),skills.sort());
   const progression=await page.evaluate(school=>{const T=window.__L5R_TEST__;document.getElementById('f_insightBonus').value=225-Number(document.getElementById('f_insightPts').value)+Number(document.getElementById('f_insightBonus').value);T.recalcAll();const list=[...document.querySelectorAll('#techList .entry')].filter(r=>r.querySelector('.en-desc').value.startsWith('[School Technique')).map(r=>({name:r.querySelector('.en-name').value,desc:r.querySelector('.en-desc').value,cost:Number(r.querySelector('.en-cost').value)}));const saved=T.collectData();T.resetToBaseline();T.applyData(saved);T.recalcAll();return {rank:Number(document.getElementById('f_rank').value),names:list.map(t=>t.name),reference:list.every(t=>t.desc.includes('Imperial Histories')&&t.cost===0),loaded:document.getElementById('f_school').value,loadedCount:[...document.querySelectorAll('#techList .en-desc')].filter(r=>r.value.startsWith('[School Technique')).length};},school);
   check('BASIC-FIVE-RANKS-'+id,progression.rank,5);check('BASIC-TECH-COUNT-'+id,progression.names.length,5);check('BASIC-REFERENCES-'+id,progression.reference);check('BASIC-SAVE-SCHOOL-'+id,progression.loaded,school);check('BASIC-SAVE-NO-DUPLICATE-TECH-'+id,progression.loadedCount,5);
  }
  check('BASIC-YOTSU-LORE-CHOICES',await page.evaluate(()=>{const T=window.__L5R_TEST__,spec=T.CW1122.parseChoice(T.BASIC47.loreChoice);return T.CW1122.groupsForSpec(spec).flatMap(g=>g.options);}),['Lore: Gaijin','Lore: Shadowlands']);
  check('BASIC-YOTSU-TWO-FREE-SLOTS',await page.evaluate(()=>window.__L5R_TEST__.CW1122.slots().length),2);
  for(const subject of ['Gaijin','Shadowlands'])check('BASIC-YOTSU-ADD-LORE-'+subject,await page.evaluate(subject=>{const T=window.__L5R_TEST__,row=T.CW1121.addSkill('Lore: '+subject,'',true);if(!row)return null;const data={name:row.querySelector('.sk-name').value,trait:row.querySelector('.sk-trait').value,rank:Number(row.querySelector('.sk-rank').value),free:row.querySelector('.sk-school').checked};T.CW1121.removeRow(row);return data;},subject),{name:'Lore: '+subject,trait:'Intelligence',rank:1,free:true});
  check('BASIC-TIGER-FAMILY',await page.evaluate(()=>{document.getElementById('cfs_clan').value='Minor Clan';document.getElementById('cfs_clan').dispatchEvent(new Event('change',{bubbles:true}));document.getElementById('cfs_minorClan').value='Tiger';document.getElementById('cfs_minorClan').dispatchEvent(new Event('change',{bubbles:true}));const before=Number(document.getElementById('trait_intelligence').value);document.getElementById('cfs_family').value='Yotsu';document.getElementById('cfs_applyFamily').click();return {clan:document.getElementById('f_clan').value,family:document.getElementById('f_family').value,bonus:Number(document.getElementById('trait_intelligence').value)-before};}),{clan:'Tiger',family:'Yotsu',bonus:1});
  check('BASIC-SCOUT-NO-INVENTED-OUTFIT',await page.evaluate(()=>window.__L5R_TEST__.findAnySchoolLibraryEntry('Hiruma Scout [Bushi]').outfit),'');
 }
 check('BASIC-NO-PAGE-ERRORS',errors,[]);
 }catch(e){check('BASIC-UNEXPECTED-EXCEPTION',String(e),null);}finally{await browser.close();}
 const pass=out.filter(r=>r.pass).length;console.log(`${pass}/${out.length} checks passed`);process.exitCode=pass===out.length&&pass>2?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
