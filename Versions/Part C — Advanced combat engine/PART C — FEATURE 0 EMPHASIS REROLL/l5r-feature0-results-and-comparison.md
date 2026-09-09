# PART C — Feature 0: Emphasis Re-roll — Results & A/B Comparison

**Builds**
- Version A — `l5r-character-sheet part C feature 0 VERSION A unconditional.html` (1,031,133 bytes)
- Version B — `l5r-character-sheet part C feature 0 VERSION B require-selection.html` (1,031,132 bytes)
- Baseline — `Versions/PART B —CORE WEAPONS SYSTEM/l5r-character-sheet part B complete.html` (unmodified)

**Headline:** both versions pass **72/72** Feature 0 assertions and **127/127** Part B assertions.
Versions A and B differ by **exactly one line**. Neither build removes or alters a single line
of Part A or Part B.

---

## 1. Preservation proof

`diff` of Part B → Version A:

```
added:   379 lines
removed:   0 lines
```

**Zero removed lines** is the strongest available proof of the freeze: no pre-existing line was
changed, only new lines inserted at 6 points (CSS, hidden flag, JS block, two decorator hooks,
QA seam).

Byte-identical hash check on the frozen functions across all three builds:

| Function | Identical in A and B |
|---|---|
| `rollDicePool` | yes |
| `rollExplodingD10` | yes |
| `showRollResult` | yes |
| `collectData` | yes |
| `applyData` | yes |
| `applyTenDiceRule` | yes |
| `updateRollKeepState` | yes |
| `rollExplodingD10At`, `rollWeaponDicePool` | yes |
| `getWeaponAttackDice`, `getWeaponDamageDice` | yes |
| `makeWeaponRow`, `refreshWeaponRow`, `findWeapon` | yes |
| `makeSkillRow`, `getEmphValues`, `relevantEmphOptions` | yes |
| `maxEmphasesForRank`, `skillCost` | yes |
| `rollNotation`, `performSpellCastRoll` | yes |

> Note: an initial automated extractor flagged `applyTenDiceRule` as changed. That was a bug in
> the extractor — it treated the apostrophe in the comment "there's genuinely no room left" as a
> string delimiter. Direct byte-comparison of the region returns the same hash (`5ccc00902b1c7658`)
> in all three builds, and the whole-file `diff` shows zero removed lines.

**Save/load:** `collectData()` output for an identical fixture character is the *same 3,085-character
string* in Part B, Version A and Version B. 42 `f_`-prefixed ids in all three; **no new ones**.

---

## 2. The one deliberate deviation from the brief

Step 4 specified `<input type="hidden" id="f_emphasisRerollUsed" value="0">`.

I implemented it as **`id="emphasisRerollUsed"`** — without the `f_` prefix — because
`collectData()` serialises *every* `[id^="f_"]` element:

```js
document.querySelectorAll('[id^="f_"]').forEach(el=>{ data.fields[el.id]=el.value; });
```

An `f_`-prefixed id would therefore have added a 43rd key to every save file, directly breaking
Step 7 ("no new fields") and the harness assertion "save/load byte-identical". Since `collectData`
is frozen, renaming the input was the only way to satisfy both. Behaviour is unchanged; the flag
is still a hidden input read/written through the DOM, per the DOM-as-model rule.

Asserted by **R12b** (no `emphasisReroll` key in `fields`) and **R12c** (field count still 42).

---

## 3. Validation Test Suite results

| § | Area | Version A | Version B |
|---|---|---:|---:|
| A | Match strategy & library audit | 12/12 | 12/12 |
| B | Pure re-roll engine | 14/14 | 14/14 |
| C | Once-per-roll enforcement | 6/6 | 6/6 |
| D | Decorator & UI mode | 16/16 | 16/16 |
| E | Scope (negative tests) | 8/8 | 8/8 |
| F | Integration | 4/4 | 4/4 |
| G | Version-specific behaviour | 3/3 | 4/4 |
| R | Regression | 9/9 | 8/8 |
| | **Total** | **72/72** | **72/72** |

### The RAW worked example reproduces exactly

Kenjutsu (Katana) 3, Agility 2 → 5k2, dice `1, 1, 4, 6, 8`. Re-rolling both 1s with a seeded RNG
yields `1` and `7`:

```
final dice: 1, 7*, 4, 6, 8*      (* = kept)
modal total: 15
```

Matching the rulebook's "he would then presumably keep the 7 and the 8, for a total of 15",
including that the re-rolled `1` **stands** and is not re-rolled again (B3), and that the second
re-roll is refused (C3).

### Library audit — reproduced in both builds

`emphasisLibraryAudit()` returns **40 exact / 2 baseName / 4 unmatched / 2 no-list**, exactly as
specified. The 4 unmatched (Nunchaku, both Nageteppo, Unarmed) are rules-correct: no such
Emphasis exists.

### Scope negatives (all confirmed absent)

| Roll type | Bar attached |
|---|---|
| Skill Roll (ranked, emphasis owned) | **yes** |
| Weapon Attack Roll | **yes** |
| Weapon Damage Roll | no (E2) |
| Spell Casting Roll | no (E3) |
| Manual Dice Tray | no (E4) |
| Unskilled Roll, Rank 0 | no (E5) |
| Ranked but no Emphasis owned | no (E6) |

---

## 4. Regression Matrix results

All 17 Part B regression checks re-run, plus R18–R21.

