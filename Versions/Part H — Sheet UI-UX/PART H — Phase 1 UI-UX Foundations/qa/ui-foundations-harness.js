/* =============================================================================
   PART H — PHASE 1: UI/UX FOUNDATIONS — AUTOMATED CHECKS

     NODE_PATH=$(npm root -g) node qa/ui-foundations-harness.js <built-sheet.html>

   Drives a real browser against the built single-file sheet and checks the
   thing this phase ships: the scroll-to-top button (a real .car-page scroll,
   not window.scrollTo — see 205-feat-ui-foundations.js).

   WHY THIS FILE IS WRITTEN THE WAY IT IS. Its first version asked
   getActiveCarPage() which page was on screen, scrolled THAT, and then asked
   updateScrollTopVisibility() — which reads the same function — whether the
   button should show. Both halves agreed, 15/15 passed, and the feature was
   broken on a real device: getActiveCarPage() was returning a page nobody was
   looking at, so the harness had been scrolling an off-screen page and
   confirming the button responded to it. A test whose oracle is the code under
   test cannot fail.

   So every check below takes "which page is the player looking at" from
   window.__L5R_CAROUSEL__.getActiveTab().panel — the carousel's own answer,
   which this phase does not own and cannot bend — and the FIRST check is that
   getActiveCarPage() agrees with it on every tab. That check is the one that
   would have caught the shipped bug.

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

/* Navigate by the carousel's own API and wait for its own settle signal, rather
   than clicking a tab and guessing a timeout — a mis-landed click was quietly
   testing the wrong tab in an earlier draft of this file. */
const nextTab = (page) => page.evaluate(async () => {
  window.__L5R_CAROUSEL__.nextTab();
  await window.__L5R_CAROUSEL__.whenSettled();
  return window.__L5R_CAROUSEL__.getActiveTab().label;
});

/* The independent oracle: the carousel's own active panel, plus whatever this
   phase's own function thinks, so the two can be compared. */
const readState = (page) => page.evaluate(() => {
  const T = window.__L5R_TEST__;
  const panel = window.__L5R_CAROUSEL__.getActiveTab().panel;
  const mine = T.getActiveCarPage();
  return {
    label: window.__L5R_CAROUSEL__.getActiveTab().label,
    agrees: panel === mine,
    panelScrollTop: panel ? panel.scrollTop : null,
    btnHidden: document.getElementById('scrollTopBtn').hidden,
  };
});

/* Scroll the panel the CAROUSEL says is active — never the one this phase's own
   code picks — and dispatch the event a real finger would produce. */
const scrollActivePanel = (page, top) => page.evaluate(async (top) => {
  const panel = window.__L5R_CAROUSEL__.getActiveTab().panel;
  panel.scrollTop = top;
  panel.dispatchEvent(new Event('scroll'));
  await new Promise(r => setTimeout(r, 30));
  return panel.scrollTop;
}, top);

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('usage: ui-foundations-harness.js <built-sheet.html>');
    process.exit(2);
  }

  const browser = await chromium.launch(LAUNCH);
  // A short viewport is deliberate: the scroll tests need panels whose content
  // actually overflows, and a desktop viewport fits most tabs without scrolling.
  const page = await browser.newPage({ viewport: { width: 390, height: 640 } });
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  await page.goto(pathToFileURL(path.resolve(file)).href);
  await page.waitForTimeout(400);

  // =========================================================================
  // 1. getActiveCarPage() agrees with the carousel, on every tab
  //    This is the check the first version of this harness did not have, and
  //    the one that fails loudly against the bug that shipped.
  // =========================================================================
  const disagreements = [];
  const visited = [];
  const tabCount = await page.evaluate(() => window.__L5R_CAROUSEL__.getTabCount());
  for (let i = 0; i < tabCount; i++) {
    const state = await readState(page);
    visited.push(state.label);
    if (!state.agrees) disagreements.push(state.label);
    await nextTab(page);
  }
  record(`getActiveCarPage() matches the carousel's own active panel on all ${tabCount} tabs`,
    disagreements.length === 0,
    disagreements.length ? `disagreed on: ${disagreements.join(', ')}` : `checked: ${visited.join(', ')}`);

  // =========================================================================
  // 2. The button tracks the panel the player is actually on
  // =========================================================================
  // Give the panel we are on real overflow, so a 1000px scroll is possible.
  await page.evaluate(() => {
    const panel = window.__L5R_CAROUSEL__.getActiveTab().panel;
    const spacer = document.createElement('div');
    spacer.style.height = '2000px';
    spacer.className = 'phase1-test-spacer';
    panel.querySelector('.car-page-inner').appendChild(spacer);
  });

  const atTop = await readState(page);
  record('button is hidden while the active panel sits at the top',
    atTop.btnHidden === true, `tab=${atTop.label} scrollTop=${atTop.panelScrollTop}`);

  const scrolledTo = await scrollActivePanel(page, 1000);
  const scrolled = await readState(page);
  record('scrolling the panel the carousel says is active reveals the button',
    scrolled.btnHidden === false && scrolled.panelScrollTop >= 300,
    `tab=${scrolled.label} scrollTop=${scrolledTo} hidden=${scrolled.btnHidden}`);

  const afterClick = await page.evaluate(async () => {
    document.getElementById('scrollTopBtn').click();
    await new Promise(r => setTimeout(r, 30));
    return window.__L5R_CAROUSEL__.getActiveTab().panel.scrollTop;
  });
  check('clicking the button returns that same panel to 0 instantly (no animation)', afterClick, 0);

  // =========================================================================
  // 3. Across a tab change. Leaving a tab returns it to its own top: the
  //    carousel marks off-screen pages inert and their computed
  //    content-visibility becomes `auto`, which drops the scroll offset along
  //    with the skipped layout. That is pre-existing carousel behaviour, not
  //    this phase's, and it is measured here rather than assumed — an earlier
  //    draft of this file asserted the opposite and was simply wrong.
  // =========================================================================
  const scrolledTab = (await readState(page)).label;
  await scrollActivePanel(page, 1000);
  const beforeSwitch = await readState(page);
  record('button showing again after re-scrolling the same panel',
    beforeSwitch.btnHidden === false, `tab=${beforeSwitch.label}`);

  await nextTab(page);
  const onNeighbour = await readState(page);
  record('moving to the next tab, which is at its own top, hides the button',
    onNeighbour.btnHidden === true && onNeighbour.panelScrollTop === 0,
    `tab=${onNeighbour.label} scrollTop=${onNeighbour.panelScrollTop} hidden=${onNeighbour.btnHidden}`);

  await page.evaluate(async () => {
    window.__L5R_CAROUSEL__.prevTab();
    await window.__L5R_CAROUSEL__.whenSettled();
  });
  await page.waitForTimeout(50);
  const backAgain = await readState(page);
  record('returning to the previously-scrolled tab lands at its top, button correctly hidden',
    backAgain.btnHidden === true && backAgain.panelScrollTop === 0 && backAgain.label === scrolledTab,
    `tab=${backAgain.label} scrollTop=${backAgain.panelScrollTop} hidden=${backAgain.btnHidden}`);

  // And scrolling again on that same tab must still bring it back — proof the
  // listener survives a round trip through the inert/content-visibility cycle.
  await scrollActivePanel(page, 1000);
  const rescrolled = await readState(page);
  record('scrolling that tab again after the round trip still reveals the button',
    rescrolled.btnHidden === false && rescrolled.panelScrollTop >= 300,
    `tab=${rescrolled.label} scrollTop=${rescrolled.panelScrollTop} hidden=${rescrolled.btnHidden}`);

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
