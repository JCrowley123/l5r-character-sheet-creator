'use strict';
// Read-only geometry capture using the harness's own fixture and measurement functions.
// No checks are changed or retried; this identifies why the preserved removal input failed.
const fs = require('fs'), path = require('path'), Module = require('module');
const harness = path.resolve(process.argv[3]);
const source = fs.readFileSync(harness, 'utf8');
const boundary = source.indexOf('(async () => {');
if (boundary < 0) throw Error('Harness entry not found');
const diagnostic = `
(async () => {
  const browser = await chromium.launch();
  try {
    for (const [D, opts] of Object.entries(DEVICES)) {
      const {context, page, errors} = await open(browser, opts);
      await page.evaluate(() => window.__L5R_TEST__.MODES12.set('play'));
      await goTab(page, 'Adv & Disadv');
      const play = await page.evaluate(cardEdges);
      const off = play.map(c => ({name:c.name,d:[c.nameX,c.descX,...c.lines].filter(x=>x!==null).map(x=>Math.round((x-c.edge)*10)/10)})).filter(c=>c.d.some(x=>Math.abs(x)>1));
      const withLines = play.filter(c=>c.lines.length && c.descX!==null);
      console.log(JSON.stringify({device:D,cards:play.length,withLines:withLines.length,qualifyingNames:withLines.map(c=>c.name),off,errors,cardsMeasured:play},null,2));
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(e=>{ console.error(e); process.exitCode=1; });
`;
const loaded = new Module(harness, module);
loaded.filename = harness;
loaded.paths = Module._nodeModulePaths(path.dirname(harness));
loaded._compile(source.slice(0,boundary)+diagnostic,harness);
