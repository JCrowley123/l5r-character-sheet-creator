# Phase 4.5.13 — surgical rollback

Restore point recorded before this fresh batch: commit `6005faecac2e5e671d9c4a2bb45f24ba60044db7`, Phase 0 build **2,689,172 bytes**, SHA-256 **`c7063f52269c306fcd6596e2103518ff27d4a57b01b0db031115dbb59c58ca15`**. The intervening source-note commit `9a11267` changes no built bytes.

## Owned surface

- `src/sheet/209.925-feat-adv-named.js`: schema definitions and wrappers; `N4513`, `ADV_NAMED_ENTRIES_ENABLED`.
- `src/css/59.8-adv-named.css`: this release's runtime elements only.
- Exactly one shared block in `src/sheet/210-test-seam-and-init.js`: `PART I FEATURE 4.5.13 BEGIN named-advantages-seam` through `END NAMED4513 named-advantages-seam`. Guarded assignment after the existing seam literal.
- The two corresponding compact manifest entries. No library row, markup, dice, equipment or save-code edits.

The phase identity is dotted. It must not match `4.51`, `4.5.1`, `4.5.130`, or any neighboring phase. The remover preflights exact blocks and rejects foreign marker contamination before writing. It edits manifest entries surgically, never round-trips the entire JSON through a formatter. LF is retained.

## Procedure

Run `qa/remove-phase.py <explicit scratch Phase-0 path>`, then its scratch `build/recombine.py`. The remover refuses the live source tree and its ancestors, descendants and aliases; never use an older phase's remover on the live tree to test its guard. Do not restore a shared-file snapshot.

`qa/verify-variants.py --node <node executable> --retained` creates the scratch copies and compares the removed output to the pinned restore bytes, then runs the pre-release suite. Deleting this release's documentation/QA folder is the final administrative step only after source removal has been verified.

## Dependencies

Hard dependency: base Phase 4.5 and its extended configuration fragment (`209.8`/`209.81`) supply the shared modal, schema registration, row helpers, resolver and config serialization. Remove this batch too before removing that base. No earlier point release depends on this one.

Information controls use the trunk's existing `populateInfoOverlay()` host and this release's own circled-i styling. There is no dependency on the configuration UX release (`209.9`) for these controls. The older repair and schema-3 adapters remain as found; future-config preservation is owned here for these four names and nowhere else. The reciprocal dependency is recorded in the base configuration phase's ROLLBACK.

No registry seat, no registered modifier, no money grant and no session pool. After removal, new saved config types must remain inert and visibly unknown through the pre-existing unknown-config handler; export characters before removing the entire base configuration system, whose own rollback documents loss on later saves.

## Proof

The final 2,704,237-byte build (`1e2683d81ddab13662f76c62ca8c595d521d633f6cc66a512169661cd85b8326`) removes and rebuilds to **exactly 2,689,172 bytes**, SHA-256 `c7063f52269c306fcd6596e2103518ff27d4a57b01b0db031115dbb59c58ca15`. The manifest's compact shape and LF source endings survive. Structural inventory has no differences; the seven-seat registry is unchanged.

Every retained suite passes **992/992** on the removed bytes. The current build passes **1,128/1,128**, including 136 new checks. No previous harness was edited. The retained removal-suite run used an earlier iteration's removed output; final-tree removal was separately compared and produced identical bytes, not merely the same test count.

Safety fixtures: 45 tests, 43 passed, 2 Windows real-symlink cases skipped because the OS denied link creation. Portable mocked alias checks and the real hard-link case passed. Foreign marker, malformed seam/manifest, wrong restore hash and live-tree path cases refuse without source writes. Never test an older live-tree guard by executing its remover on production.

Owned DOM names: `named4513-row`, `named4513-warning`, `named4513-badge`, `named4513-info`, `named4513-label`, `named4513-input`, `named4513-error`, `data-named4513-name`; input IDs `named4513Target`, `named4513Status`, `named4513Subject`, `named4513Notes`, `named4513Item`, `named4513Region`. All styles live in the owned stylesheet. Config types are installed at runtime from the owned JS, not added to the catalogue or shared persistence schema. Mutation results and device limitations are in README.md.
