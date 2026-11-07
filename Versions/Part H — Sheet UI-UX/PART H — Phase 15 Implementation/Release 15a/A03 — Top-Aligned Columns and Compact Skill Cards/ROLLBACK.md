# Removing A03 (Release 15a)

A03 is one independently removable unit. Its marker is `PART H PHASE 15.1.3`, its tag `CS15`, its switch `COMPACT_SKILL_CARDS_ENABLED`. This file describes revision 2 (6 November 2026). Revision 1's Details control is gone; its removal boundary was the same.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.9999999999999997-feat-compact-skill-cards.js` (`CS15`, the switch; sets the `cs15-on` body class; adds one `div.cs15-summary` to each Skill row, right after the row's name line, and keeps its `data-cs15-summary` and `data-cs15-warn` attributes current; rebinds `recalcAll` to refresh them; watches `#skillsBody`'s row list) |
| Fragment | `src/css/1129-compact-skill-cards.css` (the Adv & Disadv grid's top alignment, screen only; the phone Skill card grid at 600 px and less, screen only, with its Play and Manage layouts; the summary's look, with its words from CSS `attr(data-cs15-summary)`) |
| Manifest | the two entries naming those files (CSS right after A02's `1128-floating-strip.css`; script right after A02's) |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `compact-skills-seam` (guarded `Object.assign`), right after A02's block |
| Registry | the last `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py` (after A02) |

It adds no save field and changes no character data: the summary line and its attributes are not read by the save. So removing A03 cannot affect a saved character. It changes no older fragment, fixture or harness.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. Run `python -B qa/remove-phase.py <scratch copy>` from this folder. It refuses the live tree, a foreign marker inside its block and a missing block. It strips the two fragments, their manifest entries and the seam block, and nothing else.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly Release 15a A02 as live: 17,538,334 bytes, SHA-256 `91d451099ee58f1b481fcf87b3defa7955138f9fb67a56e8fa6fac1e5ad66dc0`. Removing A02 next with its own remover gives A01 exactly (`cffde624…0414`). Both are proved by `qa/test-removal.py`.

Switching it off instead: set `COMPACT_SKILL_CARDS_ENABLED = false`. No class is set and no summary is added, so the carousel's own layout applies again. The negative variant `disabled` proves the page then fails exactly the checks A02's live build fails.

## Dependencies

- **Reads, does not change (trunk and long-standing layers):** the Skill rows `makeSkillRow()` builds (`#skillsBody`, `.sk-name-row`, `.sk-name`, `.sk-info-btn`, `.sk-mastery-note`, `.sk-trait`, `.sk-rank`, `.emph-container`, `.sk-school`, `td.sk-cost`, `.sk-roll`, `.rm-btn`); `recalcAll()`, which it wraps, keeping the previous binding; the carousel's phone card rules (Part D, `body.car-active`, the cells' `data-label` captions) and its grid rule (`.car-page .grid`), which it outranks for the Adv & Disadv grid only; the Adv & Disadv markup (`#advList`). If the carousel is missing (`car-active` absent), none of the layout applies and the summary stays hidden.
- **The trunk's Mastery notes:** `renderSkillMasteryNote()` draws each note as a span with an inline style, in its muted colour (`#a89f8c`) when the Rank has not reached it. In Play on a phone A03 hides exactly those spans (the stylesheet's one `!important`, needed against the inline display). If the trunk ever drew them another way, the rule would match nothing and every note would show (nothing is hidden by mistake); `PLAY-MASTERIES-REACHED` would fail and say so.
- **Phase 12 (Part K), Play and Manage:** a declared soft dependency, recorded in Phase 12's `ROLLBACK.md` too. A03's stylesheet reads Phase 12's `pm12-play` body class to tell Play from Manage. It calls nothing of Phase 12's and registers nothing with it. Without Phase 12 the class never appears, so every card takes the Manage layout, which draws every field and note. Phase 12's remover refuses while a fragment names its classes, so remove A03 before Phase 12; the removal chain does so in order. Phase 12.4 locks its own fixed list of Skill controls; the summary is not a control and not on it. Phase 12.4's harness passes 17/17 with A03 present.
- **Phase 4.54 (Part I), information buttons:** none. The summary has no `title=`, so no information button is added to it.
- **The Emphasis count:** the trunk's `getUsableEmphSlots()` and `.emph-limit-note`, read (guarded) to lead the summary with the sheet's own warning while a row has more Emphases than its Rank allows.
- **Other layers that add to a Skill row's first cell or name line:** no code dependency. Examples are the Skill Traits fix's Craft note in the cell and Release 8c's School-choice badge (`SC8.badge`, placed right after the name). Anything they add there is drawn on a phone in both modes, full width, below the second row (in Manage after the XP and before Remove), by two generic rules. `FIRST-CELL-ADDITIONS` checks both places with stand-ins, and with the real `SC8.badge` when that layer is present.
- **A02 and A01:** none either way. A02 can be removed with A03 kept (proved on the frozen candidate: the A02-removed build passes all 37 of A03's checks, `qa/a02-removed-a03-kept-r2.log`), and A01 likewise (its removal verifies with A02 and A03 kept). A03's end-of-page check works with or without A02's corner controls.
- **Nothing depends on A03.** No later unit may call `CS15` or read `cs15-on`, `cs15-summary`, `data-cs15-summary` or `data-cs15-warn` without declaring it here first.

## Harness synchronisation fix (7 November 2026, during G2)

`qa/compact-skills-harness.js`'s `type()` now waits until `#skillsBody` has had no DOM change for 300 ms (at most 3 s) before tapping a field. It was added because G2's A11 preview once saw `MANAGE-EDITS-WORK`'s keys typed into Iaijutsu's Rank go nowhere (the field held 5), and `PLAY-MASTERIES-REACHED` then failed after it. On the same page the harness gave 37/37. Measured: the Skills table redraws parts of its rows about 130 ms after a Rank changes, later than `settle()`'s two frames. Synchronisation only: same ids, same count (37), no assertion changed. 37/37 on G2's build (`77936023…82f0`) and on G1 as live (`2dcf6f20…6af6`). The exact handler that moves the focus was not identified; if the race recurs, find it before qualifying.
