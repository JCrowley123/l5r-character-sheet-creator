'use strict';
// Release 8b: exact pins, event-driven readiness, no retries. Optional web fonts do not participate in these logic checks.
const {chromium} = require('playwright');
const {pathToFileURL} = require('url');
const path = require('path');
const URL = pathToFileURL(path.resolve(process.argv[2])).href;
const IDS = ['ENABLED','REPORT-READ-ONLY','MANAGE-BUTTONS','PLAY-REPORT-ONLY','OPEN-READ-ONLY','SKILL-PICKER-REUSED',
  'FREE-SCHOOL-SKILL','SKILL-NOTE-CLEARS','SKILL-RELOAD','UNTICK-REOPENS','DELETE-REOPENS','SCHOOL-ISOLATION',
  'ADOPT-SKILL','UNDO-PRESERVES-PAID-SKILL','REWARD-DOES-NOT-COUNT','ELEMENT-PICKER-REUSED','GIVEN-SOURCE',
  'SPELL-SOURCE','ADOPT-SPELL','SPELL-RELOAD','RENAME-REOPENS','LATER-KEEPS-OWED','ESCAPE-CLOSES',
  'CHARACTER-SWITCH-CLOSES','COMPLEX-ALLOTMENT','WIZARD-SKILL-SOURCE','WIZARD-SPELL-SOURCE','MALFORMED-RECORDS',
  'PHONE-FITS','NO-PAGE-ERRORS'].map(x => 'SC8-' + x);
