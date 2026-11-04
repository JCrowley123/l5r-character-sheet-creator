'use strict';
// Release 15a, A01: a side-by-side text comparison of the Review in the predecessor and the candidate, from the two
// reproduce.cjs outputs. node compare.cjs <predecessor folder> <candidate folder> <out.md>
const fs = require('fs'), path = require('path');
const [before, after, out] = process.argv.slice(2).map(p => path.resolve(p));
const load = d => JSON.parse(fs.readFileSync(path.join(d, 'review-states.json'), 'utf8')).results;
const A = load(before), B = load(after);
const NAMES = {kuni: 'Kuni Shugenja', matsu: 'Matsu Beastmaster', monk: 'Order of the Nameless Gift monk'};
const shown = r => {
  if (r.error) return ['(not reproduced: ' + r.error.split('\n')[0] + ')'];
  const lines = [];
  if (r.box && r.box.items.length) lines.push(...r.box.items.map(i => 'Box: ' + i));
  else if (r.box) lines.push('Box: ' + r.box.text);
  for (const c of r.cards) lines.push('Card: ' + c.title);
  for (const x of r.reminders || []) lines.push('Card (A01): ' + x.title);
  return lines;
};
let md = '# A01 Review comparison\n\nEach row is one wizard run to Review on a 390 × 844 phone viewport, made through the sheet\'s own controls. ' +
  '"Box" is the old Still to choose list; "Card" is the character check\'s card; "Card (A01)" is a reminder A01 kept because no card lists it.\n\n' +
  '| Character | State | Release 8c (predecessor) | A01 candidate | Same Finish button and cards? |\n|---|---|---|---|---|\n';
let same = 0;
for (const a of A) {
  const b = B.find(x => x.kind === a.kind && x.state === a.state);
  const cardsSame = !a.error && b && !b.error && JSON.stringify(a.cards) === JSON.stringify(b.cards) && JSON.stringify(a.finish) === JSON.stringify(b.finish);
  if (cardsSame) same++;
  md += '| ' + NAMES[a.kind] + ' | ' + a.state + ' | ' + shown(a).join('<br>') + ' | ' + (b ? shown(b).join('<br>') : '—') + ' | ' + (cardsSame ? 'Yes' : 'No') + ' |\n';
}
md += '\n' + same + ' of ' + A.length + ' states keep exactly the same cards and Finish button.\n';
fs.writeFileSync(out, md);
console.log(same + '/' + A.length + ' states keep identical cards and Finish');
