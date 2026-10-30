'use strict';
// Overspend One Line (Release 8a.1, the owner's ruling of 30 October 2026). node one-line-harness.js <sheet.html>
// The Isawa Shugenja walk of the Wizard Overspend Warns harness: overspent on Rings & Traits, cleared there, overspent
// again on Skills, then on to Review and Finish. One line above the buttons on the step where the overspend turned up,
// nothing on the others, no box anywhere. A fresh context at 390 x 844, so storage starts empty.
const {chromium} = require('playwright'), path = require('path');
const SHEET = path.resolve(process.argv[2]);
const URL = 'file://' + SHEET;
const TOTAL = 11;
let passed = 0, failed = 0;
const seen = new Set();
function check(name, actual, expected) {
  if (seen.has(name)) throw Error('Duplicate check ' + name);
  seen.add(name);
  const a = JSON.stringify(actual), e = JSON.stringify(expected === undefined ? true : expected);
  if (a === e) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + '\n     expected ' + e + '\n     actual   ' + a); }
}
async function scenario(name, body) {
  try { await body(); }
  catch (e) { failed++; console.log('FAIL OL-SCENARIO-RAN-' + name.replace(/[^a-z]+/gi, '-').toUpperCase() + '\n     ' + String(e.message || e).split('\n')[0]); }
}
async function fresh(browser) {
  const context = await browser.newContext({viewport: {width: 390, height: 844}});
  const page = await context.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(String(e)));
  await page.goto(URL);
  await page.waitForFunction(() => { const T = window.__L5R_TEST__; return T && T.CL11 && T.CL11.ready && T.CW112; }, null, {timeout: 60000});
  return {context, page};
}
// Next's state, the line above the buttons, and whether XW8's box is anywhere on the page.
const nav = (page) => page.evaluate(() => [document.getElementById('cw112Next').disabled, document.getElementById('cw112Reason').textContent,
  !!document.getElementById('xw8Warning')]);
const title = (page) => page.evaluate(() => document.getElementById('cw112Title').textContent);
const overspent = (page) => page.evaluate(() => window.__L5R_TEST__.validateCharacter().findings.some(f => f.id === 'xp-overspend'));
// The line, in XW8's own words with the amount over, read from the sheet's fields and rounded as the validator rounds it.
const line = (page) => page.evaluate(() => { const n = id => parseFloat(document.getElementById(id).value || '0');
  return 'You have spent ' + Math.round((n('f_xpSpent') - n('f_xpTotal')) * 100) / 100 + ' XP more than you have. You can go on: a Disadvantage gives experience back.'; });
const redLines = (page) => page.evaluate(() => [...document.querySelectorAll('#cw112Body p.cw112-error')].filter(p => /^Overspent by /.test(p.textContent)).length);
const setTrait = (page, id, v) => page.evaluate(([i, x]) => { document.getElementById(i).value = x;
  window.__L5R_TEST__.CW112.render(); }, [id, v]);

async function exactPick(page, text) {
  await page.locator('#cw112Body .cw112-card').filter({has: page.locator('.cw112-card-title', {hasText: new RegExp('^' + text + '$')})}).first().click();
}
async function next(page) {
  await page.waitForFunction(() => !document.getElementById('cw112Next').disabled);
  await page.click('#cw112Next');
}
async function walkIsawa(page) {
  await page.evaluate(() => document.getElementById('cl11Toolbar').click());
  await page.click('#cl11Create');
  await page.waitForFunction(() => !document.getElementById('cw112View').hidden);
  await page.fill('#cw112Name', 'Isawa Takeshi');
  await next(page);
  await exactPick(page, 'Phoenix');
  await next(page);
  await exactPick(page, 'Isawa');
  await next(page);
  await exactPick(page, 'Isawa Shugenja');
  await page.waitForFunction(() => document.getElementById('affinityPickModalOverlay').style.display === 'flex');
  await page.click('#affinityPick_Void');
  await page.click('#affinityPickConfirm');
  await page.waitForFunction(() => window.__L5R_TEST__.CW112.appliedSchool() === 'Isawa Shugenja' && !window.__L5R_TEST__.CW112.busy);
  await next(page);
  await page.click('button[aria-label="Raise Willpower"]');
  await page.click('button[aria-label="Raise Void"]');
}

