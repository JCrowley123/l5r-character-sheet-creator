# BUGFIX — Dependant Inline Typing

Dependant's two optional row fields (*Who depends on you*, *The arrangement*) lost what the player
typed. Found during Phase 12.5 QA on 27 September 2026 and recorded in both ledgers; reproduced on
the pre-12.5 build and with every mode feature switched off, so it belongs to Phase 4.5.8, not to
Phase 12 or 12.5.

Branch: `codex/dependant-typing`. Started by Codex on 28 September, interrupted by a laptop crash,
finished by Claude on 30 September. **Confirmed on the owner's iPhone on 30 September and merged to `main`.**

## The bug, measured

Phase 4.5.8 commits the fields on `change` (blur or Enter), deliberately, because the row is
rebuilt on every refresh. But the Disadvantages list has its own `input` listener that runs
`recalcAll()`, which rebuilds every configured row. So the **first keystroke** replaced the field
being typed in: the list recalculated before any commit, the new field showed the old saved value,
and the remaining keystrokes went nowhere. Measured on the unfixed build: replacing `Akiko` with
`New name` saved `N` and displayed `Akiko`.

Phase 4.5.8's harness assigned values and dispatched `change` directly, so it passed (55/55) while
real typing failed. This folder's harness types with the keyboard.

## The fix

One fragment, `src/sheet/209.99994-bugfix-dependant-typing.js` (`DEPTYPE`, switch
`DEPENDANT_TYPING_ENABLED`), plus one seam block. It wraps two existing functions by property; it
adds no CSS, markup, save field or modifier-registry seat, and changes no rules or prices.

1. **Every keystroke is saved** to the row's configuration, trimmed exactly as 4.5.8 trims it.
2. **The row being typed in is not rebuilt** while one of its two fields has focus (`D45.refresh`
   is skipped for that one row); every other row refreshes normally. This keeps the caret,
   selection and IME composition through the list's recalculation and any other.
3. **Committing does not rebuild mid-focus.** 4.5.8's own `change` handler called `recalcAll()`
   synchronously, during the focus transfer, which replaced whatever editor the player was moving
   into: the other field, another Dependant row, or a **Change** button, whose first click was then
   lost. A capture listener on the fields' wrapper saves the value exactly as 4.5.8 does and stops
   that handler.
4. **The row is repainted once focus is not in it**, so its summary shows the new name and the
   fields show the trimmed text. The repaint is scheduled on commit and on blur, runs after any
   focus transfer has finished, and touches only this row, never the whole list. With focus still
   in the row (the other field, its Change button, or after Enter) it waits until focus leaves.

Play mode is unaffected: Phase 12's gate and 12.5's selectors lock the fields at document capture,
before any of this fix's listeners run.

### What changed from Codex's version

Codex wrote the fix up to 13:25 on 28 September; its own harness had not been run when the laptop
crashed. Running it here found **8 of its 64 checks failing** on that version. Codex's version did
(1) and (2) and stopped each keystroke propagating, but left 4.5.8's synchronous commit in place
and repainted by calling `recalcAll()` after blur. Moving straight from the name field to the
arrangement field (with Tab or a tap), or into another Dependant row, therefore still lost the next
text typed, and a button in another row could lose its first click. Points (3) and (4) replace
those.

Two further corrections came from the tests here. The keystroke `stopPropagation` was removed: a
pinned variant showed no check changed without it, because (2) already protects the focused row,
so it only suppressed the list's normal recalculation. And the first full-suite run failed one
retained check, Phase 4.5.8's `D458-OPTIONAL-02` (*a name commits on change and reaches the
summary*): with 4.5.8's handler stopped, a change sent while nothing in the row had focus no longer
repainted it. The repaint is now scheduled on commit as well as on blur, and that run's result is
superseded by the final one below.

Nine checks were added for these routes (`CROSS-*`). On Codex's build the harness now gives
**61/73**.

## Files

| File | Purpose |
|---|---|
| Phase 0 `src/sheet/209.99994-bugfix-dependant-typing.js` | The fix (`BUGFIX DEPTYPE`) |
| Phase 0 `src/sheet/210-test-seam-and-init.js` | `dependant-typing-seam` block: exports `DEPTYPE`, `DEPENDANT_TYPING_ENABLED` |
| Phase 0 `build/manifest.json` | One fragment entry, new expected hash |
| Phase 0 `qa/feature-dependencies.py` | `MARKER_RE` tells `BUGFIX DEPTYPE` apart from the bare `BUGFIX` |
| `QA — Removal Chain Registry/removal_chain.py` | One entry at the end of `CHAIN` |
| `qa/dependant-typing-harness.js` | 73 checks: real keyboard, clipboard and mouse input; persistence; modes; viewports |
| `qa/verify-variants.py`, `qa/expected-failures.json` | Eight broken variants with pinned failures, three boundary builds |
| `qa/current-suite-runner.js` | Chains Phase 12.5's full runner and this harness |
| `qa/remove-phase.py`, `qa/test-removal.py` | Surgical remover and its adversarial tests |
| `MANUAL-TESTS.md` | Owner's iPhone/laptop checklist |

## QA (30 September 2026, Windows desktop, Chromium via Playwright 1.63)

