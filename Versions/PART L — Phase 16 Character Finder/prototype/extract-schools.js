// Reads every Basic School (with its flavour text, page and Families) from the BUILT app into schools.json.
// Run `python3 build.py` at the repository root first, then: node extract-schools.js
const { chromium } = require('playwright');
const path = require('path');
const APP = path.resolve(__dirname, '..', '..', '..', 'dist', 'index.html');
const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + APP);
  await p.waitForTimeout(3000);
  const out = await p.evaluate(() => {
    const T = window.__L5R_TEST__;
    const rows = JSON.parse(JSON.stringify([]));
    const add = (clan, s, kind) => {
      const e = T.SCHOOLLORE9.entry(s.name);
      let cat=''; try{ cat = T.schoolCasterCategory ? T.schoolCasterCategory(s) : ''; }catch(x){}
      rows.push({clan, kind, name:s.name, benefit:s.benefit, honor:s.honor, skills:s.skills, tech:s.tech||[], shugenja:!!s.shugenja, monk:!!s.monk, brotherhood:!!s.brotherhood, affinity:s.affinity||'', deficiency:s.deficiency||'', spells:s.spells||'', source:T.SCHOOLREF1432.source('schools', s.name), lore:e});
    };
    Object.keys(T.SCHOOL_LIBRARY).forEach(c => T.SCHOOL_LIBRARY[c].forEach(s => add(c, s, 'major')));
    Object.keys(T.MINOR_CLAN_SCHOOL_LIBRARY).forEach(c => (T.MINOR_CLAN_SCHOOL_LIBRARY[c]||[]).forEach(s => add(c, s, 'minor')));
    T.BROTHERHOOD_SCHOOL_LIBRARY.forEach(s => add('Brotherhood of Shinsei', s, 'brotherhood'));
    const fam = {}; Object.keys(T.FAMILY_LIBRARY).forEach(c => fam[c] = T.FAMILY_LIBRARY[c]);
    const minfam = {}; Object.keys(T.MINOR_CLAN_LIBRARY).forEach(c => minfam[c] = T.MINOR_CLAN_LIBRARY[c]);
    return {rows, fam, minfam, loreSample: T.SCHOOLLORE9.entry('Hida Bushi')};
  });
  fs.writeFileSync(path.join(__dirname, 'schools.json'), JSON.stringify(out, null, 1));
  console.log(out.rows.length, JSON.stringify(out.loreSample));
  await b.close();
})();
