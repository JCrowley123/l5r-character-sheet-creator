# Cycle 7a device follow-up — ready for your review (28 October 2026)

**Two removable layers, both finished. The full suite passed twice, first time, on mains power with the screen held
awake: 6,365/6,365, then both layers removed through the registry (rebuilding main `e58fe09`, `4f2ebd5b…30e5f`,
17,336,656 bytes, byte for byte), then 6,228/6,228, in both runs. Nothing is merged or deployed.**

| Layer | What it does | Own harness (main) | Variants | Removal |
|---|---|---:|---:|---:|
| BUGFIX — Characteristic Card Editing | Rank and Points typed into the four cards in Management; Undo lasts 20 seconds | 46/46 (1/46) | 15 | 6/6 |
| BUGFIX — Wound Settings Preview | Rings & Traits shows all eight wound thresholds beside the campaign multipliers | 18/18 (1/18) | 4 | 6/6 |

- **The build:** 17,349,941 bytes, `55f9e9ed601e052f3be617c06da51d795ab8f5932e5213d339ef27d6bd21f389`, on branch
  `codex/cycle-7a-device-followup`.
- **Built by Codex, finished by Claude.** Codex built both layers and handed over with one review's three findings open
  ([CLAUDE-KICKOFF.md](CLAUDE-KICKOFF.md), now history). Claude reproduced and fixed all three, then a second review's
  three real findings, each with checks pinned before the first run ([REVIEW-FINDINGS.md](REVIEW-FINDINGS.md)).
- **One finding reported, not built:** an older save race in the core save code. It needs the asynchronous storage
  bridge (a Claude artifact); on the live site and the Android app storage is localStorage, where it cannot happen.
  A small removable fix can be built if you want it.

## Why the suite passed first time

Earlier cycles lost runs to load: battery standby, memory pressure, layout read mid-reflow. This time:

- **Under load first.** The three affected layers' harnesses ran at 4× CPU throttling (`qa/cpu-throttle.cjs`):
  card editing 46/46, compact controls 33/33, wound preview 18/18 (`qa/under-load/`). No check was loosened.
- **Affected groups on the final build:** 93/93 groups, 4,702 checks, 10.9 minutes (`qa/affected-3/`).
- **Conditions:** mains power at 100%, 5.1 GB free, no other test browsers, Codex idle, and
  `qa/run-final-twice.py` holding the system and screen awake for both runs.

| Run | Candidate | Removal | Retained | Time |
|---|---:|---|---:|---|
| final-run-1 | 6,365/6,365 (147 leaves) | exact | 6,228/6,228 (143 leaves) | 19.6 + 17.2 min |
| final-run-2 | 6,365/6,365 | exact | 6,228/6,228 | 19.7 + 17.2 min |

Each run's logs and `summary.json` are in `qa/final-run-1/` and `qa/final-run-2/`; the per-leaf output folders are
not kept.

## Other evidence

- **Phone captures** of each card in Play and Management and of the alert, Undo and withdrawn states: `qa/visual-2/`.
- **Removal chain:** the wound preview layer is removed first; its predecessor is the card-editing build,
  `fc268dd2…f4ef`, 17,346,510 bytes.
- **Rollback:** each layer's ROLLBACK.md.
