# PART I — Phase 4.5.38 Supplement Price Choices

Cycle 5, Release 5b. Six of Phase 4.5.37's entries cost (or are worth) what the player chooses. Added to the list, each
asks for its choice; the pick sets the row's cost and is saved with it. Each is one more `severityTier` / `entryCost`
entry in Phase 4.5's configuration (209.8), as Antisocial, Cast Out and Gentry are, registered by name through
`registerAdvConfigSchema`; with 4.5.37's entries absent nothing here is reachable.

| Entry | The choice (from the book) |
|---|---|
| Inheritance: Water Hammer Armor (Strongholds of the Empire p.107) | Ashigaru 4, light 7, heavy 12, riding 15 |
| Naga Ancestry (Imperial Histories 2 p.287) | No visible signs 7; visible signs (the GM's option) 5 |
| Sleeper Agent (Enemies of the Empire p.49) | No fail-safe 5; with a fail-safe 8 |
| The Chrysanthemum Court (Imperial Histories 2 p.126) | Hantei XVI (the Steel Chrysanthemum's reign) 5; another era (a cruel or corrupt lord's court) 3 |
| Clear Water Stigma (Strongholds of the Empire p.44) | All the Outfit's koku, or one Outfit weapon (2 either way) |
| Bounty (Strongholds of the Empire p.168) | Minor offence 2; serious 4; violent or heinous 6 (the prompt gives each bounty and recognition TN) |

Option labels are short so each fits its tile (Phase 4.5's own check, 160 px); the detail is in the prompt.

As with Phase 4.5's own tier entries, a choice cancelled leaves the row on the list, flagged "Needs a choice" and
counting nothing. Fragment `src/sheet/209.99999999995-feat-supplement-choices.js`, seam block; switch
`SUPPLEMENT_CHOICES_ENABLED`.

## QA

| Measure | Result |
|---|---|
| Own harness, `qa/choices-harness.js` | **18/18** |
| The same harness on main (`b54c13b`) | **2/18** (16 fail; Gentry unchanged and no page errors pass) |
| Pinned variants, `qa/verify-variants.py` (dry-run first: 4 mutations unique; pins in `qa/variants.json`) | **all 5 matched**: main 16; switch off 16; not installed 15; Naga Ancestry misnamed 4; a wrong Bounty price 3 |
| Removal, `qa/test-removal.py` | **6/6**: rebuilds Phase 4.5.37 alone exactly (`cf01a6eb…`, 7,907,657 bytes) |
