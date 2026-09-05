# PART E — Feature 1.1 · Monks & Kiho (Part D UI)

The monk and Kiho feature **with** the Part D presentation layer on top: swipe-tab
carousel, mobile optimisation, circular Ring layout, and the gold d10 roll buttons.

This is the deliverable to open. `PART E — Feature 1 Monks & Kiho` is the trunk it is
built from, and remains the place to edit the sheet's logic.

---

## What this folder is

A **presentation layer**, exactly like the Part D folders — same script, same sidecars,
same anchor-asserted build. The only difference is which trunk it reads:

| | Part D layers | This folder |
|---|---|---|
| Trunk | `PART C — Feature 8 Mirumoto Rank 1` | `PART E — Feature 1 Monks & Kiho` |
| Deliverable | `…part D feature 3.1 DICE.html` | `…part E feature 1.1 MONKS UI.html` |

It carries its own copies of every build input (`carousel.css`, `carousel-mobile.css`,
`carousel.js`, `rings-circular.css`, `rings-order.js`, `rings-fit.js`, `dice-icons.css`,
`dice-icons.js`), so it depends on no other layer and no other layer depends on it.

## Building

```bash
python splice_swipe_tabs.py
```

Reads the Part E trunk, injects the sidecars, writes the deliverable beside this file.
Runnable from any working directory. **Edit the sidecars, never the generated HTML.**

## How the anchors were re-derived

The splice is anchor-asserted against hardcoded 1-based line numbers in the trunk, and the
Part E trunk is the Part C trunk plus the monk feature's insertions — so all nineteen
anchors moved. They were **not** hand-counted. An old-line → new-line map was built with
`difflib` over the two trunks and every anchor rewritten through it, which matters because
the shift is not constant: the monk markup landed in several different sections.

| anchor | Part C | Part E | shift |
|---|---|---|---|
| `CSS_INSERT` | 1346 | 1352 | +6 |
| `BODY_OPEN` / `WRAP_OPEN` | 1420 / 1421 | 1426 / 1427 | +6 |
| `TOPBAR_A` / `TOPBAR_B` | 1423 / 1449 | 1429 / 1455 | +6 |
| `TAIL_A` | 1742 | 1772 | +30 |
| `FOOTER` / `WRAP_CLOSE` | 2083 / 2084 | 2113 / 2114 | +30 |
| `SCRIPT_OPEN` | 2086 | 2116 | +30 |
| the ten `SECTIONS` rows | 1452–1732 | 1458–1762 | +6 to +30 |

A constant offset would have been wrong for seven of the ten sections. If the trunk changes
again, re-derive rather than adjust by hand.

## Rollback

**Delete this folder.** Nothing else references it. You are then back to the plain Part E
trunk (monks, no carousel) and Part D 3.1 (carousel, no monks), both untouched.

To change only the UI, edit a sidecar here and re-run the splice. To change the sheet's
logic, edit the Part E trunk and re-run — never edit the generated HTML, which the next
build overwrites.

## Restore points

| Layer | Folder | sha256 |
|---|---|---|
| Logic trunk, no carousel | `PART C — Feature 8 Mirumoto Rank 1` | `bfbbd19197c9fd81` |
| UI only, no monks | `PART D — Feature 3.1 …` | `cae6e9f0328508da` |
| Monks, no UI | `PART E — Feature 1 Monks & Kiho` | (rebuilt with the recalcAll ordering fix) |
| **This — monks + UI** | `PART E — Feature 1.1 …` | `0e58f2375c221fa4` |

## Verified

Build invariants, measured on the shipped file:

- the sheet's own `<script>` is **byte-identical** to the Part E trunk (930,143 bytes,
  present verbatim)
- all 257 trunk element ids preserved, none missing, none duplicated (the deliverable's
  265 are those plus the carousel shell's own)
- 10 sections, 16 `.roll-modal-overlay` blocks — the same counts as Part D 3.1
- `div`, `script` and `style` tags balanced
- both upstream trunks unmodified, still hashing `bfbbd19197c9fd81` and `cae6e9f0328508da`

Behaviour, run against **this deliverable** rather than the trunk:

- **582 assertions across fifteen suites, 0 failures** — the full monk/Kiho regression set
  (Kiho library and quick-add, Brotherhood Schools, the Void Point exemption, creation
  deltas, grants and the purchase cap, the Elemental books, Alternate Paths, the
  era-variant Dragon Schools, and the later-book Schools)
- the carousel initialises (`car-active` present in the rendered DOM)

### Not verified here

- Appearance. This has not been looked at in a browser with the carousel *and* the monk
  panels together. The Techniques section now carries the Alternate Path picker, the Path
  note and the Kiho counter in addition to the sheet's own controls, and how that sits
  inside a carousel page at phone width is a judgement no measurement here makes.
