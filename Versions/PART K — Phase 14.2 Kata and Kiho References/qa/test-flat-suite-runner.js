/* Synthetic orchestration checks only: no leaf script or browser is launched. */
'use strict';
const assert = require('assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {createRunner, runSuite, lastCount} = require('./flat-suite-runner.js');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'l5r-flat-runner-'));
let passed = 0;
function check(name, fn) { fn(); passed++; console.log('PASS ' + name); }
function write(relative, text) {
  const file = path.join(temp, relative);
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, text);
  return file;
}
const inner = write('inner/current-suite-runner.js', `
  const path = require('path'), {spawnSync} = require('child_process');
  let total = 0, passed = 0, failed = 0;
  for (const name of ['a.js', 'b.js']) {
    const r = spawnSync(process.execPath, [path.join(__dirname, name), process.argv[2], '--special'],
      {cwd: __dirname, env: {...process.env, FLAT_FIXTURE: 'yes'}, timeout: 12345, maxBuffer: 123456, encoding: 'utf8'});
    const m = /(\\d+)\\/(\\d+) checks passed/.exec(r.stdout || '');
    if (!m || r.status !== 0) failed++;
    if (m) {passed += +m[1]; total += +m[2];}
  }
  console.log('COMBINED ' + passed + '/' + total + ' checks passed');
  process.exitCode = failed === 0 && total === 2 && passed === total ? 0 : 1;
`);
const root = write('root/current-suite-runner.js', `
  const path = require('path'), {spawnSync} = require('child_process');
  let passed = 0, total = 0, failed = 0;
  for (const [file, expected] of [[${JSON.stringify(inner)}, 2], [path.join(__dirname, 'c.js'), 1]]) {
    const r = spawnSync(process.execPath, [file, process.argv[2]], {encoding: 'utf8', timeout: 1});
    const m = /(\\d+)\\/(\\d+) checks passed/.exec(r.stdout || '');
    if (!m || +m[2] !== expected || r.status !== 0 || r.error) failed++;
    if (m) {passed += +m[1]; total += +m[2];}
  }
  console.log('COMBINED ' + passed + '/' + total + ' checks passed');
  process.exitCode = failed === 0 && total === 3 && passed === total ? 0 : 1;
`);
const sheet = path.join(temp, 'sheet.html');
for (const leaf of ['inner/a.js', 'inner/b.js', 'root/c.js']) write(leaf, 'throw new Error("fixture leaf must never execute");');
function good() { return {status: 0, stdout: '1/1 checks passed\n', stderr: ''}; }
function run(launch = good, expected = 3) {
  return runSuite({entry: root, sheet, expected, cwd: temp, env: {KEEP: 'kept'}, launch});
}

try {
  check('same leaf order, args, inherited cwd, env and leaf limits', () => {
    const calls = [];
    const result = run((command, args, options) => {calls.push({command, args, options}); return good();});
    assert.equal(result.pass, true);
    assert.equal(result.wrappers.length, 2);
    assert.equal(result.leafTotal, 3);
    assert.deepEqual(calls.map(c => path.basename(c.args[0])), ['a.js', 'b.js', 'c.js']);
    assert.deepEqual(calls[0].args.slice(1), [sheet, '--special']);
    assert.equal(calls[0].options.cwd, path.dirname(inner));
    assert.deepEqual({...calls[0].options.env}, {KEEP: 'kept', FLAT_FIXTURE: 'yes'});
    assert.equal(calls[0].options.timeout, 12345);
    assert.equal(calls[0].options.maxBuffer, 123456);
    assert.equal(calls[2].options.cwd, temp);
    assert.equal(calls[2].options.timeout, 1);
  });
  check('nonzero leaf exit fails even with passing summary', () => {
    assert.equal(run(() => ({...good(), status: 1})).pass, false);
  });
  check('leaf spawn error fails even with zero exit and passing summary', () => {
    assert.equal(run(() => ({...good(), error: new Error('timeout')})).pass, false);
  });
  check('throwing leaf launch is recorded as failure', () => {
    const result = run(() => { throw new Error('cannot launch'); });
    assert.equal(result.pass, false);
    assert.equal(result.leafFailures, 3);
  });
  check('missing and empty summaries cannot pass', () => {
    for (const stdout of ['', '0/0 checks passed\n']) assert.equal(run(() => ({...good(), stdout})).pass, false);
  });
  check('actual wrapper count assertions remain enforced', () => {
    const result = run(() => ({...good(), stdout: '2/2 checks passed\n'}), 6);
    assert.equal(result.count.total, 6);
    assert.equal(result.run.status, 1);
    assert.equal(result.pass, false);
  });
  check('strict final total cannot silently shrink', () => {
    assert.equal(run(good, 4).pass, false);
  });
  check('failed assertions propagate independently of total', () => {
    assert.equal(run(() => ({...good(), stdout: '0/1 checks passed\n'})).pass, false);
  });
  check('list mode does not launch leaves or claim a passing suite', () => {
    const result = runSuite({entry: root, sheet, expected: 3, listOnly: true,
      launch() { throw new Error('must never launch'); }});
    assert.equal(result.leaves.length, 3);
    assert.deepEqual(result.wrapperErrors, []);
    assert.equal(result.pass, false);
    assert.equal(result.leafTotal, 0);
  });
  check('process.exit and wrapper exceptions become child failures', () => {
    const exit = write('exit/current-suite-runner.js', 'process.exit(7);');
    const broken = write('broken/current-suite-runner.js', 'throw new Error("wrapper failed");');
    const engine = createRunner({launch: good});
    assert.equal(engine.execute(exit).status, 7);
    assert.equal(engine.execute(broken).status, 1);
  });
  check('console table and machine-readable base trailers survive', () => {
    const base = write('base/current-suite-runner.js', `console.table([{passed: 2,total: 2}]);
      console.log('CURRENT_SUITE_RESULT=' + JSON.stringify({suites:[{passed:2,total:2}]}));`);
    const output = createRunner().execute(base).stdout;
    assert.deepEqual(JSON.parse(/CURRENT_SUITE_RESULT=(\{.*\})/.exec(output)[1]), {suites:[{passed:2,total:2}]});
  });
  check('legacy assertions/tests summaries use their actual totals', () => {
    assert.deepEqual(lastCount('4 / 4 assertions passed\n'), {passed: 4, total: 4});
    assert.deepEqual(lastCount('5/5 tests passed\n'), {passed: 5, total: 5});
  });
  console.log(passed + '/' + passed + ' synthetic orchestration checks passed');
} finally {
  const resolved = path.resolve(temp);
  if (path.dirname(resolved) !== path.resolve(os.tmpdir()) || !path.basename(resolved).startsWith('l5r-flat-runner-')) {
    throw new Error('Refusing cleanup outside the verified temporary fixture directory');
  }
  fs.rmSync(resolved, {recursive: true, force: true});
}
