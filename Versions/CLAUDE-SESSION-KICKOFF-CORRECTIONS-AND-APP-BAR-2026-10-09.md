# Claude — next-session kickoff: Search corrections, two 4.5.33 refinements and the app bar (9 October 2026)

Prepared at the owner's request after their check of Phases 14 Search, 4.5.33 and 4.5.34 (18 Pass, 2 Fail). **This file
carries the owner's approval** for the work under "Approved work" (their answers of 9 October, quoted below). Build that
work, verify it, and stop: merge only on the owner's word, and start nothing else.

It supersedes `CLAUDE-SESSION-KICKOFF-NEXT-SESSION-2026-10-09.md`, which the previous session started from and finished.

The project is the **L5R 4th Edition single-player character sheet**: a player companion in the spirit of D&D Beyond, not a
combat engine or virtual tabletop. Repository: https://github.com/JCrowley123/l5r-character-sheet-creator. Live site:
https://l5r-character-sheet-creator.pages.dev/.

## Start of session

- Turn Remote Control on and check keep-awake (memory `session-setup-remote-control`). Read the usage meter with
  `get_usage` (memory `usage-meter-readable`) and record it with a timestamp.
- **Canonical checkout: `C:\Users\jcrow\l5r-character-sheet-creator`.** Sessions may open in the OneDrive folder (an older
  clone); never build or commit there. `main` = `origin/main` at this kickoff's commit (after `44d5f26`). Four
  owner-deleted kickoff files, untracked Word documents and `tmp/` sit in the checkout: leave them; stage exact paths only.
  Keep `core.autocrlf=false`, `core.longpaths=true`. One branch per release, stacked; never force-push.
- Read, by section only:
  - Memory **`feature-structure-and-comments`**: the owner's rules for how a feature is built and commented. They apply
    to everything below, above all the app bar.
  - `Versions/CLAUDE.md`: the rules at the top (folder convention, surgical removability) and the dated note
    "9 October 2026 (Claude) — Phase 14 Search, Phases 4.5.33 and 4.5.34" (its lessons and the owner's check).
  - The three release folders: `PART K — Phase 14 Search/`, `PART I — Phase 4.5.33 Void and Initiative Entries/`,
    `PART I — Phase 4.5.34 Blind Armor TN Note/` (README, ROLLBACK, `qa/`).
  - `Versions/BUILD-LEDGER.md`: the current update and the open reminders. Roadmap: the amendment "Phase 14 Search,
    Phases 4.5.33 and 4.5.34 — 9 October 2026" and "REVIEW LATER — owner notes from the Search, 4.5.33 and 4.5.34
    check" (FT-15 to FT-20).
- The owner's checklist with their notes and 14 screenshots:
  https://claude.ai/code/artifact/34899d86-5be2-49aa-9734-689569e3cb1f (a Claude Doc: read it with the docs tools, not a
  web fetch). Screenshots are the artifact's assets: `Artifact list scope "assets"` on that link, then `Artifact read`
  with `path` = one asset id at a time (`paths` does not take asset ids).

## Approved work (the owner's answers, 9 October 2026)

> Fix S9 and S11 as recommended. Make your recommended change to Touch of the Void's automatic Willpower roll and the
> Initiative Score line. Build the app bar now [...] I am happy for the app bar to be at the top but make sure that this
> change is completely ring fenced. If I want to change the position of the app bar or the UI, or completely remove
> this app bar I can without having a wider knock on effect. Keep spell grouping in Search's second release.

### 1. S9 — the Characters screen's top bar scrolls away on the iPhone (a defect)

- **Evidence.** On the iPhone (Safari), the bar `‹ Sheet · Characters · Library · Search` was missing or cut off on long
  Search pages (the Search home, Skills, Alternate Paths, an Ancestor) and fine on short ones (a kiho, a spell, a
  weapon). Headless Chromium keeps it pinned (measured 9 October: its top stays at 0 through typing, opening entries and
  scrolling), so **a headless run cannot reproduce it**.
- **Cause, best evidence.** `.cl11-nav` is `position: sticky` inside `.cl11-view`, which is `position: fixed; inset: 0;
  overflow-y: auto; display: flex; flex-direction: column` (Phase 11, `59.993-feat-characters-list.css`). Sticky inside
  that fixed scroller is not reliable in Safari.
- **Fix, its own removable layer** (e.g. `BUGFIX — Characters Screen Top Bar`): `.cl11-view` stops scrolling (a flex
  column that fills the screen, `overflow: hidden`) and each `.cl11-panel` becomes the scroller (`flex: 1 1 auto;
  min-height: 0; overflow-y: auto; overscroll-behavior: contain`), so the bar is not inside any scrolling element.
  Check the Characters list, the Library placeholder, Search and anything else Phase 11 shows in that view.