let passed=0, failed=0;
const seen=new Set(), contexts=[], errors=[];
function check(id, actual, expected=true){
  id='SC8-'+id;
  if(!IDS.includes(id) || seen.has(id)) throw Error('Unpinned/duplicate check '+id);
  seen.add(id);
  if(JSON.stringify(actual)===JSON.stringify(expected)){passed++;console.log('PASS '+id);}
  else{failed++;console.log('FAIL '+id+'\n expected '+JSON.stringify(expected)+'\n actual '+JSON.stringify(actual));}
}
async function fresh(browser, school='Kitsu Shugenja'){
  const context=await browser.newContext({viewport:{width:390,height:844}}); contexts.push(context);
  await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//,route=>route.abort('blockedbyclient'));
  const page=await context.newPage(); page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(URL,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready,null,{timeout:60000});
  await page.evaluate(s=>{
    const set=(id,v)=>{const n=document.getElementById(id);n.value=v;n.dispatchEvent(new Event('change',{bubbles:true}));};
    set('f_name','Release 8b test'); set('cfs_clan',s==='Isawa Shugenja'?'Phoenix':'Lion');
    set('cfs_school',s); document.getElementById('cfs_applySchool').click();
  },school);
  if(school==='Isawa Shugenja'){
    await page.waitForFunction(()=>document.getElementById('affinityPickModalOverlay').style.display==='flex');
    await page.click('#affinityPick_Void'); await page.click('#affinityPickConfirm');
  }
  await page.waitForFunction(s=>window.__L5R_TEST__.CW112.appliedSchool()===s,school,{timeout:60000});
  return page;
}
const state=page=>page.evaluate(()=>JSON.stringify(window.__L5R_TEST__.collectData()));
const notes=page=>page.evaluate(()=>window.__L5R_TEST__.validateCharacter().findings.filter(f=>['school-choice-slots','school-starting-spells'].includes(f.id)).map(f=>[f.id,f.title,f.detail]));
const open=(page,kind)=>page.evaluate(k=>window.__L5R_TEST__.SC8.open('Kitsu Shugenja',k),kind);
const close=page=>page.evaluate(()=>window.__L5R_TEST__.SC8.close());
async function skill(page,name='Acting'){
  await page.selectOption('#sc8Body #cw1121Slot0Pick',name); await page.click('#sc8Body #cw1121Slot0Add');
}
async function spell(page,element='Water'){
  const id='#cw1123Pick'+element;
  const value=await page.locator(id+' option').evaluateAll(opts=>opts.find(o=>o.value).value);
  await page.selectOption(id,value); await page.click('#cw1123Add'+element); return Number(value);
}
async function main(){
  const browser=await chromium.launch();
  try{
    let p=await fresh(browser);
    const enabled=await p.evaluate(()=>!!window.__L5R_TEST__.SC8?.enabled());
    check('ENABLED',enabled);
    if(!enabled){for(const id of IDS.slice(1)) check(id.slice(4),false);return;}
    let before=await state(p); await notes(p); await notes(p);
    check('REPORT-READ-ONLY',await state(p),before);
    check('MANAGE-BUTTONS',await p.locator('#validationReport .sc8-open').count(),2);
    check('PLAY-REPORT-ONLY',await p.evaluate(()=>{const T=window.__L5R_TEST__;T.MODES12.set('play');const result=[document.querySelectorAll('.sc8-open').length,T.SC8.open('Kitsu Shugenja','skill')];T.MODES12.set('management');return result;}),[0,false]);
    before=await state(p); await open(p,'skill'); check('OPEN-READ-ONLY',await state(p),before);
    check('SKILL-PICKER-REUSED',await p.locator('#sc8Body #cw1121Slot0Pick').count(),1);
    const xp=await p.inputValue('#f_xpRemain'); await skill(p);
    check('FREE-SCHOOL-SKILL',await p.evaluate(()=>{const d=window.__L5R_TEST__.collectData(),s=d.skills.find(x=>x.name==='Acting');return [s.rank,s.school,s.schoolChoice.school,s.schoolChoice.slot,document.getElementById('f_xpRemain').value];}),['1',true,'Kitsu Shugenja',0,xp]);
    check('SKILL-NOTE-CLEARS',(await notes(p)).filter(x=>x[0]==='school-choice-slots'),[]);
    await close(p); await p.evaluate(()=>{const T=window.__L5R_TEST__;T.applyData(T.collectData());});
    check('SKILL-RELOAD',await p.evaluate(()=>{const T=window.__L5R_TEST__,s=T.collectData().skills.find(s=>s.name==='Acting');return [s.schoolChoice.school,T.SC8.openSkills('Kitsu Shugenja').length];}),['Kitsu Shugenja',0]);
    check('UNTICK-REOPENS',await p.evaluate(()=>{const T=window.__L5R_TEST__,r=T.SC8.skillRows().find(r=>T.SC8.rowName(r,'skill')==='Acting');r.querySelector('.sk-school').checked=false;return T.SC8.openSkills('Kitsu Shugenja').length;}),1);
    check('DELETE-REOPENS',await p.evaluate(()=>{const T=window.__L5R_TEST__,r=T.SC8.skillRows().find(r=>T.SC8.rowName(r,'skill')==='Acting');r.remove();return T.SC8.openSkills('Kitsu Shugenja').length;}),1);
    check('SCHOOL-ISOLATION',await p.evaluate(()=>{const L=window.__L5R_TEST__.SC8Logic;return [L.belongs({school:'Kitsu Shugenja'},'Kuni Shugenja'),L.slotFilled({school:'Kitsu Shugenja',slot:1,choice:'High'},'Kitsu Shugenja',0,'High',1,true)];}),[false,false]);

    p=await fresh(browser);
    await p.evaluate(()=>window.__L5R_TEST__.CW1121.addSkill('Acting','',false));
    await p.evaluate(()=>{const T=window.__L5R_TEST__,r=T.SC8.skillRows().find(r=>T.SC8.rowName(r,'skill')==='Acting');r.querySelector('.sk-rank').value='3';T.recalcAll();});
    await open(p,'skill'); await skill(p);
    check('ADOPT-SKILL',await p.evaluate(()=>{const s=window.__L5R_TEST__.collectData().skills.filter(s=>s.name==='Acting');return [s.length,s[0].rank,s[0].school,s[0].schoolChoice.created];}),[1,'3',true,false]);
    await p.click('#sc8Body .cw1121-undo');
    check('UNDO-PRESERVES-PAID-SKILL',await p.evaluate(()=>{const s=window.__L5R_TEST__.collectData().skills.filter(s=>s.name==='Acting');return [s.length,s[0].rank,s[0].school,!!s[0].schoolChoice];}),[1,'3',false,false]);
    await close(p);

    p=await fresh(browser);
    before=await notes(p);
    const reward=await p.evaluate(()=>{const T=window.__L5R_TEST__,i=T.CW1123.optionsFor('Water')[0].i;T.CW1122.addSpell(i);return i;});
    check('REWARD-DOES-NOT-COUNT',await notes(p),before);
    await open(p,'spell');
    check('ELEMENT-PICKER-REUSED',[await p.locator('#cw1123PickWater').isVisible(),await p.locator('#cw1123PickAir').isVisible()],[true,false]);
    await p.click('#cw1123AddGiven');
    check('GIVEN-SOURCE',await p.evaluate(()=>{const T=window.__L5R_TEST__;return T.collectData().tech.filter(t=>['Sense','Commune','Summon'].includes(t.name)).map(t=>[t.name,t.schoolChoice?.school]);}),[['Sense','Kitsu Shugenja'],['Commune','Kitsu Shugenja'],['Summon','Kitsu Shugenja']]);
    await p.selectOption('#cw1123PickWater',String(reward)); await p.click('#cw1123AddWater');
    check('ADOPT-SPELL',await p.evaluate(i=>{const T=window.__L5R_TEST__,name=T.SPELL_LIBRARY[i].name,d=T.collectData();return [d.tech.filter(t=>t.name===name).length,d.equip.filter(e=>e.schoolChoice?.name===name).length,d.tech.find(t=>t.name===name).schoolChoice.created];},reward),[1,1,false]);
    const picked=await spell(p);
    check('SPELL-SOURCE',await p.evaluate(i=>{const T=window.__L5R_TEST__,name=T.SPELL_LIBRARY[i].name,d=T.collectData();return [d.tech.find(t=>t.name===name).schoolChoice.school,d.equip.find(e=>e.schoolChoice?.name===name).schoolChoice.school];},picked),['Kitsu Shugenja','Kitsu Shugenja']);
    const owed=await notes(p); await close(p);
    await p.evaluate(()=>{const T=window.__L5R_TEST__;T.applyData(T.collectData());});
    check('SPELL-RELOAD',await notes(p),owed);
    check('RENAME-REOPENS',await p.evaluate(i=>{const T=window.__L5R_TEST__;T.SC8.spellRow(T.SPELL_LIBRARY[i].name).querySelector('.en-name').value='Renamed spell';return T.SC8.withSchool('Kitsu Shugenja',()=>T.CW1123.status(T.CW1123.current()).quotas[0].have);},picked),1);
    await open(p,'spell'); before=await notes(p); await p.click('.sc8-later');
    check('LATER-KEEPS-OWED',[await notes(p),await p.locator('#cw1123PickAir').isVisible()],[before,true]);
    await p.keyboard.press('Escape'); check('ESCAPE-CLOSES',await p.locator('#sc8Dialog').count(),0);
    await open(p,'spell'); await p.evaluate(()=>{const T=window.__L5R_TEST__;T.applyData(T.collectData());});
    check('CHARACTER-SWITCH-CLOSES',await p.locator('#sc8Dialog').count(),0);

    p=await fresh(browser,'Isawa Shugenja');
    await p.evaluate(()=>window.__L5R_TEST__.SC8.open('Isawa Shugenja','spell'));
    check('COMPLEX-ALLOTMENT',await p.evaluate(()=>[document.querySelectorAll('#sc8Body .cw1124-slot').length,document.querySelectorAll('#cw1124Pick optgroup').length,document.querySelector('#cw1124Pick optgroup').label]),[4,1,'Air']);
    await close(p);
    await p.evaluate(()=>{const T=window.__L5R_TEST__;T.CW112.start();T.CW112.index=T.CW112.steps.findIndex(s=>s.id==='skills');T.CW112.render();});
    await p.selectOption('#cw1121Slot0Pick','Lore');await p.fill('#cw1121Slot0Subject','History');await p.click('#cw1121Slot0Add');
    check('WIZARD-SKILL-SOURCE',await p.evaluate(()=>window.__L5R_TEST__.collectData().skills.find(s=>s.name==='Lore: History').schoolChoice.school),'Isawa Shugenja');
    await p.evaluate(()=>{const T=window.__L5R_TEST__;T.CW112.index=T.CW112.steps.findIndex(s=>s.id==='spells');T.CW112.render();});
    check('WIZARD-SPELL-SOURCE',await p.evaluate(()=>window.__L5R_TEST__.collectData().tech.filter(t=>t.spellElement).map(t=>t.schoolChoice?.school)),['Isawa Shugenja','Isawa Shugenja','Isawa Shugenja']);
    await p.evaluate(()=>window.__L5R_TEST__.CW112.close());
    check('MALFORMED-RECORDS',await p.evaluate(()=>{const L=window.__L5R_TEST__.SC8Logic,r={version:1,stage:'starting',kind:'skill',school:'Kitsu Shugenja',name:'Acting',slot:0,choice:'High'};return [null,[],{...r,version:2},{...r,stage:'level-up'},{...r,slot:-1},{...r,name:'Lore'}].map(x=>L.record(x,'skill','Acting'));}),[null,null,null,null,null,null]);
    await p.evaluate(()=>window.__L5R_TEST__.SC8.open('Isawa Shugenja','spell'));
    check('PHONE-FITS',await p.evaluate(()=>{const d=document.getElementById('sc8Dialog'),r=d.getBoundingClientRect();return [r.left>=0,r.right<=innerWidth,d.scrollWidth<=d.clientWidth+1,document.getElementById('sc8Done').getBoundingClientRect().height>=44];}),[true,true,true,true]);
    check('NO-PAGE-ERRORS',errors,[]);
  }finally{
    for(const c of contexts) await c.close(); await browser.close();
    for(const id of IDS) if(!seen.has(id)){failed++;console.log('FAIL '+id+'\n scenario did not reach this pinned check');}
    console.log(`${passed}/${IDS.length} checks passed`);
    process.exitCode=failed?1:0;
  }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
