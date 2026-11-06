# Removing A03 (Release 15a)

A03 is one independently removable unit. Its marker is `PART H PHASE 15.1.3`, its tag `CS15`, its switch `COMPACT_SKILL_CARDS_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.9999999999999997-feat-compact-skill-cards.js` (`CS15`, the switch; sets the `cs15-on` body class; adds one `button.cs15-toggle` to each Skill row, right after the row's name line; toggles the row class `cs15-open`; rebinds `recalcAll` to refresh the summaries; watches `#skillsBody`'s row list) |
| Fragment | `src/css/1129-compact-skill-cards.css` (the Adv & Disadv grid's top alignment, screen only; the phone Skill card grid at 600 px and less, screen only; the control's look, with its words from CSS `attr(data-cs15-summary)`) |
| Manifest | the two entries naming those files (CSS right after A02's `1128-floating-strip.css`; script right after A02's) |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `compact-skills-seam` (guarded `Object.assign`), right after A02's block |
| Registry | the last `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py` (after A02) |

It adds no save field and changes no character data: the open state of a card is a class on the row, never saved, and the control's attributes are not read by the save. So removing A03 cannot affect a saved character. It changes no older fragment, fixture or harness.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. Run `python -B qa/remove-phase.py <scratch copy>` from this folder. It refuses the live tree, a foreign marker inside its block and a missing block. It strips the two fragments, their manifest entries and the seam block, and nothing else.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly Release 15a A02 as live: 17,538,334 bytes, SHA-256 `91d451099ee58f1b481fcf87b3defa7955138f9fb67a56e8fa6fac1e5ad66dc0`. Removing A02 next with its own remover gives A01 exactly (`cffde624…0414`). Both are proved by `qa/test-removal.py`.

Switching it off instead: set `COMPACT_SKILL_CARDS_ENABLED = false`. No class is set and no control is added, so the carousel's own layout applies again. The negative variant `disabled` proves the page then fails exactly the checks A02's live build fails.

## Dependencies

- **Reads, does not change (trunk and long-standing layers):** the Skill rows `makeSkillRow()` builds (`#skillsBody`, `.sk-name-row`, `.sk-name`, `.sk-info-btn`, `.sk-mastery-note`, `.sk-trait`, `.sk-rank`, `.emph-container`, `.sk-school`, `td.sk-cost`, `.sk-roll`, `.rm-btn`); `recalcAll()`, which it wraps, keeping the previous binding; the carousel's phone card rules (Part D, `body.car-active`, the cells' `data-label` captions) and its grid rule (`.car-page .grid`), which it outranks for the Adv & Disadv grid only; the Adv & Disadv markup (`#advList`). If the carousel is missing (`car-active` absent), none of the layout applies and the control stays hidden.
- **Phase 12 (Part K), Play and Manage:** none either way. A03 reads none of Phase 12's attributes and registers nothing with it. Phase 12.4 locks its own fixed list of Skill controls; the new control is not on it, so it stays live in Play, and the fields it shows keep their Play locks. Phase 12.4's harness passes 17/17 with A03 present.
- **Phase 4.54 (Part I), information buttons:** none. The control has no `title=`, so no information button is added to it.
- **The Emphasis count:** the trunk's `getUsableEmphSlots()` and `.emph-limit-note`, read (guarded) to lead the summary with the sheet's own warning while a row has more Emphases than its Rank allows.
- **Other layers that add to a Skill row's first cell or name line:** no code dependency. Examples are the Skill Traits fix's Craft note in the cell and Release 8c's School-choice badge (`SC8.badge`, placed right after the name). Anything they add there is drawn under Details on a phone, after the fields, by two generic rules. `FIRST-CELL-ADDITIONS` checks both places with stand-ins, and with the real `SC8.badge` when that layer is present.
- **A02 and A01:** none either way. A02 can be removed with A03 kept (proved: the A02-removed build passes A03's 32 checks), and A01 likewise (its removal verifies with A02 and A03 kept). A03's end-of-page check works with or without A02's corner controls.
- **Nothing depends on A03.** No later unit may call `CS15` or read `cs15-on`, `cs15-open`, `cs15-toggle` or `data-cs15-summary` without declaring it here first.
