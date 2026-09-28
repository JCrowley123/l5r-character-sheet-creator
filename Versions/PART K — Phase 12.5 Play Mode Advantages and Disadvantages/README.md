# PART K — Phase 12.5: Advantages & Disadvantages in Play

Built on the Phase 12 branch after the owner approved the corrected control inventory. This part
uses the existing `MODES12` capture-phase gate and selector registry. In Play, purchased Advantage
and Disadvantage rows are read-only; actions that represent using a configured choice remain live.

Branch: `codex/phase-12-5-adv-disadv`. [Owner preview](https://codex-phase-12-5-adv-disadv.l5r-character-sheet-creator.pages.dev/).
**Device review pending; do not merge to main or start the next part without approval.**

## Behaviour

- Add/remove/configure pickers and row name, points and description fields are Management-only.
- The shared configuration grid and Confirm button are gated, and an open configuration draft is
  cancelled when switching into Play. The Close button and backdrop remain dismissible.
- Hotei's `Contested Void Roll`, Dark Paragon reset/use, Phobia/Nemesis/realm toggles, the
  Enlightened Madness gate, Darling court selection/session controls, Lost status, Luck/Unlucky/
  Kharmic Tie resources, and information buttons remain Play actions.
- Selectors are scoped to `#advList` and `#disadvList`; Techniques is not reached.
- The mutation observer in Phase 12 part 1 locks newly rendered row controls while in Play.

## Files

| File | Purpose |
|---|---|
| `src/sheet/209.99993-feat-modes-advantages.js` | `MODES125` selector registration and stale-modal cancellation |
| `src/css/59.9994-feat-modes-advantages.css` | Play presentation for owned controls and the config overlay |
| `qa/advantages-harness.js` | Configured-entry matrix, actual Play actions, modal cancellation, row rebuilds and data invariance |
| `qa/current-suite-runner.js` | Chains the retained suite and this harness |
| `qa/verify-variants.py` | Deliberately broken variants to prove the tests detect regressions |
| `qa/remove-phase.py` | Surgical remover |
| `qa/test-removal.py` | Adversarial removal and byte-identity checks |
| `MANUAL-TESTS.md` | Owner's phone/laptop preview checklist |

## QA

Final combined run, **27 September 2026: 2,789/2,789 passed, zero failed suites** (2,577 retained
and 212 new). The runner is `qa/current-suite-runner.js`; pass it the canonical HTML path. This
final run includes the test-only Techniques focus-readiness correction described below.

The retained suites pass **2,577/2,577** on the final production build. Their named PASS/FAIL
results agree with the pre-release baseline; random dice values in diagnostic messages naturally
differ. The focused harness passes **212/212**, using 35 representative configured-entry fixtures.
These cover configurable types/custom renderers and Sacred Weapon auto-pick, not 35 distinct
schema types. The ten deliberately broken variants fail with exactly the pinned assertion IDs
and totals in `qa/expected-failures.json`.

| Deliberate fault | Expected failing assertions |
|---|---:|
| Release removed | 87 |
| Master switch off | 87 |
| Hotei mistakenly locked | 2 |
| Name locks omitted | 27 |
| Remove locks omitted | 37 |
| Selectors made global | 2 |
| Draft cancellation omitted | 2 |
| Dependant/Wealthy locks omitted | 3 |
| Grid/Confirm gate omitted | 1 |
| Stylesheet omitted | 36 |

The global-selector fault also blocks unrelated Roll/Cancel controls, ending the reroll scenario
early: its total is pinned at 205, versus 212 for every other variant. Fixture validity,
Management behaviour, retained Play actions, unchanged data and page-error checks deliberately
remain green when the part is absent: this part restricts editing, not the underlying rules.
Removed, switch-off and parent-off boundary probes give the same unlocked baseline behaviour.

Removal: **21 tests, 20 passed and one Windows symlink skip**. Shared removal-chain tests:
**11/11**. The oldest Phase 11 live-tree removal fixtures: **2/2**, exercising the later-release
chain including this release. Rebuilding after removal gives the exact pre-release SHA in
`ROLLBACK.md`. The live build and deployment drift check pass.

Structural comparison with `d7ba875`: HTML markup is unchanged, all three script blocks remain,
and the two non-sheet script blocks are unchanged. The sheet/CSS gain only the owned release
fragments and test seam. Of the retained output, all 2,086 explicitly named PASS identifiers match
the baseline; the full suite's total also includes checks reported in other formats.

An intermediate combined run reported 2,780/2,782: the then-205 new checks passed, but the older
Techniques test missed its initial `!` keystroke and the next assertion inherited that mismatch.
The exact cause was not reproduced in instrumented baseline/current runs. Its helper previously
sent keyboard input after an unchecked `focus()`. A **test-only** change now waits for the active,
non-inert tab, uses an actionable browser click and verifies focus first. All 16 original outcome
assertions are unchanged: **16/16 on both the exact removed baseline and current build**, with
all six of that older part's pinned negative variants still matching. No Techniques production
code was changed. The final combined result above is the subsequent complete run.

Chromium screenshots at 390px and 1440px were inspected: Management controls are absent in Play
while the contextual controls remain visible. This is not a real iPhone/Safari/PWA check; owner
device review is still required before merging. Downloaded web fonts were unavailable in the
headless check, so this is not a claim of pixel-identical typography.

### Regression matrix

| Area | Risk | Validation |
|---|---|---|
| Configuration and purchase fields | High | 35 configured fixture entries covering configurable schema/rendering families plus Sacred Weapon auto-pick; Management editing, Play locks, reopening and rebuilt rows |
| In-play effects and resources | High | Actual contextual toggles, court selection/session, checks, resource spend/reset and rerolls; retained rules suites |
| Shared modal | High | Cancel open drafts on mode change; prevent stale Confirm; newly opened draft starts with saved configuration |
| Scope | High | Techniques, other dialogs and naturally unavailable resource actions retain their own behaviour |
| Persistence and XP | High | Mode changes leave collected character data unchanged; full retained save/XP tests |
| Presentation | Medium | Narrow/wide screenshots, hidden purchase actions and read-only text; owner Safari review pending |
| Kill switch and removal | High | Disabled and removed variants, pinned negative tests, exact rebuild, ownership scan and older removal chain |

## Dependencies

This part has a hard dependency on Phase 12 part 1 (`MODES12`) and its mode gate/observer. It also
has guarded, soft integrations with Phase 4.5's configuration modal, 4.5.8's Dependant fields,
4.5.17's Wealthy purchase controls and 4.5.21's Hotei action. Their rollback documents name this
consumer. It owns no Advantage or Disadvantage rules, save schema or modifier registry seat.
Remove this part before removing Phase 12 part 1.

The `MODES125_ENABLED` switch controls installation. The `pm125-enabled` body class activates
this part's CSS only after installation, so disabling the JavaScript does not leave a CSS lock
behind. Source, CSS and the test seam use the release's own markers. Run the ownership scanner
from the canonical Phase 0 directory, not the repository root:

```text
python qa/feature-dependencies.py src/sheet/209.99993-feat-modes-advantages.js "PART K PHASE 12.5" --also pm125-enabled
```

The shared removal registry records release order: 12.5 follows 12.6 because that is their actual
build order. Number order must not be substituted for dependency order.

## Existing issue found during QA (not fixed by this release)

Dependant's optional inline name/arrangement fields can discard typed text in Management. The
fixture starts with `Akiko`, types `New name`, then blurs; saved configuration still says `Akiko`.
The same result is reproduced on the exact removed baseline, with this release disabled, and
with the parent mode feature disabled. The provider commits on `change`, while the list's
existing `input` listener recalculates and reconstructs these fields before that commit.

The new mode tests separately assert read-only/input-event blocking in Play and direct `change`
commit restoration in Management. They do not claim to fix normal typing. This is recorded as
a separate backlog bug in both ledgers; it requires its own scoped fix and real typing regression
test. No existing feature was changed to conceal it.
