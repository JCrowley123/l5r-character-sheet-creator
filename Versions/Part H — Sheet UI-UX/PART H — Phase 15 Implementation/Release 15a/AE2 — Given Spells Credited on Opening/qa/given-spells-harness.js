'use strict';
// Release 15a, unit AE2 (PART H PHASE 15.1.29): a School's given spells credited when a character is opened, with a
// note in the character check until the player saves (approved by the owner on 13 November 2026, revision 1).
//   node given-spells-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL.
// Oracles are independent of the unit: the saved character (collectData and the stored JSON in localStorage), the
// rows on the sheet, the character check's own lines, the review the player opens, a real Save, Save As New and
// Export JSON (the downloaded file). Characters: the older Kitsu test character, a copy of it without Summon, the
// same character with its given spells already credited, and a Matsu Bushi; all copies in this folder.
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./expected-checks.json');
const FX = n => path.join(__dirname, n + '.l5r.json');
const KITSU = 'Older Kitsu test character', SCHOOL = 'Kitsu Shugenja', GIVEN = ['Sense', 'Commune', 'Summon'];
const OTHERS = ['Reflective Pool', 'Reversal of Fortunes', 'Clarity of Purpose', 'Blessed Wind', 'Tempest of Air', "Jurojin's Balm"];
const NOTE_ALL = ['Kitsu Shugenja: Sense, Commune and Summon marked as your School’s spells',
  'Every Kitsu Shugenja is given these three, so there was nothing to choose. This note goes once you save the character.'];
const NOTE_MIXED = ['Kitsu Shugenja: Sense and Commune marked as your School’s spells; Summon added',
  'Every Kitsu Shugenja is given these three. Summon was missing, so it was added with its Spell Scroll. This note goes once you save the character.'];
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
const DEVICES = {PHONE: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}, DESKTOP: {viewport: {width: 1440, height: 1000}, acceptDownloads: true}};
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const goTab = async (page, tab) => { await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; if (C) { C.goToTab(l); await C.whenSettled(); } }, tab); await settle(page); };
const LISTED = 'c_ae2_listed';

async function open(browser, opts, seed) {
  const context = await browser.newContext(opts);
  await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
  if (seed) await context.addInitScript(([id, text, name]) => {
    if (localStorage.getItem('l5r-sheet:local:l5r-char:' + id)) return;
    localStorage.setItem('l5r-sheet:local:l5r-char:' + id, text);
    localStorage.setItem('l5r-sheet:local:l5r-char-index', JSON.stringify([{id, name, clan: 'Lion', updatedAt: 1}]));
  }, [LISTED, fs.readFileSync(seed, 'utf8'), KITSU]);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('dialog', d => d.accept().catch(() => {}));
  await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready);
  await page.waitForFunction(() => !document.getElementById('l5rSplash'));
  await page.evaluate(() => window.__L5R_TEST__.MODES12.set('management'));
  return {context, page, errors};
}
async function importFile(page, file, name) {
  await page.locator('#fileImport').setInputFiles(file);
  await page.waitForFunction(n => document.getElementById('f_name').value === n, name);
  await settle(page);
}
// The saved form of the open character, read as the sheet writes it.
const saved = page => page.evaluate(() => {
  const d = window.__L5R_TEST__.collectData(), rec = r => r.schoolChoice ? {school: r.schoolChoice.school, others: r.schoolChoice.otherSchools || [], created: r.schoolChoice.created} : null;
  return {note: d.givenSpellsNote || null,
    spells: d.tech.filter(t => t.spellElement).map(t => [t.name, rec(t)]),
    scrolls: d.equip.filter(e => /^Spell Scroll/.test(e.name)).map(e => [e.name.replace(/^Spell Scroll . /, ''), rec(e)])};
});
const lines = page => page.evaluate(() => [...document.querySelectorAll('#validationReport .vr-row')].map(r => ({
  rule: r.dataset.rule, title: (r.querySelector('strong') || {}).textContent || '', detail: (r.querySelector('.vr-detail') || {}).textContent || ''})));
const stored = (page, id) => page.evaluate(i => { const t = localStorage.getItem('l5r-sheet:local:l5r-char:' + i); return t ? JSON.parse(t) : null; }, id);

