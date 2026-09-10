# Rolling back Part H, Phase 1

## The safe way now: surgical removal (verified, order-independent)

This phase's only shared touch point is `src/sheet/210-test-seam-and-init.js` — it does not
touch `110-modals-trackers.js` at all (its `originals/` copy of that file is carried only
because every phase keeps one of every sidecar it might need, per `CLAUDE.md`; diff it against
Phase 2's own `originals/` copy of the same file and the only difference is the unrelated Spell
Slots visibility bugfix, not anything this phase added). That makes this phase's removal the
simplest of the three Part H phases built so far: delete one fragment file, remove its own
manifest entry, delete its own CSS block, delete its own markup block, and remove its own
(now-guarded) hook in the test seam — nothing else.

```bash
cd "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability"

rm src/sheet/205-feat-ui-foundations.js
```

Then, in `build/manifest.json`, delete the one `fragments` entry whose `"file"` is
`"src/sheet/205-feat-ui-foundations.js"`.

In `src/css/10-sheet-base.css`, delete everything from the
`/* ---------- PART H PHASE 1: scroll-to-top ---------- */` header down to (but not including)
the next header, `/* ---------- PART H PHASE 2: Quick-Access panel ---------- */` — i.e. the
`.scroll-top-btn` rule block and its one `@media(max-width:600px)` block. If Phase 2 has since
also been removed, that next header won't exist; stop instead at whatever comes next in the
file (`.manual-roll-note` today).

In `src/markup/20-fixed-layers.html`, delete everything from the
`<!-- PART H PHASE 1: SCROLL-TO-TOP -->` comment down to (but not including) the next
`<!-- PART H PHASE 2: QUICK-ACCESS PANEL -->` comment (or, if Phase 2 is already gone, down to
whatever markup follows) — the `#scrollTopBtn` button and its two comment lines.

In `src/sheet/210-test-seam-and-init.js`, two separate edits:

1. Delete the guarded seam-export block added after the main `window.__L5R_TEST__` literal:
   ```js
   if (typeof scrollToTop === 'function') {
     // ---- PART H PHASE 1: UI/UX foundations ----
     Object.assign(window.__L5R_TEST__, {
       getActiveCarPage, scrollToTop, updateScrollTopVisibility, initScrollToTop,
     });
   }
   ```
2. Delete the guarded `init()` call and its comment:
   ```js
   // PART H PHASE 1 - scroll-to-top button (205-feat-ui-foundations.js). Guarded, like the
   // seam export above, so removing this phase's fragment without also touching this file
   // leaves init() intact instead of throwing here and aborting everything after it.
   if (typeof initScrollToTop === 'function') initScrollToTop();
   ```

Rebuild, capture the new hash, and write it back into the manifest:

```bash
python3 build/recombine.py            # note the printed sha256
# paste that hash into manifest.json's "expect_sha256"
python3 build/recombine.py --verify   # now reports BYTE-IDENTICAL
python3 build.py --check-drift        # from the repo root
```

**This was verified this session**, not just written down: a scratch copy of Phase 0 had exactly
this procedure applied, then rebuilt. Results — `element_id_count` dropped from 254 to **253**
(the one element this phase owns, `scrollTopBtn`); `element_ids_duplicated` stayed empty;
`section_count`/`roll_modal_overlay_count` stayed 10/23; `tag_imbalance` stayed empty. Both
`Part H — Phase 2 Quick-Access Sidebar` and `Part H — Phase 9 Clan-Themed Look`'s own harnesses
passed in full against that build — **19/19** and **14/14** respectively — proving this phase's
removal does not disturb either. This phase's own harness (`qa/ui-foundations-harness.js`), run
against the same build, failed exactly where expected
(`window.__L5R_TEST__.getActiveCarPage is not a function`, inside the harness's own test code,
not a page error) — the correct, harmless failure mode for a feature that is genuinely gone,
not a sign anything broke. A full-sheet behavioural sweep (`qa/behaviour-harness.js`, all 14
flows: boot, name, clan pick, rolls, wounds at 5 thresholds, carousel navigation, save/load
round-trip) reported zero page errors and zero console errors against the same build.

## Why the old "restore originals/" method is no longer safe to use alone

