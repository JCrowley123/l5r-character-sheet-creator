'use strict';
// Release 15a, A02 retained: the tree with A02 removed is exactly Release 15a A01 as live; its 6,732 sheet assertions
// are A01's 6,805 less the two live-site leaves (5a's sw-checks, 5b's notice-checks), as A01's own retained run excluded them.
const path = require('path'), {spawnSync} = require('child_process');
if (!process.argv[2]) throw new Error('Pass the built sheet path.');
const sheet = path.resolve(process.argv[2]);
let passed = 0, total = 0, failed = 0;
const suites = [
  [path.resolve(__dirname, '../../A01 — One Reminder per School Choice/qa/review-reminder-harness.js'), 31],
  [path.resolve(__dirname, '../../A01 — One Reminder per School Choice/qa/retained-suite-runner.js'), 6701]
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
process.exitCode = total === 6732 && passed === total && failed === 0 ? 0 : 1;

module.exports.changedHarnesses = {
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A01 — One Reminder per School Choice/qa/review-reminder-harness.js": 31
};
