# ROLLBACK — PART G — Phase 6 School Technique Text (first release)

## Surgical removal (the method)

On a **scratch copy** of the Phase 0 tree, never the live one:

```bash
python "Versions/Part G — Combat & Roll Engine/PART G — Phase 6 School Technique Text/qa/remove-phase.py" <copy> [--dry-run] [--expect-sha SHA]
python <copy>/build/recombine.py
```

It removes exactly:

| What | Where |
|---|---|
| `src/sheet/209.999995-feat-school-technique-text.js` | the whole fragment, and its manifest entry |
| `technique-text-seam` | its one block in `210-test-seam-and-init.js` (`// PART G PHASE 6 BEGIN` … `// END TECHTEXT6`) |

- **Nothing else.** The phase rebinds no function and adds no CSS, markup or save field.
- **What the remover checks before it writes anything:**
  - The fragment must carry its own marker and no other.
  - It refuses any retained source that still names the marker or the surface: `TECHTEXT6`,
    `TECHTEXT6_ENABLED`, or a `techText6…` name.
  - It refuses the live tree, its parents, a symbolic link, and a file hard-linked to a live file.

**Measured on 2 October 2026:** removal from a scratch copy of the live tree rebuilds **byte-identical** to the build before this phase, `b17b8584…`, 3,442,633 bytes. The remover's own fixtures: 21 tests, 20 passed, 1 skipped (the symlink test).

**Kill switch:** `const TECHTEXT6_ENABLED = true;` in the fragment.

## What removing it does

- The 72 Techniques show the "not yet available" notice again on newly granted rows. The Toku
  Bushi's Rank 4 shows the notice too, because the fix layer stays.
- A saved character whose rows already hold the text keeps it. Nothing is put back.

## Saved data

None changed. The phase writes only into `TECH_DESCRIPTIONS`, in memory. Rows in saved characters
are rewritten by the fix layer, not by this phase.

## Dependencies

| On | What it uses | Without it |
|---|---|---|
| The trunk (`070-schools-paths-techniques.js`) | `TECH_DESCRIPTIONS`, `techniqueDescription`, `findSchoolTechniques`, `ALL_SCHOOL_TECHNIQUES` | Core sheet code |
| BUGFIX — Technique Name Clashes | its row rewrite on load (characters saved before this release), and its rename of the Master of Games' Technique, which frees "Forge Your Own Fate" for the Toku Bushi | Declared. Removing the fix under this phase is measured as the variant "the fix removed under it": the Path's text keeps the name, this phase's check reports the clash at load, and saved rows keep the notice. Remove this phase first |

**Who depends on this phase:** nothing yet. Phase 6's synergy detection, when built, will read
these texts.

**Removal order.** Registered last in `QA — Removal Chain Registry`, after the fix layer. The
registry as it was before this phase is in `originals/removal_chain.py`.

## Restore points

| | |
|---|---|
| Phase 0 build before this phase (with the fix layer) | `b17b8584833ce60379fd18ca5ef22b021cde041c2517a607aa0f10210fa8d31b`, 3,442,633 bytes |
| Phase 0 build before the release (`main` at `ad87cc0`) | `aa5c55d9c3563801e2f0a31b892f341558852b171839d3b646f4dc3a319b9cdb`, 3,432,964 bytes |
| Phase 0 build with this phase | `033a0bf239b9dd1c4e6e6d494cfba2c8c7092dacde82f184ae3e73cb847a19c3`, 3,464,120 bytes |
| `window.__L5R_TEST__` | two keys added: `TECHTEXT6_ENABLED`, `TECHTEXT6` |
