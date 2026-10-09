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
`src/css/59.99997-feat-void-initiative-entries.css` (own classes, `vi4533-`), one seam block. Phase 4.5's
adv-config seat (`advConfigExtendedRollModifiers`; no new registry seat) gives the extra Void dice (source `void`,
so Sworn Enemy's suppression and Momoku drop them with Void's own +1k1) and Quick's Initiative total; `canSpendVoid`, `getPreRollModifiers` and `renderVoidPanel` are
wrapped for Momoku; Quick and Leadership use the trunk's round ledger; the rows follow
`refreshAllAdvConfigControls`. Nothing is saved.

## Device correction (10 October 2026: the owner's V2 note)

The owner's check passed V2 with a note: the Willpower roll should open by itself after the roll the Void Point was
spent on ("a side effect of using Void"). Core Rulebook p.162: after every Void Point spent, a Willpower roll at TN 30
or be Dazed for one Round. Approved as recommended; corrected in this release's own fragment.

- Every Void Point leaves the sheet through the trunk's `consumeVoidPoint`, once: the Void card (Kiho activation
  included), the roll preview's Void tick, damage reduction, Dark Paragon, an Ancestor's price and Lost Love. Each one
  spent while Touch of the Void is on the Disadvantages list owes one check.
- A check opens when nothing else is under way: no roll in progress, the roll window closed and no one-roll Void effect
  still armed. So a Void Point on a roll is checked when that roll's window closes (after any rerolls, Emphasis or
  Luck); a Void card spend that makes no roll, at once; Void armed from the card, after the roll it is used on. A
  cancelled roll spends nothing and owes nothing. Two spends, two checks, one after the other.
- The check is the row's own Willpower (TN 30) roll, which stays on the row. Tapping the Void pips by hand (Technique
  costs, corrections) opens nothing: they are the player's tally.
- **Harness:** six new checks, through the Skills table's dice button and the roll preview's real controls: the check
  after the roll window closes and not before; none after a cancelled roll; at once from the Void card; after the roll
  an armed Void is used on; two spends, two checks; only with the entry on its own list. **44/44**; **40/44** on the
  build before the correction (`1822a1cf…`), failing exactly the four checks that need the check to open. Four new
  pinned mutations; the seam block exports the trunk's `consumeVoidPoint` for the two-spends check (test-only).

## Verification

- Own harness `qa/void-initiative-harness.js`: **38/38**. Oracles: the book's numbers and the trunk's own Void
  +1k1, round ledger and dice engine.
- Dependency harness: **24/24** (control; Phase 4.5's configuration off; its roll effects off; the release
  switched off).
- Ownership scan clean. Removal fixtures 22 pass, one Windows symlink skip; the live fixture restores Phase 14's
  build `df80ee3c…` byte for byte.
- 17 mutations in `qa/variants.json`, pinned in `qa/expected-failures.json`.

Full-suite and live figures are recorded with Phase 14's.
