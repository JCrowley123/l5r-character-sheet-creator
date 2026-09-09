  // ============ PART C FEATURE 3: WOUND PENALTIES ============
  // HOUSE RULE, DELIBERATELY CHOSEN. RAW makes wound penalties a TN INCREASE -- WOUND_LEVELS in
  // this sheet quotes it directly: "Increase the TN of all rolls made by +3 while Nicked." This
  // build instead applies the same magnitude as a FLAT NEGATIVE MODIFIER TO THE ROLL TOTAL, at
  // the project owner's explicit instruction, because the sheet does not model a target TN for
  // anything except Spell Casting Rolls and so has nothing to raise.
  //
  // The two are NOT mathematically equivalent -- raising a TN by 3 and lowering a roll by 3 give
  // the same pass/fail outcome only when a TN exists at all. They diverge on opposed rolls and on
  // any roll where the total itself matters. This comment exists so nobody later mistakes the
  // behaviour below for the book's mechanic.
  //
  // ARCHITECTURE: a pure P2 contributor using totalDelta only. It never touches rolled or kept
  // dice, so the Ten Dice Rule is completely unaffected -- a wound penalty cannot change the size
  // of a pool, only the number it adds up to. P2 folds totalDelta into `bonus`, so die-click
  // recomputation stays correct with no extra work here.
  const WOUND_PENALTIES = Object.freeze({
    'Healthy':    0,
    'Nicked':    -3,
    'Grazed':    -5,
    'Hurt':     -10,
    'Injured':  -15,
    'Crippled': -20,
    'Down':     -40,
    // "Out" is not in the supplied table because an unconscious character is not making rolls.
    // It is mapped to Down's -40 rather than 0 so that, if something does roll at that level, it
    // is not accidentally treated as unpenalised.
    'Out':      -40,
  });
  // Reuses the sheet's existing wound machinery -- computeWoundThresholds() and WOUND_LEVELS are
  // the same pair renderWounds() uses to draw the track, so the penalty can never disagree with
  // the level highlighted on screen. No new state, no new field.
  function getCurrentWoundLevelName(){
    const earthEl = document.getElementById('ring_earth');
    const takenEl = document.getElementById('f_woundsTaken');
    if(!earthEl || !takenEl) return 'Healthy';
    const earth = parseInt(earthEl.value||'2',10);
    const taken = parseInt(takenEl.value||'0',10);
    const thresholds = computeWoundThresholds(earth);
    let idx = thresholds.findIndex(t=>taken<=t);
    if(idx === -1) idx = WOUND_LEVELS.length - 1;
    const lvl = WOUND_LEVELS[idx];
    return (lvl && lvl.name) ? lvl.name : 'Healthy';
  }
  function getWoundPenalty(){
    const p = WOUND_PENALTIES[getCurrentWoundLevelName()];
    return (typeof p === 'number') ? p : 0;
  }
  // Applies to every roll kind EXCEPT damage. A damage roll is not a Skill Roll and is not
  // something a wound makes you worse at delivering once you have already connected -- and
  // Part B's damage path is deliberately left untouched by this feature.
  function woundPreRollModifiers(ctx){
    if(!ctx) return null;
    if(ctx.kind === ROLL_KINDS.DAMAGE) return null;
    const penalty = getWoundPenalty();
    if(!penalty) return null;                 // Healthy is a strict no-op: no modifier, no bar
    return [{ source:'wounds', label:'Wound Penalty', totalDelta: penalty,
              note: getCurrentWoundLevelName() }];
  }
  // Priority 40 -- after range (20) and stance (30), so the breakdown bar reads in the order the
  // effects were introduced. Addition is commutative, so this is presentation only.
  registerPreRollModifier('wounds', 40, woundPreRollModifiers);
  // ============ END PART C FEATURE 3 ============
