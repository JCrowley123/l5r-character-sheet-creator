'use strict';
// Release 15a, A02: compare two reproduce.cjs result folders (predecessor and candidate), state by state.
// node compare.cjs <predecessor folder> <candidate folder>   Writes <candidate folder>/comparison.json and prints a table.
const fs = require('fs'), path = require('path');
const [a, b] = process.argv.slice(2, 4).map(p => path.resolve(p));
const load = d => JSON.parse(fs.readFileSync(path.join(d, 'floating-states.json'), 'utf8')).results.filter(r => r.where);
const key = r => [r.device, r.mode, r.tab, r.where].join('|');
const before = new Map(load(a).map(r => [key(r), r])), after = new Map(load(b).map(r => [key(r), r]));
const tally = rs => {
  const t = {states: 0, controlOverPage: 0, onTabs: 0, coveredItems: 0, headingCovered: 0, pageHeight: {}};
  for (const r of rs) {
    t.states++;
    const covered = Object.values(r.covered || {}).reduce((n, list) => n + list.length, 0);
    if (covered) t.controlOverPage++;
    t.coveredItems += covered;
    if (Object.values(r.onTabbar || {}).some(Boolean)) t.onTabs++;
    if (r.where === 'top' && Object.values(r.covered || {}).some(list => list.some(s => /^h2:/.test(s)))) t.headingCovered++;
    if (r.where === 'top' && r.page) t.pageHeight[r.device] = r.page.b - r.page.y;
  }
  return t;
};
const devices = ['phone', 'small', 'desktop'];
const out = {predecessor: a, candidate: b, byDevice: {}, sameStates: before.size === after.size && [...before.keys()].every(k => after.has(k))};
for (const d of devices) out.byDevice[d] = {predecessor: tally([...before.values()].filter(r => r.device === d)), candidate: tally([...after.values()].filter(r => r.device === d))};
fs.writeFileSync(path.join(b, 'comparison.json'), JSON.stringify(out, null, 2) + '\n');
console.log('same states: ' + out.sameStates);
console.log('device  | states | with a control over the page | items covered | headings covered | on the tabs | page height');
for (const d of devices) { const p = out.byDevice[d].predecessor, c = out.byDevice[d].candidate;
  console.log([d, p.states + ' / ' + c.states, p.controlOverPage + ' -> ' + c.controlOverPage, p.coveredItems + ' -> ' + c.coveredItems,
    p.headingCovered + ' -> ' + c.headingCovered, p.onTabs + ' -> ' + c.onTabs, p.pageHeight[d] + ' -> ' + c.pageHeight[d]].join(' | ')); }
