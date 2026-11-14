# Release 15a · group G5, undo and the roll preview

Two findings of the Phase 15 audit, grouped by the owner on 14 November 2026 as the design rules' 6 November plan proposed (A19 and A20 follow as G6, after the 18 November reset). Mocked up and approved on 14 November 2026 ([MOCKUP.md](MOCKUP.md); reproduction on the automatic-entries group as live: [REPRODUCTION.md](REPRODUCTION.md)). The owner asked for A12 to be ring-fenced with extra care. This folder holds the group's shared records only; each unit has its own folder.

Built on 14 November 2026 (Claude) in the worktree `C:/Users/jcrow/l5r-release-15a-group5`, from `main` at `c5dd578b` (the automatic-entries group live). Code-reviewed ([qa/code-review.md](qa/code-review.md): no change needed, three low findings recorded). Previews verified on their deployed files (`qa/verify-preview.py`): A08 1,036/1,036, A12 1,054/1,054 (the first attempt stopped on a network error, not a check, and was run again). Device round: the Claude Doc [G5 device checks](https://claude.ai/artifact/VwpvN5pYU7j8uZQ1YNDHVS); mirror [DEVICE-CHECKS.md](DEVICE-CHECKS.md). Not yet device-checked or qualified.

## Units

| Unit | Marker | Tag / switch | Own checks | Tier | Branch | Build |
|---|---|---|---:|---|---|---|
| [A08 One Undo for Quick Taps](<../A08 — One Undo for Quick Taps/README.md>) | `PART H PHASE 15.1.31` | `QT15` / `QUICK_TAP_UNDO_ENABLED` | 21 | Behaviour | `claude/release-15a-a08` | `6d47849b…44b1`, 17,685,928 |
| [A12 One Resisting Line](<../A12 — One Resisting Line/README.md>) | `PART H PHASE 15.1.32` | `RS15` / `RESISTING_LINE_ENABLED` | 18 | Screen-only | `claude/release-15a-a12` (the tip) | `f7678633…bc41`, 17,696,074 |

The records branch `claude/release-15a-g5` (the approval) sits under A08. Both are registered in the removal chain after AE3. All of the group removed is the automatic-entries group as live: `99b76d62…15b8`, 17,675,311 bytes.

**Light checks on the tip:** every harness in the automatic-entries group's candidate list passes on A12 (201 harnesses, 7,380 checks, after A12's four declared conditionals), plus the units' own harnesses (21 + 18). A08's touched layers on A08: 12/12 harnesses, 350/350.

## Declared changes to other layers' tests

Four harnesses pause A12 when it is in the build, so they keep checking their own layer as it works without A12: Seven Fortunes' Blessing (Part I 4.5.21), Touch of the Spirit Realms (4.5.24), the situational entries (4.5.27) and Honour's resistance (A12's README). A08 changes none. Same ids and counts throughout.

## Counts for the qualification

Candidate: the automatic-entries group's 7,380 + 21 + 18 = **7,419**. Retained (all of the group removed = the automatic-entries group as live): 7,380 − 73 live-site checks = **7,307**. Behaviour tier (A08): the 4× CPU screen and two full passes, both first time.

## Light-check tooling

`qa/light-run.cjs` is the automatic-entries group's runner reading that group's frozen candidate list (201 leaves, 7,380 checks), which is G5's starting suite. Logs: `qa/light/`.
