/*
 * BUGFIX — Multiple Schools Keep Earlier Techniques: real-browser acceptance. The input HTML is read only.
 *   node ms-techniques-harness.js <sheet.html>
 *
 * Found 1 October 2026 while assessing Phase 4.6: once a School added with the Multiple Schools
 * Advantage unlocked, the trunk stripped every Technique the earlier School had granted (and a monk's
 * free Kiho picks), because it reads any change of the active School as the School being replaced.
 * Core Rulebook p.151 (and the sidebar on p.152): the character stops progressing in the old School
 * and keeps what it taught.
 *
 * Oracles: the rendered Techniques list (#techList), the Schools list the sheet saves, collectData()
 * and the libraries' own Technique lists (ALL_SCHOOL_TECHNIQUES), never the fix. Schools are added
 * with the real "+ Add School" select, replaced with the real Apply School button, and renamed with
 * an input event on the School field, as typing sends. Every scenario has its own page and setup,
 * and declares its assertion identities first, so an exception fails what it did not reach.
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
  const ids = names.map(n => 'MS-' + prefix + '-' + n);
  const check = (n, a, e = true, detail = '') => {
    const id = 'MS-' + prefix + '-' + n;
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
  await page.route('https://fonts.googleapis.com/**', r => r.abort());
  await page.route('https://fonts.gstatic.com/**', r => r.abort());
  await page.goto(pathToFileURL(path.resolve(sheet)).href, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => { const T = window.__L5R_TEST__; return !!T && !!window.__L5R_CAROUSEL__?.isReady?.()
    && (!T.CL11 || T.CL11.ready || T.CL11.enabled() === false); }, null, { timeout: 60000 });
  await page.evaluate(() => window.__L5R_TEST__.CL11?.close?.());
  await page.waitForTimeout(150);
  return page;
}

// A fresh character with one School. `withSkillsFor` adds a Rank 1 row for every concrete School
// Skill of each named School (the sheet's own Rule 4 gate for an added School); `techs` are rows
// typed by the player.
const setup = (p, o) => p.evaluate(o => {
  const T = window.__L5R_TEST__, $ = id => document.getElementById(id);
  T.resetToBaseline();
  $('f_clan').value = o.clan || '';
  T.saveSchoolsList([{ name: o.school, frozen: false, frozenRank: null, floorRank: 1, anchorInsightRank: 0 }]);
  const have = new Set();
  (o.withSkillsFor || []).forEach(s => T.schoolConcreteSkillNames(s).forEach(n => {
    if (have.has(n)) return; have.add(n);
    $('skillsBody').appendChild(T.makeSkillRow({ name: n, trait: 'Intelligence', rank: 1 }));
  }));
  (o.advs || []).forEach(n => $('advList').appendChild(T.makeEntry({ name: n, cost: 0 }, true)));
  (o.techs || []).forEach(t => $('techList').appendChild(T.makeEntry(t, true, 'XP')));
  T.recalcAll();
}, o);
// Insight is Rings x10 + Skill Ranks + the Insight bonus field; set the bonus so Insight lands on
// `target` (chosen mid-band: 160 R2, 185 R3, 210 R4, 235 R5, 260 R6).
const insight = (p, target) => p.evaluate(t => {
  const T = window.__L5R_TEST__, $ = id => document.getElementById(id);
  T.recalcAll();
  const now = parseFloat($('f_insightPts').value) || 0, bonus = parseFloat($('f_insightBonus').value) || 0;
  $('f_insightBonus').value = String(bonus + t - now);
  T.recalcAll();
  return parseFloat($('f_insightPts').value);
}, target);
// The real "+ Add School" control: its toggle, then its select.
const addSchool = (p, name) => p.evaluate(n => {
  document.getElementById('btnAddSchoolToggle').click();
  const sel = document.getElementById('addSchoolSelect');
  const opt = Array.from(sel.options).find(o => o.value === n);
  if (!opt || opt.disabled) return 'not offered: ' + n;
  sel.value = n; sel.dispatchEvent(new Event('change', { bubbles: true }));
  return 'added';
}, name);
// The real Apply School button, through the Clan & School picker.
async function applySchool(p, clan, name) {
  await p.evaluate(({ clan, name }) => {
    const $ = id => document.getElementById(id);
    $('cfs_clan').value = clan; $('cfs_clan').dispatchEvent(new Event('change', { bubbles: true }));
    $('cfs_school').value = name; $('cfs_school').dispatchEvent(new Event('change', { bubbles: true }));
    $('cfs_applySchool').click();
  }, { clan, name });
  await p.waitForFunction(n => document.getElementById('f_school').value === n, name);
  await p.waitForTimeout(100);
}
// The Techniques list as "Name :: tag". The tag is read up to the first "] " (a School name may hold
// "]", never "] "), independently of how the fix reads it.
const rows = p => p.evaluate(() => Array.from(document.querySelectorAll('#techList .entry')).map(d => {
  const name = d.querySelector('.en-name').value, desc = (d.querySelector('.en-desc') || {}).value || '';
  const tag = (desc.match(/^\[.*?\] /) || [''])[0].trim();
  return tag ? name + ' :: ' + tag : name + ' :: (untagged)';
}).sort());
const schools = p => p.evaluate(() => window.__L5R_TEST__.getSchoolsList()
  .map(s => s.name + (s.frozen ? ' frozen R' + s.frozenRank : ' active')));
const rank = p => p.evaluate(() => parseInt(document.getElementById('f_rank').value, 10));
// Expected rows from the library itself.
const granted = (p, school, upTo, from = 1) => p.evaluate(({ school, upTo, from }) => {
  const list = window.__L5R_TEST__.ALL_SCHOOL_TECHNIQUES[school] || [];
  const out = [];
  for (let r = from; r <= Math.min(upTo, 5); r++) if (list[r - 1]) out.push(list[r - 1] + ' :: [School Technique — Rank ' + r + ', ' + school + ']');
  return out;
}, { school, upTo, from });
const sorted = a => a.slice().sort();
const MANUAL = { name: 'Notes from my sensei', cost: 0, desc: 'Typed by the player.' };
const MANUAL_ROW = 'Notes from my sensei :: (untagged)';

(async () => {
  const browser = await chromium.launch(process.env.L5R_CHROME ? { executablePath: process.env.L5R_CHROME } : {});
  try {
    // 1. The reported case: a Rank 3 Hida Bushi adds Hiruma Bushi.
    await scenario(browser, 'ADD', ['BASE-R3', 'LIST', 'KEEPS-ON-ADD', 'SECOND-R1', 'SECOND-R2', 'NO-DUPLICATES',
      'PERSIST-ROWS', 'PERSIST-SCHOOLS', 'PLAY-ROWS', 'NO-ERRORS'], async (p, check) => {
      await setup(p, { clan: 'Crab', school: 'Hida Bushi', withSkillsFor: ['Hiruma Bushi'], advs: ['Multiple Schools'], techs: [MANUAL] });
      await insight(p, 185);
      const hida = await granted(p, 'Hida Bushi', 3);
      check('BASE-R3', await rows(p), sorted(hida.concat(MANUAL_ROW)));
      check('LIST', [await addSchool(p, 'Hiruma Bushi'), await schools(p)], ['added', ['Hida Bushi frozen R3', 'Hiruma Bushi active']]);
      check('KEEPS-ON-ADD', await rows(p), sorted(hida.concat(MANUAL_ROW)));
      await insight(p, 210);
      check('SECOND-R1', [await rank(p), await rows(p)], [1, sorted(hida.concat(MANUAL_ROW, await granted(p, 'Hiruma Bushi', 1)))]);
      await insight(p, 235);
      const both = sorted(hida.concat(MANUAL_ROW, await granted(p, 'Hiruma Bushi', 2)));
      check('SECOND-R2', [await rank(p), await rows(p)], [2, both]);
      await p.evaluate(() => { const T = window.__L5R_TEST__; T.recalcAll(); T.recalcAll(); T.recalcAll(); });
      check('NO-DUPLICATES', await rows(p), both);
      await p.evaluate(() => { const T = window.__L5R_TEST__; const d = JSON.parse(JSON.stringify(T.collectData()));
        T.resetToBaseline(); T.recalcAll(); T.applyData(d); T.recalcAll(); });
      check('PERSIST-ROWS', await rows(p), both);
      check('PERSIST-SCHOOLS', await schools(p), ['Hida Bushi frozen R3', 'Hiruma Bushi active']);
      await p.evaluate(() => window.__L5R_TEST__.MODES12?.set?.('play'));
      await p.waitForTimeout(100);
      const play = await rows(p);
      await p.evaluate(() => window.__L5R_TEST__.MODES12?.set?.('manage'));
      check('PLAY-ROWS', play, both);
      check('NO-ERRORS', p.errors, []);
    });

    // 2. The sheet's own gate still holds: without the new School's Skills it unlocks nothing,
    //    and the earlier School's rows were never at risk.
    await scenario(browser, 'GATE', ['NOTHING-NEW', 'EARLIER-KEPT'], async (p, check) => {
      await setup(p, { clan: 'Crab', school: 'Hida Bushi', advs: ['Multiple Schools'] });
      await insight(p, 185);
      const hida = await granted(p, 'Hida Bushi', 3);
      await addSchool(p, 'Hiruma Bushi');
      await insight(p, 235);
      const now = await rows(p);
      check('NOTHING-NEW', now.filter(r => r.includes('Hiruma')), []);
      check('EARLIER-KEPT', now, sorted(hida));
    });

    // 3. A third School, whose name holds "]": every School keeps its own rows.
    await scenario(browser, 'THREE', ['LIST', 'ALL-KEPT', 'NO-ERRORS'], async (p, check) => {
      await setup(p, { clan: 'Crab', school: 'Hida Bushi', withSkillsFor: ['Hiruma Bushi', 'Kaiu Engineer [Artisan/Bushi]'], advs: ['Multiple Schools'] });
      await insight(p, 185);
      await addSchool(p, 'Hiruma Bushi');
      await insight(p, 235);
      await addSchool(p, 'Kaiu Engineer [Artisan/Bushi]');
      await insight(p, 260);
      check('LIST', await schools(p), ['Hida Bushi frozen R3', 'Hiruma Bushi frozen R2', 'Kaiu Engineer [Artisan/Bushi] active']);
      check('ALL-KEPT', await rows(p), sorted((await granted(p, 'Hida Bushi', 3)).concat(
        await granted(p, 'Hiruma Bushi', 2), await granted(p, 'Kaiu Engineer [Artisan/Bushi]', 1))));
      check('NO-ERRORS', p.errors, []);
    });

    // 4. Renaming the active School by typing replaces only that School: an earlier School (here
    //    one whose name holds "]") keeps its rows.
    await scenario(browser, 'RENAME', ['BEFORE', 'EARLIER-KEPT', 'RENAMED-DROPPED', 'NEW-NAME', 'MANUAL-KEPT'], async (p, check) => {
      await setup(p, { clan: 'Crab', school: 'Kaiu Engineer [Artisan/Bushi]', withSkillsFor: ['Hida Bushi', 'Hiruma Bushi'],
        advs: ['Multiple Schools'], techs: [MANUAL] });
      await insight(p, 160);
      const kaiu = await granted(p, 'Kaiu Engineer [Artisan/Bushi]', 2);
      await addSchool(p, 'Hida Bushi');
      await insight(p, 185);
      check('BEFORE', await rows(p), sorted(kaiu.concat(MANUAL_ROW, await granted(p, 'Hida Bushi', 1))));
      await p.evaluate(() => { const f = document.getElementById('f_school');
        f.value = 'Hiruma Bushi'; f.dispatchEvent(new Event('input', { bubbles: true })); });
      const now = await rows(p);
      check('EARLIER-KEPT', kaiu.every(r => now.includes(r)), true, JSON.stringify(now));
      check('RENAMED-DROPPED', now.filter(r => r.includes(', Hida Bushi]')), []);
      check('NEW-NAME', now.filter(r => r.includes(', Hiruma Bushi]')), await granted(p, 'Hiruma Bushi', 1));
      check('MANUAL-KEPT', now.includes(MANUAL_ROW), true);
    });

    // 5. A monk's free Kiho picks are the School's grant too: kept when a School is added past it,
    //    stripped (with every dropped School's rows) when Apply School starts again. A purchased
    //    Kiho is the player's and is never touched.
    await scenario(browser, 'MONK', ['BASE', 'ADD-KEEPS-TECH', 'ADD-KEEPS-FREE-KIHO', 'ADD-NEW-SCHOOL', 'RESET-TECH-ROWS',
      'RESET-FREE-KIHO', 'RESET-PURCHASED-KIHO-KEPT', 'RESET-MANUAL-KEPT', 'NO-ERRORS'], async (p, check) => {
      const MONK = 'The Four Temples [Monk]';
      // Rows in the exact form the Kiho picker writes them (050-kiho-rules.js): a free pick carries
      // the free-pick tag and the School that granted it.
      const { kiho, freeTag } = await p.evaluate(() => ({ kiho: window.__L5R_TEST__.KIHO_LIBRARY[0],
        freeTag: window.__L5R_TEST__.KIHO_FREE_TAG }));
      const meta = extra => '[Kiho — ' + kiho.ring + ' ' + kiho.mastery + ', ' + kiho.type + (kiho.atemi ? ' (Atemi)' : '') + extra + '] ';
      const FREE = { name: kiho.name, cost: 0, desc: meta(freeTag + MONK) + 'A free starting pick.' };
      const PAID = { name: 'Bought Kiho', cost: 6, desc: meta('') + 'Bought with Experience.' };
      await setup(p, { school: MONK, withSkillsFor: ['Hiruma Bushi'], advs: ['Multiple Schools'], techs: [MANUAL, FREE, PAID] });
      await insight(p, 160);
      const monkRows = await granted(p, MONK, 2);
      const freeRow = FREE.name + ' :: ' + FREE.desc.match(/^\[.*?\] /)[0].trim();
      const paidRow = PAID.name + ' :: ' + PAID.desc.match(/^\[.*?\] /)[0].trim();
      check('BASE', await rows(p), sorted(monkRows.concat(MANUAL_ROW, freeRow, paidRow)));
      await addSchool(p, 'Hiruma Bushi');
      await insight(p, 185);
      const now = await rows(p);
      check('ADD-KEEPS-TECH', monkRows.every(r => now.includes(r)), true, JSON.stringify(now));
      check('ADD-KEEPS-FREE-KIHO', now.includes(freeRow), true);
      check('ADD-NEW-SCHOOL', now.filter(r => r.includes(', Hiruma Bushi]')), await granted(p, 'Hiruma Bushi', 1));
      await applySchool(p, 'Crab', 'Hida Bushi');
      const reset = await rows(p);
      check('RESET-TECH-ROWS', reset.filter(r => r.includes(' :: [School Technique')),
        sorted(await granted(p, 'Hida Bushi', await rank(p))));
      check('RESET-FREE-KIHO', reset.includes(freeRow), false);
      check('RESET-PURCHASED-KIHO-KEPT', reset.includes(paidRow), true);
      check('RESET-MANUAL-KEPT', reset.includes(MANUAL_ROW), true);
      check('NO-ERRORS', p.errors, []);
    });

    // 6. The trunk's own behaviour for a one-School character: Apply School replaces, not stacks.
    await scenario(browser, 'SINGLE', ['REPLACED', 'MANUAL-KEPT', 'NO-ERRORS'], async (p, check) => {
      await setup(p, { clan: 'Crab', school: 'Hida Bushi', techs: [MANUAL] });
      await insight(p, 185);
      await applySchool(p, 'Crab', 'Hiruma Bushi');
      const now = await rows(p);
      check('REPLACED', now.filter(r => r !== MANUAL_ROW), sorted(await granted(p, 'Hiruma Bushi', await rank(p))));
      check('MANUAL-KEPT', now.includes(MANUAL_ROW), true);
      check('NO-ERRORS', p.errors, []);
    });
  } finally {
    await browser.close().catch(() => {});
  }
  const passed = results.filter(r => r.pass).length;
  console.log(`${passed}/${results.length} checks passed`);
  process.exitCode = passed === results.length && results.length > 0 ? 0 : 1;
})().catch(e => { console.error(e); console.log(`0/${Math.max(results.length, 1)} checks passed`); process.exitCode = 1; });
