/*
 * BUGFIX — Negative Roll Modifier Display — browser validation.
 *
 * Run: node negative-roll-modifier-harness.js <sheet.html>
 *
 * WHAT IS UNDER TEST, and why the checks are shaped the way they are.
 *
 * A negative flat total modifier was printed with a hardcoded "+": the roll modal's keep-note
 * read "Keeping 3 of 5 (suggested 3) + -40 bonus" on a wounded character. The arithmetic was
 * never wrong — the displayed total already included the -40 correctly — so, exactly as with the
 * mastery-label fix, the risk is not that the new strings are wrong but that something ELSE moved.
 *
 * THE ORACLE IS A REAL ROLL, NOT THE HELPERS. Both pure helpers are exported and unit-checked
 * (NEGMOD-PURE-*), but a helper that is correct and never reached would satisfy a check that only
 * asked the helper — the failure mode Part H Phase 1 shipped once. Every string check below drives
 * a REAL roll through rollWithModifiers(), confirms Phase 3's preview gate, and reads what is on
 * screen.
 *
 * WHY WOUNDS RATHER THAN A DISADVANTAGE. Wound penalties are trunk code (Part C, Feature 3) and
 * predate every 4.5.x entry, so the negative modifier here is reached with no configured entry at
 * all. That is also how the defect was confirmed PRE-EXISTING rather than Feature 4.5.9's.
 *
 * THE MIXED CASE IS THE INTERESTING ONE. `result.bonus` sums the Ten Dice Rule's conversion bonus
 * (always >= 0) and the pipeline's totalDelta (negative here), so `woundedPositive` produces a
 * genuine +12 Ten Dice bonus netted against a -40 wound penalty = -28. Measured, not constructed:
 * it is what a 14k12 roll on a 40-wound character actually does.
 *
 * roll-modal-strings-baseline.json is recorded from the PRE-FIX build (6722adcb). Only the
 * deterministic strings are baselined — the notation depends on the pool alone and the keep-note
 * on dice COUNTS alone, so both reproduce exactly across runs. Totals depend on the dice and are
 * checked by reconciliation instead (NEGMOD-ARITH-01).
 *
 * The input build is never modified.
 */
'use strict';
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const { pathToFileURL } = require('url');

const MINUS = '−';   // U+2212 MINUS SIGN — NOT a hyphen. NEGMOD-PURE-03 exists for this.

