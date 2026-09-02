/* =============================================================================
 * L5R 4e Character Sheet — PART C FEATURE 0 (Emphasis Re-roll) TEST HARNESS
 * =============================================================================
 * Runs identically in Version A (EMPHASIS_REQUIRE_SELECTION=false) and
 * Version B (true), branching only where the two are specified to differ.
 * Returns {version,total,passed,failed,results,saveSignature,determinism}.
 * DESTRUCTIVE: clears the Skills and Weapons tables.
 * ============================================================================= */
(function runFeature0Harness(){
  'use strict';
  const T = window.__L5R_TEST__;
  if(!T){ console.error('__L5R_TEST__ seam not found.'); return {failed:1,total:1,passed:0,results:[]}; }

  const MODE_B = !!T.EMPHASIS_REQUIRE_SELECTION;
  const VERSION = MODE_B ? 'B' : 'A';
  const results = [];
  const rec = (s,id,n,pass,detail)=>results.push({section:s,id,name:n,pass:!!pass,detail:detail||''});
  const eq = (s,id,n,a,e)=>{const x=JSON.stringify(a),y=JSON.stringify(e);rec(s,id,n,x===y,x===y?'':'got '+x+' want '+y);};
  const ok = (s,id,n,v)=>rec(s,id,n,!!v,v?'':'expected truthy');
  const no = (s,id,n,v)=>rec(s,id,n,!v,v?'expected falsy, got '+JSON.stringify(v):'');

  // ---- fixtures -------------------------------------------------------------
  const TRAITS=['agility','reflexes','strength','stamina','perception','awareness','intelligence','willpower'];
  const sBody=()=>document.getElementById('skillsBody');
  const wBody=()=>document.getElementById('weaponsBody');
  const setTrait=(k,v)=>{document.getElementById('trait_'+k).value=v;};
  const setAllTraits=v=>TRAITS.forEach(k=>setTrait(k,v));
  const clearRows=()=>{sBody().innerHTML='';wBody().innerHTML='';};
  const addSkill=(name,rank,emph)=>sBody().appendChild(
    T.makeSkillRow({name,trait:(T.findSkill(name)||{}).trait||'',rank,emph:emph||''}));
  const addWeapon=n=>{const L=T.findWeapon(n);
    return wBody().appendChild(T.makeWeaponRow({key:L.name,name:L.name,skill:L.skill,size:L.size,
      keywords:(L.keywords||[]).join(', '),notes:L.notes||'',roll:'',dmg:'',manualAttack:false,manualDamage:false}));};
  const bar=()=>document.getElementById('emphasisRerollBar');
  const api=()=>{const b=bar();return b?b.__emphasisApi:null;};
  const closeModal=()=>{const o=document.getElementById('rollModalOverlay');if(o)o.style.display='none';};
  // Deterministic rng: consumes the given sequence, then repeats its last value.
  const seq=arr=>{let i=0;return()=>arr[Math.min(i++,arr.length-1)];};
  // Overwrite the rendered dice with a known pattern (DOM-as-model: the dice ARE the model).
  const forceDice=vals=>{
    const row=document.getElementById('rollDiceRow');
    row.innerHTML=vals.map(v=>'<div class="roll-die" data-total="'+v+'">'+v+'</div>').join('');
    return Array.from(row.querySelectorAll('.roll-die'));
  };
  const dieTotals=()=>Array.from(document.querySelectorAll('#rollDiceRow .roll-die'))
    .map(el=>parseInt(el.dataset.total,10));
  const withRandom=(fn,vals)=>{const o=Math.random;Math.random=seq(vals);try{return fn();}finally{Math.random=o;}};

  clearRows(); setAllTraits(3);

  // =========================================================================
  // A — match strategy & library audit
  // =========================================================================
  const audit=T.emphasisLibraryAudit();
  eq('A','A0','Library audit is 40 exact / 2 base / 4 unmatched / 2 no-list',
     [audit.exact,audit.baseName,audit.unmatched,audit.noEmphasisList],[40,2,4,2]);
  clearRows(); addSkill('Kenjutsu',7,'Katana');
  eq('A','A1','getOwnedEmphases returns the owned Emphasis',T.getOwnedEmphases('Kenjutsu'),['Katana']);
  eq('A','A2','Katana + Kenjutsu matches',T.findMatchingEmphasis(T.findWeapon('Katana'),'Kenjutsu'),'Katana');
  eq('A','A3','Scimitar does not match a Katana-only character',
     T.findMatchingEmphasis(T.findWeapon('Scimitar'),'Kenjutsu'),null);
  clearRows(); addSkill('Staves',5,'Sang Kauw');
  eq('A','A4','Sang Kauw (Shield) base-matches the Sang Kauw Emphasis',
     T.findMatchingEmphasis(T.findWeapon('Sang Kauw (Shield)'),'Staves'),'Sang Kauw');
  eq('A','A5','Nunchaku has no Staves Emphasis (RAW-correct null)',
     T.findMatchingEmphasis(T.findWeapon('Nunchaku'),'Staves'),null);
  clearRows(); addSkill('Jiujutsu',5,'Grappling');
  eq('A','A5b','Unarmed is not a Jiujutsu Emphasis',
     T.findMatchingEmphasis(T.findWeapon('Unarmed'),'Jiujutsu'),null);
  clearRows(); addSkill('Cannon',5);
  eq('A','A6','Skill with no Emphasis list yields null, no crash',
     T.findMatchingEmphasis(T.findWeapon('Cannon'),'Cannon'),null);
  clearRows(); addSkill('Kenjutsu',7,'Katana');
  eq('A','A7','Matching is case/whitespace insensitive',
     T.findMatchingEmphasis({name:'  kAtAnA ',skill:'Kenjutsu'},'Kenjutsu'),'Katana');
  eq('A','A8','Owned-but-irrelevant Emphasis does not qualify another weapon',
     T.findMatchingEmphasis(T.findWeapon('No-dachi'),'Kenjutsu'),null);
  eq('A','A9','normaliseEmphasisName collapses whitespace/case',
     T.normaliseEmphasisName('  Mai   CHONG '),'mai chong');
  eq('A','A10','baseName strips a parenthetical suffix',
     T.EMPHASIS_MATCH_STRATEGY.baseName('Sang Kauw (Crescent Blade)'),'sang kauw');

  // =========================================================================
  // B — pure re-roll engine
  // =========================================================================
  const D=(t)=>({total:t,chain:[t]});
  const pool=[D(1),D(1),D(4),D(6),D(8)];
  const frozen=JSON.stringify(pool);
  // RAW worked example: re-roll both 1s, getting 1 and 7.
  const rr=T.rerollEmphasisDice(pool,[0,1],null,seq([0.0,0.6]));
  eq('B','B1','Both selected 1s were replaced',[rr[0].total,rr[1].total],[1,7]);
  eq('B','B2','Non-selected dice untouched',[rr[2].total,rr[3].total,rr[4].total],[4,6,8]);
  ok('B','B2b','Non-selected dice preserved by identity',rr[2]===pool[2]&&rr[4]===pool[4]);
  eq('B','B3','A re-roll landing on 1 STANDS (not re-rolled again)',rr[0].total,1);
  eq('B','B3b','Re-rolled dice tagged rerolledFrom:1',[rr[0].rerolledFrom,rr[1].rerolledFrom],[1,1]);
  eq('B','B4','RAW example total: keep 8 and 7 = 15',
     rr.map(d=>d.total).sort((a,b)=>b-a).slice(0,2).reduce((a,b)=>a+b,0),15);
  const ex=T.rerollEmphasisDice([D(1)],[0],null,seq([0.95,0.3]));
  eq('B','B5','A re-rolled 10 explodes and chains',[ex[0].total,ex[0].chain],[14,[10,4]]);
  eq('B','B6','Input array not mutated (purity)',JSON.stringify(pool),frozen);
  eq('B','B7','Selecting zero dice is a no-op',
     T.rerollEmphasisDice(pool,[],null,seq([0.0])).map(d=>d.total),[1,1,4,6,8]);
  eq('B','B8','A die not showing 1 is never re-rolled',
     T.rerollEmphasisDice(pool,[2,3],null,seq([0.0])).map(d=>d.total),[1,1,4,6,8]);
  eq('B','B9','Out-of-range / bogus indices ignored',
     T.rerollEmphasisDice(pool,[99,-1,NaN],null,seq([0.0])).map(d=>d.total),[1,1,4,6,8]);
  eq('B','B10','Deterministic under a fixed rng',
     T.rerollEmphasisDice(pool,[0,1],null,seq([0.0,0.6])).map(d=>d.total),
     T.rerollEmphasisDice(pool,[0,1],null,seq([0.0,0.6])).map(d=>d.total));
  // rand .85 -> 9; with explodeOn=9 that die EXPLODES (9 >= 9), then rand .1 -> 2. Total 11.
  eq('B','B11','explodeOn=9 makes a re-rolled 9 explode',
     (()=>{const d=T.rerollEmphasisDice([D(1)],[0],9,seq([0.85,0.1]))[0];return [d.total,d.chain];})(),
     [11,[9,2]]);
  eq('B','B11b','explodeOn=null leaves a 9 alone',
     (()=>{const d=T.rerollEmphasisDice([D(1)],[0],null,seq([0.85,0.1]))[0];return [d.total,d.chain];})(),
     [9,[9]]);

  // =========================================================================
  // C/D/E — decorator, once-per-roll, scope
  // =========================================================================
  clearRows(); setAllTraits(2); addSkill('Kenjutsu',3,'Katana');
  const skRow=sBody().querySelector('tr');
  skRow.querySelector('.sk-roll').click();               // 5k2 per the RAW example
  ok('D','D1','Skill roll attaches the re-roll bar',!!bar());
  if(MODE_B){
    no('G','GB1','Version B: re-roll NOT offered before selection',
       bar()&&bar().querySelector('#emphasisRerollBtn')&&!bar().querySelector('#emphasisRerollBtn').disabled);
    ok('G','GB2','Version B: dropdown lists owned Emphases',
       bar()&&bar().querySelector('#emphasisRerollSelect')&&
       Array.from(bar().querySelectorAll('#emphasisRerollSelect option')).map(o=>o.value).includes('Katana'));
  } else {
    ok('G','GA1','Version A: re-roll offered with no selection step',
       bar()&&!bar().querySelector('#emphasisRerollSelect'));
    ok('G','GA2','Version A: owned Emphases named in the control',
       /Katana/.test(bar().textContent));
  }
  eq('C','C1','Once-per-roll flag starts at 0',T.isEmphasisRerollUsed(),false);

  // Controlled dice: 1,1,4,6,8 exactly as the rulebook example.
  forceDice([1,1,4,6,8]);
  if(MODE_B) api().setChosen('Katana');
  ok('D','D2','Entering re-roll mode succeeds',api().enterMode());
  eq('D','D3','Only the dice showing 1 are eligible',api().eligibleDice().length,2);
  ok('D','D4','Keep-clicking is suspended in re-roll mode',
     document.getElementById('rollDiceRow').classList.contains('emph-reroll-mode'));
  // select both 1s
  api().eligibleDice().forEach(el=>el.classList.add('emph-selected'));
  eq('D','D5','Two dice selected for re-roll',api().selectedDice().length,2);
  const confirmed=withRandom(()=>api().doConfirm(),[0.0,0.6]);
  ok('D','D6','Confirm performs the re-roll',confirmed);
  eq('D','D7','Dice now read 1,7,4,6,8',dieTotals(),[1,7,4,6,8]);
  ok('D','D8','Re-rolled dice carry a 1->N history badge',
     document.querySelectorAll('#rollDiceRow .emph-history').length===2);
  eq('D','D9','Top-N keep suggestion re-applied (keep 8 and 7)',
     Array.from(document.querySelectorAll('#rollDiceRow .roll-die.kept'))
       .map(el=>parseInt(el.dataset.total,10)).sort((a,b)=>b-a),[8,7]);
  eq('D','D10','Modal total recomputed to 15',
     parseInt(document.getElementById('rollTotalDisplay').textContent,10),15);
  ok('D','D11','Re-roll mode exited after confirm',
     !document.getElementById('rollDiceRow').classList.contains('emph-reroll-mode'));
  eq('C','C2','Flag set after use',T.isEmphasisRerollUsed(),true);
  eq('C','C3','Second re-roll refused programmatically',api().doConfirm(),false);
  eq('C','C4','Re-entering re-roll mode refused once used',api().enterMode(),false);
  ok('C','C5','Bar reports the re-roll as spent',/once per roll/i.test(bar().textContent));
  if(MODE_B) ok('G','GB3','Version B: re-roll worked after selection',confirmed);
  else       ok('G','GA3','Version A: re-roll worked unconditionally',confirmed);
  // outcome signature for the A/B comparison
  const OUTCOME=dieTotals().join(',')+'|'+document.getElementById('rollTotalDisplay').textContent;

  // fresh roll resets the flag
  skRow.querySelector('.sk-roll').click();
  eq('C','C6','A new roll resets the once-per-roll flag',T.isEmphasisRerollUsed(),false);

  // no dice showing 1 -> control disabled
  forceDice([4,6,8,9,2]); api().render();
  ok('D','D12','Control disabled when no die shows 1',
     bar().querySelector('#emphasisRerollBtn').disabled);
  eq('D','D13','enterMode refused with no eligible dice',api().enterMode(),false);
  // cancel restores normal state
  forceDice([1,4,6,8,2]);
  if(MODE_B) api().setChosen('Katana');
  api().enterMode(); api().eligibleDice()[0].classList.add('emph-selected'); api().doCancel();
  ok('D','D14','Cancel exits re-roll mode',
     !document.getElementById('rollDiceRow').classList.contains('emph-reroll-mode'));
  eq('D','D15','Cancel clears the selection',
     document.querySelectorAll('#rollDiceRow .emph-selected').length,0);
  eq('D','D16','Cancel does not consume the re-roll',T.isEmphasisRerollUsed(),false);
  closeModal();

  // ---- scope: negative tests ----
  clearRows(); setAllTraits(3); addSkill('Kenjutsu',7,'Katana');
  const wRow=addWeapon('Katana');
  wRow.querySelector('.wp-roll-btn').click();
  ok('E','E1','Weapon ATTACK attaches the bar',!!bar());
  ok('E','E1b','Weapon attack auto-resolves the Emphasis (no dropdown)',
     bar()&&!bar().querySelector('#emphasisRerollSelect')&&/Katana/.test(bar().textContent));
  closeModal();
  wRow.querySelector('.wp-dmg-btn').click();
  no('E','E2','Weapon DAMAGE never attaches the bar',bar());
  closeModal();
  T.performSpellCastRoll('fire','Fire','Test Spell',1,[]);
  no('E','E3','Spell Casting Roll never attaches the bar',bar());
  closeModal();
  T.rollNotation('Manual','5k2');
  no('E','E4','Manual dice tray never attaches the bar',bar());
  closeModal();
  clearRows(); addSkill('Kenjutsu',0,'Katana');
  T.rollSkill('Kenjutsu','Agility',0);
  no('E','E5','Unskilled (Rank 0) never attaches the bar',bar());
  eq('E','E5b','Rank 0 context reports hasEmphasis:false',
     T.skillRollEmphasisContext('Kenjutsu',0,2).hasEmphasis,false);
  closeModal();
  clearRows(); addSkill('Kenjutsu',5);   // ranked but NO emphasis owned
  T.rollSkill('Kenjutsu','Agility',5);
  no('E','E6','Skill with no owned Emphasis never attaches the bar',bar());
  closeModal();

  // =========================================================================
  // F — integration
  // =========================================================================
  clearRows(); setAllTraits(3); addSkill('Kenjutsu',7,'Katana');
  T.rollSkill('Kenjutsu','Agility',7);
  // Pinned vector of the UNMODIFIED Ten Dice Rule. The runner additionally re-computes this
  // same vector on the Part B build and asserts the two are identical.
  const TDR_VECTOR=[[12,12],[13,4],[11,3],[6,3],[10,10],[15,2]].map(([r,k])=>{
    const a=T.applyTenDiceRule(r,k);return r+'k'+k+'->'+a.rolled+'k'+a.kept+'+'+a.bonus;}).join(' | ');
  eq('F','F1','Ten Dice Rule arithmetic untouched',TDR_VECTOR,
     '12k12->10k10+8 | 13k4->10k5+0 | 11k3->10k3+0 | 6k3->6k3+0 | 10k10->10k10+0 | 15k2->10k4+0');
  // TN readout still recomputes after a re-roll (uses the same updateRollKeepState path)
  closeModal();
  clearRows(); setAllTraits(2); addSkill('Kenjutsu',3,'Katana');
  sBody().querySelector('.sk-roll').click();
  forceDice([1,1,4,6,8]);
  if(MODE_B) api().setChosen('Katana');
  api().enterMode(); api().eligibleDice().forEach(e=>e.classList.add('emph-selected'));
  withRandom(()=>api().doConfirm(),[0.0,0.6]);
  eq('F','F2','Keep-note recomputed after re-roll',
     /Keeping 2 of 5/.test(document.getElementById('rollKeepNote').textContent),true);
  closeModal();
  // Part B damage still explodes on 9 and offers no re-roll
  clearRows(); addSkill('Kenjutsu',7,'Katana'); setAllTraits(3);
  const kat=addWeapon('Katana');
  eq('F','F3','Part B: Kenjutsu 7 damage still explodes on 9',
     T.getWeaponDamageDice(T.findWeapon('Katana'),7).explodeOn,9);
  kat.querySelector('.wp-dmg-btn').click();
  no('F','F4','...and damage still offers no re-roll',bar());
  closeModal();

  // =========================================================================
  // R — regression
  // =========================================================================
  eq('R','R4','weapon quick-add still populated',
     document.querySelectorAll('#weaponQuickAdd option').length,49);
  T.recalcAll();   // .sk-cost is a derived cell, written by recalcAll()
  eq('R','R6','skill XP still computed',/xp/.test(sBody().querySelector('.sk-cost').textContent),true);
  eq('R','R11','Base TN auto still correct',
     (()=>{setTrait('reflexes',4);T.recalcAll();return document.getElementById('f_baseTN').value;})(),'25');
  eq('R','R13','Ring still lower of its two Traits',
     (()=>{setTrait('agility',2);setTrait('reflexes',5);T.recalcAll();
           return document.getElementById('ring_fire').value;})(),'2');
  eq('R','R15','recalcAll still refreshes weapon rows',
     (()=>{setAllTraits(3);T.recalcAll();return kat.querySelector('.wp-dmg').value;})(),'7k2');
  const save1=T.collectData();
  eq('R','R12','collectData has no new top-level keys',
     Object.keys(save1).sort().join(','),
     ['adv','disadv','equip','fields','rings','skills','spellBonusUsed','spellBonusUsedVisual',
      'spellUsed','tech','traits','traitsFree','voidCurrent','voidFree','weapons'].sort().join(','));
  no('R','R12b','No emphasisRerollUsed key leaked into fields',
     Object.keys(save1.fields).some(k=>/emphasisReroll/i.test(k)));
  eq('R','R12c','fields count unchanged at 42',Object.keys(save1.fields).length,42);
  const sig=JSON.stringify(save1);
  T.applyData(JSON.parse(sig));
  eq('R','R14','save -> load -> save is stable',JSON.stringify(T.collectData()),sig);

  // ---- deterministic cross-version signatures ----
  const determinism={
    outcome:OUTCOME,
    reroll:T.rerollEmphasisDice([D(1),D(1),D(4)],[0,1],null,seq([0.0,0.6,0.9])).map(d=>d.total).join(','),
    explode:JSON.stringify(T.rerollEmphasisDice([D(1)],[0],null,seq([0.95,0.3]))[0]),
    audit:[audit.exact,audit.baseName,audit.unmatched,audit.noEmphasisList].join('/'),
    tenDiceRule:TDR_VECTOR,
  };

  clearRows(); closeModal();
  const fails=results.filter(r=>!r.pass);
  const bySec={};
  results.forEach(r=>{bySec[r.section]=bySec[r.section]||{pass:0,fail:0};bySec[r.section][r.pass?'pass':'fail']++;});
  console.log('%c FEATURE 0 — EMPHASIS RE-ROLL — VERSION '+VERSION+' ',
    'background:#7b1113;color:#fff;font-weight:bold;padding:3px 6px;');
  console.table(Object.keys(bySec).sort().map(s=>({Section:s,Pass:bySec[s].pass,Fail:bySec[s].fail})));
  if(fails.length) console.table(fails.map(f=>({ID:f.id,Test:f.name,Detail:f.detail})));
  console.log('%c '+(fails.length?'FAILURES':'ALL PASS')+' — '+(results.length-fails.length)+'/'+results.length+' ',
    'background:'+(fails.length?'#b00':'#1b7')+';color:#fff;font-weight:bold;padding:3px 6px;');
  return {version:VERSION,total:results.length,passed:results.length-fails.length,
          failed:fails.length,results,saveSignature:sig,determinism};
})();
