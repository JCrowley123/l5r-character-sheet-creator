# PART F — Phase 0.6.2 Splash Screen (FT-32's other half)

Cycle 5, Release 5a. On opening, the page showed its bare markup (the old toolbar row, empty boxes, no app bar)
until the main script had run: measured on 21 October at about 0.9 s from the saved copy with the CPU slowed to a
phone's, and about 7.5 s on a first visit over a slow 3G signal. A branded screen now covers it from the first paint.
The owner approved the look on 21 October from the [Splash Screen Mock-up](https://claude.ai/artifact/5XySSmAMtXiTPuA31DbKFq)
(filled seal), as a stand-in: **the owner is designing a better version**, so the look is kept apart from the logic
and can be replaced without touching it (below).

## How it works

| Part | Where | What |
|---|---|---|
| **The look** (replaceable) | `src/css/59.9999893-feat-splash-screen.css` (whole file) and block `splash-design` at the top of the body in `src/markup/10-swipe-tab-shell.html` | The cream background, the 記 seal, "Legend of the Five Rings" and "4th Edition Character Sheet"; larger from 768 px wide; no fade with reduced motion; never printed |
| **The logic** (keep) | Block `splash-logic`, straight after it | Leaves when the sheet says it is ready, on any script error, or 10 s after the page has parsed, so it is never left up. Fades (0.25 s) unless reduced motion is set; then removes the splash and its own script, so the page's markup is as it was without the layer. Switch `SPLASH_ENABLED` |
| Without scripts | Block `splash-noscript` in the head's `<noscript>` styles (`src/shell/02-style-close-head.html`) | Hidden |
| The ready signal | Block `splash-ready` at the end of `init()` (`src/sheet/210-test-seam-and-init.js`) | `document.dispatchEvent(new Event('l5r-sheet-ready'))` once the Characters list is set up |

The splash is first in the body, so it is parsed and painted before the rest of the page; the deploy's PWA head
(`head-pwa.html`, added before `</head>`) does not move it. It never takes a tap (`pointer-events: none`): until the
main script has run nothing under it responds anyway, and the test harnesses that tap by coordinates are unaffected.

**Known limits (the code review, 21 October):** Phase 0.6's one-time "Ready to use offline" notice (z-index 9999)
can play out under the splash on a slow phone's first visit, and it is shown only once. The removal registry finds
this layer by its marker (kind "text"), so an old fixture that strips fragment releases only
(`strip_later(fixes=False)`, BUGFIX — Kitsune Shugenja's variants) leaves it applied: harmless, as it takes no taps
and removes itself.

## Replacing the design

The logic needs only **one element with `id="l5rSplash"`**. It adds the class **`is-leaving`** when the sheet is
ready (style it for a fade-out, or not at all) and removes the element about 0.3 s later.

1. Replace everything between `<!-- PART F PHASE 0.6.2 BEGIN splash-design -->` and `<!-- END SPLASH062 splash-design -->`
   in `src/markup/10-swipe-tab-shell.html` with the new markup, keeping `id="l5rSplash"` on its outer element. Keep
   the two marker lines.
2. Replace the rules in `src/css/59.9999893-feat-splash-screen.css`, keeping its first and last comment lines.
   Keep three things: the outer element **covers the screen** (`position: fixed; inset: 0`), stays **on top**
   (`z-index: 2147483000`) and **takes no taps** (`pointer-events: none`); and keep the print and reduced-motion
   rules.
3. Pictures: inline them (an SVG in the markup, or a `data:` URL in the CSS). A file next to the page would be missing
   from the saved offline copy until the service worker learns it.
4. Rebuild (`build/recombine.py`), update `expect_sha256` in `build/manifest.json` and this layer's record, and run
   `qa/splash-harness.js`. It checks the logic's contract only (cover, never a tap, leave on ready, on an error or
   without the script, never printed, hidden without scripts), never the look, so a new design keeps passing it.
   Run `qa/verify-variants.py`; if the new CSS no longer holds the exact `pointer-events` or print lines it mutates,
   update those two mutation strings to the new lines.

## QA

| Measure | Result |
|---|---|
| Own harness, `qa/splash-harness.js` (the sheet and a built site) | **13/13** |
| The same harness on `main` (the live site) | **1/13**: there is no splash; only "no page errors" holds either way |
| Pinned variants, `qa/verify-variants.py` (dry-run first: 10 mutations unique) | **all 10 matched**: switch off 6; takes taps 1; no ready signal 3; no error listener 1; no safety timer 1; no noscript rule 1; printed 1; never fades 1; its script left behind 1; not first in the deployed page 1 |
| Removal, `qa/test-removal.py` | **6/6**: rebuilds `37eebd80…` (the build with the Clan & School fix, 6,728,218 bytes) byte for byte |
| Removal chain registry | registered by its marker (`present_text`), as its CSS fragment sits inside the page's styles, early in the manifest; `qa/test-chain.py` **11/11** |
| Sheet build with all of 5a | 6,732,527 bytes, `e8d2420e…` |
