/* =============================================================================
   PART K PHASE 12.6 — TECHNIQUES IN PLAY: AUTOMATED CHECKS

     NODE_PATH=<node_modules> node qa/techniques-harness.js [sheet.html]

   Oracles are the page itself: what real keystrokes leave in an entry's name, how many entries the
   list holds after Add or remove, whether the memorised tick changes, whether a listener the harness
   attaches to Cast still hears a click, and the computed style. Advantage rows share the entry
   classes, so the part must not reach them.
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
  else { failed++; console.log('FAIL ' + name + '\n     expected ' + e + '\n     actual   ' + String(a).slice(0, 600)); }
}
async function scenario(name, body) {
  try { await body(); }
  catch (e) { failed++; console.log('FAIL TQ126-SCENARIO-RAN-' + name.replace(/[^a-z]+/gi, '-').toUpperCase() + '\n     ' + String(e.message || e).split('\n')[0]); }
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
// A plain technique, a spell (with its Cast button) and an Advantage row, through the sheet's own load.
const seed = (page) => page.evaluate(() => {
  const T = window.__L5R_TEST__; const d = T.collectData();
  d.tech = [{name: 'The Way of the Crab', cost: 0, desc: 'School technique', spellElement: '', spellMastery: '', spellKeywords: '', spellIsMaho: false, isMemorised: false, memorisationXpCost: ''},
    {name: 'Sense', cost: 0, desc: 'Universal spell', spellElement: 'universal', spellMastery: '1', spellKeywords: '', spellIsMaho: false, isMemorised: false, memorisationXpCost: ''}];
  d.adv = [{name: 'Luck', cost: 3, desc: ''}];
  T.applyData(d); T.recalcAll();
});
const entries = (page) => page.evaluate(() => document.querySelectorAll('#techList .entry').length);
const firstEntry = (page) => page.evaluate(() => {
  const e = document.querySelector('#techList .entry');
  const shown = (el) => el ? getComputedStyle(el).display !== 'none' : 'missing';
  return {text: ['.en-name', '.en-cost', '.en-desc'].map((s) => e.querySelector(s).readOnly), remove: shown(e.querySelector('.rm-btn')),
    pickers: [shown(document.getElementById('techQuickAdd')), shown(document.getElementById('pathPicker')), shown(document.getElementById('addTech'))]};
});
async function typeName(page, text) {
  await page.evaluate(async () => {
    const C = window.__L5R_CAROUSEL__; if (C.getActiveTab().label !== 'Techniques') { C.goToTab('Techniques'); if (C.whenSettled) await C.whenSettled(); }
    const el = document.querySelector('#techList .entry .en-name'); el.focus(); el.setSelectionRange(el.value.length, el.value.length);
  });
  await page.keyboard.type(text);
  return page.evaluate(() => document.querySelector('#techList .entry .en-name').value);
}

async function main() {
  console.log('Techniques in Play checks against: ' + SHEET);
  const browser = await chromium.launch();
  try {
    await scenario('lock', async () => {
      const page = await fresh(browser);
      check('TQ126-ENABLED', await page.evaluate(() => window.__L5R_TEST__.MODES126_ENABLED));
      await seed(page);
      check('TQ126-MANAGEMENT-NAME-TYPES', await typeName(page, '!'), 'The Way of the Crab!');
      const base = await entries(page);

      await setMode(page, 'play');
      check('TQ126-PLAY-ENTRY-LOCKED', await firstEntry(page), {text: [true, true, true], remove: false, pickers: [false, false, false]});
      check('TQ126-PLAY-NAME-TYPING-BLOCKED', await typeName(page, 'x'), 'The Way of the Crab!');
      // Checked one at a time: an Add and a remove together cancel out in the count (the first variant
      // run found that blind spot).
      await page.evaluate(() => document.getElementById('addTech').click());
      check('TQ126-PLAY-ADD-INERT', await entries(page), base);
      const beforeRemove = await entries(page);
      await page.evaluate(() => document.querySelector('#techList .entry .rm-btn').click());
      check('TQ126-PLAY-REMOVE-INERT', await entries(page), beforeRemove);
      check('TQ126-PLAY-MEMORISED-TICK-INERT', await page.evaluate(() => {
        const box = document.querySelector('#techList .spell-memo-checkbox'); if (!box) return 'no tick';
        const was = box.checked; box.click(); return [box.disabled, box.checked === was];
      }), [true, true]);
      // Cast is a play action: a click on it still reaches its listeners.
      check('TQ126-PLAY-CAST-STAYS-LIVE', await page.evaluate(() => {
        const cast = document.querySelector('#techList .spell-cast-btn'); if (!cast) return 'no Cast button';
        let heard = 0; const probe = () => { heard++; };
        cast.addEventListener('click', probe); cast.dispatchEvent(new MouseEvent('click', {bubbles: true})); cast.removeEventListener('click', probe);
        return [heard, cast.hasAttribute('data-pm12-locked')];
      }), [1, false]);
      await page.keyboard.press('Escape');
      // Advantage rows share the classes; this part must not reach them.
      check('TQ126-ADVANTAGE-ROWS-NOT-REACHED', await page.evaluate(() => {
        const sel = window.__L5R_TEST__.MODES126.selector;
        return [...document.querySelectorAll('#advList .en-name, #advList .rm-btn, #advList .en-cost')].some((el) => el.matches(sel));
      }), false);
      check('TQ126-PLAY-NEW-ENTRY-LOCKED', await page.evaluate(async () => {
        const T = window.__L5R_TEST__; const d = T.collectData();
        d.tech.push({name: 'Kata: Striking as Earth', cost: 3, desc: '', spellElement: '', spellMastery: '', spellKeywords: '', spellIsMaho: false, isMemorised: false, memorisationXpCost: ''});
        T.applyData(d); await new Promise((r) => setTimeout(r, 50));
        const e = [...document.querySelectorAll('#techList .entry')].find((x) => x.querySelector('.en-name').value === 'Kata: Striking as Earth');
        return e ? e.querySelector('.en-name').readOnly : 'no entry';
      }));
      check('TQ126-PLAY-SHOWS-PLAIN-TEXT', await page.evaluate(() => getComputedStyle(document.querySelector('#techList .entry .en-name')).borderTopColor === 'rgba(0, 0, 0, 0)'));

      await setMode(page, 'management');
      check('TQ126-BACK-TO-MANAGEMENT', await firstEntry(page), {text: [false, false, false], remove: true, pickers: [true, true, true]});
      const now = await entries(page);
      await page.evaluate(() => [...document.querySelectorAll('#techList .entry')].pop().querySelector('.rm-btn').click());
      check('TQ126-MANAGEMENT-REMOVE-WORKS', await entries(page), now - 1);
      check('TQ126-NO-PAGE-ERRORS-LOCK', page.errors, []);
    });

    await scenario('opened from the list', async () => {
      const page = await fresh(browser);
      await seed(page);
      await page.evaluate(() => { const el = document.getElementById('f_name'); el.value = 'Kuni Mokuna'; el.dispatchEvent(new Event('input', {bubbles: true})); });
      await page.evaluate(() => document.getElementById('btnSaveAs').click());
      await page.waitForFunction(() => !!document.getElementById('charSelect').value);
      const id = await page.evaluate(() => document.getElementById('charSelect').value);
      await page.evaluate(() => document.getElementById('cl11Toolbar').click());
      await page.waitForFunction(() => !document.getElementById('cl11View').hidden);
      await page.click(`.cl11-row[data-id="${id}"] .cl11-open`);
      await page.waitForFunction(() => document.getElementById('cl11View').hidden);
      check('TQ126-OPEN-FROM-LIST-LOCKS-THE-TAB', (await firstEntry(page)).text, [true, true, true]);
      check('TQ126-NO-PAGE-ERRORS-LIST', page.errors, []);
    });
  } finally {
    for (const c of OPEN) await c.close().catch(() => {});
    await browser.close();
  }
  console.log(`\n${passed}/${passed + failed} checks passed`);
  process.exitCode = failed ? 1 : 0;
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
