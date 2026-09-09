/* =============================================================================
 * L5R 4e Character Sheet — PART B (Core Weapons System) AUTOMATED TEST HARNESS
 * =============================================================================
 *
 * HOW TO RUN
 *   1. Open "l5r-character-sheet part B complete.html" in a browser.
 *   2. Open DevTools -> Console.
 *   3. Paste this entire file and press Enter.
 *   4. Read the summary table it prints. Exit condition: FAIL count === 0.
 *
 * WHAT IT NEEDS
 *   window.__L5R_TEST__ — the read-only QA seam exported at the bottom of the
 *   sheet's single <script> block. It exposes existing functions only; it adds
 *   no behaviour and no production code path reads it.
 *
 * WHAT IT GUARANTEES
 *   - Section A  Library data integrity (shape, skill linkage, no duplicates)
 *   - Section B  Pure calculation: getWeaponAttackDice / getWeaponDamageDice
 *   - Section C  Row factory: auto-fill, linking, manual override, reactivity
 *   - Section D  Dice engine REGRESSION — rollDicePool/showRollResult untouched
 *   - Section E  Save / load round trip
 *   - Section L  Legacy save migration (pre-Part-B rows must not change rolls)
 *
 * DESTRUCTIVE: it clears the Skills and Weapons tables while running and leaves
 * them empty. Save your character first. It does not touch localStorage.
 * ============================================================================= */
