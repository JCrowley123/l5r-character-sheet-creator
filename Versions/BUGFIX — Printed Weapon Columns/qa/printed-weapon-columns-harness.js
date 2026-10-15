/* BUGFIX — Printed Weapon Columns: real-browser acceptance.
 * Oracles: the values the harness entered, the browser's own geometry under print media, and the text xpdf's pdftotext
 * extracts from a PDF Chromium printed (xpdf drops clipped glyphs). Widths: 560 px uses the sheet's phone rules
 * (<= 600 px), which the iPhone's print applies (its layout is wider, about 720 px, so 560 is the stricter case); 703 and
 * 725 px are A4 and US Letter at the sheet's 12 mm margins; 1047 px is A4 landscape. Combat is a Play tab: the table is reached in Play mode, where the carousel gives it its scroller.
 * node printed-weapon-columns-harness.js <sheet.html>   (pdftotext: L5R_PDFTOTEXT, else Git for Windows' copy)
 */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const {pathToFileURL} = require('url');
const {execFileSync} = require('child_process');
const {chromium} = require('playwright');
const PDFTOTEXT = process.env.L5R_PDFTOTEXT || 'C:/Program Files/Git/mingw64/bin/pdftotext.exe';
const NAME = 'Katana of the Unbroken Line, heirloom blade of the Kakita dueling house';
const WIDTHS = [560, 703, 725, 1047];
const SHORT = ['wp-skill', 'wp-roll', 'wp-dmg', 'wp-size'];
const IDS = ['PWC-SWITCH', 'PWC-SETUP', 'PWC-NO-SCROLLER', 'PWC-TABLE-WITHIN-PAGE', 'PWC-NAME-WHOLE-WORDS', 'PWC-NOTES-WHOLE-WORDS',
  'PWC-SHORT-VALUES-FIT', 'PWC-SHORT-COLUMNS-TIGHT', 'PWC-WEAPON-NOTES-TAKE-THE-REST', 'PWC-IDEMPOTENT', 'PWC-SCREEN-UNCHANGED',
  'PWC-AFTERPRINT-RESTORES', 'PWC-RESTORE-CLEANS-COPIES', 'PWC-PDF-TEXT-WHOLE', 'PWC-PDF-LEAVES-SCREEN-AS-WAS', 'PWC-DATA-UNCHANGED',
  'PWC-NO-PAGE-ERRORS'];
const results = [];
function check(id, actual, expected = true) {
  if (results.some(r => r.id === id)) throw Error('Duplicate check ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + JSON.stringify(actual).slice(0, 700) +
    ' expected=' + JSON.stringify(expected).slice(0, 300)));
}
const byWidth = f => Object.fromEntries(WIDTHS.map(w => [w, f]));

