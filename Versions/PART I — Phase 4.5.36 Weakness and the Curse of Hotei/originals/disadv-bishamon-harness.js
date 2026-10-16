/*
 * Phase 4.5.12 — Seven Fortunes' Curse: Bishamon (D04b) — browser validation.
 *
 * Run: node disadv-bishamon-harness.js <sheet.html>
 *
 * The check that matters most in this file is F4512-ROLL-01, and it is worth reading before the
 * others, because it is the one a plausible WRONG implementation of this phase would fail:
 *
 *   rollWeaponDamage() does NOT call applyPreRollModifiers(). It rolls getWeaponDamageDice()'s
 *   numbers directly and consults the pipeline only AFTERWARDS, to decorate the modal. Measured
 *   before this phase was written, by registering a probe returning a real -3k-1 for
 *   ROLL_KINDS.DAMAGE: the modal PRINTED 'PROBE: -3k-1' and the dice rolled the full 5k2. So a
 *   Bishamon built as a pre-roll modifier would show a penalty the dice never took, and would
 *   satisfy any check that only asked getPreRollModifiers(). F4512-ROLL-01 therefore drives a
 *   REAL damage roll and counts the dice on screen. F4512-PIPE-01 asserts the complement — that
 *   this phase contributes NOTHING to the pipeline — so the two together pin both halves of the
 *   decision rather than just the happy path.
 *
 * Other checks that exist because something was measured rather than assumed:
 *
 *  - F4512-BRANCH-*. getWeaponDamageDice()'s section 3 splits three ways and the audit asks for
 *    all three to be checked separately. The ORACLE for which weapon is in which branch is the
 *    sheet's own WEAPON_LIBRARY and the traitName the damage function itself reports — not a list
 *    written here, which would agree with the code under test and with nothing else.
 *
 *  - F4512-BRANCH-04 (Han-kyu) is the sharpest check in the file. Its bow rating is 1, so
 *    min(rating, Strength) reads 1 at EVERY Strength from 1 to 5 — measured — and Bishamon must
 *    therefore change it by nothing at all. A blanket -1k0, which is the obvious wrong
 *    implementation, passes every other damage check here and fails this one.
 *
 *  - F4512-FLOOR-01 pins a decision, not a rule. The sourcebook does not say what 'one rank
 *    lower' means at Strength 1; #trait_strength has min="1" and an effective 0 makes unarmed
 *    roll 0k1, which rollWeaponDamage() refuses outright. The floor is this phase's own measured
 *    call and is declared in ROLLBACK.md as the one thing here a rulebook could overturn.
 *
 *  - F4512-ISOLATE-*. The audit forbids lowering actual Strength. Measured: Strength 2 -> 1 moves
 *    the Water Ring. So the checks assert the Trait input, the Water Ring and an ATTACK roll are
 *    all untouched while damage moves — three independent consumers, not one.
 *
 *  - F4512-GEOM-*. Written only AFTER measuring the live and stylesheet-dropped builds side by
 *    side. The note's WIDTH and X POSITION are identical in both (303px, flush left) because the
 *    row's own flex context supplies them, so neither is asserted — that is the trap Feature
 *    4.5.6 hit twice and Feature 4.5.11's GEOM-03 was flagged for. Only flex-basis, margin-top,
 *    font-size and colour actually discriminate, and only those are checked.
 *
 * READING ROWS EAGERLY. The configured row is re-decorated IN PLACE on every recalc, so a row
 * element captured once and read later reports whatever the LAST recalc left on it. An earlier
 * draft of this file read a captured reference at the end of the run and reported a stale note as
 * a product bug. Every read below happens at the moment it is asserted.
 *
 * The input build is never modified.
 */
'use strict';
const { chromium } = require('playwright');
const { pathToFileURL } = require('url');

const PHONE = { width: 375, height: 812 };
const ENTRY = 'Seven Fortunes’ Curse';
const FORTUNE = 'Bishamon';

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

