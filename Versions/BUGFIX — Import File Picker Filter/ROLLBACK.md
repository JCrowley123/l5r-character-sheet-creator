# ROLLBACK — BUGFIX: Import File Picker Filter

**Removing this fix restores the defect:** both Import controls offer JSON files only again, and
an iPhone cannot pick a save named `.l5r`.

## Restore point

| | |
|---|---|
| Pre-fix build | `480e1a157c4f9a1ad259e4d141d2e262e574da3926909a7d7393f878b6fae890`, 3,060,080 bytes, commit `d07b03f` |
| Post-fix build | `738c7ccfa3bdf67a6ca160371508fe22521cac845b883119b95a5a4e9490958a`, 3,062,010 bytes |
| Removal rebuild | **byte-identical to the pre-fix build**, measured |

## What it adds

All in `Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for
Maintainability/`:

- `src/sheet/209.999-bugfix-import-file-filter.js`: `IMPORT_FILE_FILTER` and the switch
  `IMPORT_FILE_FILTER_FIX_ENABLED`. It removes `accept` from `#fileImport` at load and rebinds
  `CL11.build` by property to remove it from `#cl11ImportFile` after each build.
- One manifest entry, after Phase 11.2.4's.
- One delimited block in `src/sheet/210-test-seam-and-init.js`:
  `// BUGFIX IMPORTFILTER BEGIN import-filter-seam` … `// END IMPORTFILTER import-filter-seam`.
- `expect_sha256` in `build/manifest.json`.

No markup, stylesheet or save-format change.

## Remove it

On a scratch copy of the Phase 0 tree (the remover refuses the live tree):

```bash
cp -r "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability" /tmp/p0
python3 "Versions/BUGFIX — Import File Picker Filter/qa/remove-phase.py" /tmp/p0
python3 /tmp/p0/build/recombine.py --verify
```

Or set `IMPORT_FILE_FILTER_FIX_ENABLED = false`: nothing is changed or rebound.

## Dependencies

- **On the trunk:** `#fileImport` and its own import handler (`120-persistence.js`).
- **Soft, on Phase 11 (Part K, Characters List):** it wraps `CL11.build`, guarded. Without
  Phase 11 it lifts the toolbar control only. Phase 11's remover refuses while this fix is
  present (measured), so remove this fix first. Declared in Phase 11's ROLLBACK too.

## Fixtures it changed in other phases

`LATER_STAGES` in the `test-removal.py` of Phases 11, 11.2, 11.2.1, 11.2.2, 11.2.3 and 11.2.4 and
of the Kitsune [Mantis] fix, and in the `verify-variants.py` of the first five and of that fix,
now lists this fix first, so each removes it with its own remover before removing itself. All
pass (15/15, and 10/10 for the Kitsune fix). 11.2.4's `verify-variants.py` needed nothing: its
remover does not refuse while this fix is present, and its variants pin no hash. No harness
check changed.

## Depended on by

Nothing.

## Later-release list moved to the shared registry (25 September 2026)

This folder's removal fixtures no longer keep their own `LATER_STAGES` / `LATER_FIXES` lists. They
read the one shared list in [QA — Removal Chain Registry](../QA%20%E2%80%94%20Removal%20Chain%20Registry/README.md)
and strip every release built after this one, newest first, each by its own remover. A new release
registers itself there once instead of being added here. **This folder's live removal fixture now
depends on that registry**; its ROLLBACK says how to restore the old lists (verbatim copies are in
its `originals/`). The removal method for this release itself is unchanged.
