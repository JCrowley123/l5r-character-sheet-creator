/* Real-browser acceptance tests for Seven Fortunes' Blessing (A01, Feature 4.5.21).
 * Oracles from Core pp.153-154 as recorded in SOURCE-CORE-PREPARATION.md and the owner-agreed
 * design in the audit's "A01 decisions", never from FB4521. Dice are counted on real rolls;
 * Trait values come from the sheet's own lookup.
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
let PAGE = null;
async function section(id, fn) {
  try { await fn(); } catch (error) { check(id, String(error.stack || error), 'no exception'); }
  if (PAGE) await closeRoll(PAGE);
}
const NAME = 'Seven Fortunes’ Blessing';
// Source table: Fortune -> [normal XP, discounted Clans, effect keyword the Rule text must carry].
const TABLE = [
  ['Benten', 4, ['Crane'], /\+0k1.*persuade.*not coercion/i],
  ['Bishamon', 5, ['Crab', 'Lion'], /\+1k0 on Strength Trait Rolls.*three successful Raises.*Increased Damage.*Free Raises do not count/i],
  ['Daikoku', 4, ['Mantis'], /\+1k1 on all Commerce Skill Rolls/i],
  ['Ebisu', 4, ['Unicorn'], /\+1k1 on Social Skill Rolls.*not samurai/i],
  ['Fukurokujin', 4, ['Dragon', 'Phoenix'], /Lore Skill.*\+1k1/i],
  ['Hotei', 4, [], /Contested Void Roll.*\+10/i],
  ['Jurojin', 4, ['Scorpion'], /\+2k0.*disease or poison/i],
];
const cfg = (fortune, lore) => Object.assign({type:'fortuneBlessing', revision:1, fortune, value:fortune}, lore ? {lore} : {});
const row = (fortune, lore, cost = '4') => ({name:NAME, cost, desc:'', config:cfg(fortune, lore)});

async function setup(page, {clan = '', adv = [], disadv = [], skills = []} = {}) {
  await page.evaluate(({clan, adv, disadv, skills}) => {
    const T = window.__L5R_TEST__; T.closeAdvConfigModal(); T.resetToBaseline();
    document.getElementById('f_clan').value = clan; T.recalcAll();
    T.applyData(Object.assign(T.collectData(), {adv, disadv})); T.recalcAll();
    for (const [name, trait, rank] of skills) {
      document.getElementById('addSkill').click();
      const tr = [...document.querySelectorAll('#skillsBody tr')].pop();
      tr.querySelector('.sk-name').value = name; tr.querySelector('.sk-trait').value = trait; tr.querySelector('.sk-rank').value = String(rank);
    }
    T.recalcAll();
  }, {clan, adv, disadv, skills});
}
const first = (page, list = 'advList') => page.evaluate(list => {
  const d = document.querySelector('#' + list + ' .entry');
  return d ? {cost:Number(d.querySelector('.en-cost').value), config:JSON.parse(d.dataset.advConfig || 'null'),
    badge:d.querySelector('.fb4521-badge')?.textContent || '', reminder:d.querySelector('.fb4521-reminder')?.textContent || '',
    text:d.querySelector('.adv-config-row')?.textContent || '', hasRow:!!d.querySelector('.adv-config-row'),
    warning:!!d.querySelector('.adv-config-warn'), hoteiButton:!!d.querySelector('.fb4521-hotei-roll')} : null;
}, list);
const trait = (page, n) => page.evaluate(n => window.__L5R_TEST__.getTraitValueByName(n), n);
const ring = (page, n) => page.evaluate(n => window.__L5R_TEST__.getRingValueByName(n), n);
const labels = (page, kind, ctx) => page.evaluate(({kind, ctx}) => { const T = window.__L5R_TEST__;
  return T.RD4515.offered(T.makeRollContext(T.ROLL_KINDS[kind], ctx)).filter(o => o.provider === 'fortune-blessing').map(o => o.key.split(':')[1]); }, {kind, ctx});
const autoMods = (page, kind, ctx) => page.evaluate(({kind, ctx}) => { const T = window.__L5R_TEST__;
  return T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS[kind], ctx)).filter(m => /Blessing/.test(m.label)).map(m => [m.rolledDelta, m.keptDelta, m.totalDelta]); }, {kind, ctx});

// Real roll through the preview. `tick` lists declaration keys to tick before rolling.
async function roll(page, kind, ctx, base, tick = []) {
  const pending = page.evaluate(({kind, ctx, base}) => { const T = window.__L5R_TEST__;
    window.__FB_CTX = T.makeRollContext(T.ROLL_KINDS[kind], ctx);
    return T.rollWithModifiers('Blessing probe', window.__FB_CTX, base[0], base[1]); }, {kind, ctx, base});
  pending.catch(() => {});   // an aborted roll must never become an unhandled rejection
  try {
  await page.waitForSelector('#rollPreviewGo', {state:'visible'});
  const boxes = await page.evaluate(() => [...document.querySelectorAll('#rollPreviewBody input[data-rd4515-key^="fortune-blessing:"]')].map(i => [i.dataset.rd4515Key.split(':')[1], i.checked]));
  for (const k of tick) await page.locator('#rollPreviewBody input[data-rd4515-key="fortune-blessing:' + k + '"]').check();
  const total = await page.evaluate(() => window.__L5R_TEST__.getPreRollModifiers(window.__FB_CTX).reduce((s, m) => s + m.totalDelta, 0));
  await page.locator('#rollPreviewGo').click(); await pending;
  await page.waitForSelector('#rollDiceRow .roll-die');
  const r = await page.evaluate(() => ({dice:document.querySelectorAll('#rollDiceRow .roll-die').length, kept:document.querySelectorAll('#rollDiceRow .roll-die.kept').length,
    title:document.getElementById('rollModalTitle')?.textContent || ''}));
  return {...r, boxes, total};
  } finally { await closeRoll(page); }
}
// Leaves no preview or result modal behind, whatever happened, so one failed section cannot
// block the next one's clicks.
async function closeRoll(page) {
  if (await page.locator('#rollPreviewCancel').isVisible().catch(() => false)) await page.locator('#rollPreviewCancel').click({timeout:2000}).catch(() => {});
  await page.keyboard.press('Escape').catch(() => {});
  await page.evaluate(() => { const o = document.getElementById('rollModalOverlay'); if (o) o.style.display = 'none'; }).catch(() => {});
}

async function main() {
  if (!process.argv[2]) throw Error('Pass the built HTML path');
  const browser = await chromium.launch(process.env.L5R_CHROME ? {executablePath:process.env.L5R_CHROME} : {});
  try {
    const page = await browser.newPage({viewport:{width:375, height:812}, acceptDownloads:true});
    page.setDefaultTimeout(6000);
    PAGE = page;
    await page.route('https://fonts.googleapis.com/**', r => r.abort());
    await page.route('https://fonts.gstatic.com/**', r => r.abort());
    const errors = []; page.on('pageerror', e => errors.push(String(e)));
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href, {waitUntil:'domcontentloaded'});
    await page.waitForFunction(() => !!window.__L5R_TEST__);

    await section('FB-START', async () => {
      check('FB-ENABLED', await page.evaluate(() => window.__L5R_TEST__.ADV_FORTUNE_BLESSING_ENABLED));
      check('FB-SCHEMA', await page.evaluate(n => window.__L5R_TEST__.advConfigSchemaFor(n)?.type, NAME), 'fortuneBlessing');
      check('FB-REGISTRY-SEVEN', await page.evaluate(() => window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.length), 7);
      check('FB-PROVIDER', await page.evaluate(() => window.__L5R_TEST__.RD4515.providerIds().includes('fortune-blessing')));
    });

    await section('FB-PICKER', async () => {
      await setup(page, {skills:[['Lore: Theology', 'Intelligence', 1], ['Lore: History', 'Intelligence', 0]]});
      const initial = await page.locator('#f_xpSpent').inputValue().then(Number);
      await page.evaluate(n => { const s = document.getElementById('advQuickAdd'); s.value = n; s.dispatchEvent(new Event('change', {bubbles:true})); }, NAME);
      await page.waitForSelector('#advConfigGrid .fb4521-option', {state:'visible'});
      const items = await page.evaluate(() => [...document.querySelectorAll('#advConfigGrid .fb4521-item')].map(i => ({v:i.querySelector('input').value, c:i.querySelector('input').checked,
        l:i.querySelector('input').labels.length, rule:i.querySelector('details.fb4521-rule')?.textContent || '', open:i.querySelector('details.fb4521-rule')?.open})));
      check('FB-SEVEN-IN-PRINTED-ORDER', items.map(i => i.v), TABLE.map(t => t[0]));
      TABLE.forEach(([f, , , re], i) => check('FB-RULE-' + f, re.test(items[i].rule)));
      check('FB-RULES-CLOSED-NONE-PICKED', items.every(i => !i.c && i.l === 1 && i.open === false));
      check('FB-LORE-HIDDEN', await page.locator('#advConfigGrid .fb4521-lore').isVisible(), false);
      await page.locator('#advConfigConfirm').click();
      check('FB-REQUIRES-CHOICE', [await page.locator('#advConfigModalOverlay').isVisible(), await page.locator('#advConfigGrid [role=alert]').isVisible(), (await first(page)).config], [true, true, null]);
      await page.locator('#advConfigGrid input[value="Fukurokujin"]').check();
      check('FB-LORE-SHOWN', await page.locator('#advConfigGrid .fb4521-lore').isVisible());
      check('FB-LORE-SUGGESTS-OWN', await page.evaluate(() => [...document.querySelectorAll('#fb4521LoreList option')].map(o => o.value)), ['Lore: Theology', 'Lore: History']);
      await page.locator('#advConfigConfirm').click();
      check('FB-LORE-REQUIRED', [await page.locator('#advConfigModalOverlay').isVisible(), (await first(page)).config], [true, null]);
      await page.locator('#fb4521Lore').fill('Theology'); await page.locator('#advConfigConfirm').click();
      check('FB-LORE-MUST-BE-LORE', (await first(page)).config, null);
      await page.locator('#fb4521Lore').fill('  lore:   theology '); await page.locator('#advConfigConfirm').click();
      const r = await first(page);
      check('FB-CONFIG-FUKUROKUJIN', r.config, cfg('Fukurokujin', 'Lore: theology'));
      check('FB-PRICE-TOTAL', [r.cost, (await page.locator('#f_xpSpent').inputValue().then(Number)) - initial], [4, 4]);
      await page.locator('#advList .adv-config-btn').first().click();
      check('FB-EDIT-SHOWS-CURRENT', [await page.evaluate(() => document.querySelector('#advConfigGrid input:checked')?.value), await page.locator('#fb4521Lore').inputValue()], ['Fukurokujin', 'Lore: theology']);
      await page.locator('#advConfigGrid input[value="Bishamon"]').check(); await page.locator('#advConfigConfirm').click();
      const b = await first(page);
      check('FB-SWITCH-CLEARS-LORE-AND-REPRICES', [b.config, b.cost], [cfg('Bishamon'), 5]);
    });

    await section('FB-PRICE', async () => {
      const clans = ['Crane', 'Crab', 'Lion', 'Mantis', 'Unicorn', 'Dragon', 'Phoenix', 'Scorpion', 'Scorpion Clan', ''];
      for (const [f, base, discount] of TABLE) {
        const got = [], want = [];
        for (const clan of clans) {
          await setup(page, {clan, adv:[row(f, f === 'Fukurokujin' ? 'Lore: Theology' : null, '9')]});
          got.push((await first(page)).cost);
          want.push(base - (discount.includes(clan.replace(/ Clan$/, '')) ? 1 : 0));
        }
        check('FB-PRICE-' + f, got, want);
      }
      await setup(page, {clan:'Lion', adv:[row('Bishamon')]});
      check('FB-PRICE-REASON', /4 XP: Crab or Lion price/.test((await first(page)).reminder));
    });

    await section('FB-AUTOMATIC', async () => {
      await setup(page, {adv:[row('Bishamon'), row('Daikoku'), row('Fukurokujin', 'Lore: Theology')]});
      const str = await trait(page, 'Strength'), intel = await trait(page, 'Intelligence');
      const s = await roll(page, 'TRAIT', {traitName:'Strength', traitValue:str}, [str, str]);
      check('FB-BISHAMON-STRENGTH-TRAIT-ROLL', [s.dice, s.kept], [str + 1, str]);
      check('FB-BISHAMON-NOT-OTHER-TRAIT', await autoMods(page, 'TRAIT', {traitName:'Agility'}), []);
      check('FB-BISHAMON-NOT-SKILL-USING-STRENGTH', await autoMods(page, 'SKILL', {skillName:'Athletics', traitName:'Strength', skillRank:2}), []);
      check('FB-BISHAMON-NOT-DAMAGE', await autoMods(page, 'DAMAGE', {traitName:'Strength', skillName:'Kenjutsu'}), []);
      const c = await roll(page, 'SKILL', {skillName:'Commerce', traitName:'Intelligence', skillRank:1, traitValue:intel}, [intel + 1, intel]);
      check('FB-DAIKOKU-COMMERCE', [c.dice, c.kept], [intel + 2, intel + 1]);
      check('FB-DAIKOKU-COMMERCE-EMPHASIS', await autoMods(page, 'SKILL', {skillName:'Commerce (Appraisal)', skillRank:1}), [[1, 1, 0]]);
      check('FB-DAIKOKU-NOT-OTHER', await autoMods(page, 'SKILL', {skillName:'Craft: Commerce', skillRank:1}), []);
      const l = await roll(page, 'SKILL', {skillName:'lore:theology', traitName:'Intelligence', skillRank:1, traitValue:intel}, [intel + 1, intel]);
      check('FB-FUKUROKUJIN-CHOSEN-LORE', [l.dice, l.kept], [intel + 2, intel + 1]);
      check('FB-FUKUROKUJIN-OTHER-LORE', await autoMods(page, 'SKILL', {skillName:'Lore: History', skillRank:1}), []);
      check('FB-FUKUROKUJIN-BARE-LORE', await autoMods(page, 'SKILL', {skillName:'Lore', skillRank:1}), []);
      await setup(page, {adv:[row('Benten')]});
      check('FB-NO-AUTO-FOR-OTHERS', await autoMods(page, 'TRAIT', {traitName:'Strength'}), []);
    });

    await section('FB-DECLARATIONS', async () => {
      await setup(page, {adv:[row('Benten'), row('Ebisu'), row('Jurojin'), row('Hotei')]});
      const aw = await trait(page, 'Awareness');
      check('FB-SOCIAL-OFFERS', [await labels(page, 'SKILL', {skillName:'Etiquette', skillRank:1}), await labels(page, 'SKILL', {skillName:'Perform: Storytelling', skillRank:1})],
        [['benten', 'ebisu', 'jurojin', 'hotei'], ['benten', 'ebisu', 'jurojin', 'hotei']]);
      check('FB-NON-SOCIAL-SKILL', await labels(page, 'SKILL', {skillName:'Hunting', skillRank:1}), ['jurojin', 'hotei']);
      check('FB-RESIST-KINDS', [await labels(page, 'TRAIT', {traitName:'Stamina'}), await labels(page, 'RING', {ringName:'Earth'}), await labels(page, 'MANUAL', {notation:'4k2'})],
        [['jurojin', 'hotei'], ['jurojin', 'hotei'], ['jurojin', 'hotei']]);
      check('FB-NOT-ON-ATTACK-SPELL-DAMAGE', [await labels(page, 'ATTACK', {skillName:'Kenjutsu'}), await labels(page, 'SPELL', {element:'Fire'}), await labels(page, 'DAMAGE', {traitName:'Strength'})], [[], [], []]);
      const ctx = {skillName:'Etiquette', traitName:'Awareness', skillRank:1, traitValue:aw}, base = [aw + 1, aw];
      const plain = await roll(page, 'SKILL', ctx, base);
      check('FB-UNTICKED-BY-DEFAULT', [plain.boxes.every(([, c]) => !c), plain.dice, plain.kept], [true, aw + 1, aw]);
      const benten = await roll(page, 'SKILL', ctx, base, ['benten']);
      check('FB-BENTEN-PLUS-0K1', [benten.dice, benten.kept], [aw + 1, aw + 1]);
      const after = await roll(page, 'SKILL', ctx, base);
      check('FB-FRESH-EACH-ROLL', [after.boxes.every(([, c]) => !c), after.kept], [true, aw]);
      const ebisu = await roll(page, 'SKILL', ctx, base, ['ebisu']);
      check('FB-EBISU-PLUS-1K1', [ebisu.dice, ebisu.kept], [aw + 2, aw + 1]);
      const sta = await trait(page, 'Stamina');
      const jurojin = await roll(page, 'TRAIT', {traitName:'Stamina', traitValue:sta}, [sta, sta], ['jurojin']);
      check('FB-JUROJIN-PLUS-2K0', [jurojin.dice, jurojin.kept], [sta + 2, sta]);
      const hotei = await roll(page, 'TRAIT', {traitName:'Willpower'}, [2, 2], ['hotei']);
      check('FB-HOTEI-PLUS-10', [hotei.total, hotei.dice], [10, 2]);
      await setup(page, {adv:[row('Daikoku')]});
      check('FB-NOTHING-OFFERED-WITHOUT-FORTUNE', await labels(page, 'SKILL', {skillName:'Etiquette', skillRank:1}), []);
      await setup(page, {adv:[{name:NAME, cost:'4', desc:'legacy'}]});
      check('FB-NOTHING-OFFERED-UNCONFIGURED', await labels(page, 'SKILL', {skillName:'Etiquette', skillRank:1}), []);
    });

    await section('FB-HOTEI', async () => {
      await setup(page, {adv:[row('Hotei')]});
      const v = await ring(page, 'Void');
      check('FB-HOTEI-BUTTON', (await first(page)).hoteiButton);
      await page.locator('#advList .fb4521-hotei-roll').click({timeout:3000});
      await page.waitForSelector('#rollPreviewGo', {state:'visible'});
      await page.locator('#rollPreviewGo').click(); await page.waitForSelector('#rollDiceRow .roll-die');
      const r = await page.evaluate(() => ({dice:document.querySelectorAll('#rollDiceRow .roll-die').length, kept:document.querySelectorAll('#rollDiceRow .roll-die.kept').length, title:document.getElementById('rollModalTitle').textContent}));
      await closeRoll(page);
      check('FB-HOTEI-CONTESTED-VOID-ROLL', [r.dice, r.kept, /Contested Void Roll/.test(r.title) && /Hotei/.test(r.title)], [v, v, true]);
      const before = await page.evaluate(() => Number(document.getElementById('void_current').value));
      await page.locator('#voidPips .void-pip.filled').first().click();
      check('FB-HOTEI-OWN-VOID-UNAFFECTED', await page.evaluate(() => Number(document.getElementById('void_current').value)), before - 1);
      await setup(page, {adv:[row('Benten')]});
      check('FB-NO-BUTTON-OTHERS', (await first(page)).hoteiButton, false);
    });

    await section('FB-PERSISTENCE', async () => {
      await setup(page, {clan:'Phoenix', adv:[row('Fukurokujin', 'Lore: Theology')]});
      const saved = await page.evaluate(() => window.__L5R_TEST__.collectData());
      const downloadPromise = page.waitForEvent('download');
      await page.locator('#btnExport').evaluate(b => b.click());
      const stream = await (await downloadPromise).createReadStream();
      const chunks = []; for await (const chunk of stream) chunks.push(chunk);
      await setup(page);
      await page.locator('#fileImport').setInputFiles({name:'f.l5r.json', mimeType:'application/json', buffer:Buffer.concat(chunks)});
      await page.waitForFunction(() => document.querySelectorAll('#advList .entry').length === 1);
      check('FB-IMPORT', [(await page.evaluate(() => window.__L5R_TEST__.collectData())).adv, (await first(page)).badge], [saved.adv, 'Fukurokujin’s Blessing — Lore: Theology']);
      await page.locator('#btnSave').evaluate(b => b.click());
      await page.waitForFunction(() => document.getElementById('charSelect').value !== '');
      const id = await page.locator('#charSelect').inputValue();
      await page.reload({waitUntil:'domcontentloaded'}); await page.waitForFunction(() => !!window.__L5R_TEST__);
      await page.locator('#charSelect').selectOption(id);
      await page.locator('#btnLoad').evaluate(b => b.click());
      await page.waitForFunction(() => document.querySelectorAll('#advList .entry').length === 1);
      check('FB-LOCAL-RELOAD', (await page.evaluate(() => window.__L5R_TEST__.collectData())).adv, saved.adv);
      await setup(page, {adv:[{name:NAME, cost:'5', desc:'legacy'}]});
      check('FB-LEGACY-KEEPS-COST', [(await first(page)).warning, (await first(page)).cost], [true, 5]);
      for (const [idc, config] of [['UNKNOWN', {type:'fortuneBlessing', revision:1, fortune:'Inari'}], ['CASE', {type:'fortuneBlessing', revision:1, fortune:'bishamon'}],
        ['FUKU-NO-LORE', {type:'fortuneBlessing', revision:1, fortune:'Fukurokujin'}], ['FUKU-BAD-LORE', {type:'fortuneBlessing', revision:1, fortune:'Fukurokujin', lore:'Theology'}],
        ['LORE-ON-OTHER', {type:'fortuneBlessing', revision:1, fortune:'Bishamon', lore:'Lore: Theology'}], ['FUTURE', {type:'fortuneBlessing', revision:2, fortune:'Bishamon'}],
        ['EXTRA', {type:'fortuneBlessing', revision:1, fortune:'Bishamon', bonus:1}], ['CURSE-TYPE', {type:'fortunePick', fortune:'Bishamon'}]]) {
        await setup(page, {adv:[{name:NAME, cost:'9', desc:'', config}]});
        const r = await first(page);
        check('FB-INVALID-' + idc, [(await page.evaluate(() => window.__L5R_TEST__.collectData())).adv[0].config, r.warning && /Saved setting kept/.test(r.text), r.cost,
          await autoMods(page, 'TRAIT', {traitName:'Strength'})], [config, true, 9, []]);
      }
      await setup(page, {disadv:[row('Bishamon')]});
      check('FB-WRONG-SIDE', [/belongs in Advantages/.test((await first(page, 'disadvList')).text), await autoMods(page, 'TRAIT', {traitName:'Strength'})], [true, []]);
    });

    await section('FB-RENAME-INFO', async () => {
      await setup(page, {adv:[row('Jurojin')]});
      await page.locator('#advList .fb4521-info').click();
      const info = await page.locator('#stanceInfoBody').textContent();
      check('FB-INFO', /Core pp\.153/.test(await page.locator('#stanceInfoRing').textContent()) && /Your Fortune: Jurojin/.test(info) &&
        TABLE.every(([f, base]) => info.includes(f + '’s Blessing (' + base + ' XP')));
      await page.locator('#stanceInfoClose').click();
      await page.evaluate(() => { const d = document.querySelector('#advList .entry'); d.querySelector('.en-name').value = 'Unrelated'; window.__L5R_TEST__.recalcAll(); });
      check('FB-RENAMED-CLEAN', [(await first(page)).hasRow, (await first(page)).config, await labels(page, 'TRAIT', {traitName:'Stamina'})], [false, null, []]);
    });

    await section('FB-GEOMETRY', async () => {
      for (const width of [320, 375, 768, 1440]) {
        await page.setViewportSize({width, height:700});
        await setup(page);
        await page.evaluate(n => { const s = document.getElementById('advQuickAdd'); s.value = n; s.dispatchEvent(new Event('change', {bubbles:true})); }, NAME);
        await page.waitForSelector('#advConfigGrid .fb4521-option', {state:'visible'});
        await page.evaluate(() => document.querySelectorAll('#advConfigGrid details.fb4521-rule').forEach(d => d.open = true));
        await page.locator('#advConfigGrid input[value="Fukurokujin"]').check();
        const g = await page.evaluate(() => {
          const grid = document.getElementById('advConfigGrid').getBoundingClientRect();
          const inside = el => { const r = el.getBoundingClientRect(); return r.left >= grid.left - 1 && r.right <= grid.right + 1 && el.scrollWidth <= el.clientWidth + 1; };
          const opts = [...document.querySelectorAll('#advConfigGrid .fb4521-option')];
          return {fits:opts.every(inside) && [...document.querySelectorAll('#advConfigGrid .fb4521-rule')].every(inside) && inside(document.getElementById('fb4521Lore')),
            readable:opts.every(o => parseFloat(getComputedStyle(o).fontSize) >= 12 && getComputedStyle(o).textTransform === 'none' && o.getBoundingClientRect().height >= 32)};
        });
        await page.locator('#fb4521Lore').fill('Lore: Theology'); await page.locator('#advConfigConfirm').click();
        const reachable = !(await page.locator('#advConfigModalOverlay').isVisible()) && (await first(page)).config?.fortune === 'Fukurokujin';
        const rowFit = await page.evaluate(() => { const r = document.querySelector('#advList .adv-config-row'); return r.scrollWidth <= r.clientWidth + 1; });
        check('FB-GEOMETRY-' + width, {...g, reachable, rowFit}, {fits:true, readable:true, reachable:true, rowFit:true});
      }
      await page.setViewportSize({width:375, height:812});
    });
    check('FB-BROWSER-ERRORS', errors, []);
  } finally { await browser.close(); }
}
main().catch(error => check('FB-FATAL', String(error.stack || error), 'no exception')).finally(() => {
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  console.log('FB4521_QA_RESULT=' + JSON.stringify({passed, total:results.length, failed:results.length - passed}));
  process.exitCode = results.length > 0 && passed === results.length ? 0 : 1;
});
