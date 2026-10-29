# Starting Spells Are Scrolls

**Status, 29 October 2026:** built for Release 7c on branch `release-7c`; not merged. The release's QA folder is `QA — Release 7c 2026-10-29`.

Your answer Q5 (Core p.164). The sheet keeps the book's rule it already follows: starting spells start as scrolls in Equipment, not memorised. The open question in Phase 11.2.3's header is closed in two lines, and the wizard's Spells step says, under the School's allotment: "These are scrolls in your Equipment. Memorising a spell costs XP equal to its Mastery (Core p.164); tick Memorised on its row."

## How it is built

One fragment behind one switch, `STARTING_SCROLLS_ENABLED = true`: `src/sheet/209.999999999999991-bugfix-starting-scrolls.js`, with `SS7Logic` (the line) and `SS7` (wraps `CW1122.spellsStep.render`). Test seam: the `scrolls-seam` block. Shared: and the `decision` block in `src/sheet/209.997-feat-wizard-starting-spells.js` (two lines closing the open question).

Known limits: Only Core was read; a supplement School that grants memorised spells would need its own reading.

## Checks

- `qa/scrolls-harness.js`: 5/5 on the candidate.
- Pinned negative variants (`qa/variants.json`, committed before the first run): main (baseline) fails exactly 4 pinned checks; disabled 3; not-placed 2. All matched.
- Removal (`qa/test-removal.py`): 6/6. This remover rebuilds `51d917b9532e2d6999b5c1e482a50a54e6731410a4916103775b2fa4f40ae0f9`, 17,422,400 bytes.
