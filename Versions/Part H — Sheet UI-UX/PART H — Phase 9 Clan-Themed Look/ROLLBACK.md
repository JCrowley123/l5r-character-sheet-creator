# Rolling back Part H, Phase 9

## Dependencies

Per `CLAUDE.md`'s "Every feature must be surgically removable", declared here so a removal is
never a surprise. Verified with
`python3 qa/feature-dependencies.py src/sheet/207-feat-clan-theming.js "PART H PHASE 9" --also cfsSection clanMonWatermark clanMonColophon clan-mon-watermark clan-mon-colophon clan-mon-url`
— clean, every reference sits inside a block this phase's own marker owns.

- **This phase depends on:** the trunk only — `#f_clan`, `recalcAll()`, and the five `--shu*`
  colour tokens defined in `10-sheet-base.css`'s own `:root`. Nothing removable.
- **Removable features that depend on this phase:** none.
- **Not a dependency, though it looks like one:** this phase recolours Phase 1's scroll-to-top
  button and Phase 2's Quick Access toggle, because both read `--shu-dark` and this phase
  overrides that token globally. Neither direction is a dependency — remove this phase and those
  buttons return to the sheet's default maroon; remove either of those phases and this one
  simply has two fewer things to recolour. Verified in both directions this session.
- **Outlives this phase, deliberately: the Void pip's grey.** Real-device feedback on this phase
  found the Void Points pip tracker following the Clan colour. The fix moved the trunk's own
  `.void-pip` rule from `var(--shu)` to `var(--void-slot-color)` — Void's own element grey, the
  same token `.spell-pip-void` and the Void bonus pip already read. It is **not** inside this
  phase's `PART H PHASE 9` CSS block and is **not** removed by the procedure below, which is
  intended: the pips were equally out of step with the rest of the Void family before this phase
  existed, when they were the sheet's plain maroon. Removing this phase leaves them grey. If the
  brand-accent colour is ever wanted back, that is a separate, deliberate edit to `.void-pip` in
  `10-sheet-base.css` — see the README's *The Void pip, after real-device feedback*. Three checks
  in this phase's harness cover it, and two of them keep passing with this phase's kill-switch
  off, which is the evidence that the grey does not depend on this phase.

## The fast way first: one flag, no rollback session needed

Before a full removal, consider whether this is actually what's wanted. Open
`src/sheet/207-feat-clan-theming.js` and change:

```js
const CLAN_THEME_ENABLED = true;
```

to

```js
const CLAN_THEME_ENABLED = false;
```

then rebuild (`python3 build/recombine.py` from the Phase 0 folder). Every call into this
phase's own functions becomes a no-op that actively clears any theming already applied — the
sheet is back to its default maroon/gold instantly, the mon watermark and colophon stay hidden
regardless of which Clan is applied, and nothing else in the codebase changes. The fragment and
its data (including the embedded mon art) stay in the build, so flipping the flag back to `true`
later is equally cheap. Verified directly in this phase's own testing: a scratch build with the
flag flipped drops this phase's harness from 17/17 to 12/17, failing exactly the five checks that
depend on theming actually being active — see the README's "Verification" for the full detail.

This does **not** shrink the build (the mon art stays embedded either way) and does not remove
any code — it is a runtime off-switch, not a removal. For an actual removal, continue below.

## The safe way for a full removal: surgical removal (verified, order-independent)

Unlike the kill-switch above, this actually removes the code and shrinks the build (the ~730KB
of embedded mon art goes with it). This phase's shared touch points — one hook in
`110-modals-trackers.js`, one guarded seam-export block plus one guarded `init()` call in
`210-test-seam-and-init.js`, one CSS block, and a few lines of markup — are each delimited by
their own `PART H PHASE 9` comment marker, exactly like Phase 1 and Phase 2's own markers. Delete
this phase's own fragment, its own manifest entry, its own CSS block, its own markup additions,
and its own two hooks — nothing that belongs to Phase 1 or Phase 2.

```bash
cd "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability"

rm src/sheet/207-feat-clan-theming.js
```

