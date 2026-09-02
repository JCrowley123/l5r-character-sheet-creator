/* =============================================================================
 * L5R 4e — COMBINED HARNESS: Feature 4 (Void) + F3 + F2 + F1 + P1/P2 + F0 + Part B
 * =============================================================================
 *   fetch('/l5r-P1-P2-F4-test-harness.js').then(r=>r.text()).then(s=>(0,eval)(s))
 * DESTRUCTIVE: clears Skills/Weapons, resets stance, rounds, wounds and Void state.
 * ============================================================================= */
(async function runF4Harness(){
  'use strict';
  const T = window.__L5R_TEST__;
  if(!T){ console.error('__L5R_TEST__ seam not found.'); return {total:1,passed:0,failed:1,results:[]}; }

  const results=[];
  const rec=(s,id,n,p,d)=>results.push({section:s,id,name:n,pass:!!p,detail:d||''});
  const eq=(s,id,n,a,e)=>{const x=JSON.stringify(a),y=JSON.stringify(e);rec(s,id,n,x===y,x===y?'':'got '+x+' want '+y);};
  const ok=(s,id,n,v)=>rec(s,id,n,!!v,v?'':'expected truthy');
  const no=(s,id,n,v)=>rec(s,id,n,!v,v?'expected falsy, got '+JSON.stringify(v):'');
  const tick=()=>new Promise(r=>setTimeout(r,0));

  const sB=()=>document.getElementById('skillsBody');
  const wB=()=>document.getElementById('weaponsBody');
  const setAllTraits=v=>['agility','reflexes','strength','stamina','perception','awareness','intelligence','willpower']
    .forEach(k=>document.getElementById('trait_'+k).value=v);
  const addSkill=(n,r,e)=>sB().appendChild(T.makeSkillRow({name:n,trait:(T.findSkill(n)||{}).trait||'',rank:r,emph:e||''}));
  const addWeapon=n=>{const L=T.findWeapon(n);
    return wB().appendChild(T.makeWeaponRow({key:L.name,name:L.name,skill:L.skill,size:L.size,
      keywords:'',notes:'',roll:'',dmg:'',manualAttack:false,manualDamage:false}));};
  const modBar=()=>document.getElementById('rollModifierBar');
  const barText=()=>modBar()?modBar().textContent:'';
  const notation=()=>document.getElementById('rollModalNotation').textContent;
  const dice=()=>Array.from(document.querySelectorAll('#rollDiceRow .roll-die'));
  const keptSum=()=>dice().filter(d=>d.classList.contains('kept'))
    .reduce((s,d)=>s+parseInt(d.dataset.total,10),0);
  const totalNow=()=>parseInt(document.getElementById('rollTotalDisplay').textContent,10);
  const closeRoll=()=>{document.getElementById('rollModalOverlay').style.display='none';
                       document.getElementById('rollModalBody').innerHTML='';};
  const TN=()=>parseInt(document.getElementById('f_currentTN').value,10);
  const setVoidPoints=n=>{document.getElementById('void_current').value=n;T.renderVoidPips();T.renderVoidPanel();};
  const setWoundLevel=name=>{
    T.recalcAll();
    const earth=parseInt(document.getElementById('ring_earth').value||'2',10);
    const th=T.computeWoundThresholds(earth);
    const idx=T.WOUND_LEVELS.findIndex(l=>l.name===name);
    document.getElementById('f_woundsTaken').value = idx<=0 ? 0 : th[idx];
    T.recalcAll();
  };
  const reset=()=>{sB().innerHTML='';wB().innerHTML='';setAllTraits(3);T.resetCombatRound();
    T.clearFullDefenseBonus();T.setCurrentStance('Attack',{silent:true});
    T.clearVoidPending();T.clearVoidSkirmishEffects();T.setCombatActive(false);setWoundLevel('Healthy');
    document.getElementById('ring_void').value=5;setVoidPoints(5);T.recalcAll();closeRoll();};
  const rangedAttack=async(row,choice,dist)=>{
    const p=T.rollWeaponAttack(row);
    if(choice==='within') document.getElementById('rangeOptWithin').click();
    if(choice==='beyond'){ document.getElementById('rangeOptBeyond').click();
      const i=document.getElementById('rangeDistInput'); i.value=String(dist); i.dispatchEvent(new Event('input'));
      document.getElementById('rangeDistConfirm').click(); }
    await p;
  };
  reset();

  // =====================================================================
  // F4-A — library, state, gating
  // =====================================================================
  eq('F4-A','A1','All six RAW options present',T.VOID_SPEND_LIBRARY.map(o=>o.key),
     ['k1','trait','skill','tn','init','damage']);
  eq('F4-A','A2','Six spend buttons rendered',document.querySelectorAll('.void-spend-btn').length,6);
  // FEATURE 6 SNAPSHOT UPDATE. This assertion photographs the WHOLE registry, so it changes by
  // construction every time a later feature registers a contributor -- which the Feature 6
  // brief requires ("Add a new contributor: id: 'arrow', priority 25"). Priority 25 places
  // arrow between range (20) and stance (30). Every other Feature 4 assertion is untouched,
  // and the arrow contributor is silent on every roll kind Feature 4 exercises.
  eq('F4-A','A3','Registry is range/arrow/stance/wounds/void at 20/25/30/40/50',
     T.PREROLL_MODIFIER_REGISTRY.map(m=>m.id+'@'+m.priority),
     ['range@20','arrow@25','stance@30','wounds@40','void@50']);
  eq('F4-A','A4','All three effect values match RAW (+10 / +10 / -10)',
     [T.VOID_EFFECT_VALUES.tnBonus,T.VOID_EFFECT_VALUES.initiativeBonus,T.VOID_EFFECT_VALUES.damageReduction],
     [10,10,10]);
  // out of combat gating
  T.setCombatActive(false);
  eq('F4-A','A5','Combat-only options refused out of combat',
     [T.canSpendVoid('tn').ok,T.canSpendVoid('init').ok],[false,false]);
  eq('F4-A','A6','Non-combat options ALLOWED out of combat',
     [T.canSpendVoid('k1').ok,T.canSpendVoid('trait').ok,T.canSpendVoid('skill').ok,T.canSpendVoid('damage').ok],
     [true,true,true,true]);
  T.setCombatActive(true);
  eq('F4-A','A7','Combat-only options allowed in combat',
     [T.canSpendVoid('tn').ok,T.canSpendVoid('init').ok],[true,true]);
  // no points left
  setVoidPoints(0);
  eq('F4-A','A8','Refused with no Void Points remaining',T.canSpendVoid('k1').ok,false);
  ok('F4-A','A9','...and says so',/No Void Points remaining/.test(T.canSpendVoid('k1').reason));
  setVoidPoints(5);
  // once per Round, in combat only
  T.spendVoid('k1');
  eq('F4-A','A10','A second Void spend in the same Round is refused',T.canSpendVoid('k1').ok,false);
  ok('F4-A','A11','...citing the once-per-Round rule',/only one per Round/i.test(T.canSpendVoid('k1').reason));
  T.advanceCombatRound();
  eq('F4-A','A12','A new Round permits spending again',T.canSpendVoid('k1').ok,true);
  T.setCombatActive(false); T.clearVoidPending();
  eq('F4-A','A13','Out of combat there is no once-per-Round limit',
     (()=>{T.spendVoid('k1');const r=T.canSpendVoid('trait').ok;T.clearVoidPending();return r;})(),true);
  eq('F4-A','A14','Spending decrements the Void pip tracker',
     (()=>{setVoidPoints(3);const before=T.getVoidPoints();T.spendVoid('k1');
           const after=T.getVoidPoints();T.clearVoidPending();return [before,after];})(),[3,2]);
  reset();

  // =====================================================================
  // F4-B — V1 (+1k1) reaches every roll kind
  // =====================================================================
  eq('F4-B','B1','No Void spent: contributor is silent',
     T.voidPreRollModifiers(T.makeRollContext('attack')),null);
  T.setVoidPending({k1:true});
  ['attack','skill','spell','trait','ring','initiative','manual'].forEach((k,i)=>{
    const m=T.voidPreRollModifiers(T.makeRollContext(k));
    eq('F4-B','B'+(i+2),'V1 applies to '+k+' rolls',
       m && [m[0].rolledDelta,m[0].keptDelta,m[0].label],[1,1,'Void: +1k1']);
  });
  eq('F4-B','B9','V1 NEVER applies to damage rolls',
     T.voidPreRollModifiers(T.makeRollContext('damage')),null);
  T.clearVoidPending();

  // end to end on an attack
  reset(); addSkill('Kenjutsu',7,'Katana'); const katana=addWeapon('Katana'); T.recalcAll();
  T.rollWeaponAttack(katana);
  eq('F4-B','B10','Baseline attack is 10k3',notation(),'10k3');
  no('F4-B','B11','...with no modifier bar',modBar());
  closeRoll();
  T.spendVoid('k1');
  T.rollWeaponAttack(katana);
  ok('F4-B','B12','Void bar shown',/Void: \+1k1/.test(barText()));
  ok('F4-B','B13','Pool became 11k4',/11k4/.test(notation()));
  eq('F4-B','B14','Dice rolled match the Ten Dice conversion of 11k4',
     dice().length,T.applyTenDiceRule(11,4).rolled);
  closeRoll();
  no('F4-B','B15','Effect expired after the roll',T.getVoidPending().k1);
  T.rollWeaponAttack(katana);
  eq('F4-B','B16','Next roll is back to 10k3',notation(),'10k3');
  no('F4-B','B17','...and shows no Void bar',/Void:/.test(barText()));
  closeRoll();

  // out-of-combat roll kinds
  T.setCombatActive(false);
  T.spendVoid('k1'); T.rollSkill('Kenjutsu','Agility',7);
  ok('F4-B','B18','V1 works on an out-of-combat skill roll',/Void: \+1k1/.test(barText()));
  closeRoll();
  T.spendVoid('k1'); T.rollNotation('Manual','5k2');
  ok('F4-B','B19','V1 works on a manual roll',/Void: \+1k1/.test(barText()));
  eq('F4-B','B20','Manual pool became 6k3',notation(),'6k3');
  closeRoll();
  T.spendVoid('k1'); T.performSpellCastRoll('fire','Fire','Test Spell',1,[]);
  ok('F4-B','B21','V1 works on a Spell Casting Roll',/Void: \+1k1/.test(barText()));
  closeRoll();

  // =====================================================================
  // F4-C — V4 (+1 Trait) and V5 (+1 Skill)
  // =====================================================================
  reset(); addSkill('Kenjutsu',7,'Katana'); const kat2=addWeapon('Katana'); T.recalcAll();
  T.spendVoid('trait'); T.rollWeaponAttack(kat2);
  ok('F4-C','C1','V4 bar reads +1 Trait',/Void: \+1 Trait/.test(barText()));
  ok('F4-C','C2','V4 gives 11k4 (a Trait counts in both rolled and kept)',/11k4/.test(notation()));
  closeRoll();
  no('F4-C','C3','V4 expires after the roll',T.getVoidPending().trait);
  eq('F4-C','C4','V4 left no permanent Trait change',
     document.getElementById('trait_agility').value,'3');
  T.spendVoid('skill'); T.rollWeaponAttack(kat2);
  ok('F4-C','C5','V5 bar reads +1 Skill',/Void: \+1 Skill/.test(barText()));
  ok('F4-C','C6','V5 gives 11k3 (a rolled die only)',/11k3/.test(notation()));
  closeRoll();
  no('F4-C','C7','V5 expires after the roll',T.getVoidPending().skill);
  eq('F4-C','C8','V5 left no permanent Skill Rank change',
     sB().querySelector('.sk-rank').value,'7');
  // V5 lifts the Unskilled penalty (explode override)
  eq('F4-C','C9','V5 carries an explodeOverride',
     (()=>{T.setVoidPending({skill:true});
           const m=T.voidPreRollModifiers(T.makeRollContext('skill'));
           T.clearVoidPending();return m[0].explodeOverride;})(),true);
  eq('F4-C','C10','P2 surfaces the override on the applied set',
     (()=>{T.setVoidPending({skill:true});
           const mods=T.getPreRollModifiers(T.makeRollContext('skill'));
           const a=T.applyPreRollModifiers(3,3,mods);T.clearVoidPending();
           return [a.rolled,a.kept,a.explodeOverride];})(),[4,3,true]);
  eq('F4-C','C11','No Void spent leaves explodeOverride undefined',
     T.applyPreRollModifiers(3,3,T.getPreRollModifiers(T.makeRollContext('skill'))).explodeOverride,
     undefined);

  // =====================================================================
  // F4-D — V2 (+1 TN) and V3 (+1 Initiative)
  // =====================================================================
  reset(); T.setCombatActive(true); T.recalcAll();
  const tnBase=TN();
  T.spendVoid('tn'); T.recalcAll();
  eq('F4-D','D1','V2 raises Armor TN by the configured bonus',
     TN(),tnBase+T.VOID_EFFECT_VALUES.tnBonus);
  eq('F4-D','D2','getVoidArmorTNBonus reports it',T.getVoidArmorTNBonus(),T.VOID_EFFECT_VALUES.tnBonus);
  // stacks additively with a stance
  T.setCurrentStance('Full Attack'); T.recalcAll();
  eq('F4-D','D3','V2 stacks additively with Full Attack (-10)',
     TN(),tnBase-10+T.VOID_EFFECT_VALUES.tnBonus);
  T.setCurrentStance('Attack',{silent:true}); T.recalcAll();
  T.advanceCombatRound(); T.recalcAll();
  eq('F4-D','D4','V2 expires at round advance',T.getVoidArmorTNBonus(),0);
  eq('F4-D','D5','...and Armor TN returns to base',TN(),tnBase);
  // V3
  T.spendVoid('init'); T.recalcAll();
  eq('F4-D','D6','V3 reports an Initiative bonus',
     T.getVoidInitiativeBonus(),T.VOID_EFFECT_VALUES.initiativeBonus);
  ok('F4-D','D7','f_initiative display shows the bonus',
     new RegExp('\\+'+T.VOID_EFFECT_VALUES.initiativeBonus).test(document.getElementById('f_initiative').value));
  document.getElementById('btnRollInitiative').click();
  ok('F4-D','D8','Initiative roll shows the Void bar',
     barText().indexOf('Void: +'+T.VOID_EFFECT_VALUES.initiativeBonus+' Initiative') >= 0);
  eq('F4-D','D9','Initiative total includes the bonus',
     totalNow(),keptSum()+T.VOID_EFFECT_VALUES.initiativeBonus);
  closeRoll();
  eq('F4-D','D10','V3 does NOT apply to an attack roll',
     (()=>{const m=T.voidPreRollModifiers(T.makeRollContext('attack'));return m;})(),null);
  // HARNESS EVOLUTION (RAW correction). D11 previously asserted "V3 expires at round advance".
  // WHY THE CHANGE WAS REQUIRED: that matched an earlier draft in which the Initiative bonus was
  // round-scoped. RAW is explicit that it lasts "for the duration of the current skirmish", so the
  // implementation moved from the round ledger to a skirmish-wide flag and the old assertion now
  // tests behaviour that is deliberately gone.
  // WHY THE NEW INVARIANT IS CORRECT: the bonus must SURVIVE advanceCombatRound() and be cleared
  // only when the skirmish itself resets. Both halves are asserted below.
  T.advanceCombatRound(); T.recalcAll();
  eq('F4-D','D11','V3 SURVIVES round advance (skirmish-wide, per RAW)',
     T.getVoidInitiativeBonus(),T.VOID_EFFECT_VALUES.initiativeBonus);
  T.advanceCombatRound(); T.advanceCombatRound(); T.recalcAll();
  eq('F4-D','D11b','...and survives several rounds',
     T.getVoidInitiativeBonus(),T.VOID_EFFECT_VALUES.initiativeBonus);
  eq('F4-D','D11c','V2 (Armor TN) still DOES expire per round, unlike V3',T.getVoidArmorTNBonus(),0);
  T.clearVoidSkirmishEffects(); T.recalcAll();
  eq('F4-D','D11d','Clearing skirmish effects removes it',T.getVoidInitiativeBonus(),0);
  eq('F4-D','D11e','Out of combat it reports 0 regardless of the flag',
     (()=>{T.setCombatActive(true);T.spendVoid('init');T.setCombatActive(false);
           const v=T.getVoidInitiativeBonus();T.clearVoidSkirmishEffects();T.setCombatActive(true);
           return v;})(),0);

  // =====================================================================
  // F4-E — V6 damage reduction
  // =====================================================================
  reset();
  const w0=parseInt(document.getElementById('f_woundsTaken').value,10);
  const r1=T.applyVoidDamageReduction(25);
  eq('F4-E','E1','25 damage becomes 15 Wounds',[r1.rawDamage,r1.finalDamage],[25,15]);
  eq('F4-E','E2','Wounds written to f_woundsTaken',
     parseInt(document.getElementById('f_woundsTaken').value,10),w0+15);
  reset();
  const r2=T.applyVoidDamageReduction(7);
  eq('F4-E','E3','Damage below 10 floors at 0, never negative',r2.finalDamage,0);
  eq('F4-E','E4','...and adds no Wounds',
     parseInt(document.getElementById('f_woundsTaken').value,10),0);
  reset();
  T.applyVoidDamageReduction(40);
  ok('F4-E','E5','Wound penalties update immediately (recalcAll ran)',T.getWoundPenalty()<0);
  eq('F4-E','E6','Void point was consumed',T.getVoidPoints(),4);
  reset(); setVoidPoints(0);
  eq('F4-E','E7','Refused with no Void Points',T.applyVoidDamageReduction(25),null);
  eq('F4-E','E8','...and no Wounds were written',
     parseInt(document.getElementById('f_woundsTaken').value,10),0);
  reset();
  eq('F4-E','E9','V6 works out of combat (falling / environmental damage)',
     (()=>{T.setCombatActive(false);const r=T.applyVoidDamageReduction(30);return r&&r.finalDamage;})(),20);
  reset();

  // =====================================================================
  // F4-F — combines with range, stance and wounds
  // =====================================================================
  reset(); addSkill('Kenjutsu',7,'Katana'); addSkill('Kyujutsu',3);
  const kat3=addWeapon('Katana'); const yumi=addWeapon('Yumi'); T.recalcAll();
  setWoundLevel('Nicked'); T.setCombatActive(true);
  T.setCurrentStance('Full Attack'); T.recalcAll();
  T.spendVoid('k1');
  T.rollWeaponAttack(kat3);           // 10k3 +2k1 (stance) +1k1 (void) = 13k5 ; -3 wounds
  ok('F4-F','F1','Stance + wounds + Void all listed',
     /Full Attack stance/.test(barText()) && /Wound Penalty/.test(barText()) && /Void: \+1k1/.test(barText()));
  ok('F4-F','F2','Pool is 13k5',/13k5/.test(notation()));
  eq('F4-F','F3','Total = kept + tenDiceBonus - 3',
     totalNow(),keptSum()+(T.applyTenDiceRule(13,5).bonus||0)-3);
  // die-click recomputation
  const unkept=dice().find(d=>!d.classList.contains('kept'));
  if(unkept){ unkept.click();
    eq('F4-F','F4','Modifiers survive a die click',
       totalNow(),keptSum()+(T.applyTenDiceRule(13,5).bonus||0)-3);
  } else rec('F4-F','F4','Modifiers survive a die click',true,'no unkept die');
  closeRoll();
  T.setCurrentStance('Attack',{silent:true}); T.recalcAll();
  T.advanceCombatRound();
  T.spendVoid('k1');
  await rangedAttack(yumi,'beyond',350);   // 6k3 +1k1 = 7k4 ; -2k0 range = 5k4 ; -3 wounds
  ok('F4-F','F5','Range + wounds + Void all listed',
     /Range/.test(barText()) && /Wound Penalty/.test(barText()) && /Void: \+1k1/.test(barText()));
  eq('F4-F','F6','Pool is 5k4',notation(),'5k4');
  eq('F4-F','F7','Total includes the -3',totalNow(),keptSum()-3);
  // NB: read the bar BEFORE closeRoll() -- closing wipes #rollModalBody, so barText() would be ''.
  eq('F4-F','F8','Modifier bar orders range, wounds, void by priority',
     (()=>{const t=barText();return [t.indexOf('Range')<t.indexOf('Wound Penalty'),
       t.indexOf('Wound Penalty')<t.indexOf('Void:')];})(),[true,true]);
  closeRoll();
  reset();

  // =====================================================================
  // F4-G — negative scope, expiry, save/load
  // =====================================================================
  reset(); addSkill('Kenjutsu',7,'Katana'); const kat4=addWeapon('Katana'); T.recalcAll();
  T.spendVoid('k1');
  const dmgBefore=kat4.querySelector('.wp-dmg').value;
  kat4.querySelector('.wp-dmg-btn').click();
  no('F4-G','G1','Damage roll shows no Void bar',/Void:/.test(barText()));
  eq('F4-G','G2','Damage pool untouched by a pending Void',notation(),dmgBefore);
  closeRoll();
  ok('F4-G','G3','A damage roll did NOT consume the pending Void',T.getVoidPending().k1===true);
  T.clearVoidPending();
  // no permanent stat changes
  T.setVoidPending({trait:true,skill:true}); T.clearVoidPending();
  eq('F4-G','G4','No permanent Trait or Skill change ever',
     [document.getElementById('trait_agility').value, sB().querySelector('.sk-rank').value],['3','7']);
  // save/load
  T.setCombatActive(true); T.spendVoid('tn'); T.setVoidPending({k1:true}); T.recalcAll();
  const save=T.collectData();
  eq('F4-G','G5','Save still has exactly 42 fields',Object.keys(save.fields).length,42);
  eq('F4-G','G6','No Void keys in the save',
     Object.keys(save.fields).filter(k=>/void(Pending|TN|Init)|isCombatActive/i.test(k)),[]);
  ok('F4-G','G7','The existing void_current tracker is still the only Void state saved',
     save.voidCurrent !== undefined);
  const sig=JSON.stringify(save); T.applyData(JSON.parse(sig));
  eq('F4-G','G8','save -> load -> save stable',JSON.stringify(T.collectData()),sig);
  reset();
  // zero-change guarantee
  addSkill('Kenjutsu',7,'Katana'); const kat5=addWeapon('Katana'); T.recalcAll();
  T.rollWeaponAttack(kat5);
  no('F4-G','G9','No Void spent: no modifier bar at all',modBar());
  eq('F4-G','G10','No Void spent: pool is unmodified 10k3',notation(),'10k3');
  eq('F4-G','G11','No Void spent: total is the plain kept sum',totalNow(),keptSum());
  closeRoll();
  reset();

  // =====================================================================
  // Regression
  // =====================================================================
  const suites={};
  async function runSuite(name,url){
    try{
      const res=await fetch(url+(url.indexOf('?')>=0?'&':'?')+'cb='+Date.now());
      if(!res.ok) throw new Error('HTTP '+res.status);
      const o0=(0,eval)(await res.text());
      const o=(o0&&typeof o0.then==='function')?await o0:o0;
      suites[name]={total:o.total,passed:o.passed,failed:o.failed,
                    fails:o.results.filter(r=>!r.pass).map(r=>r.id+' '+r.name)};
      rec('REG',name,name+' suite passes unchanged',o.failed===0,
          o.failed?('failed '+o.failed+': '+suites[name].fails.join('; ')):'');
    }catch(e){ suites[name]={error:String(e)}; rec('REG',name,name+' suite passes unchanged',false,'could not run: '+e); }
  }
  await runSuite('Feature3','/l5r-P1-P2-F3-test-harness.js');
  await runSuite('Feature2','/l5r-P1-P2-F2-test-harness.js');
  await runSuite('Feature1','/l5r-P1-P2-F1-test-harness.js');
  await runSuite('P1P2','/p12-harness.js');
  await runSuite('Feature0','/f0-harness.js');
  await runSuite('PartB','/partB-harness.js');
  await runSuite('SchoolFix','/schoolfree-harness.js');

  const fails=results.filter(r=>!r.pass);
  const by={};results.forEach(r=>{by[r.section]=by[r.section]||{pass:0,fail:0};by[r.section][r.pass?'pass':'fail']++;});
  console.log('%c PART C — FEATURE 4: VOID POINT AUTOMATION ','background:#7b1113;color:#fff;font-weight:bold;padding:3px 6px;');
  console.table(Object.keys(by).sort().map(s=>({Section:s,Pass:by[s].pass,Fail:by[s].fail})));
  console.table(Object.keys(suites).map(k=>({Suite:k,
    Total:suites[k].total===undefined?'-':suites[k].total,
    Passed:suites[k].passed===undefined?'-':suites[k].passed,
    Failed:suites[k].failed===undefined?'ERR':suites[k].failed})));
  if(fails.length) console.table(fails.map(f=>({ID:f.id,Test:f.name,Detail:f.detail})));
  console.log('%c '+(fails.length?'FAILURES':'ALL PASS')+' — '+(results.length-fails.length)+'/'+results.length+' ',
    'background:'+(fails.length?'#b00':'#1b7')+';color:#fff;font-weight:bold;padding:3px 6px;');
  return {total:results.length,passed:results.length-fails.length,failed:fails.length,results,suites};
})();
