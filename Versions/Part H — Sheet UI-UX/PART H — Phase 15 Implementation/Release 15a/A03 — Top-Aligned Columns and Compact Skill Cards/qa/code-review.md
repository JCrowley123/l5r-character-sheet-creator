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
