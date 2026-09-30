# Claude — next-session kickoff (30 September 2026)

Prepared at the end of the 30 September session, after Phase 12 was completed and merged. It
supersedes the 28 September kickoffs for planning; it does not override the owner's rulings.

You continue the L5R 4E single-player character sheet (not a VTT, GM tracker or combat engine).
**Begin with your own assessment, not implementation.** Nothing below is approval to build.

## Your first response

1. What is complete, what remains, and any discrepancy you find between source, ledger and roadmap.
2. **Your own independent assessment of cost and the remaining roadmap**: relative effort, confidence,
   dependencies, blockers (source, rulings, device), and the evidence behind each. Draw your own
   conclusions; do not inherit this file's.
3. Your proposed next phase, its smallest useful first release, and its non-goals.
4. **For every point where your proposal differs from the one below**: the old proposal, your
   alternative, why yours is better, the evidence, the cost/QA trade-offs, and any ruling it needs.
   If you agree, say why in your own terms; do not merely endorse.
5. Acceptance tests, removal proof, device checks and a before/after usage checkpoint for that release.

Then ask the owner to approve the specific implementation. If their message already approves that
exact scope, do not ask again, but still report the assessment and any deviation first.

## Read (selectively but completely where it matters)

- `Versions/CLAUDE.md`, including the 30 September sections at the end and the folder map entries
  for Phase 12.7, 12.8 and BUGFIX — Dependant Inline Typing.
- `Versions/BUILD-LEDGER.md`: the 30 September updates, **Open reminders**, the 28 September
  reassessment, the device-pass backlog, and the cost history. Check `BUILD-LEDGER.html` agrees; it is
  the source of the published artifact https://claude.ai/artifact/76wpQnwpk6gm6YSwns1PDk.
- `Versions/L5R Character Sheet Phased Roadmap reorder.md`: process requirements, build order,
  status table, Phases 7, 11.1, 4.5 (D06/Hotei), 4.6–4.8, 6, 13–15, the dated amendments at the end,
  and **Deferred and declined**.
- The README of the candidate phase's nearest precedent, and only the source and tests it touches.

## State at handoff

- `main` = the 30 September reassessment commit (after `13312de`). Live build: Phase 0
  `l5r-character-sheet.html`, **3,117,804 bytes, SHA-256 `23df67a7…734896`**. Verify rather than trust.
- **Phase 12 is complete** (12, 12.1–12.8, all owner-confirmed on the iPhone). Full runner:
  `Versions/PART K — Phase 12.8 Play Mode Toolbar/qa/current-suite-runner.js`, last result
  **2,954/2,954** (a historical result; do not claim it as a fresh run).
- Local checkout `C:\Users\jcrow\l5r-character-sheet-creator` has **four owner-approved local
  deletions** (the 25 September kickoff files and `GPT-SESSION-KICKOFF.md`) and untracked Word files:
  preserve them, never stage them. A merged Codex worktree remains under
  `C:\Users\jcrow\Documents\Codex\...\dependant-typing`; ask before removing it. Keep
  `core.autocrlf=false`, `core.longpaths=true`. Work in a separate worktree/branch per release.
- **Parked owner ideas — do not build or fold into other work without a new instruction**:
  (1) *Manage as a separate screen* (like the wizard) instead of in-place editing; (2) *Print on the
  Characters list's per-character menu*, to be reviewed with Phase 11.1. Both are for review after
  the app is complete; say so if a proposed phase would make either harder.

## Proposal to challenge (from the 30 September session, revised)

