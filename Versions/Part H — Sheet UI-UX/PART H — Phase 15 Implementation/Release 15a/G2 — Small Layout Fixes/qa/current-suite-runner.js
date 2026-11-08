// Release 15a G2: G1 7002 + 22 + 20 + 26 + 22 + 56 = 7148; older counts unchanged.
'use strict';
// G1 predecessor adds its four units' checks to Release 15a A03's 6,865: A04 35, A15 33, A16 50, A03.1 19 (137).
// Phase 4.5.14's and Phase 12.5's harnesses (conditional on A15/A16, same ids) keep their counts inside A03's total.
const path = require('path'), {spawnSync} = require('child_process');
if (!process.argv[2]) throw new Error('Pass the built sheet path.');
const sheet = path.resolve(process.argv[2]);
let passed = 0, total = 0, failed = 0;
const suites = [
  [path.resolve(__dirname, '../../A05 — Missing Limb Picker/qa/limb-picker-harness.js'), 22],
  [path.resolve(__dirname, '../../A06 — Grant Actions and Their State/qa/grant-actions-harness.js'), 20],
  [path.resolve(__dirname, '../../A07 — The Moon Row/qa/moon-row-harness.js'), 26],
  [path.resolve(__dirname, '../../A11 — Explanatory Text Gaps and One Left Edge/qa/text-edges-harness.js'), 22],
  [path.resolve(__dirname, '../../A04.1 — One Way to Show Choices in Pickers/qa/inline-rules-harness.js'), 56],
  [path.resolve(__dirname, '../../A04 — One Information Pattern/qa/info-pattern-harness.js'), 35],
  [path.resolve(__dirname, '../../A15 — Court Badges/qa/court-badges-harness.js'), 33],
  [path.resolve(__dirname, '../../A16 — No Bottom i in the Seven Pickers/qa/picker-info-harness.js'), 50],
  [path.resolve(__dirname, '../../A03.1 — Masteries in the Skill Information/qa/skill-masteries-harness.js'), 19],
  [path.resolve(__dirname, '../../A03 — Top-Aligned Columns and Compact Skill Cards/qa/current-suite-runner.js'), 6865]
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
process.exitCode = total === 7148 && passed === total && failed === 0 ? 0 : 1;

module.exports.changedHarnesses = {
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A05 — Missing Limb Picker/qa/limb-picker-harness.js": 22,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A06 — Grant Actions and Their State/qa/grant-actions-harness.js": 20,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A07 — The Moon Row/qa/moon-row-harness.js": 26,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A11 — Explanatory Text Gaps and One Left Edge/qa/text-edges-harness.js": 22,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A04.1 — One Way to Show Choices in Pickers/qa/inline-rules-harness.js": 56,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A04 — One Information Pattern/qa/info-pattern-harness.js": 35,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A15 — Court Badges/qa/court-badges-harness.js": 33,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A16 — No Bottom i in the Seven Pickers/qa/picker-info-harness.js": 50,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A03.1 — Masteries in the Skill Information/qa/skill-masteries-harness.js": 19,
  "PART I — Phase 4.5.14 Darling of the Court and Servant/qa/court-servant-harness.js": 225,
  "PART K — Phase 12.5 Play Mode Advantages and Disadvantages/qa/advantages-harness.js": 212
};
