'use strict';
const fs=require('fs'),{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch();let passed=0,total=0;
 const check=(id,value)=>{total++;passed+=!!value;console.log((value?'PASS ':'FAIL ')+id);};
 try{
  const page=await browser.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  const html=fs.readFileSync(process.argv[2],'utf8');
  await page.route('**/*',r=>r.request().url().startsWith('http://pdf111.test/')?r.fulfill({contentType:'text/html',body:html}):r.abort());
  await page.goto('http://pdf111.test/');
  await page.waitForFunction(()=>window.__L5R_TEST__);
  check('PDF-DISABLED',await page.evaluate(()=>!window.__L5R_TEST__.PDF111.enabled()));
  check('PDF-NO-DISABLED-CONTROL',await page.locator('.pdf111-export').count()===0);
  check('PDF-NO-DISABLED-STYLES',await page.evaluate(()=>!document.documentElement.classList.contains('pdf111-enabled')));
  check('PDF-DISABLED-NO-ERRORS',errors.length===0);
 }finally{await browser.close();}
 console.log(passed+'/'+total+' checks passed');process.exitCode=passed===total?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
