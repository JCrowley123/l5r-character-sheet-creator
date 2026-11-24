# Release 15b group 2 · read-only code review of the group's diff

24 November 2026 (Claude), in this session, before the owner's device round, as the 6 November amendment asks.

**Scope:** the diff from `claude/release-15b-g2` (`af46a237`: `main` at `acdb6f75`, group 1 live, plus group 2's records) to `claude/release-15b-b09`, in the Phase 0 sources and the manifest. That is:
- the four scripts and one stylesheet;
- the four seam blocks;
- the two older harnesses made to follow B01's switch (Feature 4.5.31's suite harness and its dependency harness).

Each finding below was checked against the code and, where it says so, in the browser.

## Changed during the build (found by the light checks, not by reading)

| # | Unit | Finding | Outcome |
|---|---|---|---|
| 1 | B09 | The first tag, `PT15`, also appears inside the vendored PDF library's data. B09's remover scans every retained source for its surface, so it refused. | Renamed `SKP15`, which appears nowhere else. Removal proof 10/10 after; the behaviour did not change (README). |

## Low, left as they are (for the record)

| # | Unit | Finding | Why it stays |
|---|---|---|---|
| 2 | B01 | The two wrappers match by key (six checks) and by Lost Love's exact text and spoken name. If Feature 4.5.31 ever rewords Lost Love's button, B01 leaves it alone. | That is the intended failure mode: never a wrong label, at worst the old one. |
| 3 | B01 | The spoken names say "Willpower roll", where the trunk said "Willpower Trait Roll". | As approved on the board ("Resist insult (TN 25): Brash, Willpower roll when threatened or insulted"). |
| 4 | B03 | In print, Feature 4.5.33 hides its buttons, so the amount ("1k1 + 2 (School Rank)") prints on its own beside the note. | It reads correctly on paper. B12 (print) is a later group. |
| 5 | B03 | The School Rank in the amount is `VI4533.schoolRank()`, which falls back to 1 when the School Rank box is empty. | The same figure the Leadership roll itself adds, so the button and the roll always agree. |
| 6 | B03 | A greyed button's reason is still only its tooltip, and its spoken name does not include the reason. | Recorded in MOCKUP.md as not proposed. It is older than B03 and applies to every greyed button on the row. |
| 7 | B05 | It wraps the trunk's `rollWithModifiers`. It copies the options (and their `tnConfig`, keeping `onClose`) only when the title and the exact line match; every other call passes the same objects through. | Checked in the browser: Lord Moon's failure still ends in its message (`RC-MOON-FAILS-PHONE`), and 49 roll harnesses pass. |
| 8 | B05 | The title tests use the sources' own em dash and curly apostrophe ("Lord Moon’s Curse — …"). | They match today's titles exactly. If a title changes, B05 does nothing, which is safe. |
| 9 | B09 | The observer reacts to its own relabelling once (a text change is a child change), then finds nothing to change and stops. | One extra pass of 44 cheap lookups per redraw. |
| 10 | B09 | The relabel runs after the Skill list fix's redraw, in the same task, before paint. A script that reads an option's words in the same moment it adds a row could see the old words for that moment. | Nothing reads the words: the wizard reads the values, and no suite harness reads the words. |

## Checked and found sound

- **Markers and prose:** every block of each unit carries its own marker above its first line. No comment names another phase in marker order: the comments say "Feature 4.5.31 (Part I)", "the Lord Moon's Curse fix" and "the Skill-Trait audit". The dependency check passes 4/4.
- **Guards:** each seam block is a guarded `Object.assign`. Each unit installs nothing if what it wraps is missing.
- **Switch-off:** with any of the four switches set to `false`, nothing is wrapped or installed.
- **Older harnesses:** Feature 4.5.31's suite harness follows `CN15`, with the same ids and count. It passes 101/101 both with B01 and with B01 removed.
- **No save field, no storage key:** none of the four writes to the character or to storage.
