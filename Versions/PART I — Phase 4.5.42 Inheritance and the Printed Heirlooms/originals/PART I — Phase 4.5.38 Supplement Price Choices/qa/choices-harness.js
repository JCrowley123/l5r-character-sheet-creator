'use strict';
// Phase 4.5.38 Supplement Price Choices (Cycle 5 Release 5b). Six of Phase 4.5.37's entries ask for their choice when
// added; the pick sets the row's cost and is saved with it. node choices-harness.js <sheet.html>
// The choices are written out here from the books, not read from the layer, so every check can fail on main.
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const TOTAL = 18;
const results = [];
function check(id, actual, want = true) {
  if (results.some(x => x.id === id)) throw Error('Duplicate check: ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(want);
  results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + String(JSON.stringify(actual)).slice(0, 400) +
    ' want=' + String(JSON.stringify(want)).slice(0, 200)));
}
async function section(id, run) { try { await run(); } catch (e) { check(id + '-EXCEPTION', String(e.stack).slice(0, 300), 'no exception'); } }

// [check key, list, entry, [[option, XP], ...], the option the test picks]
const CHOICES = [
  ['ARMOR', 'adv', 'Inheritance: Water Hammer Armor', [['Ashigaru armor', 4], ['Light armor', 7], ['Heavy armor', 12], ['Riding armor', 15]], 2],
  ['NAGA', 'adv', 'Naga Ancestry', [['No visible signs', 7], ['Visible signs', 5]], 1],
  ['SLEEPER', 'disadv', 'Sleeper Agent', [['No fail-safe', 5], ['With a fail-safe', 8]], 1],
  ['COURT', 'disadv', 'The Chrysanthemum Court', [['Hantei XVI', 5], ['Another era', 3]], 1],
  ['CLEAR-WATER', 'disadv', 'Clear Water Stigma', [['All your Outfit’s koku', 2], ['One Outfit weapon', 2]], 1],
  ['BOUNTY', 'disadv', 'Bounty', [['Minor offence', 2], ['Serious offence', 4], ['Violent or heinous', 6]], 2],
];

