/* =============================================================================
   PART K PHASE 11.2.1 — WIZARD: SKILLS AND ADVANTAGES: AUTOMATED CHECKS

     NODE_PATH=/opt/node22/lib/node_modules node qa/wizard2-harness.js [sheet.html]

   Defaults to the live Phase 0 build; fresh browser context per scenario, 390 x 844.

   ORACLES: the School's free choices are compared with Phase 5's (Part J) validator, which
   recovers them by its own code; option lists with the sheet's own pickers; the whole result
   with the same choices made by hand through the sheet's own controls (CW1-SAME-AS-BY-HAND).
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
  catch (e) { failed++; console.log('FAIL CW1-SCENARIO-RAN-' + name.replace(/[^a-z]+/gi, '-').toUpperCase() + '\n     ' + String(e.message || e).split('\n')[0]); }
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
    return T && T.CL11 && T.CL11.ready && T.CW112 && T.CW1121; }, null, {timeout: 15000});
  return {context, page};
}
const $v = (page, id) => page.evaluate((i) => document.getElementById(i).value, id);
const title = (page) => page.evaluate(() => document.getElementById('cw112Title').textContent);
const nextState = (page) => page.evaluate(() => [document.getElementById('cw112Next').disabled, document.getElementById('cw112Reason').textContent]);
const skills = (page) => page.evaluate(() => [...document.getElementById('skillsBody').rows].map(r =>
  [r.querySelector('.sk-name').value, r.querySelector('.sk-rank').value, r.querySelector('.sk-school').checked]));
const options = (page, id) => page.evaluate((i) => [...document.querySelectorAll('#' + i + ' option')].map(o => o.value).filter(Boolean), id);
async function next(page) {
  await page.waitForFunction(() => !document.getElementById('cw112Next').disabled);
  await page.click('#cw112Next');
}
// Moves forward by step TITLE, not by a count of Next presses, so a later stage that adds a step,
// or asks once before leaving a step with a choice still open, needs no further change here.
async function toStep(page, wanted) {
  for (let i = 0; i < 10 && (await title(page)) !== wanted; i++) await next(page);
}
async function exactPick(page, text) {
  await page.locator('#cw112Body .cw112-card').filter({has: page.locator('.cw112-card-title', {hasText: new RegExp('^' + text + '$')})}).first().click();
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
async function fillSlots(page) {
  await page.selectOption('#cw1121Slot0Pick', 'Lore');
  await page.fill('#cw1121Slot0Subject', 'History');
  await page.click('#cw1121Slot0Add');
  await page.selectOption('#cw1121Slot1Pick', 'Acting');
  await page.click('#cw1121Slot1Add');
}

async function main() {
  console.log('Wizard Skills and Advantages checks against: ' + SHEET);
  const browser = await chromium.launch();
  try {
    await scenario('skills', async () => {
      const {page} = await fresh(browser);
      check('CW1-ENABLED', await page.evaluate(() => window.__L5R_TEST__.WIZARD_SKILLS_ADV_ENABLED));
      check('CW1-STEPS-INSERTED', await page.evaluate(() => window.__L5R_TEST__.CW112.steps.map(s => s.id)),
        ['name', 'clan', 'family', 'school', 'traits', 'skills', 'advantages', 'review']);
      await toSkills(page);
      check('CW1-SKILLS-STEP', await title(page), 'Skills');
      // Phase 5's validator recovers the same free choices by its own code.
      const slotTexts = await page.evaluate(() => [...document.querySelectorAll('.cw1121-slot-label')].map(p => p.textContent.toLowerCase()));
      const finding = await page.evaluate(() => (window.__L5R_TEST__.validateCharacter().findings.find(f => f.id === 'school-choice-slots') || {}).detail || '');
      check('CW1-SLOTS-MATCH-VALIDATOR', [slotTexts.length, slotTexts.every(s => finding.toLowerCase().includes(s))], [2, true]);
      check('CW1-SLOT-LORE-NARROWED', await options(page, 'cw1121Slot0Pick'), ['Lore']);
      check('CW1-SLOT-HIGH-NARROWED', await options(page, 'cw1121Slot1Pick'),
        await page.evaluate(() => [...document.querySelectorAll('#skillQuickAdd optgroup[label="High"] option')].map(o => o.value)));
      check('CW1-EXTRA-ALL-SKILLS', await options(page, 'cw1121ExtraPick'), await options(page, 'skillQuickAdd'));
      await page.selectOption('#cw1121Slot0Pick', 'Lore');
      check('CW1-SUBJECT-REQUIRED', await page.evaluate(() => [document.getElementById('cw1121Slot0Subject').hidden, document.getElementById('cw1121Slot0Add').disabled]), [false, true]);
      const xpBefore = await $v(page, 'f_xpRemain');
      await page.fill('#cw1121Slot0Subject', 'History');
      await page.click('#cw1121Slot0Add');
      const lore = (await skills(page)).find(r => r[0] === 'Lore: History');
      check('CW1-SLOT-ROW', [lore, await $v(page, 'f_xpRemain')], [['Lore: History', '1', true], xpBefore]);
      await page.locator('.cw1121-slot[data-slot="0"] .cw1121-undo').click();
      check('CW1-CHOOSE-AGAIN-REMOVES', [(await skills(page)).some(r => r[0] === 'Lore: History'),
        await page.evaluate(() => !!document.getElementById('cw1121Slot0Pick'))], [false, true]);
      await fillSlots(page);
      check('CW1-BOTH-SLOTS', (await skills(page)).filter(r => r[0] === 'Lore: History' || r[0] === 'Acting'),
        [['Lore: History', '1', true], ['Acting', '1', true]]);
      // The floor is the sheet's own free points: Apply School's grants carry one, a Skill the
      // player ticks as School by hand does not (the sheet then counts its first Rank free).
      check('CW1-SKILL-FLOOR', await page.evaluate(() => [document.querySelector('button[aria-label="Lower Calligraphy"]').disabled,
        document.querySelector('button[aria-label="Lower Acting"]').disabled]), [true, false]);
      await page.click('button[aria-label="Raise Acting"]');
      check('CW1-RAISE-SKILL', [(await skills(page)).find(r => r[0] === 'Acting')[1],
        await page.evaluate(() => document.getElementById('cw1121Xp').textContent.startsWith('Experience left: ' + document.getElementById('f_xpRemain').value + ' ·'))],
        ['2', true]);
      await page.selectOption('#cw1121ExtraPick', 'Investigation');
      await page.click('#cw1121ExtraAdd');
      check('CW1-ADD-EXTRA', (await skills(page)).find(r => r[0] === 'Investigation'), ['Investigation', '1', false]);
      for (let i = 0; i < 9; i++) await page.click('button[aria-label="Raise Investigation"]');
      const over = await nextState(page);
      check('CW1-OVERSPEND-BLOCKS', [over[0], /^Overspent by/.test(over[1])], [true, true]);
      for (let i = 0; i < 9; i++) await page.click('button[aria-label="Lower Investigation"]');
      check('CW1-OVERSPEND-CLEARS', (await nextState(page))[0], false);
      check('CW1-NO-SIDEWAYS-SCROLL', await page.evaluate(() => { const v = document.getElementById('cw112View'); return v.scrollWidth <= v.clientWidth; }));

      // School changed afterwards: the old School's free choices go.
      await page.click('#cw112BackBtn'); await page.click('#cw112BackBtn');
      check('CW1-BACK-TO-SCHOOL', await title(page), 'School');
      await exactPick(page, 'Shiba Bushi');
      await page.waitForFunction(() => window.__L5R_TEST__.CW112.appliedSchool() === 'Shiba Bushi' && !window.__L5R_TEST__.CW112.busy);
      check('CW1-SCHOOL-CHANGE-CLEARS-SLOTS', (await skills(page)).filter(r => r[0] === 'Lore: History' || r[0] === 'Acting').length, 0);
      check('CW1-NO-PAGE-ERRORS-SKILLS', page.errors, []);
    });

    await scenario('advantages', async () => {
      const {page} = await fresh(browser);
      await toSkills(page);
      await toStep(page, 'Advantages & Disadvantages');
      check('CW1-ADV-STEP', await title(page), 'Advantages & Disadvantages');
      check('CW1-ADV-MIRROR', await page.evaluate(() => [...document.querySelectorAll('#cw1121AdvPick option')].map(o => [o.value, o.disabled])),
        await page.evaluate(() => [...document.querySelectorAll('#advQuickAdd option')].map(o => [o.value, o.disabled])));
      check('CW1-DISADV-MIRROR', await page.evaluate(() => [...document.querySelectorAll('#cw1121DisadvPick option')].map(o => [o.value, o.disabled])),
        await page.evaluate(() => [...document.querySelectorAll('#disadvQuickAdd option')].map(o => [o.value, o.disabled])));
      const xp0 = Number(await $v(page, 'f_xpRemain'));
      await page.selectOption('#cw1121AdvPick', 'Absolute Direction');
      await page.waitForFunction(() => !window.__L5R_TEST__.CW1121.busy && document.querySelectorAll('#advList .entry').length === 1);
      await page.selectOption('#cw1121DisadvPick', 'Bad Eyesight');
      await page.waitForFunction(() => !window.__L5R_TEST__.CW1121.busy && document.querySelectorAll('#disadvList .entry').length === 1);
      check('CW1-ENTRIES-ADDED', [await page.evaluate(() => [...document.querySelectorAll('.cw1121-entry-name')].map(e => e.textContent)),
        Number(await $v(page, 'f_xpRemain')) - xp0],
        [['Absolute Direction · costs 1 XP', 'Bad Eyesight · gives 3 XP'], 2]);
      // A configurable Advantage asks its own question above the wizard; Next waits for it.
      await page.selectOption('#cw1121AdvPick', 'Elemental Blessing');
      await page.waitForFunction(() => [...document.querySelectorAll('.roll-modal-overlay')].some(o => o.style.display === 'flex'));
      check('CW1-CONFIG-ASKS-ABOVE', [await page.evaluate(() => !!document.elementFromPoint(195, 422).closest('.roll-modal-overlay')),
        (await nextState(page))[0]], [true, true]);
      await page.keyboard.press('Escape');
      await page.evaluate(() => { const o = [...document.querySelectorAll('.roll-modal-overlay')].find(x => x.style.display === 'flex');
        if (o) { const b = [...o.querySelectorAll('button')].find(x => /cancel/i.test(x.textContent) || /✕/.test(x.textContent)); if (b) b.click(); } });
      await page.waitForFunction(() => !window.__L5R_TEST__.CW1121.busy);
      check('CW1-CONFIG-CANCELLED-FREES-NEXT', (await nextState(page))[0], false);
      // Touch targets: every new control at least 44px tall on the phone (Apple's minimum).
      check('CW1-TOUCH-TARGETS', await page.evaluate(() => [...document.querySelectorAll('#cw1121AdvPick, #cw1121DisadvPick, .cw1121-remove')]
        .every(e => e.getBoundingClientRect().height >= 44)));
      await page.locator('.cw1121-entry', {hasText: 'Elemental Blessing'}).locator('.cw1121-remove').click();
      await page.locator('.cw1121-entry', {hasText: 'Bad Eyesight'}).locator('.cw1121-remove').click();
      check('CW1-REMOVE', [await page.evaluate(() => [...document.querySelectorAll('#advList .entry .en-name, #disadvList .entry .en-name')].map(n => n.value)),
        Number(await $v(page, 'f_xpRemain')) - xp0], [['Absolute Direction'], -1]);
      await toStep(page, 'Review');
      check('CW1-REVIEW', [await title(page),
        await page.evaluate(() => /not in the wizard yet/.test(document.getElementById('cw112Body').textContent)),
        await page.evaluate(() => [...document.querySelectorAll('#cw112Body dt')].map(d => d.textContent).filter(t => /^(Skills|Advantages|Disadvantages)$/.test(t)))],
        ['Review', false, ['Skills', 'Advantages', 'Disadvantages']]);
      await next(page);
      await page.waitForFunction(() => document.getElementById('cw112View').hidden);
      check('CW1-FINISH-STATUS', await page.evaluate(() => document.getElementById('statusMsg').textContent), '"Isawa Takeshi" is ready.');
      check('CW1-NO-PAGE-ERRORS-ADV', page.errors, []);
    });

    await scenario('same as by hand', async () => {
      const w = await fresh(browser);
      await toSkills(w.page);
      await fillSlots(w.page);
      await w.page.click('button[aria-label="Raise Acting"]');
      await w.page.selectOption('#cw1121ExtraPick', 'Investigation');
      await w.page.click('#cw1121ExtraAdd');
      await toStep(w.page, 'Advantages & Disadvantages');
      await w.page.selectOption('#cw1121AdvPick', 'Absolute Direction');
      await w.page.waitForFunction(() => !window.__L5R_TEST__.CW1121.busy && document.querySelectorAll('#advList .entry').length === 1);
      await w.page.selectOption('#cw1121DisadvPick', 'Bad Eyesight');
      await w.page.waitForFunction(() => !window.__L5R_TEST__.CW1121.busy && document.querySelectorAll('#disadvList .entry').length === 1);
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
      await h.page.waitForFunction(() => document.getElementById('affinityPickModalOverlay').style.display === 'flex');
      await h.page.click('#affinityPick_Void'); await h.page.click('#affinityPickConfirm');
      await h.page.waitForFunction(() => window.__L5R_TEST__.CW112.appliedSchool() === 'Isawa Shugenja');
      await h.page.evaluate(() => {
        const fire = (el, ...types) => types.forEach(t => el.dispatchEvent(new Event(t, {bubbles: true})));
        const addRow = (name, subject, rank, school) => {
          const q = document.getElementById('skillQuickAdd'); q.value = name; fire(q, 'change');
          const tr = document.getElementById('skillsBody').lastElementChild;
          if (subject) { const n = tr.querySelector('.sk-name'); n.value = name + ': ' + subject; fire(n, 'input', 'change'); }
          const r = tr.querySelector('.sk-rank'); r.value = 1; fire(r, 'input', 'change');
          if (school) { const s = tr.querySelector('.sk-school'); s.checked = true; fire(s, 'change'); }
          if (rank > 1) { r.value = rank; fire(r, 'input', 'change'); }
        };
        addRow('Lore', 'History', 1, true);
        addRow('Acting', '', 2, true);
        addRow('Investigation', '', 1, false);
        const a = document.getElementById('advQuickAdd'); a.value = 'Absolute Direction'; fire(a, 'change');
        const d = document.getElementById('disadvQuickAdd'); d.value = 'Bad Eyesight'; fire(d, 'change');
      });
      const byHand = await h.page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
      check('CW1-SAME-AS-BY-HAND', viaWizard === byHand);
      if (viaWizard !== byHand) {
        const a = JSON.parse(viaWizard), b = JSON.parse(byHand);
        console.log('     differing keys: ' + Object.keys(a).filter(k => JSON.stringify(a[k]) !== JSON.stringify(b[k])).join(', '));
      }
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
