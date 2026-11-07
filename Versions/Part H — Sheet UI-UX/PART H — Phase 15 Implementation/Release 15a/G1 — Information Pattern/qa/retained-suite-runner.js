'use strict';
// Release 15a group G1 retained: the tree with the whole group removed is exactly Release 15a A03 as live; its 6,792 sheet
// assertions are A03's 6,865 less the two live-site leaves (5a's sw-checks, 5b's notice-checks), as A03's retained run
// excluded them: A03's own 37 plus A03's retained 6,755. 4.5.14's and 12.5's conditional harnesses run their old lines.
const path = require('path'), {spawnSync} = require('child_process');
if (!process.argv[2]) throw new Error('Pass the built sheet path.');
const sheet = path.resolve(process.argv[2]);
let passed = 0, total = 0, failed = 0;
const suites = [
  [path.resolve(__dirname, '../../A03 — Top-Aligned Columns and Compact Skill Cards/qa/compact-skills-harness.js'), 37],
  [path.resolve(__dirname, '../../A03 — Top-Aligned Columns and Compact Skill Cards/qa/retained-suite-runner.js'), 6755]
];
for (const [file, expected] of suites) {
  const run = spawnSync(process.execPath, [file, sheet], {
    env: process.env, encoding: 'utf8', timeout: 7200000, maxBuffer: 64 * 1024 * 1024
  });
  const output = (run.stdout || '') + (run.stderr || '');
  process.stdout.write(output);
  const count = [...output.matchAll(/(?:COMBINED )?(\d+)\/(\d+) checks passed/g)].at(-1);
  if (!count || Number(count[2]) !== expected) {
    console.error('Unexpected check count for ' + file + ': expected ' + expected);
    failed++;
  }
  if (count) { passed += Number(count[1]); total += Number(count[2]); }
  if (run.status !== 0 || run.error) failed++;
}
console.log('COMBINED ' + passed + '/' + total + ' checks passed');
process.exitCode = total === 6792 && passed === total && failed === 0 ? 0 : 1;

module.exports.changedHarnesses = {
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A03 — Top-Aligned Columns and Compact Skill Cards/qa/compact-skills-harness.js": 37,
  "PART I — Phase 4.5.14 Darling of the Court and Servant/qa/court-servant-harness.js": 225,
  "PART K — Phase 12.5 Play Mode Advantages and Disadvantages/qa/advantages-harness.js": 212
};
