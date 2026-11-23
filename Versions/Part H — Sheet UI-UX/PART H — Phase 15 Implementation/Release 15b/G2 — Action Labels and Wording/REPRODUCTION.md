# Release 15b · G2 Action labels and wording: reproduction on group 1 as live

23 November 2026 (Claude).

- **Build.** Source SHA-256 `5ac767c6c3680126cfe664aef41e7312d98f24eee842ec679e38ed664dde574d`, 17,750,809 bytes: the live tree in the worktree `C:/Users/jcrow/l5r-release-15b-g2` on `claude/release-15b-g2` (`main` `acdb6f75`, Release 15b group 1 live).
- **Browser.** Chromium from the project's QA tools (`PLAYWRIGHT_BROWSERS_PATH=C:/Users/jcrow/l5r-qa-tools/ms-playwright`), at 390 × 844 touch (device scale 2) and 1440 × 1000, one browser job at a time, with the suite's two preloads (the navigation budget and the splash test switch).
- **Test characters.** The audit's dense Kuni Shugenja (`A03 …/qa/a03-fixtures.json`, `dense`), each with only the entries its finding needs, written by `qa/mockup/fixtures.cjs` and opened from the file.
- **Dice.** Where a roll is pictured, `Math.random` is fixed in the test browser: 0.85 gives every die a 9 (a pass), 0.05 a 1 (a failure), 0.65 a 7.
- **Status.** Scratch evidence, not qualification. Native Safari was not used. There were no page errors in any run (26 page-error lists, all empty).

## Scripts and results

The scripts are in `qa/mockup/`:

- `repro.cjs` runs through `run.sh`, which sets the QA environment and the two preloads. It uses `common.cjs` and `fixtures.cjs`.
- `proposals.cjs` draws each proposal in the page by wrapping the sheet's own drawing functions on the test seam (`CHK4531.build`, `VI4533.lines`), or, where the text is a literal inside a closure, by rewriting the drawn text as it appears (the roll result's success line, the Skills picker's options). No application file was edited.
- `board-template.html` and `embed.py` build the board, `mockups/G2-MOCKUPS.html`, with `--webp 85 --max-width 640:phone`. The phone pictures are scaled from 780 to 640 pixels wide.

Every value below is in `qa/mockup/reproduction.json`, from one run at 22:43 UTC. The 36 PNG captures and the test characters are in the session notes folder (`g2-15b-mockup-evidence/`), not in the repository.

## B01: the seven check buttons

Disadvantages Brash, Overconfident, Can't Lie, Contrary, Rumormonger, Soft-Hearted and Lost Love, as the dense character has them. Willpower 4, Perception 3, Honour Rank 4. Play and Manage.

**Today:**

| Card | Label | Spoken name | Width |
|---|---|---|---|
| Brash | Check (TN 25) | Brash: Willpower Trait Roll when threatened or insulted | 113 px |
| Overconfident | Check (TN 20) | Overconfident: Perception Trait Roll to see that a foe is clearly better than you | 113 px |
| Can't Lie | Check (TN 20) | Can’t Lie: Willpower Trait Roll when a lie is told in front of you | 113 px |
| Contrary | Check (after the TN box) | Contrary: Willpower Trait Roll when a dispute is going on | 62 px |
| Rumormonger | Check (TN 5 × Glory) (after the Glory Rank box) | Rumormonger: Willpower Trait Roll to keep a rumor to yourself | 168 px |
| Soft-Hearted | Check (TN 20) | Soft-Hearted: Willpower Trait Roll to kill | 113 px |
| Lost Love | Spend a Void Point | Lost Love: spend a Void Point to set the memory aside | 154 px |

The style sheet draws the labels in capitals. No spoken name contains its button's visible word.

