'use strict';
// BUGFIX SPELLNAMES: the fix off, or with Search or 14.3a off. Only the two names (and Search's former-name tag) change.
const fs=require('fs'),{chromium}=require('playwright');
const input=fs.readFileSync(process.argv[2],'utf8'),results=[];
function check(id,actual,want){const pass=JSON.stringify(actual)===JSON.stringify(want);results.push({id,pass});console.log((pass?'PASS ':'FAIL ')+id+(pass?'':' actual='+JSON.stringify(actual).slice(0,300)));}
const NOW={api:'Fill the Emptiness',library:2,hit:['Fill with Emptiness','Core Rulebook p.196']};
async function main(){
 const browser=await chromium.launch();let control;
 try{
  for(const v of [
   {id:'CONTROL',want:NOW},
   {id:'OFF',off:'SPELL_NAMES_FIX_ENABLED',want:{api:'',library:0,hit:['Fill the Emptiness','Core Rulebook p.196']}},
   // The Search alias lives in the fragment; without it the renaming stands and the former name finds nothing.
   {id:'FRAGMENT-ABSENT',absent:true,want:{api:'Fill the Emptiness',library:2,hit:[null,null]}},
   {id:'SEARCH-OFF',off:'SEARCH_ENABLED',want:{api:'Fill the Emptiness',library:2,hit:[null,null]}},
   {id:'REF143-OFF',off:'SEARCH_REFERENCES_143_ENABLED',want:{api:'Fill the Emptiness',library:2,hit:['Fill with Emptiness','']}}]){
    let html=input;
    if(v.off){const term='const '+v.off+' = true;';if(html.split(term).length!==2)throw Error('Non-unique switch '+v.off);html=html.replace(term,'const '+v.off+' = false;');}
    if(v.absent){const start='  // ============ BUGFIX SPELLNAMES — SPELL NAMES MATCH THE BOOKS: SEARCH ============',end='  // ============ END SPELLNAMES ============';
      const a=html.indexOf(start),b=html.indexOf(end);if(a<0||b<a)throw Error('Missing own fragment');html=html.slice(0,a)+html.slice(b+end.length);}
    const context=await browser.newContext(),page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    await page.route('**/*',r=>r.request().url().startsWith('http://spellnames.test/')?r.fulfill({contentType:'text/html',body:html}):r.abort());
    await page.goto('http://spellnames.test/');await page.waitForFunction(()=>window.__L5R_TEST__&&window.__L5R_TEST__.CL11.ready,null,{timeout:60000});
    const got=await page.evaluate(()=>{
      const T=window.__L5R_TEST__,S=T.SEARCH14,L=T.SPELL_LIBRARY,N=T.SPELLNAMES;
      const back={'Enticing Dance of the Flame':'Enticing the Dance of Flame','Fill with Emptiness':'Fill the Emptiness'};
      const h=S.query({category:'spells',text:'Fill the Emptiness',limit:1}).results[0];
      return {want:{api:N?N.formerName('Fill with Emptiness'):null,library:L.filter(s=>back[s.name]).length,hit:h?[h.name,h.source]:[null,null]},
        // Library and Search records with the former names restored and the former-name tag dropped.
        library:L.map(s=>Object.assign({},s,{name:back[s.name]||s.name})),
        records:S.query({limit:5000}).results.map(r=>S.get(r.id)).filter(r=>r.category!=='spells')};
    });
    check('SPN-DEP-'+v.id+'-STATE',got.want,v.want);
    check('SPN-DEP-'+v.id+'-ERRORS',errors,[]);
    if(v.id==='CONTROL')control=got;
    if(v.id==='OFF'){
      check('SPN-ONLY-TWO-NAMES-CHANGED',got.library,control.library);
      check('SPN-OTHER-RECORDS-UNCHANGED',got.records,control.records);
    }
    await context.close();
  }
 }finally{await browser.close();}
 const pass=results.filter(r=>r.pass).length;console.log(pass+'/'+results.length+' checks passed');process.exitCode=pass===results.length&&results.length===12?0:1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