| # | Check | Result |
|---|---|---|
| 1–3 | `rollDicePool` / `showRollResult` / `applyTenDiceRule` frozen | PASS — byte-identical |
| 4 | Ten Dice Rule on weapon rolls | PASS |
| 5 | Click-to-keep still works outside re-roll mode | PASS (D14) |
| 6 | Spell Casting TN readout | PASS (E3, F2) |
| 7–8 | Skill / attack roll hooks | PASS (D1, E1) |
| 9 | Damage rolls stay re-roll free | PASS (E2, F4) |
| 10–11 | Emphasis widgets, caps and XP untouched | PASS (R6) |
| 12 | `collectData()` shape | PASS (R12, R12b, R12c) |
| 13–14 | `applyData` / old saves | PASS (R14) |
| 15 | `recalcAll()` still refreshes weapon rows | PASS (R15) |
| 16 | **Part B harness 127/127** | PASS in both builds |
| 17 | Single `<script>` block | PASS |
| **R18** | Switching A↔B does not alter save/load | **PASS** — identical 3,085-char signature across Part B, A and B |
| **R19** | Switching modes does not alter Part B behaviour | **PASS** — damage/mastery and row-derived signatures identical |
| **R20** | Switching modes does not alter attack rolls | **PASS** — attack dice signature identical |
| **R21** | Ten Dice Rule arithmetic identical | **PASS** — `12k12→10k10+8 \| 13k4→10k5+0 \| 11k3→10k3+0 \| 6k3→6k3+0 \| 10k10→10k10+0 \| 15k2→10k4+0` |
| **GC0** | Part B build genuinely has no Feature 0 (control) | **PASS** |
| **GC1** | Identical dice outcomes in A and B for the same Emphasis | **PASS** |
| **GC2** | The only difference is the mode flag | **PASS** |

---

## 5. Automated Test Harness

Three files, all runnable from the browser console:

| File | Purpose |
|---|---|
| `l5r-feature0-test-harness.js` | 72 Feature 0 assertions; self-detects A vs B |
| `l5r-partB-test-harness.js` | The unchanged 127-assertion Part B suite, re-run as the isolation gate |
| `l5r-feature0-crossversion-signature.js` | Deterministic fingerprint for R18–R21 / GC1–GC2 |

Serve the folder and run:

```bash
python -m http.server 8799
```

Then in the console on each build:

```js
fetch('/l5r-feature0-test-harness.js').then(r=>r.text()).then(s=>(0,eval)(s))
```

Exit condition is `failed === 0` in both builds, `127/127` on the Part B suite in both, and
identical signatures across Part B / A / B.

---

## 6. Version A vs Version B — comparison

Identical in every respect except the generic Skill Roll entry step.

| Aspect | Version A (Unconditional) | Version B (Require Selection) |
|---|---|---|
| Source difference | `const EMPHASIS_REQUIRE_SELECTION = false;` | `... = true;` (1 line) |
| Generic Skill Roll | Control active immediately | Dropdown first; control unlocks after a pick |
| Control label | `Emphasis (Katana, Wakizashi)` — all owned listed | `Emphasis (Katana)` — narrows once picked |
| Clicks to re-roll | 2 (Re-roll 1s → Re-roll selected) | 3 (pick → Re-roll 1s → Re-roll selected) |
| Weapon Attack Roll | Auto-matched, no dropdown | **Identical** — auto-matched, no dropdown |
| Audit trail | Which Emphasis was claimed is not recorded | Player explicitly names it |
| Dice outcomes | — | **Identical** (GC1) |
| Save format | — | **Identical** (R18) |

### Observed Version B flow

```
1. Emphasis (Katana, Wakizashi) | [— which Emphasis applies? —] | RE-ROLL 1S (disabled)
                                 "Select which Emphasis applies to this roll."
2. Emphasis (Katana)            | [Katana]                      | RE-ROLL 1S (enabled)
                                 "2 dice showing 1."
3. Emphasis (Katana)            | "Click the dice showing 1... Selected 0 of 2." | RE-ROLL SELECTED | CANCEL
4. Emphasis (Katana)            | "...Selected 2 of 2."                          | RE-ROLL SELECTED | CANCEL
5. Emphasis (Katana)            | "Emphasis re-roll used — once per roll."
```

Version A is identical from step 3 onward; it simply starts there.

### Recommendation

**Version A** for most tables. The sheet cannot know whether an Emphasis "applies to the
situation" — that is a GM/player call at the table — and Version A puts the judgement where it
already lives while naming the owned Emphases as a reminder. The extra click in Version B buys an
audit trail that nothing in the sheet currently consumes.

**Version B** is the better choice if you want players to commit to a specific Emphasis out loud
(useful for a GM adjudicating whether Katana really applies to that improvised parry), or if you
later want to log which Emphasis was invoked.

Because the difference is one boolean, switching is a one-line edit — and R18/R19/R20 prove
switching cannot disturb saves, Part B behaviour, or attack rolls.

---

## 7. Rollback

| Level | Action | Effect |
|---|---|---|
| Full | Return to `PART B —CORE WEAPONS SYSTEM/l5r-character-sheet part B complete.html` | Complete revert; saves are already format-identical, so nothing to migrate |
| Feature-off | Make `attachEmphasisReroll()` `return null;` on its first line | Control never appears; all rolls behave exactly as Part B |
| Mode switch | Flip `EMPHASIS_REQUIRE_SELECTION` | Converts A ↔ B in place |
| Hook-off | Delete the two `attachEmphasisReroll(...)` call lines | Removes the feature from both roll paths, leaves the code inert |

No save migration is ever required in either direction: Feature 0 persists nothing.
