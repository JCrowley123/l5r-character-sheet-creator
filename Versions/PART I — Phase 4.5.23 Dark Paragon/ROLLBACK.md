# Phase 4.5.23 — surgical rollback

Restore point recorded before this release: commit `862dfbf316d8d05532e9b59d26dac9ddb844fb66`, Phase 0 build **2,854,260 bytes**, SHA-256 **`985fdeeeb4888e2d62195b5182481c5f6da053418f0737b00bbacd9c9d8b9a3f`**.

## Owned surface

- `src/sheet/209.92991-feat-adv-dark-paragon.js`: `DP4523`, `ADV_DARK_PARAGON_ENABLED`. It registers the `Dark Paragon` schema (`darkParagon`, effect `dp4523Precept`) and wraps:
  - `isExtendedAdvConfigComplete`, `resolveAdvDisadvEffect`, `refreshAdvConfigControl`, `openExtendedAdvConfigModal`, `confirmExtendedAdvConfigModal`;
  - `rollWithModifiers` and `rollWeaponDamage`, which only mark which roll is being shown;
  - `onAdvConfigRollResult`, the reroll button;
  - `rollPreviewGate`, Determination's payment;
  - `advConfigAllSessionResources`, the Session Resources panel.

  It also registers roll-declaration provider `dark-paragon`.
- `src/css/59.99-adv-dark-paragon.css`: `dp4523-picker`, `-legend`, `-option`, `-error`, `-row`, `-badge`, `-warning`, `-reminder`, `-info`, `-session`, `-state`, `-use`, `-reset`, `-actions`, `-head`, `-reroll`, `-outcome`, `-bonus-note`.
- One block in `src/sheet/210-test-seam-and-init.js`: `dark-paragon-seam` (`END DP4523`).
- Two compact manifest entries; the remover recomputes `expect_sha256`. The radio group is `dp4523Precept` and the row dataset key is `dp4523Name`.

## Procedure

Run `qa/remove-phase.py <explicit scratch Phase-0 path>`, then that copy's `build/recombine.py`. Never run any remover against the live tree. The two retained-harness corrections below are conditional and need no edit on removal.

## Dependencies

- **Hard dependency on base Phase 4.5** (`209.8`, `209.81`, `209.83`), like every configured Advantage. The reroll reuses `209.83`'s `advConfigLuckRerollResult()`, so the saved pool is rerolled without replaying the action. It is guarded: without it, no reroll is offered. The base ROLLBACK declares this.
- **Declared dependency on Feature 4.5.15 (roll declaration registry)** for Determination. It is guarded: without 4.5.15, the other six precepts work and Determination is a reminder with its payment unused. **Removal order: this release first.** With every other registry user stripped (4.5.22, 4.5.21, 4.5.16), 4.5.15's remover still **refuses**, naming this release's fragment (measured). 4.5.15's ROLLBACK declares this.
- **Soft, guarded reads of Feature 4.5.2:**
  - `D45.socialSkills` for Control. An identical copy is the fallback.
  - `D45G.inCheck()`, so a Willpower check the gates run first never offers the reroll (measured with Enlightened Madness).

  Removal of 4.5.2 while this stays was not measured.
- **Soft, guarded use of Phase 3 (Part G)'s `rollPreviewGate`.** Without the preview there is no Determination tick to pay for.
- **Trunk:**
  - `showRollResult` and its `currentRoll*` state;
  - `appConfirm`, `appConfirm3Way` and `appAlert`;
  - `getWoundPenalty`;
  - `getVoidPoints`, `consumeVoidPoint` and `renderVoidPanel`;
  - `isCombatActive`, `hasSpentThisRound` and `recordRoundSpend`;
  - the info overlay, `setStatus`, and `#f_honorPts`, which is written and is the only Honor field touched.
- **Cross-phase fixture corrections (declared):** two retained checks now also set aside this release's own `dark-paragon` provider, conditional on `window.__L5R_TEST__.DP4523`. They are 4.5.15's `RD-NO-PRODUCTION-PROVIDER` and 4.5.16's `HV-PROVIDER-REGISTERED`. Both failed on this build before the correction (measured: 52/53 and 90/91), and both pass with this release present and removed.
- **No dependency on 4.5.22** (removed in either order; measured). Feature 4.5.7 (Unlucky) wraps the result hook after this release, so its button sits below; there is no dependency either way.

No registry seat, markup or top-level save change.

## What removal does to characters

Measured on the restore-point build with a Spider character holding Dark Paragon (Strength, used): the saved precept and use stay in the row's config byte-for-byte. The row shows Phase 4.5.3's "Saved setting kept — this build cannot show it", and it keeps its cost (4 XP). Honor or Void already paid stays paid; the release never refunds.

## Proof

See the README's measured QA for the byte-identical removal, the 4.5.15 refusal and the removal orders with 4.5.22.
