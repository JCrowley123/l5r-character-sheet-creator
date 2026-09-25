/* =============================================================================
   BUGFIX — KITSUNE SHUGENJA LISTED UNDER MANTIS: AUTOMATED CHECKS

     NODE_PATH=/opt/node22/lib/node_modules node qa/kitsune-mantis-harness.js [sheet.html]

   Defaults to the live Phase 0 build; fresh browser context per scenario, 390 x 844.

   ORACLES: the School picker is the sheet's own (#cfs_school after choosing the Minor Clan); the
   wizard's cards are compared with it; the Fox entry is compared with the removed line's own data,
   which was the same School word for word; the Shugenja list is the owner's list of 21 Schools.
   ============================================================================= */

'use strict';

const { chromium } = require('playwright');
const path = require('path');

const SHEET = path.resolve(process.argv[2] || path.join(__dirname, '..', '..',
  'Part F — Cross-Platform Delivery', 'PART F — Phase 0 Source Reorganization for Maintainability',
  'l5r-character-sheet.html'));
const URL = 'file://' + SHEET;
const REMOVED = 'Kitsune Shugenja [Mantis]';
const MANTIS = ['Mantis Brawler [Bushi]', 'Moshi Shugenja', 'Tsuruchi Archer [Bushi]', 'Tsuruchi Bounty Hunter [Bushi]',
  'Yoritomo Bushi', 'Yoritomo Courtier', 'Yoritomo Shugenja'];
// The removed line held exactly this, under its own name. The Fox Clan's entry must still hold it.
const KITSUNE = {name: 'Kitsune Shugenja', benefit: 'Stamina',
  skills: 'Calligraphy, Defense, Hunting, Medicine (Herbalism), Meditation, Spellcraft, any one High or Bugei skill',
  honor: 4.5, outfit: 'Robes, Wakizashi, Knife, Scroll Satchel, Traveling Pack, 3 koku', tech: ['Essence of Chikushudo'],
  shugenja: true, affinity: 'Earth', deficiency: 'Air'};
// The owner's list of the sheet's Shugenja Schools once this one is gone.
const SHUGENJA = ['Agasha Shugenja', 'Asahina Shugenja', 'Chuda Shugenja', 'Chuda Shugenja [Snake]', 'Fuzake Shugenja',
  'Horiuchi Shugenja', 'Isawa Shugenja', 'Iuchi Shugenja', 'Kitsu Shugenja', 'Kitsune Shugenja', 'Komori Shugenja',
  'Kuni Shugenja', 'Moshi Shugenja', 'Moto Death Priest [Shugenja]', 'Ninube Shugenja', 'Seppun Shugenja', 'Soshi Shugenja',
  'Tamori Shugenja', 'Tonbo Shugenja', 'Yogo Wardmaster [Shugenja]', 'Yoritomo Shugenja'];

let passed = 0, failed = 0;
function check(name, actual, expected) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected === undefined ? true : expected);
  if (a === e) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + '\n     expected ' + e + '\n     actual   ' + a); }
}
async function scenario(name, body) {
  try { await body(); }
  catch (e) { failed++; console.log('FAIL KM-SCENARIO-RAN-' + name.replace(/[^a-z]+/gi, '-').toUpperCase() + '\n     ' + String(e.message || e).split('\n')[0]); }
}

const OPEN = [];
async function fresh(browser) {
  const context = await browser.newContext({viewport: {width: 390, height: 844}});
  OPEN.push(context);
  const page = await context.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(String(e)));
  await page.goto(URL);
  await page.waitForFunction(() => { const T = window.__L5R_TEST__; return T && T.CL11 && T.CL11.ready && T.CW112; }, null, {timeout: 15000});
  return page;
}
// The sheet's own picker: Minor Clan, then the named Minor Clan.
const pickerSchools = (page, minor) => page.evaluate((m) => {
  const set = (id, v) => { const el = document.getElementById(id); el.value = v; el.dispatchEvent(new Event('change', {bubbles: true})); };
  set('cfs_clan', 'Minor Clan'); set('cfs_minorClan', m);
  return [...document.getElementById('cfs_school').options].map(o => o.value);
}, minor);
const pickerFamilies = (page, minor) => page.evaluate((m) => {
  const set = (id, v) => { const el = document.getElementById(id); el.value = v; el.dispatchEvent(new Event('change', {bubbles: true})); };
  set('cfs_clan', 'Minor Clan'); set('cfs_minorClan', m);
  return [...document.getElementById('cfs_family').options].map(o => o.value);
}, minor);
const title = (page) => page.evaluate(() => document.getElementById('cw112Title').textContent);
const cards = (page) => page.evaluate(() => [...document.querySelectorAll('#cw112Body .cw112-cards:first-of-type .cw112-card .cw112-card-title')].map(c => c.textContent));
async function next(page) {
  await page.waitForFunction(() => !document.getElementById('cw112Next').disabled);
  await page.click('#cw112Next');
}
async function exactPick(page, text, nth) {
  const scope = nth === undefined ? page.locator('#cw112Body') : page.locator('#cw112Body .cw112-cards').nth(nth);
  await scope.locator('.cw112-card').filter({has: page.locator('.cw112-card-title', {hasText: new RegExp('^' + text.replace(/[[\]()]/g, '\\$&') + '$')})}).first().click();
}
// The wizard, to the School step of a Minor Clan's Family.
async function wizardSchools(page, minor, family) {
  await page.evaluate(() => document.getElementById('cl11Toolbar').click());
  await page.click('#cl11Create');
  await page.waitForFunction(() => !document.getElementById('cw112View').hidden);
  await page.fill('#cw112Name', 'Test');
  await next(page);
  await exactPick(page, 'Minor Clan');
  await exactPick(page, minor, 1);
  await next(page);
  await exactPick(page, family);
  await next(page);
  return [await title(page), await cards(page)];
}

