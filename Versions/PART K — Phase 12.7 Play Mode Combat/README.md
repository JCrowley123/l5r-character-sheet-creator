# PART K — Phase 12.7: Combat in Play only

Combat is a Play tab. In Management it does not appear: not in the tab bar, not in the swipe loop.
Nothing inside Combat is locked by the mode, and no combat rule, value or save field changes.

Branch: `claude/phase-12-7-combat-visibility`. Built 30 September 2026 on the owner's instruction
to start 12.7. **Awaiting the owner's device test; not merged.**

## The ruling, reconciled

The Phase 12 table (owner, 25 September) says Combat is "Full functionality" in Play and "Does not
appear — no mode toggle affects this tab" in Management. Older prose in the same section calls
Combat "mode-independent" and asks for tests that it "renders identically regardless of mode". The
audit and the 28 September handoff read these together, and so does this part: **the mode never
changes anything inside Combat; it only decides whether the tab is there.** The tests check both
halves: nothing in Combat is locked in Play, and the page is gone in Management.

## Behaviour

- **Management:** Combat leaves the carousel through its own conditional-page path, the one Spell
  Slots already uses. It is not a tab, `goToTab('Combat')` finds nothing, and swiping skips it.
- **Play:** Combat is back in its place, between Techniques (or Spell Slots) and Equipment.
- **Switching** takes effect at once (the tab bar is right in the same task as the switch).
  Switching to Management while on Combat lands on **Equipment**, the next tab, rather than the
  carousel's default fallback of the first tab. Otherwise the current tab is kept either way.
- **Printing** still includes Combat in either mode: a printed sheet is the whole character.
- **Unchanged:** combat values and stance, Combat's controls in Play, Spell Slots' own visibility,
  saves (the mode is not character data), the carousel code itself.

## How it works

`src/sheet/209.99995-feat-modes-combat.js` (`MODES127`, switch `MODES127_ENABLED`) runs before the
carousel starts. It gives the Combat page `data-visible-with="#pm127CombatShown"` and creates that
element at the end of `<body>`, **outside the carousel**, so Safari's report of `display:none` for
everything inside a hidden page (BUGFIX — Spell Slots Tab on Safari) cannot reach it. It wraps
`MODES12.refresh` by property, so every mode change hides or shows that element and calls the
carousel's `refreshVisibility()`. The carousel's own MutationObserver would follow too, but only
asynchronously.

Landing on Equipment needs one detail. `goToTab()` commits the new tab at once but also starts a
smooth glide to Equipment's old position. Once Combat is removed, Equipment sits exactly where the
track rests, so the carousel sees nothing to correct and the glide runs on to Background and back:
measured, a visible swing of about 370 px within 150 ms. Any scroll ends a smooth scroll in progress
(CSSOM View), and the track has no `scroll-behavior`, so one instant `scrollLeft` assignment stops
it. The first harness run caught this (five landings on Background); a pinned variant keeps it caught.

`src/css/59.9995-feat-modes-combat.css`: in print, a hidden Combat page is displayed. The print
unwind in `20-carousel.css` hides every hidden page, which would otherwise drop Combat from a sheet
printed in Management. Active only under `body.pm127-enabled`, which the fragment sets on install.

## Files

| File | Purpose |
|---|---|
| Phase 0 `src/sheet/209.99995-feat-modes-combat.js` | `MODES127` (`PART K PHASE 12.7`) |
| Phase 0 `src/css/59.9995-feat-modes-combat.css` | Combat prints in either mode |
| Phase 0 `src/sheet/210-test-seam-and-init.js` | `modes-combat-seam` block: exports `MODES127`, `MODES127_ENABLED` |
| Phase 0 `build/manifest.json` | Two entries, new expected hash |
| `QA — Removal Chain Registry/removal_chain.py` | One entry at the end of `CHAIN` |
| Three retained harnesses | Test-only corrections; see *Retained tests* below and `ROLLBACK.md` |
| `qa/combat-harness.js` | 55 checks; `--absent` states the "Combat always shown" expectations |
| `qa/verify-variants.py`, `qa/expected-failures.json` | Nine broken variants with pinned failures, three boundary builds |
| `qa/current-suite-runner.js` | Chains the Dependant bugfix's full runner and this harness |
| `qa/remove-phase.py`, `qa/test-removal.py` | Surgical remover and its adversarial tests |
| `originals/` | Verbatim copies of the three retained harnesses before correction |
| `MANUAL-TESTS.md` | Owner's iPhone checklist |

## Retained tests

Measured first with a prototype, before writing this part's own tests: the full suite then gave
2,827/2,833, all from **three retained harnesses that assumed Combat is reachable from a fresh page**,
which opens in Management by the owner's default-mode ruling. None showed a product defect:

- **Phase 1.6 wounds** (23 checks) and **Spell Slots Visibility Race** (6) tapped the Combat tab
  from a fresh page and timed out.
- **Spell Slots on Safari** counted hidden pages expecting exactly one (Spell Slots); Combat made two.

Each was corrected test-only, with the reason in a comment at the change: enter Play to use Combat
(1.6 returns to Management for its Stamina/Willpower fixture writes, which Play locks); and discount
Combat from the hidden-page count only when this part hid it. All three pass in full **with this
part and against `main` without it**; 1.6 gives the same 23 named results as its original on
`main`. Originals are in `originals/`. An earlier attempt at the 1.6 correction (Play throughout)
failed one check on both builds, and was replaced rather than weakened.

