# Claude — next-session kickoff: Cycle 5 (written 20 October 2026)

**Status: scoped by the owner on 20 October 2026; not started.** Start in a **fresh session after the weekly reset (21
October, 01:00 UTC)**. The first turn measures, then proposes the releases, an estimate, a stop line and a cap for the
owner's choice; build only what the owner chooses. Anything outside this scope needs the owner's word.

**The owner's scope for Cycle 5 (20 October), four parts:**
1. **BUGFIX — the Clan & School tab shows the defaults after a character is loaded** (reported 20 October, below).
2. **FT-32, newest version first:** opening the app fetches the newest release, so the first open after a deploy is no
   longer the previous build.
3. **A splash screen for the initial load** (FT-32's other half: a branded loading screen).
4. **The missing supplement entries** the Advantages and Disadvantages audit found (42 selectable, 23 reference only).

FT-32 has been raised and is now in scope; do not raise it again as a reminder.

## Start of session

- Remote Control on, keep-awake (memory `session-setup-remote-control`), and a meter reading (`get_usage`) with the time.
  The week read **94%** on 20 October when this file was written; it resets on **21 October at 01:00 UTC** and then on
  28 October. **The 5-hour window holds about 14–15 weekly points**: read the meter between steps; near 90% of the 5-hour
  window stop at a clean point (never mid-merge or mid-push) and say so.
- **Canonical clone: `C:\Users\jcrow\l5r-character-sheet-creator`.** Never build or commit in the OneDrive folder the
  session opens in (an old clone from 25 September). The canonical checkout is shared: make the branch
  `claude/cycle-5-<date>` from `origin/main` in its own git worktree, for example
  `git -C C:/Users/jcrow/l5r-character-sheet-creator worktree add C:/Users/jcrow/l5r-cycle-5 -b claude/cycle-5-<date> origin/main`.
  Do not switch the canonical checkout's branch. Stage exact paths only; leave `Characters/`, `tmp/` and Word documents
  alone; never force-push.
- **Starting build:** `main` at this file's commit or later. Phase 0 build **6,718,713 bytes, SHA-256
  `a9a1119903b38610795ba32c5a01603b5f8e2113a1f825532fcd8d2087a1ed85`** (Cycle 4, the Library, Release 2d, `e8d41d3`);
  `recombine.py --verify` byte-identical. The newest release is `PART K — Phase 13 Library`; its `qa/` gives the full
  suite: **5,705 checks** (`final-qa.py`, `flat-suite-runner.js`, `current-suite-runner.js`, `verify-live.py`).
- **Read by section only** (not the ledger, roadmap or `CLAUDE.md` in full): this file; the ledger's entry "Current
  update — 20 October 2026 (Claude): the Library done; what is left, reassessed"; the roadmap's amendment "The Library
  done; what is left; the order — 20 October 2026", FT-32 in its REVIEW LATER list (grep `FT-32`), and the supplement
  ruling in "Owner's rulings and Cycle 2 proposed — 15 October 2026"; the audit
  `Versions/PART I — Phase 4.5 Sourcebook Audit of Advantages and Disadvantages/AUDIT.md`, sections **Missing** and
  **Configuration** (lines 182–311); `QA — Removal Chain Registry/README.md`; the Library's `qa/` (the newest QA
  scripts, `verify-variants.py` and `final-qa.py`, to copy); memories `feature-structure-and-comments`,
  `helper-agents-two-roles`, `playwright-chrome-shim`, `full-suite-mains-power`, `fresh-session-over-long-context`,
  `device-check-workflow`, `device-check-stale-version`, `sourcebook-rules-text-own-words`, `five-hour-window-book-reading`.

## Test environment

Run every harness on the installed Google Chrome:
- `NODE_PATH=C:/Users/jcrow/l5r-qa-tools/node_modules`;
- `NODE_OPTIONS='--require "C:/Users/jcrow/l5r-character-sheet-creator/Versions/QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js"'`;
- `PYTHONUTF8=1`.

**Mains power and the screen awake** for the full suite and every timing check: read `Get-CimInstance Win32_Battery`
(BatteryStatus 2 = on mains); hold the screen awake with a background PowerShell process calling
`SetThreadExecutionState(0x80000003)` until a stop file appears, plus keep-awake. **Read free memory first**
(`Win32_OperatingSystem` `FreePhysicalMemory`): on 19 October the owner's Android emulator (BlueStacks, HD-Player) held
about 6 GB and left about 4 GB free; three variant runs at once then hung three runs and timed out page loads. Under
about 6 GB free, run variants two at a time, or ask the owner to close the emulator.

**The owner's instruction: the full suite passes first time.** If anything fails, find the cause and fix it; never
weaken, skip or retry a check until it goes green.

## Part 1 — BUGFIX: the Clan & School tab shows the defaults after loading

