# Kickoff — Release 15a, group G4: touch, focus and startup

Prepared by Claude on **12 November 2026**, at the end of the G3 session, at the owner's request ("please start a new session with a handover to start G4"). Self-contained: the previous chat is not needed. Paths are relative to the canonical checkout `C:/Users/jcrow/l5r-character-sheet-creator` (never the OneDrive clone).

## 1. Where things stand

| Item | State |
|---|---|
| Live app | **G3 is live.** `main` at `b8990fae` (records on top of the qualified `7d3bb4c3`). Application SHA-256 `6c555d29b35ca5f550274163cc73f9b6b47a11f3065cfbc4d2ac9bdaab38c029`, **17,631,957 bytes**. Production verified 12 November: 2,669/2,669 on the deployed files, browser/offline smoke 22/22. |
| G3 record | [HANDOVER.md](HANDOVER.md) in this folder: the three units (8b.1-UI-01/02/03, markers `PART H PHASE 15.1.21`/`.22`/`.23`), their qualification and production evidence. |
| G4 | **Not started.** No mock-up, no build. |
| Usage | On 12 November the weekly meter read **84% (Fable) / 50% (all models)** at the start of G3's full pass; it resets **18 November 01:00 UTC**. Take a fresh reading before substantive work and tell the owner if G4 is unlikely to fit before the reset. |

Start with `git status`, `git fetch`, and confirm `main` = `b8990fae` and the application hash above. Branch from `main`.

## 2. One question for the owner, first

On 11–12 November the owner agreed this order after G3: **(1) a small "automatic entries" group, then (2) G4.** On 12 November they asked to start **G4**. Ask once, before anything else: *start G4 now and do the automatic-entries group after, or the automatic-entries group first?* Do what they say; do not ask again. The automatic-entries group is described in §6.

## 3. G4's scope (from the audit, rulings Q1 and Q6 settled; do not reopen them)

Read each finding in full in `Versions/Part H — Sheet UI-UX/PART H — Phase 15 UI Consistency Audit/AUDIT.md`.

| Finding | Summary |
|---|---|
| **A09** (FT-49) · phone text entry and repeated taps | Editable inputs at least 16 px on phones; `touch-action: manipulation` on buttons/steppers only. Keep pinch zoom and ordinary double-tap zoom. Validate the owner's three reported iPhone zoom cases on Safari **and** the installed app; never force-reset viewport scale. |
| **A10** (FT-50, FT-52) · cross-page actions must move focus | The Advanced School button and hint in one wrapping row, 44 px touch height. On every cross-page action, focus the destination heading after the carousel settles, without reopening the keyboard. Test source-page inertness and return navigation. |
| **A17** (FT-41) · fill the splash without cutting off the title | `cover` with portrait/landscape focal positions keeping the seal and title, or a matching edge extension. Test 390×844, 844×390, 1536×864 and narrow landscape. Keep first paint and readiness/error dismissal exactly as shipped. |
| **A18** · the first Manage tap on an iPhone | An **investigation**: a bounded, instrumented native-device check (input event to painted frame, first and second tap, same character). Fix only a demonstrated bottleneck; otherwise close as not reproduced, with the measurements. |
| **Added by the owner, 12 November: the gold focus ring** | After the School-choice dialog closes on iPhone Safari, a gold outline runs round the page until the mode changes. It is the tab page's own `.car-page:focus-visible` ring (`src/css/20-carousel.css`), drawn because `SC8.close` returns focus to the page, which is what Safari had focused. Pre-existing, not G3. Proposed: when a dialog closes and the only place to return focus is the page, do not draw the ring (or return focus to the control that opened the dialog). It is a focus change, so it sits naturally with A10. Details: `OWNER-COMMENTS-2026-11-11.md`, point 1. |

**G4 is behaviour tier** (it changes focus and startup): the 4× CPU screen, then **two full passes**, each passing on its first execution. A18 may need the owner's iPhone for the measurement; plan that with them.

## 4. The process (owner's rulings; read `PHASE-15-DESIGN-RULES.md`, including the 6 November amendment)

