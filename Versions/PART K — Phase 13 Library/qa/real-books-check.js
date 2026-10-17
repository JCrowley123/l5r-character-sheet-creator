// Local measurement on the owner's own PDFs (never committed): recognition and page matching for each,
// against the page map's printed offsets. Usage: node real-books-check.js <sheet.html> <books dir> <index.json>
const {chromium} = require('playwright'); const {pathToFileURL} = require('url'); const path = require('path'); const fs = require('fs');
const NAME_TO_ID = {'Core Rulebook': 'core', 'Book of Air': 'air', 'Book of Earth': 'earth', 'Book of Fire': 'fire', 'Book of Water': 'water',
  'Book of Void': 'void', 'Emerald Empire': 'ee', 'Enemies of the Empire': 'enemies', 'Imperial Histories 1': 'ih1', 'Imperial Histories 2': 'ih2',
  'Naishou Province': 'naishou', 'Secrets of the Empire': 'secrets', 'Strongholds of the Empire': 'strongholds', 'Sword and Fan': 'swordfan',
  'The Great Clans': 'clans', 'Unexpected Allies 2': 'ua2'};
(async () => {
  const [sheet, dir, indexFile] = process.argv.slice(2);
  const books = JSON.parse(fs.readFileSync(indexFile, 'utf8')).books;
  const b = await chromium.launch(); const pg = await b.newPage();
  await pg.goto(pathToFileURL(sheet).href); await pg.waitForTimeout(1000);
  await pg.evaluate(() => { const i = document.createElement('input'); i.type = 'file'; i.id = 'rbc'; document.body.appendChild(i); });
  let pass = 0;
  for (const bk of books) {
    await pg.setInputFiles('#rbc', path.join(dir, bk.file));
    const t0 = Date.now();
    const r = await pg.evaluate(async () => {
      const L = window.__L5R_TEST__.LIB13, f = document.getElementById('rbc').files[0];
      const h = await L.load(f); const info = await L.inspect(h); const m = await L.matchPages(h); L.unload(h);
      return {id: info.book && info.book.id, pagesMatch: info.book && info.book.pagesMatch, state: m.state, offset: m.offset, method: m.method, ev: m.evidence};
    });
    const ok = r.id === NAME_TO_ID[bk.title] && r.state === 'matched' && r.offset === bk.printed_offset;
    if (ok) pass++;
    console.log((ok ? 'PASS ' : 'FAIL ') + bk.title.padEnd(26) + ` id=${r.id} ${r.state} offset=${r.offset} (expect ${bk.printed_offset}) ${r.method} agree=${r.ev.agreeing}/${r.ev.withNumbers} labels=${r.ev.labelOffset} ${Date.now() - t0}ms`);
  }
  console.log(`${pass}/${books.length}`);
  await b.close();
})().catch(e => { console.error('FAIL', e.message.slice(0, 300)); process.exit(1); });
