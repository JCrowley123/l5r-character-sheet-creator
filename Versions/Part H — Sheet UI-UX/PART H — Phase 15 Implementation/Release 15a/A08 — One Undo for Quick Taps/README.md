# Release 15a · A08 — One Undo for Quick Taps

**18 November 2026:** A12 was withdrawn from G5 (the owner moved the resistance redesign into a phase of its own), so G5 is this unit alone and `claude/release-15a-a08` is the group tip. See the group's [README](<../G5 — Undo and the Roll Preview/README.md>).

Group G5 (undo and the roll preview), unit 1 of 2. FT-47 (the owner, 28 October 2026), ruled at Q4 on 1 November 2026 as a rolling five-second group; approved as mocked up on 14 November 2026 ([the group's mock-ups](<../G5 — Undo and the Roll Preview/MOCKUP.md>)). Built on 14 November 2026 (Claude), on branch `claude/release-15a-a08`, stacked on the group's records branch `claude/release-15a-g5` (from `main` at `c5dd578b`, the automatic-entries group live).

## What changes

- **Taps close together are one change.** Consecutive − and + taps on the same Honour, Glory, Status or Taint card, each within five seconds of the previous one, are one group. − and + both count, whatever amount the box between them holds.
- **Undo takes the group back in one step**, to the value before its first tap. It stays on screen exactly as long as before (20 seconds after the last tap, or until a save), and there is still one Undo at a time.
- **History has one entry for the group** (from the value before the first tap to the last value), written when the group ends, or none when the taps cancel out or the group is undone before it ends.
- **The message names the taps** once a group holds two: "Honour: Rank 5, Points 0. Undo takes back all 3 taps." After Undo: "Undone. Honour: Rank 4, Points 7." A single tap reads word for word as before.
- **What ends a group:** five seconds without a tap; a tap on another card; any other change to the four cards (a typed Rank or Points, Set Rank, Recognition by your lord); Undo; opening, loading or resetting the character (the group is dropped); Undo expiring (a save, or its 20 seconds); a click on any other control (Save, Export, a roll, a menu, History); an edit anywhere else. Moving between pages does not end it.
- **Unchanged:** the values each tap gives, limits, Rank changes, Recognition, Taint, the 20-second window, autosave and the save format. Nothing new is saved.

## How it is built

- `src/sheet/209.999999999999999998-feat-quick-tap-undo.js` — `QT15` and the switch `QUICK_TAP_UNDO_ENABLED`. It wraps CP7's own entry points by property: `CP7.adjust` (the − and + buttons call it) keeps the group; `CP7.commit` from anything but a tap ends it; `CP7.clear` (a load or a reset) drops it; `CP7.ce7ExpireUndo` (CE7's save and timer expiry) ends it. On Undo, CP7 still takes back the last tap itself, with its own record, checks and message; a listener after CP7's and CE7's then writes the rest of the way back as CP7 writes (`RP7.write` and `RP7.changed`, or `TA7.write`) and says so. A capture-phase listener on Undo marks the click as Undo's own, so CP7's own write is not taken for an edit elsewhere (found by the first probe; see below). Capture-phase `click`, `input` and `change` listeners on the document end an open group on any other control or edit.
- **History without holding anything back.** History (AL71) still writes the taps' entries as it always has, so a save in the middle of a group carries every entry. When a group of two or more taps ends, the entries made since it began, if all are about its card, become one entry (or none), through `AL71.restart`, followed by `AL71.check` so the next look starts from the sheet as it is, and the Characters list is asked for an autosave (`CL11.schedule`; nothing for a sheet that is not saved). Anything else among those entries, a sheet replaced meanwhile, or a log that has moved on, leaves the History as it is.
- One guarded seam block, `quick-tap-undo-seam`.

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With A08 (this branch) | `6d47849b1dcb5aa8ac4140b1895d1f0d713426092530e183ff87c3fc4d7c44b1` | 17,685,928 |
| A08 removed (AE3, the automatic-entries group as live) | `99b76d625c04e6aa22ba8508005975525bbece945b82ead8c443b593e58115b8` | 17,675,311 |

## Light checks (14 November)

| Check | Result |
|---|---|
| Own harness `qa/quick-tap-undo-harness.js` (21 checks pinned before the first run) | 21/21 on the first run |
| Own harness on AE3 (the unit absent) | 10/21: the ten that pass hold either way (one tap, a gap over five seconds, another card, a typed value, Recognition, an edit elsewhere, a load, a save after quick taps, no page errors on either size) |
| `qa/test-removal.py` | 10/10 |
| `feature-dependencies.py` | every reference inside this unit's own block |
| The harnesses of the layers it touches, from the automatic-entries group's candidate list (A09, the undone-change fix, the audit log, card editing, the Characters list, Play and Manage, the save format, social Rank and points, Taint, the Imperial Scion, compact controls, Honour's resistance) | 12/12 harnesses, 350/350 checks. Log: `G5 — Undo and the Roll Preview/qa/light/a08-touched-run.log` |

**Found while building, before the harness's first run:** a probe of the first build showed that CP7's own Undo writes the field and fires its input event, which the "edit elsewhere" listener took for another change: the group ended before this unit could finish the Undo, and a burst undone inside the window left two History entries. The capture-phase listener on Undo fixed it; the probe then showed no entry. Build before the fix: `a8b50688…382a`, 17,685,707 bytes (never committed).

## Not covered by the harness

- A native iPhone and Safari: the harness taps on Chromium's touch emulation. The device round should tap a burst on a real phone, including a quick double tap (A09's "two quick taps are two presses"), and press Undo.
- Export JSON in the middle of a group: the Export button is a click on another control, so it ends the group first, as Save does; the harness checks Save.
