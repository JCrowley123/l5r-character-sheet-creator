# Remove Phase 4.5.34 Blind's Armor TN Note

One script, one stylesheet, their two manifest entries and one guarded seam block. Removing it removes the two lines
and nothing else: Blind's Armor TN itself is Feature 4.5.31's and is unchanged either way.

Method: copy the Phase 0 folder to a scratch directory; `python -B qa/remove-phase.py <scratch> --dry-run`, read the
plan, run it, rebuild with `build/recombine.py --verify` and run the retained suites; then apply to the branch,
delete this folder and remove this release's entry from `QA — Removal Chain Registry/removal_chain.py`. The remover
deletes only `src/sheet/209.99999994-feat-blind-armor-note.js`, `src/css/59.99998-feat-blind-armor-note.css`, their
manifest entries and the `blind-armor-note-seam` block, and refuses on any leftover `BL4534`,
`BLIND_ARMOR_NOTE_ENABLED`, `bl4534…` id or `bl4534-` class. With nothing later present,
`--expect-sha 29831d206388eed6ea204e3ed41b76c468e47851fd492fa766408b9f2d67fcee` requires the exact pre-release build:
**3,731,182 bytes** (Phase 4.5.33's build).

**Dependencies (declared):** a hard dependency on Feature 4.5.31 (`CHK4531.has`, `CHK4531.enabled` and the
`data-chk4531` mark on `#f_baseTN`): without it the lines never show. Feature 4.5.31 gains no new dependent beyond
this read; removing 4.5.31 means removing this release first (the removal chain does so). On the trunk:
`refreshAllAdvConfigControls`, `renderQuickAccessPanel`, `getTraitValueByName`, `#f_baseTN`, `#qaArmorTNValue`.
The removal chain registry gained one entry, at its end.
