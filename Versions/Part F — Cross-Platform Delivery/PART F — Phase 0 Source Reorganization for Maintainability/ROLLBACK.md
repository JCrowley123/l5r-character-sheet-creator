# ROLLBACK — Part F, Phase 0 (Source Reorganization for Maintainability)

## How to revert

**Delete this folder.** Nothing else is required.

```
Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/
```

Every file this phase produced lives inside it. No file outside it was created,
modified, moved or deleted.

If Part F has no other phase folders in it at the time, delete the
`Part F — Cross-Platform Delivery` wrapper too — it exists only to hold them.

## Why that is sufficient

This phase read the Part E deliverable and wrote a source tree that rebuilds it.
It never wrote back. The previous line stands exactly as it was:

| File | sha256 |
|---|---|
| `Part E — Monks/PART E — Feature 1 Monks & Kiho/l5r-character-sheet part E feature 1 MONKS.html` (trunk) | `88129d025061d60f0dc1dd80d8ac2823bc6d8d09c7cbdccb0941f4b987d56744` |
| `Part E — Monks/PART E — Feature 1.1 Monks & Kiho (Part D UI)/l5r-character-sheet part E feature 1.1 MONKS UI.html` (deliverable) | `211b4e54e876657e3c8c119486bbc649f6e0621aaca10b6f978bbc117d7f1a64` |

Verify before or after deleting:

```bash
sha256sum "Versions/Part E — Monks/PART E — Feature 1.1 Monks & Kiho (Part D UI)/l5r-character-sheet part E feature 1.1 MONKS UI.html"
```

If that matches the table, the pre-Phase-0 line is intact and Part E 1.1 still
builds from its own `splice_swipe_tabs.py` exactly as it did before.

## What rolling back costs

Nothing that existed before this phase. You lose only what this phase added:

- the split source tree under `src/`
- `build/recombine.py` and its manifest
- the QA harnesses and the recorded baselines under `qa/`

The sheet itself is unaffected either way, because this phase's output is
**byte-identical** to its input. Rolling back does not revert a behaviour change,
because there was no behaviour change to revert.

## The one thing to know before rolling back

Phase 0 opens a new trunk. Anything built **on top of** this source tree — a
later phase that edits a file under `src/` — is lost when this folder goes, the
same as any layer built on a trunk that is removed. Check whether any Part F
phase after 0 depends on this tree before deleting it.

As of this phase, nothing does: Phase 0 is the first thing in Part F.

## Restore point

The recombined output is reproducible from the fragments at any time:

```bash
cd "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability"
python3 build/recombine.py --verify
```

It prints `verify : BYTE-IDENTICAL to the pre-split build` when the tree still
reproduces `211b4e54e876657e3c8c119486bbc649f6e0621aaca10b6f978bbc117d7f1a64`.
Once a later phase deliberately changes a source file that line will report a
difference — which is correct, and the point at which `expect_sha256` in
`build/manifest.json` should be updated to the new intended hash.
