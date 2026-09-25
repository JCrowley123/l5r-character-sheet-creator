/* =============================================================================
   PART K PHASE 11.2.4 — WIZARD: STARTING SPELLS FOR EVERY SCHOOL: AUTOMATED CHECKS

     NODE_PATH=/opt/node22/lib/node_modules node qa/wizard5-harness.js [sheet.html]

   Defaults to the live Phase 0 build; fresh browser context per scenario, 390 x 844.

   ORACLES: every School's line is the owner's quotation of 25 September, re-typed here from the
   messages rather than read from the code under test; every picker is compared with the sheet's
   own Technique picker (#techQuickAdd), which applies spellEligibility() and exempts Maho; Ward
   spells are the library's own Wards keyword plus the owner's quoted Yogo list; the wizard's
   result is compared with the same choices made by hand (CW5-SAME-AS-BY-HAND).
   ============================================================================= */

'use strict';

const { chromium } = require('playwright');
const path = require('path');

const SHEET = path.resolve(process.argv[2] || path.join(__dirname, '..', '..',
  'Part F — Cross-Platform Delivery', 'PART F — Phase 0 Source Reorganization for Maintainability',
  'l5r-character-sheet.html'));
const URL = 'file://' + SHEET;

const SCC = ['Sense', 'Commune', 'Summon'];
// The owner's quotations. [source, given, Element counts] or, for the three that are not counts,
// [source, given, null, the line as the step shows it, the box labels].
const LINES = {
  'Agasha Shugenja': ['Core Rulebook p.125', SCC, [['Fire', 3], ['Earth', 2], ['Air', 1]]],
  'Asahina Shugenja': ['Core Rulebook p.110', SCC, [['Air', 3], ['Water', 2], ['Earth', 1]]],
  'Chuda Shugenja': ['Core Rulebook p.213', SCC, null,
    'Sense, Commune, Summon, 3 Maho spells of one Element, 2 Maho spells of a second non-Deficient Element, and any 1 spell of any non-Deficient Element',
    ['Maho spells of one Element: choose 3', 'Maho spells of a second Element, not your Deficiency: choose 2', 'Any spell, not of your Deficiency: choose 1']],
  'Chuda Shugenja [Snake]': ['Core Rulebook p.224', SCC, [['Earth', 3], ['Fire', 2], ['Water', 1]]],
  'Fuzake Shugenja': ['Secrets of the Empire, page not yet recorded', SCC.concat(['Path to Inner Peace']), [['Earth', 3], ['Water', 1], ['Air', 1]],
    'Sense, Commune, Summon, 3 Earth, 2 Water (one is automatically Path to Inner Peace), 1 Air'],
  'Horiuchi Shugenja': ['Rulebook page not yet recorded', SCC, [['Earth', 3], ['Water', 2], ['Fire', 1]]],
  'Isawa Shugenja': ['Core Rulebook p.124', SCC, null,
    'Sense, Commune, Summon, 3 spells of any one Element, 2 of any other Element, 1 of a third Element and 1 of a fourth',
    ['Spells of any one Element: choose 3', 'Spells of another Element: choose 2', 'A spell of a third Element: choose 1', 'A spell of a fourth Element: choose 1']],
  'Iuchi Shugenja': ['Core Rulebook p.130', SCC, [['Water', 3], ['Earth', 2], ['Air', 1]]],
  'Kitsune Shugenja': ['Core Rulebook p.219', SCC, [['Earth', 3], ['Water', 2], ['Fire', 1]]],
  'Komori Shugenja': ['Core Rulebook p.216', SCC, [['Air', 3], ['Water', 2], ['Fire', 1]]],
  'Kuni Shugenja': ['Core Rulebook p.107', SCC, [['Earth', 3], ['Fire', 2], ['Water', 1]]],
  'Moshi Shugenja': ['Core Rulebook p.120', SCC, [['Air', 3], ['Fire', 3]]],
  'Moto Death Priest [Shugenja]': ['Imperial Histories p.240', SCC, [['Earth', 3], ['Fire', 2], ['Water', 1]]],
  'Ninube Shugenja': ['Great Clans, page not yet recorded', SCC, [['Air', 3], ['Fire', 2], ['Water', 1]]],
  'Seppun Shugenja': ['Core Rulebook p.228', SCC, [['Fire', 3], ['Earth', 2], ['Air', 1]]],
  'Soshi Shugenja': ['Core Rulebook p.127', SCC, [['Air', 3], ['Fire', 2], ['Water', 1]]],
  'Tamori Shugenja': ['Core Rulebook p.113', SCC, [['Earth', 3], ['Fire', 2], ['Water', 1]]],
  'Tonbo Shugenja': ['Core Rulebook p.218', SCC, [['Water', 3], ['Air', 2], ['Earth', 1]]],
  'Yogo Wardmaster [Shugenja]': ['Rulebook page not yet recorded', ['Commune', 'Summon'], null,
    'Commune, Summon, 3 Ward spells, 3 other spells that are not Void spells',
    ['Ward spells: choose 3', 'Other spells, not Void: choose 3']],
  'Yoritomo Shugenja': ['Rulebook page not yet recorded', SCC, [['Water', 3], ['Fire', 2], ['Air', 1]]],
};
// The owner's quoted Yogo list, under the sheet's own spell names.
const YOGO_WARDS = ['To Seek the Truth', 'By the Light of the Moon', "Benten's Touch", 'Summon Fog', 'Armor of Earth',
  'Courage of the Seven Thunders', 'Force of Will', 'Wholeness of the World', 'Extinguish', 'Fires of Purity', 'Disrupt the Aura',
  'Haze of Battle', 'Globe of the Everlasting Sun', 'Reversal of Fortunes', 'Rejuvenating Vapors', 'Wisdom & Clarity', 'Near to Ice'];
