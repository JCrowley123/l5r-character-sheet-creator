"""Pinned negative variants for PART K — Phase 13 Library (Releases 1, 1.1 and 2a); sequential, each must fail exactly its
pinned checks. A variant that stops the harness pins '(stopped)' with the checks it failed before stopping.
The baseline is main before this release. --discover prints each variant's failures instead of asserting."""
from pathlib import Path
import datetime, json, os, re, subprocess, sys, tempfile, threading
from concurrent.futures import ThreadPoolExecutor
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
V = Q.parent.parent
P = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
NODE = os.environ.get('L5R_NODE', r'C:\Program Files\nodejs\node.exe')
PREDECESSOR = '55a435e'  # main, Release 1.1: 6,632,468 bytes, 25ea5d3b... (1.1's baseline was ca44750, Release 1's 6f9197f)
TOTAL = 122
DISCOVER = '--discover' in sys.argv
# --jobs=N runs N variants at once (each in its own browser); the default is one at a time.
JOBS = int(next((a.split('=', 1)[1] for a in sys.argv if a.startswith('--jobs=')), '1'))
LOCK = threading.Lock()
# --only=a,b runs just those variants (the baseline is 'baseline').
ONLY = next((a.split('=', 1)[1].split(',') for a in sys.argv if a.startswith('--only=')), None)
PINNED = json.loads((Q / 'variants.json').read_bytes().decode('utf-8')) if (Q / 'variants.json').is_file() else {}
original = (P / 'l5r-character-sheet.html').read_bytes().decode('utf-8')
cases = [
    ('disabled', 'const LIBRARY_ENABLED = true;', 'const LIBRARY_ENABLED = false;'),
    ('page-disabled', 'const LIBRARY_PAGE_ENABLED = true;', 'const LIBRARY_PAGE_ENABLED = false;'),
    # The Library's records copied into the character saves' storage
    ('storage-in-saves', "        tx.objectStore('books').put(record);\n        await done(tx);",
     "        tx.objectStore('books').put(record);\n        localStorage.setItem('l5r-library-' + id, JSON.stringify(record));\n"
     "        await done(tx);"),
    # A citation opens the PDF page with the printed number instead of the printed page
    ('link-pdf-page', 'const p = Math.round(Number(printed)) - (record.offset || 0);', 'const p = Math.round(Number(printed));'),
    # Recognition from the PDF's title metadata alone
    ('title-recognition', 'const text = await api.firstPagesText(handle, 6);',
     "const text = String((await handle.doc.getMetadata()).info.Title || '');"),
    # Add book waits for the page matching to finish
    ('add-waits-matching', '        job.ready = true;\n      } catch(e){', '        await job.match;\n        job.ready = true;\n      } catch(e){'),
    # Citations stay linked whether or not the book is on the shelf (a deleted book keeps its link)
    ('deleted-book-linked', 'const shelved = LIB13.bookFor(c.bookId);', 'const shelved = true;'),
    # Release 1.1. The plain-JavaScript JPEG 2000 decoder is not found (as in Release 1): pictures blank where wasm fails
    ('no-jpx-fallback', 'this._noWasmFilename==="openjpeg_nowasm_fallback.js"?', 'this._noWasmFilename==="missing.js"?'),
    # PDF.js always told to try openjpeg.wasm, whatever the browser can compile
    ('wasm-always', 'const useWasm = api.useWasm != null ? !!api.useWasm : api.wasmUsable();', 'const useWasm = true;'),
    # Pages drawn at most at 2x, as in Release 1
    ('ratio-2', 'function screenRatio(){ return Math.min(window.devicePixelRatio || 1, 3); }',
     'function screenRatio(){ return Math.min(window.devicePixelRatio || 1, 2); }'),
    # No sharper redraw after a pinch zoom
    ('no-zoom-redraw', '      if(reader !== state) return;\n      const vv = window.visualViewport', '      return;\n      const vv = window.visualViewport'),
    # No per-canvas limit: a zoomed page passes iOS's 16.7 million pixels
    ('no-canvas-limit', 'const MAX_CANVAS_PX = 16e6,', 'const MAX_CANVAS_PX = 1e9,'),
    # Check now's page drawn 150 CSS pixels wide, as in Release 1
    ('check-now-150', 'tasks = [LIB13.draw(handle, pdfPage, page, page.clientWidth || 300, ratio)];',
     'tasks = [LIB13.draw(handle, pdfPage, page, 150, ratio)];'),
    # The margins show the whole page instead of the enlarged side margins
    ('no-margin-crop', 'c.clientWidth || 140, ratio, MARGINS[i])', 'c.clientWidth || 140, ratio)'),
    # The answer measured against the first page shown, not the page on screen
    ('check-now-first-page', "job.asked = { state: 'matched', offset: n - pdfPage, method: 'asked' };",
     "job.asked = { state: 'matched', offset: n - LIB13.checkPage(job.handle), method: 'asked' };"),
    # Review finding 12: a render that finishes reading covers after a later one starts still adds its list
    ('shelf-cover-race', '        if(gen !== renderGen) return;\n        body.appendChild(list);', '        body.appendChild(list);'),
    # Release 2a. The view chosen is not kept
    ('view-not-kept', "      LIB13.setPref('view', view).catch(function(){});\n", ''),
    # The view kept in the character saves' storage as well
    ('view-in-saves', "      tx.objectStore('prefs').put(value, key);",
     "      tx.objectStore('prefs').put(value, key);\n      localStorage.setItem('l5r-library-' + key, value);"),
    # Six covers a shelf whatever the width
    ('grid-six-on-phones', 'return Math.max(3, Math.min(6, Math.floor((w - 52 + gap) / (98 + gap))));', 'return 6;'),
    # The ⋯ menu a sheet from the bottom on desktop too
    ('menu-sheet-on-desktop', 'const pop = wide() && !!anchor;', 'const pop = false;'),
    # Fix page numbers counts the answer from the first page shown, not the page on screen
    ('fix-pages-first-page', 'try { await LIB13.update(book.id, { offset: n - pdfPage,', 'try { await LIB13.update(book.id, { offset: n - LIB13.checkPage(handle),'),
    # The picture squeezed into the cover instead of cropped
    ('picture-uncropped', 'ctx.drawImage(image, frame.x, frame.y, frame.w, frame.h, 0, 0, canvas.width, canvas.height);',
     'ctx.drawImage(image, 0, 0, canvas.width, canvas.height);'),
    # The crop frame square instead of the book's shape
    ('crop-not-book-shape', 'const aspect = shape && shape.width > 0 ? shape.height / shape.width : 134 / 98;', 'const aspect = 1;'),
    # Citations of books not in the Library left plain, as in Release 1
    ('nil-plain', 'const cites = LIB13.citations(text);\n        if(!cites.length) return;',
     'const cites = LIB13.citations(text).filter(function(c){ return LIB13.bookFor(c.bookId); });\n        if(!cites.length) return;'),
    # The line in Add a book never notices a different book
    ('from-line-ignores-book', 'if(!job || !job.inspected || job.bookId === w.bookId)', 'if(true)'),
    # Search's citations on screen not updated after the shelf changes
    ('no-relink', 'function relink(){\n', 'function relink(){\n      return;\n'),
    # Delete never mentions "not in Library"
    ('delete-sentence-missing', "(book.bookId && !others ? ' Search", "(false ? ' Search"),
    # A missing stored copy never found
    ('missing-not-found', 'return rows.filter(function(r){ return r.fileMissing || !have.has(r.id); })', 'return rows.filter(function(r){ return false; })'),
    # Any PDF accepted as the missing book's file
    ('refile-any-pdf', 'api.sameBook = function(record, probe){\n', 'api.sameBook = function(record, probe){\n      return { same: true };\n'),
    # "Imperial Histories p.N" with no volume left unlinked
    ('ih-unlinked', "CITE_NAMES.push({ text: 'Imperial Histories', id: 'ih1',", "if(0) CITE_NAMES.push({ text: 'Imperial Histories', id: 'ih1',"),
    # Review findings (2a). 1: a link opens the book before its page numbers are matched
    ('link-opens-before-numbers', "      if(typeof then === 'function'){ if(numbered) await numbered; then(record); }", "      if(typeof then === 'function') then(record);"),
    # 2: the late page match replaces numbers fixed meanwhile
    ('late-match-overwrites', 'pageMethod: r.method }, true); })', 'pageMethod: r.method }); })'),
    # 3: the same file judged by recognition alone
    ('refile-size-ignored', '      if(record.size && probe.size === record.size) return { same: true };\n', ''),
    # 4: a zoom before the picture has loaded
    ('crop-zoom-before-load', '          if(!st.iw) return;\n          const s1', '          const s1'),
    # 5: Change beside the cover open while saving
    ('cover-change-unlocked', """      o.querySelector('[data-l13="coverchange"]').disabled = true;\n""", ''),
    # 6: a book found unreadable once stays missing
    ('missing-not-rechecked', '        if(r.fileMissing && have.has(r.id) && (await api.readable(await api.file(r.id)))){', '        if(false){'),
]
report = {'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'cases': []}
out = Q / 'negative'
out.mkdir(exist_ok=True)


def run(label, body):
    with tempfile.TemporaryDirectory(prefix='l5r-lib13-negative-') as folder:
        page = Path(folder) / 'index.html'
        page.write_bytes(body.encode('utf-8'))
        r = subprocess.run([NODE, str(Q / 'library-harness.js'), str(page)], capture_output=True, text=True,
                           encoding='utf-8', timeout=1500)
    text = r.stdout + r.stderr
    with LOCK:
        record(label, text, r)


def record(label, text, r):
    (out / (label + '.log')).write_bytes(text.encode('utf-8'))
    failed = sorted(re.findall(r'^FAIL (\S+)', text, re.M))
    counts = re.findall(r'^(\d+)/(\d+)', text, re.M)
    got = list(map(int, counts[-1])) if counts else []
    if r.returncode == 2:
        failed = sorted(failed + ['(stopped)'])
    case = {'id': label, 'expected_failures': PINNED.get(label), 'actual_failures': failed, 'counts': got, 'exit': r.returncode}
    report['cases'].append(case)
    (out / 'summary.json').write_bytes((json.dumps(report, indent=2) + '\n').encode())
    if DISCOVER:
        print(label + ' ' + json.dumps(failed) + ' ' + str(got) + ' exit ' + str(r.returncode), flush=True)
        return
    want = sorted(PINNED[label])
    if '(stopped)' in want:
        assert r.returncode == 2 and got[1:] == [TOTAL] and failed == want, case
    else:
        assert r.returncode == 1 and got == [TOTAL - len(want), TOTAL] and failed == want, case
    print(label + ': failed exactly ' + str(len(want)) + ' pinned checks', flush=True)


baseline = subprocess.check_output(['git', 'show', PREDECESSOR + ':' + P.relative_to(V.parent).as_posix() + '/l5r-character-sheet.html'],
                                   cwd=V.parent).decode('utf-8')
work = [('baseline', baseline)]
for label, old, new in cases:
    assert original.count(old) == 1, (label, 'mutation is not unique', original.count(old))
    work.append((label, original.replace(old, new)))
if ONLY:
    work = [w for w in work if w[0] in ONLY]
with ThreadPoolExecutor(JOBS) as pool:
    for f in [pool.submit(run, label, body) for label, body in work]:
        f.result()
report['passed'] = not DISCOVER
(out / 'summary.json').write_bytes((json.dumps(report, indent=2) + '\n').encode())
print('All ' + str(len(cases) + 1) + ' negative variants matched their pinned failures.' if not DISCOVER else 'Discovery done.')
