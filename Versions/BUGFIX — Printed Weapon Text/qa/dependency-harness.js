'use strict';
// BUGFIX — Printed Weapon Text: switch, absence and dependency variants of one sheet, served in memory.
const fs = require('fs'), {chromium} = require('playwright');
const input = fs.readFileSync(process.argv[2], 'utf8'), results = [];
function check(id, actual, want) {
  const pass = JSON.stringify(actual) === JSON.stringify(want); results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + JSON.stringify(actual).slice(0, 300)));
}
async function main() {
  const browser = await chromium.launch();
  try {
    for (const v of [
      {id:'CONTROL', api:true, mirrors:true},
      {id:'OFF', off:'PRINTED_WEAPON_TEXT_ENABLED', api:false, mirrors:false},
      {id:'FRAGMENT-ABSENT', absent:true, api:null, mirrors:false},
      {id:'EXPORT-PDF-OFF', off:'EXPORT_PDF_ENABLED', api:true, mirrors:true}]) {
      let html = input;
      if (v.off) { const term = 'const ' + v.off + ' = true;';
        if (html.split(term).length !== 2) throw Error('Non-unique switch ' + v.off); html = html.replace(term, 'const ' + v.off + ' = false;'); }
      if (v.absent) { const start = '  // ============ BUGFIX PRINTWEAPONS — PRINTED WEAPON TEXT ============',
        end = '  // ============ END BUGFIX PRINTWEAPONS ============';
        const a = html.indexOf(start), b = html.indexOf(end); if (a < 0 || b < a) throw Error('Missing own fragment');
        html = html.slice(0, a) + html.slice(b + end.length); }
      const page = await browser.newPage(), errors = [];
      page.on('pageerror', e => errors.push(String(e)));
      await page.route('**/*', r => r.request().url().startsWith('http://weapons.test/') ? r.fulfill({contentType:'text/html', body:html}) : r.abort());
      await page.goto('http://weapons.test/');
      await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11.ready, null, {timeout:60000});
      check('PW-DEP-' + v.id + '-API', await page.evaluate(() => window.__L5R_TEST__.PRINTWEAPONS ? window.__L5R_TEST__.PRINTWEAPONS.enabled() : null), v.api);
      check('PW-DEP-' + v.id + '-MIRRORS', await page.evaluate(() => {
        document.getElementById('weaponsBody').appendChild(window.__L5R_TEST__.makeWeaponRow({name:'Katana', key:'Katana'}));
        window.dispatchEvent(new Event('beforeprint'));
        const made = document.querySelectorAll('#weaponsBody .pw-print-text').length > 0;
        window.dispatchEvent(new Event('afterprint'));
        return made && !document.querySelector('.pw-print-text, .pw-text-source');
      }), v.mirrors);
      check('PW-DEP-' + v.id + '-ERRORS', errors, []);
      await page.close();
    }
  } finally { await browser.close(); }
  const pass = results.filter(r => r.pass).length;
  console.log(pass + '/' + results.length + ' checks passed');
  process.exitCode = pass === results.length && results.length === 12 ? 0 : 1;
}
main().catch(e => { console.error(e); process.exitCode = 1; });
