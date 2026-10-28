'use strict';
// Release 7b.1: the eight desk-review layers, then main's suite (Cycle 7a device follow-up, 6365).
const path = require('path'), {spawnSync} = require('child_process');
if (!process.argv[2]) throw new Error('Pass the built sheet path.');
const sheet = path.resolve(process.argv[2]);
let passed = 0, total = 0, failed = 0;
const suites = [
  [path.resolve(__dirname, "../../BUGFIX — Void Raise Not on Initiative/qa/void-raise-harness.js"), 12],
  [path.resolve(__dirname, "../../BUGFIX — Hotei Where the Sheet Spends Void/qa/hotei-auto-harness.js"), 16],
  [path.resolve(__dirname, "../../BUGFIX — Skill List Hides Held Skills/qa/skill-list-harness.js"), 12],
  [path.resolve(__dirname, "../../BUGFIX — Gender From Identity and the Wizard/qa/gender-harness.js"), 12],
  [path.resolve(__dirname, "../../BUGFIX — Advanced Schools Pointer/qa/school-pointer-harness.js"), 12],
  [path.resolve(__dirname, "../../BUGFIX — Wizard Skill Remove/qa/wizard-remove-harness.js"), 5],
  [path.resolve(__dirname, "../../BUGFIX — Jurojin Reminder Steps/qa/jurojin-harness.js"), 6],
  [path.resolve(__dirname, "../../BUGFIX — Ancestor Gifts Used and Favour/qa/ancestor-gifts-harness.js"), 12],
  [path.resolve(__dirname, "../../QA — Cycle 7a Device Follow-up 2026-10-27/qa/current-suite-runner.js"), 6365]
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
process.exitCode = total === 6452 && passed === total && failed === 0 ? 0 : 1;

