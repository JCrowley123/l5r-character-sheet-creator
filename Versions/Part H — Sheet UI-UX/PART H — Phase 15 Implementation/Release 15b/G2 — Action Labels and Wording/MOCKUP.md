# Release 15b · G2 Action labels and wording: mock-ups and the owner's approval

23 November 2026 (Claude). The board, [mockups/G2-MOCKUPS.html](mockups/G2-MOCKUPS.html), was published to the owner as a private artifact (https://claude.ai/artifact/REUwrJoboaHe6xQBuGDDy2). It shows today beside the proposal for each unit, at phone and laptop size, with a recommendation and one decision for each. Every picture is the live build (`5ac767c6…574d`, `main` at `acdb6f75`, Release 15b group 1 live) in a test browser, with the proposal applied only in that browser. How the pictures were made: [REPRODUCTION.md](REPRODUCTION.md).

**Round 1, 24 November:** the owner approved all four units as recommended ([Round 1 answers](#round-1-answers)), then said "Build here". All four were built the same day on stacked branches ([Built](#built-24-november-2026)); the device round is next. Nothing is on `main`.

## Where the group comes from

- **Group and order:** approved on 20 November ([review note §6](<../../Release 15a/REVIEW-AFTER-15A.md>)): group 2 is B01, B03, B05 and B09.
- **The words:** Q8, accepted on 1 November ([rulings](<../../../PART H — Phase 15 UI Consistency Audit/PHASE-15-RULINGS-2026-11-01.md>)), settled B01's seven labels, "Lead an ally" and "You remain in control". They are not asked again.
- **The sheet-wide question:** the owner's note of 20 November (group 1, round 3): Phase 15 is a consistency pass, so a label changed in one place is a question for the whole sheet. For each unit the board looks for the same job elsewhere and asks whether it changes too.

## The units as proposed

All four are screen-only: labels, spoken names and one success line change, and no value, roll, cost, save, undo or focus does. Each would get its own folder under `Release 15b/`, with a switch, harness, remover, `test-removal.py` and a removal-chain entry after `B17 — One Row for Kharmic Tie`. Markers are given at build, from `PART H PHASE 15.2.6`. This folder holds the group's shared records only.

| Unit | Proposed |
|---|---|
| **B01 — Check Buttons Named for What They Do** (FT-11; Q8) | Brash "Resist insult (TN 25)", Overconfident "Measure the enemy (TN 20)", Can't Lie "Discretion check (TN 20)", Contrary "Cooperate" (after its TN box), Rumormonger "Resist gossip (TN 5 × Glory)" (after its Glory Rank box), Soft-Hearted "Resolve check (TN 20)", Lost Love "Steady yourself — Spend Void". The TN stays in each label, as Epilepsy's "Avoid (TN 15)" and Lord Moon's "Resist Lord Moon (TN 20)" already show it. Each spoken name starts with the label ("Resist insult (TN 25): Brash, Willpower roll when threatened or insulted"); today none contains the button's word. On a phone Soft-Hearted's switch moves under its button (30 → 58 px); every other row keeps its height. |
| **B03 — Lead an Ally** (FT-19; Q8) | Leadership's button "Lead an ally" (252 → 106 px), with "1k1 + 1 (School Rank)" beside it, the School Rank filled in. The sheet-wide part: Quick, the one other button on Feature 4.5.33 whose label is a condition and a formula, reads "Use" (B18 G06's word) with "+2 (Reflexes)" beside it. The notes, the after-use lines, the roll and once a Round stay. Rows keep their height (Quick's after-use row gets shorter). |
| **B05 — You Remain in Control** (FT-22; Q8) | Touch of the Void's success line "You remain in control." The sheet-wide part: Lord Moon's Curse, the one other check whose success means keeping control, reads "Willpower roll passed. You remain in control tonight." Failure lines, titles, TNs and dice stay. |
| **B09 — Skill Picker Traits from the Final List** (FT-29; Q1) | The Skills page's picker reads each Skill's Trait from the list as it stands after every layer, whenever it is drawn. Today only Intimidation changes ("Willpower" → "Awareness", matching the row it adds). All 44 options were checked against their rows. Labels only; independent of A20. |

## How the group meets B18 (one name per button job)

B18's inventory (branch `claude/jovial-rubin-993414`, `80236621`, not merged) has the owner's 14 questions open on https://claude.ai/artifact/CfJNQtsc9wsm5vpGP7NW76; its answer store was empty on 23 November. This group decides none of them.

| Label | B18 job | B18's suggestion | Depends on an open ruling? |
|---|---|---|---|
| The six check buttons (B01) | G11 Rolling the dice | Keep Roll, Cast and Check; its card says the B01 ruling settles these six | No |
| Lost Love's button (B01) | G07 Spending a Void Point | "Spend Void" | **Yes, G07.** With "Spend a Void Point" kept, the label is "Steady yourself — Spend a Void Point". |
| Leadership's button (B03) | G11 Rolling the dice | Named for what it rolls | No. The amount stays visible beside it, so no new i (G12). |
| Quick's button (B03) | Not in the inventory; nearest G06 Using an ability now | "Use" | **Yes, G06.** If G06 keeps each ability's own words, Quick takes a short name of its own (the board suggests "Act sooner"). |
| The success lines (B05) | Not a button | — | No |
| The Skills picker's options (B09) | G19 Choosing one thing from a list | As they are (not asked) | No |

**For B18's record (not decided here):**

- **G11 and Touch of the Void.** G11 recommends Touch of the Void's "Willpower (TN 30)" read "Check (TN 30)", "like the others". After B01 the others no longer say Check: Epilepsy says "Avoid (TN 15)", Lord Moon's Curse "Resist Lord Moon (TN 20)" (the owner's ruling of 29 October, BUGFIX MR7, that its button say what it is for), and B01 names the other six for what they do. Touch of the Void's "Willpower (TN 30)" and Cursed by the Realm (Toshigoku)'s "Check (TN …)" would be the only two left. G11's answer may want a name for what each does.
- **Three buttons the inventory missed:** Epilepsy's "Avoid (TN 15)" and "End seizure (TN 10)" (G11) and Quick's "Did not act first: +Reflexes" (G06).

## Recorded, not proposed

- **Three button looks on the Disadvantage cards:** small and outlined (`chk4531-btn`: Epilepsy and B01's seven), larger and outlined (`lm7-roll`: Lord Moon), filled dark (`vi4533-btn`: Touch of the Void, Leadership, Quick). Not a label; for a later unit.
- **A greyed-out button's reason is only in its tooltip.** Leadership's and Quick's "Start a combat round first." and "Already used this Round." are `title`s, which a phone does not show.

## The owner's answers on the board

The board asks four questions, one per unit:

1. **B01:** approve as shown (recommended), or revise.
2. **B03:** approve Leadership and Quick on one pattern (recommended), Leadership only, or revise.
3. **B05:** approve with Lord Moon's line too (recommended), Touch of the Void only, or revise.
4. **B09:** approve as shown (recommended), also name the subject Skills' range ("Perform (Agility or Awareness)", "Games (Agility, Awareness or Intelligence)", "Craft (GM sets it)"), or revise.

### Round 1 answers

24 November 2026, the owner, by the next-step button under the question "Approve group 2's four units as recommended?":

> Approve as recommended

How it is read:

1. **B01:** approved as shown. That means the seven labels with the TN kept, spoken names that start with the label, and Soft-Hearted's switch under its button on a phone.
2. **B03:** approved with Quick on the same pattern:
   - Leadership reads "Lead an ally", with "1k1 + School Rank" beside it.
   - Quick reads "Use", with "+Reflexes" beside it.
   - Both amounts are filled in from the character.
3. **B05:** approved with Lord Moon's line too:
   - Touch of the Void's success line: "You remain in control."
   - Lord Moon's Curse: "Willpower roll passed. You remain in control tonight."
4. **B09:** approved as shown. The picker takes its Traits from the corrected list. The subject Skills' range is not named.

- **Words waiting on B18.** B18's answer store was still empty on 24 November (checked at 11:41 UTC). The board said Lost Love's "Spend Void" and Quick's "Use" follow the G07 and G06 answers, and that if those answers come after the build, the two words change with B18's own build. So the build uses "Spend Void" and "Use" as shown, unless G07 or G06 has a different answer by the time the build starts.
- **What the approval covers.** On the board's terms it covers the build and preview stage only: each unit on its own stacked branch, with light checks and one code review. The device round, qualification and go-live each still need the owner's word.
- **Nothing is built yet.** The mock-up session's brief built nothing. Where the build runs is the owner's next call.

### The word to build

24 November 2026, the owner, by the next-step button under the question "Build group 2 in this session?":

> Build here

Read as: build the four units in this session, on stacked branches, through the build and preview stage (light checks, one code review, previews, the device-round checklist), and stop for the device round.

## Round 2 (24 November 2026): B01 and B03 revised

**The owner's word for round 2,** after the device round (DEVICE-CHECKS.md: every check Pass; B05 and B09 Accept, B01 and B03 Revise; nine comments). Asked whether to spend more time on this group or move to group 3, Claude recommended finishing with a narrow round 2. The owner answered, by the next-step button:

> Narrow round 2 first

**The board's version 3** (https://claude.ai/artifact/REUwrJoboaHe6xQBuGDDy2) has the round-2 section on top. Pictures are group 2 as built (`0d8cebb1…1637`) beside the proposal, drawn in a test browser at phone and laptop size, with no page errors (`qa/mockup/round2.cjs`, `qa/mockup/round2.json`).

- **B01, revised (comments 2, 5, 8):**
  - **Lord Moon's "Resist Lord Moon (TN 20)"** takes the check buttons' size: 20 px tall instead of A07's 44 px.
  - **Touch of the Void's button** loses its black fill and is renamed **"Keep control (TN 30)"**, to match its pass line "You remain in control.". Its spoken name: "Keep control (TN 30): Touch of the Void, Willpower roll after you spend a Void Point". This answers B18's G11 for this button. The alternative offered: "Resist the Void (TN 30)".
  - **The ten failure lines** lose their "Tell the GM …" sentence: seven on Feature 4.5.31 (Epilepsy's among them), Touch of the Void's, Toshigoku's, and Elemental Imbalance's message. Elemental Imbalance keeps "the GM decides what happens", because the rule leaves the outcome to the GM.
- **B03, revised (comment 3):** "Use" and "Lead an ally" take the outlined look of every other card button. The words and amounts are unchanged.
- **Parked:**
  - Lord Moon's tick, Great Potential's pill and how an entry shows its choice go to a unit of their own, from B18's inventory.
  - The combat notes go to the combat overhaul.
  - An invisible 44 px touch reach for every card button would be a sheet-wide change, so it isn't proposed now.

**The board's two questions:**
1. **B01, round 2:** approve as shown (recommended), or name Touch of the Void "Resist the Void (TN 30)", or revise.
2. **B03, round 2:** approve as shown (recommended), or revise.

### Round 2 answers

24 November 2026, the owner, by the next-step button under the question "Approve round 2 for B01 and B03 as shown?":

> Approve as shown

How it is read:
- **B01 round 2 is approved as shown:**
  - Lord Moon's and Touch of the Void's buttons take the check look;
  - Touch of the Void is named "Keep control (TN 30)", not the alternative;
  - the ten "Tell the GM" sentences go, with Elemental Imbalance worded as shown.
- **B03 round 2 is approved as shown:** Quick and Leadership are outlined.
- **Next, on the board's terms:**
  - rebuild B01 and B03, then restack B05 and B09 on them;
  - run the light checks;
  - the owner runs a short device round of the changes;
  - then the group of four goes to qualification.

## Built (24 November 2026)

Each unit has its own folder with README (build numbers, light checks), ROLLBACK, harness with pinned ids, remover and removal proof, and a `CHAIN` entry after B17.

| Unit | Marker | Tag / switch | Own checks | Branch (commit) |
|---|---|---|---:|---|
| B01 Check Buttons Named for What They Do | `PART H PHASE 15.2.6` | `CN15` / `CHECK_BUTTON_NAMES_ENABLED` | 15 | `claude/release-15b-b01` (`4ae54580`) |
| B03 Lead an Ally | `PART H PHASE 15.2.7` | `LA15` / `LEAD_AN_ALLY_ENABLED` | 13 | `claude/release-15b-b03` (`6c28167f`) |
| B05 You Remain in Control | `PART H PHASE 15.2.8` | `RC15` / `REMAIN_IN_CONTROL_ENABLED` | 10 | `claude/release-15b-b05` (`34142fa3`) |
| B09 Skill Picker Traits from the Final List | `PART H PHASE 15.2.9` | `SKP15` / `PICKER_TRAITS_FINAL_ENABLED` | 9 | `claude/release-15b-b09` (`66d825f2`; the tip) |

- **Group build:** `0d8cebb174c4c4130cfab0368bb0950793d93c01285310438f9e073bb4b81637`, 17,765,990 bytes. Removing the group restores `5ac767c6…574d` (group 1 as live) exactly, by the chain of removal proofs.
- **Light checks:** every unit's own harness, removal proof (10/10 each) and dependency check (4/4 for the group). The touched layers: B01 14/14 harnesses, B03 17/17, B05 49/49 and B09 27/27, all passing. The group's four harnesses pass on the group build and with all 26 Release 15a units removed (`509a17ee…e498`). The runs that failed first were the harnesses' own mistakes; each README records them.
- **Older harnesses that follow a switch:** Feature 4.5.31's suite harness and its dependency harness follow B01 (same ids and count; 101/101 with B01 and without). **Older removers that refuse while a unit is present:** Feature 4.5.31 (B01) and Feature 4.5.33 (B03); the reciprocal notes are in their ROLLBACKs.
- **Code review:** [qa/code-review.md](qa/code-review.md). One change, found by B09's removal proof: the tag `PT15` became `SKP15`.
- **Previews:** B01, B03 and B05 match their builds file for file (`qa/preview-b0*-files.log`). The tip (https://claude-release-15b-b09.l5r-character-sheet-creator.pages.dev/) matches its build file for file and passes **3,812/3,812** on the deployed files: 88 harnesses, the group's four plus every touched layer's (`qa/preview-b09.log`, `qa/hosted-preview/claude-release-15b-b09/`).
- **Device round:** [DEVICE-CHECKS.md](DEVICE-CHECKS.md), mirroring the Claude Doc https://claude.ai/artifact/Nphzgd9PYVFgZRPbLFPQmX.

### Round 2 built (24 November 2026)

B01 and B03 were rebuilt to the approved round 2, and B05 and B09 restacked on them, in one commit on the tip branch `claude/release-15b-b09`, as group 1 committed B17's fix on its tip. **The lower branches (`claude/release-15b-b01`, `-b03`, `-b05`) do not carry round 2**; their builds are round 1's. The intermediate builds below are made from the tip by removing later units (`qa/removed-build.py`).

- **B01** (`CN15`): Lord Moon's button at the check buttons' size (new stylesheet `src/css/1154-check-button-names.css`, under the body class `cn15-on`); Touch of the Void's button outlined and named "Keep control (TN 30)" (B01 now wraps `VI4533.lines`); the ten failure lines without "Tell the GM" (seven in `CHK4531.CHECKS` at install, Touch of the Void's and Toshigoku's through `rollWithModifiers`, Elemental Imbalance's through `appAlert`), each by its exact old words. Own checks 15 → 23 (`CN-R2-*`, pinned before their first run).
- **B03** (`LA15`): Quick's and Leadership's buttons take the class `ghost`. Own checks 13 → 15 (`LA-OUTLINED-*`, pinned before their first run).
- **B05:** unchanged; its harness was fixed to find Touch of the Void's button by its row and to check the failure line's first sentence only, so it no longer depends on B01 (same ids and count).
- **B09:** unchanged.

| Build | SHA-256 | Bytes |
|---|---|---|
| Group build (the tip, round 2) | `1f002be964b12ee91b7ed484b949946a859d84b84a7a7756bf7d9ed1841b5819` | 17,773,727 |
| B09 removed (B05 on B03) | `029595b6…8983` | 17,770,451 |
| B05 removed (B03 on B01) | `feac10a6…fc04` | 17,767,327 |
| B03 removed (B01 on group 1) | `9e245e2c…7a64` | 17,762,561 |
| B01 removed (group 1 as live, unchanged) | `5ac767c6…574d` | 17,750,809 |
| All 26 Release 15a units removed, group kept | `fd8fb7d0…8469` | 17,580,504 |

- **Restack:** `PRE_RELEASE_*` in B03's, B05's and B09's removers and the predecessor constants in their removal proofs name the round-2 builds. The manifest's `expect_sha256` is pinned to the group build.
- **Light checks, all first time:**
  - the group's own harnesses on the group build: B01 23/23, B03 15/15, B05 10/10, B09 9/9 (`qa/light/r2-own-on-group-1f002be9/`);
  - every removal proof 10/10 (`qa/removal-round2.log` in each unit) and the dependency check 4/4 (`qa/dependencies-round2.log`);
  - the touched layers, one union run on the group build (round 1's four patterns plus the moon and gates patterns): **85/85 harnesses, 3,806/3,806** (`qa/light/r2-touched-run.log`);
  - the three harnesses that follow B01 (Feature 4.5.31's, Feature 4.5.33's and A07's) on the build with B01 removed: 3/3, 171/171, same counts (`qa/light/r2-b01-removed-following-run.log`);
  - the group's four harnesses with 15a removed: 23/23, 15/15, 10/10, 9/9 (`qa/light/r2-own-on-15a-removed-fd8fb7d0/`).
- **Older harnesses that now follow B01** (same ids and count, declared in both ROLLBACKs): Feature 4.5.33's `void-initiative-harness.js` (Touch of the Void's words) and A07's `moon-row-harness.js` (the resist button's size). Checked and left alone, because they read neither the old words nor the size: the Moon Resist Label fix's, Feature 4.5.10's, Feature 4.5.2's (gates) and Feature 4.5.32's. **Older removers that refuse while B01 is present:** Feature 4.5.31's (as before) and now Feature 4.5.33's.
- **Tip preview** (https://claude-release-15b-b09.l5r-character-sheet-creator.pages.dev/, commit `91da9205`): the deployed page, service worker, manifest and icons match the committed round-2 build file for file, and **3,863/3,863** pass on the deployed files: 89 harnesses, the group's four plus the 85 touched layers (`qa/preview-b09-round2.log`, `qa/hosted-preview/claude-release-15b-b09/`). `qa/verify-preview.py` now also reads round 2's touched set (`qa/light/r2-touched/`).
- **Device round 2:** the checklist's "Round 2" section, in the same Claude Doc (its Result and Decision dropdowns left for the owner), mirrored in [DEVICE-CHECKS.md](DEVICE-CHECKS.md). **Not qualified; `main` untouched.** Qualification of the four comes after the owner's round-2 check, and only on their word.

### Round 2 device check (24 November 2026)

Every round-2 check passed on iPhone and laptop, and the owner chose **Accept** for B01 and B03 (the Claude Doc at revision 69; [DEVICE-CHECKS.md](DEVICE-CHECKS.md), "Round 2 results"). The owner's word, relayed by the kickoff session, verbatim:

> The checks passed and I have updated them. Please proceed

Read as: the group of four goes to qualification (screen-only tier). Go-live and the records on `main` need the owner's separate word.

## Qualified (24 November 2026)

The owner's word to proceed is recorded above ("Round 2 device check"). The group was qualified at the screen-only tier, every stage first time, on build `1f002be9…5819` (the tip `claude/release-15b-b09`). The details are in [HANDOVER.md](HANDOVER.md).

- **The chain** (19:27 to 19:30 UTC): group removal 30/30, restoring group 1 as live (`5ac767c6…574d`) exactly; each unit removed alone and B17 removed with the group kept, every kept harness in full; all 26 Release 15a units removed with the group kept; dependencies 4/4.
- **The full pass, run once** (19:30 to 20:26 UTC): candidate **7,562/7,562** on 213 leaves; retained (group 1 as live, less the two live-site leaves) **7,432/7,432** on 207 leaves; the restore exact. Both counts were pinned by arithmetic before the run. The brief's retained figure (7,505 on 209 leaves) counted the two live-site leaves, which no retained run includes.
- **No 4× CPU screen:** B09's MutationObserver callback is a microtask, which always completes before the next task, paint or input, so a slower CPU cannot reorder it (HANDOVER.md, "The tier question").
- **Not live.** Going live and the records on `main` wait for the owner's word.

## For the build (not decided by the owner; settle when the build starts)

- **B01.** The labels come from `CHK4531.build` (`209.9999998-feat-checks-conditions.js`); `decorateRow` rebuilds a row only when its `sig` changes, so the layer must relabel on build and on a switch-off/on. The spoken names are `aria-label`s set by `api.checkButton` (`spec.name + ': ' + spec.trait + ' Trait Roll ' + spec.why`). Lost Love's button is `api.button('Spend a Void Point', …)`. Take the word "Spend Void" from B18's G07 answer if it is in by then. Search every harness that pins "Check (TN", "Spend a Void Point" or the old spoken names (B18 found "Check" in 8 files and "Spend a Void Point" in 5, upper bounds). The resistance phase (pinned after Phase 15) will likely restyle these six; B01 sets their words.
- **B03.** The labels and notes come from `VI4533.lines` (`209.99999993-feat-void-initiative-entries.js`), called by `decorateRow`; the scratch wrapped `VI4533.lines` and inserted a `vi4533-note` span after the button. Quick's row also carries Feature 4.5.35's `.is4535-quick` note, appended by `ui.quickRow` (`209.99999996-feat-initiative-score.js`); a redraw by `VI4533.decorate()` alone drops it until the next `recalcAll`, so redraw through `recalcAll`. The amount must follow the School Rank and Reflexes when they change. Quick's word follows B18's G06 answer.
- **B05.** Touch of the Void's text is a literal in `VI4533.check`; Lord Moon's is a literal in `LM7.roll` (`209.99999999999997-bugfix-moon-curse.js`). The scratch rewrote `#rollResultNote` as drawn; the build should replace the `successText` at its source (wrap `VI4533.check`; for LM7 wrap `rollWithModifiers` for that title, or `LM7.roll`), because Dark Paragon, Luck, Unlucky and the Ancestor gifts copy `currentRollSuccessText` into a reroll.
- **B09.** `buildSkillQuickAdd` (`020-lib-skills-advantages.js`) writes the options once; BUGFIX SL7 (`209.9999999999990-bugfix-skill-list-ui.js`) captures their texts in `SL7.full` at start-up and redraws from them; the creation wizard reads the option values only (`CW1121.skillGroups`). The layer should relabel from `findSkill(value).trait` after SL7's capture and on each redraw, or correct `SL7.full`'s texts once. The comparison of all 44 options is a ready harness (`qa/mockup/repro.cjs`, `b09all`).
- **Counts:** candidate = the qualified group-1 total plus the group's new checks; retained, with the group removed, the group-1 candidate count. Removing the group must restore `5ac767c6…574d`, 17,750,809 bytes, exactly.

## Usage

Claude, Opus 5.5, Pro plan, account-wide meters: weekly all models 65% and five-hour 24% at the start (22:18 UTC, 23 November); 68% and 46% at 22:51 UTC, after the reproduction, the board and these records. The weekly meter resets on 25 November at 01:00 UTC.

Build (24 November): weekly 69% at the owner's "Build here" (11:44 UTC); 76% with five-hour 52% at 12:25 UTC, the group built, checked, previewed and its checklist made.

Round 1 (24 November): weekly 69% and five-hour 2% at 11:40 UTC. After the answer was recorded and the board republished as version 2 with the approval banner, the readings were 69% and 3% at 11:42 UTC.

Round 2 build (24 November): weekly 79% and five-hour 3% at the start (16:51 UTC); 83% and 36% at 17:42 UTC, with round 2 built, every light check run, the tip preview verified and the checklist's round-2 section added. The weekly meter resets on 25 November at 01:00 UTC.

Qualification (24 November): weekly 86% and five-hour 59% at the start (19:24 UTC); 87% and 69% at 20:27 UTC, after the chain and the full pass.
