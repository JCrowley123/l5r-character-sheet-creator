'use strict';
// B18 stage 1 (read-only inventory): shared helpers. Nothing here edits an application file.
// The repository root is found by walking up from this folder to build.py, so the scripts run from any worktree.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{pathToFileURL}=require('url');
const {chromium}=require('playwright');
let ROOT=__dirname;while(!fs.existsSync(path.join(ROOT,'build.py')))ROOT=path.dirname(ROOT);
const V=path.join(ROOT,'Versions');
const PF=path.join(V,'Part F — Cross-Platform Delivery','PART F — Phase 0 Source Reorganization for Maintainability');
const sheet=path.join(PF,'l5r-character-sheet.html');
const SRC=path.join(PF,'src');
const DENSE=JSON.parse(fs.readFileSync(path.join(V,'Part H — Sheet UI-UX','PART H — Phase 15 Implementation','Release 15a','A03 — Top-Aligned Columns and Compact Skill Cards','qa','a03-fixtures.json'),'utf8')).dense;
const sha=crypto.createHash('sha256').update(fs.readFileSync(sheet)).digest('hex');
const settle=p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function tab(p,label){await p.evaluate(async l=>{const C=window.__L5R_CAROUSEL__;C.goToTab(l);await C.whenSettled();},label);await settle(p);}
async function mode(p,m){await p.evaluate(m=>window.__L5R_TEST__.MODES12.set(m),m);await settle(p);}
// Opens the sheet as a player would: a fresh context, the splash gone, the character imported from a file.
async function open(b,phone,fixtureFile,name){
 const c=await b.newContext(phone?{viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2}:{viewport:{width:1440,height:1000},deviceScaleFactor:1});
 const p=await c.newPage();p.errors=[];p.on('pageerror',e=>p.errors.push(String(e)));p.on('dialog',d=>d.accept().catch(()=>{}));
 await p.goto(pathToFileURL(sheet).href,{waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready,null,{timeout:60000});
 await p.waitForFunction(()=>!document.getElementById('l5rSplash'),null,{timeout:30000});
 await p.evaluate(()=>document.fonts.ready);
 if(fixtureFile){await p.locator('#fileImport').setInputFiles(fixtureFile);await p.waitForFunction(n=>document.getElementById('f_name').value===n,name);await wait(500);}
 return {c,p};
}
module.exports={fs,path,chromium,ROOT,V,PF,SRC,sheet,DENSE,sha,settle,wait,tab,mode,open};
