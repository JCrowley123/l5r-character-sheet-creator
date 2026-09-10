# Part H, Phase 2 — Quick-Access Sidebar

A toggle button and small overlay panel mirroring five values a player wants to check without
leaving the tab they're on: Void, Spell Slots (casters only), Wounds, Armor TN, and Initiative.

**Status: built, and shipped with a live-update gap this phase's own harness caught before
release rather than after. 17/17 automated checks pass against the current build — and 12/17
against the first working version, which is the point (see *The gap this phase's own harness
caught*). Plus a full before/after behavioural diff showing zero differences anywhere outside
the ten new elements this phase adds.**

## Why "sidebar" is a toggle, not a pinned rail

The roadmap names this feature a sidebar. Measured directly (screenshots at 390px phone width
and 1440px desktop width, both closed and open, both a fresh character and a caster) before
writing any layout code: at 390px there is no spare width at all — the carousel's own column
already fills the viewport with a 16px gutter each side, exactly as every other phone-width
layout on this sheet does. At 1440px the sheet's own `.car-page-inner{max-width:1180px}` still
caps content width, and the ~130px margin left on each side is already occupied by the
carousel's own prev/next arrows (`#carPrev`/`#carNext`) — nowhere near enough for five readable
stat rows even if it were free. A permanently pinned rail would therefore either shrink the
carousel (never asked for) or violate the roadmap's own validation criterion — "does not
overlap or hide main content" — outright on the one viewport where it would fit least. So this
is the same shape as the existing floating dice button and scroll-to-top button (Phase 1): a
toggle, fixed-position, opening a small anchored panel. Non-intrusive when closed (just a
40px button); overlaying content only when open, exactly the way every modal on this sheet
already does, and dismissed the same way any mobile "quick settings" panel is — click outside,
Escape, or the toggle again.

## Why the panel is read-only

The roadmap's own Validation Test Suite asks only that the panel "updates instantly when
values change" — nothing requires the panel itself be a second interactive control surface.
Void pips and Spell Slot pips are already click-to-spend, in `110-modals-trackers.js`.
Mirroring them as clickable here too would mean two independent places mutating the same
state — exactly the class of synchronization risk this project spent two rounds fixing in the
carousel's own tab-visibility mechanism (`BUGFIX — Spell Slots Tab Visibility Race`). A
glance-only mirror satisfies everything the roadmap actually asks for with none of that risk.
Check 8 below (`clicking a Quick Access void pip does not spend Void`) guards this decision
against a future accidental regression — the mirror's pips are plain `<span>` elements, never
`<button>`s, specifically so nothing can ever wire a click handler onto them by habit.

## What changed, where

Almost everything lives in one new fragment, `src/sheet/206-feat-quick-access-sidebar.js` —
new because nothing existing needed rewriting for the panel itself. Five other files needed a
small, additive touch to wire it in and to close the live-update gap described below:

