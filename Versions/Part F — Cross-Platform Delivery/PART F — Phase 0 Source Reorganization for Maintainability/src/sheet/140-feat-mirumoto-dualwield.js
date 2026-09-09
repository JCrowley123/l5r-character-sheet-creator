  // ============ PART C FEATURE 8: MIRUMOTO BUSHI, SCHOOL RANK 1 ============
  // RAW (Core Rulebook, Mirumoto Bushi School, Rank 1 — "Way of the Dragon"):
  //
  //   "Initiates of the Mirumoto Bushi School must master the basic principles of Niten, the
  //    two-sword technique founded by Mirumoto himself. When wielding a katana in your main hand
  //    and a wakizashi in your off hand, you suffer no penalties of any kind for dual wielding,
  //    and you gain a bonus of your School Rank to your Armor TN (this is cumulative with the
  //    normal bonus for wielding two weapons). Additionally, when you are targeted with a spell,
  //    you may raise or lower the TN of that spell's Spellcasting Roll by 5."
  //
  // TWO of those three clauses are implemented, and the omission is deliberate:
  //
  //   * "no penalties of any kind for dual wielding"  -> implemented. Both of Feature 7's
  //     penalties go to zero: the off-hand weapon's size-scaled penalty AND the main hand's -5.
  //     "Of any kind" is why the main hand is included; a Skill mastery like Knives 3 waives only
  //     the off-hand half, and this is the rule that shows why Feature 7 kept them separate.
  //   * "a bonus of your School Rank to your Armor TN" -> implemented, and explicitly cumulative
  //     with Feature 7's Insight Rank bonus, exactly as the parenthetical instructs.
  //   * the Spellcasting Roll clause -> NOT implemented. This sheet has no Spellcasting Roll TN
  //     to raise or lower: spells are cast through performSpellCastRoll(), which rolls dice and
  //     has no TN target to adjust, and the adjustment is a reaction made by the spell's TARGET
  //     rather than by the roller. There is nothing here to hook it to, so shipping a control
  //     for it would be a button that does nothing. Out of scope by the brief, and correct.
  //
  // RANKS 2-5 ARE NOT IMPLEMENTED, and each for a concrete reason rather than by omission:
  //   Rank 2 (The Calm in Midst of Thunder) needs Iaijutsu duels, which this sheet does not model.
  //   Rank 3 (Strong and Swift) needs Simple vs Complex action economy, which does not exist here.
  //   Rank 4 (Furious Retaliation) needs the Reaction Stage and per-target next-turn bonuses.
  //   Rank 5 (Heart of the Dragon) needs turn-based action sequencing and Free Actions.
  // None of them appear in the UI, the save, the modifier bar, the roll pipeline, Armor TN or
  // the dual-wielding logic. getMirumotoRank() reports the real School Rank because the Armor TN
  // bonus scales with it, but no Rank above 1 unlocks any additional behaviour.
  //
  // NOTHING IS STORED. Every decision below is derived, at the moment it is asked, from state the
  // sheet already saves: the Schools list (f_schoolsData, or the f_school/f_rank pair it migrates
  // from), the weapon rows' library keys, and Feature 7's hand selectors. The save shape is
  // untouched -- THIS feature adds no f_ fields of its own -- and a character who changes School, Rank or weapon
  // pairing sees the automation appear or vanish on the next recalc with no state to go stale.

  const MIRUMOTO_SCHOOL = 'Mirumoto Bushi';
  const MIRUMOTO_R1_TECHNIQUE = 'Way of the Dragon';
  const MIRUMOTO_MAIN_WEAPON = 'Katana';
  const MIRUMOTO_OFF_WEAPON = 'Wakizashi';

  // ---- Detection ---------------------------------------------------------------------------
  // The School name must match EXACTLY. 'Mirumoto Taoist Swordsman [Bushi]' is a different
  // School in SCHOOL_LIBRARY with an entirely different Technique list (Aligned With the
  // Elements, Fist and Blade, ...) and no Way of the Dragon, so a prefix match on "Mirumoto"
  // would hand it an ability it does not have.
  function isMirumotoSchoolName(name){
    return String(name || '').trim().toLowerCase() === MIRUMOTO_SCHOOL.toLowerCase();
  }
  // The character's Mirumoto Bushi School Rank, or 0 if they have never trained in it.
  //
  // Read from the Schools list rather than from f_school, because a character who takes a second
  // School does not forget Way of the Dragon: Mirumoto becomes a FROZEN entry and stops being
  // the active School, but the Rank 1 Technique is still theirs. A frozen entry reports its
  // locked frozenRank; the active entry reports f_rank, which recalcAll keeps in step with
  // computeCappedActiveRank(). getSchoolsList() migrates a single-School character from the
  // f_school/f_rank pair on its own, so older saves need no special case here.
  function getMirumotoRank(){
    if(typeof getSchoolsList !== 'function') return 0;
    let list;
    try { list = getSchoolsList() || []; } catch(e){ return 0; }
    for(let i = 0; i < list.length; i++){
      const entry = list[i] || {};
      if(!isMirumotoSchoolName(entry.name)) continue;
      if(entry.frozen) return Math.max(0, parseInt(entry.frozenRank || 0, 10) || 0);
      const el = document.getElementById('f_rank');
      return Math.max(0, parseInt((el && el.value) || '0', 10) || 0);
    }
    return 0;
  }
  // Which library weapon a row is linked to. Reads .wp-key, the library link, rather than the
  // free-text name box -- a row called "Grandfather's blade" that is linked to the Katana entry
  // IS a katana, and a row merely named "Katana" but linked to nothing is not.
  function mirumotoRowWeapon(row){
    const el = (row && row.querySelector) ? row.querySelector('.wp-key') : null;
    return el ? String(el.value || '').trim() : '';
  }
  function mirumotoRowIs(row, weaponName){
    return mirumotoRowWeapon(row).toLowerCase() === String(weaponName).toLowerCase();
  }
  // The katana/wakizashi pairing the Technique requires, or null. Deliberately a question about
  // the CHARACTER rather than about any one row, so every caller -- the penalty functions, the
  // Armor TN, the row notes, the info panel -- agrees about whether the daisho is being wielded.
  //
  // Note the asymmetry with Feature 7's getDualWieldPair(): that one accepts any two weapons and
  // takes the clicked row as a hint. This one is strict, because RAW names the two blades.
  function getMirumotoPair(){
    if(typeof weaponRows !== 'function') return null;
    const rows = weaponRows();
    const off = rows.filter(r => getRowHand(r) === 'off' && mirumotoRowIs(r, MIRUMOTO_OFF_WEAPON))[0];
    if(!off) return null;
    const main = rows.filter(r => getRowHand(r) === 'main' && mirumotoRowIs(r, MIRUMOTO_MAIN_WEAPON))[0];
    if(!main || main === off) return null;
    return { main, off };
  }
  // The Technique's own name, preferring the player's spelling if they have it written down.
  // The Techniques list is consulted for NAMING ONLY -- the automation is gated on the School and
  // the weapons, never on whether the Technique happens to be typed into the list, because the
  // sheet grants School Techniques automatically and a player may well have renamed or reworded
  // the entry.
  function mirumotoTechniqueName(){
    const entries = Array.from(document.querySelectorAll('#techList .entry'));
    for(const div of entries){
      const el = div.querySelector('.en-name');
      const typed = el ? String(el.value || '').trim() : '';
      if(typed && typed.toLowerCase() === MIRUMOTO_R1_TECHNIQUE.toLowerCase()) return typed;
    }
    return MIRUMOTO_R1_TECHNIQUE;
  }

  // ---- The two effects ---------------------------------------------------------------------
  // Effect A. Returns null unless every RAW condition holds, which is what makes this feature
  // dormant: School is Mirumoto Bushi, Rank at least 1, katana in the main hand, wakizashi in
  // the off hand. The shape matches what Feature 7's penalty functions already return for a
  // Technique or mastery waiver, so the modifier bar, the row notes and the info panel all
  // render it through paths that already existed.
  function getMirumotoPenaltyWaiver(){
    const rank = getMirumotoRank();
    if(rank < 1) return null;
    const pair = getMirumotoPair();
    if(!pair) return null;
    return {
      waived: true,
      rank: rank,
      source: mirumotoTechniqueName(),
      school: MIRUMOTO_SCHOOL,
      pair: pair,
      why: 'a katana in the main hand and a wakizashi in the off hand',
    };
  }
  // Effect B. RAW says "a bonus of your School Rank", not a flat +1 -- the Technique is learned
  // at Rank 1 but the bonus it grants grows with the School. Cumulative with Feature 7's Insight
  // Rank bonus by the Technique's own parenthetical; recalcAll() adds both.
  function getMirumotoArmorTNBonus(){
    const waiver = getMirumotoPenaltyWaiver();
    return waiver ? waiver.rank : 0;
  }

  // ---- UI helpers, called from Feature 7's row note and the weapon info panel ---------------
  // Returns [] when dormant, so a row belonging to anyone who is not a dual-wielding Mirumoto is
  // byte-identical to Feature 7's.
  function mirumotoNoteBits(){
    const waiver = getMirumotoPenaltyWaiver();
    if(!waiver) return [];
    return [
      '<span class="wp-note-exempt">Mirumoto Rank ' + waiver.rank +
        ': dual-wield penalties waived (' + escHtml(waiver.source) + ')</span>',
      '<span class="wp-note-hand">Mirumoto Rank ' + waiver.rank +
        ': Armor TN +' + waiver.rank + ' (School Rank)</span>',
    ];
  }
  // The "School Automation" block for showWeaponInfoModal(). Explains the requirement whether or
  // not it is currently met, so a Mirumoto who has not set their hands yet can see what is
  // missing rather than wondering why nothing is happening.
  function mirumotoInfoLines(){
    const rank = getMirumotoRank();
    if(rank < 1) return [];
    const waiver = getMirumotoPenaltyWaiver();
    const lines = [];
    lines.push('');
    lines.push('SCHOOL AUTOMATION — ' + MIRUMOTO_SCHOOL + ' Rank ' + rank);
    lines.push('Requires: ' + MIRUMOTO_MAIN_WEAPON + ' in the main hand, ' +
               MIRUMOTO_OFF_WEAPON + ' in the off hand.');
    if(waiver){
      lines.push('Active (' + waiver.source + '):');
      lines.push('  • Dual-wield penalties waived entirely — both the off-hand penalty and');
      lines.push('    the main hand’s -5 are 0.');
      lines.push('  • Armor TN +' + waiver.rank + ' (School Rank), on top of the +' +
                 (typeof getDualWieldArmorTNBonus === 'function' ? getDualWieldArmorTNBonus() : 0) +
                 ' for wielding two weapons.');
    } else {
      lines.push('Inactive — set a ' + MIRUMOTO_MAIN_WEAPON + ' to main hand and a ' +
                 MIRUMOTO_OFF_WEAPON + ' to off hand to gain the waiver and the Armor TN bonus.');
    }
    return lines;
  }
  // ============ END PART C FEATURE 8 ============

  // ============ PART C FEATURE 7: DUAL-WIELDING & OFF-HAND PENALTIES ============
  // RAW (Core Rulebook, Book of Fire p.141, sidebar "Off-hand Weapons & Multiple Attacks"):
  //
  //   "A character's handedness is determined by the player. A character attempting to make an
  //    attack with a weapon in his off-hand suffers a penalty of -5 to the roll if it is a small
  //    weapon, -10 if it is medium, and -15 if it is large. Additionally, attacks made with the
  //    character's dominant hand suffer a penalty of -5 to attacks as long as a secondary weapon
  //    is held in the off hand. However, a character wielding two weapons is more difficult to
  //    hit due to the larger area covered. As a result, characters wielding two weapons add
  //    their Insight Rank to their Armor TN."
  //
  // THREE THINGS THE BRIEF'S SUMMARY LEFT OUT, all quoted above and all implemented here:
  //   1. The off-hand penalty is SIZE-SCALED (-5 / -10 / -15). The brief's flat "-10" is exactly
  //      the Medium case, which is the commonest one -- a wakizashi or a jitte -- but a no-dachi
  //      in the off hand is -15 and a tanto is -5.
  //   2. The MAIN hand is penalised too: -5 while a second weapon is held. The brief says
  //      "apply penalties only to the off-hand roll"; RAW does not. Dual-wielding costs you
  //      something on both attacks, which is the whole reason Mirumoto's Rank 1 is worth having.
  //   3. Wielding two weapons ADDS YOUR INSIGHT RANK TO ARMOR TN. Shipping the penalties without
  //      the compensating bonus would leave a dual-wielder strictly worse off than the rulebook
  //      allows, so it is applied. It is one named function called from one line of recalcAll(),
  //      alongside the armour/stance/Void terms already there -- see getDualWieldArmorTNBonus().
  //
  // Every figure lives in OFF_HAND_RULES below and nothing hardcodes any of them, so a table
  // that prefers the brief's flat reading can change them in one place.
  //
  // DORMANT UNTIL DECLARED. Nothing here does anything until the player marks a weapon row
  // "Off-hand". No off-hand row means no pair, which means no prompt, no penalty, no Armor TN
  // change, no modifier bar and no handedness note -- a one-weapon character rolls exactly the
  // dice Feature 6 rolled. That is the spec's section 2.5 guarantee, and it is also what keeps
  // every pre-Feature-7 save and every earlier regression suite valid.
  const OFF_HAND_RULES = Object.freeze({
    // "-5 to the roll if it is a small weapon, -10 if it is medium, and -15 if it is large"
    offHandBySize: Object.freeze({ Small: -5, Medium: -10, Large: -15 }),
    // A custom row whose Size box says something the rulebook never printed still has to roll
    // something. Medium is the middle case and the one the brief names, so it is the fallback.
    offHandDefault: -10,
    // "attacks made with the character's dominant hand suffer a penalty of -5 to attacks as
    //  long as a secondary weapon is held in the off hand"
    mainHandPenalty: -5,
    // "characters wielding two weapons add their Insight Rank to their Armor TN"
    armorTNFromInsightRank: true,
  });

  // ---- Handedness, stored on the row -------------------------------------------------------
  // 'main' is the default and the value a pre-Feature-7 save loads with, so an old character
  // comes back as a single-weapon character no matter how many weapons are listed (spec 2.4).
  const HAND_VALUES = Object.freeze(['main', 'off']);
  const DEFAULT_HAND = 'main';
  function normaliseHand(v){
    const s = String(v || '').trim().toLowerCase();
    return HAND_VALUES.indexOf(s) >= 0 ? s : DEFAULT_HAND;
  }
  function getRowHand(row){
    const el = (row && row.querySelector) ? row.querySelector('.wp-hand') : null;
    return el ? normaliseHand(el.value) : DEFAULT_HAND;
  }
  function setRowHand(row, hand){
    const el = (row && row.querySelector) ? row.querySelector('.wp-hand') : null;
    if(!el) return false;
    el.value = normaliseHand(hand);
    refreshAllWeaponRows();     // the OTHER rows' notes depend on this one -- see below
    recalcAll();                // Armor TN changes the moment a second hand is declared
    return true;
  }
  function weaponRows(){ return Array.from(document.querySelectorAll('#weaponsBody tr')); }

  // THE PAIR is the whole feature's on/off switch. Returns null -- meaning "this character is
  // not dual-wielding" -- unless there is both an off-hand row and a different main-hand row.
  //
  // Which main hand? The row the player actually clicked, when that row is a main-hand weapon;
  // otherwise the first main-hand row in the table. So clicking the attack die on your katana
  // pairs it with your wakizashi, and clicking it on the wakizashi pairs the wakizashi (as the
  // off hand) with your first main-hand weapon. Deterministic, and it never guesses between two
  // main-hand weapons -- it takes the first, and the prompt names both weapons so the player can
  // see exactly which pairing they are about to roll.
  function getDualWieldPair(row){
    const rows = weaponRows();
    const off = rows.filter(r=>getRowHand(r) === 'off')[0] || null;
    if(!off) return null;
    const clickedIsMain = row && row.querySelector && getRowHand(row) === 'main';
    const main = clickedIsMain ? row : (rows.filter(r=>getRowHand(r) === 'main')[0] || null);
    if(!main || main === off) return null;
    return { main, off };
  }
  // Character-level: is a second weapon held at all? This is what the Armor TN bonus and the
  // main-hand penalty key off, and it deliberately does NOT depend on which row was clicked.
  function isDualWieldActive(){
    const rows = weaponRows();
    return rows.some(r=>getRowHand(r) === 'off') && rows.some(r=>getRowHand(r) === 'main');
  }
  function getOffHandRow(){ return weaponRows().filter(r=>getRowHand(r) === 'off')[0] || null; }

  // ---- Exemption source 1: Weapon Skill mastery --------------------------------------------
  // Two skills in SKILL_LIBRARY print an off-hand mastery, and both are now declared
  // structurally as `offHandExempt: <rank>` beside the free text that describes them:
  //   Knives  Rank 3 -- "Off-hand penalties do not apply when using a knife."   (Core p.141)
  //   War Fan Rank 3 -- "No off-hand penalty"                                    (Core p.142)
  // This is the same shape as Phase 1/2's dmgBonus / explodeOn / reductionMod: a declared field
  // is the authority, and offHandMasteryAudit() below cross-checks it against the printed text
  // so the two can never silently drift apart.
  //
  // SCOPE: a Skill mastery exempts the OFF-HAND penalty for a weapon of that skill. It does not
  // touch the main hand's -5, because RAW scopes it to "off-hand penalties".
  function getOffHandExemptRank(skillName){
    const skill = findSkill(skillName);
    const r = skill && skill.offHandExempt;
    return (typeof r === 'number' && r > 0) ? r : null;
  }
  function skillExemptsOffHand(skillName, skillRank){
    const need = getOffHandExemptRank(skillName);
    if(need === null) return false;
    return (parseInt(skillRank, 10) || 0) >= need;
  }
  // Every skill whose printed mastery text mentions an off-hand penalty must declare
  // offHandExempt at that rank, and vice versa. Returns the disagreements; the harness asserts
  // the list is empty. Exactly the role emphasisLibraryAudit() plays for Emphases.
  function offHandMasteryAudit(){
    const out = [];
    SKILL_LIBRARY.forEach(s=>{
      let printedRank = null;
      Object.keys(s.m || {}).forEach(k=>{
        if(/off-hand penalt/i.test(String(s.m[k]))) printedRank = parseInt(k, 10);
      });
      const declared = (typeof s.offHandExempt === 'number') ? s.offHandExempt : null;
      if(printedRank !== declared){
        out.push({ skill: s.name, printed: printedRank, declared: declared });
      }
    });
    return out;
  }

  // ---- Exemption source 2: Techniques ------------------------------------------------------
  // A School Technique can remove dual-wield penalties outright. The canonical case is the
  // Mirumoto Bushi Rank 1, Way of the Dragon: "When wielding a katana in your main hand and a
  // wakizashi in your off hand, you suffer no penalties of any kind for dual wielding..."
  //
  // Techniques on this sheet are free text (name + description in #techList), so this reads
  // them. The patterns are deliberately FEW and deliberately SPECIFIC -- each one matches a
  // phrase that can only be talking about dual-wielding, so an unrelated Technique cannot
  // accidentally switch the penalty off. Anything the list does not recognise is handled by the
  // same mechanism from the other direction: the text is the player's, so adding the words
  // "no off-hand penalty" to a Technique's description turns the exemption on. That is the
  // escape hatch, and it needs no new control and no new save field.
  //
  // NOT Feature 8. This reads a Technique's stated effect on the off-hand penalty and nothing
  // else. Niten's extra attacks, its Armor TN bonus and its katana/wakizashi requirement are
  // Mirumoto automation and are explicitly out of scope here.
  const OFF_HAND_TECHNIQUE_PATTERNS = Object.freeze([
    { id:'noPenaltyDualWield',
      re:/no penalt(?:y|ies)[^.]{0,40}dual[- ]?wield/i,
      what:'no penalties of any kind for dual wielding' },
    { id:'noPenaltyTwoWeapons',
      re:/no penalt(?:y|ies)[^.]{0,40}(?:two|both) weapons/i,
      what:'no penalty for wielding two weapons' },
    { id:'offHandIgnored',
      re:/off[- ]?hand penalt(?:y|ies)[^.]{0,30}(?:do(?:es)? not apply|no longer apply|are ignored|is ignored)/i,
      what:'off-hand penalties do not apply' },
    { id:'noOffHandPenalty',
      re:/no off[- ]?hand penalt(?:y|ies)/i,
      what:'no off-hand penalty' },
  ]);
  // Reads the character's own Technique list. Returns the FIRST match, so the reported source is
  // the Technique the player can actually point at.
  function getDualWieldTechniqueExemption(){
    const entries = Array.from(document.querySelectorAll('#techList .entry'));
    for(const div of entries){
      const nameEl = div.querySelector('.en-name');
      const descEl = div.querySelector('.en-desc');
      const name = nameEl ? String(nameEl.value || '') : '';
      const text = name + ' — ' + (descEl ? String(descEl.value || '') : '');
      for(const p of OFF_HAND_TECHNIQUE_PATTERNS){
        if(p.re.test(text)){
          return { exempt:true, source: name.trim() || 'a Technique', matched: p.id, what: p.what };
        }
      }
    }
    return { exempt:false, source:null, matched:null, what:null };
  }

  // ---- The penalties themselves. PURE, given the row's Size and the character's Skill Rank ---
  // Size is read from the ROW, not from the library entry, because the Size box is editable and
  // the rule keys off the weapon actually being swung.
  function weaponSizeForRow(row, entry){
    const el = (row && row.querySelector) ? row.querySelector('.wp-size') : null;
    const typed = el ? String(el.value || '').trim() : '';
    return typed || (entry && entry.size) || '';
  }
  function offHandPenaltyForSize(size){
    const key = String(size || '').trim();
    const match = Object.keys(OFF_HAND_RULES.offHandBySize)
      .filter(k=>k.toLowerCase() === key.toLowerCase())[0];
    return match ? OFF_HAND_RULES.offHandBySize[match] : OFF_HAND_RULES.offHandDefault;
  }
  // What an OFF-HAND attack with this weapon costs. Exemptions are checked in the order a player
  // would think of them: a Technique that removes every dual-wield penalty first, then the
  // weapon's own Skill mastery.
  function getOffHandPenalty(entry, skillName, skillRank, size){
    // PART C FEATURE 8 - Mirumoto's Way of the Dragon waives every dual-wield penalty, so it is
    // checked before the narrower Technique and Skill-mastery waivers below.
    const mirumoto = (typeof getMirumotoPenaltyWaiver === 'function') ? getMirumotoPenaltyWaiver() : null;
    if(mirumoto){
      return { penalty:0, size:size||'', exempt:true, exemptSource:mirumoto.source,
               exemptKind:'school', why:mirumoto.why };
    }
    const tech = getDualWieldTechniqueExemption();
    if(tech.exempt){
      return { penalty:0, size:size||'', exempt:true, exemptSource:tech.source,
               exemptKind:'technique', why:tech.what };
    }
    if(skillExemptsOffHand(skillName, skillRank)){
      return { penalty:0, size:size||'', exempt:true,
               exemptSource:skillName + ' Rank ' + getOffHandExemptRank(skillName),
               exemptKind:'mastery', why:'off-hand penalties do not apply to this Skill' };
    }
    return { penalty: offHandPenaltyForSize(size), size:size||'', exempt:false,
             exemptSource:null, exemptKind:null, why:null };
  }
  // What the MAIN hand pays for having a second weapon in the other one. Only a Technique
  // exemption reaches this -- a Skill mastery is scoped to off-hand penalties by RAW.
  function getMainHandPenalty(){
    // PART C FEATURE 8 - "no penalties of any kind" reaches the main hand as well, which a Skill
    // mastery deliberately does not (RAW scopes those to off-hand penalties).
    const mirumoto = (typeof getMirumotoPenaltyWaiver === 'function') ? getMirumotoPenaltyWaiver() : null;
    if(mirumoto){
      return { penalty:0, exempt:true, exemptSource:mirumoto.source,
               exemptKind:'school', why:mirumoto.why };
    }
    const tech = getDualWieldTechniqueExemption();
    if(tech.exempt){
      return { penalty:0, exempt:true, exemptSource:tech.source,
               exemptKind:'technique', why:tech.what };
    }
    return { penalty: OFF_HAND_RULES.mainHandPenalty, exempt:false,
             exemptSource:null, exemptKind:null, why:null };
  }

  // ---- Armor TN. RAW: two weapons add your Insight Rank ------------------------------------
  // Additive with armour, with every stance effect and with Void, exactly like those are with
  // each other. Returns 0 whenever the character is not actually holding two weapons, which is
  // what makes this invisible to a single-weapon character.
  function getDualWieldArmorTNBonus(){
    if(!OFF_HAND_RULES.armorTNFromInsightRank) return 0;
    if(!isDualWieldActive()) return 0;
    const el = document.getElementById('f_insightRank');
    return Math.max(0, parseInt((el && el.value) || '0', 10) || 0);
  }

  // ---- P2 contributor ----------------------------------------------------------------------
  // Priority 35: after stance (30), before wounds (40). Addition is commutative so this is
  // presentation only -- it puts the handedness penalty next to the other to-hit adjustments in
  // the breakdown bar rather than down among the wound and Void lines.
  //
  // Both penalties are totalDelta, not rolledDelta, because RAW says "-5 to the roll" and "-5 to
  // attacks" -- a flat adjustment to the total, the same channel Feature 1 uses for firing into
  // melee. Folding it into `bonus` is what makes it survive every click on a die.
  //
  // NEGATIVE SCOPE, in one place: attack rolls only, and only when the roll declared a hand.
  // ctx.hand is set by performWeaponAttack() and is null for every single-weapon attack, so a
  // character who has never marked a row "Off-hand" can never reach a line of this.
  function offHandPreRollModifiers(ctx){
    if(!ctx || ctx.kind !== ROLL_KINDS.ATTACK) return null;
    if(!ctx.hand) return null;
    if(ctx.hand === 'off'){
      const p = getOffHandPenalty(ctx.weaponEntry, ctx.skillName, ctx.skillRank, ctx.weaponSize);
      if(!p.penalty){
        return p.exempt
          ? [{ source:'offhand', label:'Off-hand', informational:true,
               display:'no penalty (' + p.exemptSource + ')' }]
          : null;
      }
      return [{ source:'offhand', label:'Off-hand attack', totalDelta:p.penalty,
                note:(p.size ? p.size.toLowerCase() + ' weapon in the off hand' : 'off-hand weapon') }];
    }
    // main hand -- only while a second weapon is actually held
    const m = getMainHandPenalty();
    if(!m.penalty){
      return m.exempt
        ? [{ source:'offhand', label:'Dual-wielding', informational:true,
             display:'no penalty (' + m.exemptSource + ')' }]
        : null;
    }
    return [{ source:'offhand', label:'Main hand', totalDelta:m.penalty,
              note:'a second weapon is held in the off hand' }];
  }
  registerPreRollModifier('offhand', 35, offHandPreRollModifiers);

  // ---- Attack-hand prompt (spec 4.3) -------------------------------------------------------
  // Self-contained Promise modal, the same pattern promptWeaponRange() and promptArrowSelection()
  // use. Resolves 'main' | 'off' | 'both', or null when the player backs out -- and backing out
  // cancels the attack outright: no roll, no ammunition spent, no state touched.
  //
  // Option D in the brief's RAW summary -- Techniques that grant combined or chained attacks --
  // is Mirumoto Niten's territory and is explicitly Feature 8. The three options below are RAW's
  // baseline, and a fourth slots in beside them without reshaping anything.
  function promptAttackHand(pair){
    return new Promise(resolve=>{
      const overlay = document.getElementById('handPickModalOverlay');
      const body = document.getElementById('handPickBody');
      const sub = document.getElementById('handPickSubtitle');
      let done = false;
      const finish = value => {
        if(done) return;
        done = true;
        overlay.style.display = 'none';
        body.innerHTML = '';
        resolve(value);
      };
      const ctxMain = resolveWeaponContext(pair.main);
      const ctxOff = resolveWeaponContext(pair.off);
      const mainPen = getMainHandPenalty();
      const offPen = getOffHandPenalty(ctxOff.entry, ctxOff.skillName, ctxOff.skillRank,
                                       weaponSizeForRow(pair.off, ctxOff.entry));
      const money = p => p.exempt
        ? 'No penalty — ' + p.exemptSource
        : (p.penalty ? p.penalty + ' to the total of the attack roll' : 'No penalty');

      sub.textContent = 'Wielding ' + ctxMain.label + ' and ' + ctxOff.label +
        ' · Armor TN +' + getDualWieldArmorTNBonus() + ' while both are held';
      body.innerHTML =
        '<button type="button" class="hand-opt" id="handOptMain">' +
          '<span class="hand-opt-title">Main hand — ' + escHtml(ctxMain.label) + '</span>' +
          '<span class="hand-opt-note">' + escHtml(money(mainPen)) + '</span>' +
        '</button>' +
        '<button type="button" class="hand-opt" id="handOptOff">' +
          '<span class="hand-opt-title">Off hand — ' + escHtml(ctxOff.label) + '</span>' +
          '<span class="hand-opt-note">' + escHtml(money(offPen)) + '</span>' +
        '</button>' +
        '<button type="button" class="hand-opt" id="handOptBoth">' +
          '<span class="hand-opt-title">Both weapons</span>' +
          '<span class="hand-opt-note">Two separate attack rolls — the main hand first, ' +
            'then the off hand from a button on the result</span>' +
        '</button>';
      body.querySelector('#handOptMain').addEventListener('click', ()=>finish('main'));
      body.querySelector('#handOptOff').addEventListener('click', ()=>finish('off'));
      body.querySelector('#handOptBoth').addEventListener('click', ()=>finish('both'));
      const closeBtn = document.getElementById('handPickClose');
      const onClose = ()=>{ closeBtn.removeEventListener('click', onClose); finish(null); };
      closeBtn.addEventListener('click', onClose);
      overlay.style.display = 'flex';
    });
  }

  // ---- "Both weapons" is two rolls, sequenced by the player --------------------------------
  // POST-RENDER DECORATOR, the pattern Feature 0 established: showRollResult() has just painted
  // the main-hand result and is not modified, wrapped or called differently; this injects one
  // control into the finished modal. Clicking it runs the off-hand attack as a full first-class
  // attack -- its own range prompt, its own ammunition prompt, its own modifier bar -- which
  // repaints the modal body and takes this bar with it.
  //
  // Sequencing them this way rather than rolling both at once is deliberate: the player gets to
  // finish with the first result (click dice to change what is kept, spend an Emphasis re-roll)
  // before the second roll replaces it.
  function attachOffHandFollowUp(pair){
    const body = document.getElementById('rollModalBody');
    if(!body || !pair) return null;
    const ctxOff = resolveWeaponContext(pair.off);
    const p = getOffHandPenalty(ctxOff.entry, ctxOff.skillName, ctxOff.skillRank,
                                weaponSizeForRow(pair.off, ctxOff.entry));
    const bar = document.createElement('div');
    bar.className = 'offhand-followup';
    bar.id = 'offHandFollowUpBar';
    bar.innerHTML =
      '<span class="offhand-followup-text">Off hand still to strike: <b>' +
        escHtml(ctxOff.label) + '</b> · ' +
        escHtml(p.exempt ? 'no penalty (' + p.exemptSource + ')' : p.penalty + ' to the total') +
      '</span>' +
      '<button type="button" class="ghost" id="offHandRollBtn">Roll off-hand attack</button>';
    body.appendChild(bar);
    bar.querySelector('#offHandRollBtn').addEventListener('click', async ()=>{
      // Disabled immediately: performWeaponAttack awaits its prompts, and without this a second
      // click during that await would start a second off-hand attack (and spend a second arrow).
      const btn = bar.querySelector('#offHandRollBtn');
      btn.disabled = true;
      await performWeaponAttack(resolveWeaponContext(pair.off), { hand:'off', pair:pair });
    });
    return bar;
  }

  // ---- Row rendering -----------------------------------------------------------------------
  // The selector is hidden outright until there are two weapons to choose between, because spec
  // 2.5 says a one-weapon character must not even see the dual-wield UI. Every row's note also
  // depends on every OTHER row's handedness (whether a pair exists at all), which is why
  // setRowHand() refreshes the whole table rather than just its own row.
  function updateHandSelector(tr){
    const wrap = tr.querySelector('.wp-hand-row');
    const sel = tr.querySelector('.wp-hand');
    if(!wrap || !sel) return;
    wrap.style.display = (weaponRows().length >= 2) ? 'flex' : 'none';
    sel.value = normaliseHand(sel.value);
    wrap.classList.toggle('is-offhand', sel.value === 'off');
  }
  // The note bits for one row: what hand it is in, what that costs, and which Technique or
  // mastery is paying for it. Returns [] unless the character is actually dual-wielding, so a
  // single-weapon row's note line is byte-identical to Feature 6's.
  function handednessNoteBits(tr, entry, skillName, skillRank){
    if(!isDualWieldActive()) return [];
    const pair = getDualWieldPair(tr);
    if(!pair) return [];
    const hand = getRowHand(tr);
    const bits = [];
    if(hand === 'off'){
      const p = getOffHandPenalty(entry, skillName, skillRank, weaponSizeForRow(tr, entry));
      bits.push('<span class="wp-note-hand">Off hand · ' +
        (p.penalty ? p.penalty + ' to attack totals' : 'no off-hand penalty') + '</span>');
      if(p.exempt) bits.push('<span class="wp-note-exempt">Off-hand penalty waived by ' +
        escHtml(p.exemptSource) + '</span>');
    } else {
      const m = getMainHandPenalty();
      bits.push('<span class="wp-note-hand">Main hand · ' +
        (m.penalty ? m.penalty + ' to attack totals while a second weapon is held'
                   : 'no dual-wield penalty') + '</span>');
      if(m.exempt) bits.push('<span class="wp-note-exempt">Dual-wield penalties waived by ' +
        escHtml(m.exemptSource) + '</span>');
    }
    const tn = getDualWieldArmorTNBonus();
    if(tn) bits.push('<span class="wp-note-hand">Two weapons · Armor TN +' + tn +
      ' (Insight Rank)</span>');
    // PART C FEATURE 8 - the Mirumoto waiver and its Armor TN bonus. Returns [] when dormant.
    if(typeof mirumotoNoteBits === 'function') bits.push.apply(bits, mirumotoNoteBits());
    return bits;
  }
  // ============ END PART C FEATURE 7 ============
