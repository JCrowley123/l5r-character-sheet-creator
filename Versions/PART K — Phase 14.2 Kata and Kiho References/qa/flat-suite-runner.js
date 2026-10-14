/* Run the historical wrappers unchanged inside one Node process. Only leaf
 * harnesses start real child processes, sequentially, with their original
 * arguments, working directories, environment and per-harness limits.
 *
 * Wrapper-wide subprocess deadlines are deliberately not reproduced: those
 * deadlines cover the entire retained chain and caused otherwise valid runs
 * to expire. Each wrapper still parses its children's REAL output and applies
 * its original assertions. No passing summaries are manufactured.
 *
 * node flat-suite-runner.js <sheet.html> [--retained] [--list]
 * --retained runs the 5,057-check predecessor; otherwise expect 5,107 checks.
 * --list records the exact invocation order without launching any harnesses.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const {Console} = require('console');
const {Writable} = require('stream');
const {spawnSync} = require('child_process');
const crypto = require('crypto');

class WrapperExit {
  constructor(code) { this.code = code; }
}

function lastCount(output) {
  const matches = [...String(output).matchAll(/(?:COMBINED )?(\d+)\s*\/\s*(\d+)\s+(?:checks|assertions|tests)\s+passed/g)];
  const match = matches.at(-1);
  return match ? {passed: Number(match[1]), total: Number(match[2])} : null;
}

function createRunner({launch = spawnSync, listOnly = false, progress = () => {}} = {}) {
  const leaves = [], wrappers = [], wrapperErrors = [], stack = [];
  let leafFailures = 0;

  function execute(file, args = [], options = {}) {
    const cwd = path.resolve(options.cwd || process.cwd());
    file = path.resolve(cwd, file);
    const env = {...(options.env || process.env)};
    if (stack.includes(file)) throw new Error('Cyclic suite runner: ' + file);
    if (stack.length >= 200) throw new Error('Suite wrapper depth exceeds 200');
    stack.push(file);
    wrappers.push({file, cwd, depth: stack.length});
    let stdout = '', stderr = '', exitCode = 0;
    const stdoutStream = new Writable({write(chunk, encoding, done) { stdout += chunk.toString(); done(); }});
    const stderrStream = new Writable({write(chunk, encoding, done) { stderr += chunk.toString(); done(); }});
    const virtualProcess = {
      argv: [process.execPath, file, ...args], execPath: process.execPath,
      env, platform: process.platform, arch: process.arch,
      cwd: () => cwd, stdout: stdoutStream, stderr: stderrStream,
      get exitCode() { return exitCode; },
      set exitCode(value) { exitCode = Number(value) || 0; },
      exit(code) { throw new WrapperExit(code == null ? exitCode : Number(code)); }
    };
    const virtualPath = {...path, resolve: (...parts) => path.resolve(cwd, ...parts)};

    function spawn(command, childArgs, childOptions = {}) {
      if (command !== process.execPath || !Array.isArray(childArgs) || !childArgs.length) {
        throw new Error('Unsupported suite launch; expected Node and a script path');
      }
      const effectiveOptions = {...childOptions,
        cwd: path.resolve(cwd, childOptions.cwd || '.'),
        env: childOptions.env || env};
      const child = path.resolve(effectiveOptions.cwd, childArgs[0]);
      if (path.basename(child) === 'current-suite-runner.js') {
        return execute(child, childArgs.slice(1), effectiveOptions);
      }
      const leaf = {file: child, args: childArgs.slice(1), cwd: effectiveOptions.cwd,
        timeout: effectiveOptions.timeout, maxBuffer: effectiveOptions.maxBuffer};
      leaves.push(leaf);
      if (listOnly) {
        if (!fs.existsSync(child)) wrapperErrors.push('Missing leaf harness: ' + child);
        return {status: 0, signal: null, stdout: '', stderr: '', output: [null, '', '']};
      }
      progress({event: 'start', index: leaves.length, ...leaf});
      const started = Date.now();
      let result;
      try { result = launch(command, [child, ...childArgs.slice(1)], effectiveOptions); }
      catch (error) { result = {status: null, signal: null, error, stdout: '', stderr: String(error)}; }
      const output = String(result.stdout || '') + String(result.stderr || '');
      const count = lastCount(output);
      leaf.passed = count && count.passed;
      leaf.total = count && count.total;
      leaf.status = result.status;
      leaf.elapsedMs = Date.now() - started;
      leaf.pass = result.status === 0 && !result.error && !!count && count.total > 0 && count.passed === count.total;
      if (!leaf.pass) leafFailures++;
      progress({event: 'end', index: leaves.length, ...leaf, error: result.error && String(result.error)});
      return result;
    }

    function virtualRequire(name) {
      if (name === 'path' || name === 'node:path') return virtualPath;
      if (name === 'fs' || name === 'node:fs') return fs;
      if (name === 'child_process' || name === 'node:child_process') return {spawnSync: spawn};
      throw new Error('Unexpected module in suite wrapper: ' + name);
    }

    try {
      const sandbox = {require: virtualRequire, process: virtualProcess,
        console: new Console({stdout: stdoutStream, stderr: stderrStream}),
        __filename: file, __dirname: path.dirname(file), module: {exports: {}}, exports: {}};
      vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox, {filename: file});
    } catch (error) {
      if (error instanceof WrapperExit) exitCode = error.code;
      else {
        wrapperErrors.push(file + ': ' + String(error));
        stderr += (error.stack || String(error)) + '\n'; exitCode = 1;
      }
    } finally {
      stack.pop();
    }
    return {status: exitCode, signal: null, stdout, stderr, output: [null, stdout, stderr]};
  }

  return {execute, leaves, wrappers, wrapperErrors, get leafFailures() { return leafFailures; }};
}

function runSuite({entry, sheet, expected, cwd = process.cwd(), env = process.env,
  launch = spawnSync, listOnly = false, progress} = {}) {
  if (!Number.isInteger(expected) || expected <= 0) throw new Error('A positive expected total is required');
  const runner = createRunner({launch, listOnly, progress});
  const run = runner.execute(entry, [path.resolve(cwd, sheet)], {cwd, env});
  const output = run.stdout + run.stderr;
  const count = lastCount(output);
  const leafTotal = runner.leaves.reduce((total, leaf) => total + (leaf.total || 0), 0);
  const pass = !listOnly && run.status === 0 && runner.leafFailures === 0 && !runner.wrapperErrors.length && !!count &&
    count.total === expected && count.passed === expected && leafTotal === expected;
  return {run, output, count, leafTotal, pass, leaves: runner.leaves, wrappers: runner.wrappers,
    leafFailures: runner.leafFailures, wrapperErrors: runner.wrapperErrors};
}

function reusableResult(saved, fingerprint, invocation) {
  if (!saved || !saved.result) return false;
  const output = (saved.result.stdout || '') + (saved.result.stderr || '');
  const count = lastCount(output);
  return saved.fingerprint === fingerprint && JSON.stringify(saved.invocation) === JSON.stringify(invocation) &&
    saved.result.status === 0 && !saved.result.error && !/^FAIL /m.test(output) &&
    !!count && count.total > 0 && count.passed === count.total;
}

function main(argv) {
  const sheet = argv.find(arg => !arg.startsWith('--'));
  if (!sheet || argv.filter(arg => !arg.startsWith('--')).length !== 1 ||
      argv.some(arg => arg.startsWith('--') && !['--retained', '--list', '--resume'].includes(arg))) {
    console.error('usage: node flat-suite-runner.js <sheet.html> [--retained] [--list] [--resume]');
    return 2;
  }
  const retained = argv.includes('--retained'), listOnly = argv.includes('--list');
  const entry = retained ? path.resolve(__dirname, '../../BUGFIX — Skill Traits/qa/current-suite-runner.js')
    : path.join(__dirname, 'current-suite-runner.js');
  const expected = retained ? 5057 : 5107;
  // Resume only successful real leaf results for exactly the same build, test
  // sources, runtime and invocation. Wrapper assertions still consume those
  // actual outputs. Failures are always executed again and every attempt kept.
  const hash = value => crypto.createHash('sha256').update(value).digest('hex');
  const repo = path.resolve(__dirname, '../../..');
  const git = args => {
    const r = spawnSync('git', args, {cwd: repo, encoding: 'utf8', maxBuffer: 64*1024*1024});
    if (r.status !== 0 || r.error) throw Error('Cannot fingerprint test inputs: ' + r.stderr);
    return r.stdout;
  };
  const ownInputs = fs.readdirSync(__dirname).filter(n => /\.(?:js|cjs|py)$/.test(n) || n === 'expected-pages.json')
    .sort().map(n => [n, hash(fs.readFileSync(path.join(__dirname, n)))]);
  const runtimeEnv = Object.keys(process.env).filter(k => /^(?:L5R_|PLAYWRIGHT_|NODE_|TZ$|LANG$)/.test(k))
    .sort().map(k => [k, process.env[k]]);
  const fingerprint = hash(JSON.stringify([hash(fs.readFileSync(path.resolve(sheet))), process.version,
    require('playwright/package.json').version, git(['rev-parse','HEAD']), git(['diff','--binary','HEAD']), ownInputs, runtimeEnv]));
  const cacheDir = path.join(__dirname, 'final', retained ? 'retained-leaves' : 'candidate-leaves');
  let leafIndex = 0, reused = 0, executed = 0;
  function launch(command, args, options) {
    const ordinal = String(++leafIndex).padStart(3, '0');
    const invocation = {command, args:args.map(a => a === path.resolve(sheet) ? '<sheet-bytes>' : a),
      cwd: options.cwd, timeout:options.timeout, maxBuffer:options.maxBuffer};
    const cacheFile = path.join(cacheDir, ordinal + '.json');
    if (argv.includes('--resume') && fs.existsSync(cacheFile)) {
      let saved;
      try { saved = JSON.parse(fs.readFileSync(cacheFile, 'utf8')); }
      catch (_) { /* An interrupted cache write is a cache miss. */ }
      if (reusableResult(saved, fingerprint, invocation)) {
        const c = lastCount((saved.result.stdout || '') + (saved.result.stderr || ''));
        reused++;
        console.error('FLAT REUSE ' + ordinal + ' verified output for ' + c.total + ' checks');
        return saved.result;
      }
    }
    executed++;
    const result = spawnSync(command, ['--require', path.join(__dirname,'navigation-budget.cjs'), ...args], options);
    const saved = {fingerprint, invocation, checkedUtc:new Date().toISOString(),
      result:{status:result.status, signal:result.signal, stdout:result.stdout || '', stderr:result.stderr || '',
        ...(result.error ? {error:String(result.error)} : {})}};
    fs.mkdirSync(cacheDir, {recursive:true});
    const data = JSON.stringify(saved, null, 2) + '\n';
    fs.writeFileSync(path.join(cacheDir, ordinal + '-attempt-' + Date.now() + '.json'), data);
    fs.writeFileSync(cacheFile, data);
    return result;
  }
  const result = runSuite({entry, sheet, expected, listOnly, launch, progress(event) {
    const relative = path.relative(path.resolve(__dirname, '../..'), event.file);
    if (event.event === 'start') console.error('FLAT START ' + event.index + ' ' + relative);
    else console.error('FLAT END ' + event.index + ' ' + (event.pass ? 'PASS ' : 'FAIL ') +
      event.passed + '/' + event.total + ' ' + event.elapsedMs + 'ms' + (event.error ? ' ' + event.error : ''));
  }});
  if (listOnly) {
    console.log(JSON.stringify({mode: 'invocation-list-only', expected, wrapperCount: result.wrappers.length,
      maxWrapperDepth: Math.max(...result.wrappers.map(item => item.depth)),
      wrapperErrors: result.wrapperErrors, leaves: result.leaves}, null, 2));
    return result.wrapperErrors.length ? 1 : 0;
  }
  process.stdout.write(result.output);
  console.log('FLAT_SUITE_RESULT=' + JSON.stringify({expected, ...result.count, leafTotal: result.leafTotal,
    wrapperCount: result.wrappers.length, leafCount: result.leaves.length,
    leafFailures: result.leafFailures, reused, executed, fingerprint, navigationTimeoutMs:60000, pass: result.pass}));
  return result.pass ? 0 : 1;
}

module.exports = {createRunner, lastCount, runSuite, reusableResult, main};
if (require.main === module) process.exitCode = main(process.argv.slice(2));
