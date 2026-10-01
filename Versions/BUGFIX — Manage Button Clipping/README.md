# BUGFIX — Manage Button Clipping

Reported by the owner on the iPhone on 30 September 2026, while checking Phase 4.8 Ancestors (point
5 of that feedback): the first press of **Manage** showed a clipped label, "M|DONE", which then put
itself right. Built the same night on the Phase 4.8 branch, `claude/phase-4-8-ancestors`, as its
own layer with its own commit; **not merged until the owner's word**, after the iPhone check in
[MANUAL-TESTS.md](MANUAL-TESTS.md).

## What was wrong (measured)

The toggle is one button whose label changes: **Manage** in Play, **Done** in Management (Phase 12,
Part K). Nothing fixed its width, so the width followed the label. Measured in this sandbox:

| Window width | Manage | Done | The other header buttons |
|---|---|---|---|
| 320px | 70.7px | 53.1px | Characters, Save and ⋯ each move about 17.6px right |
| 390px | 70.7px | 53.1px | each move about 17.6px right |
| 1024px | 90.1px | 70.0px | each move about 20px right |

Since Phase 12.8 (Part K) the toggle sits at the end of the header's row of buttons, just before the
seal, so when it narrows, its left edge and every button to its left move right. The likeliest
reading of the screenshot is that Safari repainted the moved row late and the old label's first
letter was left in the gap for a moment. That reading cannot be confirmed here; the movement it
depends on can, and is removed.
The sandbox cannot load the sheet's web fonts, so the numbers are the fallback font's; the device's
are different, but the change is the same kind.

Headless Chromium cannot show Safari's stale paint. It can show the cause, and the harness measures
that: with the fix, the toggle keeps one box in both modes and nothing in the header moves.

## The fix

One rule, in its own stylesheet, `src/css/59.9998-bugfix-manage-toggle-width.css`: the toggle
carries an invisible second line of zero height that holds the longer label, "Manage". A button is
as wide as its widest line, so the toggle is always as wide as "Manage", in whatever font the device
renders. The fix never needs to know a width (the lesson recorded in `CLAUDE.md`: a width measured
here is not the device's). A three-line fragment, `src/sheet/209.99999-bugfix-manage-toggle.js`,
holds the switch.

Unchanged, and checked: the labels themselves; the accessible names, which are Phase 12's own
`aria-label`s, so a screen reader never hears the hidden label; the button's height and the label's
place in it; the rest of the sheet (the rule matches only the toggle). No shared file is touched:
the fix is its two files and their manifest entries.

**Switch:** `MANAGE_TOGGLE_FIX_ENABLED`, in the fragment. The rule applies only while the page
carries the class the switch adds, so off really means off: the "switch off" variant fails exactly
as the removed build does (measured). The first cut was the stylesheet alone, with no switch; the
shared removal chain's own checks then refused it, because they order releases by their place in
the build, and a stylesheet sits before every script there. The fragment gives the fix both a real
switch and a place in that order.

## QA (1 October 2026, this cloud session)

| | |
|---|---|
| Build with this fix | `f4345b4aa63dc9a1e0e61e01fd83fdbb95a296701ecaa84650e1909c44119760`, 3,256,563 bytes |
| Own harness (`qa/manage-toggle-harness.js`) | **36/36**; **26/36** on the build without it (Phase 4.8's, `ceb2d4b2…`), failing exactly the ten checks the bug predicts: one box in both modes, as wide as Manage, nothing moving, at each of 320, 390 and 1024px, and the label being on the toggle |
| Full suite (`qa/current-suite-runner.js`) | **3,384/3,384**: the 2,999 retained checks, Phase 4.8's 349 and this fix's 36 (run with `LANG=C.UTF-8`; see Phase 7's README). Through Phase 4.8's runner on the same build: 3,348/3,348 |
| Removal (`qa/remove-phase.py`) | **byte-identical** to Phase 4.8's build (`ceb2d4b2…`, 3,255,067 bytes), on the first attempt |
| Remover fixtures (`qa/test-removal.py`) | **11/11**, no skips; every release in the shared removal chain: 22/22 folders' fixtures pass, and the chain's own checks 11/11 |
| Variants (`qa/verify-variants.py`) | **6 of 6** deliberately broken builds fail, each exactly as pinned in `qa/expected-failures.json` (48 failing assertions in all): removed, switched off, the second label "Done", inline, taking a line, or painted. Boundaries green: Phase 12.8's toolbar off 36/36 (the older header), Phase 12's modes off 3/3 (`--no-toggle`) |
| Dependency checker | nothing to look for: the fix declares no function, id or custom property others could use; its one selector names Phase 12's toggle (declared in ROLLBACK.md) |

Headless Chromium only, with the fallback font. The stale paint itself can be seen only on the
iPhone: that is the check that confirms the fix.
