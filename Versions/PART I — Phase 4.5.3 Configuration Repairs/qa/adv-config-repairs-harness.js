/*
 * Phase 4.5.3 Configuration Repairs — browser validation for the eleven confirmed defects the
 * 13 September 2026 audit found in already-shipped Phase 4.5 code.
 *
 * Run: node adv-config-repairs-harness.js <sheet.html>
 *
 * Every expected number below is an INDEPENDENT oracle. The three catalogue corrections are
 * the rulebook values the audit cites by page; the two entry prices are the entries' own
 * printed descriptions; the eligibility and roll-scope expectations are the rules text. None
 * of them is read back out of the fragment under test, which is what lets this suite go red
 * when the fragment is disabled rather than agreeing with whatever it happens to do.
 *
 * The input build is never modified. Each fixture resets the sheet to baseline first.
 */
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const results = [];
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object'
  ? Object.keys(value).sort().reduce((o, k) => { o[k] = canonical(value[k]); return o; }, {}) : value;
function record(id, name, pass, detail = '') {
  results.push({ id, name, pass: !!pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id} ${name}${detail ? ' — ' + detail : ''}`);
}
function equal(id, name, actual, expected) {
  const pass = JSON.stringify(canonical(actual)) === JSON.stringify(canonical(expected));
  record(id, name, pass, pass ? '' : `actual=${JSON.stringify(actual)} expected=${JSON.stringify(expected)}`);
}
async function section(id, name, fn) {
  try { await fn(); } catch (error) { record(id, name, false, String(error.stack || error)); }
}

// ---- Independent oracles, from the sources the audit names ----
// Core Rulebook printed p.152: PERCEIVED HONOR [SOCIAL] (2 POINTS/RANK).
const PERCEIVED_HONOR_COST = 2;
// Core Rulebook printed p.155: 1 point per rank, one 1-point reduction off the TOTAL.
const WEALTHY_COST = 1;
// Core Rulebook printed p.162: the second roll is kept in all cases.
const UNLUCKY_KEEPS = 'second';
// Both entries' own printed descriptions: base 4, reduced 3 for the named identity.
const PRICED = { 'Elemental Blessing': { base: 4, reduced: 3 }, 'Friend of the Elements': { base: 4, reduced: 3 } };

const reset = page => page.evaluate(() => {
  const T = window.__L5R_TEST__;
  T.resetToBaseline(); T.recalcAll();
  ['advConfigModalOverlay', 'rollPreviewOverlay', 'rollModalOverlay', 'appConfirmOverlay'].forEach(id => {
    const element = document.getElementById(id); if (element) element.style.display = 'none';
  });
});

const identity = (page, fields) => page.evaluate(fields => {
  Object.entries(fields).forEach(([id, value]) => {
    const input = document.getElementById(id); if (!input) throw new Error(`missing identity input ${id}`);
    input.value = String(value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  window.__L5R_TEST__.recalcAll();
}, fields);

// Adds through the sheet's REAL quick-add path, so name/cost/desc come from the library the
// player actually sees rather than from anything this harness invents.
const addEntry = (page, listId, selectId, name, config) => page.evaluate(({ listId, selectId, name, config }) => {
  const T = window.__L5R_TEST__;
  const select = document.getElementById(selectId);
  if (!Array.from(select.options).some(o => o.value === name)) throw new Error(`missing library entry ${name}`);
  select.value = name; select.dispatchEvent(new Event('change', { bubbles: true }));
  const overlay = document.getElementById('advConfigModalOverlay');
  if (overlay && overlay.style.display !== 'none') document.getElementById('advConfigX').click();
  const row = document.querySelector(`#${listId} .entry:last-child`);
  if (config) T.writeAdvConfig(row, config.type, config);
  T.recalcAll();
  return Array.from(document.querySelectorAll(`#${listId} .entry`)).indexOf(row);
}, { listId, selectId, name, config });

const rowOf = (page, listId, index) => page.evaluate(({ listId, index }) => {
  const entry = document.querySelectorAll(`#${listId} .entry`)[index];
  return entry && {
    name: entry.querySelector('.en-name').value,
    cost: Number(entry.querySelector('.en-cost').value),
    desc: (entry.querySelector('.en-desc') || {}).value || '',
    config: entry.dataset.advConfig ? JSON.parse(entry.dataset.advConfig) : null,
    text: entry.textContent.replace(/\s+/g, ' ').trim(),
  };
}, { listId, index });

