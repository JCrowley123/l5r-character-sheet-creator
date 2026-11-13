'use strict';
// Release 15a, unit AE1 (PART H PHASE 15.1.28): Yogo Wardmaster's given spells include Sense, and five Schools' book
// pages (approved by the owner on 13 November 2026).   node yogo-given-spells-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL.
// Oracles are independent of the unit: the book lines and pages are typed here from the book check of 11 November and
// the owner's PDFs (13 November), the other Schools' sources from Phase 11.2.4's own harness; the wizard is driven with
// real clicks to a new Yogo Wardmaster and its result read from the sheet's rows (Techniques and Equipment).
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./expected-checks.json');
const sheet = path.resolve(process.argv[2]);
const seen = {};
const set = (id, ok, detail) => {
  seen[id] = ok === true && seen[id] !== false;
  if (ok !== true) console.log('  detail ' + id + ': ' + JSON.stringify(detail === undefined ? ok : detail).slice(0, 900));
};
async function check(id, body) {
  try { const [ok, detail] = await body(); set(id, ok, detail); }
  catch (e) { set(id, false, 'exception: ' + String(e && e.message || e).slice(0, 500)); }
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const DEVICES = {PHONE: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}, DESKTOP: {viewport: {width: 1440, height: 1000}}};
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const YOGO = 'Yogo Wardmaster [Shugenja]';
const SCC = ['Sense', 'Commune', 'Summon'];
const PAGES = {
  'Fuzake Shugenja': 'Secrets of the Empire p.238',
  'Horiuchi Shugenja': 'The Great Clans p.257–258',
  'Ninube Shugenja': 'The Great Clans p.281',
  'Yogo Wardmaster [Shugenja]': 'The Great Clans p.229',
  'Yoritomo Shugenja': 'The Great Clans p.169',
};
// The other Schools as Phase 11.2.4 recorded them: [source, given]. Kitsu is Phase 11.2.3's own table.
const OTHERS = {
  'Agasha Shugenja': ['Core Rulebook p.125', SCC], 'Asahina Shugenja': ['Core Rulebook p.110', SCC],
  'Chuda Shugenja': ['Core Rulebook p.213', SCC], 'Chuda Shugenja [Snake]': ['Core Rulebook p.224', SCC],
  'Isawa Shugenja': ['Core Rulebook p.124', SCC], 'Iuchi Shugenja': ['Core Rulebook p.130', SCC],
  'Kitsune Shugenja': ['Core Rulebook p.219', SCC], 'Komori Shugenja': ['Core Rulebook p.216', SCC],
  'Kuni Shugenja': ['Core Rulebook p.107', SCC], 'Moshi Shugenja': ['Core Rulebook p.120', SCC],
  'Moto Death Priest [Shugenja]': ['Imperial Histories p.240', SCC], 'Seppun Shugenja': ['Core Rulebook p.228', SCC],
  'Soshi Shugenja': ['Core Rulebook p.127', SCC], 'Tamori Shugenja': ['Core Rulebook p.113', SCC],
  'Tonbo Shugenja': ['Core Rulebook p.218', SCC],
};
const GIVEN_OF_FIVE = {'Fuzake Shugenja': SCC.concat(['Path to Inner Peace']), 'Horiuchi Shugenja': SCC, 'Ninube Shugenja': SCC, 'Yoritomo Shugenja': SCC};

// The wizard, from the Characters screen to the chosen School's Spells step (Phase 11.2.4's own route).
const title = page => page.evaluate(() => document.getElementById('cw112Title').textContent);
async function next(page) { await page.waitForFunction(() => !document.getElementById('cw112Next').disabled); await page.click('#cw112Next'); }
async function toStep(page, wanted) { for (let i = 0; i < 12 && (await title(page)) !== wanted; i++) await next(page); }
async function pick(page, text) {
  await page.locator('#cw112Body .cw112-card').filter({has: page.locator('.cw112-card-title', {hasText: new RegExp('^' + text.replace(/[[\]()]/g, '\\$&') + '$')})}).first().click();
}
async function toYogoSpells(page) {
  await page.evaluate(() => document.getElementById('cl11Toolbar').click());
  await page.click('#cl11Create');
  await page.waitForFunction(() => !document.getElementById('cw112View').hidden);
  await page.fill('#cw112Name', 'Test');
  await next(page); await pick(page, 'Scorpion'); await next(page); await pick(page, 'Yogo'); await next(page); await pick(page, YOGO);
  await page.waitForFunction(s => window.__L5R_TEST__.CW112.appliedSchool() === s && !window.__L5R_TEST__.CW112.busy, YOGO);
  await toStep(page, 'Spells'); await settle(page);
}
const rows = page => page.evaluate(() => ({
  learned: [...document.querySelectorAll('#techList .entry')].filter(d => d.dataset.spellElement).map(d => d.querySelector('.en-name').value),
  scrolls: [...document.querySelectorAll('#equipBody .eq-name')].map(n => n.value).filter(v => /^Spell Scroll/.test(v)).map(v => v.replace(/^Spell Scroll . /, '')),
}));

async function open(browser, opts) {
  const context = await browser.newContext(opts);
  await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('dialog', d => d.accept().catch(() => {}));
  await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready && window.__L5R_TEST__.CW1124);
  await page.waitForFunction(() => !document.getElementById('l5rSplash'));
  return {context, page, errors};
}

