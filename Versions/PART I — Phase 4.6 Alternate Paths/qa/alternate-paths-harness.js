/*
 * Phase 4.6 (Part I), first release: the Core Rulebook's 18 Great Clan Alternate Paths, real-browser
 * acceptance. The input HTML is read only.   node alternate-paths-harness.js <sheet.html>
 *
 * Oracles: the book (pp. 246, 251-255), written out here as data the harness owns (which Schools each
 * Path reaches and at which Rank, its requirements, its page); the rendered Techniques list and the
 * libraries' own Technique lists (ALL_SCHOOL_TECHNIQUES); the picker as the player sees it; the
 * stored f_pathTaken; saves read through the real applyData(); and the Kiho counter the sheet shows.
 * The Monk Paths' reach is checked against the trunk's matching rules re-implemented here, so the new
 * clause filters cannot have changed it. Every scenario has its own page and setup, and declares its
 * assertion identities first, so an exception fails what it did not reach.
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
  const show = v => String(JSON.stringify(v)).slice(0, 900);
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : '\n expected ' + show(expected)
    + '\n actual ' + show(actual) + (detail ? '\n ' + detail : '')));
}
async function scenario(browser, prefix, names, run) {
  const ids = names.map(n => 'AP46-' + prefix + '-' + n);
  const check = (n, a, e = true, detail = '') => {
    const id = 'AP46-' + prefix + '-' + n;
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
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) page.errors.push('console: ' + m.text()); });
  await page.route('https://fonts.googleapis.com/**', r => r.abort());
  await page.route('https://fonts.gstatic.com/**', r => r.abort());
  await page.goto(pathToFileURL(path.resolve(sheet)).href, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => { const T = window.__L5R_TEST__; return !!T && !!window.__L5R_CAROUSEL__?.isReady?.()
    && (!T.CL11 || T.CL11.ready || T.CL11.enabled() === false); }, null, { timeout: 60000 });
  await page.evaluate(() => window.__L5R_TEST__.CL11?.close?.());
  await page.waitForTimeout(150);
  return page;
}

// ---------- The book, as data this harness owns ----------
const BOOK = [ // name, page, the Schools it reaches with the Rank it replaces there, Technique
  ['Oni Slayer [Shugenja]', 'p.251', ['Kuni Shugenja 3'], 'Bound by the World'],
  ['Crab Berserker [Bushi]', 'p.251', ['Hida Bushi 2', 'Hida Pragmatist [Bushi] 2', 'Hiruma Bushi 2', 'Kaiu Engineer [Artisan/Bushi] 2', 'Toritaka Bushi 2'], 'Berserker’s Rage'],
  ['Empress Guard [Bushi]', 'p.252', ['Daidoji Iron Warrior [Bushi] 4', 'Kakita Bushi 3'], 'To Defend Unto Death'],
  ['Asahina Fetishist [Shugenja]', 'p.252', ['Asahina Shugenja 2'], 'The World in the Palm of the Hand'],
  ['Mirumoto Mountaineer [Bushi]', 'p.252', ['Mirumoto Bushi 2'], 'Heart of the Mountain'],
  ['Tamori Warrior Priest [Shugenja]', 'p.252', ['Tamori Shugenja 4'], 'Strength of the Soul'],
  ['Deathseeker [Bushi]', 'p.253', ['Akodo Bushi 1', 'Ikoma Lion’s Shadow [Bushi] 1', 'Lion Elite Spearmen [Bushi] 1', 'Matsu Beastmaster [Bushi] 1', 'Matsu Berserker [Bushi] 1'], 'Honor of the Lion'],
  ['Bishamon’s Chosen [Shugenja]', 'p.253', ['Kitsu Shugenja 3'], 'Scion of Strength'],
  ['Yoritomo Scoundrel [Bushi]', 'p.253', ['Yoritomo Bushi 2'], 'Revel in Villainy'],
  ['Mantis Navigator [Shugenja]', 'p.253', ['Moshi Shugenja 3', 'Yoritomo Shugenja 3'], 'The Fortunes’ Guidance'],
  ['Shiba Yojimbo [Bushi]', 'p.254', ['Shiba Bushi 3'], 'Shiba’s Sacrifice'],
  ['Isawa Tensai [Shugenja]', 'p.254', ['Isawa Shugenja 2'], 'Embrace the Elements'],
  ['Bitter Lies Swordsman [Bushi]', 'p.254', ['Bayushi Bushi 3'], 'The Dark Sword of Bitter Lies'],
  ['Shadow Hunter [Shugenja]', 'pp.254-255', ['Soshi Shugenja 3', 'Yogo Wardmaster [Shugenja] 3'], 'Scourge in Shadow'],
  ['Shinjo Scout [Bushi]', 'p.255', ['Moto Bushi 2', 'Shinjo Bushi 2'], 'The Swift Soul'],
  ['Obsidian Magistrate [Bushi]', 'p.255', ['Daigotsu Bushi 1'], 'Strength in Terror'],
  ['Iuchi Traveler [Shugenja]', 'p.255', ['Horiuchi Shugenja 3', 'Iuchi Shugenja 3'], 'Where the Wind Wills'],
  ['Chuda Subversive [Shugenja]', 'p.255', ['Chuda Shugenja 4'], 'The Dark Kami’s Discretion'],
];
const MONK_PATHS = ['Student of Hitsu-do [Monk]', 'The Transcendent Brotherhood [Monk]', 'The Servants of Mercy [Monk]',
  'Order of Ebisu [Monk/Courtier]', 'Abbot [Monk]', 'Togashi Defender [Monk]', 'Brotherhood Spy [Monk]',
  'Defender of the Brotherhood [Monk/Courtier]', 'Barefoot Brethren [Monk]', 'Pure Song [Monk]', 'The Silent Ones [Monk]',
  'Dark Path Sohei [Monk]'];
const STEP_NAME = 'Phase 4.6 (Part I): Alternate Paths recorded against their School';

// ---------- Page helpers ----------
// A fresh character with one School. `traits` are set on the sheet's own Trait inputs; `skills` are
// rows {name, rank, emph}; `advs` and `disadvs` are rows typed into their lists.
const setup = (p, o) => p.evaluate(o => {
  const T = window.__L5R_TEST__, $ = id => document.getElementById(id);
  T.resetToBaseline();
  $('f_clan').value = o.clan || '';
  T.saveSchoolsList(o.schools || [{ name: o.school, frozen: false, frozenRank: null, floorRank: 1, anchorInsightRank: 0 }]);
  Object.keys(o.traits || {}).forEach(t => { $('trait_' + t.toLowerCase()).value = String(o.traits[t]); });
  // The Honor block's Rank field is what "Honor Rank" requirements read; Points is set to something
  // else on purpose, so a check that read Points instead would be caught.
  if (o.honor !== undefined) { $('f_honorRank').value = String(o.honor); $('f_honorPts').value = String(o.honor < 5 ? 9 : 1); }
  const have = new Set();
  (o.withSkillsFor || []).forEach(s => T.schoolConcreteSkillNames(s).forEach(n => {
    if (have.has(n)) return; have.add(n);
    $('skillsBody').appendChild(T.makeSkillRow({ name: n, trait: 'Intelligence', rank: 1 }));
  }));
  (o.skills || []).forEach(s => $('skillsBody').appendChild(T.makeSkillRow({ name: s.name, trait: s.trait || 'Intelligence', rank: s.rank, emph: s.emph || '' })));
  (o.advs || []).forEach(n => $('advList').appendChild(T.makeEntry({ name: n, cost: 0 }, true)));
  (o.disadvs || []).forEach(n => $('disadvList').appendChild(T.makeEntry({ name: n, cost: 0 }, true)));
  T.recalcAll();
}, o);
// Insight is Rings x10 + Skill Ranks + the Insight bonus field; set the bonus so Insight lands on
// `target` (mid-band: 120 R1, 160 R2, 185 R3, 210 R4, 235 R5).
const insight = (p, target) => p.evaluate(t => {
  const T = window.__L5R_TEST__, $ = id => document.getElementById(id);
  T.recalcAll();
  const now = parseFloat($('f_insightPts').value) || 0, bonus = parseFloat($('f_insightBonus').value) || 0;
  $('f_insightBonus').value = String(bonus + t - now);
  T.recalcAll();
  return parseInt($('f_rank').value, 10);
}, target);
// The real picker: choose the option, as a tap does, and let its change handlers run.
const pick = (p, name) => p.evaluate(n => {
  const sel = document.getElementById('pathPicker');
  sel.value = n; sel.dispatchEvent(new Event('change', { bubbles: true }));
  return sel.value;
}, name);
const options = p => p.evaluate(() => {
  const wrap = document.getElementById('pathPickerWrap');
  return { shown: wrap.style.display !== 'none',
    opts: Array.from(document.getElementById('pathPicker').options).map(o => o.textContent + (o.disabled ? ' [disabled]' : '')) };
});
const stored = p => p.evaluate(() => { const v = document.getElementById('f_pathTaken').value; try { return JSON.parse(v || '{}'); } catch (e) { return 'unparsable: ' + v; } });
const note = p => p.evaluate(() => { const n = document.getElementById('pathNote'); return n.style.display === 'none' ? '' : n.textContent; });
const status = p => p.evaluate(() => document.getElementById('statusMsg').textContent);
const rows = p => p.evaluate(() => Array.from(document.querySelectorAll('#techList .entry')).map(d => {
  const name = d.querySelector('.en-name').value, desc = (d.querySelector('.en-desc') || {}).value || '';
  const tag = (desc.match(/^\[.*?\] /) || [''])[0].trim();
  return tag ? name + ' :: ' + tag : name + ' :: (untagged)';
}).sort());
const granted = (p, school, ranks) => p.evaluate(({ school, ranks }) => {
  const list = window.__L5R_TEST__.ALL_SCHOOL_TECHNIQUES[school] || [];
  return ranks.filter(r => list[r - 1]).map(r => list[r - 1] + ' :: [School Technique — Rank ' + r + ', ' + school + ']');
}, { school, ranks });
const tagged = (name, rank, school) => name + ' :: [School Technique — Rank ' + rank + ', ' + school + ']';
const sorted = a => a.slice().sort();
const unmet = (p, name) => p.evaluate(n => window.__L5R_TEST__.pathRequirementsUnmet(window.__L5R_TEST__.findPath(n)), name);
const addSchool = (p, name) => p.evaluate(n => {
  document.getElementById('btnAddSchoolToggle').click();
  const sel = document.getElementById('addSchoolSelect');
  const opt = Array.from(sel.options).find(o => o.value === n);
  if (!opt || opt.disabled) return 'not offered: ' + n;
  sel.value = n; sel.dispatchEvent(new Event('change', { bubbles: true }));
  return 'added';
}, name);
const EARTH4 = { Stamina: 4, Willpower: 4 };

(async () => {
  const browser = await chromium.launch(process.env.L5R_CHROME ? { executablePath: process.env.L5R_CHROME } : {});
  try {
    // 1. What loads: the 18 Paths, their pages and Techniques, the load check, and their reach.
    await scenario(browser, 'LOAD', ['SWITCH', 'LIBRARY', 'SOURCES', 'DESCRIPTIONS', 'OWN-CHECK', 'TRUNK-CHECK', 'REACH',
      'MONK-REACH-UNCHANGED', 'NO-ERRORS'], async (p, check) => {
      const r = await p.evaluate(BOOK => {
        const T = window.__L5R_TEST__;
        const names = T.ALTERNATE_PATH_LIBRARY.map(x => x.name);
        const sources = {}, descriptions = {}, reach = {};
        BOOK.forEach(([name]) => {
          const path = T.findPath(name);
          sources[name] = path ? path.source : null;
          descriptions[name] = path ? T.techniqueDescription(path.tech) : null;
          const seen = new Set();
          reach[name] = [];
          T.allSchoolEntries().forEach(e => {
            if (seen.has(e.name)) return; seen.add(e.name);
            for (let rank = 1; rank <= 5; rank++) if (path && T.pathAvailableFor(path, e.name, rank)) reach[name].push(e.name + ' ' + rank);
          });
          reach[name].sort();
        });
        return { enabled: T.ALTERNATE_PATHS_ENABLED, names, sources, descriptions, reach, techs: BOOK.map(b => (T.findPath(b[0]) || {}).tech),
          own: T.AP46 ? T.AP46.assertResolve() : 'no AP46', trunk: T.assertPathSchoolsResolve() };
      }, BOOK);
      check('SWITCH', r.enabled, true);
      check('LIBRARY', [r.names, r.techs], [MONK_PATHS.concat(BOOK.map(b => b[0])), BOOK.map(b => b[3])]);
      check('SOURCES', r.sources, Object.fromEntries(BOOK.map(b => [b[0], 'Core Rulebook ' + b[1]])));
      // Our own words, ending with the Path and its page; never the "not yet available" fallback.
      check('DESCRIPTIONS', BOOK.filter(([name, page]) => {
        const d = r.descriptions[name] || '';
        return !d.endsWith('(' + name.replace(/ \[[^\]]*\]$/, '') + ', Core Rulebook ' + page + ')') || /not yet available/.test(d) || d.length < 80;
      }).map(b => b[0]), []);
      check('OWN-CHECK', r.own, []);
      check('TRUNK-CHECK', r.trunk, []);
      check('REACH', r.reach, Object.fromEntries(BOOK.map(b => [b[0], sorted(b[2])])));
      // The trunk's matching rules, re-implemented: the Monk Paths reach exactly what they did.
      const monk = await p.evaluate(MONK_PATHS => {
        const T = window.__L5R_TEST__;
        const oldMatch = (c, e, name, rank) => {
          if (c.rankMin !== undefined) { if (rank < c.rankMin) return false; } else if (c.rank !== undefined && rank !== c.rank) return false;
          if (c.school) { const want = T.resolveSchoolName(c.school); if (!want || want !== name) return false; }
          if (c.any === 'brotherhood' && !e.brotherhood) return false;
          if (c.any === 'monk' && !(e.monk || e.brotherhood)) return false;
          if (c.devotion && !(e.devotion && e.devotion.type === c.devotion)) return false;
          if (c.tags && !c.tags.every(t => (e.tags || []).includes(t))) return false;
          return true;
        };
        const diffs = [];
        const seen = new Set();
        T.allSchoolEntries().forEach(e => {
          if (seen.has(e.name)) return; seen.add(e.name);
          MONK_PATHS.forEach(n => {
            const path = T.findPath(n);
            for (let rank = 1; rank <= 5; rank++) {
              const was = !(path.excludes || []).some(x => T.resolveSchoolName(x) === e.name) && path.replaces.some(c => oldMatch(c, e, e.name, rank));
              if (was !== T.pathAvailableFor(path, e.name, rank)) diffs.push(n + ' / ' + e.name + ' ' + rank);
            }
          });
        });
        return { diffs, checked: seen.size };
      }, MONK_PATHS);
      check('MONK-REACH-UNCHANGED', [monk.diffs, monk.checked > 100], [[], true]);
      check('NO-ERRORS', p.errors, []);
    });

    // 2. School types and Clans.
    await scenario(browser, 'TYPES', ['SAMPLES', 'BUSHI-AGREES', 'SHUGENJA-FLAG', 'CLANS', 'NO-ERRORS'], async (p, check) => {
      const r = await p.evaluate(() => {
        const T = window.__L5R_TEST__, A = T.AP46, E = n => T.findAnySchoolLibraryEntry(n);
        const samples = ['Hida Bushi', 'Kaiu Engineer [Artisan/Bushi]', 'Shiba Artisan [Courtier]', 'Chuda Shugenja [Snake]',
          'Yogo Wardmaster [Shugenja]', 'The Togashi Tattooed Order [Monk]', 'Kakita Artisan', 'Goju Ninja', 'Kuni Shugenja',
          'Kuni Witch-Hunter [Monk]', 'Yasuki Courtier'].map(n => [n, A.schoolTypes(E(n))]);
        const disagree = [], unflagged = [];
        T.allSchoolEntries().forEach(e => {
          if ((A.schoolTypes(e).indexOf('bushi') >= 0) !== (T.schoolCasterCategory(e) === 'bushi' || !!(e.shugenja &&/\bbushi\b/i.test(e.name)))) disagree.push(e.name);
          if (e.shugenja && A.schoolTypes(e).indexOf('shugenja') < 0) unflagged.push(e.name);
        });
        return { samples, disagree, unflagged, clans: [A.schoolClans('Toritaka Bushi'), A.schoolClans('Moshi Shugenja'), A.schoolClans('Kakita Bushi'), A.schoolClans('Nobody School')] };
      });
      check('SAMPLES', r.samples, [['Hida Bushi', ['bushi']], ['Kaiu Engineer [Artisan/Bushi]', ['artisan', 'bushi']],
        ['Shiba Artisan [Courtier]', ['courtier']], ['Chuda Shugenja [Snake]', ['shugenja']], ['Yogo Wardmaster [Shugenja]', ['shugenja']],
        ['The Togashi Tattooed Order [Monk]', ['monk']], ['Kakita Artisan', ['artisan']], ['Goju Ninja', ['ninja']],
        ['Kuni Shugenja', ['shugenja']], ['Kuni Witch-Hunter [Monk]', ['monk']], ['Yasuki Courtier', ['courtier']]]);
      check('BUSHI-AGREES', r.disagree, []);
      check('SHUGENJA-FLAG', r.unflagged, []);
      check('CLANS', r.clans, [['Crab', 'Falcon'], ['Mantis'], ['Crane'], []]);
      check('NO-ERRORS', p.errors, []);
    });

    // 3. The picker for a Clan-and-type clause, and the Schools it must not reach.
    await scenario(browser, 'PICKER', ['HIDDEN-R1', 'SHOWN-R2-LOCKED', 'UNLOCKED', 'FITS-PHONE', 'NEGATIVES', 'NO-ERRORS'], async (p, check) => {
      await setup(p, { clan: 'Crab', school: 'Hida Bushi' });
      await insight(p, 120);
      check('HIDDEN-R1', (await options(p)).shown, false);
      await insight(p, 160);
      check('SHOWN-R2-LOCKED', await options(p), { shown: true, opts: ['— no Alternate Path —', 'Crab Berserker [Bushi] (replaces Rank 2) — 🔒 needs Earth 4 [disabled]'] });
      await p.evaluate(() => { const $ = id => document.getElementById(id); $('trait_stamina').value = '4'; $('trait_willpower').value = '4'; window.__L5R_TEST__.recalcAll(); });
      await insight(p, 160);
      check('UNLOCKED', await options(p), { shown: true, opts: ['— no Alternate Path —', 'Crab Berserker [Bushi] (replaces Rank 2)'] });
      // Measured inside its own swipe page (the Techniques page sits beside the others, off-screen).
      check('FITS-PHONE', await p.evaluate(() => {
        const sel = document.getElementById('pathPicker'), page = sel.closest('.car-page');
        const r = sel.getBoundingClientRect(), q = page.getBoundingClientRect();
        return [r.left >= q.left && r.right <= q.right, page.scrollWidth <= page.clientWidth, document.documentElement.scrollWidth <= window.innerWidth];
      }), [true, true, true]);
      const wrong = await p.evaluate(() => {
        const T = window.__L5R_TEST__, f = T.findPath;
        return [['Crab Berserker [Bushi]', 'Kuni Shugenja', 2], ['Crab Berserker [Bushi]', 'Matsu Berserker [Bushi]', 2],
          ['Crab Berserker [Bushi]', 'Hida Bushi', 3], ['Crab Berserker [Bushi]', 'Yasuki Courtier', 2],
          ['Mantis Navigator [Shugenja]', 'Yoritomo Bushi', 3], ['Mantis Navigator [Shugenja]', 'Kitsune Shugenja', 3],
          ['Shadow Hunter [Shugenja]', 'Bayushi Bushi', 3], ['Shadow Hunter [Shugenja]', 'Shosuro Infiltrator [Ninja]', 3],
          ['Deathseeker [Bushi]', 'Kitsu Shugenja', 1], ['Deathseeker [Bushi]', 'Ikoma Bard [Courtier]', 1],
          ['Empress Guard [Bushi]', 'Kakita Bushi', 4], ['Empress Guard [Bushi]', 'Daidoji Iron Warrior [Bushi]', 3],
          ['Chuda Subversive [Shugenja]', 'Chuda Shugenja [Snake]', 4]]
          .filter(([n, s, r]) => T.pathAvailableFor(f(n), s, r)).map(x => x.join(' / '));
      });
      check('NEGATIVES', wrong, []);
      check('NO-ERRORS', p.errors, []);
    });

    // 4. A Rank per clause: Empress Guard replaces Daidoji Iron Warrior 4 and Kakita Bushi 3.
    await scenario(browser, 'RANK', ['DAIDOJI-LABEL', 'DAIDOJI-RECORD', 'DAIDOJI-ROWS', 'DAIDOJI-STATUS', 'KAKITA-LABEL',
      'KAKITA-RECORD', 'KAKITA-ROWS', 'NO-ERRORS'], async (p, check) => {
      const D = 'Daidoji Iron Warrior [Bushi]', EG = 'Empress Guard [Bushi]';
      await setup(p, { clan: 'Crane', school: D, traits: { Perception: 3 } });
      check('DAIDOJI-LABEL', [await insight(p, 210), (await options(p)).opts], [4, ['— no Alternate Path —', EG + ' (replaces Rank 4)']]);
      await pick(p, EG);
      check('DAIDOJI-RECORD', await stored(p), { [D]: { 4: EG } });
      check('DAIDOJI-ROWS', await rows(p), sorted((await granted(p, D, [1, 2, 3])).concat(tagged('To Defend Unto Death', 4, D))));
      check('DAIDOJI-STATUS', await status(p), 'Alternate Path set: ' + EG + ' (replaces Rank 4 of ' + D + ').');
      await setup(p, { clan: 'Crane', school: 'Kakita Bushi', traits: { Perception: 3 } });
      check('KAKITA-LABEL', [await insight(p, 210), (await options(p)).opts], [4, ['— no Alternate Path —', EG + ' (replaces Rank 3)']]);
      await pick(p, EG);
      check('KAKITA-RECORD', await stored(p), { 'Kakita Bushi': { 3: EG } });
      check('KAKITA-ROWS', await rows(p), sorted((await granted(p, 'Kakita Bushi', [1, 2, 4])).concat(tagged('To Defend Unto Death', 3, 'Kakita Bushi'))));
      check('NO-ERRORS', p.errors, []);
    });

    // 5. Honor, a named Disadvantage, one Skill of a kind, an Emphasis, and the refusal behind the lock.
    await scenario(browser, 'REQ', ['HONOR-LOW', 'HONOR-MET', 'DISADV-MISSING', 'DISADV-MET', 'CRAFT-NONE', 'ARTISAN-R2',
      'ARTISAN-R3', 'CRAFT-R3', 'NOT-CRAFT', 'WEAPON-KENJUTSU', 'WEAPON-LOW', 'NOT-WEAPON', 'WEAPON-R2', 'EMPHASIS-MISSING',
      'EMPHASIS-MET', 'LOCKED-OPTION', 'REFUSED', 'HONOR-LIVE', 'NO-ERRORS'], async (p, check) => {
      await setup(p, { clan: 'Phoenix', school: 'Shiba Bushi', honor: 4.9 });
      check('HONOR-LOW', await unmet(p, 'Shiba Yojimbo [Bushi]'), ['Honor Rank 5']);
      await setup(p, { clan: 'Phoenix', school: 'Shiba Bushi', honor: 5.0 });
      check('HONOR-MET', await unmet(p, 'Shiba Yojimbo [Bushi]'), []);
      await setup(p, { clan: 'Lion', school: 'Akodo Bushi', honor: 6.5 });
      check('DISADV-MISSING', await unmet(p, 'Deathseeker [Bushi]'), ['the Dishonored Disadvantage']);
      await setup(p, { clan: 'Lion', school: 'Akodo Bushi', honor: 6.5, disadvs: ['Dishonored'] });
      check('DISADV-MET', await unmet(p, 'Deathseeker [Bushi]'), []);
      const AF = 'Asahina Fetishist [Shugenja]', CRAFT = ['one Craft or Artisan Skill at Rank 3'];
      await setup(p, { clan: 'Crane', school: 'Asahina Shugenja' });
      check('CRAFT-NONE', await unmet(p, AF), CRAFT);
      await setup(p, { clan: 'Crane', school: 'Asahina Shugenja', skills: [{ name: 'Artisan: Painting', rank: 2 }] });
      check('ARTISAN-R2', await unmet(p, AF), CRAFT);
      await setup(p, { clan: 'Crane', school: 'Asahina Shugenja', skills: [{ name: 'Artisan: Painting', rank: 3 }] });
      check('ARTISAN-R3', await unmet(p, AF), []);
      await setup(p, { clan: 'Crane', school: 'Asahina Shugenja', skills: [{ name: 'Craft: Armorsmithing', rank: 3 }] });
      check('CRAFT-R3', await unmet(p, AF), []);
      await setup(p, { clan: 'Crane', school: 'Asahina Shugenja', skills: [{ name: 'Craftsmanship', rank: 4 }, { name: 'Commerce', rank: 4 }] });
      check('NOT-CRAFT', await unmet(p, AF), CRAFT);
      const TW = 'Tamori Warrior Priest [Shugenja]', WEAPON = ['one Weapon Skill at Rank 3'];
      await setup(p, { clan: 'Dragon', school: 'Tamori Shugenja', skills: [{ name: 'Kenjutsu', rank: 3 }] });
      check('WEAPON-KENJUTSU', await unmet(p, TW), []);
      await setup(p, { clan: 'Dragon', school: 'Tamori Shugenja', skills: [{ name: 'Ninjutsu', rank: 3 }] });
      check('WEAPON-LOW', await unmet(p, TW), []);
      await setup(p, { clan: 'Dragon', school: 'Tamori Shugenja', skills: [{ name: 'Jiujutsu', rank: 4 }, { name: 'Defense', rank: 4 }] });
      check('NOT-WEAPON', await unmet(p, TW), WEAPON);
      await setup(p, { clan: 'Dragon', school: 'Tamori Shugenja', skills: [{ name: 'Kenjutsu', rank: 2 }] });
      check('WEAPON-R2', await unmet(p, TW), WEAPON);
      await setup(p, { clan: 'Dragon', school: 'Mirumoto Bushi', skills: [{ name: 'Athletics', rank: 3 }] });
      check('EMPHASIS-MISSING', await unmet(p, 'Mirumoto Mountaineer [Bushi]'), ['Athletics (Climbing) 3']);
      await setup(p, { clan: 'Dragon', school: 'Mirumoto Bushi', skills: [{ name: 'Athletics', rank: 3, emph: 'Climbing' }] });
      check('EMPHASIS-MET', await unmet(p, 'Mirumoto Mountaineer [Bushi]'), []);
      // The lock in the picker, and the handler's refusal behind it, use the new requirements too.
      await setup(p, { clan: 'Phoenix', school: 'Shiba Bushi', honor: 4.9 });
      await insight(p, 185);
      check('LOCKED-OPTION', (await options(p)).opts, ['— no Alternate Path —', 'Shiba Yojimbo [Bushi] (replaces Rank 3) — 🔒 needs Honor Rank 5 [disabled]']);
      await pick(p, 'Shiba Yojimbo [Bushi]');
      const refused = await p.evaluate(() => [document.getElementById('appConfirmOverlay').style.display,
        document.getElementById('appConfirmMsg').textContent]);
      await p.evaluate(() => document.getElementById('appConfirmOk').click());
      check('REFUSED', [refused, await stored(p)], [['flex', 'Shiba Yojimbo [Bushi] requires Honor Rank 5.'], {}]);
      // Typing in the Honor block redraws the lock at once (an Honor edit does not recalculate). The
      // value and an input event, as typing sends them: the Identity page is off-screen in the swipe
      // shell, where Playwright's fill() types into nothing.
      const typed = async v => {
        await p.evaluate(v => { const el = document.getElementById('f_honorRank'); el.value = String(v);
          el.dispatchEvent(new Event('input', { bubbles: true })); }, v);
        return (await options(p)).opts[1];
      };
      check('HONOR-LIVE', [await typed(5), await typed(4)], ['Shiba Yojimbo [Bushi] (replaces Rank 3)',
        'Shiba Yojimbo [Bushi] (replaces Rank 3) — 🔒 needs Honor Rank 5 [disabled]']);
      check('NO-ERRORS', p.errors, []);
    });

    // 6. A Path is its School's: the kickoff's risk 1, measured on 1 October.
    await scenario(browser, 'RECORD', ['FIRST-RECORD', 'FIRST-ROWS', 'ADDED', 'SECOND-OWN-R2', 'KEPT-ROW', 'RECORD-KEPT', 'READS',
      'NOTE-KEPT', 'UNLOCK-NAMED', 'CLEAR-ACTIVE-ONLY', 'NO-ERRORS'], async (p, check) => {
      const CB = 'Crab Berserker [Bushi]';
      await setup(p, { clan: 'Crab', school: 'Hida Bushi', traits: EARTH4, withSkillsFor: ['Hiruma Bushi'], advs: ['Multiple Schools'] });
      await insight(p, 160);
      await pick(p, CB);
      check('FIRST-RECORD', await stored(p), { 'Hida Bushi': { 2: CB } });
      check('FIRST-ROWS', await rows(p), sorted((await granted(p, 'Hida Bushi', [1])).concat(tagged('Berserker’s Rage', 2, 'Hida Bushi'))));
      check('ADDED', await addSchool(p, 'Hiruma Bushi'), 'added');
      check('SECOND-OWN-R2', [await insight(p, 210), (await rows(p)).filter(r => / Hiruma Bushi\]$/.test(r))],
        [2, sorted(await granted(p, 'Hiruma Bushi', [1, 2]))]);
      check('KEPT-ROW', (await rows(p)).includes(tagged('Berserker’s Rage', 2, 'Hida Bushi')), true);
      check('RECORD-KEPT', await stored(p), { 'Hida Bushi': { 2: CB } });
      check('READS', await p.evaluate(() => { const T = window.__L5R_TEST__;
        return [T.getPathTaken(), T.getPathTaken('Hida Bushi'), T.pathsTaken().map(x => x.name), T.pathAtRank(2)]; }),
        [{}, { 2: CB }, [CB], null]);
      check('NOTE-KEPT', (await note(p)).includes('Kept from Hida Bushi: ' + CB + ' (Rank 2)'), true);
      // Unlocking a named School reads that School's Path, whichever School is active.
      check('UNLOCK-NAMED', await p.evaluate(() => { const T = window.__L5R_TEST__;
        return ['Hida Bushi', 'Hiruma Bushi'].map(s => T.unlockTechniques(s, 2).techniquesUnlocked.map(t => t.rank + ' ' + t.name)); }),
        [['1 ' + (await granted(p, 'Hida Bushi', [1]))[0].split(' :: ')[0], '2 Berserker’s Rage'],
          (await granted(p, 'Hiruma Bushi', [1, 2])).map((r, i) => (i + 1) + ' ' + r.split(' :: ')[0])]);
      await pick(p, '');
      check('CLEAR-ACTIVE-ONLY', await stored(p), { 'Hida Bushi': { 2: CB } });
      check('NO-ERRORS', p.errors, []);
    });

    // 7. Saved data: the old record carried up by a Phase 7 format step.
    await scenario(browser, 'FORMAT', ['STEP', 'WRITTEN', 'UPGRADE-SHAPE', 'UPGRADE-REST-UNTOUCHED', 'LOAD-RECORD', 'LOAD-ROWS',
      'LEGACY-MONK', 'LEGACY-UNMATCHED', 'EMPTY-UNTOUCHED', 'ROUND-TRIP', 'RUNTIME-LEGACY', 'NO-ERRORS'], async (p, check) => {
      const CB = 'Crab Berserker [Bushi]';
      const steps = await p.evaluate(() => window.__L5R_TEST__.VersionManager.steps());
      const last = steps[steps.length - 1] || {};
      const before = steps.length > 1 ? steps[steps.length - 2].to : null;
      const current = await p.evaluate(() => window.__L5R_TEST__.VersionManager.current());
      check('STEP', [last.name, last.from, last.to, current], [STEP_NAME, before, before + 1, before + 1]);
      check('WRITTEN', await p.evaluate(() => window.__L5R_TEST__.collectData().schemaVersion), current);
      // A two-School character as the builds before this part saved it: the Path's Rank only.
      await setup(p, { clan: 'Crab', school: 'Hida Bushi', traits: EARTH4, withSkillsFor: ['Hiruma Bushi'], advs: ['Multiple Schools'] });
      await insight(p, 160);
      await pick(p, CB);
      await addSchool(p, 'Hiruma Bushi');
      await insight(p, 210);
      const old = await p.evaluate(({ from, CB }) => {
        const d = window.__L5R_TEST__.collectData();
        d.schemaVersion = from; d.fields.f_pathTaken = JSON.stringify({ 2: CB });
        return d;
      }, { from: last.from, CB });
      const up = await p.evaluate(d => window.__L5R_TEST__.VersionManager.upgrade(d), old);
      check('UPGRADE-SHAPE', JSON.parse(up.fields.f_pathTaken), { 'Hida Bushi': { 2: CB } });
      const rest = o => { const c = JSON.parse(JSON.stringify(o)); delete c.schemaVersion; delete c.fields.f_pathTaken; return c; };
      check('UPGRADE-REST-UNTOUCHED', [same(rest(up), rest(old)), up.schemaVersion], [true, current]);
      await setup(p, { clan: 'Crab', school: 'Kuni Shugenja' });
      await p.evaluate(d => window.__L5R_TEST__.applyData(d), old);
      check('LOAD-RECORD', await stored(p), { 'Hida Bushi': { 2: CB } });
      check('LOAD-ROWS', (await rows(p)).filter(r => / Hiruma Bushi\]$/.test(r)), sorted(await granted(p, 'Hiruma Bushi', [1, 2])));
      const upgradeField = (fields) => p.evaluate(({ fields, from }) => {
        const d = { schemaVersion: from, fields: Object.assign({ f_name: 'Legacy' }, fields) };
        return window.__L5R_TEST__.VersionManager.upgrade(d).fields.f_pathTaken;
      }, { fields, from: last.from });
      check('LEGACY-MONK', JSON.parse(await upgradeField({ f_school: 'The Four Temples [Monk]', f_schoolsData: '', f_pathTaken: JSON.stringify({ 2: 'Brotherhood Spy [Monk]' }) })),
        { 'The Four Temples [Monk]': { 2: 'Brotherhood Spy [Monk]' } });
      check('LEGACY-UNMATCHED', JSON.parse(await upgradeField({ f_school: 'Hida Bushi',
        f_schoolsData: JSON.stringify([{ name: 'Hida Bushi', frozen: false, frozenRank: null, floorRank: 3, anchorInsightRank: 0 }]),
        f_pathTaken: JSON.stringify({ 3: 'A Path From Another Book' }) })), { 'Hida Bushi': { 3: 'A Path From Another Book' } });
      check('EMPTY-UNTOUCHED', [await upgradeField({ f_school: 'Hida Bushi', f_pathTaken: '' }), await upgradeField({ f_school: 'Hida Bushi', f_pathTaken: '{}' })], ['', '{}']);
      const trip = await p.evaluate(() => { const T = window.__L5R_TEST__;
        const a = T.collectData(); T.applyData(a); const b = T.collectData(); return [a.fields.f_pathTaken, b.fields.f_pathTaken]; });
      check('ROUND-TRIP', [trip[0] === trip[1], JSON.parse(trip[1])], [true, { 'Hida Bushi': { 2: CB } }]);
      // A save that never met the step (written into the field directly) is still read per School.
      check('RUNTIME-LEGACY', await p.evaluate(CB => { const T = window.__L5R_TEST__;
        document.getElementById('f_pathTaken').value = JSON.stringify({ 2: CB });
        return [T.getPathTaken('Hida Bushi'), T.getPathTaken('Hiruma Bushi'), T.getPathTaken()]; }, CB), [{ 2: CB }, {}, {}]);
      check('NO-ERRORS', p.errors, []);
    });

    // 8. Core p. 246: a first Path gives one Kiho at its Rank, a later Path none; a shugenja's notes.
    await scenario(browser, 'KIHO', ['FIRST-PATH-ONE', 'NEXT-RANK-TWO', 'NOTE-FIRST', 'BAREFOOT', 'SERVANTS-NONE', 'LATER-PATH-NONE',
      'NOTE-LATER', 'SHUGENJA-ROW', 'SHUGENJA-NOTE', 'NO-ERRORS'], async (p, check) => {
      const SPY = 'Brotherhood Spy [Monk]';
      const school = await p.evaluate(SPY => { const T = window.__L5R_TEST__;
        return T.BROTHERHOOD_SCHOOL_LIBRARY.filter(s => T.pathAvailableFor(T.findPath(SPY), s.name, 2)).map(s => s.name); }, SPY);
      const start = n => p.evaluate(n => { const T = window.__L5R_TEST__; return T.findAnySchoolLibraryEntry(n).startingKiho || T.KIHO_DEFAULT_STARTING; }, n);
      const allowance = () => p.evaluate(() => window.__L5R_TEST__.kihoEntitlement().grantedAllowance);
      const take = (rank, name, school) => p.evaluate(({ rank, name, school }) => {
        window.__L5R_TEST__.savePathTaken({ [rank]: name }, school); window.__L5R_TEST__.recalcAll(); }, { rank, name, school });
      const A = school[0], B = school[1];
      await setup(p, { school: A, skills: [{ name: 'Lore: Theology', rank: 3 }] });
      await insight(p, 160);
      await take(2, SPY);
      check('FIRST-PATH-ONE', [await p.evaluate(() => document.getElementById('f_rank').value), await allowance()], ['2', (await start(A)) + 1]);
      await insight(p, 185);
      check('NEXT-RANK-TWO', await allowance(), (await start(A)) + 1 + 2);
      check('NOTE-FIRST', (await note(p)).includes('as your first Path it grants 1 Kiho at that Rank instead of the usual 2 (Core Rulebook p.246)'), true);
      const BB = 'Barefoot Brethren [Monk]';
      const fortunist = await p.evaluate(BB => { const T = window.__L5R_TEST__;
        return T.BROTHERHOOD_SCHOOL_LIBRARY.find(s => T.pathAvailableFor(T.findPath(BB), s.name, 2)).name; }, BB);
      await setup(p, { school: fortunist });
      await insight(p, 160);
      await take(2, BB);
      check('BAREFOOT', await allowance(), (await start(fortunist)) + 1);
      const JB = 'The Order of Jurojin’s Blessing [Monk]';
      await setup(p, { school: JB });
      await insight(p, 210);
      await take(4, 'The Servants of Mercy [Monk]');
      check('SERVANTS-NONE', await allowance(), (await start(JB)) + 2 + 2 + 0);
      // Two Brotherhood Schools, each with a Path at its Rank 2: the active School's is the later one.
      await setup(p, { schools: [{ name: A, frozen: true, frozenRank: 2, floorRank: 2, anchorInsightRank: 0 },
        { name: B, frozen: false, frozenRank: null, floorRank: 2, anchorInsightRank: 0 }] });
      await insight(p, 210);
      await take(2, SPY, A);
      await take(2, SPY, B);
      check('LATER-PATH-NONE', [await p.evaluate(() => document.getElementById('f_rank').value), await allowance()], ['2', (await start(B)) + 0]);
      const later = await note(p);
      check('NOTE-LATER', [later.includes('as a later Path it grants no Kiho (Core Rulebook p.246)'), later.includes('Kept from ' + A + ': ' + SPY + ' (Rank 2)')], [true, true]);
      await setup(p, { clan: 'Crab', school: 'Kuni Shugenja', skills: [{ name: 'Lore: Shadowlands', rank: 3 }] });
      await insight(p, 185);
      await pick(p, 'Oni Slayer [Shugenja]');
      check('SHUGENJA-ROW', (await rows(p)).includes(tagged('Bound by the World', 3, 'Kuni Shugenja')), true);
      check('SHUGENJA-NOTE', (await note(p)).includes('as your first Path you learn 1 new spell at that Rank rather than the usual number (Core Rulebook p.246)'), true);
      check('NO-ERRORS', p.errors, []);
    });
  } finally {
    await browser.close();
  }
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  console.log('ALTERNATE_PATHS_RESULT=' + JSON.stringify({ sheet, passed, total: results.length }));
  process.exitCode = passed === results.length && results.length > 0 ? 0 : 1;
})();
