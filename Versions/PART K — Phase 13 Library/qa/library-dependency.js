// Phase 13 Library: the page layer switched off. LIB13 still answers; the Library tab keeps the app's placeholder;
// Search shows plain citations. The same checks on the build as shipped establish the premise (the page mounts there).
// Usage: node library-dependency.js <sheet.html>
const {chromium} = require('playwright');
const {pathToFileURL} = require('url');
const path = require('path');
const fs = require('fs');
const os = require('os');

const T = '__L5R_TEST__';
const results = [];
function check(id, ok, detail){ results.push({id, ok: !!ok, detail: ok ? '' : String(detail || '')}); }

async function probe(browser, file){
  const pg = await browser.newPage({viewport: {width: 390, height: 844}});
  const errors = [];
  pg.on('pageerror', e => errors.push(e.message));
  await pg.goto(pathToFileURL(file).href);
  await pg.waitForFunction(T => window[T] && window[T].LIB13 && window[T].SEARCHPAGE14, T, {timeout: 20000});
  await pg.waitForTimeout(800);
  const logic = await pg.evaluate(T => {
    const L = window[T].LIB13;
    const book = L.recognise({pages: 404, text: 'Legend of the Five Rings RPG, 4th Edition'});
    const cite = L.citations('See Core Rulebook p.139.')[0];
    return {book: book && book.name, page: cite && cite.page, pdf: L.pdfPageFor({offset: -3, pages: 404}, 139)};
  }, T);
  await pg.evaluate(T => window[T].CL11.open('library'), T);
  await pg.waitForTimeout(500);
  const shelf = await pg.evaluate(() => {
    const p = document.querySelector('.cl11-panel[data-panel="library"]');
    return {root: !!(p && p.querySelector('.l13-root')), placeholder: !!p && p.textContent.includes('The sourcebook Library arrives in Phase 13.')};
  });
  // A citation is linked only for a book on the shelf, so one is put there through the logic layer.
  await pg.evaluate(async T => { await window[T].LIB13.add({name: 'Core Rulebook', bookId: 'core', file: new Blob(['%PDF-1.4'], {type: 'application/pdf'}), pages: 404, offset: -3, pageState: 'matched'}); }, T);
  await pg.evaluate(T => window[T].SEARCHPAGE14.open({category: 'skills', text: 'Athletics'}), T);
  await pg.waitForTimeout(300);
  await pg.evaluate(() => { const b = Array.from(document.querySelectorAll('.cl11-panel[data-panel="search"] button')).find(x => x.querySelector('.s14-name') && x.querySelector('.s14-name').textContent === 'Athletics'); b.click(); });
  await pg.waitForTimeout(600);
  const search = await pg.evaluate(() => ({sources: document.querySelectorAll('.s14-source').length, links: document.querySelectorAll('.l13-cite').length}));
  await pg.evaluate(async T => { for(const b of await window[T].LIB13.list()) await window[T].LIB13.remove(b.id); }, T);
  await pg.close();
  return {logic, shelf, search, errors};
}

(async () => {
  const sheet = path.resolve(process.argv[2]);
  const body = fs.readFileSync(sheet, 'utf8');
  const SWITCH = 'const LIBRARY_PAGE_ENABLED = true;';
  if(body.split(SWITCH).length !== 2) throw new Error('page switch not found exactly once');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'l13dep-'));
  const off = path.join(dir, 'page-off.html');
  fs.writeFileSync(off, body.replace(SWITCH, 'const LIBRARY_PAGE_ENABLED = false;'));
  const browser = await chromium.launch();

  const on = await probe(browser, sheet);
  check('D13-PREMISE-PAGE-MOUNTS', on.shelf.root && !on.shelf.placeholder, JSON.stringify(on.shelf));
  check('D13-PREMISE-SEARCH-LINKED', on.search.links > 0, JSON.stringify(on.search));

  const r = await probe(browser, off);
  check('D13-OFF-LOGIC-RECOGNISES', r.logic.book === 'Core Rulebook', JSON.stringify(r.logic));
  check('D13-OFF-LOGIC-CITATIONS', r.logic.page === 139 && r.logic.pdf === 142, JSON.stringify(r.logic));
  check('D13-OFF-PLACEHOLDER-STAYS', !r.shelf.root && r.shelf.placeholder, JSON.stringify(r.shelf));
  check('D13-OFF-SEARCH-PLAIN', r.search.sources > 0 && r.search.links === 0, JSON.stringify(r.search));
  check('D13-OFF-NO-PAGE-ERRORS', r.errors.length === 0 && on.errors.length === 0, r.errors.concat(on.errors).slice(0, 3).join(' | '));

  await browser.close();
  fs.rmSync(dir, {recursive: true, force: true});
  const pass = results.filter(x => x.ok).length;
  results.forEach(x => console.log((x.ok ? 'PASS ' : 'FAIL ') + x.id + (x.ok ? '' : '  ' + x.detail.slice(0, 300))));
  console.log(`${pass}/${results.length} checks passed`);
  process.exit(pass === results.length ? 0 : 1);
})().catch(e => { console.error('HARNESS ERROR', e.message.slice(0, 500)); console.log(`${results.filter(x => x.ok).length}/7 checks passed (stopped)`); process.exit(2); });
