'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{pathToFileURL}=require('url');
const {chromium}=require('playwright');
const V='C:/Users/jcrow/l5r-release-15a-g5/Versions';
const sheet=path.join(V,'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html');
const KITSU=path.join(V,'BUGFIX — Older School Choices/qa/older-kitsu.l5r.json');
const DENSE=JSON.parse(fs.readFileSync(path.join(V,'Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A03 — Top-Aligned Columns and Compact Skill Cards/qa/a03-fixtures.json'),'utf8')).dense;
const sha=crypto.createHash('sha256').update(fs.readFileSync(sheet)).digest('hex');
const settle=p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function tab(p,label){await p.evaluate(async l=>{const C=window.__L5R_CAROUSEL__;C.goToTab(l);await C.whenSettled();},label);await settle(p);}
async function open(b,phone,fixture,name){
 const c=await b.newContext(phone?{viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2}:{viewport:{width:1440,height:1000},deviceScaleFactor:1});
 const p=await c.newPage();p.errors=[];p.on('pageerror',e=>p.errors.push(String(e)));p.on('dialog',d=>d.accept().catch(()=>{}));
 await p.goto(pathToFileURL(sheet).href,{waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready,null,{timeout:60000});
 await p.waitForFunction(()=>!document.getElementById('l5rSplash'),null,{timeout:30000});
 await p.evaluate(()=>document.fonts.ready);
 if(fixture){await p.locator('#fileImport').setInputFiles(fixture);await p.waitForFunction(n=>document.getElementById('f_name').value===n,name);await p.waitForTimeout(500);}
 return {c,p};
}
module.exports={fs,path,chromium,V,sheet,KITSU,DENSE,sha,settle,tab,open};
