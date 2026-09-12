/* Current regression entry point. Delegates to existing harnesses unchanged. */
'use strict';
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const repo = path.resolve(__dirname, '../../..');
const sheetArg = process.argv.slice(2).find(arg => !arg.startsWith('--'));
if (!sheetArg) { console.error('usage: node current-suite-runner.js <sheet.html> [--existing-only] [--phase45-only]'); process.exit(2); }
const sheet = path.resolve(sheetArg);
const existingOnly = process.argv.includes('--existing-only');
const phaseOnly = process.argv.includes('--phase45-only');
const suites = [
  ['Phase 4.5 original', 'Versions/PART I — Phase 4.5 Modal-Configured Advantages-Disadvantages/qa/adv-config-harness.js'],
  ['Phase 4.5 Advantages', 'Versions/PART I — Phase 4.5 Modal-Configured Advantages-Disadvantages/qa/adv-config-expansion-harness.js'],
  ...(!existingOnly ? [['Phase 4.5.2 Disadvantages', path.join(__dirname, 'disadv-config-harness.js')]] : []),
  ...(!phaseOnly ? [
    ['Phase 1.5 pipeline', 'Versions/Part G — Combat & Roll Engine/PART G — Phase 1.5 Roll Pipeline Consolidation/qa/roll-pipeline-baseline.js'],
    ['Phase 3 preview', 'Versions/Part G — Combat & Roll Engine/PART G — Phase 3 Smart Roll Preview/qa/roll-preview-harness.js'],
    ['Phase 4 explanation', 'Versions/Part G — Combat & Roll Engine/PART G — Phase 4 Explain This Roll/qa/roll-breakdown-harness.js'],
    ['Phase 1 UI', 'Versions/Part H — Sheet UI-UX/PART H — Phase 1 UI-UX Foundations/qa/ui-foundations-harness.js'],
    ['Phase 1.6 wounds', 'Versions/Part H — Sheet UI-UX/PART H — Phase 1.6 Combat Tab Streamlining/qa/wound-bar-harness.js'],
    ['Phase 2 sidebar', 'Versions/Part H — Sheet UI-UX/PART H — Phase 2 Quick-Access Sidebar/qa/quick-access-sidebar-harness.js'],
    ['Phase 5 validation', 'Versions/Part J — Data Integrity & Validation/PART J — Phase 5 Character Creation Linting/qa/character-validator-harness.js'],
    ['Phase 8 casting', 'Versions/Part J — Data Integrity & Validation/PART J — Phase 8 Why Cant I Cast This/qa/casting-diagnostics-harness.js'],
    ['Phase 9 Clan UI', 'Versions/Part H — Sheet UI-UX/PART H — Phase 9 Clan-Themed Look/qa/clan-theming-harness.js'],
    ['Spell slots bugfix', 'Versions/BUGFIX — Spell Slots Tab Visibility Race/qa/spell-slots-visibility-harness.js'],
  ] : []),
];
const results = [];
for (const [name, relative] of suites) {
  const file = path.isAbsolute(relative) ? relative : path.join(repo, relative);
  if (!fs.existsSync(file)) { results.push({ name, pass: false, reason: 'harness missing', file }); continue; }
  const run = spawnSync(process.execPath, [file, sheet], { env: process.env, cwd: path.dirname(file), encoding: 'utf8', timeout: 240000, maxBuffer: 10 * 1024 * 1024 });
  const output = (run.stdout || '') + (run.stderr || '');
  const counts = Array.from(output.matchAll(/(\d+)\s*\/\s*(\d+)\s+(?:checks|assertions|tests)\s+passed/g)).pop();
  const result = { name, pass: run.status === 0, passed: counts ? Number(counts[1]) : null, total: counts ? Number(counts[2]) : null, exit: run.status };
  if (!result.pass) result.output = output;
  results.push(result);
  console.log(`${result.pass ? 'PASS' : 'FAIL'} ${name}: ${result.passed === null ? 'exit ' + result.exit : result.passed + '/' + result.total}`);
  if (!result.pass) console.log(output);
}
console.table(results.map(({ output, ...result }) => result));
console.log('CURRENT_SUITE_RESULT=' + JSON.stringify({ sheet, suites: results, failed: results.filter(r => !r.pass).length }));
process.exitCode = results.every(r => r.pass) ? 0 : 1;
