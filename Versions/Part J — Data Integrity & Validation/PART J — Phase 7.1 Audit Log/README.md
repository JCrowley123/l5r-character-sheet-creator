# Phase 7.1 — Audit Log

**Status, 29 October 2026:** built for Release 7c on branch `release-7c`; not merged. The release's QA folder is `QA — Release 7c 2026-10-29`.

Phase 7's `AuditLog` service with append-only entries, to your answers of 29 October 2026 in the [Release 7c — Audit Log Questions](https://claude.ai/artifact/7cw3VpTWGRH4g67MHNAhau) (Q1 and Q3 as recommended; Q2 in both places).

- **What it records (Q1).** The changes that cost or award something: XP total and XP spent; Honor, Glory and Status (Rank.Points) and Taint; Void Points; spell slots used; each Advantage or Disadvantage row's uses left (Luck, Dark Paragon and the like); the Ancestor's gift this session; Advantages, Disadvantages, Techniques and spells added or removed; spells memorised; Insight Rank and School. Each entry holds the date and time, what changed, and from and to. Not every keystroke: the sheet is compared with itself once it has been still for 1.5 seconds, so typing 4 then 45 is one entry. A spend and its refund are two entries (Void Points 3 → 2, then 2 → 3).
- **Where it shows (Q2).** A read-only History panel, newest first, with the date and time: from the sheet's ⋯ menu (where Print and Export JSON are), and from each saved character's ⋯ menu in the Characters list, which shows that character's saved log without opening it. Search does not index it.
- **Saved with the character (Q3).** In the save and in Export JSON as `auditLog`, the last 500 entries. A save without one, any save from before 7c, starts an empty log. There is no clearing, in Play or Management.

## How it is built

One fragment behind one switch, `AUDIT_LOG_ENABLED = true`: `src/sheet/209.999999999999993-feat-audit-log.js`, with `AL71Logic` (UI-agnostic: entries, frozen; append with the cap; load a saved log; the difference between two looks at the sheet; the words) and `AL71` (reads the sheet, keeps the log, the History panel and its two menu items; wraps `recalcAll` to look once the sheet is still, `applyData` and `resetToBaseline` to start each character's log afresh, `collectData` to save it, and `CL11.render` for the list's menus). Test seam: the `audit-seam` block in `src/sheet/210-test-seam-and-init.js`.

Immutable: every entry and the log itself are frozen; the sheet has no way to change or remove an entry, only to add one. A save edited by hand loads only its well-formed entries.

History is added to the sheet's ⋯ menu whenever the toolbar is built, so a slow storage read (the Claude-hosted bridge) cannot leave it out (review finding 3). Besides the sheet's own recalculation, any input, change or tap schedules the next look, so a field whose listener reaches the sheet's first `recalcAll` is logged on time (review finding 5).

Known limits: what changed is seen by comparing, so the log says what changed, not why (a Void Point spent by a roll and one spent on the card read alike). A row's uses are named by the row's name, numbered when two rows share one. A change made in the first 1.5 seconds after a load or Import counts as the starting point and is not logged (review finding 5). On a sheet not yet saved as a character, a change undone leaves its two entries, so opening another character asks whether to discard it (review finding 4; a new character is saved at once, so this is rare).

## Checks

- `qa/audit-harness.js`: 17/17 on the candidate (15, then two checks pinned for the review's findings 3 and 5) (Phase 7's test list: entries correct and immutable).
- Pinned negative variants (`qa/variants.json`, committed before the first run): main (baseline) fails exactly 14 pinned checks; disabled 6; not-frozen 1; load-not-restart 1; reset-keeps 1; no-menu 1; no-list-item 1; oldest-first 1; cap-small 1; no-quiet 4. All matched.
- Removal (`qa/test-removal.py`): 6/6. This remover rebuilds `06e8eb9ccf6306cf7e9c5e365b6afbfe183832a8776a769cd21ff088f9952453`, 17,428,244 bytes (Release 7c's five layers without the audit log).
