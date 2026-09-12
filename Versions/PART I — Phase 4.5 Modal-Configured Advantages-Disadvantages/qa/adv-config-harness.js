/* =============================================================================
   PART I PHASE 4.5 — MODAL-CONFIGURED ADVANTAGES/DISADVANTAGES — AUTOMATED CHECKS

     NODE_PATH=$(npm root -g) node qa/adv-config-harness.js <built-sheet.html>

   WHAT THIS PHASE CHANGED. Variable Advantages/Disadvantages -- the ones whose
   effect depends on a choice made when you take them -- can now record that
   choice, and the choice changes the XP arithmetic the sheet already did.
   Elemental Blessing discounts its chosen Ring's two Traits; a severity tier
   sets the entry's own cost.

   THE ORACLES, AND WHY NONE OF THEM IS THIS PHASE'S OWN CODE. CLAUDE.md's
   "a harness must be able to fail" rule exists because Part H Phase 1's harness
   asked the code under test whether the code under test was working. So:

     * Trait XP        -- the harness reimplements L5R's Trait cost rule
                          independently (each new Rank costs new-rank x 4) rather
                          than calling the sheet's traitCost(). Two implementations
                          that disagree fail the check.
     * Ring -> Traits  -- the Air/Earth/Fire/Water Trait pairs are written out
                          here from the GAME's rule, not read from RINGS. If this
                          phase discounted the wrong Ring's Traits, reading RINGS
                          would agree with it and this does not.
     * The XP total    -- read from f_xpSpent, which recalcAll() writes and this
                          phase does not own. Every "the discount reached the
                          tracker" check compares that field before and after.
     * Tier costs      -- checked against the numbers in each entry's OWN library
                          description text, pulled through the sheet's real
                          quick-add path (check 8). This is the mechanical form of
                          "no rules content was invented": a tier priced at
                          anything the library does not itself say fails.
     * The flag        -- checks 21-23 read the PAINTED DOM, so a phase that
                          resolves correctly and renders nothing still fails.

   PROVING IT CAN FAIL. See this phase's README: the same file is run against a
   build with ADV_CONFIG_ENABLED = false and against one with the fragment
   surgically removed, and both numbers are recorded there.

   Reads only. Never writes to the file it is given.
   ============================================================================= */

'use strict';

const { chromium } = require('playwright');
const path = require('path');
const { pathToFileURL } = require('url');

const LAUNCH = process.env.L5R_CHROME ? { executablePath: process.env.L5R_CHROME } : {};

const results = [];
const record = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};
const check = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  record(name, pass, pass ? JSON.stringify(actual) : `got=${JSON.stringify(actual)} want=${JSON.stringify(expected)}`);
};

// ---------------------------------------------------------------------------
// INDEPENDENT ORACLES. Written from the game's rules, not read from the sheet.
// ---------------------------------------------------------------------------

// L5R 4e: a Trait starts at Rank 2 for free and each Rank bought costs (new Rank) x 4 XP.
// Deliberately a second implementation of what traitCost() does, so the two can disagree.
const expectedTraitCost = (rank, floor) => {
  let cost = 0;
  for (let step = floor + 1; step <= rank; step++) cost += step * 4;
  return cost;
};

// The Ring -> Trait pairings, from the game rather than from RINGS.
const RING_TRAITS = {
  Air:   ['reflexes', 'awareness'],
  Earth: ['stamina', 'willpower'],
  Fire:  ['agility', 'intelligence'],
  Water: ['strength', 'perception'],
};

const reset = async (page) => {
  await page.evaluate(() => {
    window.__L5R_TEST__.resetToBaseline();
    window.__L5R_TEST__.recalcAll();
  });
};

// Add an entry through the sheet's REAL quick-add path (the <select> a player uses), so the
// name, cost and description all come from the library rather than from anything this harness
// or this phase makes up. Returns the resulting entry's index in its list.
const addFromLibrary = (page, listId, selectId, name) => page.evaluate(({ listId, selectId, name }) => {
  const sel = document.getElementById(selectId);
  sel.value = name;
  sel.dispatchEvent(new Event('change'));
  // The picker modal opens at pick-time; dismiss it so the entry is left unconfigured.
  const overlay = document.getElementById('advConfigModalOverlay');
  if (overlay && overlay.style.display !== 'none') document.getElementById('advConfigX').click();
  return document.querySelectorAll('#' + listId + ' .entry').length - 1;
}, { listId, selectId, name });

