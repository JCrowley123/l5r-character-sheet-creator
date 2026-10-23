'use strict';
// Cycle 5, Release 5c.1, retained: the tree with this release's two layers (4.5.42, then 4.5.41) removed through the
// registry, which rebuilds Phases 4.5.39 and 4.5.40 exactly. Release 5c's retained suites, listed as its runner lists
// them (the flat runner flattens only files named current-suite-runner.js; a retained runner is never nested): the
// Library's (5,705), the Clan & School fix (72), the printed tables with the web fonts blocked (18), the supplement
// entries (26) and their price choices (18); then the skill pickers (24) and identity and Outfit (21): 5,884.
// The deployed-site checks (5a's 61, 5b's 12) build the site from the live tree, so they run with the candidate.
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
  [path.resolve(__dirname, '../../PART I — Phase 4.5.40 Supplement Identity and Outfit/qa/identity-outfit-harness.js'), 21]
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
process.exitCode = total === 5884 && passed === total && failed === 0 ? 0 : 1;
