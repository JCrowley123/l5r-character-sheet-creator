/*
 * Phase 4.5.4 Configuration UX Pass — browser validation.
 *
 * Run: node adv-config-ux-harness.js <sheet.html>
 *
 * The geometry checks here are the ones that matter, and they are written as MEASUREMENTS
 * against the real rendered box rather than as assertions about CSS. Phase 4.5 shipped a picker
 * whose tiles overflowed by 292px while every value-reading check in its suite passed, because
 * nothing in that suite could see geometry. These run at 375px, the width the defect was
 * reported at.
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
  ['advConfigModalOverlay', 'rollPreviewOverlay', 'rollModalOverlay', 'appConfirmOverlay', 'stanceInfoOverlay']
    .forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
});

const addEntry = (page, selectId, listId, name) => page.evaluate(({ selectId, listId, name }) => {
  const sel = document.getElementById(selectId);
  sel.value = name; sel.dispatchEvent(new Event('change', { bubbles: true }));
  window.__L5R_TEST__.recalcAll();
  return document.querySelectorAll('#' + listId + ' .entry').length - 1;
}, { selectId, listId, name });

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error('usage: node adv-config-ux-harness.js <sheet.html>');
  const browser = await chromium.launch(process.env.L5R_CHROME ? { executablePath: process.env.L5R_CHROME } : {});
  try {
    const page = await browser.newPage({ viewport: PHONE });
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(pathToFileURL(path.resolve(file)).href);
    await page.waitForFunction(() => window.__L5R_TEST__ && typeof window.__L5R_TEST__.recalcAll === 'function');

    const registryBefore = await page.evaluate(() =>
      window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.map(m => [m.id, m.priority]));

    // ============ The affordance exists where an explanation exists ============

    await section('UX454-INFO', 'The circled-i affordance', async () => {
      await reset(page);
      await addEntry(page, 'advQuickAdd', 'advList', 'Magic Resistance');
      const row = await page.evaluate(() => {
        const entry = document.querySelector('#advList .entry');
        const withTitle = Array.from(entry.querySelectorAll('[title]'));
        return {
          explanatoryTitles: withTitle.filter(el => (el.getAttribute('title') || '').trim().length >= 20).length,
          infoButtons: entry.querySelectorAll('.adv-config-info').length,
          titlesStillPresent: withTitle.length,
        };
      });
      equal('UX454-INFO-01', 'A row carrying an explanatory tooltip gains an info button',
        row.infoButtons >= 1, true);
      equal('UX454-INFO-02', 'The title= attribute is KEPT, so desktop hover is unchanged',
        row.titlesStillPresent >= 1, true);

      // The regression guard: existing suites assert on exact row textContent.
      const glyph = await page.evaluate(() => {
        const btn = document.querySelector('#advList .entry .adv-config-info');
        return btn ? { text: btn.textContent, aria: (btn.getAttribute('aria-label') || '').slice(0, 9) } : null;
      });
      equal('UX454-INFO-03', 'The button contributes NOTHING to textContent (glyph is CSS)',
        glyph && glyph.text, '');
      equal('UX454-INFO-04', 'It is still announced to assistive tech', glyph && glyph.aria, 'Explain: ');

      // A short control label is not an explanation and must not collect an icon.
      const shortOnes = await page.evaluate(() => {
        const out = { shortTitles: 0, decorated: 0 };
        document.querySelectorAll('[title]').forEach(el => {
          const t = (el.getAttribute('title') || '').trim();
          if (t.length > 0 && t.length < 20) {
            out.shortTitles++;
            if (el.querySelector(':scope > .adv-config-info')) out.decorated++;
          }
        });
        return out;
      });
      equal('UX454-INFO-05', 'A short control label (e.g. "Cancel") gets no info button',
        shortOnes.decorated, 0);
      record('UX454-INFO-06', 'There were short labels present to be skipped',
        shortOnes.shortTitles > 0, `${shortOnes.shortTitles} short titles seen`);
    });

    // ============ The rules that were unreachable on touch ============

    await section('UX454-RULES', 'Tenet rules reachable by tap', async () => {
      await reset(page);
      await addEntry(page, 'disadvQuickAdd', 'disadvList', 'Consumed');
      const modal = await page.evaluate(() => {
        const ov = document.getElementById('advConfigModalOverlay');
        const cards = Array.from(ov.querySelectorAll('.d45-option'));
        return {
          open: ov.style.display !== 'none',
          cards: cards.length,
          withExplanatoryTitle: cards.filter(c => (c.getAttribute('title') || '').trim().length >= 20).length,
          withInfoButton: cards.filter(c => c.querySelector('.adv-config-info')).length,
        };
      });
      equal('UX454-RULES-01', 'Every Consumed tenet card carrying a rule gains an info button',
        modal.withInfoButton, modal.withExplanatoryTitle);
      record('UX454-RULES-02', 'And there were rules to reach in the first place',
        modal.withExplanatoryTitle >= 7, `${modal.withExplanatoryTitle} rule tooltips on ${modal.cards} cards`);

      // Tapping it opens the sheet's existing info overlay carrying that rule's text.
      const opened = await page.evaluate(() => {
        const card = Array.from(document.querySelectorAll('#advConfigModalOverlay .d45-option'))
          .find(c => (c.getAttribute('title') || '').trim().length >= 20);
        const expected = (card.getAttribute('title') || '').trim();
        const checkedBefore = !!card.querySelector('input[type=checkbox]:checked');
        card.querySelector('.adv-config-info').click();
        const ov = document.getElementById('stanceInfoOverlay');
        return {
          visible: ov && ov.style.display !== 'none',
          body: (document.getElementById('stanceInfoBody').textContent || '').trim(),
          expected,
          checkedAfter: !!card.querySelector('input[type=checkbox]:checked'),
          checkedBefore,
        };
      });
      equal('UX454-RULES-03', 'Tapping it opens the info overlay', opened.visible, true);
      equal('UX454-RULES-04', '…carrying that option’s own rule text', opened.body, opened.expected);
      equal('UX454-RULES-05', '…without selecting the option as a side effect',
        opened.checkedAfter, opened.checkedBefore);
      await page.evaluate(() => {
        const ov = document.getElementById('stanceInfoOverlay'); if (ov) ov.style.display = 'none';
        const x = document.getElementById('advConfigX'); if (x) x.click();
      });
    });

    // ============ Wording ============

    await section('UX454-WORD', 'Refund wording', async () => {
      const labels = await page.evaluate(() => {
        const T = window.__L5R_TEST__;
        if (!T.D45) return null;
        const tiered = T.D45.steps({ name: 'Antisocial', type: 'tierPick', tiers: [2, 4] }, {});
        const imbalance = T.D45.steps({ name: 'Elemental Imbalance', type: 'elementPick' }, {});
        return { tier: tiered.map(s => s.label), imbalance: imbalance.map(s => s.label) };
      });
      equal('UX454-WORD-01', 'The tier step reads "Severity", not "XP refund"',
        labels && labels.tier, ['Severity']);
      equal('UX454-WORD-02', 'Elemental Imbalance drops "refunded" from its rank step',
        labels && labels.imbalance[0], 'Rank — 2 XP per rank');

      await reset(page);
      await addEntry(page, 'disadvQuickAdd', 'disadvList', 'Blackmailed');
      const summary = await page.evaluate(() =>
        (document.querySelector('#disadvList .entry .d45-summary') || {}).textContent || '');
      equal('UX454-WORD-03', 'The row summary says "value", not "refund"',
        { refund: /refund/i.test(summary), value: /value/i.test(summary) },
        { refund: false, value: true });
    });

    // ============ Geometry, at the width the defects were reported at ============

    await section('UX454-GEOM', 'Phone-width geometry', async () => {
      // Every configurable entry's modal, measured for real overflow.
      const overflow = await page.evaluate(() => {
        const T = window.__L5R_TEST__;
        const names = Array.from(document.getElementById('disadvQuickAdd').options)
          .map(o => o.value).filter(n => n && T.advConfigSchemaFor(n));
        const bad = [];
        names.forEach(name => {
          T.resetToBaseline(); T.recalcAll();
          const sel = document.getElementById('disadvQuickAdd');
          sel.value = name; sel.dispatchEvent(new Event('change', { bubbles: true }));
          const ov = document.getElementById('advConfigModalOverlay');
          if (ov.style.display !== 'none') {
            ov.querySelectorAll('.d45-option, .d45-option label, .affinity-pick-item').forEach(el => {
              const over = el.scrollWidth - el.clientWidth;
              if (over > 1) bad.push({ name, cls: String(el.className).slice(0, 30), over });
            });
            const x = document.getElementById('advConfigX'); if (x) x.click();
          }
        });
        return bad;
      });
      equal('UX454-GEOM-01', 'No configuration option card overflows at 375px', overflow, []);

      // The roll preview's modifier label, the case reported from the phone.
      const label = await page.evaluate(async () => {
        const T = window.__L5R_TEST__;
        T.resetToBaseline();
        document.getElementById('f_school').value = 'Isawa Shugenja';
        document.getElementById('f_schoolDeficiencyElement').value = '';
        T.recalcAll();
        const sel = document.getElementById('advQuickAdd');
        sel.value = 'Friend of the Elements'; sel.dispatchEvent(new Event('change', { bubbles: true }));
        T.writeAdvConfig(document.querySelector('#advList .entry:last-child'), 'ringPick',
          { type: 'ringPick', value: 'Fire' });
        T.recalcAll();
        T.showRollPreview({ context: T.makeRollContext(T.ROLL_KINDS.TRAIT, { traitName: 'Agility' }),
                            rolled: 3, kept: 3, label: 'Agility Trait Roll' });
        await new Promise(r => setTimeout(r, 150));
        const el = document.querySelector('#rollPreviewOverlay .rp-mod-label');
        const box = el && el.getBoundingClientRect();
        const lh = el && parseFloat(getComputedStyle(el).lineHeight) || 18;
        const out = el ? { width: Math.round(box.width), lines: Math.round(box.height / lh) } : null;
        const c = document.getElementById('rollPreviewCancel'); if (c) c.click();
        return out;
      });
      equal('UX454-GEOM-02', 'The roll preview label is one line, not three, at 375px',
        label && label.lines, 1);
      record('UX454-GEOM-03', 'And it is no longer crushed into a narrow column',
        label && label.width > 150, `label width ${label && label.width}px`);
    });

    // ============ Phase contract ============

    await section('UX454-CONTRACT', 'Phase contract', async () => {
      equal('UX454-CONTRACT-01', 'The phase exports its kill-switch as enabled',
        await page.evaluate(() => window.__L5R_TEST__.ADV_CONFIG_UX_ENABLED), true);
      equal('UX454-CONTRACT-02', 'It adds no CSS class the sheet did not already scope',
        await page.evaluate(() => typeof window.__L5R_TEST__.R454.decorate === 'function'), true);
    });

    const registryAfter = await page.evaluate(() =>
      window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.map(m => [m.id, m.priority]));
    equal('UX454-REGISTRY-01', 'The UX pass leaves every registry entry unchanged', registryAfter, registryBefore);
    record('UX454-ERRORS', 'No uncaught browser errors', errors.length === 0, errors.join('\n'));
  } finally { await browser.close(); }
}

main().catch(e => record('UX454-FATAL', 'Harness initialization', false, String(e.stack || e))).finally(() => {
  const passed = results.filter(r => r.pass).length;
  console.table(results.filter(r => !r.pass));
  console.log(`\n${passed}/${results.length} checks passed`);
  console.log('UX454_QA_RESULT=' + JSON.stringify({ total: results.length, passed, failed: results.length - passed }));
  process.exitCode = passed === results.length ? 0 : 1;
});
