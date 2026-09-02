Feature 6 — Changelog
Filename: FEATURE-6-CHANGELOG.md

Feature 6 Changelog — Ammo Tracking
Added
Arrow equipment rows (Arrow — {type}) with:

Inline SVG icons

DR / cost / special‑rule tooltips

Merge‑on‑add behaviour

Zero‑quantity removal

Live re‑decoration when renamed

Add Arrows picker modal:

Five RAW arrow types

Quantity ticker (−/+ buttons)

“Have N” readout

Add button (merges into existing rows)

Icons and tooltips

Ammunition popup during bow attacks:

Owned arrows clickable

Unowned arrows disabled

Zero‑count arrows flagged

Cancel behaviour (no spend, no roll)

Empty‑quiver gating

Arrow spending logic:

One arrow per attack

Missed shots still spend

Damage roll releases the arrow in flight

Last arrow removes its equipment row

Partial spends refused

Damage pipeline integration:

getWeaponDamageDice(entry, rank, {arrow})

Weak‑user cap preserved

Strong‑user cap preserved

Unknown‑arrow fallback

Modifier bar entry:

Informational only

Zeroed deltas

Shown only on damage rolls

Save/load:

New arrowType field on weapon rows

lastArrowUsed never saved

Round‑trip stability

Pre‑Feature‑6 saves load correctly

Changed
P2 normaliser extended with informational and display channels.

Modifier registry snapshot updated (Feature 4 A3):

Code
['range@20','arrow@25','stance@30','wounds@40','void@50']
Fixed
Arrow icons previously invisible due to stylesheet display:none.

lastArrowUsed incorrectly surviving applyData().

Removed
Old ARROW_LIBRARY rows (replaced with enriched versions).

Placeholder arrow:null fields.

Two obsolete damage calls.