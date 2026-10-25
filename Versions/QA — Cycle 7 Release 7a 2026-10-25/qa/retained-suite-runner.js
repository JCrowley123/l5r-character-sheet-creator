'use strict';
// Cycle 7a retained: Release 6a sheet-level checks only, no deployment suites.
const path = require('path'), {spawnSync} = require('child_process');
if (!process.argv[2]) throw new Error('Pass the built sheet path.');
const sheet = path.resolve(process.argv[2]);
let passed = 0, total = 0, failed = 0;
const suites = [
  [path.resolve(__dirname, '../../PART K — Phase 13 Library/qa/current-suite-runner.js'), 5705],
  [path.resolve(__dirname, '../../BUGFIX — Clan and School Pickers Follow the Character/qa/cfs-sync-harness.js'), 72],
  [path.resolve(__dirname, '../../BUGFIX — Printed Emphases Without the Web Fonts/qa/fonts-harness.js'), 18],
  [path.resolve(__dirname, '../../PART I — Phase 4.5.37 Supplement Advantages and Disadvantages/qa/supplement-harness.js'), 26],
  [path.resolve(__dirname, '../../PART I — Phase 4.5.38 Supplement Price Choices/qa/choices-harness.js'), 18],
  [path.resolve(__dirname, '../../PART I — Phase 4.5.39 Supplement Skill Pickers/qa/skill-pickers-harness.js'), 24],
  [path.resolve(__dirname, '../../PART I — Phase 4.5.40 Supplement Identity and Outfit/qa/identity-outfit-harness.js'), 21],
  [path.resolve(__dirname, '../../PART I — Phase 4.5.41 A Changing Sworn Enemy/qa/shifting-enemy-harness.js'), 13],
  [path.resolve(__dirname, '../../PART I — Phase 4.5.42 Inheritance and the Printed Heirlooms/qa/printed-heirlooms-harness.js'), 13],
  [path.resolve(__dirname, '../../BUGFIX — Clan and School Pickers After Cancel/qa/cfs-cancel-harness.js'), 16],
  [path.resolve(__dirname, '../../BUGFIX — Yomi Sees the Ancestor/qa/yomi-ancestor-harness.js'), 12],
  [path.resolve(__dirname, '../../BUGFIX — Roll Preview Opens at the Top/qa/roll-preview-top-harness.js'), 10],
  [path.resolve(__dirname, '../../BUGFIX — Typed Initiative Is the Dice/qa/typed-initiative-harness.js'), 11],
  [path.resolve(__dirname, '../../BUGFIX — Void Card Reasons on a Phone/qa/void-reasons-harness.js'), 14]
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
