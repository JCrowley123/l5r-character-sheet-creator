'use strict';
// BUGFIX — Search Keystroke Speed: remembering short normalised texts changes no result, and does remember them.
// Oracle for results: the same sheet with the fix switched off, served in memory. node speed-harness.js <sheet.html>
const fs = require('fs'), crypto = require('crypto'), {chromium} = require('playwright');
const input = fs.readFileSync(process.argv[2], 'utf8'), results = [];
const IDS = ['SS-SWITCH', 'SS-SAME-RESULTS', 'SS-NORMALISE-SAME', 'SS-REMEMBERS', 'SS-LONG-TEXT-NOT-KEPT', 'SS-BOUNDED', 'SS-NO-PAGE-ERRORS'];
function check(id, actual, want = true) {
  const pass = JSON.stringify(actual) === JSON.stringify(want); results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + JSON.stringify(actual).slice(0, 300)));
}
const TEXTS = ['', 'a', 'k', 'the', 'fire', 'air', 'rank 2', 'core', 'p 141', 'O’', 'Élan', '  many   spaces ', 'zzzz'];
const TRICKY = [null, undefined, '', ' ', 'Fire', 'FIRE', 'Kitsune’s', "Kitsune's", 'Été', 2, 0, 'Rank 2', 'x'.repeat(70), 'a-b_c/d'];
async function signature(browser, html) {
  const page = await browser.newPage(), errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.route('**/*', r => r.request().url().startsWith('http://speed.test/') ? r.fulfill({contentType:'text/html', body:html}) : r.abort());
  await page.goto('http://speed.test/');
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11.ready, null, {timeout:60000});
  const out = await page.evaluate(([TEXTS, TRICKY]) => {
    const T = window.__L5R_TEST__, S = T.SEARCH14, F = T.FACETS141, parts = [];
    for (const c of [null].concat(S.categories().map(x => x.id))) for (const text of TEXTS) {
      parts.push(JSON.stringify(S.query({category:c, text, limit:100000})));
      if (c && F && F.has(c)) {
        const facets = F.facets(c), first = facets[0] && facets[0].options.find(o => o.count);
        parts.push(JSON.stringify(F.query({category:c, text, limit:60, filters:first ? {[facets[0].id]:[first.value]} : {}})));
      }
    }
    return {parts, norm:TRICKY.map(v => S.normalise(v))};
  }, [TEXTS, TRICKY]);
  const fixOn = await page.evaluate(() => window.__L5R_TEST__.SEARCHSPEED ? window.__L5R_TEST__.SEARCHSPEED.enabled() : null);
  return {page, errors, fixOn, sig:crypto.createHash('sha256').update(out.parts.join('\n')).digest('hex'), count:out.parts.length, norm:out.norm};
}
async function main() {
  const browser = await chromium.launch();
  try {
    const term = 'const SEARCH_SPEED_FIX_ENABLED = true;';
    // No switch at all is the predecessor (nothing to switch off); more than one is ambiguous.
    const n = input.split(term).length - 1;
    if (n > 1) throw Error('Non-unique switch');
    const off = n === 1 ? input.replace(term, 'const SEARCH_SPEED_FIX_ENABLED = false;') : input;
    const on = await signature(browser, input), base = await signature(browser, off);
    const page = on.page;
    check('SS-SWITCH', await page.evaluate(() => window.__L5R_TEST__.SEARCH_SPEED_FIX_ENABLED === true && !!window.__L5R_TEST__.SEARCHSPEED &&
      window.__L5R_TEST__.SEARCHSPEED.enabled()));
    // Only meaningful when the oracle page really runs without the fix.
    check('SS-SAME-RESULTS', [on.sig === base.sig, on.count > 100, on.count === base.count, base.fixOn !== true], [true, true, true, true]);
    check('SS-NORMALISE-SAME', on.norm, base.norm);
    // A filtered keystroke's normaliser work is remembered: the second identical query computes nothing new.
    check('SS-REMEMBERS', await page.evaluate(() => {
      const T = window.__L5R_TEST__, sp = T.SEARCHSPEED, q = () => T.FACETS141.query({category:'techniques', text:'th', filters:{rank:['2']}, limit:50});
      if (!sp) return 'no fix';
      q(); const a = sp.stats(); q(); const b = sp.stats();
      return [b.misses - a.misses, b.hits - a.hits > 1000];
    }), [0, true]);
    check('SS-LONG-TEXT-NOT-KEPT', await page.evaluate(() => {
      const T = window.__L5R_TEST__, sp = T.SEARCHSPEED;
      if (!sp) return 'no fix';
      const before = sp.stats().size, long = 'Long record body '.repeat(5);
      return [T.SEARCH14.normalise(long) === 'long record body '.repeat(5).trim(), sp.stats().size === before];
    }), [true, true]);
    check('SS-BOUNDED', await page.evaluate(() => {
      const T = window.__L5R_TEST__, sp = T.SEARCHSPEED;
      if (!sp) return 'no fix';
      for (let i = 0; i < 12000; i++) T.SEARCH14.normalise('word ' + i);
      return sp.stats().size <= sp.stats().limit && T.SEARCH14.normalise('Word 11999') === 'word 11999';
    }), true);
    check('SS-NO-PAGE-ERRORS', on.errors.concat(base.errors), []);
  } catch (e) {
    for (const id of IDS) if (!results.some(r => r.id === id)) check(id, 'not reached: ' + String(e.message || e).split('\n')[0], 'completed');
  } finally { await browser.close(); }
  const pass = results.filter(r => r.pass).length;
  console.log(pass + '/' + IDS.length + ' checks passed');
  process.exitCode = pass === IDS.length && results.length === IDS.length ? 0 : 1;
}
main().catch(e => { console.error(e); process.exitCode = 1; });
