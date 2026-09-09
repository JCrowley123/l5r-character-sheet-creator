/* =============================================================================
 * L5R 4e — COMBINED HARNESS: Feature 8 (Mirumoto Rank 1) + F7 + F6 + F4 + F3 + F2
 *                            + F1 + P1/P2 + F0 + Part B + schoolfix
 * =============================================================================
 *   fetch('/l5r-P1-P2-F8-test-harness.js').then(r=>r.text()).then(s=>(0,eval)(s))
 * DESTRUCTIVE: clears Skills/Weapons/Equipment/Techniques and the Schools list, and
 * resets stance, rounds, wounds, Void, ammo, handedness and School Rank.
 * ============================================================================= */
(async function runF8Harness(){
  'use strict';
  const T = window.__L5R_TEST__;
  if(!T){ console.error('__L5R_TEST__ seam not found.'); return {total:1,passed:0,failed:1,results:[]}; }

  const results=[];
  // Live progress marker, as Feature 7 established: the last assertion to reach rec() turns
  // "it is stuck somewhere" into "it is stuck right after F8-B B7".
  const rec=(s,id,n,p,d)=>{
    window.__L5R_HARNESS_PROGRESS = s+' '+id+' | '+n;
    results.push({section:s,id,name:n,pass:!!p,detail:d||''});
  };
  const eq=(s,id,n,a,e)=>{const x=JSON.stringify(a),y=JSON.stringify(e);rec(s,id,n,x===y,x===y?'':'got '+x+' want '+y);};
  const ok=(s,id,n,v)=>rec(s,id,n,!!v,v?'':'expected truthy');
  const no=(s,id,n,v)=>rec(s,id,n,!v,v?'expected falsy, got '+JSON.stringify(v):'');

  const sB=()=>document.getElementById('skillsBody');
  const wB=()=>document.getElementById('weaponsBody');
  const eB=()=>document.getElementById('equipBody');
  const tB=()=>document.getElementById('techList');
  const TN=()=>parseInt(document.getElementById('f_currentTN').value,10);
  const setAllTraits=v=>['agility','reflexes','strength','stamina','perception','awareness','intelligence','willpower']
    .forEach(k=>document.getElementById('trait_'+k).value=v);
  const addSkill=(n,r,e)=>sB().appendChild(T.makeSkillRow({name:n,trait:(T.findSkill(n)||{}).trait||'',rank:r,emph:e||''}));
  const addWeapon=n=>{const L=T.findWeapon(n);
    const row=wB().appendChild(T.makeWeaponRow({key:L.name,name:L.name,skill:L.skill,size:L.size,
      keywords:'',notes:'',roll:'',dmg:'',manualAttack:false,manualDamage:false}));
    T.refreshAllWeaponRows(); return row;};
  const addTech=(name,desc)=>{const d=tB().appendChild(T.makeEntry({name:name,desc:desc},true,'XP'));
    T.recalcAll(); return d;};
  const noteOf=row=>row.querySelector('.wp-link-note').textContent.replace(/\s+/g,' ');
  const closeRoll=()=>{document.getElementById('rollModalOverlay').style.display='none';
                       document.getElementById('rollModalBody').innerHTML='';};

  // ---- School fixture -----------------------------------------------------------------
  // School Rank is DERIVED: recalcAll() recomputes it from Insight through
  // computeCappedActiveRank(), so a Rank cannot simply be written into f_rank and left there.
  // setSchool() writes the Schools list and buys enough Insight to sustain the Rank asked for,
  // then lets recalcAll() settle it -- which is also what proves the automation reads the real,
  // cap-respected Rank rather than a number the test made up.
  const setSchool=(name, wantRank)=>{
    document.getElementById('f_schoolsData').value = name
      ? JSON.stringify([{name:name,frozen:false,frozenRank:null,floorRank:wantRank||1,anchorInsightRank:0}])
      : '';
    document.getElementById('f_school').value = name || '';
    document.getElementById('f_insightBonus').value = wantRank ? (wantRank*10 + 40) : 0;
    T.recalcAll();
  };
  const setFrozenSchools=(list)=>{
    document.getElementById('f_schoolsData').value = JSON.stringify(list);
    T.recalcAll();
  };
  const schoolRank=()=>parseInt(document.getElementById('f_rank').value||'0',10);
  // Katana main-hand + wakizashi off-hand, the pairing Way of the Dragon requires.
  const daisho=()=>{
    const kat=addWeapon('Katana'), wak=addWeapon('Wakizashi');
    T.setRowHand(kat,'main'); T.setRowHand(wak,'off');
    T.refreshAllWeaponRows(); T.recalcAll();
    return {kat,wak};
  };

  // ---- Teardown -----------------------------------------------------------------------
  // Everything Feature 8 can switch on, plus everything Features 1-7 can leave behind. The
  // Schools list matters as much as the off-hand rows here: a leaked "Mirumoto Bushi" entry
  // would silently zero the dual-wield penalties inside the Feature 7 suite, and a leaked
  // Insight bonus would move Armor TN under every suite that asserts on it.
  const clearMirumoto=()=>{
    document.getElementById('f_schoolsData').value='';
    document.getElementById('f_school').value='';
    document.getElementById('f_rank').value=1;
    document.getElementById('f_insightBonus').value=0;
    tB().innerHTML='';
    wB().querySelectorAll('.wp-hand').forEach(el=>el.value='main');
    T.refreshAllWeaponRows(); T.recalcAll();
  };
  const reset=()=>{
    sB().innerHTML=''; wB().innerHTML=''; eB().innerHTML=''; tB().innerHTML='';
    T.clearLastArrowUsed(); setAllTraits(3);
    T.resetCombatRound(); T.clearFullDefenseBonus(); T.setCurrentStance('Attack',{silent:true});
    T.clearVoidPending(); T.clearVoidSkirmishEffects(); T.setCombatActive(false);
    document.getElementById('f_woundsTaken').value=0;
    document.getElementById('ring_void').value=5; document.getElementById('void_current').value=5;
    ['air','earth','fire','water'].forEach(r=>{const e=document.getElementById('ring_'+r); if(e) e.value=2;});
    clearMirumoto();
    closeRoll();
  };
  reset();

  // =====================================================================
  // F8-A — detection, pairing, dormancy
  // =====================================================================
  eq('F8-A','A1','The School name is the exact library entry',T.MIRUMOTO_SCHOOL,'Mirumoto Bushi');
  eq('F8-A','A2','The Rank 1 Technique is named',T.MIRUMOTO_R1_TECHNIQUE,'Way of the Dragon');
  eq('F8-A','A3','RAW names the two blades',
     [T.MIRUMOTO_MAIN_WEAPON,T.MIRUMOTO_OFF_WEAPON],['Katana','Wakizashi']);
  // completely dormant on a blank sheet
  eq('F8-A','A4','No School: Rank 0',T.getMirumotoRank(),0);
  eq('F8-A','A5','No School: no pair',T.getMirumotoPair(),null);
  eq('F8-A','A6','No School: no waiver',T.getMirumotoPenaltyWaiver(),null);
  eq('F8-A','A7','No School: no Armor TN bonus',T.getMirumotoArmorTNBonus(),0);
  eq('F8-A','A8','No School: no row notes',T.mirumotoNoteBits(),[]);
  eq('F8-A','A9','No School: no info lines',T.mirumotoInfoLines(),[]);
  // name matching
  ok('F8-A','A10','Exact name matches',T.isMirumotoSchoolName('Mirumoto Bushi'));
  ok('F8-A','A11','...case-insensitively, with stray space',T.isMirumotoSchoolName('  mirumoto bushi '));
  no('F8-A','A12','The Taoist Swordsman is a DIFFERENT School and must not match',
     T.isMirumotoSchoolName('Mirumoto Taoist Swordsman [Bushi]'));
  no('F8-A','A13','...nor does any other Mirumoto-ish string',T.isMirumotoSchoolName('Mirumoto'));
  no('F8-A','A14','...nor an empty name',T.isMirumotoSchoolName(''));
  // school without the weapons
  reset(); setSchool('Mirumoto Bushi',2);
  ok('F8-A','A15','A Mirumoto Bushi reports a Rank',T.getMirumotoRank()>=1);
  eq('F8-A','A16','Rank tracks the sheet’s own derived School Rank',T.getMirumotoRank(),schoolRank());
  eq('F8-A','A17','School but no weapons: no pair',T.getMirumotoPair(),null);
  eq('F8-A','A18','School but no weapons: no waiver',T.getMirumotoPenaltyWaiver(),null);
  eq('F8-A','A19','School but no weapons: no Armor TN bonus',T.getMirumotoArmorTNBonus(),0);
  ok('F8-A','A20','...but the info panel still explains the requirement',
     T.mirumotoInfoLines().some(l=>/Requires:/.test(l)));
  ok('F8-A','A21','...and says it is inactive',
     T.mirumotoInfoLines().some(l=>/Inactive/.test(l)));
  // weapons without the hands
  const kat0=addWeapon('Katana'), wak0=addWeapon('Wakizashi'); T.recalcAll();
  eq('F8-A','A22','Both blades but both main-hand: no pair',T.getMirumotoPair(),null);
  T.setRowHand(wak0,'off'); T.refreshAllWeaponRows(); T.recalcAll();
  ok('F8-A','A23','Katana main + wakizashi off forms the pair',!!T.getMirumotoPair());
  eq('F8-A','A24','...the pair names the right rows',
     [T.getMirumotoPair().main===kat0,T.getMirumotoPair().off===wak0],[true,true]);
  // the pairing is directional
  T.setRowHand(kat0,'off'); T.setRowHand(wak0,'main'); T.refreshAllWeaponRows(); T.recalcAll();
  eq('F8-A','A25','Reversed hands do NOT satisfy RAW',T.getMirumotoPair(),null);
  T.setRowHand(kat0,'main'); T.setRowHand(wak0,'off'); T.refreshAllWeaponRows(); T.recalcAll();
  // wrong weapons
  reset(); setSchool('Mirumoto Bushi',2);
  const k1=addWeapon('Katana'), t1=addWeapon('Tanto');
  T.setRowHand(k1,'main'); T.setRowHand(t1,'off'); T.refreshAllWeaponRows(); T.recalcAll();
  eq('F8-A','A26','Katana + tanto is not the daisho',T.getMirumotoPair(),null);
  reset(); setSchool('Mirumoto Bushi',2);
  const nd=addWeapon('No-dachi'), w1=addWeapon('Wakizashi');
  T.setRowHand(nd,'main'); T.setRowHand(w1,'off'); T.refreshAllWeaponRows(); T.recalcAll();
  eq('F8-A','A27','No-dachi + wakizashi is not the daisho',T.getMirumotoPair(),null);
  // wrong school, right weapons
  reset(); setSchool('Mirumoto Taoist Swordsman [Bushi]',3); daisho();
  eq('F8-A','A28','The Taoist Swordsman gets no waiver',T.getMirumotoPenaltyWaiver(),null);
  eq('F8-A','A29','...and no Armor TN bonus',T.getMirumotoArmorTNBonus(),0);
  reset(); setSchool('Hida Bushi',3); daisho();
  eq('F8-A','A30','An unrelated School gets nothing',T.getMirumotoPenaltyWaiver(),null);
  // the row link, not the typed name, decides what a weapon is
  reset(); setSchool('Mirumoto Bushi',2);
  const kk=addWeapon('Katana'), ww=addWeapon('Wakizashi');
  T.setRowHand(kk,'main'); T.setRowHand(ww,'off');
  kk.querySelector('.wp-name').value='Grandfather’s blade';
  T.refreshAllWeaponRows(); T.recalcAll();
  ok('F8-A','A31','A renamed but library-linked katana still counts',!!T.getMirumotoPair());
  eq('F8-A','A32','mirumotoRowIs reads the library key',
     [T.mirumotoRowIs(kk,'Katana'),T.mirumotoRowIs(ww,'Wakizashi'),T.mirumotoRowIs(ww,'Katana')],
     [true,true,false]);
  // frozen school: taking a second School must not lose Way of the Dragon
  reset();
  setFrozenSchools([{name:'Mirumoto Bushi',frozen:true,frozenRank:3,floorRank:3,anchorInsightRank:0},
                    {name:'Hida Bushi',frozen:false,frozenRank:null,floorRank:1,anchorInsightRank:0}]);
  daisho();
  eq('F8-A','A33','A frozen Mirumoto entry keeps its locked Rank',T.getMirumotoRank(),3);
  ok('F8-A','A34','...and still grants the waiver',!!T.getMirumotoPenaltyWaiver());
  eq('F8-A','A35','...at the frozen Rank',T.getMirumotoArmorTNBonus(),3);
  ok('F8-A','A36','...even though the ACTIVE School is Hida',
     document.getElementById('f_school').value==='Hida Bushi');
  // rank 0 is not rank 1
  reset();
  setFrozenSchools([{name:'Mirumoto Bushi',frozen:true,frozenRank:0,floorRank:0,anchorInsightRank:0}]);
  daisho();
  eq('F8-A','A37','Rank 0 grants nothing',
     [T.getMirumotoRank(),T.getMirumotoPenaltyWaiver(),T.getMirumotoArmorTNBonus()],[0,null,0]);

  // =====================================================================
  // F8-B — penalty waiver (Effect A)
  // =====================================================================
  reset(); setSchool('Mirumoto Bushi',2); addSkill('Kenjutsu',3,'Katana'); const d1=daisho();
  const waiver=T.getMirumotoPenaltyWaiver();
  ok('F8-B','B1','The waiver is active',!!waiver);
  eq('F8-B','B2','...and names Way of the Dragon',waiver.source,'Way of the Dragon');
  eq('F8-B','B3','...and states the requirement it is satisfying',waiver.why,
     'a katana in the main hand and a wakizashi in the off hand');
  // both halves of Feature 7's penalty go to zero
  const offP=()=>T.getOffHandPenalty(T.findWeapon('Wakizashi'),'Kenjutsu',3,'Medium');
  eq('F8-B','B4','getOffHandPenalty returns 0',offP().penalty,0);
  eq('F8-B','B5','...flagged exempt',offP().exempt,true);
  eq('F8-B','B6','...attributed to the School',offP().exemptKind,'school');
  eq('F8-B','B7','...naming the Technique',offP().exemptSource,'Way of the Dragon');
  eq('F8-B','B8','getMainHandPenalty returns 0',T.getMainHandPenalty().penalty,0);
  eq('F8-B','B9','...also flagged exempt and attributed',
     [T.getMainHandPenalty().exempt,T.getMainHandPenalty().exemptKind],[true,'school']);
  // "no penalties of ANY kind" is broader than a Skill mastery, which RAW scopes to the off hand
  reset(); setSchool('Mirumoto Bushi',2); addSkill('Knives',3);
  const k2=addWeapon('Katana'), tt=addWeapon('Tanto');
  T.setRowHand(k2,'main'); T.setRowHand(tt,'off'); T.refreshAllWeaponRows(); T.recalcAll();
  eq('F8-B','B10','Knives 3 waives the off hand even without the daisho',
     T.getOffHandPenalty(T.findWeapon('Tanto'),'Knives',3,'Small').penalty,0);
  eq('F8-B','B11','...but NOT the main hand, which keeps its -5',T.getMainHandPenalty().penalty,-5);
  reset(); setSchool('Mirumoto Bushi',2); addSkill('Kenjutsu',3,'Katana'); daisho();
  eq('F8-B','B12','Way of the Dragon DOES waive the main hand',T.getMainHandPenalty().penalty,0);
  // it outranks a free-text Technique waiver too, and reports itself rather than the Technique
  addTech('Some Other Technique','You suffer no penalties for dual wielding.');
  eq('F8-B','B13','The School waiver is reported ahead of a Technique waiver',
     T.getMainHandPenalty().exemptKind,'school');
  tB().innerHTML=''; T.recalcAll();
  // modifier bar, through Feature 7's contributor
  const mods=hand=>T.getPreRollModifiers(T.makeRollContext('attack',
    {weaponEntry:T.findWeapon(hand==='off'?'Wakizashi':'Katana'),skillName:'Kenjutsu',skillRank:3,
     hand:hand,weaponSize:'Medium'}));
  const mainMod=mods('main')[0], offMod=mods('off')[0];
  ok('F8-B','B14','The main-hand roll carries an informational entry',!!mainMod && mainMod.informational);
  eq('F8-B','B15','...reading "Dual-wielding: no penalty (Way of the Dragon)"',
     mainMod.label+': '+mainMod.display,'Dual-wielding: no penalty (Way of the Dragon)');
  eq('F8-B','B16','...and moving no dice',
     [mainMod.rolledDelta,mainMod.keptDelta,mainMod.totalDelta],[0,0,0]);
  eq('F8-B','B17','The off-hand roll reads "Off-hand: no penalty (Way of the Dragon)"',
     offMod.label+': '+offMod.display,'Off-hand: no penalty (Way of the Dragon)');
  eq('F8-B','B18','...and also moves no dice',
     [offMod.rolledDelta,offMod.keptDelta,offMod.totalDelta],[0,0,0]);
  // and it is silent on every other roll kind
  eq('F8-B','B19','Silent on non-attack rolls',
     ['skill','damage','spell','trait','ring','initiative','manual']
       .map(k=>T.getPreRollModifiers(T.makeRollContext(k,{hand:'off'})).length),[0,0,0,0,0,0,0]);
  // row notes
  const rows=Array.from(wB().querySelectorAll('tr'));
  ok('F8-B','B20','The main-hand row note reports the waiver',
     /dual-wield penalties waived/i.test(noteOf(rows[0])));
  ok('F8-B','B21','...naming Way of the Dragon',/Way of the Dragon/.test(noteOf(rows[0])));
  ok('F8-B','B22','The off-hand row note reports it too',
     /waived/i.test(noteOf(rows[1])));
  eq('F8-B','B23','mirumotoNoteBits contributes exactly two lines',T.mirumotoNoteBits().length,2);
  ok('F8-B','B24','...one for the waiver, one for the Armor TN',
     /penalties waived/.test(T.mirumotoNoteBits()[0]) &&
     /Armor TN/.test(T.mirumotoNoteBits()[1]));
  // info modal
  const info=T.mirumotoInfoLines();
  ok('F8-B','B25','The info panel has a School Automation heading',
     info.some(l=>/SCHOOL AUTOMATION/.test(l)));
  ok('F8-B','B26','...states the katana + wakizashi requirement',
     info.some(l=>/Katana.*main hand.*Wakizashi.*off hand/i.test(l)));
  ok('F8-B','B27','...states the penalty waiver',
     info.some(l=>/penalties waived/i.test(l)));
  ok('F8-B','B28','...states the Armor TN bonus',
     info.some(l=>/Armor TN \+/.test(l)));

  // =====================================================================
  // F8-C — Armor TN bonus (Effect B)
  // =====================================================================
  reset(); setSchool('Mirumoto Bushi',5);
  const tnBefore=TN();
  const rank=T.getMirumotoRank();
  ok('F8-C','C1','The fixture reaches a School Rank above 1',rank>=2);
  eq('F8-C','C2','School with no daisho adds nothing to Armor TN',TN(),tnBefore);
  const d2=daisho();
  eq('F8-C','C3','getMirumotoArmorTNBonus equals the School Rank',T.getMirumotoArmorTNBonus(),rank);
  eq('F8-C','C4','RAW scales with School Rank, it is not a flat +1',T.getMirumotoArmorTNBonus()>1,true);
  const insightBonus=T.getDualWieldArmorTNBonus();
  ok('F8-C','C5','Feature 7’s Insight Rank bonus is also active',insightBonus>0);
  eq('F8-C','C6','f_currentTN gains BOTH bonuses, cumulatively',TN(),tnBefore+insightBonus+rank);
  // removing the pairing removes exactly the School Rank
  T.setRowHand(d2.wak,'main'); T.refreshAllWeaponRows(); T.recalcAll();
  eq('F8-C','C7','Standing the wakizashi down removes the School bonus',T.getMirumotoArmorTNBonus(),0);
  eq('F8-C','C8','...and Feature 7’s bonus with it, since two weapons are no longer held',
     T.getDualWieldArmorTNBonus(),0);
  eq('F8-C','C9','...returning Armor TN to base',TN(),tnBefore);
  T.setRowHand(d2.wak,'off'); T.refreshAllWeaponRows(); T.recalcAll();
  eq('F8-C','C10','Restoring the pairing restores both',TN(),tnBefore+insightBonus+rank);
  // stacking with stance and Void, which own the other two terms in the same line
  T.setCurrentStance('Full Defense',{silent:true}); T.recalcAll();
  const stanceTN=T.getStanceArmorTNBonus();
  eq('F8-C','C11','Stance stacks on top of both',TN(),tnBefore+insightBonus+rank+stanceTN);
  T.setCurrentStance('Attack',{silent:true});
  T.setCombatActive(true); T.spendVoid('tn'); T.recalcAll();
  eq('F8-C','C12','Void stacks too',TN(),tnBefore+insightBonus+rank+T.getVoidArmorTNBonus());
  T.clearVoidPending(); T.setCombatActive(false); T.recalcAll();
  // the note line and info panel report it
  ok('F8-C','C13','The row note reports the School Rank bonus',
     new RegExp('Armor TN \\+'+rank+' \\(School Rank\\)').test(noteOf(wB().querySelector('tr'))));
  ok('F8-C','C14','The info panel reports it as cumulative',
     T.mirumotoInfoLines().some(l=>/on top of the \+/.test(l)));

  // =====================================================================
  // F8-D — save / load stability
  // =====================================================================
  reset(); setSchool('Mirumoto Bushi',3); addSkill('Kenjutsu',3,'Katana'); daisho();
  const save=T.collectData();
  eq('F8-D','D1','The save still has exactly 42 fields',Object.keys(save.fields).length,42);
  eq('F8-D','D2','No Mirumoto keys leaked into the f_ fields',
     Object.keys(save.fields).filter(k=>/mirumoto|niten|dragon|waiver/i.test(k)),[]);
  eq('F8-D','D3','No new top-level keys',Object.keys(save).sort().join(','),
     ['adv','disadv','equip','fields','rings','skills','spellBonusUsed','spellBonusUsedVisual',
      'spellUsed','tech','traits','traitsFree','voidCurrent','voidFree','weapons'].sort().join(','));
  eq('F8-D','D4','No Mirumoto key on any weapon row',
     Object.keys(save.weapons[0]).filter(k=>/mirumoto|school|waiver/i.test(k)),[]);
  ok('F8-D','D5','The School travels in the existing f_schoolsData field',
     /Mirumoto Bushi/.test(save.fields.f_schoolsData||''));
  ok('F8-D','D6','The handedness travels in Feature 7’s existing wp_hand',
     save.weapons.map(w=>w.hand).join(',')==='main,off');
  const rankBefore=T.getMirumotoRank(), tnB=TN();
  const sig=JSON.stringify(save);
  T.applyData(JSON.parse(sig));
  eq('F8-D','D7','The School Rank survives the round trip',T.getMirumotoRank(),rankBefore);
  ok('F8-D','D8','...the pairing does too',!!T.getMirumotoPair());
  eq('F8-D','D9','...and so does the waiver',T.getMirumotoPenaltyWaiver().source,'Way of the Dragon');
  eq('F8-D','D10','...and the Armor TN',TN(),tnB);
  eq('F8-D','D11','save -> load -> save is stable',JSON.stringify(T.collectData()),sig);
  // a pre-Feature-8 save has no Mirumoto anything and must load unchanged
  reset();
  const plain=T.collectData();
  T.applyData(JSON.parse(JSON.stringify(plain)));
  eq('F8-D','D12','A non-Mirumoto save loads dormant',
     [T.getMirumotoRank(),T.getMirumotoPair(),T.getMirumotoArmorTNBonus()],[0,null,0]);
  eq('F8-D','D13','...and still has 42 fields',Object.keys(T.collectData().fields).length,42);

  // =====================================================================
  // F8-E — zero-change guarantee
  // =====================================================================
  reset(); addSkill('Kenjutsu',7,'Katana');
  const soloKat=addWeapon('Katana'); T.recalcAll();
  const soloTN=TN();
  eq('F8-E','E1','No School, one weapon: Armor TN untouched',soloTN,TN());
  eq('F8-E','E2','...no Mirumoto contribution',T.getMirumotoArmorTNBonus(),0);
  eq('F8-E','E3','...no row note',T.mirumotoNoteBits(),[]);
  ok('F8-E','E4','...and the row note is free of School text',!/Mirumoto/.test(noteOf(soloKat)));
  eq('F8-E','E5','...no info lines',T.mirumotoInfoLines(),[]);
  // a non-Mirumoto dual-wielder keeps Feature 7's penalties exactly
  reset(); addSkill('Kenjutsu',7,'Katana'); const p1=daisho();
  eq('F8-E','E6','A non-Mirumoto daisho still pays the off-hand penalty',
     T.getOffHandPenalty(T.findWeapon('Wakizashi'),'Kenjutsu',7,'Medium').penalty,-10);
  eq('F8-E','E7','...and the main hand still pays -5',T.getMainHandPenalty().penalty,-5);
  no('F8-E','E8','...with no School waiver',T.getMirumotoPenaltyWaiver());
  ok('F8-E','E9','...and no Mirumoto text in the note',!/Mirumoto/.test(noteOf(p1.kat)));
  // a Mirumoto who is NOT dual-wielding is unaffected
  reset(); setSchool('Mirumoto Bushi',4); addSkill('Kenjutsu',7,'Katana');
  const loneKat=addWeapon('Katana'); T.recalcAll();
  eq('F8-E','E10','A Mirumoto with one blade gets no bonus',T.getMirumotoArmorTNBonus(),0);
  eq('F8-E','E11','...and no waiver',T.getMirumotoPenaltyWaiver(),null);
  ok('F8-E','E12','...and no waiver text on the row',!/waived/i.test(noteOf(loneKat)));
  // registry untouched
  eq('F8-E','E13','Feature 8 registers no new pre-roll contributor',
     T.PREROLL_MODIFIER_REGISTRY.map(m=>m.id+'@'+m.priority),
     ['range@20','arrow@25','stance@30','offhand@35','wounds@40','void@50']);
  eq('F8-E','E14','No test contributors left registered',
     T.PREROLL_MODIFIER_REGISTRY.filter(m=>/^t_/.test(m.id)).map(m=>m.id),[]);

  // =====================================================================
  // REG — the nine prior suites
  // =====================================================================
  // Nothing below may see a Mirumoto School, an off-hand row, a Technique or an Insight bonus.
  // A leaked "Mirumoto Bushi" entry would silently zero the dual-wield penalties the Feature 7
  // suite asserts on, and a leaked Insight bonus would move Armor TN under every suite that
  // checks it -- the same class of cross-section leak Feature 4 hit with Void skirmish state.
  reset();
  eq('F8-F','F1','Teardown: no School',document.getElementById('f_school').value,'');
  eq('F8-F','F2','Teardown: no Schools list',document.getElementById('f_schoolsData').value,'');
  eq('F8-F','F3','Teardown: no Insight bonus',document.getElementById('f_insightBonus').value,'0');
  eq('F8-F','F4','Teardown: Mirumoto fully dormant',
     [T.getMirumotoRank(),T.getMirumotoPair(),T.getMirumotoArmorTNBonus()],[0,null,0]);
  eq('F8-F','F5','Teardown: no weapons, equipment or Techniques',
     [wB().children.length,eB().children.length,tB().children.length],[0,0,0]);
  eq('F8-F','F6','Teardown: dual-wielding is off',T.isDualWieldActive(),false);

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
        clearMirumoto();
        return;
      }catch(e){ suites[name]={error:String(e)};
        rec('REG',name,name+' suite passes unchanged',false,'could not run: '+e); return; }
    }
    suites[name]={error:'not found'};
    rec('REG',name,name+' suite passes unchanged',false,'could not fetch any of: '+urls.join(', '));
  }
  await runSuite('Feature7',['/l5r-P1-P2-F7-test-harness.js','/f7-harness.js']);
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
  console.log('%c PART C — FEATURE 8: MIRUMOTO BUSHI RANK 1 ','background:#7b1113;color:#fff;font-weight:bold;padding:3px 6px;');
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
