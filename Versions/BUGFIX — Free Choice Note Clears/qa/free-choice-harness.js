'use strict';
// Free Choice Note Clears (Release 8a.1, the owner's note of 30 October 2026). node free-choice-harness.js <sheet.html>
// The character check's school-choice-slots note, read from the validator itself, through the Isawa Shugenja walk of
// Phase 11.2.1's harness (Part K): two free choices (any one Lore Skill, any one High Skill), filled one at a time in the
// wizard, one unticked by hand, then Review. And the logic's edge cases: sizes, a named bare family, two Schools.
// Each scenario in a fresh context at 390 x 844, so storage starts empty.
const {chromium} = require('playwright'), path = require('path');
const SHEET = path.resolve(process.argv[2]);
const URL = 'file://' + SHEET;
const TOTAL = 9;
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
  catch (e) { failed++; console.log('FAIL FC-SCENARIO-RAN-' + name.replace(/[^a-z]+/gi, '-').toUpperCase() + '\n     ' + String(e.message || e).split('\n')[0]); }
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
const notes = (page) => page.evaluate(() => window.__L5R_TEST__.validateCharacter().findings.filter(f => f.id === 'school-choice-slots').map(f => f.title));
const title = (page) => page.evaluate(() => document.getElementById('cw112Title').textContent);
async function exactPick(page, text) {
  await page.locator('#cw112Body .cw112-card').filter({has: page.locator('.cw112-card-title', {hasText: new RegExp('^' + text + '$')})}).first().click();
}
async function next(page) {
  await page.waitForFunction(() => !document.getElementById('cw112Next').disabled);
  await page.click('#cw112Next');
}
async function toSkills(page) {
  await page.evaluate(() => document.getElementById('cl11Toolbar').click());
  await page.click('#cl11Create');
  await page.waitForFunction(() => !document.getElementById('cw112View').hidden);
  await page.fill('#cw112Name', 'Isawa Takeshi');
  await next(page);
  await exactPick(page, 'Phoenix'); await next(page);
  await exactPick(page, 'Isawa'); await next(page);
  await exactPick(page, 'Isawa Shugenja');
  await page.waitForFunction(() => document.getElementById('affinityPickModalOverlay').style.display === 'flex');
  await page.click('#affinityPick_Void'); await page.click('#affinityPickConfirm');
  await page.waitForFunction(() => window.__L5R_TEST__.CW112.appliedSchool() === 'Isawa Shugenja' && !window.__L5R_TEST__.CW112.busy);
  await next(page);
  await next(page);   // Rings & Traits, unchanged
}
// A Skill row's School tick, set on the box alone (no event), so nothing else on the sheet moves.
const tick = (page, name, on) => page.evaluate(([n, v]) => { const tr = [...document.querySelectorAll('#skillsBody tr')]
  .find(r => r.querySelector('.sk-name').value === n); tr.querySelector('.sk-school').checked = v; }, [name, on]);

(async () => {
  const browser = await chromium.launch();
  try {
    await scenario('isawa', async () => {
      const {page} = await fresh(browser);
      check('FC-ENABLED', await page.evaluate(() => !!window.__L5R_TEST__.FC8 && window.__L5R_TEST__.FC8.enabled()));
      await toSkills(page);
      check('FC-BOTH-OPEN', [await title(page), await notes(page)], ['Skills', ['Isawa Shugenja: 2 free Skill choices still open']]);
      await page.selectOption('#cw1121Slot0Pick', 'Lore');
      await page.fill('#cw1121Slot0Subject', 'History');
      await page.click('#cw1121Slot0Add');
      check('FC-ONE-FILLED', await notes(page), ['Isawa Shugenja: 1 free Skill choice still open']);
      await page.selectOption('#cw1121Slot1Pick', 'Acting');
      await page.click('#cw1121Slot1Add');
      check('FC-ALL-FILLED', await notes(page), []);
      // A free choice the player unticks as a School Skill is open again.
      await tick(page, 'Acting', false);
      const unticked = await notes(page);
      await tick(page, 'Acting', true);
      check('FC-UNTICK-REOPENS', [unticked, await notes(page)], [['Isawa Shugenja: 1 free Skill choice still open'], []]);
      // Review's list of the sheet's own findings carries no free-choice note once both are made.
      for (let i = 0; i < 20 && (await title(page)) !== 'Review'; i++) await next(page);
      check('FC-REVIEW-NO-NOTE', [await title(page), await page.evaluate(() => [...document.querySelectorAll('#cw112Body .cw112-finding')]
        .filter(li => /free Skill choice/.test(li.textContent)).length)], ['Review', 0]);
      check('FC-NO-ERRORS', page.errors, []);
    });
    await scenario('logic', async () => {
      const {page} = await fresh(browser);
      const got = await page.evaluate(() => { const L = window.__L5R_TEST__.FC8Logic; if (!L) return null;
        return {
          sizes: ['any two Skills', 'two ranks in any one Craft Skill', 'Any one Artisan Skill', 'any one High, Bugei, or Merchant Skill', 'any Skill'].map(L.size),
          // "Lore (pick one)" is read as the bare family "Lore": one subject row is that Lore, a second is a free choice.
          family: [L.filled(['Lore: Theology', 'Lore: History', 'Meditation'], ['Lore: Theology', 'Lore', 'Meditation']),
            L.filled(['Lore: History', 'Lore: Law'], ['Lore']), L.filled(['Lore', 'Lore: Law'], ['Lore'])],
          // Two Schools: the filled choices go to the first School's first.
          shared: [L.open([1, 2], 0), L.open([1, 2], 2), L.open([1, 2], 5)],
          title: [L.title('Bayushi Bushi', 1), L.title('Tsi Smith [Artisan]', 4)]};
      });
      check('FC-LOGIC-SIZES', got && got.sizes, [2, 1, 1, 1, 1]);
      check('FC-LOGIC-FAMILY-AND-SCHOOLS', got && [got.family, got.shared, got.title],
        [[0, 1, 1], [[1, 2], [0, 1], [0, 0]], ['Bayushi Bushi: 1 free Skill choice still open', 'Tsi Smith [Artisan]: 4 free Skill choices still open']]);
    });
  } finally {
    await browser.close();
  }
  console.log(passed + '/' + (passed + failed) + ' checks passed');
  process.exitCode = failed === 0 && passed === TOTAL ? 0 : 1;
})().catch((e) => { console.error(e); process.exitCode = 1; });
