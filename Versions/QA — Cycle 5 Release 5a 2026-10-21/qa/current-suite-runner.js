'use strict';
// Cycle 5, Release 5a: the Library's suite (5,705), the Clan & School fix (72), the deployed-site checks (61 since
// Release 5a.2's splash, 55 before) and the printed tables with the web fonts blocked (18).
const path = require('path'), {spawnSync} = require('child_process');
if (!process.argv[2]) throw new Error('Pass the built sheet path.');
const sheet = path.resolve(process.argv[2]);
let passed = 0, total = 0, failed = 0;
const suites = [
  [path.resolve(__dirname, '../../PART K — Phase 13 Library/qa/current-suite-runner.js'), 5705],
  [path.resolve(__dirname, '../../BUGFIX — Clan and School Pickers Follow the Character/qa/cfs-sync-harness.js'), 72],
  [path.join(__dirname, 'sw-checks.js'), 61],
  [path.resolve(__dirname, '../../BUGFIX — Printed Emphases Without the Web Fonts/qa/fonts-harness.js'), 18]
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
process.exitCode = total === 5856 && passed === total && failed === 0 ? 0 : 1;
