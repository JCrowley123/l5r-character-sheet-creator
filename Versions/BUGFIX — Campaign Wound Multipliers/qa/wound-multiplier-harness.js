const {chromium}=require('playwright'),{pathToFileURL}=require('url'),path=require('path');
const results=[];
function check(id,got,want){const ok=JSON.stringify(got)===JSON.stringify(want);results.push(ok);console.log((ok?'PASS ':'FAIL ')+id+(ok?'':' actual='+JSON.stringify(got)+' expected='+JSON.stringify(want)));}
(async()=>{const browser=await chromium.launch(),errors=[];try{
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);await page.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready,{timeout:60000});
 await page.evaluate(()=>{const T=window.__L5R_TEST__;if(T.CL11.isOpen())T.CL11.close();});
 async function c(id,code,want){let got;try{got=await page.evaluate(code=>{const T=window.__L5R_TEST__;T.MODES12.set('management');T.resetToBaseline();const W=T.WM7,L=T.WM7Logic;
  if(!W?.enabled())return null;const el=id=>document.getElementById(id),set=(id,v)=>el(id).value=String(v);return eval(code);
 },code);}catch(e){got={error:e.message};}check(id,got,want);}
 await c('WM-DEFAULT','T.computeWoundThresholds(2)',[10,14,18,22,26,30,34,38]);
 await c('WM-EARTH3','T.computeWoundThresholds(3)',[15,21,27,33,39,45,51,57]);
 await c('WM-X3','W.apply(3);T.computeWoundThresholds(2)',[10,16,22,28,34,40,46,52]);
 await c('WM-X4','W.apply(4);T.computeWoundThresholds(2)',[10,18,26,34,42,50,58,66]);
 await c('WM-X5','W.apply(5);T.computeWoundThresholds(2)',[10,20,30,40,50,60,70,80]);
 await c('WM-CUSTOM','W.apply(7);T.computeWoundThresholds(2)',[10,24,38,52,66,80,94,108]);
 await c('WM-HEALTHY-FIXED','[2,3,4,5,7].map(m=>L.thresholds(3,m)[0])',[15,15,15,15,15]);
 await c('WM-PICKER','[el("wm7-picker").multiple,Array.from(el("wm7-picker").options,o=>o.value)]',[false,['2','3','4','5','custom']]);
 await c('WM-APPLY-UI','set("wm7-picker","custom");el("wm7-picker").dispatchEvent(new Event("change",{bubbles:true}));set("wm7-custom",7);el("wm7-apply").click();[W.read(),el("wm7-custom-row").hidden,el("wm7-summary").textContent]',[7,false,'Healthy: Earth ×5 · Each later level: Earth ×7']);
 for(const [label,value] of [['ZERO','0'],['NEGATIVE','-3'],['DECIMAL','2.5'],['EXPONENT','1e2'],['EMPTY',''],['UNSAFE','9007199254740992']]){
  await c('WM-INVALID-'+label,`set('wm7-picker','custom');set('wm7-custom',${JSON.stringify(value)});el('wm7-apply').click();[W.read(),el('wm7-custom').value,el('wm7-error').textContent.length>0]`,[2,value,true]);
 }
 await c('WM-WOUNDS-PRESERVED','set("f_woundsTaken",17);W.apply(5);Number(el("f_woundsTaken").value)',17);
 await c('WM-SAVE-LOAD','W.apply(7);const saved=T.collectData();W.apply(3);const ok=T.applyData(saved);[ok!==false,W.read(),el("wm7-picker").value,el("wm7-custom").value,saved.schemaVersion]',[true,7,'custom','7',7]);
 await c('WM-OLD-DEFAULT','const old=T.collectData();old.schemaVersion=6;delete old.fields.f_woundMultiplier;W.apply(7);T.applyData(old);[W.read(),Object.hasOwn(old.fields,"f_woundMultiplier")]',[2,false]);
 await c('WM-RESET','W.apply(7);T.resetToBaseline();[W.read(),el("wm7-picker").value]',[2,'2']);
 await c('WM-INVALID-LOAD','W.apply(3);set("f_name","Keep me");const saved=T.collectData();saved.fields.f_name="Bad record";saved.fields.f_woundMultiplier="-2";[T.applyData(saved),W.read(),el("f_name").value]',[false,3,'Keep me']);
 await c('WM-PLAY-GATE','T.MODES12.set("play");[W.apply(5),W.read(),el("wm7-picker").disabled,el("wm7-apply").disabled]',[false,2,true,true]);
 await c('WM-BAD-HEALTH','const active=T.WND4529.active;try{T.WND4529.active=k=>k==="badHealth";W.apply(3);T.computeWoundThresholds(3);}finally{T.WND4529.active=active;}',[10,16,22,28,34,40,46,52]);
 await c('WM-PERMANENT','const active=T.WND4529.active;try{T.WND4529.active=k=>k==="permanent";W.apply(3);T.computeWoundThresholds(2);}finally{T.WND4529.active=active;}',[0,6,12,18,24,30,36,42]);
 await c('WM-BOUNDARY','set("f_woundsTaken",11);T.renderWounds();el("woundSummaryLine").textContent.includes("Nicked")',true);
 await c('WM-PDF','W.apply(4);T.PX7.snapshot().wounds',[10,18,26,34,42,50,58,66]);
 await c('WM-TOO-LARGE','[W.apply("9007199254740991"),W.read(),el("wm7-error").textContent.includes("too large")]',[false,2,true]);
 await c('WM-INVALID-EARTH','(()=>{try{L.thresholds(-1,2);return false;}catch(_){return true;}})()',true);
 await c('WM-ZERO-EARTH','T.computeWoundThresholds(0)',[0,0,0,0,0,0,0,0]);
 await c('WM-BLANK-TRAIT','set("trait_stamina","");T.recalcAll();[el("ring_earth").value,T.computeWoundThresholds(0)]',['0',[0,0,0,0,0,0,0,0]]);
 await c('WM-MANAGEMENT-VISIBLE','(async()=>{const C=window.__L5R_CAROUSEL__;await document.fonts.ready;C.goToTab("Rings & Traits");await C.whenSettled();return el("wm7-picker").getBoundingClientRect().width>0;})()',true);
 check('WM-NO-ERRORS',errors,[]);
}finally{await browser.close();}const n=results.filter(Boolean).length;console.log(n+'/31 checks passed');process.exitCode=n===31&&results.length===31?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
