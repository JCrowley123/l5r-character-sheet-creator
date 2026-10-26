const {chromium}=require('playwright'),{pathToFileURL}=require('url'),fs=require('fs'),path=require('path');
(async()=>{const b=await chromium.launch();try{const p=await b.newPage({viewport:{width:1280,height:960}});await p.goto(pathToFileURL(process.argv[2]).href);await p.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready);
await p.evaluate(async()=>{const T=window.__L5R_TEST__;T.CL11.close();T.MODES12.set('management');T.resetToBaseline();await document.fonts.ready;const C=window.__L5R_CAROUSEL__;C.goToTab('Rings & Traits');await C.whenSettled();});
const panel=p.locator('#wm7-panel');await panel.scrollIntoViewIfNeeded();await panel.screenshot({path:path.join(process.argv[3],'desktop.png')});
await p.setViewportSize({width:390,height:844});await p.evaluate(async()=>{await document.fonts.ready;await new Promise(requestAnimationFrame)});await panel.scrollIntoViewIfNeeded();await panel.screenshot({path:path.join(process.argv[3],'phone.png')});
const size=await p.locator('#wm7-panel').evaluate(e=>({width:e.clientWidth,scroll:e.scrollWidth}));if(size.scroll>size.width)throw new Error('Wound settings overflow phone width');console.log('Desktop and 390px phone screenshots captured; no settings overflow.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
