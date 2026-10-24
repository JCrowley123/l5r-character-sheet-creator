'use strict';
// Cycle 6, Release 6a: Release 5c.1's suite (5,983), then the five fixes: the pickers after Cancel (16), Yomi and
// the Ancestor (12), the roll preview at the top (10), the typed Initiative total (11) and the Void card reasons (14):
// 6,046. FT-44 adds two blocks to the Clan & School fix's harness and keeps its count (72).
const path = require('path'), {spawnSync} = require('child_process');
if (!process.argv[2]) throw new Error('Pass the built sheet path.');
const sheet = path.resolve(process.argv[2]);
let passed = 0, total = 0, failed = 0;
const suites = [
  [path.resolve(__dirname, '../../QA — Cycle 5 Release 5c.1 2026-10-23/qa/current-suite-runner.js'), 5983],
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
process.exitCode = total === 6046 && passed === total && failed === 0 ? 0 : 1;
