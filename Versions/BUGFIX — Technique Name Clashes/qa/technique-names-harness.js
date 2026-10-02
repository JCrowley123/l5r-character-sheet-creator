/*
 * BUGFIX — Technique Name Clashes: real-browser acceptance. The input HTML is read only.
 *   node technique-names-harness.js <sheet.html>
 *
 * Found 2 October 2026: the sheet looks a Technique's text up by name alone. "The Gift of the Lady"
 * is the Doji Courtier's Rank 5 (Core Rulebook p.111) and the Hitomi Kikage Zumi Order's Rank 1
 * (Imperial Histories 1 p.215), and a Rank 5 Doji Courtier was shown the monk's text. "Forge Your
 * Own Fate" is the Toku Bushi's Rank 4 (Core Rulebook p.222) and the Technique of the Master of
 * Games, a ronin Path recorded but never offered (Book of Air p.180), and a Toku Bushi was shown the
 * Path's text. Owner's ruling (2 October 2026): rows a saved character still holds with text the
 * sheet wrote, and now knows to be wrong or missing, are rewritten when it is opened; a row the
 * player edited is never touched.
 *
 * Oracles: what the books say (written here), the trunk's own TECH_DESCRIPTIONS (whose later entry
 * for the shared name is the monk's), Phase 4.6's own AP46.DESCRIPTIONS for the Path's text, the
 * rendered Techniques list, and what the Characters list stores and reports as saved. Characters
 * are opened through the real Load button. Every scenario has its own page and setup, and declares
 * its assertion identities first, so an exception fails what it did not reach.
 */
'use strict';
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');
const sheet = process.argv[2];
const results = [];
const canonical = v => Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object'
  ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canonical(v[k])])) : v;
const same = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
function record(id, actual, expected, detail = '') {
  if (results.some(r => r.id === id)) throw new Error('duplicate assertion ' + id);
  const pass = same(actual, expected);
  results.push({ id, pass });
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : '\n expected ' + JSON.stringify(expected)
    + '\n actual ' + JSON.stringify(actual) + (detail ? '\n ' + detail : '')));
}
async function scenario(browser, prefix, names, run) {
  const ids = names.map(n => 'TN-' + prefix + '-' + n);
  const check = (n, a, e = true, detail = '') => {
    const id = 'TN-' + prefix + '-' + n;
    if (!ids.includes(id)) throw new Error('undeclared assertion ' + id);
    record(id, a, e, detail);
  };
  let error = '', page = null;
  try { page = await open(browser); await run(page, check); }
  catch (e) { error = String(e.stack || e).split('\n').slice(0, 5).join('\n'); }
  finally { if (page) await page.context().close().catch(() => {}); }
  for (const id of ids) if (!results.some(r => r.id === id)) record(id, 'not reached', 'completed', error);
}

async function open(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  page.errors = [];
  page.on('pageerror', e => page.errors.push(String(e)));
  // A load check reports through console.error, so it counts as an error here.
  // (The fonts are blocked below, and Chromium reports each blocked request the same way; those are not the sheet's.)
  page.on('console', m => { if (m.type() === 'error' && !/^Failed to load resource/.test(m.text())) page.errors.push('console: ' + m.text().slice(0, 300)); });
  await page.route('https://fonts.googleapis.com/**', r => r.abort());
  await page.route('https://fonts.gstatic.com/**', r => r.abort());
  await page.goto(pathToFileURL(path.resolve(sheet)).href, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => { const T = window.__L5R_TEST__; return !!T && !!window.__L5R_CAROUSEL__?.isReady?.()
    && (!T.CL11 || T.CL11.ready || T.CL11.enabled() === false); }, null, { timeout: 60000 });
  await page.evaluate(() => window.__L5R_TEST__.CL11?.close?.());
  await page.waitForTimeout(150);
  return page;
}

