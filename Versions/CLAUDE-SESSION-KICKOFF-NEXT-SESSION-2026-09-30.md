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

## Proposal to challenge (from the 30 September session)

**Next: Phase 7 (Part J), first release — the save format made true, and older saves migrated.**
Scope: a small `VersionManager` that stamps the real format on every save/export and upgrades older
saves through registered steps (formalising 4.5.2's private format-3 adapter), fixing the recorded
mismatch (`SHEET_SCHEMA_VERSION` is still 2 while saves are format 3) and the finding that an
imported older save keeps its old layout until opened. Tests with real older saves (the owner's
`Sairyu_.l5r`), round-trips, a newer-format refusal, and exact removal.
**Non-goals:** the audit log (needs the owner's ruling on whether it is wanted at all), PDF, the
Android shell-aware save, the parked ideas.
**Rulings to ask for:** convert on Import or on first open; audit log in, out or later; whether the
accented-file-name finding ("fix with the next change to export") rides along.

Why it was preferred, for you to test rather than accept:
- Two owner-ruled findings already wait on Phase 7; save-format drift grows with every release that
  adds data, and PDF (11.1) would read that data.
- Engineering only: not source-gated, no Safari/carousel risk, reuses existing persistence code.
- Phase 11.1 carries the larger unknowns (a client-side PDF library in a single-file app, per-shell
  saving, the parked Print idea); the 28 September plan said to compare 11.1 and 7 after Phase 12.

Alternatives on the table: 11.1 first; D06 Weakness (needs Trait/Ring/Insight boundary rulings);
the Rank 0 exploding-10s bug (small, parked "with the next dice change"); Phase 4.8 Ancestors (the
owner has the material); the owner's own Android 0.7 device checks (0 of 7 done); Phase 15 last.
Source-dependent phases (4.6–4.8, 6, 9 flavour, 13/14) keep their prerequisites.

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