**The report (owner, 20 October, with screenshots and six saves).** Opening any saved character, the **Identity** tab
is right (Sairyū: Crane, Kakita, Kakita Bushi; Osamu Matsu: Lion, Matsu, Kitsu Shugenja; and so on), but the **Clan &
School** tab shows **Crab, Hida (+1 Strength), Hida Bushi** with Hida Bushi's text, for every character. The Clan mon
watermark is the right Clan, and Osamu Matsu's Kitsu Shugenja shows its own Affinity Water / Deficiency Fire badges on
that tab. The screenshots were in Play mode (plain text, no dropdowns). The owner suspects the JSON import.

**The saves are correct.** The six files (read-only; never commit or copy them, they are the owner's characters):
`C:\Users\jcrow\OneDrive\Documents\L5R character sheet creator\Characters\` — `Sairyū.l5r.json` (schemaVersion 4),
`Osamu_Matsu.l5r.json`, `Amane_Kitsuki.l5r.json`, `Bayushi_Makoto.l5r.json`, `Moto_Priya.l5r.json`,
`Kaori_Asako.l5r.json` (schemaVersion 5). Each holds the right `f_clan`, `f_family`, `f_school`, `f_familyApplied`,
`f_schoolApplied` and `f_schoolsData`.

**Likely cause (to measure, not assume):** `#cfs_clan`, `#cfs_minorClan`, `#cfs_family` and `#cfs_school` are the tab's
*staging* dropdowns (`src/markup/10-swipe-tab-shell.html`; `src/sheet/080-identity-build-ui.js` line ~108;
`src/sheet/207-feat-clan-theming.js` line ~81 says they are not persisted by `applyData()`). After a load they keep
their first options, Crab / Hida / Hida Bushi, and `#cfs_schoolInfo` describes that staged School. Phase 12.1
(`209.9997-feat-modes-clan-school.js`) then shows those staging values as plain text in Play mode. So the defect is in
loading and display, not in the saved data.

**Measure first:** Management as well as Play; a character opened from the Characters list, imported, reloaded and made
in the wizard; Minor Clans (`#cfs_minorClan`); a character with Multiple Schools or an Advanced School. **Above all:** in
Management, would Apply Family or Apply School on the stale staging value apply Hida / Hida Bushi over the character's
own? If so, that is a data risk: say so in the first turn.

**Fix shape (proposal):** after any load (and when the Characters list opens a character), set the staging dropdowns to
the character's own Clan, Family and School **without firing Apply** or changing any saved field; Play mode then shows
the truth. Never re-apply Family or School on load. A separate removable BUGFIX folder; checks that fail on `main` with
synthetic saves (Crane / Kakita / Kakita Bushi; a Minor Clan; a shugenja), not the owner's files.

## Part 2 — FT-32: newest version first

Phase 0.6's service worker (`Part F — Cross-Platform Delivery/PART F — Phase 0.6 Installable Web App/`, `src/sw.js`;
also `BUGFIX — Service Worker Redirected Page`) serves the saved copy first and updates in the background, so the first
open after a release shows the previous one (memory `device-check-stale-version`). FT-32's proposal: **network first
with about a 2-second limit, then the saved copy**, so the app still works offline. Keep every Phase 0.6 check (install,
offline, aeroplane mode) and the redirect fix; `verify-live.py` compares the deployed service worker byte for byte. Its
own removable layer. Trade-off to state to the owner: on a weak signal, opening waits up to the limit.

## Part 3 — the splash screen for the initial load

FT-32's other half (roadmap): on opening, the page briefly shows its bare markup (old toolbar row, empty boxes, no app
bar) for about half a second on the owner's iPhone, until the main script has run. A branded screen covers it from the
first paint: **the cream background, the 記 seal and the app's name**; removed once the script finishes **and also if
it fails**, so the page is never stuck. It must paint before the big script parses (markup and CSS early in the page),
respect reduced motion, and survive the deploy's PWA head (`head-pwa.html` is added before `</head>`). Its own removable
layer. **Offer the owner one small mock-up (phone and desktop) before building**, unless they say to build to FT-32's
description.

## Part 4 — the missing supplement entries

From the audit (Missing, Configuration): **65 entries in the owner's books are not in the sheet, all from supplements.
42 can be taken by the sheet's characters**; 23 are Naga- or Nezumi-only. **The owner's ruling, 15 October: the 42
selectable; the 23 reference only.** Groups (the audit has each entry's book, page, XP and effect):
- **City backgrounds, Strongholds of the Empire (18):** Citizen/Native and Stigma pairs for Broken Wave, Clear Water,
  Dark Edge, Nikesake, Water Hammer, the Imperial City, Zakyo Toshi and the Ruined City.
- **Elemental books (6):** Iron Heart, Laughing Plains and Sacred Forest Native; Watanu-Trained; Reincarnated (Book of
  Void); Battle Healing (Book of Water).
- **Heirlooms (5):** Inheritance: Trained Falcon, Kobune, Asahina Blade, Water Hammer Armor; Sacred Weapon: Owl Blade.
- **Intrigue (5):** Spy Network, Stolen Identity, Bounty, Sleeper Agent, Member of the Chrysanthemum Court.
- **War and court (2), Sword and Fan:** Strategist, Sage of the Sword and Fan.
- **Leaning on rules the sheet lacks (6):** The World of the Daimyo and The Daimyo's Path (Emerald Empire's Station
  rules), Child of Chikushudo (shapeshifter abilities), Medium, Naga Ancestry, Wanderer.

