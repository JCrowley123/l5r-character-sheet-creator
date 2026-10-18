# PART K — Phase 13 Library, Releases 1 and 1.1: the iPhone feasibility test and its fixes

Built from the approved [Library Mock-ups v2](https://claude.ai/artifact/BkdJwpc9xFia9tRvBBBJrU) and the owner's word of
17 October 2026: Release 1 as proposed (14–20 points, stop line 20, cap 22) with the two storage messages. One
removable layer. The app carries no book text: only the owner's own PDFs, copied into the device's own storage.

Release 1 holds: Add a book for one PDF (recognition, page matching, cover), stored on the device; a minimal shelf
(list rows, ⋯ with Delete only, the storage line); the reader (scrolling pages, the printed-page jump); the link from
a Search citation to the printed page (Athletics, Core Rulebook p.139) and back. Release 2 holds the rest (grid,
the full ⋯ menu, Change cover, Chapters, Search in book, not in Library, File missing, desktop layouts).

## Release 1.1 (17 October 2026): the fixes from the owner's iPhone check

The owner's word: Release 1.1, stop line 9 points, cap 11. The same layer, four fixes:

| Fix | What changed |
|---|---|
| JPEG 2000 pictures in Safari | Safari cannot compile `openjpeg.wasm`: it uses relaxed SIMD (8 `i32x4.relaxed_trunc_f32x4_s`, 6 `f32x4.relaxed_madd`). PDF.js then imports `openjpeg_nowasm_fallback.js`, which Release 1 did not carry, so pictures stayed blank. That file is now carried verbatim (pdfjs-dist 6.4.299, 445,781 bytes, SHA-256 `9047b34b…d23e`, from the same package as the other PDF.js files, same licences) as a fourth text block. `classicWorker()` wraps it and turns PDF.js's one `import(…_noWasmFilename…)` into a lookup of that copy, for JPEG 2000 only (JBIG2 still fails as before); it throws if either file's shape changes. `LIB13.wasmUsable()` asks the browser with `WebAssembly.validate` of the carried module itself (not a sample module, so any feature the browser lacks counts); where the answer is no, PDF.js is told `useWasm: false`. If that answer were ever wrong, PDF.js's own failure path still reaches the carried copy |
| Sharpness | The reader draws at the screen's pixel ratio up to 3 (was 2), eight pages within 36 million pixels. When a pinch zoom settles (the visual viewport, 250 ms), the pages in view are redrawn at ratio × zoom into fresh canvases, swapped in when drawn: each canvas under 16 million pixels (iOS refuses 16.7 million) and the zoomed pages within 32 million. Zooming out, or a zoomed page leaving the view, returns to the normal ratio |
| Check now | The page fills the sheet's width at the screen's ratio. Under it, both side margins are shown enlarged (about 2.4×) halfway down, where all 16 books print their numbers (measured with pypdf on 12 pages of each: 10–13% in from the outer edge, exactly halfway down). Previous and Next show another page; the answer counts from the page shown. The sheet scrolls on a short screen |
| Review finding 12 | A shelf render checks again that it is still the latest after reading its covers, so an overlapping render no longer adds a second list |

Build **6,632,468 bytes**, SHA-256 `25ea5d3b829c5d4e127f77225d64408b2c6ead3e27ac7804d8877e30e6be4989`: growth over
Release 1 453,836 bytes (the fallback is 445,781 of them).

**On the owner's own Secrets of the Empire** (Chrome on the PC, local, nothing kept; `useWasm` true, then the wasm made
uncompilable as in Safari): pages 1 and 8 draw the same with the fallback as with the wasm, and page 1 becomes the
cover. The fallback is slower: page 1 in 2.8 s (wasm 0.4 s), page 8 in 5.5 s (wasm 1.4 s). On the iPhone, pages with
JPEG 2000 pictures can take a few seconds to draw; a zoom redraw decodes them again.

