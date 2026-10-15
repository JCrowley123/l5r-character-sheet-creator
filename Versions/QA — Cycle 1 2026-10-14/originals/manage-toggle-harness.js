/*
 * BUGFIX — Manage Button Clipping: real-browser acceptance. The input HTML is read only.
 *   node manage-toggle-harness.js <sheet.html> [--no-toggle]
 *
 * The owner's iPhone report (30 September 2026): the first tap on Manage showed a clipped label,
 * "M|DONE", which put itself right later. Measured cause: the toggle's label changes between Manage
 * and Done, so the button's width changed with it (70.7px to 53.1px at 390px wide, fallback font)
 * and every button beside it moved; Safari can leave the old paint in the gap. Headless Chromium
 * cannot show Safari's stale paint, so the oracle is the geometry the paint depends on: in both
 * modes the toggle keeps one box, and nothing else in the header moves.
 *
 * The "natural" toggle, as it would be without this fix, is measured on the same page with the
 * fix's hidden second line switched off by a test-only style. That is also how each width shows the
 * premise still holds (without the fix, Done is narrower), so a pass is never vacuous. A hidden label must paint nothing: the toggle's screenshot must not change when that
 * label is forced transparent. Taps are touch taps at phone widths, clicks at 1024.
 *
 * --no-toggle  Phase 12's modes off, so there is no toggle: nothing to fix, and nothing may break.
 * Every scenario declares its assertion identities first, so an exception fails what it did not reach.
 */
'use strict';
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');
const sheet = process.argv[2];
const noToggle = process.argv.includes('--no-toggle');
const results = [];
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
  const ids = names.map(n => 'MT-' + prefix + '-' + n);
  const check = (n, a, e = true, detail = '') => {
    const id = 'MT-' + prefix + '-' + n;
    if (!ids.includes(id)) throw new Error('undeclared assertion ' + id);
    record(id, a, e, detail);
  };
  let error = '';
  try { await run(check); } catch (e) { error = String(e.stack || e).split('\n').slice(0, 5).join('\n'); }
  for (const id of ids) if (!results.some(r => r.id === id)) record(id, 'not reached', 'completed', error);
}

const NATURAL = 'html body .titlebar #pm12Toggle.pm12-toggle::after{content:none !important;display:none !important;}';
const INKLESS = 'html body .titlebar #pm12Toggle.pm12-toggle::after{color:transparent !important;}';
const TOLERANCE = 0.5;
const close = (a, b) => Math.abs(a - b) <= TOLERANCE;
const sameBox = (a, b) => ['left', 'top', 'width', 'height'].every(k => close(a[k], b[k]));

async function fresh(browser, width) {
  // A phone-width page is a touch page, as on a phone.
  const context = await browser.newContext({ viewport: { width, height: 844 }, hasTouch: width < 768 });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  page.errors = [];
  page.on('pageerror', e => page.errors.push(String(e)));
  await page.route('https://fonts.googleapis.com/**', r => r.abort());
  await page.route('https://fonts.gstatic.com/**', r => r.abort());
  // Readiness, not an assertion: the 3 MB page can take a while on a busy machine.
  await page.goto(pathToFileURL(path.resolve(sheet)).href, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => { const T = window.__L5R_TEST__; return !!T && !!window.__L5R_CAROUSEL__?.isReady?.()
    && (!T.CL11 || T.CL11.ready || T.CL11.enabled() === false); }, null, { timeout: 60000 });
  await page.evaluate(() => window.__L5R_TEST__.CL11?.close?.());
  await page.waitForTimeout(250);
  page.touch = width < 768;
  return { context, page };
}
const style = (page, id, css) => page.evaluate(([id, css]) => {
  let s = document.getElementById(id);
  if (css === null) { if (s) s.remove(); return; }
  if (!s) { s = document.createElement('style'); s.id = id; document.head.appendChild(s); }
  s.textContent = css;
}, [id, css]);
const press = async page => {
  if (page.touch) await page.tap('#pm12Toggle'); else await page.click('#pm12Toggle');
  // The sheet's buttons move 1px while pressed and ease back over 0.1s.
  await page.waitForTimeout(250);
};
// The toggle's box, its label's box, and every other element with a box in the header.
const read = page => page.evaluate(() => {
  const round = v => Math.round(v * 10) / 10;
  const box = r => ({ left: round(r.left), top: round(r.top), width: round(r.width), height: round(r.height) });
  const b = document.getElementById('pm12Toggle');
  const range = document.createRange();
  range.selectNodeContents(b);
  const header = b.closest('.titlebar') || b.parentElement;
  const others = [...header.querySelectorAll('*')].filter(e => e !== b && !b.contains(e) && e.getClientRects().length)
    .map(e => (e.id || e.tagName.toLowerCase()) + ' ' + JSON.stringify(box(e.getBoundingClientRect())));
  return { text: b.textContent, name: b.getAttribute('aria-label'), box: box(b.getBoundingClientRect()),
    label: box(range.getBoundingClientRect()), others };
});
const centred = r => Math.abs((r.label.left + r.label.width / 2) - (r.box.left + r.box.width / 2)) <= 1;
const labelDrop = r => Math.round((r.label.top - r.box.top) * 10) / 10;

