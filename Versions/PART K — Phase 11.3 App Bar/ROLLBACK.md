# Remove, move or restyle Phase 11.3 App Bar

The owner's requirement (9 October 2026): change the bar's position or its look, or remove it completely, "without
having a wider knock on effect". This layer owns two scripts (the navigation module and the bar), one stylesheet,
their three manifest entries and one guarded seam block. Nothing is saved by it.

## Move it

`APP_BAR_POSITION` in `src/sheet/209.99999998-feat-app-bar.js`: `'top'` (today) or `'bottom'`. Nothing else changes:
the stylesheet follows the class the bar sets (`ab113-top` or `ab113-bottom`). The bottom variant passes the bar's
whole harness (a pinned boundary in `qa/variants.json`).

## Restyle it, or replace the bar

The look is `src/css/59.999983-feat-app-bar.css` alone. A different design (a bottom tab bar with icons, a side rail, a
menu) replaces `209.99999998-feat-app-bar.js` and that stylesheet, and calls the navigation module's interface:
`AB113.sections()`, `AB113.current()`, `AB113.show(id)`, `AB113.onChange(fn)`. The dependency harness's `BAR-OFF`
variant proves the navigation module answers in full with the bar switched off.

## Remove it

Surgical removal (the method):

1. Copy the Phase 0 folder to a separate scratch directory (never the live tree; the remover refuses it).
2. From this folder: `python -B qa/remove-phase.py <absolute-scratch-folder> --dry-run`, and read the plan.
3. Run it without `--dry-run`, rebuild that copy with `build/recombine.py --verify`, and run the retained suites
   against the rebuilt HTML (`PART I — Phase 4.5.35 Initiative Score/qa/current-suite-runner.js`).
4. Apply the same removal to the working branch, delete this folder, and remove this release's entry from
   `QA — Removal Chain Registry/removal_chain.py`. Take out the four test-only terms below (each is inert without the
   bar, so leaving them changes nothing).

The remover deletes only `src/sheet/209.99999997-feat-app-nav.js`, `src/sheet/209.99999998-feat-app-bar.js`,
`src/css/59.999983-feat-app-bar.css`, their manifest entries and the `app-bar-seam` block, and repins `expect_sha256`; it
refuses on any leftover `AB113`, `APPBAR113`, `APP_NAV_ENABLED`, `APP_BAR_ENABLED`, `APP_BAR_POSITION`, `ab113…` id or
`ab113-` class in a retained source. With nothing later present it restores the previous build byte for byte
(`--expect-sha` and the size are in `qa/remove-phase.py`, `PRE_RELEASE_SHA` / `PRE_RELEASE_BYTES`).

**What removal brings back, exactly as before:** the Characters screen's own tab row (‹ Sheet · Characters · Library ·
Search), the header's Characters button and ⋯ → Search. The bar hides them only through its own stylesheet, while the
page carries `ab113-on`; it never edits them. The Characters screen's position (it starts below the bar) and Quick
Access's (it moves down by the bar's height) are likewise only this stylesheet's rules.

## Dependencies (declared, each measured by `qa/dependency-harness.js`)

- **On the Characters screen, Phase 11 (Part K), required:** Sheet is `CL11.close()`; Characters and Library are
  `CL11.open(tab)`; the module follows `CL11.showTab`, `CL11.open` and `CL11.close` (wrapped; each keeps the previous
  binding). Without Phase 11 there is no navigation and no bar; the sheet works (variant `CHARACTERS-OFF`).
- **On Search's page, Phase 14 (guarded):** Search is `SEARCHPAGE14.open()`, which returns to where the reader was.
  Without the page, the bar's Search opens the Characters screen's Search tab (variants `SEARCH-PAGE-OFF`, `SEARCH-OFF`).
- **On the header's More menu, Phase 12.8:** none in code; the stylesheet hides its ⋯ → Search item (Phase 14's) and
  the Characters button it placed. Without 12.8 the bar works (variant `MENU-OFF`).
- **On the carousel shell (Part D) and Quick Access (Part H):** the bar is the first (or last) row of `.car-shell`,
  outside every scrolling element; Quick Access's button and panel are moved down by the bar's height (its own
  formulas, with the bar's height added).
- **The top-bar bugfix** (`BUGFIX — Characters Screen Top Bar`): independent. With the bar present the tab row it fixed
  is hidden; the fix still makes each panel the scroller.

## Cross-phase fixture corrections (declared, test-only)

While the bar is present it hides controls four retained harnesses tapped. Each gained a term that applies only when
`#ab113Bar` exists and taps the bar's item doing the same thing; without the bar they tap the original control:

- Phase 11's `characters-harness.js`: ‹ Sheet and the three tabs.
- Phase 12.8's `toolbar-harness.js`: the header's Characters button (check `CHARACTERS`).
- Phase 14's `search-harness.js`: ⋯ → Search (four places) and ‹ Sheet (two); the More menu's expected items omit
  Search while the bar is present.
- `BUGFIX — Characters Screen Top Bar`'s `topbar-harness.js`: a hidden tab row is not measured for staying put.

Separately, Phase 12.8's `toolbar-harness.js` now closes each scenario's pages when the scenario ends (test-only, no
assertion changed, as Phase 11.2.4's wizard harness on 9 October): kept open to the end, its later page loads timed out on
this machine, on the build without the bar as well as with it.

The removal chain registry gained one entry, at its end.
