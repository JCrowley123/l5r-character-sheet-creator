# BUGFIX — Carousel Settles on Its Destination

Built 14 October 2026 (Cycle 1, Layer 7), from the failing-test investigator's recommended fix, after it traced Phase
12's intermittent typing failures to the carousel. When a tab tap or a script moves the swipe-tab carousel, the move
now ends on the page it was sent to, even if a start-up settle signal or a resize arrives during the glide.

## The defect

A tab tap glides the track for about 0.9 s. On `main`, during that glide `onScroll` set `current` back to the page
being left, then to each page passed, and `syncTabs()` marked the destination inert. Two things could then end the
move early:

- **a settle signal left from start-up**: the opening `jumpToSlot(1)`'s `scrollend` can arrive after the page's
  `load`, so `onSettle()` committed whatever page was under the track;
- **`reflow()`**, 60 ms after any resize (rotation, browser toolbars, a closing keyboard), jumps to `current` (the page
  being passed) and cancels the glide.

Both resolve `whenSettled()`, so the carousel reported arrival on the wrong page; focusing a field on the inert
destination is silently ignored and keystrokes go nowhere. This caused Phase 12's intermittent failures
(`PM12-MANAGEMENT-TYPING-WORKS`, `PM12-PLAY-TYPING-BLOCKED`, `PM12-MODE-NEVER-SAVED`: 1 standalone run in 5 on `main`;
full run 2), and a user can hit it: on `main`, a resize 150 or 400 ms into a Background tap left the sheet on Rings &
Traits, Equipment or Techniques. The tab highlight also flickered back through every page passed. It has existed since
the carousel; this cycle did not cause it.

## The fix

Six marked blocks in `src/layer/10-carousel.js` (`// BUGFIX CARDEST BEGIN <slug>`), switch
`CAROUSEL_DESTINATION_FIX_ENABLED`:

| Block | What it does |
|---|---|
| `destination-state` | the switch; `navTarget`, the page a tab tap or script move is travelling to; `navRetried` |
| `goto-remember` | `goToIndex` sets `navTarget`, unless no scroll will happen (no width yet, or already there) |
| `scroll-hold` | while `navTarget` is set, pages passed over do not become current, so the tab bar, `reflow`, `rebuild` and `reassertPosition` keep the destination |
| `settle-check` | a settle anywhere but the destination re-issues the glide once; arriving clears `navTarget` |
| `step-release`, `touch-takeover` | an arrow-button step or a finger on the track clears `navTarget`, so both behave exactly as before |

No other code changes. Swipes are unchanged.

## Verification (14 October 2026, quiet machine)

| Check | Result |
|---|---|
| `qa/carousel-destination-harness.js` (390 px; each scenario on a fresh page left quiet after start-up, then the hazard forced) | **9/9** on the candidate (three runs); **4/9 on `main`** (two runs): the 5 fix checks fail (the tab bar runs back through Clan & School, Identity, Rings & Traits…; a stale settle reports arrival on Clan & School and Notes cannot take focus; a resize ends on Rings & Traits, Equipment or Techniques), the 4 guards pass |
| Negative variants | **6/6 pinned**: baseline `main` (5), switch off (5), no settle re-issue (2: the stale-settle pair), no scroll hold (1: the tab bar), no step release (1: a later arrow step wins), no touch release (1: a finger takes over) |
| Removal proof | **6/6**: rebuilds Layer 6's build exactly (3,831,761 bytes, `d460d6e1…`) |
| Registry | **11/11** (with the `present_text` kind) |
| Phase 12 modes harness | **25/25 in 5 of 5 runs** (the three typing checks that failed 1 run in 5 on `main`) |
| Neighbours | Spell Slots Tab on Safari 19/19, UI Foundations 9/9, Screen Focus 11/11; Part F behaviour harness ran clean (a report, no count; judged in the full run) |
| App Bar harness (kickoff step 2) | **25/25 in 4 of 4 runs** on the quiet machine, after the other harnesses in the same batch: the earlier 22/25 batch failures did not recur |

Candidate: **3,833,345 bytes**, SHA-256 `c3b20fbe678adb0674570686e5b59ac84e68c8e6bc26a3c25aeb173d532475af`. Logs in
`qa/logs/` and `qa/negative/`.

**Test environment.** Since the Windows updates installed on 14 October (KB5127647, KB5127648, KB5127690, applied at
the 21:07 restart), Playwright's bundled Chromium 153 crashes on opening any page (access violation at the same address
every time; inside and outside the app's sandbox). This layer's checks and the full run use the installed Google
Chrome 155 through `QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js` (loaded with `NODE_OPTIONS=--require`); no
harness, check or threshold changed.

**Not covered:** on a desktop, a horizontal trackpad scroll made during a tab tap's glide is pulled back to the
destination once (the investigation's optional `wheel` release was left out; no harness can show it reliably).

`qa/current-suite-runner.js` chains Layer 6's suite (5,240) and adds 9: **5,249**.
