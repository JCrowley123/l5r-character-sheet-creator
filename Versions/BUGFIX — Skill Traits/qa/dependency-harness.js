'use strict';
const fs=require('fs'),{chromium}=require('playwright');
const results=[];
function check(id,actual,expected){const pass=JSON.stringify(actual)===JSON.stringify(expected);results.push({id,pass});console.log((pass?'PASS ':'FAIL ')+id+(pass?'':' actual='+JSON.stringify(actual)+' expected='+JSON.stringify(expected)));}
(async()=>{
 const html=fs.readFileSync(process.argv[2],'utf8'),browser=await chromium.launch();
 try{
  for(const v of [{id:'CONTROL',expect:['Awareness','Agility',true]},
    {id:'FIX-OFF',off:'SKILL_TRAITS_FIX_ENABLED',expect:['Willpower','Awareness',false]},
    {id:'SCHOOL-ROWS-OFF',off:'SCHOOL_SKILL_ROWS_FIX_ENABLED',expect:['Awareness','',true]},
    {id:'SEARCH-OFF',off:'SEARCH_ENABLED',expect:['Awareness','Agility',true]}]){
   let body=html;
   if(v.off){const term='const '+v.off+' = true;';if(body.split(term).length!==2)throw Error('flag not unique: '+v.off);body=body.replace(term,'const '+v.off+' = false;');}
   const context=await browser.newContext(),page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(String(e)));
   await page.route('**/*',r=>r.request().url().startsWith('http://skilltraits.test/')?r.fulfill({contentType:'text/html',body}):r.abort());
   await page.goto('http://skilltraits.test/');await page.waitForFunction(()=>window.__L5R_TEST__&&(!window.__L5R_TEST__.CL11||window.__L5R_TEST__.CL11.ready));
   const got=await page.evaluate(()=>{const T=window.__L5R_TEST__;return [T.SKILL_LIBRARY.find(s=>s.name==='Intimidation').trait,
    T.makeSkillRow({name:'Perform: Biwa'}).querySelector('.sk-trait').value,!!T.makeSkillRow({name:'Craft'}).querySelector('.st10-craft-note')];});
   check('ST-DEP-'+v.id,got,v.expect);check('ST-DEP-'+v.id+'-ERRORS',errors,[]);await context.close();
  }
 }finally{await browser.close();}
 const passed=results.filter(r=>r.pass).length;console.log(passed+'/'+results.length+' checks passed');process.exitCode=passed===results.length?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