const results = [];
function record(id, name, pass, detail = '') {
  results.push({ id, name, pass: !!pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id} ${name}${detail ? ' — ' + detail : ''}`);
}
function equal(id, name, actual, expected) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  record(id, name, pass, pass ? '' : `actual=${JSON.stringify(actual)} expected=${JSON.stringify(expected)}`);
}
function truthy(id, name, value, detail) {
  record(id, name, !!value, value ? (detail || '') : `got ${JSON.stringify(value)}`);
}
async function section(id, name, fn) {
  try { await fn(); } catch (e) { record(id, name, false, String(e.stack || e)); }
}

async function capture(page, c) {
  await page.evaluate(w => {
    const T = window.__L5R_TEST__;
    const el = document.getElementById('f_woundsTaken');
    el.value = String(w);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    if (typeof T.recalcAll === 'function') T.recalcAll();
  }, c.wounds);
  const done = page.evaluate(([n, k]) => {
    const T = window.__L5R_TEST__;
    return T.rollWithModifiers('negmod harness roll',
      T.makeRollContext(T.ROLL_KINDS.SKILL, { skillName: 'Kenjutsu' }), n, k);
  }, [c.num, c.keep]);
  // Phase 3's confirm button is built at runtime; the roll only happens once it is clicked.
  const go = await page.waitForSelector('#rollPreviewGo', { state: 'visible', timeout: 6000 }).catch(() => null);
  if (go) await go.click();
  await done;
  await page.waitForSelector('#rollTotalDisplay', { state: 'attached', timeout: 6000 });
  const out = await page.evaluate(() => {
    // A kept die's VALUE is dataset.total, not its text — an exploded die shows its chain but
    // totals the sum. This is the same arithmetic updateRollKeepState() does.
    const kept = Array.from(document.querySelectorAll('#rollDiceRow .roll-die.kept'))
      .reduce((s, d) => s + (parseInt(d.dataset.total, 10) || 0), 0);
    return {
      notation: (document.getElementById('rollModalNotation') || {}).textContent || null,
      keepNote: (document.getElementById('rollKeepNote') || {}).textContent || null,
      keptSum: kept,
      shownTotal: parseInt((document.getElementById('rollTotalDisplay') || {}).textContent, 10),
      tenDiceNote: Array.from(document.querySelectorAll('#rollModalBody .roll-note'))
        .filter(e => /^Ten Dice Rule bonus:/.test((e.textContent || '').trim()))
        .map(e => ({ text: (e.textContent || '').trim(), hidden: e.style.display === 'none' }))[0] || null,
    };
  });
  await page.evaluate(() => {
    const ov = document.getElementById('rollModalOverlay');
    if (ov) ov.style.display = 'none';
  });
  return out;
}

(async () => {
  const sheetArg = process.argv.slice(2).find(a => !a.startsWith('--'));
  if (!sheetArg) { console.error('usage: node negative-roll-modifier-harness.js <sheet.html>'); process.exit(2); }
  const sheet = path.resolve(sheetArg);
  const baseline = JSON.parse(fs.readFileSync(path.join(__dirname, 'roll-modal-strings-baseline.json'), 'utf8'));

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(pathToFileURL(sheet).href);
  await page.waitForFunction(() => !!window.__L5R_TEST__);

  const live = {};
  for (const c of baseline.cases) live[c.id] = await capture(page, c);

  // ---------- the reported defect ----------
  await section('NEGMOD-KEEP-01', 'the reported case', async () => {
    equal('NEGMOD-KEEP-01', 'a negative modifier reads as a penalty, not as "+ -40 bonus"',
      live.wounded.keepNote, `Keeping 3 of 5 (suggested 3) ${MINUS} 40 penalty`);
  });

  await section('NEGMOD-NOTE-01', 'the site the report did not mention', async () => {
    // Found by measuring rather than from the report: the NOTATION line printed "10k5 +-40".
    equal('NEGMOD-NOTE-01', 'the notation line signs the modifier instead of prefixing "+"',
      live.woundedTenDice.notation, `12k4 → 10k5 ${MINUS}40 (Ten Dice Rule)`);
  });

  await section('NEGMOD-MIX-01', 'a real bonus outweighed by a real penalty', async () => {
    // +12 of genuine Ten Dice Rule bonus against -40 of wounds = -28 net. The word has to follow
    // the NET, not whichever part came first.
    truthy('NEGMOD-MIX-01', 'a net-negative mix of a Ten Dice bonus and a wound penalty reads as a penalty',
      live.woundedPositive.keepNote === `Keeping 10 of 10 (suggested 10) ${MINUS} 28 penalty` &&
      live.woundedPositive.notation === `14k12 → 10k10 ${MINUS}28 (Ten Dice Rule)`,
      `${live.woundedPositive.keepNote} | ${live.woundedPositive.notation}`);
  });

  // ---------- nothing else moved ----------
  await section('NEGMOD-SCOPE-01', 'every positive case is byte-identical to the pre-fix build', async () => {
    const drift = [];
    ['clean', 'tenDice', 'positiveBonus'].forEach(id => {
      if (live[id].notation !== baseline.rows[id].notation) drift.push(`${id}.notation`);
      if (live[id].keepNote !== baseline.rows[id].keepNote) drift.push(`${id}.keepNote`);
    });
    equal('NEGMOD-SCOPE-01', 'no string changed where the modifier is absent or positive', drift, []);
  });

  await section('NEGMOD-SCOPE-02', 'exactly the negative cases changed, and only their modifier part', async () => {
    // The part of each string BEFORE the modifier must be untouched. Splitting on the modifier
    // is what separates "relabelled" from "rewrote the sentence".
    const bad = [];
    ['wounded', 'woundedTenDice', 'woundedPositive'].forEach(id => {
      const before = baseline.rows[id];
      const after = live[id];
      if (after.keepNote === before.keepNote) bad.push(`${id}.keepNote did not change at all`);
      if (before.keepNote.split(' + ')[0] !== after.keepNote.split(` ${MINUS} `)[0]) bad.push(`${id}.keepNote prefix moved`);
      if (before.notation.split(' +')[0] !== after.notation.split(` ${MINUS}`)[0]) bad.push(`${id}.notation prefix moved`);
    });
    equal('NEGMOD-SCOPE-02', 'only the modifier itself was reworded in the negative cases', bad, []);
  });

  await section('NEGMOD-ARITH-01', 'the numbers did not move', async () => {
    // The whole claim of this fix is that only a label changed. The displayed total must still
    // reconcile against the kept dice in every case, negative ones included.
    const bad = baseline.cases.map(c => c.id).filter(id => {
      const r = live[id];
      const mod = r.shownTotal - r.keptSum;
      const expected = { clean: 0, tenDice: 0, positiveBonus: 12, wounded: -40, woundedTenDice: -40, woundedPositive: -28 }[id];
      return mod !== expected;
    });
    equal('NEGMOD-ARITH-01', 'displayed total minus kept dice equals the modifier, in all six cases', bad, []);
  });

  // ---------- the site deliberately NOT fixed ----------
  await section('NEGMOD-HIDDEN-01', 'the third site stays hidden', async () => {
    // "Ten Dice Rule bonus: +-40" is still malformed and is deliberately left alone, because it
    // can ONLY be malformed when totalDelta is non-zero, which is exactly when
    // attachRollModifierBreakdown() hides it. This check is what makes that reasoning safe to
    // rely on: if a later phase ever unhides it, this goes red rather than the player finding out.
    const bad = ['wounded', 'woundedTenDice', 'woundedPositive']
      .filter(id => !live[id].tenDiceNote || live[id].tenDiceNote.hidden !== true);
    equal('NEGMOD-HIDDEN-01', 'the "Ten Dice Rule bonus" note is hidden in every negative case', bad, []);
  });

  await section('NEGMOD-HIDDEN-02', 'and is still shown, correctly, when it is genuinely a Ten Dice bonus', async () => {
    truthy('NEGMOD-HIDDEN-02', 'a real positive Ten Dice bonus still shows its note, unchanged',
      live.positiveBonus.tenDiceNote &&
      live.positiveBonus.tenDiceNote.hidden === false &&
      live.positiveBonus.tenDiceNote.text === baseline.rows.positiveBonus.tenDiceNote.text,
      JSON.stringify(live.positiveBonus.tenDiceNote));
  });

  // ---------- the pure helpers ----------
  const pure = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    return {
      signed: [T.signedRollMod(12), T.signedRollMod(-40), T.signedRollMod(0), T.signedRollMod(-1)],
      note: [T.rollTotalModNote(12), T.rollTotalModNote(-40), T.rollTotalModNote(-1)],
      flag: T.NEGATIVE_ROLL_MOD_DISPLAY_FIX_ENABLED,
      fns: ['signedRollMod', 'rollTotalModNote'].filter(k => typeof T[k] === 'function'),
      // Both helpers, and both RENDERED strings, so this names the cause wherever it slips in.
      codePoints: {
        note: T.rollTotalModNote(-40).charCodeAt(0),
        signed: T.signedRollMod(-40).charCodeAt(0),
      },
    };
  });

  await section('NEGMOD-PURE-01', 'the signed notation helper', async () => {
    equal('NEGMOD-PURE-01', 'signedRollMod: positive, negative, zero, minus one',
      pure.signed, ['+12', `${MINUS}40`, '+0', `${MINUS}1`]);
  });

  await section('NEGMOD-PURE-02', 'the keep-note helper', async () => {
    equal('NEGMOD-PURE-02', 'rollTotalModNote: bonus stays "bonus", negative becomes "penalty"',
      pure.note, ['+ 12 bonus', `${MINUS} 40 penalty`, `${MINUS} 1 penalty`]);
  });

  await section('NEGMOD-PURE-03', 'the character is a real minus sign', async () => {
    // A hyphen-minus looks almost identical in a diff and in most fonts, and would quietly undo
    // the half of this fix that makes the number read as a number rather than as "+ -40".
    //
    // DECLARED HONESTLY: this check CANNOT go red on its own. Both helpers' output is compared
    // in full by PURE-01 and PURE-02, so any wrong character reds one of those too. It is kept
    // because it is the check whose FAILURE MESSAGE names the cause — "charCodeAt = 45" rather
    // than a two-string diff whose difference is invisible. Same shape as Feature 4.5.12's
    // traitName guard, which protects two things and was reported as protecting two things.
    truthy('NEGMOD-PURE-03', 'both helpers use U+2212 MINUS SIGN, not U+002D HYPHEN-MINUS',
      pure.codePoints.note === 0x2212 && pure.codePoints.signed === 0x2212,
      `rollTotalModNote=${pure.codePoints.note}, signedRollMod=${pure.codePoints.signed} (8722 expected)`);
  });

  await section('NEGMOD-SEAM-01', 'the seam exports', async () => {
    truthy('NEGMOD-SEAM-01', 'kill-switch and both helpers are exported',
      pure.flag === true && pure.fns.length === 2, `flag=${pure.flag} fns=${pure.fns.length}`);
  });

  await browser.close();

  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  console.log('NEGATIVE_ROLL_MOD_RESULT=' + JSON.stringify({ sheet, passed, total: results.length }));
  process.exitCode = passed === results.length ? 0 : 1;
})();
