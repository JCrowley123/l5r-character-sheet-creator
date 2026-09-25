/* =============================================================================
   PART K PHASE 11.2.3 — WIZARD: STARTING SPELLS: AUTOMATED CHECKS

     NODE_PATH=/opt/node22/lib/node_modules node qa/wizard4-harness.js [sheet.html]

   Defaults to the live Phase 0 build; fresh browser context per scenario, 390 x 844.

   ORACLES: each Element's spell list comes from the sheet's own Technique picker, which applies
   spellEligibility() (effective School Rank with Affinity and Deficiency); the allotment is the
   owner's quotation of Core Rulebook p.118; the whole result is compared with the same choices
   made by hand (CW3-SAME-AS-BY-HAND).
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
  catch (e) { failed++; console.log('FAIL CW3-SCENARIO-RAN-' + name.replace(/[^a-z]+/gi, '-').toUpperCase() + '\n     ' + String(e.message || e).split('\n')[0]); }
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
    return T && T.CL11 && T.CL11.ready && T.CW112 && T.CW1121 && T.CW1122 && T.CW1123; }, null, {timeout: 15000});
  // Phase 11.2.4 records every Shugenja School's starting spells. This suite's Isawa Shugenja stands
  // for a School with no recorded line, so when a line is recorded its lookup is taken away for this
  // page only. Without 11.2.4 there is nothing to take away and this does nothing.
  await page.evaluate(() => { const C = window.__L5R_TEST__.CW1123;
    if (C && C.forSchool('Isawa Shugenja')) { const previous = C.forSchool;
      C.forSchool = function(n){ return n === 'Isawa Shugenja' ? null : previous.apply(this, arguments); }; } });
  return {context, page};
}
const $v = (page, id) => page.evaluate((i) => document.getElementById(i).value, id);
const title = (page) => page.evaluate(() => document.getElementById('cw112Title').textContent);
const stepIds = (page) => page.evaluate(() => window.__L5R_TEST__.CW112.steps.map(s => s.id));
const nextText = (page) => page.evaluate(() => document.getElementById('cw112Next').textContent);
const skills = (page) => page.evaluate(() => [...document.getElementById('skillsBody').rows].map(r =>
  [r.querySelector('.sk-name').value, r.querySelector('.sk-rank').value, r.querySelector('.sk-school').checked]));
const options = (page, id) => page.evaluate((i) => [...document.querySelectorAll('#' + i + ' option')].map(o => o.value).filter(Boolean), id);
const slotLabels = (page) => page.evaluate(() => [...document.querySelectorAll('.cw1121-slot-label')].map(p => p.textContent));
async function next(page) {
  await page.waitForFunction(() => !document.getElementById('cw112Next').disabled);
  await page.click('#cw112Next');
}
async function toStep(page, wanted) {
  for (let i = 0; i < 12 && (await title(page)) !== wanted; i++) await next(page);
}
async function backTo(page, wanted) {
  for (let i = 0; i < 12 && (await title(page)) !== wanted; i++) await page.click('#cw112BackBtn');
}
async function exactPick(page, text) {
  await page.locator('#cw112Body .cw112-card').filter({has: page.locator('.cw112-card-title', {hasText: new RegExp('^' + text.replace(/[[\]()]/g, '\\$&') + '$')})}).first().click();
}
async function start(page, name) {
  await page.evaluate(() => document.getElementById('cl11Toolbar').click());
  await page.click('#cl11Create');
  await page.waitForFunction(() => !document.getElementById('cw112View').hidden);
  await page.fill('#cw112Name', name);
  await next(page);
}
async function applied(page, school) {
  await page.waitForFunction((s) => window.__L5R_TEST__.CW112.appliedSchool() === s && !window.__L5R_TEST__.CW112.busy, school);
}
async function toIsawaSkills(page) {
  await start(page, 'Isawa Takeshi');
  await exactPick(page, 'Phoenix'); await next(page);
  await exactPick(page, 'Isawa'); await next(page);
  await exactPick(page, 'Isawa Shugenja');
  await page.waitForFunction(() => document.getElementById('affinityPickModalOverlay').style.display === 'flex');
  await page.click('#affinityPick_Void'); await page.click('#affinityPickConfirm');
  await applied(page, 'Isawa Shugenja');
  await toStep(page, 'Skills');
}
async function toKitsuSpells(page) {
  await start(page, 'Kitsu Hana');
  await exactPick(page, 'Lion'); await next(page);
  await exactPick(page, 'Kitsu'); await next(page);
  await exactPick(page, 'Kitsu Shugenja');
  await applied(page, 'Kitsu Shugenja');
  await toStep(page, 'Spells');
}
const learned = (page) => page.evaluate(() => [...document.querySelectorAll('#techList .entry')].filter(d => d.dataset.spellElement).map(d => d.querySelector('.en-name').value));
const scrolls = (page) => page.evaluate(() => [...document.querySelectorAll('#equipBody .eq-name')].map(n => n.value).filter(v => /^Spell Scroll/.test(v)).map(v => v.replace(/^Spell Scroll — /, '')));
const quotaLabels = (page) => page.evaluate(() => [...document.querySelectorAll('.cw1123-quota .cw1121-slot-label')].map(p => p.textContent));
// The sheet's own gate: every non-Maho spell of this Element its Technique picker offers, not yet known.
const sheetOptions = (page, element) => page.evaluate((el) => {
  const T = window.__L5R_TEST__;
  T.refreshTechQuickAddOptions();
  const known = [...document.querySelectorAll('#techList .entry')].filter(d => d.dataset.spellElement).map(d => d.querySelector('.en-name').value.toLowerCase());
  return [...document.querySelectorAll('#techQuickAdd option')].map(o => o.value).filter(v => /^spell:/.test(v))
    .map(v => Number(v.split(':')[1])).filter(i => T.SPELL_LIBRARY[i].element === el && !T.SPELL_LIBRARY[i].maho && !known.includes(T.SPELL_LIBRARY[i].name.toLowerCase())).map(String);
}, element);
async function addFirst(page, element) {
  const v = (await options(page, 'cw1123Pick' + element))[0];
  await page.selectOption('#cw1123Pick' + element, v);
  await page.click('#cw1123Add' + element);
  return v;
}
// Phase 5 (Part J) is a soft dependency: without it there is no character check to note anything.
const NO_PHASE_5 = 'no character check in this build';
const finding = (page) => page.evaluate((none) => typeof window.__L5R_TEST__.validateCharacter !== 'function' ? none
  : (window.__L5R_TEST__.validateCharacter().findings.find(f => f.id === 'school-starting-spells') || {}).detail || '', NO_PHASE_5);
const hasPhase5 = (page) => page.evaluate(() => typeof window.__L5R_TEST__.validateCharacter === 'function');

async function main() {
  console.log('Wizard starting spells checks against: ' + SHEET);
  const browser = await chromium.launch();
  try {
    await scenario('kitsu', async () => {
      const {page} = await fresh(browser);
      check('CW3-ENABLED', await page.evaluate(() => window.__L5R_TEST__.WIZARD_STARTING_SPELLS_ENABLED));
      check('CW3-TABLE-ONLY-QUOTED', await page.evaluate(() => window.__L5R_TEST__.CW1123.table),
        {'Kitsu Shugenja': {source: 'Core Rulebook p.118', given: ['Sense', 'Commune', 'Summon'], choose: [['Water', 3], ['Air', 2], ['Earth', 1]]}});
      await toKitsuSpells(page);
      check('CW3-GIVEN-ADDED', [await learned(page), await scrolls(page)], [['Sense', 'Commune', 'Summon'], ['Sense', 'Commune', 'Summon']]);
      check('CW3-ALLOTMENT-SHOWN', await page.evaluate(() => document.getElementById('cw112Body').textContent.includes(
        'Kitsu Shugenja starts with Sense, Commune, Summon, 3 Water, 2 Air, 1 Earth (Core Rulebook p.118)')));
      check('CW3-QUOTA-BOXES', await quotaLabels(page), ['Water: choose 3 · 0 chosen', 'Air: choose 2 · 0 chosen', 'Earth: choose 1 · 0 chosen']);
      check('CW3-PICKER-WORDING', await page.evaluate(() => ['Water', 'Air', 'Earth'].map(e => document.querySelector('#cw1123Pick' + e + ' option').textContent)),
        ['— choose a Water spell —', '— choose an Air spell —', '— choose an Earth spell —']);
      for (const el of ['Water', 'Air', 'Earth']) check('CW3-OPTIONS-MATCH-SHEET-' + el.toUpperCase(), await options(page, 'cw1123Pick' + el), await sheetOptions(page, el));
      // Kitsu: Affinity Water, Deficiency Fire. At School Rank 1 the sheet lets Water reach Mastery 2
      // and takes Fire to 0, so no Fire spell may be learned.
      check('CW3-AFFINITY-AND-DEFICIENCY', await page.evaluate(() => {
        const T = window.__L5R_TEST__, C = T.CW1123;
        const max = (el) => Math.max(0, ...C.optionsFor(el).map(x => x.s.mastery));
        return [max('Water'), max('Air'), C.optionsFor('Fire').length];
      }), [2, 1, 0]);
      check('CW3-VALIDATOR-NOTES-IT', await finding(page), (await hasPhase5(page))
        ? 'Core Rulebook p.118 gives Sense, Commune, Summon, 3 Water, 2 Air, 1 Earth. Still to choose: 3 Water spells, 2 Air spells, 1 Earth spell.' : NO_PHASE_5);
      await next(page);
      check('CW3-NUDGE', [await title(page), await page.evaluate(() => (document.getElementById('cw1122Open') || {}).textContent || '')],
        ['Spells', 'Still to choose: 3 Water spells · 2 Air spells · 1 Earth spell. Choose now, or press “Leave for later” to finish on the sheet.']);
      for (let i = 0; i < 3; i++) await addFirst(page, 'Water');
      for (let i = 0; i < 2; i++) await addFirst(page, 'Air');
      await addFirst(page, 'Earth');
      check('CW3-QUOTAS-FILLED', [await quotaLabels(page), await page.evaluate(() => [...document.querySelectorAll('.cw1123-quota select')].length)],
        [['Water: choose 3 · 3 chosen', 'Air: choose 2 · 2 chosen', 'Earth: choose 1 · 1 chosen'], 0]);
      // A given spell never fills a quota, even of its own Element. Kitsu's given spells are all
      // Universal, so this is asked of the counting directly, with one of the chosen Water spells
      // named as given.
      check('CW3-GIVEN-NOT-COUNTED', await page.evaluate(() => {
        const C = window.__L5R_TEST__.CW1123;
        const water = [...document.querySelectorAll('#techList .entry')].find(d => d.dataset.spellElement === 'water').querySelector('.en-name').value;
        return C.status({given: [water], choose: [['Water', 3]]}).quotas[0].have;
      }), 2);
      const all = await learned(page);
      check('CW3-SCROLL-FOR-EVERY-SPELL', [all.length, (await scrolls(page)).slice().sort()], [9, all.slice().sort()]);
      check('CW3-VALIDATOR-CLEARS', await finding(page), (await hasPhase5(page)) ? '' : NO_PHASE_5);
      check('CW3-NO-NUDGE-WHEN-DONE', await page.evaluate(() => window.__L5R_TEST__.CW1122.openFor('spells')), []);
      check('CW3-TOUCH-TARGETS', await page.evaluate(() => [...document.querySelectorAll('#cw112Body .cw1121-remove')].every(e => e.getBoundingClientRect().height >= 44)));
      const water = await page.evaluate(() => [...document.querySelectorAll('#techList .entry')].find(d => d.dataset.spellElement === 'water').querySelector('.en-name').value);
      await page.locator('.cw1121-entry', {hasText: water}).locator('.cw1121-remove').click();
      await page.waitForTimeout(200);
      check('CW3-REMOVE-REOPENS', [(await quotaLabels(page))[0], (await scrolls(page)).includes(water),
        await page.evaluate(() => { const p = document.getElementById('cw1123PickWater'), b = document.getElementById('cw1123AddWater');
          return !!p && [p, b].every(e => e.getBoundingClientRect().height >= 44); })],
        ['Water: choose 3 · 2 chosen', false, true]);
      await toStep(page, 'Review');
      check('CW3-REVIEW-LISTS-OPEN', await page.evaluate(() => [...document.querySelectorAll('#cw1122Still li')].map(l => l.textContent)),
        ['Skills: Any one High or Bugei Skill', 'Spells: 1 Water spell']);
      // Another School: the given spells this phase added go; the spells the player chose stay.
      await backTo(page, 'School');
      await exactPick(page, 'Kitsu Shugenja');
      await page.waitForTimeout(300);
      const chosen = (await learned(page)).filter(n => !['Sense', 'Commune', 'Summon'].includes(n));
      await backTo(page, 'Clan');
      await exactPick(page, 'Phoenix');
      await page.waitForFunction(() => document.getElementById('appConfirmOverlay').style.display === 'flex');
      await page.click('#appConfirmCancel');
      check('CW3-NO-PAGE-ERRORS', page.errors, []);
      check('CW3-CHOSEN-COUNT', chosen.length, 5);
    });

    await scenario('school change', async () => {
      const {page} = await fresh(browser);
      await toKitsuSpells(page);
      await addFirst(page, 'Water');
      const water = (await learned(page)).find(n => !['Sense', 'Commune', 'Summon'].includes(n));
      await backTo(page, 'School');
      await exactPick(page, 'Akodo Bushi');
      await applied(page, 'Akodo Bushi');
      await page.waitForTimeout(600);
      check('CW3-GIVEN-TAKEN-BACK', [await learned(page), await scrolls(page)], [[water], [water]]);
    });

    await scenario('no data', async () => {
      const {page} = await fresh(browser);
      await toIsawaSkills(page);
      await toStep(page, 'Spells');
      check('CW3-UNRECORDED-SCHOOL-UNCHANGED', [await learned(page), await page.evaluate(() =>
        /does not record how many spells your School starts with/.test(document.getElementById('cw112Body').textContent)),
        await page.evaluate(() => !!document.getElementById('cw1122SpellPick'))], [[], true, true]);
    });

    await scenario('same as by hand', async () => {
      const w = await fresh(browser);
      await toKitsuSpells(w.page);
      const water = await addFirst(w.page, 'Water');
      const viaWizard = await w.page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
      const h = await fresh(browser);
      await h.page.evaluate(() => {
        const set = (id, v, ev) => { const el = document.getElementById(id); el.value = v; (ev || ['input', 'change']).forEach(e => el.dispatchEvent(new Event(e, {bubbles: true}))); };
        set('f_name', 'Kitsu Hana');
        set('cfs_clan', 'Lion', ['change']);
        set('cfs_family', 'Kitsu', ['change']);
        document.getElementById('cfs_applyFamily').click();
        set('cfs_school', 'Kitsu Shugenja', ['change']);
        document.getElementById('cfs_applySchool').click();
      });
      await h.page.waitForFunction(() => window.__L5R_TEST__.CW112.appliedSchool() === 'Kitsu Shugenja');
      await h.page.evaluate((ids) => {
        ids.forEach((i) => {
          document.getElementById('addSpellScroll').click();
          document.querySelector('#spellScrollsList .spell-scroll-add-btn[data-idx="' + i + '"]').click();
          document.getElementById('spellScrollsX').click();
          const q = document.getElementById('techQuickAdd'); q.value = 'spell:' + i; q.dispatchEvent(new Event('change', {bubbles: true}));
        });
      }, await h.page.evaluate((wi) => ['Sense', 'Commune', 'Summon'].map(n => window.__L5R_TEST__.SPELL_LIBRARY.findIndex(s => s.name === n)).concat(Number(wi)), water));
      const byHand = await h.page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
      check('CW3-SAME-AS-BY-HAND', viaWizard === byHand);
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
