# PART D — Feature 1.1 · Swipe Mobile Optimization & Cross-Device Testing

Part D is the UI and presentation line of work. This folder is **Feature 1.1**: the
content-area responsive pass over the swipe-tab carousel, for phones, tablets and
foldables. It is **the current build**. Everything it produces lives here only.

---

## The three layers

| Folder | Contains | Status |
|---|---|---|
| `PART C — Feature 8 Mirumoto Rank 1` | the trunk sheet | **READ ONLY** — never written to by either swipe layer |
| `PART D — Feature 1 swipe` | the desktop-complete carousel | **frozen** — 1.1 never writes here; it stays a working fallback |
| `PART D — Feature 1.1 …` (this folder) | mobile + cross-device | **active** |

This folder reads the **trunk** directly and carries its own `carousel.css`,
`carousel-mobile.css` and `carousel.js`. It depends on nothing inside
`PART D — Feature 1 swipe`, so the two layers are independent — neither can break
the other.

> An animation layer (`PART D — Feature 1.2 Animation Refinement`) was built on top
> of this one and then removed at the user's request. Nothing here references it,
> and no trace of it remains.

## Rollback

**Delete or rename this folder.**

You are then back to `PART D — Feature 1 swipe`, fully working — carousel, looping,
keyboard, gestures, deferred rendering and test seam all intact. Only the mobile
refinements are gone.

**Delete both Part D folders** and you are back to the plain Part C Feature 8 sheet,
with no carousel at all. The trunk was never modified, so there is nothing to
un-patch.

### Softer rollbacks, no files touched

| To disable | Do this |
|---|---|
| The whole carousel, at runtime | Remove `car-active` from `<body>`. The original single-page sheet returns. |
| The carousel, if JavaScript fails | Automatic — `safeInit()` catches, strips `car-active`, falls back. |
| The carousel, with scripting off | Automatic — the `<noscript>` block unwinds the shell to the stacked layout. |
| The responsive rules only | Delete `carousel-mobile.css` and re-run the splice. The injection is file-guarded, so nothing else needs editing. |

## Files

| File | Role |
|---|---|
| `l5r-character-sheet part D feature 1.1 SWIPE-MOBILE.html` | **The deliverable.** Generated — never hand-edit; edit the sidecars and re-run. |
| `splice_swipe_tabs.py` | Build script. Reads the trunk, writes the deliverable here. Anchor-asserted: fails loudly rather than producing a wrong file. |
| `carousel.css` | Base carousel styling from Feature 1. |
| `carousel-mobile.css` | **Feature 1.1.** All responsive/content-area rules, in their own file so the layer lifts out cleanly. |
| `carousel.js` | The carousel controller, including the table-cell labelling the stacked layout needs. |
| `make_device_harness.py` | Rebuilds `_device_harness.html` — the trunk's real stylesheet around faithful copies of every structure this layer targets. Re-run it to re-test at any viewport. |
| `l5r-carousel-test-harness.js` | Regression suite — paste into the console with the sheet open. |
| `CAROUSEL-TEST-API.md` | `window.__L5R_CAROUSEL__` reference. |

## Rebuild

```bash
python splice_swipe_tabs.py
```

Runnable from any working directory — paths resolve against the script's own
location, so renaming or moving this folder does not break it. It refuses to run if
the trunk folder is missing rather than guessing.

**If you rename the output HTML, update `DST` in `splice_swipe_tabs.py` to match.**
Otherwise the next rebuild writes to the old name and you end up with two builds
side by side and no way to tell which is current.

## Restore points

| Layer | Folder | sha256 |
|---|---|---|
| Trunk, no carousel | `PART C — Feature 8 Mirumoto Rank 1` | `bfbbd19197c9fd81` |
| Desktop carousel | `PART D — Feature 1 swipe` | `c5462a7a70224388` |
| **This — current build** | `PART D — Feature 1.1 …` | `5b19394c1c5595cf` |

Trunk verified untouched: `bfbbd19197c9fd81`, matching the hash recorded in the
Feature 8 folder's own `DIFF-SUMMARY-vs-Feature7.md`.
