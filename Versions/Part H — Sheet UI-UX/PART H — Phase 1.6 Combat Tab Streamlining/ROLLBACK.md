# Rolling back Part H, Phase 1.6

## Why this rollback is not "delete the folder"

Every phase before this one — including all of Part F — could be undone by
deleting its own folder, because each one only ever *added* files beside an
untouched trunk. This phase cannot work that way: its actual change is inside
Phase 0's own source fragments (`renderWounds()` lives in
`src/sheet/110-modals-trackers.js`; there is no way to change what it renders
without editing the file it is defined in). See this folder's `README.md`,
*Why this phase's code lives in Phase 0, not here*, for why that is the
correct place for it rather than a bug in how this phase was built.

So: deleting this folder removes the documentation, the rollback path, and
the tests, but leaves Phase 0's fragments exactly as this phase left them.
**Restoring the fragments from `originals/` is the actual rollback step.**

## What to restore

Seven files, copied verbatim from this folder's `originals/` back over the
live Phase 0 tree, before this phase touched them:

```bash
cd "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability"
PH="../../Part H — Sheet UI-UX/PART H — Phase 1.6 Combat Tab Streamlining/originals"

cp "$PH/src/markup/10-swipe-tab-shell.html"      src/markup/
cp "$PH/src/sheet/110-modals-trackers.js"        src/sheet/
cp "$PH/src/sheet/160-feat-void.js"              src/sheet/
cp "$PH/src/sheet/180-feat-stances.js"           src/sheet/
cp "$PH/src/sheet/210-test-seam-and-init.js"     src/sheet/
cp "$PH/src/css/10-sheet-base.css"               src/css/
cp "$PH/src/css/60-sheet-print.css"              src/css/
cp "$PH/manifest.json"                            build/manifest.json

python3 build/recombine.py --verify
```

`--verify` should report **BYTE-IDENTICAL** against the restored
`expect_sha256` — that is what confirms the rollback is complete, not just
"the files look old." The restored `manifest.json` carries the pre-Phase-1.6
hash (`211b4e54e876657e3c8c119486bbc649f6e0621aaca10b6f978bbc117d7f1a64`), so
a mismatch here means a fragment was missed.

Then, from the repo root:

```bash
python3 build.py --check-drift
```

## What that leaves

- **Everything before this phase, untouched.** These seven files are the
  *only* files this phase edited anywhere in the repository. No other phase's
  folder, no other fragment, was touched.
- **The wound tracker reverts to the seven-card stack**, the Combat tab's two
  formula paragraphs reappear inline, the four sub-sections stop being
  collapsible, and the void-spend disabled-reason line moves back to sitting
  below all seven buttons in `voidPanelNote`. Nothing about *how* those things
  work changes — `computeWoundThresholds()`, `WOUND_LEVELS`,
  `getCurrentWoundLevelName()` and `getWoundPenalty()` were never touched by
  this phase in the first place, so reverting the rendering code around them
  changes nothing about wound classification or the roll pipeline either way.
- **Phase 0.5, 0.6 and 0.7 need no changes at all.** They build from Phase
  0's output, whatever that output currently is; reverting Phase 0's
  fragments and rebuilding is all a full rollback requires. Re-run
  `python3 build.py` from the repo root and (if a new APK matters) Phase
  0.7's `build/build_android.py`, exactly as after any other change to Phase
  0's source.

## Confirming the rollback matches this phase's own starting point

The QA harness this phase wrote (`qa/wound-bar-harness.js` in this folder) is
written against the *rebuilt* Combat tab and will fail loudly against a
rolled-back build — that failure is expected and is not something to chase.
What should still pass is everything upstream:

```bash
python3 build.py --check-drift                    # from the repo root
python3 "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/qa/inventory.py" \
  "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html"
```

The inventory's `element_id_count` should read back to the pre-Phase-1.6
figure of **227** (this phase added 13 new ids and removed one — `woundTrack`
— netting to 239; reverting removes exactly that net difference).

## Restore points

| Artefact | Value |
|---|---|
| Phase 0 build `sha256`, before this phase | `211b4e54e876657e3c8c119486bbc649f6e0621aaca10b6f978bbc117d7f1a64` |
| Phase 0 build `sha256`, after this phase | `a8e9851dc783b3eb02a4de6508937863049781c256b71efcc2e426030d7cedd3` |
| `element_id_count`, before | 227 |
| `element_id_count`, after | 239 |
| `section_count` / `roll_modal_overlay_count` | unchanged: 10 / 23 |
| `window.__L5R_TEST__` key count, before | 277 |
| `window.__L5R_TEST__` key count, after | 282 (+`formatWoundPenalty`, `showWoundInfoModal`, `WOUND_SEVERITY`, `populateInfoOverlay`, `showCombatFormulaInfo`) |

If a restored build's `element_id_count` or seam key count lands anywhere
other than the "before" row above, a fragment copy was missed — recheck the
seven-file list.
