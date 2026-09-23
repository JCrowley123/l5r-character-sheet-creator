# Phase 4.5.21 — surgical rollback

Restore point recorded before this release: commit `5b1fc0082b576a6fb1f118a06bba119fe408c49e`, Phase 0 build **2,820,250 bytes**, SHA-256 **`106833069f5bf72a69b185b9d29c85c7f0d1cbf6748bff2195a2581b5d1e8e79`**.

## Owned surface

- `src/sheet/209.9298-feat-adv-fortune-blessing.js`: `FB4521`, `ADV_FORTUNE_BLESSING_ENABLED`; registers the `Seven Fortunes' Blessing` schema (`fortuneBlessing`, effect `fb4521Blessing`); wraps `isExtendedAdvConfigComplete`, `resolveAdvDisadvEffect`, `refreshAdvConfigControl`, `openExtendedAdvConfigModal`, `confirmExtendedAdvConfigModal` and `advConfigExtendedRollModifiers`; registers roll-declaration provider `fortune-blessing`.
- `src/css/59.97-adv-fortune-blessing.css`: `fb4521-picker`, `-legend`, `-option`, `-item`, `-rule`, `-lore`, `-lore-label`, `-lore-input`, `-error`, `-row`, `-badge`, `-warning`, `-reminder`, `-info`, `-hotei-roll`.
- One block in `src/sheet/210-test-seam-and-init.js`: `fortune-blessing-seam` (`END FB4521`).
- Two compact manifest entries; `expect_sha256` is recomputed by the remover. Radio group `fb4521Fortune`; inputs `fb4521Lore` / `fb4521LoreList`; row dataset key `fb4521Name`.

## Procedure

`qa/remove-phase.py <explicit scratch Phase-0 path>`, then that copy's `build/recombine.py`. Never run any remover against the live tree. The two retained-harness corrections below are conditional and need no edit on removal.

## Dependencies

- **Hard dependency on base Phase 4.5** (`209.8`, `209.81`), as every configured Advantage. Declared in the base ROLLBACK.
- **Declared dependency on Feature 4.5.15 (roll declaration registry):** the four declarations (Benten, Ebisu, Jurojin, Hotei's +10) are registry providers. Guarded: without 4.5.15 the Blessing is still recorded, priced and its automatic effects work, and nothing is offered at roll time. **Removal order: this release first** — 4.5.15's own remover refuses while this fragment is present (measured). Declared in 4.5.15's ROLLBACK.
- **Soft, guarded read of Feature 4.5.2's `D45.socialSkills`** for Benten and Ebisu. Without it those two declarations are offered on every Skill roll.
- **Trunk:** `rollWithModifiers`, `makeRollContext`, `ROLL_KINDS`, `getRingValueByName`, the info overlay, `setStatus`.
- **Cross-phase fixture corrections (declared):** 4.5.15's `RD-NO-PRODUCTION-PROVIDER` and 4.5.16's `HV-PROVIDER-REGISTERED` are conditional on `window.__L5R_TEST__.FB4521`; both pass with this release present (1,899/1,899) and removed (1,822/1,822). Declared in 4.5.16's ROLLBACK.
- **No dependency on 4.5.13–4.5.20**; measured against 4.5.20 in both removal orders. The Seven Fortunes' Curse (4.5.11/4.5.12) is a separate Disadvantage row and is not touched.

No registry seat, markup, or top-level save change.

### Later dependent — Naishou Citizen (Phase 4.5.22, 23 September 2026)

**Hard dependency, declared before shipping.** 4.5.22 extends `FB4521.price` by property (−1 XP
while Naishou Citizen is on the Advantage list) and reads `FB4521.active()`, `FB4521.possessive()`
and `FB4521.is()`. **Removal order: 4.5.22 first, then this release.** This release's remover
refuses while 4.5.22 is present (measured; nothing written), because its retained-source scan finds
`FB4521` in 4.5.22's fragment. Removing 4.5.22 and then this release lands byte-identical on
4.5.20's restore point `10683306…` (measured).

## What removal does to characters

Measured on the removed build: the saved Fortune stays in the row's config byte-for-byte and the row shows Phase 4.5.3's "Saved setting kept — this build cannot show it"; the row keeps its cost. Nothing else on the character was changed by this release, and declarations were never saved.

## Proof

Measured 23 September 2026: the 2,846,031-byte build (`9c749b7dc9c45fc5829f8db3172067d91ced54833e734da4f245d3ddb08528d0`) removes to **exactly 2,820,250 bytes**, `10683306…`; the removed copy verifies; **1,822/1,822** retained checks pass on those bytes. Live **1,899/1,899**. With 4.5.20 removed first: this suite 77/77 and older suites 1,756/1,756; both removed in either order: byte-identical to `2b69794dcd3bf9d70b8a1676a4f9cb734cf1f4b0ecf7d40b0396d0bae8ef0c3e` (2,798,717 bytes). Fixtures 45/45, no skips. Inventory unchanged; seven registry seats.
