/* Current regression entry point, as of Feature 4.53.
 *
 * Delegates to Phase 4.5.2's runner UNCHANGED -- that file is a previous release's and is not
 * edited here -- and then adds this release's own suite, reporting one combined total. When
 * 4.53 is rolled back, this file goes with its folder and 4.5.2's runner is the entry point
 * again, exactly as it was before.
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

const previous = path.join(repo, 'Versions/PART I — Phase 4.5.2 Disadvantages/qa/current-suite-runner.js');
const own = path.join(__dirname, 'adv-config-repairs-harness.js');

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
    timeout: 900000, maxBuffer: 32 * 1024 * 1024,
  });
  const output = (run.stdout || '') + (run.stderr || '');
  process.stdout.write(output.split('\n').filter(line => /^(PASS|FAIL) /.test(line)).join('\n') + '\n');
  if (run.status !== 0) failures += 1;
  return output;
}

// Phase 4.5.2's runner prints its own PASS/FAIL lines and a machine-readable trailer.
const previousOutput = runOne('Phase 4.5.2 suite set', previous, [sheet]);
const trailer = /CURRENT_SUITE_RESULT=(\{.*\})\s*$/m.exec(previousOutput);
if (trailer) {
  try {
    JSON.parse(trailer[1]).suites.forEach(suite => {
      if (typeof suite.passed === 'number') { passed += suite.passed; total += suite.total; }
    });
  } catch (error) { console.log('FAIL could not parse the 4.5.2 runner trailer: ' + error.message); failures += 1; }
} else {
  console.log('FAIL the 4.5.2 runner produced no machine-readable trailer');
  failures += 1;
}

const ownOutput = runOne('Feature 4.53 repairs', own, [sheet]);
const ownCounts = /(\d+)\/(\d+) checks passed/.exec(ownOutput);
if (ownCounts) { passed += Number(ownCounts[1]); total += Number(ownCounts[2]); }
else { console.log('FAIL the 4.53 harness produced no count'); failures += 1; }

console.log(`\nCOMBINED ${passed}/${total} checks passed across every retained suite plus Feature 4.53`);
console.log('COMBINED_SUITE_RESULT=' + JSON.stringify({ sheet, passed, total, failedSuites: failures }));
process.exitCode = failures === 0 && passed === total ? 0 : 1;
