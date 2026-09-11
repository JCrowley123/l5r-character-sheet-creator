/* =============================================================================
   PART G — PHASE 1.5: ROLL PIPELINE CONSOLIDATION — REGRESSION BASELINE

     NODE_PATH=$(npm root -g) node qa/roll-pipeline-baseline.js <built-sheet.html>

   This phase changes no production code -- see this folder's README, "Why no
   fragment in Phase 0 was touched". Its entire deliverable is this harness:
   a regression baseline that calls every registered pre-roll modifier source
   directly through window.__L5R_TEST__ (the same seam Phase 0's own harness
   and Phase 1.6's wound-bar-harness use) and checks its output against
   values derived from the RAW rules each contributor's own source comment
   cites -- never a bare hardcoded number where the sheet's own exports can
   derive it instead (the wound checks read WOUND_PENALTIES itself, exactly
   as Phase 1.6's parity sweep read computeWoundThresholds/WOUND_LEVELS,
   rather than hardcoding "-5").

   WHAT THIS DOES NOT DO. It does not drive the UI -- no clicks, no dice
   rolls, no roll modal. registerPreRollModifier/getPreRollModifiers/
   applyPreRollModifiers are pure functions (see 130-round-and-pipeline.js),
   and the six contributor functions are pure with respect to the DOM state
   and ctx object they are handed. Testing them directly is both more
   reliable than driving the UI (no scroll-snap/.fill() flakiness -- see
   Phase 1.6's README for that lesson) and a closer match to "capture
   current dice-pool output", which is arithmetic, not pixels.

   Reads only. Never writes to the file it is given.
   ============================================================================= */

'use strict';

const { chromium } = require('playwright');
const path = require('path');
const { pathToFileURL } = require('url');

const LAUNCH = process.env.L5R_CHROME
  ? { executablePath: process.env.L5R_CHROME }
  : {};

