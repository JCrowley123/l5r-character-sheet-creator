'use strict';
// The automatic-entries group's light checks (G4's runner, reading G4's frozen candidate list): run the suite's own harnesses whose path matches a pattern, one at a time, against one build.
//   node light-run.cjs <sheet.html> <regex> [log folder]
// The leaves (file, arguments, working folder) come from G4's frozen candidate list; paths under that list's Versions
// folder are moved to this checkout's Versions folder, and the sheet argument is replaced by the build given here.
// Every leaf gets the suite's two preloads (navigation budget, splash test switch), as the full runner gives them.
// Light checks only: not a qualification run, and nothing here changes a pinned count.
const fs = require('fs'), path = require('path'), {spawnSync} = require('child_process');
const [sheetArg, pattern, logArg] = process.argv.slice(2);
if (!sheetArg || !pattern) throw new Error('usage: node light-run.cjs <sheet.html> <regex> [log folder]');
const sheet = path.resolve(sheetArg), re = new RegExp(pattern);
let VERSIONS = __dirname;
while (!(fs.existsSync(path.join(VERSIONS, 'BUILD-LEDGER.md')) && fs.existsSync(path.join(VERSIONS, 'CLAUDE.md')))) VERSIONS = path.dirname(VERSIONS);
const LIST = path.join(VERSIONS, 'Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/G4 — Touch, Focus and Startup/qa/candidate-list.json');
const PRELOADS = [path.join(VERSIONS, 'PART K — Phase 14.2 Kata and Kiho References/qa/navigation-budget.cjs'),
  path.join(VERSIONS, 'Part F — Cross-Platform Delivery/PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs')];
const OLD_SHEET = /Part F — Cross-Platform Delivery[\\/]PART F — Phase 0 Source Reorganization for Maintainability[\\/]l5r-character-sheet\.html$/;
const move = p => { const i = p.replace(/\\/g, '/').indexOf('/Versions/'); return i < 0 ? p : path.join(VERSIONS, p.replace(/\\/g, '/').slice(i + '/Versions/'.length)); };
const leaves = JSON.parse(fs.readFileSync(LIST, 'utf8')).leaves.filter(l => re.test(l.file.replace(/\\/g, '/')));
const logs = logArg ? path.resolve(logArg) : null;
if (logs) fs.mkdirSync(logs, {recursive: true});
const env = Object.assign({}, process.env);
delete env.NODE_OPTIONS;
const rows = [];
for (const leaf of leaves) {
  const file = move(leaf.file), args = leaf.args.map(a => OLD_SHEET.test(a.replace(/\\/g, '/')) ? sheet : move(a));
  const t0 = Date.now();
  const run = spawnSync(process.execPath, [...PRELOADS.flatMap(p => ['--require', p]), file, ...args], {cwd: move(leaf.cwd), env, encoding: 'utf8', timeout: leaf.timeout || 3600000, maxBuffer: 64 * 1024 * 1024});
  const out = (run.stdout || '') + (run.stderr || '');
  const count = [...out.matchAll(/(\d+)\/(\d+) checks passed/g)].at(-1);
  const rel = path.relative(VERSIONS, file).replace(/\\/g, '/');
  const row = {harness: rel, passed: count ? Number(count[1]) : 0, total: count ? Number(count[2]) : 0, status: run.status, seconds: Math.round((Date.now() - t0) / 1000)};
  row.ok = !!count && row.passed === row.total && run.status === 0;
  rows.push(row);
  if (logs) fs.writeFileSync(path.join(logs, rel.replace(/[\\/:]/g, '_') + '.log'), out);
  console.log((row.ok ? 'OK   ' : 'FAIL ') + row.passed + '/' + row.total + '  ' + rel + '  (' + row.seconds + ' s)');
  if (!row.ok) console.log(out.split('\n').filter(l => /FAIL|detail|Error/.test(l)).slice(0, 12).join('\n'));
}
const p = rows.reduce((n, r) => n + r.passed, 0), t = rows.reduce((n, r) => n + r.total, 0);
console.log('LIGHT ' + rows.filter(r => r.ok).length + '/' + rows.length + ' harnesses, ' + p + '/' + t + ' checks');
if (logs) fs.writeFileSync(path.join(logs, 'summary.json'), JSON.stringify({sheet, pattern, rows}, null, 1) + '\n');
process.exitCode = rows.length && rows.every(r => r.ok) ? 0 : 1;
