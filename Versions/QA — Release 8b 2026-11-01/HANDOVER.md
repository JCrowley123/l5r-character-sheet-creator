# Release 8b — live on 2 November 2026

Completed qualification at 00:46 UTC on 2 November 2026. Owner approved step 3a on 1 November. Branch: `codex/release-8b-school-choices-2026-11-01`, based on `b2d8e26b`. Application implementation commit: `9c9798ef`. On the owner’s instruction on 2 November, main fast-forwarded to `78f7037f`. Cloudflare published the same application that passed qualification.

## What changed

One removable layer, `PART K — Phase 11.2.5 School Choices from the Character Check` (`SC8`), adds Manage buttons to the existing starting School scroll and free Skill notes. The dialog reuses the wizard pickers, offers each Element in turn with Later, and retains existing complex allotment rules. Free Skills receive Rank 1 without XP cost, the School tick and existing School bonuses. The validator remains read-only; Play keeps plain notes.

Choices carry explicit optional School metadata through save/load. Ordinary Equipment rewards never count automatically. Older items can be explicitly selected in the School picker without duplication. Shared known spells can be explicitly claimed for more than one held School. Undo in Manage preserves previously owned items, paid Skill ranks and memorised spells. The wizard’s original School replacement behaviour is retained. No new sourcebook rule was introduced. Release 8c level-up choices, Kiho actions and Phase 15 implementation remain outside this release. The owner’s original broader concept remains in the roadmap as the agreed fallback.

## Try it

Open **Manage → Identity → Character check** on a spare character with unfinished School choices. [Open the live app](https://l5r-character-sheet-creator.pages.dev/).

The owner’s 11 checks are ready for iPhone and Edge. Both device results are pending. To use a separate character list, load a saved copy into the verified branch preview. [Device checklist](DEVICE-CHECKS.md) · [HTML checklist](DEVICE-CHECKS.html) · [Branch preview](https://2101de40.l5r-character-sheet-creator.pages.dev/).

## Production verification

Completed at 09:29 UTC on 2 November. The page, service worker, manifest and four icons on the production URL matched the tested files byte for byte. The page was 17,491,220 bytes with SHA-256 `e82ba2213b143138962ce3a8d5f4e530ac6ad3a6762f123068078b9c23c569f9`. Service-worker build `8116fa4d335d734a`.

| Production check | Result |
|---|---|
| Downloaded files, 11 harnesses | 315/315 |
| First open and offline reload in a fresh Chrome context | 20/20 |
| School-choice controls at 390 px with touch | 6/6 |

[Downloaded-file results](qa/live/live-verification.json) · [Browser and offline results](qa/live/live-browser-smoke.json) · [Touch walkthrough](qa/live/walk/walk.json)

## Measured verification

| Check | Result |
|---|---|
| Original feature checks and reproduced review regressions at 4× CPU | 30/30 + 6/6 |
| Affected historical checks at 4× CPU | 279/279 |
| Variant cases: 12 deliberate mutations and two baseline controls | 14/14 exact pinned outcomes |
| Removal safety and exact predecessor restoration | 6/6 |
| Dependency scan | clean |
| One discovery pass | 6,709/6,709; 175 fresh leaves |
| Full pass 1 | 6,709/6,709 candidate; 6,600/6,600 retained |
| Full pass 2 | 6,709/6,709 candidate; 6,600/6,600 retained |
| Local committed PWA preview | 315/315 |
| Local first-open/offline browser smoke | 20/20 |
| Local changed-control walk | 6/6 |
| Hosted branch preview byte comparison | 7/7 files |

Both full passes used fresh execution, on mains with keep-awake; no leaf result was reused. Each candidate pass ran 175 leaves and each retained pass 171. Run 1 finished 1 November 23:57 UTC; run 2 finished 2 November 00:46 UTC. The retained scope is Release 8a.1 minus its two existing live-site leaves (73 assertions), matching the established retained-run convention. The removed layer was SC8 alone. Each removal restored the exact predecessor, and the final candidate hash remained unchanged.

Candidate: SHA-256 `1eb9e017636829a941a8d9b0916fc2b0d0c81eefc97e2b8fd7d222f4ea02f322`, 17,484,443 bytes. Predecessor: `a25ace916f29d5c1647731db0ab2d7e97bd23bbdd6312c9631bd9d4ba416c7f2`, 17,459,752 bytes. The full-run summaries and leaf evidence are in `qa/final-run-1/` and `qa/final-run-2/`. `qa/list-final.json` is the final invocation inventory; `list.json` is the earlier inventory used to select the nine historical load checks.

## Failed attempts are preserved

The single read-only review found four adoption/source defects. Six pinned regressions reproduced these and related undo defects before fixes. The first historical preflight also caught a wizard School replacement regression; production was fixed while keeping that original assertion. Two own-harness launch attempts failed before a browser ran because of preload path quoting. Their evidence remains. See [REVIEW.md](REVIEW.md).

At 23:08 UTC the first full launcher stopped at build verification, before any suite leaf ran: Windows rejected the canonical HTML’s truncating write. The precise Windows cause remains unproven. QA now runs the unchanged builder’s `--verify` on a scratch copy and compares every byte with the frozen candidate. Eight pinned continuation-guard cases passed. The original failure is preserved and a one-use continuation was permitted only because no suite had started. The two full suites then passed on their first actual executions; no failed suite was rerun to get a pass. This was not an uninterrupted first-time launch. See [PRE-SUITE-LAUNCH.md](PRE-SUITE-LAUNCH.md).

## Removal and next work

Use the layer’s `qa/remove-phase.py` on an external scratch tree, or its removal-chain registry entry. The remover refuses the live tree and preserves unrelated bytes. Do not restore whole shared-file snapshots. Prerequisites and save-data behaviour are in the layer’s `ROLLBACK.md`: saved rows survive rollback, but resaving with the predecessor drops optional source annotations.

Next is the owner’s iPhone and Edge check on the live release. Step 3b remains a separately approved book reading and Release 8c. Phase 15’s accepted Q1–Q8 and independent finding/release/phase removal rules remain unchanged. No further suite runs are required for this unchanged candidate.

## Remote Control and usage

Remote Control confirmed on at 23:38 UTC on 1 November: Settings > Connections > Control this PC showed Allow connections enabled, an already paired iPhone and Keep this PC awake enabled. No setting change was needed. The owner explicitly resumed setup after the earlier Escape stop. See `qa/remote-control.json`.

Codex account readings (five-hour / weekly used): start, 1 November 02:09 UTC, **77% / 44%**; pre-full launch, 1 November 23:07 UTC, **0% / 80%**; before the first actual suite checks, 23:10 UTC, **19% / 82%**; after both full passes, 2 November 00:47 UTC, **75% / 91%**; final end-of-step reading, 2 November 00:50 UTC, **97% / 95%**. These are account-wide readings, not an exclusive project cost. The five-hour window rolled between the start and pre-full readings; do not subtract those as a single-window cost or add them to Claude points. The desktop composer displayed **GPT-6 Astra Ultra** at 23:38 UTC; earlier API readings did not expose model/effort. No reset credit was used by this agent. Raw sanitized readings are in `qa/usage.json`.

On 2 November the deployment readings were 13% / 97% used at 09:23 UTC and 21% / 98% at 09:29 UTC after production verification (five-hour / weekly, shared account). The usage API did not expose the deployment model or effort.
