'use strict';
// Phase 14.3a (Part K): Skills, Weapons and Spells carry their printed entry pages in Search.
// Oracle: qa/expected-pages.json, read from the owner's books (SOURCES.md). Catalogues come from the test seam.
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const expected = JSON.parse(fs.readFileSync(path.join(__dirname, 'expected-pages.json'), 'utf8'));
const CATS = ['skills', 'weapons', 'spells'];
const results = [];
function check(id, actual, want = true) {
  if (results.some(x => x.id === id)) throw Error('Duplicate check: ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(want);
  results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + String(JSON.stringify(actual)).slice(0, 500)));
}
async function section(id, run) { try { await run(); } catch (e) { check(id + '-EXCEPTION', String(e.stack), 'no exception'); } }
const citation = e => e.book + ' p.' + e.page;
const TOTAL = 32;
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
    await section('REF143-DATA', async () => {
      check('REF143-SWITCH', await page.evaluate(() => window.__L5R_TEST__.SEARCH_REFERENCES_143_ENABLED), true);
      for (const cat of CATS) {
        const rows = expected.filter(e => e.category === cat), byName = Object.fromEntries(rows.map(e => [e.name, citation(e)]));
        const got = await page.evaluate(cat => {
          const T = window.__L5R_TEST__, S = T.SEARCH14;
          return S.query({category:cat, limit:100000}).results.map(hit => {
            const r = S.get(hit.id);
            return {name:hit.name, type:r.type, source:hit.source, detail:r.source, text:r.text[0] || '',
              api:T.SEARCHREF143 ? T.SEARCHREF143.source(cat, hit.name) : ''};
          });
        }, cat);
        const U = cat.toUpperCase();
        check('REF143-' + U + '-COVERAGE', got.filter(e => e.source).map(e => e.name).sort(), rows.map(e => e.name).sort());
        check('REF143-' + U + '-LIST-PAGES', got.map(e => [e.name, e.source]), got.map(e => [e.name, byName[e.name] || '']));
        check('REF143-' + U + '-DETAIL-PAGES', got.map(e => [e.name, e.detail]), got.map(e => [e.name, byName[e.name] || '']));
        check('REF143-' + U + '-LOOKUP', got.map(e => [e.name, e.api]), got.map(e => [e.name, byName[e.name] || '']));
        // Descriptions and notes stay the catalogue's own text.
        check('REF143-' + U + '-TEXT-PRESERVED', await page.evaluate(([cat, got]) => {
          const T = window.__L5R_TEST__;
          const lib = cat === 'skills' ? [] : cat === 'spells' ? T.SPELL_LIBRARY.map(s => [s.name, s.desc]) :
            T.WEAPON_LIBRARY.map(w => [w.name, w.notes || '']).concat((T.ARROW_LIBRARY || []).map(a => [a.name, a.notes || '']));
          const want = Object.fromEntries(lib);
          return got.every(e => !(e.name in want) || e.text === want[e.name]);
        }, [cat, got]), true);
      }
      // Printed under other titles: "Fill with Emptiness" (located by the owner) and "Enticing Dance of the Flame".
      check('REF143-RETITLED-ENTRIES', await page.evaluate(() => {
        const T = window.__L5R_TEST__, S = T.SEARCH14, hit = n => S.query({category:'spells', text:n, limit:1}).results[0] || {};
        return ['Fill the Emptiness', 'Enticing the Dance of Flame'].map(n => [hit(n).name, hit(n).source,
          T.SEARCHREF143 ? T.SEARCHREF143.source('spells', n) : 'no api']);
      }), [['Fill the Emptiness', 'Core Rulebook p.196', 'Core Rulebook p.196'],
        ['Enticing the Dance of Flame', 'Core Rulebook p.182', 'Core Rulebook p.182']]);
      check('REF143-NORMALISED-LOOKUP', await page.evaluate(() => {
        const R = window.__L5R_TEST__.SEARCHREF143;
        return R ? [R.source('skills', '  sleight   OF hand '), R.source('spells', 'TENJIN’S EAR'), R.source('weapons', 'nageteppo (smoke)')] : [];
      }), ['Core Rulebook p.145', citation(expected.find(e => e.name === "Tenjin's Ear")), 'Imperial Histories 1 p.180']);
      check('REF143-NO-GUESSED-PAGES', await page.evaluate(() => {
        const R = window.__L5R_TEST__.SEARCHREF143;
        return R ? [R.source('skills', 'missing'), R.source('kata', 'Kenjutsu'), R.source('__proto__', 'toString'), R.source('spells', 'constructor'),
          R.source(null, null), R.source('spells', 'Fill the Void')] : null;
      }), ['', '', '', '', '', '']);
      const ih = expected.filter(e => e.category === 'weapons' && e.book === 'Imperial Histories 1').map(e => e.name).sort();
      check('REF143-BOOK-SEARCH', await page.evaluate(() => window.__L5R_TEST__.SEARCH14.query({category:'weapons', text:'Imperial Histories 1', limit:100})
        .results.map(e => e.name).sort()), ih);
      const p141 = expected.filter(e => e.category === 'skills' && e.page === 141).map(e => e.name).sort();
      check('REF143-PAGE-SEARCH', await page.evaluate(() => window.__L5R_TEST__.SEARCH14.query({category:'skills', text:'p 141', limit:100})
        .results.map(e => e.name).sort()), p141);
      check('REF143-COPY-ISOLATION', await page.evaluate(() => {
        const S = window.__L5R_TEST__.SEARCH14, id = S.query({category:'skills', text:'Kenjutsu', limit:1}).results[0].id;
        const r = S.get(id); r.source = 'wrong'; return S.get(id).source;
      }), 'Core Rulebook p.141');
      check('REF143-EARLIER-CITATIONS-KEPT', await page.evaluate(() => {
        const S = window.__L5R_TEST__.SEARCH14, one = (c, t) => S.query({category:c, text:t, limit:1}).results[0].source;
        return [one('kata', 'Striking as Air'), one('kiho', 'Dharma Technique')];
      }), ['Core Rulebook p.259', 'Book of Water p.189']);
    });
    await section('REF143-UI', async () => {
      await page.click('#ab113Bar [data-section="search"]');
      await page.click('.s14-cat[data-category="skills"]');
      await page.fill('#s14Input', 'Kenjutsu');
      check('REF143-UI-SKILL-LIST', await text('.s14-row .s14-source'), 'Core Rulebook p.141');
      await page.locator('.s14-row').first().click();
      check('REF143-UI-SKILL-DETAIL', await text('.s14-detail .s14-source'), 'Core Rulebook p.141');
      await page.click('.s14-detail [data-s14="back"]');
      check('REF143-UI-BACK-KEEPS-QUERY', await page.locator('#s14Input').inputValue(), 'Kenjutsu');
      await page.evaluate(() => window.__L5R_TEST__.SEARCHPAGE14.open({category:'weapons', text:'Pistol'}));
      await page.locator('.s14-row').first().click();
      check('REF143-UI-WEAPON-DETAIL', await text('.s14-detail .s14-source'), 'Imperial Histories 1 p.97');
      await page.click('.s14-detail [data-s14="back"]');
      for (const width of [320, 390]) {
        await page.setViewportSize({width, height:844});
        await page.evaluate(() => window.__L5R_TEST__.SEARCHPAGE14.open({category:'spells', text:'Ever-Changing Waves'}));
        await page.locator('.s14-row').first().click();
        check('REF143-WIDTH-' + width, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth &&
          document.getElementById('cl11View').scrollWidth <= document.getElementById('cl11View').clientWidth &&
          (document.querySelector('.s14-detail .s14-source') || {}).textContent === 'Core Rulebook p.191'));
        await page.click('.s14-detail [data-s14="back"]');
      }
    });
    check('REF143-CHARACTER-UNCHANGED', await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()) === window.__referenceBefore));
    check('REF143-STORAGE-UNCHANGED', await page.evaluate(() => JSON.stringify(Object.entries(localStorage).sort()) === window.__referenceStorage));
    check('REF143-NO-PAGE-ERRORS', errors, []);
    await context.close();
  } finally { await browser.close(); }
  const pass = results.filter(r => r.pass).length;
  if (results.length !== TOTAL) console.log('Unexpected check count ' + results.length + ', expected ' + TOTAL);
  console.log(pass + '/' + results.length + ' checks passed');
  process.exitCode = pass === results.length && results.length === TOTAL ? 0 : 1;
}
main().catch(e => { console.error(e); process.exitCode = 1; });
