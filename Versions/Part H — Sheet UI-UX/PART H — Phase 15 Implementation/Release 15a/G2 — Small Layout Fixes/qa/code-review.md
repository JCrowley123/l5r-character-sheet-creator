# G2 · read-only review of the whole group's diff (7 November 2026)

**Scope:** `git diff 2790a2ba claude/release-15a-a04.1`, five units, 437 added source lines, nothing removed or rewritten:

- ten fragments (five JS, five CSS);
- five seam blocks;
- the manifest entries and the registry entries;
- one declared conditional fixture, in Phase 4.5.21's harness.

**Done by Claude, inline, before any preview was pushed.** It was read against the design rules, G1's lessons and CLAUDE.md's removability rules.

## Result: no blocking defect

| # | Unit | Looked at | Finding | Action |
|---|---|---|---|---|
| 1 | all | Each switch reads its own flag; each body class gates every rule; each seam block is guarded and assigned after the literal | Correct. Each harness's CLASS-GATES check proves the class is load-bearing. | — |
| 2 | all | Marker-shaped prose in comments | A07's first build said "BUGFIX LM7" and its remover refused. Reworded before the commit. No other hits; `feature-dependencies.py` is clean for all five. | Fixed in A07 |
| 3 | A05, A04.1 | Observers: do they settle? | Each sweep only marks unmarked nodes, so the mutation it causes finds nothing more. The A05 sweep is restricted to `#disadvList`, and the A04.1 sweep to `#advConfigGrid`. | — |
| 4 | A06, A07, A11 | `:has()` on older Safari | Without `:has()` the rules simply do not match, and the row looks as it does today. That's acceptable: the owner's iPhone is current. | Noted |
| 5 | A06 | The generated state text ("Not recorded yet") | It is supplementary. Each row's own sentence already says what is owed, and that stays in the DOM. | Noted |
| 6 | A06 | Hover fade (G1's lesson) | `opacity: 1` on hover. A disabled Return keeps 0.5 (the later rule, same specificity). | — |
| 7 | A07 | The "Severity" label applied to other rows | Only the row holding `.lm7-moon` matches. MR-ONLY-THE-MOON-ROW checks it against a configured Paragon. | — |
| 8 | A11 | The phone hint gap | Kept at 14 px by the carousel's own rule; A11's 6 px applies above 768 px only. TE-HINT-GAP pins both. | — |
| 9 | A04.1 | Phase 4.54's i heading (screen-reader name) | Took in the inline rule. Fixed in A04.1 by extending `R454.EXCLUDE_FROM_LABEL` (soft, guarded, declared). 4.54 is 28/28. | Fixed in A04.1 |
| 10 | A04.1 | The d45 options keep their `title=` | On a laptop, hovering an option still shows the rule as a native tooltip, a repeat of the text now on the card. Removing it would break Phase 4.54's checks (they count titled cards), and it harms nothing. | Accepted, noted |
| 11 | A04.1 | The d45 option's "checked" highlight | Paragon's card has none: the radio shows the choice. Matching Paragon drops the gold highlight on these five pickers. That is part of the approved "Paragon look". | Noted for the owner's review |
| 12 | A04.1 | Hotei's "ruled out" note in the Blessing | It stays inside the label, before the inline rule, and reads in order. | — |

No finding needed a restack: every fix was made on its own branch before the next was built.

## Qualification preparation review — 8 November 2026 (Codex)

Read-only review of the nine G2 qualification scripts and variant pins found no blocking defect. It checked runner nesting and 7,148/6,929 arithmetic, the 47 group-removal checks (15 structural plus 32 harness runs), G2 markers and surfaces, the 4.5.21 conditional fixture, environment/preloads and prior-class restoration in A11. The A11 candidate harness then passed 22/22. Candidate application remains 7793602382c68895b25dc572b71bd05af33667a9c1b1d1bd76032efd744182f0.
