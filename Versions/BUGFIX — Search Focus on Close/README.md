# BUGFIX — Search Focus on Close (FT-34)

Built 14 October 2026 (Cycle 1, Layer 1). Closing a Search entry now returns keyboard focus to the result that
opened it, so a second Escape closes Search. The query, filters and list position stay as they were.

## The defect

Search's private `closeDetail()` (Phase 14, `209.99999992-feat-search-page.js`) hides the entry, including its
focused heading, and restores no focus. Chromium moves focus off a hidden element at its next rendering update,
to the page body. The Characters screen listens for Escape on its own element, so the second Escape never reached
it. Whether that update happened before the next key press depended on timing, which is why Phase 14's
`S14-ESCAPE-CLOSES` passed locally but failed on the live site (51/53, nine checks unreached) and in a loaded
full-suite run.

## The fix

`src/sheet/209.999999996-bugfix-search-focus.js` (`SEARCHFOCUS`) wraps `SEARCHPAGE14.render`, which `closeDetail()`
calls through the public object. It is installed after the facets wrapper, so the list is final before focus moves.
When a render closes an entry **while focus is inside that entry** (its heading or Back button), focus goes, with
`preventScroll`, to:

1. the entry's own result button (`.s14-row[data-id]`, so it works after the list is redrawn or Search is reopened);
2. otherwise the first shown result;
3. otherwise the category link (‹ All categories).

It never focuses the text field, which would open the iPhone keyboard. When something else closes the entry (for
example `SEARCHPAGE14.open(options)` while focus is elsewhere), focus is left alone. Phase 14's code is unchanged.

## Structure

| File | Owned item |
|---|---|
| `src/sheet/209.999999996-bugfix-search-focus.js` | `SEARCHFOCUS` and the switch `SEARCH_FOCUS_FIX_ENABLED` |
| `src/sheet/210-test-seam-and-init.js` | `search-focus-seam` block |
| `build/manifest.json` | one entry, after Phase 14.2's |

## Verification (14 October 2026)

| Check | Result |
|---|---|
| Focused harness `qa/search-focus-harness.js` | **12/12** on the candidate; **5/12 on `main`** (`65fb705`): the 7 fix checks fail, the 5 guards pass |
| Negative variants `qa/verify-variants.py` | **5/5 matched their pinned failures**: baseline (7), disabled (7), focus the text field instead (5), always refocus (1: `SF-FOCUS-ELSEWHERE-LEFT`), no fallback (1: `SF-STALE-OPENER-FALLBACK`). See `qa/negative/summary.json` |
| Dependency harness | **15/15**: control, switch off, fragment absent, facets off, Search page off |
| Phase 14 Search harness on the candidate | **62/62**, including `S14-ESCAPE-CLOSES` |
| Removal proof `qa/test-removal.py` | **6/6**: rebuilds the predecessor exactly (3,800,283 bytes, `7b68f34d…`); refuses the live tree, a foreign marker in the block, and a missing block |
| Removal-chain registry | **11/11** (`qa/registry.log`) |
| Ownership scan | Exit 1, explained in ROLLBACK (the scanner reads every BUGFIX marker as bare "BUGFIX") |

Candidate: **3,802,681 bytes**, SHA-256 `07c8a25732c19cac436be29c379d7017acc7664bbfd4310a15ee0ec33f918a83`.

The harness's keyboard steps wait two animation frames before reading focus, so Chromium's own focus move has
happened: on `main` the result is the same every run. Headless Chromium cannot show the iPhone keyboard; the
oracle is that the text field never receives focus while an entry opens or closes.

**Not verified here:** iPhone Safari and VoiceOver. Safari does not focus a button on tap, so on the phone the
fix applies when the heading still holds focus (it is focused when an entry opens). See `MANUAL-TESTS.md`.
After the merge, Phase 14's own live check should complete **62/62**.

## Running

```bash
node qa/search-focus-harness.js <sheet.html>
node qa/dependency-harness.js <sheet.html>
python qa/verify-variants.py
python -B qa/test-removal.py
```

`qa/current-suite-runner.js` chains Phase 14.2's suite (5,107) and adds 12 + 15: **5,134**.
