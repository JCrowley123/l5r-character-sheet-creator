// Step 2 of the rating audit: reads every Basic School's own evidence from the BUILT app (Skills, Outfit, all
// Technique texts, description, page) into app-evidence.json. Run `python3 build.py` at the repository root first.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const APP = path.resolve(__dirname, '..', '..', '..', 'dist', 'index.html');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + APP);
  await p.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready, null, {timeout: 20000});
  const out = await p.evaluate(() => {
    const T = window.__L5R_TEST__, rows = [];
    const add = (clan, s, kind) => {
      const lore = T.SCHOOLLORE9.entry(s.name) || {};
      rows.push({name: s.name, clan, kind, honor: s.honor, benefit: s.benefit, skills: s.skills || '', outfit: s.outfit || '',
        shugenja: !!s.shugenja, brotherhood: !!s.brotherhood, affinity: s.affinity || '', deficiency: s.deficiency || '',
        source: T.SCHOOLREF1432.source('schools', s.name) || s.source || '', lore: lore.text || '',
        techniques: (s.tech || []).map((n, i) => ({rank: i + 1, name: n, text: T.TECH_DESCRIPTIONS[n] || ''}))});
    };
    Object.keys(T.SCHOOL_LIBRARY).forEach(c => T.SCHOOL_LIBRARY[c].forEach(s => add(c, s, 'major')));
    Object.keys(T.MINOR_CLAN_SCHOOL_LIBRARY).forEach(c => (T.MINOR_CLAN_SCHOOL_LIBRARY[c] || []).forEach(s => add(c, s, 'minor')));
    T.BROTHERHOOD_SCHOOL_LIBRARY.forEach(s => add('Brotherhood of Shinsei', s, 'brotherhood'));
    return rows;
  });
  fs.writeFileSync(path.join(__dirname, 'app-evidence.json'), JSON.stringify(out, null, 1));
  const noText = out.reduce((n, s) => n + s.techniques.filter(t => !t.text).length, 0);
  console.log(out.length, 'entries |', out.reduce((n, s) => n + s.techniques.length, 0), 'Techniques |', noText, 'without text |',
    out.filter(s => !s.outfit).length, 'without an Outfit |', out.filter(s => !s.lore).length, 'without a description');
  await b.close();
})();
