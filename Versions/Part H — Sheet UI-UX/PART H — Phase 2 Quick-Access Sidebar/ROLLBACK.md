# Rolling back Part H, Phase 2

## Dependencies

Per `CLAUDE.md`'s "Every feature must be surgically removable", declared here so a removal is
never a surprise. Verified with
`python3 qa/feature-dependencies.py src/sheet/206-feat-quick-access-sidebar.js "PART H PHASE 2" --also quickAccessPanel quickAccessToggleBtn quickAccessCloseBtn quick-access-toggle-btn quick-access-panel qa-topbar-h`
— clean, every reference sits inside a block this phase's own marker owns.

- **This phase depends on:** the trunk only — `renderVoidPips()`, `renderWounds()`,
  `renderSpellPips()`, `renderSpellBonusPips()` (which it hooks, to stay live), and the
  `#f_currentTN` / `#f_initiative` / `#woundSummaryLine` values it mirrors. Nothing removable.
  Its CSS comment mentions Phase 1's `.scroll-top-btn` to explain a shared visual language —
  a comment-only reference, not a dependency; if Phase 1 is removed, that sentence just goes
  stale.
- **Removable features that depend on this phase:** none.

## The safe way now: surgical removal (verified, order-independent)

This phase touches more shared files than Phase 1 (it hooks four render functions in
`110-modals-trackers.js`, not just the test seam), but every touch point is still delimited by
its own `PART H PHASE 2` comment marker, so the same surgical approach applies: delete this
phase's own fragment, its own manifest entry, its own CSS block, its own markup block, its own
four guarded hooks in `110-modals-trackers.js`, and its own guarded seam export + `init()` call
in `210-test-seam-and-init.js` — nothing that belongs to Phase 1 or Phase 9.

```bash
cd "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability"

rm src/sheet/206-feat-quick-access-sidebar.js
```

Then, in `build/manifest.json`, delete the one `fragments` entry whose `"file"` is
`"src/sheet/206-feat-quick-access-sidebar.js"`.

In `src/css/10-sheet-base.css`, delete everything from the
`/* ---------- PART H PHASE 2: Quick-Access panel ---------- */` header down to (but not
including) the next rule, `.manual-roll-note{` — the toggle button, the panel, and every
`.qa-*` rule, plus their one `@media(max-width:600px)` block.

In `src/markup/20-fixed-layers.html`, delete everything from the
`<!-- PART H PHASE 2: QUICK-ACCESS PANEL -->` comment down to (but not including) the next
element, `<div class="roll-modal-overlay" id="manualRollPromptOverlay" ...>` — the toggle
button, the panel `<div>`, and every `qa*` field inside it.

In `src/sheet/110-modals-trackers.js`, delete all four occurrences of this phase's guarded
hook, each preceded by its own explanatory comment naming which caller bypasses `recalcAll()`
(the wound stepper/slider, a Void pip click, `castSpell()`, and a bonus pip click):
```js
if(typeof renderQuickAccessPanel === 'function') renderQuickAccessPanel();
```
Each occurrence's comment block is worded differently (it names the specific caller), so match
on the comment text plus the call line together, not the call line alone — grep
`renderQuickAccessPanel` in that file first to confirm you have found all four before deleting
any.

In `src/sheet/210-test-seam-and-init.js`, two separate edits:

1. Delete the guarded seam-export block:
   ```js
   // ---- PART H PHASE 2: Quick-Access Sidebar ----
   if (typeof renderQuickAccessPanel === 'function') {
     Object.assign(window.__L5R_TEST__, {
       renderQuickAccessPanel, isQuickAccessPanelOpen, openQuickAccessPanel,
       closeQuickAccessPanel, toggleQuickAccessPanel, initQuickAccessPanel, publishTopbarHeight,
     });
   }
   ```
2. Delete the guarded `init()` call and its comment:
   ```js
   // PART H PHASE 2 - Quick-Access panel toggle (206-feat-quick-access-sidebar.js). Guarded
   // for the same reason.
   if (typeof initQuickAccessPanel === 'function') initQuickAccessPanel();
   ```

Rebuild, capture the new hash, and write it back into the manifest:

```bash
python3 build/recombine.py            # note the printed sha256
# paste that hash into manifest.json's "expect_sha256"
python3 build/recombine.py --verify   # now reports BYTE-IDENTICAL
python3 build.py --check-drift        # from the repo root
```

