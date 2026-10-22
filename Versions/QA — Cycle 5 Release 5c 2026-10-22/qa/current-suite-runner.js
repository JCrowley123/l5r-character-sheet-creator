'use strict';
// Cycle 5, Release 5c: Release 5b's suite (5,912), the skill pickers (24), identity and Outfit (21), the changing
// Sworn Enemy (10) and Inheritance's printed heirlooms (6): 5,973.
const path = require('path'), {spawnSync} = require('child_process');
if (!process.argv[2]) throw new Error('Pass the built sheet path.');
const sheet = path.resolve(process.argv[2]);
let passed = 0, total = 0, failed = 0;
const suites = [
  [path.resolve(__dirname, '../../QA — Cycle 5 Release 5b 2026-10-22/qa/current-suite-runner.js'), 5912],
  [path.resolve(__dirname, '../../PART I — Phase 4.5.39 Supplement Skill Pickers/qa/skill-pickers-harness.js'), 24],
  [path.resolve(__dirname, '../../PART I — Phase 4.5.40 Supplement Identity and Outfit/qa/identity-outfit-harness.js'), 21],
  [path.resolve(__dirname, '../../PART I — Phase 4.5.41 A Changing Sworn Enemy/qa/shifting-enemy-harness.js'), 10],
  [path.resolve(__dirname, '../../PART I — Phase 4.5.42 Inheritance and the Printed Heirlooms/qa/printed-heirlooms-harness.js'), 6]
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
process.exitCode = total === 5973 && passed === total && failed === 0 ? 0 : 1;
