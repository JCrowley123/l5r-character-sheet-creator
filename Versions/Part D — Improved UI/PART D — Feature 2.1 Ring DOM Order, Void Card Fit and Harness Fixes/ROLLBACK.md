# PART D — Feature 2.1 · Ring DOM Order, Void Card Fit and Harness Fixes

Part D is the UI and presentation line of work. This folder is **Feature 2.1**: three
corrections to Feature 2, found by measuring the build rather than by using it.

Built on Feature 2. The pentagon geometry is Feature 2's, unchanged — same angles,
same radius, same breakpoint. What is new is two small JavaScript sidecars and a
corrected copy of the regression harness.

---

## What changed and why

### 1. The five cards are now in clockwise document order

Feature 2 places the cards with CSS transforms alone, which moves them on screen
without moving them in the document. Sequential focus therefore still ran in the
order the sheet built them — Air, Earth, Fire, Water, Void — so tabbing round the
figure zigzagged: upper right, upper left, lower right, lower left, bottom.

`rings-order.js` moves them once, into the order they are read on screen:

    Air 1:12  ->  Fire 3:36  ->  Void 6:00  ->  Water 8:24  ->  Earth 10:48

CSS cannot do this. `order` and `flex-direction` reposition boxes but deliberately
leave sequential focus navigation alone, which is exactly why a visual-only reorder
is a WCAG 2.4.3 problem rather than a styling detail.

**This applies everywhere, not only to the pentagon.** Below 600px, and on paper,
the sheet's own grid now also lists the rings clockwise rather than
Air/Earth/Fire/Water/Void. That is deliberate — document order and reading order
then agree in every layout — but it does change the printed sheet. To put paper
back to the traditional order without giving up the focus fix, add `order:` values
to `.ring-card` inside the `@media print` block of `rings-circular.css`.

### 2. The pentagon reserves the room the Void card actually needs

Feature 2 sizes the container as `2 * --ring-radius + --ring-card-h`, with
`--ring-card-h` a fixed 260px allowance. The cards are centred on that container,
so the room below the centre is `radius + allowance / 2`, while the bottom card —
Void — reaches `radius + its own height / 2`. The allowance has to be at least the
Void card's height or the card hangs past the bottom of the section.

260px covers the default Void Rank of 2. It does not cover a high-Void character:
the card carries one 26px pip per rank with an 8px gap, wrapping three to a row at
the narrow card width. Measured at a 600px viewport, before the fix:

| Void Rank | Card height | Past the section border |
|---|---|---|
| 2 (default) | 247.5px | fits |
| 6 | 280.5px | fits — the section's own padding absorbs it |
| 7 | 315.5px | **6.8px** |
| 10 | 349.5px | **23.8px** |

Nothing overlapped and nothing was clipped, but the card visibly escaped the
parchment border. `rings-fit.js` measures the Void card and publishes its height to
`--ring-card-h`, so the container reserves exactly what the card needs.

`--ring-card-h: 260px` stays in the CSS as a **floor**. Every rank that fitted
before renders at exactly the height Feature 2 rendered it at — this only ever adds
room — and with scripting off, or with `rings-fit.js` deleted, the layout is
Feature 2's.

### 3. The regression harness no longer cries wolf

`l5r-carousel-test-harness.js` scored **28/35 on an ordinary load** of Feature 2.
Three of those failures were the harness's fault, not the build's, and all three had
one root cause: the sheet starts as a non-shugenja and hides `#spellSlotsSection`
(`applySchool` sets `style.display` directly), so the Spell Slots page withdraws
from the running order.

| Assertion | Was | Now |
|---|---|---|
| `track holds every page plus two clones` | compared `track.children.length` (12) against `getTabCount() + 2` (11) | allows for withdrawn pages via `getState().hiddenPages` |
| `snap geometry intact` | expected one page-width per child, but a withdrawn page is `display:none` and lays out no width | expects one per **visible** section, plus the two clones |
| `hidden section withdraws its tab` | set `display:'none'` on a section the sheet had already hidden, so the count could not drop | shows the section first, takes the baseline, then hides it |

`section returns cleanly` now compares against the count the suite started with
rather than the one it forced, so the suite still leaves the sheet as it found it.

`make_device_harness.py` was also corrected. Its mock Void card had two hardcoded
pips and no `.void-note`, which is why the Feature 2 measuring pass under-measured
the card by roughly 80px and never saw the overflow. The mock now carries the note,
takes its pip count from `VOID_PIPS` (default 2, set the environment variable to
measure the worst case), and runs the same sidecars the deliverable runs.

