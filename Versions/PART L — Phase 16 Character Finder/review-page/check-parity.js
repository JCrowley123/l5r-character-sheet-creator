// Checks the review page's scoring against the prototype: serves this folder, opens the page at phone width, and
// compares window.__finder.recommend() with oracle.json (written by build-data.py) on every answer set.
//   python3 -I build-data.py && node check-parity.js
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const DIR = __dirname;
const oracle = JSON.parse(fs.readFileSync(path.join(DIR, 'oracle.json'), 'utf8'));
const TYPES = {'.html': 'text/html; charset=utf-8', '.json': 'application/json'};
const server = http.createServer((req, res) => {
  const f = path.join(DIR, decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, ''));
  if (!f.startsWith(DIR) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, {'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(res);
});
server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 390, height: 844}});
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.goto('http://127.0.0.1:' + port + '/character-finder.html');
  await p.waitForSelector('#qtext', {timeout: 15000});
  const bad = await p.evaluate((oracle) => oracle.map((o, i) => {
    const r = window.__finder.recommend(o.ans);
    const got = {sample: r.mode === 'sample', hard: r.hard.map(x => x.s.n), soft: r.soft.map(x => x.s.n), wild: r.wild ? r.wild.s.n : null, all: r.all.map(x => x.s.n)};
    return JSON.stringify(got) === JSON.stringify({sample: o.sample, hard: o.hard, soft: o.soft, wild: o.wild, all: o.all}) ? -1 : i;
  }).filter(i => i >= 0), oracle);
  const rows = await p.locator('#list details.school').count();
  const wide = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  const ex = [];
  for (let i = 0; i < await p.locator('#examples button').count(); i++) {
    await p.locator('#examples button').nth(i).click();
    ex.push(await p.evaluate(() => [...document.querySelectorAll('#panel .res-h')].map(e => e.textContent)[0] + ': ' +
      [...document.querySelectorAll('#panel > details.school .sname')].slice(0, 2).map(e => e.textContent).join(', ')));
  }
  console.log('answer sets:', oracle.length, '| sample cases:', oracle.filter(o => o.sample).length, '| mismatches:', bad.length, bad.slice(0, 5));
  console.log('School rows:', rows, '| wider than the phone:', wide, '| page errors:', errs.length ? errs : 'none');
  ex.forEach(e => console.log('example ->', e));
  await b.close(); server.close();
  process.exit(bad.length || errs.length || wide || rows !== 105 ? 1 : 0);
});
