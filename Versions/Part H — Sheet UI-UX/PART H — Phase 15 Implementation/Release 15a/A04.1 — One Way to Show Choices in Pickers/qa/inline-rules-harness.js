'use strict';
// Release 15a, A04.1 (PART H PHASE 15.1.4.1): each picker option's rule inline, in Paragon's option card (owner's
// comment 2 at G1's review; approved as mocked up, 7 November 2026).   node inline-rules-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL, and every
// check that opens a window closes it, even when it fails. Oracles are independent of the layer: each option's own
// disclosure text (still in the DOM, not drawn), Paragon's own option card, the saved configuration, the row's own i,
// and the same page with the layer's body class taken away.
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
const PICKERS = [['adv', 'Seven Fortunes’ Blessing', 7, 'BLESSING'], ['disadv', 'Consumed', 7, 'CONSUMED'], ['disadv', 'Failure of Bushido', 7, 'FAILURE'],
  ['disadv', 'Cursed by the Realm', 10, 'REALM'], ['disadv', 'Seven Fortunes’ Curse', 7, 'CURSE']];
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const goTab = async (page, tab) => { await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; if (C) { C.goToTab(l); await C.whenSettled(); } }, tab); await settle(page); };
const closeAll = page => page.evaluate(() => { for (const id of ['advConfigModalOverlay', 'stanceInfoOverlay']) { const o = document.getElementById(id); if (o) o.style.display = 'none'; } });
async function openPicker(page, kind, name) {
  await closeAll(page);
  await page.evaluate(([k, n]) => { const s = document.getElementById(k + 'QuickAdd'); s.value = n; s.dispatchEvent(new Event('change', {bubbles: true})); }, [kind, name]);
  await page.waitForSelector('#advConfigModalOverlay', {state: 'visible'}); await settle(page);
}
// Each option in the open window: its own disclosure's text (the oracle), the inline rule, what is drawn, its card.
function options() {
  const shown = e => !!e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden';
  return [...document.querySelectorAll('#advConfigGrid .fb4521-item, #advConfigGrid .d45-option')].map(item => {
    const det = item.querySelector(':scope > details'), label = item.querySelector(':scope > label'), first = label.querySelector(':scope > span');
    const rule = item.querySelector('.ir15-rule'), s = getComputedStyle(item), l = getComputedStyle(label);
    return {oracle: det ? (det.querySelector(':scope > span') || det).textContent.trim() : null, inline: rule ? rule.textContent : null,
      detShown: shown(det), infoShown: [...item.querySelectorAll('.adv-config-info')].some(shown), first: first ? first.textContent : '', bold: !!(first && first.querySelector('b')),
      inner: [label, ...label.querySelectorAll('*')].filter(e => parseFloat(getComputedStyle(e).borderTopWidth) > 0 || parseFloat(getComputedStyle(e).borderLeftWidth) > 0).map(e => e.tagName + '.' + e.className),
      card: {border: s.borderTopWidth + ' ' + s.borderTopStyle, radius: s.borderTopLeftRadius, pad: s.paddingTop + ' ' + s.paddingLeft, font: l.fontSize, lh: l.lineHeight, family: l.fontFamily, align: l.textAlign, transform: l.textTransform}};
  });
}
function paragonCard() {
  const o = document.querySelector('#advConfigGrid .p4518-option'), s = getComputedStyle(o);
  return {border: s.borderTopWidth + ' ' + s.borderTopStyle, radius: s.borderTopLeftRadius, pad: s.paddingTop + ' ' + s.paddingLeft, font: s.fontSize, lh: s.lineHeight, family: s.fontFamily, align: s.textAlign, transform: s.textTransform};
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
    T.MODES12.set('management');
    for (const x of [...document.querySelectorAll('#advList .entry, #disadvList .entry')]) if (/Seven Fortunes|Paragon|Consumed|Failure of Bushido|Cursed by the Realm/.test(x.querySelector('.en-name').value)) x.remove();
    T.recalcAll(); }, FIX.dense);
  await goTab(page, 'Adv & Disadv');
  return {context, page, errors};
}
const lastRow = (page, list, name) => page.evaluate(([l, n]) => { const d = [...document.querySelectorAll('#' + l + ' .entry')].filter(x => x.querySelector('.en-name').value.trim() === n).pop();
  return d ? {config: d.dataset.advConfig || ''} : null; }, [list, name]);

