# G3 mockups — owner approval pending

Prepared 10 November 2026 from unchanged G2. Read [the review page](mockups/G3-MOCKUP-REVIEW.html) or the three PNG boards. Each screenshot is a scratch DOM/CSS treatment of the real G2 app in isolated Chromium. It does not alter application fragments, the generated source, or an owner's character. Descriptions marked “Layout sample” are synthetic text, not revised rules.

| Finding | Proposed change | Owner decision |
|---|---|---|
| 8b.1-UI-01 | Keep the older starting-spell review's instruction/groups; use 44 px option cards; common inset and divided action bar with Later secondary and Confirm primary; inner choices scroll, actions remain visible; two group columns on laptop. | Pending |
| 8b.1-UI-02 | Full-width name line; A: no visible School cue for single-School characters, or B: short “School spell” badge. Both show full attribution for multiple-School characters, preserve saved grants and leave rewards untagged. | Pending A / B / revision |
| 8b.1-UI-03 | Separate Cast/status-help/Memorised/Remove row; Memorised at least 44 px high, Remove 44 × 44 px with no overlapping hit area. Preserve normal Play restrictions. | Pending |

The main UI-02 A/B pictures show the final composition with UI-03; they are labelled accordingly. The review page also includes UI-02 alone with the existing Remove corner reserved. UI-03's main comparison shows it alone with the original School label. Approval remains independent for each finding. The red × beside Cast in some cases is the existing casting-status/help control, not Remove.

Existing editable name inputs are retained. Play keeps the same read-only input, not a replacement text mirror. The longest tested catalogue name, “Wrath of Kaze-no-Kami (Hurricane)”, is readable at 390 px. Arbitrarily longer custom names retain the native single-line field's horizontal behavior; full wrapping custom-name editing is not proposed here.

Scoped estimate: a medium group overall. UI-01 is medium because it must handle OC8/SC8 render transitions safely; UI-02 is medium because saved attribution, second Schools and Manage/Play must stay correct; UI-03 is small for layout, with removal/undo regression coverage. Plan three isolated units, three stacked previews, light checks per unit and one code review, then the owner's device round. If the implementation remains screen-only, one candidate/retained full pass follows acceptance. New check counts, numerical allowance cost and a completion time are not yet reliable estimates; shared Codex meters cannot supply task cost or Claude allowance.

The eventual implementation must handle all dialog rerenders and prove the existing focus contract. The scratch script's temporary listeners are not an approved implementation architecture. If actual values/saves/undo/focus/startup behavior changes, surface the behavior-tier change before proceeding. No timing or animation is proposed.

Read-only review found issues in early scratch versions: closed-dialog display, persistence of review CSS into the ordinary chooser, a stale Play name mirror, and a microtask ordering hazard. Final screenshots correct these: styling is scoped to an open review, the ordinary chooser sheds the review class, original Play inputs remain, and capture/original/bubble listener ordering preserves Later across the tested transition. The reviewer found no further blocker to scratch approval boards. Arbitrary rerenders, file-save/reload, undo and native device acceptance remain implementation-stage work.

Approval prompt: “1 approve/revise; 2 A/B/revise; 3 approve/revise.” This permits the approved implementation/preview stage, not production release. A later G3 go-live instruction is still required.

## Claude review, 11 November 2026 — owner decisions still pending

The owner had not reviewed the boards above and asked Claude to review them first and to mock up anything it would do differently. Read [the review page](mockups/G3-CLAUDE-REVIEW.html) (open locally; self-contained) or the two boards: [UI-01](mockups/G3-CLAUDE-UI01.png), [spell rows](mockups/G3-CLAUDE-ROWS.png). Each shows today, the proposal above and Claude's alternative, re-captured on unchanged G2 (`77936023…82f0`). Nothing is built.

| Finding | Claude's view | Recommended |
|---|---|---|
| 8b.1-UI-01 | The proposal above is sound: its option card matches Paragon's (1 px line border, 6 px radius, Noto Sans 14.4 px), and the joined Later/Confirm bar is right. One gap: “Given · 3 left” is written once and never changes while ticking (today and in the proposal). | The same layout plus a running “n of N chosen” on each group (solid when complete, red “deselect n” when over), headings in the pickers' serif bold, and “Given by your School” as the next screen words it. |
| 8b.1-UI-02 | A and B both add height on every spell card: 148 → 200 px (A) or 229 px (B) on a phone, and 149 → 201 / 230 px on a laptop, where the name already had 775 px. B spends a line on two words. | **C:** on a phone the name takes line one; Cast, help and Memorised take line two with “School spell” at the end of that line as a quiet tag (the existing `.adv-config-badge` look). 198 px on a phone with the cue kept; a laptop card stays one line at 149 px. Rewards show no tag; with several Schools the tag names the School(s) and wraps to its own line only when it does not fit. |
| 8b.1-UI-03 | The proposal moves × for spells alone into a bordered box at the end of the Cast line. Every other `.entry` card keeps × in the top-right corner (`.entry .rm-btn`, absolute). | **C:** × stays in that corner with a 44 × 44 target and the corner kept clear (beside the name on a phone, at the end of the single line on a laptop). Zero overlap with Memorised, the name, the tag and the description at both widths. |

Trade-off of C: in Manage on a phone the name has 256 px, 42 px less than A/B, because × sits beside it; the longest catalogue name still shows in full, and Play has the full 298 px.

The two row findings stay separate decisions. In C, UI-02 is the name line and the tag; UI-03 is the reserved corner and the 44 px target. The review page shows each alone. UI-02 alone leaves × at today's 40 px over the end of the name box (as it sits over the Points box on other cards); UI-03 alone keeps today's School label and lets Memorised drop below.

Scratch probes at 390 × 844 and 1440 × 1000 (`qa/claude-review/claude-prototype.json`), not qualification: Later closes with no writes; Confirm of eight spells leaves the reward ungranted and reaches only the Earth picker with the review class removed; an over-count Confirm is refused with no writes and both actions kept; 20 choices scroll with the action bar fixed (754 px phone, 910 px laptop); every option 44 px; a tap on the Memorised label's far end changes only that spell; a tap on the outer edge of × removes only that reward; a renamed reward survives collectData/applyData; Play keeps read-only names, locked Memorised and hidden ×; serialized spell records identical before and after all twelve Manage/Play dressings; no page errors. The live count is display of the draft only (no value, save, roll, undo or focus change), so G3 would remain screen-only; confirm at build. The same implementation cautions as above apply (OC8's `body.contains(confirm)` guard, SC8.render replacing the body, `[open]`-scoped display).

Approval prompt: “**1** counts / without counts / revise; **2** C / A / B / revise; **3** C / boxed × / revise.”

## Owner decision, 11 November 2026 — all three approved as Claude recommended

Asked “Approve my recommended design for all three findings?”, the owner answered, in the Claude session on 11 November 2026:

> “Approve all three”

| Finding | Approved mockup |
|---|---|
| 8b.1-UI-01 | The joined Later/Confirm layout with option cards, **with the live counts** and the pickers' heading type. |
| 8b.1-UI-02 | **C:** the name on its own line on a phone; “School spell” as a quiet tag at the end of the control line; one line on a laptop; the School name(s) in the tag for a character with several Schools; no tag on a reward. |
| 8b.1-UI-03 | **C:** × stays in the card's top-right corner with a 44 × 44 target and the corner kept clear. |

This is mockup approval. It permits the build and preview stage: three separately owned units, stacked previews, light checks, one code review, then the owner's device round with a separate Accept / Revise / Remove for each finding. It is not device acceptance, qualification or a go-live instruction.
