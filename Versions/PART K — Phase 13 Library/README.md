# PART K — Phase 13 Library, Release 1: the iPhone feasibility test

Built from the approved [Library Mock-ups v2](https://claude.ai/artifact/BkdJwpc9xFia9tRvBBBJrU) and the owner's word of
17 October 2026: Release 1 as proposed (14–20 points, stop line 20, cap 22) with the two storage messages. One
removable layer. The app carries no book text: only the owner's own PDFs, copied into the device's own storage.

Release 1 holds: Add a book for one PDF (recognition, page matching, cover), stored on the device; a minimal shelf
(list rows, ⋯ with Delete only, the storage line); the reader (scrolling pages, the printed-page jump); the link from
a Search citation to the printed page (Athletics, Core Rulebook p.139) and back. Release 2 holds the rest (grid,
the full ⋯ menu, Change cover, Chapters, Search in book, not in Library, File missing, desktop layouts).

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
| `src/vendor/` | PDF.js (verbatim), `openjpeg.wasm` as base64, four boundary fragments, `licenses/` |
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
| 12 | Low: a failed delete was silent; two renders at once could duplicate rows | Partly fixed: a message; two renders started together give one list. A render started while another is still reading covers can still add a second list (found after the merge): Release 2, which rebuilds the shelf |

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
