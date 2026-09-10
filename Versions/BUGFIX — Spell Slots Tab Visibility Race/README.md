# BUGFIX — Spell Slots Tab Visibility Race

Reported live: after applying a caster School (Asahina Shugenja) on a real iPhone, the
Spell Slots tab never appeared in the tab bar, across several minutes of continued use and
tab-switching. Investigated hard, an actual race window was found and closed — but this is
not a clean "confirmed bug, confirmed fix" story, and the honest version is worth reading
before trusting the fix.

**Status: a real race window closed, verified 6/6. The specific real-device failure was
never reproduced, including by a test that initially — wrongly — claimed it had been.**

---

## What actually happened, in order

1. **The report.** Spell Slots tab missing after Apply School, on a real iPhone.
2. **A false "confirmed reproduction."** An earlier investigation (during Part H, Phase 1's
   own work) drove the Apply-School flow through `window.__L5R_TEST__` and read the tab bar
   immediately afterward, in the same synchronous block. It found the tab missing, on
   *both* the current build and the build from the end of Phase 1.6, and reported this as a
   confirmed pre-existing bug. **That test was wrong, not the product**: the carousel's own
   `watchVisibility()` reacts to a style-attribute change via a `MutationObserver`, whose
   callback fires as a *microtask* — after the current synchronous stretch of code finishes,
   never during it. Reading the tab bar in the same script that triggered the change can
   never see the observer's effect, on any build, working or broken. The "confirmed"
   reproduction was really just this fact rediscovered by accident.
3. **Real reproduction attempts, all negative.** Once that mistake was understood, a wide
   matrix of realistic scenarios was tried in a real (Chromium) browser: the correct
   clan → family → school sequence with several timing variations; real touch-driven UI
   interaction (`selectOption` + `tap`, not scripted DOM method calls, to match an actual
   finger); a full save → reload → load-character round trip; and navigating through four
   other tabs afterward. **Every one of them worked.** The tab appeared and stayed present
   in all of them. No WebKit/Safari engine is available in this environment to test the one
   remaining plausible explanation (an iOS-specific timing difference) directly.

So: **this bugfix does not rest on a proven root cause.** It rests on a real, demonstrable
race window this investigation found while looking — see below — closed on the grounds that
closing it is good engineering regardless of whether it explains what was seen on the phone,
not on a claim that it definitely was the cause.

## The real race window, demonstrated without needing a real device

`updateSpellSlotsVisibility()` (`110-modals-trackers.js`) sets `#spellSlotsSection`'s inline
`display` style. The carousel's `watchVisibility()` (`10-carousel.js`) is what actually adds
or removes the Spell Slots page from the track and tab bar, and it only learns that the style
changed via a `MutationObserver` — a **microtask**. Anything that inspects the tab bar in the
*same synchronous task* as the code that changed visibility — before the JS engine returns to
the microtask queue — sees the *old* state, deterministically, in every browser, by
specification. This is not a maybe:

```js
document.getElementById('f_school').value = 'Asahina Shugenja';
T.recalcAll();                          // sets #spellSlotsSection's display to visible
// still the same task — no await, no setTimeout:
document.querySelectorAll('.car-tab')   // does NOT yet include "Spell Slots"
```

This harness's first check runs exactly that sequence and fails against the pre-fix build,
every single time — see *Verification*. Whether a real phone's event/microtask scheduling
under a real finger tap ever actually lands a callback in that window in a way that produces
a *lasting* miss (rather than the tab simply appearing a frame later, unnoticed) is a
separate question this investigation could not settle. The carousel's own author already
treated a version of this same category of risk as worth guarding against explicitly — see
`10-carousel.js`'s `init()`, which re-checks visibility once on a `setTimeout(0)` after first
load specifically because "the sheet's init is async... Re-check once it has had a turn."
This fix extends that same instinct to every later moment the sheet already knows visibility
changed, rather than leaving it to only the initial load.

## The fix

