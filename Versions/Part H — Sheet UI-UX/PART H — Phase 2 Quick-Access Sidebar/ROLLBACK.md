# Rolling back Part H, Phase 2

## Why this isn't "delete the folder"

Like Phase 1 and Phase 1.6 before it, this phase's actual diff lives inside Phase 0's own
fragments — the toggle button and panel markup, their CSS, the panel's own render/open/close
logic, and the four extra live-update calls all live in `src/`, not in this folder. Deleting
this folder removes the documentation, the rollback path, and the tests, but leaves Phase 0's
fragments exactly as this phase left them. **Restoring the fragments from `originals/` is the
actual rollback step.**

## One file is new, not edited — restore it by deleting it

Five of the six touched files existed before this phase and have a pre-edit copy in
`originals/`. The sixth, `src/sheet/206-feat-quick-access-sidebar.js`, did not exist at all
before this phase — there is no earlier version of it to restore. Rolling it back means
**deleting the file**, not copying anything over it.

```bash
cd "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability"
PH="../../Part H — Sheet UI-UX/PART H — Phase 2 Quick-Access Sidebar/originals"

cp "$PH/src/markup/20-fixed-layers.html"         src/markup/
cp "$PH/src/sheet/110-modals-trackers.js"        src/sheet/
cp "$PH/src/sheet/210-test-seam-and-init.js"     src/sheet/
cp "$PH/src/css/10-sheet-base.css"               src/css/
cp "$PH/build/manifest.json"                      build/manifest.json
rm src/sheet/206-feat-quick-access-sidebar.js

python3 build/recombine.py --verify
```

`--verify` should report **BYTE-IDENTICAL** against the restored `expect_sha256` — that
confirms the rollback is complete, not just "the files look old." The restored
`manifest.json` carries the pre-Phase-2 hash
(`b0cbe6efda7ed2518d66173ca9bdab6a32661a432ad0300aa93510d6f23954a2`, the same hash the Spell
Slots Tab Visibility Race bugfix ended on), so a mismatch here means a fragment was missed —
most likely forgetting to delete `206-feat-quick-access-sidebar.js`, since a stray fragment
file is not itself listed in `manifest.json` and so causes no error on its own, it just sits
there unused. Confirm it's gone with:

```bash
ls src/sheet/206-feat-quick-access-sidebar.js   # should report "No such file or directory"
```

Then, from the repo root:

```bash
python3 build.py --check-drift
```

## What that leaves

- **Everything before this phase, untouched.** These six files (five restored, one deleted)
  are the *only* files this phase touched anywhere in the repository.
- **The Quick Access toggle button and panel disappear entirely** — the markup, the CSS, and
  the JS that rendered, opened, closed, and live-updated it are all gone with the
  restored/deleted files above.
- **The four narrow-render-function hooks go with it.** `renderVoidPips()`, `renderWounds()`,
  `renderSpellPips()` and `renderSpellBonusPips()` in `110-modals-trackers.js` each gained one
  line calling `renderQuickAccessPanel()` — restoring this file's pre-edit copy removes all
  four along with everything else this phase added there. Nothing about Void, Wounds, or Spell
  Slots (base or bonus) behaviour itself changes; only the (now-deleted) panel was reading from
  them.
- **Phase 0.5, 0.6 and 0.7 need no changes at all.** They build from Phase 0's output,
  whatever that output currently is; reverting Phase 0's fragments and rebuilding is all a full
  rollback requires. Re-run `python3 build.py` from the repo root and (if a new APK matters)
  Phase 0.7's `build/build_android.py`, exactly as after any other change to Phase 0's source.

## Confirming the rollback matches this phase's own starting point

This phase's own harness (`qa/quick-access-sidebar-harness.js`) is written against the rebuilt
sheet and will error outright against a rolled-back build (`document.getElementById('quickAccessPanel')`
returns `null`) — expected, not something to chase. What should still pass is everything
upstream:

```bash
python3 build.py --check-drift                    # from the repo root
python3 "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/qa/inventory.py" \
  "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html"
```

The inventory's `element_id_count` should read back to the pre-Phase-2 figure of **240** —
this phase added exactly eleven new static elements (the toggle button, the panel, its close
button, the seven base value/pip elements, and the `qaSpellBonusValue` subline added after
real-device feedback — see the README's "The Bonus line").

## Restore points

| Artefact | Value |
|---|---|
| Phase 0 build `sha256`, before this phase (= end of the Spell Slots Tab Visibility Race bugfix) | `b0cbe6efda7ed2518d66173ca9bdab6a32661a432ad0300aa93510d6f23954a2` |
| Phase 0 build `sha256`, after this phase (current, includes the Bonus-line addition) | `0361d7e2e07936b40d83d2022a95ff74aa47adc6d10ad7039888a7e85e65464b` |
| `element_id_count`, before | 240 |
| `element_id_count`, after | 251 |
| `section_count` / `roll_modal_overlay_count` | unchanged: 10 / 23 |
| `window.__L5R_TEST__` key count, before | 286 |
| `window.__L5R_TEST__` key count, after | 294 (+`renderQuickAccessPanel`, `isQuickAccessPanelOpen`, `openQuickAccessPanel`, `closeQuickAccessPanel`, `toggleQuickAccessPanel`, `initQuickAccessPanel`, `publishTopbarHeight`, `renderAllSpellSlots`) |
| `window.__L5R_CAROUSEL__` method count | unchanged: 11 |
| Website page `sha256` (Phase 0.6) | `bae445d5964b9b845f3a856eccc52dfbbe69510e6df2c9630d117f7d779dd495` |
| Android staged page `sha256` (Phase 0.7) | identical to the website's |

Three intermediate builds existed briefly during this phase's own development and were never
promoted to `main`: `47b113bfda6b5bf36e76b1e07df0ca2d1d47e20d6afe2614099569cc015b3bbe` (panel
built and wired to `recalcAll()` only — before the first live-update gap was found),
`4fd09a3e63215daa68dc79cc2679a07d0f61e2f149c035c23703faf8ec1a11f9` (the first three narrow-hook
fixes applied, before `renderAllSpellSlots` was added to the test seam), and
`ea981369d87d9a00d0db83b1a2aed56ec56129a635bacd211b84e22ee6d12ae5` (the version actually
promoted to `main` and built into an APK, before the Bonus line was added — see the README).
The first two were never shipped; the third **was** shipped and superseded by this phase's
current state, listed here only so none of the three are mistaken for a rollback target if they
turn up in local build artifacts or git history.

If a restored build's `element_id_count` or seam key count lands anywhere other than the
"before" row above, either a fragment copy was missed or `206-feat-quick-access-sidebar.js`
was not deleted — recheck the six-item list.
