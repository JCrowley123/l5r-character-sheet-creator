/* =============================================================================
   PART G PHASE 3 — SMART ROLL PREVIEW — AUTOMATED CHECKS

     NODE_PATH=$(npm root -g) node qa/roll-preview-harness.js <built-sheet.html>

   WHAT THIS PHASE ACTUALLY CHANGED. The pipeline's two calculating steps
   (getPreRollModifiers, applyPreRollModifiers) were already pure and already
   separated from the throw — Phase 1.5 established that. This phase inserts a
   confirmation gate between them and rollDicePool(), and lets the player arm a
   one-roll Void effect from inside that gate. So the checks below are mostly
   about the SEAM, not about arithmetic: does the gate show the pipeline's own
   numbers, does cancelling really cost nothing, does confirming roll exactly
   what was shown.

   THE ORACLE IS NOT THE PREVIEW. Every pool assertion recomputes the expected
   value by calling getPreRollModifiers()/applyPreRollModifiers() directly
   through window.__L5R_TEST__ — the pipeline's own functions, which this phase
   does not modify — and compares that against what the preview PAINTED. If the
   preview ever grew its own arithmetic and drifted, these would diverge. A
   check that read the pool out of the preview and compared it against itself
   would pass forever and prove nothing.

   THE ONE THIS HARNESS EXISTS TO CATCH. Arming a one-roll Void effect normally
   goes through spendVoid(), which DEDUCTS A VOID POINT and writes the
   once-per-Round ledger. If the preview armed effects that way, cancelling
   would silently cost the player a Void Point for a roll they never made.
   Checks 7–9 cover exactly that, and they fail against a build where the
   preview commits on toggle instead of on confirm — see the README for both
   numbers.

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

const previewOpen = (page) => page.evaluate(() =>
  document.getElementById('rollPreviewOverlay').style.display === 'flex');

// What the preview PAINTED, read out of the DOM.
const painted = (page) => page.evaluate(() => {
  const el = document.querySelector('#rollPreviewBody .rp-pool-final');
  const flat = document.querySelector('#rollPreviewBody .rp-pool-flat');
  const tn = document.querySelector('#rollPreviewBody .rp-tn b');
  const mods = Array.from(document.querySelectorAll('#rollPreviewBody .rp-mod'))
    .map(m => m.querySelector('.rp-mod-label').textContent);
  const voids = Array.from(document.querySelectorAll('#rollPreviewBody [data-void-key]'))
    .map(c => c.getAttribute('data-void-key'));
  const badges = Array.from(document.querySelectorAll('#rollPreviewBody .rp-die-badge'))
    .map(b => b.textContent.trim());
  const basis = document.querySelector('#rollPreviewBody .rp-basis');
  // PART G PHASE 4 - that phase itemises the base pool as rows and this phase's one-line prose
  // summary steps aside for it (see 208-feat-roll-preview.js's own guarded block). Collect both
  // so the checks below can assert whichever form THIS build renders, and stay meaningful
  // against a build with Phase 4 removed.
  const baseRows = Array.from(document.querySelectorAll('#rollPreviewBody .rp-base .rp-baserow'))
    .map(m => (m.querySelector('.rp-mod-label') || {}).textContent || '');
  return {
    pool: el ? el.textContent.trim() : null,
    flat: flat ? flat.textContent.trim() : null,
    tn: tn ? tn.textContent.trim() : null,
    badges,
    basis: basis ? basis.textContent.trim() : null,
    baseRows,
    mods, voids,
  };
});

// The independent oracle: the pipeline's own functions, which this phase does not touch.
const oracle = (page, kind, extra, baseRolled, baseKept) => page.evaluate(
  ([kind, extra, baseRolled, baseKept]) => {
    const T = window.__L5R_TEST__;
    const ctx = T.makeRollContext(kind, extra || {});
    const mods = T.getPreRollModifiers(ctx);
    const adj = T.applyPreRollModifiers(baseRolled, baseKept, mods);
    return { pool: adj.rolled + 'k' + adj.kept, totalDelta: adj.totalDelta,
             labels: mods.map(m => m.label) };
  }, [kind, extra, baseRolled, baseKept]);

const voidPoints = (page) => page.evaluate(() =>
  parseInt(document.getElementById('void_current').value || '0', 10));

const rollModalOpen = (page) => page.evaluate(() => {
  const o = document.getElementById('rollModalOverlay');
  return !!o && o.style.display === 'flex';
});

const closeRollModalIfOpen = async (page) => {
  await page.evaluate(() => {
    const o = document.getElementById('rollModalOverlay');
    if (o && o.style.display === 'flex' && typeof window.__L5R_TEST__.closeRollModal === 'function') {
      window.__L5R_TEST__.closeRollModal();
    }
  });
  await page.waitForTimeout(60);
};

// Click only if the element is actually there. With the kill-switch off no preview is ever
// built, and a harness that threw on the missing button could not report a number for that
// supported configuration at all -- it would just die. Missing element: the dependent checks
// below fail on their own terms instead.
const clickIfPresent = async (page, sel) => {
  const there = await page.evaluate((s) => !!document.querySelector(s), sel);
  if (there) await page.click(sel);
  return there;
};

// Fire a roll WITHOUT awaiting it — it parks on the preview until we answer.
const startSkillRoll = async (page, name, trait, rank) => {
  await page.evaluate(([n, t, r]) => { window.__L5R_TEST__.rollSkill(n, t, r); }, [name, trait, rank]);
  await page.waitForTimeout(140);
};

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('usage: roll-preview-harness.js <built-sheet.html>');
    process.exit(2);
  }

  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  await page.goto(pathToFileURL(path.resolve(file)).href);
  await page.waitForTimeout(400);

  // A character with Traits worth rolling and Void Points to spend.
  await page.evaluate(() => {
    document.getElementById('trait_agility').value = '3';
    document.getElementById('trait_agility').dispatchEvent(new Event('input', { bubbles: true }));
    document.getElementById('ring_void').value = '3';
    document.getElementById('void_current').value = '3';
    window.__L5R_TEST__.recalcAll();
  });
  await page.waitForTimeout(120);

  // =========================================================================
  // 1-3. The gate opens, and shows the pipeline's own pool.
  // =========================================================================
  await startSkillRoll(page, 'Kenjutsu', 'Agility', 2);
  check('a roll opens the preview instead of rolling immediately', await previewOpen(page), true);
  check('no dice were thrown while the preview is open', await rollModalOpen(page), false);

  let p = await painted(page);
  let o = await oracle(page, 'skill', { skillName: 'Kenjutsu', traitName: 'Agility', skillRank: 2 }, 5, 3);
  check('the previewed pool matches the pipeline\'s own projection (5k3, unmodified)',
    p.pool, o.pool);
  check('an unmodified roll lists no modifiers', p.mods.length, 0);
  check('a skill roll shows no TN — only spells carry one', p.tn, null);

  // =========================================================================
  // 4. Cancel throws nothing.
  // =========================================================================
  await clickIfPresent(page, '#rollPreviewCancel');
  await page.waitForTimeout(120);
  check('cancelling closes the preview without rolling',
    { preview: await previewOpen(page), rolled: await rollModalOpen(page) },
    { preview: false, rolled: false });

  // =========================================================================
  // 5-6. A real modifier reaches the preview, and matches the oracle.
  //      Wounds apply to every kind except Damage, so they need no combat setup.
  // =========================================================================
  await page.evaluate(() => {
    document.getElementById('f_woundsTaken').value = '12';
    window.__L5R_TEST__.recalcAll();
  });
  await page.waitForTimeout(120);
  await startSkillRoll(page, 'Kenjutsu', 'Agility', 2);
  p = await painted(page);
  o = await oracle(page, 'skill', { skillName: 'Kenjutsu', traitName: 'Agility', skillRank: 2 }, 5, 3);
  check('a wound penalty is listed in the preview', p.mods.length >= 1 ? true : false, true);
  check('the listed modifier labels match the pipeline\'s own', p.mods, o.labels);
  check('the flat penalty shown matches the pipeline\'s totalDelta',
    p.flat, (o.totalDelta >= 0 ? '+' : '') + o.totalDelta + ' to total');
  await clickIfPresent(page, '#rollPreviewCancel');
  await page.waitForTimeout(100);
  await page.evaluate(() => {
    document.getElementById('f_woundsTaken').value = '0';
    window.__L5R_TEST__.recalcAll();
  });
  await page.waitForTimeout(100);

  // =========================================================================
  // 7-9. THE ONES THIS HARNESS EXISTS FOR — Void is projected, not spent,
  //      until the roll is actually confirmed.
  // =========================================================================
  const before = await voidPoints(page);
  await startSkillRoll(page, 'Kenjutsu', 'Agility', 2);
  p = await painted(page);
  check('the preview offers a one-roll Void spend when points are available',
    p.voids.includes('k1'), true);

  await clickIfPresent(page, '#rollPreviewBody [data-void-key="k1"]');
  await page.waitForTimeout(120);
  p = await painted(page);
  check('ticking +1k1 updates the projected pool live (5k3 -> 6k4)', p.pool, '6k4');
  check('ticking a Void option spends NOTHING while the preview is open',
    await voidPoints(page), before);

  await clickIfPresent(page, '#rollPreviewCancel');
  await page.waitForTimeout(140);
  check('cancelling after ticking Void refunds nothing because nothing was spent',
    await voidPoints(page), before);
  const pendingAfterCancel = await page.evaluate(() =>
    JSON.stringify(window.__L5R_TEST__.getVoidPending() || {}));
  check('cancelling leaves no Void effect armed for the next roll', pendingAfterCancel, '{}');

  // =========================================================================
  // 10-12. Confirming rolls exactly what was previewed, and spends the point.
  // =========================================================================
  await startSkillRoll(page, 'Kenjutsu', 'Agility', 2);
  await clickIfPresent(page, '#rollPreviewBody [data-void-key="k1"]');
  await page.waitForTimeout(120);
  const promised = (await painted(page)).pool;
  await clickIfPresent(page, '#rollPreviewGo');
  await page.waitForTimeout(260);
  check('confirming closes the preview and throws the dice',
    { preview: await previewOpen(page), rolled: await rollModalOpen(page) },
    { preview: false, rolled: true });
  const thrown = await page.evaluate(() =>
    document.querySelectorAll('#rollDiceRow .roll-die').length);
  check('the number of dice actually thrown matches the pool the preview promised',
    thrown, promised ? parseInt(promised.split('k')[0], 10) : 'a preview that never opened promised nothing');
  check('confirming a Void spend deducts exactly one point', await voidPoints(page), before - 1);
  await closeRollModalIfOpen(page);

  // =========================================================================
  // 13. A spell roll carries its TN into the preview — the one kind that can.
  // =========================================================================
  await page.evaluate(() => {
    window.__L5R_TEST__.rollWithModifiers(
      'Test Spell — Casting Roll',
      window.__L5R_TEST__.makeRollContext('spell', { spellName: 'Test', element: 'Air' }),
      4, 2, { tnConfig: { tn: 20 } });
  });
  await page.waitForTimeout(160);
  check('a spell roll shows its Target Number in the preview', (await painted(page)).tn, '20');
  await clickIfPresent(page, '#rollPreviewCancel');
  await page.waitForTimeout(100);

  // =========================================================================
  // 14. Damage rolls deliberately bypass the preview — they never enter the
  //     pipeline at all (Phase 1.5: "Damage rolls take a different path").
  // =========================================================================
  await page.evaluate(() => {
    window.__L5R_TEST__.rollNotation('Test — Damage', '3k2');
  });
  await page.waitForTimeout(160);
  const notationPreviewed = await previewOpen(page);
  await page.evaluate(() => {
    const o = document.getElementById('rollPreviewOverlay');
    if (o && o.style.display === 'flex') document.getElementById('rollPreviewCancel').click();
  });
  await page.waitForTimeout(100);
  record('a manual-notation roll DOES go through the preview (it is a pipeline roll)',
    notationPreviewed === true, String(notationPreviewed));

  // =========================================================================
  // 15-18. BUGFIX (Void One-Roll Effects Not Mutually Exclusive) — RAW allows spending on
  // only ONE of the one-roll effects per expenditure. The checkbox list used to accumulate
  // every key ever ticked without clearing the others, so ticking two together (originally
  // +1k1 and +1 Trait, before that entry was merged into +1k1 -- see this fix's own README)
  // stacked +2k2 for two Void Points. Ticking +1k1 then +1 Skill Rank reproduces the same
  // class of bug against today's two remaining one-roll options.
  // =========================================================================
  // Base pool at rank 0, Agility 3, is 3k3. +1k1 makes it 4k4. +1 Skill Rank adds a rolled die
  // only (rolledDelta:1, keptDelta:0) and makes it 4k3. Stacked (the bug), it would be 5k4.
  await startSkillRoll(page, 'Kenjutsu', 'Agility', 0);   // rank 0: makes +1 Skill Rank offerable
  await clickIfPresent(page, '#rollPreviewBody [data-void-key="k1"]');
  await page.waitForTimeout(100);
  p = await painted(page);
  check('ticking +1k1 alone gives the expected pool (3k3 -> 4k4)', p.pool, '4k4');

  await clickIfPresent(page, '#rollPreviewBody [data-void-key="skill"]');
  await page.waitForTimeout(100);
  p = await painted(page);
  const k1Box = await page.evaluate(() =>
    document.querySelector('#rollPreviewBody [data-void-key="k1"]')?.checked ?? null);
  check('ticking a second one-roll option unchecks the first (radio-group behaviour)',
    k1Box, false);
  check('the pool reflects ONLY the second option, not both stacked (4k3, not 5k4)',
    p.pool, '4k3');

  await clickIfPresent(page, '#rollPreviewGo');
  await page.waitForTimeout(220);
  check('confirming after switching options deducts exactly ONE Void Point, not two',
    await voidPoints(page), before - 2);   // before-1 from the earlier confirmed roll, -1 here
  await closeRollModalIfOpen(page);

  // =========================================================================
  // 19-23. Real-device feedback: show the pool as dice, and say where it came from.
  // The badges must agree with the pipeline's own projected pool, not merely with the
  // formula text sitting next to them -- a graphic that drifts from the number it
  // illustrates is worse than no graphic.
  // =========================================================================
  await startSkillRoll(page, 'Kenjutsu', 'Agility', 2);
  p = await painted(page);
  o = await oracle(page, 'skill', { skillName: 'Kenjutsu', traitName: 'Agility', skillRank: 2 }, 5, 3);
  check('the dice graphic shows a rolled and a kept die, badged with the real counts',
    p.badges, [o.pool.split('k')[0], o.pool.split('k')[1]]);
  // Both forms name the same two things; which one is on screen depends on whether Phase 4 is
  // in the build. Asserting the labels it renders keeps this check honest either way rather
  // than pinning it to prose that a later phase legitimately replaced.
  check('a trained skill roll says which Trait and Rank built the pool',
    p.baseRows.length ? p.baseRows : p.basis,
    p.baseRows.length ? ['Agility 3', 'Kenjutsu Rank 2'] : 'Agility 3 + Kenjutsu Rank 2');

  // The badges must TRACK the pool, not just match it once on open.
  await clickIfPresent(page, '#rollPreviewBody [data-void-key="k1"]');
  await page.waitForTimeout(100);
  p = await painted(page);
  check('spending Void updates the dice badges too, not just the formula',
    p.badges, ['6', '4']);
  await clickIfPresent(page, '#rollPreviewCancel');
  await page.waitForTimeout(100);

  // Unskilled: Trait alone, no Rank to name.
  await startSkillRoll(page, 'Kenjutsu', 'Agility', 0);
  p = await painted(page);
  check('an unskilled roll says the Trait rolls and keeps alone',
    p.baseRows.length ? p.baseRows : p.basis,
    p.baseRows.length ? ['Agility 3', 'Unskilled']
                      : 'Agility 3 — Unskilled, so the Trait rolls and keeps alone');
  await clickIfPresent(page, '#rollPreviewCancel');
  await page.waitForTimeout(100);

  // A Ring roll names its Ring. Driven through the real Rings-tab click path.
  await page.evaluate(() => {
    window.__L5R_TEST__.rollWithModifiers('Earth Ring Roll',
      window.__L5R_TEST__.makeRollContext('ring', { ringName: 'Earth' }), 2, 2);
  });
  await page.waitForTimeout(160);
  check('a Ring roll names the Ring and its value', (await painted(page)).basis,
    'Earth Ring ' + (await page.evaluate(() =>
      window.__L5R_TEST__.getRingValueByName('Earth'))) + ', rolled and kept');
  await clickIfPresent(page, '#rollPreviewCancel');
  await page.waitForTimeout(100);

  // =========================================================================
  // 24-27. RAW: "Temporarily increase his rank in a Skill FROM 0 TO 1, avoiding Unskilled
  // Roll penalties." Both halves restrict it to a skill-based roll made unskilled. It used
  // to be offered on every roll kind except Damage — including Ring rolls, which have no
  // Skill Rank at all. The preview decides what to offer by simulation, so these checks
  // exercise the contributor's own gate through the UI it feeds.
  // =========================================================================
  await startSkillRoll(page, 'Kenjutsu', 'Agility', 3);   // TRAINED
  p = await painted(page);
  check('a trained skill roll does NOT offer +1 Skill Rank — there is no rank 0 to raise',
    p.voids, ['k1']);
  await clickIfPresent(page, '#rollPreviewCancel');
  await page.waitForTimeout(100);

  await startSkillRoll(page, 'Kenjutsu', 'Agility', 0);   // UNSKILLED
  p = await painted(page);
  check('an unskilled skill roll offers both — the general bonus and the rank-0 lift',
    p.voids, ['k1', 'skill']);
  await clickIfPresent(page, '#rollPreviewCancel');
  await page.waitForTimeout(100);

  // A Ring roll has no Skill Rank whatsoever — this is the case the original screenshot showed.
  await page.evaluate(() => {
    window.__L5R_TEST__.rollWithModifiers('Earth Ring Roll',
      window.__L5R_TEST__.makeRollContext('ring', { ringName: 'Earth' }), 2, 2);
  });
  await page.waitForTimeout(160);
  check('a Ring roll does NOT offer +1 Skill Rank — a Ring has no Skill Rank to raise',
    (await painted(page)).voids, ['k1']);
  await clickIfPresent(page, '#rollPreviewCancel');
  await page.waitForTimeout(100);

  // The contributor itself, asked directly: arming the flag must do nothing to a trained roll.
  const gate = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const saved = T.getVoidPending();
    T.setVoidPending({ skill: true });
    const trained = T.voidPreRollModifiers(
      T.makeRollContext(T.ROLL_KINDS.SKILL, { skillName: 'Kenjutsu', skillRank: 3 }));
    const unskilledAttack = T.voidPreRollModifiers(
      T.makeRollContext(T.ROLL_KINDS.ATTACK, { skillName: 'Kenjutsu', skillRank: 0, unskilled: true }));
    T.setVoidPending(saved);
    return { trained, attackApplied: !!(unskilledAttack && unskilledAttack.length) };
  });
  check('the contributor itself contributes nothing to a trained roll, even with the flag armed',
    gate.trained, null);
  check('an UNSKILLED weapon attack still gets it — that is a rank-0 roll too',
    gate.attackApplied, true);

  // =========================================================================
  // 15. The kill-switch and the seam are both present and honest.
  // =========================================================================
  // =========================================================================
  // 28-31. BUGFIX (Void Offer Measured Against The Wrong Baseline). Reported live: on a TRAINED
  // Athletics roll, ticking +1k1 made "+1 Skill Rank (0 -> 1)" appear -- an option the
  // contributor refuses to apply to a trained roll, so taking it would spend a Void Point for
  // nothing. Cause: the offer test compared each key against the pool CURRENTLY ON SCREEN
  // rather than the unmodified one, so once any key was armed every other key looked like it
  // "would matter". The offer list must not change when a key is ticked.
  // =========================================================================
  await startSkillRoll(page, 'Kenjutsu', 'Agility', 2);   // TRAINED
  check('a trained skill roll offers only +1k1 before anything is ticked',
    (await painted(page)).voids, ['k1']);
  await clickIfPresent(page, '#rollPreviewBody [data-void-key="k1"]');
  await page.waitForTimeout(120);
  check('and STILL only +1k1 after ticking it — the offer list is not measured against itself',
    (await painted(page)).voids, ['k1']);
  await clickIfPresent(page, '#rollPreviewCancel');
  await page.waitForTimeout(100);

  // The unskilled case must keep BOTH, ticked or not: this fix must not over-correct into
  // hiding an option that genuinely applies.
  await startSkillRoll(page, 'Kenjutsu', 'Agility', 0);   // UNSKILLED
  check('an unskilled roll still offers both before ticking',
    (await painted(page)).voids, ['k1', 'skill']);
  await clickIfPresent(page, '#rollPreviewBody [data-void-key="k1"]');
  await page.waitForTimeout(120);
  check('and still offers both after ticking one',
    (await painted(page)).voids, ['k1', 'skill']);
  await clickIfPresent(page, '#rollPreviewCancel');
  await page.waitForTimeout(100);

  // =========================================================================
  // 32-33. A Void option withheld for a STATEFUL reason says so. Silently removing the whole
  // section made an empty panel indistinguishable from a broken feature -- reported by the
  // project owner, who wrote the app, after spending his last point mid-test.
  // =========================================================================
  const spentAll = await page.evaluate(() => {
    document.getElementById('void_current').value = 0;
    window.__L5R_TEST__.rollWithModifiers('Kenjutsu',
      window.__L5R_TEST__.makeRollContext(window.__L5R_TEST__.ROLL_KINDS.SKILL,
        { skillName:'Kenjutsu', traitName:'Agility', skillRank:2, traitValue:3 }), 5, 3);
    return true;
  });
  await page.waitForTimeout(200);
  const blocked = await page.evaluate(() => {
    const n = document.querySelector('#rollPreviewBody .rp-void-blocked');
    return {
      offers: document.querySelectorAll('#rollPreviewBody [data-void-key]').length,
      reason: n ? n.textContent.trim() : null,
    };
  });
  check('with no Void Points left the offer is gone but the REASON is shown',
    blocked, { offers: 0, reason: 'No Void Points remaining.' });
  await clickIfPresent(page, '#rollPreviewCancel');
  await page.waitForTimeout(100);

  // ...and silence is still right when the option simply would not help. A Ring roll cannot use
  // +1 Skill Rank at any point total, so there is nothing to explain about it.
  await page.evaluate(() => {
    document.getElementById('void_current').value = 2;
    window.__L5R_TEST__.rollWithModifiers('Earth Ring Roll',
      window.__L5R_TEST__.makeRollContext(window.__L5R_TEST__.ROLL_KINDS.RING,
        { ringName:'Earth', ringValue:2 }), 2, 2);
  });
  await page.waitForTimeout(200);
  check('an option that would not help this roll is withheld silently, with no reason line',
    await page.evaluate(() => ({
      voids: Array.from(document.querySelectorAll('#rollPreviewBody [data-void-key]'))
        .map(c => c.getAttribute('data-void-key')),
      blockedLines: document.querySelectorAll('#rollPreviewBody .rp-void-blocked').length,
    })),
    { voids: ['k1'], blockedLines: 0 });
  await clickIfPresent(page, '#rollPreviewCancel');
  await page.waitForTimeout(100);

  // =========================================================================
  // 34-35. The +1 Skill Rank option states its EFFECT and its CONSEQUENCE. It adds only a
  // rolled die (3k2 next to +1k1's 3k3), so on the numbers alone it looks like the weaker
  // choice -- the exploding 10s that are the whole point of it were invisible until you had
  // already rolled.
  // =========================================================================
  const skillOpt = await page.evaluate(() => {
    const o = window.__L5R_TEST__.findVoidOption('skill');
    return o ? o.label : null;
  });
  check('the +1 Skill Rank option names both what it does and what follows from it',
    { skilled: /Skilled/i.test(skillOpt || ''), explodes: /explode/i.test(skillOpt || '') },
    { skilled: true, explodes: true });

  // THE COUPLING GUARD. consumeVoidOneRollEffects() decides what to clear by REGEX-MATCHING the
  // modifier's own label text. Rename that label without updating the regex and nothing errors
  // -- the effect just never gets consumed, so it silently rides along onto the player's next,
  // unrelated roll. This checks the behaviour rather than the string, so it catches the
  // divergence however it is introduced.
  const consumed = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const saved = T.getVoidPending();
    T.setVoidPending(T.armOneRollVoidPending(saved, 'skill'));
    const ctx = T.makeRollContext(T.ROLL_KINDS.SKILL,
      { skillName:'Horsemanship', traitName:'Agility', skillRank:0, traitValue:2, unskilled:true });
    const adj = T.applyPreRollModifiers(2, 2, T.getPreRollModifiers(ctx));
    const armedBefore = !!T.getVoidPending().skill;
    T.consumeVoidOneRollEffects(adj);
    const armedAfter = !!T.getVoidPending().skill;
    T.setVoidPending(saved);
    return { armedBefore, armedAfter };
  });
  check('a spent +1 Skill Rank is consumed by the roll, not carried to the next one',
    consumed, { armedBefore: true, armedAfter: false });

  check('the phase exports its kill-switch as enabled',
    await page.evaluate(() => window.__L5R_TEST__.ROLL_PREVIEW_ENABLED), true);

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
