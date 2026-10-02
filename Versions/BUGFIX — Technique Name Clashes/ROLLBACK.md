# ROLLBACK — BUGFIX — Technique Name Clashes

## Surgical removal (the method)

On a **scratch copy** of the Phase 0 tree, never the live one:

```bash
python "Versions/BUGFIX — Technique Name Clashes/qa/remove-phase.py" <copy> [--dry-run] [--expect-sha SHA]
python <copy>/build/recombine.py
```

**Remove Phase 6's first release first** (`Part G — Combat & Roll Engine/PART G — Phase 6 School
Technique Text/`). It depends on this fix (below). The shared removal chain does this for you:
`strip_later(tree, after="BUGFIX — Technique Name Clashes")` removes it first.

It removes exactly:

| What | Where |
|---|---|
| `src/sheet/209.999994-bugfix-technique-name-clashes.js` | the whole fragment, and its manifest entry |
| `technique-names-seam` | its one block in `210-test-seam-and-init.js` (`// BUGFIX TECHNAMES BEGIN` … `// END TECHNAMES`) |

- **Nothing else.** The fix adds no CSS, markup or save field, and it edits no other source.
- **The rebound trunk functions.** It rebinds `unlockTechniques()` and `applyData()`; deleting the
  fragment leaves the bindings it wrapped in force.
- **What the remover checks before it writes anything:**
  - The fragment must carry its own marker and no other.
  - It refuses any retained source that still names the marker or the surface: `TECHNAMES`,
    `TECHNAMES_ENABLED`, or a `techNames…` name.
  - It refuses the live tree, its parents, a symbolic link, and a file hard-linked to a live file.

**Measured on 2 October 2026:** removing Phase 6, then this fix, from a scratch copy of the live tree rebuilds **byte-identical** to the build before the fix, `aa5c55d9…`, 3,432,964 bytes. The remover's own fixtures: 21 tests, 20 passed, 1 skipped (the symlink test; Windows refuses symlinks without Developer Mode).

**Kill switch:** `const TECHNAMES_ENABLED = true;` in the fragment. With it off, nothing is rebound,
renamed or checked (see the variants in the README).

## What removing it does

- A Rank 5 Doji Courtier is shown the monk's tattoo Technique again.
- The Master of Games' Technique is named "Forge Your Own Fate" again. With Phase 4.6 present,
  a Toku Bushi's Rank 4 shows the Path's text again.
- A character whose rows the fix rewrote keeps the new text. Nothing is put back: the rows hold text
  the player could have typed.

## Saved data

No field is added and no field changes shape. The one thing the fix writes is the description text
of a School Technique row. It writes only when the row still holds text the sheet itself wrote, and
that text is now known to be wrong or missing (the owner's ruling, 2 October 2026). The character's
stored copy changes only at its next save.

## Dependencies

| On | What it uses | Without it |
|---|---|---|
| The trunk (`070-schools-paths-techniques.js`, `120-persistence.js`) | `unlockTechniques`, `applyData`, `techniqueDescription`, `findSchoolTechniques`, `ALL_SCHOOL_TECHNIQUES`, `TECH_DESCRIPTIONS`, `ALTERNATE_PATH_LIBRARY` | Core sheet code; not removable on its own |
| Phase 4.6 (Part I) | the Master of Games Path in `ALTERNATE_PATH_LIBRARY` | Soft: with Phase 4.6 switched off there is no Path to rename. Measured in the boundary build, which reads fully green |
| Phase 11 (Part K) | none directly. Its load wrapper calls `applyData()`, so the rewrite happens before the Characters list marks the character saved | Without Phase 11, `applyData()` still rewrites the rows |

**Who depends on this fix:** Phase 6's first release (Part G). Its texts reach characters saved
before it only through this fix's row rewrite, and the Toku Bushi's Rank 4 is free for its text only
because of this fix's rename. With this fix removed and Phase 6 present, Phase 6's load check
reports the clash on "Forge Your Own Fate" and keeps the Path's text (measured in its variants).
Remove Phase 6 first.

**Retained harness changed:** `PART I — Phase 4.6 Alternate Paths/qa/alternate-paths-harness.js`.
Its R3LOAD scenario expects the renamed Technique only when `TECHNAMES` is present. With this fix
removed it expects the old name, as before. The file as it was is in `originals/`.

**Removal order.** Registered in `QA — Removal Chain Registry` after Phase 4.6 (Part I) and before
Phase 6 (Part G). The registry as it was before this fix is in `originals/removal_chain.py`.

## Restore points

| | |
|---|---|
| Phase 0 build before this fix | `aa5c55d9c3563801e2f0a31b892f341558852b171839d3b646f4dc3a319b9cdb`, 3,432,964 bytes (`main` at `ad87cc0`) |
| Phase 0 build with this fix (without Phase 6) | `b17b8584833ce60379fd18ca5ef22b021cde041c2517a607aa0f10210fa8d31b`, 3,442,633 bytes |
| `window.__L5R_TEST__` | two keys added: `TECHNAMES_ENABLED`, `TECHNAMES` |
