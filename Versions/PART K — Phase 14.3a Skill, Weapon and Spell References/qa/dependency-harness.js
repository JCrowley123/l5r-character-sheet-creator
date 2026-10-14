'use strict';
const fs=require('fs'),{chromium}=require('playwright');
const input=fs.readFileSync(process.argv[2],'utf8'),results=[];
function check(id,actual,want){const pass=JSON.stringify(actual)===JSON.stringify(want);results.push({id,pass});console.log((pass?'PASS ':'FAIL ')+id+(pass?'':' actual='+JSON.stringify(actual).slice(0,300)));}
async function main(){
 const browser=await chromium.launch();let control;
 try{
  for(const v of [
   {id:'CONTROL',api:'Core Rulebook p.141',count:356},
   {id:'OFF',off:'SEARCH_REFERENCES_143_ENABLED',api:'',count:0},
   {id:'FRAGMENT-ABSENT',absent:true,api:null,count:0},
   {id:'SEARCH-OFF',off:'SEARCH_ENABLED',api:'Core Rulebook p.141',count:0},
   {id:'PAGE-OFF',off:'SEARCH_PAGE_ENABLED',api:'Core Rulebook p.141',count:356},
   {id:'FACETS-OFF',off:'SEARCH_FACETS_ENABLED',api:'Core Rulebook p.141',count:356},
   {id:'REF142-OFF',off:'SEARCH_REFERENCES_ENABLED',api:'Core Rulebook p.141',count:356}]){
    let html=input;
    if(v.off){const term='const '+v.off+' = true;';if(html.split(term).length!==2)throw Error('Non-unique switch '+v.off);html=html.replace(term,'const '+v.off+' = false;');}
    if(v.absent){const start='  // ============ PART K PHASE 14.3.1 — SEARCH REFERENCES: SKILLS, WEAPONS AND SPELLS ============',end='  // ============ END SEARCHREF143 ============';
      const a=html.indexOf(start),b=html.indexOf(end);if(a<0||b<a)throw Error('Missing own fragment');html=html.slice(0,a)+html.slice(b+end.length);}
    const context=await browser.newContext(),page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    await page.route('**/*',r=>r.request().url().startsWith('http://references143.test/')?r.fulfill({contentType:'text/html',body:html}):r.abort());
    await page.goto('http://references143.test/');await page.waitForFunction(()=>window.__L5R_TEST__&&window.__L5R_TEST__.CL11.ready,null,{timeout:60000});
    const got=await page.evaluate(()=>{
      const T=window.__L5R_TEST__,S=T.SEARCH14, all=S.query({limit:5000}).results.map(r=>S.get(r.id));
      const own=['skills','weapons','spells'];
      return {api:T.SEARCHREF143?T.SEARCHREF143.source('skills','Kenjutsu'):null,
        count:all.filter(r=>own.includes(r.category)&&r.source).length,
        records:all.map(r=>{if(own.includes(r.category))r.source='';return r;}),
        libraries:[T.SKILL_LIBRARY,T.WEAPON_LIBRARY,T.ARROW_LIBRARY,T.SPELL_LIBRARY]};
    });
    check('REF143-DEP-'+v.id+'-API',got.api,v.api);
    check('REF143-DEP-'+v.id+'-CITATIONS',got.count,v.count);
    check('REF143-DEP-'+v.id+'-ERRORS',errors,[]);
    if(v.id==='CONTROL')control=got;
    if(v.id==='OFF'){
      check('REF143-ONLY-CITATIONS-CHANGED',got.records,control.records);
      check('REF143-NO-CATALOGUE-MUTATION',got.libraries,control.libraries);
    }
    await context.close();
  }
 }finally{await browser.close();}
 const pass=results.filter(r=>r.pass).length;console.log(pass+'/'+results.length+' checks passed');process.exitCode=pass===results.length&&results.length===23?0:1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
