# PART I — Phase 4.5.39 Supplement Skill Pickers

Cycle 5, Release 5c. Pickers for four of Phase 4.5.37's entries, which Release 5b made selectable at their book price
only. Read from the owner's PDFs on 22 October 2026; the owner's rulings of the same day, all as recommended.

| Entry | The book | What the sheet does |
|---|---|---|
| Reincarnated | Book of Void p.191 | Three Skills that are not School Skills (refused at Confirm while they are; a warning if a later School makes one so). +1k0 on their Skill and attack rolls. A Void Point armed on one of those rolls shows "Anachronism for 1–10 hours" in the preview (TN +5 on Artisan, Craft and Social Skill Rolls). The row says the GM approves the three. |
| Watanu-Trained | Book of Void p.195 | One Craft, written `Craft: name`. Its rolls offer "making a metal item, not a weapon or armour — +1k1" as a per-roll declaration (Feature 4.5.15). |
| Water Hammer Citizen | Strongholds of the Empire p.107 | One Craft gains one Rank at no XP cost, refused if it is at 4 already (the starting maximum). The row reminds that crafting time is figured one coin size smaller. |
| Zakyo Toshi Citizen | Strongholds of the Empire p.152 | One Games Skill gains one Rank at no XP cost. Its koku is Phase 4.5.40's. |

## The owner's rulings (22 October 2026)

1. **Free Ranks:** the sheet adds the Rank on Confirm, making the Skill row if missing, and charges no XP for it.
   Choosing another Skill moves it; removing or renaming the entry takes it back (a row the grant made goes again
   while it holds nothing else).
3. **Reincarnated's price:** 5 points while the Ancestors panel (Phase 4.8) holds an Ancestor or the character has a
   Henshin School (Asako Henshin), otherwise 6. The Naga version (7 points, no Anachronism) is left out: Naga are
   Search-only (Release 5b's ruling 4).
6. **Watanu-Trained's Craft:** any Craft the player names; the limit to metal goods is in the declaration's text.

## How

- **`src/sheet/209.99999999996-feat-supplement-skill-pickers.js`** (`SUPP4539`): four schemas of one type
  (`supp4539Skills`) through `registerAdvConfigSchema`, with Phase 4.5.13's pattern of wrappers (complete, resolve,
  summary, decorate, open, confirm) and the dialog's text fields with suggestions. Config:
  `{type, revision:1, skills, value, grant?:{skill, created}}`; the receipt is what lets the Rank be taken back.
- **XP:** the granted Rank raises that Skill row's free floor by one, through the contract Feature 4.5.32 documents
  (recalcAll calls `getPaidEmphCount(tr)` and then `skillCost(rank, emphCount, freeFloor)` for the same row). No block
  in 110.
- **Rolls:** Reincarnated through `advConfigExtendedRollModifiers`; Watanu-Trained as a declaration provider
  (`supplement-skill-pickers`) in Feature 4.5.15's registry.
- **Blocks:** the seam (`skill-pickers-seam`). Switch `SUPPLEMENT_SKILL_PICKERS_ENABLED`.

A Release 5b save with one of these four rows and no pick opens with "Needs a choice" at its book price; the
player picks. Unlike Phase 4.5's tier entries, the row keeps counting its price meanwhile (the price never depends on
the pick, except Reincarnated's 5).

## Retained test changes (guarded)

Two older checks list the roll-declaration providers exactly: Feature 4.5.15's `RD-NO-PRODUCTION-PROVIDER` and
Feature 4.5.16's `HV-PROVIDER-REGISTERED` (found by the pre-runs). Each now also allows `supplement-skill-pickers` while
this layer is present (`T.SUPP4539`), the cross-phase fixture correction every later provider has made. Pre-change
copies: `originals/`.

## QA

| Measure | Result |
|---|---|
| Own harness, `qa/skill-pickers-harness.js` | **24/24** |
| The same harness on main (`49dcb3b`) | **2/24** (22 fail; the guards pass: Great Potential's picker unchanged, no page errors) |
| Pinned variants, `qa/verify-variants.py` (dry-run first: 10 mutations unique; pins in `qa/variants.json` before the run) | **all 11 matched**: main 22; switch off 22; no grant floor 7; no take-back 4; School Skills allowed 4; one price 1; no Void note 1; Watanu not registered 2; no Rank-4 limit 1; attacks ignored 1; Craft unchecked 1 |
| Removal, `qa/test-removal.py` (after 4.5.40 to 4.5.42 through the registry) | **6/6**: rebuilds main exactly (`bb7c1ab4…`, 7,910,947 bytes) |
