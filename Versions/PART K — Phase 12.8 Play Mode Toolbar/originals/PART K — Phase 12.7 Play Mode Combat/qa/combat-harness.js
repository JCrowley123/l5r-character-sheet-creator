/*
 * Phase 12.7 (Part K) acceptance: Combat is a Play tab, absent from Management. The input HTML is
 * read only.   node combat-harness.js <sheet.html> [--absent]
 *
 * Oracles are the carousel's own API (getActiveTab, getTabCount, getState, goToTab) and its tab bar,
 * the sheet's collectData() and computed styles; never MODES127 itself. --absent states the
 * expectations for a build where Combat must always show (this part removed or switched off, or
 * Phase 12's parent switch off); defaults never adapt to a missing feature. Every scenario declares
 * its assertion identities first, so an exception fails what it did not reach.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');
const sheet = process.argv[2];
const absent = process.argv.includes('--absent');
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
  const ids = names.map(n => 'PM127-' + prefix + '-' + n);
  const check = (n, a, e = true) => {
    const id = 'PM127-' + prefix + '-' + n;
    if (!ids.includes(id)) throw new Error('undeclared assertion ' + id);
    record(id, a, e);
  };
  let error = '';
  try { await run(check); } catch (e) { error = String(e.stack || e).split('\n').slice(0, 5).join('\n'); }
  for (const id of ids) if (!results.some(r => r.id === id)) record(id, 'not reached', 'completed', error);
}
// Safari reports display:none for everything inside a hidden carousel page; this one test-only
// rule makes Chromium do the same (see BUGFIX — Spell Slots Tab on Safari).
const EMULATE = '.car-page[hidden] *{display:none !important}';
async function fresh(browser, { width = 390, height = 844, emulate = false } = {}) {
  // A phone-width page is a touch page, as on a phone.
  const context = await browser.newContext({ viewport: { width, height }, hasTouch: width < 768 });
  contexts.push(context);
  const page = await context.newPage();
  page.setDefaultTimeout(6000);
  page.errors = [];
  page.on('pageerror', e => page.errors.push(String(e)));
  await page.route('https://fonts.googleapis.com/**', r => r.abort());
  await page.route('https://fonts.gstatic.com/**', r => r.abort());
  if (emulate) await page.addInitScript(css => document.addEventListener('DOMContentLoaded', () => {
    const s = document.createElement('style'); s.id = 'webkitEmulation'; s.textContent = css; document.head.appendChild(s);
  }), EMULATE);
  // Readiness, not an assertion: loading the 3 MB page on a busy machine can outlast the 6 s used
  // for actions, and a timeout here would fail a whole scenario for no reason about Combat.
  await page.goto(pathToFileURL(path.resolve(sheet)).href, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => !!window.__L5R_TEST__?.CL11?.ready && !!window.__L5R_CAROUSEL__?.isReady?.(), null, { timeout: 60000 });
  await page.evaluate(() => window.__L5R_TEST__.CL11?.close());
  await page.waitForTimeout(250);
  return page;
}
const tabs = p => p.evaluate(() => [...document.querySelectorAll('#carTabbarInner [role=tab]')].map(t => t.textContent.trim()));
const active = p => p.evaluate(() => window.__L5R_CAROUSEL__.getActiveTab().label);
const mode = async (p, m) => { await p.evaluate(m => window.__L5R_TEST__.MODES12.set(m), m); await p.waitForTimeout(200); };
// A mode switch, and what the tab bar says in the same task: the switch must take effect at once.
const modeNow = (p, m) => p.evaluate(m => {
  window.__L5R_TEST__.MODES12.set(m);
  return [...document.querySelectorAll('#carTabbarInner [role=tab]')].some(t => t.textContent.trim() === 'Combat');
}, m);
const settle = p => p.evaluate(() => Promise.race([
  window.__L5R_CAROUSEL__.whenSettled ? window.__L5R_CAROUSEL__.whenSettled() : null,
  new Promise(r => setTimeout(r, 2000))]));
const go = async (p, label) => {
  const went = await p.evaluate(l => !!window.__L5R_CAROUSEL__.goToTab(l), label);
  await settle(p); await p.waitForTimeout(100);
  return went ? active(p) : null;
};
const step = async (p, dir) => {
  await p.evaluate(d => d > 0 ? window.__L5R_CAROUSEL__.nextTab() : window.__L5R_CAROUSEL__.prevTab(), dir);
  await settle(p); await p.waitForTimeout(200);
  return active(p);
};
const combatHidden = p => p.evaluate(() => document.querySelector('.car-page[data-tab-label="Combat"]:not([data-clone])').hasAttribute('hidden'));
const data = p => p.evaluate(() => window.__L5R_TEST__.collectData());
const confirmAll = async p => { for (let i = 0; i < 3; i++) { await p.waitForTimeout(150); await p.evaluate(() => {
  const o = document.getElementById('appConfirmOverlay'); if (o && o.style.display === 'flex') document.getElementById('appConfirmOk').click(); }); } };
async function applySchool(p, clan, school) {
  await p.selectOption('#cfs_clan', clan); await p.waitForTimeout(80);
  const v = await p.evaluate(s => [...document.getElementById('cfs_school').options].map(o => o.value).find(v => v.includes(s)), school);
  await p.selectOption('#cfs_school', v); await p.click('#cfs_applySchool'); await p.waitForTimeout(150);
  await p.evaluate(() => { const b = document.getElementById('affinityPick_Void'); if (b && b.offsetParent !== null) { b.click(); document.getElementById('affinityPickConfirm').click(); } });
  await confirmAll(p); await p.waitForTimeout(150);
}
// Management hides Combat; an --absent build never does.
const inMgmt = shown => absent ? true : shown;

async function main() {
  if (!sheet || !fs.existsSync(sheet)) throw new Error('usage: node combat-harness.js <sheet.html> [--absent]');
  const browser = await chromium.launch();
  try {
    await scenario('START', ['MODE', 'TAB', 'REACHABLE', 'PAGE-HIDDEN', 'COUNT', 'SWIPE', 'NO-ERRORS'], async check => {
      const p = await fresh(browser);
      check('MODE', await p.evaluate(() => window.__L5R_TEST__.MODES12.mode), 'management');
      check('TAB', (await tabs(p)).includes('Combat'), inMgmt(false));
      check('REACHABLE', await go(p, 'Combat'), absent ? 'Combat' : null);
      check('PAGE-HIDDEN', await combatHidden(p), !absent);
      check('COUNT', await p.evaluate(() => window.__L5R_CAROUSEL__.getTabCount()), absent ? 9 : 8);
      await go(p, 'Techniques');
      check('SWIPE', await step(p, 1), absent ? 'Combat' : 'Equipment');
      check('NO-ERRORS', p.errors, []);
    });

    await scenario('PLAY', ['SYNC-SHOW', 'STAYS', 'ORDER', 'TAP', 'CONTROL', 'NOTHING-LOCKED', 'NO-ERRORS'], async check => {
      const p = await fresh(browser);
      await go(p, 'Skills');
      check('SYNC-SHOW', await modeNow(p, 'play'), true);
      await settle(p); await p.waitForTimeout(150);
      check('STAYS', await active(p), 'Skills');
      const t = await tabs(p);
      check('ORDER', [t.indexOf('Combat') === t.indexOf('Techniques') + 1, t.indexOf('Combat') === t.indexOf('Equipment') - 1], [true, true]);
      await p.locator('.car-tab', { hasText: 'Combat' }).first().tap();
      await settle(p); await p.waitForTimeout(150);
      check('TAP', await active(p), 'Combat');
      await p.locator('#combatActiveToggle').click();
      check('CONTROL', await p.evaluate(() => document.getElementById('isCombatActive').value), '1');
      check('NOTHING-LOCKED', await p.evaluate(() => document.querySelectorAll('.car-page[data-tab-label="Combat"]:not([data-clone]) [data-pm12-locked]').length), 0);
      check('NO-ERRORS', p.errors, []);
    });

    await scenario('LEAVE', ['SYNC-HIDE', 'LANDS', 'TAB', 'STATE-KEPT', 'BACK-STAYS', 'BACK-SHOWN', 'NO-ERRORS'], async check => {
      const p = await fresh(browser);
      await mode(p, 'play'); await go(p, 'Combat');
      await p.locator('#combatActiveToggle').click();
      const before = await p.evaluate(() => [document.getElementById('isCombatActive').value, document.getElementById('combatStance').value]);
      check('SYNC-HIDE', await modeNow(p, 'management'), inMgmt(false));
      // Sampled for half a second: the landing must hold, not glide past and come back.
      const seen = await p.evaluate(async () => { const out = [];
        for (const ms of [0, 60, 120, 250, 500]) { await new Promise(r => setTimeout(r, ms)); out.push(window.__L5R_CAROUSEL__.getActiveTab().label); }
        return out; });
      check('LANDS', seen, Array(5).fill(absent ? 'Combat' : 'Equipment'));
      check('TAB', (await tabs(p)).includes('Combat'), inMgmt(false));
      check('STATE-KEPT', await p.evaluate(() => [document.getElementById('isCombatActive').value, document.getElementById('combatStance').value]), before);
      await mode(p, 'play');
      check('BACK-STAYS', await active(p), absent ? 'Combat' : 'Equipment');
      check('BACK-SHOWN', (await tabs(p)).includes('Combat'), true);
      check('NO-ERRORS', p.errors, []);
    });

    await scenario('REPEAT', ['LANDINGS', 'DATA-UNCHANGED', 'NO-DUPLICATE-TABS', 'CLONES-STABLE', 'NO-ERRORS'], async check => {
      const p = await fresh(browser);
      await mode(p, 'play'); await go(p, 'Combat');
      const before = await data(p);
      const clones = await p.evaluate(() => window.__L5R_CAROUSEL__.getState().clones);
      const landings = []; let duplicates = 0;
      for (let i = 0; i < 5; i++) {
        await mode(p, 'management'); landings.push(await active(p));
        duplicates += (await tabs(p)).filter(t => t === 'Combat').length > 1 ? 1 : 0;
        await mode(p, 'play'); await go(p, 'Combat');
        duplicates += (await tabs(p)).filter(t => t === 'Combat').length > 1 ? 1 : 0;
      }
      check('LANDINGS', landings, Array(5).fill(absent ? 'Combat' : 'Equipment'));
      check('DATA-UNCHANGED', await data(p), before);
      check('NO-DUPLICATE-TABS', duplicates, 0);
      check('CLONES-STABLE', await p.evaluate(() => window.__L5R_CAROUSEL__.getState().clones), clones);
      check('NO-ERRORS', p.errors, []);
    });

    await scenario('LOOP', ['WRAP-MGMT', 'BACK-MGMT', 'WRAP-PLAY', 'BACK-PLAY', 'CLONES-CLEAN', 'NO-ERRORS'], async check => {
      const p = await fresh(browser);
      await go(p, 'Background');
      check('WRAP-MGMT', await step(p, 1), 'Clan & School');
      check('BACK-MGMT', await step(p, -1), 'Background');
      await mode(p, 'play');
      check('WRAP-PLAY', await step(p, 1), 'Clan & School');
      check('BACK-PLAY', await step(p, -1), 'Background');
      check('CLONES-CLEAN', await p.evaluate(() => document.querySelectorAll('.car-page[data-clone][data-visible-with], [data-clone] #pm127CombatShown').length), 0);
      check('NO-ERRORS', p.errors, []);
    });

    for (const emulate of [false, true]) {
      const prefix = emulate ? 'SPELL-EMU' : 'SPELL';
      await scenario(prefix, ['MGMT', 'PLAY-ORDER', 'STAYS-ON-SLOTS', 'MGMT-AGAIN', 'NO-ERRORS'], async check => {
        const p = await fresh(browser, { emulate });
        await applySchool(p, 'Phoenix', 'Isawa Shugenja');
        let t = await tabs(p);
        check('MGMT', [t.includes('Spell Slots'), t.includes('Combat')], [true, inMgmt(false)]);
        await mode(p, 'play'); t = await tabs(p);
        check('PLAY-ORDER', [t.includes('Spell Slots'), t.indexOf('Spell Slots') + 1 === t.indexOf('Combat')], [true, true]);
        await go(p, 'Spell Slots'); await mode(p, 'management');
        check('STAYS-ON-SLOTS', await active(p), 'Spell Slots');
        await mode(p, 'play'); await mode(p, 'management'); t = await tabs(p);
        check('MGMT-AGAIN', [t.includes('Spell Slots'), t.includes('Combat')], [true, inMgmt(false)]);
        check('NO-ERRORS', p.errors, []);
      });
    }

    await scenario('OPEN', ['SAVED', 'LIST-OPEN-SHOWS', 'LIST-OPEN-DATA', 'TOOLBAR-NEW', 'NO-ERRORS'], async check => {
      const p = await fresh(browser);
      await p.fill('#f_name', 'Combat visibility acceptance');
      await p.locator('#btnSaveAs').click();
      await p.waitForFunction(() => !!document.getElementById('charSelect').value);
      const id = await p.locator('#charSelect').inputValue();
      check('SAVED', /^c_/.test(id));
      const saved = await data(p);
      await p.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
      await p.waitForFunction(() => !!window.__L5R_TEST__?.CL11?.ready, null, { timeout: 60000 });
      await p.waitForSelector('.cl11-row[data-id="' + id + '"] .cl11-open', { state: 'visible' });
      await p.locator('.cl11-row[data-id="' + id + '"] .cl11-open').click();
      await p.waitForTimeout(400);
      check('LIST-OPEN-SHOWS', (await tabs(p)).includes('Combat'), true);
      check('LIST-OPEN-DATA', (await data(p)).fields.f_name, saved.fields.f_name);
      await p.locator('#btnNew').click(); await confirmAll(p); await p.waitForTimeout(200);
      check('TOOLBAR-NEW', (await tabs(p)).includes('Combat'), inMgmt(false));
      check('NO-ERRORS', p.errors, []);
    });

    await scenario('PRINT', ['MGMT-COMBAT', 'SPELL-UNCHANGED', 'PLAY-COMBAT', 'SCREEN-AFTER', 'NO-ERRORS'], async check => {
      const p = await fresh(browser);
      const display = sel => p.evaluate(s => getComputedStyle(document.querySelector(s)).display, sel);
      await p.emulateMedia({ media: 'print' });
      check('MGMT-COMBAT', await display('.car-page[data-tab-label="Combat"]:not([data-clone])'), 'block');
      check('SPELL-UNCHANGED', await display('.car-page[data-tab-label="Spell Slots"]:not([data-clone])'), 'none');
      await p.emulateMedia({ media: 'screen' }); await mode(p, 'play'); await p.emulateMedia({ media: 'print' });
      check('PLAY-COMBAT', await display('.car-page[data-tab-label="Combat"]:not([data-clone])'), 'block');
      await p.emulateMedia({ media: 'screen' }); await mode(p, 'management');
      check('SCREEN-AFTER', await display('.car-page[data-tab-label="Combat"]:not([data-clone])'), absent ? 'block' : 'none');
      check('NO-ERRORS', p.errors, []);
    });

    await scenario('DESKTOP', ['MGMT', 'PLAY', 'NO-ERRORS'], async check => {
      const p = await fresh(browser, { width: 1280, height: 900 });
      check('MGMT', (await tabs(p)).includes('Combat'), inMgmt(false));
      await mode(p, 'play');
      check('PLAY', await go(p, 'Combat'), 'Combat');
      check('NO-ERRORS', p.errors, []);
    });
  } finally { for (const context of contexts) await context.close(); await browser.close(); }
  const passed = results.filter(r => r.pass).length;
  console.log('\n' + passed + '/' + results.length + ' checks passed');
  console.log('ASSERTION_IDS ' + JSON.stringify(results.map(r => r.id)));
  console.log('FAILED_IDS ' + JSON.stringify(results.filter(r => !r.pass).map(r => r.id)));
  process.exitCode = !results.length || passed !== results.length ? 1 : 0;
}
main().catch(e => { console.error(e); process.exitCode = 1; });
