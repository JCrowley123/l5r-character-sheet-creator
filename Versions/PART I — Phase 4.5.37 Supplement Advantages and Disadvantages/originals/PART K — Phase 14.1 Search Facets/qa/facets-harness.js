/* Real-browser acceptance tests for Phase 14.1 Search Facets (Part K).
 * Oracles: the catalogues on the test seam (every facet value is read from them here, never from FACETS141's records),
 * SEARCH14's own ranking for typed text (Phase 14), the Characters screen (CL11), and geometry.
 * node facets-harness.js <sheet.html>
 */
'use strict';
const path = require('path');
const {chromium} = require('playwright');
const {pathToFileURL} = require('url');
const results = [];
function check(id, actual, expected = true) {
  if (results.some(r => r.id === id)) throw Error('Duplicate check ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  results.push({id, pass});
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id}${pass ? '' : ` actual=${JSON.stringify(actual).slice(0, 600)} expected=${JSON.stringify(expected).slice(0, 600)}`}`);
}
async function section(id, fn) {
  try { await fn(); } catch (error) { check(id + '-EXCEPTION', String(error.stack || error).split('\n').slice(0, 3).join(' '), 'no exception'); }
}

// The owner's approved table (kickoff of 9 October 2026), as facet ids per category.
const FACET_SETS = {skills:['trait', 'kind'], advantages:['type', 'cost'], disadvantages:['type', 'cost'], schools:['clan'],
  advanced:['clan', 'type'], paths:['rank'], techniques:['school', 'rank'], kata:['ring', 'mastery'], kiho:['ring', 'mastery', 'type'],
  spells:['element', 'mastery', 'maho'], weapons:['skill', 'type'], clans:['clan'], ancestors:['clan', 'cost']};

// Test-only term for Phase 11.3 (Part K): with the app bar present, Search and Sheet are the bar's items.
const BAR = '#ab113Bar';
async function openSearch(page) {
  if (await page.$(BAR)) await page.click(BAR + ' [data-section="search"]');
  else { await page.click('#pm128More'); await page.click('#s14MenuItem'); }
  await page.waitForFunction(() => !document.getElementById('cl11View').hidden && document.querySelector('.s14-page'));
}
async function toSheet(page) { await page.click((await page.$(BAR)) ? BAR + ' [data-section="sheet"]' : '.cl11-back'); }

// Runs in the page: each category's entries with their facet values, straight from the catalogues.
function oracles() {
  const T = window.__L5R_TEST__;
  const norm = v => String(v == null ? '' : v).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/['’‘`]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const s = v => v == null || v === '' ? [] : [String(v)];
  const rec = (name, rows) => ({name, rows});
  const schools = [];
  Object.keys(T.SCHOOL_LIBRARY).forEach(c => T.SCHOOL_LIBRARY[c].forEach(x => schools.push([x, c + ' Clan'])));
  Object.keys(T.MINOR_CLAN_SCHOOL_LIBRARY).forEach(c => T.MINOR_CLAN_SCHOOL_LIBRARY[c].forEach(x => schools.push([x, c + ' Clan'])));
  T.BROTHERHOOD_SCHOOL_LIBRARY.forEach(x => schools.push([x, 'Brotherhood of Shinsei']));
  const byName = {};
  schools.forEach(([x, clan]) => { (byName[x.name] = byName[x.name] || {x, clans:[]}).clans.push(clan); });
  const techs = {}, techOrder = [];
  schools.forEach(([x]) => (x.tech || []).forEach((t, i) => {
    if (!techs[t]) { techs[t] = []; techOrder.push(t); }
    if (!techs[t].some(r => r.school === x.name && r.rank === String(i + 1))) techs[t].push({school:x.name, rank:String(i + 1)});
  }));
  const adv = T.ADVANCED_SCHOOLS_ENABLED === false ? [] : T.ADVANCED_SCHOOL_LIBRARY || [];
  const clans = {}, clanOrder = [];
  [T.FAMILY_LIBRARY, T.MINOR_CLAN_LIBRARY].forEach(lib => Object.keys(lib).forEach(c => {
    if (!clans[c]) { clans[c] = []; clanOrder.push(c); }
    lib[c].forEach(f => { if (clans[c].indexOf(f[0]) < 0) clans[c].push(f[0]); });
  }));
  const O = {
    skills: T.SKILL_LIBRARY.map(x => rec(x.name, [{trait:x.trait.split(/\s+or\s+/), kind:x.cat.match(/[A-Za-z]+/g)}])),
    advantages: T.ADV_LIBRARY.map(x => rec(x.name, [{type:s(x.cat), cost:s(x.cost)}])),
    disadvantages: T.DISADV_LIBRARY.map(x => rec(x.name, [{type:s(x.cat), cost:s(x.cost)}])),
    schools: Object.keys(byName).map(n => rec(n, [{clan:byName[n].clans}])),
    advanced: adv.map(x => rec(x.name, [{clan:s(x.clan), type:[].concat(x.types || []).map(String)}])),
    paths: T.ALTERNATE_PATH_LIBRARY.map(x => rec(x.name, [{rank:s(x.techRank)}])),
    techniques: techOrder.map(n => rec(n, techs[n].map(r => ({school:[r.school], rank:[r.rank]}))))
      .concat([].concat(...adv.map(a => (a.techniques || []).map(t => rec(t.name, [{school:[a.name], rank:[String(t.rank)]}]))))),
    kata: T.KATA_LIBRARY.map(x => rec(x.name, [{ring:s(x.ring), mastery:s(x.mastery)}])),
    kiho: T.KIHO_LIBRARY.map(x => rec(x.name, [{ring:s(x.ring), mastery:s(x.mastery), type:s(x.type)}])),
    spells: T.SPELL_LIBRARY.map(x => rec(x.name, [{element:s(x.element), mastery:s(x.mastery), maho:[x.maho ? 'Yes' : 'No']}])),
    weapons: T.WEAPON_LIBRARY.map(x => rec(x.name, [{skill:s(x.skill), type:['Weapon']}]))
      .concat((T.ARROW_LIBRARY || []).map(x => rec(x.name, [{skill:[], type:['Arrow']}]))),
    clans: clanOrder.map(c => rec(c + ' Clan', [{clan:[c]}])).concat([].concat(...clanOrder.map(c => clans[c].map(f => rec(f, [{clan:[c]}]))))),
    ancestors: T.ANCESTORS_ENABLED === false ? [] : T.ANC48.LIBRARY.map(x => rec(x.name, [{clan:s(x.clan), cost:s(x.cost)}])),
  };
  // Any value within a facet, every facet across; a record matches when one of its rows does.
  const match = (r, filters, skip) => {
    const keys = Object.keys(filters).filter(k => k !== skip && filters[k].length);
    return !keys.length || r.rows.some(row => keys.every(k => filters[k].some(v => (row[k] || []).indexOf(v) >= 0)));
  };
  const names = list => list.map(r => r.name).sort((a, b) => norm(a) < norm(b) ? -1 : norm(a) > norm(b) ? 1 : 0);
  window.__f141 = {O, match, names, norm,
    values(cat, f) { const all = {}; O[cat].forEach(r => r.rows.forEach(row => (row[f] || []).forEach(v => { all[v] = true; }))); return Object.keys(all); },
    count(cat, f, v, filters) { return O[cat].filter(r => match(r, filters, f) && r.rows.some(row => match({rows:[row]}, filters, f) &&
      (row[f] || []).indexOf(v) >= 0)).length; },
    sortNames: names};
}

