/*
 * Phase 4.5.7 Unlucky — browser validation.
 *
 * Run: node disadv-unlucky-harness.js <sheet.html>
 *
 * The reroll checks drive REAL dice. "Keep the second result even when it is higher" cannot be
 * proven by a single roll, because whether the reroll comes out higher is chance — so the check
 * invokes many times over a large pool and asserts the displayed total equals the REROLL on every
 * single one, then separately asserts that at least one of those rerolls actually came out higher
 * so the interesting branch was genuinely exercised rather than never reached.
 *
 * Nothing here stubs the dice. A stubbed reroll would only prove this module agrees with the stub.
 *
 * The input build is never modified.
 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const { pathToFileURL } = require('url');

const PHONE = { width: 375, height: 812 };
const results = [];
const canonical = v => Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object'
  ? Object.keys(v).sort().reduce((o, k) => { o[k] = canonical(v[k]); return o; }, {}) : v;
function record(id, name, pass, detail = '') {
  results.push({ id, name, pass: !!pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id} ${name}${detail ? ' — ' + detail : ''}`);
}
function equal(id, name, actual, expected) {
  const pass = JSON.stringify(canonical(actual)) === JSON.stringify(canonical(expected));
  record(id, name, pass, pass ? '' : `actual=${JSON.stringify(actual)} expected=${JSON.stringify(expected)}`);
}
async function section(id, name, fn) {
  try { await fn(); } catch (e) { record(id, name, false, String(e.stack || e)); }
}

const reset = page => page.evaluate(() => {
  const T = window.__L5R_TEST__;
  if (T.D45 && T.D45.gates) T.D45.gates.cancel();
  T.resetToBaseline(); T.recalcAll();
  ['advConfigModalOverlay', 'rollPreviewOverlay', 'rollModalOverlay', 'appConfirmOverlay']
    .forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
});

async function configureUnlucky(page, rank) {
  await page.evaluate(() => {
    const sel = document.getElementById('disadvQuickAdd');
    sel.value = 'Unlucky';
    sel.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForSelector('#advConfigGrid input[type=number]', { state: 'attached', timeout: 4000 });
  await page.evaluate(value => {
    const input = document.querySelector('#advConfigGrid input[type=number]');
    input.value = String(value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, rank);
  await page.click('#advConfigConfirm');
  await page.waitForTimeout(200);
}

const rowState = page => page.evaluate(() => {
  const row = document.querySelector('#disadvList .entry');
  if (!row) return null;
  const buttons = Array.from(row.querySelectorAll('.unlucky-btn'));
  return {
    cost: row.querySelector('.en-cost') ? row.querySelector('.en-cost').value : null,
    pips: row.querySelector('.unlucky-pips') ? row.querySelector('.unlucky-pips').textContent : null,
    summary: row.querySelector('.d45-summary') ? row.querySelector('.d45-summary').textContent : null,
    buttons: buttons.map(b => ({ label: b.textContent, disabled: b.disabled })),
  };
});

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error('usage: node disadv-unlucky-harness.js <sheet.html>');
  const browser = await chromium.launch(process.env.L5R_CHROME ? { executablePath: process.env.L5R_CHROME } : {});
  try {
    const page = await browser.newPage({ viewport: PHONE });
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('dialog', d => d.accept());
    await page.goto(pathToFileURL(path.resolve(file)).href);
    await page.waitForFunction(() => window.__L5R_TEST__ && typeof window.__L5R_TEST__.recalcAll === 'function');
    const registryBefore = await page.evaluate(() =>
      window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.map(m => [m.id, m.priority]));

    // ============ Pricing, and the two numbers that are easy to conflate ============

    await section('UNLUCKY457-PRICE', 'Two XP per rank, one use per rank', async () => {
      await reset(page);
      await configureUnlucky(page, 1);
      let state = await rowState(page);
      equal('UNLUCKY457-PRICE-01', 'Rank 1 awards 2 XP', state.cost, '2');
      equal('UNLUCKY457-PRICE-02', '…and gives one use, shown as 1/1', state.pips, '● 1/1');

      await reset(page);
      await configureUnlucky(page, 5);
      state = await rowState(page);
      equal('UNLUCKY457-PRICE-03', 'Rank 5 awards 10 XP', state.cost, '10');
      // The audit calls this out specifically: the award and the resource both scale off rank but
      // are NOT the same number. Rank 5 is 10 XP and 5/5 uses, never 10/10.
      equal('UNLUCKY457-PRICE-04', '…and gives FIVE uses, not ten', state.pips, '●●●●● 5/5');

      await reset(page);
      await configureUnlucky(page, 10);
      state = await rowState(page);
      equal('UNLUCKY457-PRICE-05', 'Rank 10 awards 20 XP, so no rank cap was invented', state.cost, '20');
      record('UNLUCKY457-PRICE-06', 'The row says the second result is the one that stands',
        /keeping the second result/.test(state.summary || ''), state.summary);
    });

    // ============ The reroll ============

    await section('UNLUCKY457-REROLL', 'The second result stands, in all cases', async () => {
      await reset(page);
      await configureUnlucky(page, 20);
      const observed = await page.evaluate(() => {
        const T = window.__L5R_TEST__;
        const runs = [];
        for (let i = 0; i < 20; i++) {
          const rolled = T.rollDicePool(5, 3, true);
          T.showRollResult('Harness roll', rolled);
          const original = parseInt(document.getElementById('rollTotalDisplay').textContent, 10);
          const button = document.querySelector('.unlucky-invoke');
          if (!button || button.disabled) break;
          button.click();
          const outcome = document.querySelector('.unlucky-outcome').textContent;
          const shown = parseInt(document.getElementById('rollTotalDisplay').textContent, 10);
          const parsed = /original (\d+), reroll (\d+)/.exec(outcome);
          runs.push({
            original: original,
            statedOriginal: parsed ? Number(parsed[1]) : null,
            reroll: parsed ? Number(parsed[2]) : null,
            shown: shown,
          });
        }
        return runs;
      });
      record('UNLUCKY457-REROLL-01', 'Twenty real invocations were driven',
        observed.length === 20, `ran ${observed.length}`);
      const mismatched = observed.filter(r => r.shown !== r.reroll);
      equal('UNLUCKY457-REROLL-02', 'The displayed total is the REROLL every single time',
        mismatched, []);
      const higher = observed.filter(r => r.reroll > r.original);
      const lower = observed.filter(r => r.reroll < r.original);
      // Without this, REROLL-02 could pass having never once met the case the rule is about.
      record('UNLUCKY457-REROLL-03', 'At least one reroll came out HIGHER, so that branch was reached',
        higher.length > 0, `${higher.length} higher, ${lower.length} lower of ${observed.length}`);
      record('UNLUCKY457-REROLL-04', '…and the higher reroll was still the one kept',
        higher.length > 0 && higher.every(r => r.shown === r.reroll),
        JSON.stringify(higher.slice(0, 3)));
      record('UNLUCKY457-REROLL-05', 'At least one reroll came out lower, and was kept too',
        lower.length > 0 && lower.every(r => r.shown === r.reroll),
        JSON.stringify(lower.slice(0, 3)));
    });

    await section('UNLUCKY457-USES', 'One use is spent per invocation', async () => {
      await reset(page);
      await configureUnlucky(page, 3);
      const spent = await page.evaluate(() => {
        const T = window.__L5R_TEST__;
        const labels = [];
        for (let i = 0; i < 4; i++) {
          T.showRollResult('Harness roll', T.rollDicePool(4, 2, true));
          const button = document.querySelector('.unlucky-invoke');
          labels.push({ label: button.textContent, disabled: button.disabled });
          if (!button.disabled) button.click();
        }
        return labels;
      });
      equal('UNLUCKY457-USES-01', 'The count walks 3/3 → 2/3 → 1/3 → 0/3 and then disables',
        spent, [
          { label: 'GM invokes Unlucky (3/3)', disabled: false },
          { label: 'GM invokes Unlucky (2/3)', disabled: false },
          { label: 'GM invokes Unlucky (1/3)', disabled: false },
          { label: 'GM invokes Unlucky (0/3)', disabled: true },
        ]);
      await page.waitForTimeout(200);
      const exhausted = await rowState(page);
      equal('UNLUCKY457-USES-02', 'The row shows the pool spent, not the entry vanished',
        exhausted.pips, '○○○ 0/3');
    });

    // ============ Nothing else is re-paid ============

    await section('UNLUCKY457-ISOLATION', 'A reroll re-pays nothing', async () => {
      await reset(page);
      await configureUnlucky(page, 4);
      // The audit's hard requirement: no second spell slot, no repeated Willpower gate, no new
      // Void payment, no reused limited resource, no fresh bonus selection. Rather than listing
      // those and checking each, this snapshots the WHOLE character before and after and asserts
      // the only thing that moved is Unlucky's own counter — which covers costs nobody thought to
      // name, including any added later.
      const changed = await page.evaluate(() => {
        const T = window.__L5R_TEST__;
        const before = JSON.parse(JSON.stringify(T.collectData()));
        T.showRollResult('Harness roll', T.rollDicePool(4, 2, true));
        document.querySelector('.unlucky-invoke').click();
        const after = JSON.parse(JSON.stringify(T.collectData()));
        const paths = [];
        const walk = (a, b, at) => {
          if (JSON.stringify(a) === JSON.stringify(b)) return;
          // Descends into arrays as well as objects. Stopping at the array boundary reports the
          // whole list as "changed" and hides which field actually moved, which is what the first
          // cut of this walker did — it named "/disadv" and proved nothing.
          const bothContainers = a && b && typeof a === 'object' && typeof b === 'object' &&
            Array.isArray(a) === Array.isArray(b);
          if (bothContainers) {
            new Set(Object.keys(a).concat(Object.keys(b)))
              .forEach(key => walk(a[key], b[key], at + '/' + key));
          } else paths.push(at);
        };
        walk(before, after, '');
        return paths;
      });
      // Reporting the changed PATHS rather than a boolean is the point: a bare "nothing moved"
      // check that silently scrubbed the wrong key would pass while proving nothing, which is
      // exactly what the first cut of this check did.
      equal('UNLUCKY457-ISOLATION-01',
        'The only thing an invoke changes on the character is Unlucky’s own counter',
        changed, ['/disadv/0/config/remaining']);
    });

    await section('UNLUCKY457-LUCK', 'Unlucky is independent of Luck', async () => {
      await reset(page);
      await configureUnlucky(page, 3);
      const both = await page.evaluate(() => {
        const T = window.__L5R_TEST__;
        // Luck is an Advantage with a fixed rank ladder, so it is added and picked its own way —
        // through 209.81's extended modal, whose tiles carry generated ids (advConfigExtendedPick_N)
        // rather than value-derived ones. Selected by tile text so this does not depend on that.
        const sel = document.getElementById('advQuickAdd');
        sel.value = 'Luck';
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        const tile = Array.from(document.querySelectorAll('#advConfigGrid .affinity-pick-item'))
          .find(item => /Rank 2/.test(item.textContent));
        if (!tile) return { setup: 'no Luck tile' };
        const box = tile.querySelector('input[type=checkbox]');
        box.checked = true;
        box.dispatchEvent(new Event('change', { bubbles: true }));
        document.getElementById('advConfigConfirm').click();
        T.recalcAll();
        T.showRollResult('Harness roll', T.rollDicePool(4, 2, true));
        const luckBefore = document.querySelector('.adv-config-spend-luck').textContent;
        document.querySelector('.unlucky-invoke').click();
        return {
          setup: 'ok',
          luckBefore: luckBefore,
          luckAfter: document.querySelector('.adv-config-spend-luck').textContent,
          unluckyAfter: document.querySelector('.unlucky-invoke').textContent,
        };
      });
      record('UNLUCKY457-LUCK-01', 'Both resources offer their own action on the same result',
        both.setup === 'ok' && /Spend Luck/.test(both.luckBefore || ''), JSON.stringify(both));
      equal('UNLUCKY457-LUCK-02', 'Spending Unlucky does not touch Luck’s pool',
        both.luckAfter, both.luckBefore);
      record('UNLUCKY457-LUCK-03', '…while Unlucky’s own pool went down',
        /\(2\/3\)/.test(both.unluckyAfter || ''), String(both.unluckyAfter));
    });

    // ============ Manual correction and reset ============

    await section('UNLUCKY457-MANUAL', 'Session reset and manual correction', async () => {
      await reset(page);
      await configureUnlucky(page, 3);
      const click = label => page.evaluate(text => {
        const button = Array.from(document.querySelectorAll('#disadvList .unlucky-btn'))
          .find(b => b.textContent === text);
        if (button && !button.disabled) button.click();
      }, label);

      let state = await rowState(page);
      equal('UNLUCKY457-MANUAL-01', 'At full, "+" is disabled and "−" is not',
        state.buttons.map(b => [b.label, b.disabled]),
        [['−', false], ['+', true], ['Reset session', false]]);

      await click('−'); await page.waitForTimeout(150);
      await click('−'); await page.waitForTimeout(150);
      state = await rowState(page);
      equal('UNLUCKY457-MANUAL-02', 'Two manual uses bring it to 1/3', state.pips, '●○○ 1/3');

      await click('+'); await page.waitForTimeout(150);
      state = await rowState(page);
      equal('UNLUCKY457-MANUAL-03', 'And "+" gives one back, for a use recorded in error',
        state.pips, '●●○ 2/3');

      await click('−'); await page.waitForTimeout(120);
      await click('−'); await page.waitForTimeout(120);
      state = await rowState(page);
      equal('UNLUCKY457-MANUAL-04', 'At zero, "−" is disabled rather than going negative',
        [state.pips, state.buttons[0].disabled], ['○○○ 0/3', true]);

      await click('Reset session'); await page.waitForTimeout(150);
      state = await rowState(page);
      equal('UNLUCKY457-MANUAL-05', 'Reset restores the full per-session pool', state.pips, '●●● 3/3');

      // Reported from the device: all three carried a Feature 4.54 circled-i, because that phase
      // decorates anything with an explanatory `title=`. Right for a rules tooltip a phone cannot
      // otherwise reach, wrong for three small controls whose labels sit inches away. They now
      // describe themselves with aria-label instead, which keeps the accessible name — a screen
      // reader announcing "−" alone would be useless — without reading as a tooltip.
      const labelling = await page.evaluate(() =>
        Array.from(document.querySelectorAll('#disadvList .unlucky-btn')).map(button => ({
          title: button.getAttribute('title'),
          hasAriaLabel: !!button.getAttribute('aria-label'),
          hasInfoIcon: !!button.querySelector('.adv-config-info'),
        })));
      equal('UNLUCKY457-MANUAL-06', 'None of the three carries a tooltip icon, and all are still labelled',
        labelling, [
          { title: null, hasAriaLabel: true, hasInfoIcon: false },
          { title: null, hasAriaLabel: true, hasInfoIcon: false },
          { title: null, hasAriaLabel: true, hasInfoIcon: false },
        ]);
    });

    await section('UNLUCKY457-PERSIST', 'The pool survives a save/load round trip', async () => {
      await reset(page);
      await configureUnlucky(page, 4);
      const round = await page.evaluate(() => {
        const T = window.__L5R_TEST__;
        T.showRollResult('Harness roll', T.rollDicePool(4, 2, true));
        document.querySelector('.unlucky-invoke').click();
        T.recalcAll();
        const saved = JSON.parse(JSON.stringify(T.collectData()));
        T.resetToBaseline(); T.recalcAll();
        T.applyData(saved); T.recalcAll();
        const row = document.querySelector('#disadvList .entry');
        return {
          cost: row ? row.querySelector('.en-cost').value : null,
          pips: row ? row.querySelector('.unlucky-pips').textContent : null,
        };
      });
      equal('UNLUCKY457-PERSIST-01', 'Reloading restores the rank at its award',
        round.cost, '8');
      equal('UNLUCKY457-PERSIST-02', '…and the uses already spent, not a refilled pool',
        round.pips, '●●●○ 3/4');
    });

    // ============ Geometry ============

    await section('UNLUCKY457-GEOM', 'The result-modal block fits phone width', async () => {
      await reset(page);
      await configureUnlucky(page, 2);
      await page.evaluate(() => {
        const T = window.__L5R_TEST__;
        T.showRollResult('Harness roll', T.rollDicePool(4, 2, true));
      });
      const geometry = await page.evaluate(() => {
        const wrap = document.querySelector('.unlucky-actions');
        const button = document.querySelector('.unlucky-invoke');
        const outcome = document.querySelector('.unlucky-actions');
        if (!wrap || !button || !outcome.parentElement) return null;
        return {
          available: Math.round(wrap.parentElement.getBoundingClientRect().width),
          wrap: Math.round(wrap.getBoundingClientRect().width),
          button: Math.round(button.getBoundingClientRect().width),
          buttonHeight: Math.round(button.getBoundingClientRect().height),
          overflowing: button.scrollWidth - button.clientWidth > 1,
        };
      });
      record('UNLUCKY457-GEOM-01', 'The invoke button spans the block and does not overflow',
        !!geometry && geometry.button >= geometry.wrap - 1 && !geometry.overflowing,
        JSON.stringify(geometry));
      // Measured, and it is what makes this phase's stylesheet load-bearing: without it the
      // button is an inline-sized control whose label ("GM invokes Unlucky (2/2)") decides its
      // width, rather than a full-width row.
      record('UNLUCKY457-GEOM-02', 'It fills the modal rather than shrinking to its label',
        !!geometry && geometry.wrap >= geometry.available - 1,
        JSON.stringify(geometry));
    });

    // ============ Phase contract ============

    await section('UNLUCKY457-CONTRACT', 'Phase contract', async () => {
      equal('UNLUCKY457-CONTRACT-01', 'The phase exports its kill-switch as enabled',
        await page.evaluate(() => window.__L5R_TEST__.DISADV_UNLUCKY_ENABLED), true);
      equal('UNLUCKY457-CONTRACT-02', 'Unlucky is registered as configurable',
        await page.evaluate(() => !!window.__L5R_TEST__.advConfigSchemaFor('Unlucky')), true);
      // Read off the rendered panel rather than the collector behind it: the panel is what the
      // player actually sees, and it proves the wrapper reached Phase 4.5's renderer end to end.
      await reset(page);
      await configureUnlucky(page, 3);
      await page.evaluate(() => window.__L5R_TEST__.recalcAll());
      record('UNLUCKY457-CONTRACT-03', 'It appears in the shared Session Resources panel',
        /Unlucky/.test(await page.evaluate(() => {
          const panel = document.getElementById('advConfigSessionResources');
          return panel ? panel.textContent : '';
        })), await page.evaluate(() => {
          const panel = document.getElementById('advConfigSessionResources');
          return panel ? panel.textContent : '(no panel)';
        }));
    });

    const registryAfter = await page.evaluate(() =>
      window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.map(m => [m.id, m.priority]));
    equal('UNLUCKY457-REGISTRY-01', 'Unlucky leaves every registry entry unchanged',
      registryAfter, registryBefore);
    record('UNLUCKY457-ERRORS', 'No uncaught browser errors', errors.length === 0, errors.join('\n'));
  } finally { await browser.close(); }
}

main().catch(e => record('UNLUCKY457-FATAL', 'Harness initialization', false, String(e.stack || e))).finally(() => {
  const passed = results.filter(r => r.pass).length;
  console.table(results.filter(r => !r.pass));
  console.log(`\n${passed}/${results.length} checks passed`);
  console.log('UNLUCKY457_QA_RESULT=' + JSON.stringify({ total: results.length, passed, failed: results.length - passed }));
  process.exitCode = passed === results.length ? 0 : 1;
});
