'use strict';
// Release 15b group 2 retained: the tree with B01, B03, B05 and B09 removed, which is group 1 as live (5ac767c6), less the
// 73 live-site checks. A14's 17, B04's 12, B14's 10 and B17's 13, plus group 1's own retained runner (Release 15a as live
// less the same 73) 7,380 = 7,432. The three harnesses that follow B01's switch run here without it, with their counts pinned.
const path = require('path'), {spawnSync} = require('child_process');
if (!process.argv[2]) throw new Error('Pass the built sheet path.');
const sheet = path.resolve(process.argv[2]);
let passed = 0, total = 0, failed = 0;
const R15B = path.resolve(__dirname, '../..');
const suites = [
  [path.join(R15B, 'A14 — One Net Wound Penalty/qa/net-wound-harness.js'), 17],
  [path.join(R15B, 'B04 — One Armor TN Breakdown/qa/armor-tn-harness.js'), 12],
  [path.join(R15B, "B14 — Jigoku's Total, Then Its Arithmetic/qa/jigoku-total-harness.js"), 10],
  [path.join(R15B, 'B17 — One Row for Kharmic Tie/qa/kharmic-row-harness.js'), 13],
  [path.join(R15B, 'G1 — Totals and Their Breakdowns/qa/retained-suite-runner.js'), 7380]
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
process.exitCode = total === 7432 && passed === total && failed === 0 ? 0 : 1;

module.exports.changedHarnesses = {
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15b/A14 — One Net Wound Penalty/qa/net-wound-harness.js": 17,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15b/B04 — One Armor TN Breakdown/qa/armor-tn-harness.js": 12,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15b/B14 — Jigoku's Total, Then Its Arithmetic/qa/jigoku-total-harness.js": 10,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15b/B17 — One Row for Kharmic Tie/qa/kharmic-row-harness.js": 13,
  "PART I — Phase 4.5.31 Checks and Conditions/qa/checks-conditions-harness.js": 101,
  "PART I — Phase 4.5.33 Void and Initiative Entries/qa/void-initiative-harness.js": 44,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A07 — The Moon Row/qa/moon-row-harness.js": 26
};
