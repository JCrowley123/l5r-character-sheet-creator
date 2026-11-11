# Release 15a · 8b.1-UI-01 — Starting-Spell Review and Its Actions

Group G3, unit 1 of 3. A follow-up to the owner's 3 November device feedback on Release 8b.1 ([the finding](<../../../PART H — Phase 15 UI Consistency Audit/RELEASE-8B-1-DEVICE-FEEDBACK.md>)). The owner approved the mock-up on 11 November 2026 ([G3 mock-ups](<../G3 — Spell Rows/MOCKUP.md>)). Built on 11 November 2026 (Claude), on branch `claude/release-15a-ui01`, stacked on live G2.

**Built and light-checked. Not device-accepted, not qualified, not live.**

## What changes

Only the older-holdings review of starting spells (Manage, the character check's **Review starting spells**). The ordinary chooser that follows it, the Skills review and the creation wizard are untouched.

- **Option cards.** Each held spell is the pickers' option card: a 1 px line border, 6 px radius, .9 rem text, measured equal to Paragon's card, and at least 44 px tall. A ticked card is filled and bold. A tap anywhere on the card ticks it.
- **Live counts.** Each group's heading shows a running count: "2 of 3 chosen", solid with a tick when complete, red with "deselect 1" when over. Before, the heading read "3 left" and never changed. "Given" reads "Given by your School", as the next screen words it.
- **One action bar.** Later (secondary) and Confirm (primary) sit together under a divider, on the dialog's common inset. Before, Confirm touched the last group and started 2 px left of it, with Later below.
- **Scrolling.** Only the groups scroll. The title, the instruction, any refusal message and the action bar stay in view.
- **Laptop.** The groups take two columns from 800 px.

Not changed: which spells are offered, the quotas, what Confirm saves, what Later discards, the wording of the instruction and of the refusal, and the focus order (Confirm, then Later, as before).

A School whose line is boxes rather than Element counts (Isawa, Spider Chuda, Yogo) keeps its second instruction line; its headings carry no number, so they show no count.

## How it is built

- `src/sheet/209.99999999999999998-feat-spell-review-layout.js` — `SR15` and the switch `SPELL_REVIEW_LAYOUT_ENABLED`. It rebinds `SC8.render` by property. After each render it looks at what was drawn: a spell review is dressed (the groups wrapped in one scrolling box inside the body, headings split into name and count, the dialog given `sr15-review`); anything else has the class taken off.
- `src/css/1139-spell-review-layout.css` — the dialog as a seven-row grid while it is open and marked. The body's own box is not drawn (`display: contents`), so Confirm and Later share the last row **without either leaving its parent**.
- One guarded seam block, `spell-review-layout-seam`.

Three things the mock-up's scratch wiring got wrong are avoided by construction:

- **Confirm stays in the body.** The older-holdings layer's Confirm handler requires it there.
- **Later is never moved.** It stays the dialog's own last child, so no render can delete it.
- **The ordinary chooser sheds the layout.** The class is decided after every render, and the styles also need `[open]`.

The count reads the tick boxes and writes nothing: no value, save, roll, undo, focus or timing. The unit is screen-only.

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With UI-01 (this branch), revision 1 | `390f3cd1df02639b086e8dfc3ba3c883bbb62cdfb27ddf906b72c7b923fef19c` | 17,619,920 |
| UI-01 removed (live G2) | `7793602382c68895b25dc572b71bd05af33667a9c1b1d1bd76032efd744182f0` | 17,609,230 |

## Light checks (11 November)

| Check | Result |
|---|---|
| Own harness `qa/spell-review-harness.js` (32 checks pinned before the first run) | 32/32, first run |
| Own harness on live G2 (the unit absent) | 5/32 |
| Own harness with A04.1 removed and UI-01 kept (`68c487f9…a3d6`) | 32/32 |
| `qa/test-removal.py` | 10/10 |
| `feature-dependencies.py` | every reference inside this unit's own blocks |
| Older School Choices: `older-review-harness.js` | 20/20 |
| Older School Choices: `legacy-grants-harness.js` | 4/4 |
| Older School Choices: `allocation-boundaries-harness.js` | 5/5 |
| Older School Choices: `checklist-walk.cjs` (taps through the review on a phone) | 6/6 |
| Phase 11.2.5 (Part K): `school-choices-harness.js` | 30/30 |
| Phase 11.2.5 (Part K): `review-regression-harness.js` | 6/6 |
| A04.1 | 56/56 |

The harness builds its older character in the page, as the older-holdings layer's own harness does, so it needs no fixture from another folder. Its oracles are the School's rulebook line, the tick boxes, the saved character before and after, Paragon's own card, and the same dialog rendered with this unit's body class taken away.

**Revision 1 (the group's code review, 11 November).** The read-only review found nothing serious. Three small points were taken here, before the owner's device round. The first build was `b3395d84…ea16` (17,619,334 bytes); its preview passed 171/171.

- **The refusal message stays rendered while empty**, taking no room, so a screen reader announces "Too many choices…" when it arrives. Before, the empty message was not drawn at all.
- **A space between a heading's name and its count**, so its text reads "Water 2 of 3 chosen".
- **A second height limit on the scrolling groups**, for a browser that does not shrink that row to the dialog's own maximum: the action bar cannot be pushed off the screen.

Three existing checks were strengthened, with the same ids and count: the empty message is rendered and takes no height; the headings' own text; and a boxes School's headings carry no count (that assertion had been true by construction). 32/32 on the revised build, and every row of the table above was run again on it.

**Recorded, not changed:** Tab reaches Confirm before Later, as it always has, while the bar draws Later to the left. Moving either button out of its parent to change that would break the constraint this unit is built on.

**Not yet covered here:** iPhone Safari and Laptop Edge (the owner's device round), and the group's full qualification. The grid relies on a dialog with a maximum height shrinking its one flexible row; that is standard, and is the first thing to look at on the iPhone with a long list.

See [ROLLBACK.md](ROLLBACK.md).
