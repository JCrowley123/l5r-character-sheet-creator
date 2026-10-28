'use strict';
// Release 7b.1 retained: main's suite (Cycle 7a device follow-up) less the two live-site leaves, 5a's sw-checks (61)
// and 5b's notice-checks (12), which run only on the live tree's build; the candidate run covers them.
const path = require('path'), {spawnSync} = require('child_process');
if (!process.argv[2]) throw new Error('Pass the built sheet path.');
const sheet = path.resolve(process.argv[2]);
let passed = 0, total = 0, failed = 0;
const suites = [
  [path.resolve(__dirname, "../../BUGFIX — Characteristic Card Editing/qa/card-editing-harness.js"), 46],
  [path.resolve(__dirname, "../../BUGFIX — Wound Settings Preview/qa/wound-preview-harness.js"), 18],
  [path.resolve(__dirname, "../../BUGFIX — Campaign Wound Multipliers/qa/wound-multiplier-harness.js"), 31],
  [path.resolve(__dirname, "../../BUGFIX — Compact Characteristic Controls/qa/compact-points-harness.js"), 33],
  [path.resolve(__dirname, "../../BUGFIX — PDF Field Fit and Rules/qa/pdf-fit-harness.js"), 17],
  [path.resolve(__dirname, "../../BUGFIX — Optional PDF Details Appendix/qa/appendix-harness.js"), 15],
  [path.resolve(__dirname, "../../BUGFIX — PDF Save and Print Workflow/qa/save-harness.js"), 30],

  [path.resolve(__dirname, "../../PART K — Phase 13 Library/qa/current-suite-runner.js"), 5705],
  [path.resolve(__dirname, "../../BUGFIX — Clan and School Pickers Follow the Character/qa/cfs-sync-harness.js"), 72],
  [path.resolve(__dirname, "../../BUGFIX — Printed Emphases Without the Web Fonts/qa/fonts-harness.js"), 18],
  [path.resolve(__dirname, "../../PART I — Phase 4.5.37 Supplement Advantages and Disadvantages/qa/supplement-harness.js"), 26],
  [path.resolve(__dirname, "../../PART I — Phase 4.5.38 Supplement Price Choices/qa/choices-harness.js"), 18],
  [path.resolve(__dirname, "../../PART I — Phase 4.5.39 Supplement Skill Pickers/qa/skill-pickers-harness.js"), 24],
  [path.resolve(__dirname, "../../PART I — Phase 4.5.40 Supplement Identity and Outfit/qa/identity-outfit-harness.js"), 21],
  [path.resolve(__dirname, "../../PART I — Phase 4.5.41 A Changing Sworn Enemy/qa/shifting-enemy-harness.js"), 13],
  [path.resolve(__dirname, "../../PART I — Phase 4.5.42 Inheritance and the Printed Heirlooms/qa/printed-heirlooms-harness.js"), 13],
  [path.resolve(__dirname, "../../BUGFIX — Clan and School Pickers After Cancel/qa/cfs-cancel-harness.js"), 16],
  [path.resolve(__dirname, "../../BUGFIX — Yomi Sees the Ancestor/qa/yomi-ancestor-harness.js"), 12],
  [path.resolve(__dirname, "../../BUGFIX — Roll Preview Opens at the Top/qa/roll-preview-top-harness.js"), 10],
  [path.resolve(__dirname, "../../BUGFIX — Typed Initiative Is the Dice/qa/typed-initiative-harness.js"), 11],
  [path.resolve(__dirname, "../../BUGFIX — Void Card Reasons on a Phone/qa/void-reasons-harness.js"), 14],
  [path.resolve(__dirname, "../../BUGFIX — Social Rank and Points/qa/social-rank-points-harness.js"), 30],
  [path.resolve(__dirname, "../../BUGFIX — Taint Points and Growth/qa/taint-harness.js"), 26],
  [path.resolve(__dirname, "../../BUGFIX — Imperial Scion Shared Status/qa/scion-harness.js"), 12],
  [path.resolve(__dirname, "../../BUGFIX — Honour Resistance Bonus/qa/honour-harness.js"), 20],
  [path.resolve(__dirname, "../../BUGFIX — Template PDF Export/qa/template-pdf-harness.js"), 22],
  [path.resolve(__dirname, "../../BUGFIX — Template PDF Export/qa/coverage-harness.js"), 15],
  [path.resolve(__dirname, "../../BUGFIX — Template PDF Export/qa/school-choices-harness.js"), 4]
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
process.exitCode = total === 6292 && passed === total && failed === 0 ? 0 : 1;

module.exports.changedHarnesses = {
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
