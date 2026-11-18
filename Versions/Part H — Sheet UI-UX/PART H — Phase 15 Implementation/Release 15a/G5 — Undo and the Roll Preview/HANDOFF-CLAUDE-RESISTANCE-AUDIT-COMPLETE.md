# Handover to Claude — resistance audit complete

Written by Codex on 18 November 2026 at the owner's request. This continues the L5R 4e character sheet work after the targeted resistance rules read.

## Start here

The audit is finished, committed and pushed. **Do not restart from the old “28 of 823 passages read” checkpoint.** The next work is to use the completed findings to resume the resistance-preview discussion and act on the owner's next instructions. The audit itself did not authorize or implement application fixes.

Read this handover, then the summary, declaration comparison and final three lists in [RESISTANCE-RULES-READ.md](RESISTANCE-RULES-READ.md). Use [resistance-rules.json](resistance-rules.json) to inspect individual rows, passage dispositions and trigger rolls without dumping the whole report into context. Read the current repository instructions before implementation. If the next task is the A12 redesign, also consult the existing `A12-REVISION-OPTIONS.md`, `RESISTANCE-MOCKUPS.md`, `COMBINED-RESISTING-MOCKUPS.md` and the adjacent A12 README; those earlier design records were not changed by this audit.

The original [HANDOFF-CHATGPT-RESISTANCE-RULES-READ.md](HANDOFF-CHATGPT-RESISTANCE-RULES-READ.md) remains the historical scope and method. Its incomplete-reading status is superseded by the completed report and data.

## Repository and checkpoint

