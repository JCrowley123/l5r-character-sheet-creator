const {chromium}=require('playwright'),{pathToFileURL}=require('url'),path=require('path');
const results=[];function check(id,got,want){const ok=JSON.stringify(got)===JSON.stringify(want);results.push(ok);console.log((ok?'PASS ':'FAIL ')+id+(ok?'':' actual='+JSON.stringify(got)+' expected='+JSON.stringify(want)));}
(async()=>{const b=await chromium.launch(),errors=[];try{const p=await b.newPage();p.on('pageerror',e=>errors.push(String(e)));await p.goto(pathToFileURL(path.resolve(process.argv[2])).href);await p.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready);
await p.evaluate(()=>{const T=window.__L5R_TEST__;if(T.CL11.isOpen())T.CL11.close();T.resetToBaseline();T.MODES12.set('management');});
async function c(id,code,want){check(id,await p.evaluate(code=>{const T=window.__L5R_TEST__,L=T.SC7Logic;const e=T.ADVANCED_SCHOOL_LIBRARY.find(x=>x.id==='imperial-scion');const allowed=()=>!T.SUP47.unmet(e).includes('Status Rank 4');const set=(r,p)=>{document.getElementById('f_statusRank').value=r;document.getElementById('f_statusPts').value=p;};return eval(code);},code),want);}
await c('SC-BELOW','L?.meets(3,4)??null',false);
await c('SC-AT','L?.meets(4,4)??null',true);
await c('SC-INVALID','L ? [null,"",4.5].map(x=>L.meets(x,4)) : null',[false,false,false]);
await c('SC-LOW','set(3,0);allowed()',false);
await c('SC-PENDING','set(3,21);allowed()',false);
await c('SC-FOUR','set(4,0);allowed()',true);
await c('SC-LOSS','set(4,0);T.RP7 ? (T.RP7.changePoints("status",-1),allowed()) : null',false);
await c('SC-RECOGNITION','set(3,21);T.RP7 ? (T.RP7.recognize("status"),allowed()) : null',true);
await c('SC-SHARED','(()=>{if(!T.RP7)return null;set(4,0);const old=T.RP7.rank;try{T.RP7.rank=()=>3;return allowed();}finally{T.RP7.rank=old;}})()',false);
await c('SC-INVALID-LIVE','set("",0);allowed()',false);
await c('SC-OTHER','T.SUP47.unmet(e).includes("membership in an Imperial family")',true);
check('SC-NO-ERRORS',errors,[]);
}finally{await b.close();}const n=results.filter(Boolean).length;console.log(n+'/12 checks passed');process.exitCode=n===12&&results.length===12?0:1;})().catch(e=>{console.error(e);process.exitCode=1;});
