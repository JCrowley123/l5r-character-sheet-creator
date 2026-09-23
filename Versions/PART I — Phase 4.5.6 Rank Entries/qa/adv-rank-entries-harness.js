/*
 * Phase 4.5.6 Perceived Honor + Wealthy — browser validation.
 *
 * Run: node adv-rank-entries-harness.js <sheet.html>
 *
 * Every pricing check drives the real modal — open the entry from the quick-add list, type into
 * its own number input, click its own Confirm — and then reads the price out of the row's editable
 * points box, which is what the XP tracker actually totals. Asserting on R456.resolve() instead
 * would prove only that the module agrees with itself; Part H Phase 1 shipped broken at 15/15
 * doing exactly that.
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

const reset = (page, clan) => page.evaluate(clanName => {
  const T = window.__L5R_TEST__;
  if (T.D45 && T.D45.gates) T.D45.gates.cancel();
  T.resetToBaseline();
  if (clanName) {
    const el = document.getElementById('f_clan');
    el.value = clanName;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
  T.recalcAll();
  ['advConfigModalOverlay', 'rollPreviewOverlay', 'rollModalOverlay', 'appConfirmOverlay']
    .forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
}, clan || '');

async function openEntry(page, name) {
  await page.evaluate(entry => {
    const sel = document.getElementById('advQuickAdd');
    sel.value = entry;
    sel.dispatchEvent(new Event('change', { bubbles: true }));
  }, name);
  await page.waitForSelector('#advConfigRankInput', { state: 'attached', timeout: 4000 });
}

const typeRank = (page, rank) => page.evaluate(value => {
  const input = document.getElementById('advConfigRankInput');
  input.value = String(value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}, rank);

const rowState = page => page.evaluate(() => {
  const row = document.querySelector('#advList .entry');
  return row ? {
    cost: row.querySelector('.en-cost') ? row.querySelector('.en-cost').value : null,
    summary: row.querySelector('.adv-config-summary')
      ? row.querySelector('.adv-config-summary').textContent : null,
  } : null;
});

async function configure(page, entry, rank, clan) {
  await reset(page, clan);
  await openEntry(page, entry);
  await typeRank(page, rank);
  await page.click('#advConfigConfirm');
  await page.waitForTimeout(200);
  return rowState(page);
}

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error('usage: node adv-rank-entries-harness.js <sheet.html>');
  const browser = await chromium.launch(process.env.L5R_CHROME ? { executablePath: process.env.L5R_CHROME } : {});
  try {
    const page = await browser.newPage({ viewport: PHONE });
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(pathToFileURL(path.resolve(file)).href);
    await page.waitForFunction(() => window.__L5R_TEST__ && typeof window.__L5R_TEST__.recalcAll === 'function');
    const registryBefore = await page.evaluate(() =>
      window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.map(m => [m.id, m.priority]));

    // ============ Perceived Honor (A10) ============

    await section('RANKS456-PH', 'Perceived Honor prices 2 XP per rank', async () => {
      equal('RANKS456-PH-01', 'Rank 1 costs 2 XP',
        (await configure(page, 'Perceived Honor', 1)).cost, '2');
      equal('RANKS456-PH-02', 'Rank 3 costs 6 XP',
        (await configure(page, 'Perceived Honor', 3)).cost, '6');
      // The audit names rank 10 = 20 XP specifically, and forbids inventing a cap. A ladder of
      // fixed options would have failed here rather than at some arbitrary third rank.
      equal('RANKS456-PH-03', 'Rank 10 costs 20 XP, so no rank cap was invented',
        (await configure(page, 'Perceived Honor', 10)).cost, '20');
      record('RANKS456-PH-04', 'The row states the perceived reading and the actual Honor',
        /read as Honor 8 \(actual 5, unchanged\)/.test(
          (await configure(page, 'Perceived Honor', 3)).summary || ''), '');
    });

    await section('RANKS456-HONOR', 'The readout follows Honor without touching it', async () => {
      await configure(page, 'Perceived Honor', 2);
      const tracked = await page.evaluate(() => {
        const before = document.getElementById('f_honorRank').value;
        const el = document.getElementById('f_honorRank');
        el.value = '8';
        el.dispatchEvent(new Event('input', { bubbles: true }));
        window.__L5R_TEST__.recalcAll();
        return {
          before: before,
          after: document.getElementById('f_honorRank').value,
          summary: document.querySelector('#advList .adv-config-summary').textContent,
        };
      });
      record('RANKS456-HONOR-01', 'Raising Honor 5 → 8 moves the perceived reading to 10',
        /read as Honor 10/.test(tracked.summary), tracked.summary);
      equal('RANKS456-HONOR-02', 'And actual Honor is left exactly where the player put it',
        tracked.after, '8');
      record('RANKS456-HONOR-03', 'The row keeps saying the actual figure is unchanged',
        /actual 8, unchanged/.test(tracked.summary), tracked.summary);
    });

    // ============ Wealthy (A16) ============

    await section('RANKS456-W', 'Wealthy prices rank × 1 with one discount off the total', async () => {
      equal('RANKS456-W-01', 'Five ranks cost 5 XP with no eligible clan',
        (await configure(page, 'Wealthy', 5)).cost, '5');
      // The defect the catalogue carried until 4.5.3 was a PER-RANK discount, which would price
      // this at 0. This is the check that tells the two readings apart.
      equal('RANKS456-W-02', 'Five ranks cost 4 XP for a Crane — one discount, not one per rank',
        (await configure(page, 'Wealthy', 5, 'Crane')).cost, '4');
      equal('RANKS456-W-03', 'A Unicorn is priced the same way',
        (await configure(page, 'Wealthy', 5, 'Unicorn')).cost, '4');
      equal('RANKS456-W-04', 'So is an Imperial character',
        (await configure(page, 'Wealthy', 5, 'Imperial')).cost, '4');
      equal('RANKS456-W-05', 'An ineligible clan pays full price',
        (await configure(page, 'Wealthy', 5, 'Crab')).cost, '5');
      // CROSS-PHASE FIXTURE CORRECTION, Feature 4.5.17 (declared in its ROLLBACK). This asserted
      // 0 XP when no Advantage minimum had been found in the source. Core p.149 (verified 19
      // September) sets a 1-XP minimum after discounts, applied by 4.5.17; without that release
      // this handler's own arithmetic still gives 0, so the expectation follows its presence.
      equal('RANKS456-W-06', 'Rank 1 with the discount costs 0 XP here; 1 XP (Core p.149 minimum) with Feature 4.5.17',
        (await configure(page, 'Wealthy', 1, 'Crane')).cost,
        await page.evaluate(() => window.__L5R_TEST__.W4517 ? '1' : '0'));
      equal('RANKS456-W-07', 'Rank 1 without it costs 1 XP',
        (await configure(page, 'Wealthy', 1)).cost, '1');
      record('RANKS456-W-08', 'The row states the koku entitlement for the chosen rank',
        /entitles 10 koku at creation/.test(
          (await configure(page, 'Wealthy', 5)).summary || ''), '');
    });

    await section('RANKS456-KOKU', 'No money is ever minted', async () => {
      // The audit's hard requirement: recalculation, reload, import or edit must never repeatedly
      // grant currency. This phase sidesteps the whole lifecycle by granting none at all, and
      // this is the check that holds it to that.
      const koku = await page.evaluate(async () => {
        const T = window.__L5R_TEST__;
        const read = () => document.getElementById('f_koku').value;
        T.resetToBaseline(); T.recalcAll();
        const before = read();
        const sel = document.getElementById('advQuickAdd');
        sel.value = 'Wealthy'; sel.dispatchEvent(new Event('change', { bubbles: true }));
        return { before: before, afterOpen: read() };
      });
      await typeRank(page, 5);
      await page.click('#advConfigConfirm');
      await page.waitForTimeout(200);
      const after = await page.evaluate(() => {
        const T = window.__L5R_TEST__;
        const read = () => document.getElementById('f_koku').value;
        const afterConfirm = read();
        for (let i = 0; i < 5; i++) T.recalcAll();
        return { afterConfirm: afterConfirm, afterRecalcs: read() };
      });
      // CROSS-PHASE FIXTURE CORRECTION, Feature 4.5.17 (declared in its ROLLBACK). The owner later
      // ruled that Wealthy GRANTS its 2 koku per Rank; 4.5.17 adds it once, on confirm. Without that
      // release this handler still adds nothing. KOKU-02 keeps its real point either way: repeated
      // recalculation never changes the money after the confirm.
      const granted = await page.evaluate(() => window.__L5R_TEST__.W4517 ? 10 : 0);
      equal('RANKS456-KOKU-01', 'Configuring Wealthy adds no koku here; exactly 2 per Rank once with Feature 4.5.17',
        after.afterConfirm, String(Number(koku.before) + granted));
      equal('RANKS456-KOKU-02', 'And five recalcs cannot mint it either',
        after.afterRecalcs, after.afterConfirm);
    });

    // ============ Validation ============

    await section('RANKS456-VALID', 'Only a positive whole rank is accepted', async () => {
      await reset(page);
      await openEntry(page, 'Perceived Honor');
      const rejected = [];
      for (const bad of ['0', '-2', '2.5', 'abc', '', '3x', '1e2']) {
        await typeRank(page, bad);
        await page.click('#advConfigConfirm');
        await page.waitForTimeout(100);
        const open = await page.evaluate(() => !!document.getElementById('advConfigRankInput'));
        if (open) rejected.push(bad);
      }
      equal('RANKS456-VALID-01', 'Every invalid rank is refused and the modal stays open',
        rejected, ['0', '-2', '2.5', 'abc', '', '3x', '1e2']);
      // And the positive half in the same modal: a validator that refused everything would pass
      // the check above while making the entry unusable.
      await typeRank(page, 4);
      await page.click('#advConfigConfirm');
      await page.waitForTimeout(200);
      equal('RANKS456-VALID-02', 'A valid rank then commits at the right price',
        (await rowState(page)).cost, '8');
    });

    await section('RANKS456-PERSIST', 'The rank survives a save/load round trip', async () => {
      await configure(page, 'Perceived Honor', 7);
      const round = await page.evaluate(() => {
        const T = window.__L5R_TEST__;
        const saved = JSON.parse(JSON.stringify(T.collectData()));
        T.resetToBaseline(); T.recalcAll();
        const cleared = document.querySelectorAll('#advList .entry').length;
        T.applyData(saved); T.recalcAll();
        const row = document.querySelector('#advList .entry');
        return {
          cleared: cleared,
          cost: row ? row.querySelector('.en-cost').value : null,
          summary: row ? row.querySelector('.adv-config-summary').textContent : null,
        };
      });
      equal('RANKS456-PERSIST-01', 'Reloading restores the rank at its correct price',
        round.cost, '14');
      record('RANKS456-PERSIST-02', 'And the row renders its summary again, not a warning',
        /Rank 7/.test(round.summary || ''), String(round.summary));
    });

    // ============ Geometry ============

    await section('RANKS456-GEOM', 'The rank input fits the phone-width modal', async () => {
      await reset(page);
      await openEntry(page, 'Wealthy');
      const geometry = await page.evaluate(() => {
        const input = document.getElementById('advConfigRankInput');
        const grid = document.getElementById('advConfigGrid');
        const label = document.querySelector('.adv-rank-label');
        if (!input || !grid) return null;
        return {
          available: Math.round(grid.getBoundingClientRect().width),
          input: Math.round(input.getBoundingClientRect().width),
          inputFont: parseFloat(getComputedStyle(input).fontSize),
          labelWidth: label ? Math.round(label.getBoundingClientRect().width) : null,
          labelFont: label ? parseFloat(getComputedStyle(label).fontSize) : null,
          overflowing: input.scrollWidth - input.clientWidth > 1,
        };
      });
      record('RANKS456-GEOM-01', 'It fills the modal and does not overflow at 375px',
        !!geometry && geometry.input >= geometry.available - 1 && !geometry.overflowing,
        JSON.stringify(geometry));
      // iOS Safari zooms the page in when a focused form control is under 16px. The sheet's own
      // base stylesheet already supplies that, so this asserts the property rather than this
      // phase's authorship of it — it must survive whoever owns the rule.
      record('RANKS456-GEOM-02', 'The field is at least 16px, so focusing it cannot zoom an iPhone in',
        !!geometry && geometry.inputFont >= 16, JSON.stringify(geometry));
      // THIS is what makes this phase's stylesheet load-bearing, and width is not: #advConfigGrid
      // stretches its children either way, so a width check passes with the sheet dropped and
      // proves nothing — Feature 4.55's first geometry check made exactly that mistake, and the
      // first cut of this one repeated it. Measured with the file dropped, the label falls to
      // 10.56px and 144px wide: a full sentence, too small to read at phone width.
      record('RANKS456-GEOM-03', 'Its label is legible and spans the modal, not left small and narrow',
        !!geometry && geometry.labelFont >= 12 && geometry.labelWidth >= geometry.available - 1,
        JSON.stringify(geometry));
    });

    // ============ Phase contract ============

    await section('RANKS456-CONTRACT', 'Phase contract', async () => {
      equal('RANKS456-CONTRACT-01', 'The phase exports its kill-switch as enabled',
        await page.evaluate(() => window.__L5R_TEST__.ADV_RANK_ENTRIES_ENABLED), true);
      equal('RANKS456-CONTRACT-02', 'It claims exactly the two entries it declares',
        await page.evaluate(() => Object.keys(window.__L5R_TEST__.R456.ENTRIES).sort()),
        ['Perceived Honor', 'Wealthy']);
      // Both entries were already in the catalogue; this phase adds the handler, not the entry.
      equal('RANKS456-CONTRACT-03', 'Both are registered as configurable now',
        await page.evaluate(() => ['Perceived Honor', 'Wealthy'].map(n =>
          !!window.__L5R_TEST__.advConfigSchemaFor(n))), [true, true]);
    });

    const registryAfter = await page.evaluate(() =>
      window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.map(m => [m.id, m.priority]));
    equal('RANKS456-REGISTRY-01', 'The handlers leave every registry entry unchanged',
      registryAfter, registryBefore);
    record('RANKS456-ERRORS', 'No uncaught browser errors', errors.length === 0, errors.join('\n'));
  } finally { await browser.close(); }
}

main().catch(e => record('RANKS456-FATAL', 'Harness initialization', false, String(e.stack || e))).finally(() => {
  const passed = results.filter(r => r.pass).length;
  console.table(results.filter(r => !r.pass));
  console.log(`\n${passed}/${results.length} checks passed`);
  console.log('RANKS456_QA_RESULT=' + JSON.stringify({ total: results.length, passed, failed: results.length - passed }));
  process.exitCode = passed === results.length ? 0 : 1;
});