(async () => {
  const browser = await chromium.launch();
  try {
    // ---------- Phone ----------
    {
      const {context, page, errors} = await open(browser, DEVICES.PHONE, FX('kitsu-no-summon'));
      await check('GS-SEAM-PHONE', async () => {
        const s = await page.evaluate(() => { const T = window.__L5R_TEST__; return T.GS15 ? [T.GIVEN_SPELLS_ON_OPENING_ENABLED, T.GS15.installed] : null; });
        return [same(s, [true, true]), s];
      });
      await importFile(page, FX('kitsu-fixture'), KITSU);
      await goTab(page, 'Identity');
      const first = await saved(page);
      await check('GS-HELD-MARKED-PHONE', async () => {
        const want = {school: SCHOOL, others: [], created: false};
        const ok = GIVEN.every(n => { const s = first.spells.find(x => x[0] === n), c = first.scrolls.find(x => x[0] === n); return s && c && same(s[1], want) && same(c[1], want); });
        return [ok && first.spells.length === 9 && first.scrolls.length === 9, first];
      });
      await check('GS-OTHERS-UNTOUCHED-PHONE', async () => {
        const ok = OTHERS.every(n => { const s = first.spells.find(x => x[0] === n), c = first.scrolls.find(x => x[0] === n); return s && c && s[1] === null && c[1] === null; });
        return [ok, first];
      });
      await check('GS-NOTE-FIRST-PHONE', async () => {
        const l = await lines(page);
        return [l.length > 0 && same([l[0].rule, l[0].title, l[0].detail], ['given-spells-credited'].concat(NOTE_ALL)) && l.filter(x => x.rule === 'given-spells-credited').length === 1, l];
      });
      await check('GS-REVIEW-CHOICES-ONLY-PHONE', async () => {
        // The button's own click: on a phone the floating controls can sit over it (13 November, before any result was used).
        await page.evaluate(() => document.querySelector('#validationReport .sc8-open[data-kind="spell"]').click()); await settle(page);
        const g = await page.evaluate(() => [...document.querySelectorAll('#sc8Body fieldset')].map(f => [...f.querySelectorAll('input.oc8-spell')].map(i => i.value)));
        await page.evaluate(() => document.getElementById('sc8Done').click()); await settle(page);
        return [same(g, [['Reflective Pool', 'Reversal of Fortunes', 'Clarity of Purpose'], ['Blessed Wind', 'Tempest of Air'], ["Jurojin's Balm"]]), g];
      });
      // The copy without Summon: added with its scroll, both as created for the School.
      await importFile(page, FX('kitsu-no-summon'), KITSU);
      const mixed = await saved(page);
      await check('GS-MISSING-ADDED-PHONE', async () => {
        const s = mixed.spells.filter(x => x[0] === 'Summon'), c = mixed.scrolls.filter(x => x[0] === 'Summon'), l = await lines(page);
        const want = {school: SCHOOL, others: [], created: true};
        return [s.length === 1 && c.length === 1 && same(s[0][1], want) && same(c[0][1], want) && l.length > 0 &&
          same([l[0].title, l[0].detail], NOTE_MIXED) && same(mixed.note, [{school: SCHOOL, marked: ['Sense', 'Commune'], added: ['Summon']}]), {mixed, l}];
      });
      // Opening the same saved character again: the same note, nothing marked or added twice.
      await check('GS-REOPEN-NOTHING-TWICE-PHONE', async () => {
        await page.evaluate(() => { const T = window.__L5R_TEST__; T.applyData(T.collectData()); });
        await settle(page);
        const again = await saved(page), l = await lines(page);
        return [same(again, mixed) && l.filter(x => x.rule === 'given-spells-credited').length === 1 && same([l[0].title, l[0].detail], NOTE_MIXED), {again, l}];
      });
      // A listed character opened from the Characters list: an edit autosaves, and the note is kept with it.
      await page.evaluate(id => { document.getElementById('charSelect').value = id; document.getElementById('btnLoad').click(); }, LISTED);
      await page.waitForFunction(() => window.__L5R_TEST__.collectData().givenSpellsNote);
      await check('GS-LISTED-AUTOSAVE-KEEPS-NOTE-PHONE', async () => {
        const before = await stored(page, LISTED);
        await page.evaluate(() => { const n = document.getElementById('f_name'); n.value = n.value + ' II'; n.dispatchEvent(new Event('input', {bubbles: true})); });
        await page.evaluate(() => window.__L5R_TEST__.CL11.flush());
        const after = await stored(page, LISTED), l = await lines(page);
        return [!before.givenSpellsNote && after.fields.f_name === KITSU + ' II' && same(after.givenSpellsNote, [{school: SCHOOL, marked: ['Sense', 'Commune'], added: ['Summon']}]) &&
          l.length > 0 && l[0].rule === 'given-spells-credited', {beforeNote: before.givenSpellsNote, afterNote: after.givenSpellsNote, name: after.fields.f_name, l}];
      });
      await check('GS-SAVE-CLEARS-NOTE-PHONE', async () => {
        await page.evaluate(() => document.getElementById('btnSave').click());
        await page.waitForFunction(id => { const t = localStorage.getItem('l5r-sheet:local:l5r-char:' + id); return t && !JSON.parse(t).givenSpellsNote; }, LISTED, {timeout: 10000});
        await settle(page);
        const after = await stored(page, LISTED), l = await lines(page), now = await saved(page);
        const credited = GIVEN.every(n => { const s = now.spells.find(x => x[0] === n); return s && s[1] && s[1].school === SCHOOL; });
        return [!after.givenSpellsNote && !now.note && !l.some(x => x.rule === 'given-spells-credited') && credited, {stored: after.givenSpellsNote, l, now}];
      });
      await check('GS-NO-ERRORS-PHONE', async () => [errors.length === 0, errors]);
      await context.close();
    }
    // ---------- Desktop ----------
    {
      const {context, page, errors} = await open(browser, DEVICES.DESKTOP);
      await importFile(page, FX('kitsu-no-summon'), KITSU);
      let file = null;
      await check('GS-EXPORT-CLEARS-NOTE-DESKTOP', async () => {
        const before = await lines(page);
        const [download] = await Promise.all([page.waitForEvent('download'), page.evaluate(() => document.getElementById('btnExport').click())]);
        file = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
        await settle(page);
        const after = await lines(page), now = await saved(page);
        return [before.some(x => x.rule === 'given-spells-credited') && !after.some(x => x.rule === 'given-spells-credited') && !now.note, {before, after}];
      });
      await check('GS-EXPORTED-FILE-WITHOUT-NOTE-DESKTOP', async () => {
        const rec = n => (file.tech.find(t => t.name === n) || {}).schoolChoice || null;
        return [!!file && !('givenSpellsNote' in file) && GIVEN.every(n => rec(n) && rec(n).school === SCHOOL), file && Object.keys(file)];
      });
      await check('GS-SAVE-AS-CLEARS-NOTE-DESKTOP', async () => {
        await importFile(page, FX('kitsu-fixture'), KITSU);
        const before = await lines(page);
        const count = await page.evaluate(() => JSON.parse(localStorage.getItem('l5r-sheet:local:l5r-char-index') || '[]').length);
        await page.evaluate(() => document.getElementById('btnSaveAs').click());
        await page.waitForFunction(n => JSON.parse(localStorage.getItem('l5r-sheet:local:l5r-char-index') || '[]').length > n, count, {timeout: 10000});
        await settle(page);
        const list = await page.evaluate(() => JSON.parse(localStorage.getItem('l5r-sheet:local:l5r-char-index') || '[]'));
        const copy = await stored(page, list[list.length - 1].id), after = await lines(page);
        return [before.some(x => x.rule === 'given-spells-credited') && !after.some(x => x.rule === 'given-spells-credited') && !!copy && !copy.givenSpellsNote, {after, keys: copy && Object.keys(copy)}];
      });
      // Already credited: nothing to do, nothing to say.
      await check('GS-CREDITED-NOTHING-TO-SAY-DESKTOP', async () => {
        await importFile(page, FX('kitsu-credited'), KITSU);
        const l = await lines(page), now = await saved(page);
        return [!l.some(x => x.rule === 'given-spells-credited') && !now.note && now.spells.length === 9, {l, now}];
      });
      await check('GS-NOT-SHUGENJA-NOTHING-DESKTOP', async () => {
        await importFile(page, FX('matsu-fixture'), '7b.1 checks — Matsu');
        const l = await lines(page), now = await saved(page);
        return [!l.some(x => x.rule === 'given-spells-credited') && !now.note && now.spells.length === 0 && now.scrolls.length === 0, {l, now}];
      });
      await check('GS-NO-ERRORS-DESKTOP', async () => [errors.length === 0, errors]);
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