// What paper shows of the Weapons table at the current width.
const measure = page => page.evaluate(SHORT => {
  const table = document.getElementById('weaponsTable'), W = document.documentElement.clientWidth;
  const rows = [...document.querySelectorAll('#weaponsBody tr')];
  const shown = e => getComputedStyle(e).display !== 'none';
  // The element paper shows for a field: the field itself, or the print copy placed right after it.
  const display = field => shown(field) ? field : [field.nextElementSibling].find(n => n && shown(n) && !n.matches('input,select,button'));
  const textOf = e => e ? (e.tagName === 'INPUT' ? e.value : e.textContent) : null;
  const lines = e => { if (!e || e.tagName === 'INPUT') return 1; const r = document.createRange(); r.selectNodeContents(e);
    return new Set([...r.getClientRects()].map(x => Math.round(x.top))).size; };
  // Words split by a line break; a break after a hyphen is a word boundary.
  const broken = e => {
    if (!e || e.tagName === 'INPUT' || !e.firstChild) return e && e.tagName === 'INPUT' ? 'single-line field' : 'missing';
    const t = e.firstChild, out = [], re = /[^\s-]+-?/g; let m;
    while ((m = re.exec(t.data))) { const r = document.createRange(); r.setStart(t, m.index); r.setEnd(t, m.index + m[0].length);
      if (new Set([...r.getClientRects()].map(x => Math.round(x.top))).size > 1) out.push(m[0]); }
    return out;
  };
  // Wrapping may break between words only (a hyphen counts as a break); a single-line field cannot wrap at all.
  const wraps = e => !e ? 'missing' : e.tagName === 'INPUT' ? 'single-line field' :
    getComputedStyle(e).overflowWrap + ' ' + getComputedStyle(e).wordBreak;
  const fits = e => { const b = e.getBoundingClientRect();
    return e.scrollWidth <= e.clientWidth + 1 && e.scrollHeight <= e.clientHeight + 1 && b.left >= -1 && b.right <= W + 1; };
  // Text width as drawn: a field's value through its own font, other text through its layout (case and spacing applied).
  const ctx = document.createElement('canvas').getContext('2d');
  const textWidth = e => { if (e.tagName === 'INPUT') { ctx.font = getComputedStyle(e).font; return ctx.measureText(e.value).width; }
    const r = document.createRange(); r.selectNodeContents(e); return r.getBoundingClientRect().width; };
  // Any box around the table that scrolls or clips sideways, whether or not it overflows at this width.
  const scrollers = [];
  for (let e = table.parentElement; e && e !== document.documentElement; e = e.parentElement) {
    const ox = getComputedStyle(e).overflowX;
    if (ox !== 'visible') scrollers.push((e.className || e.tagName) + ' ' + ox + ' ' + e.scrollWidth + '/' + e.clientWidth);
  }
  const tb = table.getBoundingClientRect();
  const cols = [...table.querySelectorAll('thead th')].map(th => th.getBoundingClientRect().width);
  const long = rows[0];
  const nameEl = display(long.querySelector('.wp-name')), notesEl = display(long.querySelector('.wp-notes'));
  return {
    wrapped: table.parentElement.classList.contains('car-hscroll'),
    scrollers,
    within: tb.left >= -1 && tb.right <= W + 1,
    name: {text: textOf(nameEl), broken: broken(nameEl), wraps: wraps(nameEl), fits: !!nameEl && fits(nameEl)},
    notes: {text: textOf(notesEl), broken: broken(notesEl), wraps: wraps(notesEl), fits: !!notesEl && fits(notesEl)},
    // Each value whole, on one line, clear of its neighbours' write-in lines; a blank keeps a line to write on.
    shorts: rows.map(tr => SHORT.map((c, i) => { const field = tr.querySelector('.' + c), e = display(field);
      const prev = i ? display(tr.querySelector('.' + SHORT[i - 1])) : tr.querySelector('.wp-name-row');
      const next = i === 3 ? display(tr.querySelector('.wp-notes')) : null, b = e && e.getBoundingClientRect();
      return {text: textOf(e), value: field.value, fits: !!e && fits(e), oneLine: lines(e) <= 1,
        apart: !!e && !!prev && b.left - prev.getBoundingClientRect().right >= 4 && (!next || next.getBoundingClientRect().left - b.right >= 4),
        blank: field.value !== '' || (!!e && b.width >= 20)}; })),
    // A short column may be no wider than its widest text (header or value) plus the cell's and the copy's padding.
    tight: [1, 2, 3, 4].map(i => { const th = table.querySelectorAll('thead th')[i];
      const widest = Math.max(textWidth(th), ...rows.map(tr => { const e = display(tr.children[i].querySelector('.' + SHORT[i - 1]));
        return e ? textWidth(e) : 0; }));
      return cols[i] <= widest + 8 + 4 + 2 ? 'tight' : 'column ' + Math.round(cols[i]) + ' for text ' + Math.round(widest); })
      .concat(cols[6] <= 1 ? 'tight' : 'empty column ' + Math.round(cols[6])),
    // The table fills its box, and Weapon and Notes hold everything the other columns leave.
    rest: Math.abs(tb.width - table.parentElement.clientWidth) <= 1 &&
      cols[0] + cols[5] >= tb.width - cols.reduce((a, c, i) => a + (i === 0 || i === 5 ? 0 : c), 0) - 1 || cols.map(Math.round),
  };
}, SHORT);

// Screen geometry of the table's laid-out boxes, relative to the table (the page around it may move).
const screenShape = page => page.evaluate(() => {
  const table = document.getElementById('weaponsTable'), t = table.getBoundingClientRect();
  return [Math.round(t.width), Math.round(t.height), ...[...table.querySelectorAll('th, td, input, select, button')]
    .map(e => e.getBoundingClientRect()).filter(r => r.width || r.height)
    .map(r => [r.left - t.left, r.top - t.top, r.width, r.height].map(Math.round).join(','))].join(';');
});
const settle = page => page.evaluate(() => Promise.race([window.__L5R_CAROUSEL__.whenSettled(), new Promise(r => setTimeout(r, 3000))]));

