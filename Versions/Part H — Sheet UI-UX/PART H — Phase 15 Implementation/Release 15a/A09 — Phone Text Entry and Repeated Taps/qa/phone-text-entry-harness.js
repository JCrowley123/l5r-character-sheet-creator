'use strict';
// Release 15a, finding A09 (FT-49, PART H PHASE 15.1.24): phone text entry and repeated taps (owner's approval of the
// mock-up, 12 November 2026).   node phone-text-entry-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL.
// Oracles are independent of the layer: the computed size of every editable box, the same boxes with the unit's body
// class taken away (put back only if it was there), the page widths, the saved character after two quick taps, and
// the viewport meta as shipped. The character is this folder's copy of the audit's dense test character.
// Chromium cannot show iPhone Safari's focus zoom or double-tap zoom; those are the owner's device checks. These checks
// prove the conditions Safari reacts to: box text at least 16 px, and buttons that take a second tap as a press.
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./expected-checks.json');
const DENSE = require('./dense-fixture.json');
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
const DEVICES = {
  PHONE: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true},
  // Wider than 768 px: only the touch-screen half of the rule applies (an iPad held sideways).
  TABLET: {viewport: {width: 1024, height: 768}, isMobile: true, hasTouch: true},
  DESKTOP: {viewport: {width: 1440, height: 1000}}
};
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const goTab = async (page, tab) => { await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; if (C) { C.goToTab(l); await C.whenSettled(); } }, tab); await settle(page); };
const SHIPPED_VIEWPORT = 'width=device-width, initial-scale=1.0';

function install() {
  const H = {};
  const EDITABLE = 'input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=file]):not([type=hidden]):not([type=button]):not([type=submit]):not([type=reset]):not([type=color]):not([type=image]), textarea, select';
  const drawn = e => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden';
  const label = e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/)[0] : '');
  H.boxes = (scope, onlyDrawn) => [...(scope || document).querySelectorAll(EDITABLE)].filter(e => !onlyDrawn || drawn(e))
    .map(e => ({label: label(e), ring: /^ring_/.test(e.id), size: parseFloat(getComputedStyle(e).fontSize)}));
  // The same boxes with this unit's class away; it is put back only if it was there.
  H.off = (scope, onlyDrawn) => { const b = document.body, had = b.classList.contains('tx15-on'); b.classList.remove('tx15-on');
    const r = H.boxes(scope, onlyDrawn); if (had) b.classList.add('tx15-on'); return r; };
  // The page on screen, as the carousel reports it (a page that still holds focus is not inert, so ':not([inert])'
  // could name the page just left).
  H.page = () => window.__L5R_CAROUSEL__.getActiveTab().panel;
  H.overflow = () => { const p = H.page(); const card = e => e.closest('.entry, tr, .card, .section, .field') || p;
    const out = [...p.querySelectorAll(EDITABLE)].filter(drawn).filter(e => { const a = e.getBoundingClientRect(), c = card(e).getBoundingClientRect(); return a.right > c.right + 1 || a.left < c.left - 1; }).map(label);
    return {page: p.scrollWidth > p.clientWidth + 1, doc: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1, boxes: out}; };
  H.touch = sel => [...document.querySelectorAll(sel)].map(e => getComputedStyle(e).touchAction);
  H.load = mode => { const T = window.__L5R_TEST__; T.applyData(JSON.parse(JSON.stringify(window.__TXH_DENSE__))); T.MODES12.set(mode || 'management'); };
  window.TXH = H;
}

async function open(browser, opts) {
  const context = await browser.newContext(opts);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('dialog', d => d.accept().catch(() => {}));
  await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready);
  await page.waitForFunction(() => !document.getElementById('l5rSplash'));
  await page.evaluate(() => { try { window.__L5R_TEST__.CL11.close(); } catch (e) {} });
  await page.evaluate(d => { window.__TXH_DENSE__ = d; }, DENSE);
  await page.evaluate(install);
  return {context, page, errors};
}

