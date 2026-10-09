# Phase 4.5.33 — Void and Initiative Entries (Part I)

Approved 9 October 2026 ("as recommended"), built in the same cycle as Phase 14 Search, with the owner's readings.
Five Core Rulebook entries that recorded only their cost and text; with them every Core entry the sheet can act on
without a further ruling is automated (Weakness and the Glory, Status and Honour group aside).

| Entry | Core | On the sheet |
|---|---|---|
| Daredevil | p.147 | A Void Point spent on an Athletics roll gives +3k1 instead of +1k1 (extra +2k0 beside Void's +1k1) |
| Touch of the Void | p.162 | A Void Point on a roll gives +2k1 instead of +1k1; a **Willpower (TN 30)** button on the row, to roll after every Void Point spent (failure: Dazed for one Round) |
| Momoku | p.161 | The Void card is closed (every spend, Kiho activation included), with the reason above the buttons; armed Void dice are dropped; the Void pips stay tappable for Technique costs |
| Quick | p.152 | **Did not act first: +Reflexes** once a Round in combat; the running total for the skirmish is on the row, in the Round note, and added to Initiative rolls as Void's +10 is; Reset rounds clears it |
| Leadership | p.151 | **Lead an ally (School Rank + 1k1)** once a Round in combat: rolls 1k1 and adds the School Rank, for one ally; nothing is added to this character |

Rulings (9 October): Daredevil and Touch of the Void do not stack (Athletics: +3k1); Momoku closes the whole card;
Quick stacks each Round you did not act first; Leadership only rolls for an ally.

## Implementation

`src/sheet/209.99999993-feat-void-initiative-entries.js` (`VI4533`, marker `PART I FEATURE 4.5.33`),
`src/css/59.99997-feat-void-initiative-entries.css` (own classes, `vi4533-`), one seam block. A pre-roll
contributor gives the extra Void dice (source `void`, so Sworn Enemy's suppression and Momoku drop them with
Void's own +1k1) and Quick's Initiative total; `canSpendVoid`, `getPreRollModifiers` and `renderVoidPanel` are
wrapped for Momoku; Quick and Leadership use the trunk's round ledger; the rows follow
`refreshAllAdvConfigControls`. Nothing is saved.

## Verification

- Own harness `qa/void-initiative-harness.js`: **38/38**. Oracles: the book's numbers and the trunk's own Void
  +1k1, round ledger and dice engine.
- Dependency harness: **18/18** (control; Phase 4.5's configuration off; the release switched off).
- Ownership scan clean. Removal fixtures 22 pass, one Windows symlink skip; the live fixture restores Phase 14's
  build `df80ee3c…` byte for byte.
- 17 mutations in `qa/variants.json`, pinned in `qa/expected-failures.json`.

Full-suite and live figures are recorded with Phase 14's.