async function main() {
  console.log('Kitsune Shugenja [Mantis] removal checks against: ' + SHEET);
  const browser = await chromium.launch();
  try {
    await scenario('library', async () => {
      const page = await fresh(browser);
      check('KM-MANTIS-PICKER', await pickerSchools(page, 'Mantis'), MANTIS);
      check('KM-NOT-IN-LIBRARY', await page.evaluate((n) => { const T = window.__L5R_TEST__;
        return [T.findAnySchoolLibraryEntry(n), Object.prototype.hasOwnProperty.call(T.ALL_SCHOOL_TECHNIQUES, n), T.allSchoolEntries().some(s => s.name === n)]; }, REMOVED),
        [null, false, false]);
      check('KM-FOX-UNCHANGED', [await pickerSchools(page, 'Fox'), await page.evaluate(() => window.__L5R_TEST__.findAnySchoolLibraryEntry('Kitsune Shugenja'))],
        [['Kitsune Shugenja'], KITSUNE]);
      check('KM-SHUGENJA-SCHOOLS', await page.evaluate(() => window.__L5R_TEST__.allSchoolEntries().filter(s => s.shugenja).map(s => s.name).sort()), SHUGENJA);
      // Only the School goes. The Mantis Clan's Kitsune Family is a separate entry and stays.
      check('KM-FAMILY-KEPT', await pickerFamilies(page, 'Mantis'), ['Kitsune', 'Moshi', 'Tsuruchi', 'Yoritomo']);
      check('KM-NO-PAGE-ERRORS-LIBRARY', page.errors, []);
    });

    await scenario('wizard mantis', async () => {
      const page = await fresh(browser);
      check('KM-WIZARD-MANTIS-CARDS', await wizardSchools(page, 'Mantis', 'Moshi'), ['School', MANTIS]);
    });

    await scenario('wizard fox', async () => {
      const page = await fresh(browser);
      check('KM-WIZARD-FOX-CARDS', await wizardSchools(page, 'Fox', 'Kitsune'), ['School', ['Kitsune Shugenja']]);
    });

    // A character saved while the School existed still opens: no error, and its School name kept.
    await scenario('old save', async () => {
      const page = await fresh(browser);
      const result = await page.evaluate((n) => {
        const T = window.__L5R_TEST__;
        const set = (id, v) => { const el = document.getElementById(id); el.value = v; el.dispatchEvent(new Event('change', {bubbles: true})); };
        set('cfs_clan', 'Minor Clan'); set('cfs_minorClan', 'Fox'); set('cfs_school', 'Kitsune Shugenja');
        document.getElementById('cfs_applySchool').click();
        const old = JSON.parse(JSON.stringify(T.collectData()).split('Kitsune Shugenja').join(n));
        T.resetToBaseline();
        T.applyData(old);
        T.recalcAll();
        return JSON.parse(document.getElementById('f_schoolsData').value).map(s => s.name);
      }, REMOVED);
      await page.waitForTimeout(300);
      check('KM-OLD-SAVE-LOADS', [result, page.errors], [[REMOVED], []]);
    });
  } finally {
    for (const c of OPEN) await c.close().catch(() => {});
    await browser.close();
  }
  const total = passed + failed;
  console.log(`\n${passed}/${total} checks passed`);
  process.exit(total > 0 && failed === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); console.log(`\n${passed}/${passed + failed + 1} checks passed`); process.exit(1); });
