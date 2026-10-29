# After-Preview Refund

**Status, 29 October 2026:** built for Release 7c on branch `release-7c`; not merged. The release's QA folder is `QA — Release 7c 2026-10-29`.

Your ruling of 29 October: nothing a roll pays is kept when a later question cancels the roll. One general refund, not one per payment: the outermost wrapper on the roll's preview gate reads what a roll can pay from before the preview opens (Honor Rank and Points, Void Points, the armed Void effects, this Round's Void spends, the Ancestor's gifts, and every Advantage and Disadvantage row's saved setting, which holds each session use), and puts back whatever changed when the gate as a whole cancels. Dark Paragon's Determination paid and then cancelled at an Ancestor gift's question gives back the 5 Honor points (or the Void Point) and the session use; a Void Point spent on the preview's own Roll button comes back too. The status line names what was given back, after 7b.1.1's spell-slot message when there is one: "Cast cancelled — the Earth slot given back. Also given back: Honor, Dark Paragon's use." A cancel that paid nothing changes nothing and says nothing.

## How it is built

One fragment behind one switch, `PREVIEW_REFUND_ENABLED = true`: `src/sheet/209.999999999999992-bugfix-preview-refund.js`, with `RF7Logic` (UI-agnostic: what changed, the message) and `RF7` (reads and restores the fields and rows; wraps `rollPreviewGate` last, outside Dark Paragon, the spell-slot refund, the Ancestors and 7b.1.1's `BUGFIX — Gift Cancel Refunds the Spell Slot`, which keeps passing). Spell slots are not read: the slot is taken before the gate opens, and GR7 refunds it. Test seam: the `refund-seam` block.

Known limits: Kharmic Tie's pending use is not a payment (it is spent when the roll is made) and is left as it was. A Willpower check inside a roll has its own gate, so a cancelled check gives back only what that check's own preview paid.

## Checks

- `qa/refund-harness.js`: 9/9 on the candidate.
- Pinned negative variants (`qa/variants.json`, committed before the first run): main (baseline) fails exactly 6 pinned checks; disabled 5; rows-skipped 2; fields-skipped 3; pending-kept 1; message-replaces 2; refund-on-proceed 2. All matched.
- Removal (`qa/test-removal.py`): 6/6. This remover rebuilds `8df327e506609f52f7ca8cc20dcc357b48603cb594ed5ff366a42887d965a9a3`, 17,424,128 bytes.
