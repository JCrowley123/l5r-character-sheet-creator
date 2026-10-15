'use strict';
// BUGFIX — Spell Names Match the Books: two Spells take their printed names (Core pp.182, 196). Old saves keep and cast
// the name they stored, a scroll under the former name still counts, and Search finds both names.
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const RENAMED = [['Enticing Dance of the Flame', 'Enticing the Dance of Flame', 'Fire', 2, 'Core Rulebook p.182'],
  ['Fill with Emptiness', 'Fill the Emptiness', 'Void', 4, 'Core Rulebook p.196']];
const results = [];
function check(id, actual, want = true) {
  if (results.some(x => x.id === id)) throw Error('Duplicate check: ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(want);
  results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + String(JSON.stringify(actual)).slice(0, 500)));
}
async function section(id, run) { try { await run(); } catch (e) { check(id + '-EXCEPTION', String(e.stack), 'no exception'); } }
const TOTAL = 13;
async function main() {
  const browser = await chromium.launch(), errors = [];
  try {
    const url = pathToFileURL(path.resolve(process.argv[2])).href;
    const open = async () => {
      const context = await browser.newContext({viewport:{width:390, height:844}, isMobile:true, hasTouch:true});
      const page = await context.newPage();
      page.on('pageerror', e => errors.push(String(e)));
      await page.goto(url);
      await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11.ready, null, {timeout:60000});
      return {context, page};
    };
    let {context, page} = await open();
    await page.evaluate(() => {
      window.__namesBefore = JSON.stringify(window.__L5R_TEST__.collectData());
      window.__namesStorage = JSON.stringify(Object.entries(localStorage).sort());
    });
    await section('SPN-DATA', async () => {
      check('SPN-SWITCH', await page.evaluate(() => window.__L5R_TEST__.SPELL_NAMES_FIX_ENABLED), true);
      check('SPN-LIBRARY-NAMES', await page.evaluate(R => R.map(([now, was]) => {
        const L = window.__L5R_TEST__.SPELL_LIBRARY;
        return [L.filter(s => s.name === now).map(s => [s.name, s.element, s.mastery]), L.filter(s => s.name === was).length];
      }), RENAMED), RENAMED.map(([now, , el, m]) => [[[now, el, m]], 0]));
      check('SPN-FORMER-NAME', await page.evaluate(R => {
        const N = window.__L5R_TEST__.SPELLNAMES;
        return N ? R.map(r => N.formerName(r[0])).concat([N.formerName(R[0][1]), N.formerName('Kenjutsu'), N.formerName('__proto__'), N.formerName(null)]) : [];
      }, RENAMED), RENAMED.map(r => r[1]).concat(['', '', '', '']));
      check('SPN-SEARCH-NEW-NAMES', await page.evaluate(R => R.map(([now, was]) => {
        const S = window.__L5R_TEST__.SEARCH14, h = S.query({category:'spells', text:now, limit:1}).results[0] || {};
        return [h.name, h.source, (h.tags || []).includes('Formerly ' + was)];
      }), RENAMED), RENAMED.map(([now, , , , page]) => [now, page, true]));
      check('SPN-SEARCH-FORMER-NAMES', await page.evaluate(R => R.map(([, was]) => {
        const S = window.__L5R_TEST__.SEARCH14, one = o => (S.query(o).results[0] || {});
        return [one({category:'spells', text:was, limit:1}).name, one({category:'spells', text:was, limit:1}).source, one({text:was, limit:1}).name];
      }), RENAMED), RENAMED.map(([now, , , , page]) => [now, page, now]));
    });
    await section('SPN-UI', async () => {
      await page.click('#ab113Bar [data-section="search"]');
      await page.evaluate(() => window.__L5R_TEST__.SEARCHPAGE14.open({category:'spells', text:'Fill the Emptiness'}));
      check('SPN-SEARCH-ROW-SHOWS-FORMER', await page.evaluate(() => {
        const row = document.querySelector('.s14-row');
        return row ? [row.querySelector('.s14-name').textContent, row.querySelector('.s14-meta').textContent.includes('Formerly Fill the Emptiness')] : null;
      }), ['Fill with Emptiness', true]);
    });
    check('SPN-CHARACTER-UNCHANGED', await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()) === window.__namesBefore));
    check('SPN-STORAGE-UNCHANGED', await page.evaluate(() => JSON.stringify(Object.entries(localStorage).sort()) === window.__namesStorage));
    await context.close();
    // An older save: the Spell and its scroll stored under the former name.
    ({context, page} = await open());
    await section('SPN-OLD-SAVE', async () => {
      const loaded = await page.evaluate(() => {
        const T = window.__L5R_TEST__, d = T.collectData();
        d.tech.push({name:'Fill the Emptiness', cost:0, desc:'From an older save', spellElement:'void', spellMastery:4});
        d.equip.push({name:'Spell Scroll — Fill the Emptiness', qty:'1', notes:''});
        T.applyData(d);
        const row = [...document.querySelectorAll('#techList .entry')].find(e => e.querySelector('.en-name').value === 'Fill the Emptiness');
        const names = T.collectData().tech.map(t => t.name);
        return {row:row ? [true, row.dataset.spellElement, row.dataset.spellMastery] : [false],
          names:[names.includes('Fill the Emptiness'), names.includes('Fill with Emptiness')],
          scroll:T.hasSpellScroll ? [T.hasSpellScroll('Fill with Emptiness'), T.hasSpellScroll('Fill the Emptiness'), T.hasSpellScroll('Enticing Dance of the Flame')] : null};
      });
      // Guards: an older save loads and keeps its text, before and after this fix.
      check('SPN-OLD-SAVE-LOADS', loaded.row, [true, 'void', '4']);
      check('SPN-OLD-SAVE-KEEPS-NAME', loaded.names, [true, false]);
      check('SPN-FORMER-SCROLL-COUNTS', loaded.scroll, [true, true, false]);
      check('SPN-NEW-SCROLL-COUNTS', await page.evaluate(() => {
        const T = window.__L5R_TEST__, d = T.collectData();
        d.equip.push({name:'Spell Scroll — Enticing Dance of the Flame', qty:'1', notes:''});
        T.applyData(d);
        return T.hasSpellScroll ? [T.hasSpellScroll('Enticing Dance of the Flame'), T.SPELL_LIBRARY.some(s => s.name === 'Enticing Dance of the Flame')] : null;
      }), [true, true]);
    });
    await context.close();
    check('SPN-NO-PAGE-ERRORS', errors, []);
  } finally { await browser.close(); }
  const pass = results.filter(r => r.pass).length;
  if (results.length !== TOTAL) console.log('Unexpected check count ' + results.length + ', expected ' + TOTAL);
  console.log(pass + '/' + results.length + ' checks passed');
  process.exitCode = pass === results.length && results.length === TOTAL ? 0 : 1;
}
main().catch(e => { console.error(e); process.exitCode = 1; });
