'use strict';
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
async function section(id, run) { try { await run(); } catch(e) { check(id + '-EXCEPTION', String(e.stack), 'no exception'); } }
const citation = e => e.book + ' p.' + e.page;
async function main() {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({viewport:{width:390,height:844}, isMobile:true, hasTouch:true});
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    const text = async selector => (await page.locator(selector).allTextContents())[0] || null;
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);
    await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11.ready, null, {timeout:60000});
    await page.evaluate(() => {
      window.__referenceBefore = JSON.stringify(window.__L5R_TEST__.collectData());
      window.__referenceStorage = JSON.stringify(Object.entries(localStorage).sort());
    });
    await section('REF-DATA', async () => {
      check('REF-SWITCH', await page.evaluate(() => window.__L5R_TEST__.SEARCH_REFERENCES_ENABLED), true);
      check('REF-COUNTS', await page.evaluate(() => [window.__L5R_TEST__.KATA_LIBRARY.length, window.__L5R_TEST__.KIHO_LIBRARY.length]), [17,73]);
      for (const cat of ['kata','kiho']) {
        const rows = expected.filter(e => e.category === cat);
        const got = await page.evaluate(cat => {
          const T = window.__L5R_TEST__, lib = cat === 'kata' ? T.KATA_LIBRARY : T.KIHO_LIBRARY;
          return lib.map(e => { const hit = T.SEARCH14.query({category:cat,text:e.name,limit:1}).results[0];
            const r = hit && T.SEARCH14.get(hit.id);
            return {name:e.name, source:hit && hit.source, detail:r && r.source,
              api:T.SEARCHREF142 ? T.SEARCHREF142.source(cat,e.name) : '',
              text:r && r.text[0], original:e.desc}; });
        }, cat);
        check('REF-' + cat.toUpperCase() + '-COVERAGE', got.map(e => e.name).sort(), rows.map(e => e.name).sort());
        const expectedByName = Object.fromEntries(rows.map(e => [e.name,citation(e)]));
        check('REF-' + cat.toUpperCase() + '-LIST-PAGES', got.map(e => [e.name,e.source]), got.map(e => [e.name,expectedByName[e.name]]));
        check('REF-' + cat.toUpperCase() + '-DETAIL-PAGES', got.map(e => [e.name,e.detail]), got.map(e => [e.name,expectedByName[e.name]]));
        check('REF-' + cat.toUpperCase() + '-LOOKUP', got.map(e => [e.name,e.api]), got.map(e => [e.name,expectedByName[e.name]]));
        check('REF-' + cat.toUpperCase() + '-TEXT-PRESERVED', got.every(e => e.text === e.original));
      }
      check('REF-NORMALISED-LOOKUP', await page.evaluate(() => {
        const R = window.__L5R_TEST__.SEARCHREF142;
        return R ? [R.source('kiho', '  DESTINY’S STRIKE  '),R.source('kata','  striking   as AIR ')] : [];
      }), [citation(expected.find(e => e.name === "Destiny's Strike")), 'Core Rulebook p.259']);
      check('REF-NO-GUESSED-PAGES', await page.evaluate(() => {
        const R = window.__L5R_TEST__.SEARCHREF142;
        return R ? [R.source('kata','missing'),R.source('spells','Air Fist'),R.source('__proto__','toString'),R.source('kiho','constructor'),R.source(null,null)] : null;
      }), ['','','','','']);
      const rows = expected.filter(e => e.category === 'kiho' && e.book === 'Book of Water');
      check('REF-BOOK-SEARCH', await page.evaluate(() => window.__L5R_TEST__.SEARCH14.query({category:'kiho',text:'Book of Water',limit:100}).results.map(e => e.name)).then(names => rows.filter(e => names.includes(e.name)).map(e => e.name).sort()),rows.map(e => e.name).sort());
      const paged = expected.filter(e => e.category === 'kata' && e.page === 260);
      check('REF-PAGE-SEARCH', await page.evaluate(() => window.__L5R_TEST__.SEARCH14.query({category:'kata',text:'260',limit:100}).results.map(e => e.name).sort()),paged.map(e => e.name).sort());
      check('REF-UNKNOWN-RECORD-UNCITED', await page.evaluate(() => {
        const T = window.__L5R_TEST__, row = {name:'Unverified test kata',ring:'Air',mastery:1,schools:'Any',desc:'Test only.'};
        T.KATA_LIBRARY.push(row); T.SEARCH14.invalidate();
        const hit = T.SEARCH14.query({category:'kata',text:row.name,limit:1}).results[0];
        T.KATA_LIBRARY.pop(); T.SEARCH14.invalidate(); return hit.source;
      }), '');
      check('REF-COPY-ISOLATION', await page.evaluate(() => {
        const S=window.__L5R_TEST__.SEARCH14, id=S.query({category:'kata',text:'Striking as Air',limit:1}).results[0].id;
        const r=S.get(id);r.source='wrong';return S.get(id).source;
      }), 'Core Rulebook p.259');
    });
    await section('REF-UI', async () => {
      await page.click('#ab113Bar [data-section="search"]');
      await page.click('.s14-cat[data-category="kata"]');
      await page.fill('#s14Input','Striking as Air');
      check('REF-UI-KATA-LIST', await text('.s14-row .s14-source'), 'Core Rulebook p.259');
      await page.locator('.s14-row').first().click();
      check('REF-UI-KATA-DETAIL', await text('.s14-detail .s14-source'), 'Core Rulebook p.259');
      await page.click('.s14-detail [data-s14="back"]');
      check('REF-BACK-KEEPS-QUERY', await page.locator('#s14Input').inputValue(),'Striking as Air');
      await page.evaluate(() => window.__L5R_TEST__.SEARCHPAGE14.open({category:'kiho',text:''}));
      await page.selectOption('[data-facet="ring"]','Water');
      await page.fill('#s14Input','Dharma');
      const water = expected.filter(e => e.category === 'kiho' && e.name === 'Dharma Technique');
      check('REF-FILTERED-LIST', await page.locator('.s14-row .s14-name').allTextContents(), water.map(e => e.name).sort());
      check('REF-FILTERED-SOURCES', await page.locator('.s14-row .s14-source').allTextContents(),water.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(citation));
      const hasKiho = await page.locator('.s14-row').count() > 0;
      if(hasKiho) await page.locator('.s14-row').first().click();
      check('REF-UI-KIHO-DETAIL', await text('.s14-detail .s14-source'),citation(water.slice().sort((a,b)=>a.name.localeCompare(b.name))[0]));
      if(hasKiho) await page.click('.s14-detail [data-s14="back"]');
      check('REF-BACK-KEEPS-FILTER', await page.locator('[data-facet="ring"]').inputValue(),'Water');
      for (const width of [320,390]) {
        await page.setViewportSize({width,height:844});
        check('REF-WIDTH-' + width, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth &&
          document.getElementById('cl11View').scrollWidth <= document.getElementById('cl11View').clientWidth));
      }
    });
    check('REF-CHARACTER-UNCHANGED', await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()) === window.__referenceBefore));
    check('REF-STORAGE-UNCHANGED', await page.evaluate(() => JSON.stringify(Object.entries(localStorage).sort()) === window.__referenceStorage));
    check('REF-NO-PAGE-ERRORS',errors,[]);
    await context.close();
  } finally { await browser.close(); }
  const pass=results.filter(r=>r.pass).length;
  console.log(pass+'/'+results.length+' checks passed');
  process.exitCode=pass===results.length?0:1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
