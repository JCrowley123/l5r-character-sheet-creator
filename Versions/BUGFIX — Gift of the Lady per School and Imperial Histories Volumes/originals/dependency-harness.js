'use strict';
// Phase 14.3b: the layer off, absent, or with its neighbours off. Only citations change; catalogues are untouched.
const fs=require('fs'),{chromium}=require('playwright');
const input=fs.readFileSync(process.argv[2],'utf8'),results=[];
function check(id,actual,want){const pass=JSON.stringify(actual)===JSON.stringify(want);results.push({id,pass});console.log((pass?'PASS ':'FAIL ')+id+(pass?'':' actual='+JSON.stringify(actual).slice(0,300)));}
// Citations in this layer's scope: Schools, Clans, Families, School Technique records and each School's Technique notes.
// ON: 105 Schools + 93 Clans and Families + 348 Technique records (72 catalogue + 276 oracle); notes 72 + 277 oracle.
// OFF leaves only the catalogue's own: two Schools, 72 Technique records and 72 notes.
const ON={records:546,notes:349},OWN={records:74,notes:72},NONE={records:0,notes:0};
async function main(){
 const browser=await chromium.launch();let control;
 try{
  for(const v of [
   {id:'CONTROL',api:'Core Rulebook p.125',count:ON},
   {id:'OFF',off:'SEARCH_REFERENCES_1432_ENABLED',api:'',count:OWN},
   {id:'FRAGMENT-ABSENT',absent:true,api:null,count:OWN},
   {id:'SEARCH-OFF',off:'SEARCH_ENABLED',api:'Core Rulebook p.125',count:NONE},
   {id:'PAGE-OFF',off:'SEARCH_PAGE_ENABLED',api:'Core Rulebook p.125',count:ON},
   {id:'FACETS-OFF',off:'SEARCH_FACETS_ENABLED',api:'Core Rulebook p.125',count:ON},
   {id:'REF142-OFF',off:'SEARCH_REFERENCES_ENABLED',api:'Core Rulebook p.125',count:ON},
   {id:'REF143-OFF',off:'SEARCH_REFERENCES_143_ENABLED',api:'Core Rulebook p.125',count:ON}]){
    let html=input;
    if(v.off){const term='const '+v.off+' = true;';if(html.split(term).length!==2)throw Error('Non-unique switch '+v.off);html=html.replace(term,'const '+v.off+' = false;');}
    if(v.absent){const start='  // ============ PART K PHASE 14.3.2 — SEARCH REFERENCES: SCHOOLS, TECHNIQUES, CLANS AND FAMILIES ============',end='  // ============ END SCHOOLREF1432 ============';
      const a=html.indexOf(start),b=html.indexOf(end);if(a<0||b<a)throw Error('Missing own fragment');html=html.slice(0,a)+html.slice(b+end.length);}
    const context=await browser.newContext(),page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    await page.route('**/*',r=>r.request().url().startsWith('http://references1432.test/')?r.fulfill({contentType:'text/html',body:html}):r.abort());
    await page.goto('http://references1432.test/');await page.waitForFunction(()=>window.__L5R_TEST__&&window.__L5R_TEST__.CL11.ready,null,{timeout:60000});
    const got=await page.evaluate(()=>{
      const T=window.__L5R_TEST__,S=T.SEARCH14,all=S.query({limit:5000}).results.map(r=>S.get(r.id));
      const own=r=>r.category==='schools'||r.category==='clans'||r.type==='School Technique';
      const notes=r=>r.category==='schools'?r.sections.flatMap(s=>s.items):[];
      return {api:T.SCHOOLREF1432?T.SCHOOLREF1432.source('schools','Agasha Shugenja'):null,
        count:{records:all.filter(r=>own(r)&&r.source).length,notes:all.flatMap(notes).filter(i=>i.note).length},
        records:all.map(r=>{if(own(r))r.source='';notes(r).forEach(i=>{i.note='';});return r;}),
        libraries:[T.SCHOOL_LIBRARY,T.MINOR_CLAN_SCHOOL_LIBRARY,T.BROTHERHOOD_SCHOOL_LIBRARY,T.FAMILY_LIBRARY,T.MINOR_CLAN_LIBRARY]};
    });
    check('REF1432-DEP-'+v.id+'-API',got.api,v.api);
    check('REF1432-DEP-'+v.id+'-CITATIONS',got.count,v.count);
    check('REF1432-DEP-'+v.id+'-ERRORS',errors,[]);
    if(v.id==='CONTROL')control=got;
    if(v.id==='OFF'){
      check('REF1432-ONLY-CITATIONS-CHANGED',got.records,control.records);
      check('REF1432-NO-CATALOGUE-MUTATION',got.libraries,control.libraries);
    }
    await context.close();
  }
 }finally{await browser.close();}
 const pass=results.filter(r=>r.pass).length;console.log(pass+'/'+results.length+' checks passed');process.exitCode=pass===results.length&&results.length===26?0:1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
