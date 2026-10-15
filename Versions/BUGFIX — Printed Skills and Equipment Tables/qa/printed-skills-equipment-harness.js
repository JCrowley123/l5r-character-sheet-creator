/* BUGFIX — Printed Skills and Equipment Tables: real-browser acceptance.
 * Oracles: the values the harness entered, the browser's own geometry under print media, and the text xpdf's pdftotext
 * extracts from a PDF Chromium printed. Widths: 560 px uses the sheet's phone rules (<= 600 px), which the iPhone's print
 * applies; 703 and 725 px are A4 and US Letter at the sheet's 12 mm margins (the tablet band, 601-820 px); 1047 px is A4
 * landscape. Both pages are reached in Play mode (as the owner's Combat checks are), where the carousel gives each table
 * its scroller; Management mode is measured once more at the end.
 * node printed-skills-equipment-harness.js <sheet.html>   (pdftotext: L5R_PDFTOTEXT, else Git for Windows' copy)
 */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const {pathToFileURL} = require('url');
const {execFileSync} = require('child_process');
const {chromium} = require('playwright');
const PDFTOTEXT = process.env.L5R_PDFTOTEXT || 'C:/Program Files/Git/mingw64/bin/pdftotext.exe';
const WIDTHS = [560, 703, 725, 1047];
// The owner's own entries (Investigation, Sailing, Lore: Heraldry, Iaijutsu; Osamu Matsu's spell scrolls), one long
// custom skill and a blank item row.
const LONG_SKILL = 'Lore: Shadowlands and the Festering Pit of Fu Leng';
const SCROLL = 'Spell Scroll \u2014 Reversal of Fortunes';
const SCROLL_NOTE = 'A scroll with the prayer for Reversal of Fortunes, reciting the prayer allows the reader to cast the spell.';
const SKILLS = [
  {name:'Investigation', trait:'Perception', rank:5, emph:'Interrogation, Notice', freeEmph:'Interrogation', school:true},
  {name:'Sailing', trait:'Agility or Intelligence', rank:3},
  {name:'Lore: Heraldry', trait:'Intelligence', rank:2},
  {name:'Iaijutsu', trait:'Reflexes', rank:6, emph:'Focus, Assessment', freeEmph:'Focus', school:true},
  {name:LONG_SKILL, trait:'Intelligence', rank:1}];
const EQUIP = [{name:'Traveling Pack', qty:1, notes:'Starting outfit'}, {name:SCROLL, qty:1, notes:SCROLL_NOTE}, {name:'', qty:'', notes:''}];
// Per table: wrapping fields, one-line fields (with their neighbours on paper), the columns that shrink, and the wide pair.
const TABLES = {
  skills: {table:'skillsTable', wrap:['sk-name', 'sk-trait'], short:[['sk-rank', 'sk-trait', null]], shrink:[1, 2, 4, 5, 6], wide:[0, 3]},
  equipment: {table:'equipTable', wrap:['eq-name', 'eq-notes'], short:[['eq-qty', 'eq-name', 'eq-notes']], shrink:[1], wide:[0, 2]},
};
const IDS = ['PSE-SWITCH', 'PSE-SETUP', 'PSE-SCREEN-UNCHANGED', 'PSE-IDEMPOTENT', 'PSE-NO-SCROLLER', 'PSE-TABLES-WITHIN-PAGE',
  'PSE-LONG-TEXT-WHOLE-WORDS', 'PSE-SHORT-VALUES-FIT', 'PSE-EMPHASES-WHOLE', 'PSE-SHORT-COLUMNS-TIGHT', 'PSE-WIDE-COLUMNS-TAKE-THE-REST',
  'PSE-MANAGEMENT-MODE', 'PSE-AFTERPRINT-RESTORES', 'PSE-RESTORE-CLEANS-COPIES', 'PSE-PDF-TEXT-WHOLE', 'PSE-PDF-LEAVES-SCREEN-AS-WAS',
  'PSE-DATA-UNCHANGED', 'PSE-NO-PAGE-ERRORS'];
const results = [];
function check(id, actual, expected = true) {
  if (results.some(r => r.id === id)) throw Error('Duplicate check ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + JSON.stringify(actual).slice(0, 900) +
    ' expected=' + JSON.stringify(expected).slice(0, 300)));
}
const byWidth = v => Object.fromEntries(WIDTHS.map(w => [w, v]));
const both = v => ({skills: byWidth(v), equipment: byWidth(v)});

