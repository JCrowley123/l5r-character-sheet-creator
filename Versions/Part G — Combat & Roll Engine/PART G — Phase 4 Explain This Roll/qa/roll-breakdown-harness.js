/* =============================================================================
   PART G PHASE 4 — "EXPLAIN THIS ROLL" — AUTOMATED CHECKS

     NODE_PATH=$(npm root -g) node qa/roll-breakdown-harness.js <built-sheet.html>

   WHAT THIS PHASE ACTUALLY CHANGED. Callers that previously threw away the
   parts of the base pool after adding them up now DECLARE those parts on the
   roll context, and one pure function shapes them into rows shown in both the
   preview and the result. Nothing about the arithmetic of a roll moved.

   THE ORACLE IS THE POOL THE PIPELINE WAS GIVEN, NOT THE ROWS. Every base-pool
   assertion parses the XkY out of the rendered rows, sums them independently
   here in the harness, and compares that sum against the base pool the roll
   was actually made with. So a row that says the wrong thing fails even if it
   says it consistently. A check that asked buildRollBasePoolRows() what it
   thought and compared that against what it painted would pass forever and
   prove nothing.

   THE ONES THIS HARNESS EXISTS TO CATCH:
     * A breakdown that does not reconcile with its own pool (checks 1-8).
       This is the failure that makes an explanation worse than silence.
     * A guess where there should be silence (checks 9-10). An undeclared kind
       must produce no rows at all, and declared numbers that do not add up
       must produce the honest fallback row -- never a plausible-looking
       decomposition.
     * The two moments drifting apart (checks 13-14). The whole point of the
       trunk now calling Phase 3's shared renderer is that the preview and the
       result cannot disagree; these compare them row for row.

   Reads only. Never writes to the file it is given.
   ============================================================================= */

'use strict';

const { chromium } = require('playwright');
const path = require('path');
const { pathToFileURL } = require('url');

const LAUNCH = process.env.L5R_CHROME
  ? { executablePath: process.env.L5R_CHROME }
  : {};

const results = [];
const record = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};
const check = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  record(name, pass, pass ? JSON.stringify(actual) : `got=${JSON.stringify(actual)} want=${JSON.stringify(expected)}`);
};

// ---------------------------------------------------------------------------
// The independent oracle: add the rows up ourselves.
// A row's dice contribution is the FIRST XkY in its text. "3k3 — rolled and
// kept" contributes 3 rolled / 3 kept; "+4k0 — base 3, +1 Affinity" contributes
// 4 rolled / 0 kept; "no Skill Rank to add" contributes nothing. Deliberately
// written here rather than imported, so it cannot inherit a bug from the code
// it is checking.
// ---------------------------------------------------------------------------
// Every row access below goes through this. A build with the phase disabled or deleted
// returns [] from every call, and a harness that then throws reports nothing at all -- so it
// would be unable to tell "the feature is off" from "the harness is broken". Phase 3's harness
// learned this the hard way; see its README.
const row = (rows, i) => (rows && rows[i]) || { label: '', txt: '' };

const sumRows = (rows) => (rows || []).reduce((acc, r) => {
  const m = String(r.txt || '').match(/^([+-]?\d+)k([+-]?\d+)/);
  if (m) { acc.rolled += parseInt(m[1], 10); acc.kept += parseInt(m[2], 10); }
  return acc;
}, { rolled: 0, kept: 0 });

const rowsFor = (page, kind, extra, baseRolled, baseKept) =>
  page.evaluate(([k, e, br, bk]) => {
    const T = window.__L5R_TEST__;
    return T.buildRollBasePoolRows(T.makeRollContext(T.ROLL_KINDS[k], e), br, bk);
  }, [kind, extra, baseRolled, baseKept]);

// Fire a roll without awaiting it: rollWithModifiers() is async and does not
// settle until the preview is answered, so returning its promise would hang.
const startRoll = async (page, title, kind, extra, rolled, kept, opts) => {
  await page.evaluate(([t, k, e, r, kp, o]) => {
    window.__L5R_TEST__.rollWithModifiers(t,
      window.__L5R_TEST__.makeRollContext(window.__L5R_TEST__.ROLL_KINDS[k], e), r, kp, o || {});
  }, [title, kind, extra, rolled, kept, opts || {}]);
  await page.waitForTimeout(160);
};

// Without Phase 3 there is no preview to confirm -- the roll fires immediately and
// #rollPreviewGo never exists. Waiting 30s for it and throwing would tell us nothing; this
// harness has to be able to report a NUMBER against a build missing the phase it depends on.
const clickIfPresent = async (page, sel) => {
  const el = await page.$(sel);
  if (el) { await el.click(); return true; }
  return false;
};

const paintedRows = (page, sel) => page.evaluate((s) =>
  Array.from(document.querySelectorAll(s)).map(n => ({
    label: (n.querySelector('.rp-mod-label') || {}).textContent || '',
    txt: (n.querySelector('.rp-mod-txt') || {}).textContent || '',
  })), sel);

