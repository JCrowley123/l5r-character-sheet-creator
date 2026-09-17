/*
 * Phase 4.5.11 — Seven Fortunes' Curse (D04a) — browser validation.
 *
 * Run: node disadv-fortune-harness.js <sheet.html>
 *
 * Five automated Fortunes plus two recorded-but-deferred ones, so this is a MATRIX like Feature
 * 4.5.10's rather than a list. The checks that earn their place are the NEGATIVE ones — the ones
 * asserting that a penalty does NOT reach a roll it must not touch — and several exist because
 * something was measured rather than assumed:
 *
 *  - F4511-DAMAGE-01. This phase reaches the pipeline through D45.modules, and D45.modifiers()
 *    returns [] for ROLL_KINDS.DAMAGE BEFORE it consults that table, so the damage exclusion is
 *    INHERITED rather than coded here. Measured again in this release: a DAMAGE context really does
 *    carry the preceding attack's skillName, so a filter on skill name alone would penalise damage.
 *    Feature 4.5.9's ROLLBACK names that as the single easiest way to get the TN convention wrong.
 *    Inherited protection that nobody checks is protection a later refactor removes in silence, so
 *    it is driven here for both a TN branch and a dice branch.
 *
 *  - F4511-EBISU-*. Ebisu is gated TWICE — by 4.5.2's Social Skill list and by a per-roll
 *    declaration — and the interesting failure is one gate silently doing nothing. Declared-on-a-
 *    non-Social-skill is therefore asserted explicitly, not just its two happy paths.
 *
 *  - F4511-EBISU-06 takes its ORACLE from Feature 4.5.2's own D45.socialSkills rather than from a
 *    list written here. Per CLAUDE.md: where a fact can be read from something this phase does not
 *    own, take it from there. A list copied into this file would agree with the code under test and
 *    with nothing else.
 *
 *  - F4511-FUKU-03. 'Folklore' contains 'Lore' and must NOT match. The regex is anchored precisely
 *    so it cannot, and the check exists because an unanchored version passes every other Lore test
 *    in this file.
 *
 *  - F4511-DAIKOKU-03. The audit's warning about Daikoku is about MONEY, not dice: "no repeated
 *    debit on recalc/load and no unexplained subtraction of money already spent in play." This
 *    phase debits nothing at all, so the assertion is that #f_koku is untouched across a config and
 *    several recalcs — the property the audit actually asked to be safe.
 *
 *  - F4511-GEOM-*. Written only AFTER measuring the live and stylesheet-dropped builds side by
 *    side, per the standing rule that three phases have shipped a geometry check that could not go
 *    red. What the base sheet already supplies is deliberately NOT asserted.
 *
 * The input build is never modified.
 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const { pathToFileURL } = require('url');

const PHONE = { width: 375, height: 812 };
const SCHOOL = 'Hida Bushi';
const ENTRY = 'Seven Fortunes’ Curse';
const FORTUNES = ['Benten', 'Bishamon', 'Daikoku', 'Ebisu', 'Fukurokujin', 'Hotei', 'Jurojin'];
const AUTOMATED = ['Benten', 'Daikoku', 'Ebisu', 'Fukurokujin', 'Jurojin'];
const DEFERRED = ['Bishamon', 'Hotei'];

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
const addFortune = (page, fortune) => page.evaluate(({ entry, fortune }) => {
  const T = window.__L5R_TEST__;
  document.getElementById('addDisadv').click();
  const div = document.getElementById('disadvList').lastElementChild;
  div.querySelector('.en-name').value = entry;
  div.querySelector('.en-name').dispatchEvent(new Event('change', { bubbles: true }));
  const cfg = { type: 'fortunePick', fortune };
  if (T.D45.schema(entry) && T.D45.schema(entry).finalize) T.D45.schema(entry).finalize(cfg);
  div.dataset.advConfig = JSON.stringify(cfg);
  T.recalcAll();
  const row = div.querySelector('.adv-config-row');
  const badge = row && row.querySelector('.fortune4511-badge');
  const note = row && row.querySelector('.fortune4511-note');
  return {
    cost: div.querySelector('.en-cost').value,
    badge: badge ? badge.textContent : null,
    note: note ? note.textContent : null,
    summary: row && row.querySelector('.d45-summary') ? row.querySelector('.d45-summary').textContent : null,
    stored: JSON.parse(div.dataset.advConfig),
  };
}, { entry: ENTRY, fortune });

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

const declare = (page, fortune, on) => page.evaluate(({ fortune, on }) => {
  window.__L5R_TEST__.F4511.declarationSet(fortune, on);
}, { fortune, on });

const declarationsReset = page => page.evaluate(() => window.__L5R_TEST__.F4511.declarationReset());

// Drives a real roll end to end through Phase 3's preview gate.
async function realRoll(page, kind, ctxExtra, rolled, kept, opts) {
  const done = page.evaluate(({ kind, ctxExtra, rolled, kept, opts }) => {
    const T = window.__L5R_TEST__;
    return T.rollWithModifiers('Fortune harness roll',
      T.makeRollContext(T.ROLL_KINDS[kind], ctxExtra), rolled, kept, opts || {});
  }, { kind, ctxExtra, rolled, kept, opts });
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
// yet completes, which is exactly how Feature 4.5.10's first harness cut hung until the outer
// timeout killed it and reported six unrelated sections as failures. Wrapping it keeps it unawaited.
function openPreview(page, kind, ctxExtra, rolled, kept) {
  const pending = page.evaluate(({ kind, ctxExtra, rolled, kept }) => {
    const T = window.__L5R_TEST__;
    return T.rollWithModifiers('Fortune preview probe',
      T.makeRollContext(T.ROLL_KINDS[kind], ctxExtra), rolled, kept, {});
  }, { kind, ctxExtra, rolled, kept });
  const opened = page.waitForSelector('#rollPreviewGo', { state: 'visible', timeout: 6000 });
  return { pending, opened };
}

(async () => {
  const sheet = process.argv[2];
  if (!sheet) { console.error('usage: node disadv-fortune-harness.js <sheet.html>'); process.exit(2); }
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: PHONE });
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e)));
  await page.goto(pathToFileURL(path.resolve(sheet)).href);
  await page.waitForFunction(() => !!window.__L5R_TEST__, null, { timeout: 20000 });

  // ---------- Presence and the public contract ----------
  await section('F4511-PRESENT', 'presence', async () => {
    const seam = await page.evaluate(() => {
      const T = window.__L5R_TEST__;
      return {
        enabled: T.DISADV_FORTUNE_ENABLED === true,
        module: typeof T.F4511 === 'object' && !!T.F4511,
        name: T.F4511 ? T.F4511.NAME : null,
        award: T.F4511 ? T.F4511.AWARD : null,
        hotei: T.F4511 ? T.F4511.AWARD_HOTEI : null,
        disadvLib: Array.isArray(T.DISADV_LIBRARY),
      };
    });
    truthy('F4511-PRESENT-01', 'The fragment is in the build and exports its module', seam.module);
    truthy('F4511-PRESENT-02', 'The kill-switch reads on', seam.enabled);
    equal('F4511-PRESENT-03', 'Installs under the catalogue row’s own name', seam.name, ENTRY);
    equal('F4511-PRESENT-04', 'Awards 3 ordinarily and 6 for Hotei', [seam.award, seam.hotei], [3, 6]);
    truthy('F4511-PRESENT-05', 'DISADV_LIBRARY is on the seam, so the catalogue row can be the oracle',
      seam.disadvLib);
  });

  // ---------- The catalogue row is the oracle, not a number written here ----------
  await section('F4511-CAT', 'catalogue', async () => {
    await reset(page);
    const row = await page.evaluate(entry => {
      const T = window.__L5R_TEST__;
      const found = (T.DISADV_LIBRARY || []).filter(e => e.name === entry);
      return { count: found.length, row: found[0] || null };
    }, ENTRY);
    equal('F4511-CAT-01', 'Exactly one catalogue row carries this name', row.count, 1);
    equal('F4511-CAT-02', 'The catalogue prices the ordinary curse at this phase’s own award',
      row.row && row.row.cost, 3);
    equal('F4511-CAT-03', 'It is filed Spiritual, as the catalogue has it', row.row && row.row.cat, 'Spiritual');

    const schema = await page.evaluate(entry => {
      const s = window.__L5R_TEST__.D45.schema(entry);
      return s ? { type: s.type, steps: s.steps().length, options: s.steps()[0].options.map(o => o.value),
        noted: s.steps()[0].options.every(o => typeof o.note === 'string' && o.note.length > 20) } : null;
    }, ENTRY);
    equal('F4511-CAT-04', 'The schema installs as a fortunePick with one step', schema && [schema.type, schema.steps],
      ['fortunePick', 1]);
    equal('F4511-CAT-05', 'All seven Fortunes are offered, including the two not yet automated',
      schema && schema.options, FORTUNES);
    truthy('F4511-CAT-06', 'Every option carries its own explanation in the picker', schema && schema.noted);

    // A straight apostrophe must still resolve. This check was written expecting to pass and did
    // not: .en-name is a free-text input, and D45's own norm() only trims and lowercases, so the
    // entry was unconfigurable for anyone who typed a straight quote. This phase is the first
    // D45 entry whose catalogue name carries a curly apostrophe at all. Fixed inside this phase's
    // own fragment by installing under both spellings — see its ROLLBACK for why D45's norm()
    // itself was left alone.
    const loose = await page.evaluate(() => !!window.__L5R_TEST__.D45.schema("Seven Fortunes' Curse"));
    truthy('F4511-CAT-07', 'A hand-typed straight apostrophe still finds the schema', loose);

    // Resolving the schema is not enough: the modifiers must actually reach a roll for an entry
    // whose row carries the straight spelling. active() is filtered on this phase's own flag
    // rather than on a name comparison precisely so that this holds.
    const straight = await page.evaluate(() => {
      const T = window.__L5R_TEST__;
      document.querySelectorAll('#disadvList .entry').forEach(d => d.remove());
      document.getElementById('addDisadv').click();
      const div = document.getElementById('disadvList').lastElementChild;
      div.querySelector('.en-name').value = "Seven Fortunes' Curse";
      div.querySelector('.en-name').dispatchEvent(new Event('change', { bubbles: true }));
      const cfg = { type: 'fortunePick', fortune: 'Benten' };
      T.D45.schema("Seven Fortunes' Curse").finalize(cfg);
      div.dataset.advConfig = JSON.stringify(cfg);
      T.recalcAll();
      const mods = T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.SKILL, { skillName: 'Etiquette' }))
        .filter(m => typeof m.note === 'string' && m.note.indexOf('Benten') === 0);
      return { cost: div.querySelector('.en-cost').value,
        badge: !!div.querySelector('.fortune4511-badge'), applied: mods.map(m => m.totalDelta) };
    });
    equal('F4511-CAT-08', 'A straight-apostrophe entry configures, prices and applies exactly as the curly one',
      straight, { cost: '3', badge: true, applied: [-10] });
    await clearEntries(page);
  });

  // ---------- Configuration, XP and the row ----------
  await section('F4511-XP', 'awards and rows', async () => {
    for (const fortune of FORTUNES) {
      await reset(page);
      await clearEntries(page);
      const shown = await addFortune(page, fortune);
      const expected = fortune === 'Hotei' ? '6' : '3';
      equal(`F4511-XP-${fortune}`, `${fortune} awards ${expected} and shows its own badge`,
        [shown.cost, shown.badge], [expected, fortune]);
    }

    await reset(page);
    await clearEntries(page);
    const benten = await addFortune(page, 'Benten');
    truthy('F4511-XP-VALUE', 'finalize keeps the legacy value field honest (never "Rank undefined")',
      benten.stored.value === 'Benten', JSON.stringify(benten.stored));
    truthy('F4511-XP-SUMMARY', 'The row summarises the rule, not just the Fortune’s name',
      (benten.summary || '').includes('Etiquette'), benten.summary);

    const bad = await page.evaluate(entry => {
      const s = window.__L5R_TEST__.D45.schema(entry);
      return {
        unknown: s.validate({ type: 'fortunePick', fortune: 'Amaterasu' }),
        missing: s.validate({ type: 'fortunePick' }),
        wrongType: s.validate({ type: 'realmPick', fortune: 'Benten' }),
        good: s.validate({ type: 'fortunePick', fortune: 'Benten' }),
      };
    }, ENTRY);
    equal('F4511-XP-VALIDATE', 'validate() refuses an unknown, missing or mistyped Fortune',
      bad, { unknown: false, missing: false, wrongType: false, good: true });
  });

  // ---------- Benten — the TN-reporting convention ----------
  await section('F4511-BENTEN', 'Benten', async () => {
    await reset(page);
    await clearEntries(page);
    await addFortune(page, 'Benten');

    const etiquette = await modsFor(page, 'SKILL', { skillName: 'Etiquette' });
    equal('F4511-BENTEN-01', 'Etiquette reports 10 lower, as a TN +10 and not as lost dice',
      etiquette, [{ rolledDelta: 0, keptDelta: 0, totalDelta: -10,
        note: 'Benten — Etiquette (TN +10)' }]);
    truthy('F4511-BENTEN-02', 'The note carries the RULE, so -10 cannot be read as a dice penalty',
      (etiquette[0] || {}).note && etiquette[0].note.includes('TN +10'));

    // Another Social Skill, to prove this is scoped to Etiquette rather than to a category.
    equal('F4511-BENTEN-03', 'Courtier is untouched — this is one Skill, not all Social Skills',
      await modsFor(page, 'SKILL', { skillName: 'Courtier' }), []);
    equal('F4511-BENTEN-04', 'A Ring roll is untouched', await modsFor(page, 'RING', { ringName: 'Air' }), []);

    // End to end: the reported total must actually come out 10 lower than the kept dice.
    const rolled = await realRoll(page, 'SKILL', { skillName: 'Etiquette', traitName: 'Awareness' }, 5, 3);
    equal('F4511-BENTEN-05', 'A real Etiquette roll reports its kept dice minus 10',
      rolled.shown, rolled.kept - 10);
  });

  // ---------- Fukurokujin — Lore, including specializations ----------
  await section('F4511-FUKU', 'Fukurokujin', async () => {
    await reset(page);
    await clearEntries(page);
    await addFortune(page, 'Fukurokujin');

    equal('F4511-FUKU-01', 'The bare Lore Skill reports 5 lower',
      await modsFor(page, 'SKILL', { skillName: 'Lore' }),
      [{ rolledDelta: 0, keptDelta: 0, totalDelta: -5, note: 'Fukurokujin — Lore (TN +5)' }]);
    equal('F4511-FUKU-02', 'A Lore specialization is included, as the audit requires',
      await modsFor(page, 'SKILL', { skillName: 'Lore: Shadowlands' }),
      [{ rolledDelta: 0, keptDelta: 0, totalDelta: -5, note: 'Fukurokujin — Lore (TN +5)' }]);
    equal('F4511-FUKU-03', 'A Skill that merely CONTAINS "Lore" does not match',
      await modsFor(page, 'SKILL', { skillName: 'Folklore' }), []);
    equal('F4511-FUKU-04', 'An unrelated Skill is untouched',
      await modsFor(page, 'SKILL', { skillName: 'Kenjutsu' }), []);

    // The specialization spelling is taken from the School library rather than invented here.
    const spellings = await page.evaluate(() => {
      const T = window.__L5R_TEST__;
      return ['Lore: Theology', 'Lore: Shadowlands', 'Lore: History'].map(n => T.F4511.isLoreSkill(n));
    });
    equal('F4511-FUKU-05', 'Every "Lore: <subject>" spelling the School library uses matches',
      spellings, [true, true, true]);
  });

  // ---------- Daikoku — dice automated, money deliberately not ----------
  await section('F4511-DAIKOKU', 'Daikoku', async () => {
    await reset(page);
    await clearEntries(page);
    const shown = await addFortune(page, 'Daikoku');

    equal('F4511-DAIKOKU-01', 'Commerce loses a rolled and a kept die',
      await modsFor(page, 'SKILL', { skillName: 'Commerce' }),
      [{ rolledDelta: -1, keptDelta: -1, totalDelta: 0, note: 'Daikoku — Commerce' }]);
    equal('F4511-DAIKOKU-02', 'Another Merchant Skill is untouched',
      await modsFor(page, 'SKILL', { skillName: 'Craft' }), []);
    truthy('F4511-DAIKOKU-03', 'The row states the starting-koku reduction the sheet will not make',
      (shown.note || '').includes('koku'), shown.note);

    // The audit's real Daikoku risk is money, not dice. Nothing here writes koku, ever.
    const koku = await page.evaluate(() => {
      const T = window.__L5R_TEST__;
      const field = document.getElementById('f_koku');
      const before = field.value;
      T.recalcAll(); T.recalcAll(); T.recalcAll();
      return { before, after: field.value };
    });
    equal('F4511-DAIKOKU-04', 'Koku is never debited, so no recalc can debit it twice',
      koku.after, koku.before);

    const kokuTyped = await page.evaluate(() => {
      const T = window.__L5R_TEST__;
      const field = document.getElementById('f_koku');
      field.value = '12';
      field.dispatchEvent(new Event('change', { bubbles: true }));
      T.recalcAll();
      return field.value;
    });
    equal('F4511-DAIKOKU-05', 'Money the player has entered is left exactly alone', kokuTyped, '12');
  });

  // ---------- Ebisu — gated twice, by the Social list and by the declaration ----------
  await section('F4511-EBISU', 'Ebisu', async () => {
    await reset(page);
    await clearEntries(page);
    await addFortune(page, 'Ebisu');
    await declarationsReset(page);

    const offeredSocial = await page.evaluate(() => window.__L5R_TEST__.F4511
      .declarationsOffered(window.__L5R_TEST__.makeRollContext(
        window.__L5R_TEST__.ROLL_KINDS.SKILL, { skillName: 'Courtier' })).map(o => o.fortune));
    equal('F4511-EBISU-01', 'The declaration is offered on a Social Skill Roll', offeredSocial, ['Ebisu']);

    const offeredOther = await page.evaluate(() => window.__L5R_TEST__.F4511
      .declarationsOffered(window.__L5R_TEST__.makeRollContext(
        window.__L5R_TEST__.ROLL_KINDS.SKILL, { skillName: 'Athletics' })).map(o => o.fortune));
    equal('F4511-EBISU-02', 'It is not offered on a Skill that is not Social', offeredOther, []);

    equal('F4511-EBISU-03', 'Undeclared, it contributes nothing at all',
      await modsFor(page, 'SKILL', { skillName: 'Courtier' }), []);

    await declare(page, 'Ebisu', true);
    equal('F4511-EBISU-04', 'Declared on a Social Skill Roll, it costs a rolled and a kept die',
      await modsFor(page, 'SKILL', { skillName: 'Courtier' }),
      [{ rolledDelta: -1, keptDelta: -1, totalDelta: 0, note: 'Ebisu — declared, non-samurai' }]);

    // The gate that would fail silently: declared, but on a roll the list does not cover.
    equal('F4511-EBISU-05', 'Declared on a NON-Social Skill it still contributes nothing',
      await modsFor(page, 'SKILL', { skillName: 'Athletics' }), []);
    await declarationsReset(page);

    // ORACLE: 4.5.2's own list, not one written in this file.
    const oracle = await page.evaluate(() => {
      const T = window.__L5R_TEST__;
      const list = T.D45.socialSkills;
      return {
        list: list.slice(),
        allMatch: list.every(s => T.F4511.isSocialSkill(s)),
        caseInsensitive: list.every(s => T.F4511.isSocialSkill(s.toUpperCase())),
        rejectsOther: !T.F4511.isSocialSkill('Athletics') && !T.F4511.isSocialSkill(''),
      };
    });
    truthy('F4511-EBISU-06', 'Every Skill on Feature 4.5.2’s own Social list is recognised',
      oracle.allMatch, JSON.stringify(oracle.list));
    truthy('F4511-EBISU-07', 'Matching ignores case, and refuses a non-Social or empty name',
      oracle.caseInsensitive && oracle.rejectsOther);
  });

  // ---------- Jurojin — declared, and not scoped to a Skill the source never names ----------
  await section('F4511-JUROJIN', 'Jurojin', async () => {
    await reset(page);
    await clearEntries(page);
    await addFortune(page, 'Jurojin');
    await declarationsReset(page);

    equal('F4511-JUROJIN-01', 'Undeclared, it contributes nothing',
      await modsFor(page, 'SKILL', { skillName: 'Athletics' }), []);

    await declare(page, 'Jurojin', true);
    equal('F4511-JUROJIN-02', 'Declared, it costs two ROLLED dice and no kept die',
      await modsFor(page, 'SKILL', { skillName: 'Athletics' }),
      [{ rolledDelta: -2, keptDelta: 0, totalDelta: 0,
        note: 'Jurojin — declared, resisting poison or disease' }]);

    // A resistance roll can be any kind, because the source does not say which one it is.
    const kinds = {};
    for (const kind of ['TRAIT', 'RING', 'SKILL']) kinds[kind] = (await modsFor(page, kind, {})).length;
    equal('F4511-JUROJIN-03', 'It reaches every roll kind a resistance roll might be made with',
      kinds, { TRAIT: 1, RING: 1, SKILL: 1 });
    await declarationsReset(page);
  });

  // ---------- The two deferred Fortunes are recorded honestly ----------
  await section('F4511-DEFER', 'Bishamon and Hotei', async () => {
    for (const fortune of DEFERRED) {
      await reset(page);
      await clearEntries(page);
      const shown = await addFortune(page, fortune);
      truthy(`F4511-DEFER-${fortune}-NOTE`, `${fortune} says on the row that the sheet does not act on it`,
        (shown.note || '').includes('not yet'), shown.note);
      equal(`F4511-DEFER-${fortune}-MODS`, `${fortune} moves no dice on any roll`,
        await modsFor(page, 'SKILL', { skillName: 'Commerce' }), []);
    }
    await reset(page);
    await clearEntries(page);
    const hotei = await addFortune(page, 'Hotei');
    truthy('F4511-DEFER-HOTEI-PRICE', 'Hotei’s row states the 6-point price it was recorded at',
      (hotei.note || '').includes('6 points'), hotei.note);
  });

  // ---------- Damage: the exclusion this phase INHERITS rather than codes ----------
  await section('F4511-DAMAGE', 'damage', async () => {
    await reset(page);
    await clearEntries(page);
    await addFortune(page, 'Benten');
    equal('F4511-DAMAGE-01', 'A damage roll carrying the attack’s own Skill gets no TN deduction',
      await modsFor(page, 'DAMAGE', { skillName: 'Etiquette' }), []);

    await clearEntries(page);
    await addFortune(page, 'Daikoku');
    equal('F4511-DAMAGE-02', 'A damage roll carrying the penalised Skill loses no dice',
      await modsFor(page, 'DAMAGE', { skillName: 'Commerce' }), []);

    await clearEntries(page);
    await addFortune(page, 'Jurojin');
    await declare(page, 'Jurojin', true);
    equal('F4511-DAMAGE-03', 'Even an explicitly declared Fortune cannot reach damage',
      await modsFor(page, 'DAMAGE', { skillName: 'Athletics' }), []);
    await declarationsReset(page);
  });

  // ---------- The declarations must never be left armed ----------
  await section('F4511-DECLARE', 'declaration lifecycle', async () => {
    await reset(page);
    await clearEntries(page);
    const shown = await addFortune(page, 'Ebisu');
    await declare(page, 'Ebisu', true);

    const stored = await page.evaluate(() => JSON.parse(
      document.querySelector('#disadvList .entry').dataset.advConfig));
    equal('F4511-DECLARE-01', 'A declaration is never written into the saved config',
      Object.keys(stored).sort(), ['fortune', 'type', 'value']);
    truthy('F4511-DECLARE-02', 'The stored config carries no declaration key at all',
      !('declared' in stored) && !('Ebisu' in stored), JSON.stringify(stored));

    // Opening a preview must clear it, so it can never ride from one roll to the next.
    const probe = openPreview(page, 'SKILL', { skillName: 'Courtier', traitName: 'Awareness' }, 5, 3);
    await probe.opened;
    const afterOpen = await page.evaluate(() => window.__L5R_TEST__.F4511.declarationPending('Ebisu'));
    truthy('F4511-DECLARE-03', 'Opening the preview clears a declaration left over from before',
      afterOpen === false, `pending=${afterOpen}`);

    // And the checkbox is actually on screen for the player.
    const box = await page.evaluate(() => {
      const cb = document.querySelector('[data-fortune4511-declare]');
      return cb ? { fortune: cb.getAttribute('data-fortune4511-declare'), checked: cb.checked } : null;
    });
    equal('F4511-DECLARE-04', 'The preview offers the declaration, unticked, naming its Fortune',
      box, { fortune: 'Ebisu', checked: false });

    await page.click('#rollPreviewCancel');
    await probe.pending;
    const afterCancel = await page.evaluate(() => window.__L5R_TEST__.F4511.declarationPending('Ebisu'));
    truthy('F4511-DECLARE-05', 'Cancelling the preview clears the declaration', afterCancel === false);
  });

  // ---------- Two Fortunes at once ----------
  await section('F4511-BOTH', 'two declarations on one roll', async () => {
    await reset(page);
    await clearEntries(page);
    await addFortune(page, 'Ebisu');
    await addFortune(page, 'Jurojin');
    await declarationsReset(page);

    const offered = await page.evaluate(() => window.__L5R_TEST__.F4511
      .declarationsOffered(window.__L5R_TEST__.makeRollContext(
        window.__L5R_TEST__.ROLL_KINDS.SKILL, { skillName: 'Courtier' })).map(o => o.fortune));
    equal('F4511-BOTH-01', 'Both declarations are offered on a roll where both are in scope',
      offered, ['Ebisu', 'Jurojin']);

    await declare(page, 'Ebisu', true);
    await declare(page, 'Jurojin', true);
    const both = await modsFor(page, 'SKILL', { skillName: 'Courtier' });
    equal('F4511-BOTH-02', 'Declaring both applies both, and they do not merge or overwrite',
      both.map(m => [m.rolledDelta, m.keptDelta]).sort(), [[-1, -1], [-2, 0]].sort());

    await declare(page, 'Ebisu', false);
    const oneOnly = await modsFor(page, 'SKILL', { skillName: 'Courtier' });
    equal('F4511-BOTH-03', 'Unticking one leaves the other exactly as it was',
      oneOnly.map(m => [m.rolledDelta, m.keptDelta]), [[-2, 0]]);
    await declarationsReset(page);
  });

  // ---------- No new registry seat, and the type string added cleanly ----------
  await section('F4511-SEAT', 'registry and config types', async () => {
    await reset(page);
    const registry = await page.evaluate(() =>
      (window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY || []).map(e => e.id));
    equal('F4511-SEAT-01', 'The pre-roll registry is untouched — no seat taken, nothing re-registered',
      registry, ['range', 'arrow', 'stance', 'offhand', 'wounds', 'void', 'adv-config']);

    const types = await page.evaluate(() => window.__L5R_TEST__.D45.configTypes.slice());
    truthy('F4511-SEAT-02', 'fortunePick is present', types.includes('fortunePick'));
    equal('F4511-SEAT-03', 'It was appended without displacing the thirteen already there',
      types.slice(0, 13),
      ['tierPick', 'rankPick', 'elementPick', 'tenetPick', 'targetPick', 'insightDifferencePick',
        'toggleModifier', 'statusLinked', 'dualTierPick', 'languagePick', 'skillPick',
        'clanWeaponAutoPick', 'realmPick']);
    equal('F4511-SEAT-04', 'The array is still frozen after being replaced',
      await page.evaluate(() => Object.isFrozen(window.__L5R_TEST__.D45.configTypes)), true);

    const module = await page.evaluate(() => typeof (window.__L5R_TEST__.D45.modules || {}).fortune4511);
    equal('F4511-SEAT-05', 'It reaches the pipeline as a D45 module, not as a contributor',
      module, 'object');
  });

  // ---------- Geometry, measured against both builds ----------
  await section('F4511-GEOM', 'geometry', async () => {
    await reset(page);
    await clearEntries(page);
    await addFortune(page, 'Benten');
    const active = await page.evaluate(() => {
      const el = document.querySelector('.fortune4511-badge');
      const cs = getComputedStyle(el);
      return { border: cs.borderTopStyle, weight: cs.fontWeight, tinted: cs.backgroundColor !== 'rgba(0, 0, 0, 0)' };
    });
    equal('F4511-GEOM-01', 'An automated Fortune reads as active — solid, bold, tinted',
      active, { border: 'solid', weight: '600', tinted: true });

    await clearEntries(page);
    await addFortune(page, 'Hotei');
    const deferred = await page.evaluate(() => {
      const el = document.querySelector('.fortune4511-badge');
      const cs = getComputedStyle(el);
      return { border: cs.borderTopStyle, weight: cs.fontWeight, tinted: cs.backgroundColor !== 'rgba(0, 0, 0, 0)' };
    });
    equal('F4511-GEOM-02', 'A deferred Fortune reads quieter, so the row does not overstate the sheet',
      deferred, { border: 'dashed', weight: '500', tinted: false });

    // The note takes the width the row already has, rather than a cap calculated from a font this
    // sandbox cannot load. Feature 4.5.4 shipped that mistake twice.
    const note = await page.evaluate(() => {
      const row = document.querySelector('#disadvList .entry .adv-config-row');
      const el = row.querySelector('.fortune4511-note');
      const rr = row.getBoundingClientRect();
      const nr = el.getBoundingClientRect();
      return {
        fullWidth: Math.round(nr.width) === Math.round(rr.width),
        flushLeft: Math.round(nr.left - rr.left) === 0,
        basis: getComputedStyle(el).flexBasis,
      };
    });
    equal('F4511-GEOM-03', 'The row note takes the full row width and sits flush left',
      note, { fullWidth: true, flushLeft: true, basis: '100%' });

    await clearEntries(page);
    await addFortune(page, 'Ebisu');
    const probe = openPreview(page, 'SKILL', { skillName: 'Courtier', traitName: 'Awareness' }, 5, 3);
    await probe.opened;
    const block = await page.evaluate(() => {
      const el = document.querySelector('.fortune4511-declare');
      if (!el) return null;
      const cs = getComputedStyle(el);
      const opt = getComputedStyle(el.querySelector('.fortune4511-declare-opt'));
      return { separated: cs.borderTopStyle === 'solid' && parseFloat(cs.borderTopWidth) > 0,
        spacedAbove: parseFloat(cs.marginTop) >= 4, optionRow: opt.display, gap: opt.gap };
    });
    equal('F4511-GEOM-04', 'The declaration block is separated from the preview above it',
      block, { separated: true, spacedAbove: true, optionRow: 'flex', gap: '6px' });
    await page.click('#rollPreviewCancel');
    await probe.pending;
  });

  truthy('F4511-ERRORS', 'No uncaught page errors during the run',
    pageErrors.length === 0, pageErrors.join(' | '));

  await browser.close();
  const passed = results.filter(r => r.pass).length;
  console.log(`\nFEATURE 4.5.11 — ${passed}/${results.length} checks passed`);
  process.exit(passed === results.length ? 0 : 1);
})();