const reset = page => page.evaluate(() => {
  const T = window.__L5R_TEST__;
  if (T.D45 && T.D45.gates) T.D45.gates.cancel();
  T.resetToBaseline();
  document.querySelectorAll('#disadvList .entry, #advList .entry').forEach(d => d.remove());
  document.querySelectorAll('#weaponsBody tr').forEach(tr => tr.remove());
  T.recalcAll();
  ['advConfigModalOverlay', 'rollPreviewOverlay', 'rollModalOverlay', 'appConfirmOverlay']
    .forEach(id => { const e = document.getElementById(id); if (e) e.style.display = 'none'; });
});

const setStrength = (page, v) => page.evaluate(v => {
  const T = window.__L5R_TEST__;
  const el = document.getElementById('trait_strength');
  el.value = String(v);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  T.recalcAll();
  return T.getTraitValueByName('Strength');
}, v);

// Adds a configured Bishamon row the way the UI does. Returns how many rows now carry it, so a
// second call is verifiably a second entry rather than a silent overwrite.
const addBishamon = (page, fortune = FORTUNE) => page.evaluate(({ entry, fortune }) => {
  const T = window.__L5R_TEST__;
  document.getElementById('addDisadv').click();
  const div = document.getElementById('disadvList').lastElementChild;
  div.querySelector('.en-name').value = entry;
  div.querySelector('.en-name').dispatchEvent(new Event('change', { bubbles: true }));
  const cfg = { type: 'fortunePick', fortune };
  const schema = T.D45.schema(entry);
  if (schema && schema.finalize) schema.finalize(cfg);
  div.dataset.advConfig = JSON.stringify(cfg);
  T.recalcAll();
  return document.querySelectorAll('#disadvList .entry').length;
}, { entry: ENTRY, fortune });

// Reads the row FRESH every time — see the header note on eager reads.
const rowState = page => page.evaluate(() => {
  const div = document.querySelector('#disadvList .entry:last-child');
  const row = div && div.querySelector('.adv-config-row');
  const badge = row && row.querySelector('.fortune4511-badge');
  const own = row && row.querySelector('.fortune4512-note');
  return {
    cost: div ? div.querySelector('.en-cost').value : null,
    badgeText: badge ? badge.textContent : null,
    badgeClass: badge ? badge.className : null,
    deferredNote: !!(row && row.querySelector('.fortune4511-note-deferred')),
    ownNoteCount: row ? row.querySelectorAll('.fortune4512-note').length : 0,
    ownNote: own ? own.textContent : null,
  };
});

// Asks the REAL damage maths, per weapon, straight from the trunk's own exported function.
const damage = (page, names, skillRank = 3) => page.evaluate(({ names, skillRank }) => {
  const T = window.__L5R_TEST__;
  const out = {};
  names.forEach(n => {
    const w = T.WEAPON_LIBRARY.find(x => x.name === n);
    const d = T.getWeaponDamageDice(w, skillRank, {});
    out[n] = { traitName: d.traitName, traitValue: d.traitValue, pool: d.numDice + 'k' + d.keepDice };
  });
  return out;
}, { names, skillRank });

// A SIBLING of damage(), not a wider return shape on it: seven checks already assert damage()'s
// exact object, and widening it would mean rewriting all seven to prove nothing. This one reads
// the breakdown lines this phase owns, which is the only place the modal's wording can be
// asserted without driving a full roll per weapon.
const damageNotes = (page, names, skillRank = 3) => page.evaluate(({ names, skillRank }) => {
  const T = window.__L5R_TEST__;
  const out = {};
  names.forEach(n => {
    const w = T.WEAPON_LIBRARY.find(x => x.name === n);
    const d = T.getWeaponDamageDice(w, skillRank, {});
    out[n] = (d.breakdown || []).filter(t => /^Bishamon:/.test(String(t)));
  });
  return out;
}, { names, skillRank });

