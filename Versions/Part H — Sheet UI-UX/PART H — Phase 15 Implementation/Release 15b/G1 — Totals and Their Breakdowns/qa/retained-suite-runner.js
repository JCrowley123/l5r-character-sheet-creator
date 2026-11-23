'use strict';
// Release 15b group 1 retained: the tree with A14, B04, B14 and B17 removed, which is Release 15a as live (G6), less the
// 73 live-site checks. A19's 25, A20's 18 and A19.1's 9, plus G6's own retained runner (G5 as live less the same 73)
// 7,328 = 7,380.
const path = require('path'), {spawnSync} = require('child_process');
if (!process.argv[2]) throw new Error('Pass the built sheet path.');
const sheet = path.resolve(process.argv[2]);
let passed = 0, total = 0, failed = 0;
const R15A = path.resolve(__dirname, '../../../Release 15a');
const suites = [
  [path.join(R15A, 'A19 — Undo the Last Void Spend/qa/void-spend-undo-harness.js'), 25],
  [path.join(R15A, 'A20 — A Trait for One Skill Roll/qa/skill-trait-choice-harness.js'), 18],
  [path.join(R15A, 'A19.1 — The Damage Row Fits a Phone/qa/damage-row-harness.js'), 9],
  [path.join(R15A, 'G6 — New Functions/qa/retained-suite-runner.js'), 7328]
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
process.exitCode = total === 7380 && passed === total && failed === 0 ? 0 : 1;

module.exports.changedHarnesses = {
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A19 — Undo the Last Void Spend/qa/void-spend-undo-harness.js": 25,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A20 — A Trait for One Skill Roll/qa/skill-trait-choice-harness.js": 18,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A19.1 — The Damage Row Fits a Phone/qa/damage-row-harness.js": 9
};