- Repository: <https://github.com/JCrowley123/l5r-character-sheet-creator>
- Existing worktree: `C:/Users/jcrow/l5r-release-15a-group5`
- Branch: `claude/release-15a-a12`
- Audit commit: **`cfa0ca66160eda34fe75f6fcd75c290ec6cc5376`** — `Release 15a G5: complete resistance rules audit`
- [Audit commit on GitHub](https://github.com/JCrowley123/l5r-character-sheet-creator/commit/cfa0ca66160eda34fe75f6fcd75c290ec6cc5376)
- Static application comparison baseline: `09864654` (immediately before the audit commit).
- Audit folder: `Versions/Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/G5 — Undo and the Roll Preview/`

The audit commit changed only `RESISTANCE-RULES-READ.md` and `resistance-rules.json`. This separately requested handover is an additional documentation file. The worktree was clean and the remote matched the audit commit when the handover was started; verify current HEAD/status before continuing because the handover has its own subsequent commit.

Never switch branches in the shared checkout `C:/Users/jcrow/l5r-character-sheet-creator`, and do not use the OneDrive repository clone. Continue in the existing worktree, or create an isolated worktree from this branch if needed. Do not stash, reset or force-push. Pull with `--ff-only` before new work and preserve unrelated changes.

The branch already contains Claude's earlier A08/A12 work. “No application changes” below describes the audit session; it does not mean the branch has no previous feature implementation. Existing G5 device/qualification work was not rerun or completed by this audit.

## What was completed

| Measure | Result |
|---|---:|
| Stable passages accounted for | 823 of 823, across 16 books |
| Passages containing table rules | 197 |
| Trigger-only passages | 166 |
| Excluded passages, each with a reason | 460 |
| Rule rows | 245 |
| Rows lacking specific mechanical support | 211 |
| Independent disagreements | 6, affecting 9 rows |
| Trigger source/effect records | 208 |
| Whole-chapter recall misses, included in the table | 5 |
| Other full-page discoveries outside passage text | 28 |

All numbered passages were reviewed without the `--stem` filter; clipped names and rules were checked on full pages. This was a targeted read, **not a cover-to-cover read of sixteen books** and not proof that every resistance rule in the books was found.

The two chapters were selected independently of keywords:

- **Core, General Mechanics, printed pp75–95:** five missed direct defensive/recovery rules — drowning (p83), Knockdown (p87), Dazed recovery, fatigue-induced sleep and Stunned recovery (p89). Rows `CR001`–`CR005`. The surrounding chapter boundaries were also checked.
- **Emerald Empire, Education, printed pp210–223:** zero qualifying resistance rules, so zero misses. This zero-yield sample is weak evidence about overall retrieval recall.

The scanner's original matching rule and passage numbers were not changed. The data records every ID from 1 through 823 once. Empty `passages` arrays identify discoveries outside the original passage text; they do not mean the rule lacks a citation. Do not inflate the five-rule chapter-recall score with the 28 other full-page discoveries.

## How to interpret the results

The **245 rows are rules or distinct effect clauses, not 245 unique abilities**. One ability can occupy multiple rows. General Fear/Intimidation/Temptation rows and the shared Honour rule overlap in their description of the same bonus: add Honour only once.

The **211 missing-mechanics rows are not 211 bugs or 211 new buttons**. They include correct reminder text, general procedures usable with manual dice, non-roll immunities/caster-side effects, optional rules, unique artifacts and intentionally unsupported nonhuman character options.

Overall `sheet_status` totals are 29 `yes`, 207 `no`, 9 `differs`. The separate `sheet_mechanical_status` totals are 29 `yes`, 211 `no`, 5 `differs`. Four of the nine differing rows are inaccurate/incomplete reference text without mechanics; the other five are the four Honour-related rows and the implemented Epilepsy check with an incorrect recovery instruction. The six-issue count groups the Honour problem as one root cause.

`sheet_presence` distinguishes implemented, reference-only, generic-roll-only and absent support. A catalogue entry is not proof of arithmetic. All comparisons are static source inspection; the app was not run to establish these findings.

`proposed: add` means eligibility follows from the selected effect and established context. `ask` means a player/GM must judge an extra circumstance. These are design recommendations, not owner approval. For a non-roll protection, neither label creates a resistance roll; see `proposed_action_scope`.

The JSON contains `rules`, `coverage`, `trigger_register`, grouped and specific trigger counts, `recall_checks`, `sheet_comparison`, `disagreements` and `owner_questions`. Printed pages are integers or range strings. `unusual` on trigger records is nullable: null means unassessed, not ordinary. Always use `named_roll`; the flag is only a note. Trigger records are evidence for the effect counts, not additional rule rows or a count of unique creatures/spells.

## Findings to carry into the design

The agreed direction from the original handoff is to ask what the character is resisting, add certainly applicable bonuses, and ask about conditions only the player can judge. Filter effects by the roll opened. Give an ability its own roll button only when the book actually names a roll for it.

- Ordinary Fear uses **Willpower**, not Earth. Intimidation and Temptation normally use **Etiquette (Courtesy) / Willpower**, with specific exceptions and GM substitutions retained. Normal Taint exposure uses **Earth**. The Core poison examples use **Stamina**. Do not give poison and disease one guessed universal Ring.
- All fifteen existing resistance declarations were found. Fourteen match their conditional numerical effect; Honour has the overbroad Failure of Bushido gate. Broad roll-kind offers are a separate design gap. Kaimetsu-Uo's provocation declaration removes an automatic bonus; it is not another positive modifier.
- **Paragon Courage, Paragon Honor and Yoritomo Courtier Rank 5 remain reminder/Technique text only.** Their numerical resistance benefits are absent from the preview.
- **Already implemented:** Jurojin's Curse; the dedicated Taint growth check; Jade Petal Tea's growth-only +2k2 choice; Kaimetsu-Uo's automatic Willpower bonus and provocation exception; Hotei's default contested Void check and conditional +10 alternative. Do not re-add these as if absent.
- Hotei's +10 applies when the effect already supplies a contested roll. Do not add it automatically to Hotei's newly supplied default Void contest.
- Tetsuken replaces the normal Honour contribution with **twice Glory**, not twice Honour. Miya Herald Rank 2 adds Honour to qualifying Etiquette rolls; it does not double the entire roll. Their stacking/replacement questions remain explicit.
- The Kuni ancestor and Kuni Witch-Hunter Rank 1 are separate rules. Jurojin's Curse the Disadvantage and the spell are separate. The two Whispering Flames spells are distinct versions. Shadow Rank 1 and one Shadow Brand have overlapping penalties that must not be silently stacked.
- The Part I `AUDIT.md` is historical (2 October 2026). Its old text-only classifications for Balance, Clear Thinker, Heartless and Irreproachable are superseded by current implementations. It was checked, not used as current behavior truth.

The owner already settled the Core readings for Failure of Bushido (Honor), Paragon and Yoritomo Courtier Rank 5. Do not ask the owner to reconfirm them or reread those entries merely because the implementation is still pending. Failure bars Honour against Intimidation/Temptation only; Paragon Courage gives +1k1 against Intimidation/Fear; Paragon Honor substitutes twice Honour against Intimidation/Temptation; Yoritomo Rank 5 gives +5k0 against Intimidation/Temptation/Fear and to outgoing Intimidation.

## Six discrepancies — none fixed in the app

Source filenames below are under `Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/src/sheet/`. Full paths, line references and row IDs are in the JSON.

1. **Mechanical eligibility error — C-fear, C-honour, C-failure-honor, C-brash.** Failure of Bushido (Honor) suppresses Honour against Fear, and also suppresses Brash’s explicit Honour bonus for ordinary provocation. The book limits this disadvantage to Intimidation and Temptation. One root cause, two manifestations, four affected table rows. Core Rulebook p90; Core Rulebook p91; Core Rulebook p159; Core Rulebook p157.
2. **Incorrect rule reminder — C-shosuro-blade.** Shosuro Blade’s reminder adds +5 to the TN of applying poison. Core p153 instead raises the victim’s TN to resist that poison. Core Rulebook p153.
3. **Incorrect eligibility wording — water-dharma.** Differs: reminder restricts the spell to targeting the monk alone. The book also permits a multi-target spell, protecting only the monk, while excluding area spells. No dedicated Staves/Water defensive roll is supplied. The Book of Water p189.
4. **Missing resistance upgrade in reminder — fire-transcendent.** Technique reminder describes only mundane immunity. It omits the one-Raise extension to magical fire and two-Raise extension to every fire source. The Book of Fire p181.
5. **Missing resource cost in reminder — earth-wholeness.** Kiho reminder includes preparation, Raises and the purge limit, but omits spending all remaining Void Points after success. No resistance-preview entry. The Book of Earth p207.
6. **Incorrect check-result instruction — C-epilepsy.** The seizure checks use the correct TNs, but the failure instruction tells the player to retry recovery each round. Core p159 specifies once each minute. Core Rulebook p159.

## Owner decisions still open

No answers to these audit questions were received in the Codex session. The first four were preserved from Claude's earlier report. Use the owner's next instruction to determine scope; do not treat this list as an instruction to implement everything or to ask all questions at once.

1. **Failure of Bushido (Honor) and Fear.** Should the sheet keep Honour’s bonus against Fear? The owner-confirmed book reading bars it only against Intimidation and Temptation. Also preserve Brash’s explicitly granted Honour bonus when the provocation is not an Intimidation/Temptation roll.
2. **Paragon.** Should the new design add Courage (+1k1 against Intimidation/Fear) and Honor (twice Honour instead of the ordinary contribution against Intimidation/Temptation)? Both are currently reminders only; the book reading remains settled.
3. **Yoritomo Courtier Rank 5.** Should the new design add its +5k0 against Intimidation, Temptation and Fear? The correct Technique text exists, but the benefit is absent from the preview.
4. **Penalties.** Should the sheet apply or ask about resistance penalties as it does bonuses? Jurojin’s Curse is already mechanically implemented; Moto Curse, the Jigoku resistance penalty and Bad Health’s disease-specific reduction remain gaps.
5. **Design scope.** Which optional and exceptional rules belong in the new menu: Counterspelling, Meditation-as-Etiquette, Void overload, Spirit Realms/Yumeji, Nothing corruption, returned spirits, nonhuman characters and unique artifacts? Nonhuman creation is intentionally unsupported today.
6. **Recovery and environment.** Should the new menu cover recovery from Dazed/Stunned and environmental dangers such as drowning or involuntary sleep?
7. **Dazed recovery.** Should Dazed action penalties apply to its Reaction-stage recovery roll? Keep this a GM ruling rather than silently reducing the recovery pool.
8. **Broad modifiers.** Include broad contested-Social/Skill/Trait bonuses when they apply to defence, or retain them in the ordinary roll engine? Do not double-apply bonuses such as Kaimetsu-Uo that the sheet already adds automatically.
9. **External effects.** Should external spells, curses and ally benefits become temporary tracked conditions, or player-confirmed choices? Yasuki Taskmaster also needs the commander’s Intimidation Rank.
10. **Replacement and stacking.** Make Tetsuken’s twice-Glory replacement mutually exclusive with normal Honour/Paragon. Decide whether Miya Herald Rank 2’s Honour addition stacks with the ordinary Honour bonus against Intimidation/Temptation; the Technique does not double the whole roll. Do not automatically stack the overlapping Shadow Rank 1 and one-Brand penalties.
11. **Cleansing the Body.** Cleansing the Body (Book of Void p188) first describes a target without Taint, but then says the bonus fails at one full Rank. Does a character at 0.1–0.9 qualify?
12. **Imperial Scion.** Imperial Scion Rank 2 (Emerald Empire p79) prints an opposed Courtier / Etiquette roll without a Trait. Which concrete Skill/Trait pairing should the sheet use if the GM adopts it?
13. **Whispering Flames.** Should the two distinct Whispering Flames spells be offered separately, labeled by book/element, to avoid borrowing the wrong resistance roll?
14. **Shadow Rank 1.** Shadow Rank1 adds a TN to a contested roll; how should this be represented without silently treating it as a dice penalty?
15. **Oni Mark cadence.** Core p273 describes a daily Earth check while the p276 exposure table lists Oni Mark weekly. Which cadence should the sheet present? Preserve both citations until ruled; the ordinary resistance TN is 15.
16. **Bayushi rounding.** Bayushi Courtier Rank 1 (Core p127) divides the opponent’s Mental/Social Disadvantage points by three and calls for rounding without stating a direction. Which rounding convention should the sheet use? The five-Free-Raise cap and lack of a precise-knowledge requirement are settled.
17. **Corrections.** Approve correcting the five other discrepancies listed above: Shosuro Blade, Dharma Technique, Apotheosis of Fire, Wholeness in All and Epilepsy recovery cadence? This audit has changed no application behavior.

## Validation and working conventions

Completed for the audit commit:

- JSON parses; all 245 Markdown rule rows match their data fields.
- Coverage is exactly 1–823, with reciprocal rule/trigger references; IDs are unique; grouped and specific trigger totals both equal 208.
- All four original owner questions remain. Book and printed page are present on every rule. Source filenames and cited line numbers were checked.
- `git diff --check` and the staged equivalent passed.
- **`PYTHONUTF8=1 python build.py --check-drift` passed** at the worktree root. Phase 0 output was byte-identical: 17,696,074 bytes, SHA-256 `f76786334a9c51da07f8bd6283bc6eb784f479e6cf79286cdc290f72e093bc41`.
- Only the two audit deliverables were in commit `cfa0ca66`; push succeeded and remote HEAD was verified. No application, harness or matcher changes, no deployment, and no runtime/device testing were performed for this audit.

Use LF line endings when writing these Markdown/JSON files. Python's default Windows newline conversion initially produced a whitespace-check failure; it was corrected before the audit commit. Do not suppress that check or change repository settings to hide it. Run the required drift check before each new commit and keep commits scoped to the owner's task.

If book verification is needed for genuinely new or ambiguous material, use the owner's local PDFs in `C:/Users/jcrow/OneDrive/Documents/L5R 4th edition books`. Paraphrase only, with book and printed page; never save extracted book text. The unchanged reader is `qa/resistance-rules-read/resistance_passages.py` in this G5 folder. The repository page map is `Versions/SOURCEBOOK INDEX — Page Map/index.json`; do not treat PDF page numbers as printed pages.

Working executables in this Codex environment were:

```powershell
$env:PYTHONUTF8 = '1'
& 'C:/Users/jcrow/AppData/Local/Python/pythoncore-3.14-64/python.exe' build.py --check-drift
```

Poppler: `C:/Program Files/Git/mingw64/bin/pdftotext.exe`. The ordinary `python`/`py` aliases were unavailable to the sandbox, and a separate bundled Python had a corrupt library; the explicit executable above worked. These are environment notes, not required changes to the project.

## Suggested next session

1. Verify the existing branch/status and read the completed audit's summary, six discrepancies and owner questions. The committed report/data are the authoritative handoff; no scratch scripts are needed.
2. Resume the owner's resistance-preview discussion using the existing G5/A12 design records. Separate definite corrections, missing modifiers, general resistance/recovery procedures and optional campaign scope when presenting choices.
3. Follow any new implementation authorization the owner gives. Until then, the completed audit is documentation, not approval to modify the app or deploy it. Record decisions and preserve the owner-confirmed rules.
4. When implementing, use the exact named rolls and existing modifier providers, avoid double-counting, verify behavior with the project's applicable checks, and keep the audit/data synchronized with any changed support claims.

Local convenience copies of the completed artifacts and this handover are under `C:/Users/jcrow/Documents/Codex/2026-11-16/this-is-a-new-session-continuing/outputs/`. The repository copies in G5 are the durable project record.
