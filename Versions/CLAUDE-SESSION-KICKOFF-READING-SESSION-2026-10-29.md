# Claude session kickoff — the reading session (29 October 2026)

Release 7b.1.1 is closed: live at `b484bbc`, the owner's re-tests passed (records `83d5c93`). This session is step 2 of
the [Work Order — 28 October 2026](https://claude.ai/artifact/HiVDa7FasBFXnz3NjmCVxd): **read the books for the rulings
that need them, record what they say in our own words, and ask the owner one batch of questions. No build.** Estimate
**4 points (3–5)**; the week read about 38% when this was written.

The owner starts this session at about 02:00 (UK, = UTC) and goes to sleep. **Start reading at once**, in what is left
of the current 5-hour window (it resets at **03:50 UTC on 29 October**). When the window is nearly spent, save, pause
on purpose, and carry on by yourself after the reset (owner's choice, 29 October). Run to the end unattended.

## Start of session

1. Turn Remote Control on, and keep the computer awake (`until: "session_idle"`).
2. Work only in `C:\Users\jcrow\l5r-character-sheet-creator`. Never touch the OneDrive clone the shell starts in; use
   absolute paths.
3. Check mains power: `Get-CimInstance Win32_Battery` (BatteryStatus 2 = on mains). If on battery, carry on, but say so
   in the final message.
4. Read `get_usage`, then begin reading (below).

## Pausing at the 5-hour limit, and carrying on

Never run into the limit: a turn that hits it just stops, nothing restarts it, and unsaved findings are lost.

- Read `get_usage` before each reading batch. Save each item's findings to the notes file as soon as it is done.
- When the 5-hour window reaches **about 85%**, or the next batch would take it past 95%: save the notes, commit them
  (notes only, straight to main), then pause. Write this script to the scratchpad with the Write tool (not a heredoc;
  memory `bash-heredoc-backslashes`) and run it with `run_in_background`, passing the window's `resetsAt`:

   ```python
   import ctypes, datetime, sys, time
   until = datetime.datetime.fromisoformat(sys.argv[1].replace('Z', '+00:00')) + datetime.timedelta(minutes=2)
   ctypes.windll.kernel32.SetThreadExecutionState(0x80000001)  # keep the system awake while waiting
   try:
       while datetime.datetime.now(datetime.timezone.utc) < until:
           time.sleep(30)
   finally:
       ctypes.windll.kernel32.SetThreadExecutionState(0x80000000)
   print('reset reached', datetime.datetime.now(datetime.timezone.utc).isoformat())
   ```

  End the turn with a one-line status (where the reading stands). The script holds the laptop awake while it waits, and
  its exit wakes the session after the reset. Then read `get_usage`: if the window is fresh, carry on from the notes; if
  the script stopped early, run it again. Make no other calls while paused.
- The same rule applies in the new window, though the rest should fit in it easily.

## What to read

Each item's ruling is in the roadmap's desk-review block (search `L5R Character Sheet Phased Roadmap reorder.md` for
`R23 The Core p.148`) and the [desk review doc](https://claude.ai/artifact/2GRWcCjGXub1g2GbGHRrUp) (search it by item;
never read it whole).

| Item | For | What to settle in the books |
|---|---|---|
| R23 the set rules | 7b.2 | Core p.148's rule on Advantages and Disadvantages that cannot be held together, and every matched set the sheet's libraries hold: Paragon / Dark Paragon, Consumed / Failure of Bushido, the Seven Fortunes' Blessings and Curses, Touched / Cursed by the Realm, and any others. Per set: its members, book and page, and the owner's rulings (one entry per set; an Advantage excludes its set's Disadvantage, the Fortunes excepted; the GM may override; C4 greyed with the reason, a held pair flagged, a per-character GM override) |
| R11 FT-46 | 7b.2 | The World of the Daimyo and The Daimyo's Path (Emerald Empire p.279), Child of Chikushudo (Enemies of the Empire p.244): type, cost, page and a one-line own-words note, for reference entries that say the Station and shapeshifter rules are not applied. R11 (23 Oct) supersedes memory `station-shapeshifter-entries-parked` for these reference entries |
| R17 FT-07 | 7b.2 | Scorpion Instigator: must Blackmail be bought four times (four people)? The sheet now checks one Blackmail Advantage and a confirmation of four people. What the book requires, and how the gate should check it |
| R20 FT-10 | 7b.2 | Kobune Captain: the entry's wording on Clan membership. Can a non-Mantis take it; is a Clan restriction or a GM exception right? Today: eligibility kept, with the Mantis command-appointment confirmation. Owner: a rare appointment is not itself a rules restriction |
| R22 | 7c | Core on starting spells and whether they count as memorised; compare with the wizard's starting spells (Phases 11.2.3 and 11.2.4) and each spell row's memorised field |
| R26 | 7c | Lord Moon's Curse (book, page, its levels and TN: the owner's C5 is 15, 20, 25), the Ring cap and the empty quiver, as recommended in the desk review |

Not for reading: 7c's after-preview refund (owner ruling, 29 October) needs no book.

## How to read, cheaply

- The PDFs: `C:\Users\jcrow\OneDrive\Documents\L5R 4th edition books` (18 files; `L5R_BOOKS`). `pdftotext -layout -f N
  -l N` (`/mingw64/bin/pdftotext`) into the scratchpad only, never the repository (ruling of 30 September). PDF page
  numbers differ from printed ones: `Versions/SOURCEBOOK INDEX — Page Map/INDEX.md` and `OUTLINES.md` give both.
- Batch: one Python script (written with the Write tool) that extracts and prints only the lines needed for several
  items. Save findings to the notes file as each item is done; the scratchpad is per session.
- Never call an entry "not found" from capped output: count hits, search uncapped for each distinctive word, compare
  headings by shared words, and check Core's index (printed pp.394–401) (memory `capped-search-not-found`).
- Our own words with book and page, never the book's text, in the notes, the doc, the records or GitHub (memory
  `sourcebook-rules-text-own-words`). Short names and headings are fine.
- Each tool call re-reads the whole context, so keep printouts short and batches few (memory
  `five-hour-window-book-reading`). If the context passes about half its size, finish the item in hand, save, and hand
  off to a fresh session with a short note (memory `fresh-session-over-long-context`).

## Output

1. `Versions/READING — Cycle 7b.2 and 7c 2026-10-29/NOTES.md`: per item, the rule in our own words with book and page,
   what the sheet does now (`file:line`), the proposed build, and any question.
2. **One batch of questions** for the owner as a Claude Doc (memory `audits-published-as-docs`), with the
   recommendation first under each question. The owner answers in the morning: publish it and stop; do not wait.
3. A draft kickoff for Release 7b.2 (R23, R11, R17, R20), modelled on
   `CLAUDE-SESSION-KICKOFF-RELEASE-7B1-2026-10-28.md`'s rules for how a release runs, marking what waits on the answers.
   7c's reading (R22, R26) stays in the notes for its own kickoff.
4. Records: the ledger's part 1 next step and a part 6 entry (MD and HTML), the roadmap's build-order line, and a
   `CLAUDE.md` pointer (append with `printf >>`; it must keep exactly 8 CR bytes; memory `claude-md-carriage-returns`).
   Notes and records only, no build, so they go straight to main, as records always have. Never force-push.

## Done looks like

The notes saved and committed; the questions doc published; the 7b.2 kickoff drafted; the records updated and pushed.
The final message, read on the owner's iPhone: what was read, the doc's link, the questions in one line each, and what
comes next (the owner's answers, then Release 7b.2 in a fresh session).
