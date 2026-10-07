'use strict';

// Usage: node dependency-boundary-harness.js /absolute/path/to/l5r-character-sheet.html
// Each scenario serves an in-memory copy in a fresh browser context. No input or source
// file is written. The successful run has 189 checks: 21 in each of nine scenarios.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const FLAGS = [
  'ADVANCED_SCHOOLS_ENABLED', 'SUPPLEMENTAL_ADVANCED_SCHOOLS_ENABLED',
  'ALTERNATE_PATHS_ENABLED', 'SAVE_FORMAT_ENABLED',
  'WIZARD_SKILLS_ADV_ENABLED', 'WIZARD_FREE_CHOICES_ENABLED',
];
const SCENARIOS = [
  { id: 'CONTROL', off: [], supplemental: true },
  { id: 'CORE-OFF', off: ['ADVANCED_SCHOOLS_ENABLED'], supplemental: false },
  { id: 'PATHS-OFF', off: ['ALTERNATE_PATHS_ENABLED'], supplemental: false },
  { id: 'SAVE-FORMAT-OFF', off: ['SAVE_FORMAT_ENABLED'], supplemental: false },
  { id: 'WIZARD-SKILLS-OFF', off: ['WIZARD_SKILLS_ADV_ENABLED'], supplemental: true },
  { id: 'WIZARD-CHOICES-OFF', off: ['WIZARD_FREE_CHOICES_ENABLED'], supplemental: true },
  { id: 'WIZARD-BOTH-OFF', off: ['WIZARD_SKILLS_ADV_ENABLED', 'WIZARD_FREE_CHOICES_ENABLED'], supplemental: true },
  { id: 'ADVANCED-OFF', off: ['ADVANCED_SCHOOLS_ENABLED', 'SUPPLEMENTAL_ADVANCED_SCHOOLS_ENABLED'], supplemental: false },
  {
    id: 'ALL-OPTIONAL-OFF',
    off: ['ALTERNATE_PATHS_ENABLED', 'WIZARD_SKILLS_ADV_ENABLED', 'WIZARD_FREE_CHOICES_ENABLED',
      'ADVANCED_SCHOOLS_ENABLED', 'SUPPLEMENTAL_ADVANCED_SCHOOLS_ENABLED'],
    supplemental: false,
  },
];
// Independent expected results, not copied back from the catalogue under test.
const SCHOOLS = [
  {
    id: 'SCOUT', clan: 'Crab', minor: null, family: 'Hiruma',
    name: 'Hiruma Scout [Bushi]', trait: 'trait_reflexes', honor: 4.5,
    skills: ['Athletics', 'Hunting', 'Kenjutsu', 'Kyujutsu', 'Lore: Shadowlands', 'Stealth'],
    techniques: ["Dance the Razor's Edge", 'Run Like the Wind', 'Veil of the Spirits', 'Harness the Wind', 'Strike of the Stalker'],
  },
  {
    id: 'YOTSU', clan: 'Minor Clan', minor: 'Tiger', family: 'Yotsu',
    name: 'Yotsu Bushi School (Heroes of Rokugan) [Bushi]', trait: 'trait_agility', honor: 5.5,
    skills: ['Commerce', 'Hunting', 'Kenjutsu', 'Kyujutsu', 'Stealth'],
    techniques: ["The Tiger's Tread", "The Tiger's Pounce", 'Rending Claws', 'Shelter the Blameless (Yotsu Bushi)', "The Tiger's Fangs"],
  },
];
const SUPPLEMENTAL_IDS = [
  'minor-clan-defender', 'imperial-scion', 'kobune-captain', 'dark-paragons',
  'kolat-assassin', 'berserkers', 'legion-of-two-thousand', 'disciples-of-sun-tao',
  'children-of-doji', 'kakita-master-artisan', 'mirumoto-master-sensei',
  'tamori-master-of-the-mountain', 'akodo-tactical-master', 'asako-inquisitors',
].sort();
const EXPECTED_CHECKS = SCENARIOS.length * 21;
const results = [];

function check(id, actual, expected = true) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  results.push({ id, pass });
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' :
    ' actual=' + JSON.stringify(actual) + ' expected=' + JSON.stringify(expected)));
}

function htmlFor(original, off) {
  let html = original;
  // Refuse changed or missing declarations; a replacement that matched nothing must
  // never masquerade as a successful dependency-disabled test.
  for (const flag of FLAGS) {
    const expression = new RegExp('\\bconst\\s+' + flag + '\\s*=\\s*true\\s*;', 'g');
    const matches = html.match(expression) || [];
    if (matches.length !== 1) throw new Error(flag + ': expected exactly one enabled declaration, found ' + matches.length);
    if (off.includes(flag)) html = html.replace(expression, 'const ' + flag + ' = false;');
  }
  return html;
}

