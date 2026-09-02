/* =============================================================================
 * L5R 4e — COMBINED HARNESS: Feature 2 (Stances) + F1 + P1/P2 + F0 + Part B
 * =============================================================================
 *   fetch('/l5r-P1-P2-F2-test-harness.js').then(r=>r.text()).then(s=>(0,eval)(s))
 * Returns a Promise resolving to {total,passed,failed,results,suites}.
 * DESTRUCTIVE: clears Skills/Weapons tables and resets stance + rounds.
 * ============================================================================= */
(async function runF2Harness(){
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
  const clearRows=()=>{sB().innerHTML='';wB().innerHTML='';};
  const setAllTraits=v=>['agility','reflexes','strength','stamina','perception','awareness','intelligence','willpower']
    .forEach(k=>document.getElementById('trait_'+k).value=v);
  const addSkill=(n,r,e)=>sB().appendChild(T.makeSkillRow({name:n,trait:(T.findSkill(n)||{}).trait||'',rank:r,emph:e||''}));
  const addWeapon=n=>{const L=T.findWeapon(n);
    return wB().appendChild(T.makeWeaponRow({key:L.name,name:L.name,skill:L.skill,size:L.size,
      keywords:'',notes:'',roll:'',dmg:'',manualAttack:false,manualDamage:false}));};
  const modBar=()=>document.getElementById('rollModifierBar');
  const notation=()=>document.getElementById('rollModalNotation').textContent;
  const dice=()=>Array.from(document.querySelectorAll('#rollDiceRow .roll-die'));
  const totalNow=()=>parseInt(document.getElementById('rollTotalDisplay').textContent,10);
  const rollOpen=()=>document.getElementById('rollModalOverlay').style.display==='flex';
  const closeRoll=()=>{document.getElementById('rollModalOverlay').style.display='none';
                       document.getElementById('rollModalBody').innerHTML='';};
  const TN=()=>parseInt(document.getElementById('f_currentTN').value,10);
  const stanceTile=key=>document.querySelector('.stance-tile-btn[data-stance="'+key+'"]');
  const forceDice=vals=>{document.getElementById('rollDiceRow').innerHTML =
    vals.map(v=>'<div class="roll-die kept" data-total="'+v+'">'+v+'</div>').join('');};
  // Melee attack: synchronous (no range prompt). Ranged: drive the prompt.
  const meleeAttack=row=>{ T.rollWeaponAttack(row); };
  const rangedAttack=async(row,choice,dist)=>{
    const p=T.rollWeaponAttack(row);
    if(choice==='within') document.getElementById('rangeOptWithin').click();
    if(choice==='melee')  document.getElementById('rangeOptMelee').click();
    if(choice==='beyond'){ document.getElementById('rangeOptBeyond').click();
      const i=document.getElementById('rangeDistInput'); i.value=String(dist); i.dispatchEvent(new Event('input'));
      document.getElementById('rangeDistConfirm').click(); }
    await p;
  };

  const reset=()=>{ clearRows(); setAllTraits(3); T.resetCombatRound();
                    T.clearFullDefenseBonus(); T.setCurrentStance('Attack',{silent:true}); closeRoll(); };
  reset();

  // =====================================================================
  // F2-A — library + tiles
  // =====================================================================
  eq('F2-A','A1','Five stances in RAW order',T.STANCE_LIBRARY.map(s=>s.name),
     ['Attack','Full Attack','Defense','Full Defense','Center']);
  eq('F2-A','A2','Each stance names its Ring',T.STANCE_LIBRARY.map(s=>s.ring),
     ['Water','Fire','Air','Earth','Void']);
  eq('F2-A','A3','Five tiles rendered',document.querySelectorAll('#stanceTiles .stance-tile').length,5);
  eq('F2-A','A4','Every tile has an info button',document.querySelectorAll('.stance-info-btn').length,5);
  eq('F2-A','A5','Every tile has an icon',document.querySelectorAll('.stance-icon svg').length,5);
  eq('F2-A','A6','Default stance is Attack',T.getCurrentStance(),'Attack');
  eq('F2-A','A7','Attack tile is the highlighted one',
     Array.from(document.querySelectorAll('.stance-tile.selected')).map(e=>e.dataset.stance),['attack']);
  ok('F2-A','A8','Tiles are real buttons (keyboard reachable)',
     Array.from(document.querySelectorAll('.stance-tile-btn')).every(b=>b.tagName==='BUTTON'));
  ok('F2-A','A9','No stance dropdown anywhere',
     Array.from(document.querySelectorAll('select')).every(s=>!/stance/i.test(s.id)&&!/stance/i.test(s.name||'')));
  eq('F2-A','A10','findStance accepts name or key',
     [T.findStance('Full Attack').key,T.findStance('fullAttack').name,T.findStance('nope')],
     ['fullAttack','Full Attack',null]);
  // tile click selects
  stanceTile('defense').click();
  eq('F2-A','A11','Clicking a tile sets the stance',T.getCurrentStance(),'Defense');
  eq('F2-A','A12','Only one tile highlighted at a time',
     document.querySelectorAll('.stance-tile.selected').length,1);
  eq('F2-A','A13','aria-pressed tracks selection',
     stanceTile('defense').getAttribute('aria-pressed'),'true');
  // info modal
  document.querySelector('.stance-info-btn[data-stance="center"]').click();
  ok('F2-A','A14','Info modal opens',document.getElementById('stanceInfoOverlay').style.display==='flex');
  ok('F2-A','A15','Info modal shows RAW text',/Void Ring/.test(document.getElementById('stanceInfoBody').textContent));
  eq('F2-A','A16','Info button does NOT change stance',T.getCurrentStance(),'Defense');
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));
  ok('F2-A','A17','ESC closes the info modal',document.getElementById('stanceInfoOverlay').style.display==='none');
  T.setCurrentStance('Attack',{silent:true});

  // =====================================================================
  // F2-B — Attack (baseline)
  // =====================================================================
  reset(); addSkill('Kenjutsu',7,'Katana'); const katana=addWeapon('Katana'); T.recalcAll();
  const baseTN = TN();
  eq('F2-B','B1','Attack stance adds no Armor TN',T.getStanceArmorTNBonus(),0);
  eq('F2-B','B2','Attack stance contributes no modifiers',
     T.stancePreRollModifiers(T.makeRollContext('attack')),null);
  meleeAttack(katana);
  eq('F2-B','B3','Unmodified pool 10k3',notation(),'10k3');
  no('F2-B','B4','No modifier bar in Attack stance',modBar());
  closeRoll();

  // =====================================================================
  // F2-C — Full Attack
  // =====================================================================
  T.setCurrentStance('Full Attack'); T.recalcAll();
  eq('F2-C','C1','Armor TN reduced by 10',T.getStanceArmorTNBonus(),-10);
  eq('F2-C','C2','f_currentTN reflects the -10',TN(),baseTN-10);
  const expect12k4=(()=>{const a=T.applyTenDiceRule(12,4);return a.rolled+'k'+a.kept;})();
  meleeAttack(katana);
  ok('F2-C','C3','Ten Dice Rule saw the MODIFIED 12k4 pool',/12k4/.test(notation()));
  eq('F2-C','C4','Dice rolled match the Ten Dice conversion',dice().length,
     parseInt(expect12k4.split('k')[0],10));
  ok('F2-C','C5','Modifier bar present',!!modBar());
  ok('F2-C','C6','Bar shows the Full Attack stance +2k1',
     /Full Attack stance/.test(modBar().textContent) && /\+2k1/.test(modBar().textContent));
  // survives a die click
  const unkept=dice().find(d=>!d.classList.contains('kept'));
  const before=totalNow();
  if(unkept){ unkept.click();
    eq('F2-C','C7','Total recomputes correctly after a die click',
       totalNow(),dice().filter(d=>d.classList.contains('kept'))
         .reduce((s,d)=>s+parseInt(d.dataset.total,10),0)+(T.applyTenDiceRule(12,4).bonus||0));
  } else rec('F2-C','C7','Total recomputes after a die click',true,'no unkept die');
  closeRoll();
  // ranged forbidden
  const yumi=addWeapon('Yumi'); addSkill('Kyujutsu',3); T.recalcAll();
  const p=T.rollWeaponAttack(yumi);
  await tick();
  const popupShown=document.getElementById('appConfirmOverlay').style.display==='flex';
  const popupMsg=document.getElementById('appConfirmMsg').textContent;
  if(popupShown) document.getElementById('appConfirmOk').click();
  await p;
  ok('F2-C','C8','Full Attack refuses a ranged attack',popupShown);
  ok('F2-C','C9','Refusal quotes the RAW restriction',/cannot be used to deliver ranged attacks/i.test(popupMsg));
  no('F2-C','C10','No range prompt shown',document.getElementById('rangePickModalOverlay').style.display==='flex');
  no('F2-C','C11','No roll modal opened',rollOpen());
  closeRoll();

  // =====================================================================
  // F2-D — Defense / Full Defense
  // =====================================================================
  reset(); addSkill('Defense',3); T.recalcAll();
  const tnBase2=TN();
  T.setCurrentStance('Defense'); T.recalcAll();
  const air=T.getRingValueByName('air');
  eq('F2-D','D1','Defense adds Air Ring + Defense Rank',T.getStanceArmorTNBonus(),air+3);
  eq('F2-D','D2','f_currentTN reflects it',TN(),tnBase2+air+3);
  eq('F2-D','D3','Defense contributes no roll modifiers',
     T.stancePreRollModifiers(T.makeRollContext('attack')),null);
  eq('F2-D','D4','Defense does not change Initiative',T.getStanceInitiativeBonus(),0);

  // Full Defense: declaration roll -> half the total (round up), until next turn
  T.setCurrentStance('Full Defense');
  ok('F2-D','D5','Full Defense opens its declaration roll',rollOpen());
  forceDice([9,8]);            // both kept -> total 17 -> ceil(17/2) = 9
  T.updateRollKeepState(2);
  document.getElementById('rollModalClose').click();
  eq('F2-D','D6','Half the total, rounded up, becomes the bonus',T.getFullDefenseBonus(),9);
  eq('F2-D','D7','f_currentTN reflects the Full Defense bonus',TN(),tnBase2+9);
  eq('F2-D','D8','Full Defense contributes no roll modifiers',
     T.stancePreRollModifiers(T.makeRollContext('attack')),null);
  T.advanceCombatRound(); T.recalcAll();
  eq('F2-D','D9','The bonus lapses on the following round',T.getFullDefenseBonus(),0);
  eq('F2-D','D10','...and f_currentTN returns to base',TN(),tnBase2);
  T.setCurrentStance('Attack',{silent:true}); T.recalcAll();
  eq('F2-D','D11','Leaving Full Defense clears the stored bonus',T.getFullDefenseBonus(),0);

  // =====================================================================
  // F2-E — Center, this round
  // =====================================================================
  reset(); addSkill('Kenjutsu',7,'Katana'); const kat2=addWeapon('Katana'); T.recalcAll();
  const tnBase3=TN();
  T.setCurrentStance('Center'); T.recalcAll();
  eq('F2-E','E1','Center adds no Armor TN this round',T.getStanceArmorTNBonus(),0);
  eq('F2-E','E2','f_currentTN unchanged',TN(),tnBase3);
  eq('F2-E','E3','Center adds no Initiative bonus this round',T.getStanceInitiativeBonus(),0);
  eq('F2-E','E4','Center contributes no roll modifiers this round',
     T.stancePreRollModifiers(T.makeRollContext('attack')),null);
  no('F2-E','E5','Center bonus not yet available',T.centerBonusAvailable());
  meleeAttack(kat2);
  no('F2-E','E6','No modifier bar while in Center',modBar());
  closeRoll();

  // =====================================================================
  // F2-F — Center, next round
  // =====================================================================
  T.advanceCombatRound();
  T.setCurrentStance('Attack',{silent:true});
  T.recalcAll();
  ok('F2-F','F1','Center was last round',T.centerWasLastRound());
  ok('F2-F','F2','Center bonus is available',T.centerBonusAvailable());
  const voidRing=T.getRingValueByName('void');
  eq('F2-F','F3','Initiative gains +10',T.getStanceInitiativeBonus(),10);
  ok('F2-F','F4','f_initiative display shows +10',/\+10/.test(document.getElementById('f_initiative').value));
  meleeAttack(kat2);
  ok('F2-F','F5','Modifier bar present',!!modBar());
  ok('F2-F','F6','Bar names the Center previous-round bonus',
     /Center stance \(previous round\)/.test(modBar().textContent));
  ok('F2-F','F7','Bar shows +1k1',/\+1k1/.test(modBar().textContent));
  ok('F2-F','F8','Bar shows the Void Ring added to the total',
     new RegExp('\\+'+voidRing+' to total').test(modBar().textContent));
  ok('F2-F','F9','Pool became 11k4',/11k4/.test(notation()));
  closeRoll();
  no('F2-F','F10','Bonus consumed after the roll',T.centerBonusAvailable());
  meleeAttack(kat2);
  no('F2-F','F11','Second attack same round gets NO bonus (does not stack)',modBar());
  eq('F2-F','F12','...and the pool is back to 10k3',notation(),'10k3');
  closeRoll();
  T.advanceCombatRound(); T.recalcAll();
  no('F2-F','F13','Bonus does not leak into a later round',T.centerBonusAvailable());
  eq('F2-F','F14','Initiative bonus also gone',T.getStanceInitiativeBonus(),0);
  meleeAttack(kat2);
  no('F2-F','F15','No modifier bar two rounds after Center',modBar());
  closeRoll();
  // cancelled roll must not burn the bonus
  reset(); addSkill('Kenjutsu',7,'Katana'); addSkill('Kyujutsu',3);
  const kat3=addWeapon('Katana'); const yumi2=addWeapon('Yumi'); T.recalcAll();
  T.setCurrentStance('Center'); T.advanceCombatRound(); T.setCurrentStance('Attack',{silent:true});
  ok('F2-F','F16','Bonus available before the cancelled roll',T.centerBonusAvailable());
  const pc=T.rollWeaponAttack(yumi2);
  document.getElementById('rangePickClose').click();
  await pc;
  ok('F2-F','F17','A cancelled attack does not burn the Center bonus',T.centerBonusAvailable());
  closeRoll();

  // =====================================================================
  // F2-G — negative scope, and combining with Feature 1
  // =====================================================================
  eq('F2-G','G1','Damage rolls get no stance modifier',
     T.stancePreRollModifiers(T.makeRollContext('damage')),null);
  eq('F2-G','G2','Skill rolls get no stance modifier',
     T.stancePreRollModifiers(T.makeRollContext('skill')),null);
  eq('F2-G','G3','Spell rolls get no stance modifier',
     T.stancePreRollModifiers(T.makeRollContext('spell')),null);
  eq('F2-G','G4','Manual rolls get no stance modifier',
     T.stancePreRollModifiers(T.makeRollContext('manual')),null);
  // Center bonus + Feature 1 range penalty on the same attack
  // Kyujutsu 3 + Reflexes 3 = 6k3; Center +1k1 -> 7k4; Yumi at 350ft -> -2k0 -> 5k4
  await rangedAttack(yumi2,'beyond',350);
  ok('F2-G','G5','Range and Center modifiers combine additively',/5k4/.test(notation()));
  ok('F2-G','G6','Bar lists BOTH sources',
     /Center stance/.test(modBar().textContent) && /Range/.test(modBar().textContent));
  closeRoll();
  // damage roll after all that
  kat3.querySelector('.wp-dmg-btn').click();
  no('F2-G','G7','Damage roll shows no modifier bar',modBar());
  closeRoll();
  T.rollSkill('Kenjutsu','Agility',7);
  no('F2-G','G8','Skill roll shows no stance bar',modBar());
  closeRoll();

  // save/load untouched
  T.setCurrentStance('Full Attack'); T.recalcAll();
  const save=T.collectData();
  eq('F2-G','G9','Save still has exactly 42 fields',Object.keys(save.fields).length,42);
  eq('F2-G','G10','No stance keys in the save',
     Object.keys(save.fields).filter(k=>/stance|fullDefense/i.test(k)),[]);
  const sig=JSON.stringify(save); T.applyData(JSON.parse(sig));
  eq('F2-G','G11','save -> load -> save stable',JSON.stringify(T.collectData()),sig);
  // HARNESS EVOLUTION (Feature 3). This previously asserted the registry was exactly
  // ['range','stance']. That invariant was correct only until the next feature registered a
  // permanent contributor -- Feature 3 adds 'wounds' -- and would break again at Feature 4.
  // WHY THE NEW INVARIANT IS CORRECT: what Feature 2 actually needs to guarantee is (a) its own
  // contributor is registered, and (b) no TEST modifier has leaked. Pinning the full list was
  // over-specifying, and pinned a fact that is not Feature 2's to own.
  ok('F2-G','G12a','Feature 2 registered its stance contributor',
     T.PREROLL_MODIFIER_REGISTRY.some(m=>m.id==='stance'));
  ok('F2-G','G12b','Feature 1 range contributor still present',
     T.PREROLL_MODIFIER_REGISTRY.some(m=>m.id==='range'));
  eq('F2-G','G12c','No test modifiers leaked into the registry',
     T.PREROLL_MODIFIER_REGISTRY.filter(m=>/^t_/.test(m.id)).map(m=>m.id),[]);

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
  await runSuite('Feature1','/l5r-P1-P2-F1-test-harness.js');
  await runSuite('P1P2','/p12-harness.js');
  await runSuite('Feature0','/f0-harness.js');
  await runSuite('PartB','/partB-harness.js');

  const fails=results.filter(r=>!r.pass);
  const by={};results.forEach(r=>{by[r.section]=by[r.section]||{pass:0,fail:0};by[r.section][r.pass?'pass':'fail']++;});
  console.log('%c PART C — FEATURE 2: STANCE SYSTEM ','background:#7b1113;color:#fff;font-weight:bold;padding:3px 6px;');
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