**This was verified this session**, not just written down: a scratch copy of Phase 0 had exactly
this procedure applied, then rebuilt. Results — `element_id_count` dropped from 254 to **243**
(the eleven elements this phase owns: the toggle button, the panel, its close button, the seven
base value/pip elements, and `qaSpellBonusValue`); `element_ids_duplicated` stayed empty;
`section_count`/`roll_modal_overlay_count` stayed 10/23; `tag_imbalance` stayed empty. Both
`Part H — Phase 1 UI-UX Foundations` and `Part H — Phase 9 Clan-Themed Look`'s own harnesses
passed in full against that build — **9/9** and **14/14** respectively — proving this phase's
removal does not disturb either. This phase's own harness
(`qa/quick-access-sidebar-harness.js`), run against the same build, failed exactly where
expected (`Cannot read properties of null (reading 'hidden')`, inside the harness's own test
code reading `document.getElementById('quickAccessPanel')`, not a page error) — the correct,
harmless failure mode for a feature that is genuinely gone. A full-sheet behavioural sweep
(`qa/behaviour-harness.js`, all 14 flows) reported zero page errors and zero console errors
against the same build.

## Why the old "restore originals/" method is no longer safe to use alone

The section below this one describes restoring this phase's `originals/` copies of the shared
files it touched. That was correct advice when this phase was the last thing to touch those
files — it no longer is. **Part H Phase 9**, built after this phase, added its own guarded hook
into both `110-modals-trackers.js` and `210-test-seam-and-init.js`. This phase's `originals/`
copies of those two files predate Phase 9's edits. Restoring them today would silently delete
Phase 9's `applyClanTheme()` call from the tail of `recalcAll()` and its seam export — not a
clean removal of this phase, but an unintended, undocumented partial removal of Clan Theming
too, while its fragment file, markup, and CSS would all be left behind, now calling into
nothing (the mon watermark and colophon would stay permanently hidden, and switching Clans
would stop re-theming, with no error to point at why).

Use the surgical procedure above instead — it touches only the lines this phase itself owns,
identified by their own `PART H PHASE 2` markers, so it stays correct regardless of what has
been built on top since.

## Historical: whole-file snapshot restore (kept for reference only — do not use above)

This was this phase's original rollback procedure, before Phase 9 made it unsafe. It restores
`originals/` copies over the live tree — safe only if this phase is still the most recent to
have touched every file listed, which is no longer true. Kept here so the restore points below
stay traceable, not as a live instruction.

Five of the six touched files existed before this phase and have a pre-edit copy in
`originals/`. The sixth, `src/sheet/206-feat-quick-access-sidebar.js`, did not exist at all
before this phase.

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
sheet and will error outright against a rolled-back build
(`document.getElementById('quickAccessPanel')` returns `null`) — expected, not something to
chase. What should still pass is everything upstream, plus (if built after this phase) Phase 9's
own harness:

```bash
python3 build.py --check-drift                    # from the repo root
python3 "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/qa/inventory.py" \
  "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html"
```

Using the surgical procedure above, against today's full-featured build, `element_id_count`
reads back to **243** (254 minus this phase's own eleven elements). The whole-file-restore
method's own historical figure of 240 only applies if this phase is rolled back in a repo state
that predates Phase 9 as well — not the case today.

## Restore points

| Artefact | Value |
|---|---|
| Phase 0 build `sha256`, before this phase (= end of the Spell Slots Tab Visibility Race bugfix) | `b0cbe6efda7ed2518d66173ca9bdab6a32661a432ad0300aa93510d6f23954a2` |
| Phase 0 build `sha256`, after this phase, before Phase 9 (includes the Bonus-line addition) | `0361d7e2e07936b40d83d2022a95ff74aa47adc6d10ad7039888a7e85e65464b` |
| `element_id_count`, before this phase | 240 |
| `element_id_count`, after this phase, before Phase 9 | 251 |
| `element_id_count`, after this phase's surgical removal from today's full build | 243 (254 − 11) |
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

These `sha256` and `element_id_count` figures are all historical snapshots of specific repo
states, not invariants a future build must match — the whole point of the surgical method above
is that it stays correct as the repo moves past the state these numbers describe. If a restored
build's numbers don't match the row you expected, check first whether a later phase has since
touched the same shared files, before assuming a fragment copy was missed.