const barGroups = (page) => page.evaluate(() => {
  const bar = document.getElementById('rollModifierBar');
  if (!bar) return null;
  const out = { titles: [], base: [], mods: [] };
  let current = null;
  Array.from(bar.children).forEach(n => {
    if (n.classList.contains('roll-mod-title')) {
      out.titles.push(n.textContent.trim());
      current = /modifier/i.test(n.textContent) ? 'mods' : 'base';
    } else if (n.classList.contains('roll-mod-item') && current) {
      const b = n.querySelector('b');
      out[current].push({
        label: (b ? b.textContent : '').replace(/:$/, ''),
        txt: n.textContent.replace(/^[^:]*:\s*/, ''),
      });
    }
  });
  return out;
});

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('usage: roll-breakdown-harness.js <built-sheet.html>');
    process.exit(2);
  }

  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  await page.goto(pathToFileURL(path.resolve(file)).href);
  await page.waitForTimeout(300);

  const present = await page.evaluate(() => typeof window.__L5R_TEST__.buildRollBasePoolRows);
  if (present !== 'function') {
    record('the phase exports buildRollBasePoolRows on the test seam', false, 'got ' + present);
    console.log('\nThe rest of this harness needs that function. Stopping here.');
    console.log(`\n${results.filter(r => r.pass).length}/${results.length} checks passed`);
    await browser.close();
    process.exit(1);
  }

  // =========================================================================
  // 1-8. Every declared kind reconciles: the rows add up to the pool the roll
  //      was actually made with. This is the whole contract of the phase.
  // =========================================================================
  const cases = [
    ['SKILL trained',   'SKILL',      { skillName:'Kenjutsu', traitName:'Agility', skillRank:2, traitValue:3 }, 5, 3],
    ['SKILL unskilled', 'SKILL',      { skillName:'Tea Ceremony', traitName:'Void', skillRank:0, traitValue:2, unskilled:true }, 2, 2],
    ['ATTACK',          'ATTACK',     { skillName:'Kyujutsu', traitName:'Reflexes', skillRank:3, traitValue:2 }, 5, 2],
    ['RING',            'RING',       { ringName:'Earth', ringValue:2 }, 2, 2],
    ['TRAIT',           'TRAIT',      { traitName:'Willpower', traitValue:4 }, 4, 4],
    ['SPELL, affinity', 'SPELL',      { element:'Water', ringValue:3, schoolRank:4, schoolRankBase:3 }, 7, 3],
    ['SPELL, plain',    'SPELL',      { element:'Air', ringValue:2, schoolRank:2, schoolRankBase:2 }, 4, 2],
    ['INITIATIVE',      'INITIATIVE', { traitValue:3, insightRank:2 }, 5, 3],
  ];
  for (const [name, kind, extra, br, bk] of cases) {
    const rows = await rowsFor(page, kind, extra, br, bk);
    check(`${name}: the rows add up to the pool the roll was given`,
      sumRows(rows), { rolled: br, kept: bk });
  }

  // =========================================================================
  // 9. Silence, not a guess. A caller that declared nothing gets no rows --
  //    the alternative is a breakdown invented from the sheet, which is the
  //    design this phase deliberately rejected.
  // =========================================================================
  check('a context with nothing declared produces no rows at all',
    await rowsFor(page, 'SKILL', { skillName: 'Kenjutsu' }, 4, 2), []);

  // =========================================================================
  // 10. Declared numbers that do not reconcile produce the honest fallback,
  //     not a decomposition that disagrees with the roll.
  // =========================================================================
  const bad = await rowsFor(page, 'RING', { ringName: 'Fire', ringValue: 9 }, 2, 2);
  check('parts that do not reconcile fall back to one honest "Base pool" row',
    { n: bad.length, label: row(bad, 0).label, saysPool: /2k2/.test(row(bad, 0).txt) },
    { n: 1, label: 'Base pool', saysPool: true });

  // =========================================================================
  // 11. Affinity is shown on the School Rank row, not as a row of its own --
  //     it moved a rank the row above already counts, so a separate row would
  //     show the same die twice. (Check 6 above proves the sum stays right.)
  // =========================================================================
  const spellRows = await rowsFor(page, 'SPELL', { element:'Water', ringValue:3, schoolRank:4, schoolRankBase:3 }, 7, 3);
  check('an Affinity annotates the School Rank row rather than adding one',
    { rows: spellRows.length, note: /base 3, \+1 Affinity/.test(row(spellRows, 1).txt) },
    { rows: 2, note: true });
  const plainRows = await rowsFor(page, 'SPELL', { element:'Air', ringValue:2, schoolRank:2, schoolRankBase:2 }, 4, 2);
  check('no Affinity means no "base N" note invented on the School Rank row',
    /base/.test(row(plainRows, 1).txt), false);

  // =========================================================================
  // 12. Manual notation claims no composition it cannot know.
  // =========================================================================
  const manual = await rowsFor(page, 'MANUAL', { notation: '5k3' }, 5, 3);
  check('a hand-entered roll says where the number came from and nothing more',
    manual, [{ label: 'Entered by hand', txt: '5k3' }]);

  // =========================================================================
  // 13. THE GAP THIS PHASE CLOSES. Before it, the post-roll bar appeared only
  //     when a modifier applied, so an ordinary unmodified roll could not be
  //     explained at all. The Pool group must appear with zero modifiers.
  // =========================================================================
  await startRoll(page, 'Kenjutsu / Agility', 'SKILL',
    { skillName:'Kenjutsu', traitName:'Agility', skillRank:2, traitValue:3 }, 5, 3);
  await clickIfPresent(page, '#rollPreviewGo');
  await page.waitForTimeout(250);
  const plainBar = (await barGroups(page)) || { titles: [], base: [], mods: [] };
  check('a roll with NO modifiers still explains its pool after rolling',
    { titles: plainBar.titles, baseRows: plainBar.base.length, modRows: plainBar.mods.length },
    { titles: ['Pool'], baseRows: 2, modRows: 0 });
  check('and those rows reconcile with the pool that was rolled',
    sumRows(plainBar.base), { rolled: 5, kept: 3 });
  await clickIfPresent(page, '#rollCloseBtn');
  await page.waitForTimeout(150);

  // =========================================================================
  // 14. THE SHARED RENDERER ACTUALLY TOOK EFFECT. The trunk's bar used to keep
  //     a verbatim copy of Phase 3's buildRollModifierRows(). It now calls the
  //     shared one, so the modifier rows in the result must equal, row for
  //     row, what the preview painted for the same roll -- and both must equal
  //     what the shared renderer returns when asked directly.
  // =========================================================================
  await page.evaluate(() => {
    document.getElementById('f_woundsTaken').value = 12;
    window.__L5R_TEST__.recalcAll();
  });
  await page.waitForTimeout(120);
  await startRoll(page, 'Wounded Casting Roll', 'SPELL',
    { element:'Water', ringValue:3, schoolRank:4, schoolRankBase:3 }, 7, 3);
  const previewBase = await paintedRows(page, '#rollPreviewOverlay .rp-base .rp-baserow');
  const previewMods = await paintedRows(page, '#rollPreviewOverlay .rp-mods .rp-mod');
  await clickIfPresent(page, '#rollPreviewGo');
  await page.waitForTimeout(300);
  const woundedBar = (await barGroups(page)) || { titles: [], base: [], mods: [] };

  check('the result bar shows both groups, pool first',
    woundedBar.titles, ['Pool', 'Roll modifiers']);
  check('the base rows are identical in the preview and in the result',
    woundedBar.base, previewBase);
  check('the modifier rows are identical in the preview and in the result',
    woundedBar.mods.map(r => r.label), previewMods.map(r => r.label));

  // Asked directly: the shared renderer's own output, versus what the trunk painted.
  // Phase 3 owns the shared renderer, so this comparison only means anything when it is
  // present. Against a build without it the trunk is meant to fall back to its own copy, which
  // is checked instead: the bar must still itemise the modifier rather than losing it.
  const sharedAvailable = await page.evaluate(() =>
    typeof window.__L5R_TEST__.buildRollModifierRows === 'function');
  if (sharedAvailable) {
    const shared = await page.evaluate(() => {
      const T = window.__L5R_TEST__;
      const ctx = T.makeRollContext(T.ROLL_KINDS.SPELL, { element:'Water' });
      const mods = T.getPreRollModifiers(ctx);
      return T.buildRollModifierRows(T.applyPreRollModifiers(7, 3, mods), 0).map(r => r.label);
    });
    check('and both match Phase 3\'s shared renderer asked directly — one renderer, not two copies',
      woundedBar.mods.map(r => r.label), shared);
  } else {
    check('without Phase 3 the trunk falls back to its own copy and still itemises the modifier',
      woundedBar.mods.map(r => r.label), ['Wound Penalty']);
  }

  // =========================================================================
  // 15. The wound penalty is a total modifier, so the pool rows must NOT
  //     absorb it: the base group still reconciles to the unmodified pool.
  // =========================================================================
  check('a total-only modifier does not disturb the pool rows',
    sumRows(woundedBar.base), { rolled: 7, kept: 3 });

  // =========================================================================
  // 16. The kill-switch is exported and honest.
  // =========================================================================
  check('the phase exports its kill-switch as enabled',
    await page.evaluate(() => window.__L5R_TEST__.ROLL_BREAKDOWN_ENABLED), true);

  if (pageErrors.length) {
    record('no uncaught page errors', false, pageErrors.join(' | '));
  } else {
    record('no uncaught page errors', true);
  }

  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  await browser.close();
  process.exit(passed === results.length ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
