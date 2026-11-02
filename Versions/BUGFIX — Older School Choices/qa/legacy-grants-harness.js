'use strict';
const fs = require('fs');
const path = require('path');
const {pathToFileURL} = require('url');
const {chromium} = require('playwright');

// An optional local character file exercises the reported import. The default
// fixture retains only the School, Skills and spell names needed for this case.
const sheet = pathToFileURL(path.resolve(process.argv[2])).href;
const sample = process.argv[3] ? JSON.parse(fs.readFileSync(process.argv[3], 'utf8')) : null;
const pins = ['DEFENSE-FILLS-SLOT', 'NO-EXTRA-MEDITATION', 'NO-EXTRA-WATER', 'NO-EXTRA-AIR'];
const seen = new Map();
function check(id, value) {
  if (!pins.includes(id) || seen.has(id)) throw Error('Unexpected check ' + id);
  seen.set(id, value === true);
  console.log((value === true ? 'PASS ' : 'FAIL ') + id);
}
async function main() {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({viewport: {width: 390, height: 844}});
    await page.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort());
    await page.goto(sheet, {waitUntil: 'domcontentloaded'});
    await page.waitForFunction(() => window.__L5R_TEST__?.CL11?.ready, null, {timeout: 60000});
    const actual = await page.evaluate(sample => {
      const T = window.__L5R_TEST__;
      const school = 'Kitsu Shugenja';
      function makeFixture() {
        const data = T.collectData();
        const fixed = ['Battle', 'Calligraphy', 'Etiquette', 'Lore: History', 'Lore: Theology', 'Spellcraft'];
        data.fields.f_school = school;
        data.fields.f_clan = 'Lion';
        data.fields.f_schoolApplied = JSON.stringify({school, trait:'Perception', amount:1,
          skillGrants:fixed.map(name => ({name, createdRow:true}))});
        data.fields.f_schoolsData = JSON.stringify([{name:school, frozen:false, floorRank:1, anchorInsightRank:0}]);
        data.skills = fixed.concat('Defense').map(name => ({
          name, school:true, freeFloor:name === 'Defense' ? '0' : '1', rank:name === 'Defense' ? '3' : '1'
        }));
        const names = ['Sense', 'Commune', 'Summon', 'Reflective Pool', 'Reversal of Fortunes',
          'Clarity of Purpose', 'Blessed Wind', 'Tempest of Air', "Jurojin's Balm"];
        data.tech = names.map(name => {
          const spell = T.SPELL_LIBRARY.find(s => s.name === name);
          return {name, cost:0, spellElement:spell.element.toLowerCase(), spellMastery:String(spell.mastery)};
        });
        data.equip = names.map(name => ({name:'Spell Scroll — ' + name, qty:'1', notes:''}));
        return {schemaVersion:5, fields:data.fields, skills:data.skills, tech:data.tech, equip:data.equip};
      }
      const original = sample || makeFixture();
      const load = () => T.applyData(JSON.parse(JSON.stringify(original)));
      load();
      const defenseFills = T.SC8.openSkills(school).length === 0;
      const xp = document.getElementById('f_xpRemain').value;
      T.SC8.open(school, 'skill');
      const select = document.querySelector('#sc8Body #cw1121Slot0Pick');
      if (select && Array.from(select.options).some(o => o.value === 'Meditation')) {
        select.value = 'Meditation';
        select.dispatchEvent(new Event('change', {bubbles:true}));
        document.getElementById('cw1121Slot0Add').click();
      }
      const skills = T.collectData().skills;
      const noMeditation = !skills.some(s => s.name === 'Meditation') &&
        skills.filter(s => s.name === 'Defense' && s.rank === '3' && s.school).length === 1 &&
        document.getElementById('f_xpRemain').value === xp;
      function tryExtra(element) {
        load();
        T.SC8.open(school, 'spell');
        if (element === 'Air') document.querySelector('#sc8Body .sc8-later')?.click();
        const picker = document.getElementById('cw1123Pick' + element);
        if (picker && !picker.closest('[hidden]')) {
          const extra = Array.from(picker.options).find(o => o.value &&
            !original.tech.some(t => t.name === T.SPELL_LIBRARY[Number(o.value)].name));
          if (extra) {
            picker.value = extra.value;
            picker.dispatchEvent(new Event('change', {bubbles:true}));
            document.getElementById('cw1123Add' + element).click();
          }
        }
        const saved = T.collectData();
        return saved.tech.filter(t => t.spellElement === element.toLowerCase()).length ===
          original.tech.filter(t => t.spellElement === element.toLowerCase()).length &&
          saved.equip.filter(e => /^Spell Scroll/.test(e.name)).length === original.equip.filter(e => /^Spell Scroll/.test(e.name)).length;
      }
      return [defenseFills, noMeditation, tryExtra('Water'), tryExtra('Air')];
    }, sample);
    pins.forEach((id, i) => check(id, actual[i]));
  } finally {
    await browser.close();
    const passed = [...seen.values()].filter(Boolean).length;
    console.log(passed + '/' + pins.length + ' checks passed');
    if (passed !== pins.length) process.exitCode = 1;
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
