'use strict';
// BUGFIX — Printed Emphases Without the Web Fonts: the printed Skills and Equipment tables harness, unchanged, on a
// page that never gets its web fonts (the fallback font is wider). Its 18 checks are this fix's checks.
//   node qa/fonts-harness.js <sheet.html>
const path = require('path'), {spawnSync} = require('child_process');
const sheet = path.resolve(process.argv[2] || '');
const pse = path.resolve(__dirname, '../../BUGFIX — Printed Skills and Equipment Tables');
const preload = '--require "' + path.join(__dirname, 'no-web-fonts.cjs').replace(/\\/g, '/') + '"';
const env = Object.assign({}, process.env, {FONTS: process.env.FONTS || 'block',
  NODE_OPTIONS: ((process.env.NODE_OPTIONS || '') + ' ' + preload).trim()});
const r = spawnSync(process.execPath, [path.join(pse, 'qa/printed-skills-equipment-harness.js'), sheet],
  {cwd: pse, env, encoding: 'utf8', timeout: 600000, maxBuffer: 64 * 1024 * 1024});
const out = (r.stdout || '') + (r.stderr || '');
const m = [...out.matchAll(/(\d+)\/(\d+) checks passed/g)].at(-1);
process.stdout.write(out.replace(/(\d+)\/(\d+) checks passed/g, '$1 of $2 passed') + '\n');
const passed = m ? Number(m[1]) : 0, total = m ? Number(m[2]) : 18;
console.log('Web fonts ' + env.FONTS + 'ed: ' + passed + '/' + total + ' checks passed');
process.exit(r.status === 0 && m && passed === total && total === 18 ? 0 : 1);
