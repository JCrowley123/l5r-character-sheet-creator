# Phase 4.5.14 — surgical rollback

Restore point: Feature 4.5.13's own release, commit `9dd3fef0c86e4494ef5ceb75a47e502ec78d0639`,
Phase 0 build **2,704,237 bytes**, SHA-256
**`1e2683d81ddab13662f76c62ca8c595d521d633f6cc66a512169661cd85b8326`** — reproduced from that
commit before writing this fragment, and it matches Feature 4.5.13's own README figure exactly.

## Owned surface

- `src/sheet/209.926-feat-adv-fortune-blessing.js`: schema definition and chain wrappers; `FB4514`, `ADV_FORTUNE_BLESSING_ENABLED`.
- `src/css/59.9-adv-fortune-blessing.css`: this release's runtime elements only.
- Exactly one shared block in `src/sheet/210-test-seam-and-init.js`: `PART I FEATURE 4.5.14 BEGIN blessing-seam` through `END BLESSING4514 blessing-seam`. Guarded assignment after the existing seam literal.
- The two corresponding compact manifest entries. No library row, markup, dice, equipment or save-code edits.
- This folder's own `qa/current-suite-runner.js` and `qa/remove-phase.py`. Neither edits Feature 4.5.13's files; see "Chain-runner note" below.

The phase identity is dotted. It must not match `4.51`, `4.5.1`, `4.5.140`, or any neighboring
phase. The remover preflights exact blocks and rejects foreign marker contamination before
writing. It edits manifest entries surgically, never round-trips the entire JSON through a
formatter. LF is retained.

## Procedure

Run `qa/remove-phase.py <explicit scratch Phase-0 path>`, then its scratch `build/recombine.py`.
The remover refuses the live source tree and its ancestors, descendants and aliases; never use an
older phase's remover on the live tree to test its guard. Do not restore a shared-file snapshot.

Measured procedure (23 September 2026): copy the live Phase 0 tree to an external `/tmp` scratch
directory, run `python3 qa/remove-phase.py /tmp/<scratch>/phase0 --expect-sha
1e2683d81ddab13662f76c62ca8c595d521d633f6cc66a512169661cd85b8326`, then `python3
build/recombine.py --stdout` inside that scratch copy.

## Dependencies

Hard dependency: base Phase 4.5 and its extended configuration fragment (`209.8`/`209.81`) supply
the shared modal, schema registration, row helpers, resolver and config serialization. Remove
this release too before removing that base. Also a hard dependency, one level closer: this
release chains onto the SAME extended-config doorway Feature 4.5.13 (`209.925`) already wraps
(`isExtendedAdvConfigComplete`, `resolveAdvDisadvEffect`, `refreshAdvConfigControl`,
`openExtendedAdvConfigModal`, `confirmExtendedAdvConfigModal`), ordered after it in the manifest
so this release's bindings wrap 4.5.13's rather than the other way round. Removing 4.5.13 without
also removing this release would leave this release's wrappers calling into a `named4513*`
identifier chain that no longer resolves the way it did — so this release must be removed first,
or together, whenever 4.5.13 is removed. That reciprocal note belongs in 4.5.13's own ROLLBACK
too; it is not added there because this project's own rule is not to edit a previous phase's
files, so it is recorded here on this release's side of the dependency only. No later point
release depends on this one as of this writing.

Information controls use the trunk's existing `populateInfoOverlay()` host and this release's own
circled-i styling, the same pattern Feature 4.5.13 uses — no dependency on the configuration UX
release (`209.9`) for these controls.

No registry seat, no registered modifier, no money grant and no session pool. After removal, a
saved `fortuneBlessingPick` config remains inert and visibly unknown through the pre-existing
unknown-config handler (the base Phase 4.5 schema's own future-config preservation, not something
this release adds) — export characters before removing the entire base configuration system,
whose own rollback documents loss on later saves.

### Chain-runner note

Feature 4.5.13's own `qa/current-suite-runner.js` propagates its "previous" child's raw stdout
via `process.stdout.write()` before printing its own `COMBINED` summary line. Chained a second
time (from this release), that leaves two `COMBINED N/N checks passed` lines in the captured
output, and a plain first-match search picks the wrong one — measured directly: an unguarded
first-match runner reported `1109/1109` instead of the correct `1245/1245` for this release's
full chain. `BUGFIX — Negative Roll Modifier Display`'s own runner does not have this problem in
practice, because it filters a child's propagated output down to `PASS`/`FAIL` lines before
re-printing it, which is what keeps Feature 4.5.13's own regex correct one level up. This
release's `qa/current-suite-runner.js` copies that same filtering and additionally searches for
the last match rather than the first. Feature 4.5.13's file was **not** edited, per this
project's rule against modifying a previous phase — a future point release that chains a fourth
level directly onto Feature 4.5.13's runner (rather than onto this one) will hit the same gap and
should apply the same fix there.

## Proof

Measured 23 September 2026 on a scratch copy external to the live tree:

- `qa/remove-phase.py <scratch> --expect-sha 1e2683d81ddab13662f76c62ca8c595d521d633f6cc66a512169661cd85b8326` succeeded and reported exactly that hash and **2,704,237 bytes** before any file was written.
- Rebuilding that scratch copy with its own `build/recombine.py` produced a file that hashes to **exactly** `1e2683d81ddab13662f76c62ca8c595d521d633f6cc66a512169661cd85b8326` — byte-identical to Feature 4.5.13's own restore point, independently reproduced from commit `9dd3fef0c86e4494ef5ceb75a47e502ec78d0639` rather than only asserted.
- Feature 4.5.13's own `qa/current-suite-runner.js`, run against that removed, rebuilt file, reported **1,128/1,128** — matching Feature 4.5.13's own measured README figure exactly, with no owned surface left behind to inflate or deflate that count.

This release's own with-and-without numbers: current build (with this release) passes
**1,245/1,245** across the full combined chain, including this release's 117 new checks; the
removed build passes **1,128/1,128**, the same total Feature 4.5.13 measured for itself before
this release existed. No previous harness was edited.

Safety fixtures (foreign marker contamination, malformed seam/manifest, wrong `--expect-sha`,
live-tree path refusal) were not built as a separate fixture suite for this release — the
remover's own preflight logic is copied unchanged from Feature 4.5.13's proven
`qa/remove-phase.py`, whose own 45-fixture safety suite already exercises that shared logic. Only
the identity constants (marker text, fragment paths, shared-block slug, restore-point hash/bytes)
differ between the two files. Never test an older live-tree guard by executing its remover on
production.

Owned DOM names: `fortuneBlessing4514-row`, `fortuneBlessing4514-warning`,
`fortuneBlessing4514-badge`, `fortuneBlessing4514-info`, `fortuneBlessing4514-lore-wrap`,
`fortuneBlessing4514-label`, `fortuneBlessing4514-input`, `fortuneBlessing4514-error`; input IDs
`fortuneBlessing4514_<Fortune name>` (one per picker checkbox) and `fortuneBlessing4514Lore`. All
styles live in the owned stylesheet. The `fortuneBlessingPick` config type is installed at
runtime from the owned JS, not added to the catalogue or shared persistence schema, and is
independent of the Disadvantage side's own `fortunePick` type (D45). Mutation results and device
limitations are in README.md.