- **Search's side** (Phase 14's own fragment, as a device correction; the 4.5.28 precedent): its scroll save and restore
  and "to top" use `root.closest('.cl11-view')`; make them use the nearest ancestor that actually scrolls, so Search
  works with the fix and without it. Blur the search box before an entry opens, so the iPhone keyboard closes.
- **Prove the structure, not the symptom:** the bar's ancestors do not scroll and its top stays at 0 whatever a panel's
  scroll; Phase 11's `characters-harness.js` and Search's harness still pass; no sideways scroll at 320, 375 and 390 px.
  The owner's iPhone decides.

### 2. S11 — ⋯ → Search must return to where you were

`SEARCHPAGE14.open()` clears `view.detailId` and resets the list's limit, so ⋯ → Search lands on the list while the
Search tab keeps the open entry. With no options, `open()` keeps the whole view state: the open entry, the category, the
text, the limit and the list's scroll position. With options it behaves as today. Phase 14 device correction; extend
`S14-STATE-KEPT` to the open entry and add a variant.

### 3. V2 — Touch of the Void: the Willpower roll opens by itself

- **Rule.** Core Rulebook p.162: every time you spend a Void Point (any use, not only on a roll), roll Willpower against
  TN 30 or be Dazed for one Round.
- **The owner's flow:** roll a Skill, tick Void +1k1, make the roll as usual (rerolls, Emphasis, Luck and the rest);
  when that roll window closes, the Willpower roll (TN 30) opens by itself. Their reasoning: the check is a side effect
  of having used Void. A Void card spend that makes no roll (Initiative +10, Armor TN, damage reduction, Kiho) opens the
  check at once.
- **Find every place a Void Point is really spent** (`consumeVoidPoint` in `160-feat-void.js`; the roll preview's
  commit; `spendVoid`; one-roll effects consumed in `rollWithModifiers`; spells; Kiho) and confirm one hook sees each
  spend exactly once. Queue the check after the current roll window closes; `showRollResult` takes
  `tnConfig.onClose`, so check how a close callback can chain. A cancelled roll spends nothing, so no check. Two
  spends, two checks. Only with Touch of the Void on its own list. The row's manual button stays.
- **Where:** 4.5.33's own fragment (a device correction), or a small layer if the hook grows. Tests through real
  controls, oracle the book.

### 4. V4 — an Initiative Score line on the Combat card

- **The owner:** "I was expecting a part in combat to tell me my initiative score and then if I click that button it
  changes my initiative score until I reset the combat." The sheet rolls Initiative but has never kept a score.
- **Recommended model.** The score = the total of the last Initiative roll made on the sheet, including whatever that
  roll already added (Void's +10, Quick's earlier uses), plus each Quick use recorded after that roll. Keep it in the
  trunk's round ledger (transient, cleared by Reset rounds, as Quick's uses already are). It must not count anything
  twice. Show it on the Combat card beside Initiative; on Quick Access too if it fits. No roll yet: the line says so.
  Consider letting the player type their own rolled total, since many roll real dice.
- **Ring-fence it as its own layer** (e.g. `PART I — Phase 4.5.35 Initiative Score`); Quick's row then reads it when
  present (a declared dependency), and works as today without it.

### 5. The app bar — now, at the top, completely ring-fenced

- **What.** One app-level bar visible on every screen (the sheet and the Characters screen): **Sheet · Characters ·
  Library · Search**, with the current one marked. It is D&D Beyond's bottom bar, placed at the top because the sheet's
  page tabs (Clan & School, Identity...) already use the bottom.
- **Ring-fenced, in the owner's words:** change its position or its look, or remove it completely, "without having a
  wider knock on effect". So:
  - A logic module (the app's sections and a navigation interface: `sections()`, `current()`, `show(section)`, a change
    notice) separate from the UI module that draws the bar. The position comes from one setting (`'top'` or `'bottom'`)
    in the UI module.
  - Its own stylesheet and own classes, one guarded seam block, and its hooks marked `// UI hook:`.
  - Navigation reuses what exists: Sheet = `CL11.close()`; Characters, Library and Search = `CL11.open(tab)` or
    `SEARCHPAGE14.open()`. No other feature's code changes.
  - Where it duplicates controls while present (the Characters screen's own tab row; the header's Characters button;
    ⋯ → Search), hide them only through the bar's own stylesheet, declared in its ROLLBACK, so removing the bar
    restores them exactly. Decide each with that test, and say what you chose.
  - Removal restores the previous build byte for byte. The dependency harness switches off Phases 11, 12.8 and 14 in
    turn. A `'bottom'` variant passes as a boundary, proving the position is one setting.
- **Watch on the iPhone:** the safe-area insets (Safari and the installed app); the sheet's header row, already full at
  375 px; the carousel's bottom tabs; Quick Access; the floating buttons (dice, Manage); modals above it; print (hidden);
  Play and Manage. Send the owner a 390 px screenshot early (`SendUserFile`) before the full QA, so a layout objection
  costs little.
