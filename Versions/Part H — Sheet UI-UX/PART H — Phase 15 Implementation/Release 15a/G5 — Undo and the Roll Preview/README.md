# Release 15a · group G5, undo and the roll preview (A08 alone)

**18 November 2026 · G5 is A08 alone (the owner).** G5 was grouped on 14 November 2026 as A08 (one Undo for quick taps) and A12 (one Resisting line). In the device round (16 November) every check passed on iPhone and laptop; the owner accepted A08 and marked A12 revise. The owner then chose to replace A12 with an effect-first resistance design, a full resistance rules audit followed, and on 18 November the owner moved that work out of Release 15a into a phase of its own after Phase 15 ("Yes, pin it"), so it does not hold up the rest of 15a or Release 15b. **A12 is withdrawn and never goes live.** Its build, its records and every resistance record (mock-ups, the audit, the owner's answers so far) stay on `claude/release-15a-a12` (tip `a8ada8aa`), not on this branch. G6 (A19 and A20) follows G5.

Mocked up and approved on 14 November 2026 ([MOCKUP.md](MOCKUP.md); reproduction on the automatic-entries group as live: [REPRODUCTION.md](REPRODUCTION.md)). Built on 14 November 2026 (Claude) in the worktree `C:/Users/jcrow/l5r-release-15a-group5`, from `main` at `c5dd578b` (the automatic-entries group live); qualified in the worktree `C:/Users/jcrow/l5r-release-15a-g5-a08`, so the shared checkout keeps its branch.

## Unit

| Unit | Marker | Tag / switch | Own checks | Tier | Branch | Build |
|---|---|---|---:|---|---|---|
| [A08 One Undo for Quick Taps](<../A08 — One Undo for Quick Taps/README.md>) | `PART H PHASE 15.1.31` | `QT15` / `QUICK_TAP_UNDO_ENABLED` | 21 | Behaviour | `claude/release-15a-a08` (the group tip) | `6d47849b…44b1`, 17,685,928 |

The records branch `claude/release-15a-g5` (the approval) sits under A08. A08 is registered in the removal chain after AE3. All of the group removed is the automatic-entries group as live: `99b76d62…15b8`, 17,675,311 bytes. A08 declares no change to another layer's tests.

## Evidence copied from the A12 branch

These records were made while A12 was still in the group and cover both units; the A08 parts apply here unchanged, because A08's build is the same (`6d47849b…44b1`).

- Code review (read-only, 14 November): [qa/code-review.md](qa/code-review.md). A08: no change needed, two low findings recorded (A08-1, A08-2); probe `qa/review-probe.cjs` and `qa/review-probe.json`.
- Preview on its deployed files (`qa/verify-preview.py`): A08 1,036/1,036 (`qa/preview-a08.log`, `qa/hosted-preview/claude-release-15a-a08/`).
- Device round: [DEVICE-CHECKS.md](DEVICE-CHECKS.md), mirroring the Claude Doc https://claude.ai/artifact/VwpvN5pYU7j8uZQ1YNDHVS. A08 checks 1–9 pass on iPhone and laptop; **A08 accepted**.
- Light checks on A08 (14 November, already on this branch): A08's touched layers 12/12 harnesses, 350/350 checks (`qa/light/a08-touched-run.log`).

## Qualification (behaviour tier)

Prepared on 18 November 2026 from the automatic-entries group's scripts with G5's constants; each script says so in its header.

- Predictions, made and pushed before any variant run: [qa/VARIANT-PINS.md](qa/VARIANT-PINS.md), `qa/variants.json` (one baseline and five mutations).
- Chain (`qa/qualify-before-full.py`, one chain, no re-run): group removal (`qa/test-removal-group.py`, 9 checks), the six variants (`qa/verify-variants.py`), dependencies (`qa/dependencies.py`), the 4× CPU screen (`qa/run-under-load.py`, 163 leaves).
- Two full passes, each first time (`qa/run-final-twice.py` → `qa/final-qa.py`): candidate **7,401** (A08 21 + the automatic-entries group's 7,380; 202 leaves, `qa/candidate-list.json`); retained, A08 removed (the automatic-entries group as live, less the 73 live-site checks) **7,307** (199 leaves, `qa/retained-list.json`).

Go-live only on the owner's word: fast-forward `main` to this branch's tip (no merge commit, no force), then production verification.
