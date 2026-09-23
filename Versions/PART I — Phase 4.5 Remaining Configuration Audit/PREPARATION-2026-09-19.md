# Advantage implementation preparation — 19 September 2026

Approved scope: resume A01–A16 from GitHub main, in small verified and pushed batches. The owner's latest ruling explicitly requires Wealthy to grant its 2-koku-per-rank entitlement. This supersedes the reminder-only implementation decision recorded for Phase 4.5.6; Perceived Honor remains verification-only.

## Restore point and preserved draft

- Authoritative starting commit: `6005faecac2e5e671d9c4a2bb45f24ba60044db7`.
- Phase 0 output: 2,689,172 bytes; SHA-256 `c7063f52269c306fcd6596e2103518ff27d4a57b01b0db031115dbb59c58ca15`.
- The desktop was 43 commits behind and held 12 staged, unverified files. Those files were preserved in a Git stash labelled `Preserved superseded A01-A16 draft before approved fresh implementation 2026-09-19`, then the checkout was fast-forwarded.
- Correction, 20 September: an intervening uncommitted implementation attempt reused the old draft and bundled the remaining entries together. That did not comply with the approved fresh, incremental approach. It was never shipped. It has been preserved outside the source tree for recovery and removed from the active build; fresh, bounded releases now start from the restore point above. Its 17 smoke checks were not full QA and are not completion evidence.
- Repository-local `core.autocrlf=false` and `core.longpaths=true` now enforce the project requirements. All 79 current source files were scanned: none contains a CR byte.
- Current structural baseline: 270 unique element IDs, no duplicates, 10 sections, 26 roll-modal-overlay occurrences, three script elements, two style elements, no tag imbalance. Older 227/23 figures are historical, not targets.

## Execution environment

The current combined runner is the Negative Roll Modifier Display runner. Its newest child harnesses use Playwright's default browser while some older harnesses accept `L5R_CHROME`. The initial review could not run the suite because the default browser was absent. Preparation installed the official matching Chromium headless shell in a temporary browser cache; no existing harness or production code was changed to do this.

The desktop needs `NODE_PATH` pointing at the bundled Node dependencies and `PLAYWRIGHT_BROWSERS_PATH` pointing at that browser cache. Baseline completed **992/992** before the fresh batch (approximately 301.5 seconds). A `0/0` result is never accepted. The first release's README records its current and removed-build results.

## Implementation sequence and boundaries

1. Persist verified source facts in AUDIT.md and commit them before implementation.
2. Add the named-entry and reminder entries: Blackmail, Darling of the Court, Forbidden Knowledge, Inheritance, Servant references and Way of the Land. Heart of Vengeance uses an independently removable preview declaration.
3. Add scoped mechanical/configuration work: Dark Paragon, Paragon, Soul of Artistry and Wealthy's recorded entitlement grant.
4. Add Touch of the Spirit Realms and Void Versatility. The latter must preserve the Void spell's identity/dice while changing only the selected payment pool, with exhaustion and bonus-slot warnings.
5. Add Seven Fortunes' Blessing and then its Naishou Citizen dependency, keeping paid purchase history separate from editing the active Fortune.

20 September delivery refinement: step 2 is split into smaller releases. Phase 4.5.13 implements only Blackmail, Forbidden Knowledge, Inheritance's reminder and Way of the Land, with **136/136 own and 1,128/1,128 combined checks** and byte-identical removal. Darling's multi-court state, Heart's roll declaration and Servant references remain later work, not silently omitted requirements. Wealthy's grant is still pending.

23 September delivery refinement: the rest of step 2 is split again, with the owner's approval. Phase 4.5.14 implements Darling of the Court's multi-court row and the Servant reference (**225/225 own, 1,353/1,353 combined**, byte-identical removal). Heart of Vengeance follows as its own batch, after an owner decision on generalising the roll-preview declaration hook rather than hardwiring a fourth. The feature identity statement below is historical: 4.5.13 and 4.5.14 are used, and the next free identity is `PART I FEATURE 4.5.15`.

Later on 23 September the owner chose to generalise first: Phase 4.5.15 is the general per-roll declaration registry (**53/53 own, 1,406/1,406 combined**), and Heart of Vengeance follows as 4.5.16, its first provider. Next free identity after that: `PART I FEATURE 4.5.17`. Heart of Vengeance shipped as 4.5.16 (**91/91 own, 1,497/1,497 combined**), completing step 2. Step 3 began with Wealthy's grant as 4.5.17 (**87/87 own, 1,584/1,584 combined**), including the Core p.149 1-XP minimum correction. Next free identity: `PART I FEATURE 4.5.18`. Paragon followed as 4.5.18 (**80/80 own, 1,664/1,664 combined**), reminder only as approved. Next free identity: `PART I FEATURE 4.5.19`. Soul of Artistry followed as 4.5.19 (**92/92 own, 1,756/1,756 combined**), completing step 3 apart from Dark Paragon, which waits on owner rulings. Next free identity: `PART I FEATURE 4.5.20`. Step 4 began with Void Versatility as 4.5.20 (**66/66 own, 1,822/1,822 combined**); Touch of the Spirit Realms waits on the Shugenja price ruling. Next free identity: `PART I FEATURE 4.5.21`. Step 5 began with Seven Fortunes' Blessing as 4.5.21 (**77/77 own, 1,899/1,899 combined**); Naishou Citizen follows. Next free identity: `PART I FEATURE 4.5.22`.

Next feature identity is `PART I FEATURE 4.5.13`; subsequent releases use dotted identities. Every batch records its own immediate pre-release restore point, has its own rollback ownership, and retains all previous passing checks. D45's existing modifier seat is reused where applicable. Damage effects require direct verification through actual damage dice, as the damage path bypasses pre-roll modifiers.

The existing full-width picker correction is retained. New pickers will receive geometry checks; the audit's later update also records the Friend of the Elements preview geometry as corrected. Any new real-device issue remains a separate measured finding. No D06 Weakness, Hotei, Phase 6, wrapper-folder reorganisation or ammo-picker expansion is included.

## Source conflicts and decisions

- Wealthy: the new owner ruling requires a grant, not merely the existing reminder. A persisted grant record must prevent repeated recalculation, save/load and JSON import/export from minting money. Legacy saves have no such record and must expose an explicit reconciliation choice rather than assume whether the player already added the money manually.
- General Advantage minimum: newly verified Core printed p.149 / PDF p.152 establishes a minimum of 1 XP after discounts. Current rank-one discounted Wealthy and its existing test expect 0; the approved implementation corrects both to 1 XP. 
- Dark Paragon: source branches differ materially from the old catalogue's broad summary. The source table must govern the new implementation; no universal +5 is inferred.

## Usage and recommendation assessment

Exact input/output/total token readings are unavailable through the tools exposed to this task. Historical token cells remain blank. Account allowance readings, when recorded, are snapshots shared across tasks and are not per-phase token measurements. The ledger's historical Claude percentages sum to 92%; they are separate from current Codex usage.

Preserving some allowance for device corrections is sensible, but the historical percentage estimates are not precise cost forecasts. Wrapper reorganisation remains after this work because it would otherwise move the target paths while the new releases are being integrated. Neither Hotei nor Weakness belongs in this approved scope. Current reusable mechanisms may reduce their future cost, but neither can be declared cheap without its own measurements.
