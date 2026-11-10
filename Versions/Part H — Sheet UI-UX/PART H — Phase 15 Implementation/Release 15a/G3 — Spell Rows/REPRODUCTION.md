# G3 reproduction on current G2

10 November 2026. Source SHA-256 `7793602382c68895b25dc572b71bd05af33667a9c1b1d1bd76032efd744182f0`, 17,609,230 bytes. Clean tracked `main` at `20fd1b3e509dddd16fab0a44ef8f2cc6d2c00e79` was verified before these records. No application source changed.

Fresh isolated Chromium contexts at **390 × 844** (touch/mobile emulation) and **1440 × 1000**, device scale 1, one browser job at a time. Actual import: `Versions/BUGFIX — Older School Choices/qa/older-kitsu.l5r.json`. This is synthetic data, not an owner's character. Native Safari/Edge testing is not claimed.

| Finding | Phone reproduction | Laptop reproduction |
|---|---|---|
| UI-01 | Confirm gap to last group: 0 px; left offset: −2 px | Same |
| UI-02 | Sense outer input: 20 px; usable text: 0 px | Outer input: 795.47 px; usable text: 775 px |
| UI-03 | Remove/Memorised hit-area overlap: 34 × 33 px | 21.44 × 25 px |

Owning layers: UI-01 is OC8 `spellsUI` in the SC8 dialog, with `.oc8-held-spell`, `.oc8-spell`, `.oc8-confirm`, `#sc8Body`, `#sc8Done`. Confirm must remain under the body for its ownership guard. SC8.render replaces that body's content; the persistent Later button must survive. UI-02 is SC8.badge / `.sc8-source` on `#techList` spell entries; saved grant ownership lives in the row's SC8 data. UI-02/03 share makeEntry's `.entry-top`, `.en-name`, `.rm-btn`, `.spell-memo-label`; modes are governed by MODES126. Skills/Equipment also use SC8 labels, so scope the eventual work to spell entries.

The unmodified G2 probe confirmed Later makes no writes, reopening has no draft selections, and selecting the fixture's eight starting spells preserves Jurojin's Balm as a reward and leaves only one Earth choice. Both widths had no uncaught page errors. See `qa/reproduction/reproduction.json` for exact geometry and raw screenshots. The original cropped row screenshots have a floating-toolbar artifact; the later centered captures used in the boards avoid it.

## Final scratch evidence

`qa/prototype/prototype.json` contains the final observations, not a qualification result. At both widths:

- Later closes and makes no writes; successful Confirm credits eight School spells, leaves the reward ungranted, and reaches only the Earth picker with review CSS removed.
- The 20-choice long-list fixture scrolls. Phone content 1,079 px / viewport 589 px; laptop 822 / 768 px. Footer top remains 754 px on phone and 910 px on laptop before/after scrolling. Over-quota confirmation is rejected with no writes and both actions retained.
- All six Manage/Play × today/quiet/badge dressings preserve serialized spell data.
- Both combined proposals have a 298 px usable phone name field, 44 × 44 Remove and 44 px Memorised height. Horizontal separation gives zero overlap area for School, reward and long-name rows, also on laptop. A zero-width intersection with a 44 px vertical intersection is zero overlap, not a 44 px overlap.
- A label tap toggles only the first spell. An edited reward survives collectData/applyData; a separate click removes it. These are disposable character interactions.
- Play retains read-only name fields, disabled Memorised and hidden Remove; no uncaught page errors.

The page itself was rendered and visually inspected. Phone/Laptop toggles each reveal three finding sections; there is no horizontal overflow at 390 px. The HTML embeds its screenshots and needs no external image files or fonts.

Not claimed: full application QA, file export/import roundtrip, reload durability, School removal/undo, focus regression acceptance, arbitrary rerenders, switch/removal proofs or owner-device acceptance. These belong to approved implementation and qualification. None of G2's completed full suites was restarted.

## Scratch iteration record

1. Initial static captures established the visual alternatives. Review found dialog lifecycle and one-time Play text-copy limitations; long-list scrolling was not yet exercised.
2. A scratch revision used a capture-listener microtask to restore Later. A real click checkpoint ran it before OC8's original handler, so Later was removed by SC8.render. That scratch run stopped at the missing `#sc8Done` click (line 102), not a full-suite failure. No app files changed.
3. Replaced the microtask with capture/original/bubble ordering and retained the original Play input. Both viewport probes passed. The final visual revision kept the instruction above choices and added invalid-confirm probes; both passed. Earlier scratch folders remain in the session workspace; final evidence is copied here.

## Reproduction commands

Use the canonical QA-tools Node module/browser paths from the kickoff and remove NODE_OPTIONS. Run browser jobs sequentially. `qa/reproduce.cjs <output-directory>` records current G2; `qa/prototype.cjs <output-directory>` records scratch treatments. Each needs the standard navigation-budget and splash-fast preloads. `qa/boards.cjs <prototype-shots> <reproduction-shots> <output-directory>` composes the review artifacts and validates the page (no app preloads). These are bounded scratch utilities, not qualification launchers.
