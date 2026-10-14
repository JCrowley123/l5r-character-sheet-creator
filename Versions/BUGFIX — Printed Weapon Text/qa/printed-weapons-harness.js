/* BUGFIX — Printed Weapon Text (FT-30, clipping only): real-browser acceptance.
 * Oracles: the strings the harness typed, the browser's own overflow geometry under print media, and the
 * text xpdf's pdftotext extracts from a PDF Chromium printed. xpdf drops clipped text by default, so a name
 * cut off by its box is missing from the extract (checked on main: "Katana of the Unbroken").
 * node printed-weapons-harness.js <sheet.html>   (pdftotext: L5R_PDFTOTEXT, else Git for Windows' copy)
 */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const {pathToFileURL} = require('url');
const {execFileSync} = require('child_process');
const {chromium} = require('playwright');
const PDFTOTEXT = process.env.L5R_PDFTOTEXT || 'C:/Program Files/Git/mingw64/bin/pdftotext.exe';
const NAME = 'Katana of the Unbroken Line, heirloom blade of the Kakita dueling house';
const NOTES = 'Rerolls one damage die per round while wielded by a samurai of the Crane; the blade sings when drawn in anger and must be cleaned with rice paper.';
const IDS = ['PW-SWITCH', 'PW-NAME-FITS', 'PW-NOTES-FITS', 'PW-LIBRARY-NOTE-FITS', 'PW-INPUTS-HIDDEN-ON-PAPER', 'PW-SHORT-VALUES', 'PW-IDEMPOTENT',
  'PW-WITH-EXPORT-PDF', 'PW-AFTERPRINT-RESTORES', 'PW-RESTORE-CLEANS-COPIES', 'PW-SCREEN-UNCHANGED', 'PW-PDF-TEXT-FULL', 'PW-PDF-LEAVES-SCREEN-AS-WAS',
  'PW-DATA-UNCHANGED', 'PW-NO-PAGE-ERRORS'];
const results = [];
function check(id, actual, expected = true) {
  if (results.some(r => r.id === id)) throw Error('Duplicate check ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + JSON.stringify(actual).slice(0, 500) +
    ' expected=' + JSON.stringify(expected).slice(0, 300)));
}
// What paper shows in one weapon cell: every displayed element carrying the name or notes, its text, and whether it overflows.
const cell = (page, row, cls) => page.evaluate(([row, cls]) => {
  const tr = document.querySelectorAll('#weaponsBody tr')[row];
  const td = tr.querySelector('.' + cls).closest('td');
  return [...td.querySelectorAll('.' + cls + ', .pw-print-text')].filter(e => e.closest('td') === td && getComputedStyle(e).display !== 'none' &&
    (e.classList.contains(cls) || e.previousElementSibling && e.previousElementSibling.classList.contains(cls)))
    // Fits: nothing overflows the box, and the box itself lies within the paper's width (a table can grow past it).
    .map(e => { const r = e.getBoundingClientRect();
      return {text: e.tagName === 'INPUT' ? e.value : e.textContent, fits: e.scrollWidth <= e.clientWidth + 1 && e.scrollHeight <= e.clientHeight + 1 &&
        r.left >= -1 && r.right <= document.documentElement.clientWidth + 1}; });
}, [row, cls]);