// Clan, then Family (null: the first listed), for the wizard.
const ROUTES = {
  'Agasha Shugenja': ['Phoenix', 'Agasha'], 'Asahina Shugenja': ['Crane', 'Asahina'], 'Chuda Shugenja': ['Spider', 'Chuda'],
  'Chuda Shugenja [Snake]': ['Minor Clan', 'Snake', 'Chuda'], 'Fuzake Shugenja': ['Minor Clan', 'Monkey', 'Fuzake'],
  'Horiuchi Shugenja': ['Unicorn', 'Horiuchi'], 'Isawa Shugenja': ['Phoenix', 'Isawa'], 'Iuchi Shugenja': ['Unicorn', 'Iuchi'],
  'Kitsune Shugenja': ['Minor Clan', 'Fox', 'Kitsune'], 'Komori Shugenja': ['Minor Clan', 'Bat', 'Komori'], 'Kuni Shugenja': ['Crab', 'Kuni'],
  'Moshi Shugenja': ['Minor Clan', 'Mantis', 'Moshi'], 'Moto Death Priest [Shugenja]': ['Unicorn', 'Moto'], 'Ninube Shugenja': ['Spider', null],
  'Seppun Shugenja': ['Imperial', 'Seppun'], 'Soshi Shugenja': ['Scorpion', 'Soshi'], 'Tamori Shugenja': ['Dragon', 'Tamori'],
  'Tonbo Shugenja': ['Minor Clan', 'Dragonfly', 'Tonbo'], 'Yogo Wardmaster [Shugenja]': ['Scorpion', 'Yogo'],
  'Yoritomo Shugenja': ['Minor Clan', 'Mantis', 'Yoritomo'],
};
const KITSU = {source: 'Core Rulebook p.118', given: SCC, choose: [['Water', 3], ['Air', 2], ['Earth', 1]]};
const ELEMENTS = ['Air', 'Earth', 'Fire', 'Water', 'Void'];

let passed = 0, failed = 0;
function check(name, actual, expected) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected === undefined ? true : expected);
  if (a === e) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + '\n     expected ' + e + '\n     actual   ' + a); }
}
async function scenario(name, body) {
  try { await body(); }
  catch (e) { failed++; console.log('FAIL CW5-SCENARIO-RAN-' + name.replace(/[^a-z]+/gi, '-').toUpperCase() + '\n     ' + String(e.message || e).split('\n')[0]); }
}
const slug = (s) => s.replace(/\[.*?\]/g, (m) => m.slice(1, -1)).replace(/[^a-z]+/gi, '-').replace(/^-|-$/g, '').toUpperCase();

