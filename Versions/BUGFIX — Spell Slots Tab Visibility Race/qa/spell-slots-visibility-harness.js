/* =============================================================================
   BUGFIX — SPELL SLOTS TAB VISIBILITY RACE — AUTOMATED CHECKS

     NODE_PATH=$(npm root -g) node qa/spell-slots-visibility-harness.js <built-sheet.html>

   WHAT THIS BUGFIX IS AND ISN'T. Reported live: after applying a caster School
   (Asahina Shugenja) on a real iPhone, the Spell Slots tab never appeared. It
   was investigated hard and could not be reproduced in Chromium, across every
   realistic flow tried: the correct clan->family->school sequence with several
   timing variations, real touch-driven UI interaction (selectOption + tap, not
   scripted DOM calls), a save/reload/load round trip, and navigating through
   several tabs afterward -- see this folder's README for the full list. An
   earlier claim of having reproduced it was itself wrong: that test read state
   before the carousel's own MutationObserver callback had run, a race in the
   TEST, not evidence of one in the product.

   So this is not a confirmed-and-fixed defect. It is a real, demonstrable race
   window this investigation found regardless: watchVisibility()'s own
   MutationObserver callback is a microtask, so ANY code that inspects the tab
   bar in the same synchronous stretch as the change that revealed a tab --
   before the JS engine returns to the microtask queue -- sees the OLD state.
   Chromium's task scheduling apparently never lets that matter for the flows
   tried above; there is no guarantee every engine's timing works out the same
   way under real interaction on real hardware. The fix closes the window
   outright rather than resting on that guarantee: updateSpellSlotsVisibility()
   now calls the carousel's own refreshVisibility() synchronously, the instant
   it changes the section's display, rather than only flipping a style property
   and waiting for the observer to notice. Check 1 below is the one that proves
   the window existed and is now closed -- it is deterministic and needs no
   flakiness or real device to demonstrate.

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

const tabLabels = (page) => page.evaluate(() =>
  Array.from(document.querySelectorAll('.car-tab')).map(t => t.textContent.trim()));

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('usage: spell-slots-visibility-harness.js <built-sheet.html>');
    process.exit(2);
  }

  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage({ viewport: { width: 390, height: 640 }, hasTouch: true, isMobile: true });
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  await page.goto(pathToFileURL(path.resolve(file)).href);
  await page.waitForTimeout(400);

  // =========================================================================
  // 1. THE ACTUAL FIX. The tab bar must be correct in the very same
  //    synchronous stretch as the change that makes Spell Slots visible --
  //    before the engine ever reaches the microtask queue, so a
  //    MutationObserver callback (however reliably it fires) cannot yet have
  //    run. This is the check that fails against the pre-fix build and would
  //    have caught this exact class of bug before it ever shipped.
  // =========================================================================
  const sync = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    document.getElementById('f_school').value = 'Asahina Shugenja';
    T.recalcAll();
    // No await, no setTimeout: still the same task as recalcAll() itself.
    return {
      immediatelyVisible: Array.from(document.querySelectorAll('.car-tab'))
        .map(t => t.textContent.trim()).includes('Spell Slots'),
      caster: T.characterCasterLock(),
    };
  });
  check('Spell Slots reaches the tab bar synchronously, in the same task as recalcAll()',
    { immediatelyVisible: sync.immediatelyVisible, caster: sync.caster },
    { immediatelyVisible: true, caster: 'shugenja' });

  // Clean slate for the realistic end-to-end checks below.
  await page.evaluate(async () => { window.__L5R_TEST__.resetToBaseline(); await new Promise(r => setTimeout(r, 100)); });

  // =========================================================================
  // 2. The realistic path: real touch-driven Apply School, then real
  //    navigation across several tabs, matching how this was actually used.
  // =========================================================================
  await page.selectOption('#cfs_clan', { label: 'Crane' });
  await page.waitForTimeout(120);
  await page.selectOption('#cfs_family', { label: 'Asahina (+1 Intelligence)' });
  await page.tap('#cfs_applyFamily');
  await page.waitForTimeout(120);
  await page.selectOption('#cfs_school', { label: 'Asahina Shugenja' });
  await page.tap('#cfs_applySchool');
  await page.waitForTimeout(250);

  const afterApply = await tabLabels(page);
  record('Spell Slots tab present after a real Apply-School tap', afterApply.includes('Spell Slots'),
    afterApply.join(', '));

  for (const label of ['Identity', 'Rings & Traits', 'Skills', 'Combat']) {
    await page.locator('.car-tab', { hasText: label }).first().tap();
    await page.waitForTimeout(150);
  }
  const afterNav = await tabLabels(page);
  record('Spell Slots tab still present after navigating through four other tabs',
    afterNav.includes('Spell Slots'), afterNav.join(', '));

  // =========================================================================
  // 3. Losing caster status removes the tab again, just as reliably.
  // =========================================================================
  await page.evaluate(async () => { window.__L5R_TEST__.resetToBaseline(); await new Promise(r => setTimeout(r, 100)); });
  const afterReset = await tabLabels(page);
  record('Spell Slots tab absent again for a fresh (non-caster) character',
    !afterReset.includes('Spell Slots'), afterReset.join(', '));

  // =========================================================================
  // 4. refreshVisibility() itself: additive, correct return value, and safe
  //    to call when nothing changed.
  // =========================================================================
  const apiShape = await page.evaluate(() => {
    const isFunction = typeof window.__L5R_CAROUSEL__.refreshVisibility === 'function';
    return { isFunction, noopReturnsFalse: isFunction && window.__L5R_CAROUSEL__.refreshVisibility() === false };
  });
  check("refreshVisibility() exists on window.__L5R_CAROUSEL__ and returns false when nothing changed",
    apiShape, { isFunction: true, noopReturnsFalse: true });

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
