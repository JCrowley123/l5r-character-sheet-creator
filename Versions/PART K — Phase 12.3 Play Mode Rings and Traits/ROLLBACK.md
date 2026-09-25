# ROLLBACK — PART K — Phase 12.3 Play Mode Rings and Traits (part 4)

Against a **scratch copy** of the Phase 0 tree (the remover refuses the live tree):

```bash
cp -r "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability" /tmp/phase0
python3 "Versions/PART K — Phase 12.3 Play Mode Rings and Traits/qa/remove-phase.py" /tmp/phase0
python3 /tmp/phase0/build/recombine.py
```

It removes `src/sheet/209.9999-feat-modes-rings-traits.js`, `src/css/59.9991-feat-modes-rings-traits.css`,
their manifest entries, and block `modes-rings-traits-seam` in `210-test-seam-and-init.js`. **Measured
25 September 2026:** byte-identical to `c4ddd6fbd9cdc6bd743509ff93936673996922c2956237bb17b8dad27ceae932`
(3,088,014 bytes, part 3's build). Later releases come off first through the shared removal chain.

## Dependencies

- **HARD, on part 1** (`PART K — Phase 12 Play and Management Modes`): registers through
  `MODES12.register`; guarded. Remove this part before part 1. Declared in part 1's ROLLBACK.
- Independent of parts 2 and 3.
- **Who depends on this:** nothing. No cross-phase fixture was changed.
