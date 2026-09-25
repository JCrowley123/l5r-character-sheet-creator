/* =============================================================================
   PART K PHASE 12.4 (part 5) — SKILLS IN PLAY: AUTOMATED CHECKS

     NODE_PATH=<node_modules> node qa/skills-harness.js [sheet.html]

   Oracles are the page itself: what real keystrokes leave in a Rank box, how many rows the table
   holds after Add Skill or a row's remove button is clicked, whether the School tick changes, whether
   the d10 opens a roll, and the computed style. Rolling must keep working in Play.
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
  catch (e) { failed++; console.log('FAIL SK124-SCENARIO-RAN-' + name.replace(/[^a-z]+/gi, '-').toUpperCase() + '\n     ' + String(e.message || e).split('\n')[0]); }
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
async function applyHida(page) {
  await page.evaluate(() => {
    const s = (i, v) => { const e = document.getElementById(i); e.value = v; e.dispatchEvent(new Event('change', {bubbles: true})); };
    s('cfs_clan', 'Crab'); s('cfs_school', 'Hida Bushi');
    document.getElementById('cfs_applySchool').click();
  });
  // Wait for Apply School to finish, not merely for its first rows: its later steps write Ranks.
  await page.waitForFunction(() => /^Applied Hida Bushi/.test(document.getElementById('statusMsg').textContent));
  await page.waitForTimeout(200);
}
const onSkills = (page) => page.evaluate(async () => {
  const C = window.__L5R_CAROUSEL__;
  if (C.getActiveTab().label !== 'Skills') { C.goToTab('Skills'); if (C.whenSettled) await C.whenSettled(); }
});
const rows = (page) => page.evaluate(() => document.querySelectorAll('#skillsBody tr').length);
// Replace the first row's Rank through real keystrokes; returns what it holds afterwards.
async function typeRank(page, text) {
  await onSkills(page);
  await page.evaluate(() => { const el = document.querySelector('#skillsBody tr .sk-rank'); el.focus(); el.select(); });
  await page.keyboard.type(text);
  return page.evaluate(() => document.querySelector('#skillsBody tr .sk-rank').value);
}
const rowControls = (page) => page.evaluate(() => {
  const tr = document.querySelector('#skillsBody tr');
  const shown = (el) => el ? getComputedStyle(el).display !== 'none' : 'missing';
  return {
    textReadOnly: ['.sk-name', '.sk-trait', '.sk-rank'].map((s) => tr.querySelector(s).readOnly),
    schoolDisabled: tr.querySelector('.sk-school').disabled,
    buttonsShown: [shown(tr.querySelector('.rm-btn:not(.emph-item-del)')), shown(tr.querySelector('.emph-add-btn'))],
    addShown: [shown(document.getElementById('addSkill')), shown(document.getElementById('loadAllSkills')), shown(document.getElementById('skillQuickAdd'))],
  };
});

async function main() {
  console.log('Skills in Play (part 5) checks against: ' + SHEET);
  const browser = await chromium.launch();
  try {
    await scenario('lock', async () => {
      const page = await fresh(browser);
      check('SK124-ENABLED', await page.evaluate(() => window.__L5R_TEST__.MODES124_ENABLED));
      await applyHida(page);
      check('SK124-MANAGEMENT-RANK-TYPES', await typeRank(page, '2'), '2');
      const base = await rows(page);
      await page.evaluate(() => document.getElementById('addSkill').click());
      check('SK124-MANAGEMENT-ADD-SKILL-WORKS', await rows(page), base + 1);
      await page.evaluate(() => { const r = [...document.querySelectorAll('#skillsBody tr')].pop(); r.querySelector('.rm-btn').click(); });

      await setMode(page, 'play');
      check('SK124-PLAY-ROW-CONTROLS-LOCKED', await rowControls(page),
        {textReadOnly: [true, true, true], schoolDisabled: true, buttonsShown: [false, false], addShown: [false, false, false]});
      check('SK124-PLAY-RANK-TYPING-BLOCKED', await typeRank(page, '4'), '2');
      await page.evaluate(() => { document.getElementById('addSkill').click(); document.getElementById('loadAllSkills').click(); });
      check('SK124-PLAY-ADD-SKILL-INERT', await rows(page), base);
      await page.evaluate(() => document.querySelector('#skillsBody tr .rm-btn').click());
      check('SK124-PLAY-REMOVE-INERT', await rows(page), base);
      check('SK124-PLAY-SCHOOL-TICK-INERT', await page.evaluate(() => {
        const box = document.querySelector('#skillsBody tr .sk-school'); const was = box.checked; box.click(); return box.checked === was;
      }));
      // Rolling is a play action: the d10 still opens a roll.
      check('SK124-PLAY-D10-ROLLS', await page.evaluate(async () => {
        document.getElementById('statusMsg').textContent = '';
        document.querySelector('#skillsBody tr .sk-roll').click();
        await new Promise((r) => setTimeout(r, 300));
        return [...document.querySelectorAll('.roll-modal-overlay')].some((o) => getComputedStyle(o).display !== 'none');
      }));
      await page.keyboard.press('Escape');
      check('SK124-PLAY-ROLL-AND-INFO-NOT-LOCKED', await page.evaluate(() => [
        document.querySelector('#skillsBody tr .sk-roll').hasAttribute('data-pm12-locked'),
        document.querySelector('#skillsBody tr .sk-info-btn').hasAttribute('data-pm12-locked'),
        document.getElementById('btnUntrainedSkills').hasAttribute('data-pm12-locked')]), [false, false, false]);
      // A row that appears while in Play is locked as it appears (a load adds one here).
      check('SK124-PLAY-NEW-ROW-LOCKED', await page.evaluate(async () => {
        const T = window.__L5R_TEST__; const d = T.collectData();
        d.skills.push({name: 'Lore: Heraldry', trait: 'Intelligence', rank: 1, school: false, emph: ''});
        T.applyData(d);
        await new Promise((r) => setTimeout(r, 50));
        const tr = [...document.querySelectorAll('#skillsBody tr')].find((x) => x.querySelector('.sk-name').value === 'Lore: Heraldry');
        return tr ? [tr.querySelector('.sk-rank').readOnly, tr.querySelector('.sk-school').disabled] : 'no row';
      }), [true, true]);
      check('SK124-PLAY-SHOWS-PLAIN-VALUES', await page.evaluate(() => {
        const r = getComputedStyle(document.querySelector('#skillsBody tr .sk-rank'));
        return [r.borderTopColor === 'rgba(0, 0, 0, 0)', r.appearance === 'textfield'];
      }), [true, true]);

      await setMode(page, 'management');
      check('SK124-BACK-TO-MANAGEMENT', await rowControls(page),
        {textReadOnly: [false, false, false], schoolDisabled: false, buttonsShown: [true, true], addShown: [true, true, true]});
      const now = await rows(page);
      await page.evaluate(() => [...document.querySelectorAll('#skillsBody tr')].pop().querySelector('.rm-btn').click());
      check('SK124-MANAGEMENT-REMOVE-WORKS', await rows(page), now - 1);
      check('SK124-NO-PAGE-ERRORS-LOCK', page.errors, []);
    });

    await scenario('opened from the list', async () => {
      const page = await fresh(browser);
      await applyHida(page);
      await page.evaluate(() => { const el = document.getElementById('f_name'); el.value = 'Hida Yakamo'; el.dispatchEvent(new Event('input', {bubbles: true})); });
      await page.evaluate(() => document.getElementById('btnSaveAs').click());
      await page.waitForFunction(() => !!document.getElementById('charSelect').value);
      const id = await page.evaluate(() => document.getElementById('charSelect').value);
      await page.evaluate(() => document.getElementById('cl11Toolbar').click());
      await page.waitForFunction(() => !document.getElementById('cl11View').hidden);
      await page.click(`.cl11-row[data-id="${id}"] .cl11-open`);
      await page.waitForFunction(() => document.getElementById('cl11View').hidden);
      check('SK124-OPEN-FROM-LIST-LOCKS-THE-TAB', (await rowControls(page)).textReadOnly, [true, true, true]);
      check('SK124-NO-PAGE-ERRORS-LIST', page.errors, []);
    });
  } finally {
    for (const c of OPEN) await c.close().catch(() => {});
    await browser.close();
  }
  console.log(`\n${passed}/${passed + failed} checks passed`);
  process.exitCode = failed ? 1 : 0;
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
