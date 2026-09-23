'use strict';
// NOTE ON THE MATCH: 4.5.13's own current-suite-runner.js (copied here as the pattern to chain
// onto) propagates its "previous" child's FULL raw output via process.stdout.write() before
// printing its own final COMBINED line -- so a THIRD-level caller (this file) sees TWO
// "COMBINED N/N checks passed" lines in 4.5.13's output: the deep chain's own summary (BUGFIX -
// Negative Roll Modifier Display's, propagated verbatim) followed by 4.5.13's own. A plain
// non-global exec() finds the FIRST one, silently under-counting. BUGFIX's own runner avoids this
// by filtering a child's propagated output down to PASS/FAIL lines only before re-printing it;
// that filtering approach is copied here (rather than in 4.5.13's file, which stays untouched -
// see this phase's ROLLBACK.md) and generalised with a last-match search, which is correct
// whether or not the immediate previous link filters its own children.
const path = require('path');
const {spawnSync} = require('child_process');
const sheet = process.argv[2] && path.resolve(process.argv[2]);
if (!sheet) { console.error('usage: node current-suite-runner.js <sheet.html>'); process.exit(2); }
const previous = path.resolve(__dirname, '../../PART I — Phase 4.5.13 Named Advantages/qa/current-suite-runner.js');
function lastMatch(text, pattern) {
  const all = [...text.matchAll(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'))];
  return all.length ? all[all.length - 1] : null;
}
let passed=0, total=0, failures=0;
for (const [file, pattern] of [[previous,/COMBINED (\d+)\/(\d+) checks passed/],
  [path.join(__dirname,'fortune-blessing-harness.js'),/(\d+)\/(\d+) checks passed/]]) {
  const run=spawnSync(process.execPath,[file,sheet],{env:process.env,encoding:'utf8',timeout:1800000,maxBuffer:64*1024*1024});
  const output=(run.stdout||'')+(run.stderr||'');
  process.stdout.write(output.split('\n').filter(line => /^(PASS|FAIL) /.test(line)).join('\n') + '\n');
  const count=lastMatch(output, pattern);
  if (!count || Number(count[2])===0) {console.log('FAIL missing or empty suite '+file);failures++;}
  else {passed+=Number(count[1]);total+=Number(count[2]);}
  if(run.status!==0) failures++;
}
console.log(`COMBINED ${passed}/${total} checks passed across every retained suite plus Seven Fortunes' Blessing`);
console.log('COMBINED_SUITE_RESULT='+JSON.stringify({sheet,passed,total,failedSuites:failures}));
process.exitCode=total>0&&passed===total&&failures===0?0:1;
