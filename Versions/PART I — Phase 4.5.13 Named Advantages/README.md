# Phase 4.5.13 — Named Advantages

First fresh, bounded batch of the approved A01–A16 work. **Implemented and verified, 20 September 2026.** This is not completion of all A01–A16. Publishing is recorded by the Git commit containing this release; a push is not proof of a completed deployment or a refreshed device cache.

| Entry | Scope |
|---|---|
| A02 Blackmail | Target name and agreed target Status; calculated XP, Scorpion discount, target badge. No NPC tracking. |
| A05 Forbidden Knowledge | Subject, optional agreed-effects note, source-checked reference examples; explicitly manual benefits. |
| A07 Inheritance | Named heirloom badge and reminder only. Equipment creation and non-combat roll automation remain deferred. |
| A15 Way of the Land | Optional region reminder; 2 XP normally, 1 for Unicorn. No location tracking or dice modifier. |

Darling of the Court, Heart of Vengeance, Servant references, and the remaining mechanical entries are later batches. Perceived Honor stays unchanged. Wealthy's approved 2-koku-per-rank grant is still pending its separate receipt/reconciliation work.

## Source and boundary decisions

The approved audit and `SOURCE-OTHER-PREPARATION.md` govern this release. Verified source notes were committed separately as `9a11267` before this fresh implementation. The pre-release HTML is unchanged from `6005faecac2e5e671d9c4a2bb45f24ba60044db7`: 2,689,172 bytes, SHA-256 `c7063f52269c306fcd6596e2103518ff27d4a57b01b0db031115dbb59c58ca15`.

Blackmail's automatic calculator accepts a positive whole target Status. The source does not resolve zero/fractional agreed values; those are visibly rejected as unsupported by this calculator, not presented as an invented RAW prohibition. The Scorpion discount cannot reduce a positive purchase below 1 XP (Core p.149). The player's own Status never drives this price.

The other three have fixed prices independent of their notes. Missing a subject/heirloom is flagged without erasing that price; an omitted optional region is valid. Unknown or future-version configs remain preserved and visibly flagged, retaining the saved price pending review. No import silently fabricates a target, region, subject, or heirloom.

## Persistence

Each new config has its own type, `revision:1`, dedicated named fields and a compatibility `value`. Existing schema-3 saves carry opaque config objects already; this batch does not add a top-level save schema or resource store. Old schema-1/2/3 saves and the real JSON and local-save paths were exercised. Future revisions are not accepted as known revision 1. Fixed-cost reminders grant no money, Skills, equipment or dice bonuses.

| Entry | Config type | Persisted choice fields |
|---|---|---|
| Blackmail | `targetStatusPick` | `target`, numeric `targetStatus` |
| Forbidden Knowledge | `knowledgePick` | `subject`, optional `notes` |
| Inheritance | `itemPick` | `itemName` |
| Way of the Land | `regionPick` | optional `region` |

All four also store `type` and `revision`; the normal UI writes `value` for compatibility. Omitted optional fields remain valid on import. Explicit live renaming clears the former pick; imported unsupported configs are preserved and flagged rather than treated as a rename.

## Validation and regression matrix

| Area | Risk | Acceptance tests |
|---|---|---|
| XP | High | Real row price and total; target versus player Status; Scorpion minimum; Unicorn adjustment; edit/cancel; unrelated totals unchanged |
| Configuration | Medium | Missing, negative, fractional, exponential and unsafe numeric input; empty required names; optional notes/region; revision/type validation |
| UI | Medium | Shared host open/change/cancel; short badges; manual-effect wording; accessible circled-i details; escaped user text; widths 320/375/768/1440 |
| Persistence | High | Browser save/reload; actual export download/import upload; legacy payloads; unknown fields preserved; repeated recalc idempotent |
| Isolation | High | Purchased Skills/Traits/Rings, equipment, spell slots, Void, roll modifiers and seven-seat registry unchanged |
| Removal | High | Scratch-only surgical removal, exact baseline bytes, unchanged retained suites, foreign-marker refusal, no orphaned source/CSS/schema references |
| Harness sensitivity | High | Disabled switch and absent stylesheet must turn intended tests red; mutation outputs recorded, not inferred |

