# Removing A02 (Release 15a)

A02 is one independently removable unit. Its marker is `PART H PHASE 15.1.2`, its tag `FC15`, its switch `FLOATING_STRIP_ENABLED`. This is revision 2 (owner's ruling, 5 November 2026): there is no band any more, and the file names and switch name are kept from revision 1 so the removal chain and every record still point at the same unit.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.9999999999999996-feat-floating-strip.js` (`FC15`, the switch; sets the `fc15-on` body class; adds no element) |
| Fragment | `src/css/1128-floating-strip.css` (`--fc15-base`, `--fc15-gap`, `--fc15-end`, the corner placements of the three controls and the Quick Access panel, the short-screen placement of return-to-top, and the end-of-page room on `.car-page`, screen only) |
| Manifest | the two entries naming those files (CSS last before the style close; script right after A01's) |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `floating-strip-seam` (guarded `Object.assign`), right after A01's block |
| Registry | the last `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py` (after A01) |

It adds no save field and changes no character data, so removing it cannot affect a saved character. It changes no older fixture or harness.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. Run `python -B qa/remove-phase.py <scratch copy>` from this folder. It refuses the live tree, a foreign marker inside its block and a missing block. It strips the two fragments, their manifest entries and the seam block, and nothing else.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly Release 15a A01 as live: 17,531,533 bytes, SHA-256 `cffde62440c3bb037f1ecfe7024b3ae9b3c765bcaccb86d2ea368700aecb0414`. Then removing A01 with its own remover gives Release 8c exactly (`139e0810…2551`). Both are proved by `qa/test-removal.py`.

Switching it off instead: set `FLOATING_STRIP_ENABLED = false`. No class is set, so every older placement and the carousel's own page padding apply again; the negative variant `disabled` proves the page then fails exactly the same checks as A01's live build.

## Dependencies

- **Reads, does not change:** the carousel's shell, tab bar and pages (`#carShell`, `#carTabbar`, `--car-tabbar-h`, and `.car-page`, whose bottom padding it overrides on screen; Part D) and the three controls' ids (`#floatingDiceBtn`, the sheet's own; `#scrollTopBtn`, Phase 1 (Part H); `#quickAccessToggleBtn`/`#quickAccessPanel`, Phase 2 (Part H)). These are trunk or long-standing layers. If a control's layer is removed, its rule simply matches nothing; if the shell or tab bar is missing, A02 does not install. If the dice or return-to-top is removed, the end-of-page room stays (it is sized for the corner stack), which is harmless.
- **Reads a class of Phase 11.3 (Part K), the app bar:** `ab113-top` / `ab113-bottom` and `--ab113-h`, only to add the app bar's height when it sits at the bottom and to cap the Quick Access panel's height under it. Without the app bar the classes are absent and the defaults apply. Declared here; the app bar does not depend on A02.
- **A01:** none either way. A01 can be removed with A02 kept (proved: the A01-removed build passes A02's 23 checks), and A02 with A01 kept.
- **Nothing depends on A02.** No later unit may call `FC15` or read `fc15-on` or the `--fc15-*` properties without declaring it here first. The Combat tab plan's "Rest in the floating action strip" (roadmap) assumed revision 1's band; it now needs its own home and must not reuse A02 without declaring it.
