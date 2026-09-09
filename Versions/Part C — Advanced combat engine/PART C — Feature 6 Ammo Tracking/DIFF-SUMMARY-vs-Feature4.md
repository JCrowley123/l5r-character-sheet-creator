# Feature 6 — diff vs the Feature 4 trunk

Trunk:   `l5r-character-sheet part C feature 4 void.html` (9,023 lines)
Feature: `l5r-character-sheet part C feature 6 ammo.html` (9,648 lines, 1,145,365 chars,
sha256 `426255d02bb8e316…`)

```
added lines:   642
removed lines:  17
```

Feature 5 does not appear anywhere in this build. The trunk is Feature 4, and nothing in the
splice references a Feature 5 anchor, symbol, or library.

## Every removed line

All 17 are in `ARROW_LIBRARY` (rewritten in place with the same DR values), the P2 normaliser
(my own prerequisite, not a frozen function), or a call site being given one extra argument.
No frozen function was touched.

```
// Part C's Ammo Tracking feature will let a row select and consume a specific arrow type;
// until then getWeaponDamageDice() uses DEFAULT_ARROW (the standard Willow Leaf).
{name:'Willow Leaf', damage:{roll:2,keep:2}, notes:'Standard arrow.'},
{name:'Armor Piercing', damage:{roll:1,keep:1}, notes:'Ignores the Armor TN bonus provided by armor.'},
{name:'Flesh Cutter', damage:{roll:2,keep:3}, notes:'Double the Armor TN bonus provided by armor; 1/2 range.'},
{name:'Humming Bulb', damage:{roll:0,keep:1}, notes:'Makes a loud whistling sound.'},
{name:'Rope Cutter', damage:{roll:1,keep:1}, notes:'2 Free Raises for Called Shots against inanimate objects; 1/2 range.'},
const dmg = getWeaponDamageDice(entry, skillRank);
const dmg = getWeaponDamageDice(entry, skillRank);
<td><input type="text" class="eq-name" value="${escAttr(data.name||'')}"></td>
arrow: null, manualAttack:false, manualDamage:false,
arrow: null, // Part C (Ammo Tracking) will read the row's selected arrow here.
skillRank:ctx.skillRank, unskilled:atk.unskilled, range:rangeDecision }),
rolledDelta: parseInt(mod.rolledDelta, 10) || 0,
keptDelta: parseInt(mod.keptDelta, 10) || 0,
totalDelta: parseInt(mod.totalDelta, 10) || 0,
if(norm.rolledDelta || norm.keptDelta || norm.totalDelta || norm.explodeOverride !== undefined) out.push(norm);
```

Line by line:

| Removed | Why |
|---|---|
| 2 comment lines + 5 `ARROW_LIBRARY` rows | Rewritten in place to add `key`, `cost`, `special`. **Every printed DR is byte-identical**, which is why Part B's bow suite is unaffected. |
| `const dmg = getWeaponDamageDice(entry, skillRank);` ×2 | `refreshWeaponRow` and `showWeaponInfoModal` now pass `{ arrow: getRowArrowType(tr) }`. With no arrow loaded this resolves to `DEFAULT_ARROW` — the same value as before. |
| the `.eq-name` `<td>` | Wrapped in `.eq-name-row` so the arrow icon has somewhere to sit. The input keeps its class, so `collectData`, `hasSpellScroll` and `revertSchoolApplied` are untouched. |
| two `arrow: null` lines in `resolveWeaponContext` | Both were placeholders left by Part B for exactly this feature. |
| the `makeRollContext(ATTACK, …)` line | One extra key, `arrow: arrowChoice`. |
| 4 lines of the P2 normaliser | Gained the `informational` / `display` channel. |

## Anchors NOT touched

`rollDicePool`, `rollExplodingD10`, `rollExplodingD10At`, `rollWeaponDicePool`, `showRollResult`,
`applyTenDiceRule`, `updateRollKeepState`, Part B's damage arithmetic, Void automation, stance
automation, wound automation, range automation, and every Feature 0 function.

`collectData` and `applyData` were modified, as the brief's §6 anchor list requires: `collectData`
gained one key on the weapon-row object (`arrowType`) and `applyData` gained nothing — the
in-flight-arrow teardown went into `clearAllRows()`, which both `applyData()` and
`resetToBaseline()` already pass through. `data.fields` still has exactly 42 entries.

## Change hunks

```
@@ -882,0    +882,77   @@   CSS block
@@ -1606,0   +1683,3   @@   "+ Add Arrows" button
@@ -1718,0   +1798,31  @@   ammunition popup + Add Arrows picker markup
@@ -2484,2   +2595,10  @@   ARROW_LIBRARY comment
@@ -2487,5   +2606,10  @@   ARROW_LIBRARY rows
@@ -4898,0   +5022,3   @@   makeWeaponRow: .wp-arrow-type
@@ -4982,1   +5109,4   @@   refreshWeaponRow: loaded-arrow preview
@@ -4995,0   +5125,10  @@   refreshWeaponRow: row note
@@ -5027,1   +5167,2   @@   showWeaponInfoModal: loaded-arrow damage
@@ -5033,0   +5174,9   @@   showWeaponInfoModal: ammunition section
@@ -5094,1   +5244,6   @@   makeEquipRow: icon slot
@@ -5128,0   +5283,14  @@   makeEquipRow: decoration + zero-quantity removal
@@ -5714,1   +5883,3   @@   resolveWeaponContext (string form)
@@ -5729,1   +5900,3   @@   resolveWeaponContext (row form)
@@ -5771,0   +5944,22  @@   rollWeaponAttack: ammunition prompt + spend
@@ -5775,1   +5970,2   @@   rollWeaponAttack: arrow in the roll context
@@ -5802,0   +5998,7   @@   rollWeaponDamage: breakdown + release
@@ -7048,0   +7251,4   @@   collectData: arrowType
@@ -7140,0   +7347,4   @@   clearAllRows: release the arrow in flight
@@ -7719,0   +7930,5   @@   P2 normaliser: informational comment
@@ -7722,3   +7938,3   @@   P2 normaliser: zeroed deltas
@@ -7729,0   +7945,3   @@   P2 normaliser: informational + display
@@ -7730,1   +7949,2   @@   P2 normaliser: keep filter
@@ -7805,0   +8025,2   @@   breakdown bar: display fallback
@@ -7816,0   +8038,386 @@   Feature 6 JS block
@@ -8951,0   +9559,10  @@   test seam exports
@@ -8998,0   +9616,7   @@   init wiring
```

## One regression assertion updated, deliberately

`l5r-P1-P2-F4-test-harness.js` **F4-A3** photographs the entire modifier registry:

```js
-  ['range@20','stance@30','wounds@40','void@50']
+  ['range@20','arrow@25','stance@30','wounds@40','void@50']
```

The brief (§5.5) requires a contributor with `id:'arrow'`, `priority: 25`, so this snapshot
changes by construction. It is the only edit to any pre-existing harness; every other Feature 4
assertion, and every assertion in Features 3/2/1, P1/P2, Feature 0, Part B and the schoolfree
bugfix suite, is byte-identical to what Feature 4 shipped. All 594 of them pass.
