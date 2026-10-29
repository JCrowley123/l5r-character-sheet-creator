# Empty Quiver Cancels

**Status, 29 October 2026:** built for Release 7c.1 on branch `release-7c1`; not merged. The release's QA folder is `QA — Release 7c.1 2026-10-29`.

Your ruling from the Release 7c device checks (C1, 29 October): rolling an attack without an arrow makes no sense, narratively or mechanically. An empty quiver's arrow picker still opens and says why: "You have no arrows: your quiver is empty, so there is nothing to fire. Add arrows in Equipment to attack with this bow." Its one button is now **Cancel**, which closes the picker as its ✕ does: the attack ends and nothing rolls ("Attack cancelled — no arrow nocked."). With arrows in the quiver nothing changes.

## How it is built

One fragment behind one switch, `EMPTY_QUIVER_CANCEL_ENABLED = true`: `src/sheet/209.999999999999994-bugfix-quiver-cancel.js`, with `QC7Logic` (UI-agnostic: the words) and `QC7` (wraps `EQ7.before`, which builds its picker before its first await, and replaces EQ7's Roll without an arrow button with Cancel, a fresh node without EQ7's listener). Test seam: the `quiver-cancel-seam` block in `src/sheet/210-test-seam-and-init.js`. It needs `BUGFIX — Empty Quiver Rolls On` (EQ7) and switches itself off without it.

Known limits: EQ7's roll-without path stays in the build but cannot be reached while this switch is on, so three of EQ7's own variants (pass-ignored, no-pass, message-kept) change nothing on the 7c.1 candidate; with this switch off they match their pins exactly (`qa/eq7-variants-qc-off.py`, 6 of 6).

## Checks

- `qa/quiver-cancel-harness.js`: 6/6 on the candidate.
- Pinned negative variants (`qa/variants.json`, committed before the first run): main (7c, baseline) fails exactly 3 pinned checks; disabled 3; no-decorate 2; message-kept 1; cancel-inert 1. All matched.
- Removal (`qa/test-removal.py`): 6/6. This remover rebuilds 7c's build exactly, `efca3b66ac738c49a7af5fc43d1ca09e745863b7dd83e3761c3d5cc43272dfc4`, 17,441,230 bytes.

## Older checks changed

Three of `BUGFIX — Empty Quiver Rolls On`'s checks expect the new behaviour only while this switch is on, exactly as before otherwise: EQ-EMPTY-OFFERS (the message and no roll-without button), EQ-ROLL-WITHOUT (its button is Cancel, so the attack ends unrolled) and EQ-ONCE (the same button). That harness passes 8/8 on the candidate and on 7c's build.
