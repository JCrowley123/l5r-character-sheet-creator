/* =============================================================================
   PART K PHASE 12.1 (part 2) — CLAN & SCHOOL IN PLAY: AUTOMATED CHECKS

     NODE_PATH=<node_modules> node qa/clan-school-harness.js [sheet.html]

   Oracles are the page itself: whether a listener the harness attached ever runs, whether Apply
   School actually adds Skill rows, the pickers' disabled state and computed style, and the text a
   picker shows. Fresh browser context per scenario, 390 x 844.
   ============================================================================= */

'use strict';

const { chromium } = require('playwright');
const path = require('path');

const SHEET = path.resolve(process.argv[2] || path.join(__dirname, '..', '..',
  'Part F — Cross-Platform Delivery', 'PART F — Phase 0 Source Reorganization for Maintainability',
  'l5r-character-sheet.html'));
const URL = 'file://' + SHEET;
const PICKERS = ['cfs_clan', 'cfs_minorClan', 'cfs_family', 'cfs_school'];
const BUTTONS = ['cfs_applyFamily', 'cfs_applySchool'];

let passed = 0, failed = 0;
function check(name, actual, expected) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected === undefined ? true : expected);
  if (a === e) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + '\n     expected ' + e + '\n     actual   ' + String(a).slice(0, 600)); }
}
async function scenario(name, body) {
  try { await body(); }
  catch (e) { failed++; console.log('FAIL CS121-SCENARIO-RAN-' + name.replace(/[^a-z]+/gi, '-').toUpperCase() + '\n     ' + String(e.message || e).split('\n')[0]); }
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
const pick = (page, id, value) => page.evaluate(([i, v]) => {
  const el = document.getElementById(i); el.value = v; el.dispatchEvent(new Event('change', {bubbles: true}));
}, [id, value]);
const reaches = (page, id, type) => page.evaluate(([i, t]) => {
  const el = document.getElementById(i); let n = 0; const probe = () => { n++; };
  el.addEventListener(t, probe); el.dispatchEvent(new Event(t, {bubbles: true})); el.removeEventListener(t, probe);
  return n;
}, [id, type]);
const state = (page) => page.evaluate(([p, b]) => ({
  pickersDisabled: p.map((i) => document.getElementById(i).disabled),
  buttonsShown: b.map((i) => getComputedStyle(document.getElementById(i)).display !== 'none'),
}), [PICKERS, BUTTONS]);
const skillRows = (page) => page.evaluate(() => document.querySelectorAll('#skillsBody tr').length);

async function main() {
  console.log('Clan & School in Play (part 2) checks against: ' + SHEET);
  const browser = await chromium.launch();
  try {
    await scenario('lock', async () => {
      const page = await fresh(browser);
      check('CS121-ENABLED', await page.evaluate(() => window.__L5R_TEST__.MODES121_ENABLED));
      // Before choosing: a change on the Clan picker rebuilds the School list.
      check('CS121-MANAGEMENT-EVENTS-REACH', await reaches(page, 'cfs_clan', 'change'), 1);
      await pick(page, 'cfs_clan', 'Crane');
      await pick(page, 'cfs_school', 'Doji Courtier');
      check('CS121-MANAGEMENT-EDITABLE', await state(page), {pickersDisabled: [false, false, false, false], buttonsShown: [true, true]});

      await setMode(page, 'play');
      check('CS121-PLAY-LOCKED', await state(page), {pickersDisabled: [true, true, true, true], buttonsShown: [false, false]});
      check('CS121-PLAY-EVENTS-STOPPED', await reaches(page, 'cfs_school', 'change'), 0);
      // A script's click on Apply School does nothing in Play: no rows, no School.
      const before = await skillRows(page);
      await page.evaluate(() => document.getElementById('cfs_applySchool').click());
      await page.waitForTimeout(300);
      check('CS121-PLAY-APPLY-SCHOOL-INERT', [await skillRows(page), await page.evaluate(() => document.getElementById('f_school').value)], [before, '']);
      // The choice stays visible, as plain text.
      check('CS121-PLAY-SHOWS-THE-CHOICE', await page.evaluate(() => {
        const el = document.getElementById('cfs_school'); const s = getComputedStyle(el);
        return [el.options[el.selectedIndex].text, s.appearance === 'none' || s.webkitAppearance === 'none',
          s.borderTopColor === 'rgba(0, 0, 0, 0)', s.opacity];
      }), ['Doji Courtier', true, true, '1']);

      await setMode(page, 'management');
      check('CS121-BACK-TO-MANAGEMENT', await state(page), {pickersDisabled: [false, false, false, false], buttonsShown: [true, true]});
      await page.evaluate(() => document.getElementById('cfs_applySchool').click());
      await page.waitForFunction(() => document.getElementById('f_school').value === 'Doji Courtier');
      check('CS121-MANAGEMENT-APPLY-SCHOOL-WORKS', (await skillRows(page)) > before);
      check('CS121-NO-PAGE-ERRORS-LOCK', page.errors, []);
    });

    await scenario('affinity info', async () => {
      const page = await fresh(browser);
      await pick(page, 'cfs_clan', 'Phoenix');
      await pick(page, 'cfs_school', 'Isawa Shugenja');
      await page.evaluate(() => document.getElementById('cfs_applySchool').click());
      for (let i = 0; i < 10; i++) {
        await page.waitForTimeout(80);
        await page.evaluate(() => { const o = document.getElementById('affinityPickModalOverlay');
          if (o && o.style.display === 'flex') { document.querySelector('#affinityPickGrid input').click(); document.getElementById('affinityPickConfirm').click(); } });
      }
      await setMode(page, 'play');
      // Information stays reachable in Play.
      check('CS121-PLAY-AFFINITY-INFO-STAYS', await page.evaluate(() => {
        const b = document.getElementById('cfs_affinityBadgeBtn');
        return b ? [b.disabled, b.hasAttribute('data-pm12-locked')] : 'no badge';
      }), [false, false]);
      check('CS121-NO-PAGE-ERRORS-AFFINITY', page.errors, []);
    });

    await scenario('opened from the list', async () => {
      const page = await fresh(browser);
      await page.evaluate(() => { const el = document.getElementById('f_name'); el.value = 'Doji Kuwanan'; el.dispatchEvent(new Event('input', {bubbles: true})); });
      await page.evaluate(() => document.getElementById('btnSaveAs').click());
      await page.waitForFunction(() => !!document.getElementById('charSelect').value);
      const id = await page.evaluate(() => document.getElementById('charSelect').value);
      await page.evaluate(() => document.getElementById('cl11Toolbar').click());
      await page.waitForFunction(() => !document.getElementById('cl11View').hidden);
      await page.click(`.cl11-row[data-id="${id}"] .cl11-open`);
      await page.waitForFunction(() => document.getElementById('cl11View').hidden);
      check('CS121-OPEN-FROM-LIST-LOCKS-THE-TAB', await state(page), {pickersDisabled: [true, true, true, true], buttonsShown: [false, false]});
      check('CS121-NO-PAGE-ERRORS-LIST', page.errors, []);
    });
  } finally {
    for (const c of OPEN) await c.close().catch(() => {});
    await browser.close();
  }
  console.log(`\n${passed}/${passed + failed} checks passed`);
  process.exitCode = failed ? 1 : 0;
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
