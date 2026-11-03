# Release 8b.1 · Older School choices

The combined Skill and spell correction is on the branch `codex/release-8b-1-older-school-choices`, application commit `f4c4f2ce`. It applies to the starting choices in Release 8b. Production currently serves Release 8b.

**3 November · Release 8b.1 device checks passed.** The owner confirmed the functional tests passed on iPhone and laptop Edge. The picker layout, the crowded spell-name field and the Remove/Memorised overlap are recorded for Phase 15a. [Findings and evidence](<../Part H — Sheet UI-UX/PART H — Phase 15 UI Consistency Audit/RELEASE-8B-1-DEVICE-FEEDBACK.md>).

## Trying Osamu

Import a copy of the original save into the [Release 8b.1 preview](https://26fb8eb3.l5r-character-sheet-creator.pages.dev/). Under **Manage → Identity → Character check**, Osamu’s Rank 3 Defense already fills Kitsu’s free Skill choice. His two paid ranks still cost 5 XP.

Open **Review starting spells**. Confirm Sense, Commune, Summon, Reflective Pool, Reversal of Fortunes, Clarity of Purpose, Blessed Wind and Tempest of Air. Leave Jurojin’s Balm unselected. Once you confirm, the picker offers one Earth spell. Pick a different Earth spell. His original Balm stays in the collection as a reward. The School-choice note then clears.

The review starts with no candidate selected. **Later** discards the open draft. After confirmation the character remembers the decision on save and reload. Older characters with several plausible School-ticked Skills get a choice between the existing rows. If the old and recorded choices conflict, the app flags the conflict for the player.

[Device checklist](DEVICE-CHECKS.md) · [Phone-readable checklist](DEVICE-CHECKS.html) · [Accepted design and examples](DESIGN.md) · [Removal instructions](ROLLBACK.md)

## Verification record

The frozen standalone application is 17,505,080 bytes, SHA-256 `1716feb4d43428c0e5a5ebff9d025ac2a353e0af91b8a30227df791d994226f7`. Removing the correction restores Release 8b at 17,484,443 bytes. The optional review fields and their rollback behaviour are documented separately.

The original four failures were reproduced. The corrected behaviour passed the six-step phone-width walkthrough using Osamu’s original save, including preserving the reward when he took his one missing Earth spell. Five additional findings from code review were reproduced and corrected. [Review findings and test fixture corrections](REVIEW.md) · [Osamu walkthrough](qa/preflight-walk/walk.json)

The 17:14 UTC qualification launch stopped on battery power with zero test stages started. Mains power returned at 18:11 UTC, when qualification began on the same frozen build. Both full passes completed on their first executions. [Power-check record](qa/qualification-power-gate.json)

The hosted page, service worker, manifest and four icons matched the committed build byte for byte. Using the frozen build and the original Osamu file, all 24 checks passed at 4× CPU slowdown. [Hosted file comparison](qa/branch-preview.json) · [Original four regressions](qa/osamu-final-legacy-grants.log) · [Review tests](qa/osamu-final-older-review.log)

Codex usage on 2 November (five-hour / weekly consumed, shared across the account) was 27% / 4% at 11:19 UTC when implementation began, 59% / 25% at 18:48 UTC immediately before full QA, and 63% / 26% at 20:20 UTC after both passes. The meter did not expose model or reasoning effort. [Usage readings](qa/usage.json)

The packaged app passed 344/344 checks across 14 harnesses. First-open and offline reload passed 22/22 checks. The local and hosted previews each passed the six touch checks with the synthetic Kitsu sample. On 3 November the owner confirmed the functional checks passed on iPhone and laptop Edge. [Packaged app](qa/local/live-verification.json) · [First-open and offline](qa/local/live-browser-smoke.json) · [Hosted touch test](qa/hosted-walk/walk.json)

## Completed qualification

| Check | Result |
|---|---|
| Eligible Skills, spell reviews and historical paths at 4× CPU slowdown | 459/459 across 16 harnesses |
| Deliberately broken variants and predecessor control | All 4 produced exactly their pinned failures |
| Removal and refusal checks | 6/6 |
| Dependency scan | All references owned by the removable layer |
| Single discovery run | 6,738/6,738 across 178 harnesses |
| Full pass 1, finished 19:34 UTC | 6,738/6,738 candidate and 6,636/6,636 after removal |
| Full pass 2, finished 20:20 UTC | 6,738/6,738 candidate and 6,636/6,636 after removal |

Each full pass freshly executed 178 candidate and 173 retained harnesses. No result was reused. Both removal runs restored the same Release 8b hash. As in previous releases, the retained suite excludes its two production-only checks comprising 73 assertions. The owner’s device checks passed. A production merge requires a separate owner decision.

[Load results](qa/under-load-final/results.json) · [Qualification stages](qa/qualification.json) · [First full pass](qa/final-run-1/summary.json) · [Second full pass](qa/final-run-2/summary.json)
