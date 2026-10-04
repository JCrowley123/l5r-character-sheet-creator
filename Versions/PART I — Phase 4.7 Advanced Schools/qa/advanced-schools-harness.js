'use strict';
// Phase 4.7's initial capability oracle is deliberately run on the preceding build.
// Each missing capability is a failure, never a skipped passing check.
const {chromium}=require('playwright');
const {pathToFileURL}=require('url');
const path=require('path');
const results=[];
function check(id,actual,expected=true){
 if(results.some(r=>r.id===id))throw Error('Duplicate check '+id);
 const pass=JSON.stringify(actual)===JSON.stringify(expected);results.push({id,pass});
 console.log((pass?'PASS ':'FAIL ')+id+(pass?'':' actual='+JSON.stringify(actual)+' expected='+JSON.stringify(expected)));
}
async function section(id,fn){try{await fn();}catch(e){check(id+'-EXCEPTION',String(e.stack||e),'no exception');}}
(async()=>{
 const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];
 page.on('pageerror',e=>errors.push(String(e)));page.setDefaultTimeout(8000);
 await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.route('https://fonts.gstatic.com/**',r=>r.abort());
 try{
  await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);
  await page.waitForFunction(()=>window.__L5R_TEST__&&window.__L5R_CAROUSEL__?.isReady?.()&&(!window.__L5R_TEST__.CL11||window.__L5R_TEST__.CL11.ready));
  const caps=await page.evaluate(()=>{const T=window.__L5R_TEST__;return {api:!!T.AS47,library:Array.isArray(T.ADVANCED_SCHOOL_LIBRARY),field:!!document.getElementById('f_advancedSchoolData'),record:typeof T.AS47?.record==='function',rank:typeof T.AS47?.rank==='function',unmet:typeof T.AS47?.unmet==='function',enter:typeof T.AS47?.enter==='function',refresh:typeof T.AS47?.refresh==='function'};});
  for(const [id,actual]of Object.entries(caps))check('AS47-CAPABILITY-'+id,actual);
  if(caps.api&&caps.library&&caps.field&&caps.enter&&caps.rank&&caps.unmet){
   check('AS47-CORE-COUNT',await page.evaluate(()=>window.__L5R_TEST__.ADVANCED_SCHOOL_LIBRARY.length),9);
   await require('./behaviour-checks')(page,check,section);
  }
  check('AS47-NO-PAGE-ERRORS',errors,[]);
 }finally{await browser.close();}
 const passed=results.filter(r=>r.pass).length;console.log(`${passed}/${results.length} checks passed`);process.exitCode=passed===results.length&&passed>0?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
