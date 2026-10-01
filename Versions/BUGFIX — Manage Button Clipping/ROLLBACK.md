# ROLLBACK — BUGFIX — Manage Button Clipping

## Surgical removal (the method)

On a **scratch copy** of the Phase 0 tree, never the live one:

```bash
python "Versions/BUGFIX — Manage Button Clipping/qa/remove-phase.py" <copy> [--dry-run] [--expect-sha SHA]
python <copy>/build/recombine.py
```

It removes exactly:

| What | Where |
|---|---|
| `src/css/59.9998-bugfix-manage-toggle-width.css` | the whole stylesheet, and its manifest entry |
| `src/sheet/209.99999-bugfix-manage-toggle.js` | the whole switch fragment, and its manifest entry |

Nothing else: the fix adds no block to any shared file. Both files are delimited
`BUGFIX MANAGETOGGLE` … `END BUGFIX MANAGETOGGLE`. The remover preflights everything before writing,
refuses either file holding any other marker, refuses any retained source that still names the fix's
marker or its surface (`MANAGE_TOGGLE_FIX_ENABLED`, `manage-toggle-fixed`, `pm12-toggle::after`), and
refuses the live tree, its parents, a symbolic link, and any file that is the live tree's own file
under another name.

**Measured on 1 October 2026:** removal rebuilds **byte-identical** to Phase 4.8's build,
`ceb2d4b2cd1f281c1878ffb3368a216da930df490e358f1d7c2cc55ef424cfef`, 3,255,067 bytes, on the first
attempt. The remover's own fixtures: 11/11, no skips.

**Kill switch:** `const MANAGE_TOGGLE_FIX_ENABLED = true;` in the fragment. Off, the page never gets
the class the rule waits for, and the toggle behaves as before the fix (measured: that variant fails
exactly the ten checks the removed build fails).

## What removing it does

The toggle goes back to the width of its label, so Done is narrower than Manage and the header's
other buttons move when it is tapped, as before. No saved data is involved.

## Dependencies

| On | What it uses | Without it |
|---|---|---|
| Phase 12 (Part K) | styles its toggle, `#pm12Toggle.pm12-toggle` | the rule matches nothing (measured: Phase 12's switch off, the harness's `--no-toggle` boundary, 3/3) |
| Phase 12.8 (Part K) | nothing: its header layout is what makes the movement visible, but the fix works in the older header too | measured: Phase 12.8's switch off, 36/36 |

**Removal order.** Phase 12's remover refuses while this fix is present, because its surface pattern
matches `pm12Toggle` and `pm12-` classes (measured: "retained source contains owned marker/surface:
src/css/59.9998-bugfix-manage-toggle-width.css"; with the fix removed first, it goes ahead). Remove
this fix first; the shared removal chain does so, since this fix is registered in `QA — Removal Chain
Registry` after Phase 4.8. Phase 12's ROLLBACK now names this fix. The copies of that file and of
`removal_chain.py` from before this fix are in `originals/`.

## Restore points

| | |
|---|---|
| Phase 0 build before this fix | `ceb2d4b2cd1f281c1878ffb3368a216da930df490e358f1d7c2cc55ef424cfef`, 3,255,067 bytes (Phase 4.8's second release, commit `6b316a8`) |
| Phase 0 build with this fix | `f4345b4aa63dc9a1e0e61e01fd83fdbb95a296701ecaa84650e1909c44119760`, 3,256,563 bytes |
| `window.__L5R_TEST__` | unchanged: the fix adds no key |
