# PART K — Phase 11.2.3: Wizard Starting Spells

Built 25 September 2026 from the owner's iPhone test of Phase 11.2.2. The wizard's Spells step
said the sheet did not know how many spells a Shugenja starts with. The rulebook does say, in each
School's "Spells:" line, and the owner quoted Kitsu Shugenja's (Core Rulebook p.118):

> Spells: Sense, Commune, Summon, 3 Water, 2 Air, and 1 Earth

That line was never carried into the School library, so neither the character check nor the
wizard could use it. This phase records it and uses it. It is its own point release and extends
Phase 11.2.2's Spells step from outside, by property.

## What the player sees (a School with a recorded line)

| Part | What the player sees | What actually does it |
|---|---|---|
| **The allotment** | "Kitsu Shugenja starts with Sense, Commune, Summon, 3 Water, 2 Air, 1 Earth (Core Rulebook p.118)" | This phase's table, keyed by School name |
| **Given by your School** | Sense, Commune and Summon are already added when the step opens, each with its scroll | 11.2.2's by-hand path: the Spell Scrolls list's own + Add, then the Technique picker |
| **One box per Element** | "Water: choose 3 · 1 chosen", with a picker of Water spells only. The box says "Done." once full | Each pick goes through the same by-hand path |
| **Only spells the sheet allows** | Each picker offers exactly the spells the character may learn now | The sheet's own `spellEligibility()`: effective School Rank for that Element, with Affinity and Deficiency. Kitsu (Affinity Water, Deficiency Fire) at Rank 1 is offered Water up to Mastery 2, Air and Earth up to 1, and no Fire at all |
| **Nothing allowed** | "No Fire spell is within your effective School Rank for Fire, so the sheet will not let you learn one yet." | The same gate, returning nothing |
| **Reminder and Review** | 11.2.2's reminder and Review list now name what is left: "3 Water spells · 2 Air spells · 1 Earth spell" | 11.2.2's `openFor`, rebound for this step |
| **The character check** | A note on the sheet (Phase 5, Part J): "Kitsu Shugenja: starting spells not all chosen. Core Rulebook p.118 gives … Still to choose: …" | One `info` rule added to Phase 5's registry. A count is a lower bound (spells learned later count too), so it never claims an error |

Removing a spell takes its scroll with it and reopens its box. **Changing School** takes back the
given spells this phase added by itself. Spells the player chose stay, as a School change never
removes a player's own choices.

## Which Schools are recorded

**Only Kitsu Shugenja**, from the owner's quotation. The line is taken as quoted and nothing is
filled from memory. The other **21 Shugenja Schools** in the library still need their "Spells:"
line from the books. The sourcebooks are only on the desktop (the folder is gitignored), so a
cloud session cannot read them. Until a School's line is recorded, its Spells step keeps 11.2.2's
note ("the sheet does not record how many spells your School starts with") and generic picker.
Adding a School is one line in `STARTING_SPELLS`, plus a check.

Asahina, Agasha, Chuda, Chuda [Snake], Fuzake, Horiuchi, Isawa, Iuchi, Kitsune, Kitsune [Mantis],
Komori, Kuni, Moshi, Moto Death Priest, Ninube, Seppun, Soshi, Tamori, Tonbo, Yogo Wardmaster,
Yoritomo.

## Deferred, not built: are starting spells memorised?

The owner's design question, recorded for later research and **not implemented**. Should a
Shugenja's starting spells begin **memorised**, needing no scroll, and so, like School Skills, cost
no experience to memorise? Today each starting spell is added with its Spell Scroll, and nothing
is memorised. Deciding needs the rulebook's text on memorisation and starting spells. It is listed
in the ledger's open reminders.

## QA

Measured 25 September 2026, headless Chromium at 390 × 844, `NODE_PATH=/opt/node22/lib/node_modules`.

| Measure | Result |
|---|---|
| Own suite | **25/25** (`qa/wizard4-harness.js`): the table holds only the quoted line; the given spells and their scrolls; the allotment text; each Element's list against the sheet's own Technique picker; Affinity and Deficiency; the check's note appearing and clearing; the reminder; filling every quota (nine spells, nine scrolls); a given spell never filling a quota; Remove; Review; the School change; an unrecorded School unchanged; and **CW3-SAME-AS-BY-HAND** |
| Without Phase 5 (Part J) | **24/24** (measured before `CW3-GIVEN-NOT-COUNTED` was added, which does not read Phase 5): its two character-check checks expect the note to be absent when there is no check |
| Combined | **2,345/2,345**: 2,320 retained + 25 new |
| Build | **3,042,795 bytes**, SHA-256 `72ea88b789701faa2523b9097b06805d0c5051b0850aaab926e60617a9df8668` |
| Surgical removal | **Byte-identical** to `a2d148ee…` (commit `8c9b9eb`) |
| Removal order | 11.2.2's remover **refuses** while this phase is present |
| Remover fixtures | **15/15**, no skips |
| Ownership | `qa/feature-dependencies.py` exits 0 |

**Each part is load-bearing** (`qa/verify-variants.py`, all seven fail where expected):

| Variant | Own suite | Fails |
|---|---:|---|
| Previous build (phase removed) | 0 of 4 scenarios | every scenario |
| Switch off | 2/9 | the allotment, the given spells, the quota boxes; three walks stop |
| Given spells not added | 17/25 | the given spells, the reminder and Review, the character check, `CW3-SAME-AS-BY-HAND` |
| Eligibility ignored | 21/25 | every Element's list against the sheet's, and `CW3-AFFINITY-AND-DEFICIENCY` |
| No character-check rule | 24/25 | `CW3-VALIDATOR-NOTES-IT` only |
| Given spells kept through a School change | 24/25 | `CW3-GIVEN-TAKEN-BACK` only |
| A quota counts the given spells | 24/25 | `CW3-GIVEN-NOT-COUNTED` only |

**The first variant run found a blind spot:** counting a given spell towards a quota changed
nothing, because Kitsu's given spells are all Universal and its quotas are elemental. The counting
is now asked directly (`CW3-GIVEN-NOT-COUNTED`), and the variant fails on it alone.

**No stylesheet, deliberately.** The only rule written for it was one cosmetic margin that no
check could pin, so it was dropped rather than shipped untested. The step reuses Phase 11.2's,
11.2.1's and 11.2.2's classes.

**Found by looking:** a screenshot showed "choose a Earth spell" and "choose a Air spell". Fixed,
and `CW3-PICKER-WORDING` pins it.

## Found while building: every Part K live removal fixture was failing

Each wizard stage's `test-removal.py` removes that stage from a copy of the live tree. Once a later
stage depended on it, its remover correctly refused, and the fixture failed. **Phase 11's has
failed since 11.2 was built, 11.2's since 11.2.1, and 11.2.1's since 11.2.2.** None was re-run when
the next stage landed: each 15/15 quoted in those READMEs was measured before its dependant
existed, and was true only then. All five fixtures now remove the later stages first, newest first,
each with its own remover, and pass 15/15. That also proves the whole chain comes off
byte-identical, from 11.2.3 down to Phase 11's own restore point. Their "phase removed" variants
had the same blind spot and were fixed the same way. See ROLLBACK, "Fixtures it changed".

## Not verified

- **Not tried on a real device.** Headless Chromium only, with fallback fonts.
- Only Kitsu Shugenja has a recorded line, so only it was driven end to end.
- The "nothing allowed" message was checked through `optionsFor('Fire')` returning nothing. No
  recorded School asks for spells of its own Deficiency Element, so the message has not been shown
  in a real step.