async function checkManualSchool(page, scenario, school) {
  const id = 'DEP-' + scenario.id + '-' + school.id;
  const initial = await page.evaluate(s => {
    const T = window.__L5R_TEST__;
    T.CL11.close();
    T.resetToBaseline();
    T.MODES12.set('management');
    const pick = (id, value) => {
      const field = document.getElementById(id);
      field.value = value;
      field.dispatchEvent(new Event('change', { bubbles: true }));
    };
    pick('cfs_clan', s.clan);
    if (s.minor) pick('cfs_minorClan', s.minor);
    const familyOffered = [...document.getElementById('cfs_family').options].some(o => o.value === s.family);
    pick('cfs_family', s.family);
    document.getElementById('cfs_applyFamily').click();
    const schoolOffered = [...document.getElementById('cfs_school').options].some(o => o.value === s.name);
    pick('cfs_school', s.name);
    return { familyOffered, schoolOffered, before: Number(document.getElementById(s.trait).value) };
  }, school);
  check(id + '-PICKER', { family: initial.familyOffered, school: initial.schoolOffered }, { family: true, school: true });

  await page.evaluate(() => document.getElementById('cfs_applySchool').click());
  await page.waitForFunction(name => document.getElementById('f_school').value === name, school.name);
  const applied = await page.evaluate(s => ({
    identity: {
      clan: document.getElementById('f_clan').value,
      family: document.getElementById('f_family').value,
      school: document.getElementById('f_school').value,
    },
    benefit: Number(document.getElementById(s.trait).value),
    honor: Number(document.getElementById('f_honorRank').value),
    skills: [...document.querySelectorAll('#skillsBody tr')].map(row => ({
      name: row.querySelector('.sk-name').value,
      rank: Number(row.querySelector('.sk-rank').value),
      free: row.querySelector('.sk-school').checked,
    })).sort((a, b) => a.name.localeCompare(b.name)),
    techniques: [...document.querySelectorAll('#techList .entry')]
      .filter(row => row.querySelector('.en-desc').value.startsWith('[School Technique'))
      .map(row => ({
        name: row.querySelector('.en-name').value,
        referenced: row.querySelector('.en-desc').value.includes('Imperial Histories'),
        cost: Number(row.querySelector('.en-cost').value),
      })),
  }), school);
  check(id + '-APPLIED', applied.identity, { clan: school.minor || school.clan, family: school.family, school: school.name });
  check(id + '-BENEFIT-HONOR', { benefit: applied.benefit, honor: applied.honor }, { benefit: initial.before + 1, honor: school.honor });
  check(id + '-SKILLS', applied.skills, school.skills.map(name => ({ name, rank: 1, free: true })).sort((a, b) => a.name.localeCompare(b.name)));
  check(id + '-RANK1-TECHNIQUE', applied.techniques, [{ name: school.techniques[0], referenced: true, cost: 0 }]);

  const advanced = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const bonus = document.getElementById('f_insightBonus');
    bonus.value = Number(bonus.value) + 225 - Number(document.getElementById('f_insightPts').value);
    T.recalcAll();
    const rows = [...document.querySelectorAll('#techList .entry')]
      .filter(row => row.querySelector('.en-desc').value.startsWith('[School Technique'));
    return {
      rank: Number(document.getElementById('f_rank').value),
      names: rows.map(row => row.querySelector('.en-name').value),
      references: rows.length === 5 && rows.every(row =>
        row.querySelector('.en-desc').value.includes('Imperial Histories') && Number(row.querySelector('.en-cost').value) === 0),
    };
  });
  check(id + '-RANK5-TECHNIQUES', { rank: advanced.rank, names: advanced.names }, { rank: 5, names: school.techniques });
  check(id + '-RANK5-REFERENCES', advanced.references);
}

