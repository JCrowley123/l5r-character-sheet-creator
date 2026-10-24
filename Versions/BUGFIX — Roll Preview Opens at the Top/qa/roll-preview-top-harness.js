'use strict';
// BUGFIX — Roll Preview Opens at the Top (FT-21). The roll preview's card kept its scroll from the last roll; every
// preview now opens at the top, after Cancel, ✕ or a finished roll, and a scroll made inside an open preview stays.
// A short phone screen (390 × 420) so the card scrolls; the scroll is set on the card itself, the element that scrolls.
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
const TOTAL = 10;

const preview = (page, kind) => page.evaluate(kind => {
  const T = window.__L5R_TEST__;
  const extra = kind === 'skill' ? {skillName: 'Athletics', traitName: 'Strength', traitValue: 2, skillRank: 2}
    : {traitName: 'Agility', traitValue: 2};
  window.__rpt = T.rollWithModifiers('Test roll', T.makeRollContext(kind, extra), 4, 2);
}, kind);
const shown = (page, id) => page.evaluate(id => getComputedStyle(document.getElementById(id)).display !== 'none', id);
const card = page => page.evaluate(() => {
  const c = document.querySelector('#rollPreviewOverlay .roll-modal');
  return {top: c.scrollTop, room: c.scrollHeight - c.clientHeight};
});
const scrollDown = page => page.evaluate(() => { const c = document.querySelector('#rollPreviewOverlay .roll-modal'); c.scrollTop = c.scrollHeight; });

async function main() {
  const browser = await chromium.launch(), errors = [];
  try {
    const url = pathToFileURL(path.resolve(process.argv[2])).href;
    const context = await browser.newContext({viewport: {width: 390, height: 420}, isMobile: true, hasTouch: true});
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(url);
    await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready, null, {timeout: 60000});
    await page.evaluate(() => { if (window.__L5R_TEST__.CL11.isOpen()) window.__L5R_TEST__.CL11.close(); window.__L5R_TEST__.resetToBaseline(); });

    await section('RPT', async () => {
      check('RPT-SWITCH', await page.evaluate(() => window.__L5R_TEST__.ROLL_PREVIEW_TOP_ENABLED), true);
      await preview(page, 'skill');
      await page.waitForTimeout(200);
      check('RPT-CARD-SCROLLS', [await shown(page, 'rollPreviewOverlay'), (await card(page)).room > 40], [true, true]);
      await scrollDown(page);
      const down = (await card(page)).top;
      check('RPT-SCROLLED', down > 40, true);
      await page.waitForTimeout(300);
      check('RPT-STAYS-WHILE-OPEN', (await card(page)).top, down);
      await page.evaluate(() => document.getElementById('rollPreviewCancel').click());
      await page.waitForTimeout(200);
      await preview(page, 'skill');
      await page.waitForTimeout(200);
      check('RPT-AFTER-CANCEL-AT-TOP', (await card(page)).top, 0);
      await scrollDown(page);
      await page.evaluate(() => document.getElementById('rollPreviewClose').click());
      await page.waitForTimeout(200);
      await preview(page, 'skill');
      await page.waitForTimeout(200);
      check('RPT-AFTER-CLOSE-AT-TOP', (await card(page)).top, 0);
      // A finished roll: Roll, then close the result.
      await scrollDown(page);
      await page.evaluate(() => document.getElementById('rollPreviewGo').click());
      await page.waitForTimeout(400);
      await page.evaluate(() => { const b = document.getElementById('rollModalClose'); if (b) b.click(); });
      await page.waitForTimeout(300);
      await preview(page, 'skill');
      await page.waitForTimeout(200);
      check('RPT-AFTER-ROLL-AT-TOP', (await card(page)).top, 0);
      // Another kind of roll after a scrolled Skill roll.
      await scrollDown(page);
      await page.evaluate(() => document.getElementById('rollPreviewCancel').click());
      await page.waitForTimeout(200);
      await preview(page, 'trait');
      await page.waitForTimeout(200);
      check('RPT-ANOTHER-ROLL-AT-TOP', (await card(page)).top, 0);
      await scrollDown(page);
      check('RPT-LOGIC-TO-TOP', await page.evaluate(() => {
        const R = window.__L5R_TEST__.RPTOP;
        return R ? [R.toTop(), document.querySelector('#rollPreviewOverlay .roll-modal').scrollTop] : null;
      }), [true, 0]);
      await page.evaluate(() => document.getElementById('rollPreviewCancel').click());
    });
    check('RPT-NO-PAGE-ERRORS', errors, []);
    await context.close();
  } finally {
    await browser.close();
  }
  const passed = results.filter(r => r.pass).length;
  if (results.length !== TOTAL) console.log('FAIL RPT-CHECK-COUNT ran=' + results.length + ' want=' + TOTAL);
  console.log(passed + '/' + TOTAL + ' checks passed');
  process.exit(passed === TOTAL && results.length === TOTAL ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