| Check (Release 1.1) | Result |
|---|---|
| Focused harness `qa/library-harness.js`, 16 new checks (75 in all; fixtures from `make-test-pdf.py --jpx` and `--mid-numbers`) | **75/75**; **main (Release 1) 60/75**: all 15 feature checks fail, the clean-run guard passes (`qa/negative/baseline.log`). The new checks run in a second browser at iPhone size and 3×, where the carried wasm is made into a module the browser rejects (as Safari rejects relaxed SIMD), and in a third that tells PDF.js to try the wasm anyway. Pinch zoom is Chrome's page scale, which the visual viewport reports |
| Negative variants `qa/verify-variants.py` | **17/17 pinned**: Release 1's eight (the baseline now `main` at Release 1) and nine new: the fallback not found (3), the wasm always tried (1), ratio 2 (5), no zoom redraw (2), no canvas limit (1), Check now drawn 150 px wide (1), the margins not cropped (2), the answer counted from the first page (1), the shelf race (1) |
| Removal proof `qa/test-removal.py` | **7/7**: the layer, its new fragment and file included, removed rebuilds `f39a31cb…` exactly |
| Registry `qa/test-chain.py` | **11/11** |
| Older harnesses that read the changed surfaces (`qa/touching-run-1.1.log`) | page off 7/7, Characters 70/70, App Bar 25/25, Search dependency 14/14, Search facets 44/44 |
| Full suite `qa/final-qa.py`, run 2 (17 October 23:23–23:56 UTC, mains power, screen held awake), after the App Bar fix below | **5,593/5,593**, all 118 leaves fresh (16.8 min); removing this layer through the registry rebuilt `f39a31cb…` (3,935,889 bytes) exactly; retained **5,511/5,511** (15.7 min). Logs `qa/final-1.1/`, `qa/final-1.1-run-2.log` |
| Live, after the merge (`ef00634`, 17 October 23:59 UTC) `qa/verify-live.py` | deployed page (6,638,117 bytes with the installable-app head) and service worker match the build byte for byte; on the downloaded page Search **62/62**, this layer **75/75**, page off **7/7**; the walk on the live site `qa/live-walk.js` **8/8** (`qa/live/live-walk-1.1.log`) |
| The owner's iPhone checks (iPhone 16e, Safari, 18 October), M1–M8 in MANUAL-TESTS | **8/8 Pass**: Secrets of the Empire's cover is page 1's picture and its page 8 art draws; the Book of Fire's art draws; pages sharper, and sharper again after a pinch zoom; Check now readable, with Previous/Next; the page jump right after Check now. Screenshots in the checklist doc |
| Full suite, run 1 (17 October 22:03–22:20 UTC, mains power, screen held awake) | **5,590/5,593**: Phase 11.3's App Bar harness failed `AB-WIDTH-320`, `-375` and `-390` (its click on the bar's Search timed out); every other leaf passed, this layer's 75 and 7 included. Logs `qa/final-1.1-run-1.log` and `qa/final-1.1-run-1/` |