const OPEN = [];
async function fresh(browser) {
  const context = await browser.newContext({viewport: {width: 390, height: 844}});
  OPEN.push(context);
  const page = await context.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(String(e)));
  await page.goto(URL);
  await page.waitForFunction(() => { const T = window.__L5R_TEST__;
    return T && T.CL11 && T.CL11.ready && T.CW112 && T.CW1122 && T.CW1123 && T.CW1124; }, null, {timeout: 15000});
  return page;
}
const title = (page) => page.evaluate(() => document.getElementById('cw112Title').textContent);
async function next(page) {
  await page.waitForFunction(() => !document.getElementById('cw112Next').disabled);
  await page.click('#cw112Next');
}
async function toStep(page, wanted) {
  for (let i = 0; i < 12 && (await title(page)) !== wanted; i++) await next(page);
}
async function exactPick(page, text, nth) {
  const scope = nth === undefined ? page.locator('#cw112Body') : page.locator('#cw112Body .cw112-cards').nth(nth);
  await scope.locator('.cw112-card').filter({has: page.locator('.cw112-card-title', {hasText: new RegExp('^' + text.replace(/[[\]()]/g, '\\$&') + '$')})}).first().click();
}
// The wizard to the chosen School's Spells step. Isawa picks its Affinity, Chuda its Deficiency.
async function toSpells(page, school, choice) {
  await page.evaluate(() => document.getElementById('cl11Toolbar').click());
  await page.click('#cl11Create');
  await page.waitForFunction(() => !document.getElementById('cw112View').hidden);
  await page.fill('#cw112Name', 'Test');
  await next(page);
  const r = ROUTES[school];
  if (r[0] === 'Minor Clan') { await exactPick(page, 'Minor Clan'); await exactPick(page, r[1], 1); } else await exactPick(page, r[0]);
  await next(page);
  const family = r[0] === 'Minor Clan' ? r[2] : r[1];
  if (family) await exactPick(page, family); else await page.locator('#cw112Body .cw112-card').first().click();
  await next(page);
  await exactPick(page, school);
  await page.waitForTimeout(300);
  if (await page.evaluate(() => document.getElementById('affinityPickModalOverlay').style.display === 'flex')) {
    await page.click('#affinityPick_' + (choice || 'Water')); await page.click('#affinityPickConfirm');
  }
  if (await page.evaluate(() => document.getElementById('deficiencyPickModalOverlay').style.display === 'flex')) {
    await page.click('#deficiencyPick_' + (choice || 'Air')); await page.click('#deficiencyPickConfirm');
  }
  await page.waitForFunction((s) => window.__L5R_TEST__.CW112.appliedSchool() === s && !window.__L5R_TEST__.CW112.busy, school);
  await toStep(page, 'Spells');
}
const learned = (page) => page.evaluate(() => [...document.querySelectorAll('#techList .entry')].filter(d => d.dataset.spellElement).map(d => d.querySelector('.en-name').value));
const scrolls = (page) => page.evaluate(() => [...document.querySelectorAll('#equipBody .eq-name')].map(n => n.value).filter(v => /^Spell Scroll/.test(v)).map(v => v.replace(/^Spell Scroll — /, '')));
const labels = (page) => page.evaluate(() => [...document.querySelectorAll('.cw1123-quota .cw1121-slot-label, .cw1124-slot .cw1121-slot-label')].map(p => p.textContent));
const allotment = (page) => page.evaluate(() => { const p = [...document.querySelectorAll('#cw112Body p.cw112-note')].find(n => / starts with /.test(n.textContent)); return p ? p.textContent : ''; });
const pickOptions = (page) => page.evaluate(() => [...document.querySelectorAll('#cw1124Pick option')].map(o => o.value).filter(Boolean));
// The sheet's own Technique picker: every spell it lists (Maho exempt from the rank gate), not yet known.
const sheetSpells = (page) => page.evaluate(() => {
  const T = window.__L5R_TEST__;
  T.refreshTechQuickAddOptions();
  const known = [...document.querySelectorAll('#techList .entry')].filter(d => d.dataset.spellElement).map(d => d.querySelector('.en-name').value.toLowerCase());
  return [...document.querySelectorAll('#techQuickAdd option')].map(o => o.value).filter(v => /^spell:/.test(v)).map(v => Number(v.split(':')[1]))
    .filter(i => !known.includes(T.SPELL_LIBRARY[i].name.toLowerCase())).map(i => Object.assign({i: String(i)}, T.SPELL_LIBRARY[i]));
});
async function addValue(page, value) {
  await page.selectOption('#cw1124Pick', value);
  await page.click('#cw1124Add');
  await page.waitForTimeout(150);
}
async function addWhere(page, test) {
  const all = await page.evaluate(() => { const L = window.__L5R_TEST__.SPELL_LIBRARY;
    return [...document.querySelectorAll('#cw1124Pick option')].filter(o => o.value).map(o => Object.assign({i: o.value}, L[Number(o.value)])); });
  const s = all.find(test);
  if (!s) throw new Error('no such spell offered');
  await addValue(page, s.i);
  return s;
}
const NO_PHASE_5 = 'no character check in this build';
const finding = (page) => page.evaluate((none) => typeof window.__L5R_TEST__.validateCharacter !== 'function' ? none
  : (window.__L5R_TEST__.validateCharacter().findings.find(f => f.id === 'school-starting-spells') || {}).detail || '', NO_PHASE_5);
