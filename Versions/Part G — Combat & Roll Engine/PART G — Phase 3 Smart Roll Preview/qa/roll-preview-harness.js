/* =============================================================================
   PART G PHASE 3 — SMART ROLL PREVIEW — AUTOMATED CHECKS

     NODE_PATH=$(npm root -g) node qa/roll-preview-harness.js <built-sheet.html>

   WHAT THIS PHASE ACTUALLY CHANGED. The pipeline's two calculating steps
   (getPreRollModifiers, applyPreRollModifiers) were already pure and already
   separated from the throw — Phase 1.5 established that. This phase inserts a
   confirmation gate between them and rollDicePool(), and lets the player arm a
   one-roll Void effect from inside that gate. So the checks below are mostly
   about the SEAM, not about arithmetic: does the gate show the pipeline's own
   numbers, does cancelling really cost nothing, does confirming roll exactly
   what was shown.

   THE ORACLE IS NOT THE PREVIEW. Every pool assertion recomputes the expected
   value by calling getPreRollModifiers()/applyPreRollModifiers() directly
   through window.__L5R_TEST__ — the pipeline's own functions, which this phase
   does not modify — and compares that against what the preview PAINTED. If the
   preview ever grew its own arithmetic and drifted, these would diverge. A
   check that read the pool out of the preview and compared it against itself
   would pass forever and prove nothing.

   THE ONE THIS HARNESS EXISTS TO CATCH. Arming a one-roll Void effect normally
   goes through spendVoid(), which DEDUCTS A VOID POINT and writes the
   once-per-Round ledger. If the preview armed effects that way, cancelling
   would silently cost the player a Void Point for a roll they never made.
   Checks 7–9 cover exactly that, and they fail against a build where the
   preview commits on toggle instead of on confirm — see the README for both
   numbers.

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

const previewOpen = (page) => page.evaluate(() =>
  document.getElementById('rollPreviewOverlay').style.display === 'flex');

// What the preview PAINTED, read out of the DOM.
const painted = (page) => page.evaluate(() => {
  const el = document.querySelector('#rollPreviewBody .rp-pool-final');
  const flat = document.querySelector('#rollPreviewBody .rp-pool-flat');
  const tn = document.querySelector('#rollPreviewBody .rp-tn b');
  const mods = Array.from(document.querySelectorAll('#rollPreviewBody .rp-mod'))
    .map(m => m.querySelector('.rp-mod-label').textContent);
  const voids = Array.from(document.querySelectorAll('#rollPreviewBody [data-void-key]'))
    .map(c => c.getAttribute('data-void-key'));
  return {
    pool: el ? el.textContent.trim() : null,
    flat: flat ? flat.textContent.trim() : null,
    tn: tn ? tn.textContent.trim() : null,
    mods, voids,
  };
});

// The independent oracle: the pipeline's own functions, which this phase does not touch.
const oracle = (page, kind, extra, baseRolled, baseKept) => page.evaluate(
  ([kind, extra, baseRolled, baseKept]) => {
    const T = window.__L5R_TEST__;
    const ctx = T.makeRollContext(kind, extra || {});
    const mods = T.getPreRollModifiers(ctx);
    const adj = T.applyPreRollModifiers(baseRolled, baseKept, mods);
    return { pool: adj.rolled + 'k' + adj.kept, totalDelta: adj.totalDelta,
             labels: mods.map(m => m.label) };
  }, [kind, extra, baseRolled, baseKept]);

const voidPoints = (page) => page.evaluate(() =>
  parseInt(document.getElementById('void_current').value || '0', 10));

const rollModalOpen = (page) => page.evaluate(() => {
  const o = document.getElementById('rollModalOverlay');
  return !!o && o.style.display === 'flex';
});

const closeRollModalIfOpen = async (page) => {
  await page.evaluate(() => {
    const o = document.getElementById('rollModalOverlay');
    if (o && o.style.display === 'flex' && typeof window.__L5R_TEST__.closeRollModal === 'function') {
      window.__L5R_TEST__.closeRollModal();
    }
  });
  await page.waitForTimeout(60);
};

// Click only if the element is actually there. With the kill-switch off no preview is ever
// built, and a harness that threw on the missing button could not report a number for that
// supported configuration at all -- it would just die. Missing element: the dependent checks
// below fail on their own terms instead.
const clickIfPresent = async (page, sel) => {
  const there = await page.evaluate((s) => !!document.querySelector(s), sel);
  if (there) await page.click(sel);
  return there;
};

// Fire a roll WITHOUT awaiting it — it parks on the preview until we answer.
const startSkillRoll = async (page, name, trait, rank) => {
  await page.evaluate(([n, t, r]) => { window.__L5R_TEST__.rollSkill(n, t, r); }, [name, trait, rank]);
  await page.waitForTimeout(140);
};

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('usage: roll-preview-harness.js <built-sheet.html>');
    process.exit(2);
  }

  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  await page.goto(pathToFileURL(path.resolve(file)).href);
  await page.waitForTimeout(400);

  // A character with Traits worth rolling and Void Points to spend.
  await page.evaluate(() => {
    document.getElementById('trait_agility').value = '3';
    document.getElementById('trait_agility').dispatchEvent(new Event('input', { bubbles: true }));
    document.getElementById('ring_void').value = '3';
    document.getElementById('void_current').value = '3';
    window.__L5R_TEST__.recalcAll();
  });
  await page.waitForTimeout(120);

  // =========================================================================
  // 1-3. The gate opens, and shows the pipeline's own pool.
  // =========================================================================
  await startSkillRoll(page, 'Kenjutsu', 'Agility', 2);
  check('a roll opens the preview instead of rolling immediately', await previewOpen(page), true);
  check('no dice were thrown while the preview is open', await rollModalOpen(page), false);

  let p = await painted(page);
  let o = await oracle(page, 'skill', { skillName: 'Kenjutsu', traitName: 'Agility', skillRank: 2 }, 5, 3);
  check('the previewed pool matches the pipeline\'s own projection (5k3, unmodified)',
    p.pool, o.pool);
  check('an unmodified roll lists no modifiers', p.mods.length, 0);
  check('a skill roll shows no TN — only spells carry one', p.tn, null);

  // =========================================================================
  // 4. Cancel throws nothing.
  // =========================================================================
  await clickIfPresent(page, '#rollPreviewCancel');
  await page.waitForTimeout(120);
  check('cancelling closes the preview without rolling',
    { preview: await previewOpen(page), rolled: await rollModalOpen(page) },
    { preview: false, rolled: false });

  // =========================================================================
  // 5-6. A real modifier reaches the preview, and matches the oracle.
  //      Wounds apply to every kind except Damage, so they need no combat setup.
  // =========================================================================
  await page.evaluate(() => {
    document.getElementById('f_woundsTaken').value = '12';
    window.__L5R_TEST__.recalcAll();
  });
  await page.waitForTimeout(120);
  await startSkillRoll(page, 'Kenjutsu', 'Agility', 2);
  p = await painted(page);
  o = await oracle(page, 'skill', { skillName: 'Kenjutsu', traitName: 'Agility', skillRank: 2 }, 5, 3);
  check('a wound penalty is listed in the preview', p.mods.length >= 1 ? true : false, true);
  check('the listed modifier labels match the pipeline\'s own', p.mods, o.labels);
  check('the flat penalty shown matches the pipeline\'s totalDelta',
    p.flat, (o.totalDelta >= 0 ? '+' : '') + o.totalDelta + ' to total');
  await clickIfPresent(page, '#rollPreviewCancel');
  await page.waitForTimeout(100);
  await page.evaluate(() => {
    document.getElementById('f_woundsTaken').value = '0';
    window.__L5R_TEST__.recalcAll();
  });
  await page.waitForTimeout(100);

  // =========================================================================
  // 7-9. THE ONES THIS HARNESS EXISTS FOR — Void is projected, not spent,
  //      until the roll is actually confirmed.
  // =========================================================================
  const before = await voidPoints(page);
  await startSkillRoll(page, 'Kenjutsu', 'Agility', 2);
  p = await painted(page);
  check('the preview offers a one-roll Void spend when points are available',
    p.voids.includes('k1'), true);

  await clickIfPresent(page, '#rollPreviewBody [data-void-key="k1"]');
  await page.waitForTimeout(120);
  p = await painted(page);
  check('ticking +1k1 updates the projected pool live (5k3 -> 6k4)', p.pool, '6k4');
  check('ticking a Void option spends NOTHING while the preview is open',
    await voidPoints(page), before);

  await clickIfPresent(page, '#rollPreviewCancel');
  await page.waitForTimeout(140);
  check('cancelling after ticking Void refunds nothing because nothing was spent',
    await voidPoints(page), before);
  const pendingAfterCancel = await page.evaluate(() =>
    JSON.stringify(window.__L5R_TEST__.getVoidPending() || {}));
  check('cancelling leaves no Void effect armed for the next roll', pendingAfterCancel, '{}');

  // =========================================================================
  // 10-12. Confirming rolls exactly what was previewed, and spends the point.
  // =========================================================================
  await startSkillRoll(page, 'Kenjutsu', 'Agility', 2);
  await clickIfPresent(page, '#rollPreviewBody [data-void-key="k1"]');
  await page.waitForTimeout(120);
  const promised = (await painted(page)).pool;
  await clickIfPresent(page, '#rollPreviewGo');
  await page.waitForTimeout(260);
  check('confirming closes the preview and throws the dice',
    { preview: await previewOpen(page), rolled: await rollModalOpen(page) },
    { preview: false, rolled: true });
  const thrown = await page.evaluate(() =>
    document.querySelectorAll('#rollDiceRow .roll-die').length);
  check('the number of dice actually thrown matches the pool the preview promised',
    thrown, promised ? parseInt(promised.split('k')[0], 10) : 'a preview that never opened promised nothing');
  check('confirming a Void spend deducts exactly one point', await voidPoints(page), before - 1);
  await closeRollModalIfOpen(page);

  // =========================================================================
  // 13. A spell roll carries its TN into the preview — the one kind that can.
  // =========================================================================
  await page.evaluate(() => {
    window.__L5R_TEST__.rollWithModifiers(
      'Test Spell — Casting Roll',
      window.__L5R_TEST__.makeRollContext('spell', { spellName: 'Test', element: 'Air' }),
      4, 2, { tnConfig: { tn: 20 } });
  });
  await page.waitForTimeout(160);
  check('a spell roll shows its Target Number in the preview', (await painted(page)).tn, '20');
  await clickIfPresent(page, '#rollPreviewCancel');
  await page.waitForTimeout(100);

  // =========================================================================
  // 14. Damage rolls deliberately bypass the preview — they never enter the
  //     pipeline at all (Phase 1.5: "Damage rolls take a different path").
  // =========================================================================
  await page.evaluate(() => {
    window.__L5R_TEST__.rollNotation('Test — Damage', '3k2');
  });
  await page.waitForTimeout(160);
  const notationPreviewed = await previewOpen(page);
  await page.evaluate(() => {
    const o = document.getElementById('rollPreviewOverlay');
    if (o && o.style.display === 'flex') document.getElementById('rollPreviewCancel').click();
  });
  await page.waitForTimeout(100);
  record('a manual-notation roll DOES go through the preview (it is a pipeline roll)',
    notationPreviewed === true, String(notationPreviewed));

  // =========================================================================
  // 15. The kill-switch and the seam are both present and honest.
  // =========================================================================
  check('the phase exports its kill-switch as enabled',
    await page.evaluate(() => window.__L5R_TEST__.ROLL_PREVIEW_ENABLED), true);

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
