# PART I — Phase 4.5.41 A Changing Sworn Enemy

Cycle 5, Release 5c. **Imperial City Stigma** and **Trials of the Imperial City** (Strongholds of the Empire p.134)
work exactly as Sworn Enemy, worth 1 point more, with an enemy the GM changes every month to a year. Release 5b made
them selectable at 4.

## The owner's ruling 4 (22 October 2026, as recommended)

- The value is set when bought: 3, plus the enemy's Insight Ranks above yours then, plus 1.
- Afterwards **Change** asks only for the current enemy's name.
- No Kharmic Nemesis: a kharmic bond cannot move to a new enemy each month.

## How

**`src/sheet/209.99999999998-feat-supplement-shifting-enemy.js`** (`SUPP4541`): two D45 entries (Feature 4.52), one
definition. They reuse Sworn Enemy's `insightDifferencePick` type string, because D45's type list is pinned by four
harnesses (Feature 4.5.8's precedent). Behaviour is keyed by name, so Sworn Enemy's own picker, Nemesis toggle and
Void rule are untouched. Config: `{target, difference, nemesis:false, active:false, fixed:true, value}`. Blocks: the
seam (`shifting-enemy-seam`). Switch `SUPPLEMENT_SHIFTING_ENEMY_ENABLED`.

A Release 5b save with either entry and no pick opens at 0 with "Needs a choice", as D45's entries do.

## QA

| Measure | Result |
|---|---|
| Own harness, `qa/shifting-enemy-harness.js` | **10/10** |
| The same harness on main (`49dcb3b`) | **2/10** (8 fail; the guards pass: Sworn Enemy's three steps unchanged, no page errors) |
| Pinned variants, `qa/verify-variants.py` (dry-run first: 4 mutations unique; pins in `qa/variants.json` before the run) | **all 5 matched**: main 8; switch off 8; not installed 7; no extra point 4; Change asks the difference again 2 |
| Removal, `qa/test-removal.py` (after 4.5.42 through the registry) | **6/6**: rebuilds Phases 4.5.39 and 4.5.40 exactly (`411cc21c…`, 7,956,483 bytes) |
