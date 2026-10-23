# PART I — Phase 4.5.41 A Changing Sworn Enemy

Cycle 5, Release 5c; changed in Release 5c.1. **Imperial City Stigma** and **Trials of the Imperial City** (Strongholds
of the Empire p.134) work exactly as Sworn Enemy, worth 1 point more, with an enemy the GM changes every month to a
year. Release 5b made them selectable at 4.

## The owner's rulings

- **23 October 2026 (Release 5c.1, from the 5c device check):** the row's button reads **New enemy**, and it asks the
  enemy's name and Insight Rank difference each time. The value follows the current enemy: 3, plus the enemy's Insight
  Ranks above yours, plus 1.
- **Ruling 4, 22 October, as it still stands:** no Kharmic Nemesis, as a kharmic bond cannot move to a new enemy each
  month. (Its first half, "the value is set when bought; Change only renames", is replaced by the ruling above.)

## How

**`src/sheet/209.99999999998-feat-supplement-shifting-enemy.js`** (`SUPP4541`): two D45 entries (Feature 4.52), one
definition. They reuse Sworn Enemy's `insightDifferencePick` type string, because D45's type list is pinned by four
harnesses (Feature 4.5.8's precedent). Behaviour is keyed by name, so Sworn Enemy's own picker, Nemesis toggle and
Void rule are untouched. Config: `{target, difference, nemesis:false, active:false, value}`. The definition's
`decorate` (D45 calls it on a configured row) names the button. Blocks: the seam (`shifting-enemy-seam`). Switch
`SUPPLEMENT_SHIFTING_ENEMY_ENABLED`.

A Release 5c save carries `fixed:true`: it opens at its value, and the next New enemy drops the flag. A Release 5b
save with either entry and no pick opens at 0 with "Needs a choice", as D45's entries do.

## QA (Release 5c.1)

| Measure | Result |
|---|---|
| Own harness, `qa/shifting-enemy-harness.js` | **13/13** |
| The same harness on main (`f0e5a8a`, Release 5c) | **6/13** (7 fail; the guards pass: the first step, no Kharmic Nemesis, "Needs a choice", Sworn Enemy unchanged, no page errors) |
| Pinned variants, `qa/verify-variants.py` (dry-run first: 5 mutations unique; pins in `qa/variants.json` before the run) | **all 6 matched**: main 7; switch off 11; not installed 10; no extra point 5; the button says Change 4; New enemy asks the name only 4 |
| Removal, `qa/test-removal.py` (after 4.5.42 through the registry) | **6/6**: rebuilds Phases 4.5.39 and 4.5.40 exactly (`411cc21c…`, 7,956,483 bytes; unchanged from 5c) |
