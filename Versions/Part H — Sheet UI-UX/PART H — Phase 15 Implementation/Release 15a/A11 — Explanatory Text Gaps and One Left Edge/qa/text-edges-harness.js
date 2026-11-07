'use strict';
// Release 15a, A11 (PART H PHASE 15.1.11): explanatory text gaps and one left edge (FT-51; owner's additions of
// 7 November 2026; approved as mocked up).   node text-edges-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL. Oracles are
// independent of the layer: where each line's text actually starts (a text range's box, or a field's border plus
// padding), the card's own content edge, the Identity tab's own text field, and the same page with the layer's body
// class taken away.
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./expected-checks.json');
const sheet = path.resolve(process.argv[2]);
const FIX = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'g2-fixtures.json'), 'utf8'));
const seen = {};
const set = (id, ok, detail) => {
  seen[id] = ok === true && seen[id] !== false;
  if (ok !== true) console.log('  detail ' + id + ': ' + JSON.stringify(detail === undefined ? ok : detail).slice(0, 900));
};
async function check(id, body) {
  try { const [ok, detail] = await body(); set(id, ok, detail); }
  catch (e) { set(id, false, 'exception: ' + String(e && e.message || e).slice(0, 500)); }
}
const DEVICES = {PHONE: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}, DESKTOP: {viewport: {width: 1440, height: 1000}}};
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const goTab = async (page, tab) => { await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; if (C) { C.goToTab(l); await C.whenSettled(); } }, tab); await settle(page); };
const CONDITIONS = ['Missing Limb', 'Lost Love', 'Contrary', 'Rumormonger', 'Soft-Hearted', 'Blissful Betrothal'];
// Where each card's name, description and plain explanatory lines start, relative to the card's content edge.
function cardEdges() {
  const vis = e => { const s = getComputedStyle(e), b = e.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && b.width > 0 && b.height > 0; };
  const fieldX = e => { const s = getComputedStyle(e); return e.getBoundingClientRect().left + parseFloat(s.borderLeftWidth) + parseFloat(s.paddingLeft); };
  // A line that opens with generated text (A07's "Severity" label) starts where that label starts: its first line box.
  const textX = e => { const pre = getComputedStyle(e, '::before').content; if (pre && pre !== 'none' && pre !== 'normal') { const f = e.getClientRects()[0]; return f ? f.left : null; }
    const n = [...e.childNodes].find(n => n.nodeType === 3 && n.textContent.trim()); if (!n) return null;
    const r = document.createRange(); r.selectNodeContents(n); const b = r.getClientRects()[0]; return b ? b.left : null; };
  const LINES = '.adv-config-summary:not([class*="badge"]), .adv-config-warn, .chk4531-note, .dsx4532-note, .vi4533-note, .sr7-flag';
  return [...document.querySelectorAll('#advList .entry, #disadvList .entry')].filter(vis).map(d => {
    const s = getComputedStyle(d), edge = d.getBoundingClientRect().left + parseFloat(s.borderLeftWidth) + parseFloat(s.paddingLeft);
    const name = d.querySelector('.en-name'), desc = d.querySelector('.en-desc');
    // A line counts only where it starts a visual line: nothing visible before it in its parent on the same line.
    const first = e => { const r = e.getBoundingClientRect(); let p = e.previousElementSibling;
      for (; p; p = p.previousElementSibling) { if (!vis(p)) continue; const q = p.getBoundingClientRect(); if (q.bottom > r.top + 2 && q.top < r.bottom - 2) return false; }
      return true; };
    const lines = [...d.querySelectorAll(LINES)].filter(e => vis(e) && first(e)).map(textX).filter(x => x !== null);
    return {name: name.value.trim(), edge, nameX: fieldX(name), descX: desc && vis(desc) && desc.value.trim() ? fieldX(desc) : null, lines,
      namePad: getComputedStyle(name).paddingLeft, nameBorder: getComputedStyle(name).borderLeftWidth};
  });
}
function hints() {
  const out = {};
  for (const h of document.querySelectorAll('.section > .hint')) {
    const t = h.textContent.trim(), key = /^Insight =/.test(t) ? 'insight' : /^Spent XP is/.test(t) ? 'spent' : null;
    const prev = h.previousElementSibling, fields = prev ? [...prev.querySelectorAll('input')].filter(i => i.getBoundingClientRect().height > 0) : [];
    const low = fields.reduce((m, i) => Math.max(m, i.getBoundingClientRect().bottom), -1e9), s = getComputedStyle(h);
    const rec = {mt: s.marginTop, lh: parseFloat(s.lineHeight) / parseFloat(s.fontSize), gap: h.getBoundingClientRect().top - low, text: t.slice(0, 30)};
    if (key) out[key] = rec; else (out.others = out.others || []).push(rec);
  }
  return out;
}
async function open(browser, opts) {
  const context = await browser.newContext(opts);
  await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready);
  await page.waitForFunction(() => !document.getElementById('l5rSplash'));
  await page.evaluate(d => { const T = window.__L5R_TEST__; try { T.CL11.close(); } catch (e) {} T.applyData(d); document.getElementById('f_clan').value = 'Crane'; T.recalcAll();
    T.MODES12.set('management'); }, FIX.dense);
  return {context, page, errors};
}
const toggle = (page, on) => page.evaluate(on => { document.body.classList.toggle('te15-on', on); }, on);

