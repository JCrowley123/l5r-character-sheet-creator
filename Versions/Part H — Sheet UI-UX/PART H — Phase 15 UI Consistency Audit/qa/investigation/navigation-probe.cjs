'use strict';
const {chromium}=require('C:/Users/jcrow/l5r-qa-tools/node_modules/playwright');
const {pathToFileURL}=require('url'),fs=require('fs'),path=require('path');
const sheet=path.resolve(__dirname,'../../../../Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html');
const report={sheet,started:new Date().toISOString(),cases:[]};
const save=()=>fs.writeFileSync(path.join(__dirname,'navigation-probe.json'),JSON.stringify(report,null,2)+'\n');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
  for(const mode of ['ordinary','hold-stylesheet','hold-font']){
    const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    const page=await context.newPage(),start=Date.now(),events=[],pending=new Set();
    const item={mode,events};report.cases.push(item);save();
    page.on('request',r=>{pending.add(r.url());if(!r.url().startsWith('data:'))events.push({event:'request',url:r.url(),type:r.resourceType(),ms:Date.now()-start})});
    page.on('requestfinished',r=>{pending.delete(r.url());events.push({event:'finished',url:r.url(),ms:Date.now()-start})});
    page.on('requestfailed',r=>{pending.delete(r.url());events.push({event:'failed',url:r.url(),reason:r.failure(),ms:Date.now()-start})});
    page.on('domcontentloaded',()=>events.push({event:'domcontentloaded',ms:Date.now()-start}));
    page.on('load',()=>events.push({event:'load',ms:Date.now()-start}));
    let release;
    const held=new Promise(resolve=>release=resolve);
    if(mode==='hold-stylesheet') await page.route('https://fonts.googleapis.com/**',async route=>{item.intercepted='stylesheet';await held;await route.fulfill({contentType:'text/css',body:''})});
    if(mode==='hold-font'){
      await page.route('https://fonts.googleapis.com/**',route=>route.fulfill({contentType:'text/css',body:'@font-face{font-family:"EB Garamond";src:url(https://fonts.gstatic.com/audit-held.woff2) format("woff2");font-display:swap}body{font-family:"EB Garamond",serif}'}));
      await page.route('https://fonts.gstatic.com/**',async route=>{item.intercepted='font';await held;await route.abort()});
    }
    await page.goto(pathToFileURL(sheet).href,{waitUntil:'commit',timeout:60000});
    try {await page.waitForFunction(()=>!!window.__L5R_TEST__?.CL11?.ready,null,{timeout:5000});item.readyBeforeRelease=true}
    catch(error){item.readyBeforeRelease=false;item.readyWait=String(error).split('\n')[0]}
    item.before=await page.evaluate(()=>({state:document.readyState,seam:!!window.__L5R_TEST__,ready:!!window.__L5R_TEST__?.CL11?.ready,fonts:document.fonts.status}));
    item.pendingBefore=[...pending];
    release();
    await page.waitForFunction(()=>!!window.__L5R_TEST__?.CL11?.ready,null,{timeout:10000});
    await page.waitForLoadState('load',{timeout:10000});
    item.after=await page.evaluate(()=>({state:document.readyState,ready:!!window.__L5R_TEST__?.CL11?.ready,fonts:document.fonts.status}));
    await context.close();save();console.log(mode,JSON.stringify({before:item.before,after:item.after,pendingBefore:item.pendingBefore}));
  }
}finally{await browser.close();report.finished=new Date().toISOString();save()}})().catch(e=>{report.error=String(e);save();console.error(e);process.exitCode=1});
