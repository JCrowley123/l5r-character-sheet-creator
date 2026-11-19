// Release 15a group G6 (A19 revision 1, A20, A19.1): A19 25 + A20 18 + A19.1 9 + G5's 7,401 = 7,453; older counts unchanged.
'use strict';
// G5's own runner is reached as a child and flattened (it lists A08 and the automatic-entries group's 7,380).
// No older harness changes its count with G6 present: none of the three units declares a conditional in another layer's
// tests (their READMEs); every check of each unit is inside its own harness.
const path = require('path'), {spawnSync} = require('child_process');
if (!process.argv[2]) throw new Error('Pass the built sheet path.');
const sheet = path.resolve(process.argv[2]);
let passed = 0, total = 0, failed = 0;
const suites = [
  [path.resolve(__dirname, '../../A19 — Undo the Last Void Spend/qa/void-spend-undo-harness.js'), 25],
  [path.resolve(__dirname, '../../A20 — A Trait for One Skill Roll/qa/skill-trait-choice-harness.js'), 18],
  [path.resolve(__dirname, '../../A19.1 — The Damage Row Fits a Phone/qa/damage-row-harness.js'), 9],
  [path.resolve(__dirname, '../../G5 — Undo and the Roll Preview/qa/current-suite-runner.js'), 7401]
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
process.exitCode = total === 7453 && passed === total && failed === 0 ? 0 : 1;

module.exports.changedHarnesses = {
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A19 — Undo the Last Void Spend/qa/void-spend-undo-harness.js": 25,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A20 — A Trait for One Skill Roll/qa/skill-trait-choice-harness.js": 18,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A19.1 — The Damage Row Fits a Phone/qa/damage-row-harness.js": 9
};
