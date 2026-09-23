/*
 * Phase 4.5.5 Eligibility Gates + Great Potential Skill Validation — browser validation.
 *
 * Run: node adv-eligibility-harness.js <sheet.html>
 *
 * Every check here drives the real controls — selecting in the quick-add <select>, typing in the
 * modal's own input, clicking its own confirm button — rather than calling the phase's exported
 * helpers and asserting on their return values. That distinction is the whole point of this
 * project's "a harness must be able to fail" rule: Part H Phase 1 shipped broken with 15/15
 * because its harness asked the code under test to confirm itself. R455 is read only where the
 * check is explicitly about the phase's contract.
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

// #f_school is a DISPLAY field, not the source of truth — it is re-rendered from getSchoolsList()
// on every recalc, so a write to it is silently reverted. Worth recording: the first cut of this
// harness drove it directly, watched the value snap back to the previous School, and read that as
// a latched eligibility bug in the phase under test. The real source of truth is the schools list
// that characterCasterLock() reads, so this applies a School the way the sheet itself does.
const setSchool = (page, name) => page.evaluate(school => {
  const el = document.getElementById('f_school');
  el.value = school;
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.dispatchEvent(new Event('input', { bubbles: true }));
  window.__L5R_TEST__.recalcAll();
}, name);

// The real Apply School flow, not a write to #f_school. This is what actually appends the
// School's granted Skills to #skillsBody as school-flagged rows.
const applySchool = async (page, clan, school) => {
  await page.selectOption('#cfs_clan', clan);
  await page.selectOption('#cfs_school', school);
  await page.click('#cfs_applySchool');
  await page.waitForFunction(() => document.querySelectorAll('#skillsBody .sk-name').length > 0,
    { timeout: 5000 });
  await page.evaluate(() => window.__L5R_TEST__.recalcAll());
};

const cardLabels = page => page.evaluate(() =>
  Array.from(document.querySelectorAll('#advConfigSkillChoices .adv-config-skill-choice'))
    .map(card => card.querySelector('span')?.firstChild?.textContent?.trim()));

const addSkillRow = (page, name) => page.evaluate(skill => {
  document.getElementById('addSkill').click();
  const rows = Array.from(document.querySelectorAll('#skillsBody .sk-name'));
  const row = rows[rows.length - 1];
  if (!row) return null;
  row.value = skill;
  row.dispatchEvent(new Event('input', { bubbles: true }));
  row.dispatchEvent(new Event('change', { bubbles: true }));
  window.__L5R_TEST__.recalcAll();
  return row.value;
}, name);

const optionState = (page, selectId, value) => page.evaluate(({ selectId, value }) => {
  const option = Array.from(document.getElementById(selectId).options).find(o => o.value === value);
  return option ? { disabled: option.disabled, text: option.textContent } : null;
}, { selectId, value });

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error('usage: node adv-eligibility-harness.js <sheet.html>');
  const browser = await chromium.launch(process.env.L5R_CHROME ? { executablePath: process.env.L5R_CHROME } : {});
  try {
    const page = await browser.newPage({ viewport: PHONE });
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(pathToFileURL(path.resolve(file)).href);
    await page.waitForFunction(() => window.__L5R_TEST__ && typeof window.__L5R_TEST__.recalcAll === 'function');
    const registryBefore = await page.evaluate(() =>
      window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.map(m => [m.id, m.priority]));

    // ============ The gate itself ============

    await section('GATES455-GATE', 'Ineligible entries are disabled in the picker', async () => {
      await reset(page);
      equal('GATES455-GATE-01', 'Friendly Kami is disabled for a character with no School',
        await optionState(page, 'advQuickAdd', 'Friendly Kami'),
        { disabled: true, text: 'Friendly Kami (5 pts) — Shugenja only' });
      equal('GATES455-GATE-02', 'Elemental Imbalance is too, in the Disadvantage picker',
        await optionState(page, 'disadvQuickAdd', 'Elemental Imbalance'),
        { disabled: true, text: 'Elemental Imbalance (2 pts) — Shugenja only' });
      equal('GATES455-GATE-03', 'An ungated entry in the same list is untouched',
        await optionState(page, 'advQuickAdd', 'Great Potential'),
        { disabled: false, text: 'Great Potential (5 pts)' });

      // The gate must be NARROW. A rule that greys out more than it should is the failure mode
      // that would make the picker useless, and it would not show up in the three checks above.
      const counts = await page.evaluate(() => ({
        adv: Array.from(document.getElementById('advQuickAdd').options).filter(o => o.value && o.disabled).length,
        disadv: Array.from(document.getElementById('disadvQuickAdd').options).filter(o => o.value && o.disabled).length,
      }));
      // Conditional on Feature 4.5.20 (Void Versatility), which gates itself in this picker for a
      // character with no Shugenja School: two Advantages with it present, one once it is removed.
      // Declared in that release's ROLLBACK.md.
      const vv4520Present = await page.evaluate(() => typeof window.__L5R_TEST__.VV4520 === 'object');
      equal('GATES455-GATE-04', 'Exactly one entry is gated in each list, not a swathe of them',
        counts, { adv: vv4520Present ? 2 : 1, disadv: 1 });
    });

    await section('GATES455-SCHOOL', 'The gate follows the School field', async () => {
      await reset(page);
      await setSchool(page, 'Isawa Shugenja');
      equal('GATES455-SCHOOL-01', 'A Shugenja School re-enables Friendly Kami',
        await optionState(page, 'advQuickAdd', 'Friendly Kami'),
        { disabled: false, text: 'Friendly Kami (5 pts)' });
      equal('GATES455-SCHOOL-02', '…and Elemental Imbalance',
        await optionState(page, 'disadvQuickAdd', 'Elemental Imbalance'),
        { disabled: false, text: 'Elemental Imbalance (2 pts)' });

      // The pickers are built ONCE at load, so a gate that only ran at build time would pass the
      // two checks above on a fresh sheet and then never update. Clearing the character back to
      // baseline WITHOUT reloading the page is what proves the gate is recomputed each recalc:
      // three transitions — gated, open, gated again — all on one build of the picker.
      await reset(page);
      equal('GATES455-SCHOOL-03', 'Clearing the character re-gates it — the gate is live, not build-time',
        await optionState(page, 'advQuickAdd', 'Friendly Kami'),
        { disabled: true, text: 'Friendly Kami (5 pts) — Shugenja only' });
    });

    await section('GATES455-IDEMPOTENT', 'Repeated recalcs do not corrupt the label', async () => {
      await reset(page);
      await page.evaluate(() => { for (let i = 0; i < 5; i++) window.__L5R_TEST__.recalcAll(); });
      equal('GATES455-IDEMPOTENT-01', 'Five recalcs leave exactly one reason suffix, not five',
        await optionState(page, 'advQuickAdd', 'Friendly Kami'),
        { disabled: true, text: 'Friendly Kami (5 pts) — Shugenja only' });
      await setSchool(page, 'Isawa Shugenja');
      await page.evaluate(() => { for (let i = 0; i < 5; i++) window.__L5R_TEST__.recalcAll(); });
      equal('GATES455-IDEMPOTENT-02', 'And the label returns to its exact original text when eligible',
        await optionState(page, 'advQuickAdd', 'Friendly Kami'),
        { disabled: false, text: 'Friendly Kami (5 pts)' });
    });

    await section('GATES455-VERDICT', 'The picker and the row agree about eligibility', async () => {
      await reset(page);
      // Feature 4.53 owns the verdict for Friendly Kami; this phase only supplies the wording.
      // If those two ever disagree, one surface would grey an entry out while the other said it
      // applied — the exact inconsistency this phase exists to remove.
      const agree = await page.evaluate(() => {
        const T = window.__L5R_TEST__;
        const out = {};
        out.noSchool = {
          picker: !!T.R455.ineligible('Friendly Kami'),
          row: !!T.R453.ineligibilityReason('Friendly Kami'),
        };
        document.getElementById('f_school').value = 'Isawa Shugenja';
        T.recalcAll();
        out.shugenja = {
          picker: !!T.R455.ineligible('Friendly Kami'),
          row: !!T.R453.ineligibilityReason('Friendly Kami'),
        };
        return out;
      });
      equal('GATES455-VERDICT-01', 'Both surfaces call it ineligible with no School',
        agree.noSchool, { picker: true, row: true });
      equal('GATES455-VERDICT-02', 'Both call it eligible once a Shugenja School is applied',
        agree.shugenja, { picker: false, row: false });
    });

    // ============ Great Potential's Skill field ============

    const openGreatPotential = async () => {
      await page.evaluate(() => {
        const sel = document.getElementById('advQuickAdd');
        sel.value = 'Great Potential';
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      });
      // 'attached', not the default 'visible': a <datalist> never renders a box of its own.
      await page.waitForSelector('#advConfigSkillOptions', { state: 'attached', timeout: 4000 });
    };

    await section('GATES455-SKILL', 'The Skill list is prioritised, not alphabetical', async () => {
      await reset(page);
      await setSchool(page, 'Isawa Shugenja');
      await openGreatPotential();
      const listed = await page.evaluate(() =>
        Array.from(document.querySelectorAll('#advConfigSkillOptions option')).map(o => o.value));
      const schoolSkills = await page.evaluate(() => window.__L5R_TEST__.D45.state().schoolSkills);
      equal('GATES455-SKILL-01', 'The School’s own Skills lead the list, in order',
        listed.slice(0, schoolSkills.length), schoolSkills);
      record('GATES455-SKILL-02', 'There were School Skills to lead with in the first place',
        schoolSkills.length >= 3, `schoolSkills=${JSON.stringify(schoolSkills)}`);
      record('GATES455-SKILL-03', 'The rest of the catalogue still follows',
        listed.length > schoolSkills.length + 30, `listed ${listed.length}`);
      equal('GATES455-SKILL-04', 'No Skill is listed twice', listed.length, new Set(listed).size);
      record('GATES455-SKILL-05', 'The hint explains why a Skill you lack does nothing',
        /does nothing for you/.test(await page.evaluate(() =>
          document.getElementById('advConfigSkillHint')?.textContent || '')), '');

      // Measured rather than asserted against the rule, and it is what makes this phase's
      // stylesheet load-bearing: with 59-adv-eligibility.css dropped the hint falls back to a
      // bare <p>, rendering at the same weight as the field it is supposed to sit beneath.
      const hintScale = await page.evaluate(() => {
        const hint = document.getElementById('advConfigSkillHint');
        const input = document.getElementById('advConfigFreeText');
        if (!hint || !input) return null;
        const px = el => parseFloat(getComputedStyle(el).fontSize);
        return { hint: px(hint), input: px(input) };
      });
      record('GATES455-SKILL-06', 'And it is set subordinate to the field it explains',
        !!hintScale && hintScale.hint < hintScale.input, JSON.stringify(hintScale));
    });

    await section('GATES455-VALIDATE', 'An unknown Skill is refused', async () => {
      await reset(page);
      await openGreatPotential();
      await page.fill('#advConfigFreeText', 'Underwater Basket Weaving');
      await page.click('#advConfigConfirm');
      await page.waitForTimeout(150);
      const refused = await page.evaluate(() => ({
        row: document.getElementById('advList').textContent.replace(/\s+/g, ' '),
      }));
      record('GATES455-VALIDATE-01', 'A junk Skill name does not become a configured pick',
        !/Underwater Basket Weaving/.test(refused.row), refused.row.slice(0, 120));
      record('GATES455-VALIDATE-02', 'The entry stays flagged as needing a choice',
        /Needs a choice/.test(refused.row), refused.row.slice(0, 120));

      // And the positive half, in the same modal instance: a refusal that also refused valid
      // input would pass the two checks above while breaking the feature entirely.
      await page.fill('#advConfigFreeText', 'Kenjutsu');
      await page.click('#advConfigConfirm');
      await page.waitForTimeout(150);
      const accepted = await page.evaluate(() =>
        document.getElementById('advList').textContent.replace(/\s+/g, ' '));
      record('GATES455-VALIDATE-03', 'A real Skill from the catalogue is still accepted',
        /Kenjutsu/.test(accepted), accepted.slice(0, 120));
    });

    await section('GATES455-HOMEBREW', 'A Skill the player added by hand counts as known', async () => {
      await reset(page);
      // This is why the field stayed a text input with a datalist rather than becoming a strict
      // <select>: a custom Skill row is legitimate, and api.skills() has always included them.
      const added = await addSkillRow(page, 'Lore: Shadowlands Heraldry');
      record('GATES455-HOMEBREW-01', 'A custom Skill row exists to test against',
        added === 'Lore: Shadowlands Heraldry', String(added));
      if (added) {
        await openGreatPotential();
        const leads = await page.evaluate(() =>
          Array.from(document.querySelectorAll('#advConfigSkillOptions option')).map(o => o.value)[0]);
        equal('GATES455-HOMEBREW-02', 'The character’s own Skill row leads the list', leads, added);
        // Ticked, not typed: once the player has any Skills the typed field is hidden behind
        // "Another Skill…", so a homebrew row is reached the same way every other Skill is.
        await page.evaluate(skill => {
          const radio = Array.from(document.querySelectorAll('#advConfigSkillChoices input[type=radio]'))
            .find(r => r.value === skill);
          if (radio) { radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true })); }
        }, added);
        await page.click('#advConfigConfirm');
        await page.waitForTimeout(150);
        record('GATES455-HOMEBREW-03', 'And it is accepted rather than refused as unknown',
          new RegExp(added.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(
            await page.evaluate(() => document.getElementById('advList').textContent)), '');
      }
    });

    await section('GATES455-CARDS', 'The Skill picker is a single-select list of your own Skills', async () => {
      await reset(page);
      await openGreatPotential();
      record('GATES455-CARDS-01', 'A character with no Skills gets the typed field, not an empty list',
        await page.evaluate(() => !document.getElementById('advConfigSkillChoices')
          && document.getElementById('advConfigFreeText')?.hidden === false), '');

      await reset(page);
      await applySchool(page, 'Crab', 'Hida Bushi');
      await openGreatPotential();
      equal('GATES455-CARDS-02', 'A Hida Bushi sees exactly their School’s six, then the escape',
        await cardLabels(page),
        ['Athletics', 'Defense', 'Heavy Weapons', 'Intimidation', 'Kenjutsu', 'Lore: Shadowlands',
          'Another Skill…']);
      equal('GATES455-CARDS-03', 'Each granted Skill is badged as the School’s, and the escape is not',
        await page.evaluate(() =>
          Array.from(document.querySelectorAll('#advConfigSkillChoices .adv-config-skill-choice'))
            .map(card => card.querySelector('.adv-config-skill-badge')?.textContent || null)),
        ['School', 'School', 'School', 'School', 'School', 'School', null]);
      record('GATES455-CARDS-04', 'Nothing is pre-ticked, and the typed field starts hidden',
        await page.evaluate(() => !document.querySelector('#advConfigSkillChoices input:checked')
          && document.getElementById('advConfigFreeText')?.hidden === true), '');

      // Ticking a card must drive the SAME input 209.81 commits from — if it did not, the pick
      // would look right on screen and commit nothing.
      await page.evaluate(() => {
        const radio = Array.from(document.querySelectorAll('#advConfigSkillChoices input[type=radio]'))
          .find(r => r.value === 'Kenjutsu');
        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));
      });
      equal('GATES455-CARDS-05', 'Ticking a card sets the value the commit path reads',
        await page.evaluate(() => document.getElementById('advConfigFreeText').value), 'Kenjutsu');
      await page.click('#advConfigConfirm');
      await page.waitForTimeout(200);
      record('GATES455-CARDS-06', 'And it commits as a configured pick',
        /Skill: Kenjutsu/.test(await page.evaluate(() =>
          document.getElementById('advList').textContent)), '');

      // Re-opening via Change must tick what is already configured, or the player cannot see
      // which Skill they chose without cancelling.
      await page.evaluate(() => {
        const button = Array.from(document.querySelectorAll('#advList button'))
          .find(b => /change/i.test(b.textContent));
        if (button) button.click();
      });
      await page.waitForSelector('#advConfigSkillChoices', { state: 'attached', timeout: 4000 });
      equal('GATES455-CARDS-07', 'Re-opening pre-ticks the Skill already configured',
        await page.evaluate(() =>
          document.querySelector('#advConfigSkillChoices .adv-config-skill-choice.checked span')
            ?.firstChild?.textContent?.trim()), 'Kenjutsu');

      await page.evaluate(() => {
        const radio = Array.from(document.querySelectorAll('#advConfigSkillChoices input[type=radio]')).pop();
        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));
      });
      record('GATES455-CARDS-08', '“Another Skill…” reveals the typed field, cleared',
        await page.evaluate(() => {
          const input = document.getElementById('advConfigFreeText');
          return input.hidden === false && input.value === '';
        }), '');

      // Measured, not asserted against the rule. Phase 4.5.4 shipped a mid-word split twice
      // because a card was capped narrower than its own text; these rows are full-width by
      // design, and "Lore: Shadowlands" is the longest label here. Without this phase's
      // stylesheet a bare <label> is inline and collapses to its content width.
      const geometry = await page.evaluate(() => {
        const list = document.getElementById('advConfigSkillChoices');
        if (!list || !list.parentElement) return null;
        const cards = Array.from(list.querySelectorAll('.adv-config-skill-choice'));
        return {
          available: Math.round(list.parentElement.getBoundingClientRect().width),
          listWidth: Math.round(list.getBoundingClientRect().width),
          narrowest: Math.round(Math.min(...cards.map(c => c.getBoundingClientRect().width))),
          overflowing: cards.filter(c => c.scrollWidth - c.clientWidth > 1).length,
        };
      });
      record('GATES455-CARDS-09', 'The picker fills the modal and no card overflows at 375px',
        !!geometry && geometry.listWidth >= geometry.available - 1
          && geometry.narrowest >= geometry.listWidth - 1 && geometry.overflowing === 0,
        JSON.stringify(geometry));
    });

    await section('GATES455-BONUS', 'The School’s free-choice Skill slot reaches the list', async () => {
      await reset(page);
      await applySchool(page, 'Crab', 'Hida Bushi');
      // Hida Bushi grants "any one Bugei Skill", which Apply School deliberately SKIPS — it is a
      // player choice, not a concrete grant. So it only reaches this list once the player adds it
      // themselves, which is exactly the case this checks.
      const granted = await page.evaluate(() =>
        Array.from(document.querySelectorAll('#skillsBody .sk-name')).map(el => el.value.trim()));
      record('GATES455-BONUS-01', 'Apply School grants the six concrete Skills and skips the choice slot',
        granted.length === 6 && !granted.some(n => /^any\b/i.test(n)), JSON.stringify(granted));

      await addSkillRow(page, 'Jiujutsu');
      await openGreatPotential();
      const labels = await cardLabels(page);
      record('GATES455-BONUS-02', 'A Bugei Skill the player adds appears in the list',
        labels.includes('Jiujutsu'), JSON.stringify(labels));
      record('GATES455-BONUS-03', 'And the escape stays last, after it',
        labels[labels.length - 1] === 'Another Skill…', JSON.stringify(labels.slice(-2)));
    });

    await section('GATES455-SCOPE', 'Validation does not leak onto other steps', async () => {
      await reset(page);
      // #advConfigFreeText is shared with languagePick, where any string IS valid. A gate keyed
      // on the input rather than on the modal's own state would break Languages outright.
      await page.evaluate(() => {
        const sel = document.getElementById('advQuickAdd');
        sel.value = 'Languages';
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await page.waitForTimeout(250);
      const title = await page.evaluate(() =>
        document.getElementById('advConfigTitle')?.textContent || '');
      record('GATES455-SCOPE-01', 'The Languages entry still opens its own configuration',
        /language/i.test(title), `title=${JSON.stringify(title)}`);
      equal('GATES455-SCOPE-02', 'And the Skill validator reports itself off that step',
        await page.evaluate(() => window.__L5R_TEST__.R455.onSkillStep()), false);
    });

    // ============ Phase contract ============

    await section('GATES455-CONTRACT', 'Phase contract', async () => {
      equal('GATES455-CONTRACT-01', 'The phase exports its kill-switch as enabled',
        await page.evaluate(() => window.__L5R_TEST__.ADV_ELIGIBILITY_GATES_ENABLED), true);
      equal('GATES455-CONTRACT-02', 'It gates exactly the two entries it declares',
        await page.evaluate(() => Object.keys(window.__L5R_TEST__.R455.RULES).sort()),
        ['elemental imbalance', 'friendly kami']);
    });

    const registryAfter = await page.evaluate(() =>
      window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.map(m => [m.id, m.priority]));
    equal('GATES455-REGISTRY-01', 'The gates leave every registry entry unchanged', registryAfter, registryBefore);
    record('GATES455-ERRORS', 'No uncaught browser errors', errors.length === 0, errors.join('\n'));
  } finally { await browser.close(); }
}

main().catch(e => record('GATES455-FATAL', 'Harness initialization', false, String(e.stack || e))).finally(() => {
  const passed = results.filter(r => r.pass).length;
  console.table(results.filter(r => !r.pass));
  console.log(`\n${passed}/${results.length} checks passed`);
  console.log('GATES455_QA_RESULT=' + JSON.stringify({ total: results.length, passed, failed: results.length - passed }));
  process.exitCode = passed === results.length ? 0 : 1;
});