---

## Rollback

**Each fix is a single file, and the splice is file-guarded.**

| To drop | Delete | Then |
|---|---|---|
| clockwise DOM order | `rings-order.js` | `python splice_swipe_tabs.py` |
| the Void card fit | `rings-fit.js` | `python splice_swipe_tabs.py` |
| both | both files | the build is Feature 2 under a new name |

The harness fix needs no rollback — it is a test file, and it changes no behaviour.

**Or delete this whole folder**, and you are back to
`PART D — Feature 2 Circular Ring Layout`, the previous build, fully working.

There is nothing to un-patch at either level. This folder reads the read-only trunk
directly and writes only to itself.

## Files

| File | Role |
|---|---|
| `rings-order.js` | **Feature 2.1.** Clockwise document order. |
| `rings-fit.js` | **Feature 2.1.** Publishes the Void card's height to `--ring-card-h`. |
| `l5r-carousel-test-harness.js` | **Feature 2.1.** Three corrected assertions. |
| `make_device_harness.py` | **Feature 2.1.** Faithful Void card; runs the sidecars. |
| `rings-circular.css` | Feature 2's geometry, unchanged. Only the `--ring-card-h` comment differs. |
| `l5r-character-sheet part D feature 2.1 RINGS.html` | The deliverable. Generated — never hand-edit. |
| `splice_swipe_tabs.py` | Build script. Reads the trunk, writes the deliverable here. |
| `carousel.css`, `carousel-mobile.css`, `carousel.js` | Inherited from Feature 1.1, unmodified. |
| `CAROUSEL-TEST-API.md` | Inherited API reference. |

**If you rename the output HTML, update `DST` in `splice_swipe_tabs.py` to match**,
or the next rebuild writes to the old name and you end up with two builds.

## Restore points

| Layer | Folder | sha256 |
|---|---|---|
| Trunk, no carousel | `PART C — Feature 8 Mirumoto Rank 1` | `bfbbd19197c9fd81` |
| Desktop carousel | `PART D — Feature 1 swipe` | `c5462a7a70224388` |
| Mobile optimised | `PART D — Feature 1.1 …` | `5b19394c1c5595cf` |
| Circular rings | `PART D — Feature 2 …` | `d393123f242db61b` |
| **This — order, fit, harness** | `PART D — Feature 2.1 …` | `c0d9d4ad7766f1e4` |

## Verified

Measured in a real browser engine against the shipped file, not the mock. Every
build invariant still holds:

- the sheet's own `<script>` byte-identical to the trunk, all 807,671 characters
- 209 original element IDs preserved, none missing, none duplicated (217 with the
  carousel shell's own eight)
- 10 sections, 16 `.roll-modal-overlay` blocks, tag balance clean
- the trunk still hashes `bfbbd19197c9fd81` — never opened for writing
- the build is reproducible: two runs, same `c0d9d4ad7766f1e4`

The three fixes:

- **document order and focus order both read** air, fire, void, water, earth
- **no card escapes the section at any rank**, measured at Void 2, 7 and 10 across
  600 / 768 / 820 / 1024 / 1280 / 1440px — 18 combinations, zero escapes, zero
  overlaps. At the default rank the container is still exactly 660px at 600px wide,
  i.e. unchanged from Feature 2 wherever Feature 2 already fitted.
- **the harness scores 31/35 on an ordinary load**, up from 28/35, with the three
  targeted assertions passing and `section returns cleanly` still passing

Geometry unchanged from Feature 2: breakpoint exact (grid at 599px, pentagon at
600px), no horizontal overflow at any width, all five cards at an identical radius
72° apart.

### Not verified here

- The four assertions still failing (`exactly one page is interactive`, `only the
  current page is rendered`, and both loop-closure tests) are **the same four that
  fail on Feature 2** in this environment, and they are environmental. Headless
  Chrome under a virtual time budget fires no `scroll` or `scrollend` events at all
  — confirmed directly by assigning `scrollLeft` and counting: 0 and 0. The
  carousel's settle, and the clone teleport that closes the loop, are entirely
  event-driven. These need a real browser.
- Viewports below 504px. Headless Chrome would not go narrower, so the phone
  fallback was confirmed at 504px and 599px but not at 390px or 430px.
- Print output. The `@media print` path is unchanged from Feature 2, but the
  clockwise DOM order does change the order rings appear on paper — see the note in
  section 1 above. Nobody has put this build on paper yet.
- Appearance. Everything above is measurement. The pentagon has not been looked at.