Then, in `build/manifest.json`, delete the one `fragments` entry whose `"file"` is
`"src/sheet/207-feat-clan-theming.js"`.

In `src/css/10-sheet-base.css`, delete everything from the
`/* ---------- PART H PHASE 9: Clan-themed look ---------- */` header down to (but not
including) the next header, `/* ---------- Print / PDF export (physical play) ---------- */` —
this includes the two danger-colour protection pins (`button.danger`, `.wound-seg.sev-danger.
current`), `#cfsSection`'s positioning rule, and both `.clan-mon-watermark`/`.clan-mon-colophon`
rule blocks. Removing the two protection pins is correct, not a gap: they only ever mattered
because this phase's own override existed (see the README) — with the override gone,
`button.danger` and `.wound-seg.sev-danger.current` read the stylesheet's own unmodified
`--shu`/`--shu-dark` again regardless, so nothing about their actual appearance changes.

In `src/markup/10-swipe-tab-shell.html`, two separate edits:

1. Delete the four-line `PART H PHASE 9` comment that sits immediately *above* the Clan &
   School `<div class="section" id="cfsSection">`, change that line back to
   `<div class="section">`, then delete the three-line comment plus the
   `<span class="clan-mon-watermark" ...>` element that follows it, right before the
   `<h2>Clan, Family &amp; School</h2>` line. (The `id` is this phase's own — it exists only to
   give the watermark a positioning context — which is why the marker comment above the `div`
   is there to say so.)
2. Delete the four-line comment plus the `<span class="clan-mon-colophon" ...>` element inside
   `#carTabbar`, right before `#carTabbarInner`.

In `src/sheet/110-modals-trackers.js`, delete this phase's one guarded hook (at the tail of
`recalcAll()`, after `renderWounds()`) along with its comment:
```js
// PART H PHASE 9 - last, so it reads whatever Clan is applied after everything else this
// pass computed. recalcAll() is the only path that changes #f_clan (Apply Family, in
// 080-identity-build-ui.js, always calls it right after) and the only path a saved
// character's Clan is restored on load, so this needs no narrower hook of its own.
if(typeof applyClanTheme === 'function') applyClanTheme();
```

In `src/sheet/210-test-seam-and-init.js`, two separate edits:

1. Delete the guarded seam-export block:
   ```js
   // ---- PART H PHASE 9: Clan-themed look ----
   if (typeof applyClanTheme === 'function') {
     Object.assign(window.__L5R_TEST__, {
       applyClanTheme, getAppliedClanKey, CLAN_THEME_PALETTE,
     });
   }
   ```
2. Delete the guarded `init()` call and its comment:
   ```js
   // PART H PHASE 9 - Clan-themed look (207-feat-clan-theming.js). recalcAll() (called by
   // resetToBaseline() above, and by applyData() on every character load) already re-applies
   // this on its own, but an explicit call here means the very first paint is correct too,
   // before anything else has triggered a recalc. Guarded for the same reason as the two above.
   if (typeof applyClanTheme === 'function') applyClanTheme();
   ```

Rebuild, capture the new hash, and write it back into the manifest:

```bash
python3 build/recombine.py            # note the printed sha256
# paste that hash into manifest.json's "expect_sha256"
python3 build/recombine.py --verify   # now reports BYTE-IDENTICAL
python3 build.py --check-drift        # from the repo root
```

