// Phase 13 Library, Releases 1, 1.1, 2a, 2b, 2c and 2d: focused checks. Usage: node library-harness.js <sheet.html>
// Fixtures are synthetic PDFs from make-test-pdf.py (no book text). Oracles: the fixtures' own parameters,
// the Search catalogue's citation text, and the character save in localStorage, never LIB13's own answers alone.
// Release 1.1's, 2a's, 2b's, 2c's and 2d's checks never stop the run (guarded), so a build without them still reports every check.
const {chromium} = require('playwright');
const {pathToFileURL} = require('url');
const path = require('path');
const fs = require('fs');
const os = require('os');
const {execFileSync} = require('child_process');

const T = '__L5R_TEST__';
const results = [];
const EXPECTED = 187; // checks in a full run; a stopped run reports against this
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
  // Release 2b: bookmarks in four levels (the fourth is not shown), words to find; a lone top bookmark; bookmarks leading nowhere
  const chap = makePdf(dir, 'chapters.pdf', ['--pages', '40', '--offset', '-2', '--title-line', '2=A Chapter Book',
    '--outline', 'Part One@3;>Chapter A@3;>>Section A1@4;>>Section A2@6;>>>Deep D@7;>Chapter B@9;Part Two@20;>Chapter C@21;>>Section C1@22',
    '--title-line', '6=the lantern of Kyuden Tonbo', '--title-line', '22=Another LANTERN here', '--title-line', "30=Hida's three lanterns lit"]);
  const wrapped = makePdf(dir, 'wrapped.pdf', ['--pages', '20', '--outline', 'The Book@1;>Part A@3;>>Ch A1@4;>>>Sec A1a@5;>>>>Deep@6;>Part B@10']);
  const dead = makePdf(dir, 'dead.pdf', ['--pages', '20', '--outline', 'Part One@3;>Chapter A@4;Part Two@10', '--dead-outline']);
  // Release 2c: a printed contents page (PDF pages 3 and 4; printed = PDF page - 2), page 3 in three columns: a chapter
  // title over two indented lines (a margin number between them) and over a line from the same start (a word in the gutter
  // beside it), a chapter title with no number, a title printed in kerned pieces, one running on, numbers after a single
  // dot or a gap, a fourth level (not shown); page 4 in one narrower column (its indents measured apart from page 3's):
  // titles ending in a number before their leaders, an entry past the book's last page with a section under it (both left out). "lantern" three times on PDF
  // page 20, once on 22.
  const C = (t, p, o) => Object.assign({t}, p == null ? {} : {p}, o || {});
  const CONTENTS = JSON.stringify({
    3: [[C('Part One:', null, {s: 12}), C('2', null, {s: 8, x: 150, y: 632}), C('Opening', null, {s: 12, i: 8}), C('Matters', 3, {s: 12, i: 8}),
      C('Section Alpha', 4), C('Sub Alpha One', 5, {i: 9}),
      C('Sub Alpha Two', 6, {i: 9, split: [3, 6, 9]}), C('Deep Alpha', 7, {i: 18}), C('Deep Alpha Too', 7, {i: 18}), C('Section Beta runs'), C('on over two lines', 8)],
      [C('Book Two', null, {s: 12}), C('Margin', null, {s: 7, x: 240, y: 632}), C('Later Matters', 12, {s: 12}), C('Section Gamma', 13, {lead: 'none'}), C('Sub Gamma One', 14, {i: 9, lead: 'one'}), C('Section Delta', 16)],
      [C('Book Three', null, {s: 12}), C('the Closing Chapter', null, {s: 12}), C('Section Epsilon', 24), C('Sub Epsilon One', 25, {i: 9}), C('Sub Epsilon Two', 26, {i: 9})]],
    4: {width: 100, cols: [[C('Section Zeta', 28), C('Sub Zeta One', 29, {i: 9}), C('Sub Zeta Two', 30, {i: 9}), C('Section Eta', 32),
      C('Appendix 1', 33, {lead: 'far'}), C('Appendix 2', 34, {lead: 'far'}), C('Appendix 3', 35, {lead: 'far'}), C('Index', 36),
      C('Section Omega', 90), C('Sub Omega One', 37, {i: 9})]]}});
  const printedArgs = ['--pages', '40', '--offset', '-2', '--title-line', '3=Contents', '--contents', CONTENTS,
    '--title-line', '20=a lantern, two lanterns, three lanterns', '--title-line', '22=one more lantern'];
  const tocOnly = makePdf(dir, 'contents.pdf', printedArgs);
  const tocFlat = makePdf(dir, 'contents-flat.pdf', printedArgs.concat(['--outline', 'Alpha@5;Beta@14;Gamma@26']));
  const tocDeep = makePdf(dir, 'contents-deep.pdf', printedArgs.concat(['--outline', 'Alpha@5;>Alpha One@7;Beta@14']));
  const tocDead = makePdf(dir, 'contents-dead.pdf', printedArgs.concat(['--outline', 'Alpha@5;Beta@14', '--dead-outline']));
  // Page 3: numbers at the line ends that do not run in order (not a contents page); page 6: the contents page
  const tocJumbled = makePdf(dir, 'jumbled.pdf', ['--pages', '20', '--contents', JSON.stringify({3: [[19, 3, 15, 2, 12, 1].map((p, k) => C('Row ' + 'ABCDEF'[k], p))],
    6: [[C('Part Nine:', null, {s: 12}), C('Late Matters', 8, {s: 12, i: 8}), C('Section Kappa', 9), C('Sub Kappa One', 10, {i: 9}), C('Sub Kappa Two', 11, {i: 9}), C('Section Lambda', 12)]]})]);
  // One flat level of bookmarks and no contents page
  const flatOnly = makePdf(dir, 'flat-only.pdf', ['--pages', '20', '--outline', 'One@3;Two@8']);
  // Release 2d (printed = PDF page - 2): two parts listed one after the other on one page (North Ward and South Ward, p.4;
  // Harbour Lights and Harbour Watch on the last page, p.18, which a phone cannot scroll to its top) and a chapter on its
  // first section's page (Chapter Two and Harbour Gate, p.10), from a contents page and from bookmarks in levels; "ward
  // lantern" printed on p.4
  const TWIN = JSON.stringify({3: [[C('Chapter One', 3, {s: 12}), C('North Ward', 4), C('South Ward', 4), C('Ward Shrines', 5, {i: 9}), C('East Ward', 6),
    C('Chapter Two', 10, {s: 12}), C('Harbour Gate', 10), C('Fish Market', 12), C('Harbour Lights', 18), C('Harbour Watch', 18)]]});
  const twin = makePdf(dir, 'twin.pdf', ['--pages', '20', '--offset', '-2', '--contents', TWIN, '--title-line', '6=a ward lantern here']);
  const twinMarks = makePdf(dir, 'twin-marks.pdf', ['--pages', '20', '--offset', '-2', '--outline',
    'Chapter One@5;>North Ward@6;>South Ward@6;>>Ward Shrines@7;>East Ward@8;Chapter Two@12;>Harbour Gate@12;>Fish Market@14;>Harbour Lights@20;>Harbour Watch@20']);

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

  // ---- Release 2a: views, the full ⋯ menu, covers, not in Library, File missing, Imperial Histories, desktop ----
  // Every check guarded, with short waits, so a build without 2a still reports each one (failing).
  const Q5 = {timeout: 5000};
  const s4 = await openSheet(browser, sheet, {viewport: {width: 390, height: 844}});
  const p4 = s4.page;
  const saves4 = () => p4.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)])));
  const saveBefore4 = await saves4();
  const L4 = (fn, arg) => p4.evaluate(fn, [T, arg]);
  await openLibrary(p4);
  await p4.evaluate(() => { const i = document.createElement('input'); i.type = 'file'; i.id = 'l13Probe4'; i.multiple = true; i.hidden = true; document.body.appendChild(i); });
  await p4.setInputFiles('#l13Probe4', [mid, scan]);
  // Four quick books (no covers) for the shelves: names A–D, the 30-page margin fixture
  await L4(async ([T]) => { const L = window[T].LIB13, f = document.querySelector('#l13Probe4').files[0];
    // A pause between adds: two books added in the same millisecond would share their shelf order at random.
    for(const n of ['A', 'B', 'C', 'D']){ await L.add({file: f, name: n, pages: 30, offset: -1, pageState: 'matched', pageMethod: 'printed'}); await new Promise(r => setTimeout(r, 5)); }
    await window[T].LIBPAGE13.render(); });
  const bookByName = async n => (await books(p4)).find(b => b.name === n) || {};

  await guarded('L13-2A-VIEW-DEFAULT-LIST', () => p4.evaluate(() => { const s = document.querySelector('#l13View');
    const on = s && Array.from(s.querySelectorAll('button')).filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.textContent);
    return (!!s && !s.hidden && on.join() === 'List' && document.querySelectorAll('.l13-row').length === 4) || JSON.stringify({on}); }));
  await p4.click('#l13View [data-view="grid"]', Q5).catch(() => {});
  await p4.waitForSelector('.l13-shelves', Q5).catch(() => {});
  await guarded('L13-2A-GRID-PHONE', () => p4.evaluate(() => { const rows = Array.from(document.querySelectorAll('.l13-shelfrow'));
    const per = rows.map(r => r.querySelectorAll('.l13-cvw').length), lines = rows.map(r => !!r.querySelector('.l13-shelf'));
    return (per.join() === '3,1' && lines.every(Boolean) && !document.querySelector('.l13-list')) || JSON.stringify({per, lines}); }));
  await guarded('L13-2A-GRID-MORE-TOP-LEFT', () => p4.evaluate(() => { const w = document.querySelector('.l13-cvw');
    const c = w.querySelector('.l13-cv').getBoundingClientRect(), m = w.querySelector('.l13-more-c').getBoundingClientRect();
    const dots = w.querySelector('.l13-more-c').getAttribute('aria-label');
    return (m.left <= c.left + 2 && m.top <= c.top + 2 && m.right > c.left && m.bottom > c.top && dots === 'More for A') || JSON.stringify({c, m, dots}); }));
  await guarded('L13-2A-LAYOUT-GRID', async () => (!!(await p4.$('.l13-shelves')) && await noSideways(p4)) || 'no grid, or sideways scroll');
  await p4.reload();
  await p4.waitForFunction(T => !!window[T] && !!window[T].LIB13, T, {timeout: 20000});
  await openLibrary(p4);
  await p4.waitForSelector('.l13-shelves, .l13-list', Q5).catch(() => {});
  await guarded('L13-2A-VIEW-REMEMBERED', async () => { const v = await p4.evaluate(async T => ({ state: window[T].LIBPAGE13.state().view,
    grid: !!document.querySelector('.l13-shelves'), kept: await window[T].LIB13.pref('view'),
    ls: Object.keys(localStorage).filter(k => /view|librar|l13/i.test(k)) }), T);
    return (v.state === 'grid' && v.grid && v.kept === 'grid' && !v.ls.length) || JSON.stringify(v); });
  await p4.click('#l13View [data-view="list"]', Q5).catch(() => {});
  await p4.waitForSelector('.l13-list', Q5).catch(() => {});

  // The ⋯ menu: exactly four items under "PDF, kept on this device"
  await p4.click('.l13-row .l13-more', Q5).catch(() => {});
  await guarded('L13-2A-MENU-ITEMS', () => p4.evaluate(() => { const a = document.querySelector('.l13-act');
    const items = a ? Array.from(a.querySelectorAll('.l13-mrow')).map(r => r.querySelector('span').firstChild.textContent) : [];
    const head = a && a.querySelector('.l13-acthead').innerText.replace(/\s+/g, ' ');
    return (items.join('|') === 'Rename|Change cover|Fix page numbers|Delete' && /A PDF, kept on this device/.test(head)) || JSON.stringify({items, head}); }));
  // Rename: the shelf name only
  const a0 = await bookByName('A');
  await p4.click('#l13Rename', Q5).catch(() => {});
  await p4.fill('#l13RenameInput', 'My Margin Book', Q5).catch(() => {});
  await guarded('L13-2A-RENAME-ASKS', () => p4.evaluate(() => { const a = document.querySelector('.l13-alert'); const t = a && a.textContent.replace(/\s+/g, ' ');
    return (!!t && t.includes('Rename') && t.includes('Name on your shelf') && t.includes('Only the name on your shelf changes. Search’s links still open this book.')) || t; }));
  await p4.click('.l13-alert .l13-btn-p', Q5).catch(() => {});
  await p4.waitForTimeout(400);
  await guarded('L13-2A-RENAME', async () => { const b = (await books(p4)).find(x => x.id === a0.id) || {};
    const title = await p4.evaluate(id => { const r = document.querySelector('.l13-row[data-id="' + id + '"] .l13-title'); return r && r.textContent; }, a0.id);
    return (b.name === 'My Margin Book' && b.bookId === a0.bookId && b.offset === a0.offset && title === 'My Margin Book') || JSON.stringify({b, title}); });

  // Fix page numbers: the page shown and its number set the offset; Previous / Next show another page
  await p4.click('.l13-row[data-id="' + a0.id + '"] .l13-more', Q5).catch(() => {});
  await p4.click('#l13FixPages', Q5).catch(() => {});
  await p4.waitForFunction(() => { const c = document.querySelector('#l13FixDialog [data-l13="checkpage"]'); return c && c.width > 0; }, null, Q5).catch(() => {});
  await guarded('L13-2A-FIX-PAGES-ASKS', () => p4.evaluate(() => { const d = document.querySelector('#l13FixDialog'); const t = d && d.innerText.replace(/\s+/g, ' ');
    return (!!t && t.includes('Fix page numbers') && t.includes('Fix them here only if a link opens the wrong page.') && t.includes('What page number is printed here?')
      && t.includes('PDF page 6 of 30') && d.querySelectorAll('[data-l13="margin"]').length === 2) || t; }));
  await p4.click('#l13FixDialog [data-l13="next"]', Q5).catch(() => {});
  await p4.fill('#l13FixPrinted', '20', Q5).catch(() => {});
  await p4.click('#l13FixDialog [data-l13="save"]', Q5).catch(() => {});
  await p4.waitForTimeout(400);
  await guarded('L13-2A-FIX-PAGES', async () => { const b = (await books(p4)).find(x => x.id === a0.id) || {};
    return (b.offset === 13 && b.pageMethod === 'asked' && b.pageState === 'matched' && !(await p4.$('#l13FixDialog'))) || JSON.stringify(b); });
  await guarded('L13-2A-FIX-PAGES-READER', async () => { await L4(([T, id]) => window[T].LIBPAGE13.openReader(id, 20, 'library'), a0.id);
    const rs = await p4.evaluate(T => window[T].LIBPAGE13.state().reader, T); await p4.evaluate(T => window[T].LIBPAGE13.closeReader(), T);
    return (!!rs && rs.page === 7 && rs.printed === 20) || JSON.stringify(rs); });

  // Change cover from the menu: a page from the first pages, then a picture cropped to the book's shape
  await p4.click('.l13-row[data-id="' + a0.id + '"] .l13-more', Q5).catch(() => {});
  await p4.click('#l13Cover', Q5).catch(() => {});
  await p4.waitForSelector('#l13CoverDialog .l13-th', Q5).catch(() => {});
  await guarded('L13-2A-COVER-STRIP', () => p4.evaluate(() => { const d = document.querySelector('#l13CoverDialog'); const t = d && d.textContent.replace(/\s+/g, ' ');
    const th = d ? d.querySelectorAll('.l13-th').length : 0;
    return (th === 8 && t.includes('A page from the PDF') && t.includes('A picture') && t.includes('Choose a picture') && t.includes('It is copied and kept on this device with the book.')) || JSON.stringify({th, t}); }));
  await p4.click('#l13CoverDialog .l13-th[data-page="2"]', Q5).catch(() => {});
  await p4.waitForFunction(() => { const n = document.querySelector('#l13CoverDialog [data-l13="nowtext"]'); return n && n.textContent === 'Now: PDF page 2'; }, null, Q5).catch(() => {});
  await p4.click('#l13CoverDialog [data-l13="ok"]', Q5).catch(() => {});
  await p4.waitForTimeout(500);
  await guarded('L13-2A-COVER-PAGE', async () => { const b = (await books(p4)).find(x => x.id === a0.id) || {};
    return (b.coverPage === 2 && b.coverKind === 'page' && b.coverSize > 0) || JSON.stringify(b); });
  // The picture: left half red, right half blue, 600 x 400; dragged left, the frame shows only blue
  await p4.click('.l13-row[data-id="' + a0.id + '"] .l13-more', Q5).catch(() => {});
  await p4.click('#l13Cover', Q5).catch(() => {});
  await p4.waitForSelector('#l13CoverDialog [data-l13="picturefile"]', Q5).catch(() => {});
  await p4.evaluate(async () => { const input = document.querySelector('#l13CoverDialog [data-l13="picturefile"]'); if(!input) return;
    const c = document.createElement('canvas'); c.width = 600; c.height = 400; const x = c.getContext('2d');
    x.fillStyle = 'rgb(220,30,30)'; x.fillRect(0, 0, 300, 400); x.fillStyle = 'rgb(30,40,220)'; x.fillRect(300, 0, 300, 400);
    const blob = await new Promise(r => c.toBlob(r, 'image/png')); const dt = new DataTransfer(); dt.items.add(new File([blob], 'photo.png', {type: 'image/png'}));
    input.files = dt.files; input.dispatchEvent(new Event('change')); });
  await p4.waitForFunction(() => { const i = document.querySelector('#l13CropDialog .l13-photo'); return i && i.naturalWidth > 0 && parseFloat(i.style.width) > 0; }, null, Q5).catch(() => {});
  await guarded('L13-2A-CROP-SHOWN', () => p4.evaluate(() => { const d = document.querySelector('#l13CropDialog'), f = d && d.querySelector('.l13-frame');
    const r = f && f.getBoundingClientRect(), t = d && d.innerText.replace(/\s+/g, ' ');
    return (!!r && Math.abs(r.height / r.width - 792 / 612) < 0.02 && t.includes('Drag to move, pinch to zoom. The frame is the book’s shape.')) || JSON.stringify({r, t}); }));
  const cropBox = await p4.evaluate(() => { const a = document.querySelector('#l13CropDialog .l13-crop'); if(!a) return null; const r = a.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; });
  if(cropBox){ await p4.mouse.move(cropBox.x, cropBox.y); await p4.mouse.down(); await p4.mouse.move(cropBox.x - 300, cropBox.y, {steps: 8}); await p4.mouse.up(); }
  await p4.click('#l13CropDialog [data-l13="ok"]', Q5).catch(() => {});
  await p4.waitForFunction(() => { const n = document.querySelector('#l13CoverDialog [data-l13="nowtext"]'); return n && n.textContent === 'Now: your picture'; }, null, Q5).catch(() => {});
  await p4.click('#l13CoverDialog [data-l13="ok"]', Q5).catch(() => {});
  await p4.waitForTimeout(500);
  const coverColour = id => L4(async ([T, id]) => { const blob = await window[T].LIB13.cover(id); if(!blob) return null;
    const bm = await createImageBitmap(blob), c = document.createElement('canvas'); c.width = bm.width; c.height = bm.height;
    const x = c.getContext('2d'); x.drawImage(bm, 0, 0);
    const px = [[0.1, 0.5], [0.5, 0.5], [0.9, 0.5]].map(([fx, fy]) => Array.from(x.getImageData(Math.floor(c.width * fx), Math.floor(c.height * fy), 1, 1).data.slice(0, 3)));
    return {w: c.width, h: c.height, px}; }, id);
  await guarded('L13-2A-COVER-PICTURE', async () => { const b = (await books(p4)).find(x => x.id === a0.id) || {}, c = await coverColour(a0.id);
    const blue = c && c.px.every(p => p[2] > 150 && p[0] < 90);
    return (b.coverKind === 'picture' && b.coverPage === null && !!c && c.w === 300 && Math.abs(c.h / c.w - 792 / 612) < 0.01 && blue) || JSON.stringify({b, c}); });
  await p4.reload();
  await p4.waitForFunction(T => !!window[T] && !!window[T].LIB13, T, {timeout: 20000});
  await openLibrary(p4);
  await guarded('L13-2A-COVER-PICTURE-KEPT', async () => { const c = await coverColour(a0.id), b = (await books(p4)).find(x => x.id === a0.id) || {};
    const img = await p4.waitForSelector('.l13-row[data-id="' + a0.id + '"] .l13-cover img', Q5).then(() => true, () => false);
    return (!!c && c.px.every(p => p[2] > 150) && b.coverKind === 'picture' && img) || JSON.stringify({c, img}); });

  // Change cover from Add a book: the same panel; the page chosen is the book's cover
  await p4.click('#l13Add', Q5).catch(() => {});
  await p4.setInputFiles('#l13AddDialog input[type=file]', mid).catch(() => {});
  await p4.waitForFunction(() => { const b = document.querySelector('[data-l13="add"]'); return b && !b.disabled; }, null, {timeout: 30000}).catch(() => {});
  await p4.click('[data-l13="coverchange"]', Q5).catch(() => {});
  await p4.click('#l13CoverDialog .l13-th[data-page="3"]', Q5).catch(() => {});
  await p4.waitForFunction(() => { const n = document.querySelector('#l13CoverDialog [data-l13="nowtext"]'); return n && n.textContent === 'Now: PDF page 3'; }, null, Q5).catch(() => {});
  await p4.click('#l13CoverDialog [data-l13="ok"]', Q5).catch(() => {});
  await p4.fill('#l13Name', 'E', Q5).catch(() => {});
  await p4.click('[data-l13="add"]', Q5).catch(() => {});
  await p4.waitForTimeout(800);
  await guarded('L13-2A-COVER-FROM-ADD', async () => { const b = await bookByName('E'); return (b.coverPage === 3 && b.coverKind === 'page') || JSON.stringify(b); });
  // Check now's way out names Fix page numbers
  await p4.click('#l13Add', Q5).catch(() => {});
  await p4.setInputFiles('#l13AddDialog input[type=file]', scan).catch(() => {});
  await p4.click('[data-l13="checknow"]', {timeout: 30000}).catch(() => {});
  await guarded('L13-2A-SKIP-LABEL', () => p4.evaluate(() => { const s = document.querySelector('.l13-sheet [data-l13="skip"]'); return (!!s && s.textContent === 'Skip: use Fix page numbers later') || (s && s.textContent); }));
  await p4.click('.l13-sheet [data-l13="skip"]', Q5).catch(() => {});
  await p4.click('#l13AddDialog [data-l13="cancel"]', Q5).catch(() => {});

  // Holds the next page match until released (review findings 1 and 2)
  const holdMatch = () => p4.evaluate(T => { const L = window[T].LIB13, m = L.matchPages; let release;
    window.__l13Held = new Promise(r => { release = r; }); window.__l13Release = release;
    L.matchPages = function(h){ L.matchPages = m; return window.__l13Held.then(() => m.call(L, h)); }; }, T);
  const releaseMatch = () => p4.evaluate(() => window.__l13Release && window.__l13Release());
  // Review finding 4: a zoom before the picture has loaded leaves a usable crop (red picture, red cover)
  const bB = await bookByName('B');
  await p4.click('.l13-row[data-id="' + bB.id + '"] .l13-more', Q5).catch(() => {});
  await p4.click('#l13Cover', Q5).catch(() => {});
  await p4.waitForSelector('#l13CoverDialog [data-l13="picturefile"]', Q5).catch(() => {});
  await p4.evaluate(async () => { const input = document.querySelector('#l13CoverDialog [data-l13="picturefile"]'); if(!input) return;
    const c = document.createElement('canvas'); c.width = 400; c.height = 400; const x = c.getContext('2d'); x.fillStyle = 'rgb(220,30,30)'; x.fillRect(0, 0, 400, 400);
    const blob = await new Promise(r => c.toBlob(r, 'image/png')); const dt = new DataTransfer(); dt.items.add(new File([blob], 'red.png', {type: 'image/png'}));
    input.files = dt.files; input.dispatchEvent(new Event('change'));
    const area = document.querySelector('#l13CropDialog .l13-crop');
    if(area) area.dispatchEvent(new WheelEvent('wheel', {deltaY: -300, bubbles: true, cancelable: true})); });
  await p4.waitForFunction(() => { const i = document.querySelector('#l13CropDialog .l13-photo'); return i && i.naturalWidth > 0 && parseFloat(i.style.width) > 0; }, null, Q5).catch(() => {});
  await p4.click('#l13CropDialog [data-l13="ok"]', Q5).catch(() => {});
  await p4.waitForFunction(() => { const n = document.querySelector('#l13CoverDialog [data-l13="nowtext"]'); return n && n.textContent === 'Now: your picture'; }, null, Q5).catch(() => {});
  await p4.click('#l13CoverDialog [data-l13="ok"]', Q5).catch(() => {});
  await p4.waitForTimeout(500);
  await guarded('L13-2A-CROP-EARLY-ZOOM', async () => { const c = await coverColour(bB.id);
    return (!!c && c.px.every(p => p[0] > 150 && p[1] < 90 && p[2] < 90)) || JSON.stringify(c); });
  // Review finding 5: Change beside the cover is locked while the book is saved
  await p4.click('#l13Add', Q5).catch(() => {});
  await p4.setInputFiles('#l13AddDialog input[type=file]', mid).catch(() => {});
  await p4.waitForFunction(() => { const b = document.querySelector('[data-l13="add"]'); return b && !b.disabled; }, null, {timeout: 30000}).catch(() => {});
  await p4.evaluate(T => { const L = window[T].LIB13, add = L.add; let release; window.__l13SaveHeld = new Promise(r => { release = r; }); window.__l13SaveRelease = release;
    L.add = function(info){ L.add = add; return window.__l13SaveHeld.then(() => add.call(L, info)); }; }, T);
  await p4.click('[data-l13="add"]', Q5).catch(() => {});
  await guarded('L13-2A-COVER-LOCKED-WHILE-SAVING', () => p4.evaluate(() => { const c = document.querySelector('[data-l13="coverchange"]');
    return (!!c && c.disabled && document.querySelector('[data-l13="add"]').textContent === 'Adding…') || JSON.stringify({c: c && c.disabled}); }));
  await p4.evaluate(() => window.__l13SaveRelease && window.__l13SaveRelease());
  await p4.waitForSelector('#l13AddDialog', {state: 'detached', timeout: 10000}).catch(() => {});
  await p4.click('#l13AddDialog [data-l13="cancel"]', {timeout: 1000}).catch(() => {});
  // Review finding 2: a page match finishing after Add book keeps numbers fixed meanwhile
  await holdMatch();
  await p4.click('#l13Add', Q5).catch(() => {});
  await p4.setInputFiles('#l13AddDialog input[type=file]', mid).catch(() => {});
  await p4.waitForFunction(() => { const b = document.querySelector('[data-l13="add"]'); return b && !b.disabled; }, null, {timeout: 30000}).catch(() => {});
  await p4.fill('#l13Name', 'Late', Q5).catch(() => {});
  await p4.click('[data-l13="add"]', Q5).catch(() => {});
  await p4.waitForTimeout(600);
  const late = await bookByName('Late');
  await L4(([T, id]) => id && window[T].LIB13.update(id, {offset: 7, pageState: 'matched', pageMethod: 'asked'}), late.id).catch(() => {});
  await releaseMatch();
  await p4.waitForTimeout(1500);
  await p4.click('#l13AddDialog [data-l13="cancel"]', {timeout: 1000}).catch(() => {});
  await guarded('L13-2A-LATE-MATCH-KEEPS-FIX', async () => { const b = await bookByName('Late');
    return (!!b.id && b.offset === 7 && b.pageMethod === 'asked') || JSON.stringify(b); });

  // Not in Library: the Great Clans citation is marked; Add book from it opens the printed page once added
  const clansEntry = await p4.evaluate(T => { const r = window[T].SEARCH14.query({text: '', offset: 0, limit: 5000}).results.find(x => /The Great Clans p\.\s?\d+/.test(x.source || ''));
    return r && {name: r.name, page: +r.source.match(/The Great Clans p\.\s?(\d+)/)[1]}; }, T);
  const openEntry = async (pg, n) => { await pg.evaluate(a => window[a.T].SEARCHPAGE14.open({text: a.n}), {T, n}); await pg.waitForTimeout(300);
    await pg.evaluate(n => { const b = Array.from(document.querySelectorAll('.cl11-panel[data-panel="search"] button')).find(x => x.querySelector('.s14-name') && x.querySelector('.s14-name').textContent === n); if(b) b.click(); }, n);
    await pg.waitForTimeout(400); };
  const nilCite = (pg, re) => pg.evaluate(src => { const c = Array.from(document.querySelectorAll('.l13-nil-cite')).find(x => new RegExp(src).test(x.getAttribute('aria-label') || ''));
    const t = c && c.querySelector('.l13-nil');
    return c ? {label: c.getAttribute('aria-label'), tag: t ? getComputedStyle(t, '::after').content : null, text: c.textContent} : null; }, re);
  if(clansEntry) await openEntry(p4, clansEntry.name);
  await guarded('L13-2A-NIL-MARKED', async () => { const c = await nilCite(p4, 'Great Clans p');
    return (!!clansEntry && !!c && c.tag === '"not in Library"' && /^The Great Clans p\.\s?\d+$/.test(c.text) && /^The Great Clans p\.\s?\d+, not in your Library$/.test(c.label)
      && !(await p4.$$eval('.l13-cite', cs => cs.some(c => /Great Clans/.test(c.textContent))))) || JSON.stringify({clansEntry, c}); });
  await p4.evaluate(() => { const c = Array.from(document.querySelectorAll('.l13-nil-cite')).find(x => /Great Clans/.test(x.textContent)); if(c) c.click(); });
  await guarded('L13-2A-NIL-EXPLAINS', () => p4.evaluate(p => { const a = document.querySelector('.l13-alert'); const t = a && a.innerText.replace(/\s+/g, ' ');
    return (!!t && t.includes('The Great Clans is not in your Library') && t.includes('Add the PDF of your copy, and this link opens it at p.' + p + '.')
      && a.querySelector('.l13-btn-s').textContent === 'Not now' && a.querySelector('.l13-btn-p').textContent === 'Add book') || t; }, clansEntry && clansEntry.page));
  await p4.click('.l13-alert .l13-btn-p', Q5).catch(() => {});
  await p4.waitForSelector('#l13AddDialog', Q5).catch(() => {});
  const fromLine = () => p4.evaluate(() => { const f = document.querySelector('#l13AddDialog [data-l13="from"]'); return f && !f.hidden ? f.textContent : null; });
  await guarded('L13-2A-NIL-ADD-FROM', async () => { const t = await fromLine(); return (t === 'From Search: once added, The Great Clans opens at p.' + (clansEntry && clansEntry.page) + '.') || t; });
  // A different book chosen first: the line says so
  await p4.setInputFiles('#l13AddDialog input[type=file]', wrongLabels).catch(() => {});
  await p4.waitForFunction(() => { const b = document.querySelector('[data-l13="add"]'); return b && !b.disabled; }, null, {timeout: 30000}).catch(() => {});
  await guarded('L13-2A-NIL-WRONG-BOOK', async () => { const t = await fromLine();
    return (t === 'This PDF is Unexpected Allies 2, not The Great Clans, so the link will not open it. Choose another, or add it anyway.') || t; });
  // Review finding 1: Add book tapped while the numbers are still being matched; the link waits for them
  await holdMatch();
  await p4.setInputFiles('#l13AddDialog input[type=file]', noLabels).catch(() => {});
  await p4.waitForFunction(() => { const b = document.querySelector('[data-l13="add"]'); return b && !b.disabled; }, null, {timeout: 30000}).catch(() => {});
  await p4.click('[data-l13="add"]', Q5).catch(() => {});
  await p4.waitForTimeout(600);
  await guarded('L13-2A-NIL-ADD-EARLY', async () => { const b = (await books(p4)).find(x => x.bookId === 'clans'); const reader = !!(await p4.$('#l13Reader'));
    return (!!b && b.pageState === 'matching' && !reader) || JSON.stringify({b, reader}); });
  await releaseMatch();
  await p4.waitForSelector('#l13Reader .l13-page.l13-drawn', {timeout: 30000}).catch(() => {});
  await guarded('L13-2A-NIL-ADD-OPENS', async () => { const rs = await p4.evaluate(T => window[T].LIBPAGE13.state().reader, T);
    const toastText = await p4.evaluate(() => Array.from(document.querySelectorAll('.l13-toast')).map(t => t.textContent).join('|'));
    const back = await p4.evaluate(() => { const b = document.querySelector('#l13ReaderBack'); return b && b.textContent; });
    return (!!rs && !!clansEntry && rs.from === 'search' && rs.printed === clansEntry.page && rs.page === clansEntry.page + 1 && back === '‹ Search'
      && toastText.includes('The Great Clans added to your Library')) || JSON.stringify({rs, toastText, back}); });
  await p4.click('#l13ReaderBack', Q5).catch(() => {});
  await guarded('L13-2A-NIL-RELINKED', () => p4.evaluate(() => { const l = Array.from(document.querySelectorAll('.l13-cite')).some(c => /Great Clans/.test(c.textContent));
    const n = Array.from(document.querySelectorAll('.l13-nil-cite')).some(c => /Great Clans/.test(c.textContent)); return (l && !n) || JSON.stringify({l, n}); }));
  const clans = (await books(p4)).find(b => b.bookId === 'clans') || {};

  // File missing: the stored copy gone; the shelf keeps the book; the same PDF brings it back
  const dropFile = id => !id ? Promise.resolve() : L4(async ([T, id]) => { const db = await window[T].LIB13.db(); await new Promise((res, rej) => { const tx = db.transaction('files', 'readwrite');
    tx.objectStore('files').delete(id); tx.oncomplete = res; tx.onerror = rej; }); await window[T].LIBPAGE13.render(); }, id);
  await dropFile(a0.id);
  await openLibrary(p4);
  await guarded('L13-2A-MISSING-SHOWN', () => p4.evaluate(id => { const r = document.querySelector('.l13-row[data-id="' + id + '"]'); const t = r && r.innerText.replace(/\s+/g, ' ');
    return (!!r && t.includes('My Margin Book') && t.includes('File missing') && t.includes('Add the file again') && !!r.querySelector('.l13-cover.l13-gone img')) || t; }, a0.id));
  await p4.click('.l13-row[data-id="' + a0.id + '"] .l13-title', Q5).catch(() => {});
  await p4.waitForSelector('.l13-alert', Q5).catch(() => {});
  await guarded('L13-2A-MISSING-EXPLAINS', () => p4.evaluate(() => { const a = document.querySelector('.l13-alert'); const t = a && a.innerText.replace(/\s+/g, ' ');
    return (!!t && t.includes('My Margin Book’s file is missing') && t.includes('Its name, cover, recognised book and page fix are kept: choose the same PDF to read it again.')
      && a.querySelector('.l13-btn-p').textContent === 'Add the file again') || t; }));
  await p4.click('.l13-alert .l13-btn-s', Q5).catch(() => {});
  // A different book: named before it is used; Cancel keeps the book missing
  await p4.setInputFiles('#l13RefileFile', wrongLabels).catch(() => {});
  await p4.waitForSelector('.l13-alert', {timeout: 20000}).catch(() => {});
  await guarded('L13-2A-MISSING-DIFFERENT', async () => { const t = await p4.evaluate(() => { const a = document.querySelector('.l13-alert'); return a && a.innerText.replace(/\s+/g, ' '); });
    await p4.click('.l13-alert .l13-btn-s', Q5).catch(() => {}); await p4.waitForTimeout(300);
    const still = await L4(async ([T, id]) => (await window[T].LIB13.missing()).includes(id), a0.id);
    return (!!t && t.includes('This PDF is a different book') && t.includes('It has 84 pages; the copy that was here had 30.') && still) || JSON.stringify({t, still}); });
  await p4.setInputFiles('#l13RefileFile', mid).catch(() => {});
  await p4.waitForFunction(id => { const r = document.querySelector('.l13-row[data-id="' + id + '"]'); return r && !r.classList.contains('l13-row-gone'); }, a0.id, {timeout: 20000}).catch(() => {});
  await guarded('L13-2A-MISSING-BACK', async () => { const b = (await books(p4)).find(x => x.id === a0.id) || {};
    const gone = await L4(async ([T, id]) => (await window[T].LIB13.missing()).includes(id), a0.id);
    const toastText = await p4.evaluate(() => Array.from(document.querySelectorAll('.l13-toast')).map(t => t.textContent).join('|'));
    return (!gone && b.name === 'My Margin Book' && b.offset === 13 && b.coverKind === 'picture' && b.pageMethod === 'asked' && toastText.includes('My Margin Book is back on your shelf'))
      || JSON.stringify({gone, b, toastText}); });
  // A stored copy that cannot be read is found when opened
  await guarded('L13-2A-MISSING-UNREADABLE', async () => { const out = await L4(async ([T, id]) => { const L = window[T].LIB13, file = L.file;
      L.file = async function(x){ return x === id ? { size: 10, slice: () => ({ arrayBuffer: () => Promise.reject(new DOMException('gone', 'NotReadableError')) }) } : file.call(L, x); };
      try { const opened = await window[T].LIBPAGE13.openReader(id, null, 'library'); await new Promise(r => setTimeout(r, 400));
        const a = document.querySelector('.l13-alert'); return {opened, reader: !!document.querySelector('#l13Reader'), alert: a && a.innerText, missing: (await L.missing()).includes(id)};
      } finally { L.file = file; } }, a0.id);
    await p4.click('.l13-alert .l13-btn-s', Q5).catch(() => {});
    return (out.opened === false && !out.reader && /file is missing/.test(out.alert || '') && out.missing) || JSON.stringify(out); });
  // Review finding 6: once the stored copy reads again, the book is no longer missing
  await guarded('L13-2A-MISSING-RECHECKED', async () => { const gone = await L4(async ([T, id]) => (await window[T].LIB13.missing()).includes(id), a0.id);
    const b = (await books(p4)).find(x => x.id === a0.id) || {}; return (!gone && b.fileMissing === false) || JSON.stringify({gone, flag: b.fileMissing}); });
  // Review finding 3: the same file (same size) comes back as the same book, whatever recognition says
  await p4.evaluate(() => { if(!document.querySelector('#l13Probe4')){ const i = document.createElement('input'); i.type = 'file'; i.id = 'l13Probe4'; i.multiple = true; i.hidden = true; document.body.appendChild(i); } });
  await p4.setInputFiles('#l13Probe4', [wrongLabels]);
  const copy = await L4(async ([T]) => window[T].LIB13.add({file: document.querySelector('#l13Probe4').files[0], name: 'Clans copy', bookId: 'clans', pages: 84,
    offset: 2, pageState: 'matched', pageMethod: 'asked'}));
  await dropFile(copy && copy.id);
  await L4(([T, id]) => window[T].LIB13.get(id).then(b => { window[T].LIBPAGE13.explainMissing(b); }), copy && copy.id).catch(() => {});
  await p4.waitForSelector('.l13-alert', Q5).catch(() => {});
  await p4.click('.l13-alert .l13-btn-s', Q5).catch(() => {});
  await p4.setInputFiles('#l13RefileFile', wrongLabels).catch(() => {});
  await p4.waitForTimeout(2500);
  await guarded('L13-2A-REFILE-SAME-FILE', async () => { const b = (await books(p4)).find(x => x.id === (copy && copy.id)) || {};
    const asked = await p4.evaluate(() => { const a = document.querySelector('.l13-alert'); return a && a.innerText; });
    const gone = await L4(async ([T, id]) => (await window[T].LIB13.missing()).includes(id), copy && copy.id);
    return (!asked && !gone && b.bookId === 'clans' && b.offset === 2 && b.pageMethod === 'asked') || JSON.stringify({asked, gone, b}); });
  await p4.click('.l13-alert .l13-btn-s', {timeout: 1000}).catch(() => {});
  await L4(([T, id]) => id && window[T].LIB13.remove(id).then(() => window[T].LIBPAGE13.render()), copy && copy.id).catch(() => {});
  // A Search link to a book whose file is missing explains instead of opening
  await dropFile(clans.id);
  if(clansEntry) await openEntry(p4, clansEntry.name);
  await p4.evaluate(() => { const c = Array.from(document.querySelectorAll('.l13-cite')).find(x => /Great Clans/.test(x.textContent)); if(c) c.click(); });
  await p4.waitForTimeout(300);
  await guarded('L13-2A-MISSING-LINK', () => p4.evaluate(() => { const a = document.querySelector('.l13-alert'); const t = a && a.innerText.replace(/\s+/g, ' ');
    return (!!t && t.includes('The Great Clans’s file is missing') && !document.querySelector('#l13Reader')) || t; }));
  await p4.click('.l13-alert .l13-btn-s', Q5).catch(() => {});

  // Delete names "not in Library" for a known book (not for another book); afterwards its citations are marked again
  await openLibrary(p4);
  const deleteText = id => p4.evaluate(async ([T, id]) => { const b = (await window[T].LIB13.list()).find(x => x.id === id); const P = window[T].LIBPAGE13;
    if(!b) return null;
    const done = P.confirmDelete(b); await new Promise(r => setTimeout(r, 100)); const a = document.querySelector('.l13-alert');
    return a && a.innerText.replace(/\s+/g, ' '); }, [T, id]);
  await guarded('L13-2A-DELETE-NIL-SENTENCE', async () => { const known = await deleteText(clans.id); await p4.click('.l13-alert .l13-btn-s', Q5).catch(() => {});
    const other = await deleteText(a0.id); await p4.click('.l13-alert .l13-btn-s', Q5).catch(() => {});
    const s = 'Search’s links to it show “not in Library” until you add it again.';
    return (!!known && known.includes('Delete The Great Clans?') && known.includes('This removes the book and its cover from this device. ' + s) && !!other && !other.includes(s))
      || JSON.stringify({known, other}); });
  await deleteText(clans.id).catch(() => {});
  await p4.click('.l13-alert .l13-btn-p', Q5).catch(() => {});
  await p4.waitForTimeout(500);
  if(clansEntry) await openEntry(p4, clansEntry.name);
  await guarded('L13-2A-DELETED-NIL', async () => { const c = await nilCite(p4, 'Great Clans p');
    return (!!c && !(await p4.$$eval('.l13-cite', cs => cs.some(c => /Great Clans/.test(c.textContent))))) || JSON.stringify(c); });

  // Imperial Histories with no volume: the pages checked in the owner's PDFs link to volume 1; others stay plain
  await guarded('L13-2A-IH-CITATIONS', () => p4.evaluate(T => { const c = window[T].LIB13.citations('Imperial Histories p.240; Imperial Histories p.50; Imperial Histories 2 p.197; Imperial Histories pp.276–277; Imperial Histories 1 p.12');
    const got = c.map(x => x.bookId + ':' + x.page).join(','); return got === 'ih1:240,ih2:197,ih1:12' || got; }, T));
  const anach = await p4.evaluate(T => { const r = window[T].SEARCH14.query({text: 'Anachronism', offset: 0, limit: 50}).results.find(x => x.name === 'Anachronism'); return r && r.source; }, T);
  await openEntry(p4, 'Anachronism');
  await guarded('L13-2A-IH-SEARCH', async () => { const c = await nilCite(p4, '^Imperial Histories p\\.240');
    return (/Imperial Histories p\.240/.test(anach || '') && !!c && c.label === 'Imperial Histories p.240, not in your Library') || JSON.stringify({anach, c}); });

  await guarded('L13-2A-SAVES-UNTOUCHED', async () => (await saves4()) === saveBefore4 || 'character saves changed');
  // Phones: nothing scrolls sideways at 320 (grid, the menu, Change cover, the crop)
  await p4.setViewportSize({width: 320, height: 700});
  await openLibrary(p4);
  await p4.click('#l13View [data-view="grid"]', Q5).catch(() => {});
  await p4.waitForSelector('.l13-shelves', Q5).catch(() => {});
  const wide4 = async () => p4.evaluate(() => [document.scrollingElement].concat(Array.from(document.querySelectorAll('.l13-root,.l13-dialog,.l13-act,.l13-alert,.l13-thumbs')))
    .filter(e => e && !e.classList.contains('l13-thumbs')).every(e => e.scrollWidth <= e.clientWidth + 1));
  const layout320 = [await wide4()];
  await p4.click('.l13-more-c', Q5).catch(() => {});
  layout320.push(await wide4());
  await p4.click('#l13Cover', Q5).catch(() => {});
  await p4.waitForSelector('#l13CoverDialog', Q5).catch(() => {});
  layout320.push(await wide4());
  await p4.click('#l13CoverDialog [data-l13="cancel"]', Q5).catch(() => {});
  await guarded('L13-2A-LAYOUT-320', async () => (layout320.every(Boolean) && (await p4.$('.l13-shelves')) !== null) || JSON.stringify(layout320));
  await p4.click('#l13View [data-view="list"]', Q5).catch(() => {});

  // Desktop: six covers a shelf, the ⋯ menu beside its button, windows, the crop's slider and wheel
  const s5 = await openSheet(browser, sheet, {viewport: {width: 1280, height: 800}});
  const p5 = s5.page;
  await openLibrary(p5);
  await p5.evaluate(() => { const i = document.createElement('input'); i.type = 'file'; i.id = 'l13Probe5'; i.hidden = true; document.body.appendChild(i); });
  await p5.setInputFiles('#l13Probe5', mid);
  await p5.evaluate(async T => { const L = window[T].LIB13, f = document.querySelector('#l13Probe5').files[0];
    for(const n of ['A', 'B', 'C', 'D', 'E', 'F', 'G']){ await L.add({file: f, name: n, pages: 30, offset: -1, pageState: 'matched', pageMethod: 'printed'}); await new Promise(r => setTimeout(r, 5)); }
    await window[T].LIBPAGE13.render(); }, T);
  await p5.click('#l13View [data-view="grid"]', Q5).catch(() => {});
  await p5.waitForSelector('.l13-shelves', Q5).catch(() => {});
  await guarded('L13-2A-DESKTOP-GRID', () => p5.evaluate(() => { const per = Array.from(document.querySelectorAll('.l13-shelfrow')).map(r => r.querySelectorAll('.l13-cvw').length);
    const hover = matchMedia('(hover: hover)').matches; return (hover && per.join() === '6,1') || JSON.stringify({per, hover}); }));
  await p5.click('.l13-more-c', Q5).catch(() => {});
  await guarded('L13-2A-DESKTOP-MENU-BESIDE', () => p5.evaluate(() => { const pop = document.querySelector('.l13-pop'), btn = document.querySelector('.l13-more-c');
    if(!pop) return 'no popover: ' + !!document.querySelector('.l13-act'); const p = pop.getBoundingClientRect(), b = btn.getBoundingClientRect();
    const items = Array.from(pop.querySelectorAll('[role=menuitem]')).length;
    return (p.left >= b.right - 1 && Math.abs(p.top - b.top) < 2 && p.right <= innerWidth && p.bottom <= innerHeight && items === 4 && !document.querySelector('.l13-act')) || JSON.stringify({p, b, items}); }));
  await p5.click('#l13FixPages', Q5).catch(() => {});
  await p5.waitForSelector('#l13FixDialog', Q5).catch(() => {});
  await guarded('L13-2A-DESKTOP-WINDOW', () => p5.evaluate(() => { const d = document.querySelector('#l13FixDialog'); if(!d) return 'no window';
    const r = d.getBoundingClientRect(); return (r.width <= 600 && Math.abs((r.left + r.right) / 2 - innerWidth / 2) < 2 && r.top > 0) || JSON.stringify(r); }));
  await p5.click('#l13FixDialog [data-l13="cancel"]', Q5).catch(() => {});
  await p5.click('.l13-more-c', Q5).catch(() => {});
  await p5.click('#l13Cover', Q5).catch(() => {});
  await p5.waitForSelector('#l13CoverDialog [data-l13="picturefile"]', Q5).catch(() => {});
  await p5.evaluate(async () => { const input = document.querySelector('#l13CoverDialog [data-l13="picturefile"]'); if(!input) return;
    const c = document.createElement('canvas'); c.width = 600; c.height = 400; c.getContext('2d').fillRect(0, 0, 600, 400);
    const blob = await new Promise(r => c.toBlob(r, 'image/png')); const dt = new DataTransfer(); dt.items.add(new File([blob], 'p.png', {type: 'image/png'}));
    input.files = dt.files; input.dispatchEvent(new Event('change')); });
  await p5.waitForFunction(() => { const i = document.querySelector('#l13CropDialog .l13-photo'); return i && parseFloat(i.style.width) > 0; }, null, Q5).catch(() => {});
  await guarded('L13-2A-DESKTOP-CROP-ZOOM', async () => { const w0 = await p5.evaluate(() => parseFloat(document.querySelector('#l13CropDialog .l13-photo').style.width));
    const a = await p5.evaluate(() => { const r = document.querySelector('#l13CropDialog .l13-crop').getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; });
    await p5.mouse.move(a.x, a.y); await p5.mouse.wheel(0, -400); await p5.waitForTimeout(200);
    const o = await p5.evaluate(() => ({w: parseFloat(document.querySelector('#l13CropDialog .l13-photo').style.width), z: document.querySelector('#l13Zoom') && +document.querySelector('#l13Zoom').value,
      hint: document.querySelector('#l13CropDialog').innerText.includes('zoom with the slider or the mouse wheel')}));
    return (o.w > w0 * 1.5 && o.z > 0 && o.hint) || JSON.stringify({w0, o}); });
  await p5.click('#l13CropDialog [data-l13="cancel"]', Q5).catch(() => {});
  await p5.click('#l13CoverDialog [data-l13="cancel"]', Q5).catch(() => {});
  check('L13-2A-CLEAN', !s4.seen.errors.length && !s5.seen.errors.length && !s4.seen.requests.length && !s5.seen.requests.length,
    JSON.stringify([s4.seen, s5.seen]).slice(0, 300));
  await s4.ctx.close();
  await s5.ctx.close();

  // ---- Release 2b: Chapters, Search in book, the desktop reader ----
  // Every check guarded. The fixture's bookmarks (PDF pages; printed = PDF page - 2): Part One@3 > Chapter A@3 >
  // Section A1@4, Section A2@6 > Deep D@7 (a fourth level); Chapter B@9; Part Two@20 > Chapter C@21 > Section C1@22.
  // "lantern" is printed on PDF pages 6, 22 ("Another LANTERN here") and 30 ("Hida’s three lanterns": the PDF's quote is curly);
  // every page prints "Placeholder text".
  const s6 = await openSheet(browser, sheet, {viewport: {width: 390, height: 844}, deviceScaleFactor: 2});
  const p6 = s6.page;
  const saves6 = () => p6.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)])));
  const saveBefore6 = await saves6();
  // The fixtures added straight to the shelf (no covers): [chapters, no bookmarks, dead bookmarks, a lone top bookmark]
  const shelve = async (pg, id) => {
    await openLibrary(pg);
    await pg.evaluate(id => { const i = document.createElement('input'); i.type = 'file'; i.id = id; i.multiple = true; i.hidden = true; document.body.appendChild(i); }, id);
    await pg.setInputFiles('#' + id, [chap, mid, dead, wrapped]);
    return pg.evaluate(async ([T, id]) => { const L = window[T].LIB13, f = document.querySelector('#' + id).files, out = [];
      for(const [k, name, pages, offset] of [[0, 'Chapter Book', 40, -2], [1, 'Margin Book', 30, -1], [2, 'Dead Marks', 20, -1], [3, 'Wrapped', 20, -1]])
      { out.push((await L.add({file: f[k], name: name, pages: pages, offset: offset, pageState: 'matched', pageMethod: 'printed'})).id); await new Promise(r => setTimeout(r, 5)); }
      await window[T].LIBPAGE13.render(); return out; }, [T, id]);
  };
  const ids6 = await shelve(p6, 'l13Probe6');
  const open6 = async (pg, id, printed, from) => {
    await pg.evaluate(([T, id, printed, from]) => window[T].LIBPAGE13.openReader(id, printed, from), [T, id, printed, from]);
    await pg.waitForSelector('#l13Reader .l13-page.l13-drawn', {timeout: 20000}).catch(() => {});
    await pg.waitForFunction(() => { const c = document.querySelector('#l13Chapters'); return c && !/Reading the (bookmarks|chapters)/.test(c.textContent); }, null, Q5).catch(() => {});
  };
  const rstate = pg => pg.evaluate(T => window[T].LIBPAGE13.state().reader, T);
  const tocRows = pg => pg.evaluate(() => Array.from(document.querySelectorAll('#l13Chapters .l13-tocrow')).map(r => {
    const tw = r.querySelector('.l13-tw');
    return {level: +((r.className.match(/l13-l(\d)/) || [])[1] || 0), title: (r.querySelector('.l13-t') || {}).textContent, page: (r.querySelector('.l13-p') || {}).textContent,
      cur: r.classList.contains('l13-cur') && !!r.querySelector('[aria-current="true"]'), open: tw ? tw.getAttribute('aria-expanded') : null}; }));
  const rowNamed = (rows, t) => rows.find(r => r.title === t) || {};
  const clickRow = (pg, t, part) => pg.evaluate(([t, part]) => { const r = Array.from(document.querySelectorAll('#l13Chapters .l13-tocrow')).find(x => (x.querySelector('.l13-t') || {}).textContent === t);
    const b = r && r.querySelector(part); if(b) b.click(); return !!b; }, [t, part]);
  const findStatus = pg => pg.waitForFunction(() => { const s = document.querySelector('#l13FindStatus'); return s && /^(Found on|Not found|[\d,]+ match)/.test(s.textContent); }, null, Q5)
    .then(() => pg.evaluate(() => document.querySelector('#l13FindStatus').textContent), () => 'no status');
  // The pages a search found, from Release 2b's "Found on N pages" or Release 2c's "M matches on N pages" (2c checks the wording)
  const onPages = s => { const m = /^(?:Found on|[\d,]+ match(?:es)? on) (\d+) pages?$/.exec(s); return m ? +m[1] : s; };
  const resultTexts = pg => pg.evaluate(() => Array.from(document.querySelectorAll('.l13-res .l13-resgo')).map(b => ({pp: (b.querySelector('.l13-pp') || {}).textContent,
    mark: (b.querySelector('mark') || {}).textContent, sn: (b.querySelector('.l13-sn') || {}).textContent, current: b.getAttribute('aria-current') === 'true'})));
  const sideways = pg => pg.evaluate(() => Array.from(document.querySelectorAll('.l13-reader,.l13-rbody,.l13-rbar,.l13-side,.l13-sidebody,.l13-rhead'))
    .filter(e => e.getClientRects().length > 0 || e.classList.contains('l13-reader')).every(e => e.scrollWidth <= e.clientWidth + 1));
  // The marked word against the page's own ink: on PDF page 22's title line ("Another LANTERN here") the dark columns form
  // three words; the mark covers the second and neither of the others.
  const MARKED = `(slot) => {
    const c = slot && slot.querySelector('canvas'), hit = slot && slot.querySelector('.l13-hit');
    if(!c || !c.width || !hit) return 'no canvas or mark';
    const W = c.width, H = c.height, d = c.getContext('2d').getImageData(0, 0, W, H).data, cols = [];
    for(let x = 0; x < W; x++){ let dark = false;
      for(let y = Math.floor(H * 0.05); y < Math.ceil(H * 0.11) && !dark; y++){ const i = (y * W + x) * 4; if(d[i] + d[i + 1] + d[i + 2] < 300) dark = true; }
      cols.push(dark); }
    const gap = Math.max(2, Math.round(W * 0.0075)), words = [];
    let start = -1, last = -1;
    cols.forEach((on, x) => { if(!on) return; if(start < 0 || x - last > gap){ if(start >= 0) words.push([start, last]); start = x; } last = x; });
    if(start >= 0) words.push([start, last]);
    const sr = slot.getBoundingClientRect(), hr = hit.getBoundingClientRect(), tol = W * 0.006;
    const hx0 = (hr.left - sr.left) / sr.width * W, hx1 = (hr.right - sr.left) / sr.width * W;
    const inside = w => w[0] >= hx0 - tol && w[1] <= hx1 + tol, outside = w => w[1] < hx0 + tol || w[0] > hx1 - tol;
    return (words.length === 3 && inside(words[1]) && outside(words[0]) && outside(words[2])) || JSON.stringify({words, hx0, hx1, W});
  }`;

  // Phones: the bar, then Chapters as a sheet over the pages
  await open6(p6, ids6[0], 5, 'library');
  await guarded('L13-2B-BAR', () => p6.evaluate(() => { const bar = document.querySelector('.l13-rbar'); if(!bar) return 'no bar';
    const kids = Array.from(bar.children).filter(k => k.getClientRects().length > 0).map(k => k.id === 'l13BarChapters' ? 'Chapters' : k.id === 'l13BarSearch' ? 'Search' : k.querySelector('#l13Jump') ? 'Page' : k.tagName);
    const head = document.querySelector('#l13HeadChapters'); return (kids.join() === 'Chapters,Page,Search' && (!head || head.getClientRects().length === 0)) || kids.join(); }));
  await p6.click('#l13BarChapters', Q5).catch(() => {});
  await guarded('L13-2B-SHEET-FOCUS', () => p6.evaluate(() => { const s = document.querySelector('#l13Side'), a = document.activeElement;
    return (!!s && s.contains(a)) || (a && (a.id || a.className || a.tagName)); }));
  await guarded('L13-2B-CHAPTERS-SHEET', () => p6.evaluate(() => { const s = document.querySelector('#l13Side'), scrim = document.querySelector('.l13-rscrim');
    if(!s || s.getClientRects().length === 0) return 'no sheet'; const r = s.getBoundingClientRect(), tabs = Array.from(s.querySelectorAll('[role=tab]')).map(t => t.textContent + ':' + t.getAttribute('aria-selected'));
    return (s.getAttribute('role') === 'dialog' && s.getAttribute('aria-modal') === 'true' && Math.abs(r.top - 110) < 2 && r.bottom >= innerHeight - 1 && !!scrim && scrim.getClientRects().length > 0
      && tabs.join() === 'Chapters:true,Search in book:false' && !!s.querySelector('[aria-label="Close"]')) || JSON.stringify({role: s.getAttribute('role'), r, tabs}); }));
  let rows6 = await tocRows(p6);
  await guarded('L13-2B-CHAPTERS-LEVELS', () => { const got = rows6.map(r => r.level + ' ' + r.title).join(' | ');
    return got === '1 Part One | 2 Chapter A | 3 Section A1 | 3 Section A2 | 2 Chapter B | 1 Part Two' || got; });
  await guarded('L13-2B-CHAPTERS-CURRENT', () => { const cur = rows6.filter(r => r.cur).map(r => r.title);
    return (cur.join() === 'Section A2' && rowNamed(rows6, 'Part One').open === 'true' && rowNamed(rows6, 'Chapter A').open === 'true' && rowNamed(rows6, 'Part Two').open === 'false')
      || JSON.stringify(rows6); });
  await guarded('L13-2B-CHAPTERS-PRINTED', () => { const got = rows6.map(r => r.page).join(); return got === 'p.1,p.1,p.2,p.4,p.7,p.18' || got; });
  await guarded('L13-2B-CHAPTERS-HINT', () => p6.evaluate(() => { const c = document.querySelector('#l13Chapters'); const t = c && c.innerText.replace(/\s+/g, ' ');
    return /From the PDF’s own bookmarks\. (Tap|Click) a title to go there; the arrow opens or closes a level\./.test(t || '') || t; }));
  // The arrow opens a level without leaving the page; the title goes there and closes the sheet
  await clickRow(p6, 'Part Two', '.l13-tw');
  const opened = await tocRows(p6), stay = await rstate(p6);
  await clickRow(p6, 'Part Two', '.l13-tw');
  const closed = await tocRows(p6);
  await guarded('L13-2B-CHAPTERS-TOGGLE', () => (opened.some(r => r.title === 'Chapter C' && r.level === 2) && !closed.some(r => r.title === 'Chapter C') && !!stay && stay.page === 7)
    || JSON.stringify({opened: opened.map(r => r.title), closed: closed.map(r => r.title), stay}));
  await clickRow(p6, 'Part Two', '.l13-tw');
  await clickRow(p6, 'Chapter C', '.l13-tocgo');
  await p6.waitForTimeout(300);
  await guarded('L13-2B-CHAPTERS-GO', async () => { const r = await rstate(p6); return (!!r && r.page === 21 && r.panel === null
    && await p6.evaluate(() => { const s = document.querySelector('#l13Side'); return !!s && s.getClientRects().length === 0; })) || JSON.stringify(r); });
  // The highlight follows the page being read
  await p6.fill('#l13Jump', '20', Q5).catch(() => {});
  await p6.click('.l13-jump button', Q5).catch(() => {});
  await p6.waitForTimeout(300);
  await p6.click('#l13BarChapters', Q5).catch(() => {});
  await guarded('L13-2B-CHAPTERS-FOLLOWS', async () => { const rows = await tocRows(p6); const cur = rows.filter(r => r.cur).map(r => r.title);
    return (cur.join() === 'Section C1' && rowNamed(rows, 'Chapter C').open === 'true') || JSON.stringify(rows); });
  // Escape closes the sheet first, not the book
  await p6.keyboard.press('Escape');
  await guarded('L13-2B-ESCAPE-CLOSES-SHEET', async () => { const r = await rstate(p6); return (!!r && r.panel === null) || JSON.stringify(r); });
  // Search in book: printed pages, the section, the word marked in the line; the page opened with the word marked
  await p6.click('#l13BarSearch', Q5).catch(() => {});
  await guarded('L13-2B-SEARCH-TAB', () => p6.evaluate(() => { const i = document.querySelector('#l13Find'), l = document.querySelector('label[for="l13Find"]');
    const tab = document.querySelector('#l13TabSearch'); return (!!i && document.activeElement === i && !!l && l.textContent === 'Find in Chapter Book' && tab.getAttribute('aria-selected') === 'true') || (l && l.textContent); }));
  await p6.fill('#l13Find', 'lantern', Q5).catch(() => {});
  await p6.press('#l13Find', 'Enter', Q5).catch(() => {});
  const status6 = await findStatus(p6), found6 = await resultTexts(p6);
  await guarded('L13-2B-SEARCH-RESULTS', () => { const pp = found6.map(r => r.pp).join(' | ');
    return (onPages(status6) === 3 && pp === 'p.4 · Section A2 | p.20 · Section C1 | p.28 · Section C1') || status6 + ' ' + pp; });
  await guarded('L13-2B-SEARCH-SNIPPET', () => { const r = found6[1] || {};
    return (r.mark === 'LANTERN' && /^Another LANTERN here/.test(r.sn || '') && found6[2] && found6[2].mark === 'lantern' && /lanterns lit/.test(found6[2].sn)) || JSON.stringify(found6); });
  await guarded('L13-2B-SEARCH-HINT', () => p6.evaluate(() => /Printed page numbers\. (Tap|Click) a result to open that page with the word marked\./.test(document.querySelector('#l13FindPanel').innerText.replace(/\s+/g, ' '))));
  await p6.focus('#l13Find', Q5).catch(() => {});
  await p6.keyboard.press('Escape');
  await p6.waitForTimeout(600);
  const escaped = await rstate(p6);
  await p6.click('#l13BarSearch', Q5).catch(() => {});
  await guarded('L13-2B-ESCAPE-KEEPS-SEARCH', async () => { const v = await p6.evaluate(() => document.querySelector('#l13Find') && document.querySelector('#l13Find').value), n = (await resultTexts(p6)).length;
    return (!!escaped && escaped.panel === null && v === 'lantern' && n === 3) || JSON.stringify({escaped, v, n}); });
  await p6.click('.l13-resgo >> nth=1', Q5).catch(() => {});
  await p6.waitForSelector('.l13-page[data-page="22"].l13-drawn .l13-hit', Q5).catch(() => {});
  await p6.waitForTimeout(400);
  await guarded('L13-2B-SEARCH-OPENS-MARKED', async () => { const r = await rstate(p6); const marked = await p6.evaluate(`(${MARKED})(document.querySelector('.l13-page[data-page="22"]'))`);
    return (!!r && r.page === 22 && r.panel === null && marked === true) || JSON.stringify({r, marked}); });
  await guarded('L13-2B-SEARCH-MARK-IN-VIEW', () => p6.evaluate(() => { const h = document.querySelector('.l13-hit'), b = document.querySelector('.l13-rbody');
    if(!h) return 'no mark'; const hr = h.getBoundingClientRect(), br = b.getBoundingClientRect(); return (hr.top >= br.top && hr.bottom <= br.bottom) || JSON.stringify({hr, br}); }));
  // Any case, any spacing, every page; a word that is not there
  await p6.click('#l13BarSearch', Q5).catch(() => {});
  await p6.fill('#l13Find', 'PLACEHOLDER   text', Q5).catch(() => {});
  await p6.press('#l13Find', 'Enter', Q5).catch(() => {});
  await guarded('L13-2B-SEARCH-EVERY-PAGE', async () => { const s = await findStatus(p6), n = (await resultTexts(p6)).length; return (onPages(s) === 40 && n === 40) || s + ' ' + n; });
  await p6.fill('#l13Find', 'zzqx', Q5).catch(() => {});
  await p6.press('#l13Find', 'Enter', Q5).catch(() => {});
  await guarded('L13-2B-SEARCH-NONE', async () => { const s = await findStatus(p6), n = (await resultTexts(p6)).length; return (s === 'Not found in this book' && n === 0) || s + ' ' + n; });
  await p6.fill('#l13Find', "HIDA'S", Q5).catch(() => {});
  await p6.press('#l13Find', 'Enter', Q5).catch(() => {});
  await guarded('L13-2B-SEARCH-QUOTES', async () => { const s = await findStatus(p6), r = await resultTexts(p6);
    return (onPages(s) === 1 && r.length === 1 && r[0].pp === 'p.28 · Section C1' && r[0].mark === 'Hida’s') || s + ' ' + JSON.stringify(r); });
  // Phones at 320: the bar, the sheet and its results fit
  await p6.setViewportSize({width: 320, height: 700});
  await p6.fill('#l13Find', 'lantern', Q5).catch(() => {});
  await p6.press('#l13Find', 'Enter', Q5).catch(() => {});
  await findStatus(p6);
  const narrowSearch = await sideways(p6);
  await p6.click('#l13TabChapters', Q5).catch(() => {});
  const narrowChapters = await sideways(p6);
  await p6.keyboard.press('Escape');
  const narrowBar = await sideways(p6);
  await guarded('L13-2B-LAYOUT-320', async () => (narrowSearch && narrowChapters && narrowBar && !!(await p6.$('#l13Side'))) || JSON.stringify([narrowSearch, narrowChapters, narrowBar]));
  await p6.setViewportSize({width: 390, height: 844});
  await p6.evaluate(T => window[T].LIBPAGE13.closeReader(), T);
  // A PDF without bookmarks says so and offers Search in book; bookmarks that lead nowhere are named as such
  await open6(p6, ids6[1], 5, 'library');
  await p6.click('#l13BarChapters', Q5).catch(() => {});
  await guarded('L13-2B-NO-BOOKMARKS', async () => { const t = await p6.evaluate(() => { const c = document.querySelector('#l13Chapters'); return c && c.innerText.replace(/\s+/g, ' '); });
    await p6.click('#l13Chapters [data-l13="tosearch"]', Q5).catch(() => {});
    const tab = await p6.evaluate(() => { const t = document.querySelector('#l13TabSearch'); return t && t.getAttribute('aria-selected'); });
    return (/This PDF has no bookmarks, so there are no chapters to show\./.test(t || '') && tab === 'true') || JSON.stringify({t, tab}); });
  await p6.evaluate(T => window[T].LIBPAGE13.closeReader(), T);
  await open6(p6, ids6[2], 5, 'library');
  await p6.click('#l13BarChapters', Q5).catch(() => {});
  await guarded('L13-2B-BOOKMARKS-UNLINKED', () => p6.evaluate(() => { const c = document.querySelector('#l13Chapters'); const t = c && c.innerText.replace(/\s+/g, ' ');
    return /This PDF’s bookmarks do not lead to its pages, so there are no chapters to show\./.test(t || '') || t; }));
  await p6.evaluate(T => window[T].LIBPAGE13.closeReader(), T);
  // A lone top bookmark (the book's own title) is skipped; three levels below it are shown, the fourth is not
  await open6(p6, ids6[3], 5, 'library');
  await p6.click('#l13BarChapters', Q5).catch(() => {});
  await guarded('L13-2B-SPOT-ORDER', () => p6.evaluate(T => { const L = window[T].LIB13; if(!L.spot) return 'no spot';
    const tree = [{title: 'A', page: 1, kids: []}, {title: 'B', page: 10, kids: [{title: 'B1', page: 12, kids: []}]}, {title: 'Sidebar', page: 5, kids: []}];
    const at = n => L.spot(tree, n).map(b => b.title).join('>'); return (at(20) === 'B>B1' && at(7) === 'Sidebar' && at(11) === 'B') || [at(20), at(7), at(11)].join(); }, T));
  await guarded('L13-2B-LONE-TOP-SKIPPED', async () => { const got = (await tocRows(p6)).map(r => r.level + ' ' + r.title).join(' | ');
    return got === '1 Part A | 2 Ch A1 | 3 Sec A1a | 1 Part B' || got; });
  await p6.evaluate(T => window[T].LIBPAGE13.closeReader(), T);
  await guarded('L13-2B-SAVES-UNTOUCHED', async () => (await saves6()) === saveBefore6 || 'character saves changed');

  // Desktop: the page jump at the top, Chapters and Search in book in a panel beside the pages that stays open
  const s7 = await openSheet(browser, sheet, {viewport: {width: 1280, height: 800}});
  const p7 = s7.page;
  const ids7 = await shelve(p7, 'l13Probe7');
  await open6(p7, ids7[0], 5, 'library');
  await guarded('L13-2B-DESKTOP-SIDE', () => p7.evaluate(() => { const s = document.querySelector('#l13Side'), b = document.querySelector('.l13-rbody'), h = document.querySelector('.l13-rhead');
    if(!s || s.getClientRects().length === 0) return 'no panel'; const sr = s.getBoundingClientRect(), br = b.getBoundingClientRect(), hr = h.getBoundingClientRect();
    const bar = document.querySelector('.l13-rbar'), scrim = document.querySelector('.l13-rscrim'), cur = document.querySelector('#l13Chapters .l13-cur .l13-t');
    return (sr.left === 0 && Math.abs(sr.width - 340) < 1 && sr.top >= hr.bottom - 1 && br.left >= sr.right - 1 && s.getAttribute('aria-modal') === null
      && (!scrim || scrim.getClientRects().length === 0) && (!bar || bar.getClientRects().length === 0) && !!h.querySelector('#l13Jump') && !!cur && cur.textContent === 'Section A2')
      || JSON.stringify({sr, br, hr, modal: s.getAttribute('aria-modal'), cur: cur && cur.textContent}); }));
  const pageBox = () => p7.evaluate(() => { const s = document.querySelector('.l13-page[data-page="7"]'), b = document.querySelector('.l13-rbody');
    const sr = s.getBoundingClientRect(), br = b.getBoundingClientRect(); return {w: sr.width, off: Math.abs((sr.left + sr.right) / 2 - (br.left + b.clientWidth / 2))}; });
  const box800 = await pageBox();
  await p7.setViewportSize({width: 1280, height: 1000});
  await p7.waitForTimeout(200);
  const box1000 = await pageBox();
  await p7.setViewportSize({width: 1280, height: 800});
  await p7.waitForTimeout(200);
  // The page fits the window's height (Letter, 612 x 792: (1000 - 110) x 612 / 792 = 687.7), never under 560 or over 820
  await guarded('L13-2B-DESKTOP-PAGE-SIZE', () => (Math.abs(box800.w - 560) < 1 && Math.abs(box1000.w - 687.7) < 2 && box800.off < 2 && box1000.off < 2) || JSON.stringify({box800, box1000}));
  await clickRow(p7, 'Part Two', '.l13-tw');
  await p7.click('#l13Chapters [data-key="1.0"] .l13-tocgo', Q5).catch(() => {});
  await p7.waitForTimeout(300);
  const focusAfterGo = await p7.evaluate(() => { const a = document.activeElement, r = a && a.closest('[data-key]'); return r ? r.dataset.key + (a.classList.contains('l13-tocgo') ? ' go' : '') : (a && (a.id || a.tagName)); });
  await p7.waitForTimeout(300);
  const afterGo = await rstate(p7);
  await p7.click('#l13TabSearch', Q5).catch(() => {});
  await p7.fill('#l13Find', 'lantern', Q5).catch(() => {});
  await p7.press('#l13Find', 'Enter', Q5).catch(() => {});
  await findStatus(p7);
  await p7.click('.l13-resgo >> nth=1', Q5).catch(() => {});
  await p7.waitForSelector('.l13-page[data-page="22"].l13-drawn .l13-hit', Q5).catch(() => {});
  await p7.waitForTimeout(400);
  await guarded('L13-2B-DESKTOP-STAYS-OPEN', async () => { const r = await rstate(p7), res = await resultTexts(p7);
    const marked = await p7.evaluate(`(${MARKED})(document.querySelector('.l13-page[data-page="22"]'))`);
    return (!!afterGo && afterGo.page === 21 && afterGo.panel === 'chapters' && !!r && r.page === 22 && r.panel === 'search' && !!res[1] && res[1].current && marked === true)
      || JSON.stringify({afterGo, r, cur: res.map(x => x.current), marked}); });
  // Escape in the panel's search box (the browser clears it) leaves the book and the panel open
  await p7.focus('#l13Find', Q5).catch(() => {});
  await p7.keyboard.press('Escape');
  await guarded('L13-2B-DESKTOP-ESCAPE-IN-PANEL', async () => { const r = await rstate(p7); return (!!r && r.panel === 'search') || JSON.stringify(r); });
  await p7.click('#l13Side [data-l13="closepanel"]', Q5).catch(() => {});
  const hidden7 = await p7.evaluate(() => { const s = document.querySelector('#l13Side'), c = document.querySelector('#l13HeadChapters'), b = document.querySelector('.l13-rbody');
    return {side: !!s && s.getClientRects().length === 0, button: !!c && c.getClientRects().length > 0 && c.textContent === 'Chapters', left: b && b.getBoundingClientRect().left,
      label: document.querySelector('#l13Side [data-l13="closepanel"]') && document.querySelector('#l13Side [data-l13="closepanel"]').getAttribute('aria-label')}; });
  await p7.click('#l13HeadChapters', Q5).catch(() => {});
  await guarded('L13-2B-DESKTOP-FOCUS', () => p7.evaluate(go => { const a = document.activeElement, s = document.querySelector('#l13Side');
    return (go === '1.0 go' && !!s && s.contains(a) && a.id === 'l13TabChapters') || JSON.stringify({go, a: a && (a.id || a.className)}); }, focusAfterGo));
  await guarded('L13-2B-DESKTOP-HIDE', async () => { const r = await rstate(p7);
    return (hidden7.side && hidden7.button && hidden7.left === 0 && hidden7.label === 'Hide the panel' && !!r && r.panel === 'chapters') || JSON.stringify({hidden7, r}); });
  await p7.evaluate(T => window[T].LIBPAGE13.closeReader(), T);
  // Opened from Search: the page alone, ‹ Search, and Chapters at the top
  await open6(p7, ids7[0], 20, 'search');
  await guarded('L13-2B-DESKTOP-FROM-SEARCH', () => p7.evaluate(() => { const s = document.querySelector('#l13Side'), c = document.querySelector('#l13HeadChapters');
    return (!!s && s.getClientRects().length === 0 && !!c && c.getClientRects().length > 0 && document.querySelector('#l13ReaderBack').textContent === '‹ Search') || 'panel ' + !!s; }));
  await p7.evaluate(T => window[T].LIBPAGE13.closeReader(), T);
  check('L13-2B-CLEAN', !s6.seen.errors.length && !s7.seen.errors.length && !s6.seen.requests.length && !s7.seen.requests.length,
    JSON.stringify([s6.seen, s7.seen]).slice(0, 300));
  await s6.ctx.close();
  await s7.ctx.close();

  // ---- Release 2c: chapters from the printed contents page; the match count ----
  // Every check guarded. Oracle: the contents fixture's own lines (CONTENTS above), its printed = PDF page - 2.
  const s8 = await openSheet(browser, sheet, {viewport: {width: 390, height: 844}, deviceScaleFactor: 2});
  const p8 = s8.page;
  const saves8 = () => p8.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)])));
  const saveBefore8 = await saves8();
  await openLibrary(p8);
  await p8.evaluate(() => { const i = document.createElement('input'); i.type = 'file'; i.id = 'l13Probe8'; i.multiple = true; i.hidden = true; document.body.appendChild(i); });
  await p8.setInputFiles('#l13Probe8', [tocOnly, tocFlat, tocDeep, tocDead, tocJumbled, flatOnly, tocOnly]);
  const ids8 = await p8.evaluate(async T => { const L = window[T].LIB13, f = document.querySelector('#l13Probe8').files, out = [];
    for(const [k, name, pages, offset, state] of [[0, 'Contents Book', 40, -2], [1, 'Flat Marks', 40, -2], [2, 'Deep Marks', 40, -2], [3, 'Dead Marks Too', 40, -2],
      [4, 'Jumbled', 20, -1], [5, 'Flat Only', 20, -1], [6, 'Numbers Unchecked', 40, -2, 'check']])
    { out.push((await L.add({file: f[k], name: name, pages: pages, offset: offset, pageState: state || 'matched', pageMethod: state ? null : 'printed'})).id);
      await new Promise(r => setTimeout(r, 5)); }
    await window[T].LIBPAGE13.render(); return out; }, T);
  // The chapters as "level title printed page", in order, every level
  const tree8 = id => p8.evaluate(async ([T, id]) => { const L = window[T].LIB13, rec = await L.get(id), h = await L.load(await L.file(id));
    try { const t = await L.chapters(h, rec), out = [];
      (function walk(list, d){ list.forEach(b => { out.push(d + ' ' + b.title + ' ' + L.printedFor(rec, b.page)); walk(b.kids, d + 1); }); })(t, 1);
      return {from: t.from, rows: out.join(' | ')}; } finally { L.unload(h); } }, [T, id]);
  const WANT8 = '1 Part One: Opening Matters 3 | 2 Section Alpha 4 | 3 Sub Alpha One 5 | 3 Sub Alpha Two 6 | 2 Section Beta runs on over two lines 8 | ' +
    '1 Book Two: Later Matters 12 | 2 Section Gamma 13 | 3 Sub Gamma One 14 | 2 Section Delta 16 | 1 Book Three: the Closing Chapter 24 | 2 Section Epsilon 24 | ' +
    '3 Sub Epsilon One 25 | 3 Sub Epsilon Two 26 | 2 Section Zeta 28 | 3 Sub Zeta One 29 | 3 Sub Zeta Two 30 | 2 Section Eta 32 | ' +
    '2 Appendix 1 33 | 2 Appendix 2 34 | 2 Appendix 3 35 | 2 Index 36';
  const TOPS8 = 'Part One: Opening Matters,Book Two: Later Matters,Book Three: the Closing Chapter';
  const tops = rows => rows.filter(r => r.level === 1).map(r => r.title).join();
  const hint8 = () => p8.evaluate(() => { const c = document.querySelector('#l13Chapters'); return c ? c.innerText.replace(/\s+/g, ' ') : ''; });
  await guarded('L13-2C-CONTENTS-TREE', async () => { const t = await tree8(ids8[0]); return (t.from === 'contents' && t.rows === WANT8) || JSON.stringify(t); });
  // In the reader: the chapters, the part being read open and highlighted, printed page numbers, where they came from
  await open6(p8, ids8[0], 13, 'library');
  await p8.click('#l13BarChapters', Q5).catch(() => {});
  const rows8 = await tocRows(p8);
  await guarded('L13-2C-CONTENTS-SHOWN', () => { const got = rows8.map(r => r.level + ' ' + r.title).join(' | '), cur = rows8.filter(r => r.cur).map(r => r.title).join();
    return (got === '1 Part One: Opening Matters | 1 Book Two: Later Matters | 2 Section Gamma | 2 Section Delta | 1 Book Three: the Closing Chapter' && cur === 'Section Gamma')
      || got + ' / ' + cur; });
  await guarded('L13-2C-CONTENTS-PRINTED', () => { const got = rows8.map(r => r.page).join(); return got === 'p.3,p.12,p.13,p.16,p.24' || got; });
  await guarded('L13-2C-CONTENTS-HINT', async () => { const t = await hint8();
    return (/From the book’s printed contents page\. (Tap|Click) a title to go there; the arrow opens or closes a level\./.test(t) && !/bookmarks/.test(t)) || t; });
  // A chapter title printed with no number goes to the page of the entry below it
  await clickRow(p8, 'Book Three: the Closing Chapter', '.l13-tocgo');
  await p8.waitForTimeout(300);
  await guarded('L13-2C-CONTENTS-GO', async () => { const r = await rstate(p8); return (!!r && r.page === 26 && r.panel === null) || JSON.stringify(r); });
  await p8.evaluate(T => window[T].LIBPAGE13.closeReader(), T);
  // One flat level of bookmarks, or bookmarks that lead nowhere: the contents page instead; bookmarks in levels stay
  const topsOf = async (id, printed) => { await open6(p8, id, printed, 'library'); await p8.click('#l13BarChapters', Q5).catch(() => {});
    const r = {tops: tops(await tocRows(p8)), hint: await hint8()}; await p8.evaluate(T => window[T].LIBPAGE13.closeReader(), T); return r; };
  const flat8 = await topsOf(ids8[1], 5), dead8 = await topsOf(ids8[3], 5), deep8 = await topsOf(ids8[2], 5), jumbled8 = await topsOf(ids8[4], 5);
  const flatOnly8 = await topsOf(ids8[5], 5), unchecked8 = await topsOf(ids8[6], 5);
  await guarded('L13-2C-FLAT-USES-CONTENTS', () => (flat8.tops === TOPS8 && /printed contents page/.test(flat8.hint)) || JSON.stringify(flat8));
  await guarded('L13-2C-UNLINKED-USES-CONTENTS', () => (dead8.tops === TOPS8 && /printed contents page/.test(dead8.hint)) || JSON.stringify(dead8));
  await guarded('L13-2C-LEVELS-KEEP-BOOKMARKS', () => (deep8.tops === 'Alpha,Beta' && /From the PDF’s own bookmarks\./.test(deep8.hint)) || JSON.stringify(deep8));
  await guarded('L13-2C-FLAT-NO-CONTENTS', () => (flatOnly8.tops === 'One,Two' && /From the PDF’s own bookmarks\./.test(flatOnly8.hint)) || JSON.stringify(flatOnly8));
  // A page of numbers that do not run in order is passed over for the contents page after it
  await guarded('L13-2C-JUMBLED-SKIPPED', () => (jumbled8.tops === 'Part Nine: Late Matters' && /printed contents page/.test(jumbled8.hint)) || JSON.stringify(jumbled8));
  // Page numbers not yet matched: no chapters from the contents page (its printed numbers would lead to the wrong pages)
  await guarded('L13-2C-UNMATCHED-NO-CONTENTS', () => /This PDF has no bookmarks, so there are no chapters to show\./.test(unchecked8.hint) || JSON.stringify(unchecked8));
  // Read once per book while the app is open
  await guarded('L13-2C-KEPT-WHILE-OPEN', () => p8.evaluate(async ([T, id]) => { const L = window[T].LIB13, rec = await L.get(id), file = await L.file(id);
    const read = async r => { const h = await L.load(file); try { return await L.chapters(h, r); } finally { L.unload(h); } };
    const a = await read(rec), b = await read(rec);
    return (a === b && a.from === 'contents' && a.length === 3) || JSON.stringify({same: a === b, from: a.from, n: a.length}); }, [T, ids8[0]]));
  // Search in book counts every match ("lantern" three times on PDF page 20, once on 22) and names the contents' sections
  await open6(p8, ids8[0], 5, 'library');
  await p8.click('#l13BarSearch', Q5).catch(() => {});
  await p8.fill('#l13Find', 'lantern', Q5).catch(() => {});
  await p8.press('#l13Find', 'Enter', Q5).catch(() => {});
  const status8 = await findStatus(p8), found8 = await resultTexts(p8);
  await guarded('L13-2C-SEARCH-COUNT', () => (status8 === '4 matches on 2 pages' && found8.length === 2) || status8 + ' ' + found8.length);
  await guarded('L13-2C-SEARCH-SECTIONS', () => { const pp = found8.map(r => r.pp).join(' | '); return pp === 'p.18 · Section Delta | p.20 · Section Delta' || pp; });
  await p8.fill('#l13Find', 'two lanterns', Q5).catch(() => {});
  await p8.press('#l13Find', 'Enter', Q5).catch(() => {});
  await guarded('L13-2C-SEARCH-ONE', async () => { const s = await findStatus(p8); return s === '1 match on 1 page' || s; });
  await p8.evaluate(T => window[T].LIBPAGE13.closeReader(), T);
  await guarded('L13-2C-SAVES-UNTOUCHED', async () => (await saves8()) === saveBefore8 || 'character saves changed');
  // No chapter title kept anywhere: the Library's records and preferences, the page's storage
  await guarded('L13-2C-NOTHING-STORED', () => p8.evaluate(async T => { const db = await window[T].LIB13.db(), out = [];
    for(const name of Array.from(db.objectStoreNames).filter(n => n !== 'files' && n !== 'covers'))
      out.push(await new Promise((ok, no) => { const r = db.transaction(name).objectStore(name).getAll(); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); }));
    const text = JSON.stringify(out) + JSON.stringify(Object.assign({}, localStorage)) + JSON.stringify(Object.assign({}, sessionStorage));
    const hit = ['Opening Matters', 'Section Alpha', 'Later Matters', 'Section Kappa'].filter(t => text.includes(t));
    return !hit.length || hit.join(); }, T));
  check('L13-2C-CLEAN', !s8.seen.errors.length && !s8.seen.requests.length, JSON.stringify(s8.seen).slice(0, 300));
  await s8.ctx.close();

  // ---- Release 2d: the part tapped stays highlighted while its page is in view ----
  // Every check guarded. Oracle: the twin fixtures' own lines (TWIN above). Opened at p.5, so Chapter One's sections show.
  const s9 = await openSheet(browser, sheet, {viewport: {width: 390, height: 844}, deviceScaleFactor: 2});
  const s9d = await openSheet(browser, sheet, {viewport: {width: 1280, height: 800}});
  const p9 = s9.page, p9d = s9d.page;
  const shelve9 = async pg => {
    await openLibrary(pg);
    await pg.evaluate(() => { const i = document.createElement('input'); i.type = 'file'; i.id = 'l13Probe9'; i.multiple = true; i.hidden = true; document.body.appendChild(i); });
    await pg.setInputFiles('#l13Probe9', [twin, twinMarks]);
    return pg.evaluate(async T => { const L = window[T].LIB13, f = document.querySelector('#l13Probe9').files, out = [];
      for(const [k, name] of [[0, 'Twin Contents'], [1, 'Twin Marks']])
      { out.push((await L.add({file: f[k], name: name, pages: 20, offset: -2, pageState: 'matched', pageMethod: 'printed'})).id); await new Promise(r => setTimeout(r, 5)); }
      await window[T].LIBPAGE13.render(); return out; }, T);
  };
  const ids9 = await shelve9(p9);
  // The sheet opened: the rows highlighted and the printed page shown, then the sheet closed
  const seen9 = async () => { await p9.click('#l13BarChapters', Q5).catch(() => {}); const rows = await tocRows(p9), r = await rstate(p9);
    await p9.keyboard.press('Escape'); return {cur: rows.filter(x => x.cur).map(x => x.title).join(), printed: r && r.printed}; };
  const tap9 = async t => { await p9.click('#l13BarChapters', Q5).catch(() => {}); await clickRow(p9, t, '.l13-tocgo'); await p9.waitForTimeout(300); return seen9(); };
  const jump9 = async n => { await p9.fill('#l13Jump', String(n), Q5).catch(() => {}); await p9.click('.l13-jump button', Q5).catch(() => {}); await p9.waitForTimeout(300); };
  const is9 = (s, cur, printed) => (s.cur === cur && s.printed === printed) || JSON.stringify(s);
  await open6(p9, ids9[0], 5, 'library');
  // The earlier of two parts on one page, from the contents page
  const north9 = await tap9('North Ward');
  await guarded('L13-2D-CONTENTS-TAPPED', () => is9(north9, 'North Ward', 4));
  // Scrolling within that page keeps it (the page chip, blanked first, shows the scroll was followed); another page in view,
  // by scrolling or the page jump, drops it (back on p.4 the later part is the spot again)
  const scroll9 = async to => { await p9.evaluate(to => { const c = document.querySelector('.l13-chip'), b = document.querySelector('.l13-rbody'), s = document.querySelector('.l13-page[data-page="' + to + '"]');
    if(!c || !b) return; c.textContent = ''; b.scrollTop = to === '+' ? b.scrollTop + 120 : s ? s.offsetTop - 12 : b.scrollTop; }, to);
    await p9.waitForTimeout(300); return p9.evaluate(() => { const c = document.querySelector('.l13-chip'); return c ? c.textContent : null; }); };
  const chip9 = await scroll9('+');
  const within9 = await seen9();
  await guarded('L13-2D-SCROLL-WITHIN-KEEPS', () => (chip9 === 'Printed page 4' && is9(within9, 'North Ward', 4) === true) || JSON.stringify({chip9, within9}));
  const chip9a = await scroll9(7);
  const ahead9 = await seen9();
  const chip9b = await scroll9(6);
  const again9 = await seen9();
  await guarded('L13-2D-SCROLL-AWAY-CLEARS', () => (chip9a === 'Printed page 5' && is9(ahead9, 'Ward Shrines', 5) === true && chip9b === 'Printed page 4'
    && is9(again9, 'South Ward', 4) === true) || JSON.stringify({chip9a, ahead9, chip9b, again9}));
  await tap9('North Ward');
  await jump9(6);
  const away9 = await seen9();
  await jump9(4);
  const back9 = await seen9();
  await guarded('L13-2D-OTHER-PAGE-CLEARS', () => (is9(away9, 'East Ward', 6) === true && is9(back9, 'South Ward', 4) === true) || JSON.stringify({away9, back9}));
  await guarded('L13-2D-LATER-TAPPED', async () => is9(await tap9('South Ward'), 'South Ward', 4));
  // A chapter tapped stays highlighted over its first section on the same page
  await guarded('L13-2D-PARENT-TAPPED', async () => is9(await tap9('Chapter Two'), 'Chapter Two', 10));
  // On the last page the jump stops short of the page's top (the chip shows p.17): the part tapped still stays
  await jump9(18);
  await guarded('L13-2D-LAST-PAGE-TAPPED', async () => { const s = await tap9('Harbour Lights'); return s.cur === 'Harbour Lights' || JSON.stringify(s); });
  // Search in book's results still name the part the page holds (the later of two), whatever was tapped; a result
  // chosen on the tapped part's page keeps it highlighted
  await tap9('North Ward');
  await p9.click('#l13BarSearch', Q5).catch(() => {});
  await p9.fill('#l13Find', 'ward lantern', Q5).catch(() => {});
  await p9.press('#l13Find', 'Enter', Q5).catch(() => {});
  await findStatus(p9);
  await guarded('L13-2D-SEARCH-PART-UNCHANGED', async () => { const pp = (await resultTexts(p9)).map(r => r.pp).join(' | '); return pp === 'p.4 · South Ward' || pp; });
  await p9.click('.l13-resgo >> nth=0', Q5).catch(() => {});
  await p9.waitForSelector('.l13-page[data-page="6"] .l13-hit', Q5).catch(() => {});
  await p9.waitForTimeout(300);
  await guarded('L13-2D-SEARCH-KEEPS-TAPPED', async () => is9(await seen9(), 'North Ward', 4));
  await p9.evaluate(T => window[T].LIBPAGE13.closeReader(), T);
  // The same from the PDF's own bookmarks
  await open6(p9, ids9[1], 5, 'library');
  await guarded('L13-2D-BOOKMARKS-TAPPED', async () => is9(await tap9('North Ward'), 'North Ward', 4));
  await p9.evaluate(T => window[T].LIBPAGE13.closeReader(), T);
  // Desktop: the panel stays open, highlighting the part clicked at once, with focus kept on its row
  const ids9d = await shelve9(p9d);
  await open6(p9d, ids9d[0], 5, 'library');
  await p9d.click('#l13Chapters [data-key="0.0"] .l13-tocgo', Q5).catch(() => {});
  await p9d.waitForTimeout(300);
  await guarded('L13-2D-DESKTOP-TAPPED', async () => { const rows = await tocRows(p9d), r = await rstate(p9d);
    const a = await p9d.evaluate(() => { const a = document.activeElement, row = a && a.closest('[data-key]'); return row ? row.dataset.key + (a.classList.contains('l13-tocgo') ? ' go' : '') : (a && (a.id || a.tagName)); });
    const cur = rows.filter(x => x.cur).map(x => x.title).join();
    return (cur === 'North Ward' && !!r && r.printed === 4 && r.panel === 'chapters' && a === '0.0 go') || JSON.stringify({cur, r, a}); });
  await p9d.evaluate(T => window[T].LIBPAGE13.closeReader(), T);
  check('L13-2D-CLEAN', !s9.seen.errors.length && !s9d.seen.errors.length && !s9.seen.requests.length && !s9d.seen.requests.length,
    JSON.stringify([s9.seen, s9d.seen]).slice(0, 300));
  await s9.ctx.close();
  await s9d.ctx.close();

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
