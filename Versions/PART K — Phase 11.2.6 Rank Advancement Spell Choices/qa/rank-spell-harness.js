'use strict';
const fs = require('fs');
const path = require('path');
const {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const all = require('./expected-checks.json');
const variant = process.argv.includes('--variant');
const pins = variant ? ['ORDINARY-THREE','FIRST-PATH-ONE','LATER-PATH-ZERO','ISAWA-ANCESTOR','VOID-GATED'] : all;
const source = pathToFileURL(path.resolve(process.argv[2])).href;
const fixture = require('../../BUGFIX — Older School Choices/qa/older-kitsu.l5r.json');
async function run(){
  const browser = await chromium.launch();
  const seen = {};
  const errors = [];
  try {
    const page = await browser.newPage({viewport:{width:390,height:844}});
    page.on('pageerror',e=>errors.push(e.message));
    await page.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//,r=>r.abort());
    await page.goto(source,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready,null,{timeout:60000});
    Object.assign(seen,await page.evaluate(()=>{
      const t=window.__L5R_TEST__, r=t.RS8Rules;
      if(!t.RS8?.enabled()) return {};
      const normal={school:'Kitsu Shugenja',affinity:'Water',deficiency:'Fire',voidMagic:false};
      const spell=(element,mastery)=>({element,mastery});
      const schools=['Agasha Shugenja','Asahina Shugenja','Chuda Shugenja','Chuda Shugenja [Snake]','Fuzake Shugenja',
        'Horiuchi Shugenja','Isawa Shugenja','Iuchi Shugenja','Kitsu Shugenja','Kitsune Shugenja','Komori Shugenja','Kuni Shugenja',
        'Moshi Shugenja','Moto Death Priest [Shugenja]','Ninube Shugenja','Seppun Shugenja','Soshi Shugenja','Tamori Shugenja',
        'Tonbo Shugenja','Yogo Wardmaster [Shugenja]','Yoritomo Shugenja'];
      return {
        'ALL-21-SCHOOLS': schools.length===21 && schools.every(s=>t.CW1123.forSchool(s) && t.RS8.profile(s).school===s),
        'YOGO-ADVANCEMENT-MASTERY':(()=>{
          const g={school:'Yogo Wardmaster [Shugenja]',rank:2,profile:t.RS8.profile('Yogo Wardmaster [Shugenja]')};
          const find=name=>t.SPELL_LIBRARY.find(s=>s.name===name);
          return t.RS8.eligible(g,find('Bonds of Ningen-Do')) && !t.RS8.eligible(g,find('Call Upon the Wind'));
        })(),
        'ORDINARY-THREE':r.allowance('',false)===3,
        'FIRST-PATH-ONE':r.allowance('first',false)===1 && r.allowance('first',true)===1,
        'LATER-PATH-ZERO':r.allowance('later',false)===0 && r.allowance('later',true)===0,
        'ISAWA-ANCESTOR':r.allowance('',true)===4,
        'SPELL-LEVEL-AT-EARNING':r.eligible(spell('Water',3),normal,2) && !r.eligible(spell('Water',4),normal,2) &&
          !r.eligible(spell('Earth',3),normal,2) && !r.eligible(spell('Fire',2),normal,2),
        'VOID-GATED':!r.eligible(spell('Void',1),normal,2) && r.eligible(spell('Void',2),{...normal,voidMagic:true},2),
        'SPIDER-MAHO-ONLY':r.eligible({maho:true,mastery:6},{school:'Chuda Shugenja'},2) &&
          !r.eligible({maho:true,mastery:1},{school:'Chuda Shugenja [Snake]'},2) && !r.eligible({maho:true,mastery:1},normal,2)
      };
    }));
    if(!variant) Object.assign(seen,await page.evaluate(async fixture=>{
      const t=window.__L5R_TEST__, api=t.RS8, school='Kitsu Shugenja', result={};
      const $=s=>document.querySelector(s), id=s=>document.getElementById(s);
      const note=n=>$('#validationReport .sc8-open[data-kind="rank-'+n+'"]');
      function points(goal){
        const bonus=id('f_insightBonus');
        bonus.value=Number(bonus.value)+goal-Number(id('f_insightPts').value);
        bonus.dispatchEvent(new Event('input',{bubbles:true})); t.recalcAll();
      }
      t.MODES12.set('management'); t.applyData(structuredClone(fixture)); points(145);
      const base=t.collectData(); delete base.rankSpellChoices;
      t.applyData(structuredClone(base)); await Promise.resolve();
      result['FRESH-IMPORT-NO-WINDFALL']=api.grants(school).length===0 && !$('#rs8Dialog');
      const starting=()=>JSON.stringify(t.SC8.findings('spell'));
      const before=starting(); points(150); await Promise.resolve();
      const grant=api.grants(school)[0];
      result['REAL-RANK-PROMPT']=id('f_rank').value==='2' && grant?.rank===2 && $('#rs8Choose')?.textContent==='Choose spells' && $('#rs8Dialog').open;
      $('#rs8Close').click();
      result['LATER-PRESERVES-DEBT']=!$('#rs8Dialog') && api.left(grant)===3 && !!note(2);
      note(2).click();
      result['MANAGE-REOPEN']=!!$('#rs8Dialog[open] #cw1124Pick') && api.left(grant)===3;
      const select=$('#rs8Dialog select'), option=Array.from(select.options).find(o=>o.value!=='');
      result['OWNED-REWARD-EXCLUDED']=!Array.from(select.options).some(o=>o.textContent.includes("Jurojin's Balm"));
      const index=Number(option.value), spell=t.SPELL_LIBRARY[index];
      result['STARTING-GIVEN-RESERVED']=!api.eligible(grant,t.SPELL_LIBRARY.find(s=>s.name==='Sense'));
      select.value=option.value; select.dispatchEvent(new Event('change')); $('#cw1124Add').click();
      const after=t.collectData();
      result['PICK-ADDS-ONE-PAIR']=after.tech.filter(x=>x.name===spell.name).length===1 && after.equip.filter(x=>x.name==='Spell Scroll — '+spell.name).length===1 &&
        after.tech.length===base.tech.length+1 && after.equip.length===base.equip.length+1 && api.left(grant)===2;
      result['STARTING-ALLOTMENT-SEPARATE']=before===starting() && !t.SC8.read(t.SC8.spellRow(spell.name),'spell');
      result['DOUBLE-GRANT-REFUSED']=!api.grant(grant,index) && api.left(grant)===2;
      $('#rs8Close').click(); t.applyData(structuredClone(after));
      const restored=api.grants(school)[0];
      result['SAVE-RELOAD-DEBT']=api.left(restored)===2 && restored.spells.join()===spell.name && !$('#rs8Dialog');
      t.MODES12.set('play');
      result['PLAY-READ-ONLY']=!note(2) && !$('.rs8-earlier') && !t.SC8.open(school,'rank-2') && api.findings().length===1;
      t.MODES12.set('management');
      const prev=JSON.stringify(t.collectData()); t.validateCharacter(); t.validateCharacter();
      result['READ-ONLY-CHECK']=JSON.stringify(t.collectData())===prev;
      points(145); const inactive=api.left(restored)===0;
      result['REDEEMED-DOWNGRADE-REPORTED']=api.findings().some(f=>f.detail.includes(spell.name)) && !!t.SC8.spellRow(spell.name);
      points(150); await Promise.resolve();
      result['RANK-UNDO-REDO']=inactive && api.left(restored)===2 && api.grants(school).length===1;
      points(200); await Promise.resolve(); if($('#rs8Close')) $('#rs8Close').click();
      result['MULTI-RANK-SEPARATE']=api.grants(school).map(g=>g.rank+':'+api.left(g)).join()==='2:2,3:3,4:3';
      t.AP46.saveRecord({[school]:{'3':'Bishamon’s Chosen [Shugenja]'}}); t.recalcAll();
      result['PATH-REPLACES-GRANT']=api.left(api.grants(school)[1])===1 && api.left(restored)===2;
      const frozen=t.collectData(), list=JSON.parse(frozen.fields.f_schoolsData);
      list[0].frozen=true; list[0].frozenRank=4; frozen.fields.f_schoolsData=JSON.stringify(list);
      t.applyData(frozen); points(225);
      result['FROZEN-SCHOOL-NO-NEW-DEBT']=api.grants(school).length===3;
      t.applyData(structuredClone(base));
      result['RESTORED-CHARACTER-ISOLATED']=api.grants(school).length===0 && !api.grant(restored,index) && !note(2);
      points(175); await Promise.resolve();
      const older=t.collectData(); delete older.rankSpellChoices;
      t.applyData(structuredClone(older)); await Promise.resolve();
      const noDebt=api.grants(school).length===0 && !note(2) && !$('#rs8Dialog');
      $('.rs8-earlier').click(); const none=$('#rs8Confirm').disabled;
      $('#rs8Close').click(); const cancelled=api.grants(school).length===0;
      $('.rs8-earlier').click(); const count=$('#rs8Missing');
      const max=Number(count.options[count.length-1].value);
      result['LEGACY-CLAIM-CAPPED']=max===3 && !api.claim(school,2,4) && !api.claim(school,4,1);
      count.value='1'; count.dispatchEvent(new Event('change')); $('#rs8Confirm').click();
      result['LEGACY-CLAIM-EXPLICIT']=none && cancelled && noDebt && api.left(api.grants(school)[0])===1 && !!$('#cw1124Pick');
      const claimed=t.collectData(); t.applyData(claimed);
      result['LEGACY-NO-SECOND-CLAIM']=!api.claim(school,2,1) && api.earlier(school).map(r=>r.rank).join()==='3' && api.left(api.grants(school)[0])===1;
      t.applyData(structuredClone(base)); points(374); await Promise.resolve();
      const rankTen=t.collectData(); delete rankTen.rankSpellChoices;
      t.applyData(rankTen); points(375); await Promise.resolve();
      const high=api.grants(school).find(g=>g.rank===11);
      const prompt=!!$('#rs8Choose');
      const rankEleven=t.collectData(); t.applyData(structuredClone(rankEleven));
      result['RANK-ELEVEN-RELOAD']=prompt && id('f_rank').value==='11' && high && api.left(api.grants(school).find(g=>g.rank===11))===3;
      delete rankEleven.rankSpellChoices; t.applyData(rankEleven);
      result['OLD-RANK-ELEVEN']=api.earlier(school).some(e=>e.rank===11) && api.grants(school).length===0;
      t.applyData(structuredClone(base)); points(149);
      const almost=t.collectData();
      const row=id('skillsBody').querySelector('.sk-rank');
      row.value=Number(row.value)+1; row.dispatchEvent(new Event('input',{bubbles:true})); await Promise.resolve();
      result['SKILL-INPUT-ADVANCES']=id('f_rank').value==='2' && !!$('#rs8Choose') && t.collectData().rankSpellChoices.schools[0].grants.length===1;
      t.applyData(almost);
      const bonus=id('f_insightBonus'); bonus.value=Number(bonus.value)+1; bonus.dispatchEvent(new Event('input',{bubbles:true})); await Promise.resolve();
      result['INSIGHT-INPUT-ADVANCES']=id('f_rank').value==='2' && !!$('#rs8Choose') && t.collectData().rankSpellChoices.schools[0].grants.length===1;
      t.applyData(structuredClone(base)); points(150); await Promise.resolve();
      const inner='Path to Inner Peace', pos=t.SPELL_LIBRARY.findIndex(s=>s.name===inner);
      const rankGrant=api.grants(school)[0]; api.grant(rankGrant,pos); api.dismiss();
      const other=t.collectData(), nextSchool='Fuzake Shugenja';
      other.fields.f_school=nextSchool;
      other.fields.f_schoolsData=JSON.stringify([{name:school,frozen:true,frozenRank:2,floorRank:2,anchorInsightRank:0},
        {name:nextSchool,frozen:false,floorRank:1,anchorInsightRank:2}]);
      other.fields.f_insightBonus=Number(other.fields.f_insightBonus)+25;
      t.applyData(other); t.SC8.open(nextSchool,'spell');
      $('#cw1123AddGiven')?.click();
      t.SC8.close(); t.applyData(t.collectData());
      const final=t.collectData(), same=final.tech.filter(s=>s.name===inner);
      result['SECOND-SCHOOL-GIVEN']=same.length===1 && same[0].schoolChoice?.school===nextSchool &&
        final.equip.filter(e=>e.name==='Spell Scroll — '+inner).length===1 && api.grants(school)[0]?.spells.includes(inner);
      return result;
    },fixture));
    seen['NO-SCRIPT-ERRORS']=errors.length===0;
  } finally {
    if(errors.length) console.error(errors);
    await browser.close();
    const passed=pins.filter(k=>seen[k]===true).length;
    for(const id of pins) console.log((seen[id]===true?'PASS ':'FAIL ')+id);
    console.log(passed+'/'+pins.length+' checks passed');
    if(passed!==pins.length) process.exitCode=1;
  }
}
run().catch(e=>{console.error(e);process.exitCode=1;});
