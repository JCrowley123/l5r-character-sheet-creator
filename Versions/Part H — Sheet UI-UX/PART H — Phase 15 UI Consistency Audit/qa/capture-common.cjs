'use strict';
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('C:/Users/jcrow/l5r-qa-tools/node_modules/playwright');
const Q = __dirname, A = path.dirname(Q), V = path.resolve(Q, '../../..');
const sheet = path.join(V, 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html');
async function open(device='phone', fixture='dense-audit-fixture.json') {
  const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  const context = await browser.newContext(device==='phone' ? {viewport:{width:390,height:844},isMobile:true,hasTouch:true} : {viewport:{width:1440,height:1000}});
  const page = await context.newPage(); page.setDefaultTimeout(15000);
  const errors=[]; page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(pathToFileURL(sheet).href,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready);
  await page.waitForFunction(()=>!document.getElementById('l5rSplash'));
  if(fixture) await page.evaluate(d=>{const T=window.__L5R_TEST__;T.CL11.close();T.applyData(d)},JSON.parse(fs.readFileSync(path.join(Q,fixture),'utf8')));
  async function snap(name,selector) {
    await page.evaluate(()=>new Promise(requestAnimationFrame));
    await page.screenshot({path:path.join(A,'screenshots',name+'.png')});
    const observation=await page.evaluate(selector=>{const root=selector?document.querySelector(selector):document.body;
      if(!root)return {missingScope:selector};
      return {text:root.innerText,viewport:{width:innerWidth,height:innerHeight},fonts:[...document.fonts].map(f=>({family:f.family,status:f.status})),
        controls:[...root.querySelectorAll('button,input,select,textarea,a,[role=button]')].map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {id:e.id,tag:e.tagName,text:(e.innerText||e.getAttribute('aria-label')||e.title||e.type||'').slice(0,120),value:e.value,width:r.width,height:r.height,x:r.x,y:r.y,font:s.fontSize,touch:s.touchAction,visible:r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'}})}},selector);
    fs.writeFileSync(path.join(Q,name+'.json'),JSON.stringify({name,device,fixture,errors,...observation},null,2)+'\n');
  }
  async function tab(label,mode='management') { await page.evaluate(async({label,mode})=>{const T=window.__L5R_TEST__;T.CL11.close();T.MODES12.set(mode);const C=window.__L5R_CAROUSEL__;C.goToTab(label);await C.whenSettled()}, {label,mode}); }
  return {browser,context,page,snap,tab,A,Q,V,errors};
}
module.exports={open,A,Q,V,sheet};