(async () => {
  const browser = await chromium.launch();
  try {
    for (const [D, opts] of Object.entries(DEVICES)) {
      const {context, page, errors} = await open(browser, opts);
      await check('TE-SEAM-' + D, async () => {
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__; return {on: T.TEXT_EDGES_ENABLED, api: !!(T.TE15 && T.TE15.installed), cls: document.body.classList.contains('te15-on')}; });
        return [r.on === true && r.api && r.cls, r];
      });
      await goTab(page, 'Adv & Disadv');
      await page.evaluate(() => window.__L5R_TEST__.MODES12.set('play')); await goTab(page, 'Adv & Disadv');
      const play = await page.evaluate(cardEdges);
      await check('TE-PLAY-ONE-EDGE-' + D, async () => {
        const off = play.map(c => ({name: c.name, d: [c.nameX, c.descX, ...c.lines].filter(x => x !== null).map(x => Math.round((x - c.edge) * 10) / 10)}))
          .filter(c => c.d.some(x => Math.abs(x) > 1));
        const withLines = play.filter(c => c.lines.length && c.descX !== null).length;
        return [play.length >= 15 && withLines >= 8 && off.length === 0, {cards: play.length, withLines, off: off.slice(0, 6)}];
      });
      await check('TE-PLAY-WAS-OFF-WITHOUT-THE-LAYER-' + D, async () => {
        await toggle(page, false); await settle(page);
        const before = await page.evaluate(cardEdges); await toggle(page, true); await settle(page);
        const moved = before.filter(c => c.nameX - c.edge > 5).length;
        return [moved === before.length && before.length >= 15, {moved, of: before.length}];
      });
      await check('TE-PLAY-TEXT-KEPT-' + D, async () => {
        const r = await page.evaluate(() => [...document.querySelectorAll('#advList .entry .en-desc, #disadvList .entry .en-desc')].filter(t => t.offsetParent && t.value.trim())
          .map(t => ({over: t.scrollWidth - t.clientWidth, w: t.clientWidth})));
        return [r.length >= 10 && r.every(x => x.over <= 1 && x.w > 150), r.slice(0, 4)];
      });
      await page.evaluate(() => window.__L5R_TEST__.MODES12.set('management')); await goTab(page, 'Adv & Disadv');
      await check('TE-MANAGE-UNCHANGED-' + D, async () => {
        const m = await page.evaluate(cardEdges);
        const ref = await page.evaluate(() => { const i = document.getElementById('f_name'), s = getComputedStyle(i); return {pad: s.paddingLeft, border: s.borderLeftWidth}; });
        return [m.length >= 15 && m.every(c => c.namePad === ref.pad && c.nameBorder === ref.border && c.nameX - c.edge > 5), {ref, first: m.slice(0, 3)}];
      });
      await check('TE-CONDITION-GAP-' + D, async () => {
        const r = await page.evaluate(names => names.map(n => { const d = [...document.querySelectorAll('#advList .entry, #disadvList .entry')].find(x => x.querySelector('.en-name').value.trim() === n);
          if (!d) return {n, missing: true}; const row = d.querySelector('.chk4531-row, .dsx4532-row'), desc = d.querySelector('.en-desc');
          return {n, gap: desc.getBoundingClientRect().top - row.getBoundingClientRect().bottom}; }), CONDITIONS);
        return [r.every(x => !x.missing && x.gap >= 5.5 && x.gap <= 8), r];
      });
      await goTab(page, 'Identity');
      const h = await page.evaluate(hints);
      await check('TE-HINT-GAP-' + D, async () => {
        const want = D === 'DESKTOP' ? '6px' : '14px';
        return [['insight', 'spent'].every(k => h[k] && h[k].mt === want && h[k].gap >= 5.5), h];
      });
      await check('TE-HINT-LINE-HEIGHT-' + D, async () => [['insight', 'spent'].every(k => h[k] && Math.abs(h[k].lh - 1.5) < 0.01), h]);
      await check('TE-OTHER-HINTS-UNCHANGED-' + D, async () => {
        await toggle(page, false); await settle(page);
        const without = await page.evaluate(hints); await toggle(page, true); await settle(page);
        const a = JSON.stringify((h.others || []).map(x => [x.mt, x.lh])), b = JSON.stringify((without.others || []).map(x => [x.mt, x.lh]));
        return [a === b && (h.others || []).length > 0 && (without.insight.mt !== h.insight.mt || D === 'PHONE'), {a, b}];
      });
      await check('TE-CLASS-GATES-' + D, async () => {
        await goTab(page, 'Adv & Disadv');
        const r = await page.evaluate(() => { window.__L5R_TEST__.MODES12.set('play'); const b = document.body, had = b.classList.contains('te15-on'); b.classList.remove('te15-on');
          const n = document.querySelector('#advList .entry .en-name'), pad = getComputedStyle(n).paddingLeft; if (had) b.classList.add('te15-on');
          const padOn = getComputedStyle(n).paddingLeft; window.__L5R_TEST__.MODES12.set('management'); return {had, pad, padOn, back: b.classList.contains('te15-on')}; });
        return [r.had && parseFloat(r.pad) > 5 && r.padOn === '0px' && r.back, r];
      });
      await check('TE-NO-ERRORS-' + D, async () => [errors.length === 0, errors]);
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
