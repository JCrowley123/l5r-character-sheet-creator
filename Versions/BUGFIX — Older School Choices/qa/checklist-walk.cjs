'use strict';
// Run against a fresh local PWA preview or an explicit hosting URL.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const [out,url]=process.argv.slice(2);
if(!out||!url)throw Error('Supply evidence directory and site URL.');
const checks=[],errors=[];
function check(name,passed){checks.push({name,passed:!!passed});console.log((passed?'PASS ':'FAIL ')+name);}
(async()=>{
  fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch();
  try{
    const p=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    p.on('pageerror',e=>errors.push(String(e)));
    await p.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
    await p.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready,null,{timeout:60000});
    await p.waitForFunction(()=>!document.querySelector('[id^=l5r-splash]'),null,{timeout:60000});
    await p.locator('#fileImport').setInputFiles(path.join(__dirname,'older-kitsu.l5r.json'));
    await p.waitForFunction(()=>document.getElementById('f_name').value==='Older Kitsu test character');
    await p.getByRole('tab',{name:'Identity',exact:true}).tap();
    const review=p.getByRole('button',{name:'Review starting spells',exact:true});
    await review.waitFor();
    const defense=await p.locator('#skillsBody tr').evaluateAll(rows=>{
      const row=rows.find(r=>r.querySelector('.sk-name').value==='Defense');
      return row&&[row.querySelector('.sk-rank').value,row.querySelector('.sk-school').checked,row.textContent.match(/\b5\s*xp\b/i)!==null];
    });
    check('Import recognizes Rank 3 Defense and its five paid XP',JSON.stringify(defense)==='["3",true,true]'&&!await p.locator('#validationReport [data-kind="skill"]').count());
    await review.tap();
    const boxes=p.locator('#sc8Body input.oc8-spell');
    check('Review offers nine existing spells with none preselected',await boxes.count()===9&&!await p.locator('#sc8Body input:checked').count());
    await p.getByRole('checkbox',{name:'Sense',exact:true}).check();await p.getByRole('button',{name:'Later',exact:true}).tap();
    await review.tap();
    check('Later discards the draft',!await p.locator('#sc8Body input:checked').count());
    for(const name of await boxes.evaluateAll(xs=>xs.map(x=>x.value))){
      if(name!=="Jurojin's Balm")await p.getByRole('checkbox',{name,exact:true}).check();
    }
    await p.screenshot({path:path.join(out,'older-spell-review.png')});
    await p.getByRole('button',{name:'Confirm starting spells',exact:true}).tap();
    const earth=p.locator('#cw1123PickEarth');await earth.waitFor();
    check('Only Earth is offered after confirmation',!await p.locator('#cw1123PickWater,#cw1123PickAir,#cw1123AddGiven').count());
    const selection=await earth.locator('option').evaluateAll(os=>os.find(o=>o.value&&!o.textContent.includes("Jurojin's Balm")).value);
    await earth.selectOption(selection);await p.locator('#cw1123AddEarth').tap();await p.locator('#sc8Done').tap();
    check('Completed note clears',!await p.locator('#validationReport [data-kind="spell"]').count());
    const result=await p.evaluate(()=>{const d=window.__L5R_TEST__.collectData();return [
      d.tech.filter(t=>t.spellElement==='earth').length,
      d.tech.filter(t=>t.spellElement==='earth'&&t.schoolChoice?.school==='Kitsu Shugenja').length,
      d.equip.filter(e=>e.name==="Spell Scroll — Jurojin's Balm"&&!e.schoolChoice).length];});
    check('Two Earth spells, one School grant, original reward retained',JSON.stringify(result)==='[2,1,1]'&&!errors.length);
  }catch(e){errors.push(String(e));}finally{await browser.close();}
  const report={url,checked_utc:new Date().toISOString(),checks,errors,passed:checks.length===6&&checks.every(c=>c.passed)&&!errors.length};
  fs.writeFileSync(path.join(out,'walk.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));process.exitCode=report.passed?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
