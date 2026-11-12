# G4 code review (read-only), 12 November 2026

Claude, after the five-hour usage window reset. Scope: the application diff `5d14ebe3..claude/release-15a-a17` (Phase 0 `src/`, the removal-chain registry, the splash layer's ROLLBACK and harness), reviewed one unit at a time with findings written down before the next unit. The harnesses were read for whether their checks can fail; their results are in each unit's README.

## A09 — Phone Text Entry and Repeated Taps (`7d4b3d21`)

Read: `209.999999999999999992-feat-phone-text-entry.js`, `1142-phone-text-entry.css`, the seam block, the manifest entries.

- **Selector reach.** Every editable box in the document (pages, pickers, Search, Characters, Library, the wizard), except the five `ring_*` boxes, which are larger already. `input` with no `type` is included, as it should be. No box gets smaller (`TX-NONE-SMALLER-PHONE` compares each box with the class off).
- **Specificity.** No stylesheet rule that sets a font size names two IDs (searched: none), so the stylesheet comment's claim holds and the two `:not(#…)` IDs are enough.
- **`touch-action`.** No other rule sets `touch-action` on a button (only the splash, `none`, and the Library crop area, a `div`). `manipulation` keeps panning and pinch zoom, so the tab bar and other scrolling rows still scroll under a finger.
- **Older browsers.** `:is()` needs Safari 14; an older browser drops the rule and the sheet is as before.
- **Play mode.** Read-only boxes are also 16 px there; `TX-PLAY-PHONE` checks no page scrolls sideways.

**Findings: none.**

## A10 — Cross-Page Actions Move Focus (`e9707bd6`)

Read: `209.999999999999999993-feat-cross-page-focus.js`, `1143-cross-page-focus.css`, the seam block; and, for the interface it relies on, the Advanced Schools pointer (`AP7.go`, `AP7.mount`) and the carousel's `goToTab`, `whenSettled`, `getActiveTab` and `focusin` inertness.

- **Order of events.** `AP7.go` calls `goToTab` before its first `await`, so by the time the click bubbles to the document the move has started; both wait on `whenSettled`, AP7's waiter first, and this unit adds two frames, so the heading is focused after AP7's own scroll (`CP-PANEL-IN-VIEW-*`).
- **`whenSettled` never rejects:** it resolves `false` after 2 s. `goToTab` sets the current page at once, so a slow glide still focuses the right heading; a press followed by a tap on another tab finds a different page and does nothing (the `tab.label !== route.page` guard).
- **Inertness** comes from the carousel's own `focusin` listener; nothing here sets `inert`.
- **Clean-up.** `tabindex` and `data-cp15-target` are taken off on `blur`; two quick presses (A09 makes them two presses) register two `blur` listeners, and the first restores the heading as it was.
- **Hidden button** stays hidden inside the flex row (`CP-HIDDEN-BUTTON-*`).

**Finding (low, not changed):** focus moves to the heading even if, in the two frames after the glide, the person has already tapped into a box on Techniques; that box would lose focus. The window is a few tens of milliseconds after a page glide, and a guard would change three builds' hashes for a case no one is likely to meet. Recorded for the device round.

## A10.1 — The Page Ring Only for the Keyboard (`4a9ab488`)

Read: `209.999999999999999994-feat-keyboard-page-ring.js`, `1144-keyboard-page-ring.css`, the seam block; the carousel's `.car-page:focus-visible` rule; the School-choice window's focus return (`SC8.close`).

- The override outranks the carousel's rule, touches pages only, and leaves focus where it was.
- Pointer events are listened to in the capture phase, so a handler that stops a tap cannot leave the keyboard mark set.

**Finding (medium, fixed):** Enter, Space and the arrow keys count as the keyboard **even when they are typed into a text box**. On an iPhone the on-screen keyboard's Return key and every space typed in a name send these keys. If a window's own text box closes the window on Return (a picker's search, for instance), focus goes back to the page with the keyboard mark set, and the gold ring the owner reported comes back. Fix: inside a text box, only Tab and Escape count; Enter, Space and the arrows typed there do not. A checkbox, a picker (`select`) and a button still count every navigation key. Two checks added, pinned before their first run (16 in all): `KR-TYPING-IS-NOT-KEYBOARD-PHONE` and `KR-TAB-FROM-A-BOX-DESKTOP`.

## A17 — The Splash Fills the Screen (`84f0f6d5`)

Read: `1145-splash-fill.css`, the `splash-fill-art` block in `10-swipe-tab-shell.html`, the seam block, the splash layer's logic block and its harness change.

- **The script's place.** A `<script>` is allowed inside `<picture>`. It runs while the picture is parsed, after the landscape `<source>` and before the `img`, so the `img` is chosen with the new start (3 : 2) at the first paint. The splash's own leaving removes the splash and this script with it.
- **No Content-Security-Policy** on the page or in the deployed headers (none in `dist/`), so the inline script runs in production as it does locally; preview verification will confirm the deployed bytes.
- **Fallback.** If the design block ever changes so the 4 : 3 source is not found, the class is still set (fit `cover`, old switch point) and `SF-SEAM` fails on `landscapeFrom`, so the change cannot pass unnoticed.
- **The conditional in the splash harness** reads `window.SF15.installed`, so a build with A17 switched off expects `contain`, as it should.
- **Removal.** The remover accepts `<!-- -->` markers and the hand-back on the END line; `test-removal-group.py` shows the splash layer's remover refusing while A17 is present and the whole group coming off to G3 exactly.

**Findings: none.**

## Outcome

| Unit | Findings | Action |
|---|---|---|
| A09 | none | — |
| A10 | low: focus could move off a box tapped in the few frames after the glide | recorded, not changed |
| A10.1 | medium: Enter and Space typed into a text box marked the keyboard (an iPhone's Return and spaces), so a window closed by Return in its own box would bring the ring back | **fixed: revision 1** (`a93023b6`), two checks pinned before their first run, 16/16; revision 0 fails the new typing check |
| A17 | none | restacked on A10.1 revision 1 (`fa634abb…00cb`); all its checks re-run |

The fix and the restack were re-checked: A10.1's harness, removal proof, dependencies and its 17 touched-layer harnesses (391/391); A17's harness, removal proof, the group removal (G3 exactly), every earlier G4 harness, and its touched layers. One timing check of the splash layer failed once under load on both A17 and G3 as live and passed when run again (see the group README).
