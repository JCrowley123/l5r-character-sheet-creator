# Release 7b.1 — handover (28 October 2026, usage limit reached)

Branch `claude/release-7b1-2026-10-28` (nothing committed yet). Eight layers built, candidate `4861f953…`, 17,380,022 bytes.

Done:
- Own harnesses 77/77; again 77/77 at 4× CPU (`qa/under-load/`). Removal 6/6 for each layer; every pinned variant matched (29 runs).
- Removing all eight rebuilds main exactly (`55f9e9ed…`, 17,349,941).
- Suite runners for 6,442 candidate / 6,365 retained are written (`qa/`); not run yet.
- Roll-preview harness (Part G Phase 3), one check adapted to R7 by layer presence (`VR7?.enabled()`), as the Dark Paragon harness does for RP7.

Open:
1. Affected groups: `affected-1` (first 10) and `affected-2` (next 19) passed except `ancestors-harness.js`: ANC48-PAY-KUNI-SECOND-ASKED, -WITHOUT, -NO-VOID-SPENT fail. Likely R25 by design (a used gift can no longer be ticked); confirm, then adapt those checks by `AG7?.enabled()` the same way. The remaining affected groups after index 19 of `affected-rest.json` have not run.
2. The read-only reviewer was launched; its report may not have arrived. If not, run it again (one helper only).
3. Write each layer's README/ROLLBACK with the scratch script logic (`write_docs.py` pattern: numbers from `qa/own.log`, `qa/removal.log`, `qa/negative/summary.json`).
4. Then the full suite twice (`python -B qa/run-final-twice.py 1`, mains power), merge on the owner's word, live check, checklist doc, records.
