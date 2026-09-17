/*
 * Phase 4.5.8 — Dependant (D02) and Wrath of the Kami (D07) — browser validation.
 *
 * Run: node disadv-dependant-wrath-harness.js <sheet.html>
 *
 * Three checks here exist because of something that was measured rather than assumed, and each
 * would have been written differently otherwise:
 *
 *  - CONTRACT-03 pins D45.configTypes to the same array Feature 4.5.2's own harness pins it to.
 *    That is this phase's promise not to extend another phase's public contract.
 *
 *    SUPERSEDED REASONING, corrected by Part I Feature 4.5.10: this comment used to conclude that
 *    an exact-array assertion "cannot be corrected the way 4.57 corrected R453-CAT-06, because no
 *    single expected value passes both with this phase present and removed", and that conclusion
 *    became a standing constraint in this phase's ROLLBACK.md that no later phase may add a type
 *    string at all. It is true of a CONSTANT expected value and false of a CONDITIONAL one — the
 *    shape Phase 1.5 (Part G) already used for the modifier-registry length. The assertion below
 *    is now conditional, 4.5.10 adds `realmPick` on the project owner's decision, and this phase's
 *    own promise is unchanged and still checked.
 *
 *  - The ISOLATION section exists because Wrath of the Kami reuses Elemental Imbalance's
 *    `elementPick` type string, and Elemental Imbalance carries a pre-casting Willpower gate.
 *    Sharing the discriminator must not share the gate. That is proven by diffing the whole
 *    character across configuring it, not by listing the things it was remembered not to touch.
 *
 *  - The GEOM checks were written only AFTER measuring both builds side by side. The inputs'
 *    WIDTH is identical either way (the base sheet stretches them), so no width check is made;
 *    what the stylesheet actually supplies is the flex column's gap and the badge's box.
 *
 * The input build is never modified.
 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const { pathToFileURL } = require('url');

const PHONE = { width: 375, height: 812 };
const ELEMENTS = ['Air', 'Earth', 'Fire', 'Water', 'Void'];
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

const identity = (page, fields) => page.evaluate(fields => {
  Object.entries(fields).forEach(([id, value]) => {
    const input = document.getElementById(id);
    if (!input) throw new Error(`missing identity input ${id}`);
    input.value = String(value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  window.__L5R_TEST__.recalcAll();
}, fields);

const resolve = (page, name, config) => page.evaluate(({ name, config }) =>
  window.__L5R_TEST__.D45.resolve(name, config), { name, config });

// Drives the REAL quick-add -> modal -> confirm path, not a direct dataset write. A direct write
// would skip readStep(), finalize() and problem(), which is where three of this phase's four
// design decisions actually live.
async function addThroughModal(page, name) {
  await page.evaluate(entry => {
    const select = document.getElementById('disadvQuickAdd');
    select.value = entry;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }, name);
  await page.waitForSelector('#advConfigGrid input', { state: 'attached', timeout: 4000 });
}

async function configureDependant(page, points) {
  await addThroughModal(page, 'Dependant');
  await page.evaluate(value => {
    const input = document.querySelector('#advConfigGrid input[type=number]');
    input.value = String(value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, points);
  await page.click('#advConfigConfirm');
  await page.waitForTimeout(150);
}

async function configureWrath(page, element) {
  await addThroughModal(page, 'Wrath of the Kami');
  await page.evaluate(value => {
    const input = document.querySelector(`#advConfigGrid input[data-d45-field="element"][value="${value}"]`);
    if (!input) throw new Error('no option for ' + value);
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, element);
  await page.click('#advConfigConfirm');
  await page.waitForTimeout(150);
}

const rowFor = (page, name) => page.evaluate(entry => {
  const div = Array.from(document.querySelectorAll('#disadvList .entry'))
    .find(d => d.querySelector('.en-name') && d.querySelector('.en-name').value === entry);
  if (!div) return null;
  const row = div.querySelector('.adv-config-row');
  return {
    cost: div.querySelector('.en-cost') ? div.querySelector('.en-cost').value : null,
    summary: row && row.querySelector('.d45-summary') ? row.querySelector('.d45-summary').textContent : null,
    warn: row && row.querySelector('.adv-config-warn') ? row.querySelector('.adv-config-warn').textContent : null,
    inputs: Array.from(div.querySelectorAll('.dep458-input')).map(i => i.value),
    badge: div.querySelector('.wrath458-badge') ? div.querySelector('.wrath458-badge').textContent : null,
    config: div.dataset.advConfig || null,
  };
}, name);

// The whole character, deep, for the isolation diff. Same approach as 4.57's: a cost nobody
// thought to name still shows up as a changed path.
const snapshot = page => page.evaluate(() => {
  const T = window.__L5R_TEST__;
  const data = T.collectData ? T.collectData() : null;
  return JSON.parse(JSON.stringify(data));
});
function diffPaths(a, b, prefix = '', out = []) {
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  for (const k of keys) {
    const av = a ? a[k] : undefined, bv = b ? b[k] : undefined;
    const here = prefix + '/' + k;
    const bothObjects = av && bv && typeof av === 'object' && typeof bv === 'object';
    if (bothObjects) diffPaths(av, bv, here, out);
    else if (JSON.stringify(av) !== JSON.stringify(bv)) out.push(here);
  }
  return out;
}

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error('usage: node disadv-dependant-wrath-harness.js <sheet.html>');
  const url = pathToFileURL(path.resolve(file)).href;
  const browser = await chromium.launch();
  const errors = [];
  try {
    const page = await browser.newPage({ viewport: PHONE });
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(url);
    await page.waitForFunction(() => !!window.__L5R_TEST__, null, { timeout: 30000 });

    const present = await page.evaluate(() =>
      !!window.__L5R_TEST__.R458 && window.__L5R_TEST__.DISADV_DEPENDANT_WRATH_ENABLED === true);
    record('D458-00', 'Feature 4.58 is present and enabled', present);
    if (!present) return;

    const registryBefore = await page.evaluate(() =>
      window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.map(m => [m.id, m.priority]));

    // ---------------- Contract ----------------
    await section('D458-CONTRACT', 'Public contract', async () => {
      equal('D458-CONTRACT-01', 'Both entries are registered as configurable',
        await page.evaluate(() => [!!window.__L5R_TEST__.D45.schema('Dependant'),
          !!window.__L5R_TEST__.D45.schema('Wrath of the Kami')]), [true, true]);
      equal('D458-CONTRACT-02', 'Each resolves under the name it was installed with',
        await page.evaluate(() => [window.__L5R_TEST__.D45.schema('Dependant').name,
          window.__L5R_TEST__.D45.schema('Wrath of the Kami').name]),
        ['Dependant', 'Wrath of the Kami']);
      // Load-bearing: this is 4.5.2's own D45-SCHEMA-TYPES expectation. If THIS phase ever adds a
      // type string, it goes red here first rather than in 4.5.2's suite.
      //
      // CROSS-PHASE FIXTURE CORRECTION, Part I Feature 4.5.10, declared in that phase's ROLLBACK.md.
      // Feature 4.5.10 adds `realmPick` on the project owner's explicit decision, so a constant
      // expected array here would now fail for a string this phase did not add — which would
      // report the wrong phase. The check's INTENT is unchanged and is in fact now stated more
      // precisely: what it asserts is that 4.5.8 contributes nothing of its own. Conditional on
      // Feature 4.5.10's presence, exactly as Phase 1.5 (Part G) made its registry-length check
      // conditional on Phase 4.5's, so it reads identically with 4.5.10 present and removed.
      //
      // EXTENDED by Feature 4.5.11, which adds `fortunePick`. Expressed as a TABLE in manifest
      // order now that two phases add a string, so a third appends one row rather than nesting
      // another conditional. The intent is unchanged: this phase contributes nothing of its own.
      const optionalTypes458 = [['R4510', 'realmPick'], ['F4511', 'fortunePick']];
      const presentTypes458 = await page.evaluate(table => table
        .filter(([seamKey]) => typeof window.__L5R_TEST__[seamKey] === 'object' && !!window.__L5R_TEST__[seamKey])
        .map(([, type]) => type), optionalTypes458);
      const baseTypes458 = ['tierPick', 'rankPick', 'elementPick', 'tenetPick', 'targetPick',
        'insightDifferencePick', 'toggleModifier', 'statusLinked', 'dualTierPick', 'languagePick',
        'skillPick', 'clanWeaponAutoPick'];
      equal('D458-CONTRACT-03', 'This phase adds no configTypes string to 4.5.2 public contract',
        await page.evaluate(() => window.__L5R_TEST__.D45.configTypes),
        baseTypes458.concat(presentTypes458));
      equal('D458-CONTRACT-04', 'It reuses existing shapes rather than inventing one',
        await page.evaluate(() => [window.__L5R_TEST__.D45.schema('Dependant').type,
          window.__L5R_TEST__.D45.schema('Wrath of the Kami').type]),
        ['rankPick', 'elementPick']);
      equal('D458-CONTRACT-05', 'The element list is the five the sheet own spells carry',
        await page.evaluate(() => window.__L5R_TEST__.R458.ELEMENTS), ELEMENTS);
    });

    // ---------------- Dependant pricing ----------------
    await section('D458-DEP', 'Dependant prices exactly the agreed amount', async () => {
      await reset(page);
      for (const points of [1, 2, 3, 4, 5, 6, 7, 12, 40]) {
        equal(`D458-DEP-${points}`, `An agreed ${points} awards ${points} XP`,
          (await resolve(page, 'Dependant', { type: 'rankPick', points }))?.cost, points);
      }
      // "Roughly 2-6" is guidance in the catalogue text. The audit is explicit that it must not
      // become a legal range, so 1 and 40 above are accepted deliberately, not by oversight.
      equal('D458-DEP-NOLADDER', 'No ladder is enforced: 1 and 40 both price at face value',
        await page.evaluate(() => {
          const D = window.__L5R_TEST__.D45;
          return [D.resolve('Dependant', { type: 'rankPick', points: 1 }).cost,
            D.resolve('Dependant', { type: 'rankPick', points: 40 }).cost];
        }), [1, 40]);
      equal('D458-DEP-REJECT', 'Zero, negative, fractional, empty and non-numeric are all refused',
        await page.evaluate(() => [0, -2, 2.5, '', 'three', null, undefined].map(points =>
          window.__L5R_TEST__.D45.resolve('Dependant', { type: 'rankPick', points }))),
        [null, null, null, null, null, null, null]);
    });

    // ---------------- No silent default ----------------
    await section('D458-DEFAULT', 'No silent 2-point default', async () => {
      await reset(page);
      await page.evaluate(() => {
        const select = document.getElementById('disadvQuickAdd');
        select.value = 'Dependant';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await page.waitForTimeout(150);
      await page.click('#advConfigCancel').catch(() => {});
      await page.evaluate(() => window.__L5R_TEST__.recalcAll());
      const row = await rowFor(page, 'Dependant');
      // The catalogue row carries cost:2. The audit requires that NOT to become a provisional
      // price, which is 209.8's own stated rule and the same one Unlucky now follows.
      equal('D458-DEFAULT-01', 'An unconfigured Dependant awards 0, not the catalogue 2',
        row && row.cost, '0');
      record('D458-DEFAULT-02', '…and says so rather than showing a number it did not earn',
        !!(row && row.warn && /Needs a choice/.test(row.warn)), row && row.warn);
    });

    // ---------------- Dependant through the real modal ----------------
    await section('D458-MODAL', 'Dependant through the real modal', async () => {
      await reset(page);
      await configureDependant(page, 4);
      const row = await rowFor(page, 'Dependant');
      equal('D458-MODAL-01', 'Confirming the modal prices the row', row && row.cost, '4');
      record('D458-MODAL-02', 'The summary states the amount and that it is an agreement',
        !!(row && /Agreed at 4 points/.test(row.summary) && /agreement with the GM/.test(row.summary)),
        row && row.summary);
      // D45.confirm() would have written 'Rank undefined' into the legacy value field, because
      // this entry's number is `points`. The finalize hook is what stops that.
      equal('D458-MODAL-03', 'The legacy value field reads the amount, not "Rank undefined"',
        JSON.parse((await rowFor(page, 'Dependant')).config).value, '4 points');
      equal('D458-MODAL-04', 'Both optional fields render, and both start empty',
        row && row.inputs, ['', '']);
    });

    // ---------------- The optional fields are genuinely optional ----------------
    await section('D458-OPTIONAL', 'Optional fields', async () => {
      await reset(page);
      await configureDependant(page, 3);
      equal('D458-OPTIONAL-01', 'A Dependant with neither field filled is fully configured',
        (await rowFor(page, 'Dependant')).cost, '3');
      await page.evaluate(() => {
        const input = document.querySelector('.dep458-input');
        input.value = 'My aged mother Hitomi';
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await page.waitForTimeout(120);
      const named = await rowFor(page, 'Dependant');
      record('D458-OPTIONAL-02', 'A name commits on change and reaches the summary',
        /My aged mother Hitomi/.test(named.summary || ''), named.summary);
      equal('D458-OPTIONAL-03', '…and survives the re-render it triggers',
        named.inputs[0], 'My aged mother Hitomi');
      equal('D458-OPTIONAL-04', 'Filling a name does not change the award',
        named.cost, '3');
      await page.evaluate(() => {
        const inputs = document.querySelectorAll('.dep458-input');
        inputs[1].value = 'Two koku a month, sent to Shiro Hitomi';
        inputs[1].dispatchEvent(new Event('change', { bubbles: true }));
      });
      await page.waitForTimeout(120);
      const both = await rowFor(page, 'Dependant');
      equal('D458-OPTIONAL-05', 'Both fields hold independently',
        both.inputs, ['My aged mother Hitomi', 'Two koku a month, sent to Shiro Hitomi']);
      await page.evaluate(() => {
        const input = document.querySelector('.dep458-input');
        input.value = '';
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await page.waitForTimeout(120);
      const cleared = await rowFor(page, 'Dependant');
      equal('D458-OPTIONAL-06', 'Clearing a name back to blank is allowed, and keeps the award',
        [cleared.inputs[0], cleared.cost], ['', '3']);
    });

    // ---------------- Wrath pricing ----------------
    await section('D458-WRATH', 'Wrath of the Kami', async () => {
      await reset(page);
      for (const element of ELEMENTS) {
        equal(`D458-WRATH-${element}`, `${element} is offered and awards 3 for a non-Shugenja`,
          (await resolve(page, 'Wrath of the Kami', { type: 'elementPick', element }))?.cost, 3);
      }
      equal('D458-WRATH-REJECT', 'Universal and unknown values are refused',
        await page.evaluate(() => ['Universal', 'Shadow', '', null, 'fire'].map(element =>
          window.__L5R_TEST__.D45.resolve('Wrath of the Kami', { type: 'elementPick', element }))),
        [null, null, null, null, null]);
    });

    await section('D458-SHUG', 'The Shugenja award', async () => {
      await reset(page);
      await identity(page, { f_school: 'Isawa Shugenja', f_clan: 'Phoenix' });
      const casterLocked = await page.evaluate(() => window.__L5R_TEST__.D45.state().shugenja);
      record('D458-SHUG-00', 'The fixture really is a Shugenja before the award is read', casterLocked);
      equal('D458-SHUG-01', 'A Shugenja is awarded 4 rather than 3',
        (await resolve(page, 'Wrath of the Kami', { type: 'elementPick', element: 'Water' }))?.cost, 4);
      await reset(page);
      equal('D458-SHUG-02', 'A non-Shugenja is awarded 3',
        (await resolve(page, 'Wrath of the Kami', { type: 'elementPick', element: 'Water' }))?.cost, 3);
      // Elemental Imbalance REQUIRES a Shugenja School; this entry does not. Being a shugenja is
      // a price difference here, never an eligibility gate — the two must not be confused
      // because both are elementPick.
      record('D458-SHUG-03', 'A bushi may take Wrath of the Kami, unlike Elemental Imbalance',
        (await resolve(page, 'Wrath of the Kami', { type: 'elementPick', element: 'Air' })) !== null
        && (await resolve(page, 'Elemental Imbalance', { type: 'elementPick', rank: 1, element: 'Air' })) === null);
    });

    // ---------------- Wrath through the real modal ----------------
    await section('D458-WMODAL', 'Wrath through the real modal', async () => {
      await reset(page);
      await configureWrath(page, 'Fire');
      const row = await rowFor(page, 'Wrath of the Kami');
      equal('D458-WMODAL-01', 'Confirming the modal prices the row', row && row.cost, '3');
      record('D458-WMODAL-02', 'The badge names the element and the Free Raise',
        /Incoming Fire: caster gains one Free Raise/.test(row.badge || ''), row && row.badge);
      record('D458-WMODAL-03', 'The summary says the player own casting is unchanged',
        /own casting, spell slots and Rings are unchanged/.test(row.summary || ''), row && row.summary);
      equal('D458-WMODAL-04', 'The stored element round-trips through the modal',
        JSON.parse(row.config).element, 'Fire');
    });

    // ---------------- Isolation: the elementPick type is shared, the gate is not ----------------
    await section('D458-ISOLATION', 'Sharing elementPick shares nothing else', async () => {
      await reset(page);
      const before = await snapshot(page);
      await configureWrath(page, 'Water');
      const after = await snapshot(page);
      const changed = diffPaths(before, after).filter(p => !/^\/disadv\//.test(p)).sort();
      // Taking a 3-point Disadvantage is SUPPOSED to move the XP totals — that is the award, and
      // a first cut of this check that expected nothing at all to change was wrong rather than
      // revealing. What must not move is anything else, and in particular anything to do with
      // the player's OWN casting: spell slots, Rings, Void. So the assertion is that the two XP
      // totals are the complete list.
      equal('D458-ISOLATION-01', 'Outside its own row, the XP totals are the ONLY things that move',
        changed, ['/fields/f_xpRemain', '/fields/f_xpSpent']);
      equal('D458-ISOLATION-01B', '…and they move by exactly the 3 XP it awards',
        await page.evaluate(() => ({
          spent: document.getElementById('f_xpSpent').value,
          remain: document.getElementById('f_xpRemain').value,
        })), { spent: '-3', remain: '43' });
      // Elemental Imbalance's gate is name-keyed. If reusing its type string had imported it,
      // this would either throw or leave a gate overlay open.
      equal('D458-ISOLATION-02', 'No Willpower gate is armed by this entry',
        await page.evaluate(() => {
          const D = window.__L5R_TEST__.D45;
          const active = D.active('Wrath of the Kami');
          return active.map(a => [a.effect.name, a.effect.tn === undefined, !!a.effect.element]);
        }), [['Wrath of the Kami', true, true]]);
      record('D458-ISOLATION-03', 'Its resolved effect carries no TN of any kind',
        await page.evaluate(() => {
          const e = window.__L5R_TEST__.D45.resolve('Wrath of the Kami', { type: 'elementPick', element: 'Earth' });
          return e && e.tn === undefined && e.rank === undefined;
        }));
    });

    // ---------------- Persistence ----------------
    await section('D458-PERSIST', 'Persistence', async () => {
      await reset(page);
      await configureDependant(page, 5);
      await page.evaluate(() => {
        const input = document.querySelector('.dep458-input');
        input.value = 'My blinded sister';
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await page.waitForTimeout(120);
      await configureWrath(page, 'Void');
      const saved = await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
      await reset(page);
      await page.evaluate(json => { window.__L5R_TEST__.applyData(JSON.parse(json)); }, saved);
      await page.waitForTimeout(200);
      const dep = await rowFor(page, 'Dependant');
      const wrath = await rowFor(page, 'Wrath of the Kami');
      equal('D458-PERSIST-01', 'Dependant restores its agreed amount', dep && dep.cost, '5');
      equal('D458-PERSIST-02', '…and its optional name', dep && dep.inputs[0], 'My blinded sister');
      equal('D458-PERSIST-03', 'Wrath restores its element and award',
        [wrath && wrath.cost, JSON.parse(wrath.config).element], ['3', 'Void']);
    });

    // ---------------- Geometry ----------------
    // Written only after measuring BOTH builds. The inputs are 303px wide either way, so their
    // width is deliberately NOT asserted: that is the check that could not go red, and it cost
    // two earlier phases a round each.
    await section('D458-GEOM', 'Geometry at 375px', async () => {
      await reset(page);
      await configureDependant(page, 4);
      await configureWrath(page, 'Fire');
      const geom = await page.evaluate(() => {
        const rects = Array.from(document.querySelectorAll('.dep458-input')).map(i => i.getBoundingClientRect());
        const badge = document.querySelector('.wrath458-badge');
        const br = badge.getBoundingClientRect();
        const cs = getComputedStyle(badge);
        const fields = document.querySelector('.dep458-fields');
        return {
          gap: rects.length === 2 ? Math.round(rects[1].top - rects[0].bottom) : null,
          display: getComputedStyle(fields).display,
          badgeH: Math.round(br.height),
          transparent: cs.backgroundColor === 'rgba(0, 0, 0, 0)',
          overflow: rects.some(r => r.width > 375),
        };
      });
      equal('D458-GEOM-01', 'The two optional fields are a spaced column, not two touching rows',
        [geom.display, geom.gap], ['flex', 6]);
      record('D458-GEOM-02', 'The badge reads as a badge rather than as more summary text',
        geom.badgeH >= 24 && !geom.transparent, JSON.stringify(geom));
      record('D458-GEOM-03', 'Nothing overflows the 375px viewport', !geom.overflow, JSON.stringify(geom));
    });

    const registryAfter = await page.evaluate(() =>
      window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.map(m => [m.id, m.priority]));
    equal('D458-REGISTRY-01', 'Neither entry takes a pre-roll modifier seat',
      registryAfter, registryBefore);
    record('D458-ERRORS', 'No uncaught browser errors', errors.length === 0, errors.join('\n'));
  } finally { await browser.close(); }
}

main().catch(e => record('D458-FATAL', 'Harness initialization', false, String(e.stack || e))).finally(() => {
  const passed = results.filter(r => r.pass).length;
  console.table(results.filter(r => !r.pass));
  console.log(`\n${passed}/${results.length} checks passed`);
  console.log('D458_QA_RESULT=' + JSON.stringify({ total: results.length, passed, failed: results.length - passed }));
  process.exitCode = passed === results.length ? 0 : 1;
});
