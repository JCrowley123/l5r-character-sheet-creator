'use strict';
// Cycle 5, Release 5b: Release 5a's suite (5,856), the supplement entries (26), their price choices (18) and the offline
// notice after the splash on the deployed site (12): 5,912.
const path = require('path'), {spawnSync} = require('child_process');
if (!process.argv[2]) throw new Error('Pass the built sheet path.');
const sheet = path.resolve(process.argv[2]);
let passed = 0, total = 0, failed = 0;
const suites = [
  [path.resolve(__dirname, '../../QA — Cycle 5 Release 5a 2026-10-21/qa/current-suite-runner.js'), 5856],
  [path.resolve(__dirname, '../../PART I — Phase 4.5.37 Supplement Advantages and Disadvantages/qa/supplement-harness.js'), 26],
  [path.resolve(__dirname, '../../PART I — Phase 4.5.38 Supplement Price Choices/qa/choices-harness.js'), 18],
  [path.join(__dirname, 'notice-checks.js'), 12]
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
process.exitCode = total === 5912 && passed === total && failed === 0 ? 0 : 1;
