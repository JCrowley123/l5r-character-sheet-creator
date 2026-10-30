'use strict';
// Release 8a: the two layers (Wizard Overspend Warns, Undone Change Not Unsaved Work), then main's suite (Release 7c.1, 6629).
const path = require('path'), {spawnSync} = require('child_process');
if (!process.argv[2]) throw new Error('Pass the built sheet path.');
const sheet = path.resolve(process.argv[2]);
let passed = 0, total = 0, failed = 0;
const suites = [
  [path.resolve(__dirname, "../../BUGFIX — Wizard Overspend Warns/qa/overspend-warns-harness.js"), 17],
  [path.resolve(__dirname, "../../BUGFIX — Undone Change Not Unsaved Work/qa/undone-change-harness.js"), 6],
  [path.resolve(__dirname, "../../QA — Release 7c.1 2026-10-29/qa/current-suite-runner.js"), 6629]
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
process.exitCode = total === 6652 && passed === total && failed === 0 ? 0 : 1;

module.exports.changedHarnesses = {
  "PART K — Phase 11.2 Creation Wizard/qa/wizard-harness.js": 43,
  "PART K — Phase 11.2.1 Wizard Skills and Advantages/qa/wizard2-harness.js": 32,
  "BUGFIX — Carousel Keeps Its Page on Rotation/qa/carousel-rotation-harness.js": 10,
  "PART I — Phase 4.5.16 Heart of Vengeance/qa/heart-vengeance-harness.js": 91,
  "PART I — Phase 4.5.13 Named Advantages/qa/named-advantages-harness.js": 136,
  "PART I — Phase 4.5.14 Darling of the Court and Servant/qa/court-servant-harness.js": 225,
  "PART K — Phase 11 Characters List and Save Model/qa/characters-harness.js": 70,
  "PART I — Phase 4.7 Advanced Schools/qa/advanced-schools-harness.js": 196,
  "PART I — Phase 4.8 Ancestors/qa/ancestors-harness.js": 349,
  "PART I — Phase 4.5.23 Dark Paragon/qa/dark-paragon-harness.js": 67,
  "PART I — Phase 4.6 Alternate Paths/qa/alternate-paths-harness.js": 175,
  "PART I — Phase 4.7.2 Missing Basic Schools/qa/basic-schools-harness.js": 38,
  "PART I — Phase 4.7.1 Supplemental Advanced Schools/qa/supplemental-harness.js": 156,
  "PART I — Phase 4.5.28 Situational Entry Buttons and Gates/qa/situational-buttons-harness.js": 71,
  "Part J — Data Integrity & Validation/PART J — Phase 7 Save Format and Migration/qa/save-format-harness.js": 45,
  "PART I — Phase 4.5.31 Checks and Conditions/qa/checks-conditions-harness.js": 101,
  "PART K — Phase 12.2 Play Mode Identity/qa/identity-harness.js": 17,
  "PART I — Phase 4.5.15 Roll Declaration Registry/qa/roll-declarations-harness.js": 53,
  "PART I — Phase 4.5.27 Situational Roll Entries/qa/situational-entries-harness.js": 117,
  "PART K — Phase 11.1 Export to PDF/qa/pdf-harness.js": 33,
  "BUGFIX — Campaign Wound Multipliers/qa/wound-multiplier-harness.js": 31,
  "BUGFIX — Compact Characteristic Controls/qa/compact-points-harness.js": 33,
  "BUGFIX — PDF Field Fit and Rules/qa/pdf-fit-harness.js": 17,
  "BUGFIX — Optional PDF Details Appendix/qa/appendix-harness.js": 15,
  "BUGFIX — PDF Save and Print Workflow/qa/save-harness.js": 30,
  "BUGFIX — Social Rank and Points/qa/social-rank-points-harness.js": 30,
  "BUGFIX — Taint Points and Growth/qa/taint-harness.js": 26,
  "BUGFIX — Template PDF Export/qa/template-pdf-harness.js": 22,
  "Part H — Sheet UI-UX/PART H — Phase 1.6 Combat Tab Streamlining/qa/wound-bar-harness.js": 23,
  "PART I — Phase 4.5.36 Weakness and the Curse of Hotei/qa/weakness-hotei-harness.js": 45,
  "Part G — Combat & Roll Engine/PART G — Phase 1.5 Roll Pipeline Consolidation/qa/roll-pipeline-baseline.js": 35,
  "BUGFIX — Negative Roll Modifier Display/qa/negative-roll-modifier-harness.js": 12,
  "PART K — Phase 12.8 Play Mode Toolbar/qa/toolbar-harness.js": 37
};
