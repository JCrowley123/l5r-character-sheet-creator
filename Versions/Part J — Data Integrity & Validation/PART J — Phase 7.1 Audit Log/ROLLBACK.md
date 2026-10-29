# Rollback

Quickest: set `AUDIT_LOG_ENABLED = false` and rebuild; then nothing is recorded or shown, and a save's `auditLog` is ignored on load and not written again.

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live tree). It removes this phase's fragment, its manifest entry and the `audit-seam` block; the rebuild is then exactly `6f4dc04d6cd0c019dda7fb59d7df516ea8a949f106abef1b07b0d331cfc1caaa`, 17,426,374 bytes. Saves written meanwhile keep their `auditLog` key, which the sheet without this phase ignores. **Either way, the History is dropped from each character the next time it is saved**, since the sheet without this phase does not write the key back (review finding 6). Export JSON first to keep a copy.
