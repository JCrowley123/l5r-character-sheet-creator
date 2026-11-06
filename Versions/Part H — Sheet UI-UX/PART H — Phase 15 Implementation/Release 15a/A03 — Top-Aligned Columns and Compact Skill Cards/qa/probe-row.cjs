'use strict';
// Scratch probe: one Skill card's DOM and screenshot on the phone (not a check).
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');const {chromium}=require('playwright');
const [sheet,out,mode,skill,open]=process.argv.slice(2);
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await c.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//,r=>r.abort('blockedbyclient'));
const p=await c.newPage();await p.goto(pathToFileURL(path.resolve(sheet)).href,{waitUntil:'domcontentloaded'});
await p.waitForFunction(()=>window.__L5R_TEST__&&window.__L5R_TEST__.CL11&&window.__L5R_TEST__.CL11.ready);await p.waitForFunction(()=>!document.getElementById('l5rSplash'));
const d=JSON.parse(fs.readFileSync(path.join(__dirname,'a03-fixtures.json'),'utf8')).longSkills;
await p.evaluate(d=>{const T=window.__L5R_TEST__;try{T.CL11.close()}catch(e){}T.applyData(d)},d);
await p.evaluate(m=>window.__L5R_TEST__.MODES12.set(m),mode);
await p.evaluate(async()=>{const C=window.__L5R_CAROUSEL__;C.goToTab('Skills');await C.whenSettled();});
const tr=await p.evaluateHandle(n=>[...document.querySelectorAll('#skillsBody>tr')].find(t=>t.querySelector('.sk-name').value===n),skill);
if(open)await tr.evaluate(t=>{const b=t.querySelector('.cs15-toggle');if(b)b.click();});
await tr.evaluate(t=>t.scrollIntoView());
fs.mkdirSync(out,{recursive:true});await tr.screenshot({path:path.join(out,mode+'-'+skill.replace(/\W+/g,'-')+(open?'-open':'')+'.png')});
console.log(await tr.evaluate(t=>t.outerHTML.replace(/\s+/g,' ')));await b.close();})();