async function checkSupplemental(page, scenario) {
  const id = 'DEP-' + scenario.id + '-SUP';
  const registration = await page.evaluate(ids => {
    const T = window.__L5R_TEST__;
    return { enabled: T.AS47.enabled(), registered: T.ADVANCED_SCHOOL_LIBRARY.filter(s => ids.includes(s.id)).map(s => s.id).sort() };
  }, SUPPLEMENTAL_IDS);
  check(id + '-REGISTRATION', registration, { enabled: scenario.supplemental, registered: scenario.supplemental ? SUPPLEMENTAL_IDS : [] });

  const result = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    T.resetToBaseline();
    T.MODES12.set('management');
    T.clearAllRows();
    const traits = ['stamina', 'willpower', 'agility', 'intelligence', 'reflexes', 'awareness', 'strength', 'perception'];
    for (const trait of traits) document.getElementById('trait_' + trait).value = 5;
    document.getElementById('ring_void').value = 5;
    document.getElementById('f_clan').value = 'Badger';
    document.getElementById('skillsBody').appendChild(T.makeSkillRow({ name: 'Kenjutsu', trait: 'Agility', rank: 5 }));
    for (const name of ['Multiple Schools', 'Paragon']) {
      const row = T.makeEntry({ name, cost: 0, desc: '' }, true);
      if (name === 'Paragon' && T.PARAGON_GATE_ENABLED) row.dataset.advConfig = JSON.stringify({type:'paragonTenet',revision:1,tenet:'Courage',value:'Courage'});
      document.getElementById('advList').appendChild(row);
    }
    T.saveSchoolsList([{ name: 'Hida Bushi', frozen: false, frozenRank: null, floorRank: 1, anchorInsightRank: 0 }]);
    document.getElementById('f_school').value = 'Hida Bushi';
    document.getElementById('f_insightBonus').value = 175 - 250 - 5;
    T.recalcAll();
    const offered = T.AS47.available().some(s => s.name === 'Minor Clan Defender');
    const entered = T.AS47.enter('Minor Clan Defender', { confirmations: [] });
    const record = T.AS47.record();
    const bonus = document.getElementById('f_insightBonus');
    bonus.value = Number(bonus.value) + 200 - Number(document.getElementById('f_insightPts').value);
    T.recalcAll();
    const techniques = [...document.querySelectorAll('#techList .entry')]
      .filter(row => row.querySelector('.en-desc').value.startsWith('[Advanced School Technique'))
      .map(row => row.querySelector('.en-name').value);
    return { offered, entered, school: record ? record.name : null, techniques };
  });
  check(id + '-ELIGIBILITY', result.offered, scenario.supplemental);
  check(id + '-ENROLLMENT', result.entered, scenario.supplemental);
  check(id + '-RECORD', result.school, scenario.supplemental ? 'Minor Clan Defender' : null);
  check(id + '-TECHNIQUE', result.techniques, scenario.supplemental ? ['Know No Boundaries'] : []);
}

(async () => {
  if (!process.argv[2]) throw new Error('Usage: node dependency-boundary-harness.js HTML_PATH');
  const original = fs.readFileSync(path.resolve(process.argv[2]), 'utf8');
  const variants = SCENARIOS.map(scenario => ({ scenario, html: htmlFor(original, scenario.off) }));
  const browser = await chromium.launch();
  try {
    for (const { scenario, html } of variants) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
      const page = await context.newPage();
      const errors = [];
      page.setDefaultTimeout(15000);
      page.on('pageerror', error => errors.push(String(error)));
      page.on('console', message => {
        if (message.type() === 'error' && !message.text().includes('net::')) errors.push(message.text());
      });
      const url = 'http://l5r-dependency-boundary.invalid/';
      await page.route('**/*', route => route.request().url() === url
        ? route.fulfill({ contentType: 'text/html', body: html }) : route.abort());
      try {
        await page.goto(url);
        await page.waitForFunction(() => window.__L5R_TEST__?.CL11?.ready && window.__L5R_CAROUSEL__?.isReady?.());
        const actualFlags = await page.evaluate(names => Object.fromEntries(names.map(name => [name, window.__L5R_TEST__[name]])), FLAGS);
        check('DEP-' + scenario.id + '-FLAGS', actualFlags, Object.fromEntries(FLAGS.map(flag => [flag, !scenario.off.includes(flag)])));
        for (const school of SCHOOLS) await checkManualSchool(page, scenario, school);
        await checkSupplemental(page, scenario);
      } catch (error) {
        check('DEP-' + scenario.id + '-EXECUTION', String(error), 'completed without exception');
      } finally {
        check('DEP-' + scenario.id + '-NO-PAGE-ERRORS', errors, []);
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
  const passed = results.filter(result => result.pass).length;
  console.log(`${passed}/${results.length} checks passed`);
  if (results.length !== EXPECTED_CHECKS) console.error(`Expected ${EXPECTED_CHECKS} checks; incomplete scenarios cannot pass.`);
  process.exitCode = results.length === EXPECTED_CHECKS && passed === EXPECTED_CHECKS ? 0 : 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
