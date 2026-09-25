/* =============================================================================
   PART K PHASE 11 (first stage) — CHARACTERS LIST & SAVE MODEL: AUTOMATED CHECKS

     NODE_PATH=/opt/node22/lib/node_modules node qa/characters-harness.js [sheet.html]

   Defaults to the live Phase 0 build. Every scenario runs in a fresh browser context,
   so storage starts empty each time.

   THE ORACLE IS STORAGE, NOT THE CODE UNDER TEST. What a character "is" is read straight
   from localStorage ('l5r-sheet:local:l5r-char-index' and 'l5r-sheet:local:l5r-char:<id>'),
   the trunk's own keys, and compared with the trunk's own collectData(). CL11 is read only
   for its switches and its autosave write counter.
   ============================================================================= */

'use strict';

const { chromium } = require('playwright');
const path = require('path');

const SHEET = path.resolve(process.argv[2] || path.join(__dirname, '..', '..',
  'Part F — Cross-Platform Delivery', 'PART F — Phase 0 Source Reorganization for Maintainability',
  'l5r-character-sheet.html'));
const URL = 'file://' + SHEET;
const WAIT = 1700;   // longer than the 1200 ms autosave delay

let passed = 0, failed = 0;
function check(name, actual, expected) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected === undefined ? true : expected);
  if (a === e) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + '\n     expected ' + e + '\n     actual   ' + a); }
}

// A touch device that can share files. Records what would have been shared.
const SHARE_STUB = `
  window.__shareCalls = []; window.__shareMode = 'ok';
  navigator.canShare = (d) => !!(d && d.files && d.files.length);
  navigator.share = async (d) => {
    const f = d.files[0];
    window.__shareCalls.push({name: f.name, type: f.type, text: await f.text(), title: d.title});
    if (window.__shareMode === 'abort') throw new DOMException('cancelled', 'AbortError');
    if (window.__shareMode === 'deny') throw new DOMException('denied', 'NotAllowedError');
  };
  const realMatch = window.matchMedia.bind(window);
  window.matchMedia = (q) => /pointer:\\s*coarse/.test(q)
    ? {matches: true, media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}}
    : realMatch(q);
`;

const OPEN = [];
async function fresh(browser, {share = false} = {}) {
  const context = await browser.newContext({viewport: {width: 390, height: 844}, acceptDownloads: true});
  if (share) await context.addInitScript(SHARE_STUB);
  OPEN.push(context);
  const page = await context.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(String(e)));
  await page.goto(URL);
  await ready(page);
  return {context, page};
}
async function ready(page) {
  // A build with the phase switched off never becomes ready; it still has to run, and fail.
  await page.waitForFunction(() => { const T = window.__L5R_TEST__;
    return T && T.CL11 && (T.CL11.ready || T.CHARACTERS_LIST_ENABLED === false); }, null, {timeout: 15000});
}

// ---- storage oracle ----
const index = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('l5r-sheet:local:l5r-char-index') || '[]'));
const stored = (page, id) => page.evaluate((i) => localStorage.getItem('l5r-sheet:local:l5r-char:' + i), id);
const storedName = async (page, id) => { const s = await stored(page, id); return s ? JSON.parse(s).fields.f_name : null; };
const sheetJSON = (page) => page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData ? window.__L5R_TEST__.collectData() : null));
const picker = (page) => page.evaluate(() => document.getElementById('charSelect').value);
const writes = (page) => page.evaluate(() => window.__L5R_TEST__.CL11.writes);
const viewOpen = (page) => page.evaluate(() => !document.getElementById('cl11View').hidden);
const status = (page) => page.evaluate(() => document.getElementById('statusMsg').textContent);