(async () => {
  const browser = await chromium.launch();
  try {
    for (const [D, opts] of Object.entries(DEVICES)) {
      const {context, page, errors} = await open(browser, opts);
      await check('IR-SEAM-' + D, async () => {
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__; return {on: T.INLINE_RULES_ENABLED, api: !!(T.IR15 && T.IR15.installed), cls: document.body.classList.contains('ir15-on')}; });
        return [r.on === true && r.api && r.cls, r];
      });
      await openPicker(page, 'adv', 'Paragon');
      const ref = await page.evaluate(paragonCard);
      await check('IR-PARAGON-UNTOUCHED-' + D, async () => [await page.evaluate(() => document.querySelectorAll('#advConfigGrid .ir15-item, #advConfigGrid .ir15-rule').length === 0), ref]);
      await closeAll(page);
      for (const [kind, name, n, K] of PICKERS) {
        await openPicker(page, kind, name);
        const o = await page.evaluate(options);
        await check('IR-' + K + '-INLINE-' + D, async () => [o.length === n && o.every(x => x.oracle && x.inline && x.inline.endsWith(x.oracle) && /^( — |\. )/.test(x.inline) &&
          x.inline.length === x.oracle.length + (x.inline.startsWith('. ') ? 2 : 3)), o.map(x => [x.first, (x.inline || '').slice(0, 40), (x.oracle || '').slice(0, 40)])]);
        await check('IR-' + K + '-NOTHING-HIDDEN-DRAWN-' + D, async () => [o.every(x => !x.detShown && !x.infoShown), o.map(x => [x.detShown, x.infoShown])]);
        // One box per option (owner's review, 7 November): nothing inside the card draws a border of its own.
        await check('IR-' + K + '-ONE-BOX-' + D, async () => [o.every(x => x.inner.filter(t => !/^INPUT/.test(t)).length === 0), o.map(x => x.inner)]);
        await check('IR-' + K + '-PARAGON-CARD-' + D, async () => [o.every(x => x.bold && !x.first.includes(x.oracle.slice(0, 20)) && JSON.stringify(x.card) === JSON.stringify(ref)), {card: o[0].card, ref}]);
        await closeAll(page);
      }
      // Tapping the rule chooses the option; Confirm saves it; the row's i still carries the rule.
      await check('IR-TAP-RULE-CHOOSES-' + D, async () => {
        await openPicker(page, 'disadv', 'Consumed');
        const rule = page.locator('#advConfigGrid .d45-option').nth(1).locator('.ir15-rule');
        await rule.scrollIntoViewIfNeeded(); await settle(page);
        // A tap in the middle of the rule's last line: an inline span's box starts on the name's line.
        const at = await rule.evaluate(e => { const r = [...e.getClientRects()].pop(); return {x: r.left + r.width / 2, y: r.top + r.height / 2,
          hit: (document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) || {}).className}; });
        if (at.hit !== 'ir15-rule') throw Error('the rule text is not what a tap there reaches: ' + at.hit);
        if (D === 'PHONE') await page.touchscreen.tap(at.x, at.y); else await page.mouse.click(at.x, at.y);
        await settle(page);
        const picked = await page.evaluate(() => [...document.querySelectorAll('#advConfigGrid input[type=radio]')].findIndex(i => i.checked));
        await page.locator('#advConfigConfirm').click(); await page.waitForTimeout(250);
        const row = await lastRow(page, 'disadvList', 'Consumed');
        await closeAll(page);
        return [picked === 1 && row && /Determination/.test(row.config), {picked, row}];
      });
      await check('IR-ROW-I-KEEPS-TEXT-' + D, async () => {
        await openPicker(page, 'adv', 'Seven Fortunes’ Blessing');
        const rule = await page.evaluate(() => document.querySelectorAll('#advConfigGrid .fb4521-item')[2].querySelector('details > span').textContent.trim());
        await page.locator('#advConfigGrid input[value="Daikoku"]').check();
        await page.locator('#advConfigConfirm').click(); await page.waitForTimeout(250); await settle(page);
        const i = page.locator('#advList .entry').filter({has: page.locator('.en-name')}).last().locator('.fb4521-info, .adv-config-info').first();
        await i.scrollIntoViewIfNeeded(); await i.click(); await page.waitForSelector('#stanceInfoOverlay', {state: 'visible'});
        const body = await page.evaluate(() => document.getElementById('stanceInfoBody').textContent);
        await closeAll(page);
        const key = rule.split('. ').slice(1, 2).join('');
        return [key.length > 10 && body.replace(/\s+/g, ' ').includes(key.replace(/\s+/g, ' ').slice(0, 30)), {key, body: body.slice(0, 200)}];
      });
      await check('IR-LONG-WINDOW-REACHABLE-' + D, async () => {
        await openPicker(page, 'adv', 'Seven Fortunes’ Blessing');
        const c = page.locator('#advConfigConfirm');
        await c.scrollIntoViewIfNeeded(); await settle(page);
        const r = await c.evaluate(b => { const x = b.getBoundingClientRect(); return {top: x.top, bottom: x.bottom, vh: innerHeight}; });
        const m = await page.evaluate(() => { const e = document.querySelector('#advConfigModalOverlay .roll-modal'); return {scrollH: e.scrollHeight, clientH: e.clientHeight}; });
        await closeAll(page);
        return [r.top >= 0 && r.bottom <= r.vh + 0.5 && m.scrollH > 0, {r, m}];
      });
      await check('IR-LABEL-ONLY-PICKER-UNTOUCHED-' + D, async () => {
        await openPicker(page, 'adv', 'Luck');
        const n = await page.evaluate(() => document.querySelectorAll('#advConfigGrid .ir15-item, #advConfigGrid .ir15-rule').length);
        await closeAll(page);
        return [n === 0, n];
      });
      await check('IR-CLASS-GATES-' + D, async () => {
        await openPicker(page, 'adv', 'Seven Fortunes’ Blessing');
        const r = await page.evaluate(() => { const b = document.body, had = b.classList.contains('ir15-on'); b.classList.remove('ir15-on');
          const d = document.querySelector('#advConfigGrid details.fb4521-rule'), drawn = d.getClientRects().length > 0; if (had) b.classList.add('ir15-on');
          return {had, drawn, back: b.classList.contains('ir15-on')}; });
        await closeAll(page);
        return [r.had && r.drawn && r.back, r];
      });
      await check('IR-NO-ERRORS-' + D, async () => [errors.length === 0, errors]);
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
