'use strict';
// Scratch probe: every carousel-page grid whose columns start at different heights (desktop, dense character).
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1440,height:1000}});
await c.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//,r=>r.abort('blockedbyclient'));
const p=await c.newPage();await p.goto(pathToFileURL(path.resolve(process.argv[2])).href,{waitUntil:'domcontentloaded'});
await p.waitForFunction(()=>window.__L5R_TEST__&&window.__L5R_TEST__.CL11&&window.__L5R_TEST__.CL11.ready);await p.waitForFunction(()=>!document.getElementById('l5rSplash'));
const d=JSON.parse(fs.readFileSync(path.join(__dirname,'a03-fixtures.json'),'utf8')).longSkills;
await p.evaluate(d=>{const T=window.__L5R_TEST__;try{T.CL11.close()}catch(e){}T.applyData(d)},d);
for(const mode of ['play','management']){await p.evaluate(m=>window.__L5R_TEST__.MODES12.set(m),mode);
const tabs=await p.evaluate(()=>window.__L5R_CAROUSEL__.getTabs().filter(t=>!t.panel.hidden).map(t=>t.label));
for(const t of tabs){await p.evaluate(async l=>{const C=window.__L5R_CAROUSEL__;C.goToTab(l);await C.whenSettled();},t);
const r=await p.evaluate(()=>{const page=[...document.querySelectorAll('.car-page:not([data-clone])')].find(p=>Math.abs(p.getBoundingClientRect().left)<5);
return [...page.querySelectorAll('.grid')].map(g=>{const kids=[...g.children].filter(k=>k.getBoundingClientRect().height>0);
const rows={};kids.forEach(k=>{const r=k.getBoundingClientRect();const key=Math.round(r.bottom);(rows[key]=rows[key]||[]).push(k)});
const tops=kids.map(k=>Math.round(k.getBoundingClientRect().top));const hs=kids.map(k=>Math.round(k.getBoundingClientRect().height));
const spread=Math.max(...tops)-Math.min(...tops);return {cls:g.className,id:g.id,kids:kids.length,align:getComputedStyle(g).alignItems,tops,hs,nonField:kids.filter(k=>!k.classList.contains('field')).length}}).filter(x=>x.kids>1&&x.nonField>0&&new Set(x.hs).size>1)});
if(r.length)console.log(mode,t,JSON.stringify(r));}}
await b.close();})();
