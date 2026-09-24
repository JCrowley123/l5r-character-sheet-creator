/* =============================================================================
   PART K PHASE 11.2 — CREATION WIZARD: AUTOMATED CHECKS

     NODE_PATH=/opt/node22/lib/node_modules node qa/wizard-harness.js [sheet.html]

   Defaults to the live Phase 0 build. Each scenario runs in a fresh browser context at
   390 x 844, so storage starts empty.

   THE ORACLE IS THE SHEET DOING IT BY HAND. The wizard claims to add screens and no rules,
   so its central check makes the same choices twice, once through the wizard and once
   through the sheet's own selects and buttons, and requires collectData() to be identical.
   Option lists are compared with the sheet's own selects, and the Review list with
   validateCharacter() called directly.
   ============================================================================= */

'use strict';

const { chromium } = require('playwright');
const path = require('path');

const SHEET = path.resolve(process.argv[2] || path.join(__dirname, '..', '..',
  'Part F — Cross-Platform Delivery', 'PART F — Phase 0 Source Reorganization for Maintainability',
  'l5r-character-sheet.html'));
const URL = 'file://' + SHEET;

let passed = 0, failed = 0;
function check(name, actual, expected) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected === undefined ? true : expected);
  if (a === e) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + '\n     expected ' + e + '\n     actual   ' + a); }
}
async function scenario(name, body) {
  try { await body(); }
  catch (e) { failed++; console.log('FAIL CW-SCENARIO-RAN-' + name.replace(/[^a-z]+/gi, '-').toUpperCase() + '\n     ' + String(e.message || e).split('\n')[0]); }
}

const OPEN = [];
async function fresh(browser) {
  const context = await browser.newContext({viewport: {width: 390, height: 844}});
  OPEN.push(context);
  const page = await context.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(String(e)));
  await page.goto(URL);
  await page.waitForFunction(() => { const T = window.__L5R_TEST__;
    return T && T.CL11 && T.CL11.ready && T.CW112; }, null, {timeout: 15000});
  return {context, page};
}

const $v = (page, id) => page.evaluate((i) => document.getElementById(i).value, id);
const nextState = (page) => page.evaluate(() => [document.getElementById('cw112Next').disabled, document.getElementById('cw112Reason').textContent]);
const title = (page) => page.evaluate(() => document.getElementById('cw112Title').textContent);
const cards = (page) => page.evaluate(() => [...document.querySelectorAll('#cw112Body .cw112-cards:first-of-type .cw112-card .cw112-card-title')].map(c => c.textContent));
const wizardOpen = (page) => page.evaluate(() => !document.getElementById('cw112View').hidden);
const sideways = (page) => page.evaluate(() => { const v = document.getElementById('cw112View'); return v.scrollWidth <= v.clientWidth; });

async function startWizard(page) {
  await page.evaluate(() => document.getElementById('cl11Toolbar').click());
  await page.click('#cl11Create');
  await page.waitForFunction(() => !document.getElementById('cw112View').hidden);
}
async function pick(page, text) {
  await page.locator('#cw112Body .cw112-card', {hasText: text}).first().click();
}
async function exactPick(page, text) {
  await page.locator('#cw112Body .cw112-card').filter({has: page.locator('.cw112-card-title', {hasText: new RegExp('^' + text + '$')})}).first().click();
}
async function next(page) {
  await page.waitForFunction(() => !document.getElementById('cw112Next').disabled);
  await page.click('#cw112Next');
}
async function answerAffinity(page, element) {
  await page.waitForFunction(() => document.getElementById('affinityPickModalOverlay').style.display === 'flex');
  await page.click('#affinityPick_' + element);
  await page.click('#affinityPickConfirm');
}
// The whole Isawa Shugenja walk used by several scenarios.
async function walkIsawa(page) {
  await startWizard(page);
  await page.fill('#cw112Name', 'Isawa Takeshi');
  await next(page);
  await exactPick(page, 'Phoenix');
  await next(page);
  await exactPick(page, 'Isawa');
  await next(page);
  await exactPick(page, 'Isawa Shugenja');
  await answerAffinity(page, 'Void');
  await page.waitForFunction(() => window.__L5R_TEST__.CW112.appliedSchool() === 'Isawa Shugenja' && !window.__L5R_TEST__.CW112.busy);
  await next(page);
  await page.click('button[aria-label="Raise Willpower"]');
  await page.click('button[aria-label="Raise Void"]');
}

