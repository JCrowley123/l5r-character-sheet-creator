  // ============ BUGFIX — MASTERY RANK LABELLING ============
  // Name the Rank that GRANTED a mastery effect, not the Rank the character happens to hold.
  //
  // Reported from a real device on 17 September 2026, during Feature 4.5.12's Bishamon pass, on a
  // Kenjutsu Rank 8 character: the weapon breakdown read
  //
  //     "Kenjutsu Rank 8 mastery +1k0 -> 6k2."
  //
  // Kenjutsu's masteries sit at Ranks 3 and 7. Rank 8 grants nothing at all. The ARITHMETIC was
  // right the whole time -- the +1k0 is Rank 3's, correctly applied and correctly totalled -- so
  // this is a labelling defect, and it is the labelling defect that matters most: it names a rank
  // that grants nothing as the source of a bonus, which invites the reader to conclude either that
  // the sheet invented a mastery or that their own rank does something it does not.
  //
  // WHY THIS IS NOT A STRING CHANGE. getDamageBonus() and getReductionModifier() (both in
  // 020-lib-skills-advantages.js) SUM every threshold at or below the character's rank and return
  // {roll, keep} / a number with no record of which thresholds contributed. getExplosionThreshold()
  // returns only the lowest unlocked VALUE, likewise unattributed. None of the three can say which
  // rank you have to thank. So the granting rank has to be re-derived.
  //
  // WHAT IT IS DERIVED FROM, AND WHY THAT IS CHEAP. The thresholds are the KEYS of the skill's own
  // dmgBonus / explodeOn / reductionMod tables, and getStructuredMastery() already returns those
  // tables whole -- it exists because Phase 3's (Part G) "Show Structured Mastery" debug button
  // needs the raw shape. Nothing new is looked up; this reads the same table the resolved values
  // were resolved from. Exactly three skills in SKILL_LIBRARY carry structured mastery at all
  // (Heavy Weapons, Kenjutsu, Ninjutsu) -- measured, not assumed.
  //
  // THE WORDING IS TAKEN FROM THE SHEET, NOT INVENTED. getWeaponDamageDice()'s own section 1
  // already names a granting rank, 85 lines above the defect:
  //     `${entry.name} at ${skillName} Rank ${bestThreshold}+: DR becomes ...`
  // So "Rank <threshold>" is this function's established way of saying it and is what is used here.
  //
  // THREE THINGS MEASURED BEFORE ANY OF THIS WAS WRITTEN, each of which shaped it:
  //
  //  1. AT THE THRESHOLD RANK THE OLD LABEL WAS ACCIDENTALLY RIGHT. A Kenjutsu Rank 3 character saw
  //     "Kenjutsu Rank 3 mastery", which is correct, because the rank held and the rank granting
  //     coincide. Only Ranks ABOVE a threshold expose the defect. Every check in this fix's harness
  //     that could be satisfied by the coincidence is driven at a rank above the threshold.
  //  2. NINJUTSU ACCUMULATES TWO THRESHOLDS INTO ONE LINE. At Rank 7+ its +1k1 is Rank 3's +1k0
  //     plus Rank 7's +0k1 -- measured live. There is no single granting rank to name, so the
  //     plural form exists for exactly this case rather than as a hypothetical.
  //  3. EXPLOSION THRESHOLDS DO NOT ACCUMULATE, THEY SUPERSEDE. getExplosionThreshold() keeps the
  //     LOWEST value unlocked, so where two thresholds are both unlocked only the one supplying
  //     that value is in force, and naming both would be wrong. No skill ships two today; the rule
  //     is implemented and tested against an injected skill rather than left for whoever adds one.
  //
  // This fix REWRITES LINES IN PLACE rather than regenerating section 4's output. A line it does
  // not recognise -- the masteryDamageExempt notice, which carries no rank, or anything a later
  // phase adds -- is left exactly as it was found. Regenerating would have meant duplicating the
  // trunk's own sentences here and keeping the copies in step forever.
  const MASTERY_RANK_LABEL_FIX_ENABLED = true;

  // Every threshold at or below `rank` that actually contributes something, lowest first. Used for
  // the two tables that ACCUMULATE (dmgBonus, reductionMod), where every unlocked threshold is
  // still part of the printed total.
  function masteryContributingRanks(table, rank){
    if(!table) return null;
    rank = parseInt(rank||0,10);
    const out = [];
    Object.keys(table).forEach(key=>{
      const threshold = parseInt(key,10);
      if(!isFinite(threshold) || rank < threshold) return;
      const value = table[key];
      const contributes = (value && typeof value === 'object')
        ? !!((value.roll||0) || (value.keep||0))
        : !!value;
      if(contributes) out.push(threshold);
    });
    return out.sort((a,b)=>a-b);
  }
  // The threshold(s) supplying the explosion value actually IN FORCE. Deliberately not the same
  // rule as above: getExplosionThreshold() returns the lowest unlocked value, so a higher, less
  // generous threshold that is also unlocked is superseded and must not be named.
  function masteryExplosionRanks(table, rank){
    if(!table) return null;
    rank = parseInt(rank||0,10);
    let lowest = null;
    Object.keys(table).forEach(key=>{
      const threshold = parseInt(key,10);
      if(!isFinite(threshold) || rank < threshold) return;
      const value = table[key];
      if(lowest===null || value < lowest) lowest = value;
    });
    if(lowest===null) return [];
    const out = [];
    Object.keys(table).forEach(key=>{
      const threshold = parseInt(key,10);
      if(!isFinite(threshold) || rank < threshold) return;
      if(table[key] === lowest) out.push(threshold);
    });
    return out.sort((a,b)=>a-b);
  }
  // "Kenjutsu mastery from Rank 3" / "Ninjutsu mastery from Ranks 3, 7" / "Kenjutsu mastery" when
  // the granting rank is not knowable.
  //
  // WHY "FROM RANK N" AND NOT "RANK N MASTERY". Correcting the number alone was not enough, and the
  // reporter said so after seeing it: "Kenjutsu Rank 3 mastery" still parses as "[Kenjutsu Rank 3]
  // mastery", so a Rank 8 character reading it has to work out for themselves whether that 3 is
  // their rank or the threshold. Naming the SOURCE removes the question rather than moving it --
  // the rank is stated as where the effect came from, which is the thing that was actually unclear.
  //
  // Their own suggestion was "Kenjutsu Rank 3 mastery unlocked:", which is equally unambiguous;
  // "from Rank 3" is a word shorter and says the same thing, and they asked for the concise form.
  // Swapping one for the other is a change to this function alone.
  //
  // The bare-name form is not a fallback to the old behaviour: it drops the rank claim entirely
  // rather than naming one that might be wrong.
  function masteryRankPhrase(skillName, ranks){
    if(!ranks || !ranks.length) return skillName + ' mastery';
    if(ranks.length === 1) return skillName + ' mastery from Rank ' + ranks[0];
    return skillName + ' mastery from Ranks ' + ranks.join(', ');
  }
  // Rewrites section 4's breakdown lines in place, from index `from` onward.
  //
  // ctx.matched is load-bearing. getWeaponDamageDice() falls back to getLegacyMasteryBonus()'s
  // free-text-derived values whenever structured and legacy disagree, and those carry no
  // thresholds -- so on a mismatch the printed numbers did NOT come from the table this reads, and
  // claiming any rank from it would be a guess. The bare-name form is used instead.
  function masteryRankLabelRewrite(breakdown, from, ctx){
    if(!MASTERY_RANK_LABEL_FIX_ENABLED) return 0;
    if(!Array.isArray(breakdown) || !ctx) return 0;
    const skillName = String(ctx.skillName || '');
    if(!skillName) return 0;
    const start = Math.max(0, parseInt(from||0,10) || 0);
    const oldPrefix = skillName + ' Rank ' + ctx.skillRank;
    const raw = ctx.matched ? getStructuredMastery(skillName)
                            : { dmgBonus:null, explodeOn:null, reductionMod:null };
    let rewritten = 0;
    for(let i=start; i<breakdown.length; i++){
      const line = String(breakdown[i]);
      // ANCHORED AT THE START, AND THE SLICE BELOW USES THE SAME FIXED OFFSET. Do not "simplify"
      // this into a match-anywhere search that slices from the match position: a line quoting a
      // mastery sentence mid-text ("Kata: while active, Kenjutsu Rank 8 mastery +1k0 is doubled.")
      // would then be rewritten with everything before the match silently deleted. The harness's
      // MR-GUARD-03 was added after an isolated revert proved that shape was unprotected.
      if(line.indexOf(oldPrefix) !== 0) continue;   // exempt notice, or a line this fix does not own
      let rest = line.slice(oldPrefix.length);
      let ranks;
      if(rest.indexOf(' mastery +') === 0){
        ranks = masteryContributingRanks(raw.dmgBonus, ctx.skillRank);
        // The phrase now carries the word "mastery" itself, so this sentence's own copy of it is
        // dropped and a colon put in its place -- matching the punctuation the other two already
        // use. " mastery +1k0 -> 6k2." becomes ": +1k0 -> 6k2.".
        rest = ':' + rest.slice(' mastery'.length);
      }
      else if(rest.indexOf(': damage dice explode on') === 0)   ranks = masteryExplosionRanks(raw.explodeOn, ctx.skillRank);
      else if(rest.indexOf(": target's Reduction") === 0)       ranks = masteryContributingRanks(raw.reductionMod, ctx.skillRank);
      else continue;
      const replaced = masteryRankPhrase(skillName, ranks) + rest;
      if(replaced !== line){ breakdown[i] = replaced; rewritten++; }
    }
    return rewritten;
  }
