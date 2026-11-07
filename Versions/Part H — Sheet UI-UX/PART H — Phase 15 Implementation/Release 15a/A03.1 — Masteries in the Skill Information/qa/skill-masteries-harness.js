'use strict';
// Release 15a, A03.1 (PART H PHASE 15.1.3.1): the Mastery Abilities list in the Skill information window (the owner's
// idea from A03; approved as mocked up, 7 November 2026).
//   node skill-masteries-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL, and an
// exception inside a check is that check's FAIL with its reason. Oracles are independent of the layer: the Mastery
// notes the trunk draws on the Skill card itself ("R3 ✓: ..."), the row's own Rank, the computed colours of the
// sheet's tokens, a contrast ratio computed here, and the same page with the layer's body class taken away.
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
  const token = v => { const d = document.createElement('div'); d.style.color = v; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; };
  const rgb = c => (c.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number);
  const lum = c => { const f = x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }; const [r, g, b] = rgb(c); return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const bgOf = e => { for (let n = e; n; n = n.parentElement) { const c = getComputedStyle(n).backgroundColor; if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c; } return 'rgb(255, 255, 255)'; };
  const rows = () => [...document.querySelectorAll('#skillsBody > tr')];
  // What the card itself shows: the trunk's own Mastery notes, "R<tier>[ ✓]: <text>", in order.
  const cardNotes = tr => [...tr.querySelectorAll('.sk-mastery-note > span')].map(s => { const m = /^R(\d+)( ✓)?: ([\s\S]*)$/.exec(s.textContent.trim());
    return m ? {rank: +m[1], reached: !!m[2], text: m[3].trim()} : {bad: s.textContent}; });
  // What the window lists.
  const windowList = () => { const sec = document.querySelector('#skillInfoModalOverlay .sm15-masteries');
    if (!sec) return null;
    return {head: (sec.querySelector('h4') || {}).textContent, none: (sec.querySelector('.sm15-none') || {}).textContent || null,
      items: [...sec.querySelectorAll('li')].map(li => { const label = li.firstElementChild.textContent, m = /^Rank (\d+)( · reached)?$/.exec(label);
        return {rank: m ? +m[1] : NaN, reached: !!(m && m[2]), text: li.lastElementChild.textContent.trim(), label,
          labelColour: getComputedStyle(li.firstElementChild).color, textColour: getComputedStyle(li).color, bg: bgOf(li)}; })}; };
  return {token, contrast, rows, cardNotes, windowList};
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
  await page.addScriptTag({content: 'window.__SM_H = (' + helpers.toString() + ')();'});
  // The dense character reaches no Mastery, so Defense (three tiers) is raised to Rank 5 for this run.
  const data = JSON.parse(JSON.stringify(FIX.dense));
  data.skills.find(s => s.name === 'Defense').rank = '5';
  await page.evaluate(d => { const T = window.__L5R_TEST__; try { T.CL11.close(); } catch (e) {} T.applyData(d); document.getElementById('f_clan').value = 'Crane'; T.recalcAll(); }, data);
  await page.evaluate(() => window.__L5R_TEST__.MODES12.set('play'));
  await goTab(page, 'Skills');
  return {context, page, errors};
}
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
async function goTab(page, tab) { await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; if (C) { C.goToTab(l); await C.whenSettled(); } }, tab); await settle(page); }
async function info(page, index) {
  const b = page.locator('#skillsBody > tr').nth(index).locator('.sk-name-row > .sk-info-btn');
  await b.scrollIntoViewIfNeeded(); await b.click(); await page.waitForSelector('#skillInfoModalOverlay', {state: 'visible'}); await settle(page);
}
const close = page => page.locator('#skillInfoClose').click();
const rowIndex = (page, name) => page.evaluate(n => __SM_H.rows().findIndex(tr => tr.querySelector('.sk-name').value === n), name);

