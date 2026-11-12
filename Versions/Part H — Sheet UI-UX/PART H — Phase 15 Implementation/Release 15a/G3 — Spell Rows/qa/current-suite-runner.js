// Release 15a G3: G2 7,148 + 8b.1-UI-01 32 + 8b.1-UI-02 28 + 8b.1-UI-03 34 = 7,242; older counts unchanged.
'use strict';
// G2's own runner is reached as a child and flattened (it lists G2's units, G1's units and A03's 6,865).
// No older harness changes its count with G3 present: 8b.1-UI-02's one conditional fixture is inside its own harness.
const path = require('path'), {spawnSync} = require('child_process');
if (!process.argv[2]) throw new Error('Pass the built sheet path.');
const sheet = path.resolve(process.argv[2]);
let passed = 0, total = 0, failed = 0;
const suites = [
  [path.resolve(__dirname, '../../8b.1-UI-01 — Starting-Spell Review and Its Actions/qa/spell-review-harness.js'), 32],
  [path.resolve(__dirname, '../../8b.1-UI-02 — Readable Spell Name and School Tag/qa/spell-name-harness.js'), 28],
  [path.resolve(__dirname, '../../8b.1-UI-03 — Remove Apart from Memorised/qa/spell-remove-harness.js'), 34],
  [path.resolve(__dirname, '../../G2 — Small Layout Fixes/qa/current-suite-runner.js'), 7148]
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
process.exitCode = total === 7242 && passed === total && failed === 0 ? 0 : 1;

module.exports.changedHarnesses = {
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/8b.1-UI-01 — Starting-Spell Review and Its Actions/qa/spell-review-harness.js": 32,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/8b.1-UI-02 — Readable Spell Name and School Tag/qa/spell-name-harness.js": 28,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/8b.1-UI-03 — Remove Apart from Memorised/qa/spell-remove-harness.js": 34
};
