# PART I — Phase 4.6 Alternate Paths: the Core Rulebook's 27 Paths (two releases)

**First release** (the 18 Great Clan Paths, below): built 1 October 2026 on branch
`claude/phase-4-6-alternate-paths`, merged to `main` on the owner's word the same day, and **confirmed
on the iPhone, 19/19**. **Second release** (the other 9 Paths and several Paths in one School, the next
section): built 1 October on branch `claude/phase-4-6-alternate-paths-r2`, on the owner's approval of
the same day; **merged to `main` on the owner's word the same day, before the iPhone check**
([MANUAL-TESTS.md](MANUAL-TESTS.md)). Both releases live in the one fragment and are removed together.

## Second release: the 9 Miscellaneous Paths, and several Paths in one School

| Path | Replaces | Requires | Page |
|---|---|---|---|
| Emerald Magistrate | any Bushi, Courtier or Shugenja School 4 | Investigation 3, Lore: Law 3, an appointment | 256 |
| The Amethyst Champion | **any Rank**, Courtier only | the appointment | 256 |
| The Emerald Champion | **any Rank**, Bushi only | the appointment | 256 |
| Imperial Legionnaire | any Bushi School 2 | Glory 2, an appointment | 256 |
| The Jade Champion | **any Rank**, Shugenja only | the appointment | 257 |
| Jade Legionnaire | any Bushi or Shugenja School 2 | Glory 2, an appointment | 257 |
| The Ruby Champion | **any Rank**, Bushi only | the appointment | 257 |
| Jade Magistrate | any Bushi, Courtier or Shugenja School 4 | Lore: Law 3, Spellcraft 3, an appointment | 257 |
| The Topaz Champion | **any Rank**, any School (the book names no type) | winning the Championship | 257 |

- **Appointments** cannot be checked by a sheet: like the Monk Paths' oaths, they are listed under the
  dropdown as things to confirm with the GM, never as locks. **Glory** reads the Glory block's Rank
  field (Points only when Rank is empty), as Honor reads Honor's (the owner's ruling, 1 October), and
  the picker redraws when either Glory field changes. **The Magistrates' rule** (pp. 256–257) that a
  member of the Imperial families may ignore one Skill Rank requirement: a character of the Imperial
  Clan has the first unmet Skill in the Path's own order waived, and the note says so.
- **Any Rank** (the Champions, p. 256: "may replace any level Technique"): the option reads "(replaces
  a Rank you choose)"; taking one opens the sheet's own pick window listing the Ranks reached that no
  Path has replaced yet (none needed when only one is free). Because the Topaz Champion is open to
  every School, **the dropdown now shows for every character with a School**.
- **The Topaz Champion keeps the Technique it replaces** (p. 257): both are granted at that Rank.
- **Several Paths in one School** (Core p. 246): the dropdown adds and removes. Its first line reads
  "— add or remove an Alternate Path —" once a Path is held; Paths held are listed under "Remove a
  Path"; a Path whose Rank is already replaced is locked ("Rank 2 is already replaced by …"), and so
  is a Path the character already holds from another School ("already yours from …"). The trunk's
  handler, which held one Path per character, is dropped by swapping the control for a copy without
  it (every reader looks the picker up by its id, so nothing held the old one).
- **A later Path is not a School Rank** (Core p. 246: "for effects that are based upon School Rank";
  for a monk or shugenja, for learning and using Kiho or spells). The School Rank field, Insight and the
  Technique list are untouched; these effects count without the later Paths: Kiho Mastery reach
  (`kihoEligibility`), the Kiho purchase cap (`cumulativeMonkShugenjaRank`), a shugenja's School Rank
  for learning and casting spells (`effectiveSchoolRankForElement`, which `effectiveSchoolRankForSpell`
  and the Casting Diagnostics start from), the casting breakdown's "base" figure (`makeRollContext`,
  so "base" and the total still agree), and Mirumoto's Rank-scaled Techniques (`getMirumotoRank`, Part
  C). Phase 4.8's spell Deficiency die compares its own count with the casting rank and stands aside
  when they differ, so it never guesses. The first Path still counts in full.
