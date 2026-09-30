/*
 * Phase 12.8 (Part K) acceptance: the old toolbar row replaced by header actions and a More menu.
 * The input HTML is read only.   node toolbar-harness.js <sheet.html> [--absent] [--modes-off]
 *
 * Oracles are what a player sees and what is stored: visibility and geometry, localStorage, the
 * downloaded file, a counted window.print(), the Characters list's own isOpen(); never MODES128.
 * --absent states the expectations for a build where the old row must be untouched (this part
 * removed or switched off, or no Characters list). --modes-off is Phase 12's parent switch off: the
 * header is replaced but there is no Play mode, so Save As stays available. Every scenario declares
 * its assertion identities first, so an exception fails what it did not reach.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');
const sheet = process.argv[2];
const absent = process.argv.includes('--absent');
const modesOff = process.argv.includes('--modes-off');
const results = [];
const contexts = [];
const canonical = v => Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object'
  ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canonical(v[k])])) : v;
const same = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
function record(id, actual, expected, detail = '') {
  if (results.some(r => r.id === id)) throw new Error('duplicate assertion ' + id);
  const pass = same(actual, expected);
  results.push({ id, pass });
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : '\n expected ' + JSON.stringify(expected)
    + '\n actual ' + JSON.stringify(actual)) + (detail ? '\n ' + detail : ''));
}
async function scenario(prefix, names, run) {
  const ids = names.map(n => 'PM128-' + prefix + '-' + n);
  const check = (n, a, e = true) => {
    const id = 'PM128-' + prefix + '-' + n;
    if (!ids.includes(id)) throw new Error('undeclared assertion ' + id);
    record(id, a, e);
  };
  let error = '';
  try { await run(check); } catch (e) { error = String(e.stack || e).split('\n').slice(0, 5).join('\n'); }
  for (const id of ids) if (!results.some(r => r.id === id)) record(id, 'not reached', 'completed', error);
}
async function fresh(browser, { width = 390, height = 844 } = {}) {
  // A phone-width page is a touch page, as on a phone. window.print is counted, never opened.
  const context = await browser.newContext({ viewport: { width, height }, hasTouch: width < 768 });
  contexts.push(context);
  await context.addInitScript(() => { window.__prints = 0; window.print = () => { window.__prints++; }; });
  const page = await context.newPage();
  page.setDefaultTimeout(6000);
  page.errors = [];
  page.on('pageerror', e => page.errors.push(String(e)));
  await page.route('https://fonts.googleapis.com/**', r => r.abort());
  await page.route('https://fonts.gstatic.com/**', r => r.abort());
  // Readiness, not an assertion: the 3 MB page can take a while on a busy machine.
  await page.goto(pathToFileURL(path.resolve(sheet)).href, { waitUntil: 'domcontentloaded', timeout: 60000 });
  // With the Characters list switched off (a boundary build) it never becomes ready; its switch says so.
  await page.waitForFunction(() => { const L = window.__L5R_TEST__?.CL11; return !!L && (L.ready || L.enabled() === false) && !!window.__L5R_CAROUSEL__?.isReady?.(); }, null, { timeout: 60000 });
  await page.evaluate(() => window.__L5R_TEST__.CL11?.close());
  await page.waitForTimeout(250);
  return page;
}
const OLD_IDS = ['charSelect', 'btnLoad', 'btnSave', 'btnSaveAs', 'btnNew', 'btnDelete', 'btnPrint', 'btnExport',
  'btnImportTrigger', 'fileImport', 'cl11Toolbar', 'statusMsg'];
const visible = (p, sel) => p.locator(sel).first().isVisible();
const mode = async (p, m) => { await p.evaluate(m => window.__L5R_TEST__.MODES12.set(m), m); await p.waitForTimeout(150); };
const saved = p => p.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('l5r-sheet:local:l5r-char:')).sort());
const stored = (p, id) => p.evaluate(id => JSON.parse(localStorage.getItem('l5r-sheet:local:l5r-char:' + id)), id);
const current = p => p.locator('#charSelect').inputValue();
const menuOpen = p => p.evaluate(() => { const m = document.getElementById('pm128Menu'); return !!m && !m.hidden; });
const shownItems = p => p.evaluate(() => [...document.querySelectorAll('#pm128Menu .pm128-item')]
  .filter(b => b.offsetParent !== null).map(b => b.textContent.trim()));
// Every shown item fully inside the window and really the thing under its own centre (not clipped).
const itemsReachable = p => p.evaluate(() => [...document.querySelectorAll('#pm128Menu .pm128-item')]
  .filter(b => b.offsetParent !== null).every(b => {
    const r = b.getBoundingClientRect();
    if (r.left < 0 || r.top < 0 || r.right > innerWidth || r.bottom > innerHeight) return false;
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !!hit && (hit === b || b.contains(hit));
  }));
const header = p => p.evaluate(() => {
  const ids = ['cl11Toolbar', 'btnSave', 'pm128More', 'pm12Toggle', 'seal'];
  const els = ids.map(id => document.getElementById(id)).filter(e => e && e.offsetParent !== null);
  const rects = els.map(e => e.getBoundingClientRect());
  return {
    order: [...(document.getElementById('pm128Actions')?.children || [])].map(e => e.id || e.className),
    inView: rects.every(r => r.left >= 0 && r.right <= innerWidth + 0.5),
    oneRow: rects.length > 0 && Math.max(...rects.map(r => r.top)) - Math.min(...rects.map(r => r.top)) < 12,
  };
});
// The name box is on the Identity page; the carousel makes pages you are not on inert, so go there
// first, as a person would, then type.
async function setName(p, value) {
  await p.evaluate(async () => { const C = window.__L5R_CAROUSEL__; C.goToTab('Identity');
    await Promise.race([C.whenSettled ? C.whenSettled() : null, new Promise(r => setTimeout(r, 2000))]); });
  await p.locator('#f_name').fill(value);
}
async function tap(p, sel) { if (await p.evaluate(() => matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window)) await p.locator(sel).tap(); else await p.locator(sel).click(); }

async function main() {
  if (!sheet || !fs.existsSync(sheet)) throw new Error('usage: node toolbar-harness.js <sheet.html> [--absent] [--modes-off]');
  const browser = await chromium.launch();
  try {
    if (absent) {
      await scenario('ABSENT', ['ROW-SHOWN', 'OLD-BUTTONS-SHOWN', 'NO-HEADER-ACTIONS', 'NO-MENU', 'IDS-KEPT', 'SAVE-WORKS', 'NO-ERRORS'], async check => {
        const p = await fresh(browser, { width: 1280, height: 900 });
        check('ROW-SHOWN', await visible(p, '.car-toolbar-rail #btnLoad'));
        check('OLD-BUTTONS-SHOWN', await p.evaluate(() => ['btnSave', 'btnSaveAs', 'btnNew', 'btnDelete', 'btnPrint', 'btnExport', 'btnLoad', 'charSelect']
          .every(id => document.getElementById(id).offsetParent !== null)));
        check('NO-HEADER-ACTIONS', await p.locator('#pm128Actions').count(), 0);
        check('NO-MENU', await p.locator('#pm128Menu, #pm128More').count(), 0);
        check('IDS-KEPT', await p.evaluate(ids => ids.filter(id => id !== 'cl11Toolbar' || window.__L5R_TEST__.CL11?.enabled?.())
          .every(id => document.querySelectorAll('#' + id).length === 1), OLD_IDS));
        await setName(p, 'Toolbar absent');
        await p.locator('#btnSave').click(); await p.waitForTimeout(200);
        check('SAVE-WORKS', (await saved(p)).length, 1);
        check('NO-ERRORS', p.errors, []);
      });
    } else {
      await scenario('ROW', ['OLD-ROW-HIDDEN', 'IDS-KEPT', 'ORDER', 'IN-VIEW', 'ONE-ROW', 'NEW-BLANK-GONE', 'NO-ERRORS'], async check => {
        const p = await fresh(browser);
        check('OLD-ROW-HIDDEN', await visible(p, '.car-toolbar-rail'), false);
        check('IDS-KEPT', await p.evaluate(ids => ids.every(id => document.querySelectorAll('#' + id).length === 1), OLD_IDS));
        const h = await header(p);
        check('ORDER', h.order, ['cl11Toolbar', 'btnSave', 'pm128-more-wrap']);
        check('IN-VIEW', h.inView);
        check('ONE-ROW', h.oneRow);
        check('NEW-BLANK-GONE', await visible(p, '#btnNew'), false);
        check('NO-ERRORS', p.errors, []);
      });

      await scenario('SAVE', ['CREATES', 'STATUS', 'UPDATES-SAME', 'STORED-NAME', 'NO-ERRORS'], async check => {
        const p = await fresh(browser);
        await setName(p, 'Toolbar acceptance');
        await tap(p, '#btnSave'); await p.waitForTimeout(250);
        const keys = await saved(p); const id = await current(p);
        check('CREATES', [keys.length, keys[0] === 'l5r-sheet:local:l5r-char:' + id], [1, true]);
        check('STATUS', [await visible(p, '#statusMsg'), /Saved/.test(await p.locator('#statusMsg').textContent())], [true, true]);
        await setName(p, 'Toolbar acceptance, renamed');
        await tap(p, '#btnSave'); await p.waitForTimeout(250);
        check('UPDATES-SAME', [(await saved(p)).length, await current(p)], [1, id]);
        check('STORED-NAME', (await stored(p, id)).fields.f_name, 'Toolbar acceptance, renamed');
        check('NO-ERRORS', p.errors, []);
      });

      await scenario('MENU', ['CLOSED', 'OPENS', 'ITEMS', 'REACHABLE', 'COPY-NEW', 'COPY-ORIGINAL-KEPT', 'CLOSES-ON-CHOICE',
        'CLOSES-OUTSIDE', 'CLOSES-ESCAPE', 'FOCUS-BACK', 'PRINT', 'NO-ERRORS'], async check => {
        const p = await fresh(browser);
        await setName(p, 'Menu original');
        await tap(p, '#btnSave'); await p.waitForTimeout(250);
        const original = await current(p); const before = await stored(p, original);
        check('CLOSED', await menuOpen(p), false);
        await tap(p, '#pm128More');
        check('OPENS', [await menuOpen(p), await p.locator('#pm128More').getAttribute('aria-expanded')], [true, 'true']);
        check('ITEMS', await shownItems(p), modesOff ? ['Save As a copy', 'Print', 'Export JSON'] : ['Save As a copy', 'Print', 'Export JSON']);
        check('REACHABLE', await itemsReachable(p));
        await tap(p, '#btnSaveAs'); await p.waitForTimeout(250);
        const copy = await current(p);
        check('COPY-NEW', [copy !== original, (await saved(p)).length], [true, 2]);
        await setName(p, 'Menu copy, edited'); await tap(p, '#btnSave'); await p.waitForTimeout(250);
        check('COPY-ORIGINAL-KEPT', await stored(p, original), before);
        check('CLOSES-ON-CHOICE', await menuOpen(p), false);
        await tap(p, '#pm128More'); await p.locator('#headerName').click();
        check('CLOSES-OUTSIDE', await menuOpen(p), false);
        await tap(p, '#pm128More'); await p.keyboard.press('Escape');
        check('CLOSES-ESCAPE', await menuOpen(p), false);
        check('FOCUS-BACK', await p.evaluate(() => document.activeElement && document.activeElement.id), 'pm128More');
        await tap(p, '#pm128More'); await tap(p, '#btnPrint'); await p.waitForTimeout(100);
        check('PRINT', [await p.evaluate(() => window.__prints), await menuOpen(p)], [1, false]);
        check('NO-ERRORS', p.errors, []);
      });

      await scenario('PLAY', ['SAVE-SHOWN', 'ONE-ROW', 'ITEMS', 'SAVEAS-INERT', 'CHARACTERS', 'NO-ERRORS'], async check => {
        const p = await fresh(browser);
        await setName(p, 'Play menu');
        await tap(p, '#btnSave'); await p.waitForTimeout(250);
        await mode(p, 'play');
        check('SAVE-SHOWN', await visible(p, '#btnSave'), true);
        // Play's toggle reads the longer "Manage"; the row must still fit beside the seal.
        check('ONE-ROW', [(await header(p)).oneRow, (await header(p)).inView], [true, true]);
        await tap(p, '#pm128More');
        check('ITEMS', await shownItems(p), modesOff ? ['Save As a copy', 'Print', 'Export JSON'] : ['Print', 'Export JSON']);
        await p.keyboard.press('Escape');
        const count = (await saved(p)).length;
        // A script's click travels the same path as a tap; in Play the mode gate must stop it.
        await p.evaluate(() => document.getElementById('btnSaveAs').click()); await p.waitForTimeout(250);
        check('SAVEAS-INERT', (await saved(p)).length, modesOff ? count + 1 : count);
        await tap(p, '#cl11Toolbar'); await p.waitForTimeout(250);
        check('CHARACTERS', await p.evaluate(() => window.__L5R_TEST__.CL11.isOpen()), true);
        check('NO-ERRORS', p.errors, []);
      });

      await scenario('DESKTOP', ['ONE-ROW', 'EXPORT', 'EXPORT-CLOSES', 'NO-ERRORS'], async check => {
        const p = await fresh(browser, { width: 1280, height: 900 });
        check('ONE-ROW', (await header(p)).oneRow);
        await setName(p, 'Desktop export');
        await p.locator('#pm128More').click();
        const download = p.waitForEvent('download');
        await p.locator('#btnExport').click();
        const file = await download;
        check('EXPORT', JSON.parse(fs.readFileSync(await file.path(), 'utf8')).fields.f_name, 'Desktop export');
        check('EXPORT-CLOSES', await menuOpen(p), false);
        check('NO-ERRORS', p.errors, []);
      });

      await scenario('PRINTED', ['ACTIONS-NOT-PRINTED', 'MENU-NOT-PRINTED', 'NO-ERRORS'], async check => {
        const p = await fresh(browser);
        await tap(p, '#pm128More');
        await p.emulateMedia({ media: 'print' });
        const display = sel => p.evaluate(s => getComputedStyle(document.querySelector(s)).display, sel);
        check('ACTIONS-NOT-PRINTED', await display('#pm128Actions'), 'none');
        check('MENU-NOT-PRINTED', await display('#pm128Menu'), 'none');
        await p.emulateMedia({ media: 'screen' });
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
