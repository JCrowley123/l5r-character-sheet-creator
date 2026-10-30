# Undone Change Not Unsaved Work

**Status, 30 October 2026:** built for Release 8a on branch `claude/release-8a-xp-gate-load`; not merged. The release's QA
folder is `QA — Release 8a 2026-10-30`.

The audit log's finding 4 from the Release 7c review (`QA — Release 7c 2026-10-29/REVIEW-FINDINGS.md`), which you asked on
30 October to have fixed: on a sheet not yet saved as a character, a change undone (Taint 0 → 1 → 0, say) left two
History entries, and because the History is part of what the sheet saves, opening another character then asked
"This sheet has not been saved. Opening another character will discard it." over a sheet that was back as it started.

Now an undone change no longer leaves the sheet looking changed. The question "is there unsaved work on this sheet?"
compares the sheet with the untouched one with the History left out of both. The History itself keeps both entries, and
everything else is unchanged: a sheet that really has changed is still asked about, and a saved character's autosave
still saves its History.

## How it is built

One fragment behind one switch, `UNDONE_CHANGE_CLEAN_ENABLED = true`:
`src/sheet/209.999999999999997-bugfix-undone-change-unsaved.js`, with `AU8Logic` (a saved sheet's text without its
History) and `AU8` (wraps the Characters list's `CL11.confirmDiscard`, which every list action over an unsaved sheet
asks first). Test seam: the `undone-change-seam` block in `src/sheet/210-test-seam-and-init.js`. It needs the
Characters list (Phase 11, Part K) and the audit log (Phase 7.1, Part J), and switches itself off without either.

## Checks

- `qa/undone-change-harness.js`: 6 checks. A pinned check reproduces the finding first (AU-UNDONE-NO-QUESTION: on main it
  asks; it fails there as pinned), then the History keeps both entries, a real change is still asked about, and the
  logic.
- Pinned variants (`qa/variants.json`, committed before the first run): main (7c.1, the baseline) fails 3; the switch off
  2; history-not-left-out 2; always-unchanged 1 (`qa/negative/`).
- Removal (`qa/test-removal.py`).

No older check changed.
