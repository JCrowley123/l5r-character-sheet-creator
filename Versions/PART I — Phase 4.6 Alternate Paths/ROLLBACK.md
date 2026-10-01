# ROLLBACK — PART I — Phase 4.6 Alternate Paths (three releases)

The first release (18 Great Clan Paths), the second (9 Miscellaneous Paths, several Paths in one
School) and the third (the other books' 175 Paths) share one fragment and one seam block, and are
removed together.

## Surgical removal (the method)

On a **scratch copy** of the Phase 0 tree, never the live one:

```bash
python "Versions/PART I — Phase 4.6 Alternate Paths/qa/remove-phase.py" <copy> [--dry-run] [--expect-sha SHA]
python <copy>/build/recombine.py
```

It removes exactly:

| What | Where |
|---|---|
| `src/sheet/209.999993-feat-alternate-paths.js` | the whole fragment, and its manifest entry |
| the `alternate-paths-seam` block | `src/sheet/210-test-seam-and-init.js`, delimited `// PART I PHASE 4.6 BEGIN alternate-paths-seam` … `// END PATHS46 alternate-paths-seam` |

Nothing else. The fragment is delimited `PART I PHASE 4.6` … `END PART I PHASE 4.6`. The trunk
functions it rebinds from that fragment (`pathClauseMatches`, `getPathTaken`, `savePathTaken`,
`pathsTaken`, `unlockTechniques`, `pathRequirementsUnmet` and (third release) `assertPathSchoolsResolve` in
`070-schools-paths-techniques.js`;
`kihoEntitlement`, `renderPathPicker`, `kihoEligibility`, `cumulativeMonkShugenjaRank` and
`effectiveSchoolRankForElement` in `050-kiho-rules.js`; `makeRollContext` in
`130-round-and-pipeline.js`; `getMirumotoRank` in `140-feat-mirumoto-dualwield.js`) are never edited,
so with the fragment gone they act exactly as before. The second release swaps the `#pathPicker`
element for a copy without the trunk's change handler; with the fragment gone the original element and
its handler are simply never replaced. The 202 Paths of the three releases and their Technique descriptions are added to
the trunk's `ALTERNATE_PATH_LIBRARY` and `TECH_DESCRIPTIONS` at load by the fragment, so they go with
it. The remover preflights everything before writing, refuses the fragment holding any other marker,
refuses any retained source that still names this phase's marker or its surface (`AP46`,
`ALTERNATE_PATHS_ENABLED`, any `ap46…` name, or the format step's name), and refuses the live tree,
its parents, a symbolic link, and any file that is the live tree's own file under another name.

**Measured on 1 October 2026:** removal rebuilds **byte-identical** to `main` before this phase,
`4551175ef8c697742c4a704047b1e3e5f306c61a532dd94a4d34d3f47c3f6643`, 3,264,762 bytes (`fbd53de`), on
the first attempt. The remover's fixtures: `qa/test-removal.py`, 21 tests, 20 passed, 1 skipped (the
symlink test; Windows refuses symlinks without Developer Mode). **Third release, measured the same
night:** all three releases together still rebuild byte-identical to `4551175e…`.

**Kill switch:** `ALTERNATE_PATHS_ENABLED` in the fragment. Off, the sheet is `main`'s in behaviour:
the 12 Monk Paths only, the record read by Rank, the Kiho walk as it was, and no format step (so the
sheet writes and reads the format before this phase).

## What removing it does

- The 202 Paths of the three releases leave the picker (the 12 Monk Paths stay). A character who took one keeps its Technique row (it is a
  row in the Techniques list), but the picker no longer lists the Path.
- **Saved data.** This phase adds one step to the save-format chain (Phase 7, Part J): a save written
  with it is one format newer (format 4 with Phase 4.5.2 installed) and its `f_pathTaken` is keyed by
  School, `{"<School>": {"<Rank>": "<Path>"}}`. A build without this phase **refuses** that save, with
  Phase 7's existing message for a newer save. That is by design: the older reader would take the
  School names for Ranks and silently lose every Path. Saves the owner has not opened since this
  phase are unaffected (they are only upgraded when opened, copied or exported, per the owner's
  ruling of 30 September).
- The kickoff's risk 1 returns: a Path taken in a first School replaces a later School's Technique at
  the same Rank.
- A monk's first Path again gives the usual two Kiho at its Rank (Core p. 246 says one).

## Dependencies (all soft, all guarded)

| On | What it uses | Without it |
|---|---|---|
| The Alternate Path engine (trunk, `070`, `050`) | rebinds eight functions; pushes into `ALTERNATE_PATH_LIBRARY` and `TECH_DESCRIPTIONS` | core sheet code, always present |
| Multiple Schools (trunk, `070`) | `getSchoolsList()` for the order Schools were taken | core sheet code |
| Phase 7 (Part J), save format | `VersionManager.register()` for the format step | no step is registered (guarded by `typeof` and `enabled()`); an old record is still read per School at runtime |
| Phase 4.5.2 (Part I) | nothing directly; its format step is the one before this phase's when installed | measured: switched off, the step follows the shorter chain and the harness is fully green |
| Phase 12 (Part K) | nothing (its Play mode locks `#pathPicker`, as before) | measured: modes switched off, fully green |

**Removal order.** Phase 7's remover refuses while this phase is present, because this fragment
names `VersionManager`; remove this phase first. The shared removal chain does so: this phase is
registered in `QA — Removal Chain Registry` after BUGFIX — Ancestor Corrections. Phase 7's ROLLBACK
names this phase. Copies of `removal_chain.py`, Phase 7's ROLLBACK, `210-test-seam-and-init.js` and
`build/manifest.json` from before this phase are in `originals/`.

## Retained checks this phase corrected (test-only)

See the README: four retained checks pinned the save format at 3. Each now expects one format more
while this phase's step is registered, and reads exactly as before without it. Their originals are in
`originals/`.
