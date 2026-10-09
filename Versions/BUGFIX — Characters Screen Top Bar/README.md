# BUGFIX — Characters Screen Top Bar

The owner's check of 9 October 2026 failed S9: on the iPhone (Safari) the Characters screen's top bar
(‹ Sheet · Characters · Library · Search) was missing or cut off on long Search pages (the Search home, Skills,
Alternate Paths, an Ancestor) and fine on short ones. Approved "as recommended" on 9 October.

## Cause and fix

Phase 11 (Part K) made the Characters screen one fixed overlay that scrolls (`.cl11-view`: `position: fixed;
overflow-y: auto`) with its tab row `position: sticky` inside it. Sticky inside a fixed scroller is not reliable in
Safari. Headless Chromium keeps the row pinned, so no headless run can reproduce the symptom.

The fix takes the row out of every scrolling element instead of relying on sticky: the screen stops scrolling
(`overflow: hidden`) and each panel (Characters, Library, Search) becomes the scroller, filling the screen below the
row. The panel keeps Phase 11's 760px column, centred by its padding, with the scrollbar at the screen's edge.

| File | Role |
|---|---|
| `src/css/59.999981-bugfix-characters-top-bar.css` | The rules, all waiting for the class `cl11-topbar-fixed` |
| `src/sheet/209.99999995-bugfix-characters-top-bar.js` | The switch, `CHARACTERS_TOP_BAR_FIX_ENABLED`, which adds that class |

No shared file is edited and nothing is saved. Search's own side of S9 (its scroll memory follows whichever element
scrolls; the keyboard closes when an entry opens) is in Phase 14's device corrections, the branch below this one.

## Verification

Because the symptom cannot be seen headlessly, the harness proves the structure, on the pages the owner named plus
the Characters list (24 characters), the Library placeholder and a short spell:

- **Own harness, `qa/topbar-harness.js`: 30/30** on the fixed build (`1822a1cf…`); **14/30** without the fix
  (Phase 14's corrected build, `9e628041…`), failing exactly the structure, fill, column and Search-scroll checks.
  On every page: no element above the row scrolls, the screen does not scroll, the panel does; the row's top stays
  put at the top, middle and bottom of a long panel (this one passes without the fix too: Chromium's sticky holds);
  the panel meets the row and the bottom of the screen; the column is Phase 11's own (read from its `.cl11-panel`
  rule: 728px of content at 1280px, 16px padding at 390px) with the scrollbar at the edge; no sideways scroll at
  320, 375 and 390px; Search's Back and ⋯ → Search return to the panel's scroll.
- **Retained:** Phase 11's `characters-harness.js` 70/70 and Search's `search-harness.js` 62/62 on the fixed build.
- **Six pinned mutations** (`qa/variants.json`, `qa/expected-failures.json`): the fix removed, switched off, the
  screen still scrolling, the panel not scrolling, the column's padding lost, the panel keeping its 760px box.
- **Ownership scan** (`qa/ownership-scan.log`): every reference is inside the fix's own blocks.
- **Removal:** fixtures 13 pass, one Windows symlink skip; the live fixture restores Phase 14's corrected build
  `9e628041…` (3,736,077 bytes) byte for byte, and leaves Phase 11's and Search's files untouched.

The owner's iPhone decides: `MANUAL-TESTS.md`.