// A fresh character in one School; recalcAll() grants its Techniques at the Rank Insight gives.
const setup = (p, o) => p.evaluate(o => {
  const T = window.__L5R_TEST__, $ = id => document.getElementById(id);
  T.resetToBaseline();
  $('f_clan').value = o.clan || '';
  T.saveSchoolsList([{ name: o.school, frozen: false, frozenRank: null, floorRank: 1, anchorInsightRank: 0 }]);
  T.recalcAll();
}, o);
// Insight is Rings x10 + Skill Ranks + the Insight bonus field (160 R2, 185 R3, 210 R4, 235 R5).
const insight = (p, target) => p.evaluate(t => {
  const T = window.__L5R_TEST__, $ = id => document.getElementById(id);
  T.recalcAll();
  const now = parseFloat($('f_insightPts').value) || 0, bonus = parseFloat($('f_insightBonus').value) || 0;
  $('f_insightBonus').value = String(bonus + t - now);
  T.recalcAll();
  return parseInt($('f_rank').value, 10);
}, target);
// The Techniques list as [name, description], in list order.
const techRows = p => p.evaluate(() => Array.from(document.querySelectorAll('#techList .entry'))
  .map(d => [d.querySelector('.en-name').value, (d.querySelector('.en-desc') || {}).value || '']));
const rowText = (rows, name, tag) => (rows.find(r => r[0] === name && r[1].indexOf(tag) === 0) || [null, null])[1];
const TAG = (rank, school) => '[School Technique — Rank ' + rank + ', ' + school + '] ';
// Facts from the books, independent of the fix.
const DOJI_BOOK = ['Courtier (Manipulation) / Awareness', 'Etiquette (Courtesy) / Willpower', '+5k0', '(Core Rulebook p.111)'];
const RENAMED = 'Forge Your Own Fate (Master of Games)';

