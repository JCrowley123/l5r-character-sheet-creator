'use strict';
const {chromium}=require('playwright'),path=require('path'),{pathToFileURL}=require('url');
let passed=0,total=0;
function check(id,actual,expected=true){total++;const ok=JSON.stringify(actual)===JSON.stringify(expected);passed+=ok;console.log(`${ok?'PASS':'FAIL'} ${id}${ok?'':` actual=${JSON.stringify(actual)} expected=${JSON.stringify(expected)}`}`);}
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:1000}});
  await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);
  await page.waitForFunction(()=>window.__L5R_TEST__&&window.__L5R_TEST__.CL11.ready);
  const before=await page.evaluate(()=>JSON.stringify(window.__L5R_TEST__.collectData()));
  check('PRINT-SWITCH',await page.evaluate(()=>!!window.__L5R_TEST__.PRINTRINGS&&window.__L5R_TEST__.PRINTRINGS.enabled()));
  const screen=await page.evaluate(()=>Array.from(document.querySelectorAll('.rings > .ring-card')).map(el=>['::before','::after'].map(p=>getComputedStyle(el,p).display)));
  check('PRINT-FIVE-CARDS',screen.length,5);
  check('PRINT-SCREEN-ART-KEPT',screen.every(pair=>pair.every(x=>x!=='none')));
  await page.emulateMedia({media:'print'});
  const printed=await page.evaluate(()=>Array.from(document.querySelectorAll('.rings > .ring-card')).map(el=>({position:getComputedStyle(el).position,layers:['::before','::after'].map(p=>getComputedStyle(el,p).display)})));
  check('PRINT-SYMBOLS-HIDDEN',printed.length===5&&printed.every(x=>x.layers[0]==='none'));
  check('PRINT-WASH-HIDDEN',printed.length===5&&printed.every(x=>x.layers[1]==='none'));
  check('PRINT-STATIC-CARDS-KEPT',printed.every(x=>x.position==='static'));
  if(process.argv[3])await page.pdf({path:path.resolve(process.argv[3]),format:'A4',printBackground:true});
  check('PRINT-CHARACTER-UNCHANGED',await page.evaluate(()=>JSON.stringify(window.__L5R_TEST__.collectData())),before);
  await page.emulateMedia({media:'screen'});
  check('PRINT-SCREEN-RESTORED',await page.evaluate(()=>Array.from(document.querySelectorAll('.rings > .ring-card')).map(el=>['::before','::after'].map(p=>getComputedStyle(el,p).display))),screen);
 }catch(error){check('PRINT-EXCEPTION',String(error.stack),'no exception');}finally{await browser.close();}
 console.log(`${passed}/${total} checks passed`);process.exitCode=passed===total&&total>0?0:1;
})();