The section below this one describes restoring this phase's `originals/` copies of the shared
files it touched. That was correct advice when this phase was the last thing to touch those
files — it no longer is. **Part H Phase 2** and **Part H Phase 9**, built after this phase, both
added their own guarded hooks into `src/sheet/210-test-seam-and-init.js`. This phase's
`originals/` copy of that file predates both. Restoring it today would silently delete Phase 2's
and Phase 9's own seam exports and `init()` calls along with this phase's — not a clean removal
of this phase, but an unintended, undocumented partial removal of two other features too, while
their own fragment files, markup, and CSS would all be left behind, now calling into nothing.
Confirmed by diffing this phase's own `originals/src/sheet/210-test-seam-and-init.js` against
the live file: the live file has Phase 2's and Phase 9's own blocks that this phase's snapshot
does not.

Use the surgical procedure above instead — it touches only the lines this phase itself owns,
identified by their own `PART H PHASE 1` markers, so it stays correct regardless of what has
been built on top since. The same reasoning will apply to this phase's own hooks once a future
phase adds a fourth guarded block to the same file: the surgical approach doesn't need updating
when that happens, because it never depended on being "the last phase to touch this file" in the
first place.

## Historical: whole-file snapshot restore (kept for reference only — do not use above)

This was this phase's original rollback procedure, before Phase 2 and Phase 9 made it unsafe.
It restores `originals/` copies over the live tree — safe only if this phase is still the most
recent to have touched every file listed, which is no longer true. Kept here so the restore
points below stay traceable, not as a live instruction.

Four of the five touched files existed before this phase and have a pre-edit copy in
`originals/`. The fifth, `src/sheet/205-feat-ui-foundations.js`, did not exist at all before
this phase — there is no earlier version of it to restore.

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
should still pass is everything upstream, plus (if built after this phase) the other two Part
H phases' own harnesses:

```bash
python3 build.py --check-drift                    # from the repo root
python3 "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/qa/inventory.py" \
  "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html"
```

Using the surgical procedure above, against today's full-featured build, `element_id_count`
reads back to **253** (254 minus this phase's own `scrollTopBtn`). The whole-file-restore
method's own historical figure of 239 only applies if this phase is rolled back in a repo state
that predates Phase 2 and Phase 9 as well — not the case today.

## Restore points

| Artefact | Value |
|---|---|
| Phase 0 build `sha256`, before this phase (= end of Phase 1.6) | `a8e9851dc783b3eb02a4de6508937863049781c256b71efcc2e426030d7cedd3` |
| Phase 0 build `sha256`, after this phase (post-revert) | `b4f27784fd5633a0e8d9950060192832ca47c28753a5186f0e2d83be9ea22702` |
| `element_id_count`, before this phase | 239 |
| `element_id_count`, after this phase, before Phase 2/9 | 240 |
| `element_id_count`, after this phase's surgical removal from today's full build | 253 (254 − 1) |
| `section_count` / `roll_modal_overlay_count` | unchanged: 10 / 23 |
| `window.__L5R_TEST__` key count, before | 282 |
| `window.__L5R_TEST__` key count, after | 286 (+`getActiveCarPage`, `scrollToTop`, `updateScrollTopVisibility`, `initScrollToTop`) |
| Website page `sha256` (Phase 0.6) | `46d4ef27dc3b9767d064adaaa2fff459db2c904801fc74ed96d52209e37a0a0a` |
| Android staged page `sha256` (Phase 0.7) | identical to the website's |

An intermediate build existed briefly, between this phase's initial ship and the Ring-accent
revert, with `sha256` `4b26a7caa394ac7d01024b99cf014b34d357c2eeb8b69a586db1b66d2dd1bfdf` and
288 seam keys (the two extra being `ringAffinityStatus`/`renderRingAffinityAccents`). It was
promoted to `main` and built into one APK release before being superseded by the revert above
— listed here only so that hash isn't mistaken for a rollback target if it turns up in git
history or an old build artifact.

These `sha256` and `element_id_count` figures are all historical snapshots of specific repo
states, not invariants a future build must match — the whole point of the surgical method above
is that it stays correct as the repo moves past the state these numbers describe. If a restored
build's numbers don't match the row you expected, check first whether a later phase has since
touched the same shared files, before assuming a fragment copy was missed.
