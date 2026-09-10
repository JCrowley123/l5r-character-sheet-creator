# Rolling back Part H, Phase 9

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
flag flipped drops this phase's harness from 14/14 to 9/14, failing exactly the five checks that
depend on theming actually being active — see the README's "Verification" for the full detail.

This does **not** shrink the build (the mon art stays embedded either way) and does not remove
any code — it is a runtime off-switch, not a removal. For an actual removal, continue below.

## Why the full removal isn't "delete the folder"

Like every other feature phase this session, this phase's actual diff lives inside Phase 0's own
fragments — the theming logic, the markup it hooks into, and the CSS it depends on all live in
`src/`, not in this folder. Deleting this folder removes the documentation, the rollback path,
and the tests, but leaves Phase 0's fragments exactly as this phase left them. **Restoring the
fragments from `originals/` is the actual rollback step.**

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
- **Phase 0.5, 0.6 and 0.7 need no changes at all.** They build from Phase 0's output, whatever
  that output currently is; reverting Phase 0's fragments and rebuilding is all a full rollback
  requires. Re-run `python3 build.py` from the repo root and (if a new APK matters) Phase 0.7's
  `build/build_android.py`, exactly as after any other change to Phase 0's source. Expect the
  site's own page hash to shrink by roughly 730KB once the embedded mon art is gone.

## Confirming the rollback matches this phase's own starting point

This phase's own harness (`qa/clan-theming-harness.js`) is written against the rebuilt sheet and
will error outright against a rolled-back build (`window.__L5R_TEST__.CLAN_THEME_PALETTE` will
be `undefined`, and `document.getElementById('clanMonWatermark')` will return `null`) — expected,
not something to chase. What should still pass is everything upstream:

```bash
python3 build.py --check-drift                    # from the repo root
python3 "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/qa/inventory.py" \
  "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html"
```

The inventory's `element_id_count` should read back to the pre-Phase-9 figure of **251** — this
phase added exactly three new static elements (`cfsSection`'s own id, `clanMonWatermark`,
`clanMonColophon`).

## Restore points

| Artefact | Value |
|---|---|
| Phase 0 build `sha256`, before this phase (= end of the Bonus spell-slot pool addition to Phase 2) | `0361d7e2e07936b40d83d2022a95ff74aa47adc6d10ad7039888a7e85e65464b` |
| Phase 0 build `sha256`, after this phase (current) | `3726dc093fcaef9bff9979ff77fa20f1074d828c032d96e152f2049f8672da28` |
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
has the exact same feature set as the final build, just an all-but-invisible colophon. Listed
here only so it isn't mistaken for a rollback target if it turns up in local build artifacts or
git history.

If a restored build's `element_id_count` or seam key count lands anywhere other than the
"before" row above, either a fragment copy was missed or `207-feat-clan-theming.js` was not
deleted — recheck the five-item list.
