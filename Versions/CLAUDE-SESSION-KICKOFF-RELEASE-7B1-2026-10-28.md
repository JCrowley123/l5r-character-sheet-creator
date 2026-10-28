# Claude session kickoff — Release 7b.1 (28 October 2026)

Release 7b.1 is the first step of the agreed work order: the eight desk-review rulings that need no books. Estimate
**15 points (12–18)** of Claude's weekly allowance; the week read 13% at the end of the session that wrote this.

## Start of session

1. Turn Remote Control on, and keep the computer awake (the owner follows from an iPhone).
2. Work only in `C:\Users\jcrow\l5r-character-sheet-creator`. Never touch the OneDrive clone; the shell starts there,
   so use absolute paths.
3. Read `Versions/CLAUDE.md`'s last few pointers, the ledger's parts 1 and 2 (`Versions/BUILD-LEDGER.md`), and the
   rulings below. Do not re-read the whole ledger or roadmap; search them.

## The agreed work order

[Work Order — 28 October 2026](https://claude.ai/artifact/HiVDa7FasBFXnz3NjmCVxd), agreed by the owner on 28 October
with all four recommendations:

1. 7b.1 (this), then one book-reading session, 7b.2 and 7c, then Phase 15's audit, 15a, 15b, then FT-16.
2. The older save race stays parked; it is fixed first if slower storage is ever added. Not in this release.
3. Nothing about sync, career planning or campaigns goes into the ledger or roadmap.
4. The published ledger page is republished once per cycle, not after this release. After each cycle, a fresh session
   republishes it, reassesses the ledger, roadmap, end-of-project review and work order, and writes the next work order.

## Scope: the eight rulings (the roadmap's "end-of-project desk review" section holds them in full)

| Ruling | Build |
|---|---|
| R7 Void +1k1 | The Void Point's +1k1 is not offered on Initiative rolls |
| R10 FT-39 Hotei | Hotei's Curse applies automatically where the sheet itself spends the Void Point for an Advantage or an Ancestor's gift; the declared button stays for Techniques. Full scope (every Technique) is after the project |
| R14 FT-01 | Skills already held leave Add from Skill List (not greyed) and return when their row goes. Subject Skills (Lore, Craft, Perform, Games) stay listed |
| R15 FT-04, FT-05 | A matching Identity gender satisfies a gender requirement; the wizard asks gender and age after Name, both skippable |
| R16 FT-06 | A pointer to the Advanced Schools under Identity's Add School |
| R21 | A Remove button in the wizard for a Skill added with XP (not School Skills or free choices); the XP returns because the sheet counts it from the rows |
| R24 | Jurojin's reminder reworded (no Resist poison button). A03, A09 and A14 are not in scope |
| R25 Ancestor gifts | A used once-a-session gift shows as used until Reset; the lost-favour badge is editable in Management |

If a ruling turns out to need a book after all, stop and say so; it moves to the reading session. Do not open PDFs here.

## How the release runs

1. Each ruling its own removable layer (or a small group with one reason), following the card-editing and
   wound-preview layers' pattern: a README, a ROLLBACK, a harness, and an entry in the removal-chain registry
   (`Versions/QA — Removal Chain Registry/removal_chain.py`). The owner's rules: a UI-agnostic logic part, a replaceable
   UI part, lean functional comments. Never marker-shaped prose in comments.
2. Checks written and pinned before their first run, with negative variants; never loosen a check.
3. **Helper 1, the code reviewer** (read-only): once, after the layers pass their own checks and before the full suite.
   Reproduce each finding before fixing it, with a check pinned first.
4. **Load first:** the changed harnesses at 4× CPU throttling (`qa/cpu-throttle.cjs` in
   `Versions/QA — Cycle 7a Device Follow-up 2026-10-27/`, `L5R_CPU_RATE`), then the affected test groups.
5. **Helper 2, the failing-test investigator:** only if a test fails and the cause is unclear after a couple of tries.
   It finds and records the cause; it never changes a check. No other helpers.
6. The full suite twice, in the background, on mains power, the screen held awake and no other browsers: a candidate
   run, then a run with the new layers removed through the registry that rebuilds main byte for byte. Adapt that QA
   folder's `qa/run-final-twice.py` and `qa/final-qa.py`.
7. Work on a branch; merge to main only on the owner's word, never force-push. Cloudflare Pages deploys main.
8. After the merge: the live check (adapt `qa/verify-live.py` and `qa/live-browser-smoke.cjs`), then a device checklist
   as a Claude Doc with iPhone and Edge dropdowns, walked on the live site at phone size first (adapt
   `qa/checklist-walk.cjs`).
9. The owner's device checks may bring minor fixes: do them at once as Release 7b.1.1, in this session while it
   is under half its context, otherwise in a fresh one, with the same review and full suite.
10. Records at the end: the ledger's parts 1–4 and 6 (MD and HTML), the roadmap's build order, a `CLAUDE.md` pointer.
    Do not republish the published ledger page.

## Environment

- Node: `/c/Program Files/nodejs/node.exe`; `NODE_PATH='C:/Users/jcrow/l5r-qa-tools/node_modules'`;
  `NODE_OPTIONS='--require "C:/Users/jcrow/l5r-character-sheet-creator/Versions/QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js"'`;
  `PYTHONUTF8=1`.
- Build: `python build.py --check-drift` at the repo root must report BYTE-IDENTICAL; fragments recombine with the manifest's
  `expect_sha256`.
- In page scripts, wait for the splash to end (`!document.querySelector('[id^=l5r-splash]')`). Off-screen carousel
  pages are `inert`, so open a page through `.car-tab` and `window.__L5R_CAROUSEL__.whenSettled()` before typing.
- `Versions/CLAUDE.md` keeps exactly 8 CR bytes: append with `printf >>` and count them before committing. Python writes
  use `newline='\n'` or `write_bytes`.

## Done looks like

All eight rulings built as removable layers, reviewed, both full runs passing first time, merged on the owner's word,
verified live, the checklist walked and sent, and the records updated. Then hand back to the owner for the device
checks, and say what comes next: the reading session, at the start of a fresh 5-hour window.
