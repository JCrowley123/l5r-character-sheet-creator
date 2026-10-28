// Per-card phone captures (each card centred, clear of the fixed toolbar) in both modes, plus the
// review follow-up's feedback states: an invalid draft's alert, the alert withdrawn, and Undo after it.
const {chromium}=require('playwright'),{pathToFileURL}=require('url'),path=require('path'),fs=require('fs');
(async()=>{const b=await chromium.launch();try{
 const p=await b.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(String(e)));
 await p.goto(pathToFileURL(path.resolve(process.argv[2])).href);await p.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready,null,{timeout:60000});
 const out=path.resolve(process.argv[3]);fs.mkdirSync(out,{recursive:true});
 const prepare=mode=>p.evaluate(async mode=>{const T=window.__L5R_TEST__;T.CL11.close();T.MODES12.set(mode);T.resetToBaseline();T.RP7.write('honor',7,5);T.RP7.write('glory',3,12);T.RP7.write('status',1,5);T.TA7.write(2,3);window.__L5R_CAROUSEL__.goToTab('Identity');await window.__L5R_CAROUSEL__.whenSettled();await document.fonts.ready;},mode);
 const shot=async(selector,name)=>{await p.evaluate(s=>document.querySelector(s).scrollIntoView({block:'center'}),selector);await p.evaluate(()=>new Promise(requestAnimationFrame));await p.locator(selector).screenshot({path:path.join(out,name)});};
 for(const mode of ['management','play']){await prepare(mode);for(const n of ['honor','glory','status','taint'])await shot('[data-cp7='+n+']',`${mode}-${n}.png`);}
 await prepare('management');
 // An empty notice with Undo hidden has no box at all, so it is recorded rather than photographed.
 const both=async name=>{await shot('[data-cp7=honor]',name+'-card.png');if(await p.locator('.cp7-feedback').isVisible())await shot('.cp7-feedback',name+'-notice.png');else console.log(name+': notice area empty and collapsed');};
 const field=await p.$('#ce7-honor-points');await field.fill('-1');await field.press('Enter');await both('feedback-invalid');
 await field.fill('5');await field.press('Enter');await both('feedback-withdrawn');
 await field.fill('2');await field.press('Enter');await field.fill('-1');await field.press('Enter');await p.click('#cp7-undo');await both('feedback-after-undo');
 const state=await p.evaluate(()=>({value:document.getElementById('ce7-honor-points').value,invalid:document.getElementById('ce7-honor-points').hasAttribute('aria-invalid'),notice:document.getElementById('cp7-notice').textContent}));
 console.log(JSON.stringify({state,errors}));console.log('captures written');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
