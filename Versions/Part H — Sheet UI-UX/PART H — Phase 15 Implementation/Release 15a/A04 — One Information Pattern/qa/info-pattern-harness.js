'use strict';
// Release 15a, A04 (PART H PHASE 15.1.4): one information pattern (mock-ups approved 6 November 2026).
//   node info-pattern-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL, and an
// exception inside a check is that check's FAIL with its reason. Oracles are independent of the layer: the page's own
// elements and titles, what the browser reports at a point (elementFromPoint), the computed ring and glyph, the
// fixture's own price, the text the other layers wrote into the row, and the same page with the layer's body class
// taken away. The layer is never asked what it should have done.
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./expected-checks.json');
const sheet = path.resolve(process.argv[2]);
const FIX = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'g1-fixtures.json'), 'utf8'));
const seen = {};
const set = (id, ok, detail) => {
  seen[id] = ok === true && seen[id] !== false;
  if (ok !== true) console.log('  detail ' + id + ': ' + JSON.stringify(detail === undefined ? ok : detail).slice(0, 900));
};
async function check(id, body) {
  try { const [ok, detail] = await body(); set(id, ok, detail); }
  catch (e) { set(id, false, 'exception: ' + String(e && e.message || e).slice(0, 500)); }
}
const PHONE = {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true};
const DESKTOP = {viewport: {width: 1440, height: 1000}};

function helpers() {
  const shown = e => !!e && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden' && e.getClientRects().length > 0;
  // The standard: a 28 px circle in the ink colour, drawn with an upright i.
  const ink = (() => { const d = document.createElement('div'); d.style.color = 'var(--ink)'; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; })();
  const ring = e => { const s = getComputedStyle(e), a = getComputedStyle(e, '::after'), r = e.getBoundingClientRect();
    return {w: Math.round(r.width), h: Math.round(r.height), radius: s.borderRadius, border: s.borderTopStyle + ' ' + s.borderTopWidth, color: s.color,
      glyph: a.content, italic: a.fontStyle, bold: a.fontWeight, ok: Math.round(r.width) === 28 && Math.round(r.height) === 28 && s.borderTopStyle === 'solid' &&
      parseFloat(s.borderTopWidth) >= 1 && (s.borderRadius === '50%' || parseFloat(s.borderRadius) >= 14) && s.color === ink && a.content === '"i"' &&
      a.fontStyle === 'normal' && Number(a.fontWeight) <= 500}; };
  // A tap 6 px outside the ring (inside the 44 px area) lands on the button.
  const reach = e => { e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const pts = [[r.left - 6, cy], [r.right + 6, cy], [cx, r.top - 6], [cx, r.bottom + 6]];
    return pts.map(([x, y]) => { const h = document.elementFromPoint(x, y); return !!h && (h === e || e.contains(h)); }); };
  const page = () => [...document.querySelectorAll('.car-page:not([data-clone])')].find(p => !p.hidden && !p.inert && Math.abs(p.getBoundingClientRect().left) < 5) || null;
  const entry = (list, re) => [...document.querySelectorAll('#' + list + ' .entry')].find(d => re.test(d.querySelector('.en-name').value)) || null;
  const nested = () => [...document.querySelectorAll('.adv-config-info')].filter(b => b.parentElement && b.parentElement.closest('button, a[href], summary, [role="button"]'));
  return {shown, ring, reach, page, entry, nested};
}

async function open(browser, opts, data) {
  const context = await browser.newContext(opts);
  await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready);
  await page.waitForFunction(() => !document.getElementById('l5rSplash'));
  await page.addScriptTag({content: 'window.__IP_H = (' + helpers.toString() + ')();'});
  await page.evaluate(d => { const T = window.__L5R_TEST__; try { T.CL11.close(); } catch (e) {} T.applyData(d); document.getElementById('f_clan').value = 'Crane'; T.recalcAll(); }, data);
  return {context, page, errors};
}
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
async function goTab(page, tab) { await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; if (C) { C.goToTab(l); await C.whenSettled(); } }, tab); await settle(page); }
const mode = (page, m) => page.evaluate(m => window.__L5R_TEST__.MODES12.set(m), m);
const closeOverlays = page => page.evaluate(() => { for (const id of ['stanceInfoOverlay', 'skillInfoModalOverlay']) { const o = document.getElementById(id); if (o) o.style.display = 'none'; }
  try { window.__L5R_TEST__.closeAdvConfigModal(); } catch (e) {} });

