# Moon Resist Label

**Status, 29 October 2026:** built for Release 7c.1 on branch `release-7c1`; not merged. The release's QA folder is `QA — Release 7c.1 2026-10-29`.

Your ruling from the Release 7c device checks (A3, 29 October): the roll button on Lord Moon's Curse's row says what it is for. It reads **Resist Lord Moon (TN 20)** in place of "Willpower roll (TN 20)"; the TN still follows the row's level (15, 20 or 25), and the roll it opens is unchanged ("Lord Moon’s Curse — Willpower vs TN 20").

## How it is built

One fragment behind one switch, `MOON_RESIST_LABEL_ENABLED = true`: `src/sheet/209.999999999999995-bugfix-moon-resist-label.js`, with `MR7Logic` (UI-agnostic: the words) and `MR7` (wraps `LM7.decorate`, which draws the row's tick and button, and relabels the button). Test seam: the `moon-label-seam` block in `src/sheet/210-test-seam-and-init.js`. It needs `BUGFIX — Moon Curse Full Moon` (LM7) and switches itself off without it.

Your other A1–A3 notes are parked: the tick and "Medium" out of line go to Phase 15 (your ruling, 29 October); the "Description" you saw was the test character's empty description field, since Lord Moon's Curse added from the list carries its book text.

## Checks

- `qa/moon-label-harness.js`: 5/5 on the candidate.
- Pinned negative variants (`qa/variants.json`, committed before the first run): main (7c, baseline) fails exactly 3 pinned checks; disabled 3; not-relabelled 2; fixed-tn 1. All matched.
- Removal (`qa/test-removal.py`): 6/6. This remover rebuilds `a3d7f6e4c5325f0745e216ab800bab206e5b24f96402ba23d908c0555ce73c3b`, 17,443,333 bytes (7c with Empty Quiver Cancels).

## Older checks changed

Two of `BUGFIX — Moon Curse Full Moon`'s checks expect the new label only while this switch is on, exactly as before otherwise: LM-ROW-CONTROLS and LM-REPICK-KEEPS. That harness passes 17/17 on the candidate and on 7c's build, and its 11 variants still match on the candidate.
