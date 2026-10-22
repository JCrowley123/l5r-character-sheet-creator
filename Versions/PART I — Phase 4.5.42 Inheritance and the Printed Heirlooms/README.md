# PART I — Phase 4.5.42 Inheritance and the Printed Heirlooms

Cycle 5, Release 5c. From the owner's Release 5b device check: Core **Inheritance** takes a typed heirloom name at
5 points (Feature 4.5.13), so "Kobune" could be had there at 5, while the printed **Inheritance: Kobune** costs 10.

## The owner's ruling 5 (22 October 2026, as recommended)

When the heirloom's name contains one of the four printed heirlooms, the Inheritance row says so and offers a
one-tap switch:

| Typed name contains | The printed entry |
|---|---|
| kobune | Inheritance: Kobune, 10 (Strongholds of the Empire p.24) |
| asahina blade | Inheritance: Asahina Blade, 9 (p.75) |
| trained falcon | Inheritance: Trained Falcon, 2 (Enemies of the Empire p.10; Toritaka 1) |
| water hammer armor / armour | Inheritance: Water Hammer Armor, 4 to 15 (Strongholds of the Empire p.107) |

Nothing changes unless the player taps **Use Inheritance: …**. The switch removes the Inheritance row and adds the
printed entry through the quick-add list, so that entry's own price (Feature 4.5.25) and choice (Phase 4.5.38's
armour) apply.

## How

**`src/sheet/209.99999999999-feat-inheritance-printed-heirlooms.js`** (`INH4542`): wraps `refreshAdvConfigControl`
after Feature 4.5.13 has drawn the row and adds the note and the button. No config of its own. Quiet without Phase
4.5.37's entries (it names only entries the catalogue has). Blocks: the seam (`printed-heirlooms-seam`). Switch
`INHERITANCE_PRINTED_HEIRLOOMS_ENABLED`.

## QA

| Measure | Result |
|---|---|
| Own harness, `qa/printed-heirlooms-harness.js` | **6/6** |
| The same harness on main (`49dcb3b`) | **2/6** (4 fail; the guards pass: another heirloom is not noted, no page errors) |
| Pinned variants, `qa/verify-variants.py` (dry-run first: 3 mutations unique; pins in `qa/variants.json` before the run) | **all 4 matched**: main 4; switch off 4; "armour" not matched 1; note without the switch 3 |
| Removal, `qa/test-removal.py` | **6/6**: rebuilds Phases 4.5.39 to 4.5.41 exactly (`b9785726…`, 7,959,195 bytes) |
