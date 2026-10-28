const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const url='https://l5r-character-sheet-creator.pages.dev/';

const out=process.argv[2];
if(!out)throw Error('Supply the release evidence directory');
const expected=JSON.parse(fs.readFileSync(path.join(out,'live-verification.json'),'utf8')).page_sha256;
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const browser=await chromium.launch();const checks=[],errors=[];
 const check=(name,ok)=>{checks.push({name,passed:!!ok});console.log((ok?'PASS ':'FAIL ')+name);};
 try{
  const context=await browser.newContext({viewport:{width:390,height:844}});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
  const inspector=await context.newCDPSession(page);
  await inspector.send('Network.enable',{maxTotalBufferSize:256*1024*1024,maxResourceBufferSize:128*1024*1024});
  let documentRequest;
  inspector.on('Network.responseReceived',e=>{if(e.type==='Document' && e.response.url===url)documentRequest=e.requestId;});
  async function documentBody(){if(!documentRequest)throw Error('Missing document request ID');const data=await inspector.send('Network.getResponseBody',{requestId:documentRequest});return Buffer.from(data.body,data.base64Encoded?'base64':'utf8');}
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  check('Production URL returns HTTP 200',response.status()===200);
  check('Browser response matches release hash',hash(await documentBody())===expected);
  await page.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready,null,{timeout:60000});
  check('Production app initializes',await page.evaluate(()=>window.__L5R_TEST__.CL11.ready));
  check('Production PDF export is enabled',await page.evaluate(()=>window.__L5R_TEST__?.PX7?.enabled()===true));
  check('Earlier 7a layers still enabled on production',await page.evaluate(()=>{const T=window.__L5R_TEST__;return [T.WM7,T.CP7,T.PF7Writer,T.PDA7,T.PS7,T.CE7,T.WP7].every(x=>x?.enabled()===true)}));
  check('All eight Release 7b.1 layers enabled on production',await page.evaluate(()=>{const T=window.__L5R_TEST__;return [T.VR7,T.HT7,T.SL7,T.GI7,T.AP7,T.WR7,T.JR7,T.AG7].every(x=>x?.enabled()===true)}));
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:60000});
  check('Production service worker controls page',await page.evaluate(()=>!!navigator.serviceWorker.controller));
  await context.setOffline(true);
  const offline=await page.reload({waitUntil:'domcontentloaded',timeout:60000});
  check('Offline reload served by service worker',offline.fromServiceWorker());
  check('Offline HTML matches release hash',hash(await documentBody())===expected);
  await page.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready,null,{timeout:60000});
  check('Offline app initializes',await page.evaluate(()=>window.__L5R_TEST__.CL11.ready));
  check('No uncaught page errors',errors.length===0);
 }catch(e){errors.push(String(e));check('Smoke completed without exception',false);}
 finally{await browser.close();}
 const report={url,checked_utc:new Date().toISOString(),expected_page_sha256:expected,checks,errors,passed:checks.length===11&&checks.every(x=>x.passed),scope:'Fresh desktop Chrome context at 390px, real production URL and offline reload; not owner iPhone acceptance.'};
 fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'live-browser-smoke.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report,null,2));process.exitCode=report.passed?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