**Why run 1 failed, and the fix.** Release 1.1 does not touch the App Bar. The harness passed alone (4 of 4), so an
instrumented copy (full error, the page's state, every zoom change with the input events before it) was run under CPU
load until it failed: 1 run in about 30, **on `main` (Release 1) as well as the candidate**. Each time the emulated
phone page had been left **zoomed 1.936×**, so Playwright's tap on Search landed on Characters ("intercepts pointer
events"). The zoom came with no input event, at the moment the harness resized the page to 320 px straight after
`AB-PRINT-HIDDEN`'s switch to print and back; its size is the print layout's width over the screen's (755 ÷ 390). The
app has no zoom code (only the viewport tag). A probe doing just print → screen → resize leaves Chrome's phone
emulation zoomed exactly 1.9359 on both builds; a 300 ms wait before the resize avoids it, which is why the harness
usually passed. **Fix in Phase 11.3's harness:** the print check now runs last, after the width checks and the return
to 390 px, so no resize follows print emulation. All 25 checks and their assertions are unchanged; only the order
moved. The pre-change copy is `originals/appbar-harness.before-1.1.js`. The patched harness passes 25/25 on the
candidate and on `main`, and 20 runs under the same CPU load showed no zoom after the page loaded
(`qa/appbar-zoom-evidence.log`; probes `qa/probe-print-resize.js`, `qa/probe-print-zoom.js`).

**Found while building:** the harness's first ink counter read a canvas just sized (transparent until drawn) as dark,
so one wait passed before the page was drawn and a correct Check now failed twice; the counter now counts painted
pixels only and also reports whether the canvas is painted. No code review this release.

## Measurement (17 October 2026, before building)

- **The owner's 16 PDFs.** The PDF title metadata names no book in any of them (empty, "untitled" or a publisher's
  file name such as "L5R_00_Introduction.indd"), so recognition never reads it: page count plus the most specific
  title phrase on the first six pages (13 books name themselves on PDF page 2; Core on page 4; Emerald Empire on page
  5). Page counts are unique for 10 books; the phrase decides the shared counts (202, 218, 312). Shop buyer lines on
  early pages are ignored and never stored.
- **Page numbers.** 9 books have PDF page labels; 8 agree with the print, Unexpected Allies 2's are one off. Rule:
  labels only when printed numbers read from sampled pages confirm them (any page edge, within 15%: the books print
  numbers in the outer margin); otherwise the offset the printed numbers agree on; "Check now" only when neither is
  confident. `qa/real-books-check.js` (local, the owner's files): **16/16 recognised and matched**, none needs Check now.
- **Renderer: PDF.js 6.4.299**, legacy build, verbatim, with `openjpeg.wasm` for the JPEG 2000 pictures
  in 7 of the books. It sits in the one HTML as three `text/plain` blocks, so the service worker's cached page already
  holds it offline; it starts only when a PDF is opened. The worker runs as a classic worker from a Blob URL (Chrome
  refuses module workers from Blob URLs on `file://`; `classicWorker()` swaps the two `import.meta.url` uses and drops
  the one export, and throws if that shape ever changes). PDFs are read in ranges from the stored Blob
  (`PDFDataRangeTransport` over `Blob.slice`), never whole. **Growth: 2,242,743 bytes** (3,935,889 → 6,178,632).
- **Storage.** No IndexedDB was in use; character saves are localStorage. The Library is its own IndexedDB database
  `l5r-library` (stores `books`, `files`, `covers`); a book, its PDF and its cover are written in one transaction.
  `navigator.storage.persist()` is asked; when it is refused, the shelf says so. Safari's real quota and eviction for
  about 1.45 GB is measured on the owner's iPhone (MANUAL-TESTS, S1–S3).

## Structure

| Location | Role |
|---|---|
| `src/sheet/209.99999999991-feat-library.js` | `LIB13`, no UI: the known books, `recognise`, `citations`, `pdfPageFor`/`printedFor`, storage (`add`, `update`, `remove`, `list`, `usage`, `bookFor`, `persist`), the engine (`engine`, `load`, `inspect`, `matchPages`, `checkPage`, `draw`, `makeCover`). Switch `LIBRARY_ENABLED` |
| `src/sheet/209.99999999992-feat-library-page.js` | `LIBPAGE13`, the replaceable UI: shelf, ⋯ Delete, Add a book with Check now, the reader, the Search link. `// UI hook:` wraps of `CL11.build` and `SEARCHPAGE14.render`. Switch `LIBRARY_PAGE_ENABLED` |
| `src/css/59.9999892-feat-library.css` | `l13-` classes only |
| `src/vendor/` | PDF.js (verbatim), `openjpeg.wasm` as base64, `openjpeg_nowasm_fallback.js` (Release 1.1), five boundary fragments, `licenses/` |
| `src/sheet/210-test-seam-and-init.js` | `library-seam`: `LIB13`, `LIBPAGE13` and both switches |

## For the owner's review (Release 1 wording)

- Check now's way out reads **"Skip for now"** (the canvas: skip and use Fix page numbers later; Fix page numbers
  arrives in Release 2).