(async () => {
  const browser = await chromium.launch();
  try {
    for (const [D, opts] of Object.entries(DEVICES)) {
      const {context, page, errors} = await open(browser, opts);
      if (D === 'PHONE') {
        await check('YG-SEAM-PHONE', async () => {
          const s = await page.evaluate(() => { const T = window.__L5R_TEST__;
            return T.YG15 ? [T.YOGO_GIVEN_SPELLS_ENABLED, T.YG15.installed, T.YG15.corrected.slice().sort()] : null; });
          return [same(s, [true, true, Object.keys(PAGES).sort()]), s];
        });
        const read = name => page.evaluate(n => { const C = window.__L5R_TEST__.CW1123, d = C.forSchool(n);
          return d && {source: d.source, given: d.given, line: C.describe(d), slots: d.slots || null}; }, name);
        await check('YG-YOGO-GIVEN-PHONE', async () => { const d = await read(YOGO); return [same(d.given, SCC), d.given]; });
        await check('YG-YOGO-LINE-PHONE', async () => {
          const d = await read(YOGO);
          return [d.source === 'The Great Clans p.229' && d.line === 'Sense, Commune, Summon, 3 Ward spells, 3 other spells that are not Void spells', d];
        });
        await check('YG-FIVE-PAGES-PHONE', async () => {
          const got = {}; for (const n of Object.keys(PAGES)) { const d = await read(n); got[n] = d && [d.source, d.given]; }
          const want = {}; for (const n of Object.keys(PAGES)) want[n] = [PAGES[n], n === YOGO ? SCC : GIVEN_OF_FIVE[n]];
          return [same(got, want), got];
        });
        await check('YG-OTHER-SCHOOLS-UNCHANGED-PHONE', async () => {
          const got = {}; for (const n of Object.keys(OTHERS)) { const d = await read(n); got[n] = d && [d.source, d.given]; }
          const kitsu = await read('Kitsu Shugenja');
          const keys = await page.evaluate(() => Object.keys(window.__L5R_TEST__.CW1124.table).sort());
          return [same(got, OTHERS) && !!kitsu && same(kitsu.given, SCC) && same(keys, Object.keys(OTHERS).concat(Object.keys(PAGES)).sort()), {got, kitsu, keys}];
        });
        await check('YG-YOGO-BOXES-UNCHANGED-PHONE', async () => {
          const d = await read(YOGO);
          return [same(d.slots, [{want: 3, ward: true, label: 'Ward spells', noun: ['Ward spell', 'Ward spells']},
            {want: 3, notElements: ['Void'], label: 'Other spells, not Void', noun: ['other spell (not Void)', 'other spells (not Void)']}]), d.slots];
        });
      }
      await toYogoSpells(page);
      await check('YG-WIZARD-ADDS-SENSE-' + D, async () => {
        const r = await rows(page);
        return [same(r.learned.slice().sort(), SCC.slice().sort()) && same(r.scrolls.slice().sort(), SCC.slice().sort()), r];
      });
      if (D === 'PHONE') {
        await check('YG-WIZARD-SAYS-SO-PHONE', async () => {
          const s = await page.evaluate(() => ({
            note: ([...document.querySelectorAll('#cw112Body p.cw112-note')].find(n => / starts with /.test(n.textContent)) || {}).textContent || '',
            given: (document.querySelector('.cw1123-given .cw112-done') || {}).textContent || ''}));
          return [s.given === 'Sense, Commune, Summon.' && s.note.includes('starts with Sense, Commune, Summon, 3 Ward spells') && s.note.includes('(The Great Clans p.229)'), s];
        });
        await check('YG-WIZARD-WARD-BOXES-PHONE', async () => {
          const l = await page.evaluate(() => [...document.querySelectorAll('.cw1124-slot .cw1121-slot-label')].map(p => p.textContent));
          return [same(l, ['Ward spells: choose 3 · 0 chosen', 'Other spells, not Void: choose 3 · 0 chosen']), l];
        });
        // A Yogo Wardmaster without Sense (made before this unit): the character check names it as given by the School.
        await check('YG-CHECK-ASKS-FOR-SENSE-PHONE', async () => {
          const r = await page.evaluate(() => { const T = window.__L5R_TEST__;
            const row = [...document.querySelectorAll('#techList .entry')].find(d => d.dataset.spellElement && d.querySelector('.en-name').value === 'Sense');
            if (!row) return {removed: false};
            T.CW1122.removeSpell(row);
            const f = T.CW1123.rule().find(x => /Yogo Wardmaster/.test(x.title || ''));
            return {removed: true, left: [...document.querySelectorAll('#techList .entry')].filter(d => d.dataset.spellElement).map(d => d.querySelector('.en-name').value), detail: f && f.detail};
          });
          return [r.removed && !r.left.includes('Sense') && !!r.detail && r.detail.includes('Sense (given by your School)'), r];
        });
      }
      await check('YG-NO-ERRORS-' + D, async () => [errors.length === 0, errors]);
      await context.close();
    }
  } finally {
    await browser.close();
  }
  let passed = 0;
  for (const id of pins.checks) {
    const ok = seen[id] === true;
    if (ok) passed++;
    console.log((ok ? 'PASS ' : 'FAIL ') + id + (id in seen ? '' : ' (never ran)'));
  }
  const extra = Object.keys(seen).filter(id => !pins.checks.includes(id));
  for (const id of extra) console.log('FAIL ' + id + ' (not pinned)');
  const total = pins.checks.length + extra.length;
  console.log(`${passed}/${total} checks passed`);
  process.exit(passed === total ? 0 : 1);
})().catch(e => { console.error(e); console.log(`0/${pins.checks.length} checks passed`); process.exit(1); });