(async () => {
  const browser = await chromium.launch(process.env.L5R_CHROME ? { executablePath: process.env.L5R_CHROME } : {});
  try {
    // 1. What loads: the checks are clean, the Path renamed with its text, the old name freed.
    await scenario(browser, 'LOAD', ['CHECK-CLEAN', 'PATHS-CHECK-CLEAN', 'PATH-RENAMED', 'PATH-TEXT-KEPT',
      'OLD-NAME-FREED', 'NO-ERRORS'], async (p, check) => {
      const r = await p.evaluate(RENAMED => {
        const T = window.__L5R_TEST__, paths = T.ALTERNATE_PATHS_ENABLED === true && T.AP46;
        const pathText = paths ? T.AP46.DESCRIPTIONS['Forge Your Own Fate'] : null;
        const mog = T.findPath('Master of Games [Courtier]');
        return { own: T.TECHNAMES ? T.TECHNAMES.assertResolve() : 'no TECHNAMES', paths: !!paths,
          ap46: paths ? T.AP46.assertResolve() : [], tech: mog ? mog.tech : 'no Path',
          kept: paths ? T.techniqueDescription(RENAMED) === pathText && !!pathText : true,
          freed: paths ? T.techniqueDescription('Forge Your Own Fate') !== pathText : true };
      }, RENAMED);
      check('CHECK-CLEAN', r.own, []);
      check('PATHS-CHECK-CLEAN', r.ap46, []);
      // With Phase 4.6 switched off there is no Path to rename.
      check('PATH-RENAMED', r.tech, r.paths ? RENAMED : 'no Path');
      check('PATH-TEXT-KEPT', r.kept, true);
      check('OLD-NAME-FREED', r.freed, true);
      check('NO-ERRORS', p.errors, []);
    });

    // 2. The Doji Courtier's Rank 5 shows the Doji's Technique; the monk's shows the monk's.
    await scenario(browser, 'GIFT', ['DOJI-R5', 'DOJI-NOT-MONK', 'DOJI-EXPLAIN', 'KIKAGE-R1', 'NO-ERRORS'], async (p, check) => {
      const monk = await p.evaluate(() => window.__L5R_TEST__.TECH_DESCRIPTIONS['The Gift of the Lady']);
      await setup(p, { clan: 'Crane', school: 'Doji Courtier' });
      const rank = await insight(p, 235);
      const doji = rowText(await techRows(p), 'The Gift of the Lady', TAG(5, 'Doji Courtier'));
      const body = doji ? doji.slice(TAG(5, 'Doji Courtier').length) : '';
      check('DOJI-R5', [rank, DOJI_BOOK.filter(s => body.indexOf(s) < 0)], [5, []], body);
      check('DOJI-NOT-MONK', !!body && body !== monk, true);
      const explain = await p.evaluate(() => window.__L5R_TEST__.unlockTechniques('Doji Courtier', 5).debugExplanation);
      check('DOJI-EXPLAIN', [explain.indexOf('(Core Rulebook p.111)') >= 0, explain.indexOf(monk) < 0], [true, true]);
      const KZ = 'The Hitomi Kikage Zumi Order [Monk]';
      await setup(p, { school: KZ });
      check('KIKAGE-R1', rowText(await techRows(p), 'The Gift of the Lady', TAG(1, KZ)), TAG(1, KZ) + monk);
      check('NO-ERRORS', p.errors, []);
    });

    // 3. A Toku Bushi's Rank 4 no longer shows the Path's text.
    await scenario(browser, 'TOKU', ['R4-NOT-PATH-TEXT', 'R4-AS-DESCRIBED', 'NO-ERRORS'], async (p, check) => {
      await setup(p, { clan: 'Monkey', school: 'Toku Bushi' });
      const rank = await insight(p, 210);
      const r4 = rowText(await techRows(p), 'Forge Your Own Fate', TAG(4, 'Toku Bushi'));
      const { pathText, now } = await p.evaluate(() => ({ now: window.__L5R_TEST__.techniqueDescription('Forge Your Own Fate'),
        pathText: window.__L5R_TEST__.AP46 ? window.__L5R_TEST__.AP46.DESCRIPTIONS['Forge Your Own Fate'] : null }));
      check('R4-NOT-PATH-TEXT', [rank, !!r4 && r4.indexOf('Master of Games') < 0 && (!pathText || r4.indexOf(pathText) < 0)], [4, true], r4);
      check('R4-AS-DESCRIBED', r4, TAG(4, 'Toku Bushi') + now);
      check('NO-ERRORS', p.errors, []);
    });

    // 4. A character saved before the fix, opened through the Characters list's Load button: its
    //    stale rows are rewritten; an edited row, an untagged row and a correct row are not; the
    //    sheet does not count the open as a change, and storage changes only at the next save.
    await scenario(browser, 'OLDSAVE', ['TOKU-REWRITTEN', 'DOJI-REWRITTEN', 'EDITED-KEPT', 'UNTAGGED-KEPT', 'KIKAGE-KEPT',
      'NOT-A-CHANGE', 'STORED-UNTIL-SAVED', 'NO-ERRORS'], async (p, check) => {
      const KZ = 'The Hitomi Kikage Zumi Order [Monk]';
      const { monk, pathText } = await p.evaluate(() => ({ monk: window.__L5R_TEST__.TECH_DESCRIPTIONS['The Gift of the Lady'],
        pathText: '+2k1 on Social Skill rolls against anyone of higher Status, while you keep a modest, subservient manner. (Master of Games, Book of Air p.180)' }));
      await setup(p, { clan: 'Monkey', school: 'Toku Bushi' });
      await insight(p, 210);
      // The rows as the third release of Phase 4.6 (Part I) and an earlier School left them.
      await p.evaluate(({ monk, pathText, KZ }) => {
        const T = window.__L5R_TEST__, list = document.getElementById('techList');
        const rows = Array.from(list.querySelectorAll('.entry'));
        const toku4 = rows.find(d => d.querySelector('.en-name').value === 'Forge Your Own Fate');
        toku4.querySelector('.en-desc').value = '[School Technique — Rank 4, Toku Bushi] ' + pathText;
        const toku1 = rows.find(d => d.querySelector('.en-name').value === 'Toku’s Lesson');
        toku1.querySelector('.en-desc').value = '[School Technique — Rank 1, Toku Bushi] My own note on this Technique.';
        list.appendChild(T.makeEntry({ name: 'The Gift of the Lady', cost: 0, desc: '[School Technique — Rank 5, Doji Courtier] ' + monk }, true, 'XP'));
        list.appendChild(T.makeEntry({ name: 'The Gift of the Lady', cost: 0, desc: '[School Technique — Rank 1, ' + KZ + '] ' + monk }, true, 'XP'));
        list.appendChild(T.makeEntry({ name: 'Forge Your Own Fate', cost: 0, desc: pathText }, true, 'XP'));
      }, { monk, pathText, KZ });
      await p.evaluate(() => { const f = document.getElementById('f_name'); f.value = 'Toku Old Save';
        f.dispatchEvent(new Event('input', { bubbles: true })); });
      const before = await p.evaluate(() => document.getElementById('charSelect').value);
      await p.evaluate(() => document.getElementById('btnSaveAs').click());
      await p.waitForFunction(b => { const v = document.getElementById('charSelect').value; return v && v !== b; }, before);
      const id = await p.evaluate(() => document.getElementById('charSelect').value);
      await p.evaluate(() => { document.getElementById('charSelect').value = ''; document.getElementById('btnLoad').click(); });
      await p.waitForFunction(() => document.getElementById('f_name').value === '');
      await p.evaluate(i => { document.getElementById('charSelect').value = i; document.getElementById('btnLoad').click(); }, id);
      await p.waitForFunction(() => document.getElementById('f_name').value === 'Toku Old Save');
      await p.waitForTimeout(200);
      const rows = await techRows(p);
      const now = await p.evaluate(() => window.__L5R_TEST__.techniqueDescription('Forge Your Own Fate'));
      check('TOKU-REWRITTEN', rowText(rows, 'Forge Your Own Fate', TAG(4, 'Toku Bushi')), TAG(4, 'Toku Bushi') + now);
      const doji = rowText(rows, 'The Gift of the Lady', TAG(5, 'Doji Courtier')) || '';
      check('DOJI-REWRITTEN', DOJI_BOOK.filter(s => doji.indexOf(s) < 0), [], doji);
      check('EDITED-KEPT', rowText(rows, 'Toku’s Lesson', TAG(1, 'Toku Bushi')), TAG(1, 'Toku Bushi') + 'My own note on this Technique.');
      check('UNTAGGED-KEPT', rows.filter(r => r[0] === 'Forge Your Own Fate' && r[1] === pathText).length, 1);
      check('KIKAGE-KEPT', rowText(rows, 'The Gift of the Lady', TAG(1, KZ)), TAG(1, KZ) + monk);
      check('NOT-A-CHANGE', await p.evaluate(() => { const C = window.__L5R_TEST__.CL11;
        return !C || C.enabled() === false || C.lastSaved === C.snapshot(); }), true);
      const stored = await p.evaluate(i => localStorage.getItem('l5r-sheet:local:l5r-char:' + i), id);
      check('STORED-UNTIL-SAVED', !!stored && stored.indexOf('[School Technique — Rank 4, Toku Bushi] ' + pathText.replace(/"/g, '\\"')) >= 0, true);
      check('NO-ERRORS', p.errors, []);
    });

    // 5. The load check covers every School Technique, described or not, and a shared name.
    await scenario(browser, 'WIDE', ['PATH-NAMED-LIKE-A-SCHOOL', 'SHARED-WITHOUT-OWN-TEXT', 'CLEAN-AFTER', 'NO-ERRORS'], async (p, check) => {
      const r = await p.evaluate(() => {
        const T = window.__L5R_TEST__, lib = T.ALTERNATE_PATH_LIBRARY, heichi = T.ALL_SCHOOL_TECHNIQUES['Heichi Bushi'];
        // An Usagi Bushi Technique: it had no text before Phase 6 (Part G), so the old check passed it.
        lib.push({ name: 'Harness Path', tech: 'Leap of the Hare', replaces: [], requires: {} });
        const pathClash = T.TECHNAMES.assertResolve().filter(m => m.indexOf('Harness Path') >= 0 && m.indexOf('Usagi Bushi') >= 0).length;
        lib.pop();
        const first = heichi[0];
        heichi[0] = 'Swift as Lightning';
        const shared = T.TECHNAMES.assertResolve().filter(m => m.indexOf('"Swift as Lightning" is shared by') === 0).length;
        heichi[0] = first;
        return { pathClash, shared, after: T.TECHNAMES.assertResolve() };
      });
      check('PATH-NAMED-LIKE-A-SCHOOL', r.pathClash, 1);
      check('SHARED-WITHOUT-OWN-TEXT', r.shared, 2);
      check('CLEAN-AFTER', r.after, []);
      check('NO-ERRORS', p.errors, []);
    });
  } finally {
    await browser.close().catch(() => {});
  }
  const passed = results.filter(r => r.pass).length;
  console.log(`${passed}/${results.length} checks passed`);
  process.exitCode = passed === results.length && results.length > 0 ? 0 : 1;
})().catch(e => { console.error(e); console.log(`0/${Math.max(results.length, 1)} checks passed`); process.exitCode = 1; });