- **Order in the dropdown:** fixed-Rank Paths by the Rank they replace, then the any-Rank Champions,
  each in book order.

# First release: the 18 Great Clan Paths

## What the player sees

On the **Techniques** tab, under the Kata/Kiho/Spell box, the Alternate Path dropdown now offers the
Core Rulebook's 18 Great Clan Paths (pp. 251–255) as well as the 12 Monk Paths it already had. It
stays hidden until the character's School has a Path at a Rank they have reached; a Path whose
requirements are not met is listed greyed with what it needs ("🔒 needs Earth 4"). Taking one puts its
Technique in the list at the Rank it replaces, tagged with the School, and removes the School's own
Technique at that Rank.

| Path | Replaces | Requires | Page |
|---|---|---|---|
| Oni Slayer [Shugenja] | Kuni Shugenja 3 | Lore: Shadowlands 3 | 251 |
| Crab Berserker [Bushi] | any Crab Bushi School 2 | Earth 4 | 251 |
| Empress Guard [Bushi] | Kakita Bushi 3 **or** Daidoji Iron Warrior 4 | Perception 3 | 252 |
| Asahina Fetishist [Shugenja] | Asahina Shugenja 2 | one Craft or Artisan Skill at Rank 3 | 252 |
| Mirumoto Mountaineer [Bushi] | Mirumoto Bushi 2 | Athletics (Climbing) 3 | 252 |
| Tamori Warrior Priest [Shugenja] | Tamori Shugenja 4 | one Weapon Skill at Rank 3 | 252 |
| Deathseeker [Bushi] | any Lion Bushi School 1 | Honor Rank 5, the Dishonored Disadvantage | 253 |
| Bishamon's Chosen [Shugenja] | Kitsu Shugenja 3 | Battle 3 | 253 |
| Yoritomo Scoundrel [Bushi] | Yoritomo Bushi 2 | Commerce 2, Sailing 2 | 253 |
| Mantis Navigator [Shugenja] | any Mantis Shugenja School 3 | Sailing (Navigation) 3 | 253 |
| Shiba Yojimbo [Bushi] | Shiba Bushi 3 | Honor Rank 5 | 254 |
| Isawa Tensai [Shugenja] | Isawa Shugenja 2 | Lore: Elements 3, Spellcraft 3 | 254 |
| Bitter Lies Swordsman [Bushi] | Bayushi Bushi 3 | Kenjutsu 3 | 254 |
| Shadow Hunter [Shugenja] | any Scorpion Shugenja School 3 | Stealth 3 | 254–255 |
| Shinjo Scout [Bushi] | Moto Bushi 2 or Shinjo Bushi 2 | Stealth 3 | 255 |
| Obsidian Magistrate [Bushi] | Daigotsu Bushi 1 | Investigation 2 | 255 |
| Iuchi Traveler [Shugenja] | Iuchi Shugenja 3 or Horiuchi Shugenja 3 | Athletics 2, Horsemanship 2 | 255 |
| Chuda Subversive [Shugenja] | Chuda Shugenja 4 | Lore: Shadowlands 4 | 255 |

Each Technique is described in this project's own words, ending with its Path and page (the owner's
ruling of 30 September); the book's text is not in the repository. **Technique effects are described,
not automated**, as for every School Technique on the sheet (Isawa Tensai's change of Affinities, for
one, is the player's to make).

**Read as printed:** Deathseeker asks for "Honor Rank 5" and the Dishonored Disadvantage together;
the sheet asks for both. Honor is read from the Honor block's **Rank** field (where a School writes
its starting Honor); the Points field only when Rank is empty.

## What changed in the engine

