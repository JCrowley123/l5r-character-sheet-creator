'use strict';
// Release 15a automatic-entries group retained: the tree with all of the group removed, which is G4 as live, less the
// 73 live-site checks. G4's units 20 + 23 + 16 + 25 = 84, plus G4's own retained runner (G3 as live less the same 73)
// 7,169 = 7,253.
const path = require('path'), {spawnSync} = require('child_process');
if (!process.argv[2]) throw new Error('Pass the built sheet path.');
const sheet = path.resolve(process.argv[2]);
let passed = 0, total = 0, failed = 0;
const suites = [
  [path.resolve(__dirname, '../../A09 — Phone Text Entry and Repeated Taps/qa/phone-text-entry-harness.js'), 20],
  [path.resolve(__dirname, '../../A10 — Cross-Page Actions Move Focus/qa/cross-page-focus-harness.js'), 23],
  [path.resolve(__dirname, '../../A10.1 — The Page Ring Only for the Keyboard/qa/keyboard-page-ring-harness.js'), 16],
  [path.resolve(__dirname, '../../A17 — The Splash Fills the Screen/qa/splash-fill-harness.js'), 25],
  [path.resolve(__dirname, '../../G4 — Touch, Focus and Startup/qa/retained-suite-runner.js'), 7169]
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
process.exitCode = total === 7253 && passed === total && failed === 0 ? 0 : 1;

module.exports.changedHarnesses = {
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A09 — Phone Text Entry and Repeated Taps/qa/phone-text-entry-harness.js": 20,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A10 — Cross-Page Actions Move Focus/qa/cross-page-focus-harness.js": 23,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A10.1 — The Page Ring Only for the Keyboard/qa/keyboard-page-ring-harness.js": 16,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A17 — The Splash Fills the Screen/qa/splash-fill-harness.js": 25
};
