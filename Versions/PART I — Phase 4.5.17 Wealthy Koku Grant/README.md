# Phase 4.5.17 — Wealthy Koku Grant

A16: the owner-approved grant of **2 koku per Rank**, plus Core p.149's **1-XP minimum** after discounts. Built on Feature 4.56's Wealthy handler. **Implemented and verified, 23 September 2026.**

## Behaviour

| Situation | What happens |
|---|---|
| New purchase | The Rank modal gains "Starting koku — 2 per Rank": *Add it to my Koku now* (default) or *I have already added it myself*. Confirming adds 2 × Rank to Koku once, or records it without changing Koku |
| Raise the Rank | Only the difference is added (Rank 5 → 7 adds 4) |
| Lower the Rank | Koku is **not** touched. The row says how many koku were granted for removed Ranks and offers **Return** (subtracts them) or **Keep** (e.g. already spent). Return is disabled, with the reason stated, if Koku holds less than the difference |
| Recalculate, reload, import, export, apply the same save repeatedly | Never adds money |
| Older save with a configured Wealthy but no record | Never assumed either way. The row asks "Was it added to your Koku?" with **Add N koku** / **Already added**; editing that row requires the same choice (no default) |
| Record short of the Rank (e.g. Rank raised while this release was absent) | Offers the missing amount with the same two buttons |
| Unreadable record (future revision, negative, fractional, extra field, not an object) | Kept byte-for-byte, flagged, no buttons; edits keep it and never move money |
| Delete the row | Koku stays: nothing is clawed back |
| Wealthy on the Disadvantage list | No koku line, no money |

**XP:** Rank × 1, minus 1 once for a Crane, Unicorn or Imperial character, **never below 1** (Core p.149). Rank 1 for an eligible character is now 1 XP, not 0; the row says "(clan discount −1; minimum 1 XP)" when the floor applies.

**The record** lives in the row's own config, beside Feature 4.56's fields: `wealth4517: {revision: 1, granted: <koku this purchase has put on the sheet>}`. It travels through the existing schema-3 save, export and import unchanged; no top-level save field or resource store is added.

Sources: Core printed p.155 / PDF p.158 (price, discount, 2 koku per point); Core printed p.149 / PDF p.152 (1-XP minimum); owner ruling recorded in `PREPARATION-2026-09-19.md` (grant with receipt and legacy reconciliation, no silent claw-back).

Restore point recorded before any edit: commit `65d21069fd6ad937a67f74023fbbe308452fb706` (4.5.16), **2,753,162 bytes**, SHA-256 `0aefe9c90c964eb50132bd0782b433648fee31ca069d7fc3a5c35615ea98163a`, **1,497/1,497**.

## Measured QA — 23 September 2026

Final Phase 0 output: **2,767,985 bytes**, SHA-256 `be9076cfbebc3fac31641a03fab82508b35a7c06caf961e347e546151930115a` (pinned).

| Check | Measured result |
|---|---|
| New real-browser suite | **87/87**, every money check reading the exact Koku value from a non-zero start (37) |
| Full combined suite | **1,584/1,584** = 1,497 retained + 87; three retained checks made conditional (below) |
| Surgical removal | **Byte-identical** to the restore point; removed copy verifies; **1,497/1,497** retained on those bytes |
| Removal order with 4.5.16 | 4.5.16 removed while this stays: this suite **87/87**, older suites **1,406/1,406**. Both removed, either order: byte-identical to `1d8aa345…` (2,739,496 bytes) |
| Remover fixtures | **45 run, 45 passed, 0 skipped** |
| Ownership scan | 17 surface names, all inside `PART I FEATURE 4.5.17` blocks; exit 0. 4.56's scan exits 1 with eight references, all this release's use of `R456` — the declared dependency |
| Recombine / drift / inventory / registry | Exit 0 / exit 0 / no differences / seven seats |

### Deliberately broken builds (one run, 403 s)

| Mutation | Result | What failed |
|---|---|---|
| Kill-switch off | **10/39** | Every feature group; modal-dependent groups abort |
| Own stylesheet removed | **82/87** | Four geometry checks and the disabled-look check |
| 1-XP minimum removed | **82/87** | The five minimum checks |
| Money added while rendering a legacy row | **57/80** | 23 checks — every "no money without a click" check |
| Raising the Rank re-adds the whole amount | **81/87** | The six difference checks |
| Lowering the Rank claws money back | **78/82** | The no-claw-back and Return/Keep checks |
| Legacy edit defaults to "add" | **81/84** | The must-choose checks |
| Future-revision record trusted | **84/87** | The three revision-2 checks |
| Legacy edit commits without a choice | **82/84** | `W-LEGACY-EDIT-MUST-CHOOSE` |
| Return enabled when short | **85/87** | The disabled-button checks |

### Retained checks corrected (declared)

Feature 4.56's harness pinned the design this release supersedes. Three checks are now conditional on this release, the Phase 1.5 (Part G) / 4.5.10 shape, and pass **29/29 both with and without it**:

- `RANKS456-W-06` expected Rank 1 + discount = **0 XP**, written when no Advantage minimum had been found. Core p.149 (verified 19 September) sets 1 XP; the expectation is 1 with this release, 0 without.
- `RANKS456-KOKU-01` expected **no koku** after configuring Wealthy (the superseded reminder-only design). It now expects +10 for Rank 5 with this release, +0 without.
- `RANKS456-KOKU-02` expected Koku unchanged from *before* the purchase after five recalculations; it now asserts unchanged from *after the confirm*, which is the property it exists for (recalculation never mints). Without this release the two are the same value.

No other retained check changed; the unmodified suite showed exactly these three failing (1,494/1,497) before the correction.

Found during development: a disabled Return button looked identical to an enabled one. The sheet has no global disabled style (each control states its own, e.g. `.emph-add-btn`), so this release adds one for its own buttons, pinned by `W-DISABLED-LOOKS-DISABLED`.

The row, reconciliation states and modal choice were inspected at 375px with fallback fonts only. Physical iPhone testing remains open.

## Run

`NODE_PATH=/opt/node22/lib/node_modules node qa/current-suite-runner.js <built html>`; `qa/verify-variants.py --node <node> --retained`; `qa/test-removal.py`.

## Cost

Exact token counts are not exposed to this session; none is estimated. Production surface: one JS fragment, one stylesheet, one guarded seam block, two manifest entries.
