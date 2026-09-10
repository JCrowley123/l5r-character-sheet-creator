/* =============================================================================
   PART H PHASE 2 — QUICK-ACCESS SIDEBAR — AUTOMATED CHECKS

     NODE_PATH=$(npm root -g) node qa/quick-access-sidebar-harness.js <built-sheet.html>

   THE BUG THIS HARNESS EXISTS TO CATCH. The panel's own render function,
   renderQuickAccessPanel(), was originally wired only into the tail of recalcAll(). That
   looked complete -- every value it mirrors is computed somewhere inside recalcAll() -- but
   four of the sheet's own controls mutate that same state through their OWN narrower render
   function instead, deliberately bypassing recalcAll() entirely (each has its own comment
   explaining why): the Void pips call renderVoidPips() directly, the wound stepper/slider call
   renderWounds() directly, and both the Cast-spell button and a manual base-slot pip click call
   renderSpellPips() directly, while a bonus-slot pip click calls renderSpellBonusPips()
   directly. Wired only to recalcAll(), the panel would sit there showing a stale number the
   instant any of those was used while it was open -- silently failing the roadmap's own
   validation criterion, "updates instantly when values change," on the interactions someone
   glancing at an OPEN panel is most likely to be mid-way through. This was caught by
   measurement, not assumption: an early draft of this fix passed every check below except the
   checks that exercise these paths, which is exactly the class of gap CLAUDE.md's "a harness
   must be able to fail" principle asks a new harness to prove it can still catch. See this
   phase's own README for the full writeup and the before/after numbers.

   THE BONUS LINE. A real-device tester noticed the Spell Slots row never showed the shared
   bonus-slot pool (Void Rank-sized, spent by any element once its own base slots run out) --
   the first version omitted it by design, on the reasoning that a total merging bonus into the
   per-element numbers would be worse than no bonus line at all. It was never actually necessary
   to omit it: shown as its OWN separate line rather than merged, the ambiguity that reasoning
   was avoiding doesn't arise. Checks 7b and 9 below cover this line the same way as everything
   else -- an independent oracle, and a real control interaction with the panel already open.

   Checks 5-7 and 9 below are the ones that exercise the live-update gap: each performs a REAL
   control interaction (a real pip click, a real stepper click, the real spell-render function
   the Cast button calls) while the panel is already open -- never closing and reopening it,
   which would trivially "fix" the picture regardless of the bug, since openQuickAccessPanel()
   always calls renderQuickAccessPanel() itself. Each is checked against an oracle this file
   does not own: the real #void_current/#ring_void values, the real #woundSummaryLine text, the
   real #ring_<key>/#spell_used_<key>/#spell_bonus_used_shared values -- never the panel's own
   rendered text compared to itself, and never a value computed by calling the very function
   under test.

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
  record(name, pass, pass ? String(actual) : `got=${JSON.stringify(actual)} want=${JSON.stringify(expected)}`);
};

// Independent oracle for the Spell Slots row: reads the same five raw elements the sheet
// itself treats as authoritative, formats them the same way the panel's own header comment
// documents -- but never calls renderQuickAccessPanel() or any function defined in the
// fragment under test.
const SPELL_ELEMENTS = [
  { key: 'air', name: 'Air' }, { key: 'earth', name: 'Earth' }, { key: 'fire', name: 'Fire' },
  { key: 'water', name: 'Water' }, { key: 'void', name: 'Void' },
];
const expectedSpellSlotsText = (page) => page.evaluate((elements) => {
  return elements.map(el => {
    const rank = Math.max(0, parseInt(document.getElementById('ring_' + el.key).value || '0', 10));
    const used = Math.max(0, Math.min(rank, parseInt(document.getElementById('spell_used_' + el.key).value || '0', 10)));
    return `${el.name} ${rank - used}/${rank}`;
  }).join(' · ');
}, SPELL_ELEMENTS);

// Independent oracle for the Bonus line: reads #ring_void/#spell_bonus_used_shared directly,
// the same shared-pool source renderSpellBonusPips() itself reads — never a value computed by
// calling the function under test.
const expectedBonusText = (page) => page.evaluate(() => {
  const rank = Math.max(0, Math.min(10, parseInt(document.getElementById('ring_void').value || '0', 10)));
  const used = Math.max(0, Math.min(rank, parseInt(document.getElementById('spell_bonus_used_shared').value || '0', 10)));
  return `Bonus (shared): ${rank - used}/${rank}`;
});

const panelSnapshot = (page) => page.evaluate(() => ({
  hidden: document.getElementById('quickAccessPanel').hidden,
  ariaExpanded: document.getElementById('quickAccessToggleBtn').getAttribute('aria-expanded'),
  voidValue: document.getElementById('qaVoidValue').textContent,
  filledPips: document.querySelectorAll('#qaVoidPips .qa-pip.filled').length,
  totalPips: document.querySelectorAll('#qaVoidPips .qa-pip').length,
  spellRowHidden: document.getElementById('qaSpellSlotsRow').hidden,
  spellValue: document.getElementById('qaSpellSlotsValue').textContent,
  bonusValue: document.getElementById('qaSpellBonusValue').textContent,
  woundsValue: document.getElementById('qaWoundsValue').textContent,
  armorTN: document.getElementById('qaArmorTNValue').textContent,
  initiative: document.getElementById('qaInitiativeValue').textContent,
}));

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('usage: quick-access-sidebar-harness.js <built-sheet.html>');
    process.exit(2);
  }

  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  await page.goto(pathToFileURL(path.resolve(file)).href);
  await page.waitForTimeout(300);

  // =========================================================================
  // 1. Closed by default; toggle button present with correct ARIA wiring.
  // =========================================================================
  const initial = await panelSnapshot(page);
  check('panel starts hidden, toggle starts aria-expanded=false',
    { hidden: initial.hidden, ariaExpanded: initial.ariaExpanded },
    { hidden: true, ariaExpanded: 'false' });

  // =========================================================================
  // 2. Opening renders correct initial values for a fresh, non-caster character,
  //    checked against the real source elements — not against a fixed expectation.
  // =========================================================================
  await page.evaluate(() => document.getElementById('quickAccessToggleBtn').click());
  await page.waitForTimeout(50);

  const oracle1 = await page.evaluate(() => ({
    voidCurrent: parseInt(document.getElementById('void_current').value || '0', 10),
    voidRank: parseInt(document.getElementById('ring_void').value || '0', 10),
    woundSummary: document.getElementById('woundSummaryLine').textContent,
    armorTN: document.getElementById('f_currentTN').value,
    initiative: document.getElementById('f_initiative').value,
    isCaster: window.__L5R_TEST__.characterCasterLock() === 'shugenja',
  }));
  const afterOpen = await panelSnapshot(page);
  check('opening the panel shows aria-expanded=true and is no longer hidden',
    { hidden: afterOpen.hidden, ariaExpanded: afterOpen.ariaExpanded },
    { hidden: false, ariaExpanded: 'true' });
  check('Void value and pip count match #void_current/#ring_void on open',
    { text: afterOpen.voidValue, filled: afterOpen.filledPips, total: afterOpen.totalPips },
    { text: `${oracle1.voidCurrent} / ${oracle1.voidRank}`, filled: oracle1.voidCurrent, total: oracle1.voidRank });
  check('Spell Slots row hidden for a non-caster character',
    afterOpen.spellRowHidden, !oracle1.isCaster);
  check('Wounds value matches #woundSummaryLine verbatim on open',
    afterOpen.woundsValue, oracle1.woundSummary);
  check('Armor TN matches #f_currentTN on open', afterOpen.armorTN, oracle1.armorTN);
  check('Initiative matches #f_initiative on open', afterOpen.initiative, oracle1.initiative);

  // =========================================================================
  // 3. Close button closes it.
  // =========================================================================
  await page.evaluate(() => document.getElementById('quickAccessCloseBtn').click());
  await page.waitForTimeout(50);
  const afterClose = await panelSnapshot(page);
  check('close button hides the panel and resets aria-expanded',
    { hidden: afterClose.hidden, ariaExpanded: afterClose.ariaExpanded },
    { hidden: true, ariaExpanded: 'false' });

  // =========================================================================
  // 4. Click-outside and Escape both close an open panel.
  // =========================================================================
  await page.evaluate(() => document.getElementById('quickAccessToggleBtn').click());
  await page.waitForTimeout(50);
  await page.evaluate(() => document.getElementById('headerName').click());
  await page.waitForTimeout(50);
  record('clicking outside the panel closes it', (await panelSnapshot(page)).hidden === true);

  await page.evaluate(() => document.getElementById('quickAccessToggleBtn').click());
  await page.waitForTimeout(50);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(50);
  record('Escape closes an open panel', (await panelSnapshot(page)).hidden === true);

  // =========================================================================
  // 5. THE GAP THIS PHASE ALMOST SHIPPED WITH — Void. A real pip click calls
  //    renderVoidPips() directly, never recalcAll(). Checked with the panel already open,
  //    never re-opened, against the real #void_current value.
  // =========================================================================
  await page.evaluate(() => document.getElementById('quickAccessToggleBtn').click());
  await page.waitForTimeout(50);
  const beforeSpend = await panelSnapshot(page);
  await page.evaluate(() => document.querySelector('#voidPips .void-pip').click());
  await page.waitForTimeout(50);
  const afterSpend = await panelSnapshot(page);
  const voidCurrentNow = await page.evaluate(() => document.getElementById('void_current').value);
  check('spending a Void point (real pip click) updates the OPEN panel instantly',
    { changed: afterSpend.voidValue !== beforeSpend.voidValue, now: afterSpend.voidValue },
    { changed: true, now: `${voidCurrentNow} / ${oracle1.voidRank}` });

  // =========================================================================
  // 6. THE SAME GAP — Wounds/Armor TN/Initiative. The wound stepper calls renderWounds()
  //    directly, never recalcAll(). Checked with the panel already open.
  // =========================================================================
  const beforeWound = await panelSnapshot(page);
  await page.evaluate(() => document.getElementById('woundStepUp').click());
  await page.waitForTimeout(50);
  const afterWound = await panelSnapshot(page);
  const woundSummaryNow = await page.evaluate(() => document.getElementById('woundSummaryLine').textContent);
  check('taking a wound (real stepper click) updates the OPEN panel instantly',
    { changed: afterWound.woundsValue !== beforeWound.woundsValue, now: afterWound.woundsValue },
    { changed: true, now: woundSummaryNow });

  // =========================================================================
  // 7. THE SAME GAP — Spell Slots. The Cast-spell button calls renderSpellPips() per
  //    element directly, never recalcAll(). Simulated here via the exact function that
  //    path calls (renderAllSpellSlots(), exposed on the test seam for this purpose —
  //    see 210-test-seam-and-init.js), applied to a caster character, panel already open.
  // =========================================================================
  await page.evaluate(() => { document.getElementById('f_school').value = 'Asahina Shugenja'; window.__L5R_TEST__.recalcAll(); });
  await page.waitForTimeout(50);
  const casterOpen = await panelSnapshot(page);
  check('Spell Slots row appears once the panel next renders for a caster',
    casterOpen.spellRowHidden, false);
  check('Spell Slots value matches the independent oracle for a caster',
    casterOpen.spellValue, await expectedSpellSlotsText(page));

  // ---- 7b. The Bonus line (a real-device tester's own finding — see this phase's README) ----
  check('Bonus (shared) value matches the independent oracle for a caster',
    casterOpen.bonusValue, await expectedBonusText(page));

  const beforeCast = await panelSnapshot(page);
  await page.evaluate(() => {
    const used = document.getElementById('spell_used_air');
    used.value = parseInt(used.value || '0', 10) + 1;
    window.__L5R_TEST__.renderAllSpellSlots();
  });
  await page.waitForTimeout(50);
  const afterCast = await panelSnapshot(page);
  check('casting a spell (renderAllSpellSlots(), the Cast button\'s own render path) updates the OPEN panel instantly',
    { changed: afterCast.spellValue !== beforeCast.spellValue, now: afterCast.spellValue },
    { changed: true, now: await expectedSpellSlotsText(page) });

  // =========================================================================
  // 8. THE SAME GAP — the Bonus line specifically. A bonus-slot pip click calls
  //    renderSpellBonusPips() directly (080-identity-build-ui.js), never recalcAll(). Uses a
  //    real click on the real bonus pip strip, panel already open, checked against the
  //    independent shared-pool oracle.
  // =========================================================================
  const beforeBonus = await panelSnapshot(page);
  await page.evaluate(() => document.querySelector('.spell-bonus-pip').click());
  await page.waitForTimeout(50);
  const afterBonus = await panelSnapshot(page);
  check('spending a bonus slot (real bonus-pip click) updates the OPEN panel instantly',
    { changed: afterBonus.bonusValue !== beforeBonus.bonusValue, now: afterBonus.bonusValue },
    { changed: true, now: await expectedBonusText(page) });

  // =========================================================================
  // 9. Read-only by design: the pip mirrors are plain <span> elements, not buttons —
  //    clicking one must never mutate Void state. Guards the design decision documented
  //    in this fragment's own header comment against a future accidental regression.
  // =========================================================================
  const voidBeforeStrayClick = await page.evaluate(() => document.getElementById('void_current').value);
  await page.evaluate(() => document.querySelector('#qaVoidPips .qa-pip').click());
  await page.waitForTimeout(50);
  const voidAfterStrayClick = await page.evaluate(() => document.getElementById('void_current').value);
  check('clicking a Quick Access void pip does not spend Void (read-only mirror)',
    voidAfterStrayClick, voidBeforeStrayClick);

  if (pageErrors.length) {
    record('no uncaught page errors', false, pageErrors.join(' | '));
  } else {
    record('no uncaught page errors', true);
  }

  const pass = results.filter((r) => r.pass).length;
  console.log(`\n${pass}/${results.length} checks passed`);

  await browser.close();
  process.exit(pass === results.length ? 0 : 1);
}

main();
