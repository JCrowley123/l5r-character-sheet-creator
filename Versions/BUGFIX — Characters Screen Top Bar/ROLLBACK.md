# Remove BUGFIX — Characters Screen Top Bar

The fix owns one stylesheet and one switch, and their two manifest entries. It adds no block to any shared file.
Removing it returns the Characters screen to Phase 11's layout: the whole screen scrolls and its tab row is
`position: sticky` inside it, which iPhone Safari let scroll away on long Search pages (the owner's S9, 9 October
2026). Nothing is saved by the fix, so no character data changes either way.

## Surgical removal (the method)

1. Copy the Phase 0 folder to a separate scratch directory (never the live tree; the remover refuses it, its parents
   and its children).
2. From this folder: `python -B qa/remove-phase.py <absolute-scratch-folder> --dry-run`, and read the plan.
3. Run it without `--dry-run`, rebuild that copy with its own `build/recombine.py --verify`, and run the retained
   suites against the rebuilt HTML (`PART I — Phase 4.5.34 Blind Armor TN Note/qa/current-suite-runner.js`).
4. Apply the same removal to the working branch, delete this folder, and remove this fix's entry from
   `QA — Removal Chain Registry/removal_chain.py`.

The remover deletes only `src/css/59.999981-bugfix-characters-top-bar.css` and
`src/sheet/209.99999995-bugfix-characters-top-bar.js` and their manifest entries, and repins the manifest's
`expect_sha256`. It refuses before writing anything on a foreign or missing marker (`BUGFIX CL11TOPBAR`), a missing or
duplicate manifest entry, unsafe or linked paths, hard links into the live tree, and any leftover
`CHARACTERS_TOP_BAR_FIX_ENABLED` or `cl11-topbar-fixed` in a retained source. A fixture proves Phase 11's and Phase
14's (Part K) scripts and stylesheets are left byte-identical.

With nothing later present, `--expect-sha fd57e05f1412d98212b0d5281f5047cf082c307bef6513b839bd41bdef19e0c1` requires
the exact pre-fix build: **3,738,828 bytes** (everything below this fix, Phase 4.5.33's device correction of 10 October
included; before that correction it was `9e628041…`, 3,736,077 bytes, Phase 14 Search's device corrections).

## Switching it off

`CHARACTERS_TOP_BAR_FIX_ENABLED = false` in the switch leaves both files in place and the screen exactly as Phase 11
built it (the stylesheet's rules all wait for the class the switch adds).

## Dependencies (declared)

- **On the Characters screen, Phase 11 (Part K):** the fix styles Phase 11's `.cl11-view`, `.cl11-nav` and
  `.cl11-panel`. Without Phase 11 the rules match nothing. Phase 11 gains no dependent: removing Phase 11 removes
  this fix first (the removal chain does so), and the fix alone changes nothing without it.
- **Search, Phase 14 (Part K):** none. Search's scroll memory uses the nearest ancestor that actually scrolls (its
  device corrections of 10 October), so it follows the panel with this fix and the screen without it; both are
  measured (`qa/topbar-harness.js` here, `search-harness.js` there).

The removal chain registry gained one entry, at its end.
