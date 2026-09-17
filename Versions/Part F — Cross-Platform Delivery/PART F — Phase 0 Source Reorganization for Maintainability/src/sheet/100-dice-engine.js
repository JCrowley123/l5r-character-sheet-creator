  // ---------- Dice roller: X d10, keep Y, exploding 10s ----------
  // L5R 4e "Ten Dice Rule": no pool ever rolls or keeps more than 10 dice. Excess rolled dice
  // convert into kept dice at a 2-for-1 ratio, but only if there's still room under the kept cap.
  // Any dice that can't convert that way — because the kept cap is already full, or there's an
  // odd one left over — become a flat +2 bonus to the roll's total instead.
  function applyTenDiceRule(rolled, kept){
    rolled = Math.max(0, Math.round(rolled||0));
    kept = Math.max(0, Math.round(kept||0));
    if(rolled<=10 && kept<=10){
      return { rolled, kept, bonus:0, debugExplanation:`${rolled}k${kept} — neither pool exceeds 10, Ten Dice Rule does not apply.` };
    }

    const steps = [];
    const keptCapped = Math.min(kept, 10);
    const keptRoomInitial = Math.max(0, 10-kept);         // room under the kept cap, based on the raw kept value
    const excessRolled = Math.max(0, rolled-10);           // rolled dice beyond the cap
    const pairsAvailable = Math.floor(excessRolled/2);     // pairs the excess rolled dice could form (2-for-1)
    const oddLeftoverDie = excessRolled % 2;                // a lone unpaired die, if excessRolled is odd
    const pairsUsed = Math.min(pairsAvailable, keptRoomInitial);
    let newKept = keptCapped + pairsUsed;

    // Step 1 — convert rolled dice above 10 at a 2:1 ratio into kept dice (before anything else).
    if(excessRolled>0){
      steps.push(`Step 1: rolled ${rolled} exceeds 10 by ${excessRolled} — ${pairsAvailable} pair(s) of excess dice convert 2:1 into +${pairsUsed} kept die(s)` +
        (pairsUsed<pairsAvailable ? ` (kept only had room for ${pairsUsed} of ${pairsAvailable} pairs)` : '') +
        `, kept now ${newKept}.`);
    } else {
      steps.push(`Step 1: rolled dice (${rolled}) do not exceed 10 — no 2:1 conversion needed.`);
    }

    // A lone unpaired die, or a pair that had nowhere to go, only becomes a +2-per-die bonus once
    // kept is fully saturated (=10) — meaning there's genuinely no room left to absorb it. If kept
    // still has room after using the available pairs, an unpaired single die is simply discarded:
    // it takes two excess rolled dice to make one kept die, and a lone spare buys nothing.
    let bonusFromRolled = 0;
    const unusedPairs = pairsAvailable - pairsUsed;
    if(newKept>=10){
      bonusFromRolled = (unusedPairs*2 + oddLeftoverDie) * 2;
      if(oddLeftoverDie || unusedPairs>0){
        steps.push(`Step 2: kept is fully saturated at 10, so the ${unusedPairs*2+oddLeftoverDie} rolled die(s) that couldn't convert become a flat +${bonusFromRolled} instead.`);
      } else {
        steps.push(`Step 2: no leftover rolled dice to discard or convert to bonus.`);
      }
    } else if(oddLeftoverDie){
      steps.push(`Step 2: 1 rolled die is left over after 2:1 pairing (an odd excess) — kept still has room, so it is simply discarded.`);
    } else {
      steps.push(`Step 2: no odd rolled die left over — nothing discarded.`);
    }

    const bonusFromKept = Math.max(0, kept-10)*2;          // kept dice beyond the cap always become bonus
    if(rolled>10 && kept>10){
      steps.push(`Step 3: both pools exceed 10 — kept dice above 10 (${kept-10}) each become +2 (total +${bonusFromKept}); pools become 10k10.`);
    } else if(bonusFromKept>0){
      steps.push(`Step 3: kept (${kept}) exceeds 10 by ${kept-10} — each becomes a flat +2, total +${bonusFromKept}.`);
    } else {
      steps.push(`Step 3: not both pools exceed 10 — no additional flat-bonus conversion from kept.`);
    }

    const newRolled = Math.min(rolled,10);
    newKept = Math.min(newKept, newRolled); // never keep more dice than are rolled
    const totalBonus = bonusFromRolled+bonusFromKept;
    steps.push(`Final: ${newRolled}k${newKept}${totalBonus?` + ${totalBonus}`:''}.`);
    return { rolled:newRolled, kept:newKept, bonus: totalBonus, debugExplanation: steps.join(' ') };
  }
  // Dedicated Ten Dice Rule entry point built directly from Skill Rank + Trait Rank, per the
  // standard L5R roll formula: X (rolled) = Skill Rank + Trait Rank, Y (kept) = Trait Rank.
  // Returns { finalRolled, finalKept, bonus, debugExplanation }.
  function rollSkillTenDice(skillRank, traitRank){
    skillRank = Math.max(0, Math.round(skillRank||0));
    traitRank = Math.max(0, Math.round(traitRank||0));
    const rolled = skillRank + traitRank;
    const kept = traitRank;
    const adj = applyTenDiceRule(rolled, kept);
    const baseStep = `Base roll: Skill Rank ${skillRank} + Trait Rank ${traitRank} = ${rolled} rolled, keep ${kept} (Trait Rank) → ${rolled}k${kept}.`;
    return {
      finalRolled: adj.rolled,
      finalKept: adj.kept,
      bonus: adj.bonus,
      debugExplanation: `${baseStep} ${adj.debugExplanation}`,
    };
  }
  // Formats a roll as the player would actually roll it after the Ten Dice Rule —
  // e.g. "10k5" or "10k10 +12" — for display anywhere a roll notation is shown.
  function formatRollNotation(rawNum, rawKeep){
    if(rawNum<=0) return '—';
    const adj = applyTenDiceRule(rawNum, rawKeep);
    let s = `${adj.rolled}k${adj.kept}`;
    if(adj.bonus) s += ` +${adj.bonus}`;
    return s;
  }
  let currentRollBonus = 0;
  // TN-based rolls (currently only Spell Casting Rolls) set these via showRollResult()'s
  // optional tnConfig arg; every other roll leaves currentRollTN null, which hides the
  // pass/fail readout entirely so nothing about non-TN rolls changes.
  let currentRollTN = null;
  let currentRollSuccessText = 'Success.';
  let currentRollFailText = 'Failure.';
  // Optional callback set via tnConfig.onClose (see showRollResult/castMahoSpell) — fired once,
  // with the roll's final pass/fail state, when the Roll modal is closed (✕ button or clicking
  // outside it). Needed because a TN roll's pass/fail state isn't settled until the player is
  // done manually toggling which dice are kept (see updateRollKeepState) — there's no earlier
  // "roll complete" moment to hook into. Cleared after firing so it never leaks into the next,
  // unrelated roll.
  let currentRollOnClose = null;
  function rollExplodingD10(explode){
    if(explode===undefined) explode = true;
    let total = 0, chain = [], r;
    do{
      r = 1 + Math.floor(Math.random()*10);
      chain.push(r);
      total += r;
    } while(explode && r===10);
    return {total, chain};
  }
  function rollDicePool(rawNumDice, rawKeepDice, explode){
    if(explode===undefined) explode = true;
    rawNumDice = Math.max(0, Math.round(rawNumDice||0));
    rawKeepDice = Math.max(0, Math.round(rawKeepDice||0));
    const adj = applyTenDiceRule(rawNumDice, rawKeepDice);
    const dice = [];
    for(let i=0;i<adj.rolled;i++) dice.push(rollExplodingD10(explode));
    const sorted = dice.slice().sort((a,b)=>b.total-a.total);
    const kept = sorted.slice(0, adj.kept);
    const diceTotal = kept.reduce((s,d)=>s+d.total,0);
    const total = diceTotal + adj.bonus;
    return {
      rawNumDice, rawKeepDice,
      numDice: adj.rolled, keepDice: adj.kept, bonus: adj.bonus,
      sorted, kept, total, explode,
      tenDiceRuleApplied: (rawNumDice>10 || rawKeepDice>10),
      debugExplanation: adj.debugExplanation,
    };
  }
  function getTraitValueByName(name){
    if(!name) return 0;
    const token = name.split(/\s+or\s+/i)[0].trim();
    if(/^void$/i.test(token)) return parseInt(document.getElementById('ring_void').value||'2',10);
    const norm = token.charAt(0).toUpperCase()+token.slice(1).toLowerCase();
    const id = TRAIT_ID_MAP[norm] || TRAIT_ID_MAP[token];
    if(id){ const el = document.getElementById(id); if(el) return parseInt(el.value||'2',10); }
    return 0;
  }
  function showRollResult(title, result, tnConfig){
    currentRollBonus = result.bonus || 0;
    currentRollTN = (tnConfig && typeof tnConfig.tn === 'number') ? tnConfig.tn : null;
    currentRollSuccessText = (tnConfig && tnConfig.successText) || 'Success.';
    currentRollFailText = (tnConfig && tnConfig.failText) || 'Failure.';
    currentRollOnClose = (tnConfig && tnConfig.onClose) || null;
    document.getElementById('rollModalTitle').textContent = title;
    let notationText;
    if(result.numDice<=0){
      notationText = 'No dice — check Trait/Rank fields';
    } else if(result.tenDiceRuleApplied){
      const rawNotation = `${result.rawNumDice}k${result.rawKeepDice}`;
      const adjNotation = `${result.numDice}k${result.keepDice}${result.bonus?` +${result.bonus}`:''}`;
      notationText = `${rawNotation} → ${adjNotation} (Ten Dice Rule)`;
    } else {
      notationText = `${result.numDice}k${result.keepDice}`;
    }
    document.getElementById('rollModalNotation').textContent = notationText;
    const body = document.getElementById('rollModalBody');
    const diceHtml = result.sorted.map((d,i)=>{
      const preKept = i < result.keepDice; // pre-selects the top N as a starting point — click any die to change it
      const chainNote = d.chain.length>1 ? `<span class="chain">${d.chain.join('→')}</span>` : '';
      return `<div class="roll-die${preKept?' kept':''}" data-total="${d.total}">${d.total}${chainNote}</div>`;
    }).join('');
    const bonusNote = result.bonus
      ? `<div class="roll-note" style="color:var(--shu-dark);font-weight:600;">Ten Dice Rule bonus: +${result.bonus} (already included in the total above)</div>`
      : '';
    const debugNote = (result.tenDiceRuleApplied && result.debugExplanation)
      ? `<details class="roll-note" style="margin-top:4px;"><summary style="cursor:pointer;">Ten Dice Rule breakdown</summary><div style="margin-top:4px;">${escHtml(result.debugExplanation)}</div></details>`
      : '';
    const tnNote = currentRollTN!==null
      ? `<div class="roll-tn-note">Target Number: ${currentRollTN}</div>`
      : '';
    body.innerHTML = `
      <div class="roll-total" id="rollTotalDisplay">0</div>
      ${tnNote}
      <div class="roll-result-note" id="rollResultNote"></div>
      ${bonusNote}
      <div class="roll-keep-note" id="rollKeepNote"></div>
      <div class="roll-dice-row" id="rollDiceRow">${diceHtml || '<span class="roll-note">Nothing to roll.</span>'}</div>
      <div class="roll-note">Click a die to keep or drop it. ${result.explode===false ? 'This is an Unskilled Roll — 10s do not explode.' : '10s explode and reroll, adding onto the same die.'}${result.keepDice?` Suggested keep: ${result.keepDice}.`:''}</div>
      ${debugNote}
    `;
    document.querySelectorAll('#rollDiceRow .roll-die').forEach(el=>{
      el.addEventListener('click', ()=>{
        el.classList.toggle('kept');
        updateRollKeepState(result.keepDice);
      });
    });
    updateRollKeepState(result.keepDice);
    document.getElementById('rollModalOverlay').style.display = 'flex';
    // PART I PHASE 4.5 - Luck decorates every normal result with its whole-roll reroll action.
    // Guarded so removing the feature leaves this shared dice display untouched.
    if(typeof onAdvConfigRollResult === 'function') onAdvConfigRollResult(title, result);
  }
  function updateRollKeepState(targetKeep){
    const diceEls = Array.from(document.querySelectorAll('#rollDiceRow .roll-die'));
    const keptEls = diceEls.filter(el=>el.classList.contains('kept'));
    const total = keptEls.reduce((s,el)=>s+parseInt(el.dataset.total,10),0) + currentRollBonus;
    const totalEl = document.getElementById('rollTotalDisplay');
    if(totalEl) totalEl.textContent = total;
    const note = document.getElementById('rollKeepNote');
    if(note){
      const bonusPart = currentRollBonus ? ` + ${currentRollBonus} bonus` : '';
      note.textContent = diceEls.length ? `Keeping ${keptEls.length} of ${diceEls.length}${targetKeep?` (suggested ${targetKeep})`:''}${bonusPart}` : '';
      note.style.color = (targetKeep && keptEls.length!==targetKeep) ? 'var(--shu)' : 'var(--ink-soft)';
    }
    // Pass/fail readout for TN-based rolls (see currentRollTN) — recomputed on every dice
    // toggle so it always reflects whichever dice are currently kept, per spec: sum kept
    // dice vs TN happens "after selection", and selection can change any time before the
    // player closes the modal.
    const resultNote = document.getElementById('rollResultNote');
    if(resultNote){
      if(currentRollTN!==null && diceEls.length){
        const success = total >= currentRollTN;
        resultNote.textContent = success ? currentRollSuccessText : currentRollFailText;
        resultNote.className = 'roll-result-note ' + (success ? 'success' : 'failure');
      } else {
        resultNote.textContent = '';
        resultNote.className = 'roll-result-note';
      }
    }
  }
  // PART G PHASE 3 - async because rollWithModifiers() now awaits the roll preview. Nothing
  // calls rollSkill() for a return value, so this is invisible to its callers.
  async function rollSkill(name, traitName, rank){
    const traitVal = getTraitValueByName(traitName);
    // X = Skill Rank + Trait Rank, Y = Trait Rank (unskilled: roll and keep Trait alone).
    let numDice, keepDice;
    if(rank<=0){ numDice = traitVal; keepDice = traitVal; }
    else { numDice = traitVal + rank; keepDice = traitVal; }
    // PART C P2 — routed through the pre-roll modifier pipeline. With an empty registry
    // this is a mathematical no-op and behaves exactly as it did in Part B / Feature 0.
    const rolled = await rollWithModifiers(name || 'Skill Roll',
      // PART G PHASE 4 - traitVal is the number this function just added; declaring it means
      // the breakdown states the working rather than re-deriving it.
      makeRollContext(ROLL_KINDS.SKILL, { skillName:name, traitName, skillRank:rank,
        traitValue:traitVal }),
      numDice, keepDice);
    // PART G PHASE 3 - null means the preview was cancelled, so no roll happened and there is
    // nothing for the Emphasis decorator to attach to.
    if(!rolled) return;
    // PART C FEATURE 0 — post-render decorator hook. Unskilled rolls (rank <= 0) are
    // filtered out inside skillRollEmphasisContext(), which returns hasEmphasis:false.
    // The FINAL kept count is passed so the keep-suggestion accounts for any modifier.
    attachEmphasisReroll(skillRollEmphasisContext(name, rank, rolled.finalKept));
  }
  function rollNotation(label, notation){
    const m = String(notation||'').match(/(\d+)\s*k\s*(\d+)/i);
    if(!m){ setStatus('Enter a roll as XkY (e.g. 3k2) before rolling.'); return; }
    const numDice = parseInt(m[1],10), keepDice = parseInt(m[2],10);
    // PART C FEATURE 3 - routed through P2 so wound penalties reach manual rolls.
    rollWithModifiers(label, makeRollContext(ROLL_KINDS.MANUAL, { notation }), numDice, keepDice);
  }

  // ---- PHASE 4 (mastery refactor): shadow-mode getWeaponDamageDice() stub -----------------
  // Strict-phase-order note: the real Weapons System (WEAPON_LIBRARY, makeWeaponRow linking,
  // rollWeaponAttack/rollWeaponDamage) is a Part B deliverable that does not exist yet. Per
  // the confirmed plan, this phase does NOT pull that work forward — getWeaponDamageDice()
  // below is a STUB whose only purpose is to give Phase 4's shadow-mode logic something to
  // execute against. It is never called by any roller, button, or save/load code. Nothing
  // about "Kenjutsu 7 exploding on 9" changes as a result of this phase — that fix still
  // lands only once Part B wires a real function into the Weapons tab's roll buttons.
  //
  // Shadow-mode needs TWO independently-derived values to compare (structured vs. free-text).
  // No code anywhere has ever parsed the free-text `m` strings into numbers — they've only
  // ever been prose in the Skill Info modal — so there is no pre-existing "legacy" computation
  // to compare against. getLegacyMasteryBonus() below is a small, HAND-AUTHORED function that
  // manually encodes the same bonuses a human reads out of the `m` text, written independently
  // from (i.e. not by calling) the Phase 2 helpers, so the comparison is meaningful rather than
  // circular. It intentionally duplicates a little logic — that duplication is temporary scaffolding
  // for this one phase, not a new permanent subsystem, and Phase 6 is expected to delete this
  // whole block once free-text mastery is retired and there is nothing left to shadow-compare against.
  function getLegacyMasteryBonus(skillName, rank){
    // Hand-verified against SKILL_LIBRARY's `m` text at the time of Phase 1, for exactly the
    // three skills Phase 1 gave structured fields to. Deliberately does NOT call findSkill(),
    // getDamageBonus(), getExplosionThreshold(), or getReductionModifier() — if this function
    // silently read the structured data, agreement with it would be guaranteed and the shadow
    // comparison below would prove nothing.
    rank = parseInt(rank||0,10);
    const n = String(skillName||'').trim().toLowerCase();
    if(n==='kenjutsu'){
      return {
        dmgBonus: rank>=3 ? {roll:1,keep:0} : {roll:0,keep:0}, // "+1k0 sword damage" at R3
        explodeOn: rank>=7 ? 9 : null,                          // "explode on 9 as well as 10" at R7
        reductionMod: 0,
      };
    }
    if(n==='heavy weapons'){
      return {
        dmgBonus: {roll:0,keep:0},
        explodeOn: rank>=7 ? 9 : null,                          // "explode on 9 as well as 10" at R7
        reductionMod: rank>=3 ? -2 : 0,                         // "Target's Reduction treated as 2 lower" at R3
      };
    }
    if(n==='ninjutsu'){
      let roll=0, keep=0;
      if(rank>=3){ roll+=1; keep+=0; }                          // "+1k0 damage" at R3
      if(rank>=7){ roll+=0; keep+=1; }                           // "Another +0k1 (total +1k1)" at R7
      return { dmgBonus:{roll,keep}, explodeOn:null, reductionMod:0 };
    }
    return { dmgBonus:{roll:0,keep:0}, explodeOn:null, reductionMod:0 };
  }
  // ---- END PHASE 4 additions --------------------------------------------------------------

  // ================= PART B: CORE WEAPONS SYSTEM — pure calculation functions =================
  // getWeaponDamageDice() below REPLACES the Phase 4 stub that used to live here. The stub's
  // safety contract is preserved verbatim — structured mastery is applied ONLY when it agrees
  // with the independently hand-authored getLegacyMasteryBonus() above, otherwise the legacy
  // values are used and `source` reports the fallback. What changes is that the function now
  // has a real WEAPON_LIBRARY entry to work from, real Traits, real ammunition, and a real
  // caller (rollWeaponDamage), instead of being unreachable scaffolding.
  //
  // Both functions in this block are PURE with respect to their own logic: they compute and
  // return, they never write to the DOM and never roll dice. They do READ character state
  // (Traits via getTraitValueByName, Skill Ranks via getCharacterSkillRank) — that is the
  // sheet's DOM-as-model convention, the same one effectiveSchoolRankForSpell() follows.

  // Attack roll for a Weapon Skill: X = Skill Rank + Trait Rank, Y = Trait Rank, exactly the
  // standard L5R Skill Roll that rollSkill() already implements — deliberately identical, so a
  // weapon attack and a manual Skills-tab roll of the same skill can never disagree.
  // Unskilled (no row for that skill, or Rank 0) rolls and keeps Trait alone, again matching
  // rollSkill(). Ninjutsu's 'Agility or Reflexes' resolves through getTraitValueByName(), which
  // takes the first-named Trait — the sheet's existing convention for either/or Traits.
  function getWeaponAttackDice(weaponSkillName){
    const lib = findSkill(weaponSkillName);
    const traitName = lib ? lib.trait : '';
    const traitValue = getTraitValueByName(traitName);
    const rank = getCharacterSkillRank(weaponSkillName);
    const unskilled = rank <= 0;
    const numDice = unskilled ? traitValue : traitValue + rank;
    const keepDice = traitValue;
    const steps = unskilled
      ? [`Unskilled: no ranks in ${weaponSkillName||'that Skill'} — roll and keep ${traitName||'Trait'} ${traitValue} alone → ${numDice}k${keepDice}.`]
      : [`${weaponSkillName} Rank ${rank} + ${traitName} ${traitValue} = ${numDice} rolled, keep ${traitValue} (${traitName}) → ${numDice}k${keepDice}.`];
    return {
      numDice, keepDice,
      skillName: weaponSkillName || '',
      skillRank: rank,
      traitName, traitValue,
      unskilled,
      notation: formatRollNotation(numDice, keepDice),
      debugExplanation: steps.join(' '),
    };
  }

  // Damage roll for a weapon. Assembly order (each step additive, each recorded in `breakdown`):
  //   1. Base DR — the weapon's printed damage, or its damageOverride row when the wielder's
  //      Skill Rank has reached one (blowgun only).
  //   2. Ammunition — bows contribute no DR of their own; the arrow supplies it.
  //   3. Trait — Strength for melee/thrown (default), Perception for gunpowder weapons, the
  //      bow's own Strength rating (capped by the wielder's Strength) for bows, nothing at all
  //      for flat-DR weapons (cannon, nageteppo, blowgun).
  //   4. Structured mastery — the Phase 1/2 dmgBonus/explodeOn/reductionMod, gated by the
  //      Phase 4 shadow comparison, and skipped entirely for masteryDamageExempt weapons whose
  //      printed rules already include that scaling.
  // `opts.arrow` selects a non-default arrow; Part C's Ammo Tracking will pass it from the row.
  function getWeaponDamageDice(weaponEntry, skillRank, opts){
    opts = opts || {};
    const entry = weaponEntry || {};
    const skillName = entry.skill || '';
    skillRank = Math.max(0, parseInt(skillRank||0,10) || 0);
    const breakdown = [];

    // 1. Base DR (printed, or the damageOverride row for the highest threshold reached).
    let base = entry.damage || {roll:0,keep:0};
    if(entry.damageOverride){
      let bestThreshold = null;
      Object.keys(entry.damageOverride).forEach(key=>{
        const t = parseInt(key,10);
        if(skillRank >= t && (bestThreshold===null || t > bestThreshold)) bestThreshold = t;
      });
      if(bestThreshold!==null){
        base = entry.damageOverride[bestThreshold];
        breakdown.push(`${entry.name} at ${skillName} Rank ${bestThreshold}+: DR becomes ${base.roll}k${base.keep}.`);
      }
    }
    let numDice = base.roll, keepDice = base.keep;
    if(!entry.damageOverride || !breakdown.length){
      breakdown.push(`${entry.name||'Weapon'} base DR ${base.roll}k${base.keep}.`);
    }

    // 2. Ammunition — bows only.
    let arrow = null;
    if(entry.ammo === 'Arrow'){
      arrow = findArrow(opts.arrow || DEFAULT_ARROW) || findArrow(DEFAULT_ARROW);
      if(arrow){
        numDice += arrow.damage.roll;
        keepDice += arrow.damage.keep;
        breakdown.push(`${arrow.name} arrow DR ${arrow.damage.roll}k${arrow.damage.keep} → ${numDice}k${keepDice}.`);
      }
    }

    // 3. Trait contribution.
    let traitName = null, traitValue = 0;
    if(entry.bowStrength !== undefined && entry.bowStrength !== null){
      const wielderStrength = getTraitValueByName('Strength');
      traitValue = Math.min(entry.bowStrength, wielderStrength);
      traitName = 'Bow Strength';
      numDice += traitValue;
      const capNote = wielderStrength < entry.bowStrength
        ? ` (bow rating ${entry.bowStrength} capped by your Strength ${wielderStrength})`
        : '';
      breakdown.push(`Bow Strength +${traitValue}${capNote} → ${numDice}k${keepDice}.`);
    } else if(entry.dmgTrait !== null){
      traitName = entry.dmgTrait || 'Strength';
      traitValue = getTraitValueByName(traitName);
      numDice += traitValue;
      breakdown.push(`${traitName} +${traitValue} → ${numDice}k${keepDice}.`);
    } else {
      breakdown.push('Flat DR — no Trait is added to this weapon.');
    }

    // PART I FEATURE 4.5.12 BEGIN damage-strength
    // Bishamon (D04b) reduces the STRENGTH CONTRIBUTION to weapon damage by one effective rank.
    // It sits here, after section 3 has chosen its branch, because that is the only place the
    // three cases the audit asks to be checked separately are already told apart: `traitName` is
    // 'Bow Strength', 'Strength', 'Perception' or null, and the fragment keys on it. Placing the
    // hook here rather than at the two getTraitValueByName() reads above keeps this block purely
    // ADDITIVE -- no existing line is rewritten, which is what lets this phase's removal rebuild
    // byte-identical.
    //
    // This is NOT a pre-roll modifier, and it cannot be: rollWeaponDamage() rolls these numbers
    // directly and only consults the pipeline afterwards to DECORATE the modal. A modifier here
    // would print a penalty the dice never took. Measured; see 209.98's own note 1.
    //
    // Guarded, so deleting the fragment makes this a no-op rather than a ReferenceError.
    if(typeof fortuneBishamonAdjustDamage === 'function'){
      const bishamon = fortuneBishamonAdjustDamage(entry, traitName, traitValue);
      if(bishamon){
        traitValue = bishamon.traitValue;
        numDice += bishamon.rolledDelta;
        breakdown.push(bishamon.note + ' \u2192 ' + numDice + 'k' + keepDice + '.');
      }
    }
    // END BISHAMON4512 damage-strength
    // BUGFIX MASTERYRANK BEGIN mastery-label-start
    // Where section 4's own breakdown lines begin. Captured here rather than counted backwards
    // from the end of the array, so the rewrite below can never reach a line an earlier section
    // pushed. See the Mastery Rank Labelling folder under Versions/.
    const masteryBreakdownStart = breakdown.length;
    // END MASTERYRANK mastery-label-start
    // 4. Structured mastery, behind the Phase 4 shadow-comparison guard (unchanged contract).
    const structured = {
      dmgBonus: getDamageBonus(skillName, skillRank),
      explodeOn: getExplosionThreshold(skillName, skillRank),
      reductionMod: getReductionModifier(skillName, skillRank),
    };
    const legacy = getLegacyMasteryBonus(skillName, skillRank);
    const matched =
      structured.dmgBonus.roll === legacy.dmgBonus.roll &&
      structured.dmgBonus.keep === legacy.dmgBonus.keep &&
      structured.explodeOn === legacy.explodeOn &&
      structured.reductionMod === legacy.reductionMod;
    // "Apply structured mastery ONLY when identical": on a match the structured values drive
    // the pool; on a mismatch structured mastery is NOT trusted and the legacy (free-text-
    // derived) values are used instead, with `source` reporting the fallback so a caller or
    // the test harness can surface the divergence rather than silently using an unverified
    // number. Skills with no structured fields at all agree trivially (both all-zero).
    const chosen = matched ? structured : legacy;
    if(entry.masteryDamageExempt){
      breakdown.push(`${skillName} mastery damage bonus not applied — ${entry.name}'s own printed rules already account for it.`);
    } else if(chosen.dmgBonus.roll || chosen.dmgBonus.keep){
      numDice += chosen.dmgBonus.roll;
      keepDice += chosen.dmgBonus.keep;
      breakdown.push(`${skillName} Rank ${skillRank} mastery +${chosen.dmgBonus.roll}k${chosen.dmgBonus.keep} → ${numDice}k${keepDice}.`);
    }
    if(chosen.explodeOn) breakdown.push(`${skillName} Rank ${skillRank}: damage dice explode on ${chosen.explodeOn} as well as 10.`);
    if(chosen.reductionMod) breakdown.push(`${skillName} Rank ${skillRank}: target's Reduction treated as ${Math.abs(chosen.reductionMod)} ${chosen.reductionMod<0?'lower':'higher'} (applied manually — Armor and Reduction stay manual on this sheet).`);
    // BUGFIX MASTERYRANK BEGIN mastery-label-rewrite
    // The three lines above print `Rank ${skillRank}` -- the rank the CHARACTER holds -- as though
    // it were the rank that GRANTED the effect. It is not: Kenjutsu's masteries are at 3 and 7, so
    // a Rank 8 character was told "Kenjutsu Rank 8 mastery +1k0". The numbers were always right;
    // only the attribution was wrong. Rewritten in place from the skill's own threshold keys.
    //
    // Guarded, so deleting the fragment leaves the trunk's own wording standing rather than
    // throwing -- and leaves it standing in a function every weapon on the sheet goes through.
    if(typeof masteryRankLabelRewrite === 'function'){
      masteryRankLabelRewrite(breakdown, masteryBreakdownStart, {
        skillName, skillRank, matched,
      });
    }
    // END MASTERYRANK mastery-label-rewrite

    return {
      numDice, keepDice,
      explodeOn: chosen.explodeOn,   // null = ordinary explode-on-10 only
      reductionMod: chosen.reductionMod,
      traitName, traitValue,
      arrow: arrow ? arrow.name : null,
      skillName, skillRank,
      matched,
      source: matched ? 'structured' : 'legacy-fallback',
      structured, legacy,
      notation: formatRollNotation(numDice, keepDice),
      breakdown,
      debugExplanation: breakdown.join(' '),
    };
  }

  // ---- Exploding-threshold dice, as an ISOLATED SIBLING of the dice engine ----------------
  // Heavy Weapons 7 and Kenjutsu 7 both read "damage dice explode on 9 as well as 10", which
  // needs a lower explosion threshold than the hard-coded 10 in rollExplodingD10(). The build
  // rules forbid modifying the dice engine (rollDicePool / showRollResult), so nothing here
  // touches either: these two functions sit alongside them, reuse the existing, unmodified
  // applyTenDiceRule(), and return the exact same result shape rollDicePool() returns — so
  // showRollResult() consumes their output without a single change. Every existing roll on the
  // sheet still goes through rollDicePool() and is bit-for-bit unaffected.
  function rollExplodingD10At(threshold){
    // threshold===null/undefined means "no explosion below 10"; 10 is the ordinary behaviour.
    const explodeAt = (threshold===null || threshold===undefined) ? 10 : Math.max(2, Math.min(10, threshold));
    let total = 0, chain = [], r;
    do{
      r = 1 + Math.floor(Math.random()*10);
      chain.push(r);
      total += r;
    } while(r >= explodeAt);
    return {total, chain};
  }
  function rollWeaponDicePool(rawNumDice, rawKeepDice, explodeOn){
    rawNumDice = Math.max(0, Math.round(rawNumDice||0));
    rawKeepDice = Math.max(0, Math.round(rawKeepDice||0));
    const adj = applyTenDiceRule(rawNumDice, rawKeepDice);
    const dice = [];
    for(let i=0;i<adj.rolled;i++) dice.push(rollExplodingD10At(explodeOn));
    const sorted = dice.slice().sort((a,b)=>b.total-a.total);
    const kept = sorted.slice(0, adj.kept);
    const diceTotal = kept.reduce((s,d)=>s+d.total,0);
    return {
      rawNumDice, rawKeepDice,
      numDice: adj.rolled, keepDice: adj.kept, bonus: adj.bonus,
      sorted, kept, total: diceTotal + adj.bonus, explode: true,
      // PART I PHASE 4.5 - Luck must reroll the whole original roll. Preserve the lower
      // explosion threshold here so a mastered weapon's Luck reroll uses the same dice rule.
      explodeOn:explodeOn,
      tenDiceRuleApplied: (rawNumDice>10 || rawKeepDice>10),
      debugExplanation: adj.debugExplanation,
    };
  }

  // ================= PART B: CORE WEAPONS SYSTEM — orchestration wrappers =================
  // Thin by design, exactly like performSpellCastRoll(): resolve context, call the pure
  // function, hand the result to the untouched showRollResult(). No rules logic lives here.

  // Accepts either a weapons-table <tr> or a weapon name/key string, and normalises both into
  // the same context object. A row that is NOT linked to the library (a legacy free-text row,
  // or a custom weapon the player typed by hand) resolves with entry:null — callers fall back
  // to the pre-Part-B rollNotation() behaviour for those, so old saves keep working untouched.
  function resolveWeaponContext(weaponRowOrKey){
    if(typeof weaponRowOrKey === 'string'){
      const entry = findWeapon(weaponRowOrKey);
      return {
        row: null, entry,
        label: entry ? entry.name : weaponRowOrKey,
        skillName: entry ? entry.skill : '',
        skillRank: entry ? getCharacterSkillRank(entry.skill) : 0,
        // PART C FEATURE 6 - a keyless (string) lookup has no row to read, so only the arrow
        // currently in flight can apply.
        arrow: getLastArrowUsed(),
        // PART C FEATURE 7 - and no row means no declared hand: a keyless lookup is always a
        // plain single-weapon attack.
        hand: DEFAULT_HAND, weaponSize: entry ? entry.size : '',
        manualAttack:false, manualDamage:false,
      };
    }
    const row = weaponRowOrKey;
    if(!row || !row.querySelector) return { row:null, entry:null, label:'Weapon', skillName:'', skillRank:0, arrow:null, manualAttack:false, manualDamage:false };
    const keyEl = row.querySelector('.wp-key');
    const baseEntry = keyEl ? findWeapon(keyEl.value) : null;
    // PART I PHASE 4.5 - Tagged Sacred Weapon rows preserve their normal linked weapon
    // calculation, with only the printed Clan profile substituted. Guarded for clean removal.
    const entry = (typeof advConfigSacredWeaponEntryForRow === 'function')
      ? advConfigSacredWeaponEntryForRow(row, baseEntry) : baseEntry;
    const nameEl = row.querySelector('.wp-name');
    const skillEl = row.querySelector('.wp-skill');
    const skillName = (skillEl && skillEl.value.trim()) || (entry ? entry.skill : '');
    return {
      row, entry,
      label: (nameEl && nameEl.value.trim()) || (entry ? entry.name : 'Weapon'),
      skillName,
      skillRank: getCharacterSkillRank(skillName),
      // PART C FEATURE 6 - the arrow this roll uses: the one the last attack loosed, else the
      // one this row is loaded with, else none (and Part B falls back to DEFAULT_ARROW).
      arrow: getSelectedArrowForRow(row),
      // PART C FEATURE 7 - which hand this row is declared to be in, and the Size the penalty
      // is scaled by. Reading them here keeps the contributor pure with respect to its context.
      hand: getRowHand(row),
      weaponSize: weaponSizeForRow(row, entry),
      manualAttack: row.dataset.manualAttack === '1',
      manualDamage: row.dataset.manualDamage === '1',
    };
  }
  // PART C FEATURE 1 made this async so a ranged attack can await the range prompt. Everything
  // before the first `await` still runs synchronously, and a MELEE weapon never reaches an await
  // at all — so melee attacks open the roll modal in the same tick as the click, exactly as
  // before, and every pre-Feature-1 test that clicks a melee attack button is unaffected.
  async function rollWeaponAttack(weaponRowOrKey){
    const ctx = resolveWeaponContext(weaponRowOrKey);
    // Unlinked or manually-overridden rows keep the original free-text XkY behaviour verbatim.
    if(!ctx.entry || ctx.manualAttack){
      const notation = ctx.row ? ctx.row.querySelector('.wp-roll').value : '';
      rollNotation(ctx.label+' — Attack', notation);
      return;
    }
    // PART C FEATURE 7 - handedness. getDualWieldPair() returns null unless the player has
    // actually declared an off-hand weapon, and null takes the single-weapon path below with
    // hand:null -- no prompt, no penalty, and the same dice Feature 6 rolled.
    const pair = getDualWieldPair(ctx.row);
    if(!pair) return performWeaponAttack(ctx, { hand:null });
    const plan = await promptAttackHand(pair);
    if(!plan){ setStatus('Attack cancelled — no hand chosen.'); return false; }
    if(plan === 'main') return performWeaponAttack(resolveWeaponContext(pair.main), { hand:'main', pair });
    if(plan === 'off')  return performWeaponAttack(resolveWeaponContext(pair.off),  { hand:'off',  pair });
    // 'both' is two separate rolls. The main hand goes first; the off-hand roll is fired by a
    // control injected into the finished result, so the player can settle the first roll before
    // the second replaces it. A cancelled main-hand attack never offers the second.
    const struck = await performWeaponAttack(resolveWeaponContext(pair.main), { hand:'main', pair });
    if(struck) attachOffHandFollowUp(pair);
    return struck;
  }
  // One attack, with one weapon, in one hand. This is the entire pre-Feature-7 rollWeaponAttack()
  // body, unchanged except that it now records which hand it was made with and reports whether a
  // roll actually happened -- which is what lets the "both weapons" flow know not to offer the
  // second attack after the first was cancelled.
  async function performWeaponAttack(ctx, opts){
    opts = opts || {};
    const hand = opts.hand || null;
    if(!ctx.skillName){ setStatus('This weapon has no linked Weapon Skill to roll.'); return false; }
    const atk = getWeaponAttackDice(ctx.skillName);
    if(atk.numDice <= 0){ setStatus(`Set your ${atk.traitName||'Trait'} before rolling ${ctx.label}.`); return false; }
    // PART C FEATURE 7 - the hand is named in the title so a two-roll sequence is unambiguous.
    const handLabel = hand === 'off' ? ', off hand' : (hand === 'main' ? ', main hand' : '');
    const title = `${ctx.label} — Attack (${ctx.skillName}${atk.unskilled ? ', Unskilled' : ` ${atk.skillRank}`}${handLabel})`;
    // PART C FEATURE 1 — ranged weapons ask for the range first. Backing out of the prompt, or
    // an impossible shot, cancels the attack outright: no roll, no modal, no modifier, no state.
    // PART C FEATURE 2 - "Characters may not use the Full Attack Stance to deliver ranged
    // attacks." Refused before the range prompt so the player is not asked a pointless question.
    if(getCurrentStance() === 'Full Attack' && isRangedWeapon(ctx.entry)){
      await appAlert('The Full Attack Stance cannot be used to deliver ranged attacks.\n\n' +
                     'Change stance, or attack with a melee weapon.');
      setStatus('Attack cancelled \u2014 Full Attack forbids ranged attacks.');
      return false;
    }
    let rangeDecision = null;
    if(isRangedWeapon(ctx.entry)){
      rangeDecision = await promptWeaponRange(ctx.entry);
      if(!rangeDecision){ setStatus('Attack cancelled.'); return false; }
      const check = validateRangeAttack(atk.numDice, atk.keepDice, rangeDecision);
      if(!check.legal){
        await appAlert(check.message);
        setStatus('Attack cancelled — target out of range.');
        return false;
      }
    }
    // PART C FEATURE 6 — ammunition. Asked AFTER the range prompt on purpose: both prompts can
    // cancel the attack, but only this one has a side effect, so it must be the last thing the
    // player can back out of. Cancelling here spends nothing and rolls nothing (spec 5.2.D).
    // The prompt only appears once ammo tracking is active for this row, so a character who has
    // never put arrows in Equipment fires exactly as they did before Feature 6 existed.
    let arrowChoice = null;
    if(weaponUsesAmmo(ctx.entry) && ammoTrackingActive(ctx.row)){
      arrowChoice = await promptArrowSelection(ctx.entry);
      if(!arrowChoice){ setStatus('Attack cancelled — no arrow nocked.'); return false; }
      // spendArrow() checks the quantity before touching a single row, so a refusal here has
      // consumed nothing. Reachable if the quiver changed while the popup was open.
      if(!spendArrow(arrowChoice, 1)){
        await appAlert('You have no ' + arrowChoice + ' arrows left.');
        setStatus('Attack cancelled — out of ' + arrowChoice + '.');
        return false;
      }
      setLastArrowUsed(arrowChoice);
      setRowArrowType(ctx.row, arrowChoice);
      ctx.arrow = arrowChoice;
      if(ctx.row) refreshWeaponRow(ctx.row);
      setStatus(arrowChoice + ' loosed — ' + getArrowQuantity(arrowChoice) + ' left in your quiver.');
    }
    // PART C P2 — routed through the pre-roll modifier pipeline. The range decision travels in
    // the context, so the registered contributor stays pure and nothing leaks between rolls.
    const rolled = await rollWithModifiers(title,
      // PART G PHASE 4 - getWeaponAttackDice() already returned traitName/traitValue; they
      // were being dropped after the addition, and are now declared for the breakdown.
      makeRollContext(ROLL_KINDS.ATTACK, { skillName:ctx.skillName, weaponEntry:ctx.entry,
        skillRank:ctx.skillRank, unskilled:atk.unskilled, range:rangeDecision,
        traitName:atk.traitName, traitValue:atk.traitValue,
        arrow:arrowChoice,
        // PART C FEATURE 7 - null for a single-weapon attack, which is what makes the off-hand
        // contributor silent for every character who is not dual-wielding.
        hand:hand, weaponSize:ctx.weaponSize }),
      atk.numDice, atk.keepDice);
    // PART G PHASE 3 - cancelling the preview is one more way an attack can end without a roll,
    // alongside backing out of the range prompt or the arrow picker above. Returning false here
    // reuses this function's existing "a roll actually happened" contract, so Center's bonus is
    // not burned and the dual-wield follow-up (which awaits this boolean) correctly stands down.
    if(!rolled) return false;
    // PART C FEATURE 2 - Center's next-round bonus is "one roll", so it is spent only once a
    // roll has actually happened. A cancelled attack never reaches this line and never burns it.
    consumeCenterBonusIfApplied(rolled);
    renderStanceTiles();
    // PART C FEATURE 0 — post-render decorator hook. The wielded weapon resolves the
    // Emphasis unambiguously, so this never asks the player to pick one.
    attachEmphasisReroll(weaponAttackEmphasisContext(ctx.entry, ctx.skillName, rolled.finalKept));
    return true;   // PART C FEATURE 7 - a roll actually happened
  }
  function rollWeaponDamage(weaponRowOrKey){
    const ctx = resolveWeaponContext(weaponRowOrKey);
    if(!ctx.entry || ctx.manualDamage){
      const notation = ctx.row ? ctx.row.querySelector('.wp-dmg').value : '';
      rollNotation(ctx.label+' — Damage', notation);
      return;
    }
    const dmg = getWeaponDamageDice(ctx.entry, ctx.skillRank, { arrow: ctx.arrow });
    if(dmg.numDice <= 0){ setStatus(`${ctx.label} has no damage dice to roll — check your Traits.`); return; }
    const explodeNote = dmg.explodeOn ? `, explodes on ${dmg.explodeOn}+` : '';
    const title = `${ctx.label} — Damage (${ctx.skillName} ${ctx.skillRank}${explodeNote})`;
    // Only weapons whose mastery actually lowers the explosion threshold take the sibling
    // roller; everything else goes down the ordinary, untouched rollDicePool() path.
    const result = dmg.explodeOn
      ? rollWeaponDicePool(dmg.numDice, dmg.keepDice, dmg.explodeOn)
      : rollDicePool(dmg.numDice, dmg.keepDice);
    showRollResult(title, result);
    // PART I FEATURE 4.5.12 BEGIN damage-roll-note
    // Bishamon's reduction happens in getWeaponDamageDice() above, so by here the pool is ALREADY
    // one die short. Without this the player sees the smaller pool with nothing saying why --
    // found by a check written expecting to pass (F4512-ROLL-02).
    //
    // Why a plain .roll-note and not the modifier bar: attachRollModifierBreakdown() builds an
    // element with id='rollModifierBar', and Feature 4.5.6's ammo contributor already calls it
    // for a chosen arrow. A second call on a cursed bow shot with an arrow selected would put TWO
    // nodes with that id in the document, which the project's own build invariants forbid. And an
    // informational pre-roll modifier -- the other obvious route -- would need an eighth registry
    // seat, which Phase 1.5 (Part G) baselined at seven.
    //
    // showRollResult() assigns body.innerHTML above, so this append has to follow it, and does.
    if(typeof fortuneBishamonDamageRollNote === 'function'){
      fortuneBishamonDamageRollNote(dmg);
    }
    // END BISHAMON4512 damage-roll-note
    // PART C FEATURE 6 — name the arrow this roll used, then release it. The breakdown is a
    // post-render decoration: the pool ALREADY contains the arrow's DR (getWeaponDamageDice
    // added it), so the entry is informational and moves nothing. Clearing lastArrowUsed here
    // is what makes the NEXT attack's choice the one that counts. The row's .wp-arrow-type is
    // deliberately not cleared — it is the saved record of what this bow is loaded with.
    attachArrowDamageBreakdown(ctx, dmg, result);
    clearLastArrowUsed();
  }
  // ================= END PART B calculation + orchestration =================
