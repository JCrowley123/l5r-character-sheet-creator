/*
 * Phase 4.6 (Part I), first and second releases: the Core Rulebook's 27 Alternate Paths, real-browser
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
// The second release (Core pp. 256-257): name, page, Technique, then Schools at a Rank it must reach
// and must not. A type rule reaches dozens of Schools, so these are samples of each side of it;
// "Rank any" means every Rank 1-5 (a Champion replaces "any level Technique", p. 256).
const BOOK2 = [
  ['Emerald Magistrate', 'p.256', 'Honor Is My Shield',
    ['Hida Bushi 4', 'Doji Courtier 4', 'Kuni Shugenja 4', 'Kitsuki Investigator [Courtier] 4', 'Kaiu Engineer [Artisan/Bushi] 4'],
    ['Hida Bushi 3', 'Hida Bushi 5', 'The Four Temples [Monk] 4', 'Goju Ninja 4', 'Kakita Artisan 4', 'Tsi Smith [Artisan] 4']],
  ['The Amethyst Champion', 'p.256', 'The Emperor’s Voice',
    ['Doji Courtier any', 'Shiba Artisan [Courtier] any'], ['Hida Bushi 3', 'Kuni Shugenja 3', 'Kakita Artisan 3']],
  ['The Emerald Champion', 'p.256', 'The Emperor’s Hand',
    ['Hida Bushi any', 'Kaiu Engineer [Artisan/Bushi] any'], ['Doji Courtier 3', 'Kuni Shugenja 3', 'The Four Temples [Monk] 3']],
  ['Imperial Legionnaire', 'p.256', 'Strength of the Empire',
    ['Akodo Bushi 2', 'Seppun Guardsman [Bushi] 2'], ['Akodo Bushi 3', 'Doji Courtier 2', 'Kuni Shugenja 2']],
  ['The Jade Champion', 'p.257', 'The Emperor’s Will',
    ['Kuni Shugenja any', 'Yogo Wardmaster [Shugenja] any'], ['Hida Bushi 3', 'Doji Courtier 3']],
  ['Jade Legionnaire', 'p.257', 'Purity in Purpose & Deed',
    ['Akodo Bushi 2', 'Kuni Shugenja 2'], ['Kuni Shugenja 3', 'Doji Courtier 2', 'The Four Temples [Monk] 2']],
  ['The Ruby Champion', 'p.257', 'Master of the Dojo',
    ['Hida Bushi any', 'Seppun Guardsman [Bushi] any'], ['Doji Courtier 3', 'Kuni Shugenja 3']],
  ['Jade Magistrate', 'p.257', 'Scent of the Kami',
    ['Hida Bushi 4', 'Doji Courtier 4', 'Kuni Shugenja 4'], ['Hida Bushi 2', 'The Four Temples [Monk] 4', 'Goju Ninja 4']],
  ['The Topaz Champion', 'p.257', 'Soul of Promise',
    ['Hida Bushi any', 'Doji Courtier any', 'Kuni Shugenja any', 'The Four Temples [Monk] any', 'Goju Ninja any'], []],
];

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
  if (o.glory !== undefined) { $('f_gloryRank').value = String(o.glory); $('f_gloryPts').value = String(o.glory < 2 ? 9 : 0); }
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
// The real picker: choose the option, as a tap does, and let its change handler run. A Path is
// added by its "add:<name>" option, removed by its "remove:<Rank>" one; '' is the blank option.
const choose = (p, value) => p.evaluate(v => {
  const sel = document.getElementById('pathPicker');
  sel.value = v; sel.dispatchEvent(new Event('change', { bubbles: true }));
  return v;
}, value);
const pick = (p, name) => choose(p, name ? 'add:' + name : '');
const removePath = (p, rank) => choose(p, 'remove:' + rank);
const options = p => p.evaluate(() => {
  const wrap = document.getElementById('pathPickerWrap');
  return { shown: wrap.style.display !== 'none',
    opts: Array.from(document.getElementById('pathPicker').options).map(o => o.textContent + (o.disabled ? ' [disabled]' : '')) };
});
// One Path's option as the player sees it (with " [disabled]" when locked), or null if not offered.
const opt = (p, name) => p.evaluate(n => {
  const o = Array.from(document.getElementById('pathPicker').options).find(x => x.value === 'add:' + n);
  return o ? o.textContent + (o.disabled ? ' [disabled]' : '') : null;
}, name);
// The Rank pick modal an any-Rank Path opens: its offered Ranks, then tick one (or cancel).
const modalRanks = p => p.evaluate(() => {
  const o = document.getElementById('affinityPickModalOverlay');
  return o.style.display === 'flex' ? Array.from(document.querySelectorAll('#affinityPickGrid label')).map(l => l.textContent) : null;
});
const modalChoose = (p, rank) => p.evaluate(r => {
  const box = document.getElementById('ap46Rank_' + r);
  box.checked = true; box.dispatchEvent(new Event('change', { bubbles: true }));
  document.getElementById('affinityPickConfirm').click();
}, rank);
const modalCancel = p => p.evaluate(() => document.getElementById('affinityPickX').click());
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
// Every Path of both releases as [name, page, (reach), Technique], in book order.
const ALL = BOOK.concat(BOOK2.map(b => [b[0], b[1], null, b[2]]));

(async () => {
  const browser = await chromium.launch(process.env.L5R_CHROME ? { executablePath: process.env.L5R_CHROME } : {});
  try {
    // 1. What loads: the 18 Paths, their pages and Techniques, the load check, and their reach.
    await scenario(browser, 'LOAD', ['SWITCH', 'LIBRARY', 'SOURCES', 'DESCRIPTIONS', 'OWN-CHECK', 'TRUNK-CHECK', 'REACH',
      'REACH-R2', 'MONK-REACH-UNCHANGED', 'NO-ERRORS'], async (p, check) => {
      const r = await p.evaluate(BOOK => {
        const T = window.__L5R_TEST__;
        const names = T.ALTERNATE_PATH_LIBRARY.map(x => x.name);
        const sources = {}, descriptions = {}, reach = {};
        BOOK.forEach(([name, , reachable]) => {
          const path = T.findPath(name);
          sources[name] = path ? path.source : null;
          descriptions[name] = path ? T.techniqueDescription(path.tech) : null;
          if (!reachable) return;
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
      }, ALL);
      check('SWITCH', r.enabled, true);
      check('LIBRARY', [r.names, r.techs], [MONK_PATHS.concat(ALL.map(b => b[0])), ALL.map(b => b[3])]);
      check('SOURCES', r.sources, Object.fromEntries(ALL.map(b => [b[0], 'Core Rulebook ' + b[1]])));
      // Our own words, ending with the Path and its page; never the "not yet available" fallback.
      check('DESCRIPTIONS', ALL.filter(([name, page]) => {
        const d = r.descriptions[name] || '';
        return !d.endsWith('(' + name.replace(/ \[[^\]]*\]$/, '') + ', Core Rulebook ' + page + ')') || /not yet available/.test(d) || d.length < 80;
      }).map(b => b[0]), []);
      check('OWN-CHECK', r.own, []);
      check('TRUNK-CHECK', r.trunk, []);
      check('REACH', r.reach, Object.fromEntries(BOOK.map(b => [b[0], sorted(b[2])])));
      // The second release's samples: each "School Rank" (or "School any" for every Rank 1-5) that
      // must be reached, and each that must not. Lists what is wrong; empty is right.
      check('REACH-R2', await p.evaluate(BOOK2 => {
        const T = window.__L5R_TEST__, wrong = [];
        const parse = s => { const m = s.match(/^(.*) (\d|any)$/); return [m[1], m[2] === 'any' ? [1, 2, 3, 4, 5] : [Number(m[2])]]; };
        BOOK2.forEach(([name, , , yes, no]) => {
          const path = T.findPath(name);
          yes.forEach(s => { const [school, ranks] = parse(s);
            ranks.forEach(r => { if (!path || !T.pathAvailableFor(path, school, r)) wrong.push('should reach: ' + name + ' / ' + school + ' ' + r); }); });
          no.forEach(s => { const [school, ranks] = parse(s);
            ranks.forEach(r => { if (path && T.pathAvailableFor(path, school, r)) wrong.push('should not reach: ' + name + ' / ' + school + ' ' + r); }); });
          if (!path) wrong.push('missing: ' + name);
        });
        return wrong;
      }, BOOK2), []);
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
    await scenario(browser, 'PICKER', ['HIDDEN-NO-SCHOOL', 'R1-ONLY-CHAMPIONS', 'SHOWN-R2-LOCKED', 'ORDER', 'UNLOCKED', 'FITS-PHONE',
      'NEGATIVES', 'NO-ERRORS'], async (p, check) => {
      // The Topaz Champion is open to every School (p. 257), so only a character with no School has
      // nothing to pick.
      await setup(p, { schools: [] });
      check('HIDDEN-NO-SCHOOL', (await options(p)).shown, false);
      await setup(p, { clan: 'Crab', school: 'Hida Bushi' });
      await insight(p, 120);
      const any = n => n + ' (replaces a Rank you choose)';
      check('R1-ONLY-CHAMPIONS', await options(p), { shown: true, opts: ['— no Alternate Path —',
        any('The Emerald Champion'), any('The Ruby Champion'), any('The Topaz Champion')] });
      await insight(p, 160);
      check('SHOWN-R2-LOCKED', await opt(p, 'Crab Berserker [Bushi]'), 'Crab Berserker [Bushi] (replaces Rank 2) — 🔒 needs Earth 4 [disabled]');
      // Fixed-Rank Paths by Rank, then the any-Rank Champions, each in book order.
      check('ORDER', (await options(p)).opts, ['— no Alternate Path —', 'Crab Berserker [Bushi] (replaces Rank 2) — 🔒 needs Earth 4 [disabled]',
        'Imperial Legionnaire (replaces Rank 2) — 🔒 needs Glory Rank 2 [disabled]', 'Jade Legionnaire (replaces Rank 2) — 🔒 needs Glory Rank 2 [disabled]',
        any('The Emerald Champion'), any('The Ruby Champion'), any('The Topaz Champion')]);
      await p.evaluate(() => { const $ = id => document.getElementById(id); $('trait_stamina').value = '4'; $('trait_willpower').value = '4'; window.__L5R_TEST__.recalcAll(); });
      await insight(p, 160);
      check('UNLOCKED', await opt(p, 'Crab Berserker [Bushi]'), 'Crab Berserker [Bushi] (replaces Rank 2)');
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
      check('DAIDOJI-LABEL', [await insight(p, 210), await opt(p, EG)], [4, EG + ' (replaces Rank 4)']);
      await pick(p, EG);
      check('DAIDOJI-RECORD', await stored(p), { [D]: { 4: EG } });
      check('DAIDOJI-ROWS', await rows(p), sorted((await granted(p, D, [1, 2, 3])).concat(tagged('To Defend Unto Death', 4, D))));
      check('DAIDOJI-STATUS', await status(p), 'Alternate Path set: ' + EG + ' (replaces Rank 4 of ' + D + ').');
      await setup(p, { clan: 'Crane', school: 'Kakita Bushi', traits: { Perception: 3 } });
      check('KAKITA-LABEL', [await insight(p, 210), await opt(p, EG)], [4, EG + ' (replaces Rank 3)']);
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
      check('LOCKED-OPTION', await opt(p, 'Shiba Yojimbo [Bushi]'), 'Shiba Yojimbo [Bushi] (replaces Rank 3) — 🔒 needs Honor Rank 5 [disabled]');
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
        return opt(p, 'Shiba Yojimbo [Bushi]');
      };
      check('HONOR-LIVE', [await typed(5), await typed(4)], ['Shiba Yojimbo [Bushi] (replaces Rank 3)',
        'Shiba Yojimbo [Bushi] (replaces Rank 3) — 🔒 needs Honor Rank 5 [disabled]']);
      check('NO-ERRORS', p.errors, []);
    });

    // 6. A Path is its School's: the kickoff's risk 1, measured on 1 October.
    await scenario(browser, 'RECORD', ['FIRST-RECORD', 'FIRST-ROWS', 'ADDED', 'SECOND-OWN-R2', 'KEPT-ROW', 'RECORD-KEPT', 'READS',
      'NOTE-KEPT', 'ELSEWHERE-LOCKED', 'UNLOCK-NAMED', 'CLEAR-ACTIVE-ONLY', 'NO-ERRORS'], async (p, check) => {
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
      // The same Path is not offered again in the second School.
      check('ELSEWHERE-LOCKED', await opt(p, CB), CB + ' (replaces Rank 2) — already yours from Hida Bushi [disabled]');
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

    // ---------------- Second release (Core pp. 246, 256-257) ----------------
    // 9. Several Paths in one School: each Rank replaced once; a Path removed puts its Rank back.
    await scenario(browser, 'MULTI', ['FIRST', 'SECOND', 'ROWS', 'OPTIONS', 'RANK-TAKEN', 'REMOVE', 'REMOVE-STATUS', 'ROWS-AFTER',
      'NO-ERRORS'], async (p, check) => {
      const MB = 'Mirumoto Bushi', MM = 'Mirumoto Mountaineer [Bushi]', EM = 'Emerald Magistrate';
      await setup(p, { clan: 'Dragon', school: MB, skills: [{ name: 'Athletics', rank: 3, emph: 'Climbing' },
        { name: 'Investigation', rank: 3 }, { name: 'Lore: Law', rank: 3 }] });
      await insight(p, 210);
      await pick(p, MM);
      check('FIRST', await stored(p), { [MB]: { 2: MM } });
      await pick(p, EM);
      check('SECOND', await stored(p), { [MB]: { 2: MM, 4: EM } });
      check('ROWS', await rows(p), sorted((await granted(p, MB, [1, 3])).concat(tagged('Heart of the Mountain', 2, MB), tagged('Honor Is My Shield', 4, MB))));
      const o = (await options(p)).opts;
      check('OPTIONS', [o[0], o.includes('Remove ' + MM + ' (Rank 2)'), o.includes('Remove ' + EM + ' (Rank 4)'), await opt(p, MM), await opt(p, EM)],
        ['— add or remove an Alternate Path —', true, true, null, null]);
      // Glory typed in (it redraws the picker on its own): the Legionnaire's lock moves from Glory to
      // the Rank the Mountaineer already holds.
      await p.evaluate(() => { const el = document.getElementById('f_gloryRank'); el.value = '2'; el.dispatchEvent(new Event('input', { bubbles: true })); });
      check('RANK-TAKEN', await opt(p, 'Imperial Legionnaire'), 'Imperial Legionnaire (replaces Rank 2) — Rank 2 is already replaced by ' + MM + ' [disabled]');
      await removePath(p, 2);
      check('REMOVE', await stored(p), { [MB]: { 4: EM } });
      check('REMOVE-STATUS', await status(p), 'Alternate Path removed: ' + MM + ' (Rank 2 of ' + MB + ').');
      check('ROWS-AFTER', await rows(p), sorted((await granted(p, MB, [1, 2, 3])).concat(tagged('Honor Is My Shield', 4, MB))));
      check('NO-ERRORS', p.errors, []);
    });

    // 10. Glory, and the Magistrates' Imperial waiver of one Skill Rank requirement.
    await scenario(browser, 'REQ2', ['GLORY-LOW', 'GLORY-MET', 'GLORY-LIVE', 'IMPERIAL-ONE-WAIVED', 'IMPERIAL-TWO-SHORT', 'NOT-IMPERIAL',
      'IMPERIAL-NOTES', 'NO-ERRORS'], async (p, check) => {
      const IL = 'Imperial Legionnaire', EM = 'Emerald Magistrate', SG = 'Seppun Guardsman [Bushi]';
      await setup(p, { clan: 'Lion', school: 'Akodo Bushi', glory: 1 });
      check('GLORY-LOW', await unmet(p, IL), ['Glory Rank 2']);
      await setup(p, { clan: 'Lion', school: 'Akodo Bushi', glory: 2 });
      check('GLORY-MET', await unmet(p, IL), []);
      await setup(p, { clan: 'Lion', school: 'Akodo Bushi', glory: 1 });
      await insight(p, 160);
      const before = await opt(p, IL);
      await p.evaluate(() => { const el = document.getElementById('f_gloryRank'); el.value = '2'; el.dispatchEvent(new Event('input', { bubbles: true })); });
      check('GLORY-LIVE', [before, await opt(p, IL)], [IL + ' (replaces Rank 2) — 🔒 needs Glory Rank 2 [disabled]', IL + ' (replaces Rank 2)']);
      await setup(p, { clan: 'Imperial', school: SG, skills: [{ name: 'Investigation', rank: 3 }] });
      check('IMPERIAL-ONE-WAIVED', await unmet(p, EM), []);
      await setup(p, { clan: 'Imperial', school: SG });
      check('IMPERIAL-TWO-SHORT', await unmet(p, EM), ['Lore: Law 3']);
      await setup(p, { clan: 'Crane', school: 'Kakita Bushi', skills: [{ name: 'Investigation', rank: 3 }] });
      check('NOT-IMPERIAL', await unmet(p, EM), ['Lore: Law 3']);
      await setup(p, { clan: 'Imperial', school: SG, skills: [{ name: 'Investigation', rank: 3 }] });
      await insight(p, 210);
      await pick(p, EM);
      const n = await note(p);
      check('IMPERIAL-NOTES', [n.includes('as a member of the Imperial families you may ignore one Skill Rank requirement'),
        n.includes('confirm with your GM: an appointment as an Emerald Magistrate'), n.includes('Note: a generous GM may let')], [true, true, true]);
      check('NO-ERRORS', p.errors, []);
    });

    // 11. The Champions replace "any level Technique" (p. 256): the player picks the Rank.
    await scenario(browser, 'ANYRANK', ['LABEL', 'MODAL-RANKS', 'RECORD', 'ROWS', 'STATUS', 'NOTE', 'SKIPS-TAKEN', 'CANCEL',
      'ONE-FREE-NO-MODAL', 'NO-ERRORS'], async (p, check) => {
      const HB = 'Hida Bushi', EC = 'The Emerald Champion', RC = 'The Ruby Champion';
      await setup(p, { clan: 'Crab', school: HB });
      await insight(p, 185);
      check('LABEL', await opt(p, EC), EC + ' (replaces a Rank you choose)');
      await pick(p, EC);
      check('MODAL-RANKS', await modalRanks(p), ['Rank 1', 'Rank 2', 'Rank 3']);
      await modalChoose(p, 2);
      await p.waitForTimeout(150);
      check('RECORD', await stored(p), { [HB]: { 2: EC } });
      check('ROWS', await rows(p), sorted((await granted(p, HB, [1, 3])).concat(tagged('The Emperor’s Hand', 2, HB))));
      check('STATUS', await status(p), 'Alternate Path set: ' + EC + ' (replaces Rank 2 of ' + HB + ').');
      check('NOTE', (await note(p)).includes('confirm with your GM: appointment as the Emerald Champion'), true);
      await pick(p, RC);
      check('SKIPS-TAKEN', await modalRanks(p), ['Rank 1', 'Rank 3']);
      await modalCancel(p);
      await p.waitForTimeout(150);
      check('CANCEL', [await stored(p), await modalRanks(p)], [{ [HB]: { 2: EC } }, null]);
      await setup(p, { clan: 'Crab', school: HB });
      await insight(p, 120);
      await pick(p, RC);
      await p.waitForTimeout(150);
      check('ONE-FREE-NO-MODAL', [await modalRanks(p), await stored(p)], [null, { [HB]: { 1: RC } }]);
      check('NO-ERRORS', p.errors, []);
    });

    // 12. The Topaz Champion keeps the Technique it replaces (p. 257).
    await scenario(browser, 'TOPAZ', ['ROWS', 'NOTE', 'REMOVED-ROWS', 'NO-ERRORS'], async (p, check) => {
      const HB = 'Hida Bushi', TC = 'The Topaz Champion';
      await setup(p, { clan: 'Crab', school: HB });
      await insight(p, 185);
      await pick(p, TC);
      await modalChoose(p, 3);
      await p.waitForTimeout(150);
      check('ROWS', await rows(p), sorted((await granted(p, HB, [1, 2, 3])).concat(tagged('Soul of Promise', 3, HB))));
      check('NOTE', (await note(p)).includes('you keep the Technique it replaces as well (Core Rulebook p.257)'), true);
      await removePath(p, 3);
      check('REMOVED-ROWS', await rows(p), sorted(await granted(p, HB, [1, 2, 3])));
      check('NO-ERRORS', p.errors, []);
    });

    // 13. Core p. 246: a later Path is not a Rank of the basic School for effects of School Rank. The
    // first Path still counts; the School Rank field and the Technique list are untouched.
    await scenario(browser, 'LATER', ['SPELL-FIRST', 'SPELL-LATER', 'BREAKDOWN-BASE', 'SPELL-NOTE', 'FIELD-UNCHANGED', 'KIHO-REACH',
      'KIHO-CAP', 'MIRUMOTO', 'NO-ERRORS'], async (p, check) => {
      const take = (flat, school) => p.evaluate(({ flat, school }) => {
        window.__L5R_TEST__.savePathTaken(flat, school); window.__L5R_TEST__.recalcAll(); }, { flat, school });
      const spell = () => p.evaluate(() => { const T = window.__L5R_TEST__;
        return [T.effectiveSchoolRankForElement('Universal'), T.effectiveSchoolRankForSpell('Fire', [])]; });
      const KS = 'Kitsu Shugenja', BC = 'Bishamon’s Chosen [Shugenja]';
      await setup(p, { clan: 'Lion', school: KS, skills: [{ name: 'Battle', rank: 3 }] });
      await insight(p, 210);
      await take({ 3: BC }, KS);
      const a = await spell();
      check('SPELL-FIRST', a[0], 4);
      await take({ 3: BC, 4: 'The Jade Champion' }, KS);
      const b = await spell();
      check('SPELL-LATER', [b[0], a[1] - b[1]], [3, 1]);
      check('BREAKDOWN-BASE', await p.evaluate(() => { const T = window.__L5R_TEST__;
        return T.makeRollContext(T.ROLL_KINDS.SPELL, { schoolRankBase: 4 }).schoolRankBase; }), 3);
      check('SPELL-NOTE', (await note(p)).includes('as a later Path you learn no new spells at that Rank (Core Rulebook p.246)'), true);
      check('FIELD-UNCHANGED', [await p.evaluate(() => document.getElementById('f_rank').value),
        (await rows(p)).filter(r => / Kitsu Shugenja\]$/.test(r)).length], ['4', 3]);
      const FT = 'The Four Temples [Monk]', SPY = 'Brotherhood Spy [Monk]';
      await setup(p, { school: FT, skills: [{ name: 'Lore: Theology', rank: 3 }] });
      await insight(p, 210);
      const kiho = () => p.evaluate(() => { const T = window.__L5R_TEST__;
        return [T.kihoEligibility(T.KIHO_LIBRARY[0]).reach, T.kihoEntitlement().purchasedCap]; });
      await take({ 2: SPY }, FT);
      const k1 = await kiho();
      await take({ 2: SPY, 4: 'Abbot [Monk]' }, FT);
      const k2 = await kiho();
      check('KIHO-REACH', k1[0] - k2[0], 1);
      check('KIHO-CAP', k1[1] - k2[1], 1);
      const MB = 'Mirumoto Bushi';
      await setup(p, { clan: 'Dragon', school: MB });
      await insight(p, 210);
      await take({ 2: 'Mirumoto Mountaineer [Bushi]' }, MB);
      const m1 = await p.evaluate(() => window.__L5R_TEST__.getMirumotoRank());
      await take({ 2: 'Mirumoto Mountaineer [Bushi]', 4: 'Emerald Magistrate' }, MB);
      check('MIRUMOTO', [m1, await p.evaluate(() => window.__L5R_TEST__.getMirumotoRank())], [4, 3]);
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
