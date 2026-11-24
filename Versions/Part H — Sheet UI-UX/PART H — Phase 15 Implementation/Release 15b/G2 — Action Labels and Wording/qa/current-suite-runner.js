// Release 15b group 2 (B01, B03, B05, B09): B01 23 + B03 15 + B05 10 + B09 9 + group 1's 7,505 = 7,562; older counts unchanged.
'use strict';
// Group 1's own runner is reached as a child and flattened (it lists A14, B04, B14, B17 and G6's 7,453).
// Three older harnesses follow B01's switch (declared in B01's and the layers' ROLLBACK.md): Feature 4.5.31's checks
// harness, Feature 4.5.33's void-initiative harness and Release 15a A07's moon-row harness. Each keeps its ids and its
// count, so no older count changes with the group present; changedHarnesses below pins those three counts as well.
const path = require('path'), {spawnSync} = require('child_process');
if (!process.argv[2]) throw new Error('Pass the built sheet path.');
const sheet = path.resolve(process.argv[2]);
let passed = 0, total = 0, failed = 0;
const suites = [
  [path.resolve(__dirname, '../../B01 — Check Buttons Named for What They Do/qa/check-names-harness.js'), 23],
  [path.resolve(__dirname, '../../B03 — Lead an Ally/qa/lead-an-ally-harness.js'), 15],
  [path.resolve(__dirname, '../../B05 — You Remain in Control/qa/remain-in-control-harness.js'), 10],
  [path.resolve(__dirname, '../../B09 — Skill Picker Traits from the Final List/qa/picker-traits-harness.js'), 9],
  [path.resolve(__dirname, '../../G1 — Totals and Their Breakdowns/qa/current-suite-runner.js'), 7505]
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
process.exitCode = total === 7562 && passed === total && failed === 0 ? 0 : 1;

module.exports.changedHarnesses = {
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15b/B01 — Check Buttons Named for What They Do/qa/check-names-harness.js": 23,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15b/B03 — Lead an Ally/qa/lead-an-ally-harness.js": 15,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15b/B05 — You Remain in Control/qa/remain-in-control-harness.js": 10,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15b/B09 — Skill Picker Traits from the Final List/qa/picker-traits-harness.js": 9,
  "PART I — Phase 4.5.31 Checks and Conditions/qa/checks-conditions-harness.js": 101,
  "PART I — Phase 4.5.33 Void and Initiative Entries/qa/void-initiative-harness.js": 44,
  "Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A07 — The Moon Row/qa/moon-row-harness.js": 26
};
