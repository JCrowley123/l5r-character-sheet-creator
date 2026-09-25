/* =============================================================================
   PART K PHASE 12.3 (part 4) — RINGS & TRAITS IN PLAY: AUTOMATED CHECKS

     NODE_PATH=<node_modules> node qa/rings-traits-harness.js [sheet.html]

   Oracles are the page itself: what real keystrokes leave in a Trait box, what the Void Ring holds
   after its stepper is clicked, how many Void Points remain after a pip is tapped, and the computed
   style. The Void POINT pips must keep working in Play; the Void RING must not change.
   ============================================================================= */

'use strict';

const { chromium } = require('playwright');
const path = require('path');

const SHEET = path.resolve(process.argv[2] || path.join(__dirname, '..', '..',
  'Part F — Cross-Platform Delivery', 'PART F — Phase 0 Source Reorganization for Maintainability',
  'l5r-character-sheet.html'));
const URL = 'file://' + SHEET;
const TRAITS = ['reflexes', 'awareness', 'stamina', 'willpower', 'agility', 'intelligence', 'strength', 'perception'].map((t) => 'trait_' + t);
const RINGS = ['air', 'earth', 'fire', 'water', 'void'].map((r) => 'ring_' + r);

let passed = 0, failed = 0;
function check(name, actual, expected) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected === undefined ? true : expected);
  if (a === e) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + '\n     expected ' + e + '\n     actual   ' + String(a).slice(0, 600)); }
}
async function scenario(name, body) {
  try { await body(); }
  catch (e) { failed++; console.log('FAIL RT123-SCENARIO-RAN-' + name.replace(/[^a-z]+/gi, '-').toUpperCase() + '\n     ' + String(e.message || e).split('\n')[0]); }
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
const setMode = (page, m) => page.evaluate((x) => { const M = window.__L5R_TEST__.MODES12; if (M) M.set(x); }, m);
const onTab = (page) => page.evaluate(async () => {
  const C = window.__L5R_CAROUSEL__;
  if (C.getActiveTab().label !== 'Rings & Traits') { C.goToTab('Rings & Traits'); if (C.whenSettled) await C.whenSettled(); }
});
// Replace a Trait box's value through real keystrokes; returns what it holds afterwards.
async function typeTrait(page, id, text) {
  await onTab(page);
  await page.evaluate((i) => { const el = document.getElementById(i); el.focus(); el.select(); }, id);
  await page.keyboard.type(text);
  return page.evaluate((i) => document.getElementById(i).value, id);
}
const voidRing = (page) => page.evaluate(() => document.getElementById('ring_void').value);
const stepVoid = (page, step) => page.evaluate((s) => document.querySelector(`#ringsWrap .stepbtn[data-ring="void"][data-step="${s}"]`).click(), step);
const voidPoints = (page) => page.evaluate(() => document.getElementById('void_current').value);
const locked = (page) => page.evaluate((ids) => ids.map((i) => document.getElementById(i).readOnly), TRAITS.concat(['ring_void']));

async function main() {
  console.log('Rings & Traits in Play (part 4) checks against: ' + SHEET);
  const browser = await chromium.launch();
  try {
    await scenario('lock', async () => {
      const page = await fresh(browser);
      check('RT123-ENABLED', await page.evaluate(() => window.__L5R_TEST__.MODES123_ENABLED));
      check('RT123-MANAGEMENT-TRAIT-TYPES', await typeTrait(page, 'trait_agility', '3'), '3');
      await stepVoid(page, 1);
      check('RT123-MANAGEMENT-VOID-RING-STEPS', await voidRing(page), '3');
      await stepVoid(page, -1);

      await setMode(page, 'play');
      check('RT123-PLAY-BOXES-READ-ONLY', await locked(page), TRAITS.map(() => true).concat([true]));
      check('RT123-PLAY-TRAIT-TYPING-BLOCKED', await typeTrait(page, 'trait_agility', '5'), '3');
      await stepVoid(page, 1);
      check('RT123-PLAY-VOID-RING-STEPPER-INERT', [await voidRing(page),
        await page.evaluate(() => [...document.querySelectorAll('#ringsWrap .stepbtn[data-ring="void"]')].map((b) => getComputedStyle(b).display))],
        ['2', ['none', 'none']]);
      check('RT123-PLAY-TRAIT-EVENTS-STOPPED', await page.evaluate(() => {
        const el = document.getElementById('trait_agility'); let n = 0; const probe = () => { n++; };
        el.addEventListener('input', probe); el.dispatchEvent(new Event('input', {bubbles: true})); el.removeEventListener('input', probe);
        return n;
      }), 0);
      // Spending a Void Point is a play action and still works.
      const before = await voidPoints(page);
      await onTab(page);
      await page.evaluate(() => { const pip = document.querySelector('#voidPips .void-pip.filled'); if (pip) pip.click(); });
      check('RT123-PLAY-VOID-POINT-SPENDS', [before, await voidPoints(page)], ['2', '1']);
      check('RT123-PLAY-VOID-PIPS-NOT-LOCKED', await page.evaluate(() => [...document.querySelectorAll('#voidPips .void-pip')].some((p) => p.hasAttribute('data-pm12-locked'))), false);
      check('RT123-PLAY-SHOWS-PLAIN-TEXT', await page.evaluate(() => {
        const t = getComputedStyle(document.getElementById('trait_agility')), r = getComputedStyle(document.getElementById('ring_air'));
        return [t.borderTopColor === 'rgba(0, 0, 0, 0)', r.backgroundColor === 'rgba(0, 0, 0, 0)'];
      }), [true, true]);
      // The sheet's own code still writes: a load that raises Reflexes and Awareness raises Air.
      check('RT123-PLAY-OWN-CODE-UPDATES-RINGS', await page.evaluate(() => {
        const T = window.__L5R_TEST__; const d = T.collectData(); d.traits.reflexes = '3'; d.traits.awareness = '3'; T.applyData(d); T.recalcAll();
        return [document.getElementById('ring_air').value, T.MODES12.mode];
      }), ['3', 'play']);

      await setMode(page, 'management');
      check('RT123-BACK-TO-MANAGEMENT', [await locked(page), await page.evaluate(() => document.getElementById('ring_air').readOnly)],
        [TRAITS.map(() => false).concat([false]), true]);
      check('RT123-MANAGEMENT-TRAIT-TYPES-AGAIN', await typeTrait(page, 'trait_stamina', '4'), '4');
      check('RT123-NO-PAGE-ERRORS-LOCK', page.errors, []);
    });

    await scenario('opened from the list', async () => {
      const page = await fresh(browser);
      await page.evaluate(() => { const el = document.getElementById('f_name'); el.value = 'Hida Kisada'; el.dispatchEvent(new Event('input', {bubbles: true})); });
      await page.evaluate(() => document.getElementById('btnSaveAs').click());
      await page.waitForFunction(() => !!document.getElementById('charSelect').value);
      const id = await page.evaluate(() => document.getElementById('charSelect').value);
      await page.evaluate(() => document.getElementById('cl11Toolbar').click());
      await page.waitForFunction(() => !document.getElementById('cl11View').hidden);
      await page.click(`.cl11-row[data-id="${id}"] .cl11-open`);
      await page.waitForFunction(() => document.getElementById('cl11View').hidden);
      check('RT123-OPEN-FROM-LIST-LOCKS-THE-TAB', await locked(page), TRAITS.map(() => true).concat([true]));
      check('RT123-NO-PAGE-ERRORS-LIST', page.errors, []);
    });
  } finally {
    for (const c of OPEN) await c.close().catch(() => {});
    await browser.close();
  }
  console.log(`\n${passed}/${passed + failed} checks passed`);
  process.exitCode = failed ? 1 : 0;
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
