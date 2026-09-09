# Feature 3 — diff vs the Feature 2 trunk

Trunk:   l5r-character-sheet part C feature 2 stances.html
Feature: l5r-character-sheet part C feature 3 wounds.html

added lines:   101
removed lines: 13

## Every removed line
All are showRollResult() CALL SITES being re-pointed at rollWithModifiers() so the
wound contributor can reach them. showRollResult itself is untouched.
```
showRollResult(`${ringName} Ring Roll`, rollDicePool(rank, rank));
showRollResult(`${traitName} Trait Roll`, rollDicePool(rank, rank));
showRollResult(label, rollDicePool(numDice, keepDice));
showRollResult(`${skillName} (Unskilled)`, rollDicePool(rank, rank, false));
showRollResult(
rollDicePool(ring + schoolRank, ring),
{ tn, successText:'Spell cast successfully.', failText:'Spell failed to cast.' }
showRollResult(
rollDicePool(ring + rankBonus, ring),
{
}
showRollResult('Full Defense — Defense / Reflexes', rollDicePool(numDice, keepDice), {
});
```

## Change hunks
```
@@ -4506,7 +4506,9 @@
@@ -4515,7 +4517,9 @@
@@ -5392,7 +5396,8 @@
@@ -6073,7 +6078,11 @@
@@ -6430,10 +6439,14 @@
@@ -6615,10 +6628,13 @@
@@ -6633,7 +6649,7 @@
@@ -7722,6 +7738,70 @@
@@ -7905,7 +7985,12 @@
@@ -7915,7 +8000,7 @@
@@ -8536,6 +8621,9 @@
```
