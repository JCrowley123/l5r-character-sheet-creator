# PART I — Phase 4.5.40 Supplement Identity and Outfit

Cycle 5, Release 5c. Money and Outfit for three of Phase 4.5.37's entries. Owner's ruling 2 (22 October 2026, as
recommended): nothing changes until the player taps, and the sheet records each change so it can be undone.

| Entry | The book | What the sheet does |
|---|---|---|
| Stolen Identity | Strongholds of the Empire p.92 | A picker: a School of another Great Clan, a family of that Clan, and the alias. Confirm adds that School's Outfit, without its koku, to Equipment (noted "Stolen Identity outfit"); choosing another School swaps it; removing or renaming the entry takes it off. A skilled Acting roll reports "2 Free Raises as (alias)", applied by the player (the sheet has no Raise mechanic, as for Imperial Scribe; Core p.80 rules out Unskilled Rolls). The Spider price (5) stays with Feature 4.5.25. |
| Ruined City Survivor | Strongholds of the Empire p.92 | A D45 picker: two items of the starting School's Outfit (or two typed names when no School is set). Confirm marks those Equipment rows and the Outfit's koku "Missing (Ruined City Survivor)" at quantity 0, never deleted; changing the pick or removing or renaming the entry restores them. |
| Zakyo Toshi Citizen | Strongholds of the Empire p.152 | On Phase 4.5.39's row: "Half your School's starting koku again: N koku" with **Add N koku** and **Already added**, as Wealthy's grant (Feature 4.5.17) works. Removing the entry takes the koku back while Koku holds it. |

The Great Clans are the sheet's own: the Clans in its School library less the Imperial families, and the Mantis
(a Great Clan by this era, as Phase 4.6 says). The starting School is the first in the Schools list; its starting koku
is the "N koku" in its Outfit.

## How

- **`src/sheet/209.99999999997-feat-supplement-identity-outfit.js`** (`SUPP4540`): Stolen Identity's schema
  (`supp4540Identity`; config `{school, family, alias, value, outfit:{school, items}}`) with Phase 4.5.13's pattern of
  wrappers; Ruined City Survivor installed in D45 (Feature 4.52) reusing the `targetPick` type string, as Feature
  4.5.8 reuses existing shapes, because D45's type list is pinned by four harnesses (config
  `{first, second, value, marked:[{name, notes, qty}]}`); Zakyo's receipt as `data-supp4540-koku`, saved beside the
  entry's config as Feature 4.5.25 saves its price record (`makeEntry` and `collectData` wrapped).
- Zakyo's part is drawn on Phase 4.5.39's row, so it is quiet without that layer (removed newest first).
- **Blocks:** the seam (`identity-outfit-seam`). Switch `SUPPLEMENT_IDENTITY_OUTFIT_ENABLED`.

A Release 5b save with Ruined City Survivor and no pick opens at 0 with "Needs a choice", as D45's entries do; the
player picks.

## QA

| Measure | Result |
|---|---|
| Own harness, `qa/identity-outfit-harness.js` | **21/21** |
| The same harness on main (`49dcb3b`) | **1/21** (20 fail; no page errors passes) |
| Pinned variants, `qa/verify-variants.py` (dry-run first: 10 mutations unique; pins in `qa/variants.json` before the run) | **all 11 matched**: main 20; switch off 20; Outfit keeps its koku 4; own Clan allowed 2; no Free Raises 1; koku not marked 4; no restore 3; koku record not saved 2; whole koku 4; Ruined City Survivor not installed 5; no undo on rename 1 |
| Removal, `qa/test-removal.py` (after 4.5.41 and 4.5.42 through the registry) | **6/6**: rebuilds Phase 4.5.39 alone exactly (`6b997ba4…`, 7,932,036 bytes) |