- Delete asks "Delete [book]?" with "This removes the book and its cover from this device." The canvas's sentence
  about citations becoming "not in Library" waits for Release 2, which brings that marking.

## Verification (17 October 2026)

| Check | Result |
|---|---|
| Focused harness `qa/library-harness.js` (synthetic PDFs from `qa/make-test-pdf.py`) | **59/59** on the candidate; **0/59 on `main`** (stops at the seam: no Library). On the pre-review build (`96998d51…`) it stops after 52 checks with 5 failures, the review's checks: Add a book not locked while saving, two quick opens leaving a reader that cannot be closed (which also blocks the rest of the run), duplicate shelf rows, "Great Clans p.N", drawn pages not freed. Four of the nine review checks pass there: the worker and stale-read races the review traced by reading PDF.js do not happen in Chrome on this machine; they stay as guards |
| Dependency harness `qa/library-dependency.js` | **7/7** (two premise checks on the build as shipped; five with the page switched off: the logic answers, the placeholder stays, Search is plain, no page errors); **0/7 on `main`** |
| Negative variants `qa/verify-variants.py` | **8/8 pinned**: baseline (stops at the seam), logic off and page off (stop at the seam), Library records in the character saves' storage (2), a citation opening the PDF page instead of the printed page (3), recognition from the title alone (2, then stops), Add book waiting for the page matching (2), a deleted book's citation still linked (1) |
| Removal proof `qa/test-removal.py` | **7/7**: rebuilds `main` exactly (3,935,889 bytes, `f39a31cb…`); refuses a changed vendor file |
| Removal-chain registry `qa/test-chain.py` | **11/11** (the page fragment added to its `companions`) |
| Code review (one helper, read-only, the layer and the approved behaviour) | 12 findings: 9 fixed, 1 partly fixed, 2 recorded (below) |
| Full suite `qa/final-qa.py`, run 2 (17 October 17:49–18:23 UTC, mains power, screen held awake) | **5,577/5,577**, all 118 leaves fresh (17.0 min); removing this layer through the registry rebuilt `main` exactly; retained **5,511/5,511** (16.1 min). Logs in `qa/final/` |
| Live, after the merge (`79890fe`, 17 October 18:27 UTC) `qa/verify-live.py` | deployed page (6,184,281 bytes with the installable-app head) and service worker match the build byte for byte; on the downloaded page Search **62/62**, this layer **59/59**, page off **7/7**. Evidence in `qa/live/` |
| The checklist walked headlessly on the live site, `qa/live-walk.js` (18:31 UTC) | **8/8**: L1–L5, L7 (offline, through the service worker) and L9 with a test PDF; persistent storage refused there, so the S1 note showed. `qa/live/live-walk.log` |
| Full suite, run 1 (17:28–17:45 UTC) | 5,573/5,577: three older harnesses still expected the Library tab's placeholder or Search's unwrapped render (see "Retained test changes"); stopped before the retained stage. Logs in `qa/final-run-1/` |

Candidate: **6,178,632 bytes**, SHA-256 `f2b388cf888721b03a5d034c8726dbc1fe09cf3647bfd843959a9977e2366592` (growth over
`main` 2,242,743 bytes).

`qa/current-suite-runner.js` chains Phase 4.5.36's suite (5,511) and adds 59 + 7: **5,577**.

## Code review (17 October 2026)

