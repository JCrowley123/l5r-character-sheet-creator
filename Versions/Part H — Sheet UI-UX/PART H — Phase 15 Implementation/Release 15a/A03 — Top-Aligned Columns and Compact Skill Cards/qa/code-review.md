# A03 code review (one read-only reviewer, 6 November 2026, before full QA)

**Scope given:**
- the approved A03 scope (audit A03, ruling Q1);
- the uncommitted diff on `claude/release-15a-a03`;
- the removability rules;
- A02's folder as the template.

The reviewer read code, diffs and scripts and ran text checks only: no browser, harness, remover or build.

**Verdict: no blocking defects. Nothing needs an edit to Phase 12.4 (Part K) or Phase 4.54 (Part I).**
- Phase 4.54 decorates only the Advantage and Disadvantage lists and its own modal.
- The control is not on Phase 12.4's lock list.

**Confirmed by hand:**
- **Totals:** 31 + 6,828 and 23 + 6,732 (since then 32 + 6,828 = 6,860, below). The 113-leaf pick was recounted from `list.json`.
- **Predecessor:** A02's hash and bytes.
- **Removal scripts:** the remover and the removal proof differ from A02's only in constants.
- **Seam:** guarded, and placed after A02's block.
- **No marker-shaped prose:** `MARKER_RE` matches only each fragment's own header and footer.
- **`recalcAll` wrapper:** the seam is built after the rebind, and earlier wrappers are kept.
- **The observer cannot loop.**
- **Rows are never decorated twice.**
- **Specificity:** A03's ID-anchored rules beat the carousel's card rules and do not touch Phase 12.4's `!important` rules.
- **Desktop, tablet and print:** nothing leaks there.

## Findings and what was done

1. **Minor, fixed: the School choice's source badge broke the two-row card.**
   - Release 8c's `SC8.badge` puts `small.sc8-source` right after the name, inside the name line. That line is `display: contents`, so the badge became a stray grid item: a third row on a closed card.
   - **Fixed in the stylesheet:** anything in the name line other than the name and the eye takes a full row after the fields, and is hidden while the card is closed.
   - **Check:** `FIRST-CELL-ADDITIONS` now places a stand-in badge the same way (`name.after`) and the real `SC8.badge` when present. It also asserts that the closed card keeps its height, and that the additions come after the fields at full width when open.
2. **Minor, fixed: the over-limit Emphasis warning was hidden while closed.**
   - The sheet's count note (`.emph-limit-note`, in the warning colour when there are more Emphases than the Rank allows) is the only warning. It sat under Details, while the Rank is edited on the first row.
   - **Fixed in the script:** while a row is over the limit, the summary leads with that note's own text, in the note's own colour (`data-cs15-warn`). It uses the trunk's `getUsableEmphSlots()` to decide.
   - **New check `EMPHASIS-WARNING-SHOWN`:** Athletics' 2 Emphases at Rank 1, then back at Rank 4. A03's harness is now **32 checks**, and the candidate total 6,860.
3. **Minor, already fixed before the report arrived: at 320 px the Rank box was 52 px tall.** A flex basis under the carousel's column direction set its height. It is now `flex: none` with a width, and the Rank cell is kept on one line.
4. **Minor, fixed: without `:has()` the toggle was dead.**
   - The layout is now inside `@supports selector(:has(*))`. A browser without `:has()` keeps the earlier layout whole, with the control hidden.
   - The closed-state hide is split into three rules, so no selector can void another.
5. **Minor, declared: on a phone the focus order differs from the visual order.**
   - The page order is unchanged: name, eye, Details, then the fields, Rank, roll.
   - The card draws name, Rank and roll first.
   - This is recorded in the README as a trade-off of not moving any element. Nothing moves in the page.
6. **Note, fixed: no variant tested the observer or the input listener.**
   - **New variants:** `no-observer` and `no-input-listener`, and `no-warning` for finding 2. All three were pinned before running.
   - `NEW-ROW-OPEN` now also appends a row without a recalculation, which only the observer decorates.
7. **Note, fixed: the Craft note sat above the Trait.** Every addition to the first cell or the name line now has `order: 1`, after the fields.
8. **Note, declared: three oracles lean on the layer.**
   - `SUMMARY-MATCHES` rebuilds the summary from the row's fields, with three fixture literals as anchors.
   - `PRINT-UNCHANGED` takes its reference by lifting A03's class and controls out.
   - `FIRST-CELL-ADDITIONS` uses stand-ins, plus the real `SC8.badge` where present.
   - All three are in the README.
9. **Note, fixed:**
   - `COMPARISON.md` is written from the frozen candidate.
   - CRLF endings in three of the unit's files were normalised to LF.

