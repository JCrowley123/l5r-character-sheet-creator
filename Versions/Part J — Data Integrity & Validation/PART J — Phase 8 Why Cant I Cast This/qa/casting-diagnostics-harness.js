/* =============================================================================
   PART J PHASE 8 — CASTING DIAGNOSTICS ("Why can't I cast this?") — AUTOMATED CHECKS

     NODE_PATH=$(npm root -g) node qa/casting-diagnostics-harness.js <built-sheet.html>

   WHAT THIS PHASE CHANGED. Nothing about how the sheet casts. castSpell() is
   untouched: it still spends a slot and rolls, whatever this engine reports.
   The phase adds a CastingDiagnosticEngine (an open registry of seven rules)
   and a modal that renders their findings, plus a badge on each spell entry.

   THE ORACLE IS NEVER THE ENGINE'S OWN VIEW. This is the trap Part H Phase 1
   fell into and the reason CLAUDE.md carries the "a harness must be able to
   fail" rule. So every expectation below is derived from something this phase
   does not own:

     * Effective School Rank -- recomputed HERE from the f_rank input and the
       School's raw `affinity`/`deficiency` fields off SCHOOL_LIBRARY, with
       arithmetic written independently of effectiveSchoolRankForElement().
       A rule that agrees with a broken context still fails.
     * Caster category -- read off the library entry's own `shugenja` flag and
       school name, never from schoolCasterCategory().
     * Scroll presence -- read straight out of #equipBody's inputs, not from
       hasSpellScroll().
     * Slot state -- read straight off ring_<el> / spell_used_<el> /
       ring_void / spell_bonus_used_shared.
     * The modal -- checks read the PAINTED DOM, so an engine that computes
       correctly and renders nothing still fails.

   THE EXTENSION-POINT CHECKS ARE THE POINT OF THIS PHASE. Checks 22-26 drive
   the registry the way Part G Phase 6 will: register a contributor, have it
   add a finding, have it SUPPRESS one of the built-in blockers, watch a
   throwing contributor get contained, and unregister it again. Phase 6 does
   not exist yet, so these are the only evidence that the seam it is promised
   actually works.

   PROVING IT CAN FAIL. See this phase's README: the same file is run against
   a build with CASTING_DIAGNOSTICS_ENABLED = false and against one with the
   fragment deleted, and both numbers are recorded there.

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

const idsOf = (report, ruleId) =>
  ((report && report.findings) || []).filter(f => f.id === ruleId);

const reset = async (page) => {
  await page.evaluate(() => {
    window.__L5R_TEST__.resetToBaseline();
    window.__L5R_TEST__.recalcAll();
    document.getElementById('techList').innerHTML = '';
  });
};

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('usage: casting-diagnostics-harness.js <built-sheet.html>');
    process.exit(2);
  }

  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  await page.goto(pathToFileURL(path.resolve(file)).href);
  await page.waitForTimeout(300);

  // =========================================================================
  // 1. The seam export. Everything below needs it.
  // =========================================================================
  const present = await page.evaluate(() => typeof (window.__L5R_TEST__ || {}).getCastingDiagnostics);
  if (present !== 'function') {
    record('the phase exports getCastingDiagnostics on the test seam', false, 'got ' + present);
    console.log('\nThe rest of this harness needs that function. Stopping here.');
    console.log(`\n${results.filter(r => r.pass).length}/${results.length} checks passed`);
    await browser.close();
    process.exit(1);
  }
  record('the phase exports getCastingDiagnostics on the test seam', true);

  // =========================================================================
  // 2. The seven built-in rules are all registered, in priority order.
  // =========================================================================
  const registered = await page.evaluate(() =>
    window.__L5R_TEST__.CASTING_DIAGNOSTIC_REGISTRY.map(r => r.id));
  // Conditional on Feature 4.5.20 (Void Versatility), which registers one contributor of its
  // own after the seven: expected with it present, absent once it is removed. Declared in that
  // release's ROLLBACK.md; the seven built-ins are checked exactly either way.
  const vv4520Present = await page.evaluate(() => typeof window.__L5R_TEST__.VV4520 === 'object');
  check('all seven built-in rules are registered', registered,
    ['school-restriction', 'rank-too-low', 'deficiency-lockout', 'wrong-element',
     'missing-scroll', 'not-memorised', 'no-slots'].concat(vv4520Present ? ['void-versatility'] : []));

  // =========================================================================
  // 3-5. School restriction. The expected caster category is taken from the
  //      library entry's own shugenja flag / name, never from the sheet's
  //      schoolCasterCategory().
  // =========================================================================
  await reset(page);
  const bushiOrdinary = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const bushi = T.allSchoolEntries().find(s => !s.shugenja && /\bbushi\b/i.test(s.name));
    T.saveSchoolsList([{ name: bushi.name, frozen: false, frozenRank: null, floorRank: 0, anchorInsightRank: 1 }]);
    // recalcAll() is what writes f_school, and f_school is what
    // getActiveSchoolElementalProfile() reads -- so without this the School's Affinity and
    // Deficiency are simply not in effect. Found by this harness failing for exactly that
    // reason on its first run; f_rank is therefore set AFTER it, since recalcAll() owns that field.
    T.recalcAll();
    const entry = T.makeEntry({ name: 'Sense', spellElement: 'universal', spellMastery: 1 }, true, 'XP');
    document.getElementById('techList').appendChild(entry);
    return { report: T.diagnoseCastability(entry), school: bushi.name };
  });
  check('an ordinary spell on a Bushi character is a blocker',
    idsOf(bushiOrdinary.report, 'school-restriction').map(f => f.severity), ['blocker']);
  // Null-safe on purpose: against a disabled or deleted build there is no finding to index
  // into, and this harness has to keep scoring rather than throw. A harness that dies proves
  // nothing -- the whole point of running it against a broken build is to read a NUMBER.
  check('...and the finding names the School that locked the path',
    ((idsOf(bushiOrdinary.report, 'school-restriction')[0] || {}).detail || '')
      .includes(bushiOrdinary.school), true);

  await reset(page);
  const bushiMaho = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const bushi = T.allSchoolEntries().find(s => !s.shugenja && /\bbushi\b/i.test(s.name));
    T.saveSchoolsList([{ name: bushi.name, frozen: false, frozenRank: null, floorRank: 0, anchorInsightRank: 1 }]);
    // recalcAll() is what writes f_school, and f_school is what
    // getActiveSchoolElementalProfile() reads -- so without this the School's Affinity and
    // Deficiency are simply not in effect. Found by this harness failing for exactly that
    // reason on its first run; f_rank is therefore set AFTER it, since recalcAll() owns that field.
    T.recalcAll();
    const entry = T.makeEntry({ name: 'Bleeding', spellElement: 'water', spellMastery: 1, spellIsMaho: true }, true, 'XP');
    document.getElementById('techList').appendChild(entry);
    return T.diagnoseCastability(entry);
  });
  check('a Maho spell on a Bushi character raises no school restriction',
    idsOf(bushiMaho, 'school-restriction').length, 0);

  // =========================================================================
  // 6-8. Rank too low. The oracle is recomputed here from f_rank and the
  //      School's own affinity/deficiency fields, NOT from the sheet's
  //      effectiveSchoolRankForElement().
  // =========================================================================
  await reset(page);
  const rankCase = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const sh = T.allSchoolEntries().find(s => s.shugenja && !s.affinityChoice && s.affinity && s.deficiency);
    T.saveSchoolsList([{ name: sh.name, frozen: false, frozenRank: null, floorRank: 0, anchorInsightRank: 1 }]);
    // recalcAll() is what writes f_school, and f_school is what
    // getActiveSchoolElementalProfile() reads -- so without this the School's Affinity and
    // Deficiency are simply not in effect. Found by this harness failing for exactly that
    // reason on its first run; f_rank is therefore set AFTER it, since recalcAll() owns that field.
    T.recalcAll();
    document.getElementById('f_rank').value = '2';
    // Independent oracle: rank, +1 if the School's affinity Element matches, -1 if its
    // deficiency Element does, floored at 0.
    const oracle = (element) => {
      let r = 2;
      if (sh.affinity === element) r += 1;
      if (sh.deficiency === element) r -= 1;
      return Math.max(0, r);
    };
    // A neutral Element: neither the affinity nor the deficiency.
    const neutral = ['Air', 'Earth', 'Fire', 'Water']
      .find(e => e !== sh.affinity && e !== sh.deficiency);
    const key = neutral.toLowerCase();
    const tooHigh = T.makeEntry({ name: 'Way of Deception', spellElement: key, spellMastery: oracle(neutral) + 1 }, true, 'XP');
    const okSpell = T.makeEntry({ name: 'Path to Inner Peace', spellElement: key, spellMastery: oracle(neutral) }, true, 'XP');
    document.getElementById('techList').appendChild(tooHigh);
    document.getElementById('techList').appendChild(okSpell);
    return {
      school: sh.name, neutral, oracleRank: oracle(neutral),
      tooHigh: T.diagnoseCastability(tooHigh),
      okSpell: T.diagnoseCastability(okSpell),
      ctxRank: T.makeCastingContext(tooHigh).effRank,
    };
  });
  check('the context\'s effective School Rank matches an independently computed one',
    rankCase.ctxRank, rankCase.oracleRank);
  check('a spell above that Rank is a blocker',
    idsOf(rankCase.tooHigh, 'rank-too-low').map(f => f.severity), ['blocker']);
  check('a spell exactly at that Rank raises no rank finding',
    idsOf(rankCase.okSpell, 'rank-too-low').length, 0);

  // =========================================================================
  // 9-11. Deficiency lockout. It replaces the rank finding rather than
  //       joining it -- the same split the sheet already makes inside
  //       universalSpellElementBlockReason(). Both firing would be
  //       double-reporting one gate.
  // =========================================================================
  await reset(page);
  const defCase = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const sh = T.allSchoolEntries().find(s => s.shugenja && !s.affinityChoice && s.deficiency);
    T.saveSchoolsList([{ name: sh.name, frozen: false, frozenRank: null, floorRank: 0, anchorInsightRank: 1 }]);
    // recalcAll() is what writes f_school, and f_school is what
    // getActiveSchoolElementalProfile() reads -- so without this the School's Affinity and
    // Deficiency are simply not in effect. Found by this harness failing for exactly that
    // reason on its first run; f_rank is therefore set AFTER it, since recalcAll() owns that field.
    T.recalcAll();
    document.getElementById('f_rank').value = '2';
    const defKey = sh.deficiency.toLowerCase();
    // Oracle: deficiency drops 2 to 1, so a Mastery 2 spell in that Element is out of reach.
    const entry = T.makeEntry({ name: 'Deficient Spell', spellElement: defKey, spellMastery: 2 }, true, 'XP');
    document.getElementById('techList').appendChild(entry);
    const report = T.diagnoseCastability(entry);
    return { deficiency: sh.deficiency, report, ctxRank: T.makeCastingContext(entry).effRank };
  });
  check('a Deficiency drops the effective Rank as the oracle predicts', defCase.ctxRank, 1);
  check('the Deficiency lockout is a blocker',
    idsOf(defCase.report, 'deficiency-lockout').map(f => f.severity), ['blocker']);
  check('...and the plain rank-too-low finding stays silent, so the gate is reported once',
    idsOf(defCase.report, 'rank-too-low').length, 0);

  // =========================================================================
  // 12-15. Scroll and memorisation. The expected scroll presence is read out
  //        of #equipBody directly rather than from hasSpellScroll().
  // =========================================================================
  await reset(page);
  const scrollCases = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const sh = T.allSchoolEntries().find(s => s.shugenja);
    T.saveSchoolsList([{ name: sh.name, frozen: false, frozenRank: null, floorRank: 0, anchorInsightRank: 1 }]);
    // recalcAll() is what writes f_school, and f_school is what
    // getActiveSchoolElementalProfile() reads -- so without this the School's Affinity and
    // Deficiency are simply not in effect. Found by this harness failing for exactly that
    // reason on its first run; f_rank is therefore set AFTER it, since recalcAll() owns that field.
    T.recalcAll();
    document.getElementById('f_rank').value = '5';
    const mk = (name, extra) => {
      const e = T.makeEntry(Object.assign({ name, spellElement: 'fire', spellMastery: 1 }, extra || {}), true, 'XP');
      document.getElementById('techList').appendChild(e);
      return e;
    };
    const noScroll = mk('Fires of Purity');
    const memorised = mk('Fires From Within', { isMemorised: true });
    // Give the third one a real scroll row, through the sheet's own makeEquipRow.
    const withScroll = mk('Extinguish');
    document.getElementById('equipBody').appendChild(
      T.makeEquipRow({ name: 'Spell Scroll — Extinguish', qty: 1 }));
    // Independent oracle: what does the Equipment table actually say?
    const equipNames = Array.from(document.querySelectorAll('#equipBody .eq-name'))
      .map(i => (i.value || '').trim().toLowerCase());
    return {
      equipHasExtinguish: equipNames.indexOf('spell scroll — extinguish') >= 0,
      equipHasPurity: equipNames.indexOf('spell scroll — fires of purity') >= 0,
      noScroll: T.diagnoseCastability(noScroll),
      memorised: T.diagnoseCastability(memorised),
      withScroll: T.diagnoseCastability(withScroll),
    };
  });
  check('the oracle confirms the Equipment table holds one scroll and not the other',
    [scrollCases.equipHasExtinguish, scrollCases.equipHasPurity], [true, false]);
  check('a spell with no scroll and not memorised is a blocker',
    idsOf(scrollCases.noScroll, 'missing-scroll').map(f => f.severity), ['blocker']);
  check('memorising it removes the scroll requirement entirely',
    idsOf(scrollCases.memorised, 'missing-scroll').length, 0);
  check('holding the scroll clears the blocker and leaves the "not memorised" note',
    [idsOf(scrollCases.withScroll, 'missing-scroll').length,
     idsOf(scrollCases.withScroll, 'not-memorised').map(f => f.severity)], [0, ['note']]);

  // =========================================================================
  // 16-17. Wrong element, the Universal-spell case. Delegates to the picker's
  //        own universalSpellElementBlockReason(), so the report and the
  //        picker cannot disagree -- which is what makes the two severities
  //        here meaningful.
  // =========================================================================
  await reset(page);
  const universalCases = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const sh = T.allSchoolEntries().find(s => s.shugenja && !s.affinityChoice && s.deficiency);
    T.saveSchoolsList([{ name: sh.name, frozen: false, frozenRank: null, floorRank: 0, anchorInsightRank: 1 }]);
    // recalcAll() is what writes f_school, and f_school is what
    // getActiveSchoolElementalProfile() reads -- so without this the School's Affinity and
    // Deficiency are simply not in effect. Found by this harness failing for exactly that
    // reason on its first run; f_rank is therefore set AFTER it, since recalcAll() owns that field.
    T.recalcAll();
    const mk = (mastery) => {
      const e = T.makeEntry({ name: 'Commune', spellElement: 'universal', spellMastery: mastery, isMemorised: true }, true, 'XP');
      document.getElementById('techList').appendChild(e);
      return e;
    };
    document.getElementById('f_rank').value = '2';
    // Mastery 2 with a Deficiency: the deficient Element drops to 1 and is blocked, the
    // others stay at 2 and are fine -> a partial block.
    const partial = T.diagnoseCastability(mk(2));
    // Mastery 9 is beyond every Element at this Rank -> a total block.
    document.getElementById('f_rank').value = '2';
    const total = T.diagnoseCastability(mk(9));
    return { partial, total };
  });
  check('a Universal spell some Elements can still cast is a caution, not a blocker',
    idsOf(universalCases.partial, 'wrong-element').map(f => f.severity), ['caution']);
  check('a Universal spell no Element can cast is a blocker',
    idsOf(universalCases.total, 'wrong-element').map(f => f.severity), ['blocker']);

  // =========================================================================
  // 18-20. Spell slots -- the only refusal the sheet enforces at cast time.
  //        Slot state is read straight off the inputs castSpell() itself uses.
  // =========================================================================
  await reset(page);
  const slotCases = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const sh = T.allSchoolEntries().find(s => s.shugenja);
    T.saveSchoolsList([{ name: sh.name, frozen: false, frozenRank: null, floorRank: 0, anchorInsightRank: 1 }]);
    // recalcAll() is what writes f_school, and f_school is what
    // getActiveSchoolElementalProfile() reads -- so without this the School's Affinity and
    // Deficiency are simply not in effect. Found by this harness failing for exactly that
    // reason on its first run; f_rank is therefore set AFTER it, since recalcAll() owns that field.
    T.recalcAll();
    document.getElementById('f_rank').value = '5';
    const mk = (name, extra) => {
      const e = T.makeEntry(Object.assign({ name, spellElement: 'fire', spellMastery: 1, isMemorised: true }, extra || {}), true, 'XP');
      document.getElementById('techList').appendChild(e);
      return e;
    };
    const spell = mk('Extinguish');
    const maho = mk('Bleeding', { spellIsMaho: true });
    // Spend every Fire slot, leave the shared bonus pool alone.
    document.getElementById('ring_fire').value = '3';
    document.getElementById('spell_used_fire').value = '3';
    document.getElementById('ring_void').value = '2';
    document.getElementById('spell_bonus_used_shared').value = '0';
    const bonusAvailable = T.diagnoseCastability(spell);
    const mahoReport = T.diagnoseCastability(maho);
    // Now spend the bonus pool too.
    document.getElementById('spell_bonus_used_shared').value = '2';
    const nothingLeft = T.diagnoseCastability(spell);
    return {
      oracleFireFree: 3 - 3, oracleBonusFree: 2 - 2,
      bonusAvailable, mahoReport, nothingLeft,
    };
  });
  check('element slots gone but bonus slots left is a caution',
    idsOf(slotCases.bonusAvailable, 'no-slots').map(f => f.severity), ['caution']);
  check('every slot spent is a blocker',
    idsOf(slotCases.nothingLeft, 'no-slots').map(f => f.severity), ['blocker']);
  check('a Maho spell never reports a slot problem, because it spends none',
    idsOf(slotCases.mahoReport, 'no-slots').length, 0);

  // =========================================================================
  // 18b-18e. A UNIVERSAL spell's slot question is plural. Added after real-device
  //        testing: a tester spent every Earth slot AND the whole shared bonus
  //        pool on Commune, and the report said nothing about slots -- while the
  //        sheet's own castSpell() correctly refused. The rule had skipped
  //        Universal spells outright.
  //
  //        The oracle here is the ring_/spell_used_ inputs this harness sets
  //        itself, plus the School's raw deficiency field: a Deficiency-blocked
  //        Element must NEVER be counted as a way to still cast the spell, or the
  //        report invents an escape route that does not exist.
  // =========================================================================
  await reset(page);
  const uni = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const sh = T.allSchoolEntries().find(s => s.shugenja && !s.affinityChoice && s.deficiency);
    T.saveSchoolsList([{ name: sh.name, frozen: false, frozenRank: null, floorRank: 0, anchorInsightRank: 1 }]);
    T.recalcAll();
    // Rank 1 with a Deficiency puts the deficient Element at 0 -- below this Mastery 1
    // spell -- so it is genuinely unavailable and must be excluded from every count below.
    document.getElementById('f_rank').value = '1';
    const entry = T.makeEntry({ name: 'Commune', spellElement: 'universal', spellMastery: 1, isMemorised: true }, true, 'XP');
    document.getElementById('techList').appendChild(entry);
    const set = (k, ring, used) => {
      document.getElementById('ring_' + k).value = String(ring);
      document.getElementById('spell_used_' + k).value = String(used);
    };
    const bonus = (max, used) => {
      document.getElementById('ring_void').value = String(max);
      document.getElementById('spell_bonus_used_shared').value = String(used);
    };
    const slotFinding = () => {
      const f = T.diagnoseCastability(entry).findings.filter(x => x.id === 'no-slots');
      return f.length ? { severity: f[0].severity, detail: f[0].detail } : null;
    };
    const out = { deficiency: sh.deficiency };
    set('air', 3, 0); set('earth', 2, 0); set('fire', 2, 0); set('water', 2, 0); bonus(2, 0);
    out.allFree = slotFinding();
    set('earth', 2, 2); bonus(2, 2);
    out.oneElementGone = slotFinding();
    set('earth', 2, 2); set('fire', 2, 2); set('water', 2, 2); bonus(2, 0);
    out.allEligibleGoneBonusLeft = slotFinding();
    bonus(2, 2);
    out.everythingGone = slotFinding();
    return out;
  });
  check('a Universal spell with slots everywhere reports no slot problem', uni.allFree, null);
  // Null-safe, for the same reason check 4 is: against a build where the rule skips Universal
  // spells (the behaviour this fix replaced) there is no finding to read, and the harness has
  // to keep scoring rather than throw. Proven against exactly that build -- see the README.
  check('one Element out of slots is a note that names the Elements still open',
    [(uni.oneElementGone || {}).severity,
     ((uni.oneElementGone || {}).detail || '').indexOf(uni.deficiency) === -1],
    ['note', true]);
  check('every castable Element out, bonus pool left, is a caution',
    (uni.allEligibleGoneBonusLeft || {}).severity, 'caution');
  check('every castable Element out and the bonus pool spent is a blocker',
    (uni.everythingGone || {}).severity, 'blocker');

  // =========================================================================
  // 21. castable is exactly "no blockers" -- the single fact the UI reads.
  // =========================================================================
  const castableConsistent = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const entry = document.querySelector('#techList .entry');
    const r = T.diagnoseCastability(entry);
    return r.castable === (r.counts.blocker === 0);
  });
  check('castable is true exactly when there are no blockers', castableConsistent, true);

  // =========================================================================
  // 22-26. THE EXTENSION POINT. This is the seam Part G Phase 6 is promised,
  //        driven here the way Phase 6 will drive it. Nothing else proves it.
  // =========================================================================
  await reset(page);
  const extension = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const sh = T.allSchoolEntries().find(s => s.shugenja);
    T.saveSchoolsList([{ name: sh.name, frozen: false, frozenRank: null, floorRank: 0, anchorInsightRank: 1 }]);
    // recalcAll() is what writes f_school, and f_school is what
    // getActiveSchoolElementalProfile() reads -- so without this the School's Affinity and
    // Deficiency are simply not in effect. Found by this harness failing for exactly that
    // reason on its first run; f_rank is therefore set AFTER it, since recalcAll() owns that field.
    T.recalcAll();
    document.getElementById('f_rank').value = '5';
    // No scroll, not memorised -> the built-in missing-scroll blocker fires.
    const entry = T.makeEntry({ name: 'Fires of Purity', spellElement: 'fire', spellMastery: 1 }, true, 'XP');
    document.getElementById('techList').appendChild(entry);
    const before = T.diagnoseCastability(entry);

    // (a) a contributor that ADDS a finding
    T.registerCastingDiagnostic('synergy-stub', 50, () =>
      ({ id: 'synergy-stub', severity: 'note', title: 'Stub synergy', detail: 'from a later phase' }));
    const added = T.diagnoseCastability(entry);

    // (b) a contributor that SUPPRESSES a built-in blocker -- "a technique lets you ignore
    //     the scroll requirement". The blocker must become a visible note, not vanish.
    T.registerCastingDiagnostic('synergy-suppressor', 60, () =>
      T.castingSuppression('missing-scroll', 'Your School technique lets you cast this without the scroll.'));
    const suppressed = T.diagnoseCastability(entry);

    // (c) a contributor that THROWS must not silence the others
    T.registerCastingDiagnostic('synergy-thrower', 70, () => { throw new Error('boom'); });
    const withThrower = T.diagnoseCastability(entry);

    // (d) unregister puts everything back
    T.unregisterCastingDiagnostic('synergy-stub');
    T.unregisterCastingDiagnostic('synergy-suppressor');
    T.unregisterCastingDiagnostic('synergy-thrower');
    const after = T.diagnoseCastability(entry);

    return {
      beforeBlockers: before.counts.blocker,
      addedHasStub: added.findings.some(f => f.id === 'synergy-stub'),
      suppressedBlockers: suppressed.counts.blocker,
      suppressedShowsLifted: suppressed.findings.some(f => f.id === 'missing-scroll-lifted'
        && f.detail.indexOf('without the scroll') >= 0),
      throwerContained: withThrower.findings.some(f => f.id === 'rule-threw')
        && withThrower.findings.some(f => f.id === 'synergy-stub'),
      afterBlockers: after.counts.blocker,
      afterIds: after.findings.map(f => f.id),
    };
  });
  check('the built-in blocker fires before any contributor is added', extension.beforeBlockers, 1);
  check('a registered contributor can add a finding', extension.addedHasStub, true);
  check('a contributor can suppress a built-in blocker', extension.suppressedBlockers, 0);
  check('...and the suppressed blocker is shown as LIFTED, not silently dropped',
    extension.suppressedShowsLifted, true);
  check('a contributor that throws is contained and the others still report',
    extension.throwerContained, true);
  check('unregistering restores the original report',
    [extension.afterBlockers, extension.afterIds.indexOf('synergy-stub')], [1, -1]);

  // =========================================================================
  // 27-29. The painted UI. These read the DOM, so an engine that computes
  //        correctly and renders nothing fails here.
  // =========================================================================
  await reset(page);
  const ui = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const sh = T.allSchoolEntries().find(s => s.shugenja);
    T.saveSchoolsList([{ name: sh.name, frozen: false, frozenRank: null, floorRank: 0, anchorInsightRank: 1 }]);
    // recalcAll() is what writes f_school, and f_school is what
    // getActiveSchoolElementalProfile() reads -- so without this the School's Affinity and
    // Deficiency are simply not in effect. Found by this harness failing for exactly that
    // reason on its first run; f_rank is therefore set AFTER it, since recalcAll() owns that field.
    T.recalcAll();
    document.getElementById('f_rank').value = '5';
    const entry = T.makeEntry({ name: 'Fires of Purity', spellElement: 'fire', spellMastery: 1 }, true, 'XP');
    document.getElementById('techList').appendChild(entry);
    const report = T.diagnoseCastability(entry);
    T.openCastingDiagnostics(entry);
    const overlay = document.getElementById('castWhyModalOverlay');
    const rows = overlay.querySelectorAll('.cwd-row').length;
    const btn = entry.querySelector('.cast-why-btn');
    const blockedBadge = !!(btn && btn.classList.contains('cwd-blocked'));
    T.closeCastingDiagnostics();
    return {
      hasButton: !!btn,
      rows, findings: report.findings.length,
      blockedBadge,
      openDisplay: overlay.style.display,
    };
  });
  check('a spell entry gets the diagnostic button', ui.hasButton, true);
  check('the modal paints one row per finding', ui.rows, ui.findings);
  check('a blocked spell shows the blocked badge on its button', ui.blockedBadge, true);
  check('closing the modal hides it', ui.openDisplay, 'none');

  // =========================================================================
  // 30. Nothing threw anywhere in the run.
  // =========================================================================
  check('no uncaught page errors', pageErrors, []);

  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  await browser.close();
  process.exit(passed === results.length ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(2); });