const libraryRow = (page, which, name) => page.evaluate(({ which, name }) => {
  const select = document.getElementById(which === 'adv' ? 'advQuickAdd' : 'disadvQuickAdd');
  const option = Array.from(select.options).find(o => o.value === name);
  return option ? { present: true, label: option.textContent } : { present: false };
}, { which, name });

const modifiers = (page, kind, extra = {}) => page.evaluate(({ kind, extra }) => {
  const T = window.__L5R_TEST__;
  return T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS[kind], extra))
    .filter(m => m.source === 'adv-config')
    .map(m => ({ label: m.label, display: m.display, informational: !!m.informational }));
}, { kind, extra });

const resolveEffect = (page, name, config) => page.evaluate(({ name, config }) =>
  window.__L5R_TEST__.resolveAdvDisadvEffect(name, config), { name, config });

const activeEffects = page => page.evaluate(() =>
  window.__L5R_TEST__.activeAdvConfigEffects().map(e => e.effect || e.entryName || 'unnamed'));

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error('usage: node adv-config-repairs-harness.js <sheet.html>');
  const sheetPath = path.resolve(file);

  // ---- Defect 12, checked in the SOURCE rather than the DOM ----
  // The stale claim is a comment, so it has no runtime behaviour to assert. It is checked here
  // because a future session reads that header first to decide what already exists.
  await section('R453-DOC-01', 'The stale skillPick/Doubt claim carries its correction', async () => {
    const html = fs.readFileSync(sheetPath, 'utf8');
    const hasStale = html.includes("'skillPick'/'traitPick' from the roadmap's named configTypes remain unbuilt");
    const hasFix = html.includes("The three sentences directly above are now STALE");
    equal('R453-DOC-01', 'The stale skillPick/Doubt claim carries its correction',
      { staleTextStillPresent: hasStale, correctionPresent: hasFix },
      { staleTextStillPresent: true, correctionPresent: true });
  });

  const browser = await chromium.launch(process.env.L5R_CHROME ? { executablePath: process.env.L5R_CHROME } : {});
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 960 } });
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(pathToFileURL(sheetPath).href);
    await page.waitForFunction(() => window.__L5R_TEST__ && typeof window.__L5R_TEST__.recalcAll === 'function');

    const registryBefore = await page.evaluate(() =>
      window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.map(m => [m.id, m.priority]));

    // ============ Defects 5, 6, 7: the three catalogue corrections ============

    await section('R453-CAT', 'Catalogue corrections', async () => {
      await reset(page);
      const i = await addEntry(page, 'advList', 'advQuickAdd', 'Perceived Honor');
      const row = await rowOf(page, 'advList', i);
      equal('R453-CAT-01', `Perceived Honor is added at ${PERCEIVED_HONOR_COST} XP per rank, not 3`,
        row.cost, PERCEIVED_HONOR_COST);
      equal('R453-CAT-02', 'Perceived Honor no longer describes itself as 3 points per rank',
        { says3: /3 points per rank/.test(row.text), says2: /2 points per rank/.test(row.text) },
        { says3: false, says2: true });

      await reset(page);
      const w = await addEntry(page, 'advList', 'advQuickAdd', 'Wealthy');
      const wealthy = await rowOf(page, 'advList', w);
      equal('R453-CAT-03', 'Wealthy keeps its 1 XP per rank base price', wealthy.cost, WEALTHY_COST);
      equal('R453-CAT-04', 'Wealthy describes ONE reduction off the total, not one per rank',
        { perRank: /1 less per rank/.test(wealthy.text), offTotal: /1 less off the total/.test(wealthy.text) },
        { perRank: false, offTotal: true });

      await reset(page);
      const u = await addEntry(page, 'disadvList', 'disadvQuickAdd', 'Unlucky');
      const unlucky = await rowOf(page, 'disadvList', u);
      equal('R453-CAT-05', `Unlucky keeps the ${UNLUCKY_KEEPS} result, not the worse one`,
        { worse: /worse result/.test(unlucky.text), second: /second result/.test(unlucky.text) },
        { worse: false, second: true });
      // FIXTURE CORRECTION, Feature 4.57. This asserted the cost box of an UNCONFIGURED Unlucky
      // row, which read 2 only while Unlucky had no configuration handler. Feature 4.57 gave it
      // one, so the row now reads 0 and "Needs a choice" until a rank is picked — the same rule
      // every other configurable Disadvantage already followed (Antisocial's catalogue 2 and
      // Obligation's 3 both read 0 unconfigured), and 209.8's stated principle that "a variable
      // price is not a provisional price". The CHECK'S INTENT — that 4.5.3's correction to 2 XP
      // per rank still holds — is unchanged and now proven through the live pricing path instead.
      await reset(page);
      const uRanked = await addEntry(page, 'disadvList', 'disadvQuickAdd', 'Unlucky',
        { type: 'rankPick', rank: 1, value: 'Rank 1' });
      equal('R453-CAT-06', 'Unlucky is still awarded 2 points per rank',
        (await rowOf(page, 'disadvList', uRanked)).cost, 2);
    });

    // ============ Defects 1 and 2: the two entry-price reductions ============

    await section('R453-PRICE', 'Entry price reductions', async () => {
      for (const [name, clan, school, expected] of [
        ['Elemental Blessing', 'Phoenix', '', PRICED['Elemental Blessing'].reduced],
        ['Elemental Blessing', 'Crab', '', PRICED['Elemental Blessing'].base],
      ]) {
        await reset(page);
        await identity(page, { f_clan: clan });
        const i = await addEntry(page, 'advList', 'advQuickAdd', name, { type: 'ringPick', value: 'Water' });
        const row = await rowOf(page, 'advList', i);
        equal(`R453-PRICE-${clan}`, `${name} costs ${expected} for a ${clan} character`, row.cost, expected);
      }

      await reset(page);
      await identity(page, { f_school: 'Isawa Shugenja', f_schoolDeficiencyElement: '' });
      let i = await addEntry(page, 'advList', 'advQuickAdd', 'Friend of the Elements', { type: 'ringPick', value: 'Fire' });
      equal('R453-PRICE-SHUG', 'Friend of the Elements costs 3 for a Shugenja',
        (await rowOf(page, 'advList', i)).cost, PRICED['Friend of the Elements'].reduced);

      await reset(page);
      await identity(page, { f_school: 'Kakita Bushi [Bushi]' });
      i = await addEntry(page, 'advList', 'advQuickAdd', 'Friend of the Elements', { type: 'ringPick', value: 'Fire' });
      equal('R453-PRICE-BUSHI', 'Friend of the Elements costs 4 for a non-Shugenja',
        (await rowOf(page, 'advList', i)).cost, PRICED['Friend of the Elements'].base);

      // The discount must follow the character, not be frozen at the moment of purchase.
      await reset(page);
      await identity(page, { f_clan: 'Crab' });
      i = await addEntry(page, 'advList', 'advQuickAdd', 'Elemental Blessing', { type: 'ringPick', value: 'Water' });
      const before = (await rowOf(page, 'advList', i)).cost;
      await identity(page, { f_clan: 'Phoenix' });
      const after = (await rowOf(page, 'advList', i)).cost;
      equal('R453-PRICE-LIVE', 'Changing Clan reprices an already-added Elemental Blessing',
        { before, after }, { before: 4, after: 3 });
    });

    // ============ Defect 3: Friendly Kami's Shugenja requirement ============

    await section('R453-KAMI', 'Friendly Kami eligibility', async () => {
      await reset(page);
      await identity(page, { f_school: 'Kakita Bushi [Bushi]' });
      await addEntry(page, 'advList', 'advQuickAdd', 'Friendly Kami', { type: 'ringPick', value: 'Water' });
      equal('R453-KAMI-01', 'A non-Shugenja gets no Friendly Kami bonus on a Universal spell',
        await modifiers(page, 'SPELL', { spellName: 'Commune', element: 'Water' }), []);

      await reset(page);
      await addEntry(page, 'advList', 'advQuickAdd', 'Friendly Kami', { type: 'ringPick', value: 'Water' });
      equal('R453-KAMI-02', 'A character with NO School at all gets no Friendly Kami bonus either',
        await modifiers(page, 'SPELL', { spellName: 'Commune', element: 'Water' }), []);
      const row = await rowOf(page, 'advList', 0);
      equal('R453-KAMI-03', 'The row says WHY rather than going silently inert',
        /Requires a Shugenja School/.test(row.text), true);

      await reset(page);
      await identity(page, { f_school: 'Isawa Shugenja', f_schoolDeficiencyElement: '' });
      await addEntry(page, 'advList', 'advQuickAdd', 'Friendly Kami', { type: 'ringPick', value: 'Water' });
      equal('R453-KAMI-04', 'A Shugenja still gets the bonus the entry promises',
        (await modifiers(page, 'SPELL', { spellName: 'Commune', element: 'Water' })).map(m => m.label),
        ['Friendly Kami']);
    });

    // ============ Defect 4: Great Potential on weapon attacks ============

    await section('R453-GP', 'Great Potential attack contexts', async () => {
      await reset(page);
      await addEntry(page, 'advList', 'advQuickAdd', 'Great Potential',
        { type: 'skillPick', skill: 'Kenjutsu', value: 'Kenjutsu' });
      const asSkill = await modifiers(page, 'SKILL', { skillName: 'Kenjutsu', skillRank: 3 });
      const asAttack = await modifiers(page, 'ATTACK', { skillName: 'Kenjutsu', skillRank: 3 });
      equal('R453-GP-01', 'The raise-limit reminder reaches an ATTACK using the chosen Skill',
        asAttack.map(m => m.label), ['Great Potential']);
      equal('R453-GP-02', 'An ATTACK and a SKILL roll report the SAME cap for the same Skill',
        asAttack.map(m => m.display), asSkill.map(m => m.display));
      equal('R453-GP-03', 'The reminder is informational and moves no dice',
        asAttack.map(m => m.informational), [true]);
      equal('R453-GP-04', 'An attack with a DIFFERENT Skill gets no reminder',
        await modifiers(page, 'ATTACK', { skillName: 'Kyujutsu', skillRank: 3 }), []);
      equal('R453-GP-05', 'It is reported once, not once per list scanned',
        asAttack.length, 1);
    });

    // ============ Defect 9: permissive pick validation ============

    await section('R453-VALID', 'Strict pick validation', async () => {
      equal('R453-VALID-01', 'A Ring that does not exist no longer counts as configured',
        await resolveEffect(page, 'Elemental Blessing', { type: 'ringPick', value: 'Marshmallow' }), null);
      equal('R453-VALID-02', 'A real Ring still resolves',
        (await resolveEffect(page, 'Elemental Blessing', { type: 'ringPick', value: 'Water' }) || {}).effect,
        'traitXpDiscount');
      equal('R453-VALID-03', 'A severity label that is not offered no longer counts as configured',
        await resolveEffect(page, 'Lord Moon’s Curse', { type: 'severityTier', value: 'Catastrophic' }), null);
      equal('R453-VALID-04', 'An offered severity label still resolves',
        (await resolveEffect(page, 'Lord Moon’s Curse', { type: 'severityTier', value: 'Low' }) || {}).effect,
        'entryCost');
      equal('R453-VALID-05', "Luck no longer reads '1x' as rank 1",
        await resolveEffect(page, 'Luck', { type: 'rankPick', value: 'Rank 1', rank: '1x' }), null);
      equal('R453-VALID-06', 'A genuine integer rank still resolves',
        !!(await resolveEffect(page, 'Luck', { type: 'rankPick', value: 'Rank 1', rank: 1 })), true);
      equal('R453-VALID-07', "Allies no longer reads '1x'/'2x' as 1 and 2",
        await resolveEffect(page, 'Allies', { type: 'dualTierPick', influence: '1x', devotion: '2x' }), null);
    });

    // ============ Defect 10: unknown configs were deleted without a word ============

    await section('R453-UNKNOWN', 'Unknown configuration payloads', async () => {
      await reset(page);
      await addEntry(page, 'advList', 'advQuickAdd', 'Wealthy');
      await page.evaluate(() => {
        const entry = document.querySelector('#advList .entry');
        entry.querySelector('.en-name').value = 'Fortune of Some Later Build';
        entry.dataset.advConfig = JSON.stringify({ type: 'fortunePick', fortune: 'Benten' });
        window.__L5R_TEST__.recalcAll();
      });
      const kept = await page.evaluate(() => {
        const entry = document.querySelector('#advList .entry');
        return { config: entry.dataset.advConfig || null, text: entry.textContent.replace(/\s+/g, ' ').trim() };
      });
      equal('R453-UNKNOWN-01', 'A config of an unknown TYPE survives a refresh',
        JSON.parse(kept.config || 'null'), { type: 'fortunePick', fortune: 'Benten' });
      equal('R453-UNKNOWN-02', 'And the row visibly says it was kept but cannot be shown',
        /Saved setting kept/.test(kept.text), true);

      // The rename case must still behave as 209.8 designed it: a config of a type this build
      // DOES know, on a name that no longer takes one, is still dropped.
      await reset(page);
      await addEntry(page, 'advList', 'advQuickAdd', 'Elemental Blessing', { type: 'ringPick', value: 'Water' });
      const dropped = await page.evaluate(() => {
        const entry = document.querySelector('#advList .entry');
        entry.querySelector('.en-name').value = 'Just Some Custom Advantage';
        window.__L5R_TEST__.recalcAll();
        return entry.dataset.advConfig || null;
      });
      equal('R453-UNKNOWN-03', 'A renamed entry still drops its now-meaningless pick', dropped, null);
    });

    // ============ Defect 11: effects resolved from the wrong list ============

    await section('R453-LIST', 'Wrong-list handling', async () => {
      await reset(page);
      await addEntry(page, 'disadvList', 'disadvQuickAdd', 'Lord Moon’s Curse', { type: 'severityTier', value: 'Low' });
      equal('R453-LIST-01', 'A Disadvantage in its OWN list contributes its effect',
        (await activeEffects(page)).includes('entryCost'), true);

      await reset(page);
      await addEntry(page, 'advList', 'advQuickAdd', 'Wealthy');
      await page.evaluate(() => {
        const entry = document.querySelector('#advList .entry');
        entry.querySelector('.en-name').value = 'Lord Moon’s Curse';
        entry.dataset.advConfig = JSON.stringify({ type: 'severityTier', value: 'Low' });
        window.__L5R_TEST__.recalcAll();
      });
      equal('R453-LIST-02', 'The SAME Disadvantage sitting in the Advantage list contributes nothing',
        await activeEffects(page), []);

      // A name in neither library is a custom entry and stays entirely the player's business.
      await reset(page);
      await addEntry(page, 'advList', 'advQuickAdd', 'Elemental Blessing', { type: 'ringPick', value: 'Water' });
      equal('R453-LIST-03', 'An Advantage in the Advantage list is untouched by the guard',
        (await activeEffects(page)).includes('traitXpDiscount'), true);
    });

    // ============ Phase contract ============

    await section('R453-CONTRACT', 'Phase contract', async () => {
      equal('R453-CONTRACT-01', 'The phase exports its kill-switch as enabled',
        await page.evaluate(() => window.__L5R_TEST__.ADV_CONFIG_REPAIRS_ENABLED), true);
      equal('R453-CONTRACT-02', 'All three catalogue corrections actually applied',
        await page.evaluate(() => window.__L5R_TEST__.R453.catalogueRepairs.map(r => [r.name, r.applied])),
        [['Perceived Honor', true], ['Wealthy', true], ['Unlucky', true]]);
    });

    const registryAfter = await page.evaluate(() =>
      window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.map(m => [m.id, m.priority]));
    equal('R453-REGISTRY-01', 'The repairs leave every registry entry unchanged', registryAfter, registryBefore);
    equal('R453-REGISTRY-02', 'No new registry seat is taken',
      registryAfter.filter(m => m[0] === 'adv-config'), [['adv-config', 60]]);
    record('R453-ERRORS', 'No uncaught browser errors', errors.length === 0, errors.join('\n'));
  } finally { await browser.close(); }
}

main().catch(error => record('R453-FATAL', 'Harness initialization', false, String(error.stack || error))).finally(() => {
  const passed = results.filter(r => r.pass).length;
  console.table(results.filter(r => !r.pass));
  console.log(`\n${passed}/${results.length} checks passed`);
  console.log('R453_QA_RESULT=' + JSON.stringify({ total: results.length, passed, failed: results.length - passed, results }));
  process.exitCode = passed === results.length ? 0 : 1;
});