16 need a picker, each copying one that works (the audit's "Works like" column); 4 are options in existing pickers.
**Rulings to ask in the first turn, in one batch:** Trials of the Imperial City (its printed text repeats Imperial City
Stigma's: a printing error?); Wanderer (no type printed); the Station entries and Child of Chikushudo (selectable with a
reminder, or reference only until those rules exist); how the 23 Naga/Nezumi entries appear (Search only?).
**Book reading:** the owner's PDFs are in `C:\Users\jcrow\OneDrive\Documents\L5R 4th edition books` (outside the
clones; `Versions/SOURCEBOOK INDEX — Page Map/` maps pages). Read only the audit's pages, after a 5-hour reset, in one
batched script, saving extracts to durable files early. Rules text in our own words with the page, never verbatim.

## Releases (propose in the first turn, for the owner's choice)

1. **5a, no books:** Part 1's bugfix, Part 2 and Part 3, three removable layers sharing one full suite, one merge, one
   live check and one checklist. **About 10–16 points** (FT-32 alone was estimated 3–5; lean high). Building it first
   means every later device check opens the new build.
2. **5b, the supplement entries,** by mechanism (one release, or two if the pickers make it large). **About 20–40.**

Propose each with points, a stop line and a cap. **Read the upper half:** the Library cost about 66 against 20–40, and
Release 2d about 10 against 3–5.

## Helpers and sessions

- Only the owner's two helper roles (memory `helper-agents-two-roles`): one code reviewer per cycle after a release
  passes its own checks, with a narrow brief; a failing-test investigator only if a cause stays unclear.
- No side sessions during the cycle. A defect found outside scope goes to the owner as a proposal.

## Verification

- Every new check fails on `main`; quote both counts. Pin negative variants for each layer (for the bugfix at least:
  the dropdowns left on the defaults; Apply fired on load; a Minor Clan left stale). For variants: **dry-run the case
  list (every mutation unique) before chaining the long runs**; every harness step must survive a variant that closes
  or hides what it drives.
- Each layer removes cleanly through the registry; together they rebuild `main` (`a9a11199…`) byte for byte.
- **The full suite twice, first time,** in one background job holding the PC awake: 5,705 plus the new checks; then
  the layers removed, rebuilding `main` exactly, and the retained 5,705.
- After the owner's word to merge: deployed bytes (page and service worker), the new checks live; then a new Claude
  Docs checklist, **Cycle 5 Device Checks**, with Pass/Fail dropdowns (memory `device-check-workflow`). Until FT-32 is
  live, ask the owner to open the app twice before checking.

## Records: keep them short

Full detail only in each layer's README. Elsewhere: one ledger entry at the top with its cost table, the roadmap's
status rows (4.5, 0.6 and the backlog) and a short amendment, one pointer in `CLAUDE.md` (8 deliberate CR bytes: count
with Python, write bytes or append). Leave `BUILD-LEDGER.html` and the published Rokugan Build Ledger to a records
session (republishing the page means reading all of it first: about 2 points; memory `ledger-artifact-republish-cost`).

## Lessons (do not relearn them)

- Long conversations are expensive: every turn re-reads the conversation. Hand off past about half the context.
- Start reading-heavy work just after a 5-hour reset; batch reads into one script.
- Write scripts to files; Bash heredocs halve backslashes. Python's `write_text()` writes CRLF here: use
  `write_bytes(text.encode('utf-8'))`.
- A switch that is declared but never read is not a switch; prove each one turns its checks red.
- A variant that fails nothing means the fixture hides the case: put the case where it bites.

## First steps

1. Remote Control, keep-awake, meter reading; check the 5-hour window and free memory.
2. The worktree and branch from `origin/main`; check the build hash.
3. Read by section (above).
4. Measure Part 1 on the live build with a synthetic save (Play and Management; would Apply overwrite?), and Phase
   0.6's service worker and the first paint for Parts 2 and 3.
5. Propose 5a and 5b with estimates, stop lines and caps, the batch of rulings, and the splash mock-up offer; wait for
   the owner's choice.
6. Build the chosen release; focused checks, variants and removal proof; the code review; the full suite twice;
   records; report and wait for the word to merge; the live check and the checklist.
