# Stance icons — artwork swap

Three of the five stance tiles now use the artwork from `L5R character sheet\Art\Stances\`
instead of the original inline line-art SVGs.

| Stance | Kamae | Source file |
|---|---|---|
| **Attack** | jōdan-no-kamae | `Attack Stance (jōdan no kamae)\Jōdan‑no‑Kamae transparent thin line‑weight minimal‑shading.png` |
| **Defence** | hassō-no-kamae | `Defence Stance (Hassō-no-kamae)\Hassō-no-kamae transparent medium line‑weight minimal‑shading.png` |
| **Full Defence** | chūdan-no-kamae | `Full Defence Stance (chūdan‑no‑kamae)\chūdan‑no‑kamae transparent thick line‑art.png` |

**Full Attack** and **Center** still use their original SVGs — the `Full Attack Stance` folder is
empty, and Center was not part of the request. `Centre Stance (Gedan-no-kamae)\Gedan-no-kamae
transparent thin line‑art.png` is sitting there ready if you want it.

---

## Re-run the patch after any re-splice

`splice_feature7.py` rebuilds the HTML from the Feature 6 trunk, which puts the **old SVG icons
back**. The order is:

```bash
python splice_feature7.py
python patch_stance_icons.py
```

`patch_stance_icons.py` matches on the full original SVG lines, so running it twice fails loudly
rather than corrupting the file. That is deliberate — if it errors with `ANCHOR [attack]: 0
occurrences`, the build is already patched.

## Adding more stance art

The patch processes the images itself rather than carrying pre-baked base64, so adding a stance
is one line in `SOURCES` at the top of `patch_stance_icons.py`:

```python
'fullAttack': ("Full Attack Stance", "your-file.png", 12),
```

The third value is the body-detection erosion radius — start around 10, run the script, and check
the body size it prints against the whole drawing (see below). Also add the stance to `ORDER`, and
add the matching entry to `ORIGINAL` (copy the stance's current SVG line out of the HTML). Then
re-run. Requires Pillow: `python -m pip install Pillow`.

Adding a stance re-balances the whole set: the common body height is recomputed across every
image, so if the new pose is the most sword-hungry it becomes the limiter and all five shrink
slightly to accommodate it.

## What the patch does to each image

1. Crops to the **visible** artwork — see the fringe note below.
2. Measures the **body** separately from the sword — see below.
3. Scales every figure to a common body height and bottom-aligns it on a shared ground line,
   inside a **176×198** canvas (2× the 88×99 css box, for HiDPI screens).
4. Embeds it as a `data:` URI, keeping the sheet a single self-contained file.

Total added: **~76 KB** across the three icons (1,178,717 → 1,255,233 chars).

### Sizing on the swordsman, not the drawing

Fitting each drawing to the tile does *not* make the samurai look the same size, because the
sword is part of the drawing and every stance holds it differently — jōdan raises it overhead,
hassō holds it vertical, chūdan extends it horizontally. Scaled to a common box, chūdan's figure
comes out small because its sword eats the width.

So the sword is measured separately from the swordsman. A morphological **opening** — erode by
`k`, then dilate by `k` — dissolves the blade (a long thin stroke) while restoring the figure (a
thick blob) to its true size; the bounding box of the opened mask is the body:

| Stance | Whole drawing | Body found | `k` |
|---|---|---|---|
| Attack (jōdan) | 339×644 | 280×**544** | 6 |
| Defence (hassō) | 498×986 | 473×**743** | 10 |
| Full Defence (chūdan) | 1088×944 | 499×**922** | 20 |

Note how differently the sword sits in each: it costs jōdan 16% of its height, hassō 25% of its
height, and chūdan **54% of its width**.

Every figure is then drawn at the same body height, and that height is the largest one at which
every drawing — sword included — still fits the box. Full Defence is the limiter, via its
outstretched blade. The result is **72 css px of body in each tile**, up from roughly 50–57 px
before, with no sword crossing a tile edge.

`k` has to clear the blade without eating the figure's own thin parts, so it depends on how thick
that drawing's linework is; these three were checked by drawing the detected box back over the
artwork. The script prints the body it found on every run, so a bad value shows up at once — a
body much shorter than the drawing means the legs were eroded, one nearly as wide means the sword
survived.

### The near-invisible fringe

Two of the exports carry a halo of almost-transparent pixels spanning nearly the whole canvas:

| File | bbox at `alpha>0` | bbox at `alpha>8` |
|---|---|---|
| jōdan (Attack) | 732×1023 | **339×644** |
| hassō (Defence) | 745×998 | **498×986** |
| chūdan (Full Defence) | 1088×944 | 1088×944 — no fringe |

Cropping at `alpha>0` therefore fitted the *halo* to the tile and left the figure at roughly half
the size of the others — Attack painted 23×46px where Full Defence painted 72×63px. The patch
crops at `ALPHA_FLOOR = 8` instead; every file's bounding box is stable from 8 upward, so nothing
real is lost.

This matters twice over: the fringe would otherwise corrupt the body measurement as well as the
crop, since a halo spanning the whole canvas survives the opening and the "body" would come back
as the entire image.

## All five tiles are the same size

Two separate things made them disagree, and the patch fixes both in CSS:

* **"Full Defense" is the only name long enough to wrap** to a second line at narrow widths, which
  made its tile 14px taller than the rest (147 vs 133).
* **`grid-auto-rows: auto`** sizes every row to its own content, so as soon as the grid wraps to
  more than one row — which it does on a narrow window or a phone — the rows disagree too.

`grid-auto-rows: 1fr` makes every row the height of the tallest, `height: 100%` on
`.stance-tile-btn` lets the button fill the cell it was given instead of hugging its own text, and
`justify-content: flex-start` keeps every icon the same distance from the top of its tile so a
two-line name grows downward rather than shoving its icon out of line.

Verified in both layouts: 5-across on a wide sheet (all 122×177) and single-column when wrapped
(all 104×172), with every icon at the same 13px offset from the top of its tile, every figure's
feet 2px off the canvas floor, and no drawing overflowing its box in either layout.

## Two deliberate consequences

**The icon box grew from 30×30 to a portrait 88×99**, filling the tile's full content width. At
30px these figures were an unreadable smudge. The box is portrait because two of the three poses
are tall, and the PNG canvas uses the same 88:99 aspect so a contain-fitted `<img>` fills it with
no letterboxing — which matters, because letterboxing would silently shrink the figures and undo
the body matching. It is `width:100%` with a `max-width` so it grows a little on a wide sheet and
never runs away on a very wide one. The two remaining SVG icons scale up with it; their default
`preserveAspectRatio` keeps them square and centred in the taller box rather than stretching.

Tiles are now ~172px tall rather than ~133px. That is the cost of legible artwork.

**Selection is shown by opacity, not colour.** The SVG icons use `currentColor`, so they turn from
gold to shu red when their stance is selected. A raster image cannot do that. The artwork is
dimmed to `opacity:.72` when unselected, `.9` on hover and `1` when selected; the tile's border,
background tint and name colour carry the rest of the selected state exactly as before. Print
forces full opacity.

A CSS `mask-image` would have preserved `currentColor` tinting, but it would flatten the art to a
solid silhouette — these are line drawings whose white fill and grey shading are the whole point,
so masking was the wrong tool.

## One regression assertion updated

`l5r-P1-P2-F2-test-harness.js` **F2-A5** counted `.stance-icon svg` and expected 5. Three icons
are now `<img>`, so the selector was widened to `.stance-icon svg, .stance-icon img`. The
assertion's intent — that all five tiles carry an icon — is unchanged and still enforced. No other
assertion in any suite was touched.

## Verification status

Run against the patched build:

| Suite | Result |
|---|---|
| Feature 6 (154) + its eight nested suites — Feature 4, 3, 2, 1, P1/P2, Feature 0, Part B, schoolfree — **594 regression assertions** | **all green** |
| Feature 2 stance suite, including the updated F2-A5, plus its nested Feature 1 (80), P1/P2 (46), Feature 0 (72) and Part B (127) | **84/84, all nested green** |
| `splice_feature7.py` reproduces the trunk build byte-for-byte before patching | sha `32df9f2fec6c2427` |
| DOM check: all five tiles equal in wide and wrapped layouts, icons aligned, feet on a common ground line, no sword overflowing a tile, selected/unselected opacity | **confirmed** |

**The Feature 7 suite itself (156 tests) was not re-run to completion.** The browser pane used
here keeps its tab hidden, so `setTimeout` is throttled to roughly one second per call instead of
five milliseconds — about 190× slower — and that suite drives modal prompts through hundreds of
timer waits. Two attempts stalled part-way. This is an artefact of the headless pane, not of the
build: the stalls landed at different points each run, and the same harness completed 904/904
before the icons changed.

Nothing in this patch touches dual-wielding — it changes three strings in `STANCE_ICONS` and the
`.stance-icon` CSS block. The stance-related suite that *would* catch an icon regression (Feature
2) passes. To close the loop yourself, in an ordinary browser tab:

```bash
python -m http.server 8813 --directory "."
```

```js
fetch('/l5r-P1-P2-F7-test-harness.js').then(r=>r.text()).then(s=>(0,eval)(s)).then(o=>console.log(o.failed))
```

Expect `0`, with all nine sub-suites reporting `failed: 0`.