(async () => {
  const browser = await chromium.launch();
  try {
    for (const [D, opts] of Object.entries(DEVICES)) {
      const {context, page, errors} = await open(browser, opts);
      const load = async mode => { await page.evaluate(m => window.TXH.load(m), mode || 'management'); await settle(page); };
      const tabs = () => page.evaluate(() => window.__L5R_CAROUSEL__.getTabs().map(t => t.label));
      const everyPage = async fn => { const out = {}; for (const t of await tabs()) { await goTab(page, t); out[t] = await fn(t); } return out; };

      await check('TX-SEAM-' + D, async () => {
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__; return {on: T.PHONE_TEXT_ENTRY_ENABLED, api: !!(T.TX15 && T.TX15.installed), cls: document.body.classList.contains('tx15-on')}; });
        return [r.on === true && r.api && r.cls, r];
      });
      await load();
      const named = await page.evaluate(() => document.getElementById('f_name').value);
      if (named !== 'Phase 15 dense audit') set('TX-SEAM-' + D, false, 'dense character did not load: ' + named);

      if (D === 'DESKTOP') {
        // A laptop with a mouse: nothing changes.
        await check('TX-UNCHANGED-DESKTOP', async () => {
          const on = await page.evaluate(() => window.TXH.boxes(null, false)), off = await page.evaluate(() => window.TXH.off(null, false));
          const diff = on.filter((b, i) => b.size !== off[i].size).map(b => b.label);
          return [on.length > 100 && on.length === off.length && diff.length === 0 && off.some(b => b.size < 16), {n: on.length, diff: diff.slice(0, 8)}];
        });
        await check('TX-BUTTONS-DESKTOP', async () => { const t = await page.evaluate(() => window.TXH.touch('button'));
          return [t.length > 100 && t.every(x => x === 'auto'), [...new Set(t)]]; });
        await check('TX-NO-ERRORS-DESKTOP', async () => [errors.length === 0, errors]);
        await context.close();
        continue;
      }

      // ---- Phone and touch tablet ----
      const pages = await everyPage(() => page.evaluate(() => window.TXH.boxes(window.TXH.page(), true)));
      await check('TX-PAGES-16-' + D, async () => {
        const small = Object.entries(pages).flatMap(([t, bs]) => bs.filter(b => b.size < 16).map(b => t + ': ' + b.label + ' ' + b.size));
        const count = Object.values(pages).reduce((n, bs) => n + bs.length, 0);
        return [count >= 60 && Object.keys(pages).length >= 8 && small.length === 0, {count, pages: Object.keys(pages).length, small: small.slice(0, 10)}];
      });
      await check('TX-BUTTONS-' + D, async () => { const t = await page.evaluate(() => window.TXH.touch('button'));
        return [t.length > 100 && t.every(x => x === 'manipulation'), [...new Set(t)]]; });

      if (D === 'PHONE') {
        await check('TX-VIEWPORT-PHONE', async () => { const v = await page.evaluate(() => [...document.querySelectorAll('meta[name=viewport]')].map(m => m.content));
          return [v.length === 1 && v[0] === SHIPPED_VIEWPORT, v]; });
        // Every box in the document, drawn or not (rows on other pages, the Void damage box, the hidden topbar picker).
        const all = await page.evaluate(() => window.TXH.boxes(null, false)), off = await page.evaluate(() => window.TXH.off(null, false));
        await check('TX-EVERY-BOX-16-PHONE', async () => { const small = all.filter(b => b.size < 16).map(b => b.label + ' ' + b.size);
          return [all.length > 100 && small.length === 0, {n: all.length, small: small.slice(0, 10)}]; });
        await check('TX-NONE-SMALLER-PHONE', async () => {
          const smaller = all.filter((b, i) => b.size < off[i].size).map(b => b.label);
          const rings = all.filter(b => b.ring);
          return [all.length === off.length && smaller.length === 0 && rings.length === 5 && rings.every((b, i) => b.size === off.filter(o => o.ring)[i].size && b.size > 16), {smaller, rings: rings.map(b => b.size)}];
        });
        // Without the class the boxes the owner types in are small again: the unit is what makes them 16 px.
        await check('TX-CLASS-OFF-PHONE', async () => {
          const by = (list, re) => list.filter(b => re.test(b.label)).map(b => b.size);
          const want = [/\.ce7-edit/, /\.sk-name/, /\.sk-rank/, /\.en-desc/, /#wm7-picker/, /#f_notes/];
          const offs = want.map(re => by(off, re)), ons = want.map(re => by(all, re));
          return [offs.every(s => s.length > 0 && s.every(x => x < 16)) && ons.every(s => s.length > 0 && s.every(x => x === 16)) && (await page.evaluate(() => document.body.classList.contains('tx15-on'))),
            want.map((re, i) => [String(re), offs[i].slice(0, 2), ons[i].slice(0, 2)])];
        });
        await check('TX-NO-OVERFLOW-PHONE', async () => { const o = await everyPage(() => page.evaluate(() => window.TXH.overflow()));
          const bad = Object.entries(o).filter(([, v]) => v.page || v.doc || v.boxes.length);
          return [bad.length === 0, bad.slice(0, 4)]; });
        // Pinch and double-tap zoom stay on the page, its text and its boxes; only buttons are changed.
        await check('TX-ZOOM-KEPT-PHONE', async () => {
          const t = await page.evaluate(() => ({html: getComputedStyle(document.documentElement).touchAction, body: getComputedStyle(document.body).touchAction,
            pages: window.TXH.touch('.car-page'), boxes: window.TXH.touch('input:not([type=button]):not([type=submit]):not([type=reset]), textarea, select'), labels: window.TXH.touch('label'), text: window.TXH.touch('p, h2, h3, .hint')}));
          const ok = t.html === 'auto' && t.body === 'auto' && [t.pages, t.boxes, t.labels, t.text].every(a => a.length > 0 && a.every(x => x === 'auto'));
          return [ok, {html: t.html, body: t.body, pages: [...new Set(t.pages)], boxes: [...new Set(t.boxes)], labels: [...new Set(t.labels)], text: [...new Set(t.text)]}];
        });
        // Two quick taps on Add Honour points are two presses: the saved Honour rises by two steps of one point.
        await check('TX-STEPPER-TWICE-PHONE', async () => {
          await goTab(page, 'Identity');
          const read = () => page.evaluate(() => { const f = window.__L5R_TEST__.collectData().fields; return {rank: Number(f.f_honorRank), pts: Number(f.f_honorPts)}; });
          const plus = page.getByRole('button', {name: 'Add Honour points', exact: true});
          await plus.scrollIntoViewIfNeeded(); await settle(page);
          const before = await read();
          const box = await plus.boundingBox(), x = box.x + box.width / 2, y = box.y + box.height / 2;
          await page.touchscreen.tap(x, y); await page.waitForTimeout(90); await page.touchscreen.tap(x, y); await page.waitForTimeout(300);
          const after = await read();
          return [after.rank * 10 + after.pts === before.rank * 10 + before.pts + 2, {before, after}];
        });
        await check('TX-PLAY-PHONE', async () => {
          await load('play');
          const p = await everyPage(() => page.evaluate(() => ({boxes: window.TXH.boxes(window.TXH.page(), true), over: window.TXH.overflow()})));
          await load();
          const small = Object.entries(p).flatMap(([t, v]) => v.boxes.filter(b => b.size < 16).map(b => t + ': ' + b.label));
          const over = Object.entries(p).filter(([, v]) => v.over.page || v.over.doc).map(([t]) => t);
          return [small.length === 0 && over.length === 0 && Object.values(p).reduce((n, v) => n + v.boxes.length, 0) > 20, {small: small.slice(0, 6), over}];
        });
      }
      await check('TX-NO-ERRORS-' + D, async () => [errors.length === 0, errors]);
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
