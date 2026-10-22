# PART I — Phase 4.5.37 Supplement Advantages and Disadvantages

Cycle 5, Release 5b. The Sourcebook Audit's 42 selectable supplement entries (the owner's ruling, 15 October 2026), less
three parked by the owner on 22 October: **The World of the Daimyo**, **The Daimyo's Path** (Emerald Empire's Station
rules) and **Child of Chikushudo** (the shapeshifter abilities) wait until those rules are built. So **26 Advantages and
13 Disadvantages**, in our own words with the book and page, read from the owner's PDFs on 22 October (one batched read).

## The owner's rulings (22 October 2026)

1. **Trials of the Imperial City:** selectable, working as printed (as Sworn Enemy, 1 point more, the enemy changing).
   *Found on reading:* it is not a printing error. It shares Imperial City Stigma's rule but has its own text, written
   for the Lion's trouble with the city's politics; the row says so.
2. **Wanderer** prints no type: **Mental**, like its opposite, Absolute Direction.
3. **Station and shapeshifter entries:** parked (above).
4. **The 23 Naga- and Nezumi-only entries:** Search only, marked "Naga only" or "Nezumi only", not in the add lists.

## What it adds

- **`src/sheet/021-lib-supplement-entries.js`** (right after the catalogue, so the quick-add lists, the wizard and
  Search read them as catalogue entries): the 39 entries, each with `cat`, `cost`, `desc` and its own `source`, each
  after the last entry that sorts before it (the catalogue's own entries keep their order, including Uncentered, which
  sits out of order near the top of the Disadvantages); the 23 reference entries for Search. A description states any
  price a choice can give as a numeral, as Phase 4.5's tier audit requires.
- **`src/sheet/209.99999999994-feat-supplement-entries.js`:**
  - Clan, family and School prices through Feature 4.5.25 (fixed, noted and saved as the Core Rulebook's are):
    Strategist (Lion 4), Sage of the Sword and Fan (courtiers 6), Stolen Identity (Spider 5), Spy Network
    (Scorpion 6, Daidoji 7) and Inheritance: Trained Falcon (Toritaka 1). Family prices are new to 4.5.25, so an entry
    here may list tiers and `CP4525.bookPrice` is extended by property for those entries only. Spy Network's Kolat
    price (5) is left to the player: the sheet has no Kolat School.
  - Search: a **Naga and Nezumi** category (23, under the Clans heading, after Ancestors, only while Search is on).
- **Blocks:** 040 `mystical-group` (Battle Healing is Mystical, a new group after Spiritual); Search's index
  `search-entry-source` (an entry that carries its own page gives it) and `search-tier-prices` (a tiered entry's
  "Clan or School price" lists every tier: "6 points for Scorpion; 7 points for the Daidoji family"); the seam.
- **Names as printed:** "Inheritance: Kobune", "Inheritance: Asahina Blade", "Inheritance: Trained Falcon" and
  "Inheritance: Water Hammer Armor" are their own entries in the books, each with its own price, as is "Sacred
  Weapon: Owl Blade" (the proposal had them as options in Inheritance's and Sacred Weapon's pickers; Inheritance's
  picker is a free-text name at 5 points and Sacred Weapon's is tied to the character's Clan). The audit's "Member of
  the Chrysanthemum Court" is printed **The Chrysanthemum Court**.
- **Not built (5c):** pickers for Reincarnated, Watanu-Trained, Water Hammer Citizen, Zakyo Toshi Citizen, Stolen
  Identity, Ruined City Survivor and Imperial City Stigma / Trials; they are selectable now at their book price.

## Retained test changes (switch-guarded)

Three older Search harnesses pinned Search's 13 categories and read Advantage pages from the audit's "In the sheet now"
tables. While `SUPPLEMENT_ENTRIES_ENABLED` is on they expect exactly one more category (`naga-nezumi`, no filters) and
take a supplement entry's page from the entry itself; without this layer they assert the original expectations.
`PART K — Phase 14 Search/qa/search-harness.js` (S14-CATEGORY-ORDER, S14-RECORDS-MATCH-CATALOGUES),
`dependency-harness.js` (the category count), `PART K — Phase 14.1 Search Facets/qa/facets-harness.js`
(F141-FACET-SETS). Pre-change copies: `originals/`.

## QA

| Measure | Result |
|---|---|
| Own harness, `qa/supplement-harness.js` | **25/25** |
| The same harness on main (`b54c13b`) | **4/25** (21 fail; the 4 that pass are guards: the parked entries absent, Core pages unchanged, Naga/Nezumi not in the lists, no page errors) |
| Pinned variants, `qa/verify-variants.py` (dry-run first: 8 mutations unique; pins in `qa/variants.json` before each run) | **all 9 matched**: main 21; switch off 21; no Mystical group 2; no own page in Search 2; appended, not placed 1; placed before the first later entry (the first build's rule) 1; family prices ignored 2; prices not installed 7; reference not in Search 3 |
| The code review (22 October) | Four findings, three fixed: tier prices as numerals in three descriptions (Phase 4.5's tier audit would have failed); the Disadvantages' A to Z place (the catalogue's out-of-place Uncentered caught 10 of 13); Search's tier prices. The fourth is a known limit, below |
| Removal, `qa/test-removal.py` (after 4.5.38 through the registry) | **6/6**: rebuilds main exactly (`f59aaa2f…`, 7,887,981 bytes) |
| The three guarded Search harnesses and the keystroke-speed harness | pass on the candidate (see the Release 5b QA folder) |

**Known limit (the code review):** a character saved before 5b with a hand-typed row named like one of 4.5.38's six
choice entries (say "Sleeper Agent" at 8) opens at 0 with "Needs a choice", as Phase 4.5's own tier entries do; the
player picks again. None of the owner's saved characters has such a row.
