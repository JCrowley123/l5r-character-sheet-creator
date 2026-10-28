# Wound Settings Preview

**Status, 28 October 2026:** finished and ready for review. The full suite passed twice, first time (6,365/6,365, removal exact, 6,228/6,228); see the QA folder `QA — Cycle 7a Device Follow-up 2026-10-27`. Merged to main `c0da641` and verified live the same day (319/319 checks on the live files). The dated notes below are the build history.

Management → Rings & Traits now names Campaign wounds and shows all eight actual calculated thresholds beside the multiplier controls. The combat summary points to this setting. Existing modifiers are included; wounds taken and Combat visibility are unchanged. No save state. Separate data/UI fragments; switch WOUND_SETTINGS_PREVIEW_ENABLED.

Implementation checkpoint. Tests, negative variants, removal proof, dependency scan, review and full suites pending. Predecessor ac59ef11ee32eb97852c1140e8fb5040b8530c9dd03f6dd3296b50cacda6a919,17344141 bytes. Candidate be0df2935dda0027a0020120bf207d7ea69fc443bd1f50badee90847f55784f1,17347572 bytes.

Focused validation:18/18; predecessor and disabled1/18. Baseline plus three deliberate defects match exact prewritten pins. Existing wound tests31/31; removal6/6 restores the card-layer predecessor. Desktop/phone preview inspected; broader affected checks, single review and full QA pending.

## 28 October 2026 (Claude): predecessor refreshed

This layer's code is unchanged. The card-editing layer below it changed (its review fixes), so this layer's removal now rebuilds that fixed build: `fc268dd274c03a80f9715026d13ef8706958e75f33ce11900eda84c95232f4ef`, 17,346,510 bytes (was `ac59ef11…a919`, 17,344,141; an intermediate `a2a2e9bb…3f18` before the second review). Removal 6/6. Candidate with both layers: `55f9e9ed601e052f3be617c06da51d795ab8f5932e5213d339ef27d6bd21f389`, 17,349,941 bytes.