| # | Finding | Outcome |
|---|---|---|
| 1 | High: one PDF.js worker shared by every document, but each load let PDF.js own it, so closing one book could tear it down under the next load | Fixed: one `PDFWorker` made on the port and passed to every load; PDF.js leaves a passed worker alone (checked in its source) |
| 2 | High: two quick taps on a book left a second, unclosable reader | Fixed: only the latest open builds a reader; closing cancels a pending open |
| 3 | Medium-high: decoded images kept after a page was drawn, so memory grew while scrolling | Fixed: `page.cleanup()` after each draw |
| 4 | Medium: a superseded or cancelled read could write into the next dialog or throw, and kept its document | Fixed: each step checks its read is still current and lets the document go |
| 5 | Medium: Add a book could be cancelled, renamed or tapped again while saving (late page match lost, duplicate book) | Fixed: Cancel, Escape, Choose another and Add are locked while saving |
| 6 | Medium: Search citations written "Great Clans p.N" and "Imperial Histories p.N" never linked | "Great Clans" fixed (alias). "Imperial Histories p.N" names no volume, so which book it means needs the books: recorded for Release 2 |
| 7 | Medium-low: JBIG2 and CCITT images (black-and-white scans) cannot be drawn: only the JPEG 2000 decoder is carried | Recorded: none of the owner's 16 books uses JBIG2 (desk check; CCITT not measured); carrying its decoder would grow the build. Revisit if a page draws blank |
| 8 | Low-medium: the storage connection was kept for ever | Fixed: closed on a version change, reopened after the browser drops it |
| 9 | Low: an unreadable file or a stalled worker left a spinner for ever | Fixed: a failed read or a 60-second stall ends the load with the error message; a failed worker is replaced |
| 10 | Low: every page took page 1's shape | Fixed: each page takes its own shape once drawn |
| 11 | Low: page labels used without printed-number confirmation when sampled pages have no text (scans) | Recorded, unchanged: the kickoff's rule is "labels first; ask only if neither is confident (scans)"; with no text, the labels are the only evidence |
| 12 | Low: a failed delete was silent; two renders at once could duplicate rows | Partly fixed: a message; two renders started together give one list. A render started while another is still reading covers could still add a second list (found after the merge): fixed in Release 1.1 |

## Retained test changes

While the Library page is present and enabled, three checks in three earlier harnesses observe it, in the patterns
those harnesses already use for later releases; removed or switched off, the original expectations apply verbatim.
No check is dropped and every total is unchanged (70, 25 and 14).

| Harness | Check | While the Library page is present |
|---|---|---|
| Phase 11 `qa/characters-harness.js` | `CL-TABS` | the Library tab holds the shelf instead of the "Phase 13" placeholder (the term Phase 14 added for the Search tab) |
| Phase 11.3 `qa/appbar-harness.js` | `AB-TO-LIBRARY` | the same, reached from the app bar |
| Phase 14.1 `qa/dependency-harness.js` | `F141-DEP-FACET-PAGE-OFF`, `F141-DEP-FACETS-OFF` | `LIBRARY_PAGE_ENABLED` joins `LATER_RENDER_WRAPPERS` (the Search Focus fix's term): the Library also wraps Search's render, so the facets-off variants switch it off to observe Phase 14's own function |

Pre-change copies are in `originals/`. **How they were found:** full run 1 (17 October, 17:28–17:45 UTC, logs
`qa/final-run-1/`) failed these three leaves (69/70, 24/25, 12/14; 5,573/5,577) and stopped before the retained stage.
The cause was this layer's intended change, not a fault in the sheet: the three harnesses had not been run with the
layer before the suite, the lesson already in `CLAUDE.md`. With the corrections the three leaves pass on the
candidate (70/70, 25/25, 14/14) and on `main` (the same), `qa/touching-run.log`; the other leaves that read the
Characters screen, the app bar or Search had all passed in run 1.

- `QA — Removal Chain Registry/removal_chain.py`: this release's entry at the end of `CHAIN`.
- `QA — Removal Chain Registry/qa/test-chain.py`: `'PART K — Phase 13 Library'` in `companions` (its second
  script fragment, as Search, App Bar and Facets have).
