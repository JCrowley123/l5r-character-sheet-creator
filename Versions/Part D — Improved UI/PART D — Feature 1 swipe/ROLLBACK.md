# PART D — Feature 1 · Swipe-Tab Carousel

Part D is the UI and presentation line of work. This folder is **Feature 1**: the
swipe-tab carousel, built on top of the Part C Feature 8 sheet. Everything the
feature produces lives here and nowhere else.

Superseded by the current build:
`PART D — Feature 1.1 Swipe Mobile Optimization & Cross-Device Testing`.
This folder is kept as the desktop-complete fallback — it is not a dependency of
1.1, and the two do not share a single file.

---

## Rollback

**Delete or rename this folder.** That is the whole procedure.

`PART C — Feature 8 Mirumoto Rank 1` is the trunk and is **read only** — the build
script opens it and never writes to it, so it remains exactly as it was before this
feature existed. Go back to using

```
PART C — Feature 8 Mirumoto Rank 1/l5r-character-sheet part C feature 8 mirumoto.html
```

and the swipe-tab UI is simply gone.

There is nothing to un-patch, no edits to revert inside the trunk, and no shared
files between the folders.

## Partial rollback

The feature also degrades in place, without touching any files:

| To disable | Do this |
|---|---|
| The whole carousel, at runtime | Remove `car-active` from `<body>` in the build. The original single-page sheet returns. |
| The carousel, if JavaScript fails | Already automatic — `safeInit()` catches, strips `car-active`, and falls back. |
| The carousel, with scripting off | Already automatic — a `<noscript>` block unwinds the shell to the stacked layout. |
| Deferred rendering only | Delete the `.car-page[inert]` rule in `carousel.css` §5c. |
| The test seam only | Delete the `PHASE 7 — TEST HARNESS SEAM` block in `carousel.js` and the single `window.__L5R_CAROUSEL__ = API;` line in `init()`. |

## Files

| File | Role |
|---|---|
| `l5r-character-sheet part D feature SWIPE.html` | **The deliverable.** Generated — do not hand-edit; edit the sidecars and re-run the splice. |
| `splice_swipe_tabs.py` | Build script. Reads the trunk, writes the deliverable here. Anchor-asserted: it fails loudly rather than producing a wrong file if the trunk shifts. |
| `carousel.css` | All carousel styling. Edit this, not the generated HTML. |
| `carousel.js` | The carousel controller. Edit this, not the generated HTML. |
| `l5r-carousel-test-harness.js` | Regression suite. Paste into the console with the sheet open. |
| `CAROUSEL-TEST-API.md` | `window.__L5R_CAROUSEL__` reference. |
| `phase1-carousel-demo.html` | Standalone early prototype with placeholder pages. Not part of the deliverable. |

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

## Where this sits

| Layer | Folder | sha256 |
|---|---|---|
| Trunk, no carousel | `PART C — Feature 8 Mirumoto Rank 1` | `bfbbd19197c9fd81` |
| **This — desktop carousel** | `PART D — Feature 1 swipe` | `c5462a7a70224388` |
| Current — mobile optimised | `PART D — Feature 1.1 …` | `5b19394c1c5595cf` |

Every layer reads the read-only trunk and carries its own copies of the build
inputs, so no layer depends on any other and any one can be deleted without
disturbing the rest.

## Guarantees the build asserts

- The sheet's own `<script>` is copied **byte-identical** from the trunk.
- All 209 original element IDs are preserved; none removed, none duplicated.
- 10 sections and 16 modal overlays preserved.
- Not one character inside any `.section` is altered — the splice only re-parents them.
