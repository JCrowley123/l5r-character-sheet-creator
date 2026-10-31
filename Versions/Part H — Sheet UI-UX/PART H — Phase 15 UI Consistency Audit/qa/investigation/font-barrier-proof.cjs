'use strict';
const {chromium}=require('C:/Users/jcrow/l5r-qa-tools/node_modules/playwright');
const {pathToFileURL}=require('url'),fs=require('fs'),path=require('path');
const sheet=path.resolve(__dirname,'../../../../Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html');
const report={started:new Date().toISOString(),events:[]};
const save=()=>fs.writeFileSync(path.join(__dirname,'font-barrier-proof.json'),JSON.stringify(report,null,2)+'\n');
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  try {
    const context=await browser.newContext();
    const page=await context.newPage(),start=Date.now(),pending=new Set();
    page.on('request',r=>pending.add(r.url()));
    page.on('requestfinished',r=>pending.delete(r.url()));
    page.on('requestfailed',r=>pending.delete(r.url()));
    for(const event of ['domcontentloaded','load']) page.on(event,()=>report.events.push({event,ms:Date.now()-start}));
    let release;const held=new Promise(resolve=>release=resolve);
    await context.route('https://fonts.googleapis.com/**',route=>route.fulfill({contentType:'text/css',body:'@font-face{font-family:"EB Garamond";src:url(https://fonts.gstatic.com/audit-held.woff2) format("woff2");font-display:swap}body{font-family:"EB Garamond",serif}'}));
    await context.route('https://fonts.gstatic.com/**',async route=>{report.fontIntercepted=true;await held;await route.abort()});
    await page.goto(pathToFileURL(sheet).href,{waitUntil:'commit',timeout:60000});
    await page.waitForFunction(()=>!!window.__L5R_TEST__?.CL11?.ready,null,{timeout:60000});
    await page.waitForLoadState('domcontentloaded',{timeout:60000});
    // A diagnostic observation interval, not a harness timeout or retry.
    await new Promise(resolve=>setTimeout(resolve,1000));
    report.beforeRelease=await page.evaluate(()=>({state:document.readyState,ready:!!window.__L5R_TEST__?.CL11?.ready,fonts:document.fonts.status}));
    report.pendingBeforeRelease=[...pending];
    report.eventsBeforeRelease=[...report.events];
    report.releasedAtMs=Date.now()-start;
    release();
    await page.waitForLoadState('load',{timeout:60000});
    report.afterRelease=await page.evaluate(()=>({state:document.readyState,ready:!!window.__L5R_TEST__?.CL11?.ready,fonts:document.fonts.status}));
    report.proven=report.fontIntercepted&&report.beforeRelease.state==='interactive'&&report.beforeRelease.ready&&report.pendingBeforeRelease.length===1&&report.pendingBeforeRelease[0]==='https://fonts.gstatic.com/audit-held.woff2'&&!report.eventsBeforeRelease.some(e=>e.event==='load')&&report.afterRelease.state==='complete';
    if(!report.proven)throw Error('Held-font barrier proof did not satisfy all evidence conditions');
  } finally {await browser.close();report.finished=new Date().toISOString();save()}
})().catch(e=>{report.error=String(e);save();console.error(e);process.exitCode=1});
