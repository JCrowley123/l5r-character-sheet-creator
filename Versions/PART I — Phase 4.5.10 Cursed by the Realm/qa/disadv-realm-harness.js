/*
 * Phase 4.5.10 — Cursed by the Realm (D01) — browser validation.
 *
 * Run: node disadv-realm-harness.js <sheet.html>
 *
 * Ten realms behind one catalogue row, so the suite is mostly a MATRIX rather than a list. The
 * checks that earn their place are the negative ones, and four exist because of something that
 * was measured rather than assumed:
 *
 *  - REALM4510-DAMAGE-01. This phase reaches the pipeline through D45.modules, and D45.modifiers()
 *    returns early for ROLL_KINDS.DAMAGE BEFORE it consults that table — so the damage exclusion
 *    is inherited rather than coded here. That is a better guarantee than a filter, and exactly
 *    why it is asserted: inherited protection that nobody checks is protection a later refactor
 *    removes in silence. Feature 4.5.9's ROLLBACK names the damage leak as the single easiest way
 *    to get this convention wrong, because a damage context carries the same skillName as the
 *    attack before it. That precise case is driven here.
 *
 *  - REALM4510-SEAT-01. This phase takes NO registry seat and re-registers NOTHING — unlike
 *    Feature 4.5.9, which had to replace Phase 4.5's own contributor. Phase 1.5 (Part G)
 *    baselined that registry, so its exact contents are asserted.
 *
 *  - REALM4510-GEOM-*. Written only AFTER measuring the live and stylesheet-dropped builds side
 *    by side. One thing that looked assertable is deliberately NOT asserted: `.d45-toggle-label`
 *    is identical in both builds because Feature 4.5.2 owns it.
 *
 *  - REALM4510-GEOM-05. Second pass, 17 September 2026: Toshigoku's check button was shortened
 *    to "Check (TN 15)" and given compact sizing on request, to TRY to share the badge's line
 *    rather than always wrap below it. Nothing here forces which line it lands on — the row's
 *    own `gap` supplies correct spacing either way — so this check accepts BOTH outcomes and
 *    asserts the one invariant that must hold regardless: no stray offset. On the same line, the
 *    gap after the badge must be the row's own baseline gap (roughly 8px), not larger or smaller;
 *    wrapped to its own line, it must be flush left. That is deliberately a real-device-agnostic
 *    assertion — this sandbox's font is not proof the button fits on the reporting device's.
 *
 *  - REALM4510-DECLARE-*. Maigo no Musha must never be left armed. The declaration is asserted to
 *    be absent from the saved config and to reset when a preview opens or is cancelled.
 *
 * The input build is never modified.
 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const { pathToFileURL } = require('url');

const PHONE = { width: 375, height: 812 };
const SCHOOL = 'Hida Bushi';
const SHUGENJA_SCHOOL = 'Isawa Shugenja';
const ENTRY = 'Cursed by the Realm';
const REALMS = ['Chikushudo', 'Gaki-do', 'Jigoku', 'Maigo no Musha', 'Meido',
  'Sakkaku', 'Tengoku', 'Toshigoku', 'Yomi', 'Yume-do'];

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
function truthy(id, name, value, detail) {
  record(id, name, !!value, !!value ? (detail || '') : `got ${JSON.stringify(value)}`);
}
async function section(id, name, fn) {
  try { await fn(); } catch (e) { record(id, name, false, String(e.stack || e)); }
}

const reset = (page, school = SCHOOL) => page.evaluate(school => {
  const T = window.__L5R_TEST__;
  if (T.D45 && T.D45.gates) T.D45.gates.cancel();
  T.resetToBaseline();
  const el = document.getElementById('f_school');
  el.value = school;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  T.recalcAll();
  ['advConfigModalOverlay', 'rollPreviewOverlay', 'rollModalOverlay', 'appConfirmOverlay']
    .forEach(id => { const e = document.getElementById(id); if (e) e.style.display = 'none'; });
}, school);

// Adds the entry the way the UI does, then writes its config. Returns what the ROW shows, so a
// modifier that is computed correctly and never reaches the player still fails.
const addRealm = (page, realm, extra) => page.evaluate(({ entry, realm, extra }) => {
  const T = window.__L5R_TEST__;
  document.getElementById('addDisadv').click();
  const div = document.getElementById('disadvList').lastElementChild;
  div.querySelector('.en-name').value = entry;
  div.querySelector('.en-name').dispatchEvent(new Event('change', { bubbles: true }));
  const cfg = Object.assign({ type: 'realmPick', realm }, extra || {});
  if (T.D45.schema(entry) && T.D45.schema(entry).finalize) T.D45.schema(entry).finalize(cfg);
  div.dataset.advConfig = JSON.stringify(cfg);
  T.recalcAll();
  const row = div.querySelector('.adv-config-row');
  const badge = row && row.querySelector('.realm4510-badge');
  return {
    cost: div.querySelector('.en-cost').value,
    badge: badge ? badge.textContent : null,
    summary: row && row.querySelector('.d45-summary') ? row.querySelector('.d45-summary').textContent : null,
    hasToggle: !!(row && row.querySelector('.d45-toggle-label')),
    hasCheckBtn: !!(row && row.querySelector('button.realm4510-check')),
    hasFlag: !!(row && row.querySelector('.realm4510-flag')),
    stored: JSON.parse(div.dataset.advConfig),
  };
}, { entry: ENTRY, realm, extra });

const clearEntries = page => page.evaluate(() => {
  document.querySelectorAll('#disadvList .entry, #advList .entry').forEach(d => d.remove());
  window.__L5R_TEST__.recalcAll();
});

// Asks the REAL pipeline what it contributes for a given roll kind.
const modsFor = (page, kind, extra) => page.evaluate(({ kind, extra, entry }) => {
  const T = window.__L5R_TEST__;
  return T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS[kind], extra))
    .filter(m => m.label === entry)
    .map(m => ({ rolledDelta: m.rolledDelta, keptDelta: m.keptDelta, totalDelta: m.totalDelta, note: m.note }));
}, { kind, extra, entry: ENTRY });

// Drives a real roll end to end through Phase 3's preview gate.
async function realRoll(page, kind, ctxExtra, rolled, kept) {
  const done = page.evaluate(({ kind, ctxExtra, rolled, kept }) => {
    const T = window.__L5R_TEST__;
    return T.rollWithModifiers('Realm harness roll',
      T.makeRollContext(T.ROLL_KINDS[kind], ctxExtra), rolled, kept, {});
  }, { kind, ctxExtra, rolled, kept });
  const go = await page.waitForSelector('#rollPreviewGo', { state: 'visible', timeout: 6000 }).catch(() => null);
  if (go) await go.click();
  await done;
  await page.waitForSelector('#rollTotalDisplay', { state: 'attached', timeout: 6000 });
  return page.evaluate(() => {
    const kept = Array.from(document.querySelectorAll('#rollDiceRow .roll-die.kept'))
      .reduce((sum, d) => sum + (parseInt(d.dataset.total, 10) || 0), 0);
    return {
      kept,
      shown: parseInt(document.getElementById('rollTotalDisplay').textContent, 10),
      breakdown: document.getElementById('rollModalBody').textContent,
    };
  });
}

// Opens the preview WITHOUT confirming, so the declaration block can be inspected.
//
// The pending roll is returned WRAPPED IN AN OBJECT, and that is load-bearing rather than style.
// `rollWithModifiers` only settles once the preview is confirmed or cancelled, so the promise is
// deliberately left in flight here. An `async` function that RETURNS that promise has it awaited
// by its own caller — `await openPreview(...)` would then block until a roll nobody has confirmed
// yet completes, which is exactly how the first cut of this harness hung until the outer timeout
// killed it and reported six unrelated sections as failures. Wrapping it keeps it unawaited.
async function openPreview(page, kind, ctxExtra) {
  const pending = page.evaluate(({ kind, ctxExtra }) => {
    const T = window.__L5R_TEST__;
    return T.rollWithModifiers('Realm declare probe',
      T.makeRollContext(T.ROLL_KINDS[kind], ctxExtra), 5, 3, {});
  }, { kind, ctxExtra });
  const opened = await page.waitForSelector('#rollPreviewGo', { state: 'visible', timeout: 6000 })
    .catch(() => null);
  return { pending, opened: !!opened };
}
async function cancelPreview(page, handle) {
  const cancel = await page.$('#rollPreviewCancel');
  if (cancel) await cancel.click();
  // Never wait unbounded on a preview that may not have opened: a hang here is indistinguishable
  // from a failure and takes every later section down with it.
  await Promise.race([
    handle.pending.catch(() => null),
    new Promise(r => setTimeout(r, 5000)),
  ]);
}

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error('usage: node disadv-realm-harness.js <sheet.html>');
  const url = pathToFileURL(path.resolve(file)).href;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: PHONE });
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e)));
  await page.goto(url);
  await page.waitForFunction(() => !!window.__L5R_TEST__, null, { timeout: 30000 });

  // ---------------- Wiring ----------------
  await section('REALM4510-WIRE', 'Wiring and contracts', async () => {
    truthy('REALM4510-WIRE-01', 'The seam exports this phase and its kill-switch is on',
      await page.evaluate(() => !!window.__L5R_TEST__.R4510 && window.__L5R_TEST__.DISADV_REALM_ENABLED === true));
    equal('REALM4510-WIRE-02', 'The entry has a schema, of this phase’s own new type',
      await page.evaluate(e => { const s = window.__L5R_TEST__.D45.schema(e); return s ? s.type : null; }, ENTRY),
      'realmPick');
    // CROSS-PHASE FIXTURE CORRECTION, Part I Feature 4.5.11, declared in that phase's ROLLBACK.md.
    // This phase's own addition is what is under test and is asserted directly below; what a LATER
    // phase appends after it is not this check's business, so the tail is conditional in the same
    // shape this phase introduced for 4.5.2's, 4.5.8's and 4.5.9's suites. It therefore reads
    // identically with 4.5.11 in the build and with it surgically removed.
    const laterTypes4510 = await page.evaluate(() => (typeof window.__L5R_TEST__.F4511 === 'object'
      && !!window.__L5R_TEST__.F4511) ? ['fortunePick'] : []);
    equal('REALM4510-WIRE-03', 'realmPick joins D45.configTypes without displacing the twelve',
      await page.evaluate(() => window.__L5R_TEST__.D45.configTypes),
      ['tierPick', 'rankPick', 'elementPick', 'tenetPick', 'targetPick', 'insightDifferencePick',
        'toggleModifier', 'statusLinked', 'dualTierPick', 'languagePick', 'skillPick',
        'clanWeaponAutoPick', 'realmPick'].concat(laterTypes4510));
    truthy('REALM4510-WIRE-04', 'Its modifiers are reached through D45.modules, not a new seat',
      await page.evaluate(() => !!window.__L5R_TEST__.D45.modules.realm4510));
    equal('REALM4510-WIRE-05', 'All ten of Core p.158’s realms are offered',
      await page.evaluate(() => window.__L5R_TEST__.R4510.realmNames()), REALMS);
    // No new registry seat, and nothing re-registered. Phase 1.5 (Part G) baselined this registry.
    // SORTED deliberately: the live order is priority-derived, not the order Phase 1.5's prose
    // lists, and asserting the prose order failed on the first run for a difference that means
    // nothing (209.8 notes that priority only orders the printed breakdown -- addition is
    // commutative). What matters, and what this asserts, is the exact SET and its size.
    equal('REALM4510-SEAT-01', 'The pre-roll registry is untouched at seven seats',
      await page.evaluate(() => window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.map(m => m.id).sort()),
      ['adv-config', 'arrow', 'offhand', 'range', 'stance', 'void', 'wounds']);
  });

  // ---------------- XP ----------------
  await section('REALM4510-XP', 'Award, including the Shugenja price', async () => {
    await reset(page);
    const costs = {};
    for (const realm of REALMS) {
      await clearEntries(page);
      costs[realm] = (await addRealm(page, realm, realmExtra(realm))).cost;
    }
    equal('REALM4510-XP-01', 'Every realm awards 4 for a non-Shugenja',
      costs, REALMS.reduce((o, r) => { o[r] = '4'; return o; }, {}));

    await reset(page, SHUGENJA_SCHOOL);
    await clearEntries(page);
    const shugenja = await addRealm(page, 'Gaki-do');
    equal('REALM4510-XP-02', 'A Shugenja is awarded 5 instead', shugenja.cost, '5');
    truthy('REALM4510-XP-03', 'The Shugenja branch reads the sheet’s own caster lock',
      await page.evaluate(() => window.__L5R_TEST__.D45.state().shugenja === true));

    await reset(page);
    await clearEntries(page);
    const unconfigured = await page.evaluate(entry => {
      const T = window.__L5R_TEST__;
      document.getElementById('addDisadv').click();
      const div = document.getElementById('disadvList').lastElementChild;
      div.querySelector('.en-name').value = entry;
      div.querySelector('.en-name').dispatchEvent(new Event('change', { bubbles: true }));
      T.recalcAll();
      const row = div.querySelector('.adv-config-row');
      return { cost: div.querySelector('.en-cost').value, text: row ? row.textContent : '' };
    }, ENTRY);
    equal('REALM4510-XP-04', 'An unconfigured row prices at 0, not the catalogue’s 4',
      unconfigured.cost, '0');
    truthy('REALM4510-XP-05', '…and says so rather than showing a provisional price',
      /Needs a choice/i.test(unconfigured.text), unconfigured.text.slice(0, 60));
  });

  // ---------------- Configuration ----------------
  await section('REALM4510-CFG', 'Configuration shape', async () => {
    equal('REALM4510-CFG-01', 'Every realm resolves to a costed effect',
      await page.evaluate(({ entry, realms }) => realms.map(realm => {
        const cfg = { type: 'realmPick', realm };
        const s = window.__L5R_TEST__.D45.schema(entry);
        if (s.finalize) s.finalize(cfg);
        const r = window.__L5R_TEST__.D45.resolve(entry, cfg);
        return r ? r.cost : null;
      }), { entry: ENTRY, realms: REALMS }), REALMS.map(() => 4));

    equal('REALM4510-CFG-02', 'An unknown realm is refused rather than priced',
      await page.evaluate(e => window.__L5R_TEST__.D45.resolve(e, { type: 'realmPick', realm: 'Ningen-do' }), ENTRY),
      null);

    equal('REALM4510-CFG-03', 'A toggle realm is incomplete until its boolean exists',
      await page.evaluate(e => {
        const T = window.__L5R_TEST__, s = T.D45.schema(e);
        return [
          T.D45.complete(s, { type: 'realmPick', realm: 'Tengoku' }),
          T.D45.complete(s, { type: 'realmPick', realm: 'Tengoku', inTemple: false }),
          T.D45.complete(s, { type: 'realmPick', realm: 'Gaki-do' }),
        ];
      }, ENTRY), [false, true, true]);

    equal('REALM4510-CFG-04', 'Changing realm drops the previous realm’s toggle',
      await page.evaluate(e => {
        const cfg = { type: 'realmPick', realm: 'Chikushudo', inTemple: true, inTrance: true };
        window.__L5R_TEST__.D45.schema(e).finalize(cfg);
        return Object.keys(cfg).sort();
      }, ENTRY), ['realm', 'type', 'value']);

    equal('REALM4510-CFG-05', 'finalize keeps the legacy display field honest, not "Rank undefined"',
      await page.evaluate(e => {
        const cfg = { type: 'realmPick', realm: 'Yomi' };
        window.__L5R_TEST__.D45.schema(e).finalize(cfg);
        return cfg.value;
      }, ENTRY), 'Yomi');
  });

  // ---------------- Scope: the matrix ----------------
  const KINDS = ['SKILL', 'ATTACK', 'TRAIT', 'RING', 'SPELL', 'MANUAL', 'INITIATIVE', 'DAMAGE'];

  await section('REALM4510-CHIKUSHUDO', 'Chikushudo — one named Skill, always on', async () => {
    await reset(page); await clearEntries(page);
    await addRealm(page, 'Chikushudo');
    equal('REALM4510-CHIKUSHUDO-01', 'Animal Handling takes −1k1',
      (await modsFor(page, 'SKILL', { skillName: 'Animal Handling', traitName: 'Awareness' }))
        .map(m => [m.rolledDelta, m.keptDelta, m.totalDelta]), [[-1, -1, 0]]);
    equal('REALM4510-CHIKUSHUDO-02', 'Another Skill is untouched',
      await modsFor(page, 'SKILL', { skillName: 'Hunting', traitName: 'Perception' }), []);
    // Awareness, not Perception — measured. If this ever changes, Meido and Chikushudo overlap.
    equal('REALM4510-CHIKUSHUDO-03', 'Animal Handling rolls on Awareness, so Meido cannot overlap it',
      await page.evaluate(() => (window.__L5R_TEST__.SKILL_LIBRARY.find(s => s.name === 'Animal Handling') || {}).trait),
      'Awareness');
  });

  await section('REALM4510-MEIDO', 'Meido — sustained, scoped by the roll’s own Trait', async () => {
    await reset(page); await clearEntries(page);
    await addRealm(page, 'Meido', { inTrance: true });
    equal('REALM4510-MEIDO-01', 'A Perception-based Skill roll takes −1k0',
      (await modsFor(page, 'SKILL', { skillName: 'Hunting', traitName: 'Perception' }))
        .map(m => [m.rolledDelta, m.keptDelta, m.totalDelta]), [[-1, 0, 0]]);
    equal('REALM4510-MEIDO-02', 'The Perception Trait Roll itself takes it too',
      (await modsFor(page, 'TRAIT', { traitName: 'Perception' }))
        .map(m => [m.rolledDelta, m.keptDelta, m.totalDelta]), [[-1, 0, 0]]);
    equal('REALM4510-MEIDO-03', 'Another Trait is untouched',
      await modsFor(page, 'TRAIT', { traitName: 'Agility' }), []);
    // The oracle is the sheet's own library, not a list retyped here.
    equal('REALM4510-MEIDO-04', 'Every Perception Skill the library defines is covered',
      await page.evaluate(() => {
        const T = window.__L5R_TEST__;
        return T.SKILL_LIBRARY.filter(s => s.trait === 'Perception').map(s =>
          T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.SKILL,
            { skillName: s.name, traitName: s.trait })).filter(m => m.label === 'Cursed by the Realm').length);
      }), await page.evaluate(() =>
        window.__L5R_TEST__.SKILL_LIBRARY.filter(s => s.trait === 'Perception').map(() => 1)));
    await clearEntries(page);
    await addRealm(page, 'Meido', { inTrance: false });
    equal('REALM4510-MEIDO-05', 'Out of the trance it applies nothing',
      await modsFor(page, 'SKILL', { skillName: 'Hunting', traitName: 'Perception' }), []);
  });

  await section('REALM4510-TENGOKU', 'Tengoku — the TN convention’s second consumer', async () => {
    await reset(page); await clearEntries(page);
    await addRealm(page, 'Tengoku', { inTemple: true });
    const matrix = {};
    for (const kind of KINDS) {
      matrix[kind] = (await modsFor(page, kind, { skillName: 'Hunting', traitName: 'Perception' }))
        .map(m => m.totalDelta);
    }
    equal('REALM4510-TENGOKU-01', 'It reaches the five supported roll kinds and no others',
      matrix, { SKILL: [-10], ATTACK: [-10], TRAIT: [-10], RING: [-10], SPELL: [-10],
        MANUAL: [-10], INITIATIVE: [-10], DAMAGE: [] });
    equal('REALM4510-TENGOKU-02', 'It moves no dice in either direction, only the total',
      (await modsFor(page, 'SKILL', { skillName: 'Hunting' })).map(m => [m.rolledDelta, m.keptDelta]),
      [[0, 0]]);
    truthy('REALM4510-TENGOKU-03', 'The note carries the RULE, not a bare number',
      (await modsFor(page, 'SKILL', { skillName: 'Hunting' })).every(m => /TN \+10/.test(m.note)),
      (await modsFor(page, 'SKILL', { skillName: 'Hunting' })).map(m => m.note).join(' | '));
    await clearEntries(page);
    await addRealm(page, 'Tengoku', { inTemple: false });
    equal('REALM4510-TENGOKU-04', 'Outside the temple it applies nothing',
      await modsFor(page, 'SKILL', { skillName: 'Hunting' }), []);
  });

  // The headline negative check. See the file header.
  await section('REALM4510-DAMAGE', 'Damage is never adjusted, by any branch', async () => {
    await reset(page);
    const rows = {};
    for (const [realm, extra] of [['Chikushudo', null], ['Meido', { inTrance: true }],
      ['Tengoku', { inTemple: true }], ['Maigo no Musha', null]]) {
      await clearEntries(page);
      await addRealm(page, realm, extra);
      if (realm === 'Maigo no Musha') await page.evaluate(() => window.__L5R_TEST__.R4510.declarationSet(true));
      // The exact trap: a DAMAGE context carrying the SAME skillName as the attack before it.
      rows[realm] = await modsFor(page, 'DAMAGE', { skillName: 'Animal Handling', traitName: 'Perception' });
      await page.evaluate(() => window.__L5R_TEST__.R4510.declarationReset());
    }
    equal('REALM4510-DAMAGE-01', 'No branch contributes to a damage roll carrying the attack’s skillName',
      rows, { 'Chikushudo': [], 'Meido': [], 'Tengoku': [], 'Maigo no Musha': [] });
    truthy('REALM4510-DAMAGE-02', 'D45 excludes damage BEFORE consulting this phase’s module',
      await page.evaluate(() => {
        const T = window.__L5R_TEST__;
        let reached = false;
        const real = T.D45.modules.realm4510.modifiers;
        T.D45.modules.realm4510 = { modifiers(ctx) { reached = true; return real(ctx); } };
        T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.DAMAGE, { skillName: 'Animal Handling' }));
        T.D45.modules.realm4510 = { modifiers: real };
        return reached === false;
      }));
  });

  // ---------------- The reported total, through a real roll ----------------
  await section('REALM4510-TOTAL', 'What the player actually sees', async () => {
    await reset(page); await clearEntries(page);
    await addRealm(page, 'Tengoku', { inTemple: true });
    const roll = await realRoll(page, 'SKILL', { skillName: 'Hunting', traitName: 'Perception' }, 5, 3);
    equal('REALM4510-TOTAL-01', 'The displayed total is exactly 10 below the kept dice',
      roll.shown, roll.kept - 10);
    truthy('REALM4510-TOTAL-02', 'The breakdown names the temple rule rather than a bare −10',
      /TN \+10/.test(roll.breakdown), roll.breakdown.replace(/\s+/g, ' ').slice(0, 120));
  });

  // ---------------- Maigo no Musha's declaration ----------------
  await section('REALM4510-DECLARE', 'Maigo no Musha is never left armed', async () => {
    await reset(page); await clearEntries(page);
    await addRealm(page, 'Maigo no Musha');
    equal('REALM4510-DECLARE-01', 'Undeclared, it contributes nothing',
      await modsFor(page, 'ATTACK', { skillName: 'Kenjutsu', traitName: 'Agility' }), []);

    let handle = await openPreview(page, 'ATTACK', { skillName: 'Kenjutsu', traitName: 'Agility' });
    const box = await page.$('[data-realm4510-declare]');
    truthy('REALM4510-DECLARE-02', 'The preview offers the declaration', handle.opened && !!box);
    equal('REALM4510-DECLARE-03', '…unchecked when the preview opens',
      await page.evaluate(() => { const b = document.querySelector('[data-realm4510-declare]'); return b ? b.checked : null; }),
      false);
    if (box) await box.click();
    equal('REALM4510-DECLARE-04', 'Ticking it arms this roll only',
      await page.evaluate(() => window.__L5R_TEST__.R4510.declarationPending()), true);
    await cancelPreview(page, handle);
    equal('REALM4510-DECLARE-05', 'Cancelling the preview disarms it',
      await page.evaluate(() => window.__L5R_TEST__.R4510.declarationPending()), false);

    // Arm it, then open a FRESH preview: the start hook must clear it rather than carry it over.
    await page.evaluate(() => window.__L5R_TEST__.R4510.declarationSet(true));
    handle = await openPreview(page, 'ATTACK', { skillName: 'Kenjutsu', traitName: 'Agility' });
    equal('REALM4510-DECLARE-06', 'A fresh preview starts unarmed even if the last roll declared',
      await page.evaluate(() => window.__L5R_TEST__.R4510.declarationPending()), false);
    await cancelPreview(page, handle);

    equal('REALM4510-DECLARE-07', 'The declaration never enters the saved config',
      await page.evaluate(() => {
        const div = Array.from(document.querySelectorAll('#disadvList .entry'))
          .find(d => d.querySelector('.en-name').value === 'Cursed by the Realm');
        return Object.keys(JSON.parse(div.dataset.advConfig)).sort();
      }), ['realm', 'type', 'value']);

    // A character WITHOUT the realm must never see the block.
    await clearEntries(page);
    await addRealm(page, 'Gaki-do');
    handle = await openPreview(page, 'ATTACK', { skillName: 'Kenjutsu', traitName: 'Agility' });
    equal('REALM4510-DECLARE-08', 'Another realm’s character sees an unchanged preview',
      await page.evaluate(() => !!document.querySelector('[data-realm4510-declare]')), false);
    await cancelPreview(page, handle);
  });

  // ---------------- Toshigoku ----------------
  await section('REALM4510-TOSHIGOKU', 'A check the GM calls for, never the sheet', async () => {
    await reset(page); await clearEntries(page);
    const row = await addRealm(page, 'Toshigoku');
    truthy('REALM4510-TOSHIGOKU-01', 'The row offers the Willpower check', row.hasCheckBtn);
    equal('REALM4510-TOSHIGOKU-02', 'It contributes no automatic modifier to anything',
      await modsFor(page, 'TRAIT', { traitName: 'Willpower' }), []);

    const done = page.evaluate(() => window.__L5R_TEST__.R4510.toshigokuRoll());
    const go = await page.waitForSelector('#rollPreviewGo', { state: 'visible', timeout: 6000 }).catch(() => null);
    truthy('REALM4510-TOSHIGOKU-03', 'Invoking it opens a real roll preview', !!go);
    if (go) await go.click();
    await done;
    const shown = await page.evaluate(() => ({
      title: (document.getElementById('rollModalTitle') || {}).textContent || '',
      body: (document.getElementById('rollModalBody') || {}).textContent || '',
    }));
    truthy('REALM4510-TOSHIGOKU-04', 'The result reports against TN 15',
      /TN 15/.test(shown.title + shown.body), (shown.title + ' | ' + shown.body).replace(/\s+/g, ' ').slice(0, 120));
  });

  // ---------------- Yomi ----------------
  await section('REALM4510-YOMI', 'Ancestral entries are flagged, never deleted', async () => {
    await reset(page); await clearEntries(page);
    let row = await addRealm(page, 'Yomi');
    truthy('REALM4510-YOMI-01', 'With no ancestral entry it says so plainly',
      row.hasFlag && /No ancestral entries/i.test(await page.evaluate(() =>
        document.querySelector('.realm4510-flag').textContent)));

    // Add the Advantage the audit names, plus the Disadvantage the measurement found.
    for (const [listId, btnId, name] of [['advList', 'addAdv', 'Inheritance'], ['disadvList', 'addDisadv', 'Haunted']]) {
      await page.evaluate(({ btnId, name }) => {
        document.getElementById(btnId).click();
        const div = document.getElementById(btnId === 'addAdv' ? 'advList' : 'disadvList').lastElementChild;
        div.querySelector('.en-name').value = name;
        div.querySelector('.en-name').dispatchEvent(new Event('change', { bubbles: true }));
        window.__L5R_TEST__.recalcAll();
      }, { btnId, name });
    }
    const flagged = await page.evaluate(() => document.querySelector('.realm4510-flag').textContent);
    truthy('REALM4510-YOMI-02', 'It names Inheritance, the entry the audit names', /Inheritance/.test(flagged), flagged);
    truthy('REALM4510-YOMI-03', 'It names Haunted, the entry measuring the libraries found', /Haunted/.test(flagged), flagged);
    equal('REALM4510-YOMI-04', 'Nothing is deleted — both entries survive the flag',
      await page.evaluate(() => Array.from(document.querySelectorAll('#advList .entry, #disadvList .entry'))
        .map(d => d.querySelector('.en-name').value).filter(v => v === 'Inheritance' || v === 'Haunted').sort()),
      ['Haunted', 'Inheritance']);
    // The list is measured from the libraries, not retyped, so it cannot drift from them.
    equal('REALM4510-YOMI-05', 'Those two are the sheet’s ENTIRE ancestral surface',
      await page.evaluate(() => {
        const T = window.__L5R_TEST__;
        const re = /ancest|heirloom|inherit|lineage|forebear/i;
        return [].concat(T.ADV_LIBRARY || [], T.DISADV_LIBRARY || [])
          .filter(r => re.test(r.name + ' ' + (r.desc || ''))).map(r => r.name).sort();
      }), ['Haunted', 'Inheritance']);
  });

  // ---------------- Jigoku's deferral, stated rather than hidden ----------------
  await section('REALM4510-JIGOKU', 'The deferred branch is honest about being deferred', async () => {
    await reset(page); await clearEntries(page);
    const row = await addRealm(page, 'Jigoku');
    equal('REALM4510-JIGOKU-01', 'It still awards its 4 XP', row.cost, '4');
    equal('REALM4510-JIGOKU-02', 'It offers no automated check', row.hasCheckBtn, false);
    equal('REALM4510-JIGOKU-03', 'It applies no modifier to any roll kind',
      (await Promise.all(KINDS.map(k => modsFor(page, k, { skillName: 'Hunting', traitName: 'Perception' }))))
        .reduce((n, list) => n + list.length, 0), 0);
    truthy('REALM4510-JIGOKU-04', 'The row says the roll is not automated rather than implying it is',
      /NOT automated|not automated/.test(row.summary || ''), (row.summary || '').slice(0, 120));
  });

  // ---------------- Persistence ----------------
  await section('REALM4510-PERSIST', 'Round-trip', async () => {
    await reset(page); await clearEntries(page);
    await addRealm(page, 'Tengoku', { inTemple: true });
    const saved = await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
    await reset(page);
    await page.evaluate(json => window.__L5R_TEST__.applyData(JSON.parse(json)), saved);
    await page.waitForTimeout(200);
    equal('REALM4510-PERSIST-01', 'Realm, toggle state and award all survive a reload',
      await page.evaluate(() => {
        const div = Array.from(document.querySelectorAll('#disadvList .entry'))
          .find(d => d.querySelector('.en-name').value === 'Cursed by the Realm');
        const c = JSON.parse(div.dataset.advConfig);
        return [c.realm, c.inTemple, div.querySelector('.en-cost').value];
      }), ['Tengoku', true, '4']);
    equal('REALM4510-PERSIST-02', '…and it is still applying after the reload',
      (await modsFor(page, 'SKILL', { skillName: 'Hunting' })).map(m => m.totalDelta), [-10]);
  });

  // ---------------- Geometry ----------------
  // Written ONLY after measuring the live and stylesheet-dropped builds side by side. What this
  // stylesheet actually supplies is the badge's box and the flag's full-row placement; the toggle
  // label and the check button are supplied by Feature 4.5.2 and the base sheet respectively, and
  // are identical in both builds, so nothing is asserted about their size.
  await section('REALM4510-GEOM', 'Geometry at 375px', async () => {
    await reset(page); await clearEntries(page);
    await addRealm(page, 'Tengoku', { inTemple: true });
    await addRealm(page, 'Gaki-do');
    const geom = await page.evaluate(() => {
      const read = el => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height), border: cs.borderTopStyle,
          weight: cs.fontWeight, radius: cs.borderTopLeftRadius, display: cs.display }; };
      const badges = Array.from(document.querySelectorAll('.realm4510-badge'));
      return { active: read(badges[0]), reminder: read(badges[1]) };
    });
    truthy('REALM4510-GEOM-01', 'The badge reads as a badge rather than as more row text',
      geom.active.border === 'solid' && geom.active.radius !== '0px' && geom.active.display === 'flex',
      JSON.stringify(geom.active));
    truthy('REALM4510-GEOM-02', 'An automatic realm is visually distinct from a reminder-only one',
      geom.active.border !== geom.reminder.border && geom.active.weight !== geom.reminder.weight,
      JSON.stringify([geom.active, geom.reminder]));

    await clearEntries(page);
    await addRealm(page, 'Yomi');
    const flag = await page.evaluate(() => {
      const el = document.querySelector('.realm4510-flag');
      const cs = getComputedStyle(el);
      return { basis: cs.flexBasis, mt: cs.marginTop, w: Math.round(el.getBoundingClientRect().width) };
    });
    truthy('REALM4510-GEOM-03', 'The ancestral flag takes its own full row rather than trailing the badge',
      flag.basis === '100%' && flag.mt === '4px', JSON.stringify(flag));

    // REAL-DEVICE CORRECTION, 17 September 2026. Reported: Yomi's badge (solid, tinted) reads
    // inconsistently with Gaki-do's (dashed, transparent) despite neither touching a roll. It was
    // a real gap, not a deliberate choice: the quiet styling only ever covered `reminder`, and
    // Yomi's `conflict` effect had no override, falling through to the active look by omission.
    const yomiBadge = await page.evaluate(() => {
      const el = document.querySelector('.realm4510-badge');
      const cs = getComputedStyle(el);
      return { border: cs.borderTopStyle, weight: cs.fontWeight };
    });
    equal('REALM4510-GEOM-06', 'Yomi reads as quiet/reminder, matching Gaki-do, not as active',
      yomiBadge, { border: 'dashed', weight: '500' });

    // Nothing this phase adds may push its row wider than the row itself.
    const overflow = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('#disadvList .entry .adv-config-row').forEach(row => {
        const rr = row.getBoundingClientRect();
        row.querySelectorAll('.realm4510-badge, .realm4510-flag, button.realm4510-check').forEach(el => {
          if (el.getBoundingClientRect().right > rr.right + 0.5) out.push(el.className);
        });
      });
      return out;
    });
    equal('REALM4510-GEOM-04', 'No control this phase adds overflows its row at 375px', overflow, []);

    // REAL-DEVICE CORRECTION, 17 September 2026, SECOND PASS. First pass forced the button onto
    // its own line, always. On request, it now tries to share the badge's line instead -- a
    // shortened label ("Check (TN 15)") at compact sizing, measured here at 117px against 143px
    // available. Nothing forces the outcome: no custom margin exists to go stale either way, so
    // whichever line it lands on, the row's own flex `gap` is what spaces it -- correctly, by
    // construction, without this check needing to know an exact rendered width. What IS asserted
    // is the one invariant a regression could break: no STRAY offset beyond that shared gap, on
    // either line.
    await clearEntries(page);
    await addRealm(page, 'Toshigoku');
    const toshigoku = await page.evaluate(() => {
      const row = document.querySelector('#disadvList .entry .adv-config-row');
      const rr = row.getBoundingClientRect();
      const badge = row.querySelector('.realm4510-badge').getBoundingClientRect();
      const btn = row.querySelector('button.realm4510-check').getBoundingClientRect();
      const sameLine = Math.abs(btn.top - badge.top) < 4;
      return {
        sameLine,
        gapAfterBadge: sameLine ? Math.round(btn.left - badge.right) : null,
        flushLeft: sameLine ? null : Math.round(btn.left - rr.left) === 0,
      };
    });
    truthy('REALM4510-GEOM-05', 'The check button carries no stray offset on whichever line it lands',
      toshigoku.sameLine
        ? (toshigoku.gapAfterBadge >= 4 && toshigoku.gapAfterBadge <= 12)
        : toshigoku.flushLeft,
      JSON.stringify(toshigoku));
  });

  equal('REALM4510-ERRORS', 'No uncaught browser errors', pageErrors, []);

  await browser.close();
  const passed = results.filter(r => r.pass).length;
  console.log(`\nFeature 4.5.10: ${passed}/${results.length} checks passed`);
  console.log('REALM4510_RESULT=' + JSON.stringify({ passed, total: results.length }));
  if (passed !== results.length) process.exitCode = 1;
}

// Realms that own a boolean need it supplied for the entry to be complete.
function realmExtra(realm) {
  if (realm === 'Meido') return { inTrance: false };
  if (realm === 'Tengoku') return { inTemple: false };
  return null;
}

main().catch(e => { console.error(e); process.exit(1); });
