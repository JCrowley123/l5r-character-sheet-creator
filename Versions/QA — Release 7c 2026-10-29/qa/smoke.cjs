'use strict';
const {chromium}=require('playwright'),{pathToFileURL}=require('url'),path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.route('https://fonts.googleapis.com/**',r=>r.abort());await p.route('https://fonts.gstatic.com/**',r=>r.abort());
await p.goto(pathToFileURL(path.resolve(process.argv[2])).href,{waitUntil:'domcontentloaded',timeout:60000});
await p.waitForFunction(()=>{const T=window.__L5R_TEST__;return !!T&&!!window.__L5R_CAROUSEL__?.isReady?.()&&!document.querySelector('[id^=l5r-splash]');},null,{timeout:60000});
console.log(JSON.stringify(await p.evaluate(()=>{const T=window.__L5R_TEST__;return {LM7:T.LM7&&T.LM7.enabled(),RC7:T.RC7&&T.RC7.enabled(),EQ7:T.EQ7&&T.EQ7.enabled(),SS7:T.SS7&&T.SS7.enabled(),RF7:T.RF7&&T.RF7.enabled(),keys:Object.keys(T).length};})),errs);await b.close();})();
