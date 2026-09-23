# Phase 4.5.22 — surgical rollback

Restore point recorded before this release: commit `436372ad4e0782417c4efcb7dd20f3a342b3c7ee`, Phase 0 build **2,846,031 bytes**, SHA-256 **`9c749b7dc9c45fc5829f8db3172067d91ced54833e734da4f245d3ddb08528d0`**.

## Owned surface

- `src/sheet/209.9299-feat-adv-naishou-citizen.js`: `NC4522`, `ADV_NAISHOU_CITIZEN_ENABLED`; wraps `FB4521.price` (by property, looked up at call time), `refreshAdvConfigControl` and `openExtendedAdvConfigModal`. No schema, no saved config, no registry seat, no roll hook.
- `src/css/59.98-adv-naishou-citizen.css`: `nc4522-row`, `-badge`, `-warning`, `-reminder`, `-info`, `-blessing-note`.
- One block in `src/sheet/210-test-seam-and-init.js`: `naishou-citizen-seam` (`END NC4522`).
- Two compact manifest entries; `expect_sha256` is recomputed by the remover.

## Procedure

`qa/remove-phase.py <explicit scratch Phase-0 path>`, then that copy's `build/recombine.py`. Never run any remover against the live tree. No retained harness was changed for this release.

## Dependencies

- **Hard dependency on Feature 4.5.21 (Seven Fortunes' Blessing).** The discount extends `FB4521.price`, and the reminder names `FB4521.active()`'s Fortune. Guarded: with 4.5.21 absent or switched off, `NC4522.enabled()` is false and nothing is wrapped. **Removal order: this release first.** 4.5.21's own remover **refuses** while this fragment is present (measured: its retained-source scan finds `FB4521` here), writing nothing. Declared in 4.5.21's ROLLBACK.
- **Through 4.5.21, on base Phase 4.5** (`209.8`, `209.81`): `advConfigRowFor`, `normalizeAdvName`, `advConfigExtendedModal`, the wrapped hooks. Declared in the base ROLLBACK.
- **Trunk:** the info overlay (`populateInfoOverlay`).
- **Nothing else:** no dependency on 4.5.13–4.5.20 or on 4.5.15's registry (the Free Raise is a reminder, not a declaration).

## What removal does to characters

Measured on the restore-point build with a Crane character holding Benten's Blessing and Naishou Citizen: the Blessing returns to its own price (2 → **3 XP**), XP spent rises by one (5 → **6**), and the Naishou Citizen row stays as a plain 3-XP entry with no row beneath it. The saved data is otherwise identical: this release never writes a config, and the Blessing's own config is untouched.

## Proof

See the README's measured QA for the byte-identical removal, the 4.5.21 refusal and the two-step removal to 4.5.20's restore point.