**This was verified this session**, not just written down: a scratch copy of Phase 0 had exactly
this procedure applied, then rebuilt. Results — build size dropped from 2,214,098 bytes to
**1,485,284 bytes** (confirms the embedded mon art is actually gone, not just hidden);
`element_id_count` dropped from 254 to **251** (the three elements this phase owns:
`cfsSection`'s own id, `clanMonWatermark`, `clanMonColophon`); `element_ids_duplicated` stayed
empty; `section_count`/`roll_modal_overlay_count` stayed 10/23; `tag_imbalance` stayed empty.
Both `Part H — Phase 1 UI-UX Foundations` and `Part H — Phase 2 Quick-Access Sidebar`'s own
harnesses passed in full against that build — **9/9** and **19/19** respectively — proving this
phase's removal does not disturb either. This phase's own harness
(`qa/clan-theming-harness.js`), run against the same build, failed exactly where expected
(`Cannot read properties of null (reading 'hidden')`, inside the harness's own test code reading
`document.getElementById('clanMonWatermark')`, not a page error) — the correct, harmless failure
mode for a feature that is genuinely gone. A full-sheet behavioural sweep
(`qa/behaviour-harness.js`, all 14 flows) reported zero page errors and zero console errors
against the same build.

## Why this procedure, not "restore originals/", is documented as primary here

Nothing has been built on top of this phase yet, so restoring this phase's `originals/` copies
of the shared files it touched would, today, produce the same result as the surgical procedure
above — both are valid right now. It's documented as primary anyway, for the same reason Phase 1
and Phase 2's own `ROLLBACK.md` files were rewritten this session to lead with it: **that
equivalence stops holding the moment any future phase adds its own guarded hook to
`110-modals-trackers.js` or `210-test-seam-and-init.js`**, exactly as happened to Phase 1 and
Phase 2's own snapshots once this phase (and, for Phase 1, Phase 2 as well) touched those same
files after them. Restoring a stale whole-file snapshot at that point would silently strip
whatever that future phase added, alongside this phase's own code, with no error to point at
why. The surgical procedure never has that failure mode, because it only ever touches the lines
this phase's own `PART H PHASE 9` markers identify — it doesn't need to be re-verified against
whatever gets built next. The whole-file-restore section below is kept for reference and still
works *today*; treat it as a historical fallback, not the standing instruction.

## One file is new, not edited — restore it by deleting it

Four of the five touched files existed before this phase and have a pre-edit copy in
`originals/`. The fifth, `src/sheet/207-feat-clan-theming.js`, did not exist at all before this
phase — there is no earlier version of it to restore. Rolling it back means **deleting the
file**, not copying anything over it.

```bash
cd "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability"
PH="../../Part H — Sheet UI-UX/PART H — Phase 9 Clan-Themed Look/originals"

cp "$PH/src/markup/10-swipe-tab-shell.html"      src/markup/
cp "$PH/src/sheet/110-modals-trackers.js"        src/sheet/
cp "$PH/src/sheet/210-test-seam-and-init.js"     src/sheet/
cp "$PH/src/css/10-sheet-base.css"               src/css/
cp "$PH/build/manifest.json"                      build/manifest.json
rm src/sheet/207-feat-clan-theming.js

python3 build/recombine.py --verify
```

`--verify` should report **BYTE-IDENTICAL** against the restored `expect_sha256` — that confirms
the rollback is complete, not just "the files look old." The restored `manifest.json` carries the
pre-Phase-9 hash (`0361d7e2e07936b40d83d2022a95ff74aa47adc6d10ad7039888a7e85e65464b`, the same
hash the Bonus spell-slot pool addition to Phase 2's Quick Access panel ended on), so a mismatch
here means a fragment was missed — most likely forgetting to delete
`207-feat-clan-theming.js`, since a stray fragment file is not itself listed in `manifest.json`
and so causes no error on its own, it just sits there unused. Confirm it's gone with:

```bash
ls src/sheet/207-feat-clan-theming.js   # should report "No such file or directory"
```

Then, from the repo root:

```bash
python3 build.py --check-drift
```

**Before using this method, check first whether anything has been built on top of this phase**
that also touched `110-modals-trackers.js`, `210-test-seam-and-init.js`, `10-sheet-base.css`, or
`10-swipe-tab-shell.html` — look for a Part H phase folder numbered higher than 9, or check
`git log` on those four files for commits after this phase's own. If one exists, use the
surgical procedure above instead; this whole-file restore would silently remove that phase's
work too.

## What that leaves

- **Everything before this phase, untouched.** These five files (four restored, one deleted)
  are the *only* files this phase touched anywhere in the repository.
- **The Clan-themed colour override, the mon watermark, and the mon colophon all disappear
  entirely.** The sheet returns to its permanent default maroon/gold, exactly as it looked
  before this phase, for every Clan.
- **The two danger-colour protection pins go with it too** — but they only ever mattered because
  this phase's own override existed; with the override gone, `button.danger` and
  `.wound-seg.sev-danger.current` read the stylesheet's own unmodified `--shu`/`--shu-dark`
  again regardless, so nothing about their appearance actually changes on rollback.
- **The Void pip stays grey.** As declared under *Dependencies* above, that recolour lives in the
  trunk's own `.void-pip` rule rather than in this phase's marked block, and survives the
  removal. This is the one visible change of this phase's era that a rollback does not undo.
- **Phase 0.5, 0.6 and 0.7 need no changes at all.** They build from Phase 0's output, whatever
  that output currently is; reverting Phase 0's fragments and rebuilding is all a full rollback
  requires. Re-run `python3 build.py` from the repo root and (if a new APK matters) Phase 0.7's
  `build/build_android.py`, exactly as after any other change to Phase 0's source. Expect the
  site's own page hash to shrink by roughly 730KB once the embedded mon art is gone.

## Confirming the rollback matches this phase's own starting point

This phase's own harness (`qa/clan-theming-harness.js`) is written against the rebuilt sheet and
will error outright against a rolled-back build (`window.__L5R_TEST__.CLAN_THEME_PALETTE` will
be `undefined`, and `document.getElementById('clanMonWatermark')` will return `null`) — expected,
not something to chase. What should still pass is everything upstream, plus Phase 1 and Phase
2's own harnesses:

```bash
python3 build.py --check-drift                    # from the repo root
python3 "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/qa/inventory.py" \
  "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html"
```

Using either method today, the inventory's `element_id_count` reads back to **251** — this phase
added exactly three new static elements (`cfsSection`'s own id, `clanMonWatermark`,
`clanMonColophon`).

## Restore points

| Artefact | Value |
|---|---|
| Phase 0 build `sha256`, before this phase (= end of the Bonus spell-slot pool addition to Phase 2) | `0361d7e2e07936b40d83d2022a95ff74aa47adc6d10ad7039888a7e85e65464b` |
| Phase 0 build `sha256`, after this phase and the init-guard hardening (current) | `df62ad0aac33f520c3a3afe1cea97acd201a0c37f12c7348f96440f8fb96ef5d` |
| Build size, before / after | ~1.49MB / ~2.21MB (the seven Clans' embedded mon art, ~730KB) |
| `element_id_count`, before | 251 |
| `element_id_count`, after | 254 |
| `section_count` / `roll_modal_overlay_count` | unchanged: 10 / 23 |
| `window.__L5R_TEST__` key count, before | 294 |
| `window.__L5R_TEST__` key count, after | 297 (+`applyClanTheme`, `getAppliedClanKey`, `CLAN_THEME_PALETTE`) |
| `window.__L5R_CAROUSEL__` method count | unchanged: 11 |
| Website page `sha256` (Phase 0.6) | `998ffdbaf1f88e24816661d4c0a4eddc549dab6d9113e887d47ab3b6e934a357` |
| Android staged page `sha256` (Phase 0.7) | identical to the website's |

Two intermediate builds existed briefly during this phase's own development and were never
promoted to `main`: `647d4522190c2349f897208674cc295ba66bfe83bd12ec270ccba45be3e6640e` (theming
and mon art built and working, before the colophon's opacity/size were fixed — see the README's
"The colophon needed a much higher opacity than the mockup's own") is the one to watch for; it
has the exact same feature set as the final build, just an all-but-invisible colophon.
`3726dc093fcaef9bff9979ff77fa20f1074d828c032d96e152f2049f8672da28` **was** promoted to `main`
and built into an APK, then superseded the same day by the init-guard hardening above (see
`Part H — Sheet UI-UX` folder note on the removability audit) — a purely defensive change with
no visible behaviour difference. Listed here only so neither hash is mistaken for a rollback
target if it turns up in local build artifacts or git history.

If a restored build's `element_id_count` or seam key count lands anywhere other than the
"before" row above, either a fragment copy was missed, `207-feat-clan-theming.js` was not
deleted, or (for the whole-file-restore method) a later phase has since touched the same shared
files and its work was accidentally reverted along with this one — recheck against the surgical
procedure above.