(async () => {
  const browser = await chromium.launch();
  try {
    await scenario('moves', async () => {
      const {page} = await fresh(browser);
      check('OL-ENABLED', await page.evaluate(() => !!window.__L5R_TEST__.OL8 && window.__L5R_TEST__.OL8.enabled()));
      await walkIsawa(page);
      const traitsTitle = await title(page);
      for (const t of ['Agility', 'Strength', 'Perception']) await page.click('button[aria-label="Raise ' + t + '"]');
      // The step where the overspend first turns up: the line, Next open, no box, no red line.
      check('OL-TRAITS-LINE', [await overspent(page), await nav(page), await redLines(page)], [true, [false, await line(page), false], 0]);
      // Another reason still blocks, and its words take the line.
      const willpower = await page.evaluate(() => document.getElementById('trait_willpower').value);
      await setTrait(page, 'trait_willpower', 11);
      const blocked = await nav(page);
      await setTrait(page, 'trait_willpower', willpower);
      check('OL-OTHER-REASON-WINS', [blocked[0], /Willpower is 11/.test(blocked[1]), blocked[1] === await line(page)], [true, true, false]);
      for (const t of ['Perception', 'Strength', 'Agility']) await page.click('button[aria-label="Lower ' + t + '"]');
      check('OL-CLEARS', [await overspent(page), await nav(page)], [false, [false, '', false]]);
      await next(page);
      // Overspent again, on Skills this time: Skills takes the line.
      for (let i = 0; i < 40 && !(await overspent(page)); i++) {
        await page.locator('#cw112Body button[aria-label^="Raise "]:not([disabled])').first().click();
      }
      check('OL-LINE-MOVES-TO-SKILLS', [await overspent(page), await title(page), await nav(page)], [true, 'Skills', [false, await line(page), false]]);
      // 11.2.2's nudge on the same step: one line, the nudge's.
      await page.click('#cw112Next');
      check('OL-NUDGE-WINS', await page.evaluate(() => [document.getElementById('cw112Next').textContent,
        document.getElementById('cw112Reason').textContent]), ['Leave for later ›', 'Some of your School’s choices are still open.']);
      // Back on Rings & Traits, still overspent: nothing there now.
      await page.click('#cw112BackBtn');
      check('OL-FIRST-STEP-FREED', [await title(page) === traitsTitle, await overspent(page), await nav(page)], [true, true, [false, '', false]]);
      await next(page);
      // On to Review: nothing on any step after Skills. A step's own nudge (11.2.2) may still speak there, in its own
      // words; the overspend line never. Any other state is reported with its step.
      const later = [];
      for (let i = 0; i < 20 && (await title(page)) !== 'Review'; i++) {
        const t = await title(page);
        if (t !== 'Skills') later.push([t, await overspent(page), await nav(page)]);
        await next(page);
      }
      const NUDGE = 'Some of your School’s choices are still open.';
      check('OL-NOT-LATER', [later.length >= 2, later.filter(s => !(s[1] && !s[2][0] && (s[2][1] === '' || s[2][1] === NUDGE) && !s[2][2]))
        .map(s => [s[0], s[2]])], [true, []]);
      // Review: no box; the sheet's own item stays in the findings list, as a warning.
      const finding = await page.evaluate(() => window.__L5R_TEST__.validateCharacter().findings.find(f => f.id === 'xp-overspend').title);
      check('OL-REVIEW', [await nav(page), await page.evaluate(() => [...document.querySelectorAll('#cw112Body .cw112-finding')]
        .filter(li => /^Overspent by /.test(li.querySelector('strong').textContent)).map(li => [li.className, li.querySelector('strong').textContent]))],
        [[false, '', false], [['cw112-finding cw112-warning', finding]]]);
      // Finish still asks once, then goes on.
      await page.click('#cw112Next');
      await page.waitForFunction(() => document.getElementById('appConfirmOverlay').style.display === 'flex', null, {timeout: 60000});
      const asked = await page.evaluate(() => document.getElementById('appConfirmMsg').textContent);
      await page.click('#appConfirmOk');
      await page.waitForFunction(() => document.getElementById('cw112View').hidden, null, {timeout: 60000});
      check('OL-FINISH-ASKS', /^You have spent [\d.]+ XP more than you have\. Finish anyway\?/.test(asked));
      check('OL-NO-ERRORS', page.errors, []);
    });
  } finally {
    await browser.close();
  }
  console.log(passed + '/' + (passed + failed) + ' checks passed');
  process.exitCode = failed === 0 && passed === TOTAL ? 0 : 1;
})().catch((e) => { console.error(e); process.exitCode = 1; });
