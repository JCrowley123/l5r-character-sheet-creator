'use strict';
// Release 15a, unit A20 (PART H PHASE 15.1.34): a Trait for one Skill roll, chosen in its roll preview, with the Traits
// the books name for that Skill listed first (approved by the owner on 19 November 2026).
//   node skill-trait-choice-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL.
// Oracles are independent of the unit: the preview as drawn (its pool, its base rows, its Roll button, the drop-down's
// groups and options as a player sees them, its note), the roll result window's notation and Emphasis bar, the Skill
// row's Trait and the saved character (collectData). The unit's own state is read only to say whether it is there (the
// seam). The player's steps are real taps on a touch phone and real clicks and keys on a laptop. Character: the audit's
// dense Kuni Shugenja (Intimidation Rank 3 on Awareness 2 with the Control Emphasis; Willpower 4; Strength 3; Agility 3;
// Stamina 2; no Athletics, so Athletics is rolled Unskilled; Sailing Rank 1 on "Agility or Intelligence"), with Touch of
// the Void as its only Disadvantage and a katana (Kenjutsu) as its weapon; A19's fixture with the weapon and Sailing, here.
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./expected-checks.json');
const FX = path.join(__dirname, 'trait-choice.l5r.json'), FX_NAME = 'A20 Trait choice';
const sheet = path.resolve(process.argv[2]);
const seen = {};
const set = (id, ok, detail) => {
  seen[id] = ok === true && seen[id] !== false;
  if (ok !== true) console.log('  detail ' + id + ': ' + JSON.stringify(detail === undefined ? ok : detail).slice(0, 1200));
};
async function check(id, body) {
  try { const [ok, detail] = await body(); set(id, ok, detail); }
  catch (e) { set(id, false, 'exception: ' + String(e && e.message || e).slice(0, 500)); }
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const wait = ms => new Promise(r => setTimeout(r, ms));
const DEVICES = {PHONE: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}, DESKTOP: {viewport: {width: 1440, height: 1000}}};
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
const goTab = async (page, tab) => { await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; if (C) { C.goToTab(l); await C.whenSettled(); } }, tab); await settle(page); };
const NOTE_WP = 'This roll only; Intimidation is usually Awareness. Book of Earth p.9: the GM may allow Willpower for Intimidation.';

