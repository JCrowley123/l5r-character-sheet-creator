// Enters each suggested starting build through the real creation wizard and reports
// the sheet's own XP figures and validator findings. Scratch check for the design draft.
const { chromium } = require('playwright');
const path = require('path');
const APP = path.resolve(__dirname, '..', '..', '..', 'dist', 'index.html');
const URL = 'file://' + (process.argv[2] ? path.resolve(process.argv[2]) : APP);
const BUILDS = require(path.join(__dirname, 'builds.json'));

async function run(browser, build) {
  const ctx = await browser.newContext({viewport:{width:390,height:844}});
  await ctx.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, r => r.abort('blockedbyclient'));
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(URL);
  await page.waitForFunction(() => { const T = window.__L5R_TEST__; return T && T.CL11 && T.CL11.ready && T.CW112 && T.CW1121; }, null, {timeout: 20000});
  await page.evaluate(() => document.getElementById('cl11Toolbar') && document.getElementById('cl11Toolbar').click());
  await page.click('#cl11Create');
  await page.waitForFunction(() => !document.getElementById('cw112View').hidden);
  await page.fill('#cw112Name', build.label);
  const title = () => page.evaluate(() => document.getElementById('cw112Title').textContent);
  const next = async () => { await page.waitForFunction(() => !document.getElementById('cw112Next').disabled, null, {timeout:5000}); await page.click('#cw112Next'); };
  const toStep = async (t) => { for (let i = 0; i < 12 && (await title()) !== t; i++) await next(); };
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pick = (t) => page.locator('#cw112Body .cw112-card').filter({has: page.locator('.cw112-card-title', {hasText: new RegExp('^' + esc(t) + '$')})}).first().click();
  const modal = async (what) => {
    await page.waitForTimeout(400);
    const open = await page.evaluate(() => [...document.querySelectorAll('.roll-modal-overlay, [id$=ModalOverlay], [id$=Overlay]')].filter(o => getComputedStyle(o).display !== 'none' && o.offsetParent !== null || (o.style && o.style.display === 'flex')).map(o => o.id || o.className));
    for (let pageNo = 0; pageNo < 6 && (await page.evaluate(() => document.getElementById('advConfigModalOverlay').style.display === 'flex')); pageNo++) {
      const info = await page.evaluate(() => {
        const o = document.getElementById('advConfigModalOverlay');
        const grid = document.getElementById('advConfigGrid');
        // Take the first real option in every select, the first radio of each group, and a short name in any text box.
        grid.querySelectorAll('select').forEach(s => { const opt = [...s.options].find(x => x.value && !x.disabled); if (opt) { s.value = opt.value; s.dispatchEvent(new Event('change', {bubbles:true})); } });
        const seen = {}; grid.querySelectorAll('input[type=radio]').forEach(r => { if (!seen[r.name]) { seen[r.name] = 1; r.checked = true; r.dispatchEvent(new Event('change', {bubbles:true})); } });
        grid.querySelectorAll('input[type=number]').forEach(t => { if (t.value === '') { t.value = '0'; t.dispatchEvent(new Event('input', {bubbles:true})); t.dispatchEvent(new Event('change', {bubbles:true})); } });
        grid.querySelectorAll('input[type=text], textarea').forEach(t => { if (!t.value) { t.value = 'Example'; t.dispatchEvent(new Event('input', {bubbles:true})); t.dispatchEvent(new Event('change', {bubbles:true})); } });
        return document.getElementById('advConfigTitle').textContent + ' :: ' + grid.innerText.replace(/\s+/g, ' ').slice(0, 300);
      });
      console.log('   dialog for ' + what + ': ' + info);
      await page.click('#advConfigConfirm');
      await page.waitForTimeout(300);
    }
    if (open.length && open.indexOf('advConfigModalOverlay') < 0) console.log('   (dialog after ' + what + ': ' + open.join(', ') + ')');
    return open;
  };
  await next(); await pick(build.clan); await next(); await pick(build.family); await next();
  await pick(build.school);
  await modal('school');
  await page.waitForFunction((s) => window.__L5R_TEST__.CW112.appliedSchool() === s && !window.__L5R_TEST__.CW112.busy, build.school, {timeout: 8000});
  await toStep('Rings & Traits');
  for (const t of build.traits) await page.click('button[aria-label="Raise ' + t + '"]');
  await toStep('Skills');
  for (const choice of (build.slots || [])) {
    await page.locator('#cw112Body select').first().selectOption(choice);
    await page.locator('#cw112Body button', {hasText: /^add$/i}).first().click();
    await page.waitForTimeout(200);
  }
  for (const [skill, times] of Object.entries(build.skills)) for (let i = 0; i < times; i++) await page.click('button[aria-label="Raise ' + skill + '"]');
  await toStep('Advantages & Disadvantages');
  for (const a of build.advantages) { await page.selectOption('#cw1121AdvPick', a); await modal(a); await page.waitForFunction(() => !window.__L5R_TEST__.CW1121.busy, null, {timeout:5000}).catch(()=>console.log('   busy after ' + a)); }
  for (const d of (build.disadvantages || [])) { await page.selectOption('#cw1121DisadvPick', d); await modal(d); await page.waitForFunction(() => !window.__L5R_TEST__.CW1121.busy, null, {timeout:5000}).catch(()=>console.log('   busy after ' + d)); }
  const r = await page.evaluate(() => {
    const T = window.__L5R_TEST__, v = (id) => document.getElementById(id).value;
    const rings = {}; ['air','earth','fire','water','void'].forEach(k => { const e = document.getElementById('ring_' + k) || document.getElementById('ringVal_' + k); rings[k] = e ? (e.value || e.textContent) : '?'; });
    return {
      spent: v('f_xpSpent'), total: v('f_xpTotal'), left: v('f_xpRemain'), honor: (document.getElementById('f_honor')||{}).value,
      traits: ['reflexes','awareness','stamina','willpower','agility','intelligence','strength','perception'].map(t => t.slice(0,3) + ' ' + document.getElementById('trait_' + t).value).join(', '),
      rings,
      skills: [...document.getElementById('skillsBody').rows].map(r => r.querySelector('.sk-name').value + ' ' + r.querySelector('.sk-rank').value).join(', '),
      adv: [...document.querySelectorAll('#advList .entry')].map(e => e.querySelector('.en-name').value + ' (' + e.querySelector('.en-cost').value + ')').join(', '),
      disadv: [...document.querySelectorAll('#disadvList .entry')].map(e => e.querySelector('.en-name').value + ' (' + e.querySelector('.en-cost').value + ')').join(', '),
      findings: T.validateCharacter().findings.map(f => f.severity + ': ' + f.title)
    };
  });
  await toStep('Review');
  r.reviewNextEnabled = await page.evaluate(() => !document.getElementById('cw112Next').disabled);
  r.pageErrors = errors;
  await ctx.close();
  return r;
}
(async () => {
  const browser = await chromium.launch();
  for (const build of BUILDS) {
    console.log('== ' + build.label);
    try { console.log(JSON.stringify(await run(browser, build), null, 1)); }
    catch (e) { console.log('   FAILED: ' + String(e.message).split('\n')[0]); }
  }
  await browser.close();
})();
