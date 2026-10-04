'use strict';
const {chromium}=require('playwright'),{pathToFileURL}=require('url'),path=require('path'),fs=require('fs');
(async()=>{
 const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:390,height:844}});
 const dir=path.join(__dirname,'screenshots');fs.mkdirSync(dir,{recursive:true});
 try{
  await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.route('https://fonts.gstatic.com/**',r=>r.abort());
  await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);
  await page.waitForFunction(()=>window.__L5R_TEST__&&window.__L5R_CAROUSEL__?.isReady?.()&&(!window.__L5R_TEST__.CL11||window.__L5R_TEST__.CL11.ready));
  for(const width of [390,1440])for(const held of [false,true]){
   await page.setViewportSize({width,height:900});
   await page.evaluate(held=>{
    const T=window.__L5R_TEST__;T.CL11?.close?.();T.resetToBaseline();T.MODES12?.set('management');
    document.getElementById('f_school').value='Hida Bushi';T.saveSchoolsList([{name:'Hida Bushi',frozen:false,frozenRank:null,floorRank:1,anchorInsightRank:0}]);
    document.getElementById('trait_stamina').value='4';document.getElementById('trait_willpower').value='4';document.getElementById('trait_strength').value='5';document.getElementById('f_insightBonus').value='42';
    for(const [name,rank]of [['Defense',4],['Heavy Weapons',4],['Lore: Shadowlands',5]])document.getElementById('skillsBody').appendChild(T.makeSkillRow({name,rank,trait:'Agility'}));
    document.getElementById('advList').appendChild(T.makeEntry({name:'Multiple Schools',cost:10,desc:''},true));T.recalcAll();
    const picker=document.getElementById('advancedSchoolPicker');picker.value='Defender of the Wall';picker.dispatchEvent(new Event('change',{bubbles:true}));
    if(held){T.AS47.enter('Defender of the Wall');document.getElementById('f_insightBonus').value='117';T.recalcAll();}
   },held);
   const panel=page.locator('#advancedSchoolPanel');await panel.scrollIntoViewIfNeeded();await panel.screenshot({path:path.join(dir,`${width}-${held?'held':'picker'}.png`)});
   const geometry=await panel.evaluate(e=>({width:e.getBoundingClientRect().width,client:e.clientWidth,scroll:e.scrollWidth,viewport:innerWidth}));
   if(geometry.scroll>geometry.client+1||geometry.width>width)throw Error('Advanced School panel overflow: '+JSON.stringify(geometry));
   console.log(`${width}-${held?'held':'picker'}: fits (${JSON.stringify(geometry)})`);
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
