# Phase 11.3 — App Bar (Part K)

The owner's ruling of 9 October 2026, after the Search check (S11, FT-18): "Build the app bar now [...] I am happy for
the app bar to be at the top but make sure that this change is completely ring fenced. If I want to change the
position of the app bar or the UI, or completely remove this app bar I can without having a wider knock on effect."
It is D&D Beyond's bottom bar, placed at the top because the sheet's page tabs already use the bottom.

## What it does

- **One bar on every screen**: **Sheet · Characters · Library · Search**, the current one underlined. On the sheet it is
  the first row of the sheet's frame, above the header; on the Characters screen the screen starts below it, so the
  bar never moves and sits inside no scrolling element.
- **Sheet** closes the Characters screen; **Characters** and **Library** open its tabs; **Search** opens Search where the
  reader left it (Phase 14's device corrections).
- **The controls it repeats are hidden while it is present**, through its own stylesheet only: the Characters screen's
  own tab row, the header's Characters button (the header row, full at 375px, gains its room back) and ⋯ → Search.
  Removing the bar brings all three back exactly.
- Modals and the creation wizard cover it; Print leaves it out; Quick Access moves down by its height.

## Structure (the owner's rules: logic apart from UI, the UI replaceable, hooks marked)

| File | Role |
|---|---|
| `src/sheet/209.99999997-feat-app-nav.js` | Navigation module `AB113`: `sections()`, `current()`, `show(id)`, `onChange(fn)`. No DOM of its own; it follows the Characters screen (one `// UI hook:`). Switch `APP_NAV_ENABLED`. |
| `src/sheet/209.99999998-feat-app-bar.js` | The bar `APPBAR113`: draws `AB113`'s sections, marks the current one. **`APP_BAR_POSITION`** (`'top'` or `'bottom'`) is its one place setting. Switch `APP_BAR_ENABLED`. |
| `src/css/59.999983-feat-app-bar.css` | Its look, the room other screens leave it, and the hidden repeats; every rule waits for the classes the bar sets on `body`. |
| `src/sheet/210-test-seam-and-init.js` | One guarded block, `app-bar-seam`. |

## Verification

- **Own harness, `qa/appbar-harness.js`: 25/25** on the build (`c951c9a3…`); 2/11 without the release. Oracles: geometry and
  hit testing (what a tap at a point reaches), the Characters screen's state, Search's view and the four sections the owner
  named. The bar is the shell's first row at the very top, inside no scrolling element; each of the four taps reaches its
  item on the sheet and on the Characters screen; Characters, Library, Search and Sheet go where they should and the
  underline follows; change notices arrive in order and stop when asked; Escape on the Characters screen is followed; an
  entry open in Search is open again after Sheet then Search; the three repeated controls are hidden and the ⋯ menu lists
  Save As a copy, Print and Export JSON; in Play and Manage nothing overlaps the bar (header, page tabs, Quick Access,
  dice); the Characters screen meets the bar exactly; Quick Access's panel clears it; a modal covers it; it is not
  printed; at 320, 375 and 390px no sideways scroll, all four items fit and the header row fits; the character is unchanged.
- **The `'bottom'` position passes all 25** (a pinned boundary): the position is one setting.
- **Dependency harness, `qa/dependency-harness.js`: 14/14**, seven variants: control; the bar off (the navigation module
  answers; all three repeated controls back); the navigation off (no bar; controls back); Phase 11 off (no bar, no errors);
  Phase 12.8 off (the bar works); Search's page off and Search off (the bar's Search opens Phase 11's placeholder).
- **Eleven pinned mutations**: the release removed; the navigation or the bar switched off; no stylesheet; the repeats
  not hidden; the Characters screen covering the bar; Search starting over; the current item not marked; closing not
  noticed; Quick Access left under the header; the bar printed.
- **Retained harnesses with the bar present** (test-only terms, declared in `ROLLBACK.md`): Phase 11 70/70, Phase 12.8
  37/37, Search 62/62, the top-bar bugfix 30/30; each also passes on the build without the bar. Phase 12.8's harness now
  closes each scenario's pages (it timed out loading later pages with or without the bar, as Phase 11.2.4's did).
- **Ownership scan** clean for both scripts. **Removal:** fixtures 22 pass, one Windows symlink skip; the live fixture
  restores Phase 4.5.35's build `8d3e899c…` (3,752,244 bytes) byte for byte and leaves Phase 11's, 12.8's and 14's files
  untouched.

## Full QA (9 October 2026, the whole cycle)

- **Full suite: 4,912/4,912** on the final build (`c951c9a3…`, 3,761,482 bytes; `qa/final-qa-summary.json`): 4,816 from the last cycle + Search's new check + 4.5.33's six + the top-bar bugfix 30 +
  4.5.35's 20 + this bar's 25 and its dependency harness's 14. Runner: `qa/current-suite-runner.js` (expects 4,912).
- **Removals, newest first, each byte for byte, with the retained suite on each rebuilt build:** this bar out →
  `8d3e899c…` (4,873/4,873); then 4.5.35 out → `8a7d72fc…` (4,853/4,853); then the bugfix out → `fd57e05f…`
  (4,823/4,823); then 4.5.34 → `9469905b…`, 4.5.33 → `dfbe292c…` and Search → `fe2873e6…`, `main` before Search.
- Run one job at a time: two browser jobs side by side made this machine (about 2 GB of 16 GB free) crash pages and
  time out page loads.

## Live (9 October 2026)

Merged on the owner's word (fast-forward of `main` to `1f127ab`, 13:37 UTC) and deployed by 13:45 UTC. The served page
matches the committed build plus its app head byte for byte (3,767,131 bytes, SHA-256 `6eb43e31…`), service worker
`af43e2270bfbf947`; focused checks on the downloaded page **195/195** (`qa/verify-live.py`: this bar 25 and its
dependency checks 14, Search 62, the top-bar bugfix 30, 4.5.33 44, 4.5.35 20; `qa/live-verification.json`); the checklist
walked through the real controls on the live site **9/9** (`qa/checklist-walk.js`, `qa/live-checklist-walk.log`). The
owner's checklist: [Corrections, Initiative Score and App Bar — iPhone Checklist](https://claude.ai/code/artifact/7e82d0ce-1467-4348-b415-3e83dd436a8d) (Not run).
