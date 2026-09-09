/* =============================================================================
 * PART C — P1 (Combat Round Context) + P2 (Pre-roll Modifier Pipeline) HARNESS
 * Exit condition: failed === 0. DESTRUCTIVE: clears Skills/Weapons tables.
 * ============================================================================= */
(function runP12Harness(){
  'use strict';
  const T = window.__L5R_TEST__;
  if(!T){ console.error('seam missing'); return {total:1,passed:0,failed:1,results:[]}; }
  const results=[];
  const rec=(s,id,n,p,d)=>results.push({section:s,id,name:n,pass:!!p,detail:d||''});
  const eq=(s,id,n,a,e)=>{const x=JSON.stringify(a),y=JSON.stringify(e);rec(s,id,n,x===y,x===y?'':'got '+x+' want '+y);};
  const ok=(s,id,n,v)=>rec(s,id,n,!!v,v?'':'expected truthy');
  const no=(s,id,n,v)=>rec(s,id,n,!v,v?'expected falsy, got '+JSON.stringify(v):'');

  const sBody=()=>document.getElementById('skillsBody');
  const wBody=()=>document.getElementById('weaponsBody');
  const clearRows=()=>{sBody().innerHTML='';wBody().innerHTML='';};
  const setAllTraits=v=>['agility','reflexes','strength','stamina','perception','awareness','intelligence','willpower']
    .forEach(k=>document.getElementById('trait_'+k).value=v);
  const addSkill=(n,r,e)=>sBody().appendChild(T.makeSkillRow({name:n,trait:(T.findSkill(n)||{}).trait||'',rank:r,emph:e||''}));
  const closeModal=()=>{const o=document.getElementById('rollModalOverlay');if(o)o.style.display='none';};
  const modBar=()=>document.getElementById('rollModifierBar');
  const totalNow=()=>parseInt(document.getElementById('rollTotalDisplay').textContent,10);
  const dice=()=>Array.from(document.querySelectorAll('#rollDiceRow .roll-die'));
  const cleanup=()=>{['t_dice','t_total','t_kind','t_throw','t_a','t_b','t_neg'].forEach(id=>T.unregisterPreRollModifier(id));};

  clearRows(); setAllTraits(3); T.resetCombatRound(); cleanup();
  // BASELINE registry. When P1/P2 shipped, nothing had registered a contributor and this
  // was empty. Later features register PERMANENT contributors (Feature 1 registers 'range'),
  // so 'the registry is empty' is no longer the right invariant. What must stay true is that
  // this harness leaves behind exactly what it found -- no test modifier leaks.
  const BASELINE_IDS = T.PREROLL_MODIFIER_REGISTRY.map(m=>m.id).sort();

  // =====================================================================
  // P1 — combat round context
  // =====================================================================
  eq('P1','R1','Round starts at 1',T.getCombatRound(),1);
  eq('P1','R2','advanceCombatRound increments',T.advanceCombatRound(),2);
  eq('P1','R3','...and again',T.advanceCombatRound(),3);
  no('P1','R4','Nothing spent yet this round',T.hasSpentThisRound('void'));
  T.recordRoundSpend('void');
  ok('P1','R5','recordRoundSpend registers a spend',T.hasSpentThisRound('void'));
  eq('P1','R6','Boolean spend stored as true',T.getRoundSpend('void'),true);
  T.recordRoundSpend('stance','Full Attack');
  eq('P1','R7','Valued spend stored verbatim',T.getRoundSpend('stance'),'Full Attack');
  T.advanceCombatRound();
  no('P1','R8','New round has a clean slate',T.hasSpentThisRound('void'));
  eq('P1','R9','Previous round is still readable (Center needs this)',T.getRoundSpend('stance',3),'Full Attack');
  T.clearRoundSpend('stance',3);
  no('P1','R10','clearRoundSpend removes a past entry',T.getRoundSpend('stance',3));
  // history trimming
  for(let i=0;i<30;i++){ T.recordRoundSpend('x',i); T.advanceCombatRound(); }
  ok('P1','R11','Ledger history is trimmed to the limit',
     Object.keys(T.getRoundLedger()).length <= T.COMBAT_ROUND_DEFAULTS.historyLimit);
  T.resetCombatRound();
  eq('P1','R12','resetCombatRound returns to round 1',T.getCombatRound(),1);
  eq('P1','R13','...and empties the ledger',Object.keys(T.getRoundLedger()).length,0);
  ok('P1','R14','Round UI label renders',/Round 1/.test(document.getElementById('combatRoundLabel').textContent));
  // persistence contract
  const save = T.collectData();
  no('P1','R15','combatRoundNumber never reaches the save file',
     Object.keys(save.fields).some(k=>/combatRound/i.test(k)));
  eq('P1','R16','Save still has exactly 42 fields',Object.keys(save.fields).length,42);
  no('P1','R17','No f_-prefixed round inputs exist',!!document.getElementById('f_combatRoundNumber'));

  // =====================================================================
  // P2 — pipeline purity and no-op behaviour
  // =====================================================================
  eq('P2','M1','Registry starts clean (no test modifiers present)',
     T.PREROLL_MODIFIER_REGISTRY.map(m=>m.id).sort(),BASELINE_IDS);
  eq('P2','M2','Baseline contributors yield nothing for a bare context',
     T.getPreRollModifiers(T.makeRollContext('skill')),[]);
  eq('P2','M3','Empty modifier list is a mathematical no-op',
     (()=>{const a=T.applyPreRollModifiers(9,3,[]);return [a.rolled,a.kept,a.totalDelta];})(),[9,3,0]);
  // dice modifier
  T.registerPreRollModifier('t_dice',10,ctx=>ctx.kind==='attack'?{label:'Test +2k1',rolledDelta:2,keptDelta:1}:null);
  eq('P2','M4','Dice modifier applies to its own kind',
     (()=>{const m=T.getPreRollModifiers(T.makeRollContext('attack'));const a=T.applyPreRollModifiers(9,3,m);
           return [a.rolled,a.kept];})(),[11,4]);
  eq('P2','M5','...and is filtered out for another kind (negative scope)',
     T.getPreRollModifiers(T.makeRollContext('damage')).length,0);
  // total modifier
  T.registerPreRollModifier('t_total',20,ctx=>ctx.kind==='skill'?{label:'Test -3',totalDelta:-3}:null);
  eq('P2','M6','Total modifier collected',
     (()=>{const a=T.applyPreRollModifiers(5,2,T.getPreRollModifiers(T.makeRollContext('skill')));
           return [a.rolled,a.kept,a.totalDelta];})(),[5,2,-3]);
  // clamping
  T.registerPreRollModifier('t_neg',30,()=>({label:'huge',rolledDelta:-99,keptDelta:-99}));
  eq('P2','M7','Pool never goes below 0k0',
     (()=>{const a=T.applyPreRollModifiers(3,2,T.getPreRollModifiers(T.makeRollContext('skill')));
           return [a.rolled,a.kept];})(),[0,0]);
  T.unregisterPreRollModifier('t_neg');
  eq('P2','M8','Kept can never exceed rolled',
     (()=>{const a=T.applyPreRollModifiers(2,2,[{rolledDelta:0,keptDelta:5,totalDelta:0}]);
           return [a.rolled,a.kept];})(),[2,2]);
  // resilience + registry mechanics
  T.registerPreRollModifier('t_throw',5,()=>{throw new Error('boom');});
  ok('P2','M9','A throwing contributor is skipped, not fatal',
     T.getPreRollModifiers(T.makeRollContext('attack')).length>0);
  T.unregisterPreRollModifier('t_throw');
  ok('P2','M10','unregisterPreRollModifier removes a contributor',
     !T.PREROLL_MODIFIER_REGISTRY.some(m=>m.id==='t_throw'));
  T.registerPreRollModifier('t_dice',10,ctx=>ctx.kind==='attack'?{label:'Test +2k1',rolledDelta:2,keptDelta:1}:null);
  eq('P2','M11','Re-registering the same id replaces, not duplicates',
     T.PREROLL_MODIFIER_REGISTRY.filter(m=>m.id==='t_dice').length,1);
  T.registerPreRollModifier('t_a',99,()=>({label:'late',totalDelta:1}));
  T.registerPreRollModifier('t_b',1,()=>({label:'early',totalDelta:1}));
  eq('P2','M12','Contributors sorted by priority',
     T.getPreRollModifiers(T.makeRollContext('skill')).map(m=>m.label)[0],'early');
  T.unregisterPreRollModifier('t_a'); T.unregisterPreRollModifier('t_b');
  eq('P2','M13','Zero-valued modifiers are dropped',
     T.getPreRollModifiers.length>=0 && (()=>{T.registerPreRollModifier('t_a',1,()=>({label:'zero',rolledDelta:0,keptDelta:0,totalDelta:0}));
       const n=T.getPreRollModifiers(T.makeRollContext('spell')).length;T.unregisterPreRollModifier('t_a');return n;})(),0);

  // =====================================================================
  // P2 — THE CRUX: Ten Dice Rule sees the MODIFIED raw pool
  // =====================================================================
  // Base 10k3 + 2k1 = 12k4 raw. applyTenDiceRule(12,4) is the correct target.
  const expected = (()=>{const a=T.applyTenDiceRule(12,4);return [a.rolled,a.kept,a.bonus];})();
  clearRows(); setAllTraits(3); addSkill('Kenjutsu',7,'Katana');
  const wRow=(()=>{const L=T.findWeapon('Katana');
    return wBody().appendChild(T.makeWeaponRow({key:L.name,name:L.name,skill:L.skill,size:L.size,
      keywords:'',notes:'',roll:'',dmg:'',manualAttack:false,manualDamage:false}));})();
  wRow.querySelector('.wp-roll-btn').click();   // 10k3 base, +2k1 from t_dice
  const notation = document.getElementById('rollModalNotation').textContent;
  eq('P2','X1','Modified pool 12k4 hits the Ten Dice Rule (not the base 10k3)',
     [dice().length, expected[0]],[expected[0],expected[0]]);
  ok('P2','X2','Modal notation shows the Ten Dice conversion from 12k4',/12k4/.test(notation));
  ok('P2','X3','Modifier breakdown bar rendered',!!modBar());
  ok('P2','X4','Breakdown names the modifier',/Test \+2k1/.test(modBar().textContent));
  closeModal();

  // total modifier must survive die-clicking (the reason it is folded into `bonus`)
  T.unregisterPreRollModifier('t_dice');
  T.registerPreRollModifier('t_total',20,ctx=>ctx.kind==='skill'?{label:'Wound test',totalDelta:-3}:null);
  T.rollSkill('Kenjutsu','Agility',7);
  const before = totalNow();
  const keptSum = dice().filter(d=>d.classList.contains('kept'))
    .reduce((s,d)=>s+parseInt(d.dataset.total,10),0);
  eq('P2','X5','Displayed total already includes the flat modifier',before,keptSum-3);
  const anyDie = dice().find(d=>!d.classList.contains('kept'));
  if(anyDie){
    anyDie.click();
    const after = totalNow();
    const keptSum2 = dice().filter(d=>d.classList.contains('kept'))
      .reduce((s,d)=>s+parseInt(d.dataset.total,10),0);
    eq('P2','X6','Modifier SURVIVES a die click (not wiped by updateRollKeepState)',after,keptSum2-3);
  } else rec('P2','X6','Modifier survives a die click',true,'no unkept die available');
  ok('P2','X7','Misleading "Ten Dice Rule bonus" note hidden when a flat modifier applies',
     Array.from(document.querySelectorAll('#rollModalBody .roll-note'))
       .filter(el=>/^Ten Dice Rule bonus:/.test((el.textContent||'').trim()))
       .every(el=>el.style.display==='none'));
  ok('P2','X8','Breakdown shows the net adjustment',/Net -3/.test(modBar().textContent));
  closeModal();

  // negative scope: damage rolls are untouched by a skill-scoped modifier
  const dmgBefore = wRow.querySelector('.wp-dmg').value;
  wRow.querySelector('.wp-dmg-btn').click();
  no('P2','X9','Damage roll shows no modifier bar (negative scope)',modBar());
  eq('P2','X10','Damage pool unchanged by a skill-scoped modifier',
     wRow.querySelector('.wp-dmg').value,dmgBefore);
  closeModal();

  // =====================================================================
  // No-op equivalence: with the registry empty, rolls match Part B exactly
  // =====================================================================
  cleanup();
  eq('P2','N1','Registry restored to baseline after the harness',
     T.PREROLL_MODIFIER_REGISTRY.map(m=>m.id).sort(),BASELINE_IDS);
  T.rollSkill('Kenjutsu','Agility',7);
  no('P2','N2','No modifier bar when nothing is registered',modBar());
  eq('P2','N3','Pool is the unmodified 10k3',document.getElementById('rollModalNotation').textContent,'10k3');
  ok('P2','N4','Ten Dice note not hidden when there is nothing to hide',
     Array.from(document.querySelectorAll('#rollModalBody .roll-note'))
       .every(el=>el.style.display!=='none'));
  closeModal();
  // recalcAll() first: collectData() captures derived fields (insight, rings, XP, TN) as they
  // stand, while applyData() recomputes them on load. That convergence step is a pre-existing
  // property of the sheet -- verified identical on the Feature 0 build -- not a P1/P2 effect.
  T.recalcAll();
  const sig=JSON.stringify(T.collectData());
  T.applyData(JSON.parse(sig));
  eq('P2','N5','save -> load -> save still stable',JSON.stringify(T.collectData()),sig);
  eq('P2','N6','Save still carries no combat-round keys',
     Object.keys(JSON.parse(sig).fields).filter(k=>/combatRound|rollModifier/i.test(k)),[]);

  clearRows(); T.resetCombatRound(); cleanup(); closeModal();
  const fails=results.filter(r=>!r.pass);
  const by={};results.forEach(r=>{by[r.section]=by[r.section]||{pass:0,fail:0};by[r.section][r.pass?'pass':'fail']++;});
  console.log('%c PART C — P1 + P2 PREREQUISITES ','background:#7b1113;color:#fff;font-weight:bold;padding:3px 6px;');
  console.table(Object.keys(by).sort().map(s=>({Section:s,Pass:by[s].pass,Fail:by[s].fail})));
  if(fails.length) console.table(fails.map(f=>({ID:f.id,Test:f.name,Detail:f.detail})));
  console.log('%c '+(fails.length?'FAILURES':'ALL PASS')+' — '+(results.length-fails.length)+'/'+results.length+' ',
    'background:'+(fails.length?'#b00':'#1b7')+';color:#fff;font-weight:bold;padding:3px 6px;');
  return {total:results.length,passed:results.length-fails.length,failed:fails.length,results};
})();
