# Wound Settings Preview

Management → Rings & Traits now names Campaign wounds and shows all eight actual calculated thresholds beside the multiplier controls. The combat summary points to this setting. Existing modifiers are included; wounds taken and Combat visibility are unchanged. No save state. Separate data/UI fragments; switch WOUND_SETTINGS_PREVIEW_ENABLED.

Implementation checkpoint. Tests, negative variants, removal proof, dependency scan, review and full suites pending. Predecessor ac59ef11ee32eb97852c1140e8fb5040b8530c9dd03f6dd3296b50cacda6a919,17344141 bytes. Candidate be0df2935dda0027a0020120bf207d7ea69fc443bd1f50badee90847f55784f1,17347572 bytes.

Focused validation:18/18; predecessor and disabled1/18. Baseline plus three deliberate defects match exact prewritten pins. Existing wound tests31/31; removal6/6 restores the card-layer predecessor. Desktop/phone preview inspected; broader affected checks, single review and full QA pending.

## 28 October 2026 (Claude): predecessor refreshed

This layer's code is unchanged. The card-editing layer below it changed (its review fixes), so this layer's removal now rebuilds that fixed build: `a2a2e9bb143c22f0afd0648746338b1c14e0d89223a742525a18d88ba3ca3f18`, 17,346,020 bytes (was `ac59ef11…a919`, 17,344,141). Removal 6/6; own 18/18 (also 18/18 under 4× CPU throttling); wound multipliers 31/31. Candidate with both layers: `753527a3a8cd5b01a06cde249bfb9444a636e37f551ee6b464d8682d164c9528`, 17,349,451 bytes.
