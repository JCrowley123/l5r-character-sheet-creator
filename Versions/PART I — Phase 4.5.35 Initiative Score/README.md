# Phase 4.5.35 — Initiative Score (Part I)

The owner's V4 note on the 9 October check: "I was expecting a part in combat to tell me my initiative score and then
if I click that button it changes my initiative score until I reset the combat." The sheet rolled Initiative but never
kept a score. Approved as recommended on 9 October, with one extension stated to the owner before building.

## What it does

- **The score** is the last Initiative roll's total (the total the roll window shows when it is closed, so re-kept or
  rerolled dice count), or a total the player types with **Set score** (many roll real dice).
- **Bonuses that change the score after the roll count:** Quick's +Reflexes each Round you did not act first (Core
  Rulebook p.152, Feature 4.5.33) and Void's +10 for the skirmish. **Center's +10** counts only in the Round after
  Center, as the sheet already applies it to rolls. Nothing counts twice: the score is the total, minus the Center,
  Void and Quick bonuses that total already held, plus those bonuses as they stand now, read through the roll pipeline.
  (The recommended model added only later Quick uses; the extension also follows a later Void +10 and Center's Round.)
- **Where:** a line under the Combat card's Initiative ("Initiative Score: 21", then "18 before bonuses, Quick +3"),
  with the Set score box; a line under Quick Access's Initiative ("Score 21"); and on Quick's row ("Your Initiative
  Score is 21."). Before any roll: "not set yet". **Reset rounds clears it.**
- **Kept** in the trunk's round ledger, in the Round it was set: 'Initiative' (the total) and, when not 0, 'Initiative
  bonuses' (what it held); the Round note shows them. Transient like the rest of the ledger; never saved.

## Implementation

`src/sheet/209.99999996-feat-initiative-score.js`: `IS4535` (logic, no DOM: `score()`, `entry()`, `rolled()`, `set()`,
`bonusesNow()`) and `IS4535UI` (the three lines; integration points marked `// UI hook:`). Marker `PART I FEATURE
4.5.35`, switch `INITIATIVE_SCORE_ENABLED`. `src/css/59.999982-feat-initiative-score.css` (own classes, `is4535-`; the
box is 16px so iOS does not zoom). One seam block. It wraps `rollWithModifiers` (records an Initiative roll), and
`refreshAllAdvConfigControls`, `renderCombatRoundUI` and `renderQuickAccessPanel` (redraws), and watches the roll window
close to follow re-kept dice.

## Verification

- **Own harness, `qa/initiative-score-harness.js`: 20/20** on the build (`8d3e899c…`); **2/15** on the build without it
  (`8a7d72fc…`). Every roll through the Initiative button and the preview's real controls, with fixed dice. Oracles: the
  total the roll window shows, the round ledger, and the book (Quick +Reflexes, Void +10, Center +10 in its Round).
  Checks: none before a roll; the roll's total recorded and shown on Combat, Quick Access and the Round note; re-kept
  dice followed; Reset clears; Quick adds, and adds up the next Round; a new roll that already holds Quick's uses is not
  counted twice; Void +10 after the roll; Center's +10 only in its Round; a typed total, then Quick on top; an empty box
  refused; the box at 16px; its own styles in force; the line fits at 320 and 390px; nothing saved; visible and usable in
  Play. Three runs in a row: 20/20 each.
- **Retained:** Phase 4.5.33's harness 44/44 and 4.5.34's 11/11 with this release present.
- **Nine pinned mutations** (`qa/variants.json`, `qa/expected-failures.json`): the release removed or switched off, no
  stylesheet, Quick counted twice (the bonuses a roll held not taken out), bonuses fixed at the roll (the plain model:
  Void after the roll and Center's Round both fail), re-kept dice ignored, a typed total refused, no Quick Access line, and
  Feature 4.5.33 switched off (only the Quick checks fail: the declared dependency, measured).
- **Ownership scan** clean. **Removal:** fixtures 22 pass, one Windows symlink skip; the live fixture restores
  `8a7d72fc…` (3,740,458 bytes) byte for byte and leaves 4.5.33's files untouched.