async function main() {
  console.log('Creation wizard checks against: ' + SHEET);
  const browser = await chromium.launch();
  try {
    // ------------------------------------------------------------ the walk, step by step
    await scenario('walk', async () => {
      const {page} = await fresh(browser);
      check('CW-ENABLED', await page.evaluate(() => window.__L5R_TEST__.CREATION_WIZARD_ENABLED));
      await startWizard(page);
      check('CW-OPENS-ON-CREATE', [await wizardOpen(page), await title(page),
        await page.evaluate(() => JSON.parse(localStorage.getItem('l5r-sheet:local:l5r-char-index') || '[]').length)], [true, 'Name', 1]);
      // Full screen: every corner of the viewport is the wizard, above the sheet and its buttons.
      check('CW-COVERS-VIEWPORT', await page.evaluate(() =>
        [[195, 422], [10, 10], [380, 10], [10, 834], [380, 834]].every(([x, y]) => !!document.elementFromPoint(x, y).closest('#cw112View'))));
      check('CW-NAME-GATE', await nextState(page), [true, 'Enter a name to continue.']);
      await page.fill('#cw112Name', 'Isawa Takeshi');
      check('CW-NAME-WRITES-SHEET', [await $v(page, 'f_name'), await page.evaluate(() => document.getElementById('headerName').textContent),
        (await nextState(page))[0]], ['Isawa Takeshi', 'Isawa Takeshi', false]);
      await next(page);

      check('CW-CLAN-FROM-SHEET', await cards(page), await page.evaluate(() => [...document.getElementById('cfs_clan').options].map(o => o.textContent)));
      check('CW-CLAN-GATE', await nextState(page), [true, 'Choose a Clan to continue.']);
      check('CW-CLAN-MONS', await page.evaluate(() => [...document.querySelectorAll('#cw112Body .cw112-card')]
        .filter(c => c.querySelector('img')).map(c => c.textContent.trim()).sort()),
        await page.evaluate(() => [...document.getElementById('cfs_clan').options].map(o => o.value).filter(v => /^(Crab|Crane|Dragon|Lion|Phoenix|Scorpion|Unicorn)$/.test(v)).sort()));
      await exactPick(page, 'Phoenix');
      check('CW-CLAN-SETS-SHEET', [await $v(page, 'cfs_clan'), (await nextState(page))[0],
        await page.evaluate(() => document.querySelector('.cw112-card.cw112-selected').getAttribute('aria-pressed'))], ['Phoenix', false, 'true']);
      await next(page);

      check('CW-FAMILY-FROM-SHEET', await cards(page), await page.evaluate(() => [...document.getElementById('cfs_family').options].map(o => o.value)));
      check('CW-FAMILY-GATE', (await nextState(page))[0], true);
      await exactPick(page, 'Isawa');
      check('CW-FAMILY-APPLIED', [await $v(page, 'f_family'), await $v(page, 'f_clan'), !!(await $v(page, 'f_familyApplied')), (await nextState(page))[0]],
        ['Isawa', 'Phoenix', true, false]);
      await next(page);

      check('CW-SCHOOL-FROM-SHEET', await cards(page), await page.evaluate(() => [...document.getElementById('cfs_school').options].map(o => o.value)));
      await exactPick(page, 'Isawa Shugenja');
      await page.waitForFunction(() => document.getElementById('affinityPickModalOverlay').style.display === 'flex');
      check('CW-SCHOOL-QUESTION-ABOVE', [await page.evaluate(() => !!document.elementFromPoint(195, 422).closest('#affinityPickModalOverlay')),
        await nextState(page)], [true, [true, 'Waiting for the School’s own questions…']]);
      await page.click('#affinityPickX');
      await page.waitForFunction(() => !window.__L5R_TEST__.CW112.busy);
      check('CW-SCHOOL-CANCEL-NOT-APPLIED', [await page.evaluate(() => window.__L5R_TEST__.CW112.appliedSchool()), await nextState(page)],
        ['', [true, 'Choose a School to continue.']]);
      await exactPick(page, 'Isawa Shugenja');
      await answerAffinity(page, 'Void');
      await page.waitForFunction(() => !window.__L5R_TEST__.CW112.busy && !document.getElementById('cw112Next').disabled);
      check('CW-SCHOOL-APPLIED', [await page.evaluate(() => window.__L5R_TEST__.CW112.appliedSchool()), await $v(page, 'f_schoolAffinity')],
        ['Isawa Shugenja', 'Void']);
      check('CW-SCHOOL-SUMMARY-FIELDS', await page.evaluate(() => [...document.querySelectorAll('#cw112Body dt')].map(d => d.textContent)),
        ['Skills', 'Outfit', 'Techniques']);
      await next(page);

      // Traits: the floor comes from the sheet's own free points, the XP from the sheet's own total.
      check('CW-TRAIT-FLOOR', await page.evaluate(() => [document.querySelector('button[aria-label="Lower Willpower"]').disabled,
        document.getElementById('trait_willpower').dataset.free, document.getElementById('trait_willpower').value]), [true, '3', '3']);
      await page.click('button[aria-label="Raise Willpower"]');
      check('CW-TRAIT-WRITES-SHEET', [await $v(page, 'trait_willpower'),
        await page.evaluate(() => document.getElementById('cw112Xp').textContent === 'Experience left: ' + document.getElementById('f_xpRemain').value + ' of ' + document.getElementById('f_xpTotal').value)],
        ['4', true]);
      await page.click('button[aria-label="Raise Void"]');
      check('CW-VOID-THROUGH-STEPPER', await $v(page, 'ring_void'), '3');
      for (let i = 0; i < 3; i++) await page.click('button[aria-label="Raise Willpower"]');
      const over = await nextState(page);
      check('CW-OVERSPEND-BLOCKS', [over[0], /^Overspent by \d+ XP$/.test(over[1]),
        await page.evaluate(() => window.__L5R_TEST__.validateCharacter().findings.some(f => f.id === 'xp-overspend'))], [true, true, true]);
      for (let i = 0; i < 3; i++) await page.click('button[aria-label="Lower Willpower"]');
      check('CW-OVERSPEND-CLEARS', (await nextState(page))[0], false);
      check('CW-NO-SIDEWAYS-SCROLL', await sideways(page));
      await next(page);

      check('CW-REVIEW-FINDINGS', await page.evaluate(() => [...document.querySelectorAll('.cw112-finding strong')].map(s => s.textContent)),
        await page.evaluate(() => window.__L5R_TEST__.validateCharacter().findings.map(f => f.title)));
      check('CW-REVIEW-SUMMARY', await page.evaluate(() => [...document.querySelectorAll('#cw112Body dd')].slice(0, 4).map(d => d.textContent)),
        ['Isawa Takeshi', 'Phoenix', 'Isawa', 'Isawa Shugenja']);
      check('CW-FINISH-LABEL', await page.evaluate(() => [document.getElementById('cw112Next').textContent, document.getElementById('cw112Next').disabled]), ['Finish', false]);

      // An error at Review blocks Finish. Driven through the sheet's own Trait input.
      await page.evaluate(() => { const t = document.getElementById('trait_willpower'); t.value = 9;
        t.dispatchEvent(new Event('input', {bubbles: true})); window.__L5R_TEST__.CW112.render(); });
      check('CW-FINISH-BLOCKED-BY-ERROR', [(await nextState(page))[0], /^Fix the errors above to finish/.test((await nextState(page))[1])], [true, true]);
      await page.evaluate(() => { const t = document.getElementById('trait_willpower'); t.value = 4;
        t.dispatchEvent(new Event('input', {bubbles: true})); window.__L5R_TEST__.CW112.render(); });

      // Back keeps what was applied.
      await page.click('#cw112BackBtn');
      await page.click('#cw112BackBtn');
      check('CW-BACK-KEEPS-SCHOOL', [await title(page), await page.evaluate(() => document.querySelector('.cw112-card.cw112-selected .cw112-card-title').textContent),
        (await nextState(page))[0]], ['School', 'Isawa Shugenja', false]);
      await next(page); await next(page);
      await page.click('#cw112Next');
      await page.waitForFunction(() => document.getElementById('cw112View').hidden);
      await page.waitForTimeout(400);
      const index = await page.evaluate(() => JSON.parse(localStorage.getItem('l5r-sheet:local:l5r-char-index')));
      const saved = await page.evaluate((i) => localStorage.getItem('l5r-sheet:local:l5r-char:' + i), index[0].id);
      check('CW-FINISH-SAVED', [index.length, index[0].name, saved === await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()))],
        [1, 'Isawa Takeshi', true]);
      check('CW-NO-PAGE-ERRORS-WALK', page.errors, []);
    });

    // ------------------------------------------------------------ the oracle: same choices by hand
    await scenario('same as by hand', async () => {
      const w = await fresh(browser);
      await walkIsawa(w.page);
      const viaWizard = await w.page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
      const h = await fresh(browser);
      await h.page.evaluate(() => {
        const set = (id, v, ev) => { const el = document.getElementById(id); el.value = v; (ev || ['input', 'change']).forEach(e => el.dispatchEvent(new Event(e, {bubbles: true}))); };
        set('f_name', 'Isawa Takeshi');
        set('cfs_clan', 'Phoenix', ['change']);
        set('cfs_family', 'Isawa', ['change']);
        document.getElementById('cfs_applyFamily').click();
        set('cfs_school', 'Isawa Shugenja', ['change']);
        document.getElementById('cfs_applySchool').click();
      });
      await answerAffinity(h.page, 'Void');
      await h.page.waitForFunction(() => window.__L5R_TEST__.CW112.appliedSchool() === 'Isawa Shugenja');
      await h.page.evaluate(() => {
        const t = document.getElementById('trait_willpower'); t.value = 4; t.dispatchEvent(new Event('input', {bubbles: true}));
        document.querySelector('#ringsWrap .stepbtn[data-ring="void"][data-step="1"]').click();
      });
      const byHand = await h.page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
      check('CW-SAME-AS-BY-HAND', viaWizard === byHand);
      if (viaWizard !== byHand) {
        const a = JSON.parse(viaWizard), b = JSON.parse(byHand);
        console.log('     differing keys: ' + Object.keys(a).filter(k => JSON.stringify(a[k]) !== JSON.stringify(b[k])).join(', '));
      }
    });

    // ------------------------------------------------------------ changing Clan after applying
    await scenario('clan change', async () => {
      const {page} = await fresh(browser);
      await walkIsawa(page);
      for (let i = 0; i < 3; i++) await page.click('#cw112BackBtn');
      check('CW-BACK-TO-CLAN', await title(page), 'Clan');
      await exactPick(page, 'Crab');
      await page.waitForFunction(() => document.getElementById('appConfirmOverlay').style.display === 'flex');
      await page.click('#appConfirmCancel');
      check('CW-CLAN-CHANGE-CANCEL-KEEPS', [await $v(page, 'cfs_clan'), await page.evaluate(() => window.__L5R_TEST__.CW112.appliedSchool()), await $v(page, 'f_family')],
        ['Phoenix', 'Isawa Shugenja', 'Isawa']);
      await exactPick(page, 'Crab');
      await page.waitForFunction(() => document.getElementById('appConfirmOverlay').style.display === 'flex');
      await page.click('#appConfirmOk');
      await page.waitForFunction(() => document.getElementById('cfs_clan').value === 'Crab');
      check('CW-CLAN-CHANGE-STARTS-OVER', [await $v(page, 'f_name'), await $v(page, 'f_familyApplied'), await $v(page, 'f_schoolApplied'),
        await page.evaluate(() => window.__L5R_TEST__.CW112.appliedSchool()), await $v(page, 'trait_willpower'), await $v(page, 'ring_void')],
        ['Isawa Takeshi', '', '', '', '2', '2']);
      await next(page);
      check('CW-NEW-CLAN-FAMILIES', await cards(page), await page.evaluate(() => [...document.getElementById('cfs_family').options].map(o => o.value)));
      check('CW-NO-PAGE-ERRORS-CLAN-CHANGE', page.errors, []);
    });

    // ------------------------------------------------------------ Minor Clan and the Brotherhood
    await scenario('minor and brotherhood', async () => {
      const {page} = await fresh(browser);
      await startWizard(page);
      await page.fill('#cw112Name', 'Test');
      await next(page);
      await exactPick(page, 'Minor Clan');
      check('CW-MINOR-GATE', [await nextState(page), await page.evaluate(() => [...document.querySelectorAll('#cw112Body .cw112-cards')[1].querySelectorAll('.cw112-card-title')].map(c => c.textContent))],
        [[true, 'Choose a Minor Clan to continue.'], await page.evaluate(() => [...document.getElementById('cfs_minorClan').options].map(o => o.textContent))]);
      const firstMinor = await page.evaluate(() => document.getElementById('cfs_minorClan').options[0].value);
      await page.locator('#cw112Body .cw112-cards').nth(1).locator('.cw112-card').first().click();
      await next(page);
      check('CW-MINOR-FAMILIES', [await $v(page, 'cfs_minorClan'), await cards(page)],
        [firstMinor, await page.evaluate(() => [...document.getElementById('cfs_family').options].map(o => o.value).filter(Boolean))]);
      await page.click('#cw112BackBtn');
      await exactPick(page, 'Brotherhood of Shinsei');
      await next(page);
      check('CW-BROTHERHOOD-NO-FAMILY', [await page.evaluate(() => /No Family is listed/.test(document.getElementById('cw112Body').textContent)), (await nextState(page))[0]],
        [true, false]);
      await next(page);
      check('CW-BROTHERHOOD-SCHOOLS', await cards(page), await page.evaluate(() => [...document.getElementById('cfs_school').options].map(o => o.value)));
    });

    // ------------------------------------------------------------ Exit keeps the character
    await scenario('exit', async () => {
      const {page} = await fresh(browser);
      await startWizard(page);
      await page.fill('#cw112Name', 'Half Done');
      await page.click('#cw112Exit');
      await page.waitForFunction(() => document.getElementById('appConfirmOverlay').style.display === 'flex');
      await page.click('#appConfirmCancel');
      check('CW-EXIT-STAY', await wizardOpen(page));
      await page.click('#cw112Exit');
      await page.waitForFunction(() => document.getElementById('appConfirmOverlay').style.display === 'flex');
      await page.click('#appConfirmOk');
      await page.waitForTimeout(400);
      const index = await page.evaluate(() => JSON.parse(localStorage.getItem('l5r-sheet:local:l5r-char-index')));
      check('CW-EXIT-KEEPS-CHARACTER', [await wizardOpen(page), index.length, index[0].name], [false, 1, 'Half Done']);
      check('CW-NO-PAGE-ERRORS-EXIT', page.errors, []);
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
