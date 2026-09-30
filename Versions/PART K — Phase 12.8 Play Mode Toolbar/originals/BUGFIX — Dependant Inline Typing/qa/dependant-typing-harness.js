/*
 * Dependant inline typing acceptance. The input HTML is read only.
 * Run: node dependant-typing-harness.js <sheet.html> [--mode-off|--provider-absent]
 *
 * Fixtures use the existing load seam; editing uses browser keyboard/clipboard actions.
 * Oracles are rendered inputs, collectData(), downloaded JSON and browser storage, never
 * DEPTYPE's own implementation. Every scenario declares its assertion identities up front:
 * an exception fails every unreached assertion instead of silently reducing the denominator.
 * --mode-off is explicit for parent/12.5 removal fixtures; default expectations never adapt
 * themselves to a missing/disabled production feature. Physical devices remain manual QA.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');
const sheet = process.argv[2];
const modeOff = process.argv.includes('--mode-off');
const providerAbsent = process.argv.includes('--provider-absent');
const results = [];
const contexts = [];
const canonical = v => Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object'
  ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canonical(v[k])])) : v;
const same = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
function record(id, actual, expected = true, detail = '') {
  if (results.some(r => r.id === id)) throw new Error('duplicate assertion ' + id);
  const pass = same(actual, expected);
  results.push({ id, pass });
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : '\n expected ' + JSON.stringify(expected)
    + '\n actual ' + JSON.stringify(actual)) + (detail ? '\n ' + detail : ''));
}
async function scenario(prefix, names, run) {
  const ids = names.map(n => 'DEPTYPE-' + prefix + '-' + n);
  const check = (n, a, e = true) => {
    const id = 'DEPTYPE-' + prefix + '-' + n;
    if (!ids.includes(id)) throw new Error('undeclared assertion ' + id);
    record(id, a, e);
  };
  let error = '';
  try { await run(check); } catch (e) { error = String(e.stack || e).split('\n').slice(0, 5).join('\n'); }
  for (const id of ids) if (!results.some(r => r.id === id)) record(id, 'not reached', 'completed', error);
}
async function fresh(browser, viewport = { width: 1280, height: 900 }) {
  const context = await browser.newContext({ viewport, permissions: ['clipboard-read', 'clipboard-write'] });
  contexts.push(context);
  const page = await context.newPage();
  page.setDefaultTimeout(3500);
  page.errors = [];
  page.on('pageerror', e => page.errors.push(String(e)));
  await page.route('https://fonts.googleapis.com/**', r => r.abort());
  await page.route('https://fonts.gstatic.com/**', r => r.abort());
  await page.goto(pathToFileURL(path.resolve(sheet)).href, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.__L5R_TEST__?.CL11?.ready);
  return page;
}
const fixtures = [
  { name: 'Dependant', cost: 3, desc: 'First dependant', config: { type: 'rankPick', points: 3, dependant: 'Akiko', arrangement: 'Support at court', value: '3 points' } },
  { name: 'Dependant', cost: 4, desc: 'Second dependant', config: { type: 'rankPick', points: 4, dependant: 'Jiro', arrangement: 'Monthly stipend', value: '4 points' } },
  { name: 'Wrath of the Kami', cost: 3, desc: '', config: { type: 'elementPick', element: 'Fire', value: 'Fire' } },
  { name: 'Phobia', cost: 2, desc: '', config: { type: 'toggleModifier', rank: 2, active: false } }
];
async function tab(page) {
  await page.evaluate(async () => {
    const C = window.__L5R_CAROUSEL__;
    C.goToTab('Adv & Disadv');
    if (C.whenSettled) await C.whenSettled();
  });
}
async function seed(page) {
  await page.evaluate(fixtures => {
    const T = window.__L5R_TEST__;
    T.CL11?.close(); T.closeAdvConfigModal(); T.MODES12?.set('management');
    T.resetToBaseline();
    const data = T.collectData(); data.fields.f_name = 'Dependant typing acceptance';
    data.disadv = fixtures;
    T.applyData(data); T.recalcAll();
  }, fixtures);
  await tab(page);
}
const input = (page, field, row = 0) => page.locator('#disadvList .entry').nth(row).locator('.dep458-input').nth(field);
const config = (page, row = 0) => page.evaluate(row => window.__L5R_TEST__.collectData().disadv[row].config, row);
const data = page => page.evaluate(() => window.__L5R_TEST__.collectData());
const summary = (page, row = 0) => page.locator('#disadvList .entry').nth(row).locator('.d45-summary').textContent();
async function replace(page, field, value, row = 0) {
  await input(page, field, row).click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type(value);
}
async function blur(page) { await page.locator('#disadvList .entry').last().locator('.en-desc').click(); await page.waitForTimeout(50); }
async function focusState(page, field, row = 0) {
  return input(page, field, row).evaluate(e => [document.activeElement === e, e.selectionStart, e.selectionEnd, e.value]);
}
async function mode(page, value) {
  await page.evaluate(value => window.__L5R_TEST__.MODES12?.set(value), value);
  await page.waitForTimeout(30);
}
const withoutOptional = d => {
  d = JSON.parse(JSON.stringify(d));
  for (const row of d.disadv || []) if (row.name === 'Dependant') {
    delete row.config.dependant; delete row.config.arrangement;
  }
  return d;
};
const fieldNames = ['ASCII-VALUE', 'ASCII-STORED', 'ASCII-CARET', 'MIDDLE-INSERT', 'MIDDLE-CARET',
  'DELETE', 'RECALC-FOCUS', 'RECALC-CONTINUE', 'SELECTION-REPLACE', 'PASTE-VALUE', 'PASTE-STORED',
  'CLEAR-VALUE', 'CLEAR-STORED', 'WHITESPACE-DRAFT', 'WHITESPACE-NORMALIZED', 'BLUR-NORMALIZED'];

async function main() {
  if (!sheet || !fs.existsSync(sheet)) throw new Error('usage: node dependant-typing-harness.js <sheet.html> [--mode-off|--provider-absent]');
  const browser = await chromium.launch();
  try {
    if (providerAbsent) {
      await scenario('PROVIDER-ABSENT', ['NO-INPUTS', 'CORE-RECALC', 'NO-ERRORS'], async check => {
        const p = await fresh(browser); await seed(p);
        check('NO-INPUTS', await p.locator('#disadvList .dep458-input').count(), 0);
        check('CORE-RECALC', await p.evaluate(() => { window.__L5R_TEST__.recalcAll(); return !!window.__L5R_TEST__.collectData().fields; }));
        check('NO-ERRORS', p.errors, []);
      });
    } else {
      for (const [field, key] of ['dependant', 'arrangement'].entries()) {
        await scenario(key.toUpperCase(), fieldNames, async check => {
          const p = await fresh(browser); await seed(p);
          await replace(p, field, 'Miyu');
          check('ASCII-VALUE', await input(p, field).inputValue(), 'Miyu');
          check('ASCII-STORED', (await config(p))[key], 'Miyu');
          check('ASCII-CARET', await focusState(p, field), [true, 4, 4, 'Miyu']);
          await input(p, field).click(); await p.keyboard.press('Home');
          await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); await p.keyboard.type('-');
          check('MIDDLE-INSERT', await input(p, field).inputValue(), 'Mi-yu');
          check('MIDDLE-CARET', await focusState(p, field), [true, 3, 3, 'Mi-yu']);
          await p.keyboard.press('Backspace'); await p.keyboard.press('Delete');
          check('DELETE', await input(p, field).inputValue(), 'Miu');
          await p.evaluate(() => window.__L5R_TEST__.recalcAll());
          check('RECALC-FOCUS', await focusState(p, field), [true, 2, 2, 'Miu']);
          await p.keyboard.type('y');
          check('RECALC-CONTINUE', await input(p, field).inputValue(), 'Miyu');
          await input(p, field).click(); await p.keyboard.press('Home');
          await p.keyboard.press('Shift+ArrowRight'); await p.keyboard.press('Shift+ArrowRight');
          await p.keyboard.type('Ka');
          check('SELECTION-REPLACE', await input(p, field).inputValue(), 'Kayu');
          const pasted = '雪 – café ’ 😀';
          await p.evaluate(text => navigator.clipboard.writeText(text), pasted);
          await input(p, field).click(); await p.keyboard.press('Control+A'); await p.keyboard.press('Control+V');
          await p.waitForTimeout(30);
          check('PASTE-VALUE', await input(p, field).inputValue(), pasted);
          check('PASTE-STORED', (await config(p))[key], pasted);
          await input(p, field).click(); await p.keyboard.press('Control+A'); await p.keyboard.press('Backspace');
          check('CLEAR-VALUE', await input(p, field).inputValue(), '');
          check('CLEAR-STORED', (await config(p))[key], '');
          await replace(p, field, '  Keep space while typing  ');
          check('WHITESPACE-DRAFT', await input(p, field).inputValue(), '  Keep space while typing  ');
          check('WHITESPACE-NORMALIZED', (await config(p))[key], 'Keep space while typing');
          await blur(p);
          check('BLUR-NORMALIZED', await input(p, field).inputValue(), 'Keep space while typing');
        });
      }
      await scenario('ISOLATION', ['FIRST-NAME', 'SECOND-ARRANGEMENT', 'OTHER-FIELDS', 'WHOLE-CHARACTER', 'SUMMARY', 'WRATH', 'NO-ERRORS'], async check => {
        const p = await fresh(browser); await seed(p); const before = await data(p);
        await replace(p, 0, 'First edited'); await blur(p);
        await replace(p, 1, 'Second edited', 1); await blur(p);
        check('FIRST-NAME', (await config(p, 0)).dependant, 'First edited');
        check('SECOND-ARRANGEMENT', (await config(p, 1)).arrangement, 'Second edited');
        check('OTHER-FIELDS', [(await config(p, 0)).arrangement, (await config(p, 1)).dependant], ['Support at court', 'Jiro']);
        check('WHOLE-CHARACTER', withoutOptional(await data(p)), withoutOptional(before));
        check('SUMMARY', /First edited/.test(await summary(p)));
        check('WRATH', await p.locator('.wrath458-badge').textContent(), 'Incoming Fire: caster gains one Free Raise');
        check('NO-ERRORS', p.errors, []);
      });
      // Moving focus straight from one editor to another, with no neutral click between, is where
      // a commit-time rebuild would replace the editor being moved into.
      await scenario('CROSS', ['ROW-TO-ROW-FIRST', 'ROW-TO-ROW-SECOND', 'ROW-TO-ROW-FOCUS', 'LEFT-ROW-SUMMARY',
        'ENTER-THEN-LEAVE', 'SCRIPTED-CHANGE', 'OTHER-ROW-BUTTON', 'SAME-ROW-BUTTON', 'NO-ERRORS'], async check => {
        const p = await fresh(browser); await seed(p);
        await replace(p, 0, 'Row one name');
        await replace(p, 1, 'Row two arrangement', 1);
        check('ROW-TO-ROW-FIRST', (await config(p, 0)).dependant, 'Row one name');
        check('ROW-TO-ROW-SECOND', (await config(p, 1)).arrangement, 'Row two arrangement');
        check('ROW-TO-ROW-FOCUS', await focusState(p, 1, 1), [true, 19, 19, 'Row two arrangement']);
        check('LEFT-ROW-SUMMARY', /Row one name/.test(await summary(p, 0)));
        // Enter commits with focus still in the field; leaving afterwards fires no second change.
        await replace(p, 0, '  Entered name  ', 1); await p.keyboard.press('Enter'); await blur(p);
        check('ENTER-THEN-LEAVE', [await input(p, 0, 1).inputValue(), /Entered name/.test(await summary(p, 1))], ['Entered name', true]);
        // A change with no focus anywhere in the row (as Phase 4.5.8's own test sends) still reaches the summary.
        await p.evaluate(() => {
          const e = document.querySelectorAll('#disadvList .entry')[0].querySelector('.dep458-input');
          e.value = 'Scripted name'; e.dispatchEvent(new Event('change', { bubbles: true }));
        });
        await p.waitForTimeout(120);
        check('SCRIPTED-CHANGE', [(await config(p, 0)).dependant, /Scripted name/.test(await summary(p, 0))], ['Scripted name', true]);
        // A person's click is a press and a release some milliseconds apart, and anything queued
        // by the press runs in between. A rebuild there would swallow the click.
        // Find, scroll to and measure the button in one step inside the page, so a row rebuilt
        // between separate steps cannot make the result depend on timing. Then wait until it has
        // stopped moving: where typing has already failed, stray spaces start an animated page
        // scroll that would otherwise carry the button away between press and release.
        const measure = (row, scroll) => p.evaluate(([row, scroll]) => {
          const b = document.querySelectorAll('#disadvList .entry')[row].querySelector('.adv-config-btn');
          if (scroll) b.scrollIntoView({ block: 'center' });
          const r = b.getBoundingClientRect();
          return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
        }, [row, scroll]);
        const humanClick = async row => {
          let at = await measure(row, true);
          for (let i = 0; i < 20; i++) {
            await p.waitForTimeout(100);
            const again = await measure(row, false);
            if (again.x === at.x && again.y === at.y) break;
            at = await measure(row, true);
          }
          await p.mouse.move(at.x, at.y);
          await p.mouse.down(); await p.waitForTimeout(40); await p.mouse.up();
          await p.waitForTimeout(40);
        };
        const modalOpen = async () => {
          const open = await p.locator('#advConfigModalOverlay').isVisible();
          await p.evaluate(() => window.__L5R_TEST__.closeAdvConfigModal());
          return open;
        };
        await replace(p, 0, 'Before a button');
        await humanClick(2);
        check('OTHER-ROW-BUTTON', await modalOpen());
        await replace(p, 1, 'Before its own button');
        await humanClick(0);
        check('SAME-ROW-BUTTON', await modalOpen());
        check('NO-ERRORS', p.errors, []);
      });
      await scenario('PERSIST', ['SAVED-ID', 'AUTOSAVE-NAME', 'AUTOSAVE-ARRANGEMENT', 'SAVE-TEXT', 'LOAD-TEXT', 'EXPORT-TEXT', 'IMPORT-TEXT', 'RELOAD-TEXT', 'NO-ERRORS'], async check => {
        const p = await fresh(browser); await seed(p);
        await p.locator('#btnSaveAs').click();
        await p.waitForFunction(() => !!document.getElementById('charSelect').value);
        const id = await p.locator('#charSelect').inputValue(); check('SAVED-ID', /^c_/.test(id));
        await tab(p); await replace(p, 0, 'Autosaved name');
        await p.waitForTimeout(1500);
        const saved = async () => p.evaluate(id => JSON.parse(localStorage.getItem('l5r-sheet:local:l5r-char:' + id)), id);
        check('AUTOSAVE-NAME', (await saved()).disadv[0].config.dependant, 'Autosaved name');
        await replace(p, 1, 'Autosaved support'); await p.waitForTimeout(1500);
        check('AUTOSAVE-ARRANGEMENT', (await saved()).disadv[0].config.arrangement, 'Autosaved support');
        await replace(p, 0, 'Saved immediately'); await p.locator('#btnSave').click();
        await p.waitForTimeout(80);
        const pair = d => [d.disadv[0].config.dependant, d.disadv[0].config.arrangement];
        const expected = ['Saved immediately', 'Autosaved support'];
        check('SAVE-TEXT', pair(await saved()), expected);
        // Reload the saved record through the toolbar rather than replacing it with a test seam.
        await p.locator('#btnLoad').click(); await p.waitForTimeout(80);
        check('LOAD-TEXT', pair(await data(p)), expected);
        const downloadPromise = p.waitForEvent('download'); await p.locator('#btnExport').click();
        const download = await downloadPromise;
        const exported = fs.readFileSync(await download.path(), 'utf8');
        check('EXPORT-TEXT', pair(JSON.parse(exported)), expected);
        await p.locator('#fileImport').setInputFiles({ name: 'dependant.l5r.json', mimeType: 'application/json', buffer: Buffer.from(exported) });
        await p.waitForTimeout(80); check('IMPORT-TEXT', pair(await data(p)), expected);
        await p.reload({ waitUntil: 'domcontentloaded' });
        await p.waitForFunction(() => !!window.__L5R_TEST__?.CL11?.ready);
        await p.waitForSelector('.cl11-row[data-id="' + id + '"] .cl11-open', { state: 'visible' });
        await p.locator('.cl11-row[data-id="' + id + '"] .cl11-open').click();
        check('RELOAD-TEXT', pair(await data(p)), expected);
        check('NO-ERRORS', p.errors, []);
      });
      await scenario('MODE', ['DRAFT-SURVIVES', 'READONLY', 'KEYBOARD-GATE', 'INPUT-GATE', 'CHANGE-GATE', 'TRANSITIONS', 'EDITING-RESTORED', 'TAB-CONTINUATION', 'PLAY-RESOURCE', 'NO-ERRORS'], async check => {
        const p = await fresh(browser); await seed(p);
        await replace(p, 0, 'Mode draft'); await mode(p, 'play');
        check('DRAFT-SURVIVES', (await config(p)).dependant, 'Mode draft');
        check('READONLY', await input(p, 0).evaluate(e => e.readOnly), !modeOff);
        await replace(p, 0, 'Keyboard change');
        check('KEYBOARD-GATE', (await config(p)).dependant, modeOff ? 'Keyboard change' : 'Mode draft');
        await input(p, 0).evaluate(e => { e.value = 'Dispatched input'; e.dispatchEvent(new Event('input', { bubbles: true })); });
        check('INPUT-GATE', (await config(p)).dependant, modeOff ? 'Dispatched input' : 'Mode draft');
        await input(p, 0).evaluate(e => { e.value = 'Dispatched change'; e.dispatchEvent(new Event('change', { bubbles: true })); });
        check('CHANGE-GATE', (await config(p)).dependant, modeOff ? 'Dispatched change' : 'Mode draft');
        // A dispatched edit can change a readonly DOM property; a render must use persisted data.
        await p.evaluate(() => { document.activeElement?.blur(); window.__L5R_TEST__.recalcAll(); });
        await p.waitForTimeout(50); const before = await data(p);
        for (let i = 0; i < 3; i++) { await mode(p, 'management'); await mode(p, 'play'); }
        check('TRANSITIONS', await data(p), before);
        await mode(p, 'management'); await replace(p, 0, 'Restored editor');
        check('EDITING-RESTORED', (await config(p)).dependant, 'Restored editor');
        await p.keyboard.press('Tab'); await p.keyboard.press('Control+A'); await p.keyboard.type('Tab continued');
        check('TAB-CONTINUATION', (await config(p)).arrangement, 'Tab continued');
        await blur(p); await mode(p, 'play');
        await p.locator('#disadvList .d45-phobia-row .d45-toggle').click();
        check('PLAY-RESOURCE', (await data(p)).disadv[3].config.active, true);
        check('NO-ERRORS', p.errors, []);
      });
      await scenario('VIEWPORT', ['NARROW-VISIBLE', 'NARROW-TEXT', 'NARROW-WIDTH', 'WIDE-VISIBLE', 'WIDE-TEXT', 'NO-ERRORS'], async check => {
        const p = await fresh(browser, { width: 390, height: 844 }); await seed(p);
        check('NARROW-VISIBLE', await input(p, 0).isVisible() && await input(p, 1).isVisible());
        // Layout is measured before typing, so it does not depend on whether typing survives.
        check('NARROW-WIDTH', await input(p, 1).evaluate(e => { const r = e.getBoundingClientRect(); return r.width > 100 && r.width <= innerWidth; }));
        await replace(p, 1, 'Narrow screen typing'); check('NARROW-TEXT', await input(p, 1).inputValue(), 'Narrow screen typing');
        await p.setViewportSize({ width: 1280, height: 900 }); await tab(p);
        check('WIDE-VISIBLE', await input(p, 0).isVisible() && await input(p, 1).isVisible());
        await replace(p, 0, 'Wide screen typing'); check('WIDE-TEXT', await input(p, 0).inputValue(), 'Wide screen typing');
        check('NO-ERRORS', p.errors, []);
      });
    }
  } finally { for (const context of contexts) await context.close(); await browser.close(); }
  const passed = results.filter(r => r.pass).length;
  console.log('\n' + passed + '/' + results.length + ' checks passed');
  console.log('ASSERTION_IDS ' + JSON.stringify(results.map(r => r.id)));
  console.log('FAILED_IDS ' + JSON.stringify(results.filter(r => !r.pass).map(r => r.id)));
  process.exitCode = !results.length || passed !== results.length ? 1 : 0;
}
main().catch(e => { console.error(e); process.exitCode = 1; });