- **Folder:** Part K owns the navigation shell. Suggested `PART K — Phase 11.3 App Bar`, with a roadmap amendment adding
  11.3 (phase numbers are stable identifiers; check the roadmap first).

### 6. Not this cycle

Spell grouping (Element, then Mastery, then A to Z) stays in Search's second release with the other per-category
facets and the remaining page references. FT-15 to FT-20 stay parked as recorded. Nothing else starts.

## Releases, verification and the owner's check

- **Suggested stack, one cycle:**
  1. Phase 14's device corrections (S11, and Search's side of S9).
  2. `BUGFIX — Characters Screen Top Bar`.
  3. 4.5.33's device correction (V2).
  4. Phase 4.5.35 Initiative Score (V4).
  5. Phase 11.3 App Bar.

  Order them so each removal restores the build before it. Each layer gets its own harness with oracles it does not own,
  removal files from the newest pair, a removal-chain entry at the end of `CHAIN`, variants, an ownership scan, and a
  README, ROLLBACK and MANUAL-TESTS.
- **The full suite once, at the end,** sequentially in the background, with nothing heavy alongside it. Then the removal
  proofs, each layer out in turn, with the retained suite on each rebuilt build.
- **Latest runner:** `Versions/PART I — Phase 4.5.34 Blind Armor TN Note/qa/current-suite-runner.js` (expects 4,816).
  Each new layer chains a runner off the previous one.
- **Live after the merge:** adapt `PART K — Phase 14 Search/qa/verify-live.py` (bytes, service worker, focused
  harnesses) and `qa/checklist-walk.js` (the checklist through the real controls on the live site).
- **Owner's check:** one Claude Doc. Before you start; one table per layer; a Result dropdown (Pass / Fail / Not run) and
  Notes on every row. The iPhone rows matter most: the bar, the keyboard, taps and the Initiative line. Re-test S9 and
  S11 explicitly.

## Lessons from 9 October (do not relearn them)

- **The pre-roll registry stays at seven seats.** Fifteen harnesses pin it. A 4.5-family effect returns its roll
  modifiers through `advConfigExtendedRollModifiers` (the adv-config seat), never `registerPreRollModifier`. A
  modifier keeps its own `source` there, so a Void-like bonus can carry `source: 'void'`.
- **Nothing heavy beside a full suite.** Chromium crashed ("Target crashed") and the shell could not fork while one ran.
- Phase 11.2.4's `wizard5-harness.js` now closes each scenario's pages (test-only); it had timed out on `main` itself.
- `#f_rank` (School Rank) is a display the recalc rewrites: read it in a harness, never set it.
- **Prove each harness can fail:** the first variant run caught a weak accent check and two weak checks in 4.5.34.
- **Tooling:**
  - The `Write` tool turned `\u0300` in a regex into real combining characters: scan new files for invisible
    characters.
  - Git Bash's `grep -c $'\r'` reports carriage returns that are not there: count `\r\n` with Python.
  - Multi-line patterns in a heredoc lose backslashes: write generators to a `.py` file.
  - `git rev-parse --short` takes one revision.
- **The published ledger page** (https://claude.ai/artifact/76wpQnwpk6gm6YSwns1PDk) refuses a republish until the whole
  page (about 390 KB, 1,906 lines) has been read; this costs about 100k tokens, so do it once, as the cycle's last step.
  The 9 October session confirmed the published page held exactly the committed ledger of `fc87313`; the repository's
  `BUILD-LEDGER.html` is current and was never published since.
- **Context costs:** the 9 October session reached about 850,000 tokens. Keep logs on disk, read by section, and wait
  for background jobs by notification.

## Usage

Week at **65%** (read from the meter, about 09:00 UTC on 9 October; the week resets on **14 October at 01:00 UTC**).
Last cycle (assessment, three releases, two QA runs, merge, live check, checklist): about 13 points; reading the
results and this kickoff: about 3 more.

**Estimate for this cycle:**

| Item | Points |
|---|---|
| S9 and S11 | 2–3 |
| V2 | 2–3 |
| V4 | 3–4 |
| App bar | 5–8 |
| QA, docs, merge, live, checklist | 4–5 |
| **Total** | **16–23** |

That fits the week. Record readings at the start, after each layer's QA, after the full suite and after the merge.

## First steps

1. Do the session setup above, then read the records listed and the owner's notes in the checklist doc.
2. Trace the Void-spend paths (V2) and the Initiative roll path (V4) before writing code. Say briefly what you found and
   any design choice that differs from this file, then build. No further approval is needed for the approved work.
3. Build in the suggested order, then do the full QA. Send the owner the screenshot of the app bar early. Then ask for
   the word to merge.
