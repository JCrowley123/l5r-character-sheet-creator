# Release 15a · A01 — handover

**State, 4 November 2026:** built, qualified, checked on devices and **accepted by the owner** (in chat, after the 18:45 UTC records). Nothing is merged to `main` or deployed; that still needs the owner's go-live word.

| | |
|---|---|
| Branch | `claude/release-15a-a01` (build commit `13b0b961`; records commit follows it) |
| Candidate application | `cffde62440c3bb037f1ecfe7024b3ae9b3c765bcaccb86d2ea368700aecb0414`, 17,531,533 bytes |
| Predecessor (live Release 8c) | `139e081092d4899d66563a362073ff594a4b6d00ac452fe0789328c8884a2551`, 17,525,378 bytes |
| Preview | <https://claude-release-15a-a01.l5r-character-sheet-creator.pages.dev/> (page `a9f86f7d…`, 17,538,310 bytes; service worker build `bc95bed68492d7da`) |
| Owner checklist | [A01 device checks (Claude Doc)](https://claude.ai/artifact/82ZApDN83j2vxtvXe3TqY8) · [DEVICE-CHECKS.md](DEVICE-CHECKS.md) |
| Comparison | [COMPARISON.md](COMPARISON.md) |
| What A01 is and owns | [README.md](README.md) · [ROLLBACK.md](ROLLBACK.md) |

## What changed

At the wizard's Review, each open School choice now shows once. The top **Still to choose** box drops any item that a card for the applied School already names, matching the whole item. A choice that no card names, such as the monk's Lore subject or free Kiho picks, becomes a card right after that School's own card. When nothing is left over, the box goes. Cards, their order, the overspend warning, Finish's confirmation and all 8b/8c behaviour are unchanged.

## Verification, measured on this run

| Stage | Result |
|---|---|
| Reproduction of today's 8c first | 12 states (Kuni, Matsu Beastmaster, Nameless Gift monk × incomplete, complete, overspent, overspent-complete): `qa/reproduce/predecessor-8c/` |
| A01's own harness | 31/31 |
| Older fixtures made conditional (wizard3, wizard4, wizard5) | Both ways: 52/52, 25/25, 71/71 on the candidate and on 8c (`qa/fixtures-both-ways/`); 3 of 24 affected harnesses red before the correction, as expected (`qa/affected-before-fixtures.log`) |
| Removal (`qa/test-removal.py`) | 6/6; scratch removal rebuilds 8c byte for byte; the remover refuses the live tree, a foreign marker inside a block and a missing block |
| Negative variants | 7/7 matched their pinned failures |
| Dependency check | every reference inside `PART H PHASE 15.1.1` blocks |
| Read-only code review | no defects; minor item 1 fixed, items 2–3 recorded ([qa/code-review.md](qa/code-review.md)) |
| 4× CPU screen | 913/913 across 24 affected harnesses |
| One discovery run | 6,805/6,805 |
| **Full pass 1** (16:57–17:46 UTC) | **6,805/6,805 candidate, 6,701/6,701 retained**, 180 + 177 leaves executed fresh, 0 reused; A01 removed → `139e0810…2551` exact |
| **Full pass 2** (17:46–18:33 UTC) | **6,805/6,805 candidate, 6,701/6,701 retained**, same; exact restoration |
| Candidate reproduction and comparison | identical cards and Finish in 12 of 12 states |
| Local package (`verify-live.py --local`) | 411/411 |
| Hosted branch preview | 7 files byte for byte; 411/411 |
| Owner's device checks | 12/12 Pass (iPhone Safari, Laptop Edge) |

Both full passes ran on mains power with keep-awake and succeeded on their first executions; neither was re-run.

**One setup slip, recorded:** the first local and preview verification was started without the preload that points Playwright at the installed Chrome. Every harness failed at browser launch before opening a page (`qa/verify-local-no-browser.log`, `qa/verify-preview-no-browser.log`). The same run with the preload set passed 411/411 on both. No assertion, expected value or timeout was changed between the two runs. Before that, an accidental run without `--url` began polling production. It was stopped before it wrote anything.

## Usage (Claude, account-wide, kept separate from Codex)

`qa/usage.json`: model `claude-opus-5-5`, effort high. Readings (five-hour / weekly):

| Time (UTC) | Five-hour | Weekly |
|---|---|---|
| 15:36 | 32% | 9% |
| 15:59 | 57% | 12% |
| 16:56, after the 16:50 reset | 0% | 14% |
| 18:45 | 13% | 16% |

Weekly use moved about 7 points against the 5 (3–8) estimate. The records and commit after 18:45 add a little.

## Follow-ups (not A01's; nothing built)

1. **FU-15a-1, the owner's device-pass request.** The wizard's Kiho step (Phase 11.2.2, Part K) builds its list from the sheet's own `#techQuickAdd` picker, and that picker does not remove a Kiho already learnt. So the same Kiho can be taken twice, in the wizard and on the sheet; see `qa/device-pass/check5-duplicate-kiho-edge.png`, Air Fist twice. The owner asks that learnt Kiho, Kata and spells leave the list, as Skills already do. This is present in Release 8c.
2. Already in 8c: naming the monk's Lore subject in the wizard adds a *1 School Skill at Rank 0* warning card.
3. Review items 2 and 3 (theoretical comma-bounded false match; harness parser and "e.g. "), recorded only.

## Next

The owner **accepted A01** on 4 November.

- **Go-live:** merge to `main` only on the owner's go-live word, then verify production with `qa/verify-live.py`, set up with the same `NODE_PATH`/`NODE_OPTIONS` as `qa/run-final-twice.py`.
- **If it is ever removed:** follow [ROLLBACK.md](ROLLBACK.md): run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, then `build/recombine.py --verify`. It rebuilds `139e0810…2551`.
- **A02** may now be chosen; it has not started and needs its own scope approval and session.
