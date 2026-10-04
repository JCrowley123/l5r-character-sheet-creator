# Phase 4.7 — Core Advanced Schools, first release

**Release record, 4 October 2026.** Implemented on
`codex/phase-4-7-core-advanced-schools`; the owner authorized merging to main.
See [MERGE-AUDIT.md](MERGE-AUDIT.md) for the 96-hour branch audit and final merge
evidence. The owner reported all other tests passed, with the Blackmail count
and ChatGPT preview Spell Slots concerns still open (ledger FT-07/FT-08).
Windows preview is evidenced; no iPhone pass was reported.

This release adds the Core Rulebook's nine Advanced Schools, their printed entry
requirements and 27 Technique descriptions. Techniques are rules references in
this project's own words, with source pages. **All Technique effects remain
manual**, including roll bonuses, casting-rank bonuses, extra spell slots,
Reduction, Armor TN, actions, Conditions and resource spending.

| Advanced School | Entry requirements | Technique pages |
|---|---|---|
| Defender of the Wall | Core p.247 | 247 |
| Kenshinzen | Core p.247 | 247 |
| Swordmasters | Core p.247 | 247 |
| The Lion's Pride | Core p.248 | 248 |
| Storm Riders | Core p.248 | 249 |
| Elemental Guard | Core p.249 | 249 |
| Scorpion Instigator | Core p.249 | 250 |
| Obsidian Warrior | Core p.250 | 250 |
| The White Guard | Core p.250 | 250 |

The source catalogue is [data/core-schools.json](data/core-schools.json).
[AUDIT.md](AUDIT.md) records the reading decisions and the printed shugenja
formulas. Those formulas explain the reference text; they are not implemented
casting or spell-slot adjustments in this release.

## Entry and progression

The Advanced School panel is on the Techniques tab. It offers Schools whose
measurable prerequisites the character meets, using the existing Skill, Trait,
Ring, Honor, family and Advantage/Disadvantage data. Entry requires the Multiple
Schools Advantage, an active basic School and Management mode when modes are
installed. A character may hold only one Advanced School. The existing exclusion
between Bushi and Shugenja training applies across both tracks.

Requirements the sheet cannot establish are explicit player/GM confirmations:
Kenshinzen's duel, the Lion's Pride's female-character requirement, the
Instigator's four different Blackmail targets and disclosed Dark Secret,
Obsidian Warrior's skirmish, and White Guard devotion or a campaign before 1160.
The confirmations supplement the measurable requirements; they do not waive
missing Blackmail, Dark Secret or other entries.

The Lion's Pride needs four different Weapon Skills; duplicate Skill rows do not
increase the count. Storm Riders require Elemental Blessing configured for
Water. Elemental Guard requires a chosen non-Void Ring of at least 6 and the
ability to cast that element's Mastery Level 4 spells, with existing affinity and
deficiency taken into account. Merely listing a spell is insufficient.

Joining freezes the current basic School at its earned rank and records the
current Insight Rank as the start of the new training. **Joining grants Advanced
Rank 0.** The next three Insight Ranks grant Advanced Ranks 1, 2 and 3, with one
free Technique reference at each. Earlier School and Alternate Path Techniques
are retained. Joining grants no starting-school Skill, Trait, outfit or spell
package. An earned Advanced rank is retained if Insight later falls; no fourth
Advanced rank is granted.

At Advanced Rank 3, the player can confirm GM permission to continue basic
School training. Resuming the prior basic School retains its earned rank; the
next Insight Rank advances it. A new basic School through the existing Multiple
Schools flow also requires that permission and its normal entry rules. Advanced
ranks remain separate from basic School ranks.

## Save data and dependencies

`f_advancedSchoolData` stores the chosen School, any element and confirmations,
the Insight anchor, earned Advanced rank, frozen basic School/rank and further
training permission. A Phase 7 format step adds an empty record to older saves
(format 4 to 5 with all current layers). Loading a character without an Advanced
School clears any previous character's record. Malformed Advanced records are
refused. Older builds without this format step refuse newer saves; keep an
original export for rollback testing.