**Revised order (owner's request, 30 September, after asking about working on sourcebook phases
from the laptop and continuing on the iPhone through Claude's Remote Control):**

1. **A one-off sourcebook index.** A map of which book and pages cover each topic the remaining
   phases need: ancestors (4.8), alternate paths (4.6), advanced schools (4.7), technique text and
   Void costs (6 and Hotei), School descriptions (9). Page references only, no quoting. It also
   establishes whether the 17 PDFs have selectable text (cheap scripted extraction) or not.
   Reading the books is the costly part; the index means each later phase reads only its own pages.
2. **Phase 7, first release** — the save format made true and older saves migrated (no books
   needed). Content phases add save data, so the upgrade path comes first. Can be swapped later if
   the owner prefers content progress.
3. **Phase 4.8 Ancestors** — the first sourcebook build: the smallest reading, reuses Phase 4.5's
   configuration machinery, the owner has the material, and Phase 12 already expects it.
4. **Phases 4.6 and 4.7** — one shared extraction pass, then two builds.
5. **Phase 6 with Hotei** — the heaviest extraction and a new engine; the index makes it tractable.
6. **Phase 9's School flavour text** as a light session; **13 and 14** late; **15** last.

**Ruling needed first:** quote rules text verbatim, or record mechanics and page references in our
own words? The site is public; it affects 4.6, 4.7, 4.8, 6 and 9. Until ruled, keep extracts out of
the public build (and out of GitHub if verbatim).

**Working this way (verify):** the session runs on the laptop, which must stay on mains power,
awake (keep-awake on; closing the lid may sleep it) and online, or the session pauses. Save each
extract as a data file so no later session re-reads a PDF; do reviews and approvals from the phone;
batch iPhone checks; one full-suite run per release.

**Phase 7's first release, in detail:** a small `VersionManager` that stamps the real format on
every save/export and upgrades older saves through registered steps (formalising 4.5.2's private
format-3 adapter), fixing `SHEET_SCHEMA_VERSION` still being 2 while saves are format 3, and the
finding that an imported older save keeps its old layout until opened. Tests with real older saves
(`Sairyu_.l5r`), round-trips, a newer-format refusal, exact removal. **Non-goals:** the audit log
(owner ruling), PDF, the Android save path, the parked ideas. **Rulings:** convert on Import or on
first open; audit log in, out or later; whether the accented-file-name fix rides along.

Why this order, for you to test rather than accept: it spends the expensive resource (reading the
books) once; it lands the save-format fix before content phases add data; and it completes a whole
roadmap phase (4.8) at the lowest sourcebook cost before the larger ones. Phase 11.1 (PDF) carries
the larger engineering unknowns and sits beside the owner's parked Print idea.

Alternatives on the table: 11.1 first; 4.6/4.7 before 4.8; D06 Weakness (needs rulings); the Rank 0
exploding-10s bug; the owner's Android 0.7 device checks (0 of 7). Check each phase's dependencies
in the roadmap before fixing an order (for example whether 4.7 depends on 4.6).

## Usage — assess it yourself

Claude Pro, 30 September (week resets 7 October about 02:00 BST): **weekly 16%** at session end.
This session, as readings rather than measured per-release costs: recovering from the laptop crash
and finishing the Dependant fix ≤4%; Phase 12.7 with its merge about 4–5 points; Phase 12.8 about
4 points; updating and republishing the ledger artifact about 3 points (reading its 225 KB source).
These are not calibrated forecasts. Take a fresh reading before and after your batch, and give
relative effort and confidence rather than invented percentages; label any number that has no
comparable evidence behind it.

## Practical notes from this session (verify, do not assume)

- Windows desktop: Node `C:/Program Files/nodejs/node.exe`; `NODE_PATH=C:\Users\jcrow\l5r-qa-tools\node_modules`;
  `PLAYWRIGHT_BROWSERS_PATH=C:\Users\jcrow\l5r-qa-tools\ms-playwright` (Chromium only; WebKit would be
  a download, ask first); `PYTHONUTF8=1`; system Python 3.14 works (damaged caches were cleared); the
  Codex runtime Python did not start from Claude. The full suite takes about 7 minutes: run it in the
  background, one heavy job at a time. If runs stall (the laptop may sleep), discard and rerun.
- Test pitfalls met here: a field on a carousel page not shown is inert, so go to its tab before
  typing; the header clips overflow (menus belong at the end of `<body>`); a smooth `goToTab` can
  glide past after a rebuild; older retained harnesses assume a fresh page is Management with the old
  toolbar gone — corrections must be test-only, documented, with originals kept and passing both
  ways; the older 4.5.x `verify-variants.py` need `--node` and report two historical failures that
  are identical on `main`.
- Full QA and exact removal remain mandatory; save allowance by avoiding repeated runs, not by
  dropping checks. Commit and push only scoped work; never force-push; merge only on the owner's word.