// What paper shows of one table at the current width.
const measure = (page, spec) => page.evaluate(spec => {
  const table = document.getElementById(spec.table), W = document.documentElement.clientWidth;
  const rows = [...table.tBodies[0].rows];
  const shown = e => getComputedStyle(e).display !== 'none' && e.getClientRects().length > 0;
  // The element paper shows for a field: the field itself, or the print copy placed right after it.
  const display = field => !field ? null : shown(field) ? field :
    [field.nextElementSibling].find(n => n && shown(n) && !n.matches('input,select,button')) || null;
  const textOf = e => !e ? null : e.matches('input,select') ? (e.tagName === 'SELECT' ? (e.selectedOptions[0] || {}).text || '' : e.value) : e.textContent;
  const tops = rects => new Set([...rects].map(x => Math.round(x.top))).size;
  const lines = e => { if (!e || e.matches('input,select')) return 1; const r = document.createRange(); r.selectNodeContents(e); return tops(r.getClientRects()); };
  // Words split by a line break; a break after a hyphen is a word boundary.
  const broken = e => {
    if (!e) return 'missing';
    if (e.matches('input,select')) return 'single-line field';
    const t = e.firstChild, out = [], re = /[^\s-]+-?/g; let m;
    while (t && (m = re.exec(t.data))) { const r = document.createRange(); r.setStart(t, m.index); r.setEnd(t, m.index + m[0].length);
      if (tops(r.getClientRects()) > 1) out.push(m[0]); }
    return out;
  };
  const wraps = e => !e ? 'missing' : e.matches('input,select') ? 'single-line field' :
    getComputedStyle(e).overflowWrap + ' ' + getComputedStyle(e).wordBreak;
  // Text width as drawn: a field's value through its own font, other text through its layout.
  const ctx = document.createElement('canvas').getContext('2d');
  const textWidth = (e, s) => { if (e.matches('input,select')) { ctx.font = getComputedStyle(e).font; return ctx.measureText(s === undefined ? textOf(e) : s).width; }
    const r = document.createRange(); r.selectNodeContents(e); return r.getBoundingClientRect().width; };
  const words = e => { if (e.matches('input,select')) return textOf(e).split(/\s+/).filter(Boolean).map(w => textWidth(e, w));
    const t = e.firstChild, out = [], re = /\S+/g; let m;
    while (t && (m = re.exec(t.data))) { const r = document.createRange(); r.setStart(t, m.index); r.setEnd(t, m.index + m[0].length); out.push(r.getBoundingClientRect().width); }
    return out; };
  // Whole text inside its own box and on the page: a field may not clip its value, a copy may not overflow.
  const fits = e => { if (!e) return false; const b = e.getBoundingClientRect(), s = getComputedStyle(e);
    const inner = e.matches('input,select') ? b.width - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight) -
      parseFloat(s.borderLeftWidth) - parseFloat(s.borderRightWidth) : null;
    return (inner === null ? e.scrollWidth <= e.clientWidth + 1 && e.scrollHeight <= e.clientHeight + 1 : textWidth(e) <= inner + 0.5) &&
      b.left >= -1 && b.right <= W + 1; };
  const scrollers = [];
  for (let e = table.parentElement; e && e !== document.documentElement; e = e.parentElement) {
    const ox = getComputedStyle(e).overflowX;
    if (ox !== 'visible') scrollers.push((e.className || e.tagName) + ' ' + ox + ' ' + e.scrollWidth + '/' + e.clientWidth);
  }
  const tb = table.getBoundingClientRect();
  const heads = [...table.tHead.rows[0].cells], cols = heads.map(th => th.getBoundingClientRect().width);
  return {
    wrapped: table.parentElement.classList.contains('car-hscroll'),
    scrollers,
    within: tb.left >= -1 && tb.right <= W + 1,
    long: rows.map(tr => spec.wrap.map(c => { const f = tr.querySelector('.' + c), e = display(f);
      const b = e && e.getBoundingClientRect();
      return {text: textOf(e) === f.value, broken: broken(e), wraps: wraps(e), fits: fits(e),
        blank: f.value !== '' || (!!e && b.width >= 20 && b.height >= parseFloat(getComputedStyle(e).fontSize) - 1)}; })),
    // Each value whole, on one line, clear of its neighbours' write-in lines; a blank keeps a line to write on.
    shorts: rows.map(tr => spec.short.map(([c, before, after]) => { const f = tr.querySelector('.' + c), e = display(f), b = e && e.getBoundingClientRect();
      const prev = display(tr.querySelector('.' + before)), next = after && display(tr.querySelector('.' + after));
      return [textOf(e) === f.value, fits(e), lines(e) <= 1, !!e && !!prev && b.left - prev.getBoundingClientRect().right >= 4 &&
        (!next || next.getBoundingClientRect().left - b.right >= 4), f.value !== '' || (!!e && b.width >= 20)]; })),
    // The XP cost ("16 xp") stays on one line in its shrunk column.
    xp: rows.map(tr => tr.querySelector('.sk-cost')).filter(Boolean).map(lines),
    emphases: [...table.querySelectorAll('.sk-emph-select, .sk-emph-text')].filter(shown).map(e => fits(e)),
    // A shrinking column may be no wider than its widest unbreakable text (header or cell) plus padding.
    tight: spec.shrink.map(i => { const cells = rows.map(tr => tr.cells[i]);
      const parts = cells.map(td => { const e = [...td.querySelectorAll('input:not([type=checkbox]), select, span')].map(display).find(Boolean);
        // A blank copy's content is its write-in line.
        if (e && !e.matches('input,select') && !e.textContent) { const s = getComputedStyle(e);
          return e.getBoundingClientRect().width - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight); }
        if (e) return Math.max(0, ...(spec.wrap.some(c => td.querySelector('.' + c)) ? words(e) : [textWidth(e)]));
        const box = td.querySelector('input[type=checkbox]'); if (box && shown(box)) return box.getBoundingClientRect().width;
        // Plain cell text (XP); a cell whose only content is a hidden control (Roll) holds nothing on paper.
        const r = document.createRange(); r.selectNodeContents(td);
        return [...td.childNodes].some(n => n.nodeType === 3 && n.data.trim()) ? r.getBoundingClientRect().width : 0; });
      const widest = Math.max(textWidth(heads[i]), ...parts);
      return cols[i] <= widest + 8 + 4 + 2 ? 'tight' : heads[i].textContent.trim() + ' ' + Math.round(cols[i]) + ' for ' + Math.round(widest); })
      .concat(cols[cols.length - 1] <= 1 ? 'tight' : 'empty column ' + Math.round(cols[cols.length - 1])),
    // The table fills its box, and the wide pair holds everything the other columns leave.
    rest: Math.abs(tb.width - table.parentElement.clientWidth) <= 1 &&
      spec.wide.reduce((a, i) => a + cols[i], 0) >= tb.width - cols.reduce((a, c, i) => a + (spec.wide.includes(i) ? 0 : c), 0) - 1 || cols.map(Math.round),
  };
}, spec);

