/* Real-browser acceptance tests: UI, XP totals, saved bytes, and absence of side effects.
 * No expected rule values are obtained from N4513 or its resolver.
 * node named-advantages-harness.js <sheet.html>
 */
'use strict';
const {chromium} = require('playwright');
const {pathToFileURL} = require('url');
const path = require('path');
const results = [];
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])])) : value;
function check(id, actual, expected = true) {
  const pass = JSON.stringify(canonical(actual)) === JSON.stringify(canonical(expected));
  results.push({id, pass});
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id}${pass ? '' : ` actual=${JSON.stringify(actual)} expected=${JSON.stringify(expected)}`}`);
}
async function section(id, fn) {
  try { await fn(); } catch (error) { check(id, String(error.stack || error), 'no exception'); }
}
const names = ['Blackmail', 'Forbidden Knowledge', 'Inheritance', 'Way of the Land'];
async function reset(page, clan = '') {
  await page.evaluate(clan => {
    const T = window.__L5R_TEST__;
    T.closeAdvConfigModal();
    T.resetToBaseline();
    document.getElementById('f_clan').value = clan;
    T.recalcAll();
  }, clan);
}
async function add(page, name) {
  await page.evaluate(name => {
    const select = document.getElementById('advQuickAdd');
    select.value = name;
    if (select.value !== name) throw Error('Missing catalogue option ' + name);
    select.dispatchEvent(new Event('change', {bubbles:true}));
  }, name);
  await page.waitForSelector('#advConfigGrid input, #advConfigGrid textarea', {state:'visible', timeout:3000});
}
async function fill(page, values) {
  const fields = page.locator('#advConfigGrid input:not([type=checkbox]):not([type=radio]), #advConfigGrid textarea');
  if (await fields.count() !== values.length) throw Error('Unexpected number of modal fields');
  for(let i=0; i<values.length; i++) await fields.nth(i).fill(String(values[i]));
}
async function confirm(page) { await page.locator('#advConfigConfirm').click(); }
async function cancel(page) { await page.locator('#advConfigX').click(); }
async function row(page, name) {
  return page.evaluate(name => {
    const div = [...document.querySelectorAll('#advList .entry')].find(d => d.querySelector('.en-name').value === name);
    if (!div) return null;
    return {cost:Number(div.querySelector('.en-cost').value), config:JSON.parse(div.dataset.advConfig || 'null'),
      text:div.querySelector('.adv-config-row')?.textContent || '',
      warning:!!div.querySelector('.adv-config-warn'), html:div.innerHTML};
  }, name);
}
async function edit(page, name) {
  await page.evaluate(name => {
    const div = [...document.querySelectorAll('#advList .entry')].find(d => d.querySelector('.en-name').value === name);
    div.querySelector('.adv-config-btn').click();
  }, name);
  await page.waitForSelector('#advConfigGrid input, #advConfigGrid textarea', {state:'visible', timeout:3000});
}
async function configured(page, name, values, clan='') {
  await reset(page, clan); await add(page, name); await fill(page, values); await confirm(page);
  return row(page, name);
}
const collect = page => page.evaluate(() => window.__L5R_TEST__.collectData());
const xp = page => page.locator('#f_xpSpent').inputValue().then(Number);
async function main() {
  if (!process.argv[2]) throw Error('Pass the built HTML path');
  const browser = await chromium.launch(process.env.L5R_CHROME ? {executablePath:process.env.L5R_CHROME} : {});
  try {
    const page = await browser.newPage({viewport:{width:375,height:812}, acceptDownloads:true});
    page.setDefaultTimeout(4000);
    await page.route('https://fonts.googleapis.com/**', r => r.abort());
    await page.route('https://fonts.gstatic.com/**', r => r.abort());
    const errors=[]; page.on('pageerror', e => errors.push(String(e)));
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href, {waitUntil:'domcontentloaded'});
    await page.waitForFunction(() => !!window.__L5R_TEST__);
    await section('NAMED-START', async () => {
      check('NAMED-ENABLED', await page.evaluate(() => window.__L5R_TEST__.ADV_NAMED_ENTRIES_ENABLED));
      check('NAMED-REGISTRY', await page.evaluate(() => window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.map(x=>[x.id,x.priority]).sort((a,b)=>a[1]-b[1])),
        [['range',20],['arrow',25],['stance',30],['offhand',35],['wounds',40],['void',50],['adv-config',60]]);
      check('NAMED-SCHEMAS', await page.evaluate(names => names.map(n => window.__L5R_TEST__.advConfigSchemaFor(n)?.type), names),
        ['targetStatusPick','knowledgePick','itemPick','regionPick']);
    });
    await section('NAMED-BLACKMAIL', async () => {
      await reset(page); const initial=await xp(page);
      await add(page,'Blackmail');
      check('NAMED-BLANK-PRICE', (await row(page,'Blackmail')).cost, 0);
      check('NAMED-BLANK-WARN', (await row(page,'Blackmail')).warning);
      await fill(page,['Bayushi Example',3]); await confirm(page);
      let actual=await row(page,'Blackmail');
      check('NAMED-BLACKMAIL-PRICE', actual.cost,3);
      check('NAMED-BLACKMAIL-TOTAL', await xp(page), initial+3);
      check('NAMED-BLACKMAIL-CONFIG', [actual.config.type,actual.config.revision,actual.config.target,actual.config.targetStatus],
        ['targetStatusPick',1,'Bayushi Example',3]);
      check('NAMED-BLACKMAIL-BADGE', actual.text.includes('Bayushi Example') && actual.text.includes('3'));
      await page.evaluate(() => {document.getElementById('f_statusRank').value='8';window.__L5R_TEST__.recalcAll();});
      check('NAMED-BLACKMAIL-NOT-PC-STATUS', (await row(page,'Blackmail')).cost,3);
      check('NAMED-BLACKMAIL-SCORPION', (await configured(page,'Blackmail',['Target',3],'Scorpion')).cost,2);
      check('NAMED-BLACKMAIL-FLOOR', (await configured(page,'Blackmail',['Target',1],'Scorpion')).cost,1);
      check('NAMED-BLACKMAIL-NONSCORPION', (await configured(page,'Blackmail',['Target',3],'Crane')).cost,3);
      await edit(page,'Blackmail'); await fill(page,['New target',6]); await confirm(page);
      check('NAMED-BLACKMAIL-EDIT', (await row(page,'Blackmail')).cost,6);
      await edit(page,'Blackmail'); await fill(page,['Cancelled edit',9]); await cancel(page);
      check('NAMED-BLACKMAIL-CANCEL', (await row(page,'Blackmail')).config.target,'New target');
      check('NAMED-BLACKMAIL-CANCEL-XP', (await row(page,'Blackmail')).cost,6);
    });
    await section('NAMED-VALIDATION', async () => {
      await reset(page); await add(page,'Blackmail');
      for(const value of ['', '0','-1','2.5','1e2','3x','abc','9007199254740992']) {
        await fill(page,['Target',value]); await confirm(page);
        check('NAMED-REJECT-'+(value||'BLANK'), await page.locator('#advConfigModalOverlay').isVisible());
        check('NAMED-NO-COMMIT-'+(value||'BLANK'), (await row(page,'Blackmail')).config, null);
      }
      check('NAMED-INLINE-VALIDATION', await page.locator('#advConfigGrid [role=alert]').isVisible());
      check('NAMED-INLINE-VALIDATION-REASON', /positive whole Status/.test(await page.locator('#advConfigGrid [role=alert]').textContent()));
      await fill(page,['   ',3]); await confirm(page);
      check('NAMED-REJECT-EMPTY-NAME', (await row(page,'Blackmail')).config,null);
      await fill(page,['  Agreed target  ',7]); await confirm(page);
      check('NAMED-VALID-AFTER-REJECT', (await row(page,'Blackmail')).config.target,'Agreed target');
    });
    await section('NAMED-REMINDERS', async () => {
      for(const [name,values,key,expectedCost] of [
        ['Forbidden Knowledge',['Kolat','Player and GM apply the agreed Lore benefit.'],'subject',5],
        ['Inheritance',['Grandfather’s biwa'],'itemName',5],
        ['Way of the Land',['Toshi Ranbo'],'region',2]]) {
        const actual=await configured(page,name,values);
        check('NAMED-'+key+'-COST',actual.cost,expectedCost);
        check('NAMED-'+key+'-BADGE',actual.text.includes(values[0]));
        check('NAMED-'+key+'-VALUE',actual.config[key],values[0]);
        check('NAMED-'+key+'-REVISION',actual.config.revision,1);
        const saved=await collect(page);
        await page.evaluate(saved=>{const T=window.__L5R_TEST__;T.resetToBaseline();T.applyData(saved);T.recalcAll();},saved);
        check('NAMED-'+key+'-ROUNDTRIP',(await row(page,name)).config,actual.config);
        await edit(page,name); await fill(page,values.map(()=>'')); await confirm(page);
        check('NAMED-'+key+'-REQUIRED',await page.locator('#advConfigModalOverlay').isVisible(),name!=='Way of the Land');
        if(name!=='Way of the Land') await cancel(page);
      }
      const optional=await configured(page,'Forbidden Knowledge',['Custom subject','']);
      check('NAMED-KNOWLEDGE-OPTIONAL-NOTE',optional.config.notes,'');
      check('NAMED-KNOWLEDGE-MANUAL',/manual/i.test(optional.text));
      check('NAMED-LAND-UNICORN',(await configured(page,'Way of the Land',[''],'Unicorn')).cost,1);
      check('NAMED-LAND-BLANK-ALLOWED',(await row(page,'Way of the Land')).warning,false);
      check('NAMED-LAND-OTHER',(await configured(page,'Way of the Land',[''],'Crab')).cost,2);
    });
    await section('NAMED-INFO', async () => {
      await configured(page,'Forbidden Knowledge',['Gozoku','Agreed benefit kept manually']);
      await page.locator('#advList .named4513-info').evaluate(button=>button.click());
      check('NAMED-INFO-OPEN',await page.locator('#stanceInfoOverlay').isVisible());
      const reference=await page.locator('#stanceInfoBody').textContent();
      check('NAMED-INFO-EXAMPLES',['Gaijin Pepper','Gozoku','Kolat','Lying Darkness','Maho'].every(s=>reference.includes(s)));
      check('NAMED-INFO-NOTE',reference.includes('Agreed benefit kept manually'));
      check('NAMED-INFO-MANUAL',/managed manually/.test(reference));
      await page.locator('#stanceInfoClose').click();
      check('NAMED-INFO-CLOSE',await page.locator('#stanceInfoOverlay').isVisible(),false);
      await edit(page,'Forbidden Knowledge');
      const original=await collect(page);
      await page.locator('#advConfigGrid .named4513-info').click();
      check('NAMED-INFO-NESTED',await page.locator('#stanceInfoOverlay').isVisible());
      await page.locator('#stanceInfoClose').click();
      check('NAMED-INFO-RETURNS-TO-PICKER',await page.locator('#advConfigModalOverlay').isVisible());
      check('NAMED-INFO-NO-CHANGE',await collect(page),original);
      await cancel(page);
      await page.evaluate(()=>{document.querySelector('#advList .entry .rm-btn').click();});
      check('NAMED-DELETE-NO-OWNED-UI',await page.locator('#advList .named4513-row').count(),0);
      check('NAMED-DELETE-NO-SAVE-RESIDUE',(await collect(page)).adv,[]);
      check('NAMED-DELETE-XP',await xp(page),0);
    });
    await section('NAMED-ISOLATION', async () => {
      await reset(page);
      const before=await collect(page);
      const pools=await page.evaluate(()=>{
        const T=window.__L5R_TEST__;
        return Object.values(T.ROLL_KINDS).map(kind=>T.getPreRollModifiers({kind,skillName:'Lore: Kolat',traitName:'Intelligence'}));
      });
      for(const [name,values] of [['Blackmail',['Target',3]],['Forbidden Knowledge',['Kolat','+1k1 manually']],['Inheritance',['Biwa']],['Way of the Land',['Capital']]]) {
        await add(page,name); await fill(page,values); await confirm(page);
      }
      const after=await collect(page);
      check('NAMED-XP-SUM',Number(after.fields.f_xpSpent)-Number(before.fields.f_xpSpent),15);
      for(const key of ['skills','equip','weapons','disadv','tech','traits','traitsFree','rings','voidCurrent','spellUsed','spellBonusUsed','spellBonusUsedVisual']) {
        check('NAMED-STATE-EXISTS-'+key,Object.hasOwn(before,key));
        check('NAMED-UNCHANGED-'+key,after[key],before[key]);
      }
      const fieldDiff=Object.keys(before.fields).filter(k=>before.fields[k]!==after.fields[k]);
      check('NAMED-ONLY-XP-FIELDS',fieldDiff.filter(k=>!['f_xpSpent','f_xpRemain','f_xpRemaining'].includes(k)),[]);
      check('NAMED-NO-DICE-MODS',await page.evaluate(()=>{
        const T=window.__L5R_TEST__;return Object.values(T.ROLL_KINDS).map(kind=>T.getPreRollModifiers({kind,skillName:'Lore: Kolat',traitName:'Intelligence'}));
      }),pools);
      await page.evaluate(()=>{for(let i=0;i<8;i++)window.__L5R_TEST__.recalcAll();});
      check('NAMED-RECALC-IDEMPOTENT',await collect(page),after);
      await page.evaluate(()=>{const d=document.querySelector('#advList .entry');d.querySelector('.en-name').value='Unrelated custom entry';window.__L5R_TEST__.recalcAll();});
      check('NAMED-RENAMED-ROW-CLEAN',await page.evaluate(()=>!document.querySelector('#advList .entry').querySelector('.adv-config-row')));
      check('NAMED-RENAMED-CONFIG-CLEAN',await page.evaluate(()=>!document.querySelector('#advList .entry').dataset.advConfig));
    });
    await section('NAMED-PERSISTENCE', async () => {
      await reset(page);
      for(const [name,values] of [['Blackmail',['A person',5]],['Forbidden Knowledge',['Maho','Agreed note']],['Inheritance',['Fan']],['Way of the Land',['City']]]) {
        await add(page,name);await fill(page,values);await confirm(page);
      }
      const saved=await collect(page);
      const downloadPromise=page.waitForEvent('download');
      await page.locator('#btnExport').evaluate(button=>button.click());
      const stream=await (await downloadPromise).createReadStream();
      const chunks=[]; for await(const chunk of stream) chunks.push(chunk);
      const bytes=Buffer.concat(chunks); const exported=JSON.parse(bytes.toString('utf8'));
      check('NAMED-EXPORT-CONFIGS',exported.adv,saved.adv);
      check('NAMED-SCHEMA-COMPATIBLE',exported.schemaVersion,3);
      await reset(page);
      await page.locator('#fileImport').setInputFiles({name:'named.l5r.json',mimeType:'application/json',buffer:bytes});
      await page.waitForFunction(()=>document.querySelectorAll('#advList .entry').length===4);
      check('NAMED-IMPORT-CONFIGS',(await collect(page)).adv,saved.adv);
      await page.locator('#btnSave').evaluate(button=>button.click());
      await page.waitForFunction(()=>document.getElementById('charSelect').value!=='');
      const savedId=await page.locator('#charSelect').inputValue();
      await page.reload({waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>!!window.__L5R_TEST__);
      await page.locator('#charSelect').selectOption(savedId);
      await page.locator('#btnLoad').evaluate(button=>button.click());
      await page.waitForFunction(()=>document.querySelectorAll('#advList .entry').length===4);
      check('NAMED-LOCAL-SAVE-RELOAD',(await collect(page)).adv,saved.adv);
      for(const version of [1,2,3]) {
        const old={...saved,schemaVersion:version,adv:[{name:'Way of the Land',cost:'2',desc:'legacy record'}]};
        await page.evaluate(old=>window.__L5R_TEST__.applyData(old),old);
        check('NAMED-OLD-SAVE-'+version,(await row(page,'Way of the Land')).cost,2);
        check('NAMED-OLD-OPTIONAL-'+version,(await row(page,'Way of the Land')).warning,false);
      }
    });
    await section('NAMED-FUTURE-CONFIG', async () => {
      const base=await collect(page);
      const minimal={type:'knowledgePick',revision:1,subject:'Kolat'};
      await page.evaluate(data=>window.__L5R_TEST__.applyData(data),{...base,adv:[{name:'Forbidden Knowledge',cost:'99',desc:'',config:minimal}]});
      check('NAMED-OMITTED-OPTIONAL-NOTES',(await row(page,'Forbidden Knowledge')).warning,false);
      check('NAMED-OMITTED-OPTIONAL-PRICE',(await row(page,'Forbidden Knowledge')).cost,5);
      check('NAMED-OMITTED-OPTIONAL-PRESERVED',(await collect(page)).adv[0].config,minimal);
      await page.evaluate(data=>window.__L5R_TEST__.applyData(data),{...base,adv:[{name:'Way of the Land',cost:'2',desc:'',config:{type:'regionPick',revision:1}}]});
      check('NAMED-OMITTED-OPTIONAL-REGION',(await row(page,'Way of the Land')).warning,false);
      for(const config of [
        {type:'targetStatusPick',revision:99,target:'Unknown future',targetStatus:3,futureField:'preserve'},
        {type:'futurePick',revision:1,target:'Unknown type',targetStatus:3},
        {type:'targetStatusPick',revision:1,target:'Fractional',targetStatus:2.5}]) {
        await page.evaluate(data=>window.__L5R_TEST__.applyData(data),{...base,adv:[{name:'Blackmail',cost:'7',desc:'legacy',config}]});
        check('NAMED-INVALID-PRESERVED-'+config.target,(await collect(page)).adv[0].config,config);
        check('NAMED-INVALID-WARN-'+config.target,(await row(page,'Blackmail')).warning);
        check('NAMED-INVALID-COST-'+config.target,(await row(page,'Blackmail')).cost,7);
      }
      const wrong={type:'targetStatusPick',revision:1,target:'Wrong side',targetStatus:4};
      await page.evaluate(data=>window.__L5R_TEST__.applyData(data),{...base,adv:[],disadv:[{name:'Blackmail',cost:'4',desc:'',config:wrong}]});
      check('NAMED-WRONG-SIDE-FLAG',await page.evaluate(()=>/Advantages|wrong|belongs/i.test(document.querySelector('#disadvList .adv-config-row').textContent)));
    });
    await section('NAMED-TEXT-SAFETY', async () => {
      const malicious='<img src=x onerror="window.NAMED_INJECTED=1"> & "Q"';
      await configured(page,'Forbidden Knowledge',[malicious,malicious]);
      check('NAMED-TEXT-AS-TEXT',(await row(page,'Forbidden Knowledge')).config.subject,malicious);
      check('NAMED-NO-INJECTION',await page.evaluate(()=>!window.NAMED_INJECTED && !document.querySelector('#advList .adv-config-row img')));
      await edit(page,'Forbidden Knowledge');
      check('NAMED-EDIT-TEXT-ROUNDTRIP',await page.locator('#advConfigGrid input').first().inputValue(),malicious);
      await cancel(page);
    });
    await section('NAMED-GEOMETRY', async () => {
      for(const width of [320,375,768,1440]) {
        await page.setViewportSize({width,height:900});
        await reset(page);await add(page,'Forbidden Knowledge');
        const geometry=await page.evaluate(()=>{
          const grid=document.getElementById('advConfigGrid'),box=grid.getBoundingClientRect();
          const elements=[...grid.querySelectorAll('input,textarea,label')];
          return {fits:elements.every(el=>{const r=el.getBoundingClientRect();return r.left>=box.left-1&&r.right<=box.right+1;}),
            inputsReadable:elements.filter(el=>/INPUT|TEXTAREA/.test(el.tagName)).every(el=>parseFloat(getComputedStyle(el).fontSize)>=16),
            labelsReadable:elements.filter(el=>el.tagName==='LABEL').every(el=>parseFloat(getComputedStyle(el).fontSize)>=12),
            labelled:elements.filter(el=>/INPUT|TEXTAREA/.test(el.tagName)).every(el=>el.labels.length>0)};
        });
        check('NAMED-GEOMETRY-'+width,geometry,{fits:true,inputsReadable:true,labelsReadable:true,labelled:true});
        await fill(page,['AnUnbrokenSubject'.repeat(15),'Long note '.repeat(60)]);await confirm(page);
        // Activate the real tab rather than inspecting off-screen carousel geometry.
        await page.evaluate(()=>document.querySelector('#advList').scrollIntoView());
        const fit=await page.evaluate(()=>{
          const row=document.querySelector('#advList .adv-config-row');
          return row.scrollWidth<=row.clientWidth+1;
        });
        check('NAMED-LONG-BADGE-'+width,fit);
      }
    });
    check('NAMED-BROWSER-ERRORS',errors,[]);
  } finally {await browser.close();}
}
main().catch(error=>check('NAMED-FATAL',String(error.stack||error),'no exception')).finally(()=>{
  const passed=results.filter(r=>r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  console.log('NAMED4513_QA_RESULT='+JSON.stringify({passed,total:results.length,failed:results.length-passed}));
  process.exitCode=results.length>0&&passed===results.length?0:1;
});
