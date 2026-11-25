// Reads each School's Rank 1 Technique text from the built app into tech1.json (run `python3 build.py` first).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const rows = require(path.join(__dirname, '..', 'prototype', 'schools.json')).rows;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + path.resolve(__dirname, '..', '..', '..', 'dist', 'index.html'));
  await p.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready, null, {timeout:20000});
  const out = await p.evaluate((rows) => {
    const T = window.__L5R_TEST__, r = {};
    rows.forEach(s => { const n = (s.tech || [])[0]; r[s.name] = {tech: n || '', desc: n ? (T.TECH_DESCRIPTIONS[n] || '') : ''}; });
    return r;
  }, rows);
  fs.writeFileSync(path.join(__dirname, 'tech1.json'), JSON.stringify(out, null, 1));
  const missing = Object.entries(out).filter(([k, v]) => !v.desc).map(([k, v]) => k + ' / ' + v.tech);
  console.log(Object.keys(out).length, 'schools; without Rank 1 text:', missing.length, missing.slice(0, 10));
  await b.close();
})();
