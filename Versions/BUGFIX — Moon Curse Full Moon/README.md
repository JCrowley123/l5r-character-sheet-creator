# Moon Curse Full Moon

**Status, 29 October 2026:** built for Release 7c on branch `release-7c`; not merged. The release's QA folder is `QA — Release 7c 2026-10-29`.

Your ruling R26 and C5 (Core p.160). Lord Moon's Curse's row gains a **Full moon tonight** tick and a **Willpower roll** button. Ticking adds one Void Point to the Void card, drawn as the first pip in moonlight grey so the other points are spent before it; the card holds one more point than the Void Ring while the moon is full. Unticking (sunrise) takes the point away if any Void Point is left, which is when the moon's point is still unspent; the status line says whether it was lost or spent. The tick is saved in the row's setting. The Willpower roll is against TN 15, 20 or 25 for Low, Medium or High; on a failure a notice like Enlightened Madness's says the player loses control of the character for the night. The Quick Access panel's Void line reads "4 / 3 + the moon's" while the moon is full.

## How it is built

One fragment behind one switch, `MOON_CURSE_ENABLED = true`: `src/sheet/209.99999999999997-bugfix-moon-curse.js`, with `LM7Logic` (UI-agnostic: the TN by level, the card's cap, the count at moonrise and sunrise) and `LM7` (the row's tick and button, wrapping `refreshAdvConfigControl`; the Void card, wrapping `renderVoidPips`; the Quick Access line, wrapping `renderQuickAccessPanel`). Test seam: the `moon-seam` block in `src/sheet/210-test-seam-and-init.js`.

After the review: the moon's Void card also redraws the Void panel, so Hotei's 2-point button and the Void reasons follow a pip tap under the full moon (finding 1); a new severity keeps tonight's moon (a wrapper on `writeAdvConfig`), and the moon gone without its tick, the row removed or renamed, is a sunrise: the point goes if unspent (finding 2). Loading or resetting a character (wrappers on `applyData` and `resetToBaseline`) is never a sunrise.

Known limits: The moon's point is counted, not tracked: it is unspent while any Void Point is left. A character who spends every point, then gets one back the same night, loses that one at sunrise. Hotei's Curse and every other spender use the count as before.

A first variant, a load that redraws the Void card with the saved count, changed nothing: a load already keeps the moon's point. The wrapper was removed with its variant before the variants were run again.

## Checks

- `qa/moon-harness.js`: 17/17 on the candidate (13, then four checks pinned for the review's findings 1 and 2).
- Pinned negative variants (`qa/variants.json`, committed before the first run; the review's checks and variants pinned before theirs): main (baseline) fails exactly 16 pinned checks; disabled 15; moon-drawn-last 1; sunrise-keeps 3; tn-shift 5; no-fail-alert 1; quick-plain 1; and for the review fixes panel-not-redrawn 1; moon-not-kept 1; no-settle 1; load-is-sunrise 1. All matched (the first try of panel-not-redrawn was refused before any run because its text was not unique in the page; it was given more context).
- Removal (`qa/test-removal.py`): 6/6. This remover rebuilds `9545f8284f4d9100eda26017389347eb27ae19f96198fba0fb4639dcd0051317`, 17,405,953 bytes.
