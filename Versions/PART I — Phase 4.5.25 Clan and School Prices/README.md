# PART I — Phase 4.5.25 Clan and School Prices

Built 2 October 2026 on branch `claude/phase-4-5-25-clan-prices` (cut from the docs-only
`claude/adv-disadv-audit`). One fragment, `src/sheet/209.999996-feat-adv-clan-prices.js`
(marker `PART I FEATURE 4.5.25`, kill switch `ADV_CLAN_PRICES_ENABLED`, object `CP4525`), and one
delimited seam block (`clan-prices-seam`) in `210-test-seam-and-init.js`.

## What it does

39 Advantages and Disadvantages cost less, or are worth more, for some Clans, families or School
types. Until now the sheet charged every one at the catalogue price. It now prices each row from the
character and says so on the row, e.g. *"Dragon price: 2 XP (catalogue 3)"*.

| Group | Advantages (cheaper) | Disadvantages (worth more) |
|---|---|---|
| Crab | Blood of Osano-Wo 3, Crab Hands 2, Large 3 | Obtuse 4 |
| Crane | — | Epilepsy 5 |
| Dragon | Clear Thinker 2, Enlightened 5, Friend of the Brotherhood 4 | Ascetic 3 |
| Lion | Leadership 5, Tactician 3 | Brash 4, Idealistic 3, Overconfident 4 |
| Mantis | Blood of Osano-Wo 3, Daredevil 2, Gaijin Gear 4 | Greedy 4, Overconfident 4 |
| Phoenix | Ishiken-Do 6, Sage 3 | Soft-Hearted 3, Touch of the Void 4 |
| Scorpion | Crafty 2, Dangerous Beauty 2 | Insensitive 3 |
| Spider | Crafty 2 | Disturbing Countenance 4 |
| Unicorn | Gaijin Gear 4 | Gaijin Name 2 |
| Imperial (Clan or family) | Irreproachable 1, Sacrosanct 3 | Bitter Betrothal 3, Contrary 4 |
| bushi | Crab Hands 2, Strength of the Earth 2, Tactician 3 | Obtuse 4, Permanent Wound 5 |
| courtier | Read Lips 3 | Contrary 4, Rumormonger 5 |
| shugenja | Sage 3 | — |
| monk | Enlightened 5, Hands of Stone 5 | Ascetic 3, Forced Retirement 5 |
| ninja | Crafty 2, Quick 5, Silent 2 | Dark Secret 5 |

All from the Core Rulebook, pp. 147–162 (each row carries its page in the fragment). The book's
"Crab and bushi characters" is a list, since "Crab and Mantis characters" can only be one: **either
group qualifies**. Measured against the book on 2 October: 34 sentences read from the PDF (text
extracted to a scratch folder only), the other 5 (Ishiken-Do, Ascetic, Soft-Hearted, Gaijin Name,
Touch of the Void) split across the page's columns and were confirmed against the audit's reading
and the catalogue's own notes.

## The owner's rulings (2 October 2026)

1. **A Management visit is the purchase.** While in Management a priced row is *provisional*: it
   follows every change made in that visit (Clan, family, a School added before or after it).
   Leaving Management, or finishing the wizard, *fixes* it. A later visit never re-prices it; if the
   character has changed, the row only says so (*"Fixed when bought: 3 XP (catalogue). Book price
   now: 2 XP (Bushi)"*).
2. **Every School held at that moment counts** (a trained bushi who joins a courtier School still
   buys at the bushi price).
3. **A typed cost is kept and marked** (*"Cost set by hand. Book price: 2 XP (Dragon)."*), in the
   visit and after it.
4. **A character saved before this release** is priced once, when first loaded, from its Clan,
   family and **starting** School (assumed bought at creation), and fixed. Only a row at the
   catalogue price changes, so nothing is taken away silently: a Clan price on a character who does
   not qualify is kept and marked.

Saving does not fix a price: closing the app while in Management leaves the row provisional until
the next time Management is left. Opening a character is not a change (the Characters list's saved
state is taken after the re-price, measured).

## Left out (deliberately)

- **Uncentered**: its Clan-monk price (2) is *lower* than the catalogue's (4, the Brotherhood
  price), so re-pricing would take XP away. Needs its own ruling.
- **Blackmail** (Scorpion 1 less) and **Way of the Land** (Unicorn 1): their own pickers own the row.
  For the picker pass.
- The entries' effects; the 4 missing entries with Clan prices; the dropdown's "(N pts)" label.
- **Artisans**: Kakita Artisan and Tsi Smith [Artisan] have no priced type, so they pay catalogue
  (measured: the only 2 of the library's 104 Schools whose type the sheet cannot read).

## How it works

`CP4525.refresh(div)` runs for every Advantage and Disadvantage row, chained in front of Phase 4.5's
`refreshAdvConfigControl` (run by `refreshAllAdvConfigControls()` from `recalcAll()`), which leaves a
picker-less row's cost alone. Each priced row carries a record (`data-cp4525`: name, state
provisional/fixed/typed, value, basis) that travels with the save as `clanPrice` on the row, through
rebound `collectData` and `makeEntry`. A rebound `applyData` marks a load, so rows with no record are
priced as old saves. `MODES12.set` (Phase 12) and `CW112.finish` (Phase 11.2) are wrapped, when
present, to fix provisional rows.

## QA (2 October 2026)

- **Own harness** `qa/clan-prices-harness.js`: **39/39** on this build, **13/39** on today's `main`
  (the 13 that hold there are the catalogue prices, the left-out entries and the no-error checks).
  Rows are added both through `makeEntry` and through the sheet's own quick-add lists, the path the
  wizard's Advantages step uses; the wizard's own screens are covered by the device check (Test A).
  Oracles: the book's prices written in the harness, the trunk's `ADV_LIBRARY`/`DISADV_LIBRARY`, its
  `f_xpRemain` field, and the Characters list's saved-state test (`JSON.stringify(collectData())`).
- **Variants** (`qa/verify-variants.py`, pinned in `qa/expected-failures.json`): 9 deliberately
  broken builds each turn exactly their pinned checks red (phase removed, switch off, the "and"
  reading, a typed cost overwritten, not fixed on leaving Management, old saves from every School,
  old saves left provisional, the record not saved, a Clan price taken away); both boundary builds
  (Phase 12 modes off, Phase 4.6 off) read 39/39. Discovery run first, then the pinned run.
- **Full suite**: see the ledger's current update for the measured figure.
- **Removal**: `qa/remove-phase.py` on a scratch copy rebuilds **`033a0bf2…`, 3,464,120 bytes**, byte
  for byte; its 21 adversarial fixtures pass (one skipped: Windows symlinks).
  `qa/feature-dependencies.py` exits 0. Live build: **`a22c41cb…`, 3,478,345 bytes**.

## Dependencies

- **On Phase 4.5 (Part I)**, declared: prices are applied through `refreshAdvConfigControl`, which
  `refreshAllAdvConfigControls()` only calls while `ADV_CONFIG_ENABLED` is on. With 4.5 off, rows stay
  at whatever cost they hold.
- **On Phase 12 (Part K)** and **Phase 11.2 (Part K)**, soft and guarded: without them rows stay
  provisional until the other fixes them (boundary build with Phase 12's modes off: 36/36).
- On the trunk: `getSchoolsList`, `findAnySchoolLibraryEntry`, `FAMILY_LIBRARY`, `makeEntry`,
  `collectData`, `applyData`.

Device checks: `MANUAL-TESTS.md`. Rollback: `ROLLBACK.md`.