| File | What changed |
|---|---|
| `src/sheet/206-feat-quick-access-sidebar.js` | **New.** `renderQuickAccessPanel()`, `isQuickAccessPanelOpen()`, `openQuickAccessPanel()`, `closeQuickAccessPanel()`, `toggleQuickAccessPanel()`, `publishTopbarHeight()`, `initQuickAccessPanel()` |
| `src/sheet/110-modals-trackers.js` | `renderVoidPips()`, `renderWounds()` and `renderSpellPips()` each gained one line calling `renderQuickAccessPanel()` — see below for why; `renderAllSpellSlots` added to the `window.__L5R_TEST__` export list |
| `src/sheet/210-test-seam-and-init.js` | Calls `initQuickAccessPanel()` from `init()`; exports the seven new names above to `window.__L5R_TEST__` |
| `src/markup/20-fixed-layers.html` | New `#quickAccessToggleBtn` (styled to match the existing utility-button family — solid `--shu-dark` circle, like the scroll-to-top button, not the gold dice button), `#quickAccessPanel` with its five value rows |
| `src/css/10-sheet-base.css` | `.quick-access-toggle-btn`, `.quick-access-panel`, `.qa-head`, `.qa-close`, `.qa-field`, `.qa-value-line`, `.qa-pips`/`.qa-pip` (deliberately distinct from the clickable `.void-pip` class), a mobile breakpoint adjustment |
| `build/manifest.json` | New fragment entry (no `lines` provenance — it wasn't carved from the original monolith); `expect_sha256` updated |

The panel anchors below the header using `--qa-topbar-h`, a published CSS custom property
measured from `#carTopbar.offsetHeight` — the same technique `10-carousel.js` already uses for
`--car-tabbar-h` — rather than a hardcoded pixel guess, since header height varies with the
character name wrapping to a second line, font-zoom, and viewport width.

## The gap this phase's own harness caught

**The first working version of this panel updated correctly on every full recalculation, and
silently went stale the instant a player used any of three specific controls while it was
open.** Caught before shipping, by writing this phase's own harness before calling the feature
done — see CLAUDE.md's "a harness must be able to fail" principle, which this investigation
follows deliberately.

**The gap.** `renderQuickAccessPanel()` was originally wired only into the tail of
`recalcAll()`, which looked complete — every value the panel mirrors is computed somewhere
inside `recalcAll()`. But three of the sheet's own controls update that same state through
their *own* narrower render function instead, each for a documented reason that predates this
phase and has nothing to do with it:

- **Void pips** call `renderVoidPips()` directly (a click toggles one pip and re-renders just
  the strip — going through `recalcAll()` for a single pip flip would be needless work).
- **The wound stepper and slider** call `renderWounds()` directly (its own comment: routing a
  change back through `f_woundsTaken`'s `input` listener "rather than dispatching a synthetic
  event on it... so a single control change never renders the bar twice").
- **The Cast-spell button** (`castSpell()`) calls `renderSpellPips()` per element directly.

None of the three ever touches `recalcAll()`. A panel wired only there would show a Void count,
a wound total, or a spell-slot count one action behind reality for as long as it stayed open —
precisely the roadmap's own validation criterion, "updates instantly when values change,"
failing on exactly the interactions a player looking at an *open* panel is most likely to be
mid-way through. Confirmed empirically, not assumed: opening the panel, clicking a Void pip via
a real DOM click (not a synthetic `recalcAll()` call), and reading `#qaVoidValue` back showed
`"2 / 2"` — unchanged — while `#void_current` itself had already moved to `1`.

**The fix.** `renderVoidPips()`, `renderWounds()`, and `renderSpellPips()` each now end with
one line refreshing the panel — the render functions the three controls actually call, not
`recalcAll()`. `renderWounds()` is also always the last thing `recalcAll()` itself does, so a
full recalc pass still refreshes the panel exactly as before; the change closes the three
narrow paths without touching that one. `renderQuickAccessPanel()` reads directly from the five
source elements every time it runs, so calling it once more per pass than strictly necessary
(it now also fires partway through `recalcAll()`, via `renderVoidPips()` and the per-element
`renderSpellPips()` calls inside `renderAllSpellSlots()`, before being refreshed again at the
very end) is harmless — nothing is ever painted mid-pass, only the final state after
`recalcAll()` returns.

Confirmed the fix actually works, the same way the gap was confirmed: the identical Void-pip
click now updates `#qaVoidValue` to `"1 / 2"` immediately, panel still open, no other action
taken.

### Verified the harness can actually catch this class of bug

A scratch build with the three fix lines removed (same shape, no other changes) was run against
this phase's own harness: the five checks that exercise Void, Wounds, and Spell Slots live
updates while the panel is open all fail for exactly the expected reason (a stale value, or the
Spell Slots row failing to appear at all for a caster since nothing ever refreshes it), while
every structural check — open/close, ARIA state, initial render, the read-only guard — still
passes, since those don't depend on the missing hooks. **17/17 against the fixed build, 12/17
against the build with the hooks removed.**

## Verification

**1. `qa/quick-access-sidebar-harness.js` (this folder) — 17/17, and 12/17 against a build
with the three live-update hooks removed.** Structural checks (closed by default, ARIA wiring,
initial values against the real source elements, close button, click-outside, Escape) run
first. Checks 5–7 are the ones that specifically exercise the gap above: a real Void-pip click,
a real wound-stepper click, and `window.__L5R_TEST__.renderAllSpellSlots()` (the exact function
the Cast-spell button calls, exposed on the test seam for this reason) applied to a caster
character — each performed with the panel already open, never closed and reopened first (which
would trivially mask the bug, since opening the panel always calls
`renderQuickAccessPanel()` itself), and each checked against an independent oracle: the real
`#void_current`/`#ring_void` values, the real `#woundSummaryLine` text, the real
`#ring_<key>`/`#spell_used_<key>` values — never a value this file computed by calling the
function under test. Check 8 guards the read-only design decision.

**2. A full before/after behavioural diff**, using Phase 0's own `qa/behaviour-harness.js`
against two builds — fragments as they were at the end of the Spell Slots Tab Visibility Race
bugfix, and as they are now — across all 10 of its flows. Every difference the diff reports is
exactly the ten new Quick-Access elements appearing (panel closed, showing correct boot-time
values) — **zero existing elements changed or were removed, in any flow.** The
`window.__L5R_TEST__` seam gained exactly eight keys (the seven new panel functions plus
`renderAllSpellSlots`, confirmed by set comparison, zero removals); `window.__L5R_CAROUSEL__`
is untouched at 11 methods.

**3. The full existing regression suite, re-run against the final build** — Phase 1's
`ui-foundations-harness.js` (9/9), Phase 1.6's `wound-bar-harness.js` (23/23), the Spell Slots
bugfix's own harness (6/6), and Phase 1.5's `roll-pipeline-baseline.js` (34/34) — plus
`qa/inventory.py` (250 element ids, zero duplicates, no tag imbalance, section/modal counts
unchanged at 10/23) and Phase 0.7's `build_android.py --check`, confirming the Android app's
staged assets are byte-identical to the freshly built site.

Run it yourself:

```bash
cd "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability"
python3 build/recombine.py --verify
cd "../../../Part H — Sheet UI-UX/PART H — Phase 2 Quick-Access Sidebar"
NODE_PATH=$(npm root -g) node qa/quick-access-sidebar-harness.js "../../Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html"
```

## Both shells stay in sync

Same chain as every phase since Phase 0.7: `python3 build.py` (website) and Phase 0.7's
`build/build_android.py` (Android's staged web assets) both start from Phase 0's fragments,
and their own checks confirm both land on the identical byte-for-byte page:

```
website page sha256 (Phase 0.6 build)     : dff1a4b2e48e61f21d19222b8f0c6a7e273fd420c14ed1566d5e0cfcbc50a98a
Android staged page sha256 (Phase 0.7)    : dff1a4b2e48e61f2...   (identical)
```

## What a player sees

A small round button appears top-left, just below the header — the one corner the floating
dice button (bottom-right), the scroll-to-top button (bottom-left), and the carousel's own
prev/next arrows don't already occupy. Tapping it opens a card showing current Void (with
pips), Spell Slots remaining per Element (casters only), the current Wound level and count,
Armor TN, and Initiative — all read-only, all updating the instant the underlying value
changes anywhere else on the sheet, even while the card stays open. Tapping the button again,
tapping its own close button, tapping anywhere outside it, or pressing Escape all close it.

## Rollback

See `ROLLBACK.md`. This phase's diff, like Phase 1 and Phase 1.6's before it, lives inside
Phase 0's own fragments — rollback means restoring the touched fragments from `originals/`,
not deleting a folder Phase 0 never depended on. One of those files
(`206-feat-quick-access-sidebar.js`) never existed before this phase, so "restoring" it means
deleting it outright, not copying an earlier version — `ROLLBACK.md` says so explicitly.
