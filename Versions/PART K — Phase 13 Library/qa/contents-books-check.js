// Local check on the owner's own PDFs (never committed with results): which books get their chapters from the printed
// contents page, how many entries at each level, and the time taken. Titles are printed only with --titles (to read
// on screen, never kept). Usage: node contents-books-check.js <sheet.html> <books dir> [--titles]
const {chromium} = require('playwright'); const {pathToFileURL} = require('url'); const path = require('path'); const fs = require('fs');
(async () => {
  const [sheet, dir, flag] = process.argv.slice(2);
  const b = await chromium.launch(); const pg = await b.newPage();
  await pg.goto(pathToFileURL(sheet).href); await pg.waitForTimeout(1000);
  await pg.evaluate(() => { const i = document.createElement('input'); i.type = 'file'; i.id = 'cbc'; document.body.appendChild(i); });
  for (const f of fs.readdirSync(dir).filter(f => /\.pdf$/i.test(f) && !/Character Sheet/.test(f))) {
    await pg.setInputFiles('#cbc', path.join(dir, f));
    const r = await pg.evaluate(async titles => {
      const L = window.__L5R_TEST__.LIB13, file = document.getElementById('cbc').files[0];
      const h = await L.load(file); const info = await L.inspect(h); const m = await L.matchPages(h);
      const record = {offset: m.offset, pages: h.pages, pageState: m.state};
      const t0 = performance.now(); const tree = await L.chapters(h, record); const ms = Math.round(performance.now() - t0);
      const marks = await L.outline(h);
      const per = []; const lines = [];
      (function walk(list, d){ list.forEach(x => { per[d] = (per[d] || 0) + 1; if(titles) lines.push('  '.repeat(d) + x.title + ' @' + x.page); walk(x.kids, d + 1); }); })(tree, 0);
      const mper = []; (function walk(list, d){ list.forEach(x => { mper[d] = (mper[d] || 0) + 1; walk(x.kids, d + 1); }); })(marks, 0);
      L.unload(h);
      return {id: info.book && info.book.id, from: tree.from, per, mper, ms, lines};
    }, flag === '--titles');
    console.log(String(r.id).padEnd(12), (r.from || '-').padEnd(10), 'levels', r.per.length, '[' + r.per.join(', ') + ']', ' bookmarks [' + r.mper.join(', ') + ']', r.ms + ' ms');
    if (flag === '--titles') console.log(r.lines.join('\n'));
  }
  await b.close();
})().catch(e => { console.error('FAIL', e.message.slice(0, 300)); process.exit(1); });
