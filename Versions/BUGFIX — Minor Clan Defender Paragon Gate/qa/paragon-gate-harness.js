'use strict';
const {chromium}=require('playwright'),{pathToFileURL}=require('url'),path=require('path');
const results=[];
function check(id,actual,expected=true){const pass=JSON.stringify(actual)===JSON.stringify(expected);results.push({id,pass});console.log((pass?'PASS ':'FAIL ')+id+(pass?'':' actual='+JSON.stringify(actual)+' expected='+JSON.stringify(expected)));}
(async()=>{
 const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.route('https://fonts.gstatic.com/**',r=>r.abort());
 try{
  await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);
  await page.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready&&window.__L5R_CAROUSEL__?.isReady?.());
  await page.evaluate(()=>{
   const T=window.__L5R_TEST__,A=T.AS47;
   window.Q={T,A,config:tenet=>({type:'paragonTenet',revision:1,tenet,value:tenet}),
    add(name,config,dis=false){const row=T.makeEntry({name,cost:0,desc:''},true);document.getElementById(dis?'disadvList':'advList').appendChild(row);if(config!==undefined)row.dataset.advConfig=JSON.stringify(config);return row;},
    entry(){return A.find('Minor Clan Defender');},qualified(){return !A.unmet(this.entry()).length;},
    setup(){T.CL11.close();T.resetToBaseline();T.MODES12.set('management');T.clearAllRows();A.save(null);document.getElementById('f_clan').value='Badger';document.getElementById('f_family').value='Ichiro';document.getElementById('f_school').value='Ichiro Bushi';T.saveSchoolsList([{name:'Ichiro Bushi',frozen:false,frozenRank:null,floorRank:1,anchorInsightRank:0}]);for(const id of ['trait_stamina','trait_willpower','trait_agility','trait_intelligence','trait_reflexes','trait_awareness','trait_strength','trait_perception'])document.getElementById(id).value=2;document.getElementById('trait_agility').value=5;document.getElementById('trait_strength').value=4;document.getElementById('ring_void').value=2;document.getElementById('skillsBody').appendChild(T.makeSkillRow({name:'Kenjutsu',trait:'Agility',rank:5}));document.getElementById('f_insightBonus').value=70;this.add('Multiple Schools');T.recalcAll();},
    refresh(){T.recalcAll();A.refresh();},
    selected(){const s=document.getElementById('advancedSchoolPicker');s.value='Minor Clan Defender';s.dispatchEvent(new Event('change',{bubbles:true}));}
   };
  });
  check('PG47-CAPABILITY',await page.evaluate(()=>!!Q.T.PG47&&Q.T.PARAGON_GATE_ENABLED===true));
  check('PG47-NO-PARAGON',await page.evaluate(()=>{Q.setup();return Q.qualified();}),false);
  check('PG47-UNCONFIGURED',await page.evaluate(()=>{Q.add('Paragon');Q.refresh();return Q.qualified();}),false);
  check('PG47-UNCONFIGURED-PICKER',await page.evaluate(()=>[...document.getElementById('advancedSchoolPicker').options].some(o=>o.value==='Minor Clan Defender')),false);
  check('PG47-UNCONFIGURED-DIRECT-ENTRY',await page.evaluate(()=>Q.A.enter('Minor Clan Defender',{})),false);
  for(const tenet of ['Compassion','Courage','Courtesy','Duty','Honesty','Honor','Sincerity']){
   check('PG47-VALID-'+tenet,await page.evaluate(tenet=>{Q.setup();Q.add('Paragon',Q.config(tenet));Q.refresh();return Q.qualified();},tenet));
  }
  const malformed={empty:{},wrongType:{type:'skillPick',revision:1,tenet:'Courage'},wrongRevision:{type:'paragonTenet',revision:2,tenet:'Courage'},unknownTenet:{type:'paragonTenet',revision:1,tenet:'Determination'},extraKey:{type:'paragonTenet',revision:1,tenet:'Courage',bonus:99},array:[],null:null};
  for(const [label,config]of Object.entries(malformed))check('PG47-INVALID-'+label,await page.evaluate(config=>{Q.setup();Q.add('Paragon',config);Q.refresh();return Q.qualified();},config),false);
  check('PG47-BAD-JSON',await page.evaluate(()=>{Q.setup();Q.add('Paragon').dataset.advConfig='{';Q.refresh();return Q.qualified();}),false);
  check('PG47-DISADVANTAGE-DOES-NOT-COUNT',await page.evaluate(()=>{Q.setup();Q.add('Paragon',Q.config('Courage'),true);Q.add('Paragon');Q.refresh();return Q.qualified();}),false);
  check('PG47-WRONG-NAME-DOES-NOT-COUNT',await page.evaluate(()=>{Q.setup();Q.add('Dark Paragon',Q.config('Courage'));Q.add('Paragon');Q.refresh();return Q.qualified();}),false);
  check('PG47-ONE-VALID-ROW-SUFFICES',await page.evaluate(()=>{Q.setup();Q.add('Paragon');Q.add('Paragon',Q.config('Duty'));Q.refresh();return Q.qualified();}));
  check('PG47-PREREQUISITES-STILL-APPLY',await page.evaluate(()=>{document.getElementById('trait_agility').value=4;Q.refresh();return Q.qualified();}),false);
  check('PG47-OTHER-SCHOOL-UNAFFECTED',await page.evaluate(()=>{Q.setup();Q.add('Paragon');for(const id of ['trait_agility','trait_reflexes'])document.getElementById(id).value=4;for(const name of ['Acting','Knives','Stealth'])document.getElementById('skillsBody').appendChild(Q.T.makeSkillRow({name,trait:'Agility',rank:5}));Q.refresh();return Q.A.unmet(Q.A.find('Kolat Assassin'));}),[]);
  await page.evaluate(()=>{Q.setup();window.pgRow=Q.add('Paragon');Q.refresh();Q.T.P4518.open(pgRow,Q.T.advConfigSchemaFor('Paragon'));});
  // Opening/cancelling the configuration is not a purchase of a virtue.
  check('PG47-OPEN-MODAL',await page.locator('#advConfigModalOverlay').isVisible());
  await page.evaluate(()=>Q.T.closeAdvConfigModal());
  check('PG47-CANCEL-STILL-BLOCKED',await page.evaluate(()=>Q.qualified()),false);
  await page.evaluate(()=>Q.T.P4518.open(pgRow,Q.T.advConfigSchemaFor('Paragon')));
  await page.locator('input[name="p4518Tenet"][value="Courage"]').check();
  await page.locator('#advConfigConfirm').click();
  check('PG47-CONFIRMED-PICKER',await page.evaluate(()=>{Q.refresh();return [...document.getElementById('advancedSchoolPicker').options].some(o=>o.value==='Minor Clan Defender');}));
  await page.evaluate(()=>{Q.selected();});
  check('PG47-BEGIN-ENABLED',await page.locator('#advancedSchoolEnter').isEnabled());
  // Use the real button even when another tab's carousel position makes it offscreen.
  await page.evaluate(()=>document.getElementById('advancedSchoolEnter').click());
  check('PG47-ENTRY-RANK-ZERO',await page.evaluate(()=>[Q.A.record()?.name,Q.A.rank()]),['Minor Clan Defender',0]);
  const persisted=await page.evaluate(()=>{pgRow.remove();Q.refresh();document.getElementById('f_insightBonus').value=145;Q.refresh();const saved=Q.T.collectData();Q.T.resetToBaseline();Q.T.applyData(saved);Q.refresh();return {name:Q.A.record()?.name,rank:Q.A.rank(),techniques:[...document.querySelectorAll('#techList .entry')].filter(r=>r.querySelector('.en-desc').value.startsWith('[Advanced School')).map(r=>r.querySelector('.en-name').value)};});
  check('PG47-EXISTING-ENROLLMENT-PRESERVED',persisted,{name:'Minor Clan Defender',rank:3,techniques:['Know No Boundaries','The Speed of Certainty','The Strength of Humility']});
 }catch(e){check('PG47-EXCEPTION',String(e),null);}finally{
  check('PG47-NO-PAGE-ERRORS',errors,[]);await browser.close();const n=results.filter(r=>r.pass).length;console.log(n+'/'+results.length+' checks passed');process.exitCode=n===results.length?0:1;
 }
})();