1. **Mock-up first**, today beside proposed, real screenshots of the live build, phone and laptop. Build only what the owner approves. The owner likes side-by-side boards and a clear recommendation; give one.
2. One folder per finding under `Release 15a/`, each with its own fragments, switch, marker, seam block, README, ROLLBACK, harness with ids pinned before the first run, remover, `test-removal.py`, and a `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py` after `8b.1-UI-03 — Remove Apart from Memorised`. A group folder (`G4 — …`) holds shared records only.
3. Stacked branches, one preview each; light checks (own harness, removal proof, dependency check, touched harnesses); one read-only code review; then the owner's device round in a **Claude Doc** checklist (Pass/Fail per device, Accept/Revise/Remove per finding) with a repository mirror.
4. Qualify only the accepted units: variant predictions committed before discovery; the chain (group removal, variants, dependencies); the 4× CPU screen; two full passes. **Counts:** candidate = **7,242** + G4's new checks; retained (all of G4 removed = G3 as live) = **7,242 − 73 = 7,169** (the same two live-site leaves are excluded). Whole-G4 removal must restore G3's `6c555d29…c029`, 17,631,957 bytes, exactly.
5. Records once, then go live only on the owner's word: fast-forward `main`, then production verification and the browser/offline smoke.

**G3's qualification scripts are the worked example** (`G3 — Spell Rows/qa/`): `verify-variants.py`, `test-removal-group.py`, `dependencies.py`, `qualify-before-full.py`, `final-qa.py`, `run-final-once.py`, the three suite runners, `verify-preview.py`, `verify-live.py`. Copy and change constants; create fresh state files; never reuse G3's `full-launched.txt`, run folders or logs. G4 needs two passes and the 4× CPU screen, which G3 did not: take those from A03's or Release 8's behaviour-tier runners (`run-final-twice.py`, `run-under-load.py`).

## 5. Environment and lessons (from G2 and G3)

- `NODE_PATH=C:/Users/jcrow/l5r-qa-tools/node_modules`, `PLAYWRIGHT_BROWSERS_PATH=C:/Users/jcrow/l5r-qa-tools/ms-playwright`, `PYTHONUTF8=1`, no `NODE_OPTIONS`. Every leaf preloads `PART K — Phase 14.2 …/qa/navigation-budget.cjs` and `PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs` — **except splash and startup tests**, which A17 and A18 touch: check how the splash's own harness runs before preloading `splash-fast`.
- One browser job at a time. Full suites on mains power with sleep held off. A failed full pass is investigated, never re-run.
- **A harness that takes its unit's page class away must put it back only if it was there**; otherwise a disabled build is switched on by its own harness (found in G3's discovery and in G2's A11).
- **A mutation can be masked** (G3: lowering a button's min-height did nothing because the row stretched it). Pick mutations the check really guards.
- The Phase 0 tree is LF. Some older files (G2's `verify-live.py`) are CRLF. A rebuild on this machine can fail to rewrite `l5r-character-sheet.html` with `OSError 22` (a file lock): run it again, and gate every commit on `python build.py --check-drift`.
- Harness pages block web fonts, so name boxes are 3 px shorter than on a device; leave margins for that.
- Marker-shaped prose: write "Phase 12 (Part K)", never in marker order; no bare "BUGFIX" in a comment.
- `Versions/CLAUDE.md` is append-only and must keep exactly eight CR bytes.

## 6. Queued: the automatic-entries group (owner-agreed, not started)

The owner's principle (11 November): what the rules give a character automatically is not a choice — no review, no XP box, no remove button — and a character should be functional on import. Three units, mock-up first:

1. **Yogo Wardmaster's given spells** omit Sense (book check of all 21 Shugenja Schools against the owner's PDFs: 20 correct, Yogo wrong; The Great Clans p.229). A one-line data fix in `209.998-feat-wizard-starting-spells-all.js`'s table, plus the five missing page numbers. Behaviour tier.
2. **Given spells credited on import**: read each School's own given list (Fuzake also gives Path to Inner Peace); tag held ones as School spells, add any missing with their scrolls, and say what was done in the character check (never silently). The older-holdings review then asks only about real choices. Behaviour tier.
3. **No XP box and no remove button on School, Path and Advanced School Techniques**; Kata, Kiho and chosen entries keep both. A quiet "School technique" tag says why. The sheet already removes these when their School, Path or Rank goes.

Full write-up and the book-check table: `OWNER-COMMENTS-2026-11-11.md` in this folder.

## 7. Not in scope

G5 (A08, A12), G6 (A19, A20), A04.2 (parked until the rules read pass), FT-59, FU-15a-1, the parked stats header, the remaining A11 layout observations, the Combat tab, tattoos, sync and Release 15b.
