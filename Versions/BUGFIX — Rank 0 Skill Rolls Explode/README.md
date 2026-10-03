# Rank 0 Skill Rolls Explode

Built on `codex/phase-4-5-26-dice-entries` from main `6e6da0b`, 2 October 2026.
Merged on the owner's word, 3 October 2026 (`main` at `72523fe`, fix commit
`b9a03bc`). Deployed-page harness: 19/19. Owner's iPhone confirmation still owed.

Untrained Skill-table rolls and untrained weapon attacks now leave 10s unexploded,
matching the Untrained Skills list. A trained roll, Soul of Artistry's effective
Rank 1, and the preview's Void Rank 0-to-1 option still explode normally. Trait,
Ring, Spell and manual rolls are unaffected. Core Rulebook, Unskilled Rolls (p. 80).

The fix wraps `rollWithModifiers` at the common Skill/Attack entry point. It does
not alter the base die generator or any saved Rank. Its own fragment is
`209.999997-bugfix-rank-zero.js`, its marker is `BUGFIX RANKZERO`, its switch is
`RANKZERO_ENABLED`, and its only shared block is `rank-zero-seam` in `210`.

## Verification

- Focused browser harness: 14/19 before production changes; 19/19 after the fix.
  The five original failures were the table/direct die results and descriptions,
  and the untrained attack. The existing list path was already correct.
- Five deliberately broken variants: discovery followed by a pinned rerun,
  all matching `qa/expected-failures.json`. The Play/Management feature disabled
  boundary remains 19/19.
- Removal fixtures: 20 passed, one Windows symlink fixture skipped.
- The combined release's full-suite result is recorded in the Dice Rolling
  Entries README. This folder's runner adds these 19 checks to the preceding
  3,711-check runner.
- No retained harness has been changed for this fix.

Before: 3,479,860 bytes, SHA-256
`319f4f48b81b132b696fdf0bfcf330e2ce9fb2faa6d45b5b6fb03c0556c80f7c`.
Fix alone: 3,480,934 bytes, SHA-256
`8508e42f51a3c28bb3415557309d323a9448997b12d56e66d9ea56207cd65178`.
Removal restores the before build exactly.

Run `node qa/rank-zero-harness.js <sheet.html>`, `python -B qa/test-removal.py`,
and `python -B qa/verify-variants.py --jobs 3`. Playwright must be installed in
the QA tools directory; use the laptop environment described in the kickoff.

See [ROLLBACK.md](ROLLBACK.md) for removal and the companion release's
`MANUAL-TESTS.md` for the combined device check.
