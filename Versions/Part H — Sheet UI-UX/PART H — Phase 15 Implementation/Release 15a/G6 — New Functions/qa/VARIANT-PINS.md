# G6 (A19 revision 1, A20, A19.1) negative-variant pins — prepared before any run

19 November 2026 (Claude). Frozen candidate `921f3ac9e5c61bde84068a20dd5cc4ab014367e8b1b7930438cf24b4a7686150`, 17,718,601 bytes, on `claude/release-15a-a19-1` (A19 revision 1, then A20, then A19.1). Baseline: G5 (A08) as live, commit `1ebf26b4`, application `6d47849b1dcb5aa8ac4140b1895d1f0d713426092530e183ff87c3fc4d7c44b1`, 17,685,928 bytes. Every exact failed-check id is in `variants.json`.

**What is known and what is reasoned.** The three baselines are known from the light checks: A19's harness held 4 of its checks on A08 as live (the 22 before revision 1; the three added in revision 1 need A19's Undo and so fail there), A20's held 5 on A19, and A19.1's held 4 on the live app, with its Apply check since made independent of A19's line (before any qualification run: on a build with A19 removed and A19.1 kept, that check would otherwise have tested A19). **Every mutation's prediction is reasoned from the harnesses' oracles and the source, not taken from a variant run.**

6 mutations plus 3 baselines. Each mutation changes exactly one unique string in a scratch copy of the frozen page (`--dry-run`: all six unique). The discovery runs once; any correction is explained here before the qualification chain. No full-suite discovery, retries or widened assertions. Every unit's harness keeps its steps tolerant of the unit's absence, so no pin needs the pinned-stop form.

| Case | Mutation | Predicted failures |
|---|---|---:|
| A19:baseline (count known) | G5 (A08) as live | 21 |
| A20:baseline (count known) | G5 (A08) as live | 13 |
| A19.1:baseline (count known) | G5 (A08) as live | 4 |
| A19:disabled | `VOID_SPEND_UNDO_ENABLED = false` | 21 |
| A19:touch-save-ends | Touch of the Void's own save ends Undo again (`if(touchRolling > 0){` → `if(false){`) | 3 |
| A19:no-drop | Undo no longer drops a waiting Touch of the Void roll (`if(drop && …` → `if(false && …`) | 4 |
| A20:disabled | `SKILL_TRAIT_CHOICE_ENABLED = false` | 13 |
| A20:no-pool | the roll ignores the chosen Trait (`if(tc1534){ baseRolled` → `if(false){ baseRolled`) | 2 |
| A19.1:disabled | `DAMAGE_ROW_FIT_ENABLED = false` | 4 |

## Why each case fails where it does

- **A19 baseline and disabled** (no Undo line): every check that needs the line or its Undo fails. Hold: no line before a spend; no line for a roll preview's own Void spend; no page errors on either size.
- **A19 touch-save-ends**: only the three revision-1 checks: the save rolled on the phone (damage reduction) and on the laptop (+10 TN) ends Undo, and the check that a later roll ends it never sees Undo after the save. A cancelled save, as in the other checks, is not a roll and is unaffected.
- **A19 no-drop**: Undo still puts every value back and words its message from what was waiting, but Touch of the Void keeps owing the roll. Fail: Undo after +1k1 (one roll still owed), the next roll after it (Touch of the Void's roll opens after it), Undo after a cancelled preview (one still owed), and the latest-spend case (two owed, not one). Hold: every case where the roll had already opened before Undo (+10 TN, damage, Initiative, the saves), the double click, the keyboard and the save data, which read only the values and the line.
- **A20 baseline and disabled** (no drop-down): fail every check that opens, picks or reads the drop-down. Hold: the saved Trait unchanged; no drop-down on a Trait roll or an attack; no page errors on either size.
- **A20 no-pool**: the preview still shows the chosen Trait's dice, but the roll uses the usual one: the Willpower Intimidation roll reads 5k2 (not 7k4) and the Unskilled Stamina Athletics roll 3k3 (not 2k2).
- **A19.1 baseline and disabled** (the row as on the live app): on a phone the row is wider than the card, Apply wraps onto four lines and the buttons are not full width, and the seam is absent. Hold: Apply still works (the line, if any, is A19's), the laptop row is one line, Cancel works, and no page errors.

## Counts pinned before full QA

Candidate: G5's 7,401 + A19 25 + A20 18 + A19.1 9 = **7,453**; 205 leaves (`candidate-list.json`: the three units' harnesses, then G5's 202 in its order).
Retained, G6 removed (G5, A08, as live): A08 21 + G5's retained 7,307 = **7,328**; 200 leaves (`retained-list.json`: G5's 202 less the two live-site leaves, 5a's `sw-checks.js` and 5b's `notice-checks.js`, as every group since G1 has run its retained pass).
4× CPU screen: **170 leaves**: G5's 163 (its pattern, kept), the three units' harnesses, and four more that the added terms for the Void card, Touch of the Void and the roll preview pick up.

The group removal must restore G5 (A08) as live exactly, by the removal chain; A19 and A20 are each removed alone with the other units kept and the kept units' harnesses run in full; A08 (the unit before the group) is removed with the group kept and all three harnesses run in full on that build. No unit declares a conditional in another layer's tests. A19 and A20 change rolls and undo, so the group is behaviour tier: the 4× CPU screen and two full passes follow the chain.

## Discovery

Discovery ran once on 19 November 2026, after the predictions were committed and pushed (`30067683`). Evidence: `variants-discover.log` and `variants-discover-921f3ac9/summary.json`. **All 9 cases matched every predicted id exactly**, each with its pinned count: A19 baseline 4/25 and disabled 4/25, touch-save-ends 22/25, no-drop 21/25; A20 baseline 5/18 and disabled 5/18, no-pool 16/18; A19.1 baseline 5/9 and disabled 5/9. No correction was needed; the qualification chain asserts every pin as written.