**Proposed** (Q8's words; the TN kept in the label; the spoken name starts with the label):

| Card | Label | Spoken name | Width |
|---|---|---|---|
| Brash | Resist insult (TN 25) | Resist insult (TN 25): Brash, Willpower roll when threatened or insulted | 164 px |
| Overconfident | Measure the enemy (TN 20) | Measure the enemy (TN 20): Overconfident, Perception roll to see that a foe is clearly better than you | 208 px |
| Can't Lie | Discretion check (TN 20) | Discretion check (TN 20): Can’t Lie, Willpower roll when a lie is told in front of you | 196 px |
| Contrary | Cooperate | Cooperate: Contrary, Willpower roll when a dispute is going on | 96 px |
| Rumormonger | Resist gossip (TN 5 × Glory) | Resist gossip (TN 5 × Glory): Rumormonger, Willpower roll to keep a rumor to yourself | 221 px |
| Soft-Hearted | Resolve check (TN 20) | Resolve check (TN 20): Soft-Hearted, Willpower roll to kill | 174 px |
| Lost Love | Steady yourself — Spend Void | Steady yourself — Spend Void: Lost Love, a Void Point sets the memory aside | 235 px |

**Row heights** (the check line under each card's name), Play and Manage the same:

| Card | Phone | Laptop |
|---|---|---|
| Brash, Overconfident, Can't Lie | 20 → 20 px | 20 → 20 px |
| Contrary | 41 → 41 px | 41 → 41 px |
| Rumormonger | 69 → 69 px | 41 → 41 px |
| Soft-Hearted | 30 → 58 px (the Wracked with guilt switch moves under the button) | 30 → 30 px |
| Lost Love | 84 → 84 px | 56 → 56 px |

**The result window,** Brash with the dice fixed at 9s: "Brash — Willpower vs TN 25" and "You keep your temper.", today and proposed.

**The siblings,** today only (`b01sib`: Epilepsy, Lord Moon's Curse at Medium, Touch of the Void):

- Epilepsy: "Avoid (TN 15)", "End seizure (TN 10)" (spoken "Epilepsy: Willpower Trait Roll to avoid a seizure" / "… to end a seizure").
- Lord Moon's Curse: "Resist Lord Moon (TN 20)" (BUGFIX MR7, the owner's ruling of 29 October).
- Touch of the Void: "Willpower (TN 30)", with no spoken name of its own.
- The three draw their buttons three ways: `ghost chk4531-btn` (small, outlined), `ghost lm7-roll` (larger, outlined) and `vi4533-btn` (filled dark, as Leadership and Quick).

## B03: Leadership and Quick

Leadership as the dense character has it (School Rank 1) and Quick (cost 6; Reflexes 2). Play, with a combat round started through the test seam (`setCombatActive(true)`), so the buttons can be used. Lead an ally rolled with the dice fixed at 7: 7 + School Rank 1 = 8.

| | Today | Proposed |
|---|---|---|
| Leadership's button | "Lead an ally (School Rank + 1k1)", 252 px, no spoken name of its own | "Lead an ally", 106 px, then "1k1 + 1 (School Rank)"; spoken "Lead an ally: roll 1k1 + 1 (School Rank) for one ally’s Initiative Score" |
| Quick's button | "Did not act first: +Reflexes", 220 px, no spoken name of its own | "Use", 44 px, then "+2 (Reflexes)"; spoken "Use Quick: add 2 (Reflexes) to your Initiative Score for the rest of the skirmish" |
| Leadership's note | "Once a Round, in the Reactions Stage: one ally adds the total until the next Reactions Stage." | Unchanged |
| Quick's notes | "Each Round you did not act first, in the Reactions Stage." and "No Initiative Score yet (Combat card)." | Unchanged |
| After use | "This Round: 8 to one ally’s Initiative Score." and "Initiative Score +2 this skirmish." | Unchanged |
| The roll window | "Leadership — 1k1 + School Rank 1, for one ally", 8 | Unchanged |
| Outside a combat round | Both greyed out; title "Start a combat round first." | Unchanged |

**Row heights:**

| | Phone | Laptop |
|---|---|---|
| Leadership, before use | 64 → 64 px | 46 → 46 px |
| Quick, before use | 73 → 73 px | 48 → 48 px |
| Leadership, after use | 46 → 46 px | 20 → 20 px |
| Quick, after use | 73 → 48 px | 48 → 20 px |

Manage shows the same line (measured, not pictured).

A first scratch version put the formula into the note under the button; that made Leadership's line one line taller on a phone (64 → 82 px), so the amount went beside the button instead and the notes were left as they are.

## B05: the success lines

Touch of the Void alone (cost 3, the book value), and Lord Moon's Curse at Medium (TN 20) on its own character. Willpower 4. Play. Each roll made from the card's button, with the dice fixed at 9s (36, a pass) and then at 1s (4, a failure).

| | Today | Proposed |
|---|---|---|
| Touch of the Void, title | "Touch of the Void — Willpower vs TN 30", 4k4 | Unchanged |
| Touch of the Void, pass | "You keep your head." | "You remain in control." |
| Touch of the Void, fail | "You are Dazed for one Round. Tell the GM: the sheet does not track Dazed." | Unchanged |
| Lord Moon's Curse, title | "Lord Moon’s Curse — Willpower vs TN 20", 4k4 | Unchanged |
| Lord Moon's Curse, pass | "Willpower roll passed. You keep control tonight." | "Willpower roll passed. You remain in control tonight." |
| Lord Moon's Curse, fail | "Willpower roll failed." | Unchanged |

The other success lines on the sheet (read from the source, `successText` and `CHK4531.CHECKS`): Brash "You keep your temper."; Can't Lie "You let the lie stand."; Contrary "You hold your tongue."; Overconfident "You see the danger and may back off."; Rumormonger "You keep it to yourself."; Soft-Hearted "You can do it. Afterwards, turn on “Wracked with guilt”: every TN is 10 higher for a day."; Epilepsy "No seizure." / "The seizure ends."; Cursed by the Realm (Toshigoku) "You master the urge and hold back."; the Disadvantage Willpower gates (Feature 4.523) "Willpower check passed."; Check Taint growth "Taint does not grow."; casting "Spell cast successfully."; any other roll with a TN "Success.".

## B09: the Skills picker

The dense character without its Intimidation row (`b09`), and the same character with no Skill rows (`b09all`). Manage, Skills page.

- **Why:** `#skillQuickAdd` is written once by `buildSkillQuickAdd` (`020-lib-skills-advantages.js`) as "Name (Trait)". BUGFIX SKILLTRAITS (`209.999999994-bugfix-skill-traits.js`) later sets `SKILL_LIBRARY`'s Intimidation to Awareness, and BUGFIX SL7 keeps redrawing the picker from the option texts it captured at start-up. So the option keeps "(Willpower)".
- **Every option against its row:** each option chosen through the picker's own change event, the new row's Trait read, and the row removed again. `b09all`: 44 options, 43 match; Intimidation's option says Willpower and its row Awareness. `b09`: 41 options, the same single mismatch. Proposed: 44 of 44 and 41 of 41 match.
- **Elsewhere:** the catalogue (`findSkill`), Search's Skill record (field Trait and tags) and the Untrained Skills list (`data-trait-name` and its title "Unskilled Roll — Awareness (10s do not explode)") all say Awareness. The Skill's i window reads the row's Trait.
- **The subject Skills:** Perform, Games and Craft are offered as "(Awareness)" and added as Awareness. Named: Perform: Biwa → Agility, Perform: Song → Awareness, Games: Go → Intelligence, Games: Kemari → Agility, Games: Letters → Awareness, Craft: Bowyer → Awareness with the note "Trait varies by craft; the GM sets it (Core Rulebook p.143)." The picker already shows a range for Sailing: "Sailing (Agility or Intelligence)".
- **The pictures:** the picker is drawn open (`size = 12`) with Intimidation highlighted without choosing it, because a native picker cannot be photographed. Then (today only) Intimidation is added through the picker: the row's Trait is Awareness.

## Book pages

None were extracted, and no book text was used. Every page reference is the one the sheet already records:

| Entry | Page | Recorded in |
|---|---|---|
| Brash, Can't Lie | Core p.157 | Feature 4.5.31 |
| Contrary | Core p.158 | Feature 4.5.31 |
| Epilepsy | Core p.159 | Feature 4.5.31 |
| Lost Love | Core p.160 | Feature 4.5.31 |
| Overconfident, Rumormonger | Core p.161 | Feature 4.5.31 |
| Soft-Hearted | Core p.162 | Feature 4.5.31 |
| Leadership | Core p.151 | Feature 4.5.33 |
| Quick | Core p.152 | Feature 4.5.33 |
| Touch of the Void | Core p.162 | Feature 4.5.33 |
| Lord Moon's Curse | Core p.160 | BUGFIX LM7 |
| Skill Traits (Intimidation, Perform, Games) | Core pp.136–137, 143–144 | BUGFIX SKILLTRAITS |
| Craft | Core p.143 | BUGFIX SKILLTRAITS |
