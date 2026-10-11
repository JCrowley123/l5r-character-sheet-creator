'use strict';
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url'),{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch();try{
  const page=await browser.newPage({viewport:{width:1000,height:1000}});
  await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);
  await page.waitForFunction(()=>window.__L5R_TEST__&&window.__L5R_TEST__.CL11.ready);
  const data=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
  await page.evaluate(d=>{window.__L5R_TEST__.applyData(d);window.__L5R_TEST__.CL11.close();},data);
  await page.pdf({path:process.argv[4],format:'A4',printBackground:true});
  console.log('Printed sample character to A4 PDF.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
