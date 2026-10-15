# BUGFIX — Carousel Keeps Its Page on Rotation

Built 15 October 2026 from the owner's device check of Cycle 1 that day: on an iPhone, turning the phone from
landscape back to portrait while on Techniques, Combat, Equipment or Background jumped the sheet to Clan & School.
Clan & School to Adv & Disadv were unaffected. The sheet now stays on the page it was showing.

## The defect

The track holds every page side by side, with a copy of the last page before Clan & School and a copy of Clan &
School after the last page (the loop). A page sits at (its position + 1) × the track's width. In landscape the track
is about twice as wide, so for the later pages that offset is beyond the furthest a portrait track can scroll. When
the phone turns, the browser clamps the offset to that maximum, which is the copy of Clan & School at the end.

On `main` the carousel took that clamp for a swipe. `onScroll` made Clan & School the current page (a settle signal
arriving then teleported to it as well) before `reflow()`, 60 ms after the resize, laid the track out again, on Clan
& School. The earlier pages still fit inside the portrait track: their offset is not clamped, no scroll is reported,
and `reflow()` puts them back where they were. Which pages are affected depends on the phone's two widths and the
number of pages; on an iPhone SE with eight pages it is Techniques onward, the same split as the report.

Desktop Chromium does not show it: on a resize it re-snaps the track to the page it was showing, so the scroll it
reports is the right page. The harness therefore switches snapping off for each turn. Chromium then keeps the offset
and clamps it, which is what Safari is believed to do, and `main` jumps from Techniques, Equipment and Background to
Clan & School while Adv & Disadv stays, as reported. This is an emulation: the iPhone check confirms it.

Order of events matters. Safari reports the clamped offset before the reflow; Chromium usually does too, but when its
first frame at the new width is slow (about 1 turn in 5 here, more often for the first turn in a fresh browser) the
reflow moves the track first, Chromium never reports the clamp, and even `main` keeps its page. The harness therefore
checks that the carousel read the browser's own offset before the reflow, and retries a turn on a fresh page when it
did not (up to five tries, each printed as `RETRY`). The first version of the harness had no such check and `main`
passed one or two of its fix checks in some runs.

The defect predates Cycle 1: the harness fails the same way on the build before Cycle 1 (`65fb705`).

## The fix

Four marked blocks in `src/layer/10-carousel.js` (`// BUGFIX CARROT BEGIN <slug>`, CARousel ROTation, after
CARDEST), switch `CAROUSEL_ROTATION_FIX_ENABLED`:

| Block | What it does |
|---|---|
| `rotation-state` | the switch; `laidWidth`, the track width the pages were last laid out at; `widthChanged()`, true from a width change until the track is laid out again |
| `rotation-scroll` | while the width has changed, `onScroll` does not turn the track's offset into a page |
| `rotation-settle` | a settle that arrives before the reflow lays the track out for the new width at once, on the page it was showing, and settles there |
| `rotation-reflow` | `reflow()` records the width it laid the pages out at, which ends the hold |

No other code changes. At a steady width the hold never applies, so swipes, tab taps and arrow steps are unchanged.

## Verification (15 October 2026)

Final, on the build merged with `main` after BUGFIX — Printed Weapon Columns (`a635d8f`, print-only; the registry lists
it before this release):

| Check | Result |
|---|---|
| `qa/carousel-rotation-harness.js` (iPhone SE geometry; each turn on a fresh page, emulated and order-checked as above) | **10/10** in 3 of 3 runs (0, 2 and 6 retries); **`main` fails exactly the 5 fix checks** (`a635d8f`: the pinned baseline below, and 4 runs during development whose logs were not kept; the build before Cycle 1, `65fb705`, the same): each ends on Clan & School and the tab bar shows it (Techniques, Equipment, Background; without scrollend; a settle before the reflow). The 4 guards pass |
| Negative variants | **5/5 pinned**: baseline `main` (5), switch off (5), no scroll hold (4: all but the early settle), no settle re-lay (1: the early settle), a hold that never releases (1: the arrow step after a turn is pulled back) |
| Removal proof | **6/6**: rebuilds `a635d8f`'s build exactly (3,837,258 bytes, `d8e6915c…`); the removal proofs of Printed Weapon Columns and Layer 7 also **6/6**, with this release stripped first through the registry |
| Registry | **11/11** |
| Layer 7's harness (Carousel Settles on Its Destination) | **9/9** (its resize-during-a-glide checks included) |
| Printed Weapon Columns harness | **17/17** |

Merged candidate: **3,838,436 bytes**, SHA-256 `f4ca86eb4dd4d357cea925d09e801759c69788212255bb18f34abe2405fcae9b`.
`qa/verify-live.py` checks the deployed page.

Before the merge (on `993d14a`, first harness version, same carousel code): this harness 10/10 in 3 runs; Layer 7's
9/9 in 2 runs; Phase 12 modes 25/25 in 3 runs; Spell Slots Tab on Safari 19/19; App Bar 25/25 in 2 runs; UI
Foundations 9/9; Screen Focus 11/11. The merge changed only print styles, so these were not repeated.

Logs in `qa/logs/` (`merged-*` and `variants.log` are the final runs; `candidate-*` are the first harness version)
and `qa/negative/`.

**Test environment.** Installed Google Chrome 155 through `QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js`, as for
Cycle 1 (Playwright's bundled Chromium crashes since the 14 October Windows updates).

**Not covered:**

- Safari itself is covered by the owner's iPhone check (15 October 2026): R1–R5 pass. R6 (turning the phone while a
  tab tap is still sliding) was not run, because the phone turns too slowly; it is assumed to pass. See `MANUAL-TESTS.md`.
- If Safari reported the clamp only after the reflow (its scrolling runs apart from the page), the hold would already
  be over and the jump would remain. R1 would show that; the next step would then be a log from Safari's Web
  Inspector.
- The full suite was not run. `qa/current-suite-runner.js` chains Printed Weapon Columns' suite (5,266) and adds 10:
  **5,276**.
