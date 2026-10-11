/* =============================================================================
   BUGFIX — APPLY SCHOOL SKILL ROWS: AUTOMATED CHECKS

     NODE_PATH=<global node_modules> node qa/school-skill-rows-harness.js [sheet.html]

   Defaults to the live Phase 0 build; fresh browser context per scenario, 390 x 844.

   THE ORACLE is the sheet's own SKILL_LIBRARY, read through the test seam: a row's Trait must be
   its own library entry's, or for a "Family: Subject" name the family's. The harness never asks
   the fix's own functions what the answer should be. The sweep applies EVERY School the Clan &
   School pickers offer, through the real Apply School button, answering any Affinity, Deficiency
   or Honor prompt with its first option.
   ============================================================================= */

'use strict';

const { chromium } = require('playwright');
const path = require('path');

const SHEET = path.resolve(process.argv[2] || path.join(__dirname, '..', '..',
  'Part F — Cross-Platform Delivery', 'PART F — Phase 0 Source Reorganization for Maintainability',
  'l5r-character-sheet.html'));
const URL = 'file://' + SHEET;

let passed = 0, failed = 0;
function check(name, actual, expected) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected === undefined ? true : expected);
  if (a === e) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + '\n     expected ' + e + '\n     actual   ' + String(a).slice(0, 900)); }
}
async function scenario(name, body) {
  try { await body(); }
  catch (e) { failed++; console.log('FAIL SSR-SCENARIO-RAN-' + name.replace(/[^a-z]+/gi, '-').toUpperCase() + '\n     ' + String(e.message || e).split('\n')[0]); }
}

const OPEN = [];
async function fresh(browser) {
  const context = await browser.newContext({viewport: {width: 390, height: 844}});
  OPEN.push(context);
  const page = await context.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(String(e)));
  await page.goto(URL);
  await page.waitForFunction(() => { const T = window.__L5R_TEST__; return T && T.SKILL_LIBRARY && T.resetToBaseline; }, null, {timeout: 15000});
  return page;
}

// Every School the pickers offer: [{clan, minor, school}].
const schoolPlan = (page) => page.evaluate(() => {
  const clanSel = document.getElementById('cfs_clan'), minorSel = document.getElementById('cfs_minorClan');
  const schoolSel = document.getElementById('cfs_school');
  const out = [];
  for (const clan of [...clanSel.options].map(o => o.value).filter(Boolean)) {
    clanSel.value = clan; clanSel.dispatchEvent(new Event('change', {bubbles: true}));
    const minors = clan === 'Minor Clan' ? [...minorSel.options].map(o => o.value).filter(Boolean) : [null];
    for (const minor of minors) {
      if (minor !== null) { minorSel.value = minor; minorSel.dispatchEvent(new Event('change', {bubbles: true})); }
      for (const school of [...schoolSel.options].map(o => o.value).filter(Boolean)) out.push({clan, minor, school});
    }
  }
  return out;
});

// Apply one School on a reset sheet through the real button; answer any prompt with its first option.
async function applySchool(page, target) {
  await page.evaluate((t) => {
    window.__L5R_TEST__.resetToBaseline();
    const set = (id, v) => { const el = document.getElementById(id); el.value = v; el.dispatchEvent(new Event('change', {bubbles: true})); };
    set('cfs_clan', t.clan);
    if (t.minor) set('cfs_minorClan', t.minor);
    set('cfs_school', t.school);
    document.getElementById('statusMsg').textContent = '';
    document.getElementById('cfs_applySchool').click();
  }, target);
  for (let i = 0; i < 40; i++) {
    const state = await page.evaluate((school) => {
      const shown = (id) => { const o = document.getElementById(id); return o && o.style.display === 'flex'; };
      if (shown('affinityPickModalOverlay')) {
        const box = document.querySelector('#affinityPickGrid input'); if (box) box.click();
        document.getElementById('affinityPickConfirm').click(); return 'answered';
      }
      if (shown('deficiencyPickModalOverlay')) {
        const box = document.querySelector('#deficiencyPickGrid input'); if (box) box.click();
        document.getElementById('deficiencyPickConfirm').click(); return 'answered';
      }
      if (shown('appConfirmOverlay')) { document.getElementById('appConfirmOk').click(); return 'answered'; }
      return document.getElementById('statusMsg').textContent.startsWith('Applied ' + school) ? 'done' : 'waiting';
    }, target.school);
    if (state === 'done') break;
    await page.waitForTimeout(state === 'answered' ? 60 : 40);
  }
  return page.evaluate(() => ({
    status: document.getElementById('statusMsg').textContent,
    rows: [...document.querySelectorAll('#skillsBody tr')].map((tr) => ({
      name: tr.querySelector('.sk-name').value.trim(), trait: tr.querySelector('.sk-trait').value.trim(),
      rank: tr.querySelector('.sk-rank').value, school: tr.querySelector('.sk-school').checked,
      emph: [...tr.querySelectorAll('.sk-emph-select, .sk-emph-text')].map((w) => w.value.trim())}))
  }));
}

