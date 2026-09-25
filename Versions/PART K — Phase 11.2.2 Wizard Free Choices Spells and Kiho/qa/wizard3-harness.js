/* =============================================================================
   PART K PHASE 11.2.2 — WIZARD: FREE CHOICES, SPELLS AND KIHO: AUTOMATED CHECKS

     NODE_PATH=/opt/node22/lib/node_modules node qa/wizard3-harness.js [sheet.html]

   Defaults to the live Phase 0 build; fresh browser context per scenario, 390 x 844.

   ORACLES: option lists come from the sheet's own pickers (#skillQuickAdd's groups,
   #techQuickAdd's Spell and Kiho options) and the Kiho count from the sheet's own
   #kihoGrantNote; the whole result is compared with the same choices made by hand through the
   sheet's own controls (CW2-SAME-AS-BY-HAND-*). The library sweep reads each School's own text.
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
  else { failed++; console.log('FAIL ' + name + '\n     expected ' + e + '\n     actual   ' + a); }
}
async function scenario(name, body) {
  try { await body(); }
  catch (e) { failed++; console.log('FAIL CW2-SCENARIO-RAN-' + name.replace(/[^a-z]+/gi, '-').toUpperCase() + '\n     ' + String(e.message || e).split('\n')[0]); }
}

const OPEN = [];
async function fresh(browser) {
  const context = await browser.newContext({viewport: {width: 390, height: 844}});
  OPEN.push(context);
  const page = await context.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(String(e)));
  await page.goto(URL);
  await page.waitForFunction(() => { const T = window.__L5R_TEST__;
    return T && T.CL11 && T.CL11.ready && T.CW112 && T.CW1121 && T.CW1122; }, null, {timeout: 15000});
  return {context, page};
}
const $v = (page, id) => page.evaluate((i) => document.getElementById(i).value, id);
const title = (page) => page.evaluate(() => document.getElementById('cw112Title').textContent);
const stepIds = (page) => page.evaluate(() => window.__L5R_TEST__.CW112.steps.map(s => s.id));
const nextText = (page) => page.evaluate(() => document.getElementById('cw112Next').textContent);
const skills = (page) => page.evaluate(() => [...document.getElementById('skillsBody').rows].map(r =>
  [r.querySelector('.sk-name').value, r.querySelector('.sk-rank').value, r.querySelector('.sk-school').checked]));
const options = (page, id) => page.evaluate((i) => [...document.querySelectorAll('#' + i + ' option')].map(o => o.value).filter(Boolean), id);
const slotLabels = (page) => page.evaluate(() => [...document.querySelectorAll('.cw1121-slot-label')].map(p => p.textContent));
async function next(page) {
  await page.waitForFunction(() => !document.getElementById('cw112Next').disabled);
  await page.click('#cw112Next');
}
async function toStep(page, wanted) {
  for (let i = 0; i < 12 && (await title(page)) !== wanted; i++) await next(page);
}
async function backTo(page, wanted) {
  for (let i = 0; i < 12 && (await title(page)) !== wanted; i++) await page.click('#cw112BackBtn');
}
async function exactPick(page, text) {
  await page.locator('#cw112Body .cw112-card').filter({has: page.locator('.cw112-card-title', {hasText: new RegExp('^' + text.replace(/[[\]()]/g, '\\$&') + '$')})}).first().click();
}
async function start(page, name) {
  await page.evaluate(() => document.getElementById('cl11Toolbar').click());
  await page.click('#cl11Create');
  await page.waitForFunction(() => !document.getElementById('cw112View').hidden);
  await page.fill('#cw112Name', name);
  await next(page);
}
async function applied(page, school) {
  await page.waitForFunction((s) => window.__L5R_TEST__.CW112.appliedSchool() === s && !window.__L5R_TEST__.CW112.busy, school);
}
async function toKakitaSkills(page) {
  await start(page, 'Kakita Aiko');
  await exactPick(page, 'Crane'); await next(page);
  await exactPick(page, 'Kakita'); await next(page);
  await exactPick(page, 'Kakita Bushi');
  await applied(page, 'Kakita Bushi');
  await toStep(page, 'Skills');
}
async function toIsawaSkills(page) {
  await start(page, 'Isawa Takeshi');
  await exactPick(page, 'Phoenix'); await next(page);
  await exactPick(page, 'Isawa'); await next(page);
  await exactPick(page, 'Isawa Shugenja');
  await page.waitForFunction(() => document.getElementById('affinityPickModalOverlay').style.display === 'flex');
  await page.click('#affinityPick_Void'); await page.click('#affinityPickConfirm');
  await applied(page, 'Isawa Shugenja');
  await toStep(page, 'Skills');
}
const MONK = 'The Order of the Nameless Gift [Monk]';
async function toMonkSkills(page) {
  await start(page, 'Brother Kenji');
  await exactPick(page, 'Brotherhood of Shinsei'); await next(page);
  await next(page);   // no Family for the Brotherhood
  await exactPick(page, MONK);
  await applied(page, MONK);
  await toStep(page, 'Skills');
}
// The sheet's own spell-picker options a Spells step should offer: every non-Maho spell the
// Technique picker lists, in its order.
const sheetSpellOptions = (page) => page.evaluate(() => {
  const T = window.__L5R_TEST__;
  T.refreshTechQuickAddOptions();
  return [...document.querySelectorAll('#techQuickAdd option')].map(o => o.value).filter(v => /^spell:/.test(v))
    .map(v => Number(v.split(':')[1])).filter(i => !T.SPELL_LIBRARY[i].maho).map(String);
});

async function main() {
  console.log('Wizard free choices, Spells and Kiho checks against: ' + SHEET);
  const browser = await chromium.launch();
  try {
    // ------------------------------------------------------------ Kakita Bushi: the owner's example
    await scenario('kakita', async () => {
      const {page} = await fresh(browser);
      check('CW2-ENABLED', await page.evaluate(() => window.__L5R_TEST__.WIZARD_FREE_CHOICES_ENABLED));
      await toKakitaSkills(page);
      check('CW2-BUSHI-NO-EXTRA-STEPS', await stepIds(page), ['name', 'clan', 'family', 'school', 'traits', 'skills', 'advantages', 'review']);
      check('CW2-KAKITA-SLOT', await slotLabels(page), ['Any one Bugei or High Skill']);
      // Oracle: the sheet's own Skill picker, its High, Bugei and Weapon groups, in its order. Not
      // Weapon (Low): Cannon, Firearms and Ninjutsu only when a choice also says Low (owner's ruling).
      check('CW2-KAKITA-OPTIONS', await options(page, 'cw1121Slot0Pick'), await page.evaluate(() =>
        [...document.querySelectorAll('#skillQuickAdd optgroup')].filter(g => ['High', 'Bugei', 'Weapon'].includes(g.label))
          .flatMap(g => [...g.querySelectorAll('option')].map(o => o.value))));
      await next(page);
      check('CW2-NUDGE-FIRST-NEXT', [await title(page), await nextText(page),
        await page.evaluate(() => (document.getElementById('cw1122Open') || {}).textContent || ''),
        await page.evaluate(() => document.querySelector('.cw1121-slot[data-slot="0"]').classList.contains('cw1122-open-slot'))],
        ['Skills', 'Leave for later ›', 'Still to choose: Any one Bugei or High Skill. Choose now, or press “Leave for later” to finish on the sheet.', true]);
      await next(page);
      check('CW2-NUDGE-SECOND-NEXT-LEAVES', await title(page), 'Advantages & Disadvantages');
      await toStep(page, 'Review');
      check('CW2-REVIEW-LISTS-OPEN', await page.evaluate(() => [...document.querySelectorAll('#cw1122Still li')].map(l => l.textContent)),
        ['Skills: Any one Bugei or High Skill']);
      await backTo(page, 'Skills');
      check('CW2-NUDGE-RESETS', [await page.evaluate(() => !!document.getElementById('cw1122Open')), await nextText(page)], [false, 'Next ›']);
      await page.selectOption('#cw1121Slot0Pick', 'Spears');
      await page.click('#cw1121Slot0Add');
      check('CW2-KAKITA-FILLED', (await skills(page)).find(r => r[0] === 'Spears'), ['Spears', '1', true]);
      await next(page);
      check('CW2-NO-NUDGE-WHEN-CHOSEN', await title(page), 'Advantages & Disadvantages');
      await toStep(page, 'Review');
      check('CW2-REVIEW-ALL-MADE', await page.evaluate(() => document.getElementById('cw1122Still').textContent),
        'Every choice your School leaves to you is made.');
      check('CW2-NO-PAGE-ERRORS-KAKITA', page.errors, []);
    });

    // ------------------------------------------------------------ Every free choice in the library
    await scenario('library', async () => {
      const {page} = await fresh(browser);
      const sweep = await page.evaluate(() => {
        const T = window.__L5R_TEST__, C = T.CW1122;
        const clan = document.getElementById('cfs_clan'), minor = document.getElementById('cfs_minorClan');
        const names = new Set();
        const fire = (el) => el.dispatchEvent(new Event('change', {bubbles: true}));
        [...clan.options].forEach(o => {
          clan.value = o.value; fire(clan);
          const minors = o.value === 'Minor Clan' ? [...minor.options].map(m => m.value) : [null];
          minors.forEach(m => { if (m) { minor.value = m; fire(minor); }
            [...document.getElementById('cfs_school').options].forEach(s => s.value && names.add(s.value)); });
        });
        const allCount = C.groupsForSpec({words: [], not: []}).reduce((n, g) => n + g.options.length, 0);
        const texts = [], wide = [], split = [];
        names.forEach(n => {
          const lib = T.findAnySchoolLibraryEntry(n);
          if (!lib || typeof lib.skills !== 'string') return;
          C.choiceTexts(lib.skills).forEach(t => {
            texts.push(t);
            if (!/\bskills?\b/i.test(t)) split.push(n + ': ' + t);
            const spec = C.parseChoice(t);
            const offered = C.groupsForSpec(spec).reduce((k, g) => k + g.options.length, 0);
            // A choice that names a category or excludes one must offer fewer than every Skill.
            if ((spec.words.length || spec.not.length) && offered >= allCount) wide.push(n + ': ' + t);
          });
        });
        return {schools: names.size, choices: texts.length, wide, split};
      });
      console.log('     swept ' + sweep.schools + ' Schools, ' + sweep.choices + ' free choices');
      check('CW2-LIBRARY-SWEPT', sweep.schools > 100 && sweep.choices > 100);
      check('CW2-LIBRARY-EVERY-CATEGORY-READ', sweep.wide, []);
      check('CW2-LIBRARY-NO-SPLIT-CHOICE', sweep.split, []);
      const forms = await page.evaluate(() => {
        const C = window.__L5R_TEST__.CW1122;
        const labels = (spec) => C.groupsForSpec(spec).map(g => g.label);
        return {
          joined: C.choiceTexts('Commerce, any one High, Bugei, or Merchant Skill, Defense'),
          two: C.parseChoice('any two Skills').count,
          ranks: C.parseChoice('two ranks in any one Craft Skill').ranks,
          notLow: labels(C.parseChoice('any 1 Skill (not Low)')),
          bugei: labels(C.parseChoice('any one Bugei Skill')),
          bugeiLow: labels(C.parseChoice('any one Bugei or Low Skill')),
          nonBugei: labels(C.parseChoice('any one non-Bugei Skill')),
          nonLow: labels(C.parseChoice('any one non-Low Skill')),
          from: C.groupsForSpec(C.parseChoice('any 3 skills from Acting/Artisan/Perform')).flatMap(g => g.options),
        };
      });
      check('CW2-FORM-JOINED', forms.joined, ['any one High, Bugei, or Merchant Skill']);
      check('CW2-FORM-COUNT', [forms.two, forms.ranks], [2, 2]);
      check('CW2-FORM-NOT-LOW', [forms.notLow, forms.nonLow], [['High', 'Bugei', 'Weapon', 'Merchant'], ['High', 'Bugei', 'Weapon', 'Merchant']]);
      check('CW2-FORM-FROM-LIST', forms.from, ['Acting', 'Artisan', 'Perform']);
      check('CW2-FORM-BUGEI', [forms.bugei, forms.bugeiLow, forms.nonBugei],
        [['Bugei', 'Weapon'], ['Bugei', 'Weapon', 'Weapon (Low)', 'Low'], ['High', 'Merchant', 'Low']]);
    });

    // ------------------------------------------------------------ Isawa Shugenja: Spells
    await scenario('spells', async () => {
      const {page} = await fresh(browser);
      await toIsawaSkills(page);
      check('CW2-SHUGENJA-STEPS', await stepIds(page), ['name', 'clan', 'family', 'school', 'traits', 'skills', 'spells', 'advantages', 'review']);
      await toStep(page, 'Spells');
      check('CW2-SPELLS-STEP', await title(page), 'Spells');
      check('CW2-SPELL-COUNT-NOT-GUESSED', await page.evaluate(() => /does not record how many spells your School starts with/.test(document.getElementById('cw112Body').textContent)));
      check('CW2-SPELL-OPTIONS', await options(page, 'cw1122SpellPick'), await sheetSpellOptions(page));
      await next(page);
      check('CW2-SPELLS-NUDGE', [await title(page), await page.evaluate(() => (document.getElementById('cw1122Open') || {}).textContent || '')],
        ['Spells', 'Still to choose: Your School’s starting spells. Choose now, or press “Leave for later” to finish on the sheet.']);
      const sense = await page.evaluate(() => String(window.__L5R_TEST__.SPELL_LIBRARY.findIndex(s => s.name === 'Sense')));
      await page.selectOption('#cw1122SpellPick', sense);
      await page.click('#cw1122SpellAdd');
      const air = await page.evaluate(() => [...document.querySelectorAll('#cw1122SpellPick option')].map(o => o.value)
        .find(v => v && window.__L5R_TEST__.SPELL_LIBRARY[Number(v)].element === 'Air'));
      const airName = await page.evaluate((i) => window.__L5R_TEST__.SPELL_LIBRARY[Number(i)].name, air);
      await page.selectOption('#cw1122SpellPick', air);
      await page.click('#cw1122SpellAdd');
      const state = () => page.evaluate(() => ({
        scrolls: [...document.querySelectorAll('#equipBody .eq-name')].map(n => n.value).filter(v => /^Spell Scroll/.test(v)),
        spells: [...document.querySelectorAll('#techList .entry')].filter(d => d.dataset.spellElement).map(d => d.querySelector('.en-name').value),
      }));
      check('CW2-SPELL-ADDED', await state(), {scrolls: ['Spell Scroll — Sense', 'Spell Scroll — ' + airName], spells: ['Sense', airName]});
      check('CW2-SPELL-LEAVES-PICKER', (await options(page, 'cw1122SpellPick')).includes(sense), false);
      check('CW2-SPELL-NO-NUDGE-ONCE-CHOSEN', await page.evaluate(() => !!document.getElementById('cw1122Open')), false);
      await page.locator('.cw1121-entry', {hasText: 'Sense'}).locator('.cw1121-remove').click();
      await page.waitForTimeout(200);
      check('CW2-SPELL-REMOVED-WITH-SCROLL', await state(), {scrolls: ['Spell Scroll — ' + airName], spells: [airName]});
      check('CW2-TOUCH-TARGETS-SPELLS', await page.evaluate(() => ['cw1122SpellPick', 'cw1122SpellAdd'].map(id => document.getElementById(id))
        .concat([...document.querySelectorAll('#cw112Body .cw1121-remove')]).every(e => e.getBoundingClientRect().height >= 44)));
      check('CW2-NO-SIDEWAYS-SCROLL', await page.evaluate(() => { const v = document.getElementById('cw112View'); return v.scrollWidth <= v.clientWidth; }));
      // Changing to a Bushi School takes the Spells step away again.
      await backTo(page, 'School');
      await exactPick(page, 'Shiba Bushi');
      await applied(page, 'Shiba Bushi');
      check('CW2-SPELLS-STEP-GOES', (await stepIds(page)).includes('spells'), false);
      check('CW2-NO-PAGE-ERRORS-SPELLS', page.errors, []);
    });

    // ------------------------------------------------------------ A Brotherhood monk: Lore and Kiho
    await scenario('monk', async () => {
      const {page} = await fresh(browser);
      await toMonkSkills(page);
      check('CW2-MONK-STEPS', await stepIds(page), ['name', 'clan', 'family', 'school', 'traits', 'skills', 'kiho', 'advantages', 'review']);
      check('CW2-MONK-TWO-SLOTS', await slotLabels(page),
        ['Any two Skills (1 of 2)', 'Any two Skills (2 of 2)', 'Your School teaches a Lore of your choice']);
      const loreRow = () => page.evaluate(() => { const tr = [...document.getElementById('skillsBody').rows].find(r => /^Lore(:|$)/.test(r.querySelector('.sk-name').value) && r.querySelector('.sk-school').checked);
        return tr ? [tr.querySelector('.sk-name').value, tr.querySelector('.sk-rank').value, [...tr.querySelectorAll('.sk-emph-select, .sk-emph-text')].map(e => e.value)] : null; });
      check('CW2-LORE-PLACEHOLDER-BEFORE', await loreRow(), ['Lore', '1', ['pick one']]);
      await next(page);
      check('CW2-MONK-NUDGE-LISTS-ALL', await page.evaluate(() => (document.getElementById('cw1122Open') || {}).textContent || ''),
        'Still to choose: Any two Skills (1 of 2) · Any two Skills (2 of 2) · The subject of your School’s Lore. Choose now, or press “Leave for later” to finish on the sheet.');
      check('CW2-TOUCH-TARGETS-LORE', await page.evaluate(() => ['cw1122LoreSubject', 'cw1122LoreSet']
        .every(id => document.getElementById(id).getBoundingClientRect().height >= 44)));
      await page.fill('#cw1122LoreSubject', 'History');
      await page.click('#cw1122LoreSet');
      check('CW2-LORE-NAMED', await loreRow(), ['Lore: History', '1', []]);
      await page.locator('.cw1122-lore .cw1121-undo').click();
      check('CW2-LORE-CHOOSE-AGAIN', (await loreRow())[0], 'Lore');
      await page.fill('#cw1122LoreSubject', 'History');
      await page.click('#cw1122LoreSet');
      await toStep(page, 'Kiho');
      check('CW2-KIHO-STEP', await title(page), 'Kiho');
      // Oracles: the sheet's own grant note and its own Kiho options, values and locks alike.
      check('CW2-KIHO-NOTE', await page.evaluate(() => [...document.querySelectorAll('#cw112Body .cw112-note')].map(n => n.textContent).includes(document.getElementById('kihoGrantNote').textContent.trim())));
      check('CW2-KIHO-OPTIONS', await page.evaluate(() => [...document.querySelectorAll('#cw1122KihoPick option')].filter(o => o.value).map(o => [o.value, o.disabled])),
        await page.evaluate(() => [...document.querySelectorAll('#techQuickAdd option')].filter(o => /^kiho:/.test(o.value)).map(o => [o.value, o.disabled])));
      const freeKiho = await page.evaluate(() => [...document.querySelectorAll('#cw1122KihoPick option')].filter(o => !o.disabled && /free pick/.test(o.textContent)).map(o => o.value));
      const before = await page.evaluate(() => window.__L5R_TEST__.kihoEntitlement().freePicksLeft);
      await page.selectOption('#cw1122KihoPick', freeKiho[0]);
      await page.click('#cw1122KihoAdd');
      check('CW2-KIHO-FREE-PICK', [await page.evaluate(() => window.__L5R_TEST__.kihoEntitlement().freePicksLeft), before - 1,
        await page.evaluate(() => [...document.querySelectorAll('.cw1121-entry-name')].some(e => / · free School Kiho$/.test(e.textContent)))], [before - 1, before - 1, true]);
      await next(page);
      check('CW2-KIHO-NUDGE', [await title(page), await page.evaluate(() => (document.getElementById('cw1122Open') || {}).textContent || '')],
        ['Kiho', 'Still to choose: ' + (before - 1) + ' free Kiho picks. Choose now, or press “Leave for later” to finish on the sheet.']);
      check('CW2-TOUCH-TARGETS-KIHO', await page.evaluate(() => ['cw1122KihoPick', 'cw1122KihoAdd'].map(id => document.getElementById(id))
        .concat([...document.querySelectorAll('#cw112Body .cw1121-remove')]).every(e => e.getBoundingClientRect().height >= 44)));
      await page.locator('#cw112Body .cw1121-entry').first().locator('.cw1121-remove').click();
      check('CW2-KIHO-REMOVED', await page.evaluate(() => window.__L5R_TEST__.kihoRows().length), 0);
      await toStep(page, 'Review');
      check('CW2-REVIEW-LISTS-KIHO', await page.evaluate(() => [...document.querySelectorAll('#cw1122Still li')].map(l => l.textContent)),
        ['Skills: Any two Skills (1 of 2)', 'Skills: Any two Skills (2 of 2)', 'Kiho: ' + before + ' free Kiho picks']);
      // A different School: the named Lore row goes with the old School, as Apply School's own undo would.
      await backTo(page, 'School');
      await exactPick(page, 'The Temple of Kaimetsu-uo [Monk]');
      await applied(page, 'The Temple of Kaimetsu-uo [Monk]');
      check('CW2-LORE-GOES-WITH-SCHOOL', (await skills(page)).filter(r => /^Lore(:|$)/.test(r[0]) && r[0] !== 'Lore: Theology').map(r => r[0]), []);
      check('CW2-NO-PAGE-ERRORS-MONK', page.errors, []);
    });

    // ------------------------------------------------------------ The same choices by hand
    await scenario('same as by hand: spells', async () => {
      const w = await fresh(browser);
      await toIsawaSkills(w.page);
      await toStep(w.page, 'Spells');
      const sense = await w.page.evaluate(() => String(window.__L5R_TEST__.SPELL_LIBRARY.findIndex(s => s.name === 'Sense')));
      await w.page.selectOption('#cw1122SpellPick', sense);
      await w.page.click('#cw1122SpellAdd');
      const viaWizard = await w.page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
      const h = await fresh(browser);
      await h.page.evaluate(() => {
        const set = (id, v, ev) => { const el = document.getElementById(id); el.value = v; (ev || ['input', 'change']).forEach(e => el.dispatchEvent(new Event(e, {bubbles: true}))); };
        set('f_name', 'Isawa Takeshi');
        set('cfs_clan', 'Phoenix', ['change']);
        set('cfs_family', 'Isawa', ['change']);
        document.getElementById('cfs_applyFamily').click();
        set('cfs_school', 'Isawa Shugenja', ['change']);
        document.getElementById('cfs_applySchool').click();
      });
      await h.page.waitForFunction(() => document.getElementById('affinityPickModalOverlay').style.display === 'flex');
      await h.page.click('#affinityPick_Void'); await h.page.click('#affinityPickConfirm');
      await h.page.waitForFunction(() => window.__L5R_TEST__.CW112.appliedSchool() === 'Isawa Shugenja');
      await h.page.evaluate((i) => {
        document.getElementById('addSpellScroll').click();
        document.querySelector('#spellScrollsList .spell-scroll-add-btn[data-idx="' + i + '"]').click();
        document.getElementById('spellScrollsX').click();
        const q = document.getElementById('techQuickAdd'); q.value = 'spell:' + i; q.dispatchEvent(new Event('change', {bubbles: true}));
      }, sense);
      const byHand = await h.page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
      check('CW2-SAME-AS-BY-HAND-SPELLS', viaWizard === byHand);
      if (viaWizard !== byHand) {
        const a = JSON.parse(viaWizard), b = JSON.parse(byHand);
        console.log('     differing keys: ' + Object.keys(a).filter(k => JSON.stringify(a[k]) !== JSON.stringify(b[k])).join(', '));
      }
    });

    await scenario('same as by hand: monk', async () => {
      const w = await fresh(browser);
      await toMonkSkills(w.page);
      await w.page.selectOption('#cw1121Slot0Pick', 'Etiquette');
      await w.page.click('#cw1121Slot0Add');
      await w.page.fill('#cw1122LoreSubject', 'History');
      await w.page.click('#cw1122LoreSet');
      await toStep(w.page, 'Kiho');
      const kiho = await w.page.evaluate(() => [...document.querySelectorAll('#cw1122KihoPick option')].find(o => !o.disabled && /free pick/.test(o.textContent)).value);
      await w.page.selectOption('#cw1122KihoPick', kiho);
      await w.page.click('#cw1122KihoAdd');
      const viaWizard = await w.page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
      const h = await fresh(browser);
      await h.page.evaluate((school) => {
        const set = (id, v, ev) => { const el = document.getElementById(id); el.value = v; (ev || ['input', 'change']).forEach(e => el.dispatchEvent(new Event(e, {bubbles: true}))); };
        set('f_name', 'Brother Kenji');
        set('cfs_clan', 'Brotherhood of Shinsei', ['change']);
        set('cfs_school', school, ['change']);
        document.getElementById('cfs_applySchool').click();
      }, MONK);
      await h.page.waitForFunction((s) => window.__L5R_TEST__.CW112.appliedSchool() === s, MONK);
      await h.page.evaluate((k) => {
        const fire = (el, ...types) => types.forEach(t => el.dispatchEvent(new Event(t, {bubbles: true})));
        const q = document.getElementById('skillQuickAdd'); q.value = 'Etiquette'; fire(q, 'change');
        const tr = document.getElementById('skillsBody').lastElementChild;
        const r = tr.querySelector('.sk-rank'); r.value = 1; fire(r, 'input', 'change');
        const s = tr.querySelector('.sk-school'); s.checked = true; fire(s, 'change');
        const lore = [...document.getElementById('skillsBody').rows].find(row => row.querySelector('.sk-name').value === 'Lore');
        const n = lore.querySelector('.sk-name'); n.value = 'Lore: History'; fire(n, 'input', 'change');
        [...lore.querySelectorAll('.emph-item-row')].find(row => (row.querySelector('.sk-emph-select, .sk-emph-text') || {}).value === 'pick one').querySelector('.emph-item-del').click();
        const t = document.getElementById('techQuickAdd'); t.value = k; fire(t, 'change');
      }, kiho);
      const byHand = await h.page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
      check('CW2-SAME-AS-BY-HAND-MONK', viaWizard === byHand);
      if (viaWizard !== byHand) {
        const a = JSON.parse(viaWizard), b = JSON.parse(byHand);
        console.log('     differing keys: ' + Object.keys(a).filter(k => JSON.stringify(a[k]) !== JSON.stringify(b[k])).join(', '));
      }
    });
  } finally {
    for (const c of OPEN) await c.close().catch(() => {});
    await browser.close();
  }
  const total = passed + failed;
  console.log(`\n${passed}/${total} checks passed`);
  process.exit(total > 0 && failed === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); console.log(`\n${passed}/${passed + failed + 1} checks passed`); process.exit(1); });
