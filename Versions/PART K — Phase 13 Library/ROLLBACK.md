# Remove PART K — Phase 13 Library

Set `LIBRARY_PAGE_ENABLED` (in `src/sheet/209.99999999992-feat-library-page.js`) to `false` and reload: the Library
tab shows the app's placeholder again ("The sourcebook Library arrives in Phase 13."), Search's citations are plain
text and PDF.js is never started. `LIBRARY_ENABLED` (in `src/sheet/209.99999999991-feat-library.js`) set to `false`
turns the logic off, so the page installs nothing either. Books already added stay in the device's own `l5r-library`
database, unread, until the switch is turned back on (since Release 2a the database is version 2, with a `prefs`
store holding the shelf's List or Grid choice). Character saves are never touched: they are in localStorage.

## Surgical removal

| Location | Owned item |
|---|---|
| `src/sheet/209.99999999991-feat-library.js` | whole fragment and its `build/manifest.json` entry |
| `src/sheet/209.99999999992-feat-library-page.js` | whole fragment and its manifest entry |
| `src/css/59.9999892-feat-library.css` | whole stylesheet and its manifest entry |
| `src/vendor/13-library-vendor-{open,worker,jpx,nowasm,close}.html` | five boundary fragments (each marked `<!-- PART K PHASE 13 library-vendor-<name> -->`) and their entries |
| `src/vendor/pdfjs-6.4.299-pdf.min.mjs`, `-pdf.worker.min.mjs`, `-openjpeg.wasm.b64`, `-openjpeg_nowasm_fallback.js` | verbatim PDF.js files, checked by SHA-256, and their entries |
| `src/vendor/licenses/` | three licence files (not in the manifest), checked by SHA-256 |
| `src/sheet/210-test-seam-and-init.js` | `library-seam` |

The seam block begins `// PART K PHASE 13 BEGIN library-seam` and ends `// END LIB13 library-seam`.

1. Copy the Phase 0 folder to a scratch directory (the remover refuses the live tree).
2. Remove later releases first, newest first (`QA — Removal Chain Registry/removal_chain.py`).
3. `python -B qa/remove-phase.py <scratch> --dry-run`, inspect, then run it without `--dry-run`. With no later
   releases present, add `--expect-sha f39a31cbe31e9e8ad923f557275e1d613920fe98868a67ccc74cdd342fd3fec0`
   (PART I — Phase 4.5.36 Weakness and the Curse of Hotei, 3,935,889 bytes).
4. Rebuild with `build/recombine.py --verify` and run Phase 4.5.36's suite (5,511). Then apply the same removal to
   the working branch, delete this layer's entry from `CHAIN` and its line in the registry's `qa/test-chain.py`
   `companions`, and delete this folder.

Devices that used the Library keep the `l5r-library` database after the code is gone; nothing reads it, and clearing
the site's data in the browser removes it.

## Dependencies

- **Phase 11 (Characters list, `CL11`)** owns the Library tab; the page mounts in its panel by wrapping `CL11.build`.
- **Phase 14 (Search, `SEARCHPAGE14`)**: the page wraps `SEARCHPAGE14.render` to link citations of books on the
  shelf and, since Release 2a, to mark the others "not in Library". Without Search there are no links; the shelf and
  the reader still work.
