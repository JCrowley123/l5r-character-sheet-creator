'use strict';
const {open}=require('./capture-common.cjs');
async function run(device,kind){
  const s=await open(device,null),p=s.page;
  // Exact title matching, including School names with brackets.
  const choose=async name=>{const cards=p.locator('.cw112-card');const index=await cards.evaluateAll((es,n)=>es.findIndex(e=>e.querySelector('.cw112-card-title')?.textContent===n),name);if(index<0)throw Error('Missing card '+name);await cards.nth(index).click()};
  const next=async()=>{await p.locator('#cw112Next').click();await p.waitForFunction(()=>!window.__L5R_TEST__.CW112.busy)};
  try{
    await p.evaluate(()=>window.__L5R_TEST__.CL11.open());await p.locator('#cl11Create').click();
    await p.locator('#cw112Name').fill(kind+' visual audit');
    await s.snap(device+'-wizard-'+kind+'-name','#cw112View');await next();
    await choose(kind==='matsu'?'Lion':kind==='monk'?'Brotherhood of Shinsei':'Crab');
    await s.snap(device+'-wizard-'+kind+'-clan','#cw112View');await next();
    if(kind!=='monk')await choose(kind==='matsu'?'Matsu':'Kuni');
    await s.snap(device+'-wizard-'+kind+'-family','#cw112View');await next();
    const school=kind==='matsu'?'Matsu Beastmaster [Bushi]':kind==='monk'?'The Order of the Nameless Gift [Monk]':'Kuni Shugenja';
    await choose(school);
    await p.waitForFunction(n=>window.__L5R_TEST__.CW112.appliedSchool()===n,school);
    await s.snap(device+'-wizard-'+kind+'-school','#cw112View');await next();
    await s.snap(device+'-wizard-'+kind+'-traits','#cw112View');
    if(kind==='kuni'){for(const t of ['Willpower','Void','Agility','Strength','Perception'])await p.locator('button[aria-label="Raise '+t+'"]').click();await s.snap(device+'-wizard-'+kind+'-overspent','#cw112View')}
    for(let i=0;i<12;i++){
      const title=await p.locator('#cw112Title').innerText();
      if(title==='Review')break;
      await next();
      const name=(await p.locator('#cw112Title').innerText()).toLowerCase().replace(/[^a-z]+/g,'-');
      await s.snap(device+'-wizard-'+kind+'-'+name+'-'+i,'#cw112View');
    }
    await p.locator('.cw112-finding').last().scrollIntoViewIfNeeded();
    await s.snap(device+'-wizard-'+kind+'-review-findings','#cw112View');
    return {kind,device,title:await p.locator('#cw112Title').innerText()};
  }finally{await s.browser.close()}
}
module.exports={run};
