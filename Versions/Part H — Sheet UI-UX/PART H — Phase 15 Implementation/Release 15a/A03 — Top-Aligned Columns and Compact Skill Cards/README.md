# Release 15a · A03 — top-aligned columns and compact phone Skill cards

Phase 15, Release 15a, finding A03 ([audit entry](<../../../PART H — Phase 15 UI Consistency Audit/AUDIT.md>), owner ruling Q1 of 1 November 2026, [delivery rules](<../../../PART H — Phase 15 UI Consistency Audit/PHASE-15-DESIGN-RULES.md>)). Built on 5–6 November 2026 after the owner accepted A02 and A02 went live, from [the kickoff](<../A02 — Floating Controls Above the Tabs/KICKOFF-15A-A03.md>). Built alone: none of A04 onward, none of the three 8b.1 UI follow-ups, not FU-15a-1, and not the parked always-visible stats header.

**This is revision 2 (6 November 2026).**
- **Revision 1** put each phone card's fields and Mastery notes under a labelled **Details** control. The owner passed all 12 of its device checks, then chose **Revise**: Details hid what is used at the table (the Masteries, the Emphases), and a second control beside the Skill Info eye added little.
- **Owner's decision:**
  - no Details control;
  - in Play, only the Masteries already reached;
  - the laptop Adv & Disadv columns stay as revision 1 built them.
- **Considered and declined:** a laptop grid that lined each Advantage up with the Disadvantage beside it. It looked even, but it padded the shorter card in every pair.
- **Evidence:** the prototypes the decision was made from are recorded in [HANDOVER.md](HANDOVER.md).

## What changed

**1. The Advantage and Disadvantage columns start level** (unchanged from revision 1). On a wide screen the two lists sit side by side. The carousel aligns every page grid to the bottom of its cells, so a wrapped label keeps two inputs level. This grid holds two lists, not two fields, so with unequal lists one column began far below the other. On the dense test character:
- the Advantages heading sat 1,113 px below the Disadvantages heading;
- with no Advantages it sat 2,247 px below.

Both columns now start at the top: 0 px apart, in Play and Manage, with both lists filled or either one empty. Only this one grid changes. Every other grid keeps the carousel's alignment, and print is unchanged.

**2. Phone Skill cards are compact, with nothing hidden behind a control.** On a phone each Skill card used to stack every field on its own labelled line, 324–601 px a card, so a phone screen showed about one and a half Skills.

**In Play**, each card shows:
- the Skill's **name**, its **Rank** and the **d10** roll;
- one summary line, beside the Skill Info eye: the Trait, the Emphases, and "School" when ticked. A long line wraps onto a second line instead of being cut off;
- the **Mastery notes already reached**, highlighted as the sheet always drew them. A Skill below its first Mastery shows none.

The Trait, Emphases, School and XP fields themselves are not drawn in Play, because the summary line shows their values; they are locked in Play anyway (Phase 12 (Part K)). Drawn only in Manage on a phone: the XP, the Masteries not yet reached, the Emphasis count line (unless the Skill is over its limit) and the Free badges.

**In Manage**, each card shows every field straight away, packed tighter than before:
- the name, the Rank and the d10;
- the Trait and the School tick, beside the eye;
- the Emphases with + Emph and the count note;
- the XP;
- every Mastery note, with those reached highlighted;
- Remove, last.

Other behaviour:
- While a Skill has more Emphases than its Rank allows, the Play summary leads with the sheet's own count note in its warning colour (for example "2 / 1 emphases at rank 1"), so that warning is never hidden. In Manage the count note shows in its own place.
- Anything another layer adds to the card's first cell or name line is drawn in both modes, full width, below the second row (in Manage after the XP and before Remove). Examples are the Skill Traits fix's Craft note and the School choice's source badge ("School: Hida Bushi").
- Switching between Play and Manage redraws every card at once.
- Management stays on the same page, and nothing moves to another screen.

Unchanged:
- every value, tick and action, with its element, listener and name, and its place in the page;
- the Play and Manage locks (Phase 12 (Part K));
- the desktop Skills table, the tablet scroller, a phone held sideways (it shows the table, with every Mastery note, as before), print, and all character data.

## Measured (6 November 2026)

`qa/reproduce.cjs` loads the audit's dense test character, with either list emptied and with a long Skill list (18 Skills with Masteries, Emphases and School ticks; `qa/a03-fixtures.json`), on a phone (390 × 844), a small phone (375 × 667) and a desktop (1440 × 1000), in Play and Manage. A02 as live and revision 2 were measured with the same probe (`qa/reproduce/predecessor-a02/`, `qa/reproduce/candidate-r2/`). Comparison: [COMPARISON.md](COMPARISON.md).

