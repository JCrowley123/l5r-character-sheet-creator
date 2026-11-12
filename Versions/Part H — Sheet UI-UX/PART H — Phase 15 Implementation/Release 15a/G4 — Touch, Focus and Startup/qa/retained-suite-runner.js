'use strict';
// Release 15a G4 retained: the tree with all of G4 removed, which is G3 as live, less the 73 live-site checks.
// G3's units 32 + 28 + 34 = 94, plus G3's own retained runner (G2 as live less the same 73) 7,075 = 7,169.
const path = require('path'), {spawnSync} = require('child_process');
if (!process.argv[2]) throw new Error('Pass the built sheet path.');
const sheet = path.resolve(process.argv[2]);
let passed = 0, total = 0, failed = 0;
const suites = [
  [path.resolve(__dirname, '../../8b.1-UI-01 — Starting-Spell Review and Its Actions/qa/spell-review-harness.js'), 32],
  [path.resolve(__dirname, '../../8b.1-UI-02 — Readable Spell Name and School Tag/qa/spell-name-harness.js'), 28],
  [path.resolve(__dirname, '../../8b.1-UI-03 — Remove Apart from Memorised/qa/spell-remove-harness.js'), 34],
  [path.resolve(__dirname, '../../G3 — Spell Rows/qa/retained-suite-runner.js'), 7075]
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
process.exitCode = total === 7169 && passed === total && failed === 0 ? 0 : 1;

module.exports.changedHarnesses = {
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/8b.1-UI-01 — Starting-Spell Review and Its Actions/qa/spell-review-harness.js": 32,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/8b.1-UI-02 — Readable Spell Name and School Tag/qa/spell-name-harness.js": 28,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/8b.1-UI-03 — Remove Apart from Memorised/qa/spell-remove-harness.js": 34
};
