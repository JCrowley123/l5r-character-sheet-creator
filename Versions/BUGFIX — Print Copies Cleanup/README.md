# BUGFIX — Print Copies Cleanup

Built 14 October 2026 (Cycle 1, Layer 5). **A fix found by the cycle's failing-test investigation, outside the
approved scope; brought to the owner as a small removable fix (owner's rule).** After printing, no Export to PDF
print copy is left behind.

## The defect

Export to PDF (Phase 11.1) places a printable copy after each sheet text box on `beforeprint` and removes the copies
it recorded on `afterprint`. The carousel keeps clones of its edge pages and re-copies them (`cloneNode(true)`) when it
settles after a resize. If that happens **while printing**, the new clone carries copies and hidden text boxes that
Export to PDF never recorded, and they stay. Chrome's print preview does not block the page, so a real print can do
this; the copies are invisible, but the clone's text boxes stay hidden until the clone is next re-copied.

This is why `PDF-PRINT-REMOVES-MIRRORS` (Phase 11.1) failed in a loaded full-suite run: its print window was slow
enough for the clone refresh to land inside it. Reproduced deterministically on `main`: start printing at phone width,
widen the window, wait 600 ms, finish printing: **8 copies remain**.

## The fix

`src/sheet/209.9999999991-bugfix-print-copies-cleanup.js` (`PRINTCOPIES`) adds its own `afterprint` listener, after
Export to PDF's, that removes every remaining `.pdf111-print-text` and clears every remaining `pdf111-text-source`
class. Export to PDF's code is unchanged and still restores its recorded copies first.

## Verification (14 October 2026)

| Check | Result |
|---|---|
| `qa/print-copies-harness.js` | **6/6** on the candidate; **2/6 on `main`**: the clone case and the real resize sequence each leave 8 copies, and the cloned text boxes stay hidden |
| Negative variants | **4/4 pinned**: baseline (4), disabled (4), no class sweep (3), no copy sweep (2) |
| Export to PDF harness | **33/33** on the candidate |
| Removal proof | **6/6**: rebuilds Layer 4's build exactly (3,827,453 bytes, `c28339fc…`) |
| Registry | **11/11** |

Candidate: **3,828,819 bytes**, SHA-256 `35416333eaaf38d60cdd2fe8b2b6ca39a02d2471021599ee8e9217717e2fdad1`.

`qa/current-suite-runner.js` chains Layer 4's suite (5,223) and adds 6: **5,229**.
