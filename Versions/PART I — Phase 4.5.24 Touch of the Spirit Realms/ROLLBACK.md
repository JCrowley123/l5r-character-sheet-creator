# Phase 4.5.24 — surgical rollback

Restore point recorded before this release: commit `94235855fde49542fbac785f8f2534624051afbd`, Phase 0 build **2,888,142 bytes**, SHA-256 **`4d112320eb4c1e9937a280b1e7d3f25ef1d5aff49a5a938e80b351fa329ccac7`**.

## Owned surface

- `src/sheet/209.92992-feat-adv-spirit-realms.js`: `TR4524`, `ADV_SPIRIT_REALMS_ENABLED`. It registers the `Touch of the Spirit Realms` schema (`spiritRealmTouch`, effect `tr4524Realm`) and wraps `isExtendedAdvConfigComplete`, `resolveAdvDisadvEffect`, `refreshAdvConfigControl`, `openExtendedAdvConfigModal`, `confirmExtendedAdvConfigModal` and `advConfigExtendedRollModifiers`. It also registers roll-declaration provider `spirit-realms`.
- `src/css/59.991-adv-spirit-realms.css`: `tr4524-picker`, `-legend`, `-option`, `-error`, `-row`, `-badge`, `-warning`, `-reminder`, `-info`, `-skill`, `-skill-label`, `-skill-select`, `-note`, `-flag`, `-lost`.
- One block in `src/sheet/210-test-seam-and-init.js`: `spirit-realms-seam` (`END TR4524`).
- Two compact manifest entries; the remover recomputes `expect_sha256`. The radio group is `tr4524Realm`, the select `tr4524Skill`, and the row dataset key `tr4524Name`.

## Procedure

Run `qa/remove-phase.py <explicit scratch Phase-0 path>`, then that copy's `build/recombine.py`. Never run any remover against the live tree. The two retained-harness corrections below are conditional and need no edit on removal.

## Dependencies

- **Hard dependency on base Phase 4.5** (`209.8`, `209.81`), like every configured Advantage. The base ROLLBACK declares this.
- **Declared dependency on Feature 4.5.15 (roll declaration registry)** for Sakkaku, Meido and Tengoku. It is guarded: without 4.5.15, the realm is still recorded, priced and automatic, and nothing is offered at roll time. **Removal order: this release first.** With every other registry user stripped (4.5.23, 4.5.22, 4.5.21, 4.5.16), 4.5.15's remover still **refuses**, naming this release's fragment (measured). 4.5.15's ROLLBACK declares this.
- **Trunk:**
  - `characterCasterLock`, the Shugenja price;
  - `getSchoolsList`, `schoolConcreteSkillNames` and the Skills table's School ticks, Yomi's School Skills;
  - `#f_taint`, Jigoku, read only;
  - `ROLL_KINDS`, the info overlay and `setStatus`.

  It reads 4.5.2's list of neither Social nor School Skills: it computes School Skills from the trunk itself.
- **Cross-phase fixture corrections (declared):** two retained checks now also set aside this release's own `spirit-realms` provider, conditional on `window.__L5R_TEST__.TR4524`. They are 4.5.15's `RD-NO-PRODUCTION-PROVIDER` and 4.5.16's `HV-PROVIDER-REGISTERED`. Both failed on this build before the correction (measured: 52/53 and 90/91), and both pass with this release present and removed.
- **No dependency on 4.5.23** (removed in either order; measured). Feature 4.5.10's Cursed by the Realm is a separate Disadvantage row with its own `realmPick` type and is not touched. Core p.148's rule against holding both is not enforced, the same as Paragon.

No registry seat, markup or top-level save change.

## What removal does to characters

Measured on the restore-point build with a Shugenja holding Touch of the Spirit Realms (Yomi, Meditation): the saved realm and Skill stay in the row's config byte-for-byte. The row shows Phase 4.5.3's "Saved setting kept — this build cannot show it", and it keeps its cost (6 XP). Nothing else on the character was changed by this release, and declarations were never saved.

## Proof

See the README's measured QA for the byte-identical removal, the 4.5.15 refusal and the removal orders with 4.5.23.
