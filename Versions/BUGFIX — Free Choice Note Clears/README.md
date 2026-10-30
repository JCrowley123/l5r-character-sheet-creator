# Free Choice Note Clears

**Status, 30 October 2026:** built for Release 8a.1 on branch `claude/release-8a1-quieter-overspend`; not merged. The
release's QA folder is `QA — Release 8a.1 2026-10-30`.

Your note of 30 October (Release 8a device checks): the character check kept saying "Bayushi Bushi: 1 free Skill
choice" after the player had picked Acting and ticked it as a School Skill, while the wizard's Review said "Every choice
your School leaves to you is made". A note should show only when there is something to highlight.

With the switch on, the note (Phase 5's `school-choice-slots`, Part J) reports only the choices still open, as "Bayushi
Bushi: 1 free Skill choice still open", and nothing once they are all made. Its detail (which choices the School
leaves) is unchanged. With the switch off, the note is always on, as before.

## Choices declared

- **The evidence:** a Skill ticked as a School Skill that none of the character's Schools names is a filled free choice.
  Named Skills are the School's own, read as the sheet reads them (Apply School Skill Rows' reader; an old name such as
  "Theology" counts as the Skill it stands for).
- **How many each choice is:** "any two Skills" is two; "two ranks in any one Craft Skill" is one; any other "any …" is
  one. (Phase 5's old count was one per choice, so a Brotherhood monk's "any two Skills" now counts two.)
- **A "Lore (pick one)" row the wizard renamed** ("Lore: History"): the School names the bare family "Lore", and one
  subject row takes it, so the rename is not counted as a free choice. A second Lore subject is. A row still named "Lore"
  takes the family itself. A family that names more than one ("Artisan (pick 2)", Shiba Artisan) still takes one row,
  so its second subject counts as a free choice and the note can go early (the 8a.1 review, finding 2).
- **A Skill ticked as School by hand that is not a free choice** counts as one, so the note goes early. The
  check cannot tell such a tick from a choice, and the kind of Skill a choice asks for ("any one Bugei Skill") is not
  checked either. A choice that leaves no extra ticked row (a second row named like a Skill the School already names)
  stays reported as open; the sheet's Skill pickers hide Skills already held, so that is unlikely.
- **Two Schools:** the filled choices are shared out in the order the character holds the Schools, first School first;
  each School's note reports what is left of its own.

## How it is built

One fragment behind one switch, `FREE_CHOICE_OPEN_ONLY_ENABLED = true`:
`src/sheet/209.999999999999999-bugfix-free-choice-note.js`, with `FC8Logic` (sizes, matching, sharing, the words) and
`FC8`. It rebinds the rule's `fn` in `CHARACTER_VALIDATOR_RULES` by property, keeps the previous function and delegates
to it, then retitles or drops each of its findings (one per School with free choices, in order). The validator's own
file is untouched. Test seam: the `free-choice-seam` block in `src/sheet/210-test-seam-and-init.js`.

## Checks

- `qa/free-choice-harness.js`: 9 checks. The Isawa Shugenja walk (two free choices): both open, one filled in the
  wizard, both filled (no note), one unticked by hand (open again), Review's findings list with no note; and the logic:
  sizes, the bare Lore family, two Schools, the words.
- Pinned variants (`qa/variants.json`, committed before the first run): main (8a, the baseline) fails 8; the switch off
  6; no-family 1; no-sizes 1; drops-all 3; untick-ignored 1; not-shared 1.
- Removal (`qa/test-removal.py`): the rebuild is 8a.1 with the Overspend One Line layer only, `c0b29237…`, 17,455,377
  bytes.

## Older checks changed

See ROLLBACK: one check each in the Apply School Skill Rows harness and Phase 11.2.1's wizard harness expect the new
behaviour only while this switch is on.
