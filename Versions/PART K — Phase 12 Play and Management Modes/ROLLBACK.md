# ROLLBACK — PART K — Phase 12 Play and Management Modes (part 1)

## Surgical removal (the method)

Against a **scratch copy** of the Phase 0 tree (the remover refuses the live tree):

```bash
cp -r "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability" /tmp/phase0
python3 "Versions/PART K — Phase 12 Play and Management Modes/qa/remove-phase.py" /tmp/phase0
python3 /tmp/phase0/build/recombine.py
```

It removes exactly:

| What | Where |
|---|---|
| The fragment | `src/sheet/209.9996-feat-play-management-modes.js` |
| The stylesheet | `src/css/59.997-feat-play-management-modes.css` |
| Their manifest entries | `build/manifest.json` (`expect_sha256` recomputed from what remains) |
| Block `modes-seam` | `src/sheet/210-test-seam-and-init.js`, after the Apply School fix's seam block |

**Measured 25 September 2026:** removal rebuilds **byte-identical** to
`0dcb56e8c02efbb1c7dba6e9d61da29b7e355009f47b2777c7d481bbdb1ed5d1` (3,072,896 bytes, commit
`e66c4dd`). Later releases are removed first through the shared removal chain.

**Every later Phase 12 part depends on this one** (it registers its tab through `MODES12.register`),
so remove those first; each will declare it.

## Dependencies

- **On Phase 11 and Phase 11.2 (Part K), soft:** `CL11.openCharacter`, `CL11.createNew` and
  `CW112.finish` are wrapped by property, each guarded. Without them this part only loses those
  entry points.
- **On the removal chain:** this part is registered in `QA — Removal Chain Registry`.
- **Who depends on this:** every later Phase 12 part, once built.

## Cross-phase fixture correction

`PART K — Phase 11 Characters List and Save Model/qa/characters-harness.js`, check
`CL-COPY-INDEPENDENT`: one conditional line switches to Management before editing Notes, only when
`MODES12` exists. Reads 70/70 with this part present and removed. Removing this part does not require
undoing it; if it is undone, do it with this part removed.

## Dependants

- **PART K — Phase 12.1 Play Mode Clan and School** (part 2, 25 September 2026) registers the Clan &
  School tab through `MODES12.register`. Remove it before this part.
- **PART K — Phase 12.2 Play Mode Identity** (part 3, 25 September 2026) registers the Identity
  tab through `MODES12.register`. Remove it before this part.
- **PART K — Phase 12.3 Play Mode Rings and Traits** (part 4, 25 September 2026) registers the
  Rings & Traits tab through `MODES12.register`. Remove it before this part.
- **PART K — Phase 12.4 Play Mode Skills** (part 5, 25 September 2026) registers the Skills tab
  through `MODES12.register`. Remove it before this part.
- **PART K — Phase 12.6 Play Mode Techniques** (25 September 2026) registers the Techniques tab
  through `MODES12.register`. Remove it before this part.
- **PART K — Phase 12.5 Play Mode Advantages and Disadvantages** registers the Advantages and
  Disadvantages tab through `MODES12.register`, uses its event gate, lock attributes and row
  observer, and wraps `MODES12.set` to cancel an open configuration draft on entering Play.
  Remove it before this part. No edit to this part's production fragment is required.
- **PART K — Phase 12.7 Play Mode Combat** (30 September 2026) wraps `MODES12.refresh` by property
  and reads `MODES12.isPlay()` and `MODES12_ENABLED`, to take Combat out of the carousel in
  Management. With this part's switch off it installs nothing and Combat shows in both modes.
  Remove it before this part. No edit to this part's production fragment is required.
- **PART K — Phase 12.8 Play Mode Toolbar** (30 September 2026) registers `#btnSaveAs` through
  `MODES12.register`, so Save As a copy is a Management action (inert and hidden in Play). The
  registration is guarded; without this part the header still works and Save As shows in both
  modes. Remove it before this part. No edit to this part's production fragment is required.

- **PART I — Phase 4.8 Ancestors** (30 September 2026) registers the Ancestor picker `#anc48Pick`
  through `MODES12.register`, so the choice is fixed in Play while the favour badge and the
  information button stay live. The registration is guarded; without this part the picker stays
  editable in both modes (measured: its `--no-modes` boundary). Its fragment names `MODES12`, so
  this part's remover refuses while it is present: remove it before this part (the removal chain
  does so in order). No edit to this part's production fragment is required.

- **BUGFIX — Manage Button Clipping** (1 October 2026) styles this part's toggle,
  `#pm12Toggle.pm12-toggle::after`, in its own stylesheet, so the button keeps the width of "Manage"
  in both modes and nothing in the header moves when it is tapped. Its only script is its own
  switch. Without this part the rule matches nothing (measured: its `--no-toggle` boundary). Its
  stylesheet names `pm12Toggle` and `pm12-toggle`, so this part's remover refuses while it is
  present: remove the fix first (the removal chain does so in order). No edit to this part's
  production fragment is required.

- **Release 15a A03 — Top-Aligned Columns and Compact Skill Cards** (revision 2, 6 November 2026,
  `Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/`) reads this part's
  `pm12-play` body class in its own stylesheet to tell Play from Manage on a phone: in Play a Skill
  card draws a summary line and the Mastery notes already reached; otherwise the full Manage card. It
  calls nothing here and registers nothing. Without this part the class never appears and every card
  takes the Manage layout, which draws everything. Its stylesheet names `pm12-play`, so this part's
  remover refuses while it is present: remove A03 first (the removal chain does so in order). No edit
  to this part's production fragment is required.


## Release 8b / SC8 dependency (1 November 2026)

The independently removable layer in `Versions/PART K — Phase 11.2.5 School Choices from the Character Check/` uses this phase to complete starting School choices from Manage. Remove SC8 before removing this prerequisite, or explicitly sever its adapter first. SC8 has its own fragment, switch, seam, remover and tests; removing SC8 alone preserves this phase unchanged.

- **Release 15a A04 — One Information Pattern** (7 November 2026, `Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A04 — One Information Pattern/`) reads this part's `pm12-play` body class and its `data-pm12-locked` attribute in its own stylesheet. In Play it hides an information button that A04 moved out of a locked control, as it was hidden inside it before. It calls nothing here. Without this part nothing is locked and the button always shows. Its stylesheet names `pm12-play`, so this part's remover refuses while it is present: remove A04 first (the removal chain does so in order).
- **Release 15a A15 — Court Badges** (7 November 2026, `Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A15 — Court Badges/`) reads this part's `pm12-play` body class in its own stylesheet, to hide its "+ Add court" button in Play. It calls nothing here and registers nothing. Without this part, + Add court always shows. Its stylesheet names `pm12-play`, so this part's remover refuses while it is present: remove A15 first (the removal chain does so in order). No edit to this part's production fragment is required.

## Release 15a A11 — card text edge in Play (7 November 2026)

Release 15a A11 (`Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A11 — Explanatory Text Gaps and One Left Edge/`), on the owner's point from G1's review, removes the horizontal padding and border of a locked (`data-pm12-locked`) card name and description in `#advList` / `#disadvList` while `body.pm12-play` and `body.te15-on` are set, so they start on the card's text edge. It reads this phase's attribute and body class and calls nothing here. This phase's harness passes 25/25 with A11 present.

**Declared 11 November 2026:** Release 15a, 8b.1-UI-03 (Remove Apart from Memorised) names this phase's `pm12-play` body class in its stylesheet, to give a spell row's Remove corner back in Play. It calls nothing here. Remove that unit before this phase; the removal chain does so in order.
