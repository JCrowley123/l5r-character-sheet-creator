// Probe: repeat the App Bar harness's print -> screen switch (as in AB-PRINT-HIDDEN) on a phone-emulated page and
// record the page zoom after each; reports how often it is left zoomed, and by how much.
const {chromium} = require('playwright');
const {pathToFileURL} = require('url');
const [sheet, label, rounds] = [process.argv[2], process.argv[3], +(process.argv[4] || 60)];
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
  const pg = await ctx.newPage();
  await pg.goto(pathToFileURL(sheet).href);
  await pg.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready, null, {timeout: 60000});
  const zoomed = [];
  for(let i = 0; i < rounds; i++){
    await pg.emulateMedia({media: 'print'});
    const printWidth = await pg.evaluate(() => innerWidth);
    await pg.emulateMedia({media: 'screen'});
    await pg.setViewportSize({width: 320, height: 700});
    const s = await pg.evaluate(() => visualViewport.scale);
    await pg.setViewportSize({width: 390, height: 844});
    if(Math.abs(s - 1) > 0.01){
      zoomed.push({i, s: Math.round(s * 10000) / 10000, printWidth, ratio: Math.round(printWidth / 390 * 10000) / 10000});
      await pg.setViewportSize({width: 320, height: 700});
      await pg.setViewportSize({width: 390, height: 844});
      const after = await pg.evaluate(() => visualViewport.scale);
      zoomed[zoomed.length - 1].afterResize = Math.round(after * 10000) / 10000;
      if(Math.abs(after - 1) > 0.01) break;
    }
  }
  console.log(label, 'zoomed', zoomed.length + '/' + rounds, JSON.stringify(zoomed.slice(0, 4)));
  await browser.close();
})().catch(e => { console.error('PROBE ERROR', e.message); process.exit(1); });