async function main() {
  const browser = await chromium.launch();
  const errors = [];
  try {
    const context = await browser.newContext({viewport:{width:390, height:844}, isMobile:true, hasTouch:true});
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);
    await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready &&
      document.getElementById('pm128More'), null, {timeout:60000});
    await page.evaluate(oracles);
    const before = await page.evaluate(() => ({data:JSON.stringify(window.__L5R_TEST__.collectData()), writes:window.__L5R_TEST__.CL11.writes,
      tab:window.__L5R_CAROUSEL__.getActiveTab().slug, store:JSON.stringify(Object.keys(localStorage).sort().map(k => [k, localStorage[k]]))}));

    await section('F141-DATA', async () => {
      check('F141-SEAM', await page.evaluate(() => [typeof window.__L5R_TEST__.FACETS141, typeof window.__L5R_TEST__.FACETPAGE141]), ['object', 'object']);
      check('F141-FACET-SETS', await page.evaluate(() => Object.fromEntries(window.__L5R_TEST__.SEARCH14.categories()
        .map(c => [c.id, window.__L5R_TEST__.FACETS141.facets(c.id).map(f => f.id)]))), FACET_SETS);
      // The five Techniques sub-types each keep their own facets: none shares a facet that does not apply to it.
      check('F141-TECHNIQUE-SUBTYPES', await page.evaluate(() => ['techniques', 'paths', 'kata', 'kiho', 'spells'].map(c =>
        [c, window.__L5R_TEST__.FACETS141.facets(c).map(f => f.id + ':' + f.options.length)])),
        await page.evaluate(sets => ['techniques', 'paths', 'kata', 'kiho', 'spells'].map(c =>
          [c, sets[c].map(f => f + ':' + window.__f141.values(c, f).length)]), FACET_SETS));
      // Every option is a value the catalogue holds, and each count (no filter) is the catalogue's.
      const opts = await page.evaluate(sets => {
        const F = window.__L5R_TEST__.FACETS141, out = {bad:[], checked:0};
        Object.keys(sets).forEach(cat => F.facets(cat).forEach(f => {
          const want = window.__f141.values(cat, f.id).sort(), got = f.options.map(o => o.value).slice().sort();
          if (JSON.stringify(want) !== JSON.stringify(got)) out.bad.push([cat, f.id, 'values', got.slice(0, 8), want.slice(0, 8)]);
          f.options.forEach(o => { out.checked++; const n = window.__f141.count(cat, f.id, o.value, {});
            if (o.count !== n || o.selected) out.bad.push([cat, f.id, o.value, o.count, n]); });
        }));
        return out;
      }, FACET_SETS);
      check('F141-OPTIONS-ARE-THE-CATALOGUES', opts.bad, []);
      check('F141-OPTIONS-CHECKED', opts.checked > 300);
      // Each option alone returns exactly the catalogue's entries holding that value.
      check('F141-EACH-OPTION-FILTERS', await page.evaluate(sets => {
        const F = window.__L5R_TEST__.FACETS141, bad = [];
        Object.keys(sets).forEach(cat => F.facets(cat).forEach(f => f.options.forEach(o => {
          const filters = {[f.id]:[o.value]}, res = F.query({category:cat, filters, limit:100000});
          const want = window.__f141.names(window.__f141.O[cat].filter(r => window.__f141.match(r, filters)));
          const got = res.results.map(r => r.name).sort((a, b) => { const n = window.__f141.norm; return n(a) < n(b) ? -1 : n(a) > n(b) ? 1 : 0; });
          if (JSON.stringify(got) !== JSON.stringify(want) || res.total !== want.length) bad.push([cat, f.id, o.value, res.total, want.length]);
        })));
        return bad;
      }, FACET_SETS), []);
      // Two facets: every facet across, and each count follows the other facets' filters.
      check('F141-COMBINED-AND-COUNTS', await page.evaluate(sets => {
        const F = window.__L5R_TEST__.FACETS141, bad = [];
        Object.keys(sets).filter(c => sets[c].length > 1).forEach(cat => {
          const first = F.facets(cat)[0], top = first.options.slice().sort((a, b) => b.count - a.count)[0].value;
          F.facets(cat)[1].options.forEach(o => {
            const filters = {[first.id]:[top], [sets[cat][1]]:[o.value]}, res = F.query({category:cat, filters, limit:100000});
            const want = window.__f141.O[cat].filter(r => window.__f141.match(r, filters)).length;
            if (res.total !== want) bad.push([cat, 'total', top, o.value, res.total, want]);
            res.facets.forEach(f => f.options.forEach(x => { const n = window.__f141.count(cat, f.id, x.value, filters);
              if (x.count !== n) bad.push([cat, f.id, x.value, x.count, n]); }));
          });
        });
        return bad;
      }, FACET_SETS), []);
      check('F141-ANY-VALUE-WITHIN', await page.evaluate(() => {
        const F = window.__L5R_TEST__.FACETS141, f = {element:['Fire', 'Water']};
        return [F.query({category:'spells', filters:f}).total, window.__f141.O.spells.filter(r => window.__f141.match(r, f)).length];
      }).then(([a, b]) => a === b && a > 0));
      // A Technique's School and Rank must hold for the same School (The Gift of the Lady: Doji Courtier Rank 5, a monk order's Rank 1).
      check('F141-TECHNIQUE-SCHOOL-AND-RANK-TOGETHER', await page.evaluate(() => {
        const F = window.__L5R_TEST__.FACETS141, out = [], schools = {};
        window.__f141.O.techniques.forEach(r => { if (r.rows.length > 1) r.rows.forEach(row => { schools[row.school[0] + '|' + row.rank[0]] = true; }); });
        Object.keys(schools).forEach(k => { const [school, rank] = k.split('|');
          ['1', '2', '3', '4', '5'].forEach(x => { const filters = {school:[school], rank:[x]};
            const got = F.query({category:'techniques', filters, limit:100000}).results.map(r => r.name).sort();
            const want = window.__f141.O.techniques.filter(r => window.__f141.match(r, filters)).map(r => r.name).sort();
            out.push(JSON.stringify(got) === JSON.stringify(want)); }); });
        return [out.length > 0, out.every(Boolean)];
      }), [true, true]);
      // Spells while browsing: Element (Air, Earth, Fire, Water, Void, then others), then Mastery, then A to Z.
      check('F141-SPELLS-GROUPED', await page.evaluate(() => {
        const F = window.__L5R_TEST__.FACETS141, n = window.__f141.norm, RING = ['Air', 'Earth', 'Fire', 'Water', 'Void'];
        const pos = e => RING.indexOf(e) < 0 ? 99 : RING.indexOf(e);
        const want = window.__L5R_TEST__.SPELL_LIBRARY.slice().sort((a, b) => pos(a.element) - pos(b.element) ||
          (pos(a.element) === 99 && a.element !== b.element ? (a.element < b.element ? -1 : 1) : 0) ||
          a.mastery - b.mastery || (n(a.name) < n(b.name) ? -1 : n(a.name) > n(b.name) ? 1 : 0)).map(s => [s.name, [s.element, 'Mastery ' + s.mastery]]);
        const res = F.query({category:'spells', limit:100000});
        return [res.grouped, JSON.stringify(res.results.map(r => [r.name, r.group])) === JSON.stringify(want), res.total];
      }), [true, true, await page.evaluate(() => window.__L5R_TEST__.SPELL_LIBRARY.length)]);
      // Typed text keeps Phase 14's ranking within the filtered set; no grouping.
      check('F141-TEXT-WITHIN-FILTERS', await page.evaluate(() => {
        const T = window.__L5R_TEST__, f = {mastery:['1']};
        const keep = new Set(window.__f141.O.spells.filter(r => window.__f141.match(r, f)).map(r => r.name));
        const want = T.SEARCH14.query({text:'fire', category:'spells', limit:100000}).results.filter(r => keep.has(r.name)).map(r => r.id);
        const res = T.FACETS141.query({text:'fire', category:'spells', filters:f, limit:100000});
        return [res.grouped, JSON.stringify(res.results.map(r => r.id)) === JSON.stringify(want), want.length > 0];
      }), [false, true, true]);
      check('F141-NO-CATEGORY-IS-SEARCH14', await page.evaluate(() => {
        const T = window.__L5R_TEST__, a = T.FACETS141.query({text:'kat', limit:20}), b = T.SEARCH14.query({text:'kat', limit:20});
        return [JSON.stringify(a.results) === JSON.stringify(b.results), a.total === b.total, a.facets, a.grouped, T.FACETS141.has('nope'), T.FACETS141.facets('nope')];
      }), [true, true, [], false, false, []]);
      check('F141-UNKNOWN-FILTERS', await page.evaluate(() => {
        const F = window.__L5R_TEST__.FACETS141;
        return [F.query({category:'spells', filters:{element:['Wood']}}).total, F.query({category:'spells', filters:{bogus:['x']}}).total,
          F.query({category:'spells', filters:{element:'Fire'}}).total];
      }), await page.evaluate(() => [0, window.__L5R_TEST__.SPELL_LIBRARY.length, window.__L5R_TEST__.SPELL_LIBRARY.filter(s => s.element === 'Fire').length]));
      check('F141-PAGING', await page.evaluate(() => {
        const F = window.__L5R_TEST__.FACETS141, all = F.query({category:'spells', filters:{element:['Air']}, limit:100000}).results.map(r => r.id);
        const p = F.query({category:'spells', filters:{element:['Air']}, offset:50, limit:50});
        return [p.offset, JSON.stringify(p.results.map(r => r.id)) === JSON.stringify(all.slice(50, 100)), p.total === all.length];
      }), [50, true, true]);
      check('F141-PLAIN-DATA', await page.evaluate(() => {
        const T = window.__L5R_TEST__, a = T.FACETS141.query({category:'kiho', filters:{ring:['Air']}});
        const id = a.results[0].id, rec = JSON.stringify(T.SEARCH14.get(id));
        a.results[0].name = 'X'; a.results[0].tags.push('X'); a.facets[0].options[0].count = -1; a.filters.ring.push('Fire');
        const b = T.FACETS141.query({category:'kiho', filters:{ring:['Air']}});
        return [b.results[0].name !== 'X', b.facets[0].options[0].count >= 0, b.filters.ring, JSON.stringify(T.SEARCH14.get(id)) === rec];
      }), [true, true, ['Air'], true]);
    });

    await section('F141-UI', async () => {
      const scroller = () => page.evaluate(() => { for (let n = document.querySelector('.s14-page').parentElement; n; n = n.parentElement) {
        const y = getComputedStyle(n).overflowY; if (y === 'auto' || y === 'scroll') return n.scrollTop; } return null; });
      const view = () => page.evaluate(() => {
        const bar = document.getElementById('s141Bar'), list = document.querySelector('.s14-list');
        return {bar:!!bar && !bar.hidden && bar.getClientRects().length > 0,
          selects:bar ? [...bar.querySelectorAll('select')].map(s => [s.dataset.facet, s.value]) : null,
          rows:[...list.querySelectorAll('.s14-row .s14-name')].map(n => n.textContent),
          heads:[...list.querySelectorAll('.s141-group')].map(h => h.tagName + ' ' + h.textContent),
          count:document.querySelector('.s14-count').textContent, more:!document.querySelector('.s14-more').hidden,
          clear:!!(bar && bar.querySelector('.s141-clear')) && !bar.querySelector('.s141-clear').hidden, filters:window.__L5R_TEST__.FACETPAGE141.filters()};
      });
      await openSearch(page);
      check('F141-UI-NOT-ON-HOME', (await view()).bar, false);
      // Phase 14's category buttons are the only [data-category] elements.
      check('F141-UI-NO-FOREIGN-CATEGORY-ATTRIBUTE', await page.evaluate(() => [...document.querySelectorAll('.s14-page [data-category]')].every(e => e.classList.contains('s14-cat'))));
      await page.fill('#s14Input', 'kat');
      check('F141-UI-NOT-ACROSS-CATEGORIES', (await view()).bar, false);
      await page.fill('#s14Input', '');
      await page.click('[data-category="spells"]');
      const spells = await view();
      const grouped = await page.evaluate(() => window.__L5R_TEST__.FACETS141.query({category:'spells', limit:50}).results);
      const heads = [], last = [];
      grouped.forEach(r => r.group.forEach((g, i) => { if (last[i] !== g) { last.splice(i); last[i] = g; heads.push((i ? 'H5 ' : 'H4 ') + g); } }));
      check('F141-UI-SPELLS-BAR', [spells.bar, spells.selects, spells.clear], [true, [['element', ''], ['mastery', ''], ['maho', '']], false]);
      check('F141-UI-SPELLS-GROUPED', [spells.rows, spells.heads, spells.count, spells.more],
        [grouped.map(r => r.name), heads, (await page.evaluate(() => window.__L5R_TEST__.SPELL_LIBRARY.length)) + ' entries', true]);
      check('F141-UI-OPTION-TEXT', await page.$$eval('#s141Bar select[data-facet="element"] option', o => o.map(x => x.textContent)),
        await page.evaluate(() => ['Element: any'].concat(window.__L5R_TEST__.FACETS141.facets('spells')[0].options.map(o => o.label + ' (' + o.count + ')'))));
      await page.focus('#s141Bar select[data-facet="element"]');
      await page.selectOption('#s141Bar select[data-facet="element"]', 'Fire');
      const fire = await view();
      const fireWant = await page.evaluate(() => window.__L5R_TEST__.SPELL_LIBRARY.filter(s => s.element === 'Fire'));
      check('F141-UI-FILTERED-LIST', [fire.rows.slice().sort(), fire.count, fire.more, fire.clear, fire.filters],
        [fireWant.map(s => s.name).sort(), fireWant.length + ' entries', false, true, {element:['Fire']}]);
      check('F141-UI-FILTERED-HEADINGS', fire.heads.filter(h => h.startsWith('H4')), ['H4 Fire']);
      check('F141-UI-COUNTS-FOLLOW', await page.$$eval('#s141Bar select[data-facet="mastery"] option', o => o.slice(1).map(x => x.textContent)),
        await page.evaluate(() => [...new Set(window.__L5R_TEST__.SPELL_LIBRARY.map(s => +s.mastery))].sort((a, b) => a - b).map(m =>
          'Mastery ' + m + ' (' + window.__L5R_TEST__.SPELL_LIBRARY.filter(s => s.element === 'Fire' && +s.mastery === m).length + ')')));
      check('F141-UI-SELECT-KEEPS-FOCUS', await page.evaluate(() => [document.activeElement === document.querySelector('#s141Bar select[data-facet="element"]'),
        document.querySelector('#s141Bar select[data-facet="element"]').classList.contains('s141-on')]), [true, true]);
      await page.click('#s14Input');
      await page.keyboard.type('the');
      const typed = await view();
      const typedWant = await page.evaluate(() => { const T = window.__L5R_TEST__, fire = new Set(T.SPELL_LIBRARY.filter(s => s.element === 'Fire').map(s => s.name));
        return T.SEARCH14.query({text:'the', category:'spells', limit:100000}).results.filter(r => fire.has(r.name)).map(r => r.name); });
      check('F141-UI-TYPING-NARROWS', [typed.rows, typed.heads, typed.count, typed.selects[0],
        await page.evaluate(() => document.activeElement === document.getElementById('s14Input'))],
        [typedWant.slice(0, 50), [], typedWant.length + (typedWant.length === 1 ? ' match' : ' matches'), ['element', 'Fire'], true]);
      await page.fill('#s14Input', '');
      await page.selectOption('#s141Bar select[data-facet="mastery"]', '3');
      const both = await view();
      check('F141-UI-TWO-FILTERS', [both.rows.length, both.count, both.filters],
        [fireWant.filter(s => +s.mastery === 3).length, fireWant.filter(s => +s.mastery === 3).length + ' entries', {element:['Fire'], mastery:['3']}]);
      await page.click('.s14-row');
      check('F141-UI-HIDDEN-IN-DETAIL', [(await view()).bar, await page.evaluate(() => !document.querySelector('.s14-detail').hidden)], [false, true]);
      await page.click('.s14-detail [data-s14="back"]');
      const back = await view();
      check('F141-UI-BACK-KEEPS-FILTERS', [back.rows, back.selects, back.filters], [both.rows, both.selects, both.filters]);
      // S11: leave Search with filters on and a scrolled list; Search again returns to the same place.
      await page.selectOption('#s141Bar select[data-facet="mastery"]', '');
      await page.evaluate(() => { for (let n = document.querySelector('.s14-page').parentElement; n; n = n.parentElement)
        if (/^(auto|scroll)$/.test(getComputedStyle(n).overflowY)) { n.scrollTop = 600; n.dispatchEvent(new Event('scroll')); return; } });
      await page.waitForTimeout(100);
      const placed = await scroller(), kept = await view();
      await toSheet(page);
      await page.waitForTimeout(150);
      await openSearch(page);
      await page.waitForTimeout(150);
      const again = await view();
      check('F141-UI-RETURNS-TO-FILTERED-LIST', [again.bar, again.rows, again.selects, again.filters, Math.abs((await scroller()) - placed) <= 2, placed > 300],
        [true, kept.rows, kept.selects, {element:['Fire']}, true, true]);
      await page.click('.s14-crumb [data-s14="up"]');
      await page.click('[data-category="spells"]');
      const fresh = await view();
      check('F141-UI-LEAVING-CATEGORY-CLEARS', [fresh.filters, fresh.selects.map(s => s[1]), fresh.rows.length], [{}, ['', '', ''], 50]);
      await page.selectOption('#s141Bar select[data-facet="element"]', 'Air');
      await page.evaluate(() => window.__L5R_TEST__.SEARCHPAGE14.open({category:'spells', text:''}));
      check('F141-UI-OPEN-WITH-OPTIONS-CLEARS', (await view()).filters, {});
      await page.selectOption('#s141Bar select[data-facet="element"]', 'Air');
      const air = await view();
      await page.click('.s14-more');
      const airMore = await view();
      const airN = await page.evaluate(() => window.__L5R_TEST__.SPELL_LIBRARY.filter(s => s.element === 'Air').length);
      check('F141-UI-SHOW-MORE', [air.rows.length, air.more, airMore.rows.length, airMore.more, airMore.heads.filter(h => h.startsWith('H4'))],
        [Math.min(50, airN), airN > 50, Math.min(100, airN), airN > 100, ['H4 Air']]);
      await page.click('#s141Bar .s141-clear');
      const cleared = await view();
      check('F141-UI-CLEAR', [cleared.filters, cleared.selects.map(s => s[1]), cleared.clear, cleared.count],
        [{}, ['', '', ''], false, (await page.evaluate(() => window.__L5R_TEST__.SPELL_LIBRARY.length)) + ' entries']);
      // Each category shows only its own facets.
      const bars = await page.evaluate(async cats => { const out = {}, P = window.__L5R_TEST__.SEARCHPAGE14;
        for (const c of cats) { await P.open({category:c, text:''}); out[c] = [...document.querySelectorAll('#s141Bar select')].map(s => s.dataset.facet); }
        return out; }, Object.keys(FACET_SETS));
      check('F141-UI-EACH-CATEGORY-OWN-FACETS', bars, FACET_SETS);
      check('F141-UI-SIZES', await page.evaluate(async () => { await window.__L5R_TEST__.SEARCHPAGE14.open({category:'kiho', text:''});
        window.__L5R_TEST__.FACETPAGE141.set('ring', 'Air');
        const c = [...document.querySelectorAll('#s141Bar select, #s141Bar .s141-clear')];
        return [c.length, c.every(x => x.getBoundingClientRect().height >= 44), [...document.querySelectorAll('#s141Bar select')].map(s => getComputedStyle(s).fontSize),
          getComputedStyle(document.getElementById('s14Input')).fontSize]; }), [4, true, ['16px', '16px', '16px'], '16px']);
      for (const [w, h] of [[320, 700], [375, 812], [390, 844]]) {
        await page.setViewportSize({width:w, height:h});
        check('F141-UI-NO-SIDEWAYS-SCROLL-' + w, await page.evaluate(async () => {
          const out = [], P = window.__L5R_TEST__.SEARCHPAGE14, F = window.__L5R_TEST__.FACETPAGE141;
          const measure = () => { const bar = document.getElementById('s141Bar').getBoundingClientRect();
            out.push(document.documentElement.scrollWidth <= innerWidth && bar.right <= innerWidth + 0.5 && bar.left >= -0.5); };
          for (const [c, f, v] of [['kiho', 'type', 'Martial'], ['techniques', 'school', 'The Hitomi Kikage Zumi Order [Monk]'], ['ancestors', 'clan', 'Brotherhood of Shinsei']]) {
            await P.open({category:c, text:''}); F.set(f, v); measure(); }
          return out;
        }), [true, true, true]);
      }
      // The app bar stays reachable above the filters, at the top and with the list scrolled.
      check('F141-UI-APP-BAR-NOT-COVERED', await page.evaluate(async () => {
        const bar = document.getElementById('ab113Bar');
        if (!bar) return 'no bar';
        await window.__L5R_TEST__.SEARCHPAGE14.open({category:'spells', text:''});
        const reach = () => [...bar.querySelectorAll('.ab113-item')].every(b => { const r = b.getBoundingClientRect();
          const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!hit && b.contains(hit); });
        const f = document.getElementById('s141Bar').getBoundingClientRect(), a = bar.getBoundingClientRect();
        const top = [reach(), !(f.top < a.bottom && a.top < f.bottom)];
        for (let n = document.querySelector('.s14-page').parentElement; n; n = n.parentElement)
          if (/^(auto|scroll)$/.test(getComputedStyle(n).overflowY)) { n.scrollTop = 900; break; }
        return top.concat(reach());
      }).then(r => r === 'no bar' ? [true, true, true] : r), [true, true, true]);
      const cdp = await context.newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', {rate:4});
      const ms = await page.evaluate(async () => {
        const P = window.__L5R_TEST__.SEARCHPAGE14, F = window.__L5R_TEST__.FACETPAGE141, times = [];
        for (const [c, f, v] of [['spells', 'element', 'Fire'], ['techniques', 'rank', '2']]) {
          await P.open({category:c, text:''}); F.set(f, v);
          const input = document.getElementById('s14Input');
          for (const t of ['t', 'th', 'the', 'a', '']) { const s = performance.now(); input.value = t;
            input.dispatchEvent(new Event('input', {bubbles:true})); times.push(performance.now() - s); }
        }
        return Math.max(...times);
      });
      await cdp.send('Emulation.setCPUThrottlingRate', {rate:1});
      check('F141-UI-KEYSTROKE-UNDER-50MS', ms < 50);
      await toSheet(page);
      const after = await page.evaluate(() => ({data:JSON.stringify(window.__L5R_TEST__.collectData()), writes:window.__L5R_TEST__.CL11.writes,
        tab:window.__L5R_CAROUSEL__.getActiveTab().slug, store:JSON.stringify(Object.keys(localStorage).sort().map(k => [k, localStorage[k]]))}));
      check('F141-SHEET-UNCHANGED', [after.data === before.data, after.writes - before.writes, after.tab === before.tab, after.store === before.store],
        [true, 0, true, true]);
      check('F141-STYLED', await page.evaluate(async () => { await window.__L5R_TEST__.SEARCHPAGE14.open({category:'spells', text:''});
        return [getComputedStyle(document.getElementById('s141Bar')).display, getComputedStyle(document.querySelector('.s141-group-0')).fontFamily.includes('Shippori')]; }),
        ['flex', true]);
    });
  } finally {
    check('F141-NO-PAGE-ERRORS', errors, []);
    await browser.close();
  }
}
main().catch(error => check('F141-FATAL', String(error.stack || error), 'no exception')).finally(() => {
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  process.exitCode = results.length > 0 && passed === results.length ? 0 : 1;
});
