const {chromium}=require('playwright'),{pathToFileURL}=require('url'),path=require('path');const results=[];
function check(id,got,want){const ok=JSON.stringify(got)===JSON.stringify(want);results.push(ok);console.log((ok?'PASS ':'FAIL ')+id+(ok?'':' actual='+JSON.stringify(got)+' expected='+JSON.stringify(want)));}
(async()=>{const b=await chromium.launch(),errors=[];try{const p=await b.newPage({viewport:{width:1280,height:960}});p.on('pageerror',e=>errors.push(String(e)));await p.goto(pathToFileURL(path.resolve(process.argv[2])).href);await p.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready,null,{timeout:60000});await p.evaluate(async()=>{const T=window.__L5R_TEST__;T.CL11.close();T.MODES12.set('management');await document.fonts.ready;const C=window.__L5R_CAROUSEL__;C.goToTab('Rings & Traits');await C.whenSettled();});
async function c(id,source,want){let got;try{got=await p.evaluate(source=>{const T=window.__L5R_TEST__,W=T.WP7;T.MODES12.set('management');T.resetToBaseline();if(!W?.enabled())return null;const el=id=>document.getElementById(id),totals=()=>[...el('wp7-thresholds').querySelectorAll('td')].map(e=>Number(e.textContent));return eval(source);},source);}catch(e){got={error:e.message};}check(id,got,want);}
await c('WP-LOCATION','el("wp7-preview").closest(".car-page").dataset.tabLabel','Rings & Traits');
await c('WP-HEADING','el("wp7-heading").textContent','Campaign wounds');
await c('WP-LABELS','[...el("wp7-thresholds").querySelectorAll("th")].map(e=>e.textContent)',['Healthy','Nicked','Grazed','Hurt','Injured','Crippled','Down','Out']);
for(const [m,want] of [[2,[10,14,18,22,26,30,34,38]],[3,[10,16,22,28,34,40,46,52]],[4,[10,18,26,34,42,50,58,66]],[5,[10,20,30,40,50,60,70,80]],[7,[10,24,38,52,66,80,94,108]]])await c('WP-X'+m,`T.WM7.apply(${m});totals()`,want);
await c('WP-APPLY-UI','el("wm7-picker").value="3";el("wm7-apply").click();totals()',[10,16,22,28,34,40,46,52]);
await c('WP-INVALID','T.WM7.apply(3);T.WM7.apply("2.5");[totals(),el("wm7-error").textContent.length>0]',[[10,16,22,28,34,40,46,52],true]);
await c('WP-MODIFIER','const old=T.WND4529.active;let values;try{T.WND4529.active=k=>k==="permanent";T.WM7.apply(3);values=totals();}finally{T.WND4529.active=old;T.renderWounds();}values',[0,6,12,18,24,30,36,42]);
await c('WP-LOAD','T.WM7.apply(4);const saved=T.collectData();T.WM7.apply(3);T.applyData(saved);totals()',[10,18,26,34,42,50,58,66]);
await c('WP-NO-DAMAGE-CHANGE','el("f_woundsTaken").value="17";T.WM7.apply(3);W.render();el("f_woundsTaken").value','17');
await c('WP-PLAY-POINTER','el("wp7-location").textContent.includes("Management → Rings & Traits → Campaign wounds")',true);
await c('WP-COMBAT-HIDDEN','document.querySelector(".car-page[data-tab-label=Combat]").getBoundingClientRect().width',0);
await c('WP-NO-SAVE-STATE','Object.keys(T.collectData().fields).some(k=>k.startsWith("wp7-"))',false);
await p.setViewportSize({width:320,height:844});await c('WP-PHONE','(async()=>{await document.fonts.ready;await new Promise(requestAnimationFrame);const e=el("wm7-panel"),t=el("wp7-preview");return t.getBoundingClientRect().width>0&&e.scrollWidth<=e.clientWidth;})()',true);
check('WP-NO-ERRORS',errors,[]);
}finally{await b.close();}const n=results.filter(Boolean).length;console.log(n+'/'+results.length+' checks passed');process.exitCode=n===18&&results.length===18?0:1;
})().catch(e=>{console.error(e);process.exitCode=1});
