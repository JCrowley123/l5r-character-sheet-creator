'use strict';
// Phase 14.3b (Part K): Schools, School Techniques, Clans and Families carry their printed entry pages in Search.
// Oracle: qa/expected-pages.json, read from the owner's books (SOURCES.md). Catalogues come from the test seam.
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const expected = JSON.parse(fs.readFileSync(path.join(__dirname, 'expected-pages.json'), 'utf8'));
const results = [];
function check(id, actual, want = true) {
  if (results.some(x => x.id === id)) throw Error('Duplicate check: ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(want);
  results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + String(JSON.stringify(actual)).slice(0, 500)));
}
async function section(id, run) { try { await run(); } catch (e) { check(id + '-EXCEPTION', String(e.stack), 'no exception'); } }
const citation = e => e.book + ' p.' + e.page;
const key = e => (e.category === 'techniques' ? e.school + '|' : e.category === 'families' ? e.clan + '|' : '') + e.name;
const oracle = {};
for (const e of expected) (oracle[e.category] = oracle[e.category] || {})[key(e)] = citation(e);
const sorted = list => list.slice().sort();
const TOTAL = 40;
async function main() {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({viewport:{width:390, height:844}, isMobile:true, hasTouch:true});
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    const text = async selector => (await page.locator(selector).allTextContents())[0] || null;
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);
    await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11.ready, null, {timeout:60000});
    await page.evaluate(() => {
      window.__referenceBefore = JSON.stringify(window.__L5R_TEST__.collectData());
      window.__referenceStorage = JSON.stringify(Object.entries(localStorage).sort());
    });
    let got;
    await section('REF1432-DATA', async () => {
      check('REF1432-SWITCH', await page.evaluate(() => window.__L5R_TEST__.SEARCH_REFERENCES_1432_ENABLED), true);
      got = await page.evaluate(() => {
        const T = window.__L5R_TEST__, S = T.SEARCH14, R = T.SCHOOLREF1432;
        const tail = /\s*\(([^()]*\bpp?\.\s?\d[^()]*)\)\s*$/, tailOf = t => { const m = String(t || '').match(tail); return m ? m[1] : ''; };
        const field = (r, label) => { const f = r.fields.find(x => x.label === label); return f ? f.value : ''; };
        const flat = o => Object.values(o).flat(), first = {};
        flat(T.SCHOOL_LIBRARY).concat(flat(T.MINOR_CLAN_SCHOOL_LIBRARY), T.BROTHERHOOD_SCHOOL_LIBRARY).forEach(s => { if (!first[s.name]) first[s.name] = s; });
        const all = cat => S.query({category:cat, limit:100000}).results.map(hit => ({hit, rec:S.get(hit.id)}));
        const schoolRecs = Object.fromEntries(all('schools').map(x => [x.hit.name, x]));
        const schools = Object.keys(first).map(name => {
          const s = first[name], x = schoolRecs[name] || {hit:{}, rec:{sections:[], text:[]}};
          const items = ((x.rec.sections || []).find(sec => sec.title === 'Techniques') || {items:[]}).items;
          return {name, own:s.source || '', list:x.hit.source || '', detail:x.rec.source || '', api:R ? R.source('schools', name) : '',
            pairs:(s.tech || []).map((t, i) => {
              const own = Array.isArray(s.descriptions) && s.descriptions[i];
              return {name:t, tail:own ? '' : tailOf(T.techniqueDescription(t)), note:items[i] ? items[i].note : null,
                text:items[i] ? items[i].text : null, want:own ? s.descriptions[i] : T.techniqueDescription(t).replace(tail, ''),
                api:R ? R.source('techniques', t, name) : ''};
            })};
        });
        const techniques = all('techniques').filter(x => x.rec.type === 'School Technique').map(x => ({name:x.hit.name,
          list:x.hit.source, detail:x.rec.source, school:field(x.rec, 'School').split('; ')[0].replace(/, Rank \d+$/, '')}));
        const clans = all('clans').map(x => ({name:x.hit.name, type:x.rec.type, clan:field(x.rec, 'Clan'), list:x.hit.source, detail:x.rec.source,
          api:R ? (x.rec.type === 'Family' ? R.source('families', x.hit.name, field(x.rec, 'Clan')) : R.source('clans', x.hit.name)) : ''}));
        return {schools, techniques, clans};
      });
      const S = got.schools, pairs = S.flatMap(s => s.pairs.map(p => ({...p, school:s.name})));
      const wantSchool = s => s.own || oracle.schools[s.name] || '';
      const wantPair = p => p.tail || oracle.techniques[p.school + '|' + p.name] || '';
      const firstPair = {};
      pairs.forEach(p => { if (!(p.name in firstPair)) firstPair[p.name] = wantPair(p); });
      check('REF1432-SCHOOLS-COVERAGE', sorted(S.filter(s => s.list && !s.own).map(s => s.name)), sorted(Object.keys(oracle.schools)));
      check('REF1432-SCHOOLS-LIST-PAGES', S.map(s => [s.name, s.list]), S.map(s => [s.name, wantSchool(s)]));
      check('REF1432-SCHOOLS-DETAIL-PAGES', S.map(s => [s.name, s.detail]), S.map(s => [s.name, wantSchool(s)]));
      check('REF1432-SCHOOLS-LOOKUP', S.map(s => [s.name, s.api]), S.map(s => [s.name, oracle.schools[s.name] || '']));
      const T = got.techniques;
      check('REF1432-TECHNIQUES-COVERAGE', sorted(pairs.filter(p => p.note && !p.tail).map(p => p.school + '|' + p.name)),
        sorted(Object.keys(oracle.techniques)));
      check('REF1432-TECHNIQUES-LIST-PAGES', T.map(t => [t.name, t.list]), T.map(t => [t.name, firstPair[t.name]]));
      check('REF1432-TECHNIQUES-DETAIL-PAGES', T.map(t => [t.name, t.detail]), T.map(t => [t.name, firstPair[t.name]]));
      check('REF1432-TECHNIQUES-LOOKUP', pairs.map(p => [p.school + '|' + p.name, p.api]),
        pairs.map(p => [p.school + '|' + p.name, oracle.techniques[p.school + '|' + p.name] || '']));
      const C = got.clans.filter(c => c.type === 'Clan'), F = got.clans.filter(c => c.type === 'Family'), fk = f => f.clan + '|' + f.name;
      check('REF1432-CLANS-COVERAGE', sorted(C.filter(c => c.list).map(c => c.name)), sorted(Object.keys(oracle.clans)));
      check('REF1432-CLANS-LIST-PAGES', C.map(c => [c.name, c.list]), C.map(c => [c.name, oracle.clans[c.name] || '']));
      check('REF1432-CLANS-DETAIL-PAGES', C.map(c => [c.name, c.detail]), C.map(c => [c.name, oracle.clans[c.name] || '']));
      check('REF1432-CLANS-LOOKUP', C.map(c => [c.name, c.api]), C.map(c => [c.name, oracle.clans[c.name] || '']));
      check('REF1432-FAMILIES-COVERAGE', sorted(F.filter(f => f.list).map(fk)), sorted(Object.keys(oracle.families)));
      check('REF1432-FAMILIES-LIST-PAGES', F.map(f => [fk(f), f.list]), F.map(f => [fk(f), oracle.families[fk(f)] || '']));
      check('REF1432-FAMILIES-DETAIL-PAGES', F.map(f => [fk(f), f.detail]), F.map(f => [fk(f), oracle.families[fk(f)] || '']));
      check('REF1432-FAMILIES-LOOKUP', F.map(f => [fk(f), f.api]), F.map(f => [fk(f), oracle.families[fk(f)] || '']));
      // Each School's own detail cites its own Techniques; descriptions stay the catalogue's text.
      check('REF1432-SCHOOL-DETAIL-NOTES', pairs.map(p => [p.school + '|' + p.name, p.note]), pairs.map(p => [p.school + '|' + p.name, wantPair(p)]));
      check('REF1432-TECHNIQUE-TEXT-PRESERVED', pairs.filter(p => p.text !== p.want).map(p => p.school + '|' + p.name), []);
      // The Gift of the Lady is Doji Courtier Rank 5 and Hitomi Kikage Zumi Rank 1: one Search record, two printings.
      const gift = n => (pairs.find(p => p.name === 'The Gift of the Lady' && p.school === n) || {}).note;
      check('REF1432-SHARED-TECHNIQUE', [(T.find(t => t.name === 'The Gift of the Lady') || {}).list, gift('Doji Courtier'),
        gift('The Hitomi Kikage Zumi Order [Monk]')], ['Core Rulebook p.111', 'Core Rulebook p.111', 'Imperial Histories 1 p.215']);
      const fam = (c, n) => (F.find(f => f.clan === c && f.name === n) || {}).list;
      check('REF1432-SAME-NAME-FAMILIES', [fam('Crab', 'Toritaka'), fam('Falcon', 'Toritaka'), fam('Mantis', 'Kitsune'), fam('Fox', 'Kitsune'),
        fam('Spider', 'Chuda'), fam('Snake', 'Chuda'), fam('Oriole', 'Tsi'), fam('Ronin', 'Tsi'), fam('Tiger', 'Yotsu'), fam('Ronin', 'Yotsu')],
        ['Core Rulebook p.106', 'Core Rulebook p.218', 'Core Rulebook p.120', 'Core Rulebook p.219', 'Core Rulebook p.211', 'Core Rulebook p.224',
          'Core Rulebook p.222', 'Imperial Histories 1 p.275', 'Imperial Histories 1 p.276', 'Imperial Histories 1 p.275']);
      // Guard: the two Schools whose catalogue already cites a page keep that citation.
      const kept = S.filter(s => s.own).map(s => [s.name, s.own !== '', s.list === s.own, s.detail === s.own]);
      check('REF1432-EXISTING-SOURCES-KEPT', [kept.length, kept.every(k => k[1] && k[2] && k[3]),
        pairs.filter(p => p.tail).length > 0 && pairs.filter(p => p.tail).every(p => p.note === p.tail)], [2, true, true]);
    });
    await section('REF1432-LOOKUPS', async () => {
      // Printed under other titles; looked up by the sheet's names.
      check('REF1432-RETITLED-ENTRIES', await page.evaluate(() => {
        const R = window.__L5R_TEST__.SCHOOLREF1432;
        return R ? [R.source('techniques', 'The Way of Magari-Yarijutsu', 'Lion Elite Spearmen [Bushi]'),
          R.source('techniques', 'Balance of Nothingness', 'Mirumoto Taoist Swordsman [Bushi]'),
          R.source('techniques', 'Blessing of the Emperor', 'Miya Herald [Courtier]'), R.source('families', 'Togashi', 'Dragon')] : [];
      }), ['The Way of Magari-Yarijutsu', 'Balance of Nothingness', 'Blessing of the Emperor', 'Togashi'].map(n =>
        citation(expected.find(e => e.name === n && e.printed))));
      check('REF1432-NORMALISED-LOOKUP', await page.evaluate(() => {
        const R = window.__L5R_TEST__.SCHOOLREF1432;
        return R ? [R.source('schools', '  agasha   SHUGENJA '), R.source('techniques', 'ELEMENTS OF ALL THINGS', ' agasha shugenja'),
          R.source('families', 'kitsune', 'FOX'), R.source('clans', 'badger clan')] : [];
      }), ['Core Rulebook p.125', 'Core Rulebook p.125', 'Core Rulebook p.219', 'Core Rulebook p.215']);
      check('REF1432-NO-GUESSED-PAGES', await page.evaluate(() => {
        const R = window.__L5R_TEST__.SCHOOLREF1432;
        return R ? [R.source('schools', 'missing'), R.source('techniques', 'Elements of All Things'), R.source('families', 'Kitsune'),
          R.source('families', 'Kitsune', 'Crab'), R.source('kata', 'Agasha Shugenja'), R.source('__proto__', 'toString'),
          R.source('schools', 'constructor'), R.source(null, null), R.recordSource(null), R.recordSource({category:'advanced', name:'Agasha Shugenja'}),
          R.recordSource({category:'clans', type:'Family', name:'Kitsune', fields:[]})] : null;
      }), ['', '', '', '', '', '', '', '', '', '', '']);
      const naishou = sorted([...new Set(expected.filter(e => e.book === 'Naishou Province' && (e.category === 'schools' || e.category === 'techniques'))
        .map(e => e.category === 'schools' ? e.name : e.school))]);
      check('REF1432-BOOK-SEARCH', await page.evaluate(() => window.__L5R_TEST__.SEARCH14.query({category:'schools', text:'Naishou Province', limit:100})
        .results.map(e => e.name).sort()), naishou);
      const p215 = sorted(expected.filter(e => (e.category === 'clans' || e.category === 'families') && e.page === 215).map(e => e.name));
      check('REF1432-PAGE-SEARCH', await page.evaluate(() => window.__L5R_TEST__.SEARCH14.query({category:'clans', text:'p 215', limit:100})
        .results.map(e => e.name).sort()), p215.length ? p215 : ['no oracle entry']);
      check('REF1432-COPY-ISOLATION', await page.evaluate(() => {
        const S = window.__L5R_TEST__.SEARCH14, id = S.query({category:'schools', text:'Agasha Shugenja', limit:1}).results[0].id;
        const r = S.get(id); r.source = 'wrong'; r.sections[0].items[0].note = 'wrong'; return [S.get(id).source, S.get(id).sections[0].items[0].note];
      }), ['Core Rulebook p.125', 'Core Rulebook p.125']);
      check('REF1432-EARLIER-CITATIONS-KEPT', await page.evaluate(() => {
        const S = window.__L5R_TEST__.SEARCH14, one = (c, t) => S.query({category:c, text:t, limit:1}).results[0].source;
        return [one('kata', 'Striking as Air'), one('kiho', 'Dharma Technique'), one('skills', 'Kenjutsu'), one('weapons', 'Pistol')];
      }), ['Core Rulebook p.259', 'Book of Water p.189', 'Core Rulebook p.141', 'Imperial Histories 1 p.97']);
    });
    await section('REF1432-UI', async () => {
      await page.click('#ab113Bar [data-section="search"]');
      await page.click('.s14-cat[data-category="schools"]');
      await page.fill('#s14Input', 'Agasha Shugenja');
      check('REF1432-UI-SCHOOL-LIST', await text('.s14-row .s14-source'), 'Core Rulebook p.125');
      await page.locator('.s14-row').first().click();
      check('REF1432-UI-SCHOOL-DETAIL', [await text('.s14-detail > .s14-source'), await text('.s14-detail .s14-section li .s14-source')],
        ['Core Rulebook p.125', 'Core Rulebook p.125']);
      await page.click('.s14-detail [data-s14="back"]');
      check('REF1432-UI-BACK-KEEPS-QUERY', await page.locator('#s14Input').inputValue(), 'Agasha Shugenja');
      // Opens the first row carrying every given text; returns the detail's name, whether its meta names `where`, and its page.
      const open = async (category, query, where, ...must) => {
        await page.evaluate(([category, query]) => window.__L5R_TEST__.SEARCHPAGE14.open({category, text:query}), [category, query]);
        let row = page.locator('.s14-row');
        for (const t of must) row = row.filter({hasText:t});
        await row.first().click();
        const shown = [await text('.s14-detail-name'), (await text('.s14-detail-meta') || '').includes(where), await text('.s14-detail > .s14-source')];
        await page.click('.s14-detail [data-s14="back"]');
        return shown;
      };
      check('REF1432-UI-TECHNIQUE-DETAIL', await open('techniques', 'Elements of All Things', 'Agasha Shugenja', 'Elements of All Things'),
        ['Elements of All Things', true, 'Core Rulebook p.125']);
      check('REF1432-UI-CLAN-DETAIL', await open('clans', 'Badger Clan', 'Clan', 'Badger Clan'), ['Badger Clan', true, 'Core Rulebook p.215']);
      // Kitsune is a Mantis Family and a Fox Family; the Fox Clan's own entry shares p.219, so the row is picked by type and
      // Clan, across all categories (rows show their type only there).
      check('REF1432-UI-FAMILY-DETAIL', await open('', 'Kitsune', 'Fox Clan', 'Family', 'Fox Clan'), ['Kitsune', true, 'Core Rulebook p.219']);
      for (const width of [320, 390]) {
        await page.setViewportSize({width, height:844});
        await page.evaluate(() => window.__L5R_TEST__.SEARCHPAGE14.open({category:'schools', text:'Lion Elite Spearmen'}));
        await page.locator('.s14-row').first().click();
        check('REF1432-WIDTH-' + width, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth &&
          document.getElementById('cl11View').scrollWidth <= document.getElementById('cl11View').clientWidth &&
          (document.querySelector('.s14-detail > .s14-source') || {}).textContent), oracle.schools['Lion Elite Spearmen [Bushi]']);
        await page.click('.s14-detail [data-s14="back"]');
      }
    });
    check('REF1432-CHARACTER-UNCHANGED', await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()) === window.__referenceBefore));
    check('REF1432-STORAGE-UNCHANGED', await page.evaluate(() => JSON.stringify(Object.entries(localStorage).sort()) === window.__referenceStorage));
    check('REF1432-NO-PAGE-ERRORS', errors, []);
    await context.close();
  } finally { await browser.close(); }
  const pass = results.filter(r => r.pass).length;
  if (results.length !== TOTAL) console.log('Unexpected check count ' + results.length + ', expected ' + TOTAL);
  console.log(pass + '/' + results.length + ' checks passed');
  process.exitCode = pass === results.length && results.length === TOTAL ? 0 : 1;
}
main().catch(e => { console.error(e); process.exitCode = 1; });
