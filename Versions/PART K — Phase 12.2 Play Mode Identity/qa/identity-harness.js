/* =============================================================================
   PART K PHASE 12.2 (part 3) — IDENTITY IN PLAY: AUTOMATED CHECKS

     NODE_PATH=<node_modules> node qa/identity-harness.js [sheet.html]

   Oracles are the page itself: what real keystrokes leave in a field, whether a listener the
   harness attached runs, whether + Add School opens its dropdown, and the computed style. The
   owner's ruling is held both ways: the ranks lock, and the points and Taint do NOT.
   ============================================================================= */

'use strict';

const { chromium } = require('playwright');
const path = require('path');

const SHEET = path.resolve(process.argv[2] || path.join(__dirname, '..', '..',
  'Part F — Cross-Platform Delivery', 'PART F — Phase 0 Source Reorganization for Maintainability',
  'l5r-character-sheet.html'));
const URL = 'file://' + SHEET;
const LOCKED = ['f_name', 'f_clan', 'f_family', 'f_school', 'f_gender', 'f_age', 'f_insightBonus',
  'f_honorRank', 'f_gloryRank', 'f_statusRank', 'f_xpTotal', 'f_xpAdjust'];
const PLAY_EDITABLE = ['f_honorPts', 'f_gloryPts', 'f_statusPts', 'f_taint'];

let passed = 0, failed = 0;
function check(name, actual, expected) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected === undefined ? true : expected);
  if (a === e) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + '\n     expected ' + e + '\n     actual   ' + String(a).slice(0, 600)); }
}
async function scenario(name, body) {
  try { await body(); }
  catch (e) { failed++; console.log('FAIL ID122-SCENARIO-RAN-' + name.replace(/[^a-z]+/gi, '-').toUpperCase() + '\n     ' + String(e.message || e).split('\n')[0]); }
}

const OPEN = [];
async function fresh(browser) {
  const context = await browser.newContext({viewport: {width: 390, height: 844}});
  OPEN.push(context);
  const page = await context.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(String(e)));
  await page.goto(URL);
  await page.waitForFunction(() => { const T = window.__L5R_TEST__; return T && T.CL11 && T.CL11.ready; }, null, {timeout: 15000});
  return page;
}
const setMode = (page, m) => page.evaluate((x) => { const M = window.__L5R_TEST__.MODES12; if (M) M.set(x); }, m);
// Real keystrokes into a field on its own tab; returns what the field holds afterwards.
async function typeInto(page, id, text) {
  await page.evaluate(async (i) => {
    const C = window.__L5R_CAROUSEL__, el = document.getElementById(i);
    const tab = el.closest('.car-page').dataset.tabLabel;
    if (C.getActiveTab().label !== tab) { C.goToTab(tab); if (C.whenSettled) await C.whenSettled(); }
    el.focus();
    if (el.type !== 'number') el.setSelectionRange(el.value.length, el.value.length);
  }, id);
  await page.keyboard.type(text);
  return page.evaluate((i) => document.getElementById(i).value, id);
}
const reaches = (page, id) => page.evaluate((i) => {
  const el = document.getElementById(i); let n = 0; const probe = () => { n++; };
  el.addEventListener('input', probe); el.dispatchEvent(new Event('input', {bubbles: true})); el.removeEventListener('input', probe);
  return n;
}, id);
const lockedState = (page, ids) => page.evaluate((list) => list.map((i) => document.getElementById(i).readOnly), ids);

