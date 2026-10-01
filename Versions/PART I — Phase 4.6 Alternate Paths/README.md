# PART I — Phase 4.6 Alternate Paths (first release): the Core Rulebook's 18 Great Clan Paths

Built 1 October 2026 on branch `claude/phase-4-6-alternate-paths`, on the owner's approval of the same
day ("the bugfix, followed by Phase 4.6's first release as scoped"). **Merged to `main` on the owner's word
on 1 October, before the iPhone check** ([MANUAL-TESTS.md](MANUAL-TESTS.md); the owner's copy is the
combined checklist doc linked from the ledger), which is owed. The second release adds the
Core Rulebook's other 9 Paths (the magistrate, Legion and Champion Paths, which need Courtier
Schools, Glory, appointments and "any level" Paths) and more than one Path in the same School.

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
- **Variants:** `qa/verify-variants.py --discover` was running at the merge; the pinned oracle
  (`qa/expected-failures.json`) and the pinned run follow.
