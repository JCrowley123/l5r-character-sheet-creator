# Release 15a · group G6 (A19, A20, A19.1) — handover

19 November 2026 (Claude). **Accepted, qualified and live** (19 November). G6 is the last group of Release 15a.

**19 November 2026 · G6 qualified (Claude).** G6 is three units on stacked branches:

- A19 (Undo the Last Void Spend), as revision 1.
- A20 (A Trait for One Skill Roll).
- A19.1 (The Damage Row Fits a Phone), added after the first device round.

The group tip is `claude/release-15a-a19-1`, with the records branch `claude/release-15a-g6` under A19. Application `921f3ac9e5c61bde84068a20dd5cc4ab014367e8b1b7930438cf24b4a7686150`, 17,718,601 bytes.

**Approvals and acceptance.**

- The owner approved the A19 and A20 mock-ups as shown ("Approve as shown", "Book Traits first"; [MOCKUP.md](MOCKUP.md)).
- First device round: A20 accepted; A19 revise. Check 8 failed: Touch of the Void's own Willpower save ended Undo.
- The owner chose "Keep Undo" (A19 revision 1) and "New unit A19.1 in G6" (the damage row on a phone). The A19.1 mock-up was approved as shown ([MOCKUP-A19.1.md](MOCKUP-A19.1.md)).
- Second round: all five checks passed on iPhone and laptop, and the owner accepted A19 revision 1 and A19.1. The owner, verbatim: "I have now done the tests they all pass I am happy for this to move to the go live".

**The qualification passed every stage first time.**

- **Variants.** Three baselines and six mutations were predicted and pushed before any variant run (`30067683`). Discovery matched all nine pins first time.
- **The chain** ran once (12:49 to 14:12 UTC):
  - group removal **16/16**: all three units removed restores G5 (A08) as live exactly, `6d47849b…44b1`, 17,685,928 bytes. A19 and A20 were each removed alone, and A08 removed with the group kept, with every kept harness run in full.
  - all **9** variants on their pins.
  - dependencies **3/3**.
  - the 4× CPU screen, **170/170 leaves**.
- **Two full passes** followed (14:13 to 16:04 UTC), each on its first execution:
  - candidate **7,453/7,453** and retained **7,328/7,328** in both runs.
  - run 1 took 29.10 and 26.10 minutes; run 2 took 29.15 and 25.89 minutes.
  - both runs restored A08 as live exactly.

## Units

| Unit | Marker | Tag / switch | Own checks | Tier | Branch |
|---|---|---|---:|---|---|
| A19 Undo the Last Void Spend (revision 1) | `PART H PHASE 15.1.33` | `VU15` / `VOID_SPEND_UNDO_ENABLED` | 25 | Behaviour | `claude/release-15a-a19` |
| A20 A Trait for One Skill Roll | `PART H PHASE 15.1.34` | `TC15` / `SKILL_TRAIT_CHOICE_ENABLED` | 18 | Behaviour | `claude/release-15a-a20` (on A19) |
| A19.1 The Damage Row Fits a Phone | `PART H PHASE 15.1.35` | `DR15` / `DAMAGE_ROW_FIT_ENABLED` | 9 | Screen only (qualified with the group) | `claude/release-15a-a19-1` (on A20; the group tip) |

What each does:

- **A19.** After a Void Point is spent on the Combat page's Void card, one line under the card offers Undo. Undo puts back exactly what that spend changed, once: the points, the armed one-roll effect, the Round's Void spend and +10 TN, the skirmish Initiative flag, and the Wounds a damage reduction added. It drops a Touch of the Void roll still waiting for that spend. The next roll, the next Round, a reset or another spend ends the offer. Touch of the Void's own save does not end it (revision 1). If that save was already made, Undo says it no longer counts.
- **A20.** On a Skill roll whose book allows another Trait, the roll preview's Trait row becomes a drop-down for that one roll. The dice follow the chosen Trait, and the saved character is unchanged. The book-named Traits, with pages, are in A20's README; the rules are in our own words.
- **A19.1.** On a phone, the damage-reduction row wraps inside the Void card: the label and amount first, then Apply and Cancel stacked full width. On a laptop the row stays on one line.

