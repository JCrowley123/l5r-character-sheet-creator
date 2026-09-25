/* =============================================================================
   BUGFIX — IMPORT FILE PICKER FILTER: AUTOMATED CHECKS

     NODE_PATH=/opt/node22/lib/node_modules node qa/import-filter-harness.js [sheet.html]

   Defaults to the live Phase 0 build; fresh browser context per scenario, 390 x 844.

   WHAT A HEADLESS BROWSER CANNOT SHOW: the iPhone's picker greying a file out. Playwright hands a
   file to the control whatever its filter says, so the oracle for the picker is the control's own
   `accept` attribute, which is what iOS reads. The imports are then driven for real: an older save
   named ".l5r" with no format number (the owner's case), a file that is not JSON, and JSON that is
   not a character, the last two to prove lifting the filter lets nothing unsafe through.
   ============================================================================= */

'use strict';

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const os = require('os');

const SHEET = path.resolve(process.argv[2] || path.join(__dirname, '..', '..',
  'Part F — Cross-Platform Delivery', 'PART F — Phase 0 Source Reorganization for Maintainability',
  'l5r-character-sheet.html'));
const URL = 'file://' + SHEET;
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'l5r-import-filter-'));

let passed = 0, failed = 0;
function check(name, actual, expected) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected === undefined ? true : expected);
  if (a === e) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + '\n     expected ' + e + '\n     actual   ' + a); }
}
async function scenario(name, body) {
  try { await body(); }
  catch (e) { failed++; console.log('FAIL IF-SCENARIO-RAN-' + name.replace(/[^a-z]+/gi, '-').toUpperCase() + '\n     ' + String(e.message || e).split('\n')[0]); }
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
const accept = (page, id) => page.evaluate((i) => { const el = document.getElementById(i); return el ? el.getAttribute('accept') : 'missing'; }, id);
const rows = (page) => page.evaluate(() => [...document.querySelectorAll('#cl11List li .cl11-name, #cl11List li')].length
  ? [...document.querySelectorAll('#cl11List > li')].map(li => (li.querySelector('.cl11-name') || li).textContent.trim().slice(0, 40)) : []);
async function openCharacters(page) {
  await page.evaluate(() => document.getElementById('cl11Toolbar').click());
  await page.waitForFunction(() => !!document.getElementById('cl11ImportFile'));
}
// An older save: what the sheet writes today, less its format number, named ".l5r".
async function legacyFile(page, name) {
  const data = await page.evaluate((n) => {
    const T = window.__L5R_TEST__;
    const el = document.getElementById('f_name'); el.value = n; el.dispatchEvent(new Event('input', {bubbles: true}));
    const d = T.collectData(); delete d.schemaVersion; return d;
  }, name);
  const file = path.join(TMP, name.replace(/[^a-z0-9]+/gi, '_') + '.l5r');
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  return file;
}
// The sheet's own status line (setStatus writes #statusMsg).
const status = (page) => page.evaluate(() => document.getElementById('statusMsg').textContent.trim());

async function main() {
  console.log('Import file picker filter checks against: ' + SHEET);
  const browser = await chromium.launch();
  try {
    await scenario('filters', async () => {
      const page = await fresh(browser);
      check('IF-ENABLED', await page.evaluate(() => window.__L5R_TEST__.IMPORT_FILE_FILTER_FIX_ENABLED));
      check('IF-NO-FILTER-TOOLBAR', await accept(page, 'fileImport'), null);
      await openCharacters(page);
      check('IF-NO-FILTER-LIST', await accept(page, 'cl11ImportFile'), null);
      // Closing and reopening the screen must not bring the filter back.
      await page.evaluate(() => window.__L5R_TEST__.CL11.close());
      await openCharacters(page);
      check('IF-NO-FILTER-LIST-REOPENED', await accept(page, 'cl11ImportFile'), null);
    });

    await scenario('old save', async () => {
      const page = await fresh(browser);
      const file = await legacyFile(page, 'Old Save Hana');
      await openCharacters(page);
      const before = (await rows(page)).length;
      await page.setInputFiles('#cl11ImportFile', file);
      await page.waitForFunction((n) => document.querySelectorAll('#cl11List > li').length > n, before);
      check('IF-OLD-SAVE-IMPORTS', [path.extname(file), (await rows(page)).length - before,
        (await rows(page)).some(r => /Old Save Hana/.test(r))], ['.l5r', 1, true]);
      check('IF-NO-PAGE-ERRORS', page.errors, []);
    });

    await scenario('toolbar old save', async () => {
      const page = await fresh(browser);
      const file = await legacyFile(page, 'Toolbar Save Kenji');
      await page.evaluate(() => { const el = document.getElementById('f_name'); el.value = ''; el.dispatchEvent(new Event('input', {bubbles: true})); });
      await page.setInputFiles('#fileImport', file);
      await page.waitForFunction(() => document.getElementById('f_name').value === 'Toolbar Save Kenji', null, {timeout: 5000});
      check('IF-TOOLBAR-OLD-SAVE-LOADS', [await page.evaluate(() => document.getElementById('f_name').value), page.errors], ['Toolbar Save Kenji', []]);
    });

    // Lifting the filter lets any file be picked; the import itself still refuses non-saves.
    await scenario('refusals', async () => {
      const page = await fresh(browser);
      const png = path.join(TMP, 'picture.png');
      fs.writeFileSync(png, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 1, 2, 3]));
      const notChar = path.join(TMP, 'list.json');
      fs.writeFileSync(notChar, JSON.stringify({items: [1, 2, 3]}));
      await openCharacters(page);
      const before = await rows(page);
      await page.setInputFiles('#cl11ImportFile', png);
      await page.waitForTimeout(400);
      const afterPng = [await rows(page), await status(page)];
      await page.setInputFiles('#cl11ImportFile', notChar);
      await page.waitForTimeout(400);
      const afterJson = [await rows(page), await status(page)];
      check('IF-NOT-JSON-REFUSED', [afterPng[0], /not valid JSON/.test(afterPng[1])], [before, true]);
      check('IF-NOT-A-SAVE-REFUSED', [afterJson[0], /not a character save/.test(afterJson[1])], [before, true]);
      check('IF-NO-PAGE-ERRORS-REFUSALS', page.errors, []);
    });
  } finally {
    for (const c of OPEN) await c.close().catch(() => {});
    await browser.close();
    fs.rmSync(TMP, {recursive: true, force: true});
  }
  const total = passed + failed;
  console.log(`\n${passed}/${total} checks passed`);
  process.exit(total > 0 && failed === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); console.log(`\n${passed}/${passed + failed + 1} checks passed`); process.exit(1); });
