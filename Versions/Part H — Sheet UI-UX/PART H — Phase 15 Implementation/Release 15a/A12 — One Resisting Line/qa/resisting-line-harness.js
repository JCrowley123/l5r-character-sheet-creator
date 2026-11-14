'use strict';
// Release 15a, unit A12 (PART H PHASE 15.1.32): the resistance choices in one closed "Resisting?" line in the roll
// preview (approved by the owner on 14 November 2026, ring-fenced).   node resisting-line-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL.
// Oracles are independent of the unit: the registry's own answers for the open preview (RD4515.offered, .armed and
// .html, read with the preview's own roll context, which the harness notes when the registry starts), what the browser
// draws (getClientRects, boxes), the preview's text outside "Declare for this roll", the saved character (collectData)
// and localStorage. The resistance choices are listed here, not read from the unit. The unit's test-only pause is used
// to show the same preview without it. Characters, copied into this folder: the audit's dense Kuni Shugenja (Honour 4,
// Missing Limb), and a copy with Balance, Clear Thinker, Heartless and Irreproachable. Phone: Play, opened from a file.
// Laptop: Play, opened from the Characters list.
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./expected-checks.json');
const DENSE = path.join(__dirname, 'dense-kuni.l5r.json'), DENSE_NAME = 'Phase 15 dense audit';
const RESIST = path.join(__dirname, 'resist-kuni.l5r.json'), RESIST_NAME = 'G5 resist test';
const FIVE = ['honour-resistance:resist', 'situational-entries:balance', 'situational-entries:clear-thinker', 'situational-entries:heartless', 'situational-entries:irreproachable'];
const FIFTEEN = FIVE.concat(['fortune-blessing:jurojin', 'fortune-blessing:hotei', 'spirit-realms:meido', 'spirit-realms:tengoku',
  'ancestors:kaimetsu-provoked', 'ancestors:moto-resist', 'ancestors:yamatsu-resist', 'ancestors:hitomi-resist', 'ancestors:reichin-fear', 'ancestors:reichin-bloodspeaker']);
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
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const DEVICES = {PHONE: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}, DESKTOP: {viewport: {width: 1440, height: 1000}}};
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
const goTab = async (page, tab) => { await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; if (C) { C.goToTab(l); await C.whenSettled(); } }, tab); await settle(page); };

