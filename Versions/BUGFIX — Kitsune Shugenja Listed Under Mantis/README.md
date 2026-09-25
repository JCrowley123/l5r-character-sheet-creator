# BUGFIX — Kitsune Shugenja Listed Under Mantis

Made 25 September 2026 at the owner's request: "Remove the school Kitsune [Mantis] from the mantis
clan", surgically and hygienically, before the wizard's starting spells are recorded for every
Shugenja School.

## What was wrong

The Minor Clan School library listed **Kitsune Shugenja [Mantis]** under the Mantis Clan. It was
the Fox Clan's **Kitsune Shugenja** word for word under another name: the same Benefit, Skills,
Honor, Outfit, Technique (Essence of Chikushudo), Affinity (Earth) and Deficiency (Air). The owner's
list of Shugenja Schools, taken from the books, does not have it.

## What changed

**One line deleted** from `src/sheet/060-lib-schools.js`: the School's entry, first in the
`MINOR_CLAN_SCHOOL_LIBRARY` Mantis list. Nothing else in the sheet named it: its Technique text is
shared with the Fox Clan entry, and no other source, harness or save file mentions it (searched
across `src/`, every phase's `qa/` and `Characters/`).

| | Before | After |
|---|---|---|
| Mantis Schools (the sheet's picker and the wizard's cards) | 8, starting with Kitsune Shugenja [Mantis] | 7: Mantis Brawler [Bushi], Moshi Shugenja, Tsuruchi Archer [Bushi], Tsuruchi Bounty Hunter [Bushi], Yoritomo Bushi, Yoritomo Courtier, Yoritomo Shugenja |
| Shugenja Schools in the library | 22 | 21, exactly the owner's list |
| Fox Clan's Kitsune Shugenja | unchanged | unchanged |
| Mantis Clan's **Kitsune Family** (+1 Awareness) | listed | **still listed**. The request named the School only, and the Family is a separate entry (`MINOR_CLAN_LIBRARY`) |

No shared file gained a block, no fragment was added, and there is no seam change: the fix is the
deletion and nothing else.

## A character saved with the removed School

Measured by saving a character on the pre-fix build and opening it on the fixed one: it opens with
**no error**, and keeps its School's name, Rank, Traits and Skills. Because the sheet no longer
finds that School, it treats it like any School not in its library: the School's granted Technique
row (Essence of Chikushudo) is dropped when the sheet re-syncs School Techniques, and the
Affinity/Deficiency line is empty. To restore them, choose the Fox Clan's Kitsune Shugenja. No
character in the repository used the School; the owner's device was not checked. No migration was
added.

## QA

Measured 25 September 2026, headless Chromium at 390 × 844, `NODE_PATH=/opt/node22/lib/node_modules`.

| Measure | Result |
|---|---|
| Own suite | **9/9** (`qa/kitsune-mantis-harness.js`) |
| Own suite on the pre-fix build | **5/9**: fails `KM-MANTIS-PICKER`, `KM-NOT-IN-LIBRARY`, `KM-SHUGENJA-SCHOOLS`, `KM-WIZARD-MANTIS-CARDS`, exactly the four that can see the School (`qa/verify-variants.py`) |
| Every retained suite | **2,345/2,345**, unchanged, so no other check depended on the School |
| Combined | **2,354/2,354**: 2,345 retained + 9 new (`qa/current-suite-runner.js`) |
| Build | **3,042,451 bytes**, SHA-256 `63b51115800d8788a6d3392ef3af9fca988020ed8ba8cc5954c5d05ec9b6517b` |
| Removing the fix | **Byte-identical** to `72ea88b7…` (3,042,795 bytes, commit `bbd7624`) |
| Remover fixtures | **10/10** (`qa/test-removal.py`); dropping its "the Mantis list has changed" guard fails one, as it should |
| Other removal fixtures | The five Part K live fixtures failed once this fix landed (a library line changes every build under them). Each now undoes this fix first with its own remover, and all pass **15/15**; the other 29 in `Versions/` pass unchanged. See ROLLBACK |

The checks read the sheet's own School picker, `findAnySchoolLibraryEntry()`,
`ALL_SCHOOL_TECHNIQUES` and `allSchoolEntries()`, and walk the wizard to the Mantis and Fox School
steps. The Fox entry is compared with the removed line's own data.

## Not verified

- Not tried on a real device. Headless Chromium only.
- Whether the owner's iPhone holds a character with this School.
