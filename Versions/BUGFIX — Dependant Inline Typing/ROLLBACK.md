# ROLLBACK — BUGFIX — Dependant Inline Typing

## Switch it off

In `src/sheet/209.99994-bugfix-dependant-typing.js` (Phase 0 tree):

```js
const DEPENDANT_TYPING_ENABLED = false;
```

Rebuild with `build/recombine.py`. Nothing is installed; Dependant's two optional fields go back to
Phase 4.5.8's change-only commit, and typed text can be lost again. The fix adds no CSS, markup,
save field or modifier-registry seat, so nothing else needs switching off.

## Remove it

Use the remover on an external scratch copy only:

```text
python qa/remove-phase.py <scratch-copy>
python <scratch-copy>/build/recombine.py --verify
```

It removes only `src/sheet/209.99994-bugfix-dependant-typing.js`, its manifest entry, and the
`dependant-typing-seam` block in `src/sheet/210-test-seam-and-init.js` (marked
`// BUGFIX DEPTYPE BEGIN dependant-typing-seam` … `// END DEPTYPE dependant-typing-seam`). Later
releases are removed first through the shared removal-chain registry. It never edits the live tree.

Measured against `main` before this fix:

| Item | Value |
|---|---|
| Previous build | `a563b59` (build unchanged since `218caf5`), 3,100,276 bytes |
| Previous SHA-256 | `4f8509e68a05054b2c813575f77750c4598a9b4295d18faf266ecc10de06413a` |
| Current build | 3,104,431 bytes |
| Current SHA-256 | `2c8a426f85d00d1637a9ec48453ac01b3600b5193494aae342f3b5113e3c4fc6` |

`qa/test-removal.py` performs that removal on a copy of the live tree and proves the rebuild returns
exactly the previous SHA and size. It also refuses foreign, partial, duplicate, hard-linked,
symlinked and unregistered surfaces before writing anything.

## Outside the build

Two small edits sit outside the sheet and are not undone by the remover, because they are not part
of the build and are harmless once the fix is gone. Take them out by hand if you want a clean tree:

- `QA — Removal Chain Registry/removal_chain.py`: this release's one `Release(...)` line at the end
  of `CHAIN`. Delete it together with this folder; `qa/test-chain.py` then passes again.
- Phase 0's `qa/feature-dependencies.py`: `MARKER_RE` gained the alternative
  `BUGFIX\s+DEPTYPE(?![\w-])`, so this fix's marker can be told apart from the bare word `BUGFIX`
  that earlier bugfixes use. With the fix removed nothing matches it. Other releases' ownership
  reports are unchanged by it (checked for the Import File Picker Filter and Apply School Skill Rows
  fixes: identical reports before and after).

## Dependencies

**Hard dependency: Phase 4.5.8 (Dependant and Wrath of the Kami)** and, through it, Phases 4.5 and
4.5.2. The fix wraps `R458.decorateDependant` and `D45.refresh` by property and calls
`refreshAdvConfigControl`, `readAdvConfig` and `writeAdvConfig`. Its install is guarded: with 4.5.8
switched off or removed it installs nothing (boundary-tested). Remove this fix before removing 4.5.8;
the removal chain does so in order. 4.5.8's `ROLLBACK.md` names this consumer.

**No dependency on Phase 12 or 12.5.** Play mode still locks the fields through 12.5's selectors and
the parent gate, which run at document capture before any of this fix's listeners. With either
switched off the fix still works (boundary-tested with the harness's `--mode-off`).

Phase-owned symbols: `DEPTYPE`, `DEPENDANT_TYPING_ENABLED`. Both are exported only from the marked
seam block. `qa/feature-dependencies.py` reports every reference inside blocks this fix owns.

## History

The first version of this file was written by Codex on 28 September 2026 and overwritten with
unrelated bytes by a laptop crash before it was committed. This version was written on 30 September
from the release as it now stands; see the README for what changed in the fix itself.