(function runPartBHarness(){
  'use strict';
  const T = window.__L5R_TEST__;
  if(!T){
    console.error('__L5R_TEST__ seam not found. Are you on the Part B build of the sheet?');
    return;
  }

  const results = [];
  const rec = (section, id, name, pass, detail) =>
    results.push({ section, id, name, pass, detail: detail || '' });
  const eq = (section, id, name, actual, expected) => {
    const a = JSON.stringify(actual), e = JSON.stringify(expected);
    rec(section, id, name, a === e, a === e ? '' : `got ${a}, want ${e}`);
  };
  const truthy = (section, id, name, v) => rec(section, id, name, !!v, v ? '' : 'expected truthy');

  // ---- fixture helpers -------------------------------------------------------
  const TRAITS = ['agility','reflexes','strength','stamina','perception','awareness','intelligence','willpower'];
  const skillsBody  = () => document.getElementById('skillsBody');
  const weaponsBody = () => document.getElementById('weaponsBody');
  const setTrait = (k,v) => { document.getElementById('trait_'+k).value = v; };
  const setAllTraits = v => TRAITS.forEach(k => setTrait(k, v));
  const addSkill = (name, rank) =>
    skillsBody().appendChild(T.makeSkillRow({ name, trait:(T.findSkill(name)||{}).trait||'', rank }));
  const clearRows = () => { skillsBody().innerHTML=''; weaponsBody().innerHTML=''; };
  // "damage notation for weapon W at skill rank R"
  const D = (w,r,opts) => { const d = T.getWeaponDamageDice(T.findWeapon(w), r, opts); return d.numDice+'k'+d.keepDice; };
  const DMG = (w,r,opts) => T.getWeaponDamageDice(T.findWeapon(w), r, opts);
  const A = s => { const a = T.getWeaponAttackDice(s); return a.numDice+'k'+a.keepDice; };

  clearRows();
  setAllTraits(3);

  // =========================================================================
  // SECTION A — WEAPON_LIBRARY data integrity
  // =========================================================================
  const LIB = T.WEAPON_LIBRARY;
  eq('A','A1','Library is non-empty', LIB.length > 0, true);
  eq('A','A2','Every weapon has the five required fields',
     LIB.filter(w => !w.name || !w.skill || !w.damage ||
        typeof w.damage.roll !== 'number' || typeof w.damage.keep !== 'number' ||
        !w.size || !Array.isArray(w.keywords)).map(w=>w.name), []);
  eq('A','A3','Every weapon.skill resolves in SKILL_LIBRARY',
     LIB.filter(w => !T.findSkill(w.skill)).map(w => `${w.name} -> ${w.skill}`), []);
  eq('A','A4','Every size is Small | Medium | Large',
     LIB.filter(w => !['Small','Medium','Large'].includes(w.size)).map(w=>`${w.name}:${w.size}`), []);
  eq('A','A5','No duplicate weapon names',
     (()=>{const s={},d=[];LIB.forEach(w=>{const k=w.name.toLowerCase();if(s[k])d.push(w.name);s[k]=1;});return d;})(), []);
  eq('A','A6','Size is not duplicated inside keywords',
     LIB.filter(w => (w.keywords||[]).some(k=>['Small','Medium','Large'].includes(k))).map(w=>w.name), []);
  eq('A','A7','findWeapon is case- and whitespace-insensitive',
     [!!T.findWeapon('katana'), !!T.findWeapon('  KATANA  '), T.findWeapon('nope')], [true,true,null]);
  eq('A','A8','Every bow declares bowStrength and ammo',
     LIB.filter(w=>w.skill==='Kyujutsu').filter(w=>w.bowStrength===undefined||!w.ammo).map(w=>w.name), []);
  eq('A','A9','Every arrow has a numeric DR',
     T.ARROW_LIBRARY.filter(a=>typeof a.damage.roll!=='number'||typeof a.damage.keep!=='number').map(a=>a.name), []);
  truthy('A','A10','DEFAULT_ARROW resolves', T.findArrow(T.DEFAULT_ARROW));

  // =========================================================================
  // SECTION B — pure calculation functions
  // =========================================================================
  // ---- attack dice ----
  clearRows(); setAllTraits(3); addSkill('Kenjutsu',3);
  eq('B','B1','Attack: Kenjutsu 3 + Agility 3 = 6k3', A('Kenjutsu'), '6k3');
  clearRows(); addSkill('Kenjutsu',0);
  eq('B','B2','Attack: Rank 0 is Unskilled -> Trait only', A('Kenjutsu'), '3k3');
  clearRows();
  eq('B','B3','Attack: no Skill row at all -> Trait only', A('Kenjutsu'), '3k3');
  clearRows(); addSkill('Kyujutsu',4);
  eq('B','B4','Attack: Kyujutsu keys off Reflexes', A('Kyujutsu'), '7k3');
  clearRows(); addSkill('Ninjutsu',2);
  eq('B','B5','Attack: "Agility or Reflexes" takes the first Trait', A('Ninjutsu'), '5k3');
  eq('B','B6','Attack: unskilled flag is reported', T.getWeaponAttackDice('Iaijutsu').unskilled, true);
  clearRows();

  // ---- damage: Kenjutsu ----
  eq('B','B7','Katana @ Kenjutsu 0 (DR 3k2 + Str 3)', D('Katana',0), '6k2');
  eq('B','B8','Katana @ Kenjutsu 3 (+1k0 mastery)', D('Katana',3), '7k2');
  eq('B','B9','Katana @ Kenjutsu 7 (mastery still +1k0)', D('Katana',7), '7k2');
  eq('B','B10','Kenjutsu 7 lowers explosion threshold to 9', DMG('Katana',7).explodeOn, 9);
  eq('B','B11','Kenjutsu 3 does NOT lower it', DMG('Katana',3).explodeOn, null);
  eq('B','B12','No-dachi @ Kenjutsu 3 (DR 3k3 + Str 3 + 1k0)', D('No-dachi',3), '7k3');

  // ---- damage: Heavy Weapons ----
  eq('B','B13','Tetsubo @ HW 0 (DR 3k3 + Str 3)', D('Tetsubo',0), '6k3');
  eq('B','B14','Tetsubo @ HW 3 — Heavy Weapons has no dmgBonus', D('Tetsubo',3), '6k3');
  eq('B','B15','HW 3 gives reductionMod -2', DMG('Tetsubo',3).reductionMod, -2);
  eq('B','B16','HW 7 gives explodeOn 9 AND reduction -2',
     [DMG('Tetsubo',7).explodeOn, DMG('Tetsubo',7).reductionMod], [9,-2]);
  eq('B','B17','Dai Tsuchi @ HW 0 (DR 5k2 + Str 3)', D('Dai Tsuchi',0), '8k2');
  eq('B','B18','Ono @ HW 0 (DR 0k4 + Str 3)', D('Ono',0), '3k4');

  // ---- damage: Ninjutsu ----
  eq('B','B19','Shuriken @ Ninjutsu 0 (DR 1k1 + Str 3)', D('Shuriken',0), '4k1');
  eq('B','B20','Shuriken @ Ninjutsu 3 (+1k0)', D('Shuriken',3), '5k1');
  eq('B','B21','Shuriken @ Ninjutsu 7 (+1k1, cumulative)', D('Shuriken',7), '5k2');
  eq('B','B22','Blowgun @ Ninjutsu 0 — flat, no Trait, no override', D('Blowgun',0), '0k0');
  eq('B','B23','Blowgun @ Ninjutsu 3 — override 1k1, mastery exempt', D('Blowgun',3), '1k1');
  eq('B','B24','Blowgun @ Ninjutsu 5 — still the Rank-3 override row', D('Blowgun',5), '1k1');
  eq('B','B25','Blowgun @ Ninjutsu 7 — override 2k1, mastery exempt', D('Blowgun',7), '2k1');

  // ---- damage: bows ----
  setTrait('strength',2);
  eq('B','B26','Yumi (rating 3) with Strength 2 -> capped to 2, +Willow Leaf', D('Yumi',0), '4k2');
  setTrait('strength',4);
  eq('B','B27','Yumi with Strength 4 -> bow rating 3 caps it', D('Yumi',0), '5k2');
  eq('B','B28','Dai-kyu (rating 4) with Strength 4', D('Dai-kyu',0), '6k2');
  eq('B','B29','Han-kyu (rating 1) with Strength 4', D('Han-kyu',0), '3k2');
  eq('B','B30','Bow reports which arrow it used', DMG('Yumi',0).arrow, 'Willow Leaf');
  eq('B','B31','Bow honours opts.arrow (Flesh Cutter 2k3 + rating 3)', D('Yumi',0,{arrow:'Flesh Cutter'}), '5k3');
  eq('B','B32','Unknown arrow falls back to the default', D('Yumi',0,{arrow:'Nonsense'}), '5k2');
  setTrait('strength',3);

  // ---- damage: Trait routing ----
  setTrait('perception',5);
  eq('B','B33','Pistol uses Perception (DR 3k2 + Per 5)', D('Pistol',0), '8k2');
  eq('B','B34','Musket uses Perception (DR 4k3 + Per 5)', D('Musket',0), '9k3');
  eq('B','B35','Pistol traitName is Perception', DMG('Pistol',0).traitName, 'Perception');
  setTrait('perception',3);
  eq('B','B36','Cannon is flat DR, no Trait added', D('Cannon',0), '10k10');
  eq('B','B37','Cannon traitName is null', DMG('Cannon',0).traitName, null);
  eq('B','B38','Nageteppo (Incendiary) flat 3k2, exempt at Ninjutsu 7', D('Nageteppo (Incendiary)',7), '3k2');
  eq('B','B39','Unarmed (DR 0k1 + Str 3)', D('Unarmed',0), '3k1');
  eq('B','B40','War Fan (DR 0k1 + Str 3)', D('War Fan (Tessen)',0), '3k1');

  // ---- shadow-comparison guard (Phase 4 contract preserved) ----
  eq('B','B41','Kenjutsu 7 structured == legacy -> source structured', DMG('Katana',7).source, 'structured');
  eq('B','B42','Heavy Weapons 3 agree -> source structured', DMG('Tetsubo',3).source, 'structured');
  eq('B','B43','Ninjutsu 7 agree -> source structured', DMG('Shuriken',7).source, 'structured');
  eq('B','B44','Skill with no structured data agrees trivially', DMG('Naginata',7).source, 'structured');
  eq('B','B45','matched flag is true across the board',
     ['Katana','Tetsubo','Shuriken','Naginata'].filter(w=>!DMG(w,7).matched), []);

  // ---- conditional mastery must NOT be auto-applied (Phase 1 exclusion list) ----
  eq('B','B46','Polearms 5 "+1k0 vs mounted" not auto-applied', D('Naginata',5), '6k2');
  eq('B','B47','Spears 3 "ignore 3 Reduction" not auto-applied', DMG('Yari',3).reductionMod, 0);
  eq('B','B48','Staves 7 "small staves +1k0" not auto-applied', D('Bo',7), '4k2');
  eq('B','B49','Ninjutsu 5 "explode normally" not modelled as explodeOn', DMG('Shuriken',5).explodeOn, null);

  // ---- purity ----
  const beforePure = JSON.stringify(T.findWeapon('Katana'));
  DMG('Katana',7); DMG('Katana',3);
  eq('B','B50','getWeaponDamageDice does not mutate the library entry',
     JSON.stringify(T.findWeapon('Katana')), beforePure);
  eq('B','B51','Same inputs give the same output',
     JSON.stringify(DMG('Katana',3).numDice)+'/'+DMG('Katana',3).keepDice,
     JSON.stringify(DMG('Katana',3).numDice)+'/'+DMG('Katana',3).keepDice);

  // =========================================================================
  // SECTION C — row factory
  // =========================================================================
  clearRows(); setAllTraits(3); addSkill('Kenjutsu',3);
  const lib = T.findWeapon('Katana');
  const row = T.makeWeaponRow({ key:lib.name, name:lib.name, skill:lib.skill, size:lib.size,
    keywords:(lib.keywords||[]).join(', '), notes:lib.notes||'', roll:'', dmg:'',
    manualAttack:false, manualDamage:false });
  weaponsBody().appendChild(row);
  eq('C','C1','Linked row auto-fills Attack', row.querySelector('.wp-roll').value, '6k3');
  eq('C','C2','Linked row auto-fills Damage', row.querySelector('.wp-dmg').value, '7k2');
  eq('C','C3','Linked row auto-fills Size', row.querySelector('.wp-size').value, 'Medium');
  eq('C','C4','Linked row auto-links Skill', row.querySelector('.wp-skill').value, 'Kenjutsu');
  eq('C','C5','Hidden structured damage dice written',
     [row.querySelector('.wp-dmg-roll').value, row.querySelector('.wp-dmg-keep').value], ['7','2']);
  eq('C','C6','Hidden keywords written', row.querySelector('.wp-keywords').value, 'Samurai');

  const blank = T.makeWeaponRow({key:''});
  weaponsBody().appendChild(blank);
  eq('C','C7','Blank "+ Add Weapon" row starts unlinked', blank.querySelector('.wp-key').value, '');
  blank.querySelector('.wp-name').value = 'tetsubo';
  blank.querySelector('.wp-name').dispatchEvent(new Event('change'));
  eq('C','C8','Typing a canonical name links it (case-insensitive)', blank.querySelector('.wp-key').value, 'Tetsubo');
  eq('C','C9','Link auto-fills Skill', blank.querySelector('.wp-skill').value, 'Heavy Weapons');
  eq('C','C10','Link auto-fills Size', blank.querySelector('.wp-size').value, 'Large');
  eq('C','C11','Unskilled Heavy Weapons -> Attack is Trait only', blank.querySelector('.wp-roll').value, '3k3');
  eq('C','C12','Damage computed (DR 3k3 + Str 3)', blank.querySelector('.wp-dmg').value, '6k3');

  setTrait('strength',5); T.recalcAll();
  eq('C','C13','Raising Strength updates Damage via recalcAll', row.querySelector('.wp-dmg').value, '9k2');
  addSkill('Heavy Weapons',7); T.recalcAll();
  eq('C','C14','Buying a Skill Rank updates Attack', blank.querySelector('.wp-roll').value, '10k3');
  truthy('C','C15','Explode-on-9 surfaced in the row note', /explode on 9/i.test(blank.querySelector('.wp-link-note').textContent));
  setTrait('strength',3); T.recalcAll();

  const dmgBox = row.querySelector('.wp-dmg');
  dmgBox.value = '99k9'; dmgBox.dispatchEvent(new Event('input'));
  eq('C','C16','Typing into Damage flags the row manual', row.dataset.manualDamage, '1');
  T.recalcAll();
  eq('C','C17','Manual value survives recalcAll', dmgBox.value, '99k9');
  eq('C','C18','Attack box is independently still automatic', row.dataset.manualAttack, '0');
  dmgBox.value = ''; dmgBox.dispatchEvent(new Event('input'));
  eq('C','C19','Clearing the box restores the computed value', dmgBox.value, '7k2');
  eq('C','C20','Manual flag cleared', row.dataset.manualDamage, '0');
  eq('C','C21','Row cell count matches the header',
     row.children.length, document.querySelectorAll('#weaponsTable thead th').length);

  // =========================================================================
  // SECTION D — dice engine REGRESSION (rollDicePool must be untouched)
  // =========================================================================
  const p = T.rollDicePool(6,3);
  eq('D','D1','rollDicePool rolls the right number of dice', p.sorted.length, 6);
  eq('D','D2','rollDicePool keeps the right number', p.kept.length, 3);
  eq('D','D3','total = kept sum + Ten Dice bonus',
     p.total, p.kept.reduce((s,d)=>s+d.total,0)+p.bonus);
  const big = T.rollDicePool(13,4);
  eq('D','D4','Ten Dice Rule still converts 13k4 -> 10k5', [big.numDice,big.keepDice], [10,5]);
  eq('D','D5','tenDiceRuleApplied flag still set', big.tenDiceRuleApplied, true);
  eq('D','D6','formatRollNotation unchanged', T.formatRollNotation(6,3), '6k3');
  let bad10 = 0;
  for(let i=0;i<400;i++) T.rollDicePool(5,2).sorted.forEach(d=>d.chain.slice(0,-1).forEach(v=>{ if(v!==10) bad10++; }));
  eq('D','D7','rollDicePool still explodes on 10 ONLY', bad10, 0);

  let bad9 = 0, saw9 = 0;
  for(let i=0;i<400;i++) T.rollWeaponDicePool(5,2,9).sorted.forEach(d=>d.chain.slice(0,-1).forEach(v=>{ if(v<9) bad9++; if(v===9) saw9++; }));
  eq('D','D8','Sibling roller never explodes below 9', bad9, 0);
  truthy('D','D9','Sibling roller does explode on 9', saw9 > 0);
  const sib = T.rollWeaponDicePool(13,4,9);
  eq('D','D10','Sibling honours the Ten Dice Rule identically', [sib.numDice,sib.keepDice], [10,5]);
  eq('D','D11','Sibling returns the same result shape as rollDicePool',
     Object.keys(T.rollDicePool(3,2)).sort().join(','),
     Object.keys(T.rollWeaponDicePool(3,2,null)).sort().join(','));
  let badNull = 0;
  for(let i=0;i<300;i++) T.rollWeaponDicePool(4,2,null).sorted.forEach(d=>d.chain.slice(0,-1).forEach(v=>{ if(v!==10) badNull++; }));
  eq('D','D12','Sibling with explodeOn=null behaves like plain 10-only', badNull, 0);
  eq('D','D13','rollExplodingD10At clamps out-of-range thresholds',
     (()=>{let bad=0;for(let i=0;i<300;i++){const r=T.rollExplodingD10At(1);r.chain.slice(0,-1).forEach(v=>{if(v<2)bad++;});}return bad;})(), 0);

  // =========================================================================
  // SECTION E — save / load
  // =========================================================================
  clearRows(); setAllTraits(3); addSkill('Kenjutsu',7);
  const wSel = document.getElementById('weaponQuickAdd');
  ['Katana','Yumi','Tetsubo'].forEach(n=>{ wSel.value=n; wSel.dispatchEvent(new Event('change')); });
  eq('E','E1','Quick-add created three rows', document.querySelectorAll('#weaponsBody tr').length, 3);
  const rows = [...document.querySelectorAll('#weaponsBody tr')];
  eq('E','E2','Katana attack at Kenjutsu 7', rows[0].querySelector('.wp-roll').value, '10k3');
  eq('E','E3','Katana damage 3k2 + Str3 + 1k0', rows[0].querySelector('.wp-dmg').value, '7k2');
  eq('E','E4','Yumi Unskilled in Kyujutsu', rows[1].querySelector('.wp-roll').value, '3k3');
  eq('E','E5','Yumi damage = bow rating 3 + Willow Leaf 2k2', rows[1].querySelector('.wp-dmg').value, '5k2');
  truthy('E','E6','Notes auto-filled from the library', /Void Point/.test(rows[0].querySelector('.wp-notes').value));

  const saved = T.collectData(), w0 = saved.weapons[0];
  eq('E','E7','Legacy fields still saved',
     [typeof w0.name,typeof w0.roll,typeof w0.dmg,typeof w0.size,typeof w0.notes].join(','),
     'string,string,string,string,string');
  eq('E','E8','Structured fields saved',
     [w0.key,w0.skill,w0.dmgRoll,w0.dmgKeep,w0.keywords], ['Katana','Kenjutsu','7','2','Samurai']);
  eq('E','E9','Manual flags saved', [w0.manualAttack,w0.manualDamage], [false,false]);
  const snap = JSON.stringify(saved.weapons);
  T.applyData(JSON.parse(JSON.stringify(saved)));
  eq('E','E10','collectData -> applyData -> collectData is stable',
     JSON.stringify(T.collectData().weapons), snap);
  eq('E','E11','Rows restored', document.querySelectorAll('#weaponsBody tr').length, 3);
  eq('E','E12','Restored row still computes',
     document.querySelectorAll('#weaponsBody tr')[0].querySelector('.wp-dmg').value, '7k2');

  // end-to-end through the real buttons
  document.querySelectorAll('#weaponsBody tr')[0].querySelector('.wp-roll-btn').click();
  eq('E','E13','Attack button opens the roll modal',
     document.getElementById('rollModalOverlay').style.display, 'flex');
  eq('E','E14','Attack modal title',
     document.getElementById('rollModalTitle').textContent, 'Katana — Attack (Kenjutsu 7)');
  eq('E','E15','Attack modal notation', document.getElementById('rollModalNotation').textContent, '10k3');
  eq('E','E16','Attack rolled 10 dice', document.querySelectorAll('#rollDiceRow .roll-die').length, 10);
  document.querySelectorAll('#weaponsBody tr')[0].querySelector('.wp-dmg-btn').click();
  eq('E','E17','Damage modal title carries the explode note',
     document.getElementById('rollModalTitle').textContent, 'Katana — Damage (Kenjutsu 7, explodes on 9+)');
  eq('E','E18','Damage rolled 7 dice', document.querySelectorAll('#rollDiceRow .roll-die').length, 7);
  document.getElementById('rollModalOverlay').style.display = 'none';

  // =========================================================================
  // SECTION L — legacy save migration
  // =========================================================================
  clearRows(); setAllTraits(3); addSkill('Kenjutsu',3);
  const legacyFilled = T.makeWeaponRow({ name:'Katana', roll:'5k3', dmg:'8k4', size:'Medium', notes:'grandfather blade' });
  weaponsBody().appendChild(legacyFilled);
  eq('L','L1','Legacy row keeps its Attack verbatim', legacyFilled.querySelector('.wp-roll').value, '5k3');
  eq('L','L2','Legacy row keeps its Damage verbatim', legacyFilled.querySelector('.wp-dmg').value, '8k4');
  eq('L','L3','Legacy row auto-flagged manual (rolls do not change)',
     [legacyFilled.dataset.manualAttack, legacyFilled.dataset.manualDamage], ['1','1']);
  eq('L','L4','Legacy row still adopts the library link', legacyFilled.querySelector('.wp-key').value, 'Katana');
  eq('L','L5','Legacy row gains the Skill column', legacyFilled.querySelector('.wp-skill').value, 'Kenjutsu');
  eq('L','L6','Legacy row keeps its own Notes', legacyFilled.querySelector('.wp-notes').value, 'grandfather blade');
  T.recalcAll();
  eq('L','L7','recalcAll does not overwrite legacy values',
     [legacyFilled.querySelector('.wp-roll').value, legacyFilled.querySelector('.wp-dmg').value], ['5k3','8k4']);

  const legacyBlank = T.makeWeaponRow({ name:'Katana', roll:'', dmg:'', size:'', notes:'' });
  weaponsBody().appendChild(legacyBlank);
  eq('L','L8','Legacy row with EMPTY boxes links fully and computes',
     [legacyBlank.querySelector('.wp-roll').value, legacyBlank.querySelector('.wp-dmg').value], ['6k3','7k2']);
  eq('L','L9','...and is not flagged manual',
     [legacyBlank.dataset.manualAttack, legacyBlank.dataset.manualDamage], ['0','0']);

  const legacyCustom = T.makeWeaponRow({ name:'Ancestral Naginata of Doom', roll:'7k3', dmg:'9k4', size:'Large', notes:'heirloom' });
  weaponsBody().appendChild(legacyCustom);
  eq('L','L10','Unrecognised legacy weapon stays unlinked', legacyCustom.querySelector('.wp-key').value, '');
  eq('L','L11','Unrecognised legacy weapon keeps its values',
     [legacyCustom.querySelector('.wp-roll').value, legacyCustom.querySelector('.wp-dmg').value], ['7k3','9k4']);
  truthy('L','L12','Unrecognised row shows the custom-weapon note',
     /Custom weapon/.test(legacyCustom.querySelector('.wp-link-note').textContent));
  const explicitCustom = T.makeWeaponRow({ key:'', name:'Katana', roll:'2k1', dmg:'2k1', size:'', notes:'' });
  weaponsBody().appendChild(explicitCustom);
  eq('L','L13','Explicit key:"" is respected, never re-linked by name',
     explicitCustom.querySelector('.wp-key').value, '');
  const legacySave = T.collectData();
  eq('L','L14','Legacy rows survive a save round trip',
     legacySave.weapons.length, 4);

  clearRows();

  // =========================================================================
  // REPORT
  // =========================================================================
  const fails = results.filter(r => !r.pass);
  const bySection = {};
  results.forEach(r => {
    bySection[r.section] = bySection[r.section] || { pass:0, fail:0 };
    bySection[r.section][r.pass ? 'pass' : 'fail']++;
  });
  const SECTION_NAMES = {
    A:'Library data integrity', B:'Pure calculation', C:'Row factory',
    D:'Dice engine regression', E:'Save / load', L:'Legacy migration',
  };
  console.log('%c L5R PART B — WEAPONS SYSTEM TEST HARNESS ',
    'background:#7b1113;color:#fff;font-weight:bold;padding:3px 6px;');
  console.table(Object.keys(bySection).sort().map(s => ({
    Section: s, Area: SECTION_NAMES[s] || '',
    Pass: bySection[s].pass, Fail: bySection[s].fail,
  })));
  if (fails.length) {
    console.log('%c FAILURES ', 'background:#b00;color:#fff;font-weight:bold;padding:2px 6px;');
    console.table(fails.map(f => ({ ID:f.id, Test:f.name, Detail:f.detail })));
  }
  const verdict = fails.length === 0;
  console.log(
    `%c ${verdict ? 'ALL PASS' : 'FAILURES PRESENT'} — ${results.length - fails.length}/${results.length} `,
    `background:${verdict ? '#1b7' : '#b00'};color:#fff;font-weight:bold;padding:3px 6px;`
  );
  console.warn('Skills and Weapons tables were cleared by this harness. Reload the page or re-load your character.');
  return { total: results.length, passed: results.length - fails.length, failed: fails.length, results };
})();
