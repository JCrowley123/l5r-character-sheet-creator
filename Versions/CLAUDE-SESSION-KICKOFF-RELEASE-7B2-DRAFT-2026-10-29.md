# Claude session kickoff — Release 7b.2 (DRAFT, 29 October 2026)

**Ready.** Written by the reading session. On 29 October the owner answered all four of this release's questions in
[Reading Session Questions — 29 October 2026](https://claude.ai/artifact/92kuNDnHBTBRnz7ZR1jecM) with the recommendation (Q1 in chat, after
the doc's plain-words explanation). The scope table below is final.

Release 7b.2 is step 3 of the [Work Order — 28 October 2026](https://claude.ai/artifact/HiVDa7FasBFXnz3NjmCVxd): the
desk-review rulings whose books were read on 29 October. Estimate **15 points (12–20)** of Claude's weekly allowance;
the week read about 39% at the end of the reading session.

## Start of session

1. Turn Remote Control on, and keep the computer awake (the owner follows from an iPhone).
2. Work only in `C:\Users\jcrow\l5r-character-sheet-creator`. Never touch the OneDrive clone; the shell starts there,
   so use absolute paths.
3. Read `Versions/CLAUDE.md`'s last few pointers, the ledger's parts 1 and 2 (`Versions/BUILD-LEDGER.md`), the owner's
   answers, and `Versions/READING — Cycle 7b.2 and 7c 2026-10-29/NOTES.md` (the rules in our own words, with book,
   page and the sheet's `file:line`). Do not re-read the whole ledger or roadmap; search them.

## Scope: four rulings (the notes hold each in full)

| Ruling | Build | Waits on |
|---|---|---|
| R23 the set rules (Core p.148) | One logic module holding the eight sets as data: Paragon, Failure of Bushido, Dark Paragon, Consumed, Seven Fortunes' Blessing, Seven Fortunes' Curse, Touch of the Spirit Realms, Cursed by the Realm. One row per set; Paragon excludes Dark Paragon and Failure of Bushido; Consumed excludes Failure of Bushido and Dark Paragon; Touch of the Spirit Realms excludes Cursed by the Realm; the Fortunes' Blessing and Curse may be held together. C4: greyed in every picker (Management quick-add and the wizard) with the reason; a held pair flagged on both rows and never changed; a per-character GM override in Management. One validator warning for a held pair | Q1 answered: a same-Fortune Blessing and Curse is greyed with the reason, the GM override lifts it. Q2 answered: only Core's four families |
| R11 FT-46 | The World of the Daimyo (Emerald Empire p.279), The Daimyo's Path (p.279) and Child of Chikushudo (Enemies of the Empire p.244) as Search reference entries beside the Naga and Nezumi ones (`021-lib-supplement-entries.js:60`): type, cost, page, the notes' own-words line, and a note that the Station or shapeshifter rules are not applied | Q3 answered: Search only |
| R17 FT-07 | The Scorpion Instigator gate reads `special.blackmailDistinctPeople`: four configured Blackmail rows with different target names (trimmed, case-insensitive), reported as "Blackmail on 4 different people (n recorded)". The four-people confirmation goes; the Dark Secret disclosure confirmation stays | Q4 answered: yes |
| R20 FT-10 | Nothing to build: Emerald Empire p.143 has no Clan requirement, and the sheet matches it. Close the item in the records | — |

The R23 module is the owner's pattern (memory `feature-structure-and-comments`): the sets and rules in a UI-agnostic
part that the picker, the rows and the validator all read; the greying, flags and override in a replaceable UI part.
The Fortune Blessing module's deferred note (`209.9298-feat-adv-fortune-blessing.js:17-19`) is updated to point at it.

If a ruling turns out to need more of a book, stop and say so. Do not open PDFs here beyond checking a page the notes
already cite.

## How the release runs

1. Each ruling its own removable layer (or a small group with one reason), following the card-editing and
   wound-preview layers' pattern: a README, a ROLLBACK, a harness, and an entry in the removal-chain registry
   (`Versions/QA — Removal Chain Registry/removal_chain.py`). The owner's rules: a UI-agnostic logic part, a replaceable
   UI part, lean functional comments. Never marker-shaped prose in comments.
2. Checks written and pinned before their first run, with negative variants; never loosen a check. R23's checks
   cover every exclusion in both directions, a second row of each set, the Fortunes' exemption, an old save holding a
   pair (flagged, unchanged), and the override on and off.
3. **Helper 1, the code reviewer** (read-only): once, after the layers pass their own checks and before the full suite.
   Reproduce each finding before fixing it, with a check pinned first.
4. **Load first:** the changed harnesses at 4× CPU throttling (`qa/cpu-throttle.cjs` in
   `Versions/QA — Cycle 7a Device Follow-up 2026-10-27/`, `L5R_CPU_RATE`), then the affected test groups.
5. **Helper 2, the failing-test investigator:** only if a test fails and the cause is unclear after a couple of tries.
   It finds and records the cause; it never changes a check. No other helpers.
6. The full suite twice, in the background, on mains power, the screen held awake and no other browsers: a candidate
   run, then a run with the new layers removed through the registry that rebuilds main byte for byte. Adapt the
   Release 7b.1 QA folder's `qa/run-final-twice.py` and `qa/final-qa.py`.
7. Work on a branch; merge to main only on the owner's word, never force-push. Cloudflare Pages deploys main.
8. After the merge: the live check (adapt `qa/verify-live.py` and `qa/live-browser-smoke.cjs`), then a device checklist
   as a Claude Doc with iPhone and Edge dropdowns, walked on the live site at phone size first (adapt
   `qa/checklist-walk.cjs`).
9. The owner's device checks may bring minor fixes: do them at once as Release 7b.2.1, in this session while it
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

## Not in this release

7c's items (R22 starting spells, R26 Lord Moon's Curse, the Ring cap and the empty quiver, Phase 7's audit log, the
after-preview refund) have their own kickoff; their reading is in the same notes file, and Q5–Q7 are theirs.

## Done looks like

The answered rulings built as removable layers, reviewed, both full runs passing first time, merged on the owner's
word, verified live, the checklist walked and sent, and the records updated. Then hand back to the owner for the
device checks, and say what comes next: Release 7c.
