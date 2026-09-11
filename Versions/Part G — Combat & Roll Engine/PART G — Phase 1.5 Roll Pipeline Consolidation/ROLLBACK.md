# Rolling back Part G, Phase 1.5

## Dependencies

- **Phase 4.5 (Part I) depends on this phase — SOFT, and declared in its `ROLLBACK.md` too.**
  That phase registers a seventh contributor (`adv-config`, priority 60) into
  `PREROLL_MODIFIER_REGISTRY`, and this phase's harness is what documents the registry's
  contents. The dependency runs **only through this harness**, not through any code: Phase 4.5
  registers through the trunk's own `registerPreRollModifier()` and reads nothing this phase
  owns, so deleting this folder does not affect it in the slightest — it only removes the
  suite that audits the registry.
- **This phase does not depend on Phase 4.5.** Its registry check is written conditionally on
  that phase being present, so this suite reads **35/35** either way. Removing Phase 4.5 needs
  no edit here.

Both directions measured rather than asserted: 35/35 with Phase 4.5 in the build and 35/35
against a build with it surgically removed.

## Delete the folder. That's the whole procedure.

Unlike Phase 1.6 (which had to edit Phase 0's own fragments because the code
it needed to change was defined there), this phase never touches anything
outside `Versions/PART G — Phase 1.5 Roll Pipeline Consolidation/`. It reads
Phase 0's already-built pipeline through `window.__L5R_TEST__` and writes
down what it finds; it ships no diff to any fragment for `originals/` to
preserve.

```bash
rm -rf "Versions/PART G — Phase 1.5 Roll Pipeline Consolidation"
```

## Confirming there was nothing else to undo

```bash
cd "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability"
python3 build/recombine.py --verify
```

Should report **BYTE-IDENTICAL** against
`a8e9851dc783b3eb02a4de6508937863049781c256b71efcc2e426030d7cedd3` — the same
hash Phase 1.6 ended on. If that hash has moved, something other than this
phase changed it; this phase's own harness never writes to the file it is
given (see the header comment in `qa/roll-pipeline-baseline.js`).

## What that leaves

- **Phase 0's fragments, and every phase before this one, untouched.**
- **The registry documentation and its regression baseline are gone.** A
  later phase (3, 4, 4.5, or 6) that wants to protect the pipeline while it
  makes its own changes would need to re-derive the registry table and
  rebuild the harness from scratch — this phase's whole value was doing
  that once, up front, so they don't each have to.
- **Nothing about the sheet's behaviour changes**, because nothing about the
  sheet's behaviour was changed by building this phase in the first place.
