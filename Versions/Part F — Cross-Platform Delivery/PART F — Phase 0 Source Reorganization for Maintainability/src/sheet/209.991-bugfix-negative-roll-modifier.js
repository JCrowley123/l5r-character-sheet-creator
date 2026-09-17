  // ============ BUGFIX — NEGATIVE ROLL MODIFIER DISPLAY ============
  // A negative flat modifier was printed with a hardcoded "+" in front of it.
  //
  // Reported after Feature 4.5.9 (Doubt) shipped, and confirmed there as PRE-EXISTING rather
  // than that phase's: the roll modal's keep-note read
  //
  //     Keeping 3 of 5 (suggested 3) + -40 bonus
  //
  // on a wounded character with no Disadvantage configured at all. It has done this since Wound
  // Penalties (Part C, Feature 3) first produced a negative total modifier.
  //
  // WHAT `result.bonus` ACTUALLY IS, because the label is the whole defect. It carries TWO
  // unlike things summed into one number, which 130-round-and-pipeline.js's own block comment
  // already records:
  //   * the Ten Dice Rule's flat conversion bonus -- always >= 0, genuinely a bonus; and
  //   * the pre-roll pipeline's `totalDelta` -- wound penalties, firing into melee -10, Doubt's
  //     required Raise -- folded in there because updateRollKeepState() recomputes the total on
  //     EVERY die click, so a post-render tweak would be wiped by the next one.
  // So the number can be net positive or net negative, and the word in front of it has to follow.
  //
  // MEASURED BEFORE ANY OF THIS WAS WRITTEN -- and the report understated it. Three places format
  // that number with a hardcoded "+", and TWO of them are visible:
  //
  //   | site                          | with bonus = -40                          | visible? |
  //   |-------------------------------|-------------------------------------------|----------|
  //   | keep-note                     | "... (suggested 3) + -40 bonus"           | YES (reported)
  //   | notation line                 | "12k4 -> 10k5 +-40 (Ten Dice Rule)"       | YES (not reported)
  //   | "Ten Dice Rule bonus: +N" note| "Ten Dice Rule bonus: +-40 ..."           | NO
  //
  // THE THIRD ONE IS DELIBERATELY NOT FIXED, and that is a decision rather than an oversight.
  // `result.bonus` can only be negative when `totalDelta` is non-zero, and that is exactly the
  // condition under which attachRollModifierBreakdown() hides that note and renders an itemised
  // breakdown instead -- measured, both halves. Correcting only its SIGN would leave it saying
  // "Ten Dice Rule bonus: -40" about a wound penalty, which is a worse kind of wrong: correctly
  // punctuated and still false. NEGMOD-HIDDEN-01 pins that it stays hidden, so if a later phase
  // ever unhides it the suite says so rather than the player finding out.
  //
  // ALSO MEASURED AND DELIBERATELY UNTOUCHED: formatRollNotation() (100-dice-engine.js) has the
  // same `+${adj.bonus}` shape, but it reads applyTenDiceRule() DIRECTLY rather than the pipeline,
  // and every branch of that function builds its bonus from non-negative counts
  // (`bonusFromKept = Math.max(0, kept-10)*2`). It cannot go negative, so it is not a defect and
  // is not changed. Stated because the grep that finds two sites finds three.
  //
  // POSITIVE VALUES ARE UNCHANGED, BYTE FOR BYTE. "+ 12 bonus" and "+12" already read correctly,
  // so both helpers below reproduce the trunk's exact existing spacing on the positive branch.
  // That keeps the blast radius to the negative case alone, which is the whole defect.
  const NEGATIVE_ROLL_MOD_DISPLAY_FIX_ENABLED = true;

  // "+12" / "-40" (a real U+2212 MINUS SIGN, not a hyphen) for the roll NOTATION, where the
  // number sits bare against the pool: "10k5 -40". The signed-value shape is the sheet's own --
  // 090-table-rows-weapons.js formats a Reduction modifier exactly this way.
  function signedRollMod(n){
    n = parseInt(n, 10) || 0;
    // The kill-switch returns the TRUNK'S OWN pre-fix formatting rather than something
    // neutral, so a build with the fix switched off is byte-identical to the build from
    // before it existed. Written this way after an isolated revert found the switch was
    // DECORATIVE: neither helper consulted it, so flipping it changed nothing on screen.
    if(!NEGATIVE_ROLL_MOD_DISPLAY_FIX_ENABLED) return '+' + n;
    return (n < 0 ? '−' : '+') + Math.abs(n);
  }
  // "+ 12 bonus" / "- 40 penalty" for the KEEP-NOTE, where the number is read as a sentence.
  // The positive branch reproduces the trunk's own spacing exactly (see the note above).
  //
  // "penalty" rather than "bonus" is the point of the fix and not merely a sign correction: every
  // source of a negative totalDelta on this sheet is a penalty (wound penalties, firing into
  // melee, Doubt's required Raise), and a net-negative number is a penalty whatever mix produced
  // it. Naming it correctly is what stops the reader having to decode "+ -40 bonus".
  function rollTotalModNote(n){
    n = parseInt(n, 10) || 0;
    if(!NEGATIVE_ROLL_MOD_DISPLAY_FIX_ENABLED) return '+ ' + n + ' bonus';
    return n < 0 ? '− ' + Math.abs(n) + ' penalty' : '+ ' + n + ' bonus';
  }
