'use strict';
const path = require('path'), {spawnSync} = require('child_process');
if (!process.argv[2]) throw new Error('Pass the built sheet path.');
const sheet = path.resolve(process.argv[2]);
let passed = 0, total = 0, failed = 0;
const suites = [
  [path.resolve(__dirname, '../../PART K — Phase 11.1 Export to PDF/qa/current-suite-runner.js'), 5011],
  [path.join(__dirname, 'skill-traits-harness.js'), 38],
  [path.join(__dirname, 'dependency-harness.js'), 8]
];
for (const [file, expected] of suites) {
  const run = spawnSync(process.execPath, [file, sheet], {
    env: process.env, encoding: 'utf8', timeout: 3600000, maxBuffer: 64 * 1024 * 1024
  });
  const output = (run.stdout || '') + (run.stderr || '');
  process.stdout.write(output);
  const counts = [...output.matchAll(/(?:COMBINED )?(\d+)\/(\d+) checks passed/g)];
  const count = counts.at(-1);
  if (!count || Number(count[2]) !== expected) {
    console.error('Unexpected check count for ' + file + ': expected ' + expected);
    failed++;
  }
  if (count) { passed += Number(count[1]); total += Number(count[2]); }
  if (run.status !== 0 || run.error) failed++;
}
console.log('COMBINED ' + passed + '/' + total + ' checks passed');
process.exitCode = total === 5057 && passed === total && failed === 0 ? 0 : 1;
