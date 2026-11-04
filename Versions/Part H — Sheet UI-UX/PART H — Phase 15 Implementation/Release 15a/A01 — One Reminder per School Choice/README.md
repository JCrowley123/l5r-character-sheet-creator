# Release 15a · A01 — one reminder for each open School choice

Phase 15, Release 15a, finding A01 ([audit entry](<../../../PART H — Phase 15 UI Consistency Audit/AUDIT.md>), owner rulings Q1–Q8 of 1 November 2026, [delivery rules](<../../../PART H — Phase 15 UI Consistency Audit/PHASE-15-DESIGN-RULES.md>)). Selected by the owner on 4 November 2026. Built alone: no A02 code and none of the three 8b.1 UI follow-ups.

## What changed

At the wizard's last step, Review, an open School choice used to appear twice: once in the top **Still to choose** box and again in the character check's card for that School. The cards stay, as the owner ruled. A01 removes from the box only an item that a card for the same School already names in its own "Still to choose:" list. Anything else (the monk's Lore subject, free Kiho picks, a School whose starting spells the sheet does not record) is shown once, as a card beside that School's own cards. When nothing is left over, the box simply goes; when every choice is made, the "Every choice your School leaves to you is made." line stays exactly as before.

Unchanged: every card and its order, the overspend warning (still first), the Finish button and its overspend confirmation, the step-by-step "Leave for later" reminders, every 8b/8c School provenance, reward-exclusion, starting-spell review and owed-rank behaviour, and all character data. A01 only arranges what Review already shows.

## Current behaviour reproduced first (Release 8c, 4 November 2026)

The audit's screenshots predate 8b/8c, so today's build was driven first: Kuni Shugenja, Matsu Beastmaster and an Order of the Nameless Gift monk, each incomplete, complete, overspent, and overspent-complete (12 runs, `qa/reproduce.cjs`, results in `qa/reproduce/predecessor-8c/`). Findings:

- **Kuni:** the box lists *Any one Weapon Skill*, *3 Earth spells*, *2 Fire spells*, *1 Water spell*; the cards list the same four (the free-Skill card and the starting-spells card). All four are duplicates.
- **Matsu Beastmaster:** *Any 1 Bugei Skill* in both. Duplicate.
- **Monk:** the two free Skills are on both; *The subject of your School's Lore* and *3 free Kiho picks* are only in the box. Unique.
- Complete states show the "every choice is made" line and no School-choice card; overspent states put *Overspent by N XP* first; Finish confirms when overspent.
- Already in 8c, not A01's: naming the monk's Lore subject in the wizard (for example *Lore: History*) produces a *1 School Skill at Rank 0* warning card. Recorded as a follow-up, not changed here.

## How it is built

| Owned item | Purpose |
|---|---|
| `src/sheet/209.9999999999999995-feat-review-one-reminder.js` | `RR15Logic` (pure: which open items a card already names), `RR15` (wraps Review's render once, by property), `REVIEW_ONE_REMINDER_ENABLED` |
| `src/css/1127-review-reminders.css` | `.rr15-reminder`, duplicating Phase 11.2's card declarations rather than sharing its rule |
| Manifest entries for both | Order: CSS after 8b's `1126`; script after 8c's rank spell picker |
| `210-test-seam-and-init.js` block `review-reminder-seam` | Guarded test exports |
| `QA — Removal Chain Registry` entry | Last in `CHAIN` |

A duplicate is an exact list item in a card whose title begins with the applied School's name, bounded by the card's own separators. Nothing is matched by similarity; if a card's wording ever changes, the item reappears as its own card rather than disappearing. Marker `PART H PHASE 15.1.1` (Phase 15 · Release 15a · finding 1; numeric so every existing marker reader parses it). Removal: [ROLLBACK.md](ROLLBACK.md).

## Verification

Recorded in [HANDOVER.md](HANDOVER.md) with the measured numbers of this run.
