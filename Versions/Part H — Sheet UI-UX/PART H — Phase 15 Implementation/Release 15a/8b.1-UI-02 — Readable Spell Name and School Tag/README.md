# Release 15a · 8b.1-UI-02 — Readable Spell Name and School Tag

Group G3, unit 2 of 3. A follow-up to the owner's 3 November device feedback on Release 8b.1 ([the finding](<../../../PART H — Phase 15 UI Consistency Audit/RELEASE-8B-1-DEVICE-FEEDBACK.md>)). The owner approved option C of the mock-up on 11 November 2026 ([G3 mock-ups](<../G3 — Spell Rows/MOCKUP.md>)). Built on 11 November 2026 (Claude), on branch `claude/release-15a-ui02`, stacked on 8b.1-UI-01.

**Built and light-checked. Not device-accepted, not qualified, not live.**

## What changes

Only spell rows in Techniques, Kata & Spells. Technique, Kata and Kiho rows, and the School labels on Skills and Equipment, are untouched.

- **Phone (up to 768 px).** The name takes the first line. Cast, the casting help and Memorised take the second, each at least 44 px tall. Before, the name box was 20 px wide with no room for text; a reward's had 107 px.
- **Laptop.** The row stays one line, at the same height as before.
- **One School tag.** "School spell" in the app's quiet tag look, at the end of the control line. It replaces the drawn "School: Kitsu Shugenja" label. For a character with several Schools the tag carries the School name or names. A reward has no tag.
- **Play.** The same, with the name read-only as before.

Measured on the build, phone, Manage: a School spell card is 198 px (148 px before); the name has 298 px for text; "Wrath of Kaze-no-Kami (Hurricane)", the longest name in the catalogue, shows in full. A laptop card stays 149 px.

Not changed: the saved grant on each row, what counts as a School spell, editing, saving, Cast, Memorised, and print (the label prints as before; the tag does not print).

**On its own, without 8b.1-UI-03,** Remove keeps today's place and size: on a phone it sits over the right end of the name box, as it sits over the Points box on other cards; on a laptop over the tag. 8b.1-UI-03 gives it a clear corner.

## How it is built

- `src/sheet/209.99999999999999999-feat-spell-name-line.js` — `SN15` and the switch `SPELL_NAME_LINE_ENABLED`. A sweep gives each spell row that carries the School-choice layer's label one `span.sn15-tag`, reading the label's own text. It runs after every recalculation and when the list's rows change, and writes only what differs.
- `src/css/1140-spell-name-line.css` — the wrapping line, the tag, and the label not drawn. Screen only.
- One guarded seam block, `spell-name-line-seam`.

The label stays in the row with its text, so anything that reads it still finds it. The tag is not part of the save.

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With UI-02 (this branch) | `7f56eb1f9d3674e7d0334720b4e473384231231999b3026a1973eae7507cd40f` | 17,625,751 |
| UI-02 removed (8b.1-UI-01) | `b3395d846f5d6398b4bcf15214575bdf1a38e1f69f06e5c6b6e74a24b2acea16` | 17,619,334 |

## Light checks (11 November)

| Check | Result |
|---|---|
| Own harness `qa/spell-name-harness.js` (28 checks pinned before the first run) | 28/28, first run |
| Own harness on the 8b.1-UI-01 build (the unit absent) | 7/28 |
| Own harness with 8b.1-UI-01 removed and this unit kept | 28/28 |
| `qa/test-removal.py` | 10/10 |
| `feature-dependencies.py` | every reference inside this unit's own blocks |
| 8b.1-UI-01 | 32/32 |
| Older School Choices: older review, legacy grants, allocation boundaries | 20/20, 4/4, 5/5 |
| Older review with 8b.1-UI-01 removed and this unit kept | 20/20 |
| Phase 11.2.5 (Part K): School choices, review regression | 30/30, 6/6 |
| Phase 12.6 (Part K): Play mode, Techniques | 16/16 |
| Phase 8 (Part J): casting help | 36/36 |
| A11 | 22/22 |

While wiring, one rebuild could not rewrite the output file (a Windows file lock; `OSError 22`). The file already held the same bytes; the rebuild was repeated and verified before anything was recorded. No check was affected.

**Not yet covered here:** iPhone Safari and Laptop Edge (the owner's device round), a file export and re-import, and the group's full qualification.

See [ROLLBACK.md](ROLLBACK.md).
