# Rolling back Part H, Phase 1

## Why this isn't "delete the folder"

Like Phase 1.6, this phase's actual diff is inside Phase 0's own fragments — a colour accent
on the Rings tab and a scroll-to-top button both need to be wired into markup, CSS, and the
sheet's own `recalcAll()`/`init()`, which live in `src/`, not in this folder. Deleting this
folder removes the documentation, the rollback path, and the tests, but leaves Phase 0's
fragments exactly as this phase left them. **Restoring the fragments from `originals/` is the
actual rollback step.**

## One file is new, not edited — restore it by deleting it

Four of the five touched files existed before this phase and have a pre-edit copy in
`originals/`. The fifth, `src/sheet/205-feat-ui-foundations.js`, did not exist at all before
this phase — there is no earlier version of it to restore. Rolling it back means **deleting
the file**, not copying anything over it.

```bash
cd "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability"
PH="../../Part H — Sheet UI-UX/PART H — Phase 1 UI-UX Foundations/originals"

cp "$PH/src/markup/20-fixed-layers.html"         src/markup/
cp "$PH/src/sheet/110-modals-trackers.js"        src/sheet/
cp "$PH/src/sheet/210-test-seam-and-init.js"     src/sheet/
cp "$PH/src/css/10-sheet-base.css"               src/css/
cp "$PH/build/manifest.json"                      build/manifest.json
rm src/sheet/205-feat-ui-foundations.js

python3 build/recombine.py --verify
```

`--verify` should report **BYTE-IDENTICAL** against the restored `expect_sha256` — that
confirms the rollback is complete, not just "the files look old." The restored
`manifest.json` carries the pre-Phase-1 hash
(`a8e9851dc783b3eb02a4de6508937863049781c256b71efcc2e426030d7cedd3`, the same hash Phase 1.6
ended on), so a mismatch here means a fragment was missed — most likely forgetting to delete
`205-feat-ui-foundations.js`, since a stray fragment file is not itself listed in
`manifest.json` and so causes no error on its own, it just sits there unused. Confirm it's
gone with:

```bash
ls src/sheet/205-feat-ui-foundations.js   # should report "No such file or directory"
```

Then, from the repo root:

```bash
python3 build.py --check-drift
```

## What that leaves

- **Everything before this phase, untouched.** These five files (four restored, one deleted)
  are the *only* files this phase touched anywhere in the repository.
- **The scroll-to-top button disappears entirely** — the markup, the CSS, and the JS that
  wired it are all gone with the restored/deleted files above.
- **Nothing changes for the Rings tab or the Applied School badge either way.** The Ring
  accent this phase originally added was already reverted before this rollback procedure would
  ever be needed (see the README's "Reverted: the Ring accent") — the `originals/` copies in
  this folder predate that feature entirely, so restoring them is a no-op for the Rings tab,
  not a second change.
- **Phase 0.5, 0.6 and 0.7 need no changes at all.** They build from Phase 0's output,
  whatever that output currently is; reverting Phase 0's fragments and rebuilding is all a full
  rollback requires. Re-run `python3 build.py` from the repo root and (if a new APK matters)
  Phase 0.7's `build/build_android.py`, exactly as after any other change to Phase 0's source.

## Confirming the rollback matches this phase's own starting point

This phase's own harness (`qa/ui-foundations-harness.js`) is written against the rebuilt
sheet and will fail loudly (or error outright, since `window.__L5R_TEST__.scrollToTop` etc.
will no longer exist) against a rolled-back build — expected, not something to chase. What
should still pass is everything upstream:

```bash
python3 build.py --check-drift                    # from the repo root
python3 "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/qa/inventory.py" \
  "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html"
```

The inventory's `element_id_count` should read back to the pre-Phase-1 figure of **239** (this
phase added exactly one new static element, `scrollTopBtn`; the Ring accent's corner tag is
created/removed at runtime by JS, so it was never counted here to begin with).

## Restore points

| Artefact | Value |
|---|---|
| Phase 0 build `sha256`, before this phase (= end of Phase 1.6) | `a8e9851dc783b3eb02a4de6508937863049781c256b71efcc2e426030d7cedd3` |
| Phase 0 build `sha256`, after this phase (post-revert, current) | `387eeb4427029f659dd51164a533bc19746fe2ce9a28cbe17a09b098cf147354` |
| `element_id_count`, before | 239 |
| `element_id_count`, after | 240 |
| `section_count` / `roll_modal_overlay_count` | unchanged: 10 / 23 |
| `window.__L5R_TEST__` key count, before | 282 |
| `window.__L5R_TEST__` key count, after | 286 (+`getActiveCarPage`, `scrollToTop`, `updateScrollTopVisibility`, `initScrollToTop`) |
| Website page `sha256` (Phase 0.6) | `bbf4c9366e8134c654141d66b4b743a150416359142f9b6613b703d1cd44c7c6` |
| Android staged page `sha256` (Phase 0.7) | identical to the website's |

An intermediate build existed briefly, between this phase's initial ship and the Ring-accent
revert, with `sha256` `4b26a7caa394ac7d01024b99cf014b34d357c2eeb8b69a586db1b66d2dd1bfdf` and
288 seam keys (the two extra being `ringAffinityStatus`/`renderRingAffinityAccents`). It was
promoted to `main` and built into one APK release before being superseded by the revert above
— listed here only so that hash isn't mistaken for a rollback target if it turns up in git
history or an old build artifact.

If a restored build's `element_id_count` or seam key count lands anywhere other than the
"before" row above, either a fragment copy was missed or `205-feat-ui-foundations.js` was not
deleted — recheck the five-item list.