// Screen geometry of both tables' laid-out boxes, relative to each table (the page around it may move).
const screenShape = page => page.evaluate(() => ['skillsTable', 'equipTable'].map(id => {
  const table = document.getElementById(id), t = table.getBoundingClientRect();
  return [Math.round(t.width), Math.round(t.height), ...[...table.querySelectorAll('th, td, input, select, button, span')]
    .map(e => e.getBoundingClientRect()).filter(r => r.width || r.height)
    .map(r => [r.left - t.left, r.top - t.top, r.width, r.height].map(Math.round).join(','))].join(';');
}).join('|'));
const settle = page => page.evaluate(() => Promise.race([window.__L5R_CAROUSEL__.whenSettled(), new Promise(r => setTimeout(r, 3000))]));
const COPIES = '.pse-print-text, .pse-print-wrap, .pse-text-source';

async function main() {
  const browser = await chromium.launch();
  const errors = [];
  const pdf = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'l5r-pse-')), 'sheet.pdf');
  try {
    const page = await browser.newPage({viewport:{width:390, height:844}});
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href, {waitUntil:'domcontentloaded', timeout:90000});
    await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready &&
      window.__L5R_CAROUSEL__ && window.__L5R_CAROUSEL__.isReady(), null, {timeout:90000});
    await page.evaluate(() => window.__L5R_TEST__.CL11.close && window.__L5R_TEST__.CL11.close());
    check('PSE-SWITCH', await page.evaluate(() => window.__L5R_TEST__.PRINTED_SKILLS_EQUIPMENT_ENABLED === true &&
      !!window.__L5R_TEST__.PRINTSKILLSEQUIP && window.__L5R_TEST__.PRINTSKILLSEQUIP.enabled()));
    await page.evaluate(([SKILLS, EQUIP]) => {
      const T = window.__L5R_TEST__;
      SKILLS.forEach(d => document.getElementById('skillsBody').appendChild(T.makeSkillRow(d)));
      EQUIP.forEach(d => document.getElementById('equipBody').appendChild(T.makeEquipRow(d)));
      T.recalcAll();
      T.MODES12.set('play');
    }, [SKILLS, EQUIP]);
    await page.waitForTimeout(250);
    const reached = [];
    for (const tab of ['Skills', 'Equipment']) {
      await page.evaluate(t => window.__L5R_CAROUSEL__.goToTab(t), tab);
      await settle(page);
      reached.push(await page.evaluate(() => window.__L5R_CAROUSEL__.getActiveTab().label));
    }
    check('PSE-SETUP', [reached, ...await page.evaluate(() => {
      const T = window.__L5R_TEST__, sk = [...document.querySelectorAll('#skillsBody tr')], eq = [...document.querySelectorAll('#equipBody tr')];
      window.__pseData = JSON.stringify(T.collectData());
      window.__pseStorage = JSON.stringify(Object.entries(localStorage).sort());
      window.__pseValues = JSON.stringify([...sk, ...eq].map(tr => [...tr.querySelectorAll('input, select')].map(i => i.value)));
      return [T.MODES12.mode, sk.map(tr => [tr.querySelector('.sk-trait').value, tr.querySelectorAll('.sk-emph-select, .sk-emph-text').length]),
        eq.map(tr => tr.querySelector('.eq-qty').value),
        ['skillsTable', 'equipTable'].map(id => document.getElementById(id).parentElement.classList.contains('car-hscroll'))];
    })], [['Skills', 'Equipment'], 'play', [['Perception', 2], ['Agility or Intelligence', 0], ['Intelligence', 0], ['Reflexes', 2],
      ['Intelligence', 0]], ['1', '1', ''], [true, true]]);

    // Screen: the same geometry before printing, while the print copies exist, and after printing.
    const before = {}, during = {}, after = {};
    for (const w of [390, 1280]) { await page.setViewportSize({width:w, height:900}); await page.waitForTimeout(400); before[w] = await screenShape(page); }
    await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
    for (const w of [390, 1280]) { await page.setViewportSize({width:w, height:900}); await page.waitForTimeout(400); during[w] = await screenShape(page); }
    await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
    for (const w of [390, 1280]) { await page.setViewportSize({width:w, height:900}); await page.waitForTimeout(400); after[w] = await screenShape(page); }
    check('PSE-SCREEN-UNCHANGED', [390, 1280].map(w => [before[w] === during[w], before[w] === after[w], before[w].length > 400]),
      [[true, true, true], [true, true, true]]);

    // Paper.
    await page.evaluate(() => { window.dispatchEvent(new Event('beforeprint')); window.dispatchEvent(new Event('beforeprint')); });
    check('PSE-IDEMPOTENT', await page.evaluate(() => [document.querySelectorAll('#skillsBody .pse-print-text').length,
      document.querySelectorAll('#skillsBody .pse-print-wrap').length, document.querySelectorAll('#equipBody .pse-print-text').length,
      document.querySelectorAll('#equipBody .pse-print-wrap').length]), [5, 10, 3, 6]);
    const onPaper = async () => {
      const out = {skills: {}, equipment: {}};
      await page.emulateMedia({media:'print'});
      for (const w of WIDTHS) {
        await page.setViewportSize({width:w, height:1000}); await page.waitForTimeout(150);
        for (const k of Object.keys(TABLES)) out[k][w] = await measure(page, TABLES[k]);
      }
      await page.emulateMedia({media:'screen'});
      return out;
    };
    const paper = await onPaper();
    const per = f => Object.fromEntries(Object.keys(TABLES).map(k => [k, Object.fromEntries(WIDTHS.map(w => [w, f(paper[k][w], k)]))]));
    const rowsOf = k => k === 'skills' ? SKILLS.length : EQUIP.length;
    check('PSE-NO-SCROLLER', per(x => [x.wrapped, x.scrollers]), both([true, []]));
    check('PSE-TABLES-WITHIN-PAGE', per(x => x.within), both(true));
    check('PSE-LONG-TEXT-WHOLE-WORDS', per(x => x.long), per((x, k) => Array(rowsOf(k)).fill(Array(2).fill(
      {text:true, broken:[], wraps:'break-word normal', fits:true, blank:true}))));
    check('PSE-SHORT-VALUES-FIT', per(x => [x.shorts, x.xp]), per((x, k) => [Array(rowsOf(k)).fill([[true, true, true, true, true]]),
      k === 'skills' ? Array(rowsOf(k)).fill(1) : []]));
    check('PSE-EMPHASES-WHOLE', per((x, k) => k === 'skills' ? x.emphases : 'none'),
      {skills: byWidth([true, true, true, true]), equipment: byWidth('none')});
    check('PSE-SHORT-COLUMNS-TIGHT', per(x => x.tight), per((x, k) => Array(TABLES[k].shrink.length + 1).fill('tight')));
    check('PSE-WIDE-COLUMNS-TAKE-THE-REST', per(x => x.rest), both(true));
    await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
    // Management mode: the same tables, with every field editable on screen, print the same way.
    await page.evaluate(() => { window.__L5R_TEST__.MODES12.set('management'); window.dispatchEvent(new Event('beforeprint')); });
    const managed = await onPaper();
    check('PSE-MANAGEMENT-MODE', [await page.evaluate(() => window.__L5R_TEST__.MODES12.mode),
      Object.fromEntries(Object.keys(TABLES).map(k => [k, Object.fromEntries(WIDTHS.map(w => { const x = managed[k][w];
        return [w, [x.wrapped, x.scrollers, x.within, x.rest, x.long.flat().every(f => f.text && f.fits && !f.broken.length),
          x.shorts.flat().every(s => s.every(Boolean)), x.emphases.every(Boolean)]]; }))]))],
      ['management', both([true, [], true, true, true, true, true])]);
    check('PSE-AFTERPRINT-RESTORES', await page.evaluate(COPIES => {
      window.dispatchEvent(new Event('afterprint'));
      const rows = [...document.querySelectorAll('#skillsBody tr, #equipBody tr')];
      return [document.querySelectorAll(COPIES).length,
        JSON.stringify(rows.map(tr => [...tr.querySelectorAll('input, select')].map(i => i.value))) === window.__pseValues];
    }, COPIES), [0, true]);
    // The carousel re-copies an edge page with cloneNode(true); a copy made while printing must not keep print copies.
    check('PSE-RESTORE-CLEANS-COPIES', await page.evaluate(COPIES => {
      window.dispatchEvent(new Event('beforeprint'));
      const copy = document.body.appendChild(document.getElementById('equipTable').cloneNode(true));
      copy.removeAttribute('id');
      const copied = copy.querySelectorAll(COPIES).length;
      window.dispatchEvent(new Event('afterprint'));
      const left = document.querySelectorAll(COPIES).length;
      copy.remove();
      return [copied > 0, left];
    }, COPIES), [true, 0]);
    // A printed PDF (A4): Chromium fires beforeprint and afterprint around it. page.pdf() uses the emulated media, so clear it.
    await page.evaluate(() => window.__L5R_TEST__.MODES12.set('play'));
    await page.setViewportSize({width:1280, height:900});
    await page.emulateMedia({media:null});
    await page.pdf({path:pdf, format:'A4'});
    const text = execFileSync(PDFTOTEXT, ['-raw', '-enc', 'UTF-8', pdf, '-']).toString('utf8').replace(/\s+/g, ' ');
    check('PSE-PDF-TEXT-WHOLE', [LONG_SKILL, 'Agility or Intelligence', 'Interrogation', 'Assessment', SCROLL, SCROLL_NOTE]
      .map(s => text.includes(s)), [true, true, true, true, true, true]);
    check('PSE-PDF-LEAVES-SCREEN-AS-WAS', await page.evaluate(COPIES => document.querySelectorAll(COPIES).length, COPIES), 0);
    check('PSE-DATA-UNCHANGED', await page.evaluate(() => [JSON.stringify(window.__L5R_TEST__.collectData()) === window.__pseData,
      JSON.stringify(Object.entries(localStorage).sort()) === window.__pseStorage]), [true, true]);
    check('PSE-NO-PAGE-ERRORS', errors, []);
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
