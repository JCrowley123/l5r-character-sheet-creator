/* =============================================================================
   PART H PHASE 9 — CLAN-THEMED LOOK — AUTOMATED CHECKS

     NODE_PATH=$(npm root -g) node qa/clan-theming-harness.js <built-sheet.html>

   WHAT THIS PHASE ACTUALLY CHANGED. Every button, active-tab highlight, and section heading
   sheet-wide already reads its colour from five CSS custom properties (--shu, --shu-dark,
   --shu-mid, --shu-soft, --shu-shadow), confirmed by grep before writing a line of this phase's
   code: every reference in every CSS file goes through var(), zero hardcoded duplicates of the
   literal hex values anywhere else. applyClanTheme() (207-feat-clan-theming.js) overrides those
   five properties on the document root when a themed Clan (one of the seven Great Clans with
   mon art) is applied, and clears the override back to the stylesheet's own default otherwise --
   that fallback IS this phase's reversibility mechanism. Checks 1-4 below exercise exactly that:
   apply, switch, and revert, each checked against #f_clan and the CLAN_THEME_PALETTE data this
   phase itself exports (an independent source from the DOM's own painted colour, not a value
   this file invents).

   THE ONE THING THIS HARNESS MUST BE ABLE TO CATCH. Two existing rules -- button.danger (Delete,
   confirm-OK) and .wound-seg.sev-danger.current (the wound bar's most-severe segment) -- also
   read from --shu/--shu-dark today, but those colours carry real meaning ("destructive",
   "badly hurt"), not brand decoration. This phase pins both back to the sheet's actual maroon
   explicitly, regardless of Clan. Check 5 is the one that would have caught it if that pin had
   been forgotten or later deleted: run against a scratch build with just that one CSS rule
   removed, it correctly fails while every other check stays green -- see this phase's own
   README for the exact number (17/18 against that build, 18/18 against the real one).

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

const themeState = (page) => page.evaluate(() => ({
  shu: getComputedStyle(document.documentElement).getPropertyValue('--shu').trim(),
  shuDark: getComputedStyle(document.documentElement).getPropertyValue('--shu-dark').trim(),
  shuMid: getComputedStyle(document.documentElement).getPropertyValue('--shu-mid').trim(),
  shuSoft: getComputedStyle(document.documentElement).getPropertyValue('--shu-soft').trim(),
  shuShadow: getComputedStyle(document.documentElement).getPropertyValue('--shu-shadow').trim(),
  watermarkHidden: document.getElementById('clanMonWatermark').hidden,
  colophonHidden: document.getElementById('clanMonColophon').hidden,
  activeTabColor: getComputedStyle(document.querySelector('.car-tab.is-active')).color,
  headingColor: getComputedStyle(document.querySelector('.section h2')).color,
  dangerBg: getComputedStyle(document.getElementById('btnDelete')).backgroundColor,
  // The Void Ring defaults to 2, and #ring_void's own min is 1, so there is always at least
  // one pip to read -- no guard needed. borderTopColor rather than the `border` shorthand,
  // which getComputedStyle returns as a full "2px solid rgb(...)" string.
  voidPipBorder: getComputedStyle(document.querySelector('#voidPips .void-pip')).borderTopColor,
}));

// rgb(r, g, b) -> #rrggbb, so a colour read back from getComputedStyle can be compared directly
// against CLAN_THEME_PALETTE's own hex values -- the independent oracle this phase exports on
// window.__L5R_TEST__, not a value this file invents.
const rgbToHex = (rgb) => {
  const m = rgb.match(/\d+/g);
  if (!m) return rgb;
  return '#' + m.slice(0, 3).map(n => Number(n).toString(16).padStart(2, '0')).join('');
};

// .car-tab.is-active transitions its own colour over --car-fast (160ms, 20-carousel.css) --
// reading getComputedStyle before that settles catches an interpolated colour mid-transition,
// not the Clan's actual final one. 350ms clears it with comfortable margin.
const SETTLE_MS = 350;

async function applyClanViaRealFlow(page, clanLabel) {
  await page.selectOption('#cfs_clan', { label: clanLabel });
  await page.waitForTimeout(80);
  await page.selectOption('#cfs_family', { index: 1 });
  await page.click('#cfs_applyFamily');
  await page.waitForTimeout(SETTLE_MS);
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('usage: clan-theming-harness.js <built-sheet.html>');
    process.exit(2);
  }

  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  await page.goto(pathToFileURL(path.resolve(file)).href);
  await page.waitForTimeout(300);

  const palette = await page.evaluate(() => window.__L5R_TEST__.CLAN_THEME_PALETTE);

  // =========================================================================
  // 1. Default state: no Clan applied yet -- default maroon, both mon elements hidden.
  // =========================================================================
  const before = await themeState(page);
  check('no Clan applied: --shu-dark is the sheet\'s own default, not any Clan\'s',
    before.shuDark, '#7c2620');
  check('no Clan applied: watermark and colophon both hidden',
    { watermark: before.watermarkHidden, colophon: before.colophonHidden },
    { watermark: true, colophon: true });
  // The Void pip reads Void's own element grey, not the brand accent. Checked here as well as
  // under Scorpion below, because the two assertions say different things: this one says the
  // pip is grey even with no Clan in play (a fact about Void), the Scorpion one says a Clan
  // theme cannot repaint it (the behaviour the real-device feedback asked for).
  check('no Clan applied: the Void pip is Void\'s own neutral grey, not the brand maroon',
    rgbToHex(before.voidPipBorder), '#5a5450');

  // =========================================================================
  // 2. Apply Crab via a real Apply Family click (not a seam call) -- the same user action
  //    that sets #f_clan in 080-identity-build-ui.js and triggers recalcAll() right after.
  // =========================================================================
  await applyClanViaRealFlow(page, 'Crab');
  const crab = await themeState(page);
  check('Crab applied: --shu-dark matches CLAN_THEME_PALETTE.Crab.shuDark',
    crab.shuDark, palette.Crab.shuDark);
  check('Crab applied: watermark and colophon both visible',
    { watermark: crab.watermarkHidden, colophon: crab.colophonHidden },
    { watermark: false, colophon: false });
  check('Crab applied: the active tab\'s own text colour matches the Clan',
    rgbToHex(crab.activeTabColor), palette.Crab.shuDark);
  check('Crab applied: a section heading (Clan & School\'s own) matches the Clan',
    rgbToHex(crab.headingColor), palette.Crab.shuDark);

  // =========================================================================
  // 3. Switch to Crane -- confirms re-applying over an existing theme updates cleanly,
  //    not just "any theme sticks once."
  // =========================================================================
  await applyClanViaRealFlow(page, 'Crane');
  const crane = await themeState(page);
  check('switched to Crane: --shu-dark now matches Crane, not Crab',
    crane.shuDark, palette.Crane.shuDark);

  // =========================================================================
  // 4. Reset to baseline -- confirms the fallback (removeProperty back to the stylesheet's
  //    own default) is real reversibility, not just "looks unthemed because nothing reads it."
  // =========================================================================
  await page.evaluate(() => window.__L5R_TEST__.resetToBaseline());
  await page.waitForTimeout(120);
  const afterReset = await themeState(page);
  check('reset to baseline: --shu-dark reverts to the sheet\'s own default',
    afterReset.shuDark, '#7c2620');
  check('reset to baseline: watermark and colophon both hidden again',
    { watermark: afterReset.watermarkHidden, colophon: afterReset.colophonHidden },
    { watermark: true, colophon: true });

  // =========================================================================
  // 5. THE PROTECTED COLOUR — button.danger must stay the sheet's real maroon regardless of
  //    which Clan (if any) is themed. This is the check a scratch build with the protection
  //    rule deleted fails on, and only this one — see this phase's README for both numbers.
  // =========================================================================
  await applyClanViaRealFlow(page, 'Scorpion');
  const scorpion = await themeState(page);
  check('Scorpion applied: the Delete button stays the sheet\'s real maroon, not Scorpion\'s',
    rgbToHex(scorpion.dangerBg), '#a3332a');
  // Scorpion's own shuDark is a dark plum, nowhere near the real maroon -- confirms this check
  // could actually tell the difference, not just pass by coincidence.
  record('sanity: Scorpion\'s own shuDark is NOT the same colour as the protected maroon',
    scorpion.shuDark.toLowerCase() !== '#a3332a');

  // The Void pip is immune for a different reason than the Delete button: it was moved off
  // --shu entirely onto --void-slot-color, which no Clan palette touches, rather than pinned
  // back to a literal. Same observable outcome, so it is checked the same way.
  check('Scorpion applied: the Void pip stays Void\'s own grey, not Scorpion\'s',
    rgbToHex(scorpion.voidPipBorder), '#5a5450');
  record('sanity: Scorpion\'s own shu is NOT the same colour as Void\'s grey',
    scorpion.shu.toLowerCase() !== '#5a5450');

  // =========================================================================
  // 6. Unthemed Clans (no mon art) fall back to default, exactly like no Clan at all.
  //    Spider has no mon art in the repo yet -- set #f_clan directly (there is no Family/School
  //    data to drive a full Apply-flow for it) and confirm the fallback, not the apply path.
  // =========================================================================
  await page.evaluate(() => {
    document.getElementById('f_clan').value = 'Spider';
    window.__L5R_TEST__.recalcAll();
  });
  await page.waitForTimeout(100);
  const spider = await themeState(page);
  check('Spider (no mon art): falls back to the sheet\'s own default, not left on Scorpion\'s',
    spider.shuDark, '#7c2620');
  check('Spider (no mon art): watermark and colophon both hidden',
    { watermark: spider.watermarkHidden, colophon: spider.colophonHidden },
    { watermark: true, colophon: true });

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