**Final combined run: 2,862/2,862, zero failed suites** (2,789 retained + 73 new), on the build
below, with `qa/current-suite-runner.js`. The retained results' 2,284 distinct named PASS
identifiers are identical to Codex's pre-fix baseline run of the same suite on 28 September.
Phase 4.5.8's own harness: **55/55**.

| Build | Bytes | SHA-256 |
|---|---:|---|
| This fix (branch) | 3,104,431 | `2c8a426f85d00d1637a9ec48453ac01b3600b5193494aae342f3b5113e3c4fc6` |
| `main` before it (`a563b59`) | 3,100,276 | `4f8509e68a05054b2c813575f77750c4598a9b4295d18faf266ecc10de06413a` |

**Harness: 73/73** on the final build, three concurrent runs, all 73/73. Its oracles are the
rendered inputs, `collectData()`, `localStorage`, the downloaded export file and a page reload,
never `DEPTYPE` itself. **On the unfixed `main` build it gives 20/73**, so it can fail for the
right reason; the 20 that pass are fixture, Play-lock, viewport-visibility and click checks that do
not depend on typed text surviving.

| Scenario | Checks | What it drives |
|---|---:|---|
| Name field, arrangement field | 16 + 16 | Typing, caret, mid-word insert, delete, a forced recalc while focused, selection replace, Unicode paste, clear, whitespace kept while typing and trimmed on save and blur |
| Isolation | 7 | Two Dependant rows edited; other fields, the rest of the character and Wrath of the Kami unchanged; summary updated |
| Cross | 9 | Straight from one row's field into another row's; Enter then leave; a scripted change with nothing focused; human-paced clicks on another row's and the same row's Change button |
| Persist | 9 | Save As, autosave of each field, Save, Load, Export, Import, page reload through the Characters list |
| Mode | 10 | Draft survives entering Play; read-only, keyboard, input and change gates in Play; three round trips; editing restored; Tab between fields; a Play toggle still works |
| Viewport | 6 | 390 px and 1280 px wide |

**Deliberate faults**, each built in a scratch copy, all failing with exactly the pinned
assertions in `qa/expected-failures.json` (discovered, then confirmed by a separate pinned run):

| Variant | Result |
|---|---:|
| Fix removed (rebuild SHA checked equal to the pre-fix build) | 20/73 |
| Master switch off | 20/73 |
| Keystrokes not saved | 56/73 |
| Focused row rebuilt anyway | 24/73 |
| Commit rebuilds mid-focus (Codex's gap) | 61/73 |
| No repaint after leaving the row | 72/73 |
| No repaint after a commit | 72/73 |
| Repaint even while focus stays in the row | 72/73 |

**Boundaries**, all fully green: Phase 4.5.8 switched off, run with `--provider-absent` (3/3: no
fields, no errors); Phase 12's parent switch off and 12.5's switch off, each run with `--mode-off`
(73/73: the fix works without the modes, and Play simply no longer locks the fields).

**Removal:** `qa/test-removal.py` **26 tests, 25 passed, 1 skipped** (Windows refuses symlinks
without Developer Mode). The live-tree test removes this fix from a copy and rebuilds to exactly
the pre-fix build above. Shared registry `qa/test-chain.py` **11/11**. Phase 11's live-tree removal
tests, which strip every later release through the chain including this one, **2/2**.
`qa/feature-dependencies.py … "BUGFIX DEPTYPE"`: every reference is inside a block this fix owns.
`build.py --check-drift`: identical to the Phase 0 build.

**Structure** (`qa/inventory.py`, against `main`): 270 element IDs, all unique, and every other
count unchanged; only the sheet script differs.

Not tested here: Safari and real touch keyboards (headless Chromium only; see `MANUAL-TESTS.md`),
and IME composition beyond the refresh skip that preserves it. The web fonts do not load in this
environment, so nothing here is a claim about pixel layout.

### Regression matrix

| Area | Risk | Validation |
|---|---|---|
| Typing in either field | High | Harness name/arrangement scenarios; eight pinned variants |
| Moving between editors | High | Cross scenario, Tab continuation, button clicks after typing |
| Commit reaching the summary | Medium | Cross scenario (Enter then leave, scripted change); 4.5.8's own harness |
| Persistence | High | Autosave, Save, Load, Export, Import, reload |
| Play lock | High | Mode scenario; boundaries with Phase 12 or 12.5 off |
| Other Advantage/Disadvantage rows | Medium | Isolation scenario; full retained suite including 12.5's 212 checks and 4.5.8's 55 |
| Removal | High | Byte-identical rebuild, removal chain, ownership scan |

## Recovery note

A laptop crash on 28 September, after Codex's last write at 13:29, overwrote this folder's first
`ROLLBACK.md` and `qa/remove-phase.py` with unrelated bytes, and corrupted one object in the local
Git repository and three committed documents. Git was repaired from GitHub and the documents
restored byte-for-byte. The two lost files were rewritten: `remove-phase.py` against the surviving
`test-removal.py`, which the original passed with the same 26-test result, and `ROLLBACK.md` from
the release as it now stands. The intact Codex work was snapshotted as commit `cb777fb` before any
change.
