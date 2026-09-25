# ROLLBACK — PART K — Phase 12.4 Play Mode Skills (part 5)

Against a **scratch copy** of the Phase 0 tree (the remover refuses the live tree):

```bash
cp -r "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability" /tmp/phase0
python3 "Versions/PART K — Phase 12.4 Play Mode Skills/qa/remove-phase.py" /tmp/phase0
python3 /tmp/phase0/build/recombine.py
```

It removes `src/sheet/209.99991-feat-modes-skills.js`, `src/css/59.9992-feat-modes-skills.css`, their
manifest entries, and block `modes-skills-seam` in `210-test-seam-and-init.js`. **Measured 25
September 2026:** byte-identical to `f3174bba1fa485221579882528163e7de22a666e43b79cb8e6d17c7f73371798`
(3,089,890 bytes, part 4's build). Later releases come off first through the shared removal chain.

## Dependencies

- **HARD, on part 1**: registers through `MODES12.register`; guarded. Remove this part before part 1.
  Declared in part 1's ROLLBACK.
- **Soft, cosmetic, on part 3**: part 3's generic rule also hides locked number spinners; this part
  carries its own copy for the Skills table, so removing part 3 changes nothing here.
- **Who depends on this:** nothing. No cross-phase fixture was changed.
