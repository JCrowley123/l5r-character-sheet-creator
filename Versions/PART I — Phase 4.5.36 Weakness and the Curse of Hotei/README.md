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
| Momoku (4.5.33), Kharmic Nemesis, a Disadvantage check | the two-point spend asks the Void card's own gates, so each closes it as it closes the card (`H436-VOID-CARD-GATES` for Momoku) |
| Hotei's Blessing and Curse together | the sheet lets one character hold both; nothing gates the pair. A ruling for the owner |
| The wizard | its Trait steppers write the boxes as bought; its review line reads the Ring boxes, so it shows a lowered Ring when Weakness is already on the sheet. Not exercised |

## Verification (16 October 2026)

| Check | Result |
|---|---|
| Focused harness `qa/weakness-hotei-harness.js` | **45/45** on the candidate; **11/45 on `main`**: the 34 layer checks fail, the 11 guards pass. On the pre-review build (`c966583`) 39/45: the six checks added for the review fail |
| Negative variants `qa/verify-variants.py` | **11/11 pinned**: baseline (34), switched off (34), floor removed (1), Ring not lowered (8), Insight lowered (1), purchased Trait written (21), Hotei charging one point (5), Hotei on a roll's Void tick (1), the two points not given back together (1), the round rule ignored (1), the Void card's gates ignored (1) |
| Removal proof `qa/test-removal.py` | **6/6**: rebuilds `main` exactly (3,912,042 bytes, `82044392…`) |
| Removal-chain registry `qa/test-chain.py` | **11/11** |
| Code review (one helper, read-only, the diff and these rules) | 7 findings, all confirmed and fixed (below) |
| Under-load check `qa/under-load.py` (16:58 UTC, mains power, screen held awake, 30 Chrome processes: the owner's browser) | five repeats, candidate and `main` alternating, all 20 harness runs passed. `recalcAll()` at 4× CPU with Weakness, Hotei and Bad Health on the sheet: median 78.8–97.5 ms (mean 88.3) against `main`'s 65.7–88.2 (mean 78.7), worst 153 against 138; about 10 ms more at 4× CPU, no check reads it. Worst keystroke: Search 11.7–26.1 ms (`main` 9.3–34.3), Facets 18.0–29.0 ms (`main` 19.1–34.5), limit 50. Raw lines: `qa/under-load.log` |

Candidate: **3,935,889 bytes**, SHA-256 `f39a31cbe31e9e8ad923f557275e1d613920fe98868a67ccc74cdd342fd3fec0`.

`qa/current-suite-runner.js` chains the Gift of the Lady fix's suite (5,466) and adds 45: **5,511**.

## Retained test changes

While Hotei is automated (`HOTEI4536.installed`), five checks in two earlier harnesses assert the automated row,
declared as cross-phase fixture corrections in the pattern Feature 4.5.12 used for Bishamon; off or removed, the
original expectations apply verbatim. No check is dropped and both totals are unchanged (74 and 51).

| Harness | Check | While Hotei is automated |
|---|---|---|
| 4.5.11 `qa/disadv-fortune-harness.js` | `F4511-DEFER-Hotei-NOTE` | the row no longer claims deferral (the same branch 4.5.12 added for Bishamon) |
| | `F4511-DEFER-HOTEI-PRICE` | the row states the 6-point price in its value line (the deferred note that carried it is gone) |
| | `F4511-GEOM-02` | Hotei's badge reads as active, as Bishamon's does: no Fortune is deferred any more |
| | `F4511-GEOM-03` | the row note's geometry is measured on Daikoku's koku note, this phase's other row note |
| 4.5.12 `qa/disadv-bishamon-harness.js` | `F4512-SCOPE-HOTEI-DEFER` | Hotei is not deferred and still carries no note of 4.5.12 |

Pre-change copies are in `originals/`. **How they were found:** full run 1 (17:01 UTC, 16 October) failed these two
leaves (69/73 and 50/51) before it was stopped at the owner's request after 39 of 116 leaves. The cause was this
layer's intended change, not a fault in the sheet: the two harnesses had not been run with the layer before the
suite. Every leaf that reads the changed surfaces was then run with the corrections (`qa/touching-leaves.py`,
`qa/run-leaves.py`, logs `qa/touching-run.log`): 4.5.11 74/74, 4.5.12 51/51, 12.5 212/212, 4.5.33 44/44, 4.5.35 20/20,
and twenty leaves that read Traits, Rings, Wounds, the TN, Initiative or the Void pips, all passing.

## Code review (16 October 2026)

| # | Finding | Fix, and the check that now holds it |
|---|---|---|
| 1 | The Hotei button was drawn only when the Void card was redrawn: no button after configuring the Curse or loading a character, a stale one after removing it, a stale "you have 1" after tapping a pip | redrawn with the pips too (every recalc and pip tap); `H436-BUTTON-FOLLOWS-ROWS-AND-PIPS` |
| 2 | The two-point spend skipped the Void card's gates (Kharmic Nemesis, a Disadvantage check in progress) | it asks the card's own `canSpendVoid` chain, which also covers Momoku; `H436-VOID-CARD-GATES`, variant "gates ignored" |
| 3 | A pending take-back survived loading another character or a new sheet, so a blank pip could give 2 | cleared on load, on a new sheet, when the Curse goes or the Void Ring changes; `H436-TAKE-BACK-STAYS-WITH-SHEET` |
| 4 | `H436-ONE-SPEND-PER-ROUND` passed because 1 point is fewer than 2, not because of the round rule | 5 points, and it reads the round rule's reason; variant "round rule ignored" |
| 5 | A renamed Weakness row kept its pick behind "Saved setting kept" | `traitPick` registered as a known type with Feature 4.5.3; `W436-RENAMED-ROW-DROPPED` |
| 6 | With no Weakness picked, a blank Trait box changed the Ring (the layer read blank as 2, the core as 0) | the Ring hooks do nothing until a Trait is lowered, and read a box as the core does; `W436-NO-ROW-BLANK-BOX-AS-CORE` |
| 7 | A duplicate Weakness row (only from a hand-edited save) still refunded 6 XP | it refunds 0 and says so; `W436-DUPLICATE-NO-REFUND` |
