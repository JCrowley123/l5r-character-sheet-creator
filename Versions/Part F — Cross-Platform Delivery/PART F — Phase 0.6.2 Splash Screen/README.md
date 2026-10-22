# PART F — Phase 0.6.2 Splash Screen (FT-32's other half)

Cycle 5, Release 5a. On opening, the page showed its bare markup (the old toolbar row, empty boxes, no app bar)
until the main script had run: measured on 21 October at about 0.9 s from the saved copy with the CPU slowed to a
phone's, and about 7.5 s on a first visit over a slow 3G signal. A branded screen now covers it from the first paint.
The owner approved a stand-in look on 21 October from the [Splash Screen Mock-up](https://claude.ai/artifact/5XySSmAMtXiTPuA31DbKFq)
(filled seal), kept apart from the logic so it could be replaced.

**Release 5a.2 (22 October 2026): the owner's artwork.** The stand-in is replaced by the owner's three pictures (in
`art/`), one by screen shape: portrait for phones, square for foldables, wide for laptops. The owner's decisions: the
splash stays **at least 5 s** ("so the artwork is shown"), and **a switch for the test suite** keeps the suite's
harnesses on 5a's behaviour. Proposed and not objected to: **tap to continue** once the sheet is ready.

## How it works

| Part | Where | What |
|---|---|---|
| **The look** (replaceable) | `src/css/59.9999893-feat-splash-screen.css` (whole file) and block `splash-design` at the top of the body in `src/markup/10-swipe-tab-shell.html` | The owner's artwork, inlined as `data:` URLs by `art/inline-art.py`: a `<picture>` shows the portrait picture up to 2:3 (phones), the wide one from 4:3 (laptops, a phone turned sideways), the square one between (foldables opened out, tablets). Always whole (`object-fit: contain`) on the paper colour `#fde8d0`. The name is in hidden text for screen readers. Takes taps and no zoom or scroll gestures (`touch-action: none`). No fade with reduced motion; never printed |
| **The logic** (keep) | Block `splash-logic`, straight after it | Stays at least `SPLASH_MIN_MS` (5,000) from when it appears and until the sheet says it is ready; once ready, a tap leaves at once (before that a tap does nothing). Leaves at once on any script error, and 10 s after the page has parsed whatever happens, so it is never left up. As it leaves it lets taps through, fades (0.25 s) unless reduced motion is set, then removes the splash and its own script, so the page's markup is as it was without the layer. Switch `SPLASH_ENABLED` |
| **The test switch** | `window.__L5R_SPLASH_FAST__ === true` in the logic; set by `qa/splash-fast.cjs` | A Playwright preload that gives every page a harness opens the flag before the page's scripts. Then the splash leaves as soon as the sheet is ready and lets taps through, exactly 5a's behaviour. The suite's flat runner (`QA — Cycle 5 Release 5a 2026-10-21/qa/flat-suite-runner.js`) preloads it into every leaf |
| Without scripts | Block `splash-noscript` in the head's `<noscript>` styles (`src/shell/02-style-close-head.html`) | Hidden |
| The ready signal | Block `splash-ready` at the end of `init()` (`src/sheet/210-test-seam-and-init.js`) | `document.dispatchEvent(new Event('l5r-sheet-ready'))` once the Characters list is set up |

The splash is first in the body, so it is parsed and painted before the rest of the page; the deploy's PWA head
(`head-pwa.html`, added before `</head>`) does not move it. Since 5a.2 it **takes taps** until it leaves, so a tap on
the artwork never reaches a button hidden beneath it. Harnesses that tap by coordinates therefore need the test switch:
the suite has it; outside the suite, run them with `node --require "<this folder>/qa/splash-fast.cjs" …` (as
`qa/verify-live.py` does). `page.click` without the switch waits for the splash to leave (about 5 s).

**Size.** The three pictures add 1,154,978 bytes to the page (6,738,652 → 7,893,630 deployed): about 0.9 MB more to
download, compressed (2.39 MB → 3.29 MB), on a first visit and with each new release; the saved copy opens offline as
before. The pictures are inline so the splash works offline and from a saved file.

**Known limits (the code review, 21 October):** Phase 0.6's one-time "Ready to use offline" notice (z-index 9999)
can play out under the splash on a slow phone's first visit, and it is shown only once. Since 5a.2 (5 s minimum) it
usually does on any first visit: it shows for 3.2 s soon after the page has parsed. Holding it until the splash has
gone would be a change to Phase 0.6's layer (not made). The removal registry finds
this layer by its marker (kind "text"), so an old fixture that strips fragment releases only
(`strip_later(fixes=False)`, BUGFIX — Kitsune Shugenja's variants) leaves it applied. Those variants are not part of
the suite; since 5a.2 run them with the test switch. A key press does not dismiss the splash; a click does.
**Parked (the owner's device checks, 22 October; Phase 15 or the parked items):** the picture is shown whole
(`contain`), so a screen of another shape gets bands of paper colour at the sides. The owner saw them on an iPhone
16e and in Edge on a 1536 × 864 laptop. The owner wants it to fill any phone, laptop or desktop screen, scaled to
fit (`cover`, keeping the title in view).

## Replacing the design

The logic needs only **one element with `id="l5rSplash"`**. It adds the class **`is-leaving`** when it leaves (style it
for a fade-out, or not at all), sets `pointer-events: none` on it, and removes it about 0.3 s later.

1. To change the pictures only: replace the files in `art/` (same names) and run `python -B art/inline-art.py`, which
   rewrites the `splash-design` block. For a new design, replace everything between
   `<!-- PART F PHASE 0.6.2 BEGIN splash-design -->` and `<!-- END SPLASH062 splash-design -->` in
   `src/markup/10-swipe-tab-shell.html`, keeping `id="l5rSplash"` on its outer element and the two marker lines.
2. Replace the rules in `src/css/59.9999893-feat-splash-screen.css`, keeping its first and last comment lines.
   Keep three things: the outer element **covers the screen** (`position: fixed; inset: 0`), stays **on top**
   (`z-index: 2147483000`), **takes taps** (`pointer-events: auto`) and **no gestures** (`touch-action: none`); and keep
   the print and reduced-motion rules.
3. Pictures: inline them (an SVG in the markup, or a `data:` URL). A file next to the page would be missing from the
   saved offline copy until the service worker learns it.
4. Rebuild (`build/recombine.py`), update `expect_sha256` in `build/manifest.json` and this layer's record, and run
   `qa/splash-harness.js`. It checks the logic's contract (cover, take taps, stay 5 s, leave on ready, on a tap, on an
   error or without the script, never printed, hidden without scripts, the test switch) and that the picture shown has
   the screen's shape and is whole, so a new design with art by shape keeps passing. Run `qa/verify-variants.py`; if the
   new markup or CSS no longer holds a line it mutates (the `pointer-events`, `touch-action`, print, `object-fit` and
   wide `<source>` lines), update those mutation strings to the new lines.

## QA

| Measure | Result |
|---|---|
| Own harness, `qa/splash-harness.js` (the sheet and a built site) | 5a: **13/13**. 5a.2: **19/19** (`qa/splash.log`) |
| The same harness on `main` | 5a: **1/13** (no splash). 5a.2 on 5a's `main`: **12/19** (`qa/splash-main.log`): the 7 new behaviours fail (5 s minimum, its fade, takes taps, both tap checks, art by shape, the switch line); 5a's contract passes |
| Pinned variants, `qa/verify-variants.py` (dry-run first: mutations unique) | 5a: all 10 matched. 5a.2: **all 18 matched** (`qa/variants.log`): switch off 12; passes taps 3; gestures reach the page 1; no minimum 4; no ready signal 4; tap ignored after ready 1; tap before ready leaves 1; takes taps while fading 1; no test switch 3; no error listener 1; no safety timer 1; no noscript rule 1; printed 1; never fades 2; its script left behind 1; no wide picture 1; cropped 1; not first in the deployed page 1 |
| Removal, `qa/test-removal.py` | **6/6**: rebuilds `37eebd80…` (the build with the Clan & School fix, 6,728,218 bytes) byte for byte |
| Removal chain registry | registered by its marker (`present_text`), as its CSS fragment sits inside the page's styles, early in the manifest; `qa/test-chain.py` **11/11** |
| Sheet build with all of 5a | 6,733,003 bytes, `70bbf994…`. With 5a.2: 7,887,981 bytes, `f59aaa2f…` |
