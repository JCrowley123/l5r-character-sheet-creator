# Phase 4.5.16 — surgical rollback

Restore point recorded before this release: commit `45d0f489081de3c5740c60b74afb0714396b6a6d`, Phase 0 build **2,739,496 bytes**, SHA-256 **`1d8aa345b8c054cca212bd57a57acb49cb593bf4b7805cec0438a171537a70e4`**.

## Owned surface

- `src/sheet/209.928-feat-adv-heart-vengeance.js`: `HV4516`, `ADV_HEART_VENGEANCE_ENABLED`, the schema registration, five captured-then-wrapped config hooks, and the registration of provider `heart-vengeance` with `RD4515`.
- `src/css/59.92-adv-heart-vengeance.css`: `hv4516-editor`, `hv4516-label`, `hv4516-input`, `hv4516-error`, `hv4516-row`, `hv4516-badge`, `hv4516-warning`, `hv4516-info`.
- One block in `src/sheet/210-test-seam-and-init.js`: `heart-vengeance-seam` (`END HV4516`).
- Two compact manifest entries; `expect_sha256` is recomputed by the remover. Runtime IDs `hv4516Faction`, `hv4516Suggestions`; data attribute `data-hv4516-name`; config type `factionPick`.

## Procedure

`qa/remove-phase.py <explicit scratch Phase-0 path>`, then that copy's `build/recombine.py`. Never run any remover against the live tree.

## Dependencies

- **Depends on 4.5.15 (Roll Declaration Registry)** for the roll-time option. Declared both ways. The registration is `typeof`-guarded, so without 4.5.15 the rival is still recorded and priced and nothing is offered at roll time. **Removal order: this release first, then 4.5.15.** 4.5.15's remover enforces it — measured: it refuses while this fragment exists, naming it, and writes nothing.
- **Hard dependency on base Phase 4.5** (schema registration, config read/write, shared modal, `commitExtendedAdvConfig`); reciprocal note in the base ROLLBACK.
- Trunk only otherwise: `FAMILY_LIBRARY`, `MINOR_CLAN_LIBRARY` (suggestions, guarded), `populateInfoOverlay`, `advConfigCharacterClan`, `ROLL_KINDS`.
- **Cross-phase fixture correction** in 4.5.15's harness: `RD-NO-PRODUCTION-PROVIDER` now ignores `heart-vengeance` only while `HV4516` exists. Passes with this release present (1,497/1,497) and on the removed bytes (4.5.15 alone, 53/53).

No registry seat, no saved declaration, no Status or dice-engine change.

**Saved characters after removal:** a saved `factionPick` becomes an unknown config type, preserved by Feature 4.5.3's handler. Measured on the removed build: "Saved setting kept — this build cannot show it", saved cost (4) retained, config unchanged after a re-save, nothing offered at roll time.

## Proof

Measured 23 September 2026: the 2,753,162-byte build (`0aefe9c90c964eb50132bd0782b433648fee31ca069d7fc3a5c35615ea98163a`) removes to **exactly 2,739,496 bytes**, `1d8aa345…`; the removed copy verifies; **1,406/1,406** retained checks pass on those bytes. Live **1,497/1,497**. This release then 4.5.15: byte-identical to `61de1d40772cb00abba41f7ab5d2d151027b3554545d04e4f8bf127d39adaa48`. Fixtures 45/45, no skips. Inventory unchanged; seven registry seats.

## Cross-phase fixture correction — Seven Fortunes' Blessing (Feature 4.5.21; 23 September 2026)

`HV-PROVIDER-REGISTERED` asserted the registry's provider list was exactly `['heart-vengeance']`.
Feature 4.5.21 registers a second provider, so the check now sets aside `fortune-blessing` when
`window.__L5R_TEST__.FB4521` is present; Heart of Vengeance's own entry is still checked exactly.
Passes with that release present and removed. No dependency either way between the two releases.

### Fixture correction for Dark Paragon (Feature 4.5.23; 23 September 2026)

`HV-PROVIDER-REGISTERED` now also sets aside the `dark-paragon` provider when
`window.__L5R_TEST__.DP4523` is present; Heart of Vengeance's own entry is still checked exactly.
It failed on that build before the correction (90/91) and passes with 4.5.23 present and removed.
There is no dependency between the two releases.

### Fixture correction for Touch of the Spirit Realms (Feature 4.5.24; 23 September 2026)

`HV-PROVIDER-REGISTERED` now also sets aside the `spirit-realms` provider when
`window.__L5R_TEST__.TR4524` is present. It failed on that build before the correction (90/91) and
passes with 4.5.24 present and removed. There is no dependency between the two releases.
