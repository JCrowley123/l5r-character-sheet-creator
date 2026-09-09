/* =============================================================================
   PART H — PHASE 1.6: COMBAT TAB STREAMLINING — AUTOMATED CHECKS

     NODE_PATH=$(npm root -g) node qa/wound-bar-harness.js <built-sheet.html>

   Drives a real browser against the built single-file sheet and checks the
   pieces this phase actually changed: the rebuilt wound severity bar, the
   three synced input controls, the relocated void-spend disabled-reason
   caption, the Combat sub-section <details>, and the two formula info
   buttons reusing the stance-info modal. It does not re-check anything
   Phase 0's own qa/behaviour-harness.js already covers for the rest of the
   sheet -- see this phase's README for the before/after diff that proved
   nothing outside the Combat tab moved.

   PARITY WITH THE OLD CARD LAYOUT

   The classification math (computeWoundThresholds, WOUND_LEVELS) is
   untouched by this phase -- only renderWounds()'s DOM output changed. So
   rather than re-derive expected values by hand, this harness recomputes
   the OLD per-row classification directly from those same two exports and
   asserts the new bar's current segment agrees, across a spread of
   Earth ranks and wound totals. If a future change to the threshold math
   ever disagreed with the bar it draws, this is what would catch it.

   Reads only. Never writes to the file it is given.
   ============================================================================= */

'use strict';

const { chromium } = require('playwright');
const path = require('path');
const { pathToFileURL } = require('url');

/* Same override as the Phase 0.6/0.7 harnesses: lets a machine with its own
   Chromium (rather than one Playwright downloaded itself) run this for real. */
const LAUNCH = process.env.L5R_CHROME
  ? { executablePath: process.env.L5R_CHROME }
  : {};

const results = [];
const record = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};
// For "does this equal that" checks. record() takes the boolean directly, which
// reads fine for real boolean state (an element's .disabled, .open) but is the
// wrong tool for a text/value comparison -- a non-empty expected string is
// truthy, so passing it as record()'s own pass argument "passes" no matter what
// the actual value was. check() does the comparison record() does not.
const check = (name, actual, expected) => {
  record(name, actual === expected, actual === expected ? String(actual) : `got=${JSON.stringify(actual)} want=${JSON.stringify(expected)}`);
};

