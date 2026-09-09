# Part H, Phase 1.6 — Combat Tab Streamlining

The Combat tab, reworked for actual play at the table: the two permanent
formula paragraphs move behind an info button, Armor & TN / Weapons / Stance
/ Void become independently collapsible, the void-spend "why is everything
disabled" caption moves above the button list instead of below it, and the
wound tracker is rebuilt from a seven-card stack into a single horizontal
severity bar with a slider, a number box, and a stepper.

No wound classification changed. `computeWoundThresholds()`, `WOUND_LEVELS`,
`getCurrentWoundLevelName()` and `getWoundPenalty()` — the functions the roll
pipeline actually depends on — are untouched. Only `renderWounds()`'s DOM
output changed, and this phase proves that with a parity sweep against the
old per-card math (see *Verification* below), not just by assertion.

**Status: built and verified. 23/23 automated checks pass; a full
before/after behavioural diff confirms nothing outside the Combat tab moved.**

---

## Why this phase's code lives in Phase 0, not here

This is the first Part H folder, and the first phase since the Phase 0 source
split whose job is a **feature**, not delivery infrastructure. That is a
different relationship to Phase 0 than Part F's own later phases (0.5, 0.6,
0.7) have: those read Phase 0's *built output* and wrap it, never touching
its sources. A wound-tracker rebuild cannot work that way — `renderWounds()`
lives inside Phase 0's `src/sheet/110-modals-trackers.js`, and there is no
version of "rewrite this function" that doesn't mean editing the file it is
in.

Phase 0 was named *Source Reorganization for **Maintainability*** for exactly
this reason, and its own CLAUDE.md instructions already say so directly:
*"That folder is the head... Edit a fragment, rebuild, open the output."*
Splicing a second transformation on top of an already-fragmented source, the
way Parts C–E's old anchor-splice layers worked, would be strictly worse than
the fragments existing at all. So this phase's actual diff is in Phase 0's
`src/`; what lives in *this* folder is the record of that diff, its own
rollback path, and its own tests — the same division of labour Part F's
phases already established, just pointed at a feature instead of a build
step.

### What changed, where

