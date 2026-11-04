'use strict';
// Release 15a, A01 (PART H PHASE 15.1.1): one Review reminder for each open School choice.
//   node review-reminder-harness.js <sheet.html> [--variant]
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL.
// Oracles are independent of the layer: an open choice's presence is counted by parsing each card's own
// "Still to choose:" list here, never by asking RR15Logic.
const path = require('path');
const D = require('./wizard-drive.cjs');
const pins = require('./expected-checks.json');
const sheet = path.resolve(process.argv[2]);
const seen = {};
const errors = [];
const set = (id, ok, detail) => { seen[id] = ok === true; if (ok !== true) console.log('  detail ' + id + ': ' + JSON.stringify(detail === undefined ? ok : detail).slice(0, 600)); };
const LORE = 'Skills: The subject of your School’s Lore';
const DONE = 'Every choice your School leaves to you is made.';

// The Review as presented: cards (title, own list), A01 reminders, and the old box.
const presented = page => page.evaluate(() => {
  const body = document.getElementById('cw112Body');
  const list = detail => { const at = detail.lastIndexOf('Still to choose: ');
    if (at < 0) return []; let rest = detail.slice(at + 17); const stop = rest.search(/\.(\s|$)/);
    if (stop >= 0) rest = rest.slice(0, stop); return rest.split(/; |, /); };
  const cards = [...body.querySelectorAll('.cw112-finding')].map(li => { const t = li.querySelector('strong').textContent;
    const d = li.textContent.slice(t.length).trim(); return {className: li.className, title: t, detail: d, list: list(d)}; });
  return {
    school: window.__L5R_TEST__.CW112.appliedSchool(),
    open: window.__L5R_TEST__.CW1122.allOpen(),
    titles: window.__L5R_TEST__.CW112.findings().map(f => f.title),
    cards,
    reminders: [...body.querySelectorAll('.rr15-reminder')].map(li => [li.querySelector('strong').textContent, li.textContent]),
    box: (b => b ? {className: b.className, text: b.textContent, items: [...b.querySelectorAll('li')].map(l => l.textContent)} : null)(document.getElementById('cw1122Still')),
    order: [...body.querySelectorAll('ul.cw112-findings > li')].map(li => li.querySelector('strong').textContent),
    title: document.getElementById('cw112Title').textContent
  };
});
// Each open choice is named exactly once: in one card for this School, one reminder, or one box line.
function eachOnce(r) {
  if (!r.open.length) return {ok: false, why: 'nothing open'};
  const counts = r.open.map(o => {
    const line = o.step + ': ' + o.text;
    return r.cards.filter(c => c.title.indexOf(r.school + ': ') === 0 && c.list.includes(o.text)).length +
      r.reminders.filter(x => x[0] === line).length + (r.box ? r.box.items.filter(i => i === line).length : 0);
  });
  return {ok: counts.every(n => n === 1), counts, open: r.open};
}
async function session(browser, opts, body) {
  const {context, page} = await D.fresh(browser, sheet, opts);
  try { await body(page); }
  catch (e) { console.log('  scenario stopped: ' + String(e.message || e).split('\n')[0]); }
  finally { errors.push(...page.errors); await context.close(); }
}

