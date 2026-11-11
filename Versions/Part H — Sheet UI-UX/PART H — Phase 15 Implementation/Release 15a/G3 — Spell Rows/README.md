# G3 — Spell Rows

## Current state (11 November 2026, Claude)

**Device round done: 34/34 Pass; 8b.1-UI-01 Accept, 8b.1-UI-02 Accept, 8b.1-UI-03 Revise. Not qualified, not live.** G2 remains live. The owner's comments at the round, with findings and recommendations, are in [OWNER-COMMENTS-2026-11-11.md](OWNER-COMMENTS-2026-11-11.md); none is decided or built.

- **The owner's decision:** "Approve all three", 11 November 2026, for Claude's alternatives ([MOCKUP.md](MOCKUP.md)).
- **The units** (each its own folder under Release 15a, with README, ROLLBACK, pinned harness, remover and removal proof):
  - [8b.1-UI-01 — Starting-Spell Review and Its Actions](<../8b.1-UI-01 — Starting-Spell Review and Its Actions/README.md>)
  - [8b.1-UI-02 — Readable Spell Name and School Tag](<../8b.1-UI-02 — Readable Spell Name and School Tag/README.md>)
  - [8b.1-UI-03 — Remove Apart from Memorised](<../8b.1-UI-03 — Remove Apart from Memorised/README.md>)
- **Branches:** `claude/release-15a-ui01` → `-ui02` → `-ui03`, stacked on this mock-up branch. Nothing is merged to `main`.
- **Previews and their checks:** [PREVIEWS.md](PREVIEWS.md).
- **The owner's checklist:** [DEVICE-CHECKS.md](DEVICE-CHECKS.md) mirrors the Claude Doc.
- **Code review:** [qa/code-review.md](qa/code-review.md).
- **Whole-group removal** restores live G2 exactly (`77936023…82f0`, 17,609,230 bytes); each unit can also be removed alone with the other two kept.

**8b.1-UI-03 revision 2 is built** (11 November, approved by the owner): the × in its own corner on every Technique, Kata, Kiho, Advantage and Disadvantage card, and the number box narrowed to 52 px. Light checks pass; see the unit's README.

**Next:** the owner's device checks of revision 2 (checks 18–21 in the doc) and a short re-look at checks 1 and 6, then one qualification for the accepted units, then the owner's go-live word. Qualification arithmetic if all three are accepted and stay screen-only: candidate 7,148 + 84 = **7,232**; retained **7,075**. Pin the exact ids before running.

**Environment notes from the build:** the tree is LF throughout. On this Windows machine a rebuild occasionally cannot rewrite `l5r-character-sheet.html` (`OSError 22`, a file lock); the file is left as it was, so run it again and gate every commit on `build.py --check-drift`. Harness contexts block web fonts, which makes a name box 3 px shorter than on a device.

---

The sections below are the earlier record, kept as written.

# G3 — Spell Rows: reproduction and mockup approval (10 November 2026, Codex)

10 November 2026. **Awaiting owner decisions. G3 is not implemented, accepted, qualified or live.** G2 remains live. This folder contains scratch review artifacts, not application fragments or a working G3 branch preview.

Base: `main` commit `20fd1b3e509dddd16fab0a44ef8f2cc6d2c00e79`. Mockup branch: `codex/release-15a-g3-mockups`. Application SHA-256 `7793602382c68895b25dc572b71bd05af33667a9c1b1d1bd76032efd744182f0`, 17,609,230 bytes, unchanged.

- Open [the self-contained review page](mockups/G3-MOCKUP-REVIEW.html) locally. It has Phone/Laptop controls, current/proposed cases, Manage/Play, School/reward, long names, multiple Schools and long-list scrolling.
- Image boards: [UI-01](mockups/G3-UI01-review.png), [UI-02](mockups/G3-UI02-attribution.png), [UI-03](mockups/G3-UI03-controls.png).
- [Reproduction and evidence](REPRODUCTION.md), [proposals and pending decisions](MOCKUP.md), [usage readings](qa/USAGE.md).
- Governing [G3 kickoff](../G2%20%E2%80%94%20Small%20Layout%20Fixes/KICKOFF-15A-G3.md), read in full. The 6 November amendment preserves separate acceptance/removal while allowing grouped building and QA.

Next: record the owner's UI-01, UI-02 A/B and UI-03 mockup decisions. Build only approved scope as three independently owned units with stacked previews. Do not start G4 or merge/deploy G3. Exact new check counts and markers remain unchosen. G3 candidate starts at 7,148 plus new checks; retained is 7,075. Removing all G3 must restore the G2 hash above. G2's completed qualification and production suites must not be rerun.

Remote Control: owner confirmed enabled and iPhone connected on 8 November in this chat. Left untouched. No current switch is exposed by the available tools, so this session does not claim a fresh status verification.

## Claude review, 11 November 2026

The owner asked Claude to review the boards before deciding. [Claude's review page](mockups/G3-CLAUDE-REVIEW.html) and boards ([UI-01](mockups/G3-CLAUDE-UI01.png), [spell rows](mockups/G3-CLAUDE-ROWS.png)) set today, the proposals above and Claude's alternatives side by side; the reasoning and measurements are in [MOCKUP.md](MOCKUP.md). Scratch evidence and the two utilities are in `qa/claude-review/` (`claude-proto.cjs <output>` with the standard preloads, then `claude-boards.cjs <shots> <qa/prototype> <output>`). **Still awaiting the owner's three decisions; nothing is built.** Remote Control was switched on for the Claude session on 11 November (state reported “on”).

## Continue in Claude

Use [the Claude continuation kickoff](KICKOFF-15A-G3-CLAUDE.md), prepared 10 November 2026 after the completed mockups. It records the pending decisions and exact next steps without requiring the previous chat.