Each unit's folder has its README, ROLLBACK, harness with pinned ids, remover and removal proof. All three are registered in the removal chain after A08. A20 adds guarded hook blocks to the roll preview (`208`) and the roll pipeline (`130`); its remover takes them out byte-exact. No unit changes another layer's tests.

## Where the evidence is

- **Approvals:** [MOCKUP.md](MOCKUP.md) and [MOCKUP-A19.1.md](MOCKUP-A19.1.md); how today was reproduced: [REPRODUCTION.md](REPRODUCTION.md).
- **Code review:** [qa/code-review.md](qa/code-review.md).
- **Previews on their deployed files:**
  - A19 revision 1: 2,532/2,532.
  - A20 on it: 2,550/2,550.
  - A19.1: 2,559/2,559.
  - Results in `qa/hosted-preview/`.
- **Device rounds:** [DEVICE-CHECKS.md](DEVICE-CHECKS.md), mirroring the Claude Doc https://claude.ai/artifact/3XbGrSnc5z1T9uM2KUwtbz.
- **Light checks (each unit's README):**
  - A19 revision 1: touched layers 26/26 (1,226 checks).
  - A20: touched layers 33/33 (1,606 checks).
  - A19.1: touched layers 10/10 (284 checks).
- **Qualification:**
  - predictions and discovery: [qa/VARIANT-PINS.md](qa/VARIANT-PINS.md), `qa/variants.json`, `qa/variants-discover-921f3ac9/`.
  - the chain: `qa/qualification-921f3ac9.json` with its four stage logs, `qa/negative-921f3ac9/`, `qa/under-load-final-921f3ac9/`.
  - the full passes: `qa/final-run-1/summary.json`, `qa/final-run-2/summary.json`, `qa/full-launch.log`.
- **Counts:**
  - candidate = G5's 7,401 + A19's 25 + A20's 18 + A19.1's 9 = 7,453 (205 leaves).
  - retained, with G6 removed (A08 as live) = A08's 21 + G5's retained 7,307 = 7,328 (200 leaves). It excludes the same live-site checks as before.

## Environment notes

- Built and qualified in the worktree `C:/Users/jcrow/l5r-release-15a-g6`, so the shared checkout kept its branch.
- Every QA run used mains power and the project's own Playwright browsers (`l5r-qa-tools`).

## Next

Release 15a is complete with G6. Release 15b, the resistance phase and the Techniques phase follow; none is started here.

## Production

**19 November 2026 · G6 live (Claude).** On the owner's word ("I have now done the tests they all pass I am happy for this to move to the go live"), `main` was fast-forwarded from `1ebf26b4` to `c359fa3a` at 16:06 UTC, with no merge commit and no force. The deploy was current about four minutes later.

Production checks:

- **Files:** all seven deployed files match the qualified build.
  - Deployed page `d3bec9e6c11bab70…`, 17,725,378 bytes.
  - Application `921f3ac9…6150`.
  - Service worker build `2d60065ab4f57fea`.
- **Harnesses:** 118 application harnesses passed **4,930/4,930** on the downloaded production files.
  - A03's 23 always run, plus each unit's own harness and the layers it touches, each counted once.
  - G6 adds A19's 25, A20's 18 and A19.1's 9 checks, and the layers of their light checks: the roll pipeline and preview, the declaration registry and its providers, the dice, situational and automatic entries, the Void card and Initiative, the wound bar and Play Mode Combat.
- **Browser/offline smoke:** **22/22**.

Evidence: [qa/live/live-verification.json](qa/live/live-verification.json), [qa/live/live-qa.log](qa/live/live-qa.log), [qa/live/live-browser-smoke.json](qa/live/live-browser-smoke.json), `qa/verify-live.log`, `qa/browser-smoke.log`. The checks ran on the downloaded production files with `qa/verify-live.py` (G5's script with A19, A20 and A19.1 added) and the Older School Choices browser smoke.
