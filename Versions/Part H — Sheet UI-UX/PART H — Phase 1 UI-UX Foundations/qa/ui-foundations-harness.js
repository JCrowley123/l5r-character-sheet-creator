/* =============================================================================
   PART H — PHASE 1: UI/UX FOUNDATIONS — AUTOMATED CHECKS

     NODE_PATH=$(npm root -g) node qa/ui-foundations-harness.js <built-sheet.html>

   Drives a real browser against the built single-file sheet and checks the
   thing this phase actually ships: the scroll-to-top button (a real .car-page
   scroll, not window.scrollTo — see 205-feat-ui-foundations.js). A Ring
   affinity/deficiency accent was also built and tested here, then reverted at
   the project owner's request after seeing it live — see this folder's README,
   "Reverted: the Ring accent". It does not re-check anything Phase 0's own
   qa/behaviour-harness.js already covers for the rest of the sheet.

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
    console.error('usage: ui-foundations-harness.js <built-sheet.html>');
    process.exit(2);
  }

  const browser = await chromium.launch(LAUNCH);
  // A short viewport is deliberate: the scroll-to-top tests need a tab whose content actually
  // overflows, and a full desktop viewport can fit the whole Skills list without scrolling.
  const page = await browser.newPage({ viewport: { width: 390, height: 640 } });
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  await page.goto(pathToFileURL(path.resolve(file)).href);
  await page.waitForTimeout(300);

  // =========================================================================
  // Scroll-to-top — real .car-page scrolling, not window.scrollTo
  // =========================================================================
  await page.locator('.car-tab', { hasText: 'Skills' }).first().click();
  await page.waitForTimeout(200);

  // A spacer forces real overflow regardless of how tall the Skills tab's own content happens
  // to be at this viewport — the scroll mechanism, not the sheet's current content length, is
  // what this phase is responsible for. Left in place deliberately for the "switch tabs and
  // back" checks below, which need this same tab to still be scrollable.
  await page.evaluate(() => {
    const inner = document.querySelector('.car-page:not([hidden]) .car-page-inner');
    const spacer = document.createElement('div');
    spacer.id = 'phase1TestSpacer';
    spacer.style.height = '2000px';
    inner.appendChild(spacer);
  });

  const initial = await page.evaluate(() => document.getElementById('scrollTopBtn').hidden);
  record('scroll-to-top button starts hidden on a freshly opened tab', initial === true, `hidden=${initial}`);

  const afterScrollDown = await page.evaluate(() => {
    const page = document.querySelector('.car-page:not([hidden])');
    page.scrollTop = 1000;
    page.dispatchEvent(new Event('scroll'));
    return new Promise(resolve => {
      setTimeout(() => resolve({
        hidden: document.getElementById('scrollTopBtn').hidden,
        scrollTop: page.scrollTop,
      }), 30);
    });
  });
  record('scrolling the active panel down reveals the button',
    afterScrollDown.hidden === false && afterScrollDown.scrollTop > 0,
    JSON.stringify(afterScrollDown));

  const afterClick = await page.evaluate(() => {
    document.getElementById('scrollTopBtn').click();
    const page = document.querySelector('.car-page:not([hidden])');
    return page.scrollTop;
  });
  check('clicking the button scrolls the active panel back to 0 instantly (no animation)', afterClick, 0);

  const afterScrollDownAgain = await page.evaluate(() => {
    const page = document.querySelector('.car-page:not([hidden])');
    page.scrollTop = 1000;
    page.dispatchEvent(new Event('scroll'));
    return new Promise(resolve => setTimeout(() => resolve(document.getElementById('scrollTopBtn').hidden), 30));
  });
  record('button re-hides once the panel is back within the show threshold after another scroll-down',
    afterScrollDownAgain === false, `hidden=${afterScrollDownAgain}`);

  // Switching tabs fires no 'scroll' event of its own — only the carousel's hidden-attribute
  // toggle marks that a different panel became visible, which is what the MutationObserver in
  // initScrollToTop() re-checks on. That it hides here is also, separately, guaranteed by
  // .car-page[hidden] being display:none: Chromium resets a display:none element's scrollTop
  // to 0, so the previously-scrolled Skills tab is not merely hidden from view underneath this
  // check, it is verifiably back at the top too (confirmed below) — there is no persisted
  // scroll position this button could have been wrongly left showing for.
  await page.locator('.car-tab', { hasText: 'Identity' }).first().click();
  await page.waitForTimeout(200);
  const onFreshTab = await page.evaluate(() => document.getElementById('scrollTopBtn').hidden);
  record('switching to a different tab hides the button', onFreshTab === true, `hidden=${onFreshTab}`);

  await page.locator('.car-tab', { hasText: 'Skills' }).first().click();
  await page.waitForTimeout(200);
  const backOnPreviouslyScrolledTab = await page.evaluate(() => ({
    hidden: document.getElementById('scrollTopBtn').hidden,
    scrollTop: document.querySelector('.car-page:not([hidden])').scrollTop,
  }));
  check('revisiting the previously-scrolled Skills tab: the panel itself is back at scrollTop 0 (display:none resets it), and the button correctly stays hidden',
    backOnPreviouslyScrolledTab, { hidden: true, scrollTop: 0 });

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
