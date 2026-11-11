'use strict';
// Does the page panel take focus, and draw its ring, when the School-choice dialog closes?
// Run on live G2 and on the G3 build: the mechanism is the same code in both.
// iPhone Safari does not focus a tapped button; it focuses the nearest focusable ancestor, which is the tab's
// page (tabindex 0). That is imitated here by focusing the page with a real click on its background, then opening the
// dialog without focusing its button.   node focus-ring.cjs <sheet.html> <fixture.json> <out.png>
const path=require('path'),{pathToFileURL}=require('url');const {chromium}=require('playwright');
const [sheet,fixture,shot]=process.argv.slice(2);
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});const p=await c.newPage();
await p.goto(pathToFileURL(path.resolve(sheet)).href,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready);
await p.locator('#fileImport').setInputFiles(fixture);await p.waitForFunction(()=>document.getElementById('f_name').value==='Older Kitsu test character');
await p.evaluate(()=>window.__L5R_TEST__.MODES12.set('management'));await p.getByRole('tab',{name:'Identity',exact:true}).tap();
const probe=()=>p.evaluate(()=>{const a=document.activeElement;return{tag:a.tagName,cls:String(a.className).slice(0,40),id:a.id,page:a.classList.contains('car-page'),ring:a.matches(':focus-visible'),outline:getComputedStyle(a).outlineStyle+' '+getComputedStyle(a).outlineWidth}});
const out={};
// 1. As a desktop browser does it: the button itself takes the focus, and gets it back.
await p.getByRole('button',{name:'Review starting spells',exact:true}).click();await p.locator('#sc8Done').click();out.buttonFocused=await probe();
// 2. As iPhone Safari does it: the page is the focused element when the dialog opens.
await p.evaluate(()=>{const pg=[...document.querySelectorAll('.car-page')].find(x=>x.contains(document.querySelector('#validationReport')));pg.focus({preventScroll:true});});
out.beforeOpen=await probe();
await p.evaluate(()=>window.__L5R_TEST__.SC8.open('Kitsu Shugenja','spell'));out.inDialog=await probe();
await p.locator('#sc8Done').tap();await p.waitForTimeout(150);out.afterLater=await probe();
await p.screenshot({path:shot});
// 3. The ring goes when focus moves on, as the owner saw on changing mode.
await p.evaluate(()=>window.__L5R_TEST__.MODES12.set('play'));await p.getByRole('button',{name:'Manage',exact:true}).tap().catch(()=>{});out.afterMode=await probe();
console.log(JSON.stringify(out));await b.close();})().catch(e=>{console.error(String(e).slice(0,500));process.exit(1)});
