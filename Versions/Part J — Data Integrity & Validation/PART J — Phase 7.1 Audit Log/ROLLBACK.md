# Rollback

Quickest: set `AUDIT_LOG_ENABLED = false` and rebuild; then nothing is recorded or shown, and a save's `auditLog` is ignored on load and not written again.

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live tree). It removes this phase's fragment, its manifest entry and the `audit-seam` block; the rebuild is then exactly `06e8eb9ccf6306cf7e9c5e365b6afbfe183832a8776a769cd21ff088f9952453`, 17,428,244 bytes. Saves written meanwhile keep their `auditLog` key, which the sheet without this phase ignores. **Either way, the History is dropped from each character the next time it is saved**, since the sheet without this phase does not write the key back (review finding 6). Export JSON first to keep a copy.