(async () => {
  const sheet = process.argv[2];
  if (!sheet) { console.error('usage: node disadv-bishamon-harness.js <sheet.html>'); process.exit(2); }
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: PHONE });
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e.message)));
  await page.goto(pathToFileURL(sheet).href);
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.recalcAll);

  // ---------- Contract ----------
  await section('F4512-PRESENT', 'The fragment is present and has taken Bishamon over', async () => {
    await reset(page);
    const seam = await page.evaluate(() => {
      const T = window.__L5R_TEST__;
      return {
        hasF4512: typeof T.F4512 === 'object' && !!T.F4512,
        killSwitch: T.DISADV_BISHAMON_ENABLED,
        installed: !!(T.F4512 && T.F4512.installed),
        effect: T.F4511 ? T.F4511.FORTUNES.Bishamon.effect : null,
        previousEffect: T.F4512 ? T.F4512.previousEffect : null,
        floor: T.F4512 ? T.F4512.MIN_EFFECTIVE_STRENGTH : null,
        hostReachable: !!(T.F4512 && T.F4512.host()),
      };
    });
    truthy('F4512-PRESENT-01', 'F4512 is exported on the test seam', seam.hasF4512);
    truthy('F4512-PRESENT-02', 'The kill-switch is on in this build', seam.killSwitch === true);
    truthy('F4512-PRESENT-03', 'It installed over Feature 4.5.11', seam.installed);
    equal('F4512-PRESENT-04', 'Bishamon’s effect key is no longer 4.5.11’s ‘deferred’',
      seam.effect, 'damageStrength');
    equal('F4512-PRESENT-05', 'It recorded what it replaced, so removal is describable',
      seam.previousEffect, 'deferred');
    truthy('F4512-PRESENT-06', 'Feature 4.5.11 is reachable as the host', seam.hostReachable);
    equal('F4512-PRESENT-07', 'The floor is the documented value', seam.floor, 1);
  });

  // ---------- It takes no seat and contributes no modifier ----------
  await section('F4512-PIPE', 'The pipeline is not the mechanism', async () => {
    await reset(page);
    await setStrength(page, 3);
    await addBishamon(page);
    const seats = await page.evaluate(() => window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.length);
    equal('F4512-PIPE-01', 'Phase 1.5’s registry baseline is untouched at seven', seats, 7);

    // The complement of F4512-ROLL-01: this phase must contribute NOTHING here, because a
    // contribution here would be displayed and never applied. See the file header.
    const mods = await page.evaluate(() => {
      const T = window.__L5R_TEST__;
      const katana = T.WEAPON_LIBRARY.find(w => w.name === 'Katana');
      const ctx = T.makeRollContext(T.ROLL_KINDS.DAMAGE, {
        weaponEntry: katana, skillName: 'Kenjutsu', skillRank: 3 });
      return T.getPreRollModifiers(ctx).map(m => m.label || m.source);
    });
    truthy('F4512-PIPE-02', 'It contributes no pre-roll modifier on a damage context',
      !mods.some(l => /Fortune|Bishamon/i.test(String(l))), `pipeline returned ${JSON.stringify(mods)}`);
  });

  // ---------- The three trait branches, separately ----------
  await section('F4512-BRANCH', 'Each damage branch, checked on its own', async () => {
    await reset(page);
    await setStrength(page, 3);
    const WEAPONS = ['Katana', 'Unarmed', 'Pistol', 'Musket', 'Yumi', 'Han-kyu', 'Dai-kyu', 'Cannon', 'Blowgun'];
    const before = await damage(page, WEAPONS);
    await addBishamon(page);
    const after = await damage(page, WEAPONS);

    // Branch 2 -- ordinary Strength. Melee first.
    equal('F4512-BRANCH-01', 'Katana loses exactly one rolled die and keeps the same kept dice',
      { trait: after.Katana.traitValue, pool: after.Katana.pool },
      { trait: before.Katana.traitValue - 1, pool: '6k2' });

    // Branch 2 -- unarmed reaches it through `dmgTrait || 'Strength'`, which is the audit's
    // 'check unarmed eligibility separately'. The oracle is the damage function's own traitName.
    equal('F4512-BRANCH-02', 'Unarmed is Strength-based and is affected',
      { traitName: after.Unarmed.traitName, trait: after.Unarmed.traitValue, pool: after.Unarmed.pool },
      { traitName: 'Strength', trait: 2, pool: '2k1' });

    // Branch 1 -- a bow whose rating is ABOVE the reduced Strength does move.
    equal('F4512-BRANCH-03', 'Yumi (rating 3) is capped by Strength, so it moves',
      { trait: after.Yumi.traitValue, pool: after.Yumi.pool },
      { trait: 2, pool: '4k2' });

    // Branch 1 -- and the one that a blanket -1k0 would get wrong. Measured: Han-kyu reads
    // traitValue 1 at every Strength 1..5, so the curse can never change it.
    equal('F4512-BRANCH-04', 'Han-kyu (rating 1) is capped by its OWN rating, so it does not move',
      { before: before['Han-kyu'], after: after['Han-kyu'] },
      { before: { traitName: 'Bow Strength', traitValue: 1, pool: '3k2' },
        after: { traitName: 'Bow Strength', traitValue: 1, pool: '3k2' } });

    // Branch 2 -- but a DIFFERENT trait. Not the Strength contribution, so not reduced.
    equal('F4512-BRANCH-05', 'Perception weapons are untouched',
      { Pistol: after.Pistol, Musket: after.Musket },
      { Pistol: before.Pistol, Musket: before.Musket });

    // Branch 3 -- no trait at all.
    equal('F4512-BRANCH-06', 'Flat-DR weapons are untouched',
      { Cannon: after.Cannon, Blowgun: after.Blowgun },
      { Cannon: before.Cannon, Blowgun: before.Blowgun });

    truthy('F4512-BRANCH-07', 'Every weapon’s kept dice are unchanged — this is a rolled-dice penalty',
      WEAPONS.every(n => before[n].pool.split('k')[1] === after[n].pool.split('k')[1]));
  });

  // ---------- A REAL damage roll. The check this phase exists for. ----------
  await section('F4512-ROLL', 'The dice that actually roll are the reduced pool', async () => {
    await reset(page);
    await setStrength(page, 3);
    const rolled = page => page.evaluate(() => {
      const T = window.__L5R_TEST__;
      document.getElementById('addWeapon').click();
      const tr = document.querySelector('#weaponsBody tr:last-child');
      const sel = tr.querySelector('.wp-name');
      sel.value = 'Katana';
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      T.recalcAll();
      T.rollWeaponDamage(tr);
      const dice = Array.from(document.querySelectorAll('#rollDiceRow .roll-die'));
      const body = document.getElementById('rollModalBody');
      const out = { dice: dice.length, kept: dice.filter(d => d.classList.contains('kept')).length,
        text: body ? body.textContent.replace(/\s+/g, ' ').trim() : '' };
      document.querySelectorAll('#weaponsBody tr').forEach(r => r.remove());
      const ov = document.getElementById('rollModalOverlay'); if (ov) ov.style.display = 'none';
      T.recalcAll();
      return out;
    });
    const plain = await rolled(page);
    await addBishamon(page);
    const cursed = await rolled(page);

    equal('F4512-ROLL-01', 'A real damage roll rolls one die FEWER with Bishamon configured',
      { plainDice: plain.dice, cursedDice: cursed.dice, plainKept: plain.kept, cursedKept: cursed.kept },
      { plainDice: 6, cursedDice: 5, plainKept: 2, cursedKept: 2 });
    truthy('F4512-ROLL-02', 'The damage breakdown names Bishamon rather than leaving the drop unexplained',
      /Bishamon/.test(cursed.text), (cursed.text.match(/Bishamon:[^.]*\./) || [''])[0]);
    truthy('F4512-ROLL-03', 'An uncursed damage roll says nothing about Bishamon',
      !/Bishamon/.test(plain.text));
  });

  // ---------- The floor ----------
  await section('F4512-FLOOR', 'Strength 1', async () => {
    await reset(page);
    await setStrength(page, 1);
    const before = await damage(page, ['Katana', 'Unarmed']);
    await addBishamon(page);
    const after = await damage(page, ['Katana', 'Unarmed']);
    equal('F4512-FLOOR-01', 'At Strength 1 the curse costs nothing, rather than reaching 0',
      after, before);
    truthy('F4512-FLOOR-02', 'Unarmed never reaches a pool rollWeaponDamage() would refuse',
      after.Unarmed.pool === '1k1', after.Unarmed.pool);
    const row = await rowState(page);
    truthy('F4512-FLOOR-03', 'The row says plainly that it is costing nothing right now',
      /costing you nothing/.test(row.ownNote || ''), row.ownNote);
  });

  // ---------- What the modal says when the curse costs NOTHING ----------
  // Added after real-device testing, which found the hole these close. The dice were correct in
  // every case below; the modal was SILENT in two of them, and silence on a configured, paid-for
  // curse reads as 'not implemented' rather than 'cannot bite here'. The row explained itself
  // correctly the whole time -- but the row is not where a player is looking when they roll.
  //
  // The discrimination that matters: an explanation is owed where the player's Strength IS the
  // contribution and something stopped the curse, and NOT owed where Strength was never in the
  // pool. A build that explains everything is as wrong as one that explains nothing, so
  // EXPLAIN-04 is the complement and fails if the note starts appearing on pistols.
  await section('F4512-EXPLAIN', 'The zero-cost cases explain themselves', async () => {
    await reset(page);
    await setStrength(page, 1);
    await addBishamon(page);
    const floored = await damageNotes(page, ['Katana', 'Unarmed']);

    truthy('F4512-EXPLAIN-01', 'At Strength 1 the damage breakdown says why the curse costs nothing',
      floored.Katana.length === 1 && /lowest this sheet allows/.test(floored.Katana[0]),
      floored.Katana[0]);
    truthy('F4512-EXPLAIN-02', 'Unarmed gets that same explanation at the floor',
      floored.Unarmed.length === 1 && /costs nothing/.test(floored.Unarmed[0]),
      floored.Unarmed[0]);

    await reset(page);
    await setStrength(page, 3);
    await addBishamon(page);
    const capped = await damageNotes(page, ['Han-kyu', 'Pistol', 'Cannon', 'Katana', 'Yumi']);

    // The floor is NOT the reason here -- Strength 3 is well clear of it -- so naming the floor
    // would be a true sentence about the wrong cause. This check reads the rating back.
    truthy('F4512-EXPLAIN-03', 'Han-kyu names its OWN rating as the limit, not the floor',
      capped['Han-kyu'].length === 1 && /own rating of 1/.test(capped['Han-kyu'][0]),
      capped['Han-kyu'][0]);
    equal('F4512-EXPLAIN-04', 'Perception and flat-DR weapons stay silent — the curse was never theirs',
      { Pistol: capped.Pistol.length, Cannon: capped.Cannon.length }, { Pistol: 0, Cannon: 0 });

    // The rewording. 'Bow Strength counts as 1' was read on a real device as the BOW's rating.
    truthy('F4512-EXPLAIN-05', 'A real reduction names ‘your Strength’, not the bare trait label',
      /your Strength counts as 2 rather than 3/.test(capped.Katana[0] || ''), capped.Katana[0]);
    truthy('F4512-EXPLAIN-06', 'The bow reduction is attributed to the bow’s damage, not to a ‘Bow Strength’',
      /your Strength counts as/.test(capped.Yumi[0] || '') &&
      !/Bow Strength counts/.test(capped.Yumi[0] || ''), capped.Yumi[0]);
  });

  // ---------- Isolation: actual Strength and its other consumers ----------
  await section('F4512-ISOLATE', 'Nothing but weapon damage moves', async () => {
    await reset(page);
    await setStrength(page, 3);
    const snap = () => page.evaluate(() => {
      const T = window.__L5R_TEST__;
      return {
        traitInput: document.getElementById('trait_strength').value,
        strengthRead: T.getTraitValueByName('Strength'),
        water: document.getElementById('ring_water').value,
        earth: document.getElementById('ring_earth').value,
        attack: (a => a.traitName + '|' + a.numDice + 'k' + a.keepDice)(T.getWeaponAttackDice('Kenjutsu')),
      };
    });
    const before = await snap();
    await addBishamon(page);
    const after = await snap();
    equal('F4512-ISOLATE-01', 'The Strength Trait itself is never written', after.traitInput, before.traitInput);
    equal('F4512-ISOLATE-02', 'getTraitValueByName still reports the real Strength',
      after.strengthRead, before.strengthRead);
    equal('F4512-ISOLATE-03', 'The Water Ring — which Strength feeds — does not move',
      after.water, before.water);
    equal('F4512-ISOLATE-04', 'An attack roll is unaffected', after.attack, before.attack);
  });

  // ---------- The row ----------
  await section('F4512-ROW', 'What the row shows', async () => {
    await reset(page);
    await setStrength(page, 3);
    await addBishamon(page);
    const row = await rowState(page);
    equal('F4512-ROW-01', 'It is still priced at the ordinary 3 points', row.cost, '3');
    equal('F4512-ROW-02', 'The badge still names the Fortune', row.badgeText, FORTUNE);
    truthy('F4512-ROW-03', 'The badge no longer carries 4.5.11’s quiet deferred treatment',
      !/fortune4511-eff-deferred/.test(row.badgeClass || '') &&
      /fortune4511-eff-damageStrength/.test(row.badgeClass || ''), row.badgeClass);
    truthy('F4512-ROW-04', 'Feature 4.5.11’s ‘not yet automated’ note is gone', !row.deferredNote);
    truthy('F4512-ROW-05', 'This phase’s own note names both numbers',
      /Strength 2 instead of 3/.test(row.ownNote || ''), row.ownNote);

    await page.evaluate(() => { const T = window.__L5R_TEST__; T.recalcAll(); T.recalcAll(); T.recalcAll(); });
    const again = await rowState(page);
    equal('F4512-ROW-06', 'Repeated recalcs do not stack duplicate notes', again.ownNoteCount, 1);

    const moved = await setStrength(page, 5);
    const after = await rowState(page);
    truthy('F4512-ROW-07', 'The note follows the Trait rather than freezing at its first value',
      moved === 5 && /Strength 4 instead of 5/.test(after.ownNote || ''), after.ownNote);
  });

  // ---------- Two entries ----------
  await section('F4512-STACK', 'Duplicate entries', async () => {
    await reset(page);
    await setStrength(page, 4);
    await addBishamon(page);
    const one = await damage(page, ['Katana']);
    const rows = await addBishamon(page);
    const two = await damage(page, ['Katana']);
    const count = await page.evaluate(() => window.__L5R_TEST__.F4512.count());
    equal('F4512-STACK-01', 'A second Bishamon row reduces Strength again, matching 4.5.11’s own per-row shape',
      { rows, count, one: one.Katana.pool, two: two.Katana.pool },
      { rows: 2, count: 2, one: '7k2', two: '6k2' });
    await setStrength(page, 2);
    const floored = await damage(page, ['Katana']);
    truthy('F4512-STACK-02', 'Stacking still cannot push below the floor',
      floored.Katana.traitValue === 1, JSON.stringify(floored.Katana));
  });

  // ---------- Other Fortunes are untouched ----------
  await section('F4512-SCOPE', 'It is scoped to Bishamon alone', async () => {
    await reset(page);
    await setStrength(page, 3);
    const before = await damage(page, ['Katana']);
    for (const other of ['Benten', 'Daikoku', 'Hotei']) {
      await reset(page);
      await setStrength(page, 3);
      await addBishamon(page, other);
      const after = await damage(page, ['Katana']);
      equal(`F4512-SCOPE-${other}`, `${other} does not touch weapon damage`, after, before);
    }
    await reset(page);
    await setStrength(page, 3);
    await addBishamon(page, 'Hotei');
    const hotei = await rowState(page);
    truthy('F4512-SCOPE-HOTEI-DEFER', 'Hotei is still recorded as deferred — this phase is D04b’s first half only',
      hotei.deferredNote && hotei.ownNoteCount === 0);
  });

  // ---------- Persistence ----------
  await section('F4512-SAVE', 'Round-trip', async () => {
    await reset(page);
    await setStrength(page, 3);
    await addBishamon(page);
    const out = await page.evaluate(() => {
      const T = window.__L5R_TEST__;
      const saved = JSON.parse(JSON.stringify(T.collectCharacter ? T.collectCharacter() : {}));
      const stored = JSON.parse(document.querySelector('#disadvList .entry:last-child').dataset.advConfig);
      return { stored, savedKeys: Object.keys(saved).length };
    });
    equal('F4512-SAVE-01', 'The stored config is 4.5.11’s shape — this phase persists nothing of its own',
      out.stored, { type: 'fortunePick', fortune: 'Bishamon', value: 'Bishamon' });
  });

  // ---------- Geometry ----------
  // Written after measuring both builds. Width (303px) and x position are IDENTICAL with the
  // stylesheet dropped, because the row's own flex context supplies them, so neither is asserted.
  await section('F4512-GEOM', 'What this phase’s own stylesheet actually supplies', async () => {
    await reset(page);
    await setStrength(page, 3);
    await addBishamon(page);
    const g = await page.evaluate(() => {
      const row = document.querySelector('#disadvList .entry:last-child .adv-config-row');
      const note = row && row.querySelector('.fortune4512-note');
      if (!note) return null;
      const cs = getComputedStyle(note);
      const rowCs = getComputedStyle(row);
      return { flexBasis: cs.flexBasis, marginTop: cs.marginTop,
        fontPx: parseFloat(cs.fontSize), rowFontPx: parseFloat(rowCs.fontSize), color: cs.color };
    });
    truthy('F4512-GEOM-01', 'The note claims the full row width through its own flex-basis',
      g && g.flexBasis === '100%', g && g.flexBasis);
    truthy('F4512-GEOM-02', 'It is separated from the line above by its own margin',
      g && g.marginTop === '4px', g && g.marginTop);
    truthy('F4512-GEOM-03', 'It renders smaller than the row it sits in',
      g && g.fontPx < g.rowFontPx, g && `${g.fontPx} vs ${g.rowFontPx}`);
    truthy('F4512-GEOM-04', 'It carries the sheet’s accent colour rather than inheriting body ink',
      g && g.color === 'rgb(163, 51, 42)', g && g.color);
  });

  truthy('F4512-CLEAN-01', 'No uncaught page errors during the run', pageErrors.length === 0,
    pageErrors.join(' | '));

  await browser.close();
  const passed = results.filter(r => r.pass).length;
  console.log(`\nFEATURE 4.5.12 — ${passed}/${results.length} checks passed`);
  console.log(`BISHAMON_SUITE_RESULT=${JSON.stringify({ passed, total: results.length })}`);
  process.exit(passed === results.length ? 0 : 1);
})();
