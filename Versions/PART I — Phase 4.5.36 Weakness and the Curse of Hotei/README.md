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

**The Void card.** A spend is taken back today only by tapping a blank Void pip (one point per tap); the Undo (FT-24)
is parked. While the two-point spend is the latest change to the Void Points, a blank pip gives both back; after any
other change, pips work as before. The round ledger is not touched by a take-back, as for an ordinary one.

## Structure

| Location | Block or file | Role |
|---|---|---|
| `src/sheet/209.9999999999-feat-weakness-hotei.js` | the fragment | `WEAK4536` (the rule: `effective`, `trait`, `ring`, `purchasedRing`, the `traitPick` definition) and `HOTEI4536` (`check`, `spend`, `takeBack`, the Fortune takeover); then the UI functions (`// UI hook:`) and the installation: the getter wrap, `renderVoidPanel` wrap, two capture listeners on the pips |
| `src/css/59.9999891-feat-weakness-hotei.css` | the stylesheet | the Trait and Ring lines and the two row notes |
| `src/sheet/110-modals-trackers.js` | `weakness-rings`, `weakness-insight`, `weakness-tn-initiative`, `weakness-initiative-roll` | in `recalcAll()` and the Initiative button |
| `src/sheet/080-identity-build-ui.js` | `weakness-trait-roll` | the Trait label's roll |
| `src/sheet/120-persistence.js` | `weakness-save` | the save's Rings as bought |
| `src/sheet/210-test-seam-and-init.js` | `weakness-hotei-seam` | exposes `WEAK4536`, `HOTEI4536` and the switch |

## Combined cases (checked)

| Case | Result |
|---|---|
| Bad Health (4.5.29) with Weakness on Stamina | Earth 3 counts as 2, and Bad Health takes the Wound Ranks to Earth 1 (`W436-WITH-BAD-HEALTH`). Bad Health's row line then reads "yours is 2": the lowered Earth |
| Bishamon's Curse (4.5.12) with Weakness on Strength | Strength 3 → 2 → 1 for damage; Bishamon's note "counts as 1 rather than 2" (`W436-WITH-BISHAMON`) |
| Blind (4.5.31/4.5.34) with Weakness on Reflexes | base and current TN 7 = lowered Reflexes 2 + 5 (`W436-WITH-BLIND`); Blind's note reads the lowered Reflexes |
| Initiative Score (4.5.35) | reads the lowered Reflexes through the getter (`W436-INITIATIVE-SCORE-READS-IT`) |
| Explain This Roll's base pool | the Trait, Ring, skill and Initiative contexts carry the lowered value (`W436-TRAIT-ROLL`, `-RING-ROLL`, `-INITIATIVE-ROLL`) |
| Phase 5's checks, XP | the Trait boxes are never written; XP and the validator read them as bought (`W436-XP-AS-BOUGHT`, `-PURCHASED-KEPT`) |
| Touch of the Void (4.5.33) after a two-point spend | each point passes through `consumeVoidPoint`, so two checks are owed: one per Void Point, as its rule reads (from the code; not exercised) |
| Momoku (4.5.33) | closes the two-point spend as it closes the whole card (from the code) |
| Hotei's Blessing and Curse together | the sheet lets one character hold both; nothing gates the pair. A ruling for the owner |
| The wizard | its Trait steppers write the boxes as bought; its review line reads the Ring boxes, so it shows a lowered Ring when Weakness is already on the sheet. Not exercised |

## Verification (16 October 2026)

| Check | Result |
|---|---|
| Focused harness `qa/weakness-hotei-harness.js` | **39/39** on the candidate; **10/39 on `main`**: the 29 layer checks fail, the 10 guards pass |
| Negative variants `qa/verify-variants.py` | **9/9 pinned**: baseline (29), switched off (29), floor removed (1), Ring not lowered (8), Insight lowered (1), purchased Trait written (20), Hotei charging one point (4), Hotei on a roll's Void tick (1), the two points not given back together (2) |
| Removal proof `qa/test-removal.py` | **6/6**: rebuilds `main` exactly (3,912,042 bytes, `82044392…`) |
| Removal-chain registry `qa/test-chain.py` | **11/11** |

Candidate: **3,932,610 bytes**, SHA-256 `cd52874783bca555d10fca92beff8f9ff14c2182bb9011fa24c6b872929fb935`.

`qa/current-suite-runner.js` chains the Gift of the Lady fix's suite (5,466) and adds 39: **5,505**.
