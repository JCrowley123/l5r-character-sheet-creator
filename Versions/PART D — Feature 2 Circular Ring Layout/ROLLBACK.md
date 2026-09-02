# PART D — Feature 2 · Circular Ring Layout

Part D is the UI and presentation line of work. This folder is **Feature 2**: the
five Ring cards arranged as a regular pentagon with Void at the bottom, instead of
a row of five.

Built on Feature 1.1. **The entire feature is one CSS file** — no JavaScript, no
markup changes, nothing touched in the sheet.

---

## Rollback

**Delete `rings-circular.css` and re-run the splice.**

```bash
python splice_swipe_tabs.py
```

The injection in `splice_swipe_tabs.py` is file-guarded (`if os.path.isfile(...)`),
so removing the file alone is a complete rollback — the Rings section reverts to the
sheet's own five-column grid and nothing else changes.

**Or delete this whole folder**, and you are back to
`PART D — Feature 1.1 Swipe Mobile Optimization & Cross-Device Testing`, the previous
build, fully working.

There is nothing to un-patch at either level. This folder reads the read-only trunk
directly and writes only to itself.

## Tuning without rebuilding your understanding

Everything adjustable is in section 1 of `rings-circular.css`:

| Variable | Default | Effect |
|---|---|---|
| `--ring-radius` | `clamp(200px, 22vw, 260px)` | Size of the circle |
| `--ring-card-w` | `clamp(132px, 15vw, 178px)` | Card width |
| `--ring-card-h` | `260px` | Vertical room reserved for the tallest card. Container height only — never the geometry. |
| `--ring-rotation` | `0deg` | Spins the whole pentagon. Not needed — the per-ring angles already land correctly. |

The five per-ring angles are in section 2, 72° apart.

### How the angles were resolved

The original brief's table was internally inconsistent: taken literally
(0° = 3 o'clock, positive clockwise, the CSS convention) its angles put **Water** at
the bottom and **Void at about 8 o'clock**, while the brief also stated that Void
sits at 6 o'clock.

Resolved by **swapping Void and Water**: Void takes 90° (the bottom), Water takes
162°. Earth, Air and Fire keep their original values *and* their original clock
positions, so every clock reading in the brief now holds simultaneously and no
whole-figure rotation is required.

## Where the cards land

Measured at 1100px wide:

| Ring | Angle | Clock | Offset from centre |
|---|---|---|---|
| Air | −54° | 1:12 | +142, −196 |
| Fire | 18° | 3:36 | +230, +75 |
| **Void** | **90°** | **6:00** | **0, +242** |
| Water | 162° | 8:24 | −230, +75 |
| Earth | −126° | 10:48 | −142, −196 |

All five sit at an identical radius, 72° apart, mirror-symmetric about the vertical —
a regular pentagon with one vertex pointing straight down.

The offsets scale with `--ring-radius`, so on a wider screen every number grows in
proportion; the ratios (0.588 / 0.951 / 0.309 of the radius) stay fixed.

## Responsive behaviour

| Width | Layout |
|---|---|
| ≥ 1200px | pentagon, larger radius and cards |
| 600–1199px | pentagon |
| < 600px | **the sheet's own grid** — Feature 1.1's phone layout is untouched |

600px is a measured floor, not a guess. The figure needs

    2 x 0.951 x radius + card width  =  2 x 0.951 x 200 + 132  =  512px

of content width. A 600px viewport leaves 576px after page and section padding,
so it fits with room to spare. Verified: grid at 599px, pentagon at 600px.

**No phone can take this layout in portrait.** The widest — a Pro Max at 430px —
leaves 406px of content, and two cards break out of the section. Putting rings on
a phone would need a different card (name and value only, traits listed below the
circle), which is a redesign rather than a breakpoint change, and would require
JavaScript because the sheet builds trait rows inside each ring card.

Printing also reverts to the original five-column row — a pentagon spread across a
page is not what you want on paper.

## Files

| File | Role |
|---|---|
| `rings-circular.css` | **Feature 2.** The whole feature. |
| `l5r-character-sheet part D feature 2 RINGS.html` | The deliverable. Generated — never hand-edit. |
| `splice_swipe_tabs.py` | Build script. Reads the trunk, writes the deliverable here. |
| `carousel.css`, `carousel-mobile.css`, `carousel.js` | Inherited from Feature 1.1, unmodified. |
| `make_device_harness.py` | Rebuilds `_device_harness.html`, now with faithful `.ring-card` markup for measuring the pentagon. |
| `l5r-carousel-test-harness.js`, `CAROUSEL-TEST-API.md` | Inherited regression suite and API reference. |

**If you rename the output HTML, update `DST` in `splice_swipe_tabs.py` to match**,
or the next rebuild writes to the old name and you end up with two builds.

## Restore points

| Layer | Folder | sha256 |
|---|---|---|
| Trunk, no carousel | `PART C — Feature 8 Mirumoto Rank 1` | `bfbbd19197c9fd81` |
| Desktop carousel | `PART D — Feature 1 swipe` | `c5462a7a70224388` |
| Mobile optimised | `PART D — Feature 1.1 …` | `5b19394c1c5595cf` |
| **This — circular rings** | `PART D — Feature 2 …` | `d393123f242db61b` |

## Verified

Measured in-browser against real `.ring-card` markup and the trunk's own stylesheet:

- five cards at an identical radius, 72° apart, zero overlaps at 600 / 768 / 820 /
  1100 / 1280 / 1440px
- Void at exactly 6:00 with a horizontal offset of 0px; every ring on the
  requested clock position, verified against the table above
- mirror symmetry confirmed to within 2px on both pairs
- breakpoint exact: grid at 599px, pentagon at 600px; fallback intact at 390px and 430px
- no horizontal overflow anywhere; nothing escapes the section
- Phases 1–9 unaffected: scroll-snap, clones, IDs, ARIA, deferred rendering, the
  test API and the responsive layout all still pass
