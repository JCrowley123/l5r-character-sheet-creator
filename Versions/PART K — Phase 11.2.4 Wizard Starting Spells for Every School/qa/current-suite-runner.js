'use strict';
const path = require('path');
const {spawnSync} = require('child_process');
const sheet = process.argv[2] && path.resolve(process.argv[2]);
if (!sheet) { console.error('usage: node current-suite-runner.js <sheet.html>'); process.exit(2); }
const previous = path.resolve(__dirname, '../../BUGFIX — Kitsune Shugenja Listed Under Mantis/qa/current-suite-runner.js');
let passed = 0, total = 0, failures = 0;
for (const [file, pattern] of [[previous, /COMBINED (\d+)\/(\d+) checks passed across every retained suite plus the Kitsune Shugenja \[Mantis\] removal/],
  [path.join(__dirname, 'wizard5-harness.js'), /(\d+)\/(\d+) checks passed/]]) {
  const run = spawnSync(process.execPath, [file, sheet], {env:process.env, encoding:'utf8', timeout:2400000, maxBuffer:64 * 1024 * 1024});
  const output = (run.stdout || '') + (run.stderr || '');
  process.stdout.write(output);
  const count = pattern.exec(output);
  // A missing or 0/0 suite is a failure, never a pass: a wrong NODE_PATH launches nothing.
  if (!count || Number(count[2]) === 0) { console.log('FAIL missing or empty suite ' + file); failures++; }
  else { passed += Number(count[1]); total += Number(count[2]); }
  if (run.status !== 0) failures++;
}
console.log(`COMBINED ${passed}/${total} checks passed across every retained suite plus Phase 11.2.4 Wizard Starting Spells for Every School`);
console.log('COMBINED_SUITE_RESULT=' + JSON.stringify({sheet, passed, total, failedSuites:failures}));
process.exitCode = total > 0 && passed === total && failures === 0 ? 0 : 1;
