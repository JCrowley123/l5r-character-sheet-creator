'use strict';
// Phase 4.5.42 Inheritance and the Printed Heirlooms (Cycle 5 Release 5c; 5c.1). node printed-heirlooms-harness.js <sheet.html>
// The owner's rulings of 23 October 2026: the four printed heirlooms leave the Advantages list and are added through
// Core Inheritance (5 points): a typed name containing one is recognised as it is typed, and Confirm makes the row that
// entry in its place; Water Hammer Armor then asks for its armor (cancelled: "Needs a choice"); Search keeps all four.
// The printed prices are written out here from the books: Kobune 10 (Strongholds of the Empire p.24), Water Hammer
// Armor 4 to 15 (p.107), Trained Falcon 2, Toritaka 1 (Enemies of the Empire p.10).
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const TOTAL = 13;
const PRINTED = ['Inheritance: Kobune', 'Inheritance: Asahina Blade', 'Inheritance: Trained Falcon', 'Inheritance: Water Hammer Armor'];
const LINE = 'Added through Inheritance: in Advantages, add Inheritance and name this heirloom; Confirm makes the row this entry.';
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
  H.add = (name) => { const s = document.getElementById('advQuickAdd'); s.value = name; s.dispatchEvent(new Event('change')); };
  H.entry = (name) => Array.from(document.querySelectorAll('#advList .entry')).find(d => d.querySelector('.en-name').value === name) || null;
  // Types the heirloom's name into Inheritance's open dialog, as a player does; returns the dialog's note.
  H.type = (item) => { const i = document.getElementById('named4513Item'); if (!i) return null; i.value = item;
    i.dispatchEvent(new Event('input', {bubbles: true})); return document.getElementById('advConfigNote').textContent; };
  H.confirm = () => document.getElementById('advConfigConfirm').click();
  H.inheritance = (item) => { H.add('Inheritance'); const note = H.type(item); H.confirm(); return note; };
  H.rows = () => Array.from(document.querySelectorAll('#advList .entry')).map(d => [d.querySelector('.en-name').value, Number(d.querySelector('.en-cost').value)]);
  H.fresh = () => { T.resetToBaseline(); T.MODES12?.set('management'); T.clearAllRows?.(); };
  H.marks = () => document.querySelectorAll('#advList .inh4542-note, #advList .inh4542-switch').length;
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
    check('S442-LEAVE-THE-LIST', await ev((H, T, printed) => {
      const values = Array.from(document.getElementById('advQuickAdd').options).map(o => o.value);
      return [printed.filter(n => values.includes(n)), values.includes('Inheritance'), printed.filter(n => T.ADV_LIBRARY.some(e => e.name === n)).length];
    }, PRINTED), [[], true, 4]);
    check('S442-LEAVE-THE-WIZARD-LIST', await ev((H, T, printed) => {
      const body = document.createElement('div'); T.CW1121.advStep.render(body);
      const values = Array.from(body.querySelectorAll('#cw1121AdvPick option')).map(o => o.value);
      return [printed.filter(n => values.includes(n)), values.includes('Inheritance')];
    }, PRINTED), [[], true]);
    check('S442-NOTE-AS-TYPED', await ev((H, T) => {
      H.fresh(); H.add('Inheritance');
      const notes = [H.type('The family kobune'), /^Reminder only/.test(H.type('Grandfather’s war fan')), H.type('Water Hammer ARMOUR')];
      T.closeAdvConfigModal();
      return notes;
    }), ['Kobune is printed as its own entry: 10 points. Confirm uses it.', true,
      'Water Hammer Armor is printed as its own entry: 4 to 15 points. Confirm uses it, then asks which armor.']);
    check('S442-CONFIRM-BECOMES-THE-ENTRY-IN-PLACE', await ev((H, T) => {
      H.add('Absolute Direction'); T.closeAdvConfigModal();
      H.entry('Inheritance').querySelector('.adv-config-btn').click();
      H.type('The family kobune'); H.confirm();
      return [H.open(), H.rows(), document.getElementById('statusMsg').textContent];
    }), [false, [['Inheritance: Kobune', 10], ['Absolute Direction', 1]], 'Inheritance: Kobune added in place of Inheritance.']);
    check('S442-OTHER-HEIRLOOM-STAYS', await ev(H => {
      const note = H.inheritance('Grandfather’s war fan'), d = document.querySelector('#advList .entry:last-child');
      return [/^Reminder only/.test(note), H.rows().at(-1), d.textContent.includes('Grandfather’s war fan — reminder only'), H.marks()];
    }), [true, ['Inheritance', 5], true, 0]);
    check('S442-FALCON-PRICED-BY-ITS-RULES', await ev(H => {
      H.fresh(); document.getElementById('f_clan').value = 'Falcon'; document.getElementById('f_family').value = 'Toritaka';
      const note = H.inheritance('a trained falcon'); return [note, H.rows()];
    }), ['Trained Falcon is printed as its own entry: 1 point. Confirm uses it.', [['Inheritance: Trained Falcon', 1]]]);
    check('S442-ARMOR-OPENS-ITS-PICKER', await ev(H => {
      H.fresh(); H.inheritance('Water Hammer armour');
      return [H.open(), document.getElementById('advConfigTitle').textContent, H.rows().map(r => r[0])];
    }), [true, 'Choose the armor', ['Inheritance: Water Hammer Armor']]);
    check('S442-ARMOR-CANCELLED-NEEDS-A-CHOICE', await ev((H, T) => {
      T.closeAdvConfigModal(); T.recalcAll();
      const d = H.entry('Inheritance: Water Hammer Armor');
      return [H.open(), H.rows(), /Needs a choice/.test(d.textContent), T.readAdvConfig(d)];
    }), [false, [['Inheritance: Water Hammer Armor', 0]], true, null]);
    check('S442-SEARCH-KEEPS-ALL-FOUR', await ev((H, T, [printed, line]) => {
      const S = T.SEARCH14, slug = n => 'advantages:' + S.normalise(n).replace(/ /g, '-');
      return [printed.map(n => [S.query({text: n, category: 'advantages'}).results.some(r => r.name === n), (S.get(slug(n)) || {text: []}).text.at(-1) === line]),
        (S.get('advantages:inheritance') || {text: []}).text.includes(line)];
    }, [PRINTED, LINE]), [PRINTED.map(() => [true, true]), false]);
    // A Release 5c character with an Inheritance named like a printed heirloom: nothing changes on opening; the dialog says so.
    check('S442-OLD-INHERITANCE-ROW-QUIET', await ev((H, T) => {
      H.fresh();
      const data = JSON.parse(JSON.stringify(T.collectData()));
      data.adv = [{name: 'Inheritance', cost: 5, desc: '', config: {type: 'itemPick', revision: 1, itemName: 'Kobune', value: 'Kobune — reminder only'}}];
      T.applyData(data); T.recalcAll();
      const rows = H.rows(), marks = H.marks();
      H.entry('Inheritance').querySelector('.adv-config-btn').click();
      const note = document.getElementById('advConfigNote').textContent;
      T.closeAdvConfigModal();
      return [rows, marks, note, H.rows()];
    }), [[['Inheritance', 5]], 0, 'Kobune is printed as its own entry: 10 points. Confirm uses it.', [['Inheritance', 5]]]);
    check('S442-SAVED-HEIRLOOMS-OPEN', await ev((H, T) => {
      H.fresh();
      const data = JSON.parse(JSON.stringify(T.collectData()));
      data.adv = [{name: 'Inheritance: Kobune', cost: 10, desc: ''},
        {name: 'Inheritance: Water Hammer Armor', cost: 12, desc: '', config: {type: 'severityTier', value: 'Heavy armor'}}];
      T.applyData(data); T.recalcAll();
      return H.rows();
    }), [['Inheritance: Kobune', 10], ['Inheritance: Water Hammer Armor', 12]]);
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