On the frozen candidate (`e73b7c0c…de06`):
- **Desktop columns:** the headings were 1,092–2,249 px apart and are now **0 px**, with both lists filled or either one empty.
- **Phone Skill cards in Play:** each card was 324–490 px on the long test character and is now **114–158 px**. A card with no Mastery reached is 114 px, and each reached Mastery line adds about 15 px.
- **Phone Skill cards in Manage:** 372–601 px → **241–470 px**, with every field drawn.
- **The long Skills page on a phone:** 7,581 → 2,908 px in Play, 8,894 → 6,537 px in Manage.
- **Cards per screen:**
  - in Play, about 1.7 → **5.0** on a phone and 1.2 → **3.6** on a small phone;
  - in Manage, 1.4 → 2.0 and 1.0 → 1.4.
- **Desktop Skills table:** unchanged, to the pixel.

Revision 1 (Details closed) drew every card at 116 px in both modes, but showed no Masteries and no editing controls until Details was opened.

## How it is built

| Owned item | Purpose |
|---|---|
| `src/sheet/209.9999999999999997-feat-compact-skill-cards.js` | `CS15` sets `cs15-on` on the body and adds one summary line (`div.cs15-summary`) to each Skill row, right after its name line. It keeps each summary current: on typing in a row, and after each recalculation (it wraps `recalcAll`). It decorates new rows as they arrive (a MutationObserver on `#skillsBody`'s row list only). `COMPACT_SKILL_CARDS_ENABLED` |
| `src/css/1129-compact-skill-cards.css` | The Adv & Disadv grid's top alignment (screen only); the phone card grid at 600 px and less (screen only), with its Play and Manage layouts; the summary's look |
| Manifest entries for both | CSS right after A02's; script right after A02's |
| `210-test-seam-and-init.js` block `compact-skills-seam` | Guarded test exports, right after A02's block |
| `QA — Removal Chain Registry` entry | Last in `CHAIN`, after A02 |

**How the cards are laid out.**
- Each card's row becomes a three-column grid.
- The first cell and the name line use `display: contents`. So the name, the eye and the summary take grid places of their own, while staying where they are in the page.
- The first row is always the name, the Rank and the roll; the eye ends the second row.
- Play and Manage are told apart by Phase 12 (Part K)'s `pm12-play` body class. Without that phase every card takes the Manage layout, which draws everything.

**The summary line.**
- Its words come from CSS (`attr(data-cs15-summary)`), so it adds no text to the row.
- It is not a control: it takes no focus and carries no role, no title and no expanded state.
- It has no `title=`, so Phase 4.54 (Part I) adds no information button to it.
- Screen readers read it as text in Play, where the fields it summarises are not drawn.

**Masteries in Play.**
- The sheet's own Mastery notes are drawn by the trunk, one span per tier, in a muted colour while the Rank has not reached the tier.
- In Play on a phone, A03 hides exactly the muted ones. This takes the stylesheet's only `!important`, because the trunk sets each span's display inline.
- If the trunk ever drew them another way, the rule would match nothing and every note would show. Nothing would be hidden by mistake, and `PLAY-MASTERIES-REACHED` would fail and say so.

**Browsers without `:has()`.** The layout sits inside `@supports selector(:has(*))`. A browser without `:has()` (older Safari, Firefox before 121) keeps the earlier layout whole, with the summary hidden.

**Focus order (a declared trade-off).** Nothing moves in the page, so the keyboard and screen-reader order is the page's own. In Play that is the name, the eye, the summary text, the Rank and the roll; in Manage the name, the eye, the Trait, the Rank, the Emphases, the School tick, the roll and Remove. The card draws the name, Rank and roll first, so the order jumps between rows. Fixing that would mean moving elements other layers rely on. Revision 1's control joined the name and summary in one comma-separated label; the summary is now read as text, so its " · " separators are voiced according to the reader's punctuation setting.

**Oracles that lean on the layer (declared).**
- `SUMMARY-MATCHES` rebuilds the expected summary from the row's own fields with the same rule, anchored by four fixture literals.
- `PLAY-COMPACT`, `MANAGE-SHORTER` and `PRINT-UNCHANGED` build their reference by lifting A03's class and summaries out of the same page.
- `FIRST-CELL-ADDITIONS` uses stand-ins, plus the real School-choice badge where that layer is present.

**Removal.** Marker `PART H PHASE 15.1.3` (Phase 15 · Release 15a · finding 3). Removal: [ROLLBACK.md](ROLLBACK.md).

**Not verified automatically:**
- a real iPhone's Safari, which supports `:has()` and `display: contents` from iOS 15.4 and 16;
- the Galaxy Fold's outer screen below 320 px;
- a screen reader.

## Verification

Measured on this run, on the frozen candidate `e73b7c0c…de06`. Both full passes (3 and 4) passed on their first executions:
- **with A03:** 6,865/6,865 checks (A03's 37 and A02's 6,828);
- **with A03 removed:** 6,755/6,755. The removal rebuilt A02's live build `91d45109…6dc0` byte for byte.

The local package and the branch preview each passed 550/550 over 23 harnesses. Every stage, with its evidence, is in [HANDOVER.md](HANDOVER.md). Revision 1's record is kept there too.
