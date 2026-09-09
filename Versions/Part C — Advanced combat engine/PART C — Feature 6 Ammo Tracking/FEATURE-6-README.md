Feature 6 — README
Filename: FEATURE-6-README.md

Feature 6 README — Ammo Tracking
Overview
Feature 6 adds full ammunition tracking to the L5R 4e character sheet while preserving complete backward compatibility with Feature 4 behaviour when no arrows exist.

How It Works
1. Adding Arrows
Use + Add Arrows in Equipment to open the picker.
Choose a type, set a quantity, and click Add.

Arrows appear as:

Code
Arrow — Willow Leaf
Arrow — Armor Piercing
…
2. Bow Attacks
If the character owns arrows:

Attack with a bow

Range prompt

Ammunition popup

Choose an arrow

Attack roll

Damage roll (arrow released)

If the character owns no arrows, bows behave exactly as in Feature 4.

3. Spending Rules
One arrow per attack

Missed shots still spend

Damage roll releases the arrow

Last arrow removes its row

Partial spends refused

4. Damage Rolls
Damage uses:

Code
Bow Strength + Arrow DR
Examples:

Yumi (3) + Willow Leaf (2k2) = 5k2

Yumi (3) + Flesh Cutter (2k3) = 5k3

5. Modifier Bar
Damage rolls show:

Code
Arrow: Flesh Cutter (+2k3)
This is informational only.

6. Save/Load
Weapon rows now include:

Code
arrowType: "Willow Leaf"
lastArrowUsed is never saved.

Legacy saves load correctly.

Developer Notes
All frozen functions remain untouched.

P2 normaliser extended safely.

clearAllRows() handles teardown of in‑flight arrows.

Icons are inline SVGs, no external assets.

Zero‑change guarantee fully enforced.

Rebuilding
Code
python splice_feature6.py
Testing
Code
python -m http.server 8811 --directory "."
fetch('/l5r-P1-P2-F6-test-harness.js')
  .then(r=>r.text()).then(s=>(0,eval)(s))
  .then(o=>console.log(o.failed))
Exit condition: failed === 0.