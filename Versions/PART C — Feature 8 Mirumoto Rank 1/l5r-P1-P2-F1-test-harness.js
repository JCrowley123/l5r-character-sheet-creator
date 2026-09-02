/* =============================================================================
 * L5R 4e — COMBINED HARNESS: Feature 1 + P1/P2 + Feature 0 + Part B
 * =============================================================================
 * Run in the browser console on the Feature 1 build:
 *     fetch('/l5r-P1-P2-F1-test-harness.js').then(r=>r.text()).then(s=>(0,eval)(s))
 * Returns a Promise resolving to {total,passed,failed,results,suites}.
 * DESTRUCTIVE: clears the Skills and Weapons tables.
 * ============================================================================= */
(async function runCombinedHarness(){
  'use strict';
  const T = window.__L5R_TEST__;
  if(!T){ console.error('__L5R_TEST__ seam not found.'); return {total:1,passed:0,failed:1,results:[]}; }

  const results=[];
  const rec=(s,id,n,p,d)=>results.push({section:s,id,name:n,pass:!!p,detail:d||''});
  const eq=(s,id,n,a,e)=>{const x=JSON.stringify(a),y=JSON.stringify(e);rec(s,id,n,x===y,x===y?'':'got '+x+' want '+y);};
  const ok=(s,id,n,v)=>rec(s,id,n,!!v,v?'':'expected truthy');
  const no=(s,id,n,v)=>rec(s,id,n,!v,v?'expected falsy, got '+JSON.stringify(v):'');
  const tick=()=>new Promise(r=>setTimeout(r,0));

  const sBody=()=>document.getElementById('skillsBody');
  const wBody=()=>document.getElementById('weaponsBody');
  const clearRows=()=>{sBody().innerHTML='';wBody().innerHTML='';};
  const setAllTraits=v=>['agility','reflexes','strength','stamina','perception','awareness','intelligence','willpower']
    .forEach(k=>document.getElementById('trait_'+k).value=v);
  const addSkill=(n,r,e)=>sBody().appendChild(T.makeSkillRow({name:n,trait:(T.findSkill(n)||{}).trait||'',rank:r,emph:e||''}));
  const addWeapon=n=>{const L=T.findWeapon(n);
    return wBody().appendChild(T.makeWeaponRow({key:L.name,name:L.name,skill:L.skill,size:L.size,
      keywords:(L.keywords||[]).join(', '),notes:L.notes||'',roll:'',dmg:'',manualAttack:false,manualDamage:false}));};
  const rollModalOpen=()=>document.getElementById('rollModalOverlay').style.display==='flex';
  const rangeModalOpen=()=>document.getElementById('rangePickModalOverlay').style.display==='flex';
  // Closing the modal only hides it; showRollResult() rebuilds the body on the NEXT roll, so a
  // previous roll's modifier bar lingers in the hidden body. Tests that assert 'no bar was
  // created' must clear it first, or they read the last roll's bar instead of this one's.
  const closeRoll=()=>{document.getElementById('rollModalOverlay').style.display='none';
    document.getElementById('rollModalBody').innerHTML='';};
  const modBar=()=>document.getElementById('rollModifierBar');
  const notation=()=>document.getElementById('rollModalNotation').textContent;
  const dice=()=>Array.from(document.querySelectorAll('#rollDiceRow .roll-die'));
  const totalNow=()=>parseInt(document.getElementById('rollTotalDisplay').textContent,10);
  const tenDiceNoteHidden=()=>Array.from(document.querySelectorAll('#rollModalBody .roll-note'))
    .filter(el=>/^Ten Dice Rule bonus:/.test((el.textContent||'').trim()))
    .every(el=>el.style.display==='none');
  const tenDiceNoteExists=()=>Array.from(document.querySelectorAll('#rollModalBody .roll-note'))
    .some(el=>/^Ten Dice Rule bonus:/.test((el.textContent||'').trim()));

  // Drive the range prompt: choose an option, optionally enter a distance, then await the roll.
  async function attackWithRange(row, choice, distance){
    const p = T.rollWeaponAttack(row);          // modal renders synchronously
    if(choice==='melee')  document.getElementById('rangeOptMelee').click();
    if(choice==='within') document.getElementById('rangeOptWithin').click();
    if(choice==='cancel') document.getElementById('rangePickClose').click();
    if(choice==='beyond'){
      document.getElementById('rangeOptBeyond').click();
      const inp=document.getElementById('rangeDistInput');
      inp.value=String(distance);
      inp.dispatchEvent(new Event('input'));
      document.getElementById('rangeDistConfirm').click();
    }
    await p;
    return p;
  }
  // Same, but expects an appAlert popup to appear and dismisses it.
  async function attackExpectingPopup(row, distance){
    document.getElementById('rollModalBody').innerHTML='';   // so 'no bar created' is meaningful
    const p = T.rollWeaponAttack(row);
    document.getElementById('rangeOptBeyond').click();
    const inp=document.getElementById('rangeDistInput');
    inp.value=String(distance);
    inp.dispatchEvent(new Event('input'));
    document.getElementById('rangeDistConfirm').click();
    await tick();
    const overlay=document.getElementById('appConfirmOverlay');
    const shown = overlay.style.display==='flex';
    const msg = document.getElementById('appConfirmMsg').textContent;
    if(shown) document.getElementById('appConfirmOk').click();
    await p;
    return {shown, msg};
  }

  clearRows(); setAllTraits(3); T.resetCombatRound(); closeRoll();

  // =====================================================================
  // F1-A — pure calculation
  // =====================================================================
  eq('F1-A','A1','Yumi is ranged',T.isRangedWeapon(T.findWeapon('Yumi')),true);
  eq('F1-A','A2','Pistol is ranged',T.isRangedWeapon(T.findWeapon('Pistol')),true);
  eq('F1-A','A3','Shuriken is ranged',T.isRangedWeapon(T.findWeapon('Shuriken')),true);
  eq('F1-A','A4','Katana is NOT ranged',T.isRangedWeapon(T.findWeapon('Katana')),false);
  eq('F1-A','A5','Tetsubo is NOT ranged',T.isRangedWeapon(T.findWeapon('Tetsubo')),false);
  eq('F1-A','A6','Throwable melee (Wakizashi) stays melee',T.isRangedWeapon(T.findWeapon('Wakizashi')),false);
  eq('F1-A','A7','Listed range read from the library',T.weaponListedRange(T.findWeapon('Yumi')),250);
  eq('F1-A','A8','Weapon with no listed range yields null',T.weaponListedRange(T.findWeapon('Blowgun')),null);
  // spec worked example: R=200, D=300 -> N=2
  eq('F1-A','A9','Spec example: 200ft weapon at 300ft -> 2 dice',
     (()=>{const c=T.calculateRangePenalty(200,300);return [c.extraFeet,c.penaltyDice,c.beyondMax];})(),[100,2,false]);
  eq('F1-A','A10','Exactly at listed range -> no penalty',
     (()=>{const c=T.calculateRangePenalty(250,250);return [c.extraFeet,c.penaltyDice];})(),[0,0]);
  eq('F1-A','A11','Inside listed range -> no penalty',
     (()=>{const c=T.calculateRangePenalty(250,100);return [c.extraFeet,c.penaltyDice];})(),[0,0]);
  eq('F1-A','A12','One foot beyond costs a die (ceil reading)',
     T.calculateRangePenalty(250,251).penaltyDice,1);
  eq('F1-A','A13','Exactly one band beyond costs one die',
     T.calculateRangePenalty(250,300).penaltyDice,1);
  eq('F1-A','A14','Partial band rounds up',T.calculateRangePenalty(250,301).penaltyDice,2);
  eq('F1-A','A15','At exactly 2x range still legal',
     (()=>{const c=T.calculateRangePenalty(250,500);return [c.penaltyDice,c.beyondMax];})(),[5,false]);
  eq('F1-A','A16','Beyond 2x range flagged',T.calculateRangePenalty(250,501).beyondMax,true);
  eq('F1-A','A17','Garbage distance is invalid, not a crash',
     T.calculateRangePenalty(250,'abc').valid,false);

  // validation
  eq('F1-A','A18','Beyond-max is illegal with the bow wording',
     (()=>{const v=T.validateRangeAttack(6,3,{mode:'beyond',beyondMax:true,penaltyDice:1,weaponSkill:'Kyujutsu'});
           return [v.legal,/A bow cannot fire beyond twice its listed range/.test(v.message)];})(),[false,true]);
  eq('F1-A','A19','Pool reduced below 1 is illegal, with the 0kX wording',
     (()=>{const v=T.validateRangeAttack(3,2,{mode:'beyond',beyondMax:false,penaltyDice:3,weaponSkill:'Kyujutsu'});
           return [v.legal,/reduce the attack to 0k2, which is not a legal roll/.test(v.message)];})(),[false,true]);
  eq('F1-A','A20','Exactly 1 rolled die remains legal',
     T.validateRangeAttack(3,2,{mode:'beyond',beyondMax:false,penaltyDice:2}).legal,true);
  eq('F1-A','A21','Melee and within are always legal',
     [T.validateRangeAttack(1,1,{mode:'melee'}).legal,T.validateRangeAttack(1,1,{mode:'within'}).legal],[true,true]);

  // contributor purity / negative scope
  eq('F1-A','A22','Contributor ignores non-attack kinds',
     T.getRangeModifiers({kind:'damage',range:{mode:'melee'}}),null);
  eq('F1-A','A23','Contributor ignores an attack with no range decision',
     T.getRangeModifiers({kind:'attack'}),null);
  eq('F1-A','A24','"within" contributes nothing',
     T.getRangeModifiers({kind:'attack',range:{mode:'within'}}),null);
  eq('F1-A','A25','"melee" contributes -10 to total only',
     (()=>{const m=T.getRangeModifiers({kind:'attack',range:{mode:'melee'}});
           return [m.totalDelta,m.rolledDelta||0,m.keptDelta||0];})(),[-10,0,0]);
  eq('F1-A','A26','"beyond" contributes -Nk0 only',
     (()=>{const m=T.getRangeModifiers({kind:'attack',range:{mode:'beyond',penaltyDice:2,extraFeet:100,listedRange:200}});
           return [m.rolledDelta,m.keptDelta||0,m.totalDelta||0];})(),[-2,0,0]);

  // =====================================================================
  // F1-B — prompt behaviour
  // =====================================================================
  clearRows(); setAllTraits(3); addSkill('Kenjutsu',7,'Katana'); addSkill('Kyujutsu',3);
  const katana = addWeapon('Katana');
  const yumi   = addWeapon('Yumi');       // listed range 250 ft
  T.recalcAll();

  // melee weapon: no prompt at all, modal opens in the same tick
  T.rollWeaponAttack(katana);
  no('F1-B','B1','Melee weapon never shows the range prompt',rangeModalOpen());
  ok('F1-B','B2','Melee attack opens the roll modal synchronously',rollModalOpen());
  no('F1-B','B3','Melee attack has no modifier bar',modBar());
  closeRoll();

  // ranged weapon: prompt appears
  const pending = T.rollWeaponAttack(yumi);
  ok('F1-B','B4','Ranged weapon shows the range prompt',rangeModalOpen());
  no('F1-B','B5','Roll modal not open while the prompt is up',rollModalOpen());
  ok('F1-B','B6','Prompt names the weapon and its listed range',
     /Yumi/.test(document.getElementById('rangePickSubtitle').textContent) &&
     /250/.test(document.getElementById('rangePickSubtitle').textContent));
  ok('F1-B','B7','All three options offered',
     !!document.getElementById('rangeOptMelee') && !!document.getElementById('rangeOptWithin') &&
     !!document.getElementById('rangeOptBeyond'));
  document.getElementById('rangePickClose').click();
  await pending;
  no('F1-B','B8','Cancelling the prompt opens no roll modal',rollModalOpen());
  no('F1-B','B9','Cancelling leaves the prompt closed',rangeModalOpen());

  // =====================================================================
  // F1-C — within listed range
  // =====================================================================
  await attackWithRange(yumi,'within');
  ok('F1-C','C1','Within range opens the roll modal',rollModalOpen());
  no('F1-C','C2','No modifier bar within range',modBar());
  eq('F1-C','C3','Pool is the unmodified 6k3',notation(),'6k3');
  eq('F1-C','C4','Six dice rolled',dice().length,6);
  closeRoll();

  // =====================================================================
  // F1-D — in melee with me
  // =====================================================================
  await attackWithRange(yumi,'melee');
  ok('F1-D','D1','Melee-range option opens the roll modal',rollModalOpen());
  ok('F1-D','D2','Modifier bar shown',!!modBar());
  ok('F1-D','D3','Bar reports -10 to total',/-10 to total/.test(modBar().textContent));
  ok('F1-D','D4','Bar names the firing-into-melee source',/Firing into melee/.test(modBar().textContent));
  eq('F1-D','D5','Dice pool itself is unchanged (6k3)',notation(),'6k3');
  eq('F1-D','D6','Displayed total already includes -10',
     totalNow(),dice().filter(d=>d.classList.contains('kept'))
       .reduce((s,d)=>s+parseInt(d.dataset.total,10),0)-10);
  ok('F1-D','D7','Misleading Ten Dice note hidden',tenDiceNoteHidden());
  ok('F1-D','D8','Net line correct',/Net -10/.test(modBar().textContent));
  // survives a die click
  const unkept = dice().find(d=>!d.classList.contains('kept'));
  if(unkept){
    unkept.click();
    eq('F1-D','D9','-10 survives a die click',
       totalNow(),dice().filter(d=>d.classList.contains('kept'))
         .reduce((s,d)=>s+parseInt(d.dataset.total,10),0)-10);
  } else rec('F1-D','D9','-10 survives a die click',true,'no unkept die');
  closeRoll();

  // =====================================================================
  // F1-E — beyond listed range (valid)
  // =====================================================================
  // Kyujutsu 3 + Reflexes 3 = 6k3. Yumi listed 250 ft. At 350 ft: 100 extra -> -2k0 -> 4k3.
  await attackWithRange(yumi,'beyond',350);
  ok('F1-E','E1','Beyond-range attack opens the roll modal',rollModalOpen());
  eq('F1-E','E2','Pool reduced to 4k3',notation(),'4k3');
  eq('F1-E','E3','Four dice actually rolled',dice().length,4);
  ok('F1-E','E4','Modifier bar shown',!!modBar());
  ok('F1-E','E5','Bar reports the -2k0 penalty',/-2k0/.test(modBar().textContent));
  ok('F1-E','E6','Bar names the distance beyond listed range',/100 ft beyond the listed 250 ft/.test(modBar().textContent));
  ok('F1-E','E7','Kept dice unchanged at 3',/k3/.test(notation()));
  closeRoll();
  // one foot over costs exactly one die
  await attackWithRange(yumi,'beyond',251);
  eq('F1-E','E8','251 ft -> 5k3 (one die lost)',notation(),'5k3');
  closeRoll();
  // Ten Dice Rule must see the MODIFIED pool
  clearRows(); setAllTraits(3); addSkill('Kyujutsu',9); const yumi2=addWeapon('Yumi'); T.recalcAll();
  // Kyujutsu 9 + Reflexes 3 = 12k3 raw; -1k0 at 300ft -> 11k3 -> Ten Dice Rule
  const expect11k3=(()=>{const a=T.applyTenDiceRule(11,3);return a.rolled+'k'+a.kept;})();
  await attackWithRange(yumi2,'beyond',300);
  ok('F1-E','E9','Ten Dice Rule applied to the MODIFIED pool (11k3, not 12k3)',
     new RegExp('11k3').test(notation()));
  eq('F1-E','E10','Rolled dice match the Ten Dice conversion of 11k3',
     dice().length,parseInt(expect11k3.split('k')[0],10));
  closeRoll();

  // =====================================================================
  // F1-F — illegal shots
  // =====================================================================
  clearRows(); setAllTraits(3); addSkill('Kyujutsu',3); const yumi3=addWeapon('Yumi'); T.recalcAll();
  const beyondMax = await attackExpectingPopup(yumi3, 600);   // > 2 x 250
  ok('F1-F','F1','Beyond 2x range shows a popup',beyondMax.shown);
  ok('F1-F','F2','Popup uses the RAW bow wording',
     /beyond all possibility of being hit/.test(beyondMax.msg) &&
     /A bow cannot fire beyond twice its listed range/.test(beyondMax.msg));
  no('F1-F','F3','Roll modal never opened',rollModalOpen());
  no('F1-F','F4','No modifier bar created',modBar());
  no('F1-F','F5','Range prompt closed',rangeModalOpen());

  // pool reduced below 1: Kyujutsu 0 + Reflexes 3 = 3k3 unskilled; need N >= 3 -> 400 ft (150 over -> 3 dice)
  clearRows(); setAllTraits(3); const yumi4=addWeapon('Yumi'); T.recalcAll();
  const illegal = await attackExpectingPopup(yumi4, 400);
  ok('F1-F','F6','Pool below 1 shows a popup',illegal.shown);
  ok('F1-F','F7','Popup states the illegal 0kX pool',
     /reduce the attack to 0k3, which is not a legal roll/.test(illegal.msg));
  no('F1-F','F8','Roll modal never opened',rollModalOpen());
  no('F1-F','F9','No modifier bar created',modBar());

  // =====================================================================
  // F1-G — negative scope & cleanliness
  // =====================================================================
  clearRows(); setAllTraits(3); addSkill('Kyujutsu',3); const yumi5=addWeapon('Yumi'); T.recalcAll();
  const registryBefore = T.PREROLL_MODIFIER_REGISTRY.length;
  await attackWithRange(yumi5,'cancel');
  eq('F1-G','G1','Registry unchanged after a cancelled roll',
     T.PREROLL_MODIFIER_REGISTRY.length,registryBefore);
  await attackExpectingPopup(yumi5, 9999);
  eq('F1-G','G2','Registry unchanged after an illegal roll',
     T.PREROLL_MODIFIER_REGISTRY.length,registryBefore);
  eq('F1-G','G3','No leftover range state between rolls',
     T.getRangeModifiers({kind:'attack'}),null);
  // damage rolls never take range modifiers
  yumi5.querySelector('.wp-dmg-btn').click();
  no('F1-G','G4','Damage roll shows no range modifier bar',modBar());
  no('F1-G','G5','Damage roll shows no range prompt',rangeModalOpen());
  closeRoll();
  // manual dice tray
  T.rollNotation('Manual','5k2');
  no('F1-G','G6','Manual roll shows no modifier bar',modBar());
  closeRoll();
  // skill rolls unaffected
  T.rollSkill('Kyujutsu','Reflexes',3);
  no('F1-G','G7','Plain skill roll shows no range modifier',modBar());
  closeRoll();
  // save/load untouched
  T.recalcAll();
  const save=T.collectData();
  eq('F1-G','G8','Save still has exactly 42 fields',Object.keys(save.fields).length,42);
  eq('F1-G','G9','No range keys in the save',
     Object.keys(save.fields).filter(k=>/range/i.test(k)),[]);
  const sig=JSON.stringify(save); T.applyData(JSON.parse(sig));
  eq('F1-G','G10','save -> load -> save stable',JSON.stringify(T.collectData()),sig);

  clearRows(); T.resetCombatRound(); closeRoll();

  // =====================================================================
  // Regression: re-run the three earlier suites unchanged
  // =====================================================================
  const suites={};
  async function runSuite(name, url){
    try{
      // cache-bust: sub-suites are edited between runs and a stale copy silently reports
      // failures that were already fixed.
      const res = await fetch(url + (url.indexOf('?')>=0?'&':'?') + 'cb=' + Date.now());
      if(!res.ok) throw new Error('HTTP '+res.status);
      const out = (0,eval)(await res.text());
      const o = (out && typeof out.then==='function') ? await out : out;
      suites[name] = {total:o.total, passed:o.passed, failed:o.failed,
                      fails:o.results.filter(r=>!r.pass).map(r=>r.id+' '+r.name)};
      rec('REG', name, name+' suite passes unchanged', o.failed===0,
          o.failed?('failed '+o.failed+': '+suites[name].fails.join('; ')):'');
    }catch(e){
      suites[name] = {error:String(e)};
      rec('REG', name, name+' suite passes unchanged', false, 'could not run: '+e);
    }
  }
  await runSuite('P1P2','/p12-harness.js');
  await runSuite('Feature0','/f0-harness.js');
  await runSuite('PartB','/partB-harness.js');

  // =====================================================================
  // Report
  // =====================================================================
  const fails=results.filter(r=>!r.pass);
  const by={};results.forEach(r=>{by[r.section]=by[r.section]||{pass:0,fail:0};by[r.section][r.pass?'pass':'fail']++;});
  console.log('%c PART C — FEATURE 1: RANGE & RANGE PENALTIES ',
    'background:#7b1113;color:#fff;font-weight:bold;padding:3px 6px;');
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
