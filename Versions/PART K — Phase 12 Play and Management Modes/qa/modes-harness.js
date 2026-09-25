/* =============================================================================
   PART K PHASE 12 (part 1) — PLAY AND MANAGEMENT MODES: AUTOMATED CHECKS

     NODE_PATH=<global node_modules> node qa/modes-harness.js [sheet.html]

   Defaults to the live Phase 0 build; fresh browser context per scenario, 390 x 844.

   ORACLES are the page itself, never the phase's own answers: what a real keystroke leaves in the
   field, whether a listener the harness attached ever runs, what collectData() returns, and the
   computed style. The mode is read from the seam only to report it, and every check that matters
   is also checked through the field's behaviour.
   ============================================================================= */

'use strict';

const { chromium } = require('playwright');
const path = require('path');

const SHEET = path.resolve(process.argv[2] || path.join(__dirname, '..', '..',
  'Part F — Cross-Platform Delivery', 'PART F — Phase 0 Source Reorganization for Maintainability',
  'l5r-character-sheet.html'));
const URL = 'file://' + SHEET;
const BACKGROUND = ['f_appearance', 'f_personality', 'f_history', 'f_notes'];

let passed = 0, failed = 0;
function check(name, actual, expected) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected === undefined ? true : expected);
  if (a === e) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + '\n     expected ' + e + '\n     actual   ' + String(a).slice(0, 600)); }
}
async function scenario(name, body) {
  try { await body(); }
  catch (e) { failed++; console.log('FAIL PM12-SCENARIO-RAN-' + name.replace(/[^a-z]+/gi, '-').toUpperCase() + '\n     ' + String(e.message || e).split('\n')[0]); }
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
const mode = (page) => page.evaluate(() => window.__L5R_TEST__.MODES12 ? window.__L5R_TEST__.MODES12.mode : 'no MODES12');
const toggleState = (page) => page.evaluate(() => {
  const b = document.getElementById('pm12Toggle');
  return b ? [b.textContent, b.getAttribute('aria-pressed')] : 'no toggle';
});
// Type through the real keyboard into a field, and report what the field holds afterwards.
async function typeInto(page, id, text) {
  // A field on a hidden carousel page cannot take focus, so bring its tab on screen first.
  await page.evaluate(async (i) => {
    const C = window.__L5R_CAROUSEL__, el = document.getElementById(i);
    const tab = el.closest('.car-page').dataset.tabLabel;
    if (C.getActiveTab().label !== tab) { C.goToTab(tab); if (C.whenSettled) await C.whenSettled(); }
    el.focus(); el.setSelectionRange(el.value.length, el.value.length);
  }, id);
  await page.keyboard.type(text);
  return page.evaluate((i) => document.getElementById(i).value, id);
}
// Does an 'input' event dispatched by a script reach a listener attached to the field itself?
const dispatchReaches = (page, id) => page.evaluate((i) => {
  const el = document.getElementById(i);
  let reached = 0;
  const probe = () => { reached++; };
  el.addEventListener('input', probe);
  el.dispatchEvent(new Event('input', {bubbles: true}));
  el.removeEventListener('input', probe);
  return reached;
}, id);
const readOnly = (page) => page.evaluate((ids) => ids.map((i) => document.getElementById(i).readOnly), BACKGROUND);
const plainText = (page) => page.evaluate(() => {
  const s = getComputedStyle(document.getElementById('f_notes'));
  return s.backgroundColor === 'rgba(0, 0, 0, 0)' && s.borderTopColor === 'rgba(0, 0, 0, 0)';
});
async function setField(page, id, value) {
  await page.evaluate(([i, v]) => {
    const el = document.getElementById(i); el.value = v;
    el.dispatchEvent(new Event('input', {bubbles: true})); el.dispatchEvent(new Event('change', {bubbles: true}));
  }, [id, value]);
}

async function main() {
  console.log('Play and Management modes (part 1) checks against: ' + SHEET);
  const browser = await chromium.launch();
  try {
    await scenario('toggle and gate', async () => {
      const page = await fresh(browser);
      check('PM12-ENABLED', await page.evaluate(() => window.__L5R_TEST__.MODES12_ENABLED));
      check('PM12-BLANK-SHEET-IS-MANAGEMENT', [await mode(page), await toggleState(page)], ['management', ['Done', 'true']]);
      check('PM12-MANAGEMENT-TYPING-WORKS', await typeInto(page, 'f_notes', 'abc'), 'abc');
      check('PM12-MANAGEMENT-EVENTS-REACH-THE-FIELD', await dispatchReaches(page, 'f_notes'), 1);
      check('PM12-MANAGEMENT-LOOKS-EDITABLE', await plainText(page), false);
      const before = await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));

      await page.click('#pm12Toggle');
      check('PM12-TOGGLE-TO-PLAY', [await mode(page), await toggleState(page), await page.evaluate(() => document.body.classList.contains('pm12-play'))],
        ['play', ['Manage', 'false'], true]);
      check('PM12-PLAY-BACKGROUND-READ-ONLY', await readOnly(page), [true, true, true, true]);
      check('PM12-PLAY-TYPING-BLOCKED', await typeInto(page, 'f_notes', 'xyz'), 'abc');
      check('PM12-PLAY-TYPING-BLOCKED-EVERY-FIELD', await Promise.all(['f_appearance', 'f_personality', 'f_history'].map((i) => typeInto(page, i, 'q'))), ['', '', '']);
      check('PM12-PLAY-DISPATCHED-EVENT-STOPPED', await dispatchReaches(page, 'f_notes'), 0);
      check('PM12-PLAY-SHOWS-PLAIN-TEXT', await plainText(page));
      // The sheet's own code writing a value is not a user event: a load still fills the field.
      check('PM12-PLAY-OWN-CODE-STILL-WRITES', await page.evaluate(() => {
        const T = window.__L5R_TEST__; const d = T.collectData(); d.fields.f_notes = 'Loaded note'; T.applyData(d);
        return [document.getElementById('f_notes').value, T.MODES12.mode];
      }), ['Loaded note', 'play']);
      await page.evaluate(() => { const T = window.__L5R_TEST__; const d = T.collectData(); d.fields.f_notes = 'abc'; T.applyData(d); });

      // A control added while in Play is locked as it appears; one the sheet made read-only stays so.
      check('PM12-REGISTRY-AND-NEW-ROWS', await page.evaluate(async () => {
        const T = window.__L5R_TEST__;
        const own = document.createElement('input'); own.type = 'text'; own.className = 'pm12-probe-ro'; own.readOnly = true;
        document.body.appendChild(own);
        T.MODES12.register('.pm12-probe, .pm12-probe-ro');
        const late = document.createElement('input'); late.type = 'text'; late.className = 'pm12-probe';
        document.body.appendChild(late);
        await new Promise((r) => setTimeout(r, 50));
        const inPlay = [late.readOnly, own.readOnly];
        T.MODES12.set('management');
        const after = [late.readOnly, own.readOnly];
        T.MODES12.set('play');
        return [inPlay, after];
      }), [[true, true], [false, true]]);

      await page.click('#pm12Toggle');
      check('PM12-TOGGLE-BACK-TO-MANAGEMENT', [await mode(page), await readOnly(page), await typeInto(page, 'f_notes', 'd')],
        ['management', [false, false, false, false], 'abcd']);
      await setField(page, 'f_notes', 'abc');
      check('PM12-MODE-NEVER-SAVED', await page.evaluate((b) => {
        const now = JSON.stringify(window.__L5R_TEST__.collectData());
        return [now === b, /pm12|MODES12/i.test(now)];
      }, before), [true, false]);
      check('PM12-NO-PAGE-ERRORS-GATE', page.errors, []);
    });

    await scenario('entry points', async () => {
      const page = await fresh(browser);
      await setField(page, 'f_name', 'Kakita Aoi');
      await page.evaluate(() => document.getElementById('btnSaveAs').click());
      await page.waitForFunction(() => !!document.getElementById('charSelect').value);
      const id = await page.evaluate(() => document.getElementById('charSelect').value);
      check('PM12-SAVE-STAYS-MANAGEMENT', await mode(page), 'management');
      await page.evaluate(() => document.getElementById('cl11Toolbar').click());
      await page.waitForFunction(() => !document.getElementById('cl11View').hidden);
      // Opening the character that is already open still counts as opening it from the list.
      await page.click(`.cl11-row[data-id="${id}"] .cl11-open`);
      await page.waitForFunction(() => document.getElementById('cl11View').hidden);
      check('PM12-OPEN-FROM-LIST-IS-PLAY', [await mode(page), await readOnly(page)], ['play', [true, true, true, true]]);
      // The old toolbar's Load stays in Management.
      await page.evaluate((i) => { document.getElementById('charSelect').value = i; document.getElementById('btnLoad').click(); }, id);
      await page.waitForTimeout(200);
      check('PM12-TOOLBAR-LOAD-IS-MANAGEMENT', [await mode(page), await readOnly(page)], ['management', [false, false, false, false]]);
      // New Blank too. Put the sheet in Play explicitly first: toggling would depend on the mode the
      // Load check left behind (the first variant run found that blind spot).
      check('PM12-BEFORE-NEW-BLANK-IS-PLAY', await page.evaluate(() => { window.__L5R_TEST__.MODES12.set('play'); return window.__L5R_TEST__.MODES12.mode; }), 'play');
      await page.evaluate(() => document.getElementById('btnNew').click());
      for (let i = 0; i < 5; i++) {
        await page.waitForTimeout(100);
        await page.evaluate(() => { const o = document.getElementById('appConfirmOverlay'); if (o && o.style.display === 'flex') document.getElementById('appConfirmOk').click(); });
      }
      check('PM12-NEW-BLANK-IS-MANAGEMENT', await mode(page), 'management');
      check('PM12-NO-PAGE-ERRORS-ENTRY', page.errors, []);
    });

    await scenario('wizard', async () => {
      const page = await fresh(browser);
      await page.click('#pm12Toggle');
      await page.evaluate(() => document.getElementById('cl11Toolbar').click());
      await page.waitForFunction(() => !document.getElementById('cl11View').hidden);
      await page.click('#cl11Create');
      await page.waitForFunction(() => { const v = document.getElementById('cw112View'); return v && !v.hidden; });
      check('PM12-WIZARD-RUNS-IN-MANAGEMENT', await mode(page), 'management');
      // The wizard's Next calls CW112.finish by property on its last step; call it the same way.
      await page.evaluate(() => window.__L5R_TEST__.CW112.finish());
      check('PM12-WIZARD-FINISH-IS-PLAY', [await mode(page), await page.evaluate(() => document.getElementById('cw112View').hidden)], ['play', true]);
      check('PM12-NO-PAGE-ERRORS-WIZARD', page.errors, []);
    });
  } finally {
    for (const c of OPEN) await c.close().catch(() => {});
    await browser.close();
  }
  console.log(`\n${passed}/${passed + failed} checks passed`);
  process.exitCode = failed ? 1 : 0;
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
