# ROLLBACK — PART K — Phase 12.1 Play Mode Clan and School (part 2)

Against a **scratch copy** of the Phase 0 tree (the remover refuses the live tree):

```bash
cp -r "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability" /tmp/phase0
python3 "Versions/PART K — Phase 12.1 Play Mode Clan and School/qa/remove-phase.py" /tmp/phase0
python3 /tmp/phase0/build/recombine.py
```

It removes `src/sheet/209.9997-feat-modes-clan-school.js`, `src/css/59.998-feat-modes-clan-school.css`,
their manifest entries, and block `modes-clan-school-seam` in `210-test-seam-and-init.js`.
**Measured 25 September 2026:** byte-identical to
`6c860a52b8e3215c7011484e90f8d33c991b347c4211e83fcb9d94a63bf857a9` (3,083,017 bytes, part 1's build).
Later releases come off first through the shared removal chain.

## Dependencies

- **HARD, on part 1** (`PART K — Phase 12 Play and Management Modes`): it registers through
  `MODES12.register`. Guarded, so with part 1 gone this part does nothing, but it has no purpose
  without part 1: remove this part first. Declared in part 1's ROLLBACK.
- **Who depends on this:** nothing.
- No cross-phase fixture was changed.
