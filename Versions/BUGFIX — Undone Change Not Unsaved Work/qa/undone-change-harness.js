'use strict';
// Undone Change Not Unsaved Work (Release 8a; the audit log's finding 4 from the 7c review). node undone-change-harness.js <sheet.html>
// One saved character (the Crab test character) is in storage before the page loads, so the sheet starts unsaved and the
// Characters screen opens over it, as on a device. Each scenario in a fresh context.
const {chromium} = require('playwright'), path = require('path'), fs = require('fs');
const SHEET = path.resolve(process.argv[2]);
const CRAB = fs.readFileSync(path.join(__dirname, '7b1-checks-crab.l5r.json'), 'utf8');
const ID = 'c_8a_crab', NAME = JSON.parse(CRAB).fields.f_name;
const TOTAL = 6, results = [];
function check(id, got, want) {
  if (results.some(r => r.id === id)) throw Error('Duplicate check ' + id);
  const ok = JSON.stringify(got) === JSON.stringify(want);
  results.push({id, ok});
  console.log((ok ? 'PASS ' : 'FAIL ') + id + (ok ? '' : ' actual=' + String(JSON.stringify(got)).slice(0, 600) + ' expected=' + String(JSON.stringify(want)).slice(0, 400)));
}
async function scenario(name, body) {
  try { await body(); }
  catch (e) { check('AU-SCENARIO-RAN-' + name.toUpperCase(), String(e.message || e).split('\n')[0], null); }
}
async function fresh(browser) {
  const context = await browser.newContext({viewport: {width: 390, height: 844}});
  await context.addInitScript(([id, name, text]) => {
    if (localStorage.getItem('l5r-sheet:local:l5r-char-index')) return;
    localStorage.setItem('l5r-sheet:local:l5r-char:' + id, text);
    localStorage.setItem('l5r-sheet:local:l5r-char-index', JSON.stringify([{id, name, clan: 'Crab', updatedAt: 1}]));
  }, [ID, NAME, CRAB]);
  const page = await context.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(String(e)));
  await page.goto('file://' + SHEET);
  await page.waitForFunction(() => { const T = window.__L5R_TEST__; return T && T.CL11 && T.CL11.ready && !document.querySelector('[id^=l5r-splash]'); }, null, {timeout: 60000});
  // The sheet behind the screen is unsaved; the audit log's first look sets its starting point.
  await page.evaluate(() => { const T = window.__L5R_TEST__; T.CL11.close(); T.AL71.check(); });
  return {context, page};
}
// Types into a field as the sheet sees it, then looks; returns what the look added, as text.
const edit = (p, id, value) => p.evaluate(([i, v]) => { const T = window.__L5R_TEST__, el = document.getElementById(i); el.value = v;
  el.dispatchEvent(new Event('input', {bubbles: true})); el.dispatchEvent(new Event('change', {bubbles: true})); T.recalcAll();
  return T.AL71.check().map(e => T.AL71Logic.text(e)); }, [id, value]);
// Open the stored character from the Characters screen; returns 'asked' if the discard question comes, else 'opened'.
async function openOther(page) {
  await page.evaluate(() => document.getElementById('cl11Toolbar').click());
  await page.waitForFunction(() => !document.getElementById('cl11View').hidden, null, {timeout: 60000});
  await page.click(`.cl11-row[data-id="${ID}"] .cl11-open`);
  // The event itself: the question, or the character on the sheet (a long ceiling ends only a hung run).
  await page.waitForFunction((n) => document.getElementById('appConfirmOverlay').style.display === 'flex' ||
    document.getElementById('f_name').value === n, NAME, {timeout: 60000});
  return page.evaluate(() => document.getElementById('appConfirmOverlay').style.display === 'flex' ? 'asked' : 'opened');
}

(async () => {
  const browser = await chromium.launch();
  try {
    await scenario('undone', async () => {
      const {page} = await fresh(browser);
      check('AU-ENABLED', await page.evaluate(() => { const T = window.__L5R_TEST__; return !!T.AU8 && T.AU8.enabled(); }), true);
      const was = await page.evaluate(() => document.getElementById('f_taint').value);
      const a = await edit(page, 'f_taint', String(Number(was) + 1)), b = await edit(page, 'f_taint', was);
      check('AU-HISTORY-KEPT', [a, b, await page.evaluate(() => window.__L5R_TEST__.AL71.entries().length)],
        [['Taint: ' + was + ' → ' + (Number(was) + 1)], ['Taint: ' + (Number(was) + 1) + ' → ' + was], 2]);
      // The finding: opening another character asked whether to discard this unchanged sheet.
      check('AU-UNDONE-NO-QUESTION', [await openOther(page), await page.evaluate(() => document.getElementById('f_name').value)], ['opened', NAME]);
      check('AU-NO-ERRORS', page.errors, []);
    });
    await scenario('changed', async () => {
      const {page} = await fresh(browser);
      const was = await page.evaluate(() => document.getElementById('f_taint').value);
      await edit(page, 'f_taint', String(Number(was) + 1));
      const asked = await openOther(page);
      if (asked === 'asked') {
        await page.click('#appConfirmCancel');
        await page.waitForFunction(() => document.getElementById('appConfirmOverlay').style.display !== 'flex', null, {timeout: 60000});
      }
      check('AU-CHANGE-STILL-ASKS', [asked, await page.evaluate(() => [document.getElementById('f_name').value, document.getElementById('f_taint').value])],
        ['asked', ['', String(Number(was) + 1)]]);
    });
    await scenario('logic', async () => {
      const {page} = await fresh(browser);
      check('AU-LOGIC', await page.evaluate(() => { const L = window.__L5R_TEST__.AU8Logic; if (!L) return null;
        return [L.withoutHistory('{"a":1,"auditLog":[{"at":"x"}],"b":2}'), L.withoutHistory('{"a":1}'), L.withoutHistory('not json'), L.withoutHistory('null')]; }),
        ['{"a":1,"b":2}', '{"a":1}', 'not json', 'null']);
    });
  } finally {
    await browser.close();
  }
  const n = results.filter(r => r.ok).length;
  console.log(n + '/' + results.length + ' checks passed');
  process.exitCode = n === TOTAL && results.length === TOTAL ? 0 : 1;
})().catch((e) => { console.error(e); process.exitCode = 1; });
