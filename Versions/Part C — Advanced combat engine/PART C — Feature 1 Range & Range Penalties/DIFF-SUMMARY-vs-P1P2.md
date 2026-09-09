# Feature 1 — diff vs the P1/P2 trunk

Trunk:   PART C — P1 P2 PREREQUISITES/l5r-character-sheet part C P1-P2 prerequisites.html
Feature: l5r-character-sheet part C feature 1 range.html

added lines:   257
removed lines: 3

## Every removed line (all inside rollWeaponAttack, an orchestration wrapper)
```
function rollWeaponAttack(weaponRowOrKey){
// PART C P2 — routed through the pre-roll modifier pipeline (no-op while empty).
skillRank:ctx.skillRank, unskilled:atk.unskilled }),
```

## Change hunks
```
@@ -843,6 +843,34 @@
@@ -1568,6 +1596,20 @@
@@ -5504,7 +5546,11 @@
@@ -5516,10 +5562,24 @@
@@ -7515,6 +7575,197 @@
@@ -7872,6 +8123,9 @@
```