(async () => {
  const browser = await chromium.launch();
  try {
    for (const [device, opts] of [['phone', PHONE], ['desktop', DESKTOP]]) {
      const D = device.toUpperCase();
      const {context, page, errors} = await open(browser, opts);
      await check('SM-SEAM-' + D, async () => {
        const r = await page.evaluate(() => ({on: document.body.classList.contains('sm15-on'), seam: typeof window.__L5R_TEST__.SM15 === 'object', sw: window.__L5R_TEST__.SKILL_MASTERIES_ENABLED}));
        return [r.on && r.seam && r.sw === true, r];
      });
      // Every Skill on the sheet: the window lists exactly what the card's own notes say, in order.
      await check('SM-MATCHES-THE-CARD-' + D, async () => {
        const n = await page.evaluate(() => __SM_H.rows().length);
        const bad = [];
        for (let i = 0; i < n; i++) {
          await info(page, i);
          const r = await page.evaluate(i => { const tr = __SM_H.rows()[i]; return {name: tr.querySelector('.sk-name').value, card: __SM_H.cardNotes(tr), win: __SM_H.windowList()}; }, i);
          await close(page);
          const want = r.card.length ? JSON.stringify(r.card) : null;
          const got = r.win && r.win.items.length ? JSON.stringify(r.win.items.map(x => ({rank: x.rank, reached: x.reached, text: x.text}))) : null;
          if (!r.win || r.win.head !== 'Mastery Abilities' || want !== got || (!want && r.win.none !== 'No Mastery Abilities on file for this Skill.')) bad.push({name: r.name, want, got, none: r.win && r.win.none});
        }
        return [n > 3 && bad.length === 0, bad.slice(0, 3)];
      });
      await check('SM-REACHED-MARKED-' + D, async () => {
        await info(page, await rowIndex(page, 'Defense'));
        const r = await page.evaluate(() => ({w: __SM_H.windowList(), shu: __SM_H.token('var(--shu-dark)'), soft: __SM_H.token('var(--ink-soft)'), ink: __SM_H.token('var(--ink)')}));
        await close(page);
        const reached = r.w.items.filter(x => x.reached), not = r.w.items.filter(x => !x.reached);
        return [r.w.items.length === 3 && reached.map(x => x.rank).join() === '3,5' && not.map(x => x.rank).join() === '7' &&
          reached.every(x => x.label.endsWith(' · reached') && x.labelColour === r.shu && x.textColour === r.ink) &&
          not.every(x => x.label === 'Rank 7' && x.labelColour === r.soft && x.textColour === r.soft), r.w.items];
      });
      await check('SM-READABLE-' + D, async () => {
        await info(page, await rowIndex(page, 'Defense'));
        const r = await page.evaluate(() => __SM_H.windowList().items.map(x => Math.round(__SM_H.contrast(x.textColour, x.bg) * 100) / 100));
        await close(page);
        return [r.length === 3 && r.every(x => x >= 4.5), r];
      });
      await check('SM-PLACE-' + D, async () => {
        await info(page, await rowIndex(page, 'Defense'));
        const r = await page.evaluate(() => { const sec = document.querySelector('#skillInfoModalOverlay .sm15-masteries'), emph = document.getElementById('skillInfoEmph'), debug = document.querySelector('#skillInfoModalOverlay .sk-info-debug');
          return {afterEmph: emph.nextElementSibling === sec, beforeDebug: !!(sec.compareDocumentPosition(debug) & Node.DOCUMENT_POSITION_FOLLOWING), count: document.querySelectorAll('.sm15-masteries').length}; });
        await close(page);
        await info(page, 0); const again = await page.evaluate(() => document.querySelectorAll('.sm15-masteries').length); await close(page);
        return [r.afterEmph && r.beforeDebug && r.count === 1 && again === 1, {r, again}];
      });
      await check('SM-DEBUG-UNCHANGED-' + D, async () => {
        await info(page, await rowIndex(page, 'Defense'));
        await page.locator('#skillInfoShowFreeText').click();
        const out = await page.evaluate(() => { const o = document.getElementById('skillInfoDebugOutput'); return {shown: getComputedStyle(o).display !== 'none', text: o.textContent}; });
        await close(page);
        return [out.shown && /Free-text mastery — Defense \(current rank 5\)/.test(out.text) && /R3 ✓/.test(out.text), out];
      });
      await check('SM-FOLLOWS-RANK-' + D, async () => {
        await page.evaluate(() => window.__L5R_TEST__.MODES12.set('management')); await goTab(page, 'Skills');
        const i = await rowIndex(page, 'Defense');
        const rank = page.locator('#skillsBody > tr').nth(i).locator('.sk-rank');
        await rank.scrollIntoViewIfNeeded(); await rank.fill('7'); await rank.dispatchEvent('change'); await settle(page);
        await info(page, i); const seven = await page.evaluate(() => __SM_H.windowList().items.map(x => x.reached)); await close(page);
        await rank.fill('5'); await rank.dispatchEvent('change'); await settle(page);
        await info(page, i); const five = await page.evaluate(() => __SM_H.windowList().items.map(x => x.reached)); await close(page);
        await page.evaluate(() => window.__L5R_TEST__.MODES12.set('play')); await goTab(page, 'Skills');
        return [seven.join() === 'true,true,true' && five.join() === 'true,true,false', {seven, five}];
      });
      await check('SM-CLASS-GATES-' + D, async () => {
        await info(page, await rowIndex(page, 'Defense'));
        const r = await page.evaluate(() => { const sec = document.querySelector('.sm15-masteries'); const on = getComputedStyle(sec).borderTopStyle;
          document.body.classList.remove('sm15-on'); const off = getComputedStyle(sec).borderTopStyle; document.body.classList.add('sm15-on'); return {on, off}; });
        await close(page);
        return [r.on === 'solid' && r.off === 'none', r];
      });
      await check('SM-NO-ERRORS-' + D, async () => [errors.length === 0, errors]);
      await context.close();
    }
    // A custom Skill, which has no library entry, says it has none on file.
    await check('SM-CUSTOM-SKILL', async () => {
      const {context, page, errors} = await open(browser, PHONE);
      await page.evaluate(() => { const tr = __SM_H.rows()[2]; tr.querySelector('.sk-name').value = 'Lore: My Own Clan'; window.__L5R_TEST__.recalcAll(); });
      await info(page, 2);
      const w = await page.evaluate(() => __SM_H.windowList());
      await context.close();
      return [w && w.items.length === 0 && w.none === 'No Mastery Abilities on file for this Skill.' && errors.length === 0, {w, errors}];
    });
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
