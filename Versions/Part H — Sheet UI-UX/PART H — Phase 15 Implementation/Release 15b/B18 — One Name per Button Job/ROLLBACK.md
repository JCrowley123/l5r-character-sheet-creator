# Removing B18 (Release 15b)

B18 is one independently removable unit of Release 15b: one name per button job, the words and spoken names. Its two round-2 looks are units of their own, built on top of it: B18.1 (one size for Reset) and B18.2 (the i at the right end of its row).

- **Marker:** `PART H PHASE 15.2.10`. The number is a marker only; the unit keeps its identifier.
- **Tag:** `BN15`.
- **Switch:** `ONE_NAME_PER_JOB_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.99999999999999999992-feat-button-names.js`. Holds `BN15` and the switch. |
| Stylesheet | `src/css/1155-button-names.css`: the Combat tab's i's drawn as the ring i, under `body.bn15-on`. |
| Manifest | The two entries naming those files: the stylesheet after B01's (`1154`), the script right after B09's. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `button-names-seam` (a guarded `Object.assign`), right after B09's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after B09's. |

It adds no save field and no storage key. In the page it adds the class `bn15-on` on the body, the class `bn15-i` on the Combat tab's i's, one hidden holder `#bn15Words` with the words the corner ✕'s and four cards' − and + are named from (`bn15Word*`, `bn15Name*`), and ids `bn15Title-*` on the windows' headings that had none.

**What it wraps** (each guarded, so a missing one is skipped): the trunk's `refreshAdvConfigControl`, `recalcAll`, `appConfirm`, `appConfirm3Way`, `appAlert`, `showRollResult`, `attachEmphasisReroll`, `renderStanceTiles` and `renderArrowsPicker`; by property, `R454.decorate` (Phase 4.5.4, Part I), `ANC48.sessionLine` (Phase 4.8, Part I), `CW112.render` (Phase 11.2, Part K), `SC8.render` (Phase 11.2.5, Part K), `LIBPAGE13.mount` (Phase 13, Part K), `CS4514.open` (Phase 4.5.14, Part I), `PDF111.decorate` (Phase 11.1, Part K) and `KT15.show` (Release 15b B17).

