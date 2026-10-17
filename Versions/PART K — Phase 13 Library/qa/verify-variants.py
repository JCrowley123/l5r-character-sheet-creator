"""Pinned negative variants for PART K — Phase 13 Library (Releases 1 and 1.1); sequential, each must fail exactly its
pinned checks. A variant that stops the harness pins '(stopped)' with the checks it failed before stopping.
The baseline is main before this release. --discover prints each variant's failures instead of asserting."""
from pathlib import Path
import datetime, json, os, re, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
V = Q.parent.parent
P = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
NODE = os.environ.get('L5R_NODE', r'C:\Program Files\nodejs\node.exe')
PREDECESSOR = 'ca44750'  # main, Release 1: 6,178,632 bytes, f2b388cf... (Release 1's baseline was 6f9197f, f39a31cb...)
TOTAL = 75
DISCOVER = '--discover' in sys.argv
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
    ('deleted-book-linked', '.filter(function(c){ return LIB13.bookFor(c.bookId); })', '.filter(function(c){ return true; })'),
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
    ('check-now-150', 'tasks = [LIB13.draw(job.handle, pdfPage, page, page.clientWidth || 300, ratio)];',
     'tasks = [LIB13.draw(job.handle, pdfPage, page, 150, ratio)];'),
    # The margins show the whole page instead of the enlarged side margins
    ('no-margin-crop', 'c.clientWidth || 140, ratio, MARGINS[i])', 'c.clientWidth || 140, ratio)'),
    # The answer measured against the first page shown, not the page on screen
    ('check-now-first-page', "job.asked = { state: 'matched', offset: n - pdfPage, method: 'asked' };",
     "job.asked = { state: 'matched', offset: n - LIB13.checkPage(job.handle), method: 'asked' };"),
    # Review finding 12: a render that finishes reading covers after a later one starts still adds its list
    ('shelf-cover-race', '        if(gen !== renderGen) return;\n        body.appendChild(list);', '        body.appendChild(list);'),
]
report = {'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'cases': []}
out = Q / 'negative'
out.mkdir(exist_ok=True)


def run(label, body):
    with tempfile.TemporaryDirectory(prefix='l5r-lib13-negative-') as folder:
        page = Path(folder) / 'index.html'
        page.write_bytes(body.encode('utf-8'))
        r = subprocess.run([NODE, str(Q / 'library-harness.js'), str(page)], capture_output=True, text=True,
                           encoding='utf-8', timeout=900)
    text = r.stdout + r.stderr
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
run('baseline', baseline)
for label, old, new in cases:
    assert original.count(old) == 1, (label, 'mutation is not unique', original.count(old))
    run(label, original.replace(old, new))
report['passed'] = not DISCOVER
(out / 'summary.json').write_bytes((json.dumps(report, indent=2) + '\n').encode())
print('All ' + str(len(cases) + 1) + ' negative variants matched their pinned failures.' if not DISCOVER else 'Discovery done.')
