# ROLLBACK — PART K — Phase 12.6 Play Mode Techniques

Against a **scratch copy** of the Phase 0 tree (the remover refuses the live tree):

```bash
cp -r "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability" /tmp/phase0
python3 "Versions/PART K — Phase 12.6 Play Mode Techniques/qa/remove-phase.py" /tmp/phase0
python3 /tmp/phase0/build/recombine.py
```

It removes `src/sheet/209.99992-feat-modes-techniques.js`, `src/css/59.9993-feat-modes-techniques.css`,
their manifest entries, and block `modes-techniques-seam` in `210-test-seam-and-init.js`. **Measured 25
September 2026:** byte-identical to `4ac2b09f5ba7f3c2945bcce71f0f64e1fdc79a4d1d92754eb5aea2d66cf8adc1`
(3,093,125 bytes, part 5's build). Later releases come off first through the shared removal chain.

## Dependencies

- **HARD, on part 1**: registers through `MODES12.register`; guarded. Remove this part before part 1.
  Declared in part 1's ROLLBACK.
- Independent of the other tab parts. **Who depends on this:** nothing. No cross-phase fixture was
  changed.
