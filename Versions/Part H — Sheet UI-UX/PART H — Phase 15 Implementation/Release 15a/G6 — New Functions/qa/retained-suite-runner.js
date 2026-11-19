'use strict';
// Release 15a group G6 retained: the tree with A19, A20 and A19.1 removed, which is G5 (A08) as live, less the 73
// live-site checks. A08's 21, plus G5's own retained runner (the automatic-entries group as live less the same 73)
// 7,307 = 7,328.
const path = require('path'), {spawnSync} = require('child_process');
if (!process.argv[2]) throw new Error('Pass the built sheet path.');
const sheet = path.resolve(process.argv[2]);
let passed = 0, total = 0, failed = 0;
const suites = [
  [path.resolve(__dirname, '../../A08 — One Undo for Quick Taps/qa/quick-tap-undo-harness.js'), 21],
  [path.resolve(__dirname, '../../G5 — Undo and the Roll Preview/qa/retained-suite-runner.js'), 7307]
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
process.exitCode = total === 7328 && passed === total && failed === 0 ? 0 : 1;

module.exports.changedHarnesses = {
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A08 — One Undo for Quick Taps/qa/quick-tap-undo-harness.js": 21
};