**Before the review, from this session's own targeted runs:** `PRINT-UNCHANGED`'s first reference took away only A03's class, which left the Details controls in the print. It now also lifts the controls out. That is a harness fix, made before any pin was asserted.

The candidate was rebuilt after these fixes and frozen in `qualified-sha256.txt` before the variant discovery and the qualification chain.

## Revision 2 (one read-only reviewer, 6 November 2026, before freezing)

**Scope given:**
- the owner's decision: no Details control, only the Masteries reached in Play, and the laptop columns as built;
- the diff from revision 1 (`9ccce5e8`) to the revision 2 draft (`53d861db`);
- the removability rules and the QA constants.

The reviewer read code and scripts only: no browser, harness, remover or build.

**Verdict: no blocking defects.** Revision 2 matches the decision on a portrait phone, and the laptop column rule is unchanged.

**Confirmed by hand:**
- **Counts:** the draft's 35 checks, 35 + 6,828 and 23 + 6,732. Since then the harness has 37 checks (below), so the candidate is 6,865.
- **Folders:** `discovery-2`, `full-launched-2.txt`, and full passes 3 and 4.
- **Removability:** A03's code is in its two fragments and the unchanged seam block, with no marker-shaped prose.
- **Dependency:** the `pm12-play` dependency is declared in both rollback files.
- **Observer:** it cannot loop.
- **Scope of the rules:** every new rule is inside `@supports` and the phone media query.
- **Variants:** all 19 pins traced and plausible.

### Findings and what was done

1. **Minor, fixed: the first row moved when switching to Manage.**
   - In Manage the School cell's caption kept the carousel's fixed caption width. That widened its column, so between 361 and 600 px the name box shrank and the Rank and d10 shifted.
   - **Fixed:** the caption is drawn at its own width, as the Rank's is.
   - **New check `FIRST-ROW-STEADY`:** the same name width and Rank and roll positions in both modes.
   - **New variant `school-caption-wide`:** puts the fixed width back.
2. **Minor, recorded: a phone held sideways keeps the table.** The card layout, and with it the reached-only rule, applies at 600 px and less, as in revision 1. A phone turned sideways shows the table with every note. The owner's words were about the phone card, so this is declared in the README and the checklist rather than changed.
3. **Minor, fixed: a two-line Emphasis note ran together in the summary.**
   - When the Emphasis list is the ceiling, the sheet writes the count, a line break, then "Max Emphases assigned". `textContent` dropped the break.
   - **Fixed:** the note's parts are joined with " · ".
   - `EMPHASIS-WARNING-SHOWN` now also writes that two-line note while over the limit and checks the summary.
4. **Minor, done after freezing: rollback claims rested on revision 1's logs.** A02's harness and Phase 12.4's harness with revision 2 present, and A03's harness on the A02-removed build, were run on the frozen candidate. Their logs are kept with `-r2` in their names.
5. **Minor, fixed: one comment in the stylesheet was wrong.** It said that additions are drawn after the Mastery notes. In fact a name-line badge (Release 8c's School choice) keeps its place before them.
6. **Note, fixed:** the manifest's note still said "Details control".
7. **Note, declared:** the XP, the Emphasis count line (unless over the limit) and the Free badges are drawn only in Manage on a phone. The device checklist says so, so the owner can object.
8. **Note, partly addressed: accessibility.**
   - The summary's generated text is exposed as text.
   - **New check `SUMMARY-READABLE`** reads the browser's accessibility tree: exactly the summary in Play, nothing in Manage.
   - Revision 1's comma-joined `aria-label` is gone, so " · " is voiced according to the reader's punctuation setting.
   - The Manage focus order (name, eye, Trait, Rank, Emphases, School, d10, Remove) is declared in the README.
9. **Note, kept: keying the reached-only rule on the trunk's muted colour.** If the trunk changes, every note shows and `PLAY-MASTERIES-REACHED` fails. The match is now case-insensitive (`[style*="#a89f8c" i]`).

**Harness hardening from the review:**
- `PLAY-COMPACT` now leaves the Mastery notes out on both sides of its half-height comparison.
- `TABLET-UNCHANGED` covers Play as well as Manage.
- `MODE-SWITCH-LIVE` also checks that without Phase 12's Play class every card takes the Manage layout.

**Variant pin changed before any variant ran:** `no-grid` no longer predicts `PHONE-END-CLEAR`. That failure in revision 1 was incidental: it depended on how far the open last card ran off the screen, and revision 2's card is shorter.

The harness is now 37 checks. The candidate is 37 + 6,828 = 6,865, and `verify-live.py` totals 550.
