# Rolling back the Spell Slots Tab Visibility Race bugfix

## Why this isn't "delete the folder"

Like every feature phase since Phase 0's split, this bugfix's actual diff is inside Phase 0's
own fragments (`src/layer/10-carousel.js`, `src/sheet/110-modals-trackers.js`) — it has to be,
since the code being changed lives there. Deleting this folder removes the documentation, the
rollback path, and the tests, but leaves Phase 0's fragments exactly as this fix left them.
**Restoring the fragments from `originals/` is the actual rollback step.**

## What to restore

Both touched files existed before this fix and have a verbatim pre-edit copy here.

```bash
cd "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability"
BF="../../BUGFIX — Spell Slots Tab Visibility Race/originals"

cp "$BF/src/layer/10-carousel.js"          src/layer/
cp "$BF/src/sheet/110-modals-trackers.js"  src/sheet/
cp "$BF/build/manifest.json"                build/manifest.json

python3 build/recombine.py --verify
```

`--verify` should report **BYTE-IDENTICAL** against the restored `expect_sha256`
(`b4f27784fd5633a0e8d9950060192832ca47c28753a5186f0e2d83be9ea22702` — the hash from the end
of Part H, Phase 1, immediately before this bugfix). A mismatch means a fragment was missed.

Then, from the repo root:

```bash
python3 build.py --check-drift
```

## What that leaves

- **Everything before this fix, untouched.** These two files are the *only* files this
  bugfix touched anywhere in the repository.
- **`window.__L5R_CAROUSEL__.refreshVisibility()` disappears.** `watchVisibility()`'s own
  `MutationObserver` — untouched by this fix either way — keeps working exactly as it did
  before, for Spell Slots and any other conditional page. The race window this fix closed
  (see the README) reopens: code that inspects the tab bar in the same synchronous stretch
  as a visibility-changing call can once again see stale state until the next microtask.
- **Phase 0.5, 0.6 and 0.7 need no changes at all.** They build from Phase 0's output,
  whatever that output currently is; reverting Phase 0's fragments and rebuilding is all a
  full rollback requires. Re-run `python3 build.py` from the repo root and (if a new APK
  matters) Phase 0.7's `build/build_android.py`, exactly as after any other change to
  Phase 0's source.

## Confirming the rollback matches this fix's own starting point

This fix's own harness (`qa/spell-slots-visibility-harness.js`) is written against the fixed
build and its first and last checks will fail (or error, since
`window.__L5R_CAROUSEL__.refreshVisibility` will no longer exist) against a rolled-back
build — expected, not something to chase; the harness's own header comment explains exactly
which checks that affects. What should still pass is everything upstream:

```bash
python3 build.py --check-drift                    # from the repo root
python3 "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/qa/inventory.py" \
  "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html"
```

Nothing in `element_id_count` or the `window.__L5R_TEST__` seam changes as a result of this
fix at all — the only surface this touches is `window.__L5R_CAROUSEL__`'s own method list,
which `qa/inventory.py` does not track. Phase 0's own `qa/behaviour-harness.js` does track it
(its `seams.carousel` field is `Object.keys(window.__L5R_CAROUSEL__).sort()`), so running that
against the rolled-back build and checking that field is 10 entries, without
`refreshVisibility`, is the direct confirmation:

```bash
NODE_PATH=$(npm root -g) node "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/qa/behaviour-harness.js" \
  "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html" \
  | python3 -c "import json,sys; c=json.load(sys.stdin)['seams']['carousel']; print(len(c), 'refreshVisibility' in c)"
```

## Restore points

| Artefact | Value |
|---|---|
| Phase 0 build `sha256`, before this fix (= end of Part H, Phase 1) | `b4f27784fd5633a0e8d9950060192832ca47c28753a5186f0e2d83be9ea22702` |
| Phase 0 build `sha256`, after this fix | `b0cbe6efda7ed2518d66173ca9bdab6a32661a432ad0300aa93510d6f23954a2` |
| `element_id_count` | unchanged: 240 |
| `section_count` / `roll_modal_overlay_count` | unchanged: 10 / 23 |
| `window.__L5R_TEST__` key count | unchanged: 286 |
| `window.__L5R_CAROUSEL__` method count, before | 10 |
| `window.__L5R_CAROUSEL__` method count, after | 11 (+`refreshVisibility`) |
| Website page `sha256` (Phase 0.6) | `e1719f7a4ff05bcca8e6cebe120cc1574425f09d5c0893e7b344041366db5cf4` |
| Android staged page `sha256` (Phase 0.7) | identical to the website's |

If a restored build's carousel method count is anything other than 10, or still includes
`refreshVisibility`, a fragment copy was missed — recheck the two-file list.
