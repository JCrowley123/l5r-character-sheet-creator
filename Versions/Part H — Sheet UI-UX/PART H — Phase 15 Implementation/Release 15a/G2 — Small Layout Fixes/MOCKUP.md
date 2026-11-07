# Release 15a · G2 — Small Layout Fixes · mock-ups, round 1

7 November 2026 (Claude). These are scratch prototypes on today's build (`2dcf6f20…6af6`): scratch CSS and DOM changes made in the browser, never in the tree. Nothing is built until the owner approves.

- **Scripts:** `qa/prototype.cjs`, which takes the shots into `qa/mockup/shots/`, and `qa/board.cjs`, which composes the boards in `qa/mockup/`.
- **Browser:** both ran on Edge (`PW_CHANNEL=msedge`), because the bundled Chromium crashes on this machine (see [REPRODUCE.md](REPRODUCE.md)).

| Board | Proposed | Open for the owner |
|---|---|---|
| [A05](qa/mockup/G2-A05-missing-limb.png) | Native select kept. Shared field label above it, field font and border, 44 px tall, note below with the helper gap. On the laptop, the note also moves below. | — |
| [A06](qa/mockup/G2-A06-grant-actions.png) | One group with a 10 px gap: **Add N koku** filled (primary), **Already added** outlined (secondary), both 44 px tall. "Not recorded yet" sits beside them. Once recorded, a ticked state line replaces the buttons. Zakyo and Wealthy's row (including Wealthy's Return / Keep). Guard, reversal and wording unchanged. | On a phone the state wraps under the buttons; on the laptop it sits beside them. Wealthy's picker is unchanged. |
| [A07](qa/mockup/G2-A07-moon-row.png) | "SEVERITY Medium — 5 points" + Change. The full-moon toggle on its own 44 px line, in body text, on the same left edge. Resist at 44 px. Wording, state, extra pip and rules unchanged. | — |
| [A11](qa/mockup/G2-A11-text-edges.png) | **Play:** the name and description drop their 10 px inner padding, so all card text starts on one edge, on every card. Manage keeps its editable boxes. **Insight / Spent XP:** a 6 px helper gap, where today they are pulled 4 px up on the laptop, and a 1.5 line height. | Whether the 2 px description gap on six Disadvantage cards joins A11. The other candidates from the whole-app read are proposed for later. |
| [A04.1](qa/mockup/G2-A04.1-pickers.png) · [long windows](qa/mockup/G2-A04.1-long-windows.png) | Rules shown inline in Paragon's option card for exactly the five pickers that still hide them: Seven Fortunes' Blessing ("▶ Rule"), Consumed, Failure of Bushido, Cursed by the Realm and Seven Fortunes' Curse (the per-option i). The rule text is word for word as today. The row's i is unchanged. | Window lengths on a phone (px, today → proposed): Blessing 801 → **1,369**, Cursed by the Realm 1,109 → 1,231, Curse 827 → 978, Failure of Bushido 811 → 855, Consumed 811 → 829. Touch of the Spirit Realms, inline today, is 976. |

## Round 2 (owner, 7 November)

- **A06 revised:** no tick once the koku is recorded. The recorded line is plain text. Its wording ("1.5 koku from Zakyo Toshi Citizen recorded on your Koku.") and the missing Add button already show that the koku was added. The board was re-shot as revision 2. Nothing else changed.
- **Owner idea, outside G2 (to record at G2's records step, like FT-59):** report every Advantage or Disadvantage still waiting on its picker ("Needs a choice") in the Identity tab's character check, the way missing free Skill choices are reported today.
  - Measured: the character check (Phase 5, Part J, `209.5-feat-character-validator.js`) has no such rule today.
  - It already takes rules registered from other phases, as Phase 11.2.3 (Part K) does. So this could be one new rule that asks the sheet's own "is this configuration complete" test, with no new machinery for the check itself.
  - Rough size: small, a unit of its own in a later group.

## Approved (owner, 7 November)

All five units are approved: A05, A06 revision 2, A07, A11 and A04.1, as the boards show them. **A11 also closes the 2 px gap** under the row controls on the six Disadvantage cards (Missing Limb, Lost Love, Contrary, Rumormonger, Soft-Hearted, Blissful Betrothal), using the same 6 px helper gap. The other candidates from the whole-app read are left for later.

## Usage (Claude, account-wide, five-hour / weekly)

| When (UTC) | Five-hour | Weekly | Point |
|---|---|---|---|
| 7 Nov 14:05 | 22% | 84% | G2 start |
| 7 Nov 14:26 | 32% | 86% | end of step 1 |
| 7 Nov 15:05 | 39% | 86% | mock-ups sent (round 1) |