function install() {
  const T = window.__L5R_TEST__, $ = id => document.getElementById(id), H = {};
  const shown = id => { const o = $(id); return !!o && getComputedStyle(o).display !== 'none'; };
  // The preview as drawn.
  H.preview = () => {
    const b = $('rollPreviewBody'), sel = b.querySelector('select');
    const pool = b.querySelector('.rp-pool-final');
    return {open: shown('rollPreviewOverlay'), title: $('rollPreviewSubtitle').textContent, pool: pool ? pool.textContent : null,
      base: Array.from(b.querySelectorAll('.rp-baserow')).map(r => { const s = r.querySelector('select');
        return (s ? s.options[s.selectedIndex].textContent : r.querySelector('.rp-mod-label').textContent) + ' | ' + r.querySelector('.rp-mod-txt').textContent; }),
      select: sel ? sel.value : null,
      groups: sel ? Array.from(sel.querySelectorAll('optgroup')).map(g => [g.label, Array.from(g.querySelectorAll('option')).map(o => o.textContent)]) : null,
      note: Array.from(b.querySelectorAll('div')).filter(d => !d.querySelector('div')).map(d => d.textContent).find(t => /^This roll only/.test(t)) || null,
      ticked: Array.from(b.querySelectorAll('input[type=checkbox]')).filter(c => c.checked).map(c => c.getAttribute('data-void-key') || c.getAttribute('data-rd4515-key') || c.name || '?'),
      go: ($('rollPreviewGo') || {}).textContent};
  };
  H.result = () => ({open: shown('rollModalOverlay'), notation: $('rollModalNotation').textContent,
    emphasis: !!document.querySelector('#rollModalBody .emph-reroll-label') && document.querySelector('#rollModalBody .emph-reroll-label').textContent,
    explode: Array.from(document.querySelectorAll('#rollModalBody .rp-baserow, #rollModalBody .roll-note, #rollModalBody div')).some(d => /Unskilled/.test(d.textContent))});
  H.rowTrait = skill => { const tr = Array.from(document.querySelectorAll('#skillsBody tr')).find(t => t.querySelector('.sk-name').value === skill); return tr ? tr.querySelector('.sk-trait').value : null; };
  H.data = () => { const d = T.collectData(); delete d.auditLog; return d; };
  window.TCH = H;
}
async function load(page) {
  await page.locator('#fileImport').setInputFiles(FX);
  await page.waitForFunction(n => document.getElementById('f_name').value === n, FX_NAME);
  await page.evaluate(() => window.__L5R_TEST__.MODES12.set('play'));
  await settle(page);
}
async function open(browser, opts) {
  const context = await browser.newContext(opts);
  await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('dialog', d => d.accept().catch(() => {}));
  await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready);
  await page.waitForFunction(() => !document.getElementById('l5rSplash'));
  await load(page);
  await page.evaluate(install);
  return {context, page, errors};
}
const press = async (page, phone, selector) => { const b = page.locator(selector).first(); await b.scrollIntoViewIfNeeded(); if (phone) await b.tap(); else await b.click(); await settle(page); };
const preview = page => page.evaluate(() => window.TCH.preview());
// A Skill roll from its row: the preview, open.
async function skillRoll(page, phone, skill) {
  await goTab(page, 'Skills');
  await press(page, phone, `#skillsBody tr:has(.sk-name[value="${skill}"]) .sk-roll`);
  await page.waitForFunction(() => window.TCH.preview().open);
  await settle(page);
}
// The player picks a Trait in the drop-down (the native picker's choice).
// Without the unit there is no drop-down: nothing is picked, and the checks then read the preview as it is.
const pick = async (page, trait) => { if (await page.locator('#rollPreviewBody select').count()) await page.locator('#rollPreviewBody select').selectOption(trait); await settle(page); };
const cancel = (page, phone) => press(page, phone, '#rollPreviewCancel');
// Touch of the Void may follow a Void Point; close whatever window is open.
async function tidy(page, phone) {
  for (let i = 0; i < 4; i++) {
    const s = await page.evaluate(() => ({p: window.TCH.preview().open, r: window.TCH.result().open}));
    if (s.r) await press(page, phone, '#rollModalClose');
    else if (s.p) await press(page, phone, '#rollPreviewCancel');
    else return;
    await wait(300);
  }
}