| File (under Phase 0's `src/`) | What changed |
|---|---|
| `markup/10-swipe-tab-shell.html` | Combat tab restructured: four `<details>`, two formula info buttons, relocated void caption, rebuilt wound-section markup |
| `sheet/110-modals-trackers.js` | `renderWounds()` rewritten; `formatWoundPenalty()` extracted; `showWoundInfoModal()` generalized (no behaviour change — see below) |
| `sheet/160-feat-void.js` | `renderVoidPanel()` now writes the disabled-reason line to its own element instead of folding it into `voidPanelNote` |
| `sheet/180-feat-stances.js` | `populateInfoOverlay()` extracted from `showStanceInfo()`; `showCombatFormulaInfo()` added, reusing it |
| `sheet/210-test-seam-and-init.js` | wires the two new info buttons (stopping propagation — see below); exports the 5 new names to `window.__L5R_TEST__` |
| `css/10-sheet-base.css` | `.combat-details`/`.combat-summary`, `#voidDisabledReason`, and the new `.wound-*` rules replace the old `.wound-track`/`.wound-lvl` |
| `css/60-sheet-print.css` | forces `<details>` open at print time; hides the (now decorative-only) severity bar in favour of the plain-text summary lines |

`build/manifest.json`'s `expect_sha256` is updated to match — `recombine.py`
enforces byte-for-byte determinism from the fragments, so a real content
change must update the value it checks against, the same as every phase
before this one.

## Reused, not duplicated

Two modal-adjacent refactors are worth calling out, because both were small
and both were justified purely by what the roadmap asked for — reuse an
existing component, not build a second one:

**The two formula popups reuse the stance-info overlay.** `showStanceInfo()`
already populated `#stanceInfoTitle`/`#stanceInfoRing`/`#stanceInfoBody` and
showed `#stanceInfoOverlay`. That population logic is now `populateInfoOverlay(title,
subtitle, body)`, called by `showStanceInfo()` exactly as before and by the
new `showCombatFormulaInfo('tn' | 'attack')` for the two Combat-tab formulas.
No new modal, no new overlay element — one popup, three callers.

**Every wound segment reuses `showWoundInfoModal()`.** The old per-row layout
already attached this to a 👁 button on *every* row, not only the current
one — so "generalize it to work per-segment" needed no change to the function
itself, only new callers. The 8-segment bar wires the same function to each
segment's click handler.

## Two things that would have broken quietly

**The info buttons live inside `<summary>`.** A `<summary>` element toggles
its parent `<details>` on click, and a click on a button nested inside it
still bubbles up to trigger that native behaviour — so without a guard,
tapping the info button would also collapse or expand the section underneath
it. Both listeners call `e.stopPropagation()` and `e.preventDefault()` before
opening the popup (see `210-test-seam-and-init.js`).

**`ring_earth` has no input listener of its own.** Testing "does the bar
re-derive when Earth changes" by writing to `#ring_earth` directly and
dispatching `input` does nothing — that element is `readonly` and only ever
changes as a side effect of the trait-input listeners `080-identity-build-ui.js`
already wires (Earth = the lower of Stamina and Willpower). This is
pre-existing sheet behaviour, not something this phase touched, but it is
exactly the kind of thing a test can get wrong while the product is correct —
see the parity sweep in `qa/wound-bar-harness.js`, which drives Earth through
the real trait inputs rather than the ring field directly.

## Verification

Three layers, run against the actual built single-file sheet, not against
source in isolation:

**1. `qa/wound-bar-harness.js` (this folder) — 23/23.** Drives a real browser:
default `<details>` open/closed states, the bar's 8 segments, a **40-case
parity sweep** (5 Earth ranks × 8 wound totals) comparing the new bar's
current segment against the old per-card classification recomputed from the
same `computeWoundThresholds`/`WOUND_LEVELS` exports, the three synced
controls (slider ↔ number box ↔ stepper, in both directions), the
distance-to-next-level formula including the Out end state, per-segment info
modals (not only the current segment), the two formula popups (and that
opening them does not also toggle their `<details>`), the relocated
void-spend caption, and that the wound penalty still reaches the pre-roll
modifier pipeline.

**2. A full before/after behavioural diff**, using Phase 0's own
`qa/behaviour-harness.js` against two builds — fragments as they were before
this phase, and as they are now — across all 14 of its flows (character
creation, rolls, five wound levels, carousel navigation, a full save/load
round trip). Outside the Combat tab, **zero flows differ**. Inside it, every
diff is one of exactly two things: the intended restructuring, or pure
whitespace from HTML nesting one level deeper — never a content change. This
is the strongest evidence available that nothing outside the intended scope
moved.

**3. Phase 0.6 and 0.7's own harnesses, re-run against the new build** — 17/17
(`pwa-harness.js` 12/12, `update-harness.js` 5/5) plus Phase 0.7's
`build_android.py --check`, confirming the installable web app and the
Android app's staged assets are both still byte-identical to the freshly
built site. See *Both shells stay in sync* below.

Run it yourself:

```bash
cd "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability"
python3 build/recombine.py --verify
cd "../../../PART H — Phase 1.6 Combat Tab Streamlining"
NODE_PATH=$(npm root -g) node qa/wound-bar-harness.js "../Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html"
```

## Both shells stay in sync

The website (Phase 0.6, installed as a PWA) and the Android app (Phase 0.7,
sideloaded APK) are both built from Phase 0's *same* source through the
*same* chain — there is no code path where one could pick up this change and
the other not. Editing Phase 0's fragments is the only edit this phase makes;
`python3 build.py` (website) and Phase 0.7's `build/build_android.py`
(Android's staged web assets) both start from it, and their own `--check`
flags confirm both land on the identical byte-for-byte page:

```
website page sha256 (Phase 0.6 build)     : 200a23e7a5fb1d29...
Android staged page sha256 (Phase 0.7)    : 200a23e7a5fb1d29...   (identical)
```

The one asymmetry between the shells — the Android app has no service worker,
by Phase 0.7's own design — is unrelated to this phase and unaffected by it.
A new APK still needs a CI build (see Phase 0.7's `BUILD-FROM-A-PHONE.md`);
nothing about *this* phase changes when or how that happens.

## What a player sees

- **Armor & TN** and **Weapons** start collapsed — set once per character,
  rarely touched mid-fight. Each carries an ⓘ button for the formula that used
  to sit underneath it as a permanent paragraph.
- **Stance** and **Void** start open — checked constantly during a fight, and
  the Round tracker now lives inside Void's section, next to the Void-spend
  panel it interacts with.
- **Wounds** is never collapsed. A summary line ("Grazed — TN of all rolls
  +5 — 7 of 18 wound points"), a "N wounds to [next level]" line, an 8-segment
  colour bar, and three controls that always agree with each other: drag the
  slider, type a number, or tap the stepper.
- Tapping **any** segment — not only the current one — opens that level's own
  rules text, exactly as the 👁 buttons on the old per-row layout did.
- The void-spend panel now explains *why* the buttons are disabled (out of
  combat, or already spent this Round) before you reach the buttons, not
  after scrolling past all seven of them.

## Rollback

See `ROLLBACK.md`. Because this phase edits Phase 0's own fragments rather
than adding a layer beside them, rollback here is different from every phase
before it: it means restoring the touched fragments from `originals/` in this
folder, not deleting a folder that Phase 0 never depended on. `ROLLBACK.md`
gives the exact file list and the verification steps to confirm a clean
revert.