function setAndDispatch(page, id, val) {
  return page.evaluate(({ id, val }) => {
    const el = document.getElementById(id);
    el.value = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, { id, val });
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('usage: wound-bar-harness.js <built-sheet.html>');
    process.exit(2);
  }

  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  await page.goto(pathToFileURL(path.resolve(file)).href);
  await page.waitForTimeout(300);
  await page.locator('.car-tab', { hasText: 'Combat' }).first().click();
  await page.waitForTimeout(200);

  // ---- 1. Combat sub-sections: correct default open/closed state ----------
  const details = await page.evaluate(() => ({
    armorTn: document.getElementById('armorTnDetails').open,
    weapons: document.getElementById('weaponsDetails').open,
    stance: document.getElementById('stanceDetails').open,
    voidD: document.getElementById('voidDetails').open,
  }));
  record('Armor & TN and Weapons default collapsed; Stance and Void default open',
    details.armorTn === false && details.weapons === false && details.stance === true && details.voidD === true,
    JSON.stringify(details));

  // ---- 2. the bar always has exactly 8 segments ----------------------------
  const segCount = await page.evaluate(() => document.querySelectorAll('.wound-seg').length);
  record('wound bar renders exactly 8 segments', segCount === 8, `count=${segCount}`);

  // ---- 3. parity sweep against the OLD per-card classification math -------
  // Recomputes the old algorithm from the SAME exports renderWounds() itself
  // reads, rather than hand-coding expected numbers here.
  const sweep = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const cases = [];
    for (const earth of [1, 2, 3, 5, 8]) {
      const thresholds = T.computeWoundThresholds(earth);
      for (const taken of [0, 1, 4, 7, 12, 20, 45, 999]) {
        let oldIdx = thresholds.findIndex((t) => taken <= t);
        if (oldIdx === -1) oldIdx = T.WOUND_LEVELS.length - 1;

        document.getElementById('trait_stamina').value = earth;
        document.getElementById('trait_stamina').dispatchEvent(new Event('input', { bubbles: true }));
        document.getElementById('trait_willpower').value = earth;
        document.getElementById('trait_willpower').dispatchEvent(new Event('input', { bubbles: true }));
        document.getElementById('f_woundsTaken').value = taken;
        document.getElementById('f_woundsTaken').dispatchEvent(new Event('input', { bubbles: true }));

        const segs = Array.from(document.querySelectorAll('.wound-seg'));
        const newIdx = segs.findIndex((s) => s.classList.contains('current'));
        cases.push({ earth, taken, oldIdx, newIdx, match: oldIdx === newIdx });
      }
    }
    return cases;
  });
  const mismatches = sweep.filter((c) => !c.match);
  record(`bar's current segment matches old per-card classification (${sweep.length} cases)`,
    mismatches.length === 0,
    mismatches.length ? JSON.stringify(mismatches) : `all ${sweep.length} agreed`);

  // reset the trait detour above back to the sheet's defaults
  await setAndDispatch(page, 'trait_stamina', 2);
  await setAndDispatch(page, 'trait_willpower', 2);
  await setAndDispatch(page, 'f_woundsTaken', 0);

  // ---- 4. summary line, next-level line, and the three synced controls ----
  await setAndDispatch(page, 'f_woundsTaken', 7); // Grazed at Earth=2
  await page.waitForTimeout(30);
  const s7 = await page.evaluate(() => ({
    summary: document.getElementById('woundSummaryLine').textContent,
    next: document.getElementById('woundNextLine').textContent,
    slider: document.getElementById('woundsTakenSlider').value,
    aria: document.querySelector('.wound-seg.current').getAttribute('aria-label'),
  }));
  check('summary line names level, penalty and X of total', s7.summary,
    'Grazed — TN of all rolls +5 — 7 of 18 wound points');
  check('next-level line gives the correct remaining count', s7.next, '2 wounds to Hurt');
  check('slider mirrors the number box', s7.slider, '7');
  check('current segment aria-label is not colour-only', s7.aria, 'Grazed — TN of all rolls +5');

  await page.click('#woundStepUp');
  await page.waitForTimeout(30);
  const afterStep = await page.evaluate(() => ({
    number: document.getElementById('f_woundsTaken').value,
    slider: document.getElementById('woundsTakenSlider').value,
  }));
  record('stepper writes back to the number box and the slider together',
    afterStep.number === '8' && afterStep.slider === '8', JSON.stringify(afterStep));

  await setAndDispatch(page, 'woundsTakenSlider', 18);
  await page.waitForTimeout(30);
  const atMax = await page.evaluate(() => ({
    number: document.getElementById('f_woundsTaken').value,
    next: document.getElementById('woundNextLine').textContent,
    stepUpDisabled: document.getElementById('woundStepUp').disabled,
    stepDownDisabled: document.getElementById('woundStepDown').disabled,
  }));
  check('slider drag writes back to the number box', atMax.number, '18');
  check('Out shows the end-state message, not a distance', atMax.next, 'Already at the last level.');
  record('stepper disables exactly at the maximum, not before', atMax.stepUpDisabled === true && atMax.stepDownDisabled === false,
    JSON.stringify(atMax));

  await setAndDispatch(page, 'f_woundsTaken', 0);
  await page.waitForTimeout(30);
  const atZero = await page.evaluate(() => document.getElementById('woundStepDown').disabled);
  record('stepper disables exactly at zero', atZero, `disabled=${atZero}`);

  // ---- 5. tapping ANY segment opens its own level's info, not only current --
  const segs = await page.locator('.wound-seg').all();
  await segs[6].click(); // "Down" -- far from the current (Healthy) segment
  await page.waitForTimeout(100);
  const modal = await page.evaluate(() => ({
    display: document.getElementById('woundInfoModalOverlay').style.display,
    title: document.getElementById('woundInfoTitle').textContent,
    pen: document.getElementById('woundInfoPen').textContent,
  }));
  record('a non-current segment opens its own info modal', modal.display === 'flex' && modal.title === 'Down',
    JSON.stringify(modal));
  check('modal penalty text matches the segment tapped', modal.pen, 'TN of all rolls +40');
  await page.click('#woundInfoClose');

  // ---- 6. the two formula buttons, reusing the stance-info overlay --------
  await page.click('#combatTnInfoBtn');
  await page.waitForTimeout(80);
  const tnInfo = await page.evaluate(() => ({
    display: document.getElementById('stanceInfoOverlay').style.display,
    title: document.getElementById('stanceInfoTitle').textContent,
    armorOpen: document.getElementById('armorTnDetails').open,
  }));
  record('TN/Initiative info opens the shared stance-info overlay', tnInfo.display === 'flex' && tnInfo.title === 'TN & Initiative',
    JSON.stringify(tnInfo));
  record('opening the info popup does not also toggle the details open', tnInfo.armorOpen === false, `armorOpen=${tnInfo.armorOpen}`);
  await page.click('#stanceInfoClose');

  await page.click('#combatAttackInfoBtn');
  await page.waitForTimeout(80);
  const atkInfo = await page.evaluate(() => ({
    title: document.getElementById('stanceInfoTitle').textContent,
    weaponsOpen: document.getElementById('weaponsDetails').open,
  }));
  check('Attack/Damage info opens with the right title', atkInfo.title, 'Attack & Damage');
  record('opening it does not toggle Weapons details open', atkInfo.weaponsOpen === false, `weaponsOpen=${atkInfo.weaponsOpen}`);
  await page.click('#stanceInfoClose');

  // ---- 7. relocated void-spend disabled-reason caption ---------------------
  const voidReason = await page.evaluate(() => {
    const reason = document.getElementById('voidDisabledReason');
    const buttons = document.getElementById('voidSpendButtons');
    const pos = reason.compareDocumentPosition(buttons);
    return {
      text: reason.textContent,
      beforeButtons: !!(pos & Node.DOCUMENT_POSITION_FOLLOWING),
    };
  });
  check('disabled-reason caption states the out-of-combat reason',
    voidReason.text, 'out of combat — combat-only options disabled');
  record('disabled-reason caption sits above the button list, not below',
    voidReason.beforeButtons === true, `beforeButtons=${voidReason.beforeButtons}`);

  await page.click('#combatActiveToggle');
  await page.waitForTimeout(30);
  const clearedReason = await page.evaluate(() => document.getElementById('voidDisabledReason').textContent);
  record('disabled-reason caption clears once combat is active', clearedReason === '', `text=${JSON.stringify(clearedReason)}`);

  // ---- 8. the roll pipeline still receives the wound penalty ---------------
  const pipeline = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    document.getElementById('f_woundsTaken').value = '7'; // Grazed, -5
    const mods = T.woundPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.SKILL, {}));
    return { level: T.getCurrentWoundLevelName(), penalty: T.getWoundPenalty(), mods };
  });
  record('wound penalty still reaches the pre-roll modifier pipeline',
    pipeline.level === 'Grazed' && pipeline.penalty === -5 && pipeline.mods && pipeline.mods[0].totalDelta === -5,
    JSON.stringify(pipeline));

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
