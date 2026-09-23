# Phase 4.5.19 — surgical rollback

Restore point recorded before this release: commit `fe20e753756d8623c5a8f86de63ee341d9595476`, Phase 0 build **2,780,550 bytes**, SHA-256 **`96dda731ef0cf9670fe2c65763bf28e2a73698972e7d8f49014ac598c728385a`**.

## Owned surface

- `src/sheet/209.9296-feat-adv-soul-artistry.js`: `SA4519`, `ADV_SOUL_ARTISTRY_ENABLED`; registers the `Soul of Artistry` schema (`skillFamilyPick`, effect `sa4519Lift`); wraps `isExtendedAdvConfigComplete`, `resolveAdvDisadvEffect`, `refreshAdvConfigControl`, `openExtendedAdvConfigModal`, `confirmExtendedAdvConfigModal`, `advConfigExtendedRollModifiers` and **`rollWithModifiers`** (outside Phase 4.5.2's own Willpower-gate rebinding, which it delegates to).
- `src/css/59.95-adv-soul-artistry.css`: `sa4519-picker`, `-legend`, `-option`, `-error`, `-row`, `-badge`, `-warning`, `-reminder`, `-info`.
- One block in `src/sheet/210-test-seam-and-init.js`: `soul-artistry-seam` (`END SA4519`).
- Two compact manifest entries; `expect_sha256` is recomputed by the remover. Radio group `sa4519Family`; row dataset key `sa4519Name`; roll-context key `sa4519`.

## Procedure

`qa/remove-phase.py <explicit scratch Phase-0 path>`, then that copy's `build/recombine.py`. Never run any remover against the live tree.

## Dependencies

- **Hard dependency on base Phase 4.5** (`209.8`, `209.81`): schema registration, config read/write, row helper, shared modal, `commitExtendedAdvConfig`, `advConfigCharacterClan`, `ADV_CONFIG_ROLL_EFFECTS_ENABLED`, the adv-config registry seat, and the hooks it wraps. Declared in the base ROLLBACK.
- **Trunk:** `rollWithModifiers`, `ROLL_KINDS`, `getSchoolsList`, the info overlay, `setStatus`.
- **Reads, does not depend on:** Phase 3's (Part G) preview, Phase 4's (Part G) breakdown and the Void offer list all see the rewritten Rank 1 context; none is edited. Removing one of them alongside this release was not measured here.
- **No dependency on 4.5.13–4.5.18** in either direction; measured against 4.5.18 in both removal orders. The Courtier test duplicates 4.5.14's on purpose.

No registry seat, markup, cross-phase fixture correction or top-level save change.

## What removal does to characters

Measured on the removed build: the saved family stays in the row's config byte-for-byte and the row shows Phase 4.5.3's "Saved setting kept — this build cannot show it"; the row keeps its saved cost (3 or 4). Matching Unskilled rolls go back to Trait k Trait. Re-installing reads the saved family back as configured. Nothing else on the character was changed by this release.

## Proof

Measured 23 September 2026: the 2,798,717-byte build (`2b69794dcd3bf9d70b8a1676a4f9cb734cf1f4b0ecf7d40b0396d0bae8ef0c3e`) removes to **exactly 2,780,550 bytes**, `96dda731…`; the removed copy verifies; **1,664/1,664** retained checks pass on those bytes. Live **1,756/1,756**. With 4.5.18 removed first: this suite 92/92 and older suites 1,584/1,584; both removed in either order: byte-identical to `be9076cfbebc3fac31641a03fab82508b35a7c06caf961e347e546151930115a` (2,767,985 bytes). Fixtures 45/45, no skips. Inventory unchanged; seven registry seats.
