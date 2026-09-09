# Part F, Phase 0 — Source Reorganization for Maintainability

The sheet was one 14,735-line HTML file. It still ships as one 14,735-line HTML
file — that has not changed and is not meant to. What changed is that the file
is now **assembled from 39 source fragments** instead of being edited as a single
wall of text.

**This phase changed no behaviour.** The build output is byte-identical to the
file it was split from: same 1,442,614 bytes, same sha256
`211b4e54…7f1a64`. Not "equivalent" — identical.

---

## Build

From anywhere:

```bash
python3 build/recombine.py
```

Writes `l5r-character-sheet.html` beside the manifest. Add `--verify` to fail
the build if the output stops matching `expect_sha256`, or `--stdout` to pipe it.

Python 3 standard library only. No bundler, no npm install, no build framework.
The output is a plain double-click-and-go HTML file, exactly as before.

## Where things live

```
build/
  manifest.json     build order. Adding a source file means adding an entry here.
  recombine.py      the build: concatenate fragments -> single file
  split.py          one-shot bootstrap that created src/ from the Part E deliverable

src/
  shell/            the HTML skeleton, cut into the pieces that sit between blocks
                    (doctype/head, </style>..</head>, the <script> boundaries, tail)
  css/    6 files   sheet base -> carousel -> mobile -> rings -> dice icons -> print
  markup/ 2 files   swipe-tab shell; the fixed layers and modals hoisted out of it
  sheet/  21 files  the sheet's own script, by concern
  layer/  4 files   the Part D presentation layers (carousel, ring order/fit, dice icons)

qa/
  inventory.py            structural facts: ids, sections, seams, tag balance, hashes
  behaviour-harness.js    drives a real browser through the four roadmap flows
  baseline-*.json         recorded from the pre-split deliverable
  rebuilt-*.json          recorded from this tree's output
```

## Two things worth knowing before editing

**The `src/sheet/*.js` fragments are not modules.** They are consecutive slices
of one IIFE. No fragment parses as standalone JavaScript, and none is supposed
to — `010-prelude.js` opens `(function(){` and `210-test-seam-and-init.js` closes
it. Turning them into real modules would mean changing the sheet's logic, which
this phase deliberately does not do. Editors will flag unbalanced braces in
individual files; that is expected.

**Order in `manifest.json` is the build order.** The CSS cascade depends on it
(`60-sheet-print.css` is last so the print block wins), and so does the script
sequence (the sheet's own script must run before the Part D layers that decorate
its DOM). Reordering entries changes the output.

## What the split was cut along

The file's own section banners. Every fragment begins on a banner comment the
author already wrote — `// ========= PART C FEATURE 6: AMMO TRACKING =========`
and so on — so the boundaries are the ones the code already had, not new ones
invented for this phase.

The CSS layer boundaries were located by matching the Part D sidecar files
(`carousel.css`, `rings-circular.css`, …) against the built output and taking the
exact line ranges they occupy, rather than by eye.

## Why byte-identity, rather than a behavioural argument

The roadmap asks for "functional equivalence." Byte-identity is strictly
stronger and much cheaper to trust: if the rebuilt file is the same bytes, it is
the same program, and no amount of test coverage is needed to argue the point.

`split.py` guarantees it structurally. It refuses to run unless the manifest's
line ranges tile the source exactly — contiguous, no gaps, no overlaps, first
line to EOF. A fragment silently dropping or duplicating lines is the one failure
that would produce a build that looks fine and is not, so it is made impossible
rather than tested for. (It caught a real error during this phase: the source's
trailing newline made the tail fragment one line short.)

The QA below then confirms it empirically rather than taking the construction on
faith.

## QA results

Run against the rebuilt `l5r-character-sheet.html`, compared to baselines
recorded from the untouched Part E deliverable **before** anything was split.

| Check | Result |
|---|---|
| Byte-identical to pre-split build | **Yes** — sha256 matches; `cmp` reports no difference |
| Repeatable | 3 consecutive builds → 1 distinct hash |
| Sheet's own `<script>` unchanged | **Yes** — sha256 of the block itself matches |
| Element ids | 227 unique, 0 duplicated — unchanged |
| Sections / roll-modal overlays | 10 / 23 — unchanged |
| HTML tag balance | clean, and unchanged |
| `window.__L5R_TEST__` | present, 277 keys — unchanged |
| `window.__L5R_CAROUSEL__` | present, 10 methods — unchanged |
| Structural inventory diff | **zero keys differ** |
| Behavioural harness diff | **identical across all 14 flows** |
| Page errors | 0 |

The behavioural harness covers the four flows the roadmap names — character
load, a roll, a wound change, a tab switch — plus a save/load round-trip. It
pins `Math.random` to a seeded PRNG so dice are reproducible, and snapshots
every element carrying an id (~290 live nodes) rather than a hand-picked
shortlist, so an unnoticed change anywhere surfaces as a diff rather than
slipping past an assertion nobody wrote. Two independent runs produce identical
output, which is what makes the baseline-vs-rebuild diff meaningful.

### One known, pre-existing console message

Both runs log `Failed to load resource: net::ERR_CONNECTION_RESET`. That is the
sheet's Google Fonts `<link>` failing in a sandbox with no outbound network. It
is identical in baseline and rebuild, so it does not affect parity, and it is not
something this phase introduced. Worth noting for Phase 0.6, where offline
behaviour becomes a requirement rather than an accident.

### Numbers that differ from CLAUDE.md's stated invariants

`Versions/CLAUDE.md` records "all 209 original element IDs" and "16
`.roll-modal-overlay` blocks". The current build measures **227** ids and **23**
overlays. Those figures were written against the Part C line and the Part E monk
work has added to both since; they are stale, not violated. What this phase
guarantees is that the counts are *unchanged across the split*, which they are.
Flagging rather than quietly rewriting them — worth confirming the newer figures
before those lines get updated.
