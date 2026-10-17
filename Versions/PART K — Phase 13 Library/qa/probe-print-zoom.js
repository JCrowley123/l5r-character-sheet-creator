// Probe: does print media (then screen) change the page zoom of a phone-emulated page, given time to lay out?
const {chromium} = require('playwright');
const {pathToFileURL} = require('url');
const sheet = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  for(const wait of [0, 50, 300, 1000]){
    const ctx = await browser.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
    const pg = await ctx.newPage();
    await pg.goto(pathToFileURL(sheet).href);
    await pg.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready, null, {timeout: 60000});
    const s0 = await pg.evaluate(() => visualViewport.scale);
    await pg.emulateMedia({media: 'print'});
    const sp = await pg.evaluate(async w => { await new Promise(r => setTimeout(r, w)); return [visualViewport.scale, document.documentElement.scrollWidth, innerWidth]; }, wait);
    await pg.emulateMedia({media: 'screen'});
    await pg.waitForTimeout(300);
    const s1 = await pg.evaluate(() => [visualViewport.scale, innerWidth]);
    await pg.setViewportSize({width: 320, height: 700});
    await pg.waitForTimeout(300);
    const s2 = await pg.evaluate(() => [visualViewport.scale, innerWidth]);
    console.log('wait', wait, 'before', s0, 'print', JSON.stringify(sp), 'screen', JSON.stringify(s1), 'at 320', JSON.stringify(s2));
    await ctx.close();
  }
  await browser.close();
})().catch(e => { console.error('PROBE ERROR', e.message); process.exit(1); });
