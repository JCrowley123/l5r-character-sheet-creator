# Phase 4.5.34 — Blind's Armor TN Note (Part I)

The owner's call of 9 October 2026 on check C11 of the 4.5.31 checklist ("as recommended"): Blind's Armor TN was
right (the base is Reflexes + 5, Core Rulebook p.156) but nothing beside the number said why. One line now appears
under the Combat card's **Base TN** ("Blind: Reflexes 2 + 5 = 7 (Core Rulebook p.156)") and under **Quick Access's
Armor TN** ("Blind: Reflexes 2 + 5 = 7"), only while Feature 4.5.31 has set Blind's base. It changes no number.

`src/sheet/209.99999994-feat-blind-armor-note.js` (`BL4534`, marker `PART I FEATURE 4.5.34`),
`src/css/59.99998-feat-blind-armor-note.css` (own class `bl4534-note`), one seam block. It wraps
`refreshAllAdvConfigControls` (after Feature 4.5.31's own refresh) and `renderQuickAccessPanel`.

**Verification:** own harness `qa/blind-note-harness.js` **11/11** (oracle: Reflexes + 5 and the sheet's own Base TN;
typed Reflexes followed; Quick Access repaint; wrong list; removal of Blind; Play mode); ownership scan clean;
removal fixtures 22 pass, one Windows symlink skip, the live fixture restoring Phase 4.5.33's build `29831d20…`
byte for byte; 7 mutations in `qa/variants.json`. Full-suite and live figures are recorded with Phase 14's.
