'use strict';
// G5 investigation probe (18 November 2026, Claude): does a plain timer on the sheet fire late when the page is idle and
// the harness sends nothing? No sheet code is called: the page is opened as quick-tap-undo-harness.js opens it (laptop,
// Manage, the dense character, Identity), then a bare setTimeout of 5,000 ms and one of 1,200 ms are started in the page
// and their real delays read back. Twice: (quiet) nothing is sent to the page for nine seconds; (awake) a no-op is
// evaluated in the page every 250 ms for the same nine seconds. Run it with and without cpu-throttle.cjs.
//   node --require <navigation-budget> --require <splash-fast> [--require <cpu-throttle>] diagnose-idle-timer.cjs <sheet.html>
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const A08 = path.resolve(__dirname, '../../A08 — One Undo for Quick Taps/qa');
const DENSE = path.join(A08, 'dense-kuni.l5r.json'), DENSE_NAME = 'Phase 15 dense audit';
const sheet = path.resolve(process.argv[2]);
const wait = ms => new Promise(r => setTimeout(r, ms));
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
(async () => {
  const browser = await chromium.launch();
  const out = {cpu: process.env.L5R_CPU_RATE || null, runs: []};
  try {
    const context = await browser.newContext({viewport: {width: 1440, height: 1000}});
    await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
    const page = await context.newPage();
    await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
    await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready);
    await page.waitForFunction(() => !document.getElementById('l5rSplash'));
    await page.locator('#fileImport').setInputFiles(DENSE);
    await page.waitForFunction(n => document.getElementById('f_name').value === n, DENSE_NAME);
    await page.evaluate(() => window.__L5R_TEST__.MODES12.set('management'));
    await page.evaluate(async () => { const C = window.__L5R_CAROUSEL__; if (C) { C.goToTab('Identity'); await C.whenSettled(); } });
    await settle(page);
    await wait(3000);   // let the page go quiet
    for (const mode of ['quiet', 'awake', 'quiet', 'awake']) {
      await page.evaluate(() => {
        const s = performance.now();
        window.__fired = {};
        setTimeout(() => { window.__fired.t5000 = Math.round(performance.now() - s); }, 5000);
        setTimeout(() => { window.__fired.t1200 = Math.round(performance.now() - s); }, 1200);
      });
      if (mode === 'quiet') await wait(9000);
      else for (let k = 0; k < 36; k++) { await wait(250); await page.evaluate(() => 0); }
      const fired = await page.evaluate(() => Object.assign({}, window.__fired));
      out.runs.push({mode, fired});
      await wait(3000);
    }
    await context.close();
  } finally {
    await browser.close();
  }
  console.log(JSON.stringify(out));
})().catch(e => { console.error(e); process.exit(1); });
