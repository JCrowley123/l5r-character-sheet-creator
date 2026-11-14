# Removing A12 (Release 15a)

A12 is one independently removable unit of group G5 (undo and the roll preview). The owner approved it on 14 November 2026 asking for it to be ring-fenced with extra care, as the unit they are least sure of: it is built to come out cleanly at any time.

- **Marker:** `PART H PHASE 15.1.32`. The number is a marker only; the unit keeps its identifier.
- **Tag:** `RS15`.
- **Switch:** `RESISTING_LINE_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.999999999999999999-feat-resisting-line.js`. Holds `RS15` and the switch. Rebinds, by name, the roll preview's optional hook `rd4515PreviewHtml` (the preview calls it through a `typeof` guard): the registry's finished markup is rearranged so that the fifteen resistance choices (`RS15.KEYS`) sit in one `details.rs15-line` at the top of "Declare for this roll". Reads the registry (`RD4515.offered`, `RD4515.armed`); never arms, clears or recomputes a choice. One capture-phase `toggle` listener on the document keeps the line open across the preview's redraws. `RS15.paused` (tests only; nothing in the app sets it) returns the registry's markup unchanged. |
| Fragment | `src/css/1147-resisting-line.css`. Draws the line; its own classes only. |
| Manifest | The two entries naming those files: the stylesheet right after AE3's, the fragment right after A08's. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `resisting-line-seam` (a guarded `Object.assign`), right after A08's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after A08's. |

It writes nothing: no save field, no storage, no change to a roll's dice or total. The line's open state lives only while one preview is open.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block, and a missing block.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly A08: 17,685,928 bytes, SHA-256 `6d47849b1dcb5aa8ac4140b1895d1f0d713426092530e183ff87c3fc4d7c44b1`. `qa/test-removal.py` proves that, then that A08 removed next gives AE3 (the automatic-entries group as live) exactly, and that A08 can be removed with this unit kept.

**Switching it off instead:** set `RESISTING_LINE_ENABLED = false`. The hook is not rebound and "Declare for this roll" is the registry's markup, exactly as before.

## Dependencies

- **Part I 4.5.15, the roll declaration registry (`RD4515`) — hard.** Without it (or with it off) there is nothing to rearrange and the unit does not install.
- **Part G Phase 3, the roll preview — hard, by name.** Its `rd4515PreviewHtml` hook is the only way in; without the preview there is no "Declare for this roll".
- **The providers whose choices it gathers — soft.** Honour's resistance (`honour-resistance`), the situational Advantages (`situational-entries`), Seven Fortunes' Blessing (`fortune-blessing`), Touch of the Spirit Realms (`spirit-realms`) and the Ancestors (`ancestors`). A provider that is absent offers nothing, and the line holds what is left; with none of them offering, there is no line.
- **A08 — none.** A08 does not touch the roll preview.
- **Nothing depends on this unit.**
