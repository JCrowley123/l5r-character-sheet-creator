// Phase 13 Library, Releases 1 and 1.1: focused checks. Usage: node library-harness.js <sheet.html>
// Fixtures are synthetic PDFs from make-test-pdf.py (no book text). Oracles: the fixtures' own parameters,
// the Search catalogue's citation text, and the character save in localStorage, never LIB13's own answers alone.
// Release 1.1's checks never stop the run (guarded), so a build without them still reports every check.
const {chromium} = require('playwright');
const {pathToFileURL} = require('url');
const path = require('path');
const fs = require('fs');
const os = require('os');
const {execFileSync} = require('child_process');

const T = '__L5R_TEST__';
const results = [];
const EXPECTED = 75; // checks in a full run; a stopped run reports against this
function check(id, ok, detail){ results.push({id, ok: !!ok, detail: ok ? '' : String(detail || '')}); }
// fn returns true to pass, anything else is the failure's detail; a throw fails the check without stopping the run.
async function guarded(id, fn){
  try { const v = await fn(); check(id, v === true, typeof v === 'string' ? v : JSON.stringify(v)); } catch(e){ check(id, false, e.message); }
}
const JPX = [[180, 40, 40], [40, 60, 170]]; // make-test-pdf.py's JPX_LEFT and JPX_RIGHT: the picture's two halves
// Dark pixels of a canvas inside a rectangle given as fractions: their count, their height in CSS pixels, and whether
// the canvas is painted (a canvas just sized is transparent until drawn, which is not ink). Runs in the page.
const INK = `(c, x0, y0, x1, y1) => {
  if(!c || !c.width) return {n: 0, h: 0, painted: false};
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let n = 0, top = Infinity, bottom = -1, painted = true;
  for(let i = 3; i < d.length; i += 4) if(d[i] < 255){ painted = false; break; }
  for(let y = Math.floor(c.height * y0); y < Math.floor(c.height * y1); y++) for(let x = Math.floor(c.width * x0); x < Math.floor(c.width * x1); x++){
    const i = (y * c.width + x) * 4;
    if(d[i + 3] === 255 && d[i] + d[i + 1] + d[i + 2] < 300){ n++; top = Math.min(top, y); bottom = Math.max(bottom, y); }
  }
  return {n: n, h: n ? (bottom - top + 1) * c.getBoundingClientRect().width / c.width : 0, painted: painted};
}`;
async function samplesJpx(pg, selector){
  return pg.evaluate(([sel, want]) => { const c = document.querySelector(sel), x = c.getContext('2d');
    const got = [0.25, 0.75].map(fx => Array.from(x.getImageData(Math.floor(c.width * fx), Math.floor(c.height / 2), 1, 1).data.slice(0, 3)));
    return got.every((p, i) => p.every((v, k) => Math.abs(v - want[i][k]) <= 4)) || JSON.stringify(got); }, [selector, JPX]);
}
// The carried openjpeg.wasm made into a module this browser rejects, as Safari rejects its relaxed SIMD.
function wasmUnsupported(){ document.getElementById('lib13Jpx').textContent = btoa('\0asm\x01\0\0\0\xff'); }
async function openSheet(browser, sheet, opts){
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const seen = {errors: [], requests: []};
  page.on('pageerror', e => seen.errors.push(e.message));
  page.on('request', r => { if(!/^(file|blob|data):/.test(r.url()) && !/^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(r.url())) seen.requests.push(r.url()); });
  await page.goto(pathToFileURL(sheet).href);
  await page.waitForFunction(T => !!window[T] && !!window[T].LIB13, T, {timeout: 20000});
  await page.waitForTimeout(800);
  return {ctx, page, seen};
}

function makePdf(dir, name, args){
  const out = path.join(dir, name);
  execFileSync('python', ['-I', path.join(__dirname, 'make-test-pdf.py'), out].concat(args), {stdio: 'pipe'});
  return out;
}

async function openLibrary(pg){
  await pg.evaluate(T => window[T].CL11.open('library'), T);
  await pg.waitForSelector('.l13-root', {timeout: 10000});
}
async function addBook(pg, file, opts){
  opts = opts || {};
  await pg.click('#l13Add');
  await pg.setInputFiles('#l13AddDialog input[type=file]', file);
  await pg.waitForFunction(() => { const b = document.querySelector('[data-l13="add"]'); return b && !b.disabled; }, null, {timeout: 30000});
  if(!opts.early) await pg.waitForFunction(() => document.querySelector('[data-l13="pages"]').dataset.state !== 'matching', null, {timeout: 30000});
  const seen = await pg.evaluate(() => ({
    book: document.querySelector('[data-l13="book"]').innerText.replace(/\s+/g, ' ').trim(),
    pages: document.querySelector('[data-l13="pages"]').dataset.state,
    name: document.querySelector('#l13Name').value
  }));
  if(opts.before) await opts.before(pg);
  await pg.click('[data-l13="add"]');
  return seen;
}
async function books(pg){ return pg.evaluate(async T => window[T].LIB13.list(), T); }
async function clearLibrary(pg){
  await pg.evaluate(async T => { for(const b of await window[T].LIB13.list()) await window[T].LIB13.remove(b.id); window[T].LIBPAGE13.closeReader(); }, T);
}
async function noSideways(pg){
  return pg.evaluate(() => {
    const els = [document.scrollingElement].concat(Array.from(document.querySelectorAll('.l13-root,.l13-dialog,.l13-reader,.l13-rbody')));
    return els.filter(Boolean).every(e => e.scrollWidth <= e.clientWidth + 1);
  });
}

