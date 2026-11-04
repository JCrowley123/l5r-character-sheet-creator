'use strict';
// Release 15a, A01: shared wizard driving for the reproduction probe and the A01 harness.
// Drives the creation wizard through the sheet's own controls only (no state is injected).
const {chromium} = require('playwright');
const {pathToFileURL} = require('url');

const SCHOOLS = {
  kuni: {name: 'Kuni Tetsuo', clan: 'Crab', family: 'Kuni', school: 'Kuni Shugenja'},
  matsu: {name: 'Matsu Hana', clan: 'Lion', family: 'Matsu', school: 'Matsu Beastmaster [Bushi]'},
  monk: {name: 'Brother Kenji', clan: 'Brotherhood of Shinsei', family: null, school: 'The Order of the Nameless Gift [Monk]'}
};
const OVERSPEND = ['Willpower', 'Void', 'Agility', 'Strength', 'Perception'];

async function launch() {
  return chromium.launch();
}
async function fresh(browser, sheet, opts = {}) {
  const context = await browser.newContext(opts.desktop ? {viewport: {width: 1440, height: 1000}}
    : {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
  // Logic checks do not depend on the optional web-font CDN (the Spell Names correction, Phase 15 audit).
  await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  page.errors = [];
  page.on('pageerror', e => page.errors.push(String(e)));
  await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => { const T = window.__L5R_TEST__; return T && T.CL11 && T.CL11.ready && T.CW112 && T.CW1122; });
  await page.waitForFunction(() => !document.getElementById('l5rSplash'));
  return {context, page};
}
const title = page => page.evaluate(() => document.getElementById('cw112Title').textContent);
async function next(page) {
  await page.waitForFunction(() => !document.getElementById('cw112Next').disabled && !window.__L5R_TEST__.CW112.busy);
  await page.click('#cw112Next');
  await page.waitForFunction(() => !window.__L5R_TEST__.CW112.busy);
}
async function toStep(page, wanted) {
  for (let i = 0; i < 14 && (await title(page)) !== wanted; i++) await next(page);
  if ((await title(page)) !== wanted) throw Error('Did not reach ' + wanted);
}
async function backTo(page, wanted) {
  for (let i = 0; i < 14 && (await title(page)) !== wanted; i++) {
    await page.click('#cw112BackBtn');
    await page.waitForFunction(() => !window.__L5R_TEST__.CW112.busy);
  }
}
async function exactPick(page, text) {
  const cards = page.locator('#cw112Body .cw112-card');
  const index = await cards.evaluateAll((es, n) => es.findIndex(e => (e.querySelector('.cw112-card-title') || {}).textContent === n), text);
  if (index < 0) throw Error('Missing card ' + text);
  await cards.nth(index).click();
}
async function begin(page, kind) {
  const s = SCHOOLS[kind];
  await page.evaluate(() => window.__L5R_TEST__.CL11.open());
  await page.click('#cl11Create');
  await page.waitForFunction(() => !document.getElementById('cw112View').hidden);
  await page.fill('#cw112Name', s.name);
  await next(page);
  await exactPick(page, s.clan); await next(page);
  if (s.family) await exactPick(page, s.family);
  await next(page);
  await exactPick(page, s.school);
  await page.waitForFunction(n => window.__L5R_TEST__.CW112.appliedSchool() === n && !window.__L5R_TEST__.CW112.busy, s.school);
  await next(page);
  if ((await title(page)) !== 'Rings & Traits') throw Error('Expected Rings & Traits, got ' + await title(page));
}
async function overspend(page) {
  for (const t of OVERSPEND) await page.click('button[aria-label="Raise ' + t + '"]');
}
// Fills every open School choice on the current step through the step's own pickers.
async function fillStep(page) {
  for (let guard = 0; guard < 20; guard++) {
    const did = await page.evaluate(() => {
      const pick = sel => { const o = [...sel.options].find(o => o.value && !o.disabled); return o ? o.value : null; };
      const slot = [...document.querySelectorAll('#cw112Body select[id^="cw1121Slot"][id$="Pick"]')][0];
      if (slot) { const v = pick(slot); if (v) return ['#' + slot.id, v, '#' + slot.id.replace(/Pick$/, 'Add')]; }
      const lore = document.getElementById('cw1122LoreSubject');
      if (lore && document.getElementById('cw1122LoreSet')) return ['lore'];
      for (const sel of document.querySelectorAll('#cw112Body select[id^="cw1123Pick"], #cw112Body select#cw1124Pick')) {
        const v = pick(sel); if (v) return ['#' + sel.id, v, '#' + sel.id.replace('Pick', 'Add')];
      }
      const kiho = document.getElementById('cw1122KihoPick');
      if (kiho && window.__L5R_TEST__.kihoEntitlement().freePicksLeft > 0) {
        const o = [...kiho.options].find(o => o.value && !o.disabled && /free pick/.test(o.textContent));
        if (o) return ['#cw1122KihoPick', o.value, '#cw1122KihoAdd'];
      }
      return null;
    });
    if (!did) return;
    if (did[0] === 'lore') { await page.fill('#cw1122LoreSubject', 'History'); await page.click('#cw1122LoreSet'); }
    else {
      // Some Skills need a subject before Add enables; take the first option whose Add is enabled.
      const values = await page.evaluate(id => [...document.querySelector(id).options].filter(o => o.value && !o.disabled).map(o => o.value), did[0]);
      let chosen = false;
      for (const v of values) {
        await page.selectOption(did[0], v);
        if (await page.evaluate(id => !document.querySelector(id).disabled, did[2])) { chosen = true; break; }
      }
      if (!chosen) throw Error('No addable option in ' + did[0]);
      await page.click(did[2]);
    }
    await page.waitForFunction(() => !window.__L5R_TEST__.CW112.busy);
    await page.waitForTimeout(150);
  }
  throw Error('fillStep did not settle');
}
// Walks from Rings & Traits to Review; with complete=true fills every open choice on the way.
async function toReview(page, complete) {
  for (let i = 0; i < 14; i++) {
    const t = await title(page);
    if (t === 'Review') return;
    if (complete && ['Skills', 'Spells', 'Kiho'].includes(t)) await fillStep(page);
    await next(page);
    // A step with a choice open asks once ("Leave for later"); the second Next leaves it.
    if ((await title(page)) === t) await next(page);
  }
  throw Error('Did not reach Review');
}
// Everything the Review screen presents, as text and classes.
const review = page => page.evaluate(() => {
  const body = document.getElementById('cw112Body');
  const box = document.getElementById('cw1122Still');
  const next = document.getElementById('cw112Next');
  return {
    title: document.getElementById('cw112Title').textContent,
    box: box ? {className: box.className, items: [...box.querySelectorAll('li')].map(l => l.textContent), text: box.textContent} : null,
    cards: [...body.querySelectorAll('.cw112-finding')].map(li => ({className: li.className,
      title: (li.querySelector('strong') || {}).textContent || '', text: li.textContent})),
    reminders: [...body.querySelectorAll('.rr15-reminder')].map(li => ({className: li.className,
      title: (li.querySelector('strong') || {}).textContent || '', text: li.textContent})),
    notes: [...body.querySelectorAll('.cw112-note, .cw112-done')].map(n => n.textContent),
    finish: [next.textContent, next.disabled, document.getElementById('cw112Reason').textContent],
    order: [...body.children].map(n => n.id || n.className || n.tagName)
  };
});
module.exports = {SCHOOLS, OVERSPEND, launch, fresh, title, next, toStep, backTo, exactPick, begin, overspend, fillStep, toReview, review};