const results = [];
const record = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};
const check = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  record(name, pass, pass ? String(actual) : `got=${JSON.stringify(actual)} want=${JSON.stringify(expected)}`);
};

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('usage: roll-pipeline-baseline.js <built-sheet.html>');
    process.exit(2);
  }

  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  await page.goto(pathToFileURL(path.resolve(file)).href);
  await page.waitForTimeout(300);

  // =========================================================================
  // 1. REGISTRY COMPLETENESS -- "every current modifier source is documented
  //    in the registry with no omissions" (roadmap validation suite, Phase 1.5)
  //    made executable rather than left as prose.
  // =========================================================================
  const registry = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    return T.PREROLL_MODIFIER_REGISTRY.map(m => ({ id: m.id, priority: m.priority }))
      .sort((a, b) => a.priority - b.priority);
  });
  // The SIX CORE contributors this phase originally baselined. Asserted separately from any
  // later phase's, so that a feature legitimately registering its own contributor shows up as
  // a new row to account for rather than as this check going red for the wrong reason.
  const CORE_IDS = ['range', 'arrow', 'stance', 'offhand', 'wounds', 'void'];
  const core = registry.filter(r => CORE_IDS.indexOf(r.id) !== -1);
  const extra = registry.filter(r => CORE_IDS.indexOf(r.id) === -1);

  check('the six core contributors are all present, in priority order',
    core,
    [
      { id: 'range', priority: 20 },
      { id: 'arrow', priority: 25 },
      { id: 'stance', priority: 30 },
      { id: 'offhand', priority: 35 },
      { id: 'wounds', priority: 40 },
      { id: 'void', priority: 50 },
    ]);

  // Phase 4.5 (Part I) registers `adv-config` for the three roll-effect Advantages (Chosen by
  // the Oracles, Friend of the Elements, Friendly Kami). It is the SEVENTH contributor, added
  // under an explicit ruling that this baseline may grow from six to seven -- see this phase's
  // README, "The seventh contributor". Asserted conditionally on that phase being in the build
  // rather than as a hard length === 7, so this suite reads the same against a build with
  // Phase 4.5 surgically removed as it does with it present. Any OTHER unexpected contributor
  // still fails here, which is the "no omissions" property this check exists for.
  const advConfigPresent = await page.evaluate(
    () => typeof window.__L5R_TEST__.resolveAdvDisadvEffect === 'function');
  check('the only contributor beyond the six is Phase 4.5 (Part I)’s, and only when present',
    extra,
    advConfigPresent ? [{ id: 'adv-config', priority: 60 }] : []);

  record('Emphasis re-roll is NOT a registry entry (post-render decorator — see README)',
    core.length === 6 && !registry.some(r => /emphasis/i.test(r.id)),
    JSON.stringify(registry.map(r => r.id)));

  // =========================================================================
  // 2. INDIVIDUAL CONTRIBUTORS, in isolation
  // =========================================================================

  // ---- void ---------------------------------------------------------------
  const voidK1 = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    T.setVoidPending({ k1: true });
    const mods = T.voidPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.ATTACK, {}));
    T.clearVoidPending();
    return mods;
  });
  check('void +1k1 contributes rolledDelta 1 / keptDelta 1',
    voidK1 && voidK1[0] && { r: voidK1[0].rolledDelta, k: voidK1[0].keptDelta },
    { r: 1, k: 1 });

  // BUGFIX (Void One-Roll Effects Not Mutually Exclusive): this check used to assert the
  // opposite of what it says below -- that a separate 'trait' key existed, was numerically
  // identical to 'k1', and carried its own label, on the strength of "RAW: separate choices."
  // That premise was wrong: RAW's actual text is "Gain a bonus of +1k1 to a Skill, Trait, Ring,
  // or Spell Casting roll" -- one effect naming which roll types it covers, not a menu with a
  // per-roll-type entry. Letting a player tick both 'k1' and 'trait' stacked +2k2 for two Void
  // Points. The fix merged them into the single 'k1' entry in VOID_SPEND_LIBRARY
  // (160-feat-void.js) and voidPreRollModifiers() no longer reads a 'trait' key at all -- so
  // the correct assertion now is that setting it contributes nothing, not that it contributes
  // something with its own label.
  const voidTraitVsK1 = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    T.setVoidPending({ trait: true });
    const mods = T.voidPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.ATTACK, {}));
    T.clearVoidPending();
    return mods;
  });
  check("a bare 'trait' pending flag contributes nothing -- it was merged into 'k1', not a second key",
    voidTraitVsK1, null);

  const voidSkill = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    T.setVoidPending({ skill: true });
    const mods = T.voidPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.SKILL, {}));
    T.clearVoidPending();
    return mods;
  });
  check('void +1 Skill Rank contributes rolledDelta 1 / keptDelta 0 and forces explodeOverride true',
    voidSkill && voidSkill[0] && { r: voidSkill[0].rolledDelta, k: voidSkill[0].keptDelta, e: voidSkill[0].explodeOverride },
    { r: 1, k: 0, e: true });

  const voidInit = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    document.getElementById('isCombatActive').value = '1';
    document.getElementById('voidInitSkirmish').value = '1';
    const mods = T.voidPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.INITIATIVE, {}));
    document.getElementById('voidInitSkirmish').value = '0';
    document.getElementById('isCombatActive').value = '0';
    return { mods, expected: T.VOID_EFFECT_VALUES.initiativeBonus };
  });
  check('void Initiative bonus (skirmish-wide) contributes totalDelta = VOID_EFFECT_VALUES.initiativeBonus',
    voidInit.mods && voidInit.mods[0] && voidInit.mods[0].totalDelta,
    voidInit.expected);

  const voidOnDamage = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    T.setVoidPending({ k1: true, trait: true, skill: true });
    const mods = T.voidPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.DAMAGE, {}));
    T.clearVoidPending();
    return mods;
  });
  check('void contributes nothing to a damage roll, even with every pending flag set (RAW: damage rolls may not be enhanced)',
    voidOnDamage, null);

  // ---- wounds ---------------------------------------------------------------
  const wounds = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    document.getElementById('f_woundsTaken').value = '7';
    const level = T.getCurrentWoundLevelName();
    const expectedPenalty = T.WOUND_PENALTIES[level];
    const modsSkill = T.woundPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.SKILL, {}));
    const modsDamage = T.woundPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.DAMAGE, {}));
    document.getElementById('f_woundsTaken').value = '0';
    return { level, expectedPenalty, skillDelta: modsSkill && modsSkill[0] && modsSkill[0].totalDelta, damageMods: modsDamage };
  });
  check(`wound penalty at "${wounds.level}" reaches a non-damage roll as totalDelta (matches WOUND_PENALTIES)`,
    wounds.skillDelta, wounds.expectedPenalty);
  check('wound penalty contributes nothing to a damage roll',
    wounds.damageMods, null);

  // ---- stance: Full Attack --------------------------------------------------
  const fullAttack = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    T.setCurrentStance('Full Attack');
    const onAttack = T.stancePreRollModifiers(T.makeRollContext(T.ROLL_KINDS.ATTACK, {}));
    const onSkill = T.stancePreRollModifiers(T.makeRollContext(T.ROLL_KINDS.SKILL, {}));
    T.setCurrentStance('Attack');
    return { onAttack, onSkill };
  });
  check('Full Attack stance contributes rolledDelta 2 / keptDelta 1 to an attack roll',
    fullAttack.onAttack && fullAttack.onAttack[0] && { r: fullAttack.onAttack[0].rolledDelta, k: fullAttack.onAttack[0].keptDelta },
    { r: 2, k: 1 });
  check('Full Attack stance contributes nothing to a non-attack, non-initiative roll',
    fullAttack.onSkill, null);

  // ---- stance: Center's next-round bonus -------------------------------------
  const center = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    T.resetCombatRound();
    T.setCombatRound(1);
    T.setCurrentStance('Center', { silent: true });
    T.advanceCombatRound(); // now round 2; round 1's ledger says "stance: Center"
    const voidRing = T.getRingValueByName('void');
    const onAttackBefore = T.stancePreRollModifiers(T.makeRollContext(T.ROLL_KINDS.ATTACK, {}));
    const onInitiative1 = T.stancePreRollModifiers(T.makeRollContext(T.ROLL_KINDS.INITIATIVE, {}));
    // consuming the ATTACK bonus must not touch the Initiative bonus (RAW: Initiative's is not
    // "one roll" -- it lasts the whole round, so it is deliberately never gated the same way).
    T.consumeCenterBonusIfApplied({ mods: onAttackBefore });
    const onAttackAfter = T.stancePreRollModifiers(T.makeRollContext(T.ROLL_KINDS.ATTACK, {}));
    const onInitiative2 = T.stancePreRollModifiers(T.makeRollContext(T.ROLL_KINDS.INITIATIVE, {}));
    T.setCurrentStance('Attack', { silent: true });
    T.resetCombatRound();
    return { voidRing, onAttackBefore, onAttackAfter, onInitiative1, onInitiative2 };
  });
  check("Center's next-round attack bonus is +1k1 plus the character's Void Ring on the total",
    center.onAttackBefore && center.onAttackBefore[0] &&
      { r: center.onAttackBefore[0].rolledDelta, k: center.onAttackBefore[0].keptDelta, t: center.onAttackBefore[0].totalDelta },
    { r: 1, k: 1, t: center.voidRing });
  check("Center's attack bonus is consumed by consumeCenterBonusIfApplied and does not reappear this round",
    center.onAttackAfter, null);
  check("Center's +10 Initiative bonus is NOT consumed by an attack roll (RAW: lasts the whole round, not one roll)",
    center.onInitiative1 && center.onInitiative1[0] && center.onInitiative1[0].totalDelta,
    10);
  check("Center's Initiative bonus is still present after the attack bonus was spent",
    center.onInitiative2 && center.onInitiative2[0] && center.onInitiative2[0].totalDelta,
    10);

  // ---- range ------------------------------------------------------------------
  const range = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const ctx = mode => T.makeRollContext(T.ROLL_KINDS.ATTACK, { range: mode });
    const within = T.getRangeModifiers(ctx({ mode: 'within' }));
    const beyond = T.getRangeModifiers(ctx({ mode: 'beyond', penaltyDice: 2, extraFeet: 75, listedRange: 100 }));
    const melee = T.getRangeModifiers(ctx({ mode: 'melee' }));
    const wrongKind = T.getRangeModifiers(T.makeRollContext(T.ROLL_KINDS.SKILL, { range: { mode: 'melee' } }));
    return { within, beyond, melee, wrongKind };
  });
  check('range: within listed range contributes nothing', range.within, null);
  check('range: beyond listed range contributes rolledDelta = -penaltyDice',
    range.beyond && range.beyond.rolledDelta, -2);
  check('range: firing into melee contributes totalDelta -10',
    range.melee && range.melee.totalDelta, -10);
  check('range contributes nothing outside an attack roll, even with a range decision present',
    range.wrongKind, null);

  // ---- offhand / dual-wield -----------------------------------------------
  const offhand = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const off = T.offHandPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.ATTACK, {
      hand: 'off', weaponEntry: null, skillName: 'Kenjutsu', skillRank: 0, weaponSize: 'Medium',
    }));
    const main = T.offHandPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.ATTACK, { hand: 'main' }));
    const noHand = T.offHandPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.ATTACK, {}));
    return { off, main, noHand, rules: T.OFF_HAND_RULES };
  });
  check('off-hand attack with an un-exempted Medium weapon contributes totalDelta = offHandBySize.Medium',
    offhand.off && offhand.off[0] && offhand.off[0].totalDelta,
    offhand.rules.offHandBySize.Medium);
  check('main-hand attack while dual-wielding (no exemption) contributes totalDelta = mainHandPenalty',
    offhand.main && offhand.main[0] && offhand.main[0].totalDelta,
    offhand.rules.mainHandPenalty);
  check('an attack that declares no hand (single weapon) is untouched by the dual-wield contributor',
    offhand.noHand, null);

  // ---- arrow (informational only) ------------------------------------------
  const arrow = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const yumi = T.findWeapon('Yumi');
    const withArrow = T.arrowPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.DAMAGE, {
      weaponEntry: yumi, arrow: 'Willow Leaf',
    }));
    const meleeWeapon = T.findWeapon('Katana');
    const nonAmmo = T.arrowPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.DAMAGE, {
      weaponEntry: meleeWeapon, arrow: 'Willow Leaf',
    }));
    const wrongKind = T.arrowPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.ATTACK, {
      weaponEntry: yumi, arrow: 'Willow Leaf',
    }));
    return { withArrow, nonAmmo, wrongKind };
  });
  check('arrow contributor is informational only, and never moves a die even though it carries no zero deltas of its own',
    arrow.withArrow && arrow.withArrow[0] &&
      { info: arrow.withArrow[0].informational, display: arrow.withArrow[0].display },
    { info: true, display: 'Willow Leaf (+2k2)' });
  check('arrow contributes nothing for a weapon that does not use ammunition',
    arrow.nonAmmo, null);
  check('arrow contributes nothing outside a damage roll',
    arrow.wrongKind, null);

  // =========================================================================
  // 3. PIPELINE MATH -- applyPreRollModifiers()'s own invariants, independent
  //    of any specific contributor (see 130-round-and-pipeline.js).
  // =========================================================================
  const pipelineMath = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const floorAtZero = T.applyPreRollModifiers(3, 3, [{ rolledDelta: -5, keptDelta: 0, totalDelta: 0 }]);
    const keptNeverExceedsRolled = T.applyPreRollModifiers(5, 2, [{ rolledDelta: 0, keptDelta: 10, totalDelta: 0 }]);
    return { floorAtZero, keptNeverExceedsRolled };
  });
  check('a rolled pool can never go negative — it floors at 0k0',
    { r: pipelineMath.floorAtZero.rolled, k: pipelineMath.floorAtZero.kept },
    { r: 0, k: 0 });
  check('kept dice can never exceed rolled dice, however large a keptDelta stacks',
    { r: pipelineMath.keptNeverExceedsRolled.rolled, k: pipelineMath.keptNeverExceedsRolled.kept },
    { r: 5, k: 5 });

  const informationalNormalisation = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    T.registerPreRollModifier('phase15-test-informational', 999, () => ({
      source: 'phase15-test', label: 'test', informational: true,
      rolledDelta: 99, keptDelta: 99, totalDelta: 99,
    }));
    const mods = T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.SKILL, {}));
    T.unregisterPreRollModifier('phase15-test-informational');
    const mine = mods.find(m => m.source === 'phase15-test');
    return mine && { r: mine.rolledDelta, k: mine.keptDelta, t: mine.totalDelta };
  });
  check("getPreRollModifiers() forces an informational contributor's deltas to zero regardless of what it returns",
    informationalNormalisation, { r: 0, k: 0, t: 0 });

  const throwingContributorIsSkipped = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    T.registerPreRollModifier('phase15-test-throws', 999, () => { throw new Error('boom'); });
    let threw = false;
    let mods = null;
    try { mods = T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.SKILL, {})); }
    catch (e) { threw = true; }
    T.unregisterPreRollModifier('phase15-test-throws');
    return { threw, gotResult: Array.isArray(mods) };
  });
  record('a contributor that throws is skipped, not fatal to the roll',
    throwingContributorIsSkipped.threw === false && throwingContributorIsSkipped.gotResult === true,
    JSON.stringify(throwingContributorIsSkipped));

  // =========================================================================
  // 4. STACKING -- several real contributors active on the SAME context at
  //    once. This is the case an audit-only phase exists to protect: later
  //    phases (3, 4, 4.5, 6) must not change how these combine.
  // =========================================================================
  const stackedAttack = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    T.setCurrentStance('Full Attack');
    document.getElementById('f_woundsTaken').value = '7'; // whatever level that currently is
    T.setVoidPending({ k1: true });
    const ctx = T.makeRollContext(T.ROLL_KINDS.ATTACK, {
      range: { mode: 'beyond', penaltyDice: 2, extraFeet: 75, listedRange: 100 },
      hand: 'off', weaponEntry: null, skillName: 'Kenjutsu', skillRank: 0, weaponSize: 'Medium',
    });
    const mods = T.getPreRollModifiers(ctx);
    const woundPenalty = T.WOUND_PENALTIES[T.getCurrentWoundLevelName()];
    const adj = T.applyPreRollModifiers(10, 4, mods);
    T.setCurrentStance('Attack');
    document.getElementById('f_woundsTaken').value = '0';
    T.clearVoidPending();
    const expectedRolled = 10 + 2 /*full attack*/ - 2 /*range*/ + 1 /*void*/;
    const expectedKept = 4 + 1 /*full attack*/ + 1 /*void*/;
    const expectedTotalDelta = -10 /*offhand medium*/ + woundPenalty;
    return {
      order: mods.map(m => m.source),
      adjRolled: adj.rolled, adjKept: adj.kept, adjTotalDelta: adj.totalDelta,
      expectedRolled, expectedKept, expectedTotalDelta,
    };
  });
  check('a stacked attack (Full Attack + wounded + Void k1 + range + off-hand) lists contributors in priority order',
    stackedAttack.order, ['range', 'stance', 'offhand', 'wounds', 'void']);
  check('the same stacked attack folds to the arithmetic sum of every individual contributor',
    { rolled: stackedAttack.adjRolled, kept: stackedAttack.adjKept, totalDelta: stackedAttack.adjTotalDelta },
    { rolled: stackedAttack.expectedRolled, kept: stackedAttack.expectedKept, totalDelta: stackedAttack.expectedTotalDelta });

  const stackedDamage = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    T.setCurrentStance('Full Attack');
    document.getElementById('f_woundsTaken').value = '7';
    T.setVoidPending({ k1: true, trait: true, skill: true });
    const yumi = T.findWeapon('Yumi');
    const ctx = T.makeRollContext(T.ROLL_KINDS.DAMAGE, {
      range: { mode: 'beyond', penaltyDice: 2 }, hand: 'off',
      weaponEntry: yumi, arrow: 'Willow Leaf', skillName: 'Kyujutsu', skillRank: 3, weaponSize: 'Large',
    });
    const mods = T.getPreRollModifiers(ctx);
    T.setCurrentStance('Attack');
    document.getElementById('f_woundsTaken').value = '0';
    T.clearVoidPending();
    return mods.map(m => ({ source: m.source, informational: m.informational }));
  });
  check('a damage roll is untouched by every contributor except the informational arrow line, ' +
        'even with stance/wounds/Void/range/off-hand all simultaneously active (RAW: damage rolls are never enhanced)',
    stackedDamage, [{ source: 'arrow', informational: true }]);

  // ---- Void's one-roll effects: consumption is generic, Center's is not ----
  const consumption = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    T.setVoidPending({ k1: true });
    const mods = T.voidPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.ATTACK, {}));
    const adj = T.applyPreRollModifiers(10, 4, mods);
    T.consumeVoidOneRollEffects(adj);
    const pendingAfter = T.getVoidPending();
    return pendingAfter;
  });
  check("Void's one-roll effects (k1/skill) are auto-consumed by consumeVoidOneRollEffects — the pipeline's own hook, not a per-feature one",
    consumption, {});

  if (pageErrors.length) {
    record('no uncaught page errors', false, pageErrors.join(' | '));
  } else {
    record('no uncaught page errors', true);
  }

  const pass = results.filter((r) => r.pass).length;
  console.log(`\n${pass}/${results.length} checks passed`);

  await browser.close();
  process.exit(pass === results.length ? 0 : 1);
}

main();
