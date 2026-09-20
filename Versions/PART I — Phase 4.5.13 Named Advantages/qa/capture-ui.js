'use strict';
// Optional visual inspection. Writes generated PNGs only to a fresh OS temporary directory.
const {chromium}=require('playwright');
const {pathToFileURL}=require('url');
const fs=require('fs'),os=require('os'),path=require('path');
(async()=>{
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'l5r-named-visual-'));
  const browser=await chromium.launch(process.env.L5R_CHROME?{executablePath:process.env.L5R_CHROME}:{});
  try {
    const page=await browser.newPage({viewport:{width:375,height:812}});
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>!!window.__L5R_TEST__);
    await page.evaluate(()=>{
      window.__L5R_TEST__.resetToBaseline();
      const select=document.getElementById('advQuickAdd');select.value='Forbidden Knowledge';
      select.dispatchEvent(new Event('change',{bubbles:true}));
    });
    await page.locator('#named4513Subject').fill('Lore: Lying Darkness');
    await page.locator('#named4513Notes').fill('Agreed with the GM: manage the Lore benefit manually.');
    await page.screenshot({path:path.join(directory,'knowledge-modal-375.png')});
    await page.locator('#advConfigGrid .named4513-info').click();
    await page.screenshot({path:path.join(directory,'knowledge-information-375.png')});
    await page.locator('#stanceInfoClose').click();
    await page.locator('#advConfigConfirm').click();
    await page.locator('#advList .entry').screenshot({path:path.join(directory,'knowledge-row-375.png')});
    console.log(directory);
    console.log('Loaded webfonts: '+await page.evaluate(()=>[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family).join(', ')));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
