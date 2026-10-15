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

| Check | Result |
|---|---|
| `qa/carousel-rotation-harness.js` (iPhone SE geometry; each check on a fresh page; the turn emulated as above) | **10/10** on the candidate (three runs); **5/10 on `main`** (`993d14a`, two runs) and on the build before Cycle 1 (`65fb705`): the 5 fix checks end on Clan & School and the tab bar shows it (Techniques, Equipment, Background; without scrollend; a settle before the reflow), the 4 guards pass |
| Negative variants | **5/5 pinned**: baseline `main` (5), switch off (5), no scroll hold (4: all but the early settle), no settle re-lay (1: the early settle), a hold that never releases (1: the arrow step after a turn is pulled back) |
| Removal proof | **6/6**: rebuilds Layer 7's build exactly (3,833,345 bytes, `c3b20fbe…`); Layer 7's own removal proof also **6/6**, with this release stripped first through the registry |
| Registry | **11/11** |
| Layer 7's harness (Carousel Settles on Its Destination) | **9/9** in 2 of 2 runs (its resize-during-a-glide checks included) |
| Phase 12 modes harness | **25/25** in 3 of 3 runs |
| Neighbours | Spell Slots Tab on Safari 19/19, App Bar 25/25 in 2 of 2 runs, UI Foundations 9/9, Screen Focus 11/11 |

Candidate: **3,834,523 bytes**, SHA-256 `9a4f4788eb401f15c3a07ddfa6622463128d99a04fdb69a0f2ebc0c808637981`. Logs in
`qa/logs/` and `qa/negative/`; each turn first confirms its own case (offset clamped or not).

**Test environment.** Installed Google Chrome 155 through `QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js`, as for
Cycle 1 (Playwright's bundled Chromium crashes since the 14 October Windows updates).

**Not covered:**

- Safari itself. The harness emulates Safari's clamp in Chromium; the iPhone checks in `MANUAL-TESTS.md` confirm it.
- If Safari reported the clamp only after the reflow (its scrolling runs apart from the page), the hold would already
  be over and the jump would remain. R1 would show that; the next step would then be a log from Safari's Web
  Inspector.
- The full suite was not run. `qa/current-suite-runner.js` chains Layer 7's suite (5,249) and adds 10: **5,259**.
