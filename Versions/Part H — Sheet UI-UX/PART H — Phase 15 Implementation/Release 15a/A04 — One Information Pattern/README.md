# Release 15a · A04 — One Information Pattern

Group G1, unit 1 of 4. Built 7 November 2026 (Claude), on branch `claude/release-15a-a04` from `main`. Mock-ups were approved by the owner on 6 November, with the Hotei part and the Void Points eye: [G1 mock-ups](<../G1 — Information Pattern/MOCKUP.md>). The finding is in the Phase 15 audit (A04) and the ruling is Q3 (1 November).

## What changes

The upright circled i that Advantages A01–A16 already use is now the one information control in Skills, Advantages and Disadvantages, and on the Void Points card. It is a 28 px ring in the ink colour with an upright serif i.

- **Skills.** The 👁 on every Skill becomes the i. So does the Kiho note's ⓘ, which uses the same trunk class. Each button keeps its element, class, title and listener, so A03 still places it. Its text is hidden, not changed. It gains an accessible name, "Calligraphy information", which follows the name as it is typed. Before, the only name was the eye glyph.
- **Void Points.** The eye on Rings & Traits becomes the i, named "Void Points information".
- **Advantages and Disadvantages:**
  - Phase 4.54's (Part I) small gold italic i becomes the standard i.
  - On an unconfigured row it used to sit *inside* the "Choose…" button (6 per mode per device on the dense character). It now sits beside the button, named "Explain: Wealthy" and so on. Tapping it opens the explanation, and Choose… still opens the picker.
  - The configuration window is handled the same way.
- **Hotei's Curse.** The row keeps the choice, the badge, Change, and one line: "Techniques and Advantages cost 2 Void Points to activate. 6 XP." The rule and the row's two instructions are behind the row's i, word for word. Another Fortune's row is unchanged.
- **Touch area.** Every one of these buttons has a 44 × 44 px area. A tap 6 px outside the ring still lands on the button, as measured with `elementFromPoint`.
- **Not changed:**
  - the Combat tab's ⓘ (outside A04's areas);
  - the spells' "?" (it explains a refusal);
  - print, which already hides these buttons;
  - saved characters.

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With A04 (this branch) | `bc4ba31134bb30848f73bbfd5fc1e7a9c76eb75fee391f829f682647d700e0c9` | 17,566,583 |
| A04 removed (A03 as live) | `e73b7c0cac70c95d2965d993c9a3b9f0b66eb6f3ef4b81d6667166667090de06` | 17,553,370 |

## Light checks (7 November)

All harnesses were run with the suite's two leaf preloads (installed Chrome, splash-fast), as `flat-suite-runner.js` gives every leaf.

| Check | Result |
|---|---|
| Own harness `qa/info-pattern-harness.js` (pinned in `qa/expected-checks.json` before the first run; two checks added after the review, also pinned before their first run) | 35/35 |
| `qa/test-removal.py` | 10/10 |
| `feature-dependencies.py` (fragment plus `--also` classes) | every reference inside A04's own blocks |
| A03's harness | 37/37 |
| Phase 4.54 (Part I) | 28/28 |
| Phase 4.5.14 (Part I), the court-picker owner | 225/225 |
| Phase 4.5.36 (Part I), Hotei's Void card | 45/45 |
| BUGFIX — Hotei Where the Sheet Spends Void | 16/16 |
| Phase 4.5.11 (Part I), Seven Fortunes' Curse | 74/74 |

The first run of 4.5.14's harness was without the preloads: 182/184, with the splash intercepting two taps. With the preloads, as in the suite, it passed 225/225. No check was changed.

## The group review (7 November)

One read-only review of the whole G1 diff found no blocking defect. It found two risks and two small issues in A04, all fixed:

1. **A lone i in Play.** Phase 12 (Part K) hides a locked Choose… in Play. Before A04, the i was hidden with it, because it sat inside. After the move, a lone i stayed in view. The stylesheet now hides an i moved out of a locked control in Play, and `IP-PLAY-NO-LONE-I-*` checks it. That check fails on the build before the fix and passes after.
2. **Overlapping touch areas.** The i's 44 px area reached 2 px into the control beside it. The gap is now 8 px, matching the area's reach.
3. **Hotei's price.** It is read from the entry's own cost box, not from the summary's wording, which Phase 4.54 (Part I) rewrites.
4. **`<summary>` hosts.** These are no longer moved: an i moved out of one would sit inside its closed `<details>`. No titled summary exists in these areas today.

The review also found one harness nit: `IP-KIHO` skipped the ring check while the Kiho note was hidden. It now reveals the note's hidden ancestors for the measurement, so it always checks the ring.

The first build was `a6869058…5ab6` (17,565,765 bytes).

Qualification (one full pass for the group, the removal chain, the variants) comes after the owner's review. See [ROLLBACK.md](ROLLBACK.md) for ownership and dependencies.
