// Release 15a G4: G3 7,242 + A09 20 + A10 23 + A10.1 16 + A17 25 = 7,326; older counts unchanged.
'use strict';
// G3's own runner is reached as a child and flattened (it lists G3's units and G2's 7,148).
// No older harness changes its count with G4 present: the splash layer's S-ART-BY-SHAPE is a declared conditional with
// the same id and count (A17's ROLLBACK), and every other G4 check is inside G4's own harnesses.
const path = require('path'), {spawnSync} = require('child_process');
if (!process.argv[2]) throw new Error('Pass the built sheet path.');
const sheet = path.resolve(process.argv[2]);
let passed = 0, total = 0, failed = 0;
const suites = [
  [path.resolve(__dirname, '../../A09 — Phone Text Entry and Repeated Taps/qa/phone-text-entry-harness.js'), 20],
  [path.resolve(__dirname, '../../A10 — Cross-Page Actions Move Focus/qa/cross-page-focus-harness.js'), 23],
  [path.resolve(__dirname, '../../A10.1 — The Page Ring Only for the Keyboard/qa/keyboard-page-ring-harness.js'), 16],
  [path.resolve(__dirname, '../../A17 — The Splash Fills the Screen/qa/splash-fill-harness.js'), 25],
  [path.resolve(__dirname, '../../G3 — Spell Rows/qa/current-suite-runner.js'), 7242]
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
process.exitCode = total === 7326 && passed === total && failed === 0 ? 0 : 1;

module.exports.changedHarnesses = {
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A09 — Phone Text Entry and Repeated Taps/qa/phone-text-entry-harness.js": 20,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A10 — Cross-Page Actions Move Focus/qa/cross-page-focus-harness.js": 23,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A10.1 — The Page Ring Only for the Keyboard/qa/keyboard-page-ring-harness.js": 16,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A17 — The Splash Fills the Screen/qa/splash-fill-harness.js": 25
};
