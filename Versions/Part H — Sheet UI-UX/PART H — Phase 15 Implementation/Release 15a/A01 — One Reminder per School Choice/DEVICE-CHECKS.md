# A01 device checks — one reminder for each open School choice

**Candidate (A01):** [A01 preview](https://claude-release-15a-a01.l5r-character-sheet-creator.pages.dev/) — commit `13b0b961`, application `cffde624…0414`.
**Predecessor (accepted Release 8c):** [the live app](https://l5r-character-sheet-creator.pages.dev/) — application `139e0810…2551`.

Each check starts a new character from **Characters → New character** and ends with **Exit** on the wizard (nothing is saved unless you press Finish). On every step press **Next ›**; where it changes to **Leave for later ›**, press it once more. Only check 6 presses Finish.

| # | What to tap | Pass looks like | iPhone Safari | Laptop Edge | Comments |
|---|---|---|---|---|---|
| 1 | **Live app first (comparison).** Name anything → Crab → Kuni → Kuni Shugenja → Next through every step without choosing anything → Review. | A box at the top lists *Skills: Any one Weapon Skill* and three *Spells* lines; lower down, cards list the same things again. (This is the duplication A01 removes.) | Pass | Pass | |
| 2 | **A01 preview.** Same as check 1. | No box at the top. The cards *Kuni Shugenja: 1 free Skill choice still open* and *Kuni Shugenja: starting spells not all chosen* each name the open choices once. *40 XP unspent* is still there. | Pass | Pass | |
| 3 | **A01 preview.** Same Kuni, but on **Rings & Traits** raise Willpower, Void, Agility, Strength and Perception once each, then go to Review. Tap **Finish**, then **Stay**. | *Overspent by 30 XP* is the first card, then the two Kuni cards, no top box. Finish asks before finishing; **Stay** keeps you on Review with the same cards. Then tap **Exit**. | Pass | Pass | |
| 4 | **A01 preview.** Brotherhood of Shinsei → (no Family) → The Order of the Nameless Gift [Monk] → Next through every step → Review. | One card for the two free Skills, then two reminder cards straight after it: *Skills: The subject of your School's Lore* and *Kiho: 3 free Kiho picks*, each with "Still to choose. You can finish this on the sheet." Then *40 XP unspent*. No top box. | Pass | Pass | |
| 5 | **A01 preview.** From check 4, tap **‹ Back** to **Kiho**, add free Kiho until none are left, then Next to Review. | The Kiho reminder is gone; the Lore reminder and the free-Skill card remain. | Pass | Pass | Owner noted (screenshot `qa/device-pass/check5-duplicate-kiho-edge.png`): the wizard's Kiho step lets the same Kiho be added twice (Air Fist ×2). Not A01's code; recorded as follow-up FU-15a-1. |
| 6 | **A01 preview.** Lion → Matsu → Matsu Beastmaster [Bushi]; on **Skills** choose the Bugei Skill and tap Add; Next to Review. Tap **Finish**. Then **Manage → Identity → Character check**. | Review shows "Every choice your School leaves to you is made." at the top and no free-Skill card. After Finish the sheet opens normally; the character check works as before. (Delete this test character afterwards if you like.) | Pass | Pass | |

Not part of A01, so not tested here: anything outside the wizard's Review, A02's floating controls, and the three 8b.1 spacing follow-ups. Known, already in 8c and recorded as a follow-up: naming the monk's Lore subject in the wizard adds a *1 School Skill at Rank 0* warning.

## Owner's device pass, 4 November 2026

Run by the owner on the A01 preview (commit `13b0b961`, application `cffde624…0414`) and recorded in the published checklist ([Claude Doc](https://claude.ai/artifact/82ZApDN83j2vxtvXe3TqY8)): **12 of 12 Pass**, six checks on iPhone Safari and six on Laptop Edge. Decision on A01: **Accept**, given by the owner in chat on 4 November 2026 (also set in the checklist).

One comment, on check 5, outside A01's scope: the wizard's Kiho step offers a Kiho already taken, so the same Kiho can be added twice. The owner asks that a learnt Kiho leave the list as Skills already do, on the sheet as well as in the wizard, and that the same rule cover Kata and spells. The Kiho step belongs to Phase 11.2.2 (Part K) and the behaviour is in Release 8c, so A01 does not change it; it is recorded as follow-up **FU-15a-1** for the owner to schedule.

Nothing is merged or deployed until the owner gives the go-live word.
