'use strict';
const fs=require('fs'),path=require('path'),{chromium}=require('playwright');
const results=[];function check(id,actual,expected=true){const pass=JSON.stringify(actual)===JSON.stringify(expected);results.push({id,pass});console.log((pass?'PASS ':'FAIL ')+id+(pass?'':' actual='+JSON.stringify(actual)+' expected='+JSON.stringify(expected)));}
const phase=path.resolve(__dirname,'../../Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability');
const variants=[
 {id:'CONTROL',gate:true,provider:true},
 {id:'PARAGON-OFF',off:'ADV_PARAGON_ENABLED',gate:true,provider:false},
 {id:'PARAGON-ABSENT',drop:'209.9295-feat-adv-paragon.js',gate:true,provider:false},
 {id:'CONFIG-OFF',off:'ADV_CONFIG_ENABLED',gate:true,provider:false},
 {id:'CORE-OFF',off:'ADVANCED_SCHOOLS_ENABLED',gate:false,provider:true},
 {id:'CORE-ABSENT',drop:'209.999999-feat-advanced-schools.js',gate:false,provider:true},
 {id:'SUPPLEMENT-OFF',off:'SUPPLEMENTAL_ADVANCED_SCHOOLS_ENABLED',gate:false,provider:true},
 {id:'SUPPLEMENT-ABSENT',drop:'209.9999991-feat-advanced-schools-supplemental.js',gate:false,provider:true}
];
(async()=>{const browser=await chromium.launch();try{const original=fs.readFileSync(process.argv[2],'utf8');
 for(const variant of variants){
  let html=original;if(variant.off){const re=new RegExp('const '+variant.off+' = true;','g');if((html.match(re)||[]).length!==1)throw Error('flag not unique '+variant.off);html=html.replace(re,'const '+variant.off+' = false;');}
  if(variant.drop){const fragment=fs.readFileSync(path.join(phase,'src/sheet',variant.drop),'utf8');if(html.split(fragment).length!==2)throw Error('fragment not unique '+variant.drop);html=html.replace(fragment,'');}
  const context=await browser.newContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.route('**/*',r=>r.request().url().startsWith('http://pg47.test/')?r.fulfill({contentType:'text/html',body:html}):r.abort());
  await page.goto('http://pg47.test/');await page.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready);
  const actual=await page.evaluate(()=>{const T=window.__L5R_TEST__;T.CL11.close();T.resetToBaseline();T.MODES12.set('management');T.clearAllRows();document.getElementById('f_clan').value='Badger';for(const id of ['trait_agility','trait_strength'])document.getElementById(id).value=6;document.getElementById('skillsBody').appendChild(T.makeSkillRow({name:'Kenjutsu',trait:'Agility',rank:5}));const row=T.makeEntry({name:'Paragon',cost:0,desc:''},true);row.dataset.advConfig=JSON.stringify({type:'paragonTenet',revision:1,tenet:'Courage',value:'Courage'});document.getElementById('advList').appendChild(row);T.recalcAll();const entry=T.AS47?.find('Minor Clan Defender');return {helper:!!T.PG47,enabled:!!T.PG47?.enabled(),configured:!!T.PG47?.hasConfiguredParagon(),available:!!entry&&T.AS47.enabled()&&!T.AS47.unmet(entry).length};});
  check(variant.id+'-HELPER',actual.helper);check(variant.id+'-ACTIVE',actual.enabled,variant.gate);check(variant.id+'-VALIDATOR',actual.configured,variant.provider);check(variant.id+'-ENTRY',actual.available,variant.gate&&variant.provider);check(variant.id+'-NO-ERRORS',errors,[]);await context.close();
 }
}finally{await browser.close();const n=results.filter(r=>r.pass).length;console.log(n+'/'+results.length+' checks passed');process.exitCode=n===results.length?0:1;}})().catch(e=>{console.error(e);process.exitCode=1;});