All by rebinding trunk functions from this phase's one fragment
(`src/sheet/209.999993-feat-alternate-paths.js`); no trunk file is edited.

1. **A Path is recorded against its School.** `f_pathTaken` was `{"<Rank>": "<Path>"}`, read against
   whichever School was active, so a Path taken in a first School replaced a second School's
   Technique at the same Rank (the kickoff's risk 1, measured on 1 October). It is now
   `{"<School>": {"<Rank>": "<Path>"}}`. `getPathTaken()`, `savePathTaken()` and `pathAtRank()` answer
   for the active School unless told another; `unlockTechniques(school, rank)` answers for the School
   it unlocks; `pathsTaken()` returns every Path the character holds in every School still in their
   Schools list (bans, Ring bonuses and exempt Kiho are the character's, wherever taken). The picker
   changes only the active School's Path, and notes Paths kept from earlier Schools.
2. **A Phase 7 (Part J) format step** carries an old record up: each old entry goes to the first of
   the character's Schools that the Path can replace at that Rank (the School whose Technique rows
   carry it), otherwise to the active School, which is where the old reader applied it. Registered at
   the end of whatever chain is present (format 3 to 4 with Phase 4.5.2 installed). A record that
   never met the step (typed into the field, or Phase 7 switched off) is read the same way at runtime.
   Saves are not rewritten in bulk (the owner's ruling of 30 September): an older one is upgraded
   when opened, copied or exported.
3. **Clan-and-type clauses.** `{clan:'Crab', type:'bushi', rank:2}` reaches every School the Crab's
   library lists whose type is Bushi. A School's type comes from its tag: the bracket in its name
   when it names a type (`Kaiu Engineer [Artisan/Bushi]` is Artisan and Bushi; `Shiba Artisan
   [Courtier]` is Courtier), otherwise the type word in its name (`Hida Bushi`; `Chuda Shugenja
   [Snake]`), plus the library's shugenja and monk flags. It agrees with the sheet's existing Bushi
   test for every School. The Mantis sit with the Minor Clans in this sheet; the clause reads both
   libraries.
4. **A Rank per clause.** Empress Guard replaces Kakita Bushi 3 or Daidoji Iron Warrior 4: the
   picker's label, the record and the Technique rows use the Rank of the clause that matched.
5. **New requirements:** Honor (`requires.honor`), a named Disadvantage (`requires.disadvantages`),
   and one Skill of a kind at a Rank (`requires.skillOfKind`: Craft and Artisan by name, Weapon by the
   Skill library's category, Low Weapon Skills included). Because an Honor edit does not recalculate
   the sheet, the picker redraws itself when either Honor field changes.
6. **Core p. 246, the owner's ruling of 1 October:** a monk's first Path grants exactly one Kiho at
   its Rank, and a later Path none (a Path's own lower figure still wins: Servants of Mercy grants
   none). Before this release 9 of the 12 Monk Paths gave the usual two. "First" means the first Path
   in the order the character's Schools were taken, then by Rank. For a shugenja the same page gives
   one spell for a first Path and none for a later one; the sheet keeps no count of spells per Rank,
   so that is a note under the dropdown, as is p. 246's "a later Path is not a Rank of your School".
7. **A load check.** Every clause of the 18 Paths must reach a School (a named School must resolve; a
   Clan-and-type clause must match at least one School), every Technique must have a description, and
   every Skill and Disadvantage named must exist; failures go to the console, and the harness asserts
   there are none. The trunk's own check runs again too, since it ran before these Paths were added.

## Retained checks corrected (test-only)

Adding a format step makes the sheet write format 4, and four retained harnesses pinned format 3.
Each now expects one format more **while this phase's step is registered** (read from this phase's
own seam object and Phase 7's switch), and reads exactly as before without it. Their originals are in
`originals/`.

| Harness | Check | Change |
|---|---|---|
| Phase 7 (Part J) `save-format-harness.js` | `FORMAT`, `SF7-FORMAT-STEPS`, and every check derived from `FORMAT` (27 failed before) | `FORMAT` +1 and one more step when Phase 4.6 is installed; its "same sheet" reader hands a save newer than the layers below accept (but not newer than the build) down as their newest format, exactly as Phase 7's own `applyData()` does |
| Feature 4.5.13 `named-advantages-harness.js` | `NAMED-SCHEMA-COMPATIBLE` | 3, or 4 with the step |
| Feature 4.5.14 `court-servant-harness.js` | `CS-SCHEMA-COMPATIBLE` | 3, or 4 with the step |
| Phase 11 (Part K) `characters-harness.js` | `CL-IMPORT-CURRENT-FORMAT` | [3, 2], or [4, 2] with the step |

No Monk, Kiho or Multiple Schools check of any earlier release failed.

## Files

| File | Purpose |
|---|---|
| Phase 0 `src/sheet/209.999993-feat-alternate-paths.js` | The whole phase (`PART I PHASE 4.6`), switch `ALTERNATE_PATHS_ENABLED` |
| Phase 0 `src/sheet/210-test-seam-and-init.js` | One block, `alternate-paths-seam`: `AP46` and the switch on the seam |
| Phase 0 `build/manifest.json` | One entry, new expected hash |
| `QA — Removal Chain Registry/removal_chain.py` | One entry at the end of `CHAIN` |
| Phase 7's `ROLLBACK.md` | Names this phase as depending on it |
| The four retained harnesses above | Test-only conditionals; originals in `originals/` |
| `qa/alternate-paths-harness.js` | This phase's acceptance checks |
| `qa/verify-variants.py`, `qa/expected-failures.json` | Broken variants with pinned failures, two boundary builds |
| `qa/current-suite-runner.js` | Chains BUGFIX — Ancestor Corrections' full runner and this harness |
| `qa/remove-phase.py`, `qa/test-removal.py` | Surgical remover and its adversarial tests |
| `MANUAL-TESTS.md` | The owner's iPhone check |

## QA (1 October 2026, Windows laptop, Chromium via Playwright)

| Build | Bytes | SHA-256 |
|---|---:|---|
| This release | 3,300,280 | `d8f889ef56c9f24750cdc5451ead73c7e28c474bc7374da453583f1e6227199c` |
| `main` before it (`fbd53de`) | 3,264,762 | `4551175ef8c697742c4a704047b1e3e5f306c61a532dd94a4d34d3f47c3f6643` |

- **Own harness: 80/80.** On `main` it gives **16/80**: what passes there is behaviour that must not
  change (the trunk's load check, the Monk Paths' reach, two Kiho Paths that already gave the right
  number, no errors) and two Multiple Schools reads whose premise cannot arise on `main` (the Path is
  not in its library); the "record not per School" variant proves those.
- **The four retained harnesses edited** pass on both builds: Phase 7 45/45, Feature 4.5.13 136/136,
  Feature 4.5.14 225/225, Phase 11 70/70.
- **Removal:** byte-identical to `main` above; `qa/test-removal.py` 21 tests (1 symlink skip); with
  this phase in the tree the live removal tests of Ancestor Corrections, Multiple Schools, the Manage
  fix, Phase 4.8, Phase 7 and Phase 11 all pass; the chain registry 11/11.
- `qa/feature-dependencies.py`: every reference to the phase's names is inside its own blocks.
  `qa/inventory.py` against `main`: only the sheet's script differs. `build.py --check-drift`:
  identical to the Phase 0 build.
- **The device checklist was walked headlessly** through the real controls (Apply School, Other
  Insight Bonus, the Trait and Honor fields): every check in it holds.
- **Full QA: 3,524/3,524, zero failed suites** (3,444 retained + 80 new), with `qa/current-suite-runner.js`,
  on the merged build. The first full run, on an earlier build, failed only the format-3 pins corrected
  above and seven of this harness's Honor checks that the earlier build predated.
- **Variants: 14/14** deliberately broken builds fail exactly as pinned in `qa/expected-failures.json`
  (discovered, then confirmed by a separate pinned run, "all as expected"): phase removed 16/80,
  switch off 21/80, no Clan filter 71/80, no type filter 78/80, record not per School 75/80, unlock
  reads the active School 79/80, Rank not read per clause 77/80, picker label uses techRank 79/80, new
  requirements ignored 70/80, Kiho rule off 77/80, every Path counted as first 79/80, no format step
  74/80, old record not read 74/80, a clause that reaches nothing 70/80. **Boundaries**, fully green:
  Phase 12's modes off 80/80; Phase 4.5.2 off 80/80 (the format step follows the shorter chain).
- **On the live site** after the merge, the checklist's Tests 1 to 5 were walked headlessly: all hold,
  no page errors. The live page matches the local deploy build apart from line endings.

## QA, second release (1 October 2026, Windows laptop, Chromium via Playwright)

| Build | Bytes | SHA-256 |
|---|---:|---|
| Second release (branch) | 3,319,796 | `ab1363ad0300200d40fad7f2cf9737ec886e21d87d95808c287bd3d6f5c1095d` |
| `main`, the first release (`b7dd57c`) | 3,300,280 | `d8f889ef56c9f24750cdc5451ead73c7e28c474bc7374da453583f1e6227199c` |

- **Own harness: 124/124** (80 first-release checks, some reworded to read one Path's option by name now
  that the Champions are always listed, plus 44 new). **On the first release's build it gives 56/124.**
  New scenarios: `LOAD-REACH-R2` (samples each side of every type rule), `PICKER` (a character with no
  School sees no dropdown; Rank 1 lists only the Champions; the order), `RECORD-ELSEWHERE-LOCKED`,
  `MULTI` (two Paths in one School, the Rank-taken lock, removal), `REQ2` (Glory, typed live; the
  Imperial waiver and its notes), `ANYRANK` (the Rank window, a taken Rank skipped, cancel, one free Rank
  needs no window), `TOPAZ`, and `LATER` (spells, the breakdown's base, Kiho reach and cap, Mirumoto;
  the School Rank field and the Technique list unchanged).
- **Full QA: 3,568/3,568, zero failed suites** (3,444 retained + 124), with `qa/current-suite-runner.js`.
  No retained check needed changing.
- **Variants: 27/27** broken builds fail exactly as pinned in `qa/expected-failures.json` (14 from the
  first release, re-aimed where the code moved, and 13 new: one School type per clause, Glory ignored,
  no Imperial waiver, one Path per School, a replaced Rank not locked, a Path held elsewhere not locked,
  any Rank not asked, Topaz replaces, and a later Path counted for spells, the breakdown base, Kiho
  reach, the Kiho cap and Mirumoto). **Boundaries**, fully green: Phase 12's modes off 124/124; Phase
  4.5.2 off 124/124.
- **Removal:** still byte-identical to `4551175e…` (the build before Phase 4.6), both releases together;
  `qa/test-removal.py` 21 tests (1 symlink skip); with this release in the tree the live removal tests of
  Ancestor Corrections, Multiple Schools, the Manage fix, Phase 4.8, Phase 7 and Phase 11 pass; the chain
  registry 11/11. `qa/feature-dependencies.py`: every reference inside this phase's own blocks.
  `qa/inventory.py` against the first release: only the sheet's script differs (the swapped picker keeps
  its id, so the element IDs are unchanged).
- **The device checklist (Tests A to E) was walked headlessly through the real controls** (Apply Family,
  Apply School, Other Insight Bonus, the Skill, Glory and Honor fields, the pick window): every check
  holds. Walking it found one wording fix: the Imperial waiver goes by the character's Clan, which
  **Apply Family** sets, so Test D applies the Seppun family as well as the School.
