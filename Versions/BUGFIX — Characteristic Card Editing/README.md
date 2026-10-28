# Characteristic Card Editing

**Status, 28 October 2026:** finished and ready for review. The full suite passed twice, first time (6,365/6,365, removal exact, 6,228/6,228); see the QA folder `QA — Cycle 7a Device Follow-up 2026-10-27`. Merged to main `c0da641` and verified live the same day (319/319 checks on the live files). The dated notes below are the build history.

Management edits Rank/Points inside the four cards; Play retains read-only values. Recognition moves beside Glory/Status adjustment controls; Taint growth moves inside its card. Undo expires after20 seconds or successful manual save, without interrupting background autosave. Logic is separate from UI; switch CHARACTERISTIC_EDITING_ENABLED. Validation and writes reuse the existing rules; no save-format change.

Predecessor e58fe09: 4f2ebd5b6ec932010983906dff5f8c76c52c8116b680fb0d2d461c722d130e5f,17336656 bytes. Initial candidate ac59ef11ee32eb97852c1140e8fb5040b8530c9dd03f6dd3296b50cacda6a919,17344141 bytes.

27 October focused evidence: own31/31; predecessor and disabled1/31; four negative mutations plus baseline matched exact pins. Previous compact-card checks33/33; removal6/6 restores e58fe09 exactly. Broader affected checks, visual verification, review and full suites remain pending.

## Review follow-up, 28 October 2026 (Claude)

**In short:** the first review's three findings and three of the second review's four are fixed inside this layer, with fifteen new checks. 46/46 on the first run after each round.

- **Undo and loads show the real values.** A successful Undo, a load or a reset rewrites every Rank and Points field, including a rejected entry, and clears its red outline. Text you have typed but not yet applied is kept by Undo and by ordinary redraws; a field that merely has focus shows the current value.
- **A corrected field withdraws its own alert.** Typing the original value back, or pressing Escape, clears that field's alert. If another field is still wrong, its message comes back. An alert from the steppers is left alone.
- **A slow Save or Save As keeps a newer Undo.** With no load or reset during the save, a change made while it was saving can still be undone, even when Save is tapped twice. After a load or reset during the save, the sheet is another character, so the Undo is not carried over. The Undo button is redrawn after every save.
- **Reported, not built:** an older save race outside this layer (see the QA folder's REVIEW-FINDINGS.md). It cannot happen with localStorage, which the live site uses.

New owned blocks: `undo-identity` in the compact-controls fragment and `save-identity` in `120-persistence.js`. Both are listed in `qa/remove-phase.py`.

| Check | Result |
|---|---|
| Own harness | 46/46 (31 + 15 new); main and switched off 1/46 |
| Negative variants | 15/15 matched pins committed before each round's first run (10 new, each removing one fix) |
| Under 4× CPU throttling | 46/46; compact controls 33/33 |
| Compact controls, wound preview, wound multipliers | 33/33, 18/18, 31/31 |
| Removal | 6/6; rebuilds e58fe09 exactly (above) |
| Dependency scan | 22 hits, all this layer's own marked lines (the older scanner reads the tag as bare BUGFIX) |

This layer's build without the wound preview: `fc268dd274c03a80f9715026d13ef8706958e75f33ce11900eda84c95232f4ef`, 17,346,510 bytes. With it (the candidate): `55f9e9ed601e052f3be617c06da51d795ab8f5932e5213d339ef27d6bd21f389`, 17,349,941 bytes.