function install() {
  const T = window.__L5R_TEST__, H = {ctx: null};
  // The preview's own roll context, noted when the registry starts it.
  const start = T.RD4515.start;
  T.RD4515.start = function(c){ H.ctx = c; return start.apply(this, arguments); };
  // Drawn: has boxes, is not hidden, and (where the browser can say) is not inside content the browser skips, such as a
  // closed <details>, whose content keeps its boxes in Chromium 153. (14 November 2026, after the first run, which
  // counted the closed line's choices as drawn; before any result was used. Stricter; same ids and count.)
  H.drawn = el => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden' &&
    (typeof el.checkVisibility !== 'function' || el.checkVisibility());
  H.decl = () => document.querySelector('#rollPreviewBody .rd4515-declare');
  H.line = () => { const d = H.decl(); return d ? d.querySelector('details.rs15-line') : null; };
  H.norm = html => { const t = document.createElement('template'); t.innerHTML = html; return t.innerHTML; };
  H.info = () => {
    const d = H.decl(), l = H.line(), keys = el => [...el.querySelectorAll('[data-rd4515-key]')].map(i => i.getAttribute('data-rd4515-key'));
    const s = l && l.querySelector(':scope > summary'), q = s && s.querySelector('.rs15-q'), n = s && s.querySelector('.rs15-count'), c = s && s.querySelector('.rs15-chosen');
    const inside = l ? keys(l) : [], all = d ? keys(d) : [];
    return {decl: !!d, line: !!l, atTop: !!l && d.children[1] === l, open: !!l && l.open, q: q ? q.textContent : null, count: n ? n.textContent : null,
      chosen: c && H.drawn(c) ? c.textContent : null, inside, outside: all.filter(k => !inside.includes(k)),
      insideDrawn: inside.filter(k => H.drawn(d.querySelector('[data-rd4515-key="' + k + '"]').closest('label'))),
      outsideDrawn: all.filter(k => !inside.includes(k) && H.drawn(d.querySelector('[data-rd4515-key="' + k + '"]').closest('label'))),
      sources: l ? [...l.querySelectorAll('.rs15-body > .rd4515-source')].map(e => e.textContent) : [],
      notesDrawn: l ? [...l.querySelectorAll('.rd4515-opt-note')].filter(H.drawn).length : 0};
  };
  // Each choice as drawn: key, label, note, ticked; and the registry's own list for the same roll.
  H.drawnChoices = () => [...H.decl().querySelectorAll('[data-rd4515-key]')].map(i => { const l = i.closest('label'), n = l.nextElementSibling;
    return [i.getAttribute('data-rd4515-key'), l.textContent, n && n.classList.contains('rd4515-opt-note') ? n.textContent : '', i.checked]; })
    .sort((a, b) => a[0] < b[0] ? -1 : 1);
  H.registryChoices = () => { const armed = T.RD4515.armed(H.ctx);
    return T.RD4515.offered(H.ctx).map(o => [o.key, o.label, o.note, armed.includes(o.key)]).sort((a, b) => a[0] < b[0] ? -1 : 1); };
  // The preview as read outside "Declare for this roll": dice, breakdown, modifiers, Void, the Roll button.
  H.outsideText = () => { const b = document.getElementById('rollPreviewBody').cloneNode(true), d = b.querySelector('.rd4515-declare'); if (d) d.remove(); return b.innerText; };
  H.rollInView = () => { const go = document.getElementById('rollPreviewGo'), m = document.querySelector('#rollPreviewOverlay .roll-modal');
    const r = go.getBoundingClientRect(), mr = m.getBoundingClientRect(); return {bottom: Math.round(r.bottom), limit: Math.round(Math.min(innerHeight, mr.bottom)), inView: r.bottom <= Math.min(innerHeight, mr.bottom) + 0.5 && r.top >= 0}; };
  window.RSH = H;
}
async function prepare(page, errors) {
  page.on('pageerror', e => errors.push(String(e)));
  page.on('dialog', d => d.accept().catch(() => {}));
  await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready);
  await page.waitForFunction(() => !document.getElementById('l5rSplash'));
}
async function openFile(browser, opts, file, name) {
  const context = await browser.newContext(opts);
  await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
  const page = await context.newPage(), errors = [];
  await prepare(page, errors);
  await page.locator('#fileImport').setInputFiles(file);
  await page.waitForFunction(n => document.getElementById('f_name').value === n, name);
  await page.evaluate(() => window.__L5R_TEST__.MODES12.set('play'));
  await page.evaluate(install);
  return {context, page, errors};
}
// A stored character opened from the Characters list, in Play.
async function openListed(browser, opts, file, name) {
  const context = await browser.newContext(opts);
  await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
  const page = await context.newPage(), errors = [];
  await prepare(page, errors);
  await page.evaluate(([text, n]) => { const id = 'c_a12_play';
    localStorage.setItem('l5r-sheet:local:l5r-char:' + id, text);
    const list = JSON.parse(localStorage.getItem('l5r-sheet:local:l5r-char-index') || '[]');
    list.push({id, name: n, clan: 'Crab', updatedAt: 2});
    localStorage.setItem('l5r-sheet:local:l5r-char-index', JSON.stringify(list)); }, [fs.readFileSync(file, 'utf8'), name]);
  await page.evaluate(() => window.__L5R_TEST__.MODES12.set('play'));
  await page.evaluate(() => window.__L5R_TEST__.CL11.openCharacter('c_a12_play'));
  await page.waitForFunction(n => document.getElementById('f_name').value === n, name);
  await page.evaluate(install);
  return {context, page, errors};
}
async function willpower(page) {
  await goTab(page, 'Rings & Traits');
  await page.locator('.trait-row label[data-trait-name="Willpower"]').first().click();
  await page.waitForSelector('#rollPreviewOverlay', {state: 'visible'});
  await settle(page);
}
async function cancel(page) { await page.locator('#rollPreviewCancel').click(); await page.waitForSelector('#rollPreviewOverlay', {state: 'hidden'}); await settle(page); }
const info = page => page.evaluate(() => window.RSH.info());
const tapOrClick = async (locator, phone) => { if (phone) await locator.tap(); else await locator.click(); };