async function main() {
  console.log('Identity in Play (part 3) checks against: ' + SHEET);
  const browser = await chromium.launch();
  try {
    await scenario('lock', async () => {
      const page = await fresh(browser);
      check('ID122-ENABLED', await page.evaluate(() => window.__L5R_TEST__.MODES122_ENABLED));
      check('ID122-MANAGEMENT-NAME-TYPES', await typeInto(page, 'f_name', 'Aoi'), 'Aoi');

      await setMode(page, 'play');
      check('ID122-PLAY-FIELDS-READ-ONLY', await lockedState(page, LOCKED), LOCKED.map(() => true));
      check('ID122-PLAY-NAME-TYPING-BLOCKED', await typeInto(page, 'f_name', 'xyz'), 'Aoi');
      check('ID122-PLAY-XP-TYPING-BLOCKED', await typeInto(page, 'f_xpTotal', '9'), '40');
      check('ID122-PLAY-RANK-TYPING-BLOCKED', await typeInto(page, 'f_honorRank', '9'), '5');
      check('ID122-PLAY-NAME-EVENTS-STOPPED', await reaches(page, 'f_name'), 0);
      // The owner's ruling: points and Taint stay editable in Play.
      check('ID122-PLAY-POINTS-AND-TAINT-EDITABLE', await lockedState(page, PLAY_EDITABLE), [false, false, false, false]);
      check('ID122-PLAY-TAINT-TYPES', await page.evaluate(() => { document.getElementById('f_taint').value = ''; return true; }) && await typeInto(page, 'f_taint', '2'), '2');
      check('ID122-PLAY-HONOR-POINTS-EVENTS-REACH', await reaches(page, 'f_honorPts'), 1);
      check('ID122-PLAY-SHOWS-PLAIN-TEXT', await page.evaluate(() => {
        const n = getComputedStyle(document.getElementById('f_name')), x = getComputedStyle(document.getElementById('f_xpTotal'));
        return [n.borderTopColor === 'rgba(0, 0, 0, 0)', x.appearance === 'textfield' || x.MozAppearance === 'textfield'];
      }), [true, true]);
      // + Add School stays inert even when the sheet's own recalc has enabled the button.
      check('ID122-PLAY-ADD-SCHOOL-INERT', await page.evaluate(() => {
        const b = document.getElementById('btnAddSchoolToggle'), s = document.getElementById('addSchoolSelect');
        b.disabled = false; s.style.display = 'none';
        b.click();
        return [s.style.display, getComputedStyle(b).display];
      }), ['none', 'none']);
      // The sheet's own code still writes in Play: a recalc keeps its derived displays current.
      check('ID122-PLAY-RECALC-STILL-WRITES', await page.evaluate(() => {
        const T = window.__L5R_TEST__; document.getElementById('f_xpSpent').value = '999'; T.recalcAll();
        return document.getElementById('f_xpSpent').value !== '999';
      }));

      await setMode(page, 'management');
      check('ID122-BACK-TO-MANAGEMENT', [await lockedState(page, ['f_name', 'f_xpTotal', 'f_honorRank']),
        await page.evaluate(() => document.getElementById('f_rank').readOnly), await typeInto(page, 'f_name', '!')],
        [[false, false, false], true, 'Aoi!']);
      check('ID122-NO-PAGE-ERRORS-LOCK', page.errors, []);
    });

    await scenario('opened from the list', async () => {
      const page = await fresh(browser);
      await page.evaluate(() => { const el = document.getElementById('f_name'); el.value = 'Doji Satsume'; el.dispatchEvent(new Event('input', {bubbles: true})); });
      await page.evaluate(() => document.getElementById('btnSaveAs').click());
      await page.waitForFunction(() => !!document.getElementById('charSelect').value);
      const id = await page.evaluate(() => document.getElementById('charSelect').value);
      await page.evaluate(() => document.getElementById('cl11Toolbar').click());
      await page.waitForFunction(() => !document.getElementById('cl11View').hidden);
      await page.click(`.cl11-row[data-id="${id}"] .cl11-open`);
      await page.waitForFunction(() => document.getElementById('cl11View').hidden);
      check('ID122-OPEN-FROM-LIST-LOCKS-THE-TAB', [await lockedState(page, ['f_name', 'f_xpTotal']), await lockedState(page, ['f_honorPts'])],
        [[true, true], [false]]);
      check('ID122-NO-PAGE-ERRORS-LIST', page.errors, []);
    });
  } finally {
    for (const c of OPEN) await c.close().catch(() => {});
    await browser.close();
  }
  console.log(`\n${passed}/${passed + failed} checks passed`);
  process.exitCode = failed ? 1 : 0;
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