const hasPhase5 = (page) => page.evaluate(() => typeof window.__L5R_TEST__.validateCharacter === 'function');
const sorted = (a) => a.slice().sort((x, y) => Number(x) - Number(y));

async function main() {
  console.log('Wizard starting spells for every School checks against: ' + SHEET);
  const browser = await chromium.launch();
  try {
    await scenario('table', async () => {
      const page = await fresh(browser);
      check('CW5-ENABLED', await page.evaluate(() => window.__L5R_TEST__.WIZARD_STARTING_SPELLS_ALL_ENABLED));
      // One check per School: its source, given spells and line as the step states it.
      for (const [school, line] of Object.entries(LINES)) {
        const describe = line[3] || line[1].join(', ') + ', ' + line[2].map(p => p[1] + ' ' + p[0]).join(', ');
        check('CW5-LINE-' + slug(school), await page.evaluate((s) => { const C = window.__L5R_TEST__.CW1123, d = C.forSchool(s);
          return d && [d.source, d.given, d.choose || null, C.describe(d)]; }, school), [line[0], line[1], line[3] && !line[2] ? null : line[2], describe]);
      }
      check('CW5-KITSU-UNCHANGED', await page.evaluate(() => [Object.keys(window.__L5R_TEST__.CW1123.table), window.__L5R_TEST__.CW1123.forSchool('Kitsu Shugenja')]),
        [['Kitsu Shugenja'], KITSU]);
      check('CW5-EVERY-SCHOOL-RECORDED', await page.evaluate(() => { const T = window.__L5R_TEST__;
        return T.allSchoolEntries().filter(s => s.shugenja && !T.CW1123.forSchool(s.name)).map(s => s.name); }), []);
      check('CW5-NAMED-SPELLS-EXIST', await page.evaluate((w) => { const T = window.__L5R_TEST__, names = w.slice();
        T.allSchoolEntries().forEach(s => { const d = T.CW1123.forSchool(s.name); if (d) names.push(...d.given); });
        return names.filter(n => !T.SPELL_LIBRARY.some(s => s.name === n)); }, YOGO_WARDS), []);
      check('CW5-YOGO-WARDS', await page.evaluate((w) => { const T = window.__L5R_TEST__;
        return T.SPELL_LIBRARY.filter(s => T.CW1124.isWard(s)).map(s => s.name).sort(); }, YOGO_WARDS),
        await page.evaluate((w) => window.__L5R_TEST__.SPELL_LIBRARY.filter(s => (s.keywords || []).includes('Wards') || w.includes(s.name)).map(s => s.name).sort(), YOGO_WARDS));
      // The order spells were chosen in never changes the count.
      check('CW5-ORDER-INDEPENDENT', await page.evaluate(() => { const T = window.__L5R_TEST__, L = T.SPELL_LIBRARY, d = T.CW1123.forSchool('Isawa Shugenja');
        const of = (el, n) => L.filter(s => s.element === el && !s.maho).slice(0, n);
        const a = of('Air', 1).concat(of('Water', 3)), b = of('Water', 3).concat(of('Air', 1));
        return [T.CW1124.bestFit(d.slots, a, '').have, T.CW1124.bestFit(d.slots, b, '').have]; }), [[3, 1, 0, 0], [3, 1, 0, 0]]);
      // When two ways fill as many, the earlier (larger) boxes are filled first: one Air then two
      // Water put Water in the first box (2 of 3) and Air in the second, not Air first.
      check('CW5-EARLIER-BOXES-FIRST', await page.evaluate(() => { const T = window.__L5R_TEST__, L = T.SPELL_LIBRARY, d = T.CW1123.forSchool('Isawa Shugenja');
        const of = (el, n) => L.filter(s => s.element === el && !s.maho).slice(0, n);
        return T.CW1124.bestFit(d.slots, of('Air', 1).concat(of('Water', 2)), ''); }), {have: [2, 1, 0, 0], element: ['Water', 'Air', '', '']});
      // Spider Chuda's second Maho box and its any-spell box refuse the chosen Deficiency; its first
      // does not. Each pair differs only in whether Air is the Deficiency, and the counts must differ:
      // 3 Earth + 2 Air Maho fill 3-2-0 with no Deficiency, but with Air deficient the Air pair can
      // only sit in the first box (2-2-1); a plain Air spell fills the any-spell box only when Air is
      // not the Deficiency.
      check('CW5-CHUDA-DEFICIENCY', await page.evaluate(() => { const T = window.__L5R_TEST__, L = T.SPELL_LIBRARY, d = T.CW1123.forSchool('Chuda Shugenja');
        const maho = (el, n) => L.filter(s => s.element === el && s.maho).slice(0, n);
        const plainAir = L.filter(s => s.element === 'Air' && !s.maho).slice(0, 1);
        const a = maho('Earth', 3).concat(maho('Air', 2)), b = maho('Earth', 3).concat(maho('Water', 2), plainAir);
        return [T.CW1124.bestFit(d.slots, a, 'Air').have, T.CW1124.bestFit(d.slots, a, '').have,
          T.CW1124.bestFit(d.slots, b, 'Air').have, T.CW1124.bestFit(d.slots, b, '').have]; }),
        [[2, 2, 1], [3, 2, 0], [3, 2, 0], [3, 2, 1]]);
      check('CW5-NO-PAGE-ERRORS-TABLE', page.errors, []);
    });

    // Every School, through the wizard: the step states its line and draws its boxes.
    for (const [school, line] of Object.entries(LINES)) {
      await scenario('walk ' + school, async () => {
        const page = await fresh(browser);
        await toSpells(page, school);
        const describe = line[3] || line[1].join(', ') + ', ' + line[2].map(p => p[1] + ' ' + p[0]).join(', ');
        const boxes = line[4] || line[2].map(p => p[0] + ': choose ' + p[1]);
        check('CW5-WALK-' + slug(school), [await allotment(page), await labels(page), await learned(page), page.errors],
          [school + ' starts with ' + describe + ' (' + line[0] + '). Each is added to your Equipment as its Spell Scroll and learned.',
            boxes.map(b => b + ' · 0 chosen'), line[1], []]);
      });
    }

    await scenario('isawa', async () => {
      const page = await fresh(browser);
      await toSpells(page, 'Isawa Shugenja', 'Water');
      const start = (await sheetSpells(page)).filter(s => ELEMENTS.includes(s.element) && !s.maho);
      check('CW5-ISAWA-OPTIONS-MATCH-SHEET', sorted(await pickOptions(page)), sorted(start.map(s => s.i)));
      const air = await addWhere(page, s => s.element === 'Air');
      check('CW5-ISAWA-FIRST-SPELL', await labels(page), ['Spells of any one Element: choose 3 · 1 chosen (Air)', 'Spells of another Element: choose 2 · 0 chosen',
        'A spell of a third Element: choose 1 · 0 chosen', 'A spell of a fourth Element: choose 1 · 0 chosen']);
      check('CW5-ISAWA-OPEN', await page.evaluate(() => window.__L5R_TEST__.CW1122.openFor('spells')),
        ['2 Air spells', '2 spells of another Element', '1 spell of a third Element', '1 spell of a fourth Element']);
      check('CW5-VALIDATOR-NOTES-IT', await finding(page), (await hasPhase5(page))
        ? 'Core Rulebook p.124 gives Sense, Commune, Summon, 3 spells of any one Element, 2 of any other Element, 1 of a third Element and 1 of a fourth. Still to choose: 2 Air spells, 2 spells of another Element, 1 spell of a third Element, 1 spell of a fourth Element.' : NO_PHASE_5);
      for (let i = 0; i < 3; i++) await addWhere(page, s => s.element === 'Water');
      // Three Water now fill the first box; the Air spell moves to the second.
      check('CW5-ISAWA-BEST-FIT', await labels(page), ['Spells of any one Element: choose 3 · 3 chosen (Water)', 'Spells of another Element: choose 2 · 1 chosen (Air)',
        'A spell of a third Element: choose 1 · 0 chosen', 'A spell of a fourth Element: choose 1 · 0 chosen']);
      const offered = await pickOptions(page), now = await sheetSpells(page);
      check('CW5-ISAWA-OPTIONS-SHRINK', [ELEMENTS.filter(e => offered.some(v => now.find(s => s.i === v && s.element === e))),
        sorted(offered), air.name !== ''], [['Air', 'Earth', 'Fire', 'Void'],
        sorted(now.filter(s => ['Air', 'Earth', 'Fire', 'Void'].includes(s.element) && !s.maho).map(s => s.i)), true]);
      await addWhere(page, s => s.element === 'Air');
      await addWhere(page, s => s.element === 'Earth');
      await addWhere(page, s => s.element === 'Fire');
      check('CW5-ISAWA-FILLED', [await labels(page), await page.evaluate(() => !!document.getElementById('cw1124Pick')),
        await page.evaluate(() => window.__L5R_TEST__.CW1122.openFor('spells'))],
        [['Spells of any one Element: choose 3 · 3 chosen (Water)', 'Spells of another Element: choose 2 · 2 chosen (Air)',
          'A spell of a third Element: choose 1 · 1 chosen (Earth)', 'A spell of a fourth Element: choose 1 · 1 chosen (Fire)'], false, []]);
      const all = await learned(page);
      check('CW5-SCROLL-FOR-EVERY-SPELL', [all.length, (await scrolls(page)).slice().sort()], [10, all.slice().sort()]);
      check('CW5-VALIDATOR-CLEARS', await finding(page), (await hasPhase5(page)) ? '' : NO_PHASE_5);
      check('CW5-TOUCH-TARGETS', await page.evaluate(() => [...document.querySelectorAll('#cw112Body .cw1121-remove')].every(e => e.getBoundingClientRect().height >= 44)));
      // Removing one takes its scroll and reopens a box: the earlier boxes fill first, so the Fire
      // spell moves up to the third and the fourth opens, with the picker back.
      const earth = (await learned(page))[8];
      await page.locator('.cw1121-entry', {hasText: earth}).locator('.cw1121-remove').click();
      await page.waitForTimeout(200);
      check('CW5-REMOVE-REOPENS', [(await labels(page)).slice(2), (await scrolls(page)).includes(earth), await page.evaluate(() => {
        const p = document.getElementById('cw1124Pick'), b = document.getElementById('cw1124Add');
        return !!p && [p, b].every(e => e.getBoundingClientRect().height >= 44); })],
        [['A spell of a third Element: choose 1 · 1 chosen (Fire)', 'A spell of a fourth Element: choose 1 · 0 chosen'], false, true]);
      await toStep(page, 'Review');
      check('CW5-REVIEW-LISTS-OPEN', await page.evaluate(() => [...document.querySelectorAll('#cw1122Still li')].map(l => l.textContent).filter(t => /^Spells/.test(t))),
        ['Spells: 1 spell of a fourth Element']);
      check('CW5-NO-PAGE-ERRORS-ISAWA', page.errors, []);
    });

    await scenario('chuda', async () => {
      const page = await fresh(browser);
      await toSpells(page, 'Chuda Shugenja', 'Air');
      const start = (await sheetSpells(page)).filter(s => ELEMENTS.includes(s.element) && (s.maho || s.element !== 'Air'));
      check('CW5-CHUDA-OPTIONS-MATCH-SHEET', sorted(await pickOptions(page)), sorted(start.map(s => s.i)));
      for (let i = 0; i < 3; i++) await addWhere(page, s => s.maho && s.element === 'Earth');
      check('CW5-CHUDA-MAHO-COUNTED', [await labels(page), (await learned(page)).length], [['Maho spells of one Element: choose 3 · 3 chosen (Earth)',
        'Maho spells of a second Element, not your Deficiency: choose 2 · 0 chosen', 'Any spell, not of your Deficiency: choose 1 · 0 chosen'], 6]);
      check('CW5-NO-PAGE-ERRORS-CHUDA', page.errors, []);
    });

    await scenario('yogo', async () => {
      const page = await fresh(browser);
      await toSpells(page, 'Yogo Wardmaster [Shugenja]');
      const start = (await sheetSpells(page)).filter(s => ELEMENTS.includes(s.element) && !s.maho
        && ((s.keywords || []).includes('Wards') || YOGO_WARDS.includes(s.name) || s.element !== 'Void'));
      check('CW5-YOGO-OPTIONS-MATCH-SHEET', sorted(await pickOptions(page)), sorted(start.map(s => s.i)));
      await addWhere(page, s => YOGO_WARDS.includes(s.name));
      await addWhere(page, s => !YOGO_WARDS.includes(s.name) && !(s.keywords || []).includes('Wards'));
      check('CW5-YOGO-BOXES', await labels(page), ['Ward spells: choose 3 · 1 chosen', 'Other spells, not Void: choose 3 · 1 chosen']);
      check('CW5-NO-PAGE-ERRORS-YOGO', page.errors, []);
    });

    await scenario('seppun', async () => {
      const page = await fresh(browser);
      await toSpells(page, 'Seppun Shugenja');
      // The owner's corrected line (3 Fire, 2 Earth, 1 Air) asks for nothing of Seppun's Water
      // Deficiency: every box has a picker, and each offers exactly the sheet's own list.
      const sheet = await sheetSpells(page);
      const opts = async (el) => (await page.evaluate((e) => [...document.querySelectorAll('#cw1123Pick' + e + ' option')].map(o => o.value).filter(Boolean), el));
      check('CW5-SEPPUN-CORRECTED', [await opts('Fire'), await opts('Earth'), await opts('Air'),
        /is within your effective School Rank/.test(await page.evaluate(() => document.getElementById('cw112Body').textContent))],
        [...['Fire', 'Earth', 'Air'].map(e => sheet.filter(s => s.element === e && !s.maho).map(s => s.i)), false]);
    });

    await scenario('fuzake', async () => {
      const page = await fresh(browser);
      await toSpells(page, 'Fuzake Shugenja');
      check('CW5-FUZAKE-PATH-GIVEN', [await scrolls(page), (await labels(page))[1]],
        [['Sense', 'Commune', 'Summon', 'Path to Inner Peace'], 'Water: choose 1 · 0 chosen']);
    });

    await scenario('same as by hand', async () => {
      const w = {page: await fresh(browser)};
      await toSpells(w.page, 'Chuda Shugenja', 'Air');
      const maho = await addWhere(w.page, s => s.maho && s.element === 'Earth');
      const viaWizard = await w.page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
      const h = {page: await fresh(browser)};
      await h.page.evaluate(() => {
        const set = (id, v, ev) => { const el = document.getElementById(id); el.value = v; (ev || ['input', 'change']).forEach(e => el.dispatchEvent(new Event(e, {bubbles: true}))); };
        set('f_name', 'Test');
        set('cfs_clan', 'Spider', ['change']);
        set('cfs_family', 'Chuda', ['change']);
        document.getElementById('cfs_applyFamily').click();
        set('cfs_school', 'Chuda Shugenja', ['change']);
        document.getElementById('cfs_applySchool').click();
      });
      await h.page.waitForFunction(() => document.getElementById('deficiencyPickModalOverlay').style.display === 'flex');
      await h.page.click('#deficiencyPick_Air'); await h.page.click('#deficiencyPickConfirm');
      await h.page.waitForFunction(() => window.__L5R_TEST__.CW112.appliedSchool() === 'Chuda Shugenja');
      await h.page.evaluate((ids) => {
        ids.forEach((i) => {
          document.getElementById('addSpellScroll').click();
          document.querySelector('#spellScrollsList .spell-scroll-add-btn[data-idx="' + i + '"]').click();
          document.getElementById('spellScrollsX').click();
          const q = document.getElementById('techQuickAdd'); q.value = 'spell:' + i; q.dispatchEvent(new Event('change', {bubbles: true}));
        });
      }, await h.page.evaluate((mi) => ['Sense', 'Commune', 'Summon'].map(n => window.__L5R_TEST__.SPELL_LIBRARY.findIndex(s => s.name === n)).concat(Number(mi)), maho.i));
      const byHand = await h.page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
      check('CW5-SAME-AS-BY-HAND', viaWizard === byHand);
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
