# Phase 4.5.20 — surgical rollback

Restore point recorded before this release: commit `46b15b41a199f2f227f39dd83b1a5ab49155bc67`, Phase 0 build **2,798,717 bytes**, SHA-256 **`2b69794dcd3bf9d70b8a1676a4f9cb734cf1f4b0ecf7d40b0396d0bae8ef0c3e`**.

## Owned surface

- `src/sheet/209.9297-feat-adv-void-versatility.js`: `VV4520`, `ADV_VOID_VERSATILITY_ENABLED`; registers the `Void Versatility` schema (`voidVersatilityRing`, effect `vv4520SlotSource`); wraps `isExtendedAdvConfigComplete`, `resolveAdvDisadvEffect`, `refreshAdvConfigControl`, `openExtendedAdvConfigModal`, `confirmExtendedAdvConfigModal`, `advConfigExtendedRollModifiers`, the trunk's **`castSpell`** (outside Phase 4.5.2's own Willpower-gate rebinding) and **`rollWithModifiers`**; registers casting diagnostic `void-versatility`; rebinds Feature 4.5.5's `R455.ineligible` by property.
- `src/css/59.96-adv-void-versatility.css`: `vv4520-picker`, `-legend`, `-option`, `-error`, `-row`, `-badge`, `-warning`, `-reminder`, `-info`, `-inactive`.
- One block in `src/sheet/210-test-seam-and-init.js`: `void-versatility-seam` (`END VV4520`).
- Two compact manifest entries; `expect_sha256` is recomputed by the remover. Radio group `vv4520Ring`; row dataset key `vv4520Name`; roll-context key `vv4520`.

## Procedure

`qa/remove-phase.py <explicit scratch Phase-0 path>`, then that copy's `build/recombine.py`. Never run any remover against the live tree. The two retained-harness corrections below are conditional and need no edit on removal.

## Dependencies

- **Hard dependency on base Phase 4.5** (`209.8`, `209.81`): schema registration, config read/write, row helper, shared modal, `commitExtendedAdvConfig`, the adv-config seat and the hooks it wraps. Declared in the base ROLLBACK.
- **Trunk:** `castSpell`, `performSpellCastRoll`, `renderSpellPips`, `rollWithModifiers`, `appConfirm3Way`/`appConfirm`/`appAlert`, `RINGS`, `characterCasterLock`, `getActiveSchoolElementalProfile`, the spell-slot counters, the info overlay, `setStatus`.
- **Soft, guarded extensions of three removable phases** — each is skipped when that phase is absent, and none is edited:
  - **Phase 8 (Part J):** registers a casting diagnostic that lifts `no-slots`. Without Phase 8 there is simply no diagnostic. Declared in Phase 8's ROLLBACK.
  - **Feature 4.5.5:** extends `R455.ineligible` so the picker greys the entry out. Without 4.5.5 the row still explains ineligibility and no payment choice is offered. Declared in 4.5.5's ROLLBACK.
  - **Feature 4.5.2:** reads `D45G.busy()` so the Ring path refuses a second cast while a Willpower check is pending, as `castSpell` already does. Without 4.5.2, never busy.
- **Cross-phase fixture corrections (declared):** Phase 8's registry-list check and 4.5.5's `GATES455-GATE-04` are conditional on `window.__L5R_TEST__.VV4520`. Both pass with this release present (1,822/1,822) and removed (1,756/1,756).
- **No dependency on 4.5.13–4.5.19**; measured against 4.5.19 in both removal orders.

No registry seat, markup, or top-level save change.

## What removal does to characters

Measured on the removed build: the saved Ring stays in the row's config byte-for-byte and the row shows Phase 4.5.3's "Saved setting kept — this build cannot show it"; the row keeps its 4 XP. Void spells go back to Void slots and the Bonus pool only. Slots already spent from a Ring stay spent (they are ordinary counters, restorable by hand). Re-installing reads the saved Ring back as configured.

## Proof

Measured 23 September 2026: the 2,820,250-byte build (`106833069f5bf72a69b185b9d29c85c7f0d1cbf6748bff2195a2581b5d1e8e79`) removes to **exactly 2,798,717 bytes**, `2b69794d…`; the removed copy verifies; **1,756/1,756** retained checks pass on those bytes. Live **1,822/1,822**. With 4.5.19 removed first: this suite 66/66 and older suites 1,664/1,664; both removed in either order: byte-identical to `96dda731ef0cf9670fe2c65763bf28e2a73698972e7d8f49014ac598c728385a` (2,780,550 bytes). Fixtures 45/45, no skips. Inventory unchanged; seven registry seats.
