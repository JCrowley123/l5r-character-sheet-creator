// Release 15a group G5 (A08 alone; A12 withdrawn on 18 November 2026): the automatic-entries group 7,380 + A08 21 = 7,401;
// older counts unchanged.
'use strict';
// The automatic-entries group's own runner is reached as a child and flattened (it lists its three units and G4's 7,326).
// No older harness changes its count with A08 present: A08 declares no conditional in another layer's tests (its README);
// every check of the unit is inside its own harness.
const path = require('path'), {spawnSync} = require('child_process');
if (!process.argv[2]) throw new Error('Pass the built sheet path.');
const sheet = path.resolve(process.argv[2]);
let passed = 0, total = 0, failed = 0;
const suites = [
  [path.resolve(__dirname, '../../A08 — One Undo for Quick Taps/qa/quick-tap-undo-harness.js'), 21],
  [path.resolve(__dirname, '../../AE — Automatic Entries/qa/current-suite-runner.js'), 7380]
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
process.exitCode = total === 7401 && passed === total && failed === 0 ? 0 : 1;

module.exports.changedHarnesses = {
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A08 — One Undo for Quick Taps/qa/quick-tap-undo-harness.js": 21
};
