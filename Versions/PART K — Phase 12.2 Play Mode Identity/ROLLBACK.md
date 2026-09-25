# ROLLBACK — PART K — Phase 12.2 Play Mode Identity (part 3)

Against a **scratch copy** of the Phase 0 tree (the remover refuses the live tree):

```bash
cp -r "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability" /tmp/phase0
python3 "Versions/PART K — Phase 12.2 Play Mode Identity/qa/remove-phase.py" /tmp/phase0
python3 /tmp/phase0/build/recombine.py
```

It removes `src/sheet/209.9998-feat-modes-identity.js`, `src/css/59.999-feat-modes-identity.css`, their
manifest entries, and block `modes-identity-seam` in `210-test-seam-and-init.js`. **Measured 25
September 2026:** byte-identical to `d6c0c79b2e42cef57ce2a061420b229bb482e39d67af35beb3b4a3066d158bd3`
(3,085,178 bytes, part 2's build). Later releases come off first through the shared removal chain.

## Dependencies

- **HARD, on part 1** (`PART K — Phase 12 Play and Management Modes`): registers through
  `MODES12.register`; guarded. Remove this part before part 1. Declared in part 1's ROLLBACK.
- Independent of part 2: either can be removed without the other (they only add selectors).
- **Who depends on this:** nothing. No cross-phase fixture was changed.