| Layer | Dependency | Role |
|---|---|---|
| Alternate Paths, Phase 4.6 (Part I) | Hard | `AP46` and the extended prerequisite checks, including distinct Skill kinds and school-scoped Paths. AS47 stays disabled if this layer is absent or switched off. |
| Save Format and Migration, Phase 7 (Part J) | Hard | `VersionManager` registers and validates the new save-format step. AS47 stays disabled if this layer is absent or switched off. |
| Play/Management, Phase 12 (Part K) | Soft | Guards entry and further-training controls in Play. Without it, these controls remain available. |
| Advantages configuration, Phase 4.5 (Part I) | Soft for the catalogue; required for Storm Rider eligibility | The guarded `readAdvConfig` call establishes that Elemental Blessing selects Water. Without that reader, this prerequisite cannot pass; other Schools remain available under their own rules. |
| Multiple Schools Keep Earlier Techniques bugfix (`MSTECH`) | Existing preservation behavior | AS47 does not call its API. The installed fix preserves prior basic-School Technique rows; removing it returns the earlier Multiple Schools behavior. |

The two hard parents' ROLLBACK files declare this consumer. Remove Phase 4.7
before either hard parent. The trunk's Multiple Schools and prerequisite engines
remain in their existing files and are wrapped from the new fragment.

## Owned files and QA

The production fragment is `src/sheet/209.999999-feat-advanced-schools.js`, marked
`PART I PHASE 4.7`, with switch `ADVANCED_SCHOOLS_ENABLED` and API `AS47`. It
creates its panel, styles and hidden field at load. The only shared source block
is the guarded `advanced-schools-seam` export in `210-test-seam-and-init.js`.
The manifest and removal-chain registry each gain one entry.

| Verification | Final release result |
|---|---|
| Acceptance harness against baseline and release | Baseline 1/9 (eight missing-capability failures); release 196/196 |
| Full retained suite plus this release | 4,036/4,036; recorded in qa/full-suite.log |
| Reviewed mutation discovery and pinned rerun | All 14 variants fail exactly as pinned; qa/pinned-variants.log |
| Dependency and optional-layer boundary builds | Modes off 196/196; Alternate Paths off 10/10; Save Format off 10/10 |
| Hardened removal fixtures and exact baseline rebuild | 24 tests: 23 passed, 1 Windows symlink skip; exact baseline restored; retained suite on removed build 3,840/3,840 |
| Source ownership, recombination and desktop/mobile layout review | All 14 owned names accounted for; structural inventory and source/build drift checks pass; 390px and 1440px screenshots reviewed |
| Owner device report | All other tests passed, with FT-07/FT-08 open; Windows preview evidenced; iPhone not reported |

The preceding Phase 0 build is 3,489,469 bytes, SHA-256
`7f57135bddb8c4c1bc306c8841f52ed0eb9c03292f873e7302a8b13ccda8bd49`.
The release build is **3,525,220 bytes**, SHA-256
`b02aa5584cc90cbb948ece23980bcf5ae766d943eada6430c52353dead2e8950`.
The final removal evidence is in `qa/final-verification.json` (completed 4 October).
`--reuse-full` on `qa/final-verification.py` explicitly reuses the existing full
suite after checking the release hash against the inventory; removal checks run
again. No sheet source changed after the 4,036-check pass.

Run these from the repository root in PowerShell. Execute the full suite alone;
retained geometry checks are sensitive to competing browser-test load.

```powershell
$env:PYTHONUTF8 = '1'
$env:NODE_PATH = 'C:/Users/jcrow/l5r-qa-tools/node_modules'
$env:PLAYWRIGHT_BROWSERS_PATH = 'C:/Users/jcrow/l5r-qa-tools/ms-playwright'
$phase47Sheet = 'Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html'
& 'C:/Program Files/nodejs/node.exe' 'Versions/PART I — Phase 4.7 Advanced Schools/qa/advanced-schools-harness.js' $phase47Sheet
& 'C:/Program Files/nodejs/node.exe' 'Versions/PART I — Phase 4.7 Advanced Schools/qa/current-suite-runner.js' $phase47Sheet
& 'C:/Users/jcrow/AppData/Local/Python/pythoncore-3.14-64/python.exe' -B 'Versions/PART I — Phase 4.7 Advanced Schools/qa/test-removal.py'
& 'C:/Users/jcrow/AppData/Local/Python/pythoncore-3.14-64/python.exe' -B 'Versions/PART I — Phase 4.7 Advanced Schools/qa/verify-variants.py' --jobs 3
```

The pinned variants command requires the reviewed `qa/expected-failures.json`;
all pinned variants matched their expected failures. See [ROLLBACK.md](ROLLBACK.md) and
[MANUAL-TESTS.md](MANUAL-TESTS.md). The other two planned Phase 4.7 releases are
outside this first Core release.