async function setField(page, id, value) {
  await page.evaluate(([i, v]) => {
    const el = document.getElementById(i);
    el.value = v;
    el.dispatchEvent(new Event('input', {bubbles: true}));
    el.dispatchEvent(new Event('change', {bubbles: true}));
  }, [id, value]);
}
async function click(page, selector) { await page.evaluate((s) => document.querySelector(s).click(), selector); }
// Save the current sheet as a NEW character through the trunk's own Save As button.
async function saveAs(page, fields) {
  for (const [id, v] of Object.entries(fields)) await setField(page, id, v);
  const before = await picker(page);
  await click(page, '#btnSaveAs');
  await page.waitForFunction((b) => { const v = document.getElementById('charSelect').value; return v && v !== b; }, before);
  return picker(page);
}
async function openList(page) {
  await click(page, '#cl11Toolbar');
  await page.waitForFunction(() => !document.getElementById('cl11View').hidden);
}
const row = (id) => `.cl11-row[data-id="${id}"]`;
async function menuAction(page, id, act) {
  await page.click(row(id) + ' .cl11-more');
  await page.click(row(id) + ` .cl11-item[data-act="${act}"]`);
}
async function answer(page, ok) {
  await page.waitForFunction(() => document.getElementById('appConfirmOverlay').style.display === 'flex');
  await page.click(ok ? '#appConfirmOk' : '#appConfirmCancel');
}
async function readDownload(download) {
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const c of stream) chunks.push(c);
  return Buffer.concat(chunks).toString('utf8');
}

// A scenario that throws (a timeout on a broken build) is one FAIL, and the run goes on, so a
// broken variant reports a real count rather than stopping at its first failure.
async function scenario(name, body) {
  try { await body(); }
  catch (e) { failed++; console.log('FAIL CL-SCENARIO-RAN-' + name.replace(/[^a-z]+/gi, '-').toUpperCase() + '\n     ' + String(e.message || e).split('\n')[0]); }
}