// Configure an entry by driving the modal exactly as a player does: open it, tick an option,
// press Confirm. Never by calling writeAdvConfig() directly -- that would prove the store
// works while saying nothing about whether the UI can reach it.
// Every DOM reach below can come back empty against a build with the phase disabled or
// removed. It returns a reason rather than throwing, so those runs still report a NUMBER --
// a harness that dies proves nothing about what it was measuring.
const configureViaModal = (page, listId, index, optionValue) => page.evaluate(({ listId, index, optionValue }) => {
  const div = document.querySelectorAll('#' + listId + ' .entry')[index];
  if (!div) return { ok: false, reason: 'no entry at index ' + index };
  const btn = div.querySelector('.adv-config-btn');
  if (!btn) return { ok: false, reason: 'entry has no configuration control' };
  btn.click();
  const item = document.querySelector(`#advConfigGrid .affinity-pick-item[data-value="${optionValue}"]`);
  if (!item) return { ok: false, reason: 'option not offered: ' + optionValue };
  const box = item.querySelector('input[type="checkbox"]');
  box.checked = true;
  box.dispatchEvent(new Event('change'));
  document.getElementById('advConfigConfirm').click();
  return { ok: true };
}, { listId, index, optionValue });

const xpSpent = (page) => page.evaluate(() => parseFloat(document.getElementById('f_xpSpent').value || '0'));

const setTrait = (page, traitKey, rank) => page.evaluate(({ traitKey, rank }) => {
  document.getElementById('trait_' + traitKey).value = rank;
  window.__L5R_TEST__.recalcAll();
}, { traitKey, rank });

