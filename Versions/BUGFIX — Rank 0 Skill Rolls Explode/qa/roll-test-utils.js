'use strict';
const {chromium}=require('playwright');
const {pathToFileURL}=require('url');
const path=require('path');
const results=[];
function check(id, actual, expected=true){
  if(results.some(r=>r.id===id)) throw Error('Duplicate check '+id);
  const pass=JSON.stringify(actual)===JSON.stringify(expected);
  results.push({id,pass});
  console.log((pass?'PASS ':'FAIL ')+id+(pass?'':' actual='+JSON.stringify(actual)+' expected='+JSON.stringify(expected)));
}
async function section(id,fn){try{await fn();}catch(e){check(id+'-EXCEPTION',String(e.stack||e),'no exception');}}
async function open(sheet){
  const browser=await chromium.launch();
  const page=await browser.newPage({viewport:{width:390,height:844}});
  page.setDefaultTimeout(8000);page.errors=[];
  page.on('pageerror',e=>page.errors.push(String(e)));
  await page.route('https://fonts.googleapis.com/**',r=>r.abort());
  await page.route('https://fonts.gstatic.com/**',r=>r.abort());
  await page.goto(pathToFileURL(path.resolve(sheet)).href);
  await page.waitForFunction(()=>window.__L5R_TEST__ && window.__L5R_CAROUSEL__?.isReady?.() && (!window.__L5R_TEST__.CL11 || window.__L5R_TEST__.CL11.ready));
  await page.evaluate(()=>{
    const T=window.__L5R_TEST__;
    T.CL11?.close?.();
    window.__diceQA={
      add(name,dis=false,config=null){
        const library=(dis?T.DISADV_LIBRARY:T.ADV_LIBRARY).find(x=>x.name===name);
        const row=T.makeEntry({name,cost:library?.cost||0,desc:library?.desc||''},true);
        document.getElementById(dis?'disadvList':'advList').appendChild(row);
        if(config)row.dataset.advConfig=JSON.stringify(config);
        T.recalcAll();return row;
      },
      rng(values){let i=0;Math.random=()=>((values[i++%values.length]-.5)/10);},
      close(){document.getElementById('rollModalOverlay').style.display='none';},
      result(){return {dice:[...document.querySelectorAll('#rollDiceRow .roll-die')].map(e=>+e.dataset.total),
        kept:document.querySelectorAll('#rollDiceRow .kept').length,
        text:document.getElementById('rollModalBody').textContent,
        title:document.getElementById('rollModalTitle').textContent};}
    };
  });
  return {browser,page};
}
async function reset(page,adv=[],dis=[]){
  await page.evaluate(({adv,dis})=>{
    const T=window.__L5R_TEST__;window.__diceQA.close();T.resetToBaseline();T.MODES12?.set('management');
    T.saveSchoolsList([]);T.clearOneRollVoidPending();
    for(const n of adv)window.__diceQA.add(n);
    for(const n of dis)window.__diceQA.add(n,true);
    T.recalcAll();window.__diceQA.rng([10,10,5,3,4,2]);
  },{adv,dis});
}
async function roll(page,{name='Hunting',trait='Perception',rank=0,route='table',kind='SKILL',voidLift=false,cancel=false,rng=[10,10,5,3,4,2]}={}){
  await page.evaluate(({name,trait,rank,route,kind,rng})=>{
    const T=window.__L5R_TEST__;window.__diceQA.close();window.__diceQA.rng(rng);window.__lastDice=null;
    if(route==='table'){
      const row=T.makeSkillRow({name,trait,rank});document.getElementById('skillsBody').appendChild(row);T.recalcAll();
      window.__rollTask=T.rollSkill(name,trait,rank);
    }else if(route==='weapon')window.__rollTask=T.rollWeaponAttack(name);
    else{
      const tv=T.getTraitValueByName(trait),context=T.makeRollContext(T.ROLL_KINDS[kind],{skillName:name,traitName:trait,traitValue:tv,skillRank:rank,unskilled:rank===0});
      window.__rollTask=T.rollWithModifiers(name,context,tv+rank,tv,route==='list'?{explode:false}:{}).then(r=>{window.__lastDice=r?.result;return r;});
    }
  },{name,trait,rank,route,kind,rng});
  if(route==='weapon' && name==='Shuriken')await page.locator('#rangeOptWithin').click();
  await page.waitForSelector('#rollPreviewGo',{state:'visible'});
  const preview=await page.locator('#rollPreviewBody').textContent();
  if(voidLift){
    await page.evaluate(()=>{
      const label=[...document.querySelectorAll('#rollPreviewBody label')].find(e=>/Rank 0/.test(e.textContent));
      if(!label)throw Error('Void rank lift not offered');label.querySelector('input').click();
    });
  }
  if(cancel)await page.locator('#rollPreviewCancel').click();
  else await page.locator('#rollPreviewGo').click();
  await page.evaluate(()=>window.__rollTask);
  return {preview,...await page.evaluate(()=>window.__diceQA.result())};
}
function finish(page){check('NO-PAGE-ERRORS',page.errors,[]);const passed=results.filter(r=>r.pass).length;console.log(`${passed}/${results.length} checks passed`);process.exitCode=passed===results.length&&passed>0?0:1;}
module.exports={open,reset,roll,check,section,finish};
