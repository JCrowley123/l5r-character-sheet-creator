'use strict';
// B18 mock-ups: shared helpers. The inventory's helpers (paths, the dense character, tab and mode switches) with the
// phone at 375 x 812 (touch, scale 2) and the laptop at 1440 x 1000. Nothing here edits an application file: the sheet is
// opened from the file and the character is imported from a file, as a player would.
const I=require('../inventory/common.cjs');
const {fs,path,chromium,sheet,sha,settle,wait,tab,mode}=I;
const {pathToFileURL}=require('url');
const PHONE={viewport:{width:375,height:812},isMobile:true,hasTouch:true,deviceScaleFactor:2};
const LAPTOP={viewport:{width:1440,height:1000},deviceScaleFactor:1};
async function open(b,phone,fixtureFile,name){
 const c=await b.newContext(phone?PHONE:LAPTOP);
 const p=await c.newPage();p.errors=[];p.on('pageerror',e=>p.errors.push(String(e)));
 // The sheet's own question windows are page elements; a native dialog (none expected) is accepted and recorded.
 p.dialogs=[];p.on('dialog',d=>{p.dialogs.push(d.message());d.accept().catch(()=>{});});
 await p.goto(pathToFileURL(sheet).href,{waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready,null,{timeout:60000});
 await p.waitForFunction(()=>!document.getElementById('l5rSplash'),null,{timeout:30000});
 await p.evaluate(()=>document.fonts.ready);
 if(fixtureFile){await p.locator('#fileImport').setInputFiles(fixtureFile);await p.waitForFunction(n=>document.getElementById('f_name').value===n,name);await wait(500);}
 return {c,p};
}
module.exports=Object.assign({},I,{open,PHONE,LAPTOP,pathToFileURL});
