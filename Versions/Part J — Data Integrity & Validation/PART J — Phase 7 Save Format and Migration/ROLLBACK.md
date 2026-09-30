# Rollback — PART J Phase 7, Save Format and Migration (first release)

## Surgical removal (the method)

Work on a **scratch copy** of the Phase 0 tree, never the live one (the remover refuses it):

```bash
python "Versions/Part J — Data Integrity & Validation/PART J — Phase 7 Save Format and Migration/qa/remove-phase.py" <scratch copy>
python <scratch copy>/build/recombine.py --verify
```

It removes exactly:

| Where | What |
|---|---|
| `src/sheet/209.99997-feat-save-format.js` | The whole fragment (VersionManager and its wrappers) |
| `build/manifest.json` | That fragment's entry; `expect_sha256` recalculated from what remains |
| `src/sheet/120-persistence.js` | Block `save-format-download` (3 lines at the top of `exportJSON()`) |
| `src/sheet/210-test-seam-and-init.js` | Block `save-format-seam` (the guarded `Object.assign` of `SAVE_FORMAT_ENABLED` and `VersionManager`) |

Then, **outside the Phase 0 tree**, delete this release's entry at the end of `CHAIN` in
`Versions/QA — Removal Chain Registry/removal_chain.py`, and this folder.

**Measured:** removed from a scratch copy of the live tree, the rebuild is **byte-identical to the
pre-release build**: `23df67a7cd16b86802cc22967ea5af5fe586fdaccfa504ac79a7b28067734896`,
3,117,804 bytes (`main` at `f2348ab`). `qa/test-removal.py`: 20 tests, 19 pass, 1 skipped (Windows
refuses to create symlinks without Developer Mode).

After removal, saves go back to carrying whatever number the layers below write (3 with Phase
4.5.2), older imports are stored exactly as picked, and export names lose accented letters.
Nothing already stored needs undoing: every save this release wrote is an ordinary format-3 save
the older layers read.

## Kill switch

`const SAVE_FORMAT_ENABLED = true;` at the top of the fragment. `false` installs none of the
wrappers and makes `saveFormatDownload()` decline, so the build behaves as if the part were absent
(the harness's `--absent` expectations pass on it).

## Dependencies — declared

- **On Phase 4.5.2 (Part I), soft.** The step from format 2 to 3 is `D45.migrate`, registered only
  while 4.5.2 is installed and enabled; `innerFormat()` reads `D45.SAVE_SCHEMA_VERSION`. Without
  4.5.2 the chain ends at format 2 and everything still works (verified: the `--no-d45` boundary).
  4.5.2's fragment is not edited.
- **On Phase 11 (Part K), soft.** The phone's share-sheet file name is set by replacing
  `CL11.fileName`, guarded on `CL11` existing. Import and Save As a copy are covered through
  `storageSet()`, a trunk function, so they need no Phase 11 code of this release's. Without Phase
  11 the rest still works (verified: the `--no-list` boundary).
- **Who depends on this:** nothing yet. A later release that changes the save format should
  register its step with `VersionManager.register()`; it then depends on this release and must say
  so here.
- **On the trunk:** wraps `collectData`, `applyData`, `storageSet` and `exportJSON` by name at load,
  as Phases 4.5.2 and 11 already do. Normal, needs no declaration.

## Whole-file fallback

Not provided. `originals/` snapshots go stale as later phases add blocks to the same files; the
surgical method above is the way.
