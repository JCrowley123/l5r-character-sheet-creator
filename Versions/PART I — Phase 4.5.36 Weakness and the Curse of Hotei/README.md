# PART I — Phase 4.5.36 Weakness and the Curse of Hotei

Built from the owner's rulings of 16 October 2026 (roadmap amendment "Cycle 2 finished — 15 October 2026", approved
"as proposed, including the floor of 1"). One removable layer. Rules in our own words:

- **Weakness** (Core Rulebook p.162, Disadvantage, 6 points). The chosen Trait counts one lower, never below 1, for
  every roll that uses it and everything worked out from it: its Ring when it becomes the lower of the pair, and what
  follows from that Ring (Wounds from Earth; the TN to be hit and initiative from Reflexes). Never changed: Insight and
  Insight Rank, the purchased Trait, any XP cost, Void Points. It may be taken more than once, one Trait each.
- **Hotei's Curse** (Core Rulebook p.162, Seven Fortunes' Curse, 6 points). A Technique or Advantage that needs a Void
  Point to activate needs two. Void spent on a roll, Kiho, Kata and spells are untouched. While the Curse is on the
  sheet, the Void card offers "For a Technique or Advantage" at two points: checked before spending, both taken in one
  step and undone together. The player declares it (the sheet cannot tell which Techniques cost Void).

## Measurement (16 October 2026, before building)

`qa/measure-consumers.py` lists every code line that reads a Trait or Ring value, a wound threshold, the Armor TN,
initiative or a Void spend: 276 hits, saved in `qa/trait-consumers.txt`. Classified:

| Reader | Where | Weakness |
|---|---|---|
| `getTraitValueByName` (the live one is 100's; 070's is shadowed) | skill, attack and damage pools; skill info; untrained rolls; stance; roll preview; Bishamon; Shiba's Armor TN; Precise Memory; checks and conditions; Void and Initiative entries; Blind's note; Initiative Score; Path and Advanced School prerequisites; Toshigoku and the Disadvantage gates' Willpower rolls | **lowered**: the getter is wrapped |
| `ring_<key>` inputs (read by `getRingValueByName` and directly) | Ring rolls; Wounds (renderWounds, the stepper, the wound level, 4.5.29, 4.5.32); spell slots and casting (pips, castSpell, both casting rolls, Quick Access, casting diagnostics, Void Versatility); Defense stance (Air); roll preview; Kata, Kiho, Path and Advanced School prerequisites; Kuni's and Atarasi's ancestor gifts | **lowered**: `recalcAll()` writes each Ring as the lower of its two effective Traits |
| `ring_<key>` for Insight | `recalcAll()` | **purchased**: Insight reads the Rings of the Traits as bought |
| `ring_<key>` in the save | `collectData()` | **purchased** |
| `trait_<key>` inputs read directly | Trait rolls (the label) | **lowered** (block) |
| `trait_reflexes` read directly | base and current TN to be hit, the Initiative notation, the Initiative roll | **lowered** (blocks) |
| `trait_<key>` for XP, the save, the validator, the wizard's pickers | | **purchased** (never written) |
| `ring_void` | every Void reader | unchanged (Void has no Traits) |

**Consumers the approved wording does not obviously name** (built to "everything worked out from it", for the owner
to confirm): prerequisites (Kata, Kiho, Paths, Advanced Schools) read the lowered Ring or Trait; spell slots per
element follow the lowered Ring; Defense stance's Armor TN uses the lowered Air; ancestor gifts that read Earth or
Intelligence use the lowered value.
