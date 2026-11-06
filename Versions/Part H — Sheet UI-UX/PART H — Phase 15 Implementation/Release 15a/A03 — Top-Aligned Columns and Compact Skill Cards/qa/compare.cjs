'use strict';
// Release 15a, A03: compare two reproduce.cjs runs (predecessor, candidate). Prints the column gaps on the desktop and
// the phone Skill cards (card heights, page length, cards on one screen). node compare.cjs <before folder> <after folder>
const fs = require('fs'), path = require('path');
const [before, after] = process.argv.slice(2, 4).map(d => JSON.parse(fs.readFileSync(path.join(path.resolve(d), 'a03-states.json'), 'utf8')));
const find = (rs, device, mode, variant, tab) => rs.find(r => r.device === device && r.mode === mode && r.variant === variant && r.tab === tab);
const lines = ['| Where | Mode | Character | A02 as live | A03 |', '|---|---|---|---:|---:|'];
for (const variant of ['dense', 'noAdv', 'noDisadv'])
  for (const mode of ['play', 'management']) {
    const b = find(before, 'desktop', mode, variant, 'Adv & Disadv'), a = find(after, 'desktop', mode, variant, 'Adv & Disadv');
    lines.push(`| Desktop, distance between the two column headings | ${mode} | ${variant} | ${Math.abs(b.labelGap)} px | ${Math.abs(a.labelGap)} px |`);
  }
for (const device of ['phone', 'small'])
  for (const variant of ['dense', 'longSkills'])
    for (const mode of ['play', 'management']) {
      const b = find(before, device, mode, variant, 'Skills'), a = find(after, device, mode, variant, 'Skills');
      const hs = r => r.rows.map(x => x.h), range = r => Math.min(...hs(r)) + '–' + Math.max(...hs(r)) + ' px';
      const perScreen = r => (r.pageClient / (hs(r).reduce((s, h) => s + h, 0) / hs(r).length)).toFixed(1);
      lines.push(`| ${device === 'phone' ? 'Phone 390 × 844' : 'Small phone 375 × 667'}, Skill card height | ${mode} | ${variant} (${a.rows.length}) | ${range(b)} | ${range(a)} |`);
      lines.push(`| ${device === 'phone' ? 'Phone 390 × 844' : 'Small phone 375 × 667'}, Skills page length | ${mode} | ${variant} | ${b.pageScroll} px | ${a.pageScroll} px |`);
      lines.push(`| ${device === 'phone' ? 'Phone 390 × 844' : 'Small phone 375 × 667'}, cards per screen | ${mode} | ${variant} | ${perScreen(b)} | ${perScreen(a)} |`);
    }
for (const mode of ['play', 'management']) {
  const b = find(before, 'desktop', mode, 'longSkills', 'Skills'), a = find(after, 'desktop', mode, 'longSkills', 'Skills');
  lines.push(`| Desktop, Skills table rows (unchanged) | ${mode} | longSkills | ${b.rows.map(x => x.h).join(',') === a.rows.map(x => x.h).join(',') ? 'same' : 'DIFFERENT'} | ${b.pageScroll} → ${a.pageScroll} px |`);
}
const errs = r => r.filter(x => x.errors).reduce((s, x) => s + x.errors.length, 0);
lines.push(`| Script errors | | | ${errs(before)} | ${errs(after)} |`);
console.log(lines.join('\n'));
