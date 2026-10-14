# Claude — next-session kickoff: finish Cycle 1 (written 14 October 2026)

The owner chose (14 October, at the kickoff's 18-point line) to **finish Cycle 1 in a fresh session**. The approved
scope and rules are still `CLAUDE-SESSION-KICKOFF-CYCLE-1-2026-10-14.md`; this file says what is done, what the owner
has since decided, and what is left. Merge only on the owner's word; start nothing else.

## Start of session

- Remote Control on, keep-awake, meter reading (`get_usage`) with the time.
- Canonical checkout `C:\Users\jcrow\l5r-character-sheet-creator`, branch **`claude/cycle-1-2026-10-14`** (pushed; never
  force-push). Stage exact paths only; leave `Characters/`, `tmp/`, Word files and owner-deleted kickoffs alone.
- Build: six layers, **3,831,761 bytes, SHA-256 `d460d6e1ac8d5a2729bc2ea100d41956456a01449bd1df2f9b431f4b45e902b4`**
  (`build/manifest.json` agrees; `recombine.py --verify` byte-identical).
- Read: this file; each layer's README (below); `QA — Cycle 1 2026-10-14/README.md`. Do not read the ledger, roadmap or
  `CLAUDE.md` in full.

## Built (each with folder, marker, switch, README, ROLLBACK, MANUAL-TESTS, pinned variants, removal proof, registry)

| Layer | Folder | Checks (candidate / `main`) |
|---|---|---|
| 1 | BUGFIX — Search Focus on Close (FT-34) | 12/12 / 5/12; dependency 15/15 |
| 2 | BUGFIX — Printed Weapon Text (FT-30) | 15/15 / 6/15; dependency 12/12 |
| 3 | PART K — Phase 14.3a Skill, Weapon and Spell References (all 357 cited) | 32/32 / 8/32; dependency 23/23 |
| 4 | BUGFIX — Search Keystroke Speed (owner: keep) | 7/7 / 3/7 |
| 5 | BUGFIX — Print Copies Cleanup (owner: keep) | 6/6 / 2/6 |
| 6 | BUGFIX — Screen Focus from the App Bar (owner: build it) | 11/11 / 5/11 |

Also: the Library desk check is in the roadmap's Phase 13 section; the Manage harness waits for the settled press
(retained test change, `QA — Cycle 1` README); Phase 14's Search harness and Phase 14.1's dependency harness carry
recorded, oracle-aware adaptations (originals kept). **14.3b** (Schools, Techniques, Clans & Families) is next cycle.

## Owner decisions, 14 October 2026

1. **Keep both extra fixes** (Layers 4 and 5).
2. **Page numbers matching digit searches: accept, and record the refinement** (bare numbers match pages only when
   typed like "p 173") as a backlog item. *Not yet written into the roadmap.*
3. **Fix the reopened-entry focus gap this cycle:** done as Layer 6, which fixes the root cause (the app bar hides the
   Characters screen's tabs, so its own focus call failed).
4. **Fill the Emptiness** (owner found it: Core p.196, printed "Fill with Emptiness"): added; see 14.3a's SOURCES.md
   for why it was missed and the two uncapped checks added.

## Left to do, in order

1. **Phase 12 typing race** (`PM12-MANAGEMENT-TYPING-WORKS`, `PM12-PLAY-TYPING-BLOCKED`, `PM12-MODE-NEVER-SAVED` in
   `PART K — Phase 12 Play and Management Modes/qa/modes-harness.js`): the first real keystrokes on a fresh page
   sometimes do not reach the Notes box. **Also fails on `main`** (1 standalone run in 5); it cost full run 2
   (5,226/5,229). **Cause found: a carousel start-up race a user can also hit**; build the recommended removable fix
   ("Investigation" below). No check is to be weakened.
2. **App Bar harness** (`PART K — Phase 11.3 App Bar/qa/appbar-harness.js`): `AB-WIDTH-320/375/390` failed (22/25) in
   two batch runs after Layer 6 was added (a click waited 30 s for the bar's Search button) but passes on its own
   (9/9). The first failing batch overlapped the investigator's 32 browsers. Re-run the same batch several times on a
   **quiet** machine before anything else; if it fails, investigate before the full suite.
3. **One full run** on a quiet machine, nothing else running and no helpers: `python qa/final-qa.py` in
   `QA — Cycle 1 2026-10-14/qa` (background, wait for the notification). Expect **5,240/5,240** (103 leaves, 84
   wrappers), then all six layers removed through the registry rebuilding `main` exactly (3,800,283 bytes,
   `7b68f34d…`) and the retained suite **5,107/5,107**. Results go to `qa/final/`; runs 1–2 are kept as
   `final-run-1/` and `final-run-2/`.
4. **Records, short:** one ledger entry at the top with the cost table below; roadmap status rows (14, 11.1) and a short
   amendment (the 14.3a/14.3b split, decision 2's backlog item, the desk check done); one pointer in `CLAUDE.md`
   (it has 8 deliberate CR bytes: count with Python before and after, or append with `cat >>`). No `BUILD-LEDGER.html`.
5. **The rulings batch** (drafted below) and the report. Then wait for the word to merge; after it: deployed bytes,
   Search 62/62 live, and one combined checklist (every layer's MANUAL-TESTS plus 14.2's R1–R6 on the iPhone).

## Meter readings for the cost table (shared Pro account)

| UTC, 14 October | Weekly | 5-hour | Point |
|---|---:|---:|---|
| 13:15 | 3% | 18% | start |
| 13:38 | 6% | 45% | Layer 1 committed |
| 13:50 | 8% | 57% | Layer 2 checks |
| 14:21 | 11% | 77% | Layer 3 QA |
| 14:35 | 12% | 89% | review launched; full run 1 next |
| 17:43 | 15% | 11% | after the 5-hour reset; continuation |
| about 19:00 | 21% | 56% | Layer 6 built; paused at the 18-point line |

Helpers used: two failing-test investigations (load failures; the Phase 12 race) and one code review.

## Lessons from this session (do not relearn)

- **Never conclude "not found" from capped output.** A three-page cap on a search printout hid Core's Fill with
  Emptiness. Cap only what you display after you have counted every hit.
- **Heredocs drop backslashes, even quoted ones** (`'\\n'` became a newline three times). Write scripts to files.
- **Do not measure timing-sensitive harnesses while a helper runs browsers in parallel**; check
  `tasklist | grep -ci headless` first. A stuck probe that never closed its browser idled through full run 1.
- A guard check must establish its own premise (the Characters screen makes the sheet inert, so "focus stays in the
  field" was untestable with a sheet field; Layer 6's harness uses a test-only box and checks focus first).
- Run every harness that touches the same public functions before committing a layer (Layer 6's first rule was caught
  by Layer 1's guard; Layer 1's render wrapper had earlier broken a 14.1 dependency check).

## Rulings to present (drafted; each needs the owner's choice)

1. **Library scope.** Facts: 16 PDFs, about 1.45 GB, 29–152 MB each, all searchable, 12 with working bookmarks, page
   labels wrong in 8. Options: (a) open the owner's own file at the cited printed page, picked on the device, no
   storage; (b) store the books inside the app (1.45 GB on an iPhone: quota and memory risk); (c) a book list with
   bookmarks first, deep links later. **Recommend (a)** as the first release and iPhone feasibility test, using the
   largest book (Imperial Histories 1, 152 MB) as the test.
2. **School flavour text (Phase 9).** Which: Core's Schools first, or all 105. Length: one or two sentences, own words,
   with the page. Where: Search's School detail and the School info panel. **Recommend** Core's Schools first.
3. **FT-16 fuller descriptions.** Options: only empty or one-line descriptions; all categories; defer to Phase 15.
   **Recommend** empty and one-line descriptions only, category by category, after 14.3b.
4. **Supplement scope** (Stations, Naga Ancestry, Trials of the Imperial City, Wanderer, Imperial City Stigma's cost).
   Options: all selectable; Rokugani-usable ones selectable with Naga/Nezumi-only as reference; defer. **Recommend**
   the middle option.
5. **D06 Weakness's boundaries and Hotei.** Options: record with page only (no automation); automate after a book
   reading; defer. **Recommend** record first; automate once the owner rules on the boundaries.
6. **Phase 6's engine scope.** Options: the original SynergyEngine (technique/kata/school synergy flags); a narrow
   first release (Kata eligibility and data-backed roll modifiers only); drop. **Recommend** the narrow first release.
7. **Phase 7's audit log.** Options: drop (Save As a copy is the manual snapshot; saves already version and migrate);
   a short per-character change history; the full append-only log. **Recommend** drop.

## Investigation (Phase 12 typing race)

**Cause (failing-test investigator, 14 October; reproduced on `main` with the unmodified harness): a start-up race in
the swipe-tab carousel, `src/layer/10-carousel.js`, not a Phase 12 bug.** `CL11.ready` is true at DOMContentLoaded and
`page.goto` returns at `load`, but two carousel start-up steps can still be pending: the `scrollend` from its opening
`jumpToSlot(1)` (dispatched at the first rendered frame, which can come after `load`), and `reflow()`, 60 ms after the
ResizeObserver's first notification. The helper's `goToTab('Background')` starts a glide of about 0.9 s; on its first
frame `onScroll` sets `current` back to the page it is leaving and `syncTabs()` re-inerts Background. Then either the
stale start-up `scrollend` runs `onSettle()`, or the start-up `reflow()` jumps to `current` and cancels the glide.
Both call `resolveSettled()`, so `whenSettled()` resolves **true while the wrong page shows**; `focus()` on a field in
an inert page is silently ignored and the keystrokes go to `<body>`. Evidence: page timelines of three failing runs
(nothing wrote to `#f_notes`; mode stayed management; no keydown prevented). Idle machine: 0 failures in about 150
runs; under 10–12 CPU burners: 7 of 139 runs failed with exactly the three IDs; a start-up move forced pending when
the test begins: `main` 4/4 failed.

**A user can hit it:** the same `reflow()` runs on every resize. Tapping the Background tab and resizing 150 or 400 ms
into the glide leaves `main` on another page (Rings & Traits or Equipment) 4/4; rotation, browser toolbars or a
closing Android keyboard are real triggers. About 20 retained harnesses use `goToTab` + `whenSettled` and share the race.

**Recommended fix (production; a small removable layer, owner's rule):** keep the destination of a programmatic move
until the track rests on it. In the carousel: a `navTarget` (and `navRetried`) set by `goToIndex` and cleared by
`step()`, a touch start and an arrival; `onScroll` does not change `current` while `navTarget` is set; `onSettle`
re-issues the glide once if the track settled anywhere else. With `current` held, `reflow`, `rebuild` and
`reassertPosition` all re-assert the destination. The exact patch is
`QA — Cycle 1 2026-10-14/investigation/carousel-destination-patch.py` (seven replacements, scratch tool; the layer must
carry its own markers in the carousel file, as earlier carousel bugfixes did, and be surgically removable). Validation
of the patched copy of `main`: under the same load main failed 2/45 and patched 0/45
(`investigation/phase12-modes-ab-under-load.txt`); quiet 3/3; forced pending start-up move 4/4; resize case 4/4.
**Not yet run against it:** Part F's `behaviour-harness.js` and the carousel harnesses, Part H's
`ui-foundations-harness.js` and `safari-tab-harness.js`. Optionally clear `navTarget` on `wheel` for desktop.

**For the next session:** build this as `BUGFIX — Carousel Settles on Its Destination` (or similar), with a harness
that fails on `main` deterministically (the forced pending-start-up case and the resize-during-glide case), pinned
variants, removal proof and registry entry; then re-check the App Bar batch (step 2) before the single full run. The
owner decides keep or drop before the merge, as for Layers 4 and 5.
