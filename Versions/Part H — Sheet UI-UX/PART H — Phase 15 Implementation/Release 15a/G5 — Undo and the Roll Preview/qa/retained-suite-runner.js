'use strict';
// Release 15a group G5 (A08 alone) retained: the tree with A08 removed, which is the automatic-entries group as live, less
// the 73 live-site checks. The group's units 13 + 21 + 20 = 54, plus its own retained runner (G4 as live less the same 73)
// 7,253 = 7,307.
const path = require('path'), {spawnSync} = require('child_process');
if (!process.argv[2]) throw new Error('Pass the built sheet path.');
const sheet = path.resolve(process.argv[2]);
let passed = 0, total = 0, failed = 0;
const suites = [
  [path.resolve(__dirname, '../../AE1 — Sense for the Yogo Wardmaster/qa/yogo-given-spells-harness.js'), 13],
  [path.resolve(__dirname, '../../AE2 — Given Spells Credited on Opening/qa/given-spells-harness.js'), 21],
  [path.resolve(__dirname, '../../AE3 — No XP Box or Remove on Automatic Entries/qa/automatic-entry-controls-harness.js'), 20],
  [path.resolve(__dirname, '../../AE — Automatic Entries/qa/retained-suite-runner.js'), 7253]
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
process.exitCode = total === 7307 && passed === total && failed === 0 ? 0 : 1;

module.exports.changedHarnesses = {
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/AE1 — Sense for the Yogo Wardmaster/qa/yogo-given-spells-harness.js": 13,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/AE2 — Given Spells Credited on Opening/qa/given-spells-harness.js": 21,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/AE3 — No XP Box or Remove on Automatic Entries/qa/automatic-entry-controls-harness.js": 20
};
