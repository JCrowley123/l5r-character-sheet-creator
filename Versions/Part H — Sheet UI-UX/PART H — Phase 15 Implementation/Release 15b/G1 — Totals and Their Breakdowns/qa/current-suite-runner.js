// Release 15b group 1 (A14, B04, B14, B17): A14 17 + B04 12 + B14 10 + B17 13 + G6's 7,453 = 7,505; older counts unchanged.
'use strict';
// G6's own runner is reached as a child and flattened (it lists A19, A20, A19.1 and G5's 7,401).
// Three older harnesses follow a unit's switch (declared in the units' and the layers' ROLLBACK.md): Phase 4.5.29's
// wound-entries harness (A14), Feature 4.5.24's spirit-realms harness (B14) and Phase 4.5's expansion harness (B17).
// Each keeps its ids and its count, so no older count changes with the group present.
const path = require('path'), {spawnSync} = require('child_process');
if (!process.argv[2]) throw new Error('Pass the built sheet path.');
const sheet = path.resolve(process.argv[2]);
let passed = 0, total = 0, failed = 0;
const suites = [
  [path.resolve(__dirname, '../../A14 — One Net Wound Penalty/qa/net-wound-harness.js'), 17],
  [path.resolve(__dirname, '../../B04 — One Armor TN Breakdown/qa/armor-tn-harness.js'), 12],
  [path.resolve(__dirname, "../../B14 — Jigoku's Total, Then Its Arithmetic/qa/jigoku-total-harness.js"), 10],
  [path.resolve(__dirname, '../../B17 — One Row for Kharmic Tie/qa/kharmic-row-harness.js'), 13],
  [path.resolve(__dirname, '../../../Release 15a/G6 — New Functions/qa/current-suite-runner.js'), 7453]
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
process.exitCode = total === 7505 && passed === total && failed === 0 ? 0 : 1;

module.exports.changedHarnesses = {
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15b/A14 — One Net Wound Penalty/qa/net-wound-harness.js": 17,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15b/B04 — One Armor TN Breakdown/qa/armor-tn-harness.js": 12,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15b/B14 — Jigoku's Total, Then Its Arithmetic/qa/jigoku-total-harness.js": 10,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15b/B17 — One Row for Kharmic Tie/qa/kharmic-row-harness.js": 13
};
