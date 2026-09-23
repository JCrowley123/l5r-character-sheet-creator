# Phase 4.5.14 — surgical rollback

Restore point recorded before this batch: commit `9dd3fef0c86e4494ef5ceb75a47e502ec78d0639`, Phase 0 build **2,704,237 bytes**, SHA-256 **`1e2683d81ddab13662f76c62ca8c595d521d633f6cc66a512169661cd85b8326`**. Removal returns to that build, not to an older baseline.

## Owned surface

- `src/sheet/209.926-feat-adv-court-servant.js`: `CS4514`, `ADV_COURT_SERVANT_ENABLED`, the Darling of the Court schema registration, and five captured-then-wrapped hooks (`isExtendedAdvConfigComplete`, `resolveAdvDisadvEffect`, `refreshAdvConfigControl`, `openExtendedAdvConfigModal`, `confirmExtendedAdvConfigModal`). Ordered after 209.925, so it wraps Feature 4.5.13's bindings and is the outermost refresh wrapper.
- `src/css/59.9-adv-court-servant.css`: this release's runtime elements only.
- Exactly one shared block in `src/sheet/210-test-seam-and-init.js`: `PART I FEATURE 4.5.14 BEGIN court-servant-seam` through `END CS4514 court-servant-seam`, a guarded assignment after the seam literal, directly after 4.5.13's block.
- The two compact manifest entries, and the manifest's `expect_sha256`, which the remover recomputes from the remaining fragments rather than forcing a baseline. No library row, markup, dice, equipment or save-code edit.

Owned DOM names: `court4514-editor`, `court4514-list`, `court4514-item`, `court4514-label`, `court4514-input`, `court4514-remove`, `court4514-add`, `court4514-error`, `court4514-row`, `court4514-badge`, `court4514-warning`, `court4514-info`, `court4514-controls`, `court4514-courts`, `court4514-legend`, `court4514-court`, `court4514-court-selected`, `court4514-session`, `court4514-session-box`, `court4514-status`, `court4514-active`, `servant4514-row`, `servant4514-badge`, `servant4514-warning`, `servant4514-info`; data attributes `data-cs4514-name`, `data-court4514-origin`; runtime IDs `court4514Court<n>` and radio group names `court4514-select-<n>`; config type `courtList`. All styles live in the owned stylesheet; the config type is registered at runtime from the owned JS.

The identity is dotted: `4.5.14` must not match `4.5.1`, `4.51`, `4.5.140` or any neighbour — a fixture proves it. The remover preflights every block and refuses foreign-marker contamination before writing; it edits manifest entries surgically and keeps LF.

## Procedure

Run `qa/remove-phase.py <explicit scratch Phase-0 path>`, then that copy's `build/recombine.py`. The remover refuses the live tree and its ancestors, descendants and aliases. Never test any older remover against the live tree to watch it refuse. Do not restore a shared-file snapshot.

`qa/verify-variants.py --node <node> --retained` creates the scratch copies, compares the removed output to the pinned restore bytes and runs every retained suite on it, then proves removal order with 4.5.13. Delete this documentation/QA folder only after source removal has been verified.

## Dependencies

**Hard dependency on base Phase 4.5** and its extended configuration fragment (`209.8`/`209.81`): schema registration, `readAdvConfig`/`writeAdvConfig`, `advConfigRowFor`, the shared modal host and `commitExtendedAdvConfig`, and the hooks this release wraps. Remove this release before removing that base; the reciprocal note is in the base Phase 4.5 ROLLBACK.

**No dependency on Phase 4.5.13 in either direction.** This release captures whichever binding precedes it, so it works with 4.5.13 present or removed, and 4.5.13's remover still works with this release present. Both are measured, not asserted: see README "Removal order". Its harness uses base 4.5's Elemental Blessing, not a 4.5.13 entry, for the rename check.

**Trunk only otherwise:** `getSchoolsList()` (Courtier test), `populateInfoOverlay()` (information overlay), `normalizeAdvName()`, `recalcAll()`, `setStatus()`, `#f_statusRank`. The configuration UX release (`209.9`) and the Disadvantage system sit below this wrapper and never see its rows; there is no dependency on either.

No registry seat, registered modifier, money grant, session pool, Status write or dice change.

**Saved characters after removal.** A saved `courtList` becomes an unknown config type; Feature 4.5.3's existing handler preserves it untouched with "Saved setting kept — this build cannot show it", and the row keeps its saved cost. Servant rows are unaffected (nothing was ever written). Export characters before removing the whole base configuration system, whose own rollback documents what later saves lose.

## Proof

Measured 23 September 2026 on the final frozen tree. The 2,730,118-byte build (`61de1d40772cb00abba41f7ab5d2d151027b3554545d04e4f8bf127d39adaa48`) removes and rebuilds to **exactly 2,704,237 bytes**, SHA-256 `1e2683d81ddab13662f76c62ca8c595d521d633f6cc66a512169661cd85b8326` — the restore point above — and the removed copy's `recombine.py --verify` exits 0. Structural inventory has no differences; the registry stays at seven seats.

Every retained suite passes **1,128/1,128** on those exact removed bytes. The live build passes **1,353/1,353** (992 + 136 + 225). No previous harness was edited.

Removal order with 4.5.13, all in scratch copies: with 4.5.13 removed and this release kept, this release's suite passes **225/225** and the pre-4.5.13 suites **992/992**; removing both, in either order, rebuilds **byte-identical** to 4.5.13's own restore point (2,689,172 bytes, `c7063f52269c306fcd6596e2103518ff27d4a57b01b0db031115dbb59c58ca15`).

Saved data across removal: `qa/saved-after-removal.js` passes **13/13** (preserved, flagged, cost kept, survives a re-save, reads back on the live build) and fails 10/13 when given the wrong build.

Safety fixtures: **45 run, 45 passed, 0 skipped** on Linux, including the two real-symlink cases Windows had to skip for 4.5.13. Foreign markers, malformed seam or manifest, a wrong required hash, traversal paths, symlinked or hard-linked targets, unmanifested surface leaks and the live-tree path all refuse without writing. `feature-dependencies.py` exits 0 for this release and still exits 0 for 4.5.13. Mutation results are in README.md.
