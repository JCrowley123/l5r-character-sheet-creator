'use strict';
// Wizard Overspend Warns (Release 8a, the owner's ruling of 29 October 2026). node overspend-warns-harness.js <sheet.html>
// The Isawa Shugenja walk of Phase 11.2's harness (Part K), overspent on the Traits step, then on through every step to
// Finish. Each scenario in a fresh context at 390 x 844, so storage starts empty.
const {chromium} = require('playwright'), path = require('path');
const SHEET = path.resolve(process.argv[2]);
const URL = 'file://' + SHEET;
const TOTAL = 15;
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
  catch (e) { failed++; console.log('FAIL XW-SCENARIO-RAN-' + name.replace(/[^a-z]+/gi, '-').toUpperCase() + '\n     ' + String(e.message || e).split('\n')[0]); }
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
const nextState = (page) => page.evaluate(() => [document.getElementById('cw112Next').disabled, document.getElementById('cw112Reason').textContent]);
const title = (page) => page.evaluate(() => document.getElementById('cw112Title').textContent);
const wizardOpen = (page) => page.evaluate(() => !document.getElementById('cw112View').hidden);
const overspent = (page) => page.evaluate(() => window.__L5R_TEST__.validateCharacter().findings.some(f => f.id === 'xp-overspend'));
const confirmShown = (page) => page.evaluate(() => document.getElementById('appConfirmOverlay').style.display === 'flex');
// The amount over and the two numbers, read from the sheet's own fields and rounded as the validator rounds it.
const amounts = (page) => page.evaluate(() => { const n = id => parseFloat(document.getElementById(id).value || '0');
  const spent = n('f_xpSpent'), total = n('f_xpTotal'); return {spent, total, over: Math.round((spent - total) * 100) / 100}; });