async function main() {
  const browser = await chromium.launch();
  const errors = [];
  const pdf = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'l5r-pw-')), 'sheet.pdf');
  try {
    const page = await browser.newPage({viewport:{width:390, height:844}});
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);
    await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready, null, {timeout:60000});
    await page.evaluate(() => window.__L5R_TEST__.CL11.close && window.__L5R_TEST__.CL11.close());
    check('PW-SWITCH', await page.evaluate(() => window.__L5R_TEST__.PRINTED_WEAPON_TEXT_ENABLED === true && !!window.__L5R_TEST__.PRINTWEAPONS &&
      window.__L5R_TEST__.PRINTWEAPONS.enabled()));
    await page.evaluate(([NAME, NOTES]) => {
      const T = window.__L5R_TEST__, body = document.getElementById('weaponsBody');
      body.appendChild(T.makeWeaponRow({name:NAME, notes:NOTES, key:'Katana'}));
      // The library's own Katana row: its note is pre-filled from the catalogue.
      body.appendChild(T.makeWeaponRow({name:'Katana', notes:'', key:'Katana'}));
      // A short saved row with no notes.
      body.appendChild(T.makeWeaponRow({name:'Bo', notes:''}));
      window.__L5R_CAROUSEL__.goToTab('Combat');
      window.__pwData = JSON.stringify(T.collectData());
      window.__pwStorage = JSON.stringify(Object.entries(localStorage).sort());
    }, [NAME, NOTES]);
    const rows = await page.evaluate(() => document.querySelectorAll('#weaponsBody tr').length);
    const long = rows - 3, library = rows - 2, short = rows - 1;
    const libraryNote = await page.evaluate(i => document.querySelectorAll('#weaponsBody tr')[i].querySelector('.wp-notes').value, library);
    // A4 at the sheet's 12 mm margins is about 703 CSS pixels wide.
    await page.setViewportSize({width:703, height:1000});
    await page.evaluate(() => { window.dispatchEvent(new Event('beforeprint')); window.dispatchEvent(new Event('beforeprint')); });
    await page.emulateMedia({media:'print'});
    check('PW-NAME-FITS', await cell(page, long, 'wp-name'), [{text:NAME, fits:true}]);
    check('PW-NOTES-FITS', await cell(page, long, 'wp-notes'), [{text:NOTES, fits:true}]);
    check('PW-INPUTS-HIDDEN-ON-PAPER', await page.evaluate(() => [...document.querySelectorAll('#weaponsBody .wp-name, #weaponsBody .wp-notes')]
      .every(e => getComputedStyle(e).display === 'none')));
    check('PW-LIBRARY-NOTE-FITS', [libraryNote.length > 40, await cell(page, library, 'wp-notes')], [true, [{text:libraryNote, fits:true}]]);
    check('PW-SHORT-VALUES', [await cell(page, short, 'wp-name'), (await cell(page, short, 'wp-notes')).map(x => [x.text.trim(), x.fits])],
      [[{text:'Bo', fits:true}], [['', true]]]);
    check('PW-IDEMPOTENT', await page.evaluate(n => document.querySelectorAll('#weaponsBody .pw-print-text').length === 2 * n, rows));
    check('PW-WITH-EXPORT-PDF', await page.evaluate(() => {
      const pdf = window.__L5R_TEST__.PDF111, textareas = document.querySelectorAll('.car-page textarea').length;
      return [!!pdf && pdf.enabled() ? document.querySelectorAll('.pdf111-print-text').length === textareas : 'no export',
        document.querySelectorAll('#weaponsBody .pw-print-text').length > 0];
    }), [true, true]);
    await page.emulateMedia({media:'screen'});
    check('PW-AFTERPRINT-RESTORES', await page.evaluate(([NAME, NOTES, long]) => {
      window.dispatchEvent(new Event('afterprint'));
      const tr = document.querySelectorAll('#weaponsBody tr')[long];
      return [document.querySelectorAll('.pw-print-text, .pw-text-source').length, tr.querySelector('.wp-name').value === NAME,
        tr.querySelector('.wp-notes').value === NOTES];
    }, [NAME, NOTES, long]), [0, true, true]);
    // The carousel re-copies an edge page with cloneNode(true); a copy made while printing must not keep print copies.
    check('PW-RESTORE-CLEANS-COPIES', await page.evaluate(() => {
      window.dispatchEvent(new Event('beforeprint'));
      const copy = document.body.appendChild(document.getElementById('weaponsTable').cloneNode(true));
      copy.removeAttribute('id');
      const copied = copy.querySelectorAll('.pw-print-text, .pw-text-source').length;
      window.dispatchEvent(new Event('afterprint'));
      const left = document.querySelectorAll('.pw-print-text, .pw-text-source').length;
      copy.remove();
      return [copied > 0, left];
    }), [true, 0]);
    check('PW-SCREEN-UNCHANGED', await page.evaluate(() => [...document.querySelectorAll('#weaponsBody .wp-name, #weaponsBody .wp-notes')]
      .every(e => getComputedStyle(e).display !== 'none')));
    // A printed PDF: Chromium fires beforeprint and afterprint around it. page.pdf() uses the emulated media, so clear it.
    await page.emulateMedia({media:null});
    await page.pdf({path:pdf, format:'A4'});
    const text = execFileSync(PDFTOTEXT, ['-raw', '-enc', 'UTF-8', pdf, '-']).toString('utf8').replace(/\s+/g, ' ');
    check('PW-PDF-TEXT-FULL', [text.includes(NAME), text.includes(NOTES)], [true, true]);
    check('PW-PDF-LEAVES-SCREEN-AS-WAS', await page.evaluate(() => document.querySelectorAll('.pw-print-text, .pw-text-source').length), 0);
    check('PW-DATA-UNCHANGED', await page.evaluate(() => [JSON.stringify(window.__L5R_TEST__.collectData()) === window.__pwData,
      JSON.stringify(Object.entries(localStorage).sort()) === window.__pwStorage]), [true, true]);
    check('PW-NO-PAGE-ERRORS', errors, []);
  } catch (e) {
    for (const id of IDS) if (!results.some(r => r.id === id)) check(id, 'not reached: ' + String(e.message || e).split('\n')[0], 'completed');
  } finally {
    await browser.close();
    fs.rmSync(path.dirname(pdf), {recursive:true, force:true});
  }
  const pass = results.filter(r => r.pass).length;
  console.log(pass + '/' + IDS.length + ' checks passed');
  process.exitCode = pass === IDS.length && results.length === IDS.length ? 0 : 1;
}
main().catch(e => { console.error(e); process.exitCode = 1; });
