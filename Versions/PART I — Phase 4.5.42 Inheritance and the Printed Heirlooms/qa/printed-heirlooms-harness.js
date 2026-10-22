'use strict';
// Phase 4.5.42 Inheritance and the Printed Heirlooms (Cycle 5 Release 5c). node printed-heirlooms-harness.js <sheet.html>
// Core Inheritance (5 points) named like a printed heirloom points to it and offers a switch (owner's ruling 5).
// The printed prices are written out here from the books: Kobune 10 (Strongholds p.24), Water Hammer Armor 4-15 (p.107).
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const TOTAL = 6;
const results = [];
function check(id, actual, want = true) {
  if (results.some(x => x.id === id)) throw Error('Duplicate check: ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(want);
  results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + String(JSON.stringify(actual)).slice(0, 400) +
    ' want=' + String(JSON.stringify(want)).slice(0, 200)));
}

function installHelpers() {
  const T = window.__L5R_TEST__;
  const H = window.H442 = {};
  H.safe = f => { try { return f(); } catch (e) { return 'error: ' + String(e.message || e).slice(0, 120); } };
  H.open = () => getComputedStyle(document.getElementById('advConfigModalOverlay')).display !== 'none';
  H.inheritance = (item) => { const s = document.getElementById('advQuickAdd'); s.value = 'Inheritance'; s.dispatchEvent(new Event('change'));
    const i = document.getElementById('named4513Item'); if (i) i.value = item; T.confirmAdvConfigModal();
    return document.querySelector('#advList .entry:last-child'); };
  H.note = (d) => { const n = d && d.querySelector('.inh4542-note'), b = d && d.querySelector('.inh4542-switch');
    return [n ? n.textContent : null, b ? b.textContent : null]; };
  H.rows = () => Array.from(document.querySelectorAll('#advList .entry')).map(d => [d.querySelector('.en-name').value, Number(d.querySelector('.en-cost').value)]);
}

async function main() {
  if (!process.argv[2]) throw Error('Pass the built HTML path');
  const browser = await chromium.launch();
  const errors = [];
  try {
    const page = await browser.newPage({viewport: {width: 1280, height: 900}});
    page.setDefaultTimeout(8000);
    page.on('pageerror', e => errors.push(String(e)));
    page.on('dialog', d => d.dismiss().catch(() => {}));
    await page.route('https://fonts.googleapis.com/**', r => r.abort());
    await page.route('https://fonts.gstatic.com/**', r => r.abort());
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);
    await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_CAROUSEL__?.isReady?.() &&
      (!window.__L5R_TEST__.CL11 || window.__L5R_TEST__.CL11.ready), null, {timeout: 60000});
    await page.evaluate(() => window.__L5R_TEST__.CL11?.close?.());
    await page.evaluate(installHelpers);
    await page.evaluate(() => { const T = window.__L5R_TEST__; T.resetToBaseline(); T.MODES12?.set('management'); T.clearAllRows?.(); });
    const ev = (f, arg) => page.evaluate(([f, arg]) => window.H442.safe(() => (0, eval)('(' + f + ')')(window.H442, window.__L5R_TEST__, arg)), [String(f), arg]);

    check('S442-SWITCH', await ev((H, T) => T.INHERITANCE_PRINTED_HEIRLOOMS_ENABLED === true && !!T.INH4542));
    check('S442-KOBUNE-NOTED-NOTHING-CHANGED', await ev(H => { const d = H.inheritance('The family kobune'); return [H.note(d), H.rows()]; }),
      [['Printed as its own entry: Inheritance: Kobune, 10 points (Strongholds of the Empire p.24).', 'Use Inheritance: Kobune'], [['Inheritance', 5]]]);
    check('S442-OTHER-HEIRLOOM-NOT-NOTED', await ev(H => H.note(H.inheritance('Grandfather’s war fan'))), [null, null]);
    check('S442-SWITCH-REPLACES', await ev(H => {
      const b = document.querySelector('#advList .inh4542-switch'); if (b) b.click();
      return H.rows();
    }), [['Inheritance', 5], ['Inheritance: Kobune', 10]]);
    check('S442-ARMOUR-SPELLING-AND-CHOICE', await ev(H => {
      const d = H.inheritance('Water Hammer armour');
      const noted = H.note(d)[1];
      const b = d.querySelector('.inh4542-switch'); if (b) b.click();
      return [noted, H.open(), document.getElementById('advConfigTitle').textContent, H.rows().map(r => r[0])];
    }), ['Use Inheritance: Water Hammer Armor', true, 'Choose the armor', ['Inheritance', 'Inheritance: Kobune', 'Inheritance: Water Hammer Armor']]);
    check('S442-NO-PAGE-ERRORS', errors, []);
  } finally {
    await browser.close();
  }
  const passed = results.filter(r => r.pass).length;
  if (results.length !== TOTAL) console.log('FAIL check count ' + results.length + ' expected ' + TOTAL);
  console.log(`\n${passed}/${TOTAL} checks passed`);
  process.exit(passed === TOTAL && results.length === TOTAL ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
