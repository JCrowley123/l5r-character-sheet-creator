# ROLLBACK — PART K — Phase 12.5 Advantages & Disadvantages in Play

Use the remover on an external scratch copy only:

```text
python qa/remove-phase.py <scratch-copy>
python <scratch-copy>/build/recombine.py --verify
```

It removes only `src/sheet/209.99993-feat-modes-advantages.js`,
`src/css/59.9994-feat-modes-advantages.css`, their manifest entries, and the
`modes-advantages-seam` block in `src/sheet/210-test-seam-and-init.js`. Later releases are removed
first through the shared removal-chain registry. It never edits the live tree.

Measured against `main` before this release:

| Item | Value |
|---|---|
| Previous build | `d7ba875`, 3,095,845 bytes |
| Previous SHA-256 | `7f187450905c96500f16015a3ffe0250d2a9ca49e24d882252a93061e3fc4ff0` |
| Current build | 3,100,276 bytes |
| Current SHA-256 | `4f8509e68a05054b2c813575f77750c4598a9b4295d18faf266ecc10de06413a` |

The own removal suite proves the scratch rebuild returns to the previous hash and refuses foreign,
partial, duplicate, hard-linked, symlinked and unregistered surfaces before writing.

## Dependencies

Hard dependency: Phase 12 part 1 (`MODES12`). Remove this part first. No earlier tab part or Phase
1.5 registry seat is modified; all in-play Advantage/Disadvantage effects belong to their existing
phases and remain intact when this mode gate is removed.

Guarded soft integrations: the Phase 4.5 modal closer/grid, 4.5.8 Dependant inputs, 4.5.17 Wealthy
buttons and 4.5.21 Hotei exception. Each provider's rollback document records this consumer.
Phase-owned symbols are `MODES125`, `MODES125_ENABLED` and CSS activation class `pm125-enabled`;
the referenced existing controls remain owned by their providers. The CSS class is checked for
unregistered leakage before removal writes anything. No registry seat or save field is added.

Measured removal QA: 21 tests (20 passed, Windows symlink test skipped), shared registry 11/11,
and Phase 11 live-tree fixtures 2/2. That last check strips this release through the historical
chain, rather than testing only the newest remover in isolation.

One retained QA helper was hardened during release validation: Phase 12.6's `typeName` now waits
for an actionable, focused Techniques field before typing. Its 16 assertions are unchanged and
pass with this release both present and removed; all six pinned variants still match. This
test-only readiness fix is intentionally not undone by removing 12.5. It is outside the built
source tree and does not affect the byte-identical production rebuild.
