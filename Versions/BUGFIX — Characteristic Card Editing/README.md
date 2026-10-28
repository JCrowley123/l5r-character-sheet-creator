# Characteristic Card Editing

Management edits Rank/Points inside the four cards; Play retains read-only values. Recognition moves beside Glory/Status adjustment controls; Taint growth moves inside its card. Undo expires after20 seconds or successful manual save, without interrupting background autosave. Logic is separate from UI; switch CHARACTERISTIC_EDITING_ENABLED. Validation and writes reuse the existing rules; no save-format change.

Predecessor e58fe09: 4f2ebd5b6ec932010983906dff5f8c76c52c8116b680fb0d2d461c722d130e5f,17336656 bytes. Initial candidate ac59ef11ee32eb97852c1140e8fb5040b8530c9dd03f6dd3296b50cacda6a919,17344141 bytes.

27 October focused evidence: own31/31; predecessor and disabled1/31; four negative mutations plus baseline matched exact pins. Previous compact-card checks33/33; removal6/6 restores e58fe09 exactly. Broader affected checks, visual verification, review and full suites remain pending.

## Review follow-up, 28 October 2026 (Claude)

**In short:** the three findings of the first review are fixed inside this layer, with nine new checks. 40/40, first run.

- **Undo and loads show the real values.** A successful Undo, a load or a reset now rewrites every Rank and Points field, including a rejected or focused draft, and clears its red outline. Ordinary redraws still leave a field being typed in alone.
- **A corrected field withdraws its own alert.** Typing the original value back, or pressing Escape, clears that field's alert. If another field is still wrong, its message comes back. An alert from the steppers is left alone.
- **A slow first Save or Save As keeps a newer Undo.** The save now remembers which open character it began with. When it gives that character a new id, a change made while it was saving can still be undone. After a load or reset during the save, the sheet is another character, so the Undo is withdrawn, never carried over.

New owned blocks: `undo-identity` in the compact-controls fragment and `save-identity` in `120-persistence.js`. Both are listed in `qa/remove-phase.py`.

| Check | Result |
|---|---|
| Own harness | 40/40 (31 + 9 new); main and switched off 1/40 |
| Negative variants | 11/11 matched pins committed before the first run (6 new, one per fix) |
| Under 4× CPU throttling | 40/40 |
| Compact controls, wound preview, wound multipliers | 33/33, 18/18, 31/31 |
| Removal | 6/6; rebuilds e58fe09 exactly (above) |
| Dependency scan | 22 hits, all this layer's own marked lines (the older scanner reads the tag as bare BUGFIX) |

This layer's build without the wound preview: `a2a2e9bb143c22f0afd0648746338b1c14e0d89223a742525a18d88ba3ca3f18`, 17,346,020 bytes.
