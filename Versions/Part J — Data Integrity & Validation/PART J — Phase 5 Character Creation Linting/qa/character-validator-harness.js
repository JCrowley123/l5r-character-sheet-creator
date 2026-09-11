/* =============================================================================
   PART J PHASE 5 — CHARACTER CREATION LINTING — AUTOMATED CHECKS

     NODE_PATH=$(npm root -g) node qa/character-validator-harness.js <built-sheet.html>

   WHAT THIS PHASE CHANGED. Nothing about how the sheet computes. It adds a
   CharacterValidator -- nine discrete rule functions over state the sheet
   already maintains -- and a ValidationReport panel that renders their
   findings. No rule clamps, blocks or writes anything.

   THE ORACLE IS THE SHEET'S OWN STATE, NEVER THE VALIDATOR'S VIEW OF IT.
   This is the trap Part H Phase 1 fell into and the reason CLAUDE.md carries
   the "a harness must be able to fail" rule: that harness asked the code under
   test which element was on screen, scrolled it, then asked the same code
   whether the button should show. Both halves agreed with each other and
   neither agreed with reality.

   So every check here derives what the answer SHOULD be from something this
   phase does not own, and only then asks the validator:

     * XP        -- f_xpSpent is written by recalcAll(), not by this phase.
                    The harness compares it against f_xpTotal itself and
                    predicts the finding from that comparison.
     * Schools   -- the expected caster category is read off SCHOOL_LIBRARY's
                    own `shugenja` flag and school name, not from
                    schoolCasterCategory().
     * Skills    -- the expected "missing School Skills" set is computed here,
                    from the library's raw `skills` string and the live Skills
                    table, with a parser written independently of the one in
                    the fragment.
     * The panel -- checks 16-17 read the PAINTED DOM, not the returned
                    findings, so a report that computes correctly and renders
                    nothing still fails.

   PROVING IT CAN FAIL. See this phase's README: the same file is run against
   a build with CHARACTER_VALIDATOR_ENABLED = false and against one with the
   fragment deleted, and both numbers are recorded there. A check that cannot
   go red for the right reason is not evidence.

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

// Every seam call goes through this. Against a build with the phase disabled or deleted the
// validator returns an empty report rather than throwing, so the harness can still report a
// NUMBER instead of dying and proving nothing.
const idsOf = (report, ruleId) =>
  ((report && report.findings) || []).filter(f => f.id === ruleId);

// Put the sheet back to a known-clean character between checks, so no check inherits the
// state of the one before it.
const reset = async (page) => {
  await page.evaluate(() => {
    window.__L5R_TEST__.resetToBaseline();
    window.__L5R_TEST__.recalcAll();
  });
};

const validate = (page) => page.evaluate(() => window.__L5R_TEST__.validateCharacter());

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('usage: character-validator-harness.js <built-sheet.html>');
    process.exit(2);
  }

  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  await page.goto(pathToFileURL(path.resolve(file)).href);
  await page.waitForTimeout(300);

  const present = await page.evaluate(() => typeof (window.__L5R_TEST__ || {}).validateCharacter);
  if (present !== 'function') {
    record('the phase exports validateCharacter on the test seam', false, 'got ' + present);
    console.log('\nThe rest of this harness needs that function. Stopping here.');
    console.log(`\n${results.filter(r => r.pass).length}/${results.length} checks passed`);
    await browser.close();
    process.exit(1);
  }
  record('the phase exports validateCharacter on the test seam', true);

  // =========================================================================
  // 2. A freshly reset character reports no ERRORS. Warnings and notes are
  //    allowed (a baseline character has unspent XP by design), so this
  //    asserts the error count specifically rather than an empty report --
  //    an assertion of "nothing at all" would be weaker and also wrong.
  // =========================================================================
  await reset(page);
  check('a baseline character reports no errors',
    (await validate(page)).counts.error, 0);

  // =========================================================================
  // 3-4. XP overspend. The oracle is recalcAll()'s own f_xpSpent compared
  //      against f_xpTotal HERE, not the rule's opinion of them.
  // =========================================================================
  await reset(page);
  const xpProbe = await page.evaluate(() => {
    // Drive spend up through a real purchase path rather than writing f_xpSpent
    // directly: f_xpSpent is readonly and recalcAll() overwrites it, so setting it
    // would test nothing. Raising a Trait is the cheapest genuine purchase.
    document.getElementById('trait_agility').value = 5;
    document.getElementById('f_xpTotal').value = 1;
    window.__L5R_TEST__.recalcAll();
    return {
      spent: parseFloat(document.getElementById('f_xpSpent').value || '0'),
      total: parseFloat(document.getElementById('f_xpTotal').value || '0'),
      report: window.__L5R_TEST__.validateCharacter(),
    };
  });
  check('XP overspend fires exactly when the sheet\'s own spent exceeds its own total',
    idsOf(xpProbe.report, 'xp-overspend').length === 1, xpProbe.spent > xpProbe.total);
  check('...and the overspend finding is an error',
    (idsOf(xpProbe.report, 'xp-overspend')[0] || {}).severity, 'error');

  await reset(page);
  const xpOk = await page.evaluate(() => {
    document.getElementById('f_xpTotal').value = 9999;
    window.__L5R_TEST__.recalcAll();
    return window.__L5R_TEST__.validateCharacter();
  });
  check('XP overspend stays silent when the character is within budget',
    idsOf(xpOk, 'xp-overspend').length, 0);
  check('...and unspent XP is reported as a note, not a problem',
    (idsOf(xpOk, 'xp-unspent')[0] || {}).severity, 'info');

  // =========================================================================
  // 6-7. Trait range. The oracle is the input element's OWN min/max
  //      attributes, read here, so the rule cannot pass by agreeing with a
  //      hardcoded range this harness also hardcodes.
  // =========================================================================
  await reset(page);
  const rangeProbe = await page.evaluate(() => {
    const el = document.getElementById('trait_agility');
    const max = parseInt(el.max || '10', 10);
    el.value = max + 3;
    window.__L5R_TEST__.recalcAll();
    return { max, report: window.__L5R_TEST__.validateCharacter() };
  });
  check('a Trait above its input\'s own max is an error',
    idsOf(rangeProbe.report, 'trait-range').map(f => f.severity), ['error']);
  check('...and the finding names the offending Trait',
    /Agility/.test((idsOf(rangeProbe.report, 'trait-range')[0] || {}).title || ''), true);

  await reset(page);
  check('an in-range Trait produces no range finding',
    idsOf(await validate(page), 'trait-range').length, 0);

  // =========================================================================
  // 9. Free floor. data-free is written by Apply Family / Apply School, not
  //    by this phase; the check drops the value below whatever floor is
  //    actually recorded rather than assuming one.
  // =========================================================================
  await reset(page);
  const floorProbe = await page.evaluate(() => {
    const el = document.getElementById('trait_stamina');
    el.dataset.free = '3';
    el.value = 2;
    window.__L5R_TEST__.recalcAll();
    return window.__L5R_TEST__.validateCharacter();
  });
  check('a Trait below its recorded free floor is a warning, not an error',
    idsOf(floorProbe, 'trait-below-free-floor').map(f => f.severity), ['warning']);

  // =========================================================================
  // 10-11. Caster lock. The expected answer is derived from SCHOOL_LIBRARY's
  //        own data -- the `shugenja` flag and the school name -- rather than
  //        from schoolCasterCategory(), which is part of what is being relied
  //        on. Two real schools are picked out of the library at runtime so
  //        the check cannot rot against a library edit.
  // =========================================================================
  await reset(page);
  const lockProbe = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const all = T.allSchoolEntries();
    // Independent of schoolCasterCategory(): a Shugenja School is the one flagged
    // `shugenja`, a Bushi School is the one whose name contains the word.
    const shug = all.find(s => s.shugenja);
    const bushi = all.find(s => !s.shugenja && /\bbushi\b/i.test(s.name));
    T.saveSchoolsList([
      { name: bushi.name, frozen: true, frozenRank: 1, floorRank: 0, anchorInsightRank: 1 },
      { name: shug.name, frozen: false, frozenRank: null, floorRank: 0, anchorInsightRank: 1 },
    ]);
    window.__L5R_TEST__.recalcAll();
    return { bushi: bushi.name, shug: shug.name, report: T.validateCharacter() };
  });
  check('holding both a Bushi and a Shugenja School is an error',
    idsOf(lockProbe.report, 'caster-lock-conflict').map(f => f.severity), ['error']);
  check('...and the finding names both offending Schools',
    (() => {
      const d = (idsOf(lockProbe.report, 'caster-lock-conflict')[0] || {}).detail || '';
      return d.includes(lockProbe.bushi) && d.includes(lockProbe.shug);
    })(), true);

  await reset(page);
  const twoBushi = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const all = T.allSchoolEntries();
    const bushis = all.filter(s => !s.shugenja && /\bbushi\b/i.test(s.name)).slice(0, 2);
    T.saveSchoolsList(bushis.map((s, i) => ({
      name: s.name, frozen: i === 0, frozenRank: i === 0 ? 1 : null, floorRank: 0, anchorInsightRank: 1,
    })));
    window.__L5R_TEST__.recalcAll();
    return T.validateCharacter();
  });
  check('two Bushi Schools are not a caster-lock conflict',
    idsOf(twoBushi, 'caster-lock-conflict').length, 0);

  // =========================================================================
  // 12-13. Bushi spell violation, and the Maho exemption the sheet already
  //        models. Entries are built through the sheet's own makeEntry(), so
  //        the dataset markers are the real ones rather than a fake shape
  //        this harness invented.
  // =========================================================================
  await reset(page);
  const bushiSpell = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const all = T.allSchoolEntries();
    const bushi = all.find(s => !s.shugenja && /\bbushi\b/i.test(s.name));
    T.saveSchoolsList([{ name: bushi.name, frozen: false, frozenRank: null, floorRank: 0, anchorInsightRank: 1 }]);
    document.getElementById('techList').appendChild(
      T.makeEntry({ name: 'Sense', spellElement: 'universal', spellMastery: 1 }, true, 'XP'));
    window.__L5R_TEST__.recalcAll();
    return T.validateCharacter();
  });
  check('an ordinary spell on a Bushi character is an error',
    idsOf(bushiSpell, 'bushi-spell').map(f => f.severity), ['error']);

  await reset(page);
  const mahoOk = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const all = T.allSchoolEntries();
    const bushi = all.find(s => !s.shugenja && /\bbushi\b/i.test(s.name));
    T.saveSchoolsList([{ name: bushi.name, frozen: false, frozenRank: null, floorRank: 0, anchorInsightRank: 1 }]);
    document.getElementById('techList').appendChild(
      T.makeEntry({ name: 'Bleeding', spellElement: 'water', spellMastery: 1, spellIsMaho: true }, true, 'XP'));
    window.__L5R_TEST__.recalcAll();
    return T.validateCharacter();
  });
  check('a Maho spell on a Bushi character is exempt, as the spell picker already has it',
    idsOf(mahoOk, 'bushi-spell').length, 0);

  // =========================================================================
  // 14. Missing School Skills. The expected set is computed HERE from the
  //     library's raw `skills` string and the live Skills table, with a
  //     parser written independently of validatorConcreteSkills(). If the
  //     two parsers disagree, this check fails -- which is the point.
  // =========================================================================
  await reset(page);
  const skillProbe = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const all = T.allSchoolEntries();
    const school = all.find(s => /,/.test(s.skills));
    T.saveSchoolsList([{ name: school.name, frozen: false, frozenRank: null, floorRank: 0, anchorInsightRank: 1 }]);
    window.__L5R_TEST__.recalcAll();

    // Independent parse: same four steps, written separately.
    const expected = school.skills.split(',')
      .map(s => s.trim())
      .filter(s => !/^any\b/i.test(s))
      .map(s => s.replace(/\s*\d+\s*$/, '').replace(/\s*\([^)]*\)\s*$/, '').trim())
      .filter(Boolean);
    const owned = {};
    document.querySelectorAll('#skillsBody tr').forEach(tr => {
      const n = (tr.querySelector('.sk-name') || {}).value;
      const r = parseInt(((tr.querySelector('.sk-rank') || {}).value) || '0', 10) || 0;
      if (n) owned[n.trim().toLowerCase()] = Math.max(owned[n.trim().toLowerCase()] || 0, r);
    });
    const expectedMissing = expected.filter(s => (owned[s.toLowerCase()] || 0) < 1);
    return {
      school: school.name,
      expectedMissingCount: expectedMissing.length,
      report: T.validateCharacter(),
      parsedByPhase: T.validatorConcreteSkills(school),
      expected,
    };
  });
  check('the phase\'s School-Skill parse matches an independently written one',
    skillProbe.parsedByPhase, skillProbe.expected);
  check('missing School Skills are reported, and the count matches the independent one',
    (() => {
      const f = idsOf(skillProbe.report, 'school-skills-missing')[0];
      if (!f) return skillProbe.expectedMissingCount === 0 ? 0 : 'no finding';
      const m = f.title.match(/(\d+) School Skill/);
      return m ? parseInt(m[1], 10) : 'unparseable';
    })(), skillProbe.expectedMissingCount);
  check('...and it is a warning, since the character is legal but unfinished',
    (idsOf(skillProbe.report, 'school-skills-missing')[0] || {}).severity, 'warning');

  // =========================================================================
  // 17. Findings are ordered by severity, so the worst thing is never buried
  //     under three notes. Asserted against the rendered ORDER, not the
  //     registry order.
  // =========================================================================
  const order = { error: 0, warning: 1, info: 2 };
  check('findings come back sorted worst-first',
    (() => {
      const sevs = (skillProbe.report.findings || []).map(f => order[f.severity]);
      return sevs.every((v, i) => i === 0 || sevs[i - 1] <= v);
    })(), true);

  // =========================================================================
  // 18-19. THE PANEL, READ FROM THE PAINTED DOM. A validator that computes
  //        perfectly and renders nothing is a broken feature, and asking the
  //        renderer what it thinks it drew would not catch that.
  // =========================================================================
  const painted = await page.evaluate(() => {
    const host = document.getElementById('validationReport');
    if (!host) return null;
    return {
      rows: host.querySelectorAll('.vr-row').length,
      rules: Array.from(host.querySelectorAll('.vr-row')).map(n => n.dataset.rule),
      text: host.textContent.trim().slice(0, 40),
    };
  });
  check('the panel paints one row per finding',
    painted && painted.rows, (skillProbe.report.findings || []).length);
  check('...and each painted row carries the id of the rule that produced it',
    painted && painted.rules.every(r => (skillProbe.report.findings || []).some(f => f.id === r)), true);

  // =========================================================================
  // 20. A clean character paints the clean state rather than an empty panel,
  //     so "no issues" is distinguishable from "the validator did not run".
  // =========================================================================
  await reset(page);
  const cleanPaint = await page.evaluate(() => {
    document.getElementById('f_xpTotal').value = 0;
    document.getElementById('f_xpAdjust').value = 0;
    window.__L5R_TEST__.recalcAll();
    const host = document.getElementById('validationReport');
    return { clean: !!host.querySelector('.vr-badge-clean'), rows: host.querySelectorAll('.vr-row').length };
  });
  check('a character with nothing to report paints the clean state, not an empty box',
    cleanPaint, { clean: true, rows: 0 });

  // =========================================================================
  // 21. A rule that throws is contained. Proven by making one throw for real
  //     rather than by reading the try/catch and believing it.
  // =========================================================================
  // The character is deliberately given an UNRELATED failing rule first (a Trait out of
  // range). Without one, the only finding a baseline character produces is the very rule being
  // made to throw, so "the other rules still ran" would read false for an honest reason and
  // prove nothing about containment. That is how this check first failed, and the assertion
  // was the thing that was wrong.
  await reset(page);
  const contained = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    document.getElementById('trait_agility').value = 99;
    T.recalcAll();
    const rule = T.CHARACTER_VALIDATOR_RULES.find(r => r.id === 'xp-unspent');
    const original = rule.fn;
    rule.fn = () => { throw new Error('deliberate harness failure'); };
    let report;
    try { report = T.validateCharacter(); } finally { rule.fn = original; }
    return {
      stillRan: report.findings.some(f => f.id === 'trait-range'),
      reported: report.findings.some(f => f.id === 'rule-threw'),
    };
  });
  check('a rule that throws is contained, and the other rules still run',
    contained, { stillRan: true, reported: true });

  // =========================================================================
  // 22. The kill-switch is exported and honest.
  // =========================================================================
  check('the phase exports its kill-switch as enabled',
    await page.evaluate(() => window.__L5R_TEST__.CHARACTER_VALIDATOR_ENABLED), true);

  if (pageErrors.length) {
    record('no uncaught page errors', false, pageErrors.join(' | '));
  } else {
    record('no uncaught page errors', true);
  }

  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  await browser.close();
  process.exit(passed === results.length ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
