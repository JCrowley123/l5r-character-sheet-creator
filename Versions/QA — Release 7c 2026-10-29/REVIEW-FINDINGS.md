# Release 7c — code review findings (29 October 2026)

One read-only review (Helper 1) of `main..release-7c` (`src/`), after the six layers passed their own checks and before the full suite. Three confirmed defects, three lower ones, five areas with no defect. Each finding that was fixed was reproduced first on the pre-review build, with a check pinned before its run; the variants for the new checks and for each fix were pinned before their first run too.

| # | Finding | Outcome |
|---|---|---|
| 1 | LM7: under the full moon, the Void card's pip wrapper drew the pips itself and skipped the wrappers before it, so Hotei's 2-point button and the Void reason lines went stale after a pip tap (enabled after a spend, disabled after a gain). | **Reproduced** by LM-PANEL-FOLLOWS. Fixed: the moon's card also redraws the Void panel. Variant panel-not-redrawn. |
| 2 | LM7: re-picking the Curse's severity, renaming the row or removing it dropped the moon flag with no sunrise, so a point was clamped mid-night with no message, or the moon's point survived sunrise for good. | **Reproduced** by LM-REPICK-KEEPS and LM-ROW-REMOVED-SUNRISE. Fixed: a new severity keeps tonight's moon (a wrapper on `writeAdvConfig`); the row removed or renamed is a sunrise (the point goes if unspent). LM-LOAD-NOT-SUNRISE guards that loading or resetting a character is never a sunrise. Variants moon-not-kept, no-settle, load-is-sunrise. |
| 3 | AL71: History could be missing from the sheet's ⋯ menu all session when storage is read through the Claude-hosted bridge (truly async), since the menu is built after the character list loads and AL71 tried only at three early moments. | **Reproduced** by AL-MENU-LATE. Fixed: History is added whenever the toolbar is built. Variant toolbar-unwrapped. |
| 4 | AL71: on a sheet not yet saved, a change undone leaves two History entries, so opening another character asks whether to discard an unchanged sheet. Low. | Recorded as a known limit in the audit log's README (a new character is saved at once, so this is rare). |
| 5 | AL71: inputs that call the sheet's recalculation directly, and Void pip taps, did not schedule a look, so an entry could be logged late; a change in the first 1.5 seconds after a load or Import is taken as the starting point. Low. | **Reproduced** by AL-FIELD-EVENT. Fixed: any input, change or tap schedules the next look. Variant no-event-listeners. The first 1.5 seconds are recorded as a known limit in the README. |
| 6 | AL71: with the switch off, the next save drops the saved History. Low. | Recorded in the audit log's ROLLBACK: either way, the History is dropped from each character the next time it is saved. |
| 7 | RF7, GR7 and SSA992 together. | No defect: RF7 restores old values rather than adding amounts back, so nothing is given twice, and it reads nothing SSA992 refunds; GR7 still runs inside RF7, whose message follows GR7's. |
| 8 | EQ7. | No leak: its pass-through flag is cleared at each roll and used by the very next check. The switch turns the layer fully off. |
| 9 | RC7. | No defect: the wizard reaches the wrapped step functions by name; over 4 already, a warning shows and Finish is allowed. |
| 10 | LM7 load, save and Hotei's take-back. | Correct: a load keeps 4 / 3, a full save keeps the moon, and Hotei's outstanding count clears when the moon moves it. |
| 11 | Markers and switches. | Clean: every BEGIN/END matches its remover, no marker-shaped prose, every switch turns its layer fully off. |

Checks after the review: the moon 17 (13 + 4), the audit log 17 (15 + 2); the other four unchanged (cap 11, quiver 8, scrolls 5, refund 9). Every layer's variants matched on the fixed build (`qa/after-review-1/`, `qa/after-review-2/`): one moon mutation was refused before any run because its text was not unique, and was given more context.

**Older checks changed.** The discovery run of the whole candidate suite (`qa/affected-1/`, not a final run) found twelve older leaves that pinned the old behaviour, all by design. Each now expects the new behaviour only while the new layer's switch is on, exactly as before otherwise (commit `f34c629`; listed in the audit log's README, 11 of them, and the cap's, 2):
- `/auditLog` in two isolation checks: 4.5.7 Unlucky (UNLUCKY457-ISOLATION-01) and 4.5.8 Dependant and Wrath of the Kami (D458-ISOLATION-01).
- History in the menus: Characters list (CL-MENU-OPENS), Export to PDF (PDF-MENU-ORDER), Play Mode Toolbar (two ITEMS checks), Search (S14-MENU-ITEMS-MANAGE/-PLAY), App Bar (AB-DUPLICATES-HIDDEN).
- Wizard made versus by hand: `collectData` compared without `auditLog` while AL71 is on (wizard, wizard2–5).
- The creation cap: the wizard's overspend raises Agility, Strength and Perception once each instead of Willpower 4→7 (wizard), and raises the Skills shown one at a time until it blocks (wizard2), while RC7 is on.