(async () => {
  const browser = await chromium.launch();
  try {
    for (const [device, opts] of [['phone', PHONE], ['desktop', DESKTOP]]) {
      const {context, page, errors} = await open(browser, opts, FIX.dense);
      const D = device.toUpperCase();
      await check('IP-SEAM-' + D, async () => {
        const r = await page.evaluate(() => ({on: document.body.classList.contains('ip15-on'), seam: typeof window.__L5R_TEST__.IP15 === 'object', sw: window.__L5R_TEST__.ONE_INFO_PATTERN_ENABLED}));
        return [r.on && r.seam && r.sw === true, r];
      });
      // Skills: every row's information button is the standard i, named after its Skill, its text and title untouched.
      for (const m of ['play', 'management']) {
        await mode(page, m); await goTab(page, 'Skills');
        await check(`IP-SKILL-RING-${D}-${m.toUpperCase()}`, async () => {
          const r = await page.evaluate(() => [...document.querySelectorAll('#skillsBody > tr')].map(tr => { const b = tr.querySelector('.sk-name-row > .sk-info-btn');
            return {name: tr.querySelector('.sk-name').value, shown: __IP_H.shown(b), ring: __IP_H.ring(b), text: b.textContent, title: b.title, label: b.getAttribute('aria-label')}; }));
          const bad = r.filter(x => !(x.shown && x.ring.ok && x.text === '👁' && x.title === 'Skill Info' && x.label === (x.name || 'Skill') + ' information'));
          return [r.length > 3 && bad.length === 0, bad.slice(0, 3)];
        });
      }
      await check('IP-SKILL-TOUCH-' + D, async () => {
        const r = await page.evaluate(() => [...document.querySelectorAll('#skillsBody > tr .sk-name-row > .sk-info-btn')].slice(0, 4).map(__IP_H.reach));
        return [r.length === 4 && r.every(x => x.every(Boolean)), r];
      });
      await check('IP-SKILL-OPENS-' + D, async () => {
        const b = page.locator('#skillsBody > tr').nth(1).locator('.sk-info-btn');
        await b.scrollIntoViewIfNeeded(); await b.click();
        const r = await page.evaluate(() => ({shown: getComputedStyle(document.getElementById('skillInfoModalOverlay')).display !== 'none',
          title: document.getElementById('skillInfoTitle').textContent, name: document.querySelectorAll('#skillsBody > tr')[1].querySelector('.sk-name').value}));
        await closeOverlays(page);
        return [r.shown && r.title === r.name, r];
      });
      if (device === 'phone') {
        // The name follows the Skill's name as it is typed.
        await mode(page, 'management'); await goTab(page, 'Skills');
        await check('IP-SKILL-RENAME', async () => {
          const n = page.locator('#skillsBody > tr').nth(0).locator('.sk-name');
          await n.scrollIntoViewIfNeeded(); await n.fill('Calligraphy Test');
          const a = await page.evaluate(() => document.querySelector('#skillsBody > tr .sk-info-btn').getAttribute('aria-label'));
          await n.fill('Calligraphy'); await n.dispatchEvent('change');
          const b = await page.evaluate(() => document.querySelector('#skillsBody > tr .sk-info-btn').getAttribute('aria-label'));
          return [a === 'Calligraphy Test information' && b === 'Calligraphy information', [a, b]];
        });
      }
      // The Void Points eye and the Kiho note.
      await goTab(page, 'Rings & Traits');
      await check('IP-VOID-' + D, async () => {
        const r = await page.evaluate(() => { const b = document.getElementById('voidInfoBtn'); return {ring: __IP_H.ring(b), reach: __IP_H.reach(b), label: b.getAttribute('aria-label'), title: b.title, text: b.textContent}; });
        await page.locator('#voidInfoBtn').click(); await settle(page);
        const opened = await page.evaluate(() => [...document.querySelectorAll('.roll-modal-overlay, #stanceInfoOverlay')].some(o => getComputedStyle(o).display !== 'none'));
        await page.keyboard.press('Escape');
        await page.evaluate(() => document.querySelectorAll('.roll-modal-overlay, #stanceInfoOverlay').forEach(o => { o.style.display = 'none'; }));
        return [r.ring.ok && r.reach.every(Boolean) && r.label === 'Void Points information' && r.title === 'What can Void Points be spent on?' && r.text === '👁' && opened, {r, opened}];
      });
      await goTab(page, 'Techniques');
      await check('IP-KIHO-' + D, async () => {
        // The Kiho note shows only for a monk. The test character is not one, so its hidden ancestors are shown for the
        // measurement and put back: the button must be the standard i either way (review finding, 7 November).
        const r = await page.evaluate(() => { const b = document.getElementById('kihoRulesInfoBtn'); if (!b) return null;
          const opened = []; for (let n = b; n && n !== document.body; n = n.parentElement) if (getComputedStyle(n).display === 'none') { opened.push([n, n.style.display]); n.style.display = 'block'; }
          const out = {shown: __IP_H.shown(b), ring: __IP_H.ring(b), label: b.getAttribute('aria-label'), text: b.textContent, opened: opened.length};
          opened.forEach(([n, v]) => { n.style.display = v; }); return out; });
        return [!!r && r.shown && r.ring.ok && r.label === 'Kiho rules information' && r.text === 'ⓘ', r];
      });
      // The Combat tab's formula i shares the class and is NOT changed: same computed look with and without the layer.
      await check('IP-COMBAT-UNCHANGED-' + D, async () => {
        const r = await page.evaluate(() => { const b = document.getElementById('combatTnInfoBtn'); if (!b) return null;
          const take = () => { const s = getComputedStyle(b), a = getComputedStyle(b, '::after'); return [s.width, s.height, s.borderTopColor, s.fontSize, s.color, a.content].join('|'); };
          const on = take(); document.body.classList.remove('ip15-on'); const off = take(); document.body.classList.add('ip15-on'); return {on, off}; });
        return [!!r && r.on === r.off, r];
      });
      // Advantages and Disadvantages: no i inside another control, every one next to what it explains.
      for (const m of ['play', 'management']) {
        await mode(page, m); await goTab(page, 'Adv & Disadv');
        await check(`IP-ADV-NOT-NESTED-${D}-${m.toUpperCase()}`, async () => {
          const r = await page.evaluate(() => { const hosts = [...document.querySelectorAll('#advList [data-ux-info="done"], #disadvList [data-ux-info="done"]')];
            const own = h => h.matches('button, a[href], summary, [role="button"]') ? (h.nextElementSibling && h.nextElementSibling.classList.contains('adv-config-info') ? 1 : 0) : h.querySelectorAll(':scope > .adv-config-info').length;
            return {nested: __IP_H.nested().length, hosts: hosts.length, lonely: hosts.filter(h => own(h) !== 1 && !h.classList.contains('d45-summary')).map(h => h.outerHTML.slice(0, 160)),
              rings: [...document.querySelectorAll('#advList .adv-config-info, #disadvList .adv-config-info')].filter(__IP_H.shown).map(__IP_H.ring).filter(x => !x.ok)}; });
          return [r.nested === 0 && r.lonely.length === 0 && r.rings.length === 0, r];
        });
      }
      // Added after the review (7 November): in Play, an i moved out of a control is shown only when that control is,
      // so no lone i explains a Choose… that Play hides.
      await check('IP-PLAY-NO-LONE-I-' + D, async () => {
        await mode(page, 'play'); await goTab(page, 'Adv & Disadv');
        const r = await page.evaluate(() => [...document.querySelectorAll('#advList .adv-config-info, #disadvList .adv-config-info')].map(i => {
          const host = i.previousElementSibling && i.previousElementSibling.matches('button, a[href], [role="button"]') ? i.previousElementSibling : null;
          return {label: i.getAttribute('aria-label'), host: !!host, hostShown: host ? __IP_H.shown(host) : null, iShown: __IP_H.shown(i)}; }).filter(x => x.host));
        await mode(page, 'management'); await goTab(page, 'Adv & Disadv');
        const m = await page.evaluate(() => [...document.querySelectorAll('#advList .adv-config-btn + .adv-config-info')].map(i => __IP_H.shown(i)));
        return [r.length >= 3 && r.every(x => x.iShown === x.hostShown) && r.some(x => x.hostShown === false) && m.length >= 3 && m.every(Boolean), {r, m}];
      });
      await check('IP-CHOOSE-' + D, async () => {
        const wealthy = await page.evaluate(() => { const e = __IP_H.entry('advList', /^Wealthy$/); const host = e.querySelector('.adv-config-btn'); const i = host.nextElementSibling;
          return {label: i && i.getAttribute('aria-label'), isInfo: !!i && i.classList.contains('adv-config-info'), title: host.title, hostText: host.textContent.trim(), reach: i ? __IP_H.reach(i) : []}; });
        // The i opens the explanation and NOT the picker; Choose… still opens the picker.
        const idx = await page.evaluate(() => [...document.querySelectorAll('#advList .entry')].indexOf(__IP_H.entry('advList', /^Wealthy$/)));
        const row = page.locator('#advList .entry').nth(idx);
        await row.locator('.adv-config-info').click(); await settle(page);
        const info = await page.evaluate(() => ({body: document.getElementById('stanceInfoBody').textContent, overlay: getComputedStyle(document.getElementById('stanceInfoOverlay')).display,
          picker: getComputedStyle(document.getElementById('advConfigModalOverlay')).display}));
        await closeOverlays(page);
        await row.locator('.adv-config-btn').click(); await settle(page);
        const picker = await page.evaluate(() => getComputedStyle(document.getElementById('advConfigModalOverlay')).display);
        await closeOverlays(page); await settle(page);
        return [wealthy.isInfo && wealthy.label === 'Explain: Wealthy' && wealthy.hostText === 'Choose…' && wealthy.reach.every(Boolean) && info.overlay !== 'none' &&
          info.body === wealthy.title && info.picker === 'none' && picker !== 'none', {wealthy, info, picker}];
      });
      if (device === 'phone') {
        // Inside the configuration modal too (its observer calls the same decorator).
        await mode(page, 'management'); await goTab(page, 'Adv & Disadv');
        await check('IP-MODAL-NOT-NESTED', async () => {
          await page.evaluate(() => { const s = document.getElementById('advQuickAdd'); s.value = 'Wealthy'; s.dispatchEvent(new Event('change', {bubbles: true})); });
          await page.waitForSelector('#advConfigModalOverlay', {state: 'visible'}); await settle(page);
          const r = await page.evaluate(() => ({nested: [...document.querySelectorAll('#advConfigModalOverlay .adv-config-info')].filter(b => b.parentElement.closest('button, a[href], summary, [role="button"]')).length,
            count: document.querySelectorAll('#advConfigModalOverlay .adv-config-info').length,
            rings: [...document.querySelectorAll('#advConfigModalOverlay .adv-config-info')].filter(__IP_H.shown).map(__IP_H.ring).filter(x => !x.ok).length}));
          await closeOverlays(page);
          await page.evaluate(() => { const e = [...document.querySelectorAll('#advList .entry')].filter(d => d.querySelector('.en-name').value === 'Wealthy'); if (e.length > 1) e[e.length - 1].remove(); window.__L5R_TEST__.recalcAll(); });
          return [r.nested === 0 && r.rings === 0, r];
        });
      }
      // Hotei: the rule and both instructions behind the i, word for word; one line of what it does with the price.
      await mode(page, 'management'); await goTab(page, 'Adv & Disadv');
      await check('IP-HOTEI-ROW-' + D, async () => {
        const r = await page.evaluate(() => { const e = __IP_H.entry('disadvList', /Seven Fortunes/); const row = e.querySelector('.adv-config-row');
          const sum = row.querySelector('.d45-summary'), notes = [...row.querySelectorAll('.hotei4536-note, .ht7-note')], i = row.querySelector('.fortune4511-badge + button');
          const line = [...row.children].filter(c => __IP_H.shown(c) && /2 Void Points/.test(getComputedStyle(c, '::after').content));
          return {cost: e.querySelector('.en-cost') ? e.querySelector('.en-cost').value : null,
            hidden: [sum].concat(notes).map(x => !__IP_H.shown(x)), notes: notes.length, text: row.textContent.includes(sum.textContent) && notes.every(n => row.textContent.includes(n.textContent)),
            badge: __IP_H.shown(row.querySelector('.fortune4511-badge')), change: __IP_H.shown(row.querySelector('.adv-config-btn')), ring: i ? __IP_H.ring(i) : null,
            line: line.map(c => getComputedStyle(c, '::after').content), label: i && i.getAttribute('aria-label')}; });
        const fixtureCost = FIX.dense.disadv.find(d => /Seven Fortunes/.test(d.name)).cost;
        return [r.notes === 2 && r.hidden.every(Boolean) && r.text && r.badge && r.change && r.ring && r.ring.ok && r.label === 'Hotei’s Curse information' &&
          r.line.length === 1 && r.line[0] === `"Techniques and Advantages cost 2 Void Points to activate. ${fixtureCost} XP."`, r];
      });
      await check('IP-HOTEI-PANEL-' + D, async () => {
        const words = await page.evaluate(() => { const row = __IP_H.entry('disadvList', /Seven Fortunes/).querySelector('.adv-config-row');
          return [row.querySelector('.d45-summary').title].concat([...row.querySelectorAll('.hotei4536-note, .ht7-note')].map(n => n.textContent)); });
        const idx = await page.evaluate(() => [...document.querySelectorAll('#disadvList .entry')].indexOf(__IP_H.entry('disadvList', /Seven Fortunes/)));
        await page.locator('#disadvList .entry').nth(idx).locator('.fortune4511-badge + button').click(); await settle(page);
        const body = await page.evaluate(() => document.getElementById('stanceInfoBody').textContent);
        await closeOverlays(page);
        return [words.length === 3 && words.every(w => w && body.includes(w.trim())), {words, body}];
      });
      // The layer's body class gates everything: without it the eyes and the small i are drawn as before.
      await check('IP-CLASS-GATES-' + D, async () => {
        await goTab(page, 'Skills');
        const r = await page.evaluate(() => { const b = document.querySelector('#skillsBody > tr .sk-info-btn'); const on = __IP_H.ring(b);
          document.body.classList.remove('ip15-on'); const off = __IP_H.ring(b); const glyph = getComputedStyle(b, '::after').content; document.body.classList.add('ip15-on'); return {on: on.ok, off: off.ok, glyph}; });
        return [r.on === true && r.off === false && r.glyph !== '"i"', r];
      });
      await check('IP-NO-ERRORS-' + D, async () => [errors.length === 0, errors]);
      await context.close();
    }
    // A Seven Fortunes' Curse with another Fortune is left exactly as it was.
    const other = JSON.parse(JSON.stringify(FIX.dense));
    const curse = other.disadv.find(d => /Seven Fortunes/.test(d.name));
    curse.config = {type: 'fortunePick', fortune: 'Benten', value: 'Benten'}; curse.cost = '3';
    const {context, page, errors} = await open(browser, PHONE, other);
    await mode(page, 'management'); await goTab(page, 'Adv & Disadv');
    await check('IP-OTHER-FORTUNE-UNCHANGED', async () => {
      const r = await page.evaluate(() => { const row = __IP_H.entry('disadvList', /Seven Fortunes/).querySelector('.adv-config-row');
        return {badge: row.querySelector('.fortune4511-badge') && row.querySelector('.fortune4511-badge').textContent, folded: row.querySelectorAll('.ip15-folded').length,
          added: row.querySelectorAll('.ip15-hotei-info, .ip15-hotei-line').length, summary: __IP_H.shown(row.querySelector('.d45-summary'))}; });
      return [r.badge === 'Benten' && r.folded === 0 && r.added === 0 && r.summary && errors.length === 0, {r, errors}];
    });
    await context.close();
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
