# Remove PART I — Phase 4.5.42 Inheritance and the Printed Heirlooms

Set `INHERITANCE_PRINTED_HEIRLOOMS_ENABLED` (in `src/sheet/209.99999999999-feat-inheritance-printed-heirlooms.js`) to `false` and reload:
Inheritance rows no longer point to the printed heirlooms; nothing else changes.

## Surgical removal

| Location | Owned item |
|---|---|
| `src/sheet/209.99999999999-feat-inheritance-printed-heirlooms.js` | whole fragment and its `build/manifest.json` entry |
| `src/sheet/210-test-seam-and-init.js` | `printed-heirlooms-seam` |

The block begins `// PART I PHASE 4.5.42 BEGIN printed-heirlooms-seam` and ends `// END INH4542 printed-heirlooms-seam`.

1. Copy the Phase 0 folder to a scratch directory (the remover refuses the live tree).
2. Remove later releases first, newest first (`QA — Removal Chain Registry/removal_chain.py`).
3. `python -B qa/remove-phase.py <scratch> --dry-run`, inspect, then run it without `--dry-run`. With no later
   releases present, add `--expect-sha b9785726bf964061a07cf82a19587acdebc053841f34cd1d64e7255783cb789d`
   (Phases 4.5.39 to 4.5.41, 7,959,195 bytes).
4. Rebuild with `build/recombine.py --verify` and run Phase 4.5.41's harness. Then apply the same removal to the working
   branch, delete this layer's entry from `CHAIN`, and delete this folder.