// The oracle: the Trait the sheet's own library gives a name, or null for a name it does not know.
const ORACLE = `(function(name){
  const lib = window.__L5R_TEST__.SKILL_LIBRARY;
  const by = (n) => lib.find((s) => s.name.toLowerCase() === String(n).trim().toLowerCase());
  const e = by(name); if (e) return e.trait;
  const m = String(name).match(/^([^:]+?)\\s*:\\s*\\S/); if (m) { const f = by(m[1]); if (f) return f.trait; }
  return null;
})`;
// A category word, an "or" fragment, a free choice, or a broken bracket. ("Artisan" and "Lore" are
// real library Skills: "Artisan (pick 2)" and "Lore (pick 1)" are the family rows the wizard names.)
const PLACEHOLDER = /\bany\b|^or\b|^(High|Bugei|Merchant|Low|Weapon)$|^[^(]*\)|\([^)]*$/i;
const names = (r) => r.rows.map((x) => x.name);
const find = (r, n) => r.rows.find((x) => x.name === n);

async function main() {
  console.log('Apply School Skill Rows checks against: ' + SHEET);
  const browser = await chromium.launch();
  try {
    await scenario('library', async () => {
      const page = await fresh(browser);
      check('SSR-ENABLED', await page.evaluate(() => window.__L5R_TEST__.SCHOOL_SKILL_ROWS_FIX_ENABLED));
      const lib = await page.evaluate(() => {
        const f = window.__L5R_TEST__.findAnySchoolLibraryEntry;
        const tokens = (n) => f(n).skills.split(',').map((s) => s.trim());
        return {mirumoto: tokens('Mirumoto Bushi'), shiba: tokens('Shiba Bushi'), kaiu: tokens('Kaiu Engineer [Artisan/Bushi]')};
      });
      check('SSR-LIBRARY-MIRUMOTO', [lib.mirumoto.includes('Lore: Theology'), lib.mirumoto.includes('Theology')], [true, false]);
      check('SSR-LIBRARY-SHIBA', [lib.shiba.includes('Lore: Theology'), lib.shiba.includes('Theology')], [true, false]);
      check('SSR-LIBRARY-KAIU', [lib.kaiu.includes('War Fan'), lib.kaiu.includes('War Fans')], [true, false]);
      check('SSR-NO-PAGE-ERRORS-LIBRARY', page.errors, []);
    });

    let sweep = [];
    await scenario('sweep', async () => {
      const page = await fresh(browser);
      const plan = await schoolPlan(page);
      for (const target of plan) sweep.push(Object.assign({}, target, await applySchool(page, target)));
      // Trait oracle per row, computed in the page from SKILL_LIBRARY alone.
      const verdicts = await page.evaluate(({src, all}) => {
        const o = eval(src);
        return all.map((s) => s.rows.filter((r) => r.school).map((r) => ({school: s.school, name: r.name, trait: r.trait, want: o(r.name)})));
      }, {src: ORACLE, all: sweep});
      const flat = [].concat(...verdicts);
      const applied = sweep.filter((s) => s.status.startsWith('Applied ' + s.school)).length;
      console.log('     swept ' + sweep.length + ' Schools, ' + applied + ' applied, ' + flat.length + ' School Skill rows');
      check('SSR-SWEEP-EVERY-SCHOOL-APPLIED', [sweep.length >= 100, applied === sweep.length], [true, true]);
      check('SSR-SWEEP-NO-BLANK-TRAIT', flat.filter((r) => !r.trait).map((r) => r.school + ': ' + r.name), []);
      check('SSR-SWEEP-EVERY-ROW-IS-A-SKILL', flat.filter((r) => r.want === null).map((r) => r.school + ': ' + r.name), []);
      check('SSR-SWEEP-TRAIT-MATCHES-LIBRARY', flat.filter((r) => r.want !== null && r.trait !== r.want).map((r) => r.school + ': ' + r.name + ' ' + r.trait + '/' + r.want), []);
      check('SSR-SWEEP-NO-PLACEHOLDER-ROWS', flat.filter((r) => PLACEHOLDER.test(r.name)).map((r) => r.school + ': ' + r.name), []);
      // The measured scope: how many Schools had at least one "Family: Subject" School Skill.
      const familySchools = sweep.filter((s) => s.rows.some((r) => r.school && /^[^:]+:\s*\S/.test(r.name))).length;
      console.log('     Schools with a "Family: Subject" School Skill: ' + familySchools);
      check('SSR-SWEEP-FAMILY-SCOPE-SEEN', familySchools >= 40);
      check('SSR-NO-PAGE-ERRORS-SWEEP', page.errors, []);
    });

    const bySchool = (n) => sweep.find((s) => s.school === n) || {rows: [], status: ''};
    await scenario('named Schools', async () => {
      const tsi = bySchool('Tsi Smith [Artisan]'), kasuga = bySchool('Kasuga Smuggler [Courtier]');
      check('SSR-TSI-ROWS', names(tsi).sort(), ['Commerce', 'Defense']);
      check('SSR-TSI-FOUR-CHOICES-LEFT', /\(4 "choose one" left for you\)/.test(tsi.status));
      check('SSR-KASUGA-ROWS', names(kasuga).sort(), ['Commerce', 'Etiquette', 'Investigation', 'Lore: Underworld', 'Sincerity', 'Stealth']);
      check('SSR-KASUGA-ONE-CHOICE-LEFT', /\(1 "choose one" left for you\)/.test(kasuga.status));
      const mir = bySchool('Mirumoto Bushi'), shiba = bySchool('Shiba Bushi'), kaiu = bySchool('Kaiu Engineer [Artisan/Bushi]');
      check('SSR-MIRUMOTO-LORE-THEOLOGY', [find(mir, 'Lore: Theology') && find(mir, 'Lore: Theology').trait, !!find(mir, 'Theology')], ['Intelligence', false]);
      check('SSR-SHIBA-LORE-THEOLOGY', [find(shiba, 'Lore: Theology') && find(shiba, 'Lore: Theology').trait, !!find(shiba, 'Theology')], ['Intelligence', false]);
      check('SSR-KAIU-WAR-FAN', [find(kaiu, 'War Fan') && find(kaiu, 'War Fan').trait, !!find(kaiu, 'War Fans')], ['Agility', false]);
      const jurojin = sweep.find((s) => /^The Order of Jurojin/.test(s.school)) || {rows: []};
      const medicine = find(jurojin, 'Medicine');
      check('SSR-JUROJIN-MEDICINE-WHOLE', [!!medicine, jurojin.rows.some((r) => /Herbalism|\(Disease$/.test(r.name))], [true, false]);
      check('SSR-JUROJIN-MEDICINE-EMPHASES', medicine ? medicine.emph.slice().sort() : null, ['Disease', 'Herbalism']);
      const kitsu = bySchool('Kitsu Shugenja');
      check('SSR-KITSU-LORES', ['Lore: History', 'Lore: Theology'].map((n) => find(kitsu, n) && find(kitsu, n).trait), ['Intelligence', 'Intelligence']);
    });

    await scenario('roll and revert', async () => {
      const page = await fresh(browser);
      const plan = await schoolPlan(page);
      await applySchool(page, plan.find((p) => p.school === 'Kitsu Shugenja'));
      const rolled = await page.evaluate(async () => {
        const tr = [...document.querySelectorAll('#skillsBody tr')].find((t) => t.querySelector('.sk-name').value === 'Lore: History');
        document.getElementById('statusMsg').textContent = '';
        tr.querySelector('.sk-roll').click();
        await new Promise((r) => setTimeout(r, 300));
        const open = [...document.querySelectorAll('.roll-modal-overlay')].some((o) => getComputedStyle(o).display !== 'none');
        return {open, refused: /Set a Trait/.test(document.getElementById('statusMsg').textContent)};
      });
      check('SSR-LORE-ROW-ROLLS', rolled, {open: true, refused: false});
      await page.keyboard.press('Escape');
      // Changing School undoes the first School's rows, by the names Apply School recorded.
      await applySchool(page, plan.find((p) => p.school === 'Mirumoto Bushi'));
      const after = await page.evaluate(() => {
        const set = (id, v) => { const el = document.getElementById(id); el.value = v; el.dispatchEvent(new Event('change', {bubbles: true})); };
        set('cfs_clan', 'Crab'); set('cfs_school', 'Hida Bushi');
        document.getElementById('cfs_applySchool').click();
        return new Promise((r) => setTimeout(() => r([...document.querySelectorAll('#skillsBody .sk-name')].map((n) => n.value)), 400));
      });
      check('SSR-REVERT-REMOVES-CORRECTED-ROWS', [after.includes('Lore: Theology'), after.includes('Lore: Shugenja'), after.includes('Lore: Shadowlands')], [false, false, true]);
      check('SSR-NO-PAGE-ERRORS-ROLL', page.errors, []);
    });

    await scenario('by hand', async () => {
      const page = await fresh(browser);
      const got = await page.evaluate(() => {
        const add = (name, trait) => {
          document.getElementById('addSkill').click();
          const tr = [...document.querySelectorAll('#skillsBody tr')].pop();
          if (trait) tr.querySelector('.sk-trait').value = trait;
          const n = tr.querySelector('.sk-name'); n.value = name; n.dispatchEvent(new Event('change', {bubbles: true}));
          return tr.querySelector('.sk-trait').value;
        };
        return {typed: add('Lore: Heraldry'), craft: add('Craft: Origami'), kept: add('Lore: Maho', 'Awareness'), unknown: add('Basket Weaving')};
      });
      check('SSR-TYPED-FAMILY-NAME-FILLS', [got.typed, got.craft], ['Intelligence', 'Awareness']);
      check('SSR-EXISTING-TRAIT-NEVER-OVERWRITTEN', got.kept, 'Awareness');
      check('SSR-UNKNOWN-NAME-STAYS-BLANK', got.unknown, '');
    });

    await scenario('older save', async () => {
      const page = await fresh(browser);
      const plan = await schoolPlan(page);
      await applySchool(page, plan.find((p) => p.school === 'Mirumoto Bushi'));
      const got = await page.evaluate(() => {
        const T = window.__L5R_TEST__;
        const data = T.collectData();
        // An older save: the School's row under its old name, blank Traits, and two placeholder rows.
        data.skills.forEach((s) => { if (s.name === 'Lore: Theology') { s.name = 'Theology'; s.trait = ''; } if (/^Lore:/.test(s.name)) s.trait = ''; });
        data.skills.push({name: 'Bugei', trait: '', rank: 1, school: true, freeFloor: 1, emph: ''});
        data.skills.push({name: 'or Merchant Skill', trait: '', rank: 1, school: true, freeFloor: 1, emph: ''});
        T.applyData(data); T.recalcAll();
        const rows = [...document.querySelectorAll('#skillsBody tr')].map((tr) => [tr.querySelector('.sk-name').value, tr.querySelector('.sk-trait').value]);
        const findings = (T.validateCharacter ? T.validateCharacter().findings : []).filter((f) => f.id === 'school-skills-missing').map((f) => f.title);
        return {rows, findings,
          overlap: T.hasSchoolSkillOverlap ? T.hasSchoolSkillOverlap('Mirumoto Bushi') : 'not on the seam',
          concrete: T.schoolConcreteSkillNames ? T.schoolConcreteSkillNames('Mirumoto Bushi') : 'not on the seam'};
      });
      const row = (n) => (got.rows.find((r) => r[0] === n) || [n, 'missing'])[1];
      check('SSR-OLD-SAVE-LORE-TRAIT-FILLED', row('Lore: Shugenja'), 'Intelligence');
      check('SSR-OLD-SAVE-OLD-NAME-KEPT-AND-FILLED', row('Theology'), 'Intelligence');
      check('SSR-OLD-SAVE-PLACEHOLDERS-KEPT', [row('Bugei'), row('or Merchant Skill')], ['', '']);
      check('SSR-OLD-NAME-SATISFIES-CHARACTER-CHECK', got.findings, []);
      check('SSR-OLD-NAME-SATISFIES-SECOND-SCHOOL-UNLOCK', got.overlap);
      check('SSR-SECOND-SCHOOL-READS-CORRECTED-LIBRARY', got.concrete, ['Defense', 'Iaijutsu', 'Kenjutsu', 'Lore: Shugenja', 'Meditation', 'Lore: Theology']);
      check('SSR-NO-PAGE-ERRORS-OLD-SAVE', page.errors, []);
    });

    await scenario('character check', async () => {
      const page = await fresh(browser);
      const plan = await schoolPlan(page);
      await applySchool(page, plan.find((p) => p.school === 'Tsi Smith [Artisan]'));
      const got = await page.evaluate(() => {
        const f = window.__L5R_TEST__.validateCharacter().findings;
        return {missing: f.filter((x) => x.id === 'school-skills-missing').map((x) => x.title),
          slots: f.filter((x) => x.id === 'school-choice-slots').map((x) => x.title)};
      });
      check('SSR-TSI-NO-FALSE-MISSING-SKILLS', got.missing, []);
      check('SSR-TSI-FOUR-CHOICE-SLOTS', got.slots, ['Tsi Smith [Artisan]: 4 free Skill choices']);
    });
  } finally {
    for (const c of OPEN) await c.close().catch(() => {});
    await browser.close();
  }
  console.log(`\n${passed}/${passed + failed} checks passed`);
  process.exitCode = failed ? 1 : 0;
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
