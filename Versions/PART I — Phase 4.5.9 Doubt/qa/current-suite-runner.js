/* Current regression entry point, as of Feature 4.59.
 *
 * Delegates to Feature 4.58's runner UNCHANGED — which in turn delegates to 4.57's, and so on
 * down to 4.5.2's — and adds this release's own suite, reporting one combined total. When 4.59
 * is rolled back this file goes with its folder and 4.58's runner is the entry point again.
 *
 *   node current-suite-runner.js <sheet.html>
 */
'use strict';
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

const repo = path.resolve(__dirname, '../../..');
const sheetArg = process.argv.slice(2).find(arg => !arg.startsWith('--'));
if (!sheetArg) {
  console.error('usage: node current-suite-runner.js <sheet.html>');
  process.exit(2);
}
const sheet = path.resolve(sheetArg);

const previous = path.join(repo, 'Versions/PART I — Phase 4.5.8 Dependant and Wrath of the Kami/qa/current-suite-runner.js');
const own = path.join(__dirname, 'disadv-doubt-harness.js');

let passed = 0;
let total = 0;
let failures = 0;

function runOne(label, file, args) {
  if (!fs.existsSync(file)) {
    console.log(`FAIL ${label}: runner missing at ${file}`);
    failures += 1;
    return '';
  }
  const run = spawnSync(process.execPath, [file, ...args], {
    env: process.env, cwd: path.dirname(file), encoding: 'utf8',
    timeout: 1800000, maxBuffer: 64 * 1024 * 1024,
  });
  const output = (run.stdout || '') + (run.stderr || '');
  process.stdout.write(output.split('\n').filter(line => /^(PASS|FAIL) /.test(line)).join('\n') + '\n');
  if (run.status !== 0) failures += 1;
  return output;
}

const previousOutput = runOne('Feature 4.58 suite set', previous, [sheet]);
const trailer = /COMBINED (\d+)\/(\d+) checks passed/.exec(previousOutput);
if (trailer) { passed += Number(trailer[1]); total += Number(trailer[2]); }
else { console.log('FAIL the 4.58 runner produced no combined total'); failures += 1; }

const ownOutput = runOne('Feature 4.59 Doubt', own, [sheet]);
const ownCounts = /(\d+)\/(\d+) checks passed/.exec(ownOutput);
if (ownCounts) { passed += Number(ownCounts[1]); total += Number(ownCounts[2]); }
else { console.log('FAIL the 4.59 harness produced no count'); failures += 1; }

console.log(`\nCOMBINED ${passed}/${total} checks passed across every retained suite plus Feature 4.59`);
console.log('COMBINED_SUITE_RESULT=' + JSON.stringify({ sheet, passed, total, failedSuites: failures }));
process.exitCode = failures === 0 && passed === total ? 0 : 1;
