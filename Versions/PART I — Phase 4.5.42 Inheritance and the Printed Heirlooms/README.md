# PART I — Phase 4.5.42 Inheritance and the Printed Heirlooms

Cycle 5, Release 5c; reworked in Release 5c.1 as **the printed heirlooms folded into Inheritance**. The folder keeps
its name, because the removal chain, the records and the earlier proofs name it.

Core **Inheritance** takes a typed heirloom name at 5 points (Feature 4.5.13). Four heirlooms are printed as entries of
their own, at their own prices. Release 5c listed them beside Inheritance and pointed a matching Inheritance row to them
with a **Use Inheritance: …** button. The owner's 5c device check found that a player could add both, and that in Play
mode the button only showed a message.

## The owner's rulings (23 October 2026, Release 5c.1)

The four leave the Advantages list (and the creation wizard's, which copies it). They stay in the catalogue, so saves,
Feature 4.5.25's prices and Yomi keep working. They are added through Inheritance:

| Typed heirloom name contains (ruling 1) | Confirm makes the row |
|---|---|
| kobune | Inheritance: Kobune, 10 (Strongholds of the Empire p.24) |
| asahina blade | Inheritance: Asahina Blade, 9 (p.75) |
| trained falcon | Inheritance: Trained Falcon, 2 (Enemies of the Empire p.10; Toritaka 1) |
| water hammer armor / armour | Inheritance: Water Hammer Armor, 4 to 15 (Strongholds of the Empire p.107) |

- As the name is typed, the dialog's note says so, e.g. "Kobune is printed as its own entry: 10 points. Confirm uses
  it." Any other name leaves the Inheritance reminder as it was.
- On Confirm the row becomes that entry in the same place, priced by its own rules.
- Water Hammer Armor then opens its armour picker (Phase 4.5.38). **Ruling 3:** cancelled, the row stays Inheritance:
  Water Hammer Armor with "Needs a choice", counting 0.
- **Ruling 2:** all four stay in Search, with the line "Added through Inheritance: …".
- The row note and the **Use Inheritance: …** button are gone. A Release 5c Inheritance named like one opens unchanged;
  its dialog says so.

## How

**`src/sheet/209.99999999999-feat-inheritance-printed-heirlooms.js`** (`INH4542`), with no config of its own:
- it takes the four out of `#advQuickAdd` once, at load (040 builds the list once; the wizard copies it each time);
- it wraps `openExtendedAdvConfigModal` to keep Feature 4.5.13's note in step with the name;
- it wraps `confirmExtendedAdvConfigModal` to make the entry with `makeEntry`, as the quick-add list does, and then open
  its choice;
- it wraps `SEARCH14.get` for the line.

It is quiet without Phase 4.5.37's entries. Play mode already locks the dialog's Confirm (Phase 12.5). Blocks: the seam
(`printed-heirlooms-seam`). Switch `INHERITANCE_PRINTED_HEIRLOOMS_ENABLED`.

**Fixture corrections (guarded).** While this layer is on, three older harnesses follow the four out of the list:
- `PART I — Phase 4.5.37 …/qa/supplement-harness.js`: in S437-QUICK-ADD-LISTS-ALL-IN-THEIR-GROUP the four must be
  absent;
- `PART I — Phase 4.5.38 …/qa/choices-harness.js`: Water Hammer Armor is added through Inheritance;
- `PART I — Phase 4.5 Modal-Configured Advantages-Disadvantages/qa/adv-config-harness.js` (found by the pre-runs): its
  library audit adds Water Hammer Armor through Inheritance, and counts the four as in the libraries.

Without this layer they assert their original expectations. Pre-change copies are in `originals/`. Each original fails
on the candidate (25/26, 15/18, 49/51). Each corrected harness passes on main (26/26, 18/18, 51/51), on the candidate,
and on the tree with this layer removed.

## QA (Release 5c.1)

| Measure | Result |
|---|---|
| Own harness, `qa/printed-heirlooms-harness.js` | **13/13** |
| The same harness on main (`f0e5a8a`, Release 5c) | **3/13** (10 fail; the guards pass: the switch, saved heirloom rows open, no page errors) |
| Pinned variants, `qa/verify-variants.py` (dry-run first: 7 mutations unique; pins in `qa/variants.json` before the run) | **all 8 matched**: main 10; switch off 10; list kept 2; "armour" not matched 3; note not live 2; Confirm keeps Inheritance 4; appended, not in place 1; no Search line 1 |
| Removal, `qa/test-removal.py` | **6/6**: rebuilds Phases 4.5.39 to 4.5.41 exactly (`d80bad4a…`, 7,959,638 bytes) |
