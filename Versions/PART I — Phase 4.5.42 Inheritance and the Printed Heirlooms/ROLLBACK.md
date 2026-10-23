# Remove PART I — Phase 4.5.42 Inheritance and the Printed Heirlooms

Set `INHERITANCE_PRINTED_HEIRLOOMS_ENABLED` (in `src/sheet/209.99999999999-feat-inheritance-printed-heirlooms.js`) to `false` and reload:
the four printed heirlooms return to the Advantages list, Inheritance no longer recognises them, and Search drops its line.
The two corrected older harnesses (README) then assert their original expectations; nothing else changes.

## Surgical removal

| Location | Owned item |
|---|---|
| `src/sheet/209.99999999999-feat-inheritance-printed-heirlooms.js` | whole fragment and its `build/manifest.json` entry |
| `src/sheet/210-test-seam-and-init.js` | `printed-heirlooms-seam` |

The block begins `// PART I PHASE 4.5.42 BEGIN printed-heirlooms-seam` and ends `// END INH4542 printed-heirlooms-seam`.

1. Copy the Phase 0 folder to a scratch directory (the remover refuses the live tree).
2. Remove later releases first, newest first (`QA — Removal Chain Registry/removal_chain.py`).
3. `python -B qa/remove-phase.py <scratch> --dry-run`, inspect, then run it without `--dry-run`. With no later
   releases present, add `--expect-sha d80bad4aef72060903fac9ce00847614a64e3e6ba6fe0f083f926426c667b43a`
   (Phases 4.5.39 to 4.5.41, 7,959,638 bytes).
4. Rebuild with `build/recombine.py --verify` and run Phase 4.5.41's harness. Then apply the same removal to the working
   branch, delete this layer's entry from `CHAIN`, and delete this folder.