(async () => {
  const browser = await chromium.launch();
  try {
    if (noToggle) {
      await scenario('NO-TOGGLE', ['NONE', 'NO-PSEUDO', 'NO-ERRORS'], async check => {
        const { context, page } = await fresh(browser, 390);
        check('NONE', await page.locator('#pm12Toggle').count(), 0);
        check('NO-PSEUDO', await page.evaluate(() => [...document.querySelectorAll('*')]
          .filter(e => getComputedStyle(e, '::after').content === '"Manage"').length), 0);
        check('NO-ERRORS', page.errors, []);
        await context.close();
      });
    } else {
      for (const width of [320, 390, 1024]) {
        const names = ['PREMISE', 'LABELS', 'SAME-BOX', 'AS-WIDE-AS-MANAGE', 'HEIGHT-UNCHANGED', 'NOTHING-MOVES',
          'LABEL-CENTRED', 'LABEL-HEIGHT-UNCHANGED', 'HIDDEN-LABEL-UNSEEN', 'BACK-AGAIN', 'NO-ERRORS'];
        await scenario('W' + width, names, async check => {
          const { context, page } = await fresh(browser, width);
          await page.evaluate(() => window.__L5R_TEST__.MODES12.set('play'));
          await page.waitForTimeout(150);
          // Without the fix: the second line switched off on this same page.
          await style(page, 'mt-natural', NATURAL);
          const natPlay = await read(page);
          await press(page);
          const natManage = await read(page);
          await press(page);
          await style(page, 'mt-natural', null);
          // The premise is the width change. Whether the rest of the row moves with it depends on the
          // header's layout (it does in Phase 12.8's; in the older header the toggle only jumps).
          const moved = natPlay.others.filter((x, i) => x !== natManage.others[i]).length;
          check('PREMISE', natPlay.box.width - natManage.box.width > 5, true,
            'natural widths ' + natPlay.box.width + ' / ' + natManage.box.width + ', ' + moved + ' header elements moved');
          // With the fix.
          const play = await read(page);
          const inked = await page.locator('#pm12Toggle').screenshot();
          await style(page, 'mt-inkless', INKLESS);
          const inkless = await page.locator('#pm12Toggle').screenshot();
          await style(page, 'mt-inkless', null);
          await press(page);
          const manage = await read(page);
          const inkedManage = await page.locator('#pm12Toggle').screenshot();
          await style(page, 'mt-inkless', INKLESS);
          const inklessManage = await page.locator('#pm12Toggle').screenshot();
          await style(page, 'mt-inkless', null);
          await press(page);
          const again = await read(page);
          check('LABELS', [play.text, manage.text, again.text], ['Manage', 'Done', 'Manage']);
          check('SAME-BOX', sameBox(play.box, manage.box), true, JSON.stringify([play.box, manage.box]));
          check('AS-WIDE-AS-MANAGE', close(manage.box.width, natPlay.box.width) && close(play.box.width, natPlay.box.width), true,
            JSON.stringify([natPlay.box.width, play.box.width, manage.box.width]));
          check('HEIGHT-UNCHANGED', close(play.box.height, natPlay.box.height) && close(manage.box.height, natManage.box.height), true,
            JSON.stringify([natPlay.box.height, play.box.height, natManage.box.height, manage.box.height]));
          check('NOTHING-MOVES', manage.others, play.others);
          check('LABEL-CENTRED', [centred(play), centred(manage)], [true, true], JSON.stringify([play.label, play.box, manage.label, manage.box]));
          check('LABEL-HEIGHT-UNCHANGED', [labelDrop(play), labelDrop(manage)], [labelDrop(natPlay), labelDrop(natManage)]);
          check('HIDDEN-LABEL-UNSEEN', [inked.equals(inkless), inkedManage.equals(inklessManage)], [true, true]);
          check('BACK-AGAIN', sameBox(again.box, play.box) && same(again.others, play.others), true);
          check('NO-ERRORS', page.errors, []);
          await context.close();
        });
      }
      await scenario('PAGE', ['ONLY-THE-TOGGLE', 'NAMES-UNCHANGED', 'NO-ERRORS'], async check => {
        const { context, page } = await fresh(browser, 390);
        // The fix's label is on the toggle and nowhere else in the sheet.
        check('ONLY-THE-TOGGLE', await page.evaluate(() => [...document.querySelectorAll('*')]
          .filter(e => getComputedStyle(e, '::after').content === '"Manage"').map(e => e.id)), ['pm12Toggle']);
        // A screen reader still hears Phase 12's own names, never the hidden label.
        await page.evaluate(() => window.__L5R_TEST__.MODES12.set('play'));
        await page.waitForTimeout(150);
        const inPlay = await page.getByRole('button', { name: 'Manage this character: switch to editing', exact: true }).count();
        await press(page);
        const inManage = await page.getByRole('button', { name: 'Done managing: back to Play mode', exact: true }).count();
        check('NAMES-UNCHANGED', [inPlay, inManage], [1, 1]);
        check('NO-ERRORS', page.errors, []);
        await context.close();
      });
    }
  } finally {
    await browser.close().catch(() => {});
  }
  const passed = results.filter(r => r.pass).length;
  console.log(`${passed}/${results.length} checks passed`);
  process.exitCode = passed === results.length && results.length > 0 ? 0 : 1;
})().catch(e => { console.error(e); console.log(`0/${Math.max(results.length, 1)} checks passed`); process.exitCode = 1; });
