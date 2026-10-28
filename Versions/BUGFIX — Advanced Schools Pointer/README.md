# Advanced Schools Pointer

**Status, 28 October 2026:** built for Release 7b.1 on branch `claude/release-7b1-2026-10-28`; not merged. Own checks 12/12 on the candidate; removal 6/6; every pinned variant matched. The release's QA folder is `QA — Release 7b.1 2026-10-28`.

Your ruling R16 (desk review, 23 October 2026). A line under Identity's Schools field says where the Advanced Schools are (the Techniques page) and whether one can be joined, with a Go to Advanced Schools button that opens the Techniques page at the panel. Nothing moves.

## How it is built

A UI-agnostic logic part and a replaceable UI part, behind one switch: `SCHOOL_POINTER_ENABLED = true` in the first fragment. No save state; nothing is added to a saved character.

- `src/sheet/209.9999999999993-bugfix-school-pointer-logic.js`
- `src/sheet/209.9999999999994-bugfix-school-pointer-ui.js`
- `src/css/59.9999999979-bugfix-school-pointer.css`
- Test seam: the `pointer-seam` block in `src/sheet/210-test-seam-and-init.js`.

## Checks

- `qa/school-pointer-harness.js`: 12/12 on the candidate. On main every check but the error check fails, as pinned.
- Pinned negative variants (`qa/variants.json`, written before the first run; `qa/verify-variants.py`, results in `qa/negative/`):
- **main (baseline):** fails exactly 11 pinned checks.
- **disabled:** fails exactly 11 pinned checks.
- **wrong-page:** fails exactly 1 pinned check.
- **held-text:** fails exactly 1 pinned check.
- **no-honor-listen:** fails exactly 1 pinned check.
- Removal (`qa/test-removal.py`): 6/6. Later layers come off first through the removal-chain registry; this layer's remover then rebuilds its predecessor exactly: `f57674f67b6081e7ab42d3ed4a53f52607fc980bd84c5ac20cf1957bca2cf501`, 17,368,411 bytes.