async function main() {
  const browser = await chromium.launch();
  const errors = [];
  const pdf = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'l5r-pwc-')), 'sheet.pdf');
  try {
    const page = await browser.newPage({viewport:{width:390, height:844}});
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href, {waitUntil:'domcontentloaded', timeout:90000});
    await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready &&
      window.__L5R_CAROUSEL__ && window.__L5R_CAROUSEL__.isReady(), null, {timeout:90000});
    await page.evaluate(() => window.__L5R_TEST__.CL11.close && window.__L5R_TEST__.CL11.close());
    check('PWC-SWITCH', await page.evaluate(() => window.__L5R_TEST__.PRINTED_WEAPON_COLUMNS_ENABLED === true &&
      !!window.__L5R_TEST__.PRINTWEAPONCOLS && window.__L5R_TEST__.PRINTWEAPONCOLS.enabled()));
    // The owner's steps (W1): add a Katana from the list, then rename it. Printed alone first, as on the owner's sheet.
    await page.evaluate(NAME => {
      const T = window.__L5R_TEST__;
      const tr = T.makeWeaponRow({name:'Katana', key:'Katana'});
      document.getElementById('weaponsBody').appendChild(tr);
      const name = tr.querySelector('.wp-name'); name.value = NAME; name.dispatchEvent(new Event('change'));
      // Open on screen, so Export to PDF's print-time opening of collapsed sections changes nothing here.
      document.getElementById('weaponsDetails').open = true;
      T.MODES12.set('play');
    }, NAME);
    await page.waitForTimeout(250);
    await page.evaluate(() => window.__L5R_CAROUSEL__.goToTab('Combat'));
    await settle(page);
    const reached = await page.evaluate(() => window.__L5R_CAROUSEL__.getActiveTab().label);
    const onPaper = async () => {
      const out = {};
      await page.emulateMedia({media:'print'});
      for (const w of WIDTHS) { await page.setViewportSize({width:w, height:1000}); await page.waitForTimeout(150); out[w] = await measure(page); }
      await page.emulateMedia({media:'screen'});
      return out;
    };
    await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
    const one = await onPaper();
    await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
    // A library Tetsubo (a two-word Skill) and a blank custom row; with two weapons or more each row also shows its Hand.
    const added = await page.evaluate(() => {
      const T = window.__L5R_TEST__, body = document.getElementById('weaponsBody');
      body.appendChild(T.makeWeaponRow({name:'Tetsubo', key:'Tetsubo'}));
      body.appendChild(T.makeWeaponRow({name:'Practice blade', key:''}));
      const rows = [...body.querySelectorAll('tr')];
      window.__pwcData = JSON.stringify(T.collectData());
      window.__pwcStorage = JSON.stringify(Object.entries(localStorage).sort());
      window.__pwcValues = JSON.stringify(rows.map(tr => [...tr.querySelectorAll('input')].map(i => i.value)));
      return [rows.length,
        rows.map(tr => [tr.querySelector('.wp-skill').value, tr.querySelector('.wp-size').value]),
        document.getElementById('weaponsTable').parentElement.classList.contains('car-hscroll')];
    });
    check('PWC-SETUP', [reached, ...added], ['Combat', 3, [['Kenjutsu', 'Medium'], ['Heavy Weapons', 'Large'], ['', '']], true]);

    // Screen: the same geometry before printing, while the print copies exist, and after printing.
    const before = {}, during = {}, after = {};
    for (const w of [390, 1280]) { await page.setViewportSize({width:w, height:900}); await page.waitForTimeout(400); before[w] = await screenShape(page); }
    await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
    for (const w of [390, 1280]) { await page.setViewportSize({width:w, height:900}); await page.waitForTimeout(400); during[w] = await screenShape(page); }
    await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
    for (const w of [390, 1280]) { await page.setViewportSize({width:w, height:900}); await page.waitForTimeout(400); after[w] = await screenShape(page); }
    check('PWC-SCREEN-UNCHANGED', [390, 1280].map(w => [before[w] === during[w], before[w] === after[w], before[w].length > 200]),
      [[true, true, true], [true, true, true]]);

    // Paper.
    await page.evaluate(() => { window.dispatchEvent(new Event('beforeprint')); window.dispatchEvent(new Event('beforeprint')); });
    check('PWC-IDEMPOTENT', await page.evaluate(() => document.querySelectorAll('#weaponsBody .pwc-print-text').length ===
      4 * document.querySelectorAll('#weaponsBody tr').length));
    const three = await onPaper();
    const per = f => ({'one weapon': Object.fromEntries(WIDTHS.map(w => [w, f(one[w])])),
      'three weapons': Object.fromEntries(WIDTHS.map(w => [w, f(three[w])]))});
    const both = v => ({'one weapon': byWidth(v), 'three weapons': byWidth(v)});
    check('PWC-NO-SCROLLER', per(x => [x.wrapped, x.scrollers]), both([true, []]));
    check('PWC-TABLE-WITHIN-PAGE', per(x => x.within), both(true));
    check('PWC-NAME-WHOLE-WORDS', per(x => x.name), both({text:NAME, broken:[], wraps:'break-word normal', fits:true}));
    const note = one[WIDTHS[0]].notes.text;
    check('PWC-NOTES-WHOLE-WORDS', [note && note.length > 40, per(x => x.notes)], [true, both({text:note, broken:[], wraps:'break-word normal', fits:true})]);
    check('PWC-SHORT-VALUES-FIT', [per(x => x.shorts.length),
      per(x => x.shorts.map(r => r.map(s => [s.text === s.value, s.fits, s.oneLine, s.apart, s.blank])))],
      [{'one weapon': byWidth(1), 'three weapons': byWidth(3)}, per(x => x.shorts.map(r => r.map(() => [true, true, true, true, true])))]);
    check('PWC-SHORT-COLUMNS-TIGHT', per(x => x.tight), both(['tight', 'tight', 'tight', 'tight', 'tight']));
    check('PWC-WEAPON-NOTES-TAKE-THE-REST', per(x => x.rest), both(true));
    await page.emulateMedia({media:'screen'});
    check('PWC-AFTERPRINT-RESTORES', await page.evaluate(() => {
      window.dispatchEvent(new Event('afterprint'));
      const rows = [...document.querySelectorAll('#weaponsBody tr')];
      return [document.querySelectorAll('.pwc-print-text, .pwc-text-source').length,
        JSON.stringify(rows.map(tr => [...tr.querySelectorAll('input')].map(i => i.value))) === window.__pwcValues];
    }), [0, true]);
    // The carousel re-copies an edge page with cloneNode(true); a copy made while printing must not keep print copies.
    check('PWC-RESTORE-CLEANS-COPIES', await page.evaluate(() => {
      window.dispatchEvent(new Event('beforeprint'));
      const copy = document.body.appendChild(document.getElementById('weaponsTable').cloneNode(true));
      copy.removeAttribute('id');
      const copied = copy.querySelectorAll('.pwc-print-text, .pwc-text-source').length;
      window.dispatchEvent(new Event('afterprint'));
      const left = document.querySelectorAll('.pwc-print-text, .pwc-text-source').length;
      copy.remove();
      return [copied > 0, left];
    }), [true, 0]);
    // A printed PDF (A4): Chromium fires beforeprint and afterprint around it. page.pdf() uses the emulated media, so clear it.
    await page.setViewportSize({width:1280, height:900});
    await page.emulateMedia({media:null});
    await page.pdf({path:pdf, format:'A4'});
    const text = execFileSync(PDFTOTEXT, ['-raw', '-enc', 'UTF-8', pdf, '-']).toString('utf8').replace(/\s+/g, ' ');
    check('PWC-PDF-TEXT-WHOLE', ['Kenjutsu', 'Medium', 'Heavy Weapons', 'Large', NAME].map(s => text.includes(s)), [true, true, true, true, true]);
    check('PWC-PDF-LEAVES-SCREEN-AS-WAS', await page.evaluate(() => document.querySelectorAll('.pwc-print-text, .pwc-text-source').length), 0);
    check('PWC-DATA-UNCHANGED', await page.evaluate(() => [JSON.stringify(window.__L5R_TEST__.collectData()) === window.__pwcData,
      JSON.stringify(Object.entries(localStorage).sort()) === window.__pwcStorage]), [true, true]);
    check('PWC-NO-PAGE-ERRORS', errors, []);
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
