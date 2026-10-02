/*
 * PART G — Phase 6 School Technique Text (first release): real-browser acceptance. Read only.
 *   node technique-text-harness.js <sheet.html>
 *
 * Measured 2 October 2026: 72 of the 338 School Technique names had no text of their own, every one
 * in the 20 Minor Clan and Mantis Schools, and showed the "not yet available" notice (the owner saw
 * it under an Usagi Bushi's and a Yoritomo Courtier's Techniques). This release writes them in our
 * own words with book and page.
 *
 * Oracles: the pages below, written here from the books and the sourcebook index (not from the
 * fragment); the trunk's own School libraries (ALL_SCHOOL_TECHNIQUES) and its own fallback notice
 * (techniqueDescription() of a name no Technique has); the rendered Techniques list; what the
 * Characters list stores and reports as saved. A character saved before this release is opened
 * through the real Load button; its rows are rewritten by the Technique Name Clashes fix, which this
 * release depends on for existing characters (declared in both ROLLBACK.md files).
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
  const ids = names.map(n => 'T6-' + prefix + '-' + n);
  const check = (n, a, e = true, detail = '') => {
    const id = 'T6-' + prefix + '-' + n;
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
  // A load check reports through console.error. The fonts are blocked below and Chromium reports
  // each blocked request as an error too; those are not the sheet's.
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

// [School, its Techniques from Rank 1, where each is written up]. Pages from the books (Core
// Rulebook PDF page = printed + 3; the other two books PDF = printed + 1), checked 2 October 2026.
const BOOK = [
  ['Yoritomo Bushi', ['The Way of the Mantis', 'Voice of the Storm', 'Strike of the Mantis', 'The Rolling Wave', 'Hand of Osano-Wo'], 'Core Rulebook p.120'],
  ['Moshi Shugenja', ['Favor of the Sun'], 'Core Rulebook p.121'],
  ['Yoritomo Courtier', ['Duty Before Honor', 'Storm Heart', 'Command the Winds', 'Will of the Storm', 'Strength in All Things'], 'Core Rulebook p.121'],
  ['Tsuruchi Archer [Bushi]', ['Always Be Ready', 'The Arrow Knows the Way', 'The Wasp’s Sting', 'Flight of No-Mind', 'Tsuruchi’s Eye'], 'Core Rulebook p.122'],
  ['Ichiro Bushi', ['Transcend the Mountain', 'Strength of the Badger', 'Crushing Blow', 'Crashing Stones', 'Return the Strike'], 'Core Rulebook p.216'],
  ['Komori Shugenja', ['The Kami’s Whispers'], 'Core Rulebook p.217'],
  ['Heichi Bushi', ['The Charge of the Boar', 'The Strength of Opposition', 'The Speed of the Boar', 'The Anger of the Boar', 'Beyond the Mountains'], 'Core Rulebook p.218'],
  ['Tonbo Shugenja', ['Guided by Fate'], 'Core Rulebook p.218'],
  ['Kitsune Shugenja', ['Essence of Chikushudo'], 'Core Rulebook p.220'],
  ['Usagi Bushi', ['Speed of the Hare', 'Leap of the Hare', 'Swift as Lightning', 'Kick of the Hare', 'Reichin’s Style'], 'Core Rulebook p.221'],
  ['Toku Bushi', ['Toku’s Lesson', 'The Strength of One Man', 'Courage Above All', 'Forge Your Own Fate', 'Fortune Favors the Mortal Man'], 'Core Rulebook p.222'],
  ['Tsi Smith [Artisan]', ['Tools of the Fortunes', 'Tsi Xing Guo’s Blessing', 'A Crafter’s Dedication', 'Exhaustive Knowledge', 'Star-filled Steel'], 'Core Rulebook p.223'],
  ['Morito Bushi', ['Legacy of the Four Winds', 'The Wind Blows Many Ways', 'Thunder and Fury', 'The Blade Upon the Wind', 'Fast and Furious'], 'Core Rulebook p.224'],
  ['Chuda Shugenja [Snake]', ['To Punish the Wicked'], 'Core Rulebook p.224'],
  ['Suzume Bushi', ['All Things in Time', 'Purity of Chi', 'Wisdom is the Greatest Weapon', 'Quiet Spirit, Steady Blade', 'Slow and Deadly'], 'Core Rulebook p.225'],
  ['Kasuga Smuggler [Courtier]', ['Way of the Tortoise', 'The Shell of the Tortoise', 'The Eyes of the Emperor', 'Hand in Hand', 'The Tortoise Smiles'], 'Core Rulebook p.227'],
  ['Mantis Brawler [Bushi]', ['Way of Drunken Fists', 'Drunk Loses His Sandal', 'Drunk Never Falls', 'Two Drunks Dance', 'Drunk Pounds a Door'],
    ['The Great Clans p.166', 'The Great Clans p.166', 'The Great Clans p.166', 'The Great Clans p.167', 'The Great Clans p.167']],
  ['Tsuruchi Bounty Hunter [Bushi]', ['A Hunter’s Sense', 'No Prey Escapes', 'Justice of the Wasp', 'Twin Sting Strike', 'Eyes of the Wasp'], 'The Great Clans p.168'],
  ['Yoritomo Shugenja', ['Child of the Sea'], 'The Great Clans p.169'],
  ['Fuzake Shugenja', ['The Sideways Path'], 'Secrets of the Empire p.238'],
];
// [Technique, School, Rank, source], in book order.
const PINNED = [];
BOOK.forEach(([school, techs, src]) => techs.forEach((t, i) => PINNED.push([t, school, i + 1, Array.isArray(src) ? src[i] : src])));

// A fresh character in one School; recalcAll() grants its Techniques at the Rank Insight gives.
const setup = (p, o) => p.evaluate(o => {
  const T = window.__L5R_TEST__, $ = id => document.getElementById(id);
  T.resetToBaseline();
  $('f_clan').value = o.clan || '';
  T.saveSchoolsList([{ name: o.school, frozen: false, frozenRank: null, floorRank: 1, anchorInsightRank: 0 }]);
  T.recalcAll();
}, o);
const insight = (p, target) => p.evaluate(t => {
  const T = window.__L5R_TEST__, $ = id => document.getElementById(id);
  T.recalcAll();
  const now = parseFloat($('f_insightPts').value) || 0, bonus = parseFloat($('f_insightBonus').value) || 0;
  $('f_insightBonus').value = String(bonus + t - now);
  T.recalcAll();
  return parseInt($('f_rank').value, 10);
}, target);
const techRows = p => p.evaluate(() => Array.from(document.querySelectorAll('#techList .entry'))
  .map(d => [d.querySelector('.en-name').value, (d.querySelector('.en-desc') || {}).value || '']));
const TAG = (rank, school) => '[School Technique — Rank ' + rank + ', ' + school + '] ';
const fallbackOf = p => p.evaluate(() => window.__L5R_TEST__.techniqueDescription('\u0000no Technique has this name'));

(async () => {
  const browser = await chromium.launch(process.env.L5R_CHROME ? { executablePath: process.env.L5R_CHROME } : {});
  try {
    // 1. What loads: the 72 pinned in book order, each a School's own Technique at its Rank, each
    //    crediting its page, and no School Technique left without text.
    await scenario(browser, 'LOAD', ['SWITCH', 'ENTRIES', 'SCHOOL-RANK', 'CREDITS-PAGE', 'OWN-WORDS-LENGTH', 'ALL-HAVE-TEXT',
      'CHECK-CLEAN', 'NO-CLASHES', 'NO-ERRORS'], async (p, check) => {
      const r = await p.evaluate(PINNED => {
        const T = window.__L5R_TEST__, X = T.TECHTEXT6, fb = T.techniqueDescription('\u0000no Technique has this name');
        const missing = [];
        Object.keys(T.ALL_SCHOOL_TECHNIQUES).forEach(s => (T.ALL_SCHOOL_TECHNIQUES[s] || []).forEach(n => {
          if (T.techniqueDescription(n) === fb) missing.push(s + ': ' + n);
        }));
        return { on: T.TECHTEXT6_ENABLED, entries: X ? X.ENTRIES.map(e => [e[0], e[1], e[2]]) : null,
          wrongRank: PINNED.filter(([n, s, r]) => (T.ALL_SCHOOL_TECHNIQUES[s] || [])[r - 1] !== n).map(e => e[0]),
          noPage: PINNED.filter(([n, , , src]) => !T.techniqueDescription(n).endsWith(' (' + src + ')')).map(e => e[0]),
          short: PINNED.filter(([n]) => T.techniqueDescription(n).length < 50).map(e => e[0]),
          missing, own: X ? X.assertResolve() : 'no TECHTEXT6', clashes: X ? X.clashes : 'no TECHTEXT6' };
      }, PINNED);
      check('SWITCH', r.on, true);
      check('ENTRIES', r.entries, PINNED.map(e => e.slice(0, 3)));
      check('SCHOOL-RANK', r.wrongRank, []);
      check('CREDITS-PAGE', r.noPage, []);
      check('OWN-WORDS-LENGTH', r.short, []);
      check('ALL-HAVE-TEXT', r.missing, []);
      check('CHECK-CLEAN', r.own, []);
      check('NO-CLASHES', r.clashes, []);
      check('NO-ERRORS', p.errors, []);
    });

    // 2. Each of the 20 Schools, granted at its top Rank: every row carries its Technique's text.
    await scenario(browser, 'GRANT', ['EVERY-SCHOOL', 'NONE-FALLBACK', 'NO-ERRORS'], async (p, check) => {
      const fb = await fallbackOf(p), wrong = [], fallback = [];
      for (const [school, techs, src] of BOOK) {
        await setup(p, { school });
        await insight(p, 235);
        const rows = await techRows(p);
        techs.forEach((t, i) => {
          const row = rows.find(r => r[0] === t && r[1].indexOf(TAG(i + 1, school)) === 0);
          const want = ' (' + (Array.isArray(src) ? src[i] : src) + ')';
          if (!row || !row[1].endsWith(want)) wrong.push(school + ' ' + (i + 1) + ': ' + (row ? row[1].slice(-40) : 'no row'));
          if (row && row[1].endsWith(fb)) fallback.push(t);
        });
      }
      check('EVERY-SCHOOL', wrong, []);
      check('NONE-FALLBACK', fallback, []);
      check('NO-ERRORS', p.errors, []);
    });

    // 3. The owner's Usagi Bushi, through the real Clan & School picker and Apply School button,
    //    and the Toku Bushi's Rank 4 (the Technique a Path's text once stood in for).
    await scenario(browser, 'APPLY', ['USAGI-R1', 'TOKU-R4', 'NO-ERRORS'], async (p, check) => {
      await p.evaluate(() => {
        const T = window.__L5R_TEST__, $ = id => document.getElementById(id);
        T.resetToBaseline();
        // The picker lists the Minor Clans under one "Minor Clan" choice, then a Minor Clan picker.
        $('cfs_clan').value = 'Minor Clan'; $('cfs_clan').dispatchEvent(new Event('change', { bubbles: true }));
        $('cfs_minorClan').value = 'Hare'; $('cfs_minorClan').dispatchEvent(new Event('change', { bubbles: true }));
        $('cfs_school').value = 'Usagi Bushi'; $('cfs_school').dispatchEvent(new Event('change', { bubbles: true }));
        $('cfs_applySchool').click();
      });
      await p.waitForFunction(() => document.getElementById('f_school').value === 'Usagi Bushi');
      await p.waitForTimeout(100);
      const usagi = (await techRows(p)).find(r => r[0] === 'Speed of the Hare');
      check('USAGI-R1', !!usagi && usagi[1].indexOf(TAG(1, 'Usagi Bushi')) === 0 && usagi[1].indexOf('Athletics') > 0
        && usagi[1].endsWith(' (Core Rulebook p.221)'), true, usagi && usagi[1]);
      await setup(p, { clan: 'Monkey', school: 'Toku Bushi' });
      await insight(p, 210);
      const toku = (await techRows(p)).find(r => r[0] === 'Forge Your Own Fate');
      // Core Rulebook p.222: a Void Point makes the attacker drop the two highest damage dice.
      check('TOKU-R4', !!toku && /two highest/.test(toku[1]) && toku[1].endsWith(' (Core Rulebook p.222)'), true, toku && toku[1]);
      check('NO-ERRORS', p.errors, []);
    });

    // 4. Characters saved before this release, opened through the Characters list's Load button:
    //    every row still holding the notice gets its text (a School whose name holds "]" too); a row
    //    the player edited does not; the open is not a change; Play mode shows the same rows.
    await scenario(browser, 'OLDSAVE', ['NOTICE-REPLACED', 'BRACKET-SCHOOL', 'EDITED-KEPT', 'NOT-A-CHANGE', 'PLAY-SAME', 'NO-ERRORS'], async (p, check) => {
      const fb = await fallbackOf(p);
      await setup(p, { clan: 'Hare', school: 'Usagi Bushi' });
      await insight(p, 235);
      // The rows as a build before this release wrote them: the notice, under each School's tag.
      await p.evaluate(fb => {
        const T = window.__L5R_TEST__, list = document.getElementById('techList');
        Array.from(list.querySelectorAll('.entry')).forEach(d => {
          const desc = d.querySelector('.en-desc'), m = /^\[School Technique — Rank \d+, Usagi Bushi\] /.exec(desc.value);
          if (m) desc.value = m[0] + (d.querySelector('.en-name').value === 'Leap of the Hare' ? 'My own reminder: leap, then strike.' : fb);
        });
        ['Way of Drunken Fists', 'Drunk Loses His Sandal', 'Drunk Never Falls'].forEach((n, i) => list.appendChild(
          T.makeEntry({ name: n, cost: 0, desc: '[School Technique — Rank ' + (i + 1) + ', Mantis Brawler [Bushi]] ' + fb }, true, 'XP')));
        const f = document.getElementById('f_name'); f.value = 'Usagi Old Save'; f.dispatchEvent(new Event('input', { bubbles: true }));
      }, fb);
      const before = await p.evaluate(() => document.getElementById('charSelect').value);
      await p.evaluate(() => document.getElementById('btnSaveAs').click());
      await p.waitForFunction(b => { const v = document.getElementById('charSelect').value; return v && v !== b; }, before);
      const id = await p.evaluate(() => document.getElementById('charSelect').value);
      await p.evaluate(() => { document.getElementById('charSelect').value = ''; document.getElementById('btnLoad').click(); });
      await p.waitForFunction(() => document.getElementById('f_name').value === '');
      await p.evaluate(i => { document.getElementById('charSelect').value = i; document.getElementById('btnLoad').click(); }, id);
      await p.waitForFunction(() => document.getElementById('f_name').value === 'Usagi Old Save');
      await p.waitForTimeout(200);
      const rows = await techRows(p);
      const usagi = BOOK.find(b => b[0] === 'Usagi Bushi')[1].filter(n => n !== 'Leap of the Hare');
      check('NOTICE-REPLACED', usagi.filter(n => { const r = rows.find(x => x[0] === n); return !r || r[1].endsWith(fb) || !r[1].endsWith(' (Core Rulebook p.221)'); }), []);
      check('BRACKET-SCHOOL', ['Way of Drunken Fists', 'Drunk Loses His Sandal', 'Drunk Never Falls']
        .filter(n => { const r = rows.find(x => x[0] === n); return !r || !r[1].endsWith(' (The Great Clans p.166)'); }), []);
      check('EDITED-KEPT', (rows.find(r => r[0] === 'Leap of the Hare') || [])[1], TAG(2, 'Usagi Bushi') + 'My own reminder: leap, then strike.');
      check('NOT-A-CHANGE', await p.evaluate(() => { const C = window.__L5R_TEST__.CL11;
        return !C || C.enabled() === false || C.lastSaved === C.snapshot(); }), true);
      await p.evaluate(() => window.__L5R_TEST__.MODES12?.set?.('play'));
      await p.waitForTimeout(100);
      const play = await techRows(p);
      await p.evaluate(() => window.__L5R_TEST__.MODES12?.set?.('manage'));
      check('PLAY-SAME', play, rows);
      check('NO-ERRORS', p.errors, []);
    });
  } finally {
    await browser.close().catch(() => {});
  }
  const passed = results.filter(r => r.pass).length;
  console.log(`${passed}/${results.length} checks passed`);
  process.exitCode = passed === results.length && results.length > 0 ? 0 : 1;
})().catch(e => { console.error(e); console.log(`0/${Math.max(results.length, 1)} checks passed`); process.exitCode = 1; });
