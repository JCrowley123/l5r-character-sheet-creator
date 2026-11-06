# Release 15a · A03 — top-aligned columns and compact phone Skill cards

Phase 15, Release 15a, finding A03 ([audit entry](<../../../PART H — Phase 15 UI Consistency Audit/AUDIT.md>), owner ruling Q1 of 1 November 2026, [delivery rules](<../../../PART H — Phase 15 UI Consistency Audit/PHASE-15-DESIGN-RULES.md>)). Built on 5–6 November 2026 after the owner accepted A02 and A02 went live, from [the kickoff](<../A02 — Floating Controls Above the Tabs/KICKOFF-15A-A03.md>). Built alone: none of A04 onward, none of the three 8b.1 UI follow-ups, not FU-15a-1, and not the parked always-visible stats header.

## What changed

**1. The Advantage and Disadvantage columns start level.** On a wide screen the two lists sit side by side. The carousel aligns every page grid to the bottom of its cells, so a wrapped label keeps two inputs level. This grid holds two lists, not two fields, so with unequal lists one column began far below the other. On the dense test character:
- the Advantages heading sat 1,113 px below the Disadvantages heading;
- with no Advantages it sat 2,247 px below.

Both columns now start at the top: 0 px apart, in Play and Manage, with both lists filled or either one empty. Only this one grid changes. Every other grid keeps the carousel's alignment, and print is unchanged.

**2. Phone Skill cards are compact.** On a phone each Skill card used to stack every field on its own labelled line, 324–601 px a card, so a phone screen showed about one and a half Skills. Each card is now two rows:
- the Skill's **name**, its **Rank** and the **d10** roll;
- a **Details** control with a one-line summary (the Trait, the Emphases, and "School" when ticked), and the Skill Info eye.

Tapping **Details** opens the rest of the card in place:
- the Trait;
- the Emphases with + Emph and the count note;
- the School tick and the XP;
- the Mastery notes, with those already reached highlighted, as before;
- Remove.

Tapping it again closes it.
- While a Skill has more Emphases than its Rank allows, the summary leads with the sheet's own count note in its warning colour (for example "2 / 1 emphases at rank 1"), so that warning is never hidden.
- Anything another layer adds to the card's first cell or name line is drawn under Details, after the fields. Examples are the Skill Traits fix's Craft note and the School choice's source badge ("School: Hida Bushi").
- Every card starts closed, except one with no name or no Trait (a new blank row from + Add Skill), which starts open.
- The open state is not saved.
- Management stays on the same page, and nothing moves to another screen.

Unchanged:
- every value, tick and action, with its element, listener and name, and its place in the page;
- the Play and Manage locks (Phase 12 (Part K));
- the desktop Skills table, the tablet scroller, print, and all character data.

## Measured (6 November 2026)

`qa/reproduce.cjs` loads the audit's dense test character, with either list emptied and with a long Skill list (18 Skills with Masteries, Emphases and School ticks; `qa/a03-fixtures.json`), on a phone (390 × 844), a small phone (375 × 667) and a desktop (1440 × 1000), in Play and Manage. A02 as live and A03 were measured with the same probe (`qa/reproduce/predecessor-a02/`, `qa/reproduce/candidate/`). Comparison: [COMPARISON.md](COMPARISON.md).

On the frozen candidate (`eb1c29f7…8d18`):
- **Desktop columns:** the headings were 1,092–2,249 px apart and are now **0 px**, with both lists filled or either one empty.
- **Phone Skill cards:** each card was 324–601 px and is now **116 px**.
- **The long Skills page on a phone:** 7,581 → 2,709 px in Play, 8,894 → 2,808 px in Manage.
- **Cards per screen:** about 1.5 → **5.5** on a phone, 1.0–1.3 → **4** on a small phone.
- **Desktop Skills table:** unchanged, to the pixel.

## How it is built

| Owned item | Purpose |
|---|---|
| `src/sheet/209.9999999999999997-feat-compact-skill-cards.js` | `CS15` sets `cs15-on` on the body and adds one Details control (`button.cs15-toggle`) to each Skill row, right after its name line. It keeps each summary current: on typing in a row, and after each recalculation (it wraps `recalcAll`). It decorates new rows as they arrive (a MutationObserver on `#skillsBody`'s row list only). `COMPACT_SKILL_CARDS_ENABLED` |
| `src/css/1129-compact-skill-cards.css` | The Adv & Disadv grid's top alignment (screen only); the phone card grid at 600 px and less (screen only); the control's look |
| Manifest entries for both | CSS right after A02's; script right after A02's |
| `210-test-seam-and-init.js` block `compact-skills-seam` | Guarded test exports, right after A02's block |
| `QA — Removal Chain Registry` entry | Last in `CHAIN`, after A02 |

**How the cards are laid out.** The card's row becomes a three-column grid. The first cell and the name line use `display: contents`, so the name, the eye and the control take grid places of their own while staying where they are in the page. Every other cell, and anything another layer adds to the first cell, takes a full row underneath and is drawn only while the card is open.

**The control.**
- Its visible words come from CSS: "Details" and `attr(data-cs15-summary)`. So it adds no text to the row.
- Its accessible name is an `aria-label`, such as "Details for Kenjutsu: Agility, Katana, Ninja-to", with `aria-expanded`.
- It has no `title=`, so Phase 4.54 (Part I) adds no information button to it.
- It is not on Phase 12.4's lock list, so it stays live in Play. The fields it shows keep their Play locks.

**Browsers without `:has()`.** The layout sits inside `@supports selector(:has(*))`. A browser without `:has()` (older Safari, Firefox before 121) keeps the earlier layout whole, with the control hidden.

**Focus order (a declared trade-off).** Nothing moves in the page, so the keyboard and screen-reader order is the page's own: name, eye, Details, the fields, Rank, then roll. On a phone the card draws name, Rank and roll first, so the order jumps between the two rows. Fixing that would mean moving elements other layers rely on.

**Oracles that lean on the layer (declared).**
- `SUMMARY-MATCHES` rebuilds the expected summary from the row's own fields with the same rule, anchored by three fixture literals.
- `PRINT-UNCHANGED` builds its reference by lifting A03's class and controls out of the same page.
- `FIRST-CELL-ADDITIONS` uses stand-ins, plus the real School-choice badge where that layer is present.

**Removal.** Marker `PART H PHASE 15.1.3` (Phase 15 · Release 15a · finding 3). Removal: [ROLLBACK.md](ROLLBACK.md).

**Not verified automatically:**
- a real iPhone's Safari, which supports `:has()` and `display: contents` from iOS 15.4 and 16;
- the Galaxy Fold's outer screen below 320 px;
- a screen reader.

## Verification

Recorded in [HANDOVER.md](HANDOVER.md), with the numbers measured on this run.
