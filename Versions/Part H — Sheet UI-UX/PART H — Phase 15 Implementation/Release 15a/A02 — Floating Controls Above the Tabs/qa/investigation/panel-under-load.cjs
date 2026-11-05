'use strict';
// A02 investigation: why QA-PANEL-BESIDE-BUTTON failed only at 4x CPU. Opens the dense character on a phone, taps
// Quick Access as the harness does, and records the button's transform and rects. node panel-under-load.cjs <sheet> <rate>
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const [sheet, rate] = [path.resolve(process.argv[2]), Number(process.argv[3] || 4)];
const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../../../PART H — Phase 15 UI Consistency Audit/qa/dense-audit-fixture.json'), 'utf8'));
(async () => {
  const browser = await chromium.launch();
  const out = [];
  for (let i = 0; i < 3; i++) {
    const context = await browser.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
    await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, r => r.abort('blockedbyclient'));
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', {rate});
    await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
    await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready, null, {timeout: 120000});
    await page.waitForFunction(() => !document.getElementById('l5rSplash'), null, {timeout: 120000});
    await page.evaluate(d => { const T = window.__L5R_TEST__; T.CL11.close(); T.applyData(d); }, data);
    await page.tap('#quickAccessToggleBtn');
    for (const when of ['after 2 frames', 'after 500 ms']) {
      if (when === 'after 500 ms') await page.waitForTimeout(500); else await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      out.push(await page.evaluate(w => { const b = document.getElementById('quickAccessToggleBtn'), p = document.getElementById('quickAccessPanel'), s = document.getElementById('fc15Strip');
        const r = e => { const x = e.getBoundingClientRect(); return [x.left, x.top, x.right, x.bottom].map(v => Math.round(v * 100) / 100); };
        return {when: w, transform: getComputedStyle(b).transform, hover: b.matches(':hover'), active: b.matches(':active'), button: r(b), offsetLeft: b.offsetLeft, panel: r(p), strip: r(s)}; }, when));
    }
    await context.close();
  }
  await browser.close();
  console.log(JSON.stringify({rate, out}, null, 1));
})();