(async () => {
  const browser = await chromium.launch();
  try {
    // ---------- Phone, Play ----------
    {
      const {context, page, errors} = await open(browser, DEVICES.PHONE);
      const P = true;
      await check('TC-SEAM-PHONE', async () => {
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__; return {tc: !!T.TC15 && T.TC15.installed === true, on: T.SKILL_TRAIT_CHOICE_ENABLED}; });
        return [r.tc && r.on === true, r];
      });
      const before = await page.evaluate(() => window.TCH.data());
      await skillRoll(page, P, 'Intimidation');
      const a = await preview(page);
      await check('TC-OPENS-ON-USUAL-PHONE', async () => [a.select === 'Awareness' && a.pool === '5k2' && a.go === 'Roll 5k2' && a.note === null &&
        same(a.base, ['Awareness 2 | 2k2 — the Trait sets the dice kept', 'Intimidation Rank 3 | +3k0']), a]);
      await check('TC-LIST-ORDER-PHONE', async () => [same(a.groups, [
        ['Usual for Intimidation', ['Awareness 2']],
        ['Named for Intimidation (Book of Earth pp.8–9; Control: Core pp.121, 229)', ['Willpower 4']],
        ['Other Traits (the GM’s call, Core p.79)', ['Stamina 2', 'Reflexes 2', 'Strength 3', 'Perception 3', 'Agility 3', 'Intelligence 3']]]), a.groups]);
      await pick(page, 'Willpower');
      const b = await preview(page);
      await check('TC-OTHER-TRAIT-POOL-PHONE', async () => [b.select === 'Willpower' && b.pool === '7k4' && b.go === 'Roll 7k4' && b.note === NOTE_WP &&
        same(b.base, ['Willpower 4 | 4k4 — the Trait sets the dice kept', 'Intimidation Rank 3 | +3k0']), b]);
      // A Void Point ticked, then the Trait changed back and forth: the tick stays, the pool follows.
      await press(page, P, '#rollPreviewBody input[data-void-key="k1"]');
      await pick(page, 'Awareness');
      const c1 = await preview(page);
      await pick(page, 'Willpower');
      const c2 = await preview(page);
      await check('TC-TICKS-KEPT-PHONE', async () => [same(c1.ticked, ['k1']) && same(c2.ticked, ['k1']) && c1.pool === '7k3' && c2.pool === '9k5' && c2.select === 'Willpower', {c1, c2}]);
      await press(page, P, '#rollPreviewBody input[data-void-key="k1"]');
      await press(page, P, '#rollPreviewGo');
      await page.waitForFunction(() => window.TCH.result().open);
      const r = await page.evaluate(() => window.TCH.result());
      await check('TC-ROLL-USES-CHOICE-PHONE', async () => [r.notation === '7k4' && r.emphasis === 'Emphasis (Control)', r]);
      await tidy(page, P);
      await check('TC-SAVED-TRAIT-UNCHANGED-PHONE', async () => {
        const after = await page.evaluate(() => window.TCH.data());
        const row = await page.evaluate(() => window.TCH.rowTrait('Intimidation'));
        const saved = (after.skills.find(s => s.name === 'Intimidation') || {}).trait;
        return [row === 'Awareness' && saved === 'Awareness' && same(before.skills, after.skills) && !/tc15|TC15/.test(JSON.stringify(after)), {row, saved}];
      });
      await skillRoll(page, P, 'Intimidation');
      const d = await preview(page);
      await check('TC-REOPENS-ON-USUAL-PHONE', async () => [d.select === 'Awareness' && d.pool === '5k2' && d.note === null, d]);
      await tidy(page, P);
      await check('TC-NO-ERRORS-PHONE', async () => [errors.length === 0, errors]);
      await context.close();
    }
    // ---------- Laptop, Play ----------
    {
      const {context, page, errors} = await open(browser, DEVICES.DESKTOP);
      const P = false;
      await check('TC-CANCEL-FORGETS-DESKTOP', async () => {
        await skillRoll(page, P, 'Intimidation');
        await pick(page, 'Willpower');
        await cancel(page, P);
        await skillRoll(page, P, 'Intimidation');
        const a = await preview(page);
        await cancel(page, P);
        return [a.select === 'Awareness' && a.pool === '5k2' && a.note === null, a];
      });
      await check('TC-BACK-TO-USUAL-DESKTOP', async () => {
        await skillRoll(page, P, 'Intimidation');
        await pick(page, 'Strength');
        const a = await preview(page);
        await pick(page, 'Awareness');
        const b = await preview(page);
        await cancel(page, P);
        return [a.pool === '6k3' && a.note === 'This roll only; Intimidation is usually Awareness.' && b.pool === '5k2' && b.note === null && b.select === 'Awareness', {a, b}];
      });
      // Athletics is not on this character's Skills, so it is rolled Unskilled from the untrained list (Strength 3).
      const athletics = async () => {
        await goTab(page, 'Skills');
        await press(page, P, '#btnUntrainedSkills');
        await press(page, P, '#untrainedSkillsBody .untrained-chip[data-skill-name="Athletics"]');
        await page.waitForFunction(() => window.TCH.preview().open);
        await settle(page);
      };
      await check('TC-UNSKILLED-KEEPS-RULE-DESKTOP', async () => {
        await athletics();
        const a = await preview(page);
        await pick(page, 'Stamina');
        const b = await preview(page);
        await press(page, P, '#rollPreviewGo');
        await page.waitForFunction(() => window.TCH.result().open);
        const r = await page.evaluate(() => window.TCH.result());
        await tidy(page, P);
        return [a.select === 'Strength' && a.pool === '3k3' && b.pool === '2k2' && b.base.length === 2 && /^Stamina 2 \| 2k2/.test(b.base[0]) &&
          /^Unskilled \|/.test(b.base[1]) && r.notation === '2k2', {a, b, r}];
      });
      await check('TC-BOOK-NOTE-DESKTOP', async () => {
        await athletics();
        const a = await preview(page);
        await pick(page, 'Agility');
        const b = await preview(page);
        await cancel(page, P);
        return [same(a.groups.slice(0, 3), [['Usual for Athletics', ['Strength 3']], ['Named for Athletics (Core p.139)', ['Agility 3']],
          ['Named for Athletics (Book of Earth p.8)', ['Stamina 2']]]) &&
          b.note === 'This roll only; Athletics is usually Strength. Core p.139: Athletics uses Agility for throwing.', {a: a.groups, b: b.note}];
      });
      await check('TC-NOT-ON-TRAIT-ROLL-DESKTOP', async () => {
        await goTab(page, 'Rings & Traits');
        await press(page, P, '.trait-row label[data-trait-name="Willpower"]');
        await page.waitForFunction(() => window.TCH.preview().open);
        const a = await preview(page);
        await cancel(page, P);
        return [a.select === null && a.groups === null && /Willpower/.test(a.title), a];
      });
      await check('TC-NOT-ON-ATTACK-DESKTOP', async () => {
        await goTab(page, 'Combat');
        // The Weapons section starts closed: open it as a player would, by its heading.
        if (!(await page.evaluate(() => document.getElementById('weaponsDetails').open))) await press(page, P, '#weaponsDetails > summary');
        await press(page, P, '#weaponsBody .wp-roll-btn');
        await page.waitForFunction(() => window.TCH.preview().open);
        const a = await preview(page);
        await tidy(page, P);
        return [a.select === null && a.groups === null, a];
      });
      await check('TC-KEYBOARD-CHOICE-DESKTOP', async () => {
        await skillRoll(page, P, 'Intimidation');
        if (await page.locator('#rollPreviewBody select').count()) {
          await page.locator('#rollPreviewBody select').focus();
          await page.keyboard.press('ArrowDown');   // the next option: Willpower 4
        }
        await settle(page);
        const a = await preview(page);
        const focused = await page.evaluate(() => document.activeElement && document.activeElement.tagName === 'SELECT' && document.activeElement.closest('#rollPreviewBody') !== null);
        await cancel(page, P);
        return [a.select === 'Willpower' && a.pool === '7k4' && focused, {a, focused}];
      });
      // Sailing holds two Traits, "Agility or Intelligence"; the sheet rolls the first. Added 19 November 2026 after run 3
      // (the code review's finding), with a Sailing row in this folder's character.
      await check('TC-TWO-TRAIT-SKILL-DESKTOP', async () => {
        await skillRoll(page, P, 'Sailing');
        const a = await preview(page);
        await pick(page, 'Intelligence');
        const b = await preview(page);
        await pick(page, 'Willpower');
        const c = await preview(page);
        await cancel(page, P);
        return [a.select === 'Agility or Intelligence' && a.pool === '4k3' && same(a.groups, [['Usual for Sailing', ['Agility 3']],
          ['Named for Sailing (Core p.144)', ['Intelligence 3']],
          ['Other Traits (the GM’s call, Core p.79)', ['Stamina 2', 'Willpower 4', 'Reflexes 2', 'Awareness 2', 'Strength 3', 'Perception 3']]]) &&
          b.select === 'Intelligence' && b.pool === '4k3' && b.note === 'This roll only; Sailing is usually Agility. Core p.144: Sailing uses Agility or Intelligence.' &&
          c.pool === '5k4' && c.note === 'This roll only; Sailing is usually Agility.', {a, b, c}];
      });
      await check('TC-NO-ERRORS-DESKTOP', async () => [errors.length === 0, errors]);
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
