# Phase 4.5.15 — surgical rollback

Restore point recorded before this release: commit `0055ec53fa71b22ab0e71127bb869fd2c092ef6f`, Phase 0 build **2,730,118 bytes**, SHA-256 **`61de1d40772cb00abba41f7ab5d2d151027b3554545d04e4f8bf127d39adaa48`**.

## Owned surface

- `src/sheet/209.927-feat-roll-declarations.js`: `RD4515`, `ROLL_DECLARATIONS_ENABLED`, the four preview functions `rd4515PreviewStart`/`Cancel`/`Toggle`/`Html`, and the captured-then-wrapped `advConfigExtendedRollModifiers`.
- `src/css/59.91-roll-declarations.css`: `.rd4515-declare`, `.rd4515-head`, `.rd4515-source`, `.rd4515-opt`, `.rd4515-opt-note`, `.rd4515-note`.
- Four delimited blocks in Phase 3's (Part G) `src/sheet/208-feat-roll-preview.js`: `PART I FEATURE 4.5.15 BEGIN preview-start|preview-cancel|preview-html|preview-toggle` through `END DECL4515 <slug>`, each directly after 4.5.11's matching block.
- One block in `src/sheet/210-test-seam-and-init.js`: `roll-declarations-seam`.
- The two compact manifest entries; the remover recomputes `expect_sha256`. Markup attribute `data-rd4515-key` is generated at runtime.

## Procedure

`qa/remove-phase.py <explicit scratch Phase-0 path>`, then that copy's `build/recombine.py`. It refuses the live tree and aliases, preflights all five blocks, and refuses foreign markers inside any of them. `qa/verify-variants.py --node <node> --retained` performs and measures the whole proof in temporary copies. Never test an older remover against the live tree.

## Dependencies

- **Hard dependency on base Phase 4.5**: the `adv-config` registry seat and `advConfigExtendedRollModifiers`, plus `ADV_CONFIG_ENABLED`/`ADV_CONFIG_ROLL_EFFECTS_ENABLED`. Remove this release before that base; the reciprocal note is in the base ROLLBACK.
- **Soft dependency on Phase 3 (Part G)**, which hosts the four hooks. Without the preview nothing is ever offered or armed, so nothing applies; every hook is a `typeof` guard. This is by construction and was **not** measured by removing Phase 3. The reciprocal note is in Phase 3's ROLLBACK.
- **No dependency on 4.5.14**, in either direction — measured by removing them in both orders.
- **Later dependents:** any release that registers a provider. The first planned is 4.5.16 Heart of Vengeance; it must declare this dependency and be removed first (or it simply stops offering its option, since `RD4515` would be undefined behind its guard).
- **Actual dependent — Phase 4.5.16 Heart of Vengeance (23 September 2026).** It registers provider `heart-vengeance`. This release's remover refuses while that fragment exists (measured: exit 2, names it, writes nothing), so remove 4.5.16 first; then this remover rebuilds byte-identical to `61de1d40…`. `feature-dependencies.py` for this release now exits 1 with exactly those two references. This release's harness carries one fixture correction declared by 4.5.16: `RD-NO-PRODUCTION-PROVIDER` ignores `heart-vengeance` only while `HV4516` is present.

No saved state, no registry seat, no markup file edit.

## Proof

Measured 23 September 2026 on the final tree: the 2,739,496-byte build (`1d8aa345b8c054cca212bd57a57acb49cb593bf4b7805cec0438a171537a70e4`) removes to **exactly 2,730,118 bytes**, `61de1d40…`; the removed copy verifies; **1,353/1,353** retained checks pass on those bytes. Live: **1,406/1,406**. With 4.5.14 removed first: this suite 53/53 and older suites 1,128/1,128; both removed in either order: byte-identical to `1e2683d81ddab13662f76c62ca8c595d521d633f6cc66a512169661cd85b8326`. Fixtures 47/47, no skips. Inventory unchanged; seven registry seats. Mutation results are in README.md.

## Later dependent — Seven Fortunes' Blessing (Feature 4.5.21; 23 September 2026)

That release registers the `fortune-blessing` provider (Benten, Ebisu, Jurojin and Hotei's +10
declarations). Remove it before this registry; this phase's remover refuses while its fragment is
present (measured). `RD-NO-PRODUCTION-PROVIDER` now also sets aside `fortune-blessing` when
`window.__L5R_TEST__.FB4521` is present, and passes both ways — declared in that release's ROLLBACK.
