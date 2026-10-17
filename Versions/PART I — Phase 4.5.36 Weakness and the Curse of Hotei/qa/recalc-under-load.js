'use strict';
// Measurement only (not a suite check): recalcAll() and one Trait keystroke under 4x CPU throttling, on a character with
// Weakness on Strength and Agility, Hotei's Curse and Bad Health (the rows the layer reads on every recalc).
// node recalc-under-load.js <sheet.html>  ->  one JSON line: median and worst ms of 30 recalcs and 30 keystrokes.
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
(async () => {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({viewport:{width:375, height:812}});
    const page = await context.newPage();
    await page.route('https://fonts.googleapis.com/**', r => r.abort());
    await page.route('https://fonts.gstatic.com/**', r => r.abort());
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);
    await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_CAROUSEL__?.isReady?.() &&
      (!window.__L5R_TEST__.CL11 || window.__L5R_TEST__.CL11.ready), null, {timeout:60000});
    await page.evaluate(() => {
      const T = window.__L5R_TEST__;
      T.CL11?.close?.(); T.resetToBaseline(); T.MODES12?.set('management'); T.clearAllRows?.();
      document.getElementById('trait_strength').value = 3; document.getElementById('trait_agility').value = 3;
      const add = (name, config) => { const lib = T.DISADV_LIBRARY.find(x => x.name === name);
        const div = T.makeEntry({name, cost:lib ? lib.cost : 0, desc:lib ? lib.desc : ''}, true);
        document.getElementById('disadvList').appendChild(div); if (config) T.writeAdvConfig(div, config.type, config); };
      add('Weakness', {type:'traitPick', trait:'Strength', value:'Strength'});
      add('Weakness', {type:'traitPick', trait:'Agility', value:'Agility'});
      add('Seven Fortunes’ Curse', {type:'fortunePick', fortune:'Hotei', value:'Hotei'});
      add('Bad Health');
      T.recalcAll();
    });
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', {rate:4});
    const result = await page.evaluate(async () => {
      const T = window.__L5R_TEST__, recalc = [], keys = [];
      const input = document.getElementById('trait_perception');
      for (let i = 0; i < 30; i++) {
        let t = performance.now(); T.recalcAll(); recalc.push(performance.now() - t);
        input.value = 2 + (i % 3);
        t = performance.now(); input.dispatchEvent(new Event('input', {bubbles:true})); keys.push(performance.now() - t);
        await new Promise(r => setTimeout(r, 0));
      }
      const stat = a => { const s = a.slice().sort((x, y) => x - y); return {median:+s[15].toFixed(1), worst:+s[29].toFixed(1)}; };
      return {recalc:stat(recalc), keystroke:stat(keys)};
    });
    await cdp.send('Emulation.setCPUThrottlingRate', {rate:1});
    console.log(JSON.stringify(result));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
