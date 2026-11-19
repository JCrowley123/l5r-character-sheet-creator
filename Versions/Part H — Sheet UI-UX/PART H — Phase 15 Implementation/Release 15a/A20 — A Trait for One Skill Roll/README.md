# Release 15a · A20 — A Trait for One Skill Roll

Group G6 (new functions), unit 2 of 2. FT-28 (parked 10 October 2026 with the Skill Traits audit), included by Q7 on 1 November 2026; approved as mocked up on 19 November 2026 with the book-named Traits listed first ([the group's mock-ups](<../G6 — New Functions/MOCKUP.md>): "Book Traits first (Recommended)"). Built on 19 November 2026 (Claude), on branch `claude/release-15a-a20`, stacked on `claude/release-15a-a19`.

## What changes

- **The Trait line of a Skill roll's preview is a drop-down**, each Trait with its value. It covers rolls made from a Skill: trained, from its row, and Unskilled, from the untrained list. Not weapon attacks, Trait or Ring rolls, spells, the dice tray or the Full Defense roll.
- **It starts on the Skill's own Trait** as the sheet holds it, and lists, in order: the usual Trait; each Trait the books name for that Skill, under its page; every other Trait ("the GM's call, Core p.79"). Void is listed only for Iaijutsu (Focus, Core p.87).
- **A choice changes the dice** ((Trait + Skill Rank) keep Trait; Unskilled, Trait keep Trait, 10s still not exploding) and anything the sheet adds that depends on the Trait. The Skill Rank, the Emphasis re-roll, the Unskilled rule, Void offers, declarations and every other modifier stay; what is already ticked stays ticked, because the preview redraws in place. The roll uses the chosen pool.
- **A Trait that is not the usual one is outlined**, with a note under the line: "This roll only; Intimidation is usually Awareness." and, for a book-named Trait, its source in our own words, for example "Book of Earth p.9: the GM may allow Willpower for Intimidation."
- **Each opening starts on the usual Trait**; Cancel forgets the choice. Nothing is saved: the Skill's Trait in the character and the save file does not change, and no XP is worked out.

## The book-named Traits

From the Skill Traits audit (10 October 2026), the pages re-read on 19 November 2026 (temporary extracts, deleted; the 30 September ruling). Keyed by the Skill's name before any colon, so "Perform: Biwa" is Perform.

| Skill | Trait | Where |
|---|---|---|
| Athletics | Agility (throwing) | Core p.139 |
| Athletics | Stamina | Book of Earth p.8 |
| Meditation | Stamina (fasting) | Core p.137 |
| Etiquette | Willpower (Courtesy, resisting Intimidation or Temptation) | Core p.145; Book of Earth p.8 |
| Iaijutsu | Awareness (a duel's Assessment); Void (its Focus) | Core p.87 |
| Intimidation | Willpower | Book of Earth pp.8–9; Control: Core pp.121, 229 |
| Investigation | Intelligence (interrogation) | Core p.114 |
| Jiujutsu | Strength | Core p.88 |
| Animal Handling | Willpower | Book of Earth p.8 |
| Artisan, Craft | Stamina | Book of Earth p.8 |
| Perform, Stealth | Stamina | Book of Earth p.9 |

One page differs from the audit: Etiquette (Courtesy) with Willpower, resisting Intimidation, is on Core p.145 (the Intimidation entry runs on from p.144), where Temptation is resisted the same way.

## How it is built

- `src/sheet/209.9999999999999999991-feat-skill-trait-choice.js` — `TC15`, the switch `SKILL_TRAIT_CHOICE_ENABLED`, the table above, and `tc1534Decorate` and `tc1534Pool`. On a choice it changes the roll's own context (the Trait's name and value) and the preview's request (the pool), and remembers the chosen pool for that context; choosing the usual Trait again puts them back.
- Three owned hook blocks (see ROLLBACK.md): the preview's `render` reads its pool from the request; after each render the drop-down goes beside the first base row's label (the label keeps its words, hidden from view and from screen readers) and redraws the preview in place on a change; the roll pipeline rolls the chosen pool after the preview.
- `src/css/1148-skill-trait-choice.css` — the drop-down, its outline when changed, and the note.
- One guarded seam block, `skill-trait-choice-seam`.

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With A20 (this branch, on A19) | `8d6a0a0a23bdb583edbcaf94bb8fdc9dd5b1426ad0c4bc31ca8ee5e1be62a4eb` | 17,714,794 |
| A20 removed (A19) | `0ee228674c0110313e83d0a19e2b8800abd4fd2c376ca07f3e3d13d37ef25dc9` | 17,701,397 |

## Light checks (19 November)

| Check | Result |
|---|---|
| Own harness `qa/skill-trait-choice-harness.js` (17 checks pinned before the first run; one added after run 3, see the code review) | 18/18 on the final build (`qa/run-6-final-build.log`). Earlier runs, kept: run 1 16/17, the attack check never reached its button (the Combat page's Weapons section starts closed; `qa/run-1-weapons-closed.log`); run 2 16/17, the test character's weapon was a custom one with no attack roll, so no preview opened (`qa/run-2-custom-weapon.log`; the fixture now holds a library katana); run 3 17/17 on `549472b5…d7e0` (`qa/run-3-549472b5.log`); runs 4 and 5 18/18 on `340d8f60…3a77` (`qa/run-4-final-build-before-tolerant-pick.log`, `qa/run-5-340d8f60.log`). Same ids and expected values throughout. |
| Own harness on A19 (the unit absent) | 5/18: the five that hold either way (the saved Trait unchanged; no drop-down on a Trait roll or an attack; no page errors at either size). `qa/run-on-a19.log`; the first attempt stopped at the first pick (`qa/run-on-a19-stopped.log`), which is why the pick became tolerant. |
| `qa/test-removal.py` | 10/10 on the final build (`qa/removal.log`; also on `549472b5…` and `340d8f60…`, kept). The three hook blocks come out byte-exact. |
| `feature-dependencies.py` (G6 `qa/dependencies.py`) | every reference inside this unit's own blocks (`G6 — New Functions/qa/dependencies-a20.log`) |
| The harnesses of the layers it touches, from G5's candidate list (the roll pipeline, Smart Roll Preview, Explain This Roll, the preview's refund and its top, the declaration registry and its providers: Cursed by the Realm, Seven Fortunes' Curse and Bishamon, the situational entries and buttons, the automatic roll entries; the dice entries; the Rank 0 and Skill Traits fixes; the Advantage and Disadvantage configuration, Doubt, Unlucky, Dependant; Void Versatility, Seven Fortunes' Blessing, Dark Paragon, the Spirit Realms, Weakness; Honour; the negative-modifier display; the quiver; school Skill rows; Play Mode Skills; A03; A08) | 33/33 harnesses, 1,606/1,606 on the final build (`G6 — New Functions/qa/light/a20-touched-run.log`). The first run, on `340d8f60…3a77`, was 32/33, 1,604/1,606: Smart Roll Preview 48/50 read the Trait row's label, which then held the drop-down (`light/a20-touched-run-1-label-fault.log`; fixed, see the code review). |
| A19's harness on this build | 22/22 (`A19 — Undo the Last Void Spend/qa/run-on-a20-build.log`). |
| Preview `https://claude-release-15a-a20.l5r-character-sheet-creator.pages.dev/` (G6 `qa/verify-preview.py`) | The page, service worker, manifest and icons match the committed build byte for byte (page `b1ea4b77…`, 17,721,571 bytes, source `8d6a0a0a…`); on the deployed page A19's and A20's harnesses and the touched harnesses of both units, 52/52, 2,547/2,547. Result: `G6 — New Functions/qa/hosted-preview/claude-release-15a-a20/`. |

## Not covered by the harness

- A native iPhone and Safari: the drop-down opens the phone's own picker, which the harness cannot see; it chooses through the control itself. The device round should open the picker on a real phone.
- Every Skill in the table: the harness checks Intimidation (trained, with an Emphasis) and Athletics (Unskilled), whose groups and notes it pins word for word; the rest of the table is data read the same way.