(async () => {
  const browser = await D.launch();
  try {
    // ---------- Pure logic
    await session(browser, {}, async page => {
      Object.assign(seen, await page.evaluate(() => {
        const T = window.__L5R_TEST__, L = T.RR15Logic, out = {};
        out['SEAM-PRESENT'] = !!(T.RR15 && L && T.REVIEW_ONE_REMINDER_ENABLED === true && T.RR15.installed === true);
        if (!L) return out;
        const skill = {title: 'Kuni Shugenja: 2 free Skill choices still open', detail: 'Still to choose: Any one Weapon Skill; Any 1 Bugei Skill. Choose these as this School’s Skills in Manage.'};
        out['LOGIC-SKILL-LIST'] = L.names(skill, 'Kuni Shugenja', 'Any one Weapon Skill') && L.names(skill, 'Kuni Shugenja', 'Any 1 Bugei Skill');
        const spells = {title: 'Kuni Shugenja: starting spells not all chosen', detail: 'Core Rulebook p.107 gives Sense, Commune, Summon, 3 Earth, 2 Fire, 1 Water. Still to choose: 3 Earth spells, 2 Fire spells, 1 Water spell.'};
        out['LOGIC-SPELL-LIST'] = ['3 Earth spells', '2 Fire spells', '1 Water spell'].every(t => L.names(spells, 'Kuni Shugenja', t)) &&
          !L.names(spells, 'Kuni Shugenja', '3 Earth') && !L.names(spells, 'Kuni Shugenja', 'Sense');
        out['LOGIC-OTHER-SCHOOL'] = !L.names(skill, 'Kitsu Shugenja', 'Any one Weapon Skill') && !L.names(skill, 'Kuni', 'Any one Weapon Skill') &&
          !L.names({title: '40 XP unspent', detail: 'Still to choose: Any one Weapon Skill.'}, 'Kuni Shugenja', 'Any one Weapon Skill');
        out['LOGIC-WHOLE-ITEM'] = !L.names(skill, 'Kuni Shugenja', 'Any one Weapon') && !L.names(skill, 'Kuni Shugenja', 'one Weapon Skill') &&
          !L.names({title: 'X: s', detail: 'Still to choose: 11 Water spells.'}, 'X', '1 Water spells') &&
          !L.names({title: 'X: s', detail: 'No list here.'}, 'X', 'No list here');
        const monk = 'The Order of the Nameless Gift [Monk]';
        const items = [{step: 'Skills', text: 'Any two Skills (1 of 2)'}, {step: 'Skills', text: 'Any two Skills (2 of 2)'},
          {step: 'Skills', text: 'The subject of your School’s Lore'}, {step: 'Kiho', text: '3 free Kiho picks'}];
        const split = L.split(items, [{title: monk + ': 2 free Skill choices still open', detail: 'Still to choose: Any two Skills (1 of 2); Any two Skills (2 of 2). Choose these as this School’s Skills in Manage.'},
          {title: '40 XP unspent', detail: 'Not a problem.'}], monk);
        out['LOGIC-SPLIT'] = JSON.stringify(split) === JSON.stringify({duplicates: items.slice(0, 2), unique: items.slice(2)});
        return out;
      }));
    });

    // ---------- Kuni, nothing chosen
    await session(browser, {}, async page => {
      await D.begin(page, 'kuni');
      await D.next(page);
      if ((await D.title(page)) !== 'Skills') throw Error('expected Skills');
      await D.next(page);
      set('KUNI-STEP-NUDGE-UNCHANGED', await page.evaluate(() => (document.getElementById('cw1122Open') || {}).textContent) ===
        'Still to choose: Any one Weapon Skill. Choose now, or press “Leave for later” to finish on the sheet.');
      await D.next(page);
      for (let i = 0; i < 6 && (await D.title(page)) !== 'Advantages & Disadvantages'; i++) {
        const t = await D.title(page); await D.next(page); if ((await D.title(page)) === t) await D.next(page);
      }
      const before = await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
      await D.toReview(page, false);
      const after = await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
      const r = await presented(page);
      set('KUNI-NO-DUPLICATE-BOX', r.title === 'Review' && r.box === null, r.box);
      set('KUNI-CARDS-KEPT', JSON.stringify(r.cards.map(c => c.title)) === JSON.stringify(r.titles) &&
        r.titles.includes('Kuni Shugenja: 1 free Skill choice still open') && r.titles.includes('Kuni Shugenja: starting spells not all chosen'), r.cards);
      const once = eachOnce(r);
      set('KUNI-EACH-OPEN-ONCE', once.ok && r.open.length === 4, once);
      set('KUNI-NO-EXTRA-REMINDERS', r.reminders.length === 0, r.reminders);
      set('KUNI-REVIEW-NO-DATA-CHANGE', before === after);
      // Take the free-Skill card away from what Review shows: its item is then no longer a duplicate and must
      // come back, as a reminder; the spells, still on their card, stay suppressed.
      await page.evaluate(() => { const C = window.__L5R_TEST__.CW112, prev = C.findings;
        C.findings = function(){ return (prev.apply(this, arguments) || []).filter(f => !/free Skill choice/.test(f.title)); };
        C.render(); });
      const r2 = await presented(page);
      set('ONLY-TRUE-DUPLICATES', JSON.stringify(r2.reminders.map(x => x[0])) === JSON.stringify(['Skills: Any one Weapon Skill']) &&
        r2.box === null && eachOnce(r2).ok, r2);
    });

    // ---------- Kuni, overspent with nothing chosen; Finish still asks
    await session(browser, {}, async page => {
      await D.begin(page, 'kuni');
      await D.overspend(page);
      await D.toReview(page, false);
      const r = await presented(page);
      set('KUNI-OVERSPENT-WARNING-FIRST', r.cards.length > 0 && r.cards[0].title === 'Overspent by 30 XP' && r.cards[0].className === 'cw112-finding cw112-warning', r.cards);
      const once = eachOnce(r);
      set('KUNI-OVERSPENT-EACH-ONCE', once.ok && r.box === null && r.reminders.length === 0, once);
      await page.click('#cw112Next');
      await page.waitForFunction(() => document.getElementById('appConfirmOverlay').style.display === 'flex');
      const asked = await page.evaluate(() => [document.getElementById('appConfirmMsg').textContent, document.getElementById('appConfirmOk').textContent,
        document.getElementById('appConfirmCancel').textContent, window.__L5R_TEST__.XW8Logic ? window.__L5R_TEST__.XW8Logic.finishText(30) : null]);
      await page.click('#appConfirmCancel');
      await page.waitForFunction(() => document.getElementById('appConfirmOverlay').style.display !== 'flex');
      const stay = await presented(page);
      set('KUNI-FINISH-CONFIRMS', asked[0] === asked[3] && asked[1] === 'Finish' && asked[2] === 'Stay' && stay.title === 'Review' &&
        stay.box === null && eachOnce(stay).ok, {asked, stay: stay.title});
      await page.click('#cw112Next');
      await page.waitForFunction(() => document.getElementById('appConfirmOverlay').style.display === 'flex');
      await page.click('#appConfirmOk');
      await page.waitForFunction(() => !window.__L5R_TEST__.CW112.isOpen());
      const sheetState = await page.evaluate(() => { const T = window.__L5R_TEST__; T.MODES12.set('management'); T.recalcAll();
        return [document.getElementById('f_school').value, [...document.querySelectorAll('#validationReport .sc8-open')].map(b => b.textContent)]; });
      set('KUNI-FINISH-COMPLETES', sheetState[0] === 'Kuni Shugenja' && sheetState[1].includes('Choose School Skills') &&
        sheetState[1].includes('Choose School scrolls'), sheetState);
    });

    // ---------- Kuni, every choice made
    await session(browser, {}, async page => {
      await D.begin(page, 'kuni');
      await D.toReview(page, true);
      const r = await presented(page);
      set('KUNI-COMPLETE-DONE-LINE', r.open.length === 0 && r.box && r.box.className === 'cw112-done' && r.box.text === DONE && r.reminders.length === 0, r);
    });

    // ---------- Matsu Beastmaster
    await session(browser, {}, async page => {
      await D.begin(page, 'matsu');
      await D.toReview(page, false);
      const r = await presented(page);
      const once = eachOnce(r);
      set('MATSU-EACH-OPEN-ONCE', once.ok && r.box === null && r.reminders.length === 0 &&
        r.titles.includes('Matsu Beastmaster [Bushi]: 1 free Skill choice still open'), {once, r});
    });
    await session(browser, {}, async page => {
      await D.begin(page, 'matsu');
      await D.overspend(page);
      await D.toReview(page, false);
      const r = await presented(page);
      set('MATSU-OVERSPENT', r.cards[0] && r.cards[0].title === 'Overspent by 34 XP' && eachOnce(r).ok && r.box === null &&
        JSON.stringify(r.cards.map(c => c.title)) === JSON.stringify(r.titles), r);
    });
    await session(browser, {}, async page => {
      await D.begin(page, 'matsu');
      await D.toReview(page, true);
      const r = await presented(page);
      set('MATSU-COMPLETE-DONE-LINE', r.open.length === 0 && r.box && r.box.text === DONE && r.reminders.length === 0, r);
    });

    // ---------- A Brotherhood monk: the Lore subject and Kiho are not on any card
    await session(browser, {}, async page => {
      await D.begin(page, 'monk');
      await D.toReview(page, false);
      const r = await presented(page);
      const kiho = await page.evaluate(() => window.__L5R_TEST__.kihoEntitlement().freePicksLeft);
      const want = [LORE, 'Kiho: ' + kiho + ' free Kiho picks'];
      set('MONK-UNIQUE-AS-CARDS', kiho > 1 && JSON.stringify(r.reminders) === JSON.stringify(want.map(w => [w, w + ' Still to choose. You can finish this on the sheet.'])), r.reminders);
      const once = eachOnce(r);
      set('MONK-EACH-OPEN-ONCE', once.ok && r.box === null && r.open.length === 4, once);
      const monkSkills = 'The Order of the Nameless Gift [Monk]: 2 free Skill choices still open';
      set('MONK-REMINDERS-BESIDE-SCHOOL', JSON.stringify(r.order) === JSON.stringify([monkSkills, want[0], want[1], '40 XP unspent']), r.order);
      set('MONK-NO-SIDEWAYS', await page.evaluate(() => { const v = document.getElementById('cw112View'); return v.scrollWidth <= v.clientWidth; }));
      await D.backTo(page, 'Kiho');
      await D.fillStep(page);
      await D.toReview(page, false);
      const r2 = await presented(page);
      set('MONK-KIHO-CLEARS', JSON.stringify(r2.reminders.map(x => x[0])) === JSON.stringify([LORE]) && eachOnce(r2).ok && r2.box === null, r2.reminders);
    });
    await session(browser, {}, async page => {
      await D.begin(page, 'monk');
      await D.overspend(page);
      await D.toReview(page, false);
      const r = await presented(page);
      set('MONK-OVERSPENT', r.order[0] === 'Overspent by 32 XP' && r.order[1] === 'The Order of the Nameless Gift [Monk]: 2 free Skill choices still open' &&
        r.order[2] === LORE && /^Kiho: \d+ free Kiho picks$/.test(r.order[3]) && r.order.length === 4 && eachOnce(r).ok, r.order);
    });
    await session(browser, {}, async page => {
      await D.begin(page, 'monk');
      await D.toReview(page, true);
      const r = await presented(page);
      set('MONK-COMPLETE-DONE-LINE', r.open.length === 0 && r.box && r.box.text === DONE && r.reminders.length === 0, r);
    });

    // ---------- A Shugenja School whose starting spells the sheet does not record (as Phase 11.2.2's suite does)
    await session(browser, {}, async page => {
      await page.evaluate(() => { const C = window.__L5R_TEST__.CW1123;
        if (C && C.forSchool('Isawa Shugenja')) { const previous = C.forSchool;
          C.forSchool = function(n){ return n === 'Isawa Shugenja' ? null : previous.apply(this, arguments); }; } });
      await page.evaluate(() => window.__L5R_TEST__.CL11.open());
      await page.click('#cl11Create');
      await page.fill('#cw112Name', 'Isawa Takeshi');
      await D.next(page);
      await D.exactPick(page, 'Phoenix'); await D.next(page);
      await D.exactPick(page, 'Isawa'); await D.next(page);
      await D.exactPick(page, 'Isawa Shugenja');
      await page.waitForFunction(() => document.getElementById('affinityPickModalOverlay').style.display === 'flex');
      await page.click('#affinityPick_Void'); await page.click('#affinityPickConfirm');
      await page.waitForFunction(() => window.__L5R_TEST__.CW112.appliedSchool() === 'Isawa Shugenja' && !window.__L5R_TEST__.CW112.busy);
      await D.next(page);
      await D.toReview(page, false);
      const r = await presented(page);
      set('UNRECORDED-SPELLS-KEPT', r.reminders.map(x => x[0]).includes('Spells: Your School’s starting spells') && r.box === null && eachOnce(r).ok, r);
    });

    // ---------- Desktop width
    await session(browser, {desktop: true}, async page => {
      await D.begin(page, 'kuni');
      await D.toReview(page, false);
      const r = await presented(page);
      set('DESKTOP-SAME', r.box === null && eachOnce(r).ok && r.reminders.length === 0 &&
        JSON.stringify(r.cards.map(c => c.title)) === JSON.stringify(r.titles), r);
    });
    seen['NO-SCRIPT-ERRORS'] = errors.length === 0;
  } finally {
    if (errors.length) console.error(errors);
    await browser.close();
    const passed = pins.filter(k => seen[k] === true).length;
    for (const id of pins) console.log((seen[id] === true ? 'PASS ' : 'FAIL ') + id);
    console.log(passed + '/' + pins.length + ' checks passed');
    if (passed !== pins.length) process.exitCode = 1;
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
