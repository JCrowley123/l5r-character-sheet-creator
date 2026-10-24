'use strict';
// BUGFIX — Clan and School Pickers After Cancel (FT-44, the owner's check B1 of 22 October 2026).
// Cancel (or ✕) on the question before Apply sets the Clan & School pickers back to the character's own; Replace still
// applies; another confirmation's Cancel leaves the pickers; Open on the open character (Characters list) restores them.
// Synthetic characters only; every tap on Apply and on the question is a real page.click.
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const results = [];
function check(id, actual, want = true) {
  if (results.some(x => x.id === id)) throw Error('Duplicate check: ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(want);
  results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + String(JSON.stringify(actual)).slice(0, 500)
    + ' want=' + String(JSON.stringify(want)).slice(0, 300)));
}
async function section(id, run) { try { await run(); } catch (e) { check(id + '-EXCEPTION', String(e.stack), 'no exception'); } }
const TOTAL = 16;
const CRANE = {clan: 'Crane', family: 'Kakita', school: 'Kakita Bushi'};
const LION = {clan: 'Lion', family: 'Matsu', school: 'Kitsu Shugenja'};

const staging = page => page.evaluate(() => {
  const $ = id => document.getElementById(id);
  return {clan: $('cfs_clan').value, family: $('cfs_family').value, school: $('cfs_school').value};
});
const saved = page => page.evaluate(() => {
  const f = window.__L5R_TEST__.collectData().fields;
  return {clan: f.f_clan, family: f.f_family, school: f.f_school};
});
const stage = (page, p) => page.evaluate(p => {
  const set = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', {bubbles: true})); };
  set('cfs_clan', p.clan); set('cfs_family', p.family); set('cfs_school', p.school);
}, p);
const dialog = page => page.evaluate(() => {
  const o = document.getElementById('appConfirmOverlay');
  return o && o.style.display === 'flex' ? document.getElementById('appConfirmMsg').textContent : null;
});
// The character built by script (the wizard's way: no question), Apply Family then Apply School.
const build = async (page, p) => {
  await stage(page, p);
  await page.evaluate(() => { document.getElementById('cfs_applyFamily').click(); document.getElementById('cfs_applySchool').click(); });
  await page.waitForTimeout(200);
};
const tapAndAnswer = async (page, apply, answer) => {
  await page.click(apply);
  await page.waitForTimeout(200);
  const asked = await dialog(page);
  if (asked !== null) { await page.click(answer); await page.waitForTimeout(300); }
  return asked;
};

async function main() {
  const browser = await chromium.launch(), errors = [];
  try {
    const url = pathToFileURL(path.resolve(process.argv[2])).href;
    const open = async () => {
      const context = await browser.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
      const page = await context.newPage();
      page.on('pageerror', e => errors.push(String(e)));
      await page.goto(url);
      await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready, null, {timeout: 60000});
      await page.evaluate(() => { if (window.__L5R_TEST__.CL11.isOpen()) window.__L5R_TEST__.CL11.close(); });
      return {context, page};
    };

    let {context, page} = await open();
    await section('CFC-CANCEL', async () => {
      check('CFC-SWITCH', await page.evaluate(() => window.__L5R_TEST__.CFS_CANCEL_ENABLED), true);
      await build(page, CRANE);
      check('CFC-BUILT', await saved(page), CRANE);
      await stage(page, LION);
      const asked = await tapAndAnswer(page, '#cfs_applySchool', '#appConfirmCancel');
      check('CFC-SCHOOL-ASKS', /^Replace your School, Kakita Bushi, with Kitsu Shugenja\?/.test(asked || ''), true);
      check('CFC-SCHOOL-CANCEL-PICKERS-BACK', await staging(page), CRANE);
      check('CFC-SCHOOL-CANCEL-SAVE-UNCHANGED', await saved(page), CRANE);
      await stage(page, LION);
      await tapAndAnswer(page, '#cfs_applyFamily', '#appConfirmCancel');
      check('CFC-FAMILY-CANCEL-PICKERS-BACK', await staging(page), CRANE);
      await stage(page, LION);
      await tapAndAnswer(page, '#cfs_applySchool', '#appConfirmX');
      check('CFC-CLOSE-PICKERS-BACK', await staging(page), CRANE);
      // Replace still applies, and the pickers keep what was applied.
      await stage(page, LION);
      await tapAndAnswer(page, '#cfs_applySchool', '#appConfirmOk');
      check('CFC-REPLACE-APPLIES', (await saved(page)).school, 'Kitsu Shugenja');
      check('CFC-REPLACE-PICKERS-KEEP', await staging(page), LION);
    });
    await context.close();

    // Another confirmation (unsaved work, New character): its Cancel leaves the staged pick.
    ({context, page} = await open());
    await section('CFC-OTHER', async () => {
      await build(page, CRANE);
      await stage(page, LION);
      await page.evaluate(() => { window.__L5R_TEST__.CL11.createNew(); });
      await page.waitForTimeout(300);
      check('CFC-OTHER-QUESTION-SHOWN', /has not been saved/.test((await dialog(page)) || ''), true);
      await page.click('#appConfirmCancel');
      await page.waitForTimeout(300);
      check('CFC-OTHER-CANCEL-LEAVES-PICKERS', await staging(page), LION);
    });
    await context.close();

    // Open on the open character, from the Characters list.
    ({context, page} = await open());
    await section('CFC-REOPEN', async () => {
      await page.evaluate(() => window.__L5R_TEST__.CL11.createNew());
      await page.evaluate(n => { document.getElementById('f_name').value = n; }, 'Test Reopen');
      await build(page, CRANE);
      await page.evaluate(() => window.__L5R_TEST__.CL11.flush());
      await stage(page, LION);
      await page.evaluate(() => window.__L5R_TEST__.CL11.open());
      await page.waitForTimeout(400);
      const row = page.locator('.cl11-row.cl11-current button[data-act="open"]');
      check('CFC-REOPEN-ROW-FOUND', await row.count(), 1);
      // A script click: the list's own handler opens it (another layer covers the row in this headless phone).
      await row.evaluate(b => b.click());
      await page.waitForTimeout(400);
      check('CFC-REOPEN-LIST-CLOSED', await page.evaluate(() => window.__L5R_TEST__.CL11.isOpen()), false);
      check('CFC-REOPEN-PICKERS-BACK', await staging(page), CRANE);
      check('CFC-REOPEN-SAVE-UNCHANGED', await saved(page), CRANE);
    });
    await context.close();
    check('CFC-NO-PAGE-ERRORS', errors, []);
  } finally {
    await browser.close();
  }
  const passed = results.filter(r => r.pass).length;
  if (results.length !== TOTAL) console.log('FAIL CFC-CHECK-COUNT ran=' + results.length + ' want=' + TOTAL);
  console.log(passed + '/' + TOTAL + ' checks passed');
  process.exit(passed === TOTAL && results.length === TOTAL ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
