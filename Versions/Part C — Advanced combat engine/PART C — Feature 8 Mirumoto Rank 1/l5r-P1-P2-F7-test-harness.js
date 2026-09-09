/* =============================================================================
 * L5R 4e — COMBINED HARNESS: Feature 7 (Dual-Wielding) + F6 + F4 + F3 + F2 + F1
 *                            + P1/P2 + F0 + Part B + schoolfix
 * =============================================================================
 *   fetch('/l5r-P1-P2-F7-test-harness.js').then(r=>r.text()).then(s=>(0,eval)(s))
 * DESTRUCTIVE: clears Skills/Weapons/Equipment/Techniques, resets stance, rounds,
 * wounds, Void, ammo and handedness.
 * ============================================================================= */
(async function runF7Harness(){
  'use strict';
  const T = window.__L5R_TEST__;
  if(!T){ console.error('__L5R_TEST__ seam not found.'); return {total:1,passed:0,failed:1,results:[]}; }

  const results=[];
  // Live progress marker. This harness drives modal prompts, so a mis-sequenced click can
  // leave it awaiting a promise that will never resolve. Publishing the last assertion to
  // reach rec() turns "it is stuck somewhere" into "it is stuck right after F7-C C17".
  const rec=(s,id,n,p,d)=>{
    window.__L5R_HARNESS_PROGRESS = s+' '+id+' | '+n;
    results.push({section:s,id,name:n,pass:!!p,detail:d||''});
  };
  const eq=(s,id,n,a,e)=>{const x=JSON.stringify(a),y=JSON.stringify(e);rec(s,id,n,x===y,x===y?'':'got '+x+' want '+y);};
  const ok=(s,id,n,v)=>rec(s,id,n,!!v,v?'':'expected truthy');
  const no=(s,id,n,v)=>rec(s,id,n,!v,v?'expected falsy, got '+JSON.stringify(v):'');
  const tick=()=>new Promise(r=>setTimeout(r,0));
  // Waits for a CONDITION, not for one turn of the event loop. How many promise links sit
  // between a click and the next prompt being painted varies with nesting depth and with how
  // fast timers happen to be running, so a single setTimeout(0) is not a reliable way to be
  // sure a modal is on screen -- when it loses the race the run awaits a click forever.
  // Microtasks are drained first because they are never throttled and the prompts resolve
  // through a promise chain; the timer loop is the fallback.
  const waitFor=async(fn,ms)=>{
    for(let i=0;i<200;i++){ if(fn()) return true; await Promise.resolve(); }
    const end=Date.now()+(ms||3000);
    while(Date.now()<end){ if(fn()) return true; await new Promise(r=>setTimeout(r,0)); }
    return !!fn();};

  const sB=()=>document.getElementById('skillsBody');
  const wB=()=>document.getElementById('weaponsBody');
  const eB=()=>document.getElementById('equipBody');
  const tB=()=>document.getElementById('techList');
  const setAllTraits=v=>['agility','reflexes','strength','stamina','perception','awareness','intelligence','willpower']
    .forEach(k=>document.getElementById('trait_'+k).value=v);
  const addSkill=(n,r,e)=>sB().appendChild(T.makeSkillRow({name:n,trait:(T.findSkill(n)||{}).trait||'',rank:r,emph:e||''}));
  const addWeapon=n=>{const L=T.findWeapon(n);
    const row=wB().appendChild(T.makeWeaponRow({key:L.name,name:L.name,skill:L.skill,size:L.size,
      keywords:'',notes:'',roll:'',dmg:'',manualAttack:false,manualDamage:false}));
    T.refreshAllWeaponRows(); return row;};
  const addTech=(name,desc)=>{const d=tB().appendChild(T.makeEntry({name:name,desc:desc},true,'XP'));
    T.recalcAll(); return d;};
  const modBar=()=>document.getElementById('rollModifierBar');
  const barText=()=>modBar()?modBar().textContent.replace(/\s+/g,' '):'';
  const notation=()=>document.getElementById('rollModalNotation').textContent;
  const title=()=>document.getElementById('rollModalTitle').textContent;
  const totalNow=()=>parseInt(document.getElementById('rollTotalDisplay').textContent,10);
  const keptSum=()=>Array.from(document.querySelectorAll('#rollDiceRow .roll-die'))
    .filter(d=>d.classList.contains('kept')).reduce((s,d)=>s+parseInt(d.dataset.total,10),0);
  const closeRoll=()=>{document.getElementById('rollModalOverlay').style.display='none';
                       document.getElementById('rollModalBody').innerHTML='';};
  const rollOpen=()=>document.getElementById('rollModalOverlay').style.display==='flex';
  const handOpen=()=>document.getElementById('handPickModalOverlay').style.display==='flex';
  const rangeOpen=()=>document.getElementById('rangePickModalOverlay').style.display==='flex';
  const ammoOpen=()=>document.getElementById('arrowPickModalOverlay').style.display==='flex';
  const TN=()=>parseInt(document.getElementById('f_currentTN').value,10);
  const insight=()=>parseInt(document.getElementById('f_insightRank').value||'0',10);
  const followUp=()=>document.getElementById('offHandFollowUpBar');
  const handSel=row=>row.querySelector('.wp-hand');
  const handRowVisible=row=>row.querySelector('.wp-hand-row').style.display!=='none';
  const noteOf=row=>row.querySelector('.wp-link-note').textContent.replace(/\s+/g,' ');

  // Handedness, techniques and equipment all leak across sections if they are not torn down.
  // Nothing below the F7 sections may see an off-hand row: Features 1-6 all roll weapon attacks
  // and know nothing about the handedness prompt, so one leaked off-hand row would hang them.
  const clearDual=()=>{wB().querySelectorAll('.wp-hand').forEach(el=>el.value='main');
    tB().innerHTML=''; T.refreshAllWeaponRows(); T.recalcAll();};
  const reset=()=>{sB().innerHTML='';wB().innerHTML='';eB().innerHTML='';tB().innerHTML='';
    T.clearLastArrowUsed(); setAllTraits(3);
    T.resetCombatRound();T.clearFullDefenseBonus();T.setCurrentStance('Attack',{silent:true});
    T.clearVoidPending();T.clearVoidSkirmishEffects();T.setCombatActive(false);
    document.getElementById('f_woundsTaken').value=0;
    document.getElementById('ring_void').value=5;document.getElementById('void_current').value=5;
    T.recalcAll();closeRoll();};

  // Starts an attack and leaves whatever prompt is on screen there. NOT async: an async helper
  // would await the promise instead of handing it back, and the point is to inspect mid-flight.
  const begin=row=>T.rollWeaponAttack(row);
  // Answers the handedness prompt (if any), then the range prompt (if any), then the ammunition
  // prompt (if any). `hand` may be 'main' | 'off' | 'both' | null-to-cancel, or undefined to
  // assert that no prompt appeared at all.
  const attack=async(row,hand,arrowName)=>{
    const p=begin(row);
    // Settled-flag so each wait below ends the moment the attack finishes on its own: a
    // dormant single-weapon attack opens no prompt at all and must not burn a timeout.
    let settled=false; const mark=()=>{settled=true;};
    Promise.resolve(p).then(mark,mark);
    const step=fn=>waitFor(()=>fn()||settled);
    await step(handOpen);
    if(handOpen()){
      if(hand===null){ document.getElementById('handPickClose').click(); }
      else if(hand==='main') document.getElementById('handOptMain').click();
      else if(hand==='off')  document.getElementById('handOptOff').click();
      else if(hand==='both') document.getElementById('handOptBoth').click();
      else document.getElementById('handPickClose').click();
      await step(()=>rangeOpen()||ammoOpen());
    }
    if(rangeOpen()){ document.getElementById('rangeOptWithin').click(); await step(ammoOpen); }
    if(ammoOpen()){
      if(arrowName){ const b=document.getElementById('arrowOpt_'+T.findArrow(arrowName).key);
        if(b && !b.disabled) b.click(); else document.getElementById('arrowPickClose').click(); }
      else document.getElementById('arrowPickClose').click();
      await tick();
    }
    return await p;
  };
  // Clicks the "Roll off-hand attack" control in a finished main-hand result.
  const rollOffHand=async(arrowName)=>{
    document.getElementById('offHandRollBtn').click();
    // No promise handle here -- the control starts the attack itself -- so these waits are
    // bounded and simply fall through when the weapon needs no prompt.
    await waitFor(()=>rangeOpen()||ammoOpen(),400);
    if(rangeOpen()){ document.getElementById('rangeOptWithin').click();
                     await waitFor(ammoOpen,400); }
    if(ammoOpen()){
      if(arrowName){ const b=document.getElementById('arrowOpt_'+T.findArrow(arrowName).key);
        if(b && !b.disabled) b.click(); else document.getElementById('arrowPickClose').click(); }
      else document.getElementById('arrowPickClose').click();
      await tick();
    }
    await tick();
  };
  reset();

  // =====================================================================
  // F7-A — handedness detection
  // =====================================================================
  eq('F7-A','A1','RAW off-hand penalties are size-scaled -5 / -10 / -15',
     [T.OFF_HAND_RULES.offHandBySize.Small,T.OFF_HAND_RULES.offHandBySize.Medium,
      T.OFF_HAND_RULES.offHandBySize.Large],[-5,-10,-15]);
  eq('F7-A','A2','RAW main-hand penalty is -5 while a second weapon is held',
     T.OFF_HAND_RULES.mainHandPenalty,-5);
  eq('F7-A','A3','An unsized custom weapon falls back to the Medium figure',
     T.OFF_HAND_RULES.offHandDefault,-10);
  eq('F7-A','A4','offHandPenaltyForSize reads every printed Size',
     ['Small','Medium','Large','large','','Enormous'].map(T.offHandPenaltyForSize),
     [-5,-10,-15,-15,-10,-10]);
  eq('F7-A','A5','Only main and off are legal hands',T.HAND_VALUES,['main','off']);
  eq('F7-A','A6','Main-hand is the default',T.DEFAULT_HAND,'main');
  eq('F7-A','A7','Anything unrecognised normalises to main-hand',
     ['','off','OFF','main','left','null',null,undefined].map(T.normaliseHand),
     ['main','off','off','main','main','main','main','main']);
  // rows
  reset(); addSkill('Kenjutsu',3,'Katana'); const kA=addWeapon('Katana');
  eq('F7-A','A8','A new weapon row defaults to main-hand',T.getRowHand(kA),'main');
  no('F7-A','A9','One weapon: no pair',T.getDualWieldPair(kA));
  no('F7-A','A10','One weapon: dual-wield is not active',T.isDualWieldActive());
  no('F7-A','A11','One weapon: the Hand selector is not even shown',handRowVisible(kA));
  const wA=addWeapon('Wakizashi');
  ok('F7-A','A12','A second weapon reveals the Hand selector',handRowVisible(kA)&&handRowVisible(wA));
  no('F7-A','A13','...but two main-hands is still not dual-wielding',T.isDualWieldActive());
  no('F7-A','A14','...and still no pair',T.getDualWieldPair(kA));
  T.setRowHand(wA,'off');
  ok('F7-A','A15','Declaring an off-hand activates dual-wielding',T.isDualWieldActive());
  eq('F7-A','A16','...and pairs the two rows',
     (()=>{const p=T.getDualWieldPair(kA);return [p.main===kA,p.off===wA];})(),[true,true]);
  eq('F7-A','A17','Clicking the off-hand row pairs it the same way',
     (()=>{const p=T.getDualWieldPair(wA);return [p.main===kA,p.off===wA];})(),[true,true]);
  eq('F7-A','A18','getOffHandRow finds the declared off hand',T.getOffHandRow(),wA);
  ok('F7-A','A19','The selector is flagged as off-hand',
     wA.querySelector('.wp-hand-row').classList.contains('is-offhand'));
  T.setRowHand(wA,'main');
  no('F7-A','A20','Setting it back to main-hand stands the feature down',T.isDualWieldActive());
  // skill-mastery exemptions
  eq('F7-A','A21','Knives Rank 3 is declared as an off-hand exemption',T.getOffHandExemptRank('Knives'),3);
  eq('F7-A','A22','War Fan Rank 3 too',T.getOffHandExemptRank('War Fan'),3);
  eq('F7-A','A23','No other Skill claims one',
     T.SKILL_LIBRARY.filter(s=>typeof s.offHandExempt==='number').map(s=>s.name),
     ['Knives','War Fan']);
  eq('F7-A','A24','Kenjutsu has no off-hand exemption',T.getOffHandExemptRank('Kenjutsu'),null);
  eq('F7-A','A25','The exemption respects the Rank threshold',
     [0,2,3,7].map(r=>T.skillExemptsOffHand('Knives',r)),[false,false,true,true]);
  // the audit: declared field and printed mastery text must agree, both ways
  eq('F7-A','A26','Every printed off-hand mastery is declared structurally (and vice versa)',
     T.offHandMasteryAudit(),[]);

  // =====================================================================
  // F7-B — off-hand penalty
  // =====================================================================
  reset(); addSkill('Kenjutsu',3,'Katana'); setAllTraits(3);
  const kB=addWeapon('Katana');        // Medium
  const wB2=addWeapon('Wakizashi');    // Medium
  T.setRowHand(wB2,'off');
  eq('F7-B','B1','A medium off-hand weapon is -10',
     T.getOffHandPenalty(T.findWeapon('Wakizashi'),'Kenjutsu',3,'Medium').penalty,-10);
  eq('F7-B','B2','A small off-hand weapon is -5',
     T.getOffHandPenalty(T.findWeapon('Tanto'),'Kenjutsu',3,'Small').penalty,-5);
  eq('F7-B','B3','A large off-hand weapon is -15',
     T.getOffHandPenalty(T.findWeapon('No-dachi'),'Kenjutsu',3,'Large').penalty,-15);
  eq('F7-B','B4','The main hand pays -5 for the second weapon',T.getMainHandPenalty().penalty,-5);
  // contributor scope
  eq('F7-B','B5','Silent on every non-attack roll kind',
     ['skill','damage','spell','trait','ring','initiative','manual']
       .map(k=>T.offHandPreRollModifiers(T.makeRollContext(k,{hand:'off',weaponEntry:T.findWeapon('Wakizashi')}))),
     [null,null,null,null,null,null,null]);
  eq('F7-B','B6','Silent on an attack that declared no hand',
     T.offHandPreRollModifiers(T.makeRollContext('attack',{weaponEntry:T.findWeapon('Katana')})),null);
  eq('F7-B','B7','An off-hand attack contributes -10 to the total',
     (()=>{const m=T.offHandPreRollModifiers(T.makeRollContext('attack',
        {hand:'off',weaponEntry:T.findWeapon('Wakizashi'),skillName:'Kenjutsu',skillRank:3,weaponSize:'Medium'}));
       return [m.length,m[0].totalDelta,m[0].label];})(),[1,-10,'Off-hand attack']);
  eq('F7-B','B8','A main-hand attack contributes -5 to the total',
     (()=>{const m=T.offHandPreRollModifiers(T.makeRollContext('attack',
        {hand:'main',weaponEntry:T.findWeapon('Katana'),skillName:'Kenjutsu',skillRank:3,weaponSize:'Medium'}));
       return [m.length,m[0].totalDelta,m[0].label];})(),[1,-5,'Main hand']);
  // end to end: the penalty reaches the total and survives
  await attack(kB,'main');
  ok('F7-B','B9','Main-hand attack: the modifier bar names the penalty',/Main hand:\s*-5 to total/.test(barText()));
  eq('F7-B','B10','...and the total is the kept sum minus 5',totalNow(),keptSum()-5);
  ok('F7-B','B11','...and the title says which hand',/main hand/.test(title()));
  closeRoll();
  await attack(wB2,'off');
  ok('F7-B','B12','Off-hand attack: the bar names the -10',/Off-hand attack:\s*-10 to total/.test(barText()));
  eq('F7-B','B13','...and the total is the kept sum minus 10',totalNow(),keptSum()-10);
  ok('F7-B','B14','...and the note names the weapon size',/medium weapon in the off hand/.test(barText()));
  closeRoll();
  // size actually drives it: a no-dachi in the off hand is -15
  reset(); addSkill('Kenjutsu',3,'Katana'); setAllTraits(3);
  const kB2=addWeapon('Katana'); const ndB=addWeapon('No-dachi'); T.setRowHand(ndB,'off');
  await attack(ndB,'off');
  ok('F7-B','B15','A large off-hand weapon costs -15 end to end',/Off-hand attack:\s*-15 to total/.test(barText()));
  eq('F7-B','B16','...reaching the total',totalNow(),keptSum()-15);
  closeRoll();
  // stance stacks with it
  reset(); addSkill('Kenjutsu',3,'Katana'); setAllTraits(3);
  const kB3=addWeapon('Katana'); const wB3=addWeapon('Wakizashi'); T.setRowHand(wB3,'off');
  T.setCurrentStance('Full Attack',{silent:true}); T.recalcAll();
  await attack(wB3,'off');
  ok('F7-B','B17','Full Attack +2k1 and the off-hand -10 both apply',
     /Full Attack stance:\s*\+2k1/.test(barText()) && /Off-hand attack:\s*-10 to total/.test(barText()));
  eq('F7-B','B18','...the dice bonus reaching the pool',notation(),'8k4');
  eq('F7-B','B19','...and the flat penalty the total',totalNow(),keptSum()-10);
  closeRoll(); T.setCurrentStance('Attack',{silent:true});
  // Void stacks with it
  T.setCombatActive(true); T.setVoidPending({k1:true}); T.recalcAll();
  await attack(wB3,'off');
  ok('F7-B','B20','A spent Void Point and the off-hand penalty both apply',
     /Void: \+1k1/.test(barText()) && /Off-hand attack:\s*-10 to total/.test(barText()));
  eq('F7-B','B21','...Void raising the pool',notation(),'7k4');
  eq('F7-B','B22','...and the penalty still taken off the total',totalNow(),keptSum()-10);
  closeRoll(); T.clearVoidPending(); T.setCombatActive(false); T.recalcAll();
  // wounds stack too, and the two flat penalties sum
  T.setWoundLevel && T.setWoundLevel('Nicked');
  document.getElementById('f_woundsTaken').value=String(T.computeWoundThresholds(
    parseInt(document.getElementById('ring_earth').value||'2',10))[1]);
  T.recalcAll();
  await attack(wB3,'off');
  eq('F7-B','B23','Wound penalty and off-hand penalty both come off the total',
     totalNow(),keptSum()-10+T.getWoundPenalty());
  closeRoll(); document.getElementById('f_woundsTaken').value=0; T.recalcAll();
  // Skill mastery waives it
  reset(); setAllTraits(3); addSkill('Kenjutsu',3,'Katana'); addSkill('Knives',3,'Tanto');
  const kB4=addWeapon('Katana'); const tanto=addWeapon('Tanto'); T.setRowHand(tanto,'off');
  eq('F7-B','B24','Knives 3 waives the off-hand penalty',
     T.getOffHandPenalty(T.findWeapon('Tanto'),'Knives',3,'Small').penalty,0);
  eq('F7-B','B25','...naming the mastery that did it',
     T.getOffHandPenalty(T.findWeapon('Tanto'),'Knives',3,'Small').exemptSource,'Knives Rank 3');
  await attack(tanto,'off');
  ok('F7-B','B26','...and the bar says so instead of a number',
     /Off-hand:\s*no penalty \(Knives Rank 3\)/.test(barText()));
  eq('F7-B','B27','...the total untouched',totalNow(),keptSum());
  closeRoll();
  eq('F7-B','B28','Knives 2 does NOT waive it',
     T.getOffHandPenalty(T.findWeapon('Tanto'),'Knives',2,'Small').penalty,-5);
  eq('F7-B','B29','A Skill mastery does NOT waive the MAIN hand penalty',T.getMainHandPenalty().penalty,-5);
  // Technique waives everything
  reset(); setAllTraits(3); addSkill('Kenjutsu',3,'Katana');
  const kB5=addWeapon('Katana'); const wB5=addWeapon('Wakizashi'); T.setRowHand(wB5,'off');
  no('F7-B','B30','No Technique: no exemption',T.getDualWieldTechniqueExemption().exempt);
  addTech('Way of the Dragon','When wielding a katana in your main hand and a wakizashi in your off hand, you suffer no penalties of any kind for dual wielding.');
  ok('F7-B','B31','Way of the Dragon is detected',T.getDualWieldTechniqueExemption().exempt);
  eq('F7-B','B32','...and named',T.getDualWieldTechniqueExemption().source,'Way of the Dragon');
  eq('F7-B','B33','...waiving the off-hand penalty',
     T.getOffHandPenalty(T.findWeapon('Wakizashi'),'Kenjutsu',3,'Medium').penalty,0);
  eq('F7-B','B34','...and the main-hand penalty too',T.getMainHandPenalty().penalty,0);
  await attack(kB5,'main');
  ok('F7-B','B35','Main-hand roll reports the waiver rather than a penalty',
     /Dual-wielding:\s*no penalty \(Way of the Dragon\)/.test(barText()));
  eq('F7-B','B36','...leaving the total alone',totalNow(),keptSum());
  closeRoll();
  eq('F7-B','B37','Every documented pattern is recognised',
     ['you suffer no penalties of any kind for dual wielding',
      'you suffer no penalty for wielding two weapons',
      'Off-hand penalties do not apply when using a knife',
      'You have no off-hand penalty'].map(t=>{
        tB().innerHTML=''; addTech('T',t); return T.getDualWieldTechniqueExemption().exempt;}),
     [true,true,true,true]);
  tB().innerHTML='';
  eq('F7-B','B38','An unrelated Technique never triggers it',
     ['Increase your Armor TN by 5','You gain a Free Raise on all Kenjutsu rolls',
      'Two weapons are better than one, the saying goes'].map(t=>{
        tB().innerHTML=''; addTech('T',t); return T.getDualWieldTechniqueExemption().exempt;}),
     [false,false,false]);
  tB().innerHTML=''; T.recalcAll();
  // Armor TN
  reset(); setAllTraits(3); addSkill('Kenjutsu',3,'Katana');
  const kB6=addWeapon('Katana'); const wB6=addWeapon('Wakizashi'); T.recalcAll();
  const tnBefore=TN();
  eq('F7-B','B39','One weapon: no Armor TN bonus',T.getDualWieldArmorTNBonus(),0);
  T.setRowHand(wB6,'off');
  eq('F7-B','B40','Two weapons add Insight Rank to Armor TN',T.getDualWieldArmorTNBonus(),insight());
  eq('F7-B','B41','...and f_currentTN reflects it',TN(),tnBefore+insight());
  T.setRowHand(wB6,'main');
  eq('F7-B','B42','...and it goes away again',TN(),tnBefore);

  // =====================================================================
  // F7-C — two-weapon attack flow
  // =====================================================================
  reset(); setAllTraits(3); addSkill('Kenjutsu',3,'Katana');
  const kC=addWeapon('Katana'); const wC=addWeapon('Wakizashi');
  // dormant
  await attack(kC);
  no('F7-C','C1','No off-hand declared: no handedness prompt',handOpen());
  ok('F7-C','C2','...the attack just rolls',rollOpen());
  no('F7-C','C3','...with no modifier bar at all',modBar());
  eq('F7-C','C4','...and the Feature 6 pool',notation(),'6k3');
  closeRoll();
  // active
  T.setRowHand(wC,'off');
  let p=begin(kC); await tick();
  ok('F7-C','C5','An off-hand weapon makes the attack ask which hand',handOpen());
  ok('F7-C','C6','...naming both weapons',
     /Katana/.test(document.getElementById('handPickSubtitle').textContent) &&
     /Wakizashi/.test(document.getElementById('handPickSubtitle').textContent));
  ok('F7-C','C7','...and the Armor TN it is buying',
     /Armor TN \+/.test(document.getElementById('handPickSubtitle').textContent));
  eq('F7-C','C8','Three options are offered',
     document.querySelectorAll('#handPickBody .hand-opt').length,3);
  ok('F7-C','C9','...each naming its cost',
     /-5 to the total/.test(document.getElementById('handOptMain').textContent) &&
     /-10 to the total/.test(document.getElementById('handOptOff').textContent) &&
     /Two separate attack rolls/.test(document.getElementById('handOptBoth').textContent));
  // cancel
  document.getElementById('handPickClose').click(); await p;
  no('F7-C','C10','Cancelling closes the prompt',handOpen());
  no('F7-C','C11','...and rolls nothing',rollOpen());
  // main only
  await attack(kC,'main');
  ok('F7-C','C12','Main-hand only: one roll',rollOpen());
  ok('F7-C','C13','...titled as the main hand',/Katana/.test(title())&&/main hand/.test(title()));
  no('F7-C','C14','...with no off-hand follow-up offered',followUp());
  closeRoll();
  // off only
  await attack(wC,'off');
  ok('F7-C','C15','Off-hand only: one roll',rollOpen());
  ok('F7-C','C16','...titled as the off hand',/Wakizashi/.test(title())&&/off hand/.test(title()));
  no('F7-C','C17','...with no follow-up',followUp());
  closeRoll();
  // both
  await attack(kC,'both');
  ok('F7-C','C18','Both: the main hand rolls first',/Katana/.test(title()));
  ok('F7-C','C19','...and a follow-up control appears',!!followUp());
  ok('F7-C','C20','...naming the off-hand weapon and its penalty',
     /Wakizashi/.test(followUp().textContent) && /-10/.test(followUp().textContent));
  eq('F7-C','C21','...the main-hand roll taking its own -5',totalNow(),keptSum()-5);
  await rollOffHand();
  ok('F7-C','C22','Clicking it rolls the off hand',/Wakizashi/.test(title())&&/off hand/.test(title()));
  eq('F7-C','C23','...at -10',totalNow(),keptSum()-10);
  no('F7-C','C24','...and the follow-up is gone with the repainted modal',followUp());
  closeRoll();
  // spec 2.2: stance bonuses reach BOTH rolls of a two-weapon attack.
  T.setCurrentStance('Full Attack',{silent:true}); T.recalcAll();
  await attack(kC,'both');
  eq('F7-C','C22a','Both: Full Attack raises the MAIN-hand pool',notation(),'8k4');
  ok('F7-C','C22b','...and the bar shows stance and the main-hand penalty together',
     /Full Attack stance/.test(barText()) && /Main hand:\s*-5 to total/.test(barText()));
  await rollOffHand();
  eq('F7-C','C22c','...and it raises the OFF-hand pool too',notation(),'8k4');
  ok('F7-C','C22d','...with the off-hand penalty on that roll',
     /Full Attack stance/.test(barText()) && /Off-hand attack:\s*-10 to total/.test(barText()));
  closeRoll(); T.setCurrentStance('Attack',{silent:true}); T.recalcAll();
  // A Void Point is spent by ONE roll -- Feature 4's rule, deliberately not modified here. So it
  // enhances whichever roll happens first, and the second attack is an ordinary one. Two attacks
  // are two rolls, and RAW buys "+1k1 to a roll" for the point.
  T.setCombatActive(true); T.setVoidPending({k1:true}); T.recalcAll();
  await attack(kC,'both');
  ok('F7-C','C22e','Both: a spent Void Point enhances the first roll',/Void: \+1k1/.test(barText()));
  eq('F7-C','C22f','...raising its pool',notation(),'7k4');
  await rollOffHand();
  no('F7-C','C22g','...and is already spent by the time the off hand strikes',
     /Void: \+1k1/.test(barText()));
  ok('F7-C','C22h','...leaving the off-hand roll its own penalty',
     /Off-hand attack:\s*-10 to total/.test(barText()));
  closeRoll(); T.clearVoidPending(); T.setCombatActive(false); T.recalcAll();
  // clicking the off-hand row and choosing "both" still leads with the main hand
  await attack(wC,'both');
  ok('F7-C','C25','Choosing Both from the off-hand row still leads with the main hand',
     /Katana/.test(title()));
  await rollOffHand(); closeRoll();
  // gating: a weapon with no off-hand partner
  reset(); setAllTraits(3); addSkill('Kenjutsu',3,'Katana'); const lone=addWeapon('Katana');
  await attack(lone);
  no('F7-C','C26','A lone weapon never prompts',handOpen());
  eq('F7-C','C27','...and rolls the plain pool',notation(),'6k3');
  closeRoll();
  // ammo still works for a bow in one of the hands
  reset(); setAllTraits(3); addSkill('Kyujutsu',3); addSkill('Knives',3,'Tanto');
  const yumi=addWeapon('Yumi'); const tan2=addWeapon('Tanto'); T.setRowHand(tan2,'off');
  T.addArrowToEquipment('Willow Leaf',5);
  await attack(yumi,'main',null);
  eq('F7-C','C28','A bow in the main hand still asks for ammunition',T.getArrowQuantity('Willow Leaf'),5);
  closeRoll();
  await attack(yumi,'main','Willow Leaf');
  eq('F7-C','C29','...and spends it when one is chosen',T.getArrowQuantity('Willow Leaf'),4);
  ok('F7-C','C30','...alongside the main-hand penalty',/Main hand:\s*-5 to total/.test(barText()));
  closeRoll();
  eB().innerHTML=''; T.clearLastArrowUsed(); T.recalcAll();

  // =====================================================================
  // F7-D — damage pipeline is untouched
  // =====================================================================
  reset(); setAllTraits(3); addSkill('Kenjutsu',3,'Katana');
  const kD=addWeapon('Katana'); const wD=addWeapon('Wakizashi');
  const dmgBefore=kD.querySelector('.wp-dmg').value;
  const wDmgBefore=wD.querySelector('.wp-dmg').value;
  T.setRowHand(wD,'off');
  eq('F7-D','D1','Declaring an off hand does not change the main-hand damage preview',
     kD.querySelector('.wp-dmg').value,dmgBefore);
  eq('F7-D','D2','...nor the off-hand weapon damage preview',
     wD.querySelector('.wp-dmg').value,wDmgBefore);
  eq('F7-D','D3','Damage arithmetic is unchanged for the off-hand weapon',
     T.getWeaponDamageDice(T.findWeapon('Wakizashi'),3).notation,wDmgBefore);
  T.rollWeaponDamage(wD);
  eq('F7-D','D4','An off-hand damage roll uses the plain pool',notation(),wDmgBefore);
  no('F7-D','D5','...with no handedness entry in any bar',/hand/i.test(barText()));
  eq('F7-D','D6','...and no penalty on the total',totalNow(),keptSum());
  closeRoll();
  T.rollWeaponDamage(kD);
  eq('F7-D','D7','A main-hand damage roll is equally untouched',totalNow(),keptSum());
  closeRoll();
  // row notes
  ok('F7-D','D8','The off-hand row says so in its note',/Off hand/.test(noteOf(wD)));
  ok('F7-D','D9','...and names the penalty',/-10 to attack totals/.test(noteOf(wD)));
  ok('F7-D','D10','The main-hand row names its own',/Main hand/.test(noteOf(kD)));
  ok('F7-D','D11','...and both report the Armor TN the pair buys',
     /Armor TN \+/.test(noteOf(kD)) && /Armor TN \+/.test(noteOf(wD)));
  T.setRowHand(wD,'main');
  no('F7-D','D12','Standing down removes the handedness note entirely',/hand/i.test(noteOf(kD)));
  no('F7-D','D13','...from both rows',/hand/i.test(noteOf(wD)));

  // =====================================================================
  // F7-E — save / load
  // =====================================================================
  reset(); setAllTraits(3); addSkill('Kenjutsu',3,'Katana');
  const kE=addWeapon('Katana'); const wE=addWeapon('Wakizashi'); T.setRowHand(wE,'off');
  const save=T.collectData();
  eq('F7-E','E1','Handedness is saved per weapon row',save.weapons.map(w=>w.hand),['main','off']);
  eq('F7-E','E2','The save still has exactly 42 fields',Object.keys(save.fields).length,42);
  eq('F7-E','E3','No handedness keys leaked into the f_ fields',
     Object.keys(save.fields).filter(k=>/hand|dualwield|offhand/i.test(k)),[]);
  eq('F7-E','E4','No new top-level save keys',
     Object.keys(save).sort().join(','),
     ['adv','disadv','equip','fields','rings','skills','spellBonusUsed','spellBonusUsedVisual',
      'spellUsed','tech','traits','traitsFree','voidCurrent','voidFree','weapons'].sort().join(','));
  const sig=JSON.stringify(save);
  T.applyData(JSON.parse(sig));
  eq('F7-E','E5','Handedness is restored',
     Array.from(wB().querySelectorAll('tr')).map(T.getRowHand),['main','off']);
  ok('F7-E','E6','...and dual-wielding is active again after a load',T.isDualWieldActive());
  ok('F7-E','E7','...with the selector visible',
     handRowVisible(wB().querySelectorAll('tr')[0]));
  eq('F7-E','E8','...and the Armor TN bonus back',T.getDualWieldArmorTNBonus(),insight());
  eq('F7-E','E9','save -> load -> save is stable',JSON.stringify(T.collectData()),sig);
  // Technique-derived overrides round-trip because the Technique itself is saved
  addTech('Way of the Dragon','You suffer no penalties of any kind for dual wielding.');
  const save2=T.collectData();
  eq('F7-E','E10','A Technique override needs no save field of its own',
     Object.keys(save2.weapons[0]).filter(k=>/override|exempt|waiv/i.test(k)),[]);
  T.applyData(JSON.parse(JSON.stringify(save2)));
  ok('F7-E','E11','...it comes back because the Technique came back',
     T.getDualWieldTechniqueExemption().exempt);
  eq('F7-E','E12','...and still waives both penalties',
     [T.getMainHandPenalty().penalty,
      T.getOffHandPenalty(T.findWeapon('Wakizashi'),'Kenjutsu',3,'Medium').penalty],[0,0]);
  // pre-Feature-7 saves
  reset(); setAllTraits(3); addSkill('Kenjutsu',3,'Katana');
  const legacy=wB().appendChild(T.makeWeaponRow({key:'Katana',name:'Katana',skill:'Kenjutsu',
    size:'Medium',keywords:'',notes:'',roll:'',dmg:'',manualAttack:false,manualDamage:false}));
  eq('F7-E','E13','A pre-Feature-7 weapon row loads as main-hand',T.getRowHand(legacy),'main');
  eq('F7-E','E14','...and saves an explicit main',T.collectData().weapons[0].hand,'main');
  const legacy2=wB().appendChild(T.makeWeaponRow({key:'Wakizashi',name:'Wakizashi',skill:'Kenjutsu',
    size:'Medium',keywords:'',notes:'',roll:'',dmg:'',manualAttack:false,manualDamage:false}));
  T.refreshAllWeaponRows();
  no('F7-E','E15','Two pre-Feature-7 rows are still not dual-wielding',T.isDualWieldActive());
  eq('F7-E','E16','...so an old character rolls exactly the dice it always did',
     legacy.querySelector('.wp-roll').value,'6k3');
  eq('F7-E','E17','A garbage hand value in a save is normalised, not trusted',
     T.getRowHand(wB().appendChild(T.makeWeaponRow({key:'Katana',name:'Katana',hand:'sinister'}))),'main');

  // =====================================================================
  // F7-F — zero-change guarantee, then the regression suites
  // =====================================================================
  reset(); setAllTraits(3); addSkill('Kenjutsu',7,'Katana');
  const kF=addWeapon('Katana');
  await attack(kF);
  eq('F7-F','F1','One weapon: the pool is the untouched 10k3',notation(),'10k3');
  no('F7-F','F2','...no modifier bar',modBar());
  // 10k3 sits exactly on the Ten Dice Rule cap, so nothing converts and there is no bonus:
  // the displayed total must be precisely the sum of the kept dice.
  eq('F7-F','F3','...and the total is exactly the kept sum',totalNow(),keptSum());
  closeRoll();
  const tnSolo=TN();
  const kF2=addWeapon('Wakizashi');
  eq('F7-F','F4','A second MAIN-hand weapon changes no TN',TN(),tnSolo);
  await attack(kF2);
  no('F7-F','F5','...and still never prompts',handOpen());
  no('F7-F','F6','...and still shows no modifier bar',modBar());
  closeRoll();
  eq('F7-F','F7','A bare attack context yields no off-hand modifier',
     T.getPreRollModifiers(T.makeRollContext('attack')).length,0);
  eq('F7-F','F8','No test contributors left registered',
     T.PREROLL_MODIFIER_REGISTRY.filter(m=>/^t_/.test(m.id)).map(m=>m.id),[]);
  eq('F7-F','F9','The registry is sorted by priority',
     T.PREROLL_MODIFIER_REGISTRY.map(m=>m.priority),
     T.PREROLL_MODIFIER_REGISTRY.map(m=>m.priority).slice().sort((a,b)=>a-b));
  eq('F7-F','F10','Off-hand sits between stance and wounds',
     T.PREROLL_MODIFIER_REGISTRY.map(m=>m.id+'@'+m.priority),
     ['range@20','arrow@25','stance@30','offhand@35','wounds@40','void@50']);
  reset();

  // Nothing below may see an off-hand row or a dual-wield Technique: Features 1-6 roll weapon
  // attacks and know nothing about the handedness prompt, so a leak would hang them.
  clearDual();
  eq('F7-F','F11','No off-hand state before the regression suites',
     [T.isDualWieldActive(),T.getDualWieldTechniqueExemption().exempt],[false,false]);

  const suites={};
  async function runSuite(name,urls){
    for(const url of urls){
      try{
        const res=await fetch(url+(url.indexOf('?')>=0?'&':'?')+'cb='+Date.now());
        if(!res.ok) continue;
        const o0=(0,eval)(await res.text());
        const o=(o0&&typeof o0.then==='function')?await o0:o0;
        suites[name]={total:o.total,passed:o.passed,failed:o.failed,
                      fails:o.results.filter(r=>!r.pass).map(r=>r.id+' '+r.name)};
        rec('REG',name,name+' suite passes unchanged',o.failed===0,
            o.failed?('failed '+o.failed+': '+suites[name].fails.join('; ')):'');
        clearDual();
        return;
      }catch(e){ suites[name]={error:String(e)};
        rec('REG',name,name+' suite passes unchanged',false,'could not run: '+e); return; }
    }
    suites[name]={error:'not found'};
    rec('REG',name,name+' suite passes unchanged',false,'could not fetch any of: '+urls.join(', '));
  }
  await runSuite('Feature6',['/l5r-P1-P2-F6-test-harness.js','/f6-harness.js']);
  await runSuite('Feature4',['/l5r-P1-P2-F4-test-harness.js','/f4-harness.js']);
  await runSuite('Feature3',['/l5r-P1-P2-F3-test-harness.js','/f3-harness.js']);
  await runSuite('Feature2',['/l5r-P1-P2-F2-test-harness.js','/f2-harness.js']);
  await runSuite('Feature1',['/l5r-P1-P2-F1-test-harness.js','/f1-harness.js']);
  await runSuite('P1P2',['/l5r-P1-P2-test-harness.js','/p12-harness.js']);
  await runSuite('Feature0',['/l5r-feature0-test-harness.js','/f0-harness.js']);
  await runSuite('PartB',['/l5r-partB-test-harness.js','/partB-harness.js']);
  await runSuite('SchoolFix',['/l5r-schoolfree-bugfix-harness.js','/schoolfree-harness.js']);

  const fails=results.filter(r=>!r.pass);
  const by={};results.forEach(r=>{by[r.section]=by[r.section]||{pass:0,fail:0};by[r.section][r.pass?'pass':'fail']++;});
  console.log('%c PART C — FEATURE 7: DUAL-WIELDING ','background:#7b1113;color:#fff;font-weight:bold;padding:3px 6px;');
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
