# Feature 8 — diff vs the Feature 7 trunk

Trunk:   `PART C — Feature 7 Dual-Wielding/l5r-character-sheet part C feature 7 dualwield.html` (10,229 lines)
Feature: `l5r-character-sheet part C feature 8 mirumoto.html` (10,445 lines, 1,191,524 chars,
sha256 `bfbbd19197c9fd81…`, md5 `42c8331f1b95f06c…`)

```
added lines:   217
removed lines:   1
```

The trunk is the **pristine** Feature 7 folder, not the stance-icon variant, so the feature
lineage stays clean. The icon artwork is a separate, optional step — see the note at the end.

## Every removed line

One line, and it was reformatted rather than deleted: the Armor TN sum gained a sixth term and no
longer fits on one line.

```
document.getElementById('f_currentTN').value = baseTN + armorTN + stanceTN + voidTN + dualTN;
```

becomes

```js
const mirumotoTN = (typeof getMirumotoArmorTNBonus === 'function') ? getMirumotoArmorTNBonus() : 0;
document.getElementById('f_currentTN').value =
  baseTN + armorTN + stanceTN + voidTN + dualTN + mirumotoTN;
```

Nothing else in the build was replaced. The other six edits are pure insertions.

## Anchors NOT touched

`rollDicePool`, `rollExplodingD10`, `rollExplodingD10At`, `rollWeaponDicePool`, `showRollResult`,
`applyTenDiceRule`, `updateRollKeepState`, Part B's damage arithmetic, every Feature 6 ammunition
function, every Feature 4 Void function, and Feature 7's `promptAttackHand`,
`performWeaponAttack`, `rollWeaponAttack`, `resolveWeaponContext`, `offHandPreRollModifiers` and
`getDualWieldArmorTNBonus`.

`collectData` and `applyData` were **not modified at all**. Feature 8 stores nothing, so there was
nothing to serialise: the School travels in the existing `f_schoolsData` field and the handedness
in Feature 7's existing `wp_hand`. `data.fields` still has exactly 42 entries.

Two Feature 7 functions did gain a guard clause — `getOffHandPenalty` and `getMainHandPenalty` —
because §4.1 requires both to return 0 under Way of the Dragon and there is no way to change a
function's return value without touching it. Each edit is a single early-return placed ahead of
the existing Technique and mastery checks, in the same shape those checks already return.

## The seven change hunks

```
@@ -5286,0  +5286,6   @@   getOffHandPenalty: the school waiver, checked first
@@ -7300,1  +7306,6   @@   recalcAll: the sixth Armor TN term
@@ -8203,0  +8214,181 @@   the Feature 8 block itself
@@ -8401,0  +8593,7   @@   getMainHandPenalty: the school waiver
@@ -8417,0  +8616,7   @@   (continuation of the same waiver edit)
@@ -8607,0  +8813,2   @@   handednessNoteBits: append the Mirumoto note lines
@@ -10131,0 +10339,8  @@   test seam exports
```

Plus the weapon-info-panel insertion, which the differ folded into the block above it.

## No regression assertion was changed

Feature 8 registers no pre-roll contributor, so the whole-registry snapshots that Features 6 and 7
each had to update (`F4-A3`, `F6-A15`) are untouched this time — `F8-E13` asserts the registry is
still exactly `range@20, arrow@25, stance@30, offhand@35, wounds@40, void@50`.

One harness file did change, and it is a robustness fix rather than an assertion change:
`l5r-P1-P2-F7-test-harness.js` answered each modal prompt after a single `await tick()`, which is
not a reliable way to know a modal has been painted — the run stalled twice, forever, awaiting a
click on a prompt that was not up yet. Its waits now poll for the condition (or for the attack
promise to settle, so the no-prompt path still falls straight through). Every assertion in that
suite is unchanged and all 147 of them pass. Details in `FEATURE-8-RESULTS.md`.

## Stance artwork

`patch_stance_icons.py` is included and retargeted to the Feature 8 filename, but has **not** been
applied to the shipped build — applying it would break the byte-for-byte reproducibility the brief
requires of the splice. To carry the artwork forward:

```bash
python splice_feature8.py
python patch_stance_icons.py
```