## QA (30 September 2026, Windows desktop, Chromium via Playwright 1.63)

**Final combined run: 2,917/2,917, zero failed suites** (2,862 retained + 55 new), with
`qa/current-suite-runner.js` on the build below. Its 2,357 distinct named retained results are
identical to `main`'s final run of the same suites, including the three corrected harnesses
(Phase 1.6 wounds 23/23, Spell Slots Visibility Race 6/6, Spell Slots on Safari all passing).

| Build | Bytes | SHA-256 |
|---|---:|---|
| This part (branch) | 3,109,466 | `47fdb778d72b6febe3a4767a80a94cf1e308eaa25f9316d1cabdd195fc6c6d83` |
| `main` before it (`ca152c3`) | 3,104,431 | `2c8a426f85d00d1637a9ec48453ac01b3600b5193494aae342f3b5113e3c4fc6` |

An earlier pinned-variant and full-suite run coincided with the machine stalling for about an hour;
three harness runs then failed at their very first page load. Those results were discarded, the
harness's readiness waits (page load, not any assertion) were given 60 seconds, and the whole
final sequence was rerun: the figures here are from that rerun.

**This part's harness: 55/55** on the final build (two concurrent runs). Oracles are the carousel's
own API and tab bar, `collectData()` and computed styles, never `MODES127`. **Against `main`
without this part it gives 38/55** with the normal expectations, and **55/55 with `--absent`**.

| Scenario | Checks | What it drives |
|---|---:|---|
| Start | 7 | Fresh page: Management, no Combat tab, not reachable, page hidden, 8 tabs, swiping skips it |
| Play | 7 | Tab bar right in the same task; current tab kept; order; tap to Combat; a Combat control works; nothing in Combat locked |
| Leave | 7 | From Combat into Management: same-task hide, lands on Equipment and stays (sampled over 500 ms), combat state kept, back to Play |
| Repeat | 5 | Five round trips from Combat: every landing Equipment, data unchanged, no duplicate tabs, clone count stable |
| Loop | 6 | Wrap-around both ways in both modes; no clone carries the gate |
| Spell Slots, plain and Safari-emulated | 5 + 5 | A shugenja: Spell Slots in both modes, Combat only in Play, order, staying on Spell Slots across a switch |
| Open | 5 | Save As, reload, open from the Characters list (Play, Combat shown, data intact); toolbar New hides it again |
| Print | 5 | Print media: Combat shown in Management and Play; a non-caster's Spell Slots still omitted; screen restored after |
| Desktop | 3 | 1280 px wide, both modes |

Phone-width runs use a touch context, as on a phone.

**Deliberate faults**, each built in a scratch copy, all failing with exactly the pinned assertions
in `qa/expected-failures.json` (discovered, then confirmed by a separate pinned run):

| Variant | Result |
|---|---:|
| Part removed (rebuild SHA checked equal to the pre-part build) | 38/55 |
| Master switch off | 38/55 |
| No immediate refresh (observer only) | 53/55 |
| No move to the next tab (lands on the first tab) | 52/55 |
| Glide not stopped (swings to Background) | 53/55 |
| No print stylesheet | 54/55 |
| Print rule never activated | 54/55 |
| Shown in the wrong mode | 33/55 |
| No parent guard, with Phase 12's switch off (run `--absent`) | 25/55 |

**Boundaries**, all 55/55 with `--absent`: this part removed, its switch off, Phase 12's switch off.

**Removal:** `qa/test-removal.py` **24 tests, 23 passed, 1 skipped** (Windows refuses symlinks
without Developer Mode); the live-tree test rebuilds exactly the pre-part `main`. Shared registry
`qa/test-chain.py` **11/11**. The Dependant bugfix's and Phase 11's live-tree removals, which strip
every later release through the chain including this one, pass. `qa/feature-dependencies.py …
"PART K PHASE 12.7" --also pm127-enabled pm127CombatShown`: every reference is inside a block this
part owns. `build.py --check-drift`: identical to the Phase 0 build. `qa/inventory.py` against
`main`: 270 element IDs, all unique, every other count unchanged; only the sheet script and CSS differ.

**Not tested here:** Safari and real touch swiping (only Chromium is installed; the Safari
hidden-page behaviour is emulated with one test-only rule, as in the Safari bugfix); an actual
printout (print media is emulated). See `MANUAL-TESTS.md`.

### Regression matrix

| Area | Risk | Validation |
|---|---|---|
| Combat hidden in Management, shown in Play | High | Start, Play, Leave scenarios; variants |
| Navigation when Combat disappears | High | Leave and Repeat scenarios (sampled landings); two variants |
| Carousel loop and clones | Medium | Loop scenario, clone-count stability |
| Spell Slots and the Safari bug | High | Spell Slots scenarios, plain and emulated; retained Safari and Visibility Race suites |
| Combat behaviour and data | High | Play control check; data unchanged across switches; full retained suite including 1.6 and Part C |
| Printing | Medium | Print scenario; two variants |
| Removal and switch-off | High | Byte-identical rebuild, boundaries, removal chain, ownership scan |
