# Feature 4 — diff vs the Feature 3 trunk

Trunk:   l5r-character-sheet part C feature 3 wounds.html
Feature: l5r-character-sheet part C feature 4 void.html

added lines:   352
removed lines: 7

## Every removed line
All are in recalcAll(), the P2 pipeline (not a frozen function), or a button handler.
No frozen function was touched.
```
advanceCombatRound(); recalcAll(); renderStanceTiles();
document.getElementById('f_currentTN').value = baseTN + armorTN + stanceTN;
formatRollNotation(reflexes+insightRank, reflexes) + (stanceInit ? ' +' + stanceInit : '');
if(norm.rolledDelta || norm.keptDelta || norm.totalDelta) out.push(norm);
(mods || []).forEach(m=>{ rolled += m.rolledDelta; kept += m.keptDelta; totalDelta += m.totalDelta; });
return { rolled, kept, totalDelta, applied: (mods || []).slice() };
: rollDicePool(adj.rolled, adj.kept, opts.explode);
```

## Change hunks
```
@@ -843,6 +843,42 @@
@@ -1516,6 +1552,26 @@
@@ -6103,11 +6159,12 @@
@@ -6877,14 +6934,19 @@
@@ -7661,8 +7723,11 @@
@@ -7672,10 +7737,14 @@
@@ -7684,9 +7753,12 @@
@@ -7696,6 +7768,10 @@
@@ -7738,6 +7814,257 @@
@@ -8621,6 +8948,14 @@
@@ -8660,6 +8995,16 @@
```