// Adds `name` from its quick-add list; returns whether the choice dialog opened and what it offers.
const addFromList = (page, list, name) => page.evaluate(([list, name]) => {
  const s = document.getElementById(list === 'adv' ? 'advQuickAdd' : 'disadvQuickAdd');
  s.value = name; s.dispatchEvent(new Event('change'));
  const open = getComputedStyle(document.getElementById('advConfigModalOverlay')).display !== 'none';
  const offered = Array.from(document.querySelectorAll('#advConfigGrid .affinity-pick-item')).map(i =>
    [i.dataset.value, Number((i.querySelector('.adv-config-cost') || {textContent: 'NaN'}).textContent.replace(/\D+/g, ''))]);
  return {open, offered};
}, [list, name]);
// Picks option `index` in the open dialog and confirms; returns the row's name, cost and saved choice.
const pick = (page, list, index) => page.evaluate(([list, index]) => {
  const T = window.__L5R_TEST__;
  const box = document.querySelectorAll('#advConfigGrid .affinity-pick-item input[type="checkbox"]')[index];
  if (box) box.click();
  document.getElementById('advConfigConfirm').click();
  const div = document.querySelector('#' + (list === 'adv' ? 'advList' : 'disadvList') + ' .entry:last-child');
  const config = div && T.readAdvConfig(div);
  return div ? [div.querySelector('.en-name').value, Number(div.querySelector('.en-cost').value), config ? config.value : null] : null;
}, [list, index]);

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
    await page.evaluate(() => { const T = window.__L5R_TEST__; T.resetToBaseline(); T.MODES12?.set('management'); T.clearAllRows?.(); });

    check('C438-SWITCH', await page.evaluate(() => window.__L5R_TEST__.SUPPLEMENT_CHOICES_ENABLED === true && !!window.__L5R_TEST__.SUPP4538));

    for (const [key, list, name, options, chosen] of CHOICES) {
      await section('C438-' + key, async () => {
        const asked = await addFromList(page, list, name);
        check('C438-' + key + '-ASKS', [asked.open, asked.offered], [true, options]);
        check('C438-' + key + '-PRICE', await pick(page, list, chosen), [name, options[chosen][1], options[chosen][0]]);
      });
    }

    await section('C438-MORE', async () => {
      // Cancelled: the row stays, flagged "Needs a choice" and counting nothing, as Phase 4.5's tier entries do.
      const cancelled = await page.evaluate(() => {
        const T = window.__L5R_TEST__;
        const s = document.getElementById('disadvQuickAdd'); s.value = 'Bounty'; s.dispatchEvent(new Event('change'));
        T.closeAdvConfigModal();
        T.recalcAll();
        const div = document.querySelector('#disadvList .entry:last-child');
        if (!div) return null;
        return [div.querySelector('.en-name').value, Number(div.querySelector('.en-cost').value), /Needs a choice/.test(div.textContent)];
      });
      check('C438-CANCELLED-NEEDS-A-CHOICE', cancelled, ['Bounty', 0, true]);
      // Choosing again replaces the price: one number, never added twice.
      const again = await page.evaluate(() => {
        const T = window.__L5R_TEST__;
        const div = Array.from(document.querySelectorAll('#advList .entry')).find(d => d.querySelector('.en-name').value === 'Naga Ancestry');
        if (!div) return null;
        T.openAdvConfigModal(div);
        const box = document.querySelectorAll('#advConfigGrid .affinity-pick-item input[type="checkbox"]')[0];
        if (box) box.click();
        T.confirmAdvConfigModal();
        const c = T.readAdvConfig(div);
        return [Number(div.querySelector('.en-cost').value), c ? c.value : null];
      });
      check('C438-CHOOSING-AGAIN-REPLACES', again, [7, 'No visible signs']);
      // Saved and opened again: each row keeps its choice and its price.
      const back = await page.evaluate(() => {
        const T = window.__L5R_TEST__;
        const data = JSON.parse(JSON.stringify(T.collectData()));
        T.resetToBaseline(); T.clearAllRows?.();
        T.applyData(data);
        T.recalcAll();
        return Array.from(document.querySelectorAll('#advList .entry, #disadvList .entry')).map(d => {
          const c = T.readAdvConfig(d);
          return [d.querySelector('.en-name').value, Number(d.querySelector('.en-cost').value), c ? c.value : null];
        });
      });
      check('C438-SAVED-AND-OPENED', back, [
        ['Inheritance: Water Hammer Armor', 12, 'Heavy armor'], ['Naga Ancestry', 7, 'No visible signs'],
        ['Sleeper Agent', 8, 'With a fail-safe'], ['The Chrysanthemum Court', 3, 'Another era'],
        ['Clear Water Stigma', 2, 'One Outfit weapon'], ['Bounty', 6, 'Violent or heinous'], ['Bounty', 0, null]]);
      // Guard: an existing tier entry is untouched.
      check('C438-GENTRY-UNCHANGED', await page.evaluate(() => {
        const T = window.__L5R_TEST__;
        return T.advConfigOptionsFor(T.advConfigSchemaFor('Gentry')).map(o => [o.value, o.cost]);
      }), [['Village', 8], ['Large Village', 15], ['Unique Holding', 18], ['Town', 20], ['City', 25], ['Province', 30]]);
    });

    check('C438-NO-PAGE-ERRORS', errors, []);
  } finally {
    await browser.close();
  }
  const passed = results.filter(r => r.pass).length;
  if (results.length !== TOTAL) console.log('FAIL check count ' + results.length + ' expected ' + TOTAL);
  console.log(`\n${passed}/${TOTAL} checks passed`);
  process.exit(passed === TOTAL && results.length === TOTAL ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
