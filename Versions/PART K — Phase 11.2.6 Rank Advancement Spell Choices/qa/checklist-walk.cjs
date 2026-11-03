'use strict';
const {chromium}=require('playwright');
const fs=require('fs'), path=require('path');
const [out,url]=process.argv.slice(2);
if(!out || !url) throw Error('Supply an evidence folder and preview URL.');
(async()=>{
  fs.mkdirSync(out,{recursive:true});
  const browser=await chromium.launch(), checks=[],errors=[];
  function check(name,ok){checks.push({name,passed:ok===true}); if(!ok) throw Error(name);}
  try{
    for(const width of [390,1280]){
      const ctx=await browser.newContext({viewport:{width,height:844},hasTouch:width===390});
      try{
        const page=await ctx.newPage();
        page.on('pageerror',e=>errors.push(String(e)));
        await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
        await page.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready && !document.querySelector('[id^=l5r-splash]'),null,{timeout:60000});
        const input=page.locator('#fileImport'), fixture=require('../../BUGFIX — Older School Choices/qa/older-kitsu.l5r.json');
        await input.setInputFiles({name:'Kitsu-test.l5r.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture))});
        await page.waitForFunction(()=>document.getElementById('f_name').value==='Older Kitsu test character');
        await page.getByRole('tab',{name:'Identity',exact:true}).click();
        const bonus=page.locator('#f_insightBonus');
        const target=await page.evaluate(()=>150-Number(document.getElementById('f_insightPts').value)+Number(document.getElementById('f_insightBonus').value));
        await bonus.fill(String(target));
        const dialog=page.locator('#rs8Dialog');
        await dialog.waitFor();
        check(width+'px native input opens Rank 2 choice',await dialog.getByRole('button',{name:'Choose spells'}).isVisible());
        await dialog.getByRole('button',{name:'Later'}).click();
        const reopen=page.getByRole('button',{name:'Choose Rank 2 spells'});
        await reopen.click();
        const select=dialog.locator('select'); await select.waitFor();
        const chosen=await select.locator('option').evaluateAll(os=>os.find(o=>o.value!=='').value);
        await select.selectOption(chosen); await dialog.getByRole('button',{name:'Add',exact:true}).click();
        await dialog.getByText('2 spells left to choose.',{exact:false}).waitFor();
        check(width+'px one pick leaves two',await select.isVisible());
        await page.screenshot({path:path.join(out,'rank-picker-'+width+'.png')});
        await dialog.getByRole('button',{name:'Later'}).click();
        const older=structuredClone(fixture);
        older.fields.f_name='Earlier rank test';older.fields.f_insightBonus=String(target+25);
        await input.setInputFiles({name:'Earlier-test.l5r.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(older))});
        await page.waitForFunction(()=>document.getElementById('f_name').value==='Earlier rank test');
        await page.getByRole('tab',{name:'Identity',exact:true}).click();
        const review=page.getByRole('button',{name:'Review earlier rank spells · Kitsu Shugenja'});
        await review.click(); check(width+'px no older claim preselected',await dialog.locator('#rs8Confirm').isDisabled());
        await dialog.locator('#rs8Missing').selectOption('1');await dialog.locator('#rs8Confirm').click();
        await dialog.getByText('1 spell left to choose.',{exact:false}).waitFor();
        check(width+'px explicit older claim offers one',await dialog.locator('#cw1124Pick').isVisible());
      } finally{await ctx.close();}
    }
  }catch(e){errors.push(String(e));}finally{await browser.close();}
  const report={url,checks,errors,passed:checks.length===8 && checks.every(c=>c.passed) && !errors.length};
  fs.writeFileSync(path.join(out,'walk.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report)); process.exitCode=report.passed?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