async function main() {
  console.log('Characters list checks against: ' + SHEET);
  const browser = await chromium.launch();
  try {
    // ---------------------------------------------------------------- startup
    await scenario('startup', async () => {
      const {context, page} = await fresh(browser);
      check('CL-ENABLED', await page.evaluate(() => {
        const T = window.__L5R_TEST__;
        return [T.CHARACTERS_LIST_ENABLED, T.CHARACTERS_AUTOSAVE_ENABLED, T.CHARACTERS_SHARE_ENABLED];
      }), [true, true, true]);
      check('CL-START-EMPTY-STAYS-ON-SHEET', await viewOpen(page), false);
      check('CL-TOOLBAR-BUTTON-FIRST', await page.evaluate(() => {
        const rail = document.querySelector('.car-toolbar-rail');
        return rail.firstElementChild.contains(document.getElementById('cl11Toolbar'));
      }));
      await openList(page);
      check('CL-EMPTY-STATE', await page.evaluate(() => [!document.getElementById('cl11Empty').hidden,
        document.querySelectorAll('.cl11-row').length]), [true, 0]);
      await page.click('#cl11Back');
      check('CL-BACK-CLOSES', await viewOpen(page), false);

      const id = await saveAs(page, {f_name: 'Isawa Takeshi', f_clan: 'Phoenix', f_family: 'Isawa'});
      await page.reload();
      await ready(page);
      check('CL-START-WITH-SAVES-OPENS-LIST', await viewOpen(page));
      check('CL-START-TAB', await page.evaluate(() => [document.querySelector('.cl11-tab.active').dataset.tab,
        document.querySelector('[data-panel="characters"]').hidden]), ['characters', false]);
      check('CL-START-NO-WRITE', await writes(page), 0);

      // The screen covers the sheet and its floating buttons; a modal still opens above it.
      check('CL-COVERS-VIEWPORT', await page.evaluate(() =>
        [[195, 422], [20, 800], [370, 800], [370, 60]].every(([x, y]) => !!document.elementFromPoint(x, y).closest('#cl11View'))));
      check('CL-NO-SIDEWAYS-SCROLL', await page.evaluate(() => {
        const v = document.getElementById('cl11View'); return v.scrollWidth <= v.clientWidth;
      }));

      // Tabs: Library and Search are placeholders; Characters comes back.
      await page.click('.cl11-tab[data-tab="library"]');
      const lib = await page.evaluate(() => [document.querySelector('[data-panel="characters"]').hidden,
        document.querySelector('[data-panel="library"]').hidden, /Phase 13/.test(document.querySelector('[data-panel="library"]').textContent)]);
      await page.click('.cl11-tab[data-tab="search"]');
      const search = await page.evaluate(() => /Phase 14/.test(document.querySelector('[data-panel="search"]').textContent) &&
        !document.querySelector('[data-panel="search"]').hidden);
      await page.click('.cl11-tab[data-tab="characters"]');
      check('CL-TABS', [...lib, search, await page.evaluate(() => !document.querySelector('[data-panel="characters"]').hidden)],
        [true, false, true, true, true]);

      // Row content, read against storage.
      const saved = JSON.parse(await stored(page, id));
      check('CL-ROW-TEXT', await page.evaluate((i) => {
        const r = document.querySelector(`.cl11-row[data-id="${i}"]`);
        return [r.querySelector('.cl11-name').textContent, r.querySelectorAll('.cl11-line')[1].textContent];
      }, id), [saved.fields.f_name, saved.fields.f_family + ' · ' + saved.fields.f_clan]);
      check('CL-ROW-SCHOOL-RANK', await page.evaluate((i) =>
        document.querySelector(`.cl11-row[data-id="${i}"] .cl11-line`).textContent, id),
        (saved.fields.f_school ? saved.fields.f_school.trim() : 'No School yet') + ' · Insight Rank ' + parseInt(saved.fields.f_insightRank, 10));
      // The mon is Phase 9's (Part H) own Phoenix image, painted as a data URL.
      check('CL-PORTRAIT-MON', await page.evaluate((i) => {
        const img = document.querySelector(`.cl11-row[data-id="${i}"] .cl11-portrait img`);
        return !!img && /^data:image\/png;base64,/.test(img.getAttribute('src')) && img.getAttribute('src').length > 1000;
      }, id));

      // Tap opens it; the list closes and the picker follows.
      await page.click(row(id) + ' .cl11-open');
      await page.waitForFunction(() => document.getElementById('cl11View').hidden);
      check('CL-OPEN-LOADS', [await page.evaluate(() => document.getElementById('f_name').value), await picker(page)],
        ['Isawa Takeshi', id]);
      check('CL-OPEN-NO-WRITE', await writes(page), 0);
      await openList(page);
      check('CL-CURRENT-BADGE', await page.evaluate((i) =>
        [...document.querySelectorAll('.cl11-row')].map(r => [r.dataset.id === i, !!r.querySelector('.cl11-badge')]), id), [[true, true]]);
      const beforeState = await page.evaluate(() => window.__L5R_CAROUSEL__.getState().index);
      await page.click(row(id) + ' .cl11-open');
      check('CL-OPEN-SAME-JUST-CLOSES', [await viewOpen(page), await page.evaluate(() => window.__L5R_CAROUSEL__.getState().index)],
        [false, beforeState]);
      check('CL-NO-PAGE-ERRORS-STARTUP', page.errors, []);
      await context.close();
    });

    // ---------------------------------------------------------------- autosave
    await scenario('autosave', async () => {
      const {context, page} = await fresh(browser);
      await setField(page, 'f_name', 'Scratch');
      await page.waitForTimeout(WAIT);
      check('CL-AUTOSAVE-SKIPS-UNSAVED', [(await index(page)).length, await writes(page)], [0, 0]);

      const a = await saveAs(page, {f_name: 'Hida Kaiju', f_clan: 'Crab', f_family: 'Hida'});
      check('CL-SAVE-FORMAT-UNCHANGED', await stored(page, a), await sheetJSON(page));
      await setField(page, 'f_name', 'Hida Kaiju the Second');
      await page.waitForTimeout(WAIT);
      check('CL-AUTOSAVE-WRITES', [await storedName(page, a), (await index(page)).find(c => c.id === a).name, await writes(page)],
        ['Hida Kaiju the Second', 'Hida Kaiju the Second', 1]);
      check('CL-AUTOSAVE-PICKER-RENAMED', await page.evaluate((i) =>
        [document.getElementById('charSelect').value, document.querySelector(`#charSelect option[value="${i}"]`).textContent.includes('the Second')], a), [a, true]);
      check('CL-AUTOSAVE-MATCHES-SHEET', await stored(page, a), await sheetJSON(page));

      for (let i = 1; i <= 5; i++) { await setField(page, 'f_notes', 'note ' + i); await page.waitForTimeout(150); }
      await page.waitForTimeout(WAIT);
      check('CL-AUTOSAVE-DEBOUNCED', [await writes(page), JSON.parse(await stored(page, a)).fields.f_notes], [2, 'note 5']);

      await click(page, '#carTrack');
      await setField(page, 'f_notes', 'note 5');
      await page.waitForTimeout(WAIT);
      check('CL-AUTOSAVE-NO-DUPLICATE', await writes(page), 2);

      await page.evaluate(() => document.querySelector('#voidPips .void-pip').click());
      await page.waitForTimeout(WAIT);
      check('CL-AUTOSAVE-PIP-CLICK', [await writes(page), JSON.parse(await stored(page, a)).voidCurrent],
        [3, await page.evaluate(() => document.getElementById('void_current').value)]);
      await page.evaluate(() => document.querySelector('#voidPips .void-pip:not(.filled)') &&
        document.querySelector('#voidPips .void-pip:not(.filled)').dispatchEvent(new MouseEvent('contextmenu', {bubbles: true, cancelable: true})));
      await page.waitForTimeout(WAIT);
      check('CL-AUTOSAVE-PIP-RIGHT-CLICK', JSON.parse(await stored(page, a)).voidCurrent,
        await page.evaluate(() => document.getElementById('void_current').value));

      // Manual Save writes exactly what autosave would, and leaves nothing pending.
      await setField(page, 'f_notes', 'manual');
      await click(page, '#btnSave');
      await page.waitForFunction(() => /Saved/.test(document.getElementById('statusMsg').textContent));
      const w = await writes(page);
      await page.waitForTimeout(WAIT);
      check('CL-MANUAL-SAVE-AGREES', [await stored(page, a) === await sheetJSON(page), await writes(page) === w], [true, true]);

      // Pending edits are written before anything replaces the sheet.
      const b = await saveAs(page, {f_name: 'Kuni Mokuna', f_clan: 'Crab', f_family: 'Kuni'});
      await setField(page, 'f_notes', 'typed just before switching');
      await page.evaluate((i) => { document.getElementById('charSelect').value = i; document.getElementById('btnLoad').click(); }, a);
      await page.waitForFunction(() => document.getElementById('f_name').value === 'Hida Kaiju the Second');
      check('CL-FLUSH-ON-LOAD', JSON.parse(await stored(page, b)).fields.f_notes, 'typed just before switching');

      await page.evaluate((i) => { document.getElementById('charSelect').value = i; document.getElementById('btnLoad').click(); }, b);
      await page.waitForFunction(() => document.getElementById('f_name').value === 'Kuni Mokuna');
      await setField(page, 'f_notes', 'typed just before a blank load');
      await page.evaluate(() => { document.getElementById('charSelect').value = ''; document.getElementById('btnLoad').click(); });
      await page.waitForFunction(() => document.getElementById('f_name').value === '');
      check('CL-FLUSH-ON-BLANK-LOAD', JSON.parse(await stored(page, b)).fields.f_notes, 'typed just before a blank load');
      await page.evaluate((i) => { document.getElementById('charSelect').value = i; document.getElementById('btnLoad').click(); }, a);
      await page.waitForFunction(() => document.getElementById('f_name').value === 'Hida Kaiju the Second');
      await setField(page, 'f_notes', 'typed just before New Blank');
      await click(page, '#btnNew');
      await answer(page, true);
      await page.waitForTimeout(300);
      check('CL-FLUSH-ON-NEW-BLANK', [JSON.parse(await stored(page, a)).fields.f_notes, await picker(page)], ['typed just before New Blank', '']);

      await page.evaluate((i) => { document.getElementById('charSelect').value = i; document.getElementById('btnLoad').click(); }, b);
      await page.waitForFunction(() => document.getElementById('f_name').value === 'Kuni Mokuna');
      await setField(page, 'f_notes', 'typed just before leaving');
      await page.evaluate(() => {
        Object.defineProperty(document, 'visibilityState', {configurable: true, get: () => 'hidden'});
        document.dispatchEvent(new Event('visibilitychange'));
        delete document.visibilityState;
      });
      await page.waitForTimeout(200);
      check('CL-FLUSH-ON-HIDE', JSON.parse(await stored(page, b)).fields.f_notes, 'typed just before leaving');

      // An import through the TOOLBAR replaces the sheet too.
      await setField(page, 'f_notes', 'typed just before a toolbar import');
      const other = JSON.parse(await stored(page, a));
      await page.locator('#fileImport').setInputFiles({name: 'x.l5r.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(other))});
      await page.waitForFunction(() => document.getElementById('f_name').value === 'Hida Kaiju the Second');
      check('CL-FLUSH-ON-TOOLBAR-IMPORT', JSON.parse(await stored(page, b)).fields.f_notes, 'typed just before a toolbar import');
      check('CL-NO-PAGE-ERRORS-AUTOSAVE', page.errors, []);
      await context.close();
    });

    // ---------------------------------------------------------------- menu: copy, delete, create
    await scenario('menu: copy, delete, create', async () => {
      const {context, page} = await fresh(browser);
      const a = await saveAs(page, {f_name: 'Doji Hana', f_clan: 'Crane', f_family: 'Doji'});
      const b = await saveAs(page, {f_name: 'Akodo Ren', f_clan: 'Lion', f_family: 'Akodo'});
      const aBefore = await stored(page, a);
      await openList(page);
      check('CL-ROWS-NEWEST-FIRST', await page.evaluate(() => [...document.querySelectorAll('.cl11-row')].map(r => r.dataset.id)), [b, a]);

      await page.click(row(a) + ' .cl11-more');
      check('CL-MENU-OPENS', await page.evaluate((i) => [!document.querySelector(`.cl11-row[data-id="${i}"] .cl11-menu`).hidden,
        document.querySelector(`.cl11-row[data-id="${i}"] .cl11-more`).getAttribute('aria-expanded'),
        [...document.querySelectorAll(`.cl11-row[data-id="${i}"] .cl11-item`)].map(x => x.textContent)], a),
        [true, 'true', ['Export JSON', 'Save As a copy', 'Delete']]);
      await page.keyboard.press('Escape');
      check('CL-ESCAPE-CLOSES-MENU-FIRST', [await page.evaluate((i) => document.querySelector(`.cl11-row[data-id="${i}"] .cl11-menu`).hidden, a), await viewOpen(page)], [true, true]);

      await menuAction(page, a, 'copy');
      await page.waitForFunction(() => document.querySelectorAll('.cl11-row').length === 3);
      const copyId = (await index(page)).map(c => c.id).find(x => x !== a && x !== b);
      const copy = JSON.parse(await stored(page, copyId));
      const orig = JSON.parse(aBefore);
      check('CL-COPY-NEW-ENTRY', [copy.fields.f_name, (await index(page)).length, copyId !== a], ['Doji Hana (copy)', 3, true]);
      copy.fields.f_name = orig.fields.f_name;
      check('CL-COPY-SAME-DATA', JSON.stringify(copy), JSON.stringify(orig));
      check('CL-COPY-ORIGINAL-UNTOUCHED', await stored(page, a), aBefore);

      // Editing the copy never reaches the original.
      await page.click(row(copyId) + ' .cl11-open');
      await page.waitForFunction(() => document.getElementById('f_name').value === 'Doji Hana (copy)');
      // Opening from the list lands in Play once Phase 12 (Part K) is present, and Notes is a
      // Management field there, so edit it the way a player would: in Management. Conditional, so
      // this check reads the same with Phase 12 removed. Declared in both phases' ROLLBACK.
      await page.evaluate(() => { const M = window.__L5R_TEST__.MODES12; if (M) M.set('management'); });
      await setField(page, 'f_notes', 'only the copy');
      await page.waitForTimeout(WAIT);
      check('CL-COPY-INDEPENDENT', [JSON.parse(await stored(page, copyId)).fields.f_notes, await stored(page, a)], ['only the copy', aBefore]);

      // Delete: cancel keeps it; confirm removes only it.
      await openList(page);
      await menuAction(page, b, 'delete');
      await answer(page, false);
      check('CL-DELETE-CANCEL', [!!(await stored(page, b)), (await index(page)).length], [true, 3]);
      await menuAction(page, b, 'delete');
      await answer(page, true);
      await page.waitForFunction(() => document.querySelectorAll('.cl11-row').length === 2);
      check('CL-DELETE', [await stored(page, b), (await index(page)).map(c => c.id).sort(), await stored(page, a)],
        [null, [a, copyId].sort(), aBefore]);

      // Deleting the OPEN character clears the sheet, and autosave does not bring it back.
      await setField(page, 'f_notes', 'pending when deleted');
      await openList(page);
      await menuAction(page, copyId, 'delete');
      await answer(page, true);
      await page.waitForFunction(() => document.querySelectorAll('.cl11-row').length === 1);
      await page.waitForTimeout(WAIT);
      check('CL-DELETE-OPEN', [await stored(page, copyId), (await index(page)).map(c => c.id), await picker(page),
        await page.evaluate(() => document.getElementById('f_name').value)], [null, [a], '', '']);

      // A write already in flight when its character is deleted must not bring it back. The race
      // needs a slow storage bridge, so the write is driven directly with a job for the deleted id.
      check('CL-WRITE-SKIPS-DELETED', [await page.evaluate(async (i) => {
        const T = window.__L5R_TEST__;
        const data = T.collectData(); data.fields.f_name = 'Ghost';
        return T.CL11.write({id: i, data, text: JSON.stringify(data)});
      }, copyId), await stored(page, copyId), (await index(page)).map(c => c.id)], [false, null, [a]]);

      // A modal opens above the screen.
      await menuAction(page, a, 'delete');
      await page.waitForFunction(() => document.getElementById('appConfirmOverlay').style.display === 'flex');
      check('CL-MODAL-ABOVE-SCREEN', await page.evaluate(() => !!document.elementFromPoint(195, 422).closest('#appConfirmOverlay')));
      await page.click('#appConfirmCancel');

      // Create New Character: a saved, empty character that autosaves from its first edit.
      await page.click('#cl11Create');
      await page.waitForFunction(() => document.getElementById('cl11View').hidden);
      // Conditional since Phase 11.2: Create now opens the creation wizard over the sheet. Close
      // it to test the list; without 11.2 there is nothing to close. Declared in 11.2's ROLLBACK.
      await page.evaluate(() => { const W = window.__L5R_TEST__.CW112; if (W && W.isOpen()) W.close(); });
      const created = await picker(page);
      check('CL-CREATE-SAVED-ENTRY', [!!created, created !== a, (await index(page)).length, await page.evaluate(() => document.getElementById('f_name').value)],
        [true, true, 2, '']);
      await setField(page, 'f_name', 'Brand New');
      await page.waitForTimeout(WAIT);
      check('CL-CREATE-AUTOSAVES', await storedName(page, created), 'Brand New');
      await openList(page);
      check('CL-PORTRAIT-INITIAL', await page.evaluate((i) => {
        const p = document.querySelector(`.cl11-row[data-id="${i}"] .cl11-portrait`);
        return [p.textContent, !!p.querySelector('img')];
      }, created), ['B', false]);
      await page.click('#cl11Back');

      // Opening another character over unsaved work asks first.
      await page.evaluate(() => document.getElementById('btnNew').click());
      await answer(page, true);
      await setField(page, 'f_name', 'Unsaved work');
      await openList(page);
      await page.click(row(a) + ' .cl11-open');
      await answer(page, false);
      check('CL-UNSAVED-CANCEL-KEEPS', [await page.evaluate(() => document.getElementById('f_name').value), await viewOpen(page)], ['Unsaved work', true]);
      await page.click(row(a) + ' .cl11-open');
      await answer(page, true);
      await page.waitForFunction(() => document.getElementById('cl11View').hidden);
      check('CL-UNSAVED-CONFIRM-OPENS', await page.evaluate(() => document.getElementById('f_name').value), 'Doji Hana');

      // Loading from the OLD picker also closes the screen (ten retained harnesses rely on it).
      await openList(page);
      await page.evaluate((i) => { document.getElementById('charSelect').value = i; document.getElementById('btnLoad').click(); }, created);
      await page.waitForFunction(() => document.getElementById('cl11View').hidden);
      check('CL-TOOLBAR-LOAD-CLOSES', await page.evaluate(() => document.getElementById('f_name').value), 'Brand New');
      check('CL-NO-PAGE-ERRORS-MENU', page.errors, []);
      await context.close();
    });

    // ---------------------------------------------------------------- import
    await scenario('import', async () => {
      const {context, page} = await fresh(browser);
      const a = await saveAs(page, {f_name: 'Bayushi Kyo', f_clan: 'Scorpion', f_family: 'Bayushi'});
      const aBefore = await stored(page, a);
      const imported = JSON.parse(aBefore);
      imported.fields.f_name = 'Shiba Aki';
      imported.fields.f_clan = 'Phoenix';
      const file = {name: 'shiba.l5r.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(imported))};
      await openList(page);
      await page.locator('#cl11ImportFile').setInputFiles(file);
      await page.waitForFunction(() => document.querySelectorAll('.cl11-row').length === 2);
      const ids1 = (await index(page)).map(c => c.id);
      const newId = ids1.find(x => x !== a);
      check('CL-IMPORT-ADDS', [await storedName(page, newId), await stored(page, a), await picker(page),
        await page.evaluate(() => document.getElementById('f_name').value)], ['Shiba Aki', aBefore, a, 'Bayushi Kyo']);
      // Saves are written in the format the build's own collectData() produces (3 since 4.5.2),
      // which is above SHEET_SCHEMA_VERSION (2); an import must accept it.
      check('CL-IMPORT-CURRENT-FORMAT', [imported.schemaVersion, await page.evaluate(() => window.__L5R_TEST__.SHEET_SCHEMA_VERSION)], [3, 2]);
      check('CL-IMPORT-STATUS', /Imported "Shiba Aki" as a new character/.test(await status(page)));
      await page.locator('#cl11ImportFile').setInputFiles(file);
      await page.waitForFunction(() => document.querySelectorAll('.cl11-row').length === 3);
      const ids2 = (await index(page)).map(c => c.id);
      check('CL-IMPORT-NEVER-OVERWRITES', [ids2.length, new Set(ids2).size, await storedName(page, newId)], [3, 3, 'Shiba Aki']);

      const newer = Object.assign({}, imported, {schemaVersion: 99});
      await page.locator('#cl11ImportFile').setInputFiles({name: 'n.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(newer))});
      await page.waitForFunction(() => document.getElementById('appConfirmOverlay').style.display === 'flex');
      check('CL-IMPORT-NEWER-REFUSED', [/newer version/.test(await page.evaluate(() => document.getElementById('appConfirmMsg').textContent)),
        (await index(page)).length], [true, 3]);
      await page.click('#appConfirmOk');
      await page.locator('#cl11ImportFile').setInputFiles({name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{not json')});
      await page.waitForFunction(() => /not valid JSON/.test(document.getElementById('statusMsg').textContent));
      await page.locator('#cl11ImportFile').setInputFiles({name: 'other.json', mimeType: 'application/json', buffer: Buffer.from('{"hello":1}')});
      await page.waitForFunction(() => /not a character save/.test(document.getElementById('statusMsg').textContent));
      check('CL-IMPORT-INVALID-ADDS-NOTHING', (await index(page)).length, 3);
      check('CL-NO-PAGE-ERRORS-IMPORT', page.errors, []);
      await context.close();
    });

    // ---------------------------------------------------------------- export: download (desktop)
    await scenario('export: download (desktop)', async () => {
      const {context, page} = await fresh(browser);
      const a = await saveAs(page, {f_name: 'Togashi Mei', f_clan: 'Dragon', f_family: 'Togashi'});
      const b = await saveAs(page, {f_name: 'Mirumoto Jin', f_clan: 'Dragon', f_family: 'Mirumoto'});
      await openList(page);
      let dl = page.waitForEvent('download');
      await menuAction(page, a, 'export');
      let d = await dl;
      check('CL-EXPORT-DOWNLOADS', [d.suggestedFilename(), JSON.stringify(JSON.parse(await readDownload(d)))], ['Togashi_Mei.l5r.json', await stored(page, a)]);
      // The OPEN character exports what the sheet shows, including an edit not yet autosaved.
      await page.click('#cl11Back');
      await setField(page, 'f_notes', 'not yet autosaved');
      await openList(page);
      dl = page.waitForEvent('download');
      await menuAction(page, b, 'export');
      d = await dl;
      check('CL-EXPORT-OPEN-USES-SHEET', JSON.parse(await readDownload(d)).fields.f_notes, 'not yet autosaved');
      check('CL-EXPORT-NO-SHARE-ON-DESKTOP', await page.evaluate(() => !!window.__shareCalls), false);
      await context.close();
    });

    // ---------------------------------------------------------------- export: share sheet (touch)
    await scenario('export: share sheet (touch)', async () => {
      const {context, page} = await fresh(browser, {share: true});
      const a = await saveAs(page, {f_name: 'Moto Gan', f_clan: 'Unicorn', f_family: 'Moto'});
      let downloads = 0;
      page.on('download', () => downloads++);
      await openList(page);
      await menuAction(page, a, 'export');
      await page.waitForFunction(() => window.__shareCalls.length === 1);
      const call = (await page.evaluate(() => window.__shareCalls))[0];
      check('CL-SHARE-FILE', [call.name, call.type, JSON.stringify(JSON.parse(call.text)), call.title],
        ['Moto_Gan.l5r.json', 'application/json', await stored(page, a), 'Moto Gan']);
      await page.waitForTimeout(400);
      check('CL-SHARE-NO-DOWNLOAD', downloads, 0);

      await page.evaluate(() => { window.__shareMode = 'abort'; });
      await menuAction(page, a, 'export');
      await page.waitForFunction(() => /Export cancelled/.test(document.getElementById('statusMsg').textContent));
      await page.waitForTimeout(400);
      check('CL-SHARE-CANCEL-NO-DOWNLOAD', downloads, 0);

      await page.evaluate(() => { window.__shareMode = 'deny'; });
      const dl = page.waitForEvent('download');
      await menuAction(page, a, 'export');
      const d = await dl;
      check('CL-SHARE-REFUSED-FALLS-BACK', d.suggestedFilename(), 'Moto_Gan.l5r.json');

      await page.evaluate(() => { window.__shareMode = 'ok'; });
      await page.click('#cl11Back');
      await click(page, '#btnExport');
      await page.waitForFunction(() => window.__shareCalls.length === 4);
      check('CL-TOOLBAR-EXPORT-SHARES', (await page.evaluate(() => window.__shareCalls))[3].name, 'Moto_Gan.l5r.json');
      check('CL-NO-PAGE-ERRORS-SHARE', page.errors, []);
      await context.close();
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
