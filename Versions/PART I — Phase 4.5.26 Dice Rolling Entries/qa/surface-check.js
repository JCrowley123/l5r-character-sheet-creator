'use strict';
const assert=require('assert'),path=require('path');
const {open,reset,roll}=require('./roll-test-utils');
(async()=>{
 const surfaces=[];
 for(const file of process.argv.slice(2,4)){
  const {browser,page}=await open(file);
  try{
   surfaces.push(await page.evaluate(()=>({keys:Object.keys(window.__L5R_TEST__).sort(),registry:window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.map(x=>({id:x.id,priority:x.priority}))})));
   if(file===process.argv[3])for(const width of [390,1440]){
    await page.setViewportSize({width,height:844});await reset(page,['Sensation'],['Gaijin Name']);
    // Stop on the actual preview so the long informational lines are measured.
    await page.evaluate(()=>{const T=window.__L5R_TEST__;window.__rollTask=T.rollSkill('Perform', 'Awareness',0);});
    await page.locator('#rollPreviewGo').waitFor({state:'visible'});
    const before=await page.locator('#rollPreviewBody').evaluate(e=>({w:e.clientWidth,s:e.scrollWidth,text:e.textContent}));
    assert(before.s<=before.w+1 && before.text.includes('Sensation') && before.text.includes('Gaijin Name'),JSON.stringify(before));
    await page.screenshot({path:path.join(process.argv[4],`preview-${width}.png`)});
    await page.locator('#rollPreviewGo').click();await page.evaluate(()=>window.__rollTask);
    const after=await page.locator('#rollModalBody').evaluate(e=>({w:e.clientWidth,s:e.scrollWidth,text:e.textContent}));
    assert(after.s<=after.w+1 && after.text.includes('Gaijin Name'),JSON.stringify(after));
    await page.screenshot({path:path.join(process.argv[4],`result-${width}.png`)});
    console.log(`PASS preview/result fit at ${width}px`);
   }
   assert.deepStrictEqual(page.errors,[]);
  }finally{await browser.close();}
 }
 const [before,after]=surfaces;
 assert.deepStrictEqual(before.registry,after.registry);
 assert.deepStrictEqual(after.keys.filter(k=>!before.keys.includes(k)),['DICE4526','DICE_ENTRIES_ENABLED','RANKZERO','RANKZERO_ENABLED']);
 assert.deepStrictEqual(before.keys.filter(k=>!after.keys.includes(k)),[]);
 console.log(`PASS seam: ${before.keys.length} existing keys retained, exactly four new guarded keys; ${before.registry.length} registry contributors unchanged`);
})().catch(e=>{console.error(e);process.exitCode=1;});
