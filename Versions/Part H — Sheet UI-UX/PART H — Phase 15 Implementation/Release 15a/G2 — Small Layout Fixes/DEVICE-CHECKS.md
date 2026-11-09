# G2 device checks — mirror

**The owner's checklist** is the Claude Doc [G2 device checks — small layout fixes](https://claude.ai/artifact/BAwpwquinGZwBXbuuVDehR). It has Pass/Fail for iPhone Safari and Laptop Edge, and a decision per unit. This file mirrors its results as plain text.

**Results:**
- Checks: 18 rows × 2 devices = **36/36 Pass**, filled in by the owner on 7 November 2026.
- Decisions:
  - A05, A07, A11 Accept and A04.1 Revise were marked in the doc by the owner.
  - A06 Accept was given in chat and recorded in the doc by Claude, on the owner's word quoted below.
    > I am also happy for you to record Accept for A05, A06, A07 and A11, and Revise for A04.1 (now fixed)

| Unit | Preview | Compared with | Checks | iPhone Safari | Laptop Edge | Decision |
|---|---|---|---|---|---|---|
| A05 Missing Limb's picker | claude-release-15a-a05 | live app (G1) | 1–4 | 4 Pass | 4 Pass | Accept |
| A06 Grant actions and their state | claude-release-15a-a06 | A05 preview | 5–7 | 3 Pass | 3 Pass | Accept |
| A07 The Moon row | claude-release-15a-a07 | A06 preview | 8–10 | 3 Pass | 3 Pass | Accept |
| A11 Text gaps and one left edge | claude-release-15a-a11 | A07 preview | 11–14 | 4 Pass | 4 Pass | Accept |
| A04.1 Each rule inline in pickers | claude-release-15a-a04-1 | A11 preview | 15–18 | 4 Pass | 4 Pass | Revise → revision 1 device re-check passed 8 Nov |

**A04.1 revision 1.** The owner saw a box inside a box on Seven Fortunes' Blessing's options, and it is fixed:

- Each option is now one card. Ten ONE-BOX checks pin it.
- The new build is `77936023…82f0`. Its preview passed 2,523/2,523 on the deployed files.
- Re-checked by the owner on 8 November 2026: check 15 **Passed on both devices** (iPhone Safari and Laptop Edge), confirmed in the Codex qualification chat. The revision device gate is cleared.

**The owner's further comments** on the rows after choosing are recorded as A04.2, parked until after the rules read pass. They cover the badge, Change, the i, a summary, and the badge style. The owner's decisions are in [MOCKUP.md](MOCKUP.md).
