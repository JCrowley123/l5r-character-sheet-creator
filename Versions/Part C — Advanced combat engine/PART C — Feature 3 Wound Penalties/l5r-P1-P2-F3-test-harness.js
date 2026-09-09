/* =============================================================================
 * L5R 4e — COMBINED HARNESS: Feature 3 (Wound Penalties) + F2 + F1 + P1/P2 + F0 + Part B
 * =============================================================================
 *   fetch('/l5r-P1-P2-F3-test-harness.js').then(r=>r.text()).then(s=>(0,eval)(s))
 * DESTRUCTIVE: clears Skills/Weapons, resets stance, rounds and wounds.
 * ============================================================================= */
(async function runF3Harness(){
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
  // Wound level is derived from Earth Ring + wounds taken, exactly as renderWounds() does.
  // IMPORTANT: the Earth Ring cannot be pinned by writing to #ring_earth -- recalcAll()
  // recomputes every Ring as min() of its two Traits, so a hardcoded "wounds taken" number is
  // only valid for one Earth value. Derive the number from the LIVE thresholds instead.
  const setWoundLevel=name=>{
    T.recalcAll();                                             // settle Earth from the Traits
    const earth=parseInt(document.getElementById('ring_earth').value||'2',10);
    const th=T.computeWoundThresholds(earth);
    const idx=T.WOUND_LEVELS.findIndex(l=>l.name===name);
    document.getElementById('f_woundsTaken').value = idx<=0 ? 0 : th[idx];
    T.recalcAll();
  };
  const setWounds=setWoundLevel;              // alias: every call site passes a level name
  const reset=()=>{sB().innerHTML='';wB().innerHTML='';setAllTraits(3);T.resetCombatRound();
    T.clearFullDefenseBonus();T.setCurrentStance('Attack',{silent:true});setWounds('Healthy');closeRoll();};
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
  // F3-A — the lookup table
  // =====================================================================
  eq('F3-A','A1','Table matches the RAW penalties',
     ['Healthy','Nicked','Grazed','Hurt','Injured','Crippled','Down'].map(k=>T.WOUND_PENALTIES[k]),
     [0,-3,-5,-10,-15,-20,-40]);
  eq('F3-A','A2','Healthy reads 0',(()=>{setWounds('Healthy');return [T.getCurrentWoundLevelName(),T.getWoundPenalty()];})(),
     ['Healthy',0]);
  eq('F3-A','A3','Nicked reads -3',(()=>{setWounds('Nicked');return [T.getCurrentWoundLevelName(),T.getWoundPenalty()];})(),
     ['Nicked',-3]);
  eq('F3-A','A4','Down reads -40',(()=>{setWounds('Down');return [T.getCurrentWoundLevelName(),T.getWoundPenalty()];})(),
     ['Down',-40]);
  eq('F3-A','A5','Level tracks the sheet’s own wound track',
     (()=>{setWounds('Hurt');return T.getCurrentWoundLevelName();})(),'Hurt');
  setWounds('Healthy');

  // =====================================================================
  // F3-B — contributor purity and scope
  // =====================================================================
  setWounds('Nicked');
  ['attack','skill','spell','trait','ring','initiative','manual'].forEach((k,i)=>{
    const m=T.woundPreRollModifiers(T.makeRollContext(k));
    eq('F3-B','B'+(i+1),'Applies to '+k+' rolls',
       m && [m[0].totalDelta, m[0].rolledDelta||0, m[0].keptDelta||0, m[0].label],
       [-3,0,0,'Wound Penalty']);
  });
  eq('F3-B','B8','NEVER applies to damage rolls',
     T.woundPreRollModifiers(T.makeRollContext('damage')),null);
  setWounds('Healthy');
  eq('F3-B','B9','Healthy contributes nothing at all',
     T.woundPreRollModifiers(T.makeRollContext('attack')),null);
  eq('F3-B','B10','Contributor only ever uses totalDelta',
     (()=>{setWounds('Down');const m=T.woundPreRollModifiers(T.makeRollContext('attack'));setWounds('Healthy');
           return [m[0].rolledDelta===undefined,m[0].keptDelta===undefined,m[0].totalDelta];})(),
     [true,true,-40]);

  // =====================================================================
  // F3-C — Healthy is a strict zero-change guarantee
  // =====================================================================
  reset(); addSkill('Kenjutsu',7,'Katana'); const katana=addWeapon('Katana'); T.recalcAll();
  T.rollWeaponAttack(katana);
  no('F3-C','C1','Healthy attack: no modifier bar',modBar());
  eq('F3-C','C2','Healthy attack: unmodified 10k3',notation(),'10k3');
  closeRoll();
  T.rollSkill('Kenjutsu','Agility',7);
  no('F3-C','C3','Healthy skill roll: no modifier bar',modBar());
  closeRoll();
  T.rollNotation('Manual','5k2');
  no('F3-C','C4','Healthy manual roll: no modifier bar',modBar());
  closeRoll();
  document.getElementById('btnRollInitiative').click();
  no('F3-C','C5','Healthy initiative: no modifier bar',modBar());
  closeRoll();

  // =====================================================================
  // F3-D — Nicked (-3) reaches every roll kind, end to end
  // =====================================================================
  setWounds('Nicked');
  T.rollWeaponAttack(katana);
  ok('F3-D','D1','Attack shows the wound bar',/Wound Penalty/.test(barText()));
  ok('F3-D','D2','Bar reads -3 to total',/-3 to total/.test(barText()));
  eq('F3-D','D3','Dice pool UNCHANGED at 10k3',notation(),'10k3');
  eq('F3-D','D4','Displayed total includes -3',totalNow(),keptSum()-3);
  // die-click recomputation
  const unkept=dice().find(d=>!d.classList.contains('kept'));
  if(unkept){ unkept.click();
    eq('F3-D','D5','-3 survives a die click',totalNow(),keptSum()-3);
  } else rec('F3-D','D5','-3 survives a die click',true,'no unkept die');
  closeRoll();
  T.rollSkill('Kenjutsu','Agility',7);
  eq('F3-D','D6','Skill roll total includes -3',totalNow(),keptSum()-3);
  closeRoll();
  T.rollNotation('Manual','5k2');
  eq('F3-D','D7','Manual roll total includes -3',totalNow(),keptSum()-3);
  ok('F3-D','D8','Manual roll shows the wound bar',/Wound Penalty/.test(barText()));
  closeRoll();
  document.getElementById('btnRollInitiative').click();
  eq('F3-D','D9','Initiative total includes -3',totalNow(),keptSum()-3);
  closeRoll();
  T.performSpellCastRoll('fire','Fire','Test Spell',1,[]);
  eq('F3-D','D10','Spell Casting Roll total includes -3',totalNow(),keptSum()-3);
  ok('F3-D','D11','Spell roll keeps its TN readout',
     !!document.querySelector('.roll-tn-note') || /Target Number/.test(document.getElementById('rollModalBody').textContent));
  closeRoll();

  // =====================================================================
  // F3-E — Down (-40)
  // =====================================================================
  setWounds('Down');
  T.rollWeaponAttack(katana);
  ok('F3-E','E1','Down shows -40',/-40 to total/.test(barText()));
  eq('F3-E','E2','Total includes -40',totalNow(),keptSum()-40);
  eq('F3-E','E3','Pool still unchanged',notation(),'10k3');
  closeRoll();

  // =====================================================================
  // F3-F — combines additively with stance and range
  // =====================================================================
  setWounds('Nicked');
  T.setCurrentStance('Full Attack'); T.recalcAll();
  T.rollWeaponAttack(katana);
  ok('F3-F','F1','Stance + wounds: both listed',
     /Full Attack stance/.test(barText()) && /Wound Penalty/.test(barText()));
  ok('F3-F','F2','Stance still changes the pool to 12k4',/12k4/.test(notation()));
  eq('F3-F','F3','Total = kept + tenDiceBonus - 3',
     totalNow(),keptSum()+(T.applyTenDiceRule(12,4).bonus||0)-3);
  closeRoll();
  T.setCurrentStance('Attack',{silent:true}); T.recalcAll();
  // range + wounds
  addSkill('Kyujutsu',3); const yumi=addWeapon('Yumi'); T.recalcAll();
  await rangedAttack(yumi,'beyond',350);         // 6k3 -> -2k0 -> 4k3, and -3 to total
  ok('F3-F','F4','Range + wounds: both listed',
     /Range/.test(barText()) && /Wound Penalty/.test(barText()));
  eq('F3-F','F5','Range reduced the pool to 4k3',notation(),'4k3');
  eq('F3-F','F6','Total includes the -3',totalNow(),keptSum()-3);
  closeRoll();
  // stance + range + wounds together (Center's +1k1 + Void)
  T.setCurrentStance('Center'); T.advanceCombatRound(); T.setCurrentStance('Attack',{silent:true});
  setWounds('Nicked');
  const voidRing=T.getRingValueByName('void');
  await rangedAttack(yumi,'beyond',350);         // 6k3 +1k1 -> 7k4 ; -2k0 -> 5k4 ; +Void -3 total
  ok('F3-F','F7','All three sources listed',
     /Center stance/.test(barText()) && /Range/.test(barText()) && /Wound Penalty/.test(barText()));
  eq('F3-F','F8','Pool is 5k4',notation(),'5k4');
  eq('F3-F','F9','Total = kept + Void - 3',totalNow(),keptSum()+voidRing-3);
  closeRoll();
  T.resetCombatRound(); T.setCurrentStance('Attack',{silent:true});

  // =====================================================================
  // F3-G — negative scope, save/load, registry
  // =====================================================================
  setWounds('Down');
  katana.querySelector('.wp-dmg-btn').click();
  no('F3-G','G1','Damage roll shows NO modifier bar even at Down',modBar());
  eq('F3-G','G2','Damage pool untouched',notation(),
     katana.querySelector('.wp-dmg').value);
  closeRoll();
  eq('F3-G','G3','Registry is exactly range, stance, wounds',
     T.PREROLL_MODIFIER_REGISTRY.map(m=>m.id).sort(),['range','stance','wounds']);
  eq('F3-G','G4','Priorities are 20 / 30 / 40',
     T.PREROLL_MODIFIER_REGISTRY.map(m=>m.id+'@'+m.priority),
     ['range@20','stance@30','wounds@40']);
  T.recalcAll();
  const save=T.collectData();
  eq('F3-G','G5','Save still has exactly 42 fields',Object.keys(save.fields).length,42);
  eq('F3-G','G6','No wound-penalty keys added to the save',
     Object.keys(save.fields).filter(k=>/woundPenalt|woundLevel/i.test(k)),[]);
  ok('F3-G','G7','The existing f_woundsTaken field is still the only wound state',
     save.fields.f_woundsTaken !== undefined);
  const sig=JSON.stringify(save); T.applyData(JSON.parse(sig));
  eq('F3-G','G8','save -> load -> save stable',JSON.stringify(T.collectData()),sig);
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
  await runSuite('Feature2','/l5r-P1-P2-F2-test-harness.js');
  await runSuite('Feature1','/l5r-P1-P2-F1-test-harness.js');
  await runSuite('P1P2','/p12-harness.js');
  await runSuite('Feature0','/f0-harness.js');
  await runSuite('PartB','/partB-harness.js');
  await runSuite('SchoolFix','/schoolfree-harness.js');

  const fails=results.filter(r=>!r.pass);
  const by={};results.forEach(r=>{by[r.section]=by[r.section]||{pass:0,fail:0};by[r.section][r.pass?'pass':'fail']++;});
  console.log('%c PART C — FEATURE 3: WOUND PENALTIES ','background:#7b1113;color:#fff;font-weight:bold;padding:3px 6px;');
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
