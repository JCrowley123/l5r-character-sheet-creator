# PART D — Feature 3.1 · Larger Roll Button d10

Part D is the UI and presentation line of work. This folder is **Feature 3.1**: the
gold d10 on the four roll buttons, at the largest size the sheet's table rows can
hold.

Built on Feature 3. **One file differs, and only three declarations in it.**

---

## What changed

| | Feature 3 | Feature 3.1 |
|---|---|---|
| die | 20 x 20px | **34 x 34px** |
| button padding | 4px | 0 |
| button box | 28 x 28px | 34 x 34px |

A 70% larger die. The padding goes to zero so the whole box budget goes to the
artwork; nothing is lost, because the button has had no background to show since
Feature 3, and the hit area *grows* from 28px to 34px rather than shrinking.

Diffed against the Feature 3 deliverable, the two builds differ in one contiguous
region of the dice stylesheet: six declaration lines (`padding`, `width`, `height`)
and 31 lines of comment. Nothing else in the document changed.

## Why 34px and not more

34px is a measured ceiling, not a preference.

The binding constraint is the **weapon row**, whose cells are shorter than the
skills row's. Sweeping the die from 20px to 46px and watching every row:

| button box | skill row | weapon row | initiative row | |
|---|---|---|---|---|
| 28px (Feature 3) | 58.3 | 42.5 | 37 | baseline |
| 34px | 58.3 | 42.5 | 37 | **the ceiling** |
| 35px | 58.3 | 43.5 | 37 | weapon row grows |
| 36px | 58.3 | 44.5 | 37 | |
| 38px | 58.3 | 46.5 | 38 | initiative row grows too |
| 44px | 60.9 | 56.5 | 48 | skills row grows too |

The skills row (58.3px) and the Roll Initiative row (37px) both have more headroom,
so the weapon row sets the limit for all four buttons — they share a stylesheet, and
letting them differ in size would be worse than the extra pixel is worth.

**Raising this past 34px reopens exactly the layout shift Feature 3 was careful to
avoid.** Treat it as a hard ceiling.

## Rollback

There is nothing to un-patch. To pick a different size, edit the two `34px` values
in `dice-icons.css` — and the `padding`, if you want the box back — then re-run
`python splice_swipe_tabs.py`. To go back to the 20px die, **delete this whole
folder**: you are then on `PART D — Feature 3 Gold d10 Roll Buttons`, the previous
build, fully working.

Deleting `dice-icons.js` still drops the whole feature, exactly as in Feature 3:
every rule is keyed on `[data-d10]`, which only that script sets.

## Restore points

| Layer | Folder | sha256 |
|---|---|---|
| Trunk, no carousel | `PART C — Feature 8 Mirumoto Rank 1` | `bfbbd19197c9fd81` |
| Desktop carousel | `PART D — Feature 1 swipe` | `c5462a7a70224388` |
| Mobile optimised | `PART D — Feature 1.1 …` | `5b19394c1c5595cf` |
| Circular rings | `PART D — Feature 2 …` | `d393123f242db61b` |
| Order, fit, harness | `PART D — Feature 2.1 …` | `c0d9d4ad7766f1e4` |
| Gold d10 buttons | `PART D — Feature 3 …` | `8e646d7651322670` |
| **This — larger d10** | `PART D — Feature 3.1 …` | `cae6e9f0328508da` |

## Verified

Build invariants, on the shipped file:

- the sheet's own `<script>` byte-identical to the trunk
- 209 original element IDs preserved, none missing, none duplicated
- 10 sections, 16 `.roll-modal-overlay` blocks, tag balance clean
- the trunk still hashes `bfbbd19197c9fd81`

The size, measured on the shipped build rather than on an injected simulation:

| viewport | pointer | button box | die | skill row | weapon row | initiative |
|---|---|---|---|---|---|---|
| 600px | mouse | 40 x 40 | 34 | 376.5 | 354 | 40 |
| 820px | mouse | 34 x 34 | 34 | 73.1 | 42.5 | 37 |
| 1280px | mouse | 34 x 34 | 34 | 58.3 | 42.5 | 37 |
| 820px | touch | 40 x 40 | 34 | 73.1 | 48.5 | 40 |
| 1280px | touch | 40 x 40 | 34 | 58.3 | 48.5 | 40 |

Every one of those row heights is identical to the Feature 3 build measured the same
way. Also holding: four buttons, four dice, exactly one `<svg>` each, the die centred
in its box to within a pixel on both axes, no horizontal document overflow, and no
JavaScript errors.

At 768px and below, and on any touch device, Phase 9's 40x40 minimum already governs
the button box, so the die simply centres inside it with 3px to spare — the larger
die makes those targets look less empty without changing their size.

### Not verified here

- Appearance, again. 34px is the largest the layout allows, which is not the same as
  saying it looks right — whether the facets and the "10" read well at that size is
  the one judgement a measurement cannot make.
- The drop shadow was left exactly as tuned for the 20px die. At 34px it reads as a
  lighter touch. Scaling it is a by-eye decision, so it was left alone rather than
  changed unprompted.
- Print, as before: the sheet's own print block hides `.dice-btn` outright.
