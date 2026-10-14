'use strict';
const fs=require('fs'),{chromium}=require('playwright');
const input=fs.readFileSync(process.argv[2],'utf8'),results=[];
function check(id,actual,want){const pass=JSON.stringify(actual)===JSON.stringify(want);results.push({id,pass});console.log((pass?'PASS ':'FAIL ')+id+(pass?'':' actual='+JSON.stringify(actual).slice(0,300)));}
async function main(){
 const browser=await chromium.launch();let control;
 try{
  for(const v of [
   {id:'CONTROL',api:'Core Rulebook p.259',count:90},
   {id:'OFF',off:'SEARCH_REFERENCES_ENABLED',api:'',count:0},
   {id:'FRAGMENT-ABSENT',absent:true,api:null,count:0},
   {id:'SEARCH-OFF',off:'SEARCH_ENABLED',api:'Core Rulebook p.259',count:0},
   {id:'PAGE-OFF',off:'SEARCH_PAGE_ENABLED',api:'Core Rulebook p.259',count:90},
   {id:'FACETS-OFF',off:'SEARCH_FACETS_ENABLED',api:'Core Rulebook p.259',count:90}]){
    let html=input;
    if(v.off){const term='const '+v.off+' = true;';if(html.split(term).length!==2)throw Error('Non-unique switch '+v.off);html=html.replace(term,'const '+v.off+' = false;');}
    if(v.absent){const start='  // ============ PART K PHASE 14.2 — SEARCH REFERENCES ============',end='  // ============ END SEARCHREF142 ============';
      const a=html.indexOf(start),b=html.indexOf(end);if(a<0||b<a)throw Error('Missing own fragment');html=html.slice(0,a)+html.slice(b+end.length);}
    const context=await browser.newContext(),page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    await page.route('**/*',r=>r.request().url().startsWith('http://references.test/')?r.fulfill({contentType:'text/html',body:html}):r.abort());
    await page.goto('http://references.test/');await page.waitForFunction(()=>window.__L5R_TEST__&&window.__L5R_TEST__.CL11.ready,null,{timeout:60000});
    const got=await page.evaluate(()=>{
      const T=window.__L5R_TEST__,S=T.SEARCH14, all=S.query({limit:5000}).results.map(r=>S.get(r.id));
      return {api:T.SEARCHREF142?T.SEARCHREF142.source('kata','Striking as Air'):null,
        count:all.filter(r=>['kata','kiho'].includes(r.category)&&r.source).length,
        records:all.map(r=>{if(['kata','kiho'].includes(r.category))r.source='';return r;}),
        libraries:[T.KATA_LIBRARY,T.KIHO_LIBRARY]};
    });
    check('REF-DEP-'+v.id+'-API',got.api,v.api);
    check('REF-DEP-'+v.id+'-CITATIONS',got.count,v.count);
    check('REF-DEP-'+v.id+'-ERRORS',errors,[]);
    if(v.id==='CONTROL')control=got;
    if(v.id==='OFF'){
      check('REF-ONLY-CITATIONS-CHANGED',got.records,control.records);
      check('REF-NO-CATALOGUE-MUTATION',got.libraries,control.libraries);
    }
    await context.close();
  }
 }finally{await browser.close();}
 const pass=results.filter(r=>r.pass).length;console.log(pass+'/'+results.length+' checks passed');process.exitCode=pass===results.length?0:1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
