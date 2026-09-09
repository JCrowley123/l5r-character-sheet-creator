# Feature 7 — diff vs the Feature 6 trunk

Trunk:   `l5r-character-sheet part C feature 6 ammo.html` (9,648 lines)
Feature: `l5r-character-sheet part C feature 7 dualwield.html` (10,229 lines, 1,178,717 chars,
sha256 `32df9f2fec6c2427…`)

```
added lines:   596
removed lines:  15
```

## Every removed line

All 15 are in `SKILL_LIBRARY` (two entries gaining a declared field), a call site gaining one
argument, a button handler, `recalcAll()`'s Armor TN line, or the `rollWeaponAttack()` split.
No frozen function was touched.

```
{name:'Knives', trait:'Agility', cat:'Weapon', emph:'Aiguchi, Jitte, Kama, Sai, Tanto', m:{...}},
{name:'War Fan', trait:'Agility', cat:'Weapon', emph:'—', m:{...}},
tr.querySelector('.rm-btn').addEventListener('click', ()=>tr.remove());
arrow: getLastArrowUsed(), manualAttack:false, manualDamage:false,
if(!ctx.skillName){ setStatus('This weapon has no linked Weapon Skill to roll.'); return; }
if(atk.numDice <= 0){ setStatus(`Set your ${atk.traitName||'Trait'} before rolling ${ctx.label}.`); return; }
const title = `${ctx.label} — Attack (${ctx.skillName}${atk.unskilled ? ', Unskilled' : ` ${atk.skillRank}`})`;
return;
if(!rangeDecision){ setStatus('Attack cancelled.'); return; }
return;
if(!arrowChoice){ setStatus('Attack cancelled — no arrow nocked.'); return; }
return;
arrow:arrowChoice }),
document.getElementById('addWeapon').addEventListener('click', ()=>document.getElementById('weaponsBody').appendChild(makeWeaponRow({key:''})));
document.getElementById('f_currentTN').value = baseTN + armorTN + stanceTN + voidTN;
```

Line by line:

| Removed | Why |
|---|---|
| `Knives` and `War Fan` SKILL_LIBRARY entries | Each gained `offHandExempt: 3`. **The printed mastery text is byte-identical**; only the declared field is new, and `offHandMasteryAudit()` asserts the two agree. |
| the `.rm-btn` handler | Removing a row can drop the character back to one weapon, which has to take the dual-wield UI, the penalties and the Armor TN bonus away with it. |
| `arrow: getLastArrowUsed(), manualAttack…` | The keyless branch of `resolveWeaponContext` gained `hand` and `weaponSize`. |
| four `return;` statements and the two guard lines above them | `rollWeaponAttack`'s body became `performWeaponAttack()`, which reports **whether a roll happened** so the "both weapons" flow knows not to offer the second attack after the first was cancelled. Every one of these is `return false;` now — same control flow, a return value added. |
| the `title` line | Gained the hand suffix, so a two-roll sequence is unambiguous. |
| `arrow:arrowChoice }),` | The roll context gained `hand` and `weaponSize`. |
| the `addWeapon` click handler | Adding a second weapon reveals the Hand selector. |
| the `f_currentTN` line | Gained the `+ dualTN` term, exactly as Feature 2 and Feature 4 each added one before it. |

## Anchors NOT touched

`rollDicePool`, `rollWeaponDicePool`, `rollExplodingD10`, `rollExplodingD10At`, `applyTenDiceRule`,
`showRollResult`, `updateRollKeepState`, Part B's damage arithmetic (`getWeaponDamageDice` is not
modified and is not called differently), every Feature 6 ammunition function, and every Feature 4
Void function. The brief's §5 forbidden list is intact.

`resolveWeaponContext`, `rollWeaponAttack`, `refreshWeaponRow`, `showWeaponInfoModal`,
`collectData` and `recalcAll` were modified — all on the brief's §5 permitted list except
`recalcAll`, which is modified only to add the RAW Armor TN term (see FEATURE-7-RESULTS.md).
`applyData` needed no change: handedness rides in on `makeWeaponRow(data)`.

`data.fields` still has exactly 42 entries.

## Change hunks

```
@@ -881,0    +881,43   @@   CSS block
@@ -1801,0   +1844,15  @@   attack-hand prompt markup
@@ -2141,1   +2199,4   @@   SKILL_LIBRARY: Knives offHandExempt
@@ -2147,1   +2208,1   @@   SKILL_LIBRARY: War Fan offHandExempt
@@ -5017,0   +5078,11  @@   makeWeaponRow: the Hand selector
@@ -5049,0   +5121,8   @@   makeWeaponRow: selector value + change listener
@@ -5052,1   +5132,7   @@   makeWeaponRow: row removal refreshes the table
@@ -5088,0   +5174,4   @@   refreshWeaponRow: selector visibility
@@ -5125,0   +5215,3   @@   refreshWeaponRow: handedness note bits
@@ -5174,0   +5267,19  @@   showWeaponInfoModal: handedness section
@@ -5229,0   +5341,1   @@   weapon quick-add refreshes the table
@@ -5885,1   +5998,5   @@   resolveWeaponContext (keyless form)
@@ -5903,0   +6020,4   @@   resolveWeaponContext (row form)
@@ -5919,1   +6040,24  @@   rollWeaponAttack -> orchestrator + performWeaponAttack
@@ -5921,2   +6065,4   @@   performWeaponAttack: hand in the title
@@ -5931,1   +6077,1   @@   cancel returns false (Full Attack)
@@ -5936,1   +6082,1   @@   cancel returns false (range prompt)
@@ -5941,1   +6087,1   @@   cancel returns false (out of range)
@@ -5952,1   +6098,1   @@   cancel returns false (no arrow)
@@ -5958,1   +6104,1   @@   cancel returns false (out of arrows)
@@ -5971,1   +6117,4   @@   roll context gains hand + weaponSize
@@ -5980,0   +6129,1   @@   performWeaponAttack returns true
@@ -6361,1   +6511,4   @@   + Add Weapon refreshes the table
@@ -7143,1   +7296,5   @@   recalcAll: two weapons add Insight Rank to Armor TN
@@ -7255,0   +7412,5   @@   collectData: hand
@@ -7333,0   +7495,2   @@   applyData: refresh once every row is appended
@@ -8038,0   +8202,408 @@   Feature 7 JS block
@@ -9559,0   +10131,9  @@   test seam exports
```

## Two regression assertions updated, both the same snapshot

`F4-A3` and `F6-A15` each photograph the **entire** modifier registry, so both change by
construction whenever a feature registers a contributor:

```js
-  ['range@20','arrow@25','stance@30','wounds@40','void@50']
+  ['range@20','arrow@25','stance@30','offhand@35','wounds@40','void@50']
```

Feature 7 registers `offhand@35`, between stance (30) and wounds (40). These two lines are the
only edits to any pre-existing harness; every other assertion in Features 6, 4, 3, 2, 1, P1/P2,
Feature 0, Part B and the schoolfree bugfix suite is byte-identical to what shipped before, and
all 748 of them pass.

The off-hand contributor returns `null` on every roll those suites make: it is scoped to attack
rolls that declared a hand, and `hand` is `null` for every attack made by a character who has not
marked a weapon row "Off-hand".
