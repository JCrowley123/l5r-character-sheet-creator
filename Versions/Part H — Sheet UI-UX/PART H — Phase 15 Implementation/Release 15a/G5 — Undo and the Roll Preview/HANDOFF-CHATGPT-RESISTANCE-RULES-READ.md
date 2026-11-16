# Hand-off to ChatGPT (Codex): finish the resistance rules read

Written by Claude on 16 November 2026 at the owner's request. This file is the whole brief; it can be pasted as it is.

## The job

Finish a targeted read of the owner's sixteen L5R 4th Edition sourcebooks for **every rule about resisting something**, record each rule in one table, then compare the table with what the character sheet does today. Read and report only: **change no application file** (nothing under the Phase 0 `src/`, no built HTML, no test harness).

## Why

The owner is redesigning how the sheet's roll preview handles resistance (design paused, nothing built). The agreed direction: the sheet asks the player what they are resisting (Fear, Intimidation, Temptation, poison and so on), adds every bonus that certainly applies, and asks about the ones only the player can judge. The list of effects follows the roll that was opened (an Earth Ring roll must not offer Fear), and an ability gets its own roll button only where the book names one roll for it. So the table's most important column is **the roll the book names**. The owner wants to be sure nothing is missed and that the sheet does not contradict the books.

## Rules for the work

- **Never verbatim.** The owner's ruling of 30 September 2026: rules content goes into the project in our own words with book and printed page. Do not save any extracted text; do not quote more than a short entry name.
- Repository: `C:/Users/jcrow/l5r-character-sheet-creator`. **Never switch branches in that shared checkout** and never use the OneDrive clone of the repository. Work in the existing worktree `C:/Users/jcrow/l5r-release-15a-group5` on branch `claude/release-15a-a12` (or your own worktree and branch cut from it). Commit only the files named here. `python build.py --check-drift` at the worktree root must pass before each commit (`PYTHONUTF8=1`). No stash, no reset.
- The books are outside the repository: `%USERPROFILE%\OneDrive\Documents\L5R 4th edition books` (that folder is the documented source). They need poppler's `pdftotext` (ships with Git for Windows, `mingw64/bin`).

## The tool

In `Versions/Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/G5 — Undo and the Roll Preview/`:

```bash
python qa/resistance-rules-read/resistance_passages.py --list
```

```bash
python qa/resistance-rules-read/resistance_passages.py --batch 1 25
```

- It builds a **stable, numbered list of 823 passages** and prints them to the screen only (`#number page: text`; `p90` is a printed page, `pdf90` a PDF page where no offset is known). Do not change its passage rule or the numbers move.
- `--stem` keeps only passages containing "resist"; `--maxchars N` stops after about N characters and prints `NEXT #n`.

| Book | Passages |
|---|---|
| The Book of Air | #1–#33 |
| The Book of Earth | #34–#97 |
| The Book of Fire | #98–#136 |
| The Book of Water | #137–#170 |
| The Book of Void | #171–#211 |
| Emerald Empire | #212–#235 |
| Enemies of the Empire | #236–#359 |
| Imperial Histories 1 | #360–#426 |
| Imperial Histories 2 | #427–#478 |
| Naishou Province | #479–#485 |
| **Core Rulebook** | #486–#688 |
| Secrets of the Empire | #689–#720 |
| Strongholds of the Empire | #721–#735 |
| Sword and Fan | #736–#759 |
| The Great Clans | #760–#817 |
| Unexpected Allies 2 | #818–#823 |

## Done so far

**28 of 823 passages**, all in the Core Rulebook: 487, 488, 490, 491, 492, 500, 501, 502, 510, 516, 517, 524, 534, 538, 542, 546, 547, 548, 549, 553, 554, 555, 558, 560, 564, 566, 573, 574. Their findings are in `RESISTANCE-RULES-READ.md`. **Everything else is unread.** Suggested order: the rest of the Core Rulebook (#486–#688, skipping the 28), then #1–#485, then #689–#823.

## What to record

One row per rule that matters to a character sheet: the effect resisted; who has it (everyone, or the ability and its type: Advantage, Disadvantage, School Technique, Ancestor, Kata, Kiho, spell on oneself, item, Clan or family ability); the bonus or penalty; the conditions in our own words; **the roll the book names, or "none named"**; book and printed page; passage number; whether the sheet has it today (yes, no, or differs and how); and a proposed "add" (conditions are settled once the effect is chosen) or "ask" (only the player can judge).

Two examples from the work so far:

- Fear · everyone · Honour Rank added to the total · roll named: Willpower Trait Roll against TN 5 + 5 × the Fear Rank · Core p.90 · #500 · in the sheet: yes · add.
- Irreproachable (Advantage) · Temptation · +1k0 on a Contested Roll where the other side uses Temptation · roll named: none of its own · Core p.151 · #546 · in the sheet: yes · ask.

Do not list every creature or spell that merely forces a resistance roll; keep a count per effect and note any that name an unusual roll. Where a passage is cut short or a name is missing, open the page to confirm rather than guess. Rows already marked "confirm" need that too (the virtue Advantage on Core p.152, the two Taint Disadvantages on pp.156 and 158, the Mantis Technique's +5k0 on p.121, Jurojin's and Tengoku's figures on p.154, Temptation's own Skill entry).

## After the reading

1. **Recall check.** Read two whole chapters chosen without the keywords (one from the Core Rulebook, one from another book) and report how many resistance rules the passage list missed, and which word would have caught them.
2. **Compare with the sheet.** Its fifteen resistance choices are declared under `Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/src/sheet/`: `honour-resistance:resist` (`209.9999999999967-bugfix-honour-ui.js`); `situational-entries:` balance, clear-thinker, heartless, irreproachable (`209.9999994-feat-situational-entries.js`); `fortune-blessing:` jurojin, hotei (`209.9298-feat-adv-fortune-blessing.js`); `spirit-realms:` meido, tengoku (`209.92992-feat-adv-spirit-realms.js`); ancestors kaimetsu-provoked, moto-resist, yamatsu-resist, hitomi-resist, reichin-fear, reichin-bloodspeaker (`209.99998-feat-ancestors.js`). Also check Paragon (`209.9295-feat-adv-paragon.js`), Failure of Bushido's Honor bar (`honorBarred` in the situational-entries file, used by the Honour file) and `Versions/PART I — Phase 4.5 Sourcebook Audit of Advantages and Disadvantages/AUDIT.md`.
3. **Three lists** at the end of the report: rules in the books that the sheet lacks; places where the sheet and the books disagree; questions for the owner's ruling. Four questions are already listed in `RESISTANCE-RULES-READ.md`; keep them.

## Files to deliver (same G5 folder)

- `RESISTANCE-RULES-READ.md`: update it in place. Change the heading from "IN PROGRESS" when finished, keep the plain summary first, then the table, then the three lists.
- `resistance-rules.json`: the same rows as data (not yet created).
- The script stays where it is.

## Done means

All 823 passages read or deliberately set aside with a reason; every row has a book and printed page; nothing verbatim; the recall check reported honestly; the comparison with the fifteen choices complete; the open questions listed for the owner. Commit and push, and tell the owner the branch and commit, the number of rules found, the number the sheet lacks and the number of disagreements.
