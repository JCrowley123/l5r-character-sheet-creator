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