async function main() {
  const file = process.argv[2];
  if (!file) { console.error('usage: node adv-config-harness.js <built-sheet.html>'); process.exit(2); }

  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));
  await page.goto(pathToFileURL(path.resolve(file)).href);
  await page.waitForFunction(() => !!window.__L5R_TEST__);

  // Fail fast and honestly if the phase is not in this build at all, rather than reporting a
  // long list of failures that all say the same thing.
  const present = await page.evaluate(() => typeof window.__L5R_TEST__.resolveAdvDisadvEffect === 'function');
  if (!present) {
    record('the phase exports resolveAdvDisadvEffect on the test seam', false, 'got undefined');
    console.log('\n0/1 checks passed');
    await browser.close();
    process.exit(1);
  }

  console.log('\nPART I PHASE 4.5 — Modal-Configured Advantages/Disadvantages\n');

  // =========================================================================
  // THE RESOLVER — pure, and driven without a character sheet in the way.
  // =========================================================================
  check('Elemental Blessing + Fire resolves to a 1 XP discount on Fire’s two Traits',
    await page.evaluate(() => {
      const e = window.__L5R_TEST__.resolveAdvDisadvEffect('Elemental Blessing', { type: 'ringPick', value: 'Fire' });
      return e && { effect: e.effect, ring: e.ringName, traits: e.traitKeys.slice().sort(), amount: e.amount };
    }),
    { effect: 'traitXpDiscount', ring: 'Fire', traits: RING_TRAITS.Fire.slice().sort(), amount: 1 });

  check('an unconfigured entry resolves to no effect at all',
    await page.evaluate(() => window.__L5R_TEST__.resolveAdvDisadvEffect('Elemental Blessing', null)), null);

  check('a pick that names no real Ring resolves to no effect',
    await page.evaluate(() => window.__L5R_TEST__.resolveAdvDisadvEffect('Elemental Blessing', { type: 'ringPick', value: 'Shadow' })), null);

  check('Lord Moon’s Curse + Medium resolves to a 5-point entry cost',
    await page.evaluate(() => {
      const e = window.__L5R_TEST__.resolveAdvDisadvEffect('Lord Moon’s Curse', { type: 'severityTier', value: 'Medium' });
      return e && { effect: e.effect, cost: e.cost };
    }),
    { effect: 'entryCost', cost: 5 });

  check('an Advantage with no variable choice has no schema',
    await page.evaluate(() => window.__L5R_TEST__.advConfigSchemaFor('Fame')), null);

  check('a name typed with a straight apostrophe still matches the library’s curly one',
    await page.evaluate(() => {
      const s = window.__L5R_TEST__.advConfigSchemaFor("Lord Moon's Curse");
      return s ? s.type : null;
    }), 'severityTier');

  // Void is not offered because RINGS holds only the four elemental Rings — the restriction
  // Elemental Blessing states ("a non-Void Ring") with no second list to fall out of step.
  check('the Ring picker offers the four elemental Rings and not Void',
    await page.evaluate(() => window.__L5R_TEST__
      .advConfigOptionsFor(window.__L5R_TEST__.advConfigSchemaFor('Elemental Blessing'))
      .map(o => o.value)),
    ['Air', 'Earth', 'Fire', 'Water']);

  // =========================================================================
  // 8. NO INVENTED RULES CONTENT. Every tier price this phase claims has to
  //    appear as a number in that entry's own library description.
  // =========================================================================
  await reset(page);
  const tierAudit = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const out = [];
    Object.keys(T.ADV_DISADV_CONFIG_SCHEMA).forEach(name => {
      const schema = T.ADV_DISADV_CONFIG_SCHEMA[name];
      // Gentry is a Phase 4.5 completion-pass holding ladder. Its intermediate
      // values are an explicit user-approved configuration contract, not a list
      // enumerated in the legacy library prose (which only says 8–30). It is
      // independently asserted by adv-config-expansion-harness.js instead of
      // being misclassified as one of this original library-text audits.
      if (schema.type !== 'severityTier' || name === 'Gentry') return;
      // Pull the description through the real add path, from whichever list holds it.
      let desc = null;
      [['advQuickAdd', 'advList'], ['disadvQuickAdd', 'disadvList']].forEach(([selId, listId]) => {
        if (desc !== null) return;
        const sel = document.getElementById(selId);
        const match = Array.from(sel.options).find(o => o.value === name);
        if (!match) return;
        sel.value = name;
        sel.dispatchEvent(new Event('change'));
        const ov = document.getElementById('advConfigModalOverlay');
        if (ov && ov.style.display !== 'none') document.getElementById('advConfigX').click();
        const entries = document.querySelectorAll('#' + listId + ' .entry');
        desc = entries[entries.length - 1].querySelector('.en-desc').value;
      });
      const numbersInDesc = (desc || '').match(/\d+/g) || [];
      schema.options.forEach(opt => {
        out.push({ name, cost: opt.cost, quoted: numbersInDesc.indexOf(String(opt.cost)) !== -1 });
      });
    });
    return out;
  });
  check('every severity-tier price is a number the entry’s own library text states',
    tierAudit.filter(r => !r.quoted), []);
  record(`  (audited ${tierAudit.length} tier prices across ${new Set(tierAudit.map(r => r.name)).size} entries)`, true);

  check('every configurable name exists in the sheet’s own Advantage/Disadvantage libraries',
    await page.evaluate(() => {
      const T = window.__L5R_TEST__;
      const inLists = new Set();
      ['advQuickAdd', 'disadvQuickAdd'].forEach(id => {
        Array.from(document.getElementById(id).options).forEach(o => { if (o.value) inLists.add(o.value); });
      });
      return Object.keys(T.ADV_DISADV_CONFIG_SCHEMA).filter(n => !inLists.has(n));
    }), []);

  // =========================================================================
  // THE DISCOUNT MATH — against an independently written Trait cost rule.
  // =========================================================================
  await reset(page);
  check('with nothing configured, no Trait is discounted',
    await page.evaluate(() => window.__L5R_TEST__.advConfigTraitXpDiscount('agility', 4, 2)), 0);

  await reset(page);
  let idx = await addFromLibrary(page, 'advList', 'advQuickAdd', 'Elemental Blessing');
  check('the picker offers Fire and the entry takes it', await configureViaModal(page, 'advList', idx, 'Fire'), { ok: true });

  // Agility 4 from a floor of 2 is two Ranks bought, so the Blessing is worth exactly 2 XP.
  check('a blessed Trait is discounted 1 XP per Rank actually bought',
    await page.evaluate(() => window.__L5R_TEST__.advConfigTraitXpDiscount('agility', 4, 2)), 2);

  // The independent Trait-cost rule, made load-bearing rather than decorative: raise one Trait
  // on a sheet with no Blessing and the tracker must move by exactly what the GAME's rule says
  // that Trait costs. If the sheet's traitCost() and the rule written at the top of this file
  // ever disagree, this is where it surfaces -- and every discount figure above is quoted
  // against a cost this check has confirmed.
  await reset(page);
  const atFloor = await xpSpent(page);
  await setTrait(page, 'agility', 4);
  check('raising Agility to 4 costs what L5R’s own Trait rule says, independently computed',
    (await xpSpent(page)) - atFloor, expectedTraitCost(4, 2));

  // And the same Trait, on the same sheet, with Fire blessed: the discounted cost.
  idx = await addFromLibrary(page, 'advList', 'advQuickAdd', 'Elemental Blessing');
  const blessingCost = (await xpSpent(page)) - atFloor - expectedTraitCost(4, 2); // the entry's own points
  await configureViaModal(page, 'advList', idx, 'Fire');
  check('with Fire blessed, that same Trait costs the rule’s price minus one per Rank bought',
    (await xpSpent(page)) - atFloor - blessingCost, expectedTraitCost(4, 2) - 2);

  await reset(page);
  idx = await addFromLibrary(page, 'advList', 'advQuickAdd', 'Elemental Blessing');
  await configureViaModal(page, 'advList', idx, 'Fire');

  check('the discount covers BOTH of the blessed Ring’s Traits and no other Ring’s',
    await page.evaluate(() => {
      const T = window.__L5R_TEST__;
      const at = (k) => T.advConfigTraitXpDiscount(k, 4, 2);
      return { agility: at('agility'), intelligence: at('intelligence'), reflexes: at('reflexes'), stamina: at('stamina'), strength: at('strength') };
    }),
    { agility: 2, intelligence: 2, reflexes: 0, stamina: 0, strength: 0 });

  check('a Trait still at its free floor is discounted nothing — there is no bought Rank to cheapen',
    await page.evaluate(() => window.__L5R_TEST__.advConfigTraitXpDiscount('agility', 2, 2)), 0);

  check('the discount can never exceed what the Trait itself costs',
    await page.evaluate(() => {
      const T = window.__L5R_TEST__;
      return T.advConfigTraitXpDiscount('agility', 3, 2) <= 12; // one Rank bought at Rank 3 = 12 XP
    }), true);

  // =========================================================================
  // THE XP TRACKER — the sheet's own f_xpSpent, before and after.
  // =========================================================================
  await reset(page);
  await setTrait(page, 'agility', 4);
  await setTrait(page, 'intelligence', 3);
  const beforeBlessing = await xpSpent(page);
  idx = await addFromLibrary(page, 'advList', 'advQuickAdd', 'Elemental Blessing');
  const withUnconfigured = await xpSpent(page);
  // The entry's own 4-point cost lands in the total; the DISCOUNT must not, because no Ring
  // has been picked. "Never a silent default" as a number rather than as a claim.
  check('an unconfigured Elemental Blessing costs its points and discounts nothing',
    withUnconfigured - beforeBlessing, 4);

  await configureViaModal(page, 'advList', idx, 'Fire');
  const withFire = await xpSpent(page);
  // Agility 4 (2 Ranks bought) + Intelligence 3 (1 Rank bought) = 3 discounted Ranks.
  check('configuring it for Fire takes exactly 3 XP off the tracker (2 Agility Ranks + 1 Intelligence)',
    withUnconfigured - withFire, 3);

  // The stale-discount case the roadmap calls out by name.
  await configureViaModal(page, 'advList', idx, 'Water');
  const withWater = await xpSpent(page);
  check('re-picking to Water clears Fire’s discount entirely and applies Water’s (nothing bought there)',
    withWater, withUnconfigured);

  await configureViaModal(page, 'advList', idx, 'Fire');
  await page.evaluate(() => {
    document.querySelectorAll('#advList .entry')[0].querySelector('.rm-btn').click();
  });
  check('removing the entry reverses its effect completely — cost and discount both',
    await xpSpent(page), beforeBlessing);

  // =========================================================================
  // SEVERITY TIERS — the row and the tracker are the same number.
  // =========================================================================
  await reset(page);
  const beforeCurse = await xpSpent(page);
  idx = await addFromLibrary(page, 'disadvList', 'disadvQuickAdd', 'Lord Moon’s Curse');
  await configureViaModal(page, 'disadvList', idx, 'High');
  check('choosing the High tier writes 7 into the entry’s own cost field',
    await page.evaluate(() => document.querySelectorAll('#disadvList .entry')[0].querySelector('.en-cost').value), '7');
  const withHigh = await xpSpent(page);
  // A Disadvantage subtracts from XP spent, so 7 points granted reads as -7.
  check('the High tier reaches the XP tracker as a 7-point Disadvantage', beforeCurse - withHigh, 7);

  await configureViaModal(page, 'disadvList', idx, 'Low');
  check('dropping to the Low tier moves the total by exactly the difference, with no double-count',
    (await xpSpent(page)) - withHigh, 4); // 7 - 3 = 4 granted points given back

  // =========================================================================
  // THE PAINTED FLAG — read off the DOM, not off the resolver.
  // =========================================================================
  await reset(page);
  idx = await addFromLibrary(page, 'advList', 'advQuickAdd', 'Elemental Blessing');
  check('an unconfigured variable entry is visibly flagged as needing a choice',
    await page.evaluate(() => {
      const row = document.querySelectorAll('#advList .entry')[0].querySelector('.adv-config-row');
      if (!row) return { unconfigured: false, text: '(no configuration row rendered)' };
      const warn = row.querySelector('.adv-config-warn');
      return { unconfigured: row.classList.contains('unconfigured'), text: warn ? warn.textContent.trim() : '(no flag rendered)' };
    }),
    { unconfigured: true, text: 'Needs a choice' });

  await configureViaModal(page, 'advList', idx, 'Earth');
  check('once configured the flag is replaced by what was actually picked',
    await page.evaluate(() => {
      const row = document.querySelectorAll('#advList .entry')[0].querySelector('.adv-config-row');
      if (!row) return { configured: false, warned: false, mentionsRing: false, mentionsTraits: false };
      return {
        configured: row.classList.contains('configured'),
        warned: !!row.querySelector('.adv-config-warn'),
        mentionsRing: /Earth/.test(row.textContent),
        mentionsTraits: /Stamina/.test(row.textContent) && /Willpower/.test(row.textContent),
      };
    }),
    { configured: true, warned: false, mentionsRing: true, mentionsTraits: true });

  await reset(page);
  await addFromLibrary(page, 'advList', 'advQuickAdd', 'Fame');
  check('an Advantage with no choice to make grows no configuration control',
    await page.evaluate(() => !!document.querySelectorAll('#advList .entry')[0].querySelector('.adv-config-row')), false);

  // Renaming an entry away from a configurable name drops both the control and the stored pick,
  // so an effect can never outlive the name that justified it.
  await reset(page);
  idx = await addFromLibrary(page, 'advList', 'advQuickAdd', 'Elemental Blessing');
  await configureViaModal(page, 'advList', idx, 'Fire');
  check('renaming a configured entry drops its pick, its control and its discount together',
    await page.evaluate(() => {
      const div = document.querySelectorAll('#advList .entry')[0];
      div.querySelector('.en-name').value = 'Something else entirely';
      window.__L5R_TEST__.recalcAll();
      return {
        row: !!div.querySelector('.adv-config-row'),
        stored: !!div.dataset.advConfig,
        discount: window.__L5R_TEST__.advConfigTraitXpDiscount('agility', 4, 2),
      };
    }),
    { row: false, stored: false, discount: 0 });

  // =========================================================================
  // PERSISTENCE — the roadmap's {name, cost, desc, config:{type, value}}.
  // =========================================================================
  await reset(page);
  idx = await addFromLibrary(page, 'advList', 'advQuickAdd', 'Elemental Blessing');
  await configureViaModal(page, 'advList', idx, 'Water');
  check('a configured entry saves as {..., config:{type, value}}',
    await page.evaluate(() => {
      const saved = window.__L5R_TEST__.collectData().adv.find(a => a.name === 'Elemental Blessing');
      return saved && saved.config;
    }),
    { type: 'ringPick', value: 'Water' });

  check('an entry with no choice to make writes no config key at all',
    await page.evaluate(() => {
      const sel = document.getElementById('advQuickAdd');
      sel.value = 'Fame'; sel.dispatchEvent(new Event('change'));
      const saved = window.__L5R_TEST__.collectData().adv.find(a => a.name === 'Fame');
      return Object.prototype.hasOwnProperty.call(saved, 'config');
    }), false);

  check('the pick survives a full save/load round-trip, and still discounts after it',
    await page.evaluate(() => {
      const T = window.__L5R_TEST__;
      document.getElementById('trait_strength').value = 4;
      T.recalcAll();
      const snapshot = JSON.parse(JSON.stringify(T.collectData()));
      T.resetToBaseline();
      T.applyData(snapshot);
      T.recalcAll();
      const div = Array.from(document.querySelectorAll('#advList .entry'))
        .find(d => d.querySelector('.en-name').value === 'Elemental Blessing');
      return {
        restored: div ? JSON.parse(div.dataset.advConfig || 'null') : null,
        flaggedUnconfigured: div && div.querySelector('.adv-config-row')
          ? div.querySelector('.adv-config-row').classList.contains('configured') : false,
        discountsStrength: T.advConfigTraitXpDiscount('strength', 4, 2),
      };
    }),
    { restored: { type: 'ringPick', value: 'Water' }, flaggedUnconfigured: true, discountsStrength: 2 });

  // =========================================================================
  // THE ROLL EFFECTS (4.5.1)
  //
  // Driven through the pipeline's OWN getPreRollModifiers(), not by calling this phase's
  // contributor directly — so what is measured is what a real roll would actually receive,
  // normaliser included. That matters most for the Free Raise: the normaliser is what forces
  // an informational modifier's deltas to zero, and asking the contributor alone would never
  // exercise it.
  // =========================================================================
  const modsFor = (page, kind, extra) => page.evaluate(({ kind, extra }) => {
    const T = window.__L5R_TEST__;
    return T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS[kind], extra))
      .filter(m => m.source === 'adv-config')
      .map(m => ({ label: m.label, rolled: m.rolledDelta, kept: m.keptDelta,
                   total: m.totalDelta, informational: m.informational }));
  }, { kind, extra });

  // ---- Chosen by the Oracles: +1k1 on Ring Rolls of the chosen Ring ----
  await reset(page);
  idx = await addFromLibrary(page, 'advList', 'advQuickAdd', 'Chosen by the Oracles');
  check('an unconfigured roll-effect entry contributes nothing to any roll',
    await modsFor(page, 'RING', { ringName: 'Fire' }), []);

  await configureViaModal(page, 'advList', idx, 'Fire');
  check('Chosen by the Oracles gives +1k1 on a Ring Roll of the chosen Ring',
    await modsFor(page, 'RING', { ringName: 'Fire' }),
    [{ label: 'Chosen by the Oracles', rolled: 1, kept: 1, total: 0, informational: false }]);
  check('…and nothing on a Ring Roll of any other Ring',
    await modsFor(page, 'RING', { ringName: 'Earth' }), []);

  // The positive counterpart to the Free Raise check further down: a modifier that SAYS +1k1
  // has to actually move the pool when the trunk folds it, or "reported" and "applied" have
  // quietly come apart. Folded through applyPreRollModifiers(), not by adding 1 in the harness.
  check('…and a 3k3 Fire Ring Roll really becomes 4k4 once the pipeline folds it',
    await page.evaluate(() => {
      const T = window.__L5R_TEST__;
      const mods = T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.RING, { ringName: 'Fire' }));
      const p = T.applyPreRollModifiers(3, 3, mods);
      return { rolled: p.rolled, kept: p.kept };
    }),
    { rolled: 4, kept: 4 });
  check('…and nothing on a Trait Roll or a Skill Roll',
    [await modsFor(page, 'TRAIT', { traitName: 'Agility' }), await modsFor(page, 'SKILL', {})],
    [[], []]);

  // Void IS rollable on this sheet, and this entry's rules text says "a Ring" with no
  // exclusion — unlike Elemental Blessing's explicit "non-Void Ring". The two option sets must
  // therefore differ, which is a rules distinction rather than a UI one.
  check('Chosen by the Oracles offers Void; Elemental Blessing does not',
    await page.evaluate(() => {
      const T = window.__L5R_TEST__;
      const opts = (n) => T.advConfigOptionsFor(T.advConfigSchemaFor(n)).map(o => o.value);
      return { oracles: opts('Chosen by the Oracles'), blessing: opts('Elemental Blessing') };
    }),
    { oracles: ['Air', 'Earth', 'Fire', 'Water', 'Void'], blessing: ['Air', 'Earth', 'Fire', 'Water'] });

  await configureViaModal(page, 'advList', idx, 'Void');
  check('…and a Void pick works on a Void Ring Roll, the case RINGS alone could not express',
    await modsFor(page, 'RING', { ringName: 'Void' }),
    [{ label: 'Chosen by the Oracles', rolled: 1, kept: 1, total: 0, informational: false }]);

  // ---- Friendly Kami: +1k1 on Sense/Commune/Summon in the chosen Element ----
  await reset(page);
  idx = await addFromLibrary(page, 'advList', 'advQuickAdd', 'Friendly Kami');
  await configureViaModal(page, 'advList', idx, 'Water');
  check('Friendly Kami gives +1k1 on a Universal spell cast in the chosen Element',
    await modsFor(page, 'SPELL', { spellName: 'Commune', element: 'Water' }),
    [{ label: 'Friendly Kami', rolled: 1, kept: 1, total: 0, informational: false }]);
  check('…on all three Universal spells, and on no other spell',
    await page.evaluate(async () => {
      const T = window.__L5R_TEST__;
      const got = (n) => T.getPreRollModifiers(
        T.makeRollContext(T.ROLL_KINDS.SPELL, { spellName: n, element: 'Water' }))
        .filter(m => m.source === 'adv-config').length;
      return { Commune: got('Commune'), Sense: got('Sense'), Summon: got('Summon'),
               'Path to Inner Peace': got('Path to Inner Peace') };
    }),
    { Commune: 1, Sense: 1, Summon: 1, 'Path to Inner Peace': 0 });
  check('…and nothing when the same spell is cast in a different Element',
    await modsFor(page, 'SPELL', { spellName: 'Commune', element: 'Fire' }), []);
  check('…and nothing on a Maho casting, which is not a kami spell at all',
    await modsFor(page, 'SPELL', { spellName: 'Commune', element: 'Water', maho: true }), []);

  // ---- Friend of the Elements: a Free Raise, which moves NO dice ----
  await reset(page);
  idx = await addFromLibrary(page, 'advList', 'advQuickAdd', 'Friend of the Elements');
  await configureViaModal(page, 'advList', idx, 'Fire');
  check('Friend of the Elements reports a Free Raise on both the chosen Ring’s Traits',
    [await modsFor(page, 'TRAIT', { traitName: 'Agility' }),
     await modsFor(page, 'TRAIT', { traitName: 'Intelligence' })],
    [[{ label: 'Friend of the Elements', rolled: 0, kept: 0, total: 0, informational: true }],
     [{ label: 'Friend of the Elements', rolled: 0, kept: 0, total: 0, informational: true }]]);
  check('…and nothing on a Trait belonging to another Ring',
    await modsFor(page, 'TRAIT', { traitName: 'Stamina' }), []);

  // The load-bearing one. A Free Raise is not a dice bonus, and the pipeline must agree: the
  // pool that comes out of applyPreRollModifiers has to be the pool that went in. Asserted
  // against the trunk's own folding function rather than by trusting the flag.
  check('…and the pool it produces is IDENTICAL to the pool with no modifier at all',
    await page.evaluate(() => {
      const T = window.__L5R_TEST__;
      const mods = T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.TRAIT, { traitName: 'Agility' }));
      const withMods = T.applyPreRollModifiers(3, 3, mods);
      const without = T.applyPreRollModifiers(3, 3, []);
      return { rolled: withMods.rolled, kept: withMods.kept,
               same: withMods.rolled === without.rolled && withMods.kept === without.kept,
               reported: mods.some(m => m.source === 'adv-config') };
    }),
    { rolled: 3, kept: 3, same: true, reported: true });

  // ---- the registry seat itself ----
  check('the phase registers exactly one contributor, last in priority order',
    await page.evaluate(() => window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY
      .filter(m => m.id === 'adv-config').map(m => ({ id: m.id, priority: m.priority }))),
    [{ id: 'adv-config', priority: 60 }]);

  // =========================================================================
  // LAYOUT — added after a real laptop showed "LOW 3 PTMEDIUM 5 PHIGH 7 PTS"
  //
  // This picker reuses the universal-spell Element picker's markup, whose tiles are a fixed
  // 78x78 square with a `white-space:nowrap` label — correct for one short word (Air, Fire),
  // wrong for "Medium 5 pts", which overflowed and collided with its neighbours. Nothing in
  // the suite could see it: every other check reads values, and this was geometry.
  //
  // The oracle is the BROWSER'S OWN LAYOUT — each label's measured width against its tile's —
  // not this phase's CSS, which is the thing under test.
  // =========================================================================
  await reset(page);
  const overflows = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const bad = [];
    Object.keys(T.ADV_DISADV_CONFIG_SCHEMA).forEach(name => {
      [['advQuickAdd', 'advList'], ['disadvQuickAdd', 'disadvList']].forEach(([selId, listId]) => {
        const sel = document.getElementById(selId);
        if (!Array.from(sel.options).some(o => o.value === name)) return;
        sel.value = name;
        sel.dispatchEvent(new Event('change'));           // opens the picker at pick-time
        document.querySelectorAll('#advConfigGrid .affinity-pick-item').forEach(item => {
          const label = item.querySelector('label');
          const lw = label.getBoundingClientRect().width;
          const iw = item.getBoundingClientRect().width;
          // Half a pixel of tolerance for sub-pixel rounding; a real overflow is many pixels.
          if (lw > iw + 0.5) bad.push({ entry: name, option: label.textContent.trim(),
                                        labelWidth: Math.round(lw), tileWidth: Math.round(iw) });
        });
        document.getElementById('advConfigX').click();
      });
    });
    return bad;
  });
  check('no option label overflows its tile, in any configurable entry’s picker', overflows, []);

  // The other half of that fix: the override is scoped to this phase's own grid, so the
  // trunk's universal-spell and Affinity pickers keep the uniform square they were designed
  // around. Measured on a tile injected into the trunk picker's own grid, then removed.
  check('the trunk’s own Element picker still gets its fixed 78×78 nowrap tile',
    await page.evaluate(() => {
      const d = document.createElement('div');
      d.className = 'affinity-pick-item';
      d.innerHTML = '<label>Medium 5 pts</label><input type="checkbox">';
      document.getElementById('universalSpellPickGrid').appendChild(d);
      const c = getComputedStyle(d), l = getComputedStyle(d.querySelector('label'));
      const out = { width: c.width, height: c.height, whiteSpace: l.whiteSpace };
      d.remove();
      return out;
    }),
    { width: '78px', height: '78px', whiteSpace: 'nowrap' });

  check('the phase exports both kill-switches as enabled',
    await page.evaluate(() => [window.__L5R_TEST__.ADV_CONFIG_ENABLED,
                               window.__L5R_TEST__.ADV_CONFIG_ROLL_EFFECTS_ENABLED]), [true, true]);

  if (pageErrors.length) record('no uncaught page errors', false, pageErrors.join(' | '));
  else record('no uncaught page errors', true);

  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  await browser.close();
  process.exit(passed === results.length ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
