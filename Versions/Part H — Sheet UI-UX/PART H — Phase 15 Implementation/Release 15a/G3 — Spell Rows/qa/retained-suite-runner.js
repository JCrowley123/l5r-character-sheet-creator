'use strict';
// Release 15a G3 retained: the tree with all of G3 removed, which is G2 as live, less the 73 live-site checks.
// G2's units 22 + 20 + 26 + 22 + 56 = 146, plus G2's own retained runner (G1 as live less the same 73) 6,929 = 7,075.
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
  [path.resolve(__dirname, '../../G2 — Small Layout Fixes/qa/retained-suite-runner.js'), 6929]
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
process.exitCode = total === 7075 && passed === total && failed === 0 ? 0 : 1;

module.exports.changedHarnesses = {
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A05 — Missing Limb Picker/qa/limb-picker-harness.js": 22,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A06 — Grant Actions and Their State/qa/grant-actions-harness.js": 20,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A07 — The Moon Row/qa/moon-row-harness.js": 26,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A11 — Explanatory Text Gaps and One Left Edge/qa/text-edges-harness.js": 22,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A04.1 — One Way to Show Choices in Pickers/qa/inline-rules-harness.js": 56
};