**What it changes when it installs** (values other units read at the time they draw): `AG7.USED_NOTE` (the Ancestor Gifts fix), `WP15.LABEL` (Release 15b A14), `AT15.LABEL` (Release 15b B04), and two gift notes in `ANC48.LIBRARY` (Phase 4.8). Each is changed only where today's exact words are found.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. Remove B18.2 and B18.1 first, if present (the removal chain does this: `strip_later(tree, after=<B18's folder>)`).
3. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block or its two fragments, and a missing block.
4. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly group 2 as live (B09 on B05): 17,773,727 bytes, SHA-256 `1f002be964b12ee91b7ed484b949946a859d84b84a7a7756bf7d9ed1841b5819`. `qa/test-removal.py` proves three things:
- that rebuild;
- that B09 removed next gives B05 exactly (`029595b6…8983`, 17,770,451 bytes);
- that B09 can be removed with this unit kept.

**Switching it off instead:** set `ONE_NAME_PER_JOB_ENABLED = false`. Nothing is wrapped or changed and the body class is not set: every button reads and is heard as before.

## Dependencies (declared)

B18 reads or wraps other removable units' objects, each behind a `typeof` guard: with one of them removed, B18 skips that part and the rest still works. Their removers name these in B18's script, so **each refuses while B18 is present: remove B18 first** (the removal chain does this in order). Reciprocal notes are in each one's ROLLBACK.

| Release | What B18 reads | Its remover finds |
|---|---|---|
| Release 15b A14 | `WP15.LABEL`; the i's `wp15LineInfo`, `wp15QaInfo` | `WP15`, `wp15…` |
| Release 15b B04 | `AT15.LABEL`; the i `at15QaInfo` | `AT15`, `at15QaInfo` |
| Release 15b B17 | `KT15.show`; the window's `.kt15-rule` lines | `KT15`, `kt15-rule` |
| BUGFIX — Ancestor Gifts Used and Favour | `AG7.USED_NOTE` | `AG7` |
| Phase 4.5.14 (Part I) | `CS4514.open`; `.court4514-add` | `CS4514`, `court4514-add` |
| Phase 4.5.32 (Part I) | `.dsx4532-btn` | `dsx4532-btn` |
| Phase 4.8 (Part I) | `ANC48.sessionLine`, `.SESSION_NAME`, `.active`, `.LIBRARY`; the card's ids | `ANC48`, `anc48…` |
| Phase 11.1 (Part K) | `PDF111.decorate`; `.pdf111-export` | `PDF111`, `pdf111-export` |
| Phase 11.2 (Part K) | `CW112.render`; `.cw1121-undo` | `CW112`, `cw1121-undo` |
| Phase 11.2.1 (Part K) | `.cw1121-undo` | `cw1121-undo` |
| Phase 11.2.5 (Part K) | `SC8.render` | `SC8` |
| Phase 13 (Part K) | `LIBPAGE13.mount` | `LIBPAGE13` |

Found mechanically: each of the 173 removers with a `SURFACE_RE` was tested against B18's two files (`qa/build/surface-hits.log`). B18 also styles and names controls of the trunk, of Phase 4.5 and 4.5.4 (Part I), of the Social Rank, Taint and Compact Characteristic fixes and of Release 15a A04 by class or id only; none of those removers names B18's files.

**Release 15a A08 (one Undo for quick taps).** A08 tells the Honour, Glory, Status and Taint cards' own − and + from every other control by their `aria-label`. B18 therefore gives those eight their new spoken names ("Increase Honour points" and so on) through `aria-labelledby` and leaves the `aria-label` as it was, so a burst of quick taps is still one Undo (found by the discovery run; B18's `BN-QUICK-TAPS-ONE-UNDO-PHONE` and A08's harness both pass with B18 present). Declared in A08's ROLLBACK.

**The creation wizard's − and +** ("Raise …", "Lower …") are not renamed: they were not on the approved list, and the Creation Cap fix finds the wizard's + by `aria-label^="Raise "`.

## Harnesses that follow this unit (declared)

Each reads `BN15` from the seam. With B18 present each expects B18's words; with B18 removed every line runs as before. Each keeps its ids and its count. Reciprocal notes are in each release's ROLLBACK.

| Release | Harness | Checks |
|---|---|---|
| Release 15b A14 | `qa/net-wound-harness.js` | `WP-LINE-I-PHONE`, `WP-QA-NET-AND-I-PHONE` |
| Release 15b B04 | `qa/armor-tn-harness.js` | `AT-QA-I-PHONE` |
| Release 15b B17 | `qa/kharmic-row-harness.js` | Reset's words and spoken name, the window's line |
| Release 15a A09 | `qa/phone-text-entry-harness.js` | `TX-STEPPER-TWICE-PHONE` |
| Release 15a A08 | `qa/quick-tap-undo-harness.js` | its `plus` and `minus` presses |
| Release 15a A04 | `qa/info-pattern-harness.js` | `IP-CHOOSE-PHONE`, `IP-CHOOSE-DESKTOP` |
| BUGFIX — Ancestor Gifts Used and Favour | `qa/ancestor-gifts-harness.js` | `AG-USED-LABEL` |
| Phase 4.5 (Part I) | `qa/adv-config-expansion-harness.js` | Kharmic Tie's and Luck's rows; Luck's result button |
| Phase 4.5.4 (Part I) | `qa/adv-config-ux-harness.js` | `UX454-INFO-04`, `UX454-SUPERSEDE-03` |
| Phase 4.5.7 (Part I) | `qa/disadv-unlucky-harness.js` | `UNLUCKY457-LUCK-01`, `-MANUAL-01`, `-MANUAL-05` |
| Phase 4.5.32 (Part I) | `qa/damage-sessions-xp-harness.js` | the destiny and Haunted rows, the used message |
| Phase 4.8 (Part I) | `qa/ancestors-harness.js` | `SEPPUN-LINE` |
| Phase 11 (Part K) | `qa/characters-harness.js` | `CL-MENU-OPENS` |
| Phase 11.1 (Part K) | `qa/pdf-harness.js` | `PDF-MENU-ORDER` |

Found by a discovery run of all 213 harnesses of the live suite on B18's build, then each changed harness run on B18's build and on live main's build (both 15/15 harnesses, 781/781 checks).
