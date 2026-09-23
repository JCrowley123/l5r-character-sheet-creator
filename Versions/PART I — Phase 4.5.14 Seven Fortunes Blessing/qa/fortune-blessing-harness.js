/* Real-browser acceptance tests for A01 - Seven Fortunes' Blessing: UI, XP totals, persistence,
 * and absence of side effects. No expected rule values are obtained from FB4514 or its resolver
 * -- every expected number below is copied from the audit's own source table
 * (PART I - Phase 4.5 Remaining Configuration Audit/SOURCE-CORE-PREPARATION.md, "A01 - Seven
 * Fortunes' Blessing"), independently of the fragment under test.
 * Modelled on Feature 4.5.13's own named-advantages-harness.js -- same helpers where the UI
 * shape matches, replaced where it doesn't (a Fortune picker grid instead of free-text fields).
 *
 * node fortune-blessing-harness.js <sheet.html>
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
const NAME = 'Seven Fortunes’ Blessing';
// Source-confirmed table, copied from the audit rather than from FB4514.
const SOURCE = {
  Benten:      {award:4, clanAward:3, clans:['Crane']},
  Bishamon:    {award:5, clanAward:4, clans:['Crab','Lion']},
  Daikoku:     {award:4, clanAward:3, clans:['Mantis']},
  Ebisu:       {award:4, clanAward:3, clans:['Unicorn']},
  Fukurokujin: {award:4, clanAward:3, clans:['Dragon','Phoenix'], lore:true},
  Hotei:       {award:4, clanAward:null, clans:[]},
  Jurojin:     {award:4, clanAward:3, clans:['Scorpion']},
};
async function reset(page, clan = '') {
  await page.evaluate(clan => {
    const T = window.__L5R_TEST__;
    T.closeAdvConfigModal();
    T.resetToBaseline();
    document.getElementById('f_clan').value = clan;
    T.recalcAll();
  }, clan);
}
async function add(page) {
  await page.evaluate(name => {
    const select = document.getElementById('advQuickAdd');
    select.value = name;
    if (select.value !== name) throw Error('Missing catalogue option ' + name);
    select.dispatchEvent(new Event('change', {bubbles:true}));
  }, NAME);
  await page.waitForSelector('#advConfigGrid .affinity-pick-item', {state:'visible', timeout:3000});
}
async function pick(page, fortune) {
  await page.locator('#advConfigGrid .affinity-pick-item[data-value="' + fortune + '"] input[type=checkbox]').check();
}
async function fillLore(page, text) {
  await page.locator('#fortuneBlessing4514Lore').fill(String(text));
}
async function confirm(page) { await page.locator('#advConfigConfirm').click(); }
async function cancel(page) { await page.locator('#advConfigX').click(); }
async function row(page) {
  return page.evaluate(name => {
    const div = [...document.querySelectorAll('#advList .entry')].find(d => d.querySelector('.en-name').value === name);
    if (!div) return null;
    return {cost:Number(div.querySelector('.en-cost').value), config:JSON.parse(div.dataset.advConfig || 'null'),
      text:div.querySelector('.adv-config-row')?.textContent || '',
      warning:!!div.querySelector('.adv-config-warn'), html:div.innerHTML};
  }, NAME);
}
async function edit(page) {
  await page.evaluate(name => {
    const div = [...document.querySelectorAll('#advList .entry')].find(d => d.querySelector('.en-name').value === name);
    div.querySelector('.adv-config-btn').click();
  }, NAME);
  await page.waitForSelector('#advConfigGrid .affinity-pick-item', {state:'visible', timeout:3000});
}
async function configured(page, fortune, {lore, clan} = {}) {
  await reset(page, clan || '');
  await add(page);
  await pick(page, fortune);
  if (lore !== undefined) await fillLore(page, lore);
  await confirm(page);
  return row(page);
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
    await section('FB-START', async () => {
      check('FB-ENABLED', await page.evaluate(() => window.__L5R_TEST__.ADV_FORTUNE_BLESSING_ENABLED));
      check('FB-REGISTRY', await page.evaluate(() => window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.map(x=>[x.id,x.priority]).sort((a,b)=>a[1]-b[1])),
        [['range',20],['arrow',25],['stance',30],['offhand',35],['wounds',40],['void',50],['adv-config',60]]);
      check('FB-SCHEMA-TYPE', await page.evaluate(name => window.__L5R_TEST__.advConfigSchemaFor(name)?.type, NAME), 'fortuneBlessingPick');
      check('FB-FORTUNE-NAMES', await page.evaluate(() => window.__L5R_TEST__.FB4514.fortuneNames()),
        Object.keys(SOURCE));
    });
    await section('FB-BLANK', async () => {
      await reset(page); const initial = await xp(page);
      await add(page);
      check('FB-BLANK-PRICE', (await row(page)).cost, 0);
      check('FB-BLANK-WARN', (await row(page)).warning);
      await confirm(page);
      check('FB-BLANK-CONFIRM-REJECTED', await page.locator('#advConfigModalOverlay').isVisible());
      check('FB-BLANK-NO-COMMIT', (await row(page)).config, null);
      await cancel(page);
      check('FB-BLANK-XP-UNCHANGED', await xp(page), initial);
    });
    await section('FB-PRICING', async () => {
      for (const fortune of Object.keys(SOURCE)) {
        const spec = SOURCE[fortune];
        const extra = spec.lore ? {lore:'Lore: Bushido'} : {};
        const noClan = await configured(page, fortune, extra);
        check('FB-PRICE-NOCLAN-'+fortune, noClan.cost, spec.award);
        if (spec.clans.length) {
          for (const clan of spec.clans) {
            const withClan = await configured(page, fortune, {...extra, clan});
            check('FB-PRICE-CLAN-'+fortune+'-'+clan, withClan.cost, spec.clanAward);
          }
          const wrongClan = await configured(page, fortune, {...extra, clan:'Crab' === spec.clans[0] ? 'Lion' : 'Crab'});
          // Bishamon lists both Crab and Lion, so probe with a genuinely ineligible Clan instead.
          if (fortune === 'Bishamon') {
            const ineligible = await configured(page, fortune, {...extra, clan:'Phoenix'});
            check('FB-PRICE-INELIGIBLE-'+fortune, ineligible.cost, spec.award);
          } else {
            check('FB-PRICE-INELIGIBLE-'+fortune, wrongClan.cost, spec.award);
          }
        }
      }
    });
    await section('FB-FUKUROKUJIN', async () => {
      await reset(page); await add(page); await pick(page, 'Fukurokujin');
      check('FB-LORE-FIELD-VISIBLE', await page.locator('#fortuneBlessing4514Lore').isVisible());
      await pick(page, 'Benten');
      check('FB-LORE-FIELD-HIDDEN-AFTER-REPICK', await page.locator('#fortuneBlessing4514Lore').isVisible(), false);
      await pick(page, 'Fukurokujin');
      await confirm(page);
      check('FB-LORE-REQUIRED-REJECTED', await page.locator('#advConfigModalOverlay').isVisible());
      check('FB-LORE-NO-COMMIT', (await row(page)).config, null);
      check('FB-LORE-INLINE-VALIDATION', await page.locator('#advConfigGrid [role=alert]').isVisible());
      await fillLore(page, '  Lore: Shadowlands  '); await confirm(page);
      const actual = await row(page);
      check('FB-LORE-COST', actual.cost, 4);
      check('FB-LORE-CONFIG', [actual.config.type, actual.config.revision, actual.config.fortune, actual.config.loreSkill],
        ['fortuneBlessingPick', 1, 'Fukurokujin', 'Lore: Shadowlands']);
      check('FB-LORE-BADGE', actual.text.includes('Lore: Shadowlands'));
      // Re-pick to a non-lore Fortune must clear the Lore Skill field entirely, per the audit.
      await edit(page);
      check('FB-LORE-FIELD-VISIBLE-ON-REOPEN', await page.locator('#fortuneBlessing4514Lore').isVisible());
      await pick(page, 'Benten'); await confirm(page);
      const cleared = await row(page);
      check('FB-LORE-CLEARED', Object.hasOwn(cleared.config, 'loreSkill'), false);
      check('FB-LORE-CLEARED-FORTUNE', cleared.config.fortune, 'Benten');
    });
    await section('FB-EDIT-CANCEL', async () => {
      await configured(page, 'Jurojin', {clan:'Scorpion'});
      check('FB-EDIT-INITIAL', (await row(page)).cost, 3);
      await edit(page); await pick(page, 'Daikoku');
      await confirm(page);
      check('FB-EDIT-CHANGED', (await row(page)).config.fortune, 'Daikoku');
      check('FB-EDIT-REPRICED', (await row(page)).cost, 4);
      await edit(page); await pick(page, 'Hotei'); await cancel(page);
      check('FB-CANCEL-KEPT', (await row(page)).config.fortune, 'Daikoku');
    });
    await section('FB-INFO', async () => {
      await configured(page, 'Ebisu', {clan:'Unicorn'});
      await page.locator('#advList .fortuneBlessing4514-info').click();
      check('FB-INFO-OPEN', await page.locator('#stanceInfoOverlay').isVisible());
      const reference = await page.locator('#stanceInfoBody').textContent();
      check('FB-INFO-ALL-SEVEN', Object.keys(SOURCE).every(f => reference.includes(f)));
      check('FB-INFO-MANUAL', /managed manually/.test(reference));
      await page.locator('#stanceInfoClose').click();
      check('FB-INFO-CLOSE', await page.locator('#stanceInfoOverlay').isVisible(), false);
      await edit(page);
      const original = await collect(page);
      await page.locator('#advConfigGrid .fortuneBlessing4514-info').click();
      check('FB-INFO-NESTED', await page.locator('#stanceInfoOverlay').isVisible());
      await page.locator('#stanceInfoClose').click();
      check('FB-INFO-RETURNS-TO-PICKER', await page.locator('#advConfigModalOverlay').isVisible());
      check('FB-INFO-NO-CHANGE', await collect(page), original);
      await cancel(page);
      await page.evaluate(() => {document.querySelector('#advList .entry .rm-btn').click();});
      check('FB-DELETE-NO-OWNED-UI', await page.locator('#advList .fortuneBlessing4514-row').count(), 0);
      check('FB-DELETE-NO-SAVE-RESIDUE', (await collect(page)).adv, []);
      check('FB-DELETE-XP', await xp(page), 0);
    });
    await section('FB-WRONG-SIDE', async () => {
      const base = await collect(page);
      const wrong = {type:'fortuneBlessingPick', revision:1, fortune:'Jurojin', value:'Jurojin'};
      await page.evaluate(data => window.__L5R_TEST__.applyData(data), {...base, adv:[], disadv:[{name:NAME, cost:'4', desc:'', config:wrong}]});
      check('FB-WRONG-SIDE-FLAG', await page.evaluate(() => /Advantages|belongs/i.test(document.querySelector('#disadvList .adv-config-row').textContent)));
    });
    await section('FB-ISOLATION', async () => {
      await reset(page);
      const before = await collect(page);
      const pools = await page.evaluate(() => {
        const T = window.__L5R_TEST__;
        return Object.values(T.ROLL_KINDS).map(kind => T.getPreRollModifiers({kind, skillName:'Commerce', traitName:'Strength'}));
      });
      await add(page); await pick(page, 'Bishamon'); await confirm(page);
      const after = await collect(page);
      check('FB-XP-DELTA', Number(after.fields.f_xpSpent) - Number(before.fields.f_xpSpent), 5);
      for (const key of ['skills','equip','weapons','disadv','tech','traits','traitsFree','rings','voidCurrent','spellUsed','spellBonusUsed','spellBonusUsedVisual']) {
        check('FB-STATE-EXISTS-'+key, Object.hasOwn(before, key));
        check('FB-UNCHANGED-'+key, after[key], before[key]);
      }
      const fieldDiff = Object.keys(before.fields).filter(k => before.fields[k] !== after.fields[k]);
      check('FB-ONLY-XP-FIELDS', fieldDiff.filter(k => !['f_xpSpent','f_xpRemain','f_xpRemaining'].includes(k)), []);
      check('FB-NO-DICE-MODS', await page.evaluate(() => {
        const T = window.__L5R_TEST__;
        return Object.values(T.ROLL_KINDS).map(kind => T.getPreRollModifiers({kind, skillName:'Commerce', traitName:'Strength'}));
      }), pools);
      await page.evaluate(() => {for (let i=0;i<8;i++) window.__L5R_TEST__.recalcAll();});
      check('FB-RECALC-IDEMPOTENT', await collect(page), after);
      await page.evaluate(() => {const d=document.querySelector('#advList .entry'); d.querySelector('.en-name').value='Unrelated custom entry'; window.__L5R_TEST__.recalcAll();});
      check('FB-RENAMED-ROW-CLEAN', await page.evaluate(() => !document.querySelector('#advList .entry').querySelector('.adv-config-row')));
      check('FB-RENAMED-CONFIG-CLEAN', await page.evaluate(() => !document.querySelector('#advList .entry').dataset.advConfig));
    });
    await section('FB-PERSISTENCE', async () => {
      await reset(page);
      await configured(page, 'Fukurokujin', {lore:'Lore: Bushido', clan:'Dragon'});
      const saved = await collect(page);
      const downloadPromise = page.waitForEvent('download');
      await page.locator('#btnExport').evaluate(button => button.click());
      const stream = await (await downloadPromise).createReadStream();
      const chunks = []; for await (const chunk of stream) chunks.push(chunk);
      const bytes = Buffer.concat(chunks); const exported = JSON.parse(bytes.toString('utf8'));
      check('FB-EXPORT-CONFIG', exported.adv, saved.adv);
      check('FB-SCHEMA-COMPATIBLE', exported.schemaVersion, 3);
      await reset(page);
      await page.locator('#fileImport').setInputFiles({name:'blessing.l5r.json', mimeType:'application/json', buffer:bytes});
      await page.waitForFunction(() => document.querySelectorAll('#advList .entry').length === 1);
      check('FB-IMPORT-CONFIG', (await collect(page)).adv, saved.adv);
      await page.locator('#btnSave').evaluate(button => button.click());
      await page.waitForFunction(() => document.getElementById('charSelect').value !== '');
      const savedId = await page.locator('#charSelect').inputValue();
      await page.reload({waitUntil:'domcontentloaded'});
      await page.waitForFunction(() => !!window.__L5R_TEST__);
      await page.locator('#charSelect').selectOption(savedId);
      await page.locator('#btnLoad').evaluate(button => button.click());
      await page.waitForFunction(() => document.querySelectorAll('#advList .entry').length === 1);
      check('FB-LOCAL-SAVE-RELOAD', (await collect(page)).adv, saved.adv);
    });
    await section('FB-FUTURE-CONFIG', async () => {
      const base = await collect(page);
      for (const [label, config] of [
        ['unknown-revision', {type:'fortuneBlessingPick', revision:99, fortune:'Benten', futureField:'preserve'}],
        ['unknown-type', {type:'futureFortunePick', revision:1, fortune:'Benten'}],
        ['unknown-fortune', {type:'fortuneBlessingPick', revision:1, fortune:'Unknown Fortune'}],
        ['stray-lore-field', {type:'fortuneBlessingPick', revision:1, fortune:'Benten', loreSkill:'Lore: Should not be here'}],
        ['missing-lore-field', {type:'fortuneBlessingPick', revision:1, fortune:'Fukurokujin'}],
      ]) {
        await page.evaluate(data => window.__L5R_TEST__.applyData(data), {...base, adv:[{name:NAME, cost:'7', desc:'legacy', config}]});
        check('FB-INVALID-PRESERVED-'+label, (await collect(page)).adv[0].config, config);
        check('FB-INVALID-WARN-'+label, (await row(page)).warning);
        check('FB-INVALID-COST-'+label, (await row(page)).cost, 7);
      }
    });
    await section('FB-TEXT-SAFETY', async () => {
      const malicious = '<img src=x onerror="window.FB_INJECTED=1"> & "Q"';
      await configured(page, 'Fukurokujin', {lore:malicious});
      check('FB-TEXT-AS-TEXT', (await row(page)).config.loreSkill, malicious);
      check('FB-NO-INJECTION', await page.evaluate(() => !window.FB_INJECTED && !document.querySelector('#advList .adv-config-row img')));
      await edit(page);
      check('FB-EDIT-TEXT-ROUNDTRIP', await page.locator('#fortuneBlessing4514Lore').inputValue(), malicious);
      await cancel(page);
    });
    await section('FB-GEOMETRY', async () => {
      for (const width of [320, 375, 768, 1440]) {
        await page.setViewportSize({width, height:900});
        await reset(page); await add(page); await pick(page, 'Fukurokujin');
        const geometry = await page.evaluate(() => {
          const grid = document.getElementById('advConfigGrid'), box = grid.getBoundingClientRect();
          const elements = [...grid.querySelectorAll('input,textarea,label')];
          // Checkboxes render no text of their own -- the 16px anti-zoom rule applies only to
          // the text/textarea field a mobile keyboard would actually open on.
          return {fits: elements.every(el => {const r = el.getBoundingClientRect(); return r.left>=box.left-1 && r.right<=box.right+1;}),
            inputsReadable: elements.filter(el => el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && el.type !== 'checkbox'))
              .every(el => parseFloat(getComputedStyle(el).fontSize)>=16)};
        });
        check('FB-GEOMETRY-'+width, geometry, {fits:true, inputsReadable:true});
        await fillLore(page, 'AnUnbrokenSkillName'.repeat(15)); await confirm(page);
        await page.evaluate(() => document.querySelector('#advList').scrollIntoView());
        const fit = await page.evaluate(() => {
          const row = document.querySelector('#advList .adv-config-row');
          return row.scrollWidth <= row.clientWidth + 1;
        });
        check('FB-LONG-BADGE-'+width, fit);
      }
    });
    check('FB-BROWSER-ERRORS', errors, []);
  } finally {await browser.close();}
}
main().catch(error=>check('FB-FATAL', String(error.stack||error), 'no exception')).finally(()=>{
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  console.log('FB4514_QA_RESULT='+JSON.stringify({passed, total:results.length, failed:results.length-passed}));
  process.exitCode = results.length>0 && passed===results.length ? 0 : 1;
});