## Measured QA — 20 September 2026

Final Phase 0 output: **2,704,237 bytes**, SHA-256 `1e2683d81ddab13662f76c62ca8c595d521d633f6cc66a512169661cd85b8326`.

| Check | Measured result |
|---|---|
| Before implementation | **992/992** retained checks |
| New real-browser suite | **136/136** |
| Final frozen build, full combined suite | **1,128/1,128**, zero retained checks removed or edited |
| Removed build, retained combined suite | **992/992** |
| Recombine verification / deployment drift check | Both exit 0 |
| Structural comparison | No differences: 270 unique IDs, zero duplicate IDs, 10 sections, 26 overlays, 3 scripts, 2 styles, balanced tags |
| Surgical removal | **Byte-identical** to the 2,689,172-byte restore point above; no owned source references remain |
| Remover safety fixtures | 45 tests: **43 passed, 2 skipped** because Windows denied creation of real symbolic links; portable alias-guard and real hard-link cases passed |
| Roll isolation | Every supported roll-kind modifier result unchanged; registry remains exactly seven seats |
| Ownership scan | All 19 surfaces and 10 external references owned by the dotted Phase 4.5.13 marker; exit 0 |
| Saved config after rollback | All four configurations and their prices preserved, visibly flagged, through actual JSON import/download and local save/reload on the SHA-verified removed bytes |
| Narrow layouts | 320, 375, 768 and 1440px checks passed, including long unbroken badge text |

The retained suite was measured on a removed output from an earlier iteration. Removal of the final frozen tree was then re-measured and produces the **same exact bytes and checksum**, so the removed-suite result applies to that identical artifact. No earlier draft smoke-test count is used as evidence.

### Deliberately broken builds

| Mutation | Result | What failed |
|---|---|---|
| Kill-switch off | **12/26** | 14 feature checks/groups fail; unavailable modal groups abort, so the denominator is not 136 |
| Own stylesheet removed | **128/136** | Exactly eight layout/long-badge checks |
| Scorpion discount removed | **135/136** | Only `NAMED-BLACKMAIL-SCORPION` |
| Optional fields made mandatory | **133/136** | Exactly three omitted-field acceptance/price checks |
| Inline validation hidden | **135/136** | Only `NAMED-INLINE-VALIDATION` |

Independent review found two genuine issues before release: omitted optional notes/region were incorrectly rejected on import, and the error message could sit behind the open modal. Both were fixed within this release, covered by new checks, and individually reverted above to prove those checks discriminate. One initial harness failure was a test selecting a later row after a rename; its selector was corrected, not the production behavior.

The subject/notes modal, saved badge and reference information modal were visually inspected at 375px. The browser's loaded-webfont set was **empty**: these are fallback-font observations, not proof against the deployed font. Physical iPhone testing remains the owner's device pass. Existing global card-overflow/device-feedback items are not declared closed by this batch.

## Run

`qa/current-suite-runner.js <built html>` chains the unchanged pre-release combined runner and this batch's real-browser harness. A missing/empty suite is failure. Set `NODE_PATH` to the installed Playwright dependencies and provide its browser runtime or `L5R_CHROME`.

`qa/verify-variants.py --node <node executable> --retained` works only in temporary copies: structural comparison, switch/CSS mutations, removal rebuild, and every retained suite on the removed output. `qa/test-removal.py` exercises remover refusal fixtures separately.

## Measured cost

Exact input/output/total token counts are not exposed by this session; no estimate is recorded as a measurement. On 20 September 2026 at approximately 19:27 UTC, the Codex account showed **13% used in the five-hour window and 81% in the weekly window**. These are account-wide snapshots, not this batch's cost, and do not combine with the historical Claude percentages. Production surface: one JS fragment, one scoped stylesheet, one guarded six-line seam block, two manifest entries and 136 new checks; no dice-engine or top-level persistence edits. Device correction remains unmeasured.
