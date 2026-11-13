// Release 15a automatic-entries group: G4 7,326 + AE1 13 + AE2 21 + AE3 20 = 7,380; older counts unchanged.
'use strict';
// G4's own runner is reached as a child and flattened (it lists G4's units and G3's 7,242).
// No older harness changes its count with the group present: Phase 11.2.4's wizard5-harness.js (AE1's lines), the six
// harnesses that set the test-only GS15.paused (AE2) and 8b.1-UI-03's harness taking ax15-on away (AE3) are declared
// conditionals with the same ids and counts (the units' ROLLBACK and README files); every other check of the group is
// inside its own three harnesses.
const path = require('path'), {spawnSync} = require('child_process');
if (!process.argv[2]) throw new Error('Pass the built sheet path.');
const sheet = path.resolve(process.argv[2]);
let passed = 0, total = 0, failed = 0;
const suites = [
  [path.resolve(__dirname, '../../AE1 — Sense for the Yogo Wardmaster/qa/yogo-given-spells-harness.js'), 13],
  [path.resolve(__dirname, '../../AE2 — Given Spells Credited on Opening/qa/given-spells-harness.js'), 21],
  [path.resolve(__dirname, '../../AE3 — No XP Box or Remove on Automatic Entries/qa/automatic-entry-controls-harness.js'), 20],
  [path.resolve(__dirname, '../../G4 — Touch, Focus and Startup/qa/current-suite-runner.js'), 7326]
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
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/AE1 — Sense for the Yogo Wardmaster/qa/yogo-given-spells-harness.js": 13,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/AE2 — Given Spells Credited on Opening/qa/given-spells-harness.js": 21,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/AE3 — No XP Box or Remove on Automatic Entries/qa/automatic-entry-controls-harness.js": 20
};
