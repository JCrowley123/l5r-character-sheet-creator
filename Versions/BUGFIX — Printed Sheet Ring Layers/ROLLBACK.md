# Surgical removal

Switch `PRINTED_RING_LAYERS_ENABLED` off to restore the old print rendering. Do not restore entire shared files.

Delete only `src/css/59.999985-bugfix-printed-ring-layers.css`, `src/sheet/209.999999992-bugfix-printed-ring-layers.js`, their manifest entries and the guarded `BUGFIX PRINTRINGS BEGIN printed-ring-layers-seam` block through `END PRINTRINGS printed-ring-layers-seam`. Rebuild the Phase 0 source.

Use `qa/remove-phase.py` on an external scratch copy first; it preflights paths, marker ownership, retained references and any required output hash before writing. The release is registered once in the shared removal chain.

Phase 11.1 Export to PDF depends on this fix for legible output. Remove Phase 11.1 first (or explicitly sever that dependency). Other independent layers must remain intact. The cycle's final QA tests both historical byte restoration and independent-layer retention.
