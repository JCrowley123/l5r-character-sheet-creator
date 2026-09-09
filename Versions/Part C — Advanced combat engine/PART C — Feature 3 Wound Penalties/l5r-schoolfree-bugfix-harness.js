/* =============================================================================
 * BUGFIX HARNESS — School skill free rank lost on reload
 * =============================================================================
 * Verifies that a skill a School granted at Rank N, then bought above N with XP,
 * reloads with its XP cost intact instead of being treated as entirely free.
 * DESTRUCTIVE: clears the Skills table and the School fields.
 * ============================================================================= */
(function runSchoolFreeHarness(){
  'use strict';
  const T = window.__L5R_TEST__;
  if(!T){ console.error('seam missing'); return {total:1,passed:0,failed:1,results:[]}; }
  if(typeof T.inferSchoolFreeFloor !== 'function'){
    console.error('This build does not contain the school free-rank fix.');
    return {total:1,passed:0,failed:1,results:[{section:'X',id:'X0',name:'fix present',pass:false,detail:'inferSchoolFreeFloor missing'}]};
  }
  const results=[];
  const rec=(s,id,n,p,d)=>results.push({section:s,id,name:n,pass:!!p,detail:d||''});
  const eq=(s,id,n,a,e)=>{const x=JSON.stringify(a),y=JSON.stringify(e);rec(s,id,n,x===y,x===y?'':'got '+x+' want '+y);};

  const sB=()=>document.getElementById('skillsBody');
  const cost=tr=>parseInt(tr.querySelector('.sk-cost').textContent,10);
  const free=tr=>tr.querySelector('.sk-rank').dataset.free;
  const setSchool=n=>{document.getElementById('f_school').value=n;
                      document.getElementById('f_schoolsData').value='';};
  // A LEGACY save row: {rank, school:true} with NO freeFloor key -- the shape that triggered the bug.
  const legacyRow=(name,trait,rank)=>sB().appendChild(T.makeSkillRow({name,trait,rank,school:true}));
  const clear=()=>{sB().innerHTML='';};

  // =====================================================================
  // A — the School skills-string parser
  // =====================================================================
  eq('A','A1','"Defense 2" parses to rank 2',T.schoolGrantedRankForSkill('Daidoji Iron Warrior [Bushi]','Defense'),2);
  eq('A','A2','A bare skill name is rank 1',T.schoolGrantedRankForSkill('Kakita Bushi','Kenjutsu'),1);
  eq('A','A3','A "(Emphasis)" suffix is stripped',T.schoolGrantedRankForSkill('Daidoji Iron Warrior [Bushi]','Kenjutsu'),1);
  eq('A','A4','A skill the School does not teach is 0',T.schoolGrantedRankForSkill('Kakita Bushi','Defense'),0);
  eq('A','A5','An unknown School is 0, not a crash',T.schoolGrantedRankForSkill('Not A School','Defense'),0);
  eq('A','A6','"any one Skill" slots never match',T.schoolGrantedRankForSkill('Kakita Bushi','any one Bugei or High Skill'),0);
  eq('A','A7','Empty inputs are 0',[T.schoolGrantedRankForSkill('','Defense'),T.schoolGrantedRankForSkill('Kakita Bushi','')],[0,0]);

  // =====================================================================
  // B — the reported defect
  // =====================================================================
  setSchool('Daidoji Iron Warrior [Bushi]');
  clear(); const bug = legacyRow('Defense','Reflexes',3); T.recalcAll();
  eq('B','B1','Free rank reconstructed as 2, not 3',free(bug),'2');
  eq('B','B2','XP cost is 3, not 0  <-- THE BUG',cost(bug),3);

  clear(); setSchool('Kakita Bushi');
  const g1 = legacyRow('Kenjutsu','Agility',3); T.recalcAll();
  eq('B','B3','Granted at 1, bought to 3 -> free 1, cost 5',[free(g1),cost(g1)],['1',5]);

  clear(); setSchool('Daidoji Iron Warrior [Bushi]');
  const g2 = legacyRow('Defense','Reflexes',2); T.recalcAll();
  eq('B','B4','Sitting exactly at the granted rank costs 0',[free(g2),cost(g2)],['2',0]);
  clear(); const g3 = legacyRow('Defense','Reflexes',1); T.recalcAll();
  eq('B','B5','Free rank never exceeds the current rank',[free(g3),cost(g3)],['1',0]);
  clear(); const g4 = legacyRow('Hunting','Perception',3); T.recalcAll();
  eq('B','B6','A skill filling an "any one Skill" slot gets first-rank-free',[free(g4),cost(g4)],['1',5]);

  // =====================================================================
  // C — multiple school skills, multiple upgrades
  // =====================================================================
  clear(); setSchool('Daidoji Iron Warrior [Bushi]');
  const m1=legacyRow('Defense','Reflexes',4), m2=legacyRow('Kenjutsu','Agility',2), m3=legacyRow('Battle','Perception',1);
  T.recalcAll();
  eq('C','C1','Defense 4 (free 2) -> 7 xp',[free(m1),cost(m1)],['2',7]);
  eq('C','C2','Kenjutsu 2 (free 1) -> 2 xp',[free(m2),cost(m2)],['1',2]);
  eq('C','C3','Battle 1 (free 1) -> 0 xp',[free(m3),cost(m3)],['1',0]);
  clear(); const deep = legacyRow('Defense','Reflexes',6); T.recalcAll();
  eq('C','C4','Upgraded many times: Defense 6 (free 2) -> 18 xp',[free(deep),cost(deep)],['2',18]);

  // =====================================================================
  // D — multiple / switched schools
  // =====================================================================
  clear();
  document.getElementById('f_schoolsData').value = JSON.stringify([
    {name:'Kakita Bushi', anchorInsightRank:0},
    {name:'Daidoji Iron Warrior [Bushi]', anchorInsightRank:0}
  ]);
  document.getElementById('f_school').value = 'Daidoji Iron Warrior [Bushi]';
  const ms = legacyRow('Defense','Reflexes',3); T.recalcAll();
  eq('D','D1','Multiple Schools: highest grant across all of them wins',[free(ms),cost(ms)],['2',3]);
  clear();
  document.getElementById('f_schoolsData').value = JSON.stringify([{name:'Kakita Bushi', anchorInsightRank:0}]);
  document.getElementById('f_school').value = 'Kakita Bushi';
  const sw = legacyRow('Defense','Reflexes',3); T.recalcAll();
  eq('D','D2','A School that does not teach it -> first-rank-free only',[free(sw),cost(sw)],['1',5]);
  document.getElementById('f_schoolsData').value='';

  // =====================================================================
  // E — nothing else changes
  // =====================================================================
  clear(); setSchool('Daidoji Iron Warrior [Bushi]');
  const ns = sB().appendChild(T.makeSkillRow({name:'Defense',trait:'Reflexes',rank:3,school:false}));
  T.recalcAll();
  eq('E','E1','A non-School skill is untouched: free 0, cost 6',[free(ns),cost(ns)],['0',6]);
  clear();
  const ex0 = sB().appendChild(T.makeSkillRow({name:'Defense',trait:'Reflexes',rank:3,school:true,freeFloor:'0'}));
  T.recalcAll();
  eq('E','E2','An explicit freeFloor:"0" is respected, never overridden',free(ex0),'0');
  clear();
  const ex2 = sB().appendChild(T.makeSkillRow({name:'Defense',trait:'Reflexes',rank:3,school:true,freeFloor:'2'}));
  T.recalcAll();
  eq('E','E3','An explicit freeFloor:"2" is respected',[free(ex2),cost(ex2)],['2',3]);
  clear();
  const ex5 = sB().appendChild(T.makeSkillRow({name:'Defense',trait:'Reflexes',rank:3,school:true,freeFloor:'5'}));
  T.recalcAll();
  eq('E','E4','An explicit floor above the rank still costs 0',cost(ex5),0);

  // =====================================================================
  // F — save / load
  // =====================================================================
  clear(); setSchool('Daidoji Iron Warrior [Bushi]');
  legacyRow('Defense','Reflexes',3); T.recalcAll();
  const saved = T.collectData();
  eq('F','F1','A repaired row now saves freeFloor:"2"',saved.skills[0].freeFloor,'2');
  T.applyData(JSON.parse(JSON.stringify(saved)));
  const after = sB().querySelector('tr');
  eq('F','F2','Reload keeps free 2 / cost 3',[free(after),cost(after)],['2',3]);
  const sig = JSON.stringify(T.collectData());
  T.applyData(JSON.parse(sig));
  eq('F','F3','A second round trip is stable',JSON.stringify(T.collectData()),sig);
  eq('F','F4','Save shape unchanged: still 42 fields',Object.keys(saved.fields).length,42);
  eq('F','F5','No new keys on a saved skill',
     Object.keys(saved.skills[0]).sort().join(','),
     ['name','trait','rank','emph','freeEmph','school','freeFloor'].sort().join(','));

  // =====================================================================
  // G — bushi characters see no spells (listed verification case)
  // =====================================================================
  clear(); setSchool('Daidoji Iron Warrior [Bushi]');
  T.recalcAll();
  const techOpts = Array.from(document.querySelectorAll('#techQuickAdd option'));
  const spellOpts = techOpts.filter(o=>/^\s*\[?Spell/i.test(o.textContent) ||
                                        (o.parentElement && /spell/i.test(o.parentElement.label||'')));
  const enabledSpells = spellOpts.filter(o=>!o.disabled && o.value);
  eq('G','G1','Bushi character is offered no selectable Spells',enabledSpells.length,0);
  const slots = document.getElementById('spellSlotsSection') || document.getElementById('spellSlots');
  rec('G','G2','Spell slot UI hidden for a bushi',
      !slots || slots.offsetParent === null || slots.style.display === 'none',
      slots ? 'slots element visible' : '');

  clear();
  document.getElementById('f_school').value='';
  document.getElementById('f_schoolsData').value='';
  T.recalcAll();

  const fails=results.filter(r=>!r.pass);
  const by={};results.forEach(r=>{by[r.section]=by[r.section]||{pass:0,fail:0};by[r.section][r.pass?'pass':'fail']++;});
  console.log('%c BUGFIX — SCHOOL SKILL FREE RANK ON RELOAD ',
    'background:#7b1113;color:#fff;font-weight:bold;padding:3px 6px;');
  console.table(Object.keys(by).sort().map(s=>({Section:s,Pass:by[s].pass,Fail:by[s].fail})));
  if(fails.length) console.table(fails.map(f=>({ID:f.id,Test:f.name,Detail:f.detail})));
  console.log('%c '+(fails.length?'FAILURES':'ALL PASS')+' — '+(results.length-fails.length)+'/'+results.length+' ',
    'background:'+(fails.length?'#b00':'#1b7')+';color:#fff;font-weight:bold;padding:3px 6px;');
  return {total:results.length,passed:results.length-fails.length,failed:fails.length,results};
})();
