# Phase 4.5.17 — surgical rollback

Restore point recorded before this release: commit `65d21069fd6ad937a67f74023fbbe308452fb706`, Phase 0 build **2,753,162 bytes**, SHA-256 **`0aefe9c90c964eb50132bd0782b433648fee31ca069d7fc3a5c35615ea98163a`**.

## Owned surface

- `src/sheet/209.929-feat-adv-wealthy-grant.js`: `W4517`, `ADV_WEALTHY_GRANT_ENABLED`; wraps `refreshAdvConfigControl`, `openExtendedAdvConfigModal`, `confirmExtendedAdvConfigModal` and `closeExtendedAdvConfigModal`; retunes 4.56's `R456.ENTRIES.Wealthy` `price`, `summary` and `note`.
- `src/css/59.93-adv-wealthy-grant.css`: `wealth4517-status`, `-text`, `-btn`, `-choice`, `-fieldset`, `-legend`, `-opt`, `-error`, and the state classes `-recorded`, `-unrecorded`, `-owed`, `-excess`, `-invalid`.
- One block in `src/sheet/210-test-seam-and-init.js`: `wealthy-grant-seam` (`END W4517`).
- Two compact manifest entries; `expect_sha256` is recomputed by the remover. Radio group `wealth4517Grant`; config key `wealth4517`.

## Procedure

`qa/remove-phase.py <explicit scratch Phase-0 path>`, then that copy's `build/recombine.py`. Never run any remover against the live tree.

## Dependencies

- **Hard dependency on Feature 4.56 (Rank Entries)**: `R456` and its mutable Wealthy entry. Remove this release first. Declared in 4.56's ROLLBACK. (4.56's own remover carries the dead `parents[3]` live-tree guard documented in CLAUDE.md; use only on an explicit scratch copy.)
- **Hard dependency on base Phase 4.5**: config read/write, the shared modal, `commitExtendedAdvConfig`. Declared in the base ROLLBACK.
- **No dependency on 4.5.13–4.5.16** in either direction; measured against 4.5.16 in both removal orders.
- **Cross-phase fixture corrections** in 4.56's harness: `RANKS456-W-06`, `RANKS456-KOKU-01`, `RANKS456-KOKU-02` now follow this release's presence (see README). 29/29 with and without it.

No registry seat, roll modifier, markup or top-level save change.

## What removal does to characters and money

- **Money already added stays.** Removal never subtracts koku.
- **Records stay in saved configs.** 4.56 ignores the extra `wealth4517` field, so rows still price and render. Re-installing this release reads the record and does not grant again (the same state `W-PERSISTENCE` and `W-OWED` load); if the Rank changed meanwhile, the row offers only the difference, or Return/Keep.
- **Pricing returns to 4.56's arithmetic**: Rank 1 for a Crane, Unicorn or Imperial character goes back to 0 XP, which contradicts Core p.149. That is 4.56's known behaviour, not a removal defect.

## Proof

Measured 23 September 2026: the 2,767,985-byte build (`be9076cfbebc3fac31641a03fab82508b35a7c06caf961e347e546151930115a`) removes to **exactly 2,753,162 bytes**, `0aefe9c9…`; the removed copy verifies; **1,497/1,497** retained checks pass on those bytes. Live **1,584/1,584**. With 4.5.16 removed first: this suite 87/87 and older suites 1,406/1,406; both removed in either order: byte-identical to `1d8aa345b8c054cca212bd57a57acb49cb593bf4b7805cec0438a171537a70e4`. Fixtures 45/45, no skips. Inventory unchanged; seven registry seats.
