/*
 * Phase 7 (Part J), first release, acceptance: one save format, older saves carried up.
 * The input HTML is read only.   node save-format-harness.js <sheet.html> [--absent] [--no-d45]
 *
 * Oracles are what is stored (localStorage), what is downloaded or shared (the file and its
 * name), and how a save READS: every "same sheet" check loads the original and the converted save
 * through the layers BELOW this part (VersionManager.bypass, or nothing to bypass when the part is
 * absent) and compares collectData(). So a conversion that lost or changed anything is caught by
 * the reader that existed before this release, not by this part's own code.
 *
 * --absent  expectations for a build without this part (removed, or SAVE_FORMAT_ENABLED off):
 *           older saves are stored and exported as they came, names lose accents.
 * --no-d45  expectations for Phase 4.5.2 switched off: the chain ends at format 2.
 * --no-list Phase 11's Characters list switched off: only the format and file-name scenarios run
 *           (Import, copy and the list's export are the list's own paths).
 * Every scenario declares its assertion identities first, so an exception fails what it did not reach.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');
const sheet = process.argv[2];
const absent = process.argv.includes('--absent');
const noD45 = process.argv.includes('--no-d45');
const noList = process.argv.includes('--no-list');
const present = !absent;
// Phase 4.6 (Part I), Alternate Paths, adds one step at the end of the chain when it is installed
// (1 October 2026); main() reads that from the phase's own seam object, not from the chain this
// harness checks, and raises FORMAT by one. Without Phase 4.6 everything reads as before.
let FORMAT = noD45 ? 2 : 3;
let paths46 = false;
let advanced47 = false;
const FIX = path.join(__dirname, 'fixtures');
const results = [];
const contexts = [];
const canonical = v => Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object'
  ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canonical(v[k])])) : v;
const same = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
function record(id, actual, expected, detail = '') {
  if (results.some(r => r.id === id)) throw new Error('duplicate assertion ' + id);
  const pass = same(actual, expected);
  results.push({ id, pass });
  const show = v => String(JSON.stringify(v)).slice(0, 600);
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : '\n expected ' + show(expected)
    + '\n actual ' + show(actual)) + (detail ? '\n ' + detail : ''));
}
async function scenario(prefix, names, run) {
  const ids = names.map(n => 'SF7-' + prefix + '-' + n);
  const check = (n, a, e = true) => {
    const id = 'SF7-' + prefix + '-' + n;
    if (!ids.includes(id)) throw new Error('undeclared assertion ' + id);
    record(id, a, e);
  };
  let error = '';
  try { await run(check); } catch (e) { error = String(e.stack || e).split('\n').slice(0, 5).join('\n'); }
  for (const id of ids) if (!results.some(r => r.id === id)) record(id, 'not reached', 'completed', error);
}
async function fresh(browser, { width = 1280, height = 900, touch = false, seed = null, share = false } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, hasTouch: touch, acceptDownloads: true });
  contexts.push(context);
  if (seed) await context.addInitScript(s => {
    // Characters written before this page existed, as an earlier build (or an earlier import) left them.
    if (sessionStorage.getItem('sf7-seeded')) return;
    sessionStorage.setItem('sf7-seeded', '1');
    for (const [id, text] of Object.entries(s.records)) localStorage.setItem('l5r-sheet:local:l5r-char:' + id, text);
    localStorage.setItem('l5r-sheet:local:l5r-char-index', JSON.stringify(s.index));
  }, seed);
  if (share) await context.addInitScript(() => {
    // The phone's share sheet, recorded rather than opened.
    window.__shared = [];
    const mm = window.matchMedia.bind(window);
    window.matchMedia = q => /pointer:\s*coarse/.test(q) ? { matches: true, media: q, addEventListener() {}, removeEventListener() {} } : mm(q);
    navigator.canShare = () => true;
    navigator.share = async d => { for (const f of d.files) window.__shared.push({ name: f.name, text: await f.text() }); };
  });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  page.errors = [];
  page.alerts = [];
  page.on('pageerror', e => page.errors.push(String(e)));
  await page.route('https://fonts.googleapis.com/**', r => r.abort());
  await page.route('https://fonts.gstatic.com/**', r => r.abort());
  await page.goto(pathToFileURL(path.resolve(sheet)).href, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => { const L = window.__L5R_TEST__?.CL11; return !!L && (L.ready || L.enabled() === false) && !!window.__L5R_CAROUSEL__?.isReady?.(); }, null, { timeout: 60000 });
  await page.evaluate(() => window.__L5R_TEST__.CL11.close?.());
  await page.waitForTimeout(200);
  return page;
}
const keys = p => p.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('l5r-sheet:local:l5r-char:')).map(k => k.slice(25)).sort());
const rawStored = (p, id) => p.evaluate(id => localStorage.getItem('l5r-sheet:local:l5r-char:' + id), id);
const stored = async (p, id) => JSON.parse(await rawStored(p, id));
// Load a save through the layers below this part and read the sheet back. A save in a format above
// what those layers accept, but no newer than this build's (only possible once a later release such
// as Phase 4.6, Part I, adds a step), is handed down as their newest format, exactly as this part's
// own applyData() does for a current save. Without such a step nothing is changed here.
const readsAs = (p, data) => p.evaluate(d => {
  const T = window.__L5R_TEST__, V = T.VersionManager;
  const copy = JSON.parse(JSON.stringify(d));
  if (V && copy.schemaVersion > V.innerFormat() && copy.schemaVersion <= V.current()) copy.schemaVersion = V.innerFormat();
  const was = V ? V.bypass : null;
  if (V) V.bypass = true;
  try { const ok = T.applyData(copy); return { ok: ok !== false, sheet: T.collectData() }; }
  finally { if (V) V.bypass = was; }
}, data);
async function importFile(p, name, text) {
  const before = await keys(p);
  await p.evaluate(() => window.__L5R_TEST__.CL11.open('characters'));
  await p.setInputFiles('#cl11ImportFile', { name, mimeType: 'application/octet-stream', buffer: Buffer.from(text) });
  await p.waitForTimeout(700);
  const added = (await keys(p)).filter(k => !before.includes(k));
  await p.evaluate(() => window.__L5R_TEST__.CL11.close());
  return added;
}
async function download(p, action) {
  const [d] = await Promise.all([p.waitForEvent('download'), action()]);
  return { name: d.suggestedFilename(), text: fs.readFileSync(await d.path(), 'utf8') };
}
const setName = (p, n) => p.evaluate(n => { const el = document.getElementById('f_name'); el.value = n; el.dispatchEvent(new Event('input', { bubbles: true })); }, n);
const headerExport = p => download(p, () => p.evaluate(() => document.getElementById('btnExport').click()));
const real = name => fs.readFileSync(path.join(FIX, name), 'utf8');
// A format-2 save as the sheet wrote it before Phase 4.5.2: two configurations in the older shape.
async function formatTwo(p) {
  const d = await p.evaluate(() => { const d = window.__L5R_TEST__.collectData(); return d; });
  d.schemaVersion = 2;
  d.fields.f_name = 'Format Two Hanako';
  d.adv = [{ name: 'Luck', cost: '3', desc: '', config: { type: 'severityTier', value: 'Rank 1' } }];
  d.disadv = [{ name: 'Antisocial', cost: '2', desc: '', config: { type: 'severityTier', value: '-1k0' } }];
  return d;
}
const withVersion = async (p, v, name) => {
  const d = await p.evaluate(() => window.__L5R_TEST__.collectData());
  d.fields.f_name = name;
  if (v === undefined) delete d.schemaVersion; else d.schemaVersion = v;
  return d;
};

async function main() {
  const browser = await chromium.launch();
  try {
    if (present) {
      const probe = await fresh(browser);
      paths46 = await probe.evaluate(() => { const A = window.__L5R_TEST__.AP46; return !!A && A.enabled(); });
      if (paths46) FORMAT += 1;
      advanced47 = await probe.evaluate(() => !!window.__L5R_TEST__.AS47?.enabled());
      if (advanced47) FORMAT += 1;
    }
    await scenario('FORMAT', ['CURRENT', 'STEPS', 'NO-ERRORS'], async check => {
      const p = await fresh(browser);
      const r = await p.evaluate(() => { const T = window.__L5R_TEST__, V = T.VersionManager;
        return { active: !!V && V.enabled(), current: V ? V.current() : null, written: T.collectData().schemaVersion,
          trunk: T.SHEET_SCHEMA_VERSION, steps: V ? V.steps().map(s => [s.from, s.to]) : null }; });
      check('CURRENT', [r.active, r.active ? r.current : 'absent', r.written, r.trunk],
        [present, present ? FORMAT : 'absent', FORMAT, 2]);
      check('STEPS', present ? r.steps : 'absent', present ? (noD45 ? [[1, 2]] : [[1, 2], [2, 3]])
        .concat(paths46 ? [[noD45 ? 2 : 3, noD45 ? 3 : 4]] : [])
        .concat(advanced47 ? [[FORMAT - 1, FORMAT]] : []) : 'absent');
      check('NO-ERRORS', p.errors, []);
    });

    const REAL = ['Sairyu_.l5r', 'Sairy_.l5r', 'character.l5r.json'];
    if (!noList) await scenario('IMPORT', [...REAL.flatMap((f, i) => ['REAL' + (i + 1) + '-STORED', 'REAL' + (i + 1) + '-SAME-SHEET']),
      'V2-STORED', 'V2-CONFIGS', 'V2-SAME-SHEET', 'NO-ERRORS'], async check => {
      const p = await fresh(browser);
      for (const [i, f] of REAL.entries()) {
        const text = real(f);
        const [id] = await importFile(p, f, text);
        const s = await stored(p, id);
        // Absent: stored exactly as picked. Present: the same character, stamped with the current format.
        check('REAL' + (i + 1) + '-STORED', present ? s.schemaVersion : await rawStored(p, id),
          present ? FORMAT : JSON.stringify(JSON.parse(text)));
        const a = await readsAs(p, JSON.parse(text)), b = await readsAs(p, s);
        check('REAL' + (i + 1) + '-SAME-SHEET', [a.ok, b.ok, same(a.sheet, b.sheet)], [true, true, true]);
      }
      const two = await formatTwo(p);
      const [id] = await importFile(p, 'two.l5r.json', JSON.stringify(two));
      const s = await stored(p, id);
      check('V2-STORED', s.schemaVersion, present ? FORMAT : 2);
      check('V2-CONFIGS', [s.adv[0].config.type, s.disadv[0].config.type],
        present && !noD45 ? ['rankPick', 'tierPick'] : ['severityTier', 'severityTier']);
      const a = await readsAs(p, two), b = await readsAs(p, s);
      check('V2-SAME-SHEET', [a.ok, b.ok, same(a.sheet, b.sheet)], [true, true, true]);
      check('NO-ERRORS', p.errors, []);
    });

    if (!noList) await scenario('REFUSE', ['CURRENT-BYTES', 'NEWER-NOT-STORED', 'NEWER-SAID', 'INVALID-UNCHANGED', 'LOAD-NEWER',
      'LOAD-INVALID', 'NO-ERRORS'], async check => {
      const p = await fresh(browser);
      const cur = await withVersion(p, FORMAT, 'Current Format Jiro');
      const [id] = await importFile(p, 'cur.l5r.json', JSON.stringify(cur, null, 2));
      check('CURRENT-BYTES', await rawStored(p, id), JSON.stringify(cur));
      const before = await keys(p);
      const newer = await withVersion(p, FORMAT + 1, 'Newer Format Taro');
      const added = await importFile(p, 'newer.l5r.json', JSON.stringify(newer));
      check('NEWER-NOT-STORED', [added, await keys(p)], [[], before]);
      const said = await p.evaluate(() => [...document.querySelectorAll('.roll-modal-overlay')]
        .filter(o => o.style.display === 'flex').map(o => o.textContent).join(' '));
      check('NEWER-SAID', new RegExp('format ' + (FORMAT + 1)).test(said), true);
      await p.evaluate(() => [...document.querySelectorAll('.roll-modal-overlay')].forEach(o => { if (o.style.display === 'flex') o.querySelector('button')?.click(); }));
      const invalid = [];
      for (const v of ['abc', 0, 2.5]) {
        const d = await withVersion(p, v, 'Odd Version ' + v);
        const [iid] = await importFile(p, 'odd.l5r.json', JSON.stringify(d));
        invalid.push(await rawStored(p, iid) === JSON.stringify(d));
      }
      check('INVALID-UNCHANGED', invalid, [true, true, true]);
      const snap = () => p.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
      const s0 = await snap();
      const ln = await p.evaluate(d => window.__L5R_TEST__.applyData(d), newer);
      check('LOAD-NEWER', [ln, await snap() === s0], [false, true]);
      await p.evaluate(() => [...document.querySelectorAll('.roll-modal-overlay')].forEach(o => { if (o.style.display === 'flex') o.querySelector('button')?.click(); }));
      const li = await p.evaluate(async d => window.__L5R_TEST__.applyData(d), await withVersion(p, 'abc', 'Odd'));
      // Phase 4.5.2 is what refuses a malformed version; the trunk alone reads it as format 1. This
      // release passes such saves through untouched, so without 4.5.2 the trunk's reading stands.
      check('LOAD-INVALID', [li !== false, await snap() === s0], noD45 ? [true, false] : [false, true]);
      check('NO-ERRORS', p.errors, []);
    });

    // Characters stored before this release: an older import, and one from a newer build.
    const oldText = real('Sairyu_.l5r');
    const probe = await fresh(browser);
    const newerRec = await withVersion(probe, FORMAT + 1, 'From A Newer Build');
    const seed = { records: { c_seed_old: oldText, c_seed_newer: JSON.stringify(newerRec) },
      index: [{ id: 'c_seed_old', name: 'Sairyū', clan: '', updatedAt: 1 }, { id: 'c_seed_newer', name: 'From A Newer Build', clan: '', updatedAt: 2 }] };
    if (!noList) await scenario('LIST', ['NOT-REWRITTEN', 'EXPORT-FORMAT', 'EXPORT-NAME', 'EXPORT-SAME-SHEET', 'COPY-FORMAT', 'COPY-ORIGINAL-KEPT',
      'COPY-NEWER-KEPT', 'NO-ERRORS'], async check => {
      const p = await fresh(browser, { seed });
      await p.evaluate(() => window.__L5R_TEST__.CL11.open('characters'));
      await p.waitForTimeout(400);
      check('NOT-REWRITTEN', await rawStored(p, 'c_seed_old'), oldText);
      const f = await download(p, () => p.evaluate(() => window.__L5R_TEST__.CL11.exportCharacter('c_seed_old')));
      const out = JSON.parse(f.text);
      check('EXPORT-FORMAT', out.schemaVersion ?? 'none', present ? FORMAT : 'none');
      check('EXPORT-NAME', f.name, present ? 'Sairyū.l5r.json' : 'Sairy_.l5r.json');
      const a = await readsAs(p, JSON.parse(oldText)), b = await readsAs(p, out);
      check('EXPORT-SAME-SHEET', [a.ok, b.ok, same(a.sheet, b.sheet)], [true, true, true]);
      let before = await keys(p);
      await p.evaluate(() => window.__L5R_TEST__.CL11.copyCharacter('c_seed_old'));
      await p.waitForTimeout(400);
      const [copyId] = (await keys(p)).filter(k => !before.includes(k));
      check('COPY-FORMAT', (await stored(p, copyId)).schemaVersion ?? 'none', present ? FORMAT : 'none');
      check('COPY-ORIGINAL-KEPT', await rawStored(p, 'c_seed_old'), oldText);
      before = await keys(p);
      await p.evaluate(() => window.__L5R_TEST__.CL11.copyCharacter('c_seed_newer'));
      await p.waitForTimeout(400);
      const [newerCopy] = (await keys(p)).filter(k => !before.includes(k));
      check('COPY-NEWER-KEPT', (await stored(p, newerCopy)).schemaVersion, FORMAT + 1);
      check('NO-ERRORS', p.errors, []);
    });

    await scenario('NAME', ['ACCENTED', 'DECOMPOSED', 'ASCII-UNCHANGED', 'UNSAFE-UNCHANGED', 'EMPTY-UNCHANGED', 'CONTENT',
      'NO-ERRORS'], async check => {
      const p = await fresh(browser);
      const name = async n => { await setName(p, n); return (await headerExport(p)).name; };
      check('ACCENTED', await name('Sairyū'), present ? 'Sairyū.l5r.json' : 'Sairy_.l5r.json');
      check('DECOMPOSED', await name('Sairyū'), present ? 'Sairyū.l5r.json' : 'Sairyu_.l5r.json');
      check('ASCII-UNCHANGED', await name('Doji Hoturi'), 'Doji_Hoturi.l5r.json');
      check('UNSAFE-UNCHANGED', await name('A/B:C?'), 'A_B_C_.l5r.json');
      check('EMPTY-UNCHANGED', await name(''), 'character.l5r.json');
      await setName(p, 'Kakita Ryoku');
      const f = await headerExport(p);
      const sheetNow = await p.evaluate(() => window.__L5R_TEST__.collectData());
      check('CONTENT', [same(JSON.parse(f.text), sheetNow), JSON.parse(f.text).schemaVersion], [true, FORMAT]);
      check('NO-ERRORS', p.errors, []);
    });

    if (!noList) await scenario('SHARE', ['NAME', 'FORMAT', 'NO-ERRORS'], async check => {
      const p = await fresh(browser, { width: 390, height: 844, touch: true, share: true, seed });
      await p.evaluate(() => window.__L5R_TEST__.CL11.exportCharacter('c_seed_old'));
      await p.waitForFunction(() => window.__shared.length > 0, null, { timeout: 5000 });
      const s = await p.evaluate(() => window.__shared[0]);
      check('NAME', s.name, present ? 'Sairyū.l5r.json' : 'Sairy_.l5r.json');
      check('FORMAT', JSON.parse(s.text).schemaVersion ?? 'none', present ? FORMAT : 'none');
      check('NO-ERRORS', p.errors, []);
    });

    if (present && !noList) await scenario('REGISTRY', ['STAMP', 'IMPORT', 'LOAD-OLDER', 'LOAD-OWN', 'REFUSE-NEWER', 'DUPLICATE', 'NO-ERRORS'], async check => {
      // A later format change, registered the way a future phase would: stamping, Import and load follow.
      const p = await fresh(browser);
      const three = await withVersion(p, FORMAT, 'Before The Step');
      await p.evaluate(f => window.__L5R_TEST__.VersionManager.register(f, 'harness step',
        d => { d.fields.f_notes = (d.fields.f_notes || '') + '[step]'; return d; }), FORMAT);
      check('STAMP', await p.evaluate(() => window.__L5R_TEST__.collectData().schemaVersion), FORMAT + 1);
      const [id] = await importFile(p, 'three.l5r.json', JSON.stringify(three));
      const s = await stored(p, id);
      check('IMPORT', [s.schemaVersion, s.fields.f_notes.endsWith('[step]')], [FORMAT + 1, true]);
      const lo = await p.evaluate(d => [window.__L5R_TEST__.applyData(d), document.getElementById('f_notes').value], three);
      check('LOAD-OLDER', [lo[0] !== false, lo[1].endsWith('[step]')], [true, true]);
      const own = await p.evaluate(() => { const T = window.__L5R_TEST__; const d = T.collectData(); d.fields.f_name = 'Own Save'; return [d.schemaVersion, T.applyData(d), document.getElementById('f_name').value]; });
      check('LOAD-OWN', [own[0], own[1] !== false, own[2]], [FORMAT + 1, true, 'Own Save']);
      const ref = await p.evaluate(f => { const T = window.__L5R_TEST__; const d = T.collectData(); d.schemaVersion = f + 2; return T.applyData(d); }, FORMAT);
      check('REFUSE-NEWER', ref, false);
      await p.evaluate(() => [...document.querySelectorAll('.roll-modal-overlay')].forEach(o => { if (o.style.display === 'flex') o.querySelector('button')?.click(); }));
      const dup = await p.evaluate(f => { try { window.__L5R_TEST__.VersionManager.register(f, 'again', d => d); return 'accepted'; } catch (e) { return 'refused'; } }, FORMAT);
      check('DUPLICATE', dup, 'refused');
      check('NO-ERRORS', p.errors, []);
    });
  } finally {
    for (const c of contexts) await c.close().catch(() => {});
    await browser.close();
  }
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  process.exitCode = results.length > 0 && passed === results.length ? 0 : 1;
}
main().catch(e => { console.error(e); console.log(`\n0/${results.length + 1} checks passed`); process.exit(1); });