(async () => {
  const browser = await chromium.launch();
  const phoneErrors = [];
  try {
    // ---------- Phone, Play, the character with the four resist Advantages ----------
    {
      const {context, page, errors} = await openFile(browser, DEVICES.PHONE, RESIST, RESIST_NAME);
      const P = true;
      await check('RS-SEAM-PHONE', async () => {
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__; return {rs: !!T.RS15 && T.RS15.installed === true, on: T.RESISTING_LINE_ENABLED}; });
        return [r.rs && r.on === true, r];
      });
      const before = await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
      await willpower(page);
      await check('RS-CLOSED-LINE-AT-TOP-PHONE', async () => {
        const r = await info(page);
        return [r.line && r.atTop && !r.open && r.q === 'Resisting?' && r.count === '5 options' && r.chosen === null && same(r.inside, FIVE) &&
          r.insideDrawn.length === 0 && same(r.outside, ['checks-conditions:missing-limb']) && same(r.outsideDrawn, ['checks-conditions:missing-limb']), r];
      });
      await check('RS-ROLL-IN-VIEW-PHONE', async () => { const r = await page.evaluate(() => window.RSH.rollInView()); return [r.inView, r]; });
      await check('RS-SAME-CHOICES-AS-REGISTRY-PHONE', async () => {
        const r = await page.evaluate(() => ({drawn: window.RSH.drawnChoices(), registry: window.RSH.registryChoices()}));
        return [r.registry.length === 6 && same(r.drawn, r.registry), r];
      });
      await check('RS-OPEN-SHOWS-CHOICES-PHONE', async () => {
        await tapOrClick(page.locator('.rs15-line > summary'), P);
        await settle(page);
        const r = await info(page);
        return [r.open && same(r.sources, ['Honour', 'Advantages']) && same(r.insideDrawn, FIVE) && r.notesDrawn === 5 && r.count === '5 options', r];
      });
      await check('RS-TICK-KEEPS-OPEN-PHONE', async () => {
        await tapOrClick(page.locator('[data-rd4515-key="honour-resistance:resist"]'), P);
        await settle(page);
        const r = await info(page);
        const t = await page.evaluate(() => ({box: document.querySelector('[data-rd4515-key="honour-resistance:resist"]').checked,
          armed: window.__L5R_TEST__.RD4515.armed(window.RSH.ctx)}));
        return [r.open && t.box && same(t.armed, ['honour-resistance:resist']) && r.count === '1 chosen', {r, t}];
      });
      await check('RS-CHOSEN-NAMED-WHEN-CLOSED-PHONE', async () => {
        await tapOrClick(page.locator('.rs15-line > summary'), P);
        await settle(page);
        const r = await info(page);
        return [!r.open && r.count === '1 chosen' && r.chosen === 'Honour +4' && r.insideDrawn.length === 0, r];
      });
      // The same roll with the unit paused (its test-only switch), redrawn by taking Honour's choice off and on again.
      let paused = null;
      await check('RS-SAME-ROLL-ON-AND-PAUSED-PHONE', async () => {
        const on = await page.evaluate(() => ({text: window.RSH.outsideText(), go: document.getElementById('rollPreviewGo').textContent}));
        await page.evaluate(() => { window.__L5R_TEST__.RS15.paused = true; });
        const box = page.locator('[data-rd4515-key="honour-resistance:resist"]');
        await box.evaluate(b => { b.checked = false; b.dispatchEvent(new Event('change', {bubbles: true})); });
        await settle(page);
        await page.locator('[data-rd4515-key="honour-resistance:resist"]').evaluate(b => { b.checked = true; b.dispatchEvent(new Event('change', {bubbles: true})); });
        await settle(page);
        const off = await page.evaluate(() => ({text: window.RSH.outsideText(), go: document.getElementById('rollPreviewGo').textContent}));
        paused = await page.evaluate(() => ({markup: window.RSH.decl().outerHTML, registry: window.RSH.norm(window.__L5R_TEST__.RD4515.html(window.RSH.ctx)),
          rs15: document.querySelectorAll('#rollPreviewBody [class*="rs15"]').length}));
        return [same(on, off) && /Honour: resistance/.test(on.text) && on.go === 'Roll 4k4', {on, off}];
      });
      await check('RS-PAUSED-IS-REGISTRY-MARKUP-PHONE', async () => [!!paused && paused.markup === paused.registry && paused.rs15 === 0, paused && {rs15: paused.rs15, equal: paused.markup === paused.registry}]);
      // Guarded (14 November 2026, after the run on A08 alone stopped here): without the unit there is nothing to unpause.
      await page.evaluate(() => { const R = window.__L5R_TEST__.RS15; if (R) R.paused = false; });
      await check('RS-NEW-ROLL-STARTS-CLOSED-PHONE', async () => {
        await cancel(page);
        await willpower(page);
        const r = await info(page), armed = await page.evaluate(() => window.__L5R_TEST__.RD4515.armed(window.RSH.ctx));
        return [r.line && !r.open && r.count === '5 options' && r.chosen === null && armed.length === 0, {r, armed}];
      });
      await check('RS-NOTHING-SAVED-PHONE', async () => {
        await tapOrClick(page.locator('.rs15-line > summary'), P);
        await tapOrClick(page.locator('[data-rd4515-key="situational-entries:heartless"]'), P);
        await settle(page);
        await cancel(page);
        const r = await page.evaluate(b => ({same: JSON.stringify(window.__L5R_TEST__.collectData()) === b,
          storage: Object.keys(localStorage).concat(Object.values(localStorage)).some(v => /rs15|Resisting\?/.test(v))}), before);
        return [r.same && !r.storage, r];
      });
      await check('RS-NO-RESIST-NO-LINE-PHONE', async () => {
        await page.evaluate(() => { const T = window.__L5R_TEST__; T.rollWithModifiers('A12 probe attack', T.makeRollContext(T.ROLL_KINDS.ATTACK, {skillName: 'Jiujutsu', traitName: 'Agility'}), 3, 2); });
        await page.waitForSelector('#rollPreviewOverlay', {state: 'visible'});
        await settle(page);
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__, H = window.RSH, d = H.decl();
          return {offered: T.RD4515.offered(H.ctx).map(o => o.key), line: !!H.line(), decl: !!d,
            equal: d ? d.outerHTML === H.norm(T.RD4515.html(H.ctx)) : true}; });
        await cancel(page);
        return [!r.line && r.equal && !r.offered.some(k => FIFTEEN.includes(k)), r];
      });
      phoneErrors.push(...errors);
      await context.close();
    }
    // ---------- Phone, Play, the dense character: Honour's choice only ----------
    {
      const {context, page, errors} = await openFile(browser, DEVICES.PHONE, DENSE, DENSE_NAME);
      await willpower(page);
      await check('RS-HONOUR-ONLY-ONE-OPTION-PHONE', async () => {
        const r = await info(page);
        return [r.line && r.atTop && !r.open && r.count === '1 option' && same(r.inside, ['honour-resistance:resist']) &&
          same(r.outsideDrawn, ['checks-conditions:missing-limb']), r];
      });
      await cancel(page);
      phoneErrors.push(...errors);
      await check('RS-NO-ERRORS-PHONE', async () => [phoneErrors.length === 0, phoneErrors]);
      await context.close();
    }
    // ---------- Laptop, Play, opened from the Characters list ----------
    {
      const {context, page, errors} = await openListed(browser, DEVICES.DESKTOP, RESIST, RESIST_NAME);
      await willpower(page);
      await check('RS-ROLL-IN-VIEW-DESKTOP', async () => {
        const r = await page.evaluate(() => ({view: window.RSH.rollInView(), play: window.__L5R_TEST__.MODES12.isPlay()}));
        const i = await info(page);
        return [r.view.inView && r.play && i.line && i.count === '5 options', {r, i}];
      });
      await check('RS-KEYBOARD-TOGGLES-DESKTOP', async () => {
        await page.locator('.rs15-line > summary').focus();
        await page.keyboard.press('Enter');
        await settle(page);
        const a = await info(page);
        await page.keyboard.press('Space');
        await settle(page);
        const b = await info(page);
        return [a.open && !b.open, {a: a.open, b: b.open}];
      });
      await cancel(page);
      await check('RS-ALL-FIFTEEN-GATHERED-DESKTOP', async () => {
        // Stand-in providers under the real ids, offering every resistance choice the sheet has (and one gift that is not one).
        await page.evaluate(() => { const D = window.__L5R_TEST__.RD4515, mods = () => [];
          D.register('fortune-blessing', {label: 'Seven Fortunes’ Blessing', modifiers: mods, offers: () => [
            {key: 'jurojin', label: 'Resisting poison or disease — +2k0'}, {key: 'hotei', label: 'Contested Roll against an effect that would take your Void Points — +10'}]});
          D.register('spirit-realms', {label: 'Touch of the Spirit Realms', modifiers: mods, offers: () => [
            {key: 'meido', label: 'Contested Roll against social manipulation — +2k0'}, {key: 'tengoku', label: 'Resisting Shadowlands Taint — +2k0'}]});
          D.register('ancestors', {label: 'Ancestor', modifiers: mods, offers: () => [
            {key: 'kaimetsu-provoked', label: 'Resisting provocation — no +1k1 from Kaimetsu-Uo'}, {key: 'moto-resist', label: 'Resisting restraint or mental influence — +2k2'},
            {key: 'yamatsu-resist', label: 'Resisting possession or magical control — +2k2'}, {key: 'hitomi-resist', label: 'Resisting Temptation, Intimidation or Fear — +1k1'},
            {key: 'reichin-fear', label: 'Resisting Fear — +1k1'}, {key: 'reichin-bloodspeaker', label: 'Resisting a Bloodspeaker’s Fear — +2k2 in place of +1k1'},
            {key: 'akodo-battle', label: 'A roll on the Mass Battle Table — +1k1'}]}); });
        await willpower(page);
        const r = await info(page);
        await cancel(page);
        return [r.line && r.count === '15 options' && same([...r.inside].sort(), [...FIFTEEN].sort()) && r.inside[0] === 'honour-resistance:resist' &&
          r.outside.includes('ancestors:akodo-battle') && r.outside.includes('checks-conditions:missing-limb') && r.outside.length === 2, r];
      });
      await check('RS-NO-ERRORS-DESKTOP', async () => [errors.length === 0, errors]);
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
