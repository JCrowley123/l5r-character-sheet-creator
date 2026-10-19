"""Pinned negative variants for PART K — Phase 13 Library (Releases 1, 1.1, 2a, 2b, 2c and 2d); each must fail exactly its
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
PREDECESSOR = '57f5c67'  # main, Release 2c (= 4939a78's build): 6,717,550 bytes, c9fb1498... (2c's baseline was 1445565, 2b's ec6e143, 2a's 55a435e, 1.1's ca44750, Release 1's 6f9197f)
TOTAL = 187
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
    # Release 2b. Bookmarks shown two levels deep
    ('outline-two-levels', 'kids: depth < 3 ? below : []', 'kids: depth < 2 ? below : []'),
    # A lone top bookmark (the book's title) kept as the first level
    ('lone-top-kept', "      if(items.length === 1 && items[0].items && items[0].items.length) items = items[0].items;\n", ''),
    # Bookmarks that lead nowhere described as no bookmarks
    ('unlinked-unnamed', '      tree.unlinked = !tree.length;\n', ''),
    # The spot being read never highlighted
    ('spot-not-followed', '      if(!state.outline) return;\n      if(state.chosen && state.chosen.page == null)',
     '      return;\n      if(state.chosen && state.chosen.page == null)'),
    # The spot's levels left closed
    ('spot-levels-closed', '      path.slice(0, -1).forEach(function(b){ state.open.add(b.key); });\n', ''),
    # The Chapters button missing from the phone's bar
    ('bar-without-chapters', '      bar.appendChild(barChapters);\n', ''),
    # A chapter chosen on a phone leaves the sheet over the page
    ('phone-sheet-stays', '            showPdfPage(state, b.page);\n            if(!state.desk) closePanel(state);', '            showPdfPage(state, b.page);'),
    # A chapter chosen on desktop closes the side panel
    ('desktop-panel-closes', '            showPdfPage(state, b.page);\n            if(!state.desk) closePanel(state);', '            showPdfPage(state, b.page);\n            closePanel(state);'),
    # Escape closes the book while the sheet is open, and from the desktop panel's search box
    ('escape-closes-book', "        if(state.panelOpen && !state.desk){ e.preventDefault(); closePanel(state); }\n"
     "        else if(!(e.target === state.findInput && state.findInput.value)) api.closeReader();", '        api.closeReader();'),
    # No bookmarks, and no way to Search in book from there
    ('no-search-offer', "        s.addEventListener('click', function(){ showTab(state, 'search', 'content'); });\n        box.appendChild(s);", '        box.appendChild(s);'),
    # Search in book matching the case
    ('search-case-sensitive', r"join('\\s+'), 'gi');", r"join('\\s+'), 'g');"),
    # Pages listed by their PDF page number instead of the printed one
    ('pdf-page-labels', 'function pageLabel(state, n){ const p = LIB13.printedFor(state.record, n);', 'function pageLabel(state, n){ const p = n;'),
    # The book's last page never searched
    ('search-skips-last-page', 'for(let k = n; k < n + 4 && k <= handle.pages; k++) group.push(k);', 'for(let k = n; k < n + 4 && k < handle.pages; k++) group.push(k);'),
    # Results without their section
    ('results-no-section', "pageLabel(state, r.page) + (section ? ' · ' + section.title : '')", 'pageLabel(state, r.page)'),
    # The word not marked in the result's line
    ('snippet-unmarked', "      sn.appendChild(el('mark', 'l13-mark', r.snippet.match));", '      sn.appendChild(document.createTextNode(r.snippet.match));'),
    # The mark placed with every letter as wide as the others
    ('mark-equal-widths', 'return all > 0 ? ruler.measureText(str.slice(0, at)).width / all : at / str.length;', 'return at / str.length;'),
    # Desktop laid out as a phone (sheet, jump in the hidden bar)
    ('desktop-as-phone', '      state.desk = wide();\n', '      state.desk = false;\n'),
    # Desktop pages always 820 px wide, not fitted to the window's height
    ('desktop-pages-820', '  .l13-reader .l13-page{max-width:max(560px,min(820px,calc((100vh - 110px) / var(--l13-ratio,1.3))))}', '  .l13-reader .l13-page{max-width:820px}'),
    # Opened from Search, desktop still shows the panel
    ('from-search-panel-open', "state.panelOpen = wide() && state.from !== 'search';", 'state.panelOpen = wide();'),
    # Review findings (2b). 1, 2: focus left behind when the panel opens (on the hidden header button, or under the sheet)
    ('focus-left-behind', "      showTab(state, tab, tab === 'search' ? 'content' : 'tab');", "      showTab(state, tab, tab === 'search' ? 'content' : null);"),
    # 1: a chapter row loses focus when Chapters is redrawn
    ('row-focus-dropped', '      if(refocus){\n', '      if(false){\n'),
    # 3: Escape on a phone clears the sheet's search; on desktop, Escape in the search box closes the book
    ('escape-clears-sheet-search', '        if(state.panelOpen && !state.desk){ e.preventDefault(); closePanel(state); }', '        if(state.panelOpen && !state.desk){ closePanel(state); }'),
    ('escape-in-box-closes-book', '        else if(!(e.target === state.findInput && state.findInput.value)) api.closeReader();', '        else api.closeReader();'),
    # 6: curly quotes and dashes match only themselves
    ('no-quote-fold', '    api.fold = function(s){\n', "    api.fold = function(s){\n      return String(s || '');\n"),
    # 7: the spot is the last bookmark listed at or before the page, whatever its page
    ('spot-last-listed', 'if(b.page <= n && (!hit || b.page >= hit.page)) hit = b;', 'if(b.page <= n) hit = b;'),
    # Release 2c. The printed contents page never read (bookmarks only, as in Release 2b)
    ('contents-never-read', "if(depth(tree) <= 1 && record && record.pageState === 'matched'){", 'if(false){'),
    # One flat level of bookmarks kept over the contents page
    ('flat-bookmarks-kept', 'if(depth(tree) <= 1 && record && record.pageState', 'if(!tree.length && record && record.pageState'),
    # Bookmarks in levels replaced by the contents page too
    ('levels-replaced', 'if(depth(tree) <= 1 && record && record.pageState', 'if(record && record.pageState'),
    # A title printed over two or three lines not run on
    ('no-run-on', 'while(lines[at].printed == null && at - k < 2 && at + 1 < lines.length){', 'while(false){'),
    # Two lines of a chapter title from the same start joined with a space
    ('no-colon', "return chapter && Math.abs(a.x - b.x) <= 1 && !/[:,;/&-]$/.test(a.title) ? ': ' : ' ';", "return ' ';"),
    # A colon between every line of a chapter title, not only the first two
    ('colon-every-line', 'title += runOn(a, b, at === k && chapterSize(a)) + b.title;', 'title += runOn(a, b, chapterSize(a)) + b.title;'),
    # A chapter title printed without a number left out
    ('no-headings', 'if(lines[at].printed == null && !chapterSize(first)) continue;', 'if(lines[at].printed == null) continue;'),
    # Any larger type kept as a chapter (the page's own title)
    ('big-titles-kept', 'const chapterSize = function(l){ return big(l) && numbered.some(', 'const chapterSize = function(l){ return big(l) || numbered.some('),
    # The columns read across: a row takes in the columns to its left
    ('columns-merged', 'const lo = Math.max(k ? cols[k - 1] + 1 : -Infinity, width ? edge - width - 2 : -Infinity);', 'const lo = -Infinity;'),
    # Text in the gutter beside a column kept as a line of it
    ('margin-text-kept', 'return columnLines(its, cols, width, n);', 'return columnLines(its, cols, null, n);'),
    # A margin number read as a line, breaking a title's run-on
    ('margin-number-kept', r"          if(/^[\d\s.·…]*$/.test(text)) return;" + '\n', ''),
    # Pieces of a title split for kerning joined with spaces
    ('pieces-spaced', "if(end != null && i.x - end > row.size * 0.3) text += ' ';", "if(end != null) text += ' ';"),
    # Page numbers read only after two dots or more, not after one dot or a gap
    ('leaders-required', r"const NUMBERED = /^(.*?\S)[\s.·…]+(\d{1,3})$/;", r"const NUMBERED = /^(.*?\S)\s*(?:[.·]\s*){2,}(\d{1,3})$/;"),
    # Numbers that do not run in order taken for a contents page
    ('order-unchecked', 'if(listed.length < 5 || back > listed.length * 0.2) return [];', 'if(listed.length < 5) return [];'),
    # Levels measured from the page's left edge, not each column's
    ('indent-from-page-edge', 'inset: first.edge - first.x, width: first.width });', 'inset: -first.x, width: first.width });'),
    # A fourth level shown
    ('contents-four-levels', 'parent !== null && stack.length < 3 && page >= 1', 'parent !== null && stack.length < 4 && page >= 1'),
    # The hint names the bookmarks whatever the chapters came from
    ('hint-says-bookmarks', "(printed ? 'From the book’s printed contents page. ' : 'From the PDF’s own bookmarks. ')", "'From the PDF’s own bookmarks. '"),
    # The count is of pages, not matches
    ('count-pages-only', 'const total = found.reduce(function(sum, r){ return sum + (r.count || 1); }, 0);', 'const total = found.length;'),
    # "1 matches"
    ('one-matches', "(total === 1 ? ' match' : ' matches')", "' matches'"),
    # Review findings (2c). 1: a title ending in a number before its leaders ("Part 2 . . .") taken for a page number's edge
    ('digit-title-edges', ' && !leads.some(function(j){ return Math.abs(j.y - i.y) <= i.size * 0.4 && j.x >= i.r - 1 && j.x - i.r <= i.size * 6; })', ''),
    # 2: indent steps pooled across pages of different column widths
    ('widths-pooled', 'let g = groups.find(function(x){ return Math.abs(x.width - e.width) <= 0.15 * Math.max(x.width, e.width); });', 'let g = groups[0];'),
    # 3: only the first run of numbered pages tried
    ('first-run-only', 'if(run.length){ const tree = contentsTree(run, handle, record); if(tree.length) return tree; run = []; }',
     'if(run.length) return contentsTree(run, handle, record);'),
    # 4: the sections of an entry left out filed under the entry before it
    ('dropped-branch-kept', '        stack.push({ level: level, node: node });', '        if(node) stack.push({ level: level, node: node });'),
    # 7: chapters read again at every open
    ('not-kept', '      if(key && chaptersRead.has(key)) return chaptersRead.get(key);\n', ''),
    # 8: the contents page used before the book's page numbers are matched
    ('unmatched-contents', "record && record.pageState === 'matched'){", 'record){'),
    # Release 2d. The title tapped not remembered: the later of two parts on one page highlighted (as in Release 2c)
    ('chosen-ignored', '            state.chosen = { entry: b, page: null };\n', ''),
    # The title tapped kept after another page is in view
    ('chosen-never-cleared', '      if(state.chosen && path[path.length - 1] !== state.chosen.entry) state.chosen = null;\n', ''),
    # The title tapped highlighted whatever page is in view
    ('chosen-any-page', 'if(chosen && chosen.page === n){', 'if(chosen){'),
    # The title tapped forgotten at any scroll, even within its page
    ('chosen-cleared-on-scroll', 'requestAnimationFrame(function(){ ticking = false; track(state, body); });',
     'requestAnimationFrame(function(){ ticking = false; state.chosen = null; track(state, body); });'),
    # Search in book's results name the title tapped instead of the part the page holds
    ('chosen-in-search', 'const section = LIB13.spot(state.outline || [], r.page).pop();', 'const section = LIB13.spot(state.outline || [], r.page, state.chosen).pop();'),
    # Review finding (2d). 1: the title tapped kept only while its own page is in view, which a phone's last page never is
    ('chosen-own-page', 'state.chosen.page = state.current;', 'state.chosen.page = state.chosen.entry.page;'),
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
