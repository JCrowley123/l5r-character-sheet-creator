'use strict';
// Phase 9.1 (Part H): every School's flavour text, in our own words with its printed page, in Search's School detail
// and the School preview (#cfs_schoolInfo). Data: qa/school-flavour.json. Catalogues come from the test seam.
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const lore = JSON.parse(fs.readFileSync(path.join(__dirname, 'school-flavour.json'), 'utf8'));
const byName = Object.fromEntries(lore.map(e => [e.name, e]));
const shown = n => byName[n] ? byName[n].text + ' (' + byName[n].book + ' p.' + byName[n].page + ')' : null;
const results = [];
function check(id, actual, want = true) {
  if (results.some(x => x.id === id)) throw Error('Duplicate check: ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(want);
  results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + String(JSON.stringify(actual)).slice(0, 500)));
}
async function section(id, run) { try { await run(); } catch (e) { check(id + '-EXCEPTION', String(e.stack), 'no exception'); } }
const TOTAL = 19;
async function main() {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({viewport:{width:390, height:844}, isMobile:true, hasTouch:true});
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);
    await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11.ready, null, {timeout:60000});
    await page.evaluate(() => {
      window.__loreBefore = JSON.stringify(window.__L5R_TEST__.collectData());
      window.__loreStorage = JSON.stringify(Object.entries(localStorage).sort());
    });
    // The preview as first drawn: 080 paints it before the flavour data loads, so this proves the repaint.
    const atLoad = await page.evaluate(() => {
      const info = document.getElementById('cfs_schoolInfo'), f = info.querySelector('.cfs-school-flavour');
      return [(info.querySelector('strong') || {}).textContent || '', f ? f.textContent : null];
    });
    await section('FLAV91-DATA', async () => {
      check('FLAV91-SWITCH', await page.evaluate(() => window.__L5R_TEST__.SCHOOL_FLAVOUR_ENABLED), true);
      const d = await page.evaluate(() => {
        const T = window.__L5R_TEST__, S = T.SEARCH14, L = T.SCHOOLLORE9, flat = o => Object.values(o).flat();
        const names = [...new Set(flat(T.SCHOOL_LIBRARY).concat(flat(T.MINOR_CLAN_SCHOOL_LIBRARY), T.BROTHERHOOD_SCHOOL_LIBRARY).map(s => s.name))];
        return {names, api:names.map(n => [n, L ? L.entry(n) : null]),
          records:S.query({category:'schools', limit:100000}).results.map(h => [h.name, S.get(h.id).text])};
      });
      check('FLAV91-EVERY-SCHOOL', d.api.filter(([, e]) => !e).map(([n]) => n), []);
      // Guards on the data itself: every entry names a School, and reads as one or two sentences without quotation.
      check('FLAV91-NO-EXTRA-ENTRIES', [d.names.length, lore.filter(e => !d.names.includes(e.name)).map(e => e.name)], [105, []]);
      check('FLAV91-SHAPE', lore.filter(e => !(typeof e.text === 'string' && e.text.length >= 60 && e.text.length <= 260 &&
        /^[A-Z]/.test(e.text) && /[.!]$/.test(e.text) && (e.text.match(/[.!?](\s|$)/g) || []).length <= 2 && !/["“”]/.test(e.text) &&
        Number.isInteger(e.page) && e.page > 0 && e.book)).map(e => e.name), []);
      check('FLAV91-LOOKUP', d.api.map(([n, e]) => [n, e]), d.api.map(([n]) => [n, byName[n] ? {text:byName[n].text, book:byName[n].book,
        page:byName[n].page, source:byName[n].book + ' p.' + byName[n].page} : null]));
      check('FLAV91-NORMALISED-LOOKUP', await page.evaluate(() => {
        const L = window.__L5R_TEST__.SCHOOLLORE9;
        return L ? [(L.entry('  agasha   SHUGENJA ') || {}).source, (L.entry("FUKUROKUJIN'S EYES [MONK]") || {}).source] : [];
      }), [byName['Agasha Shugenja'].book + ' p.' + byName['Agasha Shugenja'].page,
        byName['Fukurokujin’s Eyes [Monk]'].book + ' p.' + byName['Fukurokujin’s Eyes [Monk]'].page]);
      check('FLAV91-NO-GUESSED-ENTRIES', await page.evaluate(() => {
        const L = window.__L5R_TEST__.SCHOOLLORE9;
        return L ? [L.entry('missing'), L.entry('__proto__'), L.entry('constructor'), L.entry(null), L.entry(), L.searchText('missing')] : null;
      }), [null, null, null, null, null, []]);
      check('FLAV91-SEARCH-TEXT', d.records.map(([n, t]) => [n, t]), d.records.map(([n]) => [n, shown(n) ? [shown(n)] : []]));
      check('FLAV91-SEARCH-FINDS-TEXT', await page.evaluate(() => window.__L5R_TEST__.SEARCH14.query({category:'schools',
        text:'unconventional magic alchemy', limit:5}).results.map(r => r.name)), ['Agasha Shugenja']);
      check('FLAV91-COPY-ISOLATION', await page.evaluate(() => {
        const S = window.__L5R_TEST__.SEARCH14, id = S.query({category:'schools', text:'Agasha Shugenja', limit:1}).results[0].id;
        const r = S.get(id); r.text = ['wrong']; return S.get(id).text;
      }), [shown('Agasha Shugenja')]);
    });
    await section('FLAV91-UI', async () => {
      check('FLAV91-INFO-AT-LOAD', [atLoad[0] !== '', atLoad[1]], [true, shown(atLoad[0])]);
      // Every School the preview can show, through the Clan, Minor Clan and Brotherhood pickers; text exact and escaped.
      const every = await page.evaluate(() => {
        const clan = document.getElementById('cfs_clan'), minor = document.getElementById('cfs_minorClan'), school = document.getElementById('cfs_school');
        const info = document.getElementById('cfs_schoolInfo'), saved = [clan.value, minor.value, school.value], out = [];
        const set = (el, v) => { el.value = v; el.dispatchEvent(new Event('change', {bubbles:true})); };
        const read = () => [...school.options].forEach(o => {
          if (!o.value) return;
          set(school, o.value);
          const f = info.querySelector('.cfs-school-flavour');
          out.push([o.value, f ? f.textContent : null, f ? [...f.children].map(c => c.tagName).join() : null,
            info.lastElementChild === f, /Monk: Void starts at/.test(info.textContent)]);
        });
        [...clan.options].forEach(c => {
          set(clan, c.value);
          if (c.value === 'Minor Clan') [...minor.options].forEach(m => { set(minor, m.value); read(); });
          else read();
        });
        set(clan, saved[0]); set(minor, saved[1]); set(school, saved[2]);
        return out;
      });
      const uniq = [...new Map(every.map(e => [e[0], e])).values()];
      check('FLAV91-INFO-EVERY-SCHOOL', [uniq.length, uniq.filter(e => e[1] !== shown(e[0]) || e[2] !== 'EM').map(e => e[0])], [105, []]);
      const monks = uniq.filter(e => e[4]);
      check('FLAV91-INFO-AFTER-MONK-NOTE', [monks.length > 0, monks.filter(e => !e[3]).map(e => e[0])], [true, []]);
      await page.click('#ab113Bar [data-section="search"]');
      await page.evaluate(() => window.__L5R_TEST__.SEARCHPAGE14.open({category:'schools', text:'Agasha Shugenja'}));
      await page.locator('.s14-row').first().click();
      check('FLAV91-SEARCH-DETAIL-UI', await page.evaluate(() => [...document.querySelectorAll('.s14-detail .s14-text')].map(p => p.textContent)),
        [shown('Agasha Shugenja')]);
      await page.click('.s14-detail [data-s14="back"]');
      for (const width of [320, 390]) {
        await page.setViewportSize({width, height:844});
        await page.evaluate(() => window.__L5R_TEST__.SEARCHPAGE14.open({category:'schools', text:'The Temples of the Thousand Fortunes'}));
        await page.locator('.s14-row').first().click();
        check('FLAV91-WIDTH-' + width, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth &&
          document.getElementById('cl11View').scrollWidth <= document.getElementById('cl11View').clientWidth &&
          (document.querySelector('.s14-detail .s14-text') || {}).textContent), shown('The Temples of the Thousand Fortunes [Monk]'));
        await page.click('.s14-detail [data-s14="back"]');
      }
    });
    check('FLAV91-CHARACTER-UNCHANGED', await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()) === window.__loreBefore));
    check('FLAV91-STORAGE-UNCHANGED', await page.evaluate(() => JSON.stringify(Object.entries(localStorage).sort()) === window.__loreStorage));
    check('FLAV91-NO-PAGE-ERRORS', errors, []);
    await context.close();
  } finally { await browser.close(); }
  const pass = results.filter(r => r.pass).length;
  if (results.length !== TOTAL) console.log('Unexpected check count ' + results.length + ', expected ' + TOTAL);
  console.log(pass + '/' + results.length + ' checks passed');
  process.exitCode = pass === results.length && results.length === TOTAL ? 0 : 1;
}
main().catch(e => { console.error(e); process.exitCode = 1; });
