// Phase 13 Library, Release 1: the device checklist walked headlessly on the live site (https, its service worker
// and its own storage), as the owner's taps would go: L1-L5, L7 offline, L9. Synthetic Core PDF from make-test-pdf.py.
// Usage: node live-walk.js [url]   (evidence: qa/live/live-walk.log)
const {chromium} = require('playwright');
const path = require('path');
const fs = require('fs');
const os = require('os');
const {execFileSync} = require('child_process');

const URL = process.argv[2] || 'https://l5r-character-sheet-creator.pages.dev/';
const results = [];
function check(id, ok, detail){ results.push({id, ok: !!ok, detail: String(detail || '')}); }
const text = (pg, sel) => pg.evaluate(s => { const n = document.querySelector(s); return n ? n.innerText.replace(/\s+/g, ' ').trim() : null; }, sel);

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'l13walk-'));
  const core = path.join(dir, 'Core Rulebook.pdf');
  execFileSync('python', ['-I', path.join(__dirname, 'make-test-pdf.py'), core, '--pages', '404', '--offset', '-3', '--labels', 'r0,D3',
    '--info-title', 'L5R_00_Introduction.indd', '--title-line', '4=Legend of the Five Rings RPG, 4th Edition', '--art', '1-3'], {stdio: 'pipe'});
  const browser = await chromium.launch();
  const context = await browser.newContext({viewport: {width: 390, height: 844}});
  const pg = await context.newPage();
  const errors = [];
  pg.on('pageerror', e => errors.push(e.message));
  await pg.goto(URL + '?lib13walk=' + Date.now(), {waitUntil: 'load'});
  await pg.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.LIB13, null, {timeout: 30000});
  await pg.waitForTimeout(800);

  // L1: the empty Library from the app bar
  await pg.click('#ab113Bar [data-section="library"]');
  await pg.waitForSelector('.l13-empty', {timeout: 15000});
  const empty = await text(pg, '.l13-empty');
  check('L1-EMPTY', /Add the books you own as PDF files\./.test(empty) && /\+ Book to add one\./.test(empty) &&
    (await pg.$$('.l13-ghost')).length === 3 && !!(await pg.$('#l13Add')), empty);

  // L2: + Book, Choose PDF
  await pg.click('#l13Add');
  await pg.setInputFiles('#l13AddDialog input[type=file]', core);
  await pg.waitForFunction(() => { const b = document.querySelector('[data-l13="add"]'); return b && !b.disabled; }, null, {timeout: 60000});
  await pg.waitForFunction(() => document.querySelector('[data-l13="pages"]').dataset.state !== 'matching', null, {timeout: 60000});
  const add = await pg.evaluate(() => ({file: document.querySelector('[data-l13="fn"]').textContent, choose: document.querySelector('[data-l13="choose"]').textContent,
    book: document.querySelector('[data-l13="book"]').innerText.replace(/\s+/g, ' '), pages: document.querySelector('[data-l13="pages"]').innerText.replace(/\s+/g, ' '),
    name: document.querySelector('#l13Name').value, cover: !!document.querySelector('[data-l13="cover"] img'),
    kept: /Kept on this device only\. Nothing is uploaded\./.test(document.querySelector('#l13AddDialog').innerText)}));
  check('L2-ADD-A-BOOK', add.file === 'Core Rulebook.pdf' && add.choose === 'Choose another' && add.book.includes('Recognised as Core Rulebook') &&
    add.pages.includes('Page numbers matched automatically') && add.name === 'Core Rulebook' && add.cover && add.kept, JSON.stringify(add));

  // L3: Add book; the shelf and its storage line
  await pg.click('[data-l13="add"]');
  await pg.waitForSelector('.l13-row', {timeout: 60000});
  await pg.waitForTimeout(500);
  const foot = await text(pg, '#l13Foot');
  check('L3-SHELF', (await text(pg, '.l13-title')) === 'Core Rulebook' && /^Books use .+ on this device$/.test(foot), foot);
  const storage = await pg.evaluate(async () => ({persisted: navigator.storage && navigator.storage.persisted ? await navigator.storage.persisted() : null,
    note: !document.querySelector('#l13Persist').hidden}));

  // L4: tap the book; type 139, Go
  await pg.click('.l13-row .l13-title');
  await pg.waitForSelector('#l13Reader .l13-page.l13-drawn', {timeout: 60000});
  await pg.fill('#l13Jump', '139');
  await pg.click('#l13Reader .l13-jump button[type=submit]');
  await pg.waitForTimeout(1500);
  const jump = await pg.evaluate(() => ({chip: document.querySelector('.l13-chip').textContent, pdf: window.__L5R_TEST__.LIBPAGE13.state().reader.page}));
  check('L4-PAGE-JUMP', jump.chip === 'Printed page 139' && jump.pdf === 142, JSON.stringify(jump));
  await pg.click('#l13ReaderBack');

  // L5: Search, Athletics, the citation, Open, back
  await pg.click('#ab113Bar [data-section="search"]');
  await pg.fill('.s14-input', 'Athletics');
  await pg.waitForTimeout(500);
  await pg.evaluate(() => { const b = Array.from(document.querySelectorAll('.cl11-panel[data-panel="search"] button')).find(x => x.querySelector('.s14-name') && x.querySelector('.s14-name').textContent === 'Athletics'); b.click(); });
  await pg.waitForSelector('.l13-cite', {timeout: 15000});
  await pg.click('.l13-cite');
  const prompt = await text(pg, '.l13-alert');
  await pg.click('.l13-alert .l13-btn-p');
  await pg.waitForSelector('#l13Reader .l13-page.l13-drawn', {timeout: 60000});
  await pg.waitForTimeout(800);
  const link = await pg.evaluate(() => ({chip: document.querySelector('.l13-chip').textContent, back: document.querySelector('#l13ReaderBack').textContent}));
  await pg.click('#l13ReaderBack');
  const backInSearch = await pg.evaluate(() => !document.querySelector('#l13Reader') && !document.querySelector('.cl11-panel[data-panel="search"]').hidden);
  check('L5-SEARCH-LINK', /Open Core Rulebook at p\.139\?/.test(prompt || '') && link.chip === 'Printed page 139' && link.back === '‹ Search' && backInSearch,
    JSON.stringify({prompt, link, backInSearch}));

  // L7: offline, after the service worker has the page: reload, open the book
  await pg.evaluate(() => navigator.serviceWorker && navigator.serviceWorker.ready.then(() => true));
  await pg.waitForTimeout(1500);
  await context.setOffline(true);
  let offline = false;
  try {
    await pg.reload({waitUntil: 'load'});
    await pg.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.LIB13, null, {timeout: 30000});
    await pg.click('#ab113Bar [data-section="library"]');
    await pg.waitForSelector('.l13-row .l13-title', {timeout: 15000});
    await pg.click('.l13-row .l13-title');
    offline = await pg.waitForSelector('#l13Reader .l13-page.l13-drawn', {timeout: 60000}).then(() => true, () => false);
    await pg.click('#l13ReaderBack');
  } catch(e){ offline = 'error: ' + e.message.slice(0, 120); }
  await context.setOffline(false);
  check('L7-OFFLINE', offline === true, offline);

  // L9: ⋯, Delete, asked first; the citation is plain again
  await pg.click('.l13-more');
  await pg.click('#l13Delete');
  const ask = await text(pg, '.l13-alert');
  await pg.click('.l13-alert .l13-btn-p');
  await pg.waitForSelector('.l13-empty', {timeout: 15000});
  await pg.click('#ab113Bar [data-section="search"]');
  await pg.fill('.s14-input', 'Athletics');
  await pg.waitForTimeout(500);
  await pg.evaluate(() => { const b = Array.from(document.querySelectorAll('.cl11-panel[data-panel="search"] button')).find(x => x.querySelector('.s14-name') && x.querySelector('.s14-name').textContent === 'Athletics'); b.click(); });
  await pg.waitForTimeout(800);
  const plain = await pg.evaluate(() => !document.querySelector('.l13-cite') && !!document.querySelector('.s14-source'));
  check('L9-DELETE', /Delete Core Rulebook\?/.test(ask || '') && plain, JSON.stringify({ask, plain}));
  check('NO-PAGE-ERRORS', errors.length === 0, errors.slice(0, 3).join(' | '));

  await browser.close();
  fs.rmSync(dir, {recursive: true, force: true});
  const pass = results.filter(r => r.ok).length;
  const lines = results.map(r => (r.ok ? 'PASS ' : 'FAIL ') + r.id + (r.ok ? '' : '  ' + r.detail.slice(0, 300)));
  lines.push('storage: persisted=' + storage.persisted + ', clear-books note shown=' + storage.note);
  lines.push(`${pass}/${results.length} checks passed on ${URL} at ${new Date().toISOString()}`);
  fs.mkdirSync(path.join(__dirname, 'live'), {recursive: true});
  fs.writeFileSync(path.join(__dirname, 'live', 'live-walk.log'), lines.join('\n') + '\n');
  console.log(lines.join('\n'));
  process.exit(pass === results.length ? 0 : 1);
})().catch(e => { console.error('WALK ERROR', e.message.slice(0, 500)); process.exit(2); });