(async () => {
  const sheet = path.resolve(process.argv[2]);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'l13-'));
  const core = makePdf(dir, 'Core Rulebook.pdf', ['--pages', '404', '--offset', '-3', '--labels', 'r0,D3', '--info-title', 'L5R_00_Introduction.indd',
    '--title-line', '4=Legend of the Five Rings RPG, 4th Edition', '--art', '1-3']);
  const titleOnly = makePdf(dir, 'core-title-only.pdf', ['--pages', '404', '--offset', '-3', '--info-title', 'Core Rulebook', '--title-line', '2=A Different Book']);
  const misTitled = makePdf(dir, 'air-titled.pdf', ['--pages', '404', '--offset', '-3', '--info-title', 'The Book of Air', '--title-line', '4=Legend of the Five Rings RPG, 4th Edition']);
  const wrongLabels = makePdf(dir, 'ua2.pdf', ['--pages', '84', '--offset', '0', '--labels', 'r0,D1', '--title-line', '2=Unexpected Allies 2']);
  const noLabels = makePdf(dir, 'clans.pdf', ['--pages', '306', '--offset', '-1', '--title-line', '2=The Great Clans']);
  const scan = makePdf(dir, 'scan.pdf', ['--pages', '60', '--no-numbers', '--title-line', '2=Book of Earth']);
  const jpx = makePdf(dir, 'jpx.pdf', ['--pages', '30', '--jpx', '1,8', '--title-line', '2=A Picture Book']);
  const mid = makePdf(dir, 'mid.pdf', ['--pages', '30', '--mid-numbers', '--title-line', '2=A Margin Book']);

  const browser = await chromium.launch();
  const pg = await browser.newPage({viewport: {width: 390, height: 844}});
  const errors = [], requests = [];
  pg.on('pageerror', e => errors.push(e.message));
  // The sheet's own web fonts predate the Library; anything else off the device is the Library's.
  pg.on('request', r => { if(!/^(file|blob|data):/.test(r.url()) && !/^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(r.url())) requests.push(r.url()); });
  await pg.goto(pathToFileURL(sheet).href);
  await pg.waitForFunction(T => !!window[T], T, {timeout: 20000});
  await pg.waitForTimeout(300);
  if(!(await pg.evaluate(T => !!window[T].LIB13, T))){ check('L13-SEAM', false, 'no LIB13 in this build'); throw new Error('the Library is absent'); }
  await pg.waitForTimeout(800);

  // Seam and switches
  check('L13-SEAM', await pg.evaluate(T => window[T].LIBRARY_ENABLED === true && window[T].LIBRARY_PAGE_ENABLED === true && !!window[T].LIBPAGE13, T));
  const saveBefore = await pg.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)])));

  // Citations and the worker guard (pure functions)
  const cites = await pg.evaluate(T => {
    const L = window[T].LIB13;
    return [L.citations('Core Rulebook p.139'), L.citations('Core p. 42'), L.citations('The Great Clans p.12; Book of Air p.3'), L.citations('Imperial Histories p.9')]
      .map(a => a.map(c => c.bookId + ':' + c.page).join(','));
  }, T);
  check('L13-CITATIONS', cites.join('|') === 'core:139|core:42|clans:12,air:3|', cites.join('|'));
  check('L13-WORKER-GUARD', await pg.evaluate(T => { try { window[T].LIB13.classicWorker('export{X};'); return false; } catch(e){ return true; } }, T));

  // Empty Library
  await openLibrary(pg);
  const empty = await pg.evaluate(() => document.querySelector('.l13-root').innerText);
  check('L13-EMPTY', /Your Library is empty/.test(empty) && /Add the books you own as PDF files\./.test(empty) && /(Tap|Click) \+ Book to add one\./.test(empty)
    && /Books use 0 MB on this device/.test(empty), empty);
  check('L13-NO-EPUB', !/epub/i.test(empty));
  check('L13-LAYOUT-EMPTY', await noSideways(pg));

  // Add a book: recognised from the first pages, page numbers from the labels confirmed by printed numbers
  const seen = await addBook(pg, core);
  await pg.waitForSelector('.l13-row', {timeout: 30000});
  check('L13-RECOGNISED', seen.book.startsWith('Recognised as Core Rulebook') && seen.name === 'Core Rulebook', JSON.stringify(seen));
  check('L13-PAGES-MATCHED', seen.pages === 'matched', seen.pages);
  let list = await books(pg);
  check('L13-RECORD', list.length === 1 && list[0].bookId === 'core' && list[0].offset === -3 && list[0].pageMethod === 'labels' && list[0].pages === 404
    && list[0].size === fs.statSync(core).size && list[0].coverPage === 4, JSON.stringify(list[0]));
  const shelf = await pg.evaluate(() => ({ rows: document.querySelectorAll('.l13-row').length, title: document.querySelector('.l13-title').textContent,
    more: document.querySelector('.l13-more').getAttribute('aria-label'), img: !!document.querySelector('.l13-row .l13-cover img'),
    foot: document.querySelector('#l13Foot').textContent }));
  const usage = await pg.evaluate(async T => window[T].LIB13.formatSize(await window[T].LIB13.usage()), T);
  check('L13-SHELF', shelf.rows === 1 && shelf.title === 'Core Rulebook' && shelf.more === 'More for Core Rulebook' && shelf.img
    && shelf.foot === 'Books use ' + usage + ' on this device', JSON.stringify(shelf));
  check('L13-PERSIST-NOTE', await pg.evaluate(async T => !document.querySelector('#l13Persist').hidden === !(await window[T].LIB13.persisted()), T));
  check('L13-LAYOUT-SHELF', await noSideways(pg));

  // Storage isolation: the character save is untouched; clearing either store leaves the other
  const saveAfter = await pg.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)])));
  check('L13-SAVES-UNTOUCHED', saveAfter === saveBefore);
  check('L13-NO-LOCALSTORAGE', !/l5r-library|lib13/i.test(saveAfter));

  // The reader opens at the printed page; the page jump takes printed numbers
  await pg.evaluate(async a => window[a.T].LIBPAGE13.openReader(a.id, 139, 'library'), {T, id: list[0].id});
  await pg.waitForSelector('.l13-page.l13-drawn', {timeout: 30000});
  let rs = await pg.evaluate(T => window[T].LIBPAGE13.state().reader, T);
  const chip = await pg.evaluate(() => document.querySelector('.l13-chip').textContent);
  check('L13-READER-PRINTED', rs.page === 142 && rs.printed === 139 && chip === 'Printed page 139', JSON.stringify(rs) + ' ' + chip);
  await pg.fill('#l13Jump', '7');
  await pg.click('.l13-jump button');
  await pg.waitForTimeout(300);
  rs = await pg.evaluate(T => window[T].LIBPAGE13.state().reader, T);
  check('L13-PAGE-JUMP', rs.page === 10 && rs.printed === 7, JSON.stringify(rs));
  check('L13-READER-BACK-LIBRARY', await pg.evaluate(() => document.querySelector('#l13ReaderBack').textContent === '‹ Library'));
  check('L13-LAYOUT-READER', await noSideways(pg));
  check('L13-CANVAS-BOUND', await pg.evaluate(() => document.querySelectorAll('.l13-page canvas').length <= 12));
  await pg.click('#l13ReaderBack');
  check('L13-READER-CLOSED', await pg.evaluate(() => !document.querySelector('#l13Reader')));

  // Links from Search: Athletics' citation opens the book at the printed page; back returns to Search
  const ath = await pg.evaluate(T => { const r = window[T].SEARCH14.query({text: 'Athletics', category: 'skills', offset: 0, limit: 5}).results.find(x => x.name === 'Athletics'); return r && r.source; }, T);
  check('L13-ORACLE-ATHLETICS', /Core Rulebook p\. ?139/.test(ath || ''), ath);
  await pg.evaluate(T => window[T].SEARCHPAGE14.open({category: 'skills', text: 'Athletics'}), T);
  await pg.waitForTimeout(300);
  await pg.evaluate(() => { const b = Array.from(document.querySelectorAll('.cl11-panel[data-panel="search"] button')).find(x => x.querySelector('.s14-name') && x.querySelector('.s14-name').textContent === 'Athletics'); b.click(); });
  await pg.waitForSelector('.l13-cite', {timeout: 10000});
  check('L13-LINK-SHOWN', await pg.evaluate(() => document.querySelector('.l13-cite').textContent.startsWith('Core Rulebook p')));
  await pg.click('.l13-cite');
  const prompt = await pg.evaluate(() => { const a = document.querySelector('.l13-alert'); return a && a.innerText.replace(/\s+/g, ' '); });
  check('L13-LINK-PROMPT', prompt && prompt.includes('Open Core Rulebook at p.139?') && prompt.includes('It opens in the Library, at the printed page.'), prompt);
  await pg.click('.l13-alert .l13-btn-p');
  await pg.waitForSelector('.l13-page.l13-drawn', {timeout: 30000});
  rs = await pg.evaluate(T => window[T].LIBPAGE13.state().reader, T);
  check('L13-LINK-OPENS-PRINTED', rs.from === 'search' && rs.page === 142 && rs.printed === 139, JSON.stringify(rs));
  check('L13-LINK-BACK-LABEL', await pg.evaluate(() => document.querySelector('#l13ReaderBack').textContent === '‹ Search'));
  await pg.click('#l13ReaderBack');
  check('L13-LINK-BACK-SEARCH', await pg.evaluate(() => !document.querySelector('#l13Reader') && !document.querySelector('.cl11-panel[data-panel="search"]').hidden && !!document.querySelector('.l13-cite')));

  // A citation of a book not on the shelf stays plain text in this release
  const notShelved = await pg.evaluate(T => { const q = window[T].SEARCH14.query({text: '', offset: 0, limit: 5000}).results; const r = q.find(x => /The Great Clans p\./.test(x.source || '')); return r && r.name; }, T);
  if(notShelved){
    await pg.evaluate(a => window[a.T].SEARCHPAGE14.open({text: a.n}), {T, n: notShelved});
    await pg.waitForTimeout(300);
    await pg.evaluate(n => { const b = Array.from(document.querySelectorAll('.cl11-panel[data-panel="search"] button')).find(x => x.querySelector('.s14-name') && x.querySelector('.s14-name').textContent === n); if(b) b.click(); }, notShelved);
    await pg.waitForTimeout(400);
    check('L13-NO-LINK-NOT-SHELVED', await pg.evaluate(() => !Array.from(document.querySelectorAll('.l13-cite')).some(c => /Great Clans/.test(c.textContent))));
  } else check('L13-NO-LINK-NOT-SHELVED', false, 'no Great Clans citation found');

  // Delete: asked first; Cancel keeps it; Delete removes book, file and cover; links stop
  await openLibrary(pg);
  await pg.click('.l13-more');
  await pg.click('#l13Delete');
  const ask = await pg.evaluate(() => document.querySelector('.l13-alert').innerText.replace(/\s+/g, ' '));
  check('L13-DELETE-ASKS', ask.includes('Delete Core Rulebook?'), ask);
  await pg.click('.l13-alert .l13-btn-s');
  check('L13-DELETE-CANCEL', (await books(pg)).length === 1);
  await pg.click('.l13-more');
  await pg.click('#l13Delete');
  await pg.click('.l13-alert .l13-btn-p');
  await pg.waitForSelector('.l13-empty', {timeout: 10000});
  const left = await pg.evaluate(async T => { const db = await window[T].LIB13.db(); const n = s => new Promise(r => { const q = db.transaction(s).objectStore(s).count(); q.onsuccess = () => r(q.result); }); return [await n('books'), await n('files'), await n('covers')]; }, T);
  check('L13-DELETE-ALL', left.join() === '0,0,0', left.join());
  await pg.evaluate(T => window[T].SEARCHPAGE14.open({category: 'skills', text: 'Athletics'}), T);
  await pg.waitForTimeout(300);
  await pg.evaluate(() => { const b = Array.from(document.querySelectorAll('.cl11-panel[data-panel="search"] button')).find(x => x.querySelector('.s14-name') && x.querySelector('.s14-name').textContent === 'Athletics'); b.click(); });
  await pg.waitForTimeout(400);
  check('L13-DELETED-NO-LINK', await pg.evaluate(() => !document.querySelector('.l13-cite')));

  // Recognition is never from the PDF's title metadata
  await openLibrary(pg);
  let s = await addBook(pg, titleOnly);
  check('L13-TITLE-ALONE-NOT-RECOGNISED', /Not recognised/.test(s.book), s.book);
  await pg.waitForSelector('.l13-row', {timeout: 30000});
  list = await books(pg);
  check('L13-TITLE-ALONE-NO-LINK-BOOK', list[0].bookId === null, JSON.stringify(list[0]));
  await clearLibrary(pg); await openLibrary(pg); await pg.evaluate(T => window[T].LIBPAGE13.render(), T);
  s = await addBook(pg, misTitled);
  check('L13-TEXT-OVER-TITLE', s.book.startsWith('Recognised as Core Rulebook'), s.book);
  await pg.waitForSelector('.l13-row', {timeout: 30000});
  await clearLibrary(pg); await pg.evaluate(T => window[T].LIBPAGE13.render(), T);

  // Page numbers: wrong labels are overruled by the printed numbers; no labels; nothing printed (Check now)
  const match = async file => pg.evaluate(async T => { const L = window[T].LIB13, f = document.querySelector('#l13Probe').files[0], h = await L.load(f); const m = await L.matchPages(h); const i = await L.inspect(h); L.unload(h); return {m, i}; }, T)
    .catch(e => ({error: e.message}));
  await pg.evaluate(() => { const i = document.createElement('input'); i.type = 'file'; i.id = 'l13Probe'; i.hidden = true; document.body.appendChild(i); });
  await pg.setInputFiles('#l13Probe', wrongLabels);
  let r = await match();
  check('L13-WRONG-LABELS', r.m.state === 'matched' && r.m.offset === 0 && r.m.method === 'printed' && r.m.evidence.labelOffset === -1 && r.i.book.id === 'ua2', JSON.stringify(r));
  await pg.setInputFiles('#l13Probe', noLabels);
  r = await match();
  check('L13-NO-LABELS', r.m.state === 'matched' && r.m.offset === -1 && r.m.method === 'printed' && r.i.book.id === 'clans', JSON.stringify(r));
  await pg.setInputFiles('#l13Probe', scan);
  r = await match();
  check('L13-SCAN-NEEDS-CHECK', r.m.state === 'check', JSON.stringify(r.m));

  // Check now: one page, one answer sets the offset
  await openLibrary(pg);
  s = await addBook(pg, scan, {before: async pg => {
    await pg.click('[data-l13="checknow"]');
    const q = await pg.evaluate(() => document.querySelector('.l13-sheet').innerText.replace(/\s+/g, ' '));
    check('L13-CHECK-NOW-ASKS', q.includes('What page number is printed here?') && q.includes('PDF page 12'), q);
    await pg.fill('#l13Printed', '11');
    await pg.click('[data-l13="done"]');
  }});
  check('L13-CHECK-STATE', s.pages === 'check', s.pages);
  await pg.waitForSelector('.l13-row', {timeout: 30000});
  list = await books(pg);
  check('L13-CHECK-NOW-OFFSET', list[0].offset === -1 && list[0].pageMethod === 'asked' && list[0].pageState === 'matched', JSON.stringify(list[0]));
  await clearLibrary(pg); await pg.evaluate(T => window[T].LIBPAGE13.render(), T);

  // Add book never waits for the page matching: a late result is written to the book
  await pg.evaluate(T => { const L = window[T].LIB13; window.__l13Match = L.matchPages; let release; window.__l13Release = new Promise(r => { release = r; }); window.__l13Go = release;
    L.matchPages = h => window.__l13Release.then(() => window.__l13Match(h)); }, T);
  s = await addBook(pg, core, {early: true}).catch(async () => {
    await pg.evaluate(() => window.__l13Go());
    await pg.waitForFunction(() => !document.querySelector('[data-l13="add"]').disabled, null, {timeout: 30000});
    await pg.click('[data-l13="add"]');
    return {pages: 'Add book waited for the matching'};
  });
  check('L13-ADD-NOT-WAITING', s.pages === 'matching', s.pages);
  await pg.waitForSelector('.l13-row', {timeout: 30000});
  list = await books(pg);
  check('L13-SAVED-WHILE-MATCHING', list.length === 1 && list[0].pageState === 'matching', JSON.stringify(list[0]));
  await pg.evaluate(() => window.__l13Go());
  for(let i = 0; i < 60 && (list = await books(pg))[0].pageState !== 'matched'; i++) await pg.waitForTimeout(250);
  check('L13-LATE-MATCH-WRITTEN', list[0].offset === -3 && list[0].pageMethod === 'labels', JSON.stringify(list[0]));
  await pg.evaluate(T => { window[T].LIB13.matchPages = window.__l13Match; }, T);
  await clearLibrary(pg); await pg.evaluate(T => window[T].LIBPAGE13.render(), T);

  // Review fixes (17 October). Another PDF chosen while the first one's cover is still being drawn:
  // the first read, failing late on its closed file, must not touch the second one's dialog.
  await pg.evaluate(T => { const L = window[T].LIB13; window.__l13Cover = L.makeCover; let go, n = 0; window.__l13CoverHeld = new Promise(r => { go = r; }); window.__l13CoverGo = go;
    L.makeCover = h => (n++ === 0 ? window.__l13CoverHeld.then(() => window.__l13Cover(h)) : window.__l13Cover(h)); }, T);
  await pg.click('#l13Add');
  await pg.setInputFiles('#l13AddDialog input[type=file]', noLabels);
  await pg.waitForFunction(() => document.querySelector('[data-l13="book"]').innerText.includes('The Great Clans'), null, {timeout: 30000});
  await pg.setInputFiles('#l13AddDialog input[type=file]', core);
  await pg.waitForFunction(() => { const b = document.querySelector('[data-l13="add"]'); return b && !b.disabled && document.querySelector('[data-l13="book"]').innerText.includes('Core Rulebook'); }, null, {timeout: 30000}).catch(() => {});
  await pg.evaluate(() => window.__l13CoverGo());
  await pg.waitForTimeout(800);
  const swap = await pg.evaluate(() => ({book: document.querySelector('[data-l13="book"]').innerText.replace(/\s+/g, ' ').trim(),
    pages: !document.querySelector('[data-l13="pagefld"]').hidden, add: !document.querySelector('[data-l13="add"]').disabled}));
  check('L13-CHOOSE-ANOTHER-WHILE-READING', swap.book.includes('Recognised as Core Rulebook') && swap.pages && swap.add, JSON.stringify(swap));
  await pg.evaluate(T => { window[T].LIB13.makeCover = window.__l13Cover; }, T);
  await pg.click('[data-l13="cancel"]');

  // Nothing closes or changes Add a book while the book is being saved
  await pg.evaluate(T => { const L = window[T].LIB13; window.__l13Add = L.add; let go; window.__l13Saved = new Promise(r => { go = r; }); window.__l13SaveGo = go;
    L.add = info => window.__l13Saved.then(() => window.__l13Add(info)); }, T);
  await pg.click('#l13Add');
  await pg.setInputFiles('#l13AddDialog input[type=file]', core);
  await pg.waitForFunction(() => { const b = document.querySelector('[data-l13="add"]'); return b && !b.disabled; }, null, {timeout: 30000});
  await pg.click('[data-l13="add"]');
  const locked = await pg.evaluate(T => {
    const name = document.querySelector('#l13Name'); name.value += ' x'; name.dispatchEvent(new Event('input', {bubbles: true}));
    const out = {cancel: document.querySelector('[data-l13="cancel"]').disabled, add: document.querySelector('[data-l13="add"]').disabled};
    window[T].LIBPAGE13.closeAdd();
    out.open = !!document.querySelector('#l13AddDialog');
    return out;
  }, T);
  check('L13-ADD-LOCKED-WHILE-SAVING', locked.cancel && locked.add && locked.open, JSON.stringify(locked));
  await pg.evaluate(T => { window.__l13SaveGo(); }, T);
  await pg.waitForSelector('.l13-row', {timeout: 30000}).catch(() => {});
  await pg.evaluate(T => { window[T].LIB13.add = window.__l13Add; }, T);
  list = await books(pg);
  check('L13-ADD-SAVED-ONCE', list.length === 1 && !(await pg.$('#l13AddDialog')), list.length);

  // Two quick opens leave one reader, and closing it leaves none; a reader reopened at once draws
  const rid = list.length ? list[0].id : '';
  await pg.evaluate(([T, id]) => { const P = window[T].LIBPAGE13; P.openReader(id, null, 'library'); P.openReader(id, null, 'library'); }, [T, rid]);
  await pg.waitForSelector('#l13Reader .l13-page', {timeout: 20000}).catch(() => {});
  await pg.waitForTimeout(400);
  const twice = await pg.evaluate(T => { const n = document.querySelectorAll('[id="l13Reader"]').length; window[T].LIBPAGE13.closeReader(); return {open: n, left: document.querySelectorAll('[id="l13Reader"]').length}; }, T);
  check('L13-READER-DOUBLE-OPEN', twice.open === 1 && twice.left === 0, JSON.stringify(twice));
  await pg.evaluate(([T, id]) => { const P = window[T].LIBPAGE13; return P.openReader(id, null, 'library').then(() => { P.closeReader(); return P.openReader(id, 139, 'library'); }); }, [T, rid]);
  check('L13-READER-REOPENS', await pg.waitForSelector('#l13Reader .l13-drawn', {timeout: 20000}).then(() => true, () => false));
  await pg.evaluate(T => window[T].LIBPAGE13.closeReader(), T);
  // A book opened while another closes in the middle of drawing (the PDF worker busy) still opens.
  check('L13-LOAD-WHILE-ANOTHER-CLOSES', await pg.evaluate(async ([T, id]) => { const L = window[T].LIB13; const blob = await L.file(id); const out = [];
    for(let i = 0; i < 5; i++){
      const a = await L.load(blob);
      const busy = [1, 2, 3, 4].map(n => L.draw(a, n, document.createElement('canvas'), 1200, 2).promise.catch(() => {}));
      L.unload(a);
      try { const b = await L.load(blob); out.push(b.pages); L.unload(b); } catch(e){ out.push(String(e.message).slice(0, 60)); }
      await Promise.all(busy);
    }
    return out.every(x => x === 404) || out.join(); }, [T, rid]) === true);

  // Two renders at once give one row per book
  check('L13-SHELF-ONE-ROW-PER-BOOK', (await pg.evaluate(async T => { const P = window[T].LIBPAGE13; await Promise.all([P.render(), P.render()]);
    return document.querySelectorAll('.l13-row').length; }, T)) === 1);
  await clearLibrary(pg); await pg.evaluate(T => window[T].LIBPAGE13.render(), T);

  // "Great Clans p.N" links like "The Great Clans p.N"; a drawn page frees its decoded images
  check('L13-CITATION-GREAT-CLANS', await pg.evaluate(T => { const c = window[T].LIB13.citations('Great Clans p.42'); return c.length === 1 && c[0].bookId === 'clans' && c[0].page === 42; }, T));
  check('L13-DRAW-FREES-PAGE', await pg.evaluate(async T => { let freed = false;
    const page = {getViewport: o => ({width: 100 * o.scale, height: 150 * o.scale}), render: () => ({promise: Promise.resolve(), cancel(){}}), cleanup(){ freed = true; }};
    await window[T].LIB13.draw({doc: {getPage: async () => page}}, 1, document.createElement('canvas'), 100, 1).promise; return freed; }, T));

  // No room: nothing is half-saved and the message says how much is needed
  await pg.evaluate(() => { const put = IDBObjectStore.prototype.put; window.__l13Put = put;
    IDBObjectStore.prototype.put = function(v, k){ if(this.name === 'files') throw new DOMException('full', 'QuotaExceededError'); return put.apply(this, arguments); }; });
  await addBook(pg, core);
  await pg.waitForSelector('[data-l13="error"]:not([hidden])', {timeout: 10000});
  const full = await pg.evaluate(() => document.querySelector('[data-l13="error"]').textContent);
  check('L13-NO-ROOM-MESSAGE', full.startsWith('There isn’t room for this book on this device. It needs about ' + Math.round(fs.statSync(core).size / 1e3) + ' KB.'), full);
  check('L13-NO-ROOM-NOTHING-SAVED', (await books(pg)).length === 0);
  await pg.evaluate(() => { IDBObjectStore.prototype.put = window.__l13Put; });
  await pg.click('[data-l13="cancel"]');

  // Clearing the Library's database never touches the character save, and the other way round
  await addBook(pg, core);
  await pg.waitForSelector('.l13-row', {timeout: 30000});
  const iso = await pg.evaluate(async T => {
    const before = JSON.stringify(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)]));
    const db = await window[T].LIB13.db(); db.close();
    await new Promise(r => { const q = indexedDB.deleteDatabase(window[T].LIB13.DB_NAME); q.onsuccess = q.onerror = q.onblocked = () => r(); });
    const after = JSON.stringify(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)]));
    return before === after;
  }, T);
  check('L13-CLEAR-LIBRARY-KEEPS-SAVES', iso);

  // ---- Release 1.1 ----
  // Chrome compiles openjpeg.wasm and PDF.js is told to use it; the worker's fallback import becomes the carried copy
  await pg.setInputFiles('#l13Probe', jpx);
  await guarded('L13-WASM-DETECT', () => pg.evaluate(async T => { const L = window[T].LIB13;
    const h = await L.load(document.querySelector('#l13Probe').files[0]); L.unload(h);
    return (L.useWasm === null && L.wasmUsable() === true && h.useWasm === true) || JSON.stringify({useWasm: L.useWasm, handle: h.useWasm}); }, T));
  await guarded('L13-WORKER-GUARD-NOWASM', () => pg.evaluate(T => { const L = window[T].LIB13;
    const w = document.getElementById('lib13PdfWorker').textContent, f = document.getElementById('lib13JpxNoWasm').textContent;
    const out = L.classicWorker(w, f);
    const refuses = args => { try { L.classicWorker.apply(null, args); return false; } catch(e){ return true; } };
    return (out.includes('lib13NoWasm') && !out.includes('this._noWasmFilename}`') && !out.includes('import.meta')
      && refuses([w, f.replace('export default OpenJPEG;', '')]) && refuses([w.replace('/*@vite-ignore*/', ''), f])) || 'shape not guarded'; }, T));

  // Safari, on an iPhone-sized 3x screen: the carried openjpeg.wasm cannot be compiled there
  const s2 = await openSheet(browser, sheet, {viewport: {width: 390, height: 844}, deviceScaleFactor: 3});
  const pg2 = s2.page;
  await pg2.evaluate(wasmUnsupported);
  await openLibrary(pg2);
  await addBook(pg2, jpx).catch(() => {});
  await pg2.waitForSelector('.l13-row', {timeout: 30000}).catch(() => {});
  const jbook = (await books(pg2))[0] || {};
  await guarded('L13-SAFARI-NO-WASM', () => pg2.evaluate(async ([T, id]) => { const L = window[T].LIB13;
    const h = await L.load(await L.file(id)); L.unload(h);
    return (L.wasmUsable() === false && h.useWasm === false) || JSON.stringify({handle: h.useWasm}); }, [T, jbook.id]));
  // Page 1 is the picture: drawn, it is the cover (blank, the cover would be a later page)
  await guarded('L13-JPX-COVER', async () => jbook.coverPage === 1 || JSON.stringify(jbook));
  await pg2.evaluate(([T, id]) => window[T].LIBPAGE13.openReader(id, null, 'library'), [T, jbook.id]);
  await pg2.waitForSelector('.l13-page[data-page="1"].l13-drawn', {timeout: 30000}).catch(() => {});
  await guarded('L13-JPX-READER', () => samplesJpx(pg2, '.l13-page[data-page="1"] canvas'));
  const page1 = () => pg2.evaluate(() => { const s = document.querySelector('.l13-page[data-page="1"]'), c = s && s.querySelector('canvas');
    return c ? {r: c.width / s.clientWidth, px: c.width * c.height, w: c.width, css: s.clientWidth} : {}; });
  await guarded('L13-READER-DPR3', async () => { const p = await page1(); return Math.abs(p.w - Math.floor(p.css * 3)) <= 1 || JSON.stringify(p); });
  // Pinch zoom (Chrome's page scale, as the visual viewport reports it): page 1 redrawn at 3 x 2.5, then back to 3
  const cdp = await s2.ctx.newCDPSession(pg2);
  const zoomTo = async (scale, until) => { await cdp.send('Emulation.setPageScaleFactor', {pageScaleFactor: scale});
    await pg2.waitForFunction(until, null, {timeout: 20000}).catch(() => {}); };
  const ratioOver = min => { const s = document.querySelector('.l13-page[data-page="1"]'), c = s && s.querySelector('canvas'); return !!c && c.width / s.clientWidth > min; };
  await zoomTo(2.5, `(${ratioOver})(7)`);
  await guarded('L13-ZOOM-SHARPER', async () => { const p = await page1(); return (p.r >= 7.45 && p.r <= 7.55 && p.px <= 16777216) || JSON.stringify(p); });
  await zoomTo(1, `!(${ratioOver})(3.05)`);
  await guarded('L13-ZOOM-OUT-RESTORES', async () => { const p = await page1(); return Math.abs(p.w - Math.floor(p.css * 3)) <= 1 || JSON.stringify(p); });
  // Zoomed far in, no canvas passes iOS's 16.7 million pixels: page 1 stops at that limit, short of 3 x 5
  await zoomTo(5, `(${ratioOver})(9)`);
  await guarded('L13-ZOOM-WITHIN-LIMITS', async () => { const p = await page1();
    const max = await pg2.evaluate(() => Math.max.apply(null, Array.from(document.querySelectorAll('#l13Reader canvas')).map(c => c.width * c.height)));
    return (max <= 16777216 && p.r >= 9 && p.r < 15) || JSON.stringify({max, p}); });
  await zoomTo(1, `!(${ratioOver})(3.05)`);
  await pg2.evaluate(T => window[T].LIBPAGE13.closeReader(), T);

  // Check now: the page full width and sharp; the side margins enlarged halfway down, where the numbers are printed.
  // The margin fixture prints PDF page n's number (n - 1) halfway down the left margin on even pages, the right on odd.
  await pg2.click('#l13Add');
  await pg2.setInputFiles('#l13AddDialog input[type=file]', mid);
  await pg2.waitForFunction(() => { const b = document.querySelector('[data-l13="add"]'); return b && !b.disabled; }, null, {timeout: 30000}).catch(() => {});
  await pg2.evaluate(T => window[T].LIBPAGE13.checkNow(), T);
  // Waits for the number in one margin with the other margin painted
  const margin = side => `(() => { const ink = ${INK}; const ms = document.querySelectorAll('.l13-sheet [data-l13="margin"]');
    return ink(ms[${side}], 0, 0, 1, 1).n > 5 && ink(ms[${1 - side}], 0, 0, 1, 1).painted; })()`;
  await pg2.waitForFunction(margin(0), null, {timeout: 15000}).catch(() => {});
  await pg2.waitForTimeout(300);
  await guarded('L13-CHECK-NOW-FULL-WIDTH', () => pg2.evaluate(() => { const sh = document.querySelector('.l13-sheet'), c = sh.querySelector('[data-l13="checkpage"]');
    const cs = getComputedStyle(sh), inner = sh.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), w = c.getBoundingClientRect().width;
    return (w >= inner - 1 && c.width >= Math.floor(w * 3) - 1 && sh.scrollWidth <= sh.clientWidth + 1) || JSON.stringify({inner, w, px: c.width}); }));
  await guarded('L13-CHECK-NOW-MARGINS', () => pg2.evaluate(`(() => { const ink = ${INK};
    const ms = document.querySelectorAll('.l13-sheet [data-l13="margin"]'), page = document.querySelector('.l13-sheet [data-l13="checkpage"]');
    const left = ink(ms[0], 0, 0, 1, 1), right = ink(ms[1], 0, 0, 1, 1), onPage = ink(page, 0, 0.4, 0.25, 0.6);
    const shown = document.querySelector('[data-l13="pdfpage"]').textContent;
    return (left.n > 5 && right.painted && right.n === 0 && onPage.n > 0 && left.h >= 2 * onPage.h && shown === 'PDF page 6')
      || JSON.stringify({left, right, onPage, shown}); })()`));
  await pg2.click('[data-l13="next"]', {timeout: 3000}).catch(() => {});
  await pg2.waitForFunction(margin(1), null, {timeout: 15000}).catch(() => {});
  await guarded('L13-CHECK-NOW-ANOTHER-PAGE', () => pg2.evaluate(`(() => { const ink = ${INK};
    const ms = document.querySelectorAll('.l13-sheet [data-l13="margin"]'), shown = document.querySelector('[data-l13="pdfpage"]').textContent;
    const left = ink(ms[0], 0, 0, 1, 1), right = ink(ms[1], 0, 0, 1, 1);
    return (right.n > 5 && left.painted && left.n === 0 && shown === 'PDF page 7') || JSON.stringify({left, right, shown}); })()`));
  // The number read on the page shown (6 on PDF page 7) gives the fixture's own offset, -1
  await pg2.fill('#l13Printed', '6');
  await pg2.click('[data-l13="done"]');
  await pg2.click('[data-l13="add"]');
  await pg2.waitForFunction(() => document.querySelectorAll('.l13-row').length === 2, null, {timeout: 30000}).catch(() => {});
  await guarded('L13-CHECK-NOW-SHOWN-PAGE', async () => { const b = (await books(pg2)).find(x => x.name === 'mid');
    return (!!b && b.offset === -1 && b.pageMethod === 'asked') || JSON.stringify(b); });

  // A shelf render started while an earlier one still reads its covers: one list
  await guarded('L13-SHELF-COVER-RACE', () => pg2.evaluate(async T => { const L = window[T].LIB13, P = window[T].LIBPAGE13, cover = L.cover;
    let release, calls = 0;
    const held = new Promise(r => { release = r; });
    L.cover = function(id){ calls++; return calls === 1 ? held.then(() => cover.call(L, id)) : cover.call(L, id); };
    try {
      const a = P.render();
      while(calls < 1) await new Promise(r => setTimeout(r, 5));
      await P.render();
      release();
      await a;
    } finally { L.cover = cover; }
    const out = {lists: document.querySelectorAll('.l13-root .l13-list').length, rows: document.querySelectorAll('.l13-row').length, books: (await L.list()).length};
    return (out.lists === 1 && out.rows === out.books && out.books === 2) || JSON.stringify(out); }, T));

  // PDF.js's own path when the wasm fails anyway (told to use it): the carried copy still draws the picture
  const s3 = await openSheet(browser, sheet, {viewport: {width: 390, height: 844}});
  await s3.page.evaluate(wasmUnsupported);
  await s3.page.evaluate(() => { const i = document.createElement('input'); i.type = 'file'; i.id = 'l13Probe'; i.hidden = true; document.body.appendChild(i); });
  await s3.page.setInputFiles('#l13Probe', jpx);
  await guarded('L13-JPX-WASM-FAILS-FALLBACK', async () => {
    await s3.page.evaluate(async T => { const L = window[T].LIB13; L.useWasm = true;
      const h = await L.load(document.querySelector('#l13Probe').files[0]), c = document.createElement('canvas');
      c.id = 'l13JpxProbe'; document.body.appendChild(c);
      await L.draw(h, 1, c, 200, 1).promise; L.unload(h); }, T);
    return samplesJpx(s3.page, '#l13JpxProbe');
  });
  check('L13-SAFARI-CLEAN', !s2.seen.errors.length && !s3.seen.errors.length && !s2.seen.requests.length && !s3.seen.requests.length,
    JSON.stringify([s2.seen, s3.seen]).slice(0, 300));
  await s2.ctx.close();
  await s3.ctx.close();

  // Layout at the narrowest widths; nothing fetched from the network
  for(const w of [320, 375]){
    await pg.setViewportSize({width: w, height: 760});
    await openLibrary(pg);
    await pg.click('#l13Add');
    check('L13-LAYOUT-ADD-' + w, await noSideways(pg));
    await pg.click('[data-l13="cancel"]');
  }
  check('L13-OFFLINE', requests.length === 0, requests.slice(0, 3).join(' '));
  check('L13-NO-PAGE-ERRORS', errors.length === 0, errors.slice(0, 3).join(' | '));

  await browser.close();
  fs.rmSync(dir, {recursive: true, force: true});
  const pass = results.filter(r => r.ok).length;
  results.forEach(r => console.log((r.ok ? 'PASS ' : 'FAIL ') + r.id + (r.ok ? '' : '  ' + r.detail.slice(0, 300))));
  console.log(`${pass}/${results.length} checks passed`);
  process.exit(pass === results.length ? 0 : 1);
})().catch(e => {
  console.error('HARNESS ERROR', e.message.slice(0, 500));
  results.forEach(r => console.log((r.ok ? 'PASS ' : 'FAIL ') + r.id + (r.ok ? '' : '  ' + r.detail.slice(0, 300))));
  console.log(`${results.filter(r => r.ok).length}/${EXPECTED} checks passed (stopped after ${results.length})`);
  process.exit(2);
});
