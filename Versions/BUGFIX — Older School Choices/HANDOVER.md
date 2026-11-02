# Release 8b.1 · Older School choices

The combined Skill and spell correction is on the branch `codex/release-8b-1-older-school-choices`, application commit `f4c4f2ce`. It applies to the starting choices in Release 8b. Production currently serves Release 8b.

## Trying Osamu

Import a copy of the original save into the [Release 8b.1 preview](https://26fb8eb3.l5r-character-sheet-creator.pages.dev/). Under **Manage → Identity → Character check**, Osamu’s Rank 3 Defense already fills Kitsu’s free Skill choice. His two paid ranks still cost 5 XP.

Open **Review starting spells**. Confirm Sense, Commune, Summon, Reflective Pool, Reversal of Fortunes, Clarity of Purpose, Blessed Wind and Tempest of Air. Leave Jurojin’s Balm unselected. Once you confirm, the picker offers one Earth spell. Pick a different Earth spell. His original Balm stays in the collection as a reward. The School-choice note then clears.

The review starts with no candidate selected. **Later** discards the open draft. After confirmation the character remembers the decision on save and reload. Older characters with several plausible School-ticked Skills get a choice between the existing rows. If the old and recorded choices conflict, the app flags the conflict for the player.

[Device checklist](DEVICE-CHECKS.md) · [Phone-readable checklist](DEVICE-CHECKS.html) · [Accepted design and examples](DESIGN.md) · [Removal instructions](ROLLBACK.md)

## Verification record

The frozen standalone application is 17,505,080 bytes, SHA-256 `1716feb4d43428c0e5a5ebff9d025ac2a353e0af91b8a30227df791d994226f7`. Removing the correction restores Release 8b at 17,484,443 bytes. The optional review fields and their rollback behaviour are documented separately.

The original four failures were reproduced. The corrected behaviour passed the six-step phone-width walkthrough using Osamu’s original save, including preserving the reward when he took his one missing Earth spell. Five additional findings from code review were reproduced and corrected. [Review findings and test fixture corrections](REVIEW.md) · [Osamu walkthrough](qa/preflight-walk/walk.json)

The 17:14 UTC qualification launch stopped on battery power with zero test stages started. The frozen build is queued for the load checks and single discovery run on mains. The two full passes and owner device checks are pending. [Power-check record](qa/qualification-power-gate.json)

The hosted page, service worker, manifest and four icons matched the committed build byte for byte. Using the frozen build and the original Osamu file, all 24 checks passed at 4× CPU slowdown. [Hosted file comparison](qa/branch-preview.json) · [Original four regressions](qa/osamu-final-legacy-grants.log) · [Review tests](qa/osamu-final-older-review.log)

Implementation began at 11:19 UTC on 2 November. Account-wide Codex consumption showed 27% of the five-hour allowance and 4% of the weekly allowance. The meter did not expose model or effort.

The packaged app passed 344/344 checks across 14 harnesses. First-open and offline reload passed 22/22 checks. The local and hosted previews each passed the six touch checks with the synthetic Kitsu sample. Physical iPhone and Edge acceptance are pending. [Packaged app](qa/local/live-verification.json) · [First-open and offline](qa/local/live-browser-smoke.json) · [Hosted touch test](qa/hosted-walk/walk.json)
