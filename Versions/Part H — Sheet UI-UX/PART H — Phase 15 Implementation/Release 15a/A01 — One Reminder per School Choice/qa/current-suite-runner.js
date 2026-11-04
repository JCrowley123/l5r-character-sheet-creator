'use strict';
// Release 15a, A01 adds 31 Review reminder checks to Release 8c's 6,774.
const path = require('path'), {spawnSync} = require('child_process');
if (!process.argv[2]) throw new Error('Pass the built sheet path.');
const sheet = path.resolve(process.argv[2]);
let passed = 0, total = 0, failed = 0;
const suites = [
  [path.resolve(__dirname, 'review-reminder-harness.js'), 31],
  [path.resolve(__dirname, '../../../../../PART K — Phase 11.2.6 Rank Advancement Spell Choices/qa/current-suite-runner.js'), 6774]
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
process.exitCode = total === 6805 && passed === total && failed === 0 ? 0 : 1;

module.exports.changedHarnesses = {
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A01 — One Reminder per School Choice/qa/review-reminder-harness.js": 31,
  "PART K — Phase 11.2.2 Wizard Free Choices Spells and Kiho/qa/wizard3-harness.js": 52,
  "PART K — Phase 11.2.3 Wizard Starting Spells/qa/wizard4-harness.js": 25,
  "PART K — Phase 11.2.4 Wizard Starting Spells for Every School/qa/wizard5-harness.js": 71,
  "PART K — Phase 11.2.6 Rank Advancement Spell Choices/qa/rank-spell-harness.js": 36
};