async function startWizard(page) {
  await page.evaluate(() => document.getElementById('cl11Toolbar').click());
  await page.click('#cl11Create');
  await page.waitForFunction(() => !document.getElementById('cw112View').hidden);
}
async function exactPick(page, text) {
  await page.locator('#cw112Body .cw112-card').filter({has: page.locator('.cw112-card-title', {hasText: new RegExp('^' + text + '$')})}).first().click();
}
async function next(page) {
  await page.waitForFunction(() => !document.getElementById('cw112Next').disabled);
  await page.click('#cw112Next');
}
async function walkIsawa(page) {
  await startWizard(page);
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
    await scenario('overspent', async () => {
      const {page} = await fresh(browser);
      check('XW-ENABLED', await page.evaluate(() => !!window.__L5R_TEST__.XW8 && window.__L5R_TEST__.XW8.enabled()));
      await walkIsawa(page);
      // 70 XP of 40: the overspend Phase 11.2's harness (Part K) drives, within the creation cap of four.
      for (const t of ['Agility', 'Strength', 'Perception']) await page.click('button[aria-label="Raise ' + t + '"]');
      const traits = await nextState(page);
      check('XW-TRAITS-NEXT-OPEN', [await overspent(page), traits[0], traits[1]], [true, false, '']);
      const a = await amounts(page);
      check('XW-TRAITS-WARNING', await page.evaluate(() => [(document.getElementById('xw8Warning') || {}).textContent || null,
        [...document.querySelectorAll('#cw112Body p.cw112-error')].filter(p => /^Overspent by /.test(p.textContent)).length]),
        ['You have spent ' + a.over + ' XP more than you have. You can go on: a Disadvantage gives experience back.', 0]);
      // Every other reason still blocks: back on the Name step, an empty name.
      for (let i = 0; i < 10 && (await title(page)) !== 'Name'; i++) await page.click('#cw112BackBtn');
      await page.fill('#cw112Name', '');
      check('XW-NAME-STILL-BLOCKS', [await overspent(page), await nextState(page)], [true, [true, 'Enter a name to continue.']]);
      await page.fill('#cw112Name', 'Isawa Takeshi');
      // On to Review: Next opens on every step while overspent; the Advantages step's own wait still blocks.
      const steps = [];
      let busy = null;
      for (let i = 0; i < 20 && (await title(page)) !== 'Review'; i++) {
        const t = await title(page), s = await nextState(page);
        steps.push([t, s[0], await overspent(page)]);
        if (t === 'Advantages & Disadvantages') {
          busy = await page.evaluate(() => { const T = window.__L5R_TEST__; T.CW1121.busy = true; T.CW112.refreshNav();
            const out = [document.getElementById('cw112Next').disabled, document.getElementById('cw112Reason').textContent];
            T.CW1121.busy = false; T.CW112.refreshNav(); return out; });
        }
        await next(page);
      }
      check('XW-EVERY-STEP-OPEN', [steps.length >= 7, steps.every(s => s[1] === false && s[2] === true)], [true, true]);
      check('XW-ADV-BUSY-BLOCKS', busy, [true, 'Waiting for its own question…']);
      // A Brotherhood monk's Kiho step reads the same overspend: it lets the player on as well.
      check('XW-KIHO-STEP-OPEN', await page.evaluate(() => { const T = window.__L5R_TEST__, s = T.CW1122.kihoStep;
        T.XW8.guard(s); return [s.check(), T.validateCharacter().findings.some(f => f.id === 'xp-overspend')]; }), ['', true]);
      const r = await amounts(page);
      check('XW-REVIEW-WARNING', await page.evaluate(() => { const w = document.getElementById('xw8Warning');
        return [!!w && w === document.getElementById('cw112Body').firstChild, w ? w.textContent : null]; }),
        [true, 'You have spent ' + r.over + ' XP more than you have (' + r.spent + ' of ' + r.total + '). You can still finish, ' +
          'and bring it back on the sheet with a Disadvantage or by lowering a purchase.']);
      check('XW-REVIEW-FINDING-KEPT', await page.evaluate(() => [...document.querySelectorAll('#cw112Body .cw112-finding')]
        .filter(li => /^Overspent by /.test(li.querySelector('strong').textContent)).map(li => li.className)), ['cw112-finding cw112-warning']);
      check('XW-FINISH-OPEN', await page.evaluate(() => [document.getElementById('cw112Next').textContent,
        document.getElementById('cw112Next').disabled, document.getElementById('cw112Reason').textContent]), ['Finish', false, '']);
      await page.click('#cw112Next');
      await page.waitForFunction(() => document.getElementById('appConfirmOverlay').style.display === 'flex', null, {timeout: 60000});
      check('XW-FINISH-WARNS', [await page.evaluate(() => document.getElementById('appConfirmMsg').textContent), await wizardOpen(page)],
        ['You have spent ' + r.over + ' XP more than you have. Finish anyway? You can bring it back on the sheet with a ' +
          'Disadvantage or by lowering a purchase.', true]);
      await page.click('#appConfirmCancel');
      await page.waitForFunction(() => document.getElementById('appConfirmOverlay').style.display !== 'flex', null, {timeout: 60000});
      check('XW-FINISH-STAY', [await wizardOpen(page), await title(page), (await nextState(page))[0]], [true, 'Review', false]);
      await page.click('#cw112Next');
      await page.waitForFunction(() => document.getElementById('appConfirmOverlay').style.display === 'flex', null, {timeout: 60000});
      await page.click('#appConfirmOk');
      await page.waitForFunction(() => document.getElementById('cw112View').hidden, null, {timeout: 60000});
      // Closing saves the character; wait for that write itself (a long ceiling ends only a hung run).
      await page.waitForFunction(() => JSON.parse(localStorage.getItem('l5r-sheet:local:l5r-char-index') || '[]')
        .some(c => c.name === 'Isawa Takeshi'), null, {timeout: 60000});
      check('XW-FINISH-GOES-ON', [await wizardOpen(page), await confirmShown(page), await page.evaluate(() =>
        JSON.parse(localStorage.getItem('l5r-sheet:local:l5r-char-index') || '[]').map(c => c.name)), await overspent(page)],
        [false, false, ['Isawa Takeshi'], true]);
      check('XW-NO-ERRORS', page.errors, []);
    });
    await scenario('within', async () => {
      const {page} = await fresh(browser);
      await walkIsawa(page);
      for (let i = 0; i < 20 && (await title(page)) !== 'Review'; i++) await next(page);
      const before = [await overspent(page), await page.evaluate(() => !!document.getElementById('xw8Warning'))];
      await page.click('#cw112Next');
      await page.waitForFunction(() => document.getElementById('cw112View').hidden, null, {timeout: 60000});
      check('XW-WITHIN-NO-WARNING', [before, await confirmShown(page), page.errors], [[false, false], false, []]);
    });
  } finally {
    await browser.close();
  }
  console.log(passed + '/' + (passed + failed) + ' checks passed');
  process.exitCode = failed === 0 && passed === TOTAL ? 0 : 1;
})().catch((e) => { console.error(e); process.exitCode = 1; });