`window.__L5R_CAROUSEL__` gains one new method, `refreshVisibility()` — purely additive,
calling the carousel's existing (private) `applyVisibility()`/`rebuild()` pair synchronously
and returning whether anything changed. `updateSpellSlotsVisibility()` calls it the instant
it changes `#spellSlotsSection`'s display, closing the window for this one known consumer
without touching how `watchVisibility()`'s own `MutationObserver` works for any other
conditional page that might exist now or later — that observer keeps running exactly as
before, as a second, independent path to the same correct end state.

### What changed, where

| File | What changed |
|---|---|
| `src/layer/10-carousel.js` | New public method `refreshVisibility()` on the carousel API object |
| `src/sheet/110-modals-trackers.js` | `updateSpellSlotsVisibility()` calls it after setting `#spellSlotsSection`'s display |
| `build/manifest.json` | `expect_sha256` updated |

## Verification

**1. `qa/spell-slots-visibility-harness.js` (this folder) — 6/6**, and **4/6 against the
pre-fix build** — the two failures are exactly the ones that exercise the fix:

- The deterministic proof: Spell Slots reaches the tab bar in the *same task* as
  `recalcAll()`, with no `await` or `setTimeout` given a chance to let a microtask run.
  Fails against the pre-fix build every time, by construction — not flaky, not
  environment-dependent.
- `refreshVisibility()` exists and behaves correctly (a no-op call returns `false`).
- Three checks covering the realistic path (real touch-driven Apply School, staying present
  across several tabs, and correctly disappearing again for a non-caster character) — these
  pass on **both** builds, which is exactly what "never reproduced in a real browser" means
  and is recorded honestly rather than presented as more than it is.

**2. A full before/after behavioural diff**, using Phase 0's own `qa/behaviour-harness.js`,
fragments as they were before this fix against as they are now, across all 14 flows: zero
non-scrollTopBtn differences (scrollTopBtn's own presence predates this fix, from Part H
Phase 1), and the carousel's own seam (`window.__L5R_CAROUSEL__`, read via
`Object.keys()`) gains exactly one method — `refreshVisibility` — with zero removals.

**3. Phase 1, 1.5 and 1.6's own harnesses, re-run against the new build** — 9/9, 34/34, and
23/23 respectively, plus Phase 0.6/0.7's own harnesses (12/12 + 5/5, `build_android.py
--check` identical) confirming both shells stay in sync.

Run it yourself:

```bash
cd "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability"
python3 build/recombine.py --verify
cd "../../../BUGFIX — Spell Slots Tab Visibility Race"
NODE_PATH=$(npm root -g) node qa/spell-slots-visibility-harness.js "../Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html"
```

## If this is still seen on a real device

This fix closes one real, provable race window but was not built against a confirmed root
cause, because none could be established without WebKit access. If Spell Slots still fails
to appear after this ships:

- Note the exact sequence (which School, whether "Apply Family" was tapped first, how much
  time passed between taps) as precisely as possible.
- A screen recording capturing the moment of the tap through several seconds after would be
  far more diagnostic than a static screenshot, since a race window is exactly the kind of
  thing that resolves itself a frame later and leaves no visible trace afterward.
- Worth checking directly on the device's own browser console (Safari's remote Web Inspector,
  from a Mac) whether `window.__L5R_CAROUSEL__.getState().hiddenPages` still counts Spell
  Slots as hidden a few seconds after applying the School — if it does, the race described
  here was not the cause and this fix did not address the real one.

## Both shells stay in sync

Same chain as every phase since Phase 0.7 — `python3 build.py` and Phase 0.7's
`build/build_android.py` both build from Phase 0's fragments and land on the identical page:

```
website page sha256 (Phase 0.6 build)     : e1719f7a4ff05bcca8e6cebe120cc1574425f09d5c0893e7b344041366db5cf4
Android staged page sha256 (Phase 0.7)    : e1719f7a4ff05bc...   (identical)
```

## Rollback

See `ROLLBACK.md`. Both touched files predate this fix and have pre-edit copies in
`originals/` — restoring them is a straightforward, complete revert.
