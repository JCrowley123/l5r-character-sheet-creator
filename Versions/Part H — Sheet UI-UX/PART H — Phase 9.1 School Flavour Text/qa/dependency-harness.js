'use strict';
// Phase 9.1: the layer off, absent, or with its neighbours off. Only the School text changes; catalogues are untouched.
const fs=require('fs'),{chromium}=require('playwright');
const input=fs.readFileSync(process.argv[2],'utf8'),results=[];
function check(id,actual,want){const pass=JSON.stringify(actual)===JSON.stringify(want);results.push({id,pass});console.log((pass?'PASS ':'FAIL ')+id+(pass?'':' actual='+JSON.stringify(actual).slice(0,300)));}
const ON={panel:true,texts:105},NONE={panel:false,texts:0},API='Core Rulebook p.125';
async function main(){
 const browser=await chromium.launch();let control;
 try{
  for(const v of [
   {id:'CONTROL',api:API,shown:ON},
   {id:'OFF',off:'SCHOOL_FLAVOUR_ENABLED',api:null,shown:NONE},
   {id:'FRAGMENT-ABSENT',absent:true,api:null,shown:NONE},
   {id:'SEARCH-OFF',off:'SEARCH_ENABLED',api:API,shown:{panel:true,texts:0}},
   {id:'PAGE-OFF',off:'SEARCH_PAGE_ENABLED',api:API,shown:ON},
   {id:'REF1432-OFF',off:'SEARCH_REFERENCES_1432_ENABLED',api:API,shown:ON},
   {id:'CLAN-THEME-OFF',off:'CLAN_THEME_ENABLED',api:API,shown:ON}]){
    let html=input;
    if(v.off){const term='const '+v.off+' = true;';if(html.split(term).length!==2)throw Error('Non-unique switch '+v.off);html=html.replace(term,'const '+v.off+' = false;');}
    if(v.absent){const start='  // ============ PART H PHASE 9.1 — SCHOOL FLAVOUR TEXT ============',end='  // ============ END SCHOOLLORE9 ============';
      const a=html.indexOf(start),b=html.indexOf(end);if(a<0||b<a)throw Error('Missing own fragment');html=html.slice(0,a)+html.slice(b+end.length);}
    const context=await browser.newContext(),page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    await page.route('**/*',r=>r.request().url().startsWith('http://flavour91.test/')?r.fulfill({contentType:'text/html',body:html}):r.abort());
    await page.goto('http://flavour91.test/');await page.waitForFunction(()=>window.__L5R_TEST__&&window.__L5R_TEST__.CL11.ready,null,{timeout:60000});
    const got=await page.evaluate(()=>{
      const T=window.__L5R_TEST__,S=T.SEARCH14,all=S.query({limit:5000}).results.map(r=>S.get(r.id));
      const info=document.getElementById('cfs_schoolInfo');
      return {api:T.SCHOOLLORE9&&T.SCHOOLLORE9.entry('Agasha Shugenja')?T.SCHOOLLORE9.entry('Agasha Shugenja').source:null,
        shown:{panel:!!info.querySelector('.cfs-school-flavour'),texts:all.filter(r=>r.category==='schools'&&r.text.length).length},
        records:all.map(r=>{if(r.category==='schools')r.text=[];return r;}),
        panel:info.innerHTML.replace(/<br><span class="cfs-school-flavour">.*?<\/span><\/span>|<br><span class="cfs-school-flavour">[\s\S]*$/,''),
        libraries:[T.SCHOOL_LIBRARY,T.MINOR_CLAN_SCHOOL_LIBRARY,T.BROTHERHOOD_SCHOOL_LIBRARY]};
    });
    check('FLAV91-DEP-'+v.id+'-API',got.api,v.api);
    check('FLAV91-DEP-'+v.id+'-SHOWN',got.shown,v.shown);
    check('FLAV91-DEP-'+v.id+'-ERRORS',errors,[]);
    if(v.id==='CONTROL')control=got;
    if(v.id==='OFF'){
      check('FLAV91-ONLY-TEXT-CHANGED',[got.records,got.panel],[control.records,control.panel]);
      check('FLAV91-NO-CATALOGUE-MUTATION',got.libraries,control.libraries);
    }
    await context.close();
  }
 }finally{await browser.close();}
 const pass=results.filter(r=>r.pass).length;console.log(pass+'/'+results.length+' checks passed');process.exitCode=pass===results.length&&results.length===23?0:1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
