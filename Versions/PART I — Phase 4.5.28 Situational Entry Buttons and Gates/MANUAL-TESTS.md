# Situational Entry Buttons and Gates — owner checks

About 10–15 minutes on Windows or the iPhone. Each check is Pass, Fail or Not run; add a note for
anything odd. A Windows result is never recorded as an iPhone result, so note which device you used.
The published checklist is the [Situational Entry Buttons and Gates — Test Checklist](https://claude.ai/code/artifact/bd563c7b-96c9-40f9-a76f-4672aa92026e), a Claude Doc
with a Pass / Fail / Not run choice per check; walked through the real controls on the live site on 7 October: 22/22.

Reading the roll preview: the pool at the top (for example **5k3**) is dice rolled k dice kept;
**+1k1** adds one rolled and one kept (5k3 becomes 6k4).

## Before you start

1. Open the live app and refresh it so the new version loads: Ctrl+F5 on Windows; on the iPhone,
   close the tab and open it again.
2. On the Characters list, use **Save As a copy** of an existing character (or **Create New
   Character**) and open the copy.
3. Tap **Manage** beside the character's name, so you can add Advantages and Skills. Tap **Done**
   only when a step says so.
4. Add an Advantage from the Advantages & Disadvantages tab's **choose an advantage to add** list.
   Add a Skill from the Skills tab's **Add from Skill List**, then set its Rank. Honor and Status are
   on the Identity tab: each has a Rank and a Points box; the Points box is the one that counts here.

## Test 1 — Wary's Spot ambush button

Add **Wary**. Add the Skill **Investigation** at Rank 2 (its Trait is Perception).

| # | Check | Expected |
|---|---|---|
| 1.1 | Wary's row | A **Spot ambush** button under the name |
| 1.2 | Tap **Spot ambush** | The preview lists **Wary +1k1** as already applied (no tick box), and the pool is 1k1 more than an ordinary Investigation roll |
| 1.3 | Roll | The result is titled "Spot ambush — Investigation (Notice) / Perception" and lists Wary; one more die rolled and kept |
| 1.4 | Tap **Spot ambush** again | Wary is applied again, still with no tick box |
| 1.5 | Roll Investigation with its 🎲 on the Skills tab | Wary is **not** offered: an ordinary Investigation roll |
| 1.6 | Fringe: give Investigation the **Notice** Emphasis, then Spot ambush and roll | After the roll, the usual re-roll of 1s for the Emphasis is offered |

## Test 2 — Precise Memory's Recall button

Add **Precise Memory**.

| # | Check | Expected |
|---|---|---|
| 2.1 | Precise Memory's row | A **Recall** button under the name |
| 2.2 | Tap **Recall** | The preview lists **Precise Memory +1k1** as already applied (no tick box); the pool is your Intelligence + 1k1 |
| 2.3 | Roll | The result lists Precise Memory; one more die rolled and kept |
| 2.4 | On Rings & Traits, tap **Intelligence** | Precise Memory is **not** offered or applied: an ordinary Intelligence roll |

## Test 3 — Imperial Scribe needs Status 2+ and Calligraphy 4+

| # | Check | Expected |
|---|---|---|
| 3.1 | With Status below 2.0, open the Advantage list | **Imperial Scribe** is greyed out, reading "— needs Status 2+ and Calligraphy 4+" |
| 3.2 | Set Status Points to 2.0 and add **Calligraphy** at Rank 4; open the list again | Imperial Scribe can be chosen; add it |
| 3.3 | Roll Calligraphy with its 🎲 | The "Imperial Scribe — Free Raise available" line shows, as before |
| 3.4 | Set Calligraphy to Rank 3 | Imperial Scribe's row says "Not in effect: needs Calligraphy Rank 4+ (yours 3). Its +1k0 and Free Raise are not offered until then." Its XP is unchanged |
| 3.5 | Roll Calligraphy, then roll **Courtier** (add it if needed) | No Free Raise line; Imperial Scribe is not offered on Courtier |
| 3.6 | Set Calligraphy back to Rank 4 | The note goes, and both come back |

## Test 4 — Sacrosanct needs Honor 6.0+

| # | Check | Expected |
|---|---|---|
| 4.1 | With Honor Points below 6.0, open the Advantage list | **Sacrosanct** is greyed out, reading "— needs Honor 6.0+" |
| 4.2 | Set Honor Points to 6.0; open the list again | Sacrosanct can be chosen |

## Test 5 — Play mode

| # | Check | Expected |
|---|---|---|
| 5.1 | Tap **Done** (Play mode) | The Spot ambush and Recall buttons are still there |
| 5.2 | Tap each | Each opens its roll as in Tests 1 and 2 |

## Test 6 — Layout on a phone (iPhone)

| # | Check | Expected |
|---|---|---|
| 6.1 | iPhone, portrait: the Advantages tab with Wary, Precise Memory and an unqualified Imperial Scribe | Buttons and the note sit inside each Advantage's card; no text cut off or off the screen |
| 6.2 | iPhone, landscape | The same |

## Optional, still owed from earlier phases

Phase 0.7's seven Android checks stay Not run until you have an Android phone; they are listed in
the build ledger. The iPhone layout checks for the dice entries (4.5.26) and Phase 4.7 also remain
open and non-blocking.
