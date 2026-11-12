# Release 15a G3 — Spell Rows — handover

12 November 2026 (Claude). **Accepted, qualified and live.**

**12 November 2026 · G3 qualified (Claude).** Release 15a G3, the three spell-row follow-ups, is accepted and qualified. 8b.1-UI-01 (the starting-spell review as option cards with live counts and one action bar), 8b.1-UI-02 (a readable spell name and one School tag) and 8b.1-UI-03 revision 2 (the remove button in its own corner on every Technique, Advantage and Disadvantage card, and a 52 px number box) are on `claude/release-15a-ui03`. Application `6c555d29b35ca5f550274163cc73f9b6b47a11f3065cfbc4d2ac9bdaab38c029`, 17,631,957 bytes. The owner approved Claude's mock-ups on 11 November, passed 34/34 device checks (UI-01 and UI-02 Accept, UI-03 Revise), then 12/12 on revision 2 (Accept).

Negative variants: predictions committed before discovery; 13 of 15 matched at once, and the two differences were a harness that switched its own unit back on (fixed in all three harnesses, same ids and counts, declared) and a masked mutation (replaced); a second discovery of the four affected cases matched exactly. The chain passed first time: group removal 21/21 (all of G3 removed restores G2 `77936023…82f0` exactly), all 15 variants on their exact pins, dependencies 3/3. One full pass, first execution: candidate **7,242/7,242** and retained **7,075/7,075** (24.05 and 21.68 minutes). Screen-only tier; no 4× CPU screen. [G3 handover](<Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/G3 — Spell Rows/HANDOVER.md>).

## Units

| Unit | Marker | Tag / switch | Own checks | Branch |
|---|---|---|---:|---|
| 8b.1-UI-01 Starting-spell review | `PART H PHASE 15.1.21` | `SR15` / `SPELL_REVIEW_LAYOUT_ENABLED` | 32 | `claude/release-15a-ui01` |
| 8b.1-UI-02 Readable spell name and School tag | `PART H PHASE 15.1.22` | `SN15` / `SPELL_NAME_LINE_ENABLED` | 28 | `claude/release-15a-ui02` |
| 8b.1-UI-03 Remove apart from Memorised, revision 2 | `PART H PHASE 15.1.23` | `SX15` / `SPELL_REMOVE_CORNER_ENABLED` | 34 | `claude/release-15a-ui03` (the group tip) |

Each unit's folder has its README (what changed, builds, light checks, the record of every failure found and fixed), ROLLBACK, harness with pinned ids, remover and removal proof. All three are registered in the removal chain after A04.1.

## Where the evidence is

- Approvals: [MOCKUP.md](MOCKUP.md) (the owner's "Approve all three", 11 November) and [OWNER-COMMENTS-2026-11-11.md](OWNER-COMMENTS-2026-11-11.md) (the device-round comments, the Shugenja book check, revision 2's approval).
- Device checks: [DEVICE-CHECKS.md](DEVICE-CHECKS.md), mirroring the Claude Doc. Previews: [PREVIEWS.md](PREVIEWS.md). Code review: [qa/code-review.md](qa/code-review.md).
- Qualification: [qa/VARIANT-PINS.md](qa/VARIANT-PINS.md) (predictions, both discoveries and the two corrections), `qa/qualification-6c555d29.json` and its three logs, `qa/final-run-1/summary.json`.
- Counts: candidate G2 7,148 + 32 + 28 + 34 = 7,242 (194 leaves); retained, G3 removed, 146 + 6,929 = 7,075 (189 leaves), excluding the same 73 live-site checks as before.

## Next, as agreed with the owner

**12 November 2026 · after G3 (Claude).** Agreed with the owner, in this order: (1) G3 go-live; (2) a small group for automatic entries, mock-up first: a one-line fix for Yogo Wardmaster's missing Sense (a book check found 20 of 21 Shugenja Schools right), the School's given spells credited on import without a review click and said in the character check, and no XP box or remove button on School, Path and Advanced School Techniques (Kata, Kiho and chosen entries keep both); (3) the gold focus ring after a dialog closes, with G4. [G3 handover](<Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/G3 — Spell Rows/HANDOVER.md>).

## Usage

Claude readings on a Pro plan: the review session started at 0% weekly (11 November); the five-hour limit was reached once during the build. At the start of the full pass on 12 November the weekly meter read 50% (all models) and 84% (Fable). See [qa/USAGE.md](qa/USAGE.md).

## Production

**12 November 2026 · G3 live (Claude).** On the owner's instruction ("happy with moving onto qualifying and go live"), `main` was fast-forwarded to `7d3bb4c3` without a merge commit or force. Production: all seven deployed files match the qualified build; 62 application harnesses passed 2,669/2,669 on the downloaded production files; browser/offline smoke 22/22. Deployed page `4a7dc1d02df360ce2cfc26d8c580bd19deaaef9a74d98182f0fd63055f3cf524` (17,638,734 bytes), service-worker build `2dd41ff32a1df137`. [G3 handover](<Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/G3 — Spell Rows/HANDOVER.md>).

Evidence: [qa/live/live-verification.json](qa/live/live-verification.json), [qa/live/live-qa.log](qa/live/live-qa.log), [qa/live/live-browser-smoke.json](qa/live/live-browser-smoke.json).
