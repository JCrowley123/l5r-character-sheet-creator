# Feature 2 — diff vs the Feature 1 + schoolfree-fix trunk

Trunk:   BUGFIX — School Skill Free Rank on Reload/l5r-character-sheet part C feature 1 + schoolfree fix.html
Feature: l5r-character-sheet part C feature 2 stances.html

added lines:   378
removed lines: 5

## Every removed line
All are in recalcAll() or button handlers - none is a frozen function.
```
advanceCombatRound(); setStatus('Round ' + getCombatRound() + '.');
resetCombatRound(); setStatus('Combat rounds reset.');
document.getElementById('f_currentTN').value = baseTN + armorTN;
document.getElementById('f_initiative').value = formatRollNotation(reflexes+insightRank, reflexes);
showRollResult('Initiative', rollDicePool(reflexes+insightRank, reflexes));
```

## Change hunks
```
@@ -843,6 +843,47 @@
@@ -1464,6 +1505,17 @@
@@ -1596,6 +1648,20 @@
@@ -5622,6 +5688,14 @@
@@ -5639,6 +5713,10 @@
@@ -6016,10 +6094,12 @@
@@ -6777,11 +6857,18 @@
@@ -6807,7 +6894,9 @@
@@ -7633,6 +7722,272 @@
@@ -8181,6 +8536,13 @@
@@ -8208,6 +8570,17 @@
```
